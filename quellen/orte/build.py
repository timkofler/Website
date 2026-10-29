#!/usr/bin/env python3
"""Baut die Orts-Landingpages von tim-kofler.at aus daten.json.

Ergebnis: webdesign/<slug>/index.html (z. B. /webdesign-scheibbs/).
Aufruf aus dem Repo-Hauptordner:  python3 quellen/orte/build.py
Texte nur in daten.json ändern, nie in den erzeugten Dateien.
Kopf, Formular und Fragen kommen aus quellen/branchen/build.py, damit beide gleich aussehen.
"""
import json
import os
import re
import sys
from html import escape

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HIER, "..", "branchen"))
import build as br  # noqa: E402

WEB = os.path.normpath(os.path.join(HIER, "..", "..", "webdesign"))
BASIS = br.BASIS

# Kopf wie die live Branchenseiten (inkl. Black-Edition-Schalter), nur Titel/Meta/JSON-LD tauschen
VORLAGE = os.path.join(WEB, "webseite", "handwerk", "index.html")
BLACK = ('  <link rel="stylesheet" href="/assets/css/black.css?v=709eeccc">\n  <meta name="tk-white-css" content="/assets/css/white.css?v=0be82886">\n'
         '  <script src="/assets/js/tk-black.js?v=e12aebec"></script>\n')


def kopf(title, desc, url, og_title, ld):
    v = open(VORLAGE, encoding="utf-8").read()
    v = v[:v.index("<main>") + len("<main>")]
    v = re.sub(r"<title>.*?</title>", f"<title>{escape(title)}</title>", v)
    v = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + escape(desc), v)
    v = re.sub(r'(<meta property="og:description" content=")[^"]*', lambda m: m.group(1) + escape(desc), v)
    v = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + escape(og_title), v)
    v = re.sub(r'(<link rel="canonical" href=")[^"]*', lambda m: m.group(1) + url, v)
    v = re.sub(r'(<meta property="og:url" content=")[^"]*', lambda m: m.group(1) + url, v)
    v = re.sub(r'<script type="application/ld\+json">.*?</script>',
               lambda m: '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + "</script>", v, flags=re.S)
    if "black.css" not in v:
        v = re.sub(r'(  <link rel="stylesheet" href="/assets/css/tk\.css\?v=[^"]*">\n)', lambda m: m.group(1) + BLACK, v)
    return v


def demos_aus(branchen, keys):
    nach_slug = {b["slug"]: b for b in branchen}
    out = []
    for k in keys:
        if k == "shop":
            out.append(["/beispiele/shop/", "shop-v.webp", 1184, "Hofladen", "Birnkammer",
                        "Beispiel Hofladen Birnkammer mit Online-Shop, Warenkorb und Kundenkonto"])
        else:
            out.append(nach_slug[k]["demos"][0])
    return out


def seite(o, alle, branchen):
    url = f'{BASIS}/{o["slug"]}/'
    ld = {
        "@context": "https://schema.org",
        "@graph": [
            {"@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Start", "item": BASIS + "/"},
                {"@type": "ListItem", "position": 2, "name": "Webdesign " + o["ort"], "item": url}]},
            {"@type": "Service", "@id": url + "#angebot", "name": "Webdesign " + o["ort"],
             "serviceType": "Webdesign", "description": o["description"],
             "provider": {"@id": BASIS + "/#unternehmen"},
             "areaServed": [{"@type": "Place", "name": g} for g in o["gemeinden"]],
             "url": url,
             "offers": {"@type": "AggregateOffer", "lowPrice": "590", "highPrice": "1190", "priceCurrency": "EUR",
                        "availability": "https://schema.org/InStock"}},
            {"@type": "FAQPage", "mainEntity": [
                {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": br.text_plain(a)}}
                for q, a in o["faq"]]},
        ],
    }
    b = {"paket": "start", "wa": f"ich habe einen Betrieb {o['in_ort']} und interessiere mich für eine Webseite.",
         "firma_ph": "z. B. Gasthaus Huber, Tischlerei Maier", "nachricht_ph": f"z. B. Friseursalon in {o['gemeinden'][0]}, 3 Mitarbeiterinnen, Online-Termin wäre fein",
         "faq": o["faq"]}
    feats = "\n".join(
        f'        <li class="gr-item">\n          {br.icon(ic)}\n          <h3>{escape(h)}</h3>\n          <p>{escape(t)}</p>\n        </li>'
        for ic, h, t in o["features"])
    demos = demos_aus(branchen, o["demos"])
    orte = "".join(f"<li>{escape(g)}</li>" for g in o["gemeinden"])
    branchen_links = "".join(f'<li><a href="/webseite/{x["slug"]}/">{escape(x["kurz"])}</a></li>' for x in branchen)
    nach_slug = {x["slug"]: x for x in alle}
    nachbarn = "".join(f'<li><a href="/{s}/">Webdesign {escape(nach_slug[s]["ort"])}</a></li>' for s in o["nachbarn"])
    P = br.PFEIL
    H = br.HAKEN
    html = kopf(o["title"], o["description"], url, "Webdesign " + o["ort"], ld)
    html += f"""

<section class="section tk-hero ew-hero gr-hero br-hero">
  <canvas class="tk-field" aria-hidden="true"></canvas>
  <div class="container" style="position:relative">
    <nav class="br-crumbs" aria-label="Brotkrümel"><a href="/">Start</a> <span aria-hidden="true">/</span> <span>Webdesign {escape(o['ort'])}</span></nav>
    <span class="label"><b>[{escape(o['kurz'])}]</b> Webdesign aus dem Mostviertel</span>
    <h1>{escape(o['h1'])} <span class="lime">{escape(o['h1b'])}</span></h1>
    <p class="lead">{escape(o['lead'])}</p>
    <div class="btn-row" style="margin-top:34px">
      <a href="/entwurf/" class="btn">Gratis-Entwurf in 48 Stunden {P}</a>
      <a href="#beispiele" class="btn btn--line">Beispiele ansehen</a>
    </div>
    <ul class="ew-trust"><li><b>Fixpreis</b> ab 590&nbsp;€</li><li><b>Kein Abo</b>, die Seite gehört dir</li><li><b>Entwurf</b> in 48 Stunden</li><li><b>Kein Tracking</b>, keine Cookies</li></ul>
  </div>
</section>

<section class="section section--line" id="funktionen">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[01]</b> Für deine Gegend</span>
        <h2>{o['warum_h2']}</h2>
      </div>
      <p>{escape(o['warum_p'])}</p>
    </div>
    <div class="gr-paket">
      <ul class="gr-items">
{feats}
      </ul>

      <aside class="price price--hi gr-price" aria-label="Preise">
        <span class="price__tag">Fixpreis</span>
        <h3>Start</h3>
        <p class="price__amount"><small>ab</small>590&nbsp;€</p>
        <p class="price__once">{H}Einmal zahlen, kein Abo</p>
        <p class="price__lead">Eine Seite oder bis zu 3 Unterseiten, mit Kontaktformular und Kontakt per Klick. Für größere Betriebe gibt es das Paket Business mit bis zu 8 Unterseiten um 1.190&nbsp;€.</p>
        <ul class="ticks">
          <li>Gratis-Entwurf vorab, unverbindlich</li>
          <li>Google-Unternehmensprofil auf Wunsch</li>
        </ul>
        <p class="price__note">Extras rechnet der <a href="/#rechner">Angebots-Rechner</a> als Richtpreis aus. Als Kleinunternehmer verrechne ich keine Umsatzsteuer, alle Preise sind Endpreise.</p>
        <a href="#anfrage" class="btn">Anfragen {P}</a>
      </aside>
    </div>
    <div class="tk-abo__once tk-once--prices gr-once"><span class="tk-abo__once-ic" aria-hidden="true">{H}</span><p><strong>Die Seite gehört dir.</strong> Monatlich zahlst du nur deinen Webspace beim Anbieter (ca. 5–10&nbsp;€, inklusive Domain und E-Mail). Die Betreuung durch mich ab 29&nbsp;€ im Monat ist freiwillig und monatlich kündbar.</p></div>
  </div>
</section>

<section class="section section--line" id="beispiele">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[02]</b> Beispiele</span>
        <h2>So kann deine Seite <span class="lime">aussehen</span>.</h2>
      </div>
      <p>Diese Entwürfe sind individuell programmiert, schnell am Handy und ohne Tracking. Tipp einen an, es öffnet sich die echte Seite. Es sind erfundene Betriebe, keine Kundenprojekte.</p>
    </div>
    <ul class="br-demos br-demos--{len(demos)}">
      {br.demo_cards(demos)}
    </ul>
    <p class="gr-more"><a href="/beispiele/">Alle Beispielseiten ansehen {P}</a></p>
  </div>
</section>

<section class="section section--line" id="orte">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[03]</b> Einzugsgebiet</span>
        <h2>Für Betriebe {escape(o['in_ort'].split(' ',1)[0])} <span class="lime">{escape(o['in_ort'].split(' ',1)[1])}</span> und rundherum.</h2>
      </div>
      <p>Die Zusammenarbeit läuft per WhatsApp, Telegram, E-Mail und über dein eigenes Kundenportal. Deshalb ist es egal, ob dein Betrieb im Ortszentrum oder im letzten Graben liegt.</p>
    </div>
    <ul class="br-extras br-orte">{orte}</ul>
    <nav class="br-other" aria-label="Webseiten nach Branche">
      <p>Webseiten nach Branche</p>
      <ul>{branchen_links}<li><a href="/verein/">Vereine</a></li><li><a href="/gruender/">Neugründungen</a></li></ul>
    </nav>
  </div>
</section>
"""
    html += br.formular(b, 4)
    html += br.fragen(b, 5)
    html += f"""
<section class="section section--line ew-end">
  <div class="container">
    <div class="ew-end__box">
      <ul class="ew-end__chips"><li>{H}Fixer Preis</li><li>{H}Kein Abo</li><li>{H}Entwurf in 48 Stunden</li></ul>
      <h2>Dein Betrieb verdient eine <span class="lime">eigene Seite.</span></h2>
      <div class="btn-row"><a href="#anfrage" class="btn">Unverbindlich anfragen {P}</a></div>
      <p class="gr-end-alt">Lieber erst sehen, wie es aussehen könnte? <a href="/entwurf/">Kostenlosen Entwurf anfordern</a></p>
    </div>
    <nav class="br-other" aria-label="Webdesign in der Nähe">
      <p>Webdesign in der Nähe</p>
      <ul>{nachbarn}</ul>
    </nav>
  </div>
</section>
"""
    html += br.FUSS
    return html


if __name__ == "__main__":
    import hashlib
    css = os.path.join(WEB, "assets", "css", "branchen.css")
    br.CSS_V = hashlib.sha1(open(css, "rb").read()).hexdigest()[:8]
    branchen = json.load(open(os.path.join(HIER, "..", "branchen", "daten.json"), encoding="utf-8"))["branchen"]
    orte = json.load(open(os.path.join(HIER, "daten.json"), encoding="utf-8"))["orte"]
    for o in orte:
        ziel = os.path.join(WEB, o["slug"])
        os.makedirs(ziel, exist_ok=True)
        with open(os.path.join(ziel, "index.html"), "w", encoding="utf-8") as f:
            f.write(seite(o, orte, branchen))
    print(f"{len(orte)} Orts-Seiten geschrieben")
