// Proibito · Pizza nach Wunsch in 3D: Teig auf der Holzschaufel, jede Zutat fällt sichtbar darauf und federt kurz nach.
// "In den Ofen" spielt eine kurze Szene (Ofen, Glut, Käse schmilzt, Rand bräunt), danach Karton zu und ab in den Warenkorb.
// Alles aus Grundformen und Canvas-Texturen, keine Modelldateien. Bedienung, Preis und Warenkorb liegen in app.js;
// ohne WebGL oder bei "weniger Bewegung" bleibt dort die 2D-Fassung (Liste mit Häkchen und Standbild).
import { reduce, mobile, webglOk, whenNear, loadThree, woodTexture, blobTexture, rng, dragRotate } from "/beispiele/_shared/stage3d.js?v=2";

var root = document.getElementById("wunsch"), host = document.getElementById("wzStage");
// ?standbild: fertig gebackene Pizza auf transparentem Grund, daraus entstehen die Bilder der 2D-Fassung.
var SNAP = /[?&]standbild/.test(location.search), NAH = /[?&]standbild=nah/.test(location.search);
if (root && host && window.Proibito && (SNAP ? webglOk(true) : !reduce && webglOk())) {
  whenNear(host, function () { loadThree().then(start).catch(function () {}); }, "500px");
}

var PI = Math.PI;
function cl(v, a, b) { return v < a ? a : v > b ? b : v; }
function seg(t, a, b) { return cl((t - a) / (b - a), 0, 1); }
function out3(t) { return 1 - Math.pow(1 - t, 3); }
function inOut(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function in2(t) { return t * t; }
function smooth(t) { return t * t * (3 - 2 * t); }
function outBack(t) { var c = 1.3; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
function canvas(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; }
function blob(g, x, y, r, inner, outer) {
  var gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, inner); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, PI * 2); g.fill();
}

function start(THREE) {
  function tex(c, srgb) { var t = new THREE.CanvasTexture(c); if (srgb !== false) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
  var R = rng(29);

  /* ---------- Texturen ---------- */
  function doughTex() {
    var a = canvas(1024, 128), c = a[0], g = a[1], r = rng(3);
    g.fillStyle = "#fff"; g.fillRect(0, 0, 1024, 128);
    for (var i = 0; i < 260; i++) blob(g, r() * 1024, r() * 128, 6 + r() * 26, "rgba(170,120,70,.10)", "rgba(170,120,70,0)");
    for (var k = 0; k < 1800; k++) { g.fillStyle = "rgba(255,255,255," + (.3 + r() * .5) + ")"; g.fillRect(r() * 1024, r() * 128, 1.5, 1.5); }
    var t = tex(c); t.wrapS = THREE.RepeatWrapping; return t;
  }
  // Leopardenflecken und Bräune für den gebackenen Rand (liegt als zweite, durchsichtige Haut darüber)
  function spotTex() {
    var a = canvas(1024, 128), c = a[0], g = a[1], r = rng(8);
    var band = g.createLinearGradient(0, 0, 0, 128);
    band.addColorStop(0, "rgba(150,82,28,0)"); band.addColorStop(.32, "rgba(160,88,30,.55)"); band.addColorStop(.55, "rgba(140,74,24,.6)"); band.addColorStop(.85, "rgba(150,82,28,.15)"); band.addColorStop(1, "rgba(150,82,28,0)");
    g.fillStyle = band; g.fillRect(0, 0, 1024, 128);
    for (var i = 0; i < 120; i++) {
      var x = r() * 1024, y = 34 + r() * 52, s = 2 + r() * 7;
      blob(g, x, y, s * 2.2, "rgba(70,32,10,.55)", "rgba(70,32,10,0)");
      blob(g, x, y, s, "rgba(28,14,6,.92)", "rgba(28,14,6,0)");
    }
    var t = tex(c); t.wrapS = THREE.RepeatWrapping; return t;
  }
  function sauceTex(bianca) {
    var S = 512, a = canvas(S, S), c = a[0], g = a[1], r = rng(bianca ? 12 : 5), m = S / 2;
    g.fillStyle = bianca ? "#efe5cd" : "#a8291b"; g.fillRect(0, 0, S, S);
    for (var i = 0; i < 90; i++) {
      var x = r() * S, y = r() * S, s = 10 + r() * 46;
      if (bianca) blob(g, x, y, s, r() < .5 ? "rgba(255,250,236,.55)" : "rgba(214,196,156,.35)", "rgba(230,215,180,0)");
      else blob(g, x, y, s, r() < .5 ? "rgba(120,20,12,.55)" : "rgba(205,66,38,.5)", "rgba(160,40,25,0)");
    }
    for (var k = 0; k < (bianca ? 260 : 120); k++) {
      g.fillStyle = bianca ? (r() < .6 ? "rgba(60,90,40,.7)" : "rgba(40,30,25,.6)") : (r() < .7 ? "rgba(60,70,30,.55)" : "rgba(240,120,80,.5)");
      g.fillRect(r() * S, r() * S, 1.5 + r() * 2.5, 1.5 + r() * 2);
    }
    var edge = g.createRadialGradient(m, m, m * .7, m, m, m);
    edge.addColorStop(0, "rgba(0,0,0,0)"); edge.addColorStop(1, bianca ? "rgba(150,120,70,.25)" : "rgba(70,10,5,.45)");
    g.fillStyle = edge; g.fillRect(0, 0, S, S);
    return tex(c);
  }
  function salamiTex() {
    var S = 256, a = canvas(S, S), c = a[0], g = a[1], r = rng(21), m = S / 2;
    blob(g, m, m, m, "#b53b30", "#8a231c");
    for (var i = 0; i < 46; i++) {
      var an = r() * PI * 2, d = Math.sqrt(r()) * (m - 22);
      g.fillStyle = "rgba(246,214,200," + (.7 + r() * .3) + ")"; g.beginPath(); g.ellipse(m + Math.cos(an) * d, m + Math.sin(an) * d, 3 + r() * 6, 2.5 + r() * 4, r() * 3, 0, PI * 2); g.fill();
    }
    for (var k = 0; k < 40; k++) { g.fillStyle = "rgba(30,10,8,.7)"; g.fillRect(m + (r() - .5) * 190, m + (r() - .5) * 190, 2, 2); }
    g.strokeStyle = "#5c1511"; g.lineWidth = 12; g.beginPath(); g.arc(m, m, m - 6, 0, PI * 2); g.stroke();
    return tex(c);
  }
  function tomatoTex() {
    var S = 256, a = canvas(S, S), c = a[0], g = a[1], m = S / 2;
    g.fillStyle = "#c0281b"; g.beginPath(); g.arc(m, m, m, 0, PI * 2); g.fill();
    blob(g, m, m, m - 14, "#f07055", "#d8402c");
    for (var i = 0; i < 3; i++) {
      var an = i * PI * 2 / 3 + .4, x = m + Math.cos(an) * 52, y = m + Math.sin(an) * 52;
      g.fillStyle = "rgba(250,150,100,.85)"; g.beginPath(); g.ellipse(x, y, 34, 24, an, 0, PI * 2); g.fill();
      g.fillStyle = "#f3dc8e"; for (var k = 0; k < 6; k++) { g.beginPath(); g.ellipse(x + Math.cos(an + k) * 12, y + Math.sin(an + k) * 9, 5, 3, an + k, 0, PI * 2); g.fill(); }
    }
    blob(g, m, m, 22, "#f6a98a", "rgba(240,120,90,0)");
    return tex(c);
  }
  function crudoTex() {
    var a = canvas(256, 96), c = a[0], g = a[1], r = rng(17);
    g.fillStyle = "#d77a7c"; g.fillRect(0, 0, 256, 96);
    for (var i = 0; i < 26; i++) { g.strokeStyle = "rgba(250,220,215," + (.15 + r() * .25) + ")"; g.lineWidth = 1 + r() * 3; g.beginPath(); var y = r() * 96; g.moveTo(0, y); g.bezierCurveTo(80, y + (r() - .5) * 30, 170, y + (r() - .5) * 30, 256, y + (r() - .5) * 20); g.stroke(); }
    var f = g.createLinearGradient(0, 0, 0, 26); f.addColorStop(0, "#f6e2da"); f.addColorStop(1, "rgba(246,226,218,0)");
    g.fillStyle = f; g.fillRect(0, 0, 256, 26);
    return tex(c);
  }
  function meltTex(pieces, big) {
    var S = 512, a = canvas(S, S), c = a[0], g = a[1], r = rng(big ? 41 : 43), K = S / 1.84;
    pieces.forEach(function (p) {
      var x = S / 2 + p.x * K, y = S / 2 + p.z * K, s = (big ? 62 : 44) * p.s;
      for (var i = 0; i < 4; i++) blob(g, x + (r() - .5) * s * .6, y + (r() - .5) * s * .6, s * (.75 + r() * .4), "rgba(250,236,196,.97)", "rgba(246,226,176,0)");
    });
    var img = g.getImageData(0, 0, S, S), d = img.data;
    for (var k = 3; k < d.length; k += 4) d[k] = d[k] > 40 ? Math.min(255, d[k] * 1.6) : d[k] * .4;
    g.putImageData(img, 0, 0);
    g.globalCompositeOperation = "source-atop";
    for (var j = 0; j < 140; j++) blob(g, r() * S, r() * S, 2 + r() * 7, "rgba(176,108,44,.75)", "rgba(176,108,44,0)");
    for (var q = 0; q < 70; q++) blob(g, r() * S, r() * S, 3 + r() * 6, "rgba(255,252,236,.7)", "rgba(255,252,236,0)");
    return tex(c);
  }
  function flameTex() {
    var a = canvas(128, 256), c = a[0], g = a[1];
    g.filter = "blur(7px)";
    var gr = g.createRadialGradient(64, 200, 4, 64, 170, 150);
    gr.addColorStop(0, "rgba(255,250,215,1)"); gr.addColorStop(.22, "rgba(255,206,96,.95)"); gr.addColorStop(.5, "rgba(255,112,30,.65)"); gr.addColorStop(1, "rgba(150,26,0,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(64, 248); g.bezierCurveTo(-6, 230, 10, 120, 64, 14); g.bezierCurveTo(118, 120, 134, 230, 64, 248); g.fill();
    return tex(c);
  }
  function glowTex(rgb) {
    var a = canvas(128, 128), c = a[0], g = a[1];
    blob(g, 64, 64, 64, "rgba(" + rgb + ",1)", "rgba(" + rgb + ",0)");
    return tex(c);
  }
  function flourTex() {
    var a = canvas(512, 512), c = a[0], g = a[1], r = rng(31);
    for (var i = 0; i < 70; i++) blob(g, 256 + (r() - .5) * 460, 256 + (r() - .5) * 460, 20 + r() * 60, "rgba(255,250,240,.16)", "rgba(255,250,240,0)");
    for (var k = 0; k < 2600; k++) { var an = r() * PI * 2, d = Math.sqrt(r()) * 250; g.fillStyle = "rgba(255,252,245," + (.25 + r() * .55) + ")"; g.fillRect(256 + Math.cos(an) * d, 256 + Math.sin(an) * d, 1.6, 1.6); }
    return tex(c);
  }
  // Ofenfront: dunkler Putz, gemauerter Bogen, goldene Linie, kleines Schild
  var WALL = { x0: -4.2, x1: 4.2, y0: -1.4, y1: 3.8, r: 1.5, cy: .45 };
  function wallTex() {
    var W = 1024, H = Math.round(W * (WALL.y1 - WALL.y0) / (WALL.x1 - WALL.x0)), a = canvas(W, H), c = a[0], g = a[1], r = rng(53);
    var sx = W / (WALL.x1 - WALL.x0);
    function P(x, y) { return [(x - WALL.x0) * sx, (WALL.y1 - y) * sx]; }
    g.fillStyle = "#1a1512"; g.fillRect(0, 0, W, H);
    for (var i = 0; i < 300; i++) blob(g, r() * W, r() * H, 8 + r() * 40, r() < .5 ? "rgba(255,240,220,.025)" : "rgba(0,0,0,.08)", "rgba(0,0,0,0)");
    var o = P(0, WALL.cy), r0 = WALL.r * sx, r1 = (WALL.r + .42) * sx, n = 17;
    for (var k = 0; k < n; k++) {
      var a0 = PI - k * PI / n, a1 = PI - (k + 1) * PI / n, gap = .012;
      g.fillStyle = ["#6a3424", "#5b2c1f", "#74402c", "#633021"][k % 4];
      g.beginPath(); g.arc(o[0], o[1], r1, -a0 + gap, -a1 - gap); g.arc(o[0], o[1], r0, -a1 - gap, -a0 + gap, true); g.closePath(); g.fill();
    }
    for (var j = 0; j < 3; j++) {
      [-1, 1].forEach(function (s) {
        var p = P(s * (WALL.r + .21), WALL.cy - .16 - j * .17);
        g.fillStyle = ["#5b2c1f", "#6a3424", "#633021"][j]; g.fillRect(p[0] - .2 * sx, p[1] - .07 * sx, .4 * sx, .14 * sx);
      });
    }
    g.strokeStyle = "#c9a45c"; g.lineWidth = 2.5; g.beginPath(); g.arc(o[0], o[1], r1 + 8, PI, 0); g.stroke();
    g.lineWidth = 1; g.beginPath(); g.arc(o[0], o[1], r1 + 15, PI, 0); g.stroke();
    var pl = P(0, WALL.cy + WALL.r + .78);
    g.fillStyle = "#c9a45c"; g.save(); g.translate(pl[0], pl[1]); g.rotate(PI / 4); g.fillRect(-6, -6, 12, 12); g.restore();
    g.font = '400 30px "Poiret One", sans-serif'; g.textAlign = "center"; g.textBaseline = "middle";
    if ("letterSpacing" in g) g.letterSpacing = "9px";
    g.fillText("FORNO A LEGNA", pl[0] - 130, pl[1] + 2); g.fillText("485 °C", pl[0] + 120, pl[1] + 2);
    return tex(c);
  }
  function sootTex() {
    var a = canvas(256, 256), c = a[0], g = a[1], r = rng(61);
    g.fillStyle = "#3b2a20"; g.fillRect(0, 0, 256, 256);
    for (var y = 0; y < 256; y += 32) for (var x = (y / 32) % 2 ? -24 : 0; x < 256; x += 48) {
      g.fillStyle = "rgba(" + (60 + r() * 30 | 0) + "," + (40 + r() * 16 | 0) + "," + (28 + r() * 10 | 0) + ",1)"; g.fillRect(x + 2, y + 2, 44, 28);
    }
    for (var i = 0; i < 80; i++) blob(g, r() * 256, r() * 256, 10 + r() * 40, "rgba(0,0,0,.35)", "rgba(0,0,0,0)");
    var t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); return t;
  }
  // Kartondeckel: schwarz mit Gold, Art-déco-Rahmen, Fächer, Wortmarke
  function lidTex() {
    var S = 1024, a = canvas(S, S), c = a[0], g = a[1], r = rng(71);
    g.fillStyle = "#141110"; g.fillRect(0, 0, S, S);
    for (var i = 0; i < 4000; i++) { g.fillStyle = r() < .5 ? "rgba(255,255,255,.025)" : "rgba(0,0,0,.2)"; g.fillRect(r() * S, r() * S, 2, 2); }
    var gold = g.createLinearGradient(0, 0, S, S); gold.addColorStop(0, "#f3dfa6"); gold.addColorStop(.45, "#d2ab62"); gold.addColorStop(1, "#ecd194");
    g.strokeStyle = gold; g.fillStyle = gold;
    g.lineWidth = 5; g.strokeRect(52, 52, S - 104, S - 104); g.lineWidth = 2; g.strokeRect(72, 72, S - 144, S - 144);
    [[52, 52], [S - 52, 52], [52, S - 52], [S - 52, S - 52]].forEach(function (p) { g.save(); g.translate(p[0], p[1]); g.rotate(PI / 4); g.fillRect(-13, -13, 26, 26); g.restore(); });
    g.save(); g.translate(S / 2, 430); g.lineWidth = 2.5;
    for (var k = 0; k <= 12; k++) { var an = PI + k * PI / 12; g.beginPath(); g.moveTo(Math.cos(an) * 60, Math.sin(an) * 60); g.lineTo(Math.cos(an) * 150, Math.sin(an) * 150); g.stroke(); }
    g.beginPath(); g.arc(0, 0, 52, PI, 0); g.stroke(); g.beginPath(); g.arc(0, 0, 160, PI, 0); g.stroke();
    g.restore();
    g.textAlign = "center"; g.textBaseline = "alphabetic";
    g.font = '400 132px "Limelight", "Bodoni Moda", serif'; if ("letterSpacing" in g) g.letterSpacing = "10px";
    g.fillText("PROIBITO", S / 2 + 5, 590);
    g.font = '400 38px "Poiret One", sans-serif'; if ("letterSpacing" in g) g.letterSpacing = "14px";
    g.fillText("PIZZERIA · SEIT 1929", S / 2 + 7, 670);
    g.fillRect(S / 2 - 180, 720, 360, 2);
    g.font = '400 30px "Poiret One", sans-serif'; g.fillText("HEISS & DISKRET GELIEFERT", S / 2 + 7, 790);
    return tex(c);
  }

  /* ---------- Bühne ---------- */
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: SNAP });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
  var cv = renderer.domElement; cv.className = "s3d"; cv.setAttribute("aria-hidden", "true");
  host.insertBefore(cv, host.firstChild);
  var scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, .05, 60);

  var hemi = new THREE.HemisphereLight("#ffe8c8", "#1c1008", .85); scene.add(hemi);
  var key = new THREE.DirectionalLight("#fff0da", 2.5); key.position.set(-2.6, 4.2, 2.4); scene.add(key);
  var back = new THREE.DirectionalLight("#ffb46e", 1.25); back.position.set(3, 2.4, -3.2); scene.add(back);
  var fire = new THREE.PointLight("#ff7b2e", 0, 0, 1.15); fire.position.set(-1.0, .9, -3.7); scene.add(fire);
  var glow = new THREE.PointLight("#ff9a4a", 0, 0, 1.3); glow.position.set(0, .45, -.6); scene.add(glow);

  // Holzschaufel mit Stiel, Mehl und weichem Schatten
  var tray = new THREE.Group(); scene.add(tray);
  var peel = new THREE.Group(); tray.add(peel); peel.rotation.y = .5;
  (function () {
    var sh = new THREE.Shape(), d = Math.asin(.17 / 1.28);
    sh.moveTo(.17, -2.75); sh.lineTo(.17, -1.26); sh.absarc(0, 0, 1.28, -PI / 2 + d, PI * 1.5 - d, false); sh.lineTo(-.17, -2.75); sh.absarc(0, -2.75, .17, PI, PI * 2, false);
    var geo = new THREE.ExtrudeGeometry(sh, { depth: .045, bevelEnabled: true, bevelThickness: .014, bevelSize: .022, bevelSegments: 3, curveSegments: 56 });
    geo.rotateX(-PI / 2); geo.translate(0, -.06, 0);
    var wt = woodTexture(THREE, { base: "#a06c42", dark: "#5c3a1f", light: "#c99868", seed: 4, lines: 60 });
    wt.repeat.set(.38, .38); wt.rotation = PI / 2;
    var m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: wt, roughness: .72 }));
    peel.add(m);
    var fl = new THREE.Mesh(new THREE.CircleGeometry(1.24, 64), new THREE.MeshBasicMaterial({ map: flourTex(), transparent: true, depthWrite: false, opacity: .85 }));
    fl.rotation.x = -PI / 2; fl.position.y = .002; peel.add(fl);
    var shd = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 7.2), new THREE.MeshBasicMaterial({ map: blobTexture(THREE, .5), transparent: true, depthWrite: false }));
    shd.rotation.x = -PI / 2; shd.position.set(0, -.08, -.55); peel.add(shd);
  })();

  // Pizza: Teig (Mitte und Rand), Sauce, Käse, Beläge. Alles in pz, damit Drehen und Backen zusammenbleiben.
  var pz = new THREE.Group(); scene.add(pz);
  var under = new THREE.Mesh(new THREE.CircleGeometry(1.14, 48), new THREE.MeshBasicMaterial({ map: glowTex("0,0,0"), transparent: true, opacity: .45, depthWrite: false }));
  under.rotation.x = -PI / 2; under.position.y = .004; pz.add(under);
  var RAW = new THREE.Color("#efdcb8"), BAKED = new THREE.Color("#d79a50"), CTR_B = new THREE.Color("#e2b878");
  var dTex = doughTex();
  var rimMat = new THREE.MeshStandardMaterial({ map: dTex, color: RAW.clone(), roughness: .86, emissive: "#ff5a12", emissiveIntensity: 0 });
  var rimGeo = (function () {
    var pts = [[.8, .04], [.87, .062], [.93, .098], [.975, .118], [1.012, .112], [1.04, .088], [1.052, .058], [1.044, .028], [1.01, .01], [.8, .006]];
    var geo = new THREE.LatheGeometry(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), 120);
    var p = geo.attributes.position, v = new THREE.Vector3();
    for (var i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      var th = Math.atan2(v.z, v.x), n = .022 * Math.sin(3 * th + 1) + .013 * Math.sin(7 * th + 2) + .006 * Math.sin(17 * th);
      v.x *= 1 + n; v.z *= 1 + n;
      if (v.y > .05) v.y += (.012 * Math.sin(5 * th + .5) + .008 * Math.sin(11 * th + 1.3)) * (v.y - .05) / .07;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals(); return geo;
  })();
  var rim = new THREE.Mesh(rimGeo, rimMat); pz.add(rim);
  var spotMat = new THREE.MeshStandardMaterial({ map: spotTex(), transparent: true, opacity: 0, roughness: .9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  var spots = new THREE.Mesh(rimGeo, spotMat); pz.add(spots);
  var ctrMat = new THREE.MeshStandardMaterial({ color: RAW.clone(), roughness: .9 });
  var ctr = new THREE.Mesh(new THREE.CircleGeometry(.9, 64), ctrMat); ctr.rotation.x = -PI / 2; ctr.position.y = .042; pz.add(ctr);

  // Sauce: unregelmäßiger Kreis, wird beim Auftragen spiralförmig ausgestrichen
  var SAUCE = { pomodoro: sauceTex(false), bianca: sauceTex(true) };
  var sauceGeo = (function () {
    var sh = new THREE.Shape();
    for (var i = 0; i <= 72; i++) { var a = i / 72 * PI * 2, r = .85 + .018 * Math.sin(5 * a + 1) + .012 * Math.sin(9 * a + 2) + .006 * Math.sin(23 * a); if (i) sh.lineTo(Math.cos(a) * r, Math.sin(a) * r); else sh.moveTo(r, 0); }
    var g = new THREE.ShapeGeometry(sh, 2); g.rotateX(-PI / 2); return g;
  })();
  Object.keys(SAUCE).forEach(function (k) { SAUCE[k].repeat.set(1 / 1.8, 1 / 1.8); SAUCE[k].offset.set(.5, .5); });
  var sauceMat = new THREE.MeshStandardMaterial({ map: SAUCE.pomodoro, roughness: .5, polygonOffset: true, polygonOffsetFactor: -1 });
  var sauce = new THREE.Mesh(sauceGeo, sauceMat); sauce.position.y = .05; sauce.scale.setScalar(.001); pz.add(sauce);
  var sauceAnim = null;

  /* ---------- Zutaten ---------- */
  function noisy(geo, amt, seed) {
    var p = geo.attributes.position, v = new THREE.Vector3(), r = rng(seed);
    var ph = [r() * 6, r() * 6, r() * 6];
    for (var i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); var f = 1 + amt * (Math.sin(v.x * 31 + ph[0]) + Math.sin(v.z * 27 + ph[1]) + Math.sin(v.y * 40 + ph[2]) + .6 * Math.sin((v.x + v.z) * 70 + ph[0])) / 3.6; v.multiplyScalar(f); p.setXYZ(i, v.x, v.y, v.z); }
    geo.computeVertexNormals(); return geo;
  }
  function flat(shape, depth, bevel) {
    var g = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: !!bevel, bevelThickness: bevel || 0, bevelSize: bevel || 0, bevelSegments: 2, curveSegments: 14 });
    g.rotateX(-PI / 2); g.computeVertexNormals(); return g;
  }
  function bent(geo, k) {
    var p = geo.attributes.position;
    for (var i = 0; i < p.count; i++) { var x = p.getX(i), z = p.getZ(i); p.setY(i, p.getY(i) + k * (x * x + z * z * .4)); }
    geo.computeVertexNormals(); return geo;
  }
  function leaf(len, wid, lobes) {
    var sh = new THREE.Shape(), n = lobes ? 9 : 1;
    sh.moveTo(0, -len / 2);
    if (!lobes) { sh.bezierCurveTo(wid, -len * .3, wid * .9, len * .3, 0, len / 2); sh.bezierCurveTo(-wid * .9, len * .3, -wid, -len * .3, 0, -len / 2); }
    else {
      for (var s = 1; s >= -1; s -= 2) for (var i = 1; i <= n; i++) {
        var t = s > 0 ? i / n : 1 - i / n, y = -len / 2 + t * len, w = wid * Math.sin(t * PI) * (i % 2 ? 1 : .45);
        sh.lineTo(s * w, y);
      }
    }
    var g = new THREE.ShapeGeometry(sh, 6); g.rotateX(-PI / 2); return g;
  }
  var mushroom = (function () {
    var sh = new THREE.Shape();
    sh.moveTo(-.035, -.07); sh.lineTo(-.03, -.005); sh.bezierCurveTo(-.11, -.01, -.13, .055, -.07, .075); sh.bezierCurveTo(-.03, .09, .03, .09, .07, .075);
    sh.bezierCurveTo(.13, .055, .11, -.01, .03, -.005); sh.lineTo(.035, -.07); sh.closePath();
    return flat(sh, .014, .004);
  })();
  var ham = (function () {
    var sh = new THREE.Shape();
    sh.moveTo(-.11, -.06); sh.quadraticCurveTo(-.02, -.09, .1, -.065); sh.quadraticCurveTo(.13, 0, .1, .07); sh.quadraticCurveTo(0, .09, -.1, .07); sh.quadraticCurveTo(-.14, 0, -.11, -.06);
    return flat(sh, .01, .004);
  })();
  var crudoGeo = (function () {
    var g = new THREE.PlaneGeometry(.24, .15, 18, 8), p = g.attributes.position;
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i), y = p.getY(i), e = Math.abs(y) / .075;
      p.setZ(i, .011 * Math.sin(x * 22 + y * 8) + .007 * Math.sin(y * 40 - x * 15) + .014 * e * e);
      p.setY(i, y * (1 - .25 * Math.cos(x * 13)) + .012 * Math.sin(x * 47));
    }
    g.rotateX(-PI / 2); g.computeVertexNormals(); return g;
  })();
  function torusFlat(r, t, arc, sy) { var g = new THREE.TorusGeometry(r, t, 6, 30, arc); g.rotateX(PI / 2); g.scale(1, sy, 1); return g; }

  function M(o) { return new THREE.MeshStandardMaterial(o); }
  // Jede Art: Form, Material, Anzahl, Größe, Höhe; nach: erst nach dem Backen, melt: Käse
  var salT = salamiTex();
  var KIND = {
    fior: { geo: noisy(new THREE.SphereGeometry(.1, 20, 12).scale(1, .4, 1), .34, 3), mat: M({ color: "#f6efe0", roughness: .38 }), n: 16, s: [.7, 1.2], y: .058, rmax: .7, melt: 1, stretch: 1 },
    bufala: { geo: noisy(new THREE.SphereGeometry(.15, 22, 14).scale(1, .46, 1), .22, 4), mat: M({ color: "#fffcf4", roughness: .3 }), n: 7, s: [.85, 1.1], y: .064, rmax: .6, melt: 1, big: 1, stretch: 1 },
    salami: { geo: new THREE.CylinderGeometry(.14, .14, .02, 30), mat: [M({ color: "#6a1b16", roughness: .6 }), M({ map: salT, roughness: .48 }), M({ map: salT, roughness: .5 })], n: 9, s: [.9, 1.05], y: .092, rmax: .7, dark: .25 },
    cotto: { geo: ham, mat: M({ color: "#e9a69b", roughness: .5 }), n: 8, s: [.85, 1.15], y: .088, rmax: .72, dark: .15, stretch: 1 },
    funghi: { geo: mushroom, mat: [M({ color: "#e4d2b4", roughness: .7 }), M({ color: "#8a6744", roughness: .75 })], n: 11, s: [.9, 1.2], y: .09, rmax: .74, dark: .2 },
    olive: { geo: torusFlat(.032, .016, PI * 2, .9), mat: M({ color: "#221d1a", roughness: .22 }), n: 14, s: [.9, 1.1], y: .094, rmax: .76 },
    peperoni: { geo: torusFlat(.15, .017, 1.35, .55), mat: M({ color: "#ffffff", roughness: .3 }), n: 10, s: [.85, 1.1], y: .09, rmax: .7, cols: ["#c9311e", "#e8b22e", "#c9311e", "#e07a1e"], dark: .12 },
    cipolla: { geo: torusFlat(.1, .008, 3.6, .6), mat: M({ color: "#ffffff", roughness: .38, transparent: true, opacity: .93 }), n: 10, s: [.7, 1.15], y: .09, rmax: .72, cols: ["#b46a98", "#d9b4c9", "#a0577f"], dark: .1 },
    pomodorini: { geo: new THREE.CylinderGeometry(.068, .052, .034, 24), mat: [M({ color: "#b5241a", roughness: .35 }), M({ map: tomatoTex(), roughness: .3 }), M({ color: "#b5241a" })], n: 8, s: [.9, 1.1], y: .094, rmax: .66, dark: .12 },
    basilico: { geo: bent(leaf(.15, .055), 1.4), mat: M({ color: "#2f7a2b", roughness: .42, side: THREE.DoubleSide }), n: 7, s: [.9, 1.25], y: .1, rmax: .6, dark: .35 },
    crudo: { geo: crudoGeo, mat: M({ map: crudoTex(), roughness: .5, side: THREE.DoubleSide }), n: 7, s: [.9, 1.15], y: .11, rmax: .6, after: 1, tilt: .2 },
    rucola: { geo: bent(leaf(.2, .045, 1), 1.6), mat: M({ color: "#4b8a2f", roughness: .5, side: THREE.DoubleSide }), n: 18, s: [.75, 1.2], y: .125, rmax: .62, after: 1, tilt: .35 }
  };
  var ORDER = ["fior", "bufala", "salami", "cotto", "funghi", "olive", "peperoni", "cipolla", "pomodorini", "basilico", "crudo", "rucola"];
  var DM = new THREE.Matrix4(), DQ = new THREE.Quaternion(), DE = new THREE.Euler(), DP = new THREE.Vector3(), DS = new THREE.Vector3(), TC = new THREE.Color();
  ORDER.forEach(function (id, ki) {
    var k = KIND[id], r = rng(ki * 13 + 7), off = ki * 2.1 + r() * 6;
    k.id = id; k.on = false; k.pieces = [];
    for (var i = 0; i < k.n; i++) {
      var rr = k.rmax * Math.sqrt((i + .55) / k.n) + (r() - .5) * .06, a = i * 2.39996 + off + (r() - .5) * .3;
      k.pieces.push({ x: Math.cos(a) * rr, z: Math.sin(a) * rr, s: k.s[0] + r() * (k.s[1] - k.s[0]), ry: r() * PI * 2, tx: (r() - .5) * (k.tilt || .08), tz: (r() - .5) * (k.tilt || .08), dy: r() * .004, h: 1.3 + r() * .5, sp: (r() - .5) * 5, st: 0, t0: 0, ax: k.stretch ? .72 + r() * .56 : 1, hk: 1 });
    }
    k.mesh = new THREE.InstancedMesh(k.geo, k.mat, k.n); k.mesh.frustumCulled = false; k.mesh.visible = false;
    k.base = (Array.isArray(k.mat) ? k.mat : [k.mat]).map(function (m) { return m.color.clone(); });
    if (k.cols) k.pieces.forEach(function (p, i) { k.mesh.setColorAt(i, TC.set(k.cols[i % k.cols.length])); });
    DM.makeScale(0, 0, 0); for (var j = 0; j < k.n; j++) k.mesh.setMatrixAt(j, DM);
    pz.add(k.mesh);
    if (k.melt) {
      k.over = new THREE.Mesh(new THREE.CircleGeometry(.92, 64), new THREE.MeshStandardMaterial({ map: meltTex(k.pieces, k.big), transparent: true, opacity: 0, roughness: .4, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 }));
      k.over.rotation.x = -PI / 2; k.over.position.y = .058; pz.add(k.over);
    }
  });

  // st: 0 aus, 1 fällt/federt, 2 liegt, 3 geht weg
  var FALL = .4, SETTLE = .55, LEAVE = .24;
  // fast: kürzerer Fall und dichtere Folge (nach dem Backen, damit alles vor dem Deckel liegt)
  function setKind(k, on, now, delay, fast) {
    if (k.on === on) return; k.on = on;
    if (on) k.mesh.visible = true;
    var order = k.pieces.map(function (p, i) { return i; }).sort(function () { return R() - .5; });
    order.forEach(function (i, n) { var p = k.pieces[i]; p.st = on ? 1 : (p.st ? 3 : 0); p.hk = fast ? .45 : 1; p.t0 = now + (delay || 0) + n * (on ? (fast ? .016 : .045) : .018) + R() * .03; });
  }
  var melt = 0, bake = 0;
  function updKind(k, t) {
    if (!k.mesh.visible) return false;
    var busy = false, any = false, mk = k.melt ? melt : 0;
    for (var i = 0; i < k.n; i++) {
      var p = k.pieces[i], x = p.x, z = p.z, y = k.y + p.dy, s = p.s, sy = 1, sxz = 1, spin = 0;
      if (p.st === 1) {
        var tau = t - p.t0; busy = true;
        if (tau < 0) s = 0;
        else if (tau < FALL) {
          var f = tau / FALL, e = out3(f);
          y += p.h * p.hk * (1 - f * f); x = p.x * (.45 + .55 * e); z = p.z * (.45 + .55 * e); spin = p.sp * (1 - e);
        } else {
          var b = tau - FALL, dmp = Math.exp(-9 * b);
          y += .045 * dmp * Math.abs(Math.sin(15 * b)); sy = 1 - .32 * dmp * Math.cos(17 * b); sxz = 1 + .14 * dmp * Math.cos(17 * b);
          if (b > SETTLE) p.st = 2;
        }
      } else if (p.st === 3) {
        var q = (t - p.t0) / LEAVE; busy = true;
        if (q < 0) q = 0;
        if (q >= 1) { p.st = 0; s = 0; } else { y += .4 * in2(q); s *= 1 - in2(q); spin = q * 2; }
      } else if (p.st === 0) s = 0;
      if (s > 0) any = true;
      if (mk) { sxz *= 1 + .75 * mk; sy *= 1 - .62 * mk; y -= .012 * mk; }
      DE.set(p.tx, p.ry + spin, p.tz); DQ.setFromEuler(DE); DP.set(x, y, z); DS.set(s * sxz * p.ax, s * sy, s * sxz / p.ax);
      DM.compose(DP, DQ, DS); k.mesh.setMatrixAt(i, DM);
    }
    k.mesh.instanceMatrix.needsUpdate = true;
    if (!any && !k.on && !busy) k.mesh.visible = false;
    return busy;
  }
  function tint() {
    ORDER.forEach(function (id) {
      var k = KIND[id], ms = Array.isArray(k.mat) ? k.mat : [k.mat];
      ms.forEach(function (m, i) {
        m.color.copy(k.base[i]);
        if (k.melt) m.color.lerp(TC.set("#f2dca4"), melt * .8);
        else if (k.dark && !k.after) m.color.multiplyScalar(1 - k.dark * bake);
      });
      if (k.over) k.over.material.opacity = k.on ? smooth(melt) : 0;
    });
    rimMat.color.copy(RAW).lerp(BAKED, smooth(bake));
    ctrMat.color.copy(RAW).lerp(CTR_B, bake);
    spotMat.opacity = smooth(cl(bake * 1.3 - .15, 0, 1));
    sauceMat.color.setScalar(1 - .14 * bake);
  }

  /* ---------- Ofen ---------- */
  var oven = new THREE.Group(); oven.visible = false; scene.add(oven);
  (function () {
    var sh = new THREE.Shape(); sh.moveTo(WALL.x0, WALL.y0); sh.lineTo(WALL.x1, WALL.y0); sh.lineTo(WALL.x1, WALL.y1); sh.lineTo(WALL.x0, WALL.y1); sh.closePath();
    var hole = new THREE.Path(); hole.moveTo(-WALL.r, -.08); hole.lineTo(-WALL.r, WALL.cy); hole.absarc(0, WALL.cy, WALL.r, PI, 0, true); hole.lineTo(WALL.r, -.08); hole.closePath();
    sh.holes.push(hole);
    var wt = wallTex(), w = WALL.x1 - WALL.x0, h = WALL.y1 - WALL.y0;
    wt.repeat.set(1 / w, 1 / h); wt.offset.set(-WALL.x0 / w, -WALL.y0 / h);
    var wall = new THREE.Mesh(new THREE.ShapeGeometry(sh, 24), new THREE.MeshStandardMaterial({ map: wt, roughness: .92 }));
    wall.position.set(0, -.12, -1.55); oven.add(wall);
    var sill = new THREE.Mesh(new THREE.BoxGeometry(4.6, .16, .5), M({ color: "#4b4039", roughness: .9 })); sill.position.set(0, -.2 - .12 + .02, -1.32); oven.add(sill);
    var soot = M({ map: sootTex(), roughness: 1, side: THREE.BackSide, color: "#a0704f" }), none = new THREE.MeshBasicMaterial({ visible: false });
    var box = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.4, 3.4), [soot, soot, soot, M({ color: "#5d4636", roughness: 1, side: THREE.BackSide }), none, soot]);
    box.position.set(0, 1.0, -3.25); oven.add(box);
    var ft = flameTex(), add = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
    oven.userData.flames = [];
    // Feuer seitlich hinten wie im echten Holzofen: schmale, unterschiedlich hohe Zungen
    [[-1.55, 1.5, .55], [-1.2, 2.0, .62], [-.85, 1.6, .5], [-1.4, 1.1, .4], [-.55, 1.15, .42], [-1.0, 1.25, .46], [-.25, .8, .34]].forEach(function (f, i) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(0, .5, 0), new THREE.MeshBasicMaterial(Object.assign({ map: ft, opacity: .78 }, add)));
      m.position.set(f[0], -.18, -4.5 + (i % 3) * .12); m.userData = { w: f[2], h: f[1], ph: i * 1.9 }; oven.add(m); oven.userData.flames.push(m);
    });
    var logs = M({ color: "#2a1a10", roughness: 1, emissive: "#ff5a10", emissiveIntensity: .25 });
    [[-1.3, .5, -4.3], [-.8, -.4, -4.45], [-1.05, .1, -4.2]].forEach(function (l) { var m = new THREE.Mesh(new THREE.CylinderGeometry(.08, .09, 1.1, 10), logs); m.rotation.set(PI / 2, 0, l[1]); m.position.set(l[0], -.1, l[2]); oven.add(m); });
    var bed = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.6), new THREE.MeshBasicMaterial(Object.assign({ map: glowTex("255,110,30"), opacity: .9 }, add)));
    bed.rotation.x = -PI / 2; bed.position.set(-.9, -.15, -4.2); oven.add(bed);
    // Funken: steigen von der Glut auf und tauchen unten neu auf
    var N = mobile ? 26 : 44, pos = new Float32Array(N * 3), sp = [];
    for (var i = 0; i < N; i++) sp.push({ x: -1 + (R() - .5) * 1.6, y: R() * 1.8, z: -4.3 + R() * .9, v: .5 + R() * .8, w: R() * 6 });
    var pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var pts = new THREE.Points(pg, new THREE.PointsMaterial(Object.assign({ map: glowTex("255,190,110"), size: .07, color: "#ffc27a" }, add)));
    pts.frustumCulled = false; oven.add(pts); oven.userData.sparks = { sp: sp, pos: pos, geo: pg };
  })();
  function ovenFrame(t, dt) {
    oven.userData.flames.forEach(function (m) {
      var u = m.userData, f = .82 + .14 * Math.sin(t * 8 + u.ph) + .09 * Math.sin(t * 21 + u.ph * 2) + .05 * Math.sin(t * 37 + u.ph);
      m.scale.set(u.w * (1 + .07 * Math.sin(t * 12 + u.ph)), u.h * f, 1); m.rotation.z = .05 * Math.sin(t * 5 + u.ph);
    });
    var S = oven.userData.sparks;
    S.sp.forEach(function (p, i) {
      p.y += p.v * dt; if (p.y > 2) { p.y = 0; p.x = -1 + (R() - .5) * 1.6; }
      S.pos[i * 3] = p.x + Math.sin(t * 2 + p.w) * .12; S.pos[i * 3 + 1] = -.1 + p.y; S.pos[i * 3 + 2] = p.z + p.y * .35;
    });
    S.geo.attributes.position.needsUpdate = true;
    return .9 + .1 * Math.sin(t * 11) + .06 * Math.sin(t * 27);
  }

  /* ---------- Karton ---------- */
  var carton = new THREE.Group(); carton.visible = false; scene.add(carton);
  var lidHinge = new THREE.Group(), cartonMats = [];
  (function () {
    var side = M({ color: "#2b231d", roughness: .75, side: THREE.DoubleSide }), inner = M({ color: "#a68a66", roughness: .95 }), none = new THREE.MeshBasicMaterial({ visible: false });
    var W = 2.5, H = .24;
    var base = new THREE.Mesh(new THREE.BoxGeometry(W, H, W), [side, side, none, inner, side, side]); base.position.y = H / 2 - .01; carton.add(base);
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(W - .02, W - .02), inner); floor.rotation.x = -PI / 2; floor.position.y = -.005; carton.add(floor);
    var trim = M({ color: "#c9a45c", roughness: .35, metalness: .6 });
    var band = new THREE.Mesh(new THREE.BoxGeometry(W + .004, .018, W + .004), [trim, trim, none, none, trim, trim]); band.position.y = .05; carton.add(band);
    lidHinge.position.set(0, H - .01, -W / 2); carton.add(lidHinge);
    var top = M({ map: lidTex(), roughness: .55 });
    var lid = new THREE.Mesh(new THREE.BoxGeometry(W + .04, .028, W + .04), [side, side, top, side, side, side]); lid.position.set(0, .014, W / 2 + .02); lidHinge.add(lid);
    var lip = new THREE.Mesh(new THREE.BoxGeometry(W + .04, .2, .026), side); lip.position.set(0, -.09, W + .03); lidHinge.add(lip);
    cartonMats = [side, inner, trim, top];
    var shd = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6), new THREE.MeshBasicMaterial({ map: blobTexture(THREE, .55), transparent: true, depthWrite: false }));
    shd.rotation.x = -PI / 2; shd.position.y = -.02; carton.add(shd); cartonMats.push(shd.material);
  })();
  var OPEN = -1.95; lidHinge.rotation.x = OPEN;
  function cartonFade(o) { cartonMats.forEach(function (m) { m.transparent = o < 1; m.opacity = o; }); }

  /* ---------- Kamera ---------- */
  var aspect = 1, CAM = { n: new THREE.Vector3(), nt: new THREE.Vector3(0, 0, .3), o: new THREE.Vector3(), ot: new THREE.Vector3(0, .15, -2.75) }, camT = new THREE.Vector3();
  function frame() {
    var k = Math.max(1, Math.pow(1.02 / aspect, .85)), d = (NAH ? 3.9 : 4.75) * k, el = NAH ? 1.08 : .96;
    CAM.n.set(0, Math.sin(el) * d, Math.cos(el) * d + CAM.nt.z);
    CAM.o.set(0, 2.25, 2.75 * Math.max(1, Math.pow(1.1 / aspect, .9)));
  }
  function size() {
    var w = host.clientWidth || 1, h = host.clientHeight || 1;
    renderer.setSize(w, h, false); aspect = w / h; camera.aspect = aspect; camera.updateProjectionMatrix(); frame(); kick();
  }

  /* ---------- Zustand ---------- */
  var want = window.Proibito.wz(), shown = { sauce: null, kaese: null, top: [] }, sizeK = 1, sizeTo = 1, sizeFrom = 1, sizeT0 = -9;
  function apply(w, now, delay) {
    want = w; delay = delay || 0;
    if (shown.sauce !== w.sauce) {
      sauceMat.map = SAUCE[w.sauce] || SAUCE.pomodoro; sauceMat.needsUpdate = true;
      sauceAnim = { t0: now + delay, from: shown.sauce ? .35 : .05 }; shown.sauce = w.sauce; delay += .25;
    }
    if (shown.kaese !== w.kaese) {
      ["fior", "bufala"].forEach(function (id) { setKind(KIND[id], id === w.kaese, now, delay); }); shown.kaese = w.kaese; delay += .2;
    }
    ORDER.forEach(function (id) {
      var k = KIND[id]; if (k.melt) return;
      var on = w.top.indexOf(id) > -1 && (!k.after || !inScene || afterDropped);
      if (on !== k.on) setKind(k, on, now, delay);
    });
    var to = w.size === "famiglia" ? 1.13 : 1;
    if (to !== sizeTo) { sizeFrom = sizeK; sizeTo = to; sizeT0 = now; }
    kick();
  }
  document.addEventListener("proibito:wz", function (e) { if (!inScene) apply(e.detail, now()); else want = e.detail; });
  function now() { return performance.now() / 1000; }
  function resetPizza() {
    ORDER.forEach(function (id) { var k = KIND[id]; k.on = false; k.pieces.forEach(function (p) { p.st = 0; }); k.mesh.visible = false; });
    shown = { sauce: null, kaese: null, top: [] }; sauce.scale.setScalar(.001); bake = 0; melt = 0; tint();
  }

  /* ---------- Szene: Ofen, Karton, Warenkorb ---------- */
  var inScene = false, sc = null, afterDropped = false, sceneEl = document.getElementById("wzScene"), capEl = document.getElementById("wzCap"), skipEl = document.getElementById("wzSkip");
  var TL = { cam: [0, .5], wall: [0, .32], in: [.28, .78], bake: [.78, 1.55], out: [1.55, 1.95], camBack: [1.6, 2.0], wallDown: [1.7, 2.05], after: 1.68, lift: [2.0, 2.28], down: [2.28, 2.5], lid: [2.45, 2.85], fly: [2.95, 3.25], end: 3.28 };
  function cap(s) { if (capEl.textContent !== s) { capEl.textContent = s; capEl.style.animation = "none"; void capEl.offsetWidth; capEl.style.animation = ""; } }
  function bakeScene(w, done) {
    if (inScene) return;
    apply(w, now()); inScene = true; afterDropped = false;
    sc = { t0: now() + .05, done: done, w: w, yaw: yawCur };
    ORDER.forEach(function (id) { if (KIND[id].after) setKind(KIND[id], false, now()); });
    sceneEl.hidden = false; cap("Ab in den Ofen"); skipEl.focus({ preventScroll: true });
    kick();
  }
  function finish() {
    if (!inScene) return;
    var d = sc.done; inScene = false; sc = null;
    sceneEl.hidden = true; oven.visible = false; carton.visible = false; fire.intensity = 0; glow.intensity = 0; rimMat.emissiveIntensity = 0;
    hemi.intensity = .85; key.intensity = 2.5;
    tray.position.set(0, 0, 0); pz.position.set(0, 0, 0); pz.rotation.y = yawCur = drag.yaw = 0; tray.scale.setScalar(1); pz.scale.setScalar(sizeK);
    pz.visible = tray.visible = true; carton.scale.setScalar(1); cartonFade(1); lidHinge.rotation.x = OPEN;
    resetPizza(); intro = now();
    camera.position.copy(CAM.n); camT.copy(CAM.nt); camera.lookAt(camT);
    var foc = document.activeElement === skipEl || document.activeElement === document.body;
    if (d) d();
    if (foc) document.getElementById("wzGo").focus({ preventScroll: true });
    kick();
  }
  skipEl.addEventListener("click", finish);
  root.addEventListener("keydown", function (e) { if (e.key === "Escape" && inScene) finish(); });
  var V1 = new THREE.Vector3(), V2 = new THREE.Vector3();
  function sceneFrame(t, dt) {
    var s = t - sc.t0; if (s < 0) s = 0;
    var c = inOut(seg(s, TL.cam[0], TL.cam[1])) * (1 - inOut(seg(s, TL.camBack[0], TL.camBack[1])));
    V1.copy(CAM.n).lerp(CAM.o, c); V2.copy(CAM.nt).lerp(CAM.ot, c); camera.position.copy(V1); camT.copy(V2); camera.lookAt(camT);
    var wu = out3(seg(s, TL.wall[0], TL.wall[1])), wd = in2(seg(s, TL.wallDown[0], TL.wallDown[1]));
    oven.visible = wu > 0 && wd < 1; oven.position.y = -4.5 * (1 - wu) - 4.5 * wd;
    var heat = smooth(seg(s, .25, .7)) * (1 - smooth(seg(s, TL.out[0], TL.out[1] + .1)));
    var fl = oven.visible ? ovenFrame(t, dt) : 1;
    fire.intensity = 26 * heat * fl; glow.intensity = 3.2 * heat * fl; rimMat.emissiveIntensity = .22 * heat * fl;
    hemi.intensity = .85 - .55 * heat; key.intensity = 2.5 - 1.9 * heat;
    var z = -2.85 * inOut(seg(s, TL.in[0], TL.in[1])) * (1 - inOut(seg(s, TL.out[0], TL.out[1])));
    // Backen: Käse schmilzt zuerst, der Rand bräunt etwas später
    var b = seg(s, TL.bake[0], TL.bake[1]); melt = smooth(cl(b * 1.4, 0, 1)); bake = smooth(cl(b * 1.15 - .1, 0, 1)); tint();
    if (!afterDropped && s >= TL.after) {
      afterDropped = true; var tt = now();
      ORDER.forEach(function (id) { var k = KIND[id]; if (k.after && sc.w.top.indexOf(id) > -1) { k.on = false; setKind(k, true, tt, 0, true); } });
    }
    var lift = out3(seg(s, TL.lift[0], TL.lift[1])), down = inOut(seg(s, TL.down[0], TL.down[1]));
    var py = .42 * lift - .48 * down;
    tray.position.set(3.8 * in2(seg(s, TL.lift[0] + .05, TL.down[1])), 0, z);
    var cs = seg(s, TL.lift[0], TL.down[0] + .1);
    carton.visible = cs > 0;
    var f = seg(s, TL.fly[0], TL.fly[1]), fe = in2(f), fx = 1.4 * fe, fy = 1.6 * fe, fs = 1 - .75 * fe;
    carton.position.set(-3.8 * (1 - out3(cs)) + fx, -.06 + fy, 0); carton.scale.setScalar(fs); cartonFade(1 - fe);
    lidHinge.rotation.x = OPEN * (1 - outBack(seg(s, TL.lid[0], TL.lid[1])));
    pz.position.set(fx, py * fs + fy, z);
    pz.scale.setScalar(sizeK * fs);
    pz.rotation.y = sc.yaw + PI * .5 * inOut(seg(s, TL.bake[0] + .1, TL.bake[1] - .1));
    pz.visible = !(s > TL.lid[0] && lidHinge.rotation.x > -.3);
    tray.visible = tray.position.x < 3.7;
    cap(s < TL.bake[0] ? "Ab in den Ofen" : s < TL.out[0] ? "485 °C · 90 Sekunden" : s < TL.lid[0] ? "Goldbraun und knusprig" : "Ab in den Karton");
    if (s >= TL.end) { finish(); return false; }
    return true;
  }

  /* ---------- Schleife: zeichnet nur, wenn sichtbar und sich etwas bewegt ---------- */
  var drag = dragRotate(cv, { speed: .008 }), yawCur = 0, vis = false, raf = 0, last = 0, intro = 0;
  ["pointerdown", "pointermove"].forEach(function (ev) { cv.addEventListener(ev, kick); });
  function update(t, dt) {
    var busy = false;
    if (inScene) busy = sceneFrame(t, dt) || inScene;
    else {
      if (Math.abs(drag.yaw - yawCur) > 1e-4 || drag.active) { yawCur += (drag.yaw - yawCur) * Math.min(1, dt * 12); pz.rotation.y = yawCur; busy = true; }
      // Teig kommt beim ersten Mal und nach dem Karton weich auf die Schaufel
      var it = seg(t, intro, intro + .5); if (it < 1) { tray.scale.setScalar(.9 + .1 * out3(it)); busy = true; }
    }
    if (sauceAnim) {
      var a = seg(t, sauceAnim.t0, sauceAnim.t0 + .65), e = out3(a);
      sauce.scale.setScalar(sauceAnim.from + (1 - sauceAnim.from) * e); sauce.rotation.y = -1.6 * (1 - e);
      if (a >= 1) sauceAnim = null; busy = true;
    }
    var zk = seg(t, sizeT0, sizeT0 + .5); if (zk < 1 || sizeK !== sizeTo) { sizeK = sizeFrom + (sizeTo - sizeFrom) * out3(zk); if (!inScene) pz.scale.setScalar(sizeK); busy = busy || zk < 1; }
    ORDER.forEach(function (id) { if (updKind(KIND[id], t)) busy = true; });
    return busy;
  }
  function loop(ms) {
    raf = 0; if (!vis) return;
    var t = ms / 1000, dt = Math.min(.05, last ? t - last : .016); last = t;
    var more = update(now(), dt);
    renderer.render(scene, camera);
    if (more) raf = requestAnimationFrame(loop); else last = 0;
  }
  function kick() { if (vis && !raf) raf = requestAnimationFrame(loop); }
  new IntersectionObserver(function (es) {
    vis = es[es.length - 1].isIntersecting && !document.hidden;
    if (!vis && inScene) finish();
    kick();
  }, { rootMargin: "80px 0px" }).observe(host);
  document.addEventListener("visibilitychange", function () { if (document.hidden) { if (inScene) finish(); vis = false; } else { vis = true; kick(); } });
  if ("ResizeObserver" in window) new ResizeObserver(size).observe(host); else addEventListener("resize", size);

  /* ---------- Start ---------- */
  var fontP = document.fonts && document.fonts.load ? Promise.all(['400 100px "Limelight"', '400 30px "Poiret One"'].map(function (f) { return document.fonts.load(f); })).catch(function () {}) : Promise.resolve();
  fontP.then(function () {
    // Deckel und Ofenschild erst mit geladenen Schriften zeichnen
    var lidM = cartonMats[3]; lidM.map = lidTex(); lidM.needsUpdate = true;
    oven.children[0].material.map.image = wallTex().image; oven.children[0].material.map.needsUpdate = true;
  });
  size(); camera.position.copy(CAM.n); camT.copy(CAM.nt); camera.lookAt(camT); tint();
  intro = now();
  if (SNAP) {
    var sw = { size: "classico", sauce: "pomodoro", kaese: "fior", top: ["salami", "funghi", "olive", "basilico"] };
    apply(sw, now() - 10); melt = 1; bake = 1; tint();
    ORDER.forEach(function (id) { updKind(KIND[id], now()); });
    sauce.scale.setScalar(1); sauceAnim = null; tray.scale.setScalar(1); pz.rotation.y = .4;
    fontP.then(function () { setTimeout(function () { renderer.render(scene, camera); root.classList.add("has-3d"); window.__wzSnap = true; }, 100); });
    vis = false; return;
  }
  apply(want, now() + .25);
  root.classList.add("has-3d");
  window.ProibitoOfen = { ready: function () { return !inScene; }, bake: bakeScene, skip: finish };
  document.dispatchEvent(new CustomEvent("proibito:ofen"));
}
