# Link-Vorschaubilder (og:image)

Erzeugt die 1200×630-Bilder, die beim Teilen in WhatsApp, Facebook usw. erscheinen.
Die Startseite wird im Browser geladen, der Hero-Bereich umgestaltet und die echte 3D-Plakette abfotografiert.

    cd webdesign && python3 -m http.server 8765 &
    NODE_PATH=$(npm root -g) node quellen/vorschaubild/render.js quellen/vorschaubild/start.json /tmp/start-

Es entstehen 5 Bilder (Plakette in leicht verschiedener Drehung); das schönste als JPG (Qualität 86)
unter `webdesign/assets/img/` speichern. Bei jeder Änderung einen NEUEN Dateinamen verwenden (Caches).

- og-tk-4.jpg: Startseite und alle übrigen Seiten (start.json)
- og-entwurf-2.jpg, og-gruender-2.jpg, og-ablauf-2.jpg, og-sicherheit-2.jpg, og-verein-3.jpg, og-erneuern.jpg (erneuern.json), og-vereins-app.jpg (verein-app.json), og-check.jpg (check.json), og-web-apps.jpg (web-apps.json): jeweilige Unterseite
- Seit der Black Edition (27.10.2026) stellt render.js den zentrierten Black-Hero für das Bild wieder auf Text links, Plakette rechts um.
