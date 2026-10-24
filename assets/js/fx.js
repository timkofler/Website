// CryptoX – Effekte: bewegtes Punktfeld im Kopfbereich, Lichtkegel auf Karten,
// geneigter Dashboard-Screenshot, mehr Einblenden beim Scrollen und Lesefortschritt.
// Reagiert auf Maus und Finger, läuft nur solange sichtbar und respektiert "Bewegung reduzieren".
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Weitere Bausteine beim Scrollen einblenden (main.js übernimmt das Einblenden nach dem Laden)
  document.querySelectorAll(".head, .rule, .step, .module, .xcell, .post, .feature, .tour").forEach(function (el) {
    el.classList.add("reveal");
  });
  // Nach dem Einblenden wieder die eigenen Übergänge der Karte verwenden (sonst wirkt Hover träge)
  document.addEventListener("transitionend", function (e) {
    if (e.propertyName === "opacity" && e.target.classList && e.target.classList.contains("reveal-in")) e.target.classList.remove("reveal-in");
  });

  // Lichtkegel, der dem Zeiger über Karten folgt
  document.querySelectorAll(".rule, .step, .module, .xcell, .post, .figure").forEach(function (el) {
    el.classList.add("fx-spot");
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
  });

  // Dashboard-Screenshot im Hero neigt sich leicht zum Zeiger
  var shot = document.querySelector(".hero__shot");
  if (shot && fine && !reduce) {
    shot.addEventListener("pointermove", function (e) {
      var r = shot.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      shot.style.setProperty("--ry", (x * 6).toFixed(2) + "deg");
      shot.style.setProperty("--rx", (-y * 4).toFixed(2) + "deg");
    }, { passive: true });
    shot.addEventListener("pointerleave", function () {
      shot.style.setProperty("--ry", "0deg");
      shot.style.setProperty("--rx", "0deg");
    });
  }

  // Dashboard-Screenshot liegt beim Laden schräg nach hinten und richtet sich beim Scrollen auf
  if (shot && !reduce) {
    shot.classList.add("is-tilt");
    var tiltTick = false;
    var tilt = function () {
      tiltTick = false;
      var r = shot.getBoundingClientRect(), vh = window.innerHeight;
      // 1 solange die Oberkante im unteren Drittel liegt, 0 sobald sie ein Fünftel unter dem oberen Rand ist
      var k = Math.max(0, Math.min(1, (r.top - vh * 0.2) / (vh * 0.5)));
      k = k * k * (3 - 2 * k);
      shot.style.setProperty("--sx", (k * 24).toFixed(2) + "deg");
      shot.style.setProperty("--ss", (1 - k * 0.08).toFixed(4));
    };
    window.addEventListener("scroll", function () { if (!tiltTick) { tiltTick = true; requestAnimationFrame(tilt); } }, { passive: true });
    window.addEventListener("resize", tilt);
    tilt();
  }

  // Gleitende Glas-Kapsel im Menü (nur am PC, wo das Menü in einer Zeile steht)
  var navEl = document.querySelector(".nav");
  if (navEl && window.matchMedia) {
    var wide = window.matchMedia("(min-width: 1101px)");
    var ind = document.createElement("span");
    ind.className = "nav__ind";
    ind.setAttribute("aria-hidden", "true");
    navEl.insertBefore(ind, navEl.firstChild);
    var links = [].slice.call(navEl.querySelectorAll("a:not(.nav__cta)"));
    var current = navEl.querySelector("a.is-active:not(.nav__cta)");
    var moveInd = function (a) {
      if (!a || !wide.matches) { ind.classList.remove("is-on"); return; }
      var jump = !ind.classList.contains("is-on");
      if (jump) ind.style.transition = "opacity .25s ease"; // erstes Erscheinen ohne Gleiten
      ind.style.width = a.offsetWidth + "px";
      ind.style.setProperty("--ix", a.offsetLeft + "px");
      if (jump) { void ind.offsetWidth; ind.style.transition = ""; }
      ind.classList.add("is-on");
    };
    links.forEach(function (a) {
      a.addEventListener("pointerenter", function () { moveInd(a); });
      a.addEventListener("focus", function () { moveInd(a); });
    });
    navEl.addEventListener("pointerleave", function () { moveInd(current); });
    navEl.addEventListener("focusout", function (e) { if (!navEl.contains(e.relatedTarget)) moveInd(current); });
    var syncInd = function () { navEl.classList.toggle("has-ind", wide.matches); moveInd(current); };
    if (wide.addEventListener) wide.addEventListener("change", syncInd);
    window.addEventListener("resize", function () { moveInd(current); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveInd(current); });
    syncInd();
  }

  // Lesefortschritt als dünne Linie am oberen Rand
  var bar = document.createElement("div");
  bar.className = "fx-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  var ticking = false;
  function progress() {
    ticking = false;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ")";
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(progress); } }, { passive: true });
  progress();

  // Bewegtes Punktfeld in Hero bzw. Seitenkopf
  var host = document.querySelector(".hero, .page-head");
  if (!host) return;
  var canvas = document.createElement("canvas");
  if (!canvas.getContext) return;
  canvas.className = "fx-field";
  canvas.setAttribute("aria-hidden", "true");
  host.insertBefore(canvas, host.firstChild);
  host.classList.add("fx-has-field");
  var ctx = canvas.getContext("2d", { alpha: true });
  var W = 0, H = 0, GAP = 28, dpr = 1;
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
    GAP = small ? 26 : 30;
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
      g.addColorStop(0, "rgba(220,247,99," + (0.12 * pw).toFixed(3) + ")");
      g.addColorStop(1, "rgba(220,247,99,0)");
      ctx.fillStyle = g;
      ctx.fillRect(px - R * 1.5, py - R * 1.5, R * 3, R * 3);
    }
    // Welle nur je Spalte und Zeile berechnen (statt für jeden Punkt)
    for (i = 0; i < cols.length; i++) sx[i] = Math.sin(cols[i] * 0.011 + t * 0.0009);
    for (j = 0; j < rows.length; j++) cy[j] = Math.cos(rows[j] * 0.014 + t * 0.0007);
    var hotOn = false;
    ctx.fillStyle = "#f4f4f0";
    for (j = 0; j < rows.length; j++) {
      var y = rows[j], cj = cy[j], near = pw > 0.01 && Math.abs(y - py) < R;
      for (i = 0; i < cols.length; i++) {
        var x = cols[i], w = sx[i] * cj;
        var ox = w * 3, oy = ox, a = 0.06 + (w + 1) * 0.05, s = 1.6, hot = false;
        if (near) {
          var dx = x - px, dy = y - py, d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            var d = Math.sqrt(d2) || 1, f = (1 - d / R) * pw;
            ox += dx / d * f * 20; oy += dy / d * f * 20;
            a += f * 0.8; s += f * 2; hot = f > 0.12;
          }
        }
        // Punkte nahe am Zeiger leuchten in Lime
        if (hot !== hotOn) { hotOn = hot; ctx.fillStyle = hot ? "#dcf763" : "#f4f4f0"; }
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
