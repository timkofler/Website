# CryptoX – Webseite

Neue, statische Webseite für **crypto-x.at**. Sie ersetzt die WordPress-Seite. Das Design ist komplett neu; von der alten Seite stammen nur die Markenfarben (Schwarz und Lime `#dcf763`) und das Logo.

Im Mittelpunkt steht das **Risiko-Cockpit** für Futures-Prop-Trader. Es läuft direkt auf der Seite unter `/cockpit/`.

Das „X“ in CryptoX steht für vier Bereiche: **Trading, Tools, Education und Crypto**.

## Struktur

```
index.html                         Startseite
cockpit/                           Risiko-Cockpit (das Werkzeug selbst)
wissen/                            Artikel-Übersicht + prop-trading-einfach-erklaert/
2025/…/                            Bestehende Artikel (alte URLs beibehalten)
ueber-mich/                        Über mich
impressum/, datenschutz/           Rechtliches (Österreich)
blog/, faqs/, portfolio/…          Weiterleitungen von alten WordPress-Adressen
_redirects                         Echte 301-Weiterleitungen (Cloudflare Pages / Netlify)
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

## Vor dem Livegang ersetzen

In `datenschutz/index.html`: Hosting-Anbieter, Löschfrist der Logfiles, E-Mail-Anbieter und das Datum.

```
grep -rn 'class="ph"' --include=*.html .
```

## Hosting

Empfohlen ist Cloudflare Pages oder Netlify: kostenlos, mit automatischer Veröffentlichung aus diesem Repository und Unterstützung für die `_redirects`-Datei.
