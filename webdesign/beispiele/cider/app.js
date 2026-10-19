// Birnstoff: Abschnitte rasten Bild für Bild ein, eine 3D-Dose fliegt von Szene zu Szene,
// Leuchtringe, Lichtspur, Funken und Lichtkegel wechseln mit. Ein einziger rAF-Takt für alles.
import { reduce, mobile, webglOk, loadThree } from "/beispiele/_shared/stage3d.js";

document.documentElement.classList.add("cx");
var fine = !!(window.matchMedia && matchMedia("(pointer: fine)").matches) && !mobile;
var BAR = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--bar")) || 45;
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function damp(cur, to, k, dt) { return cur + (to - cur) * (1 - Math.exp(-k * dt)); }
function smooth(t) { return t * t * (3 - 2 * t); }
function easeIO(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

var secs = Array.prototype.slice.call(document.querySelectorAll(".scene"));
var dots = Array.prototype.slice.call(document.querySelectorAll("#dots a"));
var countN = document.getElementById("countN");
var bgs = Array.prototype.slice.call(document.querySelectorAll(".bg__l"));
var N = secs.length, tgt = [];
function measure() { tgt = secs.map(function (s) { return Math.round(s.getBoundingClientRect().top + scrollY - BAR); }); }
measure(); addEventListener("resize", measure); addEventListener("load", measure);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

// Fließende Szenennummer: 2,5 heißt halb zwischen Abschnitt 2 und 3.
function sceneAt(y) {
  if (y <= tgt[0]) return 0;
  for (var i = 0; i < N - 1; i++) if (y < tgt[i + 1]) return i + (y - tgt[i]) / (tgt[i + 1] - tgt[i]);
  return N - 1;
}

// ---------- Einrasten ----------
// Am Handy macht das der Browser (scroll-snap). Am Computer bringt ein Mausrad-Schubs genau eine Szene weiter.
var nav = { anim: null, lock: 0, lastT: 0, lastA: 0, idle: 0 };
if (!fine && !reduce) document.documentElement.classList.add("snap");
function go(i) {
  i = clamp(i, 0, N - 1);
  var y0 = scrollY, y1 = clamp(tgt[i], 0, document.documentElement.scrollHeight - innerHeight);
  if (Math.abs(y1 - y0) < 2) return;
  if (reduce) { scrollTo(0, y1); return; }
  nav.anim = { y0: y0, y1: y1, t0: performance.now(), dur: clamp(Math.abs(y1 - y0) / innerHeight, 1, 2.2) * 780 };
}
function current() { return Math.round(sceneAt(scrollY)); }
if (fine && !reduce) {
  addEventListener("wheel", function (e) {
    if (e.ctrlKey) return;
    var now = performance.now(), d = e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? innerHeight : 1), a = Math.abs(d);
    // Neuer Schubs: lange Pause, deutlich stärker als zuvor, oder nach kurzer Pause nicht abklingend.
    // Ein ausrollendes Trackpad (Werte werden kleiner) zählt nicht, auch wenn die Seite kurz hakt.
    var gap = now - nav.lastT, fresh = gap > 1000 || a > nav.lastA * 1.6 + 8 || (gap > 320 && a > nav.lastA * .9); nav.lastT = now; nav.lastA = a;
    if (!nav.anim) {
      // Im letzten (höheren) Abschnitt mit Fußzeile normal scrollen.
      var c = current();
      if (c === N - 1 && (d > 0 || scrollY > tgt[N - 1] + 4)) return;
    }
    e.preventDefault();
    if (nav.anim || now < nav.lock || !fresh || a < 2) return;
    go(current() + (d > 0 ? 1 : -1));
  }, { passive: false });
  addEventListener("keydown", function (e) {
    if (e.target.closest && e.target.closest("input,textarea,select,[contenteditable]")) return;
    var k = e.key, dir = (k === "ArrowDown" || k === "PageDown" || (k === " " && !e.shiftKey)) ? 1 : (k === "ArrowUp" || k === "PageUp" || (k === " " && e.shiftKey)) ? -1 : 0;
    if (k === "Home") { e.preventDefault(); go(0); return; }
    if (k === "End") { e.preventDefault(); go(N - 1); return; }
    if (!dir) return;
    var c = current();
    if (c === N - 1 && (dir > 0 || scrollY > tgt[N - 1] + 4)) return;
    e.preventDefault(); if (!nav.anim) go(c + dir);
  });
  // Nach Scrollbalken oder Mittelklick-Scrollen zur nächsten Szene gleiten.
  addEventListener("scroll", function () {
    clearTimeout(nav.idle);
    if (nav.anim) return;
    nav.idle = setTimeout(function () {
      if (nav.anim || scrollY > tgt[N - 1] - 4) return;
      var s = sceneAt(scrollY), r = Math.round(s); if (Math.abs(s - r) > .01) go(r);
    }, 220);
  }, { passive: true });
}
document.addEventListener("click", function (e) {
  var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
  var id = a.getAttribute("href").slice(1), i = secs.findIndex(function (s) { return s.id === id; });
  if (i < 0) return;
  e.preventDefault(); go(i);
  if (history.replaceState) history.replaceState(null, "", "#" + id);
});

// ---------- Sorten-Leiste ----------
var rail = document.getElementById("rail");
if (rail) {
  var cards = rail.querySelectorAll(".card");
  var mark = function () {
    var mid = rail.scrollLeft + rail.clientWidth / 2, best = 0, bd = 1e9;
    cards.forEach(function (c, k) { var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = k; } });
    cards.forEach(function (c, k) { c.classList.toggle("is-act", k === best && rail.scrollWidth > rail.clientWidth + 4); });
  };
  rail.addEventListener("scroll", function () { requestAnimationFrame(mark); }, { passive: true });
  addEventListener("resize", mark); mark();
  document.querySelectorAll(".rbtn").forEach(function (b) {
    b.addEventListener("click", function () { var w = cards[0].offsetWidth + 18; rail.scrollBy({ left: w * +b.dataset.dir, behavior: reduce ? "auto" : "smooth" }); });
  });
}

// ---------- Szenen für die 3D-Dose ----------
// x/y: Lage in Bruchteilen der halben Bildbreite/-höhe (m = Handy), z: Tiefe, s: Größe, rx/rz: Neigung, spin: Drehtempo.
// rings/streak/whirl/sign/core/mist: wie stark die Effekte der Szene leuchten. c: Leuchtfarbe.
var LIME = "#d4f53c", GOLD = "#f3c56a";
var P = [
  { x: .42, y: 0,   xm: 0, ym: -.3,  z: 0,  s: 1.12,  sm: 1, rx: .1,  rz: -.12, spin: .35, rings: 1, streak: 0, whirl: 0, sign: 0, core: 1,  mist: 1,  glow: 1,  c: LIME, bg: 0 },
  { x: .9,  y: -2.3, xm: .6, ym: -2.3, z: -1, s: .7, sm: .7, rx: .3, rz: .3,  spin: .8,  rings: 0, streak: 0, whirl: 0, sign: 0, core: 0,  mist: .45, glow: .6, c: LIME, bg: 0 },
  { x: .42, y: 0,   xm: 0, ym: -.32, z: 0,  s: 1.12, sm: 1, rx: .05, rz: .06, spin: .22, rings: 0, streak: 1, whirl: 0, sign: 0, core: .45, mist: .5, glow: 1.2, c: LIME, bg: 1 },
  { x: .4,  y: .02, xm: .05, ym: -.32, z: 0, s: 1.08, sm: 1, rx: .32, rz: -.62, spin: 1.1, rings: 0, streak: 0, whirl: 1, sign: 0, core: .3, mist: .35, glow: 1, c: LIME, bg: 2 },
  { x: -.2, y: 2.5, xm: 0, ym: 2.6,  z: -3, s: .6, sm: .6, rx: .4, rz: -.9, spin: 1.4, rings: 0, streak: 0, whirl: 0, sign: 0, core: 0,  mist: .3, glow: .6, c: LIME, bg: 1 },
  { x: .42, y: -.02, xm: 0, ym: -.3, z: 0,  s: 1.1, sm: 1, rx: .08, rz: 0,  spin: .2,  rings: 0, streak: 0, whirl: 0, sign: 1, core: .35, mist: .25, glow: .7, c: GOLD, bg: 3 },
  { x: 0,   y: -2.8, xm: 0, ym: -2.8, z: -3, s: .6, sm: .6, rx: .2, rz: .2,  spin: .6,  rings: 0, streak: 0, whirl: 0, sign: 0, core: 0,  mist: .7, glow: .6, c: LIME, bg: 0 }
];
var KEYS = ["x", "y", "xm", "ym", "z", "s", "sm", "rx", "rz", "spin", "rings", "streak", "whirl", "sign", "core", "mist", "glow"];

var S = { s: sceneAt(scrollY), on: -1, t: 0 }, gl = null, last = 0, ptr = { x: 0, y: 0, px: 0, py: 0 };
if (fine) addEventListener("pointermove", function (e) { ptr.x = e.clientX / innerWidth - .5; ptr.y = e.clientY / innerHeight - .5; }, { passive: true });

function tick(t) {
  var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
  if (nav.anim) {
    var p = clamp((t - nav.anim.t0) / nav.anim.dur, 0, 1);
    scrollTo(0, nav.anim.y0 + (nav.anim.y1 - nav.anim.y0) * easeIO(p));
    if (p >= 1) { nav.anim = null; nav.lock = t + 90; }
  }
  var target = sceneAt(scrollY);
  S.s = reduce ? target : damp(S.s, target, 9, dt);
  var on = Math.round(target);
  if (on !== S.on) {
    S.on = on;
    secs.forEach(function (s, k) { s.classList.toggle("is-on", k === on); });
    dots.forEach(function (d, k) { d.classList.toggle("is-on", k === on); d.style.setProperty("--c", P[k].c); });
    if (countN) countN.textContent = String(on + 1).padStart(2, "0");
  }
  // Hintergründe überblenden.
  var w = [0, 0, 0, 0], i0 = Math.floor(S.s), f = S.s - i0, i1 = Math.min(N - 1, i0 + 1);
  w[P[i0].bg] += 1 - f; w[P[i1].bg] += f;
  bgs.forEach(function (b, k) { var o = w[k].toFixed(3); if (b._o !== o) { b._o = o; b.style.opacity = o; } });
  if (gl) gl(dt, t / 1000);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ---------- 3D ----------
if (!reduce && webglOk()) {
  var start = function () { Promise.all([loadThree(), import("/beispiele/cider/dose.js?v=1"), import("/beispiele/_shared/vendor/three-r180/RoomEnvironment.js")]).then(function (m) { build(m[0], m[1], m[2].RoomEnvironment); }).catch(function () {}); };
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
    var rimL = new THREE.DirectionalLight(LIME, 5); rimL.position.set(-4, 1, -3); scene.add(rimL);
    var rimR = new THREE.DirectionalLight(LIME, 4); rimR.position.set(4, 2.5, -2.5); scene.add(rimR);
    var top = new THREE.SpotLight("#fff1d2", 0, 9, .42, .6, 1); top.position.set(0, 4.2, .4); scene.add(top); scene.add(top.target);

    var col = new THREE.Color(LIME), cA = new THREE.Color(), cB = new THREE.Color();
    var rig = new THREE.Group(); scene.add(rig);                  // folgt der Dose, dreht sich aber nicht mit
    var tilt = new THREE.Group(); rig.add(tilt);                  // trägt Neigung der Dose (für Ringe, die mitkippen)
    var dose = D.can(THREE, "pur", { seg: mobile ? 56 : 80 }); tilt.add(dose);
    dose.userData.preload("reserve", R);
    var dot = D.dotTexture(THREE), smoke = D.smokeTexture(THREE, 5);

    // Glühkern hinter der Dose.
    var coreM = new THREE.SpriteMaterial({ map: dot, color: LIME, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .5 });
    var core = new THREE.Sprite(coreM); core.scale.set(3.4, 3.4, 1); core.position.z = -.9; rig.add(core);

    // Drei sich kreuzende Leuchtringe (Hero).
    var rings = new THREE.Group(); rig.add(rings);
    [[1.02, .42, .55, .12, .32, 1], [1.08, .36, -.62, .25, .26, 2], [.86, .86, .18, 1.32, .42, 1]].forEach(function (r, k) {
      var tube = D.glowTube(THREE, D.ellipse(THREE, r[0], r[1]), { closed: true, r: .015, speed: r[4], tail: 3, heads: r[5], base: .2, halo: .45, seg: mobile ? 160 : 240 });
      tube.rotation.set(r[3], k * .9, r[2]); rings.add(tube);
    });
    // Lichtspur, die sich um die Dose nach oben schraubt (Kern).
    var streak = new THREE.Group(); rig.add(streak);
    [[0, 2.1, .26], [Math.PI, 1.7, .2]].forEach(function (h) {
      streak.add(D.glowTube(THREE, D.helix(THREE, { phase: h[0], turns: h[1] }), { r: .013, speed: h[2], tail: 4, heads: 1, base: .07, halo: .45, seg: mobile ? 220 : 320 }));
    });
    // Schneller Wirbel um die gekippte Dose (Perlage).
    var whirl = new THREE.Group(); tilt.add(whirl);
    [[1.2, .52, .9, 2, .1], [.95, .4, 1.25, 1, -.25]].forEach(function (r) {
      var tube = D.glowTube(THREE, D.ellipse(THREE, r[0], r[1]), { closed: true, r: .014, speed: r[2], tail: 2.4, heads: r[3], base: .12, halo: .42, seg: mobile ? 160 : 240 });
      tube.position.y = r[4]; whirl.add(tube);
    });
    // Signature: Leuchtring am Boden, Strom-Krone, Lichtkegel von oben.
    var sign = new THREE.Group(); rig.add(sign);
    var floorRing = D.glowTube(THREE, D.ellipse(THREE, .78, .78), { closed: true, r: .014, speed: .12, tail: 1.6, heads: 3, base: .55, halo: .3, seg: 180 });
    floorRing.position.y = -.86; sign.add(floorRing);
    var crown = D.glowTube(THREE, D.ellipse(THREE, .58, .58), { closed: true, r: .008, speed: .6, tail: 1.2, heads: 5, base: .35, flick: 1, halo: .3, seg: 200 });
    crown.position.y = .32; crown.rotation.set(.18, 0, -.12); sign.add(crown);
    var floorM = new THREE.MeshBasicMaterial({ map: dot, color: GOLD, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .5 });
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), floorM); floor.rotation.x = -Math.PI / 2; floor.position.y = -.87; sign.add(floor);
    var cone = D.beam(THREE, { h: 3.6, top: .05, bottom: 1.05 }); cone.position.y = .95; sign.add(cone);

    // Nebel und Funken.
    var mist = []; [[-1.2, -.6, -1.6, 4.6], [1.3, -.9, -2, 5.2], [0, -1.2, -1, 4], [-.4, .6, -2.6, 5.6]].forEach(function (m, k) {
      var mat = new THREE.SpriteMaterial({ map: smoke, color: LIME, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .3 });
      var sp = new THREE.Sprite(mat); sp.position.set(m[0], m[1], m[2]); sp.scale.set(m[3], m[3] * .7, 1); sp.userData.k = k; mist.push(sp); rig.add(sp);
    });
    var sp = D.sparks(THREE, mobile ? 140 : 320, { w: 7, h: 5, d: 4 }); scene.add(sp);

    var mats = [];
    [rings, streak, whirl, sign].forEach(function (g) { g.traverse(function (o) { if (o.userData.mats) mats.push(o); }); });
    function setGroup(g, a, c, t) {
      g.visible = a > .005;
      if (!g.visible) return;
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
      sp.material.uniforms.uPx.value = h * R.getPixelRatio();
    }
    size(); addEventListener("resize", size);

    var q = {}, spin = 0, wind = 0, intro = 0, frames = 0, slow = 0, t0 = performance.now() / 1000;
    gl = function (dt, t) {
      size();
      var narrow = aspect < .9, i0 = Math.floor(S.s), f = smooth(clamp(S.s - i0, 0, 1)), a = P[i0], b = P[Math.min(N - 1, i0 + 1)];
      for (var k = 0; k < KEYS.length; k++) q[KEYS[k]] = a[KEYS[k]] + (b[KEYS[k]] - a[KEYS[k]]) * f;
      cA.set(a.c); cB.set(b.c); col.copy(cA).lerp(cB, f);
      intro = Math.min(1, intro + dt / 1.6); var ie = 1 - Math.pow(1 - intro, 3);

      ptr.px = damp(ptr.px, ptr.x, 4, dt); ptr.py = damp(ptr.py, ptr.y, 4, dt);
      var halfW = halfH * aspect, sc = (narrow ? q.sm * clamp(aspect * 1.55, .62, 1) : q.s) * (.86 + .14 * ie);
      rig.position.set((narrow ? q.xm : q.x) * halfW + ptr.px * .12, (narrow ? q.ym : q.y) * halfH - (1 - ie) * 1.2 + Math.sin(t * .9) * .035, q.z);
      rig.scale.setScalar(sc);
      tilt.rotation.set(q.rx + ptr.py * .12, 0, q.rz);
      spin += dt * q.spin; dose.rotation.y = -.35 + Math.sin(spin) * .5 + ptr.px * .5;
      dose.userData.set(S.s > 4.2 && S.s < 5.8 ? "reserve" : "pur");
      dose.userData.glow(q.glow * (.85 + Math.sin(t * 2.2) * .15));

      rings.rotation.y = t * .18; rings.rotation.x = Math.sin(t * .3) * .08;
      setGroup(rings, q.rings * ie, col, t);
      setGroup(streak, q.streak, col, t); streak.rotation.y = t * .25;
      setGroup(whirl, q.whirl, col, t); whirl.rotation.y = -t * .9;
      setGroup(sign, q.sign, null, t); cone.material.uniforms.uAlpha.value = q.sign; cone.visible = sign.visible;
      floorM.opacity = .45 * q.sign;
      floorRing.userData.mats.forEach(function (m) { m.uniforms.uColor.value.set(GOLD); });
      crown.userData.mats.forEach(function (m) { m.uniforms.uColor.value.set("#fff0c4"); });
      top.intensity = q.sign * 60;
      coreM.color.copy(col); coreM.opacity = (.32 + Math.sin(t * 1.7) * .06) * q.core * ie; core.visible = coreM.opacity > .005;
      mist.forEach(function (m) { m.material.color.copy(col); m.material.opacity = .32 * q.mist * ie; m.material.rotation = t * (.03 + m.userData.k * .012) * (m.userData.k % 2 ? -1 : 1); });
      wind += dt * q.whirl * 2.4;
      var u = sp.material.uniforms; u.uT.value = t; u.uWind.value = wind; u.uColor.value.copy(col); u.uAlpha.value = (.55 + q.whirl * .45) * ie;
      rimL.color.copy(col); rimR.color.copy(col); rimL.intensity = 3 + q.rings * 2.5 + q.streak * 2; rimR.intensity = 2.5 + q.whirl * 2;

      R.render(scene, cam);
      // Schwaches Gerät: nach zwei Sekunden die Auflösung senken, damit es flüssig bleibt.
      if (t - t0 < 4) { frames++; slow += dt; }
      else if (frames && dpr > 1 && slow / frames > .024) { dpr = 1; R.setPixelRatio(1); W = 0; size(); frames = 0; }
      else frames = 0;
    };
    document.documentElement.classList.add("has-3d");
  });
}
