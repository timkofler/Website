// Beispiel "Eine App statt sieben Abos": Kopfbereich mit Abo-Fenstern, die beim Scrollen in eine App fliegen,
// eine bedienbare Kunden-App mit Büro-Ansicht und ein Abo-Rechner. Alles bleibt im Browser (localStorage).
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  // Zahlenformat einmal anlegen (toLocaleString baut es sonst bei jedem Aufruf neu, das bremst am Handy)
  var NF0 = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }), NF2 = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var eur = function (n) { return NF0.format(Math.round(n)) + " €"; };
  var eur2 = function (n) { return (n % 1 ? NF2 : NF0).format(n) + " €"; };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var ico = function (id) { return '<svg aria-hidden="true"><use href="#' + id + '"/></svg>'; };
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var WD = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

  // Links zur Anfrage behalten utm_source/gclid aus der Werbung, damit das Formular die Quelle kennt.
  var qs = /[?&](utm_source|gclid|gbraid|wbraid)=/.test(location.search) ? location.search : "?utm_source=betriebs-app";
  $$('a[href="/#anfrage"]').forEach(function (a) { a.href = "/" + qs + "&paket=app#anfrage"; });

  /* ---------------- Kopfbereich ---------------- */
  var APPS = [
    { n: "Terminbuchung", s: "Termine", p: 39, c: "#ff5a1f", i: "i-cal" },
    { n: "Gutscheine", p: 29, c: "#ff5a1f", i: "i-gift" },
    { n: "Stempelkarte", s: "Treue", p: 35, c: "#ffb23f", i: "i-stamp" },
    { n: "Angebote", p: 25, c: "#e9e9e6", i: "i-sign" },
    { n: "Rechnungen", p: 15, c: "#ff7a45", i: "i-inv" },
    { n: "Kundenkartei", s: "Kunden", p: 20, c: "#ffb23f", i: "i-users" },
    { n: "Website", p: 25, c: "#e9e9e6", i: "i-web" }
  ];
  // QR-Code im Stil von tim-kofler.at (assets/js/tk-qr.js), mit dem Logo des Betriebs in der Mitte
  var qrSvg = function (text, b) { return window.tkQR ? tkQR.svg(text, { logo: { text: b.logo, bg: b.a }, quiet: 0 }) : ""; };
  // Kleine echte Inhalte je Abo-Fenster statt Platzhalter-Balken
  var WIN = {
    Terminbuchung: '<div class="w-slots"><span class="x">09:00</span><span class="on">10:30</span><span>14:00</span></div><span class="w-sub">Mo, 26. Okt. · 3 Termine frei</span>',
    Gutscheine: '<div class="w-gift"><span><small>Gutschein</small><b>50 €</b></span><span class="w-qr">' + qrSvg("GL-50", { logo: "G", a: "#ef5a92" }) + '</span></div>',
    Stempelkarte: '<div class="w-stamps"><span class="on"></span><span class="on"></span><span class="on"></span><span></span><span></span></div><span class="w-sub">Noch 2 Stempel bis gratis</span>',
    Angebote: '<div class="w-row"><span>Angebot 041</span><b>1.180 €</b></div><div class="w-row"><span>Unterschrift</span><em class="w-chip">offen</em></div>',
    Rechnungen: '<div class="w-row"><span>Nr. 1042</span><b>89 €</b><em class="w-chip">offen</em></div><div class="w-row"><span>Nr. 1041</span><b>120 €</b><em class="w-chip ok">bezahlt</em></div>',
    Kundenkartei: '<div class="w-av"><i>SK</i><div>Sabine K.<span>zuletzt: Färben</span></div></div><div class="w-av"><i class="b">TR</i><div>Thomas R.<span>zuletzt: Schnitt</span></div></div>',
    Website: '<div class="w-site"><b>Dein Betrieb</b><span><u></u><u></u></span></div>'
  };
  var EXTRA = [{ n: "Stunden", c: "#ff7a45", i: "i-clock" }, { n: "Lager", c: "#ffb23f", i: "i-box" }];
  var TOTAL = APPS.reduce(function (s, a) { return s + a.p; }, 0);
  // Startpunkte (Mitte des Fensters, Anteil der Bühne) und Drehung, für breite und schmale Bildschirme.
  var POS_W = [[.14, .19, -8], [.3, .72, 6], [.11, .62, -4], [.85, .18, 7], [.71, .72, -6], [.89, .55, 5], [.34, .33, 4]];
  var POS_N = [[.24, .06, -5], [.76, .15, 5], [.25, .355, 3], [.76, .43, -5], [.24, .625, -3], [.76, .7, 5], [.5, .88, -2]];

  var bar = $(".tk-demo-bar");
  var setBar = function () { if (bar) document.documentElement.style.setProperty("--bar", bar.offsetHeight + "px"); };
  setBar(); addEventListener("resize", setBar);
  var hero = $(".hero"), stage = $("[data-stage]"), hphone = $("[data-hero-phone]"), slotsEl = $("[data-slots]");
  var wins = [], slots = [], geo = null, lastP = -1, narrow = false, heroTop = 0, heroSpan = 0, sY = scrollY;
  // Scroll-Stand beim Scroll-Ereignis merken: dort ist das Layout frisch, im Animationsbild würde scrollY ein Neu-Layout erzwingen
  addEventListener("scroll", function () { sY = scrollY; }, { passive: true });
  if (hero && stage) {
    APPS.concat(EXTRA).forEach(function (a, i) {
      var s = document.createElement("div");
      s.className = "slot";
      s.innerHTML = '<i style="--c:' + a.c + '">' + ico(a.i) + "</i><span>" + (a.s || a.n) + "</span>";
      slotsEl.appendChild(s); slots.push(s);
      if (i >= APPS.length) return;
      var w = document.createElement("div");
      w.className = "win";
      w.style.setProperty("--c", a.c);
      w.innerHTML = '<div class="win__bar"><i>' + ico(a.i) + "</i><b>" + a.n + "</b><small>Abo</small></div><div class=\"win__body\">" + (WIN[a.n] || "") + '</div><span class="win__tag"><s>' + a.p + " €</s><em>/ Monat</em></span>";
      stage.appendChild(w); wins.push(w);
    });
    var sumA = $("[data-hero-sum]"), sumB = $("[data-hero-sum2]"), sumL = $("[data-hero-sumlbl]");

    var measure = function () {
      var sr = stage.getBoundingClientRect();
      narrow = sr.width < 700; var pos = narrow ? POS_N : POS_W;
      hphone.style.setProperty("--fit", Math.round(clamp((sr.height - 16) * 9 / 19, 150, narrow ? 230 : 270)) + "px");
      hphone.style.setProperty("--ps", 1);
      var ends = slots.map(function (s) { var r = s.firstChild.getBoundingClientRect(); return { x: r.left - sr.left + r.width / 2, y: r.top - sr.top + r.height / 2, w: r.width }; });
      geo = wins.map(function (w, i) {
        var ww = w.offsetWidth, wh = w.offsetHeight, p = pos[i];
        var sx = clamp(p[0] * sr.width, ww / 2 + 8, sr.width - ww / 2 - 8);
        var sy = clamp(p[1] * sr.height, wh / 2 + 14, sr.height - wh / 2 - 8);
        return { sx: sx, sy: sy, r: p[2], ex: ends[i].x, ey: ends[i].y, k: ends[i].w / ww, w: ww, h: wh };
      });
      // Lage des Kopfbereichs einmal merken, damit progress() beim Scrollen nichts mehr ausmessen muss (sonst Layout in jedem Bild)
      var hr = hero.getBoundingClientRect(); sY = scrollY; heroTop = hr.top + sY; heroSpan = hero.offsetHeight - innerHeight;
      lastP = -1; frame();
    };

    var progress = function () {
      if (reduce) return 1;
      return heroSpan > 0 ? clamp((sY - heroTop) / heroSpan, 0, 1) : 1;
    };

    var t0 = performance.now(), visible = true;
    var frame = function () {
      if (!geo) return;
      var p = progress(), now = (performance.now() - t0) / 1000;
      var q = ease(clamp((p - .1) / .6, 0, 1));
      var ph = clamp((p - .03) / .2, 0, 1);
      hphone.style.setProperty("--po", (narrow ? ph : .5 + .5 * ph).toFixed(3));
      hphone.style.setProperty("--ps", (.86 + .14 * ease(ph)).toFixed(3));
      var paid = 0;
      geo.forEach(function (g, i) {
        var w = wins[i], fl = reduce ? 0 : Math.sin(now * 1.1 + i * 1.7) * 6 * (1 - q);
        var x = lerp(g.sx, g.ex, q), y = lerp(g.sy, g.ey, q) + fl, k = lerp(1, g.k, q), r = lerp(g.r, 0, q);
        w.style.transform = "translate(" + (x - g.w / 2).toFixed(1) + "px," + (y - g.h / 2).toFixed(1) + "px) rotate(" + r.toFixed(2) + "deg) scale(" + k.toFixed(4) + ")";
        w.style.opacity = (1 - clamp((q - .82) / .16, 0, 1)).toFixed(3);
        var tq = clamp((p - .1 - i * .05) / .16, 0, 1), tag = w.lastChild;
        tag.style.transform = "translateY(" + (tq * 46).toFixed(1) + "px) rotate(" + (tq * (i % 2 ? 24 : -24)).toFixed(1) + "deg)";
        tag.style.opacity = (1 - tq).toFixed(3);
        paid += APPS[i].p * (1 - tq);
      });
      var io = clamp((q - .8) / .2, 0, 1);
      slots.forEach(function (s, i) { s.style.setProperty("--io", (i < APPS.length ? io : clamp((q - .92) / .08, 0, 1)).toFixed(3)); });
      var shown = Math.round(paid);
      if (p !== lastP) {
        sumB.textContent = shown + " €";
        sumL.textContent = shown === 0 ? "Abo-Kosten mit eigener App" : "Abo-Kosten pro Monat";
        hero.classList.toggle("is-moving", p > .02);
        hero.classList.toggle("is-done", p > .74);
        lastP = p;
      }
      if (!reduce && visible) requestAnimationFrame(frame);
    };
    sumA.innerHTML = TOTAL + "&nbsp;€";
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { var was = visible; visible = es[0].isIntersecting; if (visible && !was && !reduce) requestAnimationFrame(frame); }).observe(hero);
    }
    var rz; addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(measure, 120); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure); else measure();
    measure();
  }

  /* ---------------- Kunden-App ---------------- */
  var BR = {
    beauty: {
      name: "Studio Glanz", logo: "G", a: "#ef5a92", a2: "#f9a8d4", a3: "#b02a63", url: "app.studio-glanz.at/buero",
      open: "Heute geöffnet bis 18 Uhr", closed: [0, 1], times: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"],
      tTitle: "Termin buchen", tWhat: "Leistung", tTab: "Termin", tTile: "Termine", tUnit: "Termin",
      svcs: [["Damenhaarschnitt", "45 Min.", 42], ["Herrenhaarschnitt", "30 Min.", 26], ["Färben & Schnitt", "2 Std.", 95], ["Maniküre", "45 Min.", 32]],
      amts: [25, 50, 75, 100], code: "GL",
      loy: { n: 10, start: 6, rule: "Jeder 10. Haarschnitt gratis", reward: "Voll! Dein nächster Haarschnitt ist gratis.", what: "Haarschnitt" },
      offer: { t: "Brautstyling", no: "2026-041", tax: "inkl. 20 % USt.", items: [["Probetermin Frisur & Make-up", "ca. 2 Std.", 120], ["Brautfrisur am Hochzeitstag", "inkl. Anfahrt", 180], ["Make-up Braut", "langhaltend", 90], ["Frisur Trauzeugin", "", 65]] },
      base: { termin: 6, gutschein: 150, treue: 84, open: 2, ok: 1 },
      plan: [["09:00", "Maria P.", "Damenhaarschnitt"], ["10:00", "Claudia W.", "Färben & Schnitt"], ["12:30", "Thomas R.", "Herrenhaarschnitt"], ["14:00", "Lena S.", "Maniküre"], ["15:30", "Sabine K.", "Damenhaarschnitt"], ["17:00", "Jakob M.", "Herrenhaarschnitt"]],
      seed: [["termin", "Termin: Damenhaarschnitt", "Sabine K. · morgen 10:30", "08:12"], ["gutschein", "Gutschein verkauft: 50 €", "Für Oma, von Jakob", "07:45"], ["angebot", "Angebot angenommen", "Hochsteckfrisur · Familie Berger", "gestern"]]
    },
    gastro: {
      name: "Gasthaus Lindenhof", logo: "L", a: "#ea8a2e", a2: "#fbbf24", a3: "#a4520c", url: "app.lindenhof-beispiel.at/buero",
      open: "Heute Küche bis 21 Uhr", closed: [1, 2], times: ["11:30", "12:00", "12:30", "13:00", "13:30", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"],
      tTitle: "Tisch reservieren", tWhat: "Personen", tTab: "Tisch", tTile: "Reservierungen", tUnit: "Tisch",
      svcs: [["2 Personen", "", null], ["4 Personen", "", null], ["6 Personen", "", null], ["Gruppe", "bis 20 Personen, Extrastüberl", null]],
      amts: [30, 50, 80, 120], code: "LH",
      loy: { n: 10, start: 3, rule: "Jedes 10. Mittagsmenü gratis", reward: "Voll! Dein nächstes Mittagsmenü ist gratis.", what: "Mittagsmenü" },
      offer: { t: "Geburtstagsfeier, 30 Personen", no: "2026-118", tax: "inkl. USt.", items: [["Aperitif mit Häppchen", "30 × 6,50 €", 195], ["3-Gänge-Menü", "30 × 34 €", 1020], ["Getränkepauschale", "30 × 18 €", 540], ["Geburtstagstorte", "vom Konditor im Ort", 120]] },
      base: { termin: 14, gutschein: 240, treue: 126, open: 3, ok: 2 },
      plan: [["11:30", "Fam. Huber", "Tisch 3 · 4 Personen"], ["12:00", "Firma Leitner", "Extrastüberl · 12 Personen"], ["12:30", "Herbert L.", "Tisch 7 · Mittagsmenü"], ["18:00", "Fam. Wagner", "Tisch 5 · 4 Personen"], ["19:00", "Anna & Paul", "Tisch 2 · 2 Personen"], ["19:30", "Stammtisch", "Ecktisch · 8 Personen"]],
      seed: [["termin", "Reservierung: 4 Personen", "Fam. Wagner · heute 18:30", "09:02"], ["gutschein", "Gutschein verkauft: 80 €", "Für Peter, von den Kollegen", "08:20"], ["treue", "Stempel vergeben", "Mittagsmenü · Herbert L. (9/10)", "gestern"]]
    },
    hand: {
      name: "Elektro Brunner", logo: "B", a: "#2563eb", a2: "#38bdf8", a3: "#1e3a8a", url: "app.brunner-beispiel.at/buero",
      open: "Heute erreichbar bis 17 Uhr", closed: [0, 6], times: ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
      tTitle: "Termin vereinbaren", tWhat: "Worum geht es?", tTab: "Termin", tTile: "Termine", tUnit: "Termin",
      svcs: [["Besichtigung vor Ort", "für ein Angebot", 0], ["E-Check Wohnung", "ca. 1,5 Std.", 149], ["Störung / Reparatur", "Anfahrt + 1. Stunde", 89], ["Beratung Wallbox & PV", "ca. 1 Std.", 0]],
      amts: [50, 100, 150, 250], code: "EB",
      loy: { n: 5, start: 2, rule: "Jede 5. Wartung zum halben Preis", reward: "Voll! Deine nächste Wartung kostet die Hälfte.", what: "Wartung" },
      offer: { t: "Elektrik Badsanierung", no: "2026-073", tax: "inkl. 20 % USt.", items: [["Leitungen und Dosen neu", "Material und Arbeit", 1180], ["FI-Schutzschalter", "inkl. Einbau und Prüfung", 210], ["LED-Spiegelleuchte", "", 260], ["Elektrische Fußbodenheizung", "4 m²", 640]] },
      base: { termin: 4, gutschein: 100, treue: 57, open: 4, ok: 1 },
      plan: [["08:00", "Fam. Pichler", "Zählerkasten tauschen"], ["10:30", "M. Steiner", "E-Check Wohnung"], ["13:00", "Bäckerei Kornfeld", "Störung Backofen"], ["15:00", "Fam. Wagner", "Beratung Wallbox & PV"]],
      seed: [["angebot", "Angebot angenommen", "Zählerkasten neu · Fam. Pichler", "08:40"], ["termin", "Termin: E-Check Wohnung", "M. Steiner · Mi 10:00", "07:58"], ["gutschein", "Gutschein verkauft: 100 €", "Für Papa, Smart-Home-Beratung", "gestern"]]
    }
  };
  var COLORS = { termin: "var(--blue)", gutschein: "var(--pop)", treue: "#ffb23f", angebot: "var(--ok)" };
  var ICONS = { termin: "i-cal", gutschein: "i-gift", treue: "i-stamp", angebot: "i-sign" };
  var KEY = "tk-betriebsapp-v1";
  var S = store.get(KEY);
  var fresh = function () {
    var o = { br: "beauty", d: {} };
    Object.keys(BR).forEach(function (k) { var b = BR[k].base; o.d[k] = { termin: b.termin, gutschein: b.gutschein, treue: b.treue, open: b.open, ok: b.ok, stamps: BR[k].loy.start, feed: [] }; });
    return o;
  };
  if (!S || !S.d || !S.d.beauty) S = fresh();
  // Direktlink auf eine Branche, z. B. /beispiele/betriebs-app/#gastro (von der Startseiten-Vorschau)
  var hb = location.hash.slice(1); if (BR[hb]) S.br = hb;
  var save = function () { store.set(KEY, S); };
  var app = $("[data-app]"), demo = $(".demo");
  if (!app) return;
  var B = function () { return BR[S.br]; }, D = function () { return S.d[S.br]; };
  var now = new Date();

  var clockEl = $("[data-clock]");
  var tick = function () { var d = new Date(); clockEl.textContent = d.getHours() + ":" + pad(d.getMinutes()); };
  tick(); setInterval(tick, 20000);

  // Tabs in der App und Funktions-Karten darunter
  var tab = "termin";
  // Flüssige Tab-Leiste: ein Tropfen dehnt sich zum neuen Reiter und zieht sich dort wieder zusammen
  var blob = $(".tabs__blob"), blobX = null;
  var moveBlob = function (b, anim) {
    if (!blob || !b) return;
    var x1 = b.offsetLeft + b.offsetWidth / 2 - blob.offsetWidth / 2;
    if (anim && blobX !== null && !reduce && blob.animate) {
      var d = x1 - blobX, st = 1 + Math.min(1.6, Math.abs(d) / blob.offsetWidth * 0.55);
      blob.animate([
        { transform: "translateX(" + blobX + "px) scale(1,1)" },
        { transform: "translateX(" + (blobX + d * 0.18) + "px) scale(" + (st * 0.8) + ",.82)", offset: 0.25 },
        { transform: "translateX(" + (blobX + d * 0.5) + "px) scale(" + st + ",.7)", offset: 0.5 },
        { transform: "translateX(" + (x1 - d * 0.04) + "px) scale(.86,1.12)", offset: 0.82 },
        { transform: "translateX(" + x1 + "px) scale(1,1)" }
      ], { duration: 520, easing: "cubic-bezier(.45,.05,.25,1)" });
    }
    blob.style.transform = "translateX(" + x1 + "px)"; blob.classList.add("on"); blobX = x1;
  };
  var curTab = function () { return $('[data-tab][aria-selected="true"]'); };
  requestAnimationFrame(function () { moveBlob(curTab(), false); });
  addEventListener("resize", function () { moveBlob(curTab(), false); });
  var setTab = function (t, focus) {
    tab = t;
    moveBlob($('[data-tab="' + t + '"]'), true);
    $$("[data-tab]").forEach(function (b) { b.setAttribute("aria-selected", b.getAttribute("data-tab") === t ? "true" : "false"); });
    $$("[data-v]").forEach(function (v) { v.classList.toggle("on", v.getAttribute("data-v") === t); });
    $$("[data-feat]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-feat") === t ? "true" : "false"); });
    $("[data-body]").scrollTop = 0;
    if (t === "angebot") sizeSig();
    if (focus) { var ph = $(".play__phone"), r = ph.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight) ph.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }); }
  };
  $$("[data-tab]").forEach(function (b) { b.addEventListener("click", function () { setTab(b.getAttribute("data-tab")); }); });
  $$("[data-feat]").forEach(function (b) { b.addEventListener("click", function () { setTab(b.getAttribute("data-feat"), true); }); });

  // Büro: Kacheln, Liste, Hinweis
  var feedEl = $("[data-o-feed]"), toastEl = $("[data-toast]"), toastT;
  // Verlaufslinien der letzten Tage in den Kacheln (Musterwerte, der letzte Punkt ist der aktuelle Stand)
  var sparkVals = function (k) {
    var d = D(), cur = { termin: d.termin, gutschein: d.gutschein, treue: d.treue, angebot: d.open + d.ok }[k];
    var form = { termin: [.7, .95, .6, 1.05, .8, 1.15], gutschein: [.35, .55, .45, .7, .6, .85], treue: [.84, .87, .89, .92, .94, .97], angebot: [.4, .7, .5, .9, .6, .8] }[k];
    return form.map(function (f) { return Math.round(cur * f * 10) / 10; }).concat([cur]);
  };
  var spark = function (k, draw) {
    var el = $('[data-spk="' + k + '"]'); if (!el) return;
    var v = sparkVals(k), w = 120, h = 34, mn = Math.min.apply(null, v), mx = Math.max.apply(null, v), rg = mx - mn || 1;
    var pts = v.map(function (x, i) { return [i / (v.length - 1) * w, 4 + (1 - (x - mn) / rg) * (h - 8)]; });
    var dd = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(""), last = pts[pts.length - 1];
    el.innerHTML = '<path class="a" d="' + dd + "L" + w + " " + h + "L0 " + h + 'Z"/><path class="l" d="' + dd + '"/><circle cx="' + last[0] + '" cy="' + last[1].toFixed(1) + '" r="3"/>';
    var l = el.querySelector(".l");
    if (draw && !reduce && l.getTotalLength) { var len = Math.ceil(l.getTotalLength()); l.style.strokeDasharray = len; l.style.setProperty("--len", len); l.classList.add("draw"); }
  };
  var tmin = function (t) { return +t.slice(0, 2) * 60 + +t.slice(3); };
  var renderPlan = function (freshT) {
    var b = B(), d = D(), n = new Date(), nm = n.getHours() * 60 + n.getMinutes();
    $("[data-o-plan]").textContent = b === BR.gastro ? "Heute reserviert" : "Heute im Kalender";
    $("[data-o-date]").textContent = WD[n.getDay()] + ", " + n.getDate() + "." + (n.getMonth() + 1) + ".";
    var list = b.plan.concat(d.today || []).slice().sort(function (x, y) { return tmin(x[0]) - tmin(y[0]); }), html = "", nowDone = false;
    list.forEach(function (p) {
      if (!nowDone && tmin(p[0]) > nm) { html += '<li class="now"><time>Jetzt</time><u></u></li>'; nowDone = true; }
      html += '<li class="' + (tmin(p[0]) <= nm ? "past" : "") + (p[0] === freshT ? " new" : "") + '"><time>' + p[0] + "</time><i></i><div><b>" + esc(p[1]) + "</b><span>" + esc(p[2]) + "</span></div></li>";
    });
    if (!nowDone) html += '<li class="now"><time>Jetzt</time><u></u></li>';
    $("[data-o-planlist]").innerHTML = html;
  };
  var renderOffice = function () {
    var b = B(), d = D();
    $("[data-o-url]").textContent = b.url;
    $("[data-o-sub]").textContent = b.name + " · heute";
    $("[data-o-tl]").textContent = b.tTile;
    $('[data-o-n="termin"]').textContent = d.termin;
    $('[data-o-n="gutschein"]').textContent = eur(d.gutschein);
    $('[data-o-n="treue"]').textContent = d.treue;
    $('[data-o-n="angebot"]').textContent = d.open + " offen";
    $('[data-o-e="angebot"]').textContent = d.ok + " angenommen";
    var all = d.feed.concat(b.seed.map(function (s) { return { k: s[0], t: s[1], s: s[2], at: s[3] }; }));
    feedEl.innerHTML = all.map(function (e, i) {
      return '<li' + (e.fresh ? ' class="new"' : "") + '><i style="--c:' + COLORS[e.k] + '">' + ico(ICONS[e.k]) + "</i><div><b>" + esc(e.t) + "</b><span>" + esc(e.s) + "</span></div><time>" + esc(e.at) + "</time></li>";
    }).join("");
    d.feed.forEach(function (e) { e.fresh = false; });
    ["termin", "gutschein", "treue", "angebot"].forEach(function (k) { spark(k, false); });
    renderPlan();
  };
  var tapAt = null;
  app.addEventListener("pointerdown", function (e) { tapAt = { x: e.clientX, y: e.clientY }; }, true);
  var fly = function (k, done) {
    var tile = $('[data-tile="' + k + '"]'), tr = tile.getBoundingClientRect(), pr = $(".play__phone .phone").getBoundingClientRect();
    var from = tapAt && tapAt.x >= pr.left && tapAt.x <= pr.right ? tapAt : { x: pr.left + pr.width / 2, y: pr.top + pr.height * .45 };
    var to = { x: tr.left + 30, y: tr.top + 26 };
    var seen = tr.top > 0 && tr.bottom < innerHeight && from.y > 0 && from.y < innerHeight;
    if (reduce || !seen || !document.body.animate || innerWidth <= 920) { done(); return; }
    var f = document.createElement("span");
    f.className = "fly"; f.style.setProperty("--c", COLORS[k]); f.innerHTML = ico(ICONS[k]);
    document.body.appendChild(f);
    var mx = (from.x + to.x) / 2, my = Math.min(from.y, to.y) - 120;
    f.animate([
      { transform: "translate(" + from.x + "px," + from.y + "px) scale(.3)", opacity: 0 },
      { transform: "translate(" + from.x + "px," + (from.y - 30) + "px) scale(1)", opacity: 1, offset: .16 },
      { transform: "translate(" + mx + "px," + my + "px) scale(1.08) rotate(-8deg)", offset: .56 },
      { transform: "translate(" + to.x + "px," + to.y + "px) scale(.55)", opacity: .9 }
    ], { duration: 820, easing: "cubic-bezier(.45,.05,.3,1)" }).onfinish = function () { f.remove(); done(); };
  };
  var event = function (k, t, s, todayT) {
    var d = new Date(), at = d.getHours() + ":" + pad(d.getMinutes());
    D().feed.unshift({ k: k, t: t, s: s, at: at, fresh: true });
    D().feed = D().feed.slice(0, 12);
    save();
    var tile = $('[data-tile="' + k + '"]');
    fly(k, function () {
      renderOffice(); spark(k, true); if (todayT) renderPlan(todayT);
      tile.classList.remove("flash"); void tile.offsetWidth; tile.classList.add("flash");
      setTimeout(function () { tile.classList.remove("flash"); }, 1600);
    });
    $("[data-toast-t]").textContent = "Im Büro: " + t;
    $("[data-toast-s]").textContent = s;
    var o = $(".office").getBoundingClientRect();
    if (o.top > innerHeight - 120 || o.bottom < 80) {
      toastEl.classList.add("on"); clearTimeout(toastT);
      toastT = setTimeout(function () { toastEl.classList.remove("on"); }, 3600);
    }
  };
  $("[data-o-reset]").addEventListener("click", function () {
    var br = S.br; S = fresh(); S.br = br; save(); applyBranch();
  });

  // Termin / Tisch
  var T = { svc: null, day: null, slot: null };
  var tName = $("[data-t-name]"), tGo = $("[data-t-go]");
  var hash = function (s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; };
  var dayList = function () {
    var out = [], d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (var i = 0; i < 14; i++) { out.push(new Date(d)); d.setDate(d.getDate() + 1); }
    return out;
  };
  var dkey = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  var tCheck = function () { tGo.disabled = !(T.svc !== null && T.day && T.slot && tName.value.trim().length >= 2); };
  var renderSlots = function () {
    var b = B(), box = $("[data-t-slots]");
    if (!T.day) { box.innerHTML = '<p style="grid-column:1/-1;font-size:12.5px;color:#6b7280">Bitte zuerst einen Tag wählen.</p>'; return; }
    var today = dkey(T.day) === dkey(now), nowMin = now.getHours() * 60 + now.getMinutes();
    box.innerHTML = b.times.map(function (t) {
      var m = +t.slice(0, 2) * 60 + +t.slice(3), taken = hash(S.br + dkey(T.day) + t) < .32 || (today && m < nowMin + 60);
      return '<button type="button" data-slot="' + t + '"' + (taken ? " disabled" : "") + ' aria-pressed="' + (T.slot === t) + '">' + t + "</button>";
    }).join("");
  };
  var renderTermin = function () {
    var b = B();
    $("[data-t-title]").textContent = b.tTitle;
    $("[data-t-what]").textContent = b.tWhat;
    $('[data-tab-l="termin"]').textContent = b.tTab;
    $("[data-t-svc]").innerHTML = b.svcs.map(function (s, i) {
      var pr = s[2] === null ? "" : s[2] === 0 ? "kostenlos" : (b === BR.hand && i === 2 ? "ab " : "") + eur(s[2]);
      return '<button type="button" class="opt" data-svc="' + i + '" aria-pressed="' + (T.svc === i) + '"><span>' + esc(s[0]) + (s[1] ? "<small>" + esc(s[1]) + "</small>" : "") + "</span><em>" + pr + "</em></button>";
    }).join("");
    $("[data-t-days]").innerHTML = dayList().map(function (d) {
      var closed = b.closed.indexOf(d.getDay()) >= 0, sel = T.day && dkey(T.day) === dkey(d);
      return '<button type="button" class="day" data-day="' + dkey(d) + '"' + (closed ? " disabled" : "") + ' aria-pressed="' + !!sel + '">' + WD[d.getDay()] + "<b>" + d.getDate() + "</b>" + (closed ? '<span class="sr-only"> geschlossen</span>' : "") + "</button>";
    }).join("");
    renderSlots(); tCheck();
  };
  $("[data-t-svc]").addEventListener("click", function (e) { var o = e.target.closest("[data-svc]"); if (!o) return; T.svc = +o.getAttribute("data-svc"); $$("[data-svc]").forEach(function (x) { x.setAttribute("aria-pressed", x === o); }); tCheck(); });
  $("[data-t-days]").addEventListener("click", function (e) {
    var o = e.target.closest("[data-day]"); if (!o || o.disabled) return;
    var p = o.getAttribute("data-day").split("-"); T.day = new Date(+p[0], +p[1] - 1, +p[2]); T.slot = null;
    $$("[data-day]").forEach(function (x) { x.setAttribute("aria-pressed", x === o); }); renderSlots(); tCheck();
  });
  $("[data-t-slots]").addEventListener("click", function (e) { var o = e.target.closest("[data-slot]"); if (!o || o.disabled) return; T.slot = o.getAttribute("data-slot"); $$("[data-slot]").forEach(function (x) { x.setAttribute("aria-pressed", x === o); }); tCheck(); });
  tName.addEventListener("input", tCheck);
  var icsUrl = null;
  tGo.addEventListener("click", function () {
    var b = B(), s = b.svcs[T.svc], name = tName.value.trim();
    var dt = WD[T.day.getDay()] + ", " + T.day.getDate() + "." + (T.day.getMonth() + 1) + ".";
    $("[data-t-card]").innerHTML = "<b>" + esc(s[0]) + "</b><span>" + dt + " um " + T.slot + " Uhr</span><span>" + esc(b.name) + " · für " + esc(name) + "</span>";
    $("[data-t-msg]").textContent = "Eine Bestätigung kommt per E-Mail, am Vortag eine Erinnerung.";
    var st = dkey(T.day).replace(/-/g, "") + "T" + T.slot.replace(":", "") + "00";
    var mins = (s[1].match(/(\d+)\s*Min/) || [])[1] || (s[1].indexOf("2 Std") >= 0 ? 120 : 60);
    var end = new Date(T.day); end.setHours(+T.slot.slice(0, 2), +T.slot.slice(3) + +mins);
    var en = dkey(end).replace(/-/g, "") + "T" + pad(end.getHours()) + pad(end.getMinutes()) + "00";
    var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//tim-kofler.at//Beispiel//DE", "BEGIN:VEVENT", "UID:" + Date.now() + "@beispiel.tim-kofler.at", "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z", "DTSTART:" + st, "DTEND:" + en, "SUMMARY:" + s[0] + " – " + b.name + " (Beispiel)", "DESCRIPTION:Beispiel-Termin von tim-kofler.at", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    if (icsUrl) URL.revokeObjectURL(icsUrl);
    icsUrl = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    $("[data-t-ics]").href = icsUrl;
    $("[data-t-form]").hidden = true; $("[data-t-done]").hidden = false; $("[data-body]").scrollTop = 0;
    D().termin++;
    var short = name.split(/\s+/); short = short[0] + (short[1] ? " " + short[1][0] + "." : "");
    var isToday = dkey(T.day) === dkey(new Date());
    if (isToday) { D().today = (D().today || []).concat([[T.slot, short, s[0]]]); }
    event("termin", (b === BR.gastro ? "Reservierung: " : "Termin: ") + s[0], short + " · " + dt + " " + T.slot, isToday ? T.slot : null);
  });
  $("[data-t-again]").addEventListener("click", function () { T = { svc: null, day: null, slot: null }; tName.value = ""; $("[data-t-form]").hidden = false; $("[data-t-done]").hidden = true; renderTermin(); });

  var rrect = function (ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };

  // Gutschein
  var G = { amt: null };
  var gFor = $("[data-g-for]"), gFrom = $("[data-g-from]"), gGo = $("[data-g-go]");
  var gCheck = function () { gGo.disabled = !(G.amt && gFor.value.trim() && gFrom.value.trim()); };
  var renderGift = function () {
    $("[data-g-amt]").innerHTML = B().amts.map(function (a) { return '<button type="button" data-amt="' + a + '" aria-pressed="' + (G.amt === a) + '">' + a + " €</button>"; }).join("");
    gCheck();
  };
  $("[data-g-amt]").addEventListener("click", function (e) { var o = e.target.closest("[data-amt]"); if (!o) return; G.amt = +o.getAttribute("data-amt"); $$("[data-amt]").forEach(function (x) { x.setAttribute("aria-pressed", x === o); }); gCheck(); });
  gFor.addEventListener("input", gCheck); gFrom.addEventListener("input", gCheck);
  var voucher = function (b, amt, to, from, code) {
    var W = 1200, H = 720, c = document.createElement("canvas"); c.width = W; c.height = H;
    var x = c.getContext("2d");
    var g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, b.a); g.addColorStop(1, b.a3);
    rrect(x, 0, 0, W, H, 48); x.fillStyle = g; x.fill();
    x.save(); rrect(x, 0, 0, W, H, 48); x.clip();
    var rg = x.createRadialGradient(W * .9, 0, 10, W * .9, 0, 700); rg.addColorStop(0, "rgba(255,255,255,.28)"); rg.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = rg; x.fillRect(0, 0, W, H);
    x.strokeStyle = "rgba(255,255,255,.12)"; x.lineWidth = 46;
    x.beginPath(); x.arc(W * .1, H * 1.05, 260, 0, Math.PI * 2); x.stroke();
    x.beginPath(); x.arc(W * .1, H * 1.05, 150, 0, Math.PI * 2); x.stroke();
    x.restore();
    // Abriss-Linie und Kerben wie bei einem Ticket
    var cut = 800;
    x.globalCompositeOperation = "destination-out";
    x.beginPath(); x.arc(cut, 0, 34, 0, Math.PI * 2); x.arc(cut, H, 34, 0, Math.PI * 2); x.fill();
    x.globalCompositeOperation = "source-over";
    x.setLineDash([14, 14]); x.strokeStyle = "rgba(255,255,255,.55)"; x.lineWidth = 3;
    x.beginPath(); x.moveTo(cut, 50); x.lineTo(cut, H - 50); x.stroke(); x.setLineDash([]);
    x.fillStyle = "#fff"; x.textBaseline = "alphabetic";
    var hd = '"Bricolage", system-ui, sans-serif', bd = '"Inter", system-ui, sans-serif';
    x.font = "700 34px " + bd; x.globalAlpha = .85; x.fillText("GUTSCHEIN", 70, 110); x.globalAlpha = 1;
    x.font = "800 64px " + hd; x.fillText(b.name, 70, 186);
    x.font = "800 220px " + hd; x.fillText(String(amt), 62, 430);
    var aw = x.measureText(String(amt)).width;
    x.font = "800 110px " + hd; x.fillText("€", 62 + aw + 18, 430);
    x.font = "600 38px " + bd;
    var line = "Für " + to + "  ·  von " + from;
    while (x.measureText(line).width > 680 && line.length > 10) line = line.slice(0, -2);
    x.fillText(line, 70, 530);
    x.font = "500 28px " + bd; x.globalAlpha = .8; x.fillText("Nr. " + code, 70, 610); x.fillText("Beispiel von tim-kofler.at", 70, 652); x.globalAlpha = 1;
    // QR-Code rechts
    tkQR.draw(x, "Gutschein " + code + " | " + amt + " EUR | " + b.name, 860, 190, 280, { logo: { text: b.logo, bg: b.a }, ink: "#0d1426", quiet: 1.6 });
    x.font = "600 26px " + bd; x.fillStyle = "#fff"; x.textAlign = "center"; x.fillText("Beim Einlösen", 1000, 530); x.fillText("scannen", 1000, 566); x.textAlign = "left";
    return c.toDataURL("image/png");
  };
  gGo.addEventListener("click", function () {
    var b = B(), to = gFor.value.trim(), from = gFrom.value.trim();
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", code = b.code + "-";
    for (var i = 0; i < 8; i++) { code += chars[Math.floor(Math.random() * chars.length)]; if (i === 3) code += "-"; }
    var url = voucher(b, G.amt, to, from, code);
    $("[data-g-img]").src = url; $("[data-g-dl]").href = url; $("[data-g-dl]").download = "gutschein-" + code + ".png";
    $("[data-g-form]").hidden = true; $("[data-g-done]").hidden = false; $("[data-body]").scrollTop = 0;
    D().gutschein += G.amt;
    event("gutschein", "Gutschein verkauft: " + G.amt + " €", "Für " + to + ", von " + from);
  });
  $("[data-g-again]").addEventListener("click", function () { G.amt = null; gFor.value = ""; gFrom.value = ""; $("[data-g-form]").hidden = false; $("[data-g-done]").hidden = true; renderGift(); });

  // Stempelkarte
  var lGo = $("[data-l-go]");
  var renderLoy = function (fresh) {
    var b = B(), d = D(), L = b.loy, html = "";
    $("[data-l-title]").textContent = b.name + " · Treuekarte";
    $("[data-l-rule]").textContent = L.rule;
    var full = d.stamps >= L.n - 1;
    for (var i = 0; i < L.n; i++) {
      var last = i === L.n - 1, on = !last && i < d.stamps;
      html += '<span class="stamp' + (on ? " on" : "") + (on && fresh && i === d.stamps - 1 ? " new" : "") + (last ? (full ? " ready" : " gift") : "") + '">' + (on ? ico("i-check") : last ? ico("i-gift") : i + 1) + "</span>";
    }
    $("[data-l-stamps]").innerHTML = html;
    $("[data-l-reward]").hidden = !full; $("[data-l-rtext]").textContent = L.reward;
    $("[data-l-btn]").textContent = full ? "Gratis einlösen" : "Code an der Kasse scannen";
    var cv = $("[data-l-qr]"), x = cv.getContext("2d");
    x.clearRect(0, 0, cv.width, cv.height);
    tkQR.draw(x, "Stammkunde K-1042 | " + b.name, 0, 0, cv.width, { logo: { text: b.logo, bg: b.a }, ink: "#111827", quiet: .6 });
  };
  lGo.addEventListener("click", function () {
    var b = B(), d = D();
    if (d.stamps >= b.loy.n - 1) { d.stamps = 0; renderLoy(); event("treue", "Prämie eingelöst", b.loy.what + " · Anna H."); return; }
    d.stamps++;
    if (d.stamps === 1) d.treue++;
    renderLoy(true);
    event("treue", "Stempel vergeben", b.loy.what + " · Anna H. (" + d.stamps + " von " + (b.loy.n - 1) + ")");
  });

  // Angebot mit Unterschrift
  var sig = $("[data-a-sig]"), sx = sig.getContext("2d"), ink = 0, drawing = false, lastPt = null, aGo = $("[data-a-go]");
  var sizeSig = function () {
    var r = sig.getBoundingClientRect(); if (!r.width) return;
    var dpr = Math.min(3, devicePixelRatio || 1), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (sig.width === w && sig.height === h) return;
    sig.width = w; sig.height = h; sx.setTransform(dpr, 0, 0, dpr, 0, 0); ink = 0; aGo.disabled = true;
  };
  var pt = function (e) { var r = sig.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  sig.addEventListener("pointerdown", function (e) { drawing = true; lastPt = pt(e); sig.setPointerCapture(e.pointerId); e.preventDefault(); });
  sig.addEventListener("pointermove", function (e) {
    if (!drawing) return; var p = pt(e);
    sx.strokeStyle = "#1e2a78"; sx.lineWidth = 2.4; sx.lineCap = "round"; sx.lineJoin = "round";
    sx.beginPath(); sx.moveTo(lastPt.x, lastPt.y); sx.lineTo(p.x, p.y); sx.stroke();
    ink += Math.hypot(p.x - lastPt.x, p.y - lastPt.y); lastPt = p;
    aGo.disabled = ink < 60;
  });
  var stop = function () { drawing = false; };
  sig.addEventListener("pointerup", stop); sig.addEventListener("pointercancel", stop);
  $("[data-a-clr]").addEventListener("click", function () { sx.clearRect(0, 0, sig.width, sig.height); ink = 0; aGo.disabled = true; });
  var renderOffer = function () {
    var o = B().offer, sum = 0;
    $("[data-a-title]").textContent = o.t; $("[data-a-no]").textContent = "Angebot Nr. " + o.no;
    $("[data-a-items]").innerHTML = o.items.map(function (it) { sum += it[2]; return "<tr><td>" + esc(it[0]) + (it[1] ? "<small>" + esc(it[1]) + "</small>" : "") + "</td><td>" + eur2(it[2]) + "</td></tr>"; }).join("");
    $("[data-a-sum]").textContent = eur2(sum); $("[data-a-tax]").textContent = o.tax;
    var st = $("[data-a-st]"); st.textContent = "Offen"; st.classList.remove("ok");
    $("[data-a-signwrap]").hidden = false; $("[data-a-signed]").hidden = true;
    aGo.hidden = false; $("[data-a-again]").hidden = true;
    sx.clearRect(0, 0, sig.width, sig.height); ink = 0; aGo.disabled = true;
    return sum;
  };
  aGo.addEventListener("click", function () {
    var d = new Date(), b = B();
    $("[data-a-sigimg]").src = sig.toDataURL("image/png");
    $("[data-a-when]").textContent = "Unterschrieben am " + d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear() + " um " + d.getHours() + ":" + pad(d.getMinutes()) + " Uhr";
    var st = $("[data-a-st]"); st.textContent = "Angenommen"; st.classList.add("ok");
    $("[data-a-signwrap]").hidden = true; $("[data-a-signed]").hidden = false;
    aGo.hidden = true; $("[data-a-again]").hidden = false; $("[data-body]").scrollTop = 0;
    var sum = b.offer.items.reduce(function (s, i) { return s + i[2]; }, 0);
    D().ok++; D().open = Math.max(0, D().open - 1);
    event("angebot", "Angebot angenommen", b.offer.t + " · " + eur2(sum));
  });
  $("[data-a-again]").addEventListener("click", function () { renderOffer(); requestAnimationFrame(sizeSig); });

  // Branche wechseln
  var applyBranch = function () {
    var b = B();
    demo.style.setProperty("--vc", b.a); demo.style.setProperty("--vc2", b.a2);
    $("[data-b-logo]").textContent = b.logo; $("[data-b-name]").textContent = b.name; $("[data-b-open]").textContent = b.open;
    $$("[data-br]").forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-br") === S.br ? "true" : "false"); });
    T = { svc: null, day: null, slot: null }; G.amt = null;
    $("[data-t-form]").hidden = false; $("[data-t-done]").hidden = true; $("[data-g-form]").hidden = false; $("[data-g-done]").hidden = true;
    renderTermin(); renderGift(); renderLoy(); renderOffer(); renderOffice();
  };
  $$("[data-br]").forEach(function (x) { x.addEventListener("click", function () { S.br = x.getAttribute("data-br"); save(); applyBranch(); }); });
  addEventListener("resize", function () { if (tab === "angebot") sizeSig(); });
  applyBranch();

  // Hell/Dunkel-Schalter im Büro (gilt für die ganze Seite)
  var root = document.documentElement, sw = $("[data-theme-sw]");
  var isLight = function () { var t = root.getAttribute("data-theme"); return t ? t === "light" : !!(window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches); };
  var syncSw = function () { var l = isLight(); sw.setAttribute("aria-checked", l); sw.setAttribute("aria-label", l ? "Dunkle Ansicht" : "Helle Ansicht"); };
  try { var th = localStorage.getItem("ba-theme2"); if (th === "light" || th === "dark") root.setAttribute("data-theme", th); } catch (e) {}
  syncSw();
  sw.addEventListener("click", function () {
    var t = isLight() ? "dark" : "light";
    root.setAttribute("data-theme", t); syncSw();
    try { localStorage.setItem("ba-theme2", t); } catch (e) {}
  });
  if (window.matchMedia) { var mq = matchMedia("(prefers-color-scheme: light)"); if (mq.addEventListener) mq.addEventListener("change", syncSw); }
  setInterval(function () { renderPlan(); }, 60000);

  /* ---------------- Abo-Rechner ---------------- */
  var SUBS = [
    ["Online-Terminbuchung", "Buchungstool mit Erinnerungen", 39, 1],
    ["Gutschein-Verkauf", "Online-Shop für Gutscheine", 29, 1],
    ["Digitale Stempelkarte", "Treue-App für Stammkunden", 35, 1],
    ["Angebote & Online-Unterschrift", "E-Signatur-Dienst", 25, 1],
    ["Rechnungsprogramm", "Rechnungen und Mahnungen", 15, 1],
    ["Kundenkartei", "Kundenverwaltung im Abo", 20, 1],
    ["Website-Baukasten", "Homepage im Abo", 25, 1],
    ["SMS-Erinnerungen", "Paket mit Nachrichten", 15, 0]
  ];
  var CK = "tk-betriebsapp-rechner-v1", saved = store.get(CK);
  var subsEl = $("[data-subs]");
  subsEl.innerHTML = SUBS.map(function (s, i) {
    var on = saved && saved[i] ? saved[i][0] : s[3], pr = saved && saved[i] ? saved[i][1] : s[2];
    return '<div class="sub' + (on ? "" : " off") + '"><input type="checkbox" id="sub' + i + '"' + (on ? " checked" : "") + '><label for="sub' + i + '">' + esc(s[0]) + "<small>" + esc(s[1]) + '</small></label><span class="sub__p"><input type="number" inputmode="decimal" min="0" max="999" step="1" value="' + pr + '" aria-label="Preis pro Monat für ' + esc(s[0]) + '">€<span class="mo">/ Monat</span></span></div>';
  }).join("");
  var chart = $("[data-r-chart]"), cta = $("[data-r-cta]");
  var calc = function () {
    var m = 0, n = 0, st = [];
    $$(".sub", subsEl).forEach(function (row) {
      var cb = row.querySelector("[type=checkbox]"), v = parseFloat(row.querySelector("[type=number]").value.replace(",", ".")) || 0;
      v = clamp(v, 0, 9999); row.classList.toggle("off", !cb.checked);
      if (cb.checked) { m += v; n++; }
      st.push([cb.checked ? 1 : 0, v]);
    });
    store.set(CK, st);
    $("[data-r-m]").textContent = eur(m); $("[data-r-y]").textContent = eur(m * 12); $("[data-r-n]").textContent = n;
    $("[data-r-5]").textContent = eur(m * 60);
    // Diagramm: 60 Monate laufende Kosten
    var W = 520, H = 210, L = 46, R = 10, Tp = 10, Bt = 26, max = Math.max(m * 60, 600), web = 8;
    var nice = [600, 1200, 3000, 6000, 12000, 18000, 24000, 36000, 60000, 120000, 600000], top = nice.filter(function (v) { return v >= max; })[0] || max;
    var X = function (i) { return L + (W - L - R) * i / 60; }, Y = function (v) { return Tp + (H - Tp - Bt) * (1 - v / top); };
    var g = "", k;
    for (k = 0; k <= 4; k++) { var v = top * k / 4; g += '<line class="gl" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text x="' + (L - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + (v >= 1000 ? (v / 1000).toLocaleString("de-DE") + " Tsd." : Math.round(v)) + "</text>"; }
    for (k = 0; k <= 5; k++) g += '<text x="' + X(k * 12) + '" y="' + (H - 6) + '" text-anchor="middle">' + (k ? "Jahr " + k : "heute") + "</text>";
    var pts = "", pts2 = "";
    for (k = 0; k <= 60; k++) { pts += X(k).toFixed(1) + "," + Y(m * k).toFixed(1) + " "; pts2 += X(k).toFixed(1) + "," + Y(web * k).toFixed(1) + " "; }
    chart.innerHTML = '<defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6b6b" stop-opacity=".32"/><stop offset="1" stop-color="#ff6b6b" stop-opacity="0"/></linearGradient></defs>' + g +
      '<polygon class="a1" points="' + X(0) + "," + Y(0) + " " + pts + X(60) + "," + Y(0) + '"/><polyline class="l1" points="' + pts + '"/><polyline class="l2" points="' + pts2 + '"/>' +
      '<line class="ax" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(0) + '" y2="' + Y(0) + '"/>';
  };
  subsEl.addEventListener("input", calc); subsEl.addEventListener("change", calc);
  calc();
})();
