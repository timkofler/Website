// KFZ Steiner – 3D-Explosionsansicht (Beispielseite /beispiele/werkstatt/)
// Das Auto ist komplett im Code gebaut (keine fremden 3D-Modelle, keine Lizenzfragen).
// Beim Scrollen fliegen Karosserie, Räder, Fahrwerk und Motor auseinander und wieder zusammen.
// Build: npm run build (esbuild bündelt nur die benötigten Teile von Three.js).
import {
  Path, WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, Vector3, Color,
  Shape, ExtrudeGeometry, LatheGeometry, CylinderGeometry, BoxGeometry, TorusGeometry, SphereGeometry,
  RingGeometry, PlaneGeometry, TubeGeometry, Curve, CatmullRomCurve3, Vector2,
  MeshPhysicalMaterial, MeshStandardMaterial, MeshBasicMaterial, BackSide, DoubleSide,
  PMREMGenerator, DirectionalLight, HemisphereLight, CanvasTexture, ACESFilmicToneMapping, SRGBColorSpace
} from "three";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

export function start(section) {
  const canvas = section.querySelector("#x3dCanvas");
  const stage = section.querySelector("#x3dStage");
  const labelBox = section.querySelector("#x3dLabels");
  const steps = section.querySelectorAll(".x3d__steps li");
  const countEl = section.querySelector("#x3dCount");
  const barEl = section.querySelector("#x3dBar");
  const small = matchMedia("(max-width: 700px)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const seg = small ? 0.6 : 1; // weniger Polygone am Handy
  const S = (n) => Math.max(6, Math.round(n * seg));

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: !small || devicePixelRatio < 2, alpha: true, powerPreference: "high-performance" });
  } catch (e) { return false; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 100);

  // Umgebung für die Spiegelungen: dunkle Halle mit ein paar Leuchtflächen (wie Softboxen in der Werkstatt)
  const env = new Scene();
  env.add(new Mesh(new BoxGeometry(30, 14, 30), new MeshBasicMaterial({ color: 0x0b0c0e, side: BackSide })));
  const panel = (w, h, col, k, p, r) => {
    const m = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ color: new Color(col).multiplyScalar(k), side: DoubleSide }));
    m.position.set(...p); m.rotation.set(...r); env.add(m);
  };
  panel(5, 14, 0xffffff, 1.7, [-3, 6.9, 0], [Math.PI / 2, 0, 0]);
  panel(2, 14, 0xffffff, 1.2, [4, 6.9, 0], [Math.PI / 2, 0, 0]);
  panel(10, 1.2, 0xffffff, 2.4, [0, 4.5, -10], [0, 0, 0]);
  panel(1.4, 8, 0xffffff, 1.6, [-11, 3, 3], [0, Math.PI / 2, 0]);
  panel(8, 0.6, 0xffb81c, 2.2, [10, 2, -2], [0, -Math.PI / 2, 0]);
  panel(6, 6, 0x9fb4ff, 0.5, [4, 3, 11], [0, Math.PI, 0]);
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(env, 0.035).texture;
  pmrem.dispose();

  scene.add(new HemisphereLight(0xdfe6ff, 0x1a1410, 0.35));
  const sun = new DirectionalLight(0xffffff, 1.4); sun.position.set(3, 6, 4); scene.add(sun);

  // Materialien
  const paint = new MeshPhysicalMaterial({ color: 0x8f0a10, metalness: 0.55, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06 });
  const glass = new MeshPhysicalMaterial({ color: 0x0a0d12, metalness: 0.3, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.02, transparent: true, opacity: 0.72, depthWrite: false });
  const chrome = new MeshStandardMaterial({ color: 0xdfe2e6, metalness: 1, roughness: 0.16 });
  const alu = new MeshStandardMaterial({ color: 0xa9adb3, metalness: 0.9, roughness: 0.35 });
  const steel = new MeshStandardMaterial({ color: 0x6d7279, metalness: 0.85, roughness: 0.42 });
  const dark = new MeshStandardMaterial({ color: 0x2b2e33, metalness: 0.5, roughness: 0.55 });
  const black = new MeshStandardMaterial({ color: 0x121315, metalness: 0.2, roughness: 0.7 });
  const rubber = new MeshStandardMaterial({ color: 0x151617, metalness: 0, roughness: 0.88 });
  const yellow = new MeshPhysicalMaterial({ color: 0xffb81c, metalness: 0.2, roughness: 0.32, clearcoat: 0.8 });
  const redCover = new MeshStandardMaterial({ color: 0x9a1016, metalness: 0.6, roughness: 0.38 });
  const leather = new MeshStandardMaterial({ color: 0x6e3b22, metalness: 0.05, roughness: 0.55 });
  const trim = new MeshStandardMaterial({ color: 0x1c1d20, metalness: 0.1, roughness: 0.7 });
  const headL = new MeshPhysicalMaterial({ color: 0xffffff, emissive: 0xdde8ff, emissiveIntensity: 0.9, metalness: 0.2, roughness: 0.1, clearcoat: 1 });
  const tailL = new MeshStandardMaterial({ color: 0x5a0004, emissive: 0xff1020, emissiveIntensity: 1.1, roughness: 0.3 });

  const car = new Group();
  scene.add(car);
  const parts = [];
  // Ein Bauteil: Gruppe an seiner Ausgangsposition, fliegt um "off" weg (zwischen a und b der Explosion)
  function part(home, off, a, b, spin) {
    const g = new Group();
    g.position.copy(home);
    car.add(g);
    parts.push({ g, home: home.clone(), off, a, b, spin: spin || null, base: g.rotation.clone() });
    return g;
  }
  const V = (x, y, z) => new Vector3(x, y, z);
  function add(parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
    const m = new Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
    parent.add(m);
    return m;
  }

  // Karosserie: Seitenprofil (x = Länge, y = Höhe), vorne ist +x
  const AXF = 1.42, AXR = -1.4, WR = 0.34, ARCH = 0.5;
  function arch(s, cx) {
    const dy = 0.2 - WR, dx = Math.sqrt(ARCH * ARCH - dy * dy);
    s.lineTo(cx - dx, 0.2);
    s.absarc(cx, WR, ARCH, Math.atan2(dy, -dx), Math.atan2(dy, dx), true);
  }
  const body = new Shape();
  body.moveTo(2.12, 0.2);
  body.quadraticCurveTo(2.36, 0.22, 2.37, 0.42);
  body.lineTo(2.35, 0.55);
  body.quadraticCurveTo(2.33, 0.68, 2.08, 0.72);
  body.quadraticCurveTo(1.35, 0.8, 0.72, 0.86);
  body.lineTo(-1.6, 0.93);
  body.quadraticCurveTo(-2.15, 0.92, -2.3, 0.82);
  body.quadraticCurveTo(-2.4, 0.72, -2.37, 0.5);
  body.lineTo(-2.3, 0.26);
  body.quadraticCurveTo(-2.27, 0.2, -2.12, 0.2);
  arch(body, AXR);
  arch(body, AXF);
  body.lineTo(2.12, 0.2);

  // Karosserie in der Draufsicht etwas runder: an den Enden schmaler, oben eingezogen
  function deform(geo, top = 0.07) {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const w = 1 - 0.13 * Math.pow(Math.abs(x) / 2.4, 4) - top * smooth(0.55, 0.95, y) - 0.12 * smooth(0.9, 1.32, y);
      p.setZ(i, z * w);
    }
    geo.computeVertexNormals();
    return geo;
  }
  function extrude(shape, width, bevel, bseg, curveSeg) {
    const g = new ExtrudeGeometry(shape, { depth: width - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.7, bevelSegments: S(bseg), curveSegments: S(curveSeg) });
    g.translate(0, 0, -(width - 2 * bevel) / 2);
    return g;
  }
  // Streifen entlang einer Oberkante (für Motorhaube, Kofferraum, Dach)
  function strip(shape, x0, x1, th) {
    const pts = shape.getPoints(60).filter((p) => p.x <= Math.max(x0, x1) && p.x >= Math.min(x0, x1) && p.y > 0.6);
    pts.sort((p, q) => q.x - p.x);
    const s = new Shape();
    s.moveTo(pts[0].x, pts[0].y);
    pts.forEach((p) => s.lineTo(p.x, p.y));
    for (let i = pts.length - 1; i >= 0; i--) s.lineTo(pts[i].x, pts[i].y - th);
    return s;
  }

  // Türausschnitt (Loch in der Seitenwand) und Tür (etwas kleiner, damit eine Fuge bleibt)
  function doorPath(d, P) {
    P.moveTo(0.6 - d, 0.3 + d);
    P.lineTo(0.655 - d, 0.8 - d);
    P.lineTo(-0.5 + d, 0.845 - d);
    P.quadraticCurveTo(-0.62 + d, 0.58, -0.48 + d, 0.3 + d);
    P.lineTo(0.6 - d, 0.3 + d);
    return P;
  }

  // Karosserie: zwei Seitenwände (mit Türausschnitt) + Vorderwagen + Heck, oben offen (Innenraum sichtbar)
  const bodyG = part(V(0, 0, 0), V(0, 1.55, 0), 0.45, 0.75);
  const side = new Shape(body.getPoints(40));
  side.holes.push(doorPath(0, new Path()));
  const SW = 0.33, ST = 0.07; // Stärke der Seitenwand inkl. Rundung
  [1, -1].forEach((s) => {
    const g = new ExtrudeGeometry(side, { depth: SW - 2 * ST, bevelEnabled: true, bevelThickness: ST, bevelSize: 0.05, bevelSegments: S(5), curveSegments: S(28) });
    g.translate(0, 0, s > 0 ? 0.95 - SW + ST : -0.95 + ST);
    add(bodyG, deform(g), paint);
  });
  // Mittelteil vorne (über dem Motor) bis zur Spritzwand, hinten bis zur Rückwand
  const front = new Shape();
  front.moveTo(2.12, 0.2);
  front.quadraticCurveTo(2.36, 0.22, 2.37, 0.42);
  front.lineTo(2.35, 0.55);
  front.quadraticCurveTo(2.33, 0.68, 2.08, 0.72);
  front.quadraticCurveTo(1.35, 0.8, 0.72, 0.86);
  front.lineTo(0.62, 0.62);
  front.lineTo(0.56, 0.2);
  front.lineTo(2.12, 0.2);
  const rear = new Shape();
  rear.moveTo(-1.5, 0.2);
  rear.lineTo(-1.56, 0.62);
  rear.lineTo(-1.6, 0.93);
  rear.quadraticCurveTo(-2.15, 0.92, -2.3, 0.82);
  rear.quadraticCurveTo(-2.4, 0.72, -2.37, 0.5);
  rear.lineTo(-2.3, 0.26);
  rear.quadraticCurveTo(-2.27, 0.2, -2.12, 0.2);
  rear.lineTo(-1.5, 0.2);
  add(bodyG, deform(extrude(front, 1.36, 0.03, 2, 28)), paint);
  add(bodyG, deform(extrude(rear, 1.36, 0.03, 2, 28)), paint);
  // Innenverkleidung der Seitenwände (dunkel), damit der Innenraum nicht rot leuchtet
  [1, -1].forEach((s) => add(bodyG, new BoxGeometry(2.0, 0.42, 0.01), black, -0.45, 0.6, s * 0.615));

  // Fahrgastzelle (getönte Scheiben, leicht durchsichtig) + Dach
  const cab = new Shape();
  cab.moveTo(0.8, 0.82);
  cab.quadraticCurveTo(0.32, 1.2, -0.12, 1.3);
  cab.lineTo(-0.72, 1.31);
  cab.quadraticCurveTo(-1.38, 1.27, -1.88, 0.9);
  cab.lineTo(0.8, 0.82);
  const cabG = part(V(0, 0, 0), V(0, 1.9, 0), 0.04, 0.32);
  add(cabG, deform(extrude(cab, 1.62, 0.1, 4, 24), 0.0), glass);
  const roofG = part(V(0, 0, 0), V(0, 2.35, 0), 0.06, 0.34);
  add(roofG, deform(extrude(strip(cab, 0.18, -1.15, 0.05), 1.42, 0.03, 2, 24), 0.0), paint, 0, 0.012, 0);

  // Motorhaube, Kofferraumdeckel
  const hoodG = part(V(0, 0, 0), V(0.35, 1.6, 0), 0.02, 0.3);
  add(hoodG, deform(extrude(strip(front, 2.05, 0.82, 0.03), 1.5, 0.015, 2, 30)), paint, 0, 0.012, 0);
  const trunkG = part(V(0, 0, 0), V(-0.3, 1.6, 0), 0.04, 0.32);
  add(trunkG, deform(extrude(strip(rear, -1.92, -2.24, 0.03), 1.45, 0.015, 2, 30)), paint, 0, 0.012, 0);

  // Türen: sitzen bündig im Ausschnitt, innen dunkle Verkleidung, mit Griff und Spiegel
  const doorShape = doorPath(0.014, new Shape());
  [1, -1].forEach((s) => {
    const g = part(V(0, 0, 0), V(0, 0.35, s * 1.25), 0, 0.28);
    const outer = new ExtrudeGeometry(doorShape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.012, bevelSegments: S(3), curveSegments: S(12) });
    outer.translate(0, 0, s > 0 ? 0.95 - 0.07 : -0.95 + 0.02);
    add(g, deform(outer), paint);
    const inner = new ExtrudeGeometry(doorPath(0.04, new Shape()), { depth: 0.12, bevelEnabled: false, curveSegments: S(12) });
    inner.translate(0, 0, s > 0 ? 0.76 : -0.88);
    add(g, deform(inner), black);
    add(g, new BoxGeometry(0.16, 0.025, 0.03), chrome, -0.32, 0.72, s * 0.955);
    const mir = add(g, new SphereGeometry(0.08, S(16), S(10)), paint, 0.55, 0.9, s * 1.0);
    mir.scale.set(1.1, 0.6, 0.9);
    add(g, new BoxGeometry(0.05, 0.08, 0.1), black, 0.6, 0.84, s * 0.94);
  });

  // Stoßfänger vorne mit Scheinwerfern und Grill, hinten mit Rückleuchten und Endrohren
  const frontG = part(V(0, 0, 0), V(1.25, 0.25, 0), 0.3, 0.55);
  const fb = new Shape();
  fb.moveTo(2.0, 0.17); fb.quadraticCurveTo(2.39, 0.19, 2.4, 0.42); fb.lineTo(2.38, 0.52); fb.lineTo(2.1, 0.5); fb.lineTo(2.0, 0.17);
  add(frontG, deform(extrude(fb, 1.86, 0.08, 3, 16)), paint);
  add(frontG, new BoxGeometry(0.04, 0.12, 0.9), black, 2.39, 0.33, 0);
  [1, -1].forEach((s) => {
    const h = add(frontG, new SphereGeometry(0.13, S(20), S(12)), headL, 2.36, 0.6, s * 0.58);
    h.scale.set(0.9, 0.45, 1.3);
  });
  const rearG = part(V(0, 0, 0), V(-1.2, 0.25, 0), 0.32, 0.57);
  const rb = new Shape();
  rb.moveTo(-2.0, 0.17); rb.quadraticCurveTo(-2.39, 0.19, -2.41, 0.42); rb.lineTo(-2.39, 0.5); rb.lineTo(-2.1, 0.48); rb.lineTo(-2.0, 0.17);
  add(rearG, deform(extrude(rb, 1.86, 0.08, 3, 16)), paint);
  [1, -1].forEach((s) => {
    add(rearG, new BoxGeometry(0.05, 0.07, 0.5), tailL, -2.44, 0.74, s * 0.5);
  });

  // Räder: Reifen, Felge, Bremsscheibe, Bremssattel (je ein Bauteil)
  const ri = 0.235, ro = WR, hw = 0.115, cr = 0.045;
  // saubere Reifenkontur: innen -> Flanke -> Lauffläche -> Flanke -> innen
  const tp = [new Vector2(ri, -hw), new Vector2(ro - cr, -hw)];
  for (let i = 1; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * Math.PI / 2; tp.push(new Vector2(ro - cr + Math.cos(a) * cr, -hw + cr + Math.sin(a) * cr)); }
  for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI / 2; tp.push(new Vector2(ro - cr + Math.cos(a) * cr, hw - cr + Math.sin(a) * cr)); }
  tp.push(new Vector2(ri, hw));
  const tireGeo = new LatheGeometry(tp, S(48)).rotateX(Math.PI / 2);
  const barrelGeo = new CylinderGeometry(0.236, 0.236, 0.2, S(40), 1, true).rotateX(Math.PI / 2);
  const lipGeo = new TorusGeometry(0.232, 0.013, S(8), S(40));
  const spokeGeo = new BoxGeometry(0.19, 0.03, 0.03);
  const hubGeo = new CylinderGeometry(0.06, 0.07, 0.05, S(20)).rotateX(Math.PI / 2);
  const discGeo = new CylinderGeometry(0.2, 0.2, 0.026, S(40)).rotateX(Math.PI / 2);
  const hatGeo = new CylinderGeometry(0.09, 0.09, 0.07, S(24)).rotateX(Math.PI / 2);
  const calGeo = new TorusGeometry(0.175, 0.04, S(10), S(16), 1.05);
  const wheels = [];
  [[AXF, 1], [AXF, -1], [AXR, 1], [AXR, -1]].forEach(([x, s], wi) => {
    const c = V(x, WR, s * 0.8);
    const mk = (off, a, b, spin) => { const g = part(c, off, a, b, spin); if (s < 0) { g.rotation.y = Math.PI; parts[parts.length - 1].base.y = Math.PI; } return g; };
    const disc = mk(V(0, 0, s * 0.42), 0.5, 0.9);
    add(disc, discGeo, steel, 0, 0, -0.06);
    add(disc, hatGeo, dark, 0, 0, -0.04);
    const cal = mk(V(0, 0.22, s * 0.7), 0.45, 0.85);
    const cm = add(cal, calGeo, yellow, 0, 0, -0.06, 0, 0, Math.PI * 0.25);
    cm.scale.set(1, 1, 1.5);
    const rim = mk(V(0, 0, s * 1.02), 0.4, 0.8, s * Math.PI * 2);
    add(rim, barrelGeo, alu, 0, 0, 0);
    add(rim, lipGeo, chrome, 0, 0, 0.09);
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      add(rim, spokeGeo, chrome, Math.cos(a) * 0.135, Math.sin(a) * 0.135, 0.075, 0, 0, a);
    }
    add(rim, hubGeo, chrome, 0, 0, 0.085);
    const tire = mk(V(0, 0, s * 1.42), 0.35, 0.75, s * Math.PI * 3);
    add(tire, tireGeo, rubber);
    wheels.push({ disc, cal, rim, tire, wi });
  });

  // Fahrwerk: Schraubenfedern + Stoßdämpfer
  class Helix extends Curve {
    constructor(r, h, turns) { super(); this.r = r; this.h = h; this.t = turns; }
    getPoint(u, o = new Vector3()) { const a = u * this.t * Math.PI * 2; return o.set(Math.cos(a) * this.r, u * this.h, Math.sin(a) * this.r); }
  }
  const springGeo = new TubeGeometry(new Helix(0.07, 0.36, 6), S(140), 0.016, S(6), false);
  const shockGeo = new CylinderGeometry(0.028, 0.028, 0.46, S(12));
  [[AXF, 1], [AXF, -1], [AXR, 1], [AXR, -1]].forEach(([x, s]) => {
    const g = part(V(x, 0.36, s * 0.55), V(0, 0.75, s * 0.2), 0.5, 0.9);
    add(g, springGeo, yellow, 0, 0, 0);
    add(g, shockGeo, steel, 0, 0.2, 0);
  });

  // Unterboden, Achsen, Antrieb
  const chassis = part(V(0, 0, 0), V(0, 0, 0), 2, 3);
  add(chassis, new BoxGeometry(3.7, 0.05, 1.5), dark, -0.1, 0.22, 0);
  [-0.55, 0.55].forEach((z) => add(chassis, new BoxGeometry(4.0, 0.08, 0.1), steel, 0, 0.27, z));
  add(chassis, new CylinderGeometry(0.035, 0.035, 1.3, S(12)).rotateX(Math.PI / 2), steel, AXF, WR, 0);
  add(chassis, new CylinderGeometry(0.035, 0.035, 1.3, S(12)).rotateX(Math.PI / 2), steel, AXR, WR, 0);
  add(chassis, new CylinderGeometry(0.03, 0.03, 2.1, S(12)).rotateZ(Math.PI / 2), alu, -0.4, 0.3, 0);
  const diff = add(chassis, new SphereGeometry(0.13, S(16), S(12)), dark, AXR, WR, 0);
  diff.scale.set(1, 0.9, 1.1);

  // Motor (V8) vorne: Block, Zylinderköpfe, Ventildeckel, Ansaugbrücke, Riemenscheiben, Ölwanne
  const EX = 1.3;
  const block = part(V(EX, 0.46, 0), V(0, 0.25, 0), 0.55, 1);
  add(block, new BoxGeometry(0.9, 0.3, 0.42), alu);
  add(block, new BoxGeometry(0.92, 0.04, 0.44), steel, 0, 0.16, 0);
  [1, -1].forEach((s) => {
    const head = part(V(EX, 0.6, s * 0.2), V(0, 0.5, s * 0.28), 0.6, 1);
    add(head, new BoxGeometry(0.86, 0.1, 0.2), alu, 0, 0, 0, s * 0.55, 0, 0);
    const cov = part(V(EX, 0.67, s * 0.25), V(0, 0.85, s * 0.42), 0.65, 1);
    add(cov, new BoxGeometry(0.84, 0.05, 0.17), redCover, 0, 0, 0, s * 0.55, 0, 0);
    for (let k = 0; k < 4; k++) add(cov, new CylinderGeometry(0.018, 0.018, 0.03, S(10)), chrome, -0.3 + k * 0.2, 0.035, 0, s * 0.55, 0, 0);
  });
  const intake = part(V(EX, 0.68, 0), V(0, 1.15, 0), 0.7, 1);
  add(intake, new CylinderGeometry(0.06, 0.06, 0.7, S(20)).rotateZ(Math.PI / 2), alu);
  add(intake, new CylinderGeometry(0.05, 0.05, 0.12, S(16)), chrome, 0.38, 0, 0, 0, 0, Math.PI / 2);
  const pulley = part(V(EX + 0.5, 0.48, 0), V(0.55, 0.05, 0), 0.6, 1);
  add(pulley, new CylinderGeometry(0.1, 0.1, 0.04, S(24)).rotateZ(Math.PI / 2), steel, 0, 0, 0);
  add(pulley, new CylinderGeometry(0.06, 0.06, 0.04, S(20)).rotateZ(Math.PI / 2), steel, 0, 0.16, 0.12);
  add(pulley, new CylinderGeometry(0.05, 0.05, 0.04, S(20)).rotateZ(Math.PI / 2), yellow, 0, 0.14, -0.13);
  const pan = part(V(EX, 0.27, 0), V(0, -0.14, 0), 0.6, 1);
  add(pan, new BoxGeometry(0.8, 0.08, 0.36), dark);
  const gear = part(V(0.55, 0.42, 0), V(-0.25, 0.12, 0), 0.6, 1);
  add(gear, new CylinderGeometry(0.17, 0.11, 0.6, S(20)).rotateZ(Math.PI / 2), alu);
  const rad = part(V(2.06, 0.46, 0), V(1.0, 0.1, 0), 0.45, 0.85);
  add(rad, new BoxGeometry(0.06, 0.32, 1.1), dark);
  add(rad, new BoxGeometry(0.065, 0.26, 1.02), steel);

  // Auspuffanlage
  const exh = part(V(0, 0, 0), V(0, -0.12, 0), 0.55, 0.95);
  [1, -1].forEach((s) => {
    const path = new CatmullRomCurve3([V(EX - 0.1, 0.36, s * 0.3), V(EX - 0.5, 0.2, s * 0.25), V(0, 0.18, s * 0.2), V(-1.6, 0.2, s * 0.2), V(-2.0, 0.24, s * 0.35), V(-2.35, 0.24, s * 0.42)]);
    add(exh, new TubeGeometry(path, S(48), 0.03, S(8), false), steel);
    add(exh, new CylinderGeometry(0.045, 0.045, 0.12, S(16)).rotateZ(Math.PI / 2), chrome, -2.38, 0.24, s * 0.42);
  });
  const muff = add(exh, new CylinderGeometry(0.13, 0.13, 0.5, S(20)).rotateX(Math.PI / 2), steel, -1.85, 0.24, 0);
  muff.scale.set(1, 0.6, 1);

  // Innenraum: Sitze, Lenkrad, Armaturenbrett, Mittelkonsole
  [1, -1].forEach((s) => {
    const seat = part(V(-0.35, 0.25, s * 0.33), V(0, 0.8, 0), 0.55, 0.85);
    add(seat, new BoxGeometry(0.5, 0.12, 0.44), leather, 0, 0.08, 0);
    add(seat, new BoxGeometry(0.12, 0.56, 0.44), leather, -0.27, 0.38, 0, 0, 0, -0.18);
    add(seat, new BoxGeometry(0.1, 0.16, 0.26), leather, -0.36, 0.76, 0, 0, 0, -0.18);
    [-0.15, 0.15].forEach((z) => add(seat, new BoxGeometry(0.01, 0.5, 0.012), yellow, -0.205, 0.38, z, 0, 0, -0.18));
    add(seat, new BoxGeometry(0.42, 0.012, 0.012), yellow, 0.02, 0.145, 0);
  });
  const dash = part(V(0.5, 0.62, 0), V(0, 1.1, 0), 0.55, 0.85);
  add(dash, new BoxGeometry(0.24, 0.16, 1.22), trim);
  add(dash, new BoxGeometry(0.02, 0.07, 0.3), new MeshBasicMaterial({ color: 0xffb81c }), -0.125, 0.04, 0.33);
  add(dash, new BoxGeometry(0.02, 0.08, 0.26), new MeshBasicMaterial({ color: 0x3b4a5e }), -0.125, 0.0, -0.02);
  const console_ = part(V(-0.05, 0.3, 0), V(0, 0.95, 0), 0.55, 0.85);
  add(console_, new BoxGeometry(0.9, 0.16, 0.18), trim);
  add(console_, new CylinderGeometry(0.012, 0.012, 0.12, S(8)), chrome, 0.15, 0.14, 0);
  add(console_, new SphereGeometry(0.03, S(12), S(8)), black, 0.15, 0.21, 0);
  const wheel = part(V(0.27, 0.7, 0.33), V(0.1, 1.25, 0), 0.58, 0.88);
  add(wheel, new TorusGeometry(0.15, 0.022, S(8), S(28)), black, 0, 0, 0, 0, Math.PI / 2, 0.45);
  add(wheel, new CylinderGeometry(0.045, 0.045, 0.03, S(16)).rotateZ(Math.PI / 2), yellow, 0.0, 0, 0, 0, 0, 0.45 - Math.PI / 2 + Math.PI / 2);
  [0, 2.1, 4.2].forEach((a) => add(wheel, new BoxGeometry(0.012, 0.15, 0.02), black, 0, 0, 0, a, Math.PI / 2, 0.45).translateY(0.07));
  add(wheel, new CylinderGeometry(0.02, 0.02, 0.3, S(8)), black, 0.14, -0.06, 0, 0, 0, 1.1);

  // Boden: Kontaktschatten + Drehteller-Ring
  const sh = document.createElement("canvas");
  sh.width = 256; sh.height = 128;
  const sx = sh.getContext("2d");
  const grd = sx.createRadialGradient(128, 64, 0, 128, 64, 128);
  grd.addColorStop(0, "rgba(0,0,0,.85)"); grd.addColorStop(0.55, "rgba(0,0,0,.45)"); grd.addColorStop(1, "rgba(0,0,0,0)");
  sx.fillStyle = grd; sx.fillRect(0, 0, 256, 128);
  const shadowMat = new MeshBasicMaterial({ map: new CanvasTexture(sh), transparent: true, depthWrite: false });
  const shadow = new Mesh(new PlaneGeometry(5.6, 2.6), shadowMat);
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.005;
  car.add(shadow);
  const ringMat = new MeshBasicMaterial({ color: 0xffb81c, transparent: true, opacity: 0.55, side: DoubleSide });
  const ring = new Mesh(new RingGeometry(2.95, 2.985, S(128)), ringMat);
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.002;
  scene.add(ring);
  const ring2 = new Mesh(new RingGeometry(3.25, 3.26, S(128)), new MeshBasicMaterial({ color: 0x3a4048, side: DoubleSide }));
  ring2.rotation.x = -Math.PI / 2;
  scene.add(ring2);

  // Beschriftungen im zerlegten Zustand
  const labels = [
    { t: "Karosserie", obj: bodyG, p: V(-0.6, 0.95, 0) },
    { t: "Motor · V8", obj: intake, p: V(-0.2, 0.05, 0) },
    { t: "Bremssattel", obj: wheels[0].cal, p: V(0, 0.2, 0) },
    { t: "Federbein", obj: parts.find((q) => q.g.children[0] && q.g.children[0].geometry === springGeo).g, p: V(0, 0.36, 0), wide: true },
    { t: "Auspuffanlage", obj: exh, p: V(-2.0, 0.24, 0.4), wide: true },
    { t: "Reifen 225/45 R18", obj: wheels[2].tire, p: V(0, WR, 0) }
  ].map((l) => {
    const el = document.createElement("span");
    el.className = "x3d__lab" + (l.wide ? " x3d__lab--wide" : "");
    el.textContent = l.t;
    labelBox.appendChild(el);
    return { ...l, el };
  });

  // Größe und Kamera
  let W = 1, H = 1;
  function resize() {
    const r = stage.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    dirty = true;
  }
  let dirty = true;
  window.addEventListener("resize", resize);

  let P = 0, E = 0, pT = 0, eT = 0;
  const steps4 = [0, 0.25, 0.45, 0.65];
  function read() {
    const r = section.getBoundingClientRect();
    const pin = section.querySelector(".x3d__pin").offsetHeight;
    pT = clamp(-r.top / Math.max(1, r.height - pin), 0, 1);
    eT = smooth(0.08, 0.42, pT) * (1 - smooth(0.62, 0.92, pT));
  }

  const tmp = new Vector3();
  function apply() {
    parts.forEach((q) => {
      const t = smooth(q.a, q.b, E);
      q.g.position.set(q.home.x + q.off.x * t, q.home.y + q.off.y * t, q.home.z + q.off.z * t);
      if (q.spin) q.g.rotation.z = q.spin * t;
    });
    car.rotation.y = -0.8 + P * 1.6;
    ring.rotation.z = -P * 1.6;
    shadowMat.opacity = 1 - 0.55 * E;

    // Kamera: im zerlegten Zustand weiter weg und etwas höher
    const vf = (camera.fov * Math.PI) / 180;
    const hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
    // Breite bzw. Höhe, die ins Bild muss (zerlegt deutlich mehr)
    // Hochformat (Handy): Auto darf bis an den Rand, Blick etwas mehr von oben
    const port = camera.aspect < 1;
    const needW = port ? lerp(4.3, 5.7, E) : lerp(5.4, 7.6, E), needH = lerp(2.2, 5.0, E);
    const d = Math.max(needW / 2 / Math.tan(hf / 2), needH / 2 / Math.tan(vf / 2)) + (port ? 1.8 : 2.6);
    const ty = lerp(0.6, 1.75, E);
    camera.position.set(0, ty + d * (port ? lerp(0.3, 0.36, E) : lerp(0.2, 0.24, E)), d);
    camera.lookAt(0, ty, 0);
    car.updateMatrixWorld(true);

    const show = smooth(0.8, 0.97, E);
    labels.forEach((l) => {
      tmp.copy(l.p).applyMatrix4(l.obj.matrixWorld).project(camera);
      const x = (tmp.x * 0.5 + 0.5) * W, y = (-tmp.y * 0.5 + 0.5) * H;
      l.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      l.el.style.opacity = show.toFixed(3);
    });
    let n = 0;
    parts.forEach((q) => { if (smooth(q.a, q.b, E) > 0.5) n++; });
    if (countEl) countEl.textContent = n;
    if (barEl) barEl.style.transform = `scaleX(${P.toFixed(4)})`;
    let a = 0;
    steps4.forEach((s, i) => { if (P >= s) a = i; });
    steps.forEach((li, i) => li.classList.toggle("on", i === a));
  }

  let running = false, last = 0, raf = 0;
  function frame(t) {
    raf = 0;
    if (!running) return;
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    read();
    const k = reduce ? 1 : 1 - Math.exp(-dt * 7);
    const nP = P + (pT - P) * k, nE = E + (eT - E) * k;
    if (Math.abs(nP - P) > 1e-5 || Math.abs(nE - E) > 1e-5 || dirty) {
      P = nP; E = nE; dirty = false;
      apply();
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(frame);
  }
  const io = new IntersectionObserver((en) => {
    running = en[0].isIntersecting;
    if (running && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  });
  io.observe(section);

  resize();
  read(); P = pT; E = eT;
  apply();
  renderer.render(scene, camera);
  section.classList.add("is-ready");
  return true;
}
