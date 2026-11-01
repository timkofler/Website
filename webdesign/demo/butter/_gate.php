<?php
// Einfacher Passwortschutz für den Entwurf Frühstückspension Butter.
// Kein geheimer Inhalt, nur damit den Entwurf nur sieht, wer das Passwort bekommen hat.
declare(strict_types=1);

const BUTTER_HASH = '$2y$10$tAiRVF4aSMFN.wtMsGUHY.xKZpyr03ZvfTe.LcRgalyI8yr66P5ty';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

session_name('butter_demo');
session_set_cookie_params(['lifetime' => 0, 'path' => '/demo/butter/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
session_start();

$butterFehler = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['butter_pw'])) {
    require_once __DIR__ . '/../_ansicht.php';
    if (!demo_versuch_ok('butter', 'Pension-Butter-Entwurf')) {
        $butterFehler = 'Zu viele Versuche. Bitte in 15 Minuten noch einmal probieren.';
    } elseif (password_verify((string) $_POST['butter_pw'], demo_hash('butter', BUTTER_HASH))) {
        session_regenerate_id(true);
        $_SESSION['butter_ok'] = true;
        header('Location: /demo/butter/', true, 303);
        exit;
    } else {
        usleep(800000); // bremst Rateversuche
        $butterFehler = 'Das Passwort stimmt leider nicht.';
    }
}

if (empty($_SESSION['butter_ok'])) {
    $basis = '/demo/butter/';
    ?><!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#fbf5e6">
<title>Frühstückspension Butter · Entwurf</title>
<meta name="description" content="Entwurf der neuen Webseite für die Frühstückspension Butter in Scheibbs.">
<meta property="og:type" content="website">
<meta property="og:title" content="Frühstückspension Butter · Entwurf">
<meta property="og:description" content="Entwurf der neuen Webseite mit Zimmern, Belegungskalender und Anfrage. Gebaut von Tim Kofler.">
<meta property="og:url" content="https://tim-kofler.at/demo/butter/">
<meta property="og:image" content="https://tim-kofler.at/demo/butter/assets/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="<?= $basis ?>assets/gate.css?v=1">
</head>
<body>
<main class="gate">
  <img class="gate__stamp" src="<?= $basis ?>assets/img/stempel.svg" alt="" width="132" height="132">
  <p class="gate__name">Frühstückspension <em>Butter</em></p>
  <p class="gate__txt">Entwurf Ihrer neuen Webseite. Bitte geben Sie das Passwort ein, das Sie bekommen haben.</p>
  <form method="post" action="">
    <label for="pw">Passwort</label>
    <input id="pw" name="butter_pw" type="password" autocomplete="current-password" required autofocus>
    <?php if ($butterFehler !== ''): ?><p class="gate__err" role="alert"><?= htmlspecialchars($butterFehler, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
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
demo_ansicht('butter', 'Pension-Butter-Entwurf');
