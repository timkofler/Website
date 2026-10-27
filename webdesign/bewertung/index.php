<?php
// Tim Kofler – Bewertung abgeben (/bewertung/?t=…). Nur mit dem persönlichen Link aus dem Kundenportal oder von Tim.
// Gespeichert wird erst beim Absenden; auf tim-kofler.at erscheint sie nur mit Häkchen und nach Tims Freigabe.

declare(strict_types=1);

require __DIR__ . '/../api/bewertung-lib.php';
require __DIR__ . '/../api/push-lib.php';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: private, no-store');
header('Referrer-Policy: no-referrer');

$t = (string) ($_GET['t'] ?? $_POST['t'] ?? '');
$u = bw_user_for($t);
$acc = $u !== '' ? (array) (kp_accounts()[$u] ?? []) : [];
$h = static fn(string $s): string => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
$fehler = '';

if ($u !== '' && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $sterne = (int) ($_POST['sterne'] ?? 0);
    $text = trim(str_replace(['<', '>'], '', cx_field('text', BW_TEXT_MAX)));
    $name = trim(str_replace(['<', '>', '"'], '', cx_field('name', 80)));
    $oeff = cx_field('oeffentlich', 5) === 'ja';
    if ($sterne < 1 || $sterne > 5) {
        $fehler = 'Bitte wähle 1 bis 5 Sterne.';
    } elseif (mb_strlen($text) < 10) {
        $fehler = 'Bitte schreib ein, zwei Sätze dazu.';
    } elseif (cx_has_link($text) || cx_has_link($name)) {
        $fehler = 'Bitte ohne Links, E-Mail-Adressen oder Telefonnummern.';
    } elseif ($oeff && $name === '') {
        $fehler = 'Bitte gib an, mit welchem Namen die Bewertung erscheinen darf.';
    } elseif (!cx_rate_hit('bewertung:' . $u, 5, 86400)) {
        $fehler = 'Danke, deine Bewertung ist schon angekommen.';
    } else {
        $alt = bw_read($u);
        bw_write($u, [
            'sterne' => $sterne, 'text' => $text, 'name' => $name, 'oeffentlich' => $oeff,
            'zeit' => date('c'), 'status' => 'neu', 'firma' => (string) ($acc['firma'] ?? ''),
        ]);
        if (!$alt || ($alt['text'] ?? '') !== $text) {
            pu_send('⭐ Neue Bewertung: ' . str_repeat('★', $sterne) . ($oeff ? ' (darf auf die Seite)' : ' (nur für dich)'), '/kunden/admin/#werbung');
        }
        header('Location: /bewertung/?t=' . $t . '&danke=1', true, 303);
        exit;
    }
}

$review = '<div class="bw-google"><p><b>Hast du noch eine Minute?</b> Eine Google-Bewertung hilft mir am meisten, weil sie andere Betriebe bei der Suche sehen.</p>'
    . '<a class="tk-review" href="' . KP_REVIEW_URL . '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"/></svg>Auf Google bewerten</a></div>';

if ($u === '') {
    http_response_code(404);
    $main = '<span class="label"><b>●</b> Bewertung</span><h1>Link nicht gültig</h1><p class="lead">Dieser Bewertungslink ist unvollständig oder nicht mehr aktiv. Schreib mir einfach kurz, dann schicke ich dir einen neuen.</p>';
} elseif (isset($_GET['danke'])) {
    $main = '<span class="label"><b>✓</b> Danke</span><h1>Danke für deine Bewertung!</h1><p class="lead">Das freut mich sehr. Deine Worte helfen anderen Betrieben bei der Entscheidung.</p>' . $review;
} else {
    $d = bw_read($u);
    $hallo = ($acc['name'] ?? '') !== '' ? 'Hallo ' . $h((string) $acc['name']) . ', w' : 'W';
    $s = (int) ($_POST['sterne'] ?? $d['sterne'] ?? 0);
    $stars = '';
    $star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"/></svg>';
    for ($i = 5; $i >= 1; $i--) {
        $stars .= '<input type="radio" id="s' . $i . '" name="sterne" value="' . $i . '"' . ($s === $i ? ' checked' : '') . ($i === 5 ? ' required' : '') . '><label for="s' . $i . '" title="' . $i . ($i === 1 ? ' Stern' : ' Sterne') . '">' . $star . '<span class="sr-only">' . $i . ($i === 1 ? ' Stern' : ' Sterne') . '</span></label>';
    }
    $text = $h((string) ($_POST['text'] ?? $d['text'] ?? ''));
    $vorschlag = trim(((string) ($acc['name'] ?? '')) . (($acc['firma'] ?? '') !== '' ? ', ' . $acc['firma'] : ''));
    $name = $h((string) ($_POST['name'] ?? $d['name'] ?? $vorschlag));
    $checked = !empty($_POST) ? (cx_field('oeffentlich', 5) === 'ja') : (!$d || !empty($d['oeffentlich']));
    $err = $fehler !== '' ? '<p class="form__status is-error">' . $h($fehler) . '</p>' : '';
    $max = BW_TEXT_MAX;
    $main = <<<HTML
<span class="label"><b>●</b> Bewertung</span>
<h1>Wie war's mit mir?</h1>
<p class="lead an-text">{$hallo}ie zufrieden bist du mit deiner Webseite und der Zusammenarbeit? Ein paar ehrliche Sätze reichen.</p>
<form class="form bw-form" method="post" action="/bewertung/">
  <input type="hidden" name="t" value="{$h($t)}">
  {$err}
  <div class="bw-feld"><span>Sterne</span><div class="bw-sterne">{$stars}</div></div>
  <label class="form__field"><span>Deine Bewertung</span><textarea name="text" rows="5" required minlength="10" maxlength="{$max}" placeholder="z. B. Schnell, unkompliziert und genau so, wie ich es mir vorgestellt habe.">{$text}</textarea></label>
  <label class="form__field"><span>So soll dein Name dabei stehen</span><input type="text" name="name" maxlength="80" value="{$name}" placeholder="Maria M., Bäckerei Muster"></label>
  <label class="form__check"><input type="checkbox" name="oeffentlich" value="ja"{$h($checked ? ' checked' : '')}><span>Tim darf meine Bewertung mit diesem Namen auf tim-kofler.at zeigen. Ich kann das jederzeit per E-Mail an office@tim-kofler.at widerrufen.</span></label>
  <button class="btn" type="submit">Bewertung abschicken</button>
</form>
{$review}
HTML;
}
header('Content-Type: text/html; charset=utf-8');
echo <<<HTML
<!DOCTYPE html>
<html lang="de-AT" class="tk-black">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Bewertung | Tim Kofler – Webdesign</title>
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
  <link rel="stylesheet" href="/assets/css/white.css?v=30d204b9">
  <script src="/assets/js/tk-black.js?v=6174a94a"></script>
  <link rel="stylesheet" href="/assets/css/ansicht.css?v=1">
</head>
<body class="an-page">
<header class="header">
  <div class="container header__inner">
    <a href="/" class="tk-logo" aria-label="Tim Kofler Webdesign – Startseite"><img src="/assets/img/tk-logo-2.svg" alt="Tim Kofler Webdesign" width="71" height="36"></a>
  </div>
</header>
<main>
<section class="section an-sec">
  <div class="container an-wrap" style="max-width:720px">
{$main}
  </div>
</section>
</main>
<footer class="footer">
  <div class="container">
    <div class="footer__bottom">
      <span>© 2026 Tim Kofler · Webdesign aus Niederösterreich · Keine Cookies</span>
      <span><a href="/">Startseite</a> · <a href="/impressum/">Impressum</a> · <a href="/datenschutz/">Datenschutz</a></span>
    </div>
  </div>
</footer>
</body>
</html>
HTML;
