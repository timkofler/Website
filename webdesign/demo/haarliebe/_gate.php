<?php
// Einfacher Passwortschutz für den Entwurf Haarliebe (Sabrina Scharnreitner, Behamberg).
// Kein geheimer Inhalt, nur damit den Entwurf nur sieht, wer das Passwort bekommen hat.
declare(strict_types=1);

const HAARLIEBE_HASH = '$2y$10$rvgCaCJxHVJtu.XxFDZcy.ayeVSGW1LGDGx408eBJn.zCQvprcij.';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

session_name('haarliebe_demo');
session_set_cookie_params(['lifetime' => 0, 'path' => '/demo/haarliebe/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
session_start();

$hlFehler = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['haarliebe_pw'])) {
    require_once __DIR__ . '/../_ansicht.php';
    if (!demo_versuch_ok('haarliebe', 'Haarliebe-Entwurf')) {
        $hlFehler = 'Zu viele Versuche. Bitte in 15 Minuten noch einmal probieren.';
    } elseif (password_verify((string) $_POST['haarliebe_pw'], demo_hash('haarliebe', HAARLIEBE_HASH))) {
        session_regenerate_id(true);
        $_SESSION['haarliebe_ok'] = true;
        header('Location: /demo/haarliebe/', true, 303);
        exit;
    } else {
        usleep(800000); // bremst Rateversuche
        $hlFehler = 'Das Passwort stimmt leider nicht.';
    }
}

if (empty($_SESSION['haarliebe_ok'])) {
    $basis = '/demo/haarliebe/';
    ?><!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#fbf4f1">
<title>Haarliebe · Sabrina Scharnreitner · Entwurf</title>
<meta name="description" content="Entwurf der neuen Webseite für Haarliebe, Meisterfriseurin Sabrina Scharnreitner in Behamberg.">
<meta property="og:type" content="website">
<meta property="og:title" content="Haarliebe · Sabrina Scharnreitner · Entwurf">
<meta property="og:description" content="Entwurf der neuen Webseite, gebaut von Tim Kofler.">
<meta property="og:url" content="https://tim-kofler.at/demo/haarliebe/">
<meta property="og:image" content="https://tim-kofler.at/demo/haarliebe/assets/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="<?= $basis ?>assets/gate.css?v=1">
</head>
<body>
<main class="gate">
  <div class="gate__mark" aria-hidden="true"><span>Haarliebe</span><small>MEISTERFRISEURIN · SABRINA SCHARNREITNER</small></div>
  <p>Entwurf Ihrer neuen Webseite. Bitte geben Sie das Passwort ein, das Sie bekommen haben.</p>
  <form method="post" action="">
    <label for="pw">Passwort</label>
    <input id="pw" name="haarliebe_pw" type="password" autocomplete="current-password" required autofocus>
    <?php if ($hlFehler !== ''): ?><p class="gate__err" role="alert"><?= htmlspecialchars($hlFehler, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
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
demo_ansicht('haarliebe', 'Haarliebe-Entwurf');
