<?php
// Einfacher Passwortschutz für den Entwurf Pueblo Eventlocation.
// Kein geheimer Inhalt, nur damit den Entwurf nur sieht, wer das Passwort bekommen hat.
declare(strict_types=1);

const PUEBLO_HASH = '$2y$10$VOS8y3eHtDsm6enKsrbPKOmsUEdHAMsVMd2y89IuvSKVZyBFSdeYa';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

session_name('pueblo_demo');
session_set_cookie_params(['lifetime' => 0, 'path' => '/demo/pueblo/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
session_start();

$puebloFehler = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['pueblo_pw'])) {
    require_once __DIR__ . '/../_ansicht.php';
    if (!demo_versuch_ok('pueblo', 'Pueblo-Entwurf')) {
        $puebloFehler = 'Zu viele Versuche. Bitte in 15 Minuten noch einmal probieren.';
    } elseif (password_verify((string) $_POST['pueblo_pw'], demo_hash('pueblo', PUEBLO_HASH))) {
        session_regenerate_id(true);
        $_SESSION['pueblo_ok'] = true;
        header('Location: /demo/pueblo/', true, 303);
        exit;
    } else {
        usleep(800000); // bremst Rateversuche
        $puebloFehler = 'Das Passwort stimmt leider nicht.';
    }
}

if (empty($_SESSION['pueblo_ok'])) {
    $basis = '/demo/pueblo/';
    ?><!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#07060b">
<title>Pueblo Eventlocation · Entwurf</title>
<link rel="stylesheet" href="<?= $basis ?>assets/gate.css?v=1">
</head>
<body>
<main class="gate">
  <div class="gate__mark" aria-hidden="true"><span>PUEBLO</span><small>EVENTS</small></div>
  <p>Entwurf eurer neuen Webseite. Bitte gebt das Passwort ein, das ihr bekommen habt.</p>
  <form method="post" action="">
    <label for="pw">Passwort</label>
    <input id="pw" name="pueblo_pw" type="password" autocomplete="current-password" required autofocus>
    <?php if ($puebloFehler !== ''): ?><p class="gate__err" role="alert"><?= htmlspecialchars($puebloFehler, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
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
demo_ansicht('pueblo', 'Pueblo-Entwurf');
