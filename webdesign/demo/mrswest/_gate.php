<?php
// Einfacher Passwortschutz für den Entwurf „Backen mit Mrs. West“.
// Kein geheimer Inhalt, nur damit den Entwurf nur sieht, wer das Passwort bekommen hat.
declare(strict_types=1);

const MRSWEST_HASH = '$2y$10$reow4tqffTA3Nrbk6/fF0Oa2p2Dt3qJwkHQRewXh8bhLom8gJdSMq';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

session_name('mrswest_demo');
session_set_cookie_params(['lifetime' => 0, 'path' => '/demo/mrswest/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
session_start();

$mwFehler = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['mw_pw'])) {
    require_once __DIR__ . '/../_ansicht.php';
    if (!demo_versuch_ok('mrswest', 'Mrs-West-Entwurf')) {
        $mwFehler = 'Zu viele Versuche. Bitte in 15 Minuten noch einmal probieren.';
    } elseif (password_verify((string) $_POST['mw_pw'], demo_hash('mrswest', MRSWEST_HASH))) {
        session_regenerate_id(true);
        $_SESSION['mrswest_ok'] = true;
        header('Location: /demo/mrswest/', true, 303);
        exit;
    } else {
        usleep(800000); // bremst Rateversuche
        $mwFehler = 'Das Passwort stimmt leider nicht.';
    }
}

if (empty($_SESSION['mrswest_ok'])) {
    $basis = '/demo/mrswest/';
    ?><!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#fdf3ee">
<title>Backen mit Mrs. West · Entwurf</title>
<meta name="description" content="Entwurf der neuen Webseite für Backen mit Mrs. West.">
<meta property="og:type" content="website">
<meta property="og:title" content="Backen mit Mrs. West · Entwurf">
<meta property="og:description" content="Entwurf der neuen Webseite: Rezept-Dose mit Suche, Backform-Rechner, Einkaufsliste und Backbuch. Gebaut von Tim Kofler.">
<meta property="og:url" content="https://tim-kofler.at/demo/mrswest/">
<meta property="og:image" content="https://tim-kofler.at/demo/mrswest/assets/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="<?= $basis ?>assets/img/logo.svg" type="image/svg+xml">
<link rel="stylesheet" href="<?= $basis ?>assets/gate.css?v=1">
</head>
<body>
<main class="gate">
  <img class="gate__logo" src="<?= $basis ?>assets/img/logo.svg" alt="" width="120" height="120">
  <p class="gate__kicker">Entwurf deiner neuen Webseite</p>
  <p class="gate__name">Backen mit <em>Mrs. West</em></p>
  <p class="gate__txt">Gib bitte das Passwort ein, das du bekommen hast.</p>
  <form method="post" action="">
    <label for="pw">Passwort</label>
    <input id="pw" name="mw_pw" type="password" autocomplete="current-password" required autofocus>
    <?php if ($mwFehler !== ''): ?><p class="gate__err" role="alert"><?= htmlspecialchars($mwFehler, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
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
demo_ansicht('mrswest', 'Mrs-West-Entwurf');
