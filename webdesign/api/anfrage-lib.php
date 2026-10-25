<?php
// Tim Kofler – alle Anfragen an einem Ort: Webseiten-Anfragen (Startseite, /gruender/, /verein/) und Rückruf-Wünsche
// werden hier gespeichert, die Gratis-Entwürfe bleiben in api/_data/entwuerfe/ (entwurf-lib.php) und werden nur mitgelesen.
// Dazu die Werbekosten pro Quelle, die Tim im Admin einträgt. Alles liegt unter api/_data/ und ist für Besucher gesperrt.

declare(strict_types=1);

require_once __DIR__ . '/entwurf-lib.php';

const AF_DIR = CX_DATA . '/anfragen';
const AF_KOSTEN = CX_DATA . '/werbekosten.json';
// Ein Status für alle Arten von Anfragen (auch die Gratis-Entwürfe, deren „erledigt“ von früher bleibt lesbar).
const AF_STATUS = ['neu' => 'Neu', 'arbeit' => 'In Arbeit', 'geschickt' => 'Entwurf/Angebot geschickt', 'kunde' => 'Kunde geworden', 'abgesagt' => 'Abgesagt'];
const AF_ARTEN = ['anfrage' => 'Anfrage', 'gruender' => 'Gründer', 'verein' => 'Verein', 'rueckruf' => 'Rückruf', 'entwurf' => 'Gratis-Entwurf'];
// Vorschläge im Kosten-Formular, auch wenn darüber noch keine Anfrage kam.
const AF_QUELLEN_VORSCHLAG = ['google-anzeige', 'willhaben', 'instagram', 'pinterest', 'flyer', 'brief'];

function af_file(string $id): string
{
    return AF_DIR . '/' . $id . '.json';
}

// Dieselbe Form wie bei den Entwürfen: Datum-Uhrzeit-Zufall.
function af_read(string $id): array
{
    if (!ew_valid_id($id) || !is_file(af_file($id))) {
        return [];
    }
    $d = json_decode((string) file_get_contents(af_file($id)), true);
    return is_array($d) ? $d : [];
}

function af_write(string $id, array $data): bool
{
    if (!is_dir(AF_DIR) && !@mkdir(AF_DIR, 0700, true)) {
        return false;
    }
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    return @file_put_contents(af_file($id), $json, LOCK_EX) !== false;
}

function af_delete(string $id): void
{
    if (ew_valid_id($id)) {
        @unlink(af_file($id));
    }
}

// Neue Anfrage aus anmelden.php speichern. $felder sind genau die Zeilen aus Tims Benachrichtigungsmail.
function af_save(string $art, string $name, string $firma, string $quelle, array $felder): bool
{
    $id = date('Ymd-His') . '-' . bin2hex(random_bytes(3));
    return af_write($id, [
        'art' => isset(AF_ARTEN[$art]) ? $art : 'anfrage', 'zeit' => date('c'), 'status' => 'neu',
        'name' => $name, 'firma' => $firma, 'quelle' => $quelle, 'felder' => $felder,
    ]);
}

// Gespeicherte Anfragen und Gratis-Entwürfe zusammen, neueste zuerst. Ohne Auftrag nach 12 Monaten gelöscht wie bei den Entwürfen.
function af_all(): array
{
    $out = [];
    $limit = time() - EW_TAGE * 86400;
    foreach (glob(AF_DIR . '/*.json') ?: [] as $f) {
        $id = basename($f, '.json');
        $d = af_read($id);
        if (!$d) {
            continue;
        }
        $last = strtotime((string) ($d['geaendert'] ?? $d['zeit'] ?? '')) ?: 0;
        if ($last < $limit && ($d['status'] ?? '') !== 'kunde') {
            af_delete($id);
            continue;
        }
        $out['a' . $id] = $d + ['id' => $id, 'link' => '?anfrage=' . $id];
    }
    foreach (ew_all() as $id => $d) {
        $out['e' . $id] = [
            'art' => 'entwurf', 'id' => $id, 'link' => '?entwurf=' . $id, 'zeit' => $d['zeit'] ?? '', 'status' => $d['status'] ?? 'neu',
            'name' => $d['name'] ?? '', 'firma' => $d['firma'] ?? '', 'quelle' => $d['quelle'] ?? '', 'notiz' => $d['notiz'] ?? '',
            'ort' => $d['ort'] ?? '', 'branche' => $d['branche'] ?? '',
        ];
    }
    uasort($out, static fn($a, $b) => strcmp((string) $b['zeit'], (string) $a['zeit']));
    return $out;
}

// „Gefunden über“ auf eine Quelle kürzen: Google-Anzeige, utm_source (ohne Kampagne), verweisende Seite oder „direkt“.
function af_quelle(string $q): string
{
    $q = strtolower(trim($q));
    if ($q === '') {
        return 'direkt';
    }
    if (str_starts_with($q, 'google-anzeige')) {
        return 'google-anzeige';
    }
    $q = trim(explode(' / ', $q, 2)[0]);
    $q = preg_replace('/^www\./', '', $q) ?? $q;
    return mb_substr($q, 0, 40);
}

function af_quelle_name(string $q): string
{
    $fest = ['google-anzeige' => 'Google-Anzeige', 'direkt' => 'Direkt / ohne Kennung', 'willhaben' => 'willhaben', 'brief' => 'Brief'];
    return $fest[$q] ?? (strpos($q, '.') !== false ? $q : ucfirst($q));
}

function af_kosten(): array
{
    $d = is_file(AF_KOSTEN) ? json_decode((string) file_get_contents(AF_KOSTEN), true) : [];
    return is_array($d) ? $d : [];
}

function af_kosten_save(array $k): bool
{
    ksort($k);
    $json = json_encode($k, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    return @file_put_contents(AF_KOSTEN, $json, LOCK_EX) !== false;
}

// Betrag wie „16,74“, „1.190“ oder „23.99“ in Cent. Leer heißt: Eintrag entfernen.
function af_cent(string $v): ?int
{
    $v = str_replace([' ', '€'], '', trim($v));
    if ($v === '') {
        return null;
    }
    if (preg_match('/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/', $v)) {
        $v = str_replace('.', '', $v);
    }
    $v = str_replace(',', '.', $v);
    return preg_match('/^\d{1,7}(\.\d{1,2})?$/', $v) ? (int) round((float) $v * 100) : -1;
}

function af_euro(int $cent): string
{
    return number_format($cent / 100, 2, ',', '.') . ' €';
}
