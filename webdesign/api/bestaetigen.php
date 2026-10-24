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
