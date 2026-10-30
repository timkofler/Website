<?php
// Tim Kofler – Erreichbarkeit der Kundenseiten für deren Monatsbericht (kundenseite-vorlage, _formular/statistik.php).
// POST (nur vom Seiten-Wächter bei GitHub, signiert mit dem Telegram-Schlüssel):
//   aktion=liste   seiten=host1,host2 … zeit=…   Diese Seiten werden überwacht (einmal am Tag).
//   aktion=ausfall seite=host von=… bis=… zeit=…  Ausfall von–bis (Unix-Zeit), gemeldet, sobald die Seite wieder geht.
//   sig = HMAC-SHA256 über "aktion|seite(n)|von|bis|zeit" mit dem Bot-Schlüssel.
// GET ?seite=host&monat=JJJJ-MM → {"ueberwacht":true|false,"minuten":…,"ausfaelle":…}
// Gespeichert werden nur Adressen und Zeiten, keine Inhalte und keine Besucherdaten.

declare(strict_types=1);

require __DIR__ . '/push-lib.php';

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

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $aktion = (string) ($_POST['aktion'] ?? '');
    $seite = (string) ($_POST[$aktion === 'liste' ? 'seiten' : 'seite'] ?? '');
    $von = (int) ($_POST['von'] ?? 0);
    $bis = (int) ($_POST['bis'] ?? 0);
    $zeit = (int) ($_POST['zeit'] ?? 0);
    $token = pu_token();
    $sig = hash_hmac('sha256', "$aktion|$seite|$von|$bis|$zeit", $token);
    if ($token === '' || !hash_equals($sig, (string) ($_POST['sig'] ?? '')) || abs(time() - $zeit) > 3600 || !cx_rate_hit('erreichbarkeit', 200, 3600)) {
        http_response_code(403);
        echo '{"ok":false}';
        exit;
    }
    $ok = cx_locked(CX_DATA . '/.erreichbarkeit.lock', static function () use ($aktion, $seite, $von, $bis) {
        $d = er_laden();
        $jetzt = time();
        if ($aktion === 'liste') {
            foreach (explode(',', $seite) as $h) {
                if (($h = er_host($h)) !== '') {
                    $d['seiten'][$h] = ['seit' => (int) ($d['seiten'][$h]['seit'] ?? $jetzt), 'zuletzt' => $jetzt];
                }
            }
        } elseif ($aktion === 'ausfall' && ($h = er_host($seite)) !== '' && $von > 0 && $bis > $von && $bis - $von < 40 * 86400) {
            $liste = $d['ausfaelle'][$h] ?? [];
            if (!in_array([$von, $bis], $liste, true)) {
                $liste[] = [$von, $bis];
            }
            $d['ausfaelle'][$h] = $liste;
        } else {
            return false;
        }
        // Aufräumen: Ausfälle älter als 14 Monate, Seiten, die seit 30 Tagen nicht mehr gemeldet wurden
        foreach ($d['ausfaelle'] as $h => $liste) {
            $d['ausfaelle'][$h] = array_values(array_filter($liste, static fn($a) => $a[1] > $jetzt - 425 * 86400));
            if (!$d['ausfaelle'][$h]) {
                unset($d['ausfaelle'][$h]);
            }
        }
        $d['seiten'] = array_filter($d['seiten'], static fn($s) => $s['zuletzt'] > $jetzt - 30 * 86400);
        return @file_put_contents(ER_FILE, json_encode($d, JSON_PRETTY_PRINT), LOCK_EX) !== false;
    });
    http_response_code($ok ? 200 : 400);
    echo $ok ? '{"ok":true}' : '{"ok":false}';
    exit;
}

$h = er_host((string) ($_GET['seite'] ?? ''));
$monat = (string) ($_GET['monat'] ?? '');
if ($h === '' || !preg_match('/^20\d\d-(0[1-9]|1[0-2])$/', $monat) || !cx_rate_hit('erreichbarkeit-get:' . cx_client_id(), 60, 3600)) {
    http_response_code(400);
    echo '{"ueberwacht":false}';
    exit;
}
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
echo json_encode(['ueberwacht' => $ueberwacht, 'minuten' => (int) round($sekunden / 60), 'ausfaelle' => $anzahl]);
