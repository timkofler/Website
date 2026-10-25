// Der Hof in 3D: ein Mostviertler Vierkanthof als Modell auf einem Brett. Jedes Gebäude steht für einen Teil vom Shop
// (Hofladen, Mostkeller, Saftpresse, Brennerei, Bienenstand, Streuobstwiese, Versand). Zahlen, Stecknadeln und Infokarte
// kommen aus app.js über das Ereignis "bk:hof"; ein Tippen auf ein Gebäude meldet "bk:pick" zurück.
// Alles ist aus einfachen Grundformen gebaut, keine fremden Modelle oder Bilder.
import { reduce, mobile, webglOk, whenNear, loadThree, stage, dragRotate } from "/beispiele/_shared/stage3d.js?v=1";

var hof = document.getElementById("hof"), wrap = document.getElementById("hofStage");
if (hof && wrap && webglOk() && !reduce) whenNear(wrap, function () { loadThree().then(init).catch(fail); });

function fail() { var b = hof.querySelector('[data-view="2d"]'); hof.classList.add("no3d"); if (b) b.click(); }
function cl(v, a, b) { return v < a ? a : v > b ? b : v; }
function eio(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function isDark() { var t = document.documentElement.getAttribute("data-theme"); return t ? t === "dark" : !(window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches); }

function init(THREE) {
  var host = document.createElement("div"); host.className = "hof__gl";
  wrap.insertBefore(host, wrap.firstChild);
  var S = stage(THREE, host, { fov: 30, alpha: true, shadows: true, exposure: 1.05 });
  var scene = S.scene, cam = S.camera, V = THREE.Vector3;

  /* ---------- Materialien ---------- */
  var M = {};
  function mat(k, c, o) { o = o || {}; o.color = c; if (o.roughness == null) o.roughness = .85; return (M[k] = new THREE.MeshStandardMaterial(o)); }
  mat("wall", 0xf1e3c4); mat("sockel", 0xb98d58); mat("roof", 0xa94a32, { flatShading: true, side: THREE.DoubleSide }); mat("roofIn", 0x8c3a27, { flatShading: true });
  mat("wood", 0x9a6436); mat("woodD", 0x5a3a22); mat("hoop", 0x3a2a20, { metalness: .4, roughness: .5 }); mat("stone", 0xcfc3ad);
  mat("earth", 0x6b4a2e); mat("meadow", 0xd6b56e); mat("mound", 0xbe9a55, { flatShading: true }); mat("gravel", 0xe6d6b4); mat("road", 0x5e5048);
  mat("dash", 0xf3ead8); mat("trunk", 0x6e4a2c); mat("copper", 0xc7773d, { metalness: .65, roughness: .32 }); mat("brick", 0x8e4a34);
  mat("kraft", 0xc99a5f); mat("tape", 0xf2b54a); mat("van", 0xf6efe2, { roughness: .45 }); mat("glassD", 0x2a2f3a, { roughness: .2, metalness: .3 });
  mat("tyre", 0x24201d); mat("gold", 0xf2b54a, { roughness: .45, metalness: .2 }); mat("pear", 0xe8c14f, { roughness: .6 }); mat("hay", 0xe2c27a);
  mat("win", 0x3a3530, { emissive: 0xffb55a, emissiveIntensity: 0, roughness: .4 });
  mat("lamp", 0xfff2d0, { emissive: 0xffc070, emissiveIntensity: 0 });
  var LEAF = [mat("leaf1", 0xe9b44c, { flatShading: true }), mat("leaf2", 0xd9822b, { flatShading: true }), mat("leaf3", 0xc8553d, { flatShading: true }), mat("leaf4", 0xe7a23f, { flatShading: true })];
  var HIVE = [0xf2b54a, 0xe2738a, 0xf1e3c4, 0x8fa9c9].map(function (c, i) { return mat("hive" + i, c); });

  function box(w, h, d, m, x, y, z, p) {
    var b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x || 0, y || 0, z || 0);
    b.castShadow = b.receiveShadow = true; (p || scene).add(b); return b;
  }
  function cyl(rt, rb, h, m, x, y, z, p, seg) {
    var c = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 16), m); c.position.set(x || 0, y || 0, z || 0);
    c.castShadow = c.receiveShadow = true; (p || scene).add(c); return c;
  }
  function group(x, z, st) { var g = new THREE.Group(); g.position.set(x, 0, z); if (st) g.userData.st = st; scene.add(g); return g; }
  // Satteldach als Prisma: Länge entlang x, Giebel an den Enden
  function gable(w, d, h, m, p, y) {
    var s = new THREE.Shape(); s.moveTo(-d / 2, 0); s.lineTo(d / 2, 0); s.lineTo(0, h); s.lineTo(-d / 2, 0);
    var g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false }); g.translate(0, 0, -w / 2); g.rotateY(Math.PI / 2);
    var r = new THREE.Mesh(g, m); r.position.y = y; r.castShadow = r.receiveShadow = true; p.add(r); return r;
  }

  /* ---------- Brett mit Wiese, Weg und Straße ---------- */
  var BW = 15, BD = 11;
  var shape = new THREE.Shape(), rr = .9;
  shape.moveTo(-BW / 2 + rr, -BD / 2); shape.lineTo(BW / 2 - rr, -BD / 2); shape.quadraticCurveTo(BW / 2, -BD / 2, BW / 2, -BD / 2 + rr);
  shape.lineTo(BW / 2, BD / 2 - rr); shape.quadraticCurveTo(BW / 2, BD / 2, BW / 2 - rr, BD / 2); shape.lineTo(-BW / 2 + rr, BD / 2);
  shape.quadraticCurveTo(-BW / 2, BD / 2, -BW / 2, BD / 2 - rr); shape.lineTo(-BW / 2, -BD / 2 + rr); shape.quadraticCurveTo(-BW / 2, -BD / 2, -BW / 2 + rr, -BD / 2);
  var bg = new THREE.ExtrudeGeometry(shape, { depth: .6, bevelEnabled: true, bevelSize: .08, bevelThickness: .08, bevelSegments: 2, curveSegments: 10 });
  bg.rotateX(Math.PI / 2);
  var board = new THREE.Mesh(bg, [M.meadow, M.earth]); board.position.y = -.08; board.receiveShadow = true; scene.add(board);
  // Wiese mit leichter Musterung (Canvas), damit die Fläche nicht flach wirkt
  (function () {
    var c = document.createElement("canvas"); c.width = c.height = 256; var g = c.getContext("2d");
    g.fillStyle = "#d6b56e"; g.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 900; i++) { g.fillStyle = Math.random() < .5 ? "rgba(160,120,50,.16)" : "rgba(255,236,180,.2)"; g.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 4, 1.2); }
    var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(.18, .18);
    M.meadow.map = t; M.meadow.color.set(0xffffff); M.meadow.needsUpdate = true;
  })();
  var road = box(BW + .1, .04, 1.2, M.road, 0, .02, 4.3); road.castShadow = false;
  for (var dx = -7; dx < 7.2; dx += 1.1) box(.5, .045, .07, M.dash, dx, .025, 4.3).castShadow = false;
  box(1.1, .03, 2.5, M.gravel, 0, .015, 2.85).castShadow = false;
  box(2.6, .03, 1.2, M.gravel, 1.6, .016, 2.5).castShadow = false;

  /* ---------- Bäume ---------- */
  var trees = [];
  function tree(x, z, s, seed, p) {
    var g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); (p || scene).add(g);
    cyl(.07, .1, .9, M.trunk, 0, .45, 0, g, 7);
    var crown = new THREE.Group(); crown.position.y = .95; g.add(crown);
    var r = function (i) { return ((Math.sin(seed * 12.9 + i * 78.2) * 43758.5) % 1 + 1) % 1; };
    for (var i = 0; i < 4; i++) {
      var b = new THREE.Mesh(new THREE.IcosahedronGeometry(.36 + r(i) * .18, 0), LEAF[Math.floor(r(i + 9) * 4)]);
      b.position.set((r(i + 1) - .5) * .6, (r(i + 2) - .3) * .4, (r(i + 3) - .5) * .6); b.rotation.set(r(i) * 3, r(i + 4) * 3, 0);
      b.castShadow = true; crown.add(b);
    }
    for (var k = 0; k < 5; k++) {
      var pr = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), M.pear);
      var a = r(k + 20) * 6.28; pr.position.set(Math.cos(a) * .42, -.12 + r(k + 30) * .3, Math.sin(a) * .42); crown.add(pr);
    }
    trees.push({ c: crown, ph: seed }); return g;
  }

  /* ---------- Vierkanthof mit Hofladen ---------- */
  var HX = 0, HZ = -.7, A = 2.4, WD = 1.0, WH = 1.0;
  var vk = group(HX, HZ, "laden");
  box(2 * A, WH, WD, M.wall, 0, WH / 2, A - WD / 2, vk); box(2 * A, WH, WD, M.wall, 0, WH / 2, -A + WD / 2, vk);
  box(WD, WH, 2 * A - 2 * WD, M.wall, -A + WD / 2, WH / 2, 0, vk); box(WD, WH, 2 * A - 2 * WD, M.wall, A - WD / 2, WH / 2, 0, vk);
  [[0, A + .005, 2 * A + .01, .02], [0, -A - .005, 2 * A + .01, .02]].forEach(function (s) { box(s[2], .18, s[3], M.sockel, s[0], .09, s[1], vk); });
  box(.02, .18, 2 * A + .01, M.sockel, -A - .005, .09, 0, vk); box(.02, .18, 2 * A + .01, M.sockel, A + .005, .09, 0, vk);
  // Ringdach mit Walmkanten: außen, First und innen als drei Quadrate verbunden
  (function () {
    var o = A + .16, i = A - WD - .14, r = (o + i) / 2, y0 = WH, y1 = WH + .78, pos = [];
    function q(a, b, c, d) { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2], a[0], a[1], a[2], c[0], c[1], c[2], d[0], d[1], d[2]); }
    var sq = function (s, y) { return [[-s, y, s], [s, y, s], [s, y, -s], [-s, y, -s]]; }, O = sq(o, y0), R = sq(r, y1), I = sq(i, y0);
    for (var k = 0; k < 4; k++) { var n = (k + 1) % 4; q(O[k], O[n], R[n], R[k]); q(R[k], R[n], I[n], I[k]); }
    var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    var roof = new THREE.Mesh(g, M.roof); roof.castShadow = roof.receiveShadow = true; vk.add(roof);
    var cap = new THREE.Mesh(new THREE.BoxGeometry(2 * i + .02, .02, 2 * i + .02), M.gravel); cap.position.y = .01; cap.receiveShadow = true; vk.add(cap);
  })();
  // Fenster rundum, Tor mit Laden in der Mitte vorne
  var wins = [];
  function win(x, z, ry) { var w = box(.26, .3, .03, M.win, x, .58, z, vk); w.rotation.y = ry; w.castShadow = false; wins.push(w); }
  [-1.8, -1.15, 1.15, 1.8].forEach(function (x) { win(x, A + .01, 0); });
  [-1.7, -.85, 0, .85, 1.7].forEach(function (x) { win(x, -A - .01, 0); win(-A - .01, x, Math.PI / 2); win(A + .01, x, Math.PI / 2); });
  box(.78, .74, .04, M.woodD, 0, .37, A + .01, vk);
  [-.68, .68].forEach(function (x) { var w = box(.44, .36, .03, M.win, x, .5, A + .02, vk); w.castShadow = false; wins.push(w); });
  // Ladenschild über dem Tor
  (function () {
    var c = document.createElement("canvas"); c.width = 512; c.height = 128; var g = c.getContext("2d");
    g.fillStyle = "#f2b54a"; g.fillRect(0, 0, 512, 128); g.fillStyle = "#2a1606"; g.font = "600 72px Fraunces, Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("Hofladen", 256, 68);
    var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    var sign = new THREE.Mesh(new THREE.BoxGeometry(.92, .23, .04), [M.gold, M.gold, M.gold, M.gold, new THREE.MeshStandardMaterial({ map: t, roughness: .5 }), M.gold]);
    sign.position.set(0, .88, A + .06); sign.castShadow = true; vk.add(sign);
  })();
  tree(0, 0, 1.05, 3, vk);

  /* ---------- Mostkeller im Hang ---------- */
  var kel = group(-4.9, 2.1, "keller");
  var mound = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M.mound);
  mound.scale.set(1.5, .95, 1.15); mound.position.z = -.25; mound.castShadow = mound.receiveShadow = true; kel.add(mound);
  box(.9, .78, .26, M.stone, 0, .39, .78, kel); box(.56, .56, .05, M.woodD, 0, .3, .92, kel);
  function barrel(x, z, p, ry) {
    var pts = []; for (var i = 0; i <= 8; i++) { var t = i / 8; pts.push(new THREE.Vector2(.17 + Math.sin(t * Math.PI) * .04, t * .46)); }
    var b = new THREE.Mesh(new THREE.LatheGeometry(pts, 14), M.wood); b.position.set(x, 0, z); b.castShadow = true; p.add(b);
    [.1, .36].forEach(function (y) { var h = new THREE.Mesh(new THREE.TorusGeometry(.19, .012, 4, 18), M.hoop); h.rotation.x = Math.PI / 2; h.position.set(x, y, z); p.add(h); });
    if (ry != null) { b.rotation.z = Math.PI / 2; }
    return b;
  }
  barrel(-.65, 1.05, kel); barrel(.66, 1.0, kel); barrel(.98, 1.25, kel);

  /* ---------- Streuobstwiese ---------- */
  var gar = group(-4.6, -1.3, "garten");
  tree(-.9, .2, 1.1, 11, gar); tree(.6, -.25, 1.25, 17, gar); tree(-.3, -1.25, .95, 23, gar); tree(.95, .95, .85, 5, gar); tree(-1.25, -1.0, .8, 31, gar);
  cyl(.28, .28, .4, M.hay, .2, .2, .9, gar, 14).rotation.z = Math.PI / 2;
  // Bäume am Rand, nur zur Zierde
  [[-2.6, -4.6, .9, 2], [-1.0, -4.5, 1.05, 7], [1.3, -4.6, .9, 13], [2.8, -4.4, .8, 19], [6.4, 1.6, .85, 29], [6.4, -1.4, .8, 37], [-6.6, -3.6, .8, 41]].forEach(function (t) { tree(t[0], t[1], t[2], t[3]); });

  /* ---------- Bienenstand ---------- */
  var bee = group(-4.6, -3.9, "bienen");
  box(2.1, .06, .5, M.woodD, 0, .26, 0, bee); [-.9, .9].forEach(function (x) { box(.06, .26, .4, M.woodD, x, .13, 0, bee); });
  var hives = [];
  [-.72, -.24, .24, .72].forEach(function (x, i) {
    box(.4, .2, .36, HIVE[i], x, .39, 0, bee); box(.4, .2, .36, HIVE[i], x, .6, 0, bee); box(.46, .05, .42, M.woodD, x, .73, 0, bee);
    box(.1, .02, .02, M.woodD, x, .32, .19, bee); hives.push(new V(x - 4.6, .55, -3.9));
  });
  var bees = [], beeM = new THREE.MeshBasicMaterial({ color: 0x3a2a10 });
  for (var bi = 0; bi < (mobile ? 8 : 14); bi++) { var bm = new THREE.Mesh(new THREE.SphereGeometry(.028, 6, 4), beeM); scene.add(bm); bees.push({ m: bm, h: hives[bi % 4], a: bi * 1.7, r: .25 + (bi % 3) * .12, s: 1.5 + (bi % 5) * .3 }); }

  /* ---------- Saftpresse unter dem Flugdach ---------- */
  var pre = group(4.6, -.2, "presse");
  [[-.8, -.6], [.8, -.6], [-.8, .6], [.8, .6]].forEach(function (p) { cyl(.05, .05, 1.1, M.woodD, p[0], .55, p[1], pre, 6); });
  var rf1 = box(1.95, .05, .8, M.roof, 0, 1.25, -.33, pre); rf1.rotation.x = -.45; var rf2 = box(1.95, .05, .8, M.roof, 0, 1.25, .33, pre); rf2.rotation.x = .45;
  cyl(.42, .42, .08, M.wood, 0, .08, 0, pre, 18);
  for (var si = 0; si < 14; si++) { var a = si / 14 * Math.PI * 2, sl = box(.06, .42, .03, M.wood, Math.cos(a) * .3, .33, Math.sin(a) * .3, pre); sl.rotation.y = -a; }
  [.27, .43].forEach(function (y) { var h = new THREE.Mesh(new THREE.TorusGeometry(.31, .014, 4, 22), M.hoop); h.rotation.x = Math.PI / 2; h.position.y = y; pre.add(h); });
  box(.08, 1.0, .1, M.woodD, -.48, .5, 0, pre); box(.08, 1.0, .1, M.woodD, .48, .5, 0, pre); box(1.04, .1, .12, M.woodD, 0, .98, 0, pre);
  var screw = new THREE.Group(); screw.position.y = .62; pre.add(screw);
  cyl(.03, .03, .55, M.hoop, 0, .12, 0, screw, 8); var wheel = new THREE.Mesh(new THREE.TorusGeometry(.16, .02, 4, 16), M.hoop); wheel.rotation.x = Math.PI / 2; wheel.position.y = .12; screw.add(wheel);
  box(.32, .03, .03, M.hoop, 0, .12, 0, screw); cyl(.27, .27, .06, M.wood, 0, -.12, 0, screw, 16);
  function crate(x, z, p, ry) {
    var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; p.add(g);
    box(.42, .22, .3, M.wood, 0, .11, 0, g);
    for (var i = 0; i < 6; i++) { var pr = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), M.pear); pr.position.set(-.13 + (i % 3) * .13, .25, -.06 + Math.floor(i / 3) * .12); g.add(pr); }
  }
  crate(-.6, .95, pre, .2); crate(-.1, 1.05, pre, -.1); crate(.5, .98, pre, .15);

  /* ---------- Brennerei ---------- */
  var bre = group(4.5, -3.5, "brennerei");
  box(1.6, .95, 1.2, M.wall, 0, .475, 0, bre); box(1.62, .16, 1.22, M.sockel, 0, .08, 0, bre);
  gable(1.75, 1.36, .62, M.roof, bre, .95);
  box(.26, 1.4, .26, M.brick, .45, 1.2, -.2, bre);
  box(.5, .6, .03, M.woodD, -.3, .3, .61, bre); var bw = box(.26, .26, .03, M.win, .38, .58, .61, bre); wins.push(bw);
  var still = new THREE.Mesh(new THREE.SphereGeometry(.24, 14, 10), M.copper); still.position.set(.45, .3, .95); still.castShadow = true; bre.add(still);
  cyl(.05, .09, .3, M.copper, .45, .6, .95, bre, 10); var neck = cyl(.03, .03, .5, M.copper, .2, .72, .95, bre, 8); neck.rotation.z = 1.1;
  var smoke = [], smM = [];
  for (var k = 0; k < 6; k++) {
    var sm = new THREE.MeshStandardMaterial({ color: 0xf4ece0, transparent: true, opacity: 0, roughness: 1, depthWrite: false });
    var pu = new THREE.Mesh(new THREE.IcosahedronGeometry(.13, 1), sm); scene.add(pu); smoke.push({ m: pu, o: k / 6 }); smM.push(sm);
  }
  var chim = new V(4.95, 1.95, -3.7);

  /* ---------- Versand: Rampe, Pakete, Lieferwagen ---------- */
  var ver = group(2.45, 2.3, "versand");
  box(1.4, .26, .9, M.wood, 0, .13, 0, ver); box(1.44, .03, .94, M.woodD, 0, .275, 0, ver);
  var parcels = [], pGeo = new THREE.BoxGeometry(.3, .22, .26);
  function parcel() {
    var g = new THREE.Group(), b = new THREE.Mesh(pGeo, M.kraft); b.castShadow = true; g.add(b);
    var t = new THREE.Mesh(new THREE.BoxGeometry(.31, .225, .05), M.tape); g.add(t); return g;
  }
  function slot(i) { var layer = Math.floor(i / 4), j = i % 4; return new V(-.4 + (j % 2) * .34 + (layer % 2) * .05, .4 + layer * .23, -.16 + Math.floor(j / 2) * .3); }
  var VM = { body: M.van, glass: M.glassD, gold: M.gold.clone(), tyre: M.tyre, lamp: M.lamp.clone() };
  var van = new THREE.Group(); scene.add(van); van.userData.st = "versand";
  (function () {
    box(1.0, .5, .56, VM.body, -.1, .42, 0, van); box(.38, .36, .54, VM.body, .52, .35, 0, van);
    var ws = box(.04, .2, .46, VM.glass, .72, .44, 0, van); ws.rotation.z = -.35; box(.3, .16, .02, VM.glass, .5, .45, .275, van); box(.3, .16, .02, VM.glass, .5, .45, -.275, van);
    box(1.01, .07, .57, VM.gold, -.1, .36, 0, van);
    [[-.4, .28], [-.4, -.28], [.45, .28], [.45, -.28]].forEach(function (w) { var c = cyl(.12, .12, .08, VM.tyre, w[0], .12, w[1], van, 12); c.rotation.x = Math.PI / 2; });
    var hl = box(.02, .06, .1, VM.lamp, .72, .3, .18, van); var hr = box(.02, .06, .1, VM.lamp, .72, .3, -.18, van); hl.castShadow = hr.castShadow = false;
  })();
  var PARK = new V(3.6, 0, 4.15), vanT = 0, vanMats = [VM.body, VM.glass, VM.gold, VM.tyre, VM.lamp];
  van.position.copy(PARK);

  /* ---------- Laterne am Tor ---------- */
  cyl(.03, .04, 1.3, M.hoop, -.85, .65, 2.0, null, 6); var lan = box(.14, .18, .14, M.lamp, -.85, 1.36, 2.0); lan.castShadow = false;
  var lampL = new THREE.PointLight(0xffb866, 0, 5, 1.6); lampL.position.set(-.85, 1.3, 2.15); scene.add(lampL);

  /* ---------- Licht: Tag und Nacht ---------- */
  var hemi = new THREE.HemisphereLight(0xfff1d6, 0x6b4a2e, 1.1); scene.add(hemi);
  var sun = new THREE.DirectionalLight(0xffe2b0, 2.4); sun.position.set(6, 11, 6); sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  var sc = sun.shadow.camera; sc.left = -9; sc.right = 9; sc.top = 8; sc.bottom = -8; sc.near = 1; sc.far = 30; sun.shadow.bias = -.0006; sun.shadow.normalBias = .02;
  scene.add(sun);
  var DAY = { hs: new THREE.Color(0xfff1d6), hg: new THREE.Color(0x6b4a2e), hi: 1.15, sc: new THREE.Color(0xffe2b0), si: 2.5, sp: new V(6, 11, 6), w: 0, l: 0 };
  var NIGHT = { hs: new THREE.Color(0x8a94c8), hg: new THREE.Color(0x3a2a1c), hi: 1.0, sc: new THREE.Color(0xb8c6ff), si: 1.5, sp: new V(-6, 10, 5), w: 1.8, l: 7 };
  var dayK = isDark() ? 0 : 1, dayT = dayK;
  function applyLight(k) {
    hemi.color.copy(NIGHT.hs).lerp(DAY.hs, k); hemi.groundColor.copy(NIGHT.hg).lerp(DAY.hg, k); hemi.intensity = NIGHT.hi + (DAY.hi - NIGHT.hi) * k;
    sun.color.copy(NIGHT.sc).lerp(DAY.sc, k); sun.intensity = NIGHT.si + (DAY.si - NIGHT.si) * k; sun.position.copy(NIGHT.sp).lerp(DAY.sp, k);
    M.win.emissiveIntensity = NIGHT.w * (1 - k); M.lamp.emissiveIntensity = VM.lamp.emissiveIntensity = 2.2 * (1 - k); lampL.intensity = NIGHT.l * (1 - k);
  }
  applyLight(dayK);
  new MutationObserver(function () { dayT = isDark() ? 0 : 1; }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  if (window.matchMedia) matchMedia("(prefers-color-scheme: light)").addEventListener("change", function () { dayT = isDark() ? 0 : 1; });

  /* ---------- Stationen, Auswahl und Stecknadeln ---------- */
  var ST = {
    laden: { p: new V(0, 0, 1.75), a: new V(0, 2.35, 1.7), r: 1.0 }, keller: { p: new V(-4.9, 0, 2.3), a: new V(-4.9, 1.6, 2.1), r: 1.25 },
    garten: { p: new V(-4.6, 0, -1.3), a: new V(-5.2, 1.9, -.5), r: 1.6 }, bienen: { p: new V(-4.6, 0, -3.9), a: new V(-4.0, 1.2, -4.0), r: 1.2 },
    presse: { p: new V(4.6, 0, -.2), a: new V(4.6, 2.0, -.2), r: 1.2 }, brennerei: { p: new V(4.5, 0, -3.4), a: new V(4.2, 2.35, -3.4), r: 1.15 },
    versand: { p: new V(2.6, 0, 2.6), a: new V(2.45, 1.45, 2.3), r: 1.1 }
  };
  var ring = new THREE.Mesh(new THREE.RingGeometry(.92, 1.0, 56), new THREE.MeshBasicMaterial({ color: 0xffc965, transparent: true, opacity: .9, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = .05; scene.add(ring);
  var ring2 = new THREE.Mesh(new THREE.CircleGeometry(.98, 56), new THREE.MeshBasicMaterial({ color: 0xffc965, transparent: true, opacity: .14, depthWrite: false }));
  ring2.rotation.x = -Math.PI / 2; ring2.position.y = .04; scene.add(ring2);
  var B = window.BKhof || {}, sel = (B.sel && ST[B.sel]) ? B.sel : "laden";
  var CEN = new V(.3, 0, .9), focus = CEN.clone(), focusT = focus.clone(), zoom = 1, zoomT = 1;
  function select(id) { if (!ST[id]) return; sel = id; focusT.copy(ST[id].p).sub(CEN).multiplyScalar(.18).add(CEN); zoomT = .96; ring.scale.setScalar(.6); }
  select(sel);

  /* ---------- Kamera und Bedienung ---------- */
  var drag = dragRotate(S.canvas, { yaw: 0, minYaw: -1.05, maxYaw: 1.05, speed: .005 });
  var hint = document.getElementById("hofHint");
  var down = null;
  S.canvas.addEventListener("pointerdown", function (e) { down = { x: e.clientX, y: e.clientY }; });
  S.canvas.addEventListener("pointerup", function (e) {
    if (hint && drag.touched) hint.classList.add("is-off");
    if (!down || Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) > 7) { down = null; return; }
    down = null; var id = pick(e);
    if (id) { select(id); document.dispatchEvent(new CustomEvent("bk:pick", { detail: { id: id } })); }
  });
  S.canvas.addEventListener("pointermove", function (e) { if (!drag.active && e.pointerType === "mouse") S.canvas.style.cursor = pick(e) ? "pointer" : ""; });
  var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pick(e) {
    var r = S.canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    var hits = ray.intersectObjects(scene.children, true);
    for (var i = 0; i < hits.length; i++) { var o = hits[i].object; while (o) { if (o.userData.st) return o.userData.st; o = o.parent; } if (hits[i].object === board) break; }
    return null;
  }
  var aspect = 1.6;
  function placeCam(t) {
    var yaw = .42 + drag.yaw + (drag.touched ? 0 : Math.sin(t * .18) * .1), pitch = .92;
    var rad = 26 * zoom * Math.max(1, 1.3 / aspect);
    cam.position.set(focus.x + Math.sin(yaw) * Math.cos(pitch) * rad, Math.sin(pitch) * rad, focus.z + Math.cos(yaw) * Math.cos(pitch) * rad);
    cam.lookAt(focus.x, .2, focus.z);
  }
  var oldResize = S.resize;

  /* ---------- Stecknadeln und Effekte über der Szene ---------- */
  var pinBox = document.getElementById("hofPins"), pins = [];
  function readPins() { pins = Array.prototype.slice.call(pinBox.querySelectorAll("[data-hof]")); }
  // app.js baut die Nadeln bei jeder Änderung neu; sofort wieder hinsetzen, damit sie nicht aufblitzen
  readPins(); new MutationObserver(function () { readPins(); placePins(); }).observe(pinBox, { childList: true });
  var tmp = new V();
  function toScreen(v) { tmp.copy(v).project(cam); return { x: (tmp.x + 1) / 2 * host.clientWidth, y: (1 - tmp.y) / 2 * host.clientHeight, z: tmp.z }; }
  function placePins() {
    for (var i = 0; i < pins.length; i++) {
      var st = ST[pins[i].dataset.hof]; if (!st) continue;
      var s = toScreen(st.a); pins[i].style.transform = "translate(" + s.x.toFixed(1) + "px," + s.y.toFixed(1) + "px) translate(-50%,-100%)";
      if (!pins[i].classList.contains("is-ready")) pins[i].classList.add("is-ready");
    }
  }
  var fx = [];
  function floatLabel(text, at) {
    var d = document.createElement("div"); d.className = "hof__fx"; d.textContent = text; d.setAttribute("aria-hidden", "true"); wrap.appendChild(d);
    fx.push({ el: d, p: at.clone(), t0: performance.now() });
  }

  /* ---------- Pakete, Bestellungen, Lieferwagen ---------- */
  var want = 0, goN = 0, flights = [];
  function setStack(n) {
    want = Math.min(n, 8);
    while (parcels.length < want) { var p = parcel(), s = slot(parcels.length); p.position.copy(s); p.scale.setScalar(.01); p.userData.k = 0; p.userData.out = false; ver.add(p); parcels.push(p); }
    parcels.forEach(function (p, i) { p.userData.out = i >= want; });
  }
  function orderFx(d) {
    var from = (d.from && d.from.length ? d.from : ["laden"]).filter(function (id) { return ST[id]; }), dest = new V(2.45, .9, 2.3);
    from.forEach(function (id, i) {
      var orb = new THREE.Mesh(new THREE.SphereGeometry(.13, 14, 10), new THREE.MeshStandardMaterial({ color: 0xffd98a, emissive: 0xf2b54a, emissiveIntensity: 1.4 }));
      var a = ST[id].a.clone(); a.y -= .5; orb.position.copy(a); scene.add(orb);
      flights.push({ m: orb, a: a, b: dest, t: -i * .25 });
    });
    setTimeout(function () { floatLabel("+ " + d.total, new V(2.45, 1.2, 2.3)); }, reduce ? 0 : 900);
  }
  function applyState(s) { if (!s) return; setStack(s.pack || 0); goN = s.go || 0; }
  applyState(B.state);
  document.addEventListener("bk:hof", function (e) {
    var d = e.detail;
    if (d.type === "sel") select(d.id);
    else if (d.type === "state") { applyState(d); if (d.sel && d.sel !== sel) select(d.sel); }
    else if (d.type === "order") orderFx(d);
    else if (d.type === "view" && d.view === "3d") setTimeout(oldResize, 30);
  });
  // Lieferwagen: fährt nach rechts weg, kommt von links zurück, solange etwas "unterwegs" ist
  vanMats.forEach(function (m) { m.transparent = true; });
  function vanStep(dt) {
    if (vanT === 0 && !goN) { van.position.copy(PARK); return; }
    vanT += dt; var c = 13, t = vanT % c;
    if (vanT > c && !goN) { vanT = 0; return; }
    var x, op = 1;
    if (t < 1.2) x = PARK.x;
    else if (t < 4.2) { var k = eio((t - 1.2) / 3); x = PARK.x + k * 4.5; }
    else if (t < 7.5) { x = 99; }
    else if (t < 11) { var k2 = eio((t - 7.5) / 3.5); x = -8 + k2 * (PARK.x + 8); }
    else x = PARK.x;
    if (x === 99) { van.visible = false; return; }
    van.visible = true; van.position.set(x, 0, PARK.z);
    var edge = BW / 2 - .6; op = cl((edge + .6 - Math.abs(x)) / .9, 0, 1);
    vanMats.forEach(function (m) { m.opacity = op; });
  }

  /* ---------- Bild für Bild ---------- */
  var ro = function () { aspect = (host.clientWidth || 1) / (host.clientHeight || 1); };
  ro(); if ("ResizeObserver" in window) new ResizeObserver(ro).observe(host);
  var shown = false;
  S.onFrame(function (dt, t) {
    if (!shown) { shown = true; requestAnimationFrame(function () { hof.classList.add("has3d"); }); }
    dayK += (dayT - dayK) * Math.min(1, dt * 3); applyLight(dayK);
    focus.lerp(focusT, Math.min(1, dt * 3)); zoom += (zoomT - zoom) * Math.min(1, dt * 3);
    placeCam(t);
    var st = ST[sel]; ring.position.x = ring2.position.x = st.p.x; ring.position.z = ring2.position.z = st.p.z;
    var rs = ring.scale.x + (st.r - ring.scale.x) * Math.min(1, dt * 6); ring.scale.setScalar(rs); ring2.scale.setScalar(rs);
    ring.material.opacity = .65 + Math.sin(t * 3) * .25;
    trees.forEach(function (tr) { tr.c.rotation.z = Math.sin(t * 1.1 + tr.ph) * .035; tr.c.rotation.x = Math.cos(t * .9 + tr.ph) * .025; });
    screw.rotation.y += dt * .6;
    bees.forEach(function (b) { b.a += dt * b.s; b.m.position.set(b.h.x + Math.cos(b.a) * b.r, b.h.y + .25 + Math.sin(b.a * 2.3) * .12, b.h.z + Math.sin(b.a) * b.r * .8 + .2); });
    smoke.forEach(function (s) {
      var k = (t * .22 + s.o) % 1; s.m.position.set(chim.x + Math.sin(k * 5 + s.o * 6) * .12 + k * .5, chim.y + k * 1.5, chim.z - k * .2);
      s.m.scale.setScalar(.5 + k * 1.6); s.m.material.opacity = Math.sin(k * Math.PI) * .55;
    });
    parcels.forEach(function (p, i) {
      p.userData.k = cl(p.userData.k + dt * (p.userData.out ? -3 : 2.4), 0, 1);
      var k = p.userData.k, b = p.userData.out ? k : 1 - Math.pow(1 - k, 3) * Math.cos(k * 6);
      p.scale.setScalar(Math.max(.001, b)); p.visible = k > .002;
    });
    for (var i = parcels.length - 1; i >= 0; i--) if (parcels[i].userData.out && parcels[i].userData.k <= 0) { ver.remove(parcels[i]); parcels.splice(i, 1); }
    for (var f = flights.length - 1; f >= 0; f--) {
      var fl = flights[f]; fl.t += dt / .9; var k3 = cl(fl.t, 0, 1);
      fl.m.visible = fl.t > 0; fl.m.position.lerpVectors(fl.a, fl.b, eio(k3)); fl.m.position.y += Math.sin(k3 * Math.PI) * 1.4;
      if (fl.t >= 1) { scene.remove(fl.m); fl.m.geometry.dispose(); fl.m.material.dispose(); flights.splice(f, 1); }
    }
    vanStep(dt);
    placePins();
    for (var x = fx.length - 1; x >= 0; x--) {
      var e = fx[x]; e.t = (performance.now() - e.t0) / 1000; var s = toScreen(e.p);
      e.el.style.transform = "translate(" + s.x.toFixed(1) + "px," + (s.y - e.t * 40).toFixed(1) + "px) translate(-50%,-100%)";
      e.el.style.opacity = String(cl(e.t < .3 ? e.t / .3 : 1 - (e.t - 1.4) / .6, 0, 1));
      if (e.t > 2) { e.el.remove(); fx.splice(x, 1); }
    }
  });
}
