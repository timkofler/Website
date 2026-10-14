<?php
// VORLAGE – diese Datei NICHT ausfüllen.
// Kopie als  api/_data/config.php  direkt auf dem Webspace anlegen (KAS-Dateimanager oder FTP)
// und dort die Werte eintragen. config.php liegt nicht im Git-Repository und wird beim
// Veröffentlichen nie überschrieben oder gelöscht.
return [
    // Brevo → Einstellungen → SMTP & API → API-Schlüssel
    'brevo_api_key'   => '',
    // Zufällige Zeichenkette, mindestens 32 Zeichen (signiert die Bestätigungslinks)
    'secret'          => '',
    // IDs der Listen aus Brevo → Kontakte → Listen
    'list_beta'       => 0,
    'list_newsletter' => 0,
    // In Brevo bestätigte Absenderadresse
    'sender_email'    => 'tk@crypto-x.at',
    'sender_name'     => 'CryptoX',
    // Hierhin gehen neue Beta-Bewerbungen
    'notify_email'    => 'tk@crypto-x.at',
];
