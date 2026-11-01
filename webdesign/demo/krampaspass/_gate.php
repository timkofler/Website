<?php
// Einfacher Passwortschutz für den Entwurf Krampaspass.
// Kein geheimer Inhalt, nur damit den Entwurf nur sieht, wer das Passwort bekommen hat.
declare(strict_types=1);

const KP_HASH = '$2y$10$SxZFMjC0h4C1C3JwWU3n0OIpptNQ3ruzbBk9VHsNHtnkd1Z4QP69.';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

session_name('krampaspass_demo');
session_set_cookie_params(['lifetime' => 0, 'path' => '/demo/krampaspass/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
session_start();

$kpFehler = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['kp_pw'])) {
    require_once __DIR__ . '/../_ansicht.php';
    if (!demo_versuch_ok('krampaspass', 'Krampaspass-Entwurf')) {
        $kpFehler = 'Zu viele Versuche. Bitte in 15 Minuten noch einmal probieren.';
    } elseif (password_verify((string) $_POST['kp_pw'], demo_hash('krampaspass', KP_HASH))) {
        session_regenerate_id(true);
        $_SESSION['kp_ok'] = true;
        header('Location: /demo/krampaspass/', true, 303);
        exit;
    } else {
        usleep(800000); // bremst Rateversuche
        $kpFehler = 'Das Passwort stimmt leider nicht.';
    }
}

if (empty($_SESSION['kp_ok'])) {
    $basis = '/demo/krampaspass/';
    ?><!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#140c07">
<title>Krampaspass · Entwurf</title>
<meta name="description" content="Entwurf der neuen Webseite für Krampaspass, Krampusgruppe aus dem Erlauftal im Mostviertel.">
<meta property="og:type" content="website">
<meta property="og:title" content="Krampaspass · Entwurf eurer Webseite">
<meta property="og:description" content="Entwurf der neuen Webseite, gebaut von Tim Kofler.">
<meta property="og:url" content="https://tim-kofler.at/demo/krampaspass/">
<meta property="og:image" content="https://tim-kofler.at/demo/krampaspass/assets/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="<?= $basis ?>assets/gate.css?v=1">
</head>
<body>
<main class="gate">
  <div class="gate__mark" aria-hidden="true"><span>Krampaspass</span><small>anno MMXIX</small></div>
  <p>Entwurf eurer neuen Webseite. Bitte gebt das Passwort ein, das ihr bekommen habt.</p>
  <form method="post" action="">
    <label for="pw">Passwort</label>
    <input id="pw" name="kp_pw" type="password" autocomplete="current-password" required autofocus>
    <?php if ($kpFehler !== ''): ?><p class="gate__err" role="alert"><?= htmlspecialchars($kpFehler, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
    <button type="submit">Entwurf ansehen</button>
  </form>
  <a class="gate__tk" href="https://tim-kofler.at" target="_blank" rel="noopener"><img src="<?= $basis ?>assets/img/tk-logo-dunkel.svg" alt="" width="34" height="17">Webseite von Tim Kofler</a>
</main>
</body>
</html><?php
    exit;
}

// Telegram-Nachricht an Tim, wenn jemand den Entwurf ansieht (siehe ../_ansicht.php).
require_once __DIR__ . '/../_ansicht.php';
demo_ansicht('krampaspass', 'Krampaspass-Entwurf');
