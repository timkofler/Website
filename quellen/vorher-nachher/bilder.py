# Kleine, stark komprimierte Fotos für die "alten" Seiten in vorher.html.
# Quelle sind nur Fotos/Poster, die die jeweilige Beispielseite selbst zeigt (Lizenzen siehe /bildnachweis/).
# Aufruf im Repo-Wurzelordner: python3 quellen/vorher-nachher/bilder.py
from PIL import Image
import os

B = "webdesign/beispiele/"
M = B + "_shared/media/"
OUT = os.path.join(os.path.dirname(__file__), "img")
# Name: (Quelldatei, Mitte x, Mitte y, Zoom). Zoom 1 = größter 3:2-Ausschnitt.
BILDER = {
    "fl-fleisch": (M + "fleischerei-poster.webp", .5, .5, 1.3),
    "fl-wurst": (M + "fleischerei-brett-poster.webp", .5, .55, 1.2),
    "fl-theke": (M + "fleischerei-poster.webp", .78, .62, 2.2),
    "c-kaffee": (M + "cafe-kaffee-poster.webp", .5, .5, 1.2),
    "c-latte": (M + "cafe-latteart-poster.webp", .5, .5, 1.3),
    "c-kuchen": (B + "pension/bilder/kaffee-900.webp", .5, .5, 1),
    "p-ofen": (B + "pizzeria/bilder/ofen-800.webp", .5, .5, 1),
    "p-margherita": (B + "pizzeria/bilder/p-margherita.webp", .5, .5, 1),
    "p-diavola": (B + "pizzeria/bilder/p-diavola.webp", .5, .5, 1),
    "pe-tal": (M + "pension-poster.webp", .5, .5, 1),
    "pe-zimmer": (B + "pension/bilder/zirbe-640.webp", .5, .5, 1),
    "pe-fruehstueck": (B + "pension/bilder/fruehstueck-900.webp", .5, .5, 1),
    "pe-wandern": (B + "pension/bilder/wandern-900.webp", .5, .5, 1),
    "d-dach": (M + "dachdecker-poster.webp", .5, .5, 1),
    "d-eindecken": (B + "dachdecker/eindecken.webp", .5, .5, 1),
    "d-sanierung": (B + "dachdecker/sanierung.webp", .5, .5, 1),
    "d-flachdach": (B + "dachdecker/flachdach.webp", .5, .5, 1),
    "bo-fischgraet": (B + "bodenleger/fischgraet.webp", .5, .5, 1),
    "bo-verlegen": (B + "bodenleger/verlegen.webp", .5, .5, 1),
    "bo-wohnraum": (B + "bodenleger/wohnraum.webp", .5, .5, 1),
    "m-wand": (M + "maler-poster.webp", .25, .5, 1.3),
    "m-rolle": (M + "maler-rolle-poster.webp", .7, .45, 1.4),
    "m-farbe": (M + "maler-rolle-poster.webp", .3, .4, 1.8),
    "w-reifen": (M + "werkstatt-poster.webp", .5, .5, 1.2),
    "w-bremse": (M + "werkstatt-foto.webp", .5, .5, 1),
    "w-auto": (M + "werkstatt-car.webp", .5, .5, .92),
    "ma-massage": (M + "massage-hell-poster.webp", .5, .5, 1),
    "ma-haende": (M + "massage-hell-poster.webp", .3, .5, 2.4),
    "ma-ruecken": (M + "massage-hell-poster.webp", .8, .45, 2),
}

for name, (src, cx, cy, zoom) in BILDER.items():
    im = Image.open(src)
    if im.mode in ("RGBA", "LA", "P"):
        # Freigestelltes Auto: auf grauen "Studio"-Hintergrund wie früher üblich.
        im = im.convert("RGBA")
        bg = Image.new("RGBA", im.size, (214, 214, 214, 255))
        bg.alpha_composite(im)
        im = bg
    im = im.convert("RGB")
    w, h = im.size
    if zoom < 1:
        # Ganzes Motiv mit Rand zeigen (Zoom < 1 vergrößert die Leinwand).
        cw, ch = round(max(w, h * 1.5) / zoom), round(max(w, h * 1.5) / zoom / 1.5)
        bg = Image.new("RGB", (cw, ch), (214, 214, 214))
        bg.paste(im, ((cw - w) // 2, (ch - h) // 2))
        im, w, h, zoom = bg, cw, ch, 1
    cw = min(w, h * 1.5) / zoom
    ch = cw / 1.5
    x = min(max(cx * w - cw / 2, 0), w - cw)
    y = min(max(cy * h - ch / 2, 0), h - ch)
    im = im.crop((round(x), round(y), round(x + cw), round(y + ch))).resize((200, 133), Image.LANCZOS)
    im.save(os.path.join(OUT, name + ".jpg"), quality=48)
    print(name)
