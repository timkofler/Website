// Lot & Linie – das Drahtgitter-Haus in 3D. Oben baut es sich beim Scrollen auf (Grundriss, Wände, Fenster, Dach),
// im Hausplaner zeichnet es sich bei jeder Änderung neu. Linien wachsen im Shader von ihrem Startpunkt zum Ende,
// frisch gezeichnete Linien leuchten kurz blau. Ohne WebGL zeichnet app.js dieselben Linien in 2D.
import { reduce, mobile, webglOk, whenNear, loadThree, stage, dragRotate, blobTexture } from "/beispiele/_shared/stage3d.js?v=2";

var H = window.LLHaus;
var COL = { ink: 0x1b1d21, acc: 0x2f5bd3, glass: 0x4a6fc9, tree: 0x6f8a6a };

var VS = [
  "uniform float uP;",
  "attribute vec3 aA; attribute vec3 aB; attribute float aE; attribute vec2 aT; attribute float aK;",
  "varying float vA; varying float vF; varying float vK; varying float vD;",
  "void main(){",
  "  float k = clamp((uP - aT.x) / max(aT.y - aT.x, 1e-4), 0., 1.);",
  "  k = k * k * (3. - 2. * k);",
  "  vec3 p = mix(aA, aB, aE * k);",
  "  vA = step(1e-4, uP - aT.x);",
  "  vF = max(clamp((uP - aT.y) * 9., 0., 1.), step(.999, uP));",
  "  vK = aK;",
  "  vec4 mv = modelViewMatrix * vec4(p, 1.);",
  "  vD = -mv.z;",
  "  gl_Position = projectionMatrix * mv;",
  "}"
].join("\n");
var FS = [
  "uniform vec3 uInk; uniform vec3 uAcc; uniform vec3 uGlass; uniform vec3 uTree;",
  "uniform float uNear; uniform float uFar; uniform float uFade;",
  "varying float vA; varying float vF; varying float vK; varying float vD;",
  "void main(){",
  "  if (vA < .5) discard;",
  "  vec3 base = uInk; float a = .88;",
  "  if (vK > .5 && vK < 1.5) { base = uAcc; a = .8; }",
  "  else if (vK > 1.5 && vK < 2.5) { base = uGlass; a = .78; }",
  "  else if (vK > 2.5 && vK < 3.5) { a = .17; }",
  "  else if (vK > 3.5 && vK < 4.5) { a = .36; }",
  "  else if (vK > 4.5) { base = uTree; a = .55; }",
  "  vec3 c = mix(uAcc, base, vF);",
  "  a = mix(max(a, .9), a, vF);",
  "  float fog = 1. - smoothstep(uNear, uFar, vD) * .62;",
  "  gl_FragColor = vec4(c, a * fog * uFade);",
  "}"
].join("\n");

function lines(THREE, data) {
  var s = data.segs, n = data.n, st = H.STRIDE;
  var A = new Float32Array(n * 6), B = new Float32Array(n * 6), E = new Float32Array(n * 2), T = new Float32Array(n * 4), K = new Float32Array(n * 2);
  for (var i = 0; i < n; i++) {
    var o = i * st;
    for (var v = 0; v < 2; v++) {
      var j = i * 2 + v;
      A[j * 3] = s[o]; A[j * 3 + 1] = s[o + 1]; A[j * 3 + 2] = s[o + 2];
      B[j * 3] = s[o + 3]; B[j * 3 + 1] = s[o + 4]; B[j * 3 + 2] = s[o + 5];
      E[j] = v; T[j * 2] = s[o + 6]; T[j * 2 + 1] = s[o + 7]; K[j] = s[o + 8];
    }
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(A, 3));
  g.setAttribute("aA", new THREE.BufferAttribute(A, 3));
  g.setAttribute("aB", new THREE.BufferAttribute(B, 3));
  g.setAttribute("aE", new THREE.BufferAttribute(E, 1));
  g.setAttribute("aT", new THREE.BufferAttribute(T, 2));
  g.setAttribute("aK", new THREE.BufferAttribute(K, 1));
  g.computeBoundingSphere(); g.boundingSphere.radius += 30;
  return g;
}

function house(THREE, opts, shared) {
  var data = H.build(opts), grp = new THREE.Group();
  var ls = new THREE.LineSegments(lines(THREE, data), shared.lineMat);
  ls.renderOrder = 1; ls.frustumCulled = false; grp.add(ls);
  var fg = new THREE.BufferGeometry(); fg.setAttribute("position", new THREE.BufferAttribute(data.faces, 3));
  var faces = new THREE.Mesh(fg, shared.faceMat); faces.renderOrder = 2; grp.add(faces);
  var sh = new THREE.Mesh(new THREE.PlaneGeometry(data.w * 1.9, data.d * 2.1), shared.shadowMat);
  sh.rotation.x = -Math.PI / 2; sh.position.y = .01; sh.renderOrder = 0; grp.add(sh);
  grp.userData = { data: data, dispose: function () { ls.geometry.dispose(); fg.dispose(); sh.geometry.dispose(); } };
  return grp;
}

function materials(THREE) {
  var lineMat = new THREE.ShaderMaterial({
    vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: true,
    uniforms: {
      uP: { value: 0 }, uFade: { value: 1 }, uNear: { value: 14 }, uFar: { value: 60 },
      uInk: { value: new THREE.Color(COL.ink) }, uAcc: { value: new THREE.Color(COL.acc) },
      uGlass: { value: new THREE.Color(COL.glass) }, uTree: { value: new THREE.Color(COL.tree) }
    }
  });
  var faceMat = new THREE.MeshBasicMaterial({ color: 0xf7f6f2, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  var shadowMat = new THREE.MeshBasicMaterial({ map: blobTexture(THREE, .22), transparent: true, opacity: 0, depthWrite: false });
  return { lineMat: lineMat, faceMat: faceMat, shadowMat: shadowMat };
}
function sstep(a, b, x) { var k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); }
function lerp(a, b, k) { return a + (b - a) * k; }
function solid(M, u) { var k = sstep(.9, 1, u); M.faceMat.opacity = k * .78; M.shadowMat.opacity = k; }

// ---------- Kopfbereich: Bau beim Scrollen ----------
var sec = document.getElementById("bau"), host = document.getElementById("bau3d");
if (sec && host && webglOk() && !reduce) {
  whenNear(host, function () { loadThree().then(function (T) { hero(T); }).catch(function () {}); }, "200px");
}

function hero(THREE) {
  var S = stage(THREE, host, { fov: 28, tone: false, alpha: true });
  var R = S.renderer, cam = S.camera, M = materials(THREE);
  R.setClearColor(0x000000, 0);
  var g = house(THREE, { w: 12.4, d: 9.2, floors: 2, roof: "sattel", keller: true }, M);
  S.scene.add(g);
  host.classList.add("is-on"); sec.classList.add("is-3d");
  var data = g.userData.data, cur = 0, target = 0, mx = 0, my = 0, smx = 0, smy = 0;
  function read() {
    var r = sec.getBoundingClientRect(), span = sec.offsetHeight - host.offsetHeight;
    target = Math.min(1, Math.max(0, -r.top / Math.max(1, span)));
  }
  addEventListener("scroll", read, { passive: true }); addEventListener("resize", read); read(); cur = target;
  if (!mobile) addEventListener("pointermove", function (e) { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });

  var tgt = new THREE.Vector3(), born = performance.now();
  S.onFrame(function (dt, t) {
    cur += (target - cur) * (1 - Math.exp(-dt * 5.5));
    smx += (mx - smx) * (1 - Math.exp(-dt * 3)); smy += (my - smy) * (1 - Math.exp(-dt * 3));
    // Beim Laden zeichnet sich Grundstück und Grundriss von selbst, ab dann baut das Scrollen weiter
    var p = cur, intro = .3 * sstep(0, 1, (performance.now() - born) / 2800), u = Math.max(intro, .3 + .7 * Math.min(1, p / .86));
    if (p < .002) u = intro;
    M.lineMat.uniforms.uP.value = u; solid(M, u);
    var w = host.clientWidth, h = host.clientHeight, asp = w / h, wide = asp > 1.05;
    // Kamera: zuerst fast senkrecht von oben auf den Plan, dann Schwenk in die Schrägansicht
    var pol = lerp(.16, 1.08, sstep(.1, .5, p)) - smy * .06;
    var az = -.55 + p * 1.25 + Math.sin(t * .12) * .04 + smx * .18;
    var rad = lerp(36, 40, sstep(.2, .9, p));
    if (asp < 1.05) rad *= Math.min(1.75, Math.max(1, .95 / asp));
    tgt.set(0, lerp(-.5, data.top * .55, sstep(.15, .7, p)), 0);
    cam.position.set(tgt.x + rad * Math.sin(pol) * Math.sin(az), tgt.y + rad * Math.cos(pol), tgt.z + rad * Math.sin(pol) * Math.cos(az));
    cam.lookAt(tgt);
    // Am PC rückt das Haus nach rechts, links steht der Text
    if (wide) cam.setViewOffset(w, h, -w * .2, -h * .03, w, h); else cam.setViewOffset(w, h, 0, h * lerp(-.13, .15, sstep(.01, .08, p)), w, h);
    M.lineMat.uniforms.uNear.value = rad * .55; M.lineMat.uniforms.uFar.value = rad * 1.7;
  });
}

// ---------- Hausplaner: zeichnet sich bei jeder Änderung neu ----------
var phost = document.getElementById("plan3d");
if (phost && webglOk(true)) {
  whenNear(phost, function () { loadThree().then(function (T) { planner(T); }).catch(function () {}); });
}

function planner(THREE) {
  var S = stage(THREE, phost, { fov: 30, tone: false, alpha: true });
  var cam = S.camera, M = materials(THREE), g = null, u = 1, t0 = 0, dur = reduce ? .001 : 2.2;
  S.renderer.setClearColor(0x000000, 0);
  phost.classList.add("is-on");
  var rot = dragRotate(phost, { yaw: .62, minYaw: -Math.PI, maxYaw: Math.PI * 2 });
  function set(opts) {
    if (g) { S.scene.remove(g); g.userData.dispose(); }
    g = house(THREE, Object.assign({ site: false, extras: true }, opts), M);
    S.scene.add(g); u = 0; t0 = performance.now();
  }
  set(window.LLPlan || { w: 12.4, d: 9.2, floors: 2, roof: "sattel", keller: true });
  addEventListener("ll:plan", function (e) { set(e.detail); });
  var tgt = new THREE.Vector3();
  S.onFrame(function (dt, t) {
    u = Math.min(1, (performance.now() - t0) / 1000 / dur);
    var uu = u < 1 ? .14 + u * .86 : 1;
    M.lineMat.uniforms.uP.value = uu; solid(M, uu);
    if (!rot.active && !reduce) rot.yaw += dt * .08;
    var d = g.userData.data, size = Math.max(d.w, d.d, d.height * 1.4), asp = phost.clientWidth / Math.max(1, phost.clientHeight);
    var rad = size * 3.1 * (asp < 1.2 ? 1.2 / asp : 1);
    tgt.set(0, d.height * .38, 0);
    cam.position.set(rad * Math.sin(1.08) * Math.sin(rot.yaw), tgt.y + rad * Math.cos(1.08), rad * Math.sin(1.08) * Math.cos(rot.yaw));
    cam.lookAt(tgt);
    M.lineMat.uniforms.uNear.value = rad * .6; M.lineMat.uniforms.uFar.value = rad * 1.6;
  });
}
