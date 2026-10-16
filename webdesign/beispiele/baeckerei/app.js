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

  /* ---------- Signatur-Animation: Kaisersemmel ---------- */
  var story = $("#handwerk"), sticky = $(".story__sticky"), stage = $("#sStage");
  var doughP = $("#doughP"), roll = $("#roll"), cutsG = $("#cuts"), flourOn = $("#flourOn"), hlE = $("#hlE"),
      ovenG = $("#ovenG"), boardG = $("#boardG"), glowC = $("#glowC"), rods = $("#rods"), shd = $("#shd"), dustG = $("#dust");
  var stops = [$("#dS0"), $("#dS1"), $("#dS2")];
  var RAW = [[246, 234, 210], [236, 220, 188], [217, 195, 155]], BAKED = [[240, 178, 92], [198, 118, 44], [128, 66, 24]];
  var steps = $$("#sSteps .sstep"), NAMES = ["Kneten", "Formen", "Einschneiden", "Backen", "Fertig"];

  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function seg(p, a, b) { return clamp((p - a) / (b - a)); }
  function eio(x) { return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function eout(x) { return 1 - Math.pow(1 - x, 3); }
  function mix(a, b, t) { return "rgb(" + a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }).join(",") + ")"; }

  // Schnitte des Kaisermusters: je ein dunkler Schatten und eine helle Ausbruchkante
  var cuts = [];
  for (var k = 0; k < 5; k++) {
    var a = -Math.PI / 2 + k * (Math.PI * 2 / 5);
    var x0 = Math.cos(a) * 14, y0 = Math.sin(a) * 14, a2 = a + 0.95;
    var x1 = Math.cos(a2) * 94, y1 = Math.sin(a2) * 94, ac = a + 0.2;
    var cx = Math.cos(ac) * 74, cy = Math.sin(ac) * 74;
    var dd = "M" + x0.toFixed(1) + " " + y0.toFixed(1) + " Q" + cx.toFixed(1) + " " + cy.toFixed(1) + " " + x1.toFixed(1) + " " + y1.toFixed(1);
    var sh = document.createElementNS(NS, "path"), cr = document.createElementNS(NS, "path");
    [sh, cr].forEach(function (pp) { pp.setAttribute("d", dd); pp.setAttribute("pathLength", "1"); pp.setAttribute("stroke-dasharray", "1 1"); pp.setAttribute("stroke-dashoffset", "1"); cutsG.appendChild(pp); });
    sh.setAttribute("stroke-width", "10"); cr.setAttribute("stroke-width", "4");
    cuts.push([sh, cr]);
  }

  // Mehlstaub-Partikel
  var dust = [], rnd = (function () { var s = 7; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
  for (var i = 0; i < 46; i++) {
    var c = document.createElementNS(NS, "circle"), ang = rnd() * Math.PI * 2, rr = Math.sqrt(rnd());
    c.setAttribute("r", (1 + rnd() * 2.4).toFixed(1)); c.setAttribute("opacity", "0");
    dustG.appendChild(c);
    dust.push({ el: c, ang: ang, orb: 120 + rnd() * 90, tx: Math.cos(ang) * rr * 100, ty: Math.sin(ang) * rr * 92, d: rnd(), sp: 0.6 + rnd() });
  }

  // Teigform: Radius je Winkel, unruhig beim Kneten, rund beim Formen
  function doughPath(p) {
    var amp = 0.17 * (1 - eio(seg(p, 0.16, 0.36))), ph = p * 46, N = 64, pts = [];
    var R = 104 + 8 * eio(seg(p, 0.18, 0.36));
    for (var j = 0; j < N; j++) {
      var t = j / N * Math.PI * 2;
      var r = R * (1 + amp * (0.55 * Math.sin(2 * t + ph) + 0.3 * Math.sin(3 * t - ph * 0.7 + 1) + 0.18 * Math.sin(5 * t + ph * 1.3)));
      pts.push([Math.cos(t) * r, Math.sin(t) * r]);
    }
    var s = "M" + ((pts[N - 1][0] + pts[0][0]) / 2).toFixed(1) + " " + ((pts[N - 1][1] + pts[0][1]) / 2).toFixed(1);
    for (var q = 0; q < N; q++) {
      var p0 = pts[q], p1 = pts[(q + 1) % N];
      s += " Q" + p0[0].toFixed(1) + " " + p0[1].toFixed(1) + " " + ((p0[0] + p1[0]) / 2).toFixed(1) + " " + ((p0[1] + p1[1]) / 2).toFixed(1);
    }
    return s + "Z";
  }

  var lastStep = -1;
  function render(p) {
    doughP.setAttribute("d", doughPath(p));
    var knead = 1 - seg(p, 0.16, 0.34);
    var sq = knead * 0.12 * Math.sin(p * 60), rot = knead * 18 * Math.sin(p * 22);
    var rise = 1 + 0.14 * eout(seg(p, 0.6, 0.84));
    roll.setAttribute("transform", "translate(300 " + (280 - 6 * (rise - 1) * 10).toFixed(1) + ") rotate(" + rot.toFixed(2) + ") scale(" + ((1 + sq) * rise).toFixed(3) + " " + ((1 - sq) * rise).toFixed(3) + ")");
    shd.setAttribute("transform", "translate(300 392) scale(" + rise.toFixed(3) + " 1) translate(-300 -392)");

    var b = eio(seg(p, 0.62, 0.88));
    stops.forEach(function (st, n) { st.setAttribute("stop-color", mix(RAW[n], BAKED[n], b)); });
    flourOn.setAttribute("opacity", (0.5 * (1 - seg(p, 0.6, 0.75))).toFixed(3));
    hlE.setAttribute("opacity", (0.5 - 0.2 * b).toFixed(3));

    // Schnitte
    var shCol = mix([196, 172, 130], [110, 56, 18], b), crCol = mix([170, 146, 104], [246, 214, 156], b);
    cuts.forEach(function (cc, n) {
      var k2 = eio(seg(p, 0.42 + n * 0.028, 0.47 + n * 0.028)), off = (1 - k2).toFixed(3);
      cc[0].setAttribute("stroke-dashoffset", off); cc[1].setAttribute("stroke-dashoffset", off);
      cc[0].setAttribute("stroke", shCol); cc[1].setAttribute("stroke", crCol);
      cc[0].setAttribute("stroke-width", (6 + 6 * b).toFixed(1)); cc[1].setAttribute("stroke-width", (3 + 3 * b).toFixed(1));
    });

    // Ofen
    var o = seg(p, 0.55, 0.62) * (1 - seg(p, 0.88, 0.95));
    ovenG.setAttribute("opacity", o.toFixed(3)); boardG.setAttribute("opacity", (1 - o).toFixed(3));
    glowC.setAttribute("opacity", (b * (0.75 + 0.25 * Math.sin(p * 90))).toFixed(3));
    rods.setAttribute("opacity", (0.35 + 0.65 * seg(p, 0.58, 0.68)).toFixed(3));

    // Mehlstaub: beim Kneten Wölkchen, am Ende fein auf die Semmel gestäubt
    var puff = 1 - seg(p, 0.14, 0.24), fin = seg(p, 0.88, 0.99), sc = rise;
    dust.forEach(function (q) {
      var x, y, op;
      if (fin > 0) {
        var f = eout(clamp((fin - q.d * 0.5) / 0.5));
        x = 300 + q.tx * sc; y = 280 + q.ty * sc - 150 * (1 - f); op = f * 0.9;
      } else {
        var w = (p * 30 * q.sp + q.d * 6) % 1;
        x = 300 + Math.cos(q.ang + p * 3) * (q.orb + w * 30); y = 290 + Math.sin(q.ang + p * 3) * (q.orb * 0.7 + w * 20) - w * 30;
        op = puff * (1 - w) * 0.7;
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
  function kick() { measure(); if (!running) { running = true; requestAnimationFrame(loop); } }
  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick);
  render(0); kick();
})();
