/* Krampaspass · Schriftzug in Glut: Maus oder Finger malen nasse Tinte aufs Pergament,
   darunter glühen die Buchstaben wie Lava und kühlen langsam ab. Eigenes WebGL1, ohne Bibliothek.
   Läuft nur, solange der Abschnitt sichtbar ist; ohne Eingabe zieht eine ruhige Spur selbst darüber. */
(function () {
  "use strict";
  var d = document, w = window;
  var buehne = d.getElementById("glut");
  if (!buehne) return;
  if (w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var cv = d.createElement("canvas");
  cv.className = "glut__cv"; cv.setAttribute("aria-hidden", "true");
  var opt = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power" };
  var gl = cv.getContext("webgl", opt) || cv.getContext("experimental-webgl", opt);
  if (!gl) return;

  var VS = "attribute vec2 aP;varying vec2 v;void main(){v=vec2(aP.x*.5+.5,.5-aP.y*.5);gl_Position=vec4(aP,0.,1.);}";
  var FS = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",
    "varying vec2 v;uniform sampler2D uSim,uMask,uSoft;uniform vec2 uTex;uniform float uT,uAsp;",
    "float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}",
    "float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);",
    " return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+1.),f.x),f.y);}",
    "float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+17.1;a*=.5;}return s;}",
    "vec3 ramp(float t){",
    " vec3 c=mix(vec3(.10,.025,.01),vec3(.55,.07,.03),smoothstep(0.,.3,t));",
    " c=mix(c,vec3(.95,.30,.07),smoothstep(.25,.55,t));",
    " c=mix(c,vec3(1.,.62,.2),smoothstep(.5,.8,t));",
    " return mix(c,vec3(1.,.93,.72),smoothstep(.8,1.,t));}",
    "void main(){",
    " vec2 q=vec2(v.x*uAsp,v.y);",
    " vec4 s=texture2D(uSim,v);",
    " float n=fbm(q*7.);",
    " float ink=s.r,heat=s.g,wet=s.b;",
    /* Tintenrand ausgefranst wie auf Papier */
    " float n2=vn(q*46.);",
    " float iv=ink+(n-.5)*.3+(n2-.5)*.1;",
    " float inkE=smoothstep(.2,.3,iv);",
    " float saum=inkE*(1.-smoothstep(.3,.55,iv));",
    " float ixp=texture2D(uSim,v+vec2(uTex.x,0.)).r,ixm=texture2D(uSim,v-vec2(uTex.x,0.)).r;",
    " float iyp=texture2D(uSim,v+vec2(0.,uTex.y)).r,iym=texture2D(uSim,v-vec2(0.,uTex.y)).r;",
    " vec3 nr=normalize(vec3((ixm-ixp)*2.4,(iym-iyp)*2.4,1.));",
    " float spec=pow(max(dot(nr,normalize(vec3(-.4,-.5,.77))),0.),26.)*wet*inkE;",
    " float m=texture2D(uMask,v).r,soft=texture2D(uSoft,v).r;",
    " float grain=fbm(q*60.);",
    " vec3 inkCol=mix(vec3(.2,.125,.07),vec3(.07,.04,.022),wet)*(.9+.2*grain)*(1.-.45*saum);",
    " float inkA=inkE*mix(.8,.96,max(wet,saum));",
    /* Glut im Buchstaben: Kruste mit Rissen, die mit der Hitze aufbrechen, und leichtes Flackern */
    " float crust=fbm(q*15.+vec2(0.,uT*.12));",
    " float flick=.84+.16*vn(q*4.+vec2(uT*1.3,-uT*2.1));",
    " float T=pow(heat,.6)*(.55+.6*soft)*flick;",
    " float riss=smoothstep(crust*.85-.08,crust*.85+.18,T);",
    " vec3 lava=ramp(clamp(T*mix(.36,1.15,riss),0.,1.));",
    " float e=smoothstep(.03,.28,T);",
    " vec3 gedruckt=vec3(.32,.205,.11)*(.9+.18*grain);",
    " vec3 letter=mix(gedruckt,vec3(.08,.035,.018),inkE);",
    " letter=mix(letter,lava,e);",
    " float la=m*mix(.9,1.,max(e,inkE));",
    " vec3 col=inkCol*inkA;float a=inkA;",
    " col=letter*la+col*(1.-la);a=la+a*(1.-la);",
    " col+=vec3(1.,.88,.7)*spec*.45*(1.-la);",
    /* Schein um heiße Buchstaben, auf der Tinte stärker */
    " float halo=soft*heat*(1.-m)*(.35+.65*inkE)*flick;",
    " col+=vec3(1.,.36,.07)*halo*1.25;a+=halo*.5;",
    " a=clamp(max(a,max(col.r,max(col.g,col.b))),0.,1.);",
    " gl_FragColor=vec4(col,a);}"
  ].join("\n");

  function shader(typ, src) {
    var s = gl.createShader(typ); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  var prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) { return; }
  gl.useProgram(prog);
  var bQ = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bQ); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var aP = gl.getAttribLocation(prog, "aP");
  gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
  var U = {};
  ["uSim", "uMask", "uSoft", "uTex", "uT", "uAsp"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
  function textur(einheit) {
    var t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + einheit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  var tSim = textur(0), tMask = textur(1), tSoft = textur(2);
  gl.uniform1i(U.uSim, 0); gl.uniform1i(U.uMask, 1); gl.uniform1i(U.uSoft, 2);

  /* ---------- Schrift und Raster ---------- */
  var BW = 1, BH = 1, dpr = 1, ZELLE = 6, GW = 1, GH = 1, tinte, hitze, nass, t2, h2, pix, text = { x: 0, y: 0, w: 1, h: 1 };
  var mc = d.createElement("canvas"), sc = d.createElement("canvas");
  function schrift(ctx, cw, ch, unschaerfe) {
    var zeilen = cw / ch < 1.3 ? ["Krampas", "pass"] : ["Krampaspass"];
    var fam = '"Grenze Gotisch", Georgia, serif';
    ctx.font = "400 100px " + fam;
    var breit = 0;
    zeilen.forEach(function (z) { breit = Math.max(breit, ctx.measureText(z).width); });
    var abstand = .84, gr = Math.min(cw * .9 / breit * 100, ch * .8 / (zeilen.length * abstand + .2) );
    ctx.font = "400 " + gr + "px " + fam;
    var m0 = ctx.measureText(zeilen[0]), m1 = ctx.measureText(zeilen[zeilen.length - 1]);
    var auf = m0.actualBoundingBoxAscent || gr * .72, ab = m1.actualBoundingBoxDescent || gr * .2;
    var hoehe = (zeilen.length - 1) * gr * abstand + auf + ab, y0 = (ch - hoehe) / 2 + auf;
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, cw, ch);
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = "#fff";
    if (unschaerfe) {
      ctx.shadowColor = "#fff"; ctx.shadowBlur = unschaerfe; ctx.shadowOffsetX = cw * 2;
      for (var k = 0; k < 2; k++) zeilen.forEach(function (z, i) { ctx.fillText(z, cw / 2 - cw * 2, y0 + i * gr * abstand); });
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0;
    } else {
      zeilen.forEach(function (z, i) { ctx.fillText(z, cw / 2, y0 + i * gr * abstand); });
    }
    var tb = 0;
    zeilen.forEach(function (z) { tb = Math.max(tb, ctx.measureText(z).width); });
    return { x: (cw - tb) / 2, y: y0 - auf, w: tb, h: hoehe };
  }
  function messen() {
    var r = buehne.getBoundingClientRect();
    BW = Math.max(1, r.width); BH = Math.max(1, r.height);
    dpr = Math.min(w.devicePixelRatio || 1, 2);
    if (BW * BH * dpr * dpr > 2.6e6) dpr = Math.sqrt(2.6e6 / (BW * BH));
    cv.width = Math.round(BW * dpr); cv.height = Math.round(BH * dpr);
    gl.viewport(0, 0, cv.width, cv.height);
    mc.width = cv.width; mc.height = cv.height;
    var tt = schrift(mc.getContext("2d"), mc.width, mc.height, 0);
    text = { x: tt.x / dpr, y: tt.y / dpr, w: tt.w / dpr, h: tt.h / dpr };
    sc.width = Math.max(1, Math.round(cv.width / 4)); sc.height = Math.max(1, Math.round(cv.height / 4));
    schrift(sc.getContext("2d"), sc.width, sc.height, Math.max(4, sc.height * .045));
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tMask);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mc);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, tSoft);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sc);
    /* Simulationsraster: etwa 6 Bildpunkte je Zelle, Inhalt bleibt beim Größe-Ändern nicht erhalten */
    ZELLE = Math.max(5, BW / 240);
    GW = Math.max(8, Math.round(BW / ZELLE)); GH = Math.max(8, Math.round(BH / ZELLE));
    tinte = new Float32Array(GW * GH); hitze = new Float32Array(GW * GH); nass = new Float32Array(GW * GH);
    t2 = new Float32Array(GW * GH); h2 = new Float32Array(GW * GH); pix = new Uint8Array(GW * GH * 4);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tSim);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, GW, GH, 0, gl.RGBA, gl.UNSIGNED_BYTE, pix);
    gl.uniform2f(U.uTex, 1 / GW, 1 / GH); gl.uniform1f(U.uAsp, BW / BH);
  }

  /* ---------- Malen ---------- */
  function tupfen(x, y, r, st) {
    var gx = x / ZELLE, gy = y / ZELLE, gr = r / ZELLE, g2 = gr * gr;
    var x0 = Math.max(0, Math.floor(gx - gr)), x1 = Math.min(GW - 1, Math.ceil(gx + gr));
    var y0 = Math.max(0, Math.floor(gy - gr)), y1 = Math.min(GH - 1, Math.ceil(gy + gr));
    for (var j = y0; j <= y1; j++) for (var i = x0; i <= x1; i++) {
      var dx = i + .5 - gx, dy = j + .5 - gy, q = (dx * dx + dy * dy) / g2;
      if (q >= 1) continue;
      var f = (1 - q) * (1 - q) * st, k = j * GW + i;
      tinte[k] = Math.min(1, tinte[k] + f * .34);
      hitze[k] = Math.min(1, hitze[k] + f * .5);
      if (f > nass[k]) nass[k] = f;
    }
  }
  function strich(ax, ay, bx, by, r, st) {
    var l = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(l / (r * .3)));
    for (var i = 1; i <= n; i++) tupfen(ax + (bx - ax) * i / n, ay + (by - ay) * i / n, r, st);
  }
  function pinsel() { return Math.max(16, Math.min(46, BH * .075)); }

  var letzt = null, eingabe = 0, autoZeit = 0, autoLetzt = null, autoAn = 0;
  function zeigen(cx, cy) {
    var r = buehne.getBoundingClientRect(), x = cx - r.left, y = cy - r.top;
    var jetzt = performance.now(), r0 = pinsel();
    if (letzt && jetzt - letzt.t < 160) {
      /* schnell gezogen wird der Strich dünner, wie mit der Feder */
      var v = Math.hypot(x - letzt.x, y - letzt.y) / Math.max(8, jetzt - letzt.t);
      var r1 = r0 * Math.max(.5, Math.min(1.12, 1.18 - v * .22));
      letzt.r += (r1 - letzt.r) * .35;
      strich(letzt.x, letzt.y, x, y, letzt.r, 1);
      letzt.x = x; letzt.y = y; letzt.t = jetzt;
    } else {
      tupfen(x, y, r0 * .8, 1);
      letzt = { x: x, y: y, t: jetzt, r: r0 * .8 };
    }
    eingabe = performance.now(); autoLetzt = null;
    if (sichtbar) steuern();
  }
  buehne.addEventListener("pointermove", function (e) { zeigen(e.clientX, e.clientY); }, { passive: true });
  buehne.addEventListener("pointerdown", function (e) { zeigen(e.clientX, e.clientY); }, { passive: true });
  buehne.addEventListener("touchmove", function (e) { var t = e.touches[0]; if (t) zeigen(t.clientX, t.clientY); }, { passive: true });
  buehne.addEventListener("pointerleave", function () { letzt = null; }, { passive: true });
  buehne.addEventListener("touchend", function () { letzt = null; }, { passive: true });

  /* Autopilot: ruhige Schleife über den Schriftzug, solange niemand malt */
  function autopilot(dt) {
    if (performance.now() - eingabe < 2600) { autoAn = 0; return; }
    autoAn = Math.min(1, autoAn + dt / 1.2);
    autoZeit += dt;
    var t = autoZeit, cx = text.x + text.w / 2, cy = text.y + text.h / 2;
    var x = cx + text.w * .47 * Math.sin(t * .34), y = cy + text.h * .36 * Math.sin(t * .83 + 1.1);
    if (autoLetzt) strich(autoLetzt.x, autoLetzt.y, x, y, pinsel() * .8, .55 * autoAn);
    autoLetzt = { x: x, y: y };
  }

  /* ---------- Simulation: Tinte verläuft solange nass, Glut kühlt ab, Tinte trocknet und verblasst ---------- */
  function schritt(dt) {
    var kT = Math.exp(-dt / 7), kH = Math.exp(-dt / 3.2), kN = Math.exp(-dt / 1.3), W = GW, H = GH;
    for (var j = 0; j < H; j++) {
      var o = j * W, oben = j > 0 ? -W : 0, unten = j < H - 1 ? W : 0;
      for (var i = 0; i < W; i++) {
        var k = o + i, l = i > 0 ? -1 : 0, r = i < W - 1 ? 1 : 0;
        var tm = (tinte[k + l] + tinte[k + r] + tinte[k + oben] + tinte[k + unten]) * .25;
        var hm = (hitze[k + l] + hitze[k + r] + hitze[k + oben] + hitze[k + unten]) * .25;
        t2[k] = (tinte[k] + (tm - tinte[k]) * .22 * nass[k]) * (nass[k] > .05 ? 1 : kT);
        h2[k] = (hitze[k] + (hm - hitze[k]) * .12) * kH;
        nass[k] *= kN;
      }
    }
    var a = tinte; tinte = t2; t2 = a; a = hitze; hitze = h2; h2 = a;
    for (k = 0; k < W * H; k++) {
      var p = k * 4;
      pix[p] = tinte[k] * 255; pix[p + 1] = hitze[k] * 255; pix[p + 2] = nass[k] * 255; pix[p + 3] = 255;
    }
  }

  var zeit = 0;
  function malen() {
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tSim);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, GW, GH, gl.RGBA, gl.UNSIGNED_BYTE, pix);
    gl.uniform1f(U.uT, zeit);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /* ---------- Steuerung: nur sichtbar, nur im Vordergrund ---------- */
  var laeuft = false, sichtbar = false, vorher = 0, raf = 0, bereit = false;
  function bild() {
    if (!laeuft) return;
    var jetzt = performance.now(), dt = vorher ? Math.min(.033, (jetzt - vorher) / 1000) : .016;
    vorher = jetzt; zeit += dt;
    autopilot(dt); schritt(dt); malen();
    if (!bereit) { bereit = true; buehne.classList.add("is-live"); }
    raf = requestAnimationFrame(bild);
  }
  function steuern() {
    var soll = sichtbar && !d.hidden;
    if (soll && !laeuft) { laeuft = true; vorher = 0; raf = requestAnimationFrame(bild); }
    else if (!soll && laeuft) { laeuft = false; cancelAnimationFrame(raf); }
  }

  function los() {
    buehne.insertBefore(cv, buehne.firstChild);
    messen();
    eingabe = performance.now() - 2000; /* Autopilot setzt kurz nach dem Sichtbarwerden ein */
    var rz = 0, altB = BW;
    w.addEventListener("resize", function () {
      clearTimeout(rz);
      rz = setTimeout(function () { var r = buehne.getBoundingClientRect(); if (Math.abs(r.width - altB) > 2 || Math.abs(r.height - BH) > 2) { altB = r.width; messen(); } }, 150);
    });
    if ("IntersectionObserver" in w) {
      new IntersectionObserver(function (es) { sichtbar = es[0].isIntersecting; steuern(); }, { rootMargin: "40px 0px" }).observe(buehne);
    } else { sichtbar = true; steuern(); }
    d.addEventListener("visibilitychange", steuern);
    cv.addEventListener("webglcontextlost", function (e) { e.preventDefault(); laeuft = false; sichtbar = false; cancelAnimationFrame(raf); buehne.classList.remove("is-live"); });
    var hinweis = d.getElementById("glut-hinweis");
    if (hinweis) {
      var maus = w.matchMedia && w.matchMedia("(hover: hover) and (pointer: fine)").matches;
      hinweis.textContent = maus ? "Fahrt mit der Maus über die Schrift." : "Wischt mit dem Finger über die Schrift.";
      hinweis.hidden = false;
    }
  }
  /* Erst wenn die gotische Schrift geladen ist, sonst glüht die Ersatzschrift */
  if (d.fonts && d.fonts.load) {
    d.fonts.load('400 100px "Grenze Gotisch"').then(los, los);
  } else { los(); }
})();
