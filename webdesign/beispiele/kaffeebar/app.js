// röstzeit: weiches Scrollen, ein gemeinsamer Takt für alle Scroll-Effekte, 3D im Hero und bei den Bohnen.
// Alles, was am Scrollen hängt, gleitet seinem Ziel nach (statt bei jedem Mausrad-Ruck zu springen).
import { reduce, mobile, webglOk, whenNear, loadThree, stage } from "/beispiele/_shared/stage3d.js";

var fine = !!(window.matchMedia && matchMedia("(pointer: fine)").matches) && !mobile;
var BAR = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--bar")) || 45;
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function damp(cur, to, k, dt) { return cur + (to - cur) * (1 - Math.exp(-k * dt)); }
var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return document.querySelectorAll(s); };

// ---------- Weiches Scrollen (nur Maus/Trackpad am Computer) ----------
// Das Mausrad setzt ein Ziel, die Seite gleitet dorthin. Tastatur, Scrollbalken und Anker funktionieren weiter.
var sc = { y: scrollY, to: scrollY, on: fine && !reduce, busy: false };
function maxY() { return document.documentElement.scrollHeight - innerHeight; }
if (sc.on) {
  document.documentElement.classList.add("smooth");
  addEventListener("wheel", function (e) {
    if (e.ctrlKey || e.defaultPrevented) return;
    e.preventDefault();
    var d = e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? innerHeight : 1);
    if (!sc.busy) sc.y = sc.to = scrollY;
    sc.to = clamp(sc.to + d, 0, maxY()); sc.busy = true;
  }, { passive: false });
  addEventListener("scroll", function () { if (!sc.busy) sc.y = sc.to = scrollY; }, { passive: true });
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute("href"), el = id === "#top" ? document.body : document.querySelector(id); if (!el) return;
    e.preventDefault(); if (!sc.busy) sc.y = scrollY;
    sc.to = clamp(el.getBoundingClientRect().top + scrollY - (id === "#top" ? 0 : BAR), 0, maxY()); sc.busy = true;
  });
}

// ---------- Zeilen, Buchstaben-Wirbel, Preisschild ----------
var lines = $$("[data-lines]");
if (reduce || !("IntersectionObserver" in window)) lines.forEach(function (el) { el.classList.add("is-in"); });
else {
  var lo = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); lo.unobserve(e.target); } }); }, { threshold: .25 });
  lines.forEach(function (el) { lo.observe(el); });
}

var POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789€#%&";
function scramble(el, to, dur) {
  if (reduce) { el.textContent = to; return; }
  var from = el.textContent, len = Math.max(from.length, to.length), t0 = performance.now(); dur = dur || 700;
  cancelAnimationFrame(el._raf);
  (function step(t) {
    var p = clamp((t - t0) / dur, 0, 1), out = "";
    for (var i = 0; i < len; i++) {
      var lock = (i / len) * .7 + .3;
      if (p >= lock) out += to[i] || "";
      else if (p > (i / len) * .5) out += (to[i] === " " ? " " : POOL[(Math.random() * POOL.length) | 0]);
      else out += from[i] || "";
    }
    el.textContent = out;
    if (p < 1) el._raf = requestAnimationFrame(step); else el.textContent = to;
  })(t0);
}
if ("IntersectionObserver" in window && !reduce) {
  var so = new IntersectionObserver(function (es) { es.forEach(function (e) {
    if (!e.isIntersecting) return; so.unobserve(e.target);
    var el = e.target, to = el.textContent; el.textContent = to.replace(/[0-9]/g, "0");
    setTimeout(function () { scramble(el, to, 900); }, 250);
  }); }, { threshold: .6 });
  $$("[data-scramble][data-on-view]").forEach(function (el) { so.observe(el); });
}

var TAGS = [
  { k: "// im Sack", name: "Langsam geröstet", price: "€ 14,90", meta: "250 g · ganze Bohne · Mostviertel" },
  { k: "// im Becher", name: "Hausmelange", price: "€ 4,20", meta: "350 ml · täglich frisch · zum Mitnehmen" }
];
var tag = $("#tag"), tagI = 0;
if (tag && !reduce) setTimeout(function () { setInterval(nextTag, 4200); }, 3200);
function nextTag() {
  if (document.hidden || scrollY > innerHeight) return;
  tagI = (tagI + 1) % TAGS.length; var d = TAGS[tagI];
  tag.querySelector(".tag__k").textContent = d.k;
  scramble(tag.querySelector(".tag__name"), d.name); scramble(tag.querySelector(".tag__price"), d.price); scramble(tag.querySelector(".tag__meta"), d.meta, 900);
  window.dispatchEvent(new CustomEvent("rz-tag", { detail: tagI }));
}

// ---------- Zifferblatt ----------
var svg = $("#dialsvg");
if (svg) {
  var s = '<circle class="face" cx="200" cy="200" r="198"/>';
  for (var i = 0; i < 60; i++) {
    var a = i * Math.PI / 30, big = i % 5 === 0, r1 = 192, r2 = big ? 176 : 184;
    s += '<line x1="' + (200 + Math.sin(a) * r1).toFixed(1) + '" y1="' + (200 - Math.cos(a) * r1).toFixed(1) + '" x2="' + (200 + Math.sin(a) * r2).toFixed(1) + '" y2="' + (200 - Math.cos(a) * r2).toFixed(1) + '" stroke-width="' + (big ? 2.4 : 1.2) + '"/>';
    if (big) { var n = i / 5 || 12; s += '<text x="' + (200 + Math.sin(a) * 152).toFixed(1) + '" y="' + (200 - Math.cos(a) * 152).toFixed(1) + '">' + n + '</text>'; }
  }
  svg.innerHTML = s;
}

// ---------- Footer-Schriftzug: Buchstaben einzeln ----------
var mark = $(".foot__mark");
if (mark) {
  var sup = mark.querySelector("sup"); if (sup) sup.remove();
  mark.innerHTML = mark.textContent.trim().split("").map(function (c, k) { return '<span style="--i:' + k + '">' + c + "</span>"; }).join("") + '<sup style="--i:8">°</sup>';
  if ("IntersectionObserver" in window && !reduce) {
    var mo = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { mark.classList.add("is-in"); mo.disconnect(); } }, { threshold: .3 });
    mo.observe(mark);
  } else mark.classList.add("is-in");
}

// ---------- Karten kippen in 3D zur Maus, mit Lichtreflex ----------
if (fine && !reduce) $$(".card").forEach(function (c) {
  var r = null;
  c.addEventListener("pointerenter", function () { r = c.getBoundingClientRect(); });
  c.addEventListener("pointermove", function (e) {
    if (!r) r = c.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.style.setProperty("--rx", ((.5 - y) * 10).toFixed(2) + "deg"); c.style.setProperty("--ry", ((x - .5) * 12).toFixed(2) + "deg");
    c.style.setProperty("--gx", (x * 100).toFixed(1) + "%"); c.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
  });
  c.addEventListener("pointerleave", function () { r = null; c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
});

// ---------- Eigener Mauszeiger: Punkt folgt sofort, Ring gleitet nach und wächst über Links ----------
var cur = null;
if (fine && !reduce) {
  cur = { dot: document.createElement("i"), ring: document.createElement("i"), x: -100, y: -100, rx: -100, ry: -100, big: 0, bigTo: 0, label: "" };
  cur.dot.className = "cur-dot"; cur.ring.className = "cur-ring"; cur.ring.innerHTML = "<b></b>";
  document.body.append(cur.dot, cur.ring); document.documentElement.classList.add("has-cursor");
  addEventListener("pointermove", function (e) {
    cur.x = e.clientX; cur.y = e.clientY;
    var t = e.target.closest && e.target.closest("a, button, .card");
    cur.bigTo = t ? 1 : 0;
    var lab = t && t.classList.contains("card") ? "Bestellen" : "";
    if (lab !== cur.label) { cur.label = lab; cur.ring.firstChild.textContent = lab; cur.ring.classList.toggle("has-label", !!lab); }
  }, { passive: true });
  document.addEventListener("pointerleave", function () { cur.x = cur.y = -100; });
}

// ---------- Ein Takt für alles ----------
// Abschnittspositionen werden nur bei Größenänderung gemessen, nicht in jedem Bild.
var sec = { clock: $("#standorte"), order: $("#bestellen"), city: $("#haltung"), band: $("#band") }, pos = {};
var lights = $$(".light"), lightPos = [], nav = $("#nav");
function measure() {
  var vh = innerHeight;
  Object.keys(sec).forEach(function (k) { var el = sec[k]; if (!el) return; var r = el.getBoundingClientRect(); pos[k] = { top: r.top + scrollY, h: r.height, span: Math.max(1, r.height - (vh - BAR)) }; });
  lightPos = Array.prototype.map.call(lights, function (el) { var r = el.getBoundingClientRect(); return [r.top + scrollY, r.bottom + scrollY]; });
}
function prog(k, y) { var p = pos[k]; return p ? clamp((y - p.top + BAR) / p.span, 0, 1) : 0; }
measure(); addEventListener("resize", measure); addEventListener("load", measure);
if ("ResizeObserver" in window) new ResizeObserver(measure).observe(document.body);

var el = { hh: $("#hh"), hm: $("#hm"), hs: $("#hs"), time: $("#time"), turn: $("#turn"), turnImg: $("#turn img"), places: $$("#places li"), bon: $("#bon"), track: $(".band__track") };
var S = { clock: 0, order: 0, beans: 0, hero: 0, vel: 0, band: 0 }, placeOn = -1, lastTime = "", lastFrame = -1, navLight = false, lastY = scrollY;
window.rz = S;

var last = performance.now();
function tick(now) {
  var dt = Math.min(.05, (now - last) / 1000); last = now;
  if (sc.on && sc.busy) {
    sc.y = damp(sc.y, sc.to, 9, dt);
    if (Math.abs(sc.to - sc.y) < .5) { sc.y = sc.to; sc.busy = false; }
    window.scrollTo(0, sc.y);
  }
  var y = scrollY, vh = innerHeight;
  // Scrollgeschwindigkeit (Pixel pro Sekunde, geglättet) für das Laufband.
  var v = dt > 0 ? (y - lastY) / dt : 0; lastY = y;
  S.vel = damp(S.vel, clamp(v, -4000, 4000), 6, dt);

  var ny = y + BAR + 30, onLight = false;
  for (var i = 0; i < lightPos.length; i++) if (lightPos[i][0] <= ny && lightPos[i][1] >= ny) { onLight = true; break; }
  if (onLight !== navLight) { navLight = onLight; nav.classList.toggle("on-light", onLight); }

  S.hero = clamp(y / vh, 0, 1);
  if (!reduce) {
    S.beans = damp(S.beans, prog("city", y), 8, dt);
    S.clock = damp(S.clock, prog("clock", y), 7, dt);
    S.order = damp(S.order, prog("order", y), 7, dt);

    // Uhr: 7:00 bis 19:00; Sekundenzeiger tickt mit dem Scrollen.
    if (pos.clock && y + vh > pos.clock.top && y < pos.clock.top + pos.clock.h) {
      var m = 420 + S.clock * 720;
      el.hm.style.transform = "rotate(" + ((m % 60) * 6).toFixed(2) + "deg)";
      el.hh.style.transform = "rotate(" + (((m / 60) % 12) * 30).toFixed(2) + "deg)";
      if (el.hs) el.hs.style.transform = "rotate(" + ((m * 60 * 6 / 8) % 360).toFixed(1) + "deg)";
      var mm = Math.round(m), t = String(Math.floor(mm / 60)).padStart(2, "0") + ":" + String(mm % 60).padStart(2, "0");
      if (t !== lastTime) { lastTime = t; el.time.textContent = t; }
      // Eiskaffee dreht sich zweimal um sich selbst (36 vorgerenderte Ansichten).
      if (el.turn) { var f = Math.floor(((S.clock * 2 * 36) % 36 + 36) % 36); if (f !== lastFrame) { lastFrame = f; el.turnImg.style.transform = "translate3d(" + (-(f % 6) * 100 / 6).toFixed(4) + "%," + (-Math.floor(f / 6) * 100 / 6).toFixed(4) + "%,0)"; } }
      var on = Math.min(el.places.length - 1, Math.floor(S.clock * el.places.length));
      if (on !== placeOn) { placeOn = on; el.places.forEach(function (li, k) { li.classList.toggle("is-on", k === on); }); }
    }
    if (el.bon && pos.order && y + vh > pos.order.top) {
      var q = clamp(S.order / .8, 0, 1), e = 1 - Math.pow(1 - q, 2);
      el.bon.style.transform = "translateY(" + (-100 + e * 100).toFixed(2) + "%) rotate(" + (Math.sin(q * 9) * .6 * (1 - q)).toFixed(2) + "deg)";
    }
    // Laufband: läuft immer, schneller und schräger beim Scrollen.
    if (el.track && pos.band && y + vh > pos.band.top - 200 && y < pos.band.top + pos.band.h + 200) {
      S.band -= (60 + Math.abs(S.vel) * .35) * dt * (S.vel < -5 ? -1 : 1);
      var w = el.track.scrollWidth / 2; if (w) S.band = ((S.band % w) - w) % w;
      el.track.style.transform = "translate3d(" + S.band.toFixed(1) + "px,0,0) skewX(" + clamp(-S.vel / 160, -12, 12).toFixed(2) + "deg)";
    }
  }
  if (cur) {
    cur.rx = damp(cur.rx, cur.x, 14, dt); cur.ry = damp(cur.ry, cur.y, 14, dt); cur.big = damp(cur.big, cur.bigTo, 12, dt);
    cur.dot.style.transform = "translate3d(" + cur.x + "px," + cur.y + "px,0)";
    cur.ring.style.transform = "translate3d(" + cur.rx.toFixed(1) + "px," + cur.ry.toFixed(1) + "px,0) scale(" + (1 + cur.big * (cur.label ? 2.4 : 1.2)).toFixed(3) + ")";
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ---------- 3D ----------
var stageEl = $("#stage"), beansEl = $("#beans");
if (!reduce && webglOk()) {
  whenNear(stageEl, function () { Promise.all([loadThree(), import("/beispiele/kaffeebar/produkte.js?v=2")]).then(function (m) { hero(m[0], m[1]); }); }, "200px");
  var beansOn = false, startBeans = function () { if (beansOn) return; beansOn = true; Promise.all([loadThree(), import("/beispiele/kaffeebar/produkte.js?v=2")]).then(function (m) { beans(m[0], m[1]); }); };
  // Die Bohnen-Bühne wird im Leerlauf aufgebaut, damit das Aufbauen nicht mitten im Scrollen hakt.
  addEventListener("load", function () { if (window.requestIdleCallback) requestIdleCallback(startBeans, { timeout: 2500 }); else setTimeout(startBeans, 2500); });
  whenNear(beansEl, startBeans, "1500px");
}

// Große Leinwände mit voller Retina-Auflösung kosten zu viel; 1,5-fach sieht gleich scharf aus und läuft flüssig.
function dpr(st) { st.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.25)); st.resize(); }

function light(THREE, scn, o) {
  o = o || {};
  scn.add(new THREE.HemisphereLight("#ffe6cc", "#2a160c", o.hemi || .9));
  var key = new THREE.DirectionalLight("#ffeedd", o.key || 3.4); key.position.set(-4, 3, 2.5); scn.add(key);
  var rim = new THREE.DirectionalLight("#ff9a55", o.rim || 2.2); rim.position.set(4, 2, -3); scn.add(rim);
  var fill = new THREE.DirectionalLight("#ffd9b8", .6); fill.position.set(2, -1, 4); scn.add(fill);
}

function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
function outBack(t) { var c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }

function hero(THREE, P) {
  P.fontsReady().then(function () {
    var st = stage(THREE, stageEl, { alpha: true, fov: 24, exposure: 1.05 }); dpr(st);
    light(THREE, st.scene, {});
    var g = new THREE.Group(); st.scene.add(g);
    var bag = P.bag(THREE, {}); g.add(bag);
    var cup = P.cup(THREE, {}); cup.scale.setScalar(.92); g.add(cup);
    // Bohnen schweben um die Produkte, weichen der Maus aus und fliegen beim Scrollen auseinander.
    var N = mobile ? 14 : 26, R = rng(9), B = [];
    var inst = new THREE.InstancedMesh(P.beanGeometry(THREE), P.beanMaterial(THREE), N); g.add(inst);
    for (var i = 0; i < N; i++) {
      var ang = R() * Math.PI * 2, rad = 1.1 + R() * 1.4;
      B.push({ x: Math.cos(ang) * rad * 1.15, y: Math.sin(ang) * rad * .75 - .1, z: (R() - .5) * 2.4, s: .1 + R() * .09, ax: R() * 6, ay: R() * 6, sp: .3 + R() * .6, ox: 0, oy: 0, d: 1 + R() * 1.5 });
    }
    var M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), SC = new THREE.Vector3();
    var px = 0, py = 0, tx = 0, ty = 0, mx = 99, my = 99, spin = 0, spinTo = 0, t0 = -1;
    stageEl.closest(".hero").addEventListener("pointermove", function (e) {
      tx = (e.clientX / innerWidth - .5); ty = (e.clientY / innerHeight - .5);
      var r = stageEl.getBoundingClientRect(), h = 2 * Math.tan(st.camera.fov * Math.PI / 360) * st.camera.position.z;
      mx = ((e.clientX - r.left) / r.width - .5) * h * st.camera.aspect - g.position.x; my = -((e.clientY - r.top) / r.height - .5) * h - g.position.y;
    });
    addEventListener("rz-tag", function () { spinTo += Math.PI * 2; });
    function place(w, h) {
      var narrow = innerWidth <= 860;
      st.camera.position.set(0, .15, narrow ? 6.6 : 7.3); st.camera.lookAt(0, -.05, 0);
      g.position.set(narrow ? .12 : -.1, narrow ? -.3 : 0, 0);
    }
    place(stageEl.clientWidth, stageEl.clientHeight);
    new ResizeObserver(function () { place(stageEl.clientWidth, stageEl.clientHeight); }).observe(stageEl);
    st.onFrame(function (dt, t) {
      if (t0 < 0) t0 = t;
      // Auftritt: Sack und Becher steigen mit Schwung von unten auf, der Becher dreht sich dabei einmal.
      var a1 = outBack(clamp((t - t0) / 1.3, 0, 1)), a2 = outBack(clamp((t - t0 - .18) / 1.3, 0, 1));
      px = damp(px, tx, 3, dt); py = damp(py, ty, 3, dt); spin = damp(spin, spinTo, 2.6, dt);
      var sp = S.hero, ex = sp * sp;
      g.rotation.y = px * .35; g.rotation.x = py * .12;
      bag.position.set(.66 + ex * .6, -.9 - (1 - a1) * 3 + Math.sin(t * .8) * .04 + sp * .4, -.5);
      bag.rotation.set(0, -.42 - (1 - a1) * .8 + ex * .5, .07 + ex * .15);
      cup.position.set(-.5 - ex * .5, -.95 - (1 - a2) * 3.4 + Math.sin(t * .9 + 1.4) * .06 + sp * 1.3, .55 + ex * 1.2);
      cup.rotation.set(.08 + ex * .4, .35 + spin - (1 - a2) * Math.PI * 2, -.2 + Math.sin(t * .7) * .03 - ex * .5);
      for (var i = 0; i < N; i++) {
        var b = B[i], bx = b.x * (1 + ex * 2.2 * b.d), by = b.y * (1 + ex * 1.6 * b.d) + Math.sin(t * b.sp + i) * .08, bz = b.z + ex * 2.5 * b.d;
        // Ausweichen: je näher die Maus, desto stärker wird die Bohne weggeschoben.
        var dx = bx - mx, dy = by - my, dd = dx * dx + dy * dy, push = dd < .6 ? (.6 - dd) * .9 : 0, l = Math.sqrt(dd) || 1;
        b.ox = damp(b.ox, dx / l * push, 5, dt); b.oy = damp(b.oy, dy / l * push, 5, dt);
        var k = a1 * (1 - ex * .2);
        E.set(b.ax + t * b.sp, b.ay + t * b.sp * .7, 0); Q.setFromEuler(E);
        V.set(bx + b.ox, by + b.oy - (1 - a1) * 2.5, bz); SC.setScalar(b.s * k); M.compose(V, Q, SC); inst.setMatrixAt(i, M);
      }
      inst.instanceMatrix.needsUpdate = true;
    });
    document.documentElement.classList.add("has-3d");
  });
}

function beans(THREE, P) {
  P.fontsReady().then(function () {
    var host = beansEl;
    var st = stage(THREE, host, { alpha: true, fov: 32, exposure: 1 }); dpr(st);
    st.scene.fog = new THREE.Fog("#140d09", 6, 14);
    light(THREE, st.scene, { key: 2.6, rim: 2.6, hemi: .5 });
    st.camera.position.set(0, 0, 7); st.camera.lookAt(0, 0, 0);
    var N = mobile ? 34 : 70, R = rng(5);
    var inst = new THREE.InstancedMesh(P.beanGeometry(THREE), P.beanMaterial(THREE), N); st.scene.add(inst);
    var B = []; for (var i = 0; i < N; i++) B.push({ x: (R() - .5) * 9, y: (R() - .5) * 8, z: -R() * 7 + 1.5, s: .16 + R() * .12, v: .25 + R() * .35, ax: R() * 6, ay: R() * 6, rx: (R() - .5) * 1.4, ry: (R() - .5) * 1.4 });
    var cup = P.cup(THREE, {}); cup.scale.setScalar(1.25); st.scene.add(cup);
    var M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), SC = new THREE.Vector3();
    var narrow = false;
    function rs() { narrow = host.clientWidth / host.clientHeight < 1; } rs(); new ResizeObserver(rs).observe(host);
    st.onFrame(function (dt, t) {
      var p = S.beans, vel = clamp(S.vel / 1500, -1.5, 1.5);
      for (var i = 0; i < N; i++) {
        var b = B[i]; b.y -= (b.v + vel * (1 + b.s * 3)) * dt;
        var yy = b.y - p * 5 * (1 + b.s * 2); yy = ((yy + 4) % 8 + 8) % 8 - 4;
        E.set(b.ax + t * b.rx, b.ay + t * b.ry, 0); Q.setFromEuler(E);
        V.set(narrow ? b.x * .42 : b.x, yy, b.z); SC.setScalar(b.s); M.compose(V, Q, SC); inst.setMatrixAt(i, M);
      }
      inst.instanceMatrix.needsUpdate = true;
      var c = clamp(p / .6, 0, 1), e = 1 - Math.pow(1 - c, 3);
      cup.position.set(narrow ? .35 : -1.1, (narrow ? -5 : -4.2) + e * (narrow ? 2.5 : 2.7), narrow ? -.4 : .8);
      cup.rotation.set(.25 - e * .1, .4 + e * .5 + p * 1.2, .9 - e * .75);
    });
  });
}
