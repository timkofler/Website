#!/usr/bin/env python3
"""Prüft, ob die Zahl der Branchen-Beispiele überall auf tim-kofler.at stimmt.

Quelle ist der Ordner webdesign/beispiele/: jeder Unterordner ist ein Branchen-Beispiel,
außer den unten ausgenommenen (Dashboards, Betriebs-App, Saison-Seiten, Zweitentwürfe einer Branche).
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
n = len(branchen)
wort = WORTE.get(n, str(n))

# Datei -> Muster, das die aktuelle Zahl enthalten muss
STELLEN = {
    "index.html": rf"{wort} Beispiel-Entwürfe",
    "beispiele/index.html": rf"{wort} (komplette )?Beispiel",
    "llms.txt": rf"{wort} live begehbare Beispiel",
    "assets/js/tk-extra.js": rf"var ANZAHL = {n};",
    "assets/js/tk-ui.js": rf"{wort} komplette Beispielseiten",
}

fehler = []
for datei, muster in STELLEN.items():
    text = (WEB / datei).read_text(encoding="utf-8")
    if not re.search(muster, text, re.IGNORECASE):
        fehler.append(f"{datei}: erwartet '{muster}'")

print(f"{n} Branchen-Beispiele: {', '.join(branchen)}")
if fehler:
    print("Zahl der Beispielseiten veraltet:")
    print("\n".join("  " + f for f in fehler))
    sys.exit(1)
print("Alle Zähler stimmen.")
