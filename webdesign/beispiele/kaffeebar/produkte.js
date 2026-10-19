// 3D-Produkte der Kaffeebar "röstzeit": Pappbecher, Eiskaffee im Klarbecher, Kaffeesack und Bohnen.
// Alles wird aus Formen und Canvas-Etiketten gebaut, es gibt keine Modelldateien zum Nachladen.
// Die Seite nutzt dieselben Bausteine live (Hero, Bohnen) und für die vorgerenderten Produktbilder.

export const C = { cream: "#ece5d8", paper: "#f3eee5", ink: "#17120e", brown: "#2a1a12", coffee: "#5a3420", milk: "#e9d6bd", matcha: "#8fb35a" };
export const FONTS = ['800 100px "Inter"', '400 100px "Delafield"', '700 30px "SpaceMono"', '400 30px "SpaceMono"'];

export function fontsReady() {
  if (!document.fonts) return Promise.resolve();
  return Promise.all(FONTS.map(function (f) { return document.fonts.load(f); })).catch(function () {});
}

function canvas(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; }
function tex(THREE, c) { var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

// Feines Papierkorn, damit Flächen nicht wie Plastik wirken.
function grain(g, w, h, a, seed) {
  var s = seed || 11; function r() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }
  g.save(); g.globalAlpha = a;
  for (var i = 0; i < w * h / 90; i++) { g.fillStyle = r() < .5 ? "#000" : "#fff"; g.fillRect(r() * w, r() * h, 1.2, 1.2); }
  g.restore();
}

function mark(g, x, y, size, color, align) {
  g.save(); g.fillStyle = color; g.textAlign = align || "center"; g.textBaseline = "alphabetic";
  g.font = '800 ' + size + 'px "Inter"';
  if ("letterSpacing" in g) g.letterSpacing = (-size * .045) + "px";
  g.fillText("röstzeit", x, y);
  var w = g.measureText("röstzeit").width, ex = align === "left" ? x + w : x + w / 2;
  g.font = '700 ' + Math.round(size * .34) + 'px "Inter"'; g.textAlign = "left";
  g.fillText("°", ex + size * .02, y - size * .48);
  g.restore();
}

function mono(g, txt, x, y, size, color, align, spacing) {
  g.save(); g.fillStyle = color; g.textAlign = align || "left"; g.font = '700 ' + size + 'px "SpaceMono"';
  if ("letterSpacing" in g) g.letterSpacing = (spacing == null ? size * .18 : spacing) + "px";
  g.fillText(txt, x, y); g.restore();
}

// Rundum-Etikett des Pappbechers: u läuft einmal um den Becher, v von unten nach oben.
function cupLabel(THREE, o) {
  var W = 2048, H = 1024, a = canvas(W, H), c = a[0], g = a[1];
  g.fillStyle = o.base || C.paper; g.fillRect(0, 0, W, H);
  var gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "rgba(0,0,0,.05)"); gr.addColorStop(.15, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,.04)");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // Vorderseite liegt bei u = 0.75 (zeigt bei Drehung 0 zur Kamera).
  var fx = W * .75;
  mark(g, fx, H * .5, 150, C.ink);
  mono(g, "KAFFEEHAUS", fx + 6, H * .5 + 54, 30, C.ink, "center", 12);
  mono(g, "GUTER KAFFEE", fx - 250, H * .78, 26, C.ink, "left", 3);
  mono(g, "GUTE LAUNE", fx - 250, H * .78 + 34, 26, C.ink, "left", 3);
  mono(g, o.size || "350 ML", fx + 250, H * .78 + 34, 26, C.ink, "right", 3);
  // Rückseite: Kreis-Stempel und kleiner Text.
  var bx = W * .25;
  g.strokeStyle = C.ink; g.lineWidth = 5; g.beginPath(); g.arc(bx, H * .48, 150, 0, Math.PI * 2); g.stroke();
  mono(g, "MOSTVIERTEL", bx, H * .48 - 14, 26, C.ink, "center", 6);
  mono(g, "SEIT 2026", bx, H * .48 + 28, 26, C.ink, "center", 6);
  mono(g, "FRISCH GERÖSTET · JEDEN TAG · RÖSTZEIT.AT", bx, H * .82, 22, C.ink, "center", 4);
  grain(g, W, H, .05, 5);
  return tex(THREE, c);
}

function lathe(THREE, pts, seg) {
  return new THREE.LatheGeometry(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), seg || 96);
}

// Pappbecher. o.lid: schwarzer Deckel; ohne Deckel zeigt o.top eine Oberfläche (Crema, Milchschaum).
export function cup(THREE, o) {
  o = o || {};
  var grp = new THREE.Group(), h = o.h || 1.25, r0 = o.r0 || .34, r1 = o.r1 || .47;
  var label = cupLabel(THREE, o); label.wrapS = THREE.RepeatWrapping;
  var body = new THREE.Mesh(lathe(THREE, [[r0, 0], [r1, h]]), new THREE.MeshStandardMaterial({ map: label, roughness: .62, metalness: 0, side: THREE.DoubleSide }));
  body.rotation.y = Math.PI / 2 + (o.turn || 0);
  grp.add(body);
  var paper = new THREE.MeshStandardMaterial({ color: o.base || C.paper, roughness: .7 });
  var bottom = new THREE.Mesh(new THREE.CircleGeometry(r0, 64), paper); bottom.rotation.x = Math.PI / 2; bottom.position.y = .01; grp.add(bottom);
  var rim = new THREE.Mesh(new THREE.TorusGeometry(r1, .018, 12, 96), paper); rim.rotation.x = Math.PI / 2; rim.position.y = h; grp.add(rim);
  if (o.lid !== false) {
    var black = new THREE.MeshStandardMaterial({ color: "#0d0b0a", roughness: .38, metalness: .05, side: THREE.DoubleSide });
    var lid = new THREE.Mesh(lathe(THREE, [[0, h + .16], [.3, h + .16], [.33, h + .15], [.36, h + .12], [r1 - .02, h + .1], [r1 + .03, h + .085], [r1 + .035, h + .05], [r1 + .03, h - .03], [r1 + .005, h - .035]], 96), black);
    grp.add(lid);
    var hole = new THREE.Mesh(new THREE.CapsuleGeometry(.025, .08, 4, 12), new THREE.MeshStandardMaterial({ color: "#000", roughness: 1 }));
    hole.rotation.z = Math.PI / 2; hole.position.set(0, h + .162, r1 - .14); grp.add(hole);
  } else if (o.top) {
    var surf = new THREE.Mesh(new THREE.CircleGeometry(r1 - .01, 64), new THREE.MeshStandardMaterial({ map: o.top, roughness: .45 }));
    surf.rotation.x = -Math.PI / 2; surf.position.y = h - .06; grp.add(surf);
  }
  grp.userData.h = h + (o.lid !== false ? .16 : 0);
  return grp;
}

// Oberfläche für offene Becher: Crema (Espresso) oder Herz aus Milchschaum (Melange).
export function surface(THREE, kind) {
  var S = 512, a = canvas(S, S), c = a[0], g = a[1], m = S / 2;
  var gr = g.createRadialGradient(m, m, 10, m, m, m);
  if (kind === "crema") { gr.addColorStop(0, "#c98a4b"); gr.addColorStop(.6, "#a8642f"); gr.addColorStop(1, "#5a2f15"); }
  else { gr.addColorStop(0, "#d9b48a"); gr.addColorStop(.8, "#b07a48"); gr.addColorStop(1, "#6b3f1f"); }
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  if (kind !== "crema") {
    g.fillStyle = "#f6ecdc"; g.beginPath();
    g.moveTo(m, m + 150);
    g.bezierCurveTo(m - 210, m + 10, m - 150, m - 160, m - 20, m - 70);
    g.quadraticCurveTo(m, m - 55, m + 20, m - 70);
    g.bezierCurveTo(m + 150, m - 160, m + 210, m + 10, m, m + 150); g.fill();
    g.strokeStyle = "#c08d5c"; g.lineWidth = 6; g.beginPath(); g.moveTo(m, m - 60); g.lineTo(m, m + 150); g.stroke();
  } else {
    var s = 3; for (var i = 0; i < 260; i++) { s = (s * 16807) % 2147483647; var x = (s % S); s = (s * 16807) % 2147483647; var y = (s % S);
      g.fillStyle = "rgba(255,225,180," + (.08 + (s % 10) / 80) + ")"; g.beginPath(); g.arc(x, y, 2 + s % 7, 0, 7); g.fill(); }
  }
  return tex(THREE, c);
}

// Gefüllter Klarbecher mit Eis und Strohhalm. Die Füllung ist ein Verlauf mit Schlieren (Milch auf Kaffee oder Matcha).
export function iced(THREE, o) {
  o = o || {};
  var grp = new THREE.Group(), h = 1.35, r0 = .33, r1 = .48;
  var W = 512, H = 1024, a = canvas(W, H), c = a[0], g = a[1];
  var top = o.matcha ? "#d4e3b0" : "#efe0c8", mid = o.matcha ? "#9fc067" : "#b9875a", low = o.matcha ? "#6f9a3c" : "#4a2614";
  var gr = g.createLinearGradient(0, H, 0, 0);
  gr.addColorStop(0, low); gr.addColorStop(.35, low); gr.addColorStop(.6, mid); gr.addColorStop(.86, top); gr.addColorStop(1, top);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // Schlieren: weiche helle Bänder, die schräg nach unten laufen.
  for (var i = 0; i < 9; i++) {
    g.save(); g.globalAlpha = .28; g.strokeStyle = top; g.lineWidth = 18 + i * 4; g.filter = "blur(10px)";
    g.beginPath(); var x0 = (i / 9) * W; g.moveTo(x0, H * .2);
    g.bezierCurveTo(x0 + 80, H * .4, x0 - 90, H * .55, x0 + 30, H * (.62 + (i % 3) * .06)); g.stroke(); g.restore();
  }
  var fill = tex(THREE, c); fill.wrapS = THREE.RepeatWrapping;
  var liquid = new THREE.Mesh(lathe(THREE, [[r0 - .03, .03], [r1 - .05, h - .3]], 72), new THREE.MeshStandardMaterial({ map: fill, roughness: .3 }));
  grp.add(liquid);
  var cap = new THREE.Mesh(new THREE.CircleGeometry(r1 - .05, 48), new THREE.MeshStandardMaterial({ color: top, roughness: .35 })); cap.rotation.x = -Math.PI / 2; cap.position.y = h - .3; grp.add(cap);
  // Eiswürfel: abgerundete, leicht durchscheinende Würfel im oberen Drittel.
  var iceM = new THREE.MeshPhysicalMaterial({ color: "#f4f8fb", roughness: .2, transmission: .35, thickness: .3, ior: 1.31, transparent: true, opacity: .92, clearcoat: 1 });
  var cube = new THREE.BoxGeometry(.2, .2, .2, 2, 2, 2);
  var pos = cube.attributes.position, v = new THREE.Vector3();
  for (var k = 0; k < pos.count; k++) { v.fromBufferAttribute(pos, k); v.normalize().multiplyScalar(.16).lerp(new THREE.Vector3().fromBufferAttribute(pos, k), .55); pos.setXYZ(k, v.x, v.y, v.z); }
  cube.computeVertexNormals();
  [[.13, h - .26, .14, .3], [-.17, h - .22, .06, 1.1], [.03, h - .2, -.16, 2], [-.06, h - .32, .2, .7], [.2, h - .36, -.08, 1.6]].forEach(function (p) {
    var m = new THREE.Mesh(cube, iceM); m.position.set(p[0], p[1], p[2]); m.rotation.set(p[3], p[3] * 1.7, p[3] * .6); grp.add(m);
  });
  var straw = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, h + .7, 20), new THREE.MeshStandardMaterial({ color: "#111", roughness: .35 }));
  straw.position.set(.1, h * .55 + .35, -.05); straw.rotation.z = -.2; grp.add(straw);
  var glass = new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: .04, metalness: 0, transmission: 1, thickness: .05, ior: 1.45, transparent: true, opacity: .35, side: THREE.DoubleSide, specularIntensity: 1 });
  var shell = new THREE.Mesh(lathe(THREE, [[r0, 0], [r1, h], [r1 + .02, h + .02]], 96), glass); grp.add(shell);
  // Aufdruck am Klarbecher: Wortmarke in Weiß, wie bei Takeaway-Bechern.
  var la = canvas(2048, 512), lc = la[0], lg = la[1];
  mark(lg, 2048 * .75, 300, 150, "rgba(255,255,255,.95)");
  mono(lg, o.matcha ? "MATCHA LATTE" : "EISKAFFEE", 2048 * .75 + 6, 370, 30, "rgba(255,255,255,.95)", "center", 10);
  var lt = tex(THREE, lc); lt.wrapS = THREE.RepeatWrapping;
  var print = new THREE.Mesh(lathe(THREE, [[r0 + (r1 - r0) * .38 + .004, h * .38], [r0 + (r1 - r0) * .7 + .004, h * .7]], 96), new THREE.MeshStandardMaterial({ map: lt, transparent: true, roughness: .4, depthWrite: false }));
  print.rotation.y = Math.PI / 2; grp.add(print);
  grp.userData.h = h;
  return grp;
}

// Vorderseite des Kaffeesacks: Wortmarke, Schreibschrift, kleine Angaben in Spalten.
function bagFront(THREE, o) {
  var W = 1024, H = 1536, a = canvas(W, H), c = a[0], g = a[1];
  g.fillStyle = C.cream; g.fillRect(0, 0, W, H);
  var sh = g.createLinearGradient(0, 0, W, 0); sh.addColorStop(0, "rgba(0,0,0,.10)"); sh.addColorStop(.25, "rgba(0,0,0,0)"); sh.addColorStop(.8, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,0,0,.12)");
  g.fillStyle = sh; g.fillRect(0, 0, W, H);
  mark(g, W / 2, H * .36, 190, C.ink);
  mono(g, "KAFFEEHAUS", W / 2 + 6, H * .36 + 62, 34, C.ink, "center", 12);
  g.save(); g.fillStyle = C.ink; g.textAlign = "center"; g.font = '400 250px "Delafield"'; g.translate(W / 2, H * .58); g.rotate(-.12);
  g.fillText(o.script || "langsam", 0, 0); g.fillText(o.script2 || "geröstet", 40, 170); g.restore();
  var y = H * .82;
  mono(g, "IN KLEINEN CHARGEN", 90, y, 24, C.ink, "left", 2);
  mono(g, "GERÖSTET, MILD,", 90, y + 34, 24, C.ink, "left", 2);
  mono(g, "SCHOKOLADIG.", 90, y + 68, 24, C.ink, "left", 2);
  mono(g, "NOTEN", 640, y, 24, C.ink, "left", 2);
  mono(g, "KARAMELL", 640, y + 34, 24, C.ink, "left", 2);
  mono(g, "NUSS · KAKAO", 640, y + 68, 24, C.ink, "left", 2);
  g.fillStyle = C.ink; g.fillRect(90, H * .93, W - 180, 3);
  mono(g, "GANZE BOHNE", 90, H * .965, 24, C.ink, "left", 2);
  mono(g, "250 G", W - 90, H * .965, 24, C.ink, "right", 2);
  grain(g, W, H, .06, 9);
  return tex(THREE, c);
}

// Standbodenbeutel: Quader mit gewölbter Vorder- und Rückseite, oben flach verschweißt und umgeschlagen.
export function bag(THREE, o) {
  o = o || {};
  var w = 1.05, h = 1.6, d = .46, geo = new THREE.BoxGeometry(w, h, d, 24, 40, 12);
  var p = geo.attributes.position, v = new THREE.Vector3();
  for (var i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    var ty = (v.y + h / 2) / h, tx = v.x / (w / 2);
    var squeeze = ty > .78 ? 1 - Math.pow((ty - .78) / .22, 1.6) : 1;
    var bulge = (1 - tx * tx * .55) * squeeze;
    v.z = v.z * Math.max(.04, bulge);
    v.x *= 1 + (1 - ty) * .03;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  var front = new THREE.MeshStandardMaterial({ map: bagFront(THREE, o), roughness: .85 });
  var plain = new THREE.MeshStandardMaterial({ color: C.cream, roughness: .88 });
  var m = new THREE.Mesh(geo, [plain, plain, plain, plain, front, plain]);
  m.position.y = h / 2;
  var grp = new THREE.Group(); grp.add(m);
  var seam = new THREE.Mesh(new THREE.BoxGeometry(w + .01, .07, .05), new THREE.MeshStandardMaterial({ color: "#ddd4c4", roughness: .9 })); seam.position.y = h - .02; grp.add(seam);
  grp.userData.h = h;
  return grp;
}

// Kaffeebohne: abgeflachtes Ellipsoid mit Kerbe auf der flachen Seite.
export function beanGeometry(THREE) {
  var g = new THREE.SphereGeometry(.5, 28, 20), p = g.attributes.position, v = new THREE.Vector3();
  for (var i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    v.x *= .72; v.y *= 1; v.z *= .5;
    if (v.z > .1) v.z = .1 + (v.z - .1) * .35;
    var groove = Math.exp(-Math.pow((v.x - Math.sin(v.y * 3) * .05) / .045, 2)) * (v.z > 0 ? .09 : 0);
    v.z -= groove;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

export function beanMaterial(THREE) {
  return new THREE.MeshStandardMaterial({ color: "#4a2a17", roughness: .42, metalness: .05 });
}
