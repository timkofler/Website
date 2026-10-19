# Vorher/Nachher-Regler (/entwurf/)

Bilder für den Regler in `webdesign/assets/img/vorher-nachher/`.

- `vorher.html?b=tischlerei|gasthaus|baeckerei`: absichtlich veraltete Seite der erfundenen Beispielbetriebe (ohne viewport-Meta, damit sie am Handy wie früher verkleinert erscheint). Fotos in `img/` sind verkleinerte, stark komprimierte Kopien der Beispielseiten-Fotos.
- „Nachher“ sind die echten Beispielseiten unter `/beispiele/<branche>/` (ohne Hinweisleiste).

Neu erzeugen:

```
python3 -m http.server 8124            # im Repo-Wurzelordner
cd webdesign && python3 -m http.server 8123
NPM_G=$(npm root -g) node quellen/vorher-nachher/render.js /tmp/vn
```

Danach die PNGs als WebP speichern: PC 1600×1000, Handy 780×1688, Qualität 74.
Bei Änderungen an `vorher-nachher.js`/`.css` das `?v=` in `webdesign/entwurf/index.html` erhöhen.
