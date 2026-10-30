<?php
// Nachricht an Tims Handy, wenn jemand einen Kunden-Entwurf unter /demo/ ansieht.
// Jede _gate.php ruft demo_ansicht() nach dem Passwort auf, so meldet sich jeder neue Entwurf automatisch.
// Höchstens alle 30 Minuten pro Besuch; Geräte mit dem Cookie „nicht mitzählen“ (Tim, Familie) lösen nichts aus.
// Fehler hier dürfen die Seite nie aufhalten. Die fertige Kundenseite bekommt das nicht.
declare(strict_types=1);

function demo_ansicht(string $key, string $name): void
{
    if (isset($_COOKIE['tk_nicht_zaehlen']) || time() - (int) ($_SESSION[$key . '_ping'] ?? 0) <= 1800) {
        return;
    }
    $_SESSION[$key . '_ping'] = time();
    try {
        require_once __DIR__ . '/../api/push-lib.php';
        $zFile = CX_DATA . '/demo-aufrufe.json';
        $z = is_file($zFile) ? (array) json_decode((string) file_get_contents($zFile), true) : [];
        $z[$key] = (int) ($z[$key] ?? 0) + 1;
        @file_put_contents($zFile, json_encode($z), LOCK_EX);
        $ua = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
        $geraet = preg_match('/iPad|Tablet/i', $ua) ? 'Tablet' : (preg_match('/iPhone|Android|Mobile/i', $ua) ? 'Handy' : 'PC');
        $zeit = (new DateTime('now', new DateTimeZone('Europe/Vienna')))->format('H:i');
        pu_send('👀 ' . $name . ' wird gerade angesehen (' . $z[$key] . '. Mal, ' . $geraet . ', ' . $zeit . ' Uhr).');
    } catch (Throwable $e) {
    }
}
