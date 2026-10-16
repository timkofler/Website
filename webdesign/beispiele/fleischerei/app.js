// Fleischerei Haselberger – Beispielseite. Navigation, Öffnungsstatus und Wochentafel nach
// Wiener Zeit, Sortiment-Tabs, Leberkässemmel- und Platten-Konfigurator, Vorbestellung (Attrappe)
// und das scroll-gebundene Aufschneiden des Bauchspecks (SVG).
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var NS = "http://www.w3.org/2000/svg";
  var DEMO_MSG = "Das ist ein Beispiel – auf der echten Seite käme Ihre Anfrage jetzt direkt beim Betrieb an.";
  function euro(n, dec) { return n.toFixed(dec === 0 ? 0 : 2).replace(".", ",") + " €"; }
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

  /* ---------- Wiener Zeit ---------- */
  var V = (function () {
    var d = new Date(), o = { wd: d.getDay(), h: d.getHours(), mi: d.getMinutes(), y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
    try {
      var parts = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Vienna", weekday: "short", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(d);
      var map = {}; parts.forEach(function (p) { map[p.type] = p.value; });
      o = { wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(map.weekday), h: +map.hour % 24, mi: +map.minute, y: +map.year, m: +map.month, d: +map.day };
    } catch (e) {}
    o.date = new Date(o.y, o.m - 1, o.d, 12);
    return o;
  })();
  var WD = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  var MON = ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function iso(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }

  /* ---------- Navigation ---------- */
  var bar = $(".tk-demo-bar"), nav = $("#nav"), burger = $("#burger"), panel = $("#panel");
  function setBar() { document.documentElement.style.setProperty("--bar", (bar ? bar.offsetHeight : 0) + "px"); }
  setBar(); window.addEventListener("resize", setBar);
  function onNav() { nav.classList.toggle("is-solid", window.scrollY > 40); }
  onNav(); window.addEventListener("scroll", onNav, { passive: true });
  function menu(open) {
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    panel.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (open) { var f = panel.querySelector("a"); if (f) f.focus(); }
  }
  burger.addEventListener("click", function () { menu(burger.getAttribute("aria-expanded") !== "true"); });
  $$("a", panel).forEach(function (a) { a.addEventListener("click", function () { menu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("is-open")) { menu(false); burger.focus(); } });

  /* ---------- Öffnungsstatus ---------- */
  var HOURS = { 0: null, 1: [7, 12.5], 2: [7, 18], 3: [7, 18], 4: [7, 18], 5: [7, 18], 6: [7, 12] };
  function hm(x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ":" + ("0" + m).slice(-2); }
  (function () {
    var r = HOURS[V.wd], t = V.h + V.mi / 60, st = $("#status"), txt;
    var row = $('#hours tr[data-d="' + V.wd + '"]'); if (row) row.classList.add("today");
    if (r && t >= r[0] && t < r[1]) { st.classList.add("on"); txt = "<b>Heute geöffnet</b> · jetzt bis " + hm(r[1]) + " Uhr"; }
    else if (r && t < r[0]) { txt = "<b>Heute geöffnet</b> · ab " + hm(r[0]) + " Uhr"; }
    else {
      var n = (V.wd + 1) % 7; while (!HOURS[n]) n = (n + 1) % 7;
      txt = "<b>Jetzt geschlossen</b> · " + (n === (V.wd + 1) % 7 ? "morgen" : WD[n]) + " ab " + hm(HOURS[n][0]) + " Uhr";
    }
    $("#status-t").innerHTML = txt;
  })();

  /* ---------- Wochentafel ---------- */
  var OFFERS = {
    1: { t: "Faschier-Montag", i: [["Faschiertes gemischt, 1 kg", "9,90", "11,90"], ["Leberknödel, 4 Stk.", "4,40"]] },
    2: { t: "Braten-Dienstag", i: [["Schweinsschopf im Ganzen, 1 kg", "10,90", "12,90"], ["Grammelschmalz, 250 g", "2,90"]] },
    3: { t: "Hendl-Mittwoch", i: [["Hendlkeulen, 1 kg", "7,90"], ["Krautfleckerl, Portion", "6,90"]] },
    4: { t: "Steak-Donnerstag", i: [["Beiried, 100 g", "3,49", "3,89"], ["Kräuterbutter, hausgemacht", "1,90"]] },
    5: { t: "Leberkäs-Freitag", i: [["Leberkäse im Ganzen, 1 kg", "13,90"], ["Bratwürstel, 10 Stk.", "8,90"]] },
    6: { t: "Suppen-Samstag", i: [["Tafelspitz, 1 kg", "26,90", "29,90"], ["Bauchspeck, 100 g", "1,99", "2,49"]] }
  };
  (function () {
    var wrap = $("#days"), sunday = V.wd === 0;
    var monday = addDays(V.date, sunday ? 1 : -((V.wd + 6) % 7));
    var hl = sunday ? 1 : V.wd;
    for (var w = 1; w <= 6; w++) {
      var d = addDays(monday, w - 1), o = OFFERS[w];
      var div = document.createElement("div"); div.className = "day" + (w === hl ? " is-today" : "");
      var lis = o.i.map(function (x) { return "<li><span>" + x[0] + "</span><i></i>" + (x[2] ? "<s>" + x[2] + "</s>" : "") + "<b>" + x[1] + "</b></li>"; }).join("");
      div.innerHTML = '<h3>' + WD[w] + ' <small>' + d.getDate() + '.' + (d.getMonth() + 1) + '.</small></h3><p style="font:500 20px/1.2 var(--ch);color:#a9c7b8;margin-top:2px">' + o.t + '</p><ul>' + lis + '</ul>' +
        (w === hl ? '<svg class="ring" aria-hidden="true"></svg>' : '') +
        '<span class="tag" aria-hidden="true">' + (sunday ? "morgen!" : "heute!") + '</span>';
      if (w === hl) div.setAttribute("aria-label", WD[w] + (sunday ? " (morgen)" : " (heute)"));
      wrap.appendChild(div);
    }
    // Kreidekreis um den heutigen Tag: in echten Pixeln berechnet, damit er sich ganz schließt.
    var ringDay = wrap.querySelector(".day.is-today"), ringSvg = ringDay && ringDay.querySelector(".ring");
    function chalkRing() {
      if (!ringSvg) return;
      var P = 18, w = ringDay.offsetWidth + 2 * P, h = ringDay.offsetHeight + 2 * P;
      var cx = w / 2, cy = h / 2, rx = w / 2 - 4, ry = h / 2 - 4, pts = [], n = 22, seed = 7;
      function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 - 0.5; }
      // etwas mehr als eine Runde, mit leichter Unruhe wie von Hand
      for (var k = 0; k <= n + 3; k++) {
        var a = -2.25 + (k / n) * Math.PI * 2, j = 1 + rnd() * 0.035;
        var sq = 0.55; // eher rechteckig-rund, damit der Text frei bleibt
        var ca = Math.cos(a), sa = Math.sin(a);
        var x = cx + rx * j * Math.sign(ca) * Math.pow(Math.abs(ca), 1 - sq);
        var y = cy + ry * j * Math.sign(sa) * Math.pow(Math.abs(sa), 1 - sq) + (k > n ? -6 * (k - n) : 0);
        pts.push([x, y]);
      }
      var d = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
      for (var i = 0; i < pts.length - 1; i++) {
        var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
        d += " C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + " " + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + " " +
             (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + " " + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + " " + p2[0].toFixed(1) + " " + p2[1].toFixed(1);
      }
      ringSvg.setAttribute("viewBox", "0 0 " + w + " " + h);
      ringSvg.style.width = w + "px"; ringSvg.style.height = h + "px";
      ringSvg.style.left = -P + "px"; ringSvg.style.top = -P + "px";
      ringSvg.innerHTML = '<defs><filter id="chalk" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" result="n"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" result="d"/><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="9" result="g"/>' +
        '<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.9" result="m"/><feComposite in="d" in2="m" operator="in"/></filter></defs>' +
        '<g filter="url(#chalk)"><path class="r1" pathLength="1" d="' + d + '"/><path class="r2" pathLength="1" d="' + d + '" transform="translate(1.6 -1.2) rotate(.4 ' + cx.toFixed(0) + ' ' + cy.toFixed(0) + ')"/></g>';
    }
    chalkRing();
    var ringT; window.addEventListener("resize", function () { clearTimeout(ringT); ringT = setTimeout(chalkRing, 150); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(chalkRing);
    var sat = addDays(monday, 5);
    $("#valid").textContent = "gültig " + monday.getDate() + ". – " + sat.getDate() + ". " + MON[sat.getMonth()];
    var board = $("#board");
    if (reduce || !("IntersectionObserver" in window)) board.classList.add("drawn");
    else { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { board.classList.add("drawn"); io.disconnect(); } }); }, { threshold: .35 }); io.observe(board); }
  })();

  /* ---------- Sortiment-Tabs ---------- */
  (function () {
    var tabs = $$('[role="tab"]');
    function show(i, focus) {
      tabs.forEach(function (t, j) {
        var on = i === j, p = document.getElementById(t.getAttribute("aria-controls"));
        t.setAttribute("aria-selected", on ? "true" : "false"); t.tabIndex = on ? 0 : -1;
        p.hidden = !on;
        if (on) { p.classList.remove("swap"); void p.offsetWidth; if (!reduce) p.classList.add("swap"); if (focus) t.focus(); }
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { show(i); });
      t.addEventListener("keydown", function (e) {
        var n = null, L = tabs.length;
        if (e.key === "ArrowRight") n = (i + 1) % L; if (e.key === "ArrowLeft") n = (i + L - 1) % L;
        if (e.key === "Home") n = 0; if (e.key === "End") n = L - 1;
        if (n !== null) { e.preventDefault(); show(n, true); }
      });
    });
  })();

  /* ---------- Mittagsmenü ---------- */
  (function () {
    var M = { 1: ["Krautfleckerl mit grünem Salat", 7.9], 2: ["Schweinsbraten mit Semmelknödel und Sauerkraut", 9.9], 3: ["Faschierte Laibchen mit Erdäpfelpüree", 8.9], 4: ["Rindsgulasch mit Semmel", 9.4], 5: ["Gebackener Leberkäse mit Erdäpfelsalat", 9.2] };
    var m = M[V.wd], when = $("#mt-when"), dish = $("#mt-dish"), pr = $("#mt-price");
    if (m) { when.textContent = "Heute · " + WD[V.wd] + ", " + V.d + ". " + MON[V.m - 1]; dish.textContent = m[0]; pr.textContent = euro(m[1]); }
    else { when.textContent = V.wd === 6 ? "Heute Samstag" : "Heute Sonntag"; dish.textContent = "Am Wochenende kein Mittagsmenü – ab Montag kochen wir wieder. Samstag gibt's warmen Leberkäse bis 12 Uhr."; pr.textContent = "ab Mo"; }
    var ul = $("#mt-week");
    for (var w = 1; w <= 5; w++) {
      var li = document.createElement("li"); if (w === V.wd) li.className = "now";
      li.innerHTML = "<span>" + WD[w].slice(0, 2) + "</span><span>" + M[w][0] + "</span><b>" + euro(M[w][1]) + "</b>";
      ul.appendChild(li);
    }
  })();

  /* ---------- Leberkässemmel ---------- */
  (function () {
    var art = $("#lks-art"), senf = $("#lks-senf");
    var inputs = $$("#mittag input");
    function upd() {
      var s = $('input[name="sorte"]:checked'), sf = $('input[name="senf"]:checked').value, p = parseFloat(s.dataset.p), ex = [];
      var cls = "lks__art s-" + s.value;
      $$("#lks-extra input").forEach(function (c) { if (c.checked) { p += parseFloat(c.dataset.p); cls += " k-" + c.value; ex.push(c.parentNode.textContent.split(" +")[0]); } });
      art.className = cls;
      senf.style.opacity = sf === "ohne" ? 0 : 1;
      senf.setAttribute("stroke", sf === "scharf" ? "#e8c62f" : "#b98a2e");
      $("#lks-price").textContent = euro(p);
      $("#lks-desc").textContent = s.parentNode.textContent.trim() + " · " + (sf === "ohne" ? "ohne Senf" : sf + "er Senf").replace("süßer", "süßer").replace("scharfer", "scharfer") + (ex.length ? " · " + ex.join(", ") : "");
    }
    inputs.forEach(function (i) { i.addEventListener("change", upd); });
    upd();
  })();

  /* ---------- Platten-Konfigurator ---------- */
  (function () {
    var range = $("#ppl-r"), out = $("#ppl-o"), est = $("#est"), lastTotal = 0, raf = 0;
    function calc() {
      var s = $('input[name="size"]:checked'), n = +range.value, pp = parseFloat(s.dataset.p), fix = 0;
      $$('input[name="x"]').forEach(function (c) { if (c.checked) { if (c.dataset.pp) pp += parseFloat(c.dataset.pp); if (c.dataset.fix) fix += parseFloat(c.dataset.fix); } });
      var total = Math.round(n * pp + fix), kg = n * parseFloat(s.dataset.g) / 1000, pl = Math.max(1, Math.ceil(n / 10));
      out.textContent = n;
      est.classList.remove("s1", "s2", "s3"); est.classList.add("s" + s.value);   // nur die Größe tauschen, Einblend-Klasse bleibt
      $("#est-n").textContent = s.dataset.n + " · " + n + " Personen";
      $("#est-kg").textContent = "ca. " + kg.toFixed(1).replace(".", ",") + " kg";
      $("#est-pl").textContent = pl + (pl === 1 ? " Platte" : " Platten");
      animate(total);
      return { n: n, name: s.dataset.n, total: total };
    }
    function animate(to) {
      var from = lastTotal, t0 = null, elT = $("#est-total"); lastTotal = to;
      cancelAnimationFrame(raf);
      var mini = $("#est-mini"); if (mini) mini.textContent = "ca. " + to + " €";
      if (reduce || !from) { elT.textContent = "ca. " + to + " €"; return; }
      (function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 400), v = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
        elT.textContent = "ca. " + v + " €"; if (k < 1) raf = requestAnimationFrame(step); })(performance.now());
    }
    $("#pcfg").addEventListener("input", calc);
    $("#pcfg").addEventListener("change", calc);
    $("#pcfg").addEventListener("submit", function (e) { e.preventDefault(); });
    $("#ppl-m").addEventListener("click", function () { range.value = Math.max(4, +range.value - 1); calc(); });
    $("#ppl-p").addEventListener("click", function () { range.value = Math.min(120, +range.value + 1); calc(); });
    $("#est-cta").addEventListener("click", function () {
      var r = calc(), ta = $("#o-what");
      if (ta && !ta.value) ta.value = "Partyservice: " + r.name + " für " + r.n + " Personen (Schätzung ca. " + r.total + " €)";
    });
    calc();
  })();

  /* ---------- Vorbestellung ---------- */
  (function () {
    var f = $("#order"), date = $("#o-date"), err = $("#o-date-err"), msg = $("#order-msg");
    var tomorrow = addDays(V.date, 1); if (tomorrow.getDay() === 0) tomorrow = addDays(tomorrow, 1);
    date.min = iso(addDays(V.date, 1)); date.value = iso(tomorrow);
    function check() {
      err.textContent = "";
      if (!date.value) return true;
      var p = date.value.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2], 12);
      if (d.getDay() === 0) { err.textContent = "Sonntag haben wir geschlossen – bitte einen anderen Tag wählen."; return false; }
      return true;
    }
    date.addEventListener("change", check);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!check()) { date.focus(); return; }
      msg.textContent = DEMO_MSG; msg.classList.remove("on"); void msg.offsetWidth; msg.classList.add("on");
    });
  })();

  /* ---------- Speck aufschneiden (scroll-gebunden) ---------- */
  var sec = $("#selcherei");
  if (sec) (function () {
    var svg = $("#sl-svg"), sticky = $(".sl__sticky", sec), face = $("#face"), slicesG = $("#slices");
    var X0 = 120, Y0 = 372, W = 230, H = 120, D = 150, T = 13, PX = .55, PY = -.42, N = 6;
    var A0 = .08, S = .125;
    var seed = 11; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

    // Querschnitt: Schwarte, Fett und Fleisch in welligen Schichten, dazu feine Marmorierung.
    var base = [-120, -111, -91, -65, -53, -23, -12, 0];
    var fills = ["url(#g-rind)", "url(#g-fat1)", "url(#g-meat)", "url(#g-fat)", "url(#g-meat)", "url(#g-fat)", "url(#g-meat)"];
    var lines = base.map(function (b, i) {
      var pts = [], a1 = (i === 0 || i === 7) ? 0 : 2 + rnd() * 2.5, f1 = .02 + rnd() * .03, p1 = rnd() * 6, a2 = a1 * .45, f2 = .07 + rnd() * .05, p2 = rnd() * 6;
      for (var x = 0; x <= W; x += 10) pts.push([x, b + a1 * Math.sin(x * f1 + p1) + a2 * Math.sin(x * f2 + p2)]);
      return pts;
    });
    function pstr(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" "); }
    for (var li = 0; li < 7; li++) {
      var top = lines[li], bot = lines[li + 1].slice().reverse();
      el("path", { d: pstr(top) + " " + pstr(bot).replace("M", "L") + " Z", fill: fills[li] }, face);
    }
    // Marmorierung in den Fleischschichten
    [[2, 3], [4, 5], [6, 7]].forEach(function (ly) {
      for (var k = 0; k < 7; k++) {
        var x = 8 + rnd() * (W - 40), y1 = base[ly[0]] + 3, y2 = base[ly[1]] - 3, y = y1 + rnd() * (y2 - y1), len = 14 + rnd() * 34;
        el("path", { d: "M" + x.toFixed(1) + " " + y.toFixed(1) + " q" + (len / 2).toFixed(1) + " " + ((rnd() - .5) * 8).toFixed(1) + " " + len.toFixed(1) + " " + ((rnd() - .5) * 5).toFixed(1),
          fill: "none", stroke: "#f2dfc9", "stroke-width": (.6 + rnd() * 1.4).toFixed(2), "stroke-linecap": "round", opacity: (.45 + rnd() * .4).toFixed(2) }, face);
      }
    });
    // feine Fettpunkte im Speck und Rauchschimmer an der Schwarte
    for (var k2 = 0; k2 < 18; k2++) el("circle", { cx: (rnd() * W).toFixed(1), cy: (base[1] + 2 + rnd() * 16).toFixed(1), r: (.6 + rnd()).toFixed(2), fill: "#e2c39c", opacity: ".7" }, face);
    el("rect", { x: 0, y: -H, width: W, height: H, fill: "url(#g-vig)" }, face);
    el("rect", { x: 0, y: -H, width: W, height: H, fill: "url(#g-sheen)" }, face);
    el("rect", { x: .5, y: -H + .5, width: W - 1, height: H - 1, fill: "none", stroke: "#4a1c0e", "stroke-opacity": ".45" }, face);

    function front(k) { return [X0 + k * T * PX, Y0 + k * T * PY]; }
    var slabTop = $("#slab-top"), slabSheen = $("#slab-topsheen"), slabSide = $("#slab-side"), slabSideOv = $("#slab-sideov"), slabFront = $("#slab-front"), smoke = $("#slab-smoke"), slabShadow = $("#slab-shadow");
    function pts(a) { return a.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); }
    var lastK = -1;
    function drawSlab(k) {
      if (k === lastK) return; lastK = k;
      var f = front(k), fx = f[0], fy = f[1], L = D - k * T, bx = L * PX, by = L * PY;
      var topP = pts([[fx, fy - H], [fx + W, fy - H], [fx + W + bx, fy - H + by], [fx + bx, fy - H + by]]);
      slabTop.setAttribute("points", topP); slabSheen.setAttribute("points", topP);
      slabSide.setAttribute("transform", "matrix(" + (bx / W).toFixed(4) + " " + (by / W).toFixed(4) + " 0 1 " + (fx + W).toFixed(1) + " " + fy.toFixed(1) + ")");
      slabSideOv.setAttribute("points", pts([[fx + W, fy], [fx + W, fy - H], [fx + W + bx, fy - H + by], [fx + W + bx, fy + by]]));
      slabFront.setAttribute("transform", "translate(" + fx.toFixed(1) + " " + fy.toFixed(1) + ")");
      smoke.setAttribute("opacity", k === 0 ? .55 : 0);
      slabShadow.setAttribute("cx", (fx + W / 2 + bx / 2).toFixed(1)); slabShadow.setAttribute("cy", (fy + 6 + by / 3).toFixed(1));
    }

    // Scheiben
    var slices = [];
    for (var i = 0; i < N; i++) {
      var g = el("g", { opacity: 0, filter: "url(#f-slice)" }, slicesG);
      var bands = el("g", {}, g);
      el("polygon", { points: pts([[0, -H], [W, -H], [W + T * PX, -H + T * PY], [T * PX, -H + T * PY]]), fill: "url(#g-rind)" }, bands);
      el("polygon", { points: pts([[W, 0], [W, -H], [W + T * PX, -H + T * PY], [W + T * PX, T * PY]]), fill: "#5b2614" }, bands);
      var fg = el("g", i % 2 ? { transform: "translate(" + W + " 0) scale(-1 1)" } : {}, g);
      el("use", { href: "#face" }, fg);
      var sm = i === 0 ? el("rect", { x: 0, y: -H, width: W, height: H, fill: "#6b2d15", opacity: .55 }, g) : null;
      var fan = { x: 398 + i * 30, y: 322 + i * 9, r: -22 + i * 6, s: .85 };
      slices.push({ g: g, bands: bands, smoke: sm, fan: fan });
    }

    var nowEl = $("#sl-now"), knife = $("#knife"), label = $("#label"), steps = $$("#sl-steps li"), countEl = $("#sl-n");
    function cl(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
    function seg(p, a, b) { return cl((p - a) / (b - a)); }
    function eio(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function eo(t) { return 1 - Math.pow(1 - t, 3); }
    function lerp(a, b, t) { return a + (b - a) * t; }
    var COS_END = Math.cos(125 * Math.PI / 180);

    function render(p) {
      var started = 0, landed = 0;
      // Scheiben
      slices.forEach(function (s, i) {
        var u = (p - (A0 + i * S)) / S;
        if (u <= 0) { s.g.setAttribute("opacity", 0); return; }
        started++;
        u = cl(u);
        var f = front(i), fall = eio(seg(u, .42, .64)), glide = eio(seg(u, .6, 1));
        if (glide >= 1) landed++;
        var th = fall * 125 * Math.PI / 180, cy = Math.cos(th);
        var tx, ty, rot = 0, sx = 1, sy = cy;
        if (glide <= 0) { tx = f[0]; ty = f[1] + fall * 8; }
        else {
          tx = lerp(f[0], s.fan.x, glide); ty = lerp(f[1] + 8, s.fan.y, glide) - Math.sin(glide * Math.PI) * 36;
          rot = s.fan.r * glide; sx = lerp(1, s.fan.s, glide); sy = lerp(COS_END, COS_END * s.fan.s, glide);
        }
        s.g.setAttribute("opacity", 1);
        s.g.setAttribute("transform", "translate(" + tx.toFixed(1) + " " + ty.toFixed(1) + ") rotate(" + rot.toFixed(2) + ") scale(" + sx.toFixed(3) + " " + sy.toFixed(3) + ")");
        s.bands.setAttribute("opacity", cl(1 - fall * 5).toFixed(2));
        if (s.smoke) s.smoke.setAttribute("opacity", cy > 0 ? .55 : 0);
      });
      drawSlab(started);
      // Messer
      var kx, ky, kr = -2, ko = 1;
      var active = Math.min(N - 1, Math.max(0, Math.floor((p - A0) / S)));
      var u = cl((p - (A0 + active * S)) / S), plane = front(active + 1), hoverY = plane[1] - H - 34;
      if (p < A0) {
        var e = eo(seg(p, 0, A0)); kx = plane[0] - 40 + (1 - e) * 280; ky = hoverY - (1 - e) * 240; kr = -12 * (1 - e); ko = e;
      } else if (p > A0 + N * S) {
        var x2 = eio(seg(p, A0 + N * S, A0 + N * S + .06)), last = front(N);
        kx = last[0] - 40 + x2 * 300; ky = last[1] - H - 34 - x2 * 260; kr = -2 - 10 * x2; ko = 1 - x2;
      } else {
        var cut = eio(seg(u, .04, .42)), lift = eio(seg(u, .42, .62));
        var saw = Math.sin(seg(u, .04, .42) * Math.PI * 7) * 22 * (cut > 0 && cut < 1 ? 1 : 0);
        var yTop = plane[1] - H - 30, yBot = plane[1] + 2;
        var next = front(Math.min(N, active + 2)), nextHover = next[1] - H - 34;
        if (u < .42) { kx = plane[0] - 40 + saw; ky = lerp(hoverY, yBot, cut); }
        else { kx = lerp(plane[0], next[0], lift) - 40; ky = lerp(yBot, active < N - 1 ? nextHover : yTop - 20, lift); }
        kr = -2 + Math.sin(u * Math.PI * 7) * .6 * (u < .42 ? 1 : 0);
      }
      knife.setAttribute("transform", "translate(" + kx.toFixed(1) + " " + ky.toFixed(1) + ") rotate(" + kr.toFixed(2) + ")");
      knife.setAttribute("opacity", ko.toFixed(2));
      // Etikett
      var lb = eo(seg(p, .86, .96));
      label.setAttribute("opacity", lb.toFixed(2));
      label.setAttribute("transform", "translate(" + (160).toFixed(0) + " " + (418 - 34 * (1 - lb)).toFixed(1) + ") rotate(" + (-5 - 12 * (1 - lb)).toFixed(2) + ")");
      // Text
      var st = p < A0 ? 0 : p < A0 + S * .5 ? 1 : p < A0 + S * 3 ? 2 : p < .86 ? 3 : 4;
      steps.forEach(function (li, j) { li.classList.toggle("on", j <= st); });
      if (countEl.textContent !== String(landed)) countEl.textContent = landed;
      if (nowEl && nowEl.textContent !== steps[st].textContent) nowEl.textContent = steps[st].textContent;
    }

    function setVB() { svg.setAttribute("viewBox", window.innerWidth < 600 ? "40 122 740 362" : "0 110 800 400"); }
    setVB(); window.addEventListener("resize", setVB);

    if (reduce) { sec.classList.add("static"); render(1); return; }
    var target = 0, cur = 0, raf = 0, visible = false;
    function measure() {
      var r = sec.getBoundingClientRect(), top = parseFloat(getComputedStyle(sticky).top) || 0;
      var total = sec.offsetHeight - sticky.offsetHeight;
      target = cl((top - r.top) / (total || 1));
    }
    function loop() {
      cur += (target - cur) * .16;
      if (Math.abs(target - cur) < .0005) cur = target;
      render(cur);
      raf = cur !== target ? requestAnimationFrame(loop) : 0;
    }
    function onScroll() { if (!visible) return; measure(); if (!raf) raf = requestAnimationFrame(loop); }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) onScroll(); }, { rootMargin: "100px 0px" }).observe(sec);
    else visible = true;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    measure(); cur = target; render(cur);
  })();
})();
