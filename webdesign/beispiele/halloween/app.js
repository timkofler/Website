// Gruselnacht in der Villa Hollerbach – Beispiel-Entwurf.
// Alles hier ist Spielerei ohne Server: Videos laufen nur in Sichtweite, Ton erst nach Klick.
(function () {
  var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return document.querySelectorAll(s); };
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function onView(els, cb, th, once) {
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { cb(el, true); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { cb(e.target, e.isIntersecting); if (e.isIntersecting && once) io.unobserve(e.target); }); }, { threshold: th || 0 });
    els.forEach(function (el) { io.observe(el); });
  }

  // ---------- Hintergrundvideos: spielen nur, solange sie im Bild sind ----------
  onView([].slice.call($$(".bgv")), function (v, on) {
    if (on) { if (v.preload === "none") v.preload = "auto"; var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
  }, 0);

  // ---------- Titel: Buchstaben einzeln, damit sie flackern ----------
  $$("[data-split]").forEach(function (el, wi) {
    var t = el.textContent; el.textContent = "";
    t.split("").forEach(function (c, i) { var s = document.createElement("span"); s.className = "ch"; s.style.setProperty("--i", i); s.textContent = c; el.appendChild(s); });
    // Ein paar Tropfen, die aus dem Titel laufen
    if (!reduce) [.12, .31, .5, .72, .9].forEach(function (x, i) { var d = document.createElement("i"); d.className = "drop"; d.style.left = (x * 100) + "%"; d.style.setProperty("--dd", (-(i * 1.3 + wi * .7)) + "s"); el.appendChild(d); });
  });

  // ---------- Schreibmaschine (Kicker im Hero, Brief) ----------
  function typeInto(el, text, speed, done) {
    var i = 0; el.textContent = "";
    (function step() {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(step, speed + (text[i - 1] === "." || text[i - 1] === ":" ? 220 : Math.random() * 40));
      else { el.classList.add("is-done"); if (done) done(); }
    })();
  }
  $$(".type[data-type]").forEach(function (el) { if (reduce) { el.textContent = el.dataset.type; el.classList.add("is-done"); } else setTimeout(function () { typeInto(el, el.dataset.type, 38); }, 600); });

  // Brief: Zeile für Zeile, Buchstabe für Buchstabe
  var letter = $("#letter"), lines = [].slice.call($$("#lbody [data-line]")), typed = false;
  lines.forEach(function (p) { var t = p.textContent; p.textContent = ""; t.split("").forEach(function (c) { var s = document.createElement("span"); s.textContent = c; p.appendChild(s); }); });
  function typeLetter() {
    if (typed) return; typed = true;
    if (reduce) { $$("#lbody span").forEach(function (s) { s.classList.add("is-on"); }); letter.classList.add("is-done"); return; }
    var li = 0;
    (function nextLine() {
      if (li >= lines.length) { letter.classList.add("is-done"); return; }
      var spans = lines[li].children, k = 0;
      (function tick() {
        if (k < spans.length) { spans[k].classList.add("is-on"); if (k % 3 === 0) key(); k++; setTimeout(tick, 22 + Math.random() * 30); }
        else { li++; setTimeout(nextLine, 420); }
      })();
    })();
  }
  onView([letter], function (el, on) { if (on) typeLetter(); }, .35, true);

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

  // ---------- Blitze in unregelmäßigen Abständen, Augen im Dunkel ----------
  var flash = $("#flash"), eyes = $("#eyes"), heroVis = true;
  onView([$("#hero")], function (el, on) { heroVis = on; }, 0);
  function lightning() {
    if (heroVis && !reduce && !document.hidden) { flash.classList.remove("is-on"); void flash.offsetWidth; flash.classList.add("is-on"); thunder(); }
    setTimeout(lightning, 9000 + Math.random() * 14000);
  }
  setTimeout(lightning, 4500);
  function peek() { if (heroVis && !document.hidden) { eyes.classList.add("is-on"); setTimeout(function () { eyes.classList.remove("is-on"); }, 2600 + Math.random() * 2000); } setTimeout(peek, 12000 + Math.random() * 16000); }
  setTimeout(peek, 7000);

  // ---------- Das Grab: Film aus Einzelbildern, läuft mit dem Scrollen ----------
  var gsec = $("#grab"), gpin = gsec.querySelector(".grave__pin"), gc = $("#gravec"), gx = gc.getContext("2d"), gbar = $("#gravebar"), gtxt = [].slice.call($$(".grave__t"));
  var FR = 75, frames = [], gLoaded = false, gShown = -1, gStep = -1, gp = 0, gTarget = 0;
  function loadFrames() {
    if (gLoaded) return; gLoaded = true;
    for (var i = 1; i <= FR; i++) { var im = new Image(); im.decoding = "async"; im.src = "/beispiele/halloween/media/film/f" + String(i).padStart(2, "0") + ".webp"; frames.push(im); }
    frames[0].onload = function () { gShown = -1; };
  }
  function sizeG() { var r = Math.min(1.5, window.devicePixelRatio || 1); gc.width = Math.round(gc.clientWidth * r); gc.height = Math.round(gc.clientHeight * r); gShown = -1; }
  function paintG(p) {
    var n = frames.length; if (!n) return;
    var i = Math.round(p * (n - 1)), im = frames[i];
    if (!im.naturalWidth) { for (var k = i; k >= 0; k--) if (frames[k].naturalWidth) { im = frames[k]; i = k; break; } }
    if (!im.naturalWidth || i === gShown) return; gShown = i;
    var W = gc.width, H = gc.height, iw = im.naturalWidth, ih = im.naturalHeight, mob = W < H;
    var s = mob ? Math.max(W / iw, H / ih) : H / ih, w = iw * s, h = ih * s, X = (W - w) / 2, Y = (H - h) / 2;
    gx.fillStyle = "#000"; gx.fillRect(0, 0, W, H);
    gx.drawImage(im, X, Y, w, h);
    if (!mob) { // Seitlich weich ins Schwarz auslaufen lassen
      var g1 = gx.createLinearGradient(X, 0, X + w * .3, 0); g1.addColorStop(0, "rgba(0,0,0,1)"); g1.addColorStop(1, "rgba(0,0,0,0)"); gx.fillStyle = g1; gx.fillRect(X, 0, w * .3, H);
      var g2 = gx.createLinearGradient(X + w, 0, X + w * .7, 0); g2.addColorStop(0, "rgba(0,0,0,1)"); g2.addColorStop(1, "rgba(0,0,0,0)"); gx.fillStyle = g2; gx.fillRect(X + w * .7, 0, w * .3, H);
    }
    var g3 = gx.createLinearGradient(0, H * .55, 0, H); g3.addColorStop(0, "rgba(0,0,0,0)"); g3.addColorStop(1, "rgba(0,0,0,.85)"); gx.fillStyle = g3; gx.fillRect(0, H * .55, W, H * .45);
  }
  function textsG(p) {
    var k = clamp(Math.floor(p * 4), 0, 3);
    if (k !== gStep) { gStep = k; gtxt.forEach(function (t, i) { t.classList.toggle("is-on", i === k); }); if (k === 3) growlLow(); }
  }
  onView([gsec], function (el, on) { if (on) loadFrames(); }, 0);
  if (!reduce) { sizeG(); addEventListener("resize", sizeG); }

  // ---------- Ein Takt für alles, was vom Scrollen abhängt ----------
  var nav = $("#nav"), navSolid = false, links = $$(".nav__l a"), linkOn = -1, last = performance.now();
  var secs = ["warnung", "grab", "bewohner", "programm", "tickets"].map(function (id) { return document.getElementById(id); });
  function tick(now) {
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    var y = scrollY;
    if ((y > 10) !== navSolid) { navSolid = y > 10; nav.classList.toggle("is-solid", navSolid); }
    // Grab
    if (!reduce) {
      var r = gsec.getBoundingClientRect(), total = gsec.offsetHeight - gpin.offsetHeight;
      gTarget = clamp(-r.top / total, 0, 1);
      gp += (gTarget - gp) * (1 - Math.exp(-9 * dt));
      if (r.bottom > 0 && r.top < innerHeight) { paintG(gp); textsG(gp); gbar.style.transform = "scaleX(" + gp.toFixed(3) + ")"; }
    }
    // Aktiver Menüpunkt
    var on = -1; secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < innerHeight * .45) on = i; });
    if (on !== linkOn) { linkOn = on; links.forEach(function (a, i) { a.classList.toggle("is-on", i === on); }); }
    requestAnimationFrame(tick);
  }

  // ---------- Akten: Video läuft beim Berühren, am Handy beim Antippen ----------
  var files = [].slice.call($$(".file"));
  function fileOn(f, on) { var v = f.querySelector("video"); if (on) { if (v.preload === "none") v.preload = "auto"; var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }
  files.forEach(function (f) {
    f.addEventListener("mouseenter", function () { fileOn(f, true); growl(f.dataset.snd); });
    f.addEventListener("mouseleave", function () { fileOn(f, false); });
    f.addEventListener("focus", function () { fileOn(f, true); });
    f.addEventListener("blur", function () { fileOn(f, false); });
    f.addEventListener("click", function () {
      var was = f.classList.contains("is-on");
      files.forEach(function (o) { if (o !== f) { o.classList.remove("is-on"); fileOn(o, false); } });
      f.classList.toggle("is-on", !was); fileOn(f, !was); if (!was) growl(f.dataset.snd);
    });
  });
  // Posterbilder der Akten vorladen, sobald der Abschnitt in die Nähe kommt
  onView([$("#bewohner")], function (el, on) { if (on) files.forEach(function (f) { f.querySelector("video").preload = "metadata"; }); }, 0, true);

  // ---------- Taschenlampe: der Raum ist dunkel, irgendwo steht er ----------
  var torch = $("#lampe"), dark = $("#dark"), who = $("#who"), tk = { on: false, x: 0, y: 0, cx: 0, cy: 0 }, found = false;
  var spots = [[62, 38], [22, 52], [78, 64], [40, 30]], sp = spots[Math.floor(Math.random() * spots.length)];
  torch.style.setProperty("--wx", sp[0] + "%"); torch.style.setProperty("--wy", sp[1] + "%");
  function torchPos(e) { var r = torch.getBoundingClientRect(); tk.x = e.clientX - r.left; tk.y = e.clientY - r.top; if (!tk.on) { tk.cx = tk.x; tk.cy = tk.y; } tk.on = true; torch.classList.add("is-lit"); }
  torch.addEventListener("pointermove", torchPos); torch.addEventListener("pointerdown", torchPos);
  torch.addEventListener("pointerleave", function () { tk.on = false; torch.classList.remove("is-lit"); });
  torch.addEventListener("touchmove", function (e) { if (tk.on) e.preventDefault(); }, { passive: false });
  function torchFrame() {
    if (tk.on) {
      tk.cx += (tk.x - tk.cx) * .18; tk.cy += (tk.y - tk.cy) * .18;
      dark.style.setProperty("--tx", tk.cx.toFixed(1) + "px"); dark.style.setProperty("--ty", tk.cy.toFixed(1) + "px");
      if (!found) {
        var r = torch.getBoundingClientRect(), wx = r.width * sp[0] / 100, wy = r.height * sp[1] / 100;
        if (Math.hypot(tk.cx - wx, tk.cy - wy) < Math.min(r.width, r.height) * .14) {
          found = true; torch.classList.add("is-found"); $("#found").textContent = "Er hat dich gesehen."; scream(.5);
          setTimeout(function () { torch.classList.remove("is-found"); found = false; sp = spots[Math.floor(Math.random() * spots.length)]; torch.style.setProperty("--wx", sp[0] + "%"); torch.style.setProperty("--wy", sp[1] + "%"); }, 4000);
        }
      }
    }
    requestAnimationFrame(torchFrame);
  }
  requestAnimationFrame(torchFrame);
  // Ohne Maus zeigt die Lampe anfangs ein Stück, damit man weiß, was zu tun ist.
  onView([torch], function (el, on) { if (on && !tk.on) { var r = torch.getBoundingClientRect(); tk.x = tk.cx = r.width * .3; tk.y = tk.cy = r.height * .55; tk.on = true; torch.classList.add("is-lit"); } }, .4, true);

  // ---------- Der Knopf: nicht drücken ----------
  var scare = $("#scare"), scarev = $("#scarev"), nopeafter = $("#nopeafter"), presses = 0, scaring = false;
  var AFTER = ["Du hast es gewusst. Und trotzdem.", "Noch einmal? Er merkt sich Gesichter.", "Gut. Jetzt weiß er, wo du wohnst.", "Es reicht. Wirklich."];
  function doScare() {
    if (scaring) return; scaring = true;
    scarev.currentTime = 0; scarev.preload = "auto";
    scare.classList.add("is-on"); scare.setAttribute("aria-hidden", "false");
    var p = scarev.play(); if (p && p.catch) p.catch(function () {});
    if (!reduce) document.body.classList.add("is-shaking");
    scream(1);
    // Blut an der Scheibe: Spritzer verteilen, Rinnsal von oben
    var sp = $("#splats"); sp.innerHTML = "";
    for (var i = 0; i < 7; i++) { var el = document.createElementNS("http://www.w3.org/2000/svg", "svg"); el.innerHTML = '<use href="#s' + (1 + i % 3) + '"/>'; el.style.left = (5 + Math.random() * 80) + "%"; el.style.top = (Math.random() * 75) + "%"; el.style.setProperty("--s", (90 + Math.random() * 220) + "px"); el.style.setProperty("--r", (Math.random() * 360) + "deg"); el.style.animationDelay = (.9 + Math.random() * .8) + "s, " + (6 + Math.random() * 2) + "s"; sp.appendChild(el); }
    var bt = $("#bloodtop"); bt.classList.remove("is-off"); setTimeout(function () { bt.classList.add("is-on"); }, 1700); setTimeout(function () { bt.classList.remove("is-on"); bt.classList.add("is-off"); }, 7500);
    setTimeout(function () {
      scare.classList.remove("is-on"); scare.setAttribute("aria-hidden", "true"); scarev.pause(); document.body.classList.remove("is-shaking"); scaring = false;
      nopeafter.textContent = AFTER[Math.min(presses, AFTER.length - 1)]; presses++;
    }, 1900);
  }
  $("#nopebtn").addEventListener("click", doScare);
  onView([$("#nicht")], function (el, on) { if (on) scarev.preload = "auto"; }, 0, true);

  // ---------- Programm: Kerzen flackern nur im Bild ----------
  onView([].slice.call($$(".tl__c video")), function (v, on) { if (on) { if (v.preload === "none") v.preload = "auto"; var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }, 0);

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
    $("#tname").textContent = n; $("#tdlgform").hidden = true; $("#tdone").hidden = false; growlLow();
  });

  // ---------- Ton: alles synthetisch (Wind, Herzschlag, Donner, Schrei, Knurren), erst nach Klick ----------
  var AC = window.AudioContext || window.webkitAudioContext, ac = null, wind = null, heart = null, sndOn = false, sndBtn = $("#snd");
  function audio() { if (!ac && AC) ac = new AC(); if (ac && ac.state === "suspended") ac.resume(); return ac; }
  function noise(dur) { var a = audio(), buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate), d = buf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; var s = a.createBufferSource(); s.buffer = buf; return s; }
  function startWind() {
    var a = audio(); if (!a) return;
    var s = noise(4); s.loop = true; var f = a.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 320; f.Q.value = .5;
    var g = a.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(a.destination); s.start();
    var lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = .11; lg.gain.value = 200; lfo.connect(lg); lg.connect(f.frequency); lfo.start();
    g.gain.linearRampToValueAtTime(.05, a.currentTime + 2); wind = { s: s, g: g, lfo: lfo };
    heart = setInterval(function () { if (!document.hidden) { beat(); setTimeout(beat, 260); } }, 1100);
  }
  function stopWind() { if (!wind) return; wind.g.gain.linearRampToValueAtTime(0, ac.currentTime + .8); var w = wind; setTimeout(function () { w.s.stop(); w.lfo.stop(); }, 900); wind = null; clearInterval(heart); heart = null; }
  function beat() { var a = audio(), o = a.createOscillator(), g = a.createGain(); o.type = "sine"; o.frequency.setValueAtTime(70, a.currentTime); o.frequency.exponentialRampToValueAtTime(40, a.currentTime + .18); g.gain.setValueAtTime(.001, a.currentTime); g.gain.exponentialRampToValueAtTime(.35, a.currentTime + .02); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + .2); o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + .22); }
  function thunder() {
    if (!sndOn) return; var a = audio(), s = noise(2.5), f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 120;
    var g = a.createGain(); g.gain.setValueAtTime(.001, a.currentTime); g.gain.exponentialRampToValueAtTime(.5, a.currentTime + .08); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + 2.4);
    s.connect(f); f.connect(g); g.connect(a.destination); s.start();
  }
  function key() { if (!sndOn) return; var a = audio(), s = noise(.04), f = a.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 2500; var g = a.createGain(); g.gain.setValueAtTime(.05, a.currentTime); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + .04); s.connect(f); f.connect(g); g.connect(a.destination); s.start(); }
  function blip(f0, f1, dur, type, vol) {
    if (!sndOn) return; var a = audio(), o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f0, a.currentTime); o.frequency.exponentialRampToValueAtTime(f1, a.currentTime + dur);
    g.gain.setValueAtTime(vol, a.currentTime); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + dur); o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + dur);
  }
  function growlLow() { blip(110, 60, 1.4, "sawtooth", .08); }
  function growl(kind) {
    if (!sndOn) return;
    if (kind === "zombie") blip(120, 80, .8, "sawtooth", .09); else if (kind === "clown") { [0, .14, .3].forEach(function (t, i) { setTimeout(function () { blip(420 - i * 50, 300 - i * 50, .14, "sawtooth", .05); }, t * 1000); }); }
    else if (kind === "bride") blip(700, 260, 1.2, "sine", .05); else if (kind === "doll") blip(1800, 900, .3, "square", .035);
    else if (kind === "window") { [0, .22, .44].forEach(function (t) { setTimeout(function () { blip(160, 90, .1, "triangle", .12); }, t * 1000); }); }
    else growlLow();
  }
  // Schrei: Rauschen plus steigender Ton, kurz und unangenehm
  function scream(vol) {
    if (!sndOn) return; var a = audio(), t = a.currentTime;
    var s = noise(1.2), f = a.createBiquadFilter(); f.type = "bandpass"; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(2600, t + .6); f.Q.value = 1.2;
    var g = a.createGain(); g.gain.setValueAtTime(.001, t); g.gain.exponentialRampToValueAtTime(.35 * vol, t + .05); g.gain.exponentialRampToValueAtTime(.001, t + 1.1); s.connect(f); f.connect(g); g.connect(a.destination); s.start();
    var o = a.createOscillator(), og = a.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(380, t); o.frequency.exponentialRampToValueAtTime(1500, t + .5); o.frequency.exponentialRampToValueAtTime(700, t + 1);
    og.gain.setValueAtTime(.001, t); og.gain.exponentialRampToValueAtTime(.12 * vol, t + .08); og.gain.exponentialRampToValueAtTime(.001, t + 1); o.connect(og); og.connect(a.destination); o.start(); o.stop(t + 1.05);
  }
  sndBtn.addEventListener("click", function () {
    sndOn = !sndOn; sndBtn.setAttribute("aria-pressed", sndOn); sndBtn.querySelector(".snd__ic").textContent = sndOn ? "🔊" : "🔇";
    if (sndOn) startWind(); else stopWind();
  });
  document.addEventListener("visibilitychange", function () { if (document.hidden && wind) stopWind(); else if (!document.hidden && sndOn && !wind) startWind(); });

  requestAnimationFrame(tick);
})();
