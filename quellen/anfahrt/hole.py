#!/usr/bin/env python3
"""Holt einmalig die Kartendaten für den Baustein „3D-Anfahrt“ (webdesign/assets/js/tk-anfahrt.js).

Ergebnis: ein kompaktes JSON mit Gebäude-Grundrissen (vereinfachte Polygone in Metern relativ zur Adresse,
mit Höhe) und Straßen/Wegen/Bächen als Linien. Alles aus OpenStreetMap (© OpenStreetMap-Mitwirkende, ODbL 1.0).
Die Datei liegt danach auf dem eigenen Webspace, der Browser fragt keinen fremden Dienst.

Aufruf aus dem Repo-Hauptordner (nur Python-Standardbibliothek):
  python3 quellen/anfahrt/hole.py "Lehen 2, 3281 Oberndorf an der Melk" webdesign/assets/data/anfahrt-tim.json
Optionen:
  --radius 450        Umkreis in Metern (Standard 450; am Land mit wenigen Häusern eher 550–650)
  --nur-osmapi        Overpass überspringen (wenn die Server hier ohnehin nicht antworten)
  --lat .. --lon ..   Koordinaten direkt angeben (spart das Geocoding, z. B. wenn Nominatim daneben liegt)
  --cache ordner      Rohdaten dort ablegen/wiederverwenden (für Feinschliff ohne neue Abfrage)

Ablauf: Geocoding über Nominatim (eigener User-Agent, eine Anfrage), dann Overpass (mehrere Server) und,
wenn die nicht antworten, die OSM-API /api/0.6/map in Kacheln. Zwischen Anfragen mindestens 1 s Pause.
"""
import argparse
import datetime
import hashlib
import json
import math
import os
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

UA = "tim-kofler.at-anfahrt/1.0 (+https://tim-kofler.at; office@tim-kofler.at)"
OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter",
            "https://overpass.private.coffee/api/interpreter"]
OSMAPI = "https://api.openstreetmap.org/api/0.6/map?bbox={:.6f},{:.6f},{:.6f},{:.6f}"

# Straßenklassen: 0 Hauptstraße, 1 Nebenstraße/Zufahrt, 2 Feld- und Fußweg, 3 Bach/Fluss
HW = {"motorway": 0, "trunk": 0, "primary": 0, "secondary": 0, "tertiary": 0, "motorway_link": 0, "trunk_link": 0,
      "primary_link": 0, "secondary_link": 0, "tertiary_link": 0, "unclassified": 1, "residential": 1, "living_street": 1,
      "service": 1, "road": 1, "track": 2, "footway": 2, "path": 2, "cycleway": 2, "pedestrian": 2, "steps": 2, "bridleway": 2}
# Geschätzte Höhen in Metern, wenn OSM weder height noch building:levels kennt
HOEHE = {"house": 7.5, "detached": 7.5, "semidetached_house": 7.5, "terrace": 8, "residential": 8, "farm": 8,
         "apartments": 12, "commercial": 9, "retail": 6, "office": 11, "industrial": 8, "warehouse": 7,
         "barn": 7, "farm_auxiliary": 6, "stable": 5.5, "cowshed": 5.5, "sty": 4.5, "greenhouse": 3.5,
         "garage": 3, "garages": 3, "carport": 2.6, "shed": 2.8, "hut": 2.8, "roof": 3.5, "church": 16,
         "chapel": 7, "school": 11, "public": 10, "hotel": 12, "civic": 10, "hangar": 8, "silo": 14}

_ctx = None


def ctx():
    global _ctx
    if _ctx is None:
        ca = os.environ.get("SSL_CERT_FILE") or os.environ.get("REQUESTS_CA_BUNDLE")
        _ctx = ssl.create_default_context(cafile=ca) if ca and os.path.exists(ca) else ssl.create_default_context()
    return _ctx


_last = [0.0]


def get(url, data=None, timeout=40):
    """Eine Anfrage, höchstens eine pro Sekunde."""
    w = 1.1 - (time.time() - _last[0])
    if w > 0:
        time.sleep(w)
    _last[0] = time.time()
    req = urllib.request.Request(url, data=data, headers={"User-Agent": UA, "Accept-Language": "de"})
    with urllib.request.urlopen(req, timeout=timeout, context=ctx()) as r:
        return r.read()


def geocode(q):
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode({"q": q, "format": "jsonv2", "limit": 1})
    for i in range(3):
        try:
            res = json.loads(get(url, timeout=30))
            if not res:
                sys.exit("Adresse nicht gefunden: " + q)
            return float(res[0]["lat"]), float(res[0]["lon"]), res[0].get("display_name", q)
        except (urllib.error.URLError, OSError) as e:
            print("  Nominatim:", e, "– neuer Versuch", file=sys.stderr)
            time.sleep(3 + i * 3)
    sys.exit("Nominatim antwortet nicht")


def bbox(lat, lon, r):
    dlat = r / 111320.0
    dlon = r / (111320.0 * math.cos(math.radians(lat)))
    return lon - dlon, lat - dlat, lon + dlon, lat + dlat


def via_overpass(lat, lon, r):
    q = ('[out:xml][timeout:40];(way["building"](around:{r},{a},{o});relation["building"](around:{r},{a},{o});'
         'way["building:part"](around:{r},{a},{o});way["highway"](around:{r},{a},{o});way["waterway"](around:{r},{a},{o});'
         'way["landuse"="forest"](around:{r},{a},{o});way["natural"~"^(wood|water)$"](around:{r},{a},{o});'
         'relation["landuse"="forest"](around:{r},{a},{o});relation["natural"~"^(wood|water)$"](around:{r},{a},{o}););'
         '(._;>;);out body qt;').format(r=int(r * 1.15), a=lat, o=lon)
    for srv in OVERPASS:
        for i in range(2):
            try:
                print("  Overpass:", srv, file=sys.stderr)
                return [get(srv, data=urllib.parse.urlencode({"data": q}).encode(), timeout=45)]
            except (urllib.error.URLError, OSError) as e:
                print("   ", e, file=sys.stderr)
                time.sleep(2 + i * 3)
    return None


def via_osmapi(box, depth=0):
    """OSM-API in Kacheln; ist eine Kachel zu voll (HTTP 400), wird sie geviertelt."""
    w, s, e, n = box
    for i in range(4):
        try:
            print("  OSM-API Kachel", "%.4f,%.4f,%.4f,%.4f" % box, file=sys.stderr)
            return [get(OSMAPI.format(w, s, e, n), timeout=60)]
        except urllib.error.HTTPError as err:
            if err.code == 400 and depth < 4:
                mx, my = (w + e) / 2, (s + n) / 2
                out = []
                for b in ((w, s, mx, my), (mx, s, e, my), (w, my, mx, n), (mx, my, e, n)):
                    out += via_osmapi(b, depth + 1)
                return out
            print("   ", err, file=sys.stderr)
            if err.code in (429, 509):  # „too much data“: die OSM-API will eine Pause
                time.sleep(25)
        except (urllib.error.URLError, OSError) as err:
            print("   ", err, file=sys.stderr)
        time.sleep(3 + i * 4)
    sys.exit("OSM-API antwortet nicht")


def parse(blobs):
    nodes, ways, rels = {}, {}, {}
    for b in blobs:
        root = ET.fromstring(b)
        for el in root:
            tags = {t.get("k"): t.get("v") for t in el.findall("tag")}
            if el.tag == "node":
                nodes[el.get("id")] = (float(el.get("lat")), float(el.get("lon")))
            elif el.tag == "way":
                ways[el.get("id")] = ([nd.get("ref") for nd in el.findall("nd")], tags)
            elif el.tag == "relation":
                rels[el.get("id")] = ([(m.get("type"), m.get("ref"), m.get("role")) for m in el.findall("member")], tags)
    return nodes, ways, rels


def num(v):
    if not v:
        return None
    v = v.replace(",", ".").strip().split(";")[0]
    try:
        return float(v.split()[0].rstrip("m"))
    except ValueError:
        return None


def height(tags, key, hof=False):
    h = num(tags.get("height"))
    if h is None:
        lv = num(tags.get("building:levels"))
        if lv is not None:
            h = lv * 3.0 + (num(tags.get("roof:levels")) or 0) * 2.2 + 1.2
    if h is None:
        # Vierkanthof (Gebäude mit Innenhof) und „yes“ am Land: meist Wohn- und Wirtschaftstrakt mit Satteldach
        h = 9.0 if hof else HOEHE.get(tags.get("building") or tags.get("building:part") or "", 7.0)
        # kleine, gleichbleibende Streuung, damit gleich geschätzte Häuser nicht wie Zinnsoldaten stehen
        h *= 0.9 + (int(hashlib.md5(key.encode()).hexdigest()[:4], 16) / 65535.0) * 0.22
    return max(2.2, min(h, 120.0))


SATTEL = {"house", "detached", "semidetached_house", "farm", "barn", "farm_auxiliary", "stable", "cowshed", "sty",
          "shed", "hut", "garage", "chapel", "church", "residential", "terrace", "yes"}


def dach(tags, rg):
    """1 = Satteldach (wird im Browser nur bei rechteckigen Grundrissen gezeichnet), 0 = flach."""
    sh = tags.get("roof:shape")
    if sh:
        return 0 if sh == "flat" else 1
    n = len(rg)
    area = abs(sum(rg[i][0] * rg[(i + 1) % n][1] - rg[(i + 1) % n][0] * rg[i][1] for i in range(n))) / 2
    return 1 if (tags.get("building") or "yes") in SATTEL and area < 900 else 0


def dp(pts, tol):
    """Douglas-Peucker auf einer offenen Linie."""
    if len(pts) < 3:
        return pts
    ax, ay = pts[0]
    bx, by = pts[-1]
    dx, dy = bx - ax, by - ay
    L = math.hypot(dx, dy) or 1e-9
    imax, dmax = 0, 0.0
    for i in range(1, len(pts) - 1):
        px, py = pts[i]
        d = abs(dy * px - dx * py + bx * ay - by * ax) / L if L > 1e-9 else math.hypot(px - ax, py - ay)
        if d > dmax:
            imax, dmax = i, d
    if dmax <= tol:
        return [pts[0], pts[-1]]
    return dp(pts[:imax + 1], tol)[:-1] + dp(pts[imax:], tol)


def ring(pts, tol=0.5):
    if len(pts) > 1 and pts[0] == pts[-1]:
        pts = pts[:-1]
    if len(pts) < 3:
        return None
    # geschlossen vereinfachen: am weitesten entfernten Punkt teilen
    far = max(range(len(pts)), key=lambda i: (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2)
    a = dp(pts[:far + 1], tol)
    b = dp(pts[far:] + [pts[0]], tol)
    out = a[:-1] + b[:-1]
    if len(out) < 3:
        return None
    area = sum(out[i][0] * out[(i + 1) % len(out)][1] - out[(i + 1) % len(out)][0] * out[i][1] for i in range(len(out))) / 2
    if abs(area) < 4:  # Kleinstes (Mülltonnenhäuschen u. ä.) weglassen
        return None
    if area < 0:  # gegen den Uhrzeigersinn (x Ost, y Nord)
        out.reverse()
    return out


def inside(rg, pt):
    """Punkt-in-Polygon (Strahlverfahren)."""
    px, py = pt
    c = False
    j = len(rg) - 1
    for i in range(len(rg)):
        xi, yi = rg[i]
        xj, yj = rg[j]
        if (yi > py) != (yj > py) and px < (xj - xi) * (py - yi) / (yj - yi) + xi:
            c = not c
        j = i
    return c


def chain(parts):
    """Verbindet Teil-Wege eines Multipolygons zu geschlossenen Ringen."""
    parts = [p[:] for p in parts if len(p) > 1]
    rings = []
    while parts:
        cur = parts.pop(0)
        changed = True
        while cur[0] != cur[-1] and changed:
            changed = False
            for i, p in enumerate(parts):
                if p[0] == cur[-1]:
                    cur += p[1:]
                elif p[-1] == cur[-1]:
                    cur += p[::-1][1:]
                elif p[-1] == cur[0]:
                    cur = p[:-1] + cur
                elif p[0] == cur[0]:
                    cur = p[::-1][:-1] + cur
                else:
                    continue
                parts.pop(i)
                changed = True
                break
        rings.append(cur)
    return rings


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("adresse")
    ap.add_argument("ziel", help="Ausgabedatei .json")
    ap.add_argument("--radius", type=float, default=450)
    ap.add_argument("--lat", type=float)
    ap.add_argument("--lon", type=float)
    ap.add_argument("--cache")
    ap.add_argument("--nur-osmapi", action="store_true")
    a = ap.parse_args()
    R = a.radius

    if a.lat is not None and a.lon is not None:
        lat, lon, name = a.lat, a.lon, a.adresse
    else:
        print("Geocoding …", file=sys.stderr)
        lat, lon, name = geocode(a.adresse)
    print("Ziel: %.6f, %.6f (%s)" % (lat, lon, name), file=sys.stderr)

    blobs = None
    cfile = os.path.join(a.cache, "roh-%.5f-%.5f-%d.xml" % (lat, lon, R)) if a.cache else None
    if cfile and os.path.exists(cfile):
        blobs = json.load(open(cfile, encoding="utf-8"))
        blobs = [b.encode("utf-8") for b in blobs]
        print("Rohdaten aus Cache", file=sys.stderr)
    if blobs is None:
        blobs = (None if a.nur_osmapi else via_overpass(lat, lon, R)) or via_osmapi(bbox(lat, lon, R * 1.15))
        if cfile:
            os.makedirs(a.cache, exist_ok=True)
            json.dump([b.decode("utf-8") for b in blobs], open(cfile, "w", encoding="utf-8"))

    nodes, ways, rels = parse(blobs)
    kx = 111320.0 * math.cos(math.radians(lat))
    ky = 110574.0

    def xy(ref):
        p = nodes.get(ref)
        return None if p is None else (round((p[1] - lon) * kx, 2), round((p[0] - lat) * ky, 2))

    def line(refs):
        pts = [xy(r) for r in refs]
        return [p for p in pts if p is not None]

    bauten = []  # (h, ring, key)
    used = set()
    for rid, (mem, tags) in rels.items():
        if "building" not in tags and "building:part" not in tags:
            continue
        outer = [line(ways[ref][0]) for t, ref, role in mem if t == "way" and role in ("outer", "") and ref in ways]
        inner = [line(ways[ref][0]) for t, ref, role in mem if t == "way" and role == "inner" and ref in ways]
        holes = [h[::-1] for h in (ring(rg, 0.4) for rg in chain(inner)) if h]  # Löcher im Uhrzeigersinn
        for k, rg in enumerate(chain(outer)):
            rr = ring(rg)
            if rr:
                mine = [h for h in holes if inside(rr, h[0])]
                bauten.append((height(tags, "r" + rid, len(mine) > 0), rr, dach(tags, rr), mine))
        for t, ref, role in mem:
            if t == "way":
                used.add(ref)
    for wid, (refs, tags) in ways.items():
        if wid in used or not ("building" in tags or "building:part" in tags) or tags.get("building") == "no":
            continue
        if tags.get("building:part") and not tags.get("building"):
            # Gebäudeteile nur, wenn sie eine eigene Höhe haben (sonst doppelt mit dem Umriss)
            if not tags.get("height") and not tags.get("building:levels"):
                continue
        rr = ring(line(refs))
        if rr:
            bauten.append((height(tags, "w" + wid), rr, dach(tags, rr), []))

    # nur im Umkreis (Schwerpunkt)
    def cen(rg):
        return sum(p[0] for p in rg) / len(rg), sum(p[1] for p in rg) / len(rg)

    bauten = [b for b in bauten if math.hypot(*cen(b[1])) <= R]
    # Zielgebäude: enthält den Punkt (0,0), sonst das nächstgelegene
    ziel = -1
    for i, b in enumerate(bauten):
        if inside(b[1], (0, 0)) and not any(inside(h, (0, 0)) for h in b[3]):
            ziel = i
            break
    if ziel < 0 and bauten:
        ziel = min(range(len(bauten)), key=lambda i: math.hypot(*cen(bauten[i][1])))
        if math.hypot(*cen(bauten[ziel][1])) > 40:
            ziel = -1
    # sortiert nach Entfernung, damit die Anfahrt von innen nach außen wachsen kann
    order = sorted(range(len(bauten)), key=lambda i: math.hypot(*cen(bauten[i][1])))
    ziel = order.index(ziel) if ziel >= 0 else -1
    bauten = [bauten[i] for i in order]

    wege = []
    lim = R * 1.12
    for wid, (refs, tags) in ways.items():
        k = None
        if tags.get("highway") in HW and tags.get("area") != "yes":
            k = HW[tags["highway"]]
        elif tags.get("waterway") in ("river", "stream", "canal", "ditch", "drain"):
            k = 3
        if k is None:
            continue
        seg = []
        for p in line(refs):
            if math.hypot(*p) <= lim:
                seg.append(p)
            else:
                if len(seg) > 1:
                    wege.append((k, seg))
                seg = []
        if len(seg) > 1:
            wege.append((k, seg))
    wege = [(k, dp(s, 0.8)) for k, s in wege]

    # Flächen als leiser Hintergrund: 0 Wald, 1 Wasser (nur Teile nahe am Umkreis, grob vereinfacht)
    def fl(tags):
        if tags.get("landuse") == "forest" or tags.get("natural") == "wood":
            return 0
        if tags.get("natural") == "water" or tags.get("landuse") == "reservoir":
            return 1
        return None

    flaechen = []
    for rid, (mem, tags) in rels.items():
        k = fl(tags)
        if k is None:
            continue
        outer = [line(ways[ref][0]) for t, ref, role in mem if t == "way" and role in ("outer", "") and ref in ways]
        for rg in chain(outer):
            flaechen.append((k, rg))
    for wid, (refs, tags) in ways.items():
        k = fl(tags)
        if k is not None:
            flaechen.append((k, line(refs)))
    fout = []
    for k, rg in flaechen:
        rr = ring(rg, 2.0)
        if rr and min(math.hypot(*p) for p in rr) <= R * 1.1:
            fout.append((k, rr))

    def flat(pts):
        o = []
        for x, y in pts:
            o += [int(round(x * 10)), int(round(y * 10))]
        return o

    out = {
        "v": 1,
        "hinweis": "Koordinaten in Dezimetern relativ zur Adresse, x nach Osten, y nach Norden. b: [Höhe dm, Dach 0 flach/1 Sattel, [x,y, …] Umriss, [x,y, …] Innenhof …], s: [Klasse, x,y, …] mit 0 Hauptstraße, 1 Nebenstraße, 2 Weg, 3 Bach; f: [Art, x,y, …] mit 0 Wald, 1 Wasser",
        "quelle": "© OpenStreetMap-Mitwirkende, ODbL 1.0",
        "stand": datetime.date.today().isoformat(),
        "adresse": a.adresse,
        "lat": round(lat, 6), "lon": round(lon, 6), "r": int(R),
        "ziel": ziel,
        "b": [[int(round(h * 10)), d, flat(rg)] + [flat(x) for x in ho] for h, rg, d, ho in bauten],
        "s": [[k] + flat(s) for k, s in wege],
        "f": [[k] + flat(rg) for k, rg in fout],
    }
    os.makedirs(os.path.dirname(os.path.abspath(a.ziel)), exist_ok=True)
    with open(a.ziel, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print("Fertig: %d Gebäude, %d Linien, %d Flächen, Ziel-Gebäude %d, %d kB -> %s" % (
        len(out["b"]), len(out["s"]), len(out["f"]), ziel, os.path.getsize(a.ziel) // 1024, a.ziel), file=sys.stderr)


if __name__ == "__main__":
    main()
