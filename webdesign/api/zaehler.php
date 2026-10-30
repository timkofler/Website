<?php
// Tim Kofler – nimmt den anonymen Zähl-Aufruf der Seiten entgegen (navigator.sendBeacon aus main.js bzw. demo.js).
// Gespeichert werden nur Tagessummen: Seite, Quelle (utm_source, Google-Anzeige oder verweisende Seite) und Kampagne.
// Keine Cookies für Besucher, keine IP-Adresse, keine Kennung, keine Uhrzeit pro Aufruf.

declare(strict_types=1);

require __DIR__ . '/zaehler-lib.php';

header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');

$done = static function (): void {
    http_response_code(204);
    exit;
};

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    $done();
}
// Nur Aufrufe von der eigenen Seite (Browser setzen diese Kopfzeilen selbst).
$site = (string) ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '');
$origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
if (($site !== '' && $site !== 'same-origin') || ($origin !== '' && !preg_match('#^https://(www\.)?tim-kofler\.at$#', $origin))) {
    $done();
}
// Suchmaschinen, Vorschau-Dienste und automatische Tests nicht mitzählen (Lighthouse am Handy meldet sich als „moto g power (2022)“). Tims eigenes Gerät auch nicht.
$ua = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
if ($ua === '' || preg_match('/bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|curl|wget|python|java\/|httpclient|facebookexternalhit|moto g power \(2022\)/i', $ua)
    || isset($_COOKIE[ZL_NOCOUNT])) {
    $done();
}

// Klick auf einen Kontakt-Link (WhatsApp, Telegram, Telefon, E-Mail): nur die Art zählen.
if (isset($_POST['k'])) {
    zl_kontakt((string) $_POST['k']);
    $done();
}

$page = zl_page((string) ($_POST['p'] ?? ''));
if ($page === '') {
    $done();
}
$entry = ($_POST['e'] ?? '') === '1';
$source = $entry ? zl_source(($_POST['g'] ?? '') === '1', (string) ($_POST['u'] ?? ''), (string) ($_POST['r'] ?? '')) : '';
$campaign = $source !== '' ? zl_clean((string) ($_POST['c'] ?? ''), 40) : '';
zl_count($page, $entry, $source, $campaign);
// Antwort sofort schicken, danach (ohne dass der Besucher wartet) einmal pro Woche den Wochenbericht an Tim
// und, wenn fällig, die Telegram-Nachrichten am Morgen und am Abend.
http_response_code(204);
if (function_exists('fastcgi_finish_request')) {
    fastcgi_finish_request();
    require __DIR__ . '/bericht-lib.php';
    wb_maybe();
    require __DIR__ . '/zeitplan-lib.php';
    tp_maybe();
}
exit;
