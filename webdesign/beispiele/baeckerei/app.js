// Bäckerei Kornfeld – Beispielseite von tim-kofler.at
// Navigation, "Frisch aus dem Ofen" (Europe/Vienna), Sortiment-Filter, Vorbestellung
// und die Signatur-Animation: eine Kaisersemmel entsteht, gesteuert vom Scrollen.
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var NS = "http://www.w3.org/2000/svg";

  var bar = $(".tk-demo-bar");
  function setBar() { if (bar) document.documentElement.style.setProperty("--bar", bar.offsetHeight + "px"); }
  setBar(); window.addEventListener("resize", setBar);
  requestAnimationFrame(function () { requestAnimationFrame(function () { document.documentElement.classList.add("is-loaded"); }); });

  /* ---------- Mobilmenü ---------- */
  var burger = $("#burger"), links = $("#links");
  function setMenu(open) {
    links.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    $("span", burger).textContent = open ? "Schließen" : "Menü";
    document.body.style.overflow = open ? "hidden" : "";
    if (open) { var a = $("a", links); if (a) setTimeout(function () { a.focus(); }, 50); }
  }
  burger.addEventListener("click", function () { setMenu(!links.classList.contains("is-open")); });
  $$("a", links).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && links.classList.contains("is-open")) { setMenu(false); burger.focus(); } });
  window.addEventListener("resize", function () { if (window.innerWidth > 960 && links.classList.contains("is-open")) setMenu(false); });

  /* ---------- Zeit in Wien ---------- */
  function viennaNow() {
    try {
      var o = {};
      new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Vienna", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
        .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
      return { day: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday], min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (e) { var d = new Date(); return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() }; }
  }
  function hm(m) { return Math.floor(m / 60) + ":" + ("0" + (m % 60)).slice(-2); }
  function dur(m) { return m < 60 ? m + " Min." : Math.floor(m / 60) + " Std. " + (m % 60) + " Min."; }
  var HOURS = { 0: [420, 660], 1: [330, 1080], 2: [330, 1080], 3: [330, 1080], 4: [330, 1080], 5: [330, 1080], 6: [360, 720] };
  var BAKES = [[285, "Kaisersemmeln"], [330, "Kornspitz"], [375, "Bauernbrot"], [420, "Buttercroissants"], [510, "Laugenbrezeln"], [600, "Kaisersemmeln"], [690, "Baguette"], [840, "Topfengolatschen"], [930, "Kaisersemmeln"]];
  function bakesFor(day) { var c = HOURS[day][1]; return BAKES.filter(function (b) { return b[0] < c - 30; }); }

  /* ---------- Frisch aus dem Ofen ---------- */
  var box = $("#freshBox"), tl = $("#timeline"), fill = $(".timeline__fill");
  var lastKey = "";
  function updateFresh() {
    var n = viennaNow(), h = HOURS[n.day], list = bakesFor(n.day), open = n.min >= h[0] && n.min < h[1];
    var key = n.day + "|" + list.length;
    if (key !== lastKey) {
      lastKey = key;
      $$(".tl", tl).forEach(function (e) { e.remove(); });
      list.forEach(function (b) {
        var d = document.createElement("div"); d.className = "tl";
        d.innerHTML = "<em></em><i></i><span></span>";
        d.firstChild.textContent = b[1]; d.lastChild.textContent = hm(b[0]);
        tl.appendChild(d);
      });
    }
    var dots = $$(".tl", tl), last = -1;
    list.forEach(function (b, i) { if (b[0] <= n.min) last = i; });
    var next = last + 1 < list.length ? last + 1 : -1;
    dots.forEach(function (d, i) { d.classList.toggle("is-past", i <= last); d.classList.toggle("is-next", i === next && n.min < h[1]); });
    var frac = 0;
    if (last >= 0 && next >= 0) frac = (n.min - list[last][0]) / (list[next][0] - list[last][0]);
    var pos = last < 0 ? 0 : next < 0 ? 1 : (last + frac) / (list.length - 1);
    fill.style.transform = "scaleX(" + Math.max(0, Math.min(1, pos)).toFixed(3) + ")";

    var now = $("#freshNow"), sub = $("#freshSub"), nl = $("#nextLabel"), ni = $("#nextIn");
    var tom = (n.day + 1) % 7, tFirst = bakesFor(tom)[0][0];
    if (n.min >= h[1]) {
      now.textContent = "Für heute ist Feierabend";
      sub.textContent = "Morgen ab " + hm(HOURS[tom][0]) + " Uhr wieder ofenfrisch";
      nl.textContent = "Erstes Blech morgen"; ni.textContent = hm(tFirst) + " Uhr";
    } else if (last < 0) {
      now.textContent = "Der Ofen heizt vor";
      sub.textContent = "Erstes Blech: " + list[0][1] + " um " + hm(list[0][0]) + " Uhr";
      nl.textContent = "Nächstes Blech"; ni.textContent = "in " + dur(list[0][0] - n.min);
    } else {
      var ago = n.min - list[last][0];
      now.textContent = "Gerade fertig: " + list[last][1];
      sub.textContent = (ago <= 20 ? "Noch ofenwarm · " : "") + "vor " + dur(ago) + " aus dem Ofen";
      if (next >= 0) { nl.textContent = "Nächstes Blech: " + list[next][1]; ni.textContent = "in " + dur(list[next][0] - n.min); }
      else { nl.textContent = "Letztes Blech für heute"; ni.textContent = "Morgen " + hm(tFirst); }
    }
    box.classList.toggle("is-off", !open);

    var st = $("#openSt");
    st.classList.toggle("is-off", !open);
    $("span", st).textContent = open ? "Jetzt geöffnet · bis " + hm(h[1]) + " Uhr"
      : n.min < h[0] ? "Geschlossen · öffnet heute um " + hm(h[0]) + " Uhr"
      : "Geschlossen · öffnet morgen um " + hm(HOURS[tom][0]) + " Uhr";
    $$("#hoursTbl .hrow").forEach(function (r) { r.classList.toggle("is-today", r.getAttribute("data-days").split(",").indexOf(String(n.day)) > -1); });
  }
  updateFresh(); setInterval(updateFresh, 30000);

  /* ---------- Sortiment-Filter ---------- */
  var chips = $$(".chip"), prods = $$(".prod");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var f = c.getAttribute("data-f");
      chips.forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
      prods.forEach(function (p) { p.classList.toggle("is-hidden", f !== "alle" && p.getAttribute("data-cat") !== f); p.classList.add("is-in"); });
    });
  });

  /* ---------- Vorbestellung (Beispiel, sendet nichts) ---------- */
  var form = $("#orderForm");
  function euro(x) { return x.toFixed(2).replace(".", ",") + " €"; }
  function total() {
    var s = 0, c = 0;
    $$(".prow", form).forEach(function (r) { var q = +$("output", r).textContent; s += q * parseFloat(r.getAttribute("data-price")); c += q; });
    $("#sum").textContent = euro(s); $("#cnt").textContent = c + " Stück";
  }
  $$(".qty button", form).forEach(function (b) {
    b.addEventListener("click", function () {
      var o = $("output", b.parentNode); o.textContent = Math.max(0, Math.min(60, +o.textContent + +b.getAttribute("data-d"))); total();
    });
  });
  total();
  var di = $("#o-date"), d = new Date(); d.setDate(d.getDate() + 1);
  var iso = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  di.min = iso; di.value = iso;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var m = $(".form-msg", form);
    m.textContent = "Das ist ein Beispiel – auf der echten Seite käme Ihre Anfrage jetzt direkt beim Betrieb an.";
    m.classList.add("is-on");
  });

  /* ---------- Hero: Brot im Ofen ---------- */
  // Das Video (Zeitraffer) zeigt 50 Backminuten. Hitze, Restzeit und Balken laufen mit,
  // am Ende bleibt das fertige Brot kurz stehen, dann beginnt das nächste.
  (function () {
    var box = $("#ofenHero"), v = $("#ofenVid");
    if (!box || !v) return;
    var BREADS = ["Bauernbrot", "Dinkellaib", "Roggenbrot"], bi = 0, BAKE = 50, hold = null, fade = null;
    var stateEl = $("#ofenState"), nameEl = $("#ofenName");
    function paint(p) {
      box.style.setProperty("--heat", (0.35 + 0.65 * Math.min(1, p * 1.6)).toFixed(3));
      box.style.setProperty("--p", p.toFixed(3));
      var left = Math.max(0, Math.round(BAKE * (1 - p)));
      stateEl.textContent = p >= 0.999 ? "fertig gebacken" : "noch " + left + " Min.";
      box.classList.toggle("is-done", p >= 0.999);
    }
    paint(1);
    var save = navigator.connection && navigator.connection.saveData;
    if (reduce || save || !("IntersectionObserver" in window)) return;
    v.muted = true; v.playsInline = true;
    var tick = function () { if (v.duration) paint(Math.min(1, v.currentTime / v.duration)); if (!v.paused) requestAnimationFrame(tick); };
    v.addEventListener("playing", function () { requestAnimationFrame(tick); });
    v.addEventListener("ended", function () {
      paint(1);
      hold = setTimeout(function () {
        v.style.transition = "opacity .6s"; v.style.opacity = "0";
        fade = setTimeout(function () {
          bi = (bi + 1) % BREADS.length; nameEl.textContent = BREADS[bi];
          v.currentTime = 0; paint(0); v.style.opacity = "1"; v.play().catch(function () {});
        }, 650);
      }, 2600);
    });
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          if (v.preload === "none") v.preload = "auto";
          if (!v.ended) v.play().catch(function () { paint(1); });
        } else { v.pause(); }
      });
    }, { threshold: 0.25 }).observe(box);
  })();

  /* ---------- Signatur-Animation: Kaisersemmel ---------- */
  var story = $("#handwerk"), sticky = $(".story__sticky"), stage = $("#sStage");
  var doughP = $("#doughP"), roll = $("#roll"), cutsG = $("#cuts"), flourOn = $("#flourOn"), hlE = $("#hlE"),
      ovenG = $("#ovenG"), boardG = $("#boardG"), glowC = $("#glowC"), rods = $("#rods"), shd = $("#shd"), dustG = $("#dust"),
      crust = $("#crust"), crease = $("#crease"), hands = $("#hands");
  var stops = [$("#dS0"), $("#dS1"), $("#dS2")];
  var RAW = [[246, 234, 210], [236, 220, 188], [217, 195, 155]], BAKED = [[238, 176, 96], [210, 134, 58], [122, 63, 21]];
  var steps = $$("#sSteps .sstep"), NAMES = ["Kneten", "Formen", "Einschneiden", "Backen", "Fertig"];

  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function seg(p, a, b) { return clamp((p - a) / (b - a)); }
  function eio(x) { return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function eout(x) { return 1 - Math.pow(1 - x, 3); }
  function mix(a, b, t) { return "rgb(" + a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }).join(",") + ")"; }
  function f1(n) { return n.toFixed(1); }
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

  // Kaisermuster: fünf gebogene Schnitte, die sich wie ein Windrad um die Mitte drehen
  var SR = 112, A0 = -Math.PI / 2 - 0.25;
  function pol(r, a) { return [Math.cos(a) * r, Math.sin(a) * r]; }
  function rotP(q, deg) { var a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [q[0] * c - q[1] * s, q[0] * s + q[1] * c]; }
  function cutGeo(k) { var a = A0 + k * Math.PI * 2 / 5; return { s: pol(SR * .09, a), c1: pol(SR * .45, a + .06), c2: pol(SR * .8, a + .52), e: pol(SR * 1.12, a + 1.18) }; }
  function rotG(g, deg) { return { s: rotP(g.s, deg), c1: rotP(g.c1, deg), c2: rotP(g.c2, deg), e: rotP(g.e, deg) }; }
  function cutD(g) { return "M" + f1(g.s[0]) + " " + f1(g.s[1]) + " C" + f1(g.c1[0]) + " " + f1(g.c1[1]) + " " + f1(g.c2[0]) + " " + f1(g.c2[1]) + " " + f1(g.e[0]) + " " + f1(g.e[1]); }
  function backD(h) { return " C" + f1(h.c2[0]) + " " + f1(h.c2[1]) + " " + f1(h.c1[0]) + " " + f1(h.c1[1]) + " " + f1(h.s[0]) + " " + f1(h.s[1]) + "Z"; }
  function bandD(g, deg) { var h = rotG(g, deg); return cutD(g) + " L" + f1(h.e[0]) + " " + f1(h.e[1]) + backD(h); }
  var geo = [0, 1, 2, 3, 4].map(cutGeo), cuts = [], Rr = SR * 1.12;
  geo.forEach(function (g, k) {
    var h = geo[(k + 1) % 5];
    el("path", { d: cutD(g) + " A" + f1(Rr) + " " + f1(Rr) + " 0 0 1 " + f1(h.e[0]) + " " + f1(h.e[1]) + backD(h) }, $("#petals"));
    var d = cutD(g), c = {};
    c.sh = el("path", { fill: "#3e1803", filter: "url(#soft)", opacity: "0" }, cutsG);
    var rg = el("g", { filter: "url(#rough)" }, cutsG);
    c.band = el("path", { opacity: "0" }, rg);
    c.lip = el("path", { d: d, fill: "none", stroke: "#fff6e2", "stroke-width": "1.5", "stroke-linecap": "round", opacity: "0" }, rg);
    c.line = el("path", { d: d, fill: "none", "stroke-width": "2", "stroke-linecap": "round", pathLength: "1", "stroke-dasharray": "1 1", "stroke-dashoffset": "1" }, rg);
    c.g = g; cuts.push(c);
  });

  // Mehlstaub-Partikel
  var dust = [], rnd = (function () { var s = 7; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
  for (var i = 0; i < 52; i++) {
    var ang = rnd() * Math.PI * 2, rr = Math.sqrt(rnd());
    var c = el("circle", { r: (0.6 + rnd() * 1.6).toFixed(1), opacity: "0" }, dustG);
    dust.push({ el: c, ang: ang, tx: Math.cos(ang) * rr * 104, ty: Math.sin(ang) * rr * 96, d: rnd(), sp: 0.6 + rnd(), side: rnd() < .5 ? -1 : 1 });
  }

  // Teigform: beim Kneten länglich ausgestoßen, beim Formen rund, im Ofen mit Einkerbungen an den Schnitten
  var PH = A0 + 1.12, sy = 1, soy = 0, volC = $("#volC");
  function doughPath(p, st, notch, push) {
    var N = 72, pts = [], flat = 1 - eio(seg(p, 0.15, 0.32)), wob = 0.04 * flat;
    var R = 104 + 8 * eio(seg(p, 0.18, 0.36)), rx = R * (1 + 0.12 * flat) * (1 - 0.08 * st), ry = R * (1 - 0.27 * flat) * (1 + 0.42 * st), oy = R * (0.1 * flat - 0.3 * st);
    sy = ry / R; soy = oy;
    for (var j = 0; j < N; j++) {
      var t = j / N * Math.PI * 2, dn = 0, h = t - Math.PI / 2;
      for (var k = 0; k < 5; k++) { var dt = Math.atan2(Math.sin(t - PH - k * 1.2566), Math.cos(t - PH - k * 1.2566)); dn += Math.exp(-dt * dt / 0.02); }
      var bul = push * flat * (0.1 * (Math.exp(-(h - 0.85) * (h - 0.85) / 0.06) + Math.exp(-(h + 0.85) * (h + 0.85) / 0.06)) - 0.07 * Math.exp(-h * h / 0.12));
      var m = 1 + bul + wob * (0.6 * Math.sin(2 * t + p * 30) + 0.4 * Math.sin(3 * t - p * 21 + 1)) - notch * dn + notch * 0.25 * Math.sin(5 * (t - PH) - 0.6);
      pts.push([Math.cos(t) * rx * m, oy + Math.sin(t) * ry * m]);
    }
    var s = "M" + f1((pts[N - 1][0] + pts[0][0]) / 2) + " " + f1((pts[N - 1][1] + pts[0][1]) / 2);
    for (var q = 0; q < N; q++) {
      var p0 = pts[q], p1 = pts[(q + 1) % N];
      s += " Q" + f1(p0[0]) + " " + f1(p0[1]) + " " + f1((p0[0] + p1[0]) / 2) + " " + f1((p0[1] + p1[1]) / 2);
    }
    return s + "Z";
  }

  var lastStep = -1;
  function render(p) {
    // Kneten: drei Mal ausstoßen, zurückfalten, weiterdrehen
    var kAmp = 1 - eio(seg(p, 0.13, 0.22)), kp = seg(p, 0, 0.18) * 3, cyc = kp % 1, n = Math.floor(kp);
    if (kp >= 3) { cyc = 1; n = 2; }
    var push = cyc < 0.55 ? eio(cyc / 0.55) : 1 - eio((cyc - 0.55) / 0.45);
    var st = push * 0.3 * kAmp, fold = (cyc > 0.45 ? Math.sin(Math.PI * clamp((cyc - 0.45) / 0.55)) : 0) * kAmp;
    var b = eio(seg(p, 0.62, 0.88));
    doughP.setAttribute("d", doughPath(p, st, 0.035 * b, push));
    volC.setAttribute("transform", "translate(0 " + f1(soy) + ") scale(1 " + sy.toFixed(3) + ")");
    crease.setAttribute("opacity", fold.toFixed(3));
    crease.setAttribute("transform", "translate(0 " + f1(soy) + ") scale(1 " + sy.toFixed(3) + ") rotate(" + [0, -24, 20][n] + ")");
    var lift = cyc > 0.55 ? Math.sin(Math.PI * (cyc - 0.55) / 0.45) : 0, out = eio(seg(p, 0.12, 0.2));
    hands.setAttribute("transform", "translate(0 " + (-30 * push + 12 * lift + 190 * out).toFixed(1) + ")");
    hands.setAttribute("opacity", (1 - seg(p, 0.13, 0.18)).toFixed(3));
    hands.style.display = p > 0.21 ? "none" : "";

    var rise = 1 + 0.14 * eout(seg(p, 0.6, 0.84)), rot = 6 * Math.sin(p * 9) * (1 - seg(p, 0.2, 0.4)) * (1 - kAmp);
    roll.setAttribute("transform", "translate(300 " + (280 - 6 * (rise - 1) * 10).toFixed(1) + ") rotate(" + rot.toFixed(2) + ") scale(" + rise.toFixed(3) + ")");
    shd.setAttribute("transform", "translate(300 392) scale(" + (rise * (1 - 0.1 * st)).toFixed(3) + " 1) translate(-300 -392)");

    stops.forEach(function (s2, i2) { s2.setAttribute("stop-color", mix(RAW[i2], BAKED[i2], b)); });
    flourOn.setAttribute("opacity", (0.5 * (1 - seg(p, 0.6, 0.75))).toFixed(3));
    hlE.setAttribute("opacity", (0.55 - 0.15 * b).toFixed(3));
    crust.setAttribute("opacity", b.toFixed(3));

    // Schnitte: zuerst eine feine Kerbe, im Ofen reißen sie auf und werden hell
    var lineCol = mix([176, 150, 108], [85, 35, 10], b), bandCol = mix([214, 192, 152], [242, 206, 146], b);
    cuts.forEach(function (c, i2) {
      var k2 = eio(seg(p, 0.42 + i2 * 0.028, 0.47 + i2 * 0.028)), open = 1.3 * k2 + 4.1 * b;
      c.line.setAttribute("stroke-dashoffset", (1 - k2).toFixed(3));
      c.line.setAttribute("stroke", lineCol);
      c.line.setAttribute("transform", "rotate(" + open.toFixed(2) + ")");
      if (k2 > 0.99) {
        c.band.setAttribute("d", bandD(c.g, open)); c.band.setAttribute("fill", bandCol); c.band.setAttribute("opacity", "1");
        c.sh.setAttribute("d", bandD(c.g, open + 2.6 * b + 0.8)); c.sh.setAttribute("opacity", (0.18 + 0.32 * b).toFixed(3));
      } else { c.band.setAttribute("opacity", "0"); c.sh.setAttribute("opacity", "0"); }
      c.lip.setAttribute("opacity", (0.75 * b).toFixed(3));
      c.lip.setAttribute("transform", "rotate(" + (open * 0.4).toFixed(2) + ")");
    });

    // Ofen
    var o = seg(p, 0.55, 0.62) * (1 - seg(p, 0.88, 0.95));
    ovenG.setAttribute("opacity", o.toFixed(3)); boardG.setAttribute("opacity", (1 - o).toFixed(3));
    glowC.setAttribute("opacity", (b * (0.75 + 0.25 * Math.sin(p * 90))).toFixed(3));
    rods.setAttribute("opacity", (0.35 + 0.65 * seg(p, 0.58, 0.68)).toFixed(3));

    // Mehlstaub: beim Ausstoßen stäubt es unter den Händen hervor, am Ende fein auf die Semmel
    var puff = 1 - seg(p, 0.15, 0.2), fin = seg(p, 0.88, 0.99);
    dust.forEach(function (q) {
      var x, y, op;
      if (fin > 0) {
        var f = eout(clamp((fin - q.d * 0.5) / 0.5));
        x = 300 + q.tx * rise; y = 280 + q.ty * rise - 150 * (1 - f) - 6 * (rise - 1) * 10; op = f * (0.35 + 0.4 * q.sp / 1.6);
      } else {
        var w = (cyc * q.sp + q.d * 0.35) % 1, e = eout(w);
        x = 300 + q.side * (70 + 40 * q.d) + Math.cos(q.ang) * e * 70; y = 352 - 30 * push + Math.sin(q.ang) * e * 30 - e * 50;
        op = puff * (1 - w) * 0.75 * (0.4 + 0.6 * push);
      }
      q.el.setAttribute("cx", x.toFixed(1)); q.el.setAttribute("cy", y.toFixed(1)); q.el.setAttribute("opacity", op.toFixed(3));
    });
    stage.classList.toggle("is-steam", p > 0.9);

    // Beschriftung
    var s = p < 0.2 ? 0 : p < 0.4 ? 1 : p < 0.58 ? 2 : p < 0.88 ? 3 : 4;
    if (s !== lastStep) {
      lastStep = s;
      $("#sName").textContent = NAMES[s]; $("#sKicker").textContent = "Schritt " + (s + 1) + " von 5";
      steps.forEach(function (el, n) { el.classList.toggle("is-on", n === s); el.classList.toggle("is-done", n < s); });
    }
    var temp = p < 0.56 ? Math.round(22 + 4 * seg(p, 0, 0.2)) : Math.round(26 + 204 * eout(seg(p, 0.56, 0.66)));
    $("#sTemp").textContent = temp + " °C";
    var mins = Math.round(12 * seg(p, 0, 0.2) + 30 * seg(p, 0.2, 0.4) + 3 * seg(p, 0.4, 0.58) + 18 * seg(p, 0.6, 0.88) + 2 * seg(p, 0.88, 1));
    $("#sTime").textContent = mins + " Min.";
    $("#sBar").style.transform = "scaleX(" + p.toFixed(3) + ")";
    $("#sHint").style.opacity = p < 0.03 ? 1 : 0;
  }

  if (reduce) { story.classList.add("is-static"); render(1); steps.forEach(function (el) { el.classList.add("is-on"); }); return; }

  var target = 0, cur = 0, running = false;
  function measure() {
    var r = story.getBoundingClientRect(), top = parseFloat(getComputedStyle(sticky).top) || 0;
    var total = story.offsetHeight - sticky.offsetHeight;
    target = clamp((top - r.top) / total);
  }
  function loop() {
    cur += (target - cur) * 0.14;
    if (Math.abs(target - cur) < 0.0005) cur = target;
    render(cur);
    if (cur !== target) requestAnimationFrame(loop); else running = false;
  }
  // Mehl: Der Name "Kornfeld" besteht aus Mehlstaub. Maus oder Finger wirbeln ihn auf, danach legt er sich wieder.
  // Ohne JavaScript oder mit reduzierter Bewegung bleibt der Name als normale Schrift stehen.
  (function () {
    var board = $("[data-mehl]");
    if (!board || reduce) return;
    var cv = $("canvas", board), cx = cv.getContext("2d"), word = $(".mehl__word", board);
    var P = [], q = 1, W = 0, H = 0, on = false, raf = 0, calm = 0;
    var m = { x: -1e4, y: -1e4, vx: 0, vy: 0, t: 0 };
    function build() {
      var r = board.getBoundingClientRect();
      if (!r.width) return;
      q = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.width = Math.round(r.width * q); H = cv.height = Math.round(r.height * q);
      var off = document.createElement("canvas"); off.width = W; off.height = H;
      var o = off.getContext("2d"), cs = getComputedStyle(word);
      o.font = "italic 400 " + parseFloat(cs.fontSize) * q + "px " + cs.fontFamily;
      o.textAlign = "center"; o.textBaseline = "middle"; o.fillStyle = "#fff";
      o.fillText(word.textContent, W / 2, H / 2);
      var d = o.getImageData(0, 0, W, H).data, step = Math.max(2, Math.round(1.6 * q)), old = P;
      P = [];
      for (var y = 0; y < H; y += step) for (var x = 0; x < W; x += step) {
        if (d[(y * W + x) * 4 + 3] > 120 && Math.random() < 0.94) {
          P.push({ hx: x, hy: y, x: x, y: y, vx: 0, vy: 0, s: (Math.random() * 0.8 + 0.7) * q, a: Math.random() * 0.35 + 0.65 });
        }
      }
      board.classList.add("is-live");
      if (!old.length) frame();
    }
    function move(e) {
      var r = board.getBoundingClientRect(), nx = (e.clientX - r.left) * q, ny = (e.clientY - r.top) * q;
      m.vx = m.x < -1e3 ? 0 : nx - m.x; m.vy = m.y < -1e3 ? 0 : ny - m.y; m.x = nx; m.y = ny; m.t = performance.now();
      board.classList.add("is-touched");
      wake();
    }
    board.addEventListener("pointermove", move);
    board.addEventListener("pointerdown", move);
    board.addEventListener("pointerleave", function () { m.x = m.y = -1e4; });
    function wake() { if (!raf && on) raf = requestAnimationFrame(frame); }
    function frame(now) {
      raf = 0;
      now = now || performance.now();
      var R = 64 * q, live = now - m.t < 120, moving = 0;
      cx.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], dx = p.x - m.x, dy = p.y - m.y, d2 = dx * dx + dy * dy;
        if (live && d2 < R * R) {
          var dd = Math.sqrt(d2) || 1, f = 1 - dd / R;
          p.vx += (dx / dd * 2 + m.vx * 0.2) * f + (Math.random() - 0.5) * 1.6 * f;
          p.vy += (dy / dd * 2 + m.vy * 0.2) * f - 0.9 * f + (Math.random() - 0.5) * 1.6 * f;
        }
        p.vx += (p.hx - p.x) * 0.011; p.vy += (p.hy - p.y) * 0.011; p.vx *= 0.9; p.vy *= 0.9;
        p.x += p.vx; p.y += p.vy;
        var sp = Math.abs(p.vx) + Math.abs(p.vy);
        if (sp > 0.05 || Math.abs(p.hx - p.x) > 0.3) moving++;
        var k = Math.min(1, sp / 6);
        cx.globalAlpha = p.a * (1 - k * 0.4);
        cx.fillStyle = k > 0.2 ? "#fff9ee" : "#f1e5d0";
        cx.fillRect(p.x, p.y, p.s, p.s);
      }
      cx.globalAlpha = 1;
      // Nur rechnen, solange sich noch Staub bewegt; danach steht das Bild still
      if (moving || live) wake();
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { on = es[0].isIntersecting; if (on) wake(); }, { rootMargin: "100px" }).observe(board);
    } else on = true;
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(build, 200); });
    (document.fonts && document.fonts.load ? document.fonts.load("italic 400 40px \"Libre Caslon\"") : Promise.resolve()).then(build, build);
  })();

  function kick() { measure(); if (!running) { running = true; requestAnimationFrame(loop); } }
  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick);
  render(0); kick();
})();
