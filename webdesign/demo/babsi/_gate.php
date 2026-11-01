<?php
// Einfacher Passwortschutz für den Entwurf Babsis Hoarstüberl.
// Kein geheimer Inhalt, nur damit den Entwurf nur sieht, wer das Passwort bekommen hat.
declare(strict_types=1);

const BABSI_HASH = '$2y$10$gctAyAWWSj/1D9xnHTR3ueeNprPlnhk.1/ukhb.JYwJDIJJxBXWsa';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

session_name('babsi_demo');
session_set_cookie_params(['lifetime' => 0, 'path' => '/demo/babsi/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
session_start();

$babsiFehler = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['babsi_pw'])) {
    require_once __DIR__ . '/../_ansicht.php';
    if (!demo_versuch_ok('babsi', 'Hoarstüberl-Entwurf')) {
        $babsiFehler = 'Zu viele Versuche. Bitte in 15 Minuten noch einmal probieren.';
    } elseif (password_verify((string) $_POST['babsi_pw'], demo_hash('babsi', BABSI_HASH))) {
        session_regenerate_id(true);
        $_SESSION['babsi_ok'] = true;
        header('Location: /demo/babsi/', true, 303);
        exit;
    } else {
        usleep(800000); // bremst Rateversuche
        $babsiFehler = 'Das Passwort stimmt leider nicht.';
    }
}

if (empty($_SESSION['babsi_ok'])) {
    $basis = '/demo/babsi/';
    ?><!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#f4efe4">
<title>Babsis Hoarstüberl · Entwurf</title>
<link rel="stylesheet" href="<?= $basis ?>assets/gate.css?v=1">
</head>
<body>
<main class="gate">
  <svg class="gate__leaf" viewBox="0 0 64 64" aria-hidden="true"><use href="<?= $basis ?>assets/img/zweig.svg#z"/></svg>
  <p class="gate__name"><em>Babsis</em> Hoarstüberl</p>
  <p class="gate__txt">Entwurf Ihrer neuen Webseite. Bitte geben Sie das Passwort ein, das Sie bekommen haben.</p>
  <form method="post" action="">
    <label for="pw">Passwort</label>
    <input id="pw" name="babsi_pw" type="password" autocomplete="current-password" required autofocus>
    <?php if ($babsiFehler !== ''): ?><p class="gate__err" role="alert"><?= htmlspecialchars($babsiFehler, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
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
demo_ansicht('babsi', 'Hoarstüberl-Entwurf');
