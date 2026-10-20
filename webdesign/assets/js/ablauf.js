// Tim Kofler – Seite „So läuft ein Projekt“: Linie der Zeitleiste füllt sich beim Scrollen, erreichte Schritte leuchten,
// das Kundenportal-Video läuft nur, solange es zu sehen ist. Respektiert "Bewegung reduzieren" und "Daten sparen".
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var tl = document.querySelector("[data-ab-tl]");
  var fill = document.querySelector("[data-ab-fill]");
  if (tl && fill) {
    var line = fill.parentElement;
    var steps = Array.prototype.slice.call(tl.querySelectorAll(".ab-step"));
    var ticking = false;
    var update = function () {
      ticking = false;
      var mark = window.innerHeight * 0.6;
      var r = line.getBoundingClientRect();
      var p = r.height > 0 ? Math.max(0, Math.min(1, (mark - r.top) / r.height)) : 0;
      fill.style.setProperty("--p", reduce ? 1 : p.toFixed(4));
      steps.forEach(function (s) {
        var d = s.querySelector(".ab-step__dot").getBoundingClientRect();
        s.classList.toggle("is-on", reduce || d.top + d.height / 2 <= mark);
      });
    };
    var ask = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", ask, { passive: true });
    window.addEventListener("resize", ask);
    update();
  }

  var vids = document.querySelectorAll("video[data-ab-play]");
  var save = navigator.connection && navigator.connection.saveData;
  if (vids.length && !reduce && !save && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { v.muted = true; if (v.preload === "none") v.preload = "auto"; v.play().catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.35 });
    vids.forEach(function (v) { io.observe(v); });
  } else {
    // Ohne automatisches Abspielen: Steuerung zeigen, damit man das Video selbst starten kann
    vids.forEach(function (v) { v.controls = true; });
  }
})();
