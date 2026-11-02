// Startseite, Abschnitt „Unter der Haube“: Freibrennen (eigener Bau, WebGL1 ohne Bibliothek).
// Oben liegt die fertige Beispielseite (röstklang), darunter derselbe Ausschnitt als Bauplan (Quelltext + Drahtrahmen).
// Der Zeiger brennt ein Loch mit glühendem Rand ins obere Bild, nach kurzer Zeit wächst es von außen wieder zu.
// Maske: kleine Textur im Ping-Pong (R = Hitze, G = Haltezeit). Ein Durchgang baut ab und malt die neuen Kreise dazu.
// Läuft nur, solange der Abschnitt sichtbar ist. Ohne WebGL oder bei „Bewegung reduzieren“: Standbild mit fertigem Ausschnitt.
// Handy: Seite scrollt normal (touch-action: pan-y), solange niemand malt, zieht eine „Autopilot“-Glut übers Bild.
(function () {
  var stage = document.querySelector("[data-burn]");
  if (!stage) return;
  var box = stage.closest(".tk-burn") || stage;
  var img = stage.querySelector("img"), src = stage.querySelector("source");
  var mqM = window.matchMedia ? matchMedia("(max-width: 640px)") : null;
  var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  function isM() { return !!(mqM && mqM.matches); }
  function d(k) { return stage.getAttribute("data-" + k + (isM() ? "-m" : "-pc")); }

  // Standbild: vorgefertigter Ausschnitt statt Bewegung
  function still() {
    box.classList.add("is-still");
    box.classList.remove("is-live");
    if (src) src.setAttribute("srcset", stage.getAttribute("data-still-m"));
    img.setAttribute("src", stage.getAttribute("data-still-pc"));
  }
  if (reduce || !window.WebGLRenderingContext || !("IntersectionObserver" in window)) { still(); return; }

  var cv = document.createElement("canvas");
  cv.className = "tk-burn__cv";
  cv.setAttribute("aria-hidden", "true");
  var opts = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: "low-power" };
  var gl = cv.getContext("webgl", opts) || cv.getContext("experimental-webgl", opts);
  if (!gl) { still(); return; }
  var DER = !!gl.getExtension("OES_standard_derivatives");

  // ---------- Shader ----------
  var HP = "#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n";
  var VS = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
  // Maske: erst Haltezeit (G) herunterzählen, dann Hitze (R) abbauen – vom Rand her (Nachbarn) und leicht überall –, dazu bis zu 16 weiche Kreise
  var FS_MASK = HP + [
    "varying vec2 v;uniform sampler2D m;uniform vec3 k;uniform vec2 ts;uniform vec4 sp[16];uniform int n;uniform float ar,rad;",
    "void main(){",
    " vec4 c=texture2D(m,v);",
    " float av=.25*(texture2D(m,v+vec2(ts.x,0.)).r+texture2D(m,v-vec2(ts.x,0.)).r+texture2D(m,v+vec2(0.,ts.y)).r+texture2D(m,v-vec2(0.,ts.y)).r);",
    " float g=max(c.g-k.y,0.);float r=c.r;",
    " if(c.g<=0.){r=mix(r,min(r,av),k.z);r=max(r-k.x,0.);}",     // Rand frisst sich nach innen, dazu leichter Abbau
    " for(int i=0;i<16;i++){if(i>=n)break;",
    "  vec2 q=v-sp[i].xy;q.x*=ar;",
    "  float f=1.-smoothstep(0.,rad*ar*sp[i].w,length(q));",
    "  r+=f*sp[i].z;g+=f*4.;}",
    " gl_FragColor=vec4(min(r,1.),min(g,1.),0.,1.);",
    "}"
  ].join("\n");
  var FS_DRAW = (DER ? "#extension GL_OES_standard_derivatives : enable\n" : "") + HP + [
    "varying vec2 v;uniform sampler2D a,b,m;uniform float t,ar,px;",
    "float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}",
    "float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}",
    "float fb(vec2 p){float s=0.,w=.5;for(int i=0;i<4;i++){s+=w*n(p);p=p*2.03+17.1;w*=.5;}return s;}",
    "void main(){",
    " vec4 mk=texture2D(m,v);float e=mk.r;",
    " vec3 top=texture2D(a,v).rgb;",
    " if(e<.003){gl_FragColor=vec4(top,1.);return;}",
    " vec2 z=vec2(v.x*ar,v.y);",
    " float g=fb(z*6.5+vec2(0.,t*.04));",
    " float x=e+(g-.5)*.6*smoothstep(0.,.3,e)-.5;",              // ausgefranster Rand, 0 = Lochkante
    DER ? " float w=length(vec2(dFdx(x),dFdy(x)))*px+1e-5;" : " float w=.004*px;",
    " float dp=clamp(x/w,-40.,40.);",                              // Abstand zur Kante in CSS-Pixeln (nur nah an der Kante genau)
    " float hole=smoothstep(-.7,.7,dp);",
    " vec3 bot=texture2D(b,v).rgb;",
    " float o=max(-x,0.);",                                        // Abstand außen, in Maskenwerten (glatt)
    " float ch=(1.-hole)*(1.-smoothstep(.0,.1+.12*g,o));",          // verkohlter Saum
    " float sc=(1.-hole)*(1.-smoothstep(.08,.44,o));",              // Versengung weiter außen
    " vec3 c=mix(top,top*vec3(.8,.6,.46),sc*.45);",
    " c=mix(c,vec3(.03,.022,.018)+top*.06,ch*.95);",
    " c=mix(c,bot,hole);",
    " float fl=.55+.9*n(z*34.+vec2(t*1.7,-t*1.1));",               // Flackern der Glut
    " float fr=.7+.6*mk.g;",                                       // frische Stellen glühen stärker
    " float rim=exp(-dp*dp/2.4)*fl*fr;",
    " float halo=exp(-abs(dp)/3.5)*.24*fr;",
    " vec3 hot=mix(vec3(1.,.353,.122),vec3(1.,.8,.48),clamp(rim-.75,0.,1.));",
    " c+=hot*(rim*1.1)+vec3(1.,.36,.1)*halo;",
    " float sm=smoothstep(.2,.95,mk.g)*(1.-hole)*(1.-smoothstep(.02,.4,o));",
    " sm*=smoothstep(.35,.8,fb(z*3.4+vec2(t*.05,-t*.34)));",      // zarter Rauch, steigt auf
    " c=mix(c,vec3(.5,.46,.42),sm*.22);",
    " gl_FragColor=vec4(c,1.);",
    "}"
  ].join("\n");

  function sh(type, s) { var o = gl.createShader(type); gl.shaderSource(o, s); gl.compileShader(o); return o; }
  function prog(vs, fs) {
    var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, "p"); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
    var u = {}, nU = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < nU; i++) { var nm = gl.getActiveUniform(p, i).name; u[nm.replace(/\[0\]$/, "")] = gl.getUniformLocation(p, nm); }
    return { p: p, u: u };
  }
  var P_MASK = prog(VS, FS_MASK), P_DRAW = prog(VS, FS_DRAW);
  if (!P_MASK || !P_DRAW) { still(); return; }

  var quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  function tex(w, h, data, type) {
    var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (data) { gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, data); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); }
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, type || gl.UNSIGNED_BYTE, null);
    return t;
  }

  // Masken-Ping-Pong: Halbfließkomma, wenn möglich (feinere Kanten), sonst 8 Bit
  var HF = gl.getExtension("OES_texture_half_float"), HFL = gl.getExtension("OES_texture_half_float_linear");
  var maskType = null;
  var MW = 0, MH = 0, mT = [null, null], mF = [null, null], cur = 0;
  function makeMask() {
    var ar = cv.width / cv.height || 1.6;
    MW = ar >= 1 ? 448 : Math.round(448 * ar); MH = Math.round(MW / ar);
    var types = maskType ? [maskType] : (HF && HFL ? [HF.HALF_FLOAT_OES, gl.UNSIGNED_BYTE] : [gl.UNSIGNED_BYTE]);
    for (var j = 0; j < types.length; j++) {
      var ok = true;
      for (var i = 0; i < 2; i++) {
        if (mT[i]) gl.deleteTexture(mT[i]); if (mF[i]) gl.deleteFramebuffer(mF[i]);
        mT[i] = tex(MW, MH, null, types[j]); mF[i] = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, mF[i]); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, mT[i], 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) { ok = false; break; }
        gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      }
      if (ok) { maskType = types[j]; break; }
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  // ---------- Bilder ----------
  var tTop = null, tBot = null, ready = false, loadKey = "";
  function loadImg(u, cb) { var i = new Image(); i.decoding = "async"; i.onload = function () { cb(i); }; i.onerror = function () { cb(null); }; i.src = u; }
  function load() {
    var key = d("top") + "|" + d("bot");
    if (key === loadKey) return;
    loadKey = key; ready = false;
    var got = 0, A = null, B = null;
    function done() {
      if (++got < 2 || key !== loadKey) return;
      if (!A || !B) { stop(); still(); return; }
      if (tTop) gl.deleteTexture(tTop); if (tBot) gl.deleteTexture(tBot);
      tTop = tex(0, 0, A); tBot = tex(0, 0, B);
      ready = true; size(); kick();
    }
    loadImg(d("top"), function (i) { A = i; done(); });
    loadImg(d("bot"), function (i) { B = i; done(); });
  }

  // ---------- Größe ----------
  var W = 0, H = 0;
  function size() {
    var r = stage.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    var maxPx = 2200000; if (w * h > maxPx) { var f = Math.sqrt(maxPx / (w * h)); w = Math.round(w * f); h = Math.round(h * f); }
    W = r.width; H = r.height;
    if (w === cv.width && h === cv.height && MW) return;
    var keep = MW && Math.abs(w / h - cv.width / cv.height) < .01;
    cv.width = w; cv.height = h;
    if (!keep) makeMask();
  }

  // ---------- Pinsel ----------
  var splats = [];
  function radius() { return isM() ? .13 : .068; } // Anteil der Bildbreite
  function add(x, y, s, rs) { if (splats.length < 256) splats.push(x, y, s, rs || 1); }
  var last = null, lastUser = -1e9, auto = { t: 0, x: null, y: null };
  function trail(from, to, s, rs) {
    // Zwischenpunkte, damit schnelle Bewegungen eine geschlossene Spur ziehen
    var ar = W / H || 1.6, dx = (to.x - from.x) * ar, dy = to.y - from.y;
    var dist = Math.sqrt(dx * dx + dy * dy), step = radius() * ar * .3 * (rs || 1);
    var n = Math.min(24, Math.max(1, Math.ceil(dist / step)));
    for (var i = 1; i <= n; i++) add(from.x + (to.x - from.x) * i / n, from.y + (to.y - from.y) * i / n, s, rs);
  }
  function at(e) {
    var r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    return { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height };
  }
  function onMove(e) {
    var p = at(e); if (!p || p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1) { last = null; return; }
    if (last) trail(last, p, .4); else add(p.x, p.y, .4);
    last = p; lastUser = performance.now(); kick();
  }
  stage.addEventListener("pointermove", onMove, { passive: true });
  stage.addEventListener("pointerdown", function (e) { last = null; var p = at(e); if (p) add(p.x, p.y, .9, 1.15); onMove(e); }, { passive: true });
  stage.addEventListener("pointerleave", function () { last = null; }, { passive: true });
  stage.addEventListener("pointercancel", function () { last = null; }, { passive: true });

  // ---------- Schleife ----------
  var raf = 0, visible = false, lastT = 0, acc = 0, t0 = performance.now(), live = false;
  var SPL = new Float32Array(64);
  function kick() { if (!raf && visible && ready && !document.hidden) { lastT = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
  function bindMask(i, u) { gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, mT[i]); gl.uniform1i(u, 2); }
  function maskPass(kx, ky, kz, from, cnt) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, mF[1 - cur]);
    gl.useProgram(P_MASK.p); bindMask(cur, P_MASK.u.m);
    gl.uniform3f(P_MASK.u.k, kx, ky, kz);
    gl.uniform2f(P_MASK.u.ts, 1.5 / MW, 1.5 / MH);
    for (var i = 0; i < cnt * 4; i++) SPL[i] = splats[from * 4 + i];
    gl.uniform4fv(P_MASK.u.sp, SPL);
    gl.uniform1i(P_MASK.u.n, cnt);
    gl.uniform1f(P_MASK.u.ar, W / H || 1.6);
    gl.uniform1f(P_MASK.u.rad, radius());
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    cur = 1 - cur;
  }

  function frame(now) {
    raf = 0;
    if (!visible || !ready || document.hidden || gl.isContextLost()) return;
    var dt = Math.min(.1, (now - lastT) / 1000); lastT = now;
    size();

    // Autopilot: ruhige Bahn übers Bild, solange 2,5 s niemand malt
    if (now - lastUser > 2500) {
      auto.t += dt;
      var tt = auto.t * (isM() ? .42 : .3);
      var p = { x: .5 + .37 * Math.sin(tt * 1.13 + .4), y: .5 + .33 * Math.sin(tt * 1.71 + 1.9) };
      var as = Math.min(.4, .2 * dt * 60);
      if (auto.x !== null) trail({ x: auto.x, y: auto.y }, p, as, .78); else add(p.x, p.y, as, .78);
      auto.x = p.x; auto.y = p.y;
    } else auto.x = null;

    // Abbau in festen Schritten (30 Hz), damit auch 8-Bit-Masken sauber herunterzählen
    gl.viewport(0, 0, MW, MH);
    acc += dt;
    var steps = 0; while (acc >= 1 / 30) { acc -= 1 / 30; steps++; }
    // je Schritt ein Abbau-Durchgang (Abbau 0,3 pro s, Haltezeit 0,55 s, Rand frisst sich je Schritt um die Hälfte nach innen)
    for (var k = Math.min(steps, 4); k > 0; k--) maskPass(.3 / 30, 1 / (.55 * 30), .5, 0, 0);
    // neue Kreise, je 16 pro Durchgang
    for (var done = 0, nS = splats.length / 4; done < nS; done += 16) maskPass(0, 0, 0, done, Math.min(16, nS - done));
    splats.length = 0;

    // Bild
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, cv.width, cv.height);
    gl.useProgram(P_DRAW.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tTop); gl.uniform1i(P_DRAW.u.a, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tBot); gl.uniform1i(P_DRAW.u.b, 1);
    bindMask(cur, P_DRAW.u.m);
    gl.uniform1f(P_DRAW.u.t, ((now - t0) / 1000) % 600);
    gl.uniform1f(P_DRAW.u.ar, W / H || 1.6);
    gl.uniform1f(P_DRAW.u.px, W ? cv.width / W : 1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!live) { live = true; box.classList.add("is-live"); }
    raf = requestAnimationFrame(frame);
  }

  cv.addEventListener("webglcontextlost", function (e) { e.preventDefault(); stop(); cv.remove(); still(); }, false);
  stage.appendChild(cv);

  // Bilder erst kurz vor dem Abschnitt laden, Schleife nur bei Sichtbarkeit
  new IntersectionObserver(function (es) { if (es[0].isIntersecting) load(); }, { rootMargin: "600px 0px" }).observe(stage);
  new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) kick(); else stop(); }).observe(stage);
  document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else kick(); });
  if (mqM) {
    var onMq = function () { MW = 0; size(); load(); };
    if (mqM.addEventListener) mqM.addEventListener("change", onMq); else if (mqM.addListener) mqM.addListener(onMq);
  }
})();
