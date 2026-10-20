// Seide: ein Haarvorhang aus tausenden Strähnen fährt oben die Seite mit. Start: fließende Welle, die man mit
// Maus oder Finger kämmt. Schnitt: das Haar fällt glatt, eine Schere schneidet eine exakte Linie, die Spitzen fallen.
// Farbe: die neue Farbe läuft vom Ansatz in die Spitzen. Styling: glatt, Wellen, Locken. Danach Preise, Team, Buchung.
// Alles hängt an einem rAF-Takt; die Werte gleiten gedämpft zu Zielwerten, die sich aus der Scrolllage ergeben.
import { reduce, mobile, webglOk, loadThree } from "/beispiele/_shared/stage3d.js";
import { fillLive, isOpen } from "/beispiele/friseur/gemeinsam/buchung.js?v=1";

var root = document.documentElement;
root.classList.add("cx");
var fine = !!(window.matchMedia && matchMedia("(pointer: fine)").matches) && !mobile;
var BAR = parseFloat(getComputedStyle(root).getPropertyValue("--bar")) || 45;
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function damp(cur, to, k, dt) { return cur + (to - cur) * (1 - Math.exp(-k * dt)); }
function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
function lin(y, a, b) { return clamp((y - a) / (b - a || 1), 0, 1); }
var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

// ---------- Live-Angaben (offen/geschlossen, nächster freier Termin) ----------
function live() {
  fillLive();
  var st = $("[data-status]"), open = st && st.classList.contains("is-open"), soon = st && st.classList.contains("is-soon");
  $$("[data-status-dot]").forEach(function (d) { d.className = "dot" + (open ? soon ? " is-soon" : " is-open" : ""); });
}
live(); setInterval(live, 60000);

// ---------- Weiches Scrollen (Maus/Trackpad am Computer) ----------
var sc = { y: scrollY, to: scrollY, on: fine && !reduce, busy: false };
function maxY() { return root.scrollHeight - innerHeight; }
if (sc.on) {
  addEventListener("wheel", function (e) {
    if (e.ctrlKey || e.defaultPrevented || isOpen()) return;
    var t = e.target.closest && e.target.closest(".looks"); if (t && Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    var d = e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? innerHeight : 1);
    if (!sc.busy) sc.y = sc.to = scrollY;
    sc.to = clamp(sc.to + d, 0, maxY()); sc.busy = true;
  }, { passive: false });
  addEventListener("scroll", function () { if (!sc.busy) sc.y = sc.to = scrollY; }, { passive: true });
}
document.addEventListener("click", function (e) {
  var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
  var id = a.getAttribute("href"); if (id.length < 2) return;
  var el = id === "#start" ? document.body : document.querySelector(id); if (!el) return;
  e.preventDefault();
  var off = el.classList.contains("pinned") ? BAR : BAR + 70;
  var to = clamp(el === document.body ? 0 : el.getBoundingClientRect().top + scrollY - off + (el.classList.contains("pinned") ? innerHeight * .35 : 0), 0, maxY());
  if (sc.on) { if (!sc.busy) sc.y = scrollY; sc.to = to; sc.busy = true; }
  else scrollTo({ top: to, behavior: reduce ? "auto" : "smooth" });
});

// ---------- Einblenden ----------
var ins = $$(".hero .copy > *, .pin .copy > *, .sheet__head > *, .row, .person, .quotes blockquote, .salon > *, .finale__in > *");
ins.forEach(function (el, k) { el.setAttribute("data-in", ""); el.style.transitionDelay = (k % 5) * .07 + "s"; });
if (reduce || !("IntersectionObserver" in window)) ins.forEach(function (el) { el.classList.add("is-in"); });
else {
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }); }, { threshold: .15 });
  ins.forEach(function (el) { io.observe(el); });
}

// ---------- Preise: Reiter ----------
var tabs = $$(".tabs [role=tab]");
function tab(b, focus) {
  tabs.forEach(function (t) { var on = t === b; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; document.getElementById(t.getAttribute("aria-controls")).hidden = !on; });
  if (focus) b.focus();
}
tabs.forEach(function (b, i) {
  b.addEventListener("click", function () { tab(b); });
  b.addEventListener("keydown", function (e) {
    var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return;
    e.preventDefault(); tab(tabs[(i + d + tabs.length) % tabs.length], true);
  });
});

// ---------- Looks: Pfeile und Ziehen mit der Maus ----------
var looks = $("#looksRow");
$$("[data-looks]").forEach(function (b) { b.addEventListener("click", function () { looks.scrollBy({ left: +b.dataset.looks * looks.clientWidth * .6, behavior: reduce ? "auto" : "smooth" }); }); });
(function () {
  var down = false, x0 = 0, s0 = 0, moved = 0;
  looks.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; moved = 0; x0 = e.clientX; s0 = looks.scrollLeft; looks.classList.add("is-drag"); });
  addEventListener("pointermove", function (e) { if (!down) return; moved = Math.max(moved, Math.abs(e.clientX - x0)); looks.scrollLeft = s0 - (e.clientX - x0); });
  addEventListener("pointerup", function () { if (!down) return; down = false; looks.classList.remove("is-drag"); });
})();

// ---------- Schwebender Knopf am Handy ----------
var sticky = $("#sticky"), finale = $("#termin");

// ---------- Farben und Styling ----------
var COLORS = [
  ["#2c1a10", "#6b4428", "#e6c08c"],
  ["#4a1608", "#9e3c16", "#ee9150"],
  ["#1c110b", "#45291a", "#7a4e34"],
  ["#8a7963", "#d6c8b1", "#f6efe4"]
];
var STY = [{ w: 0, c: 3 }, { w: 1, c: 2.2 }, { w: 1, c: 6.5 }];
var colChips = $$("[data-col]"), styChips = $$("[data-sty]");
var state = { col: 0, sty: 0, scrollCol: 0, scrollSty: 0 };
var H = null; // Haar, sobald geladen
function pickCol(i) {
  if (i === state.col) return; state.col = i;
  colChips.forEach(function (b, k) { b.setAttribute("aria-checked", k === i); });
  if (H) H.color(COLORS[i]);
}
function pickSty(i) { state.sty = i; styChips.forEach(function (b, k) { b.setAttribute("aria-checked", k === i); }); }
colChips.forEach(function (b) { b.addEventListener("click", function () { pickCol(+b.dataset.col); }); });
styChips.forEach(function (b) { b.addEventListener("click", function () { pickSty(+b.dataset.sty); }); });

// ---------- Scrollmarken ----------
var secs = { schnitt: $("#schnitt"), farbe: $("#farbe"), styling: $("#styling"), preise: $("#preise") }, M = {}, vh = innerHeight - BAR;
function measure() {
  vh = innerHeight - BAR;
  Object.keys(secs).forEach(function (k) { var el = secs[k], t = el.getBoundingClientRect().top + scrollY - BAR; M[k] = { a: t, b: t + el.offsetHeight - vh, h: el.offsetHeight }; });
  M.fin = finale.getBoundingClientRect().top + scrollY - innerHeight;
}
measure();
addEventListener("resize", measure);
addEventListener("load", measure);

var nogl = reduce || !webglOk();
// Für Bildschirmfotos: ?standbild springt sofort auf die Zielwerte statt weich hinzugleiten.
var SNAP = /[?&]standbild/.test(location.search);
if (nogl) root.classList.add("nogl");

// Zielwerte aus der Scrolllage. side: 1 = Vorhang rechts, -1 = links.
function targets(y) {
  var t = { flow: 0, cut: 0, side: 1, alpha: 1, show: true, fin: false };
  t.flow = smooth(lin(y, M.schnitt.a - vh * .85, M.schnitt.a + vh * .05));
  var pS = lin(y, M.schnitt.a, M.schnitt.b);
  t.cut = lin(pS, .16, .78);
  t.side = 1 - 2 * smooth(lin(y, M.schnitt.b + vh * .1, M.farbe.a)) + 2 * smooth(lin(y, M.farbe.b + vh * .1, M.styling.a));
  t.pF = lin(y, M.farbe.a, M.farbe.b); t.pY = lin(y, M.styling.a, M.styling.b);
  t.inF = y > M.farbe.a - vh * .3 && y < M.farbe.b + vh * .5;
  t.inY = y > M.styling.a - vh * .3;
  if (y > M.preise.a + 2) t.show = false;
  if (y > M.fin) { t.show = true; t.fin = true; t.flow = 0; t.cut = 0; t.alpha = .42; }
  return t;
}

// ---------- Schere ----------
var blade = $("#blade"), bladeA = blade.querySelector(".blade__a"), bladeB = blade.querySelector(".blade__b"), bladeLine = blade.querySelector(".blade__line");

// ---------- Kämmen mit Maus oder Finger ----------
var ptr = { x: 9, y: 9, px: 9, py: 9, vx: 0, vy: 0, has: false };
function setPtr(cx, cy) { ptr.x = cx; ptr.y = cy; ptr.has = true; }
addEventListener("pointermove", function (e) { if (e.pointerType === "mouse") setPtr(e.clientX, e.clientY); }, { passive: true });
addEventListener("touchstart", function (e) { var t = e.touches[0]; ptr.px = t.clientX; ptr.py = t.clientY; setPtr(t.clientX, t.clientY); }, { passive: true });
addEventListener("touchmove", function (e) { var t = e.touches[0]; setPtr(t.clientX, t.clientY); }, { passive: true });

// ---------- 3D ----------
if (!nogl) loadThree().then(function (THREE) { return import("/beispiele/friseur/v3/haar.js?v=2").then(function (m) { start(THREE, m.haar); }); }).catch(function (e) { console.warn(e); root.classList.add("nogl"); });

function start(THREE, haar) {
  var host = $("#gl");
  var renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.75 : 1.5));
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor(0, 0);
  host.appendChild(renderer.domElement);
  var scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
  var N = mobile ? 1700 : 3800, Mseg = mobile ? 40 : 56;
  H = haar(THREE, scene, { n: N, m: Mseg, colors: COLORS[0] });
  var U = H.u, W = 1, Hh = 1, A = 1, LAY = null;

  // Lage von Welle und Vorhang je nach Bildschirmform.
  function layout() {
    W = host.clientWidth || innerWidth; Hh = host.clientHeight || innerHeight; A = W / Hh;
    renderer.setSize(W, Hh, false);
    cam.left = -A; cam.right = A; cam.updateProjectionMatrix();
    U.uPx.value = 2 / Hh;
    var small = A < .9;
    if (small) LAY = { P: [[-.3 * A, 1.3], [1.6 * A, .85], [-1.5 * A, .35], [.35 * A, -.25]], band: .42, cx: 0, w: Math.min(1.7 * A, .95), top: 1.18, len: 1.3, cutY: .2, fin: [[-.2 * A, -.15], [1.4 * A, -.4], [-1.2 * A, -.7], [.5 * A, -1.4]] };
    else LAY = { P: [[.12 * A, 1.42], [1.3 * A, .5], [-.22 * A, -.08], [.72 * A, -1.48]], band: .72, cx: .5 * A, w: Math.min(.98, .5 * A), top: 1.04, len: 1.86, cutY: -.34, fin: [[.62 * A, 1.4], [1.25 * A, .3], [.3 * A, -.1], [.95 * A, -1.4]] };
    U.uMR.value = small ? .2 : .24;
  }
  layout();
  if ("ResizeObserver" in window) new ResizeObserver(function () { layout(); measure(); }).observe(host); else addEventListener("resize", layout);

  var v = { flow: 0, cut: 0, side: 1, alpha: 0, wave: 0, curl: 3, fin: 0 }, grow = 0, frames = 0, tsum = 0, tuned = 0, wasShow = true;
  glFrame = function (now, dt) {
    var y = scrollY, t = targets(y);
    if (!t.show || document.hidden) { if (wasShow) { renderer.domElement.style.visibility = "hidden"; blade.style.opacity = 0; } wasShow = false; return; }
    if (!wasShow) { renderer.domElement.style.visibility = ""; v.flow = t.flow; v.cut = t.cut; v.side = t.side; v.alpha = t.alpha; v.fin = t.fin ? 1 : 0; }
    wasShow = true;
    // Farbe und Styling folgen der Scrolllage, wenn sich der Abschnittsteil ändert; Tippen geht immer.
    if (t.inF) { var ci = t.pF < .12 ? 0 : t.pF < .42 ? 1 : t.pF < .72 ? 2 : 3; if (ci !== state.scrollCol) { state.scrollCol = ci; pickCol(ci); } }
    if (t.inY) { var si = t.pY < .22 ? 0 : t.pY < .62 ? 1 : 2; if (si !== state.scrollSty) { state.scrollSty = si; pickSty(si); } }
    var wantSty = t.inY && !t.fin ? STY[state.sty] : { w: t.fin ? 0 : 0, c: v.curl };
    if (!t.inY && !t.fin && state.sty !== 0 && y < M.styling.a - vh * .3) { pickSty(0); state.scrollSty = 0; }
    if (!t.inF && y < M.farbe.a - vh * .3 && state.col !== 0) { pickCol(0); state.scrollCol = 0; }

    var k = 5.5;
    v.flow = damp(v.flow, t.flow, k, dt); v.cut = damp(v.cut, t.cut, 7, dt); v.side = damp(v.side, t.side, 4, dt);
    v.alpha = damp(v.alpha, t.alpha, 3, dt); v.wave = damp(v.wave, wantSty.w, 2.6, dt); v.curl = damp(v.curl, wantSty.c, 2.2, dt);
    v.fin = damp(v.fin, t.fin ? 1 : 0, 6, dt);
    grow = Math.min(1, grow + dt / 2.4);
    if (SNAP) { v.flow = t.flow; v.cut = t.cut; v.side = t.side; v.alpha = t.alpha; v.wave = wantSty.w; v.curl = wantSty.c; v.fin = t.fin ? 1 : 0; grow = 1; U.uFill.value = 1; }

    var L = LAY, P = L.P;
    if (v.fin > .001) P = P.map(function (p, i) { return [p[0] + (L.fin[i][0] - p[0]) * v.fin, p[1] + (L.fin[i][1] - p[1]) * v.fin]; });
    U.uP0.value.set(P[0][0], P[0][1]); U.uP1.value.set(P[1][0], P[1][1]); U.uP2.value.set(P[2][0], P[2][1]); U.uP3.value.set(P[3][0], P[3][1]);
    U.uBand.value = L.band;
    var cx = A < .9 ? 0 : L.cx * v.side;
    U.uCurt.value.set(cx, L.w, L.top, L.len); U.uCutY.value = L.cutY;
    U.uFlow.value = v.flow; U.uCut.value = v.cut; U.uAlpha.value = v.alpha; U.uWave.value = v.wave; U.uCurl.value = v.curl;
    U.uGrow.value = 1 - Math.pow(1 - grow, 3);
    U.uT.value = now / 1000;
    if (U.uFill.value < 1) U.uFill.value = Math.min(1, U.uFill.value + dt / 1.7);
    // Zeiger in Weltkoordinaten, Geschwindigkeit gedämpft (Strähnen federn zurück, wenn er stillsteht)
    var r = host.getBoundingClientRect();
    var mx = ((ptr.x - r.left) / W * 2 - 1) * A, my = 1 - (ptr.y - r.top) / Hh * 2;
    var pmx = ((ptr.px - r.left) / W * 2 - 1) * A, pmy = 1 - (ptr.py - r.top) / Hh * 2;
    var vx = ptr.has ? (mx - pmx) / dt : 0, vy = ptr.has ? (my - pmy) / dt : 0;
    ptr.px = ptr.x; ptr.py = ptr.y;
    U.uMV.value.set(damp(U.uMV.value.x, vx, 7, dt), damp(U.uMV.value.y, vy, 7, dt));
    U.uM.value.set(mx, my);
    H.showPieces(v.cut > .001 && v.cut < .999 && v.flow > .5);

    // Schere entlang der Schnittkante
    var b = v.cut * 1.5 - .12, op = t.fin ? 0 : smooth(lin(b, -.12, 0)) * (1 - smooth(lin(b, 1, 1.12))) * smooth(lin(v.flow, .85, 1));
    var guide = t.fin ? 0 : smooth(lin(v.flow, .9, 1)) * (1 - smooth(lin(v.cut, .02, .9))) * (y < M.schnitt.b + vh * .2 ? 1 : 0);
    if (op > .01 || guide > .01) {
      var wid = L.w * (1 - .18 * clamp((L.top - L.cutY) / L.len, 0, 1));
      var bx = cx + (clamp(b, 0, 1) - .5) * wid, sx = (bx / A + 1) / 2 * W + r.left, sy = (1 - L.cutY) / 2 * Hh + r.top;
      var lx = ((cx - wid * .56) / A + 1) / 2 * W + r.left, lw = wid * 1.12 / (2 * A) * W;
      blade.style.opacity = 1;
      blade.style.transform = "translate(" + sx.toFixed(1) + "px," + sy.toFixed(1) + "px)";
      var svg = blade.querySelector("svg"); svg.style.opacity = op;
      var ang = (Math.sin(b * 46) * .5 + .5) * 20;
      bladeA.style.transform = "rotate(" + (-ang) + "deg)"; bladeB.style.transform = "rotate(" + ang + "deg)";
      bladeLine.style.opacity = guide; bladeLine.style.transform = "translate(" + (lx - sx).toFixed(1) + "px,0)"; bladeLine.style.width = lw.toFixed(0) + "px";
    } else blade.style.opacity = 0;

    renderer.render(scene, cam);
    // Am Anfang messen: zu langsam, dann weniger Strähnen.
    if (tuned < 2 && grow >= 1) {
      frames++; tsum += dt;
      if (frames === 60) { var avg = tsum / frames; if (avg > .024) { N = Math.round(N * .6); H.count(N); } tuned++; frames = 0; tsum = 0; }
    }
  };
}

// ---------- Ein Takt für alles: weiches Scrollen, Knopf, Hintergrund, Haar ----------
var glFrame = null, last = 0, bg = $(".bg"), nav = $(".nav");
function tick(now) {
  requestAnimationFrame(tick);
  var dt = Math.min(.05, last ? (now - last) / 1000 : .016); last = now;
  if (sc.busy) {
    sc.y = damp(sc.y, sc.to, 9, dt);
    if (Math.abs(sc.to - sc.y) < .5) { sc.y = sc.to; sc.busy = false; }
    scrollTo(0, sc.y);
  }
  var y = scrollY;
  sticky.classList.toggle("is-on", y > vh * .8 && y < M.fin + innerHeight * .4);
  nav.classList.toggle("is-solid", y > M.preise.a - 80);
  bg.classList.toggle("is-l", y > M.schnitt.b + vh * .6 && y < M.farbe.b + vh * .6);
  if (glFrame) glFrame(now, dt);
}
requestAnimationFrame(tick);
