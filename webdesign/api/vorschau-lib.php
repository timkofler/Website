<?php
// Tim Kofler – „Vorschau in 60 Sekunden“: erzeugt aus Firmenname, Branche und Ort eine Mini-Startseite.
// Die Texte und der Farbvorschlag kommen von der Anthropic-API (Claude), der Schlüssel liegt nur in api/_data/config.php.
// Wird nur per include von /vorschau/, /kunden/admin/ und api/vorschau.php geladen.
//
// Gespeichert wird je Vorschau eine JSON-Datei unter api/_data/vorschau/<id>.json mit den eingegebenen
// Angaben (Firmenname, Branche, Ort), den erzeugten Texten und dem Zeitpunkt. Keine E-Mail, keine IP-Adresse.

declare(strict_types=1);

require_once __DIR__ . '/lib.php';

const VS_DIR = CX_DATA . '/vorschau';
const VS_URL = 'https://api.anthropic.com/v1/messages';
const VS_MODEL = 'claude-sonnet-5-5';   // in der config.php mit 'vorschau_model' änderbar (z. B. 'claude-haiku-5-5', noch günstiger)
const VS_TAGESLIMIT = 30;               // öffentliche Vorschauen je Tag, 'vorschau_tageslimit'
const VS_TAGESLIMIT_ADMIN = 50;         // zusätzlich für Tim im Admin-Bereich, 'vorschau_tageslimit_admin'
const VS_IP_LIMIT = 3;                  // je Anschluss und 24 Stunden
const VS_TAGE = 90;                     // Aufbewahrung in Tagen, 'vorschau_tage'

// Auswahl im Formular. Die Branche darf auch frei getippt werden.
const VS_BRANCHEN = [
    'Friseursalon', 'Kosmetikstudio', 'Massage & Physiotherapie', 'Arztpraxis / Therapie', 'Café', 'Gasthaus / Restaurant',
    'Bäckerei', 'Fleischerei', 'Hofladen / Direktvermarkter', 'Tischlerei', 'Malerbetrieb', 'Elektriker', 'Installateur / Haustechnik',
    'Autowerkstatt', 'Baufirma / Baumeister', 'Gärtner / Gartengestaltung', 'Fotograf', 'Steuerberater / Buchhaltung',
    'Rechtsanwalt / Notar', 'Immobilien', 'Fitnessstudio / Trainer', 'Yoga / Pilates', 'Ferienwohnung / Pension', 'Handel / Geschäft', 'Verein', 'Sonstiges',
];

function vs_config(string $key, $default)
{
    $c = cx_config();
    return array_key_exists($key, $c) && $c[$key] !== '' && $c[$key] !== null ? $c[$key] : $default;
}

function vs_ready(): bool
{
    return (string) vs_config('anthropic_api_key', '') !== '';
}

function vs_valid_id(string $id): bool
{
    return (bool) preg_match('/^[a-z0-9]{10}$/', $id);
}

function vs_file(string $id): string
{
    return VS_DIR . '/' . $id . '.json';
}

function vs_load(string $id): ?array
{
    if (!vs_valid_id($id) || !is_file(vs_file($id))) {
        return null;
    }
    $data = json_decode((string) file_get_contents(vs_file($id)), true);
    return is_array($data) && !empty($data['inhalt']) ? $data : null;
}

// Alle Vorschauen, neueste zuerst (für den Admin-Bereich).
function vs_list(): array
{
    $out = [];
    foreach (glob(VS_DIR . '/*.json') ?: [] as $f) {
        $id = basename($f, '.json');
        if (!vs_valid_id($id)) {
            continue;
        }
        $d = json_decode((string) file_get_contents($f), true);
        if (is_array($d)) {
            $out[$id] = $d;
        }
    }
    uasort($out, static fn($a, $b) => strcmp((string) ($b['zeit'] ?? ''), (string) ($a['zeit'] ?? '')));
    return $out;
}

function vs_delete(string $id): bool
{
    return vs_valid_id($id) && is_file(vs_file($id)) && @unlink(vs_file($id));
}

function vs_write(string $file, array $data): bool
{
    $dir = dirname($file);
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
        return false;
    }
    $tmp = $file . '.' . bin2hex(random_bytes(4)) . '.tmp';
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false || @file_put_contents($tmp, $json, LOCK_EX) === false) {
        return false;
    }
    return @rename($tmp, $file);
}

// Alte Vorschauen und alte Zähler gelegentlich löschen.
function vs_cleanup(): void
{
    if (random_int(1, 20) !== 1) {
        return;
    }
    $cut = time() - (int) vs_config('vorschau_tage', VS_TAGE) * 86400;
    foreach (glob(VS_DIR . '/*.json') ?: [] as $f) {
        if (@filemtime($f) < $cut) {
            @unlink($f);
        }
    }
    foreach (glob(VS_DIR . '/zaehler/*.json') ?: [] as $f) {
        if (@filemtime($f) < time() - 3 * 86400) {
            @unlink($f);
        }
    }
}

// ---------------- Grenzen ----------------

function vs_zaehler_datei(string $name): string
{
    return VS_DIR . '/zaehler/' . $name . '.json';
}

// Tageszähler: getrennt für Besucher und Admin, damit Tim auch dann noch Vorschauen erzeugen kann, wenn das öffentliche Limit erreicht ist.
function vs_tag_count(bool $admin): int
{
    $f = vs_zaehler_datei(($admin ? 'admin-' : 'tag-') . date('Y-m-d'));
    return is_file($f) ? (int) (json_decode((string) file_get_contents($f), true)['n'] ?? 0) : 0;
}

function vs_tag_limit(bool $admin): int
{
    return (int) vs_config($admin ? 'vorschau_tageslimit_admin' : 'vorschau_tageslimit', $admin ? VS_TAGESLIMIT_ADMIN : VS_TAGESLIMIT);
}

function vs_tag_ok(bool $admin): bool
{
    return vs_tag_count($admin) < vs_tag_limit($admin);
}

function vs_tag_zaehlen(bool $admin): void
{
    $f = vs_zaehler_datei(($admin ? 'admin-' : 'tag-') . date('Y-m-d'));
    vs_write($f, ['n' => vs_tag_count($admin) + 1]);
}

// Höchstens VS_IP_LIMIT Vorschauen je Anschluss in 24 Stunden. Gespeichert wird nur ein Hash der IP-Adresse, der nach 3 Tagen gelöscht wird.
function vs_ip_ok(): bool
{
    $hits = vs_ip_hits();
    return count($hits) < VS_IP_LIMIT;
}

function vs_ip_hits(): array
{
    $f = vs_zaehler_datei('ip-' . kp_ip_hash_vs());
    $now = time();
    $hits = is_file($f) ? (json_decode((string) file_get_contents($f), true) ?: []) : [];
    return array_values(array_filter($hits, static fn($t) => is_int($t) && $t > $now - 86400));
}

function vs_ip_zaehlen(): void
{
    $hits = vs_ip_hits();
    $hits[] = time();
    vs_write(vs_zaehler_datei('ip-' . kp_ip_hash_vs()), $hits);
}

function kp_ip_hash_vs(): string
{
    return substr(hash('sha256', (string) (cx_config()['secret'] ?? 'tk') . 'vorschau' . ($_SERVER['REMOTE_ADDR'] ?? '')), 0, 32);
}

// ---------------- Eingaben ----------------

// Firmenname, Branche und Ort säubern. Gibt eine Fehlermeldung zurück oder leer, wenn alles passt.
function vs_pruefen(string &$firma, string &$branche, string &$ort): string
{
    $clean = static fn(string $s, int $max) => trim(preg_replace('/\s+/u', ' ', str_replace(['<', '>', '{', '}', '`'], '', $s)) ?? '', " \t\n\r\0\x0B-–—.");
    $firma = mb_substr($clean($firma, 80), 0, 80);
    $branche = mb_substr($clean($branche, 80), 0, 80);
    $ort = mb_substr($clean($ort, 80), 0, 80);
    if (mb_strlen($firma) < 2) {
        return 'Bitte gib den Namen deines Betriebs ein (mindestens 2 Zeichen).';
    }
    if (mb_strlen($branche) < 3) {
        return 'Bitte wähle oder tippe eine Branche.';
    }
    if (mb_strlen($ort) < 2) {
        return 'Bitte gib den Ort ein, z. B. „Oberndorf an der Melk“.';
    }
    if (preg_match('~https?:|www\.|[/@]|\w\.[a-z]{2,}\b~i', $firma . ' ' . $branche . ' ' . $ort)) {
        return 'Bitte ohne Links oder E-Mail-Adressen, nur Name, Branche und Ort.';
    }
    return '';
}

// ---------------- Anthropic-API ----------------

// Was die KI liefern soll. Die Schnittstelle kennt keine Längen- oder Mengengrenzen im Schema,
// deshalb stehen die Grenzen in den Beschreibungen und werden in vs_saeubern() noch einmal hart durchgesetzt.
function vs_schema(): array
{
    $s = static fn(int $max, string $was = '') => ['type' => 'string', 'description' => trim($was . ' Höchstens ' . $max . ' Zeichen.')];
    $liste = static fn(int $n, int $max, string $was) => ['type' => 'array', 'description' => 'Genau ' . $n . ' Einträge. ' . $was, 'items' => $s($max)];
    return [
        'type' => 'object',
        'additionalProperties' => false,
        'required' => ['anrede', 'slogan', 'untertitel', 'menue', 'akzent', 'akzent_name', 'farb_begruendung', 'leistungen', 'vorteile', 'ueber_titel', 'ueber_text', 'cta', 'kontakt_titel', 'kontakt_text', 'oeffnungszeiten'],
        'properties' => [
            'anrede' => ['type' => 'string', 'enum' => ['Sie', 'Du']],
            'slogan' => $s(70, 'Überschrift der Startseite.'),
            'untertitel' => $s(180, 'Ein bis zwei Sätze unter der Überschrift.'),
            'menue' => $liste(4, 20, 'Menüpunkte, erster „Start“, letzter „Kontakt“.'),
            'akzent' => ['type' => 'string', 'description' => 'Hex-Farbe im Format #rrggbb.'],
            'akzent_name' => $s(30, 'Kurzer Name der Farbe.'),
            'farb_begruendung' => $s(160, 'Ein Satz, warum die Farbe passt.'),
            'leistungen' => [
                'type' => 'array', 'description' => 'Genau 3 Leistungen.',
                'items' => ['type' => 'object', 'additionalProperties' => false, 'required' => ['titel', 'text'], 'properties' => ['titel' => $s(40), 'text' => $s(170, 'Ein bis zwei Sätze.')]],
            ],
            'vorteile' => $liste(3, 45, 'Kurze Stichpunkte ohne Punkt am Ende.'),
            'ueber_titel' => $s(60),
            'ueber_text' => $s(420, 'Zwei bis drei Sätze über den Betrieb.'),
            'cta' => $s(32, 'Text des Haupt-Buttons, z. B. „Termin anfragen“.'),
            'kontakt_titel' => $s(60),
            'kontakt_text' => $s(200),
            'oeffnungszeiten' => $s(90, 'Platzhalter-Öffnungszeiten.'),
        ],
    ];
}

function vs_system_prompt(): string
{
    return <<<TXT
Du schreibst Texte für die Startseite eines kleinen Betriebs in Österreich. Die Texte zeigen dem Betrieb, wie seine künftige Webseite klingen und aussehen könnte.

Regeln:
- Deutsch wie in Österreich üblich (z. B. „Jänner“, „Sackerl“ nur wenn passend), natürlich und konkret, kein Werbegeschwafel, keine Superlative wie „beste“, „Nr. 1“, keine erfundenen Zahlen, Preise, Auszeichnungen, Gründungsjahre oder Namen von Personen.
- Keine erfundenen Telefonnummern, Adressen (außer dem genannten Ort) oder E-Mail-Adressen. Öffnungszeiten als Platzhalter formulieren, z. B. „Mo–Fr 8–17 Uhr, Termine nach Vereinbarung“.
- Anrede: „Sie“ für Praxen, Kanzleien, Handwerk und Beratung, „Du“ für lockere Branchen wie Café, Fitness, Friseur. Durchgehend einheitlich.
- Der Firmenname bleibt genau wie angegeben. Der Ort kommt in Untertitel oder Über-uns-Text vor.
- Farbe: ein Hex-Farbton, der zur Branche passt (z. B. warmes Braun für Bäckerei, Petrol für Installateur), gut lesbar als Akzent auf dunklem Hintergrund, nicht Grau, nicht Schwarz, nicht Weiß, nicht zu dunkel. Kurzer Name der Farbe und ein Satz, warum sie passt.
- Menü: 4 kurze Einträge, der erste „Start“, der letzte „Kontakt“.
- Leistungen: 3 typische Leistungen der Branche mit je ein bis zwei Sätzen.
- Vorteile: 3 kurze Stichpunkte (je höchstens 6 Wörter), ohne Punkt am Ende.
- Halte die Längengrenzen des Schemas ein.
TXT;
}

// Ruft die Anthropic-API auf und gibt den geprüften Inhalt zurück, oder eine Fehlermeldung als String.
function vs_generate(string $firma, string $branche, string $ort)
{
    if (!vs_ready()) {
        return 'Die Vorschau ist noch nicht freigeschaltet (API-Schlüssel fehlt).';
    }
    $model = (string) vs_config('vorschau_model', VS_MODEL);
    $body = [
        'model' => $model,
        'max_tokens' => 2000,
        'system' => vs_system_prompt(),
        'messages' => [[
            'role' => 'user',
            'content' => "Betrieb: {$firma}\nBranche: {$branche}\nOrt: {$ort}\n\nSchreibe die Texte für die Startseite als JSON nach dem vorgegebenen Schema.",
        ]],
        // Kurze, klare Texte brauchen wenig Nachdenken: spart Zeit und Kosten.
        'output_config' => ['effort' => 'low', 'format' => ['type' => 'json_schema', 'schema' => vs_schema()]],
    ];
    $headers = [
        'Content-Type: application/json',
        'x-api-key: ' . (string) vs_config('anthropic_api_key', ''),
        'anthropic-version: 2023-06-01',
    ];
    // Falls ein Sicherheitsfilter die Anfrage ablehnt, wiederholt die API sie selbst auf einem anderen Modell.
    if (in_array($model, ['claude-sonnet-5-5', 'claude-opus-5-5', 'claude-opus-5'], true)) {
        $body['fallbacks'] = 'default';
        $headers[] = 'anthropic-beta: server-side-fallback-2026-07-01';
    }

    $json = json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (!function_exists('curl_init')) {
        cx_log('Vorschau: cURL fehlt');
        return 'Auf dem Server fehlt cURL. Bitte melde dich direkt bei mir.';
    }
    $ch = curl_init((string) vs_config('anthropic_url', VS_URL));
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $json,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 75,
    ]);
    $res = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if (!is_string($res) || $res === '') {
        cx_log('Vorschau: keine Antwort (' . $err . ')');
        return 'Die Verbindung zur Text-KI ist gerade nicht möglich. Bitte versuche es in ein paar Minuten noch einmal.';
    }
    $data = json_decode($res, true);
    if ($code !== 200 || !is_array($data)) {
        $typ = (string) ($data['error']['type'] ?? '');
        cx_log('Vorschau: HTTP ' . $code . ' ' . substr($res, 0, 300));
        if ($code === 401 || $code === 403) {
            return 'Der API-Schlüssel wird nicht angenommen. Bitte melde dich direkt bei mir.';
        }
        if ($code === 429 || $typ === 'overloaded_error' || $code >= 500) {
            return 'Die Text-KI ist gerade stark ausgelastet. Bitte versuche es in ein paar Minuten noch einmal.';
        }
        return 'Die Vorschau konnte gerade nicht erzeugt werden. Bitte versuche es später noch einmal.';
    }
    if (($data['stop_reason'] ?? '') === 'refusal') {
        cx_log('Vorschau: Ablehnung ' . json_encode($data['stop_details'] ?? null));
        return 'Für diese Angaben konnte keine Vorschau erzeugt werden. Bitte formuliere Name oder Branche anders.';
    }
    $text = '';
    foreach ((array) ($data['content'] ?? []) as $block) {
        if (($block['type'] ?? '') === 'text') {
            $text .= (string) ($block['text'] ?? '');
        }
    }
    $inhalt = json_decode($text, true);
    if (!is_array($inhalt) || empty($inhalt['slogan']) || empty($inhalt['leistungen'])) {
        cx_log('Vorschau: unbrauchbare Antwort ' . substr($text, 0, 300));
        return 'Die Antwort der Text-KI war unvollständig. Bitte versuche es noch einmal.';
    }
    $inhalt['_modell'] = (string) ($data['model'] ?? $model);
    $inhalt['_tokens'] = ['ein' => (int) ($data['usage']['input_tokens'] ?? 0), 'aus' => (int) ($data['usage']['output_tokens'] ?? 0)];
    return $inhalt;
}

// Erzeugt und speichert eine Vorschau. Gibt ['id' => …] oder ['fehler' => …] zurück.
function vs_erstellen(string $firma, string $branche, string $ort, bool $admin): array
{
    $fehler = vs_pruefen($firma, $branche, $ort);
    if ($fehler !== '') {
        return ['fehler' => $fehler];
    }
    if (!vs_tag_ok($admin)) {
        return ['fehler' => $admin
            ? 'Das Tageslimit für Admin-Vorschauen ist erreicht (' . vs_tag_limit(true) . '). In der config.php mit vorschau_tageslimit_admin erhöhen.'
            : 'Für heute sind alle kostenlosen Vorschauen vergeben. Morgen geht es weiter, oder schreib mir direkt, dann baue ich dir eine.'];
    }
    vs_tag_zaehlen($admin);
    $inhalt = vs_generate($firma, $branche, $ort);
    if (is_string($inhalt)) {
        return ['fehler' => $inhalt];
    }
    $inhalt = vs_saeubern($inhalt);
    do {
        $id = vs_neue_id();
    } while (is_file(vs_file($id)));
    $rec = ['id' => $id, 'zeit' => date('c'), 'firma' => $firma, 'branche' => $branche, 'ort' => $ort, 'quelle' => $admin ? 'admin' : 'web', 'inhalt' => $inhalt];
    if (!vs_write(vs_file($id), $rec)) {
        cx_log('Vorschau: konnte nicht speichern (Schreibrechte api/_data)');
        return ['fehler' => 'Die Vorschau konnte nicht gespeichert werden.'];
    }
    vs_cleanup();
    return ['id' => $id];
}

function vs_neue_id(): string
{
    $chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    $id = '';
    for ($i = 0; $i < 10; $i++) {
        $id .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $id;
}

// Alles auf Strings/Listen in erwarteter Form bringen, Farbe prüfen.
function vs_saeubern(array $i): array
{
    // Keine Links, E-Mail-Adressen oder Telefonnummern aus der KI-Antwort übernehmen (die Seite liegt unter tim-kofler.at).
    $str = static fn($v, int $max) => mb_substr(trim(preg_replace(
        ['~(?:https?://|www\.)\S+~iu', '~[\w.+-]+@[\w-]+(?:\.[\w-]+)+~u', '~\+?\d[\d /()-]{6,}\d~u', '~\s{2,}~u'],
        ['', '', '', ' '],
        strip_tags(is_scalar($v) ? (string) $v : '')
    ) ?? ''), 0, $max);
    $list = static function ($v, int $n, int $max) use ($str) {
        $out = [];
        foreach ((array) $v as $x) {
            $x = $str($x, $max);
            if ($x !== '') {
                $out[] = $x;
            }
        }
        return array_slice($out, 0, $n);
    };
    $akzent = strtolower($str($i['akzent'] ?? '', 7));
    if (!preg_match('/^#[0-9a-f]{6}$/', $akzent) || vs_zu_dunkel($akzent)) {
        $akzent = '#ff5a1f';
    }
    $leist = [];
    foreach ((array) ($i['leistungen'] ?? []) as $l) {
        $t = $str($l['titel'] ?? '', 40);
        $x = $str($l['text'] ?? '', 170);
        if ($t !== '') {
            $leist[] = ['titel' => $t, 'text' => $x];
        }
    }
    return [
        'anrede' => ($i['anrede'] ?? 'Sie') === 'Du' ? 'Du' : 'Sie',
        'slogan' => $str($i['slogan'] ?? '', 70),
        'untertitel' => $str($i['untertitel'] ?? '', 180),
        'menue' => $list($i['menue'] ?? ['Start', 'Leistungen', 'Über uns', 'Kontakt'], 4, 20),
        'akzent' => $akzent,
        'akzent_name' => $str($i['akzent_name'] ?? '', 30),
        'farb_begruendung' => $str($i['farb_begruendung'] ?? '', 160),
        'leistungen' => array_slice($leist, 0, 3),
        'vorteile' => $list($i['vorteile'] ?? [], 3, 45),
        'ueber_titel' => $str($i['ueber_titel'] ?? 'Über uns', 60),
        'ueber_text' => $str($i['ueber_text'] ?? '', 420),
        'cta' => $str($i['cta'] ?? 'Jetzt anfragen', 32),
        'kontakt_titel' => $str($i['kontakt_titel'] ?? 'Kontakt', 60),
        'kontakt_text' => $str($i['kontakt_text'] ?? '', 200),
        'oeffnungszeiten' => $str($i['oeffnungszeiten'] ?? '', 90),
        '_modell' => $str($i['_modell'] ?? '', 40),
        '_tokens' => ['ein' => (int) ($i['_tokens']['ein'] ?? 0), 'aus' => (int) ($i['_tokens']['aus'] ?? 0)],
    ];
}

// Akzentfarbe muss auf Schwarz lesbar bleiben.
function vs_zu_dunkel(string $hex): bool
{
    [$r, $g, $b] = sscanf($hex, '#%02x%02x%02x');
    return (0.2126 * $r + 0.7152 * $g + 0.0722 * $b) < 70;
}

// ---------------- Darstellung ----------------

function vs_url(string $id): string
{
    return (string) (cx_config()['site'] ?? 'https://tim-kofler.at') . '/vorschau/' . $id . '/';
}

// Link zum Anfrageformular mit vorausgefüllten Feldern.
function vs_anfrage_url(array $v): string
{
    $q = http_build_query([
        'firma' => $v['firma'] . ' (' . $v['branche'] . ', ' . $v['ort'] . ')',
        'paket' => 'Start (ab 590 €)',
        'nachricht' => 'Ich habe mir die Vorschau ' . vs_url($v['id']) . ' angesehen und möchte so eine Seite.',
        'utm_source' => 'vorschau',
    ], '', '&', PHP_QUERY_RFC3986);
    return '/?' . $q . '#anfrage';
}

// Die Mini-Startseite selbst (ein Ausschnitt, der wie ein Bildschirm wirkt). Alles aus den gespeicherten Texten, HTML-sicher.
function vs_render(array $v): string
{
    $i = $v['inhalt'];
    $h = 'cx_h';
    $firma = $h($v['firma']);
    $akzent = $h($i['akzent']);
    $initial = $h(mb_strtoupper(mb_substr(preg_replace('/[^\p{L}\p{N}]/u', '', $v['firma']) ?: 'A', 0, 1)));
    $menue = '';
    foreach ($i['menue'] as $m) {
        $menue .= '<span>' . $h($m) . '</span>';
    }
    $leist = '';
    $icons = ['M4 7h16M4 12h10M4 17h7', 'M12 3l2.5 6 6.5.6-5 4.3 1.6 6.4L12 17l-5.6 3.3L8 13.9 3 9.6l6.5-.6z', 'M20 7 9 18l-5-5'];
    foreach ($i['leistungen'] as $n => $l) {
        $leist .= '<article class="vs-card"><i class="vs-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' . $icons[$n % 3] . '"/></svg></i><h3>' . $h($l['titel']) . '</h3><p>' . $h($l['text']) . '</p></article>';
    }
    $vorteile = '';
    foreach ($i['vorteile'] as $x) {
        $vorteile .= '<li>' . $h($x) . '</li>';
    }
    $cta = $h($i['cta']);
    $ort = $h($v['ort']);
    $branche = $h($v['branche']);
    $domain = $h(vs_domain_vorschlag($v['firma']));

    return <<<HTML
<div class="vs-site" style="--vs-akzent:{$akzent}">
  <div class="vs-bar"><i></i><i></i><i></i><span>{$domain}</span></div>
  <header class="vs-head">
    <div class="vs-logo"><b>{$initial}</b> {$firma}</div>
    <nav class="vs-nav" aria-hidden="true">{$menue}</nav>
    <span class="vs-btn vs-btn--sm">{$cta}</span>
  </header>
  <section class="vs-hero">
    <div class="vs-hero__text">
      <span class="vs-label">{$branche} · {$ort}</span>
      <h2>{$h($i['slogan'])}</h2>
      <p>{$h($i['untertitel'])}</p>
      <div class="vs-row"><span class="vs-btn">{$cta}</span><span class="vs-btn vs-btn--line">Mehr erfahren</span></div>
    </div>
    <div class="vs-ph vs-ph--hero" role="img" aria-label="Platzhalter für ein Foto"><span>Hier kommt dein Foto</span></div>
  </section>
  <ul class="vs-vorteile">{$vorteile}</ul>
  <section class="vs-sec">
    <span class="vs-label">Leistungen</span>
    <div class="vs-cards">{$leist}</div>
  </section>
  <section class="vs-sec vs-ueber">
    <div class="vs-ph vs-ph--ueber" role="img" aria-label="Platzhalter für ein Teamfoto"><span>Foto von dir / deinem Team</span></div>
    <div>
      <span class="vs-label">{$h($i['ueber_titel'])}</span>
      <p>{$h($i['ueber_text'])}</p>
    </div>
  </section>
  <section class="vs-sec vs-kontakt">
    <div>
      <span class="vs-label">{$h($i['kontakt_titel'])}</span>
      <p>{$h($i['kontakt_text'])}</p>
      <p class="vs-zeiten">{$h($i['oeffnungszeiten'])}</p>
    </div>
    <div class="vs-form" aria-hidden="true"><span>Name</span><span>E-Mail</span><span class="vs-form__big">Nachricht</span><b class="vs-btn">{$cta}</b></div>
  </section>
  <footer class="vs-foot">© {$firma} · {$ort} · Impressum · Datenschutz</footer>
</div>
HTML;
}

// Nur für die Adresszeile im Bildschirm-Rahmen; keine Prüfung, ob die Domain frei ist.
function vs_domain_vorschlag(string $firma): string
{
    $s = mb_strtolower($firma);
    $s = str_replace(['ä', 'ö', 'ü', 'ß'], ['ae', 'oe', 'ue', 'ss'], $s);
    $s = preg_replace('/[^a-z0-9]+/', '-', $s) ?? '';
    $s = trim(preg_replace('/-+/', '-', $s) ?? '', '-');
    return ($s !== '' ? mb_substr($s, 0, 30) : 'dein-betrieb') . '.at';
}

// Seitenrahmen im Design von tim-kofler.at (Kopf, Fuß, Stylesheets).
function vs_page(string $title, string $description, string $body, string $canonical = '', bool $index = false): void
{
    $t = cx_h($title);
    $d = cx_h($description);
    $robots = $index ? 'index, follow' : 'noindex, follow';
    $canon = $canonical !== '' ? '<link rel="canonical" href="' . cx_h($canonical) . '">' : '';
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Robots-Tag: ' . ($index ? 'index' : 'noindex'));
    echo <<<HTML
<!DOCTYPE html>
<html lang="de-AT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{$t} | Tim Kofler – Webdesign</title>
  <meta name="description" content="{$d}">
  <meta name="robots" content="{$robots}">
  {$canon}
  <meta property="og:title" content="{$t} | Tim Kofler – Webdesign">
  <meta property="og:description" content="{$d}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="de_AT">
  <meta property="og:site_name" content="Tim Kofler – Webdesign">
  <meta property="og:image" content="https://tim-kofler.at/assets/img/og-tk-2.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#0b0b0b">
  <link rel="icon" href="/assets/img/tk-badge.svg" type="image/svg+xml">
  <link rel="icon" href="/assets/img/tk-badge-256.png" type="image/png" sizes="256x256">
  <link rel="apple-touch-icon" href="/assets/img/tk-badge-256.png">
  <link rel="preload" href="/assets/fonts/unbounded.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/manrope.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/style.css?v=a9c5cddd">
  <link rel="stylesheet" href="/assets/css/tk.css?v=0bab137b">
  <link rel="stylesheet" href="/assets/css/vorschau.css?v=c72a87c6">
</head>
<body>

<header class="header">
  <div class="container header__inner">
    <a href="/" class="tk-logo" aria-label="Tim Kofler Webdesign – Startseite"><img src="/assets/img/tk-logo.svg" alt="Tim Kofler Webdesign" width="71" height="36"></a>
    <nav class="nav" aria-label="Hauptnavigation">
      <a href="/#leistungen">Leistungen</a>
      <a href="/#beispiele">Beispiele</a>
      <a href="/#pakete">Pakete</a>
      <a href="/#email">Landingpages</a>
      <a href="/#extras">Web-Apps</a>
      <a href="/#ablauf">Ablauf</a>
      <a href="/#ueber">Über mich</a>
      <a href="/#anfrage" class="btn nav__cta">Anfragen <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
    </nav>
    <div style="display:flex;gap:10px;align-items:center">
      <a href="/#anfrage" class="btn btn--sm header__cta">Anfragen <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
      <button class="nav-toggle" aria-label="Menü öffnen" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    </div>
  </div>
</header>

<main>
{$body}
</main>

<footer class="footer">
  <div class="container">
    <div class="footer__bottom">
      <span>© <span data-year>2026</span> Tim Kofler · Keine Cookies · Kein Tracking</span>
      <span><a href="/impressum/">Impressum</a> · <a href="/datenschutz/#vorschau">Datenschutz</a></span>
    </div>
  </div>
</footer>

<script src="/assets/js/main.js?v=5b686c25"></script>
<script src="/assets/js/vorschau.js?v=450bd1e8"></script>
</body>
</html>
HTML;
    exit;
}
