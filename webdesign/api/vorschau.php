<?php
// Tim Kofler – nimmt das Formular „Vorschau in 60 Sekunden“ entgegen, erzeugt die Vorschau und leitet zur fertigen Seite weiter.
// Schutz: nur POST von tim-kofler.at, Honeypot, Mindestzeit, 3 Vorschauen je Anschluss und Tag, Tageslimit insgesamt.

declare(strict_types=1);

require __DIR__ . '/vorschau-lib.php';

header('X-Robots-Tag: noindex');
set_time_limit(120);

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    cx_page('Nicht erlaubt', 'Diese Adresse nimmt nur das Vorschau-Formular entgegen.', 405);
}
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$origins = (array) (cx_config()['origins'] ?? ['https://tim-kofler.at', 'https://www.tim-kofler.at']);
if ($origin !== '' && !in_array($origin, $origins, true)) {
    cx_respond(false, 'Ungültige Anfrage.');
}
// Feld "website" ist für Menschen unsichtbar, Bots füllen es gerne aus.
if (cx_field('website') !== '') {
    cx_respond(true, 'Danke!', '/vorschau/');
}
$ts = (int) cx_field('ts', 20);
if ($ts > 0 && (int) (microtime(true) * 1000) - $ts < 2500) {
    cx_respond(false, 'Das ging etwas zu schnell. Bitte versuche es in ein paar Sekunden noch einmal.');
}
if (!vs_ready()) {
    cx_respond(false, 'Die Vorschau wird gerade eingerichtet. Schreib mir an office@tim-kofler.at, dann baue ich dir eine.');
}
if (!vs_ip_ok()) {
    cx_respond(false, 'Du hast heute schon ' . VS_IP_LIMIT . ' Vorschauen erzeugt. Morgen geht es weiter, oder schreib mir direkt.');
}

$firma = cx_field('firma', 80);
$branche = cx_field('branche', 80);
if ($branche === 'Sonstiges' || $branche === '') {
    $branche = cx_field('branche_frei', 80) ?: $branche;
}
$ort = cx_field('ort', 80);

// Erst prüfen, dann zählen (vor dem teuren KI-Aufruf), damit parallele Anfragen die Grenze je Anschluss nicht umgehen.
$fehler = vs_pruefen($firma, $branche, $ort);
if ($fehler !== '') {
    cx_respond(false, $fehler);
}
vs_ip_zaehlen();
$r = vs_erstellen($firma, $branche, $ort, false);
if (isset($r['fehler'])) {
    cx_respond(false, (string) $r['fehler']);
}
cx_respond(true, 'Deine Vorschau ist fertig.', '/vorschau/' . $r['id'] . '/');
