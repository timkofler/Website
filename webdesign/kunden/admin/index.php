<?php
// Tim Kofler – Kundenportal, Admin-Bereich: Kunden anlegen, Zugänge verwalten, Uploads ansehen und herunterladen,
// dazu alle Anfragen (Formular, Rückruf, Gratis-Entwurf, Verein) mit Status, Werbekosten pro Quelle und der anonyme Besucherzähler. Anmeldung mit Passwort und, wenn eingerichtet,
// einem zweiten Faktor (Code aus der Authenticator-App oder Notfall-Code).

declare(strict_types=1);

require __DIR__ . '/../../api/kunden-lib.php';
require __DIR__ . '/../../api/entwurf-lib.php';
require __DIR__ . '/../../api/anfrage-lib.php';
require __DIR__ . '/../../api/admin-2fa-lib.php';
require __DIR__ . '/../../api/zaehler-lib.php';
require __DIR__ . '/../../api/chat-lib.php';
require __DIR__ . '/../../api/bericht-lib.php';
require __DIR__ . '/../../api/push-lib.php';
require __DIR__ . '/../../api/ansicht-lib.php';
require __DIR__ . '/../../api/bewertung-lib.php';

kp_headers();
kp_session();

const KP_ADMIN = '/kunden/admin/';
// Auftrag eines Kunden (nur für Tim, der Kunde sieht davon nichts). Rechnungen selbst liegen im Büro-Dashboard.
const AD_PAKETE = ['' => '– noch offen –', 'referenz' => 'Referenzkunde (290 €)', 'start' => 'Start (590 €)', 'business' => 'Business (1.190 €)',
    'verein' => 'Vereinsseite (gratis)', 'app' => 'Web-App (nach Aufwand)', 'shop' => 'Shop (nach Aufwand)', 'sonstiges' => 'Sonstiges'];
const AD_RECHNUNG = ['keine' => 'Noch keine Rechnung', 'offen' => 'Rechnung offen', 'bezahlt' => 'Bezahlt'];

$hash = (string) (cx_config()['admin_password_hash'] ?? '');
// Die Anmeldung gilt nur für den Admin-Hash, mit dem sie gemacht wurde (neues Passwort in der config.php meldet alle ab).
$isAdmin = $hash !== '' && is_string($_SESSION['admin'] ?? null) && hash_equals(kp_pw_tag($hash), $_SESSION['admin']);
$k = (string) ($_GET['k'] ?? '');
$k = kp_valid_user($k) ? $k : '';
$ew = (string) ($_GET['entwurf'] ?? '');
$ew = ew_valid_id($ew) ? $ew : '';
$af = (string) ($_GET['anfrage'] ?? '');
$af = ew_valid_id($af) ? $af : '';
$sicherheit = $isAdmin && isset($_GET['sicherheit']);
// Passwort war richtig, der Code aus der App fehlt noch (zweiter Schritt der Anmeldung).
$pwOk = (int) ($_SESSION['admin_pw'] ?? 0);
$codeStep = !$isAdmin && $hash !== '' && $pwOk > 0 && time() - $pwOk <= TF_STEP_TTL;

// ---------------- Herunterladen und Vorschau (nur angemeldet) ----------------
if ($isAdmin && $k !== '' && isset($_GET['e']) && is_string($_GET['e']) && kp_valid_batch($_GET['e'])) {
    $dir = kp_user_dir($k) . '/' . $_GET['e'];
    $batch = kp_read_json($dir . '/eingang.json');
    if (!$batch) {
        http_response_code(404);
        exit('Nicht gefunden.');
    }
    if (isset($_GET['zip'])) {
        if (!class_exists('ZipArchive')) {
            exit('ZIP ist auf diesem Server nicht verfügbar. Bitte die Dateien einzeln laden.');
        }
        $tmp = tempnam(sys_get_temp_dir(), 'kp');
        $zip = new ZipArchive();
        $zip->open($tmp, ZipArchive::OVERWRITE);
        foreach ((array) $batch['dateien'] as $d) {
            $zip->addFile($dir . '/' . $d['datei'], (string) $d['datei']);
        }
        $zip->close();
        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="' . $k . '-' . $_GET['e'] . '.zip"');
        header('Content-Length: ' . filesize($tmp));
        header('X-Content-Type-Options: nosniff');
        readfile($tmp);
        @unlink($tmp);
        exit;
    }
    $f = (string) ($_GET['f'] ?? '');
    $names = array_column((array) $batch['dateien'], 'datei');
    if (!in_array($f, $names, true) || !is_file($dir . '/' . $f)) {
        http_response_code(404);
        exit('Nicht gefunden.');
    }
    $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
    header('X-Content-Type-Options: nosniff');
    header("Content-Security-Policy: default-src 'none'; sandbox");
    if (isset($_GET['vorschau']) && isset(KP_PREVIEW[$ext])) {
        header('Content-Type: ' . KP_PREVIEW[$ext]);
        header('Cache-Control: private, max-age=600');
    } else {
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . $f . '"');
    }
    header('Content-Length: ' . filesize($dir . '/' . $f));
    readfile($dir . '/' . $f);
    exit;
}

// ---------------- Aktionen ----------------
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    if (!kp_post_ok()) {
        kp_flash(false, 'Die Seite war zu lange offen. Bitte noch einmal versuchen.');
        kp_redirect(KP_ADMIN);
    }
    $action = cx_field('aktion', 20);

    // Einrichtung: erzeugt nur den Hash zum Eintragen in die config.php, es wird nichts gespeichert.
    if ($action === 'hash' && $hash === '') {
        $p = (string) ($_POST['passwort'] ?? '');
        if (strlen($p) < 12) {
            kp_flash(false, 'Bitte mindestens 12 Zeichen verwenden.');
        } elseif ($p !== (string) ($_POST['passwort2'] ?? '')) {
            kp_flash(false, 'Die beiden Passwörter sind nicht gleich.');
        } else {
            $_SESSION['neuer_hash'] = password_hash($p, PASSWORD_DEFAULT);
        }
        kp_redirect(KP_ADMIN);
    }

    if ($action === 'anmelden' && $hash !== '') {
        $keys = ['ip:' . kp_ip_hash(), 'admin'];
        if (!kp_try($keys)) {
            kp_flash(false, 'Zu viele Fehlversuche. Bitte 15 Minuten warten.');
        } elseif (!password_verify((string) ($_POST['passwort'] ?? ''), $hash)) {
            kp_fail_wait();
            kp_flash(false, 'Das Passwort stimmt nicht.');
        } elseif (tf_active()) {
            // Der Code-Schritt zählt seine Versuche selbst mit.
            kp_untry($keys);
            session_regenerate_id(true);
            $_SESSION['admin_pw'] = time();
        } else {
            kp_untry($keys);
            session_regenerate_id(true);
            $_SESSION['admin'] = kp_pw_tag($hash);
        }
        kp_redirect(KP_ADMIN . ($k !== '' ? '?k=' . $k : ''));
    }

    if ($action === 'code' && $hash !== '') {
        $keys = ['ip:' . kp_ip_hash(), 'admin'];
        if (!$codeStep) {
            unset($_SESSION['admin_pw']);
            kp_flash(false, 'Das hat zu lange gedauert. Bitte melde dich noch einmal mit dem Passwort an.');
        } elseif (!kp_try($keys)) {
            kp_flash(false, 'Zu viele Fehlversuche. Bitte 15 Minuten warten.');
        } else {
            $input = trim((string) ($_POST['code'] ?? ''));
            $art = tf_active() ? tf_check($input) : 'aus';
            if ($art === '') {
                kp_fail_wait();
                kp_flash(false, $input !== '' && preg_match('/[a-z]/i', $input) ? 'Dieser Notfall-Code stimmt nicht oder wurde schon verwendet.' : 'Der Code stimmt nicht. Bitte den aktuellen Code aus der App eingeben.');
            } else {
                kp_untry($keys);
                unset($_SESSION['admin_pw']);
                session_regenerate_id(true);
                $_SESSION['admin'] = kp_pw_tag($hash);
                if ($art === 'notfall') {
                    $left = tf_backups_left();
                    kp_flash($left > 2, 'Angemeldet mit einem Notfall-Code. Dieser Code ist jetzt verbraucht, ' . ($left === 1 ? 'einer ist' : $left . ' sind') . ' noch übrig.'
                        . ($left <= 2 ? ' Bitte unter „Sicherheit“ neue Notfall-Codes erzeugen.' : ''));
                }
            }
        }
        kp_redirect(KP_ADMIN . ($k !== '' ? '?k=' . $k : ''));
    }

    if ($action === 'zurueck') {
        unset($_SESSION['admin_pw']);
        kp_redirect(KP_ADMIN);
    }

    if (!$isAdmin) {
        kp_redirect(KP_ADMIN);
    }

    if ($action === 'abmelden') {
        $_SESSION = [];
        session_regenerate_id(true);
        kp_redirect(KP_ADMIN);
    }

    // Zwei-Faktor-Anmeldung einschalten, Notfall-Codes erneuern, ausschalten
    if ($action === 'tf_ein' || $action === 'tf_neu' || $action === 'tf_aus') {
        $back = KP_ADMIN . '?sicherheit';
        $input = (string) ($_POST['code'] ?? '');
        if ($action === 'tf_ein') {
            $secret = (string) ($_SESSION['tf_neu'] ?? '');
            $step = tf_active() ? null : tf_match($secret, $input);
            if ($step === null) {
                kp_flash(false, 'Der Code stimmt nicht. Bitte den 6-stelligen Code eingeben, der gerade in der App steht.');
            } else {
                $codes = tf_new_backups();
                if (tf_enable($secret, $step, $codes)) {
                    unset($_SESSION['tf_neu']);
                    $_SESSION['tf_codes'] = $codes;
                    kp_flash(true, 'Die Zwei-Faktor-Anmeldung ist eingeschaltet. Ab jetzt fragt die Anmeldung nach dem Passwort zusätzlich den Code aus der App ab.');
                } else {
                    kp_flash(false, 'Konnte nicht gespeichert werden (Schreibrechte im Ordner api/_data prüfen).');
                }
            }
            kp_redirect($back);
        }
        // Erneuern und Ausschalten nur mit einem aktuellen Code, damit eine offen gelassene Sitzung allein nicht reicht.
        $keys = ['ip:' . kp_ip_hash(), 'admin'];
        if ($action === 'tf_aus' && cx_field('sicher', 5) !== 'ja') {
            kp_flash(false, 'Zum Ausschalten bitte das Häkchen setzen.');
        } elseif (!kp_try($keys)) {
            kp_flash(false, 'Zu viele Fehlversuche. Bitte 15 Minuten warten.');
        } elseif (tf_check($input, false) !== 'app') {
            kp_fail_wait();
            kp_flash(false, 'Der Code stimmt nicht. Bitte den aktuellen Code aus der App eingeben.');
        } elseif ($action === 'tf_aus') {
            kp_untry($keys);
            tf_disable();
            kp_flash(true, 'Die Zwei-Faktor-Anmeldung ist ausgeschaltet. Du kannst den Eintrag in der App jetzt löschen.');
        } else {
            kp_untry($keys);
            $d = tf_state();
            $codes = tf_new_backups();
            $d['notfall'] = tf_hash_backups($codes);
            tf_save($d);
            $_SESSION['tf_codes'] = $codes;
            kp_flash(true, 'Neue Notfall-Codes erzeugt. Die alten gelten ab sofort nicht mehr.');
        }
        kp_redirect($back);
    }

    // Besucherzähler: dieses Gerät mitzählen oder nicht. Das Cookie geht nur an den Zähler-Endpunkt
    // und an den Admin (damit er den Stand anzeigen kann), ein Jahr gültig.
    if ($action === 'zaehlen') {
        $aus = cx_field('wert', 5) === 'aus';
        foreach (['/api/zaehler.php', KP_ADMIN] as $path) {
            setcookie(ZL_NOCOUNT, '1', ['expires' => $aus ? time() + 365 * 86400 : 1, 'path' => $path, 'secure' => true, 'httponly' => true, 'samesite' => 'Strict']);
        }
        kp_flash(true, $aus ? 'Dieses Gerät wird ab jetzt nicht mehr mitgezählt.' : 'Dieses Gerät wird wieder mitgezählt.');
        kp_redirect(KP_ADMIN . '?zeit=' . (int) ($_GET['zeit'] ?? 30) . '#besucher');
    }

    // Gratis-Entwurf: Status setzen oder Anfrage löschen
    if ($action === 'ew_status' || $action === 'ew_loeschen') {
        $d = ew_read($ew);
        if (!$d) {
            kp_redirect(KP_ADMIN . '#anfragen');
        }
        if ($action === 'ew_loeschen') {
            if (cx_field('sicher', 5) === 'ja') {
                an_delete((string) ($d['ansicht'] ?? ''));
                ew_delete($ew);
                kp_flash(true, 'Anfrage von „' . $d['firma'] . '“ gelöscht.');
                kp_redirect(KP_ADMIN . '#anfragen');
            }
            kp_flash(false, 'Zum Löschen bitte das Häkchen setzen.');
        } else {
            $st = cx_field('status', 20);
            if (isset(EW_STATUS[$st])) {
                $d['status'] = $st;
                $d['geaendert'] = date('c');
                $d['notiz'] = kp_text('notiz', 2000);
                $d['nachfassen'] = ad_datum(cx_field('nachfassen', 10));
                ew_write($ew, $d);
                kp_flash(true, 'Gespeichert.');
            }
        }
        kp_redirect(KP_ADMIN . '?entwurf=' . $ew);
    }

    // Anfrage (Formular, Rückruf, Verein, Gründer): Status setzen oder löschen
    if ($action === 'af_status' || $action === 'af_loeschen') {
        $d = af_read($af);
        if (!$d) {
            kp_redirect(KP_ADMIN . '#anfragen');
        }
        if ($action === 'af_loeschen') {
            if (cx_field('sicher', 5) === 'ja') {
                an_delete((string) ($d['ansicht'] ?? ''));
                af_delete($af);
                kp_flash(true, 'Anfrage von „' . ($d['firma'] ?: $d['name']) . '“ gelöscht.');
                kp_redirect(KP_ADMIN . '#anfragen');
            }
            kp_flash(false, 'Zum Löschen bitte das Häkchen setzen.');
        } else {
            $st = cx_field('status', 20);
            if (isset(AF_STATUS[$st])) {
                $d['status'] = $st;
                $d['geaendert'] = date('c');
                $d['notiz'] = kp_text('notiz', 2000);
                $d['nachfassen'] = ad_datum(cx_field('nachfassen', 10));
                af_write($af, $d);
                kp_flash(true, 'Gespeichert.');
            }
        }
        kp_redirect(KP_ADMIN . '?anfrage=' . $af);
    }

    // Entwurf-Link zu einer Anfrage: anlegen, Bilder dazu, Text, einzelnes Bild weg, ganz löschen
    if (in_array($action, ['an_bilder', 'an_text', 'an_bild_weg', 'an_loeschen'], true) && ($ew !== '' || $af !== '')) {
        $back = KP_ADMIN . ($ew !== '' ? '?entwurf=' . $ew : '?anfrage=' . $af) . '#ansicht';
        $d = $ew !== '' ? ew_read($ew) : af_read($af);
        if (!$d) {
            kp_redirect(KP_ADMIN . '#anfragen');
        }
        $save = static fn(array $d) => $ew !== '' ? ew_write($ew, $d) : af_write($af, $d);
        $tok = (string) ($d['ansicht'] ?? '');
        if ($action === 'an_loeschen') {
            an_delete($tok);
            unset($d['ansicht']);
            $save($d);
            kp_flash(true, 'Entwurf-Link gelöscht. Der Link funktioniert ab sofort nicht mehr.');
            kp_redirect($back);
        }
        if (!an_read($tok)) {
            $tok = an_create(($ew !== '' ? 'entwurf:' . $ew : 'anfrage:' . $af), (string) (($d['firma'] ?? '') !== '' ? $d['firma'] : ($d['name'] ?? '')));
            if ($tok === '') {
                kp_flash(false, 'Konnte nicht gespeichert werden (Schreibrechte im Ordner api/_data prüfen).');
                kp_redirect($back);
            }
            $d['ansicht'] = $tok;
            $save($d);
        }
        if ($action === 'an_bild_weg') {
            an_remove_image($tok, cx_field('datei', 120));
            kp_flash(true, 'Bild entfernt.');
        } elseif ($action === 'an_text') {
            $an = an_read($tok);
            $an['text'] = kp_text('text', 1000);
            $an['titel'] = kp_text('titel', 120) ?: $an['titel'];
            an_write($tok, $an);
            kp_flash(true, 'Gespeichert.');
        } else {
            [$ok, $msg] = an_add_images($tok, kp_uploaded('bilder'));
            kp_flash($ok, $msg);
        }
        kp_redirect($back);
    }

    // Antwort-Vorlagen speichern (leere Felder nehmen wieder den Standardtext)
    if ($action === 'vorlagen') {
        $neu = [];
        foreach (AD_VORLAGEN_START as $key => $v) {
            $neu[$key] = [
                'titel' => kp_text('v_' . $key . '_titel', 60) ?: $v['titel'],
                'betreff' => cx_field('v_' . $key . '_betreff', 160) ?: $v['betreff'],
                'text' => trim(str_replace("\r", '', (string) ($_POST['v_' . $key . '_text'] ?? ''))) !== '' ? mb_substr(str_replace("\r", '', (string) $_POST['v_' . $key . '_text']), 0, 3000) : $v['text'],
            ];
        }
        kp_flash(ad_vorlagen_save($neu), 'Vorlagen gespeichert.');
        kp_redirect(KP_ADMIN . '#anfragen');
    }

    // Briefe verschickt (für den Brief-Rücklauf)
    if ($action === 'briefe') {
        $n = (int) preg_replace('/\D/', '', cx_field('briefe', 6));
        ad_settings_save(['briefe' => min($n, 99999)]);
        kp_flash(true, 'Gespeichert: ' . $n . ' Briefe verschickt.');
        kp_redirect(KP_ADMIN . '#werbung');
    }

    // Handy-Benachrichtigung (Telegram): Chat verbinden, testen, ein- und ausschalten
    if (in_array($action, ['push_suchen', 'push_chat', 'push_test', 'push_aus'], true)) {
        $p = pu_state();
        if ($action === 'push_suchen') {
            $chats = pu_token() !== '' ? pu_find_chats() : [];
            $_SESSION['push_chats'] = $chats;
            kp_flash($chats !== [], $chats ? 'Chat gefunden. Bitte unten auswählen.' : 'Kein Chat gefunden. Schreib dem Bot in Telegram zuerst eine Nachricht (z. B. „Hallo“) und drück dann noch einmal auf „Chat suchen“.');
        } elseif ($action === 'push_chat') {
            $chat = cx_field('chat', 20);
            if (preg_match('/^-?\d{3,20}$/', $chat) && isset(((array) ($_SESSION['push_chats'] ?? []))[$chat])) {
                $p['chat'] = $chat;
                $p['aus'] = false;
                pu_save($p);
                unset($_SESSION['push_chats']);
                kp_flash(pu_send('✅ Verbunden. Ab jetzt bekommst du hier neue Anfragen von tim-kofler.at.', '/kunden/admin/', true), 'Verbunden. Du solltest gerade eine Nachricht in Telegram bekommen haben.');
            }
        } elseif ($action === 'push_test') {
            kp_flash(pu_send('🔔 Test von tim-kofler.at: So sieht eine Benachrichtigung aus.', '/kunden/admin/', true), 'Test geschickt.');
        } else {
            $p['aus'] = empty($p['aus']);
            pu_save($p);
            kp_flash(true, $p['aus'] ? 'Handy-Benachrichtigungen sind aus.' : 'Handy-Benachrichtigungen sind wieder an.');
        }
        kp_redirect(KP_ADMIN . '#werbung');
    }

    // Wochenbericht ein/aus und Test
    if ($action === 'bericht' || $action === 'bericht_test') {
        if ($action === 'bericht') {
            $an = empty(ad_settings()['bericht']);
            ad_settings_save(['bericht' => $an]);
            kp_flash(true, $an ? 'Wochenbericht ist an. Er kommt jeden Montag ab 7 Uhr.' : 'Wochenbericht ist aus.');
        } else {
            kp_flash(wb_send(true), 'Testbericht für die letzte Woche an ' . (string) (cx_config()['notify_email'] ?? 'office@tim-kofler.at') . ' geschickt.');
        }
        kp_redirect(KP_ADMIN . '#werbung');
    }

    // Newsletter-Zahl sofort neu von Brevo holen
    if ($action === 'nl_neu') {
        $n = ad_newsletter(true);
        kp_flash($n['bestaetigt'] !== null, $n['bestaetigt'] !== null ? 'Aktualisiert.' : 'Brevo hat keine Zahl geliefert (list_newsletter in der config.php prüfen).');
        kp_redirect(KP_ADMIN . '#werbung');
    }

    // Bewertung freigeben, verbergen oder löschen
    if ($action === 'bw_status') {
        $u = cx_field('u', 40);
        $b = bw_read($u);
        $was = cx_field('was', 10);
        if ($b && $was === 'loeschen') {
            bw_delete($u);
            kp_flash(true, 'Bewertung gelöscht.');
        } elseif ($b && in_array($was, ['frei', 'aus'], true)) {
            $b['status'] = $was;
            bw_write($u, $b);
            kp_flash(true, $was === 'frei' ? (empty($b['oeffentlich']) ? 'Gemerkt. Ohne Einwilligung des Kunden erscheint sie trotzdem nicht auf der Seite.' : 'Freigegeben. Sie steht jetzt auf der Startseite unter „Referenz“.') : 'Verborgen.');
        }
        kp_redirect(KP_ADMIN . '#werbung');
    }

    // Werbekosten pro Quelle (Summe bisher, von Hand eingetragen). Leeres Feld entfernt die Quelle.
    if ($action === 'kosten') {
        $neu = [];
        $fehler = false;
        $werte = is_array($_POST['kosten'] ?? null) ? $_POST['kosten'] : [];
        $q = af_quelle(cx_field('neu_quelle', 40));
        if (cx_field('neu_quelle', 40) !== '') {
            $werte[$q] = (string) ($_POST['neu_betrag'] ?? '');
        }
        foreach ($werte as $quelle => $betrag) {
            $quelle = af_quelle((string) $quelle);
            $cent = af_cent(mb_substr((string) $betrag, 0, 20));
            if ($cent === -1) {
                $fehler = true;
            } elseif ($cent !== null && $quelle !== 'direkt' && count($neu) < 40) {
                $neu[$quelle] = $cent;
            }
        }
        // Laufende Kosten (nicht Werbung): Name => Betrag pro Monat, leeres Feld entfernt die Zeile.
        $lauf = [];
        $lw = is_array($_POST['laufend'] ?? null) ? $_POST['laufend'] : [];
        $ln = trim(str_replace(['<', '>', '"'], '', cx_field('neu_laufend', 40)));
        if ($ln !== '') {
            $lw[$ln] = (string) ($_POST['neu_laufend_betrag'] ?? '');
        }
        foreach ($lw as $name => $betrag) {
            $name = mb_substr(trim(str_replace(['<', '>', '"'], '', (string) $name)), 0, 40);
            $cent = af_cent(mb_substr((string) $betrag, 0, 20));
            if ($cent === -1) {
                $fehler = true;
            } elseif ($cent !== null && $name !== '' && count($lauf) < 20) {
                $lauf[$name] = $cent;
            }
        }
        $ok = af_kosten_save($neu) && af_betrieb_save($lauf);
        kp_flash($ok && !$fehler, !$ok ? 'Konnte nicht gespeichert werden (Schreibrechte im Ordner api/_data prüfen).'
            : ($fehler ? 'Gespeichert, aber ein Betrag war keine Zahl und wurde weggelassen (z. B. 16,74).' : 'Kosten gespeichert.'));
        kp_redirect(KP_ADMIN . '#werbung');
    }

    $all = kp_accounts();

    if ($action === 'anlegen') {
        $u = strtolower(cx_field('benutzer', 40));
        $email = cx_email(cx_field('email', 254));
        if (!kp_valid_user($u)) {
            kp_flash(false, 'Benutzername: 3 bis 40 Zeichen, nur Kleinbuchstaben, Ziffern und Bindestriche (z. B. baeckerei-muster).');
        } elseif (isset($all[$u])) {
            kp_flash(false, 'Den Benutzernamen „' . $u . '“ gibt es schon.');
        } elseif (kp_text('name', 80) === '') {
            kp_flash(false, 'Bitte einen Namen angeben.');
        } elseif (cx_field('email', 254) !== '' && $email === '') {
            kp_flash(false, 'Die E-Mail-Adresse ist ungültig.');
        } elseif (cx_field('willkommen', 5) === 'ja' && $email === '') {
            kp_flash(false, 'Für die Willkommensmail bitte die E-Mail-Adresse des Kunden eintragen (oder das Häkchen weglassen).');
        } else {
            $welcome = cx_field('willkommen', 5) === 'ja';
            $pw = kp_new_password();
            $all[$u] = [
                'name' => kp_text('name', 80), 'firma' => kp_text('firma', 120), 'email' => $email,
                'webseite' => kp_text('webseite', 200), 'art' => isset(KP_KUNDENARTEN[cx_field('art', 20)]) ? cx_field('art', 20) : 'betrieb',
                'hash' => password_hash($pw, PASSWORD_DEFAULT), 'pw_eigen' => false,
                'aktiv' => true, 'erstellt' => date('c'),
            ];
            if (kp_save_accounts($all)) {
                if ($welcome) {
                    // Mit Willkommensmail legt der Kunde sein Passwort selbst fest; das Zufallspasswort sieht niemand.
                    [$ok, $text] = kp_send_welcome($u, $all[$u]);
                    kp_flash($ok, $ok ? 'Kunde angelegt. ' . $text : 'Kunde angelegt, aber: ' . $text);
                    kp_redirect(KP_ADMIN . '?k=' . $u . '#zugang');
                }
                $_SESSION['zugang'] = ['benutzer' => $u, 'passwort' => $pw];
                kp_redirect(KP_ADMIN . '?k=' . $u);
            }
            kp_flash(false, 'Das Konto konnte nicht gespeichert werden (Schreibrechte im Ordner api/_data prüfen).');
        }
        kp_redirect(KP_ADMIN . '#neu');
    }

    if ($k === '' || !isset($all[$k])) {
        kp_redirect(KP_ADMIN);
    }
    $back = KP_ADMIN . '?k=' . $k;

    if ($action === 'bearbeiten') {
        $email = cx_email(cx_field('email', 254));
        if (cx_field('email', 254) !== '' && $email === '') {
            kp_flash(false, 'Die E-Mail-Adresse ist ungültig.');
            kp_redirect($back);
        }
        $all[$k]['name'] = kp_text('name', 80) ?: $all[$k]['name'];
        $all[$k]['firma'] = kp_text('firma', 120);
        $all[$k]['email'] = $email;
        $all[$k]['webseite'] = kp_text('webseite', 200);
        if (isset(KP_KUNDENARTEN[cx_field('art', 20)])) {
            $all[$k]['art'] = cx_field('art', 20);
        }
        kp_save_accounts($all);
        kp_flash(true, 'Gespeichert.');
        kp_redirect($back . '#zugang');
    }

    if ($action === 'auftrag') {
        $paket = cx_field('paket', 20);
        $re = cx_field('rechnung', 20);
        $cent = af_cent(cx_field('betrag', 20));
        $nr = cx_field('rechnung_nr', 20);
        if ($cent === -1) {
            kp_flash(false, 'Der Betrag ist keine Zahl (z. B. 590 oder 1.190,00).');
        } elseif ($nr !== '' && !preg_match('/^\d{4}-\d{3}$/', $nr)) {
            kp_flash(false, 'Rechnungsnummer bitte als JJJJ-NNN, z. B. 2026-001.');
        } else {
            $all[$k]['paket'] = isset(AD_PAKETE[$paket]) ? $paket : '';
            $all[$k]['betrag'] = $cent;
            $all[$k]['rechnung'] = isset(AD_RECHNUNG[$re]) ? $re : 'keine';
            $all[$k]['rechnung_nr'] = $nr;
            kp_save_accounts($all);
            kp_flash(true, 'Auftrag gespeichert.');
        }
        kp_redirect($back . '#zugang');
    }

    if ($action === 'projekt') {
        $phase = cx_field('phase', 20);
        $url = cx_field('vorschau', 300);
        if (!isset(KP_PHASEN[$phase])) {
            kp_flash(false, 'Bitte einen Schritt auswählen.');
        } elseif ($url !== '' && kp_clean_url($url) === '') {
            kp_flash(false, 'Der Vorschau-Link ist keine gültige Webadresse (z. B. https://neu.baeckerei-muster.at).');
        } else {
            $all[$k]['phase'] = $phase;
            $all[$k]['vorschau'] = kp_clean_url($url);
            $all[$k]['naechstes'] = kp_text('naechstes', 400);
            kp_save_accounts($all);
            kp_flash(true, 'Projektstand gespeichert. ' . ($all[$k]['name'] ?? $k) . ' sieht ihn ab sofort im Portal.');
        }
        kp_redirect($back);
    }

    if ($action === 'passwort') {
        $pw = kp_new_password();
        $all[$k]['hash'] = password_hash($pw, PASSWORD_DEFAULT);
        $all[$k]['pw_eigen'] = false;
        kp_save_accounts($all);
        kp_fail_reset('kunde:' . $k);
        $_SESSION['zugang'] = ['benutzer' => $k, 'passwort' => $pw];
        kp_redirect($back . '#zugang');
    }

    // Willkommensmail (erneut) senden: neuer Link zum Passwort-Festlegen, der vorige gilt dann nicht mehr.
    if ($action === 'willkommen') {
        [$ok, $text] = kp_send_welcome($k, $all[$k]);
        kp_flash($ok, $text);
        kp_redirect($back . '#zugang');
    }

    // Kunde hat Handy und Notfall-Codes verloren: Zwei-Faktor-Anmeldung für ihn ausschalten, danach reicht wieder das Passwort.
    if ($action === 'tf_kunde_aus') {
        tf_disable(tf_kunde_file($k));
        kp_fail_reset('kunde:' . $k);
        kp_flash(true, 'Zwei-Faktor-Anmeldung für „' . $k . '“ ausgeschaltet. Die Anmeldung geht jetzt wieder nur mit dem Passwort.');
        kp_redirect($back . '#zugang');
    }

    if ($action === 'sperren') {
        $all[$k]['aktiv'] = empty($all[$k]['aktiv']);
        kp_save_accounts($all);
        kp_flash(true, $all[$k]['aktiv'] ? 'Zugang ist wieder aktiv.' : 'Zugang ist gesperrt. Die Dateien bleiben erhalten.');
        kp_redirect($back . '#zugang');
    }

    if ($action === 'schreiben') {
        [$ok, $res] = kp_add_message($k, 'tim', cx_field('art', 20), kp_text('text', KP_MSG_MAX));
        if ($ok) {
            kp_notify_message($k, $all[$k], $res);
        } else {
            kp_flash(false, $res);
        }
        kp_redirect($back . '#nachrichten');
    }

    // Bewertungslink als Nachricht ins Kundenportal schicken (der Kunde bekommt auch die übliche E-Mail)
    if ($action === 'bw_link') {
        $url = bw_url(bw_token($k));
        $text = 'Hallo ' . ($all[$k]['name'] ?? '') . ', ich hoffe, du bist mit deiner Webseite zufrieden! Magst du mir eine kurze Bewertung schreiben? Das dauert nur eine Minute und hilft mir sehr: ' . $url;
        [$ok, $res] = kp_add_message($k, 'tim', 'nachricht', $text);
        if ($ok) {
            kp_notify_message($k, $all[$k], $res);
        }
        kp_flash($ok, $ok ? 'Bewertungslink als Nachricht geschickt.' : (string) $res);
        kp_redirect($back . '#zugang');
    }

    if ($action === 'erledigt') {
        kp_toggle_done($k, cx_field('id', 20));
        kp_redirect($back . '#nachrichten');
    }

    if ($action === 'eingang_loeschen') {
        $e = cx_field('e', 30);
        if (kp_valid_batch($e) && cx_field('sicher', 5) === 'ja') {
            kp_delete_dir(kp_user_dir($k) . '/' . $e);
            kp_flash(true, 'Upload gelöscht.');
        } else {
            kp_flash(false, 'Zum Löschen bitte das Häkchen setzen.');
        }
        kp_redirect($back . '#uploads');
    }

    if ($action === 'kunde_loeschen') {
        if (strtolower(cx_field('sicher', 40)) !== $k) {
            kp_flash(false, 'Zum Löschen bitte den Benutzernamen genau eintippen.');
            kp_redirect($back . '#zugang');
        }
        kp_delete_dir(kp_user_dir($k));
        unset($all[$k]);
        kp_save_accounts($all);
        kp_flash(true, 'Kunde „' . $k . '“ und alle Dateien wurden gelöscht.');
        kp_redirect(KP_ADMIN);
    }

    kp_redirect($back);
}

$flash = kp_take_flash();
$csrf = kp_csrf_field();

// ---------------- Einrichtung ----------------
if ($hash === '') {
    $new = (string) ($_SESSION['neuer_hash'] ?? '');
    unset($_SESSION['neuer_hash']);
    $out = $new === '' ? '' : '<div class="kp-secret"><p><b>Dein Hash:</b></p><code data-kp-copy>' . cx_h($new) . '</code>'
        . '<p>Trage ihn in <code>api/_data/config.php</code> auf dem Webspace ein:<br><code>\'admin_password_hash\' =&gt; \'…\',</code><br>Danach diese Seite neu laden und mit deinem Passwort anmelden.</p></div>';
    kp_page('Einrichten', <<<HTML
<div class="kp-narrow kp-auth">
  <span class="kp-auth__ico" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l3 3M14 9l2 2"/></svg></span>
  <span class="label"><b>●</b> Kundenportal · Admin</span>
  <h1>Einrichten</h1>
  <p class="lead">Es ist noch kein Admin-Passwort hinterlegt. Wähle hier ein Passwort, dann bekommst du einen Hash (eine verschlüsselte Prüfsumme) für die <code>config.php</code>. Das Passwort selbst wird nirgends gespeichert.</p>
  {$out}
  <form class="form" method="post" action="/kunden/admin/">
    {$csrf}
    <input type="hidden" name="aktion" value="hash">
    {$flash}
    <label class="form__field"><span>Admin-Passwort <em>(mind. 12 Zeichen)</em></span><input type="password" name="passwort" required minlength="12" autocomplete="new-password"></label>
    <label class="form__field"><span>Wiederholen</span><input type="password" name="passwort2" required minlength="12" autocomplete="new-password"></label>
    <button class="btn" type="submit">Hash erzeugen</button>
  </form>
</div>
HTML);
}

// ---------------- Anmeldung, zweiter Schritt: Code aus der App ----------------
if ($codeStep) {
    $action = KP_ADMIN . ($k !== '' ? '?k=' . $k : '');
    kp_page('Code bestätigen', <<<HTML
<div class="kp-narrow kp-auth">
  <span class="kp-auth__ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3l7 3v5.5c0 4.3-2.9 8.1-7 9.5-4.1-1.4-7-5.2-7-9.5V6z"/><path d="M9 12l2.2 2.2L15.5 10"/></svg></span>
  <span class="label"><b>●</b> Kundenportal · Admin</span>
  <h1>Code bestätigen</h1>
  <p class="lead">Öffne Google Authenticator auf deinem Handy und gib den 6-stelligen Code für <b>tim-kofler.at</b> ein.</p>
  <form class="form" method="post" action="{$action}">
    {$csrf}
    <input type="hidden" name="aktion" value="code">
    {$flash}
    <label class="form__field"><span>Code aus der App</span><input class="kp-otp" type="text" name="code" required inputmode="numeric" autocomplete="one-time-code" pattern="[0-9 ]{6,7}" maxlength="7" placeholder="123 456" autofocus></label>
    <button class="btn" type="submit">Anmelden</button>
  </form>
  <details class="kp-more">
    <summary>Handy nicht zur Hand?</summary>
    <form class="form form--small" method="post" action="{$action}">
      {$csrf}
      <input type="hidden" name="aktion" value="code">
      <p class="kp-hint">Gib einen deiner Notfall-Codes ein. Jeder funktioniert nur ein einziges Mal.</p>
      <label class="form__field"><span>Notfall-Code</span><input class="kp-otp" type="text" name="code" required autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="12" placeholder="abcd-efgh"></label>
      <button class="btn btn--line" type="submit">Mit Notfall-Code anmelden</button>
    </form>
  </details>
  <form class="kp-back" method="post" action="/kunden/admin/">{$csrf}<input type="hidden" name="aktion" value="zurueck"><button type="submit">← Zurück zur Passwort-Eingabe</button></form>
</div>
HTML);
}

// ---------------- Anmeldung ----------------
if (!$isAdmin) {
    $action = KP_ADMIN . ($k !== '' ? '?k=' . $k : '');
    kp_page('Anmelden', <<<HTML
<div class="kp-narrow kp-auth">
  <span class="kp-auth__ico" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></span>
  <span class="label"><b>●</b> Kundenportal · Admin</span>
  <h1>Anmelden</h1>
  <p class="lead">Nur für Tim: Kunden anlegen, Nachrichten und Uploads ansehen.</p>
  <form class="form" method="post" action="{$action}">
    {$csrf}
    <input type="hidden" name="aktion" value="anmelden">
    {$flash}
    <label class="form__field"><span>Admin-Passwort</span><input type="password" name="passwort" required autocomplete="current-password"></label>
    <button class="btn" type="submit">Anmelden</button>
  </form>
</div>
HTML);
}

// Kopfzeile: „Übersicht“ nur auf Unterseiten, auf der Übersicht selbst wäre der Knopf doppelt.
$logoutHome = '<a class="btn btn--sm btn--line" href="/kunden/admin/?sicherheit">Sicherheit</a><form method="post" action="/kunden/admin/">' . $csrf
    . '<input type="hidden" name="aktion" value="abmelden"><button class="btn btn--sm btn--line" type="submit">Abmelden</button></form>';
$logout = '<a class="btn btn--sm btn--line" href="/kunden/admin/">Übersicht</a>' . $logoutHome;
$all = kp_accounts();

// Frisch erzeugte Zugangsdaten genau einmal anzeigen.
$zugang = '';
if (!empty($_SESSION['zugang'])) {
    $z = $_SESSION['zugang'];
    unset($_SESSION['zugang']);
    $text = "Dein Zugang zum Kundenportal\nAdresse: " . kp_portal_url() . "\nBenutzername: " . $z['benutzer'] . "\nPasswort: " . $z['passwort'];
    $zugang = '<div class="kp-secret"><p><b>Zugangsdaten für den Kunden</b> – werden nur jetzt angezeigt. Bitte persönlich, per Brief oder Telefon weitergeben, nicht ungeschützt per Mail mit dem Benutzernamen zusammen.</p>'
        . '<pre data-kp-copy>' . cx_h($text) . '</pre><button class="btn btn--sm" type="button" data-kp-copy-btn>Kopieren</button></div>';
}

// ---------------- Sicherheit: Zwei-Faktor-Anmeldung ----------------
if ($sicherheit) {
    $form = KP_ADMIN . '?sicherheit';
    $codes = '';
    if (!empty($_SESSION['tf_codes'])) {
        $list = (array) $_SESSION['tf_codes'];
        unset($_SESSION['tf_codes']);
        $items = implode('', array_map(static fn($c) => '<li>' . cx_h((string) $c) . '</li>', $list));
        $text = "Notfall-Codes für tim-kofler.at/kunden/admin/ (je einmal verwendbar, erzeugt am " . date('d.m.Y') . ")\n" . implode("\n", $list);
        $codes = '<div class="kp-secret kp-codes"><p><b>Deine Notfall-Codes</b> – werden nur jetzt angezeigt.</p>'
            . '<p>Damit kommst du hinein, wenn das Handy weg oder kaputt ist. Jeder Code funktioniert einmal. Am besten ausdrucken oder in deinen Passwort-Manager kopieren, nicht im selben Handy wie die App speichern.</p>'
            . '<ol class="kp-codes__list">' . $items . '</ol><pre hidden data-kp-copy>' . cx_h($text) . '</pre>'
            . '<button class="btn btn--sm" type="button" data-kp-copy-btn>Alle kopieren</button></div>';
    }
    $st = tf_state();
    if ($st) {
        $seit = cx_h(date('d.m.Y', strtotime((string) ($st['seit'] ?? '')) ?: time()));
        $left = count((array) ($st['notfall'] ?? []));
        $leftTxt = $left === 1 ? '1 Notfall-Code' : $left . ' Notfall-Codes';
        $warn = $left <= 2 ? ' <span class="kp-badge">bald neue erzeugen</span>' : '';
        $content = <<<HTML
<p class="kp-on"><span class="kp-on__dot" aria-hidden="true"></span><span><b>Eingeschaltet</b> seit {$seit} · noch {$leftTxt} übrig{$warn}</span></p>
<p class="lead">Bei jeder Anmeldung fragt das Portal nach dem Passwort zusätzlich den 6-stelligen Code aus Google Authenticator ab.</p>
<div class="kp-grid kp-grid--even kp-tf-actions">
  <form class="form form--small" method="post" action="{$form}">
    {$csrf}
    <input type="hidden" name="aktion" value="tf_neu">
    <h2>Notfall-Codes erneuern</h2>
    <p class="kp-hint">Erzeugt zehn neue Codes. Die alten gelten danach nicht mehr.</p>
    <label class="form__field"><span>Aktueller Code aus der App</span><input class="kp-otp" type="text" name="code" required inputmode="numeric" autocomplete="one-time-code" pattern="[0-9 ]{6,7}" maxlength="7" placeholder="123 456"></label>
    <button class="btn" type="submit">Neue Codes erzeugen</button>
  </form>
  <form class="form form--small" method="post" action="{$form}">
    {$csrf}
    <input type="hidden" name="aktion" value="tf_aus">
    <h2>Ausschalten</h2>
    <p class="kp-hint">Danach reicht wieder das Passwort allein. Für ein neues Handy einfach ausschalten und neu einrichten.</p>
    <label class="form__field"><span>Aktueller Code aus der App</span><input class="kp-otp" type="text" name="code" required inputmode="numeric" autocomplete="one-time-code" pattern="[0-9 ]{6,7}" maxlength="7" placeholder="123 456"></label>
    <label class="kp-confirm"><input type="checkbox" name="sicher" value="ja" required> Ja, ausschalten</label>
    <button class="btn btn--line" type="submit">Ausschalten</button>
  </form>
</div>
HTML;
    } else {
        if (empty($_SESSION['tf_neu'])) {
            $_SESSION['tf_neu'] = tf_new_secret();
        }
        $secret = (string) $_SESSION['tf_neu'];
        $uri = cx_h(tf_uri($secret));
        $pretty = cx_h(tf_pretty($secret));
        $issuer = cx_h(TF_ISSUER);
        $content = <<<HTML
<p class="lead">Schützt deinen Admin-Zugang zusätzlich zum Passwort: Wer sich anmelden will, braucht auch den Code, den nur dein Handy anzeigt. Die Einrichtung dauert etwa zwei Minuten.</p>
<ol class="kp-steps">
  <li>
    <h2>App installieren</h2>
    <p>Lade <b>Google Authenticator</b> aus dem App Store (iPhone) oder Google Play (Android). Andere Authenticator-Apps funktionieren genauso.</p>
  </li>
  <li>
    <h2>QR-Code scannen</h2>
    <p>In der App auf <b>+</b> tippen, dann <b>QR-Code scannen</b> und die Kamera auf diesen Code halten.</p>
    <div class="kp-qr" data-kp-qr="{$uri}" role="img" aria-label="QR-Code für die Authenticator-App"><noscript>Der QR-Code braucht JavaScript. Nimm stattdessen den Schlüssel darunter.</noscript></div>
    <details class="kp-more">
      <summary>Scannen geht nicht? Schlüssel abtippen</summary>
      <p class="kp-hint">In der App <b>Einrichtungsschlüssel eingeben</b> wählen. Konto: <b>{$issuer}</b>, Art: <b>zeitbasiert</b>.</p>
      <code class="kp-key">{$pretty}</code>
    </details>
  </li>
  <li>
    <h2>Code bestätigen</h2>
    <p>Die App zeigt jetzt bei <b>{$issuer}</b> einen 6-stelligen Code, der alle 30 Sekunden wechselt. Gib den aktuellen Code hier ein.</p>
    <form class="form form--small" method="post" action="{$form}">
      {$csrf}
      <input type="hidden" name="aktion" value="tf_ein">
      <label class="form__field"><span>Code aus der App</span><input class="kp-otp" type="text" name="code" required inputmode="numeric" autocomplete="one-time-code" pattern="[0-9 ]{6,7}" maxlength="7" placeholder="123 456"></label>
      <button class="btn" type="submit">Bestätigen und einschalten</button>
    </form>
  </li>
</ol>
<script src="/beispiele/_shared/vendor/qrcode-generator-2.0.4/qrcode.js"></script><script src="/assets/js/tk-qr.js?v=1"></script>
HTML;
    }
    kp_page('Sicherheit', <<<HTML
<div class="kp-narrow kp-tf">
  <span class="label"><b>●</b> Kundenportal · Admin</span>
  <h1>Zwei-Faktor-Anmeldung</h1>
  {$flash}
  {$codes}
  {$content}
</div>
HTML, $logout);
}

// ---------------- Gratis-Entwurf im Detail ----------------
if ($ew !== '' && ($d = ew_read($ew))) {
    $v = static fn($key) => cx_h(is_array($d[$key] ?? '') ? implode(', ', $d[$key]) : (string) ($d[$key] ?? ''));
    $rows = '';
    $web = ($d['webseite'] ?? '') !== '' ? $d['webseite'] : (($d['hat_webseite'] ?? '') === 'nein' ? 'noch keine' : '');
    $webHtml = cx_h($web);
    if (($d['webseite'] ?? '') !== '') {
        $href = preg_match('~^https?://~i', $d['webseite']) ? $d['webseite'] : 'https://' . $d['webseite'];
        $webHtml = '<a href="' . cx_h($href) . '" target="_blank" rel="noopener noreferrer">' . cx_h($d['webseite']) . '</a>';
    }
    foreach ([
        'Eingang' => cx_h(date('d.m.Y, H:i', strtotime((string) $d['zeit']) ?: 0)) . ' Uhr',
        'Betrieb' => $v('firma'), 'Branche' => $v('branche'), 'Ort' => $v('ort'), 'Webseite' => $webHtml,
        'Wunschfarbe' => ew_swatch((string) ($d['farbe_hex'] ?? '')) . $v('farbe') . (($d['farbe_hex'] ?? '') !== '' ? ' <code>' . $v('farbe_hex') . '</code>' : ''),
        'Stil' => $v('stil'), 'Soll drauf' => $v('inhalt'), 'Wünsche' => nl2br($v('wuensche')),
        'Name' => $v('name'), 'E-Mail' => '<a href="mailto:' . $v('email') . '">' . $v('email') . '</a>',
        'Telefon' => ($d['telefon'] ?? '') !== '' ? '<a href="tel:' . $v('telefon') . '">' . $v('telefon') . '</a>' : '',
        'Newsletter' => !empty($d['newsletter']) ? 'ja angehakt (zählt erst nach Bestätigung per Mail)' : 'nein, nur Mails zum Entwurf',
        'Gefunden über' => $v('quelle'),
    ] as $key => $val) {
        $rows .= '<tr><th>' . cx_h($key) . '</th><td>' . ($val !== '' ? $val : '–') . '</td></tr>';
    }
    $rows .= ad_optin_row($d);
    // Gratis-Entwurf ist „innerhalb von 48 Stunden“ versprochen (ab Bestätigung der E-Mail).
    if (in_array($d['status'] ?? 'neu', ['neu', 'arbeit'], true) && ($d['optin'] ?? '') !== 'offen') {
        $frist = (strtotime((string) ($d['optin_zeit'] ?? $d['zeit'])) ?: 0) + 48 * 3600;
        $std = (int) round(($frist - time()) / 3600);
        $rows .= '<tr><th>Versprochen bis</th><td><span class="kp-pill ' . ($std < 12 ? 'kp-pill--hot' : '') . '">' . cx_h(date('d.m., H:i', $frist)) . ' Uhr</span> ' . cx_h($std >= 0 ? 'noch ' . $std . ' Std.' : 'seit ' . -$std . ' Std. überfällig') . '</td></tr>';
    }
    $opts = '';
    foreach (EW_STATUS as $key => $label) {
        $opts .= '<option value="' . $key . '"' . (($d['status'] ?? 'neu') === $key ? ' selected' : '') . '>' . cx_h($label) . '</option>';
    }
    $subject = rawurlencode('Dein Webseiten-Entwurf für ' . $d['firma']);
    $hallo = ($d['name'] ?? '') !== '' ? 'Hallo ' . $d['name'] . ',' : 'Hallo,';
    $body = rawurlencode($hallo . "\n\nwie versprochen hier dein kostenloser Entwurf für " . $d['firma'] . ".\n\n\n\nViele Grüße\nTim");
    $mailto = 'mailto:' . cx_h($d['email']) . '?subject=' . $subject . '&amp;body=' . $body;
    $form = KP_ADMIN . '?entwurf=' . $ew;
    $nachfassen = ad_nachfassen_field((string) ($d['nachfassen'] ?? ''));
    $anCard = ad_ansicht_card($d, $form, $csrf, (string) $d['email'], (string) ($d['telefon'] ?? ''));
    $an = an_read((string) ($d['ansicht'] ?? ''));
    $vorlagen = ad_vorlagen_html(['name' => (string) ($d['name'] ?? ''), 'firma' => (string) $d['firma'], 'paket' => '', 'link' => $an ? an_url((string) $d['ansicht']) : ''], (string) $d['email'], (string) ($d['telefon'] ?? ''));
    kp_page('Entwurf: ' . $d['firma'], <<<HTML
<div class="crumbs"><a href="/kunden/admin/#anfragen">Anfragen</a> / {$v('firma')}</div>
<h1>{$v('firma')}</h1>
{$flash}
<div class="kp-table kp-ew"><table><tbody>{$rows}</tbody></table></div>
<div class="kp-actions"><a class="btn" href="{$mailto}">Entwurf per E-Mail schicken</a></div>
{$anCard}
{$vorlagen}
<div class="kp-grid kp-grid--even">
  <form class="form form--small" method="post" action="{$form}">
    {$csrf}
    <input type="hidden" name="aktion" value="ew_status">
    <h2>Status</h2>
    <label class="form__field"><span>Stand</span><select name="status">{$opts}</select></label>
    {$nachfassen}
    <label class="form__field"><span>Notiz <em>(nur für dich)</em></span><textarea name="notiz" rows="3" maxlength="2000">{$v('notiz')}</textarea></label>
    <button class="btn btn--line" type="submit">Speichern</button>
  </form>
  <form class="form form--small kp-danger" method="post" action="{$form}">
    {$csrf}
    <input type="hidden" name="aktion" value="ew_loeschen">
    <h2>Löschen</h2>
    <p class="muted">Ohne Auftrag wird die Anfrage 12 Monate nach der letzten Änderung automatisch gelöscht.</p>
    <label class="kp-confirm"><input type="checkbox" name="sicher" value="ja" required> Ja, Anfrage endgültig löschen</label>
    <button class="btn btn--line" type="submit">Anfrage löschen</button>
  </form>
</div>
HTML, $logout);
}

// ---------------- Anfrage im Detail (Formular, Rückruf, Verein, Gründer) ----------------
if ($af !== '' && ($d = af_read($af))) {
    $titel = (string) (($d['firma'] ?? '') !== '' ? $d['firma'] : $d['name']);
    $rows = '<tr><th>Eingang</th><td>' . cx_h(date('d.m.Y, H:i', strtotime((string) $d['zeit']) ?: 0)) . ' Uhr · ' . cx_h(AF_ARTEN[$d['art']] ?? 'Anfrage') . '</td></tr>';
    foreach ((array) ($d['felder'] ?? []) as $key => $val) {
        $val = (string) $val;
        if ($val === '') {
            continue;
        }
        $html = nl2br(cx_h($val));
        if ($key === 'E-Mail') {
            $html = '<a href="mailto:' . cx_h($val) . '">' . cx_h($val) . '</a>';
        } elseif ($key === 'Telefon') {
            $html = '<a href="tel:' . cx_h(preg_replace('/[^0-9+]/', '', $val) ?? '') . '">' . cx_h($val) . '</a>';
        } elseif ($key === 'Webseite' && !preg_match('/\s/', $val)) {
            // Webseiten-Check: Adresse gleich zum Öffnen (nur http/https, sonst bleibt es Text)
            $u = preg_match('~^https?://~i', $val) ? $val : 'https://' . $val;
            $html = '<a href="' . cx_h($u) . '" target="_blank" rel="noopener noreferrer">' . cx_h($val) . '</a>';
        }
        // Lange Texte (Nachricht, Rechner) eingeklappt, die ersten Worte bleiben sichtbar.
        if (mb_strlen($val) > 160) {
            $html = '<details class="kp-lang"><summary>' . cx_h(mb_strimwidth($val, 0, 120, ' …')) . '</summary><p>' . $html . '</p></details>';
        }
        $rows .= '<tr><th>' . cx_h((string) $key) . '</th><td>' . $html . '</td></tr>';
    }
    $rows .= ad_optin_row($d);
    $opts = '';
    foreach (AF_STATUS as $key => $label) {
        $opts .= '<option value="' . $key . '"' . (($d['status'] ?? 'neu') === $key ? ' selected' : '') . '>' . cx_h($label) . '</option>';
    }
    $email = (string) ($d['felder']['E-Mail'] ?? '');
    $tel = preg_replace('/[^0-9+]/', '', (string) ($d['felder']['Telefon'] ?? '')) ?? '';
    $wa = $tel !== '' ? 'https://wa.me/' . ltrim(str_starts_with($tel, '0') && !str_starts_with($tel, '00') ? '43' . substr($tel, 1) : $tel, '+0') : '';
    $knoepfe = ($email !== '' ? '<a class="btn" href="mailto:' . cx_h($email) . '?subject=' . rawurlencode('Deine Anfrage bei Tim Kofler') . '">E-Mail schreiben</a>' : '')
        . ($wa !== '' ? '<a class="btn btn--line" href="' . cx_h($wa) . '" target="_blank" rel="noopener">WhatsApp</a>' : '');
    $form = KP_ADMIN . '?anfrage=' . $af;
    $hT = cx_h($titel);
    $notiz = cx_h((string) ($d['notiz'] ?? ''));
    $nachfassen = ad_nachfassen_field((string) ($d['nachfassen'] ?? ''));
    $telRoh = (string) ($d['felder']['Telefon'] ?? '');
    $anCard = ($d['art'] ?? '') !== 'rueckruf' || $telRoh !== '' ? ad_ansicht_card($d, $form, $csrf, $email, $telRoh) : '';
    $an = an_read((string) ($d['ansicht'] ?? ''));
    $vorlagen = ad_vorlagen_html(['name' => (string) ($d['name'] ?? ''), 'firma' => (string) ($d['firma'] ?? ''), 'paket' => (string) ($d['felder']['Paket'] ?? ''), 'link' => $an ? an_url((string) $d['ansicht']) : ''], $email, $telRoh);
    kp_page('Anfrage: ' . $titel, <<<HTML
<div class="crumbs"><a href="/kunden/admin/#anfragen">Anfragen</a> / {$hT}</div>
<h1>{$hT}</h1>
{$flash}
<div class="kp-table kp-ew"><table><tbody>{$rows}</tbody></table></div>
<div class="kp-actions">{$knoepfe}</div>
{$vorlagen}
{$anCard}
<div class="kp-grid kp-grid--even">
  <form class="form form--small" method="post" action="{$form}">
    {$csrf}
    <input type="hidden" name="aktion" value="af_status">
    <h2>Status</h2>
    <label class="form__field"><span>Stand</span><select name="status">{$opts}</select></label>
    {$nachfassen}
    <label class="form__field"><span>Notiz <em>(nur für dich)</em></span><textarea name="notiz" rows="3" maxlength="2000">{$notiz}</textarea></label>
    <button class="btn btn--line" type="submit">Speichern</button>
  </form>
  <form class="form form--small kp-danger" method="post" action="{$form}">
    {$csrf}
    <input type="hidden" name="aktion" value="af_loeschen">
    <h2>Löschen</h2>
    <p class="muted">Ohne Auftrag wird die Anfrage 12 Monate nach der letzten Änderung automatisch gelöscht.</p>
    <label class="kp-confirm"><input type="checkbox" name="sicher" value="ja" required> Ja, Anfrage endgültig löschen</label>
    <button class="btn btn--line" type="submit">Anfrage löschen</button>
  </form>
</div>
HTML, $logout);
}

// Feld „Nachfassen am“ mit Schnellwahl (portal.js füllt das Datum).
function ad_nachfassen_field(string $wert): string
{
    $hint = $wert !== '' ? ' <em>(' . cx_h(ad_wann($wert)) . ')</em>' : ' <em>(optional)</em>';
    return '<label class="form__field"><span>Nachfassen am' . $hint . '</span><input type="date" name="nachfassen" value="' . cx_h($wert) . '"></label>'
        . '<div class="kp-datum"><button type="button" class="kp-pill" data-kp-datum="3">in 3 Tagen</button><button type="button" class="kp-pill" data-kp-datum="7">in 1 Woche</button>'
        . '<button type="button" class="kp-pill" data-kp-datum="14">in 2 Wochen</button><button type="button" class="kp-pill" data-kp-datum="">keins</button></div>';
}

// Zeile „E-Mail bestätigt“ in der Detailansicht einer Anfrage (leer bei älteren Anfragen ohne diese Angabe).
function ad_optin_row(array $d): string
{
    $o = (string) ($d['optin'] ?? '');
    if ($o === '') {
        return '';
    }
    $txt = $o === 'ok' ? 'ja, am ' . date('d.m.Y, H:i', strtotime((string) ($d['optin_zeit'] ?? '')) ?: 0) . ' Uhr'
        : 'noch nicht (Bestätigungslink nicht geklickt)' . (af_versteckt($d) ? ', deshalb ausgeblendet' : '');
    return '<tr><th>E-Mail bestätigt</th><td>' . ($o === 'ok' ? '' : '<span class="kp-pill kp-pill--aus">offen</span> ') . cx_h($txt) . '</td></tr>';
}

// Karte „Entwurf-Link“: Bilder hochladen, Link kopieren, sehen ob geöffnet.
function ad_ansicht_card(array $d, string $form, string $csrf, string $email, string $tel): string
{
    $tok = (string) ($d['ansicht'] ?? '');
    $an = an_read($tok);
    $up = '<form class="form form--small kp-an-up" method="post" action="' . $form . '#ansicht" enctype="multipart/form-data">' . $csrf
        . '<input type="hidden" name="aktion" value="an_bilder">'
        . '<label class="form__field"><span>' . ($an ? 'Weitere Bilder' : 'Bilder vom Entwurf') . ' <em>(PC und Handy, JPG/PNG/WebP, je bis ' . AN_MAX_MB . ' MB)</em></span><input type="file" name="bilder[]" accept="image/jpeg,image/png,image/webp" multiple required></label>'
        . '<button class="btn' . ($an ? ' btn--line' : '') . '" type="submit">' . ($an ? 'Hinzufügen' : 'Hochladen und Link erstellen') . '</button></form>';
    if (!$an) {
        return '<div class="kp-card kp-ansicht" id="ansicht"><h2>Entwurf-Link</h2><p class="kp-hint kp-hint--top">Lade die Bilder vom fertigen Entwurf hoch. Der Interessent bekommt einen privaten Link, du siehst, ob er ihn geöffnet hat, und er kann mit einem Klick „Passt“ sagen. Bei jedem Öffnen und jeder Antwort bekommst du eine Nachricht aufs Handy.</p>' . $up . '</div>';
    }
    $url = an_url($tok);
    $bilder = '';
    foreach ((array) $an['bilder'] as $i => $b) {
        $bilder .= '<li class="kp-file"><img src="' . cx_h($url) . '&amp;b=' . (int) $i . '&amp;vorschau=1" alt="" loading="lazy">'
            . '<form method="post" action="' . $form . '#ansicht">' . $csrf . '<input type="hidden" name="aktion" value="an_bild_weg"><input type="hidden" name="datei" value="' . cx_h((string) $b['datei']) . '"><button class="kp-an-weg" type="submit" aria-label="Bild entfernen">×</button></form></li>';
    }
    $antwort = ($an['antwort'] ?? '') === 'ja' ? '<span class="kp-pill kp-pill--ok">sagt: Passt!</span>' : (($an['antwort'] ?? '') === 'aendern' ? '<span class="kp-pill kp-pill--hot">wünscht Änderungen</span>' : '');
    $offen = (int) ($an['aufrufe'] ?? 0) > 0;
    $wa = ad_wa($tel, 'Hallo, hier ist dein Entwurf: ' . $url);
    return '<div class="kp-card kp-ansicht" id="ansicht"><h2>Entwurf-Link</h2>'
        . '<p class="kp-an-stand"><span class="kp-pill' . ($offen ? ' kp-pill--ok' : '') . '">' . cx_h(an_stand($an)) . '</span>' . $antwort . '</p>'
        . '<div class="kp-an-link"><code>' . cx_h($url) . '</code><span class="kp-actions"><button class="btn btn--sm" type="button" data-kp-copy-text="' . cx_h($url) . '">Link kopieren</button>'
        . '<a class="btn btn--sm btn--line" href="' . cx_h($url) . '&amp;vorschau=1" target="_blank" rel="noopener">Ansehen</a>'
        . ($wa !== '' ? '<a class="btn btn--sm btn--line" href="' . cx_h($wa) . '" target="_blank" rel="noopener">Per WhatsApp</a>' : '') . '</span></div>'
        . ($bilder !== '' ? '<ul class="kp-files kp-an-bilder">' . $bilder . '</ul>' : '<p class="kp-hint kp-hint--top">Noch keine Bilder.</p>')
        . '<details class="kp-more"><summary>Text und Bilder ändern</summary>'
        . '<form class="form form--small" method="post" action="' . $form . '#ansicht">' . $csrf . '<input type="hidden" name="aktion" value="an_text">'
        . '<label class="form__field"><span>Überschrift: Entwurf für …</span><input type="text" name="titel" maxlength="120" value="' . cx_h((string) $an['titel']) . '"></label>'
        . '<label class="form__field"><span>Text über den Bildern <em>(leer = Standardtext)</em></span><textarea name="text" rows="3" maxlength="1000" placeholder="Hier ist dein persönlicher, kostenloser Entwurf. So könnte deine neue Webseite am PC und am Handy aussehen.">' . cx_h((string) $an['text']) . '</textarea></label>'
        . '<button class="btn btn--line" type="submit">Speichern</button></form>' . $up
        . '<form class="kp-danger" method="post" action="' . $form . '#ansicht" data-kp-confirm="Entwurf-Link löschen? Der Link funktioniert dann nicht mehr.">' . $csrf . '<input type="hidden" name="aktion" value="an_loeschen"><button class="btn btn--line" type="submit">Link löschen</button></form>'
        . '</details></div>';
}

// Paket und Rechnungsstand als kleine Schilder (Kundenliste und Kopf der Kundenkartei).
function ad_auftrag_pills(array $a): string
{
    $out = ($a['paket'] ?? '') !== '' && isset(AD_PAKETE[$a['paket']]) ? '<span class="kp-pill kp-pill--paket">' . cx_h(explode(' (', AD_PAKETE[$a['paket']])[0]) . '</span>' : '';
    $re = (string) ($a['rechnung'] ?? 'keine');
    if ($re === 'offen') {
        $out .= '<span class="kp-pill kp-pill--hot">Rechnung offen' . (isset($a['betrag']) && $a['betrag'] !== null ? ' · ' . cx_h(af_euro((int) $a['betrag'])) : '') . '</span>';
    } elseif ($re === 'bezahlt') {
        $out .= '<span class="kp-pill kp-pill--paket">bezahlt</span>';
    }
    return $out;
}

// Zwei Anfangsbuchstaben für den runden Kreis vor dem Namen.
$initials = static fn(string $n): string => kp_initials($n);

// ---------------- Kunde im Detail ----------------
if ($k !== '' && isset($all[$k])) {
    $a = $all[$k];
    $h = static fn($key) => cx_h((string) ($a[$key] ?? ''));
    $status = !empty($a['aktiv']) ? 'aktiv' : 'gesperrt';
    $last = !empty($a['letzte_anmeldung']) ? cx_h(date('d.m.Y, H:i', strtotime((string) $a['letzte_anmeldung']) ?: 0)) . ' Uhr' : 'noch nie';
    $lock = !empty($a['aktiv']) ? 'Zugang sperren' : 'Zugang wieder freigeben';
    $tf = tf_state(tf_kunde_file($k));
    $tfInfo = $tf
        ? '<p class="kp-hint kp-hint--top">Zwei-Faktor-Anmeldung <b>ein</b> seit ' . cx_h(date('d.m.Y', strtotime((string) ($tf['seit'] ?? '')) ?: 0)) . ', noch ' . count((array) ($tf['notfall'] ?? [])) . ' Notfall-Codes</p>'
            . '<form method="post" action="' . KP_ADMIN . '?k=' . cx_h($k) . '" data-kp-confirm="Zwei-Faktor-Anmeldung für ' . cx_h($k) . ' ausschalten? Bitte nur, wenn du sicher weißt, dass wirklich der Kunde darum bittet (z. B. am Telefon erkannt).">' . $csrf
            . '<input type="hidden" name="aktion" value="tf_kunde_aus"><button class="btn btn--line" type="submit">Zwei-Faktor ausschalten</button></form>'
        : '<p class="kp-hint kp-hint--top">Zwei-Faktor-Anmeldung: aus (der Kunde kann sie im Portal freiwillig einschalten)</p>';
    $lockAsk = !empty($a['aktiv']) ? ' data-kp-confirm="Zugang sperren? Die Anmeldung geht dann nicht mehr, die Dateien bleiben erhalten."' : '';
    $used = kp_bytes(kp_used_bytes($k));
    $inv = kp_invite_state($k);
    $invLabel = $inv['zuletzt'] ? 'Willkommensmail erneut senden' : 'Willkommensmail senden';
    if (($a['email'] ?? '') === '') {
        $invite = '<p class="kp-hint">Willkommensmail: dafür oben bei „Daten“ eine E-Mail-Adresse eintragen.</p>';
    } else {
        $invTxt = !$inv['zuletzt'] ? 'noch nicht verschickt'
            : 'zuletzt am ' . date('d.m.Y, H:i', $inv['zuletzt']) . ' Uhr, ' . ($inv['offen'] ? 'Link offen bis ' . date('d.m.Y', $inv['bis']) : (($a['pw_eigen'] ?? false) ? 'Passwort festgelegt' : 'Link verbraucht oder abgelaufen'));
        $invite = '<div class="kp-invite"><p class="kp-hint">Willkommensmail: ' . cx_h($invTxt) . '</p>'
            . '<form method="post" action="' . KP_ADMIN . '?k=' . cx_h($k) . '" data-kp-confirm="Willkommensmail mit neuem Link zum Passwort-Festlegen an ' . cx_h((string) $a['email']) . ' schicken? Ein früherer Link gilt dann nicht mehr, das bisherige Passwort bleibt gültig, bis der Kunde ein neues festlegt.">' . $csrf
            . '<input type="hidden" name="aktion" value="willkommen"><button class="btn btn--line" type="submit">' . $invLabel . '</button></form></div>';
    }

    $batchList = kp_batches($k);
    $batches = '';
    $newUps = kp_new_uploads($k, $batchList);
    foreach ($batchList as $id => $b) {
        $base = KP_ADMIN . '?k=' . rawurlencode($k) . '&amp;e=' . rawurlencode($id);
        $items = '';
        foreach ((array) $b['dateien'] as $d) {
            $f = rawurlencode((string) $d['datei']);
            $ext = strtolower(pathinfo((string) $d['datei'], PATHINFO_EXTENSION));
            $thumb = isset(KP_PREVIEW[$ext]) ? '<img src="' . $base . '&amp;f=' . $f . '&amp;vorschau=1" alt="" loading="lazy">' : '<span class="kp-file__ext">' . cx_h(strtoupper($ext)) . '</span>';
            $items .= '<li class="kp-file"><a href="' . $base . '&amp;f=' . $f . '">' . $thumb . '<span>' . cx_h((string) $d['original']) . '<em>' . kp_bytes((int) $d['bytes']) . '</em></span></a></li>';
        }
        $when = cx_h(date('d.m.Y, H:i', strtotime((string) ($b['zeit'] ?? '')) ?: 0));
        $n = count((array) $b['dateien']);
        $msg = ($b['nachricht'] ?? '') !== '' ? '<p class="kp-msg">' . nl2br(cx_h((string) $b['nachricht'])) . '</p>' : '';
        $batches .= '<div class="kp-card kp-batch--open' . (in_array($id, $newUps, true) ? ' is-new' : '') . '"><div class="kp-batch__kopf"><h3>' . $when . ' Uhr' . (in_array($id, $newUps, true) ? ' <span class="kp-tag kp-tag--neu">neu</span>' : '') . '</h3><span class="muted">' . cx_h((string) ($b['webseite'] ?? '')) . ' · ' . $n . ($n === 1 ? ' Datei' : ' Dateien') . '</span></div>'
            . $msg . '<ul class="kp-files">' . $items . '</ul>'
            . '<div class="kp-actions"><a class="btn btn--sm" href="' . $base . '&amp;zip=1">Alle als ZIP</a>'
            . '<form method="post" action="' . KP_ADMIN . '?k=' . cx_h($k) . '">' . $csrf . '<input type="hidden" name="aktion" value="eingang_loeschen"><input type="hidden" name="e" value="' . cx_h($id) . '">'
            . '<label class="kp-confirm"><input type="checkbox" name="sicher" value="ja" required> Ja, endgültig löschen</label><button class="btn btn--sm btn--line" type="submit">Upload löschen</button></form></div></div>';
    }
    if ($batches === '') {
        $batches = '<p class="muted kp-leer">Noch keine Uploads.</p>';
    }
    $nUploads = count($batchList);
    $form = KP_ADMIN . '?k=' . cx_h($k);
    $hk = cx_h($k);

    // Nachrichten: erst mit „neu“ anzeigen, dann als gelesen merken.
    $msgs = kp_messages($k);
    $unread = kp_unread($msgs, 'tim');
    $doneForm = static fn(string $id, bool $done) => '<form method="post" action="' . $form . '" class="kp-m__aktion">' . $csrf
        . '<input type="hidden" name="aktion" value="erledigt"><input type="hidden" name="id" value="' . cx_h($id) . '">'
        . '<button class="btn btn--sm btn--line" type="submit">' . ($done ? 'Wieder offen' : '✓ Erledigt') . '</button></form>';
    $chat = kp_render_messages($msgs, 'tim', (string) ($a['name'] ?? $k), $doneForm);
    $chatForm = kp_message_form($form . '#nachrichten', $csrf, 'Antwort an ' . ($a['name'] ?? $k) . ' …');
    $open = kp_open_wishes($msgs);
    $wishes = '';
    foreach ($open as $m) {
        $wishes .= '<li><a href="#n-' . cx_h((string) $m['id']) . '">' . cx_h(mb_strimwidth((string) $m['text'], 0, 140, ' …')) . '</a> <em>' . date('d.m.', strtotime((string) $m['zeit']) ?: 0) . '</em></li>';
    }
    $wishes = $wishes !== '' ? '<div class="kp-wishes"><h3>Offene Wünsche (' . count($open) . ')</h3><ul>' . $wishes . '</ul></div>' : '';
    kp_mark_read($k, 'tim');

    $webLink = ($a['webseite'] ?? '') !== ''
        ? '<a href="' . cx_h(preg_match('~^https?://~i', (string) $a['webseite']) ? (string) $a['webseite'] : 'https://' . $a['webseite']) . '" target="_blank" rel="noopener noreferrer">' . $h('webseite') . '</a>' : '';
    $sub = implode(' · ', array_filter([$h('firma'), $webLink]));
    $statusChip = '<span class="kp-chip-st kp-chip-st--' . $status . '">' . $status . '</span>' . (kp_is_verein($a) ? '<span class="kp-pill kp-pill--verein">Verein · gratis</span>' : '')
        . (tf_active(tf_kunde_file($k)) ? '<span class="kp-pill kp-pill--ok">2FA</span>' : '');
    $artOpts = kp_art_options(kp_is_verein($a) ? 'verein' : 'betrieb');
    $msgSub = $unread > 0 ? '<b>' . $unread . ' neu</b>' . ($open ? ' · ' . count($open) . ' offen' : '')
        : ($open ? count($open) . (count($open) === 1 ? ' Wunsch offen' : ' Wünsche offen') : ($msgs['liste'] ? count($msgs['liste']) . ' im Verlauf' : 'noch keine'));
    $badge = $unread > 0 ? '<span class="kp-badge">' . $unread . '</span>' : '';
    $upSub = ($newUps ? '<b>' . count($newUps) . ' neu</b> · ' : '') . ($nUploads > 0 ? ($nUploads === 1 ? '1 Upload' : $nUploads . ' Uploads') . ' · ' . $used : 'noch keine');
    $upBadge = $newUps ? '<span class="kp-badge">' . count($newUps) . '</span>' : '';
    // Wie bei den Nachrichten: einmal angezeigt, gilt der Upload als gesehen.
    kp_mark_uploads_seen($k, $batchList);

    // Projektstand: dieselbe Karte, die der Kunde sieht, dazu das Formular zum Ändern.
    $phOpts = '';
    foreach (KP_PHASEN as $key => $ph) {
        $phOpts .= '<option value="' . $key . '"' . (kp_phase($a) === $key ? ' selected' : '') . '>' . cx_h($ph[0] . ' – ' . $ph[1]) . '</option>';
    }
    $phEdit = '<details class="kp-more kp-projekt__edit"><summary>Projektstand ändern</summary>'
        . '<form class="form form--small" method="post" action="' . $form . '">' . $csrf . '<input type="hidden" name="aktion" value="projekt">'
        . '<div class="form__row"><label class="form__field"><span>Schritt</span><select name="phase">' . $phOpts . '</select></label>'
        . '<label class="form__field"><span>Link zur Vorschau <em>(optional)</em></span><input type="text" name="vorschau" maxlength="300" value="' . $h('vorschau') . '" placeholder="https://neu.' . ($h('webseite') ?: 'betrieb.at') . '" autocapitalize="none" spellcheck="false"></label></div>'
        . '<label class="form__field"><span>Als Nächstes <em>(sieht der Kunde, optional)</em></span><textarea name="naechstes" rows="2" maxlength="400" placeholder="z. B. Bitte noch das Logo als Datei und 3–5 Fotos vom Geschäft hochladen.">' . $h('naechstes') . '</textarea></label>'
        . '<button class="btn" type="submit">Speichern</button></form></details>';
    $project = kp_project_card($a, false, $phEdit);

    // Auftrag: Paket, Betrag, Rechnungsstand (nur für Tim). Die Rechnung selbst entsteht im Büro-Dashboard.
    $pkOpts = '';
    foreach (AD_PAKETE as $key => $label) {
        $pkOpts .= '<option value="' . $key . '"' . (($a['paket'] ?? '') === $key ? ' selected' : '') . '>' . cx_h($label) . '</option>';
    }
    $reOpts = '';
    foreach (AD_RECHNUNG as $key => $label) {
        $reOpts .= '<option value="' . $key . '"' . (($a['rechnung'] ?? 'keine') === $key ? ' selected' : '') . '>' . cx_h($label) . '</option>';
    }
    $betrag = isset($a['betrag']) && $a['betrag'] !== null ? number_format((int) $a['betrag'] / 100, 2, ',', '.') : '';
    $auftragFacts = ad_auftrag_pills($a);
    // Bewertung: persönlicher Link, Stand der abgegebenen Bewertung
    $bwUrl = bw_url(bw_token($k));
    $bw = bw_read($k);
    $bwStand = $bw ? '<p class="kp-hint kp-hint--top">Bewertung erhalten am ' . cx_h(date('d.m.Y', strtotime((string) $bw['zeit']) ?: 0)) . ': <b class="kp-sterne">' . str_repeat('★', (int) $bw['sterne']) . '</b> „' . cx_h(mb_strimwidth((string) $bw['text'], 0, 120, ' …')) . '“ · freigeben unter <a href="/kunden/admin/#werbung">Werbung</a></p>'
        : '<p class="kp-hint kp-hint--top">Noch keine Bewertung. Am besten fragen, sobald die Seite online ist.</p>';

    kp_page($a['name'] ?? $k, <<<HTML
<div class="crumbs"><a href="/kunden/admin/">Kunden</a> / {$hk}</div>
<div class="kp-head">
  <span class="kp-ava kp-ava--gross" aria-hidden="true">{$initials($a['name'] ?? $k)}</span>
  <div>
    <h1>{$h('name')}</h1>
    <p class="kp-head__sub">{$sub}</p>
    <p class="kp-head__facts">{$statusChip}{$auftragFacts}<span>Benutzer <code>{$hk}</code></span><span>Letzte Anmeldung {$last}</span></p>
  </div>
</div>
{$zugang}
{$flash}
{$project}
<nav class="kp-tiles kp-tiles--3" data-kp-tabs data-default="nachrichten" aria-label="Bereiche">
  <a class="kp-tile" href="#nachrichten" data-kp-tab="nachrichten"><span class="kp-tile__ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5z"/></svg></span><span class="kp-tile__txt"><b>Nachrichten {$badge}</b><small>{$msgSub}</small></span></a>
  <a class="kp-tile" href="#uploads" data-kp-tab="uploads"><span class="kp-tile__ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5M4.5 15v2.5A2.5 2.5 0 0 0 7 20h10a2.5 2.5 0 0 0 2.5-2.5V15"/></svg></span><span class="kp-tile__txt"><b>Uploads {$upBadge}</b><small>{$upSub}</small></span></a>
  <a class="kp-tile" href="#zugang" data-kp-tab="zugang"><span class="kp-tile__ico"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l3 3M14 9l2 2"/></svg></span><span class="kp-tile__txt"><b>Zugang</b><small>Daten, Passwort · {$status}</small></span></a>
</nav>
<section class="kp-panel" data-kp-panel="nachrichten">
  <div class="kp-card kp-chat kp-chat--admin">
    {$wishes}
    {$chat}
    {$chatForm}
  </div>
</section>
<section class="kp-panel" data-kp-panel="uploads">
  {$batches}
</section>
<section class="kp-panel" data-kp-panel="zugang">
  <div class="kp-grid kp-grid--even">
    <form class="form form--small" method="post" action="{$form}">
      {$csrf}
      <input type="hidden" name="aktion" value="bearbeiten">
      <h2>Daten</h2>
      <label class="form__field"><span>Name</span><input type="text" name="name" required maxlength="80" value="{$h('name')}"></label>
      <div class="form__row">
        <label class="form__field"><span>Betrieb oder Verein</span><input type="text" name="firma" maxlength="120" value="{$h('firma')}"></label>
        <label class="form__field"><span>Art</span><select name="art">{$artOpts}</select></label>
      </div>
      <label class="form__field"><span>E-Mail <em>(für Willkommensmail und Benachrichtigungen)</em></span><input type="email" name="email" maxlength="254" value="{$h('email')}"></label>
      <label class="form__field"><span>Webseite</span><input type="text" name="webseite" maxlength="200" value="{$h('webseite')}"></label>
      <button class="btn btn--line" type="submit">Speichern</button>
    </form>
    <div class="form form--small">
      <h2>Zugang</h2>
      <p class="kp-hint kp-hint--top">Zugang {$status} · letzte Anmeldung {$last} · {$used} belegt</p>
      {$invite}
      <form method="post" action="{$form}" data-kp-confirm="Neues Passwort für {$hk} erzeugen? Das bisherige gilt dann sofort nicht mehr.">{$csrf}<input type="hidden" name="aktion" value="passwort"><button class="btn btn--line" type="submit">Neues Passwort erzeugen</button></form>
      {$tfInfo}
      <form method="post" action="{$form}"{$lockAsk}>{$csrf}<input type="hidden" name="aktion" value="sperren"><button class="btn btn--line" type="submit">{$lock}</button></form>
      <form method="post" action="{$form}" class="kp-danger">{$csrf}<input type="hidden" name="aktion" value="kunde_loeschen">
        <label class="form__field"><span>Kunde und alle Dateien löschen: zur Bestätigung <b class="kp-user">{$hk}</b> eintippen</span><input type="text" name="sicher" required placeholder="{$hk}" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false"></label>
        <button class="btn btn--line" type="submit">Endgültig löschen</button></form>
    </div>
  </div>
  <form class="form form--small kp-auftrag" method="post" action="{$form}">
    {$csrf}
    <input type="hidden" name="aktion" value="auftrag">
    <h2>Auftrag <em>(nur für dich)</em></h2>
    <div class="form__row">
      <label class="form__field"><span>Paket</span><select name="paket">{$pkOpts}</select></label>
      <label class="form__field"><span>Betrag in €</span><input type="text" name="betrag" maxlength="20" inputmode="decimal" value="{$betrag}" placeholder="590,00"></label>
    </div>
    <div class="form__row">
      <label class="form__field"><span>Rechnung</span><select name="rechnung">{$reOpts}</select></label>
      <label class="form__field"><span>Rechnungsnummer <em>(aus dem Büro-Dashboard)</em></span><input type="text" name="rechnung_nr" maxlength="20" value="{$h('rechnung_nr')}" placeholder="2026-001" pattern="\d{4}-\d{3}"></label>
    </div>
    <button class="btn btn--line" type="submit">Speichern</button>
  </form>
  <div class="form form--small kp-bw-kunde">
    <h2>Bewertung</h2>
    {$bwStand}
    <div class="kp-an-link"><code>{$bwUrl}</code></div>
    <div class="kp-actions">
      <form method="post" action="{$form}" data-kp-confirm="Bewertungslink als Nachricht ins Kundenportal schicken?">{$csrf}<input type="hidden" name="aktion" value="bw_link"><button class="btn" type="submit">Als Nachricht schicken</button></form>
      <button class="btn btn--line" type="button" data-kp-copy-text="{$bwUrl}">Link kopieren</button>
    </div>
  </div>
</section>
HTML, $logout);
}

// ---------------- Übersicht ----------------
// Jede Zeile ist als Ganzes ein Link in die Kundenkartei. Wer etwas Neues geschrieben oder hochgeladen hat, steht oben.
$list = [];
$sumNeu = 0;
$sumUp = 0;
$sumOffen = 0;
foreach ($all as $u => $a) {
    $u = (string) $u;
    $b = kp_batches($u);
    $first = $b ? reset($b) : null;
    $m = kp_messages($u);
    $lastM = $m['liste'] ? end($m['liste']) : null;
    $akt = max(strtotime((string) ($first['zeit'] ?? '')) ?: 0, strtotime((string) ($lastM['zeit'] ?? '')) ?: 0, strtotime((string) ($a['erstellt'] ?? '')) ?: 0);
    $neu = kp_unread($m, 'tim');
    $neuUp = count(kp_new_uploads($u, $b));
    $offen = count(kp_open_wishes($m));
    $sumNeu += $neu;
    $sumUp += $neuUp;
    $sumOffen += $offen;
    $list[] = ['u' => $u, 'a' => $a, 'uploads' => count($b), 'neu' => $neu, 'neuUp' => $neuUp, 'offen' => $offen, 'akt' => $akt, 'lastM' => $lastM];
}
usort($list, static fn($x, $y) => [$y['neu'] + $y['neuUp'], $y['offen'], $y['akt']] <=> [$x['neu'] + $x['neuUp'], $x['offen'], $x['akt']]);
$rows = '';
foreach ($list as $r) {
    $a = $r['a'];
    $aktiv = !empty($a['aktiv']);
    $sub = implode(' · ', array_filter([cx_h((string) ($a['firma'] ?? '')), cx_h((string) ($a['webseite'] ?? ''))]));
    $tags = ($r['neu'] > 0 ? '<span class="kp-badge">' . ($r['neu'] === 1 ? '1 neue Nachricht' : $r['neu'] . ' neue Nachrichten') . '</span>' : '')
        . ($r['neuUp'] > 0 ? '<span class="kp-badge">' . ($r['neuUp'] === 1 ? '1 neuer Upload' : $r['neuUp'] . ' neue Uploads') . '</span>' : '')
        . ($r['offen'] > 0 ? '<span class="kp-pill kp-pill--hot">' . $r['offen'] . ($r['offen'] === 1 ? ' Wunsch offen' : ' Wünsche offen') . '</span>' : '')
        . (kp_is_verein($a) ? '<span class="kp-pill kp-pill--verein">Verein</span>' : '')
        . ad_auftrag_pills($a)
        . '<span class="kp-pill kp-pill--phase' . (kp_phase($a) === 'online' ? ' kp-pill--ok' : '') . '">' . cx_h(KP_PHASEN[kp_phase($a)][0]) . '</span>'
        . '<span class="kp-pill">' . ($r['uploads'] === 1 ? '1 Upload' : $r['uploads'] . ' Uploads') . '</span>'
        . (!$aktiv ? '<span class="kp-pill kp-pill--aus">gesperrt</span>' : '');
    $when = $r['akt'] ? date('d.m.Y', $r['akt']) : '–';
    $lm = $r['lastM'];
    $lastTxt = $lm ? '<small class="kp-row__last">' . (($lm['von'] ?? '') === 'tim' ? 'Du' : cx_h((string) ($a['name'] ?? $r['u']))) . ', ' . date('d.m.', strtotime((string) $lm['zeit']) ?: 0) . ': „' . cx_h(mb_strimwidth((string) ($lm['text'] ?? ''), 0, 90, ' …')) . '“</small>' : '';
    $rows .= '<li><a class="kp-row' . ($r['neu'] + $r['neuUp'] > 0 ? ' is-new' : '') . '" href="/kunden/admin/?k=' . rawurlencode($r['u']) . '">'
        . '<span class="kp-ava" aria-hidden="true">' . $initials((string) ($a['name'] ?? $r['u'])) . '</span>'
        . '<span class="kp-row__main"><b>' . cx_h((string) ($a['name'] ?? $r['u'])) . '</b><small>' . ($sub !== '' ? $sub . ' · ' : '') . '<code>' . cx_h($r['u']) . '</code></small>' . $lastTxt . '</span>'
        . '<span class="kp-row__tags">' . $tags . '</span>'
        . '<span class="kp-row__when">' . $when . '</span>'
        . '<span class="kp-row__go" aria-hidden="true">›</span></a></li>';
}

$table = $rows === '' ? '<p class="muted kp-leer">Noch keine Kunden angelegt.</p>' : '<ul class="kp-rows">' . $rows . '</ul>';
// Kurzer Überblick über alle Kunden: in Arbeit, online, offene Rechnungen (Stand, den du in der Kundenkartei unter „Auftrag“ pflegst).
$kOnline = count(array_filter($list, static fn($r) => kp_phase($r['a']) === 'online'));
$kOffen = array_filter($list, static fn($r) => ($r['a']['rechnung'] ?? '') === 'offen');
$kOffenSum = array_sum(array_map(static fn($r) => (int) ($r['a']['betrag'] ?? 0), $kOffen));
$kAuftrag = array_sum(array_map(static fn($r) => (int) ($r['a']['betrag'] ?? 0), $list));
$kKpis = !$list ? '' : '<div class="kp-bz__kpis kp-kpis">'
    . '<div class="kp-card"><small>In Arbeit</small><b>' . (count($list) - $kOnline) . '</b><span>von ' . count($list) . ' Kunden</span></div>'
    . '<div class="kp-card"><small>Online</small><b>' . $kOnline . '</b><span>fertig</span></div>'
    . '<div class="kp-card' . ($kOffen ? ' kp-card--hot' : '') . '"><small>Rechnung offen</small><b>' . count($kOffen) . '</b><span>' . af_euro($kOffenSum) . '</span></div>'
    . '<div class="kp-card"><small>Auftragswert</small><b>' . cx_h(number_format($kAuftrag / 100, 0, ',', '.')) . ' €</b><span>alle Kunden</span></div></div>';

// Alle Anfragen an einem Ort: Formular, Rückruf, Verein, Gründer und Gratis-Entwurf, mit Filter nach Status.
$afAlle = af_all();
$afFilter = ['alle' => 'Alle', 'neu' => 'Neu', 'offen' => 'In Arbeit', 'kunde' => 'Kunde', 'abgesagt' => 'Abgesagt', 'unbestaetigt' => 'Unbestätigt'];
$afSt = (string) ($_GET['st'] ?? 'alle');
$afSt = isset($afFilter[$afSt]) ? $afSt : 'alle';
$afGruppe = static fn(string $st): string => $st === 'neu' ? 'neu' : ($st === 'kunde' ? 'kunde' : (in_array($st, ['abgesagt', 'erledigt'], true) ? 'abgesagt' : 'offen'));
$afZahl = array_fill_keys(array_keys($afFilter), 0);
$ewRows = '';
$ewNeu = 0;
// Entwurf-Links der Anfragen (Stand „geöffnet“, Antwort „Passt“), einmal gelesen für Liste und „Heute zu tun“.
$afAnsicht = [];
foreach ($afAlle as $key => $d) {
    if (($d['ansicht'] ?? '') !== '' && ($an = an_read((string) $d['ansicht']))) {
        $afAnsicht[$key] = $an;
    }
}
foreach ($afAlle as $key => $d) {
    $st = (string) ($d['status'] ?? 'neu');
    $gr = af_versteckt($d) ? 'unbestaetigt' : $afGruppe($st);
    if ($gr !== 'unbestaetigt') {
        $afZahl['alle']++;
        $ewNeu += $st === 'neu' ? 1 : 0;
    }
    $afZahl[$gr]++;
    if (($afSt !== 'alle' || $gr === 'unbestaetigt') && $afSt !== $gr) {
        continue;
    }
    $art = (string) ($d['art'] ?? 'anfrage');
    $fe = (array) ($d['felder'] ?? []);
    $titel = (string) (($d['firma'] ?? '') !== '' ? $d['firma'] : ($d['name'] ?? ''));
    $info = $art === 'entwurf' ? [(string) ($d['ort'] ?? ''), (string) ($d['branche'] ?? '')]
        : [$titel !== ($d['name'] ?? '') ? (string) ($d['name'] ?? '') : '', (string) ($fe['Paket'] ?? ''), $art === 'rueckruf' ? (string) ($fe['Telefon'] ?? '') . (($fe['Erreichbar'] ?? '') !== '' ? ' · ' . $fe['Erreichbar'] : '') : ''];
    $info[] = 'über ' . af_quelle_name(af_quelle((string) ($d['quelle'] ?? '')));
    $sub = implode(' · ', array_map('cx_h', array_filter($info)));
    $label = $art === 'entwurf' ? (EW_STATUS[$st] ?? $st) : (AF_STATUS[$st] ?? $st);
    $nf = (string) ($d['nachfassen'] ?? '');
    $an = $afAnsicht[$key] ?? [];
    $tags = '<span class="kp-pill kp-pill--art kp-pill--' . cx_h($art) . '">' . cx_h(AF_ARTEN[$art] ?? 'Anfrage') . '</span>'
        . (($d['optin'] ?? '') === 'offen' ? '<span class="kp-pill kp-pill--aus">nicht bestätigt</span>' : '')
        . ($nf !== '' && !in_array($st, ['kunde', 'abgesagt', 'erledigt'], true) ? '<span class="kp-pill' . ($nf <= date('Y-m-d') ? ' kp-pill--hot' : '') . '">Nachfassen ' . cx_h(date('d.m.', strtotime($nf) ?: 0)) . '</span>' : '')
        . ($an ? '<span class="kp-pill' . ((int) ($an['aufrufe'] ?? 0) > 0 ? ' kp-pill--ok' : '') . '">' . (($an['antwort'] ?? '') === 'ja' ? 'Entwurf: Passt!' : ((int) ($an['aufrufe'] ?? 0) > 0 ? 'Entwurf geöffnet' : 'Entwurf-Link offen')) . '</span>' : '')
        . '<span class="kp-pill' . ($st === 'neu' ? ' kp-pill--hot' : ($st === 'kunde' ? ' kp-pill--paket' : '')) . '">' . cx_h($label) . '</span>';
    $ewRows .= '<li><a class="kp-row' . ($st === 'neu' ? ' is-new' : '') . '" href="/kunden/admin/' . cx_h($d['link']) . '">'
        . '<span class="kp-ava kp-ava--ew" aria-hidden="true">' . $initials($titel) . '</span>'
        . '<span class="kp-row__main"><b>' . cx_h($titel) . '</b><small>' . $sub . '</small></span>'
        . '<span class="kp-row__tags">' . $tags . '</span>'
        . '<span class="kp-row__when">' . cx_h(date('d.m.Y', strtotime((string) $d['zeit']) ?: 0)) . '</span>'
        . '<span class="kp-row__go" aria-hidden="true">›</span></a></li>';
}
$afPills = '';
foreach ($afFilter as $key => $t) {
    if ($key === 'unbestaetigt' && $afZahl[$key] === 0) {
        continue;
    }
    $afPills .= '<a class="kp-pill' . ($key === $afSt ? ' kp-pill--hot' : '') . '" href="/kunden/admin/' . ($key === 'alle' ? '' : '?st=' . $key) . '#anfragen"' . ($key === $afSt ? ' aria-current="true"' : '') . '>' . $t . ' <b>' . $afZahl[$key] . '</b></a>';
}
$ewTable = $ewRows === '' ? '<p class="muted kp-leer">' . ($afZahl['alle'] === 0 ? 'Noch keine Anfragen. Hier landen das Anfrageformular, Rückruf-Wünsche, Vereins- und Gründer-Anfragen und die Gratis-Entwürfe von <a href="/entwurf/">/entwurf/</a>.' : 'Keine Anfragen mit diesem Status.') . '</p>' : '<ul class="kp-rows">' . $ewRows . '</ul>';
if ($afSt === 'unbestaetigt') {
    $ewTable = '<p class="kp-hint kp-hint--top kp-unb">Neue Anfragen, deren E-Mail-Adresse nach ' . AF_OPTIN_TAGE . ' Tagen noch nicht bestätigt ist (meist Spam oder ein Tippfehler in der Adresse). Sie zählen nirgends mit. Sobald du einen Status setzt, erscheinen sie wieder normal.</p>' . $ewTable;
}

// Kosten pro Anfrage: Anfragen und Kunden je Quelle, geteilt durch die Werbekosten, die du einträgst.
$afKosten = af_kosten();
$afQ = [];
foreach ($afAlle as $d) {
    if (af_versteckt($d)) {
        continue;
    }
    $q = af_quelle((string) ($d['quelle'] ?? ''));
    $afQ[$q] ??= ['n' => 0, 'kunde' => 0];
    $afQ[$q]['n']++;
    $afQ[$q]['kunde'] += ($d['status'] ?? '') === 'kunde' ? 1 : 0;
}
foreach (array_keys($afKosten) as $q) {
    $afQ[$q] ??= ['n' => 0, 'kunde' => 0];
}
uksort($afQ, static fn($x, $y) => [isset($afKosten[$y]), $afQ[$y]['n']] <=> [isset($afKosten[$x]), $afQ[$x]['n']] ?: strcmp($x, $y));
$kRows = '';
$kSumme = 0;
$kSummeN = 0;
foreach ($afQ as $q => $z) {
    $cent = $afKosten[$q] ?? null;
    $kSumme += (int) $cent;
    $kSummeN += $cent !== null ? $z['n'] : 0;
    $pro = $cent === null ? '–' : ($z['n'] > 0 ? af_euro((int) round($cent / $z['n'])) : '–');
    $proK = $cent === null || $z['kunde'] === 0 ? '–' : af_euro((int) round($cent / $z['kunde']));
    $kRows .= '<tr><td>' . cx_h(af_quelle_name($q)) . '</td><td>' . $z['n'] . '</td><td>' . $z['kunde'] . '</td><td>' . ($cent === null ? '–' : af_euro($cent)) . '</td><td>' . ($cent !== null && $z['n'] > 0 ? '<b>' . $pro . '</b>' : $pro) . '</td><td>' . $proK . '</td></tr>';
}
$kGesamt = $kSumme > 0 ? '<p class="kp-hint">Werbung gesamt ' . af_euro($kSumme) . ' für ' . $kSummeN . ($kSummeN === 1 ? ' Anfrage' : ' Anfragen') . ($kSummeN > 0 ? ', im Schnitt <b>' . af_euro((int) round($kSumme / $kSummeN)) . '</b> pro Anfrage' : '') . '.</p>' : '';
$kInputs = '';
foreach (array_unique(array_merge(array_keys($afKosten), AF_QUELLEN_VORSCHLAG, array_keys($afQ))) as $q) {
    if ($q === 'direkt') {
        continue;
    }
    $val = isset($afKosten[$q]) ? number_format($afKosten[$q] / 100, 2, ',', '.') : '';
    $kInputs .= '<label class="form__field"><span>' . cx_h(af_quelle_name($q)) . '</span><input type="text" name="kosten[' . cx_h($q) . ']" value="' . $val . '" inputmode="decimal" maxlength="20" placeholder="0,00"></label>';
}
// Laufende Kosten im letzten Monat (Claude-Abo usw. plus KI-Chat), geteilt durch die Anfragen der letzten 30 Tage.
$lauf = af_betrieb();
$ch30 = ch_range(30);
$chEuro = (int) round($ch30['usd'] * AF_USD_EUR * 100);
$lRows = '';
$lSumme = $chEuro;
foreach ($lauf as $name => $cent) {
    $lSumme += (int) $cent;
    $lRows .= '<tr><td>' . cx_h((string) $name) . '</td><td>' . ($cent === null ? 'noch eintragen' : af_euro((int) $cent)) . '</td></tr>';
}
$lRows .= '<tr><td>KI-Chat auf der Seite <em>(automatisch, letzte 30 Tage)</em></td><td>ca. ' . af_euro($chEuro) . '</td></tr>';
$an30 = count(array_filter($afAlle, static fn($d) => !af_versteckt($d) && (strtotime((string) ($d['zeit'] ?? '')) ?: 0) >= time() - 30 * 86400));
$lPro = $an30 > 0 ? 'Bei ' . $an30 . ($an30 === 1 ? ' Anfrage' : ' Anfragen') . ' in den letzten 30 Tagen sind das <b>' . af_euro((int) round($lSumme / $an30)) . '</b> pro Anfrage, zusätzlich zur Werbung.' : 'In den letzten 30 Tagen kam noch keine Anfrage.';
$lInputs = '';
foreach ($lauf as $name => $cent) {
    $lInputs .= '<label class="form__field"><span>' . cx_h((string) $name) . ' <em>(€ pro Monat)</em></span><input type="text" name="laufend[' . cx_h((string) $name) . ']" value="' . ($cent === null ? '' : number_format((int) $cent / 100, 2, ',', '.')) . '" inputmode="decimal" maxlength="20" placeholder="0,00"></label>';
}
$lTabelle = '<h4 class="kp-chat-h">Laufende Kosten <em>(keine Werbung, pro Monat)</em></h4><div class="kp-table kp-kosten"><table><tbody>' . $lRows
    . '<tr><th>Summe pro Monat</th><th>' . af_euro($lSumme) . '</th></tr></tbody></table></div><p class="kp-hint">' . $lPro . '</p>';
$kTabelle = $afQ ? '<div class="kp-table kp-kosten"><table><thead><tr><th>Quelle</th><th>Anfragen</th><th>Kunden</th><th>Kosten</th><th>€/Anfrage</th><th>€/Kunde</th></tr></thead><tbody>' . $kRows . '</tbody></table></div>' : '<p class="kp-hint">Noch keine Anfragen mit Quelle.</p>';
$kostenCard = <<<HTML
<div class="kp-card kp-kosten-card" id="kosten">
  <h3>Kosten pro Anfrage</h3>
  {$kTabelle}
  {$kGesamt}
  {$lTabelle}
  <details class="kp-info"><summary>Kosten eintragen</summary>
    <form class="form form--small" method="post" action="/kunden/admin/">
      {$csrf}
      <input type="hidden" name="aktion" value="kosten">
      <h4 class="kp-chat-h">Werbung <em>(Summe bisher je Quelle)</em></h4>
      <p class="kp-hint">Trag ein, was die Quelle bisher insgesamt gekostet hat (z. B. Google Ads laut Abrechnung, willhaben-Rechnung, Druck der Flyer). Leeres Feld = keine Kosten. Gezählt werden die Anfragen der letzten 12 Monate. Die Quelle kommt aus dem Link (utm_source, Google-Anzeige über gclid) oder der Seite, von der jemand kam.</p>
      <div class="kp-kosten-felder">{$kInputs}</div>
      <div class="form__row">
        <label class="form__field"><span>Weitere Quelle <em>(wie utm_source)</em></span><input type="text" name="neu_quelle" maxlength="40" placeholder="z. B. gemeindezeitung" autocapitalize="none" spellcheck="false"></label>
        <label class="form__field"><span>Kosten in €</span><input type="text" name="neu_betrag" maxlength="20" inputmode="decimal" placeholder="0,00"></label>
      </div>
      <h4 class="kp-chat-h">Laufende Kosten <em>(€ pro Monat, z. B. Claude-Abo)</em></h4>
      <div class="kp-kosten-felder">{$lInputs}</div>
      <div class="form__row">
        <label class="form__field"><span>Weitere laufende Kosten</span><input type="text" name="neu_laufend" maxlength="40" placeholder="z. B. Webspace"></label>
        <label class="form__field"><span>€ pro Monat</span><input type="text" name="neu_laufend_betrag" maxlength="20" inputmode="decimal" placeholder="0,00"></label>
      </div>
      <button class="btn btn--line" type="submit">Speichern</button>
    </form>
  </details>
</div>
HTML;
$tfHint = tf_active() ? '' : '<a class="kp-neu" href="/kunden/admin/?sicherheit"><b>●</b> Zwei-Faktor-Anmeldung ist noch nicht eingerichtet. Jetzt mit Google Authenticator absichern →</a>';
$ewBadge = $ewNeu > 0 ? '<span class="kp-badge">' . $ewNeu . '</span>' : '';
$kBadge = $sumNeu + $sumUp > 0 ? '<span class="kp-badge">' . ($sumNeu + $sumUp) . '</span>' : '';
$nK = count($list);
$kSub = ($nK === 1 ? '1 Kunde' : $nK . ' Kunden') . ($sumNeu > 0 ? ' · <b>' . $sumNeu . ($sumNeu === 1 ? ' neue Nachricht' : ' neue Nachrichten') . '</b>' : '') . ($sumUp > 0 ? ' · <b>' . $sumUp . ($sumUp === 1 ? ' neuer Upload' : ' neue Uploads') . '</b>' : '') . ($sumOffen > 0 ? ' · ' . $sumOffen . ($sumOffen === 1 ? ' Wunsch offen' : ' Wünsche offen') : '');
$ewSub = $ewNeu > 0 ? '<b>' . ($ewNeu === 1 ? '1 neue Anfrage' : $ewNeu . ' neue Anfragen') . '</b>' : 'Formular, Rückruf, Entwürfe';
$neuOpen = $nK === 0 ? ' open' : '';
$artNeu = kp_art_options('betrieb');

// Besucher: anonyme Tagessummen aus /api/zaehler.php, dazu die Gratis-Entwurf-Anfragen im selben Zeitraum.
$zeit = (int) ($_GET['zeit'] ?? 30);
$zeit = in_array($zeit, [1, 7, 30, 90], true) ? $zeit : 30;
$bz = zl_range($zeit);
// Heute und gestern getrennt, damit man auf einen Blick sieht, woher die Besucher heute kommen.
$bzIst1 = $zeit === 1;
$bzT = $bzIst1 ? $bz : zl_range(1);
$bzG = zl_range(2)['tage'];
$bzGestern = reset($bzG) ?: ['besuche' => 0, 'aufrufe' => 0];
$bzZeitTxt = $bzIst1 ? 'heute' : 'letzte ' . $zeit . ' Tage';
$bzLabel = static function (string $q): string {
    $fest = ['google-anzeige' => 'Google-Anzeige', 'google (suche)' => 'Google-Suche', 'direkt' => 'Direkt',
        'chatgpt' => 'ChatGPT', 'perplexity' => 'Perplexity', 'gemini' => 'Gemini', 'claude' => 'Claude', 'x' => 'X (Twitter)', 'andere' => 'Andere'];
    if (isset($fest[$q])) {
        return $fest[$q];
    }
    return strpos($q, '.') !== false ? $q : ucfirst($q);
};
$bzList = static function (array $map, callable $label, string $leer, int $max = 12): string {
    if (!$map) {
        return '<p class="muted kp-leer">' . $leer . '</p>';
    }
    $top = max(1, (int) reset($map));
    $out = '';
    foreach (array_slice($map, 0, $max, true) as $k => $n) {
        $out .= '<li><span class="kp-bz__name">' . cx_h($label((string) $k)) . '</span><span class="kp-bz__bar"><i style="width:' . max(2, (int) round($n / $top * 100)) . '%"></i></span><b>' . (int) $n . '</b></li>';
    }
    $rest = count($map) - $max;
    return '<ul class="kp-bz__list">' . $out . '</ul>' . ($rest > 0 ? '<p class="kp-hint">… und ' . $rest . ' weitere</p>' : '');
};
$bzSeite = static fn(string $p): string => $p === '/' ? 'Startseite' : rtrim($p, '/');
// Die drei stärksten Quellen von heute als kurze Zeile, z. B. „Instagram 3 · Google-Suche 2 · Direkt 1“.
$bzWoher = [];
foreach (array_slice($bzT['quellen'], 0, 3, true) as $q => $n) {
    $bzWoher[] = '<i>' . cx_h($bzLabel((string) $q)) . ' ' . (int) $n . '</i>';
}
$bzWoherHtml = $bzWoher ? implode(' · ', $bzWoher) : 'noch kein Besuch';
$bzKamp = static function (string $k) use ($bzLabel): string {
    [$q, $c] = array_pad(explode(' / ', $k, 2), 2, '');
    return $bzLabel($q) . ' · ' . $c;
};
// Gratis-Entwurf-Anfragen im Zeitraum (für die Kontaktaufnahmen) und alle Anfragen nach Quelle.
$bzAnf = [];
$bzAnfQ = [];
$bzCheck = 0;
$bzForm = 0;
$bzVon = (new DateTimeImmutable('today'))->modify('-' . ($zeit - 1) . ' days')->getTimestamp();
foreach ($afAlle as $d) {
    if (!af_versteckt($d) && (strtotime((string) ($d['zeit'] ?? '')) ?: 0) >= $bzVon) {
        $q = af_quelle_name(af_quelle((string) ($d['quelle'] ?? '')));
        $bzAnfQ[$q] = ($bzAnfQ[$q] ?? 0) + 1;
        if ($d['art'] === 'entwurf') {
            $bzAnf[$q] = ($bzAnf[$q] ?? 0) + 1;
        } elseif ($d['art'] === 'check') {
            $bzCheck++;
        } elseif (in_array($d['art'], ['anfrage', 'gruender', 'verein'], true)) {
            // Formular-Anfragen zählt der Besucherzähler selbst nicht mit (nur Rückrufe), daher hier aus den gespeicherten Anfragen.
            $bzForm++;
        }
    }
}
arsort($bzAnfQ);
arsort($bzAnf);
$bzAnfSum = array_sum($bzAnf);
// Tageskurve im Feine-Linien-Look: Haarlinie, gestrichelter Schnitt, Abschnitte über dem Schnitt orange,
// hohle Punkte an Tagen mit Besuchen über einen Werbelink (utm_campaign), die stärksten bekommen ein Schild.
$bzWerte = array_column($bz['tage'], 'besuche');
$bzN = count($bzWerte);
$bzMax = max(4, ...$bzWerte);
$bzMax = (int) (ceil($bzMax * 1.15 / 4) * 4);
$bzAvg = $bzN ? array_sum($bzWerte) / $bzN : 0;
$bzX = static fn(int $i): float => $bzN > 1 ? round($i / ($bzN - 1) * 100, 3) : 50;
$bzY = static fn(float $v): float => round(100 - $v / $bzMax * 100, 3);
$bzPts = [];
foreach ($bzWerte as $i => $v) {
    $bzPts[] = $bzX($i) . ',' . $bzY($v);
}
$bzHot = '';
for ($i = 1; $i < $bzN; $i++) {
    if ($bzWerte[$i] > $bzAvg && $bzWerte[$i - 1] > $bzAvg) {
        $bzHot .= 'M' . $bzPts[$i - 1] . 'L' . $bzPts[$i];
    }
}
$bzGrid = '';
foreach ([1, 2, 3, 4] as $q) {
    $bzGrid .= '<line x1="0" x2="100" y1="' . (100 - $q * 25) . '" y2="' . (100 - $q * 25) . '"/>';
}
$bzSkala = '';
foreach ([1, 2, 3, 4] as $q) {
    $bzSkala .= '<span style="top:' . (100 - $q * 25) . '%">' . (int) ($bzMax * $q / 4) . '</span>';
}
$bzMarken = '';
$bzK = array_filter(array_map(static fn(array $t): int => $t['kampagne_n'], array_values($bz['tage'])));
arsort($bzK);
// Schilder für die stärksten Werbelink-Tage, aber nie zu nah beieinander (sonst überlappen sie);
// am Handy nur zwei, die weit genug auseinander liegen.
$bzSchild = [];
$bzTopSchild = [];
foreach (array_keys($bzK) as $j) {
    $ok = count($bzSchild) < 5;
    foreach ($bzSchild as $a) {
        $ok = $ok && abs($bzX($j) - $bzX($a)) >= 9;
    }
    if ($ok) {
        $bzSchild[] = $j;
        if (count($bzTopSchild) < 2 && (!$bzTopSchild || abs($bzX($j) - $bzX($bzTopSchild[0])) >= 28)) {
            $bzTopSchild[] = $j;
        }
    }
}
$i = 0;
foreach ($bz['tage'] as $day => $t) {
    $lbl = date('d.m.', strtotime($day) ?: 0);
    $tip = $lbl . ': ' . $t['besuche'] . ' Besuche, ' . $t['aufrufe'] . ' Aufrufe';
    if ($t['kampagne_n'] > 0) {
        $c = $bzKamp($t['kampagne']);
        $tip .= ' · ' . $t['kampagne_n'] . ' über ' . $c;
        $name = trim((string) (explode(' / ', $t['kampagne'], 2)[1] ?? $t['kampagne']));
        $schild = in_array($i, $bzSchild, true) ? '<em>' . cx_h(mb_strimwidth($name, 0, 18, '…')) . '</em>' : '';
        $bzMarken .= '<span class="kp-bz__mark' . (in_array($i, $bzTopSchild, true) ? ' kp-bz__mark--top' : '') . '" style="left:' . $bzX($i) . '%;top:' . $bzY($t['besuche']) . '%" title="' . cx_h($tip) . '">' . $schild . '</span>';
    }
    $bzMarken .= '<span class="kp-bz__hit" style="left:' . $bzX($i) . '%" title="' . cx_h($tip) . '"></span>';
    $i++;
}
$bzLast = $bzN ? end($bzPts) : '0,100';
$bzAvgY = $bzY($bzAvg);
$bzAvgTxt = number_format($bzAvg, 1, ',', '');
$bzLine = '<div class="kp-bz__plot"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'
    . '<g class="kp-bz__grid-l">' . $bzGrid . '</g>'
    . '<polygon class="kp-bz__fill" points="0,100 ' . implode(' ', $bzPts) . ' 100,100"/>'
    . '<line class="kp-bz__avg" x1="0" x2="100" y1="' . $bzAvgY . '" y2="' . $bzAvgY . '"/>'
    . '<polyline class="kp-bz__line" points="' . implode(' ', $bzPts) . '"/>'
    . ($bzHot !== '' ? '<path class="kp-bz__hot" d="' . $bzHot . '"/>' : '')
    . '</svg><span class="kp-bz__avgl" style="top:' . $bzAvgY . '%">Ø ' . $bzAvgTxt . ' pro Tag</span>'
    . '<span class="kp-bz__now" style="left:' . explode(',', $bzLast)[0] . '%;top:' . explode(',', $bzLast)[1] . '%"></span>'
    . $bzMarken . '<div class="kp-bz__skala">' . $bzSkala . '</div></div>';
$bzFirst = date('d.m.', strtotime((string) array_key_first($bz['tage'])) ?: 0);
$bzZeiten = '';
foreach ([1 => 'Heute', 7 => '7 Tage', 30 => '30 Tage', 90 => '90 Tage'] as $z => $t) {
    $bzZeiten .= '<a class="kp-pill' . ($z === $zeit ? ' kp-pill--hot' : '') . '" href="/kunden/admin/?zeit=' . $z . '#besucher"' . ($z === $zeit ? ' aria-current="true"' : '') . '>' . $t . '</a>';
}
$bzAus = isset($_COOKIE[ZL_NOCOUNT]);
$bzSeit = $bz['seit'] !== '' ? 'Gezählt wird seit ' . date('d.m.Y', strtotime($bz['seit']) ?: 0) . '. ' : 'Noch keine Zahlen: Die Zählung beginnt mit dem ersten Besuch nach dem Hochladen. ';
$bzGeraet = '<form method="post" action="/kunden/admin/?zeit=' . $zeit . '" class="kp-bz__geraet">' . $csrf . '<input type="hidden" name="aktion" value="zaehlen"><input type="hidden" name="wert" value="' . ($bzAus ? 'ein' : 'aus') . '">'
    . '<span>' . ($bzAus ? '<b>Dieses Gerät wird nicht mitgezählt.</b>' : 'Dieses Gerät wird mitgezählt.') . '</span>'
    . '<button class="btn btn--line" type="submit">' . ($bzAus ? 'Wieder mitzählen' : 'Dieses Gerät nicht mitzählen') . '</button></form>';
$bzTop = (string) (array_key_first($bzT['quellen']) ?? '');
$bzSub = 'heute <b>' . $bzT['besuche'] . '</b>' . ($bzTop !== '' ? ' (meist ' . cx_h($bzLabel($bzTop)) . ')' : '') . ($bzIst1 ? '' : ' · ' . $zeit . ' Tage ' . $bz['besuche']);
$bzQuellen = $bzList($bz['quellen'], $bzLabel, 'Noch keine Besuche im Zeitraum.');
$bzKampagnen = $bzList($bz['kampagnen'], $bzKamp, 'Noch keine Besuche über Links mit utm_campaign.');
$bzEinstieg = $bzList($bz['einstieg'], $bzSeite, 'Noch keine Besuche im Zeitraum.');
$bzSeiten = $bzList($bz['seiten'], $bzSeite, 'Noch keine Aufrufe im Zeitraum.');
$bzAnfragen = $bzList($bzAnfQ, static fn(string $q): string => $q, 'Keine Anfragen im Zeitraum.');
// Kontaktaufnahmen: Klicks auf WhatsApp/Telegram/Telefon/E-Mail, abgeschickte Anfragen und Rückruf-Wünsche, dazu die Entwürfe.
$bzKontakt = $bz['kontakte'];
if ($bzAnfSum > 0) {
    $bzKontakt['entwurf'] = $bzAnfSum;
}
// Webseiten-Checks (/check/) zählen wie Gratis-Entwürfe als Kontaktaufnahme.
if ($bzCheck > 0) {
    $bzKontakt['check'] = $bzCheck;
}
if ($bzForm > 0) {
    $bzKontakt['formular'] = (int) ($bzKontakt['formular'] ?? 0) + $bzForm;
}
arsort($bzKontakt);
$bzKontaktSum = array_sum($bzKontakt);
$bzKontaktName = static fn(string $k): string => [
    'whatsapp' => 'WhatsApp geöffnet', 'telegram' => 'Telegram geöffnet', 'telefon' => 'Nummer angetippt', 'email' => 'E-Mail geöffnet',
    'formular' => 'Anfrage abgeschickt', 'rueckruf' => 'Rückruf-Wunsch', 'entwurf' => 'Gratis-Entwurf angefragt', 'check' => 'Webseiten-Check angefragt',
][$k] ?? ucfirst($k);
$bzKontakte = $bzList($bzKontakt, $bzKontaktName, 'Noch keine Kontaktaufnahmen im Zeitraum. Gezählt werden Klicks auf WhatsApp, Telegram, Telefon und E-Mail sowie abgeschickte Formulare, Gratis-Entwürfe und Webseiten-Checks.');
$bzQuote = $bz['besuche'] > 0 && $bzKontaktSum > 0 ? number_format($bzKontaktSum / $bz['besuche'] * 100, 1, ',', '') . ' % der Besuche' : 'im Zeitraum';
// KI-Chat: Fragen und geschätzte Kosten im Zeitraum (Inhalte werden nicht gespeichert).
$ch = ch_range($zeit);
$chKosten = number_format($ch['usd'], 2, ',', '.');
$chFehler = $ch['fehler'] > 0 ? ' · ' . $ch['fehler'] . ' × keine Antwort (feste Antwort gezeigt)' : '';
$chStatus = ch_ready()
    ? '<p class="kp-hint">Eingetippte Fragen beantwortet Claude (' . cx_h(ch_cfg()['model']) . '). Grenze: ' . ch_cfg()['pro_stunde'] . ' Fragen pro Stunde und ' . ch_cfg()['pro_tag'] . ' pro Tag je Besucher, ' . ch_cfg()['tageslimit'] . ' pro Tag insgesamt. Die Fragen werden ohne IP-Adresse und ohne Antworten 30 Tage gespeichert, E-Mail-Adressen, Telefonnummern und Links werden vorher entfernt.</p>'
    : '<p class="kp-hint">KI ist aus: In api/_data/config.php fehlt <code>anthropic_api_key</code> (oder <code>chat_aus</code> ist gesetzt). Der Chat antwortet dann nur mit den festen Antworten.</p>';
// Gemerkte Fragen (höchstens 30 Tage, ohne IP und Antwort); die ersten 8 sichtbar, der Rest aufklappbar.
$chZeile = static fn(array $e): string => '<li><time>' . date('d.m. H:i', (int) $e['t']) . '</time> ' . cx_h((string) ($e['f'] ?? ''))
    . (empty($e['ok']) ? ' <em>(feste Antwort)</em>' : '') . '</li>';
$chListe = ch_fragen($zeit);
$chFragen = $chListe
    ? '<ul class="kp-chat-fragen">' . implode('', array_map($chZeile, array_slice($chListe, 0, 8))) . '</ul>'
        . (count($chListe) > 8 ? '<details class="kp-chat-mehr"><summary>Alle ' . count($chListe) . ' Fragen</summary><ul class="kp-chat-fragen">' . implode('', array_map($chZeile, array_slice($chListe, 8))) . '</ul></details>' : '')
    : '<p class="kp-hint">Noch keine eingetippten Fragen im Zeitraum.</p>';
$chTage = min($zeit, CH_FRAGEN_TAGE);
$chZeit = $bzIst1 ? 'heute' : 'in ' . $zeit . ' Tagen, heute ' . $ch['heute'];
$chTageTxt = $chTage === 1 ? 'heute' : 'letzte ' . $chTage . ' Tage';
// Erklärung eingeklappt; ist die KI aus, bleibt der Hinweis sichtbar.
$chInfo = ch_ready() ? '<details class="kp-info"><summary>So arbeitet der KI-Chat</summary>' . $chStatus . '</details>' : $chStatus;
$chCard = <<<HTML
<div class="kp-card"><h3>KI-Chat</h3><p><b>{$ch['fragen']}</b> Fragen {$chZeit} · Kosten ca. {$chKosten} US-Dollar{$chFehler}</p>
<h4 class="kp-chat-h">Gestellte Fragen <em>({$chTageTxt})</em></h4>{$chFragen}{$chInfo}</div>
HTML;
// Bei „Heute“ statt Kurve (nur ein Punkt) der Vergleich mit gestern; sonst zeigt die Heute-Kachel die stärksten Quellen.
$bzKpi3 = $bzIst1
    ? '<div class="kp-card"><small>Gestern</small><b>' . (int) $bzGestern['besuche'] . '</b><span>' . (int) $bzGestern['aufrufe'] . ' Aufrufe</span></div>'
    : '<div class="kp-card"><small>Heute</small><b>' . (int) $bzT['besuche'] . '</b><span class="kp-bz__woher">' . $bzWoherHtml . '</span></div>';
$bzChart = $bzIst1 ? '' : <<<HTML
<div class="kp-card kp-bz__chart"><div class="kp-bz__fein" role="img" aria-label="Besuche pro Tag, letzte {$zeit} Tage, Schnitt {$bzAvgTxt} pro Tag">{$bzLine}</div><div class="kp-bz__axis"><span>{$bzFirst}</span><span>heute</span></div><div class="kp-bz__legende"><span><i class="kp-bz__l-avg"></i>Schnitt</span><span><i class="kp-bz__l-hot"></i>über Schnitt</span><span><i class="kp-bz__l-mark"></i>Besuche über einen Werbelink</span></div></div>
HTML;
$bzWoherH = $bzIst1 ? 'Woher die Besucher heute kommen' : 'Woher die Besucher kommen';
$bzPanel = <<<HTML
<div class="kp-bz__head"><h2>Besucher</h2><nav class="kp-bz__zeit" aria-label="Zeitraum">{$bzZeiten}</nav></div>
<div class="kp-bz__kpis">
  <div class="kp-card"><small>Besuche von außen</small><b>{$bz['besuche']}</b><span>{$bzZeitTxt}</span></div>
  <div class="kp-card"><small>Seitenaufrufe</small><b>{$bz['aufrufe']}</b><span>inkl. Weiterklicken</span></div>
  {$bzKpi3}
  <div class="kp-card"><small>Kontaktaufnahmen</small><b>{$bzKontaktSum}</b><span>{$bzQuote}</span></div>
</div>
{$bzChart}
<div class="kp-bz__grid">
  <div class="kp-card"><h3>{$bzWoherH}</h3>{$bzQuellen}</div>
  <div class="kp-card"><h3>Kampagnen <em>(utm_campaign)</em></h3>{$bzKampagnen}</div>
  <div class="kp-card"><h3>Erste Seite beim Besuch</h3>{$bzEinstieg}</div>
  <div class="kp-card"><h3>Meistgesehene Seiten</h3>{$bzSeiten}</div>
  <div class="kp-card"><h3>Kontaktaufnahmen</h3>{$bzKontakte}</div>
  <div class="kp-card"><h3>Anfragen nach Quelle <a class="kp-h-link" href="#werbung">Was bringt was →</a></h3>{$bzAnfragen}</div>
  {$chCard}
  <div class="kp-card kp-bz__info"><h3>So wird gezählt</h3><details class="kp-info"><summary>Erklärung anzeigen</summary><p class="kp-hint">{$bzSeit}Gespeichert werden nur Tagessummen pro Seite und Quelle, ohne Cookies, ohne IP-Adresse und ohne Kennung. Neu laden, Zurück-Taste, Suchmaschinen-Bots und Vorschau-Dienste zählen nicht. Ein „Besuch“ ist ein Aufruf von außen (über einen Link, eine Suche oder einen QR-Code), Weiterklicken auf der Seite zählt nur als Seitenaufruf. Bei Kontaktaufnahmen zählt ein Klick auf WhatsApp, Telegram, Telefon oder E-Mail, auch wenn danach keine Nachricht kommt. „Direkt“ heißt: Adresse getippt, Lesezeichen oder aus einer App ohne Link-Kennung.</p></details>{$bzGeraet}</div>
</div>
HTML;

// ---------------- Werbung: Brief-Rücklauf, Was bringt was, Newsletter, Bewertungen, Benachrichtigungen ----------------
$h = static fn(string $x): string => cx_h($x);
$br = ad_brief($afAlle);
$brRows = '';
foreach ($br['kampagnen'] as $kname => $z) {
    $brRows .= '<tr><td>' . cx_h((string) $kname) . '</td><td>' . $z['scans'] . '</td><td>' . $z['anfragen'] . '</td><td>' . $z['kunden'] . '</td></tr>';
}
$brTabelle = $brRows !== '' ? '<div class="kp-table kp-zahlen"><table><thead><tr><th>QR-Code (Kampagne)</th><th>Scans</th><th>Anfragen</th><th>Kunden</th></tr></thead><tbody>' . $brRows . '</tbody></table></div>'
    : '<p class="kp-hint kp-hint--top">Noch kein Scan eines Brief-QR-Codes. Gezählt wird jeder Aufruf mit utm_source=brief (auch tim-kofler.at/brief).</p>';
$brKosten = (int) (af_kosten()['brief'] ?? 0);
$brProScan = $brKosten > 0 && $br['scans'] > 0 ? af_euro((int) round($brKosten / $br['scans'])) : '–';
$brKarte = <<<HTML
<div class="kp-card kp-brief">
  <h3>Brief-Rücklauf <em>(seit 1.10.)</em></h3>
  <div class="kp-bz__kpis kp-kpis">
    <div class="kp-card"><small>Briefe verschickt</small><b>{$br['briefe']}</b><span>von dir eingetragen</span></div>
    <div class="kp-card"><small>QR gescannt</small><b>{$br['scans']}</b><span>{$h(ad_quote($br['scans'], $br['briefe']))} der Briefe</span></div>
    <div class="kp-card"><small>Anfragen</small><b>{$br['anfragen']}</b><span>{$h(ad_quote($br['anfragen'], $br['briefe']))} der Briefe</span></div>
    <div class="kp-card"><small>Kunden</small><b>{$br['kunden']}</b><span>{$brProScan} pro Scan</span></div>
  </div>
  {$brTabelle}
  <form class="form form--small kp-inline" method="post" action="/kunden/admin/">
    {$csrf}<input type="hidden" name="aktion" value="briefe">
    <label class="form__field"><span>Briefe verschickt bisher <em>(insgesamt)</em></span><input type="text" name="briefe" inputmode="numeric" maxlength="6" value="{$br['briefe']}"></label>
    <button class="btn btn--line" type="submit">Speichern</button>
  </form>
</div>
HTML;

$tr = ad_trichter($afAlle);
$trRows = '';
foreach ($tr['quellen'] as $q => $z) {
    if ($z['besuche'] === 0 && $z['anfragen'] === 0 && $z['kosten'] === null) {
        continue;
    }
    $kostenTxt = $z['kosten'] !== null ? af_euro((int) $z['kosten']) . ($z['anfragen'] > 0 ? ' · <b>' . af_euro((int) round($z['kosten'] / $z['anfragen'])) . '</b> pro Anfrage' : ' · noch keine Anfrage') . ($z['kunden'] > 0 ? ' · ' . af_euro((int) round($z['kosten'] / $z['kunden'])) . ' pro Kunde' : '') : '';
    $trRows .= '<li><span class="kp-tr__name">' . cx_h($bzLabel((string) $q) === ucfirst((string) $q) ? af_quelle_name((string) $q) : $bzLabel((string) $q)) . '</span>'
        . '<span class="kp-tr__weg"><b>' . $z['besuche'] . '</b> Besuche <i>→</i> <b>' . $z['anfragen'] . '</b> ' . ($z['anfragen'] === 1 ? 'Anfrage' : 'Anfragen') . ($z['besuche'] > 0 && $z['anfragen'] > 0 ? ' <em>(' . ad_quote($z['anfragen'], $z['besuche']) . ')</em>' : '') . ' <i>→</i> <b>' . $z['kunden'] . '</b> ' . ($z['kunden'] === 1 ? 'Kunde' : 'Kunden') . '</span>'
        . ($kostenTxt !== '' ? '<span class="kp-tr__kosten">' . $kostenTxt . '</span>' : '') . '</li>';
    if (substr_count($trRows, '<li>') >= 14) {
        break;
    }
}
$trSeit = $tr['seit'] !== '' ? 'Besuche seit ' . date('d.m.Y', strtotime($tr['seit']) ?: 0) . ', Anfragen der letzten 12 Monate.' : 'Noch keine Besuche gezählt.';
$trKarte = '<div class="kp-card kp-trichter"><h3>Was bringt was</h3><p class="kp-hint kp-hint--top">' . $trSeit . ' Ganz oben steht, was am meisten Kunden und Anfragen bringt. Kosten trägst du unten ein.</p>'
    . ($trRows !== '' ? '<ul class="kp-tr">' . $trRows . '</ul>' : '<p class="muted kp-leer">Noch keine Zahlen.</p>') . '</div>';

$nl = ad_newsletter();
$nlZahl = $nl['bestaetigt'] === null ? '–' : (string) $nl['bestaetigt'];
$nlHinweis = $nl['liste'] === 0 ? '<p class="kp-hint">In der config.php fehlt <code>list_newsletter</code>.</p>' : ($nl['bestaetigt'] === null ? '<p class="kp-hint">Brevo hat gerade keine Zahl geliefert.</p>' : '');
$nlKarte = <<<HTML
<div class="kp-card kp-nl">
  <h3>Newsletter</h3>
  <div class="kp-bz__kpis kp-kpis kp-kpis--3">
    <div class="kp-card"><small>Abonnenten</small><b>{$nlZahl}</b><span>bestätigt, laut Brevo</span></div>
    <div class="kp-card"><small>Neu bestätigt</small><b>{$nl['neu30']}</b><span>letzte 30 Tage</span></div>
    <div class="kp-card"><small>Bestätigung offen</small><b>{$nl['offen']}</b><span>Link nicht geklickt</span></div>
  </div>
  {$nlHinweis}
  <form method="post" action="/kunden/admin/" class="kp-mini">{$csrf}<input type="hidden" name="aktion" value="nl_neu"><button class="btn btn--sm btn--line" type="submit">Neu laden</button></form>
</div>
HTML;

$bwListe = '';
$bwNeu = 0;
foreach (bw_all() as $bu => $b) {
    $bst = (string) ($b['status'] ?? 'neu');
    $bwNeu += $bst === 'neu' ? 1 : 0;
    $btn = static fn(string $was, string $label, string $cls = 'btn--line') => '<form method="post" action="/kunden/admin/"' . ($was === 'loeschen' ? ' data-kp-confirm="Bewertung endgültig löschen?"' : '') . '>' . $csrf . '<input type="hidden" name="aktion" value="bw_status"><input type="hidden" name="u" value="' . cx_h((string) $bu) . '"><input type="hidden" name="was" value="' . $was . '"><button class="btn btn--sm ' . $cls . '" type="submit">' . $label . '</button></form>';
    $stTxt = $bst === 'frei' ? (!empty($b['oeffentlich']) ? '<span class="kp-pill kp-pill--ok">auf der Startseite</span>' : '<span class="kp-pill">freigegeben, aber ohne Einwilligung</span>') : ($bst === 'aus' ? '<span class="kp-pill">verborgen</span>' : '<span class="kp-pill kp-pill--hot">neu</span>');
    $bwListe .= '<li class="kp-bw"><div><b class="kp-sterne">' . str_repeat('★', (int) $b['sterne']) . '</b> ' . $stTxt . (empty($b['oeffentlich']) ? ' <span class="kp-pill">nur für dich</span>' : '') . '</div>'
        . '<p>„' . cx_h((string) $b['text']) . '“</p><small>' . cx_h((string) ($b['name'] !== '' ? $b['name'] : $bu)) . ' · ' . cx_h(date('d.m.Y', strtotime((string) $b['zeit']) ?: 0)) . ' · <a href="/kunden/admin/?k=' . rawurlencode((string) $bu) . '#zugang">' . cx_h((string) $bu) . '</a></small>'
        . '<div class="kp-actions">' . ($bst !== 'frei' ? $btn('frei', 'Freigeben', '') : $btn('aus', 'Verbergen')) . $btn('loeschen', 'Löschen') . '</div></li>';
}
$bwKarte = '<div class="kp-card kp-bwk"><h3>Bewertungen</h3>' . ($bwListe !== '' ? '<ul class="kp-bw-liste">' . $bwListe . '</ul>'
    : '<p class="kp-hint kp-hint--top">Noch keine. Den persönlichen Bewertungslink findest du in jeder Kundenkartei unter „Zugang“. Freigegebene Bewertungen mit Einwilligung erscheinen auf der Startseite unter „Referenz“.</p>') . '</div>';

// Benachrichtigungen: Telegram und Wochenbericht
$pu = pu_state();
if (pu_token() === '') {
    $puInhalt = '<p class="kp-hint kp-hint--top"><b>So richtest du es ein (einmalig, 3 Minuten):</b></p><ol class="kp-schritte"><li>In Telegram <b>@BotFather</b> öffnen, <code>/newbot</code> schicken, Name z. B. „TK Anfragen“, Benutzername z. B. „tk_anfragen_bot“.</li>'
        . '<li>BotFather schickt dir einen Schlüssel wie <code>123456:ABC…</code>. Trag ihn im KAS in <code>api/_data/config.php</code> ein: <code>\'telegram_token\' =&gt; \'…\',</code></li>'
        . '<li>Deinem neuen Bot in Telegram „Hallo“ schreiben, dann hier die Seite neu laden und „Chat suchen“ drücken.</li></ol>';
} elseif ((string) ($pu['chat'] ?? '') === '') {
    $chats = (array) ($_SESSION['push_chats'] ?? []);
    $opts = '';
    foreach ($chats as $id => $name) {
        $opts .= '<option value="' . cx_h((string) $id) . '">' . cx_h((string) $name) . '</option>';
    }
    $puInhalt = '<p class="kp-hint kp-hint--top">Der Schlüssel ist eingetragen. Schreib deinem Bot in Telegram „Hallo“ und drück dann auf „Chat suchen“.</p>'
        . '<form method="post" action="/kunden/admin/" class="kp-mini">' . $csrf . '<input type="hidden" name="aktion" value="push_suchen"><button class="btn btn--sm" type="submit">Chat suchen</button></form>'
        . ($opts !== '' ? '<form method="post" action="/kunden/admin/" class="form form--small kp-inline">' . $csrf . '<input type="hidden" name="aktion" value="push_chat"><label class="form__field"><span>Gefunden</span><select name="chat">' . $opts . '</select></label><button class="btn" type="submit">Diesen Chat verbinden</button></form>' : '');
} else {
    $aus = !empty($pu['aus']);
    $puInhalt = '<p class="kp-on"><span class="kp-on__dot' . ($aus ? ' is-aus' : '') . '" aria-hidden="true"></span><span><b>' . ($aus ? 'Ausgeschaltet' : 'Verbunden') . '</b> · bei bestätigten Anfragen, Rückruf-Wünschen, geöffneten Entwurf-Links, Bewertungen und Kundennachrichten. Ohne Namen und Nummern.</span></p>'
        . '<div class="kp-actions"><form method="post" action="/kunden/admin/">' . $csrf . '<input type="hidden" name="aktion" value="push_test"><button class="btn btn--sm btn--line" type="submit">Test schicken</button></form>'
        . '<form method="post" action="/kunden/admin/">' . $csrf . '<input type="hidden" name="aktion" value="push_aus"><button class="btn btn--sm btn--line" type="submit">' . ($aus ? 'Wieder einschalten' : 'Ausschalten') . '</button></form></div>';
}
$adS = ad_settings();
$wbAn = !empty($adS['bericht']);
$wbZuletzt = $adS['bericht_woche'] !== '' ? ' · zuletzt für ' . cx_h(str_replace('-W', '. Woche ', (string) $adS['bericht_woche'])) : '';
$benKarte = <<<HTML
<div class="kp-card kp-ben">
  <h3>Benachrichtigungen</h3>
  <h4 class="kp-chat-h">Aufs Handy <em>(Telegram)</em></h4>
  {$puInhalt}
  <h4 class="kp-chat-h">Wochenbericht <em>(jeden Montag per E-Mail)</em></h4>
  <p class="kp-on"><span class="kp-on__dot{$h($wbAn ? '' : ' is-aus')}" aria-hidden="true"></span><span><b>{$h($wbAn ? 'An' : 'Aus')}</b> · Besuche, Anfragen, Brief-Scans, Newsletter und was du nachfassen solltest{$wbZuletzt}</span></p>
  <div class="kp-actions">
    <form method="post" action="/kunden/admin/">{$csrf}<input type="hidden" name="aktion" value="bericht_test"><button class="btn btn--sm btn--line" type="submit">Testbericht schicken</button></form>
    <form method="post" action="/kunden/admin/">{$csrf}<input type="hidden" name="aktion" value="bericht"><button class="btn btn--sm btn--line" type="submit">{$h($wbAn ? 'Ausschalten' : 'Einschalten')}</button></form>
  </div>
</div>
HTML;

// Vorlagen bearbeiten (unten im Reiter Anfragen)
$vlFelder = '';
foreach (ad_vorlagen() as $vk => $vl) {
    $vlFelder .= '<fieldset class="kp-vl-edit"><legend>' . cx_h((string) $vl['titel']) . '</legend>'
        . '<label class="form__field"><span>Name</span><input type="text" name="v_' . $vk . '_titel" maxlength="60" value="' . cx_h((string) $vl['titel']) . '"></label>'
        . '<label class="form__field"><span>Betreff</span><input type="text" name="v_' . $vk . '_betreff" maxlength="160" value="' . cx_h((string) $vl['betreff']) . '"></label>'
        . '<label class="form__field"><span>Text</span><textarea name="v_' . $vk . '_text" rows="7" maxlength="3000">' . cx_h((string) $vl['text']) . '</textarea></label></fieldset>';
}
$vlKarte = <<<HTML
<details class="kp-card kp-konto" id="vorlagen">
  <summary><h2>Antwort-Vorlagen bearbeiten</h2></summary>
  <form class="form form--small" method="post" action="/kunden/admin/">
    {$csrf}<input type="hidden" name="aktion" value="vorlagen">
    <p class="kp-hint kp-hint--top">Platzhalter: <code>{hallo}</code> wird zu „Hallo Maria,“, dazu <code>{name}</code>, <code>{firma}</code>, <code>{paket}</code> und <code>{link}</code> (der Entwurf-Link). Ein leeres Feld nimmt wieder den Standardtext.</p>
    {$vlFelder}
    <button class="btn" type="submit">Vorlagen speichern</button>
  </form>
</details>
HTML;

// ---------------- Heute zu tun ----------------
$todo = [];
$heute = date('Y-m-d');
foreach ($afAlle as $key => $d) {
    if (af_versteckt($d)) {
        continue;
    }
    $st = (string) ($d['status'] ?? 'neu');
    $titel = (string) (($d['firma'] ?? '') !== '' ? $d['firma'] : ($d['name'] ?? 'Anfrage'));
    $link = '/kunden/admin/' . $d['link'];
    $offen = !in_array($st, ['kunde', 'abgesagt', 'erledigt'], true);
    $an = $afAnsicht[$key] ?? [];
    if ($an && ($an['antwort'] ?? '') === 'ja' && $offen) {
        $todo[] = [0, $link, '🎉', $titel . ' sagt zum Entwurf „Passt“', 'Angebot schicken'];
    } elseif ($an && ($an['antwort'] ?? '') === 'aendern' && $offen) {
        $todo[] = [1, $link, '✏️', $titel . ' wünscht Änderungen am Entwurf', 'nachfragen'];
    }
    if (($d['art'] ?? '') === 'entwurf' && in_array($st, ['neu', 'arbeit'], true) && ($d['optin'] ?? '') !== 'offen') {
        $frist = (strtotime((string) ($d['optin_zeit'] ?? $d['zeit'])) ?: 0) + 48 * 3600;
        $std = (int) round(($frist - time()) / 3600);
        $todo[] = [$std < 0 ? 0 : 2, $link, '🎨', 'Gratis-Entwurf für ' . $titel, $std >= 0 ? 'noch ' . $std . ' Std.' : 'seit ' . -$std . ' Std. überfällig'];
    } elseif (($d['art'] ?? '') === 'check' && in_array($st, ['neu', 'arbeit'], true) && ($d['optin'] ?? '') !== 'offen') {
        // Versprochen: Antwort innerhalb von 24 Stunden an Werktagen ab der Bestätigung (Wochenende zählt nicht).
        $frist = (strtotime((string) ($d['optin_zeit'] ?? $d['zeit'])) ?: 0) + 24 * 3600;
        while ((int) date('N', $frist) >= 6) {
            $frist += 24 * 3600;
        }
        $std = (int) round(($frist - time()) / 3600);
        $todo[] = [$std < 0 ? 0 : 2, $link, '🔎', 'Webseiten-Check: ' . $titel, $std >= 0 ? 'noch ' . $std . ' Std.' : 'seit ' . -$std . ' Std. überfällig'];
    } elseif ($st === 'neu' && ($d['optin'] ?? '') !== 'offen') {
        $tage = (int) floor((time() - (strtotime((string) $d['zeit']) ?: time())) / 86400);
        $todo[] = [$tage >= 2 ? 1 : 3, $link, ($d['art'] ?? '') === 'rueckruf' ? '📞' : '✉️', (($d['art'] ?? '') === 'rueckruf' ? 'Rückruf-Wunsch: ' : 'Neue Anfrage: ') . $titel, $tage === 0 ? 'von heute' : ($tage === 1 ? 'von gestern' : 'seit ' . $tage . ' Tagen offen')];
    }
    $nf = (string) ($d['nachfassen'] ?? '');
    if ($nf !== '' && $nf <= $heute && $offen) {
        $todo[] = [2, $link, '🔁', 'Nachfassen: ' . $titel, ad_wann($nf)];
    }
}
foreach ($list as $r) {
    if ($r['neu'] + $r['neuUp'] + $r['offen'] > 0) {
        $was = array_filter([$r['neu'] > 0 ? ($r['neu'] === 1 ? '1 Nachricht' : $r['neu'] . ' Nachrichten') : '', $r['neuUp'] > 0 ? ($r['neuUp'] === 1 ? '1 Upload' : $r['neuUp'] . ' Uploads') : '', $r['offen'] > 0 ? ($r['offen'] === 1 ? '1 Wunsch offen' : $r['offen'] . ' Wünsche offen') : '']);
        $todo[] = [$r['neu'] + $r['neuUp'] > 0 ? 1 : 3, '/kunden/admin/?k=' . rawurlencode($r['u']), '💬', (string) ($r['a']['name'] ?? $r['u']), implode(' · ', $was)];
    }
}
if ($bwNeu > 0) {
    $todo[] = [3, '#werbung', '⭐', $bwNeu === 1 ? 'Neue Bewertung freigeben' : $bwNeu . ' neue Bewertungen freigeben', 'unter Werbung'];
}
usort($todo, static fn($x, $y) => $x[0] <=> $y[0]);
$todoHtml = '';
foreach (array_slice($todo, 0, 8) as $t) {
    $todoHtml .= '<li><a href="' . cx_h($t[1]) . '"' . ($t[0] === 0 ? ' class="is-hot"' : '') . '><span class="kp-heute__ico" aria-hidden="true">' . $t[2] . '</span><span class="kp-heute__txt"><b>' . cx_h($t[3]) . '</b><small>' . cx_h($t[4]) . '</small></span><span class="kp-heute__go" aria-hidden="true">›</span></a></li>';
}
$mehr = count($todo) > 8 ? '<p class="kp-hint">… und ' . (count($todo) - 8) . ' weitere</p>' : '';
$heuteKarte = $todoHtml !== '' ? '<div class="kp-card kp-heute"><h2>Heute zu tun <span class="kp-badge">' . count($todo) . '</span></h2><ul>' . $todoHtml . '</ul>' . $mehr . '</div>'
    : '<p class="kp-heute-leer"><span aria-hidden="true">✓</span> Heute ist nichts fällig.</p>';

$wbSub = 'Briefe ' . $br['scans'] . ' Scans' . ($nl['bestaetigt'] !== null ? ' · Newsletter ' . $nl['bestaetigt'] : '');
$wBadge = $bwNeu > 0 ? '<span class="kp-badge">' . $bwNeu . '</span>' : '';

// Wochenbericht: falls diese Woche noch keiner rausging (ohne Besucher am Montag), jetzt.
wb_maybe();

kp_page('Übersicht', <<<HTML
<span class="label"><b>●</b> Kundenportal · Admin</span>
<h1 class="kp-hello">Übersicht</h1>
{$zugang}
{$flash}
{$tfHint}
{$heuteKarte}
<nav class="kp-tiles kp-tiles--3 kp-tiles--4" data-kp-tabs data-default="kunden" aria-label="Bereiche">
  <a class="kp-tile" href="#kunden" data-kp-tab="kunden"><span class="kp-tile__ico"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M15.5 5.2a3.5 3.5 0 0 1 0 6.6M18 14.8c1.9.7 3.1 2.4 3.5 5.2"/></svg></span><span class="kp-tile__txt"><b>Kunden {$kBadge}</b><small>{$kSub}</small></span></a>
  <a class="kp-tile" href="#anfragen" data-kp-tab="anfragen"><span class="kp-tile__ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg></span><span class="kp-tile__txt"><b>Anfragen {$ewBadge}</b><small>{$ewSub}</small></span></a>
  <a class="kp-tile" href="#werbung" data-kp-tab="werbung"><span class="kp-tile__ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.8 6a8.5 8.5 0 0 1 0 12"/></svg></span><span class="kp-tile__txt"><b>Werbung {$wBadge}</b><small>{$wbSub}</small></span></a>
  <a class="kp-tile" href="#besucher" data-kp-tab="besucher"><span class="kp-tile__ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg></span><span class="kp-tile__txt"><b>Besucher</b><small>{$bzSub}</small></span></a>
</nav>

<section class="kp-panel" data-kp-panel="kunden">
  {$kKpis}
  {$table}
  <details class="kp-card kp-konto" id="neu"{$neuOpen}>
    <summary><h2>+ Neuen Kunden anlegen</h2></summary>
    <form class="form form--small kp-new" method="post" action="/kunden/admin/">
      {$csrf}
      <input type="hidden" name="aktion" value="anlegen">
      <div class="form__row">
        <label class="form__field"><span>Benutzername <em>(wie der Ordner im Repo)</em></span><input type="text" name="benutzer" required maxlength="40" pattern="[a-z0-9][a-z0-9\-]{1,38}[a-z0-9]" placeholder="baeckerei-muster" autocapitalize="none" spellcheck="false"></label>
        <label class="form__field"><span>Name</span><input type="text" name="name" required maxlength="80" placeholder="Maria Muster"></label>
      </div>
      <div class="form__row">
        <label class="form__field"><span>Betrieb oder Verein</span><input type="text" name="firma" maxlength="120" placeholder="Bäckerei Muster"></label>
        <label class="form__field"><span>Art</span><select name="art">{$artNeu}</select></label>
      </div>
      <div class="form__row">
        <label class="form__field"><span>Webseite</span><input type="text" name="webseite" maxlength="200" placeholder="baeckerei-muster.at"></label>
        <label class="form__field"><span>E-Mail <em>(für Willkommensmail und Benachrichtigungen)</em></span><input type="email" name="email" maxlength="254"></label>
      </div>
      <label class="form__check"><input type="checkbox" name="willkommen" value="ja" checked><span><b>Willkommensmail senden</b>: Der Kunde bekommt Benutzername, Link zum Portal und einen einmaligen Link, mit dem er sein eigenes Passwort festlegt (14 Tage gültig). Ohne Häkchen zeige ich dir ein Passwort zum Weitergeben.</span></label>
      <button class="btn" type="submit">Kunde anlegen</button>
    </form>
  </details>
</section>

<section class="kp-panel" data-kp-panel="anfragen">
  <nav class="kp-filter" aria-label="Status">{$afPills}</nav>
  {$ewTable}
  {$vlKarte}
</section>

<section class="kp-panel" data-kp-panel="werbung">
  {$brKarte}
  {$trKarte}
  {$kostenCard}
  <div class="kp-grid kp-grid--even kp-werbung-2">
    {$nlKarte}
    {$benKarte}
  </div>
  {$bwKarte}
</section>

<section class="kp-panel" data-kp-panel="besucher">
  {$bzPanel}
</section>
HTML, $logoutHome);
