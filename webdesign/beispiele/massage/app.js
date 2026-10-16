// Praxis Sonnfeld – Beispielseite. Navigation, Körperkarte, Massage-Szene mit Atemführung,
// Ablauf-Linie und Terminanfrage (Attrappe).
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var SVGNS = "http://www.w3.org/2000/svg";
  var DEMO_MSG = "Das ist ein Beispiel – auf der echten Seite käme Ihre Anfrage jetzt direkt beim Betrieb an.";

  /* ---------- Navigation ---------- */
  var bar = $(".tk-demo-bar"), nav = $("#nav"), burger = $("#burger"), panel = $("#panel");
  function setBar() { document.documentElement.style.setProperty("--bar", (bar ? bar.offsetHeight : 0) + "px"); }
  setBar(); window.addEventListener("resize", setBar);
  function onScroll() { nav.classList.toggle("is-solid", window.scrollY > 30); }
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  function menu(open) {
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    panel.classList.toggle("is-open", open);
    if (open) { var f = panel.querySelector("a"); if (f) f.focus(); }
  }
  burger.addEventListener("click", function () { menu(burger.getAttribute("aria-expanded") !== "true"); });
  $$("a", panel).forEach(function (a) { a.addEventListener("click", function () { menu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("is-open")) { menu(false); burger.focus(); } });
  document.addEventListener("click", function (e) { if (panel.classList.contains("is-open") && !panel.contains(e.target) && !burger.contains(e.target)) menu(false); });

  /* ---------- Körperkarte ---------- */
  var ZONES = {
    nacken: { t: "Nacken", d: "Steifer Nacken vom Bildschirm, Spannungskopfschmerz oder ein „verlegener“ Hals nach einer kurzen Nacht.",
      l: [["Heilmassage", "Nacken-Schulter-Fokus · 30 Min.", "45 €", 0], ["Triggerpunkt", "löst ausstrahlende Knoten · 30 Min.", "48 €", 4]] },
    schultern: { t: "Schultern", d: "Hochgezogene Schultern, Verspannungen zwischen den Schulterblättern, eingeschränkte Beweglichkeit.",
      l: [["Heilmassage", "Schultern & oberer Rücken · 30 Min.", "45 €", 0], ["Heilmassage", "ausführlich · 60 Min.", "79 €", 1], ["Triggerpunkt", "gezielt · 30 Min.", "48 €", 4]] },
    ruecken: { t: "Rücken", d: "Muskuläre Rückenschmerzen, Nachbehandlung nach Hexenschuss, langes Sitzen oder schweres Heben.",
      l: [["Heilmassage", "ganzer Rücken · 60 Min.", "79 €", 1], ["Heilmassage", "Lendenwirbelbereich · 30 Min.", "45 €", 0], ["Triggerpunkt", "als Zusatz", "+ 18 €", 4]] },
    beine: { t: "Beine", d: "Schwere, müde Beine, Wassereinlagerungen, nach Operationen oder langen Tagen im Stehen.",
      l: [["Lymphdrainage", "entstauend · 45 Min.", "62 €", 2], ["Lymphdrainage", "beide Beine · 60 Min.", "75 €", 3], ["Fußreflexzonen", "entspannend · 45 Min.", "58 €", 5]] }
  };
  var info = $("#map-info"), zones = $$(".zone"), chips = $$(".chips button"), glows = $$(".glow");
  var sel = $("#f-beh");
  function pick(z) {
    var d = ZONES[z]; if (!d) return;
    zones.concat(chips).forEach(function (e) { e.setAttribute("aria-pressed", e.getAttribute("data-z") === z ? "true" : "false"); });
    glows.forEach(function (g) { g.classList.toggle("on", g.getAttribute("data-g") === z); });
    info.innerHTML = "<h3>" + d.t + "</h3><p>" + d.d + "</p><ul>" + d.l.map(function (x) {
      return "<li><div><b>" + x[0] + "</b><small>" + x[1] + "</small></div><span>" + x[2] + "</span></li>";
    }).join("") + '</ul><a class="btn light" href="#termin" data-opt="' + d.l[0][3] + '">Termin für ' + d.t + " anfragen</a>";
    info.classList.remove("swap"); void info.offsetWidth; info.classList.add("swap");
  }
  zones.forEach(function (z) {
    z.addEventListener("click", function () { pick(z.getAttribute("data-z")); });
    z.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(z.getAttribute("data-z")); } });
  });
  chips.forEach(function (c) { c.addEventListener("click", function () { pick(c.getAttribute("data-z")); }); });
  info.addEventListener("click", function (e) { var a = e.target.closest("[data-opt]"); if (a && sel) sel.selectedIndex = +a.getAttribute("data-opt"); });
  pick("ruecken");

  /* ---------- Massage-Szene + Atemführung ---------- */
  var svg = $("#ms-svg");
  (function () {
    var body = $("#ms-body"), ther = $("#ms-ther"), hL = $("#ms-handL"), hR = $("#ms-handR"), aL = $("#ms-armL"), aR = $("#ms-armR"), gG = $("#ms-glows");
    var orb = $("#orb"), orb2 = $("#orb2"), ot = $("#orb-t"), on = $("#orb-n"), btn = $("#orb-btn");
    function el(tag, attrs, parent) { var e = document.createElementNS(SVGNS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
    var pressL = el("circle", { r: 38, fill: "url(#ms-press)" }, gG), pressR = el("circle", { r: 38, fill: "url(#ms-press)" }, gG);
    var trail = [], ti = 0, lastTrail = 0;
    for (var i = 0; i < 16; i++) trail.push({ e: el("circle", { r: 9, fill: "url(#ms-press)", opacity: 0 }, gG), t: -1e9 });
    function backY(x) { return 273 + 10 * Math.sin(Math.PI * Math.max(0, Math.min(1, (x - 222) / 250))); }
    function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function breath(t) { var c = (t / 1000) % 10; return c < 4 ? { s: ease(c / 4), inh: true, left: Math.ceil(4 - c) } : { s: 1 - ease((c - 4) / 6), inh: false, left: Math.ceil(10 - c) }; }
    function arm(g, hx, hy, sx, sy) {
      var dx = sx - hx, dy = sy - hy, len = Math.sqrt(dx * dx + dy * dy), ang = Math.atan2(dx, -dy) * 180 / Math.PI;
      g.setAttribute("transform", "translate(" + hx.toFixed(1) + " " + hy.toFixed(1) + ") rotate(" + ang.toFixed(2) + ") scale(1 " + (len / 240).toFixed(3) + ")");
    }
    function draw(t) {
      var b = breath(t), s = 1 + 0.018 * b.s;
      body.setAttribute("transform", "matrix(1 0 0 " + s.toFixed(4) + " 0 " + (330 * (1 - s)).toFixed(2) + ")");
      // Massagezentrum wandert langsam über den Rücken, Hände kreisen gegengleich
      var c = 348 + 74 * Math.sin(t / 16000 * Math.PI * 2 - Math.PI / 2), w = t / 3400 * Math.PI * 2;
      var xL = c - 44 + 16 * Math.cos(w), xR = c + 44 + 16 * Math.cos(w + Math.PI);
      var yL = 330 - (330 - backY(xL)) * s - 7 + 3 * Math.sin(w), yR = 330 - (330 - backY(xR)) * s - 7 + 3 * Math.sin(w + Math.PI);
      var tx = c + 6 + 6 * Math.sin(w), lean = 4 * Math.sin(w * 2);
      ther.setAttribute("transform", "translate(" + tx.toFixed(1) + " " + lean.toFixed(1) + ")");
      arm(aL, xL, yL - 3, tx - 46, 166 + lean); arm(aR, xR, yR - 3, tx + 46, 166 + lean);
      hL.setAttribute("transform", "translate(" + xL.toFixed(1) + " " + yL.toFixed(1) + ")");
      hR.setAttribute("transform", "translate(" + xR.toFixed(1) + " " + yR.toFixed(1) + ")");
      var pl = .35 + .65 * Math.max(0, Math.sin(w)), pr = .35 + .65 * Math.max(0, Math.sin(w + Math.PI));
      pressL.setAttribute("cx", xL.toFixed(1)); pressL.setAttribute("cy", (yL + 10).toFixed(1)); pressL.setAttribute("opacity", pl.toFixed(2));
      pressR.setAttribute("cx", xR.toFixed(1)); pressR.setAttribute("cy", (yR + 10).toFixed(1)); pressR.setAttribute("opacity", pr.toFixed(2));
      if (t - lastTrail > 420) {
        lastTrail = t; var a = trail[ti++ % trail.length], left = ti % 2;
        a.t = t; a.e.setAttribute("cx", (left ? xL : xR).toFixed(1)); a.e.setAttribute("cy", ((left ? yL : yR) + 11).toFixed(1));
      }
      trail.forEach(function (p) { var age = (t - p.t) / 2600; p.e.setAttribute("opacity", age < 1 ? (0.7 * (1 - age)).toFixed(2) : 0); });
      // Atemkreis
      var k = .6 + .4 * b.s;
      orb.style.transform = "scale(" + k.toFixed(3) + ")"; orb2.style.transform = "scale(" + (k * 1.08).toFixed(3) + ")";
      var txt = b.inh ? "Einatmen" : "Ausatmen"; if (ot.textContent !== txt) ot.textContent = txt;
      on.textContent = b.left;
    }
    var running = !reduce, visible = false, raf = 0, base = 0, paused = 0;
    function loop(now) { draw(now - base); raf = requestAnimationFrame(loop); }
    function start() { if (raf || !running || !visible) return; base = performance.now() - paused; raf = requestAnimationFrame(loop); }
    function stop() { if (!raf) return; cancelAnimationFrame(raf); raf = 0; paused = performance.now() - base; }
    draw(reduce ? 2000 : 0);
    if (reduce) { ot.textContent = "4 ein · 6 aus"; on.textContent = ""; btn.textContent = "Starten"; btn.setAttribute("aria-pressed", "false"); }
    btn.addEventListener("click", function () {
      running = !running; btn.textContent = running ? "Pause" : "Weiter atmen"; btn.setAttribute("aria-pressed", running ? "true" : "false");
      if (running) { visible = true; start(); } else stop();
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es.some(function (e) { return e.isIntersecting; }); if (visible) start(); else stop(); }, { threshold: 0.15 }).observe($("#atmen"));
    } else { visible = true; start(); }
  })();

  /* ---------- Ablauf-Linie ---------- */
  var steps = $("#steps");
  if (steps && "IntersectionObserver" in window && !reduce) {
    var so = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { steps.classList.add("is-in"); so.disconnect(); } }, { threshold: .35 });
    so.observe(steps);
  } else if (steps) steps.classList.add("is-in");

  /* ---------- Terminanfrage (Attrappe) ---------- */
  var days = $("#f-days");
  if (days) {
    var WD = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], d = new Date(), out = "", n = 0;
    while (n < 8) {
      d.setDate(d.getDate() + 1); var w = d.getDay(); if (w === 0 || w === 6) continue;
      out += '<label class="pill"><input type="radio" name="tag" value="' + d.toISOString().slice(0, 10) + '"' + (n === 0 ? " checked" : "") + '><span><small>' + WD[w] + "</small>" + d.getDate() + "." + (d.getMonth() + 1) + ".</span></label>";
      n++;
    }
    days.innerHTML = out;
  }
  var form = $("#form"), msg = $("#msg");
  form.addEventListener("submit", function (e) { e.preventDefault(); msg.textContent = DEMO_MSG; msg.classList.add("on"); });
})();
