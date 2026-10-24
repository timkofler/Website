<?php
// Tim Kofler – Kundenportal, Admin-Bereich: Kunden anlegen, Zugänge verwalten, Uploads ansehen und herunterladen,
// dazu die Anfragen für einen Gratis-Entwurf von /entwurf/ und der anonyme Besucherzähler. Anmeldung mit Passwort und, wenn eingerichtet,
// einem zweiten Faktor (Code aus der Authenticator-App oder Notfall-Code).

declare(strict_types=1);

require __DIR__ . '/../../api/kunden-lib.php';
require __DIR__ . '/../../api/entwurf-lib.php';
require __DIR__ . '/../../api/admin-2fa-lib.php';
require __DIR__ . '/../../api/zaehler-lib.php';

kp_headers();
kp_session();

const KP_ADMIN = '/kunden/admin/';

$hash = (string) (cx_config()['admin_password_hash'] ?? '');
// Die Anmeldung gilt nur für den Admin-Hash, mit dem sie gemacht wurde (neues Passwort in der config.php meldet alle ab).
$isAdmin = $hash !== '' && is_string($_SESSION['admin'] ?? null) && hash_equals(kp_pw_tag($hash), $_SESSION['admin']);
$k = (string) ($_GET['k'] ?? '');
$k = kp_valid_user($k) ? $k : '';
$ew = (string) ($_GET['entwurf'] ?? '');
$ew = ew_valid_id($ew) ? $ew : '';
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
            kp_redirect(KP_ADMIN . '#entwuerfe');
        }
        if ($action === 'ew_loeschen') {
            if (cx_field('sicher', 5) === 'ja') {
                ew_delete($ew);
                kp_flash(true, 'Anfrage von „' . $d['firma'] . '“ gelöscht.');
                kp_redirect(KP_ADMIN . '#entwuerfe');
            }
            kp_flash(false, 'Zum Löschen bitte das Häkchen setzen.');
        } else {
            $st = cx_field('status', 20);
            if (isset(EW_STATUS[$st])) {
                $d['status'] = $st;
                $d['geaendert'] = date('c');
                $d['notiz'] = kp_text('notiz', 2000);
                ew_write($ew, $d);
                kp_flash(true, 'Gespeichert.');
            }
        }
        kp_redirect(KP_ADMIN . '?entwurf=' . $ew);
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
        } else {
            $pw = kp_new_password();
            $all[$u] = [
                'name' => kp_text('name', 80), 'firma' => kp_text('firma', 120), 'email' => $email,
                'webseite' => kp_text('webseite', 200), 'art' => isset(KP_KUNDENARTEN[cx_field('art', 20)]) ? cx_field('art', 20) : 'betrieb',
                'hash' => password_hash($pw, PASSWORD_DEFAULT),
                'aktiv' => true, 'erstellt' => date('c'),
            ];
            if (kp_save_accounts($all)) {
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
        kp_save_accounts($all);
        kp_fail_reset('kunde:' . $k);
        $_SESSION['zugang'] = ['benutzer' => $k, 'passwort' => $pw];
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
    kp_page('Bestätigen', <<<HTML
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
    kp_page('Admin', <<<HTML
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
    $opts = '';
    foreach (EW_STATUS as $key => $label) {
        $opts .= '<option value="' . $key . '"' . (($d['status'] ?? 'neu') === $key ? ' selected' : '') . '>' . cx_h($label) . '</option>';
    }
    $subject = rawurlencode('Dein Webseiten-Entwurf für ' . $d['firma']);
    $hallo = ($d['name'] ?? '') !== '' ? 'Hallo ' . $d['name'] . ',' : 'Hallo,';
    $body = rawurlencode($hallo . "\n\nwie versprochen hier dein kostenloser Entwurf für " . $d['firma'] . ".\n\n\n\nViele Grüße\nTim");
    $mailto = 'mailto:' . cx_h($d['email']) . '?subject=' . $subject . '&amp;body=' . $body;
    $form = KP_ADMIN . '?entwurf=' . $ew;
    kp_page('Entwurf: ' . $d['firma'], <<<HTML
<div class="crumbs"><a href="/kunden/admin/#entwuerfe">Gratis-Entwürfe</a> / {$v('firma')}</div>
<h1>{$v('firma')}</h1>
{$flash}
<div class="kp-table kp-ew"><table><tbody>{$rows}</tbody></table></div>
<div class="kp-actions"><a class="btn" href="{$mailto}">Entwurf per E-Mail schicken</a></div>
<div class="kp-grid kp-grid--even">
  <form class="form form--small" method="post" action="{$form}">
    {$csrf}
    <input type="hidden" name="aktion" value="ew_status">
    <h2>Status</h2>
    <label class="form__field"><span>Stand</span><select name="status">{$opts}</select></label>
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

    kp_page($a['name'] ?? $k, <<<HTML
<div class="crumbs"><a href="/kunden/admin/">Kunden</a> / {$hk}</div>
<div class="kp-head">
  <span class="kp-ava kp-ava--gross" aria-hidden="true">{$initials($a['name'] ?? $k)}</span>
  <div>
    <h1>{$h('name')}</h1>
    <p class="kp-head__sub">{$sub}</p>
    <p class="kp-head__facts">{$statusChip}<span>Benutzer <code>{$hk}</code></span><span>Letzte Anmeldung {$last}</span></p>
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
      <label class="form__field"><span>E-Mail <em>(für Benachrichtigungen)</em></span><input type="email" name="email" maxlength="254" value="{$h('email')}"></label>
      <label class="form__field"><span>Webseite</span><input type="text" name="webseite" maxlength="200" value="{$h('webseite')}"></label>
      <button class="btn btn--line" type="submit">Speichern</button>
    </form>
    <div class="form form--small">
      <h2>Zugang</h2>
      <p class="kp-hint kp-hint--top">Zugang {$status} · letzte Anmeldung {$last} · {$used} belegt</p>
      <form method="post" action="{$form}" data-kp-confirm="Neues Passwort für {$hk} erzeugen? Das bisherige gilt dann sofort nicht mehr.">{$csrf}<input type="hidden" name="aktion" value="passwort"><button class="btn btn--line" type="submit">Neues Passwort erzeugen</button></form>
      {$tfInfo}
      <form method="post" action="{$form}"{$lockAsk}>{$csrf}<input type="hidden" name="aktion" value="sperren"><button class="btn btn--line" type="submit">{$lock}</button></form>
      <form method="post" action="{$form}" class="kp-danger">{$csrf}<input type="hidden" name="aktion" value="kunde_loeschen">
        <label class="form__field"><span>Kunde und alle Dateien löschen: zur Bestätigung <b class="kp-user">{$hk}</b> eintippen</span><input type="text" name="sicher" required placeholder="{$hk}" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false"></label>
        <button class="btn btn--line" type="submit">Endgültig löschen</button></form>
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
    $list[] = ['u' => $u, 'a' => $a, 'uploads' => count($b), 'neu' => $neu, 'neuUp' => $neuUp, 'offen' => $offen, 'akt' => $akt];
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
        . '<span class="kp-pill kp-pill--phase' . (kp_phase($a) === 'online' ? ' kp-pill--ok' : '') . '">' . cx_h(KP_PHASEN[kp_phase($a)][0]) . '</span>'
        . '<span class="kp-pill">' . ($r['uploads'] === 1 ? '1 Upload' : $r['uploads'] . ' Uploads') . '</span>'
        . (!$aktiv ? '<span class="kp-pill kp-pill--aus">gesperrt</span>' : '');
    $when = $r['akt'] ? date('d.m.Y', $r['akt']) : '–';
    $rows .= '<li><a class="kp-row' . ($r['neu'] + $r['neuUp'] > 0 ? ' is-new' : '') . '" href="/kunden/admin/?k=' . rawurlencode($r['u']) . '">'
        . '<span class="kp-ava" aria-hidden="true">' . $initials((string) ($a['name'] ?? $r['u'])) . '</span>'
        . '<span class="kp-row__main"><b>' . cx_h((string) ($a['name'] ?? $r['u'])) . '</b><small>' . ($sub !== '' ? $sub . ' · ' : '') . '<code>' . cx_h($r['u']) . '</code></small></span>'
        . '<span class="kp-row__tags">' . $tags . '</span>'
        . '<span class="kp-row__when">' . $when . '</span>'
        . '<span class="kp-row__go" aria-hidden="true">›</span></a></li>';
}

$table = $rows === '' ? '<p class="muted kp-leer">Noch keine Kunden angelegt.</p>' : '<ul class="kp-rows">' . $rows . '</ul>';

$ewRows = '';
$ewNeu = 0;
foreach (ew_all() as $id => $d) {
    $st = (string) ($d['status'] ?? 'neu');
    $ewNeu += $st === 'neu' ? 1 : 0;
    $web = ($d['webseite'] ?? '') !== '' ? (string) $d['webseite'] : (($d['hat_webseite'] ?? '') === 'nein' ? 'noch keine Webseite' : '');
    $sub = implode(' · ', array_filter([cx_h((string) ($d['ort'] ?? '')), cx_h((string) ($d['branche'] ?? '')), cx_h($web)]));
    $tags = '<span class="kp-pill' . ($st === 'neu' ? ' kp-pill--hot' : '') . '">' . cx_h(EW_STATUS[$st] ?? $st) . '</span>'
        . (($d['farbe'] ?? '') !== '' ? '<span class="kp-pill">' . ew_swatch((string) ($d['farbe_hex'] ?? '')) . cx_h((string) $d['farbe']) . '</span>' : '')
        . (!empty($d['newsletter']) ? '<span class="kp-pill">Newsletter</span>' : '');
    $ewRows .= '<li><a class="kp-row' . ($st === 'neu' ? ' is-new' : '') . '" href="/kunden/admin/?entwurf=' . $id . '">'
        . '<span class="kp-ava kp-ava--ew" aria-hidden="true">' . $initials((string) $d['firma']) . '</span>'
        . '<span class="kp-row__main"><b>' . cx_h((string) $d['firma']) . '</b><small>' . $sub . '</small></span>'
        . '<span class="kp-row__tags">' . $tags . '</span>'
        . '<span class="kp-row__when">' . cx_h(date('d.m.Y', strtotime((string) $d['zeit']) ?: 0)) . '</span>'
        . '<span class="kp-row__go" aria-hidden="true">›</span></a></li>';
}
$ewTable = $ewRows === '' ? '<p class="muted kp-leer">Noch keine Anfragen über <a href="/entwurf/">tim-kofler.at/entwurf/</a>.</p>' : '<ul class="kp-rows">' . $ewRows . '</ul>';
$tfHint = tf_active() ? '' : '<a class="kp-neu" href="/kunden/admin/?sicherheit"><b>●</b> Zwei-Faktor-Anmeldung ist noch nicht eingerichtet. Jetzt mit Google Authenticator absichern →</a>';
$ewBadge = $ewNeu > 0 ? '<span class="kp-badge">' . $ewNeu . '</span>' : '';
$kBadge = $sumNeu + $sumUp > 0 ? '<span class="kp-badge">' . ($sumNeu + $sumUp) . '</span>' : '';
$nK = count($list);
$kSub = ($nK === 1 ? '1 Kunde' : $nK . ' Kunden') . ($sumNeu > 0 ? ' · <b>' . $sumNeu . ($sumNeu === 1 ? ' neue Nachricht' : ' neue Nachrichten') . '</b>' : '') . ($sumUp > 0 ? ' · <b>' . $sumUp . ($sumUp === 1 ? ' neuer Upload' : ' neue Uploads') . '</b>' : '') . ($sumOffen > 0 ? ' · ' . $sumOffen . ($sumOffen === 1 ? ' Wunsch offen' : ' Wünsche offen') : '');
$ewSub = $ewNeu > 0 ? '<b>' . ($ewNeu === 1 ? '1 neue Anfrage' : $ewNeu . ' neue Anfragen') . '</b>' : 'Gratis-Entwürfe von /entwurf/';
$neuOpen = $nK === 0 ? ' open' : '';
$artNeu = kp_art_options('betrieb');

// Besucher: anonyme Tagessummen aus /api/zaehler.php, dazu die Gratis-Entwurf-Anfragen im selben Zeitraum.
$zeit = (int) ($_GET['zeit'] ?? 30);
$zeit = in_array($zeit, [7, 30, 90], true) ? $zeit : 30;
$bz = zl_range($zeit);
$bzHeute = end($bz['tage']) ?: ['besuche' => 0, 'aufrufe' => 0];
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
$bzKamp = static function (string $k) use ($bzLabel): string {
    [$q, $c] = array_pad(explode(' / ', $k, 2), 2, '');
    return $bzLabel($q) . ' · ' . $c;
};
// Gratis-Entwurf-Anfragen im Zeitraum, nach ihrem Feld „Gefunden über“.
$bzAnf = [];
$bzVon = (new DateTimeImmutable('today'))->modify('-' . ($zeit - 1) . ' days')->getTimestamp();
foreach (ew_all() as $d) {
    if ((strtotime((string) ($d['zeit'] ?? '')) ?: 0) >= $bzVon) {
        $q = trim(preg_replace('/\s*\(gclid.*$/', '', (string) ($d['quelle'] ?? '')) ?? '');
        $q = $q === '' ? 'direkt' : $q;
        $bzAnf[$q] = ($bzAnf[$q] ?? 0) + 1;
    }
}
arsort($bzAnf);
$bzAnfSum = array_sum($bzAnf);
$bzTop = max(1, ...array_column($bz['tage'], 'besuche'));
$bzBars = '';
foreach ($bz['tage'] as $day => $t) {
    $lbl = date('d.m.', strtotime($day) ?: 0);
    $bzBars .= '<span class="kp-bz__day" title="' . $lbl . ': ' . $t['besuche'] . ' Besuche, ' . $t['aufrufe'] . ' Aufrufe"><i style="height:' . ($t['besuche'] ? max(4, (int) round($t['besuche'] / $bzTop * 100)) : 0) . '%"></i></span>';
}
$bzFirst = date('d.m.', strtotime((string) array_key_first($bz['tage'])) ?: 0);
$bzZeiten = '';
foreach ([7 => '7 Tage', 30 => '30 Tage', 90 => '90 Tage'] as $z => $t) {
    $bzZeiten .= '<a class="kp-pill' . ($z === $zeit ? ' kp-pill--hot' : '') . '" href="/kunden/admin/?zeit=' . $z . '#besucher"' . ($z === $zeit ? ' aria-current="true"' : '') . '>' . $t . '</a>';
}
$bzAus = isset($_COOKIE[ZL_NOCOUNT]);
$bzSeit = $bz['seit'] !== '' ? 'Gezählt wird seit ' . date('d.m.Y', strtotime($bz['seit']) ?: 0) . '. ' : 'Noch keine Zahlen: Die Zählung beginnt mit dem ersten Besuch nach dem Hochladen. ';
$bzGeraet = '<form method="post" action="/kunden/admin/?zeit=' . $zeit . '" class="kp-bz__geraet">' . $csrf . '<input type="hidden" name="aktion" value="zaehlen"><input type="hidden" name="wert" value="' . ($bzAus ? 'ein' : 'aus') . '">'
    . '<span>' . ($bzAus ? '<b>Dieses Gerät wird nicht mitgezählt.</b>' : 'Dieses Gerät wird mitgezählt.') . '</span>'
    . '<button class="btn btn--line" type="submit">' . ($bzAus ? 'Wieder mitzählen' : 'Dieses Gerät nicht mitzählen') . '</button></form>';
$bzSub = 'heute <b>' . $bzHeute['besuche'] . '</b> · ' . $zeit . ' Tage ' . $bz['besuche'];
$bzQuellen = $bzList($bz['quellen'], $bzLabel, 'Noch keine Besuche im Zeitraum.');
$bzKampagnen = $bzList($bz['kampagnen'], $bzKamp, 'Noch keine Besuche über Links mit utm_campaign.');
$bzEinstieg = $bzList($bz['einstieg'], $bzSeite, 'Noch keine Besuche im Zeitraum.');
$bzSeiten = $bzList($bz['seiten'], $bzSeite, 'Noch keine Aufrufe im Zeitraum.');
$bzAnfragen = $bzList($bzAnf, static fn(string $q): string => $q, 'Keine Gratis-Entwurf-Anfragen im Zeitraum.');
// Kontaktaufnahmen: Klicks auf WhatsApp/Telegram/Telefon/E-Mail, abgeschickte Anfragen und Rückruf-Wünsche, dazu die Entwürfe.
$bzKontakt = $bz['kontakte'];
if ($bzAnfSum > 0) {
    $bzKontakt['entwurf'] = $bzAnfSum;
    arsort($bzKontakt);
}
$bzKontaktSum = array_sum($bzKontakt);
$bzKontaktName = static fn(string $k): string => [
    'whatsapp' => 'WhatsApp geöffnet', 'telegram' => 'Telegram geöffnet', 'telefon' => 'Nummer angetippt', 'email' => 'E-Mail geöffnet',
    'formular' => 'Anfrage abgeschickt', 'rueckruf' => 'Rückruf-Wunsch', 'entwurf' => 'Gratis-Entwurf angefragt',
][$k] ?? ucfirst($k);
$bzKontakte = $bzList($bzKontakt, $bzKontaktName, 'Noch keine Kontaktaufnahmen im Zeitraum. Gezählt werden Klicks auf WhatsApp, Telegram, Telefon und E-Mail sowie abgeschickte Formulare.');
$bzQuote = $bz['besuche'] > 0 && $bzKontaktSum > 0 ? number_format($bzKontaktSum / $bz['besuche'] * 100, 1, ',', '') . ' % der Besuche' : 'im Zeitraum';
$bzPanel = <<<HTML
<div class="kp-bz__head"><h2>Besucher</h2><nav class="kp-bz__zeit" aria-label="Zeitraum">{$bzZeiten}</nav></div>
<div class="kp-bz__kpis">
  <div class="kp-card"><small>Besuche von außen</small><b>{$bz['besuche']}</b><span>letzte {$zeit} Tage</span></div>
  <div class="kp-card"><small>Seitenaufrufe</small><b>{$bz['aufrufe']}</b><span>inkl. Weiterklicken</span></div>
  <div class="kp-card"><small>Heute</small><b>{$bzHeute['besuche']}</b><span>{$bzHeute['aufrufe']} Aufrufe</span></div>
  <div class="kp-card"><small>Kontaktaufnahmen</small><b>{$bzKontaktSum}</b><span>{$bzQuote}</span></div>
</div>
<div class="kp-card kp-bz__chart"><div class="kp-bz__days" role="img" aria-label="Besuche pro Tag, letzte {$zeit} Tage">{$bzBars}</div><div class="kp-bz__axis"><span>{$bzFirst}</span><span>heute</span></div></div>
<div class="kp-bz__grid">
  <div class="kp-card"><h3>Woher die Besucher kommen</h3>{$bzQuellen}</div>
  <div class="kp-card"><h3>Kampagnen <em>(utm_campaign)</em></h3>{$bzKampagnen}</div>
  <div class="kp-card"><h3>Erste Seite beim Besuch</h3>{$bzEinstieg}</div>
  <div class="kp-card"><h3>Meistgesehene Seiten</h3>{$bzSeiten}</div>
  <div class="kp-card"><h3>Kontaktaufnahmen</h3>{$bzKontakte}</div>
  <div class="kp-card"><h3>Gratis-Entwurf-Anfragen nach Quelle</h3>{$bzAnfragen}</div>
  <div class="kp-card kp-bz__info"><h3>So wird gezählt</h3><p class="kp-hint">{$bzSeit}Gespeichert werden nur Tagessummen pro Seite und Quelle, ohne Cookies, ohne IP-Adresse und ohne Kennung. Neu laden, Zurück-Taste, Suchmaschinen-Bots und Vorschau-Dienste zählen nicht. Ein „Besuch“ ist ein Aufruf von außen (über einen Link, eine Suche oder einen QR-Code), Weiterklicken auf der Seite zählt nur als Seitenaufruf. Bei Kontaktaufnahmen zählt ein Klick auf WhatsApp, Telegram, Telefon oder E-Mail, auch wenn danach keine Nachricht kommt. „Direkt“ heißt: Adresse getippt, Lesezeichen oder aus einer App ohne Link-Kennung.</p>{$bzGeraet}</div>
</div>
HTML;

kp_page('Kunden', <<<HTML
<span class="label"><b>●</b> Kundenportal · Admin</span>
<h1 class="kp-hello">Übersicht</h1>
{$zugang}
{$flash}
{$tfHint}
<nav class="kp-tiles kp-tiles--3" data-kp-tabs data-default="kunden" aria-label="Bereiche">
  <a class="kp-tile" href="#kunden" data-kp-tab="kunden"><span class="kp-tile__ico"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M15.5 5.2a3.5 3.5 0 0 1 0 6.6M18 14.8c1.9.7 3.1 2.4 3.5 5.2"/></svg></span><span class="kp-tile__txt"><b>Kunden {$kBadge}</b><small>{$kSub}</small></span></a>
  <a class="kp-tile" href="#entwuerfe" data-kp-tab="entwuerfe"><span class="kp-tile__ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg></span><span class="kp-tile__txt"><b>Entwürfe {$ewBadge}</b><small>{$ewSub}</small></span></a>
  <a class="kp-tile" href="#besucher" data-kp-tab="besucher"><span class="kp-tile__ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg></span><span class="kp-tile__txt"><b>Besucher</b><small>{$bzSub}</small></span></a>
</nav>

<section class="kp-panel" data-kp-panel="kunden">
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
        <label class="form__field"><span>E-Mail <em>(optional, für Benachrichtigungen)</em></span><input type="email" name="email" maxlength="254"></label>
      </div>
      <button class="btn" type="submit">Anlegen und Passwort erzeugen</button>
    </form>
  </details>
</section>

<section class="kp-panel" data-kp-panel="entwuerfe">
  {$ewTable}
</section>

<section class="kp-panel" data-kp-panel="besucher">
  {$bzPanel}
</section>
HTML, $logoutHome);
