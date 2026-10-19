# Birnstoff – Dosenbilder neu rendern

Die Bilder in `webdesign/beispiele/cider/bilder/` (Pur, Holler, Herb, Null) sind Standbilder aus `dose.js`, derselben 3D-Datei, die die Seite live nutzt.

1. `studio.html` nach `webdesign/beispiele/cider/_studio.html` kopieren.
2. In `webdesign/` einen Server starten: `python3 -m http.server 8765`.
3. Mit Playwright `http://localhost:8765/beispiele/cider/_studio.html?p=<pur|holler|herb|null|reserve>&w=520&h=1080` öffnen (Parameter `ry` dreht, `rz` kippt), warten bis der Seitentitel "fertig" ist, das Canvas mit transparentem Hintergrund speichern, Ränder abschneiden und als WebP (Qualität 82) sichern.
4. `_studio.html` danach wieder löschen.

Für Chromium ohne Grafikkarte: `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`.
