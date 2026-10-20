// Dachdeckerei First & Falz – Beispielseite von tim-kofler.at
// Navigation, Dachaufbau beim Scrollen, Dachrechner mit Zeichnung, Drohnen-Anzeige, Formular.
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var NS = "http://www.w3.org/2000/svg";
  function clamp(v, a, b) { a = a == null ? 0 : a; b = b == null ? 1 : b; return v < a ? a : v > b ? b : v; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

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

  // Dachaufbau: Schichten fallen beim Scrollen an ihren Platz, am Ende Regenprobe
  var build = $("#schichten"), roof = $("#roof");
  var parts = $$("#roof .ly").map(function (el) {
    return { el: el, a: +el.dataset.a, b: +el.dataset.b, dy: +(el.dataset.dy || 0), draw: !!el.dataset.draw };
  });
  var steps = $$("#bsteps li"), prog = $("#bprog"), labs = $$(".bart .lab"), now = $("#bnow");
  var STEPS = [0, .13, .27, .42, .7, .84];
  var rainG = $("#roof .rain");
  if (rainG) {
    for (var i = 0; i < 46; i++) {
      var l = document.createElementNS(NS, "line"), x = 60 + Math.random() * 700, y = 20 + Math.random() * 80;
      l.setAttribute("x1", x.toFixed(1)); l.setAttribute("y1", y.toFixed(1));
      l.setAttribute("x2", (x - 4).toFixed(1)); l.setAttribute("y2", (y + 18).toFixed(1));
      l.style.animationDelay = (-Math.random() * 1.1).toFixed(2) + "s";
      l.style.animationDuration = (0.8 + Math.random() * 0.6).toFixed(2) + "s";
      rainG.appendChild(l);
    }
  }
  var last = -1, lastStep = -1;
  function render(p) {
    if (Math.abs(p - last) < .0005) return; last = p;
    parts.forEach(function (c) {
      var t = clamp((p - c.a) / (c.b - c.a)), e = ease(t);
      if (c.draw) { c.el.style.transform = t < 1 ? "scaleX(" + e.toFixed(3) + ")" : "none"; c.el.style.opacity = t > 0 ? 1 : 0; }
      else { c.el.style.transform = t < 1 ? "translate(0," + (c.dy * (1 - e)).toFixed(1) + "px)" : "none"; c.el.style.opacity = clamp(t * 2.2).toFixed(3); }
    });
    var s = 0; for (var i = 0; i < STEPS.length; i++) if (p >= STEPS[i]) s = i;
    if (s !== lastStep) {
      lastStep = s;
      steps.forEach(function (li, i) { li.classList.toggle("on", i === s); });
      labs.forEach(function (l) { l.classList.toggle("on", +l.dataset.s === s); });
      if (now && steps[s]) now.innerHTML = "<b>" + steps[s].querySelector("span").textContent + ":</b> " + steps[s].querySelector("small").textContent;
    }
    if (prog) prog.style.transform = "scaleX(" + p.toFixed(3) + ")";
    if (roof) roof.classList.toggle("wet", p > .88);
  }
  function progress() {
    var r = build.getBoundingClientRect(), inner = build.firstElementChild.offsetHeight, span = r.height - inner;
    return span > 0 ? clamp(-r.top / span * 1.05) : 1;
  }
  function fitBox() { if (roof) roof.setAttribute("viewBox", window.innerWidth < 700 ? "78 62 644 440" : "40 40 720 470"); }
  fitBox(); window.addEventListener("resize", fitBox);
  if (build && parts.length) {
    if (reduce) render(1);
    else {
      var ticking = false;
      var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; render(progress()); }); } };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      render(progress());
    }
  }

  // Dachrechner
  var MATS = {
    steil: [
      { k: "ziegel", n: "Tondachziegel", c: "#c4552f", pr: [95, 140], kg: 45, life: [.8, "80 J."], st: [.8, "hoch"], min: 22 },
      { k: "beton", n: "Betondachstein", c: "#55595e", pr: [80, 115], kg: 50, life: [.6, "50 J."], st: [.75, "hoch"], min: 22 },
      { k: "blech", n: "Stehfalz Titanzink", c: "#7f8a94", pr: [130, 190], kg: 7, life: [.9, "80+ J."], st: [.95, "sehr hoch"], min: 5, falz: 1 },
      { k: "schiefer", n: "Schiefer", c: "#3a4049", pr: [170, 250], kg: 30, life: [1, "100 J."], st: [.7, "mittel"], min: 25 }
    ],
    flach: [
      { k: "bitumen", n: "Bitumen 2-lagig", c: "#2f3337", pr: [85, 125], kg: 10, life: [.45, "30 J."], st: [.9, "sehr hoch"], min: 2 },
      { k: "epdm", n: "EPDM-Bahn", c: "#1f2225", pr: [95, 140], kg: 3, life: [.65, "40 J."], st: [.9, "sehr hoch"], min: 2 },
      { k: "gruen", n: "Gründach", c: "#5f8a3c", pr: [130, 180], kg: 120, life: [.8, "50 J."], st: [.95, "sehr hoch"], min: 2 }
    ]
  };
  var NAMES = { sattel: "Satteldach", walm: "Walmdach", pult: "Pultdach", flach: "Flachdach" };
  var st = { form: "sattel", L: 12, B: 9, N: 38, mat: "ziegel" }, keepN = 38;
  var rL = $("#rL"), rB = $("#rB"), rN = $("#rN"), mats = $("#mats"), draw = $("#rdraw");
  function fmt(n) { return Math.round(n).toLocaleString("de-AT"); }
  function curMat() { var list = MATS[st.form === "flach" ? "flach" : "steil"]; return list.filter(function (m) { return m.k === st.mat; })[0] || list[0]; }
  function buildMats() {
    var list = MATS[st.form === "flach" ? "flach" : "steil"];
    if (!list.some(function (m) { return m.k === st.mat; })) st.mat = list[0].k;
    mats.innerHTML = list.map(function (m) {
      return '<button type="button" data-mat="' + m.k + '" aria-pressed="' + (m.k === st.mat) + '"><i style="--sw:' + m.c + '"></i>' + m.n + "</button>";
    }).join("");
  }
  function fill(r) { r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min) * 100).toFixed(1) + "%"); }

  function shade(hex, f) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255;
    function c(v) { return Math.round(clamp(f < 0 ? v * (1 + f) : v + (255 - v) * f, 0, 255)); }
    return "rgb(" + c(r) + "," + c(g) + "," + c(b) + ")";
  }
  function drawRoof() {
    var m = curMat(), L = st.L, B = st.B, p = st.N * Math.PI / 180, H = 3.1;
    var hr = st.form === "sattel" ? B / 2 * Math.tan(p) : st.form === "walm" ? Math.min(B, L) / 2 * Math.tan(p) : st.form === "pult" ? B * Math.tan(p) : 0.35;
    var ca = Math.cos(.6) * .5, sa = Math.sin(.6) * .5;
    var wTot = B + L * ca, hTot = H + hr + L * sa;
    var s = Math.min(520 / wTot, 270 / hTot), X0 = 320 - wTot * s / 2, Y0 = 330;
    function P(x, y, z) { return [X0 + (x + z * ca) * s, Y0 - (y + z * sa) * s]; }
    function poly(pts, f, extra) { return '<polygon points="' + pts.map(function (q) { return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" ") + '" fill="' + f + '" stroke="rgba(0,0,0,.35)" stroke-width="1" stroke-linejoin="round"' + (extra || "") + "/>"; }
    function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
    // Deckungslinien: Ziegelreihen parallel zur Traufe, bei Stehfalz in Falllinie
    function hatch(a, b, c, d, fall) {
      var o = "", n = fall ? 18 : Math.max(5, Math.round(hr * 2.2)), col = "rgba(0,0,0,.28)";
      if (st.form === "flach") return "";
      for (var i = 1; i < n; i++) {
        var t = i / n, u = fall ? lerp(a, b, t) : lerp(a, d, t), v = fall ? lerp(d, c, t) : lerp(b, c, t);
        o += '<line x1="' + u[0].toFixed(1) + '" y1="' + u[1].toFixed(1) + '" x2="' + v[0].toFixed(1) + '" y2="' + v[1].toFixed(1) + '" stroke="' + col + '" stroke-width="1"/>';
      }
      return o;
    }
    var wall = "#e9e2d6", wallS = "#c9c0b2", cL = shade(m.c, .18), cR = shade(m.c, -.18), o = "";
    o += '<ellipse cx="320" cy="' + (Y0 + 6) + '" rx="290" ry="14" fill="rgba(0,0,0,.25)"/>';
    // Seitenwand rechts und Front
    o += poly([P(B, 0, 0), P(B, 0, L), P(B, H, L), P(B, H, 0)], wallS);
    var front = [P(0, 0, 0), P(B, 0, 0), P(B, H, 0), P(0, H, 0)];
    if (st.form === "sattel") {
      var a1 = P(0, H, 0), b1 = P(B / 2, H + hr, 0), a2 = P(0, H, L), b2 = P(B / 2, H + hr, L), c1 = P(B, H, 0), c2 = P(B, H, L);
      o += poly([a1, a2, b2, b1], cL) + hatch(a1, a2, b2, b1, m.falz);
      o += poly([c1, c2, b2, b1], cR) + hatch(c1, c2, b2, b1, m.falz);
      o += poly(front, wall) + poly([P(0, H, 0), P(B, H, 0), b1], wall);
    } else if (st.form === "walm") {
      var r = Math.min(B, L) / 2, z1 = r, z2 = L - r;
      var f1 = P(0, H, 0), f2 = P(B, H, 0), k1 = P(0, H, L), k2 = P(B, H, L), r1 = P(B / 2, H + hr, z1), r2 = P(B / 2, H + hr, z2);
      o += poly([f1, k1, r2, r1], cL) + hatch(f1, k1, r2, r1, m.falz);
      o += poly([f2, k2, r2, r1], cR) + hatch(f2, k2, r2, r1, m.falz);
      o += poly(front, wall);
      o += poly([f1, f2, r1], shade(m.c, 0)) + hatch(f1, f2, r1, r1, m.falz);
    } else if (st.form === "pult") {
      var t1 = P(0, H + hr, 0), t2 = P(0, H + hr, L), e1 = P(B, H, 0), e2 = P(B, H, L);
      o += poly([t1, t2, e2, e1], cL) + hatch(e1, e2, t2, t1, m.falz);
      o += poly([P(0, 0, 0), P(B, 0, 0), e1, t1], wall);
    } else {
      var g = H + .35;
      o += poly([P(0, g, 0), P(0, g, L), P(B, g, L), P(B, g, 0)], m.c);
      o += poly([P(B, H, 0), P(B, H, L), P(B, g, L), P(B, g, 0)], "#8d949b");
      o += poly(front, wall) + poly([P(0, H, 0), P(B, H, 0), P(B, g, 0), P(0, g, 0)], "#a9b0b6");
      if (m.k === "gruen") for (var j = 0; j < 26; j++) { var q = P(Math.random() * B, g, Math.random() * L); o += '<circle cx="' + q[0].toFixed(1) + '" cy="' + (q[1] - 2).toFixed(1) + '" r="' + (2 + Math.random() * 3).toFixed(1) + '" fill="' + (Math.random() > .5 ? "#7fae4f" : "#4d7630") + '"/>'; }
    }
    // Fenster und Tür an der Front
    var wy = H * .58, ww = Math.min(1.2, B * .14);
    [B * .24, B * .76 - ww].forEach(function (x) { o += poly([P(x, wy, 0), P(x + ww, wy, 0), P(x + ww, wy + 1, 0), P(x, wy + 1, 0)], "#5b6b7c"); });
    if (B > 6) o += poly([P(B / 2 - .5, 0, 0), P(B / 2 + .5, 0, 0), P(B / 2 + .5, 2.1, 0), P(B / 2 - .5, 2.1, 0)], "#7a5a3c");
    // Winkel
    if (st.form !== "flach") {
      var ax = st.form === "pult" ? B : 0, base = P(ax, H, 0), dir = st.form === "pult" ? -1 : 1, rad = 46;
      var ang = Math.atan2(-((st.form === "pult" ? hr / B : st.form === "walm" ? hr / (Math.min(B, L) / 2) : hr / (B / 2))), 1);
      var ex = base[0] + dir * rad * Math.cos(ang), ey = base[1] + rad * Math.sin(ang);
      o += '<path d="M' + base[0].toFixed(1) + " " + base[1].toFixed(1) + "h" + (dir * (rad + 8)) + '" stroke="#fff" stroke-width="2" stroke-dasharray="4 3"/>';
      o += '<path d="M' + (base[0] + dir * rad).toFixed(1) + " " + base[1].toFixed(1) + " A" + rad + " " + rad + " 0 0 " + (dir > 0 ? 0 : 1) + " " + ex.toFixed(1) + " " + ey.toFixed(1) + '" fill="none" stroke="#fff" stroke-width="2.5"/>';
      o += '<text x="' + (base[0] + dir * (rad + 10)).toFixed(1) + '" y="' + (base[1] - 10).toFixed(1) + '" fill="#fff" stroke="rgba(20,23,27,.85)" stroke-width="5" paint-order="stroke" stroke-linejoin="round" font-family="Anton,Impact,sans-serif" font-size="22"' + (dir < 0 ? ' text-anchor="end"' : "") + ">" + st.N + "°</text>";
    }
    draw.innerHTML = o;
  }
  function calc() {
    var m = curMat(), flat = st.form === "flach", p = st.N * Math.PI / 180;
    var area = flat ? (st.L + .6) * (st.B + .6) : (st.L + 1) * (st.B + 1) / Math.cos(p);
    $("#oL").textContent = String(st.L).replace(".", ",") + " m";
    $("#oB").textContent = String(st.B).replace(".", ",") + " m";
    $("#oN").textContent = st.N + "°";
    $("#rtag").textContent = NAMES[st.form] + (flat ? " · " + st.N + "° Gefälle" : " · " + st.N + "°") + " · " + m.n;
    $("#rA").textContent = fmt(area) + " m²";
    $("#rW").textContent = (area * m.kg / 1000).toFixed(1).replace(".", ",") + " t";
    $("#rP").textContent = "€ " + fmt(Math.round(area * m.pr[0] / 100) * 100) + " – " + fmt(Math.round(area * m.pr[1] / 100) * 100);
    $("#mp1").style.transform = "scaleX(" + m.life[0] + ")"; $("#mv1").textContent = m.life[1];
    $("#mp2").style.transform = "scaleX(" + m.st[0] + ")"; $("#mv2").textContent = m.st[1];
    $("#mp3").style.transform = "scaleX(" + (m.min / 60).toFixed(3) + ")"; $("#mv3").textContent = "ab " + m.min + "°";
    var hint = $("#rhint"), h = "";
    if (!flat && st.N < m.min) h = "Unter " + m.min + "° ist " + m.n + " nur mit Zusatzmaßnahmen dicht. Bei " + st.N + "° empfehlen wir Stehfalz aus Titanzink.";
    else if (!flat && st.form === "pult" && st.N > 30) h = "Ein Pultdach mit " + st.N + "° wird an der hohen Seite " + (st.B * Math.tan(p)).toFixed(1).replace(".", ",") + " m hoch. Bitte den Bebauungsplan prüfen, wir helfen dabei.";
    else if (m.k === "gruen") h = "Gründach: Wir prüfen vorher die Statik, denn nass wiegt es rund 120 kg pro m².";
    hint.hidden = !h; hint.textContent = h;
    $$("button", mats).forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.mat === st.mat ? "true" : "false"); });
    [rL, rB, rN].forEach(fill);
    drawRoof();
  }
  if (draw) {
    $$(".seg button").forEach(function (b) {
      b.addEventListener("click", function () {
        var was = st.form; st.form = b.dataset.form;
        $$(".seg button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        if (st.form === "flach") { if (was !== "flach") keepN = st.N; rN.min = 2; rN.max = 5; st.N = 3; }
        else { rN.min = 5; rN.max = 60; if (was === "flach") st.N = keepN; if (st.form === "pult" && was !== "pult" && st.N > 25) st.N = 15; }
        rN.value = st.N; buildMats(); calc();
      });
    });
    mats.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { st.mat = b.dataset.mat; calc(); } });
    rL.addEventListener("input", function () { st.L = +rL.value; calc(); });
    rB.addEventListener("input", function () { st.B = +rB.value; calc(); });
    rN.addEventListener("input", function () { st.N = +rN.value; calc(); });
    buildMats(); calc();
    $("#rgo").addEventListener("click", function () {
      var m = curMat(), msg = $("#m");
      setArt(st.form === "flach" ? "flach" : "neu");
      if (msg) msg.value = NAMES[st.form] + ", " + st.N + "° Neigung, Haus ca. " + String(st.L).replace(".", ",") + " × " + String(st.B).replace(".", ",") + " m (Dachfläche ca. " + $("#rA").textContent + "), Wunschmaterial: " + m.n + ". ";
    });
  }

  // Drohnen-Anzeige: Höhe, Fotozähler und Markierungen laufen mit dem Video
  var dv = $("#drohne video"), pins = $$(".pin"), alt = $("#alt"), shots = $("#shots");
  if (dv) {
    var upd = function () {
      var t = dv.currentTime || 0;
      if (alt) alt.textContent = (12 + t * 2.4).toFixed(1).replace(".", ",");
      if (shots) shots.textContent = Math.floor(t * 3.2);
      pins.forEach(function (p) { p.classList.toggle("on", t >= +p.dataset.t); });
    };
    dv.addEventListener("timeupdate", upd);
    if (reduce) pins.forEach(function (p) { p.classList.add("on"); });
  }

  // Formular
  function setArt(v) { var r = $('input[name="art"][value="' + v + '"]'); if (r) r.checked = true; }
  $$("[data-art]").forEach(function (a) { a.addEventListener("click", function () { setArt(a.dataset.art); if (a.dataset.art === "sturm") { var u = $("#urg"); if (u) u.checked = true; } }); });
  var f = $("#f"), fname = $("#fname");
  if (f) f.addEventListener("change", function () { var n = f.files ? f.files.length : 0; fname.textContent = n ? n + (n === 1 ? " Foto ausgewählt" : " Fotos ausgewählt") : "Fotos vom Dach anhängen"; });
  var form = $("#form"), msgEl = $("#msg");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); msgEl.classList.remove("show"); void msgEl.offsetWidth; msgEl.classList.add("show"); });
})();
