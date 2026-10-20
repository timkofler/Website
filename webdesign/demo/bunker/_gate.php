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
  <svg class="gate__logo" viewBox="8 8 1004 990" aria-hidden="true" fill="none" stroke="currentColor">
    <g stroke-width="42"><path d="M197 38H42V968H975"/><path d="M352 38H880C945 38 975 75 975 125V420C975 480 905 505 820 505"/><path d="M197 38V850C197 930 235 968 276 968C317 968 355 930 355 850V38"/></g>
    <g stroke-width="30"><path d="M100 38C160 45 192 80 192 125"/><path d="M192 420C180 470 120 505 42 505C120 505 180 540 192 590"/><path d="M192 870C180 930 120 968 60 968"/><path d="M360 45L505 965M508 38V968"/><path d="M658 38L510 505L658 965M660 38V968"/><path d="M660 505H815M815 38V968M815 515L970 965"/></g>
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
