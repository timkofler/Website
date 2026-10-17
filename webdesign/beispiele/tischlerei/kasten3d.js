// Fertigung in 3D: Das Sideboard setzt sich beim Scrollen Brett für Brett zusammen.
// Ersetzt die SVG-Explosionszeichnung nur, wenn WebGL da ist und keine reduzierte Bewegung gewünscht ist.
import { reduce, mobile, webglOk, whenNear, loadThree, stage, woodTexture, blobTexture, dragRotate } from "/beispiele/_shared/stage3d.js?v=1";

var build = document.getElementById("fertigung"), art = build && build.querySelector(".bart");
if (art && !reduce && webglOk()) whenNear(build, function () { loadThree().then(init).catch(function () {}); });

function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function easeIO(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

function init(THREE) {
  var host = document.createElement("div"); host.className = "b3d";
  host.innerHTML = '<p class="b3d__tag" id="b3dTag"><b>180 × 78 × 45 cm</b> · Eiche massiv, Fronten Nuss<span>Ziehen zum Drehen</span></p>';
  art.appendChild(host);
  var S = stage(THREE, host, { alpha: true, fov: 30, exposure: 1.05 });
  art.classList.add("has3d");
  var scene = S.scene, cam = S.camera;

  scene.add(new THREE.HemisphereLight(0xfff4e4, 0x8a6a4a, 1.35));
  var sun = new THREE.DirectionalLight(0xffe2bf, 2.3); sun.position.set(2.5, 4, 3); scene.add(sun);
  var rim = new THREE.DirectionalLight(0xcfe0ff, .7); rim.position.set(-3, 2, -2); scene.add(rim);

  var oakT = woodTexture(THREE, { base: "#c79a63", dark: "#8a5a2c", light: "#e0bb85", seed: 11, lines: 52 });
  var nutT = woodTexture(THREE, { base: "#6a4128", dark: "#3a2112", light: "#8d5d3a", seed: 5, lines: 60, wave: 16 });
  function wood(tex, rep, rot) {
    var t = tex.clone(); t.needsUpdate = true; t.repeat.set(rep[0], rep[1]);
    if (rot) { t.center.set(.5, .5); t.rotation = Math.PI / 2; }
    return new THREE.MeshStandardMaterial({ map: t, roughness: .62, metalness: 0 });
  }
  var oakH = wood(oakT, [1.6, .5]), oakV = wood(oakT, [.8, .6], true), nut = wood(nutT, [.7, .7], true), nutH = wood(nutT, [.8, .5]);
  var brass = new THREE.MeshStandardMaterial({ color: 0xc8a050, metalness: .55, roughness: .28, emissive: 0x3a2808 });
  var inner = new THREE.MeshStandardMaterial({ color: 0xb98d5c, roughness: .8 });

  var root = new THREE.Group(); scene.add(root);
  var parts = [];
  // part: Mesh oder Gruppe, Endlage, Startversatz, Startdrehung, Zeitfenster [a,b] im Scrollfortschritt
  function part(obj, pos, off, rot, a, b) {
    obj.position.set(pos[0], pos[1], pos[2]); root.add(obj);
    parts.push({ o: obj, p: new THREE.Vector3(pos[0], pos[1], pos[2]), off: new THREE.Vector3(off[0], off[1], off[2]), r: rot || [0, 0, 0], a: a, b: b, base: obj.rotation.clone() });
    return obj;
  }
  function box(w, h, d, m) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); }

  // Korpus
  part(box(1.8, .02, .45, oakH), [0, .17, 0], [0, -.9, .4], [.5, 0, .2], .02, .12);
  part(box(.02, .57, .45, oakV), [-.89, .465, 0], [-1.3, .3, .3], [0, .8, .5], .06, .17);
  part(box(.02, .57, .45, oakV), [.89, .465, 0], [1.3, .3, .3], [0, -.8, -.5], .1, .21);
  part(box(1.76, .57, .01, inner), [0, .465, -.22], [0, .2, -1.4], [-.6, 0, 0], .15, .27);
  // Zwischenwände, Einlegeböden, Deckplatte
  part(box(.02, .57, .43, oakV), [-.3, .465, 0], [0, 1.2, .2], [0, 0, .7], .29, .37);
  part(box(.02, .57, .43, oakV), [.3, .465, 0], [0, 1.25, .2], [0, 0, -.7], .31, .39);
  part(box(.57, .02, .4, oakH), [-.595, .46, .01], [-.2, .2, 1.3], [0, .6, 0], .33, .41);
  part(box(.57, .02, .4, oakH), [.595, .46, .01], [.2, .2, 1.3], [0, -.6, 0], .34, .42);
  part(box(1.86, .03, .48, wood(oakT, [1.8, .45])), [0, .765, .005], [0, 1.4, 0], [.3, .4, -.15], .36, .47);

  // Fronten: Türen drehen sich an der Außenkante, Laden fahren nach vorne
  function door(side) {
    var g = new THREE.Group(), m = box(.595, .57, .02, nut); m.position.x = -side * .2975; g.add(m);
    var h = new THREE.Mesh(new THREE.CylinderGeometry(.007, .007, .17, 10), brass); h.position.set(-side * .555, .02, .02); g.add(h);
    return g;
  }
  var dL = part(door(-1), [-.895, .465, .235], [-.9, .1, 1.2], [0, -1.2, 0], .46, .55);
  var dR = part(door(1), [.895, .465, .235], [.9, .1, 1.2], [0, 1.2, 0], .52, .61);
  function drawer() {
    var g = new THREE.Group(); g.add(box(.585, .275, .02, nutH));
    var bx = box(.54, .2, .36, inner); bx.position.set(0, -.02, -.19); g.add(bx);
    var h = new THREE.Mesh(new THREE.CylinderGeometry(.007, .007, .2, 10), brass); h.rotation.z = Math.PI / 2; h.position.set(0, .02, .02); g.add(h);
    return g;
  }
  var lo = part(drawer(), [0, .325, .235], [0, -.3, 1.4], [.5, 0, 0], .48, .57);
  var hi = part(drawer(), [0, .61, .235], [0, .4, 1.4], [-.5, 0, 0], .5, .59);

  // Konische Füße
  [[-.8, -.16], [.8, -.16], [-.8, .16], [.8, .16]].forEach(function (f, i) {
    var leg = new THREE.Mesh(new THREE.CylinderGeometry(.024, .014, .16, 16), oakH);
    part(leg, [f[0], .08, f[1]], [f[0] * .4, -.7, f[1] * 2], [0, 0, i % 2 ? 1.2 : -1.2], .61 + i * .03, .69 + i * .03);
  });

  var blob = new THREE.Mesh(new THREE.PlaneGeometry(2.3, .85), new THREE.MeshBasicMaterial({ map: blobTexture(THREE, .42), transparent: true, depthWrite: false }));
  blob.rotation.x = -Math.PI / 2; blob.position.y = .001; root.add(blob);

  var drag = dragRotate(S.canvas, { speed: .008 });
  var tag = host.querySelector("#b3dTag");
  function progress() {
    var r = build.getBoundingClientRect(), inner = build.firstElementChild.offsetHeight, span = r.height - inner;
    return span > 0 ? clamp(-r.top / span * 1.06) : 1;
  }
  var shown = 0, target = new THREE.Vector3(0, .38, 0), tmp = new THREE.Vector3();
  S.onFrame(function (dt, t) {
    var p = progress();
    shown += (p - shown) * Math.min(1, dt * 9);
    parts.forEach(function (c) {
      var k = clamp((shown - c.a) / (c.b - c.a)), e = easeOut(k), q = 1 - e;
      c.o.visible = k > 0;
      c.o.position.copy(c.p).addScaledVector(c.off, q);
      c.o.rotation.set(c.base.x + c.r[0] * q, c.base.y + c.r[1] * q, c.base.z + c.r[2] * q);
    });
    // Zum Schluss öffnet sich kurz eine Tür und die obere Lade, damit man das Innenleben sieht
    var open = clamp((shown - .8) / .07) * (1 - clamp((shown - .93) / .05));
    dL.rotation.y = -open * 1.15; hi.position.z = .235 + open * .26;
    blob.material.opacity = clamp(shown / .2);
    tag.classList.toggle("on", shown > .9);
    var yaw = -.75 + easeIO(shown) * 1.15 + drag.yaw + (drag.touched ? 0 : Math.sin(t * .4) * .04);
    var pitch = .34 - shown * .14;
    var tv = Math.tan(cam.fov * Math.PI / 360), dist = Math.max(1.25 / (tv * cam.aspect), .8 / tv);
    cam.position.set(Math.sin(yaw) * Math.cos(pitch) * dist, target.y + Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist);
    cam.lookAt(tmp.copy(target));
  });
}
