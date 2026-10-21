# Vorher/Nachher-Regler (/entwurf/)

Bilder für den Regler in `webdesign/assets/img/vorher-nachher/`.

- `vorher.html?b=<branche>`: absichtlich veraltete Seite der erfundenen Beispielbetriebe (13 Branchen, Liste oben in der Datei; ohne viewport-Meta, damit sie am Handy wie früher verkleinert erscheint). Fotos in `img/` sind verkleinerte, stark komprimierte Ausschnitte aus Fotos/Postern der Beispielseiten (`bilder.py`, nur Bilder aus dem Bildnachweis).
- Neue Branche: Daten in `vorher.html` (Objekt `D`, `lay:'r'` Spalte rechts, `lay:'c'` Menü-Knöpfe), Farben als `body.<branche>`, Reiter in `entwurf/index.html`, Texte in `vorher-nachher.js` (Objekt `B`).
- „Nachher“ sind die echten Beispielseiten unter `/beispiele/<branche>/` (ohne Hinweisleiste).

Neu erzeugen:

```
python3 -m http.server 8124            # im Repo-Wurzelordner
cd webdesign && python3 -m http.server 8123
python3 quellen/vorher-nachher/bilder.py          # nur bei neuen Fotos
NPM_G=$(npm root -g) node quellen/vorher-nachher/render.js /tmp/vn [branche,branche]
python3 quellen/vorher-nachher/webp.py /tmp/vn [branche,branche]   # PC 1600×1000, Handy 780×1688, Qualität 74
```

Ändert sich ein bestehendes Bild, das `?v=` in `vorher-nachher.js` (DIR-Bilder) und `entwurf/index.html` erhöhen.
Bei Änderungen an `vorher-nachher.js`/`.css` das `?v=` in `webdesign/entwurf/index.html` erhöhen.
