<?php
// Einfacher Passwortschutz für den Entwurf Heilmasseur Jakob Mistelbauer.
// Kein geheimer Inhalt, nur damit den Entwurf nur sieht, wer das Passwort bekommen hat.
declare(strict_types=1);

const MISTELBAUER_HASH = '$2y$10$zjCGi5d6fYm93jNdEAz4nOxwt3o7EMFqeNHar5HqqwsEinCkx3GTW';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

session_name('mistelbauer_demo');
session_set_cookie_params(['lifetime' => 0, 'path' => '/demo/mistelbauer/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
session_start();

$mbFehler = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['mb_pw'])) {
    require_once __DIR__ . '/../_ansicht.php';
    if (!demo_versuch_ok('mistelbauer', 'Heilmasseur-Entwurf')) {
        $mbFehler = 'Zu viele Versuche. Bitte in 15 Minuten noch einmal probieren.';
    } elseif (password_verify((string) $_POST['mb_pw'], demo_hash('mistelbauer', MISTELBAUER_HASH))) {
        session_regenerate_id(true);
        $_SESSION['mistelbauer_ok'] = true;
        header('Location: /demo/mistelbauer/', true, 303);
        exit;
    } else {
        usleep(800000); // bremst Rateversuche
        $mbFehler = 'Das Passwort stimmt leider nicht.';
    }
}

if (empty($_SESSION['mistelbauer_ok'])) {
    $basis = '/demo/mistelbauer/';
    ?><!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0c2236">
<title>Jakob Mistelbauer · Heilmasseur · Entwurf</title>
<meta name="description" content="Entwurf der neuen Webseite für Heilmasseur Jakob Mistelbauer in Lichtenau im Waldviertel.">
<meta property="og:type" content="website">
<meta property="og:title" content="Jakob Mistelbauer · Heilmasseur · Entwurf">
<meta property="og:description" content="Entwurf der neuen Webseite, gebaut von Tim Kofler.">
<meta property="og:url" content="https://tim-kofler.at/demo/mistelbauer/">
<meta property="og:image" content="https://tim-kofler.at/demo/mistelbauer/assets/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="<?= $basis ?>assets/gate.css?v=1">
</head>
<body>
<main class="gate">
  <span class="gate__mono" aria-hidden="true">JM</span>
  <p class="gate__name">Jakob Mistelbauer<em>Heilmasseur</em></p>
  <p class="gate__txt">Entwurf Ihrer neuen Webseite. Bitte geben Sie das Passwort ein, das Sie bekommen haben.</p>
  <form method="post" action="">
    <label for="pw">Passwort</label>
    <input id="pw" name="mb_pw" type="password" autocomplete="current-password" required autofocus>
    <?php if ($mbFehler !== ''): ?><p class="gate__err" role="alert"><?= htmlspecialchars($mbFehler, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
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
demo_ansicht('mistelbauer', 'Heilmasseur-Entwurf');
