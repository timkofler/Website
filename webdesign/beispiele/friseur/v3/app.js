// Mähne: Oben schaltet man Haarfarben durch. Jede Farbe ist ein echter Look (freigestelltes Foto), die ganze Bühne
// wechselt in einem Kreis vom angetippten Knopf aus, die Seitenfarben ziehen mit. Darunter stapeln sich die
// Leistungen als Karten und die Looks laufen am Computer beim Scrollen quer durch.
import { SERVICES, euro, fillLive } from "/beispiele/friseur/gemeinsam/buchung.js?v=1";

var root = document.documentElement;
root.classList.add("cx");
var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
var IMG = "/beispiele/friseur/v3/bilder/";

// ---------- Live-Angaben ----------
function live() {
  fillLive();
  var st = $("[data-status]"), open = st && st.classList.contains("is-open"), soon = st && st.classList.contains("is-soon");
  $$("[data-status-dot]").forEach(function (d) { d.className = "dot" + (open ? soon ? " is-soon" : " is-open" : ""); });
}
live(); setInterval(live, 60000);

// ---------- Farben ----------
// bg: Bühne, ink: Schrift darauf, word: großes Wort hinter dem Model, acc: Akzent für den Rest der Seite.
var TONES = [
  { k: "balayage", name: "Balayage", line: "Sonne, von Hand gemalt.", svc: "f-balayage", bg: "#f4c542", ink: "#1f1608", word: "#6b3d14", acc: "#f4c542" },
  { k: "schwarz", name: "Schwarz", line: "Glänzt wie Lack.", svc: "f-gloss", bg: "#ff5a36", ink: "#1a0f0b", word: "#ffcfbf", acc: "#ff5a36" },
  { k: "platin", name: "Platin", line: "Kühl, hell und mutig.", svc: "f-straehnen", bg: "#2141c9", ink: "#ffffff", word: "#f3e7cf", acc: "#8fa6ff" },
  { k: "kupfer", wide: true, name: "Kupfer", line: "Warm wie Herbstlaub.", svc: "f-ansatz", bg: "#12524c", ink: "#fff3e6", word: "#ff8a5b", acc: "#ff8a5b" },
  { k: "rose", name: "Rosé", line: "Zart, aber mit Ansage.", svc: "f-straehnen", bg: "#2b1f5c", ink: "#ffe9f1", word: "#e98ab0", acc: "#e98ab0" },
  { k: "kirsch", name: "Kirschrot", line: "Kurz, frech und knallig.", svc: "f-ansatz", bg: "#bfe8d6", ink: "#10261f", word: "#e0244b", acc: "#e0244b" }
];
function svc(id) { for (var i = 0; i < SERVICES.length; i++) if (SERVICES[i].id === id) return SERVICES[i]; }
var stage = $("#farben"), layA = $("#layA"), layB = $("#layB"), chips = $$("[data-tone]");
var cur = 0, busy = false, doneT = 0;

function fill(layer, t) {
  layer.style.setProperty("--l-bg", t.bg); layer.classList.toggle("is-wide", !!t.wide); layer.dataset.k = t.k;
  layer.style.setProperty("--l-word", t.word);
  layer.style.setProperty("--l-line", t.ink === "#ffffff" || t.ink.charAt(1) === "f" ? "rgba(255,255,255,.55)" : "rgba(20,12,8,.45)");
  var chars = t.name.toUpperCase().split("").map(function (c, i) { return '<span style="--i:' + i + '">' + c + "</span>"; }).join("");
  layer.querySelectorAll(".layer__word").forEach(function (w) { w.innerHTML = chars; });
  var img = layer.querySelector(".layer__img");
  if (img.getAttribute("src") !== IMG + "farbe-" + t.k + ".webp") img.src = IMG + "farbe-" + t.k + ".webp";
  fit(layer);
}
// Das große Wort füllt die Breite, wird aber nie höher als etwa 40 % der Bühne.
function fit(layer) {
  var w = layer.querySelector(".layer__word"); if (!w) return;
  var W = stage.clientWidth, H = stage.clientHeight;
  w.style.setProperty("--fs", "100px");
  var nat = w.scrollWidth || 1, fs = Math.min(100 * W * .94 / nat, H * (innerWidth <= 860 ? .42 : .55));
  layer.style.setProperty("--fs", fs.toFixed(1) + "px");
  layer.querySelectorAll(".layer__word").forEach(function (x) { x.style.removeProperty("--fs"); });
  layer.style.setProperty("--wy", (innerWidth <= 860 ? 40 : 37) + "%");
}
// Schriftfarben und Texte wechseln erst, wenn der Kreis schon über die Bühne läuft, sonst blitzt die Schrift kurz grau auf.
function theme(t) {
  var s = root.style;
  s.setProperty("--st-bg", t.bg); s.setProperty("--st-ink", t.ink); s.setProperty("--st-acc", t.acc);
  var m = $('meta[name="theme-color"]'); if (m) m.setAttribute("content", t.bg);
  $("#toneNo").textContent = String(TONES.indexOf(t) + 1).padStart(2, "0");
  $("#toneName").textContent = t.name; $("#toneLine").textContent = t.line;
  var sv = svc(t.svc); $("#tonePrice").textContent = sv ? euro(sv.price, sv.from) : "";
  $("#toneBook").dataset.svc = t.svc;
}
function marks() { chips.forEach(function (b, i) { b.setAttribute("aria-checked", i === cur); }); }
// Alle Looks gleich vorladen; der Wechsel startet erst, wenn das neue Foto wirklich da ist.
var cache = {};
function load(t) {
  var im = cache[t.k];
  if (!im) { im = cache[t.k] = new Image(); im.decoding = "async"; im.src = IMG + "farbe-" + t.k + ".webp"; }
  return new Promise(function (ok) {
    var done = function () { (im.decode ? im.decode() : Promise.resolve()).then(ok, ok); };
    if (im.complete && im.naturalWidth) done(); else { im.addEventListener("load", done, { once: true }); im.addEventListener("error", ok, { once: true }); }
  });
}
// Zwei Ebenen tauschen die Rollen: Die neue läuft im Kreis über die alte und bleibt dann einfach liegen.
var base = layA, top = layB, run = 0, themeT = 0;
function finish() {
  clearTimeout(doneT); clearTimeout(themeT);
  if (!busy) return;
  top.classList.add("is-base"); top.classList.remove("is-run"); base.classList.remove("is-base");
  var b = base; base = top; top = b; busy = false;
  theme(TONES[cur]);
}
function tone(i, x, y) {
  if (i === cur) return;
  finish();
  cur = i; marks();
  var t = TONES[i], my = ++run;
  load(t).then(function () {
    if (my !== run) return;
    fill(top, t);
    var img = top.querySelector(".layer__img");
    return (img.decode ? img.decode() : Promise.resolve()).catch(function () {});
  }).then(function () {
    if (my !== run) return;
    if (reduce) { busy = true; finish(); return; }
    var r = stage.getBoundingClientRect(); x = x == null ? r.width / 2 : x; y = y == null ? r.height * .85 : y;
    var R = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y)) + 20;
    top.style.setProperty("--x", x + "px"); top.style.setProperty("--y", y + "px"); top.style.setProperty("--r", R + "px");
    busy = true; void top.offsetWidth; top.classList.add("is-run");
    themeT = setTimeout(function () { theme(t); }, 380);
    doneT = setTimeout(finish, 1150);
  });
}
fill(layA, TONES[0]); theme(TONES[0]); marks(); load(TONES[0]);
chips.forEach(function (b, i) {
  b.addEventListener("click", function (e) {
    stopAuto(); stage.classList.add("is-touched");
    var r = stage.getBoundingClientRect(), br = b.getBoundingClientRect();
    tone(i, e.clientX ? e.clientX - r.left : br.left + br.width / 2 - r.left, e.clientY ? e.clientY - r.top : br.top + br.height / 2 - r.top);
  });
});
// Pfeiltasten in der Farbauswahl
$(".chips").addEventListener("keydown", function (e) {
  var d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0; if (!d) return;
  e.preventDefault(); stopAuto(); var n = (cur + d + TONES.length) % TONES.length; chips[n].focus(); chips[n].click();
});
addEventListener("load", function () { TONES.forEach(load); });

// Von selbst weiterschalten, bis jemand selbst eine Farbe wählt. Pausiert, wenn die Bühne nicht zu sehen ist.
var autoT = 0, autoOn = !reduce && !/standbild/.test(location.search), stageVis = true;
function next() {
  if (!autoOn) return;
  if (stageVis && !document.hidden && !busy) {
    var n = (cur + 1) % TONES.length, r = stage.getBoundingClientRect(), br = chips[n].getBoundingClientRect();
    tone(n, br.left + br.width / 2 - r.left, br.top + br.height / 2 - r.top);
  }
  autoT = setTimeout(next, 4200);
}
function stopAuto() { autoOn = false; clearTimeout(autoT); }
if (autoOn) autoT = setTimeout(next, 3200);
if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { stageVis = es[0].isIntersecting; }, { threshold: .35 }).observe(stage);

// Maus verschiebt Wort und Model leicht gegeneinander.
var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
if (!reduce && matchMedia("(pointer: fine)").matches) {
  stage.addEventListener("pointermove", function (e) { var r = stage.getBoundingClientRect(); mouse.tx = (e.clientX - r.left) / r.width - .5; mouse.ty = (e.clientY - r.top) / r.height - .5; });
  stage.addEventListener("pointerleave", function () { mouse.tx = mouse.ty = 0; });
}

// ---------- Leistungen als Karten ----------
var CARDS = [
  { g: "Damen", t: "Schnitt", sub: "Waschen, Schneiden, Föhnen. Mit Beratung, die dich ernst nimmt.", img: "svc-schnitt.webp", cap: "Schnitt mit Lena", bg: "#ff5a36", ink: "#1a0f0b" },
  { g: "Farbe", t: "Farbe", sub: "Für dich gemischt, nie aus der Tube. Den genauen Preis sagen wir dir vorher.", img: "svc-farbe.webp", cap: "Balayage mit Sophie", bg: "#2141c9", ink: "#ffffff" },
  { g: "Herren", t: "Herren", sub: "Klassisch, Fade oder einfach kürzer. Samstag schon ab acht Uhr.", img: "svc-herren.webp", cap: "Schnitt & Bart mit Jonas", bg: "#12524c", ink: "#fff3e6" },
  { g: "Kinder", t: "Kids", sub: "Mit Geduld, Zöpfen und einem Lolli für danach.", img: "look-zoepfe.webp", cap: "Zöpfe flechten", bg: "#f4c542", ink: "#1f1608" }
];
(function () {
  var html = "";
  CARDS.forEach(function (c, k) {
    html += '<article class="card" style="--k:' + k + ";--cb:" + c.bg + ";--ci:" + c.ink + '"><div><h3 class="card__h">' + c.t + '</h3><p class="card__sub">' + c.sub + '</p><div class="card__rows">';
    SERVICES.filter(function (s) { return s.g === c.g; }).forEach(function (s) {
      html += '<div class="row" role="button" tabindex="0" data-book data-svc="' + s.id + '" aria-label="' + s.name + ' buchen"><span class="row__n">' + s.name + '</span><span class="row__m">' + s.min + ' Min.</span><span class="row__p">' + euro(s.price, s.from) + "</span></div>";
    });
    html += '</div></div><div class="card__img"><img src="' + IMG + c.img + '" alt="" width="512" height="640" loading="lazy"><span>' + c.cap + "</span></div></article>";
  });
  $("#stack").innerHTML = html;
  $("#stack").addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.matches(".row")) { e.preventDefault(); e.target.click(); } });
})();
var cards = $$(".card");

// ---------- Looks quer (nur Computer) ----------
var looks = $("#looks"), track = $("#looksTrack"), pin = { on: false, dist: 0, top: 0 };
function pinOn() { return !reduce && innerWidth > 860; }
function measureLooks() {
  pin.on = pinOn(); root.classList.toggle("cx-pin", pin.on);
  if (!pin.on) { track.style.transform = ""; looks.style.removeProperty("--lh"); return; }
  track.style.transform = "";
  pin.dist = Math.max(0, track.scrollWidth - innerWidth);
  looks.style.setProperty("--lh", (innerHeight + pin.dist) + "px");
  pin.top = looks.getBoundingClientRect().top + scrollY;
}

// ---------- Einblenden ----------
var ins = $$("[data-in]");
if (reduce || !("IntersectionObserver" in window)) ins.forEach(function (el) { el.classList.add("is-in"); });
else {
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }); }, { threshold: .15 });
  ins.forEach(function (el, k) { el.style.transitionDelay = (k % 3) * .08 + "s"; io.observe(el); });
}

// ---------- Ein Takt für alles ----------
var nav = $("#nav"), sticky = $("#sticky"), band = $("#band"), layers = $(".stage__layers"), bandX = 0, lastY = scrollY, t0 = performance.now();
function frame(now) {
  var y = scrollY, dt = Math.min(50, now - t0); t0 = now;
  var sh = stage.offsetHeight;
  nav.classList.toggle("is-solid", y > sh - 70); nav.classList.toggle("is-tint", y > 8);
  sticky.classList.toggle("is-on", y > sh * .8);
  if (!reduce) {
    if (y < sh) layers.style.transform = "translateY(" + (y * .28).toFixed(1) + "px)";
    mouse.x += (mouse.tx - mouse.x) * .06; mouse.y += (mouse.ty - mouse.y) * .06;
    $$(".layer__word").forEach(function (w) { w.style.translate = (mouse.x * -26).toFixed(1) + "px " + (mouse.y * -14).toFixed(1) + "px"; });
    $$(".layer__img").forEach(function (im) { im.style.translate = (mouse.x * 18).toFixed(1) + "px " + (mouse.y * 8).toFixed(1) + "px"; });
    // Laufband: läuft langsam und zieht beim Scrollen an
    var v = Math.abs(y - lastY); bandX -= dt * .045 + v * .6; var half = band.scrollWidth / 2; if (-bandX > half) bandX += half;
    band.style.transform = "translateX(" + bandX.toFixed(1) + "px)";
    // Karten werden kleiner, sobald die nächste drüberrutscht
    for (var k = 0; k < cards.length - 1; k++) {
      var a = cards[k].getBoundingClientRect(), b = cards[k + 1].getBoundingClientRect();
      var p = clamp((a.bottom - b.top) / a.height, 0, 1);
      cards[k].style.setProperty("--s", (1 - p * .06).toFixed(4));
    }
    if (pin.on) { var pp = clamp((y - pin.top) / Math.max(1, looks.offsetHeight - innerHeight), 0, 1); track.style.transform = "translateX(" + (-pp * pin.dist).toFixed(1) + "px)"; }
  }
  lastY = y;
  requestAnimationFrame(frame);
}
function resize() { fit(layA); fit(layB); measureLooks(); }
addEventListener("resize", resize); addEventListener("load", resize);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
resize(); requestAnimationFrame(frame);
