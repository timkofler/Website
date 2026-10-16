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
    function facade(after, id) {
      var wall = after ? "#ecd8b2" : "#b5b0a3", frame = after ? "#ffffff" : "#8a7a66", glass = after ? "#9fcbe0" : "#8f9a9c", roof = after ? "#7a3b2c" : "#55463f", door = after ? "#1e5f68" : "#6c5846", plinth = after ? "#353d40" : "#8a8981";
      var sky = after ? ["#bfe0f2", "#eef7fb"] : ["#cfd6d9", "#e7eaeb"], grass = after ? "#86b062" : "#9aa585";
      var win = function (x, y, w, h) {
        return '<rect x="' + (x - 6) + '" y="' + (y - 6) + '" width="' + (w + 12) + '" height="' + (h + 12) + '" fill="' + frame + '"/>' +
          '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + glass + '"/>' +
          '<path d="M' + (x + w / 2) + ' ' + y + ' V' + (y + h) + '" stroke="' + frame + '" stroke-width="5"/>' +
          (after ? '<path d="M' + (x + 6) + ' ' + (y + h - 8) + ' L' + (x + w / 2 - 8) + ' ' + (y + 8) + '" stroke="#fff" stroke-opacity=".5" stroke-width="5"/>' : "") +
          '<rect x="' + (x - 10) + '" y="' + (y + h + 6) + '" width="' + (w + 20) + '" height="7" fill="' + (after ? "#d9dcdd" : "#7d7a72") + '"/>' +
          (after ? "" : '<path d="M' + (x + 4) + ' ' + (y + h + 13) + ' q4 30 -2 60 M' + (x + w - 8) + ' ' + (y + h + 13) + ' q3 22 -1 40" stroke="#6f6a5f" stroke-opacity=".45" stroke-width="7" fill="none" stroke-linecap="round"/>');
      };
      var s = '<defs><linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + sky[0] + '"/><stop offset="1" stop-color="' + sky[1] + '"/></linearGradient>' +
        '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d6b45" stop-opacity="0"/><stop offset="1" stop-color="#5d6b45" stop-opacity=".55"/></linearGradient>' +
        '<linearGradient id="' + id + 'w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient></defs>' +
        '<rect width="800" height="450" fill="url(#' + id + 's)"/>' +
        (after ? '<circle cx="690" cy="80" r="34" fill="#fff6d5"/>' : '') +
        '<path d="M0 300 C120 270 220 290 320 280 S560 260 800 290 V450 H0 Z" fill="' + (after ? "#a9c98a" : "#a8b09a") + '"/>' +
        '<rect x="0" y="380" width="800" height="70" fill="' + grass + '"/>' +
        '<polygon points="210,200 400,92 590,200" fill="' + wall + '"/>' +
        '<rect x="210" y="200" width="380" height="190" fill="' + wall + '"/>' +
        '<path d="M210 200 L400 92 L590 200 V390 H210 Z" fill="url(#' + id + 'w)" opacity=".9"/>' +
        '<rect x="210" y="362" width="380" height="28" fill="' + plinth + '"/>' +
        (after ? '' : '<rect x="210" y="300" width="380" height="62" fill="url(#' + id + 'g)"/>' +
          '<path d="M260 230 l14 26 l-8 22 l16 30 M520 214 l-10 30 l12 18 l-6 30 M390 330 l10 -24 l-8 -16" stroke="#6a6457" stroke-width="1.8" fill="none"/>' +
          '<path d="M300 320 q18 -14 34 -4 q10 14 -8 22 q-20 4 -26 -18z M470 250 q14 -8 26 2 q4 14 -10 16 q-14 0 -16 -18z M228 240 q10 -6 18 2 q2 10 -8 12 q-10 -2 -10 -14z" fill="#d6d1c4"/>') +
        '<polygon points="178,206 400,70 622,206 600,214 400,94 200,214" fill="' + roof + '"/>' +
        '<g stroke="' + (after ? "#5e2b20" : "#423630") + '" stroke-width="2" opacity=".6"><path d="M240 182 L560 182 M276 160 L524 160 M312 138 L488 138 M350 116 L452 116"/></g>' +
        (after ? '' : '<path d="M300 150 q20 -8 40 0 M460 160 q16 -6 30 2" stroke="#6f7d4b" stroke-width="6" stroke-linecap="round" opacity=".7"/>') +
        '<circle cx="400" cy="160" r="20" fill="' + frame + '"/><circle cx="400" cy="160" r="14" fill="' + glass + '"/>' +
        win(250, 226, 70, 56) + win(480, 226, 70, 56) + win(250, 300, 70, 52) + win(480, 300, 70, 52) +
        '<rect x="370" y="290" width="60" height="100" fill="' + frame + '"/><rect x="376" y="296" width="48" height="94" fill="' + door + '"/>' +
        '<circle cx="416" cy="346" r="3" fill="' + (after ? "#e9d38f" : "#a49478") + '"/><rect x="384" y="306" width="32" height="26" fill="' + glass + '" opacity=".8"/>' +
        '<rect x="586" y="200" width="8" height="190" fill="' + (after ? "#9aa1a4" : "#7b766c") + '"/>' +
        '<g fill="' + (after ? "#4f8a3f" : "#6d7c58") + '"><ellipse cx="200" cy="384" rx="44" ry="26"/><ellipse cx="236" cy="390" rx="30" ry="18"/><ellipse cx="620" cy="386" rx="40" ry="24"/></g>' +
        (after ? '<g fill="#e5734f"><circle cx="190" cy="372" r="4"/><circle cx="214" cy="380" r="4"/><circle cx="630" cy="374" r="4"/><circle cx="608" cy="384" r="4"/></g>' : '') +
        '<path d="M340 450 L370 390 H430 L460 450 Z" fill="' + (after ? "#d9d2c4" : "#b9b4a8") + '"/>';
      return s;
    }
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
    var REFS = [
      { f: facade, cap: "<span><b>Einfamilienhaus, Musterdorf</b> · Fassade gereinigt, Risse saniert, Silikatfarbe „Sand“, Fenster lackiert</span><span>Dauer: 6 Arbeitstage</span>" },
      { f: livingroom, cap: "<span><b>Wohnzimmer, Musterort</b> · alte Tapete entfernt, gespachtelt, Beton-Optik in Kalkspachtel</span><span>Dauer: 3 Arbeitstage</span>" }
    ];
    var aft = $("#ba-after"), bef = $("#ba-before"), cap = $("#ref-cap"), r = $("#ba-r");
    function show(i) { aft.innerHTML = REFS[i].f(true, "a" + i); bef.innerHTML = REFS[i].f(false, "b" + i); cap.innerHTML = REFS[i].cap; }
    r.addEventListener("input", function () { ba.style.setProperty("--x", r.value + "%"); });
    var tabs = $$(".rtabs button");
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { tabs.forEach(function (x, j) { x.setAttribute("aria-selected", i === j ? "true" : "false"); x.tabIndex = i === j ? 0 : -1; }); show(i); });
      t.addEventListener("keydown", function (e) { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); var n = tabs[(i + 1) % 2]; n.click(); n.focus(); } });
    });
    show(0);
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
