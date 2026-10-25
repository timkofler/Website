#!/usr/bin/env python3
"""Zählt die Beispiele auf tim-kofler.at und hält jede Zahl dazu auf der ganzen Seite gleich.

Quelle ist allein webdesign/beispiele/index.html: jeder Link /beispiele/<ordner>/ (oder .../vN/) ist ein Beispiel.
  Webseiten  = alle verlinkten Beispiele außer den Web-Apps
  Web-Apps   = Betriebs-App, Vereins-App und die Dashboards
  Gesamt     = Webseiten + Web-Apps (steht im schwebenden Hinweis)
  Branchen   = Unterordner von webdesign/beispiele/ ohne Apps, Saison-Seiten und Zweitentwürfe

Durchsucht werden ALLE Text-Dateien in webdesign/ (Seiten, Meta-Beschreibungen, JSON-LD, llms.txt, JavaScript)
nach Sätzen wie "neunzehn komplette Beispielseiten", "Achtzehn Beispiel-Webseiten", "vier Web-Apps" usw.

  python3 .github/scripts/beispiele-zaehler.py             prüft nur (CI, schlägt bei falscher Zahl fehl)
  python3 .github/scripts/beispiele-zaehler.py --schreiben  schreibt die richtigen Zahlen in alle Dateien und
                                                            erhöht bei geändertem JS das ?v= in allen Seiten
Der Deploy führt --schreiben vor dem Hochladen aus, damit online nie eine falsche Zahl steht.
"""
import hashlib
import pathlib
import re
import sys

WEB = pathlib.Path(__file__).resolve().parents[2] / "webdesign"
APPS = ("dashboard", "betriebs-app", "verein-app")
AUSGENOMMEN = {
    "_shared",
    *APPS,            # Web-Apps, werden extra gezählt
    "halloween",      # Saison-Seite, nicht in der Übersicht
    "pizzeria",       # dritter Entwurf der Branche Gasthaus & Restaurant
}
ENDUNGEN = {".html", ".php", ".js", ".txt", ".json", ".xml", ".md"}
# Gecachte Skripte: ändert sich ihr Inhalt, muss das ?v= in allen Seiten mit
VERSIONIERT = ["assets/js/tk-extra.js", "assets/js/tk-ui.js"]

EINER = ["", "ein", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun"]
SONDER = {1: "eins", 10: "zehn", 11: "elf", 12: "zwölf", 16: "sechzehn", 17: "siebzehn"}
ZEHNER = {2: "zwanzig", 3: "dreißig", 4: "vierzig", 5: "fünfzig"}


def wort(z):
    if z in SONDER:
        return SONDER[z]
    if z < 10:
        return EINER[z]
    if z < 20:
        return EINER[z - 10] + "zehn"
    e, t = z % 10, ZEHNER[z // 10]
    return t if e == 0 else EINER[e] + "und" + t


WOERTER = {wort(z): z for z in range(1, 60)}
ZAHL = r"(?P<zahl>\d+|" + "|".join(sorted(WOERTER, key=len, reverse=True)) + r")"

# (Name, Muster). Die Zahl steht immer in der Gruppe "zahl".
MUSTER = [
    ("webseiten", rf"\b{ZAHL} (?:komplette |live begehbare )?(?:Beispielseiten|Beispiel-Webseiten)\b"),
    ("webseiten", rf"\b{ZAHL} Beispiel-Entwürfe für typische Branchen"),
    ("apps", rf"\b{ZAHL} Web-Apps\b"),
    ("branchen", rf"(?:Beispielseiten|Animationen) für {ZAHL} Branchen\b"),
    ("gesamt", r"var ANZAHL = (?P<zahl>\d+);"),
]


def zaehlen():
    index = (WEB / "beispiele/index.html").read_text(encoding="utf-8")
    links = set(re.findall(r'href="/beispiele/([a-z0-9-]+(?:/v[0-9]+)?)/"', index))
    seiten = sorted(l for l in links if l.split("/")[0] not in APPS)
    apps = sorted(l for l in links if l.split("/")[0] in APPS)
    branchen = sorted(p.name for p in (WEB / "beispiele").iterdir() if p.is_dir() and p.name not in AUSGENOMMEN)
    return seiten, apps, branchen


def als(alt, neu):
    """Neue Zahl in derselben Schreibweise wie die alte (Ziffer, wort, Wort)."""
    if alt.isdigit():
        return str(neu)
    w = wort(neu)
    return w.capitalize() if alt[0].isupper() else w


def dateien():
    for p in sorted(WEB.rglob("*")):
        if p.is_file() and p.suffix in ENDUNGEN and "/_data/" not in p.as_posix():
            yield p


def main():
    schreiben = "--schreiben" in sys.argv
    seiten, apps, branchen = zaehlen()
    soll = {"webseiten": len(seiten), "apps": len(apps), "branchen": len(branchen)}
    soll["gesamt"] = soll["webseiten"] + soll["apps"]
    print(f"{soll['webseiten']} Webseiten: {', '.join(seiten)}")
    print(f"{soll['apps']} Web-Apps: {', '.join(apps)}")
    print(f"{soll['gesamt']} Beispiele gesamt (schwebender Hinweis)")
    print(f"{soll['branchen']} Branchen: {', '.join(branchen)}")

    fehler, geaendert, treffer = [], [], {k: 0 for k in soll}
    for p in dateien():
        try:
            text = p.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        neu = text
        for name, muster in MUSTER:
            def ersetzen(m, name=name):
                treffer[name] += 1
                alt = m.group("zahl")
                ist = int(alt) if alt.isdigit() else WOERTER[alt.lower()]
                if ist == soll[name]:
                    return m.group(0)
                zeile = text.count("\n", 0, m.start()) + 1
                fehler.append(f"{p.relative_to(WEB)}:{zeile}: „{m.group(0)}“ → {name} sind {soll[name]}")
                a, b = m.span("zahl")
                s = m.group(0)
                return s[: a - m.start()] + als(alt, soll[name]) + s[b - m.start():]
            neu = re.sub(muster, ersetzen, neu, flags=re.IGNORECASE)
        if neu != text and schreiben:
            p.write_text(neu, encoding="utf-8")
            geaendert.append(p.relative_to(WEB).as_posix())

    # Sicherheitsnetz: verschwindet ein Muster ganz (Satz umformuliert), soll das auffallen statt still zu veralten
    for name, n in treffer.items():
        if n == 0:
            fehler.append(f"Keine Stelle für „{name}“ gefunden – wurde ein Satz umformuliert? Muster in diesem Skript anpassen.")

    for js in VERSIONIERT:
        v = hashlib.md5((WEB / js).read_bytes()).hexdigest()[:8]
        name = re.escape(js.rsplit("/", 1)[1])
        for p in dateien():
            if p.suffix not in {".html", ".php"}:
                continue
            text = p.read_text(encoding="utf-8")
            neu = re.sub(rf"({name}\?v=)[0-9a-f]+", rf"\g<1>{v}", text)
            if neu == text:
                continue
            if schreiben:
                p.write_text(neu, encoding="utf-8")
                geaendert.append(p.relative_to(WEB).as_posix())
            else:
                fehler.append(f"{p.relative_to(WEB)}: {js}?v= passt nicht zum Inhalt (soll {v})")

    if schreiben:
        print("Angepasst: " + (", ".join(sorted(set(geaendert))) or "nichts, alles stimmte schon"))
        # Beim Deploy nur warnen, damit ein umformulierter Satz nie das Veröffentlichen blockiert (die PR-Prüfung meldet es)
        for f in fehler:
            if f.startswith("Keine Stelle"):
                print("::warning::" + f)
        return

    if fehler:
        print("Zahl der Beispiele stimmt nicht (mit --schreiben automatisch beheben):")
        print("\n".join("  " + f for f in fehler))
        sys.exit(1)
    print(f"Alle Zähler stimmen ({sum(treffer.values())} Stellen geprüft).")


if __name__ == "__main__":
    main()
