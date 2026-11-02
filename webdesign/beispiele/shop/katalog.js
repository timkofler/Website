// Saisonkatalog zum Umblättern im Birnkammer-Shop.
// Die Seiten stehen als Liste im DOM (lesbar für Screenreader, Ersatzfassung ohne WebGL oder bei "weniger Bewegung":
// dann wechseln die Seiten mit einem Überblenden). Mit WebGL zeichnet katalog3d.js das Buch mit gebogenen Seiten
// und drehenden 3D-Produkten; die echten Knöpfe "In den Korb" liegen dann genau über der gezeichneten Seite.
// Blättern: Seitenrand anklicken oder antippen, waagrecht wischen oder ziehen (senkrechtes Scrollen bleibt frei),
// Pfeiltasten, Knöpfe unter dem Buch. Preise, Lager und "In den Korb" kommen aus app.js (window.BKshop).
import { reduce, webglOk, whenNear, loadThree } from "/beispiele/_shared/stage3d.js?v=2";

var root = document.getElementById("katalog");

var TX = {
  de: {
    head: "Birnkammer · Hofkatalog", add: "In den Korb", out: "Ausverkauft", neu: "Neu",
    low: function (n) { return "nur noch " + n + " Stück"; },
    st: { keller: "Aus dem Mostkeller", presse: "Aus der Saftpresse", bienen: "Vom Bienenstand", kueche: "Aus der Hofküche", brennerei: "Aus der Brennerei", laden: "Aus dem Hofladen" },
    cover: { kick: "Hofkatalog · Nr. 12", title: "Herbst & Advent 2026", line: "Most · Säfte · Edelbrände · Honig", foot: "Aus dem Mostviertel, seit 1987" },
    intro: { h: "Grüß Gott!", p: "Wenn im Oktober die Speckbirnen fallen, riecht der ganze Hof nach Most. In diesem Katalog steht, was heuer im Keller, in der Presse, in der Brennerei und am Bienenstand gelungen ist. Zum Selberfreuen und zum Verschenken, alles direkt in den Korb.",
      sig: "Resi und Franz Eder", toc: "In diesem Katalog",
      rows: [["Aus dem Mostkeller", 2], ["Aus der Saftpresse", 5], ["Vom Bienenstand und aus der Hofküche", 7], ["Aus der Brennerei", 9], ["Geschenke aus dem Hofladen", 11]] },
    outro: { kick: "Für Weihnachten", h: "Fürs Fest bestellen", note: "Alle Preise inkl. MwSt.", btn: "Gutschein gestalten",
      rows: [["Bis 18. Dezember bestellen", "Dann ist alles vor dem Fest bei dir."], ["Abholen im Hofladen", "Fr 14–18 und Sa 8–12 Uhr, gratis."], ["Ab € 59 versandkostenfrei", "Bruchsicher verpackt, in ganz Österreich."], ["Nicht sicher, was passt?", "Ein Gutschein vom Hof passt immer."]] },
    back: { lines: ["Familie Eder · Hofweg 7", "3251 Musterdorf · Mostviertel", "Bestellen online, abholen am Hof"], note: "Erfundener Hofladen, ein Beispiel von tim-kofler.at" },
    pageOf: function (a, b, n) { return (b ? "Seite " + a + "–" + b : "Seite " + a) + " von " + n; },
    coverL: "Umschlag", backL: "Rückseite", prev: "Vorige Seite", next: "Nächste Seite", page: "Seite",
    book: "Katalog zum Umblättern. Mit den Pfeiltasten links und rechts blättern.",
    hint: "Seitenrand anklicken, ziehen oder die Pfeiltasten nehmen.", hintT: "Zum Blättern am Seitenrand tippen oder waagrecht wischen."
  },
  en: {
    head: "Birnkammer · Farm catalogue", add: "Add to basket", out: "Sold out", neu: "New",
    low: function (n) { return "only " + n + " left"; },
    st: { keller: "From the cider cellar", presse: "From the juice press", bienen: "From the beehives", kueche: "From the farm kitchen", brennerei: "From the distillery", laden: "From the farm shop" },
    cover: { kick: "Farm catalogue · No. 12", title: "Autumn & Advent 2026", line: "Perry · Juices · Brandies · Honey", foot: "From the Mostviertel, since 1987" },
    intro: { h: "Welcome!", p: "When the Speckbirne pears fall in October, the whole farm smells of perry. This catalogue shows what turned out well this year in the cellar, the press, the distillery and at the beehives. To enjoy yourself or to give away, straight into your basket.",
      sig: "Resi and Franz Eder", toc: "In this catalogue",
      rows: [["From the cider cellar", 2], ["From the juice press", 5], ["Beehives and farm kitchen", 7], ["From the distillery", 9], ["Gifts from the farm shop", 11]] },
    outro: { kick: "For Christmas", h: "Order for the holidays", note: "All prices incl. VAT", btn: "Design a gift card",
      rows: [["Order by 18 December", "Then it reaches you before the holidays."], ["Pick up at the farm shop", "Fri 2–6 pm and Sat 8 am–12 pm, free."], ["Free shipping from € 59", "Packed shatter-proof, anywhere in Austria."], ["Not sure what to choose?", "A gift card from the farm always fits."]] },
    back: { lines: ["Eder family · Hofweg 7", "3251 Musterdorf · Mostviertel", "Order online, pick up at the farm"], note: "Fictional farm shop, a sample by tim-kofler.at" },
    pageOf: function (a, b, n) { return (b ? "Pages " + a + "–" + b : "Page " + a) + " of " + n; },
    coverL: "Cover", backL: "Back cover", prev: "Previous page", next: "Next page", page: "Page",
    book: "Flip-through catalogue. Use the left and right arrow keys to turn pages.",
    hint: "Click the page edge, drag, or use the arrow keys.", hintT: "Tap the page edge or swipe sideways to turn."
  }
};

// 14 Seiten: Umschlag, Vorwort, zehn Produkte, Bestellseite, Rückseite. Am PC als Doppelseiten (7 Blätter).
var PAGES = [
  { k: "cover" }, { k: "intro" },
  { k: "prod", id: "speck", st: "keller" }, { k: "prod", id: "apfelbirn", st: "keller" }, { k: "prod", id: "frizzante", st: "keller" },
  { k: "prod", id: "apfelsaft", st: "presse" }, { k: "prod", id: "holler", st: "presse" },
  { k: "prod", id: "bluete", st: "bienen" }, { k: "prod", id: "ingwer", st: "kueche" },
  { k: "prod", id: "williams", st: "brennerei" }, { k: "prod", id: "fass", st: "brennerei" },
  { k: "prod", id: "kistl", st: "laden" }, { k: "outro" }, { k: "back" }
];
var NF = PAGES.length, NUMBERED = NF - 2;

var EMBLEM = '<svg class="kat__em" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="19" fill="currentColor"/>' +
  '<path d="M20 10.5c2.2 0 2.5 3.3 3 5 3 2.3 3.3 8.3-3 8.3s-6-6-3-8.3c.5-1.7.8-5 3-5z" transform="translate(0 4) scale(1 1.08)" fill="#24170f"/>' +
  '<path d="M20 13.8c0-2 .5-3.4 1.4-4.4" fill="none" stroke="#24170f" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="24" cy="9.4" rx="2.5" ry="1.05" transform="rotate(-25 24 9.4)" fill="#24170f"/></svg>';

function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

function init() {
  var B = window.BKshop, book = root.querySelector(".kat__book"), list = root.querySelector(".kat__pages"), glEl = root.querySelector(".kat__gl");
  var prevB = root.querySelector("#katPrev"), nextB = root.querySelector("#katNext"), num = root.querySelector("#katNum"), bar = root.querySelector("#katBar"), hint = root.querySelector("#katHint");
  var mq = window.matchMedia("(min-width: 760px)"), fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  var C = { s: 0, mode: mq.matches ? "spread" : "single", busy: false, queued: 0, gl: false, sig: "" };
  var items = [];
  function T() { return TX[B.lang() === "en" ? "en" : "de"]; }
  function maxS() { return C.mode === "spread" ? NF / 2 : NF - 1; }
  function can(d) { return d > 0 ? C.s < maxS() : C.s > 0; }

  // Seitendaten für DOM und Textur (aufgelöst in der aktuellen Sprache)
  function page(f) {
    var P = PAGES[f], t = T(), d = { k: P.k, f: f, num: f > 0 && f < NF - 1 ? f : null, head: t.head };
    if (P.k === "prod") {
      var i = B.info(P.id);
      d.id = P.id; d.kick = t.st[P.st]; d.name = i.name; d.sub = i.sub; d.desc = i.desc; d.price = i.priceTxt; d.c = i.c;
      d.out = i.stock === 0; d.low = i.stock > 0 && i.stock <= 5; d.badge = i.badge === "neu" ? t.neu : "";
      d.unit = i.varName + " · " + (d.out ? t.out : d.low ? t.low(i.stock) : i.unit);
      d.label = i.name + ", " + i.varName;
    } else d.t = t[P.k];
    return d;
  }
  function signature() {
    return B.lang() + PAGES.map(function (P) { if (P.k !== "prod") return ""; var i = B.info(P.id); return i.priceTxt + i.stock; }).join("|");
  }

  function pageHTML(d) {
    var t = T(), sr = d.num != null ? '<span class="sr">' + t.page + " " + d.num + ". </span>" : "";
    if (d.k === "prod") {
      return sr + '<div class="kat__art">' + B.art(B.info(d.id).art) + "</div>" +
        '<div class="kat__txt"><p class="kat__k">' + esc(d.kick) + '</p><h3 class="kat__n">' + esc(d.name) + "</h3>" +
        '<p class="kat__s">' + esc(d.sub) + '</p><p class="kat__d">' + esc(d.desc) + "</p></div>" +
        '<div class="kat__buy"><p class="kat__p"><b>' + esc(d.price) + "</b><small>" + esc(d.unit) + "</small></p>" +
        '<button type="button" class="kat__add" data-add="' + d.id + '"' + (d.out ? " disabled" : "") + ' aria-label="' + esc(d.label + ": " + (d.out ? t.out : t.add)) + '">' +
        '<svg aria-hidden="true"><use href="#i-korb"/></svg><span>' + esc(d.out ? t.out : t.add) + "</span></button></div>" +
        '<span class="kat__no" aria-hidden="true">' + d.num + "</span>";
    }
    var x = d.t;
    if (d.k === "cover") return '<div class="kat__cov"><p class="kat__ck">' + esc(x.kick) + '</p>' + EMBLEM + '<h3 class="kat__cb">Birnkammer <span class="sr">' + esc(x.kick) + "</span></h3>" +
      '<p class="kat__ct">' + esc(x.title) + '</p><p class="kat__cl">' + esc(x.line) + '</p><p class="kat__cf">' + esc(x.foot) + "</p></div>";
    if (d.k === "back") return '<div class="kat__cov kat__cov--back">' + EMBLEM + '<p class="kat__cb">Birnkammer</p>' +
      x.lines.map(function (l) { return '<p class="kat__cl">' + esc(l) + "</p>"; }).join("") + '<p class="kat__cf">' + esc(x.note) + "</p></div>";
    if (d.k === "intro") return sr + '<div class="kat__txt"><h3 class="kat__h">' + esc(x.h) + '</h3><p class="kat__d">' + esc(x.p) + '</p><p class="kat__sig">' + esc(x.sig) + "</p>" +
      '<p class="kat__k">' + esc(x.toc) + '</p><ol class="kat__toc">' + x.rows.map(function (r) { return "<li><span>" + esc(r[0]) + "</span><b>" + r[1] + "</b></li>"; }).join("") + "</ol></div>";
    return sr + '<div class="kat__txt"><p class="kat__k">' + esc(x.kick) + '</p><h3 class="kat__h">' + esc(x.h) + '</h3><ol class="kat__rows">' +
      x.rows.map(function (r) { return "<li><b>" + esc(r[0]) + "</b><span>" + esc(r[1]) + "</span></li>"; }).join("") + "</ol></div>" +
      '<div class="kat__buy"><p class="kat__p"><small>' + esc(x.note) + '</small></p><a class="kat__add" href="#gutschein"><svg aria-hidden="true"><use href="#i-geschenk"/></svg><span>' + esc(x.btn) + "</span></a></div>";
  }

  function build() {
    C.sig = signature();
    if (!items.length) for (var f = 0; f < NF; f++) { var li = document.createElement("li"); li.className = "kat__pg kat__pg--" + PAGES[f].k; li.dataset.f = f; list.appendChild(li); items.push(li); }
    items.forEach(function (li, f) { var d = page(f); if (d.c) li.style.setProperty("--c", d.c); li.innerHTML = pageHTML(d); });
  }

  function visible() {
    if (C.mode === "single") return [null, C.s];
    return [C.s > 0 ? 2 * C.s - 1 : null, C.s < NF / 2 ? 2 * C.s : null];
  }

  function place() {
    if (!C.gl) return;
    var r = view.rects(), L = view.layout(), v = visible();
    items.forEach(function (li, f) {
      var rc = f === v[0] ? r.L : f === v[1] ? r.R : null; if (!rc) return;
      li.style.left = rc.x + "px"; li.style.top = rc.y + "px"; li.style.width = rc.w + "px"; li.style.height = rc.h + "px";
      li.style.setProperty("--br", L.btn.right + "px"); li.style.setProperty("--bb", L.btn.bottom + "px"); li.style.setProperty("--bh", L.btn.h + "px");
      li.style.setProperty("--ax", L.stage.x + "px"); li.style.setProperty("--ay", L.stage.y + "px"); li.style.setProperty("--aw", L.stage.w + "px"); li.style.setProperty("--ah", L.stage.h + "px");
    });
  }

  function update() {
    var t = T(), v = visible(), act = document.activeElement;
    items.forEach(function (li, f) {
      var on = f === v[0] || f === v[1];
      li.classList.toggle("is-l", f === v[0]); li.classList.toggle("is-r", f === v[1]); li.inert = !on;
      if (!on && li.contains(act)) book.focus({ preventScroll: true });
    });
    book.classList.toggle("is-front", C.mode === "spread" && C.s === 0);
    book.classList.toggle("is-back", C.mode === "spread" && C.s === maxS());
    book.classList.toggle("is-single", C.mode === "single");
    place();
    prevB.disabled = !can(-1); nextB.disabled = !can(1);
    prevB.setAttribute("aria-label", t.prev); nextB.setAttribute("aria-label", t.next); book.setAttribute("aria-label", t.book);
    var nums = v.filter(function (f) { return f != null && f > 0 && f < NF - 1; }), txt, names = [];
    if (!nums.length) txt = v.indexOf(0) >= 0 ? t.coverL : t.backL;
    else txt = t.pageOf(nums[0], nums[1], NUMBERED);
    v.forEach(function (f) { if (f != null && PAGES[f].k === "prod") names.push(B.info(PAGES[f].id).name); });
    num.innerHTML = "<span>" + esc(txt) + "</span>" + (names.length ? '<span class="sr">: ' + esc(names.join(", ")) + "</span>" : "");
    bar.style.transform = "scaleX(" + (C.s / maxS()).toFixed(4) + ")";
    hint.textContent = fine.matches ? t.hint : t.hintT;
  }

  /* ---------- Ersatzfassung: Überblenden ---------- */
  var fallback = {
    flip: function (dir, done) { done(true); }, dragStart: function () {}, dragTo: function () {}, dragEnd: function (c, done) { done(c); },
    peel: function () {}, set: function () {}, relayout: function () {}, invalidate: function () {}, busy: function () { return false; }, canDrag: false
  };
  var view = fallback;

  function finish(ok, dir) {
    C.busy = false; book.classList.remove("is-turning");
    if (ok) C.s += dir;
    view.set(C.s); update();
    if (C.queued) { var q = C.queued; C.queued = 0; go(q); }
  }
  function go(dir) {
    if (!can(dir)) return;
    if (C.busy) { if (dir === C.dir) C.queued = dir; return; }
    C.busy = true; C.dir = dir; book.classList.add("is-turning");
    view.flip(dir, function (ok) { finish(ok, dir); });
  }

  /* ---------- Eingaben ---------- */
  function zone(e) {
    var r = book.getBoundingClientRect(), x = e.clientX - r.left, W = r.width, pw = C.mode === "spread" ? W / 2 : W;
    if (C.mode === "spread" && C.s === 0) return x > W / 4 && x < W * .75 ? 1 : 0;
    if (C.mode === "spread" && C.s === maxS()) return x > W / 4 && x < W * .75 ? -1 : 0;
    if (x < pw * .34) return -1;
    if (x > W - pw * .34) return 1;
    return 0;
  }
  var P = null;
  book.addEventListener("pointerdown", function (e) {
    if (e.button > 0 || e.target.closest("button, a")) return;
    P = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: e.timeStamp, decided: false, horiz: false, dir: 0, hist: [[e.timeStamp, e.clientX]], type: e.pointerType };
  });
  book.addEventListener("pointermove", function (e) {
    if (!P) {
      if (e.pointerType === "mouse" && fine.matches && !C.busy && !e.target.closest("button, a")) { var z = zone(e); z = can(z) ? z : 0; view.peel(z); book.classList.toggle("is-hot", !!z); }
      else book.classList.remove("is-hot");
      return;
    }
    if (e.pointerId !== P.id) return;
    var dx = e.clientX - P.x0, dy = e.clientY - P.y0;
    P.hist.push([e.timeStamp, e.clientX]); if (P.hist.length > 8) P.hist.shift();
    if (!P.decided && Math.hypot(dx, dy) > 9) {
      P.decided = true; P.horiz = Math.abs(dx) > Math.abs(dy) * 1.15;
      if (!P.horiz) { P = null; view.peel(0); return; }
      P.dir = dx < 0 ? 1 : -1;
      if (!can(P.dir) || C.busy) { P.dir = 0; return; }
      try { book.setPointerCapture(P.id); } catch (x) {}
      C.busy = true; C.dir = P.dir; book.classList.add("is-turning");
      var r = book.getBoundingClientRect(); P.lead = (e.clientY - r.top) > r.height * .45 ? 1 : -1;
      view.dragStart(P.dir, P.lead);
    }
    if (P.horiz && P.dir) {
      var pw = book.getBoundingClientRect().width / (C.mode === "spread" ? 2 : 1);
      view.dragTo(-dx * P.dir / (pw * (C.mode === "spread" ? 1.7 : 1.15)));
    }
  });
  function end(e, cancel) {
    if (!P || e.pointerId !== P.id) return;
    var p = P; P = null;
    if (!p.decided) { if (!cancel) { var z = zone(e); if (z) { view.peel(0); go(z); } } return; }
    if (!p.horiz || !p.dir) return;
    var h = p.hist, a = h[0], b = h[h.length - 1], vx = (b[1] - a[1]) / Math.max(1, b[0] - a[0]);
    var dx = e.clientX - p.x0, pw = book.getBoundingClientRect().width / (C.mode === "spread" ? 2 : 1);
    var q = -dx * p.dir / (pw * (C.mode === "spread" ? 1.7 : 1.15));
    var commit = !cancel && (q > .3 || -vx * p.dir > .35);
    view.dragEnd(commit, function (ok) { finish(ok, p.dir); });
  }
  book.addEventListener("pointerup", function (e) { end(e, false); });
  book.addEventListener("pointercancel", function (e) { end(e, true); });
  book.addEventListener("pointerleave", function (e) { if (!P) { view.peel(0); book.classList.remove("is-hot"); } });
  // Pfeiltasten: wenn der Fokus im Katalog liegt oder nirgends (body) und das Buch gut sichtbar ist
  var inView = false;
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { inView = es[es.length - 1].intersectionRatio >= .5; }, { threshold: [0, .5, 1] }).observe(book);
  document.addEventListener("keydown", function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
    var a = document.activeElement, mine = root.contains(a);
    if (!mine && !(inView && (!a || a === document.body))) return;
    if (document.querySelector("dialog[open]") || !document.getElementById("cart").hidden) return;
    e.preventDefault(); go(e.key === "ArrowRight" ? 1 : -1);
  });
  prevB.addEventListener("click", function () { go(-1); });
  nextB.addEventListener("click", function () { go(1); });
  list.addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]"); if (!b) return;
    var li = b.closest(".kat__pg"), art = li.querySelector(".kat__art svg");
    if (B.add(b.dataset.add, art)) { b.classList.remove("is-ok"); void b.offsetWidth; b.classList.add("is-ok"); }
  });

  // Breite wechselt zwischen Doppelseite und Einzelseite: Lesestelle mitnehmen
  function remode() {
    var m = mq.matches ? "spread" : "single"; if (m === C.mode) { view.relayout(); update(); return; }
    if (C.busy) { C.busy = false; C.queued = 0; book.classList.remove("is-turning"); }
    var s = C.s;
    C.s = m === "single" ? (s === 0 ? 0 : s === NF / 2 ? NF - 1 : 2 * s - 1) : Math.ceil(s / 2);
    C.mode = m; view.relayout(); view.set(C.s); update();
  }
  if (mq.addEventListener) mq.addEventListener("change", remode); else mq.addListener(remode);

  // Preise, Lager oder Sprache geändert (app.js meldet jede Neuzeichnung des Shops)
  document.addEventListener("bk:shop", function () {
    if (signature() === C.sig) return;
    build(); update(); view.invalidate();
  });

  build(); update();

  /* ---------- WebGL nachladen, sobald das Buch in die Nähe kommt ---------- */
  if (reduce || !webglOk(true)) return;
  whenNear(book, function () {
    var fonts = document.fonts ? Promise.all(['600 20px "Fraunces"', 'italic 400 20px "Fraunces"', '400 20px "Outfit"', '600 20px "Outfit"'].map(function (f) { return document.fonts.load(f); })).catch(function () {}) : Promise.resolve();
    Promise.all([loadThree(), import("/beispiele/_shared/vendor/three-r180/RoomEnvironment.js"), import("/beispiele/shop/katalog3d.js?v=ea01a3aa"), fonts]).then(function (m) {
      var v = m[2].createBook(m[0], m[1].RoomEnvironment, {
        host: book, gl: glEl, count: NF, page: page, mode: function () { return C.mode; }, onLayout: function () { if (C.gl) place(); },
        onFirst: function () { C.gl = true; root.classList.add("kat--gl"); update(); }
      });
      v.set(C.s);
      if (C.busy) { C.busy = false; book.classList.remove("is-turning"); }
      view = v;
    }).catch(function (err) { if (window.console) console.warn("Katalog: 3D nicht verfügbar", err); });
  }, "500px");
}

if (root && window.BKshop) init();
