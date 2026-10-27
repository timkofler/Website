#!/usr/bin/env python3
"""Baut die Seite /check/ (kostenloser Webseiten-Check „Ist meine Webseite noch zeitgemäß?“).

Aufruf aus dem Repo-Hauptordner:  python3 quellen/check/build.py
Texte stehen hier, Kopf und Fragen kommen aus den Orts- und Branchen-Generatoren.
Das Formular schickt form=check an /api/anmelden.php (Anfrage im Admin, Mail an Tim, Double-Opt-in über Brevo).
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
br.ICONS.setdefault("lupe", '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>')
br.ICONS.setdefault("schloss", '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>')
br.ICONS.setdefault("dokument", '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>')
br.ICONS.setdefault("post", '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>')
BASIS = br.BASIS
URL = BASIS + "/check/"
P, H = br.PFEIL, br.HAKEN

TITLE = "Kostenloser Webseiten-Check | Tim Kofler – Webdesign"
DESC = ("Ist deine Webseite noch zeitgemäß? Link schicken, in 24 Stunden ehrliche Einschätzung zu Handy, Google, "
        "Sicherheit und Impressum. Kostenlos.")

PUNKTE = [
    ("handy", "Am Handy", "Lesbar ohne Zoomen? Knöpfe groß genug? Telefonnummer und Weg zu dir mit einem Tipp?"),
    ("uhr", "Ladezeit", "Wie schnell die Seite am Handy da ist und was sie bremst, etwa riesige Bilder oder alte Plugins."),
    ("lupe", "Google und KI-Suche", "Wirst du bei Google und in Maps gefunden, und verstehen ChatGPT und Co., was du anbietest?"),
    ("schloss", "Sicherheit", "Verschlüsselung (HTTPS), veraltete Technik und offene Baustellen, die Besucher abschrecken."),
    ("dokument", "Impressum und Datenschutz", "Sind die Pflichtangaben für Österreich da und auffindbar? Fehlt etwas Wichtiges?"),
    ("post", "Anfragen", "Findet ein Besucher schnell, was du kostest, wann du offen hast und wie er dich erreicht?"),
]

SCHRITTE = [
    ("Link schicken", "Adresse deiner Webseite, Name und E-Mail. Mehr brauche ich nicht, auch keine Zugangsdaten."),
    ("E-Mail bestätigen", "Ein Klick in der Mail, damit ich weiß, dass die Anfrage wirklich von dir kommt."),
    ("Ich schaue sie mir an", "Persönlich, am Handy und am PC, nicht nur mit einem automatischen Test."),
    ("Antwort in 24 Stunden", "An Werktagen per E-Mail: was gut ist, was dich Anfragen kostet und was sich leicht verbessern lässt."),
]

DANACH = [
    ("Passt alles?", "Dann sage ich dir das auch so. Kein Grund, Geld auszugeben."),
    ("Nur Kleinigkeiten?", "Du bekommst konkrete Tipps, die du oder dein Webdesigner selbst umsetzen könnt."),
    ("Zeit für etwas Neues?", "Dann zeige ich dir, wie es aussehen könnte: <a href=\"/entwurf/\">Gratis-Entwurf in 48 Stunden</a>, "
     "<a href=\"/webseite-erneuern/\">Erneuern ab 590&nbsp;€</a>, Google-Platzierung bleibt dran."),
]

FAQ = [
    ("Kostet der Check wirklich nichts?",
     "Ja, er ist kostenlos und unverbindlich. Du gehst damit keinen Vertrag ein und musst danach nichts kaufen."),
    ("Ruft mich danach jemand an?",
     "Nein. Du bekommst die Einschätzung per E-Mail. Ob du dich danach meldest, entscheidest du allein."),
    ("Was brauchst du von mir?",
     "Nur die Adresse deiner Webseite, deinen Namen und deine E-Mail-Adresse. Zugangsdaten oder Passwörter brauche ich für den Check nicht, bitte schick mir auch keine."),
    ("Wie schnell kommt die Antwort?",
     "Innerhalb von 24 Stunden an Werktagen, nachdem du deine E-Mail-Adresse bestätigt hast. Schickst du den Link am Freitagabend, hast du die Antwort spätestens am Montag."),
    ("Meine Seite ist mit WordPress, Wix oder Jimdo gebaut. Geht das?",
     "Ja. Ich prüfe, was ein Besucher und Google sehen, egal womit die Seite gebaut ist."),
    ("Was passiert mit meinen Angaben?",
     "Sie liegen auf meinem Webspace in Österreich bzw. der EU in einem gesperrten Bereich und werden nur für den Check und Rückfragen dazu verwendet. Kommt kein Auftrag zustande, lösche ich sie spätestens nach 12 Monaten, auf Wunsch sofort. Mehr in der <a href=\"/datenschutz/#check\">Datenschutzerklärung</a>."),
]


def ld():
    return {"@context": "https://schema.org", "@graph": [
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Start", "item": BASIS + "/"},
            {"@type": "ListItem", "position": 2, "name": "Webseiten-Check", "item": URL}]},
        {"@type": "Service", "@id": URL + "#check", "name": "Kostenloser Webseiten-Check", "serviceType": "Website-Analyse",
         "description": "Persönliche Einschätzung einer bestehenden Webseite (Handy, Ladezeit, Google und KI-Suche, Sicherheit, Impressum und Datenschutz, Anfragen) per E-Mail innerhalb von 24 Stunden an Werktagen.",
         "provider": {"@id": BASIS + "/#unternehmen"}, "areaServed": {"@type": "Country", "name": "Österreich"}, "url": URL,
         "offers": {"@type": "Offer", "price": "0", "priceCurrency": "EUR", "availability": "https://schema.org/InStock"}},
        {"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": br.text_plain(a)}} for q, a in FAQ]},
    ]}


def formular(num):
    wa = br.wa_link("kannst du dir bitte meine Webseite ansehen? Die Adresse ist: ")
    return f"""
<section class="section section--line" id="anfrage">
  <div class="container form-wrap">
    <div>
      <span class="label"><b>[{num:02d}]</b> Check anfordern</span>
      <h2 style="margin:14px 0 18px">Schick mir deinen <span class="lime">Link</span>.</h2>
      <p class="muted" style="margin-bottom:24px">Drei Felder, fertig. Du bekommst die Antwort innerhalb von 24 Stunden an Werktagen per E-Mail. Kostenlos und unverbindlich.</p>
      <form class="form ck-form" action="/api/anmelden.php" method="post" data-cx-form>
        <input type="hidden" name="form" value="check"><input type="hidden" name="quelle" value="">
        <div class="form__hp" aria-hidden="true"><label>Webseite<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
        <input type="hidden" name="ts" value="">
        <label class="form__field"><span>Adresse deiner Webseite</span><input type="text" name="url" required maxlength="200" inputmode="url" autocomplete="url" placeholder="z. B. mein-betrieb.at" spellcheck="false" autocapitalize="off"></label>
        <div class="form__row">
          <label class="form__field"><span>Name</span><input type="text" name="name" required maxlength="80" autocomplete="name"></label>
          <label class="form__field"><span>E-Mail</span><input type="email" name="email" required maxlength="254" autocomplete="email" inputmode="email"></label>
        </div>
        <label class="form__check"><input type="checkbox" name="datenschutz" value="ja" required><span>Ich habe die <a href="/datenschutz/#check">Datenschutzerklärung</a> gelesen. Meine Angaben werden für den Check gespeichert und die E-Mails laufen über Brevo.</span></label>
        <button class="btn" type="submit">Kostenlos prüfen lassen {P}</button>
        <p class="form__status" role="status" aria-live="polite" hidden></p>
        <p class="form__alt">Lieber direkt? Link per <a href="{wa}" rel="noopener">WhatsApp</a>, <a href="https://t.me/TimKofler" rel="noopener">Telegram</a> oder an <a href="mailto:office@tim-kofler.at">office@tim-kofler.at</a></p>
      </form>
    </div>
    <aside class="form-aside">
      <h2>So läuft der Check</h2>
      <ol class="form-steps">
{"".join(f"        <li><b>{escape(h)}</b><span>{escape(t)}</span></li>{chr(10)}" for h, t in SCHRITTE)}      </ol>
      <div class="wa-box">
        <p><b>Noch keine Webseite?</b> Dann gibt es nichts zu prüfen, aber ich gestalte dir einen <a href="/entwurf/">kostenlosen Entwurf</a> für Handy und PC.</p>
      </div>
    </aside>
  </div>
</section>
"""


def seite():
    b = {"wa": "kannst du dir bitte meine Webseite ansehen? Die Adresse ist: ", "faq": FAQ}
    punkte = "\n".join(
        f'        <li class="gr-item">\n          {br.icon(ic)}\n          <h3>{escape(h)}</h3>\n          <p>{escape(t)}</p>\n        </li>'
        for ic, h, t in PUNKTE)
    danach = "".join(f'<li class="step"><h3>{escape(h)}</h3><p>{t}</p></li>' for h, t in DANACH)
    html = orte.kopf(TITLE, DESC, URL, "Ist deine Webseite noch zeitgemäß? Kostenloser Check", ld())
    html = html.replace('<a href="#anfrage" class="btn btn--sm">Anfragen</a>', '<a href="#anfrage" class="btn btn--sm">Check anfordern</a>')
    html = html.replace('og-tk-4.jpg', 'og-check.jpg')
    html += f"""

<section class="section tk-hero ew-hero gr-hero br-hero">
  <canvas class="tk-field" aria-hidden="true"></canvas>
  <div class="container" style="position:relative">
    <nav class="br-crumbs" aria-label="Brotkrümel"><a href="/">Start</a> <span aria-hidden="true">/</span> <span>Webseiten-Check</span></nav>
    <span class="label"><b>[Gratis]</b> Webseiten-Check</span>
    <h1>Ist deine Webseite noch zeitgemäß? <span class="lime">Ich schau sie mir kostenlos an.</span></h1>
    <p class="lead">Schick mir den Link, ich prüfe deine Seite persönlich am Handy und am PC. Innerhalb von 24 Stunden an Werktagen bekommst du per E-Mail eine ehrliche Einschätzung, was gut ist und was dich Anfragen kostet.</p>
    <div class="btn-row" style="margin-top:34px">
      <a href="#anfrage" class="btn">Kostenlos prüfen lassen {P}</a>
      <a href="#pruefpunkte" class="btn btn--line">Was ich prüfe</a>
    </div>
    <ul class="ew-trust"><li><b>Kostenlos</b> und unverbindlich</li><li><b>Antwort</b> in 24 Stunden</li><li><b>Persönlich</b> geprüft</li><li><b>Kein Anruf</b>, kein Verkaufsgespräch</li></ul>
  </div>
</section>

<section class="section section--line" id="pruefpunkte">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[01]</b> Was ich prüfe</span>
        <h2>Sechs Punkte, die <span class="lime">Anfragen bringen.</span></h2>
      </div>
      <p>Eine Webseite kann online sein und trotzdem jeden Tag Kunden kosten. Ich schaue mir genau die Dinge an, die für einen Betrieb zählen, und erkläre sie ohne Fachchinesisch.</p>
    </div>
    <ul class="gr-items gr-items--3">
{punkte}
    </ul>
  </div>
</section>
"""
    html += formular(2)
    html += f"""
<section class="section section--line" id="danach">
  <div class="container">
    <div class="head">
      <div>
        <span class="label"><b>[03]</b> Und dann?</span>
        <h2>Ehrlich, auch wenn <span class="lime">alles passt.</span></h2>
      </div>
      <p>Der Check ist kein Verkaufstrick. Du bekommst eine klare Antwort und entscheidest selbst, was du damit machst.</p>
    </div>
    <ol class="steps">{danach}</ol>
  </div>
</section>
"""
    html += br.fragen(b, 4)
    html += f"""
<section class="section section--line ew-end">
  <div class="container">
    <div class="ew-end__box">
      <ul class="ew-end__chips"><li>{H}Kostenlos</li><li>{H}In 24 Stunden</li><li>{H}Ohne Anruf</li></ul>
      <h2>Ein Link genügt, <span class="lime">den Rest mache ich.</span></h2>
      <div class="btn-row"><a href="#anfrage" class="btn">Kostenlos prüfen lassen {P}</a></div>
      <p class="gr-end-alt">Schon klar, dass die Seite neu muss? <a href="/webseite-erneuern/">Webseite erneuern ab 590&nbsp;€</a></p>
    </div>
  </div>
</section>
"""
    html += br.FUSS
    return html


if __name__ == "__main__":
    css = os.path.join(orte.WEB, "assets", "css", "branchen.css")
    br.CSS_V = hashlib.sha1(open(css, "rb").read()).hexdigest()[:8]
    ziel = os.path.join(orte.WEB, "check")
    os.makedirs(ziel, exist_ok=True)
    with open(os.path.join(ziel, "index.html"), "w", encoding="utf-8") as f:
        f.write(seite())
    print("check geschrieben")
