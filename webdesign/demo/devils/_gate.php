<?php
// Einfacher Passwortschutz für den Entwurf The Devils Kremsmünster.
// Kein geheimer Inhalt, nur damit den Entwurf nur sieht, wer das Passwort bekommen hat.
declare(strict_types=1);

const DEVILS_HASH = '$2y$10$1kLZBWQhha4gSCqW8UcAy.UIo3j3/i6dtxRuiIFeL.zySOZ1CWU4y';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

session_name('devils_demo');
session_set_cookie_params(['lifetime' => 0, 'path' => '/demo/devils/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
session_start();

$devilsFehler = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['devils_pw'])) {
    require_once __DIR__ . '/../_ansicht.php';
    if (!demo_versuch_ok('devils', 'The-Devils-Entwurf')) {
        $devilsFehler = 'Zu viele Versuche. Bitte in 15 Minuten noch einmal probieren.';
    } elseif (password_verify((string) $_POST['devils_pw'], demo_hash('devils', DEVILS_HASH))) {
        session_regenerate_id(true);
        $_SESSION['devils_ok'] = true;
        header('Location: /demo/devils/', true, 303);
        exit;
    } else {
        usleep(800000); // bremst Rateversuche
        $devilsFehler = 'Das Passwort stimmt leider nicht.';
    }
}

if (empty($_SESSION['devils_ok'])) {
    $basis = '/demo/devils/';
    ?><!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0b0908">
<title>The Devils Kremsmünster · Entwurf</title>
<meta name="description" content="Entwurf der neuen Webseite für The Devils Kremsmünster, Krampus- und Perchtenverein aus Oberösterreich.">
<meta property="og:type" content="website">
<meta property="og:title" content="The Devils Kremsmünster · Entwurf eurer Webseite">
<meta property="og:description" content="Entwurf der neuen Webseite, gebaut von Tim Kofler.">
<meta property="og:url" content="https://tim-kofler.at/demo/devils/">
<meta property="og:image" content="https://tim-kofler.at/demo/devils/assets/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="<?= $basis ?>assets/gate.css?v=1">
</head>
<body>
<main class="gate">
  <div class="gate__mark" aria-hidden="true"><span>The Devils</span><small>KREMSMÜNSTER</small></div>
  <p>Entwurf eurer neuen Webseite. Bitte gebt das Passwort ein, das ihr bekommen habt.</p>
  <form method="post" action="">
    <label for="pw">Passwort</label>
    <input id="pw" name="devils_pw" type="password" autocomplete="current-password" required autofocus>
    <?php if ($devilsFehler !== ''): ?><p class="gate__err" role="alert"><?= htmlspecialchars($devilsFehler, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
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
demo_ansicht('devils', 'The-Devils-Entwurf');
