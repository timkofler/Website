---
version: alpha
name: CryptoX-design-system
description: "Dunkle, technische Marketing-Seite für CryptoX (crypto-x.at): fast schwarzer Hintergrund #0b0b0b, warmweißer Text #f4f4f0 und ein einziger Akzent, das CryptoX-Lime #dcf763. Überschriften in Unbounded (breit, geometrisch, leicht negativ gesperrt), Fließtext in Manrope, Labels und Zahlen in JetBrains Mono. Flächen sind dunkle Panels mit Haarlinien-Rahmen und großen Radien. Hauptdarsteller sind Screenshots des CryptoX Dashboards in Fenster- oder Handy-Rahmen. Seit Oktober 2026 liegt über der ganzen Seite eine Glas-Optik: Karten und Kachel-Raster sind halbtransparent mit heller Glaskante, dahinter ruhiges Lime-Licht, die Kanten leuchten am Zeiger in Lime. Keine weitere Farbe. Bewegung ist dezent und respektiert „Bewegung reduzieren“."

colors:
  primary: "#dcf763"          # CryptoX-Lime, einziger Farbakzent
  primary-hover: "#ecff9e"
  primary-dim: "rgba(220,247,99,.12)"
  on-primary: "#0b0b0b"
  canvas: "#0b0b0b"           # Seitenhintergrund
  surface-1: "#111111"        # Karten, Panels
  surface-2: "#151515"        # Fensterleisten, Tabs
  surface-3: "#1c1c1c"        # Hover-Flächen
  glass: "rgba(22,22,22,.62)" # nur in Dashboard-Bereichen
  hairline: "#262626"
  hairline-strong: "#333333"
  ink: "#f4f4f0"
  ink-muted: "#a1a1a1"
  semantic-danger: "#ff7a7a"
  semantic-warning: "#ffc163"

typography:
  display-xl:   { fontFamily: Unbounded, fontSize: 5.6rem, fontWeight: 600, lineHeight: 1.08, letterSpacing: -0.02em }   # fließend ab 2.4rem
  display-lg:   { fontFamily: Unbounded, fontSize: 3.4rem, fontWeight: 500, lineHeight: 1.08, letterSpacing: -0.02em }   # fließend ab 1.9rem
  display-page: { fontFamily: Unbounded, fontSize: 4rem, fontWeight: 600, lineHeight: 1.08, letterSpacing: -0.02em }     # fließend ab 2.2rem, mobil kleiner
  heading:      { fontFamily: Unbounded, fontSize: 1.25rem, fontWeight: 500, lineHeight: 1.25, letterSpacing: -0.01em }  # bis 2.2rem je Baustein
  lead:         { fontFamily: Manrope, fontSize: 1.25rem, fontWeight: 400, lineHeight: 1.65 }                           # fließend ab 1.05rem, Farbe ink-muted
  body:         { fontFamily: Manrope, fontSize: 17px, fontWeight: 400, lineHeight: 1.65 }                              # 16px mobil
  button:       { fontFamily: Manrope, fontSize: 0.98rem, fontWeight: 700 }
  label:        { fontFamily: JetBrains Mono, fontSize: 0.78rem, fontWeight: 500, letterSpacing: 0.03em }               # normale Schreibweise, keine Versalien
  figure:       { fontFamily: JetBrains Mono, fontSize: 2.1rem, fontWeight: 500, letterSpacing: -0.02em }              # fließend ab 1.5rem

rounded:
  xs: 4px
  md: 16px
  lg: 18px
  xl: 24px
  phone: 34px
  pill: 999px

spacing:
  section: 120px          # 80px mobil
  section-head: 64px      # Abstand Abschnittskopf zu Inhalt
  container-max: 1280px
  gutter: 32px            # 16px mobil
  grid-gap: 1px           # Kachel-Raster auf Haarlinien
  stack: 24px
---

# CryptoX Design System

Diese Datei beschreibt, wie crypto-x.at aussieht und sich anfühlt. Sie ist für Menschen und KI-Werkzeuge gedacht, die an der Webseite (oder passenden Materialien) weiterarbeiten. Format angelehnt an [DESIGN.md](https://stitch.withgoogle.com/docs/design-md/overview/) bzw. die Sammlung [awesome-design-md](https://github.com/VoltAgent/awesome-design-md).

Die maßgeblichen Werte stehen als CSS-Variablen in `assets/css/style.css` unter `:root`. Bei Widersprüchen gilt das CSS.

## Overview

CryptoX ist ein IT-Dienstleister aus Niederösterreich (Software, Software-Schulungen, Webdesign) mit dem CryptoX Dashboard für Prop-Firm-Trader als Hauptprodukt. Die Seite soll **technisch, ruhig und vertrauenswürdig** wirken, nicht wie ein Krypto-Hype-Angebot.

**Wesentliche Merkmale**
- **Dunkle Fläche:** `canvas` #0b0b0b, darauf eine Stufenleiter aus Panels (`surface-1` bis `surface-3`) mit 1px-Haarlinien. Hierarchie entsteht über Flächen und Linien, kaum über Schatten.
- **Ein Akzent:** Lime #dcf763 für primäre Buttons, Hervorhebungen im Überschriftentext (`.lime`), Label-Nummern, Rauten-Aufzählungen, Fokusrahmen und Status „live“. Keine zweite Akzentfarbe.
- **Produkt im Mittelpunkt:** Screenshots des Dashboards in Fenster-Rahmen (`.window`) oder Handy-Rahmen (`.phone`), immer aus der Demo-Installation mit erfundenen Daten.
- **Glas-Optik:** Die Glas-Werte stehen als `--g-*` in `assets/css/fx.css` (Abschnitt „Glas-Optik“). Karten (`.step`, `.post`, `.faq__item`, `.form` …) bekommen `--g-sheen` über `--g-bg`, Kachel-Raster (`.rules`, `.modules`, `.xgrid`) werden eine Glasplatte mit durchscheinenden Feldern. Hinter allem liegt ruhiges Lime-Licht (`body::before`, je Abschnitt ein weiches Licht). Lime-Lichtkante folgt dem Zeiger, im Menü gleitet am PC eine Glas-Kapsel mit Leuchtpunkt (`.nav__ind`, fx.js). Unschärfe nur an Kopfleiste und Rahmen-Buttons, am Handy gar nicht. Fenster mit `.glass` und `.section--glow` gibt es weiter in den Dashboard-Bereichen.
- **Raster-Hintergrund** (`.grid-bg`) im Hero und in Seitenköpfen, nach außen ausgeblendet.

## Colors

### Akzent
- **Lime** (`primary` #dcf763): Primär-Button, `.lime`-Wörter in Überschriften, Label-Nummern `[01]`, Rauten, Fokus, aktiver Tab.
- **Lime hell** (`primary-hover` #ecff9e): Hover des Primär-Buttons und von Links.
- **Lime gedimmt** (`primary-dim`): Hintergrund-Verläufe (Beta-Box, Callout „lime“), Inline-Platzhalter.
- **Auf Lime** (`on-primary` #0b0b0b): Text auf Lime-Flächen.

### Flächen und Linien
- `canvas` #0b0b0b Seite · `surface-1` #111111 Karten, Fenster, FAQ · `surface-2` #151515 Fensterleisten, Tabs · `surface-3` #1c1c1c Hover.
- `hairline` #262626 Standard-Rahmen und Trennlinien · `hairline-strong` #333333 Buttons „line“, Fenster, Eingaben.
- `glass` rgba(22,22,22,.62) mit `backdrop-filter: blur(14px)` nur in `.glass` (am Handy ohne Unschärfe, deckender).

### Text
- `ink` #f4f4f0 Überschriften und Fließtext · `ink-muted` #a1a1a1 Nebentexte, Lead, Navigation.

### Semantik
- `semantic-danger` #ff7a7a und `semantic-warning` #ffc163 nur in Werkzeug-Oberflächen (Live-Demo), nicht als Deko auf Marketing-Flächen.

## Typography

- **Unbounded** (Display): Überschriften h1–h3, Modul-Titel, Footer-Schriftzug. Gewicht 500, h1 600. Leicht negativ gesperrt (-0.02em).
- **Manrope** (Text): Fließtext, Lead, Buttons (700), Navigation (600).
- **JetBrains Mono** (Mono): Labels wie `[01] Das Dashboard`, Kennzahlen, Tags, Breadcrumbs, Fenstertitel. **Normale Schreibweise, keine Großbuchstaben-Transformation.**
- Alle Schriften liegen lokal unter `assets/fonts/` (keine Google Fonts, kein Drittanbieter).

**Regeln**
- Überschriften: `hyphens: manual`, `text-wrap: balance`. Keine automatische Silbentrennung. Wörter mit Bindestrich bleiben in Überschriften zusammen (`.nw`, automatisch gesetzt).
- Am Handy werden Seitentitel und Zwischenüberschriften so klein, dass jedes Wort in eine Zeile passt (geprüft bis 320px).
- Ein Wort pro Überschrift kann mit `<span class="lime">` hervorgehoben werden, oder ein Satzteil. Nie die ganze Überschrift.

## Layout

- Container max. 1280px, seitlich 32px, mobil 16px.
- Abschnitte (`.section`) 120px vertikal, mobil 80px, getrennt durch eine Haarlinie oben (`.section--line`).
- Abschnittskopf (`.head`): zweispaltig, links Label + Überschrift, rechts kurzer Erklärtext in `ink-muted`; ab 900px einspaltig.
- Abschnitte der Startseite sind fortlaufend nummeriert: `[01]`, `[02]` … Beim Einfügen neuer Abschnitte die Nummern anpassen.
- Kachel-Raster (`.rules`, `.modules`, `.xgrid`): 1px-Lücken auf Haarlinien-Hintergrund, gemeinsamer äußerer Radius 24px. 3 Spalten → 2 → 1.

## Elevation & Depth

- Grundsätzlich flach: Rahmen statt Schatten.
- Ausnahmen mit Tiefe: Screenshot-Fenster (`0 50px 120px rgba(0,0,0,.6)`), Glas-Panels, Handy-Rahmen. Lime-Schein (radialer Verlauf) hinter dem Hero-Screenshot und als langsam wandernder Schimmer in `.section--glow`.

## Shapes

- Radien: 16px (Bilder im Text), 18px (Fenster, Karten, FAQ), 20–24px (Raster, Schritte), 28px (Beta-Box), 34px Handy.
- Buttons, Tags, Tabs, Navigation: Pillen (999px).
- Aufzählungen: kleine Lime-Raute (8×8px, 2px Radius, 45° gedreht) statt Punkt.

## Components

### Buttons
- **Primär** (`.btn`): Lime-Fläche, dunkler Text, Pille, min. 52px hoch, Pfeil-Icon, das beim Hover 3px nach rechts rutscht.
- **Linie** (`.btn--line`): transparent, `hairline-strong`-Rahmen, heller Text; Hover `surface-3`.
- **Klein** (`.btn--sm`): 42px hoch.
- Pro Bereich höchstens ein Primär-Button.

### Navigation
- Fixe Kopfzeile mit dunklem, leicht transparentem Hintergrund und Unschärfe. Links als Pillen in `ink-muted`, aktiv `surface-3`. CTA „Beta testen“ rechts. Unter 1100px Burger-Menü.

### Label
- `.label`: Mono, `[01]` in Lime + Titel in `ink-muted`. Steht über jeder Abschnittsüberschrift.

### Screenshot-Fenster
- `.window` mit Leiste (`.window__bar`: drei Punkte, erster Lime, Mono-Titel wie „CryptoX Dashboard · Demo-Daten“).
- Im Hero mit schwebendem Handy (`.hero__phone`) unten rechts.

### Handy-Rahmen
- `.phone`: 8px dunkler Rand, Radius 34px, Screenshot mit 27px Radius. Gruppen von drei Handys versetzt (0 / 48 / 96px).

### Glas-Panel
- `.glass`: halbtransparente Fläche, feiner heller Rand, Unschärfe, großer weicher Schatten. Nur für Dashboard-Screenshots und Dashboard-Bereiche.

### Funktions-Tour
- `.tour` mit Pillen-Tabs (aktiv Lime), Panel aus Text (Label, Überschrift, Absatz, Rauten-Liste) und Screenshot im Glas-Panel. Schaltet automatisch alle 7s weiter, solange sichtbar, mit Fortschrittsbalken im aktiven Tab; stoppt bei Bedienung, Maus-Hover pausiert. Tastatur: Pfeiltasten, Pos1, Ende.

### Kennzahlen
- `.figures`: vier Spalten mit Haarlinien, große Mono-Zahl + kurzer Text. Zahlen mit `data-count` zählen beim Einblenden hoch.

### Karten und Kästen
- `.module` / `.rule`: Kachel im Raster, Titel mit Lime-Raute, Text `ink-muted`.
- `.beta`: hervorgehobene Box mit Lime-Rahmen (35 %) und Lime-Verlauf oben.
- `.glance` („Auf einen Blick“): Faktenblock als Definitionsliste.
- `.faq__item`: aufklappbar (`details`), „+“ in Lime.
- `.callout` / `.callout--lime`, `.planned` (gestrichelter Rahmen für geplante Funktionen), `.note-legal` (Hinweis mit Lime-Linie links).

### Footer
- Vier Spalten, Risiko- und Rechtshinweise, Zeile „© Jahr Crypto X Solutions · Tim Kofler · Keine Cookies · Kein Tracking“.
- **Großer Schriftzug „CryptoX“ als Outline (Unbounded 700, Haarlinien-Kontur, „X“ mit Lime-Kontur). Gefällt dem Inhaber ausdrücklich: nicht verändern.**

## Motion

- Einblenden beim Scrollen (`.reveal`): nur für Elemente unterhalb des sichtbaren Bereichs beim Laden, 26px Weg, 0,7s, gestaffelt bis 400ms. Wird nach dem Laden vorbereitet, damit der erste Bildaufbau nicht leidet.
- Schwebendes Handy (7s), wandernder Schimmer (22s), Hover: leichtes Anheben von Screenshots, Pfeil im Button.
- Effekte aus `assets/css/fx.css` und `assets/js/fx.js` (an tim-kofler.at angelehnt, in Lime): bewegtes Punktfeld in Hero und Seitenkopf, wandernder Glanz auf dem Hero-Wort, Lichtkegel auf Karten, leicht geneigter Hero-Screenshot, Glanz über Primär-Buttons, Laufband auf der Startseite, Lesefortschritt oben.
- `prefers-reduced-motion: reduce`: keine Animationen, keine Autoplay-Tour, alles sofort sichtbar.
- Nur `transform` und `opacity` animieren.

## Imagery

- Dashboard-Bilder stammen aus der **Demo-Installation mit erfundenen Daten**. Keine echten Konten, Kontostände oder Zugangsdaten.
- Keine Screenshots mit fremden Inhalten (echte Schlagzeilen, TradingView-Chart). Firmennamen in Demo-Konten nur als Beispiel, Hinweis „keine Partnerschaft“.
- Ausgabe als WebP in zwei Breiten mit `srcset` (Desktop 960/1600, Handy 300/600), `loading="lazy"` außer im Hero, feste `width`/`height` gegen Layout-Springen.
- Artikel-Grafiken: eigene schematische Illustrationen im Seitenstil (dunkel, Raster, Lime), keine Stockfotos.
- CSS/JS/Bilder mit Versionsanhang `?v=hash`, damit Browser Änderungen sofort laden.

## Content & Tone

- Sprache Deutsch (Österreich), Ansprache „du“, klar und sachlich, ohne Hype.
- Marke im Text immer **„CryptoX“**. Firmenname **„Crypto X Solutions“** nur in Impressum, Datenschutz und Footer. Nie „CRYPTOX“.
- **Rechtlich heikel:** CryptoX ist IT-Dienstleister, kein Finanzdienstleister. Keine Anlageberatung, keine Handelssignale, keine Gewinnversprechen. Werkzeuge werden als Selbstkontrolle beschrieben („Die Entscheidungen triffst du selbst“). Geplante Funktionen nur als „Geplant“ kennzeichnen.
- Keine Cookies, kein Tracking auf der Webseite. Externe Dienste nur als einfache Links.

## Do's and Don'ts

### Do
- Lime sparsam einsetzen: Primär-Button, ein Wort pro Überschrift, Labels, Rauten, Fokus.
- Jeden Produktabschnitt mit einem echten Screenshot aus der Demo-Installation führen.
- Neue Bereiche aus den vorhandenen Bausteinen zusammensetzen (`.head`, `.modules`, `.glass`, `.tour`, `.feature`).
- Am Handy (320–430px) prüfen: kein seitliches Scrollen, keine getrennten Wörter in Überschriften.
- Lighthouse nach Änderungen: Ziel 100 Barrierefreiheit/Best Practices/SEO, Performance ≥ 95.

### Don't
- Keine zweite Akzentfarbe, keine bunten Verläufe, kein Neon außer Lime.
- Keine Großbuchstaben-Labels, keine automatische Silbentrennung.
- Kein helles Design für die Webseite.
- Glas-Optik nicht flächendeckend einsetzen.
- Keine Schriften oder Skripte von Drittanbietern einbinden (CSP: nur eigene Dateien).
- Footer-Schriftzug und X-Logo nicht umgestalten oder beschneiden.

## Responsive Behavior

| Breite | Änderungen |
|---|---|
| ≤ 1100px | Burger-Menü statt Navigation |
| ≤ 1080px | Artikel 2-spaltig, Ablauf mit 4 Schritten 2-spaltig |
| ≤ 900px | Abschnittskopf, Features, Tour, Handy-Bereich einspaltig; Raster 1-spaltig |
| ≤ 680px | Container 16px, Abschnitte 80px, Tour-Tabs horizontal scrollbar, Glas ohne Unschärfe, X-Logo in „Das X“ ausgeblendet, kleinere Seitentitel |

Touch-Ziele mindestens 42–52px hoch (Buttons, Burger 44px).

## Iteration Guide

1. Erst prüfen, ob ein vorhandener Baustein passt, bevor neues CSS entsteht.
2. Farben, Radien und Schriften nur über die CSS-Variablen in `:root`.
3. Neue Bilder als WebP mit zwei Breiten und festen Maßen einbinden.
4. Nach jeder Änderung: alle Links prüfen, Handy- und Desktop-Breite ansehen, Lighthouse laufen lassen.
5. Diese Datei aktualisieren, wenn sich Tokens oder Bausteine ändern.

## Known Gaps

- Das CryptoX Dashboard selbst nutzt Montserrat und hat ein helles Design. Die Webseite bleibt bewusst bei Unbounded/Manrope und dunkel; die Verbindung entsteht über Lime, Glas-Optik und Screenshots.
- Formular-Stile (Fehler, Validierung) sind auf der Webseite kaum vorhanden, weil es keine Formulare gibt. Die Live-Demo hat eigene Stile in `assets/css/cockpit.css`.
