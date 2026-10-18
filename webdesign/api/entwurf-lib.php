<?php
// Tim Kofler – kostenloser Webseiten-Entwurf (/entwurf/): Anfrage annehmen, speichern, Mails verschicken.
// Wird von anmelden.php (Formular) und /kunden/admin/ (Liste der Anfragen) per include geladen.

declare(strict_types=1);

require_once __DIR__ . '/lib.php';

const EW_DIR = CX_DATA . '/entwuerfe';
const EW_TAGE = 365; // Anfragen ohne Auftrag werden nach 12 Monaten gelöscht (siehe Datenschutz Punkt 5)
const EW_STATUS = ['neu' => 'Neu', 'arbeit' => 'In Arbeit', 'geschickt' => 'Entwurf geschickt', 'erledigt' => 'Erledigt'];

// Auswahl im Formular. Nur diese Werte werden angenommen, alles andere fällt weg.
const EW_FARBEN = [
    'orange' => ['Orange', '#ff5a1f'], 'rot' => ['Rot', '#d62f2f'], 'bordeaux' => ['Bordeaux', '#7d1f3a'],
    'gruen' => ['Grün', '#2f8f4e'], 'salbei' => ['Salbei', '#7f9f86'], 'blau' => ['Blau', '#2459d6'],
    'petrol' => ['Petrol', '#11707a'], 'lila' => ['Lila', '#6b3fc4'], 'gold' => ['Gold', '#c99a2e'],
    'anthrazit' => ['Schwarz-Weiß', '#262626'],
];
const EW_STIL = ['modern' => 'Modern & klar', 'warm' => 'Warm & gemütlich', 'edel' => 'Edel', 'natur' => 'Natürlich', 'frech' => 'Frisch & frech'];
const EW_INHALT = [
    'leistungen' => 'Leistungen', 'preise' => 'Preise', 'oeffnungszeiten' => 'Öffnungszeiten', 'speisekarte' => 'Speisekarte',
    'galerie' => 'Bildergalerie', 'team' => 'Über uns / Team', 'termin' => 'Online-Termin', 'kontakt' => 'Kontaktformular',
    'anfahrt' => 'Anfahrt & Karte', 'bewertungen' => 'Bewertungen', 'gutscheine' => 'Gutscheine', 'jobs' => 'Jobs',
];

function ew_valid_id(string $id): bool
{
    return (bool) preg_match('/^\d{8}-\d{6}-[a-f0-9]{6}$/', $id);
}

function ew_file(string $id): string
{
    return EW_DIR . '/' . $id . '.json';
}

function ew_read(string $id): array
{
    if (!ew_valid_id($id) || !is_file(ew_file($id))) {
        return [];
    }
    $d = json_decode((string) file_get_contents(ew_file($id)), true);
    return is_array($d) ? $d : [];
}

function ew_write(string $id, array $data): bool
{
    if (!is_dir(EW_DIR) && !@mkdir(EW_DIR, 0700, true)) {
        return false;
    }
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    return @file_put_contents(ew_file($id), $json, LOCK_EX) !== false;
}

function ew_delete(string $id): void
{
    if (ew_valid_id($id)) {
        @unlink(ew_file($id));
    }
}

// Alle Anfragen, neueste zuerst. Alte, abgeschlossene Anfragen werden dabei gelöscht.
function ew_all(): array
{
    $out = [];
    $limit = time() - EW_TAGE * 86400;
    foreach (glob(EW_DIR . '/*.json') ?: [] as $f) {
        $id = basename($f, '.json');
        if (!ew_valid_id($id)) {
            continue;
        }
        $d = ew_read($id);
        if (!$d) {
            continue;
        }
        $last = strtotime((string) ($d['geaendert'] ?? $d['zeit'] ?? '')) ?: 0;
        if ($last < $limit) {
            ew_delete($id);
            continue;
        }
        $out[$id] = $d;
    }
    krsort($out);
    return $out;
}

// Gewählte Farbe als [Name, Hex] – aus der Liste, eine eigene Farbe (#rrggbb) oder „Vorschlag“.
function ew_farbe(string $key, string $hex): array
{
    if (isset(EW_FARBEN[$key])) {
        return EW_FARBEN[$key];
    }
    if ($key === 'eigene' && preg_match('/^#[0-9a-f]{6}$/i', $hex)) {
        return ['Eigene Farbe ' . strtolower($hex), strtolower($hex)];
    }
    return ['Bitte Vorschlag machen', ''];
}

// Kleines Farbfeld für Mails und Admin.
function ew_swatch(string $hex): string
{
    return $hex === '' ? '' : '<span style="display:inline-block;width:14px;height:14px;border-radius:4px;vertical-align:-2px;margin-right:8px;border:1px solid rgba(255,255,255,.25);background:' . cx_h($hex) . '"></span>';
}

// Eingaben aus dem Formular lesen und prüfen. Gibt [Daten, Fehlermeldung] zurück.
function ew_from_post(): array
{
    $email = cx_email(cx_field('email', 254));
    $firma = str_replace(['<', '>', '"'], '', cx_field('firma', 120));
    $name = str_replace(['<', '>', '"'], '', cx_field('name', 80));
    // Keine Links, Domains oder Telefonnummern in Feldern, die in der Bestätigungsmail an die angegebene Adresse stehen.

    if ($firma === '') {
        return [[], 'Bitte gib den Namen deines Betriebs an.'];
    }
    if (cx_has_link($firma) || cx_has_link($name)) {
        return [[], 'Bitte gib Betrieb und Namen ohne Links, Adressen oder Telefonnummern an. Dafür gibt es eigene Felder.'];
    }
    if ($email === '') {
        return [[], 'Bitte gib eine gültige E-Mail-Adresse ein, damit ich dir den Entwurf schicken kann.'];
    }
    $farbKey = cx_field('farbe', 20);
    if ($farbKey === '') {
        return [[], 'Bitte wähle eine Wunschfarbe oder „Schlag mir was vor“.'];
    }
    [$farbe, $hex] = ew_farbe($farbKey, cx_field('farbe_eigen', 7));

    $inhalt = [];
    foreach ((array) ($_POST['inhalt'] ?? []) as $k) {
        if (is_string($k) && isset(EW_INHALT[$k])) {
            $inhalt[] = EW_INHALT[$k];
        }
    }
    $wuensche = cx_field('wuensche', 2000);
    if (!$inhalt && $wuensche === '') {
        return [[], 'Bitte kreuze an, was ungefähr auf die Seite soll, oder beschreib es kurz in eigenen Worten.'];
    }
    if (cx_field('datenschutz', 5) !== 'ja') {
        return [[], 'Bitte bestätige, dass ich deine Angaben für den Entwurf verwenden darf.'];
    }

    $hat = cx_field('hat_webseite', 5);
    $stil = cx_field('stil', 20);
    return [[
        'zeit' => date('c'),
        'status' => 'neu',
        'firma' => $firma,
        'email' => $email,
        'name' => $name,
        'telefon' => preg_replace('/[^0-9+\/ ()-]/', '', cx_field('telefon', 40)) ?? '',
        'branche' => cx_field('branche', 80),
        'ort' => cx_field('ort', 80),
        'hat_webseite' => $hat === 'ja' ? 'ja' : ($hat === 'nein' ? 'nein' : ''),
        'webseite' => $hat === 'nein' ? '' : cx_field('url', 200),
        'farbe' => $farbe,
        'farbe_hex' => $hex,
        'stil' => EW_STIL[$stil] ?? '',
        'inhalt' => $inhalt,
        'wuensche' => $wuensche,
        'newsletter' => cx_field('newsletter', 5) === 'ja',
        'quelle' => cx_field('quelle', 120),
    ], ''];
}

// Angaben als Tabellenzeilen für die Mail an Tim.
function ew_rows(array $d): string
{
    $rows = '';
    $web = $d['webseite'] !== '' ? $d['webseite'] : ($d['hat_webseite'] === 'nein' ? 'noch keine' : '–');
    foreach ([
        'Betrieb' => $d['firma'], 'Branche' => $d['branche'], 'Ort' => $d['ort'], 'Webseite' => $web,
        'Wunschfarbe' => $d['farbe'], 'Stil' => $d['stil'], 'Soll drauf' => implode(', ', $d['inhalt']),
        'Wünsche' => $d['wuensche'], 'Name' => $d['name'], 'E-Mail' => $d['email'], 'Telefon' => $d['telefon'],
        'Newsletter' => $d['newsletter'] ? 'ja (Bestätigung ausstehend)' : 'nein', 'Gefunden über' => $d['quelle'],
    ] as $k => $v) {
        $cell = nl2br(cx_h($v !== '' ? $v : '–'));
        if ($k === 'Wunschfarbe') {
            $cell = ew_swatch($d['farbe_hex']) . $cell;
        }
        $rows .= '<tr><td style="padding:6px 12px 6px 0;color:#a1a1a1;vertical-align:top;white-space:nowrap">' . cx_h($k)
            . '</td><td style="padding:6px 0;color:#f4f4f0">' . $cell . '</td></tr>';
    }
    return $rows;
}

// Formular „entwurf“ aus anmelden.php.
function ew_handle(array $c, string $fallback): void
{
    [$d, $err] = ew_from_post();
    if ($err !== '') {
        cx_respond(false, $err);
    }

    $id = date('Ymd-His') . '-' . bin2hex(random_bytes(3));
    $stored = ew_write($id, $d);

    // Kontakt für die Bearbeitung der Anfrage (Art. 6 Abs. 1 lit. b DSGVO), nicht für Werbung.
    $listId = (int) ($c['list_entwurf'] ?? $c['list_webdesign'] ?? 0);
    $saved = cx_contact($d['email'], $d['name'], [$listId], [
        'WEB_PAKET' => 'Gratis-Entwurf', 'WEB_QUELLE' => $d['quelle'],
    ]);

    $notify = (string) ($c['notify_email'] ?? 'office@tim-kofler.at');
    $admin = cx_brand()['site'] . '/kunden/admin/?entwurf=' . $id;
    $toTim = cx_mail($notify, 'Tim', 'Gratis-Entwurf angefragt: ' . $d['firma'] . ($d['ort'] !== '' ? ' (' . $d['ort'] . ')' : ''),
        cx_mail_layout('Neue Anfrage für einen Gratis-Entwurf', '<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px">' . ew_rows($d) . '</table>'
            . ($stored ? cx_button($admin, 'Im Admin öffnen') : '<p style="margin:18px 0 0;font-size:14px;color:#ffb3b3">Achtung: Die Anfrage konnte nicht auf dem Webspace gespeichert werden (Schreibrechte api/_data prüfen).</p>')
            . '<p style="margin:18px 0 0;font-size:14px;color:#a1a1a1">Mit „Antworten“ schreibst du direkt an die Person.</p>'),
        $d['email']);

    if (!$stored && !$saved && !$toTim) {
        cx_respond(false, 'Deine Anfrage konnte gerade nicht übermittelt werden. ' . $fallback);
    }

    // Eingangsbestätigung: nur Angaben aus der Auswahlliste, kein freier Text (Schutz vor Missbrauch als Spam-Schleuder).
    $hallo = $d['name'] !== '' ? 'Hallo ' . cx_h($d['name']) . ',' : 'Hallo,';
    $was = $d['inhalt'] ? '<p style="margin:0 0 14px">Auf deiner Wunschliste: ' . cx_h(implode(', ', $d['inhalt'])) . '.</p>' : '';
    $inner = '<p style="margin:0 0 14px">' . $hallo . '</p>'
        . '<p style="margin:0 0 14px">danke für deine Anfrage! Ich gestalte jetzt einen persönlichen Entwurf für <strong>' . cx_h($d['firma']) . '</strong>'
        . ($d['farbe_hex'] !== '' ? ' in deiner Wunschfarbe ' . ew_swatch($d['farbe_hex']) . cx_h($d['farbe']) : ', die Farben schlage ich dir vor') . '.</p>'
        . $was
        . '<p style="margin:0 0 14px">In der Regel bekommst du ihn innerhalb einer Woche per E-Mail, als Bild für Handy und PC. Hast du ein Logo oder schöne Fotos? Dann antworte einfach auf diese E-Mail und häng sie an.</p>'
        . '<p style="margin:0 0 14px">Der Entwurf ist kostenlos und unverbindlich. Ob du danach etwas machen lassen willst, entscheidest du ganz in Ruhe.</p>'
        . '<p style="margin:0 0 4px">Viele Grüße<br>Tim</p>';
    cx_mail($d['email'], $d['name'], 'Dein kostenloser Webseiten-Entwurf', cx_mail_layout('Danke, ich lege los', $inner), $notify);

    // Newsletter nur nach eigener Bestätigung (Double-Opt-in), getrennt von der Anfrage.
    $nl = $d['newsletter'] && array_key_exists('list_newsletter', $c) && cx_send_optin($d['email'], $d['name'], 'entwurf');

    cx_respond(true, 'Danke! Deine Anfrage ist angekommen.', '/entwurf/danke/' . ($nl ? '?nl=1' : ''));
}
