<?php
// CryptoX – nimmt Beta-Bewerbungen und Newsletter-Anmeldungen entgegen und gibt sie an Brevo weiter.

declare(strict_types=1);

require __DIR__ . '/lib.php';

header('X-Robots-Tag: noindex');
cx_guard();

$fallback = 'Bitte schreib mir direkt an ' . (string) (cx_config()['sender_email'] ?? 'tk@crypto-x.at') . ', ich melde mich bei dir.';
if (!cx_ready()) {
    cx_respond(false, 'Das Formular wird gerade eingerichtet. ' . $fallback);
}

$c = cx_config();
$form = cx_field('form', 20);
$email = cx_email(cx_field('email', 254));
$name = cx_field('name', 80);
// Positivliste statt Sperrliste: nur echte Namen (Buchstaben, auch mit Akzenten, dazu Leerzeichen,
// Bindestrich, Apostroph). Keine Punkte, Zahlen, @, Links oder Zeilenumbrüche – der Name steht in
// der Bestätigungsmail an die angegebene Adresse. So lässt sich kein fremder Text einschleusen.
if ($name !== '' && !preg_match('/^[\p{L}\p{M}][\p{L}\p{M} \x{27}\x{2019}-]{0,79}$/uD', $name)) {
    cx_respond(false, 'Bitte gib nur deinen Namen an, ohne Links, Adressen oder Sonderzeichen.');
}

if ($email === '') {
    cx_respond(false, 'Bitte gib eine gültige E-Mail-Adresse ein.');
}

// Nur Formulare annehmen, deren Liste in der config.php dieses Webspace steht
// (tim-kofler.at kennt Webseiten-Anfrage und Newsletter, crypto-x.at Beta und Newsletter).
$lists = ['newsletter' => 'list_newsletter', 'beta' => 'list_beta', 'webseite' => 'list_webdesign'];
if (!isset($lists[$form]) || !array_key_exists($lists[$form], $c)) {
    cx_respond(false, 'Ungültige Anfrage.');
}

if ($form === 'newsletter') {
    if (cx_field('zustimmung', 5) !== 'ja') {
        cx_respond(false, 'Bitte bestätige, dass du den Newsletter erhalten möchtest.');
    }
    if (!cx_send_optin($email, $name, 'newsletter')) {
        cx_respond(false, 'Die Bestätigungsmail konnte gerade nicht verschickt werden. ' . $fallback);
    }
    cx_respond(true, 'Fast geschafft! Bitte bestätige deine Anmeldung über den Link in der E-Mail, die wir dir gerade geschickt haben.', '/newsletter/danke/');
}

if ($form === 'webseite') {
    cx_webseite($c, $email, $name, $fallback);
}

if ($form !== 'beta') {
    cx_respond(false, 'Ungültige Anfrage.');
}

// ---------------- Beta-Bewerbung ----------------
$konten = cx_field('konten', 20);
$plattform = cx_field('plattform', 120);
$erfahrung = cx_field('erfahrung', 40);
$nachricht = cx_field('nachricht', 2000);
$newsletter = cx_field('newsletter', 5) === 'ja';

if ($name === '') {
    cx_respond(false, 'Bitte gib deinen Vornamen an.');
}
if (cx_field('datenschutz', 5) !== 'ja') {
    cx_respond(false, 'Bitte bestätige, dass du die Datenschutzerklärung gelesen hast.');
}

// 1. Tim sofort über die Bewerbung informieren (interne Mail an eine feste Adresse, kein fremder
//    Empfänger). Hinweis: Brevo-Eintrag und Dankes-Mail an die Person folgen erst NACH Bestätigung
//    der E-Mail-Adresse (Double-Opt-in) – siehe Schritt 2 und bestaetigen.php.
$rows = '';
foreach ([
    'Vorname' => $name, 'E-Mail' => $email, 'Prop-Konten' => $konten, 'Plattform' => $plattform,
    'Erfahrung' => $erfahrung, 'Newsletter' => $newsletter ? 'ja (nach Bestätigung)' : 'nein', 'Nachricht' => $nachricht,
] as $k => $v) {
    $rows .= '<tr><td style="padding:6px 12px 6px 0;color:#a1a1a1;vertical-align:top;white-space:nowrap">' . cx_h($k)
        . '</td><td style="padding:6px 0;color:#f4f4f0">' . nl2br(cx_h($v !== '' ? $v : '–')) . '</td></tr>';
}
$notify = (string) ($c['notify_email'] ?? 'tk@crypto-x.at');
cx_mail($notify, 'Tim', 'Neue Beta-Bewerbung: ' . $name,
    cx_mail_layout('Neue Beta-Bewerbung', '<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px">' . $rows . '</table>'
        . '<p style="margin:18px 0 0;font-size:14px;color:#a1a1a1">⚠ Die E-Mail-Adresse ist noch nicht bestätigt. Der Kontakt landet erst in der Beta-Liste in Brevo, wenn die Person den Bestätigungslink in ihrer E-Mail klickt. Mit „Antworten“ schreibst du direkt an die Person.</p>'),
    $email);

// 2. Double-Opt-in-Mail an die Bewerberin bzw. den Bewerber. Die Angaben reisen signiert im Link mit;
//    erst nach dem Klick trägt bestaetigen.php den Kontakt in Brevo ein und schickt die Dankes-Mail.
//    So wird niemand ohne Bestätigung der eigenen Adresse eingetragen oder angeschrieben.
$extra = ['nl' => $newsletter ? 1 : 0];
if ($konten !== '') {
    $extra['kt'] = $konten;
}
if ($plattform !== '') {
    $extra['pf'] = $plattform;
}
if ($erfahrung !== '') {
    $extra['ef'] = $erfahrung;
}
if (!cx_send_optin($email, $name, 'beta', $extra)) {
    cx_respond(false, 'Die Bestätigungsmail konnte gerade nicht verschickt werden. ' . $fallback);
}

cx_respond(true, 'Fast geschafft! Bitte bestätige deine Bewerbung über den Link in der E-Mail, die wir dir gerade geschickt haben.', '/beta/danke/');

// ---------------- Webseiten-Anfrage ----------------
function cx_webseite(array $c, string $email, string $name, string $fallback): void
{
    $f = [
        'Name' => $name,
        'E-Mail' => $email,
        'Telefon' => preg_replace('/[^0-9+\/ ()-]/', '', cx_field('telefon', 40)) ?? '',
        'Unternehmen / Branche' => cx_field('firma', 120),
        'Paket' => cx_field('paket', 40),
        'Bisherige Webseite' => cx_field('url', 200),
        'Domain vorhanden' => cx_field('domain', 20),
        'Zeitrahmen' => cx_field('zeit', 40),
        'Nachricht' => cx_field('nachricht', 3000),
        'Gefunden über' => cx_field('quelle', 120),
    ];
    if ($name === '') {
        cx_respond(false, 'Bitte gib deinen Namen an.');
    }
    if (cx_field('datenschutz', 5) !== 'ja') {
        cx_respond(false, 'Bitte bestätige, dass du die Datenschutzerklärung gelesen hast.');
    }

    $saved = cx_contact($email, $name, [(int) ($c['list_webdesign'] ?? 0)], [
        'WEB_PAKET' => $f['Paket'], 'WEB_QUELLE' => $f['Gefunden über'],
    ]);

    $rows = '';
    foreach ($f as $k => $v) {
        $rows .= '<tr><td style="padding:6px 12px 6px 0;color:#a1a1a1;vertical-align:top;white-space:nowrap">' . cx_h($k)
            . '</td><td style="padding:6px 0;color:#f4f4f0">' . nl2br(cx_h($v !== '' ? $v : '–')) . '</td></tr>';
    }
    $notify = (string) ($c['notify_email'] ?? 'tk@crypto-x.at');
    $toTim = cx_mail($notify, 'Tim', 'Neue Webseiten-Anfrage: ' . $name . ($f['Paket'] !== '' ? ' (' . $f['Paket'] . ')' : ''),
        cx_mail_layout('Neue Webseiten-Anfrage', '<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px">' . $rows . '</table>'
            . '<p style="margin:18px 0 0;font-size:14px;color:#a1a1a1">Mit „Antworten“ schreibst du direkt an die Person.</p>'),
        $email);

    if (!$saved && !$toTim) {
        cx_respond(false, 'Deine Anfrage konnte gerade nicht übermittelt werden. ' . $fallback);
    }

    $inner = '<p style="margin:0 0 14px">Hallo ' . cx_h($name) . ',</p>'
        . '<p style="margin:0 0 14px">danke für deine Anfrage! Ich sehe mir deine Angaben an und melde mich innerhalb von zwei Werktagen persönlich bei dir, per E-Mail oder telefonisch, wenn du eine Nummer angegeben hast.</p>'
        . '<p style="margin:0 0 14px">Gemeinsam klären wir dann, was deine Seite können soll, und du bekommst ein unverbindliches Angebot.</p>'
        . '<p style="margin:0 0 4px">Viele Grüße<br>Tim</p>';
    cx_mail($email, $name, 'Deine Anfrage für eine Webseite', cx_mail_layout('Danke für deine Anfrage', $inner), $notify);

    cx_respond(true, 'Danke! Deine Anfrage ist angekommen.', (string) ($c['weiter_webseite'] ?? '/webseite-erstellen-lassen/danke/'));
}

