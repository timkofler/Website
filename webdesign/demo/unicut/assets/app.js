// Haarstudio Uni:cut (Entwurf): Menü, Leistungs-Reiter, Looks-Leiste, heutiger Tag, Formular-Vorschau, Einblenden.
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  root.classList.add("js");

  // Kopf bekommt beim Scrollen Hintergrund
  var nav = d.getElementById("nav");
  function kopf() { nav.classList.toggle("is-solid", window.scrollY > 30); }
  kopf();
  window.addEventListener("scroll", kopf, { passive: true });

  // Handy-Menü: geschlossen mit hidden (display:none), damit es nichts verdeckt
  var burger = d.getElementById("burger"), menu = d.getElementById("menu");
  function menuZu() {
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Menü öffnen");
    menu.classList.remove("is-open");
    d.body.classList.remove("menu-open");
    d.body.style.overflow = "";
    setTimeout(function () { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 200);
  }
  burger.addEventListener("click", function () {
    if (burger.getAttribute("aria-expanded") === "true") return menuZu();
    menu.hidden = false;
    requestAnimationFrame(function () { menu.classList.add("is-open"); });
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Menü schließen");
    d.body.classList.add("menu-open");
    d.body.style.overflow = "hidden";
  });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) menuZu(); });
  d.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) menuZu(); });
  window.addEventListener("resize", function () { if (window.innerWidth > 960 && !menu.hidden) menuZu(); });

  // Einblenden beim Scrollen, gestaffelt
  var gruppen = {};
  d.querySelectorAll(".reveal").forEach(function (el) {
    var key = el.parentElement ? (el.parentElement.className || "x") : "x";
    gruppen[key] = (gruppen[key] || 0) + 1;
    el.style.setProperty("--d", Math.min(gruppen[key] - 1, 5) * 70 + "ms");
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.1 });
    d.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    d.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  // Leistungen: Haare / Wimpern / Nägel
  var tabs = d.querySelectorAll('.svc__tabs [role="tab"]');
  function waehlen(tab, fokus) {
    tabs.forEach(function (t) {
      var an = t === tab;
      t.setAttribute("aria-selected", an ? "true" : "false");
      t.tabIndex = an ? 0 : -1;
      var p = d.getElementById(t.getAttribute("aria-controls"));
      p.hidden = !an;
      p.classList.toggle("is-on", an);
    });
    if (fokus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { waehlen(t); });
    t.addEventListener("keydown", function (e) {
      var n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!n) return;
      e.preventDefault();
      waehlen(tabs[(i + n + tabs.length) % tabs.length], true);
    });
  });

  // Looks: Pfeile schieben die Leiste weiter
  var row = d.getElementById("looks-row");
  d.querySelectorAll(".arrow").forEach(function (b) {
    b.addEventListener("click", function () {
      var karte = row.querySelector(".look");
      var weite = karte ? karte.getBoundingClientRect().width + 18 : 300;
      row.scrollBy({ left: weite * +b.getAttribute("data-dir"), behavior: "smooth" });
    });
  });

  // Im Entwurf steht eine Platzhalter-Nummer: Tippen ruft nicht an, sondern zeigt einen Hinweis
  var tip = null;
  d.addEventListener("click", function (e) {
    var a = e.target.closest("[data-demo-tel]");
    if (!a) return;
    e.preventDefault();
    if (!tip) {
      tip = d.createElement("p");
      tip.className = "demo-tip";
      tip.setAttribute("role", "status");
      tip.textContent = "Im Entwurf steht eine Platzhalter-Nummer. Auf der fertigen Seite ruft dieser Knopf direkt bei euch an.";
      d.body.appendChild(tip);
    }
    tip.classList.add("is-on");
    clearTimeout(tip._t);
    tip._t = setTimeout(function () { tip.classList.remove("is-on"); }, 3200);
  });

  // Öffnungszeiten: heutigen Tag hervorheben
  var heute = d.querySelector('#hours [data-tag="' + new Date().getDay() + '"]');
  if (heute) heute.classList.add("is-heute");

  // Formular: im Entwurf wird nichts verschickt
  var f = d.getElementById("form");
  if (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var fehlt = false;
      ["name", "tel"].forEach(function (n) {
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
