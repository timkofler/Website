<?php
// Tim Kofler – Erreichbarkeit der Kundenseiten (Daten vom Seiten-Wächter). Genutzt von api/erreichbarkeit.php
// und vom Kundenportal (Karte „Deine Webseite in Zahlen“). Nur per include, per .htaccess gesperrt.

declare(strict_types=1);

require_once __DIR__ . '/lib.php';

const ER_FILE = CX_DATA . '/erreichbarkeit.json';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
header('Content-Type: application/json; charset=utf-8');

function er_host(string $h): string
{
    $h = strtolower(trim($h));
    $h = (string) preg_replace('/^www\./', '', $h);
    return preg_match('/^[a-z0-9.-]{3,100}$/', $h) ? $h : '';
}

function er_laden(): array
{
    $d = is_file(ER_FILE) ? json_decode((string) file_get_contents(ER_FILE), true) : [];
    return is_array($d) ? $d + ['seiten' => [], 'ausfaelle' => []] : ['seiten' => [], 'ausfaelle' => []];
}

// Ausfälle eines Monats (JJJJ-MM): ['ueberwacht' => bool, 'minuten' => …, 'ausfaelle' => …]
function er_monat(string $h, string $monat): array
{
    $tz = new DateTimeZone('Europe/Vienna');
    $anfang = (new DateTimeImmutable($monat . '-01 00:00:00', $tz))->getTimestamp();
    $ende = (new DateTimeImmutable($monat . '-01 00:00:00', $tz))->modify('+1 month')->getTimestamp();
    $d = er_laden();
    $s = $d['seiten'][$h] ?? null;
    // Überwacht = vor Monatsende in die Liste gekommen und in diesem Monat noch gemeldet
    $ueberwacht = $s !== null && $s['seit'] < $ende && $s['zuletzt'] >= $anfang;
    $sekunden = 0;
    $anzahl = 0;
    foreach ($d['ausfaelle'][$h] ?? [] as [$von, $bis]) {
        $teil = min($bis, $ende) - max($von, $anfang);
        if ($teil > 0) {
            $sekunden += $teil;
            $anzahl++;
        }
    }
    return ['ueberwacht' => $ueberwacht, 'minuten' => (int) round($sekunden / 60), 'ausfaelle' => $anzahl];
}
