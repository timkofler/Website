#!/usr/bin/env python3
"""Baut die Seite /web-apps/ (Betriebs-App, Vereins-App, Büro-Dashboard und Buchungssystem als eigene Produkte).

Aufruf aus dem Repo-Hauptordner:  python3 quellen/web-apps/build.py
Preise: Tim hat am 27.10.2026 entschieden, vorerst KEINE Zahl zu zeigen („Fixpreis nach Anfrage“).
Kopf, Formular und Fragen kommen aus den Orts- und Branchen-Generatoren.
"""
import hashlib
import os
import importlib.util
from html import escape

HIER = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("orte_build", os.path.join(HIER, "..", "orte", "build.py"))
orte = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(orte)

br = orte.br
BASIS = br.BASIS
URL = BASIS + "/web-apps/"
P, H = br.PFEIL, br.HAKEN

TITLE = "Web-Apps ohne Abo: Betriebs-App & Vereins-App | Tim Kofler"
DESC = ("Eigene Apps statt Monats-Abos: Betriebs-App für Termine und Gutscheine, Vereins-App, Büro-Dashboard und "
        "Buchungssystem. Einmal zahlen, gehört dir.")

# (id, Bild, Bildtext, Link zum Ausprobieren, Adresse, Zielgruppe, Name, Satz, Highlights, Paket im Formular, Anfrage-Link)
PRODUKTE = [
    ("betriebs-app", "betriebs-app.webp", "Betriebs-App: eigene App mit Terminbuchung, Gutschein, Stempelkarte und Angebot",
     "/beispiele/betriebs-app/", "tim-kofler.at/app", "Für Friseur, Gasthaus und Handwerk", "Betriebs-App",
     "Eine App statt sieben Abos. Mit dem Namen und Logo deines Betriebs, am Handy deiner Kunden ohne App Store.",
     ["Online-Terminbuchung mit Erinnerung", "Gutscheine mit QR-Code zum Einlösen", "Digitale Stempelkarte statt Papier",
      "Angebote mit Unterschrift am Handy", "Büro-Ansicht mit allen Terminen und Gutscheinen", "Abo-Rechner: was du dir pro Jahr sparst"],
     "Eigene App (Zusatzleistung)", "#anfrage"),
    ("vereins-app", "vereins-app.webp?v=3", "Vereins-App: Mitglieder-App am Handy und Übersicht für den Vorstand",
     "/beispiele/verein-app/", "tim-kofler.at/beispiele/verein-app", "Für Sport-, Musik- und Kulturvereine", "Vereins-App",
     "Vereinsverwaltung ohne Jahresabo, egal wie viele Mitglieder. In den Vereinsfarben, die Daten liegen beim Verein.",
     ["Mitgliederliste mit Excel-Import", "Beiträge mit QR-Zahlschein", "Termine mit Zu- und Absagen",
      "Nachrichten an alle oder einzelne Gruppen", "Kassabuch mit Kassabericht als PDF", "Zugang zum Lesen für die Rechnungsprüfer"],
     "", "/verein/#anfrage"),
    ("dashboard", "haustechnik.webp?v=2", "Büro-Dashboard eines Handwerksbetriebs: Umsatz, offene Rechnungen, Stunden und Einsätze",
     "/beispiele/dashboard/", "tim-kofler.at/beispiele/dashboard", "Für Handwerk und kleine Betriebe", "Büro-Dashboard",
     "Alles aus dem Büro in einem Fenster statt in fünf Programmen und drei Excel-Listen.",
     ["Aufträge und Plantafel", "Stundenerfassung am Handy", "Rechnungen und offene Beträge",
      "Lagerstand mit Nachbestell-Hinweis", "Einsatzplan für dein Team", "Deine Zahlen auf einen Blick"],
     "Web-App / Dashboard", "#anfrage"),
    ("buchung", "autovermietung.webp", "Buchungssystem einer Autovermietung: Auslastung, Abholungen und Umsatz",
     "/beispiele/dashboard/v2/", "tim-kofler.at/beispiele/dashboard/v2", "Für Vermietung und Verleih", "Buchungssystem",
     "Reservierungen direkt auf deiner Webseite, ohne Buchungsportal und ohne Provision.",
     ["Online-Buchung für deine Webseite", "Belegungsplan für alle Fahrzeuge oder Geräte", "Digitales Übergabeprotokoll mit Fotos",
      "Flotte und Wartung im Blick", "Bestätigung per E-Mail", "Umsatz und Auslastung pro Monat"],
     "Web-App / Dashboard", "#anfrage"),
]

GRUENDE = [
    ("Einmal zahlen", "Fixpreis nach kurzer Anfrage, danach keine Lizenz- und keine Nutzergebühren."),
    ("Gehört dir", "Die App läuft auf deinem eigenen Webspace, die Daten liegen bei dir und nicht bei einem Anbieter."),
    ("Zum Ausprobieren", "Jedes Produkt gibt es als Beispiel zum Anklicken, mit Musterdaten. Erst sehen, dann entscheiden."),
    ("Sonderpreis zur Webseite", "Zusammen mit deiner Webseite bekommst du die App als Erweiterung günstiger."),
]

FAQ = [
    ("Was kostet eine App?",
     "Du bekommst nach einer kurzen Anfrage einen Fixpreis, abhängig davon, was die App können soll. Einmal bezahlt, ohne Monats-Abo. Zusammen mit einer Webseite gibt es die App als Erweiterung zum Sonderpreis. Als Kleinunternehmer verrechne ich keine Umsatzsteuer."),
    ("Brauchen meine Kunden einen App Store?",
     "Nein. Die Apps laufen im Browser am Handy und am PC und lassen sich wie eine App auf den Startbildschirm legen."),
    ("Wo liegen die Daten?",
     "Auf deinem eigenen Webspace, zum Beispiel bei einem österreichischen Anbieter. Es gibt kein Tracking und keine Weitergabe an Dritte."),
    ("Kann die App genau das, was ich brauche?",
     "Die Beispiele zeigen, was möglich ist. Deine App bekommt nur die Teile, die du wirklich nutzt, und kann um eigene Funktionen ergänzt werden."),
    ("Kann ich bestehende Daten übernehmen?",
     "Ja, zum Beispiel Mitglieder- oder Kundenlisten aus Excel. Vorher zeige ich dir, was übernommen wird."),
]


def ld():
    return {"@context": "https://schema.org", "@graph": [
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Start", "item": BASIS + "/"},
            {"@type": "ListItem", "position": 2, "name": "Web-Apps", "item": URL}]},
        {"@type": "ItemList", "name": "Web-Apps von Tim Kofler", "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "item": {
                "@type": "Service", "@id": URL + "#" + p[0], "name": p[6], "serviceType": "Web-App-Entwicklung",
                "description": p[7] + " " + ", ".join(p[8]) + ".", "url": URL + "#" + p[0],
                "provider": {"@id": BASIS + "/#unternehmen"}, "areaServed": {"@type": "Country", "name": "Österreich"}}}
            for i, p in enumerate(PRODUKTE)]},
        {"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": br.text_plain(a)}} for q, a in FAQ]},
    ]}


def produkt(i, p):
    pid, img, alt, href, adr, ziel, name, satz, hl, paket, anfrage = p
    ticks = "".join(f"<li>{escape(x)}</li>" for x in hl)
    dp = f' data-paket="{escape(paket)}"' if paket else ""
    return f"""    <article class="wa-prod{' wa-prod--rev' if i % 2 else ''}" id="{pid}">
      <a class="wa-prod__shot" href="{href}"><span class="tk-ex__bar" aria-hidden="true"><i></i><i></i><i></i><span>{adr}</span></span><img src="/assets/img/apps/{img}" alt="{escape(alt)}" width="720" height="450" loading="lazy"></a>
      <div class="price wa-prod__card">
        <span class="price__tag">{escape(ziel)}</span>
        <h3>{escape(name)}</h3>
        <p class="price__lead">{escape(satz)}</p>
        <ul class="ticks">{ticks}</ul>
        <p class="price__note"><b>Fixpreis nach Anfrage</b> · einmal zahlen, kein Abo</p>
        <div class="btn-row"><a href="{href}" class="btn">Live ausprobieren {P}</a><a href="{anfrage}" class="btn btn--line"{dp}>Anfragen</a></div>
      </div>
    </article>"""


def seite():
    br.PAKETE = {
        "app": ("Betriebs-App", "", "", "Eigene App (Zusatzleistung)"),
        "dash": ("Dashboard", "", "", "Web-App / Dashboard"),
    }
    b = {"paket": "app", "wa": "ich interessiere mich für eine eigene App für meinen Betrieb.",
         "firma_ph": "z. B. Salon Haarmonie", "nachricht_ph": "z. B. welche Programme du heute nutzt und was dich daran nervt",
         "faq": FAQ}
    produkte = "\n".join(produkt(i, p) for i, p in enumerate(PRODUKTE))
    gruende = "".join(f'<li class="step"><h3>{escape(h)}</h3><p>{escape(t)}</p></li>' for h, t in GRUENDE)
    nav = "".join(f'<li><a href="#{p[0]}">{escape(p[6])}</a></li>' for p in PRODUKTE)
    html = orte.kopf(TITLE, DESC, URL, "Web-Apps ohne Abo", ld()).replace("og-tk-4.jpg", "og-web-apps.jpg")
    css = f'  <link rel="stylesheet" href="/assets/css/web-apps.css?v={CSS_V}">\n</head>'
    html = html.replace("</head>", css, 1)
    html += f"""

<section class="section tk-hero ew-hero gr-hero br-hero">
  <canvas class="tk-field" aria-hidden="true"></canvas>
  <div class="container" style="position:relative">
    <nav class="br-crumbs" aria-label="Brotkrümel"><a href="/">Start</a> <span aria-hidden="true">/</span> <span>Web-Apps</span></nav>
    <span class="label"><b>[Produkte]</b> Web-Apps ohne Abo</span>
    <h1>Eigene Apps statt Monats-Abos. <span class="lime">Einmal zahlen, gehört dir.</span></h1>
    <p class="lead">Termine, Gutscheine, Mitglieder, Aufträge oder Buchungen in einer App mit deinem Namen. Jedes Produkt kannst du hier live ausprobieren, bevor du anfragst.</p>
    <div class="btn-row" style="margin-top:34px">
      <a href="#produkte" class="btn">Produkte ansehen {P}</a>
      <a href="#anfrage" class="btn btn--line">Anfragen</a>
    </div>
    <ul class="wa-jump" aria-label="Zu den Produkten">{nav}</ul>
  </div>
</section>

<section class="section section--line" id="produkte">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[01]</b> Produkte</span>
        <h2>Vier Apps, <span class="lime">alles anklickbar.</span></h2>
      </div>
      <p>Die Beispiele laufen mit erfundenen Betrieben und Musterdaten. Deine App bekommt deinen Namen, dein Logo und nur die Teile, die du wirklich brauchst.</p>
    </div>
    <div class="wa-prods">
{produkte}
    </div>
  </div>
</section>

<section class="section section--line" id="warum">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[02]</b> Warum ohne Abo</span>
        <h2>Bezahlt ist <span class="lime">bezahlt.</span></h2>
      </div>
      <p>Viele Programme kosten jeden Monat, pro Nutzer oder pro Mitglied. Eine eigene App zahlst du einmal und sie gehört dir.</p>
    </div>
    <ol class="steps steps--4">{gruende}</ol>
  </div>
</section>
"""
    html += br.formular(b, 3).replace("Erzähl mir von deinem <span class=\"lime\">Betrieb</span>.",
                                      "Welche App <span class=\"lime\">passt zu dir?</span>").replace(
        "Was soll die Seite können?", "Was soll die App können?")
    html += br.fragen(b, 4)
    html += f"""
<section class="section section--line ew-end">
  <div class="container">
    <div class="ew-end__box">
      <ul class="ew-end__chips"><li>{H}Einmal zahlen</li><li>{H}Gehört dir</li><li>{H}Kein Tracking</li></ul>
      <h2>Weniger Abos, <span class="lime">mehr Überblick.</span></h2>
      <div class="btn-row"><a href="#anfrage" class="btn">Unverbindlich anfragen {P}</a></div>
      <p class="gr-end-alt">Noch keine Webseite? <a href="/entwurf/">Gratis-Entwurf in 48 Stunden</a></p>
    </div>
  </div>
</section>
"""
    html += br.FUSS
    return html


CSS_V = ""

if __name__ == "__main__":
    css = os.path.join(orte.WEB, "assets", "css", "branchen.css")
    br.CSS_V = hashlib.sha1(open(css, "rb").read()).hexdigest()[:8]
    CSS_V = hashlib.sha1(open(os.path.join(orte.WEB, "assets", "css", "web-apps.css"), "rb").read()).hexdigest()[:8]
    ziel = os.path.join(orte.WEB, "web-apps")
    os.makedirs(ziel, exist_ok=True)
    with open(os.path.join(ziel, "index.html"), "w", encoding="utf-8") as f:
        f.write(seite())
    print("web-apps geschrieben")
