<?php
// Einfacher Passwortschutz für den Entwurf bunker.kollektiv.
// Kein geheimer Inhalt, nur damit den Entwurf nur sieht, wer das Passwort bekommen hat.
declare(strict_types=1);

const BUNKER_HASH = '$2y$10$4oVQrjpV5reJ7EdrXmNldOHevkPZVXleiboQSy7RGSiSgAAUpvfIq';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

session_name('bunker_demo');
session_set_cookie_params(['lifetime' => 0, 'path' => '/demo/bunker/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
session_start();

$bunkerFehler = false;
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['bunker_pw'])) {
    if (password_verify((string) $_POST['bunker_pw'], BUNKER_HASH)) {
        session_regenerate_id(true);
        $_SESSION['bunker_ok'] = true;
        $ziel = strtok($_SERVER['REQUEST_URI'] ?? '/demo/bunker/', '?');
        if (!is_string($ziel) || strpos($ziel, '/demo/bunker/') !== 0) $ziel = '/demo/bunker/';
        header('Location: ' . $ziel, true, 303);
        exit;
    }
    usleep(800000); // bremst Rateversuche
    $bunkerFehler = true;
}

if (empty($_SESSION['bunker_ok'])) {
    $basis = '/demo/bunker/';
    ?><!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>bunker.kollektiv · Entwurf</title>
<link rel="icon" href="<?= $basis ?>assets/img/logo.svg" type="image/svg+xml">
<link rel="stylesheet" href="<?= $basis ?>assets/gate.css?v=1">
</head>
<body>
<main class="gate">
  <svg class="gate__logo" viewBox="-30 -30 1060 1060" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <g stroke-width="36"><path d="M164 0H0V1000H1000V0H334"/><path d="M164 0V908A85 85 0 0 0 334 908V0"/><path d="M70 0C125 5 164 40 164 90"/><path d="M164 420C150 475 90 506 0 506C90 506 150 540 164 595"/><path d="M164 905C164 960 110 1000 40 1000"/><path d="M334 0L500 1000"/><path d="M500 0V1000"/><path d="M664 0L500 500L664 1000"/><path d="M664 0V1000"/><path d="M664 500H880"/><path d="M880 500C950 500 1000 460 1000 380"/><path d="M900 0C960 0 1000 30 1000 85"/><path d="M830 0V1000"/><path d="M830 500L1000 1000"/></g>
  </svg>
  <h1>bunker<b>.</b>kollektiv</h1>
  <p>Entwurf der neuen Webseite. Bitte gib das Passwort ein, das du bekommen hast.</p>
  <form method="post" action="">
    <label for="pw">Passwort</label>
    <input id="pw" name="bunker_pw" type="password" autocomplete="current-password" required autofocus>
    <?php if ($bunkerFehler): ?><p class="gate__err" role="alert">Das Passwort stimmt leider nicht.</p><?php endif; ?>
    <button type="submit">Reingehen</button>
  </form>
  <a class="gate__tk" href="https://tim-kofler.at" target="_blank" rel="noopener"><span class="tk"><img src="<?= $basis ?>assets/img/tk-logo.svg" alt="" width="34" height="17"></span>Entwurf von Tim Kofler</a>
</main>
</body>
</html><?php
    exit;
}

// Telegram-Nachricht an Tim, wenn jemand den Entwurf ansieht (siehe ../_ansicht.php).
require_once __DIR__ . '/../_ansicht.php';
demo_ansicht('bunker', 'bunker.kollektiv-Entwurf');
