#!/usr/bin/env python3
"""Webseiten-Check für Kundenfinder-Leads.
Liest Lead-JSON-Dateien (ArtifactData-Export), prüft die angegebene Webseite
(nur öffentliche Seite lesen, keine Kontaktaufnahme) und schreibt pro Lead
ein `check`-Objekt nach out/<id>.json (fertig für ArtifactData update).
"""
import glob, json, os, re, sys, time, datetime
import requests, urllib3
from bs4 import BeautifulSoup
urllib3.disable_warnings()

UA = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Mobile Safari/537.36"
TODAY = datetime.date.today().isoformat()
BAUKASTEN = [("wix", "Wix"), ("jimdo", "Jimdo"), ("weebly", "Weebly"), ("ionos", "IONOS-Baukasten"), ("1und1", "1&1-Baukasten"),
             ("gemeindeausstellung", "Gemeinde-Ausstellung"), ("stadtausstellung", "Stadt-Ausstellung"), ("webnode", "Webnode"),
             ("squarespace", "Squarespace"), ("site123", "Site123"), ("strato", "Strato-Baukasten"), ("homepage-baukasten", "Baukasten")]

def fetch(url):
    t0 = time.time()
    r = requests.get(url, headers={"User-Agent": UA, "Accept-Language": "de-AT,de;q=0.9"}, timeout=20, allow_redirects=True)
    return r, time.time() - t0

def check_site(url):
    c = {"webseite": True, "url": url, "befunde": []}
    r = None
    err = None
    for u in [url, url.replace("http://", "https://", 1) if url.startswith("http://") else None]:
        if not u: continue
        try:
            r, dt = fetch(u); break
        except requests.exceptions.SSLError as e:
            err = "ssl"
        except Exception as e:
            err = "down"
    if r is None:
        try:
            r, dt = requests.get(url, headers={"User-Agent": UA}, timeout=20, verify=False), 0
            c["https"] = False; c["befunde"].append("HTTPS-Zertifikat ungültig oder fehlt")
        except Exception:
            c.update({"webseite": False, "erreichbar": False, "https": False, "handy": None, "impressum": None, "ladezeit_ms": None})
            c["befunde"].append("Webseite nicht erreichbar (Domain antwortet nicht)")
            return c
    c["erreichbar"] = r.status_code < 400
    c["status"] = r.status_code
    c["final_url"] = r.url
    c["ladezeit_ms"] = int(dt * 1000) if dt else None
    if "https" not in c:
        c["https"] = r.url.startswith("https://")
        if not c["https"]: c["befunde"].append("Keine Verschlüsselung (kein HTTPS), Browser zeigen „Nicht sicher“")
    if r.status_code >= 400:
        c["befunde"].append("Seite liefert Fehler %d" % r.status_code)
    html = r.text or ""
    low = html.lower()
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(" ", strip=True)
    tl = text.lower()
    # handytauglich
    vp = soup.find("meta", attrs={"name": re.compile("viewport", re.I)})
    handy = bool(vp and "width" in (vp.get("content") or "").lower())
    if handy and ("@media" not in low and "responsive" not in low and "bootstrap" not in low and "wp-" not in low and len(html) > 2000):
        # viewport vorhanden, aber keinerlei Media-Query im Inline-Code: unklar, zählt als handytauglich
        pass
    c["handy"] = handy
    if not handy: c["befunde"].append("Nicht handytauglich (kein mobiles Layout)")
    # Impressum
    imp = bool(re.search(r"impressum", tl)) or bool(soup.find("a", href=re.compile("impressum", re.I)))
    c["impressum"] = imp
    if not imp: c["befunde"].append("Kein Impressum verlinkt (Pflicht nach § 5 ECG)")
    ds = bool(re.search(r"datenschutz", tl))
    c["datenschutz"] = ds
    if not ds: c["befunde"].append("Keine Datenschutzerklärung verlinkt")
    # Platzhalter / im Aufbau
    pm = re.search(r"coming soon|im aufbau|in kürze online|under construction|hier entsteht|existiert nicht mehr|bald geht'?s los|bald online|demnächst online", tl)
    if pm:
        c["platzhalter"] = True; c["platzhalter_text"] = tl[max(0, pm.start() - 40):pm.end() + 40].strip()
        c["befunde"].append("Seite ist nur ein Platzhalter („%s“)" % pm.group(0))
    # Alter / Technik
    jahre = [int(y) for y in re.findall(r"(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?((?:19|20)\d{2})", html, re.I)]
    jahr = max(jahre) if jahre else None
    c["jahr"] = jahr
    if jahr and jahr <= 2023: c["befunde"].append("Copyright-Jahr %d, Seite wirkt nicht gepflegt" % jahr)
    tech = []
    gen = soup.find("meta", attrs={"name": re.compile("generator", re.I)})
    if gen and gen.get("content"): tech.append(gen["content"][:40])
    for k, name in BAUKASTEN:
        if k in low or k in r.url.lower():
            tech.append(name); break
    m = re.search(r"jquery[-/.](\d+\.\d+)", low)
    if m: tech.append("jQuery " + m.group(1))
    if "<frameset" in low or "<frame " in low: tech.append("Frames (sehr alt)"); c["befunde"].append("Frames-Technik aus den 2000ern")
    if "<table" in low and "<div" not in low: tech.append("Tabellen-Layout"); c["befunde"].append("Tabellen-Layout, veraltete Technik")
    if re.search(r"\.swf\b", low): tech.append("Flash"); c["befunde"].append("Flash-Inhalte, laufen in keinem Browser mehr")
    c["technik"] = ", ".join(dict.fromkeys(tech))[:80]
    if c["ladezeit_ms"] and c["ladezeit_ms"] > 3000: c["befunde"].append("Lädt langsam (%.1f s)" % (c["ladezeit_ms"] / 1000))
    # Inhalte
    if not re.search(r"öffnungszeiten|geöffnet|montag|mo[-–]fr|mo\.|di\.|uhr", tl): c["befunde"].append("Keine Öffnungszeiten auf der Startseite")
    if not re.search(r"\+43|0\d{3,4}[ /]\d|tel\.?:|telefon", tl): c["befunde"].append("Keine Telefonnummer auf der Startseite")
    c["titel"] = (soup.title.get_text(strip=True) if soup.title else "")[:80]
    return c

def score(lead, c):
    """Chance 0–100 und bester Ansatzpunkt für den Brief."""
    pts = 0; ansatz = None
    online = lead.get("online", "")
    if not c.get("webseite"):
        if online == "nur Social Media": pts += 40; ansatz = "Nur Social Media, keine eigene Webseite"
        else: pts += 50; ansatz = "Keine Webseite"
    else:
        if c.get("platzhalter") or not c.get("erreichbar"):
            pts += 45; ansatz = "Webseite ist nur ein Platzhalter" if c.get("platzhalter") else "Webseite nicht erreichbar"
        if c.get("handy") is False: pts += 25; ansatz = ansatz or "Nicht handytauglich"
        if c.get("https") is False: pts += 15; ansatz = ansatz or "Nicht verschlüsselt (kein HTTPS)"
        if c.get("impressum") is False: pts += 10; ansatz = ansatz or "Kein Impressum"
        if c.get("jahr") and c["jahr"] <= 2023: pts += 10; ansatz = ansatz or "Webseite seit %d nicht gepflegt" % c["jahr"]
        if any(k in (c.get("technik") or "") for k in ("Frames", "Tabellen", "Flash")): pts += 10; ansatz = ansatz or "Veraltete Technik"
        if c.get("ladezeit_ms") and c["ladezeit_ms"] > 3000: pts += 8; ansatz = ansatz or "Lädt langsam"
        if any("Baukasten" in t or "Ausstellung" in t or t in ("Wix", "Jimdo", "Weebly", "Webnode") for t in (c.get("technik") or "").split(", ")):
            pts += 8; ansatz = ansatz or "Baukasten-Seite ohne eigenes Gesicht"
        if not ansatz: ansatz = "Webseite vorhanden, Feinschliff möglich"
    if c.get("google") is False: pts += 10
    if lead.get("neu"): pts += 10
    if (lead.get("score") or 0) >= 4: pts += 5
    return min(100, pts), ansatz

def main(src, out):
    os.makedirs(out, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(src, "*.json"))):
        d = json.load(open(f)); lead = d.get("data", d); lid = d.get("id") or os.path.basename(f)[:-5]
        url = (lead.get("website") or "").strip()
        if url and not re.match(r"https?://", url): url = "https://" + url
        social = bool(re.search(r"facebook|instagram|fb\.com|tiktok", url))
        if not url or social:
            c = {"webseite": False, "url": url, "erreichbar": None, "https": None, "handy": None, "impressum": None, "ladezeit_ms": None, "technik": "", "jahr": None,
                 "befunde": ["Nur Facebook/Instagram, keine eigene Webseite"] if social else ["Keine Webseite gefunden"]}
        else:
            try: c = check_site(url)
            except Exception as e: c = {"webseite": True, "url": url, "erreichbar": False, "befunde": ["Prüfung fehlgeschlagen: " + str(e)[:60]]}
        c["google"] = None  # Google-Unternehmensprofil: wird vom Such-Agent per Websuche ergänzt
        c["chance"], c["ansatz"] = score(lead, c)
        c["geprueft"] = TODAY
        c["quelle"] = "script"
        json.dump({"id": lid, "version": d.get("version"), "check": c}, open(os.path.join(out, lid + ".json"), "w"), ensure_ascii=False, indent=1)
        print("%3d  %-45s %s" % (c["chance"], lead.get("name", "")[:45], c["ansatz"]))

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
