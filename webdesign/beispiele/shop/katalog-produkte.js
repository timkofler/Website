// 3D-Produkte für den Blätterkatalog im Birnkammer-Shop: Bügelflasche, Frizzante, Saftflasche, Edelbrand,
// Honigglas, Aufstrich mit Karotuch und das Geschenkkistl. Alles aus Drehkörpern, Grundformen und Canvas-Etiketten,
// keine Modelldateien und keine Bilder zum Nachladen. build(THREE, id) liefert { group, h, w, tick }.
import { woodTexture, blobTexture, rng } from "/beispiele/_shared/stage3d.js?v=2";

var SERIF = '"Fraunces", Georgia, serif', SANS = '"Outfit", system-ui, sans-serif';

function canvas(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; }
function tex(THREE, c) { var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function V2(THREE, pts) { return pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }); }
function lathe(THREE, pts, seg, ps, pl) { return new THREE.LatheGeometry(V2(THREE, pts), seg || 72, ps || 0, pl == null ? Math.PI * 2 : pl); }

// Birne als kleines Zeichen auf Etiketten (Mittelpunkt x, y, Höhe s)
export function pear(g, x, y, s) {
  g.save(); g.translate(x, y); g.beginPath();
  g.moveTo(0, -.4 * s);
  g.bezierCurveTo(.15 * s, -.4 * s, .16 * s, -.18 * s, .2 * s, -.06 * s);
  g.bezierCurveTo(.42 * s, .1 * s, .44 * s, .5 * s, 0, .5 * s);
  g.bezierCurveTo(-.44 * s, .5 * s, -.42 * s, .1 * s, -.2 * s, -.06 * s);
  g.bezierCurveTo(-.16 * s, -.18 * s, -.15 * s, -.4 * s, 0, -.4 * s);
  g.closePath(); g.fill();
  g.lineWidth = s * .05; g.lineCap = "round"; g.strokeStyle = g.fillStyle;
  g.beginPath(); g.moveTo(0, -.39 * s); g.quadraticCurveTo(.02 * s, -.5 * s, .08 * s, -.56 * s); g.stroke();
  g.beginPath(); g.ellipse(.2 * s, -.54 * s, .13 * s, .05 * s, -.4, 0, Math.PI * 2); g.fill();
  g.restore();
}

function spaced(g, t, x, y, font, color, sp, align) {
  g.save(); g.font = font; g.fillStyle = color; g.textAlign = align || "center"; g.textBaseline = "middle";
  if ("letterSpacing" in g) g.letterSpacing = sp + "px";
  g.fillText(t, x, y); g.restore();
}

// Etikett: o = { bg, ink, t, sub, band, oval }; W×H passend zur Fläche auf dem Glas.
function labelTex(THREE, o, W, H) {
  var a = canvas(W, H), c = a[0], g = a[1], cx = W / 2;
  g.save();
  if (o.oval) { g.beginPath(); g.ellipse(cx, H / 2, W / 2 - 2, H / 2 - 2, 0, 0, Math.PI * 2); g.clip(); }
  g.fillStyle = o.bg; g.fillRect(0, 0, W, H);
  // Papierkorn
  var r = rng(W + H), k;
  g.globalAlpha = .06; for (k = 0; k < W * H / 60; k++) { g.fillStyle = r() < .5 ? "#000" : "#fff"; g.fillRect(r() * W, r() * H, 1.3, 1.3); }
  g.globalAlpha = 1;
  if (o.band) { g.fillStyle = o.band; g.fillRect(0, H * .82, W, H * .1); }
  g.strokeStyle = o.ink; g.globalAlpha = .45; g.lineWidth = Math.max(2, H * .012);
  if (o.oval) { g.beginPath(); g.ellipse(cx, H / 2, W / 2 - H * .06, H / 2 - H * .06, 0, 0, Math.PI * 2); g.stroke(); }
  else g.strokeRect(W * .2, H * .07, W * .6, H * .86);
  g.globalAlpha = 1;
  g.fillStyle = o.ink; pear(g, cx, H * .25, H * .17);
  spaced(g, "BIRNKAMMER", cx, H * .42, "600 " + Math.round(H * .055) + "px " + SANS, o.ink, H * .02);
  var fs = H * .17; g.font = "600 " + fs + "px " + SERIF;
  var max = W * (o.oval ? .5 : .52), tw = g.measureText(o.t).width; if (tw > max) fs *= max / tw;
  spaced(g, o.t, cx, H * .58, "600 " + fs.toFixed(1) + "px " + SERIF, o.ink, 0);
  spaced(g, o.sub, cx, H * .73, "600 " + Math.round(H * .05) + "px " + SANS, o.ink, H * .018);
  g.restore();
  var t = tex(THREE, c); return t;
}

function karo(THREE) {
  var a = canvas(256, 256), c = a[0], g = a[1], n = 16, s = 256 / n;
  g.fillStyle = "#f6efe2"; g.fillRect(0, 0, 256, 256);
  g.fillStyle = "rgba(199,53,79,.62)";
  for (var i = 0; i < n; i += 2) { g.fillRect(i * s, 0, s, 256); g.fillRect(0, i * s, 256, s); }
  var t = tex(THREE, c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t;
}

function wool(THREE) {
  var a = canvas(512, 512), c = a[0], g = a[1], r = rng(41);
  g.fillStyle = "#d9b273"; g.fillRect(0, 0, 512, 512);
  var cols = ["#f0d39a", "#c99a55", "#e8c48c", "#b98a48", "#f6e2b4"];
  for (var i = 0; i < 900; i++) {
    g.strokeStyle = cols[i % cols.length]; g.globalAlpha = .55 + r() * .4; g.lineWidth = 1 + r() * 2.2;
    var x = r() * 512, y = r() * 512, a1 = r() * 6.3, l = 30 + r() * 90;
    g.beginPath(); g.moveTo(x, y);
    g.bezierCurveTo(x + Math.cos(a1) * l * .3 + (r() - .5) * 30, y + Math.sin(a1) * l * .3 + (r() - .5) * 30, x + Math.cos(a1) * l * .7 + (r() - .5) * 30, y + Math.sin(a1) * l * .7 + (r() - .5) * 30, x + Math.cos(a1) * l, y + Math.sin(a1) * l);
    g.stroke();
  }
  g.globalAlpha = 1;
  var t = tex(THREE, c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

// Kontur einer Flasche als Punktliste [Radius, Höhe] von unten nach oben
function bez(out, p0, p1, p2, p3, n) {
  for (var i = 1; i <= n; i++) {
    var t = i / n, u = 1 - t;
    out.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]);
  }
}
function profile(o) {
  var r = o.r, pts = [[0, .012], [r * .7, .004], [r - .025, .006], [r - .006, .02], [r, .045]];
  pts.push([r, o.h]);
  bez(pts, [r, o.h], [r, o.h + (o.sh - o.h) * (o.k1 || .5)], [o.nr, o.sh - (o.sh - o.h) * (o.k2 || .4)], [o.nr, o.sh], 18);
  if (o.bulge) { pts.push([o.nr, o.top - .1]); pts.push([o.nr + .018, o.top - .085]); pts.push([o.nr + .02, o.top - .05]); pts.push([o.nr + .012, o.top - .02]); }
  else { pts.push([o.nr, o.top - (o.lip ? .035 : 0)]); if (o.lip) { pts.push([o.nr + o.lip, o.top - .03]); pts.push([o.nr + o.lip, o.top - .006]); } }
  pts.push([o.nr - .004, o.top]); pts.push([o.nr - .025, o.top - .02]);
  return pts;
}
function rAt(pts, y) {
  for (var i = 1; i < pts.length; i++) if (pts[i][1] >= y && pts[i - 1][1] <= y) {
    var a = pts[i - 1], b = pts[i], t = (y - a[1]) / ((b[1] - a[1]) || 1); return a[0] + (b[0] - a[0]) * t;
  }
  return pts[pts.length - 1][0];
}
function liquidProfile(pts, level, k) {
  var out = [[0, .03]], y;
  for (y = .03; y < level; y += .02) out.push([Math.max(.01, rAt(pts, y) * (k || .93) - .006), y]);
  out.push([Math.max(.01, rAt(pts, level) * (k || .93) - .006), level]); out.push([0, level]);
  return out;
}

// Glas in der Produkt-Textur: keine eigene Farbe, nur Spiegelungen, die auf den Inhalt addiert werden.
// Die Deckkraft geht getrennt in den Alphakanal, damit leeres Glas (Flaschenhals) auf dem Papier leicht sichtbar bleibt.
function glassMat(THREE, tint, op) {
  return new THREE.MeshPhysicalMaterial({ color: "#000000", roughness: .05, metalness: 0, transparent: true, opacity: (op || .14) * .45, side: THREE.FrontSide, depthWrite: false,
    clearcoat: 1, clearcoatRoughness: .03, envMapIntensity: 1.7, specularIntensity: 1, specularColor: new THREE.Color(tint || "#ffffff"),
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor });
}
function liquidMat(THREE, c, op, rough) {
  return new THREE.MeshPhysicalMaterial({ color: c, roughness: rough == null ? .3 : rough, metalness: 0, transparent: op < 1, opacity: op, envMapIntensity: .35 });
}
// Glanzstreifen: schmale Ausschnitte der Glaskontur, die sich nicht mitdrehen (das Licht bleibt stehen, die Flasche dreht sich)
var hlMap = null;
function hlTex(THREE) {
  if (hlMap) return hlMap;
  var a = canvas(64, 128), g = a[1], img = g.createImageData(64, 128);
  for (var y = 0; y < 128; y++) for (var x = 0; x < 64; x++) {
    var u = x / 63, v = y / 127, k = Math.sin(Math.PI * u), fy = Math.min(1, v / .12, (1 - v) / .2), val = Math.round(255 * Math.pow(k, 1.6) * Math.max(0, fy)), i = (y * 64 + x) * 4;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = val; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0); hlMap = new THREE.CanvasTexture(a[0]); return hlMap;
}
function highlights(THREE, pts, y0, y1, strong) {
  var grp = new THREE.Group(), sub = pts.filter(function (p) { return p[1] >= y0 && p[1] <= y1; }).map(function (p) { return [p[0] * 1.012 + .002, p[1]]; });
  [[-.62, .16, strong || .5], [.5, .06, (strong || .5) * .6]].forEach(function (h) {
    var m = new THREE.Mesh(lathe(THREE, sub, 8, h[0] - h[1] / 2, h[1]), new THREE.MeshBasicMaterial({ color: "#ffffff", alphaMap: hlTex(THREE), transparent: true, opacity: h[2], blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    m.renderOrder = 4; grp.add(m);
  });
  return grp;
}

// Etikett als Teil eines Zylinders vorne (phi = 0 zeigt zur Kamera)
function backTex(THREE, o, W, H) {
  var a = canvas(W, H), g = a[1], cx = W / 2, fs = H * .07;
  g.fillStyle = o.bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = o.ink; g.globalAlpha = .4; g.lineWidth = Math.max(2, H * .01); g.strokeRect(W * .12, H * .1, W * .76, H * .8); g.globalAlpha = 1;
  spaced(g, "BIRNKAMMER", cx, H * .22, "600 " + Math.round(fs) + "px " + SANS, o.ink, fs * .3);
  ["Familie Eder", "Hofweg 7 · 3251 Musterdorf", "Mostviertel · Österreich"].forEach(function (t, i) { spaced(g, t, cx, H * (.38 + i * .1), "400 " + Math.round(fs * .9) + "px " + SANS, o.ink, 0); });
  g.fillStyle = o.ink; for (var i = 0; i < 26; i++) g.fillRect(cx - W * .16 + i * W * .0125, H * .7, (i * 7 % 3 + 1) * W * .003, H * .12);
  return tex(THREE, a[0]);
}
function labelMesh(THREE, o, r, y0, y1, arc) {
  var W = 1024, H = Math.round(1024 * (y1 - y0) / (r * arc));
  H = Math.max(256, Math.min(1024, H));
  var grp = new THREE.Group();
  var m = new THREE.MeshStandardMaterial({ map: labelTex(THREE, o, W, H), roughness: .62, metalness: 0, transparent: !!o.oval, alphaTest: o.oval ? .5 : 0, side: THREE.DoubleSide });
  grp.add(new THREE.Mesh(lathe(THREE, [[r, y0], [r, y1]], 48, -arc / 2, arc), m));
  if (!o.oval) {
    var ba = arc * .6, bm = new THREE.MeshStandardMaterial({ map: backTex(THREE, o, 512, Math.round(512 * (y1 - y0) * .8 / (r * ba))), roughness: .62, side: THREE.DoubleSide });
    var by0 = y0 + (y1 - y0) * .12, by1 = y1 - (y1 - y0) * .08;
    grp.add(new THREE.Mesh(lathe(THREE, [[r, by0], [r, by1]], 32, Math.PI - ba / 2, ba), bm));
  }
  return grp;
}

function shadowUnder(THREE, grp, sx, sz) {
  var m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTexture(THREE, .55), transparent: true, depthWrite: false, toneMapped: false }));
  m.rotation.x = -Math.PI / 2; m.scale.set(sx, sz, 1); m.position.y = .002; m.renderOrder = -1; m.userData.shadow = true; grp.add(m);
}

/* ---------- Flaschen ---------- */
var LBL = {
  speck: { bg: "#f2c56a", ink: "#2a1606", t: "Speckbirne", sub: "MOST · 1 L" },
  apfelbirn: { bg: "#e9a1a8", ink: "#2a1606", t: "Apfel-Birne", sub: "MOST · 1 L" },
  frizzante: { bg: "#2b2b3a", ink: "#f2c56a", t: "Frizzante", sub: "BIRNE · 0,75 L" },
  apfelsaft: { bg: "#f6e7c4", ink: "#2a1606", t: "Apfel", sub: "NATURTRÜB · 1 L" },
  holler: { bg: "#d9c6e8", ink: "#2a1606", t: "Holler", sub: "APFEL-HOLLER · 1 L" },
  williams: { bg: "#f6efe2", ink: "#2a1606", t: "Williams", sub: "EDELBRAND · 40 % VOL", band: "#c7354f" },
  fass: { bg: "#f6efe2", ink: "#2a1606", t: "Holzfass", sub: "MOSTBIRNE · 42 % VOL", band: "#3a2216" },
  bluete: { bg: "#fff6e3", ink: "#7a4a08", t: "Blüte", sub: "HONIG · 500 G", oval: true },
  ingwer: { bg: "#fff8ec", ink: "#6a3b08", t: "Birne-Ingwer", sub: "AUFSTRICH · 220 G" }
};

function metal(THREE, c, rough) { return new THREE.MeshStandardMaterial({ color: c, metalness: 1, roughness: rough == null ? .28 : rough }); }

// Mostflasche mit Bügelverschluss (1 l)
function most(THREE, key) {
  var grp = new THREE.Group(), o = { r: .3, h: .9, sh: 1.3, nr: .1, top: 1.62, bulge: true, k1: .55, k2: .5 };
  var pts = profile(o);
  var liq = new THREE.Mesh(lathe(THREE, liquidProfile(pts, 1.42), 64), liquidMat(THREE, key === "apfelbirn" ? "#c9741c" : "#d99a26", .92, .2));
  grp.add(liq);
  var gl = new THREE.Mesh(lathe(THREE, pts, 72), glassMat(THREE, "#eef3e4", .24)); gl.renderOrder = 2; grp.add(gl);
  grp.add(labelMesh(THREE, LBL[key], o.r + .004, .22, .74, 2.2));
  var top = o.top;
  var porc = new THREE.MeshPhysicalMaterial({ color: "#f7f4ee", roughness: .25, clearcoat: .8 });
  grp.add(new THREE.Mesh(lathe(THREE, [[0, top + .115], [.06, top + .11], [.09, top + .09], [.1, top + .055], [.094, top + .025], [.07, top + .012], [0, top + .012]], 48), porc));
  var rub = new THREE.Mesh(new THREE.TorusGeometry(.086, .013, 12, 48), new THREE.MeshStandardMaterial({ color: "#c7354f", roughness: .7 }));
  rub.rotation.x = Math.PI / 2; rub.position.y = top + .008; grp.add(rub);
  var wire = metal(THREE, "#c9ced2", .3), V = THREE.Vector3;
  var curve = new THREE.CatmullRomCurve3([new V(-.125, top - .13, 0), new V(-.13, top - .03, 0), new V(-.112, top + .06, 0), new V(-.06, top + .125, 0), new V(0, top + .135, 0), new V(.06, top + .125, 0), new V(.112, top + .06, 0), new V(.13, top - .03, 0), new V(.125, top - .13, 0)]);
  grp.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, .008, 8, false), wire));
  var col = new THREE.Mesh(new THREE.TorusGeometry(.116, .009, 8, 40), wire); col.rotation.x = Math.PI / 2; col.position.y = top - .13; grp.add(col);
  shadowUnder(THREE, grp, .95, .95);
  return { group: grp, h: top + .14, w: .62, hl: highlights(THREE, pts, .1, 1.5) };
}

// Birnen-Frizzante in der Sektflasche mit Kapsel und aufsteigenden Perlen
function frizz(THREE) {
  var grp = new THREE.Group(), o = { r: .31, h: .86, sh: 1.28, nr: .1, top: 1.68, lip: .014, k1: .6, k2: .55 };
  var pts = profile(o);
  grp.add(new THREE.Mesh(lathe(THREE, liquidProfile(pts, 1.4), 64), liquidMat(THREE, "#e2bb4c", .85, .2)));
  var gl = new THREE.Mesh(lathe(THREE, pts, 72), glassMat(THREE, "#dfe9cf", .3)); gl.renderOrder = 2; grp.add(gl);
  grp.add(labelMesh(THREE, LBL.frizzante, o.r + .004, .2, .7, 2.1));
  var foilPts = [], y;
  for (y = 1.3; y <= o.top; y += .02) foilPts.push([rAt(pts, y) + .007, y]);
  foilPts.push([o.nr + .03, o.top + .01]); foilPts.push([0, o.top + .02]);
  var foil = new THREE.MeshStandardMaterial({ color: "#2b2b3a", metalness: .7, roughness: .32 });
  grp.add(new THREE.Mesh(lathe(THREE, foilPts, 64), foil));
  var band = new THREE.Mesh(lathe(THREE, [[rAt(pts, 1.46) + .011, 1.44], [rAt(pts, 1.5) + .011, 1.5]], 64), metal(THREE, "#e2b04e", .3)); grp.add(band);
  // Perlen
  var n = 34, geo = new THREE.SphereGeometry(.009, 8, 6), bm = new THREE.MeshStandardMaterial({ color: "#fff8de", roughness: .1, transparent: true, opacity: .7 });
  var im = new THREE.InstancedMesh(geo, bm, n), r = rng(9), seeds = [], M = new THREE.Matrix4();
  for (var i = 0; i < n; i++) seeds.push([r() * 6.28, r() * .2, r(), .12 + r() * .2]);
  grp.add(im);
  function tick(t) {
    for (var i = 0; i < n; i++) {
      var s = seeds[i], yy = .08 + ((s[2] + t * s[3]) % 1) * 1.25, rr = Math.min(s[1], rAt(pts, yy) * .8);
      M.makeTranslation(Math.cos(s[0]) * rr, yy, Math.sin(s[0]) * rr); im.setMatrixAt(i, M);
    }
    im.instanceMatrix.needsUpdate = true;
  }
  tick(0);
  shadowUnder(THREE, grp, .98, .98);
  return { group: grp, h: o.top + .03, w: .64, tick: tick, hl: highlights(THREE, pts, .1, 1.25, .35) };
}

// Saftflasche (1 l) mit goldenem Schraubverschluss
function saft(THREE, key) {
  var grp = new THREE.Group(), o = { r: .3, h: 1.0, sh: 1.26, nr: .12, top: 1.5, lip: .01, k1: .45, k2: .45 };
  var pts = profile(o);
  var holler = key === "holler";
  grp.add(new THREE.Mesh(lathe(THREE, liquidProfile(pts, 1.34), 64), liquidMat(THREE, holler ? "#4a0f2c" : "#dfa13c", 1, holler ? .2 : .45)));
  var gl = new THREE.Mesh(lathe(THREE, pts, 72), glassMat(THREE, "#f4f1e6", .22)); gl.renderOrder = 2; grp.add(gl);
  grp.add(labelMesh(THREE, LBL[key], o.r + .004, .22, .86, 2.25));
  var cap = new THREE.Mesh(lathe(THREE, [[0, o.top + .1], [.122, o.top + .1], [.134, o.top + .09], [.136, o.top - .02], [.13, o.top - .03]], 64), metal(THREE, "#d7b45a", .32));
  grp.add(cap);
  // Rillen am Deckel
  for (var i = 0; i < 3; i++) { var rg = new THREE.Mesh(new THREE.TorusGeometry(.137, .004, 6, 48), metal(THREE, "#b8933f", .4)); rg.rotation.x = Math.PI / 2; rg.position.y = o.top + i * .03; grp.add(rg); }
  shadowUnder(THREE, grp, .95, .95);
  return { group: grp, h: o.top + .1, w: .62, hl: highlights(THREE, pts, .1, 1.42) };
}

// Edelbrand 0,35 l: schlanke Flasche mit Holzkopfkorken und Kapsel
function brand(THREE, key) {
  var grp = new THREE.Group(), o = { r: .2, h: 1.0, sh: 1.36, nr: .07, top: 1.74, lip: .01, k1: .7, k2: .6 };
  var pts = profile(o), fass = key === "fass", c = fass ? "#3a2216" : "#c7354f";
  grp.add(new THREE.Mesh(lathe(THREE, liquidProfile(pts, 1.5, .9), 64), liquidMat(THREE, fass ? "#b0631c" : "#fff3d6", fass ? .9 : .3, .1)));
  var gl = new THREE.Mesh(lathe(THREE, pts, 72), glassMat(THREE, "#f2f6f8", .22)); gl.renderOrder = 2; grp.add(gl);
  grp.add(labelMesh(THREE, LBL[key], o.r + .004, .2, .82, 2.5));
  var cap = new THREE.MeshPhysicalMaterial({ color: c, roughness: .38, clearcoat: .6 });
  var sl = [], y; for (y = o.top - .16; y <= o.top; y += .02) sl.push([rAt(pts, y) + .006, y]); sl.push([o.nr + .01, o.top + .004]); sl.push([0, o.top + .006]);
  grp.add(new THREE.Mesh(lathe(THREE, sl, 48), cap));
  grp.add(new THREE.Mesh(lathe(THREE, [[0, o.top + .12], [.075, o.top + .12], [.092, o.top + .105], [.098, o.top + .06], [.094, o.top + .02], [.06, o.top + .006], [0, o.top + .006]], 48), cap));
  shadowUnder(THREE, grp, .7, .7);
  return { group: grp, h: o.top + .12, w: .42, hl: highlights(THREE, pts, .1, 1.6) };
}

// Honigglas mit Goldschraubdeckel
function honig(THREE) {
  var grp = new THREE.Group(), o = { r: .4, h: .56, sh: .66, nr: .35, top: .74, k1: .5, k2: .4 };
  var pts = profile(o);
  grp.add(new THREE.Mesh(lathe(THREE, liquidProfile(pts, .64, .95), 64), liquidMat(THREE, "#d9870f", .96, .22)));
  var gl = new THREE.Mesh(lathe(THREE, pts, 72), glassMat(THREE, "#fbf6ea", .2)); gl.renderOrder = 2; grp.add(gl);
  grp.add(labelMesh(THREE, LBL.bluete, o.r + .004, .12, .5, 1.3));
  var lid = new THREE.Mesh(lathe(THREE, [[0, o.top + .1], [.33, o.top + .1], [.365, o.top + .09], [.375, o.top + .06], [.375, o.top - .05], [.36, o.top - .06]], 72), metal(THREE, "#c89a3c", .26));
  grp.add(lid);
  for (var i = 0; i < 2; i++) { var rg = new THREE.Mesh(new THREE.TorusGeometry(.377, .005, 6, 64), metal(THREE, "#a87c2a", .4)); rg.rotation.x = Math.PI / 2; rg.position.y = o.top - .02 + i * .05; grp.add(rg); }
  shadowUnder(THREE, grp, 1.15, 1.15);
  return { group: grp, h: o.top + .1, w: .84, hl: highlights(THREE, pts, .06, .66, .4) };
}

// Aufstrich: kleines Glas, roter Deckel, Karotuch mit Schnur
function aufstrich(THREE) {
  var grp = new THREE.Group(), o = { r: .33, h: .48, sh: .56, nr: .29, top: .62, k1: .5, k2: .4 };
  var pts = profile(o);
  var a = canvas(256, 256), g = a[1], r = rng(5);
  g.fillStyle = "#e3a140"; g.fillRect(0, 0, 256, 256);
  for (var k = 0; k < 400; k++) { g.fillStyle = r() < .6 ? "rgba(140,80,14,.55)" : "rgba(255,220,140,.5)"; g.beginPath(); g.arc(r() * 256, r() * 256, .8 + r() * 1.6, 0, 7); g.fill(); }
  var ft = tex(THREE, a[0]); ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(3, 2);
  grp.add(new THREE.Mesh(lathe(THREE, liquidProfile(pts, .55, .95), 64), new THREE.MeshPhysicalMaterial({ map: ft, color: "#ffffff", roughness: .3, clearcoat: .5 })));
  var gl = new THREE.Mesh(lathe(THREE, pts, 72), glassMat(THREE, "#fbf6ea", .22)); gl.renderOrder = 2; grp.add(gl);
  grp.add(labelMesh(THREE, LBL.ingwer, o.r + .004, .08, .42, 2.0));
  var lt = o.top + .07;
  grp.add(new THREE.Mesh(lathe(THREE, [[0, lt], [.29, lt], [.31, lt - .015], [.315, o.top - .04], [.3, o.top - .05]], 64), new THREE.MeshStandardMaterial({ color: "#c7354f", roughness: .4, metalness: .2 })));
  // Tuch: Ring, der über den Deckelrand fällt, an der Schnur eingeschnürt und unten wellig ausläuft
  var geo = new THREE.RingGeometry(.001, .5, 96, 14), p = geo.attributes.position, v = new THREE.Vector3();
  for (var i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    var rho = Math.hypot(v.x, v.y), phi = Math.atan2(v.y, v.x), x, y, rr;
    if (rho < .31) { rr = rho; y = lt + .012 + .01 * (1 - rho / .31); }
    else {
      var s = rho - .31, wave = Math.sin(phi * 9) * .022 + Math.sin(phi * 5 + 1) * .01;
      if (s < .05) { rr = .318 + s * .1; y = lt - s * 1.3; }
      else if (s < .08) { rr = .324 - (s - .05) * .5; y = lt - .065 - (s - .05) * .9; }
      else { var e = (s - .08) / .11; rr = .309 + e * .07 + wave * e; y = lt - .092 - e * .09 + wave * e * .6; }
    }
    x = Math.cos(phi) * rr; var z = Math.sin(phi) * rr;
    p.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  grp.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: karo(THREE), roughness: .9, side: THREE.DoubleSide })));
  var tw = new THREE.Mesh(new THREE.TorusGeometry(.312, .009, 8, 64), new THREE.MeshStandardMaterial({ color: "#c9a26b", roughness: .9 }));
  tw.rotation.x = Math.PI / 2; tw.position.y = lt - .068; grp.add(tw);
  shadowUnder(THREE, grp, 1, 1);
  return { group: grp, h: lt + .03, w: .82, hl: highlights(THREE, pts, .06, .55, .4) };
}

// Geschenkkistl: Holzkiste mit Latten, Holzwolle, drei Flaschen und Grußkarte
function kistl(THREE) {
  var grp = new THREE.Group(), W = 1.5, D = .8, H = .48, t = .045;
  var wt = woodTexture(THREE, { base: "#d9a466", dark: "#9a6436", light: "#f0c890", seed: 12, lines: 30 });
  var wood = new THREE.MeshStandardMaterial({ map: wt, roughness: .78 }), woodD = new THREE.MeshStandardMaterial({ map: wt, color: "#d8c0a0", roughness: .8 });
  function board(w, h, d, x, y, z, m) { var b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m || wood); b.position.set(x, y, z); grp.add(b); return b; }
  board(W, t, D, 0, t / 2, 0, woodD);
  [[.04, .2], [.27, .2]].forEach(function (s) { board(W, s[1], t, 0, s[0] + s[1] / 2, D / 2 - t / 2); board(W, s[1], t, 0, s[0] + s[1] / 2, -D / 2 + t / 2); });
  board(t * 1.4, H, D, -W / 2 + t * .7, H / 2, 0); board(t * 1.4, H, D, W / 2 - t * .7, H / 2, 0);
  // Brandzeichen vorne
  var a = canvas(512, 128), g = a[1];
  g.fillStyle = "rgba(70,36,14,.82)"; pear(g, 70, 66, 70);
  spaced(g, "BIRNKAMMER", 290, 66, "600 46px " + SANS, "rgba(70,36,14,.82)", 8);
  var brandM = new THREE.Mesh(new THREE.PlaneGeometry(.62, .155), new THREE.MeshStandardMaterial({ map: tex(THREE, a[0]), transparent: true, roughness: .8, depthWrite: false }));
  brandM.position.set(0, .37, D / 2 + .001); grp.add(brandM);
  // Holzwolle als welliger Hügel
  var wg = new THREE.PlaneGeometry(W - .1, D - .08, 40, 22), wp = wg.attributes.position, r = rng(17), vv = new THREE.Vector3();
  for (var i = 0; i < wp.count; i++) {
    vv.fromBufferAttribute(wp, i);
    var ex = 1 - Math.pow(Math.abs(vv.x) / ((W - .1) / 2), 6), ez = 1 - Math.pow(Math.abs(vv.y) / ((D - .08) / 2), 6);
    wp.setZ(i, (.04 + .06 * Math.max(0, ex * ez)) + (r() - .5) * .035 * ex * ez);
  }
  wg.computeVertexNormals();
  var wm = new THREE.Mesh(wg, new THREE.MeshStandardMaterial({ map: wool(THREE), roughness: 1, side: THREE.DoubleSide }));
  wm.rotation.x = -Math.PI / 2; wm.position.y = H - .08; grp.add(wm);
  // Flaschen, halb in der Holzwolle
  [[most(THREE, "speck"), -.42, .02, .5, .1], [brand(THREE, "williams"), 0, -.02, .62, -.05], [saft(THREE, "holler"), .42, .03, .5, .14]].forEach(function (b) {
    var m = b[0].group; m.children = m.children.filter(function (c) { return !c.userData.shadow; });
    m.scale.setScalar(b[3]); m.position.set(b[1], .12, b[2]); m.rotation.y = b[4]; grp.add(m);
  });
  // Grußkarte, schräg an die Flaschen gelehnt
  var ca = canvas(256, 160), cg = ca[1];
  cg.fillStyle = "#fff8ec"; cg.fillRect(0, 0, 256, 160); cg.strokeStyle = "rgba(122,58,18,.5)"; cg.lineWidth = 3; cg.strokeRect(10, 10, 236, 140);
  cg.fillStyle = "#7a3a12"; cg.font = "italic 400 34px " + SERIF; cg.textAlign = "center"; cg.fillText("Frohes Fest", 128, 78);
  spaced(cg, "VOM HOF", 128, 112, "600 18px " + SANS, "#7a3a12", 5);
  var card = new THREE.Mesh(new THREE.PlaneGeometry(.34, .21), new THREE.MeshStandardMaterial({ map: tex(THREE, ca[0]), roughness: .7, side: THREE.DoubleSide }));
  card.position.set(.2, H + .07, D / 2 - .1); card.rotation.set(-.35, -.25, .08); grp.add(card);
  shadowUnder(THREE, grp, 2.1, 1.3);
  return { group: grp, h: 1.08, w: 1.6 };
}

export function build(THREE, id) {
  var o;
  if (id === "speck" || id === "apfelbirn") o = most(THREE, id);
  else if (id === "frizzante") o = frizz(THREE);
  else if (id === "apfelsaft" || id === "holler") o = saft(THREE, id);
  else if (id === "williams" || id === "fass") o = brand(THREE, id);
  else if (id === "bluete") o = honig(THREE);
  else if (id === "ingwer") o = aufstrich(THREE);
  else if (id === "kistl") o = kistl(THREE);
  else return null;
  if (!o.tick) o.tick = function () {};
  return o;
}
