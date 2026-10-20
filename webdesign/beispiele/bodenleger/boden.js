// Grund & Holz – Bodenmuster im Canvas: Dielen, Schiffsboden, Fischgrät, Chevron und Würfel aus einzelnen Stäben.
// Wird vom Bodenplaner (3D-Raum) und von der Verlege-Animation beim Scrollen genutzt.
(function () {
  "use strict";
  var WOODS = {
    natur: { n: "Eiche natur", h: 32, s: 46, l: 60, v: 7 },
    weiss: { n: "Eiche weiß geölt", h: 38, s: 24, l: 79, v: 5 },
    sand: { n: "Eiche sand", h: 36, s: 32, l: 69, v: 6 },
    rauch: { n: "Eiche geräuchert", h: 24, s: 34, l: 37, v: 7 },
    nuss: { n: "Nuss", h: 20, s: 34, l: 29, v: 8 }
  };

  // Zufall mit festem Startwert, damit das Muster beim Umschalten gleich bleibt
  function rnd(seed) { var s = seed >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  function rot(p, a) { var c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; }
  function rect(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }

  // Liefert Stäbe als Polygone (in Pixeln) samt Längsrichtung für die Maserung
  function boards(pattern, W, H, unit) {
    var out = [], r = rnd(7), u = unit || 1;
    function add(poly, ang) {
      var xs = poly.map(function (p) { return p[0]; }), ys = poly.map(function (p) { return p[1]; });
      if (Math.max.apply(0, xs) < 0 || Math.min.apply(0, xs) > W || Math.max.apply(0, ys) < 0 || Math.min.apply(0, ys) > H) return;
      out.push({ p: poly, a: ang, t: r(), cx: (Math.min.apply(0, xs) + Math.max.apply(0, xs)) / 2, cy: (Math.min.apply(0, ys) + Math.max.apply(0, ys)) / 2 });
    }
    if (pattern === "diele" || pattern === "schiff") {
      var L = (pattern === "diele" ? 300 : 120) * u, w = (pattern === "diele" ? 30 : 14) * u;
      for (var y = 0; y < H + w; y += w) {
        var off = pattern === "diele" ? -r() * L : -((Math.round(y / w) % 3) * L / 3);
        for (var x = off; x < W; x += L) add(rect(x, y, L, w), 0);
      }
    } else if (pattern === "fisch") {
      var l = 84 * u, b = 17 * u, a = Math.PI / 4, cx = W / 2, cy = H / 2, R = Math.hypot(W, H);
      var n = Math.ceil(R / b) + 2, m = Math.ceil(R / l) + 2;
      for (var s = -m; s <= m; s++) for (var k = -n; k <= n; k++) {
        var hx = k * b + s * l, hy = k * b - s * l;
        var hp = rect(hx, hy, l, b).map(function (p) { var q = rot(p, a); return [q[0] + cx, q[1] + cy]; });
        add(hp, a);
        var vp = rect(hx + l, hy - l + b, b, l).map(function (p) { var q = rot(p, a); return [q[0] + cx, q[1] + cy]; });
        add(vp, a + Math.PI / 2);
      }
    } else if (pattern === "chevron") {
      var cw = 52 * u, bh = 16 * u, t = cw;
      for (var c = -1; c * cw < W + cw; c++) {
        var up = c % 2 === 0, x0 = c * cw;
        for (var yy = -2 * cw; yy < H + 2 * cw; yy += bh) {
          var p = up ? [[x0, yy + t], [x0 + cw, yy], [x0 + cw, yy + bh], [x0, yy + t + bh]] : [[x0, yy], [x0 + cw, yy + t], [x0 + cw, yy + t + bh], [x0, yy + bh]];
          add(p, up ? -Math.PI / 4 : Math.PI / 4);
        }
      }
    } else { // Würfel: Tafeln aus drei Stäben, abwechselnd quer und längs
      var q = 54 * u, sb = q / 3;
      for (var ty = 0; ty < H; ty += q) for (var tx = 0; tx < W; tx += q) {
        var horiz = ((tx / q | 0) + (ty / q | 0)) % 2 === 0;
        for (var i = 0; i < 3; i++) add(horiz ? rect(tx, ty + i * sb, q, sb) : rect(tx + i * sb, ty, sb, q), horiz ? 0 : Math.PI / 2);
      }
    }
    return out;
  }

  function path(ctx, p) { ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (var i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]); ctx.closePath(); }

  // Einen Stab mit Farbton, Maserung und Fuge zeichnen
  function board(ctx, bd, wood, scale) {
    var wd = WOODS[wood] || WOODS.natur, r = rnd(Math.floor(bd.t * 1e9));
    var l = wd.l + (bd.t - .5) * wd.v * 2, hh = wd.h + (r() - .5) * 4;
    ctx.save(); path(ctx, bd.p); ctx.clip();
    ctx.fillStyle = "hsl(" + hh.toFixed(1) + "," + wd.s + "%," + l.toFixed(1) + "%)"; ctx.fill();
    ctx.translate(bd.cx, bd.cy); ctx.rotate(bd.a);
    var len = 340 * scale, n = 9;
    for (var i = 0; i < n; i++) {
      var y = (r() - .5) * 34 * scale, amp = (1 + r() * 3) * scale, ph = r() * 6;
      ctx.beginPath();
      for (var x = -len; x <= len; x += 12 * scale) { var yy = y + Math.sin(x / (40 * scale) + ph) * amp; if (x === -len) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); }
      ctx.strokeStyle = "hsla(" + (hh - 6) + "," + (wd.s + 8) + "%," + (l - 18) + "%," + (.18 + r() * .2).toFixed(2) + ")";
      ctx.lineWidth = (.6 + r() * 1.1) * scale; ctx.stroke();
    }
    if (r() > .86) { var kx = (r() - .5) * 120 * scale, ky = (r() - .5) * 8 * scale; ctx.beginPath(); ctx.ellipse(kx, ky, 4 * scale, 2.4 * scale, 0, 0, 7); ctx.fillStyle = "hsla(" + (hh - 8) + ",36%," + (l - 20) + "%,.38)"; ctx.fill(); }
    ctx.restore();
    ctx.save(); path(ctx, bd.p); ctx.strokeStyle = "rgba(40,24,10,.32)"; ctx.lineWidth = Math.max(.8, 1.1 * scale); ctx.stroke(); ctx.restore();
  }

  function texture(pattern, wood, W, H, unit) {
    var c = document.createElement("canvas"); c.width = W; c.height = H;
    var ctx = c.getContext("2d"), list = boards(pattern, W, H, unit);
    list.forEach(function (b) { board(ctx, b, wood, unit); });
    return { canvas: c, boards: list };
  }

  window.GHBoden = { WOODS: WOODS, boards: boards, board: board, texture: texture, path: path };
})();
