// röstzeit: Zeilen-Einblendung, Buchstaben-Wirbel bei Preisen, Uhr und Bon am Scrollen, 3D im Hero und bei den Bohnen.
import { reduce, mobile, webglOk, whenNear, loadThree, stage } from "/beispiele/_shared/stage3d.js";

var bar = function () { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--bar")) || 45; };
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
// Fortschritt 0..1, während ein hoher Abschnitt mit fixiertem Inhalt durchgescrollt wird.
function progress(el) {
  var r = el.getBoundingClientRect(), span = r.height - (innerHeight - bar());
  return span > 0 ? clamp(-r.top / span, 0, 1) : 0;
}

// Zeilen schieben sich hoch, sobald die Überschrift ins Bild kommt.
var lines = document.querySelectorAll("[data-lines]");
if (reduce || !("IntersectionObserver" in window)) lines.forEach(function (el) { el.classList.add("is-in"); });
else {
  var lo = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); lo.unobserve(e.target); } }); }, { threshold: .25 });
  lines.forEach(function (el) { lo.observe(el); });
}

// Buchstaben-Wirbel: Zeichen laufen zufällig durch und rasten von links nach rechts im Zieltext ein.
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
var onView = document.querySelectorAll("[data-scramble][data-on-view]");
if ("IntersectionObserver" in window && !reduce) {
  var so = new IntersectionObserver(function (es) { es.forEach(function (e) {
    if (!e.isIntersecting) return; so.unobserve(e.target);
    var el = e.target, to = el.textContent; el.textContent = to.replace(/[0-9]/g, "0");
    setTimeout(function () { scramble(el, to, 900); }, 250);
  }); }, { threshold: .6 });
  onView.forEach(function (el) { so.observe(el); });
}

// Preisschild im Hero wechselt zwischen Sack und Becher.
var TAGS = [
  { k: "// im Sack", name: "Langsam geröstet", price: "€ 14,90", meta: "250 g · ganze Bohne · Mostviertel" },
  { k: "// im Becher", name: "Hausmelange", price: "€ 4,20", meta: "350 ml · täglich frisch · zum Mitnehmen" }
];
var tag = document.getElementById("tag"), tagI = 0;
if (tag && !reduce) setTimeout(function () { setInterval(nextTag, 4200); }, 2500);
function nextTag() {
  if (document.hidden) return;
  tagI = (tagI + 1) % TAGS.length; var d = TAGS[tagI];
  tag.querySelector(".tag__k").textContent = d.k;
  scramble(tag.querySelector(".tag__name"), d.name); scramble(tag.querySelector(".tag__price"), d.price); scramble(tag.querySelector(".tag__meta"), d.meta, 900);
  window.dispatchEvent(new CustomEvent("rz-tag", { detail: tagI }));
}

// Zifferblatt zeichnen: 60 Striche, längere bei vollen Stunden, Zahlen 1–12.
var svg = document.getElementById("dialsvg");
if (svg) {
  var ns = "http://www.w3.org/2000/svg", s = '<circle class="face" cx="200" cy="200" r="198"/>';
  for (var i = 0; i < 60; i++) {
    var a = i * Math.PI / 30, big = i % 5 === 0, r1 = 192, r2 = big ? 176 : 184;
    s += '<line x1="' + (200 + Math.sin(a) * r1).toFixed(1) + '" y1="' + (200 - Math.cos(a) * r1).toFixed(1) + '" x2="' + (200 + Math.sin(a) * r2).toFixed(1) + '" y2="' + (200 - Math.cos(a) * r2).toFixed(1) + '" stroke-width="' + (big ? 2.4 : 1.2) + '"/>';
    if (big) { var n = i / 5 || 12; s += '<text x="' + (200 + Math.sin(a) * 152).toFixed(1) + '" y="' + (200 - Math.cos(a) * 152).toFixed(1) + '">' + n + '</text>'; }
  }
  svg.innerHTML = s;
}

var clockSec = document.getElementById("standorte"), hh = document.getElementById("hh"), hm = document.getElementById("hm"),
  time = document.getElementById("time"), dcup = document.getElementById("dialcup"), places = document.querySelectorAll("#places li");
var orderSec = document.getElementById("bestellen"), bon = document.getElementById("bon");

function frame() {
  if (clockSec) {
    // Von 7:00 bis 19:00: der Minutenzeiger dreht zwölf Runden, der Stundenzeiger eine.
    var p = progress(clockSec), min = 420 + Math.round(p * 720);
    hm.style.transform = "rotate(" + (min % 60) * 6 + "deg)";
    hh.style.transform = "rotate(" + ((min / 60) % 12) * 30 + "deg)";
    var t = String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0");
    if (time.textContent !== t) time.textContent = t;
    dcup.style.transform = "translate(-50%,-52%) rotate(" + (Math.sin(p * Math.PI * 2) * 7).toFixed(2) + "deg) scale(" + (.94 + Math.sin(p * Math.PI) * .08).toFixed(3) + ")";
    var on = Math.min(places.length - 1, Math.floor(p * places.length));
    places.forEach(function (li, k) { li.classList.toggle("is-on", k === on); });
  }
  if (orderSec && bon) {
    // Bon kommt ruckweise heraus wie aus einem echten Drucker.
    var q = clamp(progress(orderSec) / .8, 0, 1), steps = 28, qs = Math.floor(q * steps) / steps;
    bon.style.transform = "translateY(" + (-100 + ease(qs) * 100).toFixed(2) + "%)";
  }
}
var ticking = false;
function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; frame(); }); } }
if (!reduce) { addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); frame(); }

// ---------- 3D ----------
if (!reduce && webglOk()) {
  var stageEl = document.getElementById("stage");
  whenNear(stageEl, function () { Promise.all([loadThree(), import("/beispiele/kaffeebar/produkte.js")]).then(function (m) { hero(m[0], m[1]); }); }, "200px");
  var beansEl = document.getElementById("beans");
  whenNear(beansEl, function () { Promise.all([loadThree(), import("/beispiele/kaffeebar/produkte.js")]).then(function (m) { beans(m[0], m[1]); }); }, "600px");
}

function light(THREE, sc, o) {
  o = o || {};
  var hemi = new THREE.HemisphereLight("#ffe6cc", "#2a160c", o.hemi || .9); sc.add(hemi);
  var key = new THREE.DirectionalLight("#ffeedd", o.key || 3.4); key.position.set(-4, 3, 2.5); sc.add(key);
  var rim = new THREE.DirectionalLight("#ff9a55", o.rim || 2.2); rim.position.set(4, 2, -3); sc.add(rim);
  var fill = new THREE.DirectionalLight("#ffd9b8", .6); fill.position.set(2, -1, 4); sc.add(fill);
}

function hero(THREE, P) {
  P.fontsReady().then(function () {
    var st = stage(THREE, stageEl, { alpha: true, fov: 24, exposure: 1.05 });
    light(THREE, st.scene, {});
    var g = new THREE.Group(); st.scene.add(g);
    var bag = P.bag(THREE, {}); bag.position.set(.62, -.9, -.5); bag.rotation.set(0, -.42, .07); g.add(bag);
    var cup = P.cup(THREE, {}); cup.position.set(-.45, -.95, .55); cup.rotation.set(.08, .35, -.2); cup.scale.setScalar(.92); g.add(cup);
    var px = 0, py = 0, tx = 0, ty = 0;
    stageEl.closest(".hero").addEventListener("pointermove", function (e) { tx = (e.clientX / innerWidth - .5); ty = (e.clientY / innerHeight - .5); });
    var spin = 0, spinTo = 0;
    addEventListener("rz-tag", function (e) { spinTo += Math.PI * 2; });
    function place(w, h) {
      var narrow = w / h < 1;
      st.camera.position.set(0, .15, narrow ? 6.6 : 6.4);
      st.camera.lookAt(0, -.05, 0);
      g.position.x = narrow ? 0 : -.1; g.position.y = narrow ? -.3 : 0; g.position.x = narrow ? .12 : -.1;
    }
    place(stageEl.clientWidth, stageEl.clientHeight);
    new ResizeObserver(function () { place(stageEl.clientWidth, stageEl.clientHeight); }).observe(stageEl);
    st.onFrame(function (dt, t) {
      px += (tx - px) * .05; py += (ty - py) * .05; spin += (spinTo - spin) * .045;
      var sp = clamp(-stageEl.getBoundingClientRect().top / innerHeight, 0, 1);
      g.rotation.y = px * .35; g.rotation.x = py * .12;
      bag.position.y = -.9 + Math.sin(t * .8) * .04 + sp * .5;
      cup.position.y = -.95 + Math.sin(t * .9 + 1.4) * .06 + sp * 1.1;
      cup.rotation.y = .35 + spin; cup.rotation.z = -.2 + Math.sin(t * .7) * .03;
    });
    document.documentElement.classList.add("has-3d");
  });
}

function beans(THREE, P) {
  P.fontsReady().then(function () {
    var host = beansEl;
    var st = stage(THREE, host, { alpha: true, fov: 32, exposure: 1 });
    st.scene.fog = new THREE.Fog("#140d09", 6, 14);
    light(THREE, st.scene, { key: 2.6, rim: 2.6, hemi: .5 });
    st.camera.position.set(0, 0, 7); st.camera.lookAt(0, 0, 0);
    var N = mobile ? 34 : 70, geo = P.beanGeometry(THREE), mat = P.beanMaterial(THREE);
    var inst = new THREE.InstancedMesh(geo, mat, N); st.scene.add(inst);
    var seed = 5; function r() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    var B = []; for (var i = 0; i < N; i++) B.push({ x: (r() - .5) * 9, y: (r() - .5) * 8, z: -r() * 7 + 1.5, s: .16 + r() * .12, v: .25 + r() * .35, ax: r() * 6, ay: r() * 6, rx: (r() - .5) * 1.4, ry: (r() - .5) * 1.4 });
    var cup = P.cup(THREE, {}); cup.scale.setScalar(1.25); st.scene.add(cup);
    var M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), S = new THREE.Vector3();
    var sec = document.getElementById("haltung");
    st.onFrame(function (dt, t) {
      var p = progress(sec);
      var narrow = host.clientWidth / host.clientHeight < 1;
      for (var i = 0; i < N; i++) {
        var b = B[i], y = b.y - t * b.v - p * 5 * (1 + b.s * 2);
        y = ((y + 4) % 8 + 8) % 8 - 4;
        E.set(b.ax + t * b.rx, b.ay + t * b.ry, 0); Q.setFromEuler(E);
        V.set(narrow ? b.x * .42 : b.x, y, b.z); S.setScalar(b.s); M.compose(V, Q, S); inst.setMatrixAt(i, M);
      }
      inst.instanceMatrix.needsUpdate = true;
      // Becher kommt von unten links herein und richtet sich auf.
      var c = clamp(p / .6, 0, 1), e = 1 - Math.pow(1 - c, 3);
      cup.position.set(narrow ? .35 : -1.1, (narrow ? -5 : -4.2) + e * (narrow ? 2.5 : 2.7), narrow ? -.4 : .8);
      cup.rotation.set(.25 - e * .1, .4 + e * .5, .9 - e * .75);
    });
  });
}
