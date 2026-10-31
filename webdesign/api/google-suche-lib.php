<?php
// Tim Kofler – Zahlen aus der Google-Suche (Search Console) für Tages- und Wochenbericht per Telegram.
// Kein Google-Tag, nichts auf der Seite: Der Server fragt einmal am Tag die Search-Console-API ab (nur lesen).
// Einrichtung: In Google Cloud ein Dienstkonto mit JSON-Schlüssel anlegen, die Search Console API aktivieren,
// das Dienstkonto in Search Console als Nutzer („Eingeschränkt“) hinzufügen, die JSON-Datei im Admin unter
// Werbung → Benachrichtigungen → Google-Suche hochladen. Gespeichert werden nur E-Mail und privater Schlüssel des Dienstkontos
// in api/_data/google-suche.json (per .htaccess gesperrt, nie im Repo).
// Google liefert die Zahlen mit ca. 2 Tagen Verspätung, deshalb zeigt der Bericht immer den letzten Tag mit Daten.

declare(strict_types=1);

require_once __DIR__ . '/lib.php';

const GS_FILE = CX_DATA . '/google-suche.json';
const GS_CACHE = CX_DATA . '/google-suche-cache.json';
const GS_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
// Für Tests überschreibbar (definieren, bevor die Datei geladen wird).
defined('GS_TOKEN_URL') || define('GS_TOKEN_URL', 'https://oauth2.googleapis.com/token');
defined('GS_API') || define('GS_API', 'https://searchconsole.googleapis.com/webmasters/v3');
// Wie lange eine Antwort gilt: frische Tage können sich noch ändern, ältere nicht mehr.
const GS_CACHE_SEK = 3 * 3600;

// ---------------- Schlüssel ----------------

function gs_key(): array
{
    $d = is_file(GS_FILE) ? json_decode((string) file_get_contents(GS_FILE), true) : null;
    return is_array($d) && ($d['client_email'] ?? '') !== '' && ($d['private_key'] ?? '') !== '' ? $d : [];
}

function gs_ready(): bool
{
    return gs_key() !== [];
}

// JSON-Datei des Dienstkontos prüfen und speichern. Gibt [ok, Meldung] zurück.
function gs_key_save(string $json): array
{
    $d = json_decode($json, true);
    if (!is_array($d) || ($d['type'] ?? '') !== 'service_account') {
        return [false, 'Das ist keine Schlüssel-Datei eines Dienstkontos. Bitte die JSON-Datei aus Google Cloud (Dienstkonto → Schlüssel → JSON) nehmen.'];
    }
    $mail = (string) ($d['client_email'] ?? '');
    $pk = (string) ($d['private_key'] ?? '');
    if (!preg_match('/^[a-z0-9._-]+@[a-z0-9.-]+\.iam\.gserviceaccount\.com$/i', $mail) || !function_exists('openssl_pkey_get_private') || !openssl_pkey_get_private($pk)) {
        return [false, 'Die Datei ist unvollständig (E-Mail oder privater Schlüssel fehlt). Bitte in Google Cloud einen neuen JSON-Schlüssel erstellen.'];
    }
    $neu = ['client_email' => $mail, 'private_key' => $pk, 'projekt' => (string) ($d['project_id'] ?? ''), 'seit' => date('c')];
    if (@file_put_contents(GS_FILE, json_encode($neu, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT), LOCK_EX) === false) {
        return [false, 'Konnte nicht gespeichert werden (Schreibrechte im Ordner api/_data prüfen).'];
    }
    @chmod(GS_FILE, 0600);
    @unlink(GS_CACHE);
    return [true, 'Schlüssel gespeichert.'];
}

function gs_key_delete(): void
{
    @unlink(GS_FILE);
    @unlink(GS_CACHE);
}

// ---------------- Zwischenspeicher ----------------

function gs_cache(): array
{
    $d = is_file(GS_CACHE) ? json_decode((string) file_get_contents(GS_CACHE), true) : [];
    return is_array($d) ? $d : [];
}

function gs_cache_set(string $key, $wert): void
{
    $c = gs_cache();
    $c[$key] = ['zeit' => time(), 'wert' => $wert];
    // Alte Einträge (älter als 3 Tage) wegräumen, damit die Datei klein bleibt
    foreach ($c as $k => $v) {
        if ((int) ($v['zeit'] ?? 0) < time() - 3 * 86400) {
            unset($c[$k]);
        }
    }
    @file_put_contents(GS_CACHE, json_encode($c, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
    @chmod(GS_CACHE, 0600);
}

function gs_cache_get(string $key, int $maxAlter)
{
    $v = gs_cache()[$key] ?? null;
    return is_array($v) && (int) ($v['zeit'] ?? 0) > time() - $maxAlter ? $v['wert'] : null;
}

// ---------------- Verbindung zu Google ----------------

// Ein Aufruf mit kurzer Wartezeit. Gibt [HTTP-Status, Antwort als Array] zurück.
function gs_http(string $url, string $method = 'GET', ?string $body = null, array $headers = []): array
{
    if (!function_exists('curl_init')) {
        return [0, []];
    }
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method, CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 10, CURLOPT_CONNECTTIMEOUT => 4,
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    $res = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $d = is_string($res) ? json_decode($res, true) : null;
    return [$code, is_array($d) ? $d : []];
}

function gs_b64(string $s): string
{
    return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
}

// Zugangs-Token für eine Stunde (mit dem privaten Schlüssel signierte Anfrage, kein Passwort).
function gs_token(): string
{
    $key = gs_key();
    if ($key === []) {
        return '';
    }
    $t = gs_cache_get('token:' . $key['client_email'], 50 * 60);
    if (is_string($t) && $t !== '') {
        return $t;
    }
    $jetzt = time();
    $kopf = gs_b64((string) json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
    $inhalt = gs_b64((string) json_encode(['iss' => $key['client_email'], 'scope' => GS_SCOPE, 'aud' => GS_TOKEN_URL, 'iat' => $jetzt, 'exp' => $jetzt + 3600], JSON_UNESCAPED_SLASHES));
    $sig = '';
    $pk = openssl_pkey_get_private((string) $key['private_key']);
    if (!$pk || !openssl_sign($kopf . '.' . $inhalt, $sig, $pk, OPENSSL_ALGO_SHA256)) {
        gs_fehler('Schlüssel ungültig');
        return '';
    }
    [$code, $d] = gs_http(GS_TOKEN_URL, 'POST', http_build_query([
        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion' => $kopf . '.' . $inhalt . '.' . gs_b64($sig),
    ]), ['Content-Type: application/x-www-form-urlencoded']);
    $t = (string) ($d['access_token'] ?? '');
    if ($code !== 200 || $t === '') {
        gs_fehler('Anmeldung bei Google fehlgeschlagen (' . $code . ' ' . (string) ($d['error_description'] ?? $d['error'] ?? '') . ')');
        return '';
    }
    gs_cache_set('token:' . $key['client_email'], $t);
    return $t;
}

// Fehler merken (für den Admin) und 30 Minuten lang nicht nochmal bei Google anklopfen.
function gs_fehler(string $text): void
{
    gs_cache_set('fehler', $text);
    gs_cache_set('pause', 1);
    cx_log('Google-Suche: ' . $text);
}

function gs_api(string $pfad, ?array $body = null): array
{
    $t = gs_token();
    if ($t === '') {
        return [0, []];
    }
    return gs_http(GS_API . $pfad, $body === null ? 'GET' : 'POST', $body === null ? null : (string) json_encode($body, JSON_UNESCAPED_SLASHES),
        ['Authorization: Bearer ' . $t, 'Content-Type: application/json']);
}

// Die Search-Console-Property von tim-kofler.at, auf die das Dienstkonto Zugriff hat
// (Domain-Property bevorzugt, sonst https://tim-kofler.at/ o. ä.).
function gs_site(): string
{
    $s = gs_cache_get('site', 86400);
    if (is_string($s) && $s !== '') {
        return $s;
    }
    [$code, $d] = gs_api('/sites');
    if ($code !== 200) {
        gs_fehler($code === 0 ? 'Google nicht erreichbar' : 'Liste der Properties nicht abrufbar (' . $code . ')');
        return '';
    }
    $host = (string) parse_url(cx_brand()['site'], PHP_URL_HOST);
    $host = preg_replace('/^www\./', '', $host !== '' ? $host : 'tim-kofler.at');
    $beste = '';
    foreach ((array) ($d['siteEntry'] ?? []) as $e) {
        $url = (string) ($e['siteUrl'] ?? '');
        if (($e['permissionLevel'] ?? '') === 'siteUnverifiedUser') {
            continue;
        }
        if ($url === 'sc-domain:' . $host) {
            $beste = $url;
            break;
        }
        if ($beste === '' && preg_match('#^https?://(www\.)?' . preg_quote($host, '#') . '/#', $url)) {
            $beste = $url;
        }
    }
    if ($beste === '') {
        gs_fehler('Das Dienstkonto sieht ' . $host . ' noch nicht. In Search Console unter Einstellungen → Nutzer und Berechtigungen hinzufügen.');
        return '';
    }
    gs_cache_set('site', $beste);
    return $beste;
}

// Search-Analytics-Abfrage. $dims z. B. ['date'] oder ['query']. Ergebnis: Zeilen von Google oder null bei Fehler.
function gs_abfrage(string $von, string $bis, array $dims = [], int $zeilen = 10): ?array
{
    $cacheKey = 'q:' . $von . ':' . $bis . ':' . implode(',', $dims) . ':' . $zeilen;
    $c = gs_cache_get($cacheKey, GS_CACHE_SEK);
    if (is_array($c)) {
        return $c;
    }
    if (gs_cache_get('pause', 1800)) {
        return null;
    }
    $site = gs_site();
    if ($site === '') {
        return null;
    }
    [$code, $d] = gs_api('/sites/' . rawurlencode($site) . '/searchAnalytics/query', [
        'startDate' => $von, 'endDate' => $bis, 'dimensions' => $dims, 'rowLimit' => $zeilen, 'dataState' => 'all', 'type' => 'web',
    ]);
    if ($code !== 200) {
        gs_fehler('Abfrage fehlgeschlagen (' . $code . ' ' . (string) ($d['error']['message'] ?? '') . ')');
        return null;
    }
    $rows = [];
    foreach ((array) ($d['rows'] ?? []) as $r) {
        $rows[] = [
            'keys' => array_map('strval', (array) ($r['keys'] ?? [])),
            'klicks' => (int) ($r['clicks'] ?? 0),
            'gezeigt' => (int) ($r['impressions'] ?? 0),
            'platz' => (float) ($r['position'] ?? 0),
        ];
    }
    gs_cache_set($cacheKey, $rows);
    gs_cache_set('fehler', '');
    gs_cache_set('pause', 0);
    gs_cache_set('ok', date('c'));
    return $rows;
}

// Summe über einen Zeitraum: klicks, gezeigt, platz (Durchschnitt gewichtet nach Einblendungen, wie bei Google).
function gs_summe(string $von, string $bis): ?array
{
    $r = gs_abfrage($von, $bis, [], 1);
    if ($r === null) {
        return null;
    }
    $x = $r[0] ?? ['klicks' => 0, 'gezeigt' => 0, 'platz' => 0.0];
    return ['klicks' => $x['klicks'], 'gezeigt' => $x['gezeigt'], 'platz' => $x['platz']];
}

// Der jüngste Tag, für den Google schon Zahlen hat (meist vor 2 Tagen). '' wenn keiner in den letzten 7 Tagen.
function gs_letzter_tag(string $heute = ''): ?string
{
    $heute = $heute !== '' ? $heute : date('Y-m-d');
    $r = gs_abfrage(date('Y-m-d', strtotime($heute . ' -7 days')), $heute, ['date'], 10);
    if ($r === null) {
        return null;
    }
    $tag = '';
    foreach ($r as $z) {
        $d = (string) ($z['keys'][0] ?? '');
        if ($d > $tag && $z['gezeigt'] > 0) {
            $tag = $d;
        }
    }
    return $tag;
}

// ---------------- Texte für Telegram ----------------

function gs_zahl(int $n): string
{
    return number_format($n, 0, ',', '.');
}

function gs_platz(float $p): string
{
    return number_format($p, 1, ',', '');
}

// Top-Suchbegriffe als kurze Zeilen (Google zeigt sehr seltene Suchen aus Datenschutzgründen nicht).
function gs_begriffe(string $von, string $bis, int $n): string
{
    $r = gs_abfrage($von, $bis, ['query'], 25) ?? [];
    usort($r, static fn($a, $b) => [$b['klicks'], $b['gezeigt']] <=> [$a['klicks'], $a['gezeigt']]);
    $out = [];
    foreach (array_slice($r, 0, $n) as $z) {
        $q = (string) ($z['keys'][0] ?? '');
        $q = mb_strlen($q) > 42 ? rtrim(mb_substr($q, 0, 40)) . '…' : $q;
        $out[] = '• „' . cx_h($q) . '“ ' . ($z['klicks'] > 0 ? $z['klicks'] . ' ' . ($z['klicks'] === 1 ? 'Klick' : 'Klicks') : gs_zahl($z['gezeigt']) . '× gezeigt') . ' · Platz ' . gs_platz($z['platz']);
    }
    return implode("\n", $out);
}

// Block für den Tagesbericht. Leer, wenn nicht verbunden.
function gs_tag_text(string $heute = ''): string
{
    if (!gs_ready()) {
        return '';
    }
    $tag = gs_letzter_tag($heute);
    if ($tag === null) {
        return "\n🔎 <b>Google-Suche</b>\n<i>Gerade keine Daten von Google (im Admin unter Benachrichtigungen prüfen).</i>";
    }
    if ($tag === '') {
        return "\n🔎 <b>Google-Suche</b>\n<i>Noch keine Zahlen von Google (nach dem Verbinden kann es ein paar Tage dauern).</i>";
    }
    $s = gs_summe($tag, $tag);
    if ($s === null) {
        return '';
    }
    $wt = ['', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][(int) date('N', strtotime($tag))];
    $zeilen = [
        '',
        '🔎 <b>Google-Suche</b> <i>(' . $wt . ' ' . date('d.m.', strtotime($tag)) . ', neuester Stand von Google)</i>',
        '<b>' . gs_zahl($s['klicks']) . ' ' . ($s['klicks'] === 1 ? 'Klick' : 'Klicks') . '</b> · ' . gs_zahl($s['gezeigt']) . '× gezeigt' . ($s['gezeigt'] > 0 ? ' · Ø Platz ' . gs_platz($s['platz']) : ''),
    ];
    $b = gs_begriffe($tag, $tag, 3);
    if ($b !== '') {
        $zeilen[] = $b;
    }
    return implode("\n", $zeilen);
}

// Block für den Wochenbericht: die letzten 7 Tage mit Daten gegen die 7 Tage davor.
function gs_woche_text(string $heute = ''): string
{
    if (!gs_ready()) {
        return '';
    }
    $bis = gs_letzter_tag($heute);
    if ($bis === null || $bis === '') {
        return '';
    }
    $von = date('Y-m-d', strtotime($bis . ' -6 days'));
    $w = gs_summe($von, $bis);
    $v = gs_summe(date('Y-m-d', strtotime($bis . ' -13 days')), date('Y-m-d', strtotime($bis . ' -7 days')));
    if ($w === null || $v === null) {
        return '';
    }
    $pfeil = static function (int $jetzt, int $vorher): string {
        if ($vorher <= 0) {
            return '';
        }
        $p = (int) round(($jetzt - $vorher) / $vorher * 100);
        return $p === 0 ? ' →' : ($p > 0 ? ' ↗️ +' : ' ↘️ ') . $p . ' %';
    };
    $platz = '';
    if ($w['gezeigt'] > 0) {
        $platz = "\nØ Platz " . gs_platz($w['platz']);
        if ($v['gezeigt'] > 0) {
            $diff = round($v['platz'] - $w['platz'], 1);
            $platz .= ' <i>(Vorwoche ' . gs_platz($v['platz']) . ')</i>' . ($diff >= 0.5 ? ' ↗️ besser' : ($diff <= -0.5 ? ' ↘️ schlechter' : ''));
        }
    }
    $zeilen = [
        '',
        '🔎 <b>Google-Suche</b> <i>(' . date('d.m.', strtotime($von)) . '–' . date('d.m.', strtotime($bis)) . ')</i>',
        '<b>' . gs_zahl($w['klicks']) . ' ' . ($w['klicks'] === 1 ? 'Klick' : 'Klicks') . '</b> <i>(Vorwoche ' . gs_zahl($v['klicks']) . ')</i>' . $pfeil($w['klicks'], $v['klicks']),
        gs_zahl($w['gezeigt']) . '× gezeigt <i>(Vorwoche ' . gs_zahl($v['gezeigt']) . ')</i>' . $pfeil($w['gezeigt'], $v['gezeigt']) . $platz,
    ];
    $b = gs_begriffe($von, $bis, 5);
    if ($b !== '') {
        $zeilen[] = "<b>Gesucht wurde</b>\n" . $b;
    }
    return implode("\n", $zeilen);
}

// Für den Admin: Verbindung prüfen. Gibt [ok, Meldung] zurück.
function gs_test(): array
{
    if (!gs_ready()) {
        return [false, 'Noch kein Schlüssel hochgeladen.'];
    }
    @unlink(GS_CACHE);
    $tag = gs_letzter_tag();
    if ($tag === null) {
        return [false, (string) (gs_cache_get('fehler', 600) ?: 'Google hat nicht geantwortet.')];
    }
    if ($tag === '') {
        return [true, 'Verbunden mit ' . gs_site() . '. Google hat für die letzten 7 Tage noch keine Zahlen.'];
    }
    $s = gs_summe($tag, $tag) ?? ['klicks' => 0, 'gezeigt' => 0];
    return [true, 'Verbunden mit ' . gs_site() . '. Neuester Tag ' . date('d.m.', strtotime($tag)) . ': ' . $s['klicks'] . ' Klicks, ' . $s['gezeigt'] . '× gezeigt.'];
}
