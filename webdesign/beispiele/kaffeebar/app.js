// röstzeit: weiches Scrollen, ein gemeinsamer Takt für alle Scroll-Effekte, 3D im Hero und bei den Bohnen,
// Karte mit Reitern, waagrechte Rösterei-Strecke, Gästestimmen, Standorte mit Live-Status und ein Bestellfenster.
// Alles, was am Scrollen hängt, gleitet seinem Ziel nach (statt bei jedem Mausrad-Ruck zu springen).
import { reduce, mobile, webglOk, whenNear, loadThree, stage } from "/beispiele/_shared/stage3d.js";

document.documentElement.classList.add("rz");
var fine = !!(window.matchMedia && matchMedia("(pointer: fine)").matches) && !mobile;
var BAR = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--bar")) || 45;
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function damp(cur, to, k, dt) { return cur + (to - cur) * (1 - Math.exp(-k * dt)); }
function eur(n) { return "€ " + n.toFixed(2).replace(".", ","); }
var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return document.querySelectorAll(s); };
var panel = $("#panel");

// ---------- Weiches Scrollen (nur Maus/Trackpad am Computer) ----------
// Das Mausrad setzt ein Ziel, die Seite gleitet dorthin. Tastatur, Scrollbalken und Anker funktionieren weiter.
var sc = { y: scrollY, to: scrollY, on: fine && !reduce, busy: false };
function maxY() { return document.documentElement.scrollHeight - innerHeight; }
function goTo(id) {
  var el = id === "#top" ? document.body : document.querySelector(id); if (!el) return false;
  var top = clamp(el.getBoundingClientRect().top + scrollY - (id === "#top" ? 0 : BAR + 50), 0, maxY());
  if (sc.on) { if (!sc.busy) sc.y = scrollY; sc.to = top; sc.busy = true; } else window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
  return true;
}
if (sc.on) {
  document.documentElement.classList.add("smooth");
  addEventListener("wheel", function (e) {
    if (e.ctrlKey || e.defaultPrevented || panel.open) return;
    e.preventDefault();
    var d = e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? innerHeight : 1);
    if (!sc.busy) sc.y = sc.to = scrollY;
    sc.to = clamp(sc.to + d, 0, maxY()); sc.busy = true;
  }, { passive: false });
  addEventListener("scroll", function () { if (!sc.busy) sc.y = sc.to = scrollY; }, { passive: true });
}
document.addEventListener("click", function (e) {
  var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a || a.closest(".panel")) return;
  if (goTo(a.getAttribute("href"))) e.preventDefault();
});

// ---------- Zeilen, Buchstaben-Wirbel, Preisschild ----------
var io = "IntersectionObserver" in window;
function onView(els, cb, th) {
  if (reduce || !io) { els.forEach(cb); return; }
  var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { cb(e.target); o.unobserve(e.target); } }); }, { threshold: th || .25 });
  els.forEach(function (el) { o.observe(el); });
}
onView($$("[data-lines]"), function (el) { el.classList.add("is-in"); });

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
if (io && !reduce) onView($$("[data-scramble][data-on-view]"), function (el) {
  var to = el.textContent; el.textContent = to.replace(/[0-9]/g, "0");
  setTimeout(function () { scramble(el, to, 900); }, 250);
}, .6);

var TAGS = [
  { k: "// im Sack", name: "Langsam geröstet", price: "€ 14,90", meta: "250 g · ganze Bohne · Mostviertel" },
  { k: "// im Becher", name: "Hausmelange", price: "€ 4,20", meta: "350 ml · täglich frisch · zum Mitnehmen" }
];
var tag = $("#tag"), tagI = 0;
if (tag && !reduce) setTimeout(function () { setInterval(nextTag, 9500); }, 4000);
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

// ---------- Footer-Schriftzug: Buchstaben steigen einzeln auf, die Bohnen fallen zuletzt hinein ----------
var mark = $(".foot__mark");
if (mark) {
  var k = 0;
  Array.prototype.slice.call(mark.childNodes).forEach(function (nd) {
    if (nd.nodeType === 3) {
      var frag = document.createDocumentFragment();
      nd.textContent.split("").forEach(function (c) { var sp = document.createElement("span"); sp.className = "ch"; sp.style.setProperty("--i", k++); sp.textContent = c; frag.appendChild(sp); });
      mark.replaceChild(frag, nd);
    } else { nd.classList.add("ch"); nd.style.setProperty("--i", k++); }
  });
  onView([mark], function (el) { el.classList.add("is-in"); }, .3);
}

// ---------- Karten kippen in 3D zur Maus, mit Lichtreflex; Knöpfe ziehen sich zur Maus ----------
if (fine && !reduce) {
  $$(".card").forEach(function (c) {
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
  $$(".magnet").forEach(function (b) {
    b.addEventListener("pointermove", function (e) {
      var r = b.getBoundingClientRect();
      b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .25).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * .35).toFixed(1) + "px)";
    });
    b.addEventListener("pointerleave", function () { b.style.transform = ""; });
  });
}

// ---------- Eigener Mauszeiger: Punkt folgt sofort, Ring gleitet nach und wächst über Links ----------
var cur = null;
if (fine && !reduce) {
  cur = { dot: document.createElement("i"), ring: document.createElement("i"), x: -100, y: -100, rx: -100, ry: -100, big: 0, bigTo: 0, label: "" };
  cur.dot.className = "cur-dot"; cur.ring.className = "cur-ring"; cur.ring.innerHTML = "<b></b>";
  document.body.append(cur.dot, cur.ring); document.documentElement.classList.add("has-cursor");
  addEventListener("pointermove", function (e) {
    cur.x = e.clientX; cur.y = e.clientY;
    var t = e.target.closest && e.target.closest("a, button, .card, .shop, label");
    cur.bigTo = t ? 1 : 0;
    var lab = t && t.classList.contains("card") ? "Bestellen" : "";
    if (lab !== cur.label) { cur.label = lab; cur.ring.firstChild.textContent = lab; cur.ring.classList.toggle("has-label", !!lab); }
  }, { passive: true });
  document.addEventListener("pointerleave", function () { cur.x = cur.y = -100; });
}

// ---------- Ganze Karte: Reiter mit gleitender Markierung, Zeilen fallen gestaffelt ein ----------
var tabs = $$('.tabs [role="tab"]'), ink = $(".tabs__ink");
function inkTo(b) {
  if (!ink || !b) return;
  ink.style.width = b.offsetWidth + "px"; ink.style.height = b.offsetHeight + "px";
  ink.style.transform = "translate(" + b.offsetLeft + "px," + b.offsetTop + "px)";
}
function stagger(list) { Array.prototype.forEach.call(list.children, function (li, k) { li.style.setProperty("--i", k); }); }
function selectTab(b, focus) {
  tabs.forEach(function (t) {
    var on = t === b, p = document.getElementById(t.getAttribute("aria-controls"));
    t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
    p.hidden = !on;
    if (on) { stagger(p); p.classList.remove("is-in"); void p.offsetWidth; p.classList.add("is-in"); }
  });
  inkTo(b); if (focus) b.focus();
}
tabs.forEach(function (b, k) {
  b.addEventListener("click", function () { selectTab(b); });
  b.addEventListener("keydown", function (e) {
    var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return;
    e.preventDefault(); selectTab(tabs[(k + d + tabs.length) % tabs.length], true);
  });
});
$$(".rows").forEach(stagger);
onView([$("#t-kaffee")], function (el) { el.classList.add("is-in"); }, .1);
inkTo($('.tabs [aria-selected="true"]')); addEventListener("resize", function () { inkTo($('.tabs [aria-selected="true"]')); });
if (document.fonts) document.fonts.ready.then(function () { inkTo($('.tabs [aria-selected="true"]')); });

// Am Computer folgt beim Überfahren einer Zeile ein Bild des Getränks der Maus.
var peek = $("#peek"), pk = { on: false, x: 0, y: 0, cx: 0, cy: 0, r: 0 };
if (fine && !reduce && peek) {
  var pimg = peek.querySelector("img");
  $$(".row[data-img]").forEach(function (r) {
    r.addEventListener("pointerenter", function (e) { pimg.src = "/beispiele/kaffeebar/bilder/" + r.dataset.img + ".webp"; if (!pk.on) { pk.cx = e.clientX; pk.cy = e.clientY; } pk.on = true; peek.classList.add("is-on"); });
    r.addEventListener("pointerleave", function () { pk.on = false; peek.classList.remove("is-on"); });
  });
  addEventListener("pointermove", function (e) { pk.x = e.clientX; pk.y = e.clientY; }, { passive: true });
}

// ---------- Bestellung: Warenkorb, Bestellfenster, Bon ----------
var ITEMS = {};
$$(".row[data-id]").forEach(function (r) { ITEMS[r.dataset.id] = { name: r.querySelector("b").firstChild.textContent.trim(), price: parseFloat(r.dataset.price) }; });
var cart = {}, cartEl = $("#cart"), navCount = $("#navcount");
function cartTotal() { var s = 0, n = 0; Object.keys(cart).forEach(function (id) { s += cart[id] * ITEMS[id].price; n += cart[id]; }); return { sum: s, n: n }; }
function renderCart() {
  var t = cartTotal(), lines = $("#lines"), empty = $("#empty");
  $("#cartn").textContent = t.n; $("#cartsum").textContent = eur(t.sum); $("#sum").textContent = eur(t.sum);
  navCount.textContent = t.n; navCount.hidden = !t.n;
  var show = !!t.n && !panel.open; cartEl.classList.toggle("is-on", show); cartEl.inert = !show;
  $("#go").disabled = !t.n;
  Array.prototype.slice.call(lines.querySelectorAll(".ln2")).forEach(function (l) { if (!cart[l.dataset.id]) l.remove(); });
  Object.keys(cart).forEach(function (id) {
    var l = lines.querySelector('.ln2[data-id="' + id + '"]');
    if (!l) {
      l = document.createElement("div"); l.className = "ln2"; l.dataset.id = id;
      l.innerHTML = '<b></b><span class="qty"><button type="button" data-q="-1" aria-label="Weniger">−</button><span></span><button type="button" data-q="1" aria-label="Mehr">+</button></span><em></em>';
      l.querySelector("b").textContent = ITEMS[id].name; lines.appendChild(l);
    }
    l.querySelector(".qty span").textContent = cart[id]; l.querySelector("em").textContent = eur(cart[id] * ITEMS[id].price);
  });
  empty.hidden = !!t.n;
}
function add(id, from) {
  if (!ITEMS[id]) return;
  cart[id] = (cart[id] || 0) + 1; renderCart();
  navCount.classList.remove("bump"); void navCount.offsetWidth; navCount.classList.add("bump");
  if (from && !reduce && !panel.open && from.animate) fly(from);
}
// Eine kleine Bohne fliegt vom Knopf in den Warenkorb.
function fly(from) {
  var a = from.getBoundingClientRect(), tgt = $(".nav__r").getBoundingClientRect();
  if (!tgt.width) tgt = { left: innerWidth - 60, top: innerHeight - 50, width: 40, height: 40 };
  var b = document.createElement("i"); b.style.cssText = "position:fixed;left:0;top:0;z-index:3000;width:14px;height:19px;border-radius:50%;background:#c2410c;pointer-events:none";
  document.body.appendChild(b);
  var x0 = a.left + a.width / 2 - 7, y0 = a.top + a.height / 2 - 9, x1 = tgt.left + tgt.width / 2 - 7, y1 = tgt.top + tgt.height / 2 - 9;
  b.animate([
    { transform: "translate(" + x0 + "px," + y0 + "px) rotate(0) scale(1)" },
    { transform: "translate(" + (x0 + (x1 - x0) * .5) + "px," + (Math.min(y0, y1) - 120) + "px) rotate(300deg) scale(1.3)", offset: .45 },
    { transform: "translate(" + x1 + "px," + y1 + "px) rotate(600deg) scale(.5)" }
  ], { duration: 750, easing: "cubic-bezier(.45,0,.25,1)" }).onfinish = function () { b.remove(); };
}
document.addEventListener("click", function (e) {
  var t = e.target.closest && e.target.closest("[data-add],[data-order],[data-close],[data-q],[data-quick]"); if (!t) return;
  if (t.hasAttribute("data-add")) { add(t.dataset.add, t); t.classList.remove("added"); void t.offsetWidth; t.classList.add("added"); }
  else if (t.hasAttribute("data-quick")) add(t.dataset.quick);
  else if (t.hasAttribute("data-q")) { var id = t.closest(".ln2").dataset.id; cart[id] += +t.dataset.q; if (cart[id] <= 0) delete cart[id]; renderCart(); }
  else if (t.hasAttribute("data-order")) { e.preventDefault(); openPanel(); }
  else if (t.hasAttribute("data-close")) closePanel();
});
// Schnell-Knöpfe im Fenster
var quick = $("#quick");
["espresso", "melange", "flatwhite", "eiskaffee", "matcha-iced", "zimt"].forEach(function (id) {
  var b = document.createElement("button"); b.type = "button"; b.dataset.quick = id;
  b.innerHTML = "<span></span><span>＋ " + eur(ITEMS[id].price) + "</span>"; b.firstChild.textContent = ITEMS[id].name; quick.appendChild(b);
});
function openPanel() {
  if (panel.open) return;
  $("#done").hidden = true; panel.classList.remove("is-closing");
  panel.showModal(); document.documentElement.classList.add("lock", "panel-open"); sc.busy = false;
  cartEl.classList.remove("is-on"); cartEl.inert = true;
}
function closePanel() {
  if (!panel.open) return;
  if (reduce) { panel.close(); return; }
  panel.classList.add("is-closing");
  panel.addEventListener("animationend", function f() { panel.removeEventListener("animationend", f); panel.classList.remove("is-closing"); panel.close(); });
}
panel.addEventListener("close", function () { document.documentElement.classList.remove("lock", "panel-open"); renderCart(); });
panel.addEventListener("cancel", function (e) { e.preventDefault(); closePanel(); });
panel.addEventListener("click", function (e) { if (e.target === panel) closePanel(); });
$("#orderform").addEventListener("submit", function (e) {
  e.preventDefault();
  var f = e.target, name = f.name.value.trim(), t = cartTotal();
  if (!t.n) return;
  if (!name) { var fl = f.querySelector(".field"); fl.classList.remove("is-bad"); void fl.offsetWidth; fl.classList.add("is-bad"); f.name.focus(); return; }
  var when = new Date(Date.now() + (+f.when.value) * 60000), hh = String(when.getHours()).padStart(2, "0") + ":" + String(when.getMinutes()).padStart(2, "0");
  var nr = String(100 + Math.floor(Math.random() * 900));
  $("#donename").textContent = name; $("#donenr").textContent = nr;
  $("#donetxt").textContent = "Dein Becher ist um " + hh + " bei röstzeit, " + f.shop.value + ", fertig. Einfach vorbeigehen und die Nummer sagen.";
  // Der Bon im Abschnitt "Bestellen" zeigt ab jetzt die eigene Bestellung.
  var bl = $("#bonlines"); bl.innerHTML = "";
  Object.keys(cart).forEach(function (id) { var p = document.createElement("p"); p.className = "bon__l"; p.innerHTML = "<span></span><span></span>"; p.firstChild.textContent = cart[id] + " × " + ITEMS[id].name; p.lastChild.textContent = (cart[id] * ITEMS[id].price).toFixed(2).replace(".", ","); bl.appendChild(p); });
  $("#bonsum").textContent = t.sum.toFixed(2).replace(".", ",");
  cart = {}; renderCart(); measure();
  $("#done").hidden = false; $("#done .btn").focus();
});
renderCart();

// ---------- Standorte: Live-Status, Karte und Liste hängen zusammen ----------
// Öffnungszeiten je Wochentag (0 = Sonntag) in Minuten.
var HOURS = [
  function () { return [420, 1140]; },
  function (d) { return d === 0 || d === 6 ? [480, 1020] : [390, 1140]; },
  function (d) { return d === 1 ? null : [480, 1080]; }
];
function hm(m) { return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); }
function status(k) {
  var now = new Date(), d = now.getDay(), m = now.getHours() * 60 + now.getMinutes(), h = HOURS[k](d);
  if (h && m >= h[0] && m < h[1]) return { open: true, txt: "Jetzt offen · bis " + hm(h[1]) };
  if (h && m < h[0]) return { open: false, txt: "Geschlossen · öffnet heute " + hm(h[0]) };
  for (var i = 1; i < 8; i++) { var nd = (d + i) % 7, nh = HOURS[k](nd); if (nh) return { open: false, txt: "Geschlossen · öffnet " + (i === 1 ? "morgen" : ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][nd] + ".") + " " + hm(nh[0]) }; }
  return { open: false, txt: "Geschlossen" };
}
function liveStatus() {
  $$(".shop").forEach(function (sh, k) { var st = status(k); sh.querySelector("[data-status]").textContent = st.txt; sh.querySelector(".live").classList.toggle("is-off", !st.open); });
  var s0 = status(0); $("#live").classList.toggle("is-off", !s0.open); $("#livetxt").textContent = s0.open ? "Jetzt geöffnet" : "Gerade geschlossen";
}
liveStatus(); setInterval(liveStatus, 60000);
var shops = $$(".shop"), pins = $$(".pin");
function pickShop(k) { shops.forEach(function (s, j) { s.classList.toggle("is-on", j === k); }); pins.forEach(function (p, j) { p.classList.toggle("is-on", j === k); }); }
shops.forEach(function (sh, k) {
  sh.addEventListener("click", function () { pickShop(k); });
  sh.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickShop(k); } });
  if (fine) sh.addEventListener("pointerenter", function () { pickShop(k); });
});
pins.forEach(function (p, k) { p.addEventListener("click", function () { pickShop(k); }); });
pickShop(0);

// ---------- Ein Takt für alles ----------
// Abschnittspositionen werden nur bei Größenänderung gemessen, nicht in jedem Bild.
var sec = { clock: $("#zeiten"), order: $("#bestellen"), city: $("#haltung"), band: $("#band"), proc: $("#roesterei"), voices: $("#stimmen") }, pos = {};
var lights = $$(".light"), lightPos = [], nav = $("#nav"), navLinks = $$(".nav__l a"), linkPos = [];
var el = { hh: $("#hh"), hm: $("#hm"), hs: $("#hs"), time: $("#time"), turn: $("#turn"), turnImg: $("#turn img"), places: $$("#places li"), bon: $("#bon"), track: $(".band__track"),
  proc: $("#proctrack"), procBar: $("#procbar"), steps: $$(".step"), fan: $$(".vc"), printer: $("#printer"), paper: $("#paper") };
var procW = 0, stepX = [], fanK = 1;
function measure() {
  var vh = innerHeight;
  Object.keys(sec).forEach(function (k) { var e = sec[k]; if (!e) return; var r = e.getBoundingClientRect(); pos[k] = { top: r.top + scrollY, h: r.height, span: Math.max(1, r.height - (vh - BAR)) }; });
  lightPos = Array.prototype.map.call(lights, function (e) { var r = e.getBoundingClientRect(); return [r.top + scrollY, r.bottom + scrollY]; });
  linkPos = Array.prototype.map.call(navLinks, function (a) { var t = document.querySelector(a.getAttribute("href")), r = t.getBoundingClientRect(); return [r.top + scrollY, r.bottom + scrollY]; });
  fanK = el.fan.length ? Math.min(1, el.fan[0].parentNode.clientWidth / 760) : 1;
  if (el.proc) { procW = Math.max(0, el.proc.scrollWidth - innerWidth); stepX = Array.prototype.map.call(el.steps, function (s) { return s.offsetLeft + s.offsetWidth / 2; }); }
  // Bon: Papier so hoch wie der Bon; passt beides nicht in den Bildschirm, wird der Drucker verkleinert statt abgeschnitten.
  if (el.printer && el.bon) {
    el.paper.style.height = el.bon.offsetHeight + 40 + "px";
    var pin = el.printer.parentNode, room = pin.clientHeight - el.printer.offsetTop - 18, need = el.printer.offsetHeight - 40;
    el.printer.style.setProperty("--ps", Math.min(1, room / need).toFixed(3));
  }
}
function prog(k, y) { var p = pos[k]; return p ? clamp((y - p.top + BAR) / p.span, 0, 1) : 0; }
measure(); addEventListener("resize", measure); addEventListener("load", measure);
if (document.fonts) document.fonts.ready.then(measure);
if ("ResizeObserver" in window) new ResizeObserver(measure).observe(document.body);

// Fächer der Gästestimmen: gestapelt -> aufgefächert (x, y in px, Drehung in Grad).
onView($$(".vc"), function (el) { el.classList.add("is-in"); }, .3);
var FAN = [[-190, -105, -6], [175, -118, 5], [-170, 112, 4], [195, 98, -5]];
var S = { clock: 0, order: 0, beans: 0, hero: 0, vel: 0, band: 0, proc: 0, fan: 0 }, placeOn = -1, lastTime = "", lastFrame = -1, navLight = false, navSolid = false, linkOn = -1, lastY = scrollY, printing = false;
window.rz = S;
var PLACE_T = [420, 540, 720, 900, 1110];

var last = performance.now();
function tick(now) {
  var dt = Math.min(.05, (now - last) / 1000); last = now;
  if (sc.on && sc.busy) {
    sc.y = damp(sc.y, sc.to, 9, dt);
    if (Math.abs(sc.to - sc.y) < .5) { sc.y = sc.to; sc.busy = false; }
    window.scrollTo(0, sc.y);
  }
  var y = scrollY, vh = innerHeight;
  var v = dt > 0 ? (y - lastY) / dt : 0; lastY = y;
  S.vel = damp(S.vel, clamp(v, -4000, 4000), 6, dt);

  var ny = y + BAR + 30, onLight = false;
  for (var i = 0; i < lightPos.length; i++) if (lightPos[i][0] <= ny && lightPos[i][1] >= ny) { onLight = true; break; }
  if (onLight !== navLight) { navLight = onLight; nav.classList.toggle("on-light", onLight); }
  if ((y > 10) !== navSolid) { navSolid = y > 10; nav.classList.toggle("is-solid", navSolid); }
  var lk = -1; for (var j = 0; j < linkPos.length; j++) if (linkPos[j][0] <= ny + 120 && linkPos[j][1] > ny + 120) lk = j;
  if (lk !== linkOn) { linkOn = lk; navLinks.forEach(function (a, n) { a.classList.toggle("is-cur", n === lk); }); }

  S.hero = clamp(y / vh, 0, 1);
  if (!reduce) {
    S.beans = damp(S.beans, prog("city", y), 8, dt);
    S.clock = damp(S.clock, prog("clock", y), 7, dt);
    S.order = damp(S.order, prog("order", y), 7, dt);
    S.proc = damp(S.proc, prog("proc", y), 8, dt);

    // Rösterei: Strecke läuft waagrecht durch, Symbole zeichnen sich, wenn ihr Feld in die Mitte kommt.
    if (el.proc && pos.proc && y + vh > pos.proc.top && y < pos.proc.top + pos.proc.h) {
      var px = -S.proc * procW;
      el.proc.style.transform = "translate3d(" + px.toFixed(1) + "px,0,0)";
      el.procBar.style.transform = "scaleX(" + S.proc.toFixed(4) + ")";
      for (var st = 0; st < stepX.length; st++) if (!el.steps[st]._on && stepX[st] + px < innerWidth * .8) { el.steps[st]._on = true; el.steps[st].classList.add("is-on"); }
    }
    // Uhr: 7:00 bis 19:00; Sekundenzeiger tickt mit dem Scrollen.
    if (pos.clock && y + vh > pos.clock.top && y < pos.clock.top + pos.clock.h) {
      var m = 420 + S.clock * 720;
      el.hm.style.transform = "rotate(" + ((m % 60) * 6).toFixed(2) + "deg)";
      el.hh.style.transform = "rotate(" + (((m / 60) % 12) * 30).toFixed(2) + "deg)";
      el.hs.style.transform = "rotate(" + ((m * 60 * 6 / 8) % 360).toFixed(1) + "deg)";
      var mm = Math.round(m), t = hm(mm);
      if (t !== lastTime) { lastTime = t; el.time.textContent = t; }
      // Eiskaffee dreht sich einmal um sich selbst (36 vorgerenderte Ansichten).
      if (el.turn) { var f = Math.min(35, Math.floor(S.clock * 36)); if (f !== lastFrame) { lastFrame = f; el.turnImg.style.transform = "translate3d(" + (-(f % 6) * 100 / 6).toFixed(4) + "%," + (-Math.floor(f / 6) * 100 / 6).toFixed(4) + "%,0)"; } }
      var on = 0; for (var q2 = 0; q2 < PLACE_T.length; q2++) if (m >= PLACE_T[q2]) on = q2;
      if (on !== placeOn) { placeOn = on; el.places.forEach(function (li, n) { li.classList.toggle("is-on", n === on); }); }
    }
    // Gästestimmen fächern sich auf, während der Abschnitt durchs Bild läuft.
    if (innerWidth > 860 && pos.voices && y + vh > pos.voices.top && y < pos.voices.top + pos.voices.h) {
      S.fan = damp(S.fan, clamp((y + vh - pos.voices.top) / (vh * .9), 0, 1), 6, dt);
      var e3 = 1 - Math.pow(1 - S.fan, 3), F = FAN;
      for (var c = 0; c < el.fan.length; c++) {
        var fc = F[c], st2 = c * 3 - 4.5;
        el.fan[c].style.transform = "translate(-50%,-50%) translate(" + (fc[0] * fanK * e3).toFixed(1) + "px," + (fc[1] * fanK * e3 + (1 - e3) * 60).toFixed(1) + "px) rotate(" + (st2 + (fc[2] - st2) * e3).toFixed(2) + "deg)";
      }
    }
    if (el.bon && pos.order && y + vh > pos.order.top) {
      var q = clamp(S.order / .75, 0, 1), e = 1 - Math.pow(1 - q, 2);
      el.bon.style.transform = "translateY(" + (-100 + e * 100).toFixed(2) + "%) rotate(" + (Math.sin(q * 9) * .6 * (1 - q)).toFixed(2) + "deg)";
      var pr = q > .02 && q < .98; if (pr !== printing) { printing = pr; el.printer.classList.toggle("is-printing", pr); }
    }
    // Laufband: läuft immer, schneller und schräger beim Scrollen.
    if (el.track && pos.band && y + vh > pos.band.top - 200 && y < pos.band.top + pos.band.h + 200) {
      S.band -= (60 + Math.abs(S.vel) * .35) * dt * (S.vel < -5 ? -1 : 1);
      var w = el.track.scrollWidth / 2; if (w) S.band = ((S.band % w) - w) % w;
      el.track.style.transform = "translate3d(" + S.band.toFixed(1) + "px,0,0) skewX(" + clamp(-S.vel / 160, -12, 12).toFixed(2) + "deg)";
    }
  }
  if (pk.on || peek && peek.classList.contains("is-on")) {
    var ox = pk.x - pk.cx; pk.cx = damp(pk.cx, pk.x, 10, dt); pk.cy = damp(pk.cy, pk.y, 10, dt); pk.r = damp(pk.r, clamp(ox * .15, -14, 14), 8, dt);
    peek.style.transform = "translate3d(" + (pk.cx + 30).toFixed(1) + "px," + (pk.cy - 120).toFixed(1) + "px,0) rotate(" + pk.r.toFixed(2) + "deg)";
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
    function place() {
      var narrow = innerWidth <= 860;
      st.camera.position.set(0, .15, narrow ? 6.6 : 7.3); st.camera.lookAt(0, -.05, 0);
      g.position.set(narrow ? .12 : -.1, narrow ? -.3 : 0, 0);
    }
    place(); new ResizeObserver(place).observe(stageEl);
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
    var cup = P.cup(THREE, {}); st.scene.add(cup);
    var M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), SC = new THREE.Vector3();
    var narrow = false;
    // Am Handy steht der Becher kleiner im unteren Drittel, damit er ganz zu sehen ist und den Text nicht verdeckt.
    function rs() { narrow = host.clientWidth / host.clientHeight < 1; cup.scale.setScalar(narrow ? .78 : 1.2); } rs(); new ResizeObserver(rs).observe(host);
    st.onFrame(function (dt, t) {
      var p = S.beans, vel = clamp(S.vel / 1500, -1.5, 1.5);
      for (var i = 0; i < N; i++) {
        var b = B[i]; b.y -= (b.v + vel * (1 + b.s * 3)) * dt;
        var yy = b.y - p * 5 * (1 + b.s * 2); yy = ((yy + 4) % 8 + 8) % 8 - 4;
        E.set(b.ax + t * b.rx, b.ay + t * b.ry, 0); Q.setFromEuler(E);
        V.set(narrow ? b.x * .42 : b.x, yy, b.z); SC.setScalar(b.s); M.compose(V, Q, SC); inst.setMatrixAt(i, M);
      }
      inst.instanceMatrix.needsUpdate = true;
      var c = clamp(p / .55, 0, 1), e = 1 - Math.pow(1 - c, 3);
      if (narrow) { cup.position.set(.15, -4.2 + e * 2.45, 0); cup.rotation.set(.2 - e * .1, .4 + e * .5 + p * 1.2, .6 - e * .5); }
      else { cup.position.set(-1.1, -4.2 + e * 2.7, .8); cup.rotation.set(.25 - e * .1, .4 + e * .5 + p * 1.2, .9 - e * .75); }
    });
  });
}
