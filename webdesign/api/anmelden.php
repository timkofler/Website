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
$name = str_replace(['<', '>', '"'], '', cx_field('name', 80));
// Keine Links oder Domains im Namen: er steht in der Bestätigungsmail an die angegebene Adresse.
if (cx_has_link($name)) {
    cx_respond(false, 'Bitte gib nur deinen Namen an, ohne Links, Adressen oder Telefonnummern.');
}

// Rückruf-Wunsch (tim-kofler.at): nur Name und Telefonnummer, daher vor der E-Mail-Prüfung.
if ($form === 'rueckruf' && array_key_exists('list_webdesign', $c)) {
    cx_rueckruf($c, $name, $fallback);
}

if ($email === '') {
    cx_respond(false, 'Bitte gib eine gültige E-Mail-Adresse ein.');
}

// Nur Formulare annehmen, deren Liste in der config.php dieses Webspace steht
// (tim-kofler.at kennt Webseiten-Anfrage, Gratis-Entwurf und Newsletter, crypto-x.at Beta und Newsletter).
$lists = ['newsletter' => 'list_newsletter', 'beta' => 'list_beta', 'webseite' => 'list_webdesign', 'entwurf' => 'list_webdesign'];
if (!isset($lists[$form]) || !array_key_exists($lists[$form], $c)) {
    cx_respond(false, 'Ungültige Anfrage.');
}

if ($form === 'newsletter') {
    if (cx_field('zustimmung', 5) !== 'ja') {
        cx_respond(false, 'Bitte bestätige, dass du den Newsletter erhalten möchtest.');
    }
    // Anmeldung über /sicherheit/ wird als eigenes Thema vermerkt (gleiche Liste, Attribut NL_THEMA in Brevo).
    $thema = cx_field('thema', 20) === 'sicherheit' ? 'sicherheit' : 'newsletter';
    if (!cx_send_optin($email, $name, $thema)) {
        cx_respond(false, 'Die Bestätigungsmail konnte gerade nicht verschickt werden. ' . $fallback);
    }
    cx_respond(true, 'Fast geschafft! Bitte bestätige deine Anmeldung über den Link in der E-Mail, die wir dir gerade geschickt haben.', $thema === 'sicherheit' ? '/sicherheit/danke/' : '/newsletter/danke/');
}

if ($form === 'entwurf') {
    require __DIR__ . '/entwurf-lib.php';
    ew_handle($c, $fallback);
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

// 1. Kontakt in die Beta-Liste (Rechtsgrundlage: Anbahnung der Teilnahme, Art. 6 Abs. 1 lit. b DSGVO).
$saved = cx_contact($email, $name, [(int) ($c['list_beta'] ?? 0)], [
    'BETA_KONTEN' => $konten, 'BETA_PLATTFORM' => $plattform, 'BETA_ERFAHRUNG' => $erfahrung,
]);

// 2. Benachrichtigung an Tim mit allen Angaben. Antworten gehen direkt an die Bewerberin bzw. den Bewerber.
$rows = '';
foreach ([
    'Vorname' => $name, 'E-Mail' => $email, 'Prop-Konten' => $konten, 'Plattform' => $plattform,
    'Erfahrung' => $erfahrung, 'Newsletter' => $newsletter ? 'ja (Bestätigung ausstehend)' : 'nein', 'Nachricht' => $nachricht,
] as $k => $v) {
    $rows .= '<tr><td style="padding:6px 12px 6px 0;color:#a1a1a1;vertical-align:top;white-space:nowrap">' . cx_h($k)
        . '</td><td style="padding:6px 0;color:#f4f4f0">' . nl2br(cx_h($v !== '' ? $v : '–')) . '</td></tr>';
}
$notify = (string) ($c['notify_email'] ?? 'tk@crypto-x.at');
$toTim = cx_mail($notify, 'Tim', 'Neue Beta-Bewerbung: ' . $name,
    cx_mail_layout('Neue Beta-Bewerbung', '<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px">' . $rows . '</table>'
        . '<p style="margin:18px 0 0;font-size:14px;color:#a1a1a1">' . ($saved ? 'Der Kontakt steht in der Beta-Liste in Brevo.' : 'Achtung: Der Kontakt konnte nicht in Brevo gespeichert werden.') . ' Mit „Antworten“ schreibst du direkt an die Person.</p>'),
    $email);

if (!$saved && !$toTim) {
    cx_respond(false, 'Deine Bewerbung konnte gerade nicht übermittelt werden. ' . $fallback);
}

// 3. Eingangsbestätigung an die Bewerberin bzw. den Bewerber.
$inner = '<p style="margin:0 0 14px">Hallo ' . cx_h($name) . ',</p>'
    . '<p style="margin:0 0 14px">danke für deine Bewerbung als Beta-Tester für das CryptoX Dashboard! Ich sehe mir deine Angaben an und melde mich in den nächsten Tagen persönlich bei dir, meistens per E-Mail.</p>'
    . '<p style="margin:0 0 14px">Sobald dein Zugang eingerichtet ist, bekommst du von mir die Adresse, deine Anmeldedaten und eine kurze Anleitung für die ersten Schritte.</p>'
    . '<p style="margin:0 0 14px">Bis dahin kannst du dir die <a href="https://crypto-x.at/cockpit/" target="_blank" rel="noopener" style="color:#dcf763">Live-Demo</a> ansehen.</p>'
    . '<p style="margin:0 0 4px">Viele Grüße<br>Tim</p>'
    . '<p style="margin:18px 0 0;font-size:13px;color:#8a8a8a">Das CryptoX Dashboard ist ein Werkzeug zur Organisation und Kontrolle deiner eigenen Kontoregeln. Es gibt keine Handelssignale und keine Anlageberatung.</p>';
cx_mail($email, $name, 'Deine Beta-Bewerbung für das CryptoX Dashboard', cx_mail_layout('Danke für deine Bewerbung', $inner), $notify);

// 4. Newsletter nur nach eigener Bestätigung (Double-Opt-in).
if ($newsletter) {
    cx_send_optin($email, $name, 'beta');
}

cx_respond(true, 'Danke! Deine Bewerbung ist angekommen.', '/beta/danke/');

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
        'Rechner (nur für dich)' => cx_field('rechner', 1000),
        'Empfohlen von' => cx_field('empfohlen', 120),
        'Gefunden über' => cx_field('quelle', 120),
    ];
    // Nur von der Gründer-Seite (/gruender/): Gründungszeitpunkt und Logo-Stand,
    // nur von der Vereins-Seite (/verein/): Art des Vereins und Funktion
    foreach (['Gegründet' => 'gegruendet', 'Logo vorhanden' => 'logo', 'Art des Vereins' => 'vereinsart', 'Funktion im Verein' => 'funktion'] as $k => $field) {
        $v = cx_field($field, 40);
        if ($v !== '') {
            $f[$k] = $v;
        }
    }
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
    $toTim = cx_mail($notify, 'Tim', 'Neue Webseiten-Anfrage: ' . $name . ($f['Paket'] !== '' ? ' (' . $f['Paket'] . ')' : '')
        . ($f['Empfohlen von'] !== '' ? ' – Empfehlung von ' . $f['Empfohlen von'] : ''),
        cx_mail_layout('Neue Webseiten-Anfrage', '<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px">' . $rows . '</table>'
            . '<p style="margin:18px 0 0;font-size:14px;color:#a1a1a1">Mit „Antworten“ schreibst du direkt an die Person.</p>'),
        $email);

    if (!$saved && !$toTim) {
        cx_respond(false, 'Deine Anfrage konnte gerade nicht übermittelt werden. ' . $fallback);
    }

    $verein = str_starts_with($f['Paket'], 'Vereinsseite');
    $inner = '<p style="margin:0 0 14px">Hallo ' . cx_h($name) . ',</p>'
        . '<p style="margin:0 0 14px">danke für deine Anfrage! Ich sehe mir deine Angaben an und melde mich innerhalb von zwei Werktagen persönlich bei dir, per E-Mail, oder auf WhatsApp bzw. Telegram, wenn du eine Nummer angegeben hast.</p>'
        . ($verein
            ? '<p style="margin:0 0 14px">Gemeinsam klären wir dann, was auf eure Vereinsseite soll. Die Gestaltung ist für euch kostenlos.</p>'
            : '<p style="margin:0 0 14px">Gemeinsam klären wir dann, was deine Seite können soll, und du bekommst ein unverbindliches Angebot.</p>')
        . '<p style="margin:0 0 4px">Viele Grüße<br>Tim</p>';
    cx_mail($email, $name, $verein ? 'Deine Anfrage für eine Vereinsseite' : 'Deine Anfrage für eine Webseite', cx_mail_layout('Danke für deine Anfrage', $inner), $notify);

    cx_respond(true, 'Danke! Deine Anfrage ist angekommen.', (string) ($c['weiter_webseite'] ?? '/webseite-erstellen-lassen/danke/'));
}


// ---------------- Rückruf-Wunsch ----------------
// Kein Kontakt bei Brevo und keine Bestätigungsmail (es gibt keine E-Mail-Adresse), nur eine Nachricht an Tim.
function cx_rueckruf(array $c, string $name, string $fallback): void
{
    $tel = trim(preg_replace('/[^0-9+\/ ()-]/', '', cx_field('telefon', 40)) ?? '');
    $wann = cx_field('wann', 40);
    if ($name === '') {
        cx_respond(false, 'Bitte gib deinen Namen an.');
    }
    if (strlen(preg_replace('/\D/', '', $tel) ?? '') < 6) {
        cx_respond(false, 'Bitte gib eine Telefonnummer an, unter der ich dich erreiche.');
    }
    if (cx_field('datenschutz', 5) !== 'ja') {
        cx_respond(false, 'Bitte bestätige, dass ich dich unter dieser Nummer zurückrufen darf.');
    }
    $f = ['Name' => $name, 'Telefon' => $tel, 'Erreichbar' => $wann, 'Gefunden über' => cx_field('quelle', 120)];
    $rows = '';
    foreach ($f as $k => $v) {
        $rows .= '<tr><td style="padding:6px 12px 6px 0;color:#a1a1a1;vertical-align:top;white-space:nowrap">' . cx_h($k)
            . '</td><td style="padding:6px 0;color:#f4f4f0">' . cx_h($v !== '' ? $v : '–') . '</td></tr>';
    }
    $notify = (string) ($c['notify_email'] ?? 'tk@crypto-x.at');
    $ok = cx_mail($notify, 'Tim', 'Rückruf-Wunsch: ' . $name . ' (' . $tel . ')',
        cx_mail_layout('Bitte zurückrufen', '<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px">' . $rows . '</table>'
            . '<p style="margin:18px 0 0;font-size:14px;color:#a1a1a1">Die Person hat keine E-Mail-Adresse angegeben, nur die Telefonnummer.</p>'));
    if (!$ok) {
        cx_respond(false, 'Dein Rückruf-Wunsch konnte gerade nicht übermittelt werden. Ruf mich gerne direkt an: +43 677 61773118.');
    }
    cx_zaehle_anfrage('rueckruf');
    cx_respond(true, 'Danke, ' . $name . '! Ich rufe dich so bald wie möglich zurück, meistens noch am selben oder am nächsten Werktag.');
}

// Abgeschickte Anfragen im anonymen Besucherzähler mitzählen (nur die Summe pro Tag und Art, keine Angaben zur Person).
function cx_zaehle_anfrage(string $art): void
{
    $lib = __DIR__ . '/zaehler-lib.php';
    if (is_file($lib)) {
        require_once $lib;
        zl_kontakt($art);
    }
}
