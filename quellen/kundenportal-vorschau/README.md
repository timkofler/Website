# Vorschaubild „Mein Kundenportal“ (Startseite, Abschnitt Web-Apps)

Ergebnis: `webdesign/assets/img/apps/kundenportal.webp` (720 × 450). Echte Screenshots des Portals am Handy
(390 × 844, doppelte Auflösung) mit dem erfundenen Beispielkunden „Anna Muster, Bäckerei Muster“, keine echten Kundendaten.
Zu sehen: Anmeldung (Glas-Karte), Startansicht mit Projektstand, QR-Code der Zwei-Faktor-Anmeldung und ein Upload-Hinweis.
Die drei hochgeladenen Dateien sind einfarbige Platzhalter.

Neu machen:

1. Portal lokal starten und Beispielkunden anlegen wie in `quellen/kundenportal-video/README.md` (Schritte 1–3, Port 8096).
2. Platzhalter `up/kornspitz.jpg`, `up/verkaufsraum.jpg`, `up/logo-baeckerei.png` im Arbeitsordner anlegen.
3. `node shots.js <arbeitsordner>` macht `login.png`, `dash2.png` und `qr.png`, die Anmeldeseite noch vor dem Einloggen.
4. `vorschau.html` mit den drei Bildern in einen Ordner `_comp/` der Kopie legen, `node render.js comp2x.png`.
5. Auf 720 × 450 verkleinern und als WebP (Qualität 84) speichern, danach `?v=` in `webdesign/index.html` erhöhen.
