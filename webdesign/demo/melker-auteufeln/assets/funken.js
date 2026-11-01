/* Melker Au-Teufel'n · Krampuskopf aus Funken. Eigene Form, eigenes WebGL1, ohne Bibliothek.
   Die Funken weichen Maus und Finger aus und fließen zurück. Läuft nur, solange der Abschnitt sichtbar ist. */
(function () {
  "use strict";
  var d = document, w = window;
  var buehne = d.getElementById("funken"), bild = buehne && buehne.querySelector(".funken__bild");
  if (!buehne || !bild) return;
  if (w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* ---------- Die Form: Kopf mit Hörnern, Fellkragen, Zunge. Einheiten 600 × 700, rechte Hälfte wird gespiegelt ---------- */
  var FW = 600, FH = 700;
  var ZUNGE = "M286 530 C280 568 300 592 296 624 C293 650 306 678 324 670 C335 664 327 647 323 628 C318 598 318 564 316 530 Z";
  var AUGE = "M314 404 L352 384 L388 372 L376 406 L346 416 Z";
  function zufall(n) { return function () { n = (n * 16807) % 2147483647; return n / 2147483647; }; }
  function kopf() {
    /* Schädel mit Haarbüschel, Ohr, dann zottiges Fell über Wangen und Schultern (Büschel aus einem festen Zufall) */
    var r = zufall(11), s = "M300 246 L309 226 L320 246 L334 230 L345 254 C360 258 372 263 383 271 C404 288 419 310 425 340 Q480 318 530 305 Q494 352 436 390";
    var fuehrung = [[436, 390], [442, 432], [432, 472], [416, 508], [400, 546], [452, 584], [512, 616], [568, 648], [604, 690]];
    for (var i = 0; i < fuehrung.length - 1; i++) {
      var A = fuehrung[i], B = fuehrung[i + 1], dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy), k = Math.max(1, Math.round(l / 22));
      var tx = dx / l, ty = dy / l, nx = ty, ny = -tx;
      if (i === 3) { nx = .3; ny = .4; }
      for (var j = 0; j < k; j++) {
        var x0 = A[0] + dx * j / k, y0 = A[1] + dy * j / k, x1 = A[0] + dx * (j + 1) / k, y1 = A[1] + dy * (j + 1) / k;
        var mx = (x0 + x1) / 2, my = (y0 + y1) / 2, lang = 14 + r() * 16, sl = l / k;
        var sx = mx + nx * lang + tx * sl * .45, sy = my + ny * lang + ty * sl * .45 + lang * .35;
        s += " Q" + (mx + nx * lang * .25 - tx * sl * .2).toFixed(1) + " " + (my + ny * lang * .25 - ty * sl * .2).toFixed(1) + " " + sx.toFixed(1) + " " + sy.toFixed(1);
        s += " Q" + (mx + nx * lang * .1 + tx * sl * .3).toFixed(1) + " " + (my + ny * lang * .1 + ty * sl * .3).toFixed(1) + " " + x1.toFixed(1) + " " + y1.toFixed(1);
      }
    }
    return s + " L604 700 L300 700 Z";
  }

  function horn() {
    /* Hornspitze als gebogene Mittellinie, Breite nimmt zur Spitze ab; Kerben an der Außenseite */
    var P = [[378, 288], [484, 248], [548, 120], [474, 16]], innen = [], aussen = [], kerben = [];
    function bez(t, k) { var u = 1 - t; return u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k]; }
    for (var i = 0; i <= 40; i++) {
      var t = i / 40, x = bez(t, 0), y = bez(t, 1), t2 = Math.min(1, t + .01), t1 = Math.max(0, t - .01);
      var tx = bez(t2, 0) - bez(t1, 0), ty = bez(t2, 1) - bez(t1, 1), l = Math.hypot(tx, ty) || 1;
      var nx = -ty / l, ny = tx / l, b = 33 * Math.pow(1 - t, .8) + 1.5;
      innen.push([x - nx * b, y - ny * b]); aussen.push([x + nx * b, y + ny * b]);
      if (i > 4 && i < 34 && i % 4 === 0) kerben.push([x - nx * b * 1.3, y - ny * b * 1.3, x + nx * b * 1.3, y + ny * b * 1.3]);
    }
    return { rand: aussen.concat(innen.reverse()), kerben: kerben };
  }

  function haelfte(ctx, gespiegelt) {
    ctx.save();
    if (gespiegelt) { ctx.translate(FW, 0); ctx.scale(-1, 1); }
    ctx.fillStyle = "#fff"; ctx.strokeStyle = "#fff"; ctx.lineCap = "round";
    ctx.globalCompositeOperation = "source-over";
    ctx.fill(new Path2D(kopf()));
    var h = horn(), p = new Path2D();
    h.rand.forEach(function (q, i) { if (i) p.lineTo(q[0], q[1]); else p.moveTo(q[0], q[1]); });
    p.closePath(); ctx.fill(p);
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 4.5;
    h.kerben.forEach(function (k) { ctx.beginPath(); ctx.moveTo(k[0], k[1]); ctx.lineTo(k[2], k[3]); ctx.stroke(); });
    /* Augen schräg und böse, darüber die Braue */
    ctx.fill(new Path2D(AUGE));
    ctx.lineWidth = 8; ctx.stroke(new Path2D("M304 372 Q346 344 402 350"));
    /* Nüstern, Maul mit Lefzen */
    ctx.fill(new Path2D("M306 468 Q318 454 330 470 Q320 484 306 476 Z"));
    ctx.fill(new Path2D("M300 498 L364 490 Q356 530 300 560 Z"));
    ctx.lineWidth = 7; ctx.stroke(new Path2D("M386 552 Q354 594 322 602"));
    ctx.globalCompositeOperation = "source-over";
    /* Reißzähne */
    ctx.fill(new Path2D("M316 497 L338 495 L328 536 Z"));
    ctx.fill(new Path2D("M344 494 L356 492 L351 514 Z"));
    ctx.restore();
  }

  function form(s) {
    var c = d.createElement("canvas"); c.width = Math.round(FW * s); c.height = Math.round(FH * s);
    var ctx = c.getContext("2d", { willReadFrequently: true }); ctx.scale(s, s);
    haelfte(ctx, false); haelfte(ctx, true);
    var z = new Path2D(ZUNGE);
    ctx.globalCompositeOperation = "destination-out"; ctx.lineWidth = 10; ctx.stroke(z);
    ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = "#fff"; ctx.fill(z);
    var zc = d.createElement("canvas"); zc.width = c.width; zc.height = c.height;
    var zx = zc.getContext("2d", { willReadFrequently: true }); zx.scale(s, s); zx.fillStyle = "#fff"; zx.fill(z);
    var ac = d.createElement("canvas"); ac.width = c.width; ac.height = c.height;
    var ax = ac.getContext("2d", { willReadFrequently: true }); ax.scale(s, s); ax.fillStyle = "#fff";
    ax.fill(new Path2D(AUGE));
    ax.translate(FW, 0); ax.scale(-1, 1); ax.fill(new Path2D(AUGE));
    return { c: c, w: c.width, h: c.height, m: ctx.getImageData(0, 0, c.width, c.height).data,
      zunge: zx.getImageData(0, 0, c.width, c.height).data, augen: ax.getImageData(0, 0, c.width, c.height).data };
  }

  /* ---------- Funken auf der Form verteilen ---------- */
  var handy = Math.min(w.innerWidth, w.screen ? w.screen.width : 9999) < 760;
  var N = handy ? 5200 : 11000, NS = handy ? 90 : 170, ALLE = N + NS;
  function verteilen() {
    var f = form(.5), W = f.w, H = f.h, m = f.m;
    function a(x, y) { return x < 0 || y < 0 || x >= W || y >= H ? 0 : m[(y * W + x) * 4 + 3]; }
    var hu = new Float32Array(N), hv = new Float32Array(N), temp = new Float32Array(N), n = 0, augen = Math.round(N * .018), versuche = 0;
    /* Augen: wenige, heiße Funken in den Augenhöhlen */
    while (n < augen && versuche++ < 2e5) {
      var x = Math.random() * W | 0, y = Math.random() * H | 0;
      if (!f.augen[(y * W + x) * 4 + 3]) continue;
      hu[n] = (x + Math.random()) / W; hv[n] = (y + Math.random()) / H; temp[n] = 1; n++;
    }
    versuche = 0;
    while (n < N && versuche++ < 4e6) {
      x = Math.random() * W; y = Math.random() * H;
      var xi = x | 0, yi = y | 0;
      if (a(xi, yi) < 128) continue;
      var rand = a(xi + 3, yi) < 128 || a(xi - 3, yi) < 128 || a(xi, yi + 3) < 128 || a(xi, yi - 3) < 128;
      var unten = yi / H > .84 ? 1 - (yi / H - .84) / .16 : 1; /* unten löst sich der Kragen ins Dunkel auf */
      var zunge = f.zunge[(yi * W + xi) * 4 + 3] > 128;
      if (Math.random() > (rand || zunge ? 1 : .3) * unten) continue;
      hu[n] = x / W; hv[n] = y / H;
      temp[n] = zunge ? .2 : rand ? .55 + Math.random() * .4 : .04 + Math.random() * .3;
      n++;
    }
    for (; n < N; n++) { hu[n] = .5; hv[n] = .5; temp[n] = 0; }
    return { hu: hu, hv: hv, temp: temp };
  }

  /* ---------- WebGL ---------- */
  var cv = d.createElement("canvas");
  cv.className = "funken__cv"; cv.setAttribute("aria-hidden", "true");
  var opt = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: "low-power" };
  var gl = cv.getContext("webgl", opt) || cv.getContext("experimental-webgl", opt);
  if (!gl) return;

  function shader(typ, src) {
    var s = gl.createShader(typ); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function programm(vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, shader(gl.VERTEX_SHADER, vs)); gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }
  var pFunke, pGrund;
  try {
    pFunke = programm(
      "attribute vec4 aD;attribute vec3 aS;uniform vec2 uR;uniform float uP,uT;varying vec3 vC;varying float vA;" +
      "void main(){vec2 p=aD.xy/uR*2.-1.;gl_Position=vec4(p.x,-p.y,0.,1.);" +
      "float h=clamp(aS.z+aD.w,0.,1.);" +
      "float fl=.72+.28*sin(uT*(1.6+aS.x*4.)+aS.x*61.);" +
      "gl_PointSize=aS.y*uP*(1.+aD.w*.5);" +
      "vec3 c=mix(vec3(.62,.06,.03),vec3(.95,.27,.07),smoothstep(0.,.35,h));" +
      "c=mix(c,vec3(1.,.6,.22),smoothstep(.35,.7,h));c=mix(c,vec3(1.,.92,.7),smoothstep(.75,1.,h));" +
      "vC=c;vA=aD.z*fl*(.3+1.1*h);}",
      "precision mediump float;varying vec3 vC;varying float vA;" +
      "void main(){vec2 q=gl_PointCoord-.5;float r=dot(q,q)*4.;if(r>1.)discard;" +
      "float a=(1.-r);a*=a;gl_FragColor=vec4(vC*vA*a,1.);}"
    );
    pGrund = programm(
      "attribute vec2 aP;varying vec2 v;void main(){v=aP;gl_Position=vec4(aP,0.,1.);}",
      "precision mediump float;varying vec2 v;uniform vec2 uR;uniform vec4 uF;uniform vec3 uM;" +
      "void main(){vec2 px=vec2((v.x+1.)*.5*uR.x,(1.-v.y)*.5*uR.y);" +
      "vec2 q=(px-uF.xy)/uF.zw;float g=max(0.,1.-length(q*vec2(1.,.9)));g=g*g*(3.-2.*g);" +
      "float m=max(0.,1.-length(px-uM.xy)/(uF.w*.35));m=m*m*uM.z;" +
      "vec3 c=vec3(.047,.031,.024)+vec3(.16,.035,.015)*g*.55+vec3(.25,.08,.02)*m*g;" +
      "gl_FragColor=vec4(c,1.);}"
    );
  } catch (e) { return; }

  var lage = verteilen();
  var dyn = new Float32Array(ALLE * 4), stat = new Float32Array(ALLE * 3);
  var vx = new Float32Array(ALLE), vy = new Float32Array(ALLE), hx = new Float32Array(N), hy = new Float32Array(N);
  var leben = new Float32Array(NS), alter = new Float32Array(NS);
  for (var i = 0; i < ALLE; i++) {
    var funke = i >= N;
    stat[i * 3] = Math.random();
    stat[i * 3 + 1] = funke ? 1.6 + Math.random() * 1.6 : (lage.temp[i] === 1 ? 2.6 : 1.5 + Math.random() * Math.random() * 2.6);
    stat[i * 3 + 2] = funke ? .8 : lage.temp[i];
  }
  for (i = 0; i < NS; i++) { leben[i] = 1; alter[i] = 1 + Math.random(); }

  var bD = gl.createBuffer(), bS = gl.createBuffer(), bQ = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bS); gl.bufferData(gl.ARRAY_BUFFER, stat, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, bD); gl.bufferData(gl.ARRAY_BUFFER, dyn, gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, bQ); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var L = {
    aD: gl.getAttribLocation(pFunke, "aD"), aS: gl.getAttribLocation(pFunke, "aS"),
    uR: gl.getUniformLocation(pFunke, "uR"), uP: gl.getUniformLocation(pFunke, "uP"), uT: gl.getUniformLocation(pFunke, "uT"),
    aP: gl.getAttribLocation(pGrund, "aP"), gR: gl.getUniformLocation(pGrund, "uR"), gF: gl.getUniformLocation(pGrund, "uF"), gM: gl.getUniformLocation(pGrund, "uM")
  };

  /* ---------- Größe und Lage ---------- */
  var BW = 1, BH = 1, dpr = 1, fig = { x: 0, y: 0, w: 1, h: 1 }, start = true;
  function messen() {
    var r = buehne.getBoundingClientRect(), b = bild.getBoundingClientRect();
    BW = Math.max(1, r.width); BH = Math.max(1, r.height);
    dpr = Math.min(w.devicePixelRatio || 1, 2);
    if (BW * BH * dpr * dpr > 3.2e6) dpr = Math.sqrt(3.2e6 / (BW * BH));
    cv.width = Math.round(BW * dpr); cv.height = Math.round(BH * dpr);
    var alt = fig;
    fig = { x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height };
    for (var i = 0; i < N; i++) {
      var nx = fig.x + lage.hu[i] * fig.w, ny = fig.y + lage.hv[i] * fig.h;
      if (start) {
        /* Erster Auftritt: die Funken steigen aus der Glut unten auf und finden ihre Form */
        var a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random());
        dyn[i * 4] = fig.x + fig.w * (.5 + Math.cos(a) * rr * .7);
        dyn[i * 4 + 1] = fig.y + fig.h * (1.05 + Math.sin(a) * rr * .25);
        dyn[i * 4 + 2] = 0;
      } else if (alt.w > 1) {
        dyn[i * 4] += nx - hx[i]; dyn[i * 4 + 1] += ny - hy[i];
      }
      hx[i] = nx; hy[i] = ny;
    }
    start = false;
    gl.viewport(0, 0, cv.width, cv.height);
  }

  /* ---------- Maus und Finger ---------- */
  var zeiger = { x: -1e4, y: -1e4, da: false, zuletzt: 0 }, mx = -1e4, my = -1e4, mStark = 0;
  function setzen(cx, cy) {
    var r = buehne.getBoundingClientRect();
    zeiger.x = cx - r.left; zeiger.y = cy - r.top; zeiger.da = true; zeiger.zuletzt = performance.now();
    if (mx < -1e3) { mx = zeiger.x; my = zeiger.y; }
    wecken();
  }
  buehne.addEventListener("pointermove", function (e) { setzen(e.clientX, e.clientY); }, { passive: true });
  buehne.addEventListener("pointerdown", function (e) { setzen(e.clientX, e.clientY); }, { passive: true });
  buehne.addEventListener("touchmove", function (e) { var t = e.touches[0]; if (t) setzen(t.clientX, t.clientY); }, { passive: true });
  buehne.addEventListener("pointerleave", function () { zeiger.da = false; }, { passive: true });
  buehne.addEventListener("touchend", function () { zeiger.da = false; }, { passive: true });

  /* ---------- Bewegung ---------- */
  var zeit = 0, einlauf = 0;
  function funkeNeu(k) {
    var j = (Math.random() * N) | 0;
    if (lage.hv[j] > .62 && Math.random() < .7) j = (Math.random() * N) | 0;
    var i = N + k;
    dyn[i * 4] = dyn[j * 4] + (Math.random() - .5) * 6; dyn[i * 4 + 1] = dyn[j * 4 + 1];
    vx[i] = (Math.random() - .5) * 20; vy[i] = -(25 + Math.random() * 55) * fig.h / 600;
    leben[k] = 1.6 + Math.random() * 2.4; alter[k] = 0;
  }
  function schritt(dt) {
    zeit += dt; einlauf = Math.min(1, einlauf + dt / 2.6);
    var e = einlauf * einlauf * (3 - 2 * einlauf);
    var k = 6 + 34 * e, daempf = Math.exp(-dt * (2.6 + 2 * (1 - e))), R = Math.max(54, fig.h * .14), R2 = R * R;
    var kraft = 5200 * fig.h / 600;
    mStark += ((zeiger.da ? 1 : 0) - mStark) * Math.min(1, dt * 6);
    mx += (zeiger.x - mx) * Math.min(1, dt * 18); my += (zeiger.y - my) * Math.min(1, dt * 18);
    if (!zeiger.da && mStark < .01) { mx = -1e4; my = -1e4; }
    var zx = mx, zy = my, st = mStark;
    for (var i = 0; i < N; i++) {
      var o = i * 4, x = dyn[o], y = dyn[o + 1];
      var s = stat[i * 3];
      var tx = hx[i] + Math.sin(zeit * (.7 + s) + s * 40) * .9, ty = hy[i] + Math.cos(zeit * (.6 + s) + s * 23) * .9;
      var ax = (tx - x) * k, ay = (ty - y) * k;
      var rx = x - zx, ry = y - zy, d2 = rx * rx + ry * ry;
      if (d2 < R2 && st > 0) {
        var dd = Math.sqrt(d2) + .01, f = 1 - dd / R;
        f = f * f * kraft * st;
        ax += (rx / dd + -ry / dd * .35) * f; ay += (ry / dd + rx / dd * .35) * f;
        dyn[o + 3] = Math.min(1, dyn[o + 3] + f * dt * .0009);
      }
      vx[i] = (vx[i] + ax * dt) * daempf; vy[i] = (vy[i] + ay * dt) * daempf;
      dyn[o] = x + vx[i] * dt; dyn[o + 1] = y + vy[i] * dt;
      dyn[o + 3] *= Math.exp(-dt * 1.4);
      dyn[o + 2] = e;
    }
    for (var j = 0; j < NS; j++) {
      i = N + j; o = i * 4;
      alter[j] += dt;
      if (alter[j] >= leben[j]) { if (einlauf >= 1) funkeNeu(j); else { dyn[o + 2] = 0; continue; } }
      var p = alter[j] / leben[j];
      vx[i] += Math.sin(zeit * 2.3 + stat[i * 3] * 30) * 40 * dt;
      vx[i] *= Math.exp(-dt * 1.2);
      vy[i] *= Math.exp(-dt * .25);
      dyn[o] += vx[i] * dt; dyn[o + 1] += vy[i] * dt;
      dyn[o + 2] = Math.sin(Math.PI * p) * .9; dyn[o + 3] = .5 * (1 - p);
    }
  }

  function malen() {
    gl.disable(gl.BLEND);
    gl.useProgram(pGrund);
    gl.bindBuffer(gl.ARRAY_BUFFER, bQ);
    gl.enableVertexAttribArray(L.aP); gl.vertexAttribPointer(L.aP, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(L.gR, BW, BH);
    gl.uniform4f(L.gF, fig.x + fig.w / 2, fig.y + fig.h * .48, fig.w * .62, fig.h * .5);
    gl.uniform3f(L.gM, mx, my, mStark);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.disableVertexAttribArray(L.aP);

    gl.useProgram(pFunke);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    gl.bindBuffer(gl.ARRAY_BUFFER, bD); gl.bufferSubData(gl.ARRAY_BUFFER, 0, dyn);
    gl.enableVertexAttribArray(L.aD); gl.vertexAttribPointer(L.aD, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bS);
    gl.enableVertexAttribArray(L.aS); gl.vertexAttribPointer(L.aS, 3, gl.FLOAT, false, 0, 0);
    gl.uniform2f(L.uR, BW, BH); gl.uniform1f(L.uP, dpr * Math.max(.8, Math.min(1.3, fig.h / 620))); gl.uniform1f(L.uT, zeit);
    gl.drawArrays(gl.POINTS, 0, ALLE);
    gl.disableVertexAttribArray(L.aD); gl.disableVertexAttribArray(L.aS);
  }

  /* ---------- Steuerung: nur sichtbar, nur im Vordergrund ---------- */
  var laeuft = false, sichtbar = false, vorher = 0, raf = 0, bereit = false;
  function bild1() {
    if (!laeuft) return;
    var jetzt = performance.now(), dt = vorher ? Math.min(.033, (jetzt - vorher) / 1000) : .016;
    vorher = jetzt;
    schritt(dt); malen();
    if (!bereit) { bereit = true; buehne.classList.add("is-live"); }
    raf = requestAnimationFrame(bild1);
  }
  function steuern() {
    var soll = sichtbar && !d.hidden;
    if (soll && !laeuft) { laeuft = true; vorher = 0; raf = requestAnimationFrame(bild1); }
    else if (!soll && laeuft) { laeuft = false; cancelAnimationFrame(raf); }
  }
  function wecken() { if (sichtbar) steuern(); }

  cv.addEventListener("webglcontextlost", function (e) { e.preventDefault(); laeuft = false; cancelAnimationFrame(raf); buehne.classList.remove("is-live"); });
  buehne.insertBefore(cv, buehne.firstChild);
  messen();
  var rz = 0;
  w.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(messen, 120); });
  if ("IntersectionObserver" in w) {
    new IntersectionObserver(function (es) { sichtbar = es[0].isIntersecting; steuern(); }, { rootMargin: "60px 0px" }).observe(buehne);
  } else { sichtbar = true; steuern(); }
  d.addEventListener("visibilitychange", steuern);
  var hinweis = d.getElementById("funken-hinweis");
  if (hinweis) {
    var maus = w.matchMedia && w.matchMedia("(hover: hover) and (pointer: fine)").matches;
    hinweis.textContent = maus ? "Fahrt mit der Maus durch die Funken." : "Wischt mit dem Finger durch die Funken.";
    hinweis.hidden = false;
  }
})();
