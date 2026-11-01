<?php
// Einfacher Passwortschutz für den Entwurf Michele Peloza.
// Kein geheimer Inhalt, nur damit den Entwurf nur sieht, wer das Passwort bekommen hat.
declare(strict_types=1);

const MICHELE_HASH = '$2y$10$fQIMJbNu5k9LdM7JYI/Cqu8g5tgw0NS/wGc.FJbIXoet98hiZe1K.';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

session_name('michele_demo');
session_set_cookie_params(['lifetime' => 0, 'path' => '/demo/michele/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
session_start();

$micheleFehler = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['michele_pw'])) {
    require_once __DIR__ . '/../_ansicht.php';
    if (!demo_versuch_ok('michele', 'Michele-Peloza-Entwurf')) {
        $micheleFehler = 'Zu viele Versuche. Bitte in 15 Minuten noch einmal probieren.';
    } elseif (password_verify((string) $_POST['michele_pw'], demo_hash('michele', MICHELE_HASH))) {
        session_regenerate_id(true);
        $_SESSION['michele_ok'] = true;
        header('Location: /demo/michele/', true, 303);
        exit;
    } else {
        usleep(800000); // bremst Rateversuche
        $micheleFehler = 'Das Passwort stimmt leider nicht.';
    }
}

if (empty($_SESSION['michele_ok'])) {
    $basis = '/demo/michele/';
    ?><!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#f5efe6">
<title>Michele Peloza · Entwurf</title>
<meta name="description" content="Entwurf der neuen Webseite für Michele Peloza, Fotografin und energetische Begleitung in Linz.">
<meta property="og:type" content="website">
<meta property="og:title" content="Michele Peloza · Entwurf deiner Webseite">
<meta property="og:description" content="Entwurf der neuen Webseite, gebaut von Tim Kofler.">
<meta property="og:url" content="https://tim-kofler.at/demo/michele/">
<meta property="og:image" content="https://tim-kofler.at/demo/michele/assets/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="<?= $basis ?>assets/gate.css?v=1">
</head>
<body>
<main class="gate">
  <div class="gate__mark" aria-hidden="true"><span>Michele Peloza</span><small>FOTOGRAFIE &amp; ENERGIE</small></div>
  <p>Entwurf deiner neuen Webseite. Bitte gib das Passwort ein, das du bekommen hast.</p>
  <form method="post" action="">
    <label for="pw">Passwort</label>
    <input id="pw" name="michele_pw" type="password" autocomplete="current-password" required autofocus>
    <?php if ($micheleFehler !== ''): ?><p class="gate__err" role="alert"><?= htmlspecialchars($micheleFehler, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
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
demo_ansicht('michele', 'Michele-Peloza-Entwurf');
