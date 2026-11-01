/* 3D-Anfahrt – Baustein von Tim Kofler Webdesign (tim-kofler.at)
 *
 * Statt einer grauen Google-Karte: eine kurze 3D-Fahrt auf die Adresse. Gebäude der Umgebung (OpenStreetMap)
 * wachsen aus dem Boden, Straßen zeichnen sich als feine Linien zur Adresse hin, die Kamera schwebt in etwa
 * 7 Sekunden heran, eine orange Wegmarke pulsiert. Danach kreist die Ansicht ruhig, Ziehen dreht sie.
 * Darunter „Route planen“ (Google Maps, neuer Tab) und „In Google Maps öffnen“. Bis zu diesem Klick
 * gibt es keinen Kontakt zu Google: die Kartendaten liegen als JSON auf dem eigenen Webspace.
 *
 * EINSETZEN FÜR EINEN KUNDEN
 * 1. Kartendaten holen (Repo-Hauptordner, nur Python-Standardbibliothek):
 *      python3 quellen/anfahrt/hole.py "Hauptstraße 1, 3390 Melk" webdesign/assets/data/anfahrt-kunde.json
 *    (am Land mit wenigen Häusern --radius 550; bei falschem Geocoding --lat/--lon angeben)
 * 2. In die Seite:
 *      <link rel="stylesheet" href="/assets/css/tk-anfahrt.css?v=…">          (sonst lädt das Skript sie selbst)
 *      <div data-tk-anfahrt data-src="/assets/data/anfahrt-kunde.json" data-ziel="Hauptstraße 1, 3390 Melk"></div>
 *      <script type="module" src="/assets/js/tk-anfahrt.js?v=…"></script>
 *    Optionale Attribute:
 *      data-label="Tischlerei Muster"     Text im Schild (Standard: data-ziel)
 *      data-bild / data-bild-hell         Standbild (WebP) für Geräte ohne WebGL und bei „Bewegung reduzieren“
 *      data-modus="hell|dunkel|auto"      Farbschema (Standard: Black/White Edition von tim-kofler.at, sonst System)
 *      data-karte="iframe"                Zweiter Knopf lädt nach Klick eine eingebettete Google-Karte.
 *                                         Nur wenn die CSP frame-src https://www.google.com erlaubt
 *                                         und die Datenschutzerklärung Google Maps nennt. Standard: Link.
 *      data-three="/pfad/three.module.min.js"  wenn Three.js woanders liegt
 * 3. Auf Kundenseiten ohne /beispiele/_shared/: stage3d.js und vendor/three-r180 an dieselben Pfade kopieren
 *    oder die import-Zeile unten anpassen. Farben über die --tka-* Variablen in tk-anfahrt.css.
 * 4. Pflicht (ODbL): der Vermerk „© OpenStreetMap-Mitwirkende“ bleibt sichtbar, das macht der Baustein selbst.
 *
 * Technik: rendert nur, solange die Bühne sichtbar ist (stage3d), höchstens doppelte Pixeldichte,
 * Ziehen nur waagrecht (touch-action: pan-y), die Seite scrollt am Handy normal weiter.
 */
import { reduce, webglOk, whenNear, loadThree, stage, dragRotate } from "/beispiele/_shared/stage3d.js?v=2";

var CSS_URL = new URL("../css/tk-anfahrt.css", import.meta.url).href;
var END = 7.2;          // Sekunden bis die Kamera angekommen ist
var ICON = {
  route: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l18-8-8 18-2-8z"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg>',
  ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  replay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3 4v4.5h4.5"/></svg>'
};

function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, k) { return a + (b - a) * k; }
function sstep(a, b, x) { var k = clamp((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); }
// cubic-bezier(.5,.02,.16,1): weich losschweben, lange sanft ausrollen
function bez(x) {
  var x1 = .5, y1 = .02, x2 = .16, y2 = 1, t = x;
  for (var i = 0; i < 8; i++) {
    var cx = 3 * x1 * t * (1 - t) * (1 - t) + 3 * x2 * t * t * (1 - t) + t * t * t - x;
    var d = 3 * x1 * (1 - t) * (1 - 3 * t) + 3 * x2 * t * (2 - 3 * t) + 3 * t * t;
    if (Math.abs(d) < 1e-5) break; t = clamp(t - cx / d, 0, 1);
  }
  return 3 * y1 * t * (1 - t) * (1 - t) + 3 * y2 * t * t * (1 - t) + t * t * t;
}

var cssReady = null;
function ensureCss() {
  if (cssReady) return cssReady;
  var l = document.querySelector('link[href*="tk-anfahrt.css"]');
  if (l) return (cssReady = Promise.resolve());
  l = document.createElement("link"); l.rel = "stylesheet"; l.href = CSS_URL;
  cssReady = new Promise(function (ok) { l.addEventListener("load", ok); l.addEventListener("error", ok); });
  document.head.appendChild(l);
  return cssReady;
}

document.querySelectorAll("[data-tk-anfahrt]").forEach(setup);

function setup(host) {
  if (host.__tka) return; host.__tka = {};
  ensureCss();
  var ziel = host.getAttribute("data-ziel") || "", label = host.getAttribute("data-label") || ziel;
  var src = host.getAttribute("data-src"), bild = host.getAttribute("data-bild"), bildHell = host.getAttribute("data-bild-hell") || bild;
  var frame = host.getAttribute("data-karte") === "iframe";
  var q = encodeURIComponent(ziel);
  var route = "https://www.google.com/maps/dir/?api=1&destination=" + q;
  var open = "https://www.google.com/maps/search/?api=1&query=" + q;

  host.classList.add("tka");
  host.innerHTML =
    '<div class="tka__stage">' +
      '<div class="tka__gl" role="img" aria-label="3D-Ansicht der Umgebung von ' + esc(ziel) + ', erstellt aus OpenStreetMap-Daten"></div>' +
      '<div class="tka__tag"><i aria-hidden="true"></i><span>' + esc(label) + '</span></div>' +
      '<div class="tka__hint" aria-hidden="true">Ziehen zum Drehen</div>' +
      '<button class="tka__replay" type="button" aria-label="Anfahrt nochmal abspielen" title="Nochmal abspielen">' + ICON.replay + '</button>' +
      '<div class="tka__osm">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>-Mitwirkende</div>' +
    '</div>' +
    '<div class="tka__btns">' +
      '<a class="tka__btn tka__btn--hot" href="' + esc(route) + '" target="_blank" rel="noopener">' + ICON.route + 'Route planen</a>' +
      (frame
        ? '<button class="tka__btn tka__load" type="button">' + ICON.map + 'Google-Karte laden</button>'
        : '<a class="tka__btn" href="' + esc(open) + '" target="_blank" rel="noopener">' + ICON.ext + 'In Google Maps öffnen</a>') +
    '</div>' +
    (frame ? '<div class="tka__note">Die Google-Karte wird erst nach dem Klick geladen. Dabei werden Daten an Google übertragen.</div>' : '');

  var stEl = host.querySelector(".tka__stage"), gl = host.querySelector(".tka__gl"), img = null, api = null;

  // ---------- Farbschema ----------
  function hell() {
    var m = host.getAttribute("data-modus"), r = document.documentElement;
    if (m === "hell") return true;
    if (m === "dunkel") return false;
    if (m !== "auto") {
      if (r.classList.contains("tk-white")) return true;
      if (r.classList.contains("tk-black")) return false;
      var t = r.getAttribute("data-theme"); if (t) return t === "light" || t === "hell";
    }
    return !!(window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches);
  }
  var themeCbs = [];
  function theme() {
    host.classList.toggle("tka--hell", hell());
    if (img) img.src = host.classList.contains("tka--hell") ? bildHell : bild;
    themeCbs.forEach(function (f) { f(); });
  }
  new MutationObserver(theme).observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
  if (window.matchMedia) { var mq = matchMedia("(prefers-color-scheme: light)"); if (mq.addEventListener) mq.addEventListener("change", theme); }
  theme();

  // ---------- Standbild ----------
  function still() {
    if (!bild || img) return;
    img = document.createElement("img");
    img.className = "tka__bild"; img.alt = ""; img.decoding = "async"; img.loading = "lazy";
    img.addEventListener("load", function () { img.classList.add("is-on"); });
    gl.appendChild(img); theme();
    host.classList.add("is-da", "is-still");
    host.querySelector(".tka__replay").hidden = true;
    host.querySelector(".tka__hint").hidden = true;
  }

  // ---------- Google-Karte erst nach Klick (nur data-karte="iframe") ----------
  var load = host.querySelector(".tka__load");
  if (load) load.addEventListener("click", function () {
    if (stEl.querySelector(".tka__frame")) return;
    var f = document.createElement("iframe");
    f.className = "tka__frame"; f.title = "Google Maps: " + ziel; f.loading = "lazy"; f.referrerPolicy = "no-referrer-when-downgrade";
    f.src = "https://www.google.com/maps?q=" + q + "&output=embed";
    stEl.appendChild(f);
    if (api) api.stop();
    load.disabled = true;
  });

  var soft = webglOk(true);
  if (!src || !soft || (reduce && bild)) { still(); return; }
  whenNear(host, function () {
    var three = host.getAttribute("data-three");
    Promise.all([three ? import(three) : loadThree(), ensureCss(), fetch(src, { credentials: "same-origin" }).then(function (r) { if (!r.ok) throw r.status; return r.json(); })])
      .then(function (res) { api = host.__tka = scene(res[0], res[2], host, gl, themeCbs, !webglOk()); })
      .catch(function () { still(); });
  }, "300px");
}

// ===================================================================================================
// Szene
// ===================================================================================================
var GROUND_GLSL = [
  "uniform vec3 uBg; uniform vec3 uLift; uniform float uR; uniform vec2 uC;",
  "vec3 ground(vec2 p){ float d = length(p - uC * .35); return mix(uLift, uBg, smoothstep(0., uR * .8, d)); }",
  "float fade(vec2 p){ return smoothstep(uR * .6, uR * .97, length(p)); }"
].join("\n");

function colors(THREE, el) {
  var cs = getComputedStyle(el), o = {};
  ["bg", "lift", "wand", "dach", "kante", "weg", "wald", "wasser", "acc"].forEach(function (k) {
    var v = cs.getPropertyValue("--tka-" + k).trim();
    o[k] = new THREE.Color(v || "#888");
  });
  return o;
}

function scene(THREE, d, host, gl, themeCbs, software) {
  var R = d.r || 450, K = .1;
  var S = stage(THREE, gl, { fov: 30, tone: false, alpha: false });
  var cam = S.camera, sc = S.scene;
  cam.near = 2; cam.far = R * 12; cam.updateProjectionMatrix();
  if (software) { S.renderer.setPixelRatio(1); S.resize(); }

  // Zielgebäude: Mittelpunkt und Höhe für Wegmarke und Kamera
  var zb = d.ziel >= 0 ? d.b[d.ziel] : null, C = new THREE.Vector2(0, 0), zH = 0;
  if (zb) {
    var o = zb[2], sx = 0, sz = 0;
    for (var i = 0; i < o.length; i += 2) { sx += o[i] * K; sz += -o[i + 1] * K; }
    C.set(sx / (o.length / 2), sz / (o.length / 2)); zH = zb[0] * K;
  }

  var U = {
    uT: { value: 0 }, uR: { value: R }, uC: { value: C },
    uBg: { value: new THREE.Color() }, uLift: { value: new THREE.Color() }, uWand: { value: new THREE.Color() },
    uDach: { value: new THREE.Color() }, uKante: { value: new THREE.Color() }, uWeg: { value: new THREE.Color() },
    uWald: { value: new THREE.Color() }, uWasser: { value: new THREE.Color() }, uAcc: { value: new THREE.Color() },
    uDark: { value: 1 }
  };
  function recolor() {
    var c = colors(THREE, host);
    U.uBg.value.copy(c.bg); U.uLift.value.copy(c.lift); U.uWand.value.copy(c.wand); U.uDach.value.copy(c.dach);
    U.uKante.value.copy(c.kante); U.uWeg.value.copy(c.weg); U.uWald.value.copy(c.wald); U.uWasser.value.copy(c.wasser); U.uAcc.value.copy(c.acc);
    U.uDark.value = host.classList.contains("tka--hell") ? 0 : 1;
    S.renderer.setClearColor(c.bg, 1);
    if (M.glow) {
      // Auf Hell leuchtet nichts additiv, dort ist der Punkt ein sattes Orange mit hellem Hof
      M.glow.blending = U.uDark.value ? THREE.AdditiveBlending : THREE.NormalBlending; M.glow.needsUpdate = true;
      M.core.color.copy(U.uDark.value ? new THREE.Color(0xffffff) : c.acc.clone().multiplyScalar(.82));
    }
  }

  var M = {};
  // ---------- Boden: leichter Lichthof um die Adresse, feines 50-m-Raster ----------
  M.ground = new THREE.ShaderMaterial({
    uniforms: U, depthWrite: false,
    vertexShader: "varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",
    fragmentShader: GROUND_GLSL + "\nuniform float uT; uniform vec3 uKante; varying vec2 vP;\n" +
      "void main(){ vec3 c = ground(vP); vec2 g = abs(fract(vP / 50. - .5) - .5) / fwidth(vP / 50.); float l = 1. - min(min(g.x, g.y), 1.);" +
      " float a = l * .24 * (1. - smoothstep(uR * .25, uR * .9, length(vP))) * smoothstep(0., 1.4, uT); c = mix(c, uKante, a); gl_FragColor = vec4(c, 1.);\n#include <colorspace_fragment>\n}"
  });
  var gnd = new THREE.Mesh(new THREE.CircleGeometry(R * 3, 72), M.ground);
  gnd.rotation.x = -Math.PI / 2; gnd.renderOrder = 0; sc.add(gnd);

  // ---------- Wald und Wasser als leise Flächen ----------
  if (d.f && d.f.length) {
    var fp = [], fk = [];
    d.f.forEach(function (a) {
      var pts = []; for (var i = 1; i < a.length; i += 2) pts.push(new THREE.Vector2(a[i] * K, -a[i + 1] * K));
      var tri = THREE.ShapeUtils.triangulateShape(pts, []);
      tri.forEach(function (t) { for (var j = 0; j < 3; j++) { var p = pts[t[j]]; fp.push(p.x, .12, p.y); fk.push(a[0]); } });
    });
    var fg = new THREE.BufferGeometry();
    fg.setAttribute("position", new THREE.Float32BufferAttribute(fp, 3)); fg.setAttribute("aK", new THREE.Float32BufferAttribute(fk, 1));
    M.area = new THREE.ShaderMaterial({
      uniforms: U, depthWrite: false, side: THREE.DoubleSide,
      vertexShader: "attribute float aK; varying float vK; varying vec2 vP; void main(){ vK = aK; vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",
      fragmentShader: GROUND_GLSL + "\nuniform float uT; uniform vec3 uWald; uniform vec3 uWasser; varying float vK; varying vec2 vP;\n" +
        "void main(){ vec3 g = ground(vP); vec3 c = mix(g, vK > .5 ? uWasser : uWald, .9 * smoothstep(.2, 1.8, uT));" +
        " gl_FragColor = vec4(mix(c, g, smoothstep(uR * .45, uR * 1.02, length(vP))), 1.);\n#include <colorspace_fragment>\n}"
    });
    var area = new THREE.Mesh(fg, M.area); area.renderOrder = 1; sc.add(area);
  }

  // ---------- Straßen: Linien zeichnen sich von außen zur Adresse hin ----------
  var rA = [], rB = [], rE = [], rT = [], rK = [];
  function seg(ax, az, bx, bz, k) {
    var da = Math.hypot(ax - C.x, az - C.y), db = Math.hypot(bx - C.x, bz - C.y);
    if (da < db) { var t = ax; ax = bx; bx = t; t = az; az = bz; bz = t; t = da; da = db; db = t; }   // A = weiter weg
    var t0 = .1 + clamp((R * 1.1 - da) / R, 0, 1.2) * 2.2, dur = Math.max(.02, (da - db) / R * 2.2);
    for (var v = 0; v < 2; v++) { rA.push(ax, .3, az); rB.push(bx, .3, bz); rE.push(v); rT.push(t0, dur); rK.push(k); }
  }
  (d.s || []).forEach(function (s) {
    var k = s[0], n = (s.length - 1) / 2, P = [];
    for (var i = 0; i < n; i++) P.push([s[1 + i * 2] * K, -s[2 + i * 2] * K]);
    var offs = k === 0 ? [-3.1, 3.1] : [0];
    offs.forEach(function (off) {
      var Q = P;
      if (off) {
        Q = P.map(function (p, i) {
          var a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1;
          return [p[0] - dz / L * off, p[1] + dx / L * off];
        });
      }
      for (var i = 0; i < n - 1; i++) seg(Q[i][0], Q[i][1], Q[i + 1][0], Q[i + 1][1], k);
    });
  });
  var rg = new THREE.BufferGeometry();
  rg.setAttribute("position", new THREE.Float32BufferAttribute(rA, 3));
  rg.setAttribute("aB", new THREE.Float32BufferAttribute(rB, 3));
  rg.setAttribute("aE", new THREE.Float32BufferAttribute(rE, 1));
  rg.setAttribute("aT", new THREE.Float32BufferAttribute(rT, 2));
  rg.setAttribute("aK", new THREE.Float32BufferAttribute(rK, 1));
  M.road = new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: [
      "uniform float uT; attribute vec3 aB; attribute float aE; attribute vec2 aT; attribute float aK;",
      "varying float vK; varying float vOn; varying vec2 vP; varying float vHot;",
      "void main(){ float k = clamp((uT - aT.x) / aT.y, 0., 1.); vec3 p = mix(position, aB, aE * k);",
      " vOn = step(.0001, uT - aT.x); vK = aK; vP = p.xz; vHot = 1. - clamp((uT - aT.x - aT.y) * 2.5, 0., 1.);",
      " gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.); }"
    ].join("\n"),
    fragmentShader: GROUND_GLSL + "\nuniform vec3 uWeg; uniform vec3 uWasser; uniform vec3 uAcc; uniform float uDark; varying float vK; varying float vOn; varying vec2 vP; varying float vHot;\n" +
      "void main(){ if (vOn < .5) discard; vec3 g = ground(vP);" +
      " float a = vK < .5 ? .78 : vK < 1.5 ? .6 : vK < 2.5 ? .3 : .55;" +
      " vec3 base = vK > 2.5 ? mix(uWasser, uWeg, .35 + .2 * uDark) : uWeg;" +
      " vec3 c = mix(g, base, a); c = mix(c, uAcc, vHot * .85);" +            // frisch gezeichnete Spitze leuchtet kurz orange
      " gl_FragColor = vec4(mix(c, g, fade(vP)), 1.);\n#include <colorspace_fragment>\n}"
  });
  var roads = new THREE.LineSegments(rg, M.road); roads.frustumCulled = false; roads.renderOrder = 2; sc.add(roads);

  // ---------- Gebäude: wachsen aus dem Boden, von außen nach innen, das Ziel zuletzt ----------
  var bp = [], bn = [], bg = [], ep = [], eg = [];
  function tri(a, b, c, g) {
    var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, L = Math.hypot(nx, ny, nz) || 1;
    return [a, b, c, nx / L, ny / L, nz / L, g];
  }
  function pushTri(t, flipTo) {
    var nx = t[3], ny = t[4], nz = t[5];
    if (flipTo && nx * flipTo[0] + ny * flipTo[1] + nz * flipTo[2] < 0) { nx = -nx; ny = -ny; nz = -nz; }
    for (var j = 0; j < 3; j++) { bp.push(t[j][0], t[j][1], t[j][2]); bn.push(nx, ny, nz); bg.push(t[6][0], t[6][1], t[6][2]); }
  }
  function quad(a, b, c, dd, g, out) { pushTri(tri(a, b, c, g), out); pushTri(tri(a, c, dd, g), out); }
  function edge(a, b, g) { ep.push(a[0], a[1], a[2], b[0], b[1], b[2]); eg.push(g[0], g[1], g[2], g[0], g[1], g[2]); }
  function ringOf(arr) { var o = []; for (var i = 0; i < arr.length; i += 2) o.push([arr[i] * K, -arr[i + 1] * K]); return o; }
  function area2(r) { var s = 0; for (var i = 0; i < r.length; i++) { var a = r[i], b = r[(i + 1) % r.length]; s += a[0] * b[1] - b[0] * a[1]; } return s; }
  function walls(r, h, g, hole) {
    var sgn = area2(r) < 0 ? 1 : -1; if (hole) sgn = -sgn;
    for (var i = 0; i < r.length; i++) {
      var a = r[i], b = r[(i + 1) % r.length], dx = b[0] - a[0], dz = b[1] - a[1];
      var out = [-dz * sgn, 0, dx * sgn];
      quad([a[0], 0, a[1]], [b[0], 0, b[1]], [b[0], h, b[1]], [a[0], h, a[1]], g, out);
      edge([a[0], 0, a[1]], [a[0], h, a[1]], g); edge([a[0], h, a[1]], [b[0], h, b[1]], g);
    }
  }
  function flatRoof(r, holes, h, g) {
    var c = r.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), hs = holes.map(function (hr) { return hr.map(function (p) { return new THREE.Vector2(p[0], p[1]); }); });
    var all = r.concat.apply(r, holes), t = THREE.ShapeUtils.triangulateShape(c, hs);
    t.forEach(function (f) { var a = all[f[0]], b = all[f[1]], cc = all[f[2]]; pushTri(tri([a[0], h, a[1]], [b[0], h, b[1]], [cc[0], h, cc[1]], g), [0, 1, 0]); });
  }
  function rectish(r) {
    if (r.length !== 4) return false;
    for (var i = 0; i < 4; i++) {
      var a = r[(i + 3) % 4], b = r[i], c = r[(i + 1) % 4], ux = a[0] - b[0], uz = a[1] - b[1], vx = c[0] - b[0], vz = c[1] - b[1];
      if (Math.abs(ux * vx + uz * vz) / (Math.hypot(ux, uz) * Math.hypot(vx, vz) || 1) > .34) return false;   // ~20° um den rechten Winkel
    }
    return true;
  }
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
  function mid(a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
  var UP = [0, 1, 0];

  d.b.forEach(function (b, idx) {
    var h = b[0] * K, out = ringOf(b[2]), holes = b.slice(3).map(ringOf), isZ = idx === d.ziel ? 1 : 0;
    var cx = 0, cz = 0; out.forEach(function (p) { cx += p[0]; cz += p[1]; }); cx /= out.length; cz /= out.length;
    var dd = Math.hypot(cx - C.x, cz - C.y);
    var t0 = isZ ? 4.35 : 1.0 + clamp((R - dd) / R, 0, 1) * 3.0 + (idx % 5) * .04, g = [t0, isZ ? 1.5 : 1.15, isZ];
    var hof = holes.length === 1 && out.length === 4 && holes[0].length === 4 && rectish(out);
    if (b[1] && hof) {
      // Vierkanthof: Satteldach rund um den Innenhof, First in der Mitte der Trakte
      var hr = holes[0].slice().reverse(), best = 0, bd = 1e9;
      for (var s = 0; s < 4; s++) { var sum = 0; for (var i = 0; i < 4; i++) sum += dist(out[i], hr[(i + s) % 4]); if (sum < bd) { bd = sum; best = s; } }
      var inn = out.map(function (p, i) { return hr[(i + best) % 4]; }), wing = 1e9;
      for (var i = 0; i < 4; i++) wing = Math.min(wing, dist(out[i], inn[i]) / Math.SQRT2);
      var rh = Math.min(h * .45, wing * .42), eave = h - rh, ridge = out.map(function (p, i) { return mid(p, inn[i]); });
      walls(out, eave, g, false); walls(holes[0], eave, g, true);
      for (var i = 0; i < 4; i++) {
        var j = (i + 1) % 4, o0 = [out[i][0], eave, out[i][1]], o1 = [out[j][0], eave, out[j][1]], i0 = [inn[i][0], eave, inn[i][1]], i1 = [inn[j][0], eave, inn[j][1]];
        var r0 = [ridge[i][0], h, ridge[i][1]], r1 = [ridge[j][0], h, ridge[j][1]];
        quad(o0, o1, r1, r0, g, UP); quad(i0, i1, r1, r0, g, UP);
        edge(r0, r1, g); edge(o0, r0, g); edge(i0, r0, g);
      }
    } else if (b[1] && !holes.length && rectish(out)) {
      // Satteldach über die kurze Seite, First entlang der langen Seite
      var s0 = dist(out[0], out[1]) >= dist(out[1], out[2]) ? 0 : 1;
      var p = [out[s0], out[s0 + 1], out[(s0 + 2) % 4], out[(s0 + 3) % 4]], short = dist(p[1], p[2]);
      var rh = Math.min(h * .45, short * .42), eave = h - rh, m12 = mid(p[1], p[2]), m30 = mid(p[3], p[0]);
      walls(p, eave, g, false);
      var E = p.map(function (q) { return [q[0], eave, q[1]]; }), A = [m12[0], h, m12[1]], B = [m30[0], h, m30[1]];
      pushTri(tri(E[1], E[2], A, g), [m12[0] - cx, 0, m12[1] - cz]); pushTri(tri(E[3], E[0], B, g), [m30[0] - cx, 0, m30[1] - cz]);
      quad(E[0], E[1], A, B, g, UP); quad(E[2], E[3], B, A, g, UP);
      edge(A, B, g); edge(E[1], A, g); edge(E[2], A, g); edge(E[3], B, g); edge(E[0], B, g);
    } else {
      walls(out, h, g, false); holes.forEach(function (hr) { walls(hr, h, g, true); });
      flatRoof(out, holes, h, g);
    }
  });

  var GROW = "uniform float uT; attribute vec3 aG; varying float vK; varying float vY; varying vec2 vP; varying float vG;\n" +
    "float grow(){ float k = clamp((uT - aG.x) / aG.y, 0., 1.); return 1. - pow(1. - k, 3.); }\n";
  var bgeo = new THREE.BufferGeometry();
  bgeo.setAttribute("position", new THREE.Float32BufferAttribute(bp, 3));
  bgeo.setAttribute("normal", new THREE.Float32BufferAttribute(bn, 3));
  bgeo.setAttribute("aG", new THREE.Float32BufferAttribute(bg, 3));
  M.house = new THREE.ShaderMaterial({
    uniforms: U, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
    vertexShader: GROW + "varying vec3 vN; void main(){ float k = grow(); vG = k; vK = aG.z; vY = position.y; vN = normal; vP = position.xz;" +
      " vec3 p = position; p.y *= max(k, .002); gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.); }",
    fragmentShader: GROUND_GLSL + "\nuniform vec3 uWand; uniform vec3 uDach; uniform vec3 uAcc; uniform float uDark; varying vec3 vN; varying float vK; varying float vY; varying vec2 vP; varying float vG;\n" +
      "void main(){ if (vG <= 0.) discard; vec3 n = normalize(vN);" +
      " float l = max(dot(n, normalize(vec3(-.5, .78, .38))), 0.);" +
      " vec3 c = (n.y > .35 ? uDach : uWand) * (.74 + .34 * l);" +
      " c *= mix(.72, 1., smoothstep(0., 3.5, vY));" +                                  // dunkler am Boden
      " c = mix(c, uAcc, vK * (n.y > .35 ? .38 : .2));" +
      " vec3 g = ground(vP); c = mix(g, c, smoothstep(0., .25, vG));" +
      " gl_FragColor = vec4(mix(c, g, fade(vP)), 1.);\n#include <colorspace_fragment>\n}"
  });
  var houses = new THREE.Mesh(bgeo, M.house); houses.frustumCulled = false; houses.renderOrder = 3; sc.add(houses);

  var egeo = new THREE.BufferGeometry();
  egeo.setAttribute("position", new THREE.Float32BufferAttribute(ep, 3));
  egeo.setAttribute("aG", new THREE.Float32BufferAttribute(eg, 3));
  M.edge = new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: GROW + "void main(){ float k = grow(); vG = k; vK = aG.z; vY = position.y; vP = position.xz;" +
      " vec3 p = position; p.y *= max(k, .002); gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.); }",
    fragmentShader: GROUND_GLSL + "\nuniform vec3 uKante; uniform vec3 uAcc; varying float vK; varying float vY; varying vec2 vP; varying float vG;\n" +
      "void main(){ if (vG <= 0.) discard; vec3 g = ground(vP); vec3 c = mix(uKante, uAcc, max(vK, (1. - vG) * .9));" +
      " c = mix(g, c, smoothstep(0., .2, vG)); gl_FragColor = vec4(mix(c, g, fade(vP)), 1.);\n#include <colorspace_fragment>\n}"
  });
  var edges = new THREE.LineSegments(egeo, M.edge); edges.frustumCulled = false; edges.renderOrder = 4; sc.add(edges);

  // ---------- Wegmarke: feiner Strahl, leuchtender Punkt, ruhiger Puls am Boden ----------
  var mk = new THREE.Group(); mk.position.set(C.x, 0, C.y); sc.add(mk);
  var glowTex = (function () {
    var c = document.createElement("canvas"); c.width = c.height = 128; var x = c.getContext("2d");
    var gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.16, "rgba(255,255,255,.95)"); gr.addColorStop(.24, "rgba(255,255,255,.5)");
    gr.addColorStop(.5, "rgba(255,255,255,.14)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = gr; x.fillRect(0, 0, 128, 128); var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  M.glow = new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, depthWrite: false, depthTest: false, opacity: 0 });
  var top = zH + 22, dot = new THREE.Sprite(M.glow); dot.position.y = top; dot.renderOrder = 8; mk.add(dot);
  M.core = new THREE.SpriteMaterial({ color: 0xffffff, map: glowTex, transparent: true, depthWrite: false, depthTest: false, opacity: 0 });
  var core = new THREE.Sprite(M.core);
  core.position.y = top; core.renderOrder = 9; mk.add(core);
  var beamG = new THREE.BufferGeometry();
  beamG.setAttribute("position", new THREE.Float32BufferAttribute([0, zH + .2, 0, 0, top, 0], 3));
  beamG.setAttribute("aV", new THREE.Float32BufferAttribute([0, 1], 1));
  M.beam = new THREE.ShaderMaterial({
    uniforms: { uA: { value: 0 }, uAcc: U.uAcc }, transparent: true, depthWrite: false,
    vertexShader: "attribute float aV; varying float vV; void main(){ vV = aV; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",
    fragmentShader: "uniform float uA; uniform vec3 uAcc; varying float vV; void main(){ gl_FragColor = vec4(uAcc, uA * (.25 + .75 * vV));\n#include <colorspace_fragment>\n}"
  });
  var beam = new THREE.Line(beamG, M.beam); beam.renderOrder = 7; mk.add(beam);
  var zr = 0; if (zb) { var o2 = zb[2]; for (var i = 0; i < o2.length; i += 2) zr = Math.max(zr, Math.hypot(o2[i] * K - C.x, -o2[i + 1] * K - C.y)); }
  zr = Math.max(zr, 8);
  M.ring = [];
  var rings = [0, 1].map(function () {
    var m = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0, side: THREE.DoubleSide });
    M.ring.push(m);
    var r = new THREE.Mesh(new THREE.RingGeometry(.94, 1, 96), m); r.rotation.x = -Math.PI / 2; r.position.y = .5; r.renderOrder = 6; mk.add(r); return r;
  });

  recolor(); themeCbs.push(recolor);

  // ---------- Kamera, Zeit, Ziehen ----------
  var drag = dragRotate(S.canvas, { speed: .005 });
  var t = 0, orbit = 0, started = false, stopped = false, da = false, fix = false, still = !!window.__tkaStill || reduce;
  var cv = S.canvas;
  if (still) { t = END + 1; started = true; host.classList.add("is-still"); }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { if (es[0].intersectionRatio >= .3) { started = true; io.disconnect(); } }, { threshold: [0, .3, .6] });
    io.observe(host.querySelector(".tka__stage"));
  } else started = true;
  var rp = host.querySelector(".tka__replay"); rp.tabIndex = -1;   // erst am Ende der Fahrt per Tastatur erreichbar
  rp.addEventListener("click", function () { t = 0; da = false; host.classList.remove("is-da"); });
  cv.addEventListener("pointerdown", function () { host.classList.add("is-gedreht"); });

  var tgt = new THREE.Vector3(), az1 = -.42, az0 = az1 - 1.05;
  function endDist(asp) {
    var F = clamp(R * .22, 80, 140), tv = Math.tan(cam.fov * Math.PI / 360);
    return Math.max(F * .78 / tv, F / (tv * asp));
  }
  S.onFrame(function (dt) {
    if (stopped) return;
    if (started && !still && !fix) t += dt;
    var u = clamp(t / END, 0, 1), e = bez(u);
    if (fix) orbit = Math.max(0, t - END) * .028;
    else if (t > END && !still && !drag.active) orbit += dt * .028;
    var w = gl.clientWidth || 1, h = gl.clientHeight || 1, asp = w / h;
    var D0 = R * 2.6, D1 = endDist(asp), dist = D0 * Math.pow(D1 / D0, e);
    var pol = lerp(.06, .98, sstep(0, 1, Math.pow(u, .8))), az = lerp(az0, az1, e) + orbit + drag.yaw;
    tgt.set(C.x * e, zH * .35 * e, C.y * e);
    cam.position.set(tgt.x + dist * Math.sin(pol) * Math.sin(az), tgt.y + dist * Math.cos(pol), tgt.z + dist * Math.sin(pol) * Math.cos(az));
    cam.lookAt(tgt);
    // Am Handy etwas tiefer schauen, damit das Schild oben Platz hat
    cam.setViewOffset(w, h, 0, asp < 1 ? -h * .02 : -h * .03, w, h);
    U.uT.value = t;

    // Wegmarke erscheint, sobald das Zielgebäude steht
    var m = sstep(5.2, 6.1, t), pulse = (t * .42) % 1;
    M.beam.uniforms.uA.value = m * .9;
    beamG.attributes.position.array[4] = lerp(zH + .2, top, m); beamG.attributes.position.needsUpdate = true;
    var breathe = 1 + Math.sin(t * 2.4) * .06;
    dot.scale.setScalar(lerp(2, 20, m) * breathe); M.glow.opacity = m * .95; M.glow.color.copy(U.uAcc.value);
    core.scale.setScalar(5.5 * m); core.material.opacity = m;
    rings.forEach(function (r, i) {
      var ph = (pulse + i * .5) % 1, k = 1 - Math.pow(1 - ph, 2);
      r.scale.setScalar(zr * (1.05 + k * 1.6)); M.ring[i].opacity = m * Math.pow(1 - ph, 1.6) * .75; M.ring[i].color.copy(U.uAcc.value);
    });
    if (!da && t > END - .6) { da = true; host.classList.add("is-da"); rp.tabIndex = 0; }
    if (!host.classList.contains("is-3d") && started) host.classList.add("is-3d");
  });

  return {
    stop: function () { stopped = true; cv.style.visibility = "hidden"; },
    // zeit() liest die Fahrzeit; zeit(s) hält sie fest (für Standbilder und Bild-für-Bild-Videos)
    zeit: function (v) { if (v != null) { fix = true; started = true; t = v; } return t; }
  };
}
