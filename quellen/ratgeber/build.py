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
import artikel_kosten  # noqa: E402

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
VORLAGE = os.path.join(REPO, "webdesign", "webseite-erneuern", "index.html")
BASIS = "https://tim-kofler.at"
P = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
H = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
CSS_V = "1"


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


def main_html(a):
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
      <img src="/assets/img/team/tim-portrait.webp?v=3" alt="" width="56" height="56">
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

<section class="section section--line ew-end">
  <div class="container">
    <div class="ew-end__box">
      <ul class="ew-end__chips"><li>{H}Fixer Preis</li><li>{H}Kein Abo</li><li>{H}Gehört dir</li></ul>
      <h2>{a.END_H2}</h2>
      <div class="btn-row"><a href="/entwurf/" class="btn">Gratis-Entwurf in 48 Stunden {P}</a></div>
      <p class="gr-end-alt">Oder direkt die <a href="/webseite-guenstig-erstellen/#preise">Preise ansehen</a></p>
    </div>
  </div>
</section>

</main>'''


def bauen(a):
    url = f"{BASIS}/ratgeber/{a.SLUG}/"
    ziel = os.path.join(REPO, "webdesign", "ratgeber", a.SLUG, "index.html")
    v = open(VORLAGE, encoding="utf-8").read()
    kopf, rest = v.split("<main>", 1)
    fuss = rest.split("</main>", 1)[1]
    ersetzen = [
        (r"<title>.*?</title>", f"<title>{escape(a.TITLE)}</title>"),
        (r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{escape(a.DESC)}">'),
        (r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">'),
        (r'<meta property="og:type" content="[^"]*">', '<meta property="og:type" content="article">'),
        (r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{escape(a.TITLE)}">'),
        (r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{escape(a.DESC)}">'),
        (r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{url}">'),
        (r'<script type="application/ld\+json">.*?</script>',
         '<script type="application/ld+json">' + json.dumps(ld(a, url), ensure_ascii=False).replace("</", "<\\/") + "</script>"),
    ]
    for muster, neu in ersetzen:
        kopf, n = re.subn(muster, lambda m: neu, kopf, count=1, flags=re.S)
        assert n <= 1, muster
    kopf = kopf.replace("</head>", f'  <link rel="stylesheet" href="/assets/css/ratgeber.css?v={CSS_V}">\n</head>', 1)
    os.makedirs(os.path.dirname(ziel), exist_ok=True)
    with open(ziel, "w", encoding="utf-8") as f:
        f.write(kopf + main_html(a) + fuss)
    print("geschrieben:", ziel)


if __name__ == "__main__":
    bauen(artikel_kosten)
