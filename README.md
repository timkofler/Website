# Crypto-X Website

Neue, statische Webseite für crypto-x.at – ersetzt die bisherige WordPress-Seite.
Kein CMS, keine Datenbank, keine Plugins: reines HTML/CSS/JS, das mit Claude bearbeitet wird.

## Struktur

```
index.html          Startseite (Hero, Leistungen, Dashboard, Preise, FAQ, Kontakt)
impressum.html      Impressum nach § 5 ECG, § 14 UGB, § 25 MedienG (Österreich)
datenschutz.html    Datenschutzerklärung nach DSGVO, DSG und TKG 2021
assets/css/style.css  Design (Farben zentral unter :root)
assets/js/main.js     Mobile Navigation
assets/img/           Logo, Favicon, Screenshots
```

## Lokal ansehen

`index.html` im Browser öffnen, oder:

```
python3 -m http.server 8000
```

## Platzhalter

Alle Werte in eckigen Klammern (`[E-MAIL]`, `[DASHBOARD-URL]`, `[XX]` …) müssen
vor dem Livegang ersetzt werden:

```
grep -rn "\[" *.html
```

## Hosting

Die Seite läuft auf jedem statischen Hosting, z. B. Cloudflare Pages, Netlify, Vercel
oder GitHub Pages. Bei Verbindung mit diesem Repository wird jede Änderung
automatisch veröffentlicht. Anbieter in der Datenschutzerklärung (Abschnitt 3) eintragen.
