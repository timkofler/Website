<?php
// CryptoX – gemeinsame Funktionen für Beta-Bewerbung und Newsletter.
// Wird nur per include geladen, direkter Aufruf ist per .htaccess gesperrt.

declare(strict_types=1);

const CX_DATA = __DIR__ . '/_data';
const CX_SITE = 'https://crypto-x.at';

function cx_config(): array
{
    static $cfg = null;
    if ($cfg !== null) {
        return $cfg;
    }
    $file = CX_DATA . '/config.php';
    $cfg = is_file($file) ? (array) require $file : [];
    return $cfg;
}

function cx_ready(): bool
{
    $c = cx_config();
    return !empty($c['brevo_api_key']) && !empty($c['secret']) && strlen((string) $c['secret']) >= 32;
}

function cx_wants_json(): bool
{
    return stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;
}

// Antwort an den Browser: JSON für das Formular-Skript, sonst Weiterleitung bzw. einfache Seite.
function cx_respond(bool $ok, string $message, string $next = ''): void
{
    if (cx_wants_json()) {
        http_response_code($ok ? 200 : 400);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode(['ok' => $ok, 'message' => $message, 'next' => $next], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    if ($ok && $next !== '') {
        header('Location: ' . $next, true, 303);
        exit;
    }
    cx_page($ok ? 'Danke' : 'Das hat nicht geklappt', $message);
}

function cx_page(string $title, string $message, int $code = 400): void
{
    http_response_code($code);
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store');
    $t = cx_h($title);
    $m = cx_h($message);
    echo <<<HTML
<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>{$t} | CryptoX</title><link rel="stylesheet" href="/assets/css/style.css"></head>
<body><main><section class="section"><div class="container prose" style="max-width:640px">
<h1>{$t}</h1><p>{$m}</p><p><a class="btn" href="/">Zur Startseite</a></p></div></section></main></body></html>
HTML;
    exit;
}

function cx_h(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

// Text aus dem Formular: getrimmt, ohne Steuerzeichen, mit Längenbegrenzung.
function cx_field(string $name, int $max = 200): string
{
    $v = $_POST[$name] ?? '';
    if (!is_string($v)) {
        return '';
    }
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
    $v = trim($v);
    return function_exists('mb_substr') ? mb_substr($v, 0, $max) : substr($v, 0, $max);
}

function cx_email(string $v): string
{
    $v = strtolower(trim($v));
    return (strlen($v) <= 254 && filter_var($v, FILTER_VALIDATE_EMAIL)) ? $v : '';
}

// Grundschutz gegen Spam und fremde Seiten: nur POST, nur von crypto-x.at, Honeypot, Mindestzeit.
function cx_guard(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        header('Allow: POST');
        cx_page('Nicht erlaubt', 'Diese Adresse nimmt nur Formulare entgegen.', 405);
    }
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '' && !in_array($origin, [CX_SITE, 'https://www.crypto-x.at'], true)) {
        cx_respond(false, 'Ungültige Anfrage.');
    }
    // Feld "website" ist für Menschen unsichtbar, Bots füllen es gerne aus.
    if (cx_field('website') !== '') {
        cx_respond(true, 'Danke!', '/');
    }
    // Das Formular-Skript setzt den Zeitpunkt beim Laden. Unter 3 Sekunden ist es fast sicher ein Bot.
    $ts = (int) cx_field('ts', 20);
    if ($ts > 0 && (int) (microtime(true) * 1000) - $ts < 3000) {
        cx_respond(false, 'Das ging etwas zu schnell. Bitte versuche es in ein paar Sekunden noch einmal.');
    }
    if (!cx_rate_ok()) {
        cx_respond(false, 'Zu viele Anfragen in kurzer Zeit. Bitte versuche es später noch einmal.');
    }
}

// Höchstens 6 Absendungen pro Stunde je Anschluss. Gespeichert wird nur ein Hash der IP-Adresse.
function cx_rate_ok(): bool
{
    $dir = CX_DATA . '/rate';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
        return true;
    }
    $salt = (string) (cx_config()['secret'] ?? 'cx');
    $file = $dir . '/' . hash('sha256', $salt . ($_SERVER['REMOTE_ADDR'] ?? '')) . '.json';
    $now = time();
    $hits = is_file($file) ? (json_decode((string) file_get_contents($file), true) ?: []) : [];
    $hits = array_values(array_filter($hits, static fn($t) => is_int($t) && $t > $now - 3600));
    if (count($hits) >= 6) {
        return false;
    }
    $hits[] = $now;
    @file_put_contents($file, json_encode($hits), LOCK_EX);
    // Alte Dateien gelegentlich aufräumen.
    if (random_int(1, 50) === 1) {
        foreach (glob($dir . '/*.json') ?: [] as $f) {
            if (@filemtime($f) < $now - 7200) {
                @unlink($f);
            }
        }
    }
    return true;
}

// Aufruf der Brevo-API (https://api.brevo.com/v3). Der Schlüssel bleibt auf dem Server.
function cx_brevo(string $method, string $path, array $body): array
{
    $key = (string) (cx_config()['brevo_api_key'] ?? '');
    $url = (string) (cx_config()['brevo_url'] ?? 'https://api.brevo.com/v3') . $path;
    $json = json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $headers = ['api-key: ' . $key, 'Content-Type: application/json', 'Accept: application/json'];

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_POSTFIELDS => $json,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
        ]);
        $res = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
    } else {
        $ctx = stream_context_create(['http' => [
            'method' => $method, 'header' => implode("\r\n", $headers), 'content' => $json,
            'timeout' => 15, 'ignore_errors' => true,
        ]]);
        $res = @file_get_contents($url, false, $ctx);
        $code = 0;
        foreach ($http_response_header ?? [] as $h) {
            if (preg_match('#^HTTP/\S+\s+(\d{3})#', $h, $m)) {
                $code = (int) $m[1];
            }
        }
    }
    $data = is_string($res) ? (json_decode($res, true) ?: []) : [];
    if ($code < 200 || $code >= 300) {
        cx_log('Brevo ' . $method . ' ' . $path . ' → ' . $code . ' ' . substr((string) $res, 0, 300));
    }
    return ['code' => $code, 'data' => $data];
}

function cx_ok(array $r): bool
{
    return $r['code'] >= 200 && $r['code'] < 300;
}

// Kontakt anlegen oder aktualisieren und in Listen eintragen.
function cx_contact(string $email, string $firstname, array $listIds, array $extra = [], array $more = []): bool
{
    $attrs = array_filter(['FIRSTNAME' => $firstname] + $extra, static fn($v) => $v !== '');
    $body = ['email' => $email, 'updateEnabled' => true, 'listIds' => array_values(array_map('intval', array_filter($listIds)))];
    $body += $more;
    if ($attrs) {
        $body['attributes'] = $attrs;
    }
    $r = cx_brevo('POST', '/contacts', $body);
    if (!cx_ok($r) && $attrs) {
        // Falls ein Attribut im Brevo-Konto (noch) nicht existiert: ohne Attribute erneut versuchen.
        unset($body['attributes']);
        $r = cx_brevo('POST', '/contacts', $body);
    }
    return cx_ok($r);
}

// Einzelne E-Mail über Brevo verschicken (Bestätigungen, Benachrichtigung an Tim).
function cx_mail(string $to, string $toName, string $subject, string $html, string $replyTo = ''): bool
{
    $c = cx_config();
    $body = [
        'sender' => ['email' => (string) ($c['sender_email'] ?? 'tk@crypto-x.at'), 'name' => (string) ($c['sender_name'] ?? 'CryptoX')],
        'to' => [array_filter(['email' => $to, 'name' => $toName])],
        'subject' => $subject,
        'htmlContent' => $html,
        'tags' => ['website'],
    ];
    if ($replyTo !== '') {
        $body['replyTo'] = ['email' => $replyTo];
    }
    return cx_ok(cx_brevo('POST', '/smtp/email', $body));
}

// Einheitliches Mail-Layout im CryptoX-Design (Tabellen, Inline-Styles für alle Mailprogramme).
function cx_mail_layout(string $title, string $inner): string
{
    $t = cx_h($title);
    return <<<HTML
<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{$t}</title></head>
<body style="margin:0;padding:0;background:#0b0b0b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b0b;padding:32px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#151515;border:1px solid #262626;border-radius:16px">
<tr><td style="padding:28px 32px 8px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:bold;color:#f4f4f0">Crypto<span style="color:#dcf763">X</span></td></tr>
<tr><td style="padding:8px 32px 28px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#e6e6e2">
<h1 style="margin:12px 0 16px;font-size:22px;line-height:1.3;color:#f4f4f0">{$t}</h1>
{$inner}
</td></tr>
<tr><td style="padding:18px 32px 26px;border-top:1px solid #262626;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8a8a8a">
Crypto X Solutions · Tim Kofler · Lehen 2, 3281 Oberndorf an der Melk, Österreich<br>
<a href="https://crypto-x.at/impressum/" style="color:#8a8a8a">Impressum</a> · <a href="https://crypto-x.at/datenschutz/" style="color:#8a8a8a">Datenschutz</a>
</td></tr>
</table></td></tr></table></body></html>
HTML;
}

function cx_button(string $href, string $label): string
{
    return '<p style="margin:26px 0"><a href="' . cx_h($href) . '" style="display:inline-block;background:#dcf763;color:#0b0b0b;font-weight:bold;text-decoration:none;padding:13px 22px;border-radius:999px">' . cx_h($label) . '</a></p>';
}

// Signierter Bestätigungslink für das Double-Opt-in (7 Tage gültig).
function cx_token(array $payload): string
{
    $p = rtrim(strtr(base64_encode(json_encode($payload, JSON_UNESCAPED_UNICODE)), '+/', '-_'), '=');
    $sig = rtrim(strtr(base64_encode(hash_hmac('sha256', $p, (string) cx_config()['secret'], true)), '+/', '-_'), '=');
    return $p . '.' . $sig;
}

function cx_token_read(string $token): ?array
{
    $parts = explode('.', $token);
    if (count($parts) !== 2) {
        return null;
    }
    [$p, $sig] = $parts;
    $expect = rtrim(strtr(base64_encode(hash_hmac('sha256', $p, (string) cx_config()['secret'], true)), '+/', '-_'), '=');
    if (!hash_equals($expect, $sig)) {
        return null;
    }
    $data = json_decode((string) base64_decode(strtr($p, '-_', '+/')), true);
    if (!is_array($data) || empty($data['e']) || empty($data['t']) || (int) $data['t'] < time() - 7 * 86400) {
        return null;
    }
    return $data;
}

// Einwilligungen nachweisbar protokollieren (§ 174 TKG, Art. 7 DSGVO). IP nur als Hash.
function cx_consent_log(string $event, string $email): void
{
    $line = json_encode([
        'zeit' => date('c'), 'ereignis' => $event, 'email' => $email,
        'ip_hash' => substr(hash('sha256', (string) (cx_config()['secret'] ?? '') . ($_SERVER['REMOTE_ADDR'] ?? '')), 0, 16),
    ], JSON_UNESCAPED_UNICODE) . "\n";
    @file_put_contents(CX_DATA . '/einwilligungen.log', $line, FILE_APPEND | LOCK_EX);
}

function cx_log(string $msg): void
{
    @file_put_contents(CX_DATA . '/fehler.log', date('c') . ' ' . $msg . "\n", FILE_APPEND | LOCK_EX);
}

// Newsletter: Bestätigungsmail mit signiertem Link verschicken.
function cx_send_optin(string $email, string $firstname, string $source): bool
{
    $token = cx_token(['e' => $email, 'n' => $firstname, 's' => $source, 't' => time()]);
    $link = CX_SITE . '/api/bestaetigen.php?t=' . rawurlencode($token);
    $hallo = $firstname !== '' ? 'Hallo ' . cx_h($firstname) . ',' : 'Hallo,';
    $inner = '<p style="margin:0 0 14px">' . $hallo . '</p>'
        . '<p style="margin:0 0 14px">bitte bestätige mit einem Klick, dass du den CryptoX Newsletter bekommen möchtest. Darin geht es um neue Funktionen im CryptoX Dashboard, Software-Tipps und neue Artikel. Keine Anlageberatung, keine Signale.</p>'
        . cx_button($link, 'Anmeldung bestätigen')
        . '<p style="margin:0 0 14px;font-size:14px;color:#a1a1a1">Der Link ist 7 Tage gültig. Wenn du dich nicht angemeldet hast, ignoriere diese E-Mail einfach. Ohne Bestätigung wirst du nicht eingetragen.</p>';
    $ok = cx_mail($email, $firstname, 'Bitte bestätige deine Anmeldung zum CryptoX Newsletter', cx_mail_layout('Fast geschafft', $inner));
    if ($ok) {
        cx_consent_log('optin_mail_' . $source, $email);
    }
    return $ok;
}
