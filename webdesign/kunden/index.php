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
        kp_redirect('/kunden/#passwort');
    }

    kp_redirect('/kunden/');
}

$flash = kp_take_flash();
$csrf = kp_csrf_field();

// ---------------- Anmeldung ----------------
if ($acc === null) {
    $lock = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
    kp_page('Anmelden', <<<HTML
<div class="kp-login">
  <div class="kp-login__form">
    <span class="label"><b>●</b> Kundenportal</span>
    <h1>Anmelden</h1>
    <p class="lead">Dein persönlicher Bereich für die neue Webseite deines Betriebs oder Vereins. Die Zugangsdaten bekommst du von mir persönlich.</p>
    <form class="form" method="post" action="/kunden/">
      {$csrf}
      <input type="hidden" name="aktion" value="anmelden">
      {$flash}
      <label class="form__field"><span>Benutzername</span><input type="text" name="benutzer" required maxlength="40" autocomplete="username" autocapitalize="none" spellcheck="false"></label>
      <label class="form__field"><span>Passwort</span><span class="kp-pw"><input type="password" name="passwort" required maxlength="200" autocomplete="current-password" data-kp-reveal></span></label>
      <button class="btn" type="submit">Anmelden</button>
      <p class="form__alt">Passwort vergessen? Schreib mir an <a href="mailto:office@tim-kofler.at">office@tim-kofler.at</a> oder ruf mich an unter <a href="tel:+4367761773118">+43 677 61773118</a>.</p>
    </form>
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

$project = kp_project_card($acc, true);

$logout = '<a class="btn btn--sm btn--line" href="#passwort">Passwort</a>'
    . '<form method="post" action="/kunden/">' . $csrf . '<input type="hidden" name="aktion" value="abmelden"><button class="btn btn--sm btn--line" type="submit">Abmelden</button></form>';

kp_page('Kundenportal', <<<HTML
<span class="label"><b>●</b> Kundenportal</span>
<h1 class="kp-hello">Hallo {$first}!</h1>
<p class="lead kp-intro">Hier hast du alles zu deiner Webseite an einem Ort: wie weit wir sind, unsere Nachrichten und deine Dateien.</p>
{$flash}
{$project}
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
  <img class="kp-tim__foto" src="/assets/img/team/tim-portrait.webp" alt="Tim Kofler" width="64" height="64" loading="lazy">
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
HTML, $logout);
