// Tim Kofler – Seite „So läuft ein Projekt“: Linie der Zeitleiste füllt sich beim Scrollen, erreichte Schritte leuchten,
// das Kundenportal-Video läuft nur, solange es zu sehen ist. Respektiert "Bewegung reduzieren" und "Daten sparen".
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var tl = document.querySelector("[data-ab-tl]");
  var fill = document.querySelector("[data-ab-fill]");
  if (tl && fill) {
    var line = fill.parentElement;
    var steps = Array.prototype.slice.call(tl.querySelectorAll(".ab-step"));
    var end = tl.querySelector("[data-ab-end]");
    var paths = end ? end.querySelectorAll(".ab-total__frame path") : [];
    var ticking = false;
    // Linie endet genau dort, wo die linke Kante der Abschluss-Box gerade wird; der Rahmen startet am selben Punkt.
    var layout = function () {
      if (!end) return;
      var r = parseFloat(getComputedStyle(end).borderTopLeftRadius) || 20;
      line.style.bottom = (tl.offsetHeight - end.offsetTop - r) + "px";
      var w = end.offsetWidth + 2, h = end.offsetHeight + 2, a = 1, k = r;
      // Erst die linke Kante hinunter, dann gegen den Uhrzeigersinn einmal rundherum zurück zum Andockpunkt
      var d = "M" + a + " " + (a + k) + "V" + (h - a - k) + "A" + k + " " + k + " 0 0 0 " + (a + k) + " " + (h - a) +
        "H" + (w - a - k) + "A" + k + " " + k + " 0 0 0 " + (w - a) + " " + (h - a - k) + "V" + (a + k) +
        "A" + k + " " + k + " 0 0 0 " + (w - a - k) + " " + a + "H" + (a + k) +
        "A" + k + " " + k + " 0 0 0 " + a + " " + (a + k) + "Z";
      for (var i = 0; i < paths.length; i++) paths[i].setAttribute("d", d);
    };
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
      if (end) end.classList.toggle("is-on", reduce || p >= 0.999);
    };
    var ask = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", ask, { passive: true });
    window.addEventListener("resize", function () { layout(); ask(); });
    layout();
    update();
    // Schriften und Bilder können die Höhe noch ändern
    window.addEventListener("load", function () { layout(); update(); });
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
