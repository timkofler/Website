<?php
// Einfacher Passwortschutz für den Entwurf XBASE Aero.
// Kein geheimer Inhalt, nur damit den Entwurf nur sieht, wer das Passwort bekommen hat.
declare(strict_types=1);

const XBASE_HASH = '$2y$10$od8No1ihUozemnA1TIQVf.a48S4Ss2P0Noms6A0/z8eQl6mESpxby';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

session_name('xbase_demo');
session_set_cookie_params(['lifetime' => 0, 'path' => '/demo/xbase/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
session_start();

$xbaseFehler = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['xbase_pw'])) {
    require_once __DIR__ . '/../_ansicht.php';
    if (!demo_versuch_ok('xbase', 'XBASE-Entwurf')) {
        $xbaseFehler = 'Zu viele Versuche. Bitte in 15 Minuten noch einmal probieren.';
    } elseif (password_verify((string) $_POST['xbase_pw'], demo_hash('xbase', XBASE_HASH))) {
        session_regenerate_id(true);
        $_SESSION['xbase_ok'] = true;
        header('Location: /demo/xbase/', true, 303);
        exit;
    } else {
        usleep(800000); // bremst Rateversuche
        $xbaseFehler = 'Das Passwort stimmt leider nicht.';
    }
}

if (empty($_SESSION['xbase_ok'])) {
    $basis = '/demo/xbase/';
    ?><!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>XBASE Aero · Entwurf</title>
<link rel="stylesheet" href="<?= $basis ?>assets/gate.css?v=1">
</head>
<body>
<main class="gate">
  <img class="gate__logo" src="<?= $basis ?>assets/img/xbase-logo.webp" width="600" height="164" alt="XBASE Aero">
  <p>Entwurf Ihrer neuen Webseite. Bitte geben Sie das Passwort ein, das Sie erhalten haben.</p>
  <form method="post" action="">
    <label for="pw">Passwort</label>
    <input id="pw" name="xbase_pw" type="password" autocomplete="current-password" required autofocus>
    <?php if ($xbaseFehler !== ''): ?><p class="gate__err" role="alert"><?= htmlspecialchars($xbaseFehler, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
    <button type="submit">Entwurf ansehen</button>
  </form>
  <a class="gate__tk" href="https://tim-kofler.at" target="_blank" rel="noopener"><img src="<?= $basis ?>assets/img/tk-logo-2.svg" alt="" width="34" height="17">Entwurf von Tim Kofler</a>
</main>
</body>
</html><?php
    exit;
}

// Telegram-Nachricht an Tim, wenn jemand den Entwurf ansieht (siehe ../_ansicht.php).
require_once __DIR__ . '/../_ansicht.php';
demo_ansicht('xbase', 'XBASE-Entwurf');
