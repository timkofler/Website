<?php
// Tim Kofler – geplante Telegram-Nachrichten an Tims Handy (gleicher Bot wie push-lib.php):
//   Morgen-Nachricht ab 7 Uhr: Termine von heute und morgen, Fristen (Abos, Domains …) rechtzeitig vor Ablauf.
//   Tagesbericht ab 20 Uhr: Besuche von heute, woher, meistgesehene Seiten, Kontakte, neue Anfragen.
// Kein Cronjob nötig: ausgelöst von Seitenaufrufen (Besucherzähler), vom Admin und alle 5 Minuten vom Seiten-Wächter
// bei GitHub (api/zeitplan.php). Jede Nachricht höchstens einmal pro Tag. Nur Zahlen, keine Namen von Besuchern oder Interessenten.
// Termine und Fristen: im Admin unter Werbung → Termine und Fristen, oder von Claude über api/melden.php (aktion=termin).
// Daten: api/_data/termine.json (per .htaccess gesperrt, nicht im Repo).

declare(strict_types=1);

require_once __DIR__ . '/admin-lib.php';
require_once __DIR__ . '/push-lib.php';

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
    '/webseite-erneuern/' => 'Webseite erneuern', '/webseite-erstellen-lassen/' => 'Webseite erstellen lassen', '/sicherheit/' => 'Sicherheit',
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
    return implode("\n", $zeilen);
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
            $key === 'tp_morgen_tag' ? tp_morgen_send() : tp_bericht_send();
        }
    }
}
