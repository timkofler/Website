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
    knots(z);
  }
  // Verspannungen der Zone als pulsierende Knoten, die sich nacheinander lösen
  var KNOTS = { nacken: [[143, 88], [157, 97]], schultern: [[106, 124], [194, 124], [124, 142]], ruecken: [[136, 176], [165, 198], [146, 236]], beine: [[121, 352], [180, 384], [126, 436]] };
  var kG = $("#knots"), hint = $("#knotHint"), kT = [];
  function knots(z) {
    kT.forEach(clearTimeout); kT = [];
    var pts = KNOTS[z] || [], NS = "http://www.w3.org/2000/svg";
    kG.textContent = "";
    var els = pts.map(function (p) {
      var g = document.createElementNS(NS, "g"); g.setAttribute("class", "knot"); g.setAttribute("transform", "translate(" + p[0] + " " + p[1] + ")");
      g.innerHTML = '<circle class="k-ring" r="9"/><circle class="k-core" r="5.5"/>';
      kG.appendChild(g); return g;
    });
    var n = els.length;
    function done() { hint.textContent = "Gelöst – so soll es sich nach der Stunde anfühlen."; hint.classList.add("is-free"); }
    hint.classList.remove("is-free");
    if (reduce) { els.forEach(function (g) { g.classList.add("is-free"); }); done(); return; }
    hint.textContent = n + " verspannte Stellen gefunden …";
    els.forEach(function (g, i) {
      kT.push(setTimeout(function () {
        g.classList.add("is-free");
        hint.textContent = i + 1 < n ? (n - i - 1) + (n - i - 1 === 1 ? " Stelle" : " Stellen") + " noch verspannt …" : "";
        if (i + 1 === n) done();
      }, 1400 + i * 900));
    });
  }
  zones.forEach(function (z) {
    z.addEventListener("click", function () { pick(z.getAttribute("data-z")); });
    z.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(z.getAttribute("data-z")); } });
  });
  chips.forEach(function (c) { c.addEventListener("click", function () { pick(c.getAttribute("data-z")); }); });
  info.addEventListener("click", function (e) { var a = e.target.closest("[data-opt]"); if (a && sel) sel.selectedIndex = +a.getAttribute("data-opt"); });
  pick("ruecken");
  // Erst lösen, wenn die Karte zu sehen ist
  if ("IntersectionObserver" in window) {
    kT.forEach(clearTimeout); kT = []; hint.textContent = ""; kG.textContent = "";
    var kio = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { kio.disconnect(); var on = $(".zone[aria-pressed=true]"); knots(on ? on.getAttribute("data-z") : "ruecken"); }
    }, { threshold: 0.45 });
    kio.observe($(".body"));
  }

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
    // Arm als durchgehende Form: Schulter -> Ellbogen (2-Gelenk-IK, Ellbogen nach außen) -> Handgelenk.
    var UP = 58, LO = 60;
    function f(n) { return n.toFixed(1); }
    function P(p) { return f(p[0]) + " " + f(p[1]); }
    function add(a, b, k) { return [a[0] + b[0] * k, a[1] + b[1] * k]; }
    function nrm(a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1; return [-dy / l, dx / l]; }
    function mid(a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
    var armParts = {};
    function arm(g, S, W, side) {
      var parts = armParts[g.id] || (armParts[g.id] = { limb: g.querySelector(".ms-limb"), shade: g.querySelector(".ms-shade"), sleeve: g.querySelector(".ms-sleeve"), hem: g.querySelector(".ms-hem") });
      var dx = W[0] - S[0], dy = W[1] - S[1], d = Math.sqrt(dx * dx + dy * dy);
      var dd = Math.max(Math.abs(UP - LO) + 1, Math.min(d, (UP + LO) * 0.995));
      var a = Math.acos((UP * UP + dd * dd - LO * LO) / (2 * UP * dd)) * (side < 0 ? 1 : -1);
      var ux = dx / d, uy = dy / d, E = [S[0] + UP * (ux * Math.cos(a) - uy * Math.sin(a)), S[1] + UP * (ux * Math.sin(a) + uy * Math.cos(a))];
      var n1 = nrm(S, E), n2 = nrm(E, W), nE = [n1[0] + n2[0], n1[1] + n2[1]], ln = Math.sqrt(nE[0] * nE[0] + nE[1] * nE[1]) || 1;
      var cosH = Math.max(.6, ln / 2); nE = [nE[0] / ln / cosH, nE[1] / ln / cosH];
      var hS = 11.5, hE = 9, hW = 6.5;
      var a1 = add(S, n1, hS), a2 = add(E, nE, hE), a3 = add(W, n2, hW), b1 = add(S, n1, -hS), b2 = add(E, nE, -hE), b3 = add(W, n2, -hW);
      // Ober- und Unterarm in einem Pfad, Ellbogen weich gerundet, runde Enden an Schulter und Handgelenk
      parts.limb.setAttribute("d", "M" + P(a1) + " L" + P(mid(a1, a2)) + " Q" + P(a2) + " " + P(mid(a2, a3)) + " L" + P(a3) +
        " A" + hW + " " + hW + " 0 0 1 " + P(b3) + " L" + P(mid(b3, b2)) + " Q" + P(b2) + " " + P(mid(b2, b1)) + " L" + P(b1) +
        " A" + hS + " " + hS + " 0 0 1 " + P(a1) + " Z");
      // dezenter Schatten an der Unterarm-Innenseite (zur Körpermitte hin)
      var sh = side < 0 ? -1 : 1, c2 = add(E, nE, sh * hE * .6), c3 = add(W, n2, sh * hW * .35), o2 = add(E, nE, sh * hE), o3 = add(W, n2, sh * hW);
      parts.shade.setAttribute("d", "M" + P(mid(c2, o2)) + " Q" + P(o2) + " " + P(mid(o2, o3)) + " L" + P(o3) + " L" + P(c3) + " L" + P(mid(c2, c3)) + " Z");
      // Ärmel (Kurzarm-Kasack) über der oberen Hälfte des Oberarms
      var k = .5, M2 = [S[0] + (E[0] - S[0]) * k, S[1] + (E[1] - S[1]) * k], hM = hS + 3;
      var r = hS + 2.5, s1 = add(S, n1, r), s2 = add(M2, n1, hM), s3 = add(M2, n1, -hM), s4 = add(S, n1, -r);
      parts.sleeve.setAttribute("d", "M" + P(s2) + " L" + P(s1) + " A" + f(r) + " " + f(r) + " 0 0 1 " + P(s4) + " L" + P(s3) + " Z");
      parts.hem.setAttribute("d", "M" + P(add(M2, n1, hM - 1)) + " L" + P(add(M2, n1, -hM + 1)));
    }
    function backSlope(x) { return (backY(x + 2) - backY(x - 2)) / 4; }
    function hand(g, x, y, s, mirror) {
      var ang = Math.atan(backSlope(x) * s), deg = ang * 180 / Math.PI;
      g.setAttribute("transform", "translate(" + f(x) + " " + f(y) + ") rotate(" + deg.toFixed(2) + ")");
      var wx = mirror ? 18 : -18, wy = -6.5;
      return [x + wx * Math.cos(ang) - wy * Math.sin(ang), y + wx * Math.sin(ang) + wy * Math.cos(ang)];
    }
    function draw(t) {
      var b = breath(t), s = 1 + 0.018 * b.s;
      body.setAttribute("transform", "matrix(1 0 0 " + s.toFixed(4) + " 0 " + (330 * (1 - s)).toFixed(2) + ")");
      // Massagezentrum wandert langsam über den Rücken, Hände kreisen gegengleich
      var c = 364 + 62 * Math.sin(t / 16000 * Math.PI * 2 - Math.PI / 2), w = t / 3400 * Math.PI * 2;
      var xL = c - 48 + 16 * Math.cos(w), xR = c + 48 + 16 * Math.cos(w + Math.PI);
      // Handflächen liegen auf der Rückenlinie und drücken leicht ein (Druckphase abwechselnd)
      var yL = 330 - (330 - backY(xL)) * s + 1 + 1.2 * Math.max(0, Math.sin(w)), yR = 330 - (330 - backY(xR)) * s + 1 + 1.2 * Math.max(0, Math.sin(w + Math.PI));
      var tx = c + 4 * Math.sin(w), lean = 3 + 3 * Math.sin(w * 2);
      ther.setAttribute("transform", "translate(" + f(tx) + " " + f(lean) + ")");
      var wL = hand(hL, xL, yL, s, true), wR = hand(hR, xR, yR, s, false);
      arm(aL, [tx - 49, 170 + lean], wL, -1); arm(aR, [tx + 49, 170 + lean], wR, 1);
      var pl = .35 + .65 * Math.max(0, Math.sin(w)), pr = .35 + .65 * Math.max(0, Math.sin(w + Math.PI));
      pressL.setAttribute("cx", xL.toFixed(1)); pressL.setAttribute("cy", (yL + 4).toFixed(1)); pressL.setAttribute("opacity", pl.toFixed(2));
      pressR.setAttribute("cx", xR.toFixed(1)); pressR.setAttribute("cy", (yR + 4).toFixed(1)); pressR.setAttribute("opacity", pr.toFixed(2));
      if (t - lastTrail > 420) {
        lastTrail = t; var a = trail[ti++ % trail.length], left = ti % 2;
        a.t = t; a.e.setAttribute("cx", (left ? xL : xR).toFixed(1)); a.e.setAttribute("cy", ((left ? yL : yR) + 5).toFixed(1));
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
