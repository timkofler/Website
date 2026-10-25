<?php
// Tim Kofler – KI-Antworten für den Antwort-Assistenten („Fragen?“-Knopf) über die Claude-API von Anthropic.
// Wird nur per include geladen, direkter Aufruf ist per .htaccess gesperrt.
//
// Der API-Schlüssel steht nur in api/_data/config.php auf dem Server (nie im Repo, nie im Browser).
// Gespeichert werden keine Chat-Inhalte: nur Tagessummen (Fragen, Tokens) und für das Limit pro Besucher
// die Zeitpunkte der Fragen unter einem Hash der IP-Adresse (höchstens 24 Stunden).

declare(strict_types=1);

require_once __DIR__ . '/lib.php';

const CH_DIR = CX_DATA . '/chat';
const CH_API = 'https://api.anthropic.com/v1/messages';
const CH_VERSION = '2026-10-21';

// Einstellungen mit Standardwerten. Alles lässt sich in der config.php überschreiben.
function ch_cfg(): array
{
    $c = cx_config();
    return [
        'key' => trim((string) ($c['anthropic_api_key'] ?? '')),
        'model' => (string) ($c['chat_model'] ?? 'claude-haiku-5-5'),
        'pro_stunde' => (int) ($c['chat_pro_stunde'] ?? 15),
        'pro_tag' => (int) ($c['chat_pro_tag'] ?? 40),
        'tageslimit' => (int) ($c['chat_tageslimit'] ?? 400),
        'aus' => !empty($c['chat_aus']),
    ];
}

function ch_ready(): bool
{
    $c = ch_cfg();
    return !$c['aus'] && $c['key'] !== '' && $c['tageslimit'] > 0;
}

function ch_json(array $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// ---------------- Wissen aus der Seite ----------------
// Feste Antworten, Link-Liste und Branchen-Beispiele kommen direkt aus tk-ui.js, der Überblick aus llms.txt.
// So weiß die KI immer dasselbe wie die Seite, ohne zweite Liste zum Pflegen.

function ch_js(): string
{
    static $js = null;
    if ($js === null) {
        $js = (string) @file_get_contents(dirname(__DIR__) . '/assets/js/tk-ui.js');
    }
    return $js;
}

// JS-Zeichenkette in doppelten Anführungszeichen (\n, \" …) wie JSON lesen.
function ch_str(string $s): string
{
    $v = json_decode('"' . $s . '"');
    return is_string($v) ? $v : stripslashes($s);
}

function ch_block(string $name): string
{
    $js = ch_js();
    $start = strpos($js, 'var ' . $name . ' = ');
    if ($start === false) {
        return '';
    }
    $ends = array_filter([strpos($js, "\n  };", $start), strpos($js, "\n  ];", $start)], 'is_int');
    return $ends ? substr($js, $start, min($ends) - $start) : '';
}

// Schlüssel → [Text, Adresse]
function ch_links(): array
{
    $out = [];
    if (preg_match_all('/(\w+): \["((?:[^"\\\\]|\\\\.)*)", "((?:[^"\\\\]|\\\\.)*)"\]/', ch_block('LINKS'), $m, PREG_SET_ORDER)) {
        foreach ($m as $l) {
            $out[$l[1]] = [ch_str($l[2]), ch_str($l[3])];
        }
    }
    if (preg_match('/var WA = "([^"]+)"/', ch_js(), $wa)) {
        $out['whatsapp'] = ['Auf WhatsApp schreiben', $wa[1]];
    }
    unset($out['tel']);
    return $out;
}

// Adresse → [Branche, Beispiel]
function ch_beispiele(): array
{
    $out = [];
    if (preg_match_all('/\[\/.*?\/, "([^"]+)", "([^"]+)", "(\/beispiele\/[a-z0-9\/-]+)"\]/', ch_block('BRANCHEN'), $m, PREG_SET_ORDER)) {
        foreach ($m as $b) {
            $out[$b[3]] = [ch_str($b[1]), ch_str($b[2])];
        }
    }
    return $out;
}

// Feste Antworten als „Frage: Antwort“
function ch_antworten(): array
{
    $out = [];
    if (preg_match_all('/(\w+): \{ q: "((?:[^"\\\\]|\\\\.)*)", a: "((?:[^"\\\\]|\\\\.)*)"/', ch_block('ANSWERS'), $m, PREG_SET_ORDER)) {
        foreach ($m as $a) {
            $out[$a[1]] = [ch_str($a[2]), ch_str($a[3])];
        }
    }
    return $out;
}

function ch_system(): string
{
    $teile = [trim((string) @file_get_contents(__DIR__ . '/chat-anweisung.md')), '# Wissen'];
    $llms = trim((string) @file_get_contents(dirname(__DIR__) . '/llms.txt'));
    if ($llms !== '') {
        $teile[] = "## Überblick über die Seite (llms.txt)\n\n" . $llms;
    }
    $faq = [];
    foreach (ch_antworten() as $k => [$q, $a]) {
        if ($k === 'hallo') {
            continue;
        }
        $faq[] = $q . "\n" . $a;
    }
    if ($faq) {
        $teile[] = "## Feste Antworten der Seite (aus Tims Sicht)\n\n" . implode("\n\n", $faq);
    }
    $teile[] = "## Weitere Fakten\n\n"
        . "- Kontakt: Anfrageformular auf der Startseite, WhatsApp, Telegram @TimKofler, E-Mail office@tim-kofler.at. Keine Telefontermine und keine Besuche vor Ort.\n"
        . "- Alle Preise sind Endpreise, Tim ist Kleinunternehmer ohne Umsatzsteuer. Domain und Webspace sind nicht im Preis enthalten.\n"
        . "- Kurzlinks: tim-kofler.at/gratis (Gratis-Entwurf), tim-kofler.at/app (Beispiel-App), tim-kofler.at/checkliste (Checkliste).\n"
        . "- Dieser Chat: Die Themen-Knöpfe zeigen feste Antworten. Eingetippte Fragen beantwortet eine KI (Claude von Anthropic) mit dem Wissen dieser Seite. Gespeichert werden keine Chat-Inhalte.";
    $links = [];
    foreach (ch_links() as $k => [$t]) {
        $links[] = $k . ' = ' . $t;
    }
    $teile[] = "## Link-Schlüssel\n\n" . implode("\n", $links);
    $bsp = [];
    foreach (ch_beispiele() as $url => [$branche, $name]) {
        $bsp[] = $url . ' = ' . $branche . ': ' . $name;
    }
    $teile[] = "## Beispielseiten nach Branche\n\n" . implode("\n", $bsp);
    return implode("\n\n", $teile);
}

// ---------------- Limits und Zählung ----------------

function ch_dir(): bool
{
    return is_dir(CH_DIR . '/ip') || @mkdir(CH_DIR . '/ip', 0700, true);
}

// Fragen pro Besucher (Stunde und Tag). Gespeichert wird nur ein Hash der IP-Adresse mit Zeitpunkten.
// Gibt '' zurück, wenn die Frage erlaubt ist, sonst 'stunde' oder 'tag'.
function ch_limit_besucher(): string
{
    if (!ch_dir()) {
        return '';
    }
    $c = ch_cfg();
    $salt = (string) (cx_config()['secret'] ?? 'tk-chat');
    $file = CH_DIR . '/ip/' . hash('sha256', 'chat' . $salt . ($_SERVER['REMOTE_ADDR'] ?? '')) . '.json';
    $now = time();
    $res = cx_locked(CH_DIR . '/.lock-ip', static function () use ($file, $now, $c) {
        $hits = is_file($file) ? (json_decode((string) file_get_contents($file), true) ?: []) : [];
        $hits = array_values(array_filter($hits, static fn($t) => is_int($t) && $t > $now - 86400));
        if (count($hits) >= $c['pro_tag']) {
            return 'tag';
        }
        if (count(array_filter($hits, static fn($t) => $t > $now - 3600)) >= $c['pro_stunde']) {
            return 'stunde';
        }
        $hits[] = $now;
        @file_put_contents($file, json_encode($hits), LOCK_EX);
        return '';
    });
    if (random_int(1, 50) === 1) {
        foreach (glob(CH_DIR . '/ip/*.json') ?: [] as $f) {
            if (@filemtime($f) < $now - 86400) {
                @unlink($f);
            }
        }
    }
    return $res;
}

function ch_monat_datei(): string
{
    return CH_DIR . '/' . date('Y-m') . '.json';
}

// Tageslimit für alle Besucher zusammen. Zählt die Frage gleich mit, damit parallele Anfragen es nicht überschreiten.
function ch_limit_tag(): bool
{
    if (!ch_dir()) {
        return true;
    }
    $max = ch_cfg()['tageslimit'];
    $file = ch_monat_datei();
    $day = date('Y-m-d');
    return (bool) cx_locked(CH_DIR . '/.lock', static function () use ($file, $day, $max) {
        $d = is_file($file) ? (json_decode((string) file_get_contents($file), true) ?: []) : [];
        $t = is_array($d[$day] ?? null) ? $d[$day] : [];
        if ((int) ($t['fragen'] ?? 0) >= $max) {
            return false;
        }
        $t['fragen'] = (int) ($t['fragen'] ?? 0) + 1;
        $d[$day] = $t;
        @file_put_contents($file, json_encode($d), LOCK_EX);
        return true;
    });
}

// Verbrauch dazuzählen (für die Kostenübersicht im Admin), ohne Inhalte.
function ch_statistik(array $usage, bool $fehler = false): void
{
    $file = ch_monat_datei();
    $day = date('Y-m-d');
    cx_locked(CH_DIR . '/.lock', static function () use ($file, $day, $usage, $fehler) {
        $d = is_file($file) ? (json_decode((string) file_get_contents($file), true) ?: []) : [];
        $t = is_array($d[$day] ?? null) ? $d[$day] : [];
        foreach (['in' => 'input_tokens', 'out' => 'output_tokens', 'cr' => 'cache_read_input_tokens', 'cw' => 'cache_creation_input_tokens'] as $k => $u) {
            $t[$k] = (int) ($t[$k] ?? 0) + (int) ($usage[$u] ?? 0);
        }
        if ($fehler) {
            $t['fehler'] = (int) ($t['fehler'] ?? 0) + 1;
        }
        $d[$day] = $t;
        @file_put_contents($file, json_encode($d), LOCK_EX);
    });
}

// Summen der letzten $days Tage für den Admin: Fragen, Tokens, geschätzte Kosten in US-Dollar.
function ch_range(int $days): array
{
    $out = ['fragen' => 0, 'heute' => 0, 'in' => 0, 'out' => 0, 'cr' => 0, 'cw' => 0, 'fehler' => 0, 'usd' => 0.0];
    $months = [];
    $today = new DateTimeImmutable('today');
    for ($i = $days - 1; $i >= 0; $i--) {
        $day = $today->modify("-{$i} days")->format('Y-m-d');
        $m = substr($day, 0, 7);
        if (!isset($months[$m])) {
            $f = CH_DIR . '/' . $m . '.json';
            $months[$m] = is_file($f) ? (array) json_decode((string) file_get_contents($f), true) : [];
        }
        $t = is_array($months[$m][$day] ?? null) ? $months[$m][$day] : [];
        foreach (['fragen', 'in', 'out', 'cr', 'cw', 'fehler'] as $k) {
            $out[$k] += (int) ($t[$k] ?? 0);
        }
        if ($i === 0) {
            $out['heute'] = (int) ($t['fragen'] ?? 0);
        }
    }
    // Preise je Million Tokens (Claude Haiku 5.5): Eingabe 0,10 $, Ausgabe 0,50 $, Cache lesen 0,01 $, Cache schreiben 0,125 $.
    $p = (array) (cx_config()['chat_preise'] ?? ['in' => 0.10, 'out' => 0.50, 'cr' => 0.01, 'cw' => 0.125]);
    foreach (['in', 'out', 'cr', 'cw'] as $k) {
        $out['usd'] += $out[$k] / 1e6 * (float) ($p[$k] ?? 0);
    }
    return $out;
}

// ---------------- Anfrage an Claude ----------------

// Verlauf aus dem Browser prüfen: abwechselnd Besucher/Assistent, gekürzt, nur Text.
function ch_messages(array $verlauf, string $frage): array
{
    $msgs = [];
    foreach (array_slice($verlauf, -8) as $v) {
        if (!is_array($v)) {
            continue;
        }
        $role = ($v['r'] ?? '') === 'a' ? 'assistant' : (($v['r'] ?? '') === 'u' ? 'user' : '');
        $text = ch_clean((string) ($v['t'] ?? ''), 1500);
        if ($role === '' || $text === '') {
            continue;
        }
        if ($msgs && end($msgs)['role'] === $role) {
            $msgs[count($msgs) - 1]['content'] .= "\n\n" . $text;
        } else {
            $msgs[] = ['role' => $role, 'content' => $text];
        }
    }
    while ($msgs && $msgs[0]['role'] !== 'user') {
        array_shift($msgs);
    }
    if ($msgs && end($msgs)['role'] === 'user') {
        array_pop($msgs);
    }
    $msgs[] = ['role' => 'user', 'content' => $frage];
    return $msgs;
}

function ch_clean(string $s, int $max): string
{
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '';
    $s = trim($s);
    return function_exists('mb_substr') ? mb_substr($s, 0, $max) : substr($s, 0, $max);
}

// Ruft Claude auf. Rückgabe: ['ok' => bool, 'text' => string, 'links' => [[Text, Adresse], …]]
function ch_ask(array $messages): array
{
    $c = ch_cfg();
    $body = [
        'model' => $c['model'],
        'max_tokens' => 1024,
        'output_config' => ['effort' => 'low'],
        'system' => [
            ['type' => 'text', 'text' => ch_system(), 'cache_control' => ['type' => 'ephemeral']],
            ['type' => 'text', 'text' => 'Heute ist der ' . date('j.n.Y') . '.'],
        ],
        'messages' => $messages,
    ];
    $json = json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $headers = ['x-api-key: ' . $c['key'], 'anthropic-version: ' . CH_VERSION, 'content-type: application/json'];
    $url = (string) (cx_config()['chat_api_url'] ?? CH_API);

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $json,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 8,
            CURLOPT_TIMEOUT => 40,
        ]);
        $res = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    } else {
        $ctx = stream_context_create(['http' => [
            'method' => 'POST', 'header' => implode("\r\n", $headers), 'content' => $json,
            'timeout' => 40, 'ignore_errors' => true,
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
        // Nur Status und Fehlertyp protokollieren, nie Fragen oder Antworten.
        cx_log('Chat → ' . $code . ' ' . (string) ($data['error']['type'] ?? '') . ' ' . substr((string) ($data['error']['message'] ?? ''), 0, 200));
        ch_statistik([], true);
        return ['ok' => false, 'text' => '', 'links' => []];
    }
    ch_statistik((array) ($data['usage'] ?? []));

    if (($data['stop_reason'] ?? '') === 'refusal') {
        return ['ok' => true, 'text' => 'Dazu kann ich leider nichts sagen. Bei Fragen zu deiner Webseite schreib Tim am besten direkt.', 'links' => ch_pick(['whatsapp', 'anfrage'])];
    }
    $text = '';
    foreach ((array) ($data['content'] ?? []) as $b) {
        if (($b['type'] ?? '') === 'text') {
            $text .= (string) ($b['text'] ?? '');
        }
    }
    return ch_parse($text, ($data['stop_reason'] ?? '') === 'max_tokens');
}

// Antworttext aufräumen und die LINKS-Zeile in geprüfte Links umwandeln.
function ch_parse(string $text, bool $cut = false): array
{
    $keys = [];
    if (preg_match('/\n?^\s*LINKS:(.*)$/mi', $text, $m, PREG_OFFSET_CAPTURE)) {
        $keys = array_filter(array_map('trim', explode(',', $m[1][0])));
        $text = substr($text, 0, $m[0][1]);
    }
    // Falls doch Markdown kommt: Sternchen, Rauten und [Text](Adresse) entfernen.
    $text = preg_replace('/\*\*|__|^#+\s*/m', '', $text) ?? $text;
    $text = preg_replace('/\[([^\]]+)\]\((?:[^)]+)\)/', '$1', $text) ?? $text;
    $text = preg_replace('/^\s*[-*]\s+/m', '• ', $text) ?? $text;
    $text = trim(preg_replace("/\n{3,}/", "\n\n", $text) ?? $text);
    if ($cut) {
        $text = rtrim($text, " ,;:") . ' …';
    }
    if ($text === '') {
        return ['ok' => false, 'text' => '', 'links' => []];
    }
    return ['ok' => true, 'text' => $text, 'links' => ch_pick($keys)];
}

// Nur bekannte Link-Schlüssel und vorhandene Beispielseiten, höchstens drei.
function ch_pick(array $keys): array
{
    $links = ch_links();
    $bsp = ch_beispiele();
    $out = [];
    foreach ($keys as $k) {
        $k = trim((string) $k, " \t\"'`.");
        if (isset($links[$k])) {
            $out[$links[$k][1]] = $links[$k];
        } elseif (isset($bsp[$k])) {
            $out[$k] = ['Beispiel ' . $bsp[$k][0] . ' ansehen', $k];
        }
        if (count($out) >= 3) {
            break;
        }
    }
    return array_values($out);
}
