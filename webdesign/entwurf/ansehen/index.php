<?php
// Tim Kofler – privater Link zum Gratis-Entwurf (/entwurf/ansehen/?t=…). Zeigt die Bilder, die Tim im Admin
// hochgeladen hat, zählt das Öffnen (ohne Cookies, nur Anzahl und Zeit) und nimmt die Antwort „Passt“ oder
// „Änderungen“ entgegen. Tims eigene Vorschau aus dem Admin (&vorschau=1) zählt nicht.

declare(strict_types=1);

require __DIR__ . '/../../api/ansicht-lib.php';
require __DIR__ . '/../../api/push-lib.php';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: private, no-store');
header('Referrer-Policy: no-referrer');

$t = (string) ($_GET['t'] ?? $_POST['t'] ?? '');
$d = an_read($t);
$admin = static function (array $d): string {
    [$art, $id] = array_pad(explode(':', (string) ($d['ref'] ?? ''), 2), 2, '');
    return '/kunden/admin/' . ($art === 'entwurf' ? '?entwurf=' : '?anfrage=') . rawurlencode($id);
};

// Einzelnes Bild ausliefern
if ($d && isset($_GET['b'])) {
    $b = (array) ($d['bilder'][(int) $_GET['b']] ?? []);
    $file = $b ? an_dir($t) . '/' . $b['datei'] : '';
    $ext = strtolower(pathinfo((string) ($b['datei'] ?? ''), PATHINFO_EXTENSION));
    if ($file === '' || !is_file($file) || !isset(AN_TYPES[$ext])) {
        http_response_code(404);
        exit;
    }
    header('Content-Type: ' . AN_TYPES[$ext]);
    header('X-Content-Type-Options: nosniff');
    header('Content-Length: ' . filesize($file));
    readfile($file);
    exit;
}

$bot = (bool) preg_match('/bot|crawl|spider|preview|facebookexternalhit|^whatsapp|slack|discord|curl|wget|python/i', (string) ($_SERVER['HTTP_USER_AGENT'] ?? ''));

// Antwort des Interessenten: „Passt, weiter“ oder „Ich habe Änderungswünsche“
$danke = '';
if ($d && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $a = (string) ($_POST['antwort'] ?? '');
    if (in_array($a, ['ja', 'aendern'], true) && cx_rate_hit('ansicht:' . $t, 6, 3600)) {
        $vorher = (string) ($d['antwort'] ?? '');
        $d['antwort'] = $a;
        $d['antwort_zeit'] = date('c');
        an_write($t, $d);
        if ($vorher !== $a) {
            pu_send($a === 'ja' ? '🎉 Entwurf: Der Interessent will weitermachen!' : '✏️ Entwurf: Der Interessent hat Änderungswünsche und meldet sich.', $admin($d));
        }
    }
    header('Location: /entwurf/ansehen/?t=' . $t . '&danke=' . ($a === 'ja' ? 'ja' : 'aendern'), true, 303);
    exit;
}

if (!$d) {
    http_response_code(404);
}

// Öffnen zählen (nicht Tims Vorschau, keine Link-Vorschau von Messengern)
if ($d && !isset($_GET['vorschau']) && !isset($_GET['danke']) && !$bot && ($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    $erst = (int) ($d['aufrufe'] ?? 0) === 0;
    $d['aufrufe'] = (int) ($d['aufrufe'] ?? 0) + 1;
    $d['zuletzt'] = date('c');
    if ($erst) {
        $d['erstmals'] = $d['zuletzt'];
    }
    an_write($t, $d);
    if ($erst) {
        pu_send('👀 Dein Entwurf-Link wurde gerade zum ersten Mal geöffnet.', $admin($d));
    }
}

$h = static fn(string $s): string => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
$titel = $d ? $h((string) $d['titel']) : '';
$qs = 't=' . $h($t);
if (!$d) {
    $main = '<span class="label"><b>●</b> Entwurf</span><h1>Link nicht mehr gültig</h1>'
        . '<p class="lead">Diesen Entwurf gibt es nicht mehr oder der Link ist unvollständig. Schreib mir einfach kurz, dann schicke ich ihn dir noch einmal.</p>'
        . '<div class="btn-row"><a class="btn" href="https://wa.me/4367761773118" target="_blank" rel="noopener">WhatsApp</a><a class="btn btn--line" href="mailto:office@tim-kofler.at">E-Mail</a></div>';
} else {
    $bilder = '';
    foreach ((array) $d['bilder'] as $i => $b) {
        $bilder .= '<figure class="an-bild"><img src="?' . $qs . '&amp;b=' . (int) $i . '" alt="Entwurf ' . $titel . ', Ansicht ' . ((int) $i + 1) . '" loading="' . ($i < 2 ? 'eager' : 'lazy') . '"></figure>';
    }
    if ($bilder === '') {
        $bilder = '<p class="an-leer">Die Bilder kommen gleich, ich lade sie gerade hoch.</p>';
    }
    $text = trim((string) ($d['text'] ?? '')) !== '' ? '<p class="lead an-text">' . nl2br($h((string) $d['text'])) . '</p>' : '<p class="lead an-text">Hier ist dein persönlicher, kostenloser Entwurf. So könnte deine neue Webseite am PC und am Handy aussehen.</p>';
    $g = (string) ($_GET['danke'] ?? '');
    if ($g === 'ja') {
        $danke = '<div class="an-danke" role="status"><b>Super, danke!</b> Ich melde mich in Kürze bei dir mit dem fixen Preis und den nächsten Schritten.</div>';
    } elseif ($g === 'aendern') {
        $danke = '<div class="an-danke" role="status"><b>Danke!</b> Schreib mir einfach, was anders sein soll, per WhatsApp oder E-Mail. Ich passe den Entwurf gerne an.</div>';
    }
    $wa = 'https://wa.me/4367761773118?text=' . rawurlencode('Hallo Tim, zum Entwurf für ' . (string) $d['titel'] . ': ');
    $mail = 'mailto:office@tim-kofler.at?subject=' . rawurlencode('Entwurf für ' . (string) $d['titel']);
    $main = <<<HTML
<span class="label"><b>●</b> Dein Entwurf</span>
<h1>Entwurf für {$titel}</h1>
{$text}
{$danke}
<div class="an-bilder">{$bilder}</div>
<div class="an-frage">
  <h2>Wie gefällt er dir?</h2>
  <p>Ein Klick genügt, ganz unverbindlich. Erst wenn du willst, geht es weiter.</p>
  <div class="an-knoepfe">
    <form method="post" action="/entwurf/ansehen/"><input type="hidden" name="t" value="{$h($t)}"><input type="hidden" name="antwort" value="ja"><button class="btn" type="submit">Passt, so machen wir es</button></form>
    <form method="post" action="/entwurf/ansehen/"><input type="hidden" name="t" value="{$h($t)}"><input type="hidden" name="antwort" value="aendern"><button class="btn btn--line" type="submit">Ich hätte gerne Änderungen</button></form>
  </div>
  <p class="an-kontakt">Lieber direkt schreiben? <a href="{$h($wa)}" target="_blank" rel="noopener">WhatsApp</a> · <a href="https://t.me/TimKofler" target="_blank" rel="noopener">Telegram</a> · <a href="{$h($mail)}">E-Mail</a></p>
</div>
HTML;
}
header('Content-Type: text/html; charset=utf-8');
echo <<<HTML
<!DOCTYPE html>
<html lang="de-AT" class="tk-black">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dein Entwurf | Tim Kofler – Webdesign</title>
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="#0b0b0b">
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/assets/img/tk-badge-2.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preload" href="/assets/fonts/unbounded.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/manrope.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/style.css?v=5d1d811a">
  <link rel="stylesheet" href="/assets/css/tk.css?v=bf026093">
  <link rel="stylesheet" href="/assets/css/black.css?v=67a7eb36">
  <link rel="stylesheet" href="/assets/css/white.css?v=f8bad3aa">
  <script src="/assets/js/tk-black.js?v=6174a94a"></script>
  <link rel="stylesheet" href="/assets/css/ansicht.css?v=1">
</head>
<body class="an-page">
<header class="header">
  <div class="container header__inner">
    <a href="/" class="tk-logo" aria-label="Tim Kofler Webdesign – Startseite"><img src="/assets/img/tk-logo-2.svg" alt="Tim Kofler Webdesign" width="71" height="36"></a>
    <div class="ew-head"><a href="/beispiele/" class="btn btn--sm btn--line">Beispiele ansehen</a></div>
  </div>
</header>
<main>
<section class="section an-sec">
  <div class="container an-wrap">
{$main}
  </div>
</section>
</main>
<footer class="footer">
  <div class="container">
    <div class="footer__bottom">
      <span>© 2026 Tim Kofler · Webdesign aus Niederösterreich · Keine Cookies. Ich sehe nur, ob und wann dieser Link geöffnet wurde.</span>
      <span><a href="/">Startseite</a> · <a href="/impressum/">Impressum</a> · <a href="/datenschutz/">Datenschutz</a></span>
    </div>
  </div>
</footer>
</body>
</html>
HTML;
