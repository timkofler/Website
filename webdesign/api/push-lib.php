<?php
// Tim Kofler – kurze Nachricht aufs Handy (Telegram-Bot), sobald etwas Wichtiges passiert:
// neue bestätigte Anfrage, Rückruf-Wunsch, Entwurf geöffnet, Kundennachricht.
// Datensparsam: In der Nachricht stehen nie Name, E-Mail oder Telefonnummer, nur Art, Ort/Branche und der Link ins Admin.
// Einrichtung: Bot bei @BotFather anlegen, Schlüssel als 'telegram_token' in api/_data/config.php eintragen,
// dem Bot einmal schreiben und im Admin (Werbung → Benachrichtigungen) „Chat verbinden“ drücken.

declare(strict_types=1);

require_once __DIR__ . '/lib.php';

const PU_FILE = CX_DATA . '/push.json';

function pu_token(): string
{
    $t = trim((string) (cx_config()['telegram_token'] ?? ''));
    return preg_match('/^\d{5,15}:[A-Za-z0-9_-]{30,60}$/', $t) ? $t : '';
}

function pu_state(): array
{
    $d = is_file(PU_FILE) ? json_decode((string) file_get_contents(PU_FILE), true) : [];
    return is_array($d) ? $d : [];
}

function pu_save(array $d): bool
{
    return @file_put_contents(PU_FILE, json_encode($d, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX) !== false;
}

function pu_ready(): bool
{
    return pu_token() !== '' && (string) (pu_state()['chat'] ?? '') !== '' && empty(pu_state()['aus']);
}

// Aufruf der Telegram-Bot-API. Kurze Wartezeit, damit ein langsamer Dienst kein Formular aufhält.
function pu_api(string $method, array $body): array
{
    $token = pu_token();
    if ($token === '') {
        return [];
    }
    $url = 'https://api.telegram.org/bot' . $token . '/' . $method;
    $json = json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true, CURLOPT_POSTFIELDS => $json, CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_TIMEOUT => 6, CURLOPT_CONNECTTIMEOUT => 3,
        ]);
        $res = curl_exec($ch);
    } else {
        $ctx = stream_context_create(['http' => ['method' => 'POST', 'header' => 'Content-Type: application/json', 'content' => $json, 'timeout' => 6, 'ignore_errors' => true]]);
        $res = @file_get_contents($url, false, $ctx);
    }
    $d = is_string($res) ? json_decode($res, true) : null;
    if (!is_array($d) || empty($d['ok'])) {
        cx_log('Telegram ' . $method . ' fehlgeschlagen: ' . substr(is_string($res) ? $res : 'keine Antwort', 0, 200));
        return [];
    }
    return $d;
}

// Nachricht an Tims Handy. $link ist ein Pfad im Admin (z. B. /kunden/admin/?anfrage=…) und wird als Knopf angehängt.
function pu_send(string $text, string $link = '', bool $test = false): bool
{
    if (!$test && !pu_ready()) {
        return false;
    }
    $chat = (string) (pu_state()['chat'] ?? '');
    if ($chat === '') {
        return false;
    }
    $body = ['chat_id' => $chat, 'text' => mb_substr($text, 0, 900), 'disable_web_page_preview' => true];
    if ($link !== '') {
        $body['reply_markup'] = ['inline_keyboard' => [[['text' => 'Im Admin öffnen', 'url' => rtrim(cx_brand()['site'], '/') . $link]]]];
    }
    return pu_api('sendMessage', $body) !== [];
}

// Wer dem Bot zuletzt geschrieben hat (zum Verbinden im Admin). Nur private Chats.
function pu_find_chats(): array
{
    $d = pu_api('getUpdates', ['limit' => 20, 'allowed_updates' => ['message']]);
    $out = [];
    foreach ((array) ($d['result'] ?? []) as $u) {
        $chat = (array) ($u['message']['chat'] ?? []);
        if (($chat['type'] ?? '') === 'private' && isset($chat['id'])) {
            $out[(string) $chat['id']] = trim((string) ($chat['first_name'] ?? '') . ' ' . (string) ($chat['last_name'] ?? '')) ?: (string) ($chat['username'] ?? 'Chat');
        }
    }
    return $out;
}
