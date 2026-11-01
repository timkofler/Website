#!/usr/bin/env python3
"""Baut die Seite /webseite-erneuern/ (Webseite erneuern + alte Webseite übernehmen).

Aufruf aus dem Repo-Hauptordner:  python3 quellen/erneuern/build.py
Texte stehen hier in TEXTE, Kopf/Formular/Fragen kommen aus den Orts- und Branchen-Generatoren.
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
br.ICONS.setdefault("handy", '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18h2"/>')
BASIS = br.BASIS
URL = BASIS + "/webseite-erneuern/"
P, H = br.PFEIL, br.HAKEN

TITLE = "Webseite erneuern lassen oder übernehmen | Tim Kofler – Webdesign"
DESC = ("Alte Webseite erneuern zum Fixpreis ab 590 €, Google-Platzierungen bleiben dank Weiterleitungen. "
        "Webdesigner nicht mehr erreichbar? Ich übernehme deine bestehende Seite um 190 €.")

GRUENDE = [
    ("handy", "Am Handy kaum lesbar", "Winzige Schrift, Zoomen, Knöpfe zu klein. Die meisten Besucher kommen heute übers Handy."),
    ("uhr", "Lädt ewig", "Schwere Baukästen, alte Plugins und riesige Bilder kosten Besucher und Google-Platz."),
    ("info", "Keiner kümmert sich mehr", "Der Webdesigner ist weg, die Zugänge fehlen, Updates macht niemand."),
    ("liste", "Inhalte veraltet", "Alte Preise, alte Öffnungszeiten, Fotos von vor zehn Jahren."),
]

FAQ = [
    ("Verliere ich meine Google-Platzierung, wenn die Seite neu wird?",
     "Nicht, wenn man es richtig macht. Ich nehme vorher alle bestehenden Adressen deiner Seite auf und leite jede alte Adresse auf die passende neue um. So findet Google die Inhalte wieder und die Platzierungen bleiben erhalten."),
    ("Bleiben meine Domain und meine E-Mail-Adressen?",
     "Ja. Deine Adresse wie deinbetrieb.at und deine E-Mail-Postfächer bleiben, wie sie sind. Umgestellt wird erst, wenn die neue Seite fertig ist und du sie freigegeben hast."),
    ("Was kostet das Erneuern?",
     "Gleich viel wie eine neue Seite: Start ab 590 € (bis zu 3 Unterseiten), Business ab 1.190 € (bis zu 8 Unterseiten). Texte und Fotos von der alten Seite übernehmen und die Weiterleitungen sind inklusive. Als Kleinunternehmer verrechne ich keine Umsatzsteuer."),
    ("Was heißt „alte Webseite übernehmen“?",
     "Für Betriebe, deren Webdesigner nicht mehr erreichbar ist: Ich prüfe deine bestehende Seite, sichere alle Zugänge und eine Kopie, bringe sie auf deinen eigenen Webspace, wenn sie noch woanders liegt, und mache die nötigen Sicherheits-Updates. Fixpreis 190 €. Danach kannst du die Betreuung ab 19 € im Monat dazunehmen, musst aber nicht."),
    ("Meine alte Seite ist mit WordPress, Wix oder Jimdo gebaut. Geht das?",
     "Ja. Beim Erneuern ist egal, womit die alte Seite gebaut ist, ich übernehme die Inhalte und programmiere die neue Seite selbst. Beim Übernehmen schaue ich mir die Seite vorher kostenlos an und sage dir ehrlich, ob sich das noch lohnt oder ob Erneuern die bessere Wahl ist."),
    ("Ist meine Seite in der Zwischenzeit offline?",
     "Nein. Die neue Seite entsteht im Hintergrund, du siehst sie vorab in deinem Kundenportal. Die alte bleibt online, bis du die neue freigibst."),
]

SCHRITTE = [
    ("Bestandsaufnahme", "Ich schaue mir deine jetzige Seite an: welche Seiten es gibt, was Google davon kennt und was du behalten willst."),
    ("Neue Seite", "Ich baue die neue Seite mit deinen Inhalten, schneller und fürs Handy gemacht. Du siehst jeden Schritt im Kundenportal."),
    ("Weiterleitungen", "Jede alte Adresse zeigt auf die passende neue. So landen Besucher und Google nie im Leeren."),
    ("Umstellung", "Erst nach deiner Freigabe schalte ich um. Domain und E-Mail bleiben, die Seite ist keinen Tag offline."),
]


def ld():
    return {"@context": "https://schema.org", "@graph": [
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Start", "item": BASIS + "/"},
            {"@type": "ListItem", "position": 2, "name": "Webseite erneuern", "item": URL}]},
        {"@type": "Service", "@id": URL + "#erneuern", "name": "Webseite erneuern", "serviceType": "Webdesign",
         "description": "Bestehende Webseite neu programmieren, Inhalte übernehmen, alte Adressen per Weiterleitung erhalten.",
         "provider": {"@id": BASIS + "/#unternehmen"}, "areaServed": {"@type": "Country", "name": "Österreich"}, "url": URL,
         "offers": {"@type": "AggregateOffer", "lowPrice": "590", "highPrice": "1190", "priceCurrency": "EUR",
                    "availability": "https://schema.org/InStock"}},
        {"@type": "Service", "@id": URL + "#uebernehmen", "name": "Alte Webseite übernehmen", "serviceType": "Website-Betreuung",
         "description": "Bestehende Webseite prüfen, Zugänge und Kopie sichern, auf eigenen Webspace umziehen, Sicherheits-Updates.",
         "provider": {"@id": BASIS + "/#unternehmen"}, "areaServed": {"@type": "Country", "name": "Österreich"}, "url": URL,
         "offers": {"@type": "Offer", "price": "190", "priceCurrency": "EUR", "availability": "https://schema.org/InStock"}},
        {"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": br.text_plain(a)}} for q, a in FAQ]},
    ]}


def preis(tag, name, betrag, ab, lead, ticks, note, paket, hi=False):
    t = "".join(f"<li>{escape(x)}</li>" for x in ticks)
    tagh = f'<span class="price__tag">{tag}</span>' if tag else ""
    btn = "btn" if hi else "btn btn--line"
    abh = "<small>ab</small> " if ab else ""
    return f"""      <div class="price{' price--hi' if hi else ''}">
        {tagh}
        <h3>{name}</h3>
        <p class="price__amount">{abh}{betrag}&nbsp;€</p>
        <p class="price__lead">{lead}</p>
        <ul class="ticks">{t}</ul>
        <p class="price__note">{note}</p>
        <a href="#anfrage" class="{btn}" data-paket="{escape(paket)}">Anfragen {P}</a>
      </div>"""


def seite():
    br.PAKETE = {
        "uebernahme": ("Übernehmen", "190", "", "Alte Webseite übernehmen (190 €)"),
        "start": ("Start", "590", "", "Erneuern: Start (ab 590 €)"),
        "business": ("Business", "1.190", "", "Erneuern: Business (ab 1.190 €)"),
    }
    b = {"paket": "start", "wa": "ich habe eine Webseite und möchte sie erneuern oder übernehmen lassen.",
         "firma_ph": "z. B. Tischlerei Maier", "nachricht_ph": "z. B. Seite ist von 2015, am Handy schlecht, der Webdesigner meldet sich nicht mehr",
         "faq": FAQ}
    gruende = "\n".join(
        f'        <li class="gr-item">\n          {br.icon(ic)}\n          <h3>{escape(h)}</h3>\n          <p>{escape(t)}</p>\n        </li>'
        for ic, h, t in GRUENDE)
    schritte = "".join(f'<li class="step"><h3>{escape(h)}</h3><p>{escape(t)}</p></li>' for h, t in SCHRITTE)
    preise = "\n".join([
        preis("", "Übernehmen", "190", False, "Deine Seite passt noch, aber keiner kümmert sich darum.",
              ["Seite und Zugänge prüfen", "Kopie und Zugangsdaten sichern", "Umzug auf deinen eigenen Webspace", "Nötige Sicherheits-Updates"],
              "Danach auf Wunsch Betreuung ab 19&nbsp;€ im Monat, monatlich kündbar.", "Alte Webseite übernehmen (190 €)"),
        preis("", "Erneuern Start", "590", True, "Neue Seite statt der alten, mit bis zu 3 Unterseiten.",
              ["Inhalte und Fotos übernehmen", "Weiterleitungen für Google", "Domain und E-Mail bleiben", "Gratis-Entwurf vorab"],
              "Gleicher Preis wie eine neue Seite, der Umzug ist inklusive.", "Erneuern: Start (ab 590 €)"),
        preis("Für größere Seiten", "Erneuern Business", "1.190", True, "Für Seiten mit mehr Inhalt, bis zu 8 Unterseiten.",
              ["Alles aus Start", "Google-Unternehmensprofil", "Kontaktformular und Anfragen", "Neue Texte auf Wunsch"],
              "Extras rechnet der <a href=\"/#rechner\">Angebots-Rechner</a> als Richtpreis aus.", "Erneuern: Business (ab 1.190 €)", hi=True),
    ])
    html = orte.kopf(TITLE, DESC, URL, "Webseite erneuern oder übernehmen", ld())
    html += f"""

<section class="section tk-hero ew-hero gr-hero br-hero">
  <canvas class="tk-field" aria-hidden="true"></canvas>
  <div class="container" style="position:relative">
    <nav class="br-crumbs" aria-label="Brotkrümel"><a href="/">Start</a> <span aria-hidden="true">/</span> <span>Webseite erneuern</span></nav>
    <span class="label"><b>[Neu machen]</b> Erneuern oder übernehmen</span>
    <h1>Deine Webseite ist in die Jahre gekommen? <span class="lime">Ich mach sie neu.</span></h1>
    <p class="lead">Neue Seite statt der alten, ohne dass du Google-Platzierung, Domain oder E-Mail verlierst. Und wenn dein Webdesigner nicht mehr erreichbar ist, übernehme ich deine bestehende Seite.</p>
    <div class="btn-row" style="margin-top:34px">
      <a href="/entwurf/" class="btn">Gratis-Entwurf in 48 Stunden {P}</a>
      <a href="#preise" class="btn btn--line">Preise ansehen</a>
    </div>
    <ul class="ew-trust"><li><b>Erneuern</b> ab 590&nbsp;€</li><li><b>Übernehmen</b> 190&nbsp;€</li><li><b>Google</b> bleibt dran</li><li><b>Kein Abo</b></li></ul>
  </div>
</section>

<section class="section section--line" id="gruende">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[01]</b> Wann es sich lohnt</span>
        <h2>Erkennst du deine Seite <span class="lime">wieder?</span></h2>
      </div>
      <p>Eine alte Webseite kostet jeden Tag Anfragen, auch wenn sie noch online ist. Schick mir einfach den Link für den <a href="/check/">kostenlosen Webseiten-Check</a>, ich sage dir innerhalb von 24 Stunden ehrlich, ob Erneuern oder Übernehmen besser passt.</p>
    </div>
    <ul class="gr-items">
{gruende}
    </ul>
  </div>
</section>

<section class="section section--line" id="preise">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[02]</b> Preise</span>
        <h2>Zwei Wege, <span class="lime">fixe Preise.</span></h2>
      </div>
      <p>Einmal zahlen, kein Abo. Als Kleinunternehmer verrechne ich keine Umsatzsteuer, alle Preise sind Endpreise.</p>
    </div>
    <div class="pricing">
{preise}
    </div>
  </div>
</section>

<section class="section section--line" id="ablauf">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[03]</b> So bleibt Google dran</span>
        <h2>Neu, ohne bei null <span class="lime">anzufangen.</span></h2>
      </div>
      <p>Die Zusammenarbeit läuft per WhatsApp, Telegram, E-Mail und über dein eigenes Kundenportal.</p>
    </div>
    <ol class="steps steps--4">{schritte}</ol>
  </div>
</section>
"""
    html += br.formular(b, 4)
    html += br.fragen(b, 5)
    html += f"""
<section class="section section--line ew-end">
  <div class="container">
    <div class="ew-end__box">
      <ul class="ew-end__chips"><li>{H}Fixer Preis</li><li>{H}Google bleibt dran</li><li>{H}Kein Abo</li></ul>
      <h2>Zeit für eine Seite, <span class="lime">die wieder Anfragen bringt.</span></h2>
      <div class="btn-row"><a href="#anfrage" class="btn">Unverbindlich anfragen {P}</a></div>
      <p class="gr-end-alt">Lieber erst sehen, wie es aussehen könnte? <a href="/entwurf/">Kostenlosen Entwurf anfordern</a></p>
    </div>
  </div>
</section>
"""
    html += br.FUSS
    return html


if __name__ == "__main__":
    css = os.path.join(orte.WEB, "assets", "css", "branchen.css")
    br.CSS_V = hashlib.sha1(open(css, "rb").read()).hexdigest()[:8]
    ziel = os.path.join(orte.WEB, "webseite-erneuern")
    os.makedirs(ziel, exist_ok=True)
    with open(os.path.join(ziel, "index.html"), "w", encoding="utf-8") as f:
        f.write(seite())
    print("webseite-erneuern geschrieben")
