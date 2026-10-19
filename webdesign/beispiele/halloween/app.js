// Spukhof: Countdown, Fledermäuse, Blitze, Spinne, Sarg beim Scrollen, Gäste, Taschenlampe, Kürbisse, Kerzen, Hexe, Tickets, Sound.
// Alles ohne Bibliotheken, alles ohne Tracking. Bei "weniger Bewegung" bleibt vieles still.
(function () {
  var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var fine = !!(window.matchMedia && matchMedia("(pointer: fine)").matches);
  var BAR = 45, $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return document.querySelectorAll(s); };
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function damp(cur, to, k, dt) { return cur + (to - cur) * (1 - Math.exp(-k * dt)); }
  function onView(els, cb, th, once) {
    if (!("IntersectionObserver" in window)) { els.forEach(cb); return; }
    var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { cb(e.target); if (once !== false) o.unobserve(e.target); } }); }, { threshold: th || .3 });
    els.forEach(function (el) { o.observe(el); });
  }

  // ---------- Titel: Buchstaben einzeln, damit sie zittern ----------
  $$("[data-split]").forEach(function (el) {
    var t = el.textContent; el.textContent = "";
    t.split("").forEach(function (c, i) { var s = document.createElement("span"); s.className = "ch"; s.style.setProperty("--i", i); s.textContent = c; el.appendChild(s); });
  });

  // ---------- Countdown bis zum nächsten 31. Oktober, 19 Uhr ----------
  var cd = { d: $("#cd-d"), h: $("#cd-h"), m: $("#cd-m"), s: $("#cd-s") };
  function target() { var n = new Date(), t = new Date(n.getFullYear(), 9, 31, 19, 0, 0); if (t < n) t = new Date(n.getFullYear() + 1, 9, 31, 19, 0, 0); return t; }
  var T = target();
  function tickCd() {
    var ms = Math.max(0, T - Date.now()), s = Math.floor(ms / 1000);
    cd.d.textContent = String(Math.floor(s / 86400)).padStart(2, "0"); cd.h.textContent = String(Math.floor(s / 3600) % 24).padStart(2, "0");
    cd.m.textContent = String(Math.floor(s / 60) % 60).padStart(2, "0"); cd.s.textContent = String(s % 60).padStart(2, "0");
  }
  tickCd(); setInterval(tickCd, 1000);

  // ---------- Fledermäuse auf einer Leinwand, weichen der Maus aus ----------
  var cv = $("#bats"), ctx = cv.getContext("2d"), bats = [], mx = -999, my = -999, W = 0, H = 0;
  function sizeBats() { W = cv.width = cv.clientWidth; H = cv.height = cv.clientHeight; }
  sizeBats(); addEventListener("resize", sizeBats);
  var NB = innerWidth < 700 ? 14 : 26;
  for (var i = 0; i < NB; i++) bats.push({ x: Math.random() * 1600, y: Math.random() * 500, vx: .6 + Math.random() * 1.2, vy: 0, s: .5 + Math.random() * .8, f: Math.random() * 6, fs: .25 + Math.random() * .25 });
  $("#hero").addEventListener("pointermove", function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
  function drawBat(b, t) {
    var flap = Math.sin(t * 9 * b.fs + b.f) * .9, s = 14 * b.s;
    ctx.save(); ctx.translate(b.x, b.y); ctx.scale(s / 14, s / 14); ctx.fillStyle = "#090612";
    ctx.beginPath(); ctx.ellipse(0, 0, 3.2, 5, 0, 0, 7); ctx.fill();
    [1, -1].forEach(function (d) {
      ctx.save(); ctx.scale(d, 1); ctx.rotate(flap * .5);
      ctx.beginPath(); ctx.moveTo(2, -1); ctx.quadraticCurveTo(10, -14, 24, -8); ctx.quadraticCurveTo(18, -3, 20, 2); ctx.quadraticCurveTo(14, -1, 12, 4); ctx.quadraticCurveTo(8, 1, 4, 5); ctx.closePath(); ctx.fill(); ctx.restore();
    });
    ctx.restore();
  }
  var heroVis = true;
  onView([$("#hero")], function () {}, 0, false);
  new IntersectionObserver(function (es) { heroVis = es[0].isIntersecting; }).observe($("#hero"));
  function batsFrame(t) {
    if (heroVis && !reduce) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < bats.length; i++) {
        var b = bats[i], dx = b.x - mx, dy = b.y - my, dd = dx * dx + dy * dy;
        if (dd < 22000) { var l = Math.sqrt(dd) || 1; b.vx += dx / l * .5; b.vy += dy / l * .5; }
        b.vy += Math.sin(t * .001 + b.f) * .02; b.vy *= .96; b.vx = damp(b.vx, .6 + b.s, .02, 1);
        b.x += b.vx * (1 + b.s); b.y += b.vy;
        if (b.x > W + 40) { b.x = -40; b.y = Math.random() * H * .6; } if (b.y < -20) b.y = -20; if (b.y > H * .8) b.y = H * .8;
        drawBat(b, t * .001);
      }
    }
    requestAnimationFrame(batsFrame);
  }
  requestAnimationFrame(batsFrame);

  // ---------- Blitze in unregelmäßigen Abständen ----------
  var flash = $("#flash"), bolt = $("#bolt");
  function lightning() {
    if (!reduce && heroVis && !document.hidden) {
      bolt.style.left = (10 + Math.random() * 70) + "%";
      flash.classList.remove("is-on"); bolt.classList.remove("is-on"); void flash.offsetWidth;
      flash.classList.add("is-on"); bolt.classList.add("is-on"); thunder();
    }
    setTimeout(lightning, 5000 + Math.random() * 9000);
  }
  setTimeout(lightning, 2500);

  // ---------- Spinne: beim Antippen lässt sie sich fallen ----------
  var spider = $("#spider");
  spider.addEventListener("click", function () {
    spider.style.setProperty("--spy", (30 + Math.random() * 30) + "vh"); spider.classList.add("is-drop"); squeak();
    setTimeout(function () { spider.classList.remove("is-drop"); }, 2600);
  });

  // ---------- Sarg: Fortschritt im Abschnitt → wackeln, Deckel auf, Vampir steigt auf ----------
  var cofSec = $("#sarg"), cof = $("#cof"), cofBar = $("#cofbar"), pos = {};
  var band = $(".band__track"), bandSec = $(".band");
  function measure() {
    var r = cofSec.getBoundingClientRect(); pos.cof = { top: r.top + scrollY, h: r.height, span: Math.max(1, r.height - (innerHeight - BAR)) };
    var b = bandSec.getBoundingClientRect(); pos.band = { top: b.top + scrollY, h: b.height };
  }
  measure(); addEventListener("resize", measure); addEventListener("load", measure);
  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(document.body);
  var S = { cof: 0, vel: 0, band: 0 }, lastY = scrollY, last = performance.now(), nav = $("#nav"), navSolid = false, stage2 = false, creaked = false;
  var links = $$(".nav__l a"), linkOn = -1;
  function tick(now) {
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    var y = scrollY, vh = innerHeight, v = dt > 0 ? (y - lastY) / dt : 0; lastY = y;
    S.vel = damp(S.vel, clamp(v, -4000, 4000), 6, dt);
    if ((y > 10) !== navSolid) { navSolid = y > 10; nav.classList.toggle("is-solid", navSolid); }
    var on = -1; links.forEach(function (a, k) { var t = $(a.getAttribute("href")); if (t && t.getBoundingClientRect().top < vh * .4) on = k; });
    if (on !== linkOn) { linkOn = on; links.forEach(function (a, k) { a.classList.toggle("is-cur", k === on); }); }
    if (!reduce) {
      var p = pos.cof ? clamp((y - pos.cof.top + BAR) / pos.cof.span, 0, 1) : 0;
      S.cof = damp(S.cof, p, 7, dt);
      if (y + vh > pos.cof.top && y < pos.cof.top + pos.cof.h) {
        var q = S.cof;
        // 0–.3 wackeln, .3–.6 Deckel geht auf, .5–1 Vampir steigt heraus.
        var shake = q < .32 ? Math.sin(now * .04) * 6 * clamp(q / .1, 0, 1) * (1 - clamp((q - .22) / .1, 0, 1)) : 0;
        var lid = clamp((q - .3) / .3, 0, 1), le = 1 - Math.pow(1 - lid, 3);
        var vp = clamp((q - .5) / .4, 0, 1), ve = 1 - Math.pow(1 - vp, 2);
        cof.style.setProperty("--shx", shake.toFixed(1) + "px"); cof.style.setProperty("--shr", (shake * .3).toFixed(2) + "deg");
        cof.style.setProperty("--lid", (-le * 150).toFixed(1) + "deg");
        cof.style.setProperty("--vy", (70 - ve * 70).toFixed(1) + "%"); cof.style.setProperty("--vs", (.8 + ve * .3).toFixed(3));
        cof.style.setProperty("--mist", le.toFixed(2));
        cofBar.style.transform = "scaleX(" + q.toFixed(3) + ")";
        if ((q > .45) !== stage2) { stage2 = q > .45; cofSec.classList.toggle("is-s2", stage2); }
        if (lid > .05 && !creaked) { creaked = true; creak(); }
        if (lid < .02) creaked = false;
      }
      if (pos.band && y + vh > pos.band.top - 200 && y < pos.band.top + pos.band.h + 200) {
        S.band -= (50 + Math.abs(S.vel) * .3) * dt * (S.vel < -5 ? -1 : 1);
        var w = band.scrollWidth / 2; if (w) S.band = ((S.band % w) - w) % w;
        band.style.transform = "translate3d(" + S.band.toFixed(1) + "px,0,0)";
      }
    }
    if (tk.on) { tk.cx = damp(tk.cx, tk.x, 12, dt); tk.cy = damp(tk.cy, tk.y, 12, dt); dark.style.setProperty("--tx", tk.cx.toFixed(1) + "px"); dark.style.setProperty("--ty", tk.cy.toFixed(1) + "px"); }
    requestAnimationFrame(tick);
  }

  // ---------- Gäste: Antippen hält die Reaktion kurz fest (für Handy ohne Hover) ----------
  $$(".mon").forEach(function (m) {
    function go() { m.classList.add("is-on"); growl(m.className); clearTimeout(m._t); m._t = setTimeout(function () { m.classList.remove("is-on"); }, 1800); }
    m.addEventListener("click", go);
    m.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });

  // ---------- Taschenlampe ----------
  var torch = $("#torch"), dark = $("#dark"), tk = { on: false, x: 0, y: 0, cx: 0, cy: 0 };
  function torchPos(e) { var r = torch.getBoundingClientRect(); tk.x = e.clientX - r.left; tk.y = e.clientY - r.top; if (!tk.on) { tk.cx = tk.x; tk.cy = tk.y; } tk.on = true; torch.classList.add("is-lit"); }
  torch.addEventListener("pointermove", torchPos); torch.addEventListener("pointerdown", torchPos);
  torch.addEventListener("pointerleave", function () { tk.on = false; });
  torch.addEventListener("touchmove", function (e) { if (e.cancelable) e.preventDefault(); }, { passive: false });
  if (!fine) { dark.style.setProperty("--r", "130px"); $("#torchhint").textContent = "Finger drauf und durch den Gang wischen. Nicht erschrecken."; }
  // Ohne Maus zeigt die Lampe anfangs ein Stück, damit man weiß, was zu tun ist.
  dark.style.setProperty("--tx", "50%"); dark.style.setProperty("--ty", "60%");

  // ---------- Kürbisse: fünf Gesichter, alle anzünden ----------
  var pks = $("#pks"), FACES = [
    "M66 128l20-24 20 24ZM114 128l20-24 20 24ZM104 148l6-10 6 10ZM58 164q52 46 104 0l-10 4-6 12-10-10-10 12-12-10-12 10-10-12-10 10-6-12Z",
    "M62 120l26-10 2 26ZM158 120l-26-10-2 26ZM100 150h20l-10 12ZM60 170q50-30 100 0l-8 12-10-8-12 10-10-8-10 8-12-10-10 8-10-8Z",
    "M70 110a14 14 0 1 0 28 0a14 14 0 1 0-28 0ZM122 110a14 14 0 1 0 28 0a14 14 0 1 0-28 0ZM102 140l8-14 8 14ZM74 160q36 40 72 0q-36 12-72 0Z",
    "M64 126l24-16-4 24ZM156 126l-24-16 4 24ZM100 150l10-12 10 12ZM70 170l16-12 8 14 16-16 16 16 8-14 16 12-6 14H76Z",
    "M60 124q24-26 48 0q-24 2-48 0ZM112 124q24-26 48 0q-24 2-48 0ZM102 146l8-10 8 10ZM60 160l16 14 10-14 12 18 12-18 10 14 16-14q-6 34-38 34t-38-34Z"
  ];
  var lit = 0, prize = $("#prize");
  FACES.forEach(function (d, k) {
    var b = document.createElement("button"); b.className = "pk"; b.type = "button"; b.setAttribute("aria-label", "Kürbis " + (k + 1) + " anzünden"); b.setAttribute("aria-pressed", "false");
    b.innerHTML = '<svg viewBox="0 0 220 220" aria-hidden="true"><path d="M104 46c-2-18 6-30 20-36l8 8c-12 6-14 16-12 28Z" fill="#3d5a1e"/><ellipse cx="72" cy="128" rx="54" ry="74" fill="#c9530b"/><ellipse cx="148" cy="128" rx="54" ry="74" fill="#c9530b"/><ellipse cx="110" cy="128" rx="56" ry="80" fill="#f07818"/><path d="M96 56q-8 72 0 148M124 56q8 72 0 148" stroke="#c9530b" stroke-width="3" fill="none"/><path class="pf" d="' + d + '"/></svg>';
    b.addEventListener("click", function () {
      var on = !b.classList.contains("is-lit"); b.classList.toggle("is-lit", on); b.setAttribute("aria-pressed", on); lit += on ? 1 : -1; pop(on);
      if (lit === FACES.length) { prize.innerHTML = "Alle fünf brennen. Du bekommst einen Gratis-Hexenpunsch!<small>Zeig diesen Bildschirm an der Bar. Code: KÜRBIS-666</small>"; batBurst(prize); cackle(); }
      else prize.textContent = lit ? lit + " von 5 … weiter!" : "";
    });
    pks.appendChild(b);
  });
  // Kleiner Fledermausschwarm aus dem Text heraus, als Belohnung.
  function batBurst(from) {
    if (reduce) return;
    var r = from.getBoundingClientRect();
    for (var i = 0; i < 14; i++) {
      var b = document.createElement("i"); b.textContent = "🦇"; b.style.cssText = "position:fixed;left:" + (r.left + r.width / 2) + "px;top:" + (r.top + r.height / 2) + "px;font-size:" + (18 + Math.random() * 22) + "px;z-index:500;pointer-events:none";
      document.body.appendChild(b);
      b.animate([{ transform: "translate(0,0) rotate(0)", opacity: 1 }, { transform: "translate(" + ((Math.random() - .5) * 700) + "px," + (-200 - Math.random() * 400) + "px) rotate(" + ((Math.random() - .5) * 360) + "deg)", opacity: 0 }], { duration: 1400 + Math.random() * 800, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = (function (el) { return function () { el.remove(); }; })(b);
    }
  }

  // ---------- Programm: Kerzen gehen nacheinander an, Hexe fliegt einmal durch ----------
  onView($$("#tl li"), function (li) { li.classList.add("is-lit"); }, .5);
  var witch = $("#witchfly"), flown = false;
  onView([$("#programm")], function () { if (!flown && !reduce) { flown = true; witch.classList.add("is-fly"); cackle(); } }, .2);

  // ---------- Friedhof: Hände kommen beim Sichtbarwerden heraus ----------
  onView([$("#yard")], function (el) { el.classList.add("is-in"); }, .3);

  // ---------- Tickets ----------
  var dlg = $("#tdlg"), tq = $("#tq"), tsum = $("#tsum"), qty = 1, price = 0;
  function eur(n) { return "€ " + n.toFixed(2).replace(".", ","); }
  function sum() { tq.textContent = qty; tsum.textContent = eur(qty * price); }
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-ticket],[data-close],[data-q]"); if (!t) return;
    if (t.dataset.ticket) { price = parseFloat(t.dataset.price); qty = 1; $("#tdlg-h").textContent = t.dataset.ticket; $("#tdone").hidden = true; $("#tdlgform").hidden = false; sum(); dlg.showModal(); }
    else if (t.dataset.q) { qty = clamp(qty + (+t.dataset.q), 1, 13); sum(); }
    else dlg.close();
  });
  $("#tform").addEventListener("submit", function (e) {
    e.preventDefault(); var n = e.target.name.value.trim(); if (!n) { e.target.name.focus(); return; }
    $("#tname").textContent = n; $("#tdlgform").hidden = true; $("#tdone").hidden = false; cackle();
  });

  // ---------- Sound: alles synthetisch (Wind, Donner, Knarzen, Quietschen, Lachen), erst nach Klick ----------
  var AC = window.AudioContext || window.webkitAudioContext, ac = null, wind = null, sndOn = false, sndBtn = $("#snd");
  function audio() { if (!ac && AC) ac = new AC(); if (ac && ac.state === "suspended") ac.resume(); return ac; }
  function noise(dur) { var a = audio(), buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate), d = buf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; var s = a.createBufferSource(); s.buffer = buf; return s; }
  function startWind() {
    var a = audio(); if (!a) return;
    var s = noise(4); s.loop = true; var f = a.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 400; f.Q.value = .6;
    var g = a.createGain(); g.gain.value = .0; s.connect(f); f.connect(g); g.connect(a.destination); s.start();
    var lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = .13; lg.gain.value = 250; lfo.connect(lg); lg.connect(f.frequency); lfo.start();
    g.gain.linearRampToValueAtTime(.06, a.currentTime + 2); wind = { s: s, g: g, lfo: lfo };
  }
  function stopWind() { if (!wind) return; wind.g.gain.linearRampToValueAtTime(0, ac.currentTime + .8); var w = wind; setTimeout(function () { w.s.stop(); w.lfo.stop(); }, 900); wind = null; }
  function thunder() {
    if (!sndOn) return; var a = audio(), s = noise(2.5), f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 120;
    var g = a.createGain(); g.gain.setValueAtTime(.001, a.currentTime); g.gain.exponentialRampToValueAtTime(.5, a.currentTime + .08); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + 2.4);
    s.connect(f); f.connect(g); g.connect(a.destination); s.start();
  }
  function creak() {
    if (!sndOn) return; var a = audio(), o = a.createOscillator(), g = a.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(90, a.currentTime); o.frequency.linearRampToValueAtTime(160, a.currentTime + 1.2); o.frequency.linearRampToValueAtTime(70, a.currentTime + 1.8);
    var f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 500; g.gain.setValueAtTime(.0001, a.currentTime); g.gain.exponentialRampToValueAtTime(.08, a.currentTime + .1); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + 1.9);
    var lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = 18; lg.gain.value = 30; lfo.connect(lg); lg.connect(o.frequency); lfo.start();
    o.connect(f); f.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + 2); lfo.stop(a.currentTime + 2);
  }
  function squeak() { blip(1400, 600, .25, "square", .05); }
  function pop(on) { blip(on ? 300 : 500, on ? 700 : 150, .12, "triangle", .08); }
  function blip(f0, f1, dur, type, vol) {
    if (!sndOn) return; var a = audio(), o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f0, a.currentTime); o.frequency.exponentialRampToValueAtTime(f1, a.currentTime + dur);
    g.gain.setValueAtTime(vol, a.currentTime); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + dur); o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + dur);
  }
  function cackle() { if (!sndOn) return; [0, .13, .26, .42, .6].forEach(function (t, i) { setTimeout(function () { blip(500 - i * 40, 380 - i * 40, .12, "sawtooth", .05); }, t * 1000); }); }
  function growl(cls) {
    if (!sndOn) return;
    if (cls.indexOf("wolf") > -1) blip(180, 420, 1.1, "sawtooth", .07); else if (cls.indexOf("ghost") > -1) blip(600, 250, .8, "sine", .06); else if (cls.indexOf("witch") > -1) cackle();
    else if (cls.indexOf("zombie") > -1) blip(120, 90, .7, "sawtooth", .08); else blip(260, 180, .3, "square", .05);
  }
  sndBtn.addEventListener("click", function () {
    sndOn = !sndOn; sndBtn.setAttribute("aria-pressed", sndOn); sndBtn.querySelector(".snd__ic").textContent = sndOn ? "🔊" : "🔇";
    if (sndOn) startWind(); else stopWind();
  });
  document.addEventListener("visibilitychange", function () { if (document.hidden && wind) stopWind(); else if (!document.hidden && sndOn && !wind) startWind(); });

  requestAnimationFrame(tick);
})();
