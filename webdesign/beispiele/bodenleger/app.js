// Grund & Holz – Bodenplaner, Verlege-Animation beim Scrollen, Flächenrechner, Menü und Formular
(function () {
  "use strict";
  var B = window.GHBoden;
  var $ = function (s) { return document.querySelector(s); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var de = function (n, d) { return n.toLocaleString("de-AT", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };

  var PATS = {
    diele: { n: "Landhausdiele", t: "Lange, breite Dielen, ruhig und großzügig. Ideal für Wohnräume ab 20 m².", lo: 85, hi: 120, cut: 6 },
    schiff: { n: "Schiffsboden", t: "Kürzere Stäbe im Verband, der Klassiker für Kinderzimmer und Flure.", lo: 70, hi: 95, cut: 5 },
    fisch: { n: "Fischgrät", t: "Stäbe im rechten Winkel, lebendig und edel. Passt in Altbau wie Neubau.", lo: 110, hi: 150, cut: 10 },
    chevron: { n: "Chevron", t: "Schräg geschnittene Stäbe ergeben durchgehende Spitzen. Ein Boden mit Richtung.", lo: 130, hi: 180, cut: 15 },
    wuerfel: { n: "Würfel", t: "Tafeln aus drei Stäben, abwechselnd gedreht. Schachbrett aus Holz.", lo: 95, hi: 130, cut: 8 }
  };
  var MULT = { natur: 1, weiss: 1.05, sand: 1.05, rauch: 1.15, nuss: 1.35 };
  var state = { pat: "diele", wood: "sand" };

  function swatch(canvas, pat, wood, unit) {
    var t = B.texture(pat, wood, canvas.width, canvas.height, unit);
    var ctx = canvas.getContext("2d"); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(t.canvas, 0, 0);
  }
  function swColor(w) { var d = B.WOODS[w]; return "hsl(" + d.h + "," + d.s + "%," + d.l + "%)"; }

  // Menü
  var burger = $("#burger"), panel = $("#mpanel");
  if (burger && panel) {
    var setOpen = function (o) { burger.setAttribute("aria-expanded", o); burger.setAttribute("aria-label", o ? "Menü schließen" : "Menü öffnen"); panel.classList.toggle("open", o); };
    burger.addEventListener("click", function () { setOpen(burger.getAttribute("aria-expanded") !== "true"); });
    panel.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }

  var heroSw = $("#heroSw"); if (heroSw) swatch(heroSw, "diele", "sand", .5);

  // Bodenplaner
  var floor = $("#floor"), pats = $("#pats"), woods = $("#woods");
  function renderPlan() {
    var p = PATS[state.pat], m = MULT[state.wood];
    if (floor) { swatch(floor, state.pat, state.wood, 1.05); floor.classList.remove("fade"); void floor.offsetWidth; floor.classList.add("fade"); }
    $("#roomTag").textContent = p.n + " · " + B.WOODS[state.wood].n;
    $("#pName").textContent = p.n + ", " + B.WOODS[state.wood].n;
    $("#pText").textContent = p.t;
    $("#pPrice").textContent = "€ " + Math.round(p.lo * m) + "–" + Math.round(p.hi * m) + " / m²";
    $("#pCut").textContent = "ca. " + p.cut + " %";
    [].forEach.call(pats.children, function (b) { b.setAttribute("aria-pressed", b.dataset.p === state.pat); });
    [].forEach.call(woods.children, function (b) { b.setAttribute("aria-pressed", b.dataset.w === state.wood); });
    calc();
  }
  if (pats && woods) {
    Object.keys(PATS).forEach(function (k) {
      var b = document.createElement("button"); b.type = "button"; b.dataset.p = k;
      var c = document.createElement("canvas"); c.width = 192; c.height = 120; c.setAttribute("aria-hidden", "true");
      b.appendChild(c); b.appendChild(document.createTextNode(PATS[k].n));
      b.addEventListener("click", function () { state.pat = k; renderPlan(); syncPatButtons(); });
      pats.appendChild(b); swatch(c, k, "sand", .55);
    });
    Object.keys(B.WOODS).forEach(function (k) {
      var b = document.createElement("button"); b.type = "button"; b.dataset.w = k;
      var i = document.createElement("i"); i.style.setProperty("--sw", swColor(k)); b.appendChild(i);
      b.appendChild(document.createTextNode(B.WOODS[k].n.replace("Eiche ", "").replace(" geölt", "")));
      b.setAttribute("aria-label", B.WOODS[k].n);
      b.addEventListener("click", function () { state.wood = k; renderPlan(); });
      woods.appendChild(b);
    });
  }

  // Flächenrechner
  var rL = $("#rL"), rB = $("#rB"), cPat = $("#cPat"), cSw = $("#cSw"), lastSw = "";
  function fillRange(r) { r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min) * 100) + "%"); }
  function syncPatButtons() { if (cPat) [].forEach.call(cPat.children, function (b) { b.setAttribute("aria-pressed", b.dataset.p === state.pat); }); }
  function round50(n) { return Math.round(n / 50) * 50; }
  function calc() {
    if (!rL) return;
    var L = +rL.value, W = +rB.value, A = L * W, p = PATS[state.pat], m = MULT[state.wood];
    var mat = A * (1 + p.cut / 100), packs = Math.ceil(mat / 2.1), sock = 2 * (L + W) - .9;
    var extra = ($("#oAlt").checked ? 9 : 0) + ($("#oAus").checked ? 12 : 0);
    var sk = $("#oSock").checked ? sock * 16 : 0;
    var lo = mat * p.lo * m + A * extra + sk, hi = mat * p.hi * m + A * extra + sk;
    $("#oL").textContent = de(L, 1) + " m"; $("#oB").textContent = de(W, 1) + " m";
    fillRange(rL); fillRange(rB);
    $("#rA").textContent = de(A, 1) + " m²";
    $("#rM").textContent = de(packs * 2.1, 1) + " m²";
    $("#rPk").textContent = de(packs);
    $("#rS").textContent = $("#oSock").checked ? de(Math.ceil(sock)) + " m" : "–";
    $("#rP").textContent = "€ " + de(round50(lo)) + " – " + de(round50(hi));
    $("#cName").textContent = p.n + " · " + p.cut + " % Verschnitt";
    $("#cWood").textContent = B.WOODS[state.wood].n;
    var key = state.pat + state.wood;
    if (cSw && key !== lastSw) { lastSw = key; swatch(cSw, state.pat, state.wood, .6); }
  }
  if (rL) {
    Object.keys(PATS).forEach(function (k) {
      var b = document.createElement("button"); b.type = "button"; b.dataset.p = k; b.textContent = PATS[k].n;
      b.addEventListener("click", function () { state.pat = k; renderPlan(); syncPatButtons(); });
      cPat.appendChild(b);
    });
    [rL, rB].forEach(function (r) { r.addEventListener("input", calc); });
    ["#oAlt", "#oAus", "#oSock"].forEach(function (s) { $(s).addEventListener("change", calc); });
  }
  if (pats) { renderPlan(); syncPatButtons(); }

  // Verlegen beim Scrollen: Estrich → Kleber → Fischgrät Stab für Stab → Schleifen → Ölen
  var lay = $("#verlegen"), cv = $("#layc");
  if (lay && cv) {
    var ctx = cv.getContext("2d"), S = cv.width, U = 1.15;
    var tex = B.texture("fisch", "sand", S, S, U);
    var list = tex.boards.slice().sort(function (a, b) {
      var da = Math.hypot(a.cx - S / 2, a.cy - S * .55), db = Math.hypot(b.cx - S / 2, b.cy - S * .55);
      return da - db;
    });
    // Estrich mit Körnung
    var est = document.createElement("canvas"); est.width = est.height = S;
    (function () {
      var e = est.getContext("2d"), r = Math.random; e.fillStyle = "#a9a59d"; e.fillRect(0, 0, S, S);
      for (var i = 0; i < 9000; i++) { var g = 130 + r() * 70 | 0; e.fillStyle = "rgba(" + g + "," + (g - 3) + "," + (g - 8) + "," + (.25 + r() * .35).toFixed(2) + ")"; e.fillRect(r() * S, r() * S, 1 + r() * 2.4, 1 + r() * 2.4); }
      e.strokeStyle = "rgba(80,76,70,.25)"; e.lineWidth = 1.4; e.beginPath(); e.moveTo(S * .62, 0); e.lineTo(S * .58, S * .4); e.lineTo(S * .66, S); e.stroke();
    })();
    // Kleberbett mit Zahnspachtel-Riefen
    var kl = document.createElement("canvas"); kl.width = kl.height = S;
    (function () {
      var k = kl.getContext("2d"); k.fillStyle = "#857c6d"; k.fillRect(0, 0, S, S);
      for (var y = -S; y < S * 2; y += 11) {
        k.beginPath(); for (var x = 0; x <= S; x += 20) { var yy = y + x * .35 + Math.sin(x / 70 + y) * 3; if (!x) k.moveTo(x, yy); else k.lineTo(x, yy); }
        k.strokeStyle = "rgba(60,54,45,.38)"; k.lineWidth = 2.4; k.stroke();
        k.strokeStyle = "rgba(170,160,142,.35)"; k.lineWidth = 1.2; k.translate(0, 3); k.stroke(); k.translate(0, -3);
      }
    })();
    var steps = [].slice.call(document.querySelectorAll("#lsteps li")), lnow = $("#lnow"), lprog = $("#lprog"), meter = $("#meter"), cm = $("#cm"), cmok = $("#cmok");
    var EDGE = [0, .16, .3, .78, .89, 1];
    var lastStep = -1, lastP = -1;
    var ease = function (t) { return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t); };
    var seg = function (p, i) { return Math.max(0, Math.min(1, (p - EDGE[i]) / (EDGE[i + 1] - EDGE[i]))); };

    function draw(p) {
      ctx.clearRect(0, 0, S, S);
      ctx.drawImage(est, 0, 0);
      // Kleber wird diagonal aufgezogen
      var k = seg(p, 1);
      if (k > 0) {
        var reach = ease(k) * S * 2.1;
        ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(reach, 0); ctx.lineTo(reach - S * 1.05, S); ctx.lineTo(0, S); ctx.closePath(); ctx.clip();
        ctx.drawImage(kl, 0, 0); ctx.restore();
        if (k < 1) { // Spachtel an der Kante
          var ey = Math.max(S * .15, Math.min(S * .85, (reach - S * .55) / 1.05)), ex = reach - 1.05 * ey;
          ctx.save(); ctx.translate(ex, ey); ctx.rotate(Math.atan2(S, -S * 1.05) + Math.PI);
          ctx.fillStyle = "rgba(30,30,28,.25)"; ctx.fillRect(-160, 6, 320, 10);
          ctx.fillStyle = "#c7ccd0"; ctx.fillRect(-150, -6, 300, 12); ctx.fillStyle = "#3a3d40"; ctx.fillRect(-40, -34, 80, 26); ctx.restore();
        }
      }
      // Stäbe
      var l = seg(p, 2), n = Math.round(ease(l) * list.length);
      if (n > 0) {
        ctx.save(); ctx.beginPath();
        for (var i = 0; i < n; i++) { var q = list[i].p; ctx.moveTo(q[0][0], q[0][1]); for (var j = 1; j < 4; j++) ctx.lineTo(q[j][0], q[j][1]); ctx.closePath(); }
        ctx.clip(); ctx.drawImage(tex.canvas, 0, 0);
        // rohes, ungeschliffenes Holz: matter Grauschleier, der beim Schleifen verschwindet
        var sd = seg(p, 3), sx = ease(sd) * (S + 240) - 120;
        ctx.fillStyle = "rgba(205,200,190,.32)"; ctx.fillRect(Math.max(0, sx), 0, S, S);
        ctx.restore();
        // gerade gelegter Stab mit Schatten
        if (l > 0 && l < 1 && n < list.length) {
          var nb = list[n], f = (ease(l) * list.length) % 1;
          ctx.save(); ctx.translate(0, -18 * (1 - f)); ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 18; ctx.shadowOffsetY = 12 * (1 - f) + 4;
          B.path(ctx, nb.p); ctx.fillStyle = "#d8b98f"; ctx.fill(); ctx.restore();
          ctx.save(); ctx.translate(0, -18 * (1 - f)); B.path(ctx, nb.p); ctx.clip(); ctx.drawImage(tex.canvas, 0, 0); ctx.restore();
        }
        if (sd > 0 && sd < 1) { // Schleifband
          var g = ctx.createLinearGradient(sx - 110, 0, sx + 30, 0);
          g.addColorStop(0, "rgba(255,248,232,0)"); g.addColorStop(.75, "rgba(255,248,232,.5)"); g.addColorStop(1, "rgba(255,248,232,0)");
          ctx.fillStyle = g; ctx.fillRect(sx - 110, 0, 140, S);
          for (var d = 0; d < 26; d++) { ctx.fillStyle = "rgba(240,226,200," + (.25 + Math.random() * .3).toFixed(2) + ")"; ctx.fillRect(sx + Math.random() * 60, Math.random() * S, 2, 2); }
        }
        var o = seg(p, 4);
        if (o > 0) { // Öl: wärmer und mit Glanz, von oben nach unten
          var oy = ease(o) * (S + 200) - 100;
          ctx.save(); ctx.beginPath(); ctx.rect(0, 0, S, Math.max(0, oy)); ctx.clip();
          ctx.globalCompositeOperation = "multiply"; ctx.fillStyle = "rgba(214,160,104,.42)"; ctx.fillRect(0, 0, S, S);
          ctx.globalCompositeOperation = "source-over";
          var gl = ctx.createRadialGradient(S * .7, S * .22, 10, S * .7, S * .22, S * .75);
          gl.addColorStop(0, "rgba(255,244,220,.38)"); gl.addColorStop(1, "rgba(255,244,220,0)");
          ctx.fillStyle = gl; ctx.fillRect(0, 0, S, S); ctx.restore();
          if (o < 1) { ctx.fillStyle = "rgba(255,236,200,.35)"; ctx.fillRect(0, oy - 6, S, 12); }
        }
      }
      // Estrich-Feuchte
      var e0 = seg(p, 0);
      meter.classList.toggle("on", p < EDGE[1] + .02);
      var v = 3.4 - 1.6 * ease(e0 / .9);
      cm.textContent = de(v, 1) + " %";
      cmok.textContent = e0 > .9 ? "unter 2 % · bereit ✓" : "CM-Messung läuft …";
    }

    function update() {
      var r = lay.getBoundingClientRect(), total = lay.offsetHeight - (innerHeight - 0);
      var p = reduce ? 1 : Math.max(0, Math.min(1, -r.top / Math.max(1, total * .92)));
      if (Math.abs(p - lastP) < .0004) return; lastP = p;
      draw(p);
      var st = 0; for (var i = 1; i < 5; i++) if (p >= EDGE[i]) st = i;
      if (st !== lastStep) {
        lastStep = st;
        steps.forEach(function (li, i) { li.classList.toggle("on", i === st); });
        if (lnow) lnow.innerHTML = "<b>" + steps[st].querySelector("span").textContent + ":</b> " + steps[st].querySelector("small").textContent;
      }
      lprog.style.transform = "scaleX(" + p.toFixed(3) + ")";
    }
    var tick = false;
    addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; update(); }); } }, { passive: true });
    addEventListener("resize", update);
    update();
  }

  // Formular (Beispiel)
  var form = $("#form"), f = $("#f");
  if (f) f.addEventListener("change", function () { $("#fname").textContent = f.files.length ? f.files.length + (f.files.length === 1 ? " Foto gewählt" : " Fotos gewählt") : "Fotos vom Raum anhängen"; });
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); $("#msg").classList.add("show"); });
})();
