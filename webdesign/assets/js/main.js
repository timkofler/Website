// Mobile Navigation + aktuelles Jahr im Footer. Keine Tracker, keine Cookies (nur ein anonymer Zähler, siehe unten).
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});

// Bewegung: Einblenden beim Scrollen, Funktions-Tour und Zähler.
// Berücksichtigt "Bewegung reduzieren". Ohne JavaScript bleibt alles sichtbar.
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  // 1) Einblenden: nur Elemente, die beim Laden noch unterhalb des Bildschirms liegen.
  //    Läuft erst nach dem Laden, damit der erste Bildaufbau nicht gebremst wird.
  function setupReveal() {
  var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (!calm && hasIO && items.length && (window.scrollY || 0) < 50) {
    var vh = window.innerHeight || 800;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("reveal-in");
        e.target.classList.remove("reveal-wait");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    // erst alle Positionen lesen, dann schreiben (vermeidet wiederholtes Neuberechnen des Layouts)
    var below = items.filter(function (el) { return el.getBoundingClientRect().top >= vh; });
    below.forEach(function (el) {
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty("--d", Math.min(sib, 5) * 80 + "ms");
      el.classList.add("reveal-wait");
      io.observe(el);
    });
  }
  }
  if (document.readyState === "complete") requestAnimationFrame(setupReveal);
  else window.addEventListener("load", function () { requestAnimationFrame(setupReveal); });

  // 2) Funktions-Tour (Tabs mit automatischem Weiterschalten)
  var tour = document.querySelector("[data-tour]");
  if (tour) {
    var tabs = Array.prototype.slice.call(tour.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
    var current = 0, timer = null, stopped = calm, visible = false, MS = 7000;
    tour.style.setProperty("--tour-ms", MS + "ms");

    function show(i, focus) {
      current = (i + tabs.length) % tabs.length;
      tabs.forEach(function (t, k) {
        var on = k === current;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        panels[k].classList.toggle("is-active", on);
      });
      if (focus) tabs[current].focus();
      // Tab bei schmalem Bildschirm sichtbar halten, ohne die Seite zu verschieben
      var bar = tabs[current].parentElement;
      if (bar.scrollWidth > bar.clientWidth) bar.scrollLeft = tabs[current].offsetLeft - 16;
    }
    function play() {
      clearTimeout(timer);
      tour.classList.remove("is-playing");
      if (stopped || !visible) return;
      void tour.offsetWidth; // Fortschrittsbalken neu starten
      tour.classList.add("is-playing");
      timer = setTimeout(function () { show(current + 1); play(); }, MS);
    }
    function stop() { stopped = true; clearTimeout(timer); tour.classList.remove("is-playing"); }

    tabs.forEach(function (t, k) {
      t.addEventListener("click", function () { stop(); show(k); });
      t.addEventListener("keydown", function (e) {
        var d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (e.key === "Home") { e.preventDefault(); stop(); show(0, true); }
        else if (e.key === "End") { e.preventDefault(); stop(); show(tabs.length - 1, true); }
        else if (d) { e.preventDefault(); stop(); show(current + d, true); }
      });
    });
    tour.addEventListener("mouseenter", function () { clearTimeout(timer); tour.classList.remove("is-playing"); });
    tour.addEventListener("mouseleave", play);
    tour.addEventListener("focusin", stop);
    if (hasIO) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; play(); }, { threshold: 0.35 }).observe(tour);
    }
  }

  // 3) Zähler in den Kennzahlen
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  if (!calm && hasIO && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, end = +el.getAttribute("data-count"), suf = el.getAttribute("data-suffix") || "", t0 = null;
        cio.unobserve(el);
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / 1100);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suf : "");
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  // 4) Beispiel-Band: beim Antippen kurz anhalten
  Array.prototype.forEach.call(document.querySelectorAll("[data-band]"), function (band) {
    var tid;
    band.addEventListener("touchstart", function () { clearTimeout(tid); band.classList.add("is-hold"); }, { passive: true });
    band.addEventListener("touchend", function () { clearTimeout(tid); tid = setTimeout(function () { band.classList.remove("is-hold"); }, 2500); }, { passive: true });
  });
})();

// Anonymer Besucherzähler: meldet nur Seite und Herkunft (utm_source/-campaign, Google-Anzeige oder verweisende Seite)
// an den eigenen Server, der daraus Tagessummen bildet. Keine Cookies, kein Speicher im Browser, keine Kennung.
// Neu laden und Zurück-Taste zählen nicht, vorgeladene Seiten erst, wenn sie wirklich angezeigt werden.
(function () {
  if (!navigator.sendBeacon || !window.URLSearchParams || location.hostname !== "tim-kofler.at") return;
  var nav = window.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (nav && (nav.type === "reload" || nav.type === "back_forward")) return;
  var send = function () {
    var q = new URLSearchParams(location.search), r = "", ext = true;
    try { if (document.referrer) { r = new URL(document.referrer).hostname; ext = r.replace(/^www\./, "") !== location.hostname; } } catch (e) {}
    navigator.sendBeacon("/api/zaehler.php", new URLSearchParams({
      p: location.pathname, e: ext ? "1" : "0", r: ext ? r : "",
      u: (q.get("utm_source") || "").slice(0, 60), c: (q.get("utm_campaign") || "").slice(0, 60),
      g: q.get("gclid") || q.get("gbraid") || q.get("wbraid") ? "1" : "0"
    }));
  };
  if (document.prerendering) document.addEventListener("prerenderingchange", send, { once: true });
  else send();
  // Klicks auf Kontakt-Links nur als Summe pro Art zählen (WhatsApp, Telegram, Telefon, E-Mail), ohne Seite oder Kennung.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var h = a.getAttribute("href"), k = "";
    if (/^https:\/\/wa\.me\//.test(h)) k = "whatsapp";
    else if (/^https:\/\/t\.me\//.test(h)) k = "telegram";
    else if (/^tel:/.test(h)) k = "telefon";
    else if (/^mailto:/.test(h)) k = "email";
    if (k) navigator.sendBeacon("/api/zaehler.php", new URLSearchParams({ k: k }));
  });
})();
