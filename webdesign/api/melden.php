<?php
// Tim Kofler – kurze Meldungen von Claude (Projekt "Webseiten") an Tims Telegram, über denselben Bot wie push-lib.php.
// Fertig-Meldungen, Termine, "wartet auf dich". Nur Text, nur an den im Admin verbundenen Chat.
//
// Aufruf: POST /api/melden.php  mit  key=<Schlüssel>  text=<Nachricht>  [link=https://claude.ai/… oder https://tim-kofler.at/…]
// In der config.php steht nur der SHA-256-Hash des Schlüssels ('claude_melde_hash'), nie der Schlüssel selbst.
// Termin oder Frist eintragen (kommt dann in die Morgen-Nachricht, siehe zeitplan-lib.php):
//   POST key=<Schlüssel> aktion=termin datum=JJJJ-MM-TT text=<kurz> [zeit=HH:MM] [art=termin|frist] [wdh=monat|jahr]
// Grenzen: 30 Aufrufe je Stunde und Anschluss, 20 Meldungen je Stunde, 80 je Tag.

declare(strict_types=1);

require __DIR__ . '/push-lib.php';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
header('Content-Type: application/json; charset=utf-8');

function me_out(int $code, string $msg): void
{
    http_response_code($code);
    echo json_encode(['ok' => $code === 200, 'meldung' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    me_out(405, 'Nur POST.');
}
$hash = strtolower(trim((string) (cx_config()['claude_melde_hash'] ?? '')));
if (!preg_match('/^[0-9a-f]{64}$/', $hash)) {
    me_out(503, 'Nicht eingerichtet.');
}
if (!cx_rate_hit('melden-ip:' . cx_client_id(), 30, 3600)) {
    me_out(429, 'Zu viele Versuche.');
}
$key = (string) ($_POST['key'] ?? '');
if (strlen($key) < 32 || !hash_equals($hash, hash('sha256', $key))) {
    me_out(403, 'Falscher Schlüssel.');
}
if (($_POST['aktion'] ?? '') === 'termin') {
    require __DIR__ . '/zeitplan-lib.php';
    $fehler = tp_termin_neu((string) ($_POST['art'] ?? 'termin'), trim((string) ($_POST['datum'] ?? '')), (string) ($_POST['zeit'] ?? ''), (string) ($_POST['text'] ?? ''), trim((string) ($_POST['wdh'] ?? '')));
    me_out($fehler === '' ? 200 : 400, $fehler === '' ? 'Eingetragen.' : $fehler);
}
$text = trim(str_replace("\r", '', (string) ($_POST['text'] ?? '')));
if ($text === '' || mb_strlen($text) > 900) {
    me_out(400, 'Text fehlt oder ist länger als 900 Zeichen.');
}
$link = trim((string) ($_POST['link'] ?? ''));
if ($link !== '' && !preg_match('~^https://(claude\.ai|(www\.)?tim-kofler\.at)/[^\s<>"]{0,400}$~', $link)) {
    me_out(400, 'Link nur zu claude.ai oder tim-kofler.at.');
}
if (!cx_rate_hit('melden', 20, 3600) || !cx_rate_hit('melden-tag', 80, 86400)) {
    me_out(429, 'Zu viele Meldungen, später noch einmal.');
}
if (!pu_ready()) {
    me_out(503, 'Telegram ist im Admin nicht verbunden oder ausgeschaltet.');
}

// Erste Zeile fett als Überschrift, der Rest normal (Text wird maskiert, HTML von außen geht nicht durch).
$teile = explode("\n", $text, 2);
$body = ['chat_id' => (string) pu_state()['chat'], 'text' => '🤖 <b>' . cx_h($teile[0]) . '</b>' . (isset($teile[1]) ? "\n" . cx_h($teile[1]) : ''),
    'parse_mode' => 'HTML', 'disable_web_page_preview' => true];
if ($link !== '') {
    $body['reply_markup'] = ['inline_keyboard' => [[['text' => 'Öffnen', 'url' => $link]]]];
}
if (pu_api('sendMessage', $body) === []) {
    me_out(502, 'Telegram hat die Nachricht nicht angenommen.');
}
me_out(200, 'Gesendet.');
