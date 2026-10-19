// Atelier Nº 9: Spiegel mit Beispielfoto. Eine Farbe antippen färbt das Haar live um (Haarmaske vorab berechnet,
// das Umfärben passiert im Browser auf einer Leinwand, nichts wird hochgeladen). Die neue Farbe läuft von oben ein.
// Am Computer kommt der Spiegel beim Scrollen in die Mitte und näher, Sätze tauchen daneben auf.
import { SERVICES, euro, fillLive } from "/beispiele/friseur/gemeinsam/buchung.js?v=1";

var root = document.documentElement;
root.classList.add("cx");
var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }

// ---------- Live-Angaben ----------
function live() {
  fillLive();
  var st = $("[data-status]"), open = st && st.classList.contains("is-open"), soon = st && st.classList.contains("is-soon");
  $$("[data-status-dot]").forEach(function (d) { d.className = "dot" + (open ? soon ? " is-soon" : " is-open" : ""); });
}
live(); setInterval(live, 60000);

// ---------- Farbe am Foto ----------
// c: Zielfarbe, g/l: Helligkeit anheben (Platin braucht viel), grad: nur die Längen (Balayage).
var TONES = {
  natur: { name: "Natur", svc: "f-gloss", btn: "Glossing buchen" },
  balayage: { name: "Balayage", c: [222, 184, 128], g: 1.9, l: .06, grad: true, svc: "f-balayage", btn: "Balayage buchen" },
  kupfer: { name: "Kupfer", c: [184, 82, 38], g: 1.55, l: .03, svc: "f-ansatz", btn: "Kupfer buchen" },
  schoko: { name: "Schoko", c: [84, 48, 30], g: .95, l: 0, svc: "f-ansatz", btn: "Schoko buchen" },
  platin: { name: "Platin", c: [236, 224, 202], g: 2.2, l: .16, svc: "f-straehnen", btn: "Platin buchen" },
  rose: { name: "Rosé", c: [214, 150, 152], g: 2.0, l: .08, svc: "f-straehnen", btn: "Rosé buchen" }
};
var cvA = $("#cvA"), cvB = $("#cvB"), toneName = $("#toneName"), toneBook = $("#toneBook"), sw = $$("[data-tone]");
var pix = null, W = 0, H = 0, running = false, cur = "natur";
function loadImg(src) { return new Promise(function (ok, no) { var i = new Image(); i.onload = function () { ok(i); }; i.onerror = no; i.src = src; }); }
Promise.all([loadImg($(".arch__img").currentSrc || $(".arch__img").src), loadImg("/beispiele/friseur/v3/bilder/spiegel-haar.png")]).then(function (r) {
  var img = r[0], mask = r[1]; W = img.naturalWidth; H = img.naturalHeight;
  [cvA, cvB].forEach(function (c) { c.width = W; c.height = H; });
  var g = cvA.getContext("2d"); g.drawImage(img, 0, 0);
  var orig = g.getImageData(0, 0, W, H).data;
  var t = document.createElement("canvas"); t.width = W; t.height = H; var tg = t.getContext("2d"); tg.drawImage(mask, 0, 0, W, H);
  var md = tg.getImageData(0, 0, W, H).data, m = new Float32Array(W * H);
  for (var i = 0; i < W * H; i++) { var x = md[i * 4] / 255; x = clamp((x - .18) / .5, 0, 1); m[i] = x * x * (3 - 2 * x); }
  pix = { orig: orig, m: m };
}).catch(function () { sw.forEach(function (b) { b.disabled = true; }); });

function paint(key) {
  var T = TONES[key], g = cvB.getContext("2d"), out = g.createImageData(W, H), o = pix.orig, d = out.data, m = pix.m;
  d.set(o);
  if (T.c) {
    var cr = T.c[0] / 255, cg = T.c[1] / 255, cb = T.c[2] / 255;
    for (var y = 0; y < H; y++) {
      var ramp = T.grad ? smooth((y / H - .28) / .55) : 1;
      for (var x = 0; x < W; x++) {
        var i = y * W + x, k = m[i] * ramp; if (k < .01) continue;
        var p = i * 4, r = o[p] / 255, gg = o[p + 1] / 255, b = o[p + 2] / 255;
        var L = .299 * r + .587 * gg + .114 * b, Ln = clamp(L * T.g + T.l, 0, 1), f = .3 + 1.15 * Ln;
        k *= .88;
        d[p] = 255 * clamp(r + (clamp(cr * f, 0, 1) - r) * k, 0, 1);
        d[p + 1] = 255 * clamp(gg + (clamp(cg * f, 0, 1) - gg) * k, 0, 1);
        d[p + 2] = 255 * clamp(b + (clamp(cb * f, 0, 1) - b) * k, 0, 1);
      }
    }
  }
  g.putImageData(out, 0, 0);
}
function settle() { cvA.getContext("2d").drawImage(cvB, 0, 0); cvB.classList.remove("is-run"); running = false; }
function tone(key) {
  if (!pix || key === cur) return;
  if (running) settle();
  cur = key; paint(key);
  sw.forEach(function (b) { b.setAttribute("aria-checked", b.dataset.tone === key); });
  toneName.textContent = TONES[key].name;
  toneBook.dataset.svc = TONES[key].svc; toneBook.textContent = TONES[key].btn;
  if (reduce) { settle(); return; }
  running = true; void cvB.offsetWidth; cvB.classList.add("is-run");
  clearTimeout(tone._t); tone._t = setTimeout(settle, 1200);
}
sw.forEach(function (b) { b.addEventListener("click", function () { tone(b.dataset.tone); }); });

// ---------- Leistungen aus der gemeinsamen Liste ----------
var GROUPS = { Damen: ["Schnitt, Föhnen, Hochsteck", "schnitt"], Farbe: ["Für dich gemischt", "farbe"], Herren: ["Schnitt und Bart", "herren"], Kinder: ["Bis 16 Jahre", "locken"] };
(function () {
  var html = "";
  Object.keys(GROUPS).forEach(function (g) {
    html += '<div class="svc__g" data-peek="' + GROUPS[g][1] + '"><h3>' + g + '<small>' + GROUPS[g][0] + '</small></h3><div>';
    SERVICES.filter(function (s) { return s.g === g; }).forEach(function (s) {
      html += '<div class="svc__row" data-book data-svc="' + s.id + '"><span class="svc__n">' + s.name + '</span><span class="svc__m">' + s.min + ' Min.</span><span class="svc__p">' + euro(s.price, s.from) + '</span><button type="button" class="svc__b" aria-label="' + s.name + ' buchen">→</button></div>';
    });
    html += "</div></div>";
  });
  $("#svcList").innerHTML = html;
})();
// Vorschaubild folgt der Maus über den Leistungen.
var peek = $("#peek"), peekImg = $("#peekImg"), pk = { x: 0, y: 0, tx: 0, ty: 0, on: false };
if (matchMedia("(pointer: fine)").matches && !reduce) {
  $("#svcList").addEventListener("pointermove", function (e) {
    var g = e.target.closest(".svc__g"); pk.tx = e.clientX + 150; pk.ty = e.clientY;
    if (!pk.on) { pk.x = pk.tx; pk.y = pk.ty; }
    if (g) { var src = "/beispiele/friseur/v3/bilder/" + g.dataset.peek + ".webp"; if (peekImg.getAttribute("src") !== src) peekImg.src = src; }
    pk.on = !!e.target.closest(".svc__row"); peek.classList.toggle("is-on", pk.on);
  });
  $("#svcList").addEventListener("pointerleave", function () { pk.on = false; peek.classList.remove("is-on"); });
}

// ---------- Stimmen ----------
var Q = [
  ["„Ich hab im Spiegel zuerst meine Mama gesehen, dann mich. Das Platin war genau das, was ich mich nie getraut hätte.“", "Anna, Musterort"],
  ["„Endlich jemand, der mit Locken umgehen kann. Mira hat mir gezeigt, wie ich sie ohne Föhn in Form bringe.“", "Theresa, Nachbarort"],
  ["„Online gebucht, pünktlich drangekommen, und der Bart war nie so sauber. Ich komm wieder.“", "Florian, Musterort"]
], qi = 0, voice = $("#voice");
function quote(d) {
  qi = (qi + d + Q.length) % Q.length; voice.classList.add("is-swap");
  setTimeout(function () { voice.querySelector("[data-q]").textContent = Q[qi][0]; voice.querySelector("[data-c]").textContent = Q[qi][1]; $("#vNo").textContent = (qi + 1) + " / " + Q.length; voice.classList.remove("is-swap"); }, 380);
}
$$("[data-v]").forEach(function (b) { b.addEventListener("click", function () { clearInterval(quote._t); quote(+b.dataset.v); }); });
if (!reduce) quote._t = setInterval(function () { quote(1); }, 8000);

// ---------- Einblenden ----------
var ins = $$(".intro__big, .nums li, .head > *, .svc__g, .steps__list li, .steps__side > *, .who, .salon__in > *");
ins.forEach(function (el, k) { el.setAttribute("data-in", ""); el.style.transitionDelay = (k % 4) * .08 + "s"; });
if (reduce || !("IntersectionObserver" in window)) ins.forEach(function (el) { el.classList.add("is-in"); });
else {
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }); }, { threshold: .15 });
  ins.forEach(function (el) { io.observe(el); });
}

// ---------- Spiegel kommt näher (nur Computer) ----------
var mirror = $(".mirror"), arch = $("#arch"), copy = $(".mirror__copy"), after = $$(".mirror__after p"), nav = $(".nav"), sticky = $("#sticky");
var geo = { dx: 0, s: 1.25 };
function zoomOn() { return !reduce && innerWidth > 900; }
function measure() {
  arch.style.transform = "";
  var r = arch.getBoundingClientRect(), pin = $(".mirror__pin").getBoundingClientRect();
  geo.dx = (pin.left + pin.width / 2) - (r.left + r.width / 2);
  var frame = arch.querySelector(".arch__frame").getBoundingClientRect();
  geo.s = clamp((pin.height * .9) / frame.height, 1, 1.32);
  geo.top = mirror.getBoundingClientRect().top + scrollY; geo.h = mirror.offsetHeight;
}
function frame() {
  var y = scrollY;
  nav.classList.toggle("is-line", y > 10);
  sticky.classList.toggle("is-on", y > innerHeight * .7);
  if (pk.on || peek.classList.contains("is-on")) { pk.x += (pk.tx - pk.x) * .18; pk.y += (pk.ty - pk.y) * .18; peek.style.transform = "translate(" + (pk.x - 120) + "px," + (pk.y - 150) + "px) scale(" + (pk.on ? 1 : .7) + ")"; }
  if (zoomOn()) {
    var p = clamp((y - geo.top) / (geo.h - innerHeight), 0, 1), e = smooth(p / .6);
    arch.style.transform = "translateX(" + (geo.dx * e).toFixed(1) + "px) scale(" + (1 + (geo.s - 1) * e).toFixed(4) + ")";
    copy.style.opacity = (1 - smooth(e * 1.7)).toFixed(3);
    copy.style.transform = "translateX(" + (-80 * e).toFixed(1) + "px)";
    copy.style.pointerEvents = e > .4 ? "none" : "";
    after.forEach(function (el, k) { var a = smooth((p - .45 - k * .1) / .2); el.style.opacity = a.toFixed(3); el.style.transform = "translateY(" + (24 * (1 - a)).toFixed(1) + "px)"; });
  }
  requestAnimationFrame(frame);
}
function reset() { if (!zoomOn()) { arch.style.transform = ""; copy.style.opacity = ""; copy.style.transform = ""; } measure(); }
addEventListener("resize", reset); addEventListener("load", measure);
measure(); requestAnimationFrame(frame);
