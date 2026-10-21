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
    var draw = end && end.querySelector(".ab-total__draw");
    var glint = end && end.querySelector(".ab-total__glint");
    var total = 0, left = 0, full = false, animT = 0;
    var ticking = false;
    // Die Linie endet an der eckigen Ecke oben links der Abschluss-Box und läuft als ihre linke Kante weiter.
    var layout = function () {
      if (!end) return;
      var r = parseFloat(getComputedStyle(end).borderBottomLeftRadius) || 20;
      line.style.bottom = (tl.offsetHeight - end.offsetTop) + "px";
      var w = end.offsetWidth + 2, h = end.offsetHeight + 2, a = 1, k = r;
      // Linke Kante hinunter, dann gegen den Uhrzeigersinn einmal rundherum zurück zur Ecke oben links
      var d = "M" + a + " 0V" + (h - a - k) + "A" + k + " " + k + " 0 0 0 " + (a + k) + " " + (h - a) +
        "H" + (w - a - k) + "A" + k + " " + k + " 0 0 0 " + (w - a) + " " + (h - a - k) + "V" + (a + k) +
        "A" + k + " " + k + " 0 0 0 " + (w - a - k) + " " + a + "H" + a;
      draw.setAttribute("d", d);
      glint.setAttribute("d", d);
      glint.setAttribute("pathLength", "1");
      total = draw.getTotalLength();
      left = h - a - k;
      draw.style.strokeDasharray = total + " " + total;
    };
    // Kurz weich animieren, wenn sich der Rahmen von selbst schließt oder wieder in die linke Kante zurückzieht
    var anim = function () {
      draw.classList.add("is-anim");
      clearTimeout(animT);
      animT = setTimeout(function () { draw.classList.remove("is-anim"); }, 1000);
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
      if (!end || !total) return;
      // Wie weit die linke Kante schon gefüllt ist (genau im Tempo der Linie)
      var e = end.getBoundingClientRect();
      var seg = reduce ? left : Math.max(0, Math.min(left, mark - e.top));
      var nowFull = reduce || seg >= left;
      if (nowFull !== full) { full = nowFull; if (!reduce) anim(); }
      var shown = full ? total : seg;
      draw.style.strokeDashoffset = (total - shown).toFixed(2);
      draw.style.visibility = shown > 0.5 || draw.classList.contains("is-anim") ? "visible" : "hidden";
      end.classList.toggle("is-on", full);
    };
    var ask = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    if (draw) draw.addEventListener("transitionend", function () { draw.classList.remove("is-anim"); update(); });
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
