# röstzeit – Produktbilder neu rendern

Die Bilder in `webdesign/beispiele/kaffeebar/bilder/` (Espresso, Melange, Matcha, Kaffeesack, Becher, Eiskaffee) sind Standbilder aus `produkte.js`, derselben 3D-Datei, die die Seite live nutzt.

1. `studio.html` nach `webdesign/beispiele/kaffeebar/_studio.html` kopieren.
2. In `webdesign/` einen Server starten: `python3 -m http.server 8765`.
3. Mit Playwright `http://localhost:8765/beispiele/kaffeebar/_studio.html?p=<cup|espresso|melange|iced|matcha|bag>&w=1500&h=1500&env=.18&key=4.5` öffnen (Parameter `ry` dreht, `tilt` hebt die Kamera), das Canvas mit transparentem Hintergrund speichern, Ränder abschneiden und als WebP sichern.
4. `_studio.html` danach wieder löschen.
