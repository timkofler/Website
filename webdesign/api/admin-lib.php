<?php
// Tim Kofler – Hilfen für den Admin-Bereich (/kunden/admin/): Einstellungen, Antwort-Vorlagen, Newsletter-Zahl,
// Brief-Rücklauf und „Was bringt was“ (Besuche → Anfragen → Kunden je Quelle). Wird nur per include geladen.

declare(strict_types=1);

require_once __DIR__ . '/anfrage-lib.php';
require_once __DIR__ . '/zaehler-lib.php';

const AD_FILE = CX_DATA . '/admin.json';
const AD_VORLAGEN = CX_DATA . '/vorlagen.json';
const AD_NL_CACHE = CX_DATA . '/newsletter-zahl.json';
// Ab diesem Tag zählen die Brief-QR-Codes (Besucherzähler gibt es seit Oktober 2026).
const AD_BRIEF_AB = '2026-10-01';

// Kleine Einstellungen: Briefe verschickt, Wochenbericht an/aus, zuletzt gesendete Woche.
function ad_settings(): array
{
    $d = is_file(AD_FILE) ? json_decode((string) file_get_contents(AD_FILE), true) : [];
    return (is_array($d) ? $d : []) + ['briefe' => 0, 'bericht' => true, 'bericht_woche' => ''];
}

function ad_settings_save(array $patch): bool
{
    return (bool) cx_locked(AD_FILE . '.lock', static function () use ($patch) {
        $d = array_merge(ad_settings(), $patch);
        return @file_put_contents(AD_FILE, json_encode($d, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX) !== false;
    });
}

// ---------------- Antwort-Vorlagen ----------------
// Platzhalter: {hallo} (Hallo Maria, bzw. Hallo,), {name}, {firma}, {paket}, {link} (Entwurf-Link)
const AD_VORLAGEN_START = [
    'danke' => ['titel' => 'Danke für die Anfrage', 'betreff' => 'Deine Anfrage bei Tim Kofler',
        'text' => "{hallo}\n\ndanke für deine Anfrage für {firma}! Ich habe mir deine Angaben angesehen und melde mich mit einem Vorschlag.\n\nDamit ich gleich passend planen kann: Was ist dir bei der neuen Seite am wichtigsten, und hast du schon Logo, Fotos oder Texte?\n\nAm schnellsten erreichst du mich per WhatsApp oder Telegram unter +43 677 61773118.\n\nLiebe Grüße\nTim"],
    'entwurf' => ['titel' => 'Entwurf ist fertig', 'betreff' => 'Dein Entwurf für {firma}',
        'text' => "{hallo}\n\nwie versprochen ist dein kostenloser Entwurf für {firma} fertig. Hier kannst du ihn dir am Handy und am PC ansehen:\n{link}\n\nWenn er dir gefällt, reicht ein Klick auf „Passt“. Änderungswünsche schreibst du mir einfach zurück.\n\nLiebe Grüße\nTim"],
    'nachfassen' => ['titel' => 'Kurz nachfragen', 'betreff' => 'Kurz nachgefragt: {firma}',
        'text' => "{hallo}\n\nich wollte kurz nachfragen, ob du dir meinen Vorschlag für {firma} schon ansehen konntest. Hast du noch Fragen oder Wünsche? Ein kurzes Ja oder Nein reicht mir völlig.\n\nLiebe Grüße\nTim"],
    'angebot' => ['titel' => 'Angebot schicken', 'betreff' => 'Dein Angebot für {firma}',
        'text' => "{hallo}\n\nhier wie versprochen mein Angebot für {firma}:\n\nPaket: {paket}\nPreis: … € (als Kleinunternehmer ohne Umsatzsteuer)\nFertig in etwa: … Wochen\n\nWenn das für dich passt, schreib mir einfach „Passt“, dann lege ich los.\n\nLiebe Grüße\nTim"],
];

function ad_vorlagen(): array
{
    $d = is_file(AD_VORLAGEN) ? json_decode((string) file_get_contents(AD_VORLAGEN), true) : [];
    $out = [];
    foreach (AD_VORLAGEN_START as $k => $v) {
        $out[$k] = is_array($d[$k] ?? null) ? array_merge($v, array_intersect_key($d[$k], $v)) : $v;
    }
    return $out;
}

function ad_vorlagen_save(array $v): bool
{
    return @file_put_contents(AD_VORLAGEN, json_encode($v, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX) !== false;
}

function ad_fill(string $s, array $w): string
{
    $name = trim((string) ($w['name'] ?? ''));
    return strtr($s, [
        '{hallo}' => $name !== '' ? 'Hallo ' . $name . ',' : 'Hallo,',
        '{name}' => $name, '{firma}' => (string) (($w['firma'] ?? '') !== '' ? $w['firma'] : 'deinen Betrieb'),
        '{paket}' => (string) (($w['paket'] ?? '') !== '' ? $w['paket'] : '…'),
        '{link}' => (string) (($w['link'] ?? '') !== '' ? $w['link'] : '(Link folgt)'),
    ]);
}

// WhatsApp-Link aus einer österreichischen Nummer (0664 … wird zu 43664 …).
function ad_wa(string $tel, string $text = ''): string
{
    $tel = preg_replace('/[^0-9+]/', '', $tel) ?? '';
    if (strlen(preg_replace('/\D/', '', $tel) ?? '') < 6) {
        return '';
    }
    $n = ltrim(str_starts_with($tel, '0') && !str_starts_with($tel, '00') ? '43' . substr($tel, 1) : $tel, '+0');
    return 'https://wa.me/' . $n . ($text !== '' ? '?text=' . rawurlencode($text) : '');
}

// Knöpfe „E-Mail“ und „WhatsApp“ je Vorlage für eine Anfrage.
function ad_vorlagen_html(array $w, string $email, string $tel): string
{
    $rows = '';
    foreach (ad_vorlagen() as $v) {
        $betreff = ad_fill((string) $v['betreff'], $w);
        $text = ad_fill((string) $v['text'], $w);
        $mail = $email !== '' ? '<a class="btn btn--sm" href="mailto:' . cx_h($email) . '?subject=' . rawurlencode($betreff) . '&amp;body=' . rawurlencode($text) . '">E-Mail</a>' : '';
        $wa = ad_wa($tel, $text);
        $waBtn = $wa !== '' ? '<a class="btn btn--sm btn--line" href="' . cx_h($wa) . '" target="_blank" rel="noopener">WhatsApp</a>' : '';
        if ($mail === '' && $waBtn === '') {
            continue;
        }
        $rows .= '<li><details class="kp-vl"><summary><b>' . cx_h((string) $v['titel']) . '</b></summary><pre>' . cx_h($text) . '</pre></details><span class="kp-vl__btns">' . $mail . $waBtn . '</span></li>';
    }
    return $rows === '' ? '' : '<div class="kp-card kp-vorlagen"><h2>Antworten mit Vorlage</h2><p class="kp-hint kp-hint--top">Öffnet dein Mailprogramm bzw. WhatsApp mit fertigem Text. Vor dem Senden kannst du alles ändern. Vorlagen bearbeiten: Übersicht → Anfragen, ganz unten.</p><ul class="kp-vl-liste">' . $rows . '</ul></div>';
}

// ---------------- Newsletter ----------------

// Bestätigte Abonnenten laut Brevo-Liste (eine Stunde zwischengespeichert) und offene Bestätigungen der letzten 30 Tage.
function ad_newsletter(bool $frisch = false): array
{
    $c = cx_config();
    $list = (int) ($c['list_newsletter'] ?? 0);
    $cache = is_file(AD_NL_CACHE) ? (array) json_decode((string) file_get_contents(AD_NL_CACHE), true) : [];
    $zahl = null;
    if (!$frisch && (int) ($cache['t'] ?? 0) > time() - 3600 && (int) ($cache['liste'] ?? 0) === $list) {
        $zahl = $cache['zahl'] ?? null;
    } elseif ($list > 0 && !empty($c['brevo_api_key'])) {
        $zahl = ad_brevo_list_count($list);
        if ($zahl !== null) {
            @file_put_contents(AD_NL_CACHE, json_encode(['t' => time(), 'liste' => $list, 'zahl' => $zahl]), LOCK_EX);
        } else {
            $zahl = $cache['zahl'] ?? null;
        }
    }
    // Aus dem Einwilligungs-Protokoll: wer in den letzten 30 Tagen die Bestätigungsmail bekam und nicht geklickt hat.
    $gesendet = [];
    $ok = [];
    $neu30 = 0;
    $file = CX_DATA . '/einwilligungen.log';
    if (is_file($file)) {
        $size = (int) filesize($file);
        $h = @fopen($file, 'r');
        if ($h) {
            if ($size > 2097152) {
                fseek($h, -2097152, SEEK_END);
                fgets($h);
            }
            $ab = date('c', time() - 30 * 86400);
            while (($line = fgets($h)) !== false) {
                $e = json_decode($line, true);
                if (!is_array($e) || (string) ($e['zeit'] ?? '') < $ab) {
                    continue;
                }
                $ev = (string) ($e['ereignis'] ?? '');
                $m = strtolower((string) ($e['email'] ?? ''));
                if (in_array($ev, ['optin_mail_newsletter', 'optin_mail_sicherheit'], true)) {
                    $gesendet[$m] = true;
                } elseif (in_array($ev, ['optin_bestaetigt_newsletter', 'optin_bestaetigt_sicherheit'], true)) {
                    $ok[$m] = true;
                    $neu30++;
                }
            }
            fclose($h);
        }
    }
    return ['bestaetigt' => $zahl, 'offen' => count(array_diff_key($gesendet, $ok)), 'neu30' => $neu30, 'liste' => $list];
}

function ad_brevo_list_count(int $list): ?int
{
    $key = (string) (cx_config()['brevo_api_key'] ?? '');
    $url = (string) (cx_config()['brevo_url'] ?? 'https://api.brevo.com/v3') . '/contacts/lists/' . $list;
    $headers = ['api-key: ' . $key, 'Accept: application/json'];
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_HTTPHEADER => $headers, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 6, CURLOPT_CONNECTTIMEOUT => 3]);
        $res = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    } else {
        $res = @file_get_contents($url, false, stream_context_create(['http' => ['header' => implode("\r\n", $headers), 'timeout' => 6, 'ignore_errors' => true]]));
        $code = is_string($res) ? 200 : 0;
    }
    $d = is_string($res) ? json_decode($res, true) : null;
    if ($code !== 200 || !is_array($d) || !isset($d['totalSubscribers'])) {
        cx_log('Brevo Newsletter-Zahl → ' . $code . ' ' . substr((string) $res, 0, 200));
        return null;
    }
    return (int) $d['totalSubscribers'];
}

// ---------------- Quellen: Besuche → Anfragen → Kunden ----------------

// „Gefunden über“ einer Anfrage auf denselben Schlüssel bringen wie der Besucherzähler (z. B. google.com → google (suche)).
function ad_qkey(string $raw): string
{
    $q = af_quelle($raw);
    if ($q === 'direkt' || $q === 'google-anzeige') {
        return $q;
    }
    if (strpos($q, '.') !== false && preg_match('/^[a-z0-9.-]+$/', $q)) {
        return zl_source(false, '', $q) ?: 'direkt';
    }
    return zl_clean($q, 30) ?: 'direkt';
}

// Je Quelle: Besuche (seit Beginn der Zählung, höchstens 12 Monate), Anfragen, Kunden und eingetragene Kosten.
function ad_trichter(array $anfragen): array
{
    $bz = zl_range(365);
    $kosten = af_kosten();
    $out = [];
    foreach ($bz['quellen'] as $q => $n) {
        $out[(string) $q] = ['besuche' => (int) $n, 'anfragen' => 0, 'kunden' => 0, 'kosten' => null];
    }
    foreach ($anfragen as $d) {
        if (af_versteckt($d)) {
            continue;
        }
        $q = ad_qkey((string) ($d['quelle'] ?? ''));
        $out[$q] ??= ['besuche' => 0, 'anfragen' => 0, 'kunden' => 0, 'kosten' => null];
        $out[$q]['anfragen']++;
        $out[$q]['kunden'] += ($d['status'] ?? '') === 'kunde' ? 1 : 0;
    }
    foreach ($kosten as $q => $cent) {
        $k = ad_qkey((string) $q);
        $out[$k] ??= ['besuche' => 0, 'anfragen' => 0, 'kunden' => 0, 'kosten' => null];
        $out[$k]['kosten'] = (int) ($out[$k]['kosten'] ?? 0) + (int) $cent;
    }
    uasort($out, static fn($a, $b) => [$b['kunden'], $b['anfragen'], $b['besuche']] <=> [$a['kunden'], $a['anfragen'], $a['besuche']]);
    return ['quellen' => $out, 'seit' => $bz['seit']];
}

// ---------------- Brief-Rücklauf ----------------

// Scans der Brief-QR-Codes (utm_source=brief) je Kampagne seit AD_BRIEF_AB und die Anfragen über Briefe.
function ad_brief(array $anfragen): array
{
    $tage = max(1, (int) floor((strtotime('today') - strtotime(AD_BRIEF_AB)) / 86400) + 1);
    $bz = zl_range(min($tage, 365));
    $k = [];
    foreach ($bz['kampagnen'] as $key => $n) {
        if (str_starts_with((string) $key, 'brief / ')) {
            $k[substr((string) $key, 8)] = ['scans' => (int) $n, 'anfragen' => 0, 'kunden' => 0];
        }
    }
    $scans = (int) ($bz['quellen']['brief'] ?? 0);
    $ohne = $scans - array_sum(array_column($k, 'scans'));
    if ($ohne > 0) {
        $k['ohne Kampagne'] = ['scans' => $ohne, 'anfragen' => 0, 'kunden' => 0];
    }
    $anf = 0;
    $kunden = 0;
    foreach ($anfragen as $d) {
        $raw = strtolower(trim((string) ($d['quelle'] ?? '')));
        if (af_quelle($raw) !== 'brief' || af_versteckt($d)) {
            continue;
        }
        $c = zl_clean(trim((string) (explode(' / ', $raw, 2)[1] ?? '')), 40) ?: 'ohne Kampagne';
        $k[$c] ??= ['scans' => 0, 'anfragen' => 0, 'kunden' => 0];
        $k[$c]['anfragen']++;
        $anf++;
        if (($d['status'] ?? '') === 'kunde') {
            $k[$c]['kunden']++;
            $kunden++;
        }
    }
    uasort($k, static fn($a, $b) => [$b['anfragen'], $b['scans']] <=> [$a['anfragen'], $a['scans']]);
    return ['scans' => $scans, 'anfragen' => $anf, 'kunden' => $kunden, 'kampagnen' => $k, 'briefe' => (int) ad_settings()['briefe']];
}

function ad_quote(int $a, int $b): string
{
    return $b > 0 ? number_format($a / $b * 100, 1, ',', '') . ' %' : '–';
}

// Datum aus <input type="date"> (JJJJ-MM-TT) prüfen, sonst leer.
function ad_datum(string $v): string
{
    return preg_match('/^\d{4}-\d{2}-\d{2}$/', $v) && checkdate((int) substr($v, 5, 2), (int) substr($v, 8, 2), (int) substr($v, 0, 4)) ? $v : '';
}

// „heute“, „morgen“, „seit 2 Tagen“ usw. für ein Nachfass-Datum.
function ad_wann(string $datum): string
{
    $t = (int) round((strtotime($datum) - strtotime('today')) / 86400);
    return $t === 0 ? 'heute' : ($t === 1 ? 'morgen' : ($t > 1 ? 'in ' . $t . ' Tagen' : ($t === -1 ? 'seit gestern' : 'seit ' . -$t . ' Tagen')));
}
