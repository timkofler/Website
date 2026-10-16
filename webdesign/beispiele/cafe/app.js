// Café Mühlbach – Beispielseite von tim-kofler.at
// Navigation, Speisekarten-Tabs, Live-Öffnungsstatus (Europe/Vienna), Formular
// und die Signatur-Animation: Espresso fließt in die Tasse, Crema, Milchschaum, Dampf.
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Höhe der Hinweisleiste für die Sticky-Navigation ---------- */
  var bar = $(".tk-demo-bar");
  function setBar() { if (bar) document.documentElement.style.setProperty("--bar", bar.offsetHeight + "px"); }
  setBar(); window.addEventListener("resize", setBar);

  /* ---------- Navigation ---------- */
  var nav = $("#nav"), burger = $("#burger"), menu = $("#menu"), hero = $(".hero"), heroVid = $("#heroVideo");
  function closeMenu() { menu.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Menü öffnen"); }
  burger.addEventListener("click", function () {
    var open = !menu.classList.contains("is-open");
    menu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    if (open) { var f = $("a", menu); if (f) f.focus(); }
  });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("is-open")) { closeMenu(); burger.focus(); } });
  document.addEventListener("click", function (e) { if (menu.classList.contains("is-open") && !nav.contains(e.target)) closeMenu(); });

  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.scrollY, h = hero.offsetHeight;
      nav.classList.toggle("is-solid", y > h - 140);
      if (!reduce && heroVid && y < h) heroVid.style.transform = "translateY(" + (y * 0.28).toFixed(1) + "px) scale(1.08)";
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- Speisekarte: Tabs ---------- */
  var tabs = $$(".tab"), pill = $(".tabs__pill");
  function placePill() {
    var a = $('.tab[aria-selected="true"]'); if (!a || !pill) return;
    pill.style.width = a.offsetWidth + "px";
    pill.style.transform = "translateX(" + a.offsetLeft + "px)";
  }
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab, p = document.getElementById(t.getAttribute("aria-controls"));
      t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1;
      p.hidden = !on;
      if (on && !reduce) { p.classList.remove("is-anim"); void p.offsetWidth; p.classList.add("is-anim"); }
    });
    if (focus) tab.focus();
    placePill();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(t); });
    t.addEventListener("keydown", function (e) {
      var n = null;
      if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") n = tabs[0]; else if (e.key === "End") n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });
  placePill(); window.addEventListener("resize", placePill);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placePill);

  /* ---------- Live-Öffnungsstatus nach Wiener Zeit ---------- */
  // [Öffnet, Schließt] in Minuten ab Mitternacht; Index = Wochentag (0 = Sonntag)
  var HOURS = { 0: [540, 840], 1: [450, 1080], 2: [450, 1080], 3: [450, 1080], 4: [450, 1080], 5: [450, 1140], 6: [480, 1020] };
  var DAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  function viennaNow() {
    var parts = {};
    try {
      new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Vienna", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
        .formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
      var wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[parts.weekday];
      return { day: wd, min: (parseInt(parts.hour, 10) % 24) * 60 + parseInt(parts.minute, 10) };
    } catch (e) { var d = new Date(); return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() }; }
  }
  function fmt(m) { return Math.floor(m / 60) + ":" + ("0" + (m % 60)).slice(-2); }
  function updateStatus() {
    var n = viennaNow(), h = HOURS[n.day], open = n.min >= h[0] && n.min < h[1], text, sub;
    if (open) {
      var left = h[1] - n.min;
      text = left <= 60 ? "Jetzt geöffnet · schließt in " + left + " Min." : "Jetzt geöffnet · bis " + fmt(h[1]) + " Uhr";
    } else if (n.min < h[0]) {
      text = "Jetzt geschlossen · öffnet heute um " + fmt(h[0]) + " Uhr";
    } else {
      var nd = (n.day + 1) % 7;
      text = "Jetzt geschlossen · öffnet morgen um " + fmt(HOURS[nd][0]) + " Uhr";
    }
    sub = "Stand " + fmt(n.min) + " Uhr, " + DAYS[n.day] + " (Wiener Zeit)";
    $$(".js-status").forEach(function (el) {
      el.classList.toggle("is-open-now", open); el.classList.toggle("is-closed-now", !open);
      var t = $(".js-status-text", el); if (t) t.textContent = text;
      var s = $(".js-status-sub", el); if (s) s.textContent = sub;
    });
    $$("#hoursTable tr").forEach(function (tr) { tr.classList.toggle("is-today", +tr.getAttribute("data-day") === n.day); });
  }
  updateStatus(); setInterval(updateStatus, 30000);

  /* ---------- Reservierung (Beispiel, sendet nichts) ---------- */
  var form = $("#resForm");
  if (form) {
    var date = $("#r-date"), d = new Date(), pad = function (x) { return ("0" + x).slice(-2); };
    var iso = function (x) { return x.getFullYear() + "-" + pad(x.getMonth() + 1) + "-" + pad(x.getDate()); };
    date.min = iso(d); d.setDate(d.getDate() + 1); date.value = iso(d);
    var out = $("#r-persons"), persons = 2;
    $$(".persons button", form).forEach(function (b) {
      b.addEventListener("click", function () { persons = Math.max(1, Math.min(12, persons + +b.getAttribute("data-step"))); out.textContent = persons; });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = $(".form-msg", form);
      msg.textContent = "Das ist ein Beispiel – auf der echten Seite käme Ihre Anfrage jetzt direkt beim Betrieb an.";
      msg.classList.remove("is-on"); void msg.offsetWidth; msg.classList.add("is-on");
    });
  }

  /* ---------- Signatur-Animation: Kaffee fließt in die Tasse ---------- */
  var svg = $("#pourSvg"); if (!svg) return;
  var stage = $("#pourStage"), liquid = $("#liquid"), wob = $("#wob"), crema = $("#crema"), specks = $("#specks"),
      jug = $("#jug"), foam = $("#foam"), heart = $("#heart"), shine = $("#shine"), stream = $("#stream"), milk = $("#milk"), drops = $("#drops"),
      ripples = $$("#ripples ellipse"), rippleG = $("#ripples"), steps = $$("#pourSteps .step"), timeEl = $("#pourTime"),
      hudLabel = $(".pour__hud small");
  var SPOUT = 86, END = 8200, t0 = null, raf = 0, lastStep = -1;

  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function seg(t, a, b) { return clamp((t - a) / (b - a)); }
  function eio(x) { return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function eout(x) { return 1 - Math.pow(1 - x, 3); }
  function back(x) { var c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }

  function render(t) {
    // Füllstand: Espresso 0 → 1, Milch hebt auf 1,12
    var L = eio(seg(t, 500, 4300)) + 0.12 * eout(seg(t, 5400, 7400));
    var sy = 277 - 17 * L, sc = 0.52 + 0.46 * L;   // Spiegel liegt immer sichtbar in der Tassenöffnung
    liquid.setAttribute("opacity", t > 560 ? 1 : 0);
    liquid.setAttribute("transform", "translate(200 " + sy.toFixed(2) + ") scale(" + sc.toFixed(3) + ")");

    // Oberfläche wackelt: stark während des Eingießens, klingt danach ab
    var pourAmp = (t > 600 && t < 4400) || (t > 5300 && t < 7600) ? 1 : 0;
    var settle = t > 7600 ? Math.exp(-(t - 7600) / 700) : t > 4400 && t < 5300 ? Math.exp(-(t - 4400) / 500) : pourAmp;
    var w = settle * 0.07 * Math.sin(t * 0.013) + 0.012 * Math.sin(t * 0.004);
    var rot = settle * 1.6 * Math.sin(t * 0.009 + 1);
    wob.setAttribute("transform", "rotate(" + rot.toFixed(2) + ") scale(" + (1 - w * 0.4).toFixed(3) + " " + (1 + w).toFixed(3) + ")");
    shine.setAttribute("transform", "translate(" + (Math.sin(t * 0.002) * 14).toFixed(1) + " 0)");

    // Crema und Muster
    crema.setAttribute("opacity", eio(seg(t, 2400, 4800)).toFixed(3));
    specks.setAttribute("opacity", (seg(t, 3600, 5000) * (1 - seg(t, 6200, 7200))).toFixed(3));
    var f = eout(seg(t, 5500, 6700));
    foam.setAttribute("opacity", (f * (1 - 0.0 * f)).toFixed(3));
    foam.setAttribute("transform", "scale(" + (0.15 + 0.85 * f).toFixed(3) + ")");
    var hp = seg(t, 6400, 7700), hs = hp > 0 ? back(hp) : 0;
    heart.setAttribute("opacity", clamp(hp * 3).toFixed(3));
    heart.setAttribute("transform", "translate(0 " + (-6 + 6 * eout(hp)).toFixed(2) + ") scale(" + (hs * 1.15).toFixed(3) + " " + (hs * 1.05).toFixed(3) + ")");

    // Wellenringe am Auftreffpunkt
    var milkPhase = t > 5200;
    rippleG.setAttribute("stroke", milkPhase ? "#fff3e2" : "#e1a874");
    ripples.forEach(function (r, i) {
      var k = ((t / 650) + i / 3) % 1, o = pourAmp ? (1 - k) * 0.65 : 0;
      r.setAttribute("opacity", o.toFixed(3));
      r.setAttribute("transform", "scale(" + (0.15 + 1.4 * k).toFixed(3) + ")");
    });

    // Espresso-Strahl: fällt ein, fließt, reißt ab
    var len = sy - SPOUT, e = eout(seg(t, 250, 650)), dt = eio(seg(t, 4100, 4500));
    var top = SPOUT + len * dt, l = Math.max(0.01, len * (t < 4100 ? e : 1 - dt));
    var sx = 0.75 + 0.12 * Math.sin(t * 0.03) + 0.06 * Math.sin(t * 0.071);
    stream.setAttribute("opacity", t > 250 && t < 4500 ? 1 : 0);
    stream.setAttribute("transform", "translate(200 " + top.toFixed(2) + ") scale(" + sx.toFixed(3) + " " + l.toFixed(2) + ")");
    // ein paar letzte Tropfen
    var dp = seg(t, 4500, 5100);
    drops.setAttribute("opacity", dp > 0 && dp < 1 ? (1 - dp) : 0);
    drops.setAttribute("transform", "translate(200 " + (SPOUT + dp * 200).toFixed(1) + ")");

    // Milch
    var me = eout(seg(t, 5200, 5550)), md = eio(seg(t, 7300, 7700));
    var JY = 156, mlen = sy - JY;
    var mtop = JY + mlen * md, ml = Math.max(0.01, mlen * (t < 7300 ? me : 1 - md));
    // Milchkännchen schwenkt ein, gießt und zieht sich zurück
    var ji = eout(seg(t, 4700, 5250)), jo = eio(seg(t, 7400, 8000)), jk = ji * (1 - jo);
    jug.setAttribute("opacity", jk > 0.01 ? Math.min(1, jk * 1.5).toFixed(3) : 0);
    jug.setAttribute("transform", "translate(" + (200 + 140 * (1 - jk) + Math.sin(t * 0.006) * 3).toFixed(1) + " " + (JY - 70 * (1 - jk)).toFixed(1) + ") rotate(" + (-42 * jk).toFixed(2) + ")");
    var mx = 1 + 0.15 * Math.sin(t * 0.02);
    milk.setAttribute("opacity", t > 5200 && t < 7700 ? 1 : 0);
    milk.setAttribute("transform", "translate(" + (200 + Math.sin(t * 0.006) * 3).toFixed(1) + " " + mtop.toFixed(2) + ") scale(" + mx.toFixed(3) + " " + ml.toFixed(2) + ")");

    // Anzeige und Schritte
    var secs = 25 * seg(t, 500, 4300);
    if (t < 4400) { hudLabel.textContent = "Extraktion"; timeEl.textContent = (secs < 10 ? "0" : "") + secs.toFixed(1).replace(".", ",") + " s"; }
    else if (t < 7600) { hudLabel.textContent = "Milch"; timeEl.textContent = Math.round(20 + 45 * seg(t, 5200, 7400)) + " °C"; }
    else { hudLabel.textContent = "Fertig"; timeEl.textContent = "Bitte sehr!"; }
    var s = t < 4300 ? 0 : t < 5200 ? 1 : t < 7600 ? 2 : 3;
    if (s !== lastStep) {
      lastStep = s;
      steps.forEach(function (el, i) { el.classList.toggle("is-on", i === s); el.classList.toggle("is-done", i < s); });
    }
    stage.classList.toggle("is-steaming", t >= 7500);
  }

  function frame(now) {
    if (t0 === null) t0 = now;
    var t = now - t0;
    render(t);
    if (t < END + 2600) raf = requestAnimationFrame(frame); else raf = 0;
  }
  function play() {
    if (reduce) { render(END + 3000); stage.classList.add("is-steaming"); return; }
    cancelAnimationFrame(raf); t0 = null; lastStep = -1; stage.classList.remove("is-steaming");
    raf = requestAnimationFrame(frame);
  }
  render(0);
  if (reduce) play();
  else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { play(); io.disconnect(); } });
    }, { threshold: 0.45 });
    io.observe(svg);
  } else play();
  svg.addEventListener("click", play);
  $("#pourReplay").addEventListener("click", play);
})();
