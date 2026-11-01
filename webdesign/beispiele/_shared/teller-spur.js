/* Teller-Spur: zeichnet zwischen den Tellern eine Streuspur (Salz, Gewürz, Mehl) in ein Canvas.
   Die Spur wächst mit dem Scrollen von Teller zu Teller, die Teller drehen sich dabei leicht.
   Aufbau: <section class="tz" data-tz data-tz-farben="#fff,#ffc56b"> … <ol class="tz__list"> <li class="tz__row"><figure class="tz__plate"><img>…
   Bei "Bewegung reduzieren" wird die Spur fertig gezeichnet und nichts dreht sich. */
(function () {
  var secs = document.querySelectorAll("[data-tz]");
  if (!secs.length) return;
  var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function gauss(r) { return (r() + r() + r() + r() - 2) / 2; } // ungefähr -1 … 1, Mitte dichter

  secs.forEach(function (sec, si) {
    var list = sec.querySelector(".tz__list");
    var plates = [].slice.call(sec.querySelectorAll(".tz__plate"));
    if (!list || plates.length < 2) return;
    var farben = (sec.getAttribute("data-tz-farben") || "#ffffff").split(",");
    var cv = document.createElement("canvas");
    cv.className = "tz__canvas"; cv.setAttribute("aria-hidden", "true");
    list.insertBefore(cv, list.firstChild);
    var ctx = cv.getContext("2d");
    var segs = [], dpr = 1, W = 0, H = 0, last = "", queued = false, active = false;

    function layout() {
      var lr = list.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = lr.width; H = lr.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      var pts = plates.map(function (p) {
        var r = p.getBoundingClientRect();
        return { x: r.left - lr.left + r.width / 2, y: r.top - lr.top + r.height / 2, r: r.width / 2 };
      });
      var small = W < 720;
      segs = [];
      for (var i = 0; i < pts.length - 1; i++) {
        var a = pts[i], b = pts[i + 1], dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
        var ux = dx / len, uy = dy / len;
        var s = { x: a.x + ux * a.r * .78, y: a.y + uy * a.r * .78 };
        var e = { x: b.x - ux * b.r * .78, y: b.y - uy * b.r * .78 };
        var bend = (i % 2 ? -1 : 1) * len * .12; // leichte Kurve, abwechselnd
        var c = { x: (s.x + e.x) / 2 - uy * bend, y: (s.y + e.y) / 2 + ux * bend };
        var r = rng(9301 + si * 97 + i * 31), n = small ? 800 : 1500, wid = small ? 30 : 58, ps = [];
        for (var k = 0; k < n; k++) {
          var t = r();
          var mt = 1 - t;
          var px = mt * mt * s.x + 2 * mt * t * c.x + t * t * e.x;
          var py = mt * mt * s.y + 2 * mt * t * c.y + t * t * e.y;
          var tx = 2 * mt * (c.x - s.x) + 2 * t * (e.x - c.x), ty = 2 * mt * (c.y - s.y) + 2 * t * (e.y - c.y);
          var tl = Math.hypot(tx, ty) || 1, nx = -ty / tl, ny = tx / tl;
          var w = wid * (.25 + Math.sin(Math.PI * t) * .9);
          var off = gauss(r) * w * (r() < .12 ? 2.2 : 1); // ein paar Krümel fliegen weiter
          var along = (r() - .5) * 10;
          var big = r();
          ps.push({
            t: t,
            x: px + nx * off + tx / tl * along,
            y: py + ny * off + ty / tl * along,
            s: big > .97 ? 1.6 + r() * 1.4 : .45 + r() * 1.05,
            a: .35 + r() * .65,
            c: farben[Math.floor(r() * farben.length)]
          });
        }
        segs.push({ s: s, e: e, ps: ps });
      }
      last = "";
      draw();
    }

    function progress(seg, lrTop, vh) {
      if (still) return 1;
      var y0 = lrTop + seg.s.y, y1 = lrTop + seg.e.y, line = vh * .72;
      return Math.max(0, Math.min(1, (line - y0) / Math.max(1, y1 - y0)));
    }

    function draw() {
      queued = false;
      var lr = list.getBoundingClientRect(), vh = window.innerHeight;
      var prog = segs.map(function (g) { return Math.round(progress(g, lr.top, vh) * 200) / 200; });
      var key = prog.join(",");
      if (key !== last) {
        last = key;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        segs.forEach(function (g, i) {
          var p = prog[i]; if (!p) return;
          for (var k = 0; k < g.ps.length; k++) {
            var q = g.ps[k]; if (q.t > p) continue;
            var edge = Math.min(1, (p - q.t) * 12 + .25); // Spitze der Spur etwas heller auslaufen lassen
            ctx.globalAlpha = q.a * edge;
            ctx.fillStyle = q.c;
            ctx.beginPath(); ctx.arc(q.x, q.y, q.s, 0, 6.2832); ctx.fill();
          }
        });
        ctx.globalAlpha = 1;
      }
      if (!still) {
        plates.forEach(function (p, i) {
          var r = p.getBoundingClientRect(), d = (r.top + r.height / 2 - vh / 2) / vh;
          p.style.setProperty("--tz-rot", (d * 16 * (i % 2 ? -1 : 1)).toFixed(2) + "deg");
        });
      }
    }

    function req() { if (active && !queued) { queued = true; requestAnimationFrame(draw); } }
    var io = new IntersectionObserver(function (en) { active = en[0].isIntersecting; if (active) req(); }, { rootMargin: "200px 0px" });
    io.observe(sec);
    window.addEventListener("scroll", req, { passive: true });
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(layout, 150); });
    plates.forEach(function (p) { var im = p.querySelector("img"); if (im && !im.complete) im.addEventListener("load", layout, { once: true }); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    layout();
  });
})();
