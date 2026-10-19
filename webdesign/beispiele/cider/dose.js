// 3D-Teile für "Birnstoff": Getränkedose mit Canvas-Etikett, Leuchtringe, Lichtspur, Funken, Nebel und Lichtkegel.
// Alles wird aus Formen und Shadern gebaut, es gibt keine Modell- oder Videodateien zum Nachladen.
// Das Leuchten ist gefälscht (weiche Röhren mit additiver Mischung) statt Bloom, damit es am Handy flüssig bleibt.

export const SORTEN = {
  pur:     { name: "PUR",     sub: "BIRNE · SPRITZIG",      glow: "#d4f53c", base: ["#141a0c", "#07090a"], alk: "4,5 % VOL" },
  holler:  { name: "HOLLER",  sub: "BIRNE · HOLUNDERBLÜTE", glow: "#c3a0ff", base: ["#171225", "#08070c"], alk: "4,0 % VOL" },
  herb:    { name: "HERB",    sub: "MOSTBIRNE · TROCKEN",   glow: "#ffb04a", base: ["#1e140a", "#0a0806"], alk: "5,5 % VOL" },
  null:    { name: "NULL",    sub: "ALKOHOLFREI",           glow: "#79e6ff", base: ["#0a1a20", "#05090b"], alk: "0,0 % VOL" },
  reserve: { name: "RESERVE", sub: "IM EICHENFASS GEREIFT", glow: "#f3c56a", base: ["#d2ad66", "#7d5c2b"], alk: "7,0 % VOL", gold: true }
};
export const FONTS = ['800 100px "Unbounded"', '600 100px "Outfit"'];

export function fontsReady() {
  if (!document.fonts) return Promise.resolve();
  return Promise.all(FONTS.map(function (f) { return document.fonts.load(f); })).catch(function () {});
}

function canvas(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; }
function rng(seed) { var s = seed || 7; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function tex(THREE, c, srgb) { var t = new THREE.CanvasTexture(c); if (srgb !== false) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

// Birne als Markenzeichen: Körper, Stiel und Blatt, Mittelpunkt (x, y), Höhe etwa s.
function pear(g, x, y, s) {
  g.save(); g.translate(x, y);
  g.beginPath();
  g.moveTo(0, -.40 * s);
  g.bezierCurveTo(.15 * s, -.40 * s, .17 * s, -.17 * s, .21 * s, -.05 * s);
  g.bezierCurveTo(.41 * s, .11 * s, .43 * s, .50 * s, 0, .50 * s);
  g.bezierCurveTo(-.43 * s, .50 * s, -.41 * s, .11 * s, -.21 * s, -.05 * s);
  g.bezierCurveTo(-.17 * s, -.17 * s, -.15 * s, -.40 * s, 0, -.40 * s);
  g.closePath(); g.fill();
  g.lineWidth = s * .035; g.lineCap = "round";
  g.beginPath(); g.moveTo(0, -.39 * s); g.quadraticCurveTo(.01 * s, -.5 * s, .06 * s, -.57 * s); g.stroke();
  g.beginPath(); g.ellipse(.17 * s, -.53 * s, .13 * s, .055 * s, -.45, 0, Math.PI * 2); g.fill();
  g.restore();
}

function text(g, t, x, y, font, color, align, spacing) {
  g.save(); g.fillStyle = color; g.font = font; g.textAlign = align || "center"; g.textBaseline = "middle";
  if ("letterSpacing" in g && spacing != null) g.letterSpacing = spacing + "px";
  g.fillText(t, x, y); g.restore();
}

// Rundum-Etikett: u läuft einmal um die Dose (Vorderseite bei u = 0,5), v von unten nach oben.
// Zweite Leinwand mit denselben Linien auf Schwarz ist die Leuchtkarte (Birne, Streifen, Sortenname glühen).
// q: Auflösung (1 = 2048 Pixel rundum); die Leuchtkarte reicht in einem Viertel davon.
export function label(THREE, key, q) {
  var S = SORTEN[key], W = 2048, H = 1328, fx = W * .5, f = q || 1, fe = .25;
  var a = canvas(Math.round(W * f), Math.round(H * f)), c = a[0], g = a[1], b = canvas(W * fe, H * fe), ce = b[0], e = b[1];
  g.scale(f, f); e.scale(fe, fe);
  var gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, S.base[0]); gr.addColorStop(1, S.base[1]);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  e.fillStyle = "#000"; e.fillRect(0, 0, W, H);
  // Gebürstetes Metall: feine waagrechte Striche.
  var r = rng(key.length * 31 + 7);
  g.globalAlpha = S.gold ? .14 : .07;
  for (var i = 0; i < 900; i++) { g.fillStyle = r() < .5 ? "#000" : "#fff"; g.fillRect(r() * W, r() * H, 60 + r() * 300, 1); }
  g.globalAlpha = 1;
  var ink = S.gold ? "#1b1307" : "#eef2e4", glow = S.gold ? "#2a1c08" : S.glow;
  // Leuchtstreifen oben und unten.
  [g, e].forEach(function (k) { k.fillStyle = glow; k.fillRect(0, 34, W, 7); k.fillRect(0, H - 41, W, 7); });
  if (S.gold) { e.fillStyle = "#6b4d17"; e.fillRect(0, 34, W, 7); e.fillRect(0, H - 41, W, 7); }

  // Großer Schriftzug, senkrecht von unten nach oben gelesen.
  g.save(); g.translate(fx - 150, H * .5); g.rotate(-Math.PI / 2);
  g.font = '800 200px "Unbounded"'; if ("letterSpacing" in g) g.letterSpacing = "-4px";
  var tw = g.measureText("BIRNSTOFF").width, fs = Math.min(200, 200 * 1130 / tw);
  g.font = '800 ' + fs.toFixed(0) + 'px "Unbounded"';
  g.fillStyle = ink; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("BIRNSTOFF", 0, 0);
  g.restore();

  // Birne, Sortenname, Untertitel rechts daneben.
  [g, e].forEach(function (k) { k.fillStyle = glow; k.strokeStyle = glow; pear(k, fx + 140, H * .33, 300); });
  if (S.gold) { e.fillStyle = e.strokeStyle = "#7a5a1e"; pear(e, fx + 140, H * .33, 300); }
  [g, e].forEach(function (k) { text(k, S.name, fx + 140, H * .62, '800 ' + (S.name.length > 5 ? 46 : 58) + 'px "Unbounded"', S.gold ? (k === e ? "#000" : ink) : glow, "center", 2); });
  S.sub.split(" · ").forEach(function (t, k) { text(g, t, fx + 140, H * .68 + k * 34, '600 24px "Outfit"', ink, "center", 5); });
  ["MOSTVIERTLER", "BIRNEN-CIDER", "330 ML · " + S.alk].forEach(function (t, k) { text(g, t, fx + 140, H * .82 + k * 32, '600 22px "Outfit"', ink, "center", 4); });

  // Feine Doppellinie um das Vorderfeld, silberne Kanten oben und unten: wirkt wie ein gedrucktes Etikett statt einer Fläche.
  g.save(); g.strokeStyle = ink; g.globalAlpha = .55; g.lineWidth = 3; g.strokeRect(fx - 330, H * .1, 660, H * .8); g.lineWidth = 1.5; g.strokeRect(fx - 318, H * .1 + 12, 636, H * .8 - 24); g.restore();
  var mg = g.createLinearGradient(0, 0, 0, 30); mg.addColorStop(0, "#f2f3f5"); mg.addColorStop(1, "#9ba0a8"); g.fillStyle = mg; g.fillRect(0, 0, W, 30);
  var mg2 = g.createLinearGradient(0, H - 30, 0, H); mg2.addColorStop(0, "#9ba0a8"); mg2.addColorStop(1, "#e6e8eb"); g.fillStyle = mg2; g.fillRect(0, H - 30, W, 30);
  // Weicher Schein um die Birne in der Leuchtkarte.
  var pg = e.createRadialGradient(fx + 140, H * .33, 20, fx + 140, H * .33, 260); pg.addColorStop(0, S.gold ? "rgba(122,90,30,.5)" : "rgba(255,255,255,.22)"); pg.addColorStop(1, "rgba(0,0,0,0)");
  e.save(); e.globalCompositeOperation = "lighter"; e.fillStyle = pg; e.fillRect(0, 0, W, H); e.restore();
  // Seiten: Stempel links, Zutaten rechts (weg von der Naht bei u = 0).
  var lx = W * .2;
  g.strokeStyle = ink; g.globalAlpha = .8; g.lineWidth = 4; g.beginPath(); g.arc(lx, H * .45, 150, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 2; g.beginPath(); g.arc(lx, H * .45, 132, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
  text(g, "AUS DEM", lx, H * .45 - 46, '600 24px "Outfit"', ink, "center", 6);
  text(g, "MOST", lx, H * .45, '800 52px "Unbounded"', ink, "center", 0);
  text(g, "VIERTEL", lx, H * .45 + 46, '600 24px "Outfit"', ink, "center", 6);
  var rx = W * .8, lines = ["100 % MOSTBIRNEN", "OHNE ZUCKERZUSATZ", "NATÜRLICH SPRITZIG", "", "GUT GEKÜHLT", "GENIESSEN", "", "ERFUNDENE MARKE ·", "BEISPIEL-ENTWURF"];
  lines.forEach(function (t, k) { text(g, t, rx, H * .3 + k * 44, '600 24px "Outfit"', ink, "center", 4); });
  return { map: tex(THREE, c), emissive: tex(THREE, ce) };
}

function lathe(THREE, pts, seg) {
  return new THREE.LatheGeometry(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), seg || 72);
}

// Dose (330 ml, schlank). Mittelpunkt liegt bei y = 0, Höhe etwa 1,62.
// Das Etikett kann zwischen zwei Sorten "füllen": unterhalb der Höhe uFillY (Weltkoordinate) zeigt es die zweite Sorte,
// an der Grenze leuchtet ein welliger Rand. So wechselt die Farbe wie beim Eingießen statt mit einem Sprung.
// can.userData.show(a, b, fillY, band) setzt beide Sorten und die Grenze, glow(k) regelt das Leuchten.
export function can(THREE, key, o) {
  o = o || {};
  var seg = o.seg || 72, q = o.q || 1, grp = new THREE.Group(), inner = new THREE.Group(); inner.position.y = -.81; grp.add(inner);
  var labels = {};
  function get(k) { return labels[k] || (labels[k] = label(THREE, k, q)); }
  var L = get(key);
  var U = { map2: { value: L.map }, emissive2: { value: L.emissive }, uFillY: { value: -99 }, uEdgeC: { value: new THREE.Color("#ffffff") }, uBand: { value: 0 }, uT: { value: 0 } };
  var mat = new THREE.MeshPhysicalMaterial({ map: L.map, emissiveMap: L.emissive, emissive: "#ffffff", emissiveIntensity: .9, metalness: .55, roughness: .3, clearcoat: .7, clearcoatRoughness: .18, envMapIntensity: 1.25 });
  mat.onBeforeCompile = function (sh) {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying float vWY;")
      .replace("#include <project_vertex>", "#include <project_vertex>\nvWY = (modelMatrix * vec4(transformed, 1.0)).y;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vWY; uniform sampler2D map2; uniform sampler2D emissive2; uniform float uFillY, uBand, uT; uniform vec3 uEdgeC;")
      .replace("#include <map_fragment>",
        "float fillE = uFillY + sin(vMapUv.x * 25.13 + uT * 3.0) * .012 + sin(vMapUv.x * 62.8 - uT * 5.0) * .005;\n" +
        "float fillK = step(vWY, fillE);\n" +
        "diffuseColor *= mix(texture2D(map, vMapUv), texture2D(map2, vMapUv), fillK);")
      .replace("#include <emissivemap_fragment>",
        "totalEmissiveRadiance *= mix(texture2D(emissiveMap, vEmissiveMapUv), texture2D(emissive2, vEmissiveMapUv), fillK).rgb;\n" +
        "totalEmissiveRadiance += uEdgeC * smoothstep(.035, .0, abs(vWY - fillE)) * uBand * 2.5;");
  };
  var body = new THREE.Mesh(lathe(THREE, [[.33, .075], [.33, 1.42]], seg), mat);
  body.rotation.y = Math.PI; inner.add(body);
  var alu = new THREE.MeshPhysicalMaterial({ color: "#d3d6db", metalness: 1, roughness: .22, clearcoat: .4, clearcoatRoughness: .2 });
  inner.add(new THREE.Mesh(lathe(THREE, [[0, .045], [.18, .03], [.24, 0], [.29, 0], [.318, .025], [.33, .075]], seg), alu));
  inner.add(new THREE.Mesh(lathe(THREE, [[.33, 1.42], [.318, 1.47], [.29, 1.52], [.268, 1.555], [.264, 1.585], [.272, 1.595], [.274, 1.607], [.266, 1.613], [.255, 1.606], [.25, 1.588], [0, 1.588]], seg), alu));
  // Verschluss: Lasche mit Fingerring und Niete.
  var tabM = new THREE.MeshStandardMaterial({ color: "#d7d9dd", metalness: 1, roughness: .22 });
  var plate = new THREE.Mesh(new THREE.BoxGeometry(.075, .008, .15), tabM); plate.position.set(0, 1.594, .03); inner.add(plate);
  var fing = new THREE.Mesh(new THREE.TorusGeometry(.038, .01, 8, 24), tabM); fing.rotation.x = Math.PI / 2; fing.scale.set(1, 1.25, .6); fing.position.set(0, 1.595, .1); inner.add(fing);
  var rivet = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .014, 16), tabM); rivet.position.set(0, 1.594, 0); inner.add(rivet);
  var score = new THREE.Mesh(new THREE.TorusGeometry(.06, .004, 6, 32), new THREE.MeshStandardMaterial({ color: "#8f9399", metalness: 1, roughness: .4 }));
  score.rotation.x = Math.PI / 2; score.scale.set(1, 1.3, 1); score.position.set(0, 1.589, -.12); inner.add(score);
  var cur = [key, key];
  grp.userData.show = function (a, b, fillY, band, t) {
    if (a !== cur[0]) { cur[0] = a; var la = get(a); mat.map = la.map; mat.emissiveMap = la.emissive; }
    if (b !== cur[1]) { cur[1] = b; var lb = get(b); U.map2.value = lb.map; U.emissive2.value = lb.emissive; }
    U.uFillY.value = fillY; U.uBand.value = band || 0; U.uT.value = t || 0;
    // Gold glänzt stärker; beim Füllen zählt die Sorte, die gerade mehr Fläche hat.
    mat.metalness = SORTEN[fillY > grp.position.y ? b : a].gold ? .8 : .55;
  };
  grp.userData.edge = function (c) { U.uEdgeC.value.copy(c); };
  grp.userData.glow = function (k) { mat.emissiveIntensity = k; };
  // Etiketten vorab zeichnen und hochladen, damit ein Wechsel mitten im Scrollen nicht hakt.
  grp.userData.preload = function (k, renderer) { var l = get(k); if (renderer) { renderer.initTexture(l.map); renderer.initTexture(l.emissive); } };
  return grp;
}

// ---------- Leuchten ----------
var GLOW_V = "varying vec2 vUv; varying float vF;\n" +
  "void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vec3 n = normalize(normalMatrix * normal);\n" +
  " vF = abs(dot(n, normalize(-mv.xyz))); gl_Position = projectionMatrix * mv; }";
// Kometenschweif entlang u (uHeads Köpfe), weicher Rand über vF, optional Flackern wie bei Strom.
var GLOW_F = "uniform vec3 uColor; uniform float uT, uSpeed, uTail, uBase, uAlpha, uFlick, uHeads, uCore, uEdge;\n" +
  "varying vec2 vUv; varying float vF;\n" +
  "float h(float x){ return fract(sin(x * 127.1) * 43758.5453); }\n" +
  "void main(){ float a = fract((vUv.x - uT * uSpeed) * uHeads); float tr = pow(a, uTail);\n" +
  " float edge = pow(vF, uEdge); float f = 1.0;\n" +
  " if (uFlick > 0.0) { float x = floor(vUv.x * 70.0 + floor(uT * 16.0) * 13.0); f = mix(1.0, 0.15 + 1.6 * h(x), uFlick); }\n" +
  " float al = (uBase + tr) * edge * uAlpha * f;\n" +
  " vec3 c = uColor * (0.8 + tr * 1.4) + vec3(1.0) * pow(tr, 3.0) * uCore * edge;\n" +
  " gl_FragColor = vec4(c, al); }";

export function glowMaterial(THREE, o) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(o.color || "#d4f53c") }, uT: { value: 0 }, uSpeed: { value: o.speed == null ? .25 : o.speed },
      uTail: { value: o.tail || 3 }, uBase: { value: o.base == null ? .12 : o.base }, uAlpha: { value: o.alpha == null ? 1 : o.alpha },
      uFlick: { value: o.flick || 0 }, uHeads: { value: o.heads || 1 }, uCore: { value: o.core == null ? 1 : o.core }, uEdge: { value: o.edge || 1.6 } },
    vertexShader: GLOW_V, fragmentShader: GLOW_F, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
}

// Leuchtröhre entlang einer Kurve: dünner heller Kern plus breiter, schwacher Schein.
// Gibt eine Gruppe zurück; userData.mats sind die beiden Materialien, userData.k ihre Grundhelligkeit.
export function glowTube(THREE, curve, o) {
  o = o || {};
  var g = new THREE.Group(), seg = o.seg || 220;
  var core = glowMaterial(THREE, Object.assign({}, o, { alpha: 1 }));
  var halo = glowMaterial(THREE, Object.assign({}, o, { alpha: o.halo == null ? .4 : o.halo, core: 0, edge: 2.6 }));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, seg, o.r || .008, 8, !!o.closed), core));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, seg, (o.r || .008) * (o.wide || 8), 10, !!o.closed), halo));
  g.userData.mats = [core, halo]; g.userData.k = [1, halo.uniforms.uAlpha.value];
  return g;
}

export function ellipse(THREE, a, b) {
  var c = new THREE.Curve();
  c.getPoint = function (t, out) { out = out || new THREE.Vector3(); var p = t * Math.PI * 2; return out.set(Math.cos(p) * a, 0, Math.sin(p) * b); };
  return c;
}

// Weicher runder Lichtfleck als Textur (für Glühkern, Bodenschein, Funken).
export function dotTexture(THREE, inner) {
  var a = canvas(128, 128), c = a[0], g = a[1], gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(inner || .25, "rgba(255,255,255,.45)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return tex(THREE, c, false);
}

// Nebelschwade: viele weiche Flecken übereinander, nach außen ausgeblendet.
export function smokeTexture(THREE, seed) {
  var S = 256, a = canvas(S, S), c = a[0], g = a[1], r = rng(seed || 3);
  for (var i = 0; i < 46; i++) {
    var x = S * (.2 + r() * .6), y = S * (.25 + r() * .5), rad = S * (.08 + r() * .2), gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, "rgba(255,255,255," + (.05 + r() * .09).toFixed(3) + ")"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
  }
  g.globalCompositeOperation = "destination-in";
  var m = g.createRadialGradient(S / 2, S / 2, S * .15, S / 2, S / 2, S * .5); m.addColorStop(0, "#000"); m.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = m; g.fillRect(0, 0, S, S);
  return tex(THREE, c, false);
}

// Funken, die langsam aufsteigen. Alles läuft im Shader, die CPU setzt nur Zeit und Farbe.
export function sparks(THREE, n, o) {
  o = o || {};
  var r = rng(17), pos = new Float32Array(n * 3), sz = new Float32Array(n), w = o.w || 6, h = o.h || 5, d = o.d || 4;
  for (var i = 0; i < n; i++) { pos[i * 3] = (r() - .5) * w; pos[i * 3 + 1] = (r() - .5) * h; pos[i * 3 + 2] = -r() * d + 1; sz[i] = r(); }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("aS", new THREE.BufferAttribute(sz, 1));
  var mat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uH: { value: h }, uW: { value: w }, uPx: { value: 300 }, uColor: { value: new THREE.Color(o.color || "#d4f53c") }, uAlpha: { value: 1 }, uWind: { value: 0 } },
    // uWind ist ein Versatz, den die Seite beim "Bewegung"-Abschnitt hochzählt: die Funken ziehen dann seitlich vorbei.
    vertexShader: "attribute float aS; uniform float uT, uH, uW, uPx, uWind; varying float vA;\n" +
      "void main(){ vec3 p = position; p.y = mod(p.y + uH * .5 + uT * (.06 + aS * .14), uH) - uH * .5;\n" +
      " p.x = mod(p.x + uW * .5 - uWind * (.5 + aS), uW) - uW * .5 + sin(uT * .6 + aS * 40.0) * .06;\n" +
      " vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_PointSize = uPx * (0.012 + aS * 0.03) / -mv.z;\n" +
      " vA = 0.25 + 0.75 * aS; gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform vec3 uColor; uniform float uAlpha; varying float vA;\n" +
      "void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, .0, d); a *= a; gl_FragColor = vec4(uColor + a * .4, a * vA * uAlpha); }",
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  return new THREE.Points(geo, mat);
}

// Lichtkegel von oben: offener Zylinder, nach unten breiter und blasser, an den Rändern weich.
export function beam(THREE, o) {
  o = o || {};
  var geo = new THREE.CylinderGeometry(o.top || .06, o.bottom || .95, o.h || 3.4, 48, 1, true);
  var mat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(o.color || "#fff2d0") }, uAlpha: { value: 1 } },
    vertexShader: GLOW_V,
    fragmentShader: "uniform vec3 uColor; uniform float uAlpha; varying vec2 vUv; varying float vF;\n" +
      "void main(){ float a = pow(vF, 3.0) * pow(vUv.y, 1.6) * .35 * uAlpha; gl_FragColor = vec4(uColor, a); }",
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
  });
  return new THREE.Mesh(geo, mat);
}

// Most als Flüssigkeit: Vorderwand (bernsteinfarben, durchscheinend), Oberfläche mit Wellen und Ringen, Bläschen.
// Die Gruppe liegt mit y = 0 auf der Oberfläche; die Seite verschiebt sie. userData.u sind die gemeinsamen Uniforms.
export function liquid(THREE, o) {
  o = o || {};
  var g = new THREE.Group(), w = o.w || 16, d = o.d || 4;
  var U = { uT: { value: 0 }, uA: { value: 1 }, uRip: { value: 9 }, uRipX: { value: 0 }, uTop: { value: new THREE.Color("#f3b549") }, uDeep: { value: new THREE.Color("#4a1f05") } };
  var wave = "float wave(float x, float t){ return sin(x * 2.1 + t * 1.6) * .028 + sin(x * 4.7 - t * 2.2) * .013 + sin(x * 9.3 + t * 3.1) * .005; }\n";
  var front = new THREE.Mesh(new THREE.PlaneGeometry(w, 8, 160, 1).translate(0, -4, 0), new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false,
    vertexShader: "uniform float uT, uRip, uRipX; varying vec2 vP;\n" + wave +
      "void main(){ vec3 p = position; if (p.y > -.01) { float r = abs(p.x - uRipX); p.y += wave(p.x, uT) + sin(r * 9.0 - uRip * 9.0) * .13 * exp(-uRip * 1.5) * smoothstep(2.2, .0, abs(r - uRip * 1.3)); }\n" +
      " vP = p.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }",
    fragmentShader: "uniform float uT, uA; uniform vec3 uTop, uDeep; varying vec2 vP;\n" +
      "void main(){ float dep = clamp(-vP.y / 2.6, 0.0, 1.0); vec3 c = mix(uTop, uDeep, pow(dep, .7));\n" +
      " float ca = (pow(abs(sin(vP.x * 6.0 + uT * .7 + sin(vP.y * 7.0 + uT * .5) * 1.2)), 28.0) + pow(abs(sin(vP.x * 9.0 - uT * .5 + sin(vP.y * 5.0 - uT * .4) * 1.5)), 32.0)) * (1.0 - dep) * .12;\n" +
      " float lip = smoothstep(.05, .0, -vP.y) * .7;\n" +
      " gl_FragColor = vec4(c + ca + lip * vec3(1.0, .9, .7), (.74 + dep * .2) * uA); }"
  }));
  front.position.z = o.z || .85; front.renderOrder = 3; g.add(front);
  var top = new THREE.Mesh(new THREE.PlaneGeometry(w, d, 1, 1).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false,
    vertexShader: "varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "uniform float uT, uA, uRip, uRipX; uniform vec3 uTop; varying vec3 vP;\n" +
      "void main(){ float r = length(vec2(vP.x - uRipX, (vP.z + " + (d / 2 - (o.z || .85)).toFixed(3) + ") * 1.4));\n" +
      " float ring = smoothstep(.09, .0, abs(r - uRip * 1.3)) * exp(-uRip * 1.3) * 1.4 + smoothstep(.07, .0, abs(r - uRip * .8)) * exp(-uRip * 1.8) + smoothstep(.06, .0, abs(r - uRip * 1.9)) * exp(-uRip * 1.6) * .6;\n" +
      " float far = smoothstep(" + (-d / 2).toFixed(2) + ", " + (d / 2).toFixed(2) + ", vP.z);\n" +
      " float sh = pow(abs(sin(vP.x * 3.0 + vP.z * 5.0 + uT)), 20.0) * .25;\n" +
      " gl_FragColor = vec4(uTop * 1.15 + ring * .9 + sh, (.35 + far * .4 + ring * .5) * uA); }"
  }));
  top.position.z = (o.z || .85) - d / 2; top.renderOrder = 2; g.add(top);
  // Bläschen steigen auf und verschwinden an der Oberfläche.
  var n = o.bubbles || 160, pos = new Float32Array(n * 3), sz = new Float32Array(n), r = rng(41);
  for (var i = 0; i < n; i++) { pos[i * 3] = (r() - .5) * 6; pos[i * 3 + 1] = -r() * 3; pos[i * 3 + 2] = -r() * 1.6 + .8; sz[i] = r(); }
  var bg = new THREE.BufferGeometry(); bg.setAttribute("position", new THREE.BufferAttribute(pos, 3)); bg.setAttribute("aS", new THREE.BufferAttribute(sz, 1));
  U.uPx = { value: 300 }; U.uBurst = { value: 0 }; U.uBX = { value: 0 };
  var bub = new THREE.Points(bg, new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false,
    vertexShader: "attribute float aS; uniform float uT, uPx, uBurst, uBX; varying float vA;\n" +
      "void main(){ vec3 p = position; float sp = .25 + aS * .55 + uBurst * 1.5; p.y = mod(p.y + uT * sp, 3.0) - 3.0;\n" +
      " p.x = mix(p.x, uBX + (p.x * .12), uBurst * step(.5, aS)) + sin(uT * 2.0 + aS * 30.0) * .04;\n" +
      " vA = smoothstep(.0, -.12, p.y) * (.35 + aS * .65); vec4 mv = modelViewMatrix * vec4(p, 1.0);\n" +
      " gl_PointSize = uPx * (.006 + aS * .014) / -mv.z; gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform float uA; varying float vA;\n" +
      "void main(){ float d = length(gl_PointCoord - .5); float ring = smoothstep(.5, .38, d) * (.35 + smoothstep(.2, .45, d)); float hi = smoothstep(.18, .0, length(gl_PointCoord - vec2(.35)));\n" +
      " gl_FragColor = vec4(vec3(1.0, .93, .78), (ring * .7 + hi) * vA * uA); }"
  }));
  bub.renderOrder = 4; g.add(bub);
  g.userData.u = U;
  return g;
}

// Spritzer und Tropfen: ein Schub Teilchen ab Zeitpunkt uT0 vom Ursprung (uX, uY). kind "up" = Fontäne nach oben (Eintauchen),
// kind "drip" = Tropfen, die von der Dose fallen. Alles im Shader, die Seite setzt nur Zeit, Ort und Richtung.
export function burst(THREE, n, kind) {
  var r = rng(kind === "drip" ? 23 : 11), a = new Float32Array(n * 4);
  for (var i = 0; i < n; i++) {
    var ang = (r() - .5) * (kind === "drip" ? 3.14 : 1.1), sp = kind === "drip" ? .2 + r() * .6 : 1.2 + r() * 2.4;
    a[i * 4] = Math.sin(ang) * sp; a[i * 4 + 1] = kind === "drip" ? -r() * .4 : Math.cos(ang) * sp; a[i * 4 + 2] = (r() - .5) * sp * .5; a[i * 4 + 3] = r();
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3)); geo.setAttribute("aV", new THREE.BufferAttribute(a, 4));
  var mat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uT0: { value: -99 }, uX: { value: 0 }, uY: { value: 0 }, uPx: { value: 300 }, uAlpha: { value: 1 }, uSpread: { value: kind === "drip" ? .34 : .12 }, uColor: { value: new THREE.Color("#ffd98a") } },
    vertexShader: "attribute vec4 aV; uniform float uT, uT0, uX, uY, uPx, uSpread; varying float vA;\n" +
      "void main(){ float t = uT - uT0 - aV.w * .25; float life = 1.0; float on = step(0.0, t) * step(t, life);\n" +
      " vec3 p = vec3(uX + (aV.w - .5) * 2.0 * uSpread + aV.x * t, uY + aV.y * t - 3.4 * t * t, aV.z * t + .4);\n" +
      " vA = on * (1.0 - t / life) * (.5 + aV.w * .5); vec4 mv = modelViewMatrix * vec4(p, 1.0);\n" +
      " gl_PointSize = on * uPx * (.008 + aV.w * .018) / -mv.z; gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform vec3 uColor; uniform float uAlpha; varying float vA;\n" +
      "void main(){ vec2 q = gl_PointCoord - .5; float d = length(q); float a = smoothstep(.5, .2, d); float hi = smoothstep(.22, .0, length(q + vec2(.12)));\n" +
      " gl_FragColor = vec4(uColor + hi * .6, (a * .85 + hi) * vA * uAlpha); }",
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  var pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 5;
  return pts;
}
