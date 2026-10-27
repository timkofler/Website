<?php
// Tim Kofler – Wochenbericht per E-Mail an Tim, jeden Montag ab 7 Uhr für die Woche davor (Mo–So).
// Kein Cronjob nötig: Der erste Seitenaufruf ab Montag 7 Uhr (Besucherzähler) oder das Öffnen des Admins verschickt ihn,
// einmal pro Woche. Nur Zahlen, keine Namen. Im Admin unter Werbung → Benachrichtigungen ein- und ausschaltbar.

declare(strict_types=1);

require_once __DIR__ . '/admin-lib.php';

// Tagessummen des Besucherzählers zwischen zwei Tagen (einschließlich).
function wb_tage(string $von, string $bis): array
{
    $sum = ['besuche' => 0, 'aufrufe' => 0, 'quellen' => [], 'kampagnen' => [], 'kontakte' => []];
    $months = [];
    for ($t = strtotime($von); $t <= strtotime($bis); $t += 86400) {
        $day = date('Y-m-d', $t);
        $m = substr($day, 0, 7);
        if (!isset($months[$m])) {
            $f = ZL_DIR . '/' . $m . '.json';
            $months[$m] = is_file($f) ? (array) json_decode((string) file_get_contents($f), true) : [];
        }
        $d = zl_ohne_tests($day, is_array($months[$m][$day] ?? null) ? $months[$m][$day] : []);
        $sum['besuche'] += (int) ($d['besuche'] ?? 0);
        $sum['aufrufe'] += (int) ($d['aufrufe'] ?? 0);
        foreach (['quellen', 'kampagnen', 'kontakte'] as $k) {
            foreach ((array) ($d[$k] ?? []) as $key => $n) {
                $sum[$k][$key] = ($sum[$k][$key] ?? 0) + (int) $n;
            }
        }
    }
    foreach (['quellen', 'kampagnen', 'kontakte'] as $k) {
        arsort($sum[$k]);
    }
    return $sum;
}

// Inhalt des Berichts für die Woche von $von (Montag) bis $bis (Sonntag).
function wb_html(string $von, string $bis): string
{
    $w = wb_tage($von, $bis);
    $vor = wb_tage(date('Y-m-d', strtotime($von) - 7 * 86400), date('Y-m-d', strtotime($bis) - 7 * 86400));
    $diff = $vor['besuche'] > 0 ? (int) round(($w['besuche'] - $vor['besuche']) / $vor['besuche'] * 100) : null;
    $alle = af_all();
    $neu = ['n' => 0, 'ok' => 0, 'arten' => []];
    $kunden = 0;
    $faellig = 0;
    $heute = date('Y-m-d');
    foreach ($alle as $d) {
        $t = substr((string) ($d['zeit'] ?? ''), 0, 10);
        if ($t >= $von && $t <= $bis && !af_versteckt($d)) {
            $neu['n']++;
            $neu['ok'] += ($d['optin'] ?? '') !== 'offen' ? 1 : 0;
            $art = AF_ARTEN[$d['art'] ?? 'anfrage'] ?? 'Anfrage';
            $neu['arten'][$art] = ($neu['arten'][$art] ?? 0) + 1;
        }
        $g = substr((string) ($d['geaendert'] ?? ''), 0, 10);
        $kunden += ($d['status'] ?? '') === 'kunde' && $g >= $von && $g <= $bis ? 1 : 0;
        $nf = (string) ($d['nachfassen'] ?? '');
        $faellig += $nf !== '' && $nf <= date('Y-m-d', strtotime($heute) + 6 * 86400) && !in_array($d['status'] ?? '', ['kunde', 'abgesagt', 'erledigt'], true) ? 1 : 0;
    }
    $nl = ad_newsletter();
    $row = static fn(string $k, string $v): string => '<tr><td style="padding:6px 12px 6px 0;color:#a1a1a1;vertical-align:top;white-space:nowrap">' . cx_h($k) . '</td><td style="padding:6px 0;color:#f4f4f0">' . $v . '</td></tr>';
    $top = static function (array $m, int $n = 3): string {
        $out = [];
        foreach (array_slice($m, 0, $n, true) as $k => $v) {
            $out[] = cx_h(af_quelle_name((string) $k)) . ' ' . (int) $v;
        }
        return $out ? implode(' · ', $out) : '–';
    };
    $arten = [];
    foreach ($neu['arten'] as $a => $n) {
        $arten[] = $n . '× ' . $a;
    }
    $brief = 0;
    foreach ($w['kampagnen'] as $k => $n) {
        $brief += str_starts_with((string) $k, 'brief / ') ? (int) $n : 0;
    }
    $rows = $row('Besuche', '<b>' . $w['besuche'] . '</b>' . ($diff !== null ? ' (' . ($diff >= 0 ? '+' : '') . $diff . ' % zur Vorwoche)' : ''))
        . $row('Kontaktaufnahmen', (string) array_sum($w['kontakte']))
        . $row('Neue Anfragen', '<b>' . $neu['n'] . '</b>' . ($arten ? ' (' . cx_h(implode(', ', $arten)) . ')' : '') . ($neu['n'] > $neu['ok'] ? ', ' . ($neu['n'] - $neu['ok']) . ' noch nicht bestätigt' : ''))
        . $row('Kunden geworden', (string) $kunden)
        . $row('Woher', $top($w['quellen']))
        . $row('Brief-QR gescannt', (string) $brief)
        . $row('Newsletter', $nl['bestaetigt'] !== null ? $nl['bestaetigt'] . ' Abonnenten' . ($nl['offen'] > 0 ? ', ' . $nl['offen'] . ' Bestätigung offen' : '') : 'noch nicht verbunden')
        . $row('Nachfassen diese Woche', (string) $faellig);
    $titel = 'Deine Woche vom ' . date('d.m.', strtotime($von)) . ' bis ' . date('d.m.', strtotime($bis));
    $inner = cx_mail_table($rows)
        . cx_button(rtrim(cx_brand()['site'], '/') . '/kunden/admin/', 'Im Admin ansehen')
        . '<p style="margin:12px 0 0;font-size:13px;color:#8a8a8a">Kommt jeden Montag. Abschalten im Admin unter Werbung → Benachrichtigungen.</p>';
    return cx_mail_layout($titel, $inner, 'Wochenbericht');
}

// Bericht für die vergangene Woche schicken. $test schickt sofort (Knopf im Admin) und merkt sich die Woche nicht.
function wb_send(bool $test = false): bool
{
    $von = date('Y-m-d', strtotime('monday last week'));
    $bis = date('Y-m-d', strtotime('sunday last week'));
    $c = cx_config();
    $ok = cx_mail((string) ($c['notify_email'] ?? 'office@tim-kofler.at'), 'Tim', ($test ? 'Test: ' : '') . 'Wochenbericht ' . date('d.m.', strtotime($von)) . '–' . date('d.m.', strtotime($bis)), wb_html($von, $bis));
    return $ok;
}

// Einmal pro Woche ab Montag 7 Uhr (oder später in der Woche, falls am Montag niemand die Seite besucht hat).
function wb_maybe(): void
{
    if (!cx_ready()) {
        return;
    }
    $s = ad_settings();
    $woche = date('o-\WW');
    if (empty($s['bericht']) || $s['bericht_woche'] === $woche || ((int) date('N') === 1 && (int) date('G') < 7)) {
        return;
    }
    // Unter Sperre die Woche eintragen, damit zwei gleichzeitige Aufrufe nicht zwei Mails schicken.
    $go = cx_locked(AD_FILE . '.lock', static function () use ($woche) {
        $d = ad_settings();
        if ($d['bericht_woche'] === $woche) {
            return false;
        }
        $d['bericht_woche'] = $woche;
        @file_put_contents(AD_FILE, json_encode($d, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
        return true;
    });
    if ($go) {
        wb_send();
    }
}
