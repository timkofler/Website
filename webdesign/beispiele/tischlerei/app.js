// Tischlerei Holzwerk Brandl – Beispielseite von tim-kofler.at
// Navigation, Holzarten-Auswahl, scroll-gesteuerte Explosionszeichnung, Galerie mit Lightbox, Formular.
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var bar = $(".tk-demo-bar");
  function setBar() { if (bar) document.documentElement.style.setProperty("--bar", bar.offsetHeight + "px"); }
  setBar(); window.addEventListener("resize", setBar);

  // Mobilmenü
  var burger = $("#burger"), panel = $("#mpanel");
  function menu(open) {
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    panel.classList.toggle("open", open);
  }
  burger.addEventListener("click", function () { menu(burger.getAttribute("aria-expanded") !== "true"); });
  panel.addEventListener("click", function (e) { if (e.target.closest("a")) menu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("open")) { menu(false); burger.focus(); } });

  // Holzarten
  var WOODS = {
    eiche: { n: "Eiche", lat: "Quercus robur · heimisch", tag: "Eiche · geölt", d: "Hart, zäh und langlebig – der Klassiker für Esstische, Stiegen und Böden. Markante Poren, lebendige Maserung, und mit den Jahren wird sie goldener.", p: [.8, .78, .55], v: ["hart", "690 kg/m³", "mittel"], u: "Esstische, Stiegen, Böden, Fronten" },
    nuss: { n: "Nuss", lat: "Juglans regia · Walnuss", tag: "Nuss · geölt", d: "Schokoladenbraun mit lebhafter, oft geflammter Zeichnung. Edel und warm – für Fronten, Esstische und Einzelstücke, die man nie wieder hergibt.", p: [.7, .72, .9], v: ["mittelhart", "640 kg/m³", "dunkel"], u: "Fronten, Esstische, Sideboards, Furnier" },
    laerche: { n: "Lärche", lat: "Larix decidua · Alpenraum", tag: "Lärche · natur", d: "Harzreich, rötlich und von Natur aus witterungsfest. Unsere erste Wahl für Terrassen, Fassaden und Fenster – und für Badmöbel, die Feuchtigkeit aushalten.", p: [.6, .66, .62], v: ["mittel", "590 kg/m³", "rötlich"], u: "Terrassen, Fassaden, Fenster, Bad" },
    zirbe: { n: "Zirbe", lat: "Pinus cembra · Hochgebirge", tag: "Zirbe · unbehandelt", d: "Weich, hell, mit charmanten Ästen – und einem Duft, der den Raum noch Jahre erfüllt. Viele schwören darauf für einen ruhigen Schlaf: unser Favorit fürs Schlafzimmer.", p: [.3, .48, .2], v: ["weich", "420 kg/m³", "hell"], u: "Schlafzimmer, Zirbenbetten, Stuben" }
  };
  var tabs = $$(".tab");
  function wood(k) {
    var w = WOODS[k]; if (!w) return;
    tabs.forEach(function (t) { t.setAttribute("aria-pressed", t.dataset.w === k ? "true" : "false"); });
    $$(".swatch .sw").forEach(function (s) { s.classList.toggle("on", s.dataset.w === k); });
    $("#wname").innerHTML = w.n + '<small id="wlat">' + w.lat + "</small>";
    $("#wdesc").textContent = w.d; $("#wtag").textContent = w.tag; $("#wuse").textContent = w.u;
    for (var i = 0; i < 3; i++) { $("#wp" + (i + 1)).style.transform = "scaleX(" + w.p[i] + ")"; $("#wv" + (i + 1)).textContent = w.v[i]; }
  }
  tabs.forEach(function (t) { t.addEventListener("click", function () { wood(t.dataset.w); }); });

  // Explosionszeichnung, scroll-gesteuert
  var build = $("#fertigung"), parts = $$("#sideboard .pt"), dims = $$("#sideboard .dim"),
    stepsEl = $$("#bsteps li"), prog = $("#bprog"), stamp = $("#stamp");
  var cfg = parts.map(function (el) {
    return { el: el, a: +el.dataset.a, b: +el.dataset.b, dx: +el.dataset.dx, dy: +el.dataset.dy, r: +el.dataset.r };
  });
  var dcfg = dims.map(function (g) {
    return { a: +g.dataset.a, lines: $$(".dl", g), txt: $$(".dt,.dd", g) };
  });
  var STEPS = [0, .30, .46, .60, .76];
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  var last = -1;
  function render(p) {
    if (Math.abs(p - last) < .0005) return; last = p;
    cfg.forEach(function (c) {
      var t = clamp((p - c.a) / (c.b - c.a)), e = ease(t), k = 1 - e;
      c.el.style.transform = k ? "translate(" + (c.dx * k).toFixed(1) + "px," + (c.dy * k).toFixed(1) + "px) rotate(" + (c.r * k).toFixed(2) + "deg)" : "none";
      c.el.style.opacity = Math.min(1, t * 2.5).toFixed(3);
    });
    dcfg.forEach(function (d) {
      var t = clamp((p - d.a) / .08);
      d.lines.forEach(function (l) { l.style.strokeDashoffset = (1 - t).toFixed(3); });
      d.txt.forEach(function (x) { x.style.opacity = clamp((t - .6) / .4).toFixed(2); });
    });
    var s = 0; for (var i = 0; i < STEPS.length; i++) if (p >= STEPS[i]) s = i;
    stepsEl.forEach(function (li, i) { li.classList.toggle("on", i === s); });
    if (prog) prog.style.transform = "scaleX(" + p.toFixed(3) + ")";
    if (stamp) stamp.classList.toggle("on", p > .955);
  }
  function progress() {
    var r = build.getBoundingClientRect(), inner = build.firstElementChild.offsetHeight;
    var span = r.height - inner;
    return span > 0 ? clamp(-r.top / span * 1.06) : 1;
  }
  // Auf schmalen Bildschirmen enger zuschneiden, damit das Möbel größer wird
  var sbSvg = $("#sideboard");
  function fitBox() { if (sbSvg) sbSvg.setAttribute("viewBox", window.innerWidth < 700 ? "10 150 750 390" : "20 115 790 400"); }
  fitBox(); window.addEventListener("resize", fitBox);
  if (build && parts.length) {
    if (reduce) render(1);
    else {
      var ticking = false;
      var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; render(progress()); }); } };
      cfg.forEach(function (c) { c.el.style.transformBox = "fill-box"; c.el.style.transformOrigin = "center"; });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      render(progress());
    }
  }

  // Galerie + Lightbox
  var gal = $$("#gal button"), lb = $("#lb"), lbImg = $("#lbImg"), lbCap = $("#lbCap"), cur = 0;
  function show(i) {
    cur = (i + gal.length) % gal.length;
    var b = gal[cur], im = b.querySelector("img");
    lbImg.src = b.dataset.full; lbImg.alt = im.alt; lbCap.textContent = b.dataset.cap;
  }
  if (lb && lb.showModal) {
    gal.forEach(function (b, i) { b.addEventListener("click", function () { show(i); lb.showModal(); }); });
    $("#lbPrev").addEventListener("click", function () { show(cur - 1); });
    $("#lbNext").addEventListener("click", function () { show(cur + 1); });
    $("#lbClose").addEventListener("click", function () { lb.close(); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") show(cur - 1); if (e.key === "ArrowRight") show(cur + 1); });
    lb.addEventListener("close", function () { var b = gal[cur]; if (b) b.focus(); });
  }

  // Formular: nichts absenden
  var form = $("#form"), msg = $("#msg");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); msg.classList.remove("show"); void msg.offsetWidth; msg.classList.add("show"); });
})();
