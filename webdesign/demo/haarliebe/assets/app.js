// Haarliebe (Entwurf): Menü, Einblenden, Fächer-Karten, Blond-Finder, sanfte Parallaxe.
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  root.classList.add("js");
  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Kopf bekommt beim Scrollen Hintergrund
  var nav = d.getElementById("nav");
  function scroll() { nav.classList.toggle("is-solid", window.scrollY > 30); }
  scroll();
  window.addEventListener("scroll", scroll, { passive: true });

  // Handy-Menü: geschlossen mit hidden (display:none), damit es nichts verdeckt
  var burger = d.getElementById("burger"), menu = d.getElementById("menu");
  function menuZu() {
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Menü öffnen");
    menu.classList.remove("is-open");
    d.body.classList.remove("menu-open");
    d.body.style.overflow = "";
    setTimeout(function () { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 220);
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
    el.style.setProperty("--d", Math.min(gruppen[key] - 1, 5) * 80 + "ms");
  });
  if ("IntersectionObserver" in window && !ruhig) {
    var io = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
    d.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    d.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  // Fächer-Karten (Blonde / Balayage / Blowouts): am PC geht die Karte unter der Maus auf, am Handy per Tipp
  var fans = d.querySelectorAll(".fan");
  function auf(f) { fans.forEach(function (x) { x.classList.toggle("is-open", x === f); }); }
  fans.forEach(function (f) {
    f.addEventListener("mouseenter", function () { if (window.matchMedia("(hover: hover)").matches) auf(f); });
    f.addEventListener("focusin", function () { auf(f); });
    f.addEventListener("click", function (e) { if (!e.target.closest("button")) auf(f); });
  });

  // Blond-Finder: Ton antippen, Strähnen färben sich um
  var TOENE = {
    champagner: ["Champagner", "Hell, weich und edel. Ein leicht warmes Blond, das bei fast jedem Hautton frisch wirkt.", "#6b5140", "#d9c19a", "#f4e6cf"],
    perlmutt: ["Perlmutt", "Kühl und klar mit einem zarten Schimmer. Schön zu hellen Hauttönen und für alle, die es modern mögen.", "#6a5f58", "#c9bfb3", "#f2ece4"],
    honig: ["Honig", "Warm und sonnig, wie nach dem Sommer. Wächst weich heraus und schmeichelt goldenen Hauttönen.", "#5a3a22", "#b47f3f", "#e9c48d"],
    rosegold: ["Rosé-Gold", "Ein Hauch Rosé im Blond. Verspielt, aber nicht schrill, und ein echter Hingucker im Licht.", "#5d3b33", "#b97c68", "#efc7b5"],
    karamell: ["Karamell", "Tiefer und satter, ideal als Balayage auf dunklerem Haar. Natürlich und pflegeleicht.", "#3e2617", "#7d4f2c", "#d8a66f"]
  };
  var tones = d.querySelectorAll("[data-tone]"), mid = d.querySelector(".st-mid"), end = d.querySelector(".st-end"), wurzel = d.querySelector(".st-root"), strands = d.querySelector(".strands");
  function ton(b, fokus) {
    var t = TOENE[b.dataset.tone];
    tones.forEach(function (x) { var an = x === b; x.setAttribute("aria-checked", an); x.tabIndex = an ? 0 : -1; });
    d.getElementById("tone-name").textContent = t[0];
    d.getElementById("tone-txt").textContent = t[1];
    wurzel.setAttribute("stop-color", t[2]); mid.setAttribute("stop-color", t[3]); end.setAttribute("stop-color", t[4]);
    strands.classList.remove("is-shine"); void strands.offsetWidth; strands.classList.add("is-shine");
    if (fokus) b.focus();
  }
  tones.forEach(function (b, i) {
    b.tabIndex = i === 0 ? 0 : -1;
    b.addEventListener("click", function () { ton(b); });
    b.addEventListener("keydown", function (e) {
      var n = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
      if (!n) return;
      e.preventDefault();
      ton(tones[(i + n + tones.length) % tones.length], true);
    });
  });

  // Sanfte Parallaxe in den Bogen-Bildern
  var par = d.querySelectorAll("[data-par] img");
  if (!ruhig && par.length) {
    var tick = false;
    var bewegen = function () {
      tick = false;
      var h = window.innerHeight;
      par.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > h) return;
        var p = (r.top + r.height / 2 - h / 2) / h;
        img.style.transform = "translate3d(0," + (p * -34).toFixed(1) + "px,0) scale(1.1)";
      });
    };
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(bewegen); } }, { passive: true });
    bewegen();
  }

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
      tip.textContent = "Im Entwurf steht eine Platzhalter-Nummer. Auf der fertigen Seite ruft dieser Knopf direkt bei Ihnen an.";
      d.body.appendChild(tip);
    }
    tip.classList.add("is-on");
    clearTimeout(tip._t);
    tip._t = setTimeout(function () { tip.classList.remove("is-on"); }, 3200);
  });
})();
