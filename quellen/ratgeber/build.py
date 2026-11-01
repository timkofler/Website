#!/usr/bin/env python3
"""Baut Ratgeber-Artikel unter /ratgeber/<slug>/.

Aufruf aus dem Repo-Hauptordner:  python3 quellen/ratgeber/build.py
Kopf, Menü und Fuß kommen aus /webseite-erneuern/ (wie bei quellen/guenstig/build.py),
damit Black/White und ?v=-Stände gleich bleiben. Artikeltexte stehen in artikel_*.py.
"""
import json
import os
import re
import sys
from html import escape

sys.path.insert(0, os.path.dirname(__file__))
import artikel_kosten, artikel_impressum, artikel_bafg, artikel_baukasten  # noqa: E402,E401
import artikel_google, artikel_domain, artikel_cookie, artikel_verein, artikel_handwerker  # noqa: E402,E401
import artikel_wartung, artikel_veraltet, artikel_datenschutz, artikel_gruendung  # noqa: E402,E401
import artikel_seo, artikel_bilder, artikel_social  # noqa: E402,E401

# Reihenfolge = Reihenfolge in der Übersicht /ratgeber/
ARTIKEL = [artikel_kosten, artikel_baukasten, artikel_impressum, artikel_google,
           artikel_bafg, artikel_domain, artikel_cookie, artikel_verein, artikel_handwerker,
           artikel_veraltet, artikel_gruendung, artikel_seo, artikel_wartung,
           artikel_datenschutz, artikel_bilder, artikel_social]

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
VORLAGE = os.path.join(REPO, "webdesign", "webseite-erneuern", "index.html")
BASIS = "https://tim-kofler.at"
P = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
H = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
import hashlib
CSS_V = hashlib.md5(open(os.path.join(REPO, "webdesign", "assets", "css", "ratgeber.css"), "rb").read()).hexdigest()[:8]


def ld(a, url):
    return {"@context": "https://schema.org", "@graph": [
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Start", "item": BASIS + "/"},
            {"@type": "ListItem", "position": 2, "name": "Ratgeber", "item": BASIS + "/ratgeber/"},
            {"@type": "ListItem", "position": 3, "name": a.KURZ, "item": url}]},
        {"@type": "Article", "@id": url + "#artikel", "headline": a.H1_TEXT, "description": a.DESC,
         "datePublished": a.DATUM, "dateModified": a.DATUM, "inLanguage": "de-AT",
         "author": {"@id": BASIS + "/#tim"},
         "publisher": {"@id": BASIS + "/#unternehmen"},
         "mainEntityOfPage": url, "image": BASIS + "/assets/img/og-tk-4.jpg"},
        {"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": re.sub(r"<[^>]+>", "", t)}}
            for q, t in a.FAQ]},
    ]}


def karten(liste):
    out = []
    for x in liste:
        out.append(f'''      <li><a class="rg-karte" href="/ratgeber/{x.SLUG}/">
        <span class="rg-karte__l">{escape(x.LABEL)} · {x.LESEZEIT} Min.</span>
        <h3>{escape(x.H1_TEXT)}</h3>
        <p>{escape(x.KARTE)}</p>
        <span class="rg-karte__mehr">Lesen {P}</span>
      </a></li>''')
    return "\n".join(out)


def ende(a):
    chips = "".join(f"<li>{H}{escape(c)}</li>" for c in getattr(a, "END_CHIPS", ["Fixer Preis", "Kein Abo", "Gehört dir"]))
    href = getattr(a, "CTA_HREF", "/entwurf/")
    text = getattr(a, "CTA_TEXT", "Gratis-Entwurf in 48 Stunden")
    alt = getattr(a, "CTA_ALT", 'Oder direkt die <a href="/webseite-guenstig-erstellen/#preise">Preise ansehen</a>')
    return f'''<section class="section section--line ew-end">
  <div class="container">
    <div class="ew-end__box">
      <ul class="ew-end__chips">{chips}</ul>
      <h2>{a.END_H2}</h2>
      <div class="btn-row"><a href="{href}" class="btn">{text} {P}</a></div>
      <p class="gr-end-alt">{alt}</p>
    </div>
  </div>
</section>'''


def main_html(a):
    i = ARTIKEL.index(a)
    weitere = (ARTIKEL[i + 1:] + ARTIKEL[:i])[:3]
    toc = "".join(f'<li><a href="#{i}">{escape(t)}</a></li>' for i, t, _ in a.ABSCHNITTE)
    body = "\n".join(f'    <h2 id="{i}">{escape(t)}</h2>\n{h}' for i, t, h in a.ABSCHNITTE)
    faq = "\n".join(f'''      <details class="faq__item">
        <summary>{escape(q, quote=False)}</summary>
        <p>{t}</p>
      </details>''' for q, t in a.FAQ)
    return f'''<main>

<section class="section tk-hero ew-hero gr-hero br-hero rg-hero">
  <canvas class="tk-field" aria-hidden="true"></canvas>
  <div class="container" style="position:relative">
    <nav class="br-crumbs" aria-label="Brotkrümel"><a href="/">Start</a> <span aria-hidden="true">/</span> <a href="/ratgeber/">Ratgeber</a> <span aria-hidden="true">/</span> <span>{escape(a.KURZ)}</span></nav>
    <span class="label"><b>[Ratgeber]</b> {escape(a.LABEL)}</span>
    <h1>{a.H1}</h1>
    <p class="lead">{a.LEAD}</p>
    <p class="rg-meta">Von <a href="/#ueber">Tim Kofler</a> · {a.DATUM_TEXT} · {a.LESEZEIT} Min. Lesezeit</p>
  </div>
</section>

<section class="section section--line rg-section">
  <div class="container rg-wrap">
  <article class="prose rg">
    <div class="rg-kurz">
      <p class="rg-kurz__t">Kurz gesagt</p>
      {a.KURZ_ANTWORT}
    </div>
    <nav class="rg-toc" aria-label="Inhalt"><p class="rg-toc__t">Inhalt</p><ol>{toc}</ol></nav>
{body}
    <div class="rg-autor">
      <img src="/assets/img/team/tim-avatar.webp?v=1" alt="" width="64" height="64">
      <p><strong>Tim Kofler</strong> programmiert seit 2025 Webseiten für Selbstständige, kleine Betriebe und Vereine in ganz Österreich, von Oberndorf an der Melk aus. <a href="/#ueber">Mehr über mich</a></p>
    </div>
  </article>
  </div>
</section>

<section class="section section--line" id="fragen">
  <div class="container">
    <div class="head"><div><span class="label"><b>[?]</b> Häufige Fragen</span><h2>Gut zu wissen.</h2></div></div>
    <div class="faq">
{faq}
    </div>
  </div>
</section>

<section class="section section--line rg-mehr">
  <div class="container">
    <div class="head"><div><span class="label"><b>[+]</b> Weiterlesen</span><h2>Mehr aus dem Ratgeber.</h2></div></div>
    <ul class="rg-karten">
{karten(weitere)}
    </ul>
  </div>
</section>

{ende(a)}

</main>'''


def kopf_fuss(title, desc, url, ldjson, og_type):
    v = open(VORLAGE, encoding="utf-8").read()
    kopf, rest = v.split("<main>", 1)
    fuss = rest.split("</main>", 1)[1]
    ersetzen = [
        (r"<title>.*?</title>", f"<title>{escape(title)}</title>"),
        (r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{escape(desc)}">'),
        (r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">'),
        (r'<meta property="og:type" content="[^"]*">', f'<meta property="og:type" content="{og_type}">'),
        (r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{escape(title)}">'),
        (r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{escape(desc)}">'),
        (r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{url}">'),
        (r'<script type="application/ld\+json">.*?</script>',
         '<script type="application/ld+json">' + json.dumps(ldjson, ensure_ascii=False).replace("</", "<\\/") + "</script>"),
    ]
    for muster, neu in ersetzen:
        kopf, n = re.subn(muster, lambda m: neu, kopf, count=1, flags=re.S)
        assert n == 1 or muster.startswith('<meta property="og:type'), muster
    kopf = kopf.replace("</head>", f'  <link rel="stylesheet" href="/assets/css/ratgeber.css?v={CSS_V}">\n</head>', 1)
    return kopf, fuss


def schreiben(slug, html):
    ziel = os.path.join(REPO, "webdesign", "ratgeber", *( [slug] if slug else [] ), "index.html")
    os.makedirs(os.path.dirname(ziel), exist_ok=True)
    with open(ziel, "w", encoding="utf-8") as f:
        f.write(html)
    print("geschrieben:", ziel)


def bauen(a):
    url = f"{BASIS}/ratgeber/{a.SLUG}/"
    kopf, fuss = kopf_fuss(a.TITLE, a.DESC, url, ld(a, url), "article")
    schreiben(a.SLUG, kopf + main_html(a) + fuss)


UE_TITLE = "Ratgeber Webseite: Kosten, Impressum, Google & mehr | Tim Kofler"
UE_DESC = ("Ehrliche Antworten rund um die eigene Webseite: Kosten, Impressum, Google-Profil, Cookie-Banner "
           "und mehr. Für Betriebe und Vereine in Österreich.")


def uebersicht():
    url = BASIS + "/ratgeber/"
    ldjson = {"@context": "https://schema.org", "@graph": [
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Start", "item": BASIS + "/"},
            {"@type": "ListItem", "position": 2, "name": "Ratgeber", "item": url}]},
        {"@type": "CollectionPage", "@id": url, "name": "Ratgeber Webseite", "description": UE_DESC, "url": url,
         "inLanguage": "de-AT", "publisher": {"@id": BASIS + "/#unternehmen"},
         "mainEntity": {"@type": "ItemList", "itemListElement": [
             {"@type": "ListItem", "position": n + 1, "url": f"{BASIS}/ratgeber/{x.SLUG}/", "name": x.H1_TEXT}
             for n, x in enumerate(ARTIKEL)]}},
    ]}
    kopf, fuss = kopf_fuss(UE_TITLE, UE_DESC, url, ldjson, "website")
    main = f'''<main>

<section class="section tk-hero ew-hero gr-hero br-hero rg-hero">
  <canvas class="tk-field" aria-hidden="true"></canvas>
  <div class="container" style="position:relative">
    <nav class="br-crumbs" aria-label="Brotkrümel"><a href="/">Start</a> <span aria-hidden="true">/</span> <span>Ratgeber</span></nav>
    <span class="label"><b>[Ratgeber]</b> Wissen rund um deine Webseite</span>
    <h1>Ehrliche Antworten <span class="lime">rund um deine Webseite.</span></h1>
    <p class="lead">Was kostet eine Webseite, was muss ins Impressum, wie kommst du auf Google Maps? Kurz erklärt, ohne Fachchinesisch, für Betriebe und Vereine in Österreich.</p>
  </div>
</section>

<section class="section section--line rg-section">
  <div class="container">
    <h2 class="sr-only">Alle Artikel</h2>
    <ul class="rg-karten rg-karten--alle">
{karten(ARTIKEL)}
    </ul>
  </div>
</section>

{ende(artikel_kosten)}

</main>'''
    schreiben("", kopf + main + fuss)


if __name__ == "__main__":
    for a in ARTIKEL:
        bauen(a)
    uebersicht()
