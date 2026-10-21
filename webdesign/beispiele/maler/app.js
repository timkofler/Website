// Malerei Lindner – Beispielseite. Navigation, scroll-gebundene Farbrolle (Canvas mit
// Rollen-Textur), Raum-Visualisierer mit Farbmustern, Flächenrechner, Vorher/Nachher-Regler,
// Ablauf-Linie und Anfrageformular (Attrappe, nichts wird hochgeladen).
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var DEMO_MSG = "Das ist ein Beispiel – auf der echten Seite käme Ihre Anfrage jetzt direkt beim Betrieb an.";
  function cl(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function seg(p, a, b) { return cl((p - a) / (b - a)); }
  function eio(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function de(n, d) { return n.toLocaleString("de-AT", { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function hex2rgb(h) { var n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function shade(h, k) { var c = hex2rgb(h); return "rgb(" + c.map(function (v) { return Math.round(v * (1 - k)); }).join(",") + ")"; }

  /* ---------- Farbe über dem Hero-Bild: folgt den runden Ecken, läuft seitlich herunter ---------- */
  var drips = $("#drips"), hFrame = $(".hero__frame");
  function paintPath() {
    var W = hFrame.offsetWidth, H = hFrame.offsetHeight, P = 24;
    if (!W || !H) return;
    var r = parseFloat(getComputedStyle(hFrame).borderTopLeftRadius) || 28;
    var a = 14, b = 8, a2 = 8, b2 = 4, yL = H * .3, yR = H * .6, f = function (n) { return Math.round(n * 10) / 10; };
    // Außenkante: links hoch, um die Ecke, oben drüber, um die Ecke, rechts hinunter
    var d = "M" + f(-a2) + " " + f(yL) + "L" + f(-a) + " " + r +
      "A" + (r + a) + " " + (r + a) + " 0 0 1 " + r + " " + f(-a) +
      "L" + f(W - r) + " " + f(-a) +
      "A" + (r + a) + " " + (r + a) + " 0 0 1 " + f(W + a) + " " + r +
      "L" + f(W + a2) + " " + f(yR) +
      "A" + (a2 + b2) / 2 + " " + (a2 + b2) / 2 + " 0 0 1 " + f(W - b2) + " " + f(yR) +
      "L" + f(W - b) + " " + r +
      "A" + (r - b) + " " + (r - b) + " 0 0 0 " + f(W - r) + " " + b;
    // Innenkante oben: weich durchhängende Farbe statt gerader Linie
    var sags = [5, 11, 4, 8, 3, 10, 6], n = sags.length, step = (W - 2 * r) / n;
    for (var i = 0; i < n; i++) {
      var x0 = W - r - i * step, x1 = x0 - step;
      d += "Q" + f((x0 + x1) / 2) + " " + f(b + sags[i] * 2) + " " + f(x1) + " " + b;
    }
    d += "A" + (r - b) + " " + (r - b) + " 0 0 0 " + b + " " + r +
      "L" + b2 + " " + f(yL) +
      "A" + (a2 + b2) / 2 + " " + (a2 + b2) / 2 + " 0 0 1 " + f(-a2) + " " + f(yL) + "Z";
    // Tropfen mit runder Perle am Ende
    function drop(cx, L, w) {
      return "<path class=\"d\" d=\"M" + f(cx - w) + " " + (b - 2) + "C" + f(cx - w) + " " + f(L * .55) + " " + f(cx - w * .6) + " " + f(L - 12) + " " + f(cx - w * 1.15) + " " + f(L - 5) +
        "A" + f(w * 1.2) + " " + f(w * 1.2) + " 0 1 0 " + f(cx + w * 1.15) + " " + f(L - 5) +
        "C" + f(cx + w * .6) + " " + f(L - 12) + " " + f(cx + w) + " " + f(L * .55) + " " + f(cx + w) + " " + (b - 2) + "Z\"/>";
    }
    var gloss = "M" + f(-a + 5) + " " + f(r + 26) + "L" + f(-a + 5) + " " + r + "A" + (r + a - 5) + " " + (r + a - 5) + " 0 0 1 " + r + " " + f(-a + 5) + "L" + f(W * .38) + " " + f(-a + 5);
    drips.style.height = (H + 2 * P) + "px";
    drips.innerHTML = "<svg viewBox=\"" + -P + " " + -P + " " + (W + 2 * P) + " " + (H + 2 * P) + "\">" +
      "<path d=\"" + d + "\" fill=\"currentColor\"/>" +
      "<circle cx=\"" + f(-(a2 - b2) / 2) + "\" cy=\"" + f(yL + 4) + "\" r=\"" + ((a2 + b2) / 2 + 3) + "\" fill=\"currentColor\"/>" +
      "<circle cx=\"" + f(W + (a2 - b2) / 2) + "\" cy=\"" + f(yR + 4) + "\" r=\"" + ((a2 + b2) / 2 + 3) + "\" fill=\"currentColor\"/>" +
      "<g fill=\"currentColor\">" + drop(W * .2, W * .13, 6) + drop(W * .5, W * .22, 7) + drop(W * .79, W * .1, 5) + "</g>" +
      "<linearGradient id=\"drips-gl\" gradientUnits=\"userSpaceOnUse\" x1=\"" + -a + "\" y1=\"0\" x2=\"" + f(W * .38) + "\" y2=\"0\"><stop offset=\"0\" stop-color=\"#fff\" stop-opacity=\".5\"/><stop offset=\"1\" stop-color=\"#fff\" stop-opacity=\"0\"/></linearGradient>" +
      "<path d=\"" + gloss + "\" fill=\"none\" stroke=\"url(#drips-gl)\" stroke-width=\"3\" stroke-linecap=\"round\"/></svg>";
  }
  if (drips && hFrame) {
    paintPath();
    if (window.ResizeObserver) new ResizeObserver(paintPath).observe(hFrame);
    else window.addEventListener("resize", paintPath);
  }

  /* ---------- Navigation ---------- */
  var bar = $(".tk-demo-bar"), nav = $("#nav"), burger = $("#burger"), panel = $("#panel");
  function setBar() { document.documentElement.style.setProperty("--bar", (bar ? bar.offsetHeight : 0) + "px"); }
  setBar(); window.addEventListener("resize", setBar);
  function onNav() { nav.classList.toggle("is-solid", window.scrollY > 20); }
  onNav(); window.addEventListener("scroll", onNav, { passive: true });
  function menu(open) {
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    panel.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (open) { var f = panel.querySelector("a"); if (f) f.focus(); }
  }
  burger.addEventListener("click", function () { menu(burger.getAttribute("aria-expanded") !== "true"); });
  $$("a", panel).forEach(function (a) { a.addEventListener("click", function () { menu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("is-open")) { menu(false); burger.focus(); } });

  /* ---------- Hero: die Farbe hinter „Farbe“ wechselt ---------- */
  (function () {
    var sw = $("#swipe"), cols = ["#00a39b", "#ffc83a", "#ff6a4d", "#9caf88"], i = 0;
    if (!sw || reduce) return;
    setInterval(function () { i = (i + 1) % cols.length; sw.style.setProperty("--stripe", cols[i]); }, 3200);
  })();

  /* ---------- Farbrolle streicht die Wand (scroll-gebunden, Canvas) ---------- */
  var sec = $("#streichen");
  if (sec) (function () {
    var sticky = $(".pt__sticky", sec), wall = $("#wall"), cv = $("#pt-canvas"), ctx = cv.getContext("2d"), roller = $("#roller"), bands = $("#rl-bands");
    var barI = $("#pt-bar"), m2 = $("#pt-m2"), done = $("#pt-done");
    var COLOR = hex2rgb("#00a39b"), WALL_M2 = 11.5, E = 8;
    var W = 0, H = 0, R = 0, xs = [], tex = [], n = 0, cylH = 0, dpr = 1, ready = false;

    // Eine Bahn als Textur: satte Mitte, feine Rillen der Rolle, dunklere Farbkante und
    // ausgefranste, gesprenkelte Ränder – so sieht ein echter Rollenstrich aus.
    function makeStroke(w, h, seed) {
      var s = seed; function rnd() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }
      var c = document.createElement("canvas"); c.width = w; c.height = h;
      var g = c.getContext("2d"), img = g.createImageData(w, h), d = img.data;
      var ph = []; for (var i = 0; i < 8; i++) ph.push(rnd() * 6.28);
      var streak = new Float32Array(w);
      for (var x = 0; x < w; x++) streak[x] = Math.sin(x * .9 + ph[0]) * .4 + Math.sin(x * .23 + ph[1]) * .6 + (rnd() - .5) * .5;
      var wobL = 0, wobR = 0;
      for (var y = 0; y < h; y++) {
        wobL += (rnd() - .5) * .9; wobL *= .92; wobR += (rnd() - .5) * .9; wobR *= .92;
        var eL = E + 2 + Math.sin(y * .021 + ph[2]) * 1.6 + Math.sin(y * .11 + ph[3]) * .8 + wobL;
        var eR = w - E - 2 + Math.sin(y * .018 + ph[4]) * 1.6 + Math.sin(y * .13 + ph[5]) * .8 + wobR;
        for (var x2 = 0; x2 < w; x2++) {
          var dd = Math.min(x2 - eL, eR - x2), a;
          if (dd < -6) { a = 0; }
          else if (dd < -1.5) { a = rnd() < .1 * (1 + dd / 6) ? .7 : 0; }
          else { a = cl((dd + 1.5) / 3); if (dd < 3 && rnd() < .28) a *= .35; }
          if (a <= 0) continue;
          var sh = 1 + streak[x2] * .022 + (rnd() - .5) * .07 + Math.sin(y * .013 + ph[6] + x2 * .004) * .012;
          if (dd > 1 && dd < 6) sh -= .075 * (1 - Math.abs(dd - 3.4) / 2.6);
          var o = (y * w + x2) * 4;
          d[o] = Math.min(255, COLOR[0] * sh + (sh > 1 ? (sh - 1) * 120 : 0));
          d[o + 1] = Math.min(255, COLOR[1] * sh); d[o + 2] = Math.min(255, COLOR[2] * sh); d[o + 3] = a * 255;
        }
      }
      g.putImageData(img, 0, 0);
      return c;
    }
    function setup() {
      W = wall.clientWidth; H = wall.clientHeight; if (!W || !H) return;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      R = W < 700 ? W / 2.3 : Math.max(150, Math.min(280, W / 5.4));
      var stride = R * .84; n = Math.ceil((W + R * .08 - R) / stride) + 1;
      xs = []; for (var k = 0; k < n; k++) xs.push(-R * .08 + k * stride);
      tex = []; for (var k2 = 0; k2 < n; k2++) tex.push(makeStroke(Math.round(R + 2 * E), Math.ceil(H + 8), 97 + k2 * 31));
      roller.style.width = R + "px"; cylH = 58 * R / 200;
      ready = true;
    }
    var lastP = -1;
    function render(p) {
      if (!ready) return; lastP = p;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      var q = seg(p, .03, .92) * n, k = Math.min(n - 1, Math.floor(q)), fr = q - k, sum = 0;
      if (q >= n) { k = n - 1; fr = 1; }
      var rx = 0, ry = 0, dist = 0;
      for (var j = 0; j < n; j++) {
        var f = j < k ? 1 : j === k ? cl(fr / .82) : 0; sum += f;
        if (f <= 0) continue;
        var t = tex[j], Ls = t.height, len = Ls * f, down = j % 2 === 0;
        if (down) ctx.drawImage(t, 0, 0, t.width, len, xs[j] - E, -4, t.width, len);
        else ctx.drawImage(t, 0, Ls - len, t.width, len, xs[j] - E, H + 4 - len, t.width, len);
      }
      var fk = cl(fr / .82), downK = k % 2 === 0, headK = downK ? -4 + (H + 8) * fk : H + 4 - (H + 8) * fk;
      if (fr <= .82 || k === n - 1) { rx = xs[k]; ry = headK; }
      else { var sft = eio((fr - .82) / .18); rx = lerp(xs[k], xs[k + 1], sft); ry = downK ? H + 4 : -4; }
      dist = q * H;
      var tilt = (downK ? 1 : -1) * (fr < .82 ? 2.2 : 0);
      var out = p > .93 ? eio(seg(p, .93, 1)) : 0;
      roller.style.transform = "translate(" + (rx + out * (W - rx + 60)).toFixed(1) + "px," + (ry - cylH / 2 - out * 120).toFixed(1) + "px) rotate(" + tilt.toFixed(2) + "deg)";
      roller.style.opacity = p < .015 ? 0 : 1 - out;
      bands.setAttribute("transform", "translate(0 " + (-(dist % 20)).toFixed(1) + ")");
      var pr = sum / n;
      barI.style.transform = "scaleX(" + pr.toFixed(3) + ")";
      m2.textContent = de(pr * WALL_M2, 1) + " m²";
      done.classList.toggle("on", pr > .995);
    }
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { setup(); render(lastP < 0 ? 0 : lastP); }, 150); });
    if (reduce) { sec.classList.add("static"); requestAnimationFrame(function () { setup(); render(1); }); return; }
    var target = 0, cur = 0, raf = 0, visible = false;
    function measure() {
      var r = sec.getBoundingClientRect(), top = parseFloat(getComputedStyle(sticky).top) || 0;
      target = cl((top - r.top) / ((sec.offsetHeight - sticky.offsetHeight) || 1));
    }
    function loop() {
      cur += (target - cur) * .14;
      if (Math.abs(target - cur) < .0004) cur = target;
      render(cur);
      raf = cur !== target ? requestAnimationFrame(loop) : 0;
    }
    function onScroll() { if (!visible) return; if (!ready) setup(); measure(); if (!raf) raf = requestAnimationFrame(loop); }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) onScroll(); }, { rootMargin: "300px 0px" }).observe(sec);
    else visible = true;
    window.addEventListener("scroll", onScroll, { passive: true });
  })();

  /* ---------- Raum-Visualisierer ---------- */
  (function () {
    var COLS = [
      ["Salbei", "#9caf88", "Ruhiges Graugrün – wirkt natürlich und passt zu Holz und Leinen."],
      ["Terrakotta", "#c46a4a", "Warmes Erdrot – macht große Räume gemütlich, toll mit Pflanzen."],
      ["Nachtblau", "#1f2f4f", "Tiefes Blau für eine Akzentwand – edel, mit hellen Möbeln ein Hingucker."],
      ["Sand", "#d8c3a0", "Heller Naturton – freundlich, zeitlos und angenehm warm."],
      ["Petrol", "#1e5f68", "Kräftiges Blaugrün – mutig, aber erstaunlich wohnlich."],
      ["Altrosa", "#d4a5a0", "Gedecktes Rosa – sanft und modern, ideal fürs Schlafzimmer."],
      ["Ocker", "#c9962e", "Sonniges Gelbbraun – bringt Licht in Räume mit Nordfenster."],
      ["Lichtgrau", "#d9d9d4", "Helles, neutrales Grau – lässt Bilder und Möbel wirken."]
    ];
    var wrap = $("#swatches"), room = $("#room"); if (!wrap || !room) return;
    var base = $$("#walls-base .w-back, #walls-base .w-side"), neu = $$("#walls-new .w-back, #walls-new .w-side");
    var sweep = $("#sweep-path"), vr = $("#vroller"), vrc = $("#vroller-c"), dot = $("#v-dot");
    var pts = [], s = 7; function rnd() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }
    for (var y = -10; y <= 540; y += 10) pts.push((Math.sin(y * .05) * 6 + (rnd() - .5) * 12).toFixed(1) + " " + y);
    sweep.setAttribute("d", "M-900 -10 L" + pts.join(" L") + " L-900 540 Z");
    sweep.setAttribute("transform", "translate(-30 0)");
    var cur = COLS[0][1], anim = 0, pending = null;
    function paint(list, c) { list.forEach(function (e) { e.setAttribute("fill", e.classList.contains("w-side") ? shade(c, .14) : c); }); }
    function finish() { if (pending) { paint(base, pending); cur = pending; pending = null; } sweep.setAttribute("transform", "translate(-30 0)"); vr.setAttribute("opacity", 0); }
    function choose(i, btn) {
      var c = COLS[i][1];
      $$("button", wrap).forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      $("#v-name").textContent = COLS[i][0]; $("#v-desc").textContent = COLS[i][2]; dot.style.background = c;
      room.dispatchEvent(new CustomEvent("tk-paint", { detail: { c: c, name: COLS[i][0] } }));
      cancelAnimationFrame(anim); finish();
      if (c === cur) return;
      if (reduce) { paint(base, c); cur = c; return; }
      pending = c; paint(neu, c); vrc.setAttribute("fill", c);
      var t0 = null, dur = 1300;
      (function step(t) {
        if (!t0) t0 = t; var k = cl((t - t0) / dur), e = eio(k), tx = -30 + e * 860;
        sweep.setAttribute("transform", "translate(" + tx.toFixed(1) + " 0)");
        vr.setAttribute("opacity", k < .92 ? 1 : (1 - k) / .08);
        vr.setAttribute("transform", "translate(" + Math.min(790, tx + 6).toFixed(1) + " " + (70 + (Math.sin(k * Math.PI * 6 - Math.PI / 2) * .5 + .5) * 290).toFixed(1) + ")");
        if (k < 1) anim = requestAnimationFrame(step); else finish();
      })(performance.now());
    }
    COLS.forEach(function (c, i) {
      var b = document.createElement("button"); b.type = "button"; b.style.setProperty("--c", c[1]);
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.innerHTML = "<i></i>" + c[0];
      b.addEventListener("click", function () { choose(i, b); });
      wrap.appendChild(b);
    });
    dot.style.background = cur;
  })();

  /* ---------- Flächenrechner ---------- */
  (function () {
    var f = $("#cform"); if (!f) return;
    function v(id) { var x = parseFloat(String($(id).value).replace(",", ".")); return isFinite(x) && x > 0 ? x : 0; }
    var last = null;
    function calc() {
      var L = v("#c-l"), B = v("#c-b"), Hh = v("#c-h"), w = Math.round(v("#c-w")), d = Math.round(v("#c-d")), n = Math.max(1, Math.round(v("#c-n")) || 1);
      var walls = Math.max(0, 2 * (L + B) * Hh - w * 1.8 - d * 2), ceil = $("#c-c").checked ? L * B : 0, tot = walls + ceil;
      var lo = Math.round(tot * 9 / 10) * 10, hi = Math.round(tot * 12 / 10) * 10, liters = Math.ceil(tot * n / 7);
      $("#r-m2n").textContent = de(tot, 1);
      $("#r-walls").textContent = de(walls, 1) + " m²"; $("#r-ceil").textContent = ceil ? de(ceil, 1) + " m²" : "–";
      $("#r-l").textContent = liters + " Liter (" + n + "× gestrichen)";
      $("#r-price").textContent = tot > 0 ? "ca. " + de(lo, 0) + " – " + de(hi, 0) + " €" : "Bitte Maße eingeben";
      last = { L: L, B: B, H: Hh, tot: tot };
    }
    f.addEventListener("input", calc); f.addEventListener("change", calc);
    f.addEventListener("submit", function (e) { e.preventDefault(); });
    $("#r-cta").addEventListener("click", function () {
      if (!last || !last.tot) return;
      $("#a-m2").value = de(last.tot, 1);
      var m = $("#a-msg"); if (!m.value) m.value = "Raum ca. " + de(last.L, 1) + " × " + de(last.B, 1) + " m, Höhe " + de(last.H, 2) + " m – laut Rechner ca. " + de(last.tot, 1) + " m².";
    });
    calc();
  })();

  /* ---------- Vorher / Nachher ---------- */
  (function () {
    var ba = $("#ba"); if (!ba) return;
    function livingroom(after, id) {
      var s = '<defs><filter id="' + id + 't" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012 .02" numOctaves="4" seed="4"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .44  0 0 0 0 .42  0 0 0 .9 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>' +
        '<pattern id="' + id + 'p" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#e6d9b0"/><rect width="14" height="60" fill="#d8c693"/><path d="M38 14 q6 8 0 16 q-6 8 0 16" stroke="#c9b47c" stroke-width="2" fill="none"/></pattern>' +
        '<linearGradient id="' + id + 'f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (after ? "#c49a6c" : "#a88b66") + '"/><stop offset="1" stop-color="' + (after ? "#a77a4c" : "#8f7552") + '"/></linearGradient></defs>';
      if (after) s += '<rect width="800" height="360" fill="#bcb8b0"/><rect width="800" height="360" fill="#fff" filter="url(#' + id + 't)" opacity=".55"/><rect width="800" height="360" fill="#fff" opacity=".08"/>';
      else s += '<rect width="800" height="360" fill="url(#' + id + 'p)"/><rect width="800" height="360" fill="#7a6a3a" opacity=".12"/>' +
        '<ellipse cx="640" cy="80" rx="70" ry="40" fill="#8a7a4a" opacity=".22"/><ellipse cx="120" cy="300" rx="80" ry="30" fill="#7c6c40" opacity=".2"/>' +
        '<path d="M760 0 L800 0 L800 70 L770 40 Z" fill="#cbbd96"/><path d="M760 0 L770 40 L800 70" fill="none" stroke="#a4936a" stroke-width="2"/>';
      s += '<rect y="348" width="800" height="12" fill="' + (after ? "#f4f2ee" : "#d9cfb6") + '"/><rect y="360" width="800" height="90" fill="url(#' + id + 'f)"/>' +
        '<g stroke="#000" stroke-opacity=".08"><path d="M0 390 H800 M0 420 H800 M120 360 V390 M340 390 V420 M560 360 V390 M220 420 V450 M640 420 V450"/></g>';
      // Bild
      s += after ? '<rect x="300" y="70" width="200" height="130" fill="#f6f3ec" stroke="#1d1d1b" stroke-width="6"/><rect x="318" y="88" width="164" height="94" fill="#e9e3d6"/><circle cx="370" cy="132" r="26" fill="#c46a4a"/><rect x="404" y="104" width="54" height="62" fill="#1e5f68"/>'
        : '<g transform="rotate(-5 400 135)"><rect x="310" y="80" width="180" height="116" fill="#d8ccaa" stroke="#6b5a3a" stroke-width="8"/><rect x="326" y="96" width="148" height="84" fill="#b9ae8c"/><path d="M326 170 C360 140 400 160 474 130 V180 H326 Z" fill="#8c8462"/></g>';
      // Sideboard
      s += '<rect x="230" y="268" width="340" height="80" rx="4" fill="' + (after ? "#2b2a28" : "#7b5a3a") + '"/><path d="M343 272 V344 M457 272 V344" stroke="' + (after ? "#3d3b38" : "#5d432b") + '" stroke-width="3"/>' +
        '<rect x="246" y="348" width="8" height="14" fill="#222"/><rect x="546" y="348" width="8" height="14" fill="#222"/>';
      if (after) s += '<g><path d="M268 268 L276 224 H300 L308 268 Z" fill="#d9cfbf"/><path d="M288 224 C276 190 266 172 254 160 M288 224 C292 186 306 164 324 154 M288 224 C286 196 288 176 292 160" stroke="#3f7a4a" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="254" cy="160" r="9" fill="#4f8f58"/><circle cx="324" cy="154" r="10" fill="#3f7a4a"/><circle cx="292" cy="158" r="9" fill="#5c9c63"/></g>' +
        '<g><path d="M520 268 V200" stroke="#1d1d1b" stroke-width="4"/><path d="M500 200 h40 l-8 -34 h-24 z" fill="#c9962e"/><ellipse cx="520" cy="268" rx="16" ry="4" fill="#1d1d1b"/></g>' +
        '<rect x="390" y="248" width="70" height="20" rx="3" fill="#c46a4a"/><rect x="396" y="236" width="56" height="12" rx="3" fill="#e8e1d2"/>';
      else s += '<g><path d="M520 268 V206" stroke="#8a7a5a" stroke-width="4"/><path d="M496 206 h48 l-6 -30 h-36 z" fill="#d9c79a"/></g><rect x="280" y="246" width="80" height="22" rx="3" fill="#9b8f78"/>';
      return s;
    }
    // Referenz 1: echtes Foto (CC0, Rudolph Buch / Wikimedia Commons). Eine vorab erstellte Maske
    // (quellen/maler-fassade/maske.py) markiert den Putz; der wird mit der Wunschfarbe neu eingefärbt,
    // Licht und Schatten aus dem Foto bleiben erhalten. Alles läuft lokal im Browser.
    var FARBEN = [["Sand", "#e6d5ad"], ["Schönbrunner Gelb", "#e9cd80"], ["Salbei", "#bdcaa8"], ["Altrosa", "#ddaea0"], ["Terrakotta", "#d3875f"], ["Taubenblau", "#93a8b5"]];
    var photo = $("#ba-photo"), cv = $("#ba-cv"), cv2 = $("#ba-cv2"), sw = $("#ba-sw"), fname = null;
    var PW = Math.min(innerWidth, screen.width || innerWidth) < 700 ? 1100 : 1600, PDIR = "/beispiele/maler/fassade/";
    var src = null, msk = null, want = 1, cur = -1, busy = false, loading = false;
    function loadPhoto() {
      if (loading) return; loading = true;
      var a = new Image(), b = new Image(), n = 0;
      a.decoding = b.decoding = "async";
      a.onload = b.onload = function () { if (++n === 2) prep(a, b); };
      a.src = photo.src = PDIR + "haus-" + PW + ".webp"; b.src = PDIR + "maske-" + PW + ".jpg";
    }
    function prep(a, b) {
      var w = a.naturalWidth, h = a.naturalHeight; cv.width = cv2.width = w; cv.height = cv2.height = h;
      var x = cv.getContext("2d"); x.drawImage(b, 0, 0, w, h);
      var md = x.getImageData(0, 0, w, h).data; msk = new Uint8Array(w * h);
      for (var p = 0; p < msk.length; p++) msk[p] = md[p * 4];
      x.drawImage(a, 0, 0, w, h); src = x.getImageData(0, 0, w, h);
      paint(want, true);
    }
    function render(ctx, hex) {
      var d = src.data, out = ctx.createImageData(src.width, src.height), o = out.data, t = hex2rgb(hex), k, m, l, c;
      for (var p = 0, i = 0; p < msk.length; p++, i += 4) {
        m = msk[p]; o[i + 3] = 255;
        if (!m) { o[i] = d[i]; o[i + 1] = d[i + 1]; o[i + 2] = d[i + 2]; continue; }
        l = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 219; m /= 255;
        for (k = 0; k < 3; k++) { c = l <= 1 ? t[k] * l : t[k] + (255 - t[k]) * Math.min(1, l - 1); o[i + k] = d[i + k] + (c - d[i + k]) * m; }
      }
      ctx.putImageData(out, 0, 0);
    }
    function paint(i, now) {
      want = i;
      sw.querySelectorAll("button").forEach(function (b, j) { b.setAttribute("aria-pressed", j === i ? "true" : "false"); });
      if (fname) fname.textContent = FARBEN[i][0];
      if (!src || busy || i === cur) return;
      cur = i;
      if (now || reduce) { render(cv.getContext("2d"), FARBEN[i][1]); return; }
      // neue Farbe wird wie mit der Rolle von links nach rechts aufgetragen
      busy = true; render(cv2.getContext("2d"), FARBEN[i][1]);
      cv2.classList.remove("go"); void cv2.offsetWidth; cv2.classList.add("go");
      setTimeout(function () {
        cv.getContext("2d").drawImage(cv2, 0, 0); cv2.classList.remove("go"); busy = false;
        if (want !== cur) paint(want);
      }, 950);
    }
    FARBEN.forEach(function (f, i) {
      var b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-pressed", "false");
      b.innerHTML = '<i style="--c:' + f[1] + '"></i>' + f[0];
      b.addEventListener("click", function () { loadPhoto(); paint(i); });
      sw.appendChild(b);
    });
    function facadeCap() { return "<span><b>Einfamilienhaus, Musterdorf</b> · Fassade gereinigt, Risse saniert, Silikatfarbe „<span id=\"ba-fname\"></span>“, Fenster lackiert</span><span>Dauer: 6 Arbeitstage</span>"; }
    var REFS = [
      { photo: true, cap: facadeCap },
      { f: livingroom, cap: function () { return "<span><b>Wohnzimmer, Musterort</b> · alte Tapete entfernt, gespachtelt, Beton-Optik in Kalkspachtel</span><span>Dauer: 3 Arbeitstage</span>"; } }
    ];
    var aft = $("#ba-after"), bef = $("#ba-before"), cap = $("#ref-cap"), r = $("#ba-r");
    function show(i) {
      var R = REFS[i]; ba.classList.toggle("is-photo", !!R.photo); sw.hidden = !R.photo; $("#ba-note").hidden = !R.photo;
      if (R.photo) { aft.innerHTML = bef.innerHTML = ""; if (show.done) loadPhoto(); } else { aft.innerHTML = R.f(true, "a" + i); bef.innerHTML = R.f(false, "b" + i); }
      cap.innerHTML = R.cap(); fname = $("#ba-fname"); if (fname) fname.textContent = FARBEN[want][0];
    }
    r.addEventListener("input", function () { ba.style.setProperty("--x", r.value + "%"); });
    var tabs = $$(".rtabs button");
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { tabs.forEach(function (x, j) { x.setAttribute("aria-selected", i === j ? "true" : "false"); x.tabIndex = i === j ? 0 : -1; }); show(i); });
      t.addEventListener("keydown", function (e) { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); var n = tabs[(i + 1) % 2]; n.click(); n.focus(); } });
    });
    show(0); show.done = true;
    // Foto erst laden, wenn der Abschnitt näher kommt
    if ("IntersectionObserver" in window) {
      var lio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { lio.disconnect(); loadPhoto(); } }, { rootMargin: "900px 0px" });
      lio.observe(ba);
    } else loadPhoto();
    // kleiner Hinweis-Schwenk beim ersten Sichtbarwerden
    if (!reduce && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return; io.disconnect();
        var t0 = null; (function step(t) { if (!t0) t0 = t; var k = cl((t - t0) / 1600), v = 50 + Math.sin(k * Math.PI * 2) * 18 * (1 - k);
          ba.style.setProperty("--x", v.toFixed(1) + "%"); r.value = Math.round(v); if (k < 1) requestAnimationFrame(step); })(performance.now());
      }, { threshold: .6 });
      io.observe(ba);
    }
  })();

  /* ---------- Ablauf-Linie ---------- */
  (function () {
    var st = $("#steps"); if (!st) return;
    if (reduce || !("IntersectionObserver" in window)) { st.classList.add("go"); return; }
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { st.classList.add("go"); io.disconnect(); } }, { threshold: .3 });
    io.observe(st);
  })();

  /* ---------- Anfrage ---------- */
  (function () {
    var f = $("#aform"), file = $("#a-file"), msg = $("#a-msgbox"); if (!f) return;
    file.addEventListener("change", function () {
      var nm = file.files && file.files[0] ? file.files[0].name : "";
      $("#up-t").textContent = nm ? "Foto gewählt" : "Foto auswählen";
      $("#up-n").textContent = nm ? nm + " (wird im Beispiel nicht hochgeladen)" : "Es wird nichts hochgeladen – nur der Dateiname wird angezeigt.";
    });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      msg.textContent = DEMO_MSG; msg.classList.remove("on"); void msg.offsetWidth; msg.classList.add("on");
    });
  })();
})();
