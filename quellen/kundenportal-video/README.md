# Kundenportal-Video (tim-kofler.at/ablauf/, Abschnitt [04] Kundenportal)

Ergebnis: `webdesign/assets/video/kundenportal-demo.mp4` (stumm, ca. 39 s, 600 × 1298, 30 Bilder/s) und Standbild
`webdesign/assets/img/kundenportal-demo-poster.webp` (Bild bei 6,8 s). Eigene Aufnahme des echten Portals am Handy
(390 × 844, doppelte Auflösung) mit einem erfundenen Beispielkunden „Anna Muster, Bäckerei Muster“. Keine fremden Bilder:
Die drei hochgeladenen Dateien sind selbst erzeugte Platzhalter, im Video sind nur Name und Größe zu sehen.
Zu sehen ist außerdem Tims eigenes Porträt (Ansprechpartner-Karte und Nachrichten).

Neu aufnehmen (alles in einem Arbeitsordner außerhalb des Repos):

1. `webdesign/` in einen Arbeitsordner kopieren, dort `api/_data/config.php` mit
   `['secret' => '<40 Zeichen>', 'origins' => ['http://localhost:8096'], 'site' => 'http://localhost:8096']` anlegen.
   Damit die Uhrzeiten im Video tagsüber liegen, in der Kopie die Zeitzone in `api/kunden-lib.php` passend setzen.
2. `php -d upload_max_filesize=50M -d post_max_size=60M -S localhost:8096 -t <kopie>`
3. `php seed.php <kopie>` legt den Beispielkunden mit Projektstand „Feinschliff“ und vier Nachrichten an.
4. Platzhalter-Dateien `up/kornspitz.jpg`, `up/verkaufsraum.jpg`, `up/logo-baeckerei.png` anlegen (ca. 2,8 MB pro Foto).
5. `node rec.js` meldet sich an, schreibt einen Wunsch und lädt drei Dateien hoch. Aufgenommen wird per CDP-Screencast
   in Echtzeit (Bilder in `f/`, Zeiten in `list.txt`), Antippen zeigt ein weißer Kreis.
6. `ffmpeg -f concat -safe 0 -i list.txt -vf "fps=30,scale=600:-2:flags=lanczos" -an -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -movflags +faststart kundenportal-demo.mp4`
7. Standbild: `ffmpeg -ss 6.8 -i kundenportal-demo.mp4 -frames:v 1 -c:v libwebp -quality 82 kundenportal-demo-poster.webp`

Danach `?v=` an Video und Standbild in `webdesign/ablauf/index.html` erhöhen.
