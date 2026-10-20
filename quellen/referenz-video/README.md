# Referenz-Video crypto-x.at (tim-kofler.at, Abschnitt [07] Referenz)

Ergebnis: `webdesign/assets/video/ref-crypto-x.mp4` (stumm, Schleife, ca. 10 s) und Standbild `webdesign/assets/img/ref-crypto-x-poster.webp`.

Neu aufnehmen:

1. Im Repo-Wurzelordner crypto-x.at lokal ausliefern: `npx http-server . -p 8091 -s`
2. `node quellen/referenz-video/rec.js 1` (Hero) und `node quellen/referenz-video/rec.js 2` (Schlussband mit 3D-X), aus einem leeren Arbeitsordner heraus. Die Bilder landen in `f1/` und `f2/`.
   Das Skript ersetzt requestAnimationFrame/performance.now durch eine eigene Uhr, damit jede Aufnahme ruckelfrei Bild für Bild entsteht (WebGL über SwiftShader).
3. Zusammenschneiden (Überblendung Hero → Münze → zurück zum Anfang):

```
ffmpeg -framerate 30 -i f1/%04d.jpg -framerate 30 -i f2/%04d.jpg -loop 1 -t 1 -framerate 30 -i f1/0000.jpg \
  -filter_complex "[0:v]format=yuv420p,settb=AVTB,fps=30[a];[1:v]format=yuv420p,settb=AVTB,fps=30[b];[2:v]format=yuv420p,settb=AVTB,fps=30[c];[a][b]xfade=transition=fade:duration=0.5:offset=3.1[ab];[ab][c]xfade=transition=fade:duration=0.5:offset=8.6,format=yuv420p[v]" \
  -map "[v]" -an -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart ref-crypto-x.mp4
```

Standbild: Bild `f2/0150.jpg` als WebP (Qualität 82).
