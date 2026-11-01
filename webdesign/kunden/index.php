<?php
// Tim Kofler – Kundenportal: Anmeldung und Datei-Upload für Kunden.

declare(strict_types=1);

require __DIR__ . '/../api/kunden-lib.php';
require __DIR__ . '/../api/admin-2fa-lib.php';

kp_headers();
kp_session();

$user = (string) ($_SESSION['kunde'] ?? '');
$acc = $user !== '' ? kp_account($user) : null;
if ($user !== '' && ($acc === null || empty($acc['aktiv']) || !hash_equals(kp_pw_tag((string) ($acc['hash'] ?? '')), (string) ($_SESSION['kunde_pw'] ?? '')))) {
    // Konto wurde inzwischen gelöscht, gesperrt oder das Passwort wurde geändert.
    unset($_SESSION['kunde'], $_SESSION['kunde_pw']);
    $user = '';
    $acc = null;
}

// Anmeldung mit freiwilliger Zwei-Faktor-Anmeldung: Passwort war richtig, der Code aus der App fehlt noch.
// Gilt nur kurz und nur, solange Konto, Passwort und 2FA unverändert sind.
$pend = is_array($_SESSION['kunde_2fa'] ?? null) ? $_SESSION['kunde_2fa'] : [];
$pendUser = (string) ($pend['u'] ?? '');
$pendAcc = $pendUser !== '' ? kp_account($pendUser) : null;
$codeStep = $acc === null && $pendAcc !== null && !empty($pendAcc['aktiv']) && time() - (int) ($pend['t'] ?? 0) <= TF_STEP_TTL
    && hash_equals(kp_pw_tag((string) ($pendAcc['hash'] ?? '')), (string) ($pend['pw'] ?? '')) && tf_active(tf_kunde_file($pendUser));
if (!$codeStep) {
    unset($_SESSION['kunde_2fa']);
}

// Anmeldung abschließen (nach dem Passwort bzw. nach dem Code aus der App).
function kp_kunde_login(string $name): void
{
    unset($_SESSION['kunde_2fa']);
    session_regenerate_id(true);
    $_SESSION['kunde'] = $name;
    $all = kp_accounts();
    $all[$name]['letzte_anmeldung'] = date('c');
    kp_save_accounts($all);
    $_SESSION['kunde_pw'] = kp_pw_tag((string) $all[$name]['hash']);
}

// Vorschaubild einer eigenen hochgeladenen Bilddatei (nur angemeldet, nur aus dem eigenen Ordner, nur Bildformate).
if ($acc !== null && isset($_GET['vorschau'], $_GET['e'], $_GET['f']) && is_string($_GET['e']) && is_string($_GET['f']) && kp_valid_batch($_GET['e'])) {
    $dir = kp_user_dir($user) . '/' . $_GET['e'];
    $batch = kp_read_json($dir . '/eingang.json');
    $f = $_GET['f'];
    $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
    if (!$batch || !isset(KP_PREVIEW[$ext]) || !in_array($f, array_column((array) ($batch['dateien'] ?? []), 'datei'), true) || !is_file($dir . '/' . $f)) {
        http_response_code(404);
        exit('Nicht gefunden.');
    }
    header('Content-Type: ' . KP_PREVIEW[$ext]);
    header('X-Content-Type-Options: nosniff');
    header("Content-Security-Policy: default-src 'none'; sandbox");
    header('Cache-Control: private, max-age=600');
    header('Content-Length: ' . filesize($dir . '/' . $f));
    readfile($dir . '/' . $f);
    exit;
}

// Link aus der Willkommensmail: Schlüssel in die Sitzung übernehmen und auf eine saubere Adresse weiterleiten,
// damit er nicht im Verlauf oder in der Adresszeile stehen bleibt. Verbraucht wird er erst beim Speichern des Passworts.
if (isset($_GET['willkommen']) && is_string($_GET['willkommen']) && $_GET['willkommen'] !== '') {
    $raw = $_GET['willkommen'];
    if (kp_invite_check($raw) === '') {
        kp_fail_wait();
        unset($_SESSION['willkommen']);
        kp_flash(false, 'Dieser Link ist abgelaufen oder wurde schon verwendet. Schreib mir kurz, dann schicke ich dir einen neuen.');
        kp_redirect('/kunden/');
    }
    $_SESSION['willkommen'] = $raw;
    kp_redirect('/kunden/?willkommen');
}
$invite = is_string($_SESSION['willkommen'] ?? null) ? $_SESSION['willkommen'] : '';
$inviteUser = $invite !== '' ? kp_invite_check($invite) : '';
if ($invite !== '' && $inviteUser === '') {
    unset($_SESSION['willkommen']);
}

// Zu große Uploads: PHP verwirft dann das ganze Formular, auch den Formular-Schlüssel.
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && !$_POST && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
    kp_flash(false, 'Das waren zu viele Daten auf einmal (höchstens ' . kp_bytes(kp_max_post()) . ' pro Durchgang). Bitte lade die Dateien in mehreren kleineren Portionen hoch.');
    kp_redirect('/kunden/#dateien');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    if (!kp_post_ok()) {
        kp_flash(false, 'Die Seite war zu lange offen. Bitte versuche es noch einmal.');
        kp_redirect('/kunden/');
    }
    $action = cx_field('aktion', 20);

    if ($action === 'anmelden') {
        $name = strtolower(cx_field('benutzer', 40));
        $pass = (string) ($_POST['passwort'] ?? '');
        $keys = ['ip:' . kp_ip_hash(), 'kunde:' . $name];
        if (!kp_try($keys)) {
            cx_alarm('kunden-sperre', "🚫 <b>Kundenportal: Anmeldung gesperrt</b>\nZu viele falsche Passwörter oder Codes in 15 Minuten. Jemand probiert sich am Kundenportal.");
            kp_flash(false, 'Zu viele Fehlversuche. Bitte warte 15 Minuten und versuche es dann noch einmal.');
            kp_redirect('/kunden/');
        }
        $a = kp_account($name);
        if ($a === null) {
            kp_dummy_verify($pass);
        }
        if ($a === null || empty($a['aktiv']) || !password_verify($pass, (string) ($a['hash'] ?? ''))) {
            kp_fail_wait();
            kp_flash(false, 'Benutzername oder Passwort stimmt nicht.');
            kp_redirect('/kunden/');
        }
        kp_untry($keys);
        if (password_needs_rehash((string) $a['hash'], PASSWORD_DEFAULT)) {
            $all = kp_accounts();
            $all[$name]['hash'] = password_hash($pass, PASSWORD_DEFAULT);
            kp_save_accounts($all);
            $a = $all[$name];
        }
        if (tf_active(tf_kunde_file($name))) {
            // Zweiter Schritt: erst mit dem Code aus der App ist man angemeldet.
            session_regenerate_id(true);
            unset($_SESSION['kunde'], $_SESSION['kunde_pw']);
            $_SESSION['kunde_2fa'] = ['u' => $name, 't' => time(), 'pw' => kp_pw_tag((string) $a['hash'])];
            // Fehlversuche beim Code bleiben bewusst stehen, sonst könnte man mit dem Passwort den Zähler immer wieder leeren.
            kp_redirect('/kunden/');
        }
        kp_fail_reset('kunde:' . $name);
        kp_kunde_login($name);
        kp_redirect('/kunden/');
    }

    if ($action === 'code') {
        if (!$codeStep) {
            kp_flash(false, 'Das hat zu lange gedauert. Bitte melde dich noch einmal mit deinem Passwort an.');
            kp_redirect('/kunden/');
        }
        $keys = ['ip:' . kp_ip_hash(), 'kunde:' . $pendUser];
        if (!kp_try($keys)) {
            cx_alarm('kunden-sperre', "🚫 <b>Kundenportal: Anmeldung gesperrt</b>\nZu viele falsche Passwörter oder Codes in 15 Minuten. Jemand probiert sich am Kundenportal.");
            kp_flash(false, 'Zu viele Fehlversuche. Bitte warte 15 Minuten und versuche es dann noch einmal.');
            kp_redirect('/kunden/');
        }
        $input = trim((string) ($_POST['code'] ?? ''));
        $file = tf_kunde_file($pendUser);
        $art = tf_check($input, true, $file);
        if ($art === '') {
            kp_fail_wait();
            kp_flash(false, $input !== '' && preg_match('/[a-z]/i', $input) ? 'Dieser Notfall-Code stimmt nicht oder wurde schon verwendet.' : 'Der Code stimmt nicht. Bitte gib den aktuellen Code aus der App ein.');
            kp_redirect('/kunden/');
        }
        kp_untry($keys);
        kp_fail_reset('kunde:' . $pendUser);
        kp_kunde_login($pendUser);
        if ($art === 'notfall') {
            $left = tf_backups_left($file);
            kp_flash($left > 2, 'Angemeldet mit einem Notfall-Code. Dieser Code ist jetzt verbraucht, ' . ($left === 1 ? 'einer ist' : $left . ' sind') . ' noch übrig.'
                . ($left <= 2 ? ' Bitte unten bei „Zwei-Faktor-Anmeldung“ neue Notfall-Codes erzeugen.' : ''));
        }
        kp_redirect('/kunden/');
    }

    if ($action === 'zurueck') {
        unset($_SESSION['kunde_2fa']);
        kp_redirect('/kunden/');
    }

    // Eigenes Passwort über den Link aus der Willkommensmail festlegen.
    if ($action === 'festlegen') {
        $new = (string) ($_POST['neu'] ?? '');
        if ($inviteUser === '') {
            kp_flash(false, 'Dieser Link ist abgelaufen oder wurde schon verwendet. Schreib mir kurz, dann schicke ich dir einen neuen.');
            kp_redirect('/kunden/');
        }
        if (strlen($new) < 10 || strlen($new) > 200) {
            kp_flash(false, 'Das Passwort muss mindestens 10 Zeichen lang sein.');
            kp_redirect('/kunden/?willkommen');
        }
        if ($new !== (string) ($_POST['neu2'] ?? '')) {
            kp_flash(false, 'Die beiden Passwörter sind nicht gleich.');
            kp_redirect('/kunden/?willkommen');
        }
        if (!kp_invite_use($invite)) {
            unset($_SESSION['willkommen']);
            kp_flash(false, 'Dieser Link wurde gerade schon verwendet. Bitte melde dich mit deinem Passwort an.');
            kp_redirect('/kunden/');
        }
        $all = kp_accounts();
        $all[$inviteUser]['hash'] = password_hash($new, PASSWORD_DEFAULT);
        $all[$inviteUser]['pw_eigen'] = true;
        kp_save_accounts($all);
        kp_fail_reset('kunde:' . $inviteUser);
        $_SESSION = ['csrf' => $_SESSION['csrf'], 'seen' => time()];
        if (!empty($all[$inviteUser]['aktiv']) && !tf_active(tf_kunde_file($inviteUser))) {
            kp_kunde_login($inviteUser);
            kp_flash(true, 'Dein Passwort ist gespeichert. Willkommen im Kundenportal!');
        } else {
            session_regenerate_id(true);
            kp_flash(true, 'Dein Passwort ist gespeichert. Bitte melde dich jetzt damit an.');
        }
        kp_redirect('/kunden/');
    }

    if ($acc === null) {
        kp_flash(false, 'Bitte melde dich zuerst an.');
        kp_redirect('/kunden/');
    }

    if ($action === 'abmelden') {
        $_SESSION = [];
        session_regenerate_id(true);
        kp_flash(true, 'Du bist abgemeldet.');
        kp_redirect('/kunden/');
    }

    if ($action === 'hochladen') {
        $site = kp_text('webseite', 200);
        $msg = kp_text('nachricht', 3000);
        if ($site === '') {
            kp_flash(false, 'Bitte gib an, für welche Webseite die Dateien sind.');
            kp_redirect('/kunden/#dateien');
        }
        if (cx_field('rechte', 5) !== 'ja') {
            kp_flash(false, 'Bitte bestätige, dass du die Bilder und Texte verwenden darfst.');
            kp_redirect('/kunden/#dateien');
        }
        [$ok, $text] = kp_store_upload($user, $acc, $site, $msg, kp_uploaded('dateien'));
        kp_flash($ok, $text);
        kp_redirect('/kunden/#dateien');
    }

    if ($action === 'loeschen') {
        [$ok, $text] = kp_delete_upload($user, cx_field('e', 30), cx_field('f', 120));
        kp_flash($ok, $text);
        kp_redirect('/kunden/#dateien');
    }

    if ($action === 'schreiben') {
        [$ok, $res] = kp_add_message($user, 'kunde', cx_field('art', 20), kp_text('text', KP_MSG_MAX));
        if ($ok) {
            kp_notify_message($user, $acc, $res);
        } else {
            kp_flash(false, $res);
        }
        kp_redirect('/kunden/#nachrichten');
    }

    if ($action === 'freigeben') {
        if (!kp_freigabe_moeglich($acc)) {
            kp_flash(false, 'Diese Vorschau ist schon freigegeben oder gerade nicht zur Freigabe bereit.');
        } elseif (cx_field('sicher', 5) !== 'ja') {
            kp_flash(false, 'Bitte setz zur Bestätigung das Häkchen.');
        } else {
            $all = kp_accounts();
            $all[$user]['freigabe'] = ['zeit' => date('c'), 'url' => kp_clean_url((string) ($acc['vorschau'] ?? ''))];
            if (kp_save_accounts($all)) {
                // Im Verlauf festhalten, damit die Freigabe auch schriftlich bei den Nachrichten steht
                [$ok, $res] = kp_add_message($user, 'kunde', 'gefaellt', 'Ich gebe den Entwurf frei: Die Vorschau passt so und darf online gehen. (' . $all[$user]['freigabe']['url'] . ')');
                if ($ok) {
                    kp_notify_message($user, $all[$user], $res, "✅ <b>Entwurf freigegeben</b>\nim Kundenportal");
                }
                kp_flash(true, 'Danke! Der Entwurf ist freigegeben, ich mache mich an die letzten Schritte.');
            } else {
                kp_flash(false, 'Das hat nicht geklappt. Bitte versuche es noch einmal oder schreib mir.');
            }
        }
        kp_redirect('/kunden/');
    }

    if ($action === 'betreuung') {
        $paket = cx_field('paket', 20);
        if (!kp_betreuung_offen($acc)) {
            kp_flash(false, 'Deine Webseite ist schon online. Für einen Wechsel oder eine Kündigung schreib mir bitte kurz eine Nachricht.');
        } elseif (!isset(KP_BETREUUNG[$paket])) {
            kp_flash(false, 'Bitte wähle eines der Pakete oder „Keine Betreuung“.');
        } elseif ($paket === kp_betreuung($acc)) {
            kp_flash(true, 'Passt, das hattest du schon so ausgewählt.');
        } else {
            $vorher = kp_betreuung($acc);
            $all = kp_accounts();
            $all[$user]['betreuung'] = ['paket' => $paket, 'zeit' => date('c'), 'von' => 'kunde'];
            if (kp_save_accounts($all)) {
                [$name, $preis] = KP_BETREUUNG[$paket];
                $text = $paket === 'keine'
                    ? 'Betreuung: Ich möchte nach dem Livegang keine Betreuung.'
                    : 'Betreuung: Ich wähle das Paket ' . $name . ' (' . $preis . ' € im Monat, ab dem Livegang).';
                if ($vorher !== '') {
                    $text .= ' Vorher: ' . kp_betreuung_label($vorher) . '.';
                }
                [$ok, $res] = kp_add_message($user, 'kunde', 'nachricht', $text);
                if ($ok) {
                    kp_notify_message($user, $all[$user], $res, '🛟 <b>Betreuung ' . ($vorher !== '' ? 'geändert' : 'gewählt') . ': ' . cx_h(kp_betreuung_label($paket)) . "</b>\nim Kundenportal");
                }
                kp_flash(true, $paket === 'keine'
                    ? 'Gespeichert: keine Betreuung. Falls du es dir anders überlegst, kannst du es bis zum Livegang hier ändern.'
                    : 'Danke! Gespeichert: ' . kp_betreuung_label($paket) . '. Zu zahlen erst ab dem Livegang.');
            } else {
                kp_flash(false, 'Das hat nicht geklappt. Bitte versuche es noch einmal oder schreib mir.');
            }
        }
        kp_redirect('/kunden/');
    }

    if ($action === 'passwort') {
        $old = (string) ($_POST['alt'] ?? '');
        $new = (string) ($_POST['neu'] ?? '');
        $keys = ['ip:' . kp_ip_hash(), 'kunde:' . $user];
        $pwOk = kp_try($keys) ? password_verify($old, (string) $acc['hash']) : null;
        if ($pwOk) {
            kp_untry($keys);
        }
        if ($pwOk === null) {
            kp_flash(false, 'Zu viele Fehlversuche. Bitte warte 15 Minuten.');
        } elseif (!$pwOk) {
            kp_fail_wait();
            kp_flash(false, 'Dein bisheriges Passwort stimmt nicht.');
        } elseif (strlen($new) < 10 || strlen($new) > 200) {
            kp_flash(false, 'Das neue Passwort muss mindestens 10 Zeichen lang sein.');
        } elseif ($new !== (string) ($_POST['neu2'] ?? '')) {
            kp_flash(false, 'Die beiden neuen Passwörter sind nicht gleich.');
        } else {
            $all = kp_accounts();
            $all[$user]['hash'] = password_hash($new, PASSWORD_DEFAULT);
            $all[$user]['pw_eigen'] = true;
            kp_save_accounts($all);
            session_regenerate_id(true);
            $_SESSION['kunde_pw'] = kp_pw_tag($all[$user]['hash']);
            kp_flash(true, 'Dein Passwort wurde geändert.');
        }
        kp_redirect('/kunden/#passwort');
    }

    // Freiwillige Zwei-Faktor-Anmeldung: einschalten, Notfall-Codes erneuern, ausschalten.
    if ($action === 'tf_ein' || $action === 'tf_neu' || $action === 'tf_aus') {
        $file = tf_kunde_file($user);
        $back = '/kunden/#zweifaktor';
        // Die Meldung erscheint dann direkt im Bereich „Zwei-Faktor-Anmeldung“, nicht oben auf der Seite.
        $_SESSION['tf_flash'] = 1;
        $input = (string) ($_POST['code'] ?? '');
        $keys = ['ip:' . kp_ip_hash(), 'kunde:' . $user];
        if (!kp_try($keys)) {
            kp_flash(false, 'Zu viele Fehlversuche. Bitte warte 15 Minuten.');
            kp_redirect($back);
        }
        if ($action === 'tf_ein') {
            $secret = (string) ($_SESSION['tf_neu_kunde'] ?? '');
            $step = tf_active($file) ? null : tf_match($secret, $input);
            if ($step === null) {
                kp_fail_wait();
                kp_flash(false, 'Der Code stimmt nicht. Bitte gib den 6-stelligen Code ein, der gerade in der App steht.');
            } else {
                kp_untry($keys);
                $codes = tf_new_backups();
                if (tf_enable($secret, $step, $codes, $file)) {
                    unset($_SESSION['tf_neu_kunde']);
                    $_SESSION['tf_codes_kunde'] = $codes;
                    kp_flash(true, 'Die Zwei-Faktor-Anmeldung ist eingeschaltet. Ab jetzt fragt die Anmeldung zusätzlich nach dem Code aus der App.');
                } else {
                    kp_flash(false, 'Das hat nicht geklappt. Bitte versuche es noch einmal oder schreib mir.');
                }
            }
            kp_redirect($back);
        }
        // Erneuern und Ausschalten nur mit einem aktuellen Code (oder einem Notfall-Code), damit ein offen gelassenes Gerät allein nicht reicht.
        if ($action === 'tf_aus' && cx_field('sicher', 5) !== 'ja') {
            kp_flash(false, 'Zum Ausschalten bitte das Häkchen setzen.');
        } elseif (tf_check($input, true, $file) === '') {
            kp_fail_wait();
            kp_flash(false, 'Der Code stimmt nicht. Bitte gib den aktuellen Code aus der App oder einen Notfall-Code ein.');
        } elseif ($action === 'tf_aus') {
            kp_untry($keys);
            tf_disable($file);
            kp_flash(true, 'Die Zwei-Faktor-Anmeldung ist ausgeschaltet. Den Eintrag in der App kannst du jetzt löschen.');
        } else {
            kp_untry($keys);
            $d = tf_state($file);
            $codes = tf_new_backups();
            $d['notfall'] = tf_hash_backups($codes);
            tf_save($d, $file);
            $_SESSION['tf_codes_kunde'] = $codes;
            kp_flash(true, 'Neue Notfall-Codes erzeugt. Die alten gelten ab sofort nicht mehr.');
        }
        kp_redirect($back);
    }

    kp_redirect('/kunden/');
}

$flash = kp_take_flash();
$csrf = kp_csrf_field();
$tfFlash = '';
if (!empty($_SESSION['tf_flash'])) {
    unset($_SESSION['tf_flash']);
    if ($acc !== null) {
        [$tfFlash, $flash] = [$flash, ''];
    }
}

// ---------------- Eigenes Passwort festlegen (Link aus der Willkommensmail) ----------------
if ($inviteUser !== '' && isset($_GET['willkommen'])) {
    $hu = cx_h($inviteUser);
    kp_page('Passwort festlegen', <<<HTML
<div class="kp-narrow kp-auth">
  <span class="kp-auth__ico" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l3 3M14 9l2 2"/></svg></span>
  <span class="label"><b>●</b> Kundenportal</span>
  <h1>Willkommen!</h1>
  <p class="lead">Leg jetzt dein eigenes Passwort fest. Damit meldest du dich ab sofort im Kundenportal an.</p>
  <form class="form" method="post" action="/kunden/?willkommen">
    {$csrf}
    <input type="hidden" name="aktion" value="festlegen">
    {$flash}
    <label class="form__field"><span>Benutzername</span><input type="text" name="benutzer" value="{$hu}" readonly autocomplete="username"></label>
    <label class="form__field"><span>Neues Passwort <em>(mind. 10 Zeichen)</em></span><span class="kp-pw"><input type="password" name="neu" required minlength="10" maxlength="200" autocomplete="new-password" data-kp-reveal autofocus></span></label>
    <label class="form__field"><span>Passwort wiederholen</span><input type="password" name="neu2" required minlength="10" maxlength="200" autocomplete="new-password"></label>
    <p class="kp-hint">Tipp: Ein kurzer Satz ist sicher und leicht zu merken, z. B. „Kaffee am Morgen um sieben“. Bitte nirgends sonst verwenden.</p>
    <button class="btn" type="submit">Passwort speichern</button>
  </form>
</div>
HTML);
}

// ---------------- Anmeldung, zweiter Schritt: Code aus der App ----------------
if ($codeStep) {
    kp_page('Code bestätigen', <<<HTML
<div class="kp-narrow kp-auth">
  <span class="kp-auth__ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3l7 3v5.5c0 4.3-2.9 8.1-7 9.5-4.1-1.4-7-5.2-7-9.5V6z"/><path d="M9 12l2.2 2.2L15.5 10"/></svg></span>
  <span class="label"><b>●</b> Kundenportal</span>
  <h1>Code bestätigen</h1>
  <p class="lead">Öffne deine Authenticator-App und gib den 6-stelligen Code für <b>tim-kofler.at</b> ein.</p>
  <form class="form" method="post" action="/kunden/">
    {$csrf}
    <input type="hidden" name="aktion" value="code">
    {$flash}
    <label class="form__field"><span>Code aus der App</span><input class="kp-otp" type="text" name="code" required inputmode="numeric" autocomplete="one-time-code" pattern="[0-9 ]{6,7}" maxlength="7" placeholder="123 456" autofocus></label>
    <button class="btn" type="submit">Anmelden</button>
  </form>
  <details class="kp-more">
    <summary>Handy nicht zur Hand?</summary>
    <form class="form form--small" method="post" action="/kunden/">
      {$csrf}
      <input type="hidden" name="aktion" value="code">
      <p class="kp-hint">Gib einen deiner Notfall-Codes ein. Jeder funktioniert nur ein einziges Mal. Handy und Codes verloren? Schreib mir auf <a href="https://wa.me/4367761773118" target="_blank" rel="noopener noreferrer">WhatsApp</a> oder an <a href="mailto:office@tim-kofler.at">office@tim-kofler.at</a>, dann schalte ich die Zwei-Faktor-Anmeldung für dich aus.</p>
      <label class="form__field"><span>Notfall-Code</span><input class="kp-otp" type="text" name="code" required autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="12" placeholder="abcd-efgh"></label>
      <button class="btn btn--line" type="submit">Mit Notfall-Code anmelden</button>
    </form>
  </details>
  <form class="kp-back" method="post" action="/kunden/">{$csrf}<input type="hidden" name="aktion" value="zurueck"><button type="submit">← Zurück zur Anmeldung</button></form>
</div>
HTML);
}

// ---------------- Anmeldung ----------------
if ($acc === null) {
    $lock = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
    // Glas-Anmeldung: Jeder Fehlversuch dieses Anschlusses zeigt einen Sprung mehr im Passwortfeld,
    // bei der Sperre friert die Karte ein und taut nach Ablauf der Wartezeit wieder auf (assets/js/kp-glas.js).
    $ipFails = kp_fails('ip:' . kp_ip_hash());
    $failN = min(count($ipFails), KP_FAILS);
    $failRest = $failN >= KP_FAILS ? max(1, min($ipFails) + KP_FAIL_WINDOW - time()) : 0;
    $frost = 'data-kp-frost data-fails="' . $failN . '" data-max="' . KP_FAILS . '" data-rest="' . $failRest . '"';
    kp_page('Anmelden', <<<HTML
<div class="kp-login">
  <div class="kp-login__form kp-auth">
    <span class="kp-auth__ico" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></span>
    <span class="label"><b>●</b> Kundenportal</span>
    <h1>Anmelden</h1>
    <p class="lead">Dein persönlicher Bereich für die neue Webseite deines Betriebs oder Vereins. Deinen Zugang bekommst du von mir per E-Mail oder persönlich.</p>
    <form class="form" method="post" action="/kunden/" {$frost}>
      {$csrf}
      <input type="hidden" name="aktion" value="anmelden">
      {$flash}
      <label class="form__field"><span>Benutzername</span><input type="text" name="benutzer" required maxlength="40" autocomplete="username" autocapitalize="none" spellcheck="false"></label>
      <label class="form__field"><span>Passwort</span><span class="kp-pw"><input type="password" name="passwort" required maxlength="200" autocomplete="current-password" data-kp-reveal></span></label>
      <button class="btn" type="submit">Anmelden</button>
    </form>
    <div class="kp-help">
      <span>Passwort vergessen? Schreib mir kurz:</span>
      <div class="kp-help__links">
        <a href="mailto:office@tim-kofler.at?subject=Kundenportal%3A%20Passwort%20vergessen"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6 8-6"/></svg>E-Mail</a>
        <a href="https://wa.me/4367761773118?text=Hallo%20Tim%2C%20ich%20habe%20mein%20Passwort%20f%C3%BCrs%20Kundenportal%20vergessen." target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z"/><path d="M9 8.6c0 3.3 3 6.4 6.4 6.4l1.2-1.4-2-1-.9.8a5 5 0 0 1-2.6-2.6l.8-.9-1-2z"/></svg>WhatsApp</a>
      </div>
    </div>
  </div>
  <aside class="kp-login__info" aria-label="Was dich im Kundenportal erwartet">
    <h2>Alles zu deiner Webseite an einem Ort</h2>
    <ul class="kp-features">
      <li><span class="kp-features__ico">1</span><span><b>Stand deiner Webseite</b>Du siehst jederzeit, in welchem Schritt wir gerade sind, und öffnest die Vorschau mit einem Klick.</span></li>
      <li><span class="kp-features__ico">2</span><span><b>Direkt mit mir schreiben</b>Wünsche, Fragen und Feedback landen sofort bei mir, ohne lange E-Mail-Ketten.</span></li>
      <li><span class="kp-features__ico">3</span><span><b>Dateien einfach hochladen</b>Logo, Fotos und Texte direkt vom Handy oder PC, auch viele auf einmal.</span></li>
    </ul>
    <p class="kp-secure">{$lock}<span>Verschlüsselte Verbindung. Deine Daten sehen nur du und ich, sie liegen auf einem Server in Deutschland.</span></p>
  </aside>
</div>
HTML);
}

// ---------------- Upload ----------------
$name = cx_h((string) ($acc['name'] ?? $user));
// Begrüßt wird mit dem Vornamen, wie im Gespräch.
$first = cx_h((string) (preg_split('/\s+/u', trim((string) ($acc['name'] ?? ''))) ?: [''])[0]) ?: $name;
$site = cx_h((string) ($acc['webseite'] ?? ''));
$maxFile = kp_max_file();
$maxPost = kp_max_post();
$maxFileH = cx_h(kp_bytes($maxFile));
$maxPostH = $maxPost < PHP_INT_MAX ? cx_h(kp_bytes($maxPost)) : '';
$accept = cx_h(implode(',', array_map(static fn($e) => '.' . $e, array_keys(KP_TYPES))));
$types = 'Fotos (JPG, PNG, WEBP, HEIC, GIF), Logos (SVG, PNG), PDF, Word, Excel, PowerPoint, TXT, ZIP und kurze Videos (MP4, MOV)';
$limit = 'Höchstens ' . $maxFileH . ' pro Datei' . ($maxPostH !== '' ? ' und ' . $maxPostH . ' pro Durchgang' : '') . ', bis zu ' . KP_MAX_FILES . ' Dateien auf einmal.';
$maxFiles = KP_MAX_FILES;
$postAttr = $maxPost < PHP_INT_MAX ? (string) $maxPost : '0';

$batches = kp_batches($user);
$history = '';
foreach ($batches as $b) {
    $files = '';
    $sum = 0;
    $cover = '';
    $del = static fn(string $f, string $label, string $ask) => '<form method="post" action="/kunden/#dateien" class="kp-del" data-kp-confirm="' . cx_h($ask) . '">' . $csrf
        . '<input type="hidden" name="aktion" value="loeschen"><input type="hidden" name="e" value="' . cx_h((string) $b['id']) . '"><input type="hidden" name="f" value="' . cx_h($f) . '">'
        . '<button type="submit" class="kp-del__btn" aria-label="' . cx_h($label) . '" title="' . cx_h($label) . '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg></button></form>';
    foreach ((array) ($b['dateien'] ?? []) as $d) {
        $ext = strtoupper(pathinfo((string) $d['original'], PATHINFO_EXTENSION));
        $orig = (string) $d['original'];
        // Bilder mit kleinem Vorschaubild, alles andere mit der Dateiendung.
        $thumb = isset(KP_PREVIEW[strtolower(pathinfo((string) $d['datei'], PATHINFO_EXTENSION))])
            ? '<img class="kp-thumb" src="/kunden/?vorschau=1&amp;e=' . rawurlencode((string) $b['id']) . '&amp;f=' . rawurlencode((string) $d['datei']) . '" alt="" width="42" height="42" loading="lazy">'
            : '<span class="kp-ext">' . cx_h(substr($ext, 0, 4)) . '</span>';
        // Das erste Bild steht auch zugeklappt vorne, damit man den Upload auf einen Blick erkennt.
        if ($cover === '' && str_starts_with($thumb, '<img')) {
            $cover = str_replace('class="kp-thumb"', 'class="kp-batch__cover"', $thumb);
        }
        $files .= '<li>' . $thumb . '<span class="kp-batch__name">' . cx_h($orig) . ' <em>' . kp_bytes((int) $d['bytes']) . '</em></span>'
            . $del((string) $d['datei'], '„' . $orig . '“ löschen', '„' . $orig . '“ wirklich löschen? Das kann nicht rückgängig gemacht werden.') . '</li>';
        $sum += (int) $d['bytes'];
    }
    $when = cx_h(date('d.m.Y, H:i', strtotime((string) ($b['zeit'] ?? 'now')) ?: time()));
    $n = count((array) ($b['dateien'] ?? []));
    $history .= '<details class="kp-batch"><summary><span class="kp-batch__n">' . ($cover !== '' ? $cover . '<i>' . $n . '</i>' : $n) . '</span><span><span><b>' . ($n === 1 ? '1 Datei' : $n . ' Dateien') . '</b> · ' . kp_bytes($sum) . '</span>'
        . '<small>' . $when . ' Uhr · ' . cx_h((string) ($b['webseite'] ?? '')) . '</small></span></summary><ul>' . $files . '</ul>'
        . (($b['nachricht'] ?? '') !== '' ? '<p>' . nl2br(cx_h((string) $b['nachricht'])) . '</p>' : '')
        . ($n > 1 ? '<div class="kp-batch__alle">' . str_replace(['kp-del__btn" aria-label', '</svg></button>'], ['kp-del__btn kp-del__btn--text" aria-label', '</svg>Ganzen Upload löschen</button>'],
            $del('', 'Ganzen Upload löschen', 'Alle ' . $n . ' Dateien dieses Uploads löschen? Das kann nicht rückgängig gemacht werden.')) . '</div>' : '') . '</details>';
}
if ($history === '') {
    $history = '<p class="muted kp-leer">Noch keine Dateien hochgeladen.</p>';
}
$nUploads = count($batches);

// Nachrichten: erst anzeigen (mit „neu“), dann als gelesen merken.
$msgs = kp_messages($user);
$unread = kp_unread($msgs, 'kunde');
$chat = kp_render_messages($msgs, 'kunde', (string) ($acc['name'] ?? $user));
$verein = kp_is_verein($acc);
$chatForm = kp_message_form('/kunden/#nachrichten', $csrf, $verein
    ? 'z. B. Die Farben passen super zu unserem Wappen. Können wir die Termine weiter oben zeigen?'
    : 'z. B. Die Farbe vom Kopfbereich gefällt mir sehr. Können wir die Öffnungszeiten größer machen?');
$needs = kp_needs($acc);
$notePh = $verein ? 'z. B. Das Gruppenfoto bitte auf die Startseite, die Termine gelten ab März.' : 'z. B. Das Foto mit dem Team bitte auf die Startseite, die Preise gelten ab Jänner.';
$sitePh = $verein ? 'z. B. musikverein-muster.at' : 'z. B. baeckerei-muster.at';
kp_mark_read($user, 'kunde');

// Die beiden großen Kacheln oben sind zugleich die Reiter. Ohne JavaScript stehen beide Bereiche untereinander.
$lastMsg = $msgs['liste'] ? end($msgs['liste']) : null;
$msgSub = $unread > 0 ? '<b>' . ($unread === 1 ? '1 neue Nachricht' : $unread . ' neue Nachrichten') . '</b> von Tim'
    : ($lastMsg ? 'Letzte Nachricht am ' . date('d.m.', strtotime((string) $lastMsg['zeit']) ?: 0) : 'Wünsche, Fragen und Feedback an Tim');
$fileSub = $nUploads > 0 ? ($nUploads === 1 ? '1 Upload' : $nUploads . ' Uploads') . ' bisher, gern weitere' : 'Fotos, Logo, Texte, Preislisten';
$badge = $unread > 0 ? '<span class="kp-badge">' . $unread . '</span>' : '';
$default = $unread > 0 || $nUploads > 0 || $msgs['liste'] ? 'nachrichten' : 'dateien';
$icoChat = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5z"/></svg>';
$icoUp = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5M4.5 15v2.5A2.5 2.5 0 0 0 7 20h10a2.5 2.5 0 0 0 2.5-2.5V15"/></svg>';

$project = kp_project_card($acc, true, '', $csrf);
$zahlen = kp_zahlen_card(kp_zahlen($user, $acc));
$betreuung = kp_betreuung_card($acc, $csrf);
// Kunde verwendet noch das Passwort, das Tim im Admin erzeugt hat: freundlich ans eigene Passwort erinnern.
$pwHint = ($acc['pw_eigen'] ?? null) === false
    ? '<p class="form__status kp-pw-hint" role="status">Du verwendest noch das Passwort, das ich dir gegeben habe. Bitte leg dir ein eigenes fest: <a href="#passwort">Passwort ändern</a></p>'
    : '';

// Zwei-Faktor-Anmeldung (freiwillig): Einrichtung oder Stand, neue Notfall-Codes werden genau einmal angezeigt.
$tfFile = tf_kunde_file($user);
$tfState = tf_state($tfFile);
$tfCodes = '';
if (!empty($_SESSION['tf_codes_kunde'])) {
    $list = (array) $_SESSION['tf_codes_kunde'];
    unset($_SESSION['tf_codes_kunde']);
    $items = implode('', array_map(static fn($c) => '<li>' . cx_h((string) $c) . '</li>', $list));
    $text = "Notfall-Codes für das Kundenportal tim-kofler.at/kunden/ (je einmal verwendbar, erzeugt am " . date('d.m.Y') . ")\n" . implode("\n", $list);
    $tfCodes = '<div class="kp-secret kp-codes"><p><b>Deine Notfall-Codes</b> – werden nur jetzt angezeigt.</p>'
        . '<p>Damit kommst du hinein, wenn das Handy weg oder kaputt ist. Jeder Code funktioniert einmal. Am besten ausdrucken oder abfotografieren und nicht nur am selben Handy wie die App aufheben.</p>'
        . '<ol class="kp-codes__list">' . $items . '</ol><pre hidden data-kp-copy>' . cx_h($text) . '</pre>'
        . '<button class="btn btn--sm" type="button" data-kp-copy-btn>Alle kopieren</button></div>';
}
$otp = '<label class="form__field"><span>Code aus der App oder Notfall-Code</span><input class="kp-otp kp-otp--frei" type="text" name="code" required autocomplete="one-time-code" autocapitalize="none" spellcheck="false" maxlength="12" placeholder="123 456"></label>';
$tfScript = '';
if ($tfState) {
    $tfSeit = cx_h(date('d.m.Y', strtotime((string) ($tfState['seit'] ?? '')) ?: time()));
    $tfLeft = count((array) ($tfState['notfall'] ?? []));
    $tfLeftTxt = $tfLeft === 1 ? '1 Notfall-Code' : $tfLeft . ' Notfall-Codes';
    $tfWarn = $tfLeft <= 2 ? ' <span class="kp-badge">bald neue erzeugen</span>' : '';
    $tfChip = '<span class="kp-chip-st kp-chip-st--aktiv">ein</span>';
    $tfBody = <<<HTML
<p class="kp-on"><span class="kp-on__dot" aria-hidden="true"></span><span><b>Eingeschaltet</b> seit {$tfSeit} · noch {$tfLeftTxt} übrig{$tfWarn}</span></p>
<p class="kp-hint">Bei jeder Anmeldung fragt das Portal zusätzlich nach dem Code aus deiner App. Handy verloren und keine Notfall-Codes mehr? Schreib mir auf WhatsApp oder per E-Mail, dann schalte ich es für dich aus.</p>
<div class="kp-grid kp-grid--even kp-tf-actions">
  <form class="form form--small" method="post" action="/kunden/#zweifaktor">
    {$csrf}
    <input type="hidden" name="aktion" value="tf_neu">
    <h3>Neue Notfall-Codes</h3>
    <p class="kp-hint">Erzeugt zehn neue Codes, die alten gelten danach nicht mehr.</p>
    {$otp}
    <button class="btn btn--line" type="submit">Neue Codes erzeugen</button>
  </form>
  <form class="form form--small" method="post" action="/kunden/#zweifaktor">
    {$csrf}
    <input type="hidden" name="aktion" value="tf_aus">
    <h3>Ausschalten</h3>
    <p class="kp-hint">Danach reicht wieder das Passwort allein. Für ein neues Handy einfach ausschalten und neu einrichten.</p>
    {$otp}
    <label class="kp-confirm"><input type="checkbox" name="sicher" value="ja" required> Ja, ausschalten</label>
    <button class="btn btn--line" type="submit">Ausschalten</button>
  </form>
</div>
HTML;
} else {
    if (empty($_SESSION['tf_neu_kunde'])) {
        $_SESSION['tf_neu_kunde'] = tf_new_secret();
    }
    $tfSecret = (string) $_SESSION['tf_neu_kunde'];
    $tfUri = cx_h(tf_uri($tfSecret, 'Kundenportal ' . $user));
    $tfPretty = cx_h(tf_pretty($tfSecret));
    $tfChip = '<span class="kp-chip-st">freiwillig</span>';
    $tfScript = '<script src="/beispiele/_shared/vendor/qrcode-generator-2.0.4/qrcode.js"></script><script src="/assets/js/tk-qr.js?v=1"></script>';
    $tfBody = <<<HTML
<p class="kp-hint">Freiwilliger Extraschutz: Zur Anmeldung brauchst du dann zusätzlich einen Code, den nur dein Handy anzeigt. Dauert etwa zwei Minuten. Ohne geht es genauso, dein Zugang ist auch so gut geschützt.</p>
<ol class="kp-steps">
  <li>
    <h3>App installieren</h3>
    <p>Lade <b>Google Authenticator</b> oder <b>Microsoft Authenticator</b> aus dem App Store bzw. Google Play.</p>
  </li>
  <li>
    <h3>QR-Code scannen</h3>
    <p>In der App auf <b>+</b> tippen, dann <b>QR-Code scannen</b>.</p>
    <div class="kp-qr" data-kp-qr="{$tfUri}" role="img" aria-label="QR-Code für die Authenticator-App"><noscript>Der QR-Code braucht JavaScript. Nimm stattdessen den Schlüssel darunter.</noscript></div>
    <details class="kp-more">
      <summary>Am selben Handy? Schlüssel abtippen</summary>
      <p class="kp-hint">In der App <b>Einrichtungsschlüssel eingeben</b> wählen, Art: <b>zeitbasiert</b>.</p>
      <code class="kp-key">{$tfPretty}</code>
    </details>
  </li>
  <li>
    <h3>Code bestätigen</h3>
    <p>Gib den 6-stelligen Code ein, der jetzt in der App bei <b>tim-kofler.at</b> steht.</p>
    <form class="form form--small" method="post" action="/kunden/#zweifaktor">
      {$csrf}
      <input type="hidden" name="aktion" value="tf_ein">
      <label class="form__field"><span>Code aus der App</span><input class="kp-otp" type="text" name="code" required inputmode="numeric" autocomplete="one-time-code" pattern="[0-9 ]{6,7}" maxlength="7" placeholder="123 456"></label>
      <button class="btn" type="submit">Bestätigen und einschalten</button>
    </form>
  </li>
</ol>
HTML;
}
$tfOpen = $tfCodes !== '' || $tfFlash !== '' ? ' open' : '';

$logout = '<a class="btn btn--sm btn--line" href="#passwort">Passwort</a>'
    . '<form method="post" action="/kunden/">' . $csrf . '<input type="hidden" name="aktion" value="abmelden"><button class="btn btn--sm btn--line" type="submit">Abmelden</button></form>';

kp_page('Kundenportal', <<<HTML
<span class="label"><b>●</b> Kundenportal</span>
<h1 class="kp-hello">Hallo {$first}!</h1>
<p class="lead kp-intro">Hier hast du alles zu deiner Webseite an einem Ort: wie weit wir sind, unsere Nachrichten und deine Dateien.</p>
{$flash}
{$pwHint}
{$project}
{$betreuung}
{$zahlen}
<nav class="kp-tiles" data-kp-tabs data-default="{$default}" aria-label="Bereiche">
  <a class="kp-tile" href="#nachrichten" data-kp-tab="nachrichten">
    <span class="kp-tile__ico">{$icoChat}</span>
    <span class="kp-tile__txt"><b>Nachrichten {$badge}</b><small>{$msgSub}</small></span>
  </a>
  <a class="kp-tile" href="#dateien" data-kp-tab="dateien">
    <span class="kp-tile__ico">{$icoUp}</span>
    <span class="kp-tile__txt"><b>Dateien hochladen</b><small>{$fileSub}</small></span>
  </a>
</nav>

<section class="kp-panel" data-kp-panel="nachrichten">
  <div class="kp-card kp-chat">
    <div class="kp-card__kopf">
      <h2>Nachrichten mit Tim</h2>
      <p>Wähle aus, worum es geht: einen <b>Wunsch</b>, eine <b>Frage</b>, oder was dir <b>gefällt</b> bzw. <b>nicht gefällt</b>. Ich antworte hier, meistens noch am selben Tag.</p>
    </div>
    {$chat}
    {$chatForm}
  </div>
</section>

<section class="kp-panel" data-kp-panel="dateien">
  <div class="kp-grid">
    <form class="kp-card form kp-upload" method="post" action="/kunden/" enctype="multipart/form-data" data-kp-upload data-max-file="{$maxFile}" data-max-post="{$postAttr}" data-max-count="{$maxFiles}">
      {$csrf}
      <input type="hidden" name="aktion" value="hochladen">
      <div class="kp-card__kopf">
        <h2>Dateien hochladen</h2>
        <p>Alles, was auf deine Webseite soll. Ich bekomme sofort Bescheid.</p>
      </div>
      {$needs}
      <label class="kp-pick">
        <input type="file" name="dateien[]" multiple required accept="{$accept}">
        <span class="kp-pick__ico">{$icoUp}</span>
        <b>Dateien auswählen</b>
        <span class="kp-pick__oder">oder hierher ziehen</span>
        <span class="kp-pick__info">Keine Datei ausgewählt</span>
      </label>
      <p class="kp-hint">{$types}. {$limit}</p>
      <label class="form__field"><span>Für welche Webseite?</span><input type="text" name="webseite" required maxlength="200" value="{$site}" placeholder="{$sitePh}"></label>
      <label class="form__field"><span>Kurze Notiz dazu <em>(optional)</em></span><textarea name="nachricht" rows="3" maxlength="3000" placeholder="{$notePh}"></textarea></label>
      <label class="form__check"><input type="checkbox" name="rechte" value="ja" required><span>Ich darf diese Bilder und Texte für meine Webseite verwenden (z. B. selbst fotografiert oder mit Erlaubnis der Fotografin bzw. des Fotografen).</span></label>
      <div class="kp-progress" hidden><div class="kp-progress__bar"></div><span class="kp-progress__text"></span></div>
      <button class="btn" type="submit">Hochladen</button>
    </form>
    <div class="kp-card">
      <div class="kp-card__kopf"><h2>Bisher hochgeladen</h2></div>
      {$history}
    </div>
  </div>
</section>

<aside class="kp-card kp-tim" aria-label="Dein Ansprechpartner">
  <img class="kp-tim__foto" src="/assets/img/team/tim-portrait.webp?v=3" alt="Tim Kofler" width="64" height="64" loading="lazy">
  <div class="kp-tim__txt"><b>Tim Kofler</b><small>Dein Ansprechpartner für die Webseite. Lieber reden als schreiben? Ruf mich einfach an.</small></div>
  <div class="kp-tim__links">
    <a class="btn btn--sm btn--line" href="tel:+4367761773118">Anrufen</a>
    <a class="btn btn--sm btn--line" href="https://wa.me/4367761773118" target="_blank" rel="noopener noreferrer">WhatsApp</a>
    <a class="btn btn--sm btn--line" href="mailto:office@tim-kofler.at">E-Mail</a>
  </div>
</aside>

<details class="kp-card kp-konto" id="passwort">
  <summary><h2>Passwort ändern</h2></summary>
  <form class="form form--small" method="post" action="/kunden/#passwort">
    {$csrf}
    <input type="hidden" name="aktion" value="passwort">
    <label class="form__field"><span>Bisheriges Passwort</span><input type="password" name="alt" required maxlength="200" autocomplete="current-password"></label>
    <label class="form__field"><span>Neues Passwort <em>(mind. 10 Zeichen)</em></span><input type="password" name="neu" required minlength="10" maxlength="200" autocomplete="new-password"></label>
    <label class="form__field"><span>Neues Passwort wiederholen</span><input type="password" name="neu2" required minlength="10" maxlength="200" autocomplete="new-password"></label>
    <button class="btn btn--line" type="submit">Passwort ändern</button>
  </form>
</details>

<details class="kp-card kp-konto kp-tf-kunde" id="zweifaktor"{$tfOpen}>
  <summary><h2>Zwei-Faktor-Anmeldung {$tfChip}</h2></summary>
  <div class="kp-konto__body">
    {$tfFlash}
    {$tfCodes}
    {$tfBody}
  </div>
</details>
{$tfScript}
HTML, $logout);
