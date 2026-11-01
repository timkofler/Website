/* Story-Abspann-Generator (tim-kofler.at/tools/story-abspann/)
   Zeichnet einen 1080x1920-Abspann mit Logo auf ein <canvas> und nimmt ihn per captureStream + MediaRecorder auf.
   Alles passiert im Browser: Das Logo wird per FileReader als data:-URL gelesen (CSP: img-src 'self' data:, kein blob: für Bilder)
   und nirgends hingeschickt. Die Vorschau ist immer das Canvas selbst (ein <video> mit blob: würde default-src 'self' blocken).
   render(t) ist rein zeitabhängig: Vorschau und Aufnahme zeigen exakt dasselbe Bild. */
(function () {
  "use strict";
  var W = 1080, H = 1920, FPS = 30;
  var root = document.querySelector("[data-sa]");
  if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
  var cv = $("#sa-canvas"), ctx = cv.getContext("2d");
  cv.width = W; cv.height = H;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var FONT_HEAD = 'Unbounded, "Manrope", system-ui, sans-serif';
  var FONT_BODY = 'Manrope, system-ui, sans-serif';
  var FONT_MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';

  var S = {
    logo: null,            // { cv, w, h, plate: "#rrggbb"|null, lum }
    frame: "circle",       // circle | free
    text: "Jetzt Termin buchen",
    name: "", url: "",
    style: "dreh",         // dreh | glanz | funken | edel
    dur: 4,
    color: "#ff5a1f", colorTouched: false,
    bg: "dark"             // dark | light | brand
  };

  /* ---------- Farben ---------- */
  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function hex(c) { return "#" + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? "0" : "") + v.toString(16); }).join(""); }
  function lum(h) { var c = rgb(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function mix(a, b, t) { var x = rgb(a), y = rgb(b); return hex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); }
  function rgba(h, a) { var c = rgb(h); return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }
  function ensure(c, bg, min) { var to = lum(bg) < 0.3 ? "#ffffff" : "#000000", out = c; for (var i = 1; i <= 12 && contrast(out, bg) < min; i++) out = mix(c, to, i * 0.07); return out; }
  function onColor(c) { return contrast(c, "#ffffff") >= contrast(c, "#141414") ? "#ffffff" : "#141414"; }

  function palette() {
    var b = S.color, P = {};
    if (S.bg === "light") {
      P.bg = "#f6f3ee"; P.text = "#16130f"; P.sub = "#6d665e"; P.accent = ensure(b, P.bg, 3.2); P.glowA = 0.16; P.plate = "#ffffff"; P.add = false;
    } else if (S.bg === "brand") {
      P.bg = b; P.text = onColor(b); P.sub = rgba(P.text, 0.72); P.accent = P.text; P.glowA = 0.2; P.plate = "#ffffff"; P.add = false;
    } else {
      P.bg = "#0a0a0b"; P.text = "#f5f2ec"; P.sub = "#a39d95"; P.accent = ensure(b, P.bg, 3.4); P.glowA = 0.24; P.plate = "#141416"; P.add = true;
    }
    P.glow = S.bg === "brand" ? "#ffffff" : P.accent;
    P.pill = S.bg === "brand" ? P.text : b;
    P.pillText = S.bg === "brand" ? b : onColor(b);
    if (S.bg === "brand") P.pillText = contrast(b, P.text) >= 3 ? b : (lum(P.text) > 0.5 ? "#141414" : "#ffffff");
    return P;
  }

  /* ---------- Helfer ---------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function seg(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
  function eOut(p) { return 1 - Math.pow(1 - p, 3); }
  function eOutExpo(p) { return p >= 1 ? 1 : 1 - Math.pow(2, -10 * p); }
  function eInOut(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function eBack(p, s) { s = s == null ? 1.6 : s; var c3 = s + 1; return 1 + c3 * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2); }
  function mk(w, h) { var c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
  function rand(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  // Text mit Sperrung Zeichen für Zeichen (ctx.letterSpacing kann nicht jeder Browser)
  function spacedWidth(c, s, sp) { var w = 0; for (var i = 0; i < s.length; i++) w += c.measureText(s[i]).width + (i < s.length - 1 ? sp : 0); return w; }
  function spaced(c, s, x, y, sp) { for (var i = 0; i < s.length; i++) { c.fillText(s[i], x, y); x += c.measureText(s[i]).width + sp; } }

  /* ---------- Layout (einmal pro Änderung, alles vorgerendert) ---------- */
  var L = null, tmp = mk(8, 8), tctx = tmp.getContext("2d");

  function splitBest(words, n, measure) {
    // Wörter auf n Zeilen verteilen, sodass die längste Zeile möglichst kurz ist
    var best = null;
    function rec(start, k, acc) {
      if (k === 1) { var line = words.slice(start).join(" "), all = acc.concat([line]), m = 0; all.forEach(function (l) { m = Math.max(m, measure(l)); }); if (!best || m < best.m) best = { lines: all, m: m }; return; }
      for (var i = start + 1; i <= words.length - (k - 1); i++) rec(i, k - 1, acc.concat([words.slice(start, i).join(" ")]));
    }
    if (words.length >= n) rec(0, n, []);
    return best;
  }

  function headlineLines(text) {
    var c = tctx; c.font = "800 100px " + FONT_HEAD;
    var measure = function (s) { return c.measureText(s).width; };
    var maxW = 900, raw = text.replace(/\r/g, "").split("\n").map(function (s) { return s.trim().replace(/\s+/g, " "); }).filter(Boolean);
    if (!raw.length) return { lines: [], size: 0 };
    var caps = [112, 100, 86];
    if (raw.length > 1) {
      raw = raw.slice(0, 3); var m = 0; raw.forEach(function (l) { m = Math.max(m, measure(l)); });
      return { lines: raw, size: Math.max(40, Math.min(caps[raw.length - 1], 100 * maxW / m)) };
    }
    var words = raw[0].split(" "), pick = null;
    for (var n = 1; n <= Math.min(3, words.length); n++) {
      var b = splitBest(words, n, measure); if (!b) continue;
      var size = Math.min(caps[n - 1], 100 * maxW / b.m);
      // mehr Zeilen nur, wenn die Schrift dadurch deutlich größer wird
      if (!pick || size > pick.size * 1.12) pick = { lines: b.lines, size: size };
    }
    pick.size = Math.max(40, pick.size);
    return pick;
  }

  function textCanvas(str, font, color, spacing, pad) {
    pad = pad || 24; tctx.font = font;
    var w = spacing ? spacedWidth(tctx, str, spacing) : tctx.measureText(str).width;
    var m = tctx.measureText("ÄÖÜgjpqy"), asc = m.actualBoundingBoxAscent || parseInt(font.match(/(\d+)px/)[1], 10) * 0.9, desc = m.actualBoundingBoxDescent || parseInt(font.match(/(\d+)px/)[1], 10) * 0.25;
    var c = mk(w + pad * 2, asc + desc + pad * 2), x = c.getContext("2d");
    x.font = font; x.fillStyle = color; x.textBaseline = "alphabetic";
    if (spacing) spaced(x, str, pad, pad + asc, spacing); else x.fillText(str, pad, pad + asc);
    c.pad = pad; c.inkH = asc + desc;
    return c;
  }

  function initials(name) {
    var w = name.replace(/[^\p{L}\p{N}\s&-]/gu, " ").split(/\s+/).filter(Boolean);
    if (!w.length) return "";
    return (w.length === 1 ? w[0].slice(0, 2) : w[0][0] + w[1][0]).toUpperCase();
  }

  function buildBadge(P, preview) {
    var lg = S.logo, name = S.name.trim();
    if (!lg && !name && !preview) return null;
    var D = 440;
    if (!lg) {
      var c = mk(D + 20, D + 20), x = c.getContext("2d"), cx = c.width / 2;
      if (!name) { // nur in der Vorschau: Platzhalter
        x.setLineDash([14, 12]); x.lineWidth = 4; x.strokeStyle = rgba(P.text === "#141414" || S.bg === "light" ? "#16130f" : "#ffffff", 0.35);
        x.beginPath(); x.arc(cx, cx, D / 2 - 6, 0, Math.PI * 2); x.stroke();
        x.fillStyle = rgba(S.bg === "light" ? "#16130f" : "#ffffff", 0.55); x.font = "600 40px " + FONT_BODY; x.textAlign = "center"; x.textBaseline = "middle";
        x.fillText("Dein Logo", cx, cx); c.round = D / 2; c.placeholder = true; return c;
      }
      var fill = S.bg === "brand" ? P.text : P.accent;
      x.fillStyle = fill; x.beginPath(); x.arc(cx, cx, D / 2, 0, Math.PI * 2); x.fill();
      var ini = initials(name); x.fillStyle = onColor(fill); x.textAlign = "center"; x.textBaseline = "middle";
      x.font = "800 " + (ini.length > 1 ? 150 : 180) + "px " + FONT_HEAD; x.fillText(ini, cx, cx + 6);
      c.round = D / 2; return c;
    }
    var aspect = lg.w / lg.h, plate, w, h;
    var lightLogo = lg.lum > 0.6, darkLogo = lg.lum < 0.22;
    if (S.frame === "circle") {
      plate = lg.plate || P.plate;
      if (!lg.plate) { // Fläche wählen, auf der das Logo besser lesbar ist
        var other = plate === "#ffffff" ? "#141416" : "#ffffff", la = hex(lg.avg);
        if (contrast(la, plate) < 2.5 && contrast(la, other) > contrast(la, plate) * 1.3) plate = other;
      }
      var bw = D * 0.7, bh = D * 0.52;
      if (aspect < 1.4) { bw = D * 0.6; bh = D * 0.6; }
      if (aspect > bw / bh) { w = bw; h = bw / aspect; } else { h = bh; w = bh * aspect; }
      var c2 = mk(D + 20, D + 20), y = c2.getContext("2d"), m = c2.width / 2;
      y.fillStyle = plate; y.beginPath(); y.arc(m, m, D / 2, 0, Math.PI * 2); y.fill();
      y.save(); y.beginPath(); y.arc(m, m, D / 2 - 2, 0, Math.PI * 2); y.clip();
      y.imageSmoothingQuality = "high"; y.drawImage(lg.cv, m - w / 2, m - h / 2, w, h); y.restore();
      y.lineWidth = 5; y.strokeStyle = S.bg === "brand" ? rgba(P.text, 0.9) : P.accent; y.beginPath(); y.arc(m, m, D / 2 - 2.5, 0, Math.PI * 2); y.stroke();
      c2.round = D / 2; return c2;
    }
    // frei: Logo ohne Kreis
    var maxW = 640, maxH = 380;
    if (aspect > maxW / maxH) { w = maxW; h = maxW / aspect; } else { h = maxH; w = maxH * aspect; }
    var lowC = !lg.plate && ((S.bg !== "light" && S.bg !== "brand" && darkLogo) || ((S.bg === "light" || S.bg === "brand") && lightLogo) || (S.bg === "brand" && contrast(S.color, hex(lg.avg)) < 1.6));
    var pad = (lowC ? 46 : 0), c3 = mk(w + pad * 2 + 8, h + pad * 2 + 8), z = c3.getContext("2d"), ox = 4 + pad, oy = 4 + pad;
    if (lowC) { z.fillStyle = lightLogo ? "#141416" : "#ffffff"; rr(z, 4, 4, w + pad * 2, h + pad * 2, 40); z.fill(); }
    z.imageSmoothingQuality = "high";
    if (lg.plate) { z.save(); rr(z, ox, oy, w, h, Math.min(36, h * 0.12)); z.clip(); z.drawImage(lg.cv, ox, oy, w, h); z.restore(); }
    else z.drawImage(lg.cv, ox, oy, w, h);
    return c3;
  }

  function buildGlow(color) {
    var s = 1000, c = mk(s, s), x = c.getContext("2d"), g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, rgba(color, 1)); g.addColorStop(0.22, rgba(color, 0.42)); g.addColorStop(0.55, rgba(color, 0.1)); g.addColorStop(1, rgba(color, 0));
    x.fillStyle = g; x.fillRect(0, 0, s, s); return c;
  }

  function buildBg(P) {
    var c = mk(W, H), x = c.getContext("2d");
    x.fillStyle = P.bg; x.fillRect(0, 0, W, H);
    if (S.bg === "brand") {
      var g = x.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, H * 0.75);
      g.addColorStop(0, "rgba(255,255,255,.14)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    }
    var v = x.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.78);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, S.bg === "light" ? "rgba(60,40,20,.10)" : "rgba(0,0,0,.42)");
    x.fillStyle = v; x.fillRect(0, 0, W, H);
    return c;
  }

  function layout(preview) {
    var P = palette(), o = { P: P };
    o.bgCv = buildBg(P);
    o.glowCv = buildGlow(P.glow);
    o.badge = buildBadge(P, preview);
    var hl = headlineLines(S.text);
    o.size = hl.size;
    o.lines = hl.lines.map(function (l, i, a) {
      var col = a.length > 1 && i === a.length - 1 ? P.accent : P.text;
      return textCanvas(l, "800 " + Math.round(hl.size) + "px " + FONT_HEAD, col, 0, 30);
    });
    var name = S.name.trim().toUpperCase();
    o.name = name ? textCanvas(name, "700 30px " + FONT_MONO, S.bg === "brand" ? P.text : P.accent, 9, 20) : null;
    if (o.name && o.name.width > 980) o.name = textCanvas(name, "700 24px " + FONT_MONO, S.bg === "brand" ? P.text : P.accent, 5, 20);
    var url = S.url.trim();
    o.pill = null;
    if (url) {
      var fs = 46; tctx.font = "800 " + fs + "px " + FONT_BODY;
      while (tctx.measureText(url).width > 760 && fs > 28) { fs -= 2; tctx.font = "800 " + fs + "px " + FONT_BODY; }
      var tw = tctx.measureText(url).width, ar = fs * 0.9, ph = Math.round(fs * 2.5), pw = tw + ar + fs * 0.55 + fs * 2.4;
      var pc = mk(pw + 80, ph + 80), x = pc.getContext("2d"), px = 40, py = 40;
      if (S.bg === "dark") { x.shadowColor = rgba(P.pill, 0.45); x.shadowBlur = 40; }
      x.fillStyle = P.pill; rr(x, px, py, pw, ph, ph / 2); x.fill(); x.shadowBlur = 0;
      x.fillStyle = P.pillText; x.font = "800 " + fs + "px " + FONT_BODY; x.textBaseline = "middle";
      var tx = px + fs * 1.2; x.fillText(url, tx, py + ph / 2 + fs * 0.04);
      // Pfeil gezeichnet (kein Schriftzeichen nötig)
      var ax = tx + tw + fs * 0.55, ay = py + ph / 2; x.strokeStyle = P.pillText; x.lineWidth = Math.max(3, fs * 0.09); x.lineCap = "round"; x.lineJoin = "round";
      x.beginPath(); x.moveTo(ax, ay); x.lineTo(ax + ar, ay); x.moveTo(ax + ar * 0.55, ay - ar * 0.42); x.lineTo(ax + ar, ay); x.lineTo(ax + ar * 0.55, ay + ar * 0.42); x.stroke();
      o.pill = pc; o.pillPad = 40;
    }
    o.credit = textCanvas("Gemacht mit tim-kofler.at", "500 25px " + FONT_MONO, S.bg === "brand" ? rgba(P.text, 0.6) : rgba(P.sub, S.bg === "light" ? 0.85 : 0.75), 1.5, 10);

    // senkrecht stapeln, Mitte etwas über der Bildmitte (Instagram-Bedienleisten oben/unten frei lassen)
    var items = [], gap = { badge: 84, name: 30, lines: 72 };
    if (o.badge) items.push({ k: "badge", h: o.badge.height - (o.badge.round ? 20 : 8) });
    if (o.name) items.push({ k: "name", h: o.name.inkH });
    if (o.lines.length) items.push({ k: "lines", h: o.lines.length * hl.size * 1.1 - hl.size * 0.1 });
    if (o.pill) items.push({ k: "pill", h: o.pill.height - 80 });
    var total = 0; items.forEach(function (it, i) { total += it.h + (i < items.length - 1 ? (gap[it.k] || 60) : 0); });
    var y = Math.max(300, 930 - total / 2);
    items.forEach(function (it) { o[it.k + "Y"] = y; y += it.h + (gap[it.k] || 60); });
    o.lineH = hl.size * 1.1;
    o.cy = o.badge ? o.badgeY + (o.badge.height - (o.badge.round ? 20 : 8)) / 2 : (o.linesY || 900);
    o.creditY = 1650;
    // Funken (fester Zufall, damit Vorschau = Video)
    var r = rand(7), sp = [];
    for (var i = 0; i < 90; i++) { var a = r() * Math.PI * 2, v = 700 + r() * 1500; sp.push({ a: a, v: v, s: 2 + r() * 5, life: 0.7 + r() * 0.9, w: r() < 0.35 }); }
    o.sparks = sp;
    var d = []; for (var j = 0; j < 26; j++) d.push({ x: r() * W, y: 300 + r() * 1300, s: 1.5 + r() * 3.5, v: 20 + r() * 50, ph: r() * 6.28 });
    o.dust = d;
    o.preview = !!preview;
    return o;
  }

  /* ---------- Zeichnen ---------- */
  function drawEl(c, x, y, alpha, scale, sx) {
    if (alpha <= 0.002 || !c) return;
    ctx.globalAlpha = Math.min(1, alpha);
    if (scale === 1 && !sx) { ctx.drawImage(c, x - c.width / 2, y); }
    else { ctx.save(); var cy = y + c.height / 2; ctx.translate(x, cy); ctx.scale(scale * (sx || 1), scale); ctx.drawImage(c, -c.width / 2, -c.height / 2); ctx.restore(); }
    ctx.globalAlpha = 1;
  }
  // Glanzstreifen nur auf den Pixeln von src (source-atop auf einer Zwischenfläche)
  function withSheen(src, p, strength) {
    if (p <= 0 || p >= 1) return src;
    if (tmp.width !== src.width || tmp.height !== src.height) { tmp.width = src.width; tmp.height = src.height; } else tctx.clearRect(0, 0, tmp.width, tmp.height);
    tctx.globalCompositeOperation = "source-over"; tctx.drawImage(src, 0, 0);
    tctx.globalCompositeOperation = "source-atop";
    var w = src.width, h = src.height, band = Math.max(w, h) * 0.32, cx = -band + (w + h * 0.6 + band * 2) * p;
    var g = tctx.createLinearGradient(cx - band, 0, cx + band, h * 0.35);
    g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, "rgba(255,255,255," + strength + ")"); g.addColorStop(1, "rgba(255,255,255,0)");
    tctx.fillStyle = g; tctx.fillRect(0, 0, w, h);
    tctx.globalCompositeOperation = "source-over";
    return tmp;
  }
  // Echte Perspektive mit senkrechten Streifen (Logo dreht sich um die Hochachse)
  var pcv = mk(8, 8), pctx = pcv.getContext("2d");
  function drawPersp(src, cx, cy, ang, scale, alpha, shade) {
    var w = src.width, h = src.height, N = 64, D = 1500, c = Math.cos(ang), s = Math.sin(ang);
    var bw = Math.ceil(w * scale * 1.35 + 4), bh = Math.ceil(h * scale * 1.35 + 4);
    if (pcv.width < bw || pcv.height < bh) { pcv.width = Math.max(pcv.width, bw); pcv.height = Math.max(pcv.height, bh); }
    pctx.clearRect(0, 0, pcv.width, pcv.height);
    var ox = bw / 2, oy = bh / 2, drawn = false;
    for (var i = 0; i < N; i++) {
      var u0 = i / N - 0.5, u1 = (i + 1) / N - 0.5;
      var z0 = u0 * w * s * scale, z1 = u1 * w * s * scale, p0 = D / (D + z0), p1 = D / (D + z1);
      var X0 = u0 * w * c * scale * p0, X1 = u1 * w * c * scale * p1, dw = X1 - X0;
      if (dw <= 0.05) continue;
      var hm = h * scale * (p0 + p1) / 2;
      pctx.drawImage(src, i * w / N, 0, w / N, h, ox + X0, oy - hm / 2, dw + 0.7, hm);
      drawn = true;
    }
    if (!drawn) return;
    if (shade > 0.01) { // Schattierung + wandernder Glanz, nur auf den Logo-Pixeln
      pctx.globalCompositeOperation = "source-atop";
      pctx.fillStyle = "rgba(0,0,0," + (shade * 0.55) + ")"; pctx.fillRect(0, 0, bw, bh);
      var gx = ox + Math.sin(ang) * bw * 0.9, g = pctx.createLinearGradient(gx - bw * 0.25, 0, gx + bw * 0.25, 0);
      g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, "rgba(255,255,255," + (shade * 0.5) + ")"); g.addColorStop(1, "rgba(255,255,255,0)");
      pctx.fillStyle = g; pctx.fillRect(0, 0, bw, bh);
      pctx.globalCompositeOperation = "source-over";
    }
    ctx.globalAlpha = alpha; ctx.drawImage(pcv, 0, 0, bw, bh, cx - ox, cy - oy, bw, bh); ctx.globalAlpha = 1;
  }

  function glow(o, a, scale) {
    if (a <= 0) return;
    var s = 1000 * (scale || 1);
    ctx.globalAlpha = a * o.P.glowA * 4; if (o.P.add) ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(o.glowCv, W / 2 - s / 2, o.cy - s / 2, s, s);
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
  }

  function render(t) {
    var o = L; if (!o) return;
    var dur = S.dur, k = dur < 4 ? dur / 4 : 1, tb = t / k, P = o.P;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(o.bgCv, 0, 0);
    // ganz langsamer Zoom über die ganze Länge (hält das Bild lebendig, auch im letzten Standbild)
    var z = 1 + 0.035 * eInOut(clamp(t / dur, 0, 1));
    ctx.translate(W / 2, o.cy); ctx.scale(z, z); ctx.translate(-W / 2, -o.cy);

    var st = S.style, b = o.badge, bx = W / 2, by = o.cy, i;
    var nameA = 0, nameDy = 0, nameSx = 1, pillA = 0, pillS = 1, pillDy = 0;

    if (st === "dreh") {
      glow(o, eOut(seg(tb, 0.2, 1.3)), 0.8 + 0.2 * eOut(seg(tb, 0.2, 1.3)));
      if (b) {
        var p = seg(tb, 0.05, 1.45), ang = (1 - eBack(p, 1.15)) * (-1.75);
        var idle = seg(tb, 1.45, 2.4); ang += Math.sin((tb - 1.45) * 1.6) * 0.07 * eInOut(idle);
        drawPersp(b, bx, by, ang, 0.72 + 0.28 * eOut(p), clamp(seg(tb, 0.05, 0.45), 0, 1), Math.min(1, Math.abs(Math.sin(ang)) * 1.4));
      }
      nameA = eOut(seg(tb, 0.75, 1.25)); nameDy = 26 * (1 - nameA);
      for (i = 0; i < o.lines.length; i++) { var q = seg(tb, 0.85 + 0.12 * i, 1.5 + 0.12 * i), e = eOut(q); drawEl(o.lines[i], W / 2, o.linesY + i * o.lineH - 30 + 56 * (1 - e), q, 1); }
      var pp = seg(tb, 1.35, 1.9); pillA = pp; pillS = 0.88 + 0.12 * eBack(pp, 1.7);
    } else if (st === "glanz") {
      glow(o, eOut(seg(tb, 0, 1.4)), 1);
      if (b) {
        var g1 = eOut(seg(tb, 0, 0.95)), src = withSheen(b, seg(tb, 1.0, 1.85), 0.75);
        drawEl(src, bx, by - b.height / 2 + 18 * (1 - g1), g1, 1.07 - 0.07 * g1);
      }
      // feine Lichtlinie zwischen Logo und Text
      var lp = eOutExpo(seg(tb, 0.35, 1.3)), ly = (o.name ? o.nameY : o.linesY || by + 260) - 44;
      if (lp > 0 && b) {
        var lw = 620 * lp, lg2 = ctx.createLinearGradient(W / 2 - lw / 2, 0, W / 2 + lw / 2, 0);
        lg2.addColorStop(0, rgba(P.glow, 0)); lg2.addColorStop(0.5, rgba(P.glow, 0.9)); lg2.addColorStop(1, rgba(P.glow, 0));
        ctx.fillStyle = lg2; ctx.fillRect(W / 2 - lw / 2, ly - 1.5, lw, 3);
      }
      nameA = eOut(seg(tb, 0.6, 1.15));
      for (i = 0; i < o.lines.length; i++) {
        var c = o.lines[i], wp = eInOut(seg(tb, 0.8 + 0.16 * i, 1.55 + 0.16 * i)), yy = o.linesY + i * o.lineH - 30;
        if (wp <= 0) continue;
        var srcL = withSheen(c, seg(tb, 2.0 + 0.1 * i, 2.75 + 0.1 * i), 0.6), x0 = W / 2 - c.width / 2, cw = c.width * wp;
        ctx.save(); ctx.beginPath(); ctx.rect(x0, yy, cw, c.height); ctx.clip(); ctx.drawImage(srcL, x0, yy); ctx.restore();
        if (wp < 1) { // leuchtende Kante am Wisch
          var ex = x0 + cw, eg = ctx.createLinearGradient(ex - 40, 0, ex + 6, 0);
          eg.addColorStop(0, rgba(P.glow, 0)); eg.addColorStop(1, rgba(P.glow, 0.85));
          ctx.fillStyle = eg; ctx.fillRect(ex - 40, yy + 18, 46, c.height - 36);
        }
      }
      pillA = eOut(seg(tb, 1.5, 2.05)); pillDy = 22 * (1 - pillA);
      if (o.pill) o._pillSrc = withSheen(o.pill, seg(tb, 2.2, 2.95), 0.55);
    } else if (st === "funken") {
      glow(o, eOut(seg(tb, 0.25, 0.9)) * (1 + 0.25 * Math.sin(tb * 2.2) * seg(tb, 1, 2)), 0.9);
      // Ringe
      var R0 = b ? (b.round || Math.min(b.width, b.height) / 2) : 160;
      for (var j = 0; j < 3; j++) {
        var rp = seg(tb, 0.18 + 0.16 * j, 1.35 + 0.16 * j); if (rp <= 0 || rp >= 1) continue;
        ctx.strokeStyle = rgba(j === 1 ? P.text : P.glow, Math.pow(1 - rp, 1.4) * 0.9); ctx.lineWidth = 9 * (1 - rp) + 1.5;
        ctx.beginPath(); ctx.arc(bx, by, R0 * 0.9 + 560 * eOut(rp), 0, Math.PI * 2); ctx.stroke();
      }
      // Funken
      var ft = tb - 0.36;
      if (ft > 0) {
        if (P.add) ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
        o.sparks.forEach(function (s) {
          if (ft > s.life) return;
          var kk = 3.2, d1 = s.v * (1 - Math.exp(-kk * ft)) / kk, d0 = s.v * (1 - Math.exp(-kk * Math.max(0, ft - 0.045))) / kk, gy = 260 * ft * ft;
          var x1 = bx + Math.cos(s.a) * (R0 * 0.6 + d1), y1 = by + Math.sin(s.a) * (R0 * 0.6 + d1) + gy;
          var x0 = bx + Math.cos(s.a) * (R0 * 0.6 + d0), y0 = by + Math.sin(s.a) * (R0 * 0.6 + d0) + 260 * Math.pow(Math.max(0, ft - 0.045), 2);
          ctx.strokeStyle = rgba(s.w ? (S.bg === "light" ? P.text : "#ffffff") : P.glow, Math.pow(1 - ft / s.life, 1.4));
          ctx.lineWidth = s.s; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        });
        ctx.globalCompositeOperation = "source-over";
      }
      // leiser Funkenstaub
      var da = seg(tb, 0.9, 1.6);
      if (da > 0) o.dust.forEach(function (d) {
        var yy2 = d.y - d.v * tb, a2 = da * (0.25 + 0.35 * (0.5 + 0.5 * Math.sin(tb * 3 + d.ph)));
        ctx.fillStyle = rgba(P.glow, a2); ctx.beginPath(); ctx.arc(d.x, yy2, d.s, 0, Math.PI * 2); ctx.fill();
      });
      if (b) { var bp = seg(tb, 0.2, 0.85); drawEl(b, bx, by - b.height / 2, seg(tb, 0.2, 0.32), Math.max(0, eBack(bp, 2.1))); }
      nameA = eOut(seg(tb, 0.7, 1.1)); nameDy = 16 * (1 - nameA);
      for (i = 0; i < o.lines.length; i++) { var fq = seg(tb, 0.8 + 0.1 * i, 1.32 + 0.1 * i); drawEl(o.lines[i], W / 2, o.linesY + i * o.lineH - 30, Math.min(1, fq * 2), 0.72 + 0.28 * eBack(fq, 1.9)); }
      var fp = seg(tb, 1.25, 1.75); pillA = Math.min(1, fp * 2); pillS = 0.7 + 0.3 * eBack(fp, 2);
    } else { // edel
      glow(o, eInOut(seg(tb, 0, 1.9)), 1);
      if (b) {
        var ep = eInOut(seg(tb, 0.15, 1.6)); drawEl(b, bx, by - b.height / 2, ep, 0.965 + 0.035 * ep);
        var ap = eInOut(seg(tb, 0.55, 2.1));
        if (ap > 0 && b.round) {
          ctx.strokeStyle = rgba(S.bg === "brand" ? P.text : P.accent, 0.75); ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(bx, by, b.round + 30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ap); ctx.stroke();
        } else if (ap > 0) {
          var hw = 300 * ap, hy = by + (b.height / 2) + 28;
          ctx.fillStyle = rgba(S.bg === "brand" ? P.text : P.accent, 0.7); ctx.fillRect(W / 2 - hw, hy, hw * 2, 2.5);
        }
      }
      nameA = eInOut(seg(tb, 0.9, 1.75)); nameSx = 1.06 - 0.06 * nameA;
      for (i = 0; i < o.lines.length; i++) { var lq = eInOut(seg(tb, 1.1 + 0.2 * i, 2.05 + 0.2 * i)); drawEl(o.lines[i], W / 2, o.linesY + i * o.lineH - 30 + 18 * (1 - lq), lq, 1); }
      pillA = eInOut(seg(tb, 1.8, 2.55));
    }

    if (o.name) drawEl(o.name, W / 2, o.nameY - o.name.pad + nameDy, nameA, 1, nameSx !== 1 ? nameSx : 0);
    if (o.pill) {
      var ps = st === "glanz" && o._pillSrc ? o._pillSrc : o.pill;
      drawEl(ps, W / 2, o.pillY - o.pillPad + pillDy, pillA, pillS);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawEl(o.credit, W / 2, o.creditY, eOut(seg(tb, 1.9, 2.5)), 1);
  }

  /* ---------- Vorschau-Schleife ---------- */
  var playing = !reduce, t0 = 0, raf = 0, visible = true, recording = false, HOLD = 1.3, frozenT = null;
  var playBtn = $("[data-sa-play]");
  function setPlayUI() { if (playBtn) { playBtn.setAttribute("aria-pressed", playing ? "true" : "false"); playBtn.setAttribute("aria-label", playing ? "Vorschau anhalten" : "Vorschau abspielen"); playBtn.classList.toggle("is-playing", playing); } }
  function loop(now) {
    raf = 0;
    if (recording) return;
    var t = (now - t0) / 1000;
    if (t > S.dur + HOLD) {
      if (reduce) { playing = false; setPlayUI(); render(S.dur); return; }
      t0 = now; t = 0;
    }
    render(Math.min(t, S.dur));
    if (playing && visible) raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf && playing && visible && !recording) raf = requestAnimationFrame(loop); }
  function restart() { t0 = performance.now(); if (playing) kick(); else render(S.dur); }
  function showEnd() { // nach Text-/Farbänderung gleich das fertige Bild zeigen
    if (!playing) { render(S.dur); return; }
    var t = (performance.now() - t0) / 1000;
    if (t < S.dur) t0 = performance.now() - S.dur * 1000;
    kick();
  }
  var pending = 0;
  function relayout(mode) {
    if (pending) return;
    pending = requestAnimationFrame(function () {
      pending = 0; L = layout(true);
      if (mode === "restart") restart(); else showEnd();
    });
  }
  if (playBtn) playBtn.addEventListener("click", function () {
    if (recording) return;
    playing = !playing; setPlayUI();
    if (playing) { t0 = performance.now(); kick(); } else { cancelAnimationFrame(raf); raf = 0; render(S.dur); }
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) kick(); }).observe(cv);
  }

  /* ---------- Logo laden (FileReader -> data:-URL, nie blob:) ---------- */
  var drop = $("[data-sa-drop]"), file = $("#sa-file"), logoInfo = $("[data-sa-logoinfo]"), sw = $("[data-sa-suggest]"), msg = $("[data-sa-logomsg]");
  function say(el, txt) { if (!el) return; el.textContent = txt || ""; el.hidden = !txt; }

  function svgSized(text) {
    // SVGs ohne width/height bekommen eine feste Größe aus der viewBox, sonst zeichnen manche Browser sie winzig
    try {
      var doc = new DOMParser().parseFromString(text, "image/svg+xml"), s = doc.documentElement;
      if (!s || s.nodeName.toLowerCase() !== "svg") return null;
      var vb = (s.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number), w = parseFloat(s.getAttribute("width")), h = parseFloat(s.getAttribute("height"));
      var ar = vb.length === 4 && vb[2] > 0 && vb[3] > 0 ? vb[2] / vb[3] : (w > 0 && h > 0 ? w / h : 1);
      if (!(vb.length === 4 && vb[2] > 0) && w > 0 && h > 0 && !/%/.test(s.getAttribute("width"))) s.setAttribute("viewBox", "0 0 " + w + " " + h);
      var big = 1200; s.setAttribute("width", ar >= 1 ? big : Math.round(big * ar)); s.setAttribute("height", ar >= 1 ? Math.round(big / ar) : big);
      s.removeAttribute("style");
      return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(s));
    } catch (e) { return null; }
  }

  function analyse(img) {
    var max = 900, r = Math.min(1, max / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
    var w = Math.max(1, Math.round((img.naturalWidth || img.width) * r)), h = Math.max(1, Math.round((img.naturalHeight || img.height) * r));
    var c = mk(w, h), x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(img, 0, 0, w, h);
    // Leerraum rundherum wegschneiden (viele PNGs haben große durchsichtige Ränder)
    var data, crop = null;
    try { data = x.getImageData(0, 0, w, h).data; } catch (e) { data = null; }
    var out = { cv: c, w: w, h: h, plate: null, lum: 0.5, avg: [128, 128, 128], colors: [] };
    if (!data) return out;
    var x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (var yy = 0; yy < h; yy++) for (var xx = 0; xx < w; xx++) if (data[(yy * w + xx) * 4 + 3] > 12) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; }
    if (x1 < 0) return out;
    var corners = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]].map(function (p) { var i = (p[1] * w + p[0]) * 4; return [data[i], data[i + 1], data[i + 2], data[i + 3]]; });
    var opaque = corners.every(function (q) { return q[3] > 240; });
    if (opaque) {
      var avg = [0, 1, 2].map(function (k) { return corners.reduce(function (s, q) { return s + q[k]; }, 0) / 4; });
      out.plate = hex(avg);
    } else if (x1 - x0 + 1 < w || y1 - y0 + 1 < h) {
      var pad = 2; x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad);
      crop = mk(x1 - x0 + 1, y1 - y0 + 1); crop.getContext("2d").drawImage(c, x0, y0, crop.width, crop.height, 0, 0, crop.width, crop.height);
      out.cv = crop; out.w = crop.width; out.h = crop.height;
    }
    // Helligkeit und Farben (ohne Hintergrundfarbe der Fläche)
    var sum = 0, sw2 = 0, sr = 0, sg = 0, sb = 0, buckets = {}, step = Math.max(1, Math.floor(Math.sqrt(w * h / 6000)));
    var pl = out.plate ? rgb(out.plate) : null;
    for (var y2 = 0; y2 < h; y2 += step) for (var x2 = 0; x2 < w; x2 += step) {
      var i2 = (y2 * w + x2) * 4, a = data[i2 + 3] / 255; if (a < 0.5) continue;
      var R = data[i2], G = data[i2 + 1], B = data[i2 + 2];
      if (pl && Math.abs(R - pl[0]) + Math.abs(G - pl[1]) + Math.abs(B - pl[2]) < 40) continue;
      sum += lum(hex([R, G, B])) * a; sw2 += a; sr += R; sg += G; sb += B;
      var mx = Math.max(R, G, B) / 255, mn = Math.min(R, G, B) / 255, l = (mx + mn) / 2, d = mx - mn;
      if (d < 0.18 || l < 0.1 || l > 0.93) continue;
      var hh; if (mx === R / 255) hh = ((G - B) / 255 / d) % 6; else if (mx === G / 255) hh = (B - R) / 255 / d + 2; else hh = (R - G) / 255 / d + 4;
      var key = Math.round(((hh * 60 + 360) % 360) / 15);
      var bk = buckets[key] || (buckets[key] = { n: 0, r: 0, g: 0, b: 0 }); var wgt = d; bk.n += wgt; bk.r += R * wgt; bk.g += G * wgt; bk.b += B * wgt;
    }
    if (sw2) { out.lum = sum / sw2; out.avg = [sr / sw2, sg / sw2, sb / sw2]; }
    out.colors = Object.keys(buckets).map(function (k2) { var q = buckets[k2]; return { n: q.n, c: hex([q.r / q.n, q.g / q.n, q.b / q.n]) }; })
      .sort(function (a2, b2) { return b2.n - a2.n; })
      .filter(function (q, i3, arr) { return q.n > arr[0].n * 0.08; })
      .reduce(function (acc, q) { if (acc.every(function (p) { return contrast(p, q.c) > 1.25 || Math.abs(lum(p) - lum(q.c)) > 0.05; }) && acc.length < 4) acc.push(q.c); return acc; }, []);
    return out;
  }

  function setSuggest(colors) {
    if (!sw) return;
    sw.innerHTML = "";
    var wrap = $("[data-sa-suggestwrap]");
    if (wrap) wrap.hidden = !colors.length;
    colors.forEach(function (c) {
      var b = document.createElement("button"); b.type = "button"; b.className = "sa-sw"; b.setAttribute("data-color", c);
      b.setAttribute("aria-label", "Farbe aus dem Logo " + c); b.style.setProperty("--c", c); sw.appendChild(b);
    });
    markColor();
  }

  function useImage(url, name) {
    var img = new Image();
    img.decoding = "async";
    img.onload = function () {
      var a = analyse(img);
      try { a.cv.getContext("2d").getImageData(0, 0, 1, 1); } catch (e) {
        say(msg, "Dieses Logo lässt sich im Browser nicht verarbeiten. Bitte als PNG oder JPG versuchen."); return;
      }
      S.logo = a; say(msg, "");
      if (logoInfo) logoInfo.textContent = name;
      var th = $("[data-sa-thumb]");
      if (th) { th.src = url; }
      root.classList.add("has-logo");
      setSuggest(a.colors);
      if (a.colors.length && !S.colorTouched) setColor(a.colors[0], false);
      relayout("restart");
    };
    img.onerror = function () { say(msg, "Die Datei konnte nicht als Bild gelesen werden. Bitte PNG, JPG oder SVG wählen."); };
    img.src = url;
  }

  function readFile(f) {
    if (!f) return;
    if (f.size > 15 * 1024 * 1024) { say(msg, "Die Datei ist größer als 15 MB. Bitte ein kleineres Logo wählen."); return; }
    var isSvg = /svg/i.test(f.type) || /\.svg$/i.test(f.name);
    if (!isSvg && !/^image\/(png|jpe?g|webp|gif)$/i.test(f.type)) { say(msg, "Bitte ein Bild als PNG, JPG oder SVG wählen."); return; }
    var fr = new FileReader();
    fr.onload = function () {
      if (isSvg) { var u = svgSized(String(fr.result)); if (!u) { say(msg, "Diese SVG-Datei lässt sich nicht lesen."); return; } useImage(u, f.name); }
      else useImage(String(fr.result), f.name);
    };
    fr.onerror = function () { say(msg, "Die Datei konnte nicht gelesen werden."); };
    if (isSvg) fr.readAsText(f); else fr.readAsDataURL(f);
  }
  if (file) file.addEventListener("change", function () { readFile(file.files && file.files[0]); file.value = ""; });
  if (drop) {
    ["dragenter", "dragover"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("is-over"); }); });
    ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("is-over"); }); });
    drop.addEventListener("drop", function (e) { readFile(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]); });
  }
  var rm = $("[data-sa-remove]");
  if (rm) rm.addEventListener("click", function () {
    S.logo = null; root.classList.remove("has-logo"); setSuggest([]); var th = $("[data-sa-thumb]"); if (th) th.removeAttribute("src");
    relayout("restart"); if (file) file.focus();
  });

  /* ---------- Bedienelemente ---------- */
  function radios(name, key, mode, num) {
    $$('input[name="' + name + '"]').forEach(function (r) {
      r.addEventListener("change", function () { if (r.checked) { S[key] = num ? Number(r.value) : r.value; relayout(mode); updateBtn(); } });
    });
  }
  radios("sa-style", "style", "restart");
  radios("sa-dur", "dur", "restart", true);
  radios("sa-frame", "frame", "end");
  radios("sa-bg", "bg", "end");

  var txt = $("#sa-text"), presets = $$("[data-sa-preset]");
  function markPreset() { presets.forEach(function (p) { p.setAttribute("aria-pressed", p.getAttribute("data-sa-preset") === S.text ? "true" : "false"); }); }
  presets.forEach(function (p) {
    p.addEventListener("click", function () { S.text = p.getAttribute("data-sa-preset"); if (txt) txt.value = S.text; markPreset(); relayout("end"); });
  });
  if (txt) txt.addEventListener("input", function () {
    var v = txt.value, ls = v.split("\n"); if (ls.length > 3) { v = ls.slice(0, 3).join("\n"); txt.value = v; }
    S.text = v; markPreset(); relayout("end");
  });
  var nm = $("#sa-name"), ur = $("#sa-url");
  if (nm) nm.addEventListener("input", function () { S.name = nm.value; relayout("end"); });
  if (ur) ur.addEventListener("input", function () { S.url = ur.value; relayout("end"); });

  var picker = $("#sa-color"), hexOut = $("[data-sa-hex]");
  function markColor() {
    $$(".sa-sw").forEach(function (b) { b.setAttribute("aria-pressed", (b.getAttribute("data-color") || "").toLowerCase() === S.color.toLowerCase() ? "true" : "false"); });
    if (hexOut) hexOut.textContent = S.color.toUpperCase();
  }
  function setColor(c, touched) { S.color = c.toLowerCase(); if (touched) S.colorTouched = true; if (picker) picker.value = S.color; root.style.setProperty("--sa-brand", S.color); markColor(); relayout("end"); }
  root.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest(".sa-sw"); if (b && root.contains(b)) setColor(b.getAttribute("data-color"), true); });
  if (picker) picker.addEventListener("input", function () { setColor(picker.value, true); });

  var ig = $("#sa-ig");
  if (ig) ig.addEventListener("change", function () { root.classList.toggle("sa-hide-ig", !ig.checked); });

  // Tabs (nur am Handy sichtbar, am PC stehen alle Bereiche untereinander)
  var tabs = $$("[data-sa-tab]");
  tabs.forEach(function (tb) {
    tb.addEventListener("click", function () {
      var id = tb.getAttribute("data-sa-tab");
      tabs.forEach(function (x) { var on = x === tb; x.setAttribute("aria-selected", on ? "true" : "false"); x.tabIndex = on ? 0 : -1; });
      $$("[data-sa-panel]").forEach(function (p) { p.classList.toggle("is-on", p.getAttribute("data-sa-panel") === id); });
    });
    tb.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(tb), n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : -9;
      if (n === -9) return; e.preventDefault(); var to = tabs[(n + tabs.length) % tabs.length]; to.focus(); to.click();
    });
  });

  /* ---------- Aufnahme ----------
     1. Weg (bevorzugt): WebCodecs VideoEncoder (H.264) + kleiner MP4-Muxer unten. Jedes Bild wird einzeln gerechnet,
        dadurch genau 30 Bilder pro Sekunde und exakte Länge, egal wie schnell das Gerät ist.
     2. Weg (Ersatz): canvas.captureStream + MediaRecorder in Echtzeit (MP4, wenn der Browser es kann, sonst WebM). */
  var goBtn = $("[data-sa-go]"), bar = $("[data-sa-bar]"), barFill = $("[data-sa-barfill]"), status = $("[data-sa-status]"), result = $("[data-sa-result]");
  var dl = $("[data-sa-dl]"), shareBtn = $("[data-sa-share]"), fmtNote = $("[data-sa-fmt]"), lastUrl = null, lastFile = null;
  var TYPES = ["video/mp4;codecs=avc1.640028", "video/mp4;codecs=avc1.4d0028", "video/mp4;codecs=avc1", "video/mp4",
    "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  function pickType() {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported || !cv.captureStream) return null;
    for (var i = 0; i < TYPES.length; i++) if (MediaRecorder.isTypeSupported(TYPES[i])) return TYPES[i];
    return "";
  }
  var TYPE = pickType(), WC = null; // WC = unterstützte VideoEncoder-Konfiguration
  function setFormat() { root.setAttribute("data-format", WC || (TYPE && TYPE.indexOf("video/mp4") === 0) ? "mp4" : TYPE == null ? "none" : "webm"); }
  setFormat();
  var wcReady = (function () {
    if (!window.VideoEncoder || !window.VideoFrame || !VideoEncoder.isConfigSupported) return Promise.resolve(null);
    var codecs = ["avc1.640028", "avc1.4d0028", "avc1.42e028"], i = 0;
    function next() {
      if (i >= codecs.length) return Promise.resolve(null);
      var cfg = { codec: codecs[i++], width: W, height: H, bitrate: 10000000, framerate: FPS, avc: { format: "avc" } };
      return VideoEncoder.isConfigSupported(cfg).then(function (r) { return r && r.supported ? cfg : next(); }, next);
    }
    return next().then(function (c) { WC = c; setFormat(); return c; });
  })();
  function updateBtn() { if (goBtn) { var l = goBtn.querySelector("[data-sa-golabel]"); if (l) l.textContent = "Video erstellen (" + S.dur + " Sek.)"; } }
  updateBtn();

  function slug(s) { return (s || "").toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30); }
  function mb(n) { return (n / 1048576).toLocaleString("de-AT", { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + " MB"; }
  function lock(on) {
    root.classList.toggle("is-rec", on);
    $$(".sa-controls input, .sa-controls textarea, .sa-controls button, [data-sa-play]").forEach(function (el) { el.disabled = on; });
    if (goBtn) goBtn.disabled = on;
  }
  function progress(p) { if (barFill) barFill.style.transform = "scaleX(" + clamp(p, 0, 1).toFixed(3) + ")"; }
  function begin(text) {
    recording = true; lock(true); cancelAnimationFrame(raf); raf = 0;
    if (result) result.hidden = true;
    if (bar) bar.hidden = false; progress(0);
    say(status, text);
    L = layout(false);
  }
  function finish(blob, errText) {
    recording = false; lock(false);
    if (bar) bar.hidden = true;
    L = layout(true);
    if (errText || !blob || !blob.size) { say(status, errText || "Das Video ist leer geblieben. Bitte nochmal versuchen."); restart(); return; }
    var type = blob.type || "video/mp4", ext = type.indexOf("mp4") > -1 ? "mp4" : "webm";
    if (lastUrl) URL.revokeObjectURL(lastUrl);
    lastUrl = URL.createObjectURL(blob); // nur für den Download-Link, nie als Bild- oder Videoquelle (CSP)
    var fname = "story-abspann" + (slug(S.name) ? "-" + slug(S.name) : "") + "." + ext;
    try { lastFile = new File([blob], fname, { type: type }); } catch (e) { lastFile = null; }
    if (dl) { dl.href = lastUrl; dl.download = fname; var dlt = dl.querySelector("[data-sa-dltext]"); if (dlt) dlt.textContent = "Herunterladen (" + ext.toUpperCase() + ", " + mb(blob.size) + ")"; }
    var canShare = false; try { canShare = !!(lastFile && navigator.canShare && navigator.canShare({ files: [lastFile] })); } catch (e) {}
    if (shareBtn) shareBtn.hidden = !canShare;
    root.setAttribute("data-out", ext);
    if (fmtNote) fmtNote.hidden = ext !== "webm";
    say(status, "");
    if (result) result.hidden = false;
    if (dl) dl.focus({ preventScroll: true });
    restart();
  }

  function record() {
    if (recording) return;
    wcReady.then(function (cfg) {
      if (cfg) encodeMp4(cfg).catch(function () { if (TYPE != null) recordRealtime(); else finish(null, "Das Video konnte nicht erstellt werden. Bitte nochmal versuchen."); });
      else if (TYPE != null) recordRealtime();
      else say(status, "Dein Browser kann leider keine Videos erstellen. Bitte aktuelles Chrome, Edge oder Safari verwenden.");
    });
  }

  function encodeMp4(cfg) {
    return new Promise(function (resolve, reject) {
      begin("Video wird erstellt …");
      var n = Math.round(S.dur * FPS), samples = [], desc = null, failed = null, i = 0;
      var enc = new VideoEncoder({
        output: function (chunk, meta) {
          if (meta && meta.decoderConfig && meta.decoderConfig.description && !desc) {
            var d = meta.decoderConfig.description; desc = new Uint8Array(d.buffer ? d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength) : d.slice(0));
          }
          var buf = new Uint8Array(chunk.byteLength); chunk.copyTo(buf);
          samples.push({ data: buf, key: chunk.type === "key", ts: chunk.timestamp });
        },
        error: function (e) { failed = e; }
      });
      try { enc.configure(cfg); } catch (e) { recording = false; lock(false); if (bar) bar.hidden = true; reject(e); return; }
      function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
      function step() {
        if (failed) return Promise.reject(failed);
        if (i >= n) return enc.flush();
        if (enc.encodeQueueSize > 3) return wait(4).then(step);
        render(i / FPS);
        var fr = new VideoFrame(cv, { timestamp: Math.round(i * 1e6 / FPS), duration: Math.round(1e6 / FPS) });
        enc.encode(fr, { keyFrame: i % (FPS * 2) === 0 }); fr.close();
        i++; progress(i / n);
        return wait(0).then(step);
      }
      step().then(function () {
        enc.close();
        if (failed || !desc || samples.length !== n) throw failed || new Error("unvollständig");
        resolve(); finish(new Blob([muxMp4(samples, desc, W, H, FPS)], { type: "video/mp4" }));
      }).catch(function (e) {
        try { enc.close(); } catch (x) {}
        recording = false; lock(false); if (bar) bar.hidden = true; L = layout(true);
        reject(e);
      });
    });
  }

  /* Kleiner MP4-Muxer (eine H.264-Spur, moov vorne = schnell abspielbar) */
  function muxMp4(smp, avcC, w, h, fps) {
    var TS = fps * 1000, DT = 1000, N = smp.length;
    function u8(n) { return [n & 255]; } function u16(n) { return [n >> 8 & 255, n & 255]; }
    function u32(n) { return [n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, n & 255]; }
    function str(s) { return s.split("").map(function (c) { return c.charCodeAt(0); }); }
    function box(type) {
      var parts = Array.prototype.slice.call(arguments, 1), len = 8;
      parts.forEach(function (p) { len += p.length; });
      var out = new Uint8Array(len), o = 8; out.set(u32(len), 0); out.set(str(type), 4);
      parts.forEach(function (p) { out.set(p, o); o += p.length; });
      return out;
    }
    function cat(arrs) { var len = 0; arrs.forEach(function (a) { len += a.length; }); var o = new Uint8Array(len), p = 0; arrs.forEach(function (a) { o.set(a, p); p += a.length; }); return o; }
    function A() { var a = []; for (var i = 0; i < arguments.length; i++) a = a.concat(arguments[i]); return new Uint8Array(a); }
    var MATRIX = [].concat(u32(0x10000), u32(0), u32(0), u32(0), u32(0x10000), u32(0), u32(0), u32(0), u32(0x40000000));
    var durMs = Math.round(N * 1000 / fps);
    // Bildreihenfolge prüfen (B-Frames -> ctts + Editliste)
    var pts = smp.map(function (s) { return Math.round(s.ts * TS / 1e6); }), shift = 0, reorder = false;
    pts.forEach(function (p, i) { if (i * DT - p > shift) shift = i * DT - p; if (p !== i * DT) reorder = true; });
    var ftyp = box("ftyp", A(str("isom"), u32(512), str("isom"), str("iso2"), str("avc1"), str("mp41")));
    function moov(mdatOff) {
      var keys = []; smp.forEach(function (s, i) { if (s.key) keys.push(i + 1); });
      var stsz = [].concat(u32(0), u32(0), u32(N)); smp.forEach(function (s) { stsz = stsz.concat(u32(s.data.length)); });
      var stss = [].concat(u32(0), u32(keys.length)); keys.forEach(function (k) { stss = stss.concat(u32(k)); });
      var stblParts = [
        box("stsd", A(u32(0), u32(1)), box("avc1", A([0, 0, 0, 0, 0, 0], u16(1), u16(0), u16(0), u32(0), u32(0), u32(0), u16(w), u16(h), u32(0x480000), u32(0x480000), u32(0), u16(1), new Array(32).fill(0), u16(0x18), u16(0xffff)), box("avcC", avcC))),
        box("stts", A(u32(0), u32(1), u32(N), u32(DT))),
        box("stss", new Uint8Array(stss))
      ];
      if (reorder) { var ct = [].concat(u32(0), u32(N)); pts.forEach(function (p, i) { ct = ct.concat(u32(1), u32(p + shift - i * DT)); }); stblParts.push(box("ctts", new Uint8Array(ct))); }
      stblParts.push(box("stsc", A(u32(0), u32(1), u32(1), u32(N), u32(1))), box("stsz", new Uint8Array(stsz)), box("stco", A(u32(0), u32(1), u32(mdatOff))));
      var stbl = box.apply(null, ["stbl"].concat(stblParts));
      var minf = box("minf", box("vmhd", A(u32(1), u16(0), u16(0), u16(0), u16(0))), box("dinf", box("dref", A(u32(0), u32(1)), box("url ", A(u32(1))))), stbl);
      var mdia = box("mdia", box("mdhd", A(u32(0), u32(0), u32(0), u32(TS), u32(N * DT), u16(0x55c4), u16(0))),
        box("hdlr", A(u32(0), u32(0), str("vide"), u32(0), u32(0), u32(0), str("VideoHandler"), [0])), minf);
      var trakParts = [box("tkhd", A(u32(3), u32(0), u32(0), u32(1), u32(0), u32(durMs), u32(0), u32(0), u16(0), u16(0), u16(0), u16(0), MATRIX, u32(w * 65536), u32(h * 65536)))];
      if (shift) trakParts.push(box("edts", box("elst", A(u32(0), u32(1), u32(durMs), u32(shift), u16(1), u16(0)))));
      trakParts.push(mdia);
      return box("moov", box("mvhd", A(u32(0), u32(0), u32(0), u32(1000), u32(durMs), u32(0x10000), u16(0x100), u16(0), u32(0), u32(0), MATRIX, u32(0), u32(0), u32(0), u32(0), u32(0), u32(0), u32(2))),
        box.apply(null, ["trak"].concat(trakParts)));
    }
    var dataLen = 0; smp.forEach(function (s) { dataLen += s.data.length; });
    var mv = moov(0), off = ftyp.length + mv.length + 8;
    mv = moov(off); // gleiche Länge, jetzt mit richtigem Offset
    var mdatHead = new Uint8Array(8); mdatHead.set(u32(dataLen + 8), 0); mdatHead.set(str("mdat"), 4);
    return cat([ftyp, mv, mdatHead].concat(smp.map(function (s) { return s.data; })));
  }

  function recordRealtime() {
    var stream;
    try { stream = cv.captureStream(FPS); } catch (e) { say(status, "Das Video konnte nicht aufgenommen werden. Bitte das Logo als PNG versuchen."); return; }
    var opts = { videoBitsPerSecond: 12000000 }; if (TYPE) opts.mimeType = TYPE;
    var rec; try { rec = new MediaRecorder(stream, opts); } catch (e) { try { rec = new MediaRecorder(stream); } catch (e2) { say(status, "Die Aufnahme wird von deinem Browser nicht unterstützt."); return; } }
    var chunks = [], aborted = false, dur = S.dur;
    begin("Wird aufgenommen … bitte diese Seite offen lassen.");
    rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = function () {
      stream.getTracks().forEach(function (tr) { tr.stop(); });
      document.removeEventListener("visibilitychange", onHide);
      if (aborted) { finish(null, "Die Aufnahme wurde abgebrochen, weil die Seite im Hintergrund war. Bitte nochmal starten und die Seite offen lassen."); return; }
      var type = (rec.mimeType || TYPE || "video/webm").split(";")[0];
      finish(new Blob(chunks, { type: type }));
    };
    function onHide() { if (document.hidden && rec.state === "recording") { aborted = true; rec.stop(); } }
    document.addEventListener("visibilitychange", onHide);
    render(0);
    rec.start(250);
    var start = performance.now() + 120, stopAt = dur + 0.25;
    function frame(now) {
      if (aborted || rec.state !== "recording") return;
      var t = Math.max(0, (now - start) / 1000);
      render(Math.min(t, dur)); progress(t / stopAt);
      if (t >= stopAt) { rec.stop(); return; }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (goBtn) goBtn.addEventListener("click", record);
  if (shareBtn) shareBtn.addEventListener("click", function () {
    if (!lastFile) return;
    navigator.share({ files: [lastFile], title: "Story-Abspann" }).catch(function () {});
  });

  /* ---------- Start ---------- */
  setPlayUI(); markPreset(); markColor();
  root.style.setProperty("--sa-brand", S.color);
  if (txt) txt.value = S.text;
  var fontsReady = document.fonts && document.fonts.load ? Promise.all([
    document.fonts.load("800 100px Unbounded"), document.fonts.load("800 40px Manrope"), document.fonts.load("700 30px \"JetBrains Mono\""), document.fonts.load("500 25px \"JetBrains Mono\"")
  ]).catch(function () {}) : Promise.resolve();
  L = layout(true); restart();
  fontsReady.then(function () { L = layout(true); restart(); root.classList.add("is-ready"); });

  // Für automatische Tests: Logo per data:-URL setzen und Aufnahme starten
  window.tkAbspann = { record: record, realtime: function () { recordRealtime(); }, state: S, render: function (t) { render(t); } };
})();
