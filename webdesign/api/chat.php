<?php
// Tim Kofler – Endpunkt für eingetippte Fragen im Antwort-Assistenten (tk-ui.js).
// GET  → {"ki": true|false}  (ist die KI eingerichtet?)
// POST → JSON {"frage": "…", "verlauf": [{"r": "u"|"a", "t": "…"}, …]}
//      ← {"ok": true, "text": "…", "links": [[Text, Adresse], …]} oder {"ok": false, "grund": "…"}
// Bei "ok": false antwortet der Browser mit den festen Antworten. Gemerkt wird nur die Frage (ohne IP und Antwort, 30 Tage).

declare(strict_types=1);

require __DIR__ . '/chat-lib.php';

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'GET') {
    ch_json(['ki' => ch_ready()]);
}
if ($method !== 'POST') {
    header('Allow: GET, POST');
    ch_json(['ok' => false, 'grund' => 'methode'], 405);
}

// Nur Aufrufe von der eigenen Seite. Browser setzen diese Kopfzeilen selbst; fremde Seiten scheitern
// zusätzlich an der Vorabprüfung (CORS), weil hier JSON verlangt wird.
$site = (string) ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '');
$origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
$origins = (array) (cx_config()['origins'] ?? ['https://tim-kofler.at', 'https://www.tim-kofler.at']);
if (($site !== '' && $site !== 'same-origin') || ($origin !== '' && !in_array($origin, $origins, true))
    || stripos((string) ($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json') !== 0) {
    ch_json(['ok' => false, 'grund' => 'herkunft'], 403);
}
if (!ch_ready()) {
    ch_json(['ok' => false, 'grund' => 'aus']);
}

$raw = (string) file_get_contents('php://input', false, null, 0, 20000);
$in = json_decode($raw, true);
$frage = is_array($in) ? ch_clean((string) ($in['frage'] ?? ''), 500) : '';
if ($frage === '') {
    ch_json(['ok' => false, 'grund' => 'leer'], 400);
}

$besucher = ch_limit_besucher();
if ($besucher !== '') {
    ch_json(['ok' => false, 'grund' => 'limit', 'text' => $besucher === 'stunde'
        ? 'Du hast in der letzten Stunde schon viele Fragen gestellt. Die Themen oben gehen weiterhin, und Tim beantwortet dir gerne alles persönlich.'
        : 'Für heute ist das Fragen-Kontingent erreicht. Die Themen oben gehen weiterhin, und Tim beantwortet dir gerne alles persönlich.']);
}
if (!ch_limit_tag()) {
    ch_json(['ok' => false, 'grund' => 'tageslimit']);
}

$verlauf = is_array($in['verlauf'] ?? null) ? $in['verlauf'] : [];
$r = ch_ask(ch_messages($verlauf, $frage));
ch_frage_merken($frage, $r['ok']);
if (!$r['ok']) {
    ch_json(['ok' => false, 'grund' => 'fehler']);
}
ch_json(['ok' => true, 'text' => $r['text'], 'links' => $r['links']]);
