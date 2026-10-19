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
export function label(THREE, key) {
  var S = SORTEN[key], W = 2048, H = 1328, fx = W * .5;
  var a = canvas(W, H), c = a[0], g = a[1], b = canvas(W, H), ce = b[0], e = b[1];
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
// can.userData.set(key) tauscht das Etikett, can.userData.glow(k) regelt das Leuchten.
export function can(THREE, key, o) {
  o = o || {};
  var seg = o.seg || 72, grp = new THREE.Group(), inner = new THREE.Group(); inner.position.y = -.81; grp.add(inner);
  var labels = {}, cur = null;
  function get(k) { return labels[k] || (labels[k] = label(THREE, k)); }
  var L = get(key);
  var body = new THREE.Mesh(lathe(THREE, [[.33, .075], [.33, 1.42]], seg),
    new THREE.MeshStandardMaterial({ map: L.map, emissiveMap: L.emissive, emissive: "#ffffff", emissiveIntensity: .9, metalness: .55, roughness: .34 }));
  body.rotation.y = Math.PI; inner.add(body);
  var alu = new THREE.MeshStandardMaterial({ color: "#c9ccd1", metalness: 1, roughness: .26 });
  inner.add(new THREE.Mesh(lathe(THREE, [[0, .045], [.18, .03], [.24, 0], [.29, 0], [.318, .025], [.33, .075]], seg), alu));
  inner.add(new THREE.Mesh(lathe(THREE, [[.33, 1.42], [.318, 1.47], [.29, 1.52], [.268, 1.555], [.264, 1.585], [.272, 1.595], [.274, 1.607], [.266, 1.613], [.255, 1.606], [.25, 1.588], [0, 1.588]], seg), alu));
  // Verschluss: Lasche mit Fingerring und Niete.
  var tabM = new THREE.MeshStandardMaterial({ color: "#d7d9dd", metalness: 1, roughness: .22 });
  var plate = new THREE.Mesh(new THREE.BoxGeometry(.075, .008, .15), tabM); plate.position.set(0, 1.594, .03); inner.add(plate);
  var fing = new THREE.Mesh(new THREE.TorusGeometry(.038, .01, 8, 24), tabM); fing.rotation.x = Math.PI / 2; fing.scale.set(1, 1.25, .6); fing.position.set(0, 1.595, .1); inner.add(fing);
  var rivet = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .014, 16), tabM); rivet.position.set(0, 1.594, 0); inner.add(rivet);
  var score = new THREE.Mesh(new THREE.TorusGeometry(.06, .004, 6, 32), new THREE.MeshStandardMaterial({ color: "#8f9399", metalness: 1, roughness: .4 }));
  score.rotation.x = Math.PI / 2; score.scale.set(1, 1.3, 1); score.position.set(0, 1.589, -.12); inner.add(score);
  grp.userData.set = function (k) {
    if (k === cur) return; cur = k; var l = get(k);
    body.material.map = l.map; body.material.emissiveMap = l.emissive; body.material.metalness = SORTEN[k].gold ? .85 : .55;
    body.material.roughness = SORTEN[k].gold ? .28 : .34; body.material.needsUpdate = true;
  };
  // Etikett vorab zeichnen und hochladen, damit der Wechsel mitten im Scrollen nicht hakt.
  grp.userData.preload = function (k, renderer) { var l = get(k); if (renderer) { renderer.initTexture(l.map); renderer.initTexture(l.emissive); } };
  grp.userData.glow = function (k) { body.material.emissiveIntensity = k; };
  grp.userData.set(key);
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

// Spirale, die sich von unten außen um die Dose nach oben schraubt und oben wieder ausschwingt.
export function helix(THREE, o) {
  o = o || {};
  var pts = [], n = 60, turns = o.turns || 2.2;
  for (var i = 0; i <= n; i++) {
    var t = i / n, ang = t * Math.PI * 2 * turns + (o.phase || 0), out = Math.pow(Math.abs(t - .5) * 2, 3);
    var r = (o.r || .55) + .12 * Math.sin(t * 9) + out * (o.flare || 1.4);
    pts.push(new THREE.Vector3(Math.cos(ang) * r, -1.25 + t * 2.6 + Math.sin(t * 5) * .08, Math.sin(ang) * r * .85));
  }
  return new THREE.CatmullRomCurve3(pts, false, "catmullrom", .4);
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
