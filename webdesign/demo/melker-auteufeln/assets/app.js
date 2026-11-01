/* Melker Au-Teufel'n · Entwurf von Tim Kofler */
(function () {
  "use strict";
  var d = document, w = window;
  var ruhig = w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var AUNACHT = new Date("2026-12-12T18:00:00+01:00");
  function $(id) { return d.getElementById(id); }

  /* Navigation: fester Balken beim Scrollen, Menü am Handy */
  var nav = $("nav"), burger = $("burger"), menu = $("menu"), mobil = $("mobil");
  function scrollStand() { nav.classList.toggle("is-fest", w.scrollY > 40); }
  w.addEventListener("scroll", scrollStand, { passive: true }); scrollStand();
  function menuZu() {
    menu.hidden = true; burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Menü öffnen");
    d.body.style.overflow = ""; if (mobil) mobil.style.visibility = "";
  }
  burger.addEventListener("click", function () {
    var auf = menu.hidden;
    if (!auf) { menuZu(); return; }
    menu.hidden = false; burger.setAttribute("aria-expanded", "true"); burger.setAttribute("aria-label", "Menü schließen");
    d.body.style.overflow = "hidden"; if (mobil) mobil.style.visibility = "hidden";
  });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) menuZu(); });
  d.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) { menuZu(); burger.focus(); } });
  w.addEventListener("resize", function () { if (w.innerWidth > 720 && !menu.hidden) menuZu(); });

  /* Countdown zur Au-Nacht */
  var uT = $("u-t"), uS = $("u-s"), uM = $("u-m"), uX = $("u-x"), uhr = $("uhr"), mTage = $("mobil-tage");
  function zz(n) { return (n < 10 ? "0" : "") + n; }
  function ticken() {
    var rest = AUNACHT - Date.now();
    if (rest <= 0) {
      var vorbei = rest < -6 * 3600 * 1000;
      uhr.classList.add("is-da");
      uhr.textContent = vorbei ? "Danke für die 9. Au-Nacht! Bis zum nächsten Jahr." : "Heute ist Au-Nacht! Wir sehen uns in der Wachauarena.";
      if (mobil) mobil.querySelector("span:nth-child(2)").textContent = vorbei ? "Danke für die Au-Nacht" : "Heute ist Au-Nacht";
      return false;
    }
    var s = Math.floor(rest / 1000), t = Math.floor(s / 86400);
    uT.textContent = t; uS.textContent = zz(Math.floor(s % 86400 / 3600)); uM.textContent = zz(Math.floor(s % 3600 / 60)); uX.textContent = zz(s % 60);
    if (mTage) mTage.textContent = t;
    return true;
  }
  if (ticken()) { var uhrTimer = setInterval(function () { if (!ticken()) clearInterval(uhrTimer); }, 1000); }

  /* Feuer am unteren Rand des Startbilds (klassisches Pixel-Feuer, weich gezeichnet) */
  var cv = $("feuer");
  if (cv && cv.getContext) {
    var ctx = cv.getContext("2d"), B = 120, H = 46, px = new Uint8Array(B * H), img = ctx.createImageData(B, H), laeuft = false, sichtbar = true, letzte = 0;
    cv.width = B; cv.height = H;
    var PAL = [];
    (function () {
      var stops = [[0, 0, 0, 0], [10, 60, 8, 4], [22, 150, 22, 10], [34, 214, 48, 22], [46, 240, 110, 30], [56, 255, 176, 70], [64, 255, 236, 180]];
      for (var i = 0; i <= 64; i++) {
        for (var k = 0; k < stops.length - 1 && stops[k + 1][0] < i; k++);
        var a = stops[k], b = stops[Math.min(k + 1, stops.length - 1)], f = b[0] === a[0] ? 0 : (i - a[0]) / (b[0] - a[0]);
        PAL.push([a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f, a[3] + (b[3] - a[3]) * f, Math.min(255, i * 7)]);
      }
    })();
    function glut() { for (var x = 0; x < B; x++) px[(H - 1) * B + x] = Math.random() < .82 ? 64 : 40; }
    function schritt() {
      for (var x = 0; x < B; x++) for (var y = 1; y < H; y++) {
        var i = y * B + x, r = (Math.random() * 3.2) | 0, z = i - B - r + 1;
        if (z < 0) continue;
        var v = px[i] - ((Math.random() * 3.4) | 0);
        px[z] = v < 0 ? 0 : v;
      }
    }
    function malen() {
      var data = img.data;
      for (var i = 0; i < px.length; i++) { var p = PAL[px[i]], o = i * 4; data[o] = p[0]; data[o + 1] = p[1]; data[o + 2] = p[2]; data[o + 3] = p[3]; }
      ctx.putImageData(img, 0, 0);
    }
    glut(); for (var n = 0; n < 60; n++) schritt(); malen();
    function lauf(t) {
      if (!laeuft) return;
      if (t - letzte > 45) { letzte = t; if (Math.random() < .3) glut(); schritt(); malen(); }
      requestAnimationFrame(lauf);
    }
    function steuern() {
      var soll = sichtbar && !d.hidden && !ruhig;
      if (soll && !laeuft) { laeuft = true; requestAnimationFrame(lauf); } else if (!soll) laeuft = false;
    }
    if ("IntersectionObserver" in w) new IntersectionObserver(function (es) { sichtbar = es[0].isIntersecting; steuern(); }).observe(cv);
    d.addEventListener("visibilitychange", steuern);
    steuern();
  }

  /* Lauftermine: vorbei / als Nächstes, Filter */
  var zeilen = [].slice.call(d.querySelectorAll(".zeile")), heute = new Date(); heute.setHours(0, 0, 0, 0);
  var naechster = null;
  zeilen.forEach(function (z) {
    var dt = new Date(z.getAttribute("data-d") + "T23:59:00");
    if (dt < heute) z.classList.add("is-vorbei");
    else if (!naechster) naechster = z.getAttribute("data-d");
  });
  zeilen.forEach(function (z) { if (z.getAttribute("data-d") === naechster) z.classList.add("is-naechster"); });
  var fk = [].slice.call(d.querySelectorAll(".filter__k"));
  fk.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-f");
      fk.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      zeilen.forEach(function (z) { var a = z.getAttribute("data-art"); z.hidden = !(f === "alle" || a === f || a === "heim"); });
    });
  });

  /* Au-Nacht in den Kalender (.ics) */
  var kal = $("kalender");
  if (kal) kal.addEventListener("click", function () {
    var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Melker Au-Teufeln//Au-Nacht//DE", "BEGIN:VEVENT",
      "UID:aunacht-2026@melkerauteufeln.at", "DTSTAMP:20261101T120000Z", "DTSTART:20261212T170000Z", "DTEND:20261212T223000Z",
      "SUMMARY:9. Melker Au-Nacht", "LOCATION:Wachauarena Melk",
      "DESCRIPTION:Heimlauf der Melker Au-Teufel'n mit über 400 Krampussen. Beginn 18 Uhr\\, Krampus-Disco ab 20:30 Uhr.",
      "BEGIN:VALARM", "TRIGGER:-PT3H", "ACTION:DISPLAY", "DESCRIPTION:Heute ist Au-Nacht!", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var a = d.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    a.download = "melker-au-nacht-2026.ics"; d.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });

  /* Einblenden und Zahlen hochzählen */
  var auf = d.querySelectorAll(".kopf, .an__text, .tipps, .zahlen, .chronik li, .galerie, .mit__text, .formkarte");
  if ("IntersectionObserver" in w && !ruhig) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-da"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    [].forEach.call(auf, function (el) { el.classList.add("auf"); io.observe(el); });
    var zahlen = d.querySelector(".zahlen");
    if (zahlen) new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return; o.disconnect();
      [].forEach.call(zahlen.querySelectorAll("[data-zahl]"), function (b) {
        var ziel = +b.getAttribute("data-zahl"), plus = b.hasAttribute("data-plus"), start = ziel > 1900 ? 1990 : 0, t0 = performance.now();
        (function f(t) {
          var p = Math.min(1, (t - t0) / 1400), v = Math.round(start + (ziel - start) * (1 - Math.pow(1 - p, 3)));
          b.textContent = v + (plus && p === 1 ? "+" : ""); if (p < 1) requestAnimationFrame(f);
        })(t0);
      });
    }, { threshold: .4 }).observe(zahlen);
  }

  /* Galerie groß ansehen */
  var lb = $("lb"), lbImg = $("lb-img"), bilder = [].slice.call(d.querySelectorAll(".galerie__b")), akt = 0, vorher = null;
  function zeigen(i) {
    akt = (i + bilder.length) % bilder.length;
    var q = bilder[akt].querySelector("img"); lbImg.src = q.src; lbImg.alt = q.alt;
  }
  function lbZu() { lb.hidden = true; d.body.style.overflow = ""; if (vorher) vorher.focus(); }
  bilder.forEach(function (b, i) { b.addEventListener("click", function () { vorher = b; zeigen(i); lb.hidden = false; d.body.style.overflow = "hidden"; $("lb-zu").focus(); }); });
  $("lb-zu").addEventListener("click", lbZu);
  $("lb-l").addEventListener("click", function () { zeigen(akt - 1); });
  $("lb-r").addEventListener("click", function () { zeigen(akt + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) lbZu(); });
  d.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") lbZu(); else if (e.key === "ArrowLeft") zeigen(akt - 1); else if (e.key === "ArrowRight") zeigen(akt + 1);
  });
  var sx = null;
  lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) zeigen(akt + (dx < 0 ? 1 : -1));
  });

  /* Anfrage: Reiter, Regler, Prüfung, Bestätigung */
  var tabs = [$("tab-show"), $("tab-mit")], forms = [$("form-show"), $("form-mit")], ok = $("form-ok");
  function reiter(i, fokus) {
    tabs.forEach(function (t, k) { t.setAttribute("aria-selected", k === i ? "true" : "false"); t.tabIndex = k === i ? 0 : -1; forms[k].hidden = k !== i; });
    ok.hidden = true; if (fokus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { reiter(i); });
    t.addEventListener("keydown", function (e) { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); reiter(1 - i, true); } });
  });
  var regler = $("s-anzahl"), out = $("s-anzahl-out");
  regler.addEventListener("input", function () { out.textContent = regler.value; });
  function pruefen(form, fehlerId) {
    var leer = [].filter.call(form.querySelectorAll("[required]"), function (f) { var bad = !String(f.value).trim() || !f.checkValidity(); f.setAttribute("aria-invalid", bad ? "true" : "false"); return bad; });
    var fe = $(fehlerId);
    if (leer.length) { fe.textContent = "Bitte noch ausfüllen: " + leer.map(function (f) { return d.querySelector('label[for="' + f.id + '"]').firstChild.textContent.trim(); }).join(", ") + "."; fe.hidden = false; leer[0].focus(); return false; }
    fe.hidden = true; return true;
  }
  function fertig(text) {
    forms.forEach(function (f) { f.hidden = true; }); $("form-ok-text").textContent = text; ok.hidden = false; ok.focus();
  }
  forms[0].addEventListener("submit", function (e) {
    e.preventDefault(); if (!pruefen(forms[0], "show-fehler")) return;
    var f = forms[0], name = f.name.value.trim().split(" ")[0], dt = new Date(f.datum.value + "T12:00:00");
    fertig("Danke, " + name + ". Eure Anfrage ist bei uns: " + f.art.value + " in " + f.ort.value.trim() + " am " + dt.toLocaleDateString("de-AT", { weekday: "long", day: "numeric", month: "long" }) + ", mit etwa " + f.anzahl.value + " Krampussen. Wir melden uns, sobald wir die Gruppe beisammen haben.");
  });
  forms[1].addEventListener("submit", function (e) {
    e.preventDefault(); if (!pruefen(forms[1], "mit-fehler")) return;
    var f = forms[1], name = f.name.value.trim().split(" ")[0];
    fertig("Servus " + name + "! Schön, dass du zu den Au-Teufel’n willst (" + f.querySelector("input[name=rolle]:checked").value + "). Wir melden uns und laden dich zum nächsten Vereinsabend ein.");
  });
  $("form-neu").addEventListener("click", function () {
    forms.forEach(function (f) { f.reset(); [].forEach.call(f.querySelectorAll("[aria-invalid]"), function (x) { x.removeAttribute("aria-invalid"); }); });
    out.textContent = regler.value; reiter(tabs[0].getAttribute("aria-selected") === "true" ? 0 : 0, true);
  });

  /* Handy-Leiste: erst nach dem Startbild, weg beim Anfrage-Formular und am Seitenende */
  if (mobil && "IntersectionObserver" in w) {
    var heroDa = true, formDa = false, fussDa = false, anDa = false;
    function setzen() { mobil.classList.toggle("is-da", !heroDa && !formDa && !fussDa && !anDa); }
    new IntersectionObserver(function (es) { anDa = es[0].isIntersecting; setzen(); }, { rootMargin: "-30% 0px -30% 0px" }).observe(d.getElementById("aunacht"));
    new IntersectionObserver(function (es) { heroDa = es[0].isIntersecting; setzen(); }, { threshold: .15 }).observe(d.querySelector(".hero"));
    new IntersectionObserver(function (es) { formDa = es[0].isIntersecting; setzen(); }).observe(d.querySelector(".formkarte"));
    new IntersectionObserver(function (es) { fussDa = es[0].isIntersecting; setzen(); }).observe(d.querySelector(".fuss"));
  }
})();
