/* QR-Codes im Stil von tim-kofler.at: runde Punkte, abgerundete Ecken mit farbigem Kern, Logo in der Mitte.
   Braucht qrcode-generator (window.qrcode). Mit Logo wird standardmäßig Fehlerkorrektur H verwendet, damit der Code trotz
   verdeckter Mitte sicher lesbar bleibt. Die drei Ecken bleiben Quadrate, daran erkennen Kameras den Code.

   tkQR.svg(text, opt)                  -> SVG-Markup (skaliert mit dem Behälter)
   tkQR.draw(ctx, text, x, y, size, opt) -> zeichnet auf eine Canvas
   tkQR.info(text, opt)                 -> { n: Module je Seite, ecl } (zum Prüfen, wie dicht der Code wird)
   opt: { ink, accent, bg, logo, quiet, ecl } (ecl "Q" reicht bei langen Texten, dann werden die Punkte größer)
     logo: tkQR.TK (Standard) | null | { text: "G", bg: "#d63a74", fg: "#fff" } | { img: Bild oder URL }
           | { paths: [[d, farbe], ...], vb: [breite, höhe] }
   Seit 11/2026 zusätzlich (ohne Angabe bleibt alles wie vorher):
     dot:  "round" (Standard) | "square"  eckige Module und eckige Ecken
     bg:   "transparent" oder "none"      kein Hintergrund (auch keine Fläche hinter dem Logo)
     utf8: true                           Text als UTF-8 kodieren (Umlaute, €), sonst wie bisher Latin-1 */
(function () {
  "use strict";
  var TK = { vb: [702, 358.5], paths: [["M0 .5h502L389 87.5H286v194l-98.5 73V87.5H104z", "ink"], ["M540 0h162L470 180.5 701 358.5H540L307 181.5z", "accent"]] };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  function make(text, opt, logo) {
    var Q = window.qrcode, q = Q(0, opt.ecl || (logo ? "H" : "M")), keep = Q.stringToBytes;
    if (opt.utf8 && Q.stringToBytesFuncs && Q.stringToBytesFuncs["UTF-8"]) Q.stringToBytes = Q.stringToBytesFuncs["UTF-8"];
    try { q.addData(text); q.make(); } finally { Q.stringToBytes = keep; }
    return q;
  }

  function build(text, opt) {
    opt = opt || {};
    var logo = opt.logo === undefined ? TK : opt.logo;
    var q = make(text, opt, logo);
    var n = q.getModuleCount();
    // Logo-Fläche: etwa 22 % der Breite, mittig, immer ungerade Modulzahl
    var ls = logo ? Math.round(n * .22) | 1 : 0, l0 = (n - ls) / 2, l1 = l0 + ls;
    var eye = function (r, c) { return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7); };
    var dots = [];
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
      if (!q.isDark(r, c) || eye(r, c)) continue;
      if (logo && r + .5 > l0 - .5 && r + .5 < l1 + .5 && c + .5 > l0 - .5 && c + .5 < l1 + .5) continue;
      dots.push([c, r]);
    }
    var bg = opt.bg || "#fff", clear = bg === "transparent" || bg === "none";
    return { n: n, dots: dots, logo: logo, l0: l0, ls: ls, square: opt.dot === "square", clear: clear,
      ink: opt.ink || "#141a2e", accent: opt.accent || "#ff5a1f", bg: clear ? "none" : bg, quiet: opt.quiet == null ? 1 : opt.quiet };
  }
  var col = function (m, k) { return k === "ink" ? m.ink : k === "accent" ? m.accent : k; };
  var EYES = function (n) { return [[0, 0], [n - 7, 0], [0, n - 7]]; };
  // Eckige Module: waagrechte Läufe zusammenfassen und minimal überlappen, damit keine feinen Spalten sichtbar werden
  function runs(m) {
    var out = [], k = 0, d = m.dots;
    while (k < d.length) {
      var x = d[k][0], y = d[k][1], w = 1;
      while (k + w < d.length && d[k + w][1] === y && d[k + w][0] === x + w) w++;
      out.push([x, y, w]); k += w;
    }
    return out;
  }
  // Radien der Ecken: Ring (aussen) und Kern
  var ER = function (m) { return m.square ? ["0", "0"] : ["1.8", ".9"]; };

  function svg(text, opt) {
    if (typeof window.qrcode !== "function") return "";
    var m = build(text, opt), n = m.n, z = m.quiet, d = "", out, er = ER(m);
    if (m.square) runs(m).forEach(function (p) { d += "M" + p[0] + " " + p[1] + "h" + (p[2] + .02) + "v1.02h-" + (p[2] + .02) + "z"; });
    else m.dots.forEach(function (p) { d += "M" + (p[0] + .5) + " " + (p[1] + .08) + "a.42 .42 0 1 0 .001 0z"; });
    out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (-z) + " " + (-z) + " " + (n + 2 * z) + " " + (n + 2 * z) + '" role="img" aria-label="QR-Code">' +
      (m.clear ? "" : '<rect x="' + (-z) + '" y="' + (-z) + '" width="' + (n + 2 * z) + '" height="' + (n + 2 * z) + '" rx="' + (m.square ? 0 : 1.2 + z) + '" fill="' + m.bg + '"/>') +
      '<path fill="' + m.ink + '" d="' + d + '"/>';
    EYES(n).forEach(function (e) {
      out += '<rect x="' + (e[0] + .5) + '" y="' + (e[1] + .5) + '" width="6" height="6" rx="' + er[0] + '" fill="none" stroke="' + m.ink + '" stroke-width="1"/>' +
        '<rect x="' + (e[0] + 2) + '" y="' + (e[1] + 2) + '" width="3" height="3" rx="' + er[1] + '" fill="' + m.accent + '"/>';
    });
    if (m.logo) {
      var a = m.l0, s = m.ls, L = m.logo, pad = s * .14;
      if (!m.clear) out += '<rect x="' + a + '" y="' + a + '" width="' + s + '" height="' + s + '" rx="' + (s * .26) + '" fill="' + m.bg + '"/>';
      if (L.paths) {
        var w = s - 2 * pad, k = w / L.vb[0], h = L.vb[1] * k;
        out += '<g transform="translate(' + (a + pad) + " " + (a + (s - h) / 2) + ") scale(" + k + ')">' +
          L.paths.map(function (p) { return '<path d="' + p[0] + '" fill="' + col(m, p[1]) + '"/>'; }).join("") + "</g>";
      } else if (L.text) {
        out += '<rect x="' + (a + pad * .6) + '" y="' + (a + pad * .6) + '" width="' + (s - pad * 1.2) + '" height="' + (s - pad * 1.2) + '" rx="' + (s * .22) + '" fill="' + (L.bg || m.accent) + '"/>' +
          '<text x="' + (a + s / 2) + '" y="' + (a + s / 2) + '" text-anchor="middle" dominant-baseline="central" font-family="Bricolage, system-ui, sans-serif" font-weight="800" font-size="' + (s * (String(L.text).length > 2 ? .34 : .5)) + '" fill="' + (L.fg || "#fff") + '">' + esc(L.text) + "</text>";
      } else if (L.img) {
        var src = typeof L.img === "string" ? L.img : L.img.src;
        out += '<image href="' + esc(src) + '" x="' + (a + pad * .6) + '" y="' + (a + pad * .6) + '" width="' + (s - pad * 1.2) + '" height="' + (s - pad * 1.2) + '" preserveAspectRatio="xMidYMid meet"/>';
      }
    }
    return out + "</svg>";
  }

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function draw(ctx, text, x, y, size, opt) {
    if (typeof window.qrcode !== "function") return;
    var m = build(text, opt), n = m.n, z = m.quiet, u = size / (n + 2 * z), ox = x + z * u, oy = y + z * u, er = ER(m);
    ctx.save();
    if (!m.clear) { rr(ctx, x, y, size, size, (m.square ? 0 : 1.2 + z) * u); ctx.fillStyle = m.bg; ctx.fill(); }
    ctx.fillStyle = m.ink; ctx.beginPath();
    if (m.square) runs(m).forEach(function (p) { ctx.rect(ox + p[0] * u, oy + p[1] * u, (p[2] + .02) * u, 1.02 * u); });
    else m.dots.forEach(function (p) { var cx = ox + (p[0] + .5) * u, cy = oy + (p[1] + .5) * u; ctx.moveTo(cx + .42 * u, cy); ctx.arc(cx, cy, .42 * u, 0, Math.PI * 2); });
    ctx.fill();
    EYES(n).forEach(function (e) {
      rr(ctx, ox + (e[0] + .5) * u, oy + (e[1] + .5) * u, 6 * u, 6 * u, er[0] * u); ctx.lineWidth = u; ctx.strokeStyle = m.ink; ctx.stroke();
      rr(ctx, ox + (e[0] + 2) * u, oy + (e[1] + 2) * u, 3 * u, 3 * u, er[1] * u); ctx.fillStyle = m.accent; ctx.fill();
    });
    if (m.logo) {
      var a = m.l0, s = m.ls, L = m.logo, pad = s * .14, ax = ox + a * u, ay = oy + a * u;
      if (!m.clear) { rr(ctx, ax, ay, s * u, s * u, s * .26 * u); ctx.fillStyle = m.bg; ctx.fill(); }
      if (L.paths && window.Path2D) {
        var w = (s - 2 * pad) * u, k = w / L.vb[0], h = L.vb[1] * k;
        ctx.translate(ax + pad * u, ay + (s * u - h) / 2); ctx.scale(k, k);
        L.paths.forEach(function (p) { ctx.fillStyle = col(m, p[1]); ctx.fill(new Path2D(p[0])); });
      } else if (L.text) {
        rr(ctx, ax + pad * .6 * u, ay + pad * .6 * u, (s - pad * 1.2) * u, (s - pad * 1.2) * u, s * .22 * u); ctx.fillStyle = L.bg || m.accent; ctx.fill();
        ctx.fillStyle = L.fg || "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = "800 " + (s * (String(L.text).length > 2 ? .34 : .5) * u) + 'px "Bricolage", system-ui, sans-serif'; ctx.fillText(L.text, ax + s * u / 2, ay + s * u / 2 + s * .03 * u);
      } else if (L.img && L.img.complete && L.img.naturalWidth) {
        var iw = (s - pad * 1.2) * u, r = Math.min(iw / L.img.naturalWidth, iw / L.img.naturalHeight), dw = L.img.naturalWidth * r, dh = L.img.naturalHeight * r;
        ctx.drawImage(L.img, ax + (s * u - dw) / 2, ay + (s * u - dh) / 2, dw, dh);
      }
    }
    ctx.restore();
  }

  function info(text, opt) {
    opt = opt || {};
    var logo = opt.logo === undefined ? TK : opt.logo;
    return { n: make(text, opt, logo).getModuleCount(), ecl: opt.ecl || (logo ? "H" : "M") };
  }

  window.tkQR = { svg: svg, draw: draw, info: info, TK: TK };
})();
