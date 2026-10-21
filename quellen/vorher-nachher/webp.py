# Wandelt die PNGs von render.js in WebP für webdesign/assets/img/vorher-nachher/ um.
# Aufruf im Repo-Wurzelordner: python3 quellen/vorher-nachher/webp.py <Ordner mit PNGs> [branche,branche,...]
import glob, os, sys
from PIL import Image

src = sys.argv[1]
nur = sys.argv[2].split(",") if len(sys.argv) > 2 else None
ziel = "webdesign/assets/img/vorher-nachher/"
for f in sorted(glob.glob(os.path.join(src, "*-*-*.png"))):
    name = os.path.basename(f)[:-4]
    if nur and name.split("-")[0] not in nur:
        continue
    gr = (1600, 1000) if name.endswith("-pc") else (780, 1688)
    Image.open(f).convert("RGB").resize(gr, Image.LANCZOS).save(ziel + name + ".webp", quality=74, method=6)
    print(name)
