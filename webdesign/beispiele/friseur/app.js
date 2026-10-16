// Haarwerk Studio – Beispielseite. Navigation, Preis-Tabs, Haarschnitt-Animation,
// Vorher/Nachher-Regler, Online-Buchung (Attrappe) und Öffnungsstatus.
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var SVGNS = "http://www.w3.org/2000/svg";
  var DEMO_MSG = "Das ist ein Beispiel – auf der echten Seite käme Ihre Anfrage jetzt direkt beim Betrieb an.";

  /* ---------- Navigation ---------- */
  var bar = $(".tk-demo-bar"), nav = $("#nav"), burger = $("#burger"), panel = $("#panel");
  function setBar() { document.documentElement.style.setProperty("--bar", (bar ? bar.offsetHeight : 0) + "px"); }
  setBar(); window.addEventListener("resize", setBar);
  function onScroll() { nav.classList.toggle("is-solid", window.scrollY > 40); }
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  function menu(open) {
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    panel.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (open) { var f = panel.querySelector("a"); if (f) f.focus(); }
  }
  burger.addEventListener("click", function () { menu(burger.getAttribute("aria-expanded") !== "true"); });
  $$("a", panel).forEach(function (a) { a.addEventListener("click", function () { menu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("is-open")) { menu(false); burger.focus(); } });

  /* ---------- Preis-Tabs ---------- */
  var tabs = $$('[role="tab"]');
  function selectTab(t, focus) {
    tabs.forEach(function (b) {
      var on = b === t; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1;
      var p = document.getElementById(b.getAttribute("aria-controls")); p.hidden = !on;
    });
    if (focus) t.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(t); });
    t.addEventListener("keydown", function (e) {
      var n = null;
      if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") n = tabs[0];
      if (e.key === "End") n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });

  /* ---------- Haarschnitt-Animation (Canvas, feine Haarsträhnen mit Physik) ---------- */
  var cv = $("#hw-canvas");
  if (cv && cv.getContext) (function () {
    var stage = cv.parentNode, ctx = cv.getContext("2d"), svg = $("#hw-svg");
    var done = $("#hw-done"), sparks = $$(".spark", svg), steps = $$("#cut-steps li");
    var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    function rr(a, b) { return a + (b - a) * rnd(); }
    function cl(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
    function sm(a, b, x) { x = cl((x - a) / (b - a)); return x * x * (3 - 2 * x); }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function eio(t) { t = cl(t); return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function cutY(x) { return 368 - (x - 300) * 0.2; }

    /* --- Geometrie der Haarführung: Wurzel, Scheitelpunkt, Fallpunkt, Spitze --- */
    var KF = [
      [258, 258, 284, 250, 324, 298, 330, 512],
      [224, 182, 270, 166, 354, 268, 357, 526],
      [250, 147, 312, 128, 394, 230, 393, 536],
      [302, 135, 374, 139, 425, 240, 425, 532],
      [352, 140, 411, 170, 437, 270, 442, 520]];
    function kf(u, j) {
      var f = u * 4, i = Math.min(3, Math.floor(f)), t = f - i;
      var p0 = KF[Math.max(0, i - 1)][j], p1 = KF[i][j], p2 = KF[i + 1][j], p3 = KF[Math.min(4, i + 2)][j];
      return .5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
    }
    function cr(a, b, c, d, t) { return .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t); }

    var small = (stage.clientWidth || 600) < 480;
    var G = 40, P = 22, N = small ? 760 : 1400;
    var restL = new Float32Array(G * P * 2), restB = new Float32Array(G * P * 2),
      pos = new Float32Array(G * P * 2), prv = new Float32Array(G * P * 2), nrm = new Float32Array(G * P * 2),
      segL = new Float32Array(G * P), gBob = new Uint8Array(G), gCutS = new Float32Array(G), gCross = new Float32Array(G),
      combedY = new Float32Array(G), KS = new Float32Array(P);
    for (var k = 0; k < P; k++) KS[k] = lerp(.32, .028, Math.pow(k / (P - 1), .55));

    // Ruhelage jeder Leitsträhne: Catmull-Rom durch die Stützpunkte, gleichmäßig nach Bogenlänge abgetastet
    (function () {
      for (var g = 0; g < G; g++) {
        var u = g / (G - 1), pt = [];
        for (var j = 0; j < 8; j += 2) pt.push([kf(u, j), kf(u, j + 1)]);
        var R = pt[0], A = pt[1], D = pt[2], E = pt[3];
        E = [E[0] + rr(-3, 3), E[1] + rr(-9, 9)];
        var M = [lerp(D[0], E[0], .45) + 3, lerp(D[1], E[1], .45)];
        var C = [[2 * R[0] - A[0], 2 * R[1] - A[1]], R, A, D, M, E, [E[0], E[1] + 40]];
        var dense = [], s, q;
        for (s = 0; s < C.length - 3; s++) for (q = 0; q < 24; q++) {
          var t = q / 24; dense.push([cr(C[s][0], C[s + 1][0], C[s + 2][0], C[s + 3][0], t), cr(C[s][1], C[s + 1][1], C[s + 2][1], C[s + 3][1], t)]);
        }
        dense.push(E);
        var acc = [0]; for (q = 1; q < dense.length; q++) acc.push(acc[q - 1] + Math.hypot(dense[q][0] - dense[q - 1][0], dense[q][1] - dense[q - 1][1]));
        var L = acc[acc.length - 1], m = 0;
        for (k = 0; k < P; k++) {
          var want = L * k / (P - 1); while (m < acc.length - 2 && acc[m + 1] < want) m++;
          var f = (want - acc[m]) / ((acc[m + 1] - acc[m]) || 1), o = (g * P + k) * 2;
          restL[o] = lerp(dense[m][0], dense[m + 1][0], f); restL[o + 1] = lerp(dense[m][1], dense[m + 1][1], f);
        }
        for (k = 1; k < P; k++) { var o2 = (g * P + k) * 2; segL[g * P + k] = Math.hypot(restL[o2] - restL[o2 - 2], restL[o2 + 1] - restL[o2 - 1]); }
        // Schnittpunkt (Bob-Linie) der Leitsträhne
        gCutS[g] = .99; gCross[g] = restL[(g * P + P - 1) * 2];
        for (k = 1; k < P; k++) {
          var a = (g * P + k - 1) * 2, b = (g * P + k) * 2, ya = restL[a + 1] - cutY(restL[a]), yb = restL[b + 1] - cutY(restL[b]);
          if (restL[b + 1] > 290 && ya < 0 && yb >= 0) { var z = ya / (ya - yb); gCutS[g] = (k - 1 + z) / (P - 1); gCross[g] = lerp(restL[a], restL[b], z); break; }
        }
        // Bob-Pose: Spitzen federn hoch und drehen leicht nach innen
        for (k = 0; k < P; k++) {
          var o3 = (g * P + k) * 2, ff = sm(gCutS[g] - .2, gCutS[g], k / (P - 1));
          restB[o3] = restL[o3] - (4 + 9 * u) * ff * ff; restB[o3 + 1] = restL[o3 + 1] - 6 * ff;
        }
      }
    })();

    /* --- Einzelne feine Haare, interpoliert zwischen zwei Leitsträhnen --- */
    var PAL = ["#170b07", "#22120b", "#301a10", "#422416", "#57321f", "#70452b"];
    var BK = [];   // Bündel: gleiche Farbe/Stärke/Alpha werden gemeinsam gezeichnet
    function bucket(c, w, a) { BK.push({ c: c, w: w, a: a }); return BK.length - 1; }
    var bUnder = [], bMain = [], bTop = [], ci, wi;
    for (ci = 0; ci < 3; ci++) for (wi = 0; wi < 2; wi++) bUnder.push(bucket(ci, [1.0, 1.4][wi], .85));
    for (ci = 1; ci < 5; ci++) for (wi = 0; wi < 3; wi++) bMain.push(bucket(ci, [.55, .8, 1.1][wi], .72));
    for (ci = 3; ci < 6; ci++) bTop.push(bucket(ci, .45, .55));
    var sG = new Uint8Array(N), sW = new Float32Array(N), sB = new Uint8Array(N), sJit = new Float32Array(N), sAmp = new Float32Array(N),
      sFrq = new Float32Array(N), sPh = new Float32Array(N), sLen = new Float32Array(N), sClump = new Float32Array(N), sShine = new Uint8Array(N),
      sCut = new Uint8Array(N), sCutS = new Float32Array(N), sCross = new Float32Array(N), sCol = new Uint8Array(N);
    var tmp = new Float32Array(P * 2 + 4), pts = new Float32Array(P * 2 + 4);
    for (var i = 0; i < N; i++) {
      var u = (i + rnd()) / N * (G - 1.001), g = Math.floor(u), r = rnd(), b;
      sG[i] = g; sW[i] = u - g;
      if (r < .34) b = bUnder[Math.floor(rnd() * bUnder.length)]; else if (r < .9) b = bMain[Math.floor(rnd() * bMain.length)]; else b = bTop[Math.floor(rnd() * bTop.length)];
      sB[i] = b; sCol[i] = BK[b].c;
      sJit[i] = rr(-2.2, 2.2); sFrq[i] = rr(1.2, 3.2); sPh[i] = rr(0, 6.283); sClump[i] = rr(.35, .8);
      sAmp[i] = rr(1.6, 5.2); if (r >= .9 && rnd() < .4) { sAmp[i] = rr(6, 11); sFrq[i] = rr(.8, 1.8); }
      sLen[i] = rr(.86, 1); sShine[i] = rnd() < .5 ? 1 : 0;
    }
    function strandPts(i, out, upto) {
      var g = sG[i], w = sW[i], tg = w < .5 ? 0 : 1, a = g * P * 2, b2 = a + P * 2, cy = combedY[g];
      for (var k = 0; k <= upto; k++) {
        var s = k / (P - 1), ww = w + (tg - w) * sm(.45, 1, s) * sClump[i], o = k * 2;
        var x = pos[a + o] * (1 - ww) + pos[b2 + o] * ww, y = pos[a + o + 1] * (1 - ww) + pos[b2 + o + 1] * ww;
        var cf = 1 - sm(cy - 28, cy, y);   // 1 = schon gekämmt
        var off = sJit[i] * (1 - .55 * cf) * Math.min(1, s * 6) + sAmp[i] * sm(.12, .5, s) * (1 - .82 * cf) * Math.sin(sFrq[i] * s * 6.283 + sPh[i]);
        out[o] = x + nrm[a + o] * off; out[o + 1] = y + nrm[a + o + 1] * off;
      }
    }
    // Schnittposition jedes Haares aus der Ruhelage
    pos.set(restL); computeNormals(); combedY.fill(-1);
    for (i = 0; i < N; i++) {
      strandPts(i, tmp, P - 1); sCutS[i] = .99; sCross[i] = tmp[(P - 1) * 2];
      for (k = 1; k < P; k++) {
        var ya = tmp[k * 2 - 1] - cutY(tmp[k * 2 - 2]), yb = tmp[k * 2 + 1] - cutY(tmp[k * 2]);
        if (tmp[k * 2 + 1] > 290 && ya < 0 && yb >= 0) { var z = ya / (ya - yb); sCutS[i] = (k - 1 + z) / (P - 1) + rr(-.004, .004); sCross[i] = lerp(tmp[k * 2 - 2], tmp[k * 2], z); break; }
      }
    }
    function computeNormals() {
      for (var g = 0; g < G; g++) for (var k = 0; k < P; k++) {
        var o = (g * P + k) * 2, a = k > 0 ? o - 2 : o, b = k < P - 1 ? o + 2 : o;
        var tx = pos[b] - pos[a], ty = pos[b + 1] - pos[a + 1], l = Math.hypot(tx, ty) || 1;
        nrm[o] = -ty / l; nrm[o + 1] = tx / l;
      }
    }

    /* --- Physik: Verlet, Feder zur Ruhelage, Längen-Constraint, leiser Luftzug, Kamm --- */
    var tSim = 0, comb = null;
    function step() {
      tSim += 1 / 60;
      for (var g = 0; g < G; g++) {
        var rest = gBob[g] ? restB : restL, base = g * P * 2;
        pos[base] = rest[base]; pos[base + 1] = rest[base + 1];
        for (var k = 1; k < P; k++) {
          var o = base + k * 2, s = k / (P - 1), x = pos[o], y = pos[o + 1];
          var vx = (x - prv[o]) * .955, vy = (y - prv[o + 1]) * .955;
          prv[o] = x; prv[o + 1] = y;
          var kk = KS[k], wind = (Math.sin(tSim * .9 + g * .21) * .5 + Math.sin(tSim * 2.3 + g * .5 + k * .3) * .25 + Math.sin(tSim * .37) * .45) * .05 * Math.pow(s, 1.6);
          x += vx + (rest[o] - x) * kk + wind; y += vy + (rest[o + 1] - y) * kk + .008;
          if (comb && x > comb.x - 84 && x < comb.x + 84 && y > comb.y - 24 && y < comb.y + 4) {
            var gc = comb.x - 84 + (Math.floor((x - comb.x + 84) / 7.5) + .5) * 7.5;
            x += (gc - x) * .2; y += 1.3 * (1 - (comb.y - y) / 24);
            if (comb.y > combedY[g]) combedY[g] = comb.y;
          }
          pos[o] = x; pos[o + 1] = y;
        }
        for (k = 1; k < P; k++) {
          var o4 = base + k * 2, dx = pos[o4] - pos[o4 - 2], dy = pos[o4 + 1] - pos[o4 - 1], d = Math.hypot(dx, dy), L = segL[g * P + k];
          if (d > L) { pos[o4] = pos[o4 - 2] + dx * L / d; pos[o4 + 1] = pos[o4 - 1] + dy * L / d; }
        }
      }
    }

    /* --- Fallende Strähnen und kleine Schnipsel --- */
    var locks = [], clips = [], LOCKC = ["#28140c", "#43251a", "#6a3f27"];
    var CAPE = [[60, 640], [100, 534], [150, 474], [240, 436], [270, 416], [300, 426], [340, 426], [366, 414], [410, 436], [462, 454], [530, 486], [570, 640]];
    function capeTop(x) {
      for (var j = 1; j < CAPE.length; j++) if (x <= CAPE[j][0]) { var a = CAPE[j - 1], b = CAPE[j]; return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); }
      return 640;
    }
    function ptAt(arr, s) { var f = s * (P - 1), k = Math.min(P - 2, Math.floor(f)), t = f - k; return [lerp(arr[k * 2], arr[k * 2 + 2], t), lerp(arr[k * 2 + 1], arr[k * 2 + 3], t)]; }
    function makeLock(list) {
      var body = [new Path2D(), new Path2D(), new Path2D()], tips = [new Path2D(), new Path2D(), new Path2D()], ox = 0, oy = 0;
      list.forEach(function (i, n) {
        strandPts(i, tmp, P - 1);
        var c = ptAt(tmp, sCutS[i]), e = ptAt(tmp, sLen[i]), line = [c], k0 = Math.floor(sCutS[i] * (P - 1)) + 1, k1 = Math.ceil(sLen[i] * (P - 1)) - 1;
        if (!n) { ox = c[0]; oy = c[1]; }
        for (var k = k0; k <= k1; k++) line.push([tmp[k * 2], tmp[k * 2 + 1]]);
        line.push(e);
        var bin = sCol[i] < 2 ? 0 : sCol[i] < 4 ? 1 : 2, split = Math.max(1, Math.floor(line.length * .7)), p = body[bin];
        p.moveTo(line[0][0] - ox, line[0][1] - oy);
        for (k = 1; k < line.length; k++) {
          if (k === split) { p.lineTo(line[k][0] - ox, line[k][1] - oy); p = tips[bin]; p.moveTo(line[k][0] - ox, line[k][1] - oy); }
          else p.lineTo(line[k][0] - ox, line[k][1] - oy);
        }
      });
      locks.push({ x: ox, y: oy, vx: rr(-14, 34), vy: rr(0, 40), a: 0, va: rr(-.7, .7), age: 0, body: body, tips: tips, sx: 1 });
    }
    function spawnClips(x0, x1) {
      for (var j = 0; j < 16; j++) {
        var x = rr(x0, x1);
        clips.push({ x: x, y: cutY(x) + rr(-2, 6), vx: rr(-70, 60), vy: rr(-90, -10), a: rr(0, 6.28), va: rr(-9, 9), l: rr(2, 5.5), c: rnd() < .7 ? 0 : 1, rest: false });
      }
    }
    function snip(n, last) {
      var lim = last ? -1e4 : xp(n) - 62, groups = {}, g, i;
      for (g = 0; g < G; g++) if (!gBob[g] && gCross[g] >= lim) {
        gBob[g] = 1;
        for (var k = 0; k < P; k++) { var o = (g * P + k) * 2; prv[o + 1] += 2.4 * sm(gCutS[g] - .25, gCutS[g], k / (P - 1)); }
      }
      for (i = 0; i < N; i++) if (!sCut[i] && sCross[i] >= lim) { (groups[sG[i]] = groups[sG[i]] || []).push(i); }
      for (g in groups) makeLock(groups[g]);
      for (g in groups) groups[g].forEach(function (i) { sCut[i] = 1; });
      spawnClips(Math.max(325, lim), Math.min(445, xp(n) - 8));
    }

    /* --- Zeitplan --- */
    var T = { c0: 500, cDur: 1300, cGap: 150, sIn: 3400, cut0: 3900, per: 430, n: 9 };
    T.cut1 = T.cut0 + T.per * T.n; T.end = T.cut1 + 650; T.sh0 = T.cut1 + 380; T.shD = 1500; T.badge = T.cut1 + 600;
    function xp(n) { return 505 - n * 16.8; }

    /* --- Canvas-Größe, Grundebene (Umhang, Hals, Gesicht) --- */
    var base = document.createElement("canvas"), bctx = base.getContext("2d"), dpr = 1, SC = 1, CS = 1;
    var HEAD = new Path2D("M302 142 C258 142 222 166 213 204 C209 220 210 228 206 236 C203 243 197 252 191 261 C186 268 181 275 180 280 C179 285 183 289 190 289 C195 289 198 291 199 294 C200 297 196 300 196 304 C196 308 200 309 200 312 C200 316 197 319 199 323 C201 327 206 329 207 333 C208 340 206 347 214 352 C226 360 252 358 268 351 C270 378 272 404 270 448 L368 448 C358 414 354 384 358 356 C392 330 410 296 406 248 C400 182 356 142 302 142 Z");
    var EAR = new Path2D("M297 267 C306 261 318 266 319 280 C320 292 314 298 310 306 C307 312 303 316 297 314 C292 312 291 306 294 301 C289 292 289 275 297 267 Z");
    var CAPEP = new Path2D("M60 640 C74 540 138 464 236 438 C254 433 266 426 270 416 C296 430 342 430 366 414 C376 426 412 438 462 456 C532 484 562 560 572 640 Z");
    function rad(c, x, y, r, stops) { var gr = c.createRadialGradient(x, y, 0, x, y, r); stops.forEach(function (s) { gr.addColorStop(s[0], s[1]); }); return gr; }
    function lin(c, x0, y0, x1, y1, stops) { var gr = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(function (s) { gr.addColorStop(s[0], s[1]); }); return gr; }
    function drawBase() {
      var c = bctx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, base.width, base.height); c.setTransform(SC, 0, 0, SC, 0, 0);
      c.lineCap = "round"; c.lineJoin = "round";
      // weicher Schatten hinter Kopf und Schultern
      c.fillStyle = rad(c, 340, 330, 250, [[0, "rgba(0,0,0,.28)"], [1, "rgba(0,0,0,0)"]]); c.fillRect(0, 0, 600, 640);
      // Hals + Kopf
      c.fillStyle = lin(c, 190, 170, 340, 430, [[0, "#f4d8ca"], [.45, "#e6b8a3"], [1, "#c88d77"]]); c.fill(HEAD);
      c.save(); c.clip(HEAD);
      c.fillStyle = rad(c, 222, 206, 34, [[0, "rgba(255,243,236,.32)"], [1, "rgba(255,243,236,0)"]]); c.fillRect(150, 150, 150, 120);
      c.fillStyle = rad(c, 228, 272, 20, [[0, "rgba(255,238,228,.28)"], [1, "rgba(255,238,228,0)"]]); c.fillRect(190, 240, 80, 70);
      c.fillStyle = rad(c, 194, 262, 9, [[0, "rgba(255,245,238,.4)"], [1, "rgba(255,245,238,0)"]]); c.fillRect(180, 250, 30, 30);
      c.fillStyle = rad(c, 238, 298, 26, [[0, "rgba(224,126,110,.32)"], [1, "rgba(224,126,110,0)"]]); c.fillRect(200, 260, 80, 80);
      c.fillStyle = rad(c, 226, 246, 13, [[0, "rgba(150,88,72,.22)"], [1, "rgba(150,88,72,0)"]]); c.fillRect(205, 228, 45, 40);
      c.fillStyle = rad(c, 266, 230, 46, [[0, "rgba(90,50,38,.32)"], [1, "rgba(90,50,38,0)"]]); c.fillRect(210, 170, 120, 120);
      var jaw = new Path2D("M214 352 C240 350 268 340 296 314 L340 320 L340 410 L262 410 Z");
      c.fillStyle = lin(c, 0, 330, 0, 400, [[0, "rgba(118,62,46,.5)"], [1, "rgba(118,62,46,0)"]]); c.fill(jaw);
      c.fillStyle = rad(c, 352, 352, 70, [[0, "rgba(70,34,24,.55)"], [1, "rgba(70,34,24,0)"]]); c.fillRect(280, 280, 140, 170);
      c.restore();
      c.strokeStyle = "rgba(255,222,204,.28)"; c.lineWidth = .9; c.stroke(HEAD);
      // Lippen
      var lips = new Path2D("M199 295 C200 298 196 301 196 304 C196 308 200 309 200 312 C200 316 197 319 199 323 C202 322 205 318 205 312 C205 304 204 298 199 295 Z");
      c.fillStyle = lin(c, 196, 295, 207, 323, [[0, "rgba(198,122,112,.6)"], [1, "rgba(172,96,90,.6)"]]); c.fill(lips);
      c.strokeStyle = "rgba(128,64,58,.75)"; c.lineWidth = .9; c.beginPath(); c.moveTo(200, 312); c.quadraticCurveTo(203, 312.5, 206, 311.4); c.stroke();
      c.fillStyle = "rgba(255,236,230,.35)"; c.beginPath(); c.ellipse(199.6, 317, 1.1, 2, .2, 0, 6.283); c.fill();
      // Nasenflügel
      c.strokeStyle = "rgba(146,84,68,.55)"; c.lineWidth = 1; c.beginPath(); c.moveTo(189.5, 284.5); c.quadraticCurveTo(194, 287.5, 198, 285); c.stroke();
      // Auge (geschlossen, ruhig), Lidfalte, Wimpern, Braue
      c.strokeStyle = "rgba(150,92,76,.45)"; c.lineWidth = .8; c.beginPath(); c.moveTo(216, 243.5); c.quadraticCurveTo(224, 239.5, 232.5, 243.5); c.stroke();
      c.strokeStyle = "#4a2b21"; c.lineWidth = 1.3; c.beginPath(); c.moveTo(214.5, 248); c.quadraticCurveTo(223, 254, 233, 249); c.stroke();
      c.lineWidth = .7; c.strokeStyle = "rgba(48,26,20,.9)"; c.beginPath();
      for (var j = 0; j < 9; j++) {
        var t = .12 + j * .1, lx = (1 - t) * (1 - t) * 214.5 + 2 * (1 - t) * t * 223 + t * t * 233, ly = (1 - t) * (1 - t) * 248 + 2 * (1 - t) * t * 254 + t * t * 249;
        c.moveTo(lx, ly); c.quadraticCurveTo(lx - 1.6, ly + 2.8, lx - 3.6 - j * .15, ly + 3.8 + Math.sin(j) * .3);
      }
      c.stroke();
      c.strokeStyle = "rgba(74,42,32,.62)"; c.lineWidth = .8; c.beginPath();
      for (j = 0; j < 22; j++) { var f = j / 21, bx = lerp(207, 240, f), by = 233.5 - 4.2 * Math.sin(Math.PI * Math.min(1, f * 1.15)) + f * 1.2; c.moveTo(bx, by + 1); c.lineTo(bx + 3.6, by - .8 + (j % 3) * .25); }
      c.stroke();
      // feine Babyhaare am Haaransatz
      c.lineWidth = .45 / CS; c.strokeStyle = "rgba(52,28,18,.42)"; c.beginPath();
      var sd = seed; seed = 4242;
      for (var g = 0; g < G * .5; g++) for (var m = 0; m < 4; m++) {
        var o = g * P * 2, rx = restL[o], ry = restL[o + 1], tx = restL[o + 2] - rx, ty = restL[o + 3] - ry, tl2 = Math.hypot(tx, ty); tx /= tl2; ty /= tl2;
        var st0 = rr(.5, 3), ln = rr(3.5, 7.5), cu = rr(-1.5, 1.5), sx = rx - tx * st0 + rr(-1.5, 1.5), sy = ry - ty * st0 + rr(-1.5, 1.5);
        c.moveTo(sx, sy); c.quadraticCurveTo(sx + tx * ln * .5 - ty * cu, sy + ty * ln * .5 + tx * cu, sx + tx * ln, sy + ty * ln);
      }
      seed = sd; c.stroke();
      // Ohr
      c.fillStyle = lin(c, 290, 265, 318, 315, [[0, "#ecc1ad"], [1, "#c98a74"]]); c.fill(EAR);
      c.strokeStyle = "rgba(150,82,66,.55)"; c.lineWidth = 1.1; c.beginPath(); c.moveTo(300, 274); c.bezierCurveTo(309, 271, 313, 281, 311, 290); c.bezierCurveTo(309, 297, 305, 300, 303, 306); c.stroke();
      c.lineWidth = .9; c.beginPath(); c.moveTo(300, 285); c.bezierCurveTo(305, 284, 306, 291, 302, 294); c.stroke();
      // Umhang mit Satinglanz und Falten
      c.fillStyle = lin(c, 0, 414, 0, 640, [[0, "#3b2e31"], [1, "#171213"]]); c.fill(CAPEP);
      c.save(); c.clip(CAPEP);
      c.fillStyle = rad(c, 200, 520, 150, [[0, "rgba(255,232,224,.13)"], [1, "rgba(255,232,224,0)"]]); c.fillRect(40, 430, 320, 210);
      c.fillStyle = rad(c, 480, 540, 110, [[0, "rgba(255,232,224,.07)"], [1, "rgba(255,232,224,0)"]]); c.fillRect(360, 430, 240, 210);
      [["M300 430 C294 500 282 570 276 650", 14], ["M346 426 C352 500 360 580 372 650", 10], ["M236 442 C214 500 196 570 190 650", 12], ["M430 446 C460 510 480 580 488 650", 12]].forEach(function (fd) {
        var p = new Path2D(fd[0]);
        c.strokeStyle = "rgba(0,0,0,.22)"; c.lineWidth = fd[1]; c.stroke(p);
        c.save(); c.translate(fd[1] * .55, 0); c.strokeStyle = "rgba(255,236,228,.05)"; c.lineWidth = fd[1] * .6; c.stroke(p); c.restore();
      });
      c.restore();
      c.strokeStyle = "rgba(232,180,166,.6)"; c.lineWidth = 2.2; c.beginPath(); c.moveTo(270, 417); c.bezierCurveTo(296, 431, 342, 431, 366, 415); c.stroke();
      c.strokeStyle = "rgba(255,240,234,.12)"; c.lineWidth = 1; c.stroke(CAPEP);
    }
    function resize() {
      var w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2); CS = w / 600; SC = CS * dpr;
      cv.width = base.width = hcv.width = mask.width = Math.round(w * dpr); cv.height = base.height = hcv.height = mask.height = Math.round(h * dpr);
      drawBase(); drawMask(); render();
    }

    /* --- Zeichnen --- */
    var shineP = -9, hcv = document.createElement("canvas"), hctx = hcv.getContext("2d"), mask = document.createElement("canvas"), mctx = mask.getContext("2d");
    // Glanzmaske: weiches Lichtband über dem Oberkopf + leiser Glanz in den Längen
    function drawMask() {
      var c = mctx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, mask.width, mask.height); c.setTransform(SC, 0, 0, SC, 0, 0);
      c.save(); c.translate(304, 240); c.scale(120, 122);
      c.fillStyle = rad(c, 0, 0, 1, [[0, "rgba(255,255,255,0)"], [.6, "rgba(255,255,255,0)"], [.8, "rgba(255,255,255,1)"], [.9, "rgba(255,255,255,.55)"], [1.0, "rgba(255,255,255,0)"]]);
      c.fillRect(-1.2, -1.2, 2.4, 2.4); c.restore();
      c.globalCompositeOperation = "destination-in";
      var dx = Math.cos(-2.0), dy = Math.sin(-2.0);
      c.fillStyle = lin(c, 304 + dx * 30, 240 + dy * 30, 304 + dx * 115, 240 + dy * 115, [[0, "rgba(255,255,255,0)"], [.6, "rgba(255,255,255,.9)"], [1, "rgba(255,255,255,1)"]]);
      c.fillRect(0, 0, 600, 640);
      c.globalCompositeOperation = "source-over";
      c.fillStyle = lin(c, 0, 402, 0, 470, [[0, "rgba(255,255,255,0)"], [.45, "rgba(255,255,255,.3)"], [1, "rgba(255,255,255,0)"]]);
      c.fillRect(300, 395, 170, 80);
    }
    function addSec(p, a, b) {
      p.moveTo(pts[a * 2], pts[a * 2 + 1]);
      for (var m = a + 1; m < b; m++) p.quadraticCurveTo(pts[m * 2], pts[m * 2 + 1], (pts[m * 2] + pts[m * 2 + 2]) / 2, (pts[m * 2 + 1] + pts[m * 2 + 3]) / 2);
      p.lineTo(pts[b * 2], pts[b * 2 + 1]);
    }
    function gAt(g, s) { var f = s * (P - 1), k = Math.min(P - 2, Math.floor(f)), t = f - k, o = (g * P + k) * 2; return [lerp(pos[o], pos[o + 2], t), lerp(pos[o + 1], pos[o + 3], t)]; }
    function drawHair() {
      // dunkle Unterlage (Tiefe, keine Lücken)
      var p = new Path2D(), g, q, s0 = .02;
      function vis(g) { return gBob[g] ? gCutS[g] - .06 : .84; }
      for (var j = 0; j <= 10; j++) { q = gAt(1, lerp(s0, vis(1), j / 10)); j ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1]); }
      for (g = 2; g < G - 1; g++) { q = gAt(g, vis(g)); p.lineTo(q[0], q[1]); }
      for (j = 10; j >= 0; j--) { q = gAt(G - 2, lerp(s0, vis(G - 2), j / 10)); p.lineTo(q[0], q[1]); }
      for (g = G - 3; g > 1; g--) { q = gAt(g, s0); p.lineTo(q[0], q[1]); }
      p.closePath();
      ctx.fillStyle = lin(ctx, 0, 140, 0, 520, [[0, "rgba(40,21,13,.96)"], [.5, "rgba(30,15,9,.96)"], [1, "rgba(22,11,7,.94)"]]); ctx.fill(p);
      // feine Haare, gebündelt nach Farbe/Stärke
      var body = [], tipA = [], tipB = [], shp = new Path2D(), b;
      for (b = 0; b < BK.length; b++) { body.push(new Path2D()); tipA.push(new Path2D()); tipB.push(new Path2D()); }
      for (var i = 0; i < N; i++) {
        var end = sCut[i] ? sCutS[i] : sLen[i], fe = end * (P - 1), ke = Math.min(P - 2, Math.floor(fe)), fr = fe - ke;
        strandPts(i, tmp, ke + 1);
        var n = 0;
        for (var k = 0; k <= ke; k++) { pts[n * 2] = tmp[k * 2]; pts[n * 2 + 1] = tmp[k * 2 + 1]; n++; }
        if (fr > .02) { pts[n * 2] = lerp(tmp[ke * 2], tmp[ke * 2 + 2], fr); pts[n * 2 + 1] = lerp(tmp[ke * 2 + 1], tmp[ke * 2 + 3], fr); n++; }
        var last = n - 1, bb = sB[i];
        if (last < 3) continue;
        addSec(body[bb], 0, 1);
        if (sCut[i]) { addSec(body[bb], 1, last - 1); addSec(tipA[bb], last - 1, last); }
        else { var t1 = Math.max(2, last - 4); addSec(body[bb], 1, t1); addSec(tipA[bb], t1, Math.max(t1 + 1, last - 2)); if (last - 2 > t1) addSec(tipB[bb], last - 2, last); }
        if (sShine[i]) addSec(shp, 1, last - 1);
      }
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (b = 0; b < BK.length; b++) {
        var bk = BK[b]; ctx.strokeStyle = PAL[bk.c];
        ctx.globalAlpha = bk.a; ctx.lineWidth = bk.w / CS; ctx.stroke(body[b]);
        ctx.globalAlpha = bk.a * .5; ctx.lineWidth = bk.w * .75 / CS; ctx.stroke(tipA[b]);
        ctx.globalAlpha = bk.a * .22; ctx.lineWidth = bk.w * .55 / CS; ctx.stroke(tipB[b]);
      }
      ctx.globalAlpha = 1;
      // Glanz: Haare in hellem Ton auf eigene Ebene, mit Lichtmaske ausgestanzt
      hctx.setTransform(1, 0, 0, 1, 0, 0); hctx.globalCompositeOperation = "source-over"; hctx.clearRect(0, 0, hcv.width, hcv.height);
      hctx.setTransform(SC, 0, 0, SC, 0, 0); hctx.lineCap = "round"; hctx.strokeStyle = "rgba(238,196,148,.95)"; hctx.lineWidth = .7 / CS; hctx.stroke(shp);
      hctx.setTransform(1, 0, 0, 1, 0, 0); hctx.globalCompositeOperation = "destination-in"; hctx.drawImage(mask, 0, 0);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = .8; ctx.drawImage(hcv, 0, 0); ctx.restore();
      if (shineP > -1) {
        var dx = .8 * 260, dy = .6 * 260, ox = 250 + shineP * dx, oy = 140 + shineP * dy;
        ctx.strokeStyle = lin(ctx, ox - 40, oy - 30, ox + 40, oy + 30, [[0, "rgba(255,226,190,0)"], [.5, "rgba(255,230,196,.38)"], [1, "rgba(255,226,190,0)"]]);
        ctx.lineWidth = .75 / CS; ctx.stroke(shp);
      }
    }
    function drawLocks() {
      locks.forEach(function (L) {
        var al = 1 - sm(.35, 1.15, L.age); if (al <= 0) return;
        ctx.save(); ctx.translate(L.x, L.y); ctx.rotate(L.a); ctx.scale(L.sx, 1);
        for (var c = 0; c < 3; c++) {
          ctx.strokeStyle = LOCKC[c];
          ctx.globalAlpha = .85 * al; ctx.lineWidth = .85 / CS; ctx.stroke(L.body[c]);
          ctx.globalAlpha = .35 * al; ctx.lineWidth = .6 / CS; ctx.stroke(L.tips[c]);
        }
        ctx.restore();
      });
      ctx.globalAlpha = 1;
      if (clips.length) {
        var pa = [new Path2D(), new Path2D()];
        clips.forEach(function (c) { var dx = Math.cos(c.a) * c.l / 2, dy = Math.sin(c.a) * c.l / 2; pa[c.c].moveTo(c.x - dx, c.y - dy); pa[c.c].lineTo(c.x + dx, c.y + dy); });
        ctx.lineWidth = .8 / CS; ctx.strokeStyle = "rgba(48,26,16,.95)"; ctx.stroke(pa[0]); ctx.strokeStyle = "rgba(140,92,60,.9)"; ctx.stroke(pa[1]);
      }
    }
    function drawComb(x, y, rot, al) {
      ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y); ctx.rotate(rot);
      ctx.fillStyle = "rgba(0,0,0,.28)"; rr2(-81, 6, 168, 9, 3.5); ctx.fill();
      var t = new Path2D(), xx;
      for (xx = -80; xx <= 8; xx += 3.1) { t.moveTo(xx, 1); t.lineTo(xx, -19); }
      for (xx = 12.5; xx <= 80; xx += 5.4) { t.moveTo(xx, 1); t.lineTo(xx, -22); }
      ctx.lineCap = "round"; ctx.lineWidth = 1.15; ctx.strokeStyle = lin(ctx, 0, -22, 0, 0, [[0, "rgba(214,202,190,.85)"], [1, "#f1e9e1"]]); ctx.stroke(t);
      rr2(-84, 0, 168, 9, 3.5); ctx.fillStyle = lin(ctx, 0, 0, 0, 9, [[0, "#faf5ef"], [.55, "#e4d9cf"], [1, "#b9ab9f"]]); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(-81, 1.2); ctx.lineTo(81, 1.2); ctx.stroke();
      ctx.restore();
    }
    function rr2(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
    var BLADE = new Path2D("M12 .9 C-14 .6 -52 .5 -89 .1 C-62 -2.2 -26 -5.6 3 -6 C8 -6 11.5 -4.4 12.5 -2 Z"),
      EDGE = new Path2D("M10 .8 C-14 .6 -52 .5 -88 .15"),
      SHANK = new Path2D("M5 1.5 C16 2 24 7 32 14.5"),
      TANG = new Path2D("M37 31 C39 38 45 44 55 46.5");
    function piece(sg, a, hp, shadow) {
      ctx.save(); ctx.rotate(a); ctx.scale(1, sg);
      if (shadow) { ctx.fillStyle = ctx.strokeStyle = "#000"; }
      ctx.lineCap = "round";
      ctx.lineWidth = 4.6; if (!shadow) ctx.strokeStyle = lin(ctx, 0, 0, 0, 34, [[0, "#f2f4f6"], [.5, "#9aa1a8"], [1, "#d9dde1"]]); ctx.stroke(SHANK);
      ctx.save(); ctx.translate(45, 23); ctx.rotate(.45); ctx.beginPath(); ctx.ellipse(0, 0, 12.5, 9.5, 0, 0, 6.283);
      ctx.lineWidth = 3.4; if (!shadow) ctx.strokeStyle = lin(ctx, -12, -10, 12, 10, [[0, "#ffffff"], [.4, "#a9afb5"], [.7, "#eef0f2"], [1, "#6c7279"]]); ctx.stroke(); ctx.restore();
      if (sg > 0) { ctx.lineWidth = 2.3; ctx.stroke(TANG); }
      if (!shadow) ctx.fillStyle = lin(ctx, 0, -6.2, 0, 1.2, [[0, "#5d636a"], [.28, "#e9edf0"], [.55, "#aab1b8"], [.82, "#f8fafb"], [1, "#7a8088"]]);
      ctx.fill(BLADE);
      if (!shadow) {
        var h0 = cl(hp - .1), h1 = cl(hp + .1);
        ctx.fillStyle = lin(ctx, -89, 0, 12, 0, [[0, "rgba(255,255,255,0)"], [h0, "rgba(255,255,255,0)"], [cl(hp), "rgba(255,255,255,.85)"], [h1, "rgba(255,255,255,0)"], [1, "rgba(255,255,255,0)"]]);
        ctx.fill(BLADE);
        ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = .45; ctx.stroke(EDGE);
        ctx.strokeStyle = "rgba(40,44,50,.55)"; ctx.lineWidth = .5; ctx.stroke(BLADE);
      }
      ctx.restore();
    }
    function drawScissors(x, y, rot, ang, al, hp) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      ctx.save(); ctx.translate(5, 8); ctx.globalAlpha = al * .26; piece(-1, -ang / 2, 0, true); piece(1, ang / 2, 0, true); ctx.restore();
      ctx.globalAlpha = al; piece(-1, -ang / 2, hp, false); piece(1, ang / 2, 1 - hp, false);
      ctx.beginPath(); ctx.arc(0, 0, 3.9, 0, 6.283); ctx.fillStyle = rad(ctx, -1.2, -1.2, 5, [[0, "#ffffff"], [.5, "#b8bec4"], [1, "#4f555c"]]); ctx.fill();
      ctx.strokeStyle = "rgba(30,34,38,.7)"; ctx.lineWidth = .6; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-2.3, 1.2); ctx.lineTo(2.3, -1.2); ctx.lineWidth = .9; ctx.stroke();
      ctx.restore();
    }

    var tl = -1, st = { comb: null, sc: null };
    function timeline() {
      var t = tl; st.comb = null; st.sc = null; comb = null; shineP = -9;
      if (t < 0) return;
      for (var p = 0; p < 2; p++) {
        var c = (t - T.c0 - p * (T.cDur + T.cGap)) / T.cDur;
        if (c > 0 && c < 1) {
          var e = eio(c), al = sm(0, .12, c) * (1 - sm(.85, 1, c));
          st.comb = { x: 386 + p * 8 + Math.sin(c * 3) * 3, y: lerp(318, 552, e), r: -.05 + .03 * Math.sin(c * 4), a: al };
          if (al > .3) comb = { x: st.comb.x, y: st.comb.y };
        }
      }
      var x, y, rot = -.197, ang, a = 1;
      if (t >= T.sIn && t < T.cut0) {
        var q = eio((t - T.sIn) / (T.cut0 - T.sIn)); x = lerp(610, xp(-1), q); y = cutY(x) - 50 * (1 - q); ang = .46; a = sm(0, .5, q);
      } else if (t >= T.cut0 && t < T.cut1) {
        var f = (t - T.cut0) / T.per, n = Math.floor(f), cc = f - n;
        x = lerp(xp(n - 1), xp(n), eio(cc / .55)); y = cutY(x);
        ang = cc < .55 ? lerp(.06, .5, eio(cc / .35)) : cc < .78 ? lerp(.5, .03, eio((cc - .55) / .23)) : .03;
      } else if (t >= T.cut1 && t < T.end) {
        var e2 = eio((t - T.cut1) / (T.end - T.cut1)); x = xp(T.n - 1) + 110 * e2; y = cutY(xp(T.n - 1)) - 90 * e2; rot -= .35 * e2; ang = .03 + .3 * e2; a = 1 - e2;
      }
      if (x !== undefined) st.sc = { x: x, y: y + Math.sin(t * .006) * .6, r: rot + Math.sin(t * .004) * .01, ang: ang, a: a, hp: .5 + .42 * Math.sin(t * .0021) };
      if (t > T.sh0 && t < T.sh0 + T.shD) shineP = (t - T.sh0) / T.shD * 1.5 - .25;
    }
    function render() {
      if (!cv.width) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.drawImage(base, 0, 0);
      ctx.setTransform(SC, 0, 0, SC, 0, 0);
      computeNormals(); drawHair(); drawLocks();
      if (st.comb) drawComb(st.comb.x, st.comb.y, st.comb.r, st.comb.a);
      if (st.sc) drawScissors(st.sc.x, st.sc.y, st.sc.r, st.sc.ang, st.sc.a, st.sc.hp);
    }
    function setStep(n) { steps.forEach(function (li, i) { li.classList.toggle("is-on", i === n); }); }

    var raf = 0, last = 0, acc = 0, visible = false, played = false, lastSnip = -1, badged = false;
    function physics(dt) {
      locks.forEach(function (L) {
        L.age += dt; L.vy += 1100 * dt; L.vx -= L.vx * 1.6 * dt; L.vy -= L.vy * 1.7 * dt; L.va -= L.va * .8 * dt;
        L.x += L.vx * dt; L.y += L.vy * dt; L.a += L.va * dt; L.sx = 1 + Math.min(.25, L.age * .3);
      });
      locks = locks.filter(function (L) { return L.age < 1.2 && L.y < 800; });
      clips = clips.filter(function (c) { return !c.dead; });
      clips.forEach(function (c) {
        if (c.rest) return;
        c.vy += 700 * dt; c.vx -= c.vx * 2.2 * dt; c.vy -= c.vy * 1.4 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.a += c.va * dt;
        var ct = capeTop(c.x) + 2;
        if (c.y >= ct) { if (c.x > 262 && c.x < 372) c.dead = true; else { c.y = ct + rnd() * 4; c.rest = true; } }
      });
    }
    function frame(now) {
      raf = 0;
      var dms = Math.min(50, now - last); last = now;
      if (tl >= 0) tl += dms;
      timeline();
      if (tl >= 0) {
        setStep(tl < T.cut0 - 300 ? 0 : tl < T.cut1 ? 1 : 2);
        var due = Math.min(T.n - 1, Math.floor((tl - T.cut0 - .78 * T.per) / T.per));
        while (lastSnip < due) { lastSnip++; snip(lastSnip, lastSnip === T.n - 1); }
        if (tl > T.badge && !badged) { badged = true; done.classList.add("on"); sparks.forEach(function (s, i) { setTimeout(function () { s.classList.add("on"); }, i * 180); }); }
      }
      acc += dms / 1000; var n = 0;
      while (acc >= 1 / 60 && n < 4) { step(); acc -= 1 / 60; n++; }
      if (n === 4) acc = 0;
      physics(dms / 1000);
      render();
      if (visible) raf = requestAnimationFrame(frame);
    }
    function loop() { if (!raf && visible && !reduce) { last = performance.now(); raf = requestAnimationFrame(frame); } }
    function reset(final) {
      pos.set(final ? restB : restL); prv.set(pos); gBob.fill(final ? 1 : 0); sCut.fill(final ? 1 : 0); combedY.fill(final ? 9999 : -1);
      locks = []; clips = []; lastSnip = -1; badged = false; st.comb = st.sc = null; comb = null; shineP = -9;
      done.classList.remove("on"); sparks.forEach(function (s) { s.classList.remove("on"); });
    }
    function finalState() {
      reset(true); tl = -1;
      seed = 99; for (var j = 0; j < 34; j++) { var x = rr(372, 480); clips.push({ x: x, y: capeTop(x) + 2 + rnd() * 4, a: rr(0, 6.28), l: rr(2, 5), c: rnd() < .7 ? 0 : 1, rest: true }); }
      done.classList.add("on"); setStep(2); render();
    }
    function play() { if (reduce) { finalState(); return; } reset(false); tl = 0; setStep(0); loop(); }
    $("#hw-replay").addEventListener("click", function () { played = true; visible = true; play(); });
    reset(false); resize();
    if ("ResizeObserver" in window) new ResizeObserver(function () { resize(); }).observe(stage);
    else window.addEventListener("resize", resize);
    if (reduce) finalState();
    else if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          visible = e.isIntersecting;
          if (visible && !played && e.intersectionRatio >= .45) { played = true; play(); }
          else if (visible) loop();
        });
      }, { threshold: [0, .45] }).observe(stage);
    } else { visible = true; play(); }
  })();

  /* ---------- Vorher / Nachher ---------- */
  var ba = $("#ba"), knob = $("#ba-knob");
  if (ba) (function () {
    var pos = 50, drag = false;
    function set(v) {
      pos = Math.max(0, Math.min(100, v));
      ba.style.setProperty("--pos", pos + "%");
      knob.setAttribute("aria-valuenow", Math.round(pos));
      knob.setAttribute("aria-valuetext", Math.round(100 - pos) + " Prozent Nachher sichtbar");
    }
    function fromEvent(e) { var r = ba.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); }
    ba.addEventListener("pointerdown", function (e) { drag = true; ba.setPointerCapture(e.pointerId); fromEvent(e); });
    ba.addEventListener("pointermove", function (e) { if (drag) fromEvent(e); });
    ["pointerup", "pointercancel"].forEach(function (n) { ba.addEventListener(n, function () { drag = false; }); });
    knob.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 10 : 2, m = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step, PageDown: -10, PageUp: 10 };
      if (e.key in m) { e.preventDefault(); set(pos + m[e.key]); }
      else if (e.key === "Home") { e.preventDefault(); set(0); }
      else if (e.key === "End") { e.preventDefault(); set(100); }
    });
    // kleiner Hinweis-Schwenk beim ersten Sichtbarwerden
    if (!reduce && "IntersectionObserver" in window) {
      var o = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return; o.disconnect();
        var t0 = performance.now();
        (function k(now) { var p = Math.min(1, (now - t0) / 1600); if (drag) return; set(50 + Math.sin(p * Math.PI * 2) * 18 * (1 - p)); if (p < 1) requestAnimationFrame(k); })(t0);
      }, { threshold: .6 });
      o.observe(ba);
    }
  })();

  /* ---------- Online-Buchung (Attrappe) ---------- */
  var body = $("#bk-body"), next = $("#bk-next"), back = $("#bk-back"), msg = $("#bk-msg"), stepsUi = $$("#bk-steps li");
  if (body) (function () {
    var services = [
      { id: "d", n: "Damenschnitt", s: "Waschen, Schneiden, Föhnen", p: 49, min: 60 },
      { id: "h", n: "Herrenschnitt", s: "inkl. Styling", p: 29, min: 30 },
      { id: "k", n: "Kinderschnitt", s: "bis 12 Jahre", p: 19, min: 30 },
      { id: "b", n: "Balayage + Schnitt", s: "natürliche Verläufe", p: 159, min: 180 },
      { id: "f", n: "Ansatzfarbe + Föhnen", s: "inkl. Glossing", p: 84, min: 90 },
      { id: "r", n: "Pflege-Ritual", s: "Kopfmassage & Haarkur", p: 25, min: 20 }
    ];
    var people = [
      { id: "l", n: "Lena", s: "Color & Balayage", c: "#b07a6c" },
      { id: "m", n: "Marco", s: "Cuts & Barber", c: "#5f4b45" },
      { id: "s", n: "Sophie", s: "Styling & Hochzeit", c: "#c98d7e" },
      { id: "x", n: "Egal – erste freie Zeit", s: "wir teilen zu", c: "#1b1515" }
    ];
    var WD = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], MON = ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    var state = { step: 0, svc: null, who: null, day: null, time: null };
    function days() {
      var out = [], d = new Date(); d.setHours(12, 0, 0, 0);
      while (out.length < 10) { d.setDate(d.getDate() + 1); var w = d.getDay(); if (w !== 0 && w !== 1) out.push(new Date(d)); }
      return out;
    }
    function slots(day, who) {
      var w = day.getDay(), endH = w === 6 ? 13 : (w === 4 ? 20 : 18.5), startH = w === 6 ? 8 : 9, out = [];
      var h = day.getDate() * 7 + (who ? who.charCodeAt(0) : 1) * 13;
      for (var t = startH; t < endH; t += 0.5) {
        h = (h * 31 + 17) % 97;
        out.push({ t: Math.floor(t) + ":" + (t % 1 ? "30" : "00"), free: h % 3 !== 0 });
      }
      return out;
    }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    function render(focus) {
      var h = "";
      if (state.step === 0) {
        h = '<fieldset data-step><legend tabindex="-1">Welche Leistung darf es sein?</legend><div class="opts">' + services.map(function (s) {
          return '<label class="opt"><input type="radio" name="svc" value="' + s.id + '"' + (state.svc === s.id ? " checked" : "") + '><span><b>' + esc(s.n) + '</b><small>' + esc(s.s) + ' · ca. ' + s.min + ' Min.</small><em>' + s.p + ' €</em></span></label>';
        }).join("") + "</div></fieldset>";
      } else if (state.step === 1) {
        h = '<fieldset data-step><legend tabindex="-1">Bei wem möchten Sie sitzen?</legend><div class="opts">' + people.map(function (p) {
          return '<label class="opt stylist"><input type="radio" name="who" value="' + p.id + '"' + (state.who === p.id ? " checked" : "") + '><span><i style="background:' + p.c + '">' + (p.id === "x" ? "?" : p.n[0]) + '</i><span style="display:flex;flex-direction:column;gap:2px;border:0;padding:0;min-height:0"><b>' + esc(p.n) + '</b><small>' + esc(p.s) + '</small></span></span></label>';
        }).join("") + "</div></fieldset>";
      } else if (state.step === 2) {
        var ds = days(); if (state.day === null) state.day = 0;
        var d = ds[state.day];
        h = '<fieldset data-step><legend tabindex="-1">Wann passt es Ihnen?</legend><p class="sub" style="margin-top:0">' + MON[ds[0].getMonth()] + ' ' + ds[0].getFullYear() + '</p><div class="days" role="radiogroup" aria-label="Tag">' + ds.map(function (x, i) {
          return '<label class="opt"><input type="radio" name="day" value="' + i + '"' + (state.day === i ? " checked" : "") + ' aria-label="' + WD[x.getDay()] + ' ' + x.getDate() + '. ' + MON[x.getMonth()] + '"><span><small>' + WD[x.getDay()] + '</small><b>' + x.getDate() + '</b></span></label>';
        }).join("") + '</div><p class="sub">Freie Zeiten am ' + WD[d.getDay()] + ', ' + d.getDate() + '. ' + MON[d.getMonth()] + '</p><div class="slots">' + slots(d, state.who).map(function (s) {
          return '<label class="opt"><input type="radio" name="time" value="' + s.t + '"' + (s.free ? "" : " disabled") + (state.time === s.t ? " checked" : "") + ' aria-label="' + s.t + ' Uhr' + (s.free ? "" : ", vergeben") + '"><span>' + s.t + '</span></label>';
        }).join("") + "</div></fieldset>";
      } else {
        var sv = services.filter(function (s) { return s.id === state.svc; })[0], pp = people.filter(function (p) { return p.id === state.who; })[0], dd = days()[state.day];
        h = '<fieldset data-step><legend tabindex="-1">Fast geschafft!</legend><dl class="sum"><div><dt>Leistung</dt><dd>' + esc(sv.n) + '</dd></div><div><dt>Bei</dt><dd>' + esc(pp.n) + '</dd></div><div><dt>Termin</dt><dd>' + WD[dd.getDay()] + ', ' + dd.getDate() + '. ' + MON[dd.getMonth()] + ' · ' + state.time + ' Uhr</dd></div><div><dt>Preis</dt><dd>' + sv.p + ' € · ca. ' + sv.min + ' Min.</dd></div></dl>' +
          '<div class="two"><div class="field"><label for="bk-name">Name</label><input id="bk-name" name="name" autocomplete="name" required></div><div class="field"><label for="bk-tel">Telefon</label><input id="bk-tel" name="tel" type="tel" autocomplete="tel" required></div></div></fieldset>';
      }
      body.innerHTML = h;
      stepsUi.forEach(function (li, i) { li.classList.toggle("is-on", i === state.step); li.classList.toggle("is-done", i < state.step); if (i === state.step) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current"); });
      back.disabled = state.step === 0;
      next.innerHTML = state.step === 3 ? "Verbindlich buchen" : 'Weiter <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      validate();
      if (focus) { var lg = body.querySelector("legend"); if (lg) lg.focus({ preventScroll: true }); }
    }
    function validate() {
      var ok = [state.svc, state.who, state.time, true][state.step];
      next.disabled = !ok;
    }
    body.addEventListener("change", function (e) {
      var t = e.target;
      if (t.name === "svc") state.svc = t.value;
      if (t.name === "who") { state.who = t.value; state.time = null; }
      if (t.name === "day") { state.day = +t.value; state.time = null; render(); body.querySelector('input[name="day"]:checked').focus(); return; }
      if (t.name === "time") state.time = t.value;
      validate();
    });
    next.addEventListener("click", function () {
      if (state.step < 3) { state.step++; msg.classList.remove("on"); render(true); return; }
      submit();
    });
    back.addEventListener("click", function () { if (state.step > 0) { state.step--; render(true); } });
    function submit() { msg.textContent = DEMO_MSG; msg.classList.add("on"); }
    $("#bk-form").addEventListener("submit", function (e) { e.preventDefault(); if (state.step === 3) submit(); });
    render();
  })();

  /* ---------- Öffnungszeiten: heute & Status ---------- */
  (function () {
    var H = { 0: null, 1: null, 2: [9, 18.5], 3: [9, 18.5], 4: [9, 20], 5: [9, 18.5], 6: [8, 13] };
    var now = new Date(), d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
    var row = $('#htab tr[data-d="' + d + '"]'); if (row) row.classList.add("today");
    var st = $("#open-status"), r = H[d], open = r && h >= r[0] && h < r[1];
    st.classList.toggle("open", !!open);
    st.querySelector("span").textContent = open ? "Jetzt geöffnet – bis " + fmt(r[1]) + " Uhr" : "Gerade geschlossen – online buchen geht immer";
    function fmt(x) { return Math.floor(x) + ":" + (x % 1 ? "30" : "00"); }
  })();
})();
