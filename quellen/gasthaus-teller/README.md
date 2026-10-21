# Hollerhof – Teller-Animation neu rendern

Die Bilder in `webdesign/beispiele/gasthaus/teller/` (Teller, Serviette mit Gabel, Messer, Saft, drei Bratenscheiben, zwei Knödelscheiben) sind selbst gezeichnet: `studio.html` baut sie als SVG mit Filtern (Kruste, Fasern, Glanz) – keine fremden Fotos.

1. `studio.html` nach `webdesign/_studio.html` kopieren.
2. In `webdesign/` einen Server starten: `python3 -m http.server 8811`.
3. `http://127.0.0.1:8811/_studio.html?p=alle&s=1.6` zeigt den fertigen Teller zur Kontrolle.
4. Einzelteile mit Playwright als PNG mit transparentem Hintergrund speichern (Element `svg`, `omitBackground`), Maßstab `s`: teller/serviette/messer/saft 2.4, braten1–3 und knoedel1–2 3. Dann als WebP (Qualität 84) nach `teller/` sichern.
5. `_studio.html` danach wieder löschen. Bei geänderter `app.js` das `?v=` im Script-Tag erhöhen.
