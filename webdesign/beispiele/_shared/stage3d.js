// Gemeinsamer Unterbau für die 3D-Effekte der Beispielseiten (Tischlerei, Maler, Gasthaus, Dashboard).
// Three.js liegt lokal unter vendor/ und wird erst geladen, wenn der Effekt in die Nähe des Bildschirms kommt.
// Ohne WebGL oder bei "weniger Bewegung" bleibt die bisherige 2D-Fassung der Seite stehen.
export const reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
export const mobile = !!(window.matchMedia && matchMedia("(max-width: 760px), (pointer: coarse)").matches);

export function webglOk() {
  try { var c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); }
  catch (e) { return false; }
}

// Ruft cb einmal auf, sobald el bis auf margin an den sichtbaren Bereich herankommt.
export function whenNear(el, cb, margin) {
  if (!("IntersectionObserver" in window)) { cb(); return; }
  var io = new IntersectionObserver(function (es) {
    if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); cb(); }
  }, { rootMargin: (margin || "400px") + " 0px" });
  io.observe(el);
}

export function loadThree() { return import("/beispiele/_shared/vendor/three-r180/three.module.min.js"); }

// Renderer, Szene und Kamera in host; zeichnet nur, solange host sichtbar ist.
export function stage(THREE, host, o) {
  o = o || {};
  var renderer = new THREE.WebGLRenderer({ antialias: !mobile || devicePixelRatio < 2, alpha: !!o.alpha, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.6 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  if (o.tone !== false) { renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = o.exposure || 1; }
  if (o.shadows) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; }
  var cv = renderer.domElement; cv.className = "s3d"; cv.setAttribute("aria-hidden", "true");
  host.appendChild(cv);
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(o.fov || 35, 1, .05, 200);
  var frames = [], visible = false, raf = 0, last = 0;
  function size() {
    var w = host.clientWidth || 1, h = host.clientHeight || 1;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (o.onResize) o.onResize(w, h);
  }
  function loop(t) {
    raf = 0; if (!visible) return;
    var dt = Math.min(.05, last ? (t - last) / 1000 : .016); last = t;
    for (var i = 0; i < frames.length; i++) frames[i](dt, t / 1000);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }
  function go() { if (visible && !raf) { last = 0; raf = requestAnimationFrame(loop); } }
  if ("ResizeObserver" in window) new ResizeObserver(size).observe(host); else window.addEventListener("resize", size);
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[es.length - 1].isIntersecting; go(); }, { rootMargin: "60px 0px" }).observe(host);
  else visible = true;
  document.addEventListener("visibilitychange", function () { if (document.hidden) { visible = false; } else { visible = true; go(); } });
  size(); go();
  return { renderer: renderer, scene: scene, camera: camera, canvas: cv, onFrame: function (f) { frames.push(f); }, resize: size, render: function () { renderer.render(scene, camera); } };
}

// Einfache Pseudozufallszahlen, damit die Holzmaserung bei jedem Laden gleich aussieht.
export function rng(seed) { var s = seed || 7; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

// Holzmaserung als Canvas-Textur: Grundfarbe, wellige Jahresringe, feine Poren.
export function woodTexture(THREE, o) {
  var w = o.w || 512, h = o.h || 512, r = rng(o.seed || 3), c = document.createElement("canvas");
  c.width = w; c.height = h; var g = c.getContext("2d");
  g.fillStyle = o.base; g.fillRect(0, 0, w, h);
  var n = o.lines || 46;
  for (var i = 0; i < n; i++) {
    var y0 = r() * h, amp = 3 + r() * (o.wave || 10), f = .004 + r() * .01, ph = r() * 6.3, lw = .6 + r() * (o.thick || 2.6);
    g.strokeStyle = r() < .55 ? o.dark : o.light; g.globalAlpha = .18 + r() * .32; g.lineWidth = lw; g.beginPath();
    for (var x = 0; x <= w; x += 8) {
      var y = y0 + Math.sin(x * f + ph) * amp + Math.sin(x * f * 3.1 + ph * 2) * amp * .25;
      if (x) g.lineTo(x, y); else g.moveTo(x, y);
    }
    g.stroke();
  }
  g.globalAlpha = .12; g.fillStyle = o.dark;
  for (var k = 0; k < w * h / 260; k++) g.fillRect(r() * w, r() * h, 1 + r() * 5, .8);
  g.globalAlpha = 1;
  var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  return t;
}

// Weicher Bodenschatten als Textur (radialer Verlauf), günstiger als echte Schattenberechnung am Handy.
export function blobTexture(THREE, alpha) {
  var c = document.createElement("canvas"); c.width = c.height = 128; var g = c.getContext("2d");
  var gr = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  gr.addColorStop(0, "rgba(0,0,0," + (alpha || .45) + ")"); gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// Ziehen mit Maus oder Finger dreht die Ansicht; gibt {yaw, pitch} zurück, die der Aufrufer pro Bild liest.
export function dragRotate(el, o) {
  o = o || {};
  var st = { yaw: o.yaw || 0, pitch: o.pitch || 0, active: false, touched: false }, sx = 0, sy = 0, y0 = 0, p0 = 0, id = null;
  var minY = o.minYaw == null ? -Infinity : o.minYaw, maxY = o.maxYaw == null ? Infinity : o.maxYaw;
  function cl(v, a, b) { return v < a ? a : v > b ? b : v; }
  el.style.touchAction = o.vertical ? "none" : "pan-y";
  el.addEventListener("pointerdown", function (e) {
    if (e.button > 0) return; id = e.pointerId; st.active = true; st.touched = true; sx = e.clientX; sy = e.clientY; y0 = st.yaw; p0 = st.pitch;
    try { el.setPointerCapture(id); } catch (x) {}
    el.classList.add("is-drag"); if (o.onStart) o.onStart();
  });
  el.addEventListener("pointermove", function (e) {
    if (!st.active || e.pointerId !== id) return;
    var k = o.speed || .006;
    st.yaw = cl(y0 + (e.clientX - sx) * k * (o.invert ? -1 : 1), minY, maxY);
    if (o.vertical) st.pitch = cl(p0 + (e.clientY - sy) * k * (o.invert ? -1 : 1), o.minPitch || -1, o.maxPitch || 1);
  });
  function end() { st.active = false; id = null; el.classList.remove("is-drag"); }
  el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
  return st;
}
