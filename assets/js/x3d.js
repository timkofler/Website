// CryptoX – 3D-Münze mit dem X-Logo: dunkles Metall, Lime-X, glühender Ring und Funken.
// Sitzt in jedem Element mit [data-x3d] (Mitte der "Das X"-Kacheln und im Schlussband),
// dreht sich beim Scrollen und neigt sich zum Zeiger. Three.js liegt lokal unter /assets/vendor/
// und wird erst geholt, wenn eine Münze in die Nähe des Bildschirms kommt. Ohne WebGL oder bei
// "Bewegung reduzieren" bleibt das bisherige X-Bild stehen.
var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
var small = !!(window.matchMedia && matchMedia("(max-width: 760px), (pointer: coarse)").matches);
var stages = Array.prototype.slice.call(document.querySelectorAll("[data-x3d]"));
var V = "/assets/vendor/three-r180/";

function webglOk() {
  try { var c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); }
  catch (e) { return false; }
}

function off(el) { el.classList.add("x3d-off"); }
if (stages.length && (reduce || !webglOk())) stages.forEach(off);
else if (stages.length) {
  var lib = null;
  var load = function () {
    if (!lib) lib = Promise.all([import(V + "three.module.min.js"), import(V + "RoomEnvironment.js")]);
    return lib;
  };
  stages.forEach(function (el) {
    var go = function () { load().then(function (m) { mount(m[0], m[1].RoomEnvironment, el); }).catch(function () { off(el); }); };
    if (!("IntersectionObserver" in window)) { go(); return; }
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); go(); }
    }, { rootMargin: "500px 0px" });
    io.observe(el);
  });
}

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function damp(a, b, k, dt) { return a + (b - a) * (1 - Math.exp(-k * dt)); }
function ease(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }

// ---------- Logo-Form ----------
// Das X aus hero.svg (in Pixeln einer 500er-Fläche): durchgehender Balken "\", der Balken "/" ist in der Mitte
// unterbrochen und läuft mit einem schmalen Spalt unter dem anderen durch.
var Y0 = 88, Y1 = 412, BW = 108, GAP = 15, CX = 231, CY = 250, SC = 1.72 / 324;
function bsL(y) { return 66 + (y - Y0) * (234 / 324); }      // linke Kante "\"
function slL(y) { return 300 - (y - Y0) * (246 / 324); }     // linke Kante "/"
// Konvexes Polygon an der Halbebene f(p) >= 0 abschneiden
function cut(poly, f) {
  var out = [];
  for (var i = 0; i < poly.length; i++) {
    var a = poly[i], b = poly[(i + 1) % poly.length], fa = f(a), fb = f(b);
    if (fa >= 0) out.push(a);
    if ((fa >= 0) !== (fb >= 0)) { var t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
  }
  return out;
}
function pieces() {
  var back = [[bsL(Y0), Y0], [bsL(Y0) + BW, Y0], [bsL(Y1) + BW, Y1], [bsL(Y1), Y1]];
  var slash = [[slL(Y0), Y0], [slL(Y0) + BW, Y0], [slL(Y1) + BW, Y1], [slL(Y1), Y1]];
  var up = cut(slash, function (p) { return p[0] - (bsL(p[1]) + BW + GAP); });
  var low = cut(slash, function (p) { return (bsL(p[1]) - GAP) - p[0]; });
  return [back, up, low];
}
function shape(THREE, pts) {
  var s = new THREE.Shape();
  pts.forEach(function (p, i) { var x = (p[0] - CX) * SC, y = (CY - p[1]) * SC; if (i) s.lineTo(x, y); else s.moveTo(x, y); });
  s.closePath();
  return s;
}

// ---------- Leuchten ----------
var GLOW_V = "varying vec2 vUv; varying float vF;\n" +
  "void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vec3 n = normalize(normalMatrix * normal);\n" +
  " vF = abs(dot(n, normalize(-mv.xyz))); gl_Position = projectionMatrix * mv; }";
var GLOW_F = "uniform vec3 uColor; uniform float uT, uSpeed, uTail, uBase, uAlpha, uHeads, uCore, uEdge, uDraw;\n" +
  "varying vec2 vUv; varying float vF;\n" +
  "void main(){ if (vUv.x > uDraw) discard; float a = fract((vUv.x - uT * uSpeed) * uHeads); float tr = pow(a, uTail);\n" +
  " float edge = pow(vF, uEdge); float al = (uBase + tr) * edge * uAlpha;\n" +
  " vec3 c = uColor * (0.8 + tr * 1.4) + vec3(1.0) * pow(tr, 3.0) * uCore * edge;\n" +
  " gl_FragColor = vec4(c, al); }";
function glowMat(THREE, o, alpha, core, edge) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(o.color) }, uT: { value: 0 }, uSpeed: { value: o.speed }, uTail: { value: o.tail },
      uBase: { value: o.base }, uAlpha: { value: alpha }, uHeads: { value: o.heads }, uCore: { value: core }, uEdge: { value: edge }, uDraw: { value: 1 } },
    vertexShader: GLOW_V, fragmentShader: GLOW_F, transparent: true, depthWrite: false, blending: o.normal ? THREE.NormalBlending : THREE.AdditiveBlending
  });
}
function neon(THREE, r, o) {
  var c = new THREE.Curve();
  c.getPoint = function (t, out) { out = out || new THREE.Vector3(); var a = Math.PI / 2 - t * Math.PI * 2; return out.set(Math.cos(a) * r, Math.sin(a) * r, 0); };
  var g = new THREE.Group(), core = glowMat(THREE, o, 1, 1, 1.6), halo = glowMat(THREE, o, o.halo, 0, 2.6);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 200, o.r, 8, true), core));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 200, o.r * o.wide, 10, true), halo));
  g.userData.mats = [core, halo]; g.userData.a = [1, o.halo];
  return g;
}
function brushed(THREE) {
  var c = document.createElement("canvas"); c.width = c.height = 512;
  var g = c.getContext("2d"), s = 5;
  function r() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }
  g.fillStyle = "#151515"; g.fillRect(0, 0, 512, 512);
  for (var i = 0; i < 220; i++) {
    g.strokeStyle = r() < .5 ? "rgba(255,255,255," + (r() * .05).toFixed(3) + ")" : "rgba(0,0,0," + (r() * .25).toFixed(3) + ")";
    g.lineWidth = .6 + r() * 1.6; g.beginPath(); g.arc(256, 256, r() * 256, 0, Math.PI * 2); g.stroke();
  }
  var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function dotTexture(THREE) {
  var c = document.createElement("canvas"); c.width = c.height = 128;
  var g = c.getContext("2d"), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.22, "rgba(255,255,255,.42)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// ---------- Münze in einem Element ----------
// data-x3d="light": auf hellem Grund (Schlussband) ohne additives Leuchten, das dort verschwinden würde.
function mount(THREE, RoomEnvironment, el) {
  var light = el.getAttribute("data-x3d") === "light";
  var R;
  try { R = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); }
  catch (e) { off(el); return; }
  var dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.5);
  R.setPixelRatio(dpr); R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  R.setClearColor(0x000000, 0);
  var cv = R.domElement; cv.className = "x3d__gl"; cv.setAttribute("aria-hidden", "true");
  el.appendChild(cv);

  var scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, .1, 60);
  var VIEW = 6.4; cam.position.set(0, 0, (VIEW / 2) / Math.tan(15 * Math.PI / 180)); cam.lookAt(0, 0, 0);
  var pm = new THREE.PMREMGenerator(R); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .9; pm.dispose();
  var key = new THREE.DirectionalLight("#ffffff", 1.4); key.position.set(-3, 3, 5); scene.add(key);
  var rim = new THREE.DirectionalLight("#dcf763", 4); rim.position.set(4, -1, 2); scene.add(rim);
  var rimB = new THREE.DirectionalLight("#ecff9e", 2.5); rimB.position.set(-4, 2, -3); scene.add(rimB);

  var rig = new THREE.Group(), spin = new THREE.Group(), badge = new THREE.Group();
  scene.add(rig); rig.add(spin); spin.add(badge);
  var coinMat = new THREE.MeshPhysicalMaterial({ color: "#151515", metalness: .85, roughness: .38, clearcoat: 1, clearcoatRoughness: .2 });
  var capMat = new THREE.MeshPhysicalMaterial({ map: brushed(THREE), metalness: .8, roughness: .34, clearcoat: 1, clearcoatRoughness: .25 });
  var coin = new THREE.Mesh(new THREE.CylinderGeometry(1.36, 1.36, .16, 128, 1), [coinMat, capMat, capMat]);
  coin.rotation.x = Math.PI / 2; badge.add(coin);
  badge.add(new THREE.Mesh(new THREE.TorusGeometry(1.36, .045, 20, 160), new THREE.MeshPhysicalMaterial({ color: "#2a2a2a", metalness: 1, roughness: .22, clearcoat: 1 })));
  var inlay = new THREE.MeshBasicMaterial({ color: "#dcf763", toneMapped: false });
  [.085, -.085].forEach(function (z) { var m = new THREE.Mesh(new THREE.TorusGeometry(1.22, .007, 8, 160), inlay); m.position.z = z; badge.add(m); });

  var ext = { depth: .16, bevelEnabled: true, bevelThickness: .035, bevelSize: .022, bevelSegments: 3, curveSegments: 1 };
  var xMat = new THREE.MeshPhysicalMaterial({ color: "#dcf763", emissive: "#a8c61a", emissiveIntensity: .25, metalness: .35, roughness: .26, clearcoat: 1, clearcoatRoughness: .1 });
  xMat.toneMapped = false; // sonst wird das Lime blass
  var geos = pieces().map(function (p) { return new THREE.ExtrudeGeometry(shape(THREE, p), ext); });
  var parts = [];
  [1, -1].forEach(function (side) {
    var g = new THREE.Group();
    geos.forEach(function (geo) { var m = new THREE.Mesh(geo, xMat); g.add(m); parts.push(m); });
    g.position.z = side * .065; if (side < 0) g.rotation.y = Math.PI;
    badge.add(g);
  });

  var ring = neon(THREE, 1.5, { color: light ? "#14160a" : "#dcf763", r: .014, wide: light ? 3 : 7, halo: light ? .25 : .5, base: .55, speed: .22, heads: 2, tail: 4, normal: light });
  spin.add(ring);
  var glowM = new THREE.SpriteMaterial({ map: dotTexture(THREE), color: light ? "#ffffff" : "#c6e83a", transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
  var glow = new THREE.Sprite(glowM); glow.scale.set(5, 5, 1); glow.position.z = -1.2; rig.add(glow);

  // ---------- Größe ----------
  var S = 0;
  function measure() {
    var r = el.getBoundingClientRect(), s = Math.round(Math.max(r.width, r.height) * 2);
    if (s && s !== S) { S = s; R.setSize(S, S, false); cv.style.width = cv.style.height = S + "px"; }
  }
  measure();
  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(el); else addEventListener("resize", measure);

  // ---------- Zeiger ----------
  var nx = 0, ny = 0, mx = 0, my = 0;
  if (!small) addEventListener("pointermove", function (e) {
    var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    nx = clamp((e.clientX - cx) / (innerWidth * .5), -1, 1); ny = clamp((e.clientY - cy) / (innerHeight * .5), -1, 1);
  }, { passive: true });

  // ---------- Ablauf ----------
  var visible = false, inView = false, raf = 0, last = 0, t0 = 0, prog = 0, first = true;
  function frame(now) {
    raf = 0; if (!visible) return;
    try {
      var dt = last ? Math.min(.5, (now - last) / 1000) : .016; last = now;
      if (!t0) t0 = now;
      var t = (now - t0) / 1000;
      var r = el.getBoundingClientRect();
      // 0 = Münze kommt unten herein, 1 = sie verlässt oben den Bildschirm
      var raw = clamp((innerHeight - (r.top + r.height / 2)) / (innerHeight + r.height), 0, 1);
      prog = damp(prog, raw, 5, dt);
      var a = ease(t / 1.5);
      mx = damp(mx, nx, 3, dt); my = damp(my, ny, 3, dt);
      spin.rotation.y = (1 - a) * -2.2 + Math.sin(t * .55) * .25 + (prog - .45) * Math.PI * (small ? 1 : 1.5);
      spin.rotation.x = Math.sin(t * .4) * .06;
      rig.rotation.x = my * .3; rig.rotation.y = mx * .4;
      rig.position.y = Math.sin(t * .9) * .05;
      rig.scale.setScalar(.82 + a * .18);
      xMat.emissiveIntensity = .2 + Math.sin(t * 2.2) * .07;
      ring.userData.mats.forEach(function (m, i) { m.uniforms.uT.value = t; m.uniforms.uDraw.value = ease(t / 1.4); m.uniforms.uAlpha.value = ring.userData.a[i]; });
      glowM.opacity = (light ? .35 : .45) * a;
      R.render(scene, cam);
      if (first) { first = false; el.classList.add("is-3d"); }
    } catch (e) { visible = false; if (first) off(el); return; }
    raf = requestAnimationFrame(frame);
  }
  function start() { if (visible && !raf) { last = 0; raf = requestAnimationFrame(frame); } }
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) {
    inView = es[es.length - 1].isIntersecting; visible = inView && !document.hidden; start();
  }, { rootMargin: "80px 0px" }).observe(el);
  else { inView = visible = true; }
  document.addEventListener("visibilitychange", function () { visible = inView && !document.hidden; start(); });
  start();
}
