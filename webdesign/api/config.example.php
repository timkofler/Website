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
    // Optional: eigene Brevo-Liste für Anfragen über /entwurf/ (Gratis-Entwurf). Ohne diese Zeile landen sie in list_webdesign.
    // 'list_entwurf'   => 0,
    // Newsletter-Liste in Brevo (Kontakte → Listen → neue Liste "Newsletter tim-kofler.at", deren ID hier eintragen).
    // Erst wenn diese Zeile in der config.php steht, nimmt tim-kofler.at/newsletter/ Anmeldungen an.
    'list_newsletter'  => 0,
    // Text in der Bestätigungsmail (Double-Opt-in)
    'newsletter_name'  => 'Newsletter von Tim Kofler – Webdesign',
    'newsletter_inhalt' => 'Darin bekommst du ein paar Mal im Jahr praktische Tipps für deine Webseite, dein Google-Profil und mehr Anfragen, ohne Spam.',
    // Nach der Bestätigung bekommt die Person zusätzlich eine E-Mail mit dem Link zur Checkliste
    'newsletter_geschenk' => ['titel' => 'Checkliste: 10 Punkte für mehr Anfragen', 'url' => '/newsletter/bestaetigt/'],
    // Absender in Brevo bestätigt
    'sender_email'     => 'office@tim-kofler.at',
    'sender_name'      => 'Tim Kofler – Webdesign',
    // Hierhin gehen neue Anfragen
    'notify_email'     => 'office@tim-kofler.at',
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

    // ---------------- Kundenportal (/kunden/) ----------------
    // Hash des Admin-Passworts. Erzeugen: tim-kofler.at/kunden/admin/ aufrufen, solange das Feld leer ist,
    // Passwort wählen und den angezeigten Hash hier eintragen. Das Passwort selbst steht nirgends.
    'admin_password_hash' => '',
    // Größte Datei in MB (Fotos vom Handy oft 10–20 MB, Videos mehr).
    // Wirkt nur bis zu den PHP-Werten upload_max_filesize/post_max_size im KAS, diese entsprechend hochsetzen.
    'upload_max_mb'    => 200,
    // Speicherplatz je Kunde in GB
    'kunde_max_gb'     => 10,

    // ---------------- Handy-Benachrichtigung (Telegram) ----------------
    // Schlüssel des eigenen Bots von @BotFather (z. B. 123456789:AA…). Danach im Admin unter Werbung → Benachrichtigungen „Chat suchen“.
    // 'telegram_token'  => '',
    // Meldungen von Claude über denselben Bot (api/melden.php). Nur der SHA-256-Hash des Schlüssels, der Schlüssel selbst
    // liegt im Project-Memory. Leer = Endpunkt aus.
    // 'claude_melde_hash' => '',

    // ---------------- KI-Antworten im Chat ("Fragen?"-Knopf) ----------------
    // API-Schlüssel von Anthropic: platform.claude.com → Settings → API Keys → "Create Key" (Name z. B. "tim-kofler.at Chat").
    // Nur hier eintragen, nie im Repo oder in einer Mail. Leer = der Chat antwortet wie bisher nur mit festen Antworten.
    'anthropic_api_key' => '',
    // Modell. Claude Haiku 5.5 ist schnell und günstig (rund 0,1 Cent pro Frage).
    // 'chat_model'      => 'claude-haiku-5-5',
    // Grenzen: Fragen pro Besucher je Stunde und je Tag, und für alle Besucher zusammen pro Tag.
    // 'chat_pro_stunde' => 30,
    // 'chat_pro_tag'    => 100,
    // 'chat_tageslimit' => 400,
    // KI vorübergehend ausschalten, ohne den Schlüssel zu löschen:
    // 'chat_aus'        => true,
];
