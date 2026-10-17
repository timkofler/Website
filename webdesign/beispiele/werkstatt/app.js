// KFZ Steiner – Beispielseite von tim-kofler.at
// Navigation, Öffnungsstatus, Formular und die Signatur-Animation „Reifenwechsel“.
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var NS = "http://www.w3.org/2000/svg";

  // Höhe der Hinweisleiste -> Sticky-Navigation darunter
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

  // Öffnungsstatus (Mo–Fr 7:30–17:00)
  var now = new Date(), d = now.getDay(), m = now.getHours() * 60 + now.getMinutes();
  var open = d >= 1 && d <= 5 && m >= 450 && m < 1020, st = $("#status");
  if (st) {
    var txt;
    if (open) txt = "Jetzt geöffnet · bis 17:00";
    else if (d >= 1 && d <= 5 && m < 450) txt = "Geschlossen · öffnet heute 7:30";
    else if (d >= 1 && d <= 4) txt = "Geschlossen · öffnet morgen 7:30";
    else txt = "Geschlossen · öffnet Montag 7:30";
    st.querySelector("span").textContent = txt;
    if (!open) st.classList.add("closed");
  }
  var row = document.querySelector('#hours tr[data-d="' + (d === 0 ? 6 : d) + '"]');
  if (row) row.classList.add("today");

  // Countdown bis zur Winterreifen-Saison
  var cd = $("#countdown");
  if (cd) {
    var y = now.getFullYear(), start = new Date(y, 10, 1), end = new Date(y, 3, 16);
    if (now >= start || now < end) cd.innerHTML = "läuft<small>bis 15. April</small>";
    else { var days = Math.ceil((start - now) / 864e5); cd.innerHTML = "noch " + days + "<small>" + (days === 1 ? "Tag" : "Tage") + "</small>"; }
  }

  // Formular: nichts absenden
  var form = $("#bookForm"), msg = $("#msg");
  var dt = $("#dt"); if (dt) { var t = new Date(now.getTime() + 864e5); dt.min = t.toISOString().slice(0, 10); }
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); msg.classList.remove("show"); void msg.offsetWidth; msg.classList.add("show"); });
  var kz = $("#kz"); if (kz) kz.addEventListener("input", function () { kz.value = kz.value.toUpperCase().replace(/[^A-Z0-9ÄÖÜ \-]/g, ""); });

  // ---------------------------------------------------------------
  // Signatur-Animation: Reifenwechsel
  // ---------------------------------------------------------------
  var ov = $("#carOv"), lens = $("#lens"), gauge = $("#gauge");
  if (!ov || !lens) return;

  function P(a, r) { var t = (a - 90) * Math.PI / 180; return [+(r * Math.cos(t)).toFixed(2), +(r * Math.sin(t)).toFixed(2)]; }
  function arc(r, a0, a1) { var p0 = P(a0, r), p1 = P(a1, r); return "M" + p0 + "A" + r + " " + r + " 0 " + (a1 - a0 > 180 ? 1 : 0) + " 1 " + p1; }

  function defs(id) {
    return '<defs>' +
      '<radialGradient id="' + id + 'well"><stop offset="0" stop-color="#16181b"/><stop offset=".75" stop-color="#0b0c0d"/><stop offset="1" stop-color="#050505"/></radialGradient>' +
      '<linearGradient id="' + id + 'disc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a3aab1"/><stop offset=".5" stop-color="#5b6168"/><stop offset="1" stop-color="#8e959c"/></linearGradient>' +
      '<linearGradient id="' + id + 'rimS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbfcfd"/><stop offset=".55" stop-color="#c3c9cf"/><stop offset="1" stop-color="#8a9198"/></linearGradient>' +
      '<linearGradient id="' + id + 'rimW" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6a7178"/><stop offset=".5" stop-color="#3a3f45"/><stop offset="1" stop-color="#24272b"/></linearGradient>' +
      '<radialGradient id="' + id + 'tire"><stop offset=".78" stop-color="#26292d"/><stop offset=".9" stop-color="#17191b"/><stop offset="1" stop-color="#0b0c0d"/></radialGradient>' +
      '<path id="' + id + 'sw" d="' + arc(45.6, 200, 520) + '"/>' +
      '</defs>';
  }
  function brake(id) {
    var s = '<circle r="54.5" fill="url(#' + id + 'well)"/>';
    s += '<circle r="37" fill="url(#' + id + 'disc)"/><circle r="37" fill="none" stroke="#3a3f45" stroke-width="1.2"/><circle r="24" fill="none" stroke="#454b52" stroke-width="1"/>';
    for (var i = 0; i < 36; i++) { var p = P(i * 10 + (i % 3) * 3, 27 + (i % 3) * 3.5); s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.1" fill="#2a2e33"/>'; }
    s += '<path d="' + arc(31, 212, 262) + '" stroke="#ffb81c" stroke-width="13" stroke-linecap="round" fill="none"/>';
    s += '<path d="' + arc(31, 218, 256) + '" stroke="#d99a10" stroke-width="5" stroke-linecap="round" fill="none"/>';
    s += '<circle r="17" fill="#4a5056"/><circle r="15" fill="#6b7279"/><circle r="6" fill="#3a3f45"/>';
    for (var j = 0; j < 5; j++) { var q = P(j * 72, 11); s += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="2.1" fill="#24272b"/>'; }
    return s;
  }
  function spoke(a, r0, r1, w0, w1) {
    var a0 = P(a - w0, r0), a1 = P(a + w0, r0), b0 = P(a - w1, r1), b1 = P(a + w1, r1);
    return "M" + a0 + "L" + b0 + "L" + b1 + "L" + a1 + "Z";
  }
  function wheel(id, winter) {
    var s = "", i;
    if (!winter) {
      s += '<circle r="52" fill="url(#' + id + 'tire)"/><circle r="51.6" fill="none" stroke="#2c2f33" stroke-width=".6"/>';
      s += '<circle r="49.4" fill="none" stroke="#2f3236" stroke-width=".5"/>';
      s += '<text font-family="Inter,sans-serif" font-size="4" font-weight="700" fill="#555b62" letter-spacing=".6"><textPath href="#' + id + 'sw">SOMMER · 225/45 R18 · DOT 2019</textPath></text>';
      s += '<circle r="40" fill="none" stroke="url(#' + id + 'rimS)" stroke-width="3.6"/><circle r="38" fill="none" stroke="#6b7279" stroke-width="1"/>';
      var sp = "";
      for (i = 0; i < 10; i++) sp += spoke(i * 36, 14, 38.8, 9, 3.6);
      s += '<path d="' + sp + '" fill="url(#' + id + 'rimS)" stroke="#7e858c" stroke-width=".5"/>';
      for (i = 0; i < 10; i++) { var h = P(i * 36 + 18, 39.2); s += '<circle cx="' + h[0] + '" cy="' + h[1] + '" r=".7" fill="#7e858c"/>'; }
      s += '<circle r="16" fill="url(#' + id + 'rimS)" stroke="#8d949b" stroke-width=".6"/><circle r="6" fill="#2b2f34" stroke="#9aa1a8" stroke-width=".8"/>';
    } else {
      s += '<circle r="50.6" fill="url(#' + id + 'tire)"/>';
      var bl = "";
      for (i = 0; i < 52; i++) {
        var a = i * (360 / 52), o = (i % 2) ? 1.2 : 0;
        bl += '<rect x="-2.3" y="' + (-53.4 + o) + '" width="4.6" height="' + (5.2 - o) + '" rx=".7" transform="rotate(' + a.toFixed(2) + ')"/>';
      }
      s += '<g fill="#1c1e21">' + bl + '</g>';
      var sip = "";
      for (i = 0; i < 52; i++) { var p0 = P(i * (360 / 52) + 1.6, 52.6), p1 = P(i * (360 / 52) + .4, 50.2); sip += "M" + p0 + "L" + p1; }
      s += '<path d="' + sip + '" stroke="#0b0c0d" stroke-width=".45"/>';
      s += '<circle r="48.6" fill="none" stroke="#0e0f10" stroke-width="1"/>';
      s += '<text font-family="Inter,sans-serif" font-size="4" font-weight="800" fill="#7b828a" letter-spacing=".6"><textPath href="#' + id + 'sw">WINTER · M+S · 225/45 R18 · 8 mm</textPath></text>';
      var sf = P(150, 45.6);
      s += '<g transform="translate(' + sf + ') rotate(150)" stroke="#a9d8ff" stroke-width=".7" stroke-linecap="round"><path d="M0-3.2v6.4M-2.8-1.6l5.6 3.2M2.8-1.6l-5.6 3.2"/></g>';
      s += '<circle r="40" fill="none" stroke="#3b4046" stroke-width="3.8"/><circle r="41.7" fill="none" stroke="#c3c9cf" stroke-width=".6"/><circle r="38" fill="none" stroke="#24272b" stroke-width="1"/>';
      var sp2 = "";
      for (i = 0; i < 5; i++) { sp2 += spoke(i * 72 - 8, 14, 38.8, 9, 3.4) + spoke(i * 72 + 8, 14, 38.8, 9, 3.4); }
      s += '<path d="' + sp2 + '" fill="url(#' + id + 'rimW)" stroke="#a3aab1" stroke-width=".45"/>';
      s += '<circle r="16" fill="url(#' + id + 'rimW)" stroke="#a3aab1" stroke-width=".5"/><circle r="6" fill="#1b1d20" stroke="#ffb81c" stroke-width=".9"/>';
    }
    return s;
  }
  function bolts(id) {
    var s = "";
    for (var i = 0; i < 5; i++) {
      var p = P(i * 72, 11), hex = "";
      for (var k = 0; k < 6; k++) { var h = P(k * 60 + 30, 2.7); hex += (k ? "L" : "M") + h; }
      s += '<g transform="translate(' + p + ')"><g class="bolt" data-i="' + i + '"><path d="' + hex + 'Z" fill="#dfe3e7" stroke="#6b7279" stroke-width=".45"/><circle r="1.2" fill="#9aa1a8"/><path d="M-1.2 0h2.4" stroke="#6b7279" stroke-width=".4"/></g></g>';
    }
    return s;
  }
  function build(svg, id, cx, cy) {
    svg.innerHTML = defs(id) + '<g transform="translate(' + cx + ' ' + cy + ')">' +
      '<g class="brk">' + brake(id) + '</g>' +
      '<g class="w-old"><g>' + wheel(id, false) + '</g></g>' +
      '<g class="w-new" style="opacity:0"><g>' + wheel(id, true) + '</g></g>' +
      '<g class="bls">' + bolts(id) + '</g></g>';
  }
  build(ov, "cv", 627, 183);
  build(lens, "ln", 0, 0);
  // Linse: Kotflügel, Fadenkreuz, Rahmen
  lens.insertAdjacentHTML("afterbegin", '<clipPath id="lnClip"><circle r="72"/></clipPath>');
  var lg = document.createElementNS(NS, "g"); lg.setAttribute("clip-path", "url(#lnClip)");
  while (lens.childNodes.length > 1) lg.appendChild(lens.childNodes[1]);
  lens.appendChild(lg);
  lg.insertAdjacentHTML("afterbegin", '<rect x="-80" y="-80" width="160" height="160" fill="#0d0f11"/><path d="M-80 -80H80V-8A66 66 0 0 0 -80 -8z" fill="#1d2126"/><path d="' + arc(60, 268, 452) + '" stroke="#2c3238" stroke-width="2" fill="none"/>');
  lens.insertAdjacentHTML("beforeend", '<g stroke="#ffb81c" stroke-width=".6" opacity=".55" fill="none"><path d="M-72 0h10M62 0h10M0-72v10M0 62v10"/><circle r="72"/></g>');

  // Drehmoment-Anzeige
  var G0 = -115, G1 = 115, GMAX = 150;
  function gA(nm) { return G0 + (nm / GMAX) * (G1 - G0); }
  if (gauge) {
    var g = '<g transform="translate(60 56)"><path d="' + arc(44, G0, G1) + '" fill="none" stroke="#262a30" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="' + arc(44, gA(110), gA(130)) + '" fill="none" stroke="#ffb81c" stroke-width="7"/>';
    for (var n = 0; n <= GMAX; n += 15) {
      var a0 = P(gA(n), 34), a1 = P(gA(n), n % 30 ? 31 : 28);
      g += '<path d="M' + a0 + 'L' + a1 + '" stroke="' + (n === 120 ? "#ffb81c" : "#59616a") + '" stroke-width="1.4"/>';
      if (n % 30 === 0) { var tp = P(gA(n), 21); g += '<text x="' + tp[0] + '" y="' + (tp[1] + 2.4) + '" text-anchor="middle" font-family="Inter,sans-serif" font-size="6.5" font-weight="600" fill="#7d858e">' + n + '</text>'; }
    }
    g += '<g id="needle" style="transform:rotate(' + G0 + 'deg)"><circle r="40" fill="none"/><path d="M-2.2 5 0-40 2.2 5z" fill="#f2f2f0"/></g><circle r="5" fill="#ffb81c"/><circle r="1.6" fill="#111"/></g>';
    gauge.innerHTML = g;
  }

  var carImg = $("#carImg"), shadow = $("#carShadow"), jack = $("#jack"), jackLift = $("#jackLift"), jackArm = $("#jackArm"), refl = $("#carRefl"),
    coOld = $("#coOld"), coNew = $("#coNew"), done = $("#done"), needle = $("#needle"),
    nmEl = $("#nm"), minEl = $("#min"), klick = $("#klick"), hud = $("#hudState"),
    steps = document.querySelectorAll("#steps li"), dots = document.querySelectorAll("#boltDots i");
  var oldW = [ov.querySelector(".w-old > g"), lens.querySelector(".w-old > g")];
  var newW = [ov.querySelector(".w-new"), lens.querySelector(".w-new")];
  var newR = [ov.querySelector(".w-new > g"), lens.querySelector(".w-new > g")];
  var boltEls = function (i) { return document.querySelectorAll('.bolt[data-i="' + i + '"]'); };

  var SPEED = reduce ? 0 : 1, live = [], token = 0, timers = [];
  var EASE = "cubic-bezier(.45,0,.2,1)";
  function A(el, kf, dur, opt) {
    var o = { duration: Math.max(0, dur * SPEED), fill: "forwards", easing: EASE };
    if (opt) for (var k in opt) o[k] = opt[k];
    if (opt && opt.delay) o.delay = opt.delay * SPEED;
    var a = el.animate(kf, o); live.push(a); return a.finished;
  }
  function all(list) { return Promise.all(list); }
  function sleep(ms, tk) {
    return new Promise(function (res, rej) {
      var id = setTimeout(function () { tk === token ? res() : rej(new Error("stop")); }, ms * SPEED); timers.push(id);
    });
  }
  function count(el, from, to, ms, tk) {
    return new Promise(function (res) {
      if (!SPEED) { el.textContent = to; return res(); }
      var t0 = null;
      function f(t) {
        if (tk !== token) return res();
        if (!t0) t0 = t; var p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 2);
        el.textContent = Math.round(from + (to - from) * e);
        if (p < 1) requestAnimationFrame(f); else res();
      }
      requestAnimationFrame(f);
    });
  }
  function step(i) {
    steps.forEach(function (li, k) { li.classList.toggle("ok", k < i); li.classList.toggle("act", k === i); });
    var labels = ["aufbocken", "Schrauben lösen", "Rad ab", "Winterrad", "anziehen", "ablassen", "fertig"];
    hud.textContent = labels[i] || "bereit";
  }
  function reset() {
    token++;
    live.forEach(function (a) { try { a.cancel(); } catch (e) {} }); live = [];
    timers.forEach(clearTimeout); timers = [];
    steps.forEach(function (li) { li.classList.remove("ok", "act"); });
    dots.forEach(function (d) { d.classList.remove("on"); });
    done.classList.remove("on");
    nmEl.textContent = "0"; minEl.textContent = "0"; hud.textContent = "bereit";
  }
  var LIFT = "translateY(-4.5%) rotate(-.6deg)";
  var ORDER = [0, 2, 4, 1, 3]; // über Kreuz

  async function run() {
    reset();
    var tk = token;
    try {
      await sleep(250, tk);
      // 1 Aufbocken
      step(0);
      await A(jack, [{ opacity: 0, transform: "translate(-70%,-100%)" }, { opacity: 1, transform: "translate(0,-100%)" }], 650);
      count(minEl, 0, 3, 1100 * SPEED || 1, tk);
      await all([
        A(jackLift, [{ transform: "translate(0,0)" }, { transform: "translate(-5px,-17px)" }], 1100),
        A(jackArm, [{ transform: "rotate(0deg)" }, { transform: "rotate(-20deg)" }], 1100),
        A(refl, [{ opacity: .22 }, { opacity: 0 }], 700),
        A(carImg, [{ transform: "none" }, { transform: LIFT }], 1100),
        A(ov, [{ transform: "none" }, { transform: LIFT }], 1100),
        A(shadow, [{ opacity: 1 }, { opacity: .5 }], 1100)
      ]);
      // 2 Radschrauben lösen
      step(1);
      count(minEl, 3, 8, 1500 * SPEED || 1, tk);
      var outs = [];
      ORDER.forEach(function (b, k) {
        boltEls(b).forEach(function (el) {
          outs.push(A(el, [{ transform: "rotate(0) scale(1)", opacity: 1 }, { transform: "rotate(-300deg) scale(1.35)", opacity: 1, offset: .55 }, { transform: "rotate(-720deg) scale(2)", opacity: 0 }], 520, { delay: k * 230, easing: "cubic-bezier(.5,0,.6,1)" }));
        });
      });
      await all(outs);
      // 3 Sommerrad ab
      step(2);
      A(coOld, [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], 400);
      count(minEl, 8, 11, 1200 * SPEED || 1, tk);
      await all([
        A(oldW[0], [{ transform: "translate(0,0) rotate(0deg)", opacity: 1 }, { transform: "translate(40px,0) rotate(0deg)", opacity: 1, offset: .2 }, { transform: "translate(330px,14px) rotate(330deg)", opacity: 0 }], 1500, { easing: "cubic-bezier(.5,0,.7,1)" }),
        A(oldW[1], [{ transform: "translate(0,0) rotate(0deg)", opacity: 1 }, { transform: "translate(20px,0) rotate(0deg)", opacity: 1, offset: .2 }, { transform: "translate(170px,6px) rotate(170deg)", opacity: 0 }], 1500, { easing: "cubic-bezier(.5,0,.7,1)" })
      ]);
      await sleep(350, tk);
      A(coOld, [{ opacity: 1 }, { opacity: 0 }], 300);
      // 4 Winterrad drauf
      step(3);
      A(coNew, [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], 400, { delay: 300 });
      count(minEl, 11, 15, 1500 * SPEED || 1, tk);
      await all([
        A(newW[0], [{ opacity: 0 }, { opacity: 1 }], 500),
        A(newW[1], [{ opacity: 0 }, { opacity: 1 }], 500),
        A(newR[0], [{ transform: "translate(340px,14px) rotate(374deg)" }, { transform: "translate(30px,0) rotate(33deg)", offset: .85 }, { transform: "translate(0,0) rotate(0deg)" }], 1600, { easing: "cubic-bezier(.2,.6,.3,1)" }),
        A(newR[1], [{ transform: "translate(170px,6px) rotate(187deg)" }, { transform: "translate(15px,0) rotate(16deg)", offset: .85 }, { transform: "translate(0,0) rotate(0deg)" }], 1600, { easing: "cubic-bezier(.2,.6,.3,1)" })
      ]);
      // 5 Anziehen über Kreuz mit 120 Nm
      step(4);
      count(minEl, 15, 22, 3000 * SPEED || 1, tk);
      for (var k = 0; k < ORDER.length; k++) {
        var b = ORDER[k], ins = [];
        boltEls(b).forEach(function (el) {
          ins.push(A(el, [{ transform: "rotate(-720deg) scale(2)", opacity: 0 }, { transform: "rotate(-200deg) scale(1.2)", opacity: 1, offset: .5 }, { transform: "rotate(0deg) scale(1)", opacity: 1 }], 360, { easing: "cubic-bezier(.3,0,.3,1)" }));
        });
        await all(ins);
        count(nmEl, 0, 120, 260 * SPEED || 1, tk);
        await A(needle, [{ transform: "rotate(" + G0 + "deg)" }, { transform: "rotate(" + gA(120) + "deg)" }], 260, { easing: "cubic-bezier(.4,0,.9,.6)" });
        dots[k].classList.add("on");
        boltEls(b).forEach(function (el) { A(el, [{ filter: "none", transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }], 220); });
        A(klick, [{ opacity: 0, transform: "scale(.6)" }, { opacity: 1, transform: "scale(1.15)", offset: .3 }, { opacity: 1, transform: "scale(1)", offset: .7 }, { opacity: 0, transform: "scale(1)" }], 520);
        await sleep(180, tk);
        A(needle, [{ transform: "rotate(" + gA(120) + "deg)" }, { transform: "rotate(" + G0 + "deg)" }], 220, { easing: "ease-in" });
        if (k < ORDER.length - 1) await sleep(120, tk);
      }
      nmEl.textContent = "120";
      A(coNew, [{ opacity: 1 }, { opacity: 0 }], 300);
      // 6 Ablassen
      step(5);
      count(minEl, 22, 25, 1000 * SPEED || 1, tk);
      await all([
        A(jackLift, [{ transform: "translate(-5px,-17px)" }, { transform: "translate(0,0)" }], 1000),
        A(jackArm, [{ transform: "rotate(-20deg)" }, { transform: "rotate(0deg)" }], 1000),
        A(refl, [{ opacity: 0 }, { opacity: .22 }], 900, { delay: 300 }),
        A(carImg, [{ transform: LIFT }, { transform: "none" }], 1000, { easing: "cubic-bezier(.3,0,.2,1.25)" }),
        A(ov, [{ transform: LIFT }, { transform: "none" }], 1000, { easing: "cubic-bezier(.3,0,.2,1.25)" }),
        A(shadow, [{ opacity: .5 }, { opacity: 1 }], 1000)
      ]);
      A(jack, [{ opacity: 1, transform: "translate(0,-100%)" }, { opacity: 0, transform: "translate(-70%,-100%)" }], 600);
      step(6);
      minEl.textContent = "25";
      A(done, [{ opacity: 0, transform: "translate(-50%,-40%) scale(.9)" }, { opacity: 1, transform: "translate(-50%,-50%) scale(1)" }], 500, { easing: "cubic-bezier(.2,1.4,.4,1)" });
      done.classList.add("on");
    } catch (e) { /* neu gestartet */ }
  }

  var stage = $("#stage"), started = false;
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting && !started) { started = true; run(); io.disconnect(); }
    }, { threshold: .45 });
    io.observe(stage);
  } else run();
  $("#replay").addEventListener("click", function () { started = true; run(); });
  // 3D-Explosionsansicht: Three.js wird erst geladen, wenn der Abschnitt näher kommt
  var x3 = $("#zerlegt"), gl = false;
  try { var tc = document.createElement("canvas"); gl = !!(window.WebGLRenderingContext && (tc.getContext("webgl2") || tc.getContext("webgl"))); } catch (e) {}
  if (x3 && gl && "IntersectionObserver" in window) {
    x3.classList.add("is-3d");
    var io3 = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io3.disconnect();
      import("/beispiele/werkstatt/auto3d.js?v=20261017e").then(function (m) {
        if (!m.start(x3)) x3.classList.remove("is-3d");
      }).catch(function () { x3.classList.remove("is-3d"); });
    }, { rootMargin: "800px 0px" });
    io3.observe(x3);
  }
})();
