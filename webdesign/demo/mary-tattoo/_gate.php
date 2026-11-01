<?php
// Einfacher Passwortschutz für den Entwurf Mary's Tattoo Studio Gresten.
// Kein geheimer Inhalt, nur damit den Entwurf nur sieht, wer das Passwort bekommen hat.
declare(strict_types=1);

const MARY_HASH = '$2y$10$jp4p7akTlGSrp0MY4.uurezYEM.5fdBddStfL.BsAuE/Nmyta16wy';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

session_name('mary_demo');
session_set_cookie_params(['lifetime' => 0, 'path' => '/demo/mary-tattoo/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
session_start();

$maryFehler = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['mary_pw'])) {
    require_once __DIR__ . '/../_ansicht.php';
    if (!demo_versuch_ok('mary', 'Mary-Tattoo-Entwurf')) {
        $maryFehler = 'Zu viele Versuche. Bitte in 15 Minuten noch einmal probieren.';
    } elseif (password_verify((string) $_POST['mary_pw'], demo_hash('mary', MARY_HASH))) {
        session_regenerate_id(true);
        $_SESSION['mary_ok'] = true;
        header('Location: /demo/mary-tattoo/', true, 303);
        exit;
    } else {
        usleep(800000); // bremst Rateversuche
        $maryFehler = 'Das Passwort stimmt leider nicht.';
    }
}

if (empty($_SESSION['mary_ok'])) {
    $basis = '/demo/mary-tattoo/';
    ?><!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0f0e0d">
<title>Mary's Tattoo Studio · Entwurf</title>
<meta name="description" content="Entwurf der neuen Webseite für Mary's Tattoo Studio in Gresten.">
<meta property="og:type" content="website">
<meta property="og:title" content="Mary's Tattoo Studio · Entwurf der neuen Webseite">
<meta property="og:description" content="Entwurf der neuen Webseite für Mary's Tattoo Studio in Gresten, gebaut von Tim Kofler.">
<meta property="og:url" content="https://tim-kofler.at/demo/mary-tattoo/">
<meta property="og:image" content="https://tim-kofler.at/demo/mary-tattoo/assets/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="<?= $basis ?>assets/gate.css?v=1">
</head>
<body>
<main class="gate">
  <div class="gate__mark" aria-hidden="true"><span>Mary's</span><small>TATTOO STUDIO · GRESTEN</small></div>
  <p>Entwurf Ihrer neuen Webseite. Bitte geben Sie das Passwort ein, das Sie bekommen haben.</p>
  <form method="post" action="">
    <label for="pw">Passwort</label>
    <input id="pw" name="mary_pw" type="password" autocomplete="current-password" required autofocus>
    <?php if ($maryFehler !== ''): ?><p class="gate__err" role="alert"><?= htmlspecialchars($maryFehler, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
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
demo_ansicht('mary', 'Mary-Tattoo-Entwurf');
