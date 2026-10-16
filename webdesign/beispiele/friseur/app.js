// Haarwerk Studio – Beispielseite. Navigation, Preis-Tabs, Haarschnitt-Animation,
// Vorher/Nachher-Regler, Online-Buchung (Attrappe) und Öffnungsstatus.
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
  function onScroll() { nav.classList.toggle("is-solid", window.scrollY > 40); }
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
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

  /* ---------- Preis-Tabs ---------- */
  var tabs = $$('[role="tab"]');
  function selectTab(t, focus) {
    tabs.forEach(function (b) {
      var on = b === t; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1;
      var p = document.getElementById(b.getAttribute("aria-controls")); p.hidden = !on;
    });
    if (focus) t.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(t); });
    t.addEventListener("keydown", function (e) {
      var n = null;
      if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") n = tabs[0];
      if (e.key === "End") n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });

  /* ---------- Haarschnitt-Animation ---------- */
  var svg = $("#hw-svg");
  if (svg) (function () {
    var gUp = $("#hw-upper"), gLo = $("#hw-lower"), gBits = $("#hw-bits"), comb = $("#hw-comb"), sc = $("#hw-sc"),
      bA = $("#hw-bladeA"), bB = $("#hw-bladeB"), done = $("#hw-done"), sparks = $$(".spark", svg), steps = $$("#cut-steps li");
    var seed = 11; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    function el(tag, attrs, parent) { var e = document.createElementNS(SVGNS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
    function cutY(x) { return 368 - (x - 300) * 0.17; }
    var cols = ["#4a2c22", "#5b3628", "#6b4030", "#573226", "#7a4a36", "#3f251d"];
    var strands = [], N = 46, massUp = [], massLoTop = [], massLoBot = [];

    // Kammzähne
    var td = ""; for (var t = -52; t <= 52; t += 6.5) td += "M" + t + " 4 L" + t + " 30 ";
    $("#hw-teeth").setAttribute("d", td);

    function bez(p0, p1, p2, p3, t) { var u = 1 - t; return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3; }
    function pathOf(pts) { var d = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1); for (var i = 1; i < pts.length; i++) d += " L" + pts[i][0].toFixed(1) + " " + pts[i][1].toFixed(1); return d; }

    for (var i = 0; i < N; i++) {
      var f = i / (N - 1), a = (-142 + f * 162) * Math.PI / 180;
      var rx = 306 + 108 * Math.cos(a), ry = 250 + 124 * Math.sin(a);
      var ex = 292 + f * 168 + (rnd() - .5) * 18, ey = 500 + Math.sin(i * 1.9) * 12 + rnd() * 18;
      var p1x = rx + 52 + f * 18, p1y = ry - 22 * (1 - f) + 14 * f;
      var p2x = ex - 22 + (rnd() - .5) * 22, p2y = 320 + rnd() * 40;
      var pts = [], k, cut = -1;
      for (k = 0; k <= 48; k++) { var tt = k / 48; pts.push([bez(rx, p1x, p2x, ex, tt), bez(ry, p1y, p2y, ey, tt)]); }
      for (k = 1; k < pts.length; k++) { if (pts[k][1] >= cutY(pts[k][0]) && pts[k][1] > 300) { cut = k; break; } }
      if (cut < 0) cut = pts.length - 2;
      // Schnittpunkt interpolieren
      var A = pts[cut - 1], B = pts[cut], ya = A[1] - cutY(A[0]), yb = B[1] - cutY(B[0]), q = ya / (ya - yb || 1);
      var C = [A[0] + (B[0] - A[0]) * q, A[1] + (B[1] - A[1]) * q];
      var up = pts.slice(0, cut).concat([C]), lo = [C].concat(pts.slice(cut));
      var w = 10 + rnd() * 5, col = cols[i % cols.length];
      var gu = el("g", {}, gUp);
      el("path", { d: pathOf(up), stroke: col, "stroke-width": w, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, gu);
      el("path", { d: pathOf(up), stroke: "#a26f55", "stroke-width": 1.6, fill: "none", "stroke-linecap": "round", opacity: .55, transform: "translate(" + (w * .18).toFixed(1) + " 0)" }, gu);
      var gl = el("g", {}, gLo);
      el("path", { d: pathOf(lo), stroke: col, "stroke-width": w, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, gl);
      el("path", { d: pathOf(lo), stroke: "#a26f55", "stroke-width": 1.6, fill: "none", "stroke-linecap": "round", opacity: .55, transform: "translate(" + (w * .18).toFixed(1) + " 0)" }, gl);
      massUp.push([rx, ry]); massLoTop.push(C); massLoBot.push(pts[pts.length - 1]);
      strands.push({ g: gl, cx: C[0], cy: C[1], fallen: false, t0: 0, vx: 0, vy: 0, vr: 0, x: 0, y: 0, r: 0, o: 1 });
    }
    // dunkle Haarmasse hinter den Strähnen, damit keine Lücken entstehen
    function poly(a, b) { return pathOf(a.concat(b.slice().reverse())) + " Z"; }
    var upMass = el("path", { d: poly(massUp, massLoTop), fill: "#3a2219" }); gUp.insertBefore(upMass, gUp.firstChild);
    var loMass = el("path", { d: poly(massLoTop, massLoBot), fill: "#3a2219" }); gLo.insertBefore(loMass, gLo.firstChild);
    // Glanzlicht über dem Oberkopf
    el("path", { d: "M244 168 C276 140 330 136 370 160", stroke: "#c08a6e", "stroke-width": 6, fill: "none", "stroke-linecap": "round", opacity: .5 }, gUp);

    var bits = [];
    function spawnBits(x, y) {
      for (var j = 0; j < 5; j++) {
        var b = el("path", { d: "M0 0 l" + (4 + rnd() * 6).toFixed(1) + " " + (rnd() * 3).toFixed(1), stroke: cols[j % 6], "stroke-width": 2, "stroke-linecap": "round" }, gBits);
        bits.push({ e: b, x: x + (rnd() - .5) * 14, y: y, vx: (rnd() - .5) * 90, vy: -40 - rnd() * 60, r: rnd() * 360, vr: (rnd() - .5) * 600, o: 1 });
      }
    }

    var X0 = 482, X1 = 262, T_COMB = 1700, T_IN = 2000, T_CUT = 5800, T_END = 6600, raf = 0, start = 0, last = 0, played = false, lastSnip = -1;
    function setStep(n) { steps.forEach(function (li, i) { li.classList.toggle("is-on", i === n); }); }
    function reset() {
      cancelAnimationFrame(raf);
      strands.forEach(function (s) { s.fallen = false; s.x = s.y = s.r = 0; s.o = 1; s.g.removeAttribute("transform"); s.g.style.opacity = 1; });
      bits.forEach(function (b) { b.e.remove(); }); bits = [];
      done.classList.remove("on"); sparks.forEach(function (s) { s.classList.remove("on"); });
      gUp.classList.remove("bob-bounce"); loMass.style.opacity = 1; comb.setAttribute("opacity", 0); sc.setAttribute("opacity", 0); lastSnip = -1;
    }
    function finalState() {
      reset();
      strands.forEach(function (s) { s.g.style.opacity = 0; }); loMass.style.opacity = 0;
      done.classList.add("on"); setStep(2);
    }
    function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function frame(now) {
      var t = now - start, dt = Math.min(0.05, (now - last) / 1000); last = now;
      // 1) Kamm gleitet zweimal durch das Haar
      if (t < T_COMB) {
        var c = (t / T_COMB) * 2 % 1, cy = 270 + ease(c) * 210, cx = 400 + ease(c) * 30;
        comb.setAttribute("opacity", Math.min(1, Math.sin(c * Math.PI) * 2.2).toFixed(2));
        comb.setAttribute("transform", "translate(" + cx.toFixed(1) + " " + cy.toFixed(1) + ") rotate(-8)");
        setStep(0);
      } else comb.setAttribute("opacity", 0);
      // 2) Schere: fährt die Schnittlinie entlang und schnippt
      if (t >= T_COMB && t < T_END) {
        setStep(t < T_CUT ? 1 : 2);
        var p = Math.max(0, Math.min(1, (t - T_IN) / (T_CUT - T_IN))), x = X0 + (X1 - X0) * p;
        var y = cutY(x), op = t < T_IN ? (t - T_COMB) / (T_IN - T_COMB) : (t > T_CUT ? 1 - (t - T_CUT) / (T_END - T_CUT) : 1);
        var lift = t > T_CUT ? (t - T_CUT) / (T_END - T_CUT) : 0;
        var phase = (t - T_IN) / 300, ang = t < T_IN ? 18 : 18 * (0.5 + 0.5 * Math.cos(phase * Math.PI * 2));
        if (t > T_CUT) ang = 18 * lift;
        sc.setAttribute("opacity", Math.max(0, op).toFixed(2));
        // Drehpunkt rechts vom Schnittpunkt; Klingen zeigen in Fahrtrichtung
        sc.setAttribute("transform", "translate(" + (x + 46 - lift * 40).toFixed(1) + " " + (y - 4 - lift * 80).toFixed(1) + ") rotate(" + (-9 - lift * 20).toFixed(1) + ")");
        bA.setAttribute("transform", "rotate(" + (-ang / 2).toFixed(2) + ")");
        bB.setAttribute("transform", "rotate(" + (ang / 2).toFixed(2) + ")");
        var snip = Math.floor(phase);
        if (t >= T_IN && t < T_CUT && snip !== lastSnip && Math.cos(phase * Math.PI * 2) < -0.9) { lastSnip = snip; }
        loMass.style.opacity = t < T_IN ? 1 : Math.max(0, 1 - p * 1.6).toFixed(2);
        // Strähnen, an denen die Schere vorbei ist, fallen
        if (t >= T_IN) strands.forEach(function (s) {
          if (!s.fallen && x <= s.cx + 4) {
            s.fallen = true; s.vx = (rnd() - .35) * 40; s.vy = 10 + rnd() * 30; s.vr = (rnd() - .5) * 70;
            spawnBits(s.cx, s.cy);
          }
        });
      }
      // 3) Physik: Schwerkraft, Luftwiderstand, Drehen, Ausblenden
      strands.forEach(function (s) {
        if (!s.fallen || s.o <= 0) return;
        s.vy += 900 * dt; s.vx *= (1 - 1.2 * dt); s.vy *= (1 - 0.6 * dt);
        s.x += s.vx * dt; s.y += s.vy * dt; s.r += s.vr * dt;
        if (s.y > 90) s.o = Math.max(0, s.o - dt * 1.3);
        s.g.setAttribute("transform", "translate(" + s.x.toFixed(1) + " " + s.y.toFixed(1) + ") rotate(" + s.r.toFixed(1) + " " + s.cx.toFixed(1) + " " + s.cy.toFixed(1) + ")");
        s.g.style.opacity = s.o.toFixed(2);
      });
      bits.forEach(function (b) {
        if (b.o <= 0) return;
        b.vy += 500 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.r += b.vr * dt; b.o -= dt * .8;
        b.e.setAttribute("transform", "translate(" + b.x.toFixed(1) + " " + b.y.toFixed(1) + ") rotate(" + b.r.toFixed(0) + ")");
        b.e.setAttribute("opacity", Math.max(0, b.o).toFixed(2));
      });
      if (t > T_CUT + 200 && !done.classList.contains("on")) {
        done.classList.add("on"); gUp.classList.add("bob-bounce");
        sparks.forEach(function (s, i) { setTimeout(function () { s.classList.add("on"); }, i * 180); });
      }
      if (t < T_END + 1600) raf = requestAnimationFrame(frame);
    }
    function play() { reset(); if (reduce) { finalState(); return; } start = last = performance.now(); raf = requestAnimationFrame(frame); }
    $("#hw-replay").addEventListener("click", play);
    if (reduce) finalState();
    else if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting && !played) { played = true; play(); io.disconnect(); } });
      }, { threshold: 0.45 });
      io.observe(svg);
    } else play();
  })();

  /* ---------- Vorher / Nachher ---------- */
  var ba = $("#ba"), knob = $("#ba-knob");
  if (ba) (function () {
    var pos = 50, drag = false;
    function set(v) {
      pos = Math.max(0, Math.min(100, v));
      ba.style.setProperty("--pos", pos + "%");
      knob.setAttribute("aria-valuenow", Math.round(pos));
      knob.setAttribute("aria-valuetext", Math.round(100 - pos) + " Prozent Nachher sichtbar");
    }
    function fromEvent(e) { var r = ba.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); }
    ba.addEventListener("pointerdown", function (e) { drag = true; ba.setPointerCapture(e.pointerId); fromEvent(e); });
    ba.addEventListener("pointermove", function (e) { if (drag) fromEvent(e); });
    ["pointerup", "pointercancel"].forEach(function (n) { ba.addEventListener(n, function () { drag = false; }); });
    knob.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 10 : 2, m = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step, PageDown: -10, PageUp: 10 };
      if (e.key in m) { e.preventDefault(); set(pos + m[e.key]); }
      else if (e.key === "Home") { e.preventDefault(); set(0); }
      else if (e.key === "End") { e.preventDefault(); set(100); }
    });
    // kleiner Hinweis-Schwenk beim ersten Sichtbarwerden
    if (!reduce && "IntersectionObserver" in window) {
      var o = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return; o.disconnect();
        var t0 = performance.now();
        (function k(now) { var p = Math.min(1, (now - t0) / 1600); if (drag) return; set(50 + Math.sin(p * Math.PI * 2) * 18 * (1 - p)); if (p < 1) requestAnimationFrame(k); })(t0);
      }, { threshold: .6 });
      o.observe(ba);
    }
  })();

  /* ---------- Online-Buchung (Attrappe) ---------- */
  var body = $("#bk-body"), next = $("#bk-next"), back = $("#bk-back"), msg = $("#bk-msg"), stepsUi = $$("#bk-steps li");
  if (body) (function () {
    var services = [
      { id: "d", n: "Damenschnitt", s: "Waschen, Schneiden, Föhnen", p: 49, min: 60 },
      { id: "h", n: "Herrenschnitt", s: "inkl. Styling", p: 29, min: 30 },
      { id: "k", n: "Kinderschnitt", s: "bis 12 Jahre", p: 19, min: 30 },
      { id: "b", n: "Balayage + Schnitt", s: "natürliche Verläufe", p: 159, min: 180 },
      { id: "f", n: "Ansatzfarbe + Föhnen", s: "inkl. Glossing", p: 84, min: 90 },
      { id: "r", n: "Pflege-Ritual", s: "Kopfmassage & Haarkur", p: 25, min: 20 }
    ];
    var people = [
      { id: "l", n: "Lena", s: "Color & Balayage", c: "#b07a6c" },
      { id: "m", n: "Marco", s: "Cuts & Barber", c: "#5f4b45" },
      { id: "s", n: "Sophie", s: "Styling & Hochzeit", c: "#c98d7e" },
      { id: "x", n: "Egal – erste freie Zeit", s: "wir teilen zu", c: "#1b1515" }
    ];
    var WD = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], MON = ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    var state = { step: 0, svc: null, who: null, day: null, time: null };
    function days() {
      var out = [], d = new Date(); d.setHours(12, 0, 0, 0);
      while (out.length < 10) { d.setDate(d.getDate() + 1); var w = d.getDay(); if (w !== 0 && w !== 1) out.push(new Date(d)); }
      return out;
    }
    function slots(day, who) {
      var w = day.getDay(), endH = w === 6 ? 13 : (w === 4 ? 20 : 18.5), startH = w === 6 ? 8 : 9, out = [];
      var h = day.getDate() * 7 + (who ? who.charCodeAt(0) : 1) * 13;
      for (var t = startH; t < endH; t += 0.5) {
        h = (h * 31 + 17) % 97;
        out.push({ t: Math.floor(t) + ":" + (t % 1 ? "30" : "00"), free: h % 3 !== 0 });
      }
      return out;
    }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    function render(focus) {
      var h = "";
      if (state.step === 0) {
        h = '<fieldset data-step><legend tabindex="-1">Welche Leistung darf es sein?</legend><div class="opts">' + services.map(function (s) {
          return '<label class="opt"><input type="radio" name="svc" value="' + s.id + '"' + (state.svc === s.id ? " checked" : "") + '><span><b>' + esc(s.n) + '</b><small>' + esc(s.s) + ' · ca. ' + s.min + ' Min.</small><em>' + s.p + ' €</em></span></label>';
        }).join("") + "</div></fieldset>";
      } else if (state.step === 1) {
        h = '<fieldset data-step><legend tabindex="-1">Bei wem möchten Sie sitzen?</legend><div class="opts">' + people.map(function (p) {
          return '<label class="opt stylist"><input type="radio" name="who" value="' + p.id + '"' + (state.who === p.id ? " checked" : "") + '><span><i style="background:' + p.c + '">' + (p.id === "x" ? "?" : p.n[0]) + '</i><span style="display:flex;flex-direction:column;gap:2px;border:0;padding:0;min-height:0"><b>' + esc(p.n) + '</b><small>' + esc(p.s) + '</small></span></span></label>';
        }).join("") + "</div></fieldset>";
      } else if (state.step === 2) {
        var ds = days(); if (state.day === null) state.day = 0;
        var d = ds[state.day];
        h = '<fieldset data-step><legend tabindex="-1">Wann passt es Ihnen?</legend><p class="sub" style="margin-top:0">' + MON[ds[0].getMonth()] + ' ' + ds[0].getFullYear() + '</p><div class="days" role="radiogroup" aria-label="Tag">' + ds.map(function (x, i) {
          return '<label class="opt"><input type="radio" name="day" value="' + i + '"' + (state.day === i ? " checked" : "") + ' aria-label="' + WD[x.getDay()] + ' ' + x.getDate() + '. ' + MON[x.getMonth()] + '"><span><small>' + WD[x.getDay()] + '</small><b>' + x.getDate() + '</b></span></label>';
        }).join("") + '</div><p class="sub">Freie Zeiten am ' + WD[d.getDay()] + ', ' + d.getDate() + '. ' + MON[d.getMonth()] + '</p><div class="slots">' + slots(d, state.who).map(function (s) {
          return '<label class="opt"><input type="radio" name="time" value="' + s.t + '"' + (s.free ? "" : " disabled") + (state.time === s.t ? " checked" : "") + ' aria-label="' + s.t + ' Uhr' + (s.free ? "" : ", vergeben") + '"><span>' + s.t + '</span></label>';
        }).join("") + "</div></fieldset>";
      } else {
        var sv = services.filter(function (s) { return s.id === state.svc; })[0], pp = people.filter(function (p) { return p.id === state.who; })[0], dd = days()[state.day];
        h = '<fieldset data-step><legend tabindex="-1">Fast geschafft!</legend><dl class="sum"><div><dt>Leistung</dt><dd>' + esc(sv.n) + '</dd></div><div><dt>Bei</dt><dd>' + esc(pp.n) + '</dd></div><div><dt>Termin</dt><dd>' + WD[dd.getDay()] + ', ' + dd.getDate() + '. ' + MON[dd.getMonth()] + ' · ' + state.time + ' Uhr</dd></div><div><dt>Preis</dt><dd>' + sv.p + ' € · ca. ' + sv.min + ' Min.</dd></div></dl>' +
          '<div class="two"><div class="field"><label for="bk-name">Name</label><input id="bk-name" name="name" autocomplete="name" required></div><div class="field"><label for="bk-tel">Telefon</label><input id="bk-tel" name="tel" type="tel" autocomplete="tel" required></div></div></fieldset>';
      }
      body.innerHTML = h;
      stepsUi.forEach(function (li, i) { li.classList.toggle("is-on", i === state.step); li.classList.toggle("is-done", i < state.step); if (i === state.step) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current"); });
      back.disabled = state.step === 0;
      next.innerHTML = state.step === 3 ? "Verbindlich buchen" : 'Weiter <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      validate();
      if (focus) { var lg = body.querySelector("legend"); if (lg) lg.focus({ preventScroll: true }); }
    }
    function validate() {
      var ok = [state.svc, state.who, state.time, true][state.step];
      next.disabled = !ok;
    }
    body.addEventListener("change", function (e) {
      var t = e.target;
      if (t.name === "svc") state.svc = t.value;
      if (t.name === "who") { state.who = t.value; state.time = null; }
      if (t.name === "day") { state.day = +t.value; state.time = null; render(); body.querySelector('input[name="day"]:checked').focus(); return; }
      if (t.name === "time") state.time = t.value;
      validate();
    });
    next.addEventListener("click", function () {
      if (state.step < 3) { state.step++; msg.classList.remove("on"); render(true); return; }
      submit();
    });
    back.addEventListener("click", function () { if (state.step > 0) { state.step--; render(true); } });
    function submit() { msg.textContent = DEMO_MSG; msg.classList.add("on"); }
    $("#bk-form").addEventListener("submit", function (e) { e.preventDefault(); if (state.step === 3) submit(); });
    render();
  })();

  /* ---------- Öffnungszeiten: heute & Status ---------- */
  (function () {
    var H = { 0: null, 1: null, 2: [9, 18.5], 3: [9, 18.5], 4: [9, 20], 5: [9, 18.5], 6: [8, 13] };
    var now = new Date(), d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
    var row = $('#htab tr[data-d="' + d + '"]'); if (row) row.classList.add("today");
    var st = $("#open-status"), r = H[d], open = r && h >= r[0] && h < r[1];
    st.classList.toggle("open", !!open);
    st.querySelector("span").textContent = open ? "Jetzt geöffnet – bis " + fmt(r[1]) + " Uhr" : "Gerade geschlossen – online buchen geht immer";
    function fmt(x) { return Math.floor(x) + ":" + (x % 1 ? "30" : "00"); }
  })();
})();
