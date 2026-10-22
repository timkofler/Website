# Link-Vorschaubilder (og:image)

Erzeugt die 1200×630-Bilder, die beim Teilen in WhatsApp, Facebook usw. erscheinen.
Die Startseite wird im Browser geladen, der Hero-Bereich umgestaltet und die echte 3D-Plakette abfotografiert.

    cd webdesign && python3 -m http.server 8765 &
    NODE_PATH=$(npm root -g) node quellen/vorschaubild/render.js quellen/vorschaubild/start.json /tmp/start-

Es entstehen 5 Bilder (Plakette in leicht verschiedener Drehung); das schönste als JPG (Qualität 86)
unter `webdesign/assets/img/` speichern. Bei jeder Änderung einen NEUEN Dateinamen verwenden (Caches).

- og-tk-3.jpg: Startseite und alle übrigen Seiten (start.json)
- og-entwurf.jpg, og-gruender.jpg, og-ablauf.jpg, og-sicherheit.jpg, og-verein.jpg: jeweilige Unterseite
