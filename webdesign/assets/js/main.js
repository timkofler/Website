// Menü (PC-Kapsel, „Mehr“, Handy-Kacheln) + aktuelles Jahr im Footer. Keine Tracker, keine Cookies (nur ein anonymer Zähler, siehe unten).
document.addEventListener("DOMContentLoaded", () => {
  // Handy-Menü: Knopf in der Kapsel öffnet die Kacheln (#mnav), offen zeigt er ein X im orangen Punkt.
  const toggle = document.querySelector(".nav-toggle");
  const mnav = document.getElementById("mnav");
  const setMenu = (open) => {
    mnav.classList.toggle("is-open", open);
    document.documentElement.classList.toggle("tk-menu-open", open);
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

  // PC: beim Scrollen wird die Leiste zur schwebenden Kapsel.
  const header = document.querySelector(".header");
  if (header && more) {
    let pill = false;
    const onScroll = () => {
      const y = window.scrollY || 0;
      const next = pill ? y > 60 : y > 140;
      if (next !== pill) { pill = next; header.classList.toggle("is-pill", pill); }
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

  // 3) Zähler: Zahlen mit data-count (Preise, Kennzahlen) zählen beim Hinscrollen von 0 hoch, Tausender mit Punkt (1.190).
  //    Im HTML steht immer der Endwert (Google, ohne JavaScript). Nur Zahlen, die beim Laden unter dem Bildschirm liegen,
  //    werden vorher auf 0 gesetzt; die Breite bleibt fix, damit nichts daneben verrutscht.
  function setupCount() {
    var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
    if (calm || !counters.length) return;
    var vh = window.innerHeight || 800;
    var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."); };
    var pending = counters.filter(function (el) { return el.getBoundingClientRect().top >= vh * 0.9; });
    if (!pending.length) return;
    pending.forEach(function (el) { el.classList.add("tk-count"); });
    var widths = pending.map(function (el) { return el.getBoundingClientRect().width; });
    pending.forEach(function (el, i) {
      el.style.minWidth = Math.ceil(widths[i]) + "px";
      el.textContent = "0" + (el.getAttribute("data-suffix") || "");
    });
    var run = function (el) {
      var end = +el.getAttribute("data-count"), suf = el.getAttribute("data-suffix") || "", t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / 1200);
        el.textContent = fmt(Math.round(end * (1 - Math.pow(1 - p, 3)))) + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };
    // Per Scroll statt IntersectionObserver: so zählt auch eine Zahl, über die ein Sprung (z. B. zu #ablauf) hinwegscrollt
    var tick = false;
    var check = function () {
      tick = false;
      var mark = (window.innerHeight || 800) * 0.85;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top > mark) return true;
        run(el);
        return false;
      });
      if (!pending.length) window.removeEventListener("scroll", ask);
    };
    var ask = function () { if (!tick) { tick = true; requestAnimationFrame(check); } };
    window.addEventListener("scroll", ask, { passive: true });
  }
  if (document.readyState === "complete") requestAnimationFrame(setupCount);
  else window.addEventListener("load", function () { requestAnimationFrame(setupCount); });

  // 4) Beispiel-Band: beim Antippen kurz anhalten
  Array.prototype.forEach.call(document.querySelectorAll("[data-band]"), function (band) {
    var tid;
    band.addEventListener("touchstart", function () { clearTimeout(tid); band.classList.add("is-hold"); }, { passive: true });
    band.addEventListener("touchend", function () { clearTimeout(tid); tid = setTimeout(function () { band.classList.remove("is-hold"); }, 2500); }, { passive: true });
  });

  // 5) Ablauf-Schritte (.steps, nur Black/White): die orange Linie zwischen den Nummern füllt sich beim Scrollen,
  //    erreichte Nummern leuchten auf. Am PC läuft sie in jeder Reihe von links nach rechts, am Handy senkrecht.
  //    Ohne JavaScript oder bei "Bewegung reduzieren" ist alles von Anfang an gefüllt (CSS-Standard --tkf: 1).
  var stepLists = Array.prototype.slice.call(document.querySelectorAll(".steps"));
  if (stepLists.length && !calm && root.classList.contains("tk-black")) {
    var vertical = window.matchMedia("(max-width: 680px)"), stepTick = false;
    var paintSteps = function () {
      stepTick = false;
      var mark = (window.innerHeight || 800) * 0.8;
      stepLists.forEach(function (list) {
        var steps = Array.prototype.filter.call(list.children, function (c) { return c.classList.contains("step"); });
        var rects = steps.map(function (s) { return s.getBoundingClientRect(); });
        var col = 0, prevOn = true;
        steps.forEach(function (s, i) {
          var r = rects[i], f;
          if (vertical.matches) {
            // Nummer oben links (40 px), Linie von 52 px unter der Oberkante bis zur nächsten Karte (black.css)
            f = (mark - (r.top + 52)) / Math.max(1, r.height - 24);
            s.classList.toggle("is-on", mark >= r.top + 20);
          } else {
            col = i > 0 && Math.abs(r.top - rects[i - 1].top) < 4 ? col + 1 : 0;
            // Nummern-Mitte liegt 38 px über der Karte; jede Linie braucht 70 px Scrollweg, dann die nächste
            var start = mark - (r.top - 38) - col * 70;
            f = start / 70;
            s.classList.toggle("is-on", col === 0 ? start >= 0 : prevOn);
          }
          f = Math.max(0, Math.min(1, f));
          s.style.setProperty("--tkf", f.toFixed(3));
          prevOn = f >= 1;
        });
        list.classList.add("tk-live");
      });
    };
    var askSteps = function () { if (!stepTick) { stepTick = true; requestAnimationFrame(paintSteps); } };
    window.addEventListener("scroll", askSteps, { passive: true });
    window.addEventListener("resize", askSteps);
    paintSteps();
  }
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
  // Der Knopf „Jemanden empfehlen“ ist keine Anfrage und zählt nicht, ebenso Mail-Links an andere Adressen.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var h = a.getAttribute("href"), k = "";
    if (/^https:\/\/wa\.me\//.test(h)) k = "whatsapp";
    else if (/^https:\/\/t\.me\//.test(h)) k = "telegram";
    else if (/^tel:/.test(h)) k = "telefon";
    else if (/^mailto:office@tim-kofler\.at/i.test(h) && !/subject=Empfehlung/i.test(h)) k = "email";
    if (k) navigator.sendBeacon("/api/zaehler.php", new URLSearchParams({ k: k }));
  });
})();
