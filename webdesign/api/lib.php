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

// Name, Logo und Adresse für Seite und Mails. Standard ist crypto-x.at, tim-kofler.at setzt eigene Werte in der config.php.
function cx_brand(): array
{
    $c = cx_config();
    return [
        'site' => (string) ($c['site'] ?? CX_SITE),
        'name' => (string) ($c['name'] ?? 'CryptoX'),
        'wordmark' => (string) ($c['wordmark_html'] ?? 'Crypto<span style="color:#dcf763">X</span>'),
        'footer' => (string) ($c['footer_name'] ?? 'Crypto X Solutions · Tim Kofler'),
        'accent' => (string) ($c['accent'] ?? '#dcf763'),
    ];
}

// Führt $fn unter einer exklusiven Dateisperre aus (Zähler und Grenzen bei parallelen Anfragen).
function cx_locked(string $lockFile, callable $fn)
{
    $dir = dirname($lockFile);
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    $h = @fopen($lockFile, 'c');
    if ($h) {
        flock($h, LOCK_EX);
    }
    try {
        return $fn();
    } finally {
        if ($h) {
            flock($h, LOCK_UN);
            fclose($h);
        }
    }
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
    $name = cx_h(cx_brand()['name']);
    echo <<<HTML
<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>{$t} | {$name}</title><link rel="stylesheet" href="/assets/css/style.css?v=5d1d811a"></head>
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

// Macht einen Text einzeilig: Zeilenumbrüche und Tabs werden zu einem Leerzeichen, Doppelte zusammengezogen.
// Für Felder, die nie mehrzeilig sein dürfen (Mail-Betreff, Empfängername).
function cx_oneline(string $v): string
{
    return trim((string) preg_replace('/\s+/u', ' ', str_replace(["\r", "\n", "\t"], ' ', $v)));
}

// Grundschutz gegen Spam und fremde Seiten: nur POST, nur von crypto-x.at, Honeypot, Mindestzeit.
function cx_guard(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        header('Allow: POST');
        cx_page('Nicht erlaubt', 'Diese Adresse nimmt nur Formulare entgegen.', 405);
    }
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $origins = (array) (cx_config()['origins'] ?? [CX_SITE, 'https://www.crypto-x.at']);
    if ($origin !== '' && !in_array($origin, $origins, true)) {
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

// Kennung eines Anschlusses für die Ratengrenze: bei IPv4 die Adresse, bei IPv6 nur das /64-Netz.
// Sonst könnte ein einzelner Rechner über seinen riesigen IPv6-Bereich beliebig viele Kennungen
// vortäuschen und die Grenze je Anschluss umgehen (so wie es der KI-Chat schon macht).
function cx_client_id(): string
{
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
    $bin = @inet_pton($ip);
    if (is_string($bin) && strlen($bin) === 16) {
        return bin2hex(substr($bin, 0, 8)) . '::/64';
    }
    return $ip;
}

// Höchstens 6 Absendungen pro Stunde je Anschluss und 30 pro Stunde insgesamt (falls jemand ständig die IP wechselt).
// Gespeichert wird nur ein Hash der IP-Adresse.
function cx_rate_ok(): bool
{
    return cx_rate_hit('ip:' . cx_client_id(), 6, 3600)
        && cx_rate_hit('alle', 30, 3600);
}

// Zählt einen Versuch für $key und sagt, ob noch höchstens $limit in den letzten $window Sekunden liegen.
// Der Schlüssel wird nur als Hash gespeichert (IP-Adresse, E-Mail-Adresse, Telefonnummer).
function cx_rate_hit(string $key, int $limit, int $window): bool
{
    $dir = CX_DATA . '/rate';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
        return true;
    }
    $salt = (string) (cx_config()['secret'] ?? 'cx');
    $file = $dir . '/' . hash('sha256', $salt . $key) . '.json';
    $now = time();
    $ok = cx_locked($dir . '/.lock', static function () use ($file, $now, $limit, $window) {
        $hits = is_file($file) ? (json_decode((string) file_get_contents($file), true) ?: []) : [];
        $hits = array_values(array_filter($hits, static fn($t) => is_int($t) && $t > $now - $window));
        if (count($hits) >= $limit) {
            return false;
        }
        $hits[] = $now;
        @file_put_contents($file, json_encode($hits), LOCK_EX);
        return true;
    });
    // Alte Dateien gelegentlich aufräumen (längstes Fenster: ein Tag).
    if (random_int(1, 50) === 1) {
        foreach (glob($dir . '/*.json') ?: [] as $f) {
            if (@filemtime($f) < $now - 90000) {
                @unlink($f);
            }
        }
    }
    return $ok;
}

// Enthält der Text Links, Domains, E-Mail-Adressen oder Telefonnummern (auch mit Unicode-Punkten oder [.])?
// Für Felder, die in Mails an fremde Adressen oder auf öffentlichen Seiten erscheinen.
function cx_has_link(string $s): bool
{
    return (bool) preg_match('~https?:|www\.|[/@]|[\p{L}\p{N}](?:[.\x{3002}\x{FF0E}\x{FF61}]|\s*\[\s*\.\s*\]\s*|\s*\(\s*\.\s*\)\s*)\p{L}{2,}\b|\d[\d /().-]{5,}\d~iu', $s);
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
        // Kein curl_close(): seit PHP 8.0 wirkungslos, ab PHP 8.5 als veraltet gemeldet.
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
    // Betreff und Empfängername sind einzeilig: Zeilenumbrüche/Tabs raus, damit kein fremder Text
    // oder Kopfzeilen-Trick in die Mail rutscht (auch wenn der Versand über die Brevo-JSON-API läuft).
    $subject = cx_oneline($subject);
    $toName = cx_oneline($toName);
    $body = [
        'sender' => ['email' => (string) ($c['sender_email'] ?? 'tk@crypto-x.at'), 'name' => (string) ($c['sender_name'] ?? 'CryptoX')],
        'to' => [array_filter(['email' => $to, 'name' => $toName])],
        'subject' => $subject,
        'htmlContent' => $html,
        // Reine Text-Fassung dazu: Mails nur mit HTML werten Spamfilter (z. B. bei ALL-INKL) schlechter.
        'textContent' => cx_mail_text($html),
        'tags' => ['website'],
    ];
    if ($replyTo !== '') {
        $body['replyTo'] = ['email' => $replyTo];
    }
    return cx_ok(cx_brevo('POST', '/smtp/email', $body));
}

// Text-Fassung aus dem HTML einer Mail: Zeilenumbrüche bleiben, Links als „Text (Adresse)“.
function cx_mail_text(string $html): string
{
    $t = (string) preg_replace('#<(head|style|script)\b.*?</\1>#is', '', $html);
    $t = (string) preg_replace_callback('#<a\b[^>]*href="([^"]+)"[^>]*>(.*?)</a>#is', static function (array $m): string {
        $label = trim(strip_tags($m[2]));
        $url = html_entity_decode($m[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
        return $label === '' || $label === $url ? $url : $label . ' (' . $url . ')';
    }, $t);
    $t = (string) preg_replace('#<br\s*/?>#i', "\n", $t);
    $t = (string) preg_replace('#</(p|h[1-6]|tr|li|div|table)>#i', "\n\n", $t);
    $t = (string) preg_replace('#</td>#i', ' ', $t);
    $t = html_entity_decode(strip_tags($t), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $t = (string) preg_replace('/[ \t\x{00A0}]+/u', ' ', $t);
    $t = (string) preg_replace('/ *\n */', "\n", $t);
    return trim((string) preg_replace('/\n{3,}/', "\n\n", $t));
}

// Einheitliches Mail-Layout im Auftritt von tim-kofler.at: dunkel, TK-Logo, orange Linie und Knöpfe.
// Tabellen, Inline-Styles und bgcolor, damit es in allen Mailprogrammen (auch Outlook und im Hell-/Dunkelmodus) gleich aussieht.
// $bereich steht klein unter dem Namen, z. B. „Kundenportal“.
function cx_mail_layout(string $title, string $inner, string $bereich = ''): string
{
    $t = cx_h($title);
    $site = cx_h(rtrim(cx_brand()['site'], '/'));
    $sub = 'Webdesign' . ($bereich !== '' ? ' · ' . cx_h($bereich) : '');
    // Links ohne eigene Farbe in Orange statt im Blau des Mailprogramms.
    $inner = (string) preg_replace('/<a (?![^>]*\bstyle=)/', '<a style="color:#ff7a45" ', $inner);
    return <<<HTML
<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>{$t}</title></head>
<body style="margin:0;padding:0;background:#0b0b0b" bgcolor="#0b0b0b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0b0b0b" style="background:#0b0b0b;padding:28px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#151515" style="max-width:560px;background:#151515;border:1px solid #262626;border-top:3px solid #ff5a1f;border-radius:16px">
<tr><td style="padding:26px 32px 4px;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="padding-right:12px"><img src="{$site}/assets/img/tk-badge-2-256.png" width="44" height="44" alt="TK" style="display:block;border:0;border-radius:22px"></td>
<td style="font-size:15px;line-height:1.3;color:#f4f4f0;font-weight:bold">Tim Kofler<br><span style="font-weight:normal;font-size:12px;color:#a1a1a1;letter-spacing:.06em;text-transform:uppercase">{$sub}</span></td>
</tr></table></td></tr>
<tr><td style="padding:8px 32px 28px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#e6e6e2">
<h1 style="margin:18px 0 16px;font-size:23px;line-height:1.3;color:#f4f4f0">{$t}</h1>
{$inner}
</td></tr>
<tr><td style="padding:18px 32px 26px;border-top:1px solid #262626;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8a8a8a">
Tim Kofler – Webdesign · Lehen 2, 3281 Oberndorf an der Melk, Österreich<br>
<a href="{$site}/" style="color:#8a8a8a">tim-kofler.at</a> · <a href="{$site}/impressum/" style="color:#8a8a8a">Impressum</a> · <a href="{$site}/datenschutz/" style="color:#8a8a8a">Datenschutz</a>
</td></tr>
</table></td></tr></table></body></html>
HTML;
}

// Oranger Knopf als Tabelle (rund und klickbar auch in Outlook).
function cx_button(string $href, string $label): string
{
    return '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 14px"><tr><td bgcolor="#ff5a1f" style="border-radius:999px;background:#ff5a1f">'
        . '<a href="' . cx_h($href) . '" style="display:inline-block;padding:14px 26px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#0b0b0b;text-decoration:none;border-radius:999px">' . cx_h($label) . '</a></td></tr></table>';
}

// Angaben als Tabelle im abgesetzten Kasten (z. B. die Daten einer Anfrage in der Mail an Tim).
function cx_mail_table(string $rows): string
{
    return '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" bgcolor="#1d1d1d" style="margin:4px 0 6px;background:#1d1d1d;border:1px solid #2c2c2c;border-radius:12px">'
        . '<tr><td style="padding:12px 18px"><table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px">' . $rows . '</table></td></tr></table>';
}

// Einheitlicher Gruß am Ende jeder Mail an Kundinnen und Kunden.
function cx_mail_gruss(): string
{
    return '<p style="margin:18px 0 0">Liebe Grüße<br><b style="color:#f4f4f0">Tim Kofler</b></p>';
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
// Name und Inhalt des Newsletters kommen aus der config.php (newsletter_name, newsletter_inhalt), Standard ist CryptoX.
function cx_send_optin(string $email, string $firstname, string $source, array $extra = []): bool
{
    $c = cx_config();
    // $extra reist zusätzlich signiert im Token mit (z. B. Paket/Quelle der Webseiten-Anfrage) und wird
    // erst nach dem Klick in bestaetigen.php verarbeitet. Vorher wird nichts in Brevo eingetragen.
    $token = cx_token(['e' => $email, 'n' => $firstname, 's' => $source, 't' => time()] + $extra);
    $link = cx_brand()['site'] . '/api/bestaetigen.php?t=' . rawurlencode($token);
    $hallo = $firstname !== '' ? 'Hallo ' . cx_h($firstname) . ',' : 'Hallo,';
    if ($source === 'webseite' && !empty($extra['ck'])) {
        // Webseiten-Check (/check/): die 24 Stunden laufen erst ab der Bestätigung.
        $subject = 'Bitte bestätige deinen Webseiten-Check';
        $erklaerung = 'danke für deine Anfrage! Bitte bestätige noch kurz mit einem Klick, dass sie von dir kommt – '
            . 'dann sehe ich mir deine Webseite an und schicke dir meine Einschätzung innerhalb von 24 Stunden an Werktagen an diese Adresse.';
        $label = 'Check bestätigen';
    } elseif ($source === 'webseite') {
        // Webseiten-Anfrage: Tim ist über die Anfrage bereits informiert und meldet sich in jedem Fall.
        // Dieser Klick bestätigt nur die E-Mail-Adresse (Eingangsbestätigung + Eintrag erst danach).
        $subject = 'Bitte bestätige deine Webseiten-Anfrage';
        $erklaerung = 'danke für deine Anfrage! Deine Angaben liegen bereits bei mir und ich melde mich in jedem Fall bei dir. '
            . 'Bitte bestätige noch kurz mit einem Klick, dass die Anfrage von dir kommt – dann schicke ich dir eine Eingangsbestätigung.';
        $label = 'Anfrage bestätigen';
    } elseif ($source === 'gratisentwurf') {
        // Gratis-Entwurf: Angaben liegen schon bei Tim. Erst nach Bestätigung der E-Mail lege ich los
        // und schicke den Entwurf an diese Adresse (Schutz davor, fremde Adressen anzuschreiben).
        $subject = 'Bitte bestätige deine Entwurf-Anfrage';
        $erklaerung = 'danke für deine Anfrage! Bitte bestätige noch kurz mit einem Klick deine E-Mail-Adresse – '
            . 'dann lege ich mit deinem kostenlosen Entwurf los und schicke ihn dir innerhalb von 48 Stunden an diese Adresse.';
        $label = 'Entwurf bestätigen';
    } else {
        $nl = (string) ($c['newsletter_name'] ?? 'CryptoX Newsletter');
        $was = (string) ($c['newsletter_inhalt'] ?? 'Darin geht es um neue Funktionen im CryptoX Dashboard, Software-Tipps und neue Artikel. Keine Anlageberatung, keine Signale.');
        if ($source === 'sicherheit') {
            $nl .= ' mit Sicherheits-Hinweisen';
            $was = 'Ich schreibe dir, wenn eine wichtige Sicherheitslücke kleine Websites betrifft, dazu ab und zu Tipps für deine Webseite. Kein Spam.';
        }
        $subject = 'Bitte bestätige deine Anmeldung zum ' . $nl;
        $erklaerung = 'bitte bestätige mit einem Klick, dass du den ' . cx_h($nl) . ' bekommen möchtest. ' . cx_h($was);
        $label = 'Anmeldung bestätigen';
    }
    $inner = '<p style="margin:0 0 14px">' . $hallo . '</p>'
        . '<p style="margin:0 0 14px">' . $erklaerung . '</p>'
        . cx_button($link, $label)
        . '<p style="margin:0 0 14px;font-size:14px;color:#a1a1a1">Der Link ist 7 Tage gültig. Wenn du das nicht warst, ignoriere diese E-Mail einfach. Ohne Bestätigung wird nichts eingetragen.</p>';
    $ok = cx_mail($email, $firstname, $subject, cx_mail_layout('Fast geschafft', $inner));
    if ($ok) {
        cx_consent_log('optin_mail_' . $source, $email);
    }
    return $ok;
}
