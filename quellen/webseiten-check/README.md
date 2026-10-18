# Webseiten-Check für Kundenfinder-Leads

`check.py` prüft die Webseite eines Leads (nur öffentliche Seite lesen, keine Kontaktaufnahme) und bewertet die Chance für einen Brief.

Aufruf (Python 3, braucht `requests` und `bs4`):

    # 1. Leads als JSON exportieren (ArtifactData list, out_dir=<ordner>/db) -> <ordner>/db/leads/<id>.json
    # 2. python3 -I check.py <ordner>/db/leads <ordner>/out
    # 3. pro Lead entsteht <ordner>/out/<id>.json mit {"id", "check": {...}}; das Objekt `check` per ArtifactData "update" in leads/<id> schreiben.

Felder in `check`: geprueft (Datum), webseite (true/false), url, erreichbar, https, handy, impressum, datenschutz, platzhalter, jahr (Copyright), technik, ladezeit_ms, google (true/false/null = nicht geprüft), google_url, befunde (Liste), chance (0–100), ansatz (bester Aufhänger für den Brief), quelle ("script" oder "agent").

Google-Unternehmensprofil prüft das Script nicht; das ergänzt der Such-Agent per Websuche (`google`, `google_url`) und rechnet bei fehlendem Eintrag +10 auf `chance`.

Punkte für `chance`: keine Webseite 50 · nur Social Media 40 · Platzhalter/nicht erreichbar 45 · nicht handytauglich 25 · kein HTTPS 15 · kein Impressum 10 · Copyright ≤ 2023 10 · Frames/Tabellen/Flash 10 · langsam (> 3 s) 8 · Baukasten 8 · kein Google-Eintrag 10 · Neugründung 10 · Lead-Score ≥ 4: 5. Gedeckelt bei 100.

Abruf aus einer frischen Sitzung ohne Repo-Checkout:

    curl -sL https://raw.githubusercontent.com/timkofler/Website/main/quellen/webseiten-check/check.py -o check.py
