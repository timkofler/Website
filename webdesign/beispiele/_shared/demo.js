// Gemeinsame Helfer der Beispielseiten: Einblenden beim Scrollen, Videos nur abspielen,
// wenn sie sichtbar sind, und Zähler, die hochlaufen. Ohne JavaScript bleibt alles sichtbar.
(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var io = "IntersectionObserver" in window;
  document.documentElement.classList.add("tk-js");

  // [data-reveal] blendet ein, sobald es ins Bild kommt; --d steuert die Verzögerung.
  var rev = document.querySelectorAll("[data-reveal]");
  if (!io || reduce) { rev.forEach(function (el) { el.classList.add("is-in"); }); }
  else {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); ro.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    rev.forEach(function (el) { ro.observe(el); });
  }

  // video[data-autoplay]: lädt erst in Sichtweite, spielt stumm in Schleife, pausiert außerhalb.
  // Bei "weniger Bewegung" oder Datensparmodus bleibt das Vorschaubild stehen.
  var save = navigator.connection && navigator.connection.saveData;
  var vids = document.querySelectorAll("video[data-autoplay]");
  vids.forEach(function (v) { v.muted = true; v.setAttribute("muted", ""); v.playsInline = true; });
  if (!reduce && !save) {
    if (!io) vids.forEach(function (v) { v.play().catch(function () {}); });
    else {
      var vo = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var v = e.target;
          if (e.isIntersecting) { if (v.preload === "none") v.preload = "auto"; v.play().catch(function () {}); }
          else v.pause();
        });
      }, { threshold: 0.2 });
      vids.forEach(function (v) { vo.observe(v); });
    }
  }

  // [data-count="25"] zählt beim ersten Sichtbarwerden von 0 hoch.
  var nums = document.querySelectorAll("[data-count]");
  function run(el) {
    var to = parseFloat(el.getAttribute("data-count")), suf = el.getAttribute("data-suffix") || "", t0 = null;
    if (reduce) { el.textContent = to + suf; return; }
    function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1400), k = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * k) + suf; if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  if (!io) nums.forEach(run);
  else { var no = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { run(e.target); no.unobserve(e.target); } }); }, { threshold: 0.6 });
    nums.forEach(function (el) { no.observe(el); }); }
})();
