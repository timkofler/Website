// Tim Kofler – Effekte: bewegtes Punktfeld im Kopfbereich und Lichtkegel auf Karten.
// Reagiert auf Maus und Finger, läuft nur solange sichtbar und respektiert "Bewegung reduzieren".
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Lichtkegel, der dem Zeiger über Karten folgt
  document.querySelectorAll(".rule, .price, .step, .care, .tk-ref__shot, .tk-app").forEach(function (el) {
    el.classList.add("tk-spot");
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
  });

  var canvas = document.querySelector(".tk-field");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d", { alpha: true });
  var host = canvas.parentElement;
  var W = 0, H = 0, GAP = 26, dpr = 1;
  var cols = new Float32Array(0), rows = new Float32Array(0), sx = cols, cy = rows;
  var px = 0, py = 0, tx = 0, ty = 0, pw = 0, active = false;
  var running = false, visible = true, ready = false, last = 0;

  function build() {
    var r = host.getBoundingClientRect();
    W = r.width; H = r.height;
    var small = W < 600;
    dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    GAP = small ? 26 : 28;
    var nc = Math.ceil(W / GAP), nr = Math.ceil(H / GAP), i;
    cols = new Float32Array(nc); rows = new Float32Array(nr);
    for (i = 0; i < nc; i++) cols[i] = GAP / 2 + i * GAP;
    for (i = 0; i < nr; i++) rows[i] = GAP / 2 + i * GAP;
    sx = new Float32Array(nc); cy = new Float32Array(nr);
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    px += (tx - px) * 0.14; py += (ty - py) * 0.14;
    pw += ((active ? 1 : 0) - pw) * 0.08;
    var R = W < 600 ? 120 : 170, R2 = R * R, i, j;
    if (pw > 0.01) {
      var g = ctx.createRadialGradient(px, py, 0, px, py, R * 1.5);
      g.addColorStop(0, "rgba(255,110,40," + (0.16 * pw).toFixed(3) + ")");
      g.addColorStop(1, "rgba(255,110,40,0)");
      ctx.fillStyle = g;
      ctx.fillRect(px - R * 1.5, py - R * 1.5, R * 3, R * 3);
    }
    // Welle nur je Spalte und Zeile berechnen (statt für jeden Punkt)
    for (i = 0; i < cols.length; i++) sx[i] = Math.sin(cols[i] * 0.011 + t * 0.0009);
    for (j = 0; j < rows.length; j++) cy[j] = Math.cos(rows[j] * 0.014 + t * 0.0007);
    var hotOn = false;
    ctx.fillStyle = "#f0f0f0";
    for (j = 0; j < rows.length; j++) {
      var y = rows[j], cj = cy[j], near = pw > 0.01 && Math.abs(y - py) < R;
      for (i = 0; i < cols.length; i++) {
        var x = cols[i], w = sx[i] * cj;
        var ox = w * 3, oy = ox, a = 0.08 + (w + 1) * 0.06, s = 1.6, hot = false;
        if (near) {
          var dx = x - px, dy = y - py, d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            var d = Math.sqrt(d2) || 1, f = (1 - d / R) * pw;
            ox += dx / d * f * 20; oy += dy / d * f * 20;
            a += f * 0.8; s += f * 2; hot = f > 0.12;
          }
        }
        // Punkte nahe am Zeiger leuchten in der Signalfarbe
        if (hot !== hotOn) { hotOn = hot; ctx.fillStyle = hot ? "#ff7a2a" : "#f0f0f0"; }
        ctx.globalAlpha = a > 1 ? 1 : a;
        ctx.fillRect(x + ox - s / 2, y + oy - s / 2, s, s);
      }
    }
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    if (!running) return;
    // ohne Interaktion reichen 30 Bilder pro Sekunde
    if (active || pw > 0.02 || t - last > 32) { last = t; draw(t); }
    window.requestAnimationFrame(loop);
  }
  function start() { if (ready && !running && visible && !reduce && !document.hidden) { running = true; window.requestAnimationFrame(loop); } }
  function stop() { running = false; }

  function point(cx, cy2) {
    var r = canvas.getBoundingClientRect();
    tx = cx - r.left; ty = cy2 - r.top;
    if (!active && pw < 0.02) { px = tx; py = ty; }
    active = true;
  }
  host.addEventListener("pointermove", function (e) { point(e.clientX, e.clientY); }, { passive: true });
  host.addEventListener("pointerdown", function (e) { point(e.clientX, e.clientY); }, { passive: true });
  host.addEventListener("pointerleave", function () { active = false; });
  host.addEventListener("touchmove", function (e) { var p = e.touches[0]; if (p) point(p.clientX, p.clientY); }, { passive: true });
  host.addEventListener("touchend", function () { active = false; });

  // Erst nach dem Laden der Seite starten, damit der Seitenaufbau nicht gebremst wird
  function begin() {
    ready = true;
    build();
    canvas.classList.add("is-on");
    if (reduce) draw(0); else start();
  }
  if (document.readyState === "complete") setTimeout(begin, 600);
  else window.addEventListener("load", function () { setTimeout(begin, 600); });

  var rt;
  window.addEventListener("resize", function () {
    if (!ready) return;
    clearTimeout(rt);
    rt = setTimeout(function () { build(); if (reduce) draw(0); }, 150);
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); else stop(); }).observe(host);
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
})();
