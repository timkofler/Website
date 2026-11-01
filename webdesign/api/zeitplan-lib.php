<?php
// Tim Kofler – geplante Telegram-Nachrichten an Tims Handy (gleicher Bot wie push-lib.php):
//   Morgen-Nachricht ab 7 Uhr: Termine von heute und morgen, Fristen (Abos, Domains …) rechtzeitig vor Ablauf.
//   Tagesbericht ab 20 Uhr: Besuche von heute, woher, meistgesehene Seiten, Kontakte, neue Anfragen.
//   Tagesbericht und Wochenbericht enthalten, wenn verbunden, auch Klicks und Suchbegriffe aus der Google-Suche (google-suche-lib.php).
//   Wochenbericht Sonntag ab 20 Uhr: Woche gegen Vorwoche, Werbe-Rechner (Kosten pro Anfrage je bezahlter Werbung), beste Werbung.
//   Rekord-Meldung sofort: meiste Besuche bzw. Anfragen an einem Tag.
// Kein Cronjob nötig: ausgelöst von Seitenaufrufen (Besucherzähler), vom Admin und alle 5 Minuten vom Seiten-Wächter
// bei GitHub (api/zeitplan.php). Jede Nachricht höchstens einmal pro Tag. Nur Zahlen, keine Namen von Besuchern oder Interessenten.
// Termine und Fristen: im Admin unter Werbung → Termine und Fristen, oder von Claude über api/melden.php (aktion=termin).
// Daten: api/_data/termine.json (per .htaccess gesperrt, nicht im Repo).

declare(strict_types=1);

require_once __DIR__ . '/admin-lib.php';
require_once __DIR__ . '/push-lib.php';
require_once __DIR__ . '/google-suche-lib.php';

const TP_FILE = CX_DATA . '/termine.json';
const TP_MORGEN_AB = 7;
const TP_ABEND_AB = 20;
// An diesen Tagen vor Ablauf kommt eine Frist in die Morgen-Nachricht (0 = heute).
const TP_FRIST_TAGE = [30, 14, 7, 3, 1, 0];
const TP_WDH = ['' => 'einmal', 'monat' => 'jeden Monat', 'jahr' => 'jedes Jahr'];
const TP_WOCHENTAGE = ['', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

// ---------------- Termine und Fristen ----------------
// Eintrag: id, art (termin|frist), datum (JJJJ-MM-TT), zeit (HH:MM oder leer), text, wdh ('' | monat | jahr)

function tp_termine(): array
{
    $d = is_file(TP_FILE) ? json_decode((string) file_get_contents(TP_FILE), true) : [];
    return is_array($d) ? array_values(array_filter($d, 'is_array')) : [];
}

function tp_termine_save(array $liste): bool
{
    // Einmalige Einträge, die länger als 7 Tage vorbei sind, fallen weg.
    $grenze = date('Y-m-d', strtotime('-7 days'));
    $liste = array_values(array_filter($liste, static fn($t) => ($t['wdh'] ?? '') !== '' || (string) ($t['datum'] ?? '') >= $grenze));
    usort($liste, static fn($a, $b) => strcmp(tp_naechster($a) . ($a['zeit'] ?? ''), tp_naechster($b) . ($b['zeit'] ?? '')));
    return @file_put_contents(TP_FILE, json_encode($liste, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX) !== false;
}

// Eintrag prüfen und anlegen. Gibt eine Fehlermeldung zurück oder '' wenn gespeichert.
function tp_termin_neu(string $art, string $datum, string $zeit, string $text, string $wdh): string
{
    $art = $art === 'frist' ? 'frist' : 'termin';
    $text = trim(preg_replace('/\s+/u', ' ', $text) ?? '');
    $zeit = trim($zeit);
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $datum) || !checkdate((int) substr($datum, 5, 2), (int) substr($datum, 8, 2), (int) substr($datum, 0, 4))) {
        return 'Datum fehlt oder ist ungültig (JJJJ-MM-TT).';
    }
    if ($zeit !== '' && !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $zeit)) {
        return 'Uhrzeit bitte als HH:MM.';
    }
    if ($text === '' || mb_strlen($text) > 160) {
        return 'Text fehlt oder ist länger als 160 Zeichen.';
    }
    if (!isset(TP_WDH[$wdh])) {
        return 'Wiederholung: leer, monat oder jahr.';
    }
    return (string) cx_locked(TP_FILE . '.lock', static function () use ($art, $datum, $zeit, $text, $wdh) {
        $liste = tp_termine();
        if (count($liste) >= 300) {
            return 'Zu viele Einträge.';
        }
        foreach ($liste as $t) {
            if (($t['datum'] ?? '') === $datum && ($t['text'] ?? '') === $text) {
                return '';
            }
        }
        $liste[] = ['id' => bin2hex(random_bytes(5)), 'art' => $art, 'datum' => $datum, 'zeit' => $zeit, 'text' => $text, 'wdh' => $wdh];
        return tp_termine_save($liste) ? '' : 'Konnte nicht speichern.';
    });
}

function tp_termin_weg(string $id): bool
{
    return (bool) cx_locked(TP_FILE . '.lock', static function () use ($id) {
        $liste = tp_termine();
        $neu = array_values(array_filter($liste, static fn($t) => ($t['id'] ?? '') !== $id));
        return count($neu) < count($liste) && tp_termine_save($neu);
    });
}

// Nächstes Datum ab $ab (Wiederholung jeden Monat/jedes Jahr; der 31. wird in kurzen Monaten zum Monatsletzten).
function tp_naechster(array $t, string $ab = ''): string
{
    $ab = $ab !== '' ? $ab : date('Y-m-d');
    $d = (string) ($t['datum'] ?? '');
    $wdh = (string) ($t['wdh'] ?? '');
    if ($wdh === '' || $d >= $ab) {
        return $d;
    }
    $tag = (int) substr($d, 8, 2);
    [$y, $m] = [(int) substr($ab, 0, 4), (int) substr($ab, 5, 2)];
    if ($wdh === 'jahr') {
        $m = (int) substr($d, 5, 2);
    }
    while (true) {
        $kandidat = sprintf('%04d-%02d-%02d', $y, $m, min($tag, (int) date('t', mktime(0, 0, 0, $m, 1, $y))));
        if ($kandidat >= $ab) {
            return $kandidat;
        }
        if ($wdh === 'jahr' || $m === 12) {
            $y++;
        }
        $m = $wdh === 'jahr' ? $m : ($m % 12) + 1;
    }
}

function tp_tage_bis(string $datum, string $heute = ''): int
{
    $heute = $heute !== '' ? $heute : date('Y-m-d');
    return (int) round((strtotime($datum . ' 12:00') - strtotime($heute . ' 12:00')) / 86400);
}

function tp_datum_kurz(string $datum): string
{
    return TP_WOCHENTAGE[(int) date('N', strtotime($datum))] . ' ' . date('d.m.', strtotime($datum));
}

// ---------------- Morgen-Nachricht ----------------

function tp_morgen_text(string $heute = ''): string
{
    $heute = $heute !== '' ? $heute : date('Y-m-d');
    $morgen = date('Y-m-d', strtotime($heute . ' +1 day'));
    $zeilen = ['heute' => [], 'morgen' => [], 'frist' => []];
    foreach (tp_termine() as $t) {
        $n = tp_naechster($t, $heute);
        $text = (string) ($t['text'] ?? '');
        $zeit = (string) ($t['zeit'] ?? '');
        if (($t['art'] ?? '') === 'frist') {
            $tage = tp_tage_bis($n, $heute);
            if (in_array($tage, TP_FRIST_TAGE, true)) {
                $zeilen['frist'][] = '• ' . cx_h($text) . ': <b>' . ($tage === 0 ? 'heute' : ($tage === 1 ? 'morgen' : 'in ' . $tage . ' Tagen')) . '</b> <i>(' . tp_datum_kurz($n) . ')</i>';
            }
        } elseif ($n === $heute || $n === $morgen) {
            $zeilen[$n === $heute ? 'heute' : 'morgen'][] = '• ' . ($zeit !== '' ? '<b>' . $zeit . '</b>  ' : '') . cx_h($text);
        }
    }
    if (!$zeilen['heute'] && !$zeilen['frist']) {
        return '';
    }
    $out = '☀️ <b>Guten Morgen!</b> · ' . tp_datum_kurz($heute);
    $out .= $zeilen['heute'] ? "\n\n📅 <b>Heute</b>\n" . implode("\n", $zeilen['heute']) : "\n\n📅 Heute keine Termine.";
    $out .= $zeilen['morgen'] ? "\n\n🗓️ <b>Morgen</b>\n" . implode("\n", $zeilen['morgen']) : '';
    $out .= $zeilen['frist'] ? "\n\n⏳ <b>Läuft ab</b>\n" . implode("\n", $zeilen['frist']) : '';
    return $out;
}

// ---------------- Tagesbericht ----------------

// Schöne Namen für Seiten und Herkunft im Tagesbericht; Unbekanntes wird aus dem Pfad bzw. der Kennung gebaut.
const TP_SEITEN = ['/' => 'Startseite', '/entwurf/' => 'Gratis-Entwurf', '/check/' => 'Webseiten-Check', '/verein/' => 'Vereine',
    '/gruender/' => 'Gründer', '/beispiele/' => 'Beispiele', '/ablauf/' => 'Ablauf', '/web-apps/' => 'Web-Apps', '/webseite/' => 'Webseite',
    '/webseite-erneuern/' => 'Webseite erneuern', '/webseite-guenstig-erstellen/' => 'Günstige Webseite', '/webseite-erstellen-lassen/' => 'Webseite erstellen lassen', '/sicherheit/' => 'Sicherheit',
    '/newsletter/' => 'Newsletter', '/impressum/' => 'Impressum', '/datenschutz/' => 'Datenschutz'];
const TP_QUELLEN = ['instagram-ads' => 'Instagram-Werbung', 'instagram-story' => 'Instagram-Story', 'instagram' => 'Instagram', 'whatsapp' => 'WhatsApp',
    'telegram' => 'Telegram', 'linkedin' => 'LinkedIn', 'youtube' => 'YouTube', 'facebook' => 'Facebook', 'tiktok' => 'TikTok', 'chatgpt' => 'ChatGPT',
    'google-anzeige' => 'Google-Anzeige', 'google (suche)' => 'Google-Suche', 'direkt' => 'Direkt', 'brief' => 'Brief-QR', 'flyer' => 'Flyer', 'auto' => 'Autowerbung'];

function tp_wort(string $s): string
{
    return mb_strtoupper(mb_substr($s, 0, 1)) . mb_substr(str_replace('-', ' ', $s), 1);
}

function tp_seite_name(string $p): string
{
    if (isset(TP_SEITEN[$p])) {
        return TP_SEITEN[$p];
    }
    $teile = explode('/', trim($p, '/'));
    $letzt = tp_wort((string) end($teile));
    return match ($teile[0]) {
        'beispiele' => 'Beispiel ' . $letzt,
        'webseite' => 'Webseite ' . $letzt,
        default => $letzt,
    };
}

function tp_quelle_name(string $q): string
{
    return TP_QUELLEN[$q] ?? (strpos($q, '.') !== false ? $q : tp_wort(af_quelle_name($q)));
}

// Liste als Zeilen „• Name  Zahl“ (HTML, für Telegram mit parse_mode HTML).
function tp_liste(array $m, int $n, callable $name, array $extra = []): string
{
    $out = [];
    foreach (array_slice($m, 0, $n, true) as $k => $v) {
        if ((int) $v > 0) {
            $out[] = '• ' . cx_h($name((string) $k)) . '  <b>' . (int) $v . '</b>' . (isset($extra[$k]) ? ' <i>(' . cx_h($extra[$k]) . ')</i>' : '');
        }
    }
    return implode("\n", $out);
}

function tp_bericht_text(): string
{
    $heute = date('Y-m-d');
    $z = zl_range(8);
    $tag = zl_range(1);
    $vorwoche = (int) ($z['tage'][date('Y-m-d', strtotime('-7 days'))]['besuche'] ?? 0);
    $neu = [];
    foreach (af_all() as $d) {
        if (substr((string) ($d['zeit'] ?? ''), 0, 10) === $heute && !af_versteckt($d)) {
            $art = AF_ARTEN[$d['art'] ?? 'anfrage'] ?? 'Anfrage';
            $neu[$art] = ($neu[$art] ?? 0) + 1;
        }
    }
    // Stärkste Kampagne je Herkunft (utm_campaign), kommt in Klammern hinter die Quelle
    $kampagne = [];
    foreach ($tag['kampagnen'] as $k => $n) {
        [$q, $c] = array_pad(explode(' / ', (string) $k, 2), 2, '');
        if ($c !== '' && !isset($kampagne[$q])) {
            $kampagne[$q] = '„' . $c . '“';
        }
    }
    $kontaktNamen = ['whatsapp' => 'WhatsApp', 'telegram' => 'Telegram', 'telefon' => 'Anruf', 'email' => 'E-Mail', 'formular' => 'Formular', 'rueckruf' => 'Rückruf'];
    $wt = TP_WOCHENTAGE[(int) date('N')];
    $vergleich = $vorwoche > 0
        ? ($tag['besuche'] >= $vorwoche ? '↗️ ' : '↘️ ') . abs((int) round(($tag['besuche'] - $vorwoche) / $vorwoche * 100)) . ' % ' . ($tag['besuche'] >= $vorwoche ? 'mehr' : 'weniger') . ' als ' . $wt . ' letzte Woche (' . $vorwoche . ')'
        : $wt . ' letzte Woche: keine Besuche';
    $zeilen = [
        '📊 <b>Dein Tag</b> · ' . tp_datum_kurz($heute),
        '',
        '👥 <b>' . $tag['besuche'] . ' Besuche</b> · ' . $tag['aufrufe'] . ' Seitenaufrufe',
        $vergleich,
    ];
    if ($tag['besuche'] > 0) {
        $zeilen[] = "\n📍 <b>Woher</b>\n" . tp_liste($tag['quellen'], 5, 'tp_quelle_name', $kampagne);
        $zeilen[] = "\n📄 <b>Meistgesehen</b>\n" . tp_liste($tag['seiten'], 3, 'tp_seite_name');
    }
    $kontakte = array_sum($tag['kontakte']);
    $kNamen = [];
    foreach ($tag['kontakte'] as $k => $n) {
        $kNamen[] = ((int) $n > 1 ? (int) $n . '× ' : '') . ($kontaktNamen[$k] ?? $k);
    }
    $arten = [];
    foreach ($neu as $a => $n) {
        $arten[] = ($n > 1 ? $n . '× ' : '') . $a;
    }
    $zeilen[] = '';
    $zeilen[] = '💬 <b>Kontakte</b>  ' . $kontakte . ($kNamen ? ' <i>(' . cx_h(implode(', ', $kNamen)) . ')</i>' : '');
    $zeilen[] = '📥 <b>Neue Anfragen</b>  ' . array_sum($neu) . ($arten ? ' <i>(' . cx_h(implode(', ', $arten)) . ')</i>' : '');
    // Google-Suche (nur wenn im Admin verbunden; Zahlen kommen von Google mit ca. 2 Tagen Verspätung)
    $google = gs_tag_text($heute);
    if ($google !== '') {
        $zeilen[] = $google;
    }
    return implode("\n", $zeilen);
}

// ---------------- Wochenbericht (Sonntagabend) ----------------

// Alle gezählten Tage: Tag => Summen (ohne Tests), über alle Monatsdateien.
function tp_alle_tage(): array
{
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }
    $cache = [];
    foreach (glob(ZL_DIR . '/[0-9][0-9][0-9][0-9]-[0-9][0-9].json') ?: [] as $f) {
        foreach ((array) json_decode((string) file_get_contents($f), true) as $day => $d) {
            if (is_array($d) && preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $day)) {
                $cache[(string) $day] = zl_ohne_tests((string) $day, $d);
            }
        }
    }
    ksort($cache);
    return $cache;
}

// Summen für die Tage $von bis $bis (einschließlich).
function tp_summe(string $von, string $bis): array
{
    $sum = ['besuche' => 0, 'aufrufe' => 0, 'seiten' => [], 'quellen' => [], 'kampagnen' => [], 'kontakte' => []];
    foreach (tp_alle_tage() as $day => $d) {
        if ($day < $von || $day > $bis) {
            continue;
        }
        $sum['besuche'] += (int) ($d['besuche'] ?? 0);
        $sum['aufrufe'] += (int) ($d['aufrufe'] ?? 0);
        foreach (['seiten', 'quellen', 'kampagnen', 'kontakte'] as $k) {
            foreach ((array) ($d[$k] ?? []) as $key => $n) {
                $sum[$k][(string) $key] = ($sum[$k][(string) $key] ?? 0) + (int) $n;
            }
        }
    }
    foreach (['seiten', 'quellen', 'kampagnen', 'kontakte'] as $k) {
        arsort($sum[$k]);
    }
    return $sum;
}

// Anfragen (alle Arten, ohne unbestätigte alte) zwischen $von und $bis, mit Quelle.
function tp_anfragen(string $von, string $bis): array
{
    $out = ['n' => 0, 'arten' => [], 'quellen' => []];
    foreach (af_all() as $d) {
        $t = substr((string) ($d['zeit'] ?? ''), 0, 10);
        if ($t < $von || $t > $bis || af_versteckt($d)) {
            continue;
        }
        $out['n']++;
        $art = AF_ARTEN[$d['art'] ?? 'anfrage'] ?? 'Anfrage';
        $out['arten'][$art] = ($out['arten'][$art] ?? 0) + 1;
        $q = af_quelle((string) ($d['quelle'] ?? ''));
        $out['quellen'][$q] = ($out['quellen'][$q] ?? 0) + 1;
    }
    return $out;
}

function tp_prozent(int $jetzt, int $vorher): string
{
    if ($vorher <= 0) {
        return '';
    }
    $p = (int) round(($jetzt - $vorher) / $vorher * 100);
    return ' ' . ($p >= 0 ? '↗️ +' : '↘️ ') . $p . ' %';
}

// Werbe-Rechner: bezahlte Werbung (laufende Werbung mit Tagesbudget) im Zeitraum, je Quelle Besuche, Anfragen, Kosten.
function tp_werbung(string $von, string $bis, array $summe, array $anfragen): array
{
    $out = [];
    foreach (af_werbung() as $w) {
        $c = af_werbung_cent($w, $von, $bis);
        $q = (string) ($w['quelle'] ?? '');
        if ($c <= 0 || $q === '') {
            continue;
        }
        $out[$q] ??= ['cent' => 0, 'besuche' => (int) ($summe['quellen'][$q] ?? 0), 'anfragen' => (int) ($anfragen['quellen'][$q] ?? 0)];
        $out[$q]['cent'] += $c;
    }
    return $out;
}

function tp_woche_text(string $bis = ''): string
{
    $bis = $bis !== '' ? $bis : date('Y-m-d');
    $von = date('Y-m-d', strtotime($bis . ' -6 days'));
    $vBis = date('Y-m-d', strtotime($bis . ' -7 days'));
    $vVon = date('Y-m-d', strtotime($bis . ' -13 days'));
    $w = tp_summe($von, $bis);
    $v = tp_summe($vVon, $vBis);
    $a = tp_anfragen($von, $bis);
    $va = tp_anfragen($vVon, $vBis);
    $kontakte = array_sum($w['kontakte']);
    $vKontakte = array_sum($v['kontakte']);

    // Rekordwoche? Alle früheren 7-Tage-Wochen mit gleichem Wochentag als Ende vergleichen.
    $rekord = $w['besuche'] > 0;
    $tage = tp_alle_tage();
    $erster = (string) (array_key_first($tage) ?? $von);
    for ($ende = $vBis; $ende >= $erster && $rekord; $ende = date('Y-m-d', strtotime($ende . ' -7 days'))) {
        $rekord = tp_summe(date('Y-m-d', strtotime($ende . ' -6 days')), $ende)['besuche'] < $w['besuche'];
    }

    $zeilen = [
        '📈 <b>Deine Woche</b> · ' . date('d.m.', strtotime($von)) . '–' . date('d.m.', strtotime($bis)) . ($rekord && $v['besuche'] > 0 ? "\n🏆 <b>Rekordwoche!</b>" : ''),
        '',
        '👥 <b>' . $w['besuche'] . ' Besuche</b> <i>(Vorwoche ' . $v['besuche'] . ')</i>' . tp_prozent($w['besuche'], $v['besuche']),
        '📥 <b>' . $a['n'] . ($a['n'] === 1 ? ' Anfrage' : ' Anfragen') . '</b> <i>(Vorwoche ' . $va['n'] . ')</i>',
    ];
    if ($a['arten']) {
        $arten = [];
        foreach ($a['arten'] as $art => $n) {
            $arten[] = ($n > 1 ? $n . '× ' : '') . $art;
        }
        $zeilen[] = '      ' . cx_h(implode(', ', $arten));
    }
    $zeilen[] = '💬 <b>' . $kontakte . ' Kontakte</b> <i>(Vorwoche ' . $vKontakte . ')</i>';

    // Werbe-Rechner: was hat jede Anfrage aus bezahlter Werbung gekostet?
    $werbung = tp_werbung($von, $bis, $w, $a);
    if ($werbung) {
        $zeilen[] = "\n💶 <b>Werbung diese Woche</b>";
        $beste = '';
        $besteWert = PHP_INT_MAX;
        foreach ($werbung as $q => $x) {
            $pro = $x['anfragen'] > 0 ? (int) round($x['cent'] / $x['anfragen']) : null;
            $zeilen[] = '• ' . cx_h(tp_quelle_name($q)) . ' · ' . af_euro($x['cent']) . "\n   " . $x['besuche'] . ' Besuche · ' . $x['anfragen'] . ($x['anfragen'] === 1 ? ' Anfrage' : ' Anfragen')
                . "\n   → " . ($pro !== null ? '<b>' . af_euro($pro) . ' pro Anfrage</b>' : ($x['besuche'] > 0 ? af_euro((int) round($x['cent'] / $x['besuche'])) . ' pro Besuch, noch keine Anfrage' : 'noch keine Besuche'));
            // Beste Werbung: günstigste Anfrage, sonst günstigster Besuch (Anfragen zählen immer vor Besuchen)
            $wert = $pro !== null ? $pro : ($x['besuche'] > 0 ? 1_000_000 + (int) round($x['cent'] / $x['besuche']) : PHP_INT_MAX);
            if ($wert < $besteWert) {
                [$beste, $besteWert] = [$q, $wert];
            }
        }
        if ($beste !== '' && count($werbung) > 1) {
            $zeilen[] = '🏅 Am besten lief: <b>' . cx_h(tp_quelle_name($beste)) . '</b>';
        }
    }
    if ($w['besuche'] > 0) {
        $kampagne = [];
        foreach ($w['kampagnen'] as $k => $n) {
            [$q, $c] = array_pad(explode(' / ', (string) $k, 2), 2, '');
            if ($c !== '' && !isset($kampagne[$q])) {
                $kampagne[$q] = '„' . $c . '“';
            }
        }
        $zeilen[] = "\n📍 <b>Woher</b>\n" . tp_liste($w['quellen'], 5, 'tp_quelle_name', $kampagne);
        $zeilen[] = "\n📄 <b>Meistgesehen</b>\n" . tp_liste($w['seiten'], 3, 'tp_seite_name');
    }
    $google = gs_woche_text($bis);
    if ($google !== '') {
        $zeilen[] = $google;
    }
    return implode("\n", $zeilen);
}

// ---------------- Rekorde ----------------
// Meiste Besuche und meiste Anfragen an einem Tag. Sobald heute der bisherige Rekord fällt: eine 🎉-Nachricht (je Rekord einmal am Tag).
const TP_REKORD_AB = ['besuche' => 5, 'anfragen' => 1];

function tp_rekord_text(string $was, int $neu, int $alt, string $altTag): string
{
    $wort = $was === 'besuche' ? 'Besuche' : 'Anfragen';
    return '🎉 <b>Neuer Rekord!</b>' . "\n" . 'Heute schon <b>' . $neu . ' ' . $wort . '</b> an einem Tag.' . "\n" . '<i>Bisher: ' . $alt . ($altTag !== '' ? ' am ' . date('d.m.', strtotime($altTag)) : '') . '</i>';
}

function tp_rekord_check(): void
{
    $heute = date('Y-m-d');
    $nachrichten = cx_locked(AD_FILE . '.rekord.lock', static function () use ($heute) {
        $s = ad_settings();
        if (time() - (int) ($s['tp_rekord_zeit'] ?? 0) < 240) {
            return [];
        }
        $jetzt = ['besuche' => (int) (tp_alle_tage()[$heute]['besuche'] ?? 0), 'anfragen' => tp_anfragen($heute, $heute)['n']];
        $rek = is_array($s['rekord'] ?? null) ? $s['rekord'] : [];
        $raus = [];
        foreach ($jetzt as $was => $n) {
            if (!isset($rek[$was])) {
                // Erster Lauf: bisherigen Rekord aus den alten Tagen holen (ohne heute)
                $best = ['n' => 0, 'tag' => ''];
                if ($was === 'besuche') {
                    foreach (tp_alle_tage() as $day => $d) {
                        if ($day < $heute && (int) ($d['besuche'] ?? 0) > $best['n']) {
                            $best = ['n' => (int) $d['besuche'], 'tag' => $day];
                        }
                    }
                } else {
                    $proTag = [];
                    foreach (af_all() as $d) {
                        $t = substr((string) ($d['zeit'] ?? ''), 0, 10);
                        if ($t !== '' && $t < $heute && !af_versteckt($d)) {
                            $proTag[$t] = ($proTag[$t] ?? 0) + 1;
                        }
                    }
                    arsort($proTag);
                    $best = ['n' => (int) (reset($proTag) ?: 0), 'tag' => (string) (array_key_first($proTag) ?? '')];
                }
                $rek[$was] = $best + ['gemeldet' => ''];
            }
            if ($n > (int) $rek[$was]['n']) {
                if ($rek[$was]['tag'] !== $heute && $rek[$was]['gemeldet'] !== $heute && (int) $rek[$was]['n'] >= TP_REKORD_AB[$was]) {
                    $raus[] = tp_rekord_text($was, $n, (int) $rek[$was]['n'], (string) $rek[$was]['tag']);
                    $rek[$was]['gemeldet'] = $heute;
                }
                $rek[$was]['n'] = $n;
                $rek[$was]['tag'] = $heute;
            }
        }
        $s['rekord'] = $rek;
        $s['tp_rekord_zeit'] = time();
        @file_put_contents(AD_FILE, json_encode($s, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
        return $raus;
    });
    foreach ((array) $nachrichten as $text) {
        pu_send($text, '/kunden/admin/#besucher', false, true);
    }
}

// ---------------- Versand ----------------

function tp_morgen_send(bool $test = false): bool
{
    $text = tp_morgen_text();
    if ($text === '' && $test) {
        $text = '☀️ Test: Heute stehen keine Termine an und keine Frist läuft bald ab. Dann kommt morgens auch keine Nachricht.';
    }
    return $text !== '' && pu_send(($test ? '<i>(Test)</i> ' : '') . $text, '/kunden/admin/#werbung', $test, true);
}

function tp_woche_send(bool $test = false): bool
{
    return pu_send(($test ? '<i>(Test)</i> ' : '') . tp_woche_text(), '/kunden/admin/#werbung', $test, true);
}

function tp_bericht_send(bool $test = false): bool
{
    return pu_send(($test ? '<i>(Test)</i> ' : '') . tp_bericht_text(), '/kunden/admin/#besucher', $test, true);
}

// Fällige Nachrichten schicken, jede höchstens einmal pro Tag (unter Sperre, damit zwei gleichzeitige Aufrufe nicht doppelt schicken).
function tp_maybe(): void
{
    if (!pu_ready()) {
        return;
    }
    $s = ad_settings();
    $heute = date('Y-m-d');
    $stunde = (int) date('G');
    $faellig = [];
    if (!empty($s['tp_morgen']) && $stunde >= TP_MORGEN_AB && $stunde < 12 && ($s['tp_morgen_tag'] ?? '') !== $heute) {
        $faellig[] = 'tp_morgen_tag';
    }
    if (!empty($s['tp_abend']) && $stunde >= TP_ABEND_AB && ($s['tp_abend_tag'] ?? '') !== $heute) {
        $faellig[] = 'tp_abend_tag';
    }
    // Wochenbericht am Sonntag, gleich nach dem Tagesbericht
    if (!empty($s['tp_woche']) && (int) date('N') === 7 && $stunde >= TP_ABEND_AB && ($s['tp_woche_tag'] ?? '') !== $heute) {
        $faellig[] = 'tp_woche_tag';
    }
    foreach ($faellig as $key) {
        $go = cx_locked(AD_FILE . '.lock', static function () use ($key, $heute) {
            $d = ad_settings();
            if (($d[$key] ?? '') === $heute) {
                return false;
            }
            $d[$key] = $heute;
            @file_put_contents(AD_FILE, json_encode($d, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
            return true;
        });
        if ($go) {
            match ($key) {
                'tp_morgen_tag' => tp_morgen_send(),
                'tp_abend_tag' => tp_bericht_send(),
                default => tp_woche_send(),
            };
        }
    }
    if (!empty($s['tp_rekord'])) {
        tp_rekord_check();
    }
}
