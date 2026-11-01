#!/usr/bin/env python3
"""Baut die Seite /webseite-guenstig-erstellen/ (Suchbegriffe: Webseite günstig erstellen, günstige Webseite).

Aufruf aus dem Repo-Hauptordner:  python3 quellen/guenstig/build.py
Kopf (Menü), Anfrage-Formular-Stil und Fuß kommen aus der fertigen Seite /webseite-erneuern/,
damit Black/White, Menü und ?v=-Stände immer gleich sind. Texte stehen hier.
"""
import json
import os
import re
from html import escape

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
VORLAGE = os.path.join(REPO, "webdesign", "webseite-erneuern", "index.html")
ZIEL = os.path.join(REPO, "webdesign", "webseite-guenstig-erstellen", "index.html")
BASIS = "https://tim-kofler.at"
URL = BASIS + "/webseite-guenstig-erstellen/"

TITLE = "Webseite günstig erstellen lassen ab 290 € | Tim Kofler"
DESC = ("Günstige Webseite zum Fixpreis: ab 290 € für Referenzkunden, Start ab 590 €. "
        "Einmal zahlen, kein Abo, selbst programmiert. Gratis-Entwurf in 48 Stunden.")
OG_TITLE = "Webseite günstig erstellen lassen, ab 290 €"
OG_DESC = ("Faire Fixpreise statt Agentur-Rechnung und ohne Baukasten-Abo: ab 290 € für Referenzkunden, "
           "Start ab 590 €, Business ab 1.190 €. Einmal zahlen, die Seite gehört dir.")

P = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
H = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
ICONS = {
    "team": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 20a6.5 6.5 0 0 0-2.5-5.1"/>',
    "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    "rechner": '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h.5M12 11h.5M16 11h.5M8 15h.5M12 15h.5M16 15h.5M8 18h.5M12 18h4"/>',
    "liste": '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.5M4 12h.5M4 18h.5"/>',
    "handy": '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18h2"/>',
    "uhr": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "info": '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    "herz": '<path d="M12 20s-8-4.6-8-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8 2.8C20 15.4 12 20 12 20z"/>',
}

WARUM = [
    ("team", "Keine Agentur dahinter", "Kein Büro, kein Vertrieb, keine Projektleiter. Du zahlst nur die Arbeit an deiner Seite."),
    ("mail", "Alles läuft online", "Abstimmung per WhatsApp, Telegram oder E-Mail, Fotos lädst du im Kundenportal hoch. Keine Termine, keine Fahrtkosten."),
    ("rechner", "Kein Abo, keine Lizenz", "Einmal zahlen, die Seite gehört dir. Kein Baukasten, der jeden Monat abbucht."),
    ("liste", "Endpreise ohne Umsatzsteuer", "Als Kleinunternehmer verrechne ich keine Umsatzsteuer. Der Preis im Angebot ist der Preis, den du zahlst."),
]

DRIN = [
    ("herz", "Eigenes Design", "Jede Seite programmiere ich selbst, ohne Vorlage von der Stange. Die gibt es genau so nur einmal."),
    ("handy", "Fürs Handy gemacht", "Die meisten Besucher kommen übers Handy. Schrift, Knöpfe und Kontakt per Klick sind darauf abgestimmt."),
    ("uhr", "Schnell geladen", "Keine schweren Plugins, kein Baukasten-Ballast. Das mögen Besucher und Google."),
    ("info", "Impressum und Datenschutz", "Ein Grundgerüst, abgestimmt auf deine Seite, ist bei jedem Paket dabei."),
]

PREISE = [
    dict(cls="price price--ref", tag="Nur wenige Plätze", name="Referenzkunde", ab=True, preis=290,
         lead="Einfache Seite zum Einführungspreis, solange ich meine Referenzen aufbaue.",
         ticks=["Eine Seite mit allen wichtigen Infos", "Individuelles Design, mobiloptimiert",
                "Grundgerüst für Impressum und Datenschutz", "Einrichtung auf deinem Webspace"],
         note="Dafür: Referenz auf meiner Seite und kleiner Hinweis im Footer.",
         paket="Referenzkunde (ab 290 €)", btn="Platz anfragen", hot=False),
    dict(cls="price", tag="", name="Start", ab=True, preis=590,
         lead="Für Selbstständige und kleine Betriebe, die professionell gefunden werden wollen.",
         ticks=["Eine Seite oder bis zu 3 Unterseiten", "Individuelles Design, mobiloptimiert",
                "Kontakt per Klick und Anmeldung bei Google", "Grundgerüst für Impressum und Datenschutz"],
         note="Für Neugründungen fix 590 €, siehe <a href=\"/gruender/\">Start-Paket für Gründer</a>.",
         paket="Start (ab 590 €)", btn="Start anfragen", hot=False),
    dict(cls="price price--hi", tag="Beliebt", name="Business", ab=True, preis=1190,
         lead="Für Unternehmen, die mehr zeigen und mehr Anfragen bekommen wollen.",
         ticks=["Bis zu 8 Unterseiten", "Kontaktformular und Google-Unternehmensprofil",
                "Suchmaschinen-Grundlagen und strukturierte Daten", "Optional: News, Galerie oder Referenzen"],
         note="Extras rechnet der <a href=\"/#rechner\">Angebots-Rechner</a> als Richtpreis aus.",
         paket="Business (ab 1.190 €)", btn="Business anfragen", hot=True),
]

FAQ = [
    ("Was kostet eine günstige Webseite bei dir?",
     "Für Referenzkunden gibt es eine einfache Seite ab 290 €. Das Paket Start mit einer Seite oder bis zu drei Unterseiten kostet ab 590 €, Business mit bis zu acht Unterseiten ab 1.190 €. Einmal zahlen, kein Abo. Als Kleinunternehmer verrechne ich keine Umsatzsteuer, alle Preise sind Endpreise. Den genauen Preis bekommst du nach deiner Anfrage als unverbindliches Angebot."),
    ("Warum bist du günstiger als eine Agentur?",
     "Weil ich allein arbeite: kein Büro, kein Vertrieb, keine Projektleiter, die mitbezahlt werden. Die Zusammenarbeit läuft online, also gibt es auch keine Fahrtkosten. Am Design und an der Technik spare ich nicht, jede Seite programmiere ich selbst."),
    ("Ist ein Baukasten nicht noch billiger?",
     "Am Anfang oft ja, dafür zahlst du dort jeden Monat, solange die Seite online ist, und die Seite gehört nicht dir. Ein Umzug zu einem anderen Anbieter ist meist mühsam. Bei mir zahlst du einmal, danach läuft nur dein eigener Webspace, ab etwa 5 € im Monat."),
    ("Ist eine billige Webseite automatisch schlecht?",
     "Nein. Eine Webseite für einen kleinen Betrieb braucht keine 5.000 €. Wichtig ist, dass sie am Handy gut funktioniert, schnell lädt, bei Google gefunden wird und Besucher leicht Kontakt aufnehmen können. Genau das ist bei jedem Paket dabei."),
    ("Welche laufenden Kosten kommen dazu?",
     "Nur Domain und Webspace auf deinen Namen, je nach Anbieter etwa 5 bis 10 € im Monat. Ich empfehle ALL-INKL.COM ab 4,95 € im Monat, inklusive .at-Domain und eigener E-Mail-Adressen. Die Betreuung durch mich ist freiwillig und kostet ab 29 € im Monat, monatlich kündbar."),
    ("Was bedeutet Referenzkunde?",
     "Ich baue gerade meine Referenzen auf. Für eine begrenzte Zahl von Kunden erstelle ich eine einfache Seite ab 290 €. Dafür darf ich die Seite als Referenz zeigen und im Footer deiner Seite steht ein kleiner Hinweis auf meine Arbeit."),
    ("Kann ich mir vorher ansehen, wie meine Seite aussehen würde?",
     "Ja. Ich gestalte dir einen kostenlosen Entwurf für Handy und PC, innerhalb von 48 Stunden und ohne Verpflichtung. Erst wenn er dir gefällt, bekommst du ein Angebot."),
    ("Wer steckt dahinter?",
     "Ich bin Tim Kofler aus Oberndorf an der Melk im Mostviertel und programmiere Webseiten für Selbstständige und kleine Betriebe in ganz Österreich, ohne Baukasten. Die Zusammenarbeit läuft über das Kundenportal, ein Termin vor Ort ist nicht nötig."),
]
# Links nur im sichtbaren Text, im JSON-LD bleibt reiner Text
FAQ_LINKS = {
    "Kann ich mir vorher ansehen, wie meine Seite aussehen würde?": ("kostenlosen Entwurf", '<a href="/entwurf/">kostenlosen Entwurf</a>'),
    "Wer steckt dahinter?": ("ohne Baukasten.", 'ohne Baukasten. Mehr <a href="/#ueber">über mich</a>.'),
    "Welche laufenden Kosten kommen dazu?": ("monatlich kündbar.", 'monatlich kündbar. <a href="/ablauf/#kosten">Alle laufenden Kosten</a>'),
}


def ld():
    return {"@context": "https://schema.org", "@graph": [
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Start", "item": BASIS + "/"},
            {"@type": "ListItem", "position": 2, "name": "Webseite günstig erstellen", "item": URL}]},
        {"@type": "Service", "@id": URL + "#webseite", "name": "Webseite günstig erstellen lassen",
         "serviceType": "Webdesign",
         "description": "Individuell programmierte, mobiloptimierte Webseite zum Fixpreis, einmal zahlen, kein Abo.",
         "provider": {"@id": BASIS + "/#unternehmen"},
         "areaServed": {"@type": "Country", "name": "Österreich"}, "url": URL,
         "offers": {"@type": "AggregateOffer", "lowPrice": "290", "highPrice": "1190", "priceCurrency": "EUR",
                    "offerCount": "3", "availability": "https://schema.org/InStock"}},
        {"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]},
    ]}


def items(liste):
    out = []
    for ic, h, p in liste:
        out.append(f'''        <li class="gr-item">
          <span class="gr-item__ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{ICONS[ic]}</svg></span>
          <h3>{escape(h)}</h3>
          <p>{escape(p)}</p>
        </li>''')
    return "\n".join(out)


def preise():
    out = []
    for p in PREISE:
        tag = f'<span class="price__tag">{p["tag"]}</span>' if p["tag"] else ""
        ab = "<small>ab</small> " if p["ab"] else ""
        betrag = f'{p["preis"]:,}'.replace(",", ".")
        ticks = "".join(f"<li>{escape(t)}</li>" for t in p["ticks"])
        btn_cls = "btn" if p["hot"] else "btn btn--line"
        pfeil = " " + P if p["hot"] else ""
        out.append(f'''      <div class="{p["cls"]}">
        {tag}
        <h3>{p["name"]}</h3>
        <p class="price__amount">{ab}<span data-count="{p["preis"]}">{betrag}</span>&nbsp;€</p>
        <p class="price__lead">{escape(p["lead"])}</p>
        <ul class="ticks">{ticks}</ul>
        <p class="price__note">{p["note"]}</p>
        <a href="#anfrage" class="{btn_cls}" data-paket="{escape(p["paket"])}">{p["btn"]}{pfeil}</a>
      </div>''')
    return "\n".join(out)


def faq_html():
    out = []
    for q, a in FAQ:
        txt = escape(a, quote=False)
        if q in FAQ_LINKS:
            alt, neu = FAQ_LINKS[q]
            assert alt in txt, q
            txt = txt.replace(alt, neu, 1)
        out.append(f'''      <details class="faq__item">
        <summary>{escape(q, quote=False)}</summary>
        <p>{txt}</p>
      </details>''')
    return "\n".join(out)


WA = "https://wa.me/4367761773118?text=Hallo%20Tim%2C%20ich%20suche%20eine%20g%C3%BCnstige%20Webseite%20f%C3%BCr%20meinen%20Betrieb."


def main_html(vorlage):
    # Anfrage, Fragen-Seitenleiste und Abschluss aus der Vorlage übernehmen, nur Texte tauschen
    anfrage = re.search(r'<section class="section section--line" id="anfrage".*?</section>', vorlage, re.S).group(0)
    anfrage = re.sub(r'<select name="paket">.*?</select>',
                     '<select name="paket"><option>Referenzkunde (ab 290 €)</option><option selected>Start (ab 590 €)</option>'
                     '<option>Business (ab 1.190 €)</option><option>Weiß ich noch nicht</option></select>', anfrage, flags=re.S)
    anfrage = anfrage.replace('placeholder="z. B. Seite ist von 2015, am Handy schlecht, der Webdesigner meldet sich nicht mehr"',
                              'placeholder="z. B. Malerbetrieb, eine Seite mit Leistungen, Fotos und Kontakt"')
    wa_alt = re.search(r'https://wa\.me/[^"]+', anfrage).group(0)
    anfrage = anfrage.replace(wa_alt, WA)
    ask = re.search(r'<aside class="faq-wrap__ask">.*?</aside>', vorlage, re.S).group(0)
    ask = re.sub(r'https://wa\.me/[^"]+', WA, ask)

    return f'''<main>

<section class="section tk-hero ew-hero gr-hero br-hero">
  <canvas class="tk-field" aria-hidden="true"></canvas>
  <div class="container" style="position:relative">
    <nav class="br-crumbs" aria-label="Brotkrümel"><a href="/">Start</a> <span aria-hidden="true">/</span> <span>Webseite günstig erstellen</span></nav>
    <span class="label"><b>[Fixpreis]</b> Günstig, nicht billig</span>
    <h1>Webseite günstig erstellen lassen. <span class="lime">Ab 290&nbsp;€, ohne Abo.</span></h1>
    <p class="lead">Faire Fixpreise statt Agentur-Rechnung und ohne monatliches Baukasten-Abo. Jede Seite programmiere ich selbst: schnell, fürs Handy gemacht, und sie gehört dir.</p>
    <div class="btn-row" style="margin-top:34px">
      <a href="/entwurf/" class="btn">Gratis-Entwurf in 48 Stunden {P}</a>
      <a href="#preise" class="btn btn--line">Preise ansehen</a>
    </div>
    <ul class="ew-trust"><li><b>Referenz</b> ab 290&nbsp;€</li><li><b>Start</b> ab 590&nbsp;€</li><li><b>Kein Abo</b></li><li><b>Endpreise</b> ohne USt.</li></ul>
  </div>
</section>

<section class="section section--line" id="warum">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[01]</b> Warum günstiger</span>
        <h2>Gespart wird am Drumherum, <span class="lime">nicht an deiner Seite.</span></h2>
      </div>
      <p>Eine Webseite für einen kleinen Betrieb muss nicht mehrere Tausend Euro kosten. Bei mir zahlst du die Arbeit an deiner Seite, nicht den Apparat dahinter.</p>
    </div>
    <ul class="gr-items">
{items(WARUM)}
    </ul>
  </div>
</section>

<section class="section section--line" id="preise">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[02]</b> Preise</span>
        <h2>Drei Pakete, <span class="lime">fixe Preise.</span></h2>
      </div>
      <p>Einmal zahlen, kein Abo. Als Kleinunternehmer verrechne ich keine Umsatzsteuer, alle Preise sind Endpreise. Den genauen Preis bekommst du nach deiner Anfrage als unverbindliches Angebot.</p>
    </div>
    <div class="pricing">
{preise()}
    </div>
    <p class="muted" style="margin:18px 0 0;text-align:center;font-size:.95rem">Laufend zahlst du nur deinen eigenen Webspace, ab etwa 5&nbsp;€ im Monat. <a href="/ablauf/#kosten">Alle laufenden Kosten</a> · <a href="/beispiele/">Beispielseiten ansehen</a></p>
  </div>
</section>

<section class="section section--line" id="drin">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[03]</b> Immer dabei</span>
        <h2>Günstig heißt bei mir <span class="lime">nicht abgespeckt.</span></h2>
      </div>
      <p>Auch die Seite um 290&nbsp;€ ist kein Baukasten-Template, sondern selbst programmiert.</p>
    </div>
    <ul class="gr-items">
{items(DRIN)}
    </ul>
  </div>
</section>

{anfrage}

<section class="section section--line" id="fragen">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[05]</b> Häufige Fragen</span>
        <h2>Gut zu wissen.</h2>
      </div>
    </div>
    <div class="faq-wrap">
    <div class="faq">
{faq_html()}
    </div>
    {ask}
    </div>
  </div>
</section>

<section class="section section--line ew-end">
  <div class="container">
    <div class="ew-end__box">
      <ul class="ew-end__chips"><li>{H}Fixer Preis</li><li>{H}Kein Abo</li><li>{H}Gehört dir</li></ul>
      <h2>Eine gute Webseite, <span class="lime">die dein Budget nicht sprengt.</span></h2>
      <div class="btn-row"><a href="#anfrage" class="btn">Unverbindlich anfragen {P}</a></div>
      <p class="gr-end-alt">Lieber erst sehen, wie es aussehen könnte? <a href="/entwurf/">Kostenlosen Entwurf anfordern</a></p>
    </div>
  </div>
</section>

</main>'''


def bauen():
    v = open(VORLAGE, encoding="utf-8").read()
    kopf, rest = v.split("<main>", 1)
    fuss = rest.split("</main>", 1)[1]
    ersetzen = [
        (r"<title>.*?</title>", f"<title>{escape(TITLE)}</title>"),
        (r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{escape(DESC)}">'),
        (r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{URL}">'),
        (r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{escape(OG_TITLE)}">'),
        (r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{escape(OG_DESC)}">'),
        (r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{URL}">'),
        (r'<meta property="og:image" content="[^"]*">', f'<meta property="og:image" content="{BASIS}/assets/img/og-tk-4.jpg">'),
        (r'<script type="application/ld\+json">.*?</script>',
         '<script type="application/ld+json">' + json.dumps(ld(), ensure_ascii=False).replace("</", "<\\/") + "</script>"),
    ]
    for muster, neu in ersetzen:
        kopf, n = re.subn(muster, lambda m: neu, kopf, count=1, flags=re.S)
        assert n == 1, muster
    os.makedirs(os.path.dirname(ZIEL), exist_ok=True)
    with open(ZIEL, "w", encoding="utf-8") as f:
        f.write(kopf + main_html(v) + fuss)
    print("geschrieben:", ZIEL)


if __name__ == "__main__":
    bauen()
