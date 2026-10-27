// Black Edition: TK-Logo zeichnet sich im Kopfbereich der Startseite selbst, wie in der Logo-Animation
// (Konstruktionslinien und Ankerpunkte, dann die Umrisse, die Flächen füllen sich, kurzer 3D-Schwung, dann flach).
// Nur unter html.tk-black sichtbar, ersetzt dort die 3D-Plakette. Läuft einmal, sobald das Logo im Bild ist,
// und beim Einschalten der Black Edition noch einmal. Bei "Bewegung reduzieren" steht das fertige Logo sofort da.
(function () {
  var root = document.documentElement, stage = document.querySelector(".tk-hero .tk-hero__stage");
  if (!stage) return;
  var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var NS = "http://www.w3.org/2000/svg";
  function el(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function pstr(pts) { return pts.map(function (p) { return p.join(","); }).join(" "); }

  // Logo-Umrisse aus tk-badge-2.svg (702 × 358,5)
  var F = {
    T: [[0, .5], [502, .5], [389, 87.5], [286, 87.5], [286, 281.5], [187.5, 354.5], [187.5, 87.5], [104, 87.5]],
    K: [[540, 0], [702, 0], [470, 180.5], [701, 358.5], [540, 358.5], [307, 181.5]]
  };
  function ext(p, q, e) { var dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy); return { x1: p[0] - dx / l * e, y1: p[1] - dy / l * e, x2: q[0] + dx / l * e, y2: q[1] + dy / l * e }; }

  var wrap = document.createElement("div");
  wrap.className = "tk-draw";
  var svg = el("svg", { viewBox: "-150 -120 1002 598", "aria-hidden": "true", focusable: "false" }, wrap);
  var defs = el("defs", {}, svg);
  var gT = el("linearGradient", { id: "tkdT", x1: "0", y1: "0", x2: "1", y2: "1" }, defs);
  el("stop", { offset: "0", "stop-color": "#ffffff" }, gT); el("stop", { offset: "1", "stop-color": "#dcd8d4" }, gT);
  var gK = el("linearGradient", { id: "tkdK", x1: "0", y1: "0", x2: "1", y2: "1" }, defs);
  el("stop", { offset: "0", "stop-color": "#ff7a3d" }, gK); el("stop", { offset: "1", "stop-color": "#ff5a1f" }, gK);
  var blur = el("filter", { id: "tkdGlow", x: "-30%", y: "-30%", width: "160%", height: "160%" }, defs);
  el("feGaussianBlur", { stdDeviation: "26" }, blur);

  var glow = el("g", { filter: "url(#tkdGlow)", opacity: "0" }, svg);
  el("polygon", { points: pstr(F.K), fill: "#ff5a1f" }, glow);
  var cons = el("g", { fill: "none", stroke: "#ffffff", "stroke-width": "2" }, svg);
  var consEls = [
    el("rect", { x: 0, y: 0, width: 702, height: 358.5, opacity: .35 }, cons),
    el("line", { x1: -120, y1: 87.5, x2: 822, y2: 87.5, opacity: .22 }, cons),
    el("line", { x1: -120, y1: 181, x2: 822, y2: 181, opacity: .18 }, cons),
    el("line", { x1: 187.5, y1: -90, x2: 187.5, y2: 450, opacity: .2 }, cons),
    el("line", { x1: 286, y1: -90, x2: 286, y2: 450, opacity: .2 }, cons),
    el("line", Object.assign(ext(F.K[1], F.K[2], 150), { opacity: .3 }), cons),
    el("line", Object.assign(ext(F.K[2], F.K[3], 150), { opacity: .3 }), cons),
    el("circle", { cx: 470, cy: 180.5, r: 150, opacity: .2 }, cons)
  ];
  var faces = {}, outs = {};
  ["T", "K"].forEach(function (k) {
    faces[k] = el("polygon", { points: pstr(F[k]), fill: "url(#tkd" + k + ")", opacity: 0 }, svg);
    outs[k] = el("polygon", { points: pstr(F[k]), fill: "none", stroke: k === "K" ? "#ff7a3d" : "#ffffff", "stroke-width": 3, "stroke-linejoin": "round" }, svg);
  });
  var anch = el("g", {}, svg), anchors = [], handles = [];
  ["T", "K"].forEach(function (k) {
    F[k].forEach(function (p) {
      var g = el("g", { transform: "translate(" + p[0] + "," + p[1] + ")" }, anch);
      el("rect", { x: -7, y: -7, width: 14, height: 14, fill: "#0b0b0c", stroke: "#fff", "stroke-width": 2.5 }, g);
      anchors.push({ g: g, p: p });
    });
  });
  [[F.T[2], [-80, -90], [80, 90]], [F.K[2], [-60, -110], [60, 110]], [F.T[5], [-120, 30], [120, -30]]].forEach(function (h) {
    var g = el("g", { transform: "translate(" + h[0][0] + "," + h[0][1] + ")" }, anch);
    el("line", { x1: h[1][0], y1: h[1][1], x2: h[2][0], y2: h[2][1], stroke: "#ff9a66", "stroke-width": 2 }, g);
    el("circle", { cx: h[1][0], cy: h[1][1], r: 7, fill: "#ff9a66" }, g);
    el("circle", { cx: h[2][0], cy: h[2][1], r: 7, fill: "#ff9a66" }, g);
    handles.push(g);
  });
  // 3D-Teil: T und K als Stapel aus dünnen Ebenen (vorne Verlauf, dahinter dunklere Seitenfarbe), per CSS 3D gedreht
  var D = 30, three = document.createElement("div"), pieces = {};
  three.className = "tk-draw__3d";
  var SIDE = { T: ["#d9d4cf", "#8f8a85"], K: ["#d2470f", "#7d2405"] };
  ["T", "K"].forEach(function (k) {
    var pc = document.createElement("div");
    pc.className = "tk-draw__p";
    for (var i = D; i >= 0; i--) {
      var s = el("svg", { viewBox: "-150 -120 1002 598", "aria-hidden": "true", focusable: "false" });
      var mix = i / D, col = i ? lerpCol(SIDE[k][0], SIDE[k][1], mix) : null;
      if (!i) {
        var d = el("defs", {}, s), g = el("linearGradient", { id: "tkd3" + k, x1: "0", y1: "0", x2: "1", y2: "1" }, d);
        el("stop", { offset: "0", "stop-color": k === "T" ? "#ffffff" : "#ff7a3d" }, g);
        el("stop", { offset: "1", "stop-color": k === "T" ? "#dcd8d4" : "#ff5a1f" }, g);
      }
      el("polygon", { points: pstr(F[k]), fill: i ? col : "url(#tkd3" + k + ")" }, s);
      s.style.transform = "translateZ(" + (-i * .85) + "px)";
      pc.appendChild(s);
    }
    three.appendChild(pc);
    pieces[k] = pc;
  });
  wrap.appendChild(three);
  stage.appendChild(wrap);

  // Längen erst messen, wenn das SVG im Dokument ist
  consEls.concat([outs.T, outs.K]).forEach(function (e) {
    var L = e.getTotalLength ? e.getTotalLength() : 1000;
    e._l = L; e.style.strokeDasharray = L;
  });

  function lerpCol(a, b, x) {
    var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), r = 0;
    for (var sh = 16; sh >= 0; sh -= 8) r = r * 256 + Math.round(((pa >> sh) & 255) * (1 - x) + ((pb >> sh) & 255) * x);
    return "#" + ("00000" + r.toString(16)).slice(-6);
  }
  function cl(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function k01(t, a, b) { return cl((t - a) / (b - a)); }
  function eo(x) { return 1 - Math.pow(1 - x, 3); }
  function eio(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function back(x) { var c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }

  var END = 6.4;
  function frame(t) {
    consEls.forEach(function (e, i) { e.style.strokeDashoffset = e._l * (1 - eo(k01(t, .1 + i * .14, 1.2 + i * .14))); });
    cons.style.opacity = 1 - k01(t, 2.9, 3.6) * .85;
    ["T", "K"].forEach(function (k, i) {
      outs[k].style.strokeDashoffset = outs[k]._l * (1 - eio(k01(t, 1.0 + i * .25, 2.2 + i * .25)));
      outs[k].style.opacity = 1 - k01(t, 2.9, 3.3);
      faces[k].setAttribute("opacity", eo(k01(t, 2.3 + i * .15, 2.9 + i * .15)));
    });
    var q = 1 - k01(t, 2.7, 3.1);
    anchors.forEach(function (a, i) {
      var s = back(k01(t, .8 + i * .06, 1.15 + i * .06));
      a.g.style.opacity = k01(t, .8 + i * .06, .9 + i * .06) * q;
      a.g.setAttribute("transform", "translate(" + a.p[0] + "," + a.p[1] + ") scale(" + s.toFixed(3) + ")");
    });
    handles.forEach(function (h, i) { h.style.opacity = k01(t, 1.5 + i * .2, 1.7 + i * .2) * (1 - k01(t, 2.6, 2.9)); });
    // 3D: kippt nach links, schwingt nach rechts, Teile gehen kurz auseinander, dann flach zurück
    var on3 = t > 3.05 && t < 5.75, r = k01(t, 3.1, 5.7), sw = Math.sin(eio(r) * Math.PI);
    three.style.visibility = on3 ? "visible" : "hidden";
    ["T", "K"].forEach(function (k) { faces[k].style.visibility = on3 ? "hidden" : "visible"; });
    if (on3) {
      var ry = Math.sin(eio(r) * Math.PI * 2) * -42 * (1 - r * .3), rx = sw * 18, sc = 1 + sw * .1, ex = sw * 8;
      three.style.transform = "rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) scale(" + sc.toFixed(3) + ")";
      pieces.T.style.transform = "translate3d(" + (-ex).toFixed(2) + "%,0," + (sw * 18).toFixed(1) + "px)";
      pieces.K.style.transform = "translate3d(" + ex.toFixed(2) + "%,0," + (sw * -10).toFixed(1) + "px)";
    }
    glow.setAttribute("opacity", (eo(k01(t, 5.3, 6.4)) * .45).toFixed(3));
  }

  var raf = 0, t0 = 0;
  function play() {
    cancelAnimationFrame(raf);
    if (reduce) { frame(END); return; }
    t0 = 0;
    var step = function (now) {
      if (!t0) t0 = now;
      var t = (now - t0) / 1000;
      frame(Math.min(t, END));
      if (t < END) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  frame(0);

  var seen = false, black = root.classList.contains("tk-black");
  function maybe() { if (seen && root.classList.contains("tk-black")) play(); }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting && !seen) { seen = true; io.disconnect(); maybe(); }
    }, { threshold: .6 });
    io.observe(wrap);
  } else { seen = true; maybe(); }
  // Black Edition eingeschaltet: noch einmal zeichnen
  new MutationObserver(function () {
    var now = root.classList.contains("tk-black");
    if (now && !black) { frame(0); maybe(); }
    black = now;
  }).observe(root, { attributes: true, attributeFilter: ["class"] });
})();
