// Lot & Linie – Texte zum Bau beim Scrollen, Hausplaner mit Richtpreis, Bauzeitplan, Projektzeichnungen, Menü und Formular
(function () {
  "use strict";
  var H = window.LLHaus;
  var $ = function (s) { return document.querySelector(s); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Tausenderpunkt und Dezimalkomma wie in den Texten, unabhängig von der Spracheinstellung des Browsers
  var de = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); };
  var de1 = function (n) { return n.toFixed(1).replace(".", ","); };
  function glOk() { try { var c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } }
  var gl = glOk();

  // Menü
  var burger = $("#burger"), panel = $("#mpanel");
  if (burger && panel) {
    var setOpen = function (o) { burger.setAttribute("aria-expanded", o); burger.setAttribute("aria-label", o ? "Menü schließen" : "Menü öffnen"); panel.classList.toggle("open", o); };
    burger.addEventListener("click", function () { setOpen(burger.getAttribute("aria-expanded") !== "true"); });
    panel.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }

  // Leinwand in Gerätepixeln
  function fitCanvas(cv) {
    var r = cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
    var w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    return d;
  }
  // Zeichnet ein Haus in 2D; mit anim wächst es in ms Millisekunden
  function sketch(cv, opts, view, ms) {
    var data = H.build(opts), ctx = cv.getContext("2d");
    function frame(u) { var d = fitCanvas(cv); H.draw2d(ctx, data, Object.assign({ u: u, lw: d * .9 }, view)); }
    if (!ms || reduce) { frame(1); return; }
    var t0 = performance.now();
    (function step(t) { var u = Math.min(1, (t - t0) / ms); frame(u); if (u < 1) requestAnimationFrame(step); })(t0);
  }

  // ---------- Kopfbereich ----------
  var sec = $("#bau");
  if (sec) {
    var stageEl = sec.querySelector(".build__stage"), phs = [].slice.call(sec.querySelectorAll(".ph")), steps = [].slice.call(sec.querySelectorAll(".steps4 span"));
    var pct = $("#pct"), root = document.documentElement, last = -1;
    if (!gl || reduce) {
      sec.classList.add("is-static");
      var cv = $("#bau2d"), draw = function () { sketch(cv, { w: 12.4, d: 9.2, floors: 2, roof: "sattel", keller: true }, { yaw: .62, pitch: .5, pad: .04 }); };
      draw(); addEventListener("resize", draw);
    } else {
      var tick = function () {
        var r = sec.getBoundingClientRect(), span = sec.offsetHeight - stageEl.offsetHeight;
        var p = Math.min(1, Math.max(0, -r.top / Math.max(1, span)));
        if (Math.abs(p - last) < .0005) return; last = p;
        root.style.setProperty("--bau", p.toFixed(4));
        sec.classList.toggle("past-intro", p > .04);
        phs.forEach(function (el) { var on = p >= +el.dataset.from && p < +el.dataset.to; el.classList.toggle("is-act", on); el.setAttribute("aria-hidden", on ? "false" : "true"); });
        var st = p < .05 ? 0 : p < .4 ? 1 : p < .7 ? 2 : 3;
        steps.forEach(function (s, i) { s.classList.toggle("is-act", i === st); });
        var u = p < .002 ? .3 : .3 + .7 * Math.min(1, p / .86);
        if (pct) pct.textContent = Math.round(u * 100) + " %";
      };
      addEventListener("scroll", function () { requestAnimationFrame(tick); }, { passive: true });
      addEventListener("resize", tick); tick();
    }
  }

  // ---------- Hausplaner ----------
  var qA = $("#qA");
  if (qA) {
    var PRICE = { roh: 1450, belag: 2200, fertig: 2900 }, KELLER = { roh: 780, belag: 980, fertig: 1150 };
    var ROOF = { sattel: 1, walm: 1.04, flach: 1.03 }, MONTHS = { roh: [4, 5], belag: [7, 9], fertig: [9, 11] };
    var NAMES = { roh: "Rohbau", belag: "belagsfertig", fertig: "schlüsselfertig" }, ROOFN = { sattel: "Satteldach", walm: "Walmdach", flach: "Flachdach" };
    var val = function (n) { var el = document.querySelector('input[name="' + n + '"]:checked'); return el && el.value; };
    var p2d = $("#plan2d"), pv = $("#plan3d"), timer = 0, lastKey = "";
    var state = function () {
      var a = +qA.value, fl = +val("fl"), d = H.dims(a, fl);
      return { area: a, floors: fl, roof: val("dach"), stufe: val("stufe"), keller: $("#qK").checked, w: d.w, d: d.d };
    };
    var calc = function () {
      var s = state(), fp = s.w * s.d;
      qA.style.setProperty("--v", ((s.area - qA.min) / (qA.max - qA.min) * 100) + "%");
      $("#oA").textContent = s.area + " m²";
      var base = s.area * PRICE[s.stufe] * ROOF[s.roof] * (s.floors === 1 ? 1.08 : 1) + (s.keller ? fp * KELLER[s.stufe] : 0);
      var lo = Math.round(base * .94 / 1000) * 1000, hi = Math.round(base * 1.06 / 1000) * 1000;
      $("#rP").textContent = "€ " + de(lo) + " – " + de(hi);
      var mo = MONTHS[s.stufe].slice(); if (s.keller) { mo[0]++; mo[1]++; }
      $("#rT").textContent = mo[0] + "–" + mo[1] + " Monate";
      $("#rF").textContent = de(Math.round(fp)) + " m²";
      $("#rM").textContent = "€ " + de(Math.round(base / s.area / 10) * 10);
      $("#pDim").textContent = de1(s.w) + " × " + de1(s.d) + " m";
      $("#pPlot").textContent = "ca. " + de(Math.round(fp * 3.6 / 10) * 10) + " m²";
      var opts = { w: s.w, d: s.d, floors: s.floors, roof: s.roof, keller: s.keller };
      window.LLPlan = opts;
      var key = JSON.stringify(opts);
      if (key !== lastKey) {
        lastKey = key; clearTimeout(timer);
        // Beim Ziehen am Regler erst nach kurzer Pause neu zeichnen
        timer = setTimeout(function () {
          window.dispatchEvent(new CustomEvent("ll:plan", { detail: opts }));
          if (!gl && p2d) sketch(p2d, Object.assign({ site: false }, opts), { yaw: .62, pitch: .5, pad: .1 }, 1600);
        }, 140);
      }
      var m = $("#m");
      if (m) m.dataset.plan = "Einfamilienhaus " + NAMES[s.stufe] + ", ca. " + s.area + " m² Wohnfläche, " + (s.floors === 1 ? "Bungalow" : "zwei Geschoße") + ", " + ROOFN[s.roof] + (s.keller ? ", mit Keller" : ", ohne Keller") + ". Richtpreis laut Hausplaner: " + $("#rP").textContent + ".";
    };
    ["input", "change"].forEach(function (ev) { $("#planer").addEventListener(ev, function (e) { if (e.target.matches("input")) calc(); }); });
    calc();
    $("#rGo").addEventListener("click", function () {
      var m = $("#m"), z = document.querySelector('input[name="art"][value="neubau"]');
      if (m && m.dataset.plan) m.value = m.dataset.plan; if (z) z.checked = true;
    });
    if (!gl && pv) pv.style.cursor = "default";
  }

  // ---------- Bauzeitplan: Strich bis zur Übergabe ----------
  var gantt = $("#gantt"), now = $("#gNow");
  if (gantt && now && "IntersectionObserver" in window) {
    var go = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; go.disconnect();
      var track = gantt.querySelector(".g__row .g__track"), gr = gantt.getBoundingClientRect(), tr = track.getBoundingClientRect();
      if (!tr.width || matchMedia("(max-width: 820px)").matches) return;
      var x0 = tr.left - gr.left, x1 = x0 + tr.width * 11 / 12;
      if (reduce) { now.style.left = x1 + "px"; now.style.opacity = 1; return; }
      var t0 = performance.now() + 300;
      (function step(t) { var k = Math.min(1, Math.max(0, (t - t0) / 2200)); k = 1 - Math.pow(1 - k, 3); now.style.left = (x0 + (x1 - x0) * k) + "px"; now.style.opacity = k > 0 ? 1 : 0; if (k < 1) requestAnimationFrame(step); })(performance.now());
    }, { threshold: .35 });
    go.observe(gantt);
  }

  // ---------- Projekte: Zeichnung entsteht beim Hinscrollen, beim Darüberfahren noch einmal ----------
  var cards = [].slice.call(document.querySelectorAll("canvas[data-haus]"));
  cards.forEach(function (cv) {
    var c = JSON.parse(cv.dataset.haus), d = H.dims(c.area, c.floors), busy = false;
    var opts = { w: d.w, d: d.d, floors: c.floors, roof: c.roof, keller: c.keller, site: false };
    var view = { yaw: c.yaw, pitch: .48, pad: .1 };
    var play = function (ms) { if (busy) return; busy = true; sketch(cv, opts, view, ms); setTimeout(function () { busy = false; }, ms || 0); };
    if (!("IntersectionObserver" in window)) { play(0); return; }
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); play(2400); } }, { threshold: .4 });
    io.observe(cv);
    var card = cv.closest(".pc");
    if (card && !reduce) card.addEventListener("mouseenter", function () { play(1800); });
    addEventListener("resize", function () { if (!busy) sketch(cv, opts, view); });
  });

  // ---------- Formular ----------
  var form = $("#form");
  if (form) {
    var f = $("#f"), fname = $("#fname");
    if (f && fname) f.addEventListener("change", function () { var n = f.files.length; fname.textContent = n ? (n === 1 ? f.files[0].name : n + " Dateien ausgewählt") : "Plan oder Grundstücksfotos anhängen"; });
    form.addEventListener("submit", function (e) { e.preventDefault(); $("#msg").classList.add("show"); });
  }
})();
