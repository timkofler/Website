<?php
// Einfacher Passwortschutz für den Entwurf Haarstudio Uni:cut.
// Kein geheimer Inhalt, nur damit den Entwurf nur sieht, wer das Passwort bekommen hat.
declare(strict_types=1);

const UNICUT_HASH = '$2y$10$G0PmQVOrO24Ku1kFmBeAR.mrqe/sKhEUmdxAtqufeo76FXIY/EgQW';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

session_name('unicut_demo');
session_set_cookie_params(['lifetime' => 0, 'path' => '/demo/unicut/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
session_start();

$unicutFehler = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['unicut_pw'])) {
    require_once __DIR__ . '/../_ansicht.php';
    if (!demo_versuch_ok('unicut', 'Uni:cut-Entwurf')) {
        $unicutFehler = 'Zu viele Versuche. Bitte in 15 Minuten noch einmal probieren.';
    } elseif (password_verify((string) $_POST['unicut_pw'], demo_hash('unicut', UNICUT_HASH))) {
        session_regenerate_id(true);
        $_SESSION['unicut_ok'] = true;
        header('Location: /demo/unicut/', true, 303);
        exit;
    } else {
        usleep(800000); // bremst Rateversuche
        $unicutFehler = 'Das Passwort stimmt leider nicht.';
    }
}

if (empty($_SESSION['unicut_ok'])) {
    $basis = '/demo/unicut/';
    ?><!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#f4efe8">
<title>Haarstudio Uni:cut · Entwurf</title>
<meta name="description" content="Entwurf der neuen Webseite für das Haarstudio Uni:cut in Ruprechtshofen.">
<meta property="og:type" content="website">
<meta property="og:title" content="Haarstudio Uni:cut · Entwurf">
<meta property="og:description" content="Entwurf der neuen Webseite, gebaut von Tim Kofler.">
<meta property="og:url" content="https://tim-kofler.at/demo/unicut/">
<meta property="og:image" content="https://tim-kofler.at/demo/unicut/assets/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="<?= $basis ?>assets/gate.css?v=1">
</head>
<body>
<main class="gate">
  <div class="gate__mark" aria-hidden="true"><span>UNI:CUT</span><small>HAARSTUDIO</small></div>
  <p>Entwurf eurer neuen Webseite. Bitte gebt das Passwort ein, das ihr bekommen habt.</p>
  <form method="post" action="">
    <label for="pw">Passwort</label>
    <input id="pw" name="unicut_pw" type="password" autocomplete="current-password" required autofocus>
    <?php if ($unicutFehler !== ''): ?><p class="gate__err" role="alert"><?= htmlspecialchars($unicutFehler, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
    <button type="submit">Entwurf ansehen</button>
  </form>
  <a class="gate__tk" href="https://tim-kofler.at" target="_blank" rel="noopener"><img src="<?= $basis ?>assets/img/tk-logo-dunkel.svg" alt="" width="34" height="17">Entwurf von Tim Kofler</a>
</main>
</body>
</html><?php
    exit;
}

// Telegram-Nachricht an Tim, wenn jemand den Entwurf ansieht (siehe ../_ansicht.php).
require_once __DIR__ . '/../_ansicht.php';
demo_ansicht('unicut', 'Uni:cut-Entwurf');
