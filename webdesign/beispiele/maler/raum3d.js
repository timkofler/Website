// "Wie wirkt Ihre Farbe im Raum?" in 3D: ein Wohnzimmer zum Umsehen. Die Farbfelder (app.js) schicken
// das Ereignis "tk-paint"; die neue Farbe rollt wie mit der Walze über die Wand. Dazu Tag/Abend und Akzentwand.
import { reduce, mobile, webglOk, whenNear, loadThree, stage, woodTexture, blobTexture, dragRotate } from "/beispiele/_shared/stage3d.js?v=1";

var svg = document.getElementById("room"), box = svg && svg.parentNode;
if (box && webglOk()) whenNear(box, function () { loadThree().then(init).catch(function () {}); });

function cl(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function eio(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

function init(THREE) {
  var host = document.createElement("div"); host.className = "r3d";
  host.innerHTML = '<div class="r3d__ui" role="group" aria-label="Ansicht">' +
    '<button type="button" data-k="light" aria-pressed="false">Abendlicht</button>' +
    '<button type="button" data-k="accent" aria-pressed="false">Nur Akzentwand</button></div>' +
    '<p class="r3d__hint">Ziehen zum Umsehen</p>';
  box.appendChild(host);
  var S = stage(THREE, host, { fov: 50, shadows: true, exposure: 1.12 });
  box.classList.add("has3d");
  var scene = S.scene, cam = S.camera;
  scene.background = new THREE.Color(0xf4f2ee);

  // Wandmaterial mit Walzen-Übergang: links von der Kante die neue Farbe, rechts die alte
  function wallMat(w) {
    var u = { uOld: { value: new THREE.Color(0x9caf88) }, uNew: { value: new THREE.Color(0x9caf88) }, uP: { value: 1 }, uW: { value: w } };
    var m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .92 });
    m.onBeforeCompile = function (sh) {
      Object.assign(sh.uniforms, u);
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vP;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvP = position.xy;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec2 vP;uniform vec3 uOld;uniform vec3 uNew;uniform float uP;uniform float uW;")
        .replace("vec4 diffuseColor = vec4( diffuse, opacity );",
          "float edge = uP * (uW + .8) - .4 + sin(vP.y * 9.) * .03 + sin(vP.y * 23.) * .015;" +
          "float k = smoothstep(edge + .02, edge - .02, vP.x);" +
          "float wet = smoothstep(.0, .25, edge - vP.x) * .06 * (1. - uP);" +
          "vec3 c = mix(uOld, uNew * (1. - wet), k);" +
          "vec4 diffuseColor = vec4( c, opacity );");
    };
    m.userData.u = u; return m;
  }
  var W = 5.2, D = 4.4, H = 2.6;
  // Rückwand mit Fensteröffnung
  var sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(W, 0); sh.lineTo(W, H); sh.lineTo(0, H); sh.lineTo(0, 0);
  var win = new THREE.Path(); win.moveTo(.75, .85); win.lineTo(2.05, .85); win.lineTo(2.05, 2.25); win.lineTo(.75, 2.25); win.lineTo(.75, .85); sh.holes.push(win);
  var backM = wallMat(W), back = new THREE.Mesh(new THREE.ShapeGeometry(sh), backM);
  back.position.set(-W / 2, 0, -D / 2); back.receiveShadow = true; back.castShadow = true; scene.add(back);
  var leftM = wallMat(D), left = new THREE.Mesh(new THREE.PlaneGeometry(D, H).translate(D / 2, H / 2, 0), leftM);
  left.rotation.y = Math.PI / 2; left.position.set(-W / 2, 0, D / 2); left.receiveShadow = true; scene.add(left);
  var rightM = wallMat(D), right = new THREE.Mesh(new THREE.PlaneGeometry(D, H).translate(D / 2, H / 2, 0), rightM);
  right.rotation.y = -Math.PI / 2; right.position.set(W / 2, 0, -D / 2); right.receiveShadow = true; scene.add(right);
  var walls = [backM, leftM, rightM];

  var white = new THREE.MeshStandardMaterial({ color: 0xf7f5f0, roughness: .8 });
  var ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: 0xf7f5f0, roughness: 1, emissive: 0xf7f5f0, emissiveIntensity: .45 })); ceil.rotation.x = Math.PI / 2; ceil.position.y = H; scene.add(ceil);
  var floorT = woodTexture(THREE, { base: "#c79a6b", dark: "#94683c", light: "#ddb98c", seed: 9, lines: 70, wave: 4 });
  floorT.repeat.set(2.5, 2.5);
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: floorT, roughness: .55 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  // Fugen zwischen den Dielen
  var seams = new THREE.Group();
  for (var i = -12; i <= 12; i++) { var s = new THREE.Mesh(new THREE.PlaneGeometry(.006, D), new THREE.MeshBasicMaterial({ color: 0x8a6038, transparent: true, opacity: .35 })); s.rotation.x = -Math.PI / 2; s.position.set(i * .2, .001, 0); seams.add(s); }
  scene.add(seams);
  function bx(w, h, d, m, x, y, z, cast) { var o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); if (cast !== false) o.castShadow = true; o.receiveShadow = true; scene.add(o); return o; }
  // Sockelleisten
  bx(W, .08, .015, white, 0, .04, -D / 2 + .008, false); bx(.015, .08, D, white, -W / 2 + .008, .04, 0, false); bx(.015, .08, D, white, W / 2 - .008, .04, 0, false);
  // Fenster: Rahmen, Glas mit Himmel, Fensterbank
  var wx = -W / 2 + 1.4, wz = -D / 2;
  [[1.38, .07, 0, 2.25], [1.38, .07, 0, .85], [.07, 1.44, -.65, 1.55], [.07, 1.44, .65, 1.55], [.05, 1.4, 0, 1.55], [1.3, .05, 0, 1.75]].forEach(function (f) { bx(f[0], f[1], .1, white, wx + f[2], f[3], wz); });
  bx(1.5, .04, .26, white, wx, .83, wz + .1);
  var skyC = document.createElement("canvas"); skyC.width = 4; skyC.height = 64; var g = skyC.getContext("2d"), gr = g.createLinearGradient(0, 0, 0, 64);
  gr.addColorStop(0, "#9fd0ea"); gr.addColorStop(.7, "#e6f4fb"); gr.addColorStop(.72, "#a9cf95"); gr.addColorStop(1, "#86b673"); g.fillStyle = gr; g.fillRect(0, 0, 4, 64);
  var skyT = new THREE.CanvasTexture(skyC); skyT.colorSpace = THREE.SRGBColorSpace;
  var glassM = new THREE.MeshBasicMaterial({ map: skyT, color: 0xffffff });
  var glass = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.4), glassM); glass.position.set(wx, 1.55, wz - .06); scene.add(glass);
  // Vorhang
  var curtM = new THREE.MeshStandardMaterial({ color: 0xefe6d6, roughness: 1, side: THREE.DoubleSide });
  var cg = new THREE.PlaneGeometry(.45, 2.15, 24, 1), pos = cg.attributes.position;
  for (i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * 28) * .03);
  cg.computeVertexNormals();
  var curt = new THREE.Mesh(cg, curtM); curt.position.set(wx - .85, 1.3, wz + .1); curt.castShadow = true; scene.add(curt);
  bx(1.9, .025, .025, new THREE.MeshStandardMaterial({ color: 0x4e463f }), wx, 2.4, wz + .1);

  // Sofa
  var fab = new THREE.MeshStandardMaterial({ color: 0xd3ccbf, roughness: 1 }), fab2 = new THREE.MeshStandardMaterial({ color: 0xc6bdae, roughness: 1 });
  var sx = .9, sz = -D / 2 + .55;
  bx(2.3, .42, .9, fab2, sx, .3, sz); bx(2.3, .5, .22, fab, sx, .72, sz - .34);
  bx(.22, .58, .9, fab2, sx - 1.15, .38, sz); bx(.22, .58, .9, fab2, sx + 1.15, .38, sz);
  bx(1.02, .14, .66, fab, sx - .53, .58, sz + .1); bx(1.02, .14, .66, fab, sx + .53, .58, sz + .1);
  var pil = bx(.42, .4, .12, new THREE.MeshStandardMaterial({ color: 0xe2ad49, roughness: 1 }), sx - .7, .8, sz - .14); pil.rotation.set(-.2, .15, .12);
  var pil2 = bx(.4, .38, .12, new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 1 }), sx + .75, .8, sz - .14); pil2.rotation.set(-.2, -.15, -.1);
  var legM = new THREE.MeshStandardMaterial({ color: 0x5e4834 });
  [[-1.1, -.38], [1.1, -.38], [-1.1, .38], [1.1, .38]].forEach(function (l) { bx(.05, .1, .05, legM, sx + l[0], .05, sz + l[1]); });
  // Bild über dem Sofa
  var artC = document.createElement("canvas"); artC.width = 300; artC.height = 200; g = artC.getContext("2d");
  g.fillStyle = "#f3efe6"; g.fillRect(0, 0, 300, 200); g.fillStyle = "#e2a24a"; g.beginPath(); g.arc(95, 80, 38, 0, 7); g.fill();
  g.fillStyle = "#2f4f5c"; g.beginPath(); g.moveTo(0, 200); g.bezierCurveTo(70, 120, 150, 160, 200, 110); g.bezierCurveTo(240, 80, 270, 90, 300, 70); g.lineTo(300, 200); g.fill();
  var artT = new THREE.CanvasTexture(artC); artT.colorSpace = THREE.SRGBColorSpace;
  bx(1.12, .78, .03, new THREE.MeshStandardMaterial({ color: 0x2c2a28 }), sx, 1.62, -D / 2 + .02);
  var pic = new THREE.Mesh(new THREE.PlaneGeometry(1.0, .66), new THREE.MeshStandardMaterial({ map: artT, roughness: .9 })); pic.position.set(sx, 1.62, -D / 2 + .037); scene.add(pic);
  // Stehlampe mit warmem Licht
  var black = new THREE.MeshStandardMaterial({ color: 0x2c2a28, roughness: .5, metalness: .3 });
  var lx = -.55, lz = -D / 2 + .45;
  bx(.3, .02, .3, black, lx, .01, lz); bx(.025, 1.55, .025, black, lx, .78, lz);
  var shadeM = new THREE.MeshStandardMaterial({ color: 0xf3ead7, roughness: .9, emissive: 0xffd28a, emissiveIntensity: 0, side: THREE.DoubleSide });
  var shade = new THREE.Mesh(new THREE.CylinderGeometry(.16, .24, .3, 24, 1, true), shadeM); shade.position.set(lx, 1.6, lz); scene.add(shade);
  var lamp = new THREE.PointLight(0xffc27a, 0, 7, 1.6); lamp.position.set(lx, 1.5, lz); scene.add(lamp);
  // Pflanze
  var pot = new THREE.Mesh(new THREE.CylinderGeometry(.2, .16, .38, 20), new THREE.MeshStandardMaterial({ color: 0xd9cbb5, roughness: .9 }));
  pot.position.set(-W / 2 + .45, .19, -D / 2 + .5); pot.castShadow = true; scene.add(pot);
  var leafM = [new THREE.MeshStandardMaterial({ color: 0x3f7a4a, roughness: .8, side: THREE.DoubleSide }), new THREE.MeshStandardMaterial({ color: 0x5c9c63, roughness: .8, side: THREE.DoubleSide })];
  var leafG = new THREE.SphereGeometry(.1, 10, 8); leafG.scale(1, .12, 2.8); leafG.translate(0, 0, .26);
  for (i = 0; i < 22; i++) {
    var lf = new THREE.Mesh(leafG, leafM[i % 2]), a = i * 2.4, up = .4 + (i % 5) * .22;
    lf.position.set(pot.position.x, .38 + up * .9, pot.position.z); lf.rotation.set(-.9 + (i % 3) * .3, a, 0); lf.castShadow = true; scene.add(lf);
  }
  // Teppich und Sideboard links mit Vase
  var rugC = document.createElement("canvas"); rugC.width = rugC.height = 128; g = rugC.getContext("2d");
  g.fillStyle = "#ece5d8"; g.fillRect(0, 0, 128, 128); g.strokeStyle = "#d6c9b2"; g.lineWidth = 3; g.strokeRect(8, 8, 112, 112); g.strokeRect(16, 16, 96, 96);
  var rugT = new THREE.CanvasTexture(rugC); rugT.colorSpace = THREE.SRGBColorSpace;
  var rug = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.8), new THREE.MeshStandardMaterial({ map: rugT, roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(.8, .004, -.75); rug.receiveShadow = true; scene.add(rug);
  var oak = new THREE.MeshStandardMaterial({ map: woodTexture(THREE, { base: "#b78a5a", dark: "#7d532c", light: "#d2a877", seed: 4 }), roughness: .6 });
  bx(.45, .55, 1.6, oak, -W / 2 + .25, .32, .55); bx(.4, .04, 1.5, black, -W / 2 + .25, .03, .55);
  var vase = new THREE.Mesh(new THREE.CylinderGeometry(.07, .1, .32, 18), new THREE.MeshStandardMaterial({ color: 0x1e5f68, roughness: .35 })); vase.position.set(-W / 2 + .25, .76, .25); vase.castShadow = true; scene.add(vase);
  [0xc46a4a, 0xe8dcc6, 0x2f4f5c].forEach(function (c, k) { bx(.22, .04, .3, new THREE.MeshStandardMaterial({ color: c, roughness: .9 }), -W / 2 + .25, .62 + k * .04, .8); });
  // Couchtisch
  var tbl = new THREE.Mesh(new THREE.CylinderGeometry(.38, .38, .04, 32), oak); tbl.position.set(.9, .42, -.55); tbl.castShadow = true; scene.add(tbl);
  bx(.04, .4, .04, black, .9, .2, -.55);
  var cup = new THREE.Mesh(new THREE.CylinderGeometry(.04, .035, .08, 16), new THREE.MeshStandardMaterial({ color: 0xffffff })); cup.position.set(.8, .48, -.6); scene.add(cup);

  // Licht: Tageslicht durchs Fenster oder Abendstimmung mit Stehlampe
  var hemi = new THREE.HemisphereLight(0xffffff, 0xbfa58a, 1.3); scene.add(hemi);
  var sun = new THREE.DirectionalLight(0xfff1d6, 3.2); sun.position.set(wx + 1.2, 4.2, -D / 2 - 4); sun.target.position.set(wx + .3, 0, .4);
  sun.castShadow = true; sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048); sun.shadow.bias = -.0004;
  var sc = sun.shadow.camera; sc.left = -4; sc.right = 4; sc.top = 4; sc.bottom = -4; sc.near = 1; sc.far = 14;
  scene.add(sun, sun.target);
  var fill = new THREE.DirectionalLight(0xffffff, .5); fill.position.set(2, 2, 4); scene.add(fill);

  var night = 0, nightT = 0, accent = false;
  var ui = host.querySelector(".r3d__ui");
  ui.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    var on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on ? "true" : "false");
    if (b.dataset.k === "light") nightT = on ? 1 : 0;
    else { accent = on; repaint(cur, true); }
  });

  // Farbwechsel
  var cur = new THREE.Color(0x9caf88), plain = new THREE.Color(0xf1eee8), anim = null;
  function repaint(c, quick) {
    walls.forEach(function (m, k) {
      var u = m.userData.u, to = accent && k > 0 ? plain : c;
      u.uOld.value.copy(u.uP.value < 1 ? u.uOld.value.clone().lerp(u.uNew.value, u.uP.value) : u.uNew.value);
      u.uNew.value.copy(to); u.uP.value = 0;
    });
    anim = { t0: performance.now(), dur: reduce ? .01 : quick ? .7 : 1.5 };
  }
  var pressed = document.querySelector('#swatches [aria-pressed="true"]');
  if (pressed) { cur = new THREE.Color(pressed.style.getPropertyValue("--c").trim() || "#9caf88"); repaint(cur, true); anim.dur = .01; }
  svg.addEventListener("tk-paint", function (e) { cur = new THREE.Color(e.detail.c); repaint(cur); });

  var drag = dragRotate(S.canvas, { speed: .005, minYaw: -.55, maxYaw: .5, vertical: false });
  var look = new THREE.Vector3(), hint = host.querySelector(".r3d__hint");
  S.onFrame(function (dt, t) {
    if (anim) {
      var k = cl((performance.now() - anim.t0) / 1000 / anim.dur);
      walls.forEach(function (m, i) { m.userData.u.uP.value = cl(eio(k) * 1.15 - i * .07); });
      if (k >= 1) { walls.forEach(function (m) { m.userData.u.uP.value = 1; }); anim = null; }
    }
    night += (nightT - night) * Math.min(1, dt * 3); if (Math.abs(nightT - night) < .01 || reduce) night = nightT;
    sun.intensity = 3.2 * (1 - night); hemi.intensity = 1.3 - night * 1.05; fill.intensity = .5 - night * .35;
    hemi.color.setRGB(1, 1 - night * .12, 1 - night * .3);
    lamp.intensity = night * 6; shadeM.emissiveIntensity = night * 1.2; ceil.material.emissiveIntensity = .45 - night * .38;
    glassM.color.setRGB(1 - night * .78, 1 - night * .74, 1 - night * .55);
    scene.background.setRGB(.95 - night * .8, .94 - night * .8, .93 - night * .74);
    if (drag.touched) hint.classList.add("off");
    var yaw = drag.yaw + (drag.touched || reduce ? 0 : Math.sin(t * .25) * .12);
    cam.position.set(1.15, 1.45, D / 2 - .25);
    look.set(1.15 + Math.sin(-.42 + yaw) * 3, 1.15, D / 2 - .25 - Math.cos(-.42 + yaw) * 3);
    cam.lookAt(look);
  });
}
