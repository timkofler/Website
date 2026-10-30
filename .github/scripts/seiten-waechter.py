#!/usr/bin/env python3
"""Seiten-Wächter: prüft die Webseiten und meldet Ausfälle per Telegram (siehe .github/workflows/seiten-waechter.yml).

Einmal am Tag prüft er außerdem SSL-Zertifikate und, wo die Domain-Verwaltung es verrät, das Ablaufdatum der Domain.
Bei jedem Lauf stößt er auf tim-kofler.at die geplanten Telegram-Nachrichten an (Morgen-Nachricht, Tagesbericht).
"""

import datetime
import html
import json
import os
import socket
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request

# Name, Adresse, Text, der im Inhalt vorkommen muss
SEITEN = [
    ("tim-kofler.at", "https://tim-kofler.at/", "</html>"),
    ("tim-kofler.at Admin", "https://tim-kofler.at/kunden/admin/", "</html>"),
    ("crypto-x.at", "https://crypto-x.at/", "</html>"),
]
# Kundenseiten (Kunden-Wächter): sobald eine Kundenseite live ist, hier eine Zeile dazu, z. B.
#   ("Kunde: Musterfirma", "https://musterfirma.at/", "</html>"),
KUNDEN = [
]
ZEITPLAN = "https://tim-kofler.at/api/zeitplan.php"
SSL_WARNEN = 14  # Let's Encrypt erneuert 30 Tage vorher; unter 14 Tagen hat das Erneuern nicht geklappt
DOMAIN_WARNEN = [30, 14, 7, 3, 1, 0]
VERSUCHE = 3  # erst nach 3 Fehlversuchen (ca. 1 Minute) gilt eine Seite als ausgefallen
PAUSE = 25
STAND = ".waechter/stand.json"


def pruefen(url: str, muss: str) -> str:
    """Leerer Text = in Ordnung, sonst kurzer Fehlergrund."""
    grund = ""
    for i in range(VERSUCHE):
        if i:
            time.sleep(PAUSE)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "TK-Seiten-Waechter/1.0"})
            with urllib.request.urlopen(req, timeout=20) as r:
                inhalt = r.read(2_000_000).decode("utf-8", "replace")
            if muss in inhalt:
                return ""
            grund = "Seite leer oder unvollständig"
        except urllib.error.HTTPError as e:
            grund = f"Fehler {e.code}"
        except Exception as e:  # Zeitüberschreitung, DNS, Verbindung
            grund = type(e).__name__ if not str(e) else str(e)[:120]
    return grund


def senden(text: str) -> None:
    token, chat = os.environ.get("TELEGRAM_TOKEN", ""), os.environ.get("TELEGRAM_CHAT", "")
    if not token or not chat:
        print("Telegram nicht eingerichtet, nicht gesendet:", text)
        return
    daten = urllib.parse.urlencode({"chat_id": chat, "text": text, "parse_mode": "HTML", "disable_web_page_preview": "true"}).encode()
    try:
        urllib.request.urlopen(f"https://api.telegram.org/bot{token}/sendMessage", daten, timeout=20).read()
        print("Gesendet:", text)
    except Exception as e:
        print("Senden fehlgeschlagen:", type(e).__name__)


def ssl_tage(host: str) -> int:
    """Tage bis zum Ablauf des SSL-Zertifikats."""
    ctx = ssl.create_default_context()
    with socket.create_connection((host, 443), timeout=20) as sock:
        with ctx.wrap_socket(sock, server_hostname=host) as s:
            ende = ssl.cert_time_to_seconds(s.getpeercert()["notAfter"])
    return int((ende - time.time()) // 86400)


def domain_ablauf(host: str) -> str:
    """Ablaufdatum der Domain (JJJJ-MM-TT) laut RDAP, leer wenn die Registry es nicht veröffentlicht (z. B. .at)."""
    domain = ".".join(host.split(".")[-2:])
    try:
        req = urllib.request.Request(f"https://rdap.org/domain/{domain}", headers={"User-Agent": "TK-Seiten-Waechter/1.0"})
        with urllib.request.urlopen(req, timeout=20) as r:
            daten = json.load(r)
    except Exception:
        return ""
    for ev in daten.get("events", []):
        if ev.get("eventAction") == "expiration":
            return str(ev.get("eventDate", ""))[:10]
    return ""


def ablauf_pruefen(seiten: list) -> None:
    hosts = sorted({urllib.parse.urlsplit(url).hostname for _, url, _ in seiten})
    heute = datetime.date.today()
    for host in hosts:
        try:
            tage = ssl_tage(host)
            print(host, "SSL noch", tage, "Tage")
            if tage < SSL_WARNEN:
                senden(f"🔒 <b>SSL-Zertifikat läuft ab</b>\n{host}: noch {tage} Tage, wurde nicht erneuert.\n<i>Bitte im KAS unter SSL prüfen.</i>")
        except Exception as e:  # nicht erreichbar: meldet schon die Ausfall-Prüfung
            print(host, "SSL nicht prüfbar:", type(e).__name__)
        ablauf = domain_ablauf(host)
        if ablauf:
            tage = (datetime.date.fromisoformat(ablauf) - heute).days
            print(host, "Domain bis", ablauf)
            if tage in DOMAIN_WARNEN:
                senden(f"🌐 <b>Domain läuft ab</b>\n{host}: {'heute' if tage == 0 else f'in {tage} Tagen'} ({ablauf})\n<i>Verlängerung prüfen.</i>")


def zeitplan_anstossen() -> None:
    try:
        urllib.request.urlopen(urllib.request.Request(ZEITPLAN, headers={"User-Agent": "TK-Seiten-Waechter/1.0"}), timeout=20).read()
    except Exception as e:
        print("Zeitplan nicht erreichbar:", type(e).__name__)


def minuten(seit: float) -> str:
    m = max(1, round((time.time() - seit) / 60))
    return f"{m} Min." if m < 90 else f"{m / 60:.1f} Std.".replace(".", ",", 1)


def main() -> None:
    try:
        with open(STAND, encoding="utf-8") as f:
            stand = json.load(f)
    except (OSError, ValueError):
        stand = {}

    if os.environ.get("TEST") == "true":
        senden("🛡️ <b>Seiten-Wächter: Test</b>\nAb jetzt meldet sich der Wächter, wenn eine Seite nicht erreichbar ist.")

    zeitplan_anstossen()

    for name, url, muss in SEITEN + KUNDEN:
        grund = pruefen(url, muss)
        weg = stand.get(name)
        if grund and not weg:
            stand[name] = time.time()
            senden(f"🔴 <b>{html.escape(name)} ist nicht erreichbar</b>\n{html.escape(grund)}\n{url}")
        elif not grund and weg:
            del stand[name]
            senden(f"🟢 <b>{html.escape(name)} geht wieder</b>\nwar ca. {minuten(weg)} weg")
        print(name, "OK" if not grund else f"AUSGEFALLEN: {grund}")

    # Zertifikate und Domains einmal am Tag (ab 8 Uhr UTC), Merker unter einem Schlüssel, der kein Seitenname ist
    heute = time.strftime("%Y-%m-%d", time.gmtime())
    if (stand.get("_ablauf_tag") != heute and time.gmtime().tm_hour >= 8) or os.environ.get("TEST") == "true":
        stand["_ablauf_tag"] = heute
        ablauf_pruefen(SEITEN + KUNDEN)

    os.makedirs(os.path.dirname(STAND), exist_ok=True)
    with open(STAND, "w", encoding="utf-8") as f:
        json.dump(stand, f)


if __name__ == "__main__":
    main()
