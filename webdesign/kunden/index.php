<?php
// Tim Kofler – Kundenportal: Anmeldung und Datei-Upload für Kunden.

declare(strict_types=1);

require __DIR__ . '/../api/kunden-lib.php';

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

// Zu große Uploads: PHP verwirft dann das ganze Formular, auch den Formular-Schlüssel.
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && !$_POST && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
    kp_flash(false, 'Das waren zu viele Daten auf einmal (höchstens ' . kp_bytes(kp_max_post()) . ' pro Durchgang). Bitte lade die Dateien in mehreren kleineren Portionen hoch.');
    kp_redirect('/kunden/');
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
        kp_fail_reset('kunde:' . $name);
        session_regenerate_id(true);
        $_SESSION['kunde'] = $name;
        $all = kp_accounts();
        $all[$name]['letzte_anmeldung'] = date('c');
        if (password_needs_rehash((string) $a['hash'], PASSWORD_DEFAULT)) {
            $all[$name]['hash'] = password_hash($pass, PASSWORD_DEFAULT);
        }
        kp_save_accounts($all);
        $_SESSION['kunde_pw'] = kp_pw_tag((string) $all[$name]['hash']);
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
            kp_redirect('/kunden/');
        }
        if (cx_field('rechte', 5) !== 'ja') {
            kp_flash(false, 'Bitte bestätige, dass du die Bilder und Texte verwenden darfst.');
            kp_redirect('/kunden/');
        }
        [$ok, $text] = kp_store_upload($user, $acc, $site, $msg, kp_uploaded('dateien'));
        kp_flash($ok, $text);
        kp_redirect('/kunden/');
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
            kp_save_accounts($all);
            session_regenerate_id(true);
            $_SESSION['kunde_pw'] = kp_pw_tag($all[$user]['hash']);
            kp_flash(true, 'Dein Passwort wurde geändert.');
        }
        kp_redirect('/kunden/');
    }

    kp_redirect('/kunden/');
}

$flash = kp_take_flash();
$csrf = kp_csrf_field();

// ---------------- Anmeldung ----------------
if ($acc === null) {
    kp_page('Anmelden', <<<HTML
<div class="kp-narrow">
  <span class="label"><b>●</b> Kundenportal</span>
  <h1>Anmelden</h1>
  <p class="lead">Hier lädst du Bilder, Logos und Texte für deine neue Webseite hoch. Deine Zugangsdaten bekommst du von mir persönlich.</p>
  <form class="form" method="post" action="/kunden/">
    {$csrf}
    <input type="hidden" name="aktion" value="anmelden">
    {$flash}
    <label class="form__field"><span>Benutzername</span><input type="text" name="benutzer" required maxlength="40" autocomplete="username" autocapitalize="none" spellcheck="false"></label>
    <label class="form__field"><span>Passwort</span><input type="password" name="passwort" required maxlength="200" autocomplete="current-password"></label>
    <button class="btn" type="submit">Anmelden</button>
    <p class="form__alt">Passwort vergessen? Schreib mir an <a href="mailto:office@tim-kofler.at">office@tim-kofler.at</a> oder ruf mich an unter <a href="tel:+4367761773118">+43 677 61773118</a>.</p>
  </form>
</div>
HTML);
}

// ---------------- Upload ----------------
$name = cx_h((string) ($acc['name'] ?? $user));
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

$history = '';
foreach (kp_batches($user) as $b) {
    $files = '';
    $sum = 0;
    foreach ((array) ($b['dateien'] ?? []) as $d) {
        $files .= '<li>' . cx_h((string) $d['original']) . ' <em>' . kp_bytes((int) $d['bytes']) . '</em></li>';
        $sum += (int) $d['bytes'];
    }
    $when = cx_h(date('d.m.Y, H:i', strtotime((string) ($b['zeit'] ?? 'now')) ?: time()));
    $n = count((array) ($b['dateien'] ?? []));
    $history .= '<details class="kp-batch"><summary><b>' . $when . ' Uhr</b> · ' . cx_h((string) ($b['webseite'] ?? '')) . ' · '
        . $n . ($n === 1 ? ' Datei' : ' Dateien') . ' (' . kp_bytes($sum) . ')</summary><ul>' . $files . '</ul>'
        . (($b['nachricht'] ?? '') !== '' ? '<p>' . nl2br(cx_h((string) $b['nachricht'])) . '</p>' : '') . '</details>';
}
if ($history === '') {
    $history = '<p class="muted">Noch keine Dateien hochgeladen.</p>';
}

// Nachrichten: erst anzeigen (mit „neu“), dann als gelesen merken.
$msgs = kp_messages($user);
$unread = kp_unread($msgs, 'kunde');
$chat = kp_render_messages($msgs, 'kunde', (string) ($acc['name'] ?? $user));
$chatForm = kp_message_form('/kunden/#nachrichten', $csrf, 'z. B. Die Farbe vom Kopfbereich gefällt mir sehr. Können wir die Öffnungszeiten größer machen?');
kp_mark_read($user, 'kunde');
$hinweis = $unread > 0 ? '<a class="kp-neu" href="#nachrichten"><b>' . $unread . '</b> ' . ($unread === 1 ? 'neue Nachricht' : 'neue Nachrichten') . ' von Tim. Jetzt lesen</a>' : '';

$logout = '<a class="btn btn--sm btn--line" href="#nachrichten">Nachrichten' . ($unread > 0 ? ' <span class="kp-badge">' . $unread . '</span>' : '') . '</a>'
    . '<form method="post" action="/kunden/">' . $csrf . '<input type="hidden" name="aktion" value="abmelden"><button class="btn btn--sm btn--line" type="submit">Abmelden</button></form>';

kp_page('Dateien hochladen', <<<HTML
<div class="kp-grid">
  <div>
    <span class="label"><b>●</b> Kundenportal</span>
    <h1>Hallo {$name}!</h1>
    {$hinweis}
    <p class="lead">Lade hier alles hoch, was auf deine Webseite soll: Fotos, Logo, Texte, Speisekarte, Preislisten. Ich bekomme sofort Bescheid und melde mich, sobald es weitergeht.</p>
    <form class="form" method="post" action="/kunden/" enctype="multipart/form-data" data-kp-upload data-max-file="{$maxFile}" data-max-post="{$postAttr}" data-max-count="{$maxFiles}">
      {$csrf}
      <input type="hidden" name="aktion" value="hochladen">
      {$flash}
      <label class="form__field"><span>Für welche Webseite?</span><input type="text" name="webseite" required maxlength="200" value="{$site}" placeholder="z. B. baeckerei-muster.at"></label>
      <div class="form__field"><span>Dateien</span>
        <label class="kp-pick"><input type="file" name="dateien[]" multiple required accept="{$accept}"><b>Dateien auswählen</b><span class="kp-pick__info">Keine Datei ausgewählt</span></label></div>
      <p class="kp-hint">{$types}. {$limit}</p>
      <label class="form__field"><span>Nachricht an Tim <em>(optional)</em></span><textarea name="nachricht" rows="4" maxlength="3000" placeholder="z. B. Das Foto mit dem Team bitte auf die Startseite, die Preise gelten ab Jänner."></textarea></label>
      <label class="form__check"><input type="checkbox" name="rechte" value="ja" required><span>Ich darf diese Bilder und Texte für meine Webseite verwenden (z. B. selbst fotografiert oder mit Erlaubnis der Fotografin bzw. des Fotografen).</span></label>
      <div class="kp-progress" hidden><div class="kp-progress__bar"></div><span class="kp-progress__text"></span></div>
      <button class="btn" type="submit">Hochladen</button>
    </form>
  </div>
  <aside>
    <section class="kp-chat" id="nachrichten">
      <h2>Nachrichten mit Tim</h2>
      <p class="kp-chat__info">Hier hast du alles zu deiner Webseite an einem Ort: Wünsche, Fragen und was dir gefällt oder nicht.</p>
      {$chat}
      {$chatForm}
    </section>
    <h2>Bisher hochgeladen</h2>
    {$history}
    <h2 id="passwort">Passwort ändern</h2>
    <form class="form form--small" method="post" action="/kunden/#passwort">
      {$csrf}
      <input type="hidden" name="aktion" value="passwort">
      <label class="form__field"><span>Bisheriges Passwort</span><input type="password" name="alt" required maxlength="200" autocomplete="current-password"></label>
      <label class="form__field"><span>Neues Passwort <em>(mind. 10 Zeichen)</em></span><input type="password" name="neu" required minlength="10" maxlength="200" autocomplete="new-password"></label>
      <label class="form__field"><span>Neues Passwort wiederholen</span><input type="password" name="neu2" required minlength="10" maxlength="200" autocomplete="new-password"></label>
      <button class="btn btn--line" type="submit">Passwort ändern</button>
    </form>
  </aside>
</div>
HTML, $logout);
