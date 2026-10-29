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

$xbaseFehler = false;
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['xbase_pw'])) {
    if (password_verify((string) $_POST['xbase_pw'], XBASE_HASH)) {
        session_regenerate_id(true);
        $_SESSION['xbase_ok'] = true;
        header('Location: /demo/xbase/', true, 303);
        exit;
    }
    usleep(800000); // bremst Rateversuche
    $xbaseFehler = true;
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
    <?php if ($xbaseFehler): ?><p class="gate__err" role="alert">Das Passwort stimmt leider nicht.</p><?php endif; ?>
    <button type="submit">Entwurf ansehen</button>
  </form>
  <a class="gate__tk" href="https://tim-kofler.at" target="_blank" rel="noopener"><img src="<?= $basis ?>assets/img/tk-logo-2.svg" alt="" width="34" height="17">Entwurf von Tim Kofler</a>
</main>
</body>
</html><?php
    exit;
}

// Nachricht an Tims Handy, wenn jemand den Entwurf ansieht (nach dem Passwort, dann höchstens alle 30 Minuten pro Besuch).
// Geräte mit dem Cookie „nicht mitzählen“ (Tim, Familie) lösen nichts aus. Fehler hier dürfen die Seite nie aufhalten.
if (!isset($_COOKIE['tk_nicht_zaehlen']) && time() - (int) ($_SESSION['xbase_ping'] ?? 0) > 1800) {
    $_SESSION['xbase_ping'] = time();
    try {
        require_once __DIR__ . '/../../api/push-lib.php';
        $zFile = CX_DATA . '/demo-aufrufe.json';
        $z = is_file($zFile) ? (array) json_decode((string) file_get_contents($zFile), true) : [];
        $z['xbase'] = (int) ($z['xbase'] ?? 0) + 1;
        @file_put_contents($zFile, json_encode($z), LOCK_EX);
        $ua = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
        $geraet = preg_match('/iPad|Tablet/i', $ua) ? 'Tablet' : (preg_match('/iPhone|Android|Mobile/i', $ua) ? 'Handy' : 'PC');
        $zeit = (new DateTime('now', new DateTimeZone('Europe/Vienna')))->format('H:i');
        pu_send('👀 XBASE-Entwurf wird gerade angesehen (' . $z['xbase'] . '. Mal, ' . $geraet . ', ' . $zeit . ' Uhr).');
    } catch (Throwable $e) {
    }
}
