// 360°-Rundgang durch Gaststube und Schank. Startet erst auf Knopfdruck (spart Daten am Handy),
// lädt Three.js und die Panoramen lokal vom eigenen Server. Ziehen = umsehen, Mausrad/zwei Finger = zoomen.
import { reduce, mobile, webglOk, loadThree, stage } from "/beispiele/_shared/stage3d.js?v=2";

var box = document.getElementById("pano");
var BASE = "/beispiele/gasthaus/rundgang/";
// u/v = Position im Panoramabild (0–1 von links bzw. oben)
var SCENES = {
  stube: { name: "Gaststube", img: "stube", night: "stube-abend", nightShift: -.035, start: .44, spots: [
    { u: .44, v: .6, t: "Der Stammtisch", d: "Massive Eichenbank für bis zu 12 Personen. Freitags ab 18 Uhr reserviert für die Stammrunde, sonst gerne für Sie." },
    { u: .04, v: .55, t: "Der Kamin", d: "Von November bis März brennt hier jeden Tag das Feuer – die Plätze daneben sind im Winter zuerst weg." },
    { u: .6, v: .5, t: "Zur Terrasse", d: "Durch die Glastüren geht's hinaus auf die Terrasse mit Blick ins Tal. Ab 15 Grad wird draußen serviert." },
    { u: .935, v: .56, t: "Fensterplätze", d: "Tische für zwei bis vier Personen am Fenster. Am besten mit Reservierung, besonders am Sonntag zu Mittag." },
    { u: .195, v: .5, t: "Weiter zur Schank", go: "schank" }
  ] },
  schank: { name: "Schank", img: "schank", start: .7, spots: [
    { u: .7, v: .6, t: "Die Schank", d: "Bier vom Fass aus der Region, Most vom Nachbarhof und Edelbrände aus dem Mostviertel. Zum Feierabend auf ein Achterl?" },
    { u: .035, v: .62, t: "Der Schwedenofen", d: "Der gemütlichste Platz im Haus, wenn es draußen stürmt." },
    { u: .38, v: .6, t: "Die Eckbank", d: "Für Kartenrunden, Geburtstage oder einfach einen langen Abend – bis 20 Personen." },
    { u: .215, v: .55, t: "Zurück in die Gaststube", go: "stube" }
  ] }
};

if (box && webglOk()) {
  box.classList.add("can3d");
  box.querySelector(".pano__go").addEventListener("click", function () {
    box.classList.add("is-loading");
    loadThree().then(init).catch(function () { box.classList.remove("is-loading"); });
  }, { once: true });
}

function init(THREE) {
  var S = stage(THREE, box.querySelector(".pano__view"), { fov: 75, tone: false });
  var scene = S.scene, cam = S.camera, loader = new THREE.TextureLoader(), cache = {};
  var size = mobile ? "-2k.webp" : "-3k.webp";
  function tex(name) {
    if (!cache[name]) cache[name] = new Promise(function (res, rej) {
      loader.load(BASE + name + size, function (t) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; res(t); }, undefined, rej);
    });
    return cache[name];
  }
  var geo = new THREE.SphereGeometry(50, 64, 40); geo.scale(-1, 1, 1);
  function sphere() { var m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 1, depthWrite: false })); scene.add(m); return m; }
  var a = sphere(), b = sphere(); b.visible = false;

  var yaw = 0, pitch = 0, fov = mobile ? 80 : 72, touched = false, cur = "stube", night = false, shift = 0;
  function dir(u, v) { var ph = 2 * Math.PI * u, th = Math.PI * v; return new THREE.Vector3(Math.cos(ph) * Math.sin(th), Math.cos(th), Math.sin(ph) * Math.sin(th)); }
  function yawOf(u) { return Math.atan2(Math.sin(2 * Math.PI * u), Math.cos(2 * Math.PI * u)); }

  // Hotspots als echte Buttons über dem Bild
  var spotsEl = box.querySelector(".pano__spots"), info = box.querySelector(".pano__info"), spots = [];
  function buildSpots(key) {
    spotsEl.innerHTML = ""; spots = [];
    SCENES[key].spots.forEach(function (s) {
      var bt = document.createElement("button"); bt.type = "button"; bt.className = "spot" + (s.go ? " spot--go" : "");
      bt.innerHTML = "<i></i><span>" + s.t + "</span>"; bt.setAttribute("aria-label", s.t);
      bt.addEventListener("click", function () {
        if (s.go) { go(s.go); return; }
        info.innerHTML = "<b>" + s.t + "</b>" + s.d + '<button type="button" aria-label="Schließen">×</button>'; info.classList.add("on");
      });
      spotsEl.appendChild(bt); spots.push({ el: bt, s: s });
    });
  }
  info.addEventListener("click", function (e) { if (e.target.tagName === "BUTTON") info.classList.remove("on"); });

  var fade = null;
  function show(key, first) {
    var sc = SCENES[key], name = night && sc.night ? sc.night : sc.img;
    shift = night && sc.night ? sc.nightShift : 0;
    return tex(name).then(function (t) {
      if (first) { a.material.map = t; a.material.needsUpdate = true; return; }
      b.material.map = t; b.material.needsUpdate = true; b.material.opacity = 0; b.visible = true;
      fade = { t0: performance.now(), dur: reduce ? 1 : 650 };
    });
  }
  function go(key) {
    if (key === cur) return;
    cur = key; info.classList.remove("on");
    box.querySelectorAll("[data-scene]").forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.scene === key ? "true" : "false"); });
    nightBtn.hidden = !SCENES[key].night;
    show(key).then(function () { buildSpots(key); yaw = -yawOf(SCENES[key].start); pitch = 0; });
  }
  var nightBtn = box.querySelector("[data-night]");
  box.querySelectorAll("[data-scene]").forEach(function (x) { x.addEventListener("click", function () { go(x.dataset.scene); }); });
  nightBtn.addEventListener("click", function () {
    night = !night; nightBtn.setAttribute("aria-pressed", night ? "true" : "false");
    show(cur).then(function () { buildSpots(cur); });
  });
  box.querySelector("[data-full]").addEventListener("click", function () {
    var on = !box.classList.contains("is-full");
    box.classList.toggle("is-full", on); document.documentElement.classList.toggle("pano-lock", on);
    if (on && box.requestFullscreen) box.requestFullscreen().catch(function () {});
    else if (!on && document.fullscreenElement) document.exitFullscreen();
    setTimeout(S.resize, 60); touchMode();
  });
  document.addEventListener("fullscreenchange", function () {
    if (!document.fullscreenElement && box.classList.contains("is-full")) { box.classList.remove("is-full"); document.documentElement.classList.remove("pano-lock"); setTimeout(S.resize, 60); touchMode(); }
  });

  // Ziehen, Mausrad und Zwei-Finger-Zoom
  var cv = S.canvas, pts = {}, sx, sy, y0, p0, d0 = 0, f0;
  // Auf der Seite: senkrecht wischen scrollt weiter, waagrecht dreht. Im Vollbild gehört jede Geste dem Rundgang.
  function touchMode() { cv.style.touchAction = box.classList.contains("is-full") ? "none" : "pan-y"; }
  touchMode();
  function n() { return Object.keys(pts).length; }
  function dist() { var k = Object.keys(pts), p = pts[k[0]], q = pts[k[1]]; return Math.hypot(p.x - q.x, p.y - q.y); }
  cv.addEventListener("pointerdown", function (e) {
    pts[e.pointerId] = { x: e.clientX, y: e.clientY }; try { cv.setPointerCapture(e.pointerId); } catch (x) {}
    touched = true; box.classList.add("touched"); sx = e.clientX; sy = e.clientY; y0 = yaw; p0 = pitch;
    if (n() === 2) { d0 = dist(); f0 = fov; }
  });
  cv.addEventListener("pointermove", function (e) {
    if (!pts[e.pointerId]) return; pts[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (n() === 2) { fov = Math.max(35, Math.min(90, f0 * d0 / Math.max(1, dist()))); return; }
    var k = fov / 75 * .0042;
    yaw = y0 + (e.clientX - sx) * k; pitch = Math.max(-1.2, Math.min(1.2, p0 + (e.clientY - sy) * k));
  });
  function up(e) { delete pts[e.pointerId]; if (n() === 1) { var p = pts[Object.keys(pts)[0]]; sx = p.x; sy = p.y; y0 = yaw; p0 = pitch; } }
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  cv.addEventListener("wheel", function (e) { if (!box.classList.contains("is-full") && !e.ctrlKey) return; e.preventDefault(); fov = Math.max(35, Math.min(90, fov + e.deltaY * .04)); }, { passive: false });

  var v = new THREE.Vector3(), look = new THREE.Vector3();
  S.onFrame(function (dt) {
    if (!touched && !reduce) yaw += dt * .05;
    if (fade) {
      var k = Math.min(1, (performance.now() - fade.t0) / fade.dur); b.material.opacity = k;
      if (k >= 1) { a.material.map = b.material.map; a.material.needsUpdate = true; b.visible = false; fade = null; }
    }
    if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
    // Blickrichtung: yaw = Drehung um die Hochachse, pitch nach oben/unten
    look.set(Math.cos(-yaw) * Math.cos(pitch), Math.sin(pitch), Math.sin(-yaw) * Math.cos(pitch));
    cam.lookAt(look);
    var w = S.canvas.clientWidth, h = S.canvas.clientHeight;
    for (var i = 0; i < spots.length; i++) {
      var s = spots[i].s; v.copy(dir(s.u + shift, s.v)).multiplyScalar(10).project(cam);
      var vis = v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
      spots[i].el.style.transform = "translate(" + ((v.x + 1) / 2 * w).toFixed(1) + "px," + ((1 - v.y) / 2 * h).toFixed(1) + "px)";
      spots[i].el.classList.toggle("off", !vis);
    }
  });

  yaw = -yawOf(SCENES.stube.start); 
  show("stube", true).then(function () { buildSpots("stube"); box.classList.remove("is-loading"); box.classList.add("is-on"); tex("schank"); });
}
