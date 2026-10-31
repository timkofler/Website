// Landgasthof Hollerhof – Beispielseite. Navigation, Wochenmenü (heute markiert),
// scroll-gebundenes Anrichten des Schweinsbratens, Reservierung (Attrappe), Öffnungsstatus.
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var SVGNS = "http://www.w3.org/2000/svg";
  var DEMO_MSG = "Das ist ein Beispiel – auf der echten Seite käme Ihre Anfrage jetzt direkt beim Betrieb an.";
  var now = new Date();

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

  /* ---------- Wochenmenü ---------- */
  var MENU = {
    3: { s: "Frittatensuppe", a: "Faschierter Braten mit Erdäpfelpüree und Bratensaft", v: "Eierschwammerl-Knödel mit Rahmsauce", d: "Apfelstrudel" },
    4: { s: "Grießnockerlsuppe", a: "Mostviertler Bratl mit Speckkraut und Semmelknödel", v: "Kürbisrisotto mit Kernöl und Bergkäse", d: "Topfenpalatschinke" },
    5: { s: "Knoblauchcremesuppe mit Schwarzbrot-Croûtons", a: "Gebackenes Forellenfilet mit Erdäpfelsalat", v: "Spinatknödel mit brauner Butter", d: "Mohnnudeln" }
  };
  var WD = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"], WS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  var MON = ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  var daysEl = $("#days"), card = $("#daycard");
  var monday = new Date(now); monday.setHours(12, 0, 0, 0); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  var todayW = now.getDay(), btns = [];
  for (var i = 0; i < 5; i++) {
    var d = new Date(monday); d.setDate(monday.getDate() + i);
    var b = document.createElement("button");
    b.type = "button"; b.setAttribute("role", "tab"); b.id = "tab-" + (i + 1); b.setAttribute("aria-controls", "daycard");
    b.dataset.w = i + 1; b.dataset.date = d.getDate() + ". " + MON[d.getMonth()];
    b.innerHTML = "<small>" + WS[i + 1] + "</small>" + d.getDate() + "." + (d.getMonth() + 1) + ".";
    b.setAttribute("aria-label", WD[i + 1] + ", " + b.dataset.date + (i + 1 === todayW ? " (heute)" : ""));
    if (i + 1 === todayW) b.classList.add("is-today");
    daysEl.appendChild(b); btns.push(b);
  }
  function showDay(w, focus) {
    btns.forEach(function (x) { var on = +x.dataset.w === w; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1; if (on && focus) x.focus(); });
    var btn = btns[w - 1]; card.setAttribute("aria-labelledby", btn.id);
    var m = MENU[w];
    if (!m) {
      card.innerHTML = '<div class="rest"><svg viewBox="0 0 100 100" aria-hidden="true"><use href="#crest"/></svg><h3>' + WD[w] + ' ist Ruhetag</h3><p>Wir sammeln Kraft, holen frisches Gemüse vom Bauern und schärfen die Messer.<br>Ab Mittwoch kochen wir wieder für Sie.</p></div>';
    } else {
      card.innerHTML = '<div><p class="date">' + WD[w] + ", " + btn.dataset.date + (w === todayW ? " · heute" : "") + '</p><h3>Mittagsmenü</h3><ul class="courses">' +
        "<li><small>Suppe</small><span>" + m.s + "</span></li>" +
        "<li><small>Menü I</small><span>" + m.a + "</span></li>" +
        "<li><small>Menü II</small><span>" + m.v + "<em>VEG</em></span></li>" +
        "<li><small>Dessert</small><span>" + m.d + "</span></li></ul></div>" +
        '<div class="mprice"><b>11,90 €</b><small>Suppe + Hauptspeise<br>mit Dessert 13,90 €</small></div>';
    }
    card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap");
  }
  btns.forEach(function (x, i) {
    x.addEventListener("click", function () { showDay(+x.dataset.w); });
    x.addEventListener("keydown", function (e) {
      var n = null;
      if (e.key === "ArrowRight") n = (i + 1) % 5; if (e.key === "ArrowLeft") n = (i + 4) % 5;
      if (e.key === "Home") n = 0; if (e.key === "End") n = 4;
      if (n !== null) { e.preventDefault(); showDay(n + 1, true); }
    });
  });
  showDay(todayW >= 1 && todayW <= 5 ? todayW : 3);

  /* ---------- „Heute“-Leiste & Öffnungszeiten ---------- */
  (function () {
    var H = { 0: [9, 17], 1: null, 2: null, 3: [10, 23], 4: [10, 23], 5: [10, 23], 6: [10, 23] };
    var h = now.getHours() + now.getMinutes() / 60, r = H[todayW], open = r && h >= r[0] && h < r[1];
    var row = $('#htab tr[data-d="' + todayW + '"]'); if (row) row.classList.add("today");
    $("#today-dot").classList.toggle("on", !!open);
    var m = MENU[todayW], t;
    if (!r) t = "<b>Heute Ruhetag</b> · ab Mittwoch wieder geöffnet";
    else if (m) t = "<b>" + (open ? "Jetzt geöffnet" : "Heute") + "</b> · Mittag: " + m.a.split(" mit ")[0] + " · 11,90 €";
    else t = "<b>" + (open ? "Jetzt geöffnet" : "Heute geöffnet") + "</b> · bis " + r[1] + ":00 Uhr";
    $("#today-t").innerHTML = t;
  })();

  /* ---------- Anrichten, an den Scroll gekoppelt ---------- */
  var sec = $("#anrichten");
  if (sec) (function () {
    var sticky = $(".pl__sticky", sec), plate = $("#pl-plate"), cut = $("#pl-cutlery"), sauce = $("#pl-sauce"), pour = $("#pl-pour"),
      slices = $$("#pl-meat .slice"), kn = $$("#pl-kn .kn"), herbsG = $("#pl-herbs"), steam = $("#pl-steam"), label = $("#pl-label"),
      steps = $$("#pl-steps li"), barI = $("#pl-bar"), nowEl = $("#pl-now");
    // Endlage: x, y, Drehung (Scheiben fächerförmig, Knödel leicht überlappend)
    var SL = [[356, 236, -14], [368, 290, -4], [372, 344, 6]], KN = [[220, 262, 8], [238, 364, -12]];
    // Kräuter: gehackte Petersilie und Schnittlauchröllchen, landen auf Braten, Knödel und Saft
    var seed = 5; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    var herbs = [], spots = [[356, 236, 60, 26], [368, 290, 60, 26], [372, 344, 60, 30], [220, 262, 36, 34], [238, 364, 36, 34], [300, 330, 110, 70]];
    for (var i = 0; i < 38; i++) {
      var g = document.createElementNS(SVGNS, "g"), kind = i % 3, sh;
      if (kind === 0) { // Schnittlauchröllchen
        sh = document.createElementNS(SVGNS, "circle"); sh.setAttribute("r", 1.5 + rnd() * .5);
        sh.setAttribute("fill", "#7fae55"); sh.setAttribute("stroke", "#2f6b23"); sh.setAttribute("stroke-width", 1.1);
      } else { // Petersilie: unregelmäßige Blattstückchen
        sh = document.createElementNS(SVGNS, "path"); var w = 2.6 + rnd() * 2.2, h = 2 + rnd() * 1.8;
        sh.setAttribute("d", "M" + (-w) + " " + (-h * .3) + " L" + (-w * .2) + " " + (-h) + " L" + (w * .7) + " " + (-h * .6) + " L" + w + " " + (h * .4) + " L" + (w * .1) + " " + h + " L" + (-w * .8) + " " + (h * .7) + "Z");
        sh.setAttribute("fill", kind === 1 ? "#2f6b23" : "#438a30"); sh.setAttribute("stroke", "#24521a"); sh.setAttribute("stroke-width", .5); sh.setAttribute("stroke-linejoin", "round");
      }
      g.appendChild(sh); herbsG.appendChild(g);
      var sp = spots[Math.floor(rnd() * spots.length)], a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd());
      herbs.push({ g: g, x: sp[0] + Math.cos(a) * sp[2] * rr, y: sp[1] + Math.sin(a) * sp[3] * rr, r: rnd() * 360, dx: (rnd() - .5) * 40, t: rnd() });
    }
    function cl(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
    function seg(p, a, b) { return cl((p - a) / (b - a)); }
    function eo(t) { return 1 - Math.pow(1 - t, 3); }
    function eio(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    // Ablegen: kommt von oben (etwas größer, also näher an der Kamera) und senkt sich sanft
    function place(el, f, t, lift) {
      var e = eio(t), sc = 1 + .16 * (1 - e), y = f[1] - lift * (1 - e), rot = f[2] + (1 - e) * 10;
      el.setAttribute("transform", "translate(" + f[0] + " " + y.toFixed(1) + ") rotate(" + rot.toFixed(1) + ") scale(" + sc.toFixed(3) + ")");
      el.setAttribute("opacity", Math.min(1, t * 4).toFixed(2));
    }
    function render(p) {
      var k = eo(seg(p, 0, .1));
      plate.style.transform = "scale(" + (.9 + .1 * k).toFixed(4) + ")"; plate.style.opacity = k.toFixed(3);
      cut.setAttribute("opacity", eo(seg(p, .04, .14)).toFixed(3));
      var s = eo(seg(p, .12, .32));
      pour.setAttribute("r", (230 * s).toFixed(1)); sauce.style.opacity = s > 0 ? 1 : 0;
      slices.forEach(function (el, i) { place(el, SL[i], seg(p, .32 + i * .06, .46 + i * .06), 90); });
      kn.forEach(function (el, i) { place(el, KN[i], seg(p, .52 + i * .07, .66 + i * .07), 70); });
      herbs.forEach(function (h) {
        var t = eo(seg(p, .72 + h.t * .1, .8 + h.t * .1));
        h.g.setAttribute("transform", "translate(" + (h.x + h.dx * (1 - t)).toFixed(1) + " " + (h.y - 70 * (1 - t)).toFixed(1) + ") rotate(" + (h.r + 120 * (1 - t)).toFixed(0) + ") scale(" + (1 + .8 * (1 - t)).toFixed(2) + ")");
        h.g.setAttribute("opacity", Math.min(1, t * 2).toFixed(2));
      });
      steam.classList.toggle("on", p > .9);
      label.classList.toggle("on", p > .92);
      var st = p < .1 ? 0 : p < .3 ? 1 : p < .5 ? 2 : p < .7 ? 3 : p < .9 ? 4 : 5;
      steps.forEach(function (li, i) { li.classList.toggle("on", i <= st); });
      if (nowEl && nowEl.textContent !== steps[st].textContent) nowEl.textContent = steps[st].textContent;
      if (barI) barI.style.transform = "scaleX(" + p.toFixed(3) + ")";
    }
    if (reduce) { sec.classList.add("static"); render(1); return; }
    var target = 0, cur = 0, raf = 0;
    function measure() {
      var r = sec.getBoundingClientRect(), top = parseFloat(getComputedStyle(sticky).top) || 0;
      var total = sec.offsetHeight - sticky.offsetHeight;
      target = cl((top - r.top) / (total || 1));
    }
    function tick() {
      cur += (target - cur) * .16;
      if (Math.abs(target - cur) < .0008) cur = target;
      render(cur);
      raf = cur !== target ? requestAnimationFrame(tick) : 0;
    }
    function onScroll() { measure(); if (!raf) raf = requestAnimationFrame(tick); }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    measure(); cur = target; render(cur);
  })();

  /* ---------- Reservierung (Attrappe) ---------- */
  var pers = 2, out = $("#pers");
  function setP(n) { pers = Math.max(1, Math.min(12, n)); out.textContent = pers + (pers === 1 ? " Person" : " Personen"); }
  $("#p-minus").addEventListener("click", function () { setP(pers - 1); });
  $("#p-plus").addEventListener("click", function () { setP(pers + 1); });
  var dIn = $("#r-date"); if (dIn) {
    var t = new Date(now); while (t.getDay() === 1 || t.getDay() === 2) t.setDate(t.getDate() + 1);
    function iso(x) { return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); }
    dIn.value = iso(t); dIn.min = iso(now);
  }
  var form = $("#form"), msg = $("#msg");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var dd = dIn && dIn.value ? new Date(dIn.value + "T12:00") : null;
    msg.textContent = (dd && (dd.getDay() === 1 || dd.getDay() === 2) ? "Hinweis: Montag und Dienstag ist Ruhetag. " : "") + DEMO_MSG;
    msg.classList.add("on");
  });

  /* ---------- Speisekarte selbst pflegen (Demo, nur im Browser) ---------- */
  var diy = $("#selbst");
  if (diy) (function () {
    var INIT = {
      cats: [
        { id: "vor", t: "Vorspeisen", items: [
          { n: "Frittatensuppe", d: "Kräftige Rindsuppe mit hausgemachten Frittaten", p: 490 },
          { n: "Leberknödelsuppe", d: "Ein großer Knödel, wie er sein muss", p: 520 },
          { n: "Kürbiscremesuppe", d: "Mit steirischem Kernöl und gerösteten Kernen", p: 540, v: 1 },
          { n: "Liptauer-Brettl", d: "Hausgemachter Liptauer, Radieschen, Bauernbrot", p: 690, v: 1 }] },
        { id: "haupt", t: "Hauptspeisen", items: [
          { n: "Wiener Schnitzel vom Kalb", d: "In Butterschmalz gebacken, Petersilerdäpfel, Preiselbeeren", p: 2190 },
          { n: "Schweinsbraten", d: "Mit knuspriger Kruste, Serviettenknödel und warmem Speckkraut", p: 1690 },
          { n: "Zwiebelrostbraten", d: "Vom Mostviertler Rind, Röstzwiebel, Braterdäpfel", p: 2450 },
          { n: "Eierschwammerl-Gulasch", d: "Mit Serviettenknödel und Sauerrahm", p: 1450, v: 1 }] },
        { id: "mehl", t: "Mehlspeisen", items: [
          { n: "Apfelstrudel", d: "Mit Schlagobers oder Vanilleeis", p: 590 },
          { n: "Kaiserschmarrn", d: "Mit Zwetschkenröster – für Hungrige oder zu zweit", p: 1090 },
          { n: "Mohnnudeln", d: "In Butter geschwenkt, mit Staubzucker", p: 790 }] }
      ],
      week: { 3: { s: MENU[3].s, a: MENU[3].a, v: MENU[3].v, d: MENU[3].d }, 4: { s: MENU[4].s, a: MENU[4].a, v: MENU[4].v, d: MENU[4].d }, 5: { s: MENU[5].s, a: MENU[5].a, v: MENU[5].v, d: MENU[5].d } },
      wp: 1190, wpd: 1390
    };
    var SPECIAL = [["Maronisuppe mit Rahmhäubchen", 540], ["Wildragout mit Serviettenknödel", 1890], ["Zwetschkenknödel in Butterbröseln", 850]];
    var ICON = {
      crest: '<svg aria-hidden="true" viewBox="0 0 100 100"><use href="#crest"/></svg>',
      del: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>',
      plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
      arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
      pdf: '<svg viewBox="0 0 44 54" aria-hidden="true"><path d="M4 2h26l12 12v36a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#fff" stroke="#c9bba3" stroke-width="2"/><path d="M30 2v12h12" fill="#efe6d4" stroke="#c9bba3" stroke-width="2"/><rect x="2" y="30" width="30" height="14" rx="2" fill="#6d1f2a"/><text x="17" y="40.5" text-anchor="middle" font-family="Nunito Sans,sans-serif" font-weight="800" font-size="9" fill="#fff">PDF</text></svg>',
      // Foto einer handgeschriebenen Tageskarte (als Grafik)
      photo: '<svg viewBox="0 0 320 200" aria-hidden="true"><defs><linearGradient id="dy-tb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b79f7c"/><stop offset="1" stop-color="#8f7656"/></linearGradient></defs><rect width="320" height="200" fill="url(#dy-tb)"/><path d="M0 40h320M0 95h320M0 150h320" stroke="#7e6748" stroke-width="1" opacity=".35"/>' +
        '<g transform="rotate(-2.5 160 100)"><rect x="46" y="16" width="228" height="172" rx="3" fill="#000" opacity=".22" transform="translate(4 5)"/><rect x="46" y="16" width="228" height="172" rx="3" fill="#fbf6ea"/>' +
        '<path d="M58 62h204M58 92h204M58 122h204M58 152h204" stroke="#bcd0e6" stroke-width="1"/><rect x="138" y="8" width="44" height="16" fill="#e8dcc0" opacity=".85" transform="rotate(4 160 16)"/>' +
        '<g font-family="Playfair,Georgia,serif" font-style="italic" fill="#24386b"><text x="160" y="48" text-anchor="middle" font-size="21" font-weight="700">Heute empfehlen wir!</text>' +
        '<path d="M88 54c30 4 110 4 144-1" stroke="#a33a3a" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<text x="60" y="86" font-size="15">Maronisuppe</text><text x="258" y="86" font-size="15" text-anchor="end">5,40</text>' +
        '<text x="60" y="116" font-size="15">Wildragout m. Knödel</text><text x="258" y="116" font-size="15" text-anchor="end">18,90</text>' +
        '<text x="60" y="146" font-size="15">Zwetschkenknödel</text><text x="258" y="146" font-size="15" text-anchor="end">8,50</text>' +
        '<text x="258" y="176" font-size="13" text-anchor="end">Mahlzeit! – Maria</text></g></g></svg>'
    };
    var S, uid = 0;
    function clone(o) { return JSON.parse(JSON.stringify(o)); }
    function reset() {
      S = clone(INIT);
      S.cats.forEach(function (c) { c.items.forEach(function (it) { it.id = "d" + (++uid); it.off = false; }); });
      S.logged = false; S.tab = "karte"; S.cat = "haupt"; S.day = todayW >= 3 && todayW <= 5 ? todayW : 3;
      S.special = null; S.pdf = false; S.changes = 0; S.saved = false; S.up = { photo: 0, pdf: 0 };
    }
    var ed = $("#ed-in"), pv = $("#pv"), pvState = $("#pv-state"), live = $("#diy-live"), stepsEl = $$("#diy-steps li");
    var mobile = window.matchMedia("(max-width:860px)");
    function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
    function fmt(c) { return (c / 100).toFixed(2).replace(".", ","); }
    function parse(v) { v = String(v).trim().replace(/\s|€/g, "").replace(",", "."); if (!/^\d{1,3}(\.\d{0,2})?$/.test(v)) return null; return Math.round(parseFloat(v) * 100); }
    function cat() { for (var i = 0; i < S.cats.length; i++) if (S.cats[i].id === S.cat) return S.cats[i]; }
    function item(id) { var r = null; S.cats.forEach(function (c) { c.items.forEach(function (it) { if (it.id === id) r = it; }); }); return r; }
    var annT; function announce(t, delay) { clearTimeout(annT); annT = setTimeout(function () { live.textContent = t; }, delay || 0); }

    function steps() {
      var st = !S.logged ? 0 : S.saved ? 3 : 1;
      stepsEl.forEach(function (li, i) { li.classList.toggle("done", i < st); li.classList.toggle("on", i === st); });
    }
    function touched(msg) {
      S.changes++; S.saved = false;
      pvState.textContent = "Entwurf"; pvState.classList.add("draft");
      updSave(); steps(); if (msg) announce("Vorschau aktualisiert: " + msg, 700);
    }

    /* --- Editor (Handy) --- */
    function renderEd(focusSel) {
      if (!S.logged) {
        ed.innerHTML = '<div class="lg"><div class="lg__top">' + ICON.crest + '<b>Hollerhof</b></div>' +
          '<div class="lg__card"><h3>Willkommen zurück</h3><p>Melden Sie sich an, um Ihre Karte zu bearbeiten.</p>' +
          '<label class="fld"><span>E-Mail</span><input type="email" value="maria@hollerhof.example" readonly autocomplete="off"></label>' +
          '<label class="fld"><span>Passwort</span><input type="password" value="hollerhof" readonly autocomplete="off"></label>' +
          '<button type="button" class="abtn" id="dy-login">Anmelden ' + ICON.arrow + '</button></div>' +
          '<p class="lg__hint">Für die Demo ist alles schon ausgefüllt –<br>einfach auf „Anmelden“ tippen.</p></div>';
        return;
      }
      var h = '<div class="app"><div class="app__hd"><div class="app__hrow">' + ICON.crest + '<span><b>Speisekarte bearbeiten</b><small>Landgasthof Hollerhof</small></span><span class="app__av" aria-label="Angemeldet als Maria">M</span></div>' +
        '<div class="tabs" role="tablist" aria-label="Bereiche">' +
        [["karte", "Speisekarte"], ["woche", "Wochenmenü"], ["upload", "Foto / PDF"]].map(function (t) {
          var on = S.tab === t[0];
          return '<button type="button" role="tab" id="dy-t-' + t[0] + '" aria-controls="dy-p" aria-selected="' + on + '" tabindex="' + (on ? 0 : -1) + '" data-tab="' + t[0] + '">' + t[1] + "</button>";
        }).join("") + "</div></div>" +
        '<div class="app__bd" id="dy-p" role="tabpanel" aria-labelledby="dy-t-' + S.tab + '">';
      if (S.tab === "karte") {
        h += '<div class="chips" role="group" aria-label="Kategorie wählen">' + S.cats.map(function (c) {
          return '<button type="button" data-cat="' + c.id + '" aria-pressed="' + (S.cat === c.id) + '">' + c.t + "</button>";
        }).join("") + "</div>";
        cat().items.forEach(function (it) {
          h += '<div class="er' + (it.off ? " off" : "") + (it.isNew ? " new" : "") + '" data-id="' + it.id + '">' +
            '<input class="er__n" data-f="n" value="' + esc(it.n) + '" aria-label="Name des Gerichts" maxlength="60" autocomplete="off">' +
            '<div class="er__r"><label class="er__p"><span aria-hidden="true">€</span><input data-f="p" inputmode="decimal" value="' + fmt(it.p) + '" aria-label="Preis in Euro für ' + esc(it.n) + '" autocomplete="off"></label>' +
            '<button type="button" class="sw" role="switch" aria-checked="' + !!it.off + '" data-f="off"><i aria-hidden="true"></i><span>heute aus</span></button>' +
            '<button type="button" class="er__del" data-f="del" aria-label="' + esc(it.n) + ' von der Karte nehmen">' + ICON.del + "</button></div></div>";
          it.isNew = false;
        });
        h += '<button type="button" class="addb" id="dy-add">' + ICON.plus + "Gericht hinzufügen</button>";
      } else if (S.tab === "woche") {
        var w = S.week[S.day];
        h += '<div class="wdays" role="group" aria-label="Tag wählen">' + [3, 4, 5].map(function (d) {
          return '<button type="button" data-day="' + d + '" aria-pressed="' + (S.day === d) + '"><small>' + WS[d] + "</small>" + WD[d] + "</button>";
        }).join("") + "</div>" +
          '<div class="wcard">' +
          [["s", "Suppe"], ["a", "Menü I"], ["v", "Menü II (vegetarisch)"], ["d", "Dessert"]].map(function (f) {
            return '<label class="fld"><span>' + f[1] + '</span><input data-w="' + f[0] + '" value="' + esc(w[f[0]]) + '" maxlength="80" autocomplete="off"></label>';
          }).join("") +
          '<div class="f2x"><label class="fld"><span>Preis Menü</span><input data-w="wp" inputmode="decimal" value="' + fmt(S.wp) + '" autocomplete="off"></label>' +
          '<label class="fld"><span>Mit Dessert</span><input data-w="wpd" inputmode="decimal" value="' + fmt(S.wpd) + '" autocomplete="off"></label></div></div>';
      } else {
        var u = S.up;
        h += '<div class="up' + (u.photo === 1 ? " scanning" : "") + '"><h4>Foto der Kreidetafel oder Zettel</h4><p>Abfotografieren, hochladen – die Gerichte landen in Ihrer Karte.</p>' +
          '<div class="up__img">' + ICON.photo + '<span class="up__scan"></span></div>';
        if (u.photo === 0) h += '<button type="button" class="abtn sec2" id="dy-photo">Beispiel-Foto hochladen</button>';
        else if (u.photo === 1) h += '<button type="button" class="abtn sec2" disabled>Wird gelesen …</button>';
        else if (u.photo === 2) h += '<ul class="up__res">' + SPECIAL.map(function (x, i) { return '<li style="animation-delay:' + (i * .12) + 's">' + esc(x[0]) + "<span>" + fmt(x[1]) + "</span></li>"; }).join("") + '</ul><button type="button" class="abtn" id="dy-take">Als Tagesempfehlung übernehmen</button>';
        else h += '<p class="up__ok">✓ Als Tagesempfehlung auf der Seite</p>';
        h += '</div><div class="up"><h4>Fertige Speisekarte als PDF</h4><p>Ihre gedruckte Karte zusätzlich zum Herunterladen anbieten.</p>' +
          '<div class="up__pdf">' + ICON.pdf + '<span><b>speisekarte-herbst.pdf</b><br><small>2 Seiten · 240 KB</small></span></div>';
        if (u.pdf === 0) h += '<button type="button" class="abtn ghost" id="dy-pdf">Beispiel-PDF hochladen</button>';
        else if (u.pdf === 1) h += '<div class="up__bar"><i id="dy-bar"></i></div>';
        else h += '<p class="up__ok">✓ Hochgeladen – Gäste können es öffnen</p>';
        h += "</div>";
      }
      h += '</div><div class="savebar"><button type="button" class="abtn" id="dy-save"></button></div></div>' +
        '<div class="toast" id="dy-toast" role="status"><b aria-hidden="true">✓</b><span></span></div>';
      ed.innerHTML = h;
      updSave();
      if (focusSel) { var f = $(focusSel, ed); if (f) { f.focus(); if (f.select) f.select(); } }
    }
    function updSave() {
      var b = $("#dy-save", ed); if (!b) return;
      b.classList.toggle("clean", !S.changes);
      b.innerHTML = S.changes ? "Speichern <em>" + S.changes + "</em>" : S.saved ? "✓ Alles gespeichert" : "Speichern";
      b.setAttribute("aria-label", S.changes ? "Speichern – " + S.changes + (S.changes === 1 ? " Änderung" : " Änderungen") : "Speichern – keine offenen Änderungen");
    }
    var toastT;
    function toast(t) {
      var el = $("#dy-toast", ed); if (!el) return;
      $("span", el).textContent = t; el.classList.add("on");
      clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove("on"); }, 3200);
    }

    /* --- Vorschau (so sieht es der Gast) --- */
    function renderPv(flashId) {
      var w = S.week[S.day], c = cat();
      var h = '<div class="pv__wk" data-k="wk"><div class="pv__wkh"><small>Wochenmenü · ' + WD[S.day] + '</small><b>' + fmt(S.wp) + ' €</b></div><h4>Mittagsmenü</h4><ul>' +
        "<li><small>Suppe</small><span>" + esc(w.s) + "</span></li><li><small>Menü I</small><span>" + esc(w.a) + "</span></li>" +
        "<li><small>Menü II</small><span>" + esc(w.v) + "</span></li><li><small>Dessert</small><span>" + esc(w.d) + "</span></li></ul>" +
        '<span class="note">Mit Dessert ' + fmt(S.wpd) + " €</span></div>";
      if (S.special) h += '<div class="pv__sp" data-k="sp"><h4>Heute empfehlen wir</h4>' + S.special.map(function (x) {
        return '<div class="dish"><div class="dish__t"><b>' + esc(x[0]) + "</b><i></i><span>" + fmt(x[1]) + "</span></div></div>";
      }).join("") + "</div>";
      if (S.pdf) h += '<a class="pv__pdf" data-k="pdf" href="#selbst" tabindex="-1">' + ICON.pdf + "Ganze Speisekarte als PDF<small>240 KB</small></a>";
      h += '<h3 class="pv__cat">' + c.t + "</h3>";
      if (!c.items.length) h += '<p class="pv__empty">Noch keine Gerichte in dieser Kategorie.</p>';
      c.items.forEach(function (it) {
        h += '<div class="dish' + (it.off ? " off" : "") + '" data-k="' + it.id + '"><div class="dish__t"><b>' + (esc(it.n) || "&nbsp;") + (it.v ? ' <span class="v">VEG</span>' : "") +
          (it.off ? ' <em class="soldout">heute aus</em>' : "") + "</b><i></i><span>" + fmt(it.p) + "</span></div>" + (it.d ? "<p>" + esc(it.d) + "</p>" : "") + "</div>";
      });
      pv.innerHTML = h;
      if (flashId && !reduce) { var f = pv.querySelector('[data-k="' + flashId + '"]'); if (f) f.classList.add("flash"); }
    }

    /* --- Ereignisse --- */
    ed.addEventListener("click", function (e) {
      var t = e.target.closest("button"); if (!t || t.disabled) return;
      if (t.id === "dy-login") { S.logged = true; steps(); renderEd(".tabs [aria-selected=true]"); announce("Angemeldet. Sie können die Speisekarte jetzt bearbeiten."); return; }
      if (t.dataset.tab) { S.tab = t.dataset.tab; renderEd("#dy-t-" + S.tab); return; }
      if (t.dataset.cat) { S.cat = t.dataset.cat; renderEd('[data-cat="' + S.cat + '"]'); renderPv(); return; }
      if (t.dataset.day) { S.day = +t.dataset.day; renderEd('[data-day="' + S.day + '"]'); renderPv("wk"); announce("Vorschau zeigt das Mittagsmenü für " + WD[S.day] + "."); return; }
      if (t.id === "dy-add") {
        var it = { id: "d" + (++uid), n: "Neues Gericht", d: "", p: 990, off: false, isNew: true };
        cat().items.push(it); renderEd('[data-id="' + it.id + '"] .er__n'); renderPv(it.id); touched("neues Gericht hinzugefügt"); return;
      }
      var row = t.closest(".er");
      if (row && t.dataset.f === "off") {
        var x = item(row.dataset.id); x.off = !x.off;
        t.setAttribute("aria-checked", x.off); row.classList.toggle("off", x.off);
        renderPv(x.id); touched(x.n + (x.off ? " ist heute aus" : " ist wieder verfügbar")); return;
      }
      if (row && t.dataset.f === "del") {
        var c = cat(), idx = -1; c.items.forEach(function (y, i) { if (y.id === row.dataset.id) idx = i; });
        var gone = c.items.splice(idx, 1)[0];
        var nx = c.items[Math.min(idx, c.items.length - 1)];
        renderEd(nx ? '[data-id="' + nx.id + '"] .er__del' : "#dy-add"); renderPv(); touched(gone.n + " entfernt"); return;
      }
      if (t.id === "dy-photo") {
        S.up.photo = 1; renderEd(); announce("Foto wird gelesen …");
        setTimeout(function () { S.up.photo = 2; if (S.tab === "upload") renderEd("#dy-take"); announce("Drei Gerichte erkannt."); }, reduce ? 300 : 3200); return;
      }
      if (t.id === "dy-take") { S.up.photo = 3; S.special = SPECIAL.slice(); renderEd(); renderPv("sp"); touched("Tagesempfehlung mit drei Gerichten"); toast("Übernommen – jetzt noch speichern."); return; }
      if (t.id === "dy-pdf") {
        S.up.pdf = 1; renderEd();
        requestAnimationFrame(function () { requestAnimationFrame(function () { var b = $("#dy-bar"); if (b) b.style.width = "100%"; }); });
        setTimeout(function () { S.up.pdf = 2; S.pdf = true; if (S.tab === "upload") renderEd(); renderPv("pdf"); touched("PDF-Speisekarte verlinkt"); }, reduce ? 200 : 1400); return;
      }
      if (t.id === "dy-save") {
        if (!S.changes) { toast("Alles ist bereits online."); return; }
        S.changes = 0; S.saved = true; updSave(); steps();
        pvState.textContent = "Online · neu"; pvState.classList.remove("draft");
        toast("Gespeichert – Ihre Gäste sehen es ab sofort.");
        announce("Gespeichert. Die Änderungen sind jetzt online.");
        if (mobile.matches) setTimeout(function () { $(".diy__pvwrap").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }, 900);
      }
    });
    ed.addEventListener("keydown", function (e) {
      var t = e.target;
      if (t.dataset && t.dataset.tab && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        var order = ["karte", "woche", "upload"], i = order.indexOf(t.dataset.tab);
        S.tab = order[(i + (e.key === "ArrowRight" ? 1 : 2)) % 3]; e.preventDefault(); renderEd("#dy-t-" + S.tab);
      }
      if (e.key === "Enter" && t.tagName === "INPUT") { e.preventDefault(); t.blur(); }
    });
    var dirtyField = null;
    ed.addEventListener("input", function (e) {
      var t = e.target, row = t.closest(".er");
      if (row) {
        var x = item(row.dataset.id);
        if (t.dataset.f === "n") { x.n = t.value; renderPv(); }
        if (t.dataset.f === "p") { var v = parse(t.value); t.setAttribute("aria-invalid", v === null); if (v === null) return; x.p = v; renderPv(); }
        if (dirtyField !== t) { dirtyField = t; touched(); } else announce("Vorschau aktualisiert: " + x.n + ", " + fmt(x.p) + " Euro", 900);
        return;
      }
      if (t.dataset.w) {
        if (t.dataset.w === "wp" || t.dataset.w === "wpd") { var p = parse(t.value); t.setAttribute("aria-invalid", p === null); if (p === null) return; S[t.dataset.w] = p; }
        else S.week[S.day][t.dataset.w] = t.value;
        renderPv();
        if (dirtyField !== t) { dirtyField = t; touched(); }
      }
    });
    ed.addEventListener("focusout", function (e) {
      var t = e.target;
      if (t.tagName !== "INPUT") return;
      var row = t.closest(".er");
      if (row) {
        var x = item(row.dataset.id); if (!x) return;
        if (t.dataset.f === "p") { t.value = fmt(x.p); t.removeAttribute("aria-invalid"); }
        if (t.dataset.f === "n" && !t.value.trim()) { t.value = x.n = "Neues Gericht"; }
        renderPv(x.id);
      } else if (t.dataset.w === "wp" || t.dataset.w === "wpd") { t.value = fmt(S[t.dataset.w]); t.removeAttribute("aria-invalid"); renderPv("wk"); }
      else if (t.dataset.w) renderPv("wk");
      if (dirtyField === t) dirtyField = null;
    });
    $("#diy-reset").addEventListener("click", function () {
      reset(); renderEd(); renderPv(); steps();
      pvState.textContent = "Online"; pvState.classList.remove("draft");
      announce("Die Demo wurde zurückgesetzt.");
    });
    reset(); renderEd(); renderPv(); steps();
  })();
})();
