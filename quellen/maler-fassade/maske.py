# Erzeugt die Fassaden-Maske für /beispiele/maler/fassade/ aus dem CC0-Foto
# "Planegg Hörwarthstraße 3" (Rudolph Buch, Wikimedia Commons), 1920 px breit als haus-1920.jpg.
# Aufruf: python3 maske.py <ordner mit haus-1920.jpg>; danach auf 1600/1100 px verkleinern.
import numpy as np, sys
from PIL import Image, ImageDraw, ImageFilter
D=sys.argv[1]
im=Image.open(D+'/haus-1920.jpg').convert('RGB'); W,H=im.size
a=np.asarray(im).astype(np.float32)/255
reg=Image.new('L',(W,H),0); d=ImageDraw.Draw(reg); S=W/1280
P=lambda pts:[(x*S,y*S) for x,y in pts]
# Erdgeschoss-Fassade (unter dem Dachvorsprung)
d.polygon(P([(28,478),(1195,478),(1195,838),(28,838)]),fill=255)
# Gaube
d.polygon(P([(414,192),(930,192),(930,378),(414,378)]),fill=255)
# Fenster/Platte ausnehmen
for r in [(230,532,360,694),(402,536,440,694),(448,214,576,360),(606,214,734,360),(764,214,894,360),(158,530,192,694),(584,592,704,648),(960,530,1040,668),(1135,560,1160,620)]:
    d.rectangle([v*S for v in r],fill=0)
reg=np.asarray(reg).astype(np.float32)/255
mx=a.max(2); mn=a.min(2); L=a.mean(2); sat=(mx-mn)
# Putz: hell und unbunt
r,g,b=a[...,0],a[...,1],a[...,2]
warm=r-b; green=g-np.maximum(r,b)
m=np.clip((0.035-warm)/0.04,0,1)*np.clip((0.085-(g-b))/0.04,0,1)*np.clip((L-0.36)/0.12,0,1)
m2=np.clip((0.14-sat)/0.04,0,1)*np.clip((L-0.40)/0.1,0,1)*np.clip((0.085-warm)/0.04,0,1)
m=np.maximum(m,m2)*reg
mi=Image.fromarray((m*255).astype(np.uint8))
mi=mi.filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
mi.save(D+'/mask.png')
# Vorschau
o=a.copy(); mm=np.asarray(mi).astype(np.float32)[...,None]/255
t=np.array([0.80,0.55,0.38]); sh=np.clip(L/0.88,0,1.15)[...,None]
o=o*(1-mm)+np.clip(t*sh,0,1)*mm
Image.fromarray((o*255).astype(np.uint8)).save(D+'/test.jpg',quality=90)
