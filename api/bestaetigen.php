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
$name = (string) ($data['n'] ?? '');
$source = (string) ($data['s'] ?? 'newsletter');

// ---------------- Beta-Bewerbung: jetzt (nach Bestätigung) eintragen ----------------
if ($source === 'beta') {
    $lists = [(int) ($c['list_beta'] ?? 0)];
    if (!empty($data['nl'])) {
        // Beim Bewerben zusätzlich den Newsletter gewünscht.
        $lists[] = (int) ($c['list_newsletter'] ?? 0);
    }
    $ok = cx_contact($email, $name, $lists, [
        'BETA_KONTEN' => (string) ($data['kt'] ?? ''),
        'BETA_PLATTFORM' => (string) ($data['pf'] ?? ''),
        'BETA_ERFAHRUNG' => (string) ($data['ef'] ?? ''),
        'OPTIN_DATUM' => date('Y-m-d'),
    ], ['emailBlacklisted' => false]); // ausdrückliche Einwilligung hebt eine frühere Abmeldung auf
    if (!$ok) {
        cx_page('Das hat nicht geklappt', 'Deine Bestätigung konnte gerade nicht gespeichert werden. Bitte klick den Link später noch einmal an.', 502);
    }
    cx_consent_log('optin_bestaetigt_beta', $email);

    // Eingangsbestätigung an die Bewerberin bzw. den Bewerber (Antworten gehen an Tim).
    $inner = '<p style="margin:0 0 14px">Hallo ' . cx_h($name) . ',</p>'
        . '<p style="margin:0 0 14px">danke, deine E-Mail-Adresse ist bestätigt und deine Bewerbung als Beta-Tester für das CryptoX Dashboard ist bei mir! Ich sehe mir deine Angaben an und melde mich in den nächsten Tagen persönlich bei dir, meistens per E-Mail.</p>'
        . '<p style="margin:0 0 14px">Sobald dein Zugang eingerichtet ist, bekommst du von mir die Adresse, deine Anmeldedaten und eine kurze Anleitung für die ersten Schritte.</p>'
        . '<p style="margin:0 0 14px">Bis dahin kannst du dir die <a href="https://crypto-x.at/cockpit/" style="color:#dcf763">Live-Demo</a> ansehen.</p>'
        . '<p style="margin:0 0 4px">Viele Grüße<br>Tim</p>'
        . '<p style="margin:18px 0 0;font-size:13px;color:#8a8a8a">Das CryptoX Dashboard ist ein Werkzeug zur Organisation und Kontrolle deiner eigenen Kontoregeln. Es gibt keine Handelssignale und keine Anlageberatung.</p>';
    cx_mail($email, $name, 'Deine Beta-Bewerbung für das CryptoX Dashboard', cx_mail_layout('Danke für deine Bewerbung', $inner), (string) ($c['notify_email'] ?? 'tk@crypto-x.at'));

    header('Location: /beta/bestaetigt/', true, 303);
    exit;
}

// ---------------- Newsletter (Standard) ----------------
$ok = cx_contact($email, $name, [(int) ($c['list_newsletter'] ?? 0)], [
    'OPTIN_DATUM' => date('Y-m-d'),
], ['emailBlacklisted' => false]); // neue, ausdrückliche Einwilligung hebt eine frühere Abmeldung auf
if (!$ok) {
    cx_page('Das hat nicht geklappt', 'Deine Anmeldung konnte gerade nicht gespeichert werden. Bitte klick den Link später noch einmal an.', 502);
}

cx_consent_log('optin_bestaetigt_' . preg_replace('/[^a-z]/', '', $source), $email);

// Dankeschön nach der Bestätigung (nur wenn in der config.php eingestellt, z. B. die Checkliste auf tim-kofler.at).
$geschenk = (array) ($c['newsletter_geschenk'] ?? []);
if (!empty($geschenk['url']) && !empty($geschenk['titel'])) {
    $inner = '<p style="margin:0 0 14px">' . ($name !== '' ? 'Hallo ' . cx_h($name) . ',' : 'Hallo,') . '</p>'
        . '<p style="margin:0 0 14px">danke für deine Anmeldung! Wie versprochen hier der Link zu deiner ' . cx_h((string) $geschenk['titel']) . '. Heb dir diese E-Mail ruhig auf, dann findest du sie jederzeit wieder.</p>'
        . cx_button(cx_brand()['site'] . (string) $geschenk['url'], 'Zur ' . (string) $geschenk['titel'])
        . '<p style="margin:0 0 4px">Viele Grüße<br>Tim</p>';
    cx_mail($email, $name, 'Deine ' . (string) $geschenk['titel'], cx_mail_layout('Danke für deine Anmeldung', $inner));
}
header('Location: /newsletter/bestaetigt/', true, 303);
