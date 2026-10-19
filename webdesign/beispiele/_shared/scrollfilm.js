// Scroll-Film: section.sf[data-frames] spielt eine Bildfolge passend zum Scrollen ab.
// Das große Wort liegt mit mix-blend-mode über dem Film: auf hellem Grund gewinnt das dunklere Pixel (darken),
// auf schwarzem Grund das hellere (lighten). So steht das Produkt "vor" der Schrift, ganz ohne Freistellen.
// Ohne JavaScript, bei "weniger Bewegung" oder im Datensparmodus bleibt das Standbild mit allen Texten.
(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var save = navigator.connection && navigator.connection.saveData;
  if (reduce || save || !("IntersectionObserver" in window)) return;

  var rgb = function (c) { var m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(c);
    return m ? "rgb(" + parseInt(m[1], 16) + "," + parseInt(m[2], 16) + "," + parseInt(m[3], 16) + ")" : c; };
  var sm = function (a, b, v) { var t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

  document.querySelectorAll(".sf[data-frames]").forEach(function (sec) {
    var count = +sec.getAttribute("data-count"), pattern = sec.getAttribute("data-frames");
    var fit = sec.getAttribute("data-fit") || "cover", scale = +(sec.getAttribute("data-scale") || .86), valign = sec.getAttribute("data-valign") || "center", focus = +(sec.getAttribute("data-focus") || .5), target = +(sec.getAttribute("data-target") || .5), scaleM = +(sec.getAttribute("data-scale-m") || 0);
    var canvas = sec.querySelector(".sf__canvas"), x = canvas.getContext("2d"), word = sec.querySelector(".sf__word");
    var steps = [].slice.call(sec.querySelectorAll(".sf__step")), bar = sec.querySelector(".sf__bar i");
    var phone = matchMedia("(max-width: 760px)").matches, every = phone ? 2 : 1;
    var imgs = [], loaded = false, running = false, cur = -1, shown = -2, step = -1, bg = rgb(getComputedStyle(sec).getPropertyValue("--sf-bg").trim());
    var doSample = sec.getAttribute("data-sample") !== "0";

    sec.classList.add("is-on");
    function load() {
      if (loaded) return; loaded = true;
      for (var i = 1; i <= count; i += every) {
        var im = new Image(); im.decoding = "async";
        im.src = pattern.replace("{n}", String(i).padStart(2, "0"));
        imgs.push(im);
      }
      imgs[0].onload = function () { sample(); shown = -2; };
    }
    // Hintergrundfarbe aus einer Ecke des Films lesen, damit Seite und Clip nahtlos ineinander übergehen.
    function sample() {
      if (!doSample) return;
      try {
        var c = document.createElement("canvas"); c.width = c.height = 1;
        var g = c.getContext("2d"), im = imgs[0];
        g.drawImage(im, im.naturalWidth * .97, im.naturalHeight * .06, 4, 4, 0, 0, 1, 1);
        var d = g.getImageData(0, 0, 1, 1).data;
        bg = "rgb(" + d[0] + "," + d[1] + "," + d[2] + ")"; sec.style.setProperty("--sf-bg", bg);
      } catch (e) {}
    }
    function size() {
      var r = Math.min(2, window.devicePixelRatio || 1), w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = Math.round(w * r); canvas.height = Math.round(h * r); shown = -2;
    }
    function fade(x0, y0, x1, y1, rx, ry, rw, rh) {
      var g = x.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, bg); g.addColorStop(1, bg.replace("rgb(", "rgba(").replace(")", ",0)"));
      x.fillStyle = g; x.fillRect(rx, ry, rw, rh);
    }
    function paint(p) {
      var n = imgs.length; if (!n) return;
      var f = p * (n - 1), i = Math.floor(f), t = f - i, a = imgs[i], b = imgs[Math.min(n - 1, i + 1)];
      if (!a.naturalWidth) { for (var k = i; k >= 0; k--) if (imgs[k].naturalWidth) { a = imgs[k]; t = 0; break; } }
      if (!a.naturalWidth) return;
      var W = canvas.width, H = canvas.height, iw = a.naturalWidth, ih = a.naturalHeight, z = 1.06 - .06 * p, w, h, X, Y;
      if (W / H < 1) { if (scaleM) { w = W * scaleM * z; h = w * ih / iw; } else { h = H * .5 * z; w = h * iw / ih; } X = W / 2 - focus * w; Y = H - h - H * .08; }
      else if (fit === "inset") { w = W * scale * z; h = w * ih / iw; X = W * target - focus * w; Y = valign === "bottom" ? H - h : (H - h) / 2 + H * .04; }
      else { var s = Math.max(W / iw, H / ih) * z; w = iw * s; h = ih * s; X = Math.min(0, Math.max(W - w, W * target - focus * w)); Y = (H - h) / 2; }
      X = Math.round(X); Y = Math.round(Y); w = Math.round(w); h = Math.round(h);
      // Je 2 px Rand vom Clip abschneiden: Videokanten haben oft eine dunkle Pixelzeile.
      var draw = function (im) { x.drawImage(im, 2, 2, iw - 4, ih - 4, X, Y, w, h); };
      x.globalAlpha = 1; x.fillStyle = bg; x.fillRect(0, 0, W, H);
      draw(a);
      if (t > .02 && b.naturalWidth) { x.globalAlpha = t; draw(b); x.globalAlpha = 1; }
      // Jede Filmkante, die im Bild liegt, läuft weich in die Hintergrundfarbe aus.
      var sx = w * .2, ty = h * .3, by = h * .14;
      if (Y > -1) fade(0, Y, 0, Y + ty, X - 1, Y - 1, w + 2, ty + 1);
      if (Y + h < H + 1) fade(0, Y + h, 0, Y + h - by, X - 1, Y + h - by, w + 2, by + 1);
      if (X > -1) fade(X, 0, X + sx, 0, X - 1, Y - 1, sx + 1, h + 2);
      if (X + w < W + 1) fade(X + w, 0, X + w - sx, 0, X + w - sx, Y - 1, sx + 1, h + 2);
    }
    function texts(p) {
      var n = steps.length, k = Math.min(n - 1, Math.floor(p * n)), l = p * n - k;
      if (k !== step) {
        step = k; word.textContent = steps[k].getAttribute("data-word");
        word.style.fontSize = ""; var room = sec.clientWidth * .94, ww = word.scrollWidth;
        if (ww > room) word.style.fontSize = (parseFloat(getComputedStyle(word).fontSize) * room / ww) + "px";
        steps.forEach(function (s, j) { s.classList.toggle("is-cur", j === k); if (j !== k) s.style.opacity = 0; });
      }
      var o = Math.min(k === 0 ? 1 : sm(0, .18, l), k === n - 1 ? 1 : 1 - sm(.82, 1, l));
      word.style.opacity = o;
      word.style.transform = "translate(-50%, calc(-50% + " + ((l - .5) * -90) + "px)) scale(" + (.94 + l * .1) + ")";
      steps[k].style.opacity = o; steps[k].style.transform = "translateY(" + ((1 - o) * 20) + "px)";
      if (bar) bar.style.width = (p * 100) + "%";
    }
    function progress() {
      var r = sec.getBoundingClientRect(), max = sec.offsetHeight - innerHeight;
      return Math.min(1, Math.max(0, -r.top / max));
    }
    function tick() {
      if (!running) return;
      var p = progress();
      cur = cur < 0 ? p : cur + (p - cur) * .16;          // weich nachziehen statt ruckeln
      if (Math.abs(cur - shown) > 1e-4) { paint(cur); texts(cur); shown = cur; }
      requestAnimationFrame(tick);
    }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { load(); if (!running) { running = true; size(); requestAnimationFrame(tick); } }
        else running = false;
      });
    }, { rootMargin: "1200px 0px" }).observe(sec);
    addEventListener("resize", size);
    texts(0);
    // Für Aufnahmen (Vorschau-Videos): fester Fortschritt ohne Nachziehen.
    sec.sfRender = function (p) { running = false; paint(p); texts(p); };
    sec.sfReady = function () { load(); size(); return Promise.all(imgs.map(function (im) { return im.decode().catch(function () {}); })).then(function () { sample(); }); };
  });
})();
