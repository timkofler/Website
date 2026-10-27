// Lot & Linie – das Haus als Strichzeichnung. Liefert jede Linie mit Start, Ende und Zeitfenster (0 bis 1),
// damit sich das Haus beim Scrollen wie auf dem Plan aufbaut: Grundstück, Keller, Grundriss, Wände, Fenster, Dach.
// Wird vom 3D-Bild (szene.js) und von den 2D-Zeichnungen (app.js) gemeinsam genutzt.
(function () {
  "use strict";
  var STRIDE = 9; // ax ay az bx by bz t0 t1 art
  // Art: 0 Wand, 1 Maß/Akzent, 2 Glas, 3 feine Schraffur und Raster, 4 unter der Erde, 5 Bäume

  function build(o) {
    o = Object.assign({ w: 12, d: 9, floors: 2, h: 2.9, roof: "sattel", keller: true, site: true, extras: true }, o || {});
    var S = [], F = [];
    var W = o.w, D = o.d, hw = W / 2, hd = D / 2, H = o.h, NF = o.floors, top = NF * H, th = .38, ov = .55;
    var tan = Math.tan(o.roof === "walm" ? 30 * Math.PI / 180 : 36 * Math.PI / 180);

    function seg(a, b, t0, t1, k) { S.push(a[0], a[1], a[2], b[0], b[1], b[2], t0, t1, k || 0); }
    // Linien nacheinander zeichnen: jede braucht dur Anteile des Fensters, die nächste beginnt etwas später
    function run(list, t0, t1, k, dur) {
      var n = list.length; if (!n) return;
      var span = t1 - t0, d = span * (dur == null ? .35 : dur);
      list.forEach(function (l, i) { var s = t0 + (span - d) * (n > 1 ? i / (n - 1) : 0); seg(l[0], l[1], s, s + d, l[2] == null ? k : l[2]); });
    }
    function rect(y, x0, z0, x1, z1) { return [[[x0, y, z0], [x1, y, z0]], [[x1, y, z0], [x1, y, z1]], [[x1, y, z1], [x0, y, z1]], [[x0, y, z1], [x0, y, z0]]]; }
    function quad(a, b, c, d) { F.push(a, b, c, a, c, d); }
    function tri(a, b, c) { F.push(a, b, c); }
    // Diagonale Schraffur in einem Rechteck (Decken und Bodenplatten)
    function hatch(y, x0, z0, x1, z1, step) {
      var out = [], w = x1 - x0, d = z1 - z0;
      for (var c = step; c < w + d; c += step) {
        var a = [x0 + Math.max(0, c - d), z0 + Math.min(c, d)], b = [x0 + Math.min(c, w), z0 + Math.max(0, c - w)];
        out.push([[a[0], y, a[1]], [b[0], y, b[1]]]);
      }
      return out;
    }
    function circle(cx, cy, cz, r, n, axis) {
      var out = [];
      for (var i = 0; i < n; i++) {
        var a = i / n * Math.PI * 2, b = (i + 1) / n * Math.PI * 2;
        var p = axis === "y" ? [cx + Math.cos(a) * r, cy, cz + Math.sin(a) * r] : [cx + Math.cos(a) * r * Math.cos(axis), cy + Math.sin(a) * r, cz + Math.cos(a) * r * Math.sin(axis)];
        var q = axis === "y" ? [cx + Math.cos(b) * r, cy, cz + Math.sin(b) * r] : [cx + Math.cos(b) * r * Math.cos(axis), cy + Math.sin(b) * r, cz + Math.cos(b) * r * Math.sin(axis)];
        out.push([p, q]);
      }
      return out;
    }
    // Wand als Doppellinie (Dicke t) im Grundriss
    function wall2(a, b, t) {
      var dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l * t / 2, nz = dx / l * t / 2;
      return [[[a[0] + nx, 0, a[1] + nz], [b[0] + nx, 0, b[1] + nz]], [[a[0] - nx, 0, a[1] - nz], [b[0] - nx, 0, b[1] - nz]]];
    }

    // 1. Grundstück: Raster und Grenze, Maßketten
    if (o.site) {
      var px = hw + 6, pz0 = -hd - 5, pz1 = hd + 8, grid = [];
      for (var gx = -Math.floor(px / 2) * 2; gx <= px; gx += 2) grid.push([[gx, 0, pz0], [gx, 0, pz1]]);
      for (var gz = Math.ceil(pz0 / 2) * 2; gz <= pz1; gz += 2) grid.push([[-px, 0, gz], [px, 0, gz]]);
      run(grid, 0, .1, 3, .5);
      run(rect(0, -px, pz0, px, pz1), .02, .1, 1, .4);
      var mz = hd + 2.2, mx = hw + 2.2, tk = .35;
      run([
        [[-hw, 0, hd + .4], [-hw, 0, mz + .4]], [[hw, 0, hd + .4], [hw, 0, mz + .4]], [[-hw, 0, mz], [hw, 0, mz]],
        [[-hw - tk, 0, mz + tk], [-hw + tk, 0, mz - tk]], [[hw - tk, 0, mz + tk], [hw + tk, 0, mz - tk]],
        [[hw + .4, 0, -hd], [mx + .4, 0, -hd]], [[hw + .4, 0, hd], [mx + .4, 0, hd]], [[mx, 0, -hd], [mx, 0, hd]],
        [[mx - tk, 0, -hd - tk], [mx + tk, 0, -hd + tk]], [[mx - tk, 0, hd - tk], [mx + tk, 0, hd + tk]]
      ], .06, .17, 1, .3);
    }

    // 2. Keller: Baugrube nach unten
    if (o.keller) {
      var ky = -2.7, kv = [];
      [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].forEach(function (c) { kv.push([[c[0], 0, c[1]], [c[0], ky, c[1]]]); });
      run(kv, .08, .16, 4, .6);
      run(rect(ky, -hw, -hd, hw, hd), .11, .2, 4, .4);
      run(hatch(ky, -hw, -hd, hw, hd, 1.4), .13, .22, 3, .4);
      quad([-hw, ky, hd], [hw, ky, hd], [hw, 0, hd], [-hw, 0, hd]);
    }

    // 3. Grundriss: Außenwand doppelt, Innenwände, Bodenplatte
    var plan = rect(0, -hw, -hd, hw, hd).concat(rect(0, -hw + th, -hd + th, hw - th, hd - th));
    var iw = -hw + W * .42, iz = -hd + D * .42, iw2 = hw - W * .27;
    var inner = [
      [[iw, -hd + th], [iw, hd - 2.2]], [[-hw + th, iz], [iw - 1.1, iz]], [[iw2, -hd + th], [iw2, iz]], [[iw, iz], [hw - th, iz]]
    ];
    inner.forEach(function (w) { plan = plan.concat(wall2(w[0], w[1], .2)); });
    run(plan, .14, .3, 0, .22);
    var ends = [];
    inner.forEach(function (w) { ends.push(w[0], w[1]); });

    // 4. Wände Geschoß für Geschoß: senkrechte Linien rund ums Haus, oben der Ring
    function aroundOrder(a, b) { return Math.atan2(a[0][2], a[0][0]) - Math.atan2(b[0][2], b[0][0]); }
    for (var f = 0; f < NF; f++) {
      var y0 = f * H, y1 = y0 + H, t0 = .28 + f * .13, t1 = t0 + .15, vs = [];
      [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].forEach(function (c) {
        vs.push([[c[0], y0, c[1]], [c[0], y1, c[1]]]);
        vs.push([[c[0] - Math.sign(c[0]) * th, y0, c[1] - Math.sign(c[1]) * th], [c[0] - Math.sign(c[0]) * th, y1, c[1] - Math.sign(c[1]) * th]]);
      });
      for (var x = -hw + 1.6; x < hw - .8; x += 1.6) { vs.push([[x, y0, hd], [x, y1, hd]]); vs.push([[x, y0, -hd], [x, y1, -hd]]); }
      for (var z = -hd + 1.6; z < hd - .8; z += 1.6) { vs.push([[hw, y0, z], [hw, y1, z]]); vs.push([[-hw, y0, z], [-hw, y1, z]]); }
      ends.forEach(function (p) { vs.push([[p[0], y0, p[1]], [p[0], y1, p[1]], 3]); });
      vs.sort(aroundOrder);
      run(vs, t0, t1, 0, .3);
      run(rect(y1, -hw, -hd, hw, hd).concat(rect(y1, -hw + th, -hd + th, hw - th, hd - th)), t1 - .04, t1 + .03, 0, .4);
      if (f < NF - 1 || o.roof === "flach") run(hatch(y1, -hw + th, -hd + th, hw - th, hd - th, 1.1), t1 - .02, t1 + .05, 3, .5);
      quad([-hw, y0, hd], [hw, y0, hd], [hw, y1, hd], [-hw, y1, hd]);
      quad([hw, y0, -hd], [-hw, y0, -hd], [-hw, y1, -hd], [hw, y1, -hd]);
      quad([hw, y0, hd], [hw, y0, -hd], [hw, y1, -hd], [hw, y1, hd]);
      quad([-hw, y0, -hd], [-hw, y0, hd], [-hw, y1, hd], [-hw, y1, -hd]);
    }

    // 5. Fenster und Türen, etwas vor der Fassade
    var win = [], e = .03;
    function opening(face, a, w, sill, hgt, y0, bars) {
      var p = function (s, y) {
        if (face === "s") return [s, y, hd + e]; if (face === "n") return [s, y, -hd - e];
        if (face === "o") return [hw + e, y, s]; return [-hw - e, y, s];
      };
      var y = y0 + sill, Y = y + hgt;
      win.push([p(a, y), p(a + w, y)], [p(a + w, y), p(a + w, Y)], [p(a + w, Y), p(a, Y)], [p(a, Y), p(a, y)]);
      for (var i = 1; i <= bars; i++) win.push([p(a + w * i / (bars + 1), y), p(a + w * i / (bars + 1), Y)]);
      if (sill > .3) win.push([p(a - .08, y - .06), p(a + w + .08, y - .06), 1]);
    }
    for (f = 0; f < NF; f++) {
      var yb = f * H;
      if (f === 0) { opening("s", -hw + 1.1, Math.min(3.6, W * .32), 0, 2.35, yb, 2); opening("s", hw - 2.7, 1.4, .9, 1.35, yb, 1); }
      else { var nS = Math.max(2, Math.floor(W / 3.6)); for (var i = 0; i < nS; i++) opening("s", -hw + (i + .5) * W / nS - .65, 1.3, .85, 1.4, yb, 1); }
      var nN = Math.max(1, Math.floor(W / 4.2)); for (i = 0; i < nN; i++) opening("n", -hw + (i + .5) * W / nN - .55, 1.1, 1, 1.25, yb, 0);
      opening("o", -.7, 1.4, .9, 1.35, yb, 1);
      if (f === 0) opening("w", .4, 1.1, 0, 2.2, yb, 0); else opening("w", -.6, 1.2, .9, 1.3, yb, 0);
    }
    run(win, .5 + (NF - 1) * .04, .66 + (NF - 1) * .04, 2, .12);

    // 6. Dach
    var rt0 = .64 + (NF - 1) * .03, rt1 = .84, roof = [], fine = [];
    if (o.roof === "sattel") {
      var rY = top + hd * tan, eY = top - ov * tan, ez = hd + ov;
      roof.push([[-hw, top, hd], [-hw, rY, 0]], [[-hw, top, -hd], [-hw, rY, 0]], [[hw, top, hd], [hw, rY, 0]], [[hw, top, -hd], [hw, rY, 0]]);
      roof.push([[-hw - ov, rY, 0], [hw + ov, rY, 0]]);
      for (var rx = -hw - ov; rx <= hw + ov + .01; rx += (W + 2 * ov) / Math.round((W + 2 * ov) / .9)) {
        roof.push([[rx, eY, ez], [rx, rY, 0]], [[rx, eY, -ez], [rx, rY, 0]]);
      }
      roof.push([[-hw - ov, eY, ez], [hw + ov, eY, ez]], [[-hw - ov, eY, -ez], [hw + ov, eY, -ez]]);
      for (var s = .25; s < 1; s += .25) {
        var zz = ez * (1 - s), yy = eY + (rY - eY) * s;
        fine.push([[-hw - ov, yy, zz], [hw + ov, yy, zz]], [[-hw - ov, yy, -zz], [hw + ov, yy, -zz]]);
      }
      quad([-hw - ov, eY, ez], [hw + ov, eY, ez], [hw + ov, rY, 0], [-hw - ov, rY, 0]);
      quad([hw + ov, eY, -ez], [-hw - ov, eY, -ez], [-hw - ov, rY, 0], [hw + ov, rY, 0]);
      tri([-hw, top, hd], [-hw, top, -hd], [-hw, rY, 0]); tri([hw, top, -hd], [hw, top, hd], [hw, rY, 0]);
    } else if (o.roof === "walm") {
      var wY = top + hd * tan, r0 = hw - hd, eY2 = top - ov * tan, ex = hw + ov, ez2 = hd + ov;
      roof.push([[-r0, wY, 0], [r0, wY, 0]]);
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c) { roof.push([[c[0] * ex, eY2, c[1] * ez2], [c[0] * r0, wY, 0]]); });
      roof.push.apply(roof, rect(eY2, -ex, -ez2, ex, ez2));
      var n = Math.round(W / .9);
      for (i = 1; i < n; i++) {
        var x2 = -hw + W * i / n, zt = Math.max(0, Math.abs(x2) - r0), yt = top + (hd - zt) * tan;
        roof.push([[x2, eY2, ez2], [x2, yt, zt]], [[x2, eY2, -ez2], [x2, yt, -zt]]);
      }
      var m = Math.round(D / .9);
      for (i = 1; i < m; i++) {
        var z2 = -hd + D * i / m, xt = r0 + Math.abs(z2), yt2 = top + (hd - Math.abs(z2)) * tan;
        roof.push([[ex, eY2, z2], [xt, yt2, z2]], [[-ex, eY2, z2], [-xt, yt2, z2]]);
      }
      quad([-ex, eY2, ez2], [ex, eY2, ez2], [r0, wY, 0], [-r0, wY, 0]);
      quad([ex, eY2, -ez2], [-ex, eY2, -ez2], [-r0, wY, 0], [r0, wY, 0]);
      tri([ex, eY2, ez2], [ex, eY2, -ez2], [r0, wY, 0]); tri([-ex, eY2, -ez2], [-ex, eY2, ez2], [-r0, wY, 0]);
    } else {
      var aY = top + .7, ao = .12;
      roof.push.apply(roof, rect(aY, -hw - ao, -hd - ao, hw + ao, hd + ao));
      roof.push.apply(roof, rect(aY, -hw + .15, -hd + .15, hw - .15, hd - .15));
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c) { roof.push([[c[0] * (hw + ao), top, c[1] * (hd + ao)], [c[0] * (hw + ao), aY, c[1] * (hd + ao)]]); });
      roof.push.apply(roof, rect(top + .25, -1.2, -hd * .5, 1.2, -hd * .5 + 1.6));
      quad([-hw - ao, top, hd + ao], [hw + ao, top, hd + ao], [hw + ao, aY, hd + ao], [-hw - ao, aY, hd + ao]);
      quad([-hw, top + .05, hd], [hw, top + .05, hd], [hw, top + .05, -hd], [-hw, top + .05, -hd]);
    }
    run(roof, rt0, rt1, 0, .14);
    run(fine, rt1 - .06, rt1 + .02, 3, .4);

    // 7. Rundherum: Kamin, Photovoltaik, Terrasse, Bäume
    if (o.extras) {
      var ex1 = [], t2 = [];
      if (o.roof !== "flach") {
        var r0w = hw - hd, cx = o.roof === "walm" ? Math.min(hw * .38, Math.max(0, r0w * .8)) : hw * .38, cz = -hd * .35, cy = top + (hd - Math.abs(cz)) * tan, ch = (o.roof === "sattel" ? top + hd * tan : top + hd * tan) + .9;
        ex1.push.apply(ex1, rect(ch, cx - .3, cz - .3, cx + .3, cz + .3));
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c) { ex1.push([[cx + c[0] * .3, cy - .2, cz + c[1] * .3], [cx + c[0] * .3, ch, cz + c[1] * .3]]); });
        // Photovoltaik auf der Südseite; beim Walmdach nur im Rechteck unter dem First
        var pz0 = hd * .12, pz1 = hd * .82, rows = 2, px0 = .4, cols = Math.max(2, Math.floor((hw - .6) / 1.05));
        if (o.roof === "walm") { var half = r0w + pz0 - .3; cols = Math.floor(2 * half / 1.05); px0 = -cols * 1.05 / 2; }
        for (var r = 0; r <= rows; r++) {
          var zr = pz0 + (pz1 - pz0) * r / rows, yr = top + (hd - zr) * tan + .08;
          if (cols > 0) ex1.push([[px0, yr, zr], [px0 + cols * 1.05, yr, zr], 1]);
        }
        for (var c2 = 0; cols > 0 && c2 <= cols; c2++) {
          var xc = px0 + c2 * 1.05;
          ex1.push([[xc, top + (hd - pz0) * tan + .08, pz0], [xc, top + (hd - pz1) * tan + .08, pz1], 1]);
        }
      }
      var tx0 = -hw + .6, tx1 = Math.min(-hw + 5.6, hw - 1), ty = .15;
      ex1.push.apply(ex1, rect(ty, tx0, hd, tx1, hd + 3.2));
      for (var pl = hd + .5; pl < hd + 3.2; pl += .5) t2.push([[tx0, ty, pl], [tx1, ty, pl], 3]);
      run(ex1, .8, .92, 0, .2);
      run(t2, .84, .93, 3, .4);
      if (o.site) {
        var trees = [[-hw - 3.4, -hd - 1.2, 1.6], [hw + 3.6, -hd - 1.5, 1.8], [hw + 3, hd + 5.2, 1.2]], tl = [];
        trees.forEach(function (tr) {
          var r1 = tr[2], cy2 = 1.7 + r1;
          tl.push([[tr[0], 0, tr[1]], [tr[0], 1.7, tr[1]]]);
          tl = tl.concat(circle(tr[0], cy2, tr[1], r1, 16, "y"), circle(tr[0], cy2, tr[1], r1, 16, 0), circle(tr[0], cy2, tr[1], r1, 16, Math.PI / 2),
            circle(tr[0], cy2 + r1 * .55, tr[1], r1 * .83, 14, "y"), circle(tr[0], cy2 - r1 * .55, tr[1], r1 * .83, 14, "y"));
        });
        run(tl, .86, .97, 5, .12);
      }
    }

    var top2 = o.roof === "flach" ? top + .7 : top + hd * tan + (o.extras && o.roof !== "flach" ? .9 : 0);
    return { segs: new Float32Array(S), faces: new Float32Array([].concat.apply([], F)), n: S.length / STRIDE, height: top2, w: W, d: D, top: top };
  }

  // Wohnfläche, Geschoße → Außenmaße. Seitenverhältnis etwa 4:3, Wände eingerechnet.
  function dims(area, floors) {
    var a = area / floors * 1.18, w = Math.sqrt(a * 1.38);
    return { w: Math.round(w * 10) / 10, d: Math.round(a / w * 10) / 10 };
  }

  function ease(k) { return k * k * (3 - 2 * k); }

  // 2D-Zeichnung (Parallelprojektion) für Projektkarten und als Ersatz ohne WebGL
  function draw2d(ctx, data, o) {
    var cv = ctx.canvas, W = cv.width, H = cv.height, s = data.segs, u = o.u == null ? 1 : o.u;
    var cy = Math.cos(o.yaw), sy = Math.sin(o.yaw), cp = Math.cos(o.pitch), sp = Math.sin(o.pitch);
    function pr(x, y, z) { var X = x * cy - z * sy, Z = x * sy + z * cy; return [X, -(y * cp - Z * sp)]; }
    var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, i, p, q;
    for (i = 0; i < s.length; i += STRIDE) {
      if (s[i + 8] === 3 && o.noGrid) continue;
      p = pr(s[i], s[i + 1], s[i + 2]); q = pr(s[i + 3], s[i + 4], s[i + 5]);
      minX = Math.min(minX, p[0], q[0]); maxX = Math.max(maxX, p[0], q[0]); minY = Math.min(minY, p[1], q[1]); maxY = Math.max(maxY, p[1], q[1]);
    }
    var pad = o.pad == null ? .08 : o.pad, sc = Math.min(W * (1 - 2 * pad) / (maxX - minX), H * (1 - 2 * pad) / (maxY - minY));
    var ox = W / 2 - (minX + maxX) / 2 * sc, oy = H / 2 - (minY + maxY) / 2 * sc;
    ctx.clearRect(0, 0, W, H); ctx.lineCap = "round";
    var col = o.colors || {}, lw = o.lw || 1;
    var STY = [[col.ink || "#1b1d21", .85], [col.acc || "#2f5bd3", .8], [col.glass || "#4a6fc9", .8], [col.ink || "#1b1d21", .16], [col.ink || "#1b1d21", .38], [col.tree || "#6f8a6a", .6]];
    for (var k = 0; k < 6; k++) {
      ctx.beginPath(); var fresh = [];
      for (i = 0; i < s.length; i += STRIDE) {
        if (s[i + 8] !== k) continue;
        var t0 = s[i + 6], t1 = s[i + 7], kk = (u - t0) / Math.max(1e-4, t1 - t0);
        if (kk <= 0) continue; kk = ease(Math.min(1, kk));
        p = pr(s[i], s[i + 1], s[i + 2]);
        q = pr(s[i] + (s[i + 3] - s[i]) * kk, s[i + 1] + (s[i + 4] - s[i + 1]) * kk, s[i + 2] + (s[i + 5] - s[i + 2]) * kk);
        if (u < t1 + .08 && u < 1) fresh.push(p, q);
        else { ctx.moveTo(ox + p[0] * sc, oy + p[1] * sc); ctx.lineTo(ox + q[0] * sc, oy + q[1] * sc); }
      }
      ctx.strokeStyle = STY[k][0]; ctx.globalAlpha = STY[k][1]; ctx.lineWidth = lw; ctx.stroke();
      if (fresh.length) {
        ctx.beginPath();
        for (var j = 0; j < fresh.length; j += 2) { ctx.moveTo(ox + fresh[j][0] * sc, oy + fresh[j][1] * sc); ctx.lineTo(ox + fresh[j + 1][0] * sc, oy + fresh[j + 1][1] * sc); }
        ctx.strokeStyle = col.acc || "#2f5bd3"; ctx.globalAlpha = .95; ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  window.LLHaus = { build: build, dims: dims, draw2d: draw2d, STRIDE: STRIDE };
})();
