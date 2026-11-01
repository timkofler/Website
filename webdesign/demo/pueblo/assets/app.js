// Pueblo Eventlocation (Entwurf): Menü, Countdown, Indoor/Outdoor, Gäste-Regler, Formular-Vorschau, Einblenden.
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  root.classList.add("js");
  var ruhig = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Kopf wird beim Scrollen dunkel
  var nav = d.getElementById("nav");
  function kopf() { nav.classList.toggle("is-solid", window.scrollY > 40); }
  kopf();
  window.addEventListener("scroll", kopf, { passive: true });

  // Handy-Menü
  var burger = d.getElementById("burger"), menu = d.getElementById("menu");
  function menuZu() {
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Menü öffnen");
    menu.classList.remove("is-open");
    d.body.style.overflow = "";
    setTimeout(function () { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 160);
  }
  burger.addEventListener("click", function () {
    if (burger.getAttribute("aria-expanded") === "true") return menuZu();
    menu.hidden = false;
    requestAnimationFrame(function () { menu.classList.add("is-open"); });
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Menü schließen");
    d.body.style.overflow = "hidden";
  });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) menuZu(); });
  d.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) menuZu(); });

  // Countdown bis zum nächsten Event
  var cd = d.getElementById("countdown");
  if (cd) {
    var ziel = new Date(cd.getAttribute("data-ziel")).getTime();
    var feld = function (k) { return cd.querySelector('[data-k="' + k + '"]'); };
    var tick = function () {
      var s = Math.max(0, Math.floor((ziel - Date.now()) / 1000));
      feld("d").textContent = Math.floor(s / 86400);
      feld("h").textContent = String(Math.floor(s % 86400 / 3600)).padStart(2, "0");
      feld("m").textContent = String(Math.floor(s % 3600 / 60)).padStart(2, "0");
    };
    tick();
    setInterval(tick, 15000);
  }

  // Zahlen zählen hoch, wenn sie ins Bild kommen
  function zaehlen(el) {
    var ende = +el.getAttribute("data-zahl");
    if (ruhig || !ende) { el.textContent = ende; return; }
    var t0 = null;
    var schritt = function (t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1200);
      el.textContent = Math.round(ende * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(schritt);
    };
    requestAnimationFrame(schritt);
  }

  // Einblenden beim Scrollen, gestaffelt in Gruppen
  var gruppen = {};
  d.querySelectorAll(".reveal").forEach(function (el) {
    var key = el.parentElement ? (el.parentElement.className || "x") : "x";
    gruppen[key] = (gruppen[key] || 0) + 1;
    el.style.setProperty("--d", Math.min(gruppen[key] - 1, 6) * 60 + "ms");
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        e.target.querySelectorAll("[data-zahl]").forEach(zaehlen);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    d.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    d.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  // Indoor / Outdoor umschalten
  var sw = d.querySelector(".loc__switch");
  if (sw) {
    var tabs = sw.querySelectorAll('[role="tab"]');
    var waehlen = function (tab, fokus) {
      tabs.forEach(function (t) {
        var an = t === tab;
        t.setAttribute("aria-selected", an ? "true" : "false");
        t.tabIndex = an ? 0 : -1;
        var p = d.getElementById(t.getAttribute("aria-controls"));
        p.hidden = !an;
        p.classList.toggle("is-on", an);
        if (an) p.querySelectorAll("[data-zahl]").forEach(zaehlen);
      });
      sw.classList.toggle("is-out", tab.id === "tab-out");
      if (fokus) tab.focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { waehlen(t); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); waehlen(tabs[(i + 1) % tabs.length], true); }
      });
    });
  }

  // Mauslicht auf Karten
  if (window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    d.querySelectorAll(".card, .ev").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  // Großes Bild bewegt sich leicht beim Scrollen
  var wow = d.querySelector(".wow"), wowImg = wow && wow.querySelector("img");
  if (wowImg && !ruhig) {
    var lauf = false;
    var parallax = function () {
      lauf = false;
      var r = wow.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      wowImg.style.setProperty("--py", (p * -60).toFixed(1) + "px");
    };
    window.addEventListener("scroll", function () { if (!lauf) { lauf = true; requestAnimationFrame(parallax); } }, { passive: true });
    parallax();
  }

  // Gäste-Regler mit Empfehlung
  var r = d.getElementById("gaeste"), zahl = d.getElementById("gaeste-zahl"), tipp = d.getElementById("gaeste-tipp");
  if (r) {
    var regler = function () {
      var v = +r.value;
      zahl.textContent = v >= 800 ? "800+" : v;
      r.style.setProperty("--p", ((v - r.min) / (r.max - r.min) * 100) + "%");
      tipp.innerHTML = v <= 400
        ? "Passt perfekt in den <b>Indoor-Floor</b>."
        : "Das wird groß: Dafür ist das <b>Outdoor-Areal</b> da.";
    };
    r.addEventListener("input", regler);
    regler();
  }

  // Formular: im Entwurf wird nichts verschickt
  var f = d.getElementById("form");
  if (f) {
    var dat = f.querySelector('[name="datum"]');
    if (dat) dat.min = new Date().toISOString().slice(0, 10);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var fehlt = false;
      ["datum", "name", "kontakt"].forEach(function (n) {
        var el = f.querySelector('[name="' + n + '"]');
        var leer = !el.value.trim();
        el.classList.toggle("is-bad", leer);
        if (leer && !fehlt) { fehlt = true; el.focus(); }
      });
      d.getElementById("form-err").hidden = !fehlt;
      if (fehlt) return;
      d.getElementById("form-ok").hidden = false;
      f.querySelector('button[type="submit"]').textContent = "Gesendet ✓";
    });
    f.addEventListener("input", function (e) { if (e.target.classList) e.target.classList.remove("is-bad"); });
  }
})();
