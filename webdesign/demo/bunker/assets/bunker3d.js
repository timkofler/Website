// bunker.kollektiv · Abstieg in den Bunker
// Beim Scrollen geht die Kamera die Betonstiege hinunter. Unten flackert das Neon-Logo an,
// durch die Tür sieht man schon die Bühne. Ohne WebGL oder bei "weniger Bewegung" bleibt das Standbild.
import * as THREE from "./vendor/three-r180/three.module.min.js";

const root = document.documentElement;
const canvas = document.querySelector(".descent__canvas");
const mobile = matchMedia("(max-width: 760px), (pointer: coarse)").matches;

function webglOk() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
}
if (!canvas || root.classList.contains("no3d") || !webglOk()) {
  root.classList.add("no3d");
  document.dispatchEvent(new Event("no3d"));
} else {
  start().catch((e) => { console.warn(e); root.classList.add("no3d"); document.dispatchEvent(new Event("no3d")); });
}

// ---- Maße der Stiege (Meter) ----
const N = 20, H = 0.18, D = 0.30, W = 1.6;
const DROP = N * H, RUN = N * D;           // 3.6 m tief, 6 m lang
const Z_END = -RUN - 3.0;                  // Stirnwand mit Tür
const DOOR_W = 1.0, DOOR_H = 2.15;
const FLOOR_B = -DROP;

function glideY(z) {                       // Kamerabahn: sehr weich gerundet, kein Stufen-Hüpfen
  const x = -z / RUN, k = 3.2;
  const sp = (v) => Math.log1p(Math.exp(k * v)) / k;
  const n = (v) => sp(v) - sp(v - 1);
  const xa = -2.4 / RUN, xb = 1.12;                // Start oben am Podest, Ende unten im Gang
  return -DROP * clamp((n(x) - n(xa)) / (n(xb) - n(xa)), 0, 1);
}
function softFloor(z) {                    // weicher Übergang Podest → Stiege → Gang
  const x = -z / RUN, k = 9;
  const sp = (v) => Math.log1p(Math.exp(k * v)) / k;
  return -DROP * (sp(x) - sp(x - 1));
}
const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const range = (p, a, b) => clamp((p - a) / (b - a), 0, 1);

function concrete(size, base, seed, opts = {}) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d");
  let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  g.fillStyle = base; g.fillRect(0, 0, size, size);
  for (let i = 0; i < 1400; i++) {
    const r = rnd() * size * 0.09 + 2, x = rnd() * size, y = rnd() * size, l = rnd() > 0.5 ? 255 : 0;
    g.fillStyle = `rgba(${l},${l},${l},${rnd() * 0.035})`;
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
  const img = g.getImageData(0, 0, size, size), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * 26; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(img, 0, 0);
  if (opts.stains) for (let i = 0; i < 14; i++) {
    const x = rnd() * size, w = 3 + rnd() * 16, h = size * (0.2 + rnd() * 0.6);
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(20,16,12,.18)"); gr.addColorStop(1, "rgba(20,16,12,0)");
    g.fillStyle = gr; g.fillRect(x, rnd() * size * 0.3, w, h);
  }
  if (opts.formwork) { g.strokeStyle = "rgba(0,0,0,.18)"; g.lineWidth = 2; for (let y = 0; y < size; y += size / 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(size, y); g.stroke(); } }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

function poster(title, sub, c1, c2, seed) {
  const cw = 360, ch = 510, c = document.createElement("canvas"); c.width = cw; c.height = ch;
  const g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, cw, ch); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr; g.fillRect(0, 0, cw, ch);
  g.globalAlpha = 0.18; g.fillStyle = "#000";
  for (let i = 0; i < 9; i++) g.fillRect(0, (i * 57 + seed * 13) % ch, cw, 2 + (i % 3));
  g.globalAlpha = 1;
  g.fillStyle = "#0b0b0d"; g.textAlign = "left";
  const words = title.split(" ");
  let y = 120;
  words.forEach((w) => {
    let fs = 118; g.font = `900 ${fs}px "Big Shoulders", Impact, sans-serif`;
    while (g.measureText(w).width > cw - 44 && fs > 40) { fs -= 4; g.font = `900 ${fs}px "Big Shoulders", Impact, sans-serif`; }
    g.fillText(w.toUpperCase(), 22, y); y += fs * 0.86;
  });
  g.font = '600 22px "Inter", sans-serif'; g.fillText(sub, 24, ch - 62);
  g.font = '500 20px "Zilla Slab", serif'; g.fillText("bunker.kollektiv", 24, ch - 30);
  // Papier-Knicke
  g.globalAlpha = 0.12; g.fillStyle = "#fff"; g.fillRect(cw * 0.5, 0, 1.5, ch); g.fillRect(0, ch * 0.5, cw, 1.5); g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

async function neonTexture() {
  const sym = document.getElementById("logo");
  const inner = sym ? sym.innerHTML : "";
  const svg = (col, sw) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 1100"><g transform="translate(70 60)" fill="none" stroke="${col}" stroke-linecap="square" style="stroke-width:${sw}">${inner.replace(/stroke-width="\d+"/g, "")}</g></svg>`;
  const load = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(src); });
  const [glow, core] = await Promise.all([load(svg("#4fe6e1", 30)), load(svg("#f2fffe", 13))]);
  const S = 1024, c = document.createElement("canvas"); c.width = c.height = S;
  const g = c.getContext("2d");
  g.shadowColor = "#4fe6e1";
  [60, 30, 12].forEach((b) => { g.shadowBlur = b; g.drawImage(glow, 0, 0, S, S); });
  g.shadowBlur = 6; g.drawImage(core, 0, 0, S, S);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

async function start() {
  try { await Promise.all([document.fonts.load('900 60px "Big Shoulders"'), document.fonts.load('600 20px "Inter"'), document.fonts.load('500 20px "Zilla Slab"')]); } catch (e) {}

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050506);
  scene.fog = new THREE.FogExp2(0x060607, 0.075);
  const camera = new THREE.PerspectiveCamera(62, 1, 0.05, 60);

  scene.add(new THREE.HemisphereLight(0x8890a0, 0x1a1410, 0.22));

  // Materialien
  const wallTex = concrete(512, "#6f6f6d", 7, { stains: true, formwork: true }); wallTex.repeat.set(5, 3.4);
  const stepTex = concrete(256, "#7d7c79", 3);
  const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.96, metalness: 0 });
  const stepMat = new THREE.MeshStandardMaterial({ map: stepTex, roughness: 0.9, metalness: 0 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2c, roughness: 0.6, metalness: 0.6 });
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0x9a9da0, roughness: 0.35, metalness: 0.85 });

  // Stufen
  const stepGeo = new THREE.BoxGeometry(W, H, D);
  const noseGeo = new THREE.BoxGeometry(W - 0.02, 0.012, 0.045);
  const stairs = new THREE.InstancedMesh(stepGeo, stepMat, N);
  const noses = new THREE.InstancedMesh(noseGeo, edgeMat, N);
  const glowGeo = new THREE.PlaneGeometry(W - 0.1, D * 0.9);
  const glowTex = (() => { const c = document.createElement("canvas"); c.width = 8; c.height = 64; const g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, "rgba(255,200,140,0)"); gr.addColorStop(1, "rgba(255,200,140,.6)");
    g.fillStyle = gr; g.fillRect(0, 0, 8, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const glows = new THREE.InstancedMesh(glowGeo, new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), N);
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), one = new THREE.Vector3(1, 1, 1), v3 = new THREE.Vector3();
  const m = new THREE.Matrix4();
  for (let i = 0; i < N; i++) {
    m.makeTranslation(0, -(i + 0.5) * H - 0.0001, -(i + 0.5) * D); stairs.setMatrixAt(i, m);
    m.makeTranslation(0, -i * H + 0.004, -(i + 1) * D + 0.0225); noses.setMatrixAt(i, m);
    m.compose(v3.set(0, -(i + 1) * H + 0.003, -(i + 1) * D - D * 0.45), q, one); glows.setMatrixAt(i, m);
  }
  scene.add(stairs, noses, glows);
  // Unterbau unter den Stufen (damit nichts durchscheint)
  const under = new THREE.Mesh(new THREE.BoxGeometry(W, DROP, RUN), stepMat);
  under.position.set(0, -DROP - DROP / 2 + 0.001, -RUN / 2); scene.add(under);

  // Böden
  const floorTex = concrete(512, "#5f5e5b", 11); floorTex.repeat.set(2, 3);
  const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.92 });
  const topFloor = new THREE.Mesh(new THREE.PlaneGeometry(W, 4), floorMat);
  topFloor.rotation.x = -Math.PI / 2; topFloor.position.set(0, 0, 2); scene.add(topFloor);
  const botFloor = new THREE.Mesh(new THREE.PlaneGeometry(W, -Z_END - RUN + 0.2), floorMat);
  botFloor.rotation.x = -Math.PI / 2; botFloor.position.set(0, FLOOR_B, (-RUN + Z_END) / 2); scene.add(botFloor);

  // Seitenwände
  const wallLen = 4 - Z_END + 0.5, wallH = 8;
  const wallGeo = new THREE.PlaneGeometry(wallLen, wallH);
  const wl = new THREE.Mesh(wallGeo, wallMat); wl.rotation.y = Math.PI / 2; wl.position.set(-W / 2, -1.2, (4 + Z_END) / 2); scene.add(wl);
  const wr = new THREE.Mesh(wallGeo, wallMat); wr.rotation.y = -Math.PI / 2; wr.position.set(W / 2, -1.2, (4 + Z_END) / 2); scene.add(wr);

  // Decke: oben flach, dann schräg, unten flach
  const ceilMat = new THREE.MeshStandardMaterial({ map: concrete(256, "#4a4845", 5), roughness: 1 });
  const CT = 2.5, CB = FLOOR_B + 3.6;
  const c1 = new THREE.Mesh(new THREE.PlaneGeometry(W, 4), ceilMat); c1.rotation.x = Math.PI / 2; c1.position.set(0, CT, 2); scene.add(c1);
  const slopeLen = Math.hypot(RUN, CT - CB);
  const c2 = new THREE.Mesh(new THREE.PlaneGeometry(W, slopeLen), ceilMat);
  c2.position.set(0, (CT + CB) / 2, -RUN / 2); c2.rotation.x = Math.PI / 2 - Math.atan2(CT - CB, RUN); scene.add(c2);
  const c3 = new THREE.Mesh(new THREE.PlaneGeometry(W, -Z_END - RUN + 0.2), ceilMat); c3.rotation.x = Math.PI / 2; c3.position.set(0, CB, (-RUN + Z_END) / 2); scene.add(c3);

  // Stirnwand mit Türöffnung
  const endMat = new THREE.MeshStandardMaterial({ map: concrete(512, "#625f5b", 21, { stains: true }), roughness: 0.95 });
  const sideW = (W - DOOR_W) / 2, endH = CB - FLOOR_B;
  const eL = new THREE.Mesh(new THREE.BoxGeometry(sideW, endH, 0.3), endMat); eL.position.set(-W / 2 + sideW / 2, FLOOR_B + endH / 2, Z_END - 0.15);
  const eR = eL.clone(); eR.position.x = W / 2 - sideW / 2;
  const eT = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W, endH - DOOR_H, 0.3), endMat); eT.position.set(0, FLOOR_B + DOOR_H + (endH - DOOR_H) / 2, Z_END - 0.15);
  scene.add(eL, eR, eT);
  // Stahlzarge
  const fz = 0.06;
  [[-DOOR_W / 2, DOOR_H / 2, fz, DOOR_H], [DOOR_W / 2, DOOR_H / 2, fz, DOOR_H], [0, DOOR_H, DOOR_W + fz, fz]].forEach(([x, y, w, h]) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.34), darkMat); b.position.set(x, FLOOR_B + y, Z_END - 0.15); scene.add(b);
  });
  // offene Stahltür, nach innen aufgeschwenkt
  const door = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W - 0.04, DOOR_H - 0.03, 0.05), new THREE.MeshStandardMaterial({ color: 0x3b3f41, roughness: 0.5, metalness: 0.7 }));
  door.geometry.translate((DOOR_W - 0.04) / 2, 0, 0);
  door.position.set(-DOOR_W / 2 + 0.02, FLOOR_B + DOOR_H / 2, Z_END - 0.3); door.rotation.y = 1.3; scene.add(door);

  // Blick in den Club: Bühnenfoto als leuchtende Fläche hinter der Tür
  const stageTex = await new THREE.TextureLoader().loadAsync("assets/img/buehne.webp");
  stageTex.colorSpace = THREE.SRGBColorSpace;
  const club = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 3.8), new THREE.MeshBasicMaterial({ map: stageTex, toneMapped: false, fog: false }));
  club.position.set(0, FLOOR_B + 1.05, Z_END - 2.6); scene.add(club);
  const clubDark = new THREE.Mesh(new THREE.BoxGeometry(7, 4, 3), new THREE.MeshBasicMaterial({ color: 0x050308, side: THREE.BackSide, fog: false }));
  clubDark.position.set(0, FLOOR_B + 1.6, Z_END - 1.6); scene.add(clubDark);

  // Lichter
  const doorPink = new THREE.PointLight(0xff3d9a, 3.5, 0, 2); doorPink.position.set(-0.2, FLOOR_B + 1.0, Z_END + 0.35); scene.add(doorPink);
  const doorBlue = new THREE.PointLight(0x5a6bff, 2.2, 0, 2); doorBlue.position.set(0.3, FLOOR_B + 0.4, Z_END + 0.25); scene.add(doorBlue);
  const neonLight = new THREE.PointLight(0x4fe6e1, 0, 0, 2); neonLight.position.set(0, FLOOR_B + DOOR_H + 0.55, Z_END + 0.45); scene.add(neonLight);

  const lampGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.08, 20);
  const lampOn = new THREE.MeshBasicMaterial({ color: 0xffd9a0, toneMapped: false });
  const cageMat = new THREE.MeshStandardMaterial({ color: 0x1d1d1f, metalness: 0.8, roughness: 0.4 });
  const lamps = [];
  [[2.2, CT], [-0.9, null], [-3.4, null], [-5.9, null], [Z_END + 1.6, CB]].forEach(([z, cy]) => {
    const y = cy != null ? cy : lerp(CT, CB, -z / RUN);
    const l = new THREE.Mesh(lampGeo, lampOn); l.position.set(0, y - 0.05, z); scene.add(l);
    const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.12, 8, 1, true), cageMat); cage.material.wireframe = true; cage.position.copy(l.position); scene.add(cage);
    const pl = new THREE.PointLight(0xffc78a, 2.6, 0, 2); pl.position.set(0, y - 0.25, z); scene.add(pl);
    lamps.push(pl);
  });

  // Handlauf rechts
  const railMat = new THREE.MeshStandardMaterial({ color: 0x8a8d90, metalness: 0.9, roughness: 0.35 });
  const railLen = Math.hypot(RUN, DROP) + 0.6;
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, railLen, 10), railMat);
  rail.position.set(W / 2 - 0.07, -DROP / 2 + 0.92, -RUN / 2);
  rail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -DROP, -RUN).normalize());
  scene.add(rail);
  for (let i = 2; i < N; i += 6) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.03, 0.03), railMat); b.position.set(W / 2 - 0.035, -i * H + 0.92 - 0.02, -i * D); scene.add(b);
  }

  // Plakate an den Wänden
  const posters = [
    ["Punx Revival V", "Frühjahr · Punkrock", "#ff3d9a", "#ff8ac4", 4, -1],
    ["Bass Music Culture", "21. November · 19 Uhr", "#9b6bff", "#4fe6e1", 8, 1],
    ["Gasslfestival V", "Mai · Open Air", "#b6f23a", "#ffe14a", 12, -1],
    ["Nikolaus Slaughterhouse", "5. Dezember · Metal Night", "#ff3b30", "#ff9a3d", 16, 1],
  ];
  posters.forEach(([t, s, a, b, i, side], k) => {
    const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.88), new THREE.MeshStandardMaterial({ map: poster(t, s, a, b, k), roughness: 0.85 }));
    pm.position.set(side * (W / 2 - 0.004), -i * H + 1.55, -i * D);
    pm.rotation.y = -side * Math.PI / 2; pm.rotation.z = (k % 2 ? 1 : -1) * 0.025;
    scene.add(pm);
  });

  // Neon-Logo über der Tür
  const neonTex = await neonTexture();
  const neonMat = new THREE.MeshBasicMaterial({ map: neonTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, opacity: 0.06 });
  const neon = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), neonMat);
  neon.position.set(0, FLOOR_B + DOOR_H + 0.7, Z_END + 0.012); scene.add(neon);

  // Staub im Licht
  const dustN = mobile ? 160 : 320, dg = new THREE.BufferGeometry(), dp = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) { const z = 3 - Math.random() * (3 - Z_END); dp[i * 3] = (Math.random() - 0.5) * W * 0.9; dp[i * 3 + 1] = softFloor(z) + Math.random() * 2.4; dp[i * 3 + 2] = z; }
  dg.setAttribute("position", new THREE.BufferAttribute(dp, 3));
  const dot = document.createElement("canvas"); dot.width = dot.height = 32; const dctx = dot.getContext("2d");
  const rg = dctx.createRadialGradient(16, 16, 0, 16, 16, 16); rg.addColorStop(0, "rgba(255,230,200,1)"); rg.addColorStop(1, "rgba(255,230,200,0)"); dctx.fillStyle = rg; dctx.fillRect(0, 0, 32, 32);
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.018, map: new THREE.CanvasTexture(dot), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);

  // ---- Kamera-Fahrt ----
  const Z0 = 2.4, Z1 = Z_END + 2.3, Z2 = Z_END + 1.55;
  const NEON_Y = FLOOR_B + DOOR_H + 0.7;
  const pos = new THREE.Vector3(), look = new THREE.Vector3(), tmp = new THREE.Vector3();
  const easeS = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);
  function pose(p) {
    // 1) Stiege runter
    const z = lerp(Z0, Z1, easeS(range(p, 0.02, 0.64)));
    pos.set(0, glideY(z) + 1.62, z);
    const zt = z - 2.4;
    look.set(0, glideY(zt) + 1.15, zt);
    // 2) unten ankommen, Blick hebt sich zum Neon
    const a = easeS(range(p, 0.5, 0.7));
    look.lerp(tmp.set(0, lerp(FLOOR_B + 1.5, NEON_Y - 0.35, a), Z_END), a);
    const c = easeS(range(p, 0.68, 0.8));
    const z2 = camera.aspect < 0.8 ? Z_END + 2.9 : Z2;
    pos.lerp(tmp.set(0, FLOOR_B + 1.55, z2), c);
    // 3) durch die Tür
    const b = easeS(range(p, 0.8, 0.95));
    pos.lerp(tmp.set(0, FLOOR_B + 1.2, Z_END - 1.1), b);
    look.lerp(tmp.set(0, FLOOR_B + 1.2, Z_END - 2.6), b);
    camera.fov = lerp(camera.aspect < 0.8 ? 74 : 62, 50, b);
  }

  // ---- Neon-Flackern ----
  const FLICK = [[0, 0], [0.07, 1], [0.12, 0.05], [0.3, 0.9], [0.34, 0.1], [0.42, 0.6], [0.5, 0.15], [0.72, 1]];
  let neonState = 0, neonT0 = 0;
  function neonLevel(t) {
    if (neonState === 0) return 0;
    const s = (t - neonT0) / 1000; let v = 0;
    for (const [k, l] of FLICK) if (s >= k) v = l;
    return v;
  }

  let target = window.__descentP || 0, cur = target, visible = true, running = false;
  window.addEventListener("descent", (e) => { target = e.detail; kick(); });
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; kick(); });
  io.observe(canvas.parentElement);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = 62; camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", () => { resize(); kick(); });
  resize();

  let lastT = 0;
  function frame(t) {
    running = false;
    const dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0.016; lastT = t;
    if (!visible || cur > 0.995 && target > 0.995) { lastT = 0; render(t); return; }
    cur += (target - cur) * (1 - Math.exp(-dt * 3.2));
    if (Math.abs(target - cur) < 0.0004) cur = target;
    render(t);
    running = true; requestAnimationFrame(frame);
  }
  function render(t) {
    if (cur > 0.6 && neonState === 0) { neonState = 1; neonT0 = t; }
    if (cur < 0.54 && neonState === 1) neonState = 0;
    const lv = neonLevel(t);
    neonMat.opacity = 0.06 + lv * 0.94;
    neonLight.intensity = lv * 3.2;
    const beat = 0.5 + 0.5 * Math.sin(t * 0.0075);
    doorPink.intensity = 2.6 + beat * 1.6;
    doorBlue.intensity = 1.6 + (1 - beat) * 1.2;
    dust.rotation.y = Math.sin(t * 0.00005) * 0.02; dust.position.y = Math.sin(t * 0.0003) * 0.03;
    pose(cur); camera.updateProjectionMatrix(); camera.position.copy(pos); camera.lookAt(look);
    renderer.render(scene, camera);
  }
  function kick() { if (window.__bunkerManual) return; if (!running && visible) { running = true; requestAnimationFrame(frame); } }
  // Für Video-Aufnahmen: Bild für Bild exakt rendern
  window.__bunkerRender = (p, t) => { cur = target = p; render(t); return [camera.position.y, camera.position.z, look.y, look.z, camera.fov]; };
  // laufend rendern, solange sichtbar (Puls an der Tür, Staub)
  (function idle(t) { if (visible && !running && cur < 0.995 && !window.__bunkerManual) render(t); requestAnimationFrame(idle); })(performance.now());
  root.classList.add("has3d");
}
