// XBASE Aero – Flugzeug im Startbild als 3D-Modell (Three.js r180, lokal unter vendor/).
// Ablauf: Ein Scan zeichnet den Bauplan als Drahtgitter, ein zweiter Scan macht daraus das fertige Flugzeug.
// Beim Scrollen hebt es ab, zieht Kondensstreifen und fliegt aus dem Bild. Die Prüf-Schilder hängen an Punkten
// am Flugzeug. Ohne WebGL oder bei "weniger Bewegung" bleibt die SVG-Zeichnung stehen.
import * as THREE from "./vendor/three.module.min.js";
import { RoomEnvironment } from "./vendor/RoomEnvironment.js";

const hero = document.querySelector(".hero");
const plan = document.getElementById("plan");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = matchMedia("(max-width: 960px)").matches;

function webglOk() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); }
  catch (e) { return false; }
}

if (hero && plan && !reduce && webglOk()) start();

function start() {
  const BLUE = 0x0a6cf0, DEEP = 0x0b3fa8, SKY = 0x00b8ff;
  const canvas = document.createElement("canvas");
  canvas.className = "hero__gl";
  canvas.setAttribute("aria-hidden", "true");
  hero.prepend(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.75 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfe3ff, 0.9));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(-6, 12, 8);
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);

  // Scan-Ebenen: Drahtgitter sichtbar bis scanA, fertige Hülle bis scanB (entlang der Längsachse).
  const clipWire = new THREE.Plane(new THREE.Vector3(0, 0, -1), -6);
  const clipSolid = new THREE.Plane(new THREE.Vector3(0, 0, -1), -6);

  const white = new THREE.MeshPhysicalMaterial({ color: 0xf7f9fc, metalness: 0.15, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.2, clippingPlanes: [clipSolid] });
  const blue = new THREE.MeshPhysicalMaterial({ color: BLUE, metalness: 0.35, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.15, clippingPlanes: [clipSolid] });
  const deep = new THREE.MeshPhysicalMaterial({ color: DEEP, metalness: 0.3, roughness: 0.35, clearcoat: 1, clippingPlanes: [clipSolid] });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0a1a33, metalness: 0.6, roughness: 0.25, clippingPlanes: [clipSolid] });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x0b2147, metalness: 0.2, roughness: 0.05, clearcoat: 1, clippingPlanes: [clipSolid] });
  const wire = new THREE.LineBasicMaterial({ color: DEEP, transparent: true, opacity: 0.85, clippingPlanes: [clipWire] });
  const wireSoft = new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.35, clippingPlanes: [clipWire] });

  const ac = new THREE.Group();     // Flugzeug (Nase zeigt nach +Z)
  const lift = new THREE.Group();   // Start-Bewegung beim Scrollen
  lift.add(ac);
  scene.add(lift);
  const wires = [];

  function part(geo, mat, edgeAngle, soft) {
    const m = new THREE.Mesh(geo, mat);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, edgeAngle || 20), soft ? wireSoft : wire);
    m.add(e);
    wires.push(e);
    return m;
  }

  // Rumpf: Drehkörper aus einem Profil (Radius über Länge).
  const prof = [[0, 5.2], [0.2, 5.08], [0.34, 4.86], [0.44, 4.55], [0.5, 4.1], [0.52, 3.4], [0.52, -2.4], [0.47, -3.3], [0.36, -4.1], [0.22, -4.75], [0.08, -5.15], [0, -5.2]];
  const fus = new THREE.LatheGeometry(prof.map(p => new THREE.Vector2(p[0], p[1])), 40);
  fus.rotateX(Math.PI / 2);
  ac.add(part(fus, white, 35));
  // Längslinien und Spanten als Bauplan-Linien
  for (let k = 0; k < 8; k++) {
    const an = k / 8 * Math.PI * 2;
    const pts = prof.map(p => new THREE.Vector3(Math.cos(an) * p[0] * 1.003, Math.sin(an) * p[0] * 1.003, p[1]));
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), k % 2 ? wireSoft : wire);
    ac.add(l);
    wires.push(l);
  }
  for (const z of [4.1, 3, 1.8, 0.6, -0.6, -1.8, -3]) {
    const r = z > 3.4 ? 0.5 : 0.52;
    const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 40 }, (_, i) => new THREE.Vector3(Math.cos(i / 40 * Math.PI * 2) * r * 1.002, Math.sin(i / 40 * Math.PI * 2) * r * 1.002, z))), wireSoft);
    ac.add(ring);
    wires.push(ring);
  }

  // Cockpitfenster und Fensterreihe
  const wind = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.06, 8, 24, Math.PI * 0.55), glass);
  wind.rotation.z = Math.PI / 2 - Math.PI * 0.275;
  wind.position.z = 4.32;
  wind.scale.z = 1.8;
  ac.add(wind);
  const winGeo = new THREE.SphereGeometry(0.032, 8, 6);
  const wins = new THREE.InstancedMesh(winGeo, dark, 2 * 26);
  const tmp = new THREE.Object3D();
  let wi = 0;
  for (const s of [-1, 1]) for (let i = 0; i < 26; i++) {
    tmp.position.set(s * 0.515, 0.14, 3.3 - i * 0.24);
    tmp.updateMatrix();
    wins.setMatrixAt(wi++, tmp.matrix);
  }
  ac.add(wins);

  // Flügel, Leitwerk: Umriss als Shape, ausgezogen. shape.x = Spannweite, shape.y = -z
  function flat(pts, depth, bevel) {
    const sh = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], p[1])));
    const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 4 });
    g.rotateX(-Math.PI / 2);
    g.translate(0, -depth / 2, 0);
    return g;
  }
  const wingPts = [[0.35, -1.0], [5.3, 1.95], [5.42, 2.2], [5.35, 2.55], [0.35, 1.25]];
  for (const s of [1, -1]) {
    const g = flat(wingPts, 0.07, 0.03);
    if (s < 0) { g.scale(-1, 1, 1); g.computeVertexNormals(); }
    const w = part(g, white, 25);
    w.position.y = -0.3;
    w.rotation.z = s * 0.07;
    ac.add(w);
    // Winglet
    const wlg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.55, 0.42), blue);
    wlg.position.set(s * 5.38, 0.08, -2.3);
    wlg.rotation.x = -0.35;
    wlg.rotation.z = -s * 0.12;
    ac.add(wlg);
    // Triebwerk mit Aufhängung
    const eng = new THREE.Group();
    const nac = part(new THREE.CylinderGeometry(0.34, 0.27, 1.45, 32, 1, true).rotateX(Math.PI / 2), blue, 40);
    nac.material = blue;
    eng.add(nac);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.045, 10, 32), white);
    lip.position.z = 0.72;
    eng.add(lip);
    const fan = new THREE.Mesh(new THREE.CircleGeometry(0.31, 32), dark);
    fan.position.z = 0.62;
    eng.add(fan);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.25, 16).rotateX(Math.PI / 2), white);
    cone.position.z = 0.7;
    eng.add(cone);
    const noz = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.35, 20, 1, true).rotateX(-Math.PI / 2), dark);
    noz.position.z = -0.86;
    eng.add(noz);
    const py = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.3, 0.9), white);
    py.position.set(0, 0.28, -0.05);
    eng.add(py);
    eng.position.set(s * 1.95, -0.72, 0.95);
    ac.add(eng);
  }
  for (const s of [1, -1]) {
    const g = flat([[0.2, 3.85], [1.95, 4.65], [2.0, 4.9], [0.2, 4.95]], 0.05, 0.02);
    if (s < 0) { g.scale(-1, 1, 1); g.computeVertexNormals(); }
    const h = part(g, white, 25);
    h.position.y = 0.05;
    ac.add(h);
  }
  // Seitenleitwerk in Markenblau
  const finSh = new THREE.Shape([[3.0, 0.35], [4.95, 0.35], [5.1, 2.05], [4.45, 2.05]].map(p => new THREE.Vector2(p[0], p[1])));
  const finG = new THREE.ExtrudeGeometry(finSh, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
  finG.translate(0, 0, -0.04);
  finG.rotateY(Math.PI / 2);
  const fin = part(finG, blue, 25);
  ac.add(fin);
  // Streifen am Rumpf
  for (const th of [Math.PI / 2, Math.PI * 1.5]) {
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.526, 0.526, 5.6, 8, 1, true, th - 0.2, 0.4).rotateX(Math.PI / 2), deep);
    stripe.position.z = 0.4;
    stripe.position.y = 0;
    ac.add(stripe);
  }

  // Weicher Schatten am Boden
  const sc = document.createElement("canvas");
  sc.width = sc.height = 128;
  const sx = sc.getContext("2d");
  const gr = sx.createRadialGradient(64, 64, 4, 64, 64, 62);
  gr.addColorStop(0, "rgba(10,40,100,.32)");
  gr.addColorStop(1, "rgba(10,40,100,0)");
  sx.fillStyle = gr;
  sx.fillRect(0, 0, 128, 128);
  const shadowMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false, opacity: 0 });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -2.2;
  scene.add(shadow);

  // Scan-Lichtband
  const bandC = document.createElement("canvas");
  bandC.width = 128; bandC.height = 64;
  const bx = bandC.getContext("2d");
  const bg = bx.createLinearGradient(0, 0, 0, 64);
  bg.addColorStop(0, "rgba(0,184,255,0)");
  bg.addColorStop(0.8, "rgba(0,184,255,.3)");
  bg.addColorStop(1, "rgba(160,232,255,.95)");
  bx.fillStyle = bg;
  bx.fillRect(0, 0, 128, 64);
  bx.globalCompositeOperation = "destination-in";
  const side = bx.createLinearGradient(0, 0, 128, 0);
  side.addColorStop(0, "rgba(0,0,0,0)");
  side.addColorStop(0.2, "rgba(0,0,0,1)");
  side.addColorStop(0.8, "rgba(0,0,0,1)");
  side.addColorStop(1, "rgba(0,0,0,0)");
  bx.fillStyle = side;
  bx.fillRect(0, 0, 128, 64);
  const bandMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bandC), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, opacity: 0 });
  const band = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 0.9), bandMat);
  band.rotation.x = -Math.PI / 2;
  ac.add(band);

  // Kondensstreifen hinter den Triebwerken
  const TRAIL = 70;
  const trailIdx = [];
  for (let i = 0; i < TRAIL - 1; i++) trailIdx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  const trails = [-1, 1].map(s => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(TRAIL * 6), 3));
    geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(TRAIL * 8), 4));
    geo.setIndex(trailIdx);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    mesh.frustumCulled = false;
    scene.add(mesh);
    return { s, geo, mesh };
  });
  const sideV = new THREE.Vector3(), tan = new THREE.Vector3();

  // Ankerpunkte für die Schilder (Avionik, Triebwerk, Personal, Struktur)
  const anchors = [new THREE.Vector3(0, 0.45, 4.3), new THREE.Vector3(-1.95, -0.72, 1.2), new THREE.Vector3(2.8, -0.25, -0.2), new THREE.Vector3(0, 1.6, -4.6)];
  const chips = [...document.querySelectorAll(".plan .chip")];
  const chipLayer = document.createElement("div");
  chipLayer.className = "hero__chips";
  chips.forEach(c => { c.style.left = c.style.top = "0"; c.style.animation = "none"; chipLayer.appendChild(c); });
  hero.appendChild(chipLayer);
  document.documentElement.classList.add("gl-on");

  // Grundhaltung: von schräg oben, Nase nach rechts oben
  const YAW = Math.PI - 0.62;
  ac.rotation.set(0, YAW, 0);
  let W = 1, H = 1, cx = 0, cy = 0, size = 1, sOff = 0, sLen = 1;
  const camDir = new THREE.Vector3(0.05, 0.9, 0.44).normalize();
  function layout() {
    const r = hero.getBoundingClientRect(), p = plan.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    cx = p.left - r.left + p.width / 2; cy = p.top - r.top + p.height / 2;
    size = Math.min(p.width, p.height);
    // Abheben erst, wenn das Flugzeug ganz zu sehen war (Handy: unter dem Text)
    sOff = Math.max(0, p.bottom + scrollY - innerHeight);
    sLen = sOff > 0 ? p.height * 1.1 : r.height * 0.85;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    const visH = 11.2 * H / size;
    const d = visH / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.position.copy(camDir).multiplyScalar(d);
    camera.lookAt(0, 0, 0);
    camera.setViewOffset(W, H, W / 2 - cx, H / 2 - cy, W, H);
    camera.updateProjectionMatrix();
  }
  layout();
  addEventListener("resize", layout);
  new ResizeObserver(layout).observe(hero);

  // Maus neigt das Flugzeug leicht
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
    addEventListener("pointermove", e => { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; }, { passive: true });
  }

  const ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
  // Bau startet erst, wenn das Flugzeug im Bild ist
  let t0 = null;
  new IntersectionObserver((es, io) => {
    if (es[0].isIntersecting) { t0 = performance.now(); io.disconnect(); }
  }, { threshold: 0.8 }).observe(plan);
  const tmpV = new THREE.Vector3();
  const nose = new THREE.Vector3();
  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) requestAnimationFrame(frame); }).observe(hero);

  // Flugbahn beim Scrollen (s 0..1): vorwärts, steigen, leicht in die Kurve
  function pose(s, target) {
    const k = Math.pow(s, 1.6);
    nose.set(Math.sin(YAW), 0, Math.cos(YAW));
    target.position.copy(nose).multiplyScalar(k * 16).add(tmpV.set(0, k * 9 + s * 0.6, 0));
    return target;
  }
  const probe = new THREE.Object3D();
  const enginePos = s => {
    pose(s, probe);
    const out = [];
    for (const side of [-1, 1]) {
      const v = new THREE.Vector3(side * 1.95, -0.72, -0.9);
      v.applyEuler(new THREE.Euler(-s * 0.35, YAW, -Math.sin(s * Math.PI) * 0.45, "YXZ"));
      v.add(probe.position);
      out.push(v);
    }
    return out;
  };

  function frame(now) {
    if (!visible) return;
    const t = window.__flugT ?? (t0 === null ? 0 : Math.max(0, now - t0) / 1000);
    const s = Math.min(1, Math.max(0, (scrollY - sOff) / sLen));

    // Scans: Bauplan (0,3–2,1 s), dann Hülle (2,3–4,0 s)
    const a = ease((t - 0.3) / 1.8), b = ease((t - 2.3) / 1.7);
    const zA = 5.6 - a * 11.2, zB = 5.6 - b * 11.2;
    const scanZ = a < 1 ? zA : zB;
    band.position.set(0, 0, scanZ);
    bandMat.opacity = (a > 0 && a < 1) || (b > 0 && b < 1) ? 0.75 : Math.max(0, bandMat.opacity - 0.05);
    for (const w of wires) w.material.opacity = (w.material === wire ? 0.85 : 0.35) * (1 - b * 0.82) * (1 - s);

    // Haltung
    mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
    pose(s, lift);
    const bob = Math.sin(t * 0.9) * 0.08 * (1 - s);
    lift.position.y += bob;
    ac.rotation.set(-s * 0.35 + my * 0.12, YAW + mx * 0.25, -Math.sin(s * Math.PI) * 0.45 + mx * -0.08, "YXZ");

    // Clipping-Ebenen in Weltkoordinaten (sie hängen an der Längsachse des Flugzeugs)
    ac.updateMatrixWorld(true);
    const m = ac.matrixWorld;
    const setClip = (plane, z) => {
      const n = new THREE.Vector3(0, 0, -1).transformDirection(m);
      const p = new THREE.Vector3(0, 0, z).applyMatrix4(m);
      plane.setFromNormalAndCoplanarPoint(n.negate(), p);
    };
    setClip(clipWire, zA);
    setClip(clipSolid, zB);

    shadowMat.opacity = 0.9 * b * (1 - s * 1.4);
    shadow.position.x = lift.position.x * 0.6;
    shadow.position.z = lift.position.z * 0.6;
    shadow.scale.setScalar(1 + s * 0.8);

    // Kondensstreifen: Punkte entlang der zurückgelegten Bahn
    const s0 = Math.max(0, s - 0.45);
    trails.forEach((tr, ti) => {
      const pos = tr.geo.attributes.position.array, col = tr.geo.attributes.color.array;
      const pts = [];
      for (let i = 0; i < TRAIL; i++) pts.push(enginePos(s0 + (s - s0) * (i / (TRAIL - 1)))[ti]);
      for (let i = 0; i < TRAIL; i++) {
        const f = i / (TRAIL - 1);
        tan.subVectors(pts[Math.min(TRAIL - 1, i + 1)], pts[Math.max(0, i - 1)]).normalize();
        sideV.crossVectors(tan, camDir).normalize().multiplyScalar(0.07 + (1 - f) * 0.3);
        const p = pts[i];
        pos.set([p.x - sideV.x, p.y - sideV.y, p.z - sideV.z, p.x + sideV.x, p.y + sideV.y, p.z + sideV.z], i * 6);
        const al = s > 0.01 ? Math.pow(f, 1.2) * 0.9 : 0;
        col.set([0.42, 0.68, 1, al, 0.42, 0.68, 1, al], i * 8);
      }
      tr.geo.attributes.position.needsUpdate = true;
      tr.geo.attributes.color.needsUpdate = true;
    });

    renderer.render(scene, camera);

    // Schilder an die Ankerpunkte hängen
    const show = Math.max(0, 1 - s * 3);
    anchors.forEach((v, i) => {
      const c = chips[i];
      if (!c) return;
      tmpV.copy(v).applyMatrix4(ac.matrixWorld).project(camera);
      const x = (tmpV.x * 0.5 + 0.5) * W, y = (-tmpV.y * 0.5 + 0.5) * H;
      if (small && i === 3) { c.style.opacity = "0"; return; }
      const appear = ease((t - 3.4 - i * 0.35) / 0.5);
      const cw = c.offsetWidth, left = i % 2 === 1;
      let px = left ? x - 26 - cw : x + 26;
      if (px + cw > W - 10) px = x - 26 - cw;
      if (px < 10) px = Math.min(W - 10 - cw, x + 26);
      c.style.transform = `translate(${px}px, ${y}px) translateY(-50%) translateY(${(1 - appear) * 10}px)`;
      c.style.opacity = String(appear * show);
    });
    hero.style.setProperty("--fly", s.toFixed(3));
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
