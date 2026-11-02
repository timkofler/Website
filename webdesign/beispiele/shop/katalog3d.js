// Das Buch des Blätterkatalogs in WebGL: Papierseiten als Canvas-Texturen, das umgeschlagene Blatt biegt sich
// entlang seiner Länge (die Länge bleibt gleich, nur der Winkel ändert sich), bekommt Licht, Glanz und wirft Schatten
// auf die Seite darunter. Jedes Produkt dreht sich in einer eigenen kleinen Szene, die in eine Textur gerendert
// und auf die Seite gelegt wird, damit es sich beim Umblättern mit dem Papier mitbiegt.
// Gerendert wird nur, solange das Buch sichtbar ist (stage3d hält die Schleife sonst an).
import { stage, mobile } from "/beispiele/_shared/stage3d.js?v=2";
import { build, pear } from "/beispiele/shop/katalog-produkte.js?v=3fcb5ab8";

var SERIF = '"Fraunces", Georgia, serif', SANS = '"Outfit", system-ui, sans-serif';
export var ASPECT = { spread: 1.38, single: 1.48 };
var PAPER = "#f6efe2", INK = "#2a1d12", MUTED = "#6d5a47", GOLD_T = "#98530b", COVER = "#24170f";

function cl(v, a, b) { return v < a ? a : v > b ? b : v; }
function sine(t) { return .5 - .5 * Math.cos(Math.PI * t); }
function outC(t) { return 1 - Math.pow(1 - t, 3); }

// Aufteilung einer Seite in CSS-Pixeln. Dieselben Zahlen setzen den echten Knopf (DOM) über die Textur.
export function layout(w, h) {
  var m = Math.round(w * .075), small = w < 420, L = { m: m, small: small };
  L.head = Math.max(9.5, w * .021);
  L.ruleY = Math.round(m + L.head * 1.15);
  L.btn = { right: m, bottom: Math.round(m * .8), h: 44 };
  L.btn.top = h - L.btn.bottom - L.btn.h;
  var sy = L.ruleY + Math.round(h * .015);
  L.stage = { x: Math.round(m * .5), y: sy, w: Math.round(w - m), h: Math.round(h * (small ? .48 : .55) - sy) };
  L.fs = { kick: Math.max(10, w * .022), name: Math.max(21, w * .057), sub: Math.max(13, w * .03), desc: Math.max(13, w * .0285), price: Math.max(20, w * .05), unit: Math.max(11, w * .023) };
  return L;
}

/* ---------- Zeichnen ---------- */
function spaced(g, t, x, y, font, color, sp, align) {
  g.save(); g.font = font; g.fillStyle = color; g.textAlign = align || "left"; g.textBaseline = "alphabetic";
  if ("letterSpacing" in g) g.letterSpacing = (sp || 0) + "px";
  g.fillText(t, x, y); var w = g.measureText(t).width; g.restore(); return w;
}
function wrap(g, text, max) {
  var words = String(text).split(" "), lines = [], cur = "";
  words.forEach(function (w) { var t = cur ? cur + " " + w : w; if (g.measureText(t).width > max && cur) { lines.push(cur); cur = w; } else cur = t; });
  if (cur) lines.push(cur);
  return lines;
}
function para(g, text, x, y, max, lh, maxLines, font, color) {
  g.save(); g.font = font; g.fillStyle = color; g.textBaseline = "alphabetic";
  var ls = wrap(g, text, max);
  if (maxLines != null && ls.length > maxLines) {
    ls = ls.slice(0, Math.max(0, maxLines)); var last = ls[ls.length - 1] || "";
    while (last && g.measureText(last + " …").width > max) last = last.replace(/\s*\S+$/, "");
    if (ls.length) ls[ls.length - 1] = last + " …";
  }
  ls.forEach(function (l, i) { g.fillText(l, x, y + i * lh); });
  g.restore(); return ls.length;
}
function grain(g, w, h, a, seed) {
  var s = seed || 7; function r() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }
  g.save(); g.globalAlpha = a;
  for (var i = 0; i < w * h / 34; i++) { g.fillStyle = r() < .55 ? "#6b4a25" : "#ffffff"; g.fillRect(r() * w, r() * h, .7, .7); }
  g.globalAlpha = a * .5; g.strokeStyle = "#8a6a40"; g.lineWidth = .4;
  for (i = 0; i < 26; i++) { var x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (r() - .5) * 30, y + (r() - .5) * 30, x + (r() - .5) * 60, y + (r() - .5) * 60); g.stroke(); }
  g.restore();
}
function paper(g, w, h, seed) {
  g.fillStyle = PAPER; g.fillRect(0, 0, w, h);
  var gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "rgba(255,255,255,.35)"); gr.addColorStop(.6, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(150,110,60,.06)");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  grain(g, w, h, .07, seed);
}
function header(g, w, L, P) {
  var y = L.ruleY - Math.round(L.head * .55), outerRight = P.side !== "l";
  spaced(g, P.head.toUpperCase(), outerRight ? L.m : w - L.m, y, "600 " + L.head.toFixed(1) + "px " + SANS, MUTED, L.head * .22, outerRight ? "left" : "right");
  if (P.num != null) spaced(g, String(P.num), outerRight ? w - L.m : L.m, y + 1, "italic 500 " + (L.head * 1.5).toFixed(1) + "px " + SERIF, INK, 0, outerRight ? "right" : "left");
  g.fillStyle = "rgba(42,29,18,.22)"; g.fillRect(L.m, L.ruleY, w - 2 * L.m, 1);
}
function hexA(c, a) { var n = parseInt(c.slice(1), 16); return "rgba(" + (n >> 16) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a + ")"; }

function drawProd(g, w, h, L, P) {
  paper(g, w, h, P.f * 13 + 3); header(g, w, L, P);
  var st = L.stage, cx = st.x + st.w / 2, cy = st.y + st.h * .56, r = Math.min(st.w, st.h) * .47;
  var gr = g.createRadialGradient(cx, cy, r * .1, cx, cy, r);
  gr.addColorStop(0, hexA(P.c, .34)); gr.addColorStop(.7, hexA(P.c, .12)); gr.addColorStop(1, hexA(P.c, 0));
  g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = hexA(P.c, .45); g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, r * .86, 0, Math.PI * 2); g.stroke();
  if (P.badge) {
    g.save(); g.font = "600 " + L.fs.unit.toFixed(1) + "px " + SANS; var bw = g.measureText(P.badge).width + L.fs.unit * 1.6, bh = L.fs.unit * 1.9, bx = L.m, by = st.y + L.fs.unit * .6;
    g.fillStyle = "#f2b54a"; g.beginPath(); g.roundRect(bx, by, bw, bh, bh / 2); g.fill();
    g.fillStyle = "#2a1606"; g.textBaseline = "middle"; g.fillText(P.badge, bx + L.fs.unit * .8, by + bh / 2 + .5); g.restore();
  }
  var fs = L.fs, x = L.m, maxW = w - 2 * L.m, y = st.y + st.h + h * .045;
  g.fillStyle = "#f2b54a"; g.beginPath(); g.arc(x + 3, y - fs.kick * .36, 3, 0, 7); g.fill();
  spaced(g, P.kick.toUpperCase(), x + 13, y, "600 " + fs.kick.toFixed(1) + "px " + SANS, GOLD_T, fs.kick * .16);
  y += fs.name * 1.25;
  g.save(); var nf = fs.name; g.font = "600 " + nf + "px " + SERIF;
  var tw = g.measureText(P.name).width; if (tw > maxW) nf = Math.max(fs.name * .78, nf * maxW / tw);
  var nl = para(g, P.name, x, y, maxW, nf * 1.12, 2, "600 " + nf.toFixed(1) + "px " + SERIF, INK); g.restore();
  y += (nl - 1) * nf * 1.12 + fs.sub * 1.5;
  para(g, P.sub, x, y, maxW, fs.sub * 1.4, 1, "500 " + fs.sub.toFixed(1) + "px " + SANS, "#4e3c2b");
  y += fs.desc * 1.8;
  var lh = fs.desc * 1.5, room = Math.floor((L.btn.top - h * .03 - y) / lh) + 1;
  para(g, P.desc, x, y, maxW, lh, Math.max(1, room), "400 " + fs.desc.toFixed(1) + "px " + SANS, "#5b4734");
  // Fußzeile: Preis links, rechts liegt der echte Knopf
  var ry = L.btn.top - Math.round(h * .022);
  g.fillStyle = "rgba(42,29,18,.16)"; g.fillRect(L.m, ry, w - 2 * L.m, 1);
  var mid = L.btn.top + L.btn.h / 2;
  spaced(g, P.price, x, mid + fs.price * .12, "600 " + fs.price.toFixed(1) + "px " + SERIF, INK, 0);
  spaced(g, P.unit, x, mid + fs.price * .12 + fs.unit * 1.45, "500 " + fs.unit.toFixed(1) + "px " + SANS, P.low ? "#a8334f" : MUTED, 0);
}

function goldInk(g, w, h, foil) {
  if (foil) return "#ffffff";
  var gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, "#f7d58b"); gr.addColorStop(.35, "#d9a148"); gr.addColorStop(.55, "#f4cf7c"); gr.addColorStop(1, "#b9802f");
  return gr;
}
function emblem(g, cx, cy, r, ink, bg) {
  g.fillStyle = ink; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = bg; pear(g, cx, cy + r * .08, r * 1.12);
}
function coverArt(g, w, h, L, P, foil) {
  var ink = goldInk(g, w, h, foil), bg = foil ? "#000000" : COVER, f = w / 470;
  g.strokeStyle = ink; g.lineWidth = 1.6 * f; g.strokeRect(L.m * .7, L.m * .7, w - L.m * 1.4, h - L.m * 1.4);
  g.lineWidth = .8 * f; g.strokeRect(L.m * .7 + 6 * f, L.m * .7 + 6 * f, w - L.m * 1.4 - 12 * f, h - L.m * 1.4 - 12 * f);
  if (P.k === "cover") {
    spaced(g, P.t.kick.toUpperCase(), w / 2, h * .15, "600 " + (11.5 * f).toFixed(1) + "px " + SANS, ink, 4.2 * f, "center");
    emblem(g, w / 2, h * .33, w * .12, ink, bg);
    spaced(g, "Birnkammer", w / 2, h * .53, "600 " + (58 * f).toFixed(1) + "px " + SERIF, ink, -1 * f, "center");
    spaced(g, P.t.title, w / 2, h * .6, "italic 400 " + (25 * f).toFixed(1) + "px " + SERIF, ink, 0, "center");
    g.fillStyle = ink; g.fillRect(w / 2 - 26 * f, h * .645, 52 * f, 1.2 * f);
    spaced(g, P.t.line.toUpperCase(), w / 2, h * .7, "500 " + (11 * f).toFixed(1) + "px " + SANS, ink, 3 * f, "center");
    spaced(g, P.t.foot, w / 2, h - L.m * 1.7, "italic 400 " + (14 * f).toFixed(1) + "px " + SERIF, ink, 0, "center");
  } else {
    emblem(g, w / 2, h * .36, w * .07, ink, bg);
    spaced(g, "Birnkammer", w / 2, h * .48, "600 " + (30 * f).toFixed(1) + "px " + SERIF, ink, 0, "center");
    P.t.lines.forEach(function (t, i) { spaced(g, t, w / 2, h * .54 + i * 20 * f, "400 " + (12.5 * f).toFixed(1) + "px " + SANS, ink, .4 * f, "center"); });
    spaced(g, P.t.note, w / 2, h - L.m * 1.7, "italic 400 " + (12.5 * f).toFixed(1) + "px " + SERIF, ink, 0, "center");
  }
}
function drawCover(g, w, h, L, P) {
  g.fillStyle = COVER; g.fillRect(0, 0, w, h);
  var gr = g.createRadialGradient(w * .45, h * .35, 10, w * .5, h * .5, h * .8);
  gr.addColorStop(0, "rgba(120,72,30,.45)"); gr.addColorStop(1, "rgba(0,0,0,.35)");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  grain(g, w, h, .09, 77);
  coverArt(g, w, h, L, P, false);
}

function drawIntro(g, w, h, L, P) {
  paper(g, w, h, 21); header(g, w, L, P);
  var t = P.t, x = L.m, maxW = w - 2 * L.m, f = w / 470, y = L.ruleY + h * .11;
  spaced(g, t.h, x, y, "italic 400 " + (40 * f).toFixed(1) + "px " + SERIF, INK, -.5);
  y += 30 * f;
  var n = para(g, t.p, x, y, maxW, 20.5 * f, L.small ? 8 : 9, "400 " + Math.max(13, 13.6 * f).toFixed(1) + "px " + SANS, "#4e3c2b");
  y += n * 20.5 * f + 18 * f;
  spaced(g, t.sig, x, y, "italic 400 " + (19 * f).toFixed(1) + "px " + SERIF, GOLD_T, 0);
  y = Math.max(y + 34 * f, h * .62);
  spaced(g, t.toc.toUpperCase(), x, y, "600 " + L.fs.kick.toFixed(1) + "px " + SANS, GOLD_T, L.fs.kick * .16);
  y += 12 * f;
  t.rows.forEach(function (r) {
    y += 26 * f;
    g.fillStyle = "rgba(42,29,18,.14)"; g.fillRect(x, y + 8 * f, maxW, 1);
    spaced(g, r[0], x, y, "500 " + Math.max(13, 14.5 * f).toFixed(1) + "px " + SANS, INK, 0);
    spaced(g, String(r[1]), w - L.m, y, "italic 500 " + (15 * f).toFixed(1) + "px " + SERIF, INK, 0, "right");
  });
}

function drawOutro(g, w, h, L, P) {
  paper(g, w, h, 31); header(g, w, L, P);
  var t = P.t, x = L.m, maxW = w - 2 * L.m, f = w / 470, y = L.ruleY + h * .1;
  g.fillStyle = "#f2b54a"; g.beginPath(); g.arc(x + 3, y - L.fs.kick * .36, 3, 0, 7); g.fill();
  spaced(g, t.kick.toUpperCase(), x + 13, y, "600 " + L.fs.kick.toFixed(1) + "px " + SANS, GOLD_T, L.fs.kick * .16);
  y += 40 * f;
  spaced(g, t.h, x, y, "600 " + (L.fs.name * 1.05).toFixed(1) + "px " + SERIF, INK, -.3);
  y += 16 * f;
  t.rows.forEach(function (r, i) {
    y += (L.small ? 46 : 52) * f;
    var rr = 13 * f;
    g.fillStyle = hexA("#f2b54a", .28); g.beginPath(); g.arc(x + rr, y - 4 * f, rr, 0, 7); g.fill();
    spaced(g, String(i + 1), x + rr, y + 1 * f, "italic 600 " + (14 * f).toFixed(1) + "px " + SERIF, GOLD_T, 0, "center");
    spaced(g, r[0], x + rr * 2 + 12 * f, y - 6 * f, "600 " + Math.max(13.5, 15 * f).toFixed(1) + "px " + SANS, INK, 0);
    para(g, r[1], x + rr * 2 + 12 * f, y + 13 * f, maxW - rr * 2 - 12 * f, 18 * f, 1, "400 " + Math.max(12.5, 13.5 * f).toFixed(1) + "px " + SANS, "#5b4734");
  });
  var ry = L.btn.top - Math.round(h * .022);
  g.fillStyle = "rgba(42,29,18,.16)"; g.fillRect(L.m, ry, w - 2 * L.m, 1);
  spaced(g, t.note, x, L.btn.top + L.btn.h / 2 + 4, "italic 400 " + Math.max(12.5, 13.5 * f).toFixed(1) + "px " + SERIF, MUTED, 0);
}

/* ---------- Seiten-Shader: Papier + Produkt, Licht, Glanz, Falz und Schatten ---------- */
var VS = [
  "varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying float vX;",
  "void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vX = position.x;",
  "  gl_Position = projectionMatrix * viewMatrix * w; }"
].join("\n");
var FS = [
  "uniform sampler2D mapF, mapB, foilF, foilB, prodF, prodB; uniform vec4 rectF, rectB, uSh; uniform vec2 hasP, hasFoil; uniform vec3 uL; uniform float uTone;",
  "varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying float vX;",
  "vec3 aces(vec3 x){ return clamp((x * (2.51 * x + .03)) / (x * (2.43 * x + .59) + .14), 0., 1.); }",
  "void main(){",
  "  bool fr = gl_FrontFacing; vec2 uv = fr ? vUv : vec2(1. - vUv.x, vUv.y);",
  "  vec3 col = fr ? texture2D(mapF, uv).rgb : texture2D(mapB, uv).rgb;",
  "  vec4 r = fr ? rectF : rectB; float hp = fr ? hasP.x : hasP.y;",
  "  if (hp > .5) { vec2 pu = (uv - r.xy) / (r.zw - r.xy);",
  "    if (pu.x >= 0. && pu.y >= 0. && pu.x <= 1. && pu.y <= 1.) { vec4 p = fr ? texture2D(prodF, pu) : texture2D(prodB, pu);",
  "      vec3 pc = uTone > .5 ? aces(p.rgb) : min(p.rgb, vec3(1.)); col = pc + col * (1. - clamp(p.a, 0., 1.)); } }",
  "  vec3 N = normalize(fr ? vN : -vN); vec3 L = normalize(uL);",
  "  float shade = (.52 + .48 * max(dot(N, L), 0.)) / (.52 + .48 * L.z);",
  "  float u = vUv.x; shade *= 1. - .2 * exp(-u / .022) - .07 * exp(-u / .11);",
  "  float d = (vX - uSh.x) * uSh.w; shade *= 1. - uSh.y * exp(-max(d, 0.) / uSh.z);",
  "  vec3 V = normalize(cameraPosition - vW); vec3 H = normalize(L + V); float nh = max(dot(N, H), 0.);",
  "  float bend = clamp(1. - abs(N.z), 0., 1.);",
  "  float fo = (fr ? texture2D(foilF, uv).r * hasFoil.x : texture2D(foilB, uv).r * hasFoil.y);",
  "  vec3 c = col * min(shade, 1.1) + vec3(1., .97, .9) * pow(nh, 46.) * .2 * smoothstep(.02, .4, bend)",
  "        + vec3(1., .86, .56) * fo * (.32 * pow(nh, 30.) + .12 * pow(nh, 6.));",
  "  gl_FragColor = vec4(c, 1.);",
  "  #include <colorspace_fragment>",
  "}"
].join("\n");

export function createBook(THREE, RoomEnvironment, o) {
  var host = o.host, nF = o.count, NU = mobile ? 34 : 46, NV = mobile ? 10 : 14;
  var mode = o.mode(), A = ASPECT[mode], k = 100, hostW = 1, hostH = 1, ready = false, first = o.onFirst;
  var S = stage(THREE, o.gl, { fov: 18, alpha: true, tone: false, onResize: function () { if (ready) relayout(); } });
  var R = S.renderer, scene = S.scene, cam = S.camera, pr = Math.min(window.devicePixelRatio || 1, 2);
  var aniso = Math.min(8, R.capabilities.getMaxAnisotropy());
  var half = R.capabilities.isWebGL2 && R.extensions.has("EXT_color_buffer_float");
  var bookG = new THREE.Group(); scene.add(bookG);

  function solidTex(c) { var cv = document.createElement("canvas"); cv.width = cv.height = 4; var g = cv.getContext("2d"); g.fillStyle = c; g.fillRect(0, 0, 4, 4); var t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; }
  var black = solidTex("#000"), blank = (function () {
    var cv = document.createElement("canvas"); cv.width = 256; cv.height = 360; var g = cv.getContext("2d"); paper(g, 256, 360, 99);
    var t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();

  function mat() {
    return new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: FS, side: THREE.DoubleSide, uniforms: {
      mapF: { value: blank }, mapB: { value: blank }, foilF: { value: black }, foilB: { value: black }, prodF: { value: black }, prodB: { value: black },
      rectF: { value: new THREE.Vector4() }, rectB: { value: new THREE.Vector4() }, hasP: { value: new THREE.Vector2() }, hasFoil: { value: new THREE.Vector2() },
      uSh: { value: new THREE.Vector4(0, 0, 1, 1) }, uL: { value: new THREE.Vector3(-.38, .5, .78) }, uTone: { value: half ? 1 : 0 } } });
  }

  // Blatt-Geometrie: NU Abschnitte quer zum Falz (uv.x = Abstand vom Falz), NV Reihen von unten nach oben
  function sheetGeo() {
    var g = new THREE.BufferGeometry(), n = (NU + 1) * (NV + 1), pos = new Float32Array(n * 3), uv = new Float32Array(n * 2), idx = [], i, j;
    for (j = 0; j <= NV; j++) for (i = 0; i <= NU; i++) { var q = j * (NU + 1) + i; uv[q * 2] = i / NU; uv[q * 2 + 1] = j / NV; }
    for (j = 0; j < NV; j++) for (i = 0; i < NU; i++) { var a = j * (NU + 1) + i, b = a + 1, c = a + NU + 1, d = c + 1; idx.push(a, b, d, a, d, c); }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
    return g;
  }
  // Biegen: Winkel entlang des Blatts = Grundwinkel + Wölbung, die zum freien Rand hin wächst.
  // In der ersten Hälfte eilt der Rand voraus (er wird angehoben), in der zweiten fällt er hinterher.
  // lead: welche Ecke vorauseilt (+1 unten, -1 oben), stiff: wie stark sich das Blatt wölbt (Umschlag kaum).
  var edge = [0, 0];
  function bend(geo, q, dir, lead, stiff, flat) {
    var pos = geo.attributes.position.array, du = 1 / NU, LR = .22, i, j;
    for (j = 0; j <= NV; j++) {
      var yn = j / NV, w = lead >= 0 ? yn : 1 - yn, qj = flat ? q : cl(q * (1 + LR) - LR * w, 0, 1);
      var th = dir >= 0 ? Math.PI * qj : Math.PI * (1 - qj), b = (dir >= 0 ? 1 : -1) * stiff * Math.sin(2 * Math.PI * qj);
      var x = 0, z = 0, y = (yn - .5) * A, lift = flat ? 0 : .0018 + .006 * Math.sin(Math.PI * qj);
      for (i = 0; i <= NU; i++) {
        var p = (j * (NU + 1) + i) * 3; pos[p] = x; pos[p + 1] = y; pos[p + 2] = z + lift;
        if (i < NU) { var ph = cl(th + b * Math.pow((i + .5) * du, 1.35), 0, Math.PI); x += Math.cos(ph) * du; z += Math.sin(ph) * du; }
      }
      if (j === NV >> 1) { edge[0] = x; edge[1] = z; }
    }
    geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); geo.computeBoundingSphere();
  }

  var gR = sheetGeo(), gL = sheetGeo(), gS = sheetGeo();
  var mR = new THREE.Mesh(gR, mat()), mL = new THREE.Mesh(gL, mat()), mS = new THREE.Mesh(gS, mat());
  [mR, mL, mS].forEach(function (m) { m.frustumCulled = false; bookG.add(m); });
  mS.renderOrder = 3;

  // Seitenstapel (Kanten der darunterliegenden Blätter) und weicher Schatten unter dem Buch
  var stack = [];
  ["#e3d6bf", "#2a1c12"].forEach(function (c, i) {
    [1, -1].forEach(function (side) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: c }));
      m.position.z = -.002 - i * .002; m.userData = { side: side, layer: i }; bookG.add(m); stack.push(m);
    });
  });
  // Weicher Rechteck-Schatten als Alpha-Maske (Weiß = Schatten), damit die Farbe sicher schwarz bleibt
  var shTex = (function () {
    var cv = document.createElement("canvas"); cv.width = 128; cv.height = 160; var g = cv.getContext("2d"), x, y, img = g.createImageData(128, 160);
    function sm(v, a, b) { var t = cl((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
    for (y = 0; y < 160; y++) for (x = 0; x < 128; x++) {
      var ax = sm(Math.min(x, 127 - x), 2, 30), ay = sm(Math.min(y, 159 - y), 2, 34), v = Math.round(255 * ax * ay), i = (y * 128 + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return new THREE.CanvasTexture(cv);
  })();
  var shadows = [1, -1].map(function (side) {
    var m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: shTex, transparent: true, depthWrite: false, opacity: .4 }));
    m.position.z = -.012; m.userData.side = side; bookG.add(m); return m;
  });

  /* ---------- Produkte in eigener Szene, je Seite eine Textur ---------- */
  var pScene = new THREE.Scene(), pCam = new THREE.PerspectiveCamera(20, 1, .05, 60);
  var pm = new THREE.PMREMGenerator(R); pScene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; pm.dispose();
  pScene.environmentIntensity = .62;
  var key = new THREE.DirectionalLight(0xfff0d8, 1.7); key.position.set(-2.2, 3.2, 3); pScene.add(key);
  var rim = new THREE.DirectionalLight(0xffe0b0, 1.1); rim.position.set(2.6, 1.6, -2.4); pScene.add(rim);
  pScene.add(new THREE.HemisphereLight(0xfff6e8, 0x7a5a3a, .35));
  var prods = {}, rts = new Map(), rtW = 256, rtH = 256;
  function prod(id) {
    if (!(id in prods)) { var p = build(THREE, id); prods[id] = p; if (p) { p.group.visible = false; pScene.add(p.group); if (p.hl) { p.hl.visible = false; pScene.add(p.hl); } } }
    return prods[id];
  }
  function rtFor(f) {
    var r = rts.get(f);
    if (!r) { r = new THREE.WebGLRenderTarget(rtW, rtH, { samples: mobile ? 2 : 4, type: half ? THREE.HalfFloatType : THREE.UnsignedByteType, depthBuffer: true }); rts.set(f, r); }
    return r;
  }
  var EL = 9 * Math.PI / 180;
  function renderProd(f, id, t, t0) {
    var p = prod(id); if (!p) return null;
    var rt = rtFor(f), asp = rtW / rtH, tn = Math.tan(10 * Math.PI / 180);
    var dist = Math.max(p.h * .5 * 1.2 / tn, p.w * .5 * 1.25 / (tn * asp)), ty = p.h * .5;
    pCam.aspect = asp; pCam.position.set(0, ty + dist * Math.sin(EL), dist * Math.cos(EL)); pCam.lookAt(0, ty - p.h * .03, 0); pCam.updateProjectionMatrix();
    p.group.rotation.y = (t - t0) * .26; p.tick(t);
    p.group.visible = true; if (p.hl) p.hl.visible = true;
    R.setRenderTarget(rt); R.clear(); R.render(pScene, pCam); p.group.visible = false; if (p.hl) p.hl.visible = false;
    return rt;
  }

  /* ---------- Seitentexturen (zuletzt benutzte bleiben, der Rest wird freigegeben) ---------- */
  var cache = new Map(), ver = 0, inUse = {};
  function faceTex(f) {
    var e = cache.get(f);
    if (e && e.ver === ver) { cache.delete(f); cache.set(f, e); return e; }
    if (e) free(e);
    e = draw(f); cache.set(f, e);
    var keys = Array.from(cache.keys());
    for (var i = 0; cache.size > 8 && i < keys.length; i++) if (!inUse[keys[i]]) { free(cache.get(keys[i])); cache.delete(keys[i]); }
    return e;
  }
  function free(e) { e.map.dispose(); if (e.foil !== black) e.foil.dispose(); }
  function draw(f) {
    var P = o.page(f), w = Math.round(k), h = Math.round(k * A), L = layout(w, h), cv = document.createElement("canvas"), g;
    P.side = mode === "spread" && f % 2 === 1 ? "l" : "r";
    cv.width = Math.round(w * pr); cv.height = Math.round(h * pr); g = cv.getContext("2d"); g.scale(pr, pr);
    var foil = black;
    if (P.k === "prod") drawProd(g, w, h, L, P);
    else if (P.k === "intro") drawIntro(g, w, h, L, P);
    else if (P.k === "outro") drawOutro(g, w, h, L, P);
    else {
      drawCover(g, w, h, L, P);
      var fc = document.createElement("canvas"); fc.width = Math.round(w * pr * .5); fc.height = Math.round(h * pr * .5);
      var fg = fc.getContext("2d"); fg.scale(pr * .5, pr * .5); fg.fillStyle = "#000"; fg.fillRect(0, 0, w, h); coverArt(fg, w, h, L, P, true);
      foil = new THREE.CanvasTexture(fc);
    }
    var t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso;
    var st = L.stage;
    return { map: t, foil: foil, ver: ver, id: P.k === "prod" ? P.id : null, rect: new THREE.Vector4(st.x / w, 1 - (st.y + st.h) / h, (st.x + st.w) / w, 1 - st.y / h) };
  }

  /* ---------- Zustand und Bewegung ---------- */
  var cur = 0, anim = null;
  function maxS() { return mode === "spread" ? nF / 2 : nF - 1; }
  function ox(s) { return mode === "single" ? -.5 : s === 0 ? -.5 : s === nF / 2 ? .5 : 0; }
  function config() {
    var s = cur, sp = mode === "spread", c = { L: null, R: null, sheet: null };
    if (!anim) { if (sp) { c.L = s > 0 ? 2 * s - 1 : null; c.R = s < nF / 2 ? 2 * s : null; } else c.R = s; return c; }
    var d = anim.dir;
    if (sp) {
      if (d > 0) { c.sheet = [2 * s, 2 * s + 1]; c.R = s + 1 < nF / 2 ? 2 * s + 2 : null; c.L = s > 0 ? 2 * s - 1 : null; }
      else { c.sheet = [2 * s - 2, 2 * s - 1]; c.L = s - 1 > 0 ? 2 * s - 3 : null; c.R = s < nF / 2 ? 2 * s : null; }
    } else { if (d > 0) { c.sheet = [s, null]; c.R = s + 1; } else { c.sheet = [s - 1, null]; c.R = s; } }
    return c;
  }
  var DUR = mobile ? 660 : 740;
  function now() { return performance.now(); }

  function setFace(m, side, f, t) {
    var u = m.material.uniforms, F = side === "F";
    if (f == null) { u[F ? "mapF" : "mapB"].value = blank; u[F ? "foilF" : "foilB"].value = black; if (F) { u.hasP.value.x = 0; u.hasFoil.value.x = 0; } else { u.hasP.value.y = 0; u.hasFoil.value.y = 0; } return; }
    inUse[f] = 1;
    var e = faceTex(f); if (e.t0 == null || e.seen < frameNo - 1) e.t0 = t; e.seen = frameNo; var rt = e.id ? renderProd(f, e.id, t, e.t0) : null;
    u[F ? "mapF" : "mapB"].value = e.map; u[F ? "foilF" : "foilB"].value = e.foil;
    u[F ? "rectF" : "rectB"].value.copy(e.rect); u[F ? "prodF" : "prodB"].value = rt ? rt.texture : black;
    if (F) { u.hasP.value.x = rt ? 1 : 0; u.hasFoil.value.x = e.foil !== black ? 1 : 0; } else { u.hasP.value.y = rt ? 1 : 0; u.hasFoil.value.y = e.foil !== black ? 1 : 0; }
  }

  var lastBend = "";
  var frameNo = 0;
  S.onFrame(function (dt, t) { frame(dt, t); });
  function frame(dt, t) {
    if (!ready) return;
    frameNo++;
    // Bewegung fortschreiben
    if (anim) {
      if (anim.mode === "auto") {
        var kq = cl((now() - anim.t0) / anim.dur, 0, 1), e = anim.ease(kq);
        anim.q = anim.from + (anim.to - anim.from) * e;
        if (kq >= 1) { var a = anim, ok = a.to === 1; anim = null; if (ok) cur += a.dir; if (a.done) a.done(ok); }
      } else if (anim.mode === "peel") {
        anim.q += (anim.target - anim.q) * Math.min(1, dt * 9);
        if (anim.target === 0 && anim.q < .002) anim = null;
      }
    }
    var c = config(); inUse = {};
    var used = new Set();
    [c.L, c.R].concat(c.sheet || []).forEach(function (f) { if (f != null) used.add(f); });
    rts.forEach(function (r, f) { if (!used.has(f)) { r.dispose(); rts.delete(f); } });
    mR.visible = c.R != null; mL.visible = c.L != null && mode === "spread"; mS.visible = !!c.sheet;
    if (mR.visible) setFace(mR, "F", c.R, t);
    if (mL.visible) setFace(mL, "B", c.L, t);
    var q = anim ? anim.q : 0, dir = anim ? anim.dir : 1;
    if (c.sheet) {
      setFace(mS, "F", c.sheet[0], t); setFace(mS, "B", c.sheet[1], t);
      var stiff = (c.sheet[0] === 0 || c.sheet[1] === nF - 1) ? .22 : (mobile ? .7 : .85), keyB = q.toFixed(4) + dir + anim.lead + stiff + A;
      if (keyB !== lastBend) { bend(gS, q, dir, anim.lead, stiff, false); lastBend = keyB; }
    }
    R.setRenderTarget(null);
    // Schatten des Blatts auf den Seiten darunter
    var sh = c.sheet ? .42 * Math.pow(Math.sin(Math.PI * q), .7) : 0, pen = .03 + .5 * Math.max(0, edge[1]);
    mR.material.uniforms.uSh.value.set(edge[0], sh, pen, 1);
    mL.material.uniforms.uSh.value.set(edge[0], sh, pen, -1);
    // Lage des Buchs: geschlossen mittig, offen um den Falz
    var s0 = cur, s1 = anim ? cur + anim.dir : cur, eq = anim ? cl(anim.q, 0, 1) : 0;
    bookG.position.x = ox(s0) + (ox(s1) - ox(s0)) * sine(eq);
    // Stapel links und rechts (ohne das oberste Blatt)
    var turnR = anim && anim.dir > 0 ? 1 : 0, turnL = anim && anim.dir < 0 ? 1 : 0;
    var left = mode === "spread" ? cur - turnL : 0, right = (mode === "spread" ? nF / 2 - cur : nF - 1 - cur) - turnR;
    stack.forEach(function (m) {
      var u = m.userData, n = u.side > 0 ? right - 1 : left - 1, d = Math.min(.011, .0019 * Math.max(0, n)) + (u.layer ? .0035 : 0);
      var hasBack = u.side > 0 ? (mode === "spread" ? cur < nF / 2 : cur < nF - 1) : cur > 0;
      m.visible = n >= 0 && (u.layer === 0 ? n > 0 : hasBack) && (u.side > 0 || mode === "spread");
      m.scale.set(1, A, 1); m.position.set(u.side * (.5 + d), -d * .55, m.position.z);
    });
    shadows.forEach(function (m) {
      var side = m.userData.side, on = side > 0 ? (c.R != null || right > 0) : (mode === "spread" && (c.L != null || left > 0));
      m.visible = on; m.scale.set(1.28, A * 1.2, 1); m.position.set(side * .5 + side * .05, -.025, -.012);
    });
    if (first) { var f0 = first; first = null; requestAnimationFrame(function () { requestAnimationFrame(f0); }); }
  }

  var lastLayout = "";
  function relayout() {
    var gh = o.gl.clientHeight || 1, key = o.mode() + host.clientWidth + "x" + host.clientHeight + "/" + gh;
    if (key === lastLayout) return;
    lastLayout = key;
    mode = o.mode(); A = ASPECT[mode];
    hostW = host.clientWidth || 1; hostH = host.clientHeight || 1;
    k = mode === "spread" ? hostW / 2 : hostW;
    var D = (gh / k) / (2 * Math.tan(9 * Math.PI / 180));
    cam.fov = 18; cam.near = .05; cam.far = D + 20; cam.position.set(0, 0, D); cam.lookAt(0, 0, 0); cam.updateProjectionMatrix();
    bend(gR, 0, 1, 0, 0, true); bend(gL, 1, 1, 0, 0, true); lastBend = "";
    var w = Math.round(k), h = Math.round(k * A), st = layout(w, h).stage, rpr = Math.min(pr, mobile ? 1.6 : 2);
    var nw = Math.min(1024, Math.round(st.w * rpr)), nh = Math.min(1024, Math.round(st.h * rpr));
    if (nw !== rtW || nh !== rtH) { rtW = nw; rtH = nh; rts.forEach(function (r) { r.dispose(); }); rts.clear(); }
    ver++;
    if (anim && anim.done) { var a = anim; anim = null; a.done(false); } else anim = null;
    if (o.onLayout) o.onLayout();
  }
  relayout(); ready = true;

  // Seiten der Nachbar-Doppelseiten vorab zeichnen, damit der erste Umblätter-Moment nicht ruckelt
  var pre = 0;
  function prefetch() {
    clearTimeout(pre);
    var list = [], s = cur;
    if (mode === "spread") [2 * s + 1, 2 * s + 2, 2 * s - 2, 2 * s - 3].forEach(function (f) { if (f >= 0 && f < nF) list.push(f); });
    else [s + 1, s - 1].forEach(function (f) { if (f >= 0 && f < nF) list.push(f); });
    (function step() {
      if (!list.length) return;
      var f = list.shift(), e = cache.get(f);
      if (!e || e.ver !== ver) { e = faceTex(f); R.initTexture(e.map); if (e.id) prod(e.id); }
      pre = setTimeout(step, 70);
    })();
  }

  return {
    set: function (s) { cur = s; if (!anim || anim.mode === "peel") anim = null; prefetch(); },
    relayout: relayout,
    invalidate: function () { ver++; prefetch(); },
    flip: function (dir, done) {
      var from = anim && anim.dir === dir && anim.mode === "peel" ? anim.q : 0;
      anim = { dir: dir, mode: "auto", from: from, to: 1, q: from, lead: 1, t0: now(), dur: DUR * (1 - from * .6), ease: sine, done: done };
    },
    dragStart: function (dir, lead) {
      var from = anim && anim.dir === dir && anim.mode === "peel" ? anim.q : 0;
      anim = { dir: dir, mode: "drag", q: from, lead: lead };
    },
    dragTo: function (q) { if (anim && anim.mode === "drag") anim.q = cl(q, 0, 1); },
    dragEnd: function (commit, done) {
      if (!anim) { done(false); return; }
      var from = anim.q, to = commit ? 1 : 0;
      anim = { dir: anim.dir, mode: "auto", from: from, to: to, q: from, lead: anim.lead, t0: now(), dur: Math.max(220, DUR * Math.abs(to - from) * 1.05), ease: outC, done: done };
    },
    peel: function (dir) {
      if (anim && anim.mode !== "peel") return;
      if (!dir) { if (anim) anim.target = 0; return; }
      if (anim && anim.dir !== dir) anim = null;
      if (!anim) anim = { dir: dir, mode: "peel", q: 0, target: .055, lead: 1 };
      else anim.target = .055;
    },
    busy: function () { return !!anim && anim.mode !== "peel"; },
    rects: function () {
      var gx = ox(cur), ph = k * A, top = (hostH - ph) / 2, xR = hostW / 2 + gx * k;
      return { L: mode === "spread" ? { x: xR - k, y: top, w: k, h: ph } : null, R: { x: xR, y: top, w: k, h: ph } };
    },
    layout: function () { return layout(Math.round(k), Math.round(k * A)); },
    maxS: maxS
  };
}
