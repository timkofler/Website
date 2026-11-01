<?php
// Einfacher Passwortschutz für den Entwurf der Melker Au-Teufel'n.
// Kein geheimer Inhalt, nur damit den Entwurf nur sieht, wer das Passwort bekommen hat.
declare(strict_types=1);

const AUTEUFELN_HASH = '$2y$10$8i4JZT5OxgLNfr8CzaH64O82L89kflZ.eKFukQ1AzhRVw7VlqGS1m';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

session_name('auteufeln_demo');
session_set_cookie_params(['lifetime' => 0, 'path' => '/demo/melker-auteufeln/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
session_start();

$atFehler = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['at_pw'])) {
    require_once __DIR__ . '/../_ansicht.php';
    if (!demo_versuch_ok('auteufeln', 'Melker-Au-Teufeln-Entwurf')) {
        $atFehler = 'Zu viele Versuche. Bitte in 15 Minuten noch einmal probieren.';
    } elseif (password_verify((string) $_POST['at_pw'], demo_hash('auteufeln', AUTEUFELN_HASH))) {
        session_regenerate_id(true);
        $_SESSION['auteufeln_ok'] = true;
        header('Location: /demo/melker-auteufeln/', true, 303);
        exit;
    } else {
        usleep(800000); // bremst Rateversuche
        $atFehler = 'Das Passwort stimmt leider nicht.';
    }
}

if (empty($_SESSION['auteufeln_ok'])) {
    $basis = '/demo/melker-auteufeln/';
    ?><!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0c0806">
<title>Melker Au-Teufel'n · Entwurf</title>
<meta name="description" content="Entwurf der neuen Webseite für die Melker Au-Teufel'n, Krampusverein Melk seit 2008.">
<meta property="og:type" content="website">
<meta property="og:title" content="Melker Au-Teufel'n · Entwurf eurer Webseite">
<meta property="og:description" content="9. Melker Au-Nacht am 12.12.2026, alle Lauftermine und der Verein. Gebaut von Tim Kofler.">
<meta property="og:url" content="https://tim-kofler.at/demo/melker-auteufeln/">
<meta property="og:image" content="https://tim-kofler.at/demo/melker-auteufeln/assets/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="<?= $basis ?>assets/gate.css?v=2">
</head>
<body>
<main class="gate">
  <div class="gate__mark" aria-hidden="true"><small>Krampusverein Melk</small><span>Melker <i>Au-Teufel’n</i></span></div>
  <p>Entwurf eurer neuen Webseite. Bitte gebt das Passwort ein, das ihr bekommen habt.</p>
  <form method="post" action="">
    <label for="pw">Passwort</label>
    <input id="pw" name="at_pw" type="password" autocomplete="current-password" required autofocus>
    <?php if ($atFehler !== ''): ?><p class="gate__err" role="alert"><?= htmlspecialchars($atFehler, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
    <button type="submit">Entwurf ansehen</button>
  </form>
  <a class="gate__tk" href="https://tim-kofler.at" target="_blank" rel="noopener"><img src="<?= $basis ?>assets/img/tk-logo.svg" alt="" width="34" height="17">Entwurf von Tim Kofler</a>
</main>
</body>
</html><?php
    exit;
}

// Telegram-Nachricht an Tim, wenn jemand den Entwurf ansieht (siehe ../_ansicht.php).
require_once __DIR__ . '/../_ansicht.php';
demo_ansicht('auteufeln', 'Melker-Au-Teufeln-Entwurf');
