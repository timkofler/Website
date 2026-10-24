<?php
// Tim Kofler – Kundenportal: Konten, Anmeldung, Uploads und Benachrichtigung.
// Wird nur per include von /kunden/ und /kunden/admin/ geladen.
// Alle Daten liegen unter api/_data/kunden/ und sind per .htaccess für Besucher gesperrt.

declare(strict_types=1);

require_once __DIR__ . '/lib.php';

// Alle Uhrzeiten im Portal in österreichischer Zeit, egal wie der Server eingestellt ist.
date_default_timezone_set('Europe/Vienna');

const KP_DIR = CX_DATA . '/kunden';
const KP_IDLE = 7200;          // Abmeldung nach 2 Stunden ohne Aktivität
const KP_FAILS = 5;            // Fehlversuche ...
const KP_FAIL_WINDOW = 900;    // ... innerhalb von 15 Minuten, danach Sperre bis das Fenster abläuft
const KP_MAX_FILES = 100;       // Dateien pro Upload-Durchgang

// Erlaubte Dateiendungen und die dazu passenden Inhaltstypen (geprüft wird der Inhalt, nicht nur die Endung).
const KP_TYPES = [
    'jpg' => ['image/jpeg'], 'jpeg' => ['image/jpeg'], 'png' => ['image/png'], 'webp' => ['image/webp'],
    'gif' => ['image/gif'], 'heic' => ['image/heic', 'image/heif', 'application/octet-stream'],
    'heif' => ['image/heic', 'image/heif', 'application/octet-stream'],
    'svg' => ['image/svg+xml', 'text/xml', 'application/xml', 'text/plain', 'text/html'],
    'pdf' => ['application/pdf'], 'txt' => ['text/plain'],
    'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/octet-stream'],
    'xlsx' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip', 'application/octet-stream'],
    'pptx' => ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip', 'application/octet-stream'],
    'zip' => ['application/zip', 'application/x-zip-compressed'],
    'mp4' => ['video/mp4'], 'mov' => ['video/quicktime'],
];
// Diese Typen darf der Admin-Bereich als Vorschau direkt im Browser zeigen.
const KP_PREVIEW = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp', 'gif' => 'image/gif'];

// ---------------- Allgemeines ----------------

function kp_headers(): void
{
    header('X-Robots-Tag: noindex, nofollow');
    header('Cache-Control: no-store');
    header('Referrer-Policy: same-origin');
}

function kp_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    // Eigener Speicherort für Sitzungen, damit sie nicht im gemeinsamen Temp-Ordner des Servers liegen.
    $dir = KP_DIR . '/sitzungen';
    if (is_dir($dir) || @mkdir($dir, 0700, true)) {
        session_save_path($dir);
    }
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.gc_maxlifetime', (string) KP_IDLE);
    // Abgelaufene Sitzungsdateien selbst aufräumen (viele Server haben das für eigene Ordner abgeschaltet).
    ini_set('session.gc_probability', '1');
    ini_set('session.gc_divisor', '100');
    session_name('tk_portal');
    session_set_cookie_params(['lifetime' => 0, 'path' => '/kunden/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
    session_start();
    $now = time();
    if (isset($_SESSION['seen']) && $now - (int) $_SESSION['seen'] > KP_IDLE) {
        $_SESSION = [];
        session_regenerate_id(true);
        $_SESSION['flash'] = ['ok' => false, 'text' => 'Du wurdest nach längerer Pause abgemeldet. Bitte melde dich neu an.'];
    }
    $_SESSION['seen'] = $now;
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
}

function kp_csrf_field(): string
{
    return '<input type="hidden" name="csrf" value="' . cx_h((string) $_SESSION['csrf']) . '">';
}

// Jede Aktion: nur POST, nur von dieser Seite, mit gültigem Formular-Schlüssel.
function kp_post_ok(): bool
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        return false;
    }
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $origins = (array) (cx_config()['origins'] ?? ['https://tim-kofler.at', 'https://www.tim-kofler.at']);
    if ($origin !== '' && !in_array($origin, $origins, true)) {
        return false;
    }
    $token = $_POST['csrf'] ?? '';
    return is_string($token) && !empty($_SESSION['csrf']) && hash_equals((string) $_SESSION['csrf'], $token);
}

function kp_flash(bool $ok, string $text): void
{
    $_SESSION['flash'] = ['ok' => $ok, 'text' => $text];
}

function kp_take_flash(): string
{
    $f = $_SESSION['flash'] ?? null;
    unset($_SESSION['flash']);
    if (!is_array($f)) {
        return '';
    }
    return '<p class="form__status ' . ($f['ok'] ? 'is-ok' : 'is-error') . '" role="status">' . nl2br(cx_h((string) $f['text'])) . '</p>';
}

function kp_redirect(string $to): void
{
    header('Location: ' . $to, true, 303);
    exit;
}

// Kurzer Fingerabdruck eines Passwort-Hashes für die Sitzung: Ändert sich das Passwort (neues Passwort
// im Admin, selbst geändert, neuer Admin-Hash in der config.php), gelten ältere Anmeldungen nicht mehr.
function kp_pw_tag(string $hash): string
{
    return substr(hash_hmac('sha256', $hash, (string) (cx_config()['secret'] ?? 'tk')), 0, 20);
}

// Gleich lange Prüfung, auch wenn es den Benutzer nicht gibt (verrät nicht über die Antwortzeit, welche Namen existieren).
function kp_dummy_verify(string $pass): void
{
    password_verify($pass, '$2y$10$EzQWJzNwrsRD7Nie74R2Hu2w//FgVoQdgL8pTqj8efhLc7EjnQa5W');
}

function kp_ip_hash(): string
{
    return substr(hash('sha256', (string) (cx_config()['secret'] ?? 'tk') . ($_SERVER['REMOTE_ADDR'] ?? '')), 0, 32);
}

function kp_read_json(string $file): array
{
    if (!is_file($file)) {
        return [];
    }
    $data = json_decode((string) file_get_contents($file), true);
    return is_array($data) ? $data : [];
}

// Schreiben über eine Zwischendatei, damit nie eine halbe Datei entsteht.
function kp_write_json(string $file, array $data): bool
{
    $dir = dirname($file);
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
        return false;
    }
    $tmp = $file . '.' . bin2hex(random_bytes(4)) . '.tmp';
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false || @file_put_contents($tmp, $json, LOCK_EX) === false) {
        return false;
    }
    return @rename($tmp, $file);
}

function kp_text(string $name, int $max = 200): string
{
    return str_replace(['<', '>'], '', cx_field($name, $max));
}

function kp_bytes(int $b): string
{
    if ($b >= 1073741824) {
        return rtrim(rtrim(number_format($b / 1073741824, 1, ',', '.'), '0'), ',') . ' GB';
    }
    if ($b >= 1048576) {
        return number_format($b / 1048576, $b >= 10485760 ? 0 : 1, ',', '.') . ' MB';
    }
    return number_format(max(1, (int) ceil($b / 1024)), 0, ',', '.') . ' KB';
}

function kp_ini_bytes(string $key): int
{
    $v = trim((string) ini_get($key));
    if ($v === '' || $v === '0' || $v === '-1') {
        return PHP_INT_MAX;
    }
    $n = (int) $v;
    switch (strtolower(substr($v, -1))) {
        case 'g': return $n * 1073741824;
        case 'm': return $n * 1048576;
        case 'k': return $n * 1024;
    }
    return $n;
}

// Größte erlaubte Datei: Wert aus der config.php, aber nie mehr, als PHP auf dem Server zulässt.
function kp_max_file(): int
{
    $cfg = (int) (cx_config()['upload_max_mb'] ?? 200) * 1048576;
    return min($cfg, kp_ini_bytes('upload_max_filesize'), kp_ini_bytes('post_max_size'));
}

function kp_max_post(): int
{
    return kp_ini_bytes('post_max_size');
}

function kp_portal_url(string $path = '/kunden/'): string
{
    return rtrim(cx_brand()['site'], '/') . $path;
}

// ---------------- Konten ----------------

function kp_accounts(): array
{
    return kp_read_json(KP_DIR . '/konten.json');
}

function kp_save_accounts(array $a): bool
{
    ksort($a);
    return kp_write_json(KP_DIR . '/konten.json', $a);
}

function kp_valid_user(string $u): bool
{
    // „sitzungen“ und „sperre“ sind Ordner des Portals selbst und keine Benutzernamen.
    return !in_array($u, ['sitzungen', 'sperre'], true) && (bool) preg_match('/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/', $u);
}

function kp_account(string $u): ?array
{
    if (!kp_valid_user($u)) {
        return null;
    }
    $a = kp_accounts();
    return isset($a[$u]) && is_array($a[$u]) ? $a[$u] : null;
}

// Gut lesbares Zufallspasswort ohne verwechselbare Zeichen, z. B. "k7mq-x4tr-9bhw".
function kp_new_password(): string
{
    $chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    $out = '';
    for ($i = 0; $i < 12; $i++) {
        $out .= $chars[random_int(0, strlen($chars) - 1)];
        if ($i === 3 || $i === 7) {
            $out .= '-';
        }
    }
    return $out;
}

// ---------------- Willkommensmail mit Link zum Passwort-Festlegen ----------------
// Der Kunde bekommt nie ein Passwort per Mail, sondern einen einmaligen Link, mit dem er sein eigenes festlegt.
// Gespeichert wird nur eine Prüfsumme des Links; ein neuer Link macht den alten ungültig, nach dem Festlegen ist er verbraucht.

const KP_INVITE_TTL = 7 * 86400;   // Link gilt 7 Tage
const KP_INVITE_GAP = 60;          // höchstens eine Mail pro Minute und Kunde ...
const KP_INVITE_DAY = 5;           // ... und höchstens 5 pro Tag

function kp_invite_file(string $u): string
{
    return kp_user_dir($u) . '/einladung.json';
}

// Neuen Link erzeugen (mit Versandgrenze). Ergebnis: [true, Link] oder [false, Fehlermeldung].
function kp_invite_create(string $u): array
{
    $dir = kp_user_dir($u);
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
        return [false, 'Der Ordner des Kunden konnte nicht angelegt werden (Schreibrechte im Ordner api/_data prüfen).'];
    }
    $token = bin2hex(random_bytes(32));
    $res = cx_locked($dir . '/.einladung.lock', static function () use ($u, $token) {
        $now = time();
        $d = kp_read_json(kp_invite_file($u));
        $sent = array_values(array_filter((array) ($d['gesendet'] ?? []), static fn($t) => is_int($t) && $t > $now - 86400));
        if ($sent && $now - max($sent) < KP_INVITE_GAP) {
            return [false, 'Gerade erst verschickt. Bitte warte eine Minute, bevor du die Mail noch einmal sendest.'];
        }
        if (count($sent) >= KP_INVITE_DAY) {
            return [false, 'Heute sind schon ' . KP_INVITE_DAY . ' Willkommensmails an diesen Kunden gegangen. Bitte morgen noch einmal versuchen.'];
        }
        $sent[] = $now;
        $ok = kp_write_json(kp_invite_file($u), ['hash' => hash('sha256', $token), 'bis' => $now + KP_INVITE_TTL, 'gesendet' => $sent]);
        return $ok ? [true, ''] : [false, 'Der Link konnte nicht gespeichert werden (Schreibrechte im Ordner api/_data prüfen).'];
    });
    if (!is_array($res) || !$res[0]) {
        return is_array($res) ? $res : [false, 'Bitte noch einmal versuchen.'];
    }
    return [true, kp_portal_url('/kunden/?willkommen=' . $u . '.' . $token)];
}

// Prüft einen Link aus der Mail, ohne ihn zu verbrauchen. Ergebnis: Benutzername oder ''.
function kp_invite_check(string $raw): string
{
    if (!preg_match('/^([a-z0-9-]{3,40})\.([a-f0-9]{64})$/', $raw, $m) || !kp_valid_user($m[1]) || kp_account($m[1]) === null) {
        return '';
    }
    $d = kp_read_json(kp_invite_file($m[1]));
    $hash = (string) ($d['hash'] ?? '');
    if ($hash === '' || (int) ($d['bis'] ?? 0) < time() || !hash_equals($hash, hash('sha256', $m[2]))) {
        return '';
    }
    return $m[1];
}

// Link verbrauchen: nur der erste von zwei gleichzeitigen Versuchen gewinnt.
function kp_invite_use(string $raw): bool
{
    $u = kp_invite_check($raw);
    if ($u === '') {
        return false;
    }
    return (bool) cx_locked(kp_user_dir($u) . '/.einladung.lock', static function () use ($u, $raw) {
        if (kp_invite_check($raw) !== $u) {
            return false;
        }
        $d = kp_read_json(kp_invite_file($u));
        unset($d['hash'], $d['bis']);
        return kp_write_json(kp_invite_file($u), $d);
    });
}

// Wann ging die letzte Willkommensmail raus, und ist ihr Link noch offen? Für die Anzeige im Admin.
function kp_invite_state(string $u): array
{
    $d = kp_read_json(kp_invite_file($u));
    $sent = array_filter((array) ($d['gesendet'] ?? []), 'is_int');
    return ['zuletzt' => $sent ? max($sent) : 0, 'offen' => !empty($d['hash']) && (int) ($d['bis'] ?? 0) >= time(), 'bis' => (int) ($d['bis'] ?? 0)];
}

// Willkommensmail im Auftritt von tim-kofler.at (dunkel, TK-Logo, Orange). Der Link steht nur in der Mail, nie im Log.
function kp_send_welcome(string $u, array $acc): array
{
    $email = (string) ($acc['email'] ?? '');
    if ($email === '') {
        return [false, 'Für diesen Kunden ist keine E-Mail-Adresse hinterlegt.'];
    }
    if (!cx_ready()) {
        return [false, 'Der Mailversand ist auf dem Server nicht eingerichtet (brevo_api_key und secret in der config.php).'];
    }
    [$ok, $link] = kp_invite_create($u);
    if (!$ok) {
        return [false, $link];
    }
    $name = trim((string) ($acc['name'] ?? ''));
    $vorname = $name !== '' ? explode(' ', $name)[0] : '';
    $portal = kp_portal_url();
    $bis = date('d.m.Y', time() + KP_INVITE_TTL);
    $was = kp_is_verein($acc) ? 'die neue Webseite deines Vereins' : 'deine neue Webseite';
    $p = 'margin:0 0 14px';
    $step = static fn(string $n, string $t) => '<tr><td valign="top" style="padding:0 12px 12px 0;width:28px"><span style="display:inline-block;width:26px;height:26px;line-height:26px;border-radius:13px;background:#ff5a1f;color:#0b0b0b;font-weight:bold;font-size:13px;text-align:center">' . $n . '</span></td>'
        . '<td valign="top" style="padding:3px 0 12px;font-size:15px;line-height:1.5;color:#e6e6e2">' . $t . '</td></tr>';
    $inner = '<p style="' . $p . '">' . ($vorname !== '' ? 'Hallo ' . cx_h($vorname) . ',' : 'Hallo,') . '</p>'
        . '<p style="' . $p . '">schön, dass wir zusammenarbeiten! Ich habe dir einen Zugang zu meinem <b style="color:#f4f4f0">Kundenportal</b> eingerichtet. Dort sammeln wir alles für ' . $was . ' an einem Ort.</p>'
        . '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:6px 0 18px;background:#1d1d1d;border:1px solid #2c2c2c;border-radius:12px"><tr><td style="padding:16px 18px;font-size:15px;line-height:1.7;color:#e6e6e2">'
        . 'Adresse: <a href="' . cx_h($portal) . '" style="color:#ff7a45;text-decoration:none">' . cx_h(preg_replace('#^https?://#', '', rtrim($portal, '/'))) . '</a><br>'
        . 'Benutzername: <b style="color:#f4f4f0;font-family:Consolas,Menlo,monospace">' . cx_h($u) . '</b></td></tr></table>'
        . '<p style="' . $p . '">Ein Passwort schicke ich dir aus Sicherheitsgründen nicht per Mail. Du legst dein eigenes mit diesem Knopf fest:</p>'
        . kp_mail_button($link, 'Passwort festlegen')
        . '<p style="margin:0 0 22px;font-size:13px;line-height:1.6;color:#a1a1a1">Der Knopf funktioniert einmal und bis ' . $bis . '. Danach meldest du dich unter ' . cx_h(preg_replace('#^https?://#', '', rtrim($portal, '/'))) . ' mit Benutzername und deinem Passwort an. Ändern kannst du es dort jederzeit unter „Passwort“.</p>'
        . '<p style="margin:0 0 10px;font-weight:bold;color:#f4f4f0">Was du im Portal machen kannst</p>'
        . '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 8px">'
        . $step('1', '<b style="color:#f4f4f0">Fotos, Logo und Texte hochladen</b>, direkt vom Handy oder PC.')
        . $step('2', '<b style="color:#f4f4f0">Nachrichten schreiben</b>: Wünsche, Fragen oder „Gefällt mir“ zum Entwurf.')
        . $step('3', '<b style="color:#f4f4f0">Projektstand sehen</b>: welcher Schritt gerade dran ist und den Link zur Vorschau.')
        . '</table>'
        . '<p style="' . $p . '">Wenn du Hilfe brauchst, antworte einfach auf diese Mail oder schreib mir auf <a href="https://wa.me/4367761773118" style="color:#ff7a45">WhatsApp</a>.</p>'
        . '<p style="margin:0">Liebe Grüße<br><b style="color:#f4f4f0">Tim Kofler</b></p>'
        . '<p style="margin:22px 0 0;font-size:12px;line-height:1.6;color:#8a8a8a">Du hast diese Mail nicht erwartet? Dann ignoriere sie einfach, ohne Klick auf den Knopf passiert nichts.</p>';
    $c = cx_config();
    $notify = (string) ($c['notify_email'] ?? 'office@tim-kofler.at');
    if (!cx_mail($email, $name, 'Dein Zugang zum Kundenportal von Tim Kofler', kp_mail_layout('Willkommen im Kundenportal', $inner), $notify)) {
        return [false, 'Die Mail konnte nicht verschickt werden. Bitte später noch einmal mit „Willkommensmail erneut senden“ versuchen.'];
    }
    return [true, 'Willkommensmail an ' . $email . ' verschickt. Der Link zum Passwort-Festlegen gilt bis ' . $bis . '.'];
}

function kp_mail_button(string $href, string $label): string
{
    return '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 14px"><tr><td style="border-radius:999px;background:#ff5a1f">'
        . '<a href="' . cx_h($href) . '" style="display:inline-block;padding:14px 26px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#0b0b0b;text-decoration:none;border-radius:999px">' . cx_h($label) . '</a></td></tr></table>';
}

// Mail-Rahmen für das Kundenportal: wie tim-kofler.at dunkel, mit TK-Logo und oranger Linie.
function kp_mail_layout(string $title, string $inner): string
{
    $t = cx_h($title);
    $site = cx_h(rtrim(cx_brand()['site'], '/'));
    return <<<HTML
<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark light"><title>{$t}</title></head>
<body style="margin:0;padding:0;background:#0b0b0b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b0b;padding:28px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#151515;border:1px solid #262626;border-top:3px solid #ff5a1f;border-radius:16px">
<tr><td style="padding:26px 32px 4px;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="padding-right:12px"><img src="{$site}/assets/img/tk-badge-2-256.png" width="44" height="44" alt="TK" style="display:block;border:0;border-radius:22px"></td>
<td style="font-size:15px;line-height:1.3;color:#f4f4f0;font-weight:bold">Tim Kofler<br><span style="font-weight:normal;font-size:12px;color:#a1a1a1;letter-spacing:.06em;text-transform:uppercase">Webdesign · Kundenportal</span></td>
</tr></table></td></tr>
<tr><td style="padding:8px 32px 28px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#e6e6e2">
<h1 style="margin:18px 0 16px;font-size:23px;line-height:1.3;color:#f4f4f0">{$t}</h1>
{$inner}
</td></tr>
<tr><td style="padding:18px 32px 26px;border-top:1px solid #262626;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8a8a8a">
Tim Kofler – Webdesign · Lehen 2, 3281 Oberndorf an der Melk, Österreich<br>
<a href="{$site}/" style="color:#8a8a8a">tim-kofler.at</a> · <a href="{$site}/impressum/" style="color:#8a8a8a">Impressum</a> · <a href="{$site}/datenschutz/#kundenportal" style="color:#8a8a8a">Datenschutz</a>
</td></tr>
</table></td></tr></table></body></html>
HTML;
}

// ---------------- Schutz vor Passwort-Raten ----------------

function kp_fail_file(string $key): string
{
    return KP_DIR . '/sperre/' . hash('sha256', (string) (cx_config()['secret'] ?? 'tk') . $key) . '.json';
}

function kp_fails(string $key): array
{
    $now = time();
    return array_values(array_filter(kp_read_json(kp_fail_file($key)), static fn($t) => is_int($t) && $t > $now - KP_FAIL_WINDOW));
}

// Höchstzahl je Schlüssel: pro Anschluss und Konto KP_FAILS, für den gemeinsamen Schlüssel „admin“ viel mehr,
// damit Fremde Tim nicht mit ein paar falschen Passwörtern aussperren können.
function kp_limit(string $key): int
{
    return $key === 'admin' ? 50 : KP_FAILS;
}

// Reserviert einen Versuch für alle Schlüssel, unter Sperre (parallele Anfragen zählen einzeln mit).
// false = zu viele Versuche, dann nicht prüfen. Nach Erfolg mit kp_untry() wieder freigeben.
function kp_try(array $keys): bool
{
    return (bool) cx_locked(KP_DIR . '/sperre/.lock', static function () use ($keys) {
        foreach ($keys as $k) {
            if (count(kp_fails($k)) >= kp_limit($k)) {
                return false;
            }
        }
        foreach ($keys as $k) {
            $f = kp_fails($k);
            $f[] = time();
            kp_write_json(kp_fail_file($k), $f);
        }
        return true;
    });
}

function kp_untry(array $keys): void
{
    cx_locked(KP_DIR . '/sperre/.lock', static function () use ($keys) {
        foreach ($keys as $k) {
            $f = kp_fails($k);
            array_pop($f);
            $f ? kp_write_json(kp_fail_file($k), $f) : @unlink(kp_fail_file($k));
        }
        return true;
    });
}

// Nach einem Fehlversuch: ein Rest an Wartezeit macht automatisches Raten zusätzlich langsam.
function kp_fail_wait(): void
{
    usleep(random_int(300000, 700000));
}

function kp_fail_reset(string $key): void
{
    @unlink(kp_fail_file($key));
}

// ---------------- Uploads ----------------

function kp_user_dir(string $u): string
{
    return KP_DIR . '/' . $u;
}

function kp_valid_batch(string $e): bool
{
    return (bool) preg_match('/^\d{8}-\d{6}-[a-f0-9]{4}$/', $e);
}

// Alle Upload-Durchgänge eines Kunden, neueste zuerst.
function kp_batches(string $u): array
{
    $out = [];
    foreach (glob(kp_user_dir($u) . '/*/eingang.json') ?: [] as $f) {
        $id = basename(dirname($f));
        if (kp_valid_batch($id)) {
            $out[$id] = kp_read_json($f) + ['id' => $id];
        }
    }
    krsort($out);
    return $out;
}

// Uploads, die Tim im Admin noch nicht gesehen hat (wie ungelesene Nachrichten). Gemerkt werden die gesehenen IDs.
function kp_new_uploads(string $u, array $batches): array
{
    $seen = (array) (kp_read_json(kp_user_dir($u) . '/gesehen.json')['uploads'] ?? []);
    return array_values(array_diff(array_keys($batches), $seen));
}

function kp_mark_uploads_seen(string $u, array $batches): void
{
    if ($batches && kp_new_uploads($u, $batches)) {
        kp_write_json(kp_user_dir($u) . '/gesehen.json', ['uploads' => array_keys($batches)]);
    }
}

function kp_used_bytes(string $u): int
{
    $sum = 0;
    foreach (kp_batches($u) as $b) {
        foreach ((array) ($b['dateien'] ?? []) as $d) {
            $sum += (int) ($d['bytes'] ?? 0);
        }
    }
    return $sum;
}

// Dateiname für die Ablage: Umlaute ersetzt, nur einfache Zeichen, Endung klein.
function kp_safe_name(string $original, string $ext, int $n): string
{
    $base = pathinfo($original, PATHINFO_FILENAME);
    $base = strtr($base, ['ä' => 'ae', 'ö' => 'oe', 'ü' => 'ue', 'Ä' => 'Ae', 'Ö' => 'Oe', 'Ü' => 'Ue', 'ß' => 'ss']);
    $base = preg_replace('/[^A-Za-z0-9._-]+/', '-', $base) ?? '';
    $base = trim(substr(trim($base, '.-_'), 0, 70), '.-_');
    return sprintf('%02d-%s.%s', $n, $base !== '' ? $base : 'datei', $ext);
}

// $_FILES['dateien'] in eine einfache Liste umbauen.
function kp_uploaded(string $field): array
{
    $f = $_FILES[$field] ?? null;
    if (!is_array($f) || !isset($f['name'])) {
        return [];
    }
    if (!is_array($f['name'])) {
        $f = array_map(static fn($v) => [$v], $f);
    }
    $out = [];
    foreach ($f['name'] as $i => $name) {
        if ((int) ($f['error'][$i] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        $out[] = [
            'name' => (string) $name,
            'tmp' => (string) ($f['tmp_name'][$i] ?? ''),
            'size' => (int) ($f['size'][$i] ?? 0),
            'error' => (int) ($f['error'][$i] ?? UPLOAD_ERR_NO_FILE),
        ];
    }
    return $out;
}

function kp_check_type(string $tmp, string $ext): bool
{
    if (!isset(KP_TYPES[$ext])) {
        return false;
    }
    if (!class_exists('finfo')) {
        return true;
    }
    $mime = (string) (new finfo(FILEINFO_MIME_TYPE))->file($tmp);
    if (!in_array($mime, KP_TYPES[$ext], true)) {
        return false;
    }
    // SVG ist Text: nur annehmen, wenn wirklich ein <svg> darin steckt.
    if ($ext === 'svg') {
        $head = (string) file_get_contents($tmp, false, null, 0, 4096);
        return stripos($head, '<svg') !== false;
    }
    return true;
}

// Prüft und speichert einen Upload-Durchgang. Gibt [ok, Meldung] zurück.
function kp_store_upload(string $u, array $acc, string $site, string $msg, array $files): array
{
    if (!$files) {
        return [false, 'Bitte wähle mindestens eine Datei aus.'];
    }
    if (count($files) > KP_MAX_FILES) {
        return [false, 'Bitte lade höchstens ' . KP_MAX_FILES . ' Dateien auf einmal hoch. Den Rest kannst du gleich danach schicken.'];
    }
    $max = kp_max_file();
    $quota = (int) round((float) (cx_config()['kunde_max_gb'] ?? 10) * 1073741824);
    $used = kp_used_bytes($u);
    $errors = [];
    $ok = [];
    $total = 0;
    foreach ($files as $f) {
        $label = '„' . $f['name'] . '“';
        if ($f['error'] === UPLOAD_ERR_INI_SIZE || $f['error'] === UPLOAD_ERR_FORM_SIZE || $f['size'] > $max) {
            $errors[] = $label . ' ist zu groß (höchstens ' . kp_bytes($max) . ' pro Datei).';
            continue;
        }
        if ($f['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($f['tmp'])) {
            $errors[] = $label . ' konnte nicht übertragen werden.';
            continue;
        }
        $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
        if (!kp_check_type($f['tmp'], $ext)) {
            $errors[] = $label . ' hat ein Format, das ich hier nicht annehmen kann.';
            continue;
        }
        $total += $f['size'];
        $ok[] = $f + ['ext' => $ext];
    }
    if ($errors) {
        return [false, "Es wurde noch nichts gespeichert:\n" . implode("\n", $errors)];
    }
    if ($used + $total > $quota) {
        return [false, 'Dein Speicherplatz im Portal ist voll. Bitte melde dich kurz bei mir, dann mache ich Platz.'];
    }

    $id = date('Ymd-His') . '-' . bin2hex(random_bytes(2));
    $dir = kp_user_dir($u) . '/' . $id;
    if (!@mkdir($dir, 0700, true)) {
        cx_log('Kundenportal: Ordner ' . $dir . ' konnte nicht angelegt werden');
        return [false, 'Die Dateien konnten gerade nicht gespeichert werden. Bitte versuche es später noch einmal.'];
    }
    $saved = [];
    foreach ($ok as $i => $f) {
        $name = kp_safe_name($f['name'], $f['ext'], $i + 1);
        if (!move_uploaded_file($f['tmp'], $dir . '/' . $name)) {
            cx_log('Kundenportal: ' . $name . ' konnte nicht verschoben werden');
            continue;
        }
        @chmod($dir . '/' . $name, 0600);
        $saved[] = ['datei' => $name, 'original' => mb_substr($f['name'], 0, 200), 'bytes' => $f['size']];
    }
    if (!$saved) {
        @rmdir($dir);
        return [false, 'Die Dateien konnten gerade nicht gespeichert werden. Bitte versuche es später noch einmal.'];
    }
    $batch = ['zeit' => date('c'), 'webseite' => $site, 'nachricht' => $msg, 'dateien' => $saved];
    kp_write_json($dir . '/eingang.json', $batch);
    kp_notify($u, $acc, $batch + ['id' => $id]);
    $n = count($saved);
    return [true, 'Danke! ' . $n . ($n === 1 ? ' Datei ist' : ' Dateien sind') . ' angekommen. Tim wurde benachrichtigt.'];
}

// Benachrichtigung an Tim (und eine kurze Bestätigung an den Kunden, falls eine E-Mail hinterlegt ist).
function kp_notify(string $u, array $acc, array $batch): void
{
    $c = cx_config();
    if (empty($c['brevo_api_key'])) {
        cx_log('Kundenportal: Upload von ' . $u . ' ohne Benachrichtigung (kein Brevo-Schlüssel)');
        return;
    }
    $who = trim((string) ($acc['firma'] ?? '')) !== '' ? $acc['firma'] . ' (' . ($acc['name'] ?? $u) . ')' : (string) ($acc['name'] ?? $u);
    $bytes = array_sum(array_map(static fn($d) => (int) $d['bytes'], $batch['dateien']));
    $n = count($batch['dateien']);
    $rows = '';
    foreach ([
        'Kunde' => $who, 'Benutzername' => $u, 'Webseite' => (string) $batch['webseite'],
        'Dateien' => $n . ' (' . kp_bytes($bytes) . ')', 'Nachricht' => (string) $batch['nachricht'],
    ] as $k => $v) {
        $rows .= '<tr><td style="padding:6px 12px 6px 0;color:#a1a1a1;vertical-align:top;white-space:nowrap">' . cx_h($k)
            . '</td><td style="padding:6px 0;color:#f4f4f0">' . nl2br(cx_h($v !== '' ? $v : '–')) . '</td></tr>';
    }
    $list = '';
    foreach ($batch['dateien'] as $d) {
        $list .= '<li>' . cx_h((string) $d['original']) . ' <span style="color:#8a8a8a">(' . kp_bytes((int) $d['bytes']) . ')</span></li>';
    }
    $inner = '<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px">' . $rows . '</table>'
        . '<ul style="margin:16px 0 0;padding-left:20px;font-size:14px;color:#e6e6e2">' . $list . '</ul>'
        . cx_button(kp_portal_url('/kunden/admin/?k=' . rawurlencode($u)), 'Im Kundenportal ansehen');
    $notify = (string) ($c['notify_email'] ?? 'office@tim-kofler.at');
    $email = (string) ($acc['email'] ?? '');
    if (!cx_mail($notify, 'Tim', 'Neue Dateien von ' . $who . ': ' . $batch['webseite'], cx_mail_layout('Neue Dateien im Kundenportal', $inner), $email)) {
        cx_log('Kundenportal: Benachrichtigung zu ' . $u . '/' . $batch['id'] . ' nicht verschickt');
    }
    if ($email !== '') {
        $hi = '<p style="margin:0 0 14px">Hallo ' . cx_h((string) ($acc['name'] ?? '')) . ',</p>'
            . '<p style="margin:0 0 14px">danke, deine ' . $n . ($n === 1 ? ' Datei für ' : ' Dateien für ') . cx_h((string) $batch['webseite']) . ' ' . ($n === 1 ? 'ist' : 'sind') . ' bei mir angekommen. Ich sehe sie mir an und melde mich, sobald es weitergeht.</p>'
            . '<p style="margin:0 0 4px">Viele Grüße<br>Tim</p>';
        cx_mail($email, (string) ($acc['name'] ?? ''), 'Deine Dateien sind angekommen', cx_mail_layout('Dateien angekommen', $hi), $notify);
    }
}

// Der Kunde löscht eine einzelne Datei ($datei) oder den ganzen Upload ($datei leer). Nur Dateien, die im
// eingang.json dieses Uploads stehen, sonst passiert nichts. Gibt [ok, Meldung] zurück.
function kp_delete_upload(string $u, string $id, string $datei = ''): array
{
    $dir = kp_user_dir($u) . '/' . $id;
    $batch = kp_valid_batch($id) ? kp_read_json($dir . '/eingang.json') : [];
    $files = (array) ($batch['dateien'] ?? []);
    if (!$files) {
        return [false, 'Diesen Upload gibt es nicht mehr.'];
    }
    if ($datei === '') {
        kp_delete_dir($dir);
        cx_log('Kundenportal: ' . $u . ' hat den Upload ' . $id . ' gelöscht');
        return [true, count($files) === 1 ? 'Die Datei wurde gelöscht.' : 'Der Upload mit ' . count($files) . ' Dateien wurde gelöscht.'];
    }
    $keep = [];
    $gone = null;
    foreach ($files as $d) {
        if ($gone === null && ($d['datei'] ?? '') === $datei) {
            $gone = $d;
        } else {
            $keep[] = $d;
        }
    }
    if ($gone === null) {
        return [false, 'Diese Datei gibt es nicht mehr.'];
    }
    if (!$keep) {
        kp_delete_dir($dir);
    } else {
        $batch['dateien'] = $keep;
        if (!kp_write_json($dir . '/eingang.json', $batch)) {
            return [false, 'Die Datei konnte gerade nicht gelöscht werden. Bitte versuche es noch einmal.'];
        }
        @unlink($dir . '/' . basename((string) $gone['datei']));
    }
    cx_log('Kundenportal: ' . $u . ' hat ' . $gone['datei'] . ' aus ' . $id . ' gelöscht');
    return [true, '„' . $gone['original'] . '“ wurde gelöscht.'];
}

function kp_delete_dir(string $dir): void
{
    foreach (glob($dir . '/{,.}[!.,!..]*', GLOB_BRACE) ?: [] as $f) {
        is_dir($f) ? kp_delete_dir($f) : @unlink($f);
    }
    @rmdir($dir);
}

// ---------------- Nachrichten zwischen Kunde und Tim ----------------

const KP_ARTEN = ['nachricht' => 'Nachricht', 'wunsch' => 'Wunsch', 'gefaellt' => 'Gefällt mir', 'gefaellt-nicht' => 'Gefällt mir nicht', 'frage' => 'Frage'];
const KP_MSG_MAX = 3000;      // Zeichen pro Nachricht
const KP_MSG_HOUR = 30;       // Nachrichten pro Stunde und Kunde (Schutz vor Versehen und Missbrauch)

function kp_msg_file(string $u): string
{
    return kp_user_dir($u) . '/nachrichten.json';
}

// Verlauf eines Kunden: liste (älteste zuerst, wird nur ergänzt) und gelesen (je Seite kunde/tim: wie viele Einträge schon gesehen).
function kp_messages(string $u): array
{
    $d = kp_read_json(kp_msg_file($u));
    return ['liste' => array_values((array) ($d['liste'] ?? [])), 'gelesen' => (array) ($d['gelesen'] ?? [])];
}

// Ändern unter Sperre, damit sich gleichzeitige Nachrichten von Kunde und Tim nicht überschreiben.
// $fn bekommt den Verlauf und gibt den neuen zurück (oder null, wenn nichts zu speichern ist).
function kp_msg_update(string $u, callable $fn): ?array
{
    $dir = kp_user_dir($u);
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
        return null;
    }
    $lock = @fopen($dir . '/nachrichten.lock', 'c');
    if ($lock) {
        flock($lock, LOCK_EX);
    }
    $new = $fn(kp_messages($u));
    if (is_array($new) && !kp_write_json(kp_msg_file($u), $new)) {
        $new = null;
    }
    if ($lock) {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
    return $new;
}

// Neue Nachricht speichern. $von ist 'kunde' oder 'tim'. Gibt [ok, Fehlertext] zurück.
function kp_add_message(string $u, string $von, string $art, string $text): array
{
    $art = isset(KP_ARTEN[$art]) ? $art : 'nachricht';
    if ($text === '') {
        return [false, 'Bitte schreib zuerst etwas.'];
    }
    $err = '';
    $msg = ['id' => bin2hex(random_bytes(5)), 'zeit' => date('c'), 'von' => $von, 'art' => $art, 'text' => $text];
    $saved = kp_msg_update($u, static function (array $d) use ($von, $msg, &$err) {
        $recent = array_filter($d['liste'], static fn($m) => ($m['von'] ?? '') === $von && strtotime((string) ($m['zeit'] ?? '')) > time() - 3600);
        if (count($recent) >= KP_MSG_HOUR) {
            $err = 'Das waren sehr viele Nachrichten in kurzer Zeit. Bitte versuch es in einer Stunde noch einmal.';
            return null;
        }
        $d['liste'][] = $msg;
        $d['gelesen'][$von] = count($d['liste']);
        return $d;
    });
    if ($saved === null) {
        return [false, $err !== '' ? $err : 'Die Nachricht konnte nicht gespeichert werden. Bitte versuch es noch einmal.'];
    }
    return [true, $msg];
}

// Ungelesene Nachrichten der Gegenseite für $wer ('kunde' oder 'tim').
function kp_unread(array $d, string $wer): int
{
    $n = 0;
    foreach ($d['liste'] as $i => $m) {
        if ($i >= (int) ($d['gelesen'][$wer] ?? 0) && ($m['von'] ?? '') !== $wer) {
            $n++;
        }
    }
    return $n;
}

function kp_mark_read(string $u, string $wer): void
{
    kp_msg_update($u, static function (array $d) use ($wer) {
        if (kp_unread($d, $wer) === 0) {
            return null;
        }
        $d['gelesen'][$wer] = count($d['liste']);
        return $d;
    });
}

// Wünsche, die Tim noch nicht als erledigt markiert hat.
function kp_open_wishes(array $d): array
{
    return array_values(array_filter($d['liste'], static fn($m) => ($m['art'] ?? '') === 'wunsch' && empty($m['erledigt'])));
}

function kp_toggle_done(string $u, string $id): bool
{
    return kp_msg_update($u, static function (array $d) use ($id) {
        foreach ($d['liste'] as $i => $m) {
            if (($m['id'] ?? '') === $id && ($m['art'] ?? '') === 'wunsch') {
                $d['liste'][$i]['erledigt'] = empty($m['erledigt']) ? date('c') : null;
                return $d;
            }
        }
        return null;
    }) !== null;
}

// Verlauf als HTML. $ich ist die Seite, die gerade schaut; was sie noch nicht gesehen hat, ist als „neu“ markiert.
// $doneForm erzeugt für Tim den Knopf „erledigt“ bei Wünschen (null für die Kundenseite).
function kp_render_messages(array $d, string $ich, string $kundeName, ?callable $doneForm = null): string
{
    if (!$d['liste']) {
        return '<p class="muted kp-chat__leer">' . ($ich === 'kunde'
            ? 'Noch keine Nachrichten. Schreib mir hier alles, was dir zur Webseite einfällt: Wünsche, was dir gefällt und was nicht.'
            : 'Noch keine Nachrichten mit diesem Kunden.') . '</p>';
    }
    $seen = (int) ($d['gelesen'][$ich] ?? 0);
    $out = '';
    $day = '';
    foreach ($d['liste'] as $i => $m) {
        $von = (string) ($m['von'] ?? '');
        $mine = $von === $ich;
        $t = strtotime((string) ($m['zeit'] ?? '')) ?: 0;
        // Trennlinie mit dem Datum, sobald ein neuer Tag beginnt; an der Nachricht selbst steht dann nur die Uhrzeit.
        if (date('Y-m-d', $t) !== $day) {
            $day = date('Y-m-d', $t);
            $out .= '<li class="kp-day"><span>' . cx_h(kp_day_label($t)) . '</span></li>';
        }
        $who = $mine ? 'Du' : ($von === 'tim' ? 'Tim' : $kundeName);
        $ava = $von === 'tim' ? '<img class="kp-m__ava" src="/assets/img/team/tim-portrait.webp" alt="" width="22" height="22">'
            : '<span class="kp-m__ava">' . kp_initials($kundeName) . '</span>';
        $art = (string) ($m['art'] ?? 'nachricht');
        $tag = $art !== 'nachricht' && isset(KP_ARTEN[$art]) ? '<span class="kp-tag kp-tag--' . $art . '">' . cx_h(KP_ARTEN[$art]) . '</span>' : '';
        $done = $art === 'wunsch' && !empty($m['erledigt']) ? '<span class="kp-tag kp-tag--erledigt">✓ erledigt</span>' : '';
        $new = !$mine && $i >= $seen ? '<span class="kp-tag kp-tag--neu">neu</span>' : '';
        $btn = $doneForm && $art === 'wunsch' ? $doneForm((string) $m['id'], !empty($m['erledigt'])) : '';
        $out .= '<li class="kp-m' . ($mine ? ' kp-m--ich' : '') . (!empty($m['erledigt']) ? ' kp-m--erledigt' : '') . '" id="n-' . cx_h((string) $m['id']) . '">'
            . '<div class="kp-m__kopf">' . $ava . '<b>' . cx_h($who) . '</b> <time datetime="' . cx_h(date('c', $t)) . '" title="' . date('d.m.Y, H:i', $t) . ' Uhr">' . date('H:i', $t) . '</time>' . $tag . $done . $new . '</div>'
            . '<p>' . nl2br(cx_h((string) ($m['text'] ?? ''))) . '</p>' . $btn . '</li>';
    }
    return '<ol class="kp-chat__liste" data-kp-chat>' . $out . '</ol>';
}

// Zwei Anfangsbuchstaben für den runden Kreis vor dem Namen.
function kp_initials(string $n): string
{
    $w = preg_split('/[\s\-]+/u', trim($n), -1, PREG_SPLIT_NO_EMPTY) ?: ['?'];
    $i = mb_substr($w[0], 0, 1) . (count($w) > 1 ? mb_substr((string) end($w), 0, 1) : '');
    return cx_h(mb_strtoupper($i));
}

// „Heute“, „Gestern“ oder z. B. „Fr., 16. Oktober“ (mit Jahr, wenn es nicht das aktuelle ist).
function kp_day_label(int $t): string
{
    $d = date('Y-m-d', $t);
    if ($d === date('Y-m-d')) {
        return 'Heute';
    }
    if ($d === date('Y-m-d', strtotime('-1 day'))) {
        return 'Gestern';
    }
    $wd = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'][(int) date('w', $t)];
    $mo = ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'][(int) date('n', $t) - 1];
    return $wd . ', ' . date('j', $t) . '. ' . $mo . (date('Y', $t) !== date('Y') ? ' ' . date('Y', $t) : '');
}

// ---------------- Projektstand ----------------
// Tim stellt im Admin ein, wo das Projekt steht. Der Kunde sieht oben im Portal die Schritte, den Link zur Vorschau
// und was als Nächstes passiert.
const KP_PHASEN = [
    'start' => ['Start', 'Wir legen los', 'Ich richte alles für deine Webseite ein und melde mich hier mit den nächsten Schritten.'],
    'inhalte' => ['Inhalte', 'Inhalte sammeln', 'Lade Logo, Fotos und Texte hoch. Was mir noch fehlt, steht unten bei „Als Nächstes“.'],
    'entwurf' => ['Entwurf', 'Entwurf in Arbeit', 'Ich baue gerade deine Seite. Sobald es etwas zu sehen gibt, findest du hier den Link zur Vorschau.'],
    'feinschliff' => ['Feinschliff', 'Feinschliff', 'Schau dir die Vorschau in Ruhe an und schreib mir, was dir gefällt und was du anders haben möchtest.'],
    'online' => ['Online', 'Deine Webseite ist online', 'Geschafft! Wenn du später etwas ändern möchtest, schreib mir einfach hier.'],
];

// Bewertungslink des Google-Unternehmensprofils „Tim Kofler – Webdesign“ (auch auf /danke/).
const KP_REVIEW_URL = 'https://g.page/r/CS2eZ1lg7mbtEBM/review';

// Art des Kunden: Betriebe zahlen, Vereine bekommen ihre Seite gratis (tim-kofler.at/verein). Ändert nur Texte und Beispiele.
const KP_KUNDENARTEN = ['betrieb' => 'Betrieb', 'verein' => 'Verein (gratis)'];

function kp_is_verein(array $acc): bool
{
    return ($acc['art'] ?? '') === 'verein';
}

function kp_art_options(string $sel): string
{
    $out = '';
    foreach (KP_KUNDENARTEN as $key => $label) {
        $out .= '<option value="' . $key . '"' . ($key === $sel ? ' selected' : '') . '>' . cx_h($label) . '</option>';
    }
    return $out;
}

// Was Tim für die Webseite braucht, als kurze Liste über dem Hochladen. Stichworte reichen.
function kp_needs(array $acc): string
{
    $items = kp_is_verein($acc)
        ? ['Logo oder Wappen', 'Fotos vom Vereinsleben', 'Termine der nächsten Monate', 'Fürs Impressum: Vereinsname, ZVR-Zahl, wer den Verein vertritt']
        : ['Logo (am besten SVG oder PNG)', '5–10 Fotos: Geschäft, Team, Arbeit', 'Stichworte zu Angebot und Preisen', 'Öffnungszeiten und Kontakt'];
    $li = '';
    foreach ($items as $i) {
        $li .= '<li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' . cx_h($i) . '</li>';
    }
    return '<div class="kp-needs"><b>Was ich von dir brauche</b><ul>' . $li . '</ul><small>Stichworte reichen, daraus mache ich fertige Texte.</small></div>';
}

function kp_phase(array $acc): string
{
    $p = (string) ($acc['phase'] ?? '');
    return isset(KP_PHASEN[$p]) ? $p : 'start';
}

// Nur echte Webadressen (http/https) als Vorschau-Link, nie javascript: oder Ähnliches.
function kp_clean_url(string $u): string
{
    $u = trim($u);
    if ($u === '') {
        return '';
    }
    if (!preg_match('~^https?://~i', $u)) {
        $u = 'https://' . $u;
    }
    return filter_var($u, FILTER_VALIDATE_URL) && preg_match('~^https?://[^\s/$.?#][^\s]*$~i', $u) ? $u : '';
}

// Karte „Stand deiner Webseite“. $edit ist im Admin das Formular zum Ändern (leer für die Kundenseite).
function kp_project_card(array $acc, bool $forKunde, string $edit = ''): string
{
    $phase = kp_phase($acc);
    $keys = array_keys(KP_PHASEN);
    $pos = (int) array_search($phase, $keys, true);
    [, $title, $text] = KP_PHASEN[$phase];
    $steps = '';
    foreach ($keys as $i => $key) {
        $cls = $i < $pos ? 'is-done' : ($i === $pos ? 'is-now' : '');
        $mark = $i < $pos ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' : (string) ($i + 1);
        $steps .= '<li class="' . $cls . '"' . ($i === $pos ? ' aria-current="step"' : '') . '><span class="kp-phasen__dot">' . $mark . '</span><span class="kp-phasen__name">' . cx_h(KP_PHASEN[$key][0]) . '</span></li>';
    }
    $fill = round($pos / (count($keys) - 1) * 100);
    $url = kp_clean_url((string) ($acc['vorschau'] ?? ''));
    $btn = $url !== '' ? '<a class="btn kp-projekt__btn" href="' . cx_h($url) . '" target="_blank" rel="noopener noreferrer">' . ($phase === 'online' ? 'Webseite ansehen' : 'Vorschau ansehen')
        . ' <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg></a>' : '';
    $next = trim((string) ($acc['naechstes'] ?? ''));
    $nextHtml = $next !== '' ? '<p class="kp-next"><b>Als Nächstes</b><span>' . nl2br(cx_h($next)) . '</span></p>' : '';
    // Ist die Seite online, bitte ich um eine Google-Bewertung (öffnet das Bewertungsfenster des Unternehmensprofils).
    $review = $phase === 'online' ? '<div class="tk-review__box kp-review"><p><b>Zufrieden mit deiner Webseite?</b>Eine kurze Google-Bewertung hilft mir sehr, dauert nur eine Minute.</p>'
        . '<a class="tk-review" href="' . KP_REVIEW_URL . '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"/></svg>Bewertung abgeben</a></div>' : '';
    if (!$forKunde) {
        $text = 'So sieht ' . cx_h((string) ($acc['name'] ?? 'der Kunde')) . ' den Stand oben im Portal.';
    }
    return '<section class="kp-card kp-projekt" aria-label="Stand der Webseite">'
        . '<div class="kp-projekt__kopf"><div><span class="kp-eyebrow">Stand deiner Webseite · Schritt ' . ($pos + 1) . ' von ' . count($keys) . '</span>'
        . '<h2>' . cx_h($title) . '</h2><p>' . ($forKunde ? cx_h($text) : $text) . '</p></div>' . $btn . '</div>'
        . '<ol class="kp-phasen" style="--fill:' . $fill . '%">' . $steps . '</ol>' . $nextHtml . $review . $edit . '</section>';
}

// Eingabefeld unter dem Verlauf.
function kp_message_form(string $action, string $csrf, string $placeholder): string
{
    $chips = '';
    foreach (KP_ARTEN as $key => $label) {
        $chips .= '<label class="kp-chip kp-chip--' . $key . '"><input type="radio" name="art" value="' . $key . '"' . ($key === 'nachricht' ? ' checked' : '') . '><span>' . cx_h($label) . '</span></label>';
    }
    $max = KP_MSG_MAX;
    $ph = cx_h($placeholder);
    return <<<HTML
<form class="kp-chat__form" method="post" action="{$action}">
  {$csrf}
  <input type="hidden" name="aktion" value="schreiben">
  <div class="kp-chips" role="radiogroup" aria-label="Art der Nachricht">{$chips}</div>
  <label class="form__field"><span class="sr-only">Nachricht</span><textarea name="text" rows="3" required maxlength="{$max}" placeholder="{$ph}" data-kp-grow></textarea></label>
  <div class="kp-chat__senden"><button class="btn" type="submit">Senden</button><span class="kp-chat__tipp">oder Strg + Enter</span></div>
</form>
HTML;
}

// E-Mail an die Gegenseite. Tim bekommt jede Kundennachricht, der Kunde nur, wenn eine E-Mail hinterlegt ist.
function kp_notify_message(string $u, array $acc, array $msg): void
{
    $c = cx_config();
    if (empty($c['brevo_api_key'])) {
        cx_log('Kundenportal: Nachricht von/an ' . $u . ' ohne E-Mail (kein Brevo-Schlüssel)');
        return;
    }
    $art = KP_ARTEN[$msg['art']] ?? 'Nachricht';
    $text = '<div style="margin:0 0 6px;font-size:13px;color:#a1a1a1">' . cx_h($art) . '</div>'
        . '<div style="padding:14px 16px;border-left:3px solid #ff5a1f;background:#161616;color:#f4f4f0;font-size:15px">' . nl2br(cx_h((string) $msg['text'])) . '</div>';
    $notify = (string) ($c['notify_email'] ?? 'office@tim-kofler.at');
    $email = (string) ($acc['email'] ?? '');
    if ($msg['von'] === 'kunde') {
        $who = trim((string) ($acc['firma'] ?? '')) !== '' ? $acc['firma'] . ' (' . ($acc['name'] ?? $u) . ')' : (string) ($acc['name'] ?? $u);
        $inner = '<p style="margin:0 0 14px">' . cx_h($who) . ' hat dir im Kundenportal geschrieben:</p>' . $text
            . cx_button(kp_portal_url('/kunden/admin/?k=' . rawurlencode($u) . '#nachrichten'), 'Antworten');
        if (!cx_mail($notify, 'Tim', $art . ' von ' . $who, cx_mail_layout('Neue Nachricht im Kundenportal', $inner), $email)) {
            cx_log('Kundenportal: Nachricht von ' . $u . ' nicht per E-Mail gemeldet');
        }
    } elseif ($email !== '') {
        $inner = '<p style="margin:0 0 14px">Hallo ' . cx_h((string) ($acc['name'] ?? '')) . ',</p><p style="margin:0 0 14px">ich habe dir im Kundenportal geschrieben:</p>' . $text
            . cx_button(kp_portal_url('/kunden/#nachrichten'), 'Im Kundenportal antworten')
            . '<p style="margin:18px 0 0;font-size:13px;color:#a1a1a1">Bitte antworte im Kundenportal, dann bleibt alles zu deiner Webseite an einem Ort.</p>';
        cx_mail($email, (string) ($acc['name'] ?? ''), 'Neue Nachricht von Tim zu deiner Webseite', cx_mail_layout('Neue Nachricht von Tim', $inner), $notify);
    }
}

// ---------------- Seitenrahmen ----------------

function kp_page(string $title, string $body, string $nav = ''): void
{
    $t = cx_h($title);
    // Kleine Ortsangabe neben dem Logo (nur am PC sichtbar): Bereich und aktuelle Seite
    $ort = ['Kundenportal'];
    if (str_starts_with((string) parse_url((string) ($_SERVER['REQUEST_URI'] ?? ''), PHP_URL_PATH), '/kunden/admin')) {
        $ort[] = 'Admin';
    }
    if (!in_array($title, $ort, true)) {
        $ort[] = $title;
    }
    $where = implode('<i aria-hidden="true">/</i>', array_map(fn($o) => '<span>' . cx_h($o) . '</span>', $ort));
    header('Content-Type: text/html; charset=utf-8');
    echo <<<HTML
<!DOCTYPE html>
<html lang="de-AT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{$t} | Tim Kofler – Kundenportal</title>
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="#0b0b0b">
  <link rel="icon" href="/assets/img/tk-badge-2.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/style.css?v=5d1d811a">
  <link rel="stylesheet" href="/assets/css/tk.css?v=30caca89">
  <link rel="stylesheet" href="/assets/css/portal.css?v=8a2f6d31">
</head>
<body class="kp">
<header class="header">
  <div class="container header__inner">
    <div class="kp-brand">
      <a href="/" class="tk-logo" aria-label="Tim Kofler Webdesign – Startseite"><img src="/assets/img/tk-logo-2.svg" alt="Tim Kofler Webdesign" width="71" height="36"></a>
      <span class="kp-where" title="Hier bist du gerade">{$where}</span>
    </div>
    <div class="kp-nav">{$nav}</div>
  </div>
</header>
<main>
<section class="section kp-main">
  <div class="container">
{$body}
  </div>
</section>
</main>
<footer class="footer kp-foot">
  <div class="container footer__bottom">
    <span>© Tim Kofler · Kundenportal · Hier wird nur ein technisch notwendiges Sitzungs-Cookie gesetzt.</span>
    <span><a href="/impressum/">Impressum</a> · <a href="/datenschutz/#kundenportal">Datenschutz</a></span>
  </div>
</footer>
<script src="/assets/js/portal.js?v=9ac4cfab"></script>
</body>
</html>
HTML;
    exit;
}
