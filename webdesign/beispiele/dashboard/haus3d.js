// Haus im Querschnitt für die Website von "Haustechnik Kofler": Strom, Wasser, Heizung, Photovoltaik
// und Abwasser leuchten nacheinander auf. Tippen auf die Legende zeigt einen Bereich einzeln, Ziehen dreht das Haus.
import { reduce, mobile, webglOk, whenNear, loadThree, stage, dragRotate } from "/beispiele/_shared/stage3d.js?v=1";

var host = document.getElementById("haus3d"), sec = host && host.closest("section");
if (host && webglOk()) whenNear(host, function () { loadThree().then(init).catch(function () {}); });

var SYS = {
  strom: { c: 0xffc83d, n: "Strom", d: "Vom Hausanschluss über Zähler und Verteiler zu jeder Steckdose und Lampe." },
  wasser: { c: 0x3ea6ff, n: "Wasser", d: "Kaltwasser vom Netz zu Küche und Bad, Warmwasser direkt aus dem Speicher." },
  heizung: { c: 0xff6a3d, n: "Heizung", d: "Die Wärmepumpe versorgt die Fußbodenheizung in jedem Stockwerk." },
  pv: { c: 0x37d67a, n: "Photovoltaik", d: "Strom vom Dach über den Wechselrichter in den Speicher und ins Haus." },
  abwasser: { c: 0x9aa6bd, n: "Abwasser", d: "Alles, was abfließt, sicher und mit Gefälle in den Kanal." }
};
var ORDER = ["strom", "wasser", "heizung", "pv", "abwasser"];

function init(THREE) {
  var S = stage(THREE, host, { fov: 32, exposure: 1.1 });
  host.classList.add("is-on");
  var scene = S.scene, cam = S.camera;
  scene.background = new THREE.Color(0x0f1424);
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x1a2036, 1.15));
  var key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(8, 14, 10); scene.add(key);
  var back = new THREE.DirectionalLight(0x8fb0ff, .6); back.position.set(-8, 6, -8); scene.add(back);

  function M(c, o) { return new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .85 }, o || {})); }
  var wall = M(0xe9edf5), slab = M(0xc5ccd9), cut = M(0x6d778c), wood = M(0xc89b6a, { roughness: .7 }), earth = M(0x4a3a2c), grass = M(0x3f7d4a), dark = M(0x3a4256, { roughness: .6 }), white = M(0xf7f8fb), roofM = M(0x8a4b3a, { emissive: 0x3a1c14, emissiveIntensity: .8 });
  function bx(w, h, d, m, x, y, z) { var o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); scene.add(o); return o; }

  // Erdreich mit Schnitt vorne, Wiese obenauf
  bx(3, 2.6, 8, earth, -5.75, -1.3, -1); bx(3, 2.6, 8, earth, 5.5, -1.3, -1); bx(8, 2.6, 1.8, earth, 0, -1.3, -4.15);
  bx(3, .12, 8, grass, -5.75, .06, -1); bx(3, .12, 8, grass, 5.5, .06, -1); bx(8, .12, 1.8, grass, 0, .06, -4.15);
  bx(14.5, .3, 8, earth, 0, -2.8, -1);
  // Decken, Böden, Wände (vorne und rechts offen)
  // Decken nach oben hin etwas kürzer, damit man von vorne in jedes Geschoss hineinsieht
  [[-2.4, slab, 6], [0, wood, 4.9], [2.8, wood, 5.5], [5.6, slab, 6]].forEach(function (f) { var d = f[2], z = -3 + d / 2; bx(8, .24, d, cut, 0, f[0] - .12, z); bx(7.8, .03, d - .2, f[1], 0, f[0] + .015, z); });
  bx(8, 8, .24, wall, 0, 1.6, -3.12); bx(.24, 8, 6.24, wall, -4.12, 1.6, 0);
  // Satteldach mit First von vorne nach hinten; rechte Dachfläche trägt die PV-Module, Giebel an der Rückwand
  var roofL = bx(4.95, .18, 6.7, roofM, -2.15, 6.85, 0); roofL.rotation.z = .56;
  var roof = bx(4.95, .18, 6.7, roofM, 2.15, 6.85, 0); roof.rotation.z = -.56;
  var g = new THREE.Shape(); g.moveTo(-4.24, 0); g.lineTo(4.24, 0); g.lineTo(0, 2.75); g.lineTo(-4.24, 0);
  var gable = new THREE.Mesh(new THREE.ShapeGeometry(g), wall); gable.position.set(0, 5.6, -3.12); scene.add(gable);
  var pvM = M(0x1d2f5c, { roughness: .3, metalness: .4, emissive: 0x37d67a, emissiveIntensity: 0 }), pvPanels = [];
  for (var i = 0; i < 2; i++) for (var j = 0; j < 3; j++) {
    var p = new THREE.Mesh(new THREE.BoxGeometry(1.95, .06, 1.7), pvM);
    p.position.set(-1.05 + i * 2.1, .12, -1.9 + j * 1.85); roof.add(p); pvPanels.push(p);
  }
  // Einrichtung: Technikraum im Keller, Küche und Wohnzimmer im EG, Bad und Schlafzimmer im OG
  bx(1, 1.9, .7, white, -3.2, -1.45, -2.5); // Wärmepumpe innen
  var tank = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, 1.8, 24), white); tank.position.set(-1.9, -1.5, -2.45); scene.add(tank);
  bx(.9, 1.2, .25, dark, 2.6, -1.2, -2.85); // Zähler und Verteiler
  bx(.7, .9, .25, dark, 1.3, -1.35, -2.85); bx(.6, 1, .5, M(0x2a3550), 1.3, -1.9, -2.5); // Wechselrichter, Batterie
  bx(2.4, .9, .6, white, -2.6, .45, -2.65); bx(2.4, .05, .64, dark, -2.6, .92, -2.65); // Küche
  bx(.5, .05, .4, M(0xaab3c3, { metalness: .6, roughness: .3 }), -2.2, .95, -2.65);
  bx(2.2, .45, .9, M(0x5b6c8f), 2.2, .35, -2.3); bx(2.2, .45, .25, M(0x52627f), 2.2, .75, -2.7); // Sofa
  bx(1.8, .6, .8, white, -2.9, 3.1, -2.4); bx(.5, .5, .6, white, -1.1, 3.05, -2.7); bx(.7, .8, .45, white, -1.9, 3.2, -2.85); // Badewanne, WC, Waschtisch
  bx(1.8, .45, 2.2, M(0xdfe4ee), 2.3, 3.05, -1.8); bx(1.8, .25, .5, white, 2.3, 3.35, -2.75); // Bett

  // Leitungen: Röhren mit eigenem Shader, der sie entlang der Länge freilegt und Lichtpulse fließen lässt
  var lines = { strom: [], wasser: [], heizung: [], pv: [], abwasser: [] }, glows = { strom: [], wasser: [], heizung: [], pv: [], abwasser: [] };
  var lineMat = function (col) {
    return new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uC: { value: new THREE.Color(col) }, uP: { value: 0 }, uT: { value: 0 }, uL: { value: 10 }, uA: { value: 1 } },
      vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader: "uniform vec3 uC;uniform float uP;uniform float uT;uniform float uL;uniform float uA;varying vec2 vUv;" +
        "void main(){if(vUv.x>uP)discard;float d=fract(vUv.x*uL*.9-uT*1.4);float pulse=smoothstep(.0,.15,d)*smoothstep(.45,.15,d);" +
        "float head=smoothstep(uP-.04,uP,vUv.x)*step(uP,.999);vec3 c=uC*(.75+pulse*.9+head*2.);gl_FragColor=vec4(c,uA);}"
    });
  };
  function line(sys, pts, r) {
    var path = new THREE.CurvePath(), len = 0;
    for (var k = 1; k < pts.length; k++) { var a = new THREE.Vector3().fromArray(pts[k - 1]), b = new THREE.Vector3().fromArray(pts[k]); path.add(new THREE.LineCurve3(a, b)); len += a.distanceTo(b); }
    var m = lineMat(SYS[sys].c); m.uniforms.uL.value = len;
    var mesh = new THREE.Mesh(new THREE.TubeGeometry(path, Math.max(16, Math.round(len * 14)), (r || .055) * 1.7, 8, false), m);
    scene.add(mesh); lines[sys].push(mesh);
  }
  function glow(sys, x, y, z, s) {
    var m = new THREE.Mesh(new THREE.SphereGeometry(s || .12, 16, 12), new THREE.MeshBasicMaterial({ color: SYS[sys].c, transparent: true, opacity: 0 }));
    m.position.set(x, y, z); scene.add(m); glows[sys].push(m);
  }
  var B = -2.95; // Leitungen laufen knapp vor der Rückwand
  // Strom
  line("strom", [[2.6, -1.4, -6], [2.6, -1.4, B], [2.6, -1.2, B]]);
  line("strom", [[3.2, -1.2, B], [3.6, -1.2, B], [3.6, 2.55, B], [-3.6, 2.55, B], [-3.6, 2.55, -1], [-3.95, 2.55, -1]]);
  line("strom", [[3.6, 2.55, B], [3.6, 5.35, B], [-3.6, 5.35, B]]);
  line("strom", [[1.5, 2.55, B], [1.5, 2.55, 0], [1.5, 2.7, 0]]); line("strom", [[-2, 5.35, B], [-2, 5.35, 0], [-2, 5.5, 0]]); line("strom", [[2.3, 5.35, B], [2.3, 5.35, 0], [2.3, 5.5, 0]]);
  glow("strom", 1.5, 2.55, 0, .16); glow("strom", -2, 5.35, 0, .16); glow("strom", 2.3, 5.35, 0, .16); glow("strom", -3.95, 2.55, -1, .09); glow("strom", 2.6, -1.2, -2.7, .1);
  // Wasser: kalt (blau) und warm (rot) gehören zusammen
  line("wasser", [[-.6, -2.1, -6], [-.6, -2.1, -2.8], [-.6, -1.4, -2.8], [-1.5, -1.4, -2.8]]);
  line("wasser", [[-.6, -1.4, -2.8], [-.6, .7, -2.8], [-2.2, .7, -2.8], [-2.2, 1, -2.8]]);
  line("wasser", [[-.6, .7, -2.8], [-.6, 3.3, -2.8], [-2.9, 3.3, -2.8], [-2.9, 3.4, -2.6]]);
  line("wasser", [[-.6, 3.3, -2.8], [-1.1, 3.3, -2.8], [-1.1, 3.3, -2.6]]);
  var warm = 0xff4d5e;
  [[[-1.9, -.55, -2.6], [-1.9, -.3, -2.6], [-1.3, -.3, -2.75], [-1.3, .8, -2.75], [-2.4, .8, -2.75], [-2.4, 1.05, -2.75]], [[-1.3, .8, -2.75], [-1.3, 3.45, -2.75], [-2.7, 3.45, -2.75], [-2.7, 3.45, -2.55]]].forEach(function (pts) { line("wasser", pts, .05); lines.wasser[lines.wasser.length - 1].material.uniforms.uC.value.setHex(warm); });
  glow("wasser", -2.2, 1.05, -2.65, .1); glow("wasser", -2.9, 3.45, -2.4, .1);
  // Heizung: Wärmepumpe außen, Fußbodenheizung in Schlangen
  line("heizung", [[-5, .45, -4.2], [-3.2, .45, -4.2], [-3.2, -1.2, -3.2], [-3.2, -1.2, -2.85]], .07);
  function floorLoop(y, x0, x1) {
    var pts = [[-3.4, y, -2.85]], z = -2.5, dir = 1, zEnd = y < 1 ? 1.6 : 2.2;
    while (z < zEnd) { pts.push([dir > 0 ? x0 : x1, y, z]); pts.push([dir > 0 ? x1 : x0, y, z]); z += .7; dir = -dir; }
    line("heizung", pts, .028);
  }
  line("heizung", [[-2.7, -1, -2.85], [-3.4, -1, -2.85], [-3.4, .06, -2.85]], .06);
  line("heizung", [[-3.4, .06, -2.85], [-3.4, 2.86, -2.85]], .06);
  floorLoop(.06, -3.6, 3.6); floorLoop(2.86, -3.6, 3.6);
  // Photovoltaik
  line("pv", [[3.4, 6.2, -2.9], [3.9, 5.7, -3.0], [3.9, -.8, -3.0], [1.3, -.8, -3.0], [1.3, -.9, -2.95]], .06);
  line("pv", [[1.3, -1.8, -2.95], [1.3, -1.9, -2.75]], .06);
  line("pv", [[1.65, -1.2, -2.95], [2.15, -1.2, -2.95]], .06);
  glow("pv", 1.3, -1.9, -2.2, .12);
  // Abwasser
  line("abwasser", [[-2.9, 3.15, -2.2], [-3.4, 3.0, -2.2], [-3.75, 2.9, -2.2], [-3.75, -2.1, -2.2], [-3.75, -2.2, -6]], .08);
  line("abwasser", [[-1.1, 3.0, -2.5], [-1.1, 2.9, -2.2], [-3.75, 2.75, -2.2]], .07);
  line("abwasser", [[-2.2, .8, -2.6], [-2.2, .2, -2.4], [-3.75, .1, -2.4]], .07);

  // Steuerung: automatischer Ablauf, bis jemand eine Legende antippt
  var legend = sec.querySelector(".h3d__legend"), info = sec.querySelector(".h3d__info");
  var state = {}; ORDER.forEach(function (k) { state[k] = { p: 0, on: 0 }; });
  var auto = !reduce, step = 0, stepT = 0, picked = null;
  legend.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    auto = false; picked = b.dataset.sys === picked ? null : b.dataset.sys; mark();
  });
  function mark() {
    legend.querySelectorAll("button").forEach(function (b) {
      var k = b.dataset.sys, on = picked ? k === picked : (k === "alle" ? false : true);
      if (k === "alle") on = !picked && !auto;
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var k = picked || (auto ? ORDER[Math.min(step, ORDER.length - 1)] : null);
    info.innerHTML = k && SYS[k] ? "<b>" + SYS[k].n + "</b>" + SYS[k].d : "<b>Alles zusammen</b>So sieht ein Haus aus, in dem wir alles aus einer Hand gemacht haben.";
  }
  function wanted(k) { if (picked) return k === picked; if (!auto) return true; return ORDER.indexOf(k) <= step; }
  if (reduce) { auto = false; ORDER.forEach(function (k) { state[k].p = 1; }); }
  mark();

  var drag = dragRotate(S.canvas, { speed: .006, minYaw: -1.1, maxYaw: 1.1 });
  var target = new THREE.Vector3(0, 1.9, 0);
  S.onFrame(function (dt, t) {
    if (auto) {
      stepT += dt;
      if (step < ORDER.length && stepT > 3.2) { step++; stepT = 0; mark(); }
      if (step >= ORDER.length && stepT > 4) { step = 0; stepT = 0; ORDER.forEach(function (k) { state[k].p = 0; }); mark(); }
    }
    ORDER.forEach(function (k) {
      var st = state[k], w = wanted(k);
      st.p = w ? Math.min(1, st.p + dt / 1.8) : Math.max(0, st.p - dt * 2);
      st.on += ((picked ? (k === picked ? 1 : .0) : 1) - st.on) * Math.min(1, dt * 5);
      lines[k].forEach(function (m) { var u = m.material.uniforms; u.uP.value = st.p * 1.001; u.uT.value = t; u.uA.value = .25 + .75 * st.on; m.visible = st.p > 0; });
      glows[k].forEach(function (m) { m.material.opacity = Math.max(0, (st.p - .8) * 5) * (.6 + Math.sin(t * 4) * .25) * st.on; });
    });
    pvM.emissiveIntensity = state.pv.p * .12 * state.pv.on;
    var yaw = .48 + drag.yaw + (drag.touched || reduce ? 0 : Math.sin(t * .2) * .18), pitch = .1;
    var tv = Math.tan(cam.fov * Math.PI / 360), dist = Math.max(8.2 / (tv * cam.aspect), 6.2 / tv);
    cam.position.set(Math.sin(yaw) * Math.cos(pitch) * dist, target.y + Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist);
    cam.lookAt(target);
  });
}
