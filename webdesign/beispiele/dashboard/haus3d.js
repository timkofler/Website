// Haus im Querschnitt für die Website von "Haustechnik Kofler": ein Einfamilienhaus mit Keller, wie ein
// Architekturmodell aufgeschnitten. Strom, Wasser, Heizung, Photovoltaik und Abwasser leuchten nacheinander
// auf; die Legende zeigt einen Bereich einzeln, Ziehen dreht das Haus.
import { reduce, mobile, webglOk, whenNear, loadThree, stage, dragRotate, rng } from "/beispiele/_shared/stage3d.js?v=1";

var host = document.getElementById("haus3d"), sec = host && host.closest("section");
if (host && webglOk()) whenNear(host, function () {
  Promise.all([loadThree(), import("/beispiele/_shared/vendor/three-r180/RoomEnvironment.js")])
    .then(function (m) { init(m[0], m[1].RoomEnvironment); }).catch(function () {});
});

var SYS = {
  strom: { c: 0xffb81c, n: "Strom", d: "Vom Hausanschluss über Zähler und Verteiler zu jeder Steckdose und Lampe." },
  wasser: { c: 0x2f8cff, n: "Wasser", d: "Kaltwasser über die Hauswasserstation zu Küche und Bad, Warmwasser direkt aus dem Speicher." },
  heizung: { c: 0xff5a2e, n: "Heizung", d: "Die Luft-Wärmepumpe im Garten versorgt die Fußbodenheizung in jedem Stockwerk." },
  pv: { c: 0x1fbf63, n: "Photovoltaik", d: "Strom vom Dach über den Wechselrichter in den Batteriespeicher und ins Haus." },
  abwasser: { c: 0x8a96ad, n: "Abwasser", d: "Alles, was abfließt, mit Gefälle über die Fallleitung in den Kanal." }
};
var ORDER = ["strom", "wasser", "heizung", "pv", "abwasser"];

// Kleine Canvas-Texturen statt Bilddateien
function tex(THREE, w, h, draw, rx, ry) {
  var c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h, rng(w + h));
  var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  t.repeat.set(rx || 1, ry || 1); return t;
}
function noise(g, w, h, r, base, spots, a) {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (var i = 0; i < w * h / 18; i++) { g.fillStyle = spots[(r() * spots.length) | 0]; g.globalAlpha = a * r(); g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); }
  g.globalAlpha = 1;
}

function init(THREE, RoomEnvironment) {
  var S = stage(THREE, host, { fov: 30, exposure: 1.0, shadows: true });
  host.classList.add("is-on");
  var scene = S.scene, cam = S.camera, R = S.renderer;
  var pm = new THREE.PMREMGenerator(R); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .45;
  scene.background = tex(THREE, 4, 256, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#0b0b0c"); gr.addColorStop(.55, "#141415"); gr.addColorStop(1, "#2a150c"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });

  scene.add(new THREE.HemisphereLight(0xfff1e6, 0x5a3b2a, .9));
  var sun = new THREE.DirectionalLight(0xfff0dc, 2.6); sun.position.set(9, 15, 11); sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048); sun.shadow.bias = -.0005; sun.shadow.normalBias = .02;
  var sc = sun.shadow.camera; sc.left = -11; sc.right = 11; sc.top = 11; sc.bottom = -11; sc.near = 2; sc.far = 40;
  scene.add(sun);

  // Materialien
  function M(o) { return new THREE.MeshStandardMaterial(Object.assign({ roughness: .85 }, o)); }
  var plaster = M({ map: tex(THREE, 256, 256, function (g, w, h, r) { noise(g, w, h, r, "#efebe3", ["#ddd7cc", "#fbf9f4"], .5); }, 3, 3) });
  var inner = M({ color: 0xf7f6f2, roughness: .95 });
  var cutM = M({ color: 0x4d5462, roughness: .7 });
  var insul = M({ map: tex(THREE, 64, 64, function (g, w, h) { g.fillStyle = "#f2d37a"; g.fillRect(0, 0, w, h); g.strokeStyle = "#d8b04f"; g.lineWidth = 3; for (var i = -64; i < 128; i += 12) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 64, 64); g.stroke(); } }, 1, 6) });
  var concrete = M({ map: tex(THREE, 256, 256, function (g, w, h, r) { noise(g, w, h, r, "#b9bcc1", ["#a3a7ad", "#cfd2d6"], .6); }, 3, 3) });
  var parquet = M({ roughness: .55, map: tex(THREE, 512, 512, function (g, w, h, r) {
    for (var y = 0; y < h; y += 32) for (var x = -((y / 32) % 4) * 64; x < w; x += 256) {
      var l = 150 + r() * 30 | 0; g.fillStyle = "rgb(" + (l + 40) + "," + (l + 5) + "," + (l - 45) + ")"; g.fillRect(x, y, 256, 32);
      g.strokeStyle = "rgba(90,60,30,.35)"; g.strokeRect(x + .5, y + .5, 256, 32);
      for (var k = 0; k < 6; k++) { g.strokeStyle = "rgba(110,75,40," + (.1 + r() * .15) + ")"; g.beginPath(); var yy = y + 4 + r() * 24; g.moveTo(x, yy); g.bezierCurveTo(x + 80, yy + r() * 6 - 3, x + 170, yy + r() * 6 - 3, x + 256, yy); g.stroke(); }
    }
  }, 2.5, 2.5) });
  function tileTex(base, grout, n, rx, ry) { return tex(THREE, 256, 256, function (g, w, h, r) { var s = w / n; for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) { var v = (r() - .5) * 10 | 0; g.fillStyle = base; g.fillRect(i * s, j * s, s, s); g.fillStyle = "rgba(" + (v > 0 ? "255,255,255," : "0,0,0,") + Math.abs(v) / 100 + ")"; g.fillRect(i * s, j * s, s, s); } g.strokeStyle = grout; g.lineWidth = 3; for (i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke(); } }, rx, ry); }
  var tilesFloor = M({ roughness: .4, map: tileTex("#c9ccce", "#a9adb0", 4, 3, 2) });
  var tilesWall = M({ roughness: .3, map: tileTex("#eef1f2", "#cfd4d6", 6, 4, 2) });
  var epoxy = M({ color: 0x9aa2ab, roughness: .45 });
  var roofT = tex(THREE, 256, 256, function (g, w, h, r) {
    g.fillStyle = "#7a3424"; g.fillRect(0, 0, w, h);
    for (var y = 0; y < h; y += 32) for (var x = (y / 32) % 2 ? -16 : 0; x < w; x += 32) {
      var l = r() * 30 | 0, gr = g.createLinearGradient(0, y, 0, y + 32);
      gr.addColorStop(0, "rgb(" + (150 + l) + "," + (66 + l / 2) + "," + (44 + l / 3) + ")"); gr.addColorStop(1, "rgb(" + (105 + l) + "," + (44 + l / 2) + "," + (30 + l / 3) + ")");
      g.fillStyle = gr; g.fillRect(x + 1, y + 1, 30, 30); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(x + 1, y + 28, 30, 3);
    }
  }, 5, 6);
  var roofM = M({ map: roofT, roughness: .75 });
  var grassM = M({ map: tex(THREE, 256, 256, function (g, w, h, r) { noise(g, w, h, r, "#5e8f45", ["#4b7a37", "#77a85a", "#6b9a4e", "#3f6d30"], .9); }, 6, 6) });
  var earthM = M({ map: tex(THREE, 64, 256, function (g, w, h, r) {
    var L = [[0, .08, "#4a3a2a"], [.08, .45, "#7b5d40"], [.45, .8, "#8c7356"], [.8, 1, "#9b9286"]];
    L.forEach(function (l) { g.fillStyle = l[2]; g.fillRect(0, l[0] * h, w, (l[1] - l[0]) * h); });
    for (var i = 0; i < 500; i++) { g.fillStyle = r() < .5 ? "rgba(0,0,0,.18)" : "rgba(255,255,255,.12)"; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 2); }
  }, 1, 1) });
  var white = M({ color: 0xf4f5f6, roughness: .35 }), whiteMatte = M({ color: 0xeef0f2, roughness: .7 });
  var anth = M({ color: 0x3b4048, roughness: .5, metalness: .2 }), steel = M({ color: 0xc7ccd2, roughness: .25, metalness: .8 });
  var oak = M({ color: 0xb98a58, roughness: .6, map: parquet.map });
  var glass = new THREE.MeshPhysicalMaterial({ color: 0xcfe4f3, roughness: .05, metalness: 0, transparent: true, opacity: .35 });

  var root = new THREE.Group(); scene.add(root);
  function bx(w, h, d, m, x, y, z, noCast) {
    var o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z);
    o.castShadow = !noCast; o.receiveShadow = true; root.add(o); return o;
  }
  function cyl(rt, rb, h, m, x, y, z, seg) { var o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 24), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; root.add(o); return o; }

  // Maße: Innenraum x -4..4, z -3..3; Außenwand 30 cm; Ebenen KG -2.4, EG 0, OG 2.8, Dachboden 5.6
  var T = .3, FL = [-2.4, 0, 2.8, 5.6];

  // Gelände mit aufgeschnittenem Erdreich vorne
  bx(6, 2.9, 13.3, earthM, -7.3, -1.45, -3.35, true); bx(6, 2.9, 13.3, earthM, 7.3, -1.45, -3.35, true); bx(8.6, 2.9, 6.7, earthM, 0, -1.45, -6.65, true);
  bx(20.6, .3, 13.3, earthM, 0, -3.05, -3.35, true);
  bx(6, .06, 13.3, grassM, -7.3, .03, -3.35, true); bx(6, .06, 13.3, grassM, 7.3, .03, -3.35, true); bx(8.6, .06, 6.7, grassM, 0, .03, -6.65, true);
  // Terrasse und Weg
  var deck = M({ map: parquet.map, color: 0xa88762, roughness: .8 });
  bx(3, .12, 4.2, deck, 5.85, .09, .9);
  // Baum
  cyl(.12, .18, 2.4, M({ color: 0x6b4b33 }), -7.2, 1.2, -6);
  var leaf = M({ color: 0x4f7f3a, roughness: .9, flatShading: true });
  [[0, 3.1, 0, 1.3], [.7, 2.7, .3, .9], [-.6, 2.8, -.2, 1], [.1, 3.8, -.1, .9]].forEach(function (b) { var s = new THREE.Mesh(new THREE.IcosahedronGeometry(b[3], 1), leaf); s.position.set(-7.2 + b[0], b[1], -6 + b[2]); s.castShadow = true; root.add(s); });

  // Wände mit Fensteröffnungen: entlang x (Rückwand) bzw. entlang z (linke Wand)
  function wall(axis, a0, a1, y0, y1, c0, c1, holes, m) {
    holes = (holes || []).slice().sort(function (p, q) { return p[0] - q[0]; });
    var cur = a0, mid = (c0 + c1) / 2, th = c1 - c0;
    function piece(p0, p1, q0, q1) {
      if (p1 - p0 < .001 || q1 - q0 < .001) return;
      if (axis === "x") bx(p1 - p0, q1 - q0, th, m, (p0 + p1) / 2, (q0 + q1) / 2, mid);
      else bx(th, q1 - q0, p1 - p0, m, mid, (q0 + q1) / 2, (p0 + p1) / 2);
    }
    holes.forEach(function (h) { piece(cur, h[0], y0, y1); piece(h[0], h[1], y0, h[2]); piece(h[0], h[1], h[3], y1); cur = h[1]; });
    piece(cur, a1, y0, y1);
  }
  function windowAt(axis, a0, a1, b0, b1, c) {
    var f = .06, d = .1, g = new THREE.Group(); root.add(g);
    function fb(w, h, x, y) { var o = new THREE.Mesh(new THREE.BoxGeometry(axis === "x" ? w : d, h, axis === "x" ? d : w), anth); o.position.set(axis === "x" ? x : c, y, axis === "x" ? c : x); o.castShadow = true; g.add(o); }
    var mid = (a0 + a1) / 2, w = a1 - a0;
    fb(w, f, mid, b0 + f / 2); fb(w, f, mid, b1 - f / 2); fb(f, b1 - b0, a0 + f / 2, (b0 + b1) / 2); fb(f, b1 - b0, a1 - f / 2, (b0 + b1) / 2);
    if (w > 1.3) fb(f, b1 - b0, mid, (b0 + b1) / 2);
    var pane = new THREE.Mesh(new THREE.PlaneGeometry(w, b1 - b0), glass); pane.position.set(axis === "x" ? mid : c, (b0 + b1) / 2, axis === "x" ? c : mid); if (axis !== "x") pane.rotation.y = Math.PI / 2; g.add(pane);
    var sill = axis === "x" ? bx(w + .1, .04, .34, anth, mid, b0 - .02, c - .05) : bx(.34, .04, w + .1, anth, c - .05, b0 - .02, mid);
    return g;
  }
  // Rückwand (z -3.3..-3) mit Fenstern im Schlafzimmer und Bad
  var bw = [[-3.1, -1.7, 3.7, 4.9], [2.0, 2.8, 4.3, 4.95], [-2.4, -1.0, .9, 2.2]];
  wall("x", -4.3, 4.3, -2.64, FL[3], -3.3, -3, bw, plaster);
  bw.forEach(function (h) { windowAt("x", h[0], h[1], h[2], h[3], -3.15); });
  // linke Wand (x -4.3..-4) mit Stiegenhausfenster und Wohnzimmerfenster
  var lw = [[-.2, 1.6, .9, 2.4], [-.2, 1.2, 3.7, 5.0], [1.6, 2.6, -1.4, -.8]];
  wall("z", -3.3, 3, -2.64, FL[3], -4.3, -4, lw, plaster);
  lw.forEach(function (h) { windowAt("z", h[0], h[1], h[2], h[3], -4.15); });
  // rechte Wand über Erde mit Terrassentür im EG und Fenster im OG
  var rw = [[-.4, 1.4, 0, 2.3], [-1.8, -.6, 3.7, 4.9]];
  wall("z", -3.3, 3, 0, FL[3], 4, 4.3, rw, plaster);
  rw.forEach(function (h) { windowAt("z", h[0], h[1], h[2] < .05 ? .03 : h[2], h[3], 4.15); });
  bx(.12, FL[3], 6.42, insul, 4.36, FL[3] / 2, -.15, true); bx(.02, FL[3], 6.54, plaster, 4.43, FL[3] / 2, -.15, true);
  bx(.3, FL[3] + .04, .02, cutM, 4.15, FL[3] / 2, 3.01, true);
  // rechte Kellerwand gegen das Erdreich, Dämmung außen
  bx(.3, 2.64, 6.3, concrete, 4.15, -1.32, -.15); bx(.12, 2.4, 6.3, insul, 4.36, -1.3, -.15, true);
  // Dämmung an Rück- und linker Wand außen sichtbar im Schnitt
  bx(8.84, 8.2, .12, insul, 0, 1.46, -3.36, true); bx(.12, 8.2, 6.42, insul, -4.36, 1.46, -.15, true);
  bx(9.1, 8.2, .02, plaster, 0, 1.46, -3.43, true); bx(.02, 8.2, 6.54, plaster, -4.43, 1.46, -.15, true);
  // Schnittkanten vorne dunkel wie im Plan
  bx(.3, 8.24, .02, cutM, -4.15, 1.48, 3.01, true);

  // Decken mit Stiegenloch (x -4..-2.95, z -1.7..2.0)
  function slab(y, finish, hole) {
    var th = .25, yc = y - th / 2;
    if (!hole) { bx(8.6, th, 6.3, concrete, 0, yc, -.15); }
    else {
      bx(8.6 - 1.35, th, 6.3, concrete, .675, yc, -.15);
      bx(1.35, th, 1.4, concrete, -3.625, yc, -2.6); bx(1.35, th, 1.0, concrete, -3.625, yc, 2.5);
    }
    bx(8.6, th, .02, cutM, 0, yc, 3.01, true);
    if (finish) finish.forEach(function (f) { var o = bx(f[1] - f[0], .03, f[3] - f[2], f[4], (f[0] + f[1]) / 2, y + .015, (f[2] + f[3]) / 2, true); o.castShadow = false; });
  }
  slab(FL[0], [[-4, 4, -3, 3, epoxy]]);
  slab(FL[1], [[-2.95, 4, -3, 3, parquet], [-4, -2.95, -3, -1.7, parquet], [-4, -2.95, 2, 3, parquet]], true);
  slab(FL[2], [[-2.95, .2, -3, 3, parquet], [.2, 4, -3, 3, tilesFloor], [-4, -2.95, -3, -1.7, parquet], [-4, -2.95, 2, 3, parquet]], true);
  slab(FL[3], [[-4, 4, -3, 3, M({ color: 0xcdbb9a, roughness: .9 })]]);
  // Bodenplatte unter dem Keller
  bx(8.6, .3, 6.3, concrete, 0, -2.79, -.15);

  // Satteldach (First von vorne nach hinten), Ziegel, Dachrinnen; rechte Fläche mit PV
  var slope = Math.atan2(2.8, 4.6), len = Math.hypot(4.6, 2.8) + .55;
  function roofSide(s) {
    var g = new THREE.Group(); g.position.set(s * 2.3, FL[3] + 1.4 + .12, -.15); g.rotation.z = -s * slope; root.add(g);
    var tiles = new THREE.Mesh(new THREE.BoxGeometry(len, .1, 7.3), roofM); tiles.position.y = .1; tiles.castShadow = tiles.receiveShadow = true; g.add(tiles);
    var rafters = new THREE.Mesh(new THREE.BoxGeometry(len, .22, 7.1), M({ color: 0xc89c68 })); rafters.position.y = -.07; g.add(rafters);
    var gut = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 7.3, 12, 1, false, 0, Math.PI), steel); gut.rotation.x = Math.PI / 2; gut.rotation.y = s > 0 ? Math.PI : 0; gut.position.set(s * len / 2, .02, 0); g.add(gut);
    return g;
  }
  roofSide(-1); var roofR = roofSide(1);
  bx(.35, .3, 7.3, roofM, 0, FL[3] + 2.85, -.15); // First
  var gab = new THREE.Shape(); gab.moveTo(-4.3, 0); gab.lineTo(4.3, 0); gab.lineTo(0, 2.65); gab.lineTo(-4.3, 0);
  var gm = new THREE.Mesh(new THREE.ExtrudeGeometry(gab, { depth: .3, bevelEnabled: false }), plaster); gm.position.set(0, FL[3], -3.3); gm.castShadow = true; root.add(gm);
  var pvM = M({ color: 0x1b2742, roughness: .2, metalness: .6, emissive: 0x1fbf63, emissiveIntensity: 0 });
  for (var i = 0; i < 2; i++) for (var j = 0; j < 3; j++) {
    var p = new THREE.Mesh(new THREE.BoxGeometry(1.9, .05, 1.95), pvM); p.position.set(-1.05 + i * 2.05, .2, -2.15 + j * 2.1); p.castShadow = true; roofR.add(p);
    var fr = new THREE.Mesh(new THREE.BoxGeometry(1.94, .04, 1.99), steel); fr.position.copy(p.position); fr.position.y -= .02; roofR.add(fr);
  }

  // Stiegen: Faltwerk mit Eichenstufen vom Keller ins EG und vom EG ins OG, Glasgeländer oben
  function stair(y0, y1, n) {
    var rise = (y1 - y0) / n, run = 3.7 / n;
    for (var k = 0; k < n; k++) { bx(.95, .05, run + .02, oak, -3.5, y0 + (k + 1) * rise - .025, 2.3 - k * run - run / 2); bx(.95, rise, .04, inner, -3.5, y0 + k * rise + rise / 2, 2.3 - k * run, true); }
  }
  stair(FL[0], FL[1], 13); stair(FL[1], FL[2], 15);
  [FL[2]].forEach(function (y) { var gp = new THREE.Mesh(new THREE.BoxGeometry(.02, .95, 3.7), glass); gp.position.set(-2.95, y + .5, .15); root.add(gp); bx(.05, .05, 3.7, steel, -2.95, y + 1, .15, true); });

  // Innenwand OG zwischen Schlafzimmer und Bad, mit Tür
  wall("z", -3, 3, FL[2], FL[3] - .25, .14, .26, [[1.0, 1.9, FL[2], FL[2] + 2.1]], inner);
  bx(.12, FL[3] - FL[2] - .25, .02, cutM, .2, (FL[2] + FL[3] - .25) / 2, 3.0, true);
  // Badfliesen an der Rückwand
  bx(3.8, 2.2, .02, tilesWall, 2.1, FL[2] + 1.1, -2.99, true);

  // --- Keller: Technikraum ---
  var K = FL[0];
  cyl(.38, .38, 1.75, white, -2.9, K + .875 + .05, -2.5); cyl(.38, .38, .05, anth, -2.9, K + .025, -2.5); // Warmwasserspeicher
  var hm = bx(.6, .9, .4, white, -1.9, K + 1.35, -2.75); bx(.2, .08, .01, M({ color: 0x1fbf63, emissive: 0x1fbf63, emissiveIntensity: .8 }), -1.9, K + 1.6, -2.545, true); // Hydraulikmodul
  bx(1.0, 1.3, .25, M({ color: 0xd9dce0, roughness: .5 }), 2.6, K + 1.25, -2.87); bx(.98, .01, .01, anth, 2.6, K + 1.25, -2.74, true); // Zählerschrank
  bx(.5, .7, .18, white, 3.55, K + 1.35, -2.9); bx(.06, .02, .01, M({ color: 0x1fbf63, emissive: 0x1fbf63, emissiveIntensity: 1 }), 3.55, K + 1.6, -2.8, true); // Wechselrichter
  bx(.6, 1.1, .45, M({ color: 0xe6e8eb, roughness: .4 }), 1.4, K + .55, -2.7); // Batteriespeicher
  bx(.45, .5, .2, M({ color: 0x3a6fb0, roughness: .5 }), .55, K + 1.1, -2.88); // Hauswasserstation mit Filter
  bx(.6, .85, .6, white, -1.0, K + .43, 1.9); bx(.6, .85, .6, white, -.3, K + .43, 1.9); // Waschmaschine, Trockner
  var drum = cyl(.2, .2, .02, glass, -1.0, K + .5, 2.21); drum.rotation.x = Math.PI / 2;
  // --- Erdgeschoss: offene Küche rechts, Wohnen links ---
  var E = FL[1];
  bx(3.2, .86, .62, M({ color: 0x6a7584, roughness: .5 }), 2.35, E + .43, -2.69); bx(3.24, .04, .64, M({ color: 0x2f3236, roughness: .3 }), 2.35, E + .88, -2.69);
  bx(3.2, .7, .35, M({ color: 0xeceff2, roughness: .5 }), 2.35, E + 1.95, -2.82); // Oberschränke
  bx(.5, .02, .4, steel, 1.6, E + .9, -2.7, true); cyl(.012, .012, .25, steel, 1.6, E + 1.03, -2.88); // Spüle, Armatur
  bx(.6, .01, .5, M({ color: 0x111111, roughness: .2 }), 3.1, E + .905, -2.69, true); // Kochfeld
  bx(.7, 2.1, .65, M({ color: 0xdfe3e7, roughness: .3, metalness: .3 }), 4.0 - .38, E + 1.05, -2.0); // Kühlschrank
  bx(2.2, .9, 1, M({ color: 0x6a7584, roughness: .5 }), 2.2, E + .45, -.9); bx(2.4, .04, 1.1, oak, 2.2, E + .92, -.9); // Kochinsel
  [[1.5, -.2], [2.2, -.2], [2.9, -.2]].forEach(function (s) { cyl(.18, .18, .05, anth, s[0], E + .75, s[1]); cyl(.02, .02, .72, steel, s[0], E + .36, s[1]); });
  bx(1.6, .05, .9, oak, 1.9, E + .75, 1.6); bx(1.5, .7, .06, anth, 1.9, E + .36, 1.6); // Esstisch
  [[1.3, 1.0], [2.5, 1.0], [1.3, 2.2], [2.5, 2.2]].forEach(function (s) { bx(.45, .05, .45, oak, s[0], E + .46, s[1]); bx(.45, .45, .04, oak, s[0], E + .7, s[1] + (s[1] < 1.6 ? -.22 : .22)); });
  var sofaM = M({ color: 0x8796a8, roughness: 1 });
  bx(2.4, .42, .95, sofaM, -1.3, E + .25, .9); bx(2.4, .45, .22, sofaM, -1.3, E + .65, 1.3); bx(.22, .6, .95, sofaM, -2.4, E + .32, .9); bx(.22, .6, .95, sofaM, -.2, E + .32, .9);
  bx(2.6, 1.7, .03, M({ color: 0xe9e3d6, roughness: 1 }), -1.3, E + .01, -.4, true).rotation.x = -Math.PI / 2; // Teppich
  bx(2.2, .45, .45, oak, -1.4, E + .23, -2.75); bx(1.5, .85, .05, M({ color: 0x15171b, roughness: .2 }), -1.4, E + 1.15, -2.85); // TV-Möbel, Fernseher
  cyl(.18, .14, .4, M({ color: 0xd8cbb5 }), -.3, E + .2, -2.6); var pl = new THREE.Mesh(new THREE.IcosahedronGeometry(.4, 1), leaf); pl.position.set(-.3, E + .85, -2.6); pl.castShadow = true; root.add(pl);
  // --- Obergeschoss: Schlafzimmer links, Bad rechts ---
  var O = FL[2];
  bx(1.8, .35, 2.1, oak, -1.4, O + .2, -1.9); bx(1.7, .2, 2, M({ color: 0xf2f2f0, roughness: 1 }), -1.4, O + .47, -1.9); bx(1.9, .9, .08, oak, -1.4, O + .6, -2.94);
  bx(.6, .15, .35, M({ color: 0xffffff, roughness: 1 }), -1.85, O + .63, -2.7); bx(.6, .15, .35, M({ color: 0xffffff, roughness: 1 }), -.95, O + .63, -2.7);
  bx(1.7, .08, 1.2, M({ color: 0x9fb4c8, roughness: 1 }), -1.4, O + .6, -1.4); // Decke
  bx(.45, .45, .4, oak, -2.6, O + .23, -2.75); bx(.45, .45, .4, oak, -.2, O + .23, -2.75);
  bx(.6, 2.2, 1.8, M({ color: 0xe8e4dc }), -.2, O + 1.1, 1.8); // Kasten an der Innenwand
  bx(1.75, .55, .78, white, 3.1, O + .3, -2.6); bx(1.55, .02, .6, M({ color: 0xbfe1f2, roughness: .05 }), 3.1, O + .55, -2.6, true); // Badewanne
  bx(.38, .38, .55, white, 1.0, O + .42, -2.72); bx(.5, .7, .12, white, 1.0, O + .85, -2.93); // WC, Spülkasten
  bx(.8, .45, .48, oak, 1.95, O + .6, -2.75); bx(.6, .08, .4, white, 1.95, O + .86, -2.72); bx(.7, .8, .02, M({ color: 0xdfe9ef, roughness: 0, metalness: .9 }), 1.95, O + 1.55, -2.98, true); // Waschtisch, Spiegel
  var towel = M({ color: 0xffffff, roughness: .3, metalness: .4 }); for (i = 0; i < 6; i++) bx(.55, .03, .03, towel, 3.4, O + 1.0 + i * .16, 2.2, true);
  bx(.03, 1, .03, towel, 3.12, O + 1.4, 2.2, true); bx(.03, 1, .03, towel, 3.68, O + 1.4, 2.2, true);
  // Luft-Wärmepumpe im Garten
  bx(1.1, .9, .45, M({ color: 0xdfe2e5, roughness: .5 }), 5.4, .5, -2.4); bx(1.2, .06, .55, anth, 5.4, .03, -2.4);
  var fan = cyl(.3, .3, .02, anth, 5.25, .5, -2.17); fan.rotation.x = Math.PI / 2;
  var grill = new THREE.Mesh(new THREE.TorusGeometry(.3, .015, 6, 32), steel); grill.position.set(5.25, .5, -2.155); root.add(grill);

  // Lampen: leuchten, wenn Strom an ist
  var bulbs = [], bulbM = new THREE.MeshStandardMaterial({ color: 0xfff3d6, emissive: 0xffc56a, emissiveIntensity: 0 });
  function pendant(x, y, z) {
    cyl(.006, .006, .7, anth, x, y - .35, z); var sh = cyl(.04, .18, .16, anth, x, y - .75, z);
    var b = new THREE.Mesh(new THREE.SphereGeometry(.06, 12, 8), bulbM); b.position.set(x, y - .84, z); root.add(b); bulbs.push(b);
  }
  pendant(2.2, FL[2] - .25, -.9); pendant(1.9, FL[2] - .25, 1.6); pendant(-1.3, FL[2] - .25, .3); pendant(-1.4, FL[3] - .25, -.9); pendant(2.4, FL[3] - .25, -.5);

  // Leitungen: Röhren mit eigenem Shader, der sie entlang der Länge freilegt und Pulse fließen lässt
  var lines = {}, glows = {}; ORDER.forEach(function (k) { lines[k] = []; glows[k] = []; });
  function lineMat(col) {
    return new THREE.ShaderMaterial({
      uniforms: { uC: { value: new THREE.Color(col) }, uP: { value: 0 }, uT: { value: 0 }, uL: { value: 10 }, uA: { value: 1 } },
      transparent: true,
      vertexShader: "varying vec2 vUv;varying vec3 vN;void main(){vUv=uv;vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader: "uniform vec3 uC;uniform float uP;uniform float uT;uniform float uL;uniform float uA;varying vec2 vUv;varying vec3 vN;" +
        "void main(){if(vUv.x>uP)discard;float d=fract(vUv.x*uL*.8-uT*1.2);float pulse=smoothstep(.0,.12,d)*smoothstep(.4,.12,d);" +
        "float shade=.72+.28*max(0.,dot(vN,normalize(vec3(.3,.8,.6))));float head=smoothstep(uP-.03,uP,vUv.x)*step(uP,.999);" +
        "vec3 c=uC*shade*(1.+pulse*.55)+head*.5;gl_FragColor=vec4(c,uA);\n#include <colorspace_fragment>\n}"
    });
  }
  function line(sys, pts, r, col) {
    var path = new THREE.CurvePath(), len = 0;
    for (var k = 1; k < pts.length; k++) { var a = new THREE.Vector3().fromArray(pts[k - 1]), b = new THREE.Vector3().fromArray(pts[k]); path.add(new THREE.LineCurve3(a, b)); len += a.distanceTo(b); }
    var m = lineMat(col || SYS[sys].c); m.uniforms.uL.value = len;
    var mesh = new THREE.Mesh(new THREE.TubeGeometry(path, Math.max(16, Math.round(len * 16)), r || .05, 10, false), m);
    root.add(mesh); lines[sys].push(mesh);
  }
  function glow(sys, x, y, z, s) {
    var m = new THREE.Mesh(new THREE.SphereGeometry(s || .1, 16, 12), new THREE.MeshBasicMaterial({ color: SYS[sys].c, transparent: true, opacity: 0, depthWrite: false }));
    m.position.set(x, y, z); root.add(m); glows[sys].push(m);
  }
  var Z = -2.93; // Leitungen laufen knapp vor der Rückwand
  // Strom: Hausanschluss unter der Erde → Zählerschrank → Steigleitung → Decken → Lampen
  line("strom", [[2.6, -1.9, -8], [2.6, -1.9, -3.4], [2.6, -1.9, Z], [2.6, K + .6, Z]], .06);
  line("strom", [[3.15, K + 1.7, Z], [3.15, E - .6, Z], [3.15, E + 2.45, Z], [-3.85, E + 2.45, Z], [-3.85, E + 2.45, -1.75]]);
  line("strom", [[3.15, E + 2.45, Z], [3.15, O + 2.45, Z], [-3.85, O + 2.45, Z]]);
  [[2.2, E, -.9], [1.9, E, 1.6], [-1.3, E, .3], [-1.4, O, -.9], [2.4, O, -.5]].forEach(function (l) { line("strom", [[l[0], l[1] + 2.45, Z], [l[0], l[1] + 2.45, l[2]]], .035); });
  [[-.6, E], [3.8, E], [-2.6, O], [.6, O]].forEach(function (s) { line("strom", [[s[0], s[1] + 2.45, Z], [s[0], s[1] + .35, Z]], .03); glow("strom", s[0], s[1] + .35, Z + .05, .07); });
  glow("strom", 2.6, K + 1.25, -2.7, .12);
  // Wasser: kalt blau, warm rot
  line("wasser", [[.55, -2.1, -8], [.55, -2.1, Z], [.55, K + .85, Z]], .06);
  line("wasser", [[.55, K + 1.35, Z], [.55, O + .55, Z], [.4, O + .55, Z]]);
  line("wasser", [[.55, E + .55, Z], [1.55, E + .55, Z], [1.55, E + .95, Z]], .04);
  line("wasser", [[.55, O + .55, Z], [3.6, O + .55, Z]], .04);
  line("wasser", [[.55, K + .4, Z], [-2.9, K + .4, Z], [-2.9, K + .4, -2.5]], .045);
  var warm = 0xff3b4f;
  line("wasser", [[-2.9, K + 1.8, -2.5], [-2.9, K + 2.1, -2.5], [-2.9, K + 2.1, Z], [.8, K + 2.1, Z], [.8, O + .7, Z], [3.0, O + .7, Z]], .045, warm);
  line("wasser", [[.8, E + .65, Z], [1.7, E + .65, Z], [1.7, E + .95, Z]], .035, warm);
  line("wasser", [[1.95, O + .7, Z], [1.95, O + .95, Z]], .035, warm);
  glow("wasser", 1.6, E + 1.15, -2.82, .08); glow("wasser", 1.95, O + 1.0, -2.8, .08); glow("wasser", 3.0, O + .8, -2.8, .08);
  // Heizung: Wärmepumpe → Keller → Verteiler → Fußbodenheizung in EG und OG
  line("heizung", [[5.0, .5, -2.4], [4.6, .5, -2.4], [4.6, -1.0, -2.4], [3.95, -1.0, -2.4], [3.95, -.55, Z], [-1.9, -.55, Z], [-1.9, K + 1.8, -2.75]], .06);
  line("heizung", [[-2.3, -.55, Z], [-3.7, -.55, Z], [-3.7, O + .06, Z]], .05);
  function loop(y, x0, x1, z0, z1) {
    var pts = [[-3.7, y, Z], [-3.7, y, z0]], z = z0, dir = 1;
    while (z <= z1) { pts.push([dir > 0 ? x0 : x1, y, z]); pts.push([dir > 0 ? x1 : x0, y, z]); z += .5; dir = -dir; if (z <= z1) pts.push([dir > 0 ? x0 : x1, y, z]); }
    line("heizung", pts, .02);
  }
  loop(E + .045, -2.8, 3.8, -2.6, 2.6); loop(O + .045, -2.8, 3.8, -2.6, 2.6);
  // Photovoltaik: Dach → Dachboden → Steigleitung außen am Rand → Wechselrichter → Batterie
  line("pv", [[3.4, 6.25, -2.5], [3.4, 6.25, Z], [3.75, 6.25, Z], [3.75, K + 1.7, Z]], .05);
  line("pv", [[3.3, K + 1.15, Z], [3.3, K + .9, Z], [1.4, K + .9, Z], [1.4, K + 1.1, -2.7]], .05);
  line("pv", [[3.3, K + 1.4, Z], [3.1, K + 1.4, Z]], .04);
  glow("pv", 1.4, K + 1.15, -2.45, .1);
  // Abwasser: Bad und Küche → Fallleitung → Grundleitung unter dem Keller in den Kanal
  line("abwasser", [[3.1, O + .1, -2.6], [3.1, O - .05, Z], [.15, O - .12, Z], [.15, K - .1, Z], [.15, -2.75, -8]], .075);
  line("abwasser", [[1.0, O + .3, -2.72], [1.0, O - .05, Z]], .06);
  line("abwasser", [[1.95, O + .6, -2.75], [1.95, O - .02, Z]], .05);
  line("abwasser", [[1.6, E + .8, -2.75], [1.6, E + .25, Z], [.15, E + .2, Z]], .05);
  line("abwasser", [[-.65, K + .3, 1.9], [-.65, K - .05, 1.9], [-.65, K - .05, Z], [.15, K - .08, Z]], .05);

  // Steuerung: automatischer Ablauf, bis jemand die Legende antippt
  var legend = sec.querySelector(".h3d__legend"), info = sec.querySelector(".h3d__info");
  var state = {}; ORDER.forEach(function (k) { state[k] = { p: 0, on: 1 }; });
  var auto = !reduce, step = 0, stepT = 0, picked = null;
  legend.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    auto = false; picked = b.dataset.sys === picked ? null : b.dataset.sys; mark();
  });
  function mark() {
    var cur = picked || (auto ? ORDER[Math.min(step, ORDER.length - 1)] : null);
    legend.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", !picked || b.dataset.sys === picked ? "true" : "false"); });
    info.innerHTML = cur ? "<b>" + SYS[cur].n + "</b>" + SYS[cur].d : "<b>Alles zusammen</b>So sieht ein Haus aus, in dem Haustechnik Kofler alles aus einer Hand gemacht hat.";
  }
  function wanted(k) { if (picked) return k === picked; if (!auto) return true; return ORDER.indexOf(k) <= step; }
  if (reduce) ORDER.forEach(function (k) { state[k].p = 1; });
  mark();

  var drag = dragRotate(S.canvas, { speed: .006, minYaw: -1.2, maxYaw: .9 });
  var target = new THREE.Vector3(.3, 2.8, 0);
  S.onFrame(function (dt, t) {
    if (auto) {
      stepT += dt;
      if (step < ORDER.length && stepT > 3.4) { step++; stepT = 0; mark(); }
      if (step >= ORDER.length && stepT > 4) { step = 0; stepT = 0; ORDER.forEach(function (k) { state[k].p = 0; }); mark(); }
    }
    ORDER.forEach(function (k) {
      var st = state[k], w = wanted(k);
      st.p = w ? Math.min(1, st.p + dt / 2) : Math.max(0, st.p - dt * 2);
      st.on += ((picked && k !== picked ? 0 : 1) - st.on) * Math.min(1, dt * 5);
      lines[k].forEach(function (m) { var u = m.material.uniforms; u.uP.value = st.p * 1.001; u.uT.value = t; u.uA.value = st.on; m.visible = st.p > 0; });
      glows[k].forEach(function (m) { m.material.opacity = Math.max(0, (st.p - .8) * 5) * (.55 + Math.sin(t * 4) * .25); });
    });
    bulbM.emissiveIntensity = Math.max(0, (state.strom.p - .7) / .3) * 2.2;
    pvM.emissiveIntensity = state.pv.p * .08;
    var yaw = .3 + drag.yaw + (drag.touched || reduce ? 0 : Math.sin(t * .18) * .14), pitch = .05;
    var tv = Math.tan(cam.fov * Math.PI / 360), dist = Math.max((cam.aspect < 1 ? 7.4 : 8.6) / (tv * cam.aspect), 7.0 / tv);
    cam.position.set(target.x + Math.sin(yaw) * Math.cos(pitch) * dist, target.y + Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist);
    cam.lookAt(target);
  });
}
