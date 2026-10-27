<?php
// Tim Kofler – privater Link zum Gratis-Entwurf: Tim lädt im Admin die Bilder (Handy, PC) zu einer Anfrage hoch,
// der Interessent bekommt einen Link /entwurf/ansehen/?t=…, den niemand erraten kann. Tim sieht, ob und wie oft
// er geöffnet wurde, und der Interessent kann mit einem Klick sagen „Passt, weiter geht's“.
// Daten: api/_data/ansicht/<token>/ (per .htaccess gesperrt, nicht im Repo). Gelöscht mit der Anfrage oder nach 12 Monaten.

declare(strict_types=1);

require_once __DIR__ . '/kunden-lib.php';

const AN_DIR = CX_DATA . '/ansicht';
const AN_TAGE = 365;
const AN_MAX_BILDER = 8;
const AN_MAX_MB = 25;
const AN_TYPES = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'];

function an_valid(string $t): bool
{
    return (bool) preg_match('/^[A-Za-z0-9_-]{24}$/', $t);
}

function an_dir(string $t): string
{
    return AN_DIR . '/' . $t;
}

function an_url(string $t): string
{
    return rtrim(cx_brand()['site'], '/') . '/entwurf/ansehen/?t=' . $t;
}

function an_read(string $t): array
{
    if (!an_valid($t)) {
        return [];
    }
    $d = kp_read_json(an_dir($t) . '/ansicht.json');
    if ($d && (strtotime((string) ($d['erstellt'] ?? '')) ?: 0) < time() - AN_TAGE * 86400) {
        an_delete($t);
        return [];
    }
    return $d;
}

function an_write(string $t, array $d): bool
{
    return an_valid($t) && kp_write_json(an_dir($t) . '/ansicht.json', $d);
}

function an_delete(string $t): void
{
    if (an_valid($t)) {
        kp_delete_dir(an_dir($t));
    }
}

// Neuen Link für eine Anfrage anlegen. $ref ist „entwurf:<id>“ oder „anfrage:<id>“, $titel der Betrieb.
function an_create(string $ref, string $titel): string
{
    $t = rtrim(strtr(base64_encode(random_bytes(18)), '+/', '-_'), '=');
    $ok = an_write($t, [
        'ref' => $ref, 'titel' => $titel, 'erstellt' => date('c'), 'text' => '', 'bilder' => [],
        'aufrufe' => 0, 'erstmals' => '', 'zuletzt' => '', 'antwort' => '', 'antwort_zeit' => '',
    ]);
    return $ok ? $t : '';
}

// Bilder hinzufügen (nur JPG, PNG, WebP; Inhalt wird geprüft). Gibt [ok, Meldung] zurück.
function an_add_images(string $t, array $files): array
{
    $d = an_read($t);
    if (!$d) {
        return [false, 'Den Entwurf-Link gibt es nicht mehr.'];
    }
    if (!$files) {
        return [false, 'Bitte mindestens ein Bild auswählen.'];
    }
    $n = count((array) $d['bilder']);
    $neu = 0;
    $fehler = '';
    foreach ($files as $f) {
        $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
        if ($n >= AN_MAX_BILDER) {
            $fehler = 'Höchstens ' . AN_MAX_BILDER . ' Bilder pro Entwurf.';
            break;
        }
        if ($f['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($f['tmp'])) {
            $fehler = '„' . $f['name'] . '“ ist nicht angekommen (zu groß?).';
            continue;
        }
        if (!isset(AN_TYPES[$ext]) || $f['size'] > AN_MAX_MB * 1048576 || !kp_check_type($f['tmp'], $ext)) {
            $fehler = '„' . $f['name'] . '“ ist kein JPG, PNG oder WebP bis ' . AN_MAX_MB . ' MB.';
            continue;
        }
        $name = kp_safe_name($f['name'], $ext === 'jpeg' ? 'jpg' : $ext, $n + 1);
        if (!@move_uploaded_file($f['tmp'], an_dir($t) . '/' . $name)) {
            $fehler = '„' . $f['name'] . '“ konnte nicht gespeichert werden.';
            continue;
        }
        @chmod(an_dir($t) . '/' . $name, 0600);
        $d['bilder'][] = ['datei' => $name, 'original' => mb_substr($f['name'], 0, 120)];
        $n++;
        $neu++;
    }
    an_write($t, $d);
    if ($neu === 0) {
        return [false, $fehler ?: 'Kein Bild gespeichert.'];
    }
    return [true, ($neu === 1 ? '1 Bild' : $neu . ' Bilder') . ' hinzugefügt.' . ($fehler !== '' ? ' ' . $fehler : '')];
}

function an_remove_image(string $t, string $datei): void
{
    $d = an_read($t);
    if (!$d) {
        return;
    }
    $d['bilder'] = array_values(array_filter((array) $d['bilder'], static function ($b) use ($t, $datei) {
        if ($b['datei'] === $datei) {
            @unlink(an_dir($t) . '/' . $datei);
            return false;
        }
        return true;
    }));
    an_write($t, $d);
}

// Kurzer Stand für den Admin: „noch nicht geöffnet“ oder „3× geöffnet, zuletzt …“.
function an_stand(array $d): string
{
    if ((int) ($d['aufrufe'] ?? 0) === 0) {
        return 'noch nicht geöffnet';
    }
    $n = (int) $d['aufrufe'];
    return ($n === 1 ? '1× geöffnet' : $n . '× geöffnet') . ', zuletzt ' . date('d.m., H:i', strtotime((string) $d['zuletzt']) ?: 0) . ' Uhr';
}
