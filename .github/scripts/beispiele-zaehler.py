#!/usr/bin/env python3
"""Prüft, ob die Zahl der Beispielseiten und Branchen überall auf tim-kofler.at stimmt.

Branchen: jeder Unterordner von webdesign/beispiele/, außer den unten ausgenommenen
(Dashboards, Apps, Saison-Seiten, Zweitentwürfe einer Branche).
Seiten: alle Beispiel-Webseiten, die beispiele/index.html verlinkt (mit Zweitentwürfen), ohne die Web-Apps.
Kommt ein neues Beispiel dazu, schlägt die Prüfung fehl, bis alle Texte angepasst sind.
"""
import pathlib
import re
import sys

WEB = pathlib.Path(__file__).resolve().parents[2] / "webdesign"
AUSGENOMMEN = {
    "_shared",
    "dashboard",      # Betriebs-Dashboards, werden extra genannt
    "betriebs-app",   # Zusatzleistung, kein Branchen-Beispiel
    "verein-app",     # Zusatzleistung für Vereine, kein Branchen-Beispiel
    "halloween",      # Saison-Seite, nicht in der Übersicht
    "pizzeria",       # dritter Entwurf der Branche Gasthaus & Restaurant
}
WORTE = {12: "zwölf", 13: "dreizehn", 14: "vierzehn", 15: "fünfzehn", 16: "sechzehn",
         17: "siebzehn", 18: "achtzehn", 19: "neunzehn", 20: "zwanzig"}

branchen = sorted(p.name for p in (WEB / "beispiele").iterdir() if p.is_dir() and p.name not in AUSGENOMMEN)
nb = len(branchen)
APPS = ("dashboard", "betriebs-app", "verein-app")
links = set(re.findall(r'href="/beispiele/([a-z0-9-]+(?:/v[0-9]+)?)/"', (WEB / "beispiele/index.html").read_text(encoding="utf-8")))
seiten = sorted(l for l in links if l.split("/")[0] not in APPS)
n = len(seiten)
wort, bwort = WORTE.get(n, str(n)), WORTE.get(nb, str(nb))

# Datei -> Muster, das die aktuelle Zahl enthalten muss
STELLEN = {
    "index.html": rf"{wort} Beispiel-Entwürfe",
    "beispiele/index.html": rf"{wort} komplette Beispielseiten für {bwort} Branchen",
    "llms.txt": rf"{wort} live begehbare Beispiel-Webseiten .{{0,60}}für {bwort} Branchen",
    "assets/js/tk-extra.js": rf"var ANZAHL = {n};",
    "assets/js/tk-ui.js": rf"{wort} komplette Beispielseiten",
}

fehler = []
for datei, muster in STELLEN.items():
    text = (WEB / datei).read_text(encoding="utf-8")
    if not re.search(muster, text, re.IGNORECASE):
        fehler.append(f"{datei}: erwartet '{muster}'")

print(f"{n} Beispielseiten: {', '.join(seiten)}")
print(f"{nb} Branchen: {', '.join(branchen)}")
if fehler:
    print("Zahl der Beispielseiten veraltet:")
    print("\n".join("  " + f for f in fehler))
    sys.exit(1)
print("Alle Zähler stimmen.")
