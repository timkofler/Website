<?php
// Tim Kofler – Kundenportal, Admin-Bereich: Kunden anlegen, Zugänge verwalten, Uploads ansehen und herunterladen.

declare(strict_types=1);

require __DIR__ . '/../../api/kunden-lib.php';

kp_headers();
kp_session();

const KP_ADMIN = '/kunden/admin/';

$hash = (string) (cx_config()['admin_password_hash'] ?? '');
$isAdmin = $hash !== '' && !empty($_SESSION['admin']);
$k = (string) ($_GET['k'] ?? '');
$k = kp_valid_user($k) ? $k : '';

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
        if (kp_blocked($keys)) {
            kp_flash(false, 'Zu viele Fehlversuche. Bitte 15 Minuten warten.');
        } elseif (!password_verify((string) ($_POST['passwort'] ?? ''), $hash)) {
            kp_fail($keys);
            kp_flash(false, 'Das Passwort stimmt nicht.');
        } else {
            kp_fail_reset('admin');
            session_regenerate_id(true);
            $_SESSION['admin'] = true;
        }
        kp_redirect(KP_ADMIN . ($k !== '' ? '?k=' . $k : ''));
    }

    if (!$isAdmin) {
        kp_redirect(KP_ADMIN);
    }

    if ($action === 'abmelden') {
        $_SESSION = [];
        session_regenerate_id(true);
        kp_redirect(KP_ADMIN);
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
                'webseite' => kp_text('webseite', 200), 'hash' => password_hash($pw, PASSWORD_DEFAULT),
                'aktiv' => true, 'erstellt' => date('c'),
            ];
            if (kp_save_accounts($all)) {
                $_SESSION['zugang'] = ['benutzer' => $u, 'passwort' => $pw];
                kp_redirect(KP_ADMIN . '?k=' . $u);
            }
            kp_flash(false, 'Das Konto konnte nicht gespeichert werden (Schreibrechte im Ordner api/_data prüfen).');
        }
        kp_redirect(KP_ADMIN);
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
        kp_save_accounts($all);
        kp_flash(true, 'Gespeichert.');
        kp_redirect($back);
    }

    if ($action === 'passwort') {
        $pw = kp_new_password();
        $all[$k]['hash'] = password_hash($pw, PASSWORD_DEFAULT);
        kp_save_accounts($all);
        kp_fail_reset('kunde:' . $k);
        $_SESSION['zugang'] = ['benutzer' => $k, 'passwort' => $pw];
        kp_redirect($back);
    }

    if ($action === 'sperren') {
        $all[$k]['aktiv'] = empty($all[$k]['aktiv']);
        kp_save_accounts($all);
        kp_flash(true, $all[$k]['aktiv'] ? 'Zugang ist wieder aktiv.' : 'Zugang ist gesperrt. Die Dateien bleiben erhalten.');
        kp_redirect($back);
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
        kp_redirect($back);
    }

    if ($action === 'kunde_loeschen') {
        if (strtolower(cx_field('sicher', 40)) !== $k) {
            kp_flash(false, 'Zum Löschen bitte den Benutzernamen genau eintippen.');
            kp_redirect($back);
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
<div class="kp-narrow">
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

// ---------------- Anmeldung ----------------
if (!$isAdmin) {
    $action = KP_ADMIN . ($k !== '' ? '?k=' . $k : '');
    kp_page('Admin', <<<HTML
<div class="kp-narrow">
  <span class="label"><b>●</b> Kundenportal · Admin</span>
  <h1>Anmelden</h1>
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

$logout = '<a class="btn btn--sm btn--line" href="/kunden/admin/">Übersicht</a><form method="post" action="/kunden/admin/">' . $csrf
    . '<input type="hidden" name="aktion" value="abmelden"><button class="btn btn--sm btn--line" type="submit">Abmelden</button></form>';
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

// ---------------- Kunde im Detail ----------------
if ($k !== '' && isset($all[$k])) {
    $a = $all[$k];
    $h = static fn($key) => cx_h((string) ($a[$key] ?? ''));
    $status = !empty($a['aktiv']) ? 'aktiv' : 'gesperrt';
    $last = !empty($a['letzte_anmeldung']) ? cx_h(date('d.m.Y, H:i', strtotime((string) $a['letzte_anmeldung']) ?: 0)) . ' Uhr' : 'noch nie';
    $lock = !empty($a['aktiv']) ? 'Zugang sperren' : 'Zugang wieder freigeben';
    $used = kp_bytes(kp_used_bytes($k));

    $batches = '';
    foreach (kp_batches($k) as $id => $b) {
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
        $batches .= '<div class="kp-batch kp-batch--open"><h3>' . $when . ' Uhr · ' . cx_h((string) ($b['webseite'] ?? '')) . ' · ' . $n . ($n === 1 ? ' Datei' : ' Dateien') . '</h3>'
            . $msg . '<ul class="kp-files">' . $items . '</ul>'
            . '<div class="kp-actions"><a class="btn btn--sm" href="' . $base . '&amp;zip=1">Alle als ZIP</a>'
            . '<form method="post" action="' . KP_ADMIN . '?k=' . cx_h($k) . '">' . $csrf . '<input type="hidden" name="aktion" value="eingang_loeschen"><input type="hidden" name="e" value="' . cx_h($id) . '">'
            . '<label class="kp-confirm"><input type="checkbox" name="sicher" value="ja" required> sicher</label><button class="btn btn--sm btn--line" type="submit">Löschen</button></form></div></div>';
    }
    if ($batches === '') {
        $batches = '<p class="muted">Noch keine Uploads.</p>';
    }
    $form = KP_ADMIN . '?k=' . cx_h($k);
    $hk = cx_h($k);

    // Nachrichten: erst mit „neu“ anzeigen, dann als gelesen merken.
    $msgs = kp_messages($k);
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

    kp_page($a['name'] ?? $k, <<<HTML
<div class="crumbs"><a href="/kunden/admin/">Kunden</a> / {$hk}</div>
<h1>{$h('name')}</h1>
<p class="lead">{$h('firma')} · {$h('webseite')} · Zugang {$status} · letzte Anmeldung {$last} · {$used} belegt</p>
{$zugang}
{$flash}
<section class="kp-chat kp-chat--admin" id="nachrichten">
  <h2>Nachrichten</h2>
  {$wishes}
  {$chat}
  {$chatForm}
</section>
<h2>Uploads</h2>
{$batches}
<div class="kp-grid kp-grid--even">
  <form class="form form--small" method="post" action="{$form}">
    {$csrf}
    <input type="hidden" name="aktion" value="bearbeiten">
    <h2>Daten</h2>
    <label class="form__field"><span>Name</span><input type="text" name="name" required maxlength="80" value="{$h('name')}"></label>
    <label class="form__field"><span>Betrieb</span><input type="text" name="firma" maxlength="120" value="{$h('firma')}"></label>
    <label class="form__field"><span>E-Mail <em>(für die Eingangsbestätigung)</em></span><input type="email" name="email" maxlength="254" value="{$h('email')}"></label>
    <label class="form__field"><span>Webseite</span><input type="text" name="webseite" maxlength="200" value="{$h('webseite')}"></label>
    <button class="btn btn--line" type="submit">Speichern</button>
  </form>
  <div class="form form--small">
    <h2>Zugang</h2>
    <form method="post" action="{$form}">{$csrf}<input type="hidden" name="aktion" value="passwort"><button class="btn btn--line" type="submit">Neues Passwort erzeugen</button></form>
    <form method="post" action="{$form}">{$csrf}<input type="hidden" name="aktion" value="sperren"><button class="btn btn--line" type="submit">{$lock}</button></form>
    <form method="post" action="{$form}" class="kp-danger">{$csrf}<input type="hidden" name="aktion" value="kunde_loeschen">
      <label class="form__field"><span>Kunde und alle Dateien löschen: zur Bestätigung <b class="kp-user">{$hk}</b> eintippen</span><input type="text" name="sicher" required placeholder="{$hk}" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false"></label>
      <button class="btn btn--line" type="submit">Endgültig löschen</button></form>
  </div>
</div>
HTML, $logout);
}

// ---------------- Übersicht ----------------
$rows = '';
foreach ($all as $u => $a) {
    $b = kp_batches((string) $u);
    $first = $b ? reset($b) : null;
    $last = $first ? cx_h(date('d.m.Y', strtotime((string) $first['zeit']) ?: 0)) : '–';
    $m = kp_messages((string) $u);
    $neu = kp_unread($m, 'tim');
    $offen = count(kp_open_wishes($m));
    $info = ($neu > 0 ? '<span class="kp-badge">' . $neu . ' neu</span> ' : '') . ($offen > 0 ? $offen . ($offen === 1 ? ' Wunsch offen' : ' Wünsche offen') : ($neu > 0 ? '' : '–'));
    $rows .= '<tr><td><a href="/kunden/admin/?k=' . rawurlencode((string) $u) . '">' . cx_h((string) $u) . '</a></td><td>' . cx_h((string) ($a['name'] ?? ''))
        . '</td><td>' . cx_h((string) ($a['firma'] ?? '')) . '</td><td>' . cx_h((string) ($a['webseite'] ?? '')) . '</td><td>' . count($b) . '</td><td>' . $info . '</td><td>' . $last
        . '</td><td>' . (!empty($a['aktiv']) ? 'aktiv' : 'gesperrt') . '</td></tr>';
}
$table = $rows === '' ? '<p class="muted">Noch keine Kunden angelegt.</p>'
    : '<div class="kp-table"><table><thead><tr><th>Benutzer</th><th>Name</th><th>Betrieb</th><th>Webseite</th><th>Uploads</th><th>Nachrichten</th><th>Zuletzt</th><th>Status</th></tr></thead><tbody>' . $rows . '</tbody></table></div>';

kp_page('Kunden', <<<HTML
<span class="label"><b>●</b> Kundenportal · Admin</span>
<h1>Kunden</h1>
{$zugang}
{$flash}
{$table}
<form class="form kp-new" method="post" action="/kunden/admin/">
  {$csrf}
  <input type="hidden" name="aktion" value="anlegen">
  <h2>Neuen Kunden anlegen</h2>
  <div class="form__row">
    <label class="form__field"><span>Benutzername <em>(wie der Ordner im Repo)</em></span><input type="text" name="benutzer" required maxlength="40" pattern="[a-z0-9][a-z0-9\-]{1,38}[a-z0-9]" placeholder="baeckerei-muster" autocapitalize="none" spellcheck="false"></label>
    <label class="form__field"><span>Name</span><input type="text" name="name" required maxlength="80" placeholder="Maria Muster"></label>
  </div>
  <div class="form__row">
    <label class="form__field"><span>Betrieb</span><input type="text" name="firma" maxlength="120" placeholder="Bäckerei Muster"></label>
    <label class="form__field"><span>Webseite</span><input type="text" name="webseite" maxlength="200" placeholder="baeckerei-muster.at"></label>
  </div>
  <label class="form__field"><span>E-Mail <em>(optional, für die Eingangsbestätigung)</em></span><input type="email" name="email" maxlength="254"></label>
  <button class="btn" type="submit">Anlegen und Passwort erzeugen</button>
</form>
HTML, $logout);
