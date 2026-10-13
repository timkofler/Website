# Crypto X Solutions – Webseite

Neue, statische Webseite für **crypto-x.at**. Sie ersetzt die bisherige WordPress-Seite und übernimmt deren Design (dunkel, Lime-Grün `#dcf763`, Schrift Montserrat).

- Kein CMS, keine Datenbank, keine Plugins: reines HTML/CSS/JS, bearbeitet mit Claude.
- Keine Cookies, kein Tracking, keine Google-Fonts. Die Schrift liegt lokal unter `assets/fonts/`, deshalb braucht die Seite keinen Cookie-Banner.
- Die alten WordPress-Adressen bleiben erhalten (z. B. `/ueber-mich/`, `/faqs/`, `/portfolio/bitcoin/` und die Blog-URLs), damit Google-Rankings und bestehende Links weiter funktionieren.

## Struktur

```
index.html                         Startseite (inkl. Bereich „Neues Dashboard“ und Preise)
ueber-mich/                        Über mich
portfolio/                         Cointipps-Übersicht + bitcoin/, ethereum-eth/, solana-sol/
blog/                              Blog-Übersicht
2025/…/                            Blog-Artikel (alte URLs beibehalten)
faqs/                              FAQ
impressum/                         Impressum (§ 5 ECG, § 63 GewO, § 25 MedienG)
datenschutz/                       Datenschutzerklärung (DSGVO, DSG, TKG 2021)
404.html, sitemap.xml, robots.txt
assets/css/style.css               Design: Farben zentral unter :root
assets/js/main.js                  Mobiles Menü
assets/img/, assets/fonts/         Bilder, Logo, Schrift
```

## Lokal ansehen

Wegen der absoluten Pfade (`/assets/...`) funktioniert ein einfacher Doppelklick auf eine Datei nicht. Starte stattdessen einen kleinen Server:

```
python3 -m http.server 8000
```

Dann im Browser http://localhost:8000 öffnen.

## Vor dem Livegang ersetzen

Alle Platzhalter stehen in eckigen Klammern, z. B. `[DASHBOARD-URL]`, Hosting- und Zahlungsanbieter sowie die UID-Nummer. So findest du sie:

```
grep -rn "\[DASHBOARD\|\[Hosting\|\[Zahlungs\|\[ATU\|\[XX\]\|\[Datum\|\[z\.&nbsp;B\." --include=*.html .
```

## Hosting

Die Seite läuft auf jedem statischen Hosting, z. B. Cloudflare Pages, Netlify, Vercel oder GitHub Pages. Wird der Anbieter mit diesem Repository verbunden, geht jede Änderung automatisch online. Den gewählten Anbieter in der Datenschutzerklärung (Abschnitt 3) eintragen.
