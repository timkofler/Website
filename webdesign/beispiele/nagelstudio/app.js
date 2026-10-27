// Studio Mila – Beispielseite Nagelstudio. Navigation, Galerie mit Filter und Lightbox,
// Nagel-Konfigurator, Auffüll-Erinnerung mit Kalenderdatei, Gutschein-Vorschau und Terminanfrage (Attrappe).
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var SVGNS = "http://www.w3.org/2000/svg";
  var DEMO_MSG = "Das ist ein Beispiel – auf der echten Seite käme deine Anfrage jetzt direkt im Studio an.";
  var TAGE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  var TAGE_LANG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  var MONATE = ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

  /* ---------- Navigation ---------- */
  var bar = $(".tk-demo-bar"), nav = $("#nav"), burger = $("#burger"), panel = $("#panel");
  function setBar() { document.documentElement.style.setProperty("--bar", (bar ? bar.offsetHeight : 0) + "px"); }
  setBar(); window.addEventListener("resize", setBar);
  function onScroll() { nav.classList.toggle("is-solid", window.scrollY > 30); }
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  function menu(open) {
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    panel.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", function () { menu(burger.getAttribute("aria-expanded") !== "true"); });
  $$("a", panel).forEach(function (a) { a.addEventListener("click", function () { menu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("is-open")) { menu(false); burger.focus(); } });

  /* ---------- Freie Termine (erfundene, aber stabile Belegung) ---------- */
  // Offen Di–Sa; welche Zeiten belegt sind, hängt nur vom Datum ab, damit die Seite bei jedem Besuch gleich aussieht.
  function slotsFor(d) {
    var wd = d.getDay(); if (wd === 0 || wd === 1) return [];
    var all = wd === 6 ? ["08:00", "09:30", "11:00"] : ["09:00", "10:30", "13:00", "14:30", "16:00", "17:30"];
    var seed = d.getDate() * 7 + d.getMonth() * 13;
    return all.map(function (t, i) { return { t: t, frei: ((seed + i * 5) % 7) > 2 }; });
  }
  function nextDays(n) {
    var out = [], d = new Date(); d.setHours(0, 0, 0, 0);
    while (out.length < n) { d.setDate(d.getDate() + 1); if (slotsFor(d).length) out.push(new Date(d)); }
    return out;
  }
  var days = nextDays(7);
  (function () {
    var now = new Date();
    for (var i = 0; i < days.length; i++) {
      var s = slotsFor(days[i]).filter(function (x) { return x.frei; })[0];
      if (s) {
        var diff = Math.round((days[i] - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
        $("#next-slot").textContent = (diff === 1 ? "Morgen" : TAGE_LANG[days[i].getDay()]) + ", " + s.t.replace(/^0/, "") + " Uhr";
        break;
      }
    }
  })();

  /* ---------- Galerie: Filter + Lightbox ---------- */
  var works = $$(".work"), fbtn = $$(".filters button");
  fbtn.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-f");
      fbtn.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      works.forEach(function (w) {
        var on = f === "alle" || (" " + w.getAttribute("data-tags") + " ").indexOf(" " + f + " ") > -1;
        w.classList.toggle("is-off", !on);
        if (on) w.classList.add("is-in");
      });
      stagger();
    });
  });
  // Versetzte Spalten wie in einem Magazin: mittlere Spalte (PC) bzw. zweite Spalte (Handy) rutscht nach unten.
  function stagger() {
    visible().forEach(function (w, i) { w.classList.toggle("is-mid", i % 3 === 1); w.classList.toggle("is-odd", i % 2 === 1); });
  }
  var lb = $("#lb"), lbImg = $("#lb-img"), lbCap = $("#lb-cap"), cur = 0, lastFocus = null;
  function visible() { return works.filter(function (w) { return !w.classList.contains("is-off"); }); }
  stagger();
  function show(i) {
    var v = visible(); cur = (i + v.length) % v.length;
    var img = $("img", v[cur]);
    lbImg.src = img.src; lbImg.alt = img.alt; lbCap.textContent = $("figcaption", v[cur]).textContent;
  }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
  works.forEach(function (w) {
    $("button", w).addEventListener("click", function (e) {
      lastFocus = e.currentTarget; show(visible().indexOf(w)); lb.hidden = false; document.body.style.overflow = "hidden"; $("#lb-x").focus();
    });
  });
  $("#lb-x").addEventListener("click", closeLb);
  $("#lb-p").addEventListener("click", function () { show(cur - 1); });
  $("#lb-n").addEventListener("click", function () { show(cur + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb(); else if (e.key === "ArrowLeft") show(cur - 1); else if (e.key === "ArrowRight") show(cur + 1);
  });

  /* ---------- Nagel-Konfigurator ---------- */
  var FORMEN = [["rund", "Rund"], ["oval", "Oval"], ["mandel", "Mandel"], ["eckig", "Eckig"], ["ballerina", "Ballerina"]];
  var FARBEN = [["Nude", "#e3bfb2"], ["Rosé", "#e0a3aa"], ["Milchweiß", "#f3ede8"], ["Kirschrot", "#a8162c"], ["Bordeaux", "#5e1a28"],
    ["Salbei", "#8ea28a"], ["Lavendel", "#b3a3d4"], ["Mitternacht", "#1e2340"], ["Espresso", "#4d3027"], ["Schwarz", "#121012"]];

  // Nagelumriss mit Nagelhaut bei y=0; r = halbe Breite, B = Länge des Nagelbetts, T = freier Rand.
  function nailPath(shape, r, B, T) {
    var k = r * 0.28, p = "M" + (-r) + "," + (-k) + " Q0," + (k * 1.2) + " " + r + "," + (-k) + " L" + r + "," + (-B) + " ";
    var top = -B - T;
    if (shape === "rund") p += "C" + r + "," + (top + T * 0.05) + " " + (-r) + "," + (top + T * 0.05) + " " + (-r) + "," + (-B);
    else if (shape === "oval") p += "C" + (r * 1.02) + "," + (top - T * 0.25) + " " + (-r * 1.02) + "," + (top - T * 0.25) + " " + (-r) + "," + (-B);
    else if (shape === "mandel") p += "C" + r + "," + (-B - T * 0.55) + " " + (r * 0.28) + "," + top + " 0," + top + " C" + (-r * 0.28) + "," + top + " " + (-r) + "," + (-B - T * 0.55) + " " + (-r) + "," + (-B);
    else if (shape === "eckig") { var c = r * 0.22; p += "L" + r + "," + (top + c) + " Q" + r + "," + top + " " + (r - c) + "," + top + " L" + (-r + c) + "," + top + " Q" + (-r) + "," + top + " " + (-r) + "," + (top + c); }
    else { var w = r * 0.58, c2 = r * 0.16; p += "L" + w + "," + (top + c2) + " Q" + w + "," + top + " " + (w - c2) + "," + top + " L" + (-w + c2) + "," + top + " Q" + (-w) + "," + top + " " + (-w) + "," + (top + c2); }
    return p + " Z";
  }
  var TIP = { rund: 0.55, oval: 1.0, mandel: 1.5, eckig: 0.95, ballerina: 1.45 };
  // Länge des freien Rands im Verhältnis zur Fingerbreite: kurz endet knapp über der Fingerkuppe.
  var FREI = { rund: 0.8, oval: 1, mandel: 1.2, eckig: 0.95, ballerina: 1.2 }, LANG = { kurz: 0.55, mittel: 1.05, lang: 1.7 };

  function el(name, attrs, parent) {
    var e = document.createElementNS(SVGNS, name);
    for (var a in attrs) e.setAttribute(a, attrs[a]);
    if (parent) parent.appendChild(e);
    return e;
  }
  // Eine schlanke Hand von oben als eine durchgehende Form: Die Finger wachsen mit weichen Schwimmhäuten aus dem
  // Handrücken, auch der Daumen. Jeder Nagel sitzt an der Fingerkuppe (R = halbe Breite der Kuppe).
  var SKIN = "#eac4b2", SKIN_HI = "#f7ddd0", SKIN_LO = "#c99682";
  var FINGER = [
    { x: 151, y: 272, rot: -6, L: 160, wb: 18.5, wt: 13.5 },  // Zeigefinger
    { x: 190, y: 263, rot: -1, L: 182, wb: 19.5, wt: 14 },    // Mittelfinger
    { x: 228, y: 268, rot: 4.5, L: 168, wb: 18.5, wt: 13.5 }, // Ringfinger
    { x: 262, y: 286, rot: 11, L: 128, wb: 15.5, wt: 11.5 },  // kleiner Finger
    { x: 132, y: 340, rot: -36, L: 116, wb: 20, wt: 14.5 }    // Daumen
  ];
  var hand = $("#hand"), nails = [];
  function P(f, lx, ly) {
    var a = f.rot * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return [(f.x + lx * c - ly * s).toFixed(1), (f.y + lx * s + ly * c).toFixed(1)].join(",");
  }
  // einzelner Finger in eigenen Koordinaten (Wurzel bei 0,0, zeigt nach oben)
  function fingerPath(f) {
    var L = f.L, b = f.wb, t = f.wt;
    return "M" + (-b) + ",20 L" + (-b) + ",0 C" + (-b * 0.98) + "," + (-L * 0.42) + " " + (-t * 1.04) + "," + (-L * 0.7) + " " + (-t) + "," + (-(L - t)) +
      " A" + t + "," + t + " 0 0 1 " + t + "," + (-(L - t)) + " C" + (t * 1.04) + "," + (-L * 0.7) + " " + (b * 0.98) + "," + (-L * 0.42) + " " + b + ",0 L" + b + ",20 Z";
  }
  // Umriss der ganzen Hand: Daumen, vier Finger mit Schwimmhäuten dazwischen, rechte Seite.
  function handPath() {
    var F = FINGER, W = 0.2, T = F[4], tb = T.wb, tt = T.wt, TL = T.L;
    // linke Seite mit Daumen: Außenkante hinauf, Kuppe, Innenkante hinunter, Schwimmhaut zum Zeigefinger
    var d = "M160,412 C152,394 134,378 " + P(T, -tb, 4) +
      " C" + P(T, -tb * 0.98, -TL * 0.42) + " " + P(T, -tt * 1.04, -TL * 0.7) + " " + P(T, -tt, -(TL - tt)) +
      " A" + tt + "," + tt + " 0 0 1 " + P(T, tt, -(TL - tt)) +
      " C" + P(T, tt * 1.04, -TL * 0.7) + " " + P(T, tb * 0.98, -TL * 0.5) + " " + P(T, tb * 1.02, -TL * 0.36) +
      " Q142,296 " + P(F[0], -F[0].wb, -F[0].L * 0.06);
    for (var i = 0; i < 4; i++) {
      var f = F[i], L = f.L, b = f.wb, t = f.wt, y0 = i === 0 ? -L * 0.06 : -L * W;
      d += " C" + P(f, -b * 0.99, y0 - L * 0.25) + " " + P(f, -t * 1.05, -L * 0.74) + " " + P(f, -t, -(L - t)) +
        " A" + t + "," + t + " 0 0 1 " + P(f, t, -(L - t));
      var yEnd = i === 3 ? -L * 0.04 : -L * W;
      d += " C" + P(f, t * 1.05, -L * 0.74) + " " + P(f, b * 0.99, yEnd - L * 0.25) + " " + P(f, b * 0.99, yEnd);
      if (i < 3) { // Schwimmhaut: weicher Bogen zum nächsten Finger
        var n = F[i + 1];
        d += " Q" + P(f, b * 1.25, -L * W + 9) + " " + P(n, -n.wb * 0.99, -n.L * W);
      }
    }
    return d + " C283,304 284,352 268,412 Z";
  }
  (function build() {
    var defs = el("defs", {}, hand);
    var fade = el("linearGradient", { id: "fade", x1: "0", y1: "0", x2: "0", y2: "1" }, defs);
    el("stop", { offset: ".72", "stop-color": "#fff" }, fade); el("stop", { offset: ".99", "stop-color": "#fff", "stop-opacity": "0" }, fade);
    var mask = el("mask", { id: "m-fade" }, defs); el("rect", { x: 0, y: 0, width: 400, height: 400, fill: "url(#fade)" }, mask);
    var chrome = el("linearGradient", { id: "chrome", x1: "0", y1: "0", x2: "1", y2: "1" }, defs);
    el("stop", { offset: "0", "stop-color": "#fff", "stop-opacity": ".85" }, chrome); el("stop", { offset: ".35", "stop-color": "#fff", "stop-opacity": "0" }, chrome);
    el("stop", { offset: ".6", "stop-color": "#fff", "stop-opacity": ".5" }, chrome); el("stop", { offset: "1", "stop-color": "#000", "stop-opacity": ".25" }, chrome);
    var cv = el("linearGradient", { id: "curve", x1: "0", x2: "1" }, defs);
    [["0", ".2"], [".28", "0"], [".72", "0"], ["1", ".2"]].forEach(function (st) { el("stop", { offset: st[0], "stop-color": "#000", "stop-opacity": st[1] }, cv); });
    // Rundung der Finger: Ränder dunkler, Mitte heller; läuft zur Fingerwurzel hin aus
    var rd = el("linearGradient", { id: "round", x1: "0", x2: "1" }, defs);
    [["0", SKIN_LO, ".6"], [".22", SKIN_LO, "0"], [".5", SKIN_HI, ".6"], [".78", SKIN_LO, "0"], ["1", SKIN_LO, ".6"]].forEach(function (st) { el("stop", { offset: st[0], "stop-color": st[1], "stop-opacity": st[2] }, rd); });
    var bl = el("filter", { id: "soft", x: "-30%", y: "-30%", width: "160%", height: "160%" }, defs); el("feGaussianBlur", { stdDeviation: "1.4" }, bl);
    var bl3 = el("filter", { id: "soft3", x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs); el("feGaussianBlur", { stdDeviation: "3" }, bl3);
    var bl2 = el("filter", { id: "soft6", x: "-30%", y: "-30%", width: "160%", height: "160%" }, defs); el("feGaussianBlur", { stdDeviation: "6" }, bl2);
    var g = el("g", { mask: "url(#m-fade)" }, hand);
    var hp = handPath();
    var shadow = el("g", { filter: "url(#soft6)", opacity: ".55", transform: "translate(6,10)" }, g);
    el("path", { d: hp, fill: "#000" }, shadow);
    // Hand samt Daumen als eine Form, Rundung der Finger darüber
    el("path", { d: hp, fill: SKIN, stroke: SKIN_LO, "stroke-width": "1", "stroke-opacity": ".45" }, g);
    FINGER.forEach(function (f) {
      var fg = el("g", { transform: "translate(" + f.x + "," + f.y + ") rotate(" + f.rot + ")" }, g);
      // eigene Maske je Finger: Rundung läuft über die untere Fingerhälfte weich in den Handrücken aus
      var k = "mf" + FINGER.indexOf(f), gr = el("linearGradient", { id: k + "g", gradientUnits: "userSpaceOnUse", x1: 0, y1: -f.L * 0.55, x2: 0, y2: -f.L * 0.08 }, defs);
      el("stop", { offset: "0", "stop-color": "#fff" }, gr); el("stop", { offset: ".5", "stop-color": "#888" }, gr); el("stop", { offset: "1", "stop-color": "#000" }, gr);
      var mk = el("mask", { id: k, maskUnits: "userSpaceOnUse", x: -60, y: -f.L - 20, width: 120, height: f.L + 60 }, defs);
      el("rect", { x: -60, y: -f.L - 20, width: 120, height: f.L + 60, fill: "url(#" + k + "g)" }, mk);
      el("path", { d: fingerPath(f), fill: "url(#round)", mask: "url(#" + k + ")" }, fg);
      // Gelenkfalte am Mittelglied
      var y = -f.L * 0.62, w = f.wb * 0.38;
      el("path", { d: "M" + (-w) + "," + y + " q" + w + "," + (f.wb * 0.12) + " " + (w * 2) + ",0", stroke: SKIN_LO, "stroke-width": ".9", fill: "none", "stroke-linecap": "round", opacity: ".45" }, fg);
      // eigene Gruppe für die Pop-Animation, damit sie die Verschiebung zur Kuppe nicht überschreibt
      // Knöchel: zarter Lichtpunkt am Fingeransatz mit weichem Schatten darunter (nicht beim Daumen)
      if (f !== FINGER[4]) {
        el("ellipse", { cx: 0, cy: f.wb * 0.15, rx: f.wb * 0.55, ry: f.wb * 0.34, fill: SKIN_HI, opacity: ".38", filter: "url(#soft3)" }, fg);
        el("path", { d: "M" + (-f.wb * 0.55) + "," + (f.wb * 0.75) + " q" + (f.wb * 0.55) + "," + (f.wb * 0.32) + " " + (f.wb * 1.1) + ",0", stroke: SKIN_LO, "stroke-width": "1.4", fill: "none", "stroke-linecap": "round", opacity: ".2", filter: "url(#soft)" }, fg);
      }
      f.g = el("g", { class: "nail" }, el("g", { transform: "translate(0," + (-f.L) + ")" }, fg));
    });
    // zarte Schatten in den Schwimmhäuten
    for (var i = 0; i < 3; i++) {
      var f = FINGER[i], n = FINGER[i + 1];
      el("path", { d: "M" + P(f, f.wb * 0.6, -f.L * 0.34) + " Q" + P(f, f.wb * 1.15, -f.L * 0.2 + 6) + " " + P(n, -n.wb * 0.6, -n.L * 0.34), stroke: SKIN_LO, "stroke-width": "1.6", fill: "none", opacity: ".35", filter: "url(#soft)" }, g);
    }
    FINGER.forEach(function (f, i) { nails.push({ g: f.g, R: f.wt, d: fingerPath(f), tf: "translate(0," + f.L + ")", m: "mf" + i }); });
  })();

  var cfg = $("#cfg"), formBox = $("#o-form"), farbBox = $("#o-farbe");
  FORMEN.forEach(function (f, i) {
    formBox.insertAdjacentHTML("beforeend", '<label><input type="radio" name="form" value="' + f[0] + '"' + (f[0] === "mandel" ? " checked" : "") + '><span><svg viewBox="-12 -34 24 36" aria-hidden="true"><path fill="currentColor" d="' + nailPath(f[0], 8, 14, 14 * TIP[f[0]]) + '"/></svg>' + f[1] + "</span></label>");
  });
  FARBEN.forEach(function (c, i) {
    farbBox.insertAdjacentHTML("beforeend", '<label><input type="radio" name="farbe" value="' + i + '"' + (i === 1 ? " checked" : "") + ' aria-label="' + c[0] + '"><span style="--c:' + c[1] + '" title="' + c[0] + '"></span></label>');
  });
  function val(n) { var x = cfg.querySelector('input[name="' + n + '"]:checked'); return x ? x.value : ""; }
  var look = null;
  function draw() {
    var shape = val("form"), len = val("len"), fin = val("fin"), fc = FARBEN[+val("farbe")];
    nails.forEach(function (n) {
      // Nagelhaut bei y = C, Nagelbett endet bei y = E (knapp unter der Kuppe), danach der freie Rand.
      var R = n.R, r = R * 0.7, C = R * 2.55, E = R * 0.5, B = C - E, T = R * FREI[shape] * LANG[len];
      var d = nailPath(shape, r, B, T), tf = "translate(0," + C + ")";
      while (n.g.firstChild) n.g.removeChild(n.g.firstChild);
      var id = "c" + Math.random().toString(36).slice(2, 8), ids = id + "s";
      var cp = el("clipPath", { id: id }, n.g); el("path", { d: d, transform: tf }, cp);
      // Schatten des freien Rands auf der Kuppe
      el("path", { d: d, transform: "translate(1.5," + (C + 3) + ")", fill: "rgba(80,40,40,.28)", filter: "url(#soft)" }, n.g);
      var base = fin === "french" ? "#f1d3cc" : fc[1];
      var ng = el("g", { transform: tf }, n.g);
      el("path", { d: d, fill: base }, ng);
      var inner = el("g", { "clip-path": "url(#" + id + ")" }, n.g);
      var y0 = C - B - T;
      if (fin === "french") el("path", { d: "M" + (-r * 1.4) + "," + (E + 2) + " Q0," + (E - R * 0.55) + " " + (r * 1.4) + "," + (E + 2) + " L" + (r * 1.4) + "," + (y0 - 4) + " L" + (-r * 1.4) + "," + (y0 - 4) + " Z", fill: fc[0] === "Rosé" || fc[0] === "Nude" ? "#f8f4f0" : fc[1] }, inner);
      if (fin === "chrom") el("rect", { x: -r, y: y0 - 4, width: r * 2, height: B + T + 8, fill: "url(#chrome)" }, inner);
      // seitliche Wölbung: Ränder dunkler, Mitte heller
      el("rect", { x: -r, y: y0 - 4, width: r * 2, height: B + T + 8, fill: "url(#curve)", opacity: fin === "matt" ? ".6" : "1" }, inner);
      if (fin !== "matt") el("path", { d: "M" + (-r * 0.38) + "," + (C - B * 0.18) + " C" + (-r * 0.46) + "," + (C - B * 0.7) + " " + (-r * 0.34) + "," + (E - T * 0.25) + " " + (-r * 0.1) + "," + (E - T * 0.5), stroke: "#fff", "stroke-width": r * 0.2, "stroke-linecap": "round", fill: "none", opacity: fin === "chrom" ? ".75" : ".5" }, inner);
      if (fin === "matt") el("rect", { x: -r, y: y0 - 4, width: r * 2, height: B + T + 8, fill: "#fff", opacity: ".1" }, inner);
      // Haut über dem Nagel: Nagelhaut (U-Bogen) und seitliche Falten bis zur Kuppe
      var cs = el("clipPath", { id: ids }, n.g);
      var k = r * 0.28;
      el("path", { d: "M" + (-R * 1.2) + "," + (C - k * 0.9) + " Q0," + (C + k * 1.3) + " " + (R * 1.2) + "," + (C - k * 0.9) + " L" + (R * 1.2) + "," + (C + R * 1.2) + " L" + (-R * 1.2) + "," + (C + R * 1.2) + " Z" }, cs);
      [-1, 1].forEach(function (sx) {
        el("path", { d: "M" + (sx * R * 1.2) + "," + (E - R * 0.6) + " L" + (sx * r * 1.03) + "," + (E - R * 0.6) + " L" + (sx * r * 0.99) + "," + (E + R * 0.3) + " Q" + (sx * r * 0.9) + "," + (E + B * 0.55) + " " + (sx * r * 0.9) + "," + C + " L" + (sx * R * 1.2) + "," + C + " Z" }, cs);
      });
      var skin = el("g", { "clip-path": "url(#" + ids + ")" }, n.g);
      var sk = el("g", { transform: n.tf }, skin);
      el("path", { d: n.d, fill: SKIN }, sk);
      el("path", { d: n.d, fill: "url(#round)", mask: "url(#" + n.m + ")" }, sk);
      el("path", { d: "M" + (-r * 1.02) + "," + (C - k * 0.75) + " Q0," + (C + k * 1.45) + " " + (r * 1.02) + "," + (C - k * 0.75), stroke: "#b47f6d", "stroke-width": "1.3", fill: "none", opacity: ".6", "stroke-linecap": "round" }, n.g);
      [-1, 1].forEach(function (sx) { el("path", { d: "M" + (sx * r * 0.985) + "," + (E + R * 0.5) + " Q" + (sx * r * 0.9) + "," + (E + B * 0.55) + " " + (sx * r * 0.9) + "," + (C - k), stroke: "#b47f6d", "stroke-width": "1", fill: "none", opacity: ".4" }, n.g); });
      el("path", { d: d, transform: tf, fill: "none", stroke: "rgba(0,0,0,.16)", "stroke-width": ".8" }, n.g);
      n.g.classList.remove("pop"); void n.g.getBoundingClientRect(); n.g.classList.add("pop");
    });
    var fN = FORMEN.filter(function (f) { return f[0] === shape; })[0][1];
    var finN = { glanz: "Glanz", matt: "Matt", chrom: "Chrom", french: "French" }[fin];
    $("#look-tag").textContent = fN + " · " + (fin === "french" ? "French " + fc[0] : fc[0] + " · " + finN);
    // Preis: lange Formen brauchen eine Modellage, kurze runde Nägel gehen als Verstärkung.
    var svc = (len === "kurz" && (shape === "rund" || shape === "oval" || shape === "eckig")) ? ["Naturnagelverstärkung", 49, 75] : ["Gel-Modellage Neu", 59, 90];
    var extra = (fin === "chrom" ? 8 : 0) + (fin === "french" ? 6 : 0) + (len === "lang" ? 5 : 0);
    $("#cfg-price").textContent = "ca. " + (svc[1] + extra) + " €";
    $("#cfg-time").textContent = svc[0] + " · ca. " + (svc[2] + (fin === "french" ? 15 : 0)) + " Min.";
    look = { txt: $("#look-tag").textContent + " · " + { kurz: "kurz", mittel: "mittellang", lang: "lang" }[len], color: fc[1], svc: svc[0] };
  }
  cfg.addEventListener("change", draw);
  draw();

  /* ---------- Terminanfrage ---------- */
  var dayBox = $("#b-days"), timeBox = $("#b-times"), lookChip = $("#look-chip");
  days.forEach(function (d, i) {
    dayBox.insertAdjacentHTML("beforeend", '<label><input type="radio" name="tag" value="' + i + '"' + (i === 0 ? " checked" : "") + '><span><small>' + TAGE[d.getDay()] + "</small>" + d.getDate() + "." + (d.getMonth() + 1) + ".</span></label>");
  });
  function renderTimes() {
    var d = days[+($('input[name="tag"]:checked', dayBox) || { value: 0 }).value], first = true;
    timeBox.innerHTML = "";
    slotsFor(d).forEach(function (s) {
      timeBox.insertAdjacentHTML("beforeend", '<label><input type="radio" name="zeit" value="' + s.t + '"' + (s.frei ? (first ? " checked" : "") : " disabled") + "><span>" + s.t + "</span></label>");
      if (s.frei) first = false;
    });
  }
  var svcBox = $("#b-svc");
  function setSvc(v) { var i = $('input[value="' + v + '"]', svcBox); if (i) { i.checked = true; bookSum(); } }
  // Zusammenfassung über dem Absende-Knopf: Behandlung · Tag · Uhrzeit
  function bookSum() {
    var sv = $('input[name="svc"]:checked', svcBox), d = days[+$('input[name="tag"]:checked', dayBox).value], t = $('input[name="zeit"]:checked', timeBox);
    $("#b-sum").textContent = $("b", sv.nextElementSibling).textContent + " · " + TAGE[d.getDay()] + " " + d.getDate() + "." + (d.getMonth() + 1) + "." + (t ? " · " + t.value : "");
  }
  dayBox.addEventListener("change", function () { renderTimes(); bookSum(); });
  timeBox.addEventListener("change", bookSum); svcBox.addEventListener("change", bookSum);
  renderTimes(); bookSum();
  function pickDay(date) {
    var best = 0, bd = Infinity;
    days.forEach(function (d, i) { var x = Math.abs(d - date); if (x < bd) { bd = x; best = i; } });
    var inp = $('input[value="' + best + '"]', dayBox); inp.checked = true; renderTimes(); bookSum();
  }
  $("#cfg-take").addEventListener("click", function () {
    $("#look-txt").textContent = "Dein Look: " + look.txt;
    $("i", lookChip).style.setProperty("--c", look.color);
    lookChip.classList.add("on");
    setSvc(look.svc);
  });
  $("#look-x").addEventListener("click", function () { lookChip.classList.remove("on"); });
  $("#book").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("#b-name"), tel = $("#b-tel"), msg = $("#b-msg");
    if (!name.value.trim() || !tel.value.trim()) { msg.classList.remove("ok"); msg.textContent = "Bitte Name und Telefonnummer angeben."; (name.value.trim() ? tel : name).focus(); return; }
    msg.classList.add("ok");
    var d = days[+$('input[name="tag"]:checked', dayBox).value], t = $('input[name="zeit"]:checked', timeBox);
    msg.textContent = "Danke, " + name.value.trim().split(" ")[0] + "! Anfrage für " + TAGE_LANG[d.getDay()] + ", " + d.getDate() + ". " + MONATE[d.getMonth()] + (t ? " um " + t.value + " Uhr" : "") + ". " + DEMO_MSG;
  });

  /* ---------- Auffüll-Erinnerung ---------- */
  var rDate = $("#r-date"), rType = $("#r-type"), due = null;
  function rSel() { return $('input[name="rtype"]:checked', rType); }
  function iso(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  (function () { var d = new Date(); d.setDate(d.getDate() - 16); rDate.value = iso(d); rDate.max = iso(new Date()); })();
  function refill() {
    if (!rDate.value) return;
    var p = rDate.value.split("-"), last = new Date(+p[0], +p[1] - 1, +p[2]);
    var span = rSel().value.split("-"), a = new Date(last), b = new Date(last);
    a.setDate(a.getDate() + +span[0]); b.setDate(b.getDate() + +span[1]); due = a;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var since = Math.max(0, Math.round((today - last) / 864e5)), mm = since / 10;
    var fmt = function (d, y) { return d.getDate() + ". " + MONATE[d.getMonth()] + (y ? " " + d.getFullYear() : ""); };
    var out = $("#r-out");
    if (today > b) out.textContent = "Höchste Zeit! Am besten diese Woche.";
    else if (today >= a) out.textContent = "Jetzt ist der richtige Moment, bis " + fmt(b) + ".";
    else out.textContent = "Am besten zwischen " + fmt(a) + " und " + fmt(b) + ".";
    $("#r-sub").textContent = since === 0 ? "Frisch gemacht, da wächst noch nichts raus." :
      "Seit dem letzten Termin ist dein Nagel etwa " + mm.toFixed(1).replace(".", ",") + " mm nachgewachsen" + (mm >= 2.5 ? ", die Lücke an der Nagelhaut wird sichtbar." : ".");
    var share = Math.min(1, since / +span[1]);
    $("#r-meter").style.width = (share * 100) + "%";
    // Grafik: Lack rutscht mit dem Wachstum nach oben, die Lücke an der Nagelhaut wird mit Maß angezeigt
    var gap = Math.min(30, mm * 7), yb = 160 - gap;
    $("#g-pol").setAttribute("d", "M71 " + yb + "V84c0-26 58-26 58 0v" + (yb - 84) + "c-10 9-48 9-58 0Z");
    $("#g-br").setAttribute("d", "M156 " + (yb + 6) + "V180");
    $("#g-t1").setAttribute("d", "M152 " + (yb + 6) + "h8");
    $("#g-mm").setAttribute("opacity", gap > 5 ? "1" : "0");
    $("#g-mmt").textContent = mm.toFixed(1).replace(".", ",") + " mm";
    $("#g-mmt").setAttribute("y", (yb + 6 + 180) / 2 + 4);
  }
  rDate.addEventListener("change", refill); rType.addEventListener("change", refill);
  refill();
  $("#r-ics").addEventListener("click", function () {
    if (!due) return;
    var n = rSel().getAttribute("data-n");
    var d = new Date(due); d.setDate(d.getDate() - 3);
    var st = iso(d).replace(/-/g, ""), en = new Date(d); en.setDate(en.getDate() + 1);
    var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Studio Mila//Beispiel//DE", "BEGIN:VEVENT",
      "UID:" + st + "-mila@beispiel", "DTSTAMP:" + iso(new Date()).replace(/-/g, "") + "T000000Z",
      "DTSTART;VALUE=DATE:" + st, "DTEND;VALUE=DATE:" + iso(en).replace(/-/g, ""),
      "SUMMARY:Nägel: " + n + " bei Studio Mila buchen", "DESCRIPTION:Erinnerung von der Beispielseite Studio Mila (tim-kofler.at).",
      "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "naegel-erinnerung.ics"; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });
  $("#r-book").addEventListener("click", function () {
    if (due) pickDay(due);
    setSvc(rSel().getAttribute("data-n"));
  });

  /* ---------- Gutschein ---------- */
  var gift = $("#gift");
  function giftUpd() {
    var v = $('input[name="val"]:checked', gift).value, isSvc = !/€/.test(v);
    $("#v-val").textContent = v;
    $("#v-what").textContent = isSvc ? "gültig für" : "für eine Auszeit";
    $("#v-to").textContent = $("#v-to-in").value.trim() || "dich";
    $("#v-from").textContent = $("#v-from-in").value.trim() || "mir";
  }
  gift.addEventListener("input", giftUpd); gift.addEventListener("change", giftUpd);
  // Bestellen: Karte wandert in ein Kuvert, Siegel drauf, Kuvert fliegt weg, dann Bestätigung
  var vstage = $("#vstage"), vdone = $("#vdone"), vsend = $("#v-send"), vt = [];
  function sparkle() {
    for (var i = 0; i < 10; i++) {
      var sp = document.createElement("i"), a = Math.PI * 2 * i / 10;
      sp.className = "sparkle"; sp.style.left = "50%"; sp.style.top = "70%";
      sp.style.setProperty("--x", Math.round(Math.cos(a) * 90) + "px"); sp.style.setProperty("--y", Math.round(Math.sin(a) * 70) + "px");
      vstage.appendChild(sp); setTimeout(function (x) { x.remove(); }.bind(null, sp), 1000);
    }
  }
  gift.addEventListener("submit", function (e) {
    e.preventDefault();
    if (vstage.classList.contains("is-send")) return;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var to = $("#v-to-in").value.trim();
    $("#vdone-t").textContent = "Gutschein über " + $("#v-val").textContent + (to ? " für " + to : "") + " ist unterwegs!";
    $("#v-msg").textContent = DEMO_MSG;
    vsend.disabled = true; vstage.classList.add("is-send");
    vt.push(setTimeout(sparkle, reduce ? 0 : 1600));
    vt.push(setTimeout(function () { vdone.hidden = false; }, reduce ? 50 : 2950));
  });
  $("#v-again").addEventListener("click", function () {
    vt.forEach(clearTimeout); vt = [];
    vdone.hidden = true; vstage.classList.remove("is-send"); vsend.disabled = false; vsend.focus();
  });
})();
