// Haarfarbe ausprobieren: Live-Kamera, eigenes Foto oder Beispielfoto. Ein kleines KI-Modell (MediaPipe,
// Haar-Segmentierung) erkennt im Browser, wo die Haare sind; die Farbe legt sich per Canvas-Mischmodus darüber.
// Alles läuft lokal: Bild und Kamera verlassen das Gerät nie, es wird nichts hochgeladen oder gespeichert.
var VP = "/beispiele/_shared/vendor/mediapipe-vision-1.1.1/";
var root = document.getElementById("farbtest");
if (root) setup();

function setup() {
  var $ = function (s) { return root.querySelector(s); };
  var out = $("#ft-canvas"), ctx = out.getContext("2d"), img = $("#ft-img"), vid = $("#ft-video"), stat = $("#ft-status");
  var tint = document.createElement("canvas"), tctx = tint.getContext("2d");
  var mcv = document.createElement("canvas"), mctx = mcv.getContext("2d");
  var COLORS = [
    ["Kupfer", "#c0582c"], ["Mahagoni", "#7a2430"], ["Schoko", "#4a2c1d"], ["Karamell", "#a9713a"], ["Honigblond", "#d8a95c"],
    ["Aschblond", "#cfc6b4"], ["Rosé", "#e08da0"], ["Lavendel", "#9b86cc"], ["Blauschwarz", "#16202e"]
  ];
  var color = null, strength = .75, mode = "voll", before = false;
  var seg = null, segLoading = null, src = "foto", stream = null, mask = null, hairBox = null, rafId = 0, lastTs = -1;

  var sw = $("#ft-colors");
  COLORS.forEach(function (c, i) {
    var b = document.createElement("button"); b.type = "button"; b.style.setProperty("--c", c[1]);
    b.setAttribute("aria-pressed", "false"); b.innerHTML = "<i></i><span>" + c[0] + "</span>";
    b.addEventListener("click", function () {
      sw.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      color = c[1]; ensure().then(draw);
    });
    sw.appendChild(b);
  });
  $("#ft-strength").addEventListener("input", function (e) { strength = e.target.value / 100; draw(); });
  root.querySelectorAll("[data-mode]").forEach(function (b) {
    b.addEventListener("click", function () {
      mode = b.dataset.mode; root.querySelectorAll("[data-mode]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); draw();
    });
  });
  var bb = $("#ft-before");
  function hold(on) { return function (e) { if (e.cancelable && e.type !== "keydown") e.preventDefault(); before = on; bb.classList.toggle("on", on); draw(); }; }
  bb.addEventListener("pointerdown", hold(true)); bb.addEventListener("pointerup", hold(false)); bb.addEventListener("pointerleave", hold(false));
  bb.addEventListener("keydown", function (e) { if (e.key === " " || e.key === "Enter") hold(true)(e); });
  bb.addEventListener("keyup", hold(false));

  // Quellen
  $("#ft-cam").addEventListener("click", startCam);
  $("#ft-file").addEventListener("change", function (e) {
    var f = e.target.files && e.target.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () { stopCam(); img.onload = function () { src = "foto"; size(img.naturalWidth, img.naturalHeight); analyse(); }; img.src = r.result; };
    r.readAsDataURL(f); e.target.value = "";
  });
  $("#ft-sample").addEventListener("click", function () { stopCam(); img.onload = function () { src = "foto"; size(img.naturalWidth, img.naturalHeight); analyse(); }; img.src = img.dataset.sample; });
  $("#ft-save").addEventListener("click", function () {
    var a = document.createElement("a"); a.download = "meine-haarfarbe.png"; a.href = out.toDataURL("image/png"); a.click();
  });

  function size(w, h) {
    var k = Math.min(1, 900 / Math.max(w, h)); out.width = tint.width = Math.round(w * k); out.height = tint.height = Math.round(h * k);
  }
  function status(t) { stat.textContent = t || ""; stat.hidden = !t; }

  function ensure() {
    if (seg) return Promise.resolve(seg);
    if (segLoading) return segLoading;
    status("Haar-Erkennung wird geladen …");
    root.classList.add("is-loading");
    segLoading = import(VP + "vision_bundle.mjs").then(function (mp) {
      var files = { wasmLoaderPath: VP + "vision_wasm_internal.js", wasmBinaryPath: VP + "vision_wasm_internal.wasm" };
      function make(dlg) {
        return mp.ImageSegmenter.createFromOptions(files, { baseOptions: { modelAssetPath: VP + "hair_segmenter.tflite", delegate: dlg }, runningMode: "VIDEO", outputCategoryMask: false, outputConfidenceMasks: true });
      }
      return make("GPU").catch(function () { return make("CPU"); });
    }).then(function (s) { seg = s; root.classList.remove("is-loading"); status(""); if (src === "foto") analyse(); return s; })
      .catch(function () { root.classList.remove("is-loading"); status("Die Haar-Erkennung läuft auf diesem Gerät leider nicht. Probieren Sie einen aktuellen Browser."); segLoading = null; });
    return segLoading;
  }

  // Maske aus dem Ergebnis: Haar-Wahrscheinlichkeit als Alphakanal, weich ausgeblendet
  function takeMask(res) {
    var m = res.confidenceMasks && res.confidenceMasks[res.confidenceMasks.length - 1];
    if (!m) return;
    var w = m.width, h = m.height, f = m.getAsFloat32Array();
    if (mcv.width !== w || mcv.height !== h) { mcv.width = w; mcv.height = h; mask = mctx.createImageData(w, h); }
    var d = mask.data, x0 = w, x1 = 0, y0 = h, y1 = 0;
    for (var i = 0, n = w * h; i < n; i++) {
      var a = (f[i] - .25) / .5; a = a < 0 ? 0 : a > 1 ? 1 : a * a * (3 - 2 * a);
      d[i * 4 + 3] = a * 255;
      if (a > .5) { var x = i % w, y = (i / w) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    mctx.putImageData(mask, 0, 0);
    hairBox = y1 > y0 ? { t: y0 / h, b: y1 / h } : null;
    res.close && res.close();
  }

  function analyse() {
    if (!seg || src !== "foto" || !img.complete || !img.naturalWidth) { draw(); return; }
    lastTs = Math.max(lastTs + 1, performance.now());
    seg.segmentForVideo(img, lastTs, takeMask);
    draw();
  }

  function frameSrc() { return src === "cam" ? vid : img; }
  function draw() {
    var s = frameSrc(), W = out.width, H = out.height; if (!W) return;
    ctx.save();
    if (src === "cam") { ctx.translate(W, 0); ctx.scale(-1, 1); }
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    ctx.drawImage(s, 0, 0, W, H);
    if (color && mask && !before) {
      tctx.globalCompositeOperation = "source-over"; tctx.clearRect(0, 0, W, H);
      tctx.fillStyle = color; tctx.fillRect(0, 0, W, H);
      tctx.globalCompositeOperation = "destination-in"; tctx.imageSmoothingEnabled = true; tctx.drawImage(mcv, 0, 0, W, H);
      if (mode === "balayage" && hairBox) {
        // Strähnen: oben Naturfarbe, nach unten immer mehr Farbe
        var g = tctx.createLinearGradient(0, H * hairBox.t, 0, H * hairBox.b);
        g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(.38, "rgba(0,0,0,.1)"); g.addColorStop(1, "rgba(0,0,0,1)");
        tctx.fillStyle = g; tctx.fillRect(0, 0, W, H);
      }
      ctx.globalCompositeOperation = "color"; ctx.globalAlpha = strength; ctx.drawImage(tint, 0, 0);
      ctx.globalCompositeOperation = "soft-light"; ctx.globalAlpha = strength * .85; ctx.drawImage(tint, 0, 0);
    }
    ctx.restore();
  }

  function startCam() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { status("Ihr Browser erlaubt hier keinen Kamerazugriff. Nehmen Sie stattdessen ein Foto."); return; }
    status("Kamera wird gestartet …");
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 1280 } }, audio: false }).then(function (st) {
      stream = st; vid.srcObject = st; return vid.play();
    }).then(function () {
      src = "cam"; size(vid.videoWidth, vid.videoHeight); root.classList.add("is-cam"); status("");
      if (!color) sw.querySelector("button").click();
      ensure().then(loop);
    }).catch(function () { status("Kein Kamerazugriff. Sie können die Kamera in den Browser-Einstellungen erlauben – oder ein Foto nehmen."); });
  }
  function stopCam() {
    cancelAnimationFrame(rafId); root.classList.remove("is-cam");
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; vid.srcObject = null; }
  }
  function loop() {
    if (src !== "cam" || !stream) return;
    if (seg && vid.readyState >= 2) {
      var ts = performance.now(); if (ts <= lastTs) ts = lastTs + 1; lastTs = ts;
      try { seg.segmentForVideo(vid, ts, takeMask); } catch (e) {}
    }
    draw(); rafId = requestAnimationFrame(loop);
  }
  // Kamera aus, wenn der Abschnitt aus dem Bild scrollt oder der Tab wechselt
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { if (!es[0].isIntersecting && stream) { stopCam(); src = "foto"; size(img.naturalWidth, img.naturalHeight); analyse(); } }).observe(root);
  document.addEventListener("visibilitychange", function () { if (document.hidden && stream) { stopCam(); src = "foto"; size(img.naturalWidth, img.naturalHeight); analyse(); } });

  function first() { size(img.naturalWidth || 720, img.naturalHeight || 960); draw(); }
  if (img.complete && img.naturalWidth) first(); else img.addEventListener("load", first, { once: true });
  root.classList.add("is-ready");
}
