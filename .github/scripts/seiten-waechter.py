#!/usr/bin/env python3
"""Seiten-Wächter: prüft die Webseiten und meldet Ausfälle per Telegram (siehe .github/workflows/seiten-waechter.yml)."""

import json
import os
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
    daten = urllib.parse.urlencode({"chat_id": chat, "text": text, "disable_web_page_preview": "true"}).encode()
    try:
        urllib.request.urlopen(f"https://api.telegram.org/bot{token}/sendMessage", daten, timeout=20).read()
        print("Gesendet:", text)
    except Exception as e:
        print("Senden fehlgeschlagen:", type(e).__name__)


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
        senden("🛡️ Seiten-Wächter: Test. Ab jetzt meldet sich der Wächter, wenn eine Seite nicht erreichbar ist.")

    for name, url, muss in SEITEN:
        grund = pruefen(url, muss)
        weg = stand.get(name)
        if grund and not weg:
            stand[name] = time.time()
            senden(f"🔴 {name} ist nicht erreichbar ({grund}).\n{url}")
        elif not grund and weg:
            del stand[name]
            senden(f"🟢 {name} geht wieder (war ca. {minuten(weg)} weg).")
        print(name, "OK" if not grund else f"AUSGEFALLEN: {grund}")

    os.makedirs(os.path.dirname(STAND), exist_ok=True)
    with open(STAND, "w", encoding="utf-8") as f:
        json.dump(stand, f)


if __name__ == "__main__":
    main()
