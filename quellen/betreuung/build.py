#!/usr/bin/env python3
"""Baut die Seite /betreuung/ (Betreuungs-Pakete Sicher, Sorglos, Plus; Suchbegriffe: Webseite Betreuung, Wartung Kosten).

Aufruf aus dem Repo-Hauptordner:  python3 quellen/betreuung/build.py
Kopf (Menü), Anfrage-Formular-Stil und Fuß kommen aus der fertigen Seite /webseite-erneuern/,
damit Black/White, Menü und ?v=-Stände immer gleich sind. Texte und Preise stehen hier.
Preise ändern: PAKETE unten anpassen, dann auch Startseite (Preise + Rechner), llms.txt und tk-ui.js (Chat).
"""
import json
import os
import re
from html import escape

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
VORLAGE = os.path.join(REPO, "webdesign", "webseite-erneuern", "index.html")
ZIEL = os.path.join(REPO, "webdesign", "betreuung", "index.html")
BASIS = "https://tim-kofler.at"
URL = BASIS + "/betreuung/"

TITLE = "Webseiten-Betreuung ab 19 € im Monat | Tim Kofler"
DESC = ("Betreuung für deine Webseite: Updates, Sicherung, Ausfall-Wächter und kleine Änderungen. "
        "Drei Pakete ab 19 € im Monat, monatlich kündbar, die Seite gehört weiter dir.")
OG_TITLE = "Webseiten-Betreuung ab 19 € im Monat"
OG_DESC = ("Sicher, Sorglos oder Plus: Updates, Sicherung, Ausfall-Wächter und kleine Änderungen für deine Webseite. "
           "Monatlich kündbar, Webspace und Domain bleiben auf deinem Namen.")

P = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
H = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
ICONS = {
    "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    "wache": '<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    "sicherung": '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
    "herz": '<path d="M12 20s-8-4.6-8-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8 2.8C20 15.4 12 20 12 20z"/>',
}

SO = [
    ("mail", "Wunsch einfach schicken", "Per WhatsApp, Telegram oder E-Mail: neues Foto, neuer Text, neue Öffnungszeiten. Ich setze es um und sage dir Bescheid."),
    ("wache", "Ich merke Ausfälle zuerst", "Ein Wächter prüft deine Seite laufend. Ist sie nicht erreichbar oder läuft das Zertifikat ab, bekomme ich sofort eine Meldung."),
    ("sicherung", "Sicherung jeden Monat", "Ich sichere Dateien und Daten deiner Seite. Geht etwas schief, ist schnell alles wieder da."),
    ("herz", "Die Seite bleibt deine", "Webspace und Domain laufen weiter auf deinen Namen. Kündigst du, bleibt die Seite online und alle Zugänge gehören dir."),
]

PAKETE = [
    dict(cls="price", tag="", name="Sicher", preis=19,
         lead="Für alle, die einfach wollen, dass die Seite sicher läuft.",
         ticks=["Sicherheits-Updates und laufende Kontrolle", "Monatliche Sicherung deiner Seite",
                "Ausfall-Wächter: ich sehe Ausfälle vor dir", "Hilfe bei Domain, Webspace und E-Mail"],
         note="Änderungen an der Seite nach Aufwand.",
         paket="Betreuung Sicher (19 € / Monat)", btn="Sicher anfragen", hot=False),
    dict(cls="price price--hi", tag="Empfohlen", name="Sorglos", preis=29,
         lead="Für Betriebe, bei denen sich ab und zu etwas ändert.",
         ticks=["Alles aus Sicher", "Bis 30 Minuten Änderungen im Monat",
                "Texte, Bilder, Öffnungszeiten, Aktionen", "Antwort am nächsten Werktag"],
         note="Größere Wünsche bekommst du vorher als Fixpreis.",
         paket="Betreuung Sorglos (29 € / Monat)", btn="Sorglos anfragen", hot=True),
    dict(cls="price", tag="", name="Plus", preis=49,
         lead="Für Betriebe, die regelmäßig Neues zeigen wollen.",
         ticks=["Alles aus Sorglos", "Bis 1 Stunde Änderungen im Monat",
                "Ein Beitrag im Google-Unternehmensprofil", "Monatsbericht per E-Mail: Besucher, Anfragen"],
         note="Ideal mit News, Angeboten oder Terminen.",
         paket="Betreuung Plus (49 € / Monat)", btn="Plus anfragen", hot=False),
]

FAQ = [
    ("Was kostet die Betreuung einer Webseite bei dir?",
     "Es gibt drei Pakete: Sicher um 19 €, Sorglos um 29 € und Plus um 49 € im Monat. Als Kleinunternehmer verrechne ich keine Umsatzsteuer, alle Preise sind Endpreise. Webspace und Domain zahlst du direkt beim Anbieter, je nach Anbieter etwa 5 bis 10 € im Monat."),
    ("Muss ich eine Betreuung nehmen?",
     "Nein, die Betreuung ist freiwillig. Die Webseite zahlst du einmal, danach gehört sie dir. Ohne Betreuung mache ich Änderungen einzeln nach Aufwand."),
    ("Ist Webspace oder Hosting dabei?",
     "Nein, bewusst nicht. Webspace und Domain laufen auf deinen Namen, damit die Seite wirklich dir gehört und du nie von mir abhängig bist. Ich empfehle ALL-INKL.COM ab 4,95 € im Monat und richte alles für dich ein."),
    ("Was zählt als kleine Änderung?",
     "Zum Beispiel neue Texte, Fotos tauschen, Öffnungszeiten, Preise, eine neue Aktion oder ein Urlaubshinweis. Neue Unterseiten oder Funktionen bekommst du vorher als Angebot zum Fixpreis."),
    ("Was passiert mit Zeit, die ich nicht brauche?",
     "Die Zeit für Änderungen gilt jeweils für einen Monat und wird nicht in den nächsten Monat übertragen. Brauchst du regelmäßig mehr, passt vielleicht das nächste Paket besser."),
    ("Kann ich das Paket wechseln oder kündigen?",
     "Ja, jederzeit zum Monatsende. Eine kurze Nachricht per WhatsApp, Telegram oder E-Mail reicht. Die Seite bleibt online und gehört weiter dir."),
    ("Betreust du auch Seiten, die nicht von dir sind?",
     "Ja. Zuerst prüfe ich die Seite, sichere alle Zugänge und bringe sie auf deinen eigenen Webspace, das kostet einmal 190 €. Danach kannst du jedes Paket dazunehmen."),
]
# Links nur im sichtbaren Text, im JSON-LD bleibt reiner Text
FAQ_LINKS = {
    "Ist Webspace oder Hosting dabei?": ("ALL-INKL.COM", '<a href="https://all-inkl.com/PA56CC1CF457650" rel="sponsored noopener" target="_blank">ALL-INKL.COM</a> (Partnerlink)'),
    "Betreust du auch Seiten, die nicht von dir sind?": ("einmal 190 €.", 'einmal 190 €, siehe <a href="/webseite-erneuern/">alte Webseite übernehmen</a>.'),
}


def ld():
    offers = [{"@type": "Offer", "name": "Betreuung " + p["name"], "price": str(p["preis"]), "priceCurrency": "EUR",
               "priceSpecification": {"@type": "UnitPriceSpecification", "price": str(p["preis"]), "priceCurrency": "EUR",
                                      "unitCode": "MON", "referenceQuantity": {"@type": "QuantitativeValue", "value": "1", "unitCode": "MON"}},
               "description": ", ".join(p["ticks"]), "availability": "https://schema.org/InStock", "url": URL + "#pakete"}
              for p in PAKETE]
    return {"@context": "https://schema.org", "@graph": [
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Start", "item": BASIS + "/"},
            {"@type": "ListItem", "position": 2, "name": "Betreuung", "item": URL}]},
        {"@type": "Service", "@id": URL + "#betreuung", "name": "Webseiten-Betreuung",
         "serviceType": "Website-Betreuung",
         "description": "Sicherheits-Updates, monatliche Sicherung, Ausfall-Wächter und kleine Änderungen für die eigene Webseite, monatlich kündbar.",
         "provider": {"@id": BASIS + "/#unternehmen"},
         "areaServed": {"@type": "Country", "name": "Österreich"}, "url": URL,
         "offers": offers},
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


def pakete():
    out = []
    for p in PAKETE:
        tag = f'<span class="price__tag">{p["tag"]}</span>' if p["tag"] else ""
        ticks = "".join(f"<li>{escape(t)}</li>" for t in p["ticks"])
        btn_cls = "btn" if p["hot"] else "btn btn--line"
        pfeil = " " + P if p["hot"] else ""
        out.append(f'''      <div class="{p["cls"]}">
        {tag}
        <h3>{p["name"]}</h3>
        <p class="price__amount"><span data-count="{p["preis"]}">{p["preis"]}</span>&nbsp;€<small style="margin:0 0 0 8px;letter-spacing:0">/ Monat</small></p>
        <p class="price__lead">{escape(p["lead"])}</p>
        <ul class="ticks">{ticks}</ul>
        <p class="price__note">{escape(p["note"])}</p>
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


WA = "https://wa.me/4367761773118?text=Hallo%20Tim%2C%20ich%20interessiere%20mich%20f%C3%BCr%20die%20Betreuung%20meiner%20Webseite."


def main_html(vorlage):
    # Anfrage, Fragen-Seitenleiste und Abschluss aus der Vorlage übernehmen, nur Texte tauschen
    anfrage = re.search(r'<section class="section section--line" id="anfrage".*?</section>', vorlage, re.S).group(0)
    optionen = "".join(f'<option{" selected" if p["hot"] else ""}>{escape(p["paket"])}</option>' for p in PAKETE)
    anfrage, n = re.subn(r'<select name="paket">.*?</select>',
                         f'<select name="paket">{optionen}<option>Weiß ich noch nicht</option></select>', anfrage, flags=re.S)
    assert n == 1
    tausch = [
        ('<span class="label"><b>[04]</b> Anfrage</span>', '<span class="label"><b>[03]</b> Anfrage</span>'),
        ('Erzähl mir von deinem <span class="lime">Betrieb</span>.', 'Betreuung für deine <span class="lime">Webseite</span>.'),
        ('<span>Bisherige Webseite <em>(optional)</em></span>', '<span>Deine Webseite <em>(optional)</em></span>'),
        ('placeholder="z. B. Seite ist von 2015, am Handy schlecht, der Webdesigner meldet sich nicht mehr"',
         'placeholder="z. B. Seite ist von dir, ich will ab und zu Fotos und Öffnungszeiten ändern lassen"'),
        ('<li><b>Anfrage schicken</b><span>Was du anbietest und wo du bist. Stichworte reichen, den Rest klären wir danach.</span></li>',
         '<li><b>Anfrage schicken</b><span>Welches Paket und die Adresse deiner Seite. Unsicher? Dann empfehle ich dir eines.</span></li>'),
        ('<li><b>Fotos übers Kundenportal</b><span>Du bekommst einen eigenen Zugang und lädst dort Fotos, Logo und Texte hoch, wann es dir passt. Handyfotos sind okay.</span></li>',
         '<li><b>Ich schaue mir die Seite an</b><span>Ist sie nicht von mir, prüfe ich sie zuerst und sichere alle Zugänge.</span></li>'),
        ('<li><b>Entwurf ansehen</b><span>Du siehst deine Seite am Handy und am PC und sagst mir, was ich ändern soll. Die Angaben fürs Impressum brauche ich erst zum Schluss.</span></li>',
         '<li><b>Los geht&#39;s</b><span>Ab dann kümmere ich mich um Updates, Sicherung und deine Wünsche. Monatlich kündbar.</span></li>'),
        ('<p><b>Lieber erst sehen?</b> Ich gestalte dir einen <a href="/entwurf/">kostenlosen Entwurf</a> für Handy und PC, unverbindlich.</p>',
         '<p><b>Noch keine Seite?</b> Ich gestalte dir einen <a href="/entwurf/">kostenlosen Entwurf</a> für Handy und PC, unverbindlich.</p>'),
    ]
    for alt, neu in tausch:
        assert anfrage.count(alt) == 1, alt
        anfrage = anfrage.replace(alt, neu)
    anfrage = re.sub(r'https://wa\.me/[^"]+', WA, anfrage)
    ask = re.search(r'<aside class="faq-wrap__ask">.*?</aside>', vorlage, re.S).group(0)
    ask = re.sub(r'https://wa\.me/[^"]+', WA, ask)

    return f'''<main>

<section class="section tk-hero ew-hero gr-hero br-hero">
  <canvas class="tk-field" aria-hidden="true"></canvas>
  <div class="container" style="position:relative">
    <nav class="br-crumbs" aria-label="Brotkrümel"><a href="/">Start</a> <span aria-hidden="true">/</span> <span>Betreuung</span></nav>
    <span class="label"><b>[Betreuung]</b> Nach dem Livegang</span>
    <h1>Deine Webseite in guten Händen. <span class="lime">Ab 19&nbsp;€ im Monat.</span></h1>
    <p class="lead">Updates, Sicherung und kleine Änderungen, ohne dass du dich darum kümmern musst. Freiwillig, monatlich kündbar, und die Seite gehört weiter dir.</p>
    <div class="btn-row" style="margin-top:34px">
      <a href="#pakete" class="btn">Pakete ansehen {P}</a>
      <a href="#anfrage" class="btn btn--line">Unverbindlich anfragen</a>
    </div>
    <ul class="ew-trust"><li><b>Sicher</b> 19&nbsp;€</li><li><b>Sorglos</b> 29&nbsp;€</li><li><b>Plus</b> 49&nbsp;€</li><li><b>Monatlich</b> kündbar</li></ul>
  </div>
</section>

<section class="section section--line" id="pakete">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[01]</b> Pakete</span>
        <h2>Drei Pakete, <span class="lime">kein Kleingedrucktes.</span></h2>
      </div>
      <p>Alle Preise pro Monat und als Endpreise. Als Kleinunternehmer verrechne ich keine Umsatzsteuer. Webspace und Domain zahlst du direkt beim Anbieter, etwa 5 bis 10&nbsp;€ im Monat.</p>
    </div>
    <div class="pricing">
{pakete()}
    </div>
    <p class="muted" style="margin:18px 0 0;text-align:center;font-size:.95rem">Monatlich kündbar, Wechsel jederzeit zum Monatsende. <a href="/ablauf/#kosten">Alle laufenden Kosten</a></p>
  </div>
</section>

<section class="section section--line" id="so">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[02]</b> So läuft es</span>
        <h2>Du kümmerst dich um deinen Betrieb, <span class="lime">ich mich um deine Seite.</span></h2>
      </div>
      <p>Kein Ticketsystem, keine Warteschleife. Du schreibst mir direkt, ich erledige es.</p>
    </div>
    <ul class="gr-items">
{items(SO)}
    </ul>
  </div>
</section>

{anfrage}

<section class="section section--line" id="fragen">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[04]</b> Häufige Fragen</span>
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
      <ul class="ew-end__chips"><li>{H}Monatlich kündbar</li><li>{H}Kein Hosting-Zwang</li><li>{H}Gehört dir</li></ul>
      <h2>Eine Seite, die läuft. <span class="lime">Ohne dass du daran denken musst.</span></h2>
      <div class="btn-row"><a href="#anfrage" class="btn">Unverbindlich anfragen {P}</a></div>
      <p class="gr-end-alt">Noch keine Webseite? <a href="/entwurf/">Kostenlosen Entwurf anfordern</a></p>
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
