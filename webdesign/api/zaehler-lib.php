<?php
// Tim Kofler – anonymer Besucherzähler: nur Summen pro Tag (Seite, Quelle, Kampagne, Art der Kontaktaufnahme).
// Keine Cookies, keine IP-Adresse, keine Kennung pro Besucher. Wird nur per include geladen (per .htaccess gesperrt).
// Daten: api/_data/zaehler/JJJJ-MM.json (per .htaccess gesperrt, nicht im Repo).

declare(strict_types=1);

require_once __DIR__ . '/lib.php';

date_default_timezone_set('Europe/Vienna');

const ZL_DIR = CX_DATA . '/zaehler';
// Höchstens so viele verschiedene Einträge pro Tag und Liste, der Rest landet bei „andere“ (Schutz vor Müll-Einträgen).
const ZL_MAX_KEYS = 150;
// Cookie nur auf Tims eigenem Gerät (im Admin eingeschaltet), damit seine Aufrufe nicht mitgezählt werden.
const ZL_NOCOUNT = 'tk_nicht_zaehlen';

// Bekannte Herkunftsseiten bekommen einen festen Namen, damit z. B. google.at und google.de zusammen zählen.
const ZL_HOSTS = [
    '/(^|\.)google\.[a-z.]+$/' => 'google (suche)',
    '/(^|\.)bing\.com$/' => 'bing',
    '/(^|\.)duckduckgo\.com$/' => 'duckduckgo',
    '/(^|\.)ecosia\.org$/' => 'ecosia',
    '/(^|\.)(chatgpt\.com|openai\.com)$/' => 'chatgpt',
    '/(^|\.)perplexity\.ai$/' => 'perplexity',
    '/(^|\.)(gemini\.google\.com|bard\.google\.com)$/' => 'gemini',
    '/(^|\.)claude\.ai$/' => 'claude',
    '/(^|\.)instagram\.com$/' => 'instagram',
    '/(^|\.)(facebook\.com|fb\.com|messenger\.com)$/' => 'facebook',
    '/(^|\.)pinterest\.[a-z.]+$|(^|\.)pin\.it$/' => 'pinterest',
    '/(^|\.)(youtube\.com|youtu\.be)$/' => 'youtube',
    '/(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/' => 'linkedin',
    '/(^|\.)(t\.co|x\.com|twitter\.com)$/' => 'x',
    '/(^|\.)tiktok\.com$/' => 'tiktok',
    '/(^|\.)whatsapp\.(com|net)$|(^|\.)wa\.me$/' => 'whatsapp',
    '/(^|\.)(t\.me|telegram\.org)$/' => 'telegram',
    '/(^|\.)herold\.at$/' => 'herold',
];

function zl_clean(string $s, int $max): string
{
    $s = strtolower(trim($s));
    $s = str_replace(['ä', 'ö', 'ü', 'ß', ' ', '+', '%20'], ['ae', 'oe', 'ue', 'ss', '-', '-', '-'], $s);
    $s = preg_replace('/[^a-z0-9._-]+/', '', $s) ?? '';
    return substr(trim($s, '.-_'), 0, $max);
}

// Seite nur zählen, wenn es sie wirklich gibt (Ordner mit index.html), sonst könnte jeder beliebige Pfade eintragen.
function zl_page(string $p): string
{
    $p = (string) (parse_url($p, PHP_URL_PATH) ?? '');
    $p = preg_replace('#/index\.html$#', '/', $p) ?? '';
    if ($p !== '' && substr($p, -1) !== '/') {
        $p .= '/';
    }
    if ($p === '/') {
        return '/';
    }
    if (strlen($p) > 80 || !preg_match('#^/([a-z0-9-]+/){1,4}$#', $p) || strpos($p, '/kunden/') === 0) {
        return '';
    }
    return is_file(dirname(__DIR__) . $p . 'index.html') ? $p : '';
}

// Woher kam der Besuch? Google-Anzeige, dann utm_source (eigene Links), dann die verweisende Seite, sonst „direkt“.
function zl_source(bool $gclid, string $utm, string $ref): string
{
    if ($gclid) {
        return 'google-anzeige';
    }
    $u = zl_clean($utm, 30);
    if ($u !== '') {
        return $u;
    }
    $h = strtolower(trim($ref));
    if ($h !== '' && preg_match('/^[a-z0-9.-]{1,120}$/', $h)) {
        $h = preg_replace('/^(www|m|l|lm|mobile)\./', '', $h) ?? $h;
        foreach (ZL_HOSTS as $re => $name) {
            if (preg_match($re, $h)) {
                return $name;
            }
        }
        if ($h === 'tim-kofler.at') {
            return '';
        }
        return substr($h, 0, 40);
    }
    return 'direkt';
}

function zl_bump(array &$map, string $key): void
{
    if (!isset($map[$key]) && count($map) >= ZL_MAX_KEYS) {
        $key = 'andere';
    }
    $map[$key] = (int) ($map[$key] ?? 0) + 1;
}

// Einen Tag der Monatsdatei unter Sperre lesen, ändern und wieder schreiben.
function zl_update(callable $fn): void
{
    $day = date('Y-m-d');
    $file = ZL_DIR . '/' . substr($day, 0, 7) . '.json';
    cx_locked(ZL_DIR . '/.lock', static function () use ($file, $day, $fn) {
        $all = is_file($file) ? json_decode((string) file_get_contents($file), true) : [];
        $all = is_array($all) ? $all : [];
        $d = is_array($all[$day] ?? null) ? $all[$day] : [];
        $d += ['aufrufe' => 0, 'besuche' => 0, 'seiten' => [], 'einstieg' => [], 'quellen' => [], 'kampagnen' => [], 'kontakte' => []];
        $fn($d);
        $all[$day] = $d;
        $tmp = $file . '.tmp';
        if (@file_put_contents($tmp, json_encode($all, JSON_UNESCAPED_SLASHES)) !== false) {
            @rename($tmp, $file);
        }
    });
}

// Ein Aufruf: $entry = true, wenn der Besuch von außen kommt (nicht beim Weiterklicken innerhalb der Seite).
function zl_count(string $page, bool $entry, string $source, string $campaign): void
{
    zl_update(static function (array &$d) use ($page, $entry, $source, $campaign) {
        $d['aufrufe']++;
        zl_bump($d['seiten'], $page);
        if ($entry && $source !== '') {
            $d['besuche']++;
            zl_bump($d['einstieg'], $page);
            zl_bump($d['quellen'], $source);
            if ($campaign !== '') {
                zl_bump($d['kampagnen'], $source . ' / ' . $campaign);
            }
        }
    });
}

// Kontaktaufnahmen: Klicks auf WhatsApp, Telegram, Telefon, E-Mail und abgeschickte Formulare (nur Summen pro Tag).
const ZL_KONTAKTE = ['whatsapp', 'telegram', 'telefon', 'email', 'formular', 'rueckruf'];
// Ab diesem Tag zählen E-Mail-Klicks wieder (vorher waren es nur Klicks auf „Jemanden empfehlen“).
const ZL_EMAIL_AB = '2026-10-25';

// Tims eigene Test-Scans der neuen Brief-QR-Codes (26.10.2026, die Briefe gingen erst am 27.10. zur Post):
// An diesen Tagen sind alle Besuche über „brief / referenz“ und die über „brief / gruender“, die auf einer
// Beispielseite gelandet sind, Tests. Ältere Gründer-Briefe zeigten nur auf /gruender/, die bleiben.
const ZL_TEST_TAGE = ['2026-10-26'];

// Speedtests (Lighthouse) gegen die Live-Seite, die sich als normales Handy/PC ausgaben und als „Direkt“ zählten:
// 27.10.2026 15:59–16:08 je Seite einmal Handy und einmal PC.
const ZL_TEST_DIREKT = [
    '2026-10-27' => ['/' => 2, '/beispiele/' => 2, '/entwurf/' => 2, '/gruender/' => 2, '/verein/' => 2, '/webseite-erneuern/' => 2,
        '/ablauf/' => 2, '/sicherheit/' => 2, '/webseite/' => 2, '/webseite/friseur/' => 2, '/webdesign-melk/' => 2],
];

function zl_minus(array &$map, string $key, int $x): void
{
    if (isset($map[$key])) {
        $map[$key] = (int) $map[$key] - $x;
        if ($map[$key] <= 0) {
            unset($map[$key]);
        }
    }
}

function zl_ohne_speedtests(string $day, array $d): array
{
    foreach (ZL_TEST_DIREKT[$day] ?? [] as $page => $x) {
        $x = min($x, (int) ($d['einstieg'][$page] ?? 0), (int) ($d['quellen']['direkt'] ?? 0));
        if ($x <= 0) {
            continue;
        }
        zl_minus($d['einstieg'], $page, $x);
        zl_minus($d['seiten'], $page, $x);
        zl_minus($d['quellen'], 'direkt', $x);
        $d['besuche'] = max(0, (int) ($d['besuche'] ?? 0) - $x);
        $d['aufrufe'] = max(0, (int) ($d['aufrufe'] ?? 0) - $x);
    }
    return $d;
}

function zl_ohne_tests(string $day, array $d): array
{
    $d = zl_ohne_speedtests($day, $d);
    if (!in_array($day, ZL_TEST_TAGE, true)) {
        return $d;
    }
    $k = (array) ($d['kampagnen'] ?? []);
    $ein = (array) ($d['einstieg'] ?? []);
    $bsp = 0;
    foreach ($ein as $page => $n) {
        if (str_starts_with((string) $page, '/beispiele/')) {
            $bsp += (int) $n;
        }
    }
    $ref = (int) ($k['brief / referenz'] ?? 0);
    $gr = min((int) ($k['brief / gruender'] ?? 0), max(0, $bsp - $ref));
    $n = $ref + $gr;
    if ($n <= 0) {
        return $d;
    }
    zl_minus($d['kampagnen'], 'brief / referenz', $ref);
    zl_minus($d['kampagnen'], 'brief / gruender', $gr);
    zl_minus($d['quellen'], 'brief', $n);
    $d['besuche'] = max(0, (int) ($d['besuche'] ?? 0) - $n);
    $d['aufrufe'] = max(0, (int) ($d['aufrufe'] ?? 0) - $n);
    // Einstiegs- und Seitenzähler der Beispielseiten um die Test-Einstiege kürzen.
    $rest = $n;
    foreach ($ein as $page => $x) {
        if ($rest <= 0 || !str_starts_with((string) $page, '/beispiele/')) {
            continue;
        }
        $y = min((int) $x, $rest);
        zl_minus($d['einstieg'], (string) $page, $y);
        zl_minus($d['seiten'], (string) $page, $y);
        $rest -= $y;
    }
    return $d;
}

function zl_kontakt(string $art): void
{
    if (!in_array($art, ZL_KONTAKTE, true)) {
        return;
    }
    zl_update(static function (array &$d) use ($art) {
        zl_bump($d['kontakte'], $art);
    });
}

// Summen für die letzten $days Tage (heute eingeschlossen), für die Ansicht im Admin.
function zl_range(int $days): array
{
    $out = ['tage' => [], 'aufrufe' => 0, 'besuche' => 0, 'seiten' => [], 'einstieg' => [], 'quellen' => [], 'kampagnen' => [], 'kontakte' => [], 'seit' => ''];
    $months = [];
    $today = new DateTimeImmutable('today');
    for ($i = $days - 1; $i >= 0; $i--) {
        $day = $today->modify("-{$i} days")->format('Y-m-d');
        $m = substr($day, 0, 7);
        if (!isset($months[$m])) {
            $f = ZL_DIR . '/' . $m . '.json';
            $months[$m] = is_file($f) ? (array) json_decode((string) file_get_contents($f), true) : [];
        }
        $d = is_array($months[$m][$day] ?? null) ? $months[$m][$day] : [];
        $d = zl_ohne_tests($day, $d);
        // Stärkste Kampagne des Tages (utm_campaign), für die Markierungen in der Tageskurve
        $kTag = (array) ($d['kampagnen'] ?? []);
        arsort($kTag);
        $out['tage'][$day] = ['aufrufe' => (int) ($d['aufrufe'] ?? 0), 'besuche' => (int) ($d['besuche'] ?? 0),
            'kampagne' => (string) (array_key_first($kTag) ?? ''), 'kampagne_n' => (int) (reset($kTag) ?: 0)];
        $out['aufrufe'] += (int) ($d['aufrufe'] ?? 0);
        $out['besuche'] += (int) ($d['besuche'] ?? 0);
        // Bis einschließlich 24.10.2026 zählte auch der Knopf „Jemanden empfehlen“ als E-Mail (das war nur Tim selbst).
        if ($day < ZL_EMAIL_AB) {
            unset($d['kontakte']['email']);
        }
        foreach (['seiten', 'einstieg', 'quellen', 'kampagnen', 'kontakte'] as $k) {
            foreach ((array) ($d[$k] ?? []) as $key => $n) {
                $out[$k][$key] = ($out[$k][$key] ?? 0) + (int) $n;
            }
        }
    }
    foreach (['seiten', 'einstieg', 'quellen', 'kampagnen', 'kontakte'] as $k) {
        arsort($out[$k]);
    }
    $files = glob(ZL_DIR . '/[0-9][0-9][0-9][0-9]-[0-9][0-9].json') ?: [];
    sort($files);
    if ($files) {
        $first = (array) json_decode((string) file_get_contents($files[0]), true);
        ksort($first);
        $out['seit'] = (string) (array_key_first($first) ?? '');
    }
    return $out;
}
