// Birnstoff: eine 3D-Dose fährt die ganze Seite mit. Im Verkauf wechselt Wischen die Sorte (die Farbe läuft von unten in die Dose),
// dann taucht sie in Most ein und kommt in neuer Farbe heraus, Rauch zieht drüber und darunter wird sie zur goldenen Reserve.
// Alles hängt an einem rAF-Takt; die Lage der Dose wird zwischen Haltepunkten entlang der Scrollstrecke weich übergeblendet.
import { reduce, mobile, webglOk, loadThree } from "/beispiele/_shared/stage3d.js";

document.documentElement.classList.add("cx");
var fine = !!(window.matchMedia && matchMedia("(pointer: fine)").matches) && !mobile;
var BAR = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--bar")) || 45;
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function damp(cur, to, k, dt) { return cur + (to - cur) * (1 - Math.exp(-k * dt)); }
function smooth(t) { return t * t * (3 - 2 * t); }
function easeIO(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

var SORT = [
  { k: "pur", name: "Pur", sub: "Birne · spritzig · 4,5 % vol", price: "€ 2,90", c: "#d4f53c", desc: "Der Klassiker: frisch gepresste Mostbirne, kalt vergoren, mit feiner Perlage. Schmeckt nach Herbst im Mostviertel." },
  { k: "holler", name: "Holler", sub: "Birne · Holunderblüte · 4,0 % vol", price: "€ 2,90", c: "#c3a0ff", desc: "Mit Holunderblüten aus dem eigenen Garten angesetzt. Blumig, leicht und wie gemacht für laue Abende." },
  { k: "herb", name: "Herb", sub: "Mostbirne · trocken · 5,5 % vol", price: "€ 3,20", c: "#ffb04a", desc: "Aus Speckbirne und Dorschbirne, ganz trocken ausgebaut. Für alle, die Most mögen, wie er früher war." },
  { k: "null", name: "Null", sub: "Alkoholfrei · 0,0 % vol", price: "€ 2,60", c: "#79e6ff", desc: "Alles vom Pur, nur ohne Alkohol. Für die Mittagspause, nach dem Sport und für die Heimfahrt." }
];
var GLOW = { pur: "#d4f53c", holler: "#c3a0ff", herb: "#ffb04a", null: "#79e6ff", reserve: "#f3c56a" };

// ---------- Weiches Scrollen (nur Maus/Trackpad am Computer) ----------
// Das Mausrad setzt ein Ziel, die Seite gleitet dorthin. Tastatur, Scrollbalken und Anker funktionieren weiter.
var sc = { y: scrollY, to: scrollY, on: fine && !reduce, busy: false };
function maxY() { return document.documentElement.scrollHeight - innerHeight; }
if (sc.on) {
  addEventListener("wheel", function (e) {
    if (e.ctrlKey || e.defaultPrevented) return;
    e.preventDefault();
    var d = e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? innerHeight : 1);
    if (!sc.busy) sc.y = sc.to = scrollY;
    sc.to = clamp(sc.to + d, 0, maxY()); sc.busy = true;
  }, { passive: false });
  addEventListener("scroll", function () { if (!sc.busy) sc.y = sc.to = scrollY; }, { passive: true });
}
document.addEventListener("click", function (e) {
  var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
  var id = a.getAttribute("href"), el = id === "#start" ? document.body : document.querySelector(id); if (!el) return;
  e.preventDefault();
  var to = clamp(el === document.body ? 0 : el.getBoundingClientRect().top + scrollY - BAR, 0, maxY());
  if (sc.on) { if (!sc.busy) sc.y = scrollY; sc.to = to; sc.busy = true; }
  else scrollTo({ top: to, behavior: reduce ? "auto" : "smooth" });
});

// ---------- Einblenden ----------
var ins = $$(".hero .copy > *, .most .copy > *, .finale > *, .shop__info, .shop__buy");
ins.forEach(function (el, k) { el.setAttribute("data-in", ""); el.style.transitionDelay = (k % 4) * .08 + "s"; });
if (reduce || !("IntersectionObserver" in window)) ins.forEach(function (el) { el.classList.add("is-in"); });
else {
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }); }, { threshold: .2 });
  ins.forEach(function (el) { io.observe(el); });
}

// ---------- Verkauf: Sorte wählen ----------
var shop = $("#sorten"), pick = { i: 0, from: 0, to: 0, t0: -9, dir: 1 };
var sw = { name: $("#shopName"), sub: $("#shopSub"), desc: $("#shopDesc"), price: $("#shopPrice") }, dots = $$(".shop__dots button"), shopImg = $("#shopImg");
Object.keys(sw).forEach(function (k) { sw[k].classList.add("swap"); });
function choose(i, dir) {
  i = (i + SORT.length) % SORT.length; if (i === pick.i) return;
  var now = performance.now() / 1000;
  // Mitten in einem Wechsel startet der nächste von der Sorte, die gerade einläuft.
  pick.from = pick.t0 > now - .95 ? pick.to : pick.i; pick.to = i; pick.i = i; pick.t0 = now; pick.dir = dir || (i > pick.from ? 1 : -1);
  var d = SORT[i];
  dots.forEach(function (b, k) { b.setAttribute("aria-selected", k === i ? "true" : "false"); });
  Object.keys(sw).forEach(function (k) { sw[k].classList.add("is-out"); });
  clearTimeout(choose._t);
  choose._t = setTimeout(function () {
    sw.name.textContent = d.name; sw.sub.textContent = d.sub; sw.desc.textContent = d.desc; sw.price.textContent = d.price;
    shop.style.setProperty("--c", d.c); if (shopImg) shopImg.src = "/beispiele/cider/bilder/" + d.k + ".webp";
    Object.keys(sw).forEach(function (k) { sw[k].classList.remove("is-out"); });
  }, 240);
}
$$(".shop .rbtn").forEach(function (b) { b.addEventListener("click", function () { choose(pick.i + +b.dataset.dir, +b.dataset.dir); }); });
dots.forEach(function (b, k) { b.addEventListener("click", function () { choose(k); }); });
(function () {
  var sx = 0, sy = 0, on = false;
  shop.addEventListener("pointerdown", function (e) { if (e.target.closest("a,button")) return; on = true; sx = e.clientX; sy = e.clientY; });
  shop.addEventListener("pointerup", function (e) {
    if (!on) return; on = false;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) choose(pick.i + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
  shop.addEventListener("pointercancel", function () { on = false; });
  addEventListener("keydown", function (e) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    var r = shop.getBoundingClientRect(); if (r.top > innerHeight * .5 || r.bottom < innerHeight * .5) return;
    choose(pick.i + (e.key === "ArrowRight" ? 1 : -1), e.key === "ArrowRight" ? 1 : -1);
  });
})();

// ---------- Haltepunkte der Dose entlang der Scrollstrecke ----------
// x/y: Lage in Bruchteilen der halben Bildbreite/-höhe (xm/ym am Handy), s/sm: Größe, rx/rz: Neigung.
// rings/ped/sign/smoke/mist/core: Stärke der Effekte, surf: Most-Oberfläche (Bruchteil der halben Höhe), dive: wie tief die Dose eintaucht.
// b0..b3: Hintergründe Wald, Laden, Keller, Spot.
var KEYS = ["x", "y", "xm", "ym", "s", "sm", "rx", "rz", "rings", "ped", "sign", "smoke", "mist", "core", "surf", "surfm", "dive", "b0", "b1", "b2", "b3"];
var OFF = -2.4;
function P(o, base) { var r = {}; KEYS.forEach(function (k) { r[k] = o[k] != null ? o[k] : base ? base[k] : 0; }); return r; }
var HERO = P({ x: .42, y: 0, xm: 0, ym: -.32, s: 1.12, sm: 1, rx: .1, rz: -.12, rings: 1, mist: 1, core: 1, surf: OFF, surfm: OFF, b0: 1 });
var SHOP = P({ x: 0, y: .04, xm: 0, ym: -.02, s: 1, sm: .92, rx: .06, rz: 0, ped: 1, mist: .3, core: .55, surf: OFF, surfm: OFF, b1: 1 });
var MOST = P({ x: .4, y: .08, xm: 0, ym: -.46, s: 1, sm: .72, rx: .08, rz: .05, mist: .15, core: .2, surf: OFF, surfm: OFF, b2: 1 });
var MOSTUP = P({ surf: -.8, surfm: -.84 }, MOST), MOSTDOWN = P({ surf: -.8, surfm: -.84, dive: 1, rz: -.04 }, MOST);
var RAUCH = P({ x: .42, y: 0, xm: 0, ym: -.42, s: 1.05, sm: .8, rx: .06, rz: 0, mist: .2, core: .2, surf: OFF, surfm: OFF, b2: .3, b3: .7 });
var SPOT = P({ b3: 1, b2: 0 }, RAUCH);
var KAUF = P({ x: .5, y: 0, xm: 0, ym: .5, s: .92, sm: .62, rx: .1, rz: -.14, rings: .7, mist: .6, core: .7, surf: OFF, surfm: OFF, b0: 1 });
var stops = [], marks = {};
function measure() {
  var vh = innerHeight - BAR, m = maxY();
  function top(id) { return $(id).getBoundingClientRect().top + scrollY - BAR; }
  var most = top("#most"), mostS = $("#most").offsetHeight - vh, rauch = top("#reserve"), rauchS = $("#reserve").offsetHeight - vh;
  marks = { dipIn: most + mostS * .22, dipMid: most + mostS * .5, smoke: rauch + rauchS * .45, rauchEnd: rauch + rauchS, kauf: Math.min(top("#kaufen"), m), b: rauch + rauchS * .55 };
  stops = [
    [0, HERO], [top("#sorten"), SHOP], [most, MOST], [marks.dipIn, MOSTUP], [marks.dipMid, MOSTDOWN], [most + mostS * .8, MOSTUP], [most + mostS, MOST],
    [rauch, RAUCH], [marks.smoke, P({ smoke: 1 }, SPOT)], [rauch + rauchS * .62, P({ smoke: .3, sign: .8 }, SPOT)],
    [rauch + rauchS * .8, P({ sign: 1 }, SPOT)], [marks.rauchEnd, P({ sign: 1 }, SPOT)], [marks.kauf, KAUF]
  ];
}
measure(); addEventListener("resize", measure); addEventListener("load", measure);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
var q = P({});
function pose(y) {
  var i = 0; while (i < stops.length - 2 && y >= stops[i + 1][0]) i++;
  var a = stops[i], b = stops[i + 1], f = b[0] > a[0] ? smooth(clamp((y - a[0]) / (b[0] - a[0]), 0, 1)) : 1;
  if (y < a[0]) f = 0;
  for (var k = 0; k < KEYS.length; k++) q[KEYS[k]] = a[1][KEYS[k]] + (b[1][KEYS[k]] - a[1][KEYS[k]]) * f;
  return q;
}

// ---------- Ein Takt für alles ----------
var rauchSec = $("#reserve"), prog = $("#prog"), bgs = $$(".bg__l"), gl = null, last = 0, S = { y: scrollY, b: false };
var ptr = { x: 0, y: 0, px: 0, py: 0 };
if (fine) addEventListener("pointermove", function (e) { ptr.x = e.clientX / innerWidth - .5; ptr.y = e.clientY / innerHeight - .5; }, { passive: true });
function tick(t) {
  var raw = last ? (t - last) / 1000 : .016, dt = Math.min(.05, raw); last = t;
  if (sc.on && sc.busy) {
    sc.y = damp(sc.y, sc.to, 9, dt);
    if (Math.abs(sc.to - sc.y) < .5) { sc.y = sc.to; sc.busy = false; }
    window.scrollTo(0, sc.y);
  }
  var y = scrollY;
  // Am Handy scrollt die Seite nativ; die Dose folgt leicht gedämpft, damit Wischer nicht ruckeln.
  S.y = reduce ? y : damp(S.y, y, fine ? 30 : 14, Math.min(.5, raw));
  var p = pose(S.y);
  for (var k = 0; k < 4; k++) { var o = p["b" + k].toFixed(3); if (bgs[k]._o !== o) { bgs[k]._o = o; bgs[k].style.opacity = o; } }
  var b = y >= marks.b; if (b !== S.b) { S.b = b; rauchSec.classList.toggle("is-b", b); }
  prog.style.transform = "scaleX(" + (y / Math.max(1, maxY())).toFixed(4) + ")";
  if (gl) gl(dt, t / 1000, p);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// Welche Sorten die Dose gerade zeigt: a oben, b unten, getrennt bei der Höhe fill (Weltkoordinate).
// geo = { top, bottom, surf } in Weltkoordinaten.
function labels(y, t, geo) {
  var user = SORT[pick.i].k, dip = user === "herb" ? "pur" : "herb";
  var pk = clamp((t - pick.t0) / .9, 0, 1), span = geo.top - geo.bottom + .1;
  if (y < marks.dipIn) {
    if (pk < 1) return { a: SORT[pick.from].k, b: SORT[pick.to].k, fill: geo.bottom - .05 + span * easeIO(pk), band: 1 };
    return { a: user, b: user, fill: -99, band: 0 };
  }
  // Eintauchen: was unter der Oberfläche ist, hat schon die neue Farbe; ab der tiefsten Stelle die ganze Dose.
  if (y < marks.dipMid) return { a: user, b: dip, fill: geo.surf, band: .6 };
  if (y < marks.smoke) return { a: dip, b: dip, fill: -99, band: 0 };
  // Unter dem dichtesten Rauch wird sie golden.
  if (y < marks.rauchEnd) return { a: "reserve", b: "reserve", fill: -99, band: 0 };
  // Auf dem Weg zum Kaufen füllt sie sich wieder mit der gewählten Sorte.
  var u = clamp((y - marks.rauchEnd) / Math.max(1, marks.kauf - marks.rauchEnd), 0, 1);
  return { a: "reserve", b: user, fill: geo.bottom - .05 + span * smooth(u), band: u > 0 && u < 1 ? 1 : 0 };
}

// ---------- 3D ----------
if (!reduce && webglOk()) {
  var start = function () { Promise.all([loadThree(), import("/beispiele/cider/dose.js?v=2"), import("/beispiele/_shared/vendor/three-r180/RoomEnvironment.js")]).then(function (m) { build(m[0], m[1], m[2].RoomEnvironment); }).catch(function () {}); };
  if (document.readyState === "complete") start(); else addEventListener("load", start);
}

function build(THREE, D, RoomEnvironment) {
  D.fontsReady().then(function () {
    var host = document.getElementById("gl");
    var R = new THREE.WebGLRenderer({ antialias: !mobile, alpha: true, powerPreference: "high-performance" });
    var dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.25);
    R.setPixelRatio(dpr); R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.1;
    host.appendChild(R.domElement);
    var scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, .1, 60);
    cam.position.set(0, .12, 6); cam.lookAt(0, 0, 0);
    var pm = new THREE.PMREMGenerator(R); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .55; pm.dispose();

    var key = new THREE.DirectionalLight("#ffffff", 1.6); key.position.set(-3, 2, 4); scene.add(key);
    var rimL = new THREE.DirectionalLight("#d4f53c", 5); rimL.position.set(-4, 1, -3); scene.add(rimL);
    var rimR = new THREE.DirectionalLight("#d4f53c", 4); rimR.position.set(4, 2.5, -2.5); scene.add(rimR);
    var spot = new THREE.SpotLight("#fff1d2", 0, 9, .42, .6, 1); spot.position.set(0, 4.2, .4); scene.add(spot); scene.add(spot.target);

    var col = new THREE.Color("#d4f53c"), want = new THREE.Color(), gold = new THREE.Color("#f3c56a"), white = new THREE.Color("#fff6d8");
    var rig = new THREE.Group(); scene.add(rig);
    var tilt = new THREE.Group(); rig.add(tilt);
    var dose = D.can(THREE, "pur", { seg: mobile ? 56 : 80, q: mobile ? .5 : .75 }); tilt.add(dose);
    var dot = D.dotTexture(THREE), smokeT = D.smokeTexture(THREE, 5), smokeT2 = D.smokeTexture(THREE, 23);
    // Restliche Etiketten im Leerlauf vorbereiten, eins nach dem anderen.
    var rest = ["holler", "herb", "null", "reserve"];
    (function next() { if (!rest.length) return; dose.userData.preload(rest.shift(), R); (window.requestIdleCallback || function (f) { setTimeout(f, 200); })(next); })();

    var coreM = new THREE.SpriteMaterial({ map: dot, color: "#d4f53c", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .5 });
    var core = new THREE.Sprite(coreM); core.scale.set(3.4, 3.4, 1); core.position.z = -.9; rig.add(core);

    var rings = new THREE.Group(); rig.add(rings);
    [[1.02, .42, .55, .12, .32, 1], [1.08, .36, -.62, .25, .26, 2], [.86, .86, .18, 1.32, .42, 1]].forEach(function (r, k) {
      var tube = D.glowTube(THREE, D.ellipse(THREE, r[0], r[1]), { closed: true, r: .015, speed: r[4], tail: 3, heads: r[5], base: .2, halo: .45, seg: mobile ? 160 : 240 });
      tube.rotation.set(r[3], k * .9, r[2]); rings.add(tube);
    });
    // Sockel im Laden: Leuchtring am Boden, weicher Schein, Lichtkegel von oben.
    var ped = new THREE.Group(); rig.add(ped);
    var pedRing = D.glowTube(THREE, D.ellipse(THREE, .62, .62), { closed: true, r: .012, speed: .08, tail: 1.4, heads: 2, base: .5, halo: .35, seg: 160 });
    pedRing.position.y = -.86; ped.add(pedRing);
    var pedFloorM = new THREE.MeshBasicMaterial({ map: dot, color: "#d4f53c", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .4 });
    var pedFloor = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.8), pedFloorM); pedFloor.rotation.x = -Math.PI / 2; pedFloor.position.y = -.87; ped.add(pedFloor);
    var pedBeam = D.beam(THREE, { h: 3.6, top: .05, bottom: .85, color: "#ffffff" }); pedBeam.position.y = .95; ped.add(pedBeam);
    // Reserve: goldener Bodenring, flackernde Krone, Lichtkegel.
    var sign = new THREE.Group(); rig.add(sign);
    var floorRing = D.glowTube(THREE, D.ellipse(THREE, .78, .78), { closed: true, r: .014, speed: .12, tail: 1.6, heads: 3, base: .55, halo: .3, seg: 180, color: "#f3c56a" });
    floorRing.position.y = -.86; sign.add(floorRing);
    var crown = D.glowTube(THREE, D.ellipse(THREE, .58, .58), { closed: true, r: .008, speed: .6, tail: 1.2, heads: 5, base: .35, flick: 1, halo: .3, seg: 200, color: "#fff0c4" });
    crown.position.y = .32; crown.rotation.set(.18, 0, -.12); sign.add(crown);
    var floorM = new THREE.MeshBasicMaterial({ map: dot, color: "#f3c56a", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .5 });
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), floorM); floor.rotation.x = -Math.PI / 2; floor.position.y = -.87; sign.add(floor);
    var cone = D.beam(THREE, { h: 3.6, top: .05, bottom: 1.05 }); cone.position.y = .95; sign.add(cone);

    // Most: liegt in Weltkoordinaten (nicht an der Dose), die Seite hebt und senkt die Oberfläche.
    var most = D.liquid(THREE, { w: 18, bubbles: mobile ? 110 : 200 }); scene.add(most);
    var MU = most.userData.u;

    // Leuchtnebel (additiv) und Rauch (deckend, zieht vor der Dose vorbei).
    var mist = []; [[-1.2, -.6, -1.6, 4.6], [1.3, -.9, -2, 5.2], [0, -1.2, -1, 4], [-.4, .6, -2.6, 5.6]].forEach(function (m, k) {
      var mat = new THREE.SpriteMaterial({ map: smokeT, color: "#d4f53c", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .3 });
      var s = new THREE.Sprite(mat); s.position.set(m[0], m[1], m[2]); s.scale.set(m[3], m[3] * .7, 1); s.userData.k = k; mist.push(s); rig.add(s);
    });
    var smoke = []; for (var i = 0; i < (mobile ? 7 : 10); i++) {
      var mat = new THREE.SpriteMaterial({ map: i % 2 ? smokeT : smokeT2, color: "#8a8378", transparent: true, depthWrite: false, opacity: 0 });
      var s = new THREE.Sprite(mat); s.userData = { a: i * 2.1, r: .7 + (i % 4) * .4, z: .2 + (i % 3) * .45, s: 2.4 + (i % 5) * .6, sp: .12 + (i % 3) * .05 };
      smoke.push(s); rig.add(s);
    }
    var sp = D.sparks(THREE, mobile ? 120 : 280, { w: 7, h: 5, d: 4 }); scene.add(sp);

    function setGroup(g, a, c, t) {
      g.visible = a > .005; if (!g.visible) return;
      g.traverse(function (o) {
        if (!o.userData.mats) return;
        o.userData.mats.forEach(function (m, k) { m.uniforms.uAlpha.value = o.userData.k[k] * a; m.uniforms.uT.value = t; if (c) m.uniforms.uColor.value.copy(c); });
      });
    }

    var halfH = Math.tan(15 * Math.PI / 180) * 6, aspect = 1, W = 0, H = 0;
    function size() {
      var w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
      // Am Handy ändert die ein- und ausfahrende Adressleiste die Höhe; nur bei echten Änderungen neu aufbauen.
      if (w === W && Math.abs(h - H) < 120) return;
      W = w; H = h; R.setSize(w, h, false); aspect = w / h; cam.aspect = aspect; cam.updateProjectionMatrix();
      sp.material.uniforms.uPx.value = h * R.getPixelRatio(); MU.uPx.value = h * R.getPixelRatio();
    }
    size(); addEventListener("resize", size);

    var intro = 0, frames = 0, slow = 0, t0 = performance.now() / 1000, wasUnder = false, ripT = 9, cssKey = "";
    var geo = { top: 0, bottom: 0, surf: -99 };
    gl = function (dt, t, q) {
      size();
      var narrow = aspect < .9, halfW = halfH * aspect;
      intro = Math.min(1, intro + dt / 1.6); var ie = 1 - Math.pow(1 - intro, 3);
      ptr.px = damp(ptr.px, ptr.x, 4, dt); ptr.py = damp(ptr.py, ptr.y, 4, dt);

      var scl = (narrow ? q.sm * clamp(aspect * 1.55, .62, 1) : q.s) * (.86 + .14 * ie);
      var cy = (narrow ? q.ym : q.y) * halfH - q.dive * (narrow ? 1.1 : 1.5) * halfH - (1 - ie) * 1.2 + Math.sin(t * .9) * .035;
      var cx = (narrow ? q.xm : q.x) * halfW + ptr.px * .12;
      // Am Handy steht die Dose beim Kaufen über dem Text; scrollt man weiter zum Fußbereich, wandert sie mit dem Inhalt nach oben.
      if (narrow && S.y > marks.kauf) cy += (S.y - marks.kauf) * 2 * halfH / H;
      rig.position.set(cx, cy, 0); rig.scale.setScalar(scl);
      tilt.rotation.set(q.rx + ptr.py * .12, 0, q.rz);
      // Beim Sortenwechsel dreht sich die Dose einmal, während die neue Farbe von unten hochläuft.
      var pk = clamp((t - pick.t0) / .9, 0, 1);
      dose.rotation.y = -.35 + Math.sin(t * .35) * .45 + ptr.px * .5 + (pk < 1 ? pick.dir * Math.PI * 2 * easeIO(pk) : 0);

      geo.top = cy + .81 * scl; geo.bottom = cy - .81 * scl; geo.surf = (narrow ? q.surfm : q.surf) * halfH;
      var L = labels(S.y, t, geo);
      dose.userData.show(L.a, L.b, L.fill, L.band, t);
      var dom = L.fill > (geo.top + geo.bottom) / 2 ? L.b : L.a;
      want.set(GLOW[dom]); col.lerp(want, 1 - Math.exp(-5 * dt));
      dose.userData.edge(col); dose.userData.glow(.9 + Math.sin(t * 2.2) * .12);
      if (dom !== cssKey) { cssKey = dom; document.documentElement.style.setProperty("--c", GLOW[dom]); }

      rings.rotation.y = t * .18; rings.rotation.x = Math.sin(t * .3) * .08;
      setGroup(rings, q.rings * ie, col, t);
      setGroup(ped, q.ped, col, t); pedFloorM.color.copy(col); pedFloorM.opacity = .35 * q.ped; pedBeam.material.uniforms.uAlpha.value = q.ped * .6; pedBeam.visible = ped.visible;
      setGroup(sign, q.sign, null, t); cone.material.uniforms.uAlpha.value = q.sign; cone.visible = sign.visible; floorM.opacity = .45 * q.sign;
      spot.intensity = q.sign * 60 + q.ped * 25;
      coreM.color.copy(col); coreM.opacity = (.32 + Math.sin(t * 1.7) * .06) * q.core * ie; core.visible = coreM.opacity > .005;
      mist.forEach(function (m) { m.material.color.copy(col); m.material.opacity = .32 * q.mist * ie; m.material.rotation = t * (.03 + m.userData.k * .012) * (m.userData.k % 2 ? -1 : 1); });
      smoke.forEach(function (m) {
        var u = m.userData, a = u.a + t * u.sp; m.visible = q.smoke > .01; if (!m.visible) return;
        m.position.set(Math.cos(a) * u.r * 1.2, Math.sin(a * .7) * u.r * .6 + (1 - q.smoke) * -.6, u.z);
        m.scale.set(u.s, u.s * .8, 1); m.material.rotation = a * .3; m.material.opacity = q.smoke * .62;
      });

      // Most: Oberfläche, Wellenring beim Eintauchen, Bläschen um die Dose.
      most.visible = geo.surf > -halfH - .3; most.position.y = geo.surf;
      MU.uT.value = t;
      var under = geo.bottom < geo.surf;
      if (under !== wasUnder) { wasUnder = under; ripT = 0; MU.uRipX.value = cx; }
      ripT += dt; MU.uRip.value = ripT; MU.uBurst.value = clamp(q.dive * 1.4, 0, 1); MU.uBX.value = cx;

      var u = sp.material.uniforms; u.uT.value = t; u.uColor.value.copy(col); u.uAlpha.value = .55 * ie * (1 - q.dive * .6);
      rimL.color.copy(col); rimR.color.copy(col); rimL.intensity = 3 + q.rings * 2.5; rimR.intensity = 2.5 + q.ped * 1.5;
      if (q.sign > .01) { rimL.color.lerp(gold, q.sign); rimR.color.lerp(white, q.sign * .5); }

      R.render(scene, cam);
      // Schwaches Gerät: nach ein paar Sekunden die Auflösung senken, damit es flüssig bleibt.
      if (t - t0 < 4) { frames++; slow += dt; }
      else if (frames && dpr > 1 && slow / frames > .024) { dpr = 1; R.setPixelRatio(1); W = 0; size(); frames = 0; }
      else frames = 0;
    };
    document.documentElement.classList.add("has-3d");
  });
}
