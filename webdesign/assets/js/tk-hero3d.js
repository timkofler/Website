// Tim Kofler – 3D-Zeichen im Kopfbereich der Startseite: TK-Logo als Metall-Plakette mit glühendem Ring,
// Umlaufbahnen und Funken. Fährt beim Scrollen mit, dreht sich dabei einmal um sich selbst und löst sich am Ende auf.
// Three.js kommt lokal aus /beispiele/_shared/vendor/ und wird erst nach dem Laden der Seite geholt.
// Ohne WebGL, bei "Bewegung reduzieren" oder auf schwachen Geräten bleibt das Standbild (tk-3d.webp) stehen.
var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
var small = !!(window.matchMedia && matchMedia("(max-width: 760px), (pointer: coarse)").matches);
var root = document.documentElement;
var hero = document.querySelector(".tk-hero"), stageEl = hero && hero.querySelector(".tk-hero__stage");

// Ohne Grafikkarte rechnet der Browser WebGL in Software (SwiftShader, llvmpipe): dann ruckelt die Plakette
// und blockiert die Seite, deshalb bleibt dort ebenfalls das Standbild stehen.
function webglOk() {
  try {
    var c = document.createElement("canvas"), gl = window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"));
    if (!gl) return false;
    var ext = gl.getExtension("WEBGL_debug_renderer_info"), r = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(String(r || ""))) return false;
    var lose = gl.getExtension("WEBGL_lose_context"); if (lose) lose.loseContext();
    return true;
  }
  catch (e) { return false; }
}

// Datensparmodus, langsames Netz (2G/3G) oder wenig Arbeitsspeicher: Three.js (rund 700 KB) gar nicht erst laden
function lowEnd() {
  var c = navigator.connection || {};
  return !!(c.saveData || /(^|-)(2g|3g)$/.test(c.effectiveType || "") || (navigator.deviceMemory && navigator.deviceMemory < 4));
}
function still() { root.classList.add("tk-3d-still"); }

if (!hero || !stageEl) { /* andere Seite */ }
else if (reduce || lowEnd() || !webglOk()) still();
else {
  root.classList.add("tk-3d");
  var go = function () {
    Promise.all([
      import("/beispiele/_shared/vendor/three-r180/three.module.min.js"),
      import("/beispiele/_shared/vendor/three-r180/RoomEnvironment.js")
    ]).then(function (m) { build(m[0], m[1].RoomEnvironment); })
      .catch(function () { root.classList.remove("tk-3d"); still(); });
  };
  if (document.readyState === "complete") setTimeout(go, 300);
  else addEventListener("load", function () { setTimeout(go, 300); });
}

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function damp(a, b, k, dt) { return a + (b - a) * (1 - Math.exp(-k * dt)); }
function ease(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }

// Logo-Umrisse aus tk-badge-2.svg (Einheiten der SVG, 702 × 358,5)
var T_PTS = [[0, .5], [502, .5], [389, 87.5], [286, 87.5], [286, 281.5], [187.5, 354.5], [187.5, 87.5], [104, 87.5]];
var K_PTS = [[540, 0], [702, 0], [470, 180.5], [701, 358.5], [540, 358.5], [307, 181.5]];
var LS = 2 / 702, LCX = 351, LCY = 179.25;

function shape(THREE, pts) {
  var s = new THREE.Shape();
  pts.forEach(function (p, i) { var x = (p[0] - LCX) * LS, y = (LCY - p[1]) * LS; if (i) s.lineTo(x, y); else s.moveTo(x, y); });
  s.closePath();
  return s;
}

var GLOW_V = "varying vec2 vUv; varying float vF;\n" +
  "void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vec3 n = normalize(normalMatrix * normal);\n" +
  " vF = abs(dot(n, normalize(-mv.xyz))); gl_Position = projectionMatrix * mv; }";
// Leuchtröhre: Grundschein plus wandernde Lichtköpfe mit Schweif (uHeads), weicher Rand über vF.
var GLOW_F = "uniform vec3 uColor; uniform float uT, uSpeed, uTail, uBase, uAlpha, uHeads, uCore, uEdge, uDraw;\n" +
  "varying vec2 vUv; varying float vF;\n" +
  "void main(){ if (vUv.x > uDraw) discard; float a = fract((vUv.x - uT * uSpeed) * uHeads); float tr = pow(a, uTail);\n" +
  " float edge = pow(vF, uEdge); float al = (uBase + tr) * edge * uAlpha;\n" +
  " vec3 c = uColor * (0.8 + tr * 1.4) + vec3(1.0) * pow(tr, 3.0) * uCore * edge;\n" +
  " gl_FragColor = vec4(c, al); }";

function glowMat(THREE, o) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(o.color) }, uT: { value: 0 }, uSpeed: { value: o.speed }, uTail: { value: o.tail || 3 },
      uBase: { value: o.base }, uAlpha: { value: o.alpha }, uHeads: { value: o.heads || 1 }, uCore: { value: o.core == null ? 1 : o.core },
      uEdge: { value: o.edge || 1.6 }, uDraw: { value: 1 } },
    vertexShader: GLOW_V, fragmentShader: GLOW_F, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
}

// Kreis als Kurve in der xy-Ebene, Anfang oben
function circle(THREE, r) {
  var c = new THREE.Curve();
  c.getPoint = function (t, out) { out = out || new THREE.Vector3(); var a = Math.PI / 2 - t * Math.PI * 2; return out.set(Math.cos(a) * r, Math.sin(a) * r, 0); };
  return c;
}

// Röhre mit hellem Kern und breitem, schwachem Schein
function neon(THREE, r, o) {
  var g = new THREE.Group(), curve = circle(THREE, r);
  var core = glowMat(THREE, Object.assign({}, o, { alpha: 1 })), halo = glowMat(THREE, Object.assign({}, o, { alpha: o.halo, core: 0, edge: 2.6 }));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, o.seg || 200, o.r, 8, true), core));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, o.seg || 200, o.r * o.wide, 10, true), halo));
  g.userData.mats = [core, halo]; g.userData.a = [1, o.halo];
  return g;
}

function dotTexture(THREE) {
  var c = document.createElement("canvas"); c.width = c.height = 128;
  var g = c.getContext("2d"), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.22, "rgba(255,255,255,.42)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// Funken auf einer Kugelschale, die langsam aufsteigen; uBoost treibt sie beim Scrollen nach außen.
function sparks(THREE, n) {
  var pos = new Float32Array(n * 3), seed = new Float32Array(n), s = 11;
  function r() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }
  for (var i = 0; i < n; i++) {
    var th = r() * Math.PI * 2, ph = Math.acos(2 * r() - 1), rad = 1.55 + r() * 1.5;
    pos[i * 3] = Math.sin(ph) * Math.cos(th) * rad; pos[i * 3 + 1] = (r() - .5) * 3.6; pos[i * 3 + 2] = Math.cos(ph) * rad * .6;
    seed[i] = r();
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("aS", new THREE.BufferAttribute(seed, 1));
  var mat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uPx: { value: 400 }, uAlpha: { value: 0 }, uBoost: { value: 0 } },
    vertexShader: "attribute float aS; uniform float uT, uPx, uBoost; varying float vA;\n" +
      "void main(){ vec3 p = position; float y = mod(p.y + 1.8 + uT * (.08 + aS * .16), 3.6); p.y = y - 1.8;\n" +
      " p.xz *= 1.0 + uBoost * (0.6 + aS); p.x += sin(uT * .7 + aS * 40.0) * .05;\n" +
      " vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_PointSize = uPx * (0.012 + aS * 0.026) / -mv.z;\n" +
      " vA = (0.3 + 0.7 * aS) * smoothstep(0.0, 0.5, y) * smoothstep(3.6, 2.6, y); gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform float uAlpha; varying float vA;\n" +
      "void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, .0, d); a *= a;\n" +
      " gl_FragColor = vec4(vec3(1.0, .45, .16) + a * .5, a * vA * uAlpha); }",
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  return new THREE.Points(geo, mat);
}

// Gebürstete Münzfläche: feine konzentrische Kreise
function brushed(THREE) {
  var c = document.createElement("canvas"); c.width = c.height = 512;
  var g = c.getContext("2d"), s = 5;
  function r() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }
  g.fillStyle = "#161616"; g.fillRect(0, 0, 512, 512);
  for (var i = 0; i < 220; i++) {
    g.strokeStyle = r() < .5 ? "rgba(255,255,255," + (r() * .05).toFixed(3) + ")" : "rgba(0,0,0," + (r() * .25).toFixed(3) + ")";
    g.lineWidth = .6 + r() * 1.6; g.beginPath(); g.arc(256, 256, r() * 256, 0, Math.PI * 2); g.stroke();
  }
  var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

function build(THREE, RoomEnvironment) {
  var R;
  try { R = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); }
  catch (e) { root.classList.remove("tk-3d"); still(); return; }
  var dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.25);
  R.setPixelRatio(dpr); R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  R.setClearColor(0x000000, 0);
  var cv = R.domElement; cv.className = "tk-hero__gl"; cv.setAttribute("aria-hidden", "true");
  hero.appendChild(cv);

  var scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, .1, 60);
  // Die Leinwand ist doppelt so groß wie die Bühne: Die Plakette (Ring ⌀ 2,8) füllt die mittlere Hälfte.
  var VIEW = 6.4, DIST = (VIEW / 2) / Math.tan(15 * Math.PI / 180);
  cam.position.set(0, 0, DIST); cam.lookAt(0, 0, 0);
  var pm = new THREE.PMREMGenerator(R); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .9; pm.dispose();

  var key = new THREE.DirectionalLight("#ffffff", 1.4); key.position.set(-3, 3, 5); scene.add(key);
  var warm = new THREE.DirectionalLight("#ff6a2a", 5); warm.position.set(4, -1, 2); scene.add(warm);
  var rimL = new THREE.DirectionalLight("#ffb23f", 3); rimL.position.set(-4, 2, -3); scene.add(rimL);

  var rig = new THREE.Group(); scene.add(rig);     // Position, Größe, Neigung zum Zeiger
  var spin = new THREE.Group(); rig.add(spin);     // Drehung beim Scrollen und Ziehen
  var badge = new THREE.Group(); spin.add(badge);

  // Münze: dunkles, gebürstetes Metall mit Fase
  var coinMat = new THREE.MeshPhysicalMaterial({ color: "#151515", metalness: .85, roughness: .38, clearcoat: 1, clearcoatRoughness: .2 });
  var capMat = new THREE.MeshPhysicalMaterial({ map: brushed(THREE), metalness: .8, roughness: .34, clearcoat: 1, clearcoatRoughness: .25 });
  var coin = new THREE.Mesh(new THREE.CylinderGeometry(1.36, 1.36, .16, 128, 1), [coinMat, capMat, capMat]);
  coin.rotation.x = Math.PI / 2; badge.add(coin);
  var rimMat = new THREE.MeshPhysicalMaterial({ color: "#2a2a2a", metalness: 1, roughness: .22, clearcoat: 1 });
  var rimT = new THREE.Mesh(new THREE.TorusGeometry(1.36, .045, 20, 160), rimMat);
  badge.add(rimT);
  // Feiner oranger Einlegering auf beiden Seiten
  var inlayMat = new THREE.MeshBasicMaterial({ color: "#ff5a1f", toneMapped: false });
  [.085, -.085].forEach(function (z) { var m = new THREE.Mesh(new THREE.TorusGeometry(1.2, .007, 8, 160), inlayMat); m.position.z = z; badge.add(m); });

  // Buchstaben: T in hellem Metall, K glühend orange; auf beiden Seiten der Münze lesbar
  var ext = { depth: .16, bevelEnabled: true, bevelThickness: .035, bevelSize: .022, bevelSegments: 3, curveSegments: 1 };
  var tGeo = new THREE.ExtrudeGeometry(shape(THREE, T_PTS), ext), kGeo = new THREE.ExtrudeGeometry(shape(THREE, K_PTS), ext);
  var tMat = new THREE.MeshPhysicalMaterial({ color: "#ffffff", metalness: .9, roughness: .16, clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: 1.7 });
  var kMat = new THREE.MeshPhysicalMaterial({ color: "#ff5a1f", emissive: "#ff3c0c", emissiveIntensity: .3, metalness: .3, roughness: .28, clearcoat: 1, clearcoatRoughness: .1 });
  kMat.toneMapped = false; // sonst bleicht die Filmkurve das Signal-Orange aus
  var letters = [];
  [1, -1].forEach(function (side) {
    var g = new THREE.Group();
    var t = new THREE.Mesh(tGeo, tMat), k = new THREE.Mesh(kGeo, kMat);
    g.add(t); g.add(k); g.scale.setScalar(.92);
    g.position.z = side * .065;
    if (side < 0) g.rotation.y = Math.PI;
    badge.add(g); letters.push({ g: g, t: t, k: k });
  });

  // Glühender Ring, der sich beim Start einmal herumzeichnet
  var ring = neon(THREE, 1.5, { color: "#ff5a1f", r: .014, wide: 7, halo: .5, base: .55, speed: .22, heads: 2, tail: 4 });
  spin.add(ring);
  // Zwei Umlaufbahnen, schräg gestellt
  var orbits = [
    neon(THREE, 1.95, { color: "#ffb23f", r: .006, wide: 7, halo: .35, base: .08, speed: .16, heads: 1, tail: 6, seg: 220 }),
    neon(THREE, 2.2, { color: "#ff7a2a", r: .006, wide: 7, halo: .35, base: .06, speed: -.12, heads: 1, tail: 6, seg: 220 })
  ];
  var orbitRig = [new THREE.Group(), new THREE.Group()];
  orbits.forEach(function (o, i) { orbitRig[i].add(o); rig.add(orbitRig[i]); });

  // Weicher Schein hinter der Münze
  var dot = dotTexture(THREE);
  var glowM = new THREE.SpriteMaterial({ map: dot, color: "#ff5a1f", transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
  var glow = new THREE.Sprite(glowM); glow.scale.set(5.4, 5.4, 1); glow.position.z = -1.2; rig.add(glow);

  var sp = sparks(THREE, small ? 70 : 120); rig.add(sp);

  // ---------- Platz und Größe ----------
  // cx/cy: Mitte der Bühne in Seitenkoordinaten, bottom: Unterkante des Kopfbereichs (dort beginnt das Laufband)
  // cut: Unterkante des Laufbands; am Handy wird die Leinwand dort abgeschnitten, damit nichts in den nächsten Abschnitt ragt
  var W = 0, H = 0, S = 0, cx = 0, cy = 0, heroTop = 0, heroH = 1, bottom = 0, cut = 0, mq = document.querySelector(".tk-marquee");
  function measure() {
    var hr = hero.getBoundingClientRect(), sr = stageEl.getBoundingClientRect();
    heroTop = hr.top + scrollY; heroH = hr.height || 1; bottom = heroTop + heroH;
    var mr = mq && mq.getBoundingClientRect();
    cut = mr && mr.height ? mr.bottom + scrollY : bottom; // Laufband am Handy ausgeblendet: dann am Ende des Kopfbereichs schneiden
    S = Math.round(Math.max(sr.width, sr.height) * 2);
    cx = sr.left + sr.width / 2; cy = sr.top + scrollY + sr.height / 2;
    if (S !== W) { W = H = S; R.setSize(S, S, false); cv.style.width = cv.style.height = S + "px"; cam.aspect = 1; cam.updateProjectionMatrix(); }
    sp.material.uniforms.uPx.value = S * dpr * .9;
  }
  measure();
  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(hero); else addEventListener("resize", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  // ---------- Zeiger: Neigung (PC) und Ziehen zum Drehen ----------
  var nx = 0, ny = 0, mx = 0, my = 0, drag = false, lastX = 0, vel = 0, extra = 0;
  if (!small) addEventListener("pointermove", function (e) { nx = e.clientX / innerWidth * 2 - 1; ny = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  stageEl.addEventListener("pointerdown", function (e) { drag = true; lastX = e.clientX; vel = 0; stageEl.classList.add("is-drag"); }, { passive: true });
  addEventListener("pointermove", function (e) { if (!drag) return; var d = (e.clientX - lastX) / Math.max(S * .5, 1); lastX = e.clientX; extra += d * 3.2; vel = d * 3.2 * 60; }, { passive: true });
  function up() { if (drag) { drag = false; stageEl.classList.remove("is-drag"); } }
  addEventListener("pointerup", up); addEventListener("pointercancel", up);

  // ---------- Ablauf ----------
  var inView = true, visible = true, raf = 0, last = 0, t0 = 0, sp0 = 0, prog = 0, frames = 0, slow = 0, checked = false, first = true;
  // Am Handy fährt die Plakette fast mit dem Inhalt mit und blendet erst aus, wenn sie hinter dem Laufband steckt.
  var ride = small ? .25 : .58, span = small ? 1.1 : .75;
  var ringEl = stageEl.querySelector(".tk-ring");
  function frame(now) {
    raf = 0; if (!visible) return;
    var gap = last ? now - last : 16, dt = Math.min(.05, gap / 1000); last = now;
    if (!t0) t0 = now;
    var t = (now - t0) / 1000;

    // Fortschritt: 0 oben, 1 sobald der Kopfbereich zu drei Vierteln (Handy: ganz) weggescrollt ist
    var raw = clamp((scrollY - heroTop + 80) / (heroH * span), 0, 1);
    // Langsam nachziehen, damit Mausrad-Rucke nicht als Sprung ankommen
    prog = damp(prog, raw, 3, dt);
    var p = prog, fade;

    // Mitfahren: Die Plakette wandert langsamer nach oben als der Inhalt und taucht dabei hinter das Laufband.
    // Black Edition: Plakette steht auf dem Lichthorizont und scrollt ganz normal mit, unten am Laufband abgeschnitten
    var bk = root.classList.contains("tk-black");
    var sy = Math.max(0, scrollY - heroTop), y = cy - scrollY + sy * (bk ? 0 : ride), d = bottom - scrollY - y;
    if (small || bk) {
      var dc = cut - scrollY - y, clip = Math.max(0, H / 2 - dc);
      fade = clamp((dc + S * .2) / (S * .2), 0, 1);
      cv.style.clipPath = clip ? "inset(0 0 " + clip.toFixed(1) + "px 0)" : "";
    } else { fade = clamp((d - S * .1) / (S * .16), 0, 1); if (cv.style.clipPath) cv.style.clipPath = ""; }
    cv.style.transform = "translate3d(" + (cx - W / 2).toFixed(1) + "px," + (y - H / 2).toFixed(1) + "px,0)";
    cv.style.opacity = fade.toFixed(3);

    // Auftritt: Münze dreht sich herein, Ring zeichnet sich, Buchstaben rücken an
    var a = ease(t / 1.6), a2 = ease((t - .5) / 1.2);
    mx = damp(mx, nx, 3, dt); my = damp(my, ny, 3, dt);
    if (!drag) { extra += vel * dt; vel = damp(vel, 0, 2.2, dt); extra = damp(extra, Math.round(extra / (Math.PI * 2)) * Math.PI * 2, vel * vel < .2 ? 1.6 : 0, dt); }
    // Beim Scrollen eine weiche halbe Drehung statt einer ganzen schnellen Runde; startet sofort und läuft sanft aus
    var idle = Math.sin(t * .55) * .2, tilt = p * (2 - p);
    spin.rotation.y = (1 - a) * -2.4 + idle + tilt * Math.PI * 1.1 + extra;
    spin.rotation.x = Math.sin(t * .4) * .06 + tilt * .3;
    rig.rotation.x = my * .22; rig.rotation.y = mx * .3;
    rig.position.y = Math.sin(t * .9) * .05 - p * .4;
    var sc = (.82 + a * .18) * (1 - p * .22);
    rig.scale.setScalar(sc);
    // Buchstaben-Ring (DOM, tk-extra.js) fährt mit der Plakette mit, schrumpft mit und blendet gemeinsam aus,
    // damit er beim Scrollen nicht allein stehen bleibt
    if (ringEl) { ringEl.style.translate = "0 " + (sy * (bk ? 0 : ride)).toFixed(1) + "px"; ringEl.style.scale = (1 - p * .22).toFixed(3); ringEl.style.opacity = fade.toFixed(3); }
    letters.forEach(function (L, i) { L.t.position.x = -(1 - a2) * .35; L.k.position.x = (1 - a2) * .35; });
    kMat.emissiveIntensity = .3 + Math.sin(t * 2.2) * .08 + p * .35;

    var ru = ring.userData.mats;
    ru.forEach(function (m, i) { m.uniforms.uT.value = t; m.uniforms.uDraw.value = ease(t / 1.4); m.uniforms.uAlpha.value = ring.userData.a[i] * (1 + p * .8); });
    ring.scale.setScalar(1 + p * .12);
    orbits.forEach(function (o, i) {
      var r = orbitRig[i], dir = i ? -1 : 1;
      r.rotation.set(1.15 + dir * .25 + p * (i ? -.5 : .6), dir * .5 + t * .05 * dir, t * .12 * dir);
      r.scale.setScalar(1 + p * (.5 + i * .25));
      o.userData.mats.forEach(function (m, k) { m.uniforms.uT.value = t; m.uniforms.uDraw.value = ease((t - .6 - i * .3) / 1.4); m.uniforms.uAlpha.value = o.userData.a[k] * (1 + p); });
    });
    glowM.opacity = .55 * a * (1 + p * .4);
    var su = sp.material.uniforms; su.uT.value = t; su.uAlpha.value = a2; su.uBoost.value = p * 1.2;

    R.render(scene, cam);
    if (first) { first = false; root.classList.add("tk-3d-on"); }

    // Schwaches Gerät: 60 Bilder messen, dann die Auflösung senken; reicht auch das nicht (unter 24 Bildern/s), bleibt das Standbild
    if (!checked) {
      if (gap < 400) { frames++; slow += gap; }
      if (frames >= 60) {
        var avg = slow / frames; frames = slow = 0;
        if (dpr > 1 && avg > 24) { dpr = 1; R.setPixelRatio(1); W = 0; measure(); }
        else if (avg > 42) { stop(); return; }
        else checked = true;
      }
    }
    raf = requestAnimationFrame(frame);
  }
  var dead = false;
  // Wechsel aufs Standbild: erst das Bild laden, dann die Leinwand sanft ausblenden
  function stop() {
    dead = true; if (raf) cancelAnimationFrame(raf); raf = 0;
    var im = stageEl.querySelector(".tk-hero__still"), done = false;
    function fade() {
      if (done) return; done = true;
      cv.style.transition = "opacity .5s"; cv.style.opacity = "0";
      setTimeout(function () { cv.remove(); R.dispose(); root.classList.remove("tk-3d", "tk-3d-on"); if (ringEl) ringEl.style.translate = ringEl.style.scale = ringEl.style.opacity = ""; }, 600);
    }
    root.classList.add("tk-3d-still");
    if (im && im.decode) { im.loading = "eager"; im.decode().then(fade, fade); setTimeout(fade, 1500); } else fade();
  }
  function start() { if (!dead && visible && !raf) { last = 0; raf = requestAnimationFrame(frame); } }
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) {
    inView = es[es.length - 1].isIntersecting; root.classList.toggle("tk-3d-view", inView);
    visible = inView && !document.hidden; cv.style.visibility = inView ? "" : "hidden"; start();
  }).observe(hero);
  document.addEventListener("visibilitychange", function () { visible = inView && !document.hidden; start(); });
  start();
}
