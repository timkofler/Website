<?php
// CryptoX – Bestätigungslink aus der Newsletter-Mail (Double-Opt-in).

declare(strict_types=1);

require __DIR__ . '/lib.php';

header('X-Robots-Tag: noindex');

if (!cx_ready()) {
    cx_page('Gerade nicht verfügbar', 'Die Bestätigung ist im Moment nicht möglich. Bitte versuche es später noch einmal.', 503);
}

$data = cx_token_read((string) ($_GET['t'] ?? ''));
if ($data === null) {
    cx_page('Link ungültig oder abgelaufen', 'Dieser Bestätigungslink ist ungültig oder älter als 7 Tage. Melde dich einfach noch einmal unter ' . preg_replace('~^https?://~', '', cx_brand()['site']) . '/newsletter/ an.');
}

$email = cx_email((string) $data['e']);
if ($email === '') {
    cx_page('Link ungültig', 'Dieser Bestätigungslink ist ungültig.');
}

$c = cx_config();

// ---------------- Webseiten-Anfrage: jetzt (nach Bestätigung) eintragen ----------------
if (($data['s'] ?? '') === 'webseite') {
    $name = (string) ($data['n'] ?? '');
    $ok = cx_contact($email, $name, [(int) ($c['list_webdesign'] ?? 0)], [
        'WEB_PAKET' => (string) ($data['pk'] ?? ''),
        'WEB_QUELLE' => (string) ($data['ql'] ?? ''),
        'OPTIN_DATUM' => date('Y-m-d'),
    ], ['emailBlacklisted' => false]); // ausdrückliche Einwilligung hebt eine frühere Abmeldung auf
    if (!$ok) {
        cx_page('Das hat nicht geklappt', 'Deine Bestätigung konnte gerade nicht gespeichert werden. Bitte klick den Link später noch einmal an.', 502);
    }
    cx_consent_log('optin_bestaetigt_webseite', $email);
    // Gespeicherte Anfrage als bestätigt markieren und Tim aufs Handy melden (nur beim ersten Klick).
    require_once __DIR__ . '/anfrage-lib.php';
    require_once __DIR__ . '/push-lib.php';
    $afId = (string) ($data['af'] ?? '');
    if (ew_valid_id($afId) && ($af = af_mark_optin('anfrage', $afId))) {
        $pk = (string) ($af['felder']['Paket'] ?? '');
        if (($af['art'] ?? '') === 'check') {
            pu_send("🔎 <b>Neuer Webseiten-Check</b>\n" . cx_h((string) ($af['firma'] ?? '')) . "\n⏱️ <i>Antwort innerhalb von 24 Stunden (Werktage)</i>", '/kunden/admin/?anfrage=' . $afId, false, true);
        } else {
            pu_send('✅ <b>Neue Anfrage' . (($af['art'] ?? 'anfrage') !== 'anfrage' ? ': ' . cx_h(AF_ARTEN[$af['art']] ?? '') : '') . '</b>' . ($pk !== '' ? "\n📦 " . cx_h($pk) : '') . "\n📍 über " . cx_h(af_quelle_name(af_quelle((string) ($af['quelle'] ?? '')))),
                '/kunden/admin/?anfrage=' . $afId, false, true);
        }
    }

    $notify = (string) ($c['notify_email'] ?? 'tk@crypto-x.at');
    // Webseiten-Check (/check/): eigene Eingangsbestätigung mit dem 24-Stunden-Versprechen.
    if (!empty($data['ck'])) {
        $inner = '<p style="margin:0 0 14px">Hallo ' . cx_h($name) . ',</p>'
            . '<p style="margin:0 0 14px">danke, deine E-Mail-Adresse ist bestätigt! Ich sehe mir deine Webseite jetzt persönlich am Handy und am PC an und schicke dir meine Einschätzung innerhalb von 24 Stunden an Werktagen an diese Adresse.</p>'
            . '<p style="margin:0 0 14px">Du bekommst eine ehrliche Antwort, auch wenn alles passt. Ein Anruf oder Verkaufsgespräch folgt nicht.</p>'
            . cx_mail_gruss();
        cx_mail($email, $name, 'Dein Webseiten-Check ist bei mir', cx_mail_layout('Danke, ich schau sie mir an', $inner), $notify);
        header('Location: /check/bestaetigt/', true, 303);
        exit;
    }

    // Eingangsbestätigung an die Person (Antworten gehen an Tim). Tim wurde bereits bei der Anfrage informiert.
    $verein = !empty($data['v']);
    $inner = '<p style="margin:0 0 14px">Hallo ' . cx_h($name) . ',</p>'
        . '<p style="margin:0 0 14px">danke, deine E-Mail-Adresse ist bestätigt und deine Anfrage ist bei mir! Ich sehe mir deine Angaben an und melde mich innerhalb von zwei Werktagen persönlich bei dir, per E-Mail, oder auf WhatsApp bzw. Telegram, wenn du eine Nummer angegeben hast.</p>'
        . ($verein
            ? '<p style="margin:0 0 14px">Gemeinsam klären wir dann, was auf eure Vereinsseite soll. Die Gestaltung ist für euch kostenlos.</p>'
            : '<p style="margin:0 0 14px">Gemeinsam klären wir dann, was deine Seite können soll, und du bekommst ein unverbindliches Angebot.</p>')
        . cx_mail_gruss();
    cx_mail($email, $name, $verein ? 'Deine Anfrage für eine Vereinsseite' : 'Deine Anfrage für eine Webseite', cx_mail_layout('Danke für deine Anfrage', $inner), $notify);

    header('Location: /webseite-erstellen-lassen/bestaetigt/', true, 303);
    exit;
}

// ---------------- Gratis-Entwurf: jetzt (nach Bestätigung) eintragen + Entwurf-Versand starten ----------------
if (($data['s'] ?? '') === 'gratisentwurf') {
    require __DIR__ . '/entwurf-lib.php';
    $name = (string) ($data['n'] ?? '');
    // Gespeicherte Anfrage laden; fehlt sie (z. B. Schreibfehler), reichen E-Mail/Name/Firma aus dem Token.
    $stored = ew_read((string) ($data['id'] ?? ''));
    $d = ($stored !== [] && cx_email((string) ($stored['email'] ?? '')) === $email)
        ? $stored
        : ['email' => $email, 'name' => $name, 'firma' => (string) ($data['fi'] ?? ''), 'inhalt' => [], 'farbe' => '', 'farbe_hex' => '', 'quelle' => ''];

    $lists = [(int) ($c['list_entwurf'] ?? $c['list_webdesign'] ?? 0)];
    if (!empty($data['nl'])) {
        $lists[] = (int) ($c['list_newsletter'] ?? 0); // zusätzlich Newsletter gewünscht (angekreuzt + jetzt bestätigt)
    }
    $ok = cx_contact($email, $name, $lists, [
        'WEB_PAKET' => 'Gratis-Entwurf', 'WEB_QUELLE' => (string) ($d['quelle'] ?? ''),
        'OPTIN_DATUM' => date('Y-m-d'),
    ], ['emailBlacklisted' => false]); // ausdrückliche Einwilligung hebt eine frühere Abmeldung auf
    if (!$ok) {
        cx_page('Das hat nicht geklappt', 'Deine Bestätigung konnte gerade nicht gespeichert werden. Bitte klick den Link später noch einmal an.', 502);
    }
    cx_consent_log('optin_bestaetigt_gratisentwurf', $email);
    require_once __DIR__ . '/anfrage-lib.php';
    require_once __DIR__ . '/push-lib.php';
    $ewId = (string) ($data['id'] ?? '');
    if ($stored !== [] && ($ew = af_mark_optin('entwurf', $ewId))) {
        $wo = implode(', ', array_filter([(string) ($ew['branche'] ?? ''), (string) ($ew['ort'] ?? '')]));
        pu_send("🎨 <b>Neuer Gratis-Entwurf</b>" . ($wo !== '' ? "\n" . cx_h($wo) : '') . "\n⏱️ <i>Entwurf innerhalb von 48 Stunden schicken</i>", '/kunden/admin/?entwurf=' . $ewId, false, true);
    }

    // Eingangsbestätigung „ich lege los" an die Person. Tim wurde bereits bei der Anfrage informiert.
    ew_send_eingang($d, (string) ($c['notify_email'] ?? 'office@tim-kofler.at'));

    header('Location: /entwurf/bestaetigt/', true, 303);
    exit;
}

$sicherheit = ($data['s'] ?? '') === 'sicherheit'; // Anmeldung über /sicherheit/
$attrs = ['OPTIN_DATUM' => date('Y-m-d')];
if ($sicherheit) {
    $attrs['NL_THEMA'] = 'Sicherheit';
}
$ok = cx_contact($email, (string) ($data['n'] ?? ''), [(int) ($c['list_newsletter'] ?? 0)], $attrs, ['emailBlacklisted' => false]); // neue, ausdrückliche Einwilligung hebt eine frühere Abmeldung auf
if (!$ok) {
    cx_page('Das hat nicht geklappt', 'Deine Anmeldung konnte gerade nicht gespeichert werden. Bitte klick den Link später noch einmal an.', 502);
}

cx_consent_log('optin_bestaetigt_' . preg_replace('/[^a-z]/', '', (string) ($data['s'] ?? '')), $email);

// Dankeschön nach der Bestätigung (nur wenn in der config.php eingestellt, z. B. die Checkliste auf tim-kofler.at).
$geschenk = (array) ($c['newsletter_geschenk'] ?? []);
if ($sicherheit) {
    // Statt der Checkliste die Anleitung zur PHP-Sicherheitslücke
    $geschenk = ['titel' => 'PHP-Check-Liste', 'url' => '/sicherheit/bestaetigt/'];
}
if (!empty($geschenk['url']) && !empty($geschenk['titel'])) {
    $n = (string) ($data['n'] ?? '');
    $inner = '<p style="margin:0 0 14px">' . ($n !== '' ? 'Hallo ' . cx_h($n) . ',' : 'Hallo,') . '</p>'
        . '<p style="margin:0 0 14px">danke für deine Anmeldung! Wie versprochen hier der Link zu deiner ' . cx_h((string) $geschenk['titel']) . '. Heb dir diese E-Mail ruhig auf, dann findest du sie jederzeit wieder.</p>'
        . cx_button(cx_brand()['site'] . (string) $geschenk['url'], 'Zur ' . (string) $geschenk['titel'])
        . cx_mail_gruss();
    cx_mail($email, $n, 'Deine ' . (string) $geschenk['titel'], cx_mail_layout('Danke für deine Anmeldung', $inner));
}
header('Location: ' . ($sicherheit ? '/sicherheit/bestaetigt/' : '/newsletter/bestaetigt/'), true, 303);
