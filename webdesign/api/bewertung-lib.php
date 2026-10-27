<?php
// Tim Kofler – Bewertungen von Kunden: Jeder Kunde bekommt einen eigenen Link /bewertung/?t=…, schreibt dort
// Sterne und ein paar Sätze und sagt, ob sie mit Namen auf tim-kofler.at stehen darf. Tim gibt sie im Admin frei,
// erst dann erscheint sie (über /api/bewertungen.php) auf der Startseite. Dazu der Knopf zur Google-Bewertung.
// Daten: api/_data/bewertungen/<benutzer>.json (per .htaccess gesperrt, nicht im Repo).

declare(strict_types=1);

require_once __DIR__ . '/kunden-lib.php';

const BW_DIR = CX_DATA . '/bewertungen';
const BW_TEXT_MAX = 600;

function bw_file(string $u): string
{
    return BW_DIR . '/' . $u . '.json';
}

function bw_read(string $u): array
{
    return kp_valid_user($u) ? kp_read_json(bw_file($u)) : [];
}

function bw_write(string $u, array $d): bool
{
    return kp_valid_user($u) && kp_write_json(bw_file($u), $d);
}

function bw_delete(string $u): void
{
    if (kp_valid_user($u)) {
        @unlink(bw_file($u));
    }
}

// Link für einen Kunden (wird beim ersten Mal erzeugt und im Konto gemerkt).
function bw_token(string $u): string
{
    $all = kp_accounts();
    if (!isset($all[$u])) {
        return '';
    }
    $t = (string) ($all[$u]['bewertung_token'] ?? '');
    if (!preg_match('/^[A-Za-z0-9_-]{22}$/', $t)) {
        $t = rtrim(strtr(base64_encode(random_bytes(16)), '+/', '-_'), '=');
        $all[$u]['bewertung_token'] = $t;
        kp_save_accounts($all);
    }
    return $t;
}

function bw_url(string $t): string
{
    return rtrim(cx_brand()['site'], '/') . '/bewertung/?t=' . $t;
}

// Kunde zum Link finden (gesperrte Zugänge zählen nicht).
function bw_user_for(string $t): string
{
    if (!preg_match('/^[A-Za-z0-9_-]{22}$/', $t)) {
        return '';
    }
    foreach (kp_accounts() as $u => $a) {
        if (hash_equals((string) ($a['bewertung_token'] ?? ''), $t) && !empty($a['aktiv'])) {
            return (string) $u;
        }
    }
    return '';
}

// Alle Bewertungen für den Admin, neueste zuerst.
function bw_all(): array
{
    $out = [];
    foreach (glob(BW_DIR . '/*.json') ?: [] as $f) {
        $u = basename($f, '.json');
        $d = bw_read($u);
        if ($d) {
            $out[$u] = $d;
        }
    }
    uasort($out, static fn($a, $b) => strcmp((string) ($b['zeit'] ?? ''), (string) ($a['zeit'] ?? '')));
    return $out;
}

// Was öffentlich gezeigt wird: nur freigegebene Bewertungen mit Einwilligung, ohne Benutzernamen und E-Mail.
function bw_public(): array
{
    $out = [];
    foreach (bw_all() as $d) {
        if (($d['status'] ?? '') === 'frei' && !empty($d['oeffentlich'])) {
            $out[] = ['name' => (string) $d['name'], 'text' => (string) $d['text'], 'sterne' => (int) $d['sterne'], 'datum' => substr((string) $d['zeit'], 0, 10)];
        }
    }
    return $out;
}
