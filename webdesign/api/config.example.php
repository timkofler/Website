<?php
// VORLAGE – diese Datei NICHT ausfüllen.
// Kopie als  api/_data/config.php  direkt auf dem Webspace von tim-kofler.at anlegen
// (KAS-Dateimanager oder FTP) und dort die Werte eintragen. Die Datei liegt nicht im Git-Repository
// und wird beim Veröffentlichen nie überschrieben oder gelöscht.
return [
    // Brevo → Einstellungen → SMTP & API → API-Schlüssel (derselbe Schlüssel wie bei crypto-x.at)
    'brevo_api_key'    => '',
    // Zufällige Zeichenkette, mindestens 32 Zeichen (ein eigener Wert, nicht der von crypto-x.at)
    'secret'           => '',
    // Liste für Webseiten-Anfragen in Brevo (Kontakte → Listen)
    'list_webdesign'   => 0,
    // Absender in Brevo bestätigt
    'sender_email'     => 'tk@crypto-x.at',
    'sender_name'      => 'Tim Kofler – Webdesign',
    // Hierhin gehen neue Anfragen
    'notify_email'     => 'tk@crypto-x.at',
    // Auftritt in Seiten-Mails: Name, Logo und Adresse
    'site'             => 'https://tim-kofler.at',
    'name'             => 'Tim Kofler – Webdesign',
    'wordmark_html'    => 'Tim Kofler',
    'footer_name'      => 'Tim Kofler – Webdesign',
    // Erlaubte Herkunft der Formulare
    'origins'          => ['https://tim-kofler.at', 'https://www.tim-kofler.at'],
    // Seite nach dem Absenden
    'weiter_webseite'  => '/danke/',
    // Akzentfarbe (Schwarz-Weiß mit Grau) für Buttons in Mails
    'accent'           => '#d9d9d9',
];
