# Erzeugt webdesign/bildnachweis/index.html aus daten.py (Kopf und Fuß vom Impressum)
# und quellen/bildnachweis/inventar.csv. Aufruf im Repo-Wurzelordner: python3 quellen/bildnachweis/make.py
import csv, html, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from daten import SEITEN

LIZ = {
 "P": ("Pexels", "Pexels-Lizenz", "https://www.pexels.com/de-de/lizenz/"),
 "PV": ("Pexels", "Pexels-Lizenz", "https://www.pexels.com/de-de/lizenz/"),
 "MX": ("Mixkit", "Mixkit Stock Video Free License", "https://mixkit.co/license/#videoFree"),
 "SS": ("StockSnap", "CC0", "https://creativecommons.org/publicdomain/zero/1.0/deed.de"),
 "RP": ("rawpixel", "CC0", "https://creativecommons.org/publicdomain/zero/1.0/deed.de"),
 "WP": ("WordPress Photo Directory", "CC0", "https://creativecommons.org/publicdomain/zero/1.0/deed.de"),
 "PH": ("Poly Haven", "CC0", "https://creativecommons.org/publicdomain/zero/1.0/deed.de"),
 "WM": ("Wikimedia Commons", "CC0", "https://creativecommons.org/publicdomain/zero/1.0/deed.de"),
}

def url(t, i, slug):
    if t == "P": return f"https://www.pexels.com/photo/{slug or i}/"
    if t == "PV": return f"https://www.pexels.com/video/{i}/"
    if t == "MX": return f"https://mixkit.co/free-stock-video/{slug}/"
    if t == "SS": return f"https://stocksnap.io/photo/{slug}"
    if t == "RP": return f"https://www.rawpixel.com/image/{i}"
    if t == "WP": return f"https://wordpress.org/photos/photo/{i}/"
    if t == "PH": return f"https://polyhaven.com/a/{i}"
    if t == "WM": return f"https://commons.wikimedia.org/wiki/{i}"

def anker(pfad):
    p = pfad.strip("/").split("/")[1:]
    a = p[0]
    if a == "gasthaus" and len(p) > 1: return "glut"
    if len(p) > 1: return a + "-" + p[1].lstrip("v")
    return a

e = html.escape
teile, zeilen = [], []
for titel, pfad, items in SEITEN:
    li = []
    for t, i, slug, autor, motiv, datei in items:
        quelle, liz, lu = LIZ[t]
        nr = f" #{i}" if t in ("P", "PV", "MX") else ""
        art = "Video" if t in ("PV", "MX") else ("Panorama" if t == "PH" else "Foto")
        von = f" von {e(autor)}" if autor else ""
        li.append(f'      <li><span class="bn-m">{e(motiv)}</span> <a href="{e(url(t, i, slug))}" target="_blank" rel="noopener">{art}{nr} auf {quelle}</a>{von} · <a href="{lu}" target="_blank" rel="noopener">{liz}</a></li>')
        zeilen.append([pfad, datei, motiv, quelle, i, url(t, i, slug), autor, liz])
    teile.append(f'    <h2 id="{anker(pfad)}">{e(titel)}</h2>\n    <p class="bn-s"><a href="{pfad}">{pfad}</a></p>\n    <ul class="bn">\n' + "\n".join(li) + "\n    </ul>")

inhalt = """<section class="page-head">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="container" style="position:relative">
    <div class="crumbs"><a href="/">Start</a> / Bildnachweis</div>
    <h1>Bildnachweis</h1>
  </div>
</section>

<section class="section" style="padding-top:64px">
  <div class="container prose">
    <p>Woher die Fotos und Videos auf tim-kofler.at stammen. Jede Quelle wurde einzeln geprüft (Stand: 20. Oktober 2026). Die Beispielseiten zeigen erfundene Betriebe; abgebildete Personen sind Fotomodelle und stehen in keiner Verbindung zu den erfundenen Namen.</p>

    <h2 id="eigene">Eigene Inhalte</h2>
    <ul>
      <li>Porträtfoto von Tim Kofler, Logo, Grafiken, Bildschirmfotos und Bildschirmaufnahmen der eigenen Webseiten: Tim Kofler.</li>
      <li>3D-Darstellungen (Auto, Möbel, Haus, Kaffeebecher, Cider-Dose, Haar, Wohnzimmer) sind im Browser berechnet und selbst programmiert.</li>
      <li>Die Produktbilder im Beispiel-Onlineshop Birnkammer (Flaschen, Gläser, Sackerl, Kistl, Gutschein) sind selbst gezeichnete Grafiken ohne fremde Bilder.</li>
      <li>Die Scroll-Filme im Café Mühlbach und im Landgasthof Hollerhof hat Tim Kofler mit KI erzeugt (Google Flow). Sie zeigen keine echten Orte oder Personen.</li>
      <li>Schriften: Unbounded, Manrope, JetBrains Mono und die Schriften der Beispielseiten stammen von Google Fonts (SIL Open Font License bzw. Apache License 2.0) und liegen auf diesem Server.</li>
    </ul>

    <h2 id="lizenzen">Lizenzen kurz erklärt</h2>
    <ul>
      <li><strong>Pexels-Lizenz:</strong> kostenlose Nutzung, auch geschäftlich, ohne Namensnennung. Wir nennen die Fotografinnen und Fotografen trotzdem.</li>
      <li><strong>CC0:</strong> gemeinfrei, keine Bedingungen.</li>
      <li><strong>Mixkit Stock Video Free License:</strong> kostenlose Nutzung, auch geschäftlich.</li>
    </ul>
    <p>Die runden Vorschaubilder im schwebenden Hinweis „Beispielseiten ansehen“ sind Ausschnitte aus den unten genannten Videos und Fotos der jeweiligen Beispielseite.</p>
    <p>Der Vorher-Nachher-Vergleich auf <a href="/entwurf/#vorher-nachher">/entwurf/</a> zeigt Bildschirmfotos der Beispielseiten. Die erfundenen „alten“ Webseiten daneben verwenden kleine Ausschnitte aus den unten genannten Fotos und Videos der Beispielseiten.</p>
    <p>Die Vorschaubilder im Abschnitt „Web-Apps &amp; Dashboards“ der Startseite sind Bildschirmfotos meiner eigenen Beispielseiten. Darin sichtbare Fotos stammen aus den unten genannten Quellen der jeweiligen Seite (Luma Drive, Haustechnik Kofler, Fleischerei Haselberger).</p>

""" + "\n\n".join(teile) + """

    <h2 id="hinweis">Hinweis</h2>
    <p>Sollte trotz sorgfältiger Prüfung ein Bild Rechte verletzen, bitte eine kurze Nachricht an <a href="mailto:office@tim-kofler.at">office@tim-kofler.at</a>. Das Bild wird sofort entfernt.</p>
  </div>
</section>
"""

imp = open("webdesign/impressum/index.html", encoding="utf-8").read()
kopf, rest = imp.split("<main>", 1)
fuss = rest.split("</main>", 1)[1]
kopf = (kopf.replace("Impressum | Tim Kofler", "Bildnachweis | Tim Kofler")
        .replace("Impressum und Offenlegung von Tim Kofler, Webdesign, Oberndorf an der Melk.", "Bildnachweis: Herkunft und Lizenz aller Fotos und Videos auf tim-kofler.at.")
        .replace("https://tim-kofler.at/impressum/", "https://tim-kofler.at/bildnachweis/"))
stil = """  <style>
    .bn{list-style:none;padding-left:0!important}
    .bn li{padding:9px 0;border-bottom:1px solid var(--line, #262626);font-size:.95rem;line-height:1.5}
    .bn-m{display:inline-block;min-width:11em;color:#f2f2ee;font-weight:700}
    .bn-s{margin:-10px 0 8px;font-size:.9rem}
    @media (max-width:600px){.bn-m{display:block;min-width:0}}
  </style>
</head>"""
kopf = kopf.replace("</head>", stil, 1)
os.makedirs("webdesign/bildnachweis", exist_ok=True)
open("webdesign/bildnachweis/index.html", "w", encoding="utf-8").write(kopf + "<main>\n\n" + inhalt + "\n</main>" + fuss)
with open("quellen/bildnachweis/inventar.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f, delimiter=";")
    w.writerow(["seite", "datei", "motiv", "quelle", "id", "url", "urheber", "lizenz"])
    w.writerows(zeilen)
print(len(zeilen), "Einträge")
