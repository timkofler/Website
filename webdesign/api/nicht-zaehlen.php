<?php
// Tim Kofler – „Dieses Gerät nicht mitzählen“ ohne Anmeldung, z. B. per QR-Code für den Kamera-Browser am Handy.
// Setzt dasselbe Cookie wie der Schalter im Admin (nur für den Zähler-Endpunkt und den Admin, ein Jahr gültig).
// ?wieder=1 zählt das Gerät wieder mit. Betrifft nur den Browser, der die Seite öffnet.

declare(strict_types=1);

require __DIR__ . '/zaehler-lib.php';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
header('Content-Type: text/html; charset=utf-8');

$wieder = isset($_GET['wieder']);
foreach (['/api/zaehler.php', '/kunden/admin/'] as $path) {
    setcookie(ZL_NOCOUNT, '1', ['expires' => $wieder ? 1 : time() + 365 * 86400, 'path' => $path, 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
}
$titel = $wieder ? 'Dieses Gerät wird wieder mitgezählt' : 'Dieses Gerät wird nicht mehr mitgezählt';
$text = $wieder
    ? 'Aufrufe aus diesem Browser zählen ab jetzt wieder im Besucherzähler.'
    : 'Aufrufe aus diesem Browser zählen ein Jahr lang nicht im Besucherzähler. Das gilt nur für diesen Browser auf diesem Gerät.';
$link = $wieder ? ['/api/nicht-zaehlen.php', 'Doch nicht mitzählen'] : ['/api/nicht-zaehlen.php?wieder=1', 'Wieder mitzählen'];
?><!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title><?= htmlspecialchars($titel) ?> – tim-kofler.at</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0b0c;color:#f4f4f0;font:17px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;padding:24px;box-sizing:border-box}
main{max-width:420px;text-align:center}h1{font-size:1.4rem;margin:0 0 10px}p{color:#a1a1a1;margin:0 0 22px}b{color:#ff5a1f}
a{display:inline-block;color:#f4f4f0;border:1px solid #333;border-radius:999px;padding:10px 18px;text-decoration:none;margin:4px}a.o{background:#ff5a1f;border-color:#ff5a1f;color:#0b0b0c;font-weight:700}</style></head>
<body><main><h1><?= $wieder ? '' : '<b>✓</b> ' ?><?= htmlspecialchars($titel) ?></h1><p><?= htmlspecialchars($text) ?></p>
<a class="o" href="/">Zur Startseite</a><a href="<?= htmlspecialchars($link[0]) ?>"><?= htmlspecialchars($link[1]) ?></a></main></body></html>
