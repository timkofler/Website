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
    var sticky = $(".pl__sticky", sec), plate = $("#pl-plate"), cut = $("#pl-cutlery"), sauce = $("#pl-sauce"), sauce2 = $("#pl-sauce2"),
      slices = $$("#pl-meat .slice"), kn = $$("#pl-kn .kn"), herbsG = $("#pl-herbs"), steam = $("#pl-steam"), label = $("#pl-label"),
      steps = $$("#pl-steps li"), barI = $("#pl-bar"), nowEl = $("#pl-now");
    var L1 = sauce.getTotalLength(), L2 = sauce2.getTotalLength();
    sauce.style.strokeDasharray = L1; sauce2.style.strokeDasharray = L2;
    var SL = [[356, 232, -12], [366, 284, -3], [368, 338, 7]], KN = [[214, 262], [230, 360]];
    // Kräuter: Schnittlauchröllchen und Petersilblättchen
    var seed = 5; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    var herbs = [];
    for (var i = 0; i < 30; i++) {
      var g = document.createElementNS(SVGNS, "g"), leaf = i % 3 === 0;
      var shape = document.createElementNS(SVGNS, leaf ? "path" : "rect");
      if (leaf) { shape.setAttribute("d", "M0 -7 C6 -6 8 0 0 7 C-8 0 -6 -6 0 -7 Z"); shape.setAttribute("fill", "#3f7a34"); }
      else { shape.setAttribute("x", -5); shape.setAttribute("y", -1.8); shape.setAttribute("width", 10); shape.setAttribute("height", 3.6); shape.setAttribute("rx", 1.8); shape.setAttribute("fill", i % 2 ? "#5d9a45" : "#4c8a3a"); }
      g.appendChild(shape); herbsG.appendChild(g);
      var a = rnd() * Math.PI * 2, rr = 30 + rnd() * 120;
      herbs.push({ g: g, x: 300 + Math.cos(a) * rr * 1.05, y: 296 + Math.sin(a) * rr * .9, r: rnd() * 360, dx: (rnd() - .5) * 60, t: i / 30 });
    }
    function cl(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
    function seg(p, a, b) { return cl((p - a) / (b - a)); }
    function eo(t) { return 1 - Math.pow(1 - t, 3); }
    function back(t) { var c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
    function render(p) {
      var k = eo(seg(p, 0, .1));
      plate.style.transform = "scale(" + (.86 + .14 * k).toFixed(4) + ")"; plate.style.opacity = k.toFixed(3);
      cut.setAttribute("opacity", eo(seg(p, .04, .14)).toFixed(3));
      var s = eo(seg(p, .12, .3)), s2 = eo(seg(p, .2, .34));
      sauce.style.strokeDashoffset = (L1 * (1 - s)).toFixed(1); sauce.style.opacity = s > 0 ? 1 : 0;
      sauce2.style.strokeDashoffset = (L2 * (1 - s2)).toFixed(1); sauce2.style.opacity = s2 > 0 ? .7 : 0;
      slices.forEach(function (el, i) {
        var t = seg(p, .32 + i * .055, .44 + i * .055), b = back(t), f = SL[i];
        var sc = 1.7 - .7 * b, y = f[1] - 120 * (1 - b);
        el.setAttribute("transform", "translate(" + f[0] + " " + y.toFixed(1) + ") rotate(" + (f[2] + (1 - t) * 20).toFixed(1) + ") scale(" + sc.toFixed(3) + ")");
        el.setAttribute("opacity", Math.min(1, t * 3).toFixed(2));
      });
      kn.forEach(function (el, i) {
        var t = eo(seg(p, .52 + i * .06, .68 + i * .06)), f = KN[i], dx = 420 * (1 - t);
        el.setAttribute("transform", "translate(" + (f[0] + dx).toFixed(1) + " " + f[1] + ") rotate(" + (dx / 46 * 57.3).toFixed(1) + ")");
        el.setAttribute("opacity", t > 0 ? 1 : 0);
      });
      herbs.forEach(function (h) {
        var t = eo(seg(p, .72 + h.t * .1, .8 + h.t * .1));
        h.g.setAttribute("transform", "translate(" + (h.x + h.dx * (1 - t)).toFixed(1) + " " + (h.y - 90 * (1 - t)).toFixed(1) + ") rotate(" + (h.r + 200 * (1 - t)).toFixed(0) + ") scale(" + (1 + 1.4 * (1 - t)).toFixed(2) + ")");
        h.g.setAttribute("opacity", t.toFixed(2));
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
})();
