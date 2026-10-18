# CryptoX – Webseite

Neue, statische Webseite für **crypto-x.at**. Sie ersetzt die WordPress-Seite. Das Design ist komplett neu; von der alten Seite stammen nur die Markenfarben (Schwarz und Lime `#dcf763`) und das Logo.

Im Mittelpunkt steht das **Risiko-Cockpit** (Beta) für Futures-Prop-Trader. Es läuft direkt auf der Seite unter `/cockpit/`. In der Beta-Phase werden Tester gesucht (Bewerbung per E-Mail oder Telegram).

Crypto X Solutions tritt als **IT-Dienstleister** auf (Softwareentwicklung und Software-Schulungen), nicht als Finanzdienstleister. Bitte bei neuen Texten darauf achten: keine Anlageempfehlungen, Signale oder Gewinnversprechen.

Das „X“ in CryptoX steht für vier Bereiche: **Trading, Tools, Education und Crypto**.

## Struktur

```
index.html                         Startseite
cockpit/                           Risiko-Cockpit (das Werkzeug selbst)
wissen/                            Artikel-Übersicht + prop-trading-einfach-erklaert/
2025/…/                            Bestehende Artikel (alte URLs beibehalten)
ueber-mich/                        Über mich
impressum/, datenschutz/           Rechtliches (Österreich)
blog/, faqs/, portfolio/…          Ersatz-Weiterleitungen von alten WordPress-Adressen
.htaccess                          Apache: HTTPS, 301-Weiterleitungen, Sicherheits-Header, Cache
404.html, sitemap.xml, robots.txt
assets/css/style.css               Design (Farben unter :root)
assets/css/cockpit.css             Design des Cockpits
assets/js/cockpit.js               Logik des Cockpits (rechnet nur lokal im Browser)
assets/js/main.js                  Mobiles Menü
assets/fonts/                      Unbounded, Manrope, JetBrains Mono (lokal, OFL-Lizenz)
assets/img/                        Logo, Bilder, Cockpit-Screenshots
```

## Datenschutz

- Keine Cookies, kein Tracking, keine Google-Fonts. Deshalb braucht die Seite keinen Cookie-Banner.
- Das Cockpit speichert Eingaben nur im `localStorage` des Besuchers. Es wird nichts an einen Server übertragen.

## Lokal ansehen

```
python3 -m http.server 8000
```

Dann http://localhost:8000 öffnen. Ein Doppelklick auf die Datei funktioniert wegen der absoluten Pfade nicht.

## Vor dem Livegang (ALL-INKL)

Die Seite liegt auf dem Webspace von ALL-INKL.COM (KAS). Im KAS prüfen bzw. erledigen:

- **AV-Vertrag** (Auftragsverarbeitung) mit ALL-INKL abschließen. Auf ihn verweist die Datenschutzerklärung.
- **Logfiles:** Aufbewahrung auf höchstens 7 Tage stellen bzw. prüfen und IP-Anonymisierung aktivieren, falls angeboten.
- **SSL** (kostenloses Let's-Encrypt-Zertifikat) für crypto-x.at und www.crypto-x.at aktivieren.

## Hochladen auf den Webspace

1. Die alte WordPress-Installation sichern (Backup beim Anbieter oder per FTP herunterladen).
2. Den Inhalt dieses Ordners per FTP/SFTP in das Hauptverzeichnis des Webspace laden. Die versteckte Datei `.htaccess` muss mit, die Ordner `.git` und `README.md` nicht.
3. Prüfen, dass HTTPS (SSL-Zertifikat) beim Anbieter aktiv ist, dann https://crypto-x.at/ aufrufen.
4. WordPress-Dateien und die Datenbank erst löschen, wenn die neue Seite läuft.

## Automatisch veröffentlichen (GitHub Actions)

`.github/workflows/deploy.yml` lädt die Seite per FTPS auf den ALL-INKL-Webspace. Es werden nur geänderte Dateien übertragen, nichts wird gelöscht.

- **Automatisch** bei jeder Änderung auf `main`
- **Manuell** über GitHub → Actions → „Webseite veröffentlichen“ → „Run workflow“

Einmalig die vier Secrets unter GitHub → Settings → Secrets and variables → Actions anlegen: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_SERVER_DIR`. Die Werte stehen im KAS unter „FTP“ und „Domains“. Ohne Secrets läuft der Workflow durch, veröffentlicht aber nichts.

## Kundenportal auf tim-kofler.at

Unter **tim-kofler.at/kunden/** melden sich Webdesign-Kunden an und laden Bilder, Logos und Texte hoch. Tim verwaltet die Kunden unter **tim-kofler.at/kunden/admin/** und bekommt bei jedem Upload eine E-Mail (über Brevo, an `notify_email`).

```
webdesign/kunden/index.php         Anmeldung und Upload für Kunden
webdesign/kunden/admin/index.php   Admin: Kunden anlegen, Passwörter, Uploads ansehen/herunterladen/löschen
webdesign/api/kunden-lib.php       Logik (Konten, Schutz vor Passwort-Raten, Upload-Prüfung, Benachrichtigung)
webdesign/assets/css/portal.css    Design des Portals
webdesign/api/admin-2fa-lib.php    Zwei-Faktor-Anmeldung für den Admin (TOTP nach RFC 6238, Notfall-Codes)
webdesign/assets/js/portal.js      Fortschrittsbalken beim Hochladen, QR-Code für die Authenticator-App
kunden/                            Pro Kunde ein Ordner im Repo, Vorlage in kunden/_vorlage/
```

- Konten und hochgeladene Dateien liegen nur auf dem Webspace unter `api/_data/kunden/` (für Besucher gesperrt, nicht im Repo). Passwörter nur als Hash.
- Einrichten: `tim-kofler.at/kunden/admin/` aufrufen, Admin-Passwort wählen, den angezeigten Hash als `admin_password_hash` in `api/_data/config.php` auf dem Webspace eintragen (siehe `config.example.php`).
- Zwei-Faktor-Anmeldung (nur Admin): Im Admin auf **Sicherheit** gehen, QR-Code mit Google Authenticator scannen, Code bestätigen, die zehn Notfall-Codes sicher aufheben. Danach fragt die Anmeldung nach dem Passwort den 6-stelligen Code ab. Das Geheimnis liegt nur auf dem Webspace in `api/_data/kunden/admin-2fa.json`. Handy und Notfall-Codes weg: diese Datei im KAS-Dateimanager löschen, dann reicht wieder das Passwort, und neu einrichten.
- Die PHP-Grenzen fürs Hochladen (200 MB pro Datei, 1 GB pro Durchgang, 10 Minuten Laufzeit) setzt `webdesign/kunden/.user.ini`. Sie wirken nach etwa 5 Minuten. Das Portal zeigt den Kunden automatisch die tatsächlich erlaubte Größe, daran sieht man, ob die Werte greifen.

## Newsletter auf tim-kofler.at

Anmeldung unter **tim-kofler.at/newsletter/** und am Ende der Startseite (`#newsletter`). Als Anreiz gibt es eine Checkliste („10 Punkte für mehr Anfragen“), die nach der Bestätigung unter `/newsletter/bestaetigt/` erscheint und zusätzlich per E-Mail verlinkt wird.

- Ablauf: Formular → `api/anmelden.php` schickt die Bestätigungsmail (Double-Opt-in, signierter Link, 7 Tage gültig) → `api/bestaetigen.php` trägt den Kontakt in die Brevo-Liste ein und protokolliert die Einwilligung in `api/_data/einwilligungen.log`.
- Einrichten: In Brevo eine Liste „Newsletter tim-kofler.at“ anlegen und in `api/_data/config.php` auf dem Webspace `list_newsletter`, `newsletter_name`, `newsletter_inhalt` und `newsletter_geschenk` eintragen (siehe `webdesign/api/config.example.php`). Ohne `list_newsletter` lehnt das Formular Anmeldungen ab.
- Versand: Newsletter als Kampagne in Brevo an diese Liste. Brevo setzt den Abmeldelink automatisch ein. Öffnungs- und Klickmessung in Brevo ausschalten (Versprechen „Kein Tracking“, steht so in der Datenschutzerklärung).
