// Glut · Feuerküche: Gerichte im Start durchschalten (Pfeile, Wischen, von selbst), Beilagen zum Teller dazunehmen,
// Speisekarte mit Reitern und Detailfenster, Schritte mit Fortschrittsring, Reservierung und "Jetzt geöffnet".
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var IMG = "/beispiele/gasthaus/v2/bilder/";
  var euro = function (n) { return "€ " + n.toFixed(2).replace(".", ","); };
  var ic = function (n) { return '<svg><use href="#i-' + n + '"/></svg>'; };
  document.documentElement.classList.add("js");

  var SIDES = {
    pommes: { n: "Rustikal-Pommes", p: 4.9, img: "t-pommes" },
    salat: { n: "Gartensalat mit Ei", p: 5.9, img: "t-salat" },
    suess: { n: "Süßkartoffel-Spalten", p: 5.4, img: "t-suesskartoffel" }
  };
  var DISHES = [
    { id: "ripperl", name: "Spareribs vom<br>Buchenholz", short: "Spareribs", g: 450, img: "t-ripperl", price: 26.9,
      pills: [["uhr", "6 Std."], ["leute", "für 2"], ["flamme", "980 kcal"]], live: [40, "Schritt 2 von 5 · Räuchern"],
      g1: { t: "Räuchern &amp;<br>langsam garen", l: "Smoker", v: 110, u: "°C", p: .62, ic: "grill" },
      g2: { t: "Glasieren &amp;<br>scharf grillen", l: "Glut", v: 260, u: "°C", p: .72, ic: "pfanne" },
      sides: ["pommes", "salat", "suess"] },
    { id: "flank", name: "Flank Steak mit<br>Rustikal-Pommes", short: "Flank Steak", g: 300, img: "t-flank", price: 29.5,
      pills: [["uhr", "25 min."], ["leute", "für 1"], ["flamme", "820 kcal"]], live: [80, "Schritt 4 von 5 · Grillen"],
      g1: { t: "Marinieren &amp;<br>rasten lassen", l: "Kern", v: 54, u: "°C", p: .38, ic: "sanduhr" },
      g2: { t: "Scharf<br>angrillen", l: "Rost", v: 320, u: "°C", p: .88, ic: "grill" },
      sides: ["salat", "suess", "pommes"] },
    { id: "ribeye", name: "Rib-Eye<br>Dry Aged", short: "Rib-Eye", g: 350, img: "t-ribeye", price: 38,
      pills: [["uhr", "30 min."], ["leute", "für 1"], ["flamme", "910 kcal"]], live: [20, "Schritt 1 von 5 · Reifen"],
      g1: { t: "28 Tage<br>trocken gereift", l: "Reife", v: 28, u: "Tage", p: .7, ic: "sanduhr" },
      g2: { t: "Über Holzkohle<br>gegrillt", l: "Glut", v: 340, u: "°C", p: .92, ic: "flamme" },
      sides: ["pommes", "suess", "salat"] },
    { id: "spiess", name: "Hendl-Spieße mit<br>Paprika-Salsa", short: "Hendl-Spieße", g: 280, img: "t-spiess", price: 19.8,
      pills: [["uhr", "20 min."], ["leute", "für 1"], ["flamme", "640 kcal"]], live: [100, "Schritt 5 von 5 · Servieren"],
      g1: { t: "Über Nacht<br>mariniert", l: "Marinade", v: 12, u: "Std.", p: .5, ic: "sanduhr" },
      g2: { t: "Am Spieß<br>gegrillt", l: "Rost", v: 240, u: "°C", p: .66, ic: "grill" },
      sides: ["salat", "pommes", "suess"] }
  ];
  // Zusatzangaben fürs Detailfenster der Speisekarte
  var MORE = {
    ripperl: ["Mild-rauchig", "Allergene: L, M"], flank: ["Medium rare", "Allergene: G, L"], ribeye: ["Pfefferrahm extra", "Allergene: G, L"],
    filet: ["Am Stück gegrillt", "Allergene: G, O"], spiess: ["Leicht scharf", "Allergene: L, M"], hendl: ["Freilandhendl", "Allergene: –"],
    burger: ["Mit Pommes + € 3", "Allergene: A, G, M"], pfandl: ["Zischend heiß", "Allergene: F, N"], steak: ["Saisonal", "Allergene: G, L"],
    bowl: ["Vegetarisch", "Allergene: H, N"], pommes: ["Vegan", "Allergene: –"], suess: ["Mit Dip", "Allergene: G"], salat: ["Vegetarisch", "Allergene: C, M"]
  };

  // ---------- Kopfleiste ----------
  var nav = $("#nav");
  var onScroll = function () { nav.classList.toggle("is-solid", window.scrollY > 24); };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // ---------- Start: Gerichte wechseln ----------
  var hero = $("#hero"), pics = $$(".hero__img", hero), cur = 0, busy = false;
  var countTo = function (el, to) {
    var from = parseFloat(el.textContent) || 0;
    if (reduce || from === to) { el.textContent = to; return; }
    var t0 = 0;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 900), k = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * k);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  var loadPic = function (pic) {
    var s = pic.querySelector("source[data-srcset]"), im = pic.querySelector("img[data-src]");
    if (s) { s.srcset = s.getAttribute("data-srcset"); s.removeAttribute("data-srcset"); }
    if (im) { im.src = im.getAttribute("data-src"); im.removeAttribute("data-src"); }
    return pic.querySelector("img");
  };
  var setGauge = function (box, g) {
    box.querySelector(".gauge__ic").innerHTML = ic(g.ic);
    box.querySelector(".gauge__t").innerHTML = g.t;
    box.querySelector(".gauge__l").textContent = g.l;
    box.querySelector(".gauge__v small").textContent = g.u;
    countTo(box.querySelector(".gauge__v b"), g.v);
    var bars = $$(".bars i", box);
    if (bars.length) {
      var n = g.p * bars.length;
      bars.forEach(function (b, i) { b.style.setProperty("--i", i); b.classList.toggle("on", i < Math.floor(n)); b.classList.toggle("half", i === Math.floor(n) && n % 1 > .25); });
    }
    var sl = box.querySelector(".slide");
    if (sl) sl.style.setProperty("--v", g.p);
  };
  var picked = {};
  var renderSides = function (d) {
    $$("#suggRow .side").forEach(function (b, i) {
      var key = d.sides[i], s = SIDES[key];
      b.setAttribute("data-side", key);
      b.querySelector("img").src = IMG + s.img + ".webp";
      b.querySelector(".side__n").textContent = s.n;
      b.querySelector(".side__p").textContent = euro(s.p);
    });
    $("#suggSub").textContent = "Passt zu " + d.short + " · antippen zum Dazunehmen";
    syncSides();
  };
  var syncSides = function () {
    var d = DISHES[cur], sum = d.price, names = [d.short];
    $$("#suggRow .side").forEach(function (b) {
      var key = b.getAttribute("data-side"), on = !!picked[key];
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.querySelector(".side__ok").innerHTML = ic(on ? "haken" : "plus");
      b.setAttribute("aria-label", SIDES[key].n + ", " + euro(SIDES[key].p) + (on ? ", dazugenommen" : ""));
      if (on) { sum += SIDES[key].p; names.push(SIDES[key].n); }
    });
    $("#plateTxt").textContent = names.join(" + ");
    $("#platePrice").textContent = euro(sum);
  };
  $$("#suggRow .side").forEach(function (b) {
    b.addEventListener("click", function () {
      var key = b.getAttribute("data-side");
      picked[key] = !picked[key];
      b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
      syncSides();
    });
  });

  var show = function (k, first) {
    if (busy && !first) return;
    k = (k + DISHES.length) % DISHES.length;
    var d = DISHES[k], prev = cur;
    cur = k;
    var im = loadPic(pics[k]);
    var go = function () {
      pics.forEach(function (p, i) { p.classList.toggle("is-on", i === k); });
      if (!first) {
        var main = $(".hero__main");
        main.classList.remove("swap"); void main.offsetWidth; main.classList.add("swap");
      }
      $("#dishName").innerHTML = d.name;
      $("#dishPills").innerHTML = d.pills.map(function (p) { return '<li class="pill glass">' + ic(p[0]) + "<span>" + p[1] + "</span></li>"; }).join("");
      $("#wName").textContent = d.short;
      countTo($("#wNum"), d.g);
      var w = $("#wImg");
      w.src = IMG + d.img + ".webp";
      if (!first) { w.classList.remove("pop"); void w.offsetWidth; w.classList.add("pop"); }
      var a = $("#wGo"); a.setAttribute("data-dish", d.id); a.setAttribute("aria-label", d.short + " im Detail ansehen");
      setGauge($("#g1"), d.g1); setGauge($("#g2"), d.g2);
      $(".live__p").style.setProperty("--p", d.live[0]);
      $("#liveStep").textContent = d.live[1];
      $("#pagerNo").textContent = k + 1;
      if (prev !== k) picked = {};
      renderSides(d);
      busy = false;
    };
    if (first) { go(); return; }
    busy = true;
    // erst wechseln, wenn das neue Bild da ist, sonst blitzt der dunkle Hintergrund durch
    var t = setTimeout(go, 1200);
    var done = function () { clearTimeout(t); go(); };
    if (im.complete && im.naturalWidth) done();
    else { im.addEventListener("load", done, { once: true }); im.addEventListener("error", done, { once: true }); }
  };
  $("#pagerAll").textContent = DISHES.length;
  show(0, true);
  // die nächsten Bilder im Hintergrund vorladen
  addEventListener("load", function () { setTimeout(function () { pics.forEach(loadPic); }, 1500); });

  var auto = 0, stopped = false, heroVisible = true;
  var stopAuto = function () { stopped = true; clearInterval(auto); };
  if (!reduce) auto = setInterval(function () { if (heroVisible && !document.hidden && !$("dialog[open]")) show(cur + 1); }, 7000);
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; }, { threshold: .35 }).observe(hero);

  $$(".pager .rbtn").forEach(function (b) { b.addEventListener("click", function () { stopAuto(); show(cur + +b.getAttribute("data-dir")); }); });
  // Wischen am Handy (und mit der Maus)
  var sx = 0, sy = 0, sw = false;
  hero.addEventListener("pointerdown", function (e) {
    if (e.target.closest("a,button")) return;
    sx = e.clientX; sy = e.clientY; sw = true;
  });
  hero.addEventListener("pointerup", function (e) {
    if (!sw) return; sw = false;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) { stopAuto(); show(cur + (dx < 0 ? 1 : -1)); }
  });
  hero.addEventListener("pointercancel", function () { sw = false; });
  addEventListener("keydown", function (e) {
    if (!heroVisible || e.altKey || e.ctrlKey || e.metaKey || $("dialog[open]") || /input|textarea|select/i.test(e.target.tagName)) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") { stopAuto(); show(cur + (e.key === "ArrowRight" ? 1 : -1)); }
  });

  // ---------- Speisekarte: Reiter ----------
  var tabs = $$('[role="tab"]');
  var pick = function (t, focus) {
    tabs.forEach(function (x) {
      var on = x === t, p = document.getElementById(x.getAttribute("aria-controls"));
      x.setAttribute("aria-selected", on ? "true" : "false"); x.tabIndex = on ? 0 : -1;
      p.hidden = !on;
      if (on) { p.classList.remove("swap-in"); void p.offsetWidth; p.classList.add("swap-in"); }
    });
    if (focus) t.focus();
  };
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { pick(t); });
    t.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); pick(tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length], true); }
    });
  });
  pick(tabs[0]);

  // ---------- Detailfenster ----------
  var dlg = $("#dlg"), lastFocus = null;
  var openDish = function (id) {
    var card = $('.dish[data-dish="' + id + '"]');
    if (!card || !dlg.showModal) { location.hash = "karte"; return; }
    var img = card.querySelector("img");
    $("#dlgImg").src = img.src; $("#dlgImg").alt = img.alt;
    $("#dlgH").innerHTML = card.querySelector("h3").innerHTML;
    $("#dlgD").textContent = card.querySelector("div > p").textContent;
    var meta = $$(".dish__m span", card).map(function (s) { return s.textContent; }).concat(MORE[id] || []);
    $("#dlgPills").innerHTML = meta.map(function (m) {
      var n = /min|Std/.test(m) ? "uhr" : /für \d/.test(m) ? "leute" : /Allergene/.test(m) ? "karte" : /\d\s?g$|Schüssel/.test(m) ? "pfanne" : "funken";
      return '<li class="pill glass">' + ic(n) + "<span>" + m + "</span></li>";
    }).join("");
    $("#dlgP").textContent = card.querySelector(".dish__p").textContent;
    lastFocus = document.activeElement;
    document.documentElement.classList.add("dlg-open");
    dlg.showModal();
  };
  var closeDlg = function () { if (dlg.open) dlg.close(); };
  dlg.addEventListener("close", function () { document.documentElement.classList.remove("dlg-open"); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.closest("[data-close]")) closeDlg(); });
  $$(".dish").forEach(function (c) {
    var id = c.getAttribute("data-dish");
    c.querySelector(".dish__go").addEventListener("click", function () { openDish(id); });
    c.querySelector("img").addEventListener("click", function () { openDish(id); });
  });
  $("#wGo").addEventListener("click", function (e) { e.preventDefault(); stopAuto(); openDish(this.getAttribute("data-dish")); });

  // ---------- Schritte mit Fortschrittsring ----------
  var steps = $$(".step"), ring = $(".cook__p");
  var setStep = function (i) {
    steps.forEach(function (s, k) { s.classList.toggle("is-on", k === i); });
    ring.style.strokeDasharray = ((i + 1) / steps.length * 100) + " 100";
    $("#cookNo").textContent = i + 1;
    $("#cookT").textContent = steps[i].querySelector("h3").textContent;
    $("#cookV").textContent = steps[i].getAttribute("data-v");
  };
  setStep(0);
  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setStep(steps.indexOf(e.target)); });
    }, { rootMargin: "-48% 0px -48% 0px" });
    steps.forEach(function (s) { so.observe(s); });
  } else steps.forEach(function (s) { s.classList.add("is-on"); });

  // ---------- Öffnungszeiten ----------
  var HOURS = { 0: [11.5, 21], 3: [17, 23], 4: [17, 23], 5: [17, 23.5], 6: [11.5, 23.5] };
  var DAYN = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], DAYL = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  var hm = function (h) { var m = Math.round((h % 1) * 60); return Math.floor(h) + ":" + (m < 10 ? "0" : "") + m; };
  var now = new Date(), dow = now.getDay(), hNow = now.getHours() + now.getMinutes() / 60;
  var row = $('#hours [data-dow="' + dow + '"]'); if (row) row.classList.add("is-today");
  (function () {
    var h = HOURS[dow], txt, on = false;
    if (h && hNow >= h[0] && hNow < h[1]) { on = true; txt = "Jetzt geöffnet bis " + hm(h[1]); }
    else if (h && hNow < h[0]) txt = "Heute ab " + hm(h[0]) + " geöffnet";
    else {
      for (var i = 1; i < 8; i++) { var d = (dow + i) % 7; if (HOURS[d]) { txt = "Geschlossen · öffnet " + (i === 1 ? "morgen" : DAYL[d]) + " um " + hm(HOURS[d][0]); break; } }
    }
    $("#stTxt").textContent = txt;
    $("#stDot").classList.toggle("on", on);
  })();

  // ---------- Reservierung ----------
  var days = $("#resDays"), times = $("#resTimes"), form = $("#resForm"), pers = 2, selDay = null, selTime = null;
  var slots = function (d) {
    var out = [], w = d.getDay(), h = HOURS[w];
    if (!h) return out;
    if (h[0] < 12) [11.5, 12, 12.5, 13].forEach(function (x) { out.push(x); });
    for (var x = 17; x <= h[1] - 1.5; x += .5) out.push(x);
    var today = d.toDateString() === now.toDateString();
    return out.filter(function (x) { return !today || x > hNow + 1; });
  };
  var radio = function (box, btn) {
    $$(".chip", box).forEach(function (b) { b.setAttribute("aria-checked", b === btn ? "true" : "false"); b.tabIndex = b === btn ? 0 : -1; });
  };
  var renderTimes = function () {
    var list = slots(selDay);
    times.innerHTML = list.map(function (x) { return '<button type="button" class="chip" role="radio" aria-checked="false" tabindex="-1" data-t="' + x + '">' + hm(x) + "</button>"; }).join("");
    var pref = $$(".chip", times).filter(function (b) { return +b.getAttribute("data-t") === 19; })[0] || $$(".chip", times)[0];
    selTime = pref ? +pref.getAttribute("data-t") : null;
    if (pref) radio(times, pref);
  };
  var first = null;
  for (var i = 0; i < 12; i++) {
    var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    var b = document.createElement("button");
    var open = slots(d).length > 0;
    b.type = "button"; b.className = "chip"; b.setAttribute("role", "radio"); b.setAttribute("aria-checked", "false"); b.tabIndex = -1;
    b.innerHTML = "<small>" + (i === 0 ? "Heute" : i === 1 ? "Morgen" : DAYN[d.getDay()]) + "</small><b>" + d.getDate() + ".</b>";
    b.setAttribute("aria-label", DAYL[d.getDay()] + ", " + d.getDate() + "." + (d.getMonth() + 1) + "." + (open ? "" : ", Ruhetag"));
    b._d = d;
    if (!open) b.disabled = true;
    else if (!first) first = b;
    days.appendChild(b);
  }
  days.addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b || b.disabled) return;
    selDay = b._d; radio(days, b); renderTimes();
  });
  times.addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    selTime = +b.getAttribute("data-t"); radio(times, b);
  });
  [days, times].forEach(function (box) {
    box.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var all = $$(".chip:not(:disabled)", box), k = all.indexOf(document.activeElement);
      if (k < 0) return;
      e.preventDefault();
      var n = all[(k + (e.key === "ArrowRight" ? 1 : all.length - 1)) % all.length];
      n.focus(); n.click();
    });
  });
  selDay = first._d; radio(days, first); renderTimes();
  $$(".stepper .rbtn").forEach(function (b) {
    b.addEventListener("click", function () { pers = Math.max(1, Math.min(12, pers + +b.getAttribute("data-p"))); $("#resP").textContent = pers; });
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.name.value.trim(), tel = form.tel.value.replace(/[^\d+]/g, ""), err = "";
    form.name.classList.toggle("bad", name.length < 2);
    form.tel.classList.toggle("bad", tel.replace(/\D/g, "").length < 6);
    if (name.length < 2) err = "Bitte gib deinen Namen an.";
    else if (tel.replace(/\D/g, "").length < 6) err = "Bitte gib eine Telefonnummer an, falls wir dich erreichen müssen.";
    else if (selTime === null) err = "An diesem Tag ist leider kein Tisch mehr frei. Wähl bitte einen anderen Tag.";
    $("#resErr").textContent = err;
    if (err) { (name.length < 2 ? form.name : form.tel).focus(); return; }
    var dd = selDay, when = DAYL[dd.getDay()] + ", " + dd.getDate() + "." + (dd.getMonth() + 1) + ".";
    $("#resOkTxt").textContent = "Danke, " + name.split(" ")[0] + "! Dein Tisch für " + pers + (pers === 1 ? " Person" : " Personen") + " ist am " + when + " um " + hm(selTime) + " Uhr reserviert. Wir freuen uns auf dich.";
    $("#resOk").hidden = false;
    $("#resAgain").focus();
  });
  $("#resAgain").addEventListener("click", function () { $("#resOk").hidden = true; form.reset(); pers = 2; $("#resP").textContent = 2; form.name.focus(); });

})();
