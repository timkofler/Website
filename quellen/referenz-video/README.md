# Referenz-Video crypto-x.at (tim-kofler.at, Abschnitt [07] Referenz)

Ergebnis: `webdesign/assets/video/ref-crypto-x.mp4` (stumm, ca. 23 s, 60 Bilder/s, ohne Schnitt) und Standbild
`webdesign/assets/img/ref-crypto-x-poster.webp` (erstes Bild). Die Seite läuft ruhig von oben bis zum großen 3D-X
im Schlussband und bleibt dort stehen; sobald das Video wieder ins Bild kommt, startet es von vorne (kein loop).

Neu aufnehmen:

1. Im Repo-Wurzelordner crypto-x.at lokal ausliefern: `npx http-server . -p 8091 -s`
2. In einem leeren Arbeitsordner: `node quellen/referenz-video/rec.js 0 -1` nennt die Bildanzahl, dann die Teile
   parallel aufnehmen, z. B. `0 380`, `380 760`, `760 1060`, `1060 1364`. Bilder landen in `g/`.
   Das Skript stellt requestAnimationFrame, performance.now, setTimeout/setInterval und alle CSS-Übergänge auf eine
   eigene Uhr, darum passen die Teile nahtlos aneinander. Prüfen: zwischen zwei Bildern darf sich die Seite immer
   nur um gleich viele Pixel verschieben.
3. `ffmpeg -framerate 60 -i g/%05d.jpg -an -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p -g 120 -movflags +faststart ref-crypto-x.mp4`

Standbild: `g/00000.jpg` als WebP (Qualität 82).
