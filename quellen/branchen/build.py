#!/usr/bin/env python3
"""Baut die Branchen-Landingpages von tim-kofler.at aus daten.json.

Ergebnis: webdesign/webseite/index.html (Übersicht) und webdesign/webseite/<slug>/index.html.
Aufruf aus dem Repo-Hauptordner:  python3 quellen/branchen/build.py
Texte nur in daten.json ändern, nie in den erzeugten Dateien.
"""
import json
import os
from html import escape

HIER = os.path.dirname(os.path.abspath(__file__))
ZIEL = os.path.normpath(os.path.join(HIER, "..", "..", "webdesign", "webseite"))
BASIS = "https://tim-kofler.at"

PAKETE = {
    "start": ("Start", "590", "Eine Seite oder bis zu 3 Unterseiten", "Start (ab 590 €)"),
    "business": ("Business", "1.190", "Bis zu 8 Unterseiten, Kontaktformular und Google-Unternehmensprofil inklusive", "Business (ab 1.190 €)"),
}

PFEIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
HAKEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
WA_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z"/><path d="M9 8.6c0 3.3 3 6.4 6.4 6.4l1.2-1.4-2-1-.9.8a5 5 0 0 1-2.6-2.6l.8-.9-1-2z"/></svg>'
TEL_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>'
MAIL_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>'
TG_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.5 3.5L2.8 10.8c-.8.3-.8 1.4 0 1.7l4.7 1.6 1.8 5.6c.2.7 1.1.9 1.6.4l2.6-2.5 4.8 3.5c.6.4 1.4.1 1.6-.6L22.9 4.9c.2-.9-.6-1.7-1.4-1.4z"/><path d="M7.5 14.1l10-7.2-7.6 8.3"/></svg>'

ICONS = {
    "menu": '<path d="M6 3v18M6 3c3 0 4 2 4 5s-1 4-4 4M15 3v18M15 3c2.5 1.5 3.5 4 3.5 7H15"/>',
    "kalender": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8 14h3"/>',
    "info": '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    "uhr": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "kamera": '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    "pin": '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    "liste": '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.5M4 12h.5M4 18h.5"/>',
    "team": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 20a6.5 6.5 0 0 0-2.5-5.1"/>',
    "geschenk": '<rect x="3" y="8" width="18" height="13" rx="1.5"/><path d="M3 12h18M12 8v13M12 8c-1.5-3-5-4-5-1.5S12 8 12 8zM12 8c1.5-3 5-4 5-1.5S12 8 12 8z"/>',
    "herz": '<path d="M12 20s-8-4.6-8-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8 2.8C20 15.4 12 20 12 20z"/>',
    "rechner": '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h.5M12 11h.5M16 11h.5M8 15h.5M12 15h.5M16 15h.5M8 18h.5M12 18h4"/>',
    "upload": '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>',
    "bett": '<path d="M3 18V6M3 13h18v5M21 13v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="10" r="1.8"/>',
    "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    "sprache": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
    "reifen": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3v5.5M12 15.5V21M3 12h5.5M15.5 12H21"/>',
    "rakete": '<path d="M12 15c-1.6-1.2-2.7-2.3-3.9-3.9C10 6.5 13.5 3.6 20.4 3.6c0 6.9-2.9 10.4-7.5 12.3z"/><path d="M8.1 11.1 4 10.5l2.7-3.2h4.1M12.9 15.9l.6 4.1 3.2-2.7v-4.1"/><circle cx="15.4" cy="8.6" r="1.6"/><path d="M5.6 15.8c-1.4.9-1.9 3.2-1.9 4.5 1.3 0 3.6-.5 4.5-1.9"/>',
    "auto": '<path d="M4 16v-4l2-5h12l2 5v4z"/><path d="M4 12h16"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/>',
}


def icon(name):
    return ('<span class="gr-item__ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + "</svg></span>")


def text_plain(html_text):
    """Entfernt einfache Tags (Links in FAQ) für JSON-LD und Meta-Angaben."""
    out, tag = [], False
    for ch in html_text:
        if ch == "<":
            tag = True
        elif ch == ">":
            tag = False
        elif not tag:
            out.append(ch)
    return "".join(out).replace("&amp;", "&").replace("&nbsp;", " ")


def head(title, desc, url, og_title, og_desc, ld, extra_css=""):
    return f"""<!DOCTYPE html>
<html lang="de-AT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{escape(title)}</title>
  <meta name="description" content="{escape(desc)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="{url}">
  <meta property="og:title" content="{escape(og_title)}">
  <meta property="og:description" content="{escape(og_desc)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="de_AT">
  <meta property="og:site_name" content="Tim Kofler – Webdesign">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{BASIS}/assets/img/og-tk-3.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#0b0b0b">
  <link rel="icon" href="/assets/img/tk-badge-2.svg" type="image/svg+xml">
  <link rel="icon" href="/assets/img/tk-badge-2-256.png" type="image/png" sizes="256x256">
  <link rel="apple-touch-icon" href="/assets/img/tk-badge-2-256.png">
  <link rel="preload" href="/assets/fonts/unbounded.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/manrope.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/style.css?v=5d1d811a">
  <link rel="stylesheet" href="/assets/css/tk.css?v=0fab1ee6">
  <link rel="stylesheet" href="/assets/css/entwurf.css?v=6fe37e4b">
  <link rel="stylesheet" href="/assets/css/gruender.css?v=4cfe3d90">
  <link rel="stylesheet" href="/assets/css/branchen.css?v={CSS_V}">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
<body class="ew-page gr-page br-page">

<header class="header">
  <div class="container header__inner">
    <a href="/" class="tk-logo" aria-label="Tim Kofler Webdesign – Startseite"><img src="/assets/img/tk-logo-2.svg" alt="Tim Kofler Webdesign" width="71" height="36"></a>
    <div class="ew-head">
      <a class="ew-head__tel" href="tel:+4367761773118" aria-label="Anrufen: +43 677 61773118">{TEL_IC}<span>+43 677 61773118</span></a>
      <a href="#anfrage" class="btn btn--sm">Anfragen</a>
    </div>
  </div>
</header>

<main>
"""


FUSS = """
</main>

<footer class="footer">
  <div class="container">
    <div class="footer__bottom ew-foot">
      <span>© <span data-year>2026</span> Tim Kofler · Webdesign aus Oberndorf an der Melk, Niederösterreich · Keine Cookies · Kein Tracking</span>
      <span><a href="/">Startseite</a> · <a href="/webseite/">Branchen</a> · <a href="/impressum/">Impressum</a> · <a href="/datenschutz/">Datenschutz</a></span>
    </div>
  </div>
</footer>

<script src="/assets/js/main.js?v=3640c201"></script>
<script src="/assets/js/forms.js?v=e27fc2c5"></script>
<script src="/assets/js/tk-fx.js?v=d255dc7d"></script>
</body>
</html>
"""


def wa_link(text):
    from urllib.parse import quote
    return "https://wa.me/4367761773118?text=" + quote("Hallo Tim, " + text, safe="")


APPS = [
    ("/beispiele/betriebs-app/", "betriebs-app.webp", "Für Betriebe", "Betriebs-App",
     "Termine, Gutscheine, Stempelkarte und Angebote statt sieben Abos.",
     "Betriebs-App: eine eigene App statt vieler Software-Abos für Termine, Gutscheine und Rechnungen"),
    ("/beispiele/verein-app/", "vereins-app.webp?v=2", "Für Vereine", "Vereins-App",
     "Mitglieder, Beiträge mit QR-Zahlschein, Termine mit Zusagen und Kassabuch.",
     "Vereins-App: Mitglieder-App am Handy und Übersicht für den Vorstand mit Mitgliedern, Beiträgen und Kassastand"),
    ("/beispiele/dashboard/", "haustechnik.webp", "Für Handwerker", "Büro-Dashboard",
     "Aufträge, Plantafel, Stunden und Rechnungen in einem Fenster.",
     "Dashboard eines Handwerksbetriebs: Umsatz, offene Rechnungen, Stunden und Einsätze"),
    ("/beispiele/dashboard/v2/", "autovermietung.webp", "Für Vermieter", "Auto&shy;vermietung",
     "Flotte, Abholungen und Umsatz, mit Online-Reservierung.",
     "Dashboard der Autovermietung Luma Drive: Auslastung, Abholungen und Umsatz"),
]


def also_karte(href, ic, tag, titel, text):
    return (f'<a class="br-also__card" href="{href}"><span class="br-also__ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" '
            f'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{ICONS[ic]}</svg></span>'
            f'<span class="br-also__txt"><span class="br-also__tag">{tag}</span><span class="br-also__t">{titel}</span>'
            f'<span class="br-also__p">{text}</span></span><span class="br-also__go">{PFEIL}</span></a>')


def demo_cards(demos):
    out = []
    for href, img, h, art, name, alt in demos:
        out.append(
            f'<li><a href="{href}"><span class="br-demo__ph"><img src="/assets/img/demos/{img}" alt="{escape(alt)}" '
            f'width="560" height="{h}" loading="lazy"></span><span class="br-demo__cap"><b>{art}</b> {name}</span>'
            f'<span class="br-demo__go">Beispiel öffnen {PFEIL}</span></a></li>')
    return "\n      ".join(out)


def formular(b, num):
    paket_opts = "".join(
        f'<option{" selected" if k == b["paket"] else ""}>{escape(v[3])}</option>' for k, v in PAKETE.items())
    wa = wa_link(b["wa"])
    return f"""
<section class="section section--line" id="anfrage">
  <div class="container form-wrap">
    <div>
      <span class="label"><b>[{num:02d}]</b> Anfrage</span>
      <h2 style="margin:14px 0 18px">Erzähl mir von deinem <span class="lime">Betrieb</span>.</h2>
      <p class="muted" style="margin-bottom:24px">Zwei Minuten reichen. Ich melde mich innerhalb von zwei Werktagen persönlich bei dir. Unverbindlich, du gehst damit keinen Vertrag ein.</p>
      <form class="form" action="/api/anmelden.php" method="post" data-cx-form>
        <input type="hidden" name="form" value="webseite"><input type="hidden" name="quelle" value="">
        <div class="form__hp" aria-hidden="true"><label>Webseite<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
        <input type="hidden" name="ts" value="">
        <div class="form__row">
          <label class="form__field"><span>Name</span><input type="text" name="name" required maxlength="80" autocomplete="name"></label>
          <label class="form__field"><span>E-Mail</span><input type="email" name="email" required maxlength="254" autocomplete="email" inputmode="email"></label>
        </div>
        <div class="form__row">
          <label class="form__field"><span>Telefon <em>(optional)</em></span><input type="tel" name="telefon" maxlength="40" autocomplete="tel" inputmode="tel"></label>
          <label class="form__field"><span>Betrieb</span><input type="text" name="firma" required maxlength="120" placeholder="{escape(b['firma_ph'])}"></label>
        </div>
        <div class="form__row">
          <label class="form__field"><span>Paket</span>
            <select name="paket">{paket_opts}<option>Weiß ich noch nicht</option></select></label>
          <label class="form__field"><span>Bisherige Webseite <em>(optional)</em></span><input type="text" name="url" maxlength="200" inputmode="url" placeholder="z. B. mein-betrieb.at"></label>
        </div>
        <label class="form__field"><span>Was soll die Seite können? <em>(optional)</em></span><textarea name="nachricht" rows="4" maxlength="3000" placeholder="{escape(b['nachricht_ph'])}"></textarea></label>
        <label class="form__check"><input type="checkbox" name="datenschutz" value="ja" required><span>Ich habe die <a href="/datenschutz/">Datenschutzerklärung</a> gelesen. Meine Angaben werden zur Bearbeitung der Anfrage gespeichert und bei Brevo verarbeitet.</span></label>
        <button class="btn" type="submit">Unverbindlich anfragen {PFEIL}</button>
        <p class="form__status" role="status" aria-live="polite" hidden></p>
        <p class="form__alt">Lieber direkt? <a href="mailto:office@tim-kofler.at">office@tim-kofler.at</a>, <a href="tel:+4367761773118">+43 677 61773118</a> oder per <a href="{wa}" rel="noopener">WhatsApp</a></p>
      </form>
    </div>
    <aside class="form-aside">
      <h2>Das brauchst du</h2>
      <ol class="form-steps">
        <li><b>Infos zum Betrieb</b><span>Was du anbietest, wo du bist, wie man dich erreicht. Stichworte reichen.</span></li>
        <li><b>Ein paar Fotos</b><span>Von dir, deinem Betrieb oder deinen Arbeiten. Handyfotos sind okay, ich sage dir, worauf du achten sollst.</span></li>
        <li><b>Deine Firmendaten</b><span>Für das Impressum, zum Beispiel Firmenbuch- oder GISA-Nummer und Gewerbe.</span></li>
      </ol>
      <div class="wa-box">
        <p><b>Lieber erst sehen?</b> Ich gestalte dir einen <a href="/entwurf/">kostenlosen Entwurf</a> für Handy und PC, unverbindlich.</p>
        <a class="btn btn--line wa-btn" href="{wa}" rel="noopener">{WA_IC}Auf WhatsApp schreiben</a>
      </div>
    </aside>
  </div>
</section>
"""


def fragen(b, num):
    items = "\n".join(
        f'      <details class="faq__item">\n        <summary>{escape(q)}</summary>\n        <p>{a}</p>\n      </details>'
        for q, a in b["faq"])
    items += ('\n      <details class="faq__item">\n        <summary>Wer steckt dahinter?</summary>\n        <p>Ich bin Tim Kofler aus '
              'Oberndorf an der Melk im Mostviertel und programmiere Webseiten für Selbstständige und kleine Betriebe, ohne Baukasten. '
              'Die Zusammenarbeit läuft über das Kundenportal, ein Termin vor Ort ist nicht nötig. Mehr <a href="/#ueber">über mich</a>.</p>\n      </details>')
    wa = wa_link(b["wa"])
    return f"""
<section class="section section--line" id="fragen">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[{num:02d}]</b> Häufige Fragen</span>
        <h2>Gut zu wissen.</h2>
      </div>
    </div>
    <div class="faq-wrap">
    <div class="faq">
{items}
    </div>
    <aside class="faq-wrap__ask">
      <div class="tk-ask tk-ask--faq">
        <p class="tk-ask__t">Noch etwas offen?</p>
        <p class="tk-ask__p">Schreib mir einfach, ich antworte dir persönlich.</p>
        <div class="tk-ask__row">
          <a class="btn btn--sm tk-ask__wa" href="{wa}" rel="noopener">{WA_IC}WhatsApp</a>
          <a class="btn btn--line btn--sm" href="mailto:office@tim-kofler.at">{MAIL_IC}E-Mail</a>
          <a class="btn btn--line btn--sm" href="https://t.me/TimKofler" rel="noopener">{TG_IC}Telegram</a>
        </div>
        <ul class="tk-ask__list">
          <li><a href="tel:+4367761773118">{TEL_IC}+43 677 61773118</a></li>
        </ul>
        <a class="tk-ask__more" href="/ablauf/">So läuft ein Projekt ab {PFEIL}</a>
      </div>
    </aside>
    </div>
  </div>
</section>
"""


def andere(alle, slug):
    links = "".join(
        f'<li><a href="/webseite/{x["slug"]}/">{escape(x["kurz"])}</a></li>' for x in alle if x["slug"] != slug)
    links += '<li><a href="/verein/">Vereine</a></li><li><a href="/gruender/">Neugründungen</a></li>'
    return links


def seite(b, alle):
    url = f'{BASIS}/webseite/{b["slug"]}/'
    p = PAKETE[b["paket"]]
    ld = {
        "@context": "https://schema.org",
        "@graph": [
            {"@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Start", "item": BASIS + "/"},
                {"@type": "ListItem", "position": 2, "name": "Webseite für deine Branche", "item": BASIS + "/webseite/"},
                {"@type": "ListItem", "position": 3, "name": b["kurz"], "item": url}]},
            {"@type": "Service", "@id": url + "#angebot", "name": "Webseite für " + text_plain(b["kurz"]),
             "serviceType": b["service"], "description": b["description"],
             "provider": {"@id": BASIS + "/#unternehmen"},
             "areaServed": {"@type": "Country", "name": "Österreich"}, "url": url,
             "offers": {"@type": "Offer", "price": p[1].replace(".", ""), "priceCurrency": "EUR",
                        "availability": "https://schema.org/InStock", "name": "Paket " + p[0]}},
        ],
    }
    feats = "\n".join(
        f'        <li class="gr-item">\n          {icon(ic)}\n          <h3>{escape(h)}</h3>\n          <p>{escape(t)}</p>\n        </li>'
        for ic, h, t in b["features"])
    trust = "".join(f"<li>{t}</li>" for t in b["trust"])
    google = "".join(f'<div class="rule"><h3>{escape(h)}</h3><p>{escape(t)}</p></div>' for h, t in b["google"])
    extras = "".join(f"<li>{escape(e)}</li>" for e in b["extras"])
    n_demos = len(b["demos"])
    html = head(b["title"], b["description"], url, b["og"].split(":")[0], b["og"], ld)
    html += f"""
<section class="section tk-hero ew-hero gr-hero br-hero">
  <canvas class="tk-field" aria-hidden="true"></canvas>
  <div class="container" style="position:relative">
    <nav class="br-crumbs" aria-label="Brotkrümel"><a href="/">Start</a> <span aria-hidden="true">/</span> <a href="/webseite/">Branchen</a> <span aria-hidden="true">/</span> <span>{escape(b['kurz'])}</span></nav>
    <span class="label"><b>[{escape(b['label'])}]</b> Webdesign aus Niederösterreich</span>
    <h1>{escape(b['h1'])} <span class="lime">{escape(b['h1b'])}</span></h1>
    <p class="lead">{escape(b['lead'])}</p>
    <div class="btn-row" style="margin-top:34px">
      <a href="#anfrage" class="btn">Unverbindlich anfragen {PFEIL}</a>
      <a href="#beispiele" class="btn btn--line">Beispiele ansehen</a>
    </div>
    <ul class="ew-trust">{trust}</ul>
  </div>
</section>

<section class="section section--line" id="funktionen">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[01]</b> Was drin ist</span>
        <h2>{b['warum_h2']}</h2>
      </div>
      <p>{escape(b['warum_p'])}</p>
    </div>
    <div class="gr-paket">
      <ul class="gr-items">
{feats}
      </ul>

      <aside class="price price--hi gr-price" aria-label="Passendes Paket">
        <span class="price__tag">Passt meistens</span>
        <h3>{p[0]}</h3>
        <p class="price__amount"><small>ab</small>{p[1]}&nbsp;€</p>
        <p class="price__once">{HAKEN}Einmal zahlen, kein Abo</p>
        <p class="price__lead">{escape(b['paket_text'])}</p>
        <ul class="ticks">
          <li>{escape(p[2])}</li>
        </ul>
        <p class="br-extras-h">Passende Extras</p>
        <ul class="br-extras">{extras}</ul>
        <p class="price__note">Extras rechnet der <a href="/#rechner">Angebots-Rechner</a> als Richtpreis aus. Als Kleinunternehmer verrechne ich keine Umsatzsteuer, alle Preise sind Endpreise.</p>
        <a href="#anfrage" class="btn">Anfragen {PFEIL}</a>
      </aside>
    </div>
    <div class="tk-abo__once tk-once--prices gr-once"><span class="tk-abo__once-ic" aria-hidden="true">{HAKEN}</span><p><strong>Die Seite gehört dir.</strong> Monatlich zahlst du nur deinen Webspace beim Anbieter (ca. 5–10&nbsp;€, inklusive Domain und E-Mail). Die Betreuung durch mich ab 29&nbsp;€ im Monat ist freiwillig und monatlich kündbar.</p></div>
  </div>
</section>

<section class="section section--line" id="beispiele">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[02]</b> Beispiele</span>
        <h2>So kann deine Seite <span class="lime">aussehen</span>.</h2>
      </div>
      <p>{'Dieser Entwurf ist' if n_demos == 1 else 'Diese Entwürfe sind'} individuell programmiert, schnell am Handy und ohne Tracking. Tipp {'ihn' if n_demos == 1 else 'einen'} an, es öffnet sich die echte Seite. Es sind erfundene Betriebe, keine Kundenprojekte.</p>
    </div>
    <ul class="br-demos br-demos--{n_demos}">
      {demo_cards(b['demos'])}
    </ul>
    <p class="gr-more"><a href="/beispiele/">Alle Beispielseiten ansehen {PFEIL}</a></p>
  </div>
</section>

<section class="section section--line" id="google">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[03]</b> Google und Maps</span>
        <h2>Gefunden auf <span class="lime">Google und Maps</span>.</h2>
      </div>
      <p>Wenn jemand „{escape(b['suche'])}“ sucht, entscheiden Webseite und Google-Unternehmensprofil gemeinsam. Bei mir stimmen beide überein: gleicher Name, gleiche Adresse, gleiche Öffnungszeiten.</p>
    </div>
    <div class="rules gr-why">{google}</div>
  </div>
</section>
"""
    html += formular(b, 4)
    html += fragen(b, 5)
    html += f"""
<section class="section section--line ew-end">
  <div class="container">
    <div class="ew-end__box">
      <ul class="ew-end__chips"><li>{HAKEN}Fixer Preis</li><li>{HAKEN}Kein Abo</li><li>{HAKEN}Antwort in 2 Werktagen</li></ul>
      <h2>Dein Betrieb verdient eine <span class="lime">eigene Seite.</span></h2>
      <div class="btn-row"><a href="#anfrage" class="btn">Unverbindlich anfragen {PFEIL}</a></div>
      <p class="gr-end-alt">Lieber erst sehen, wie es aussehen könnte? <a href="/entwurf/">Kostenlosen Entwurf anfordern</a></p>
    </div>
    <nav class="br-other" aria-label="Andere Branchen">
      <p>Webseiten für andere Branchen</p>
      <ul>{andere(alle, b['slug'])}</ul>
    </nav>
  </div>
</section>
"""
    html += FUSS
    return html


def uebersicht(alle):
    url = BASIS + "/webseite/"
    desc = ("Webseiten für Gasthaus, Friseur, Handwerk, Pension, Café, Bäckerei, Werkstatt und Praxis: "
            "was deine Seite können sollte, mit Beispielen und Preisen. Dazu eigene Web-Apps ohne Abo.")
    ld = {
        "@context": "https://schema.org",
        "@graph": [
            {"@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Start", "item": BASIS + "/"},
                {"@type": "ListItem", "position": 2, "name": "Webseite für deine Branche", "item": url}]},
            {"@type": "CollectionPage", "@id": url + "#seite", "name": "Webseite für deine Branche", "url": url,
             "description": desc, "inLanguage": "de-AT", "isPartOf": {"@id": BASIS + "/#website"},
             "mainEntity": {"@type": "ItemList", "itemListElement": [
                 {"@type": "ListItem", "position": i + 1, "name": "Webseite für " + text_plain(b["kurz"]),
                  "url": f'{BASIS}/webseite/{b["slug"]}/'} for i, b in enumerate(alle)]}},
        ],
    }
    karten = []
    for b in alle:
        href, img, h, art, name, alt = b["demos"][0]
        karten.append(
            f'<li><a href="/webseite/{b["slug"]}/"><span class="br-demo__ph"><img src="/assets/img/demos/{img}" alt="" '
            f'width="560" height="{h}" loading="lazy"></span><span class="br-hub__t">{escape(b["kurz"])}</span>'
            f'<span class="br-hub__p">{escape(b["karte"])}</span><span class="br-demo__go">Mehr dazu {PFEIL}</span></a></li>')
    karten_html = "\n      ".join(karten)
    also_karten = "\n      ".join([
        also_karte("/verein/", "team", "Gratis", "Verein?", "Kostenlose Webseite für Vereine im Mostviertel"),
        also_karte("/gruender/", "rakete", "590&nbsp;€ fix", "Gerade gegründet?",
                   "Start-Paket mit Webseite, Google&#8209;Eintrag und Impressum"),
    ])
    apps = []
    for href, img, tag, titel, text, alt in APPS:
        apps.append(
            f'<li><a href="{href}"><span class="br-app__ph"><img src="/assets/img/apps/{img}" alt="{escape(alt)}" '
            f'width="720" height="450" loading="lazy"></span><span class="br-app__tag">{tag}</span>'
            f'<span class="br-hub__t">{titel}</span><span class="br-hub__p">{text}</span>'
            f'<span class="br-demo__go">Ausprobieren {PFEIL}</span></a></li>')
    apps_html = "\n      ".join(apps)
    html = head("Webseite für deine Branche | Tim Kofler – Webdesign", desc, url,
                "Webseite für deine Branche", desc, ld)
    html += f"""
<section class="section tk-hero ew-hero gr-hero br-hero">
  <canvas class="tk-field" aria-hidden="true"></canvas>
  <div class="container" style="position:relative">
    <nav class="br-crumbs" aria-label="Brotkrümel"><a href="/">Start</a> <span aria-hidden="true">/</span> <span>Branchen</span></nav>
    <span class="label"><b>[Branchen]</b> Webdesign aus Niederösterreich</span>
    <h1>Webseite für deine Branche. <span class="lime">Gebaut für das, was deine Kunden suchen.</span></h1>
    <p class="lead">Ein Gasthaus braucht ein Mittagsmenü, ein Friseur den Online-Termin, ein Dachdecker Referenzen. Hier siehst du, was eine Seite in deiner Branche können sollte, mit echten Beispielen und Preisen.</p>
    <ul class="ew-trust"><li><b>Ohne</b> Baukasten</li><li><b>Fixer</b> Preis</li><li><b>Persönlich</b> aus dem Mostviertel</li><li><b>Kein Tracking</b>, keine Cookies</li></ul>
  </div>
</section>

<section class="section section--line" id="branchen">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[01]</b> Branchen</span>
        <h2>Wähle deine <span class="lime">Branche</span>.</h2>
      </div>
      <p>Deine ist nicht dabei? Kein Problem, ich baue Seiten für jeden kleinen Betrieb. Schreib mir einfach, was du machst.</p>
    </div>
    <ul class="br-demos br-hub">
      {karten_html}
    </ul>
    <div class="br-also">
      {also_karten}
    </div>
  </div>
</section>

<section class="section section--line" id="apps">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[02]</b> Web-Apps</span>
        <h2>Mehr als eine Webseite: <span class="lime">deine eigene App</span>.</h2>
      </div>
      <p>Termine, Gutscheine, Mitglieder oder Reservierungen an einem Ort, ohne Monats-Abo. Als Erweiterung zu deiner Webseite zum Sonderpreis. Alle vier Beispiele kannst du live ausprobieren.</p>
    </div>
    <ul class="br-demos br-hub br-apps">
      {apps_html}
    </ul>
  </div>
</section>
"""
    b = {"firma_ph": "z. B. Tischlerei Maier", "nachricht_ph": "z. B. was du anbietest und was die Seite können soll",
         "wa": "ich interessiere mich für eine Webseite.", "paket": "start",
         "faq": [["Machst du auch Seiten für andere Branchen?", "Ja. Die Branchen hier sind Beispiele, an denen man gut sieht, was geht. Ich baue Seiten für jeden kleinen Betrieb und jede Selbstständige, vom Steuerberater bis zur Hundeschule."],
                 ["Was kostet eine Webseite?", "Start ab 590 €, Business ab 1.190 €, einmal zahlen, kein Abo. Für Neugründungen gibt es das <a href=\"/gruender/\">Start-Paket</a> zum Fixpreis. Den Richtpreis mit Extras rechnet der <a href=\"/#rechner\">Angebots-Rechner</a> aus."],
                 ["Muss ich dafür zu dir kommen?", "Nein. Wir besprechen alles per Telefon oder Videocall, Fotos und Texte lädst du im Kundenportal hoch. Das klappt in ganz Österreich."]]}
    html += formular(b, 3)
    html += fragen(b, 4)
    html += FUSS
    return html


CSS_V = "1"

if __name__ == "__main__":
    import hashlib
    css = os.path.normpath(os.path.join(HIER, "..", "..", "webdesign", "assets", "css", "branchen.css"))
    CSS_V = hashlib.sha1(open(css, "rb").read()).hexdigest()[:8]
    daten = json.load(open(os.path.join(HIER, "daten.json"), encoding="utf-8"))["branchen"]
    os.makedirs(ZIEL, exist_ok=True)
    with open(os.path.join(ZIEL, "index.html"), "w", encoding="utf-8") as f:
        f.write(uebersicht(daten))
    for b in daten:
        os.makedirs(os.path.join(ZIEL, b["slug"]), exist_ok=True)
        with open(os.path.join(ZIEL, b["slug"], "index.html"), "w", encoding="utf-8") as f:
            f.write(seite(b, daten))
    print(f"{len(daten)} Branchenseiten + Übersicht nach {ZIEL} geschrieben")
