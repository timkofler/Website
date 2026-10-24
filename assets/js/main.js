// Menü (PC-Kapsel, „Mehr“, Handy-Kacheln) wie auf tim-kofler.at + aktuelles Jahr im Footer. Keine Tracker, keine Cookies.
document.addEventListener("DOMContentLoaded", () => {
  // Handy-Menü: runder Knopf öffnet die Kacheln (#mnav) und streckt sich dabei zur „Schließen“-Pille.
  const toggle = document.querySelector(".nav-toggle");
  const mnav = document.getElementById("mnav");
  const setMenu = (open) => {
    mnav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
  };
  if (toggle && mnav) {
    toggle.addEventListener("click", () => setMenu(!mnav.classList.contains("is-open")));
    mnav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  }

  // PC: „Mehr“ klappt per Maus (CSS :hover), Klick, Tippen und Tastatur auf.
  const more = document.querySelector(".nav__more");
  if (more) {
    const btn = more.querySelector(".nav__more-btn");
    const setMore = (open) => { more.classList.toggle("is-open", open); btn.setAttribute("aria-expanded", String(open)); };
    btn.addEventListener("click", () => setMore(!more.classList.contains("is-open")));
    document.addEventListener("click", (e) => { if (!more.contains(e.target)) setMore(false); });
    more.addEventListener("focusout", (e) => { if (!more.contains(e.relatedTarget)) setMore(false); });
    more.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMore(false)));
  }
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (more && more.classList.contains("is-open")) { more.classList.remove("is-open"); more.querySelector(".nav__more-btn").setAttribute("aria-expanded", "false"); more.querySelector(".nav__more-btn").focus(); }
    if (mnav && mnav.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
  });

  // PC: beim Scrollen wird die Leiste zur schwebenden Glas-Kapsel (fx.js richtet danach die Menü-Kapsel neu aus).
  const header = document.querySelector(".header");
  if (header && more) {
    let pill = false;
    const onScroll = () => {
      const y = window.scrollY || 0;
      const next = pill ? y > 60 : y > 140;
      if (next !== pill) { pill = next; header.classList.toggle("is-pill", pill); document.dispatchEvent(new CustomEvent("x:pill")); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
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
})();
