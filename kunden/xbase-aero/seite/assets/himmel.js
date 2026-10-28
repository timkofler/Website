// Lebendiger Himmel: Wolken aus Rauschen, die ziehen, sich auflösen und neu bilden.
// Tag im Hero, Nachtwolken im dunklen Ablauf. Ohne WebGL oder bei weniger Bewegung bleiben die Wolkenbilder.
function himmel(hero, night) {
  if (!hero) return;
  const cv = document.createElement("canvas");
  cv.className = "hero__sky";
  cv.setAttribute("aria-hidden", "true");
  const gl = cv.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return;

  const vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  const fs = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 R;uniform float T;uniform float M;uniform float N;uniform float S;
// Hash nur mit ganzen Zahlen unter 289² (exakt auf jeder Grafikkarte), sonst entstehen auf manchen GPUs harte Kanten
float pm(float x){return mod((x*34.+1.)*x,289.);}
float h(vec3 i){i=mod(i,289.);return pm(pm(pm(i.x)+i.y)+i.z)/289.;}
float n(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return s;}
float dens(vec2 q,float t,float cov){
  vec3 p=vec3(q,t*.045);
  vec2 w=vec2(fbm(p+vec3(0,0,3.)),fbm(p+vec3(5.2,1.3,1.)));
  float f=fbm(vec3(q+w*.55,t*.06));
  return smoothstep(cov,cov+.17,f);}
void main(){
  vec2 uv=gl_FragCoord.xy/R;float asp=R.x/R.y;
  float y=uv.y;
  // Himmel: oben satt, zum Horizont heller und dunstig
  vec3 top=vec3(.17,.47,.86),mid=vec3(.42,.68,.95),hor=vec3(.80,.90,.99);
  vec3 sky=mix(hor,mid,smoothstep(.0,.55,y));sky=mix(sky,top,smoothstep(.5,1.,y));
  vec2 sun=vec2(.78*asp,.95);vec2 pq=vec2(uv.x*asp,y);
  float sd=length(pq-sun);sky+=vec3(1.,.96,.88)*(.22*exp(-sd*2.6)+.08*exp(-sd*.9));
  float t=T;
  // Abdeckung: hinter dem Text (links) dünner, rechts und unten dichter
  float cov=.46+.12*smoothstep(.62,.22,uv.x)*M-.04*smoothstep(.55,.1,y)+N*.06;
  vec2 c=gl_FragCoord.xy/S;
  vec2 q1=vec2(c.x/860.+t*.024,c.y/510.);
  float d1=dens(q1,t,cov);
  // Licht von oben rechts: Probe Richtung Sonne für Schattenseiten
  float d1s=dens(q1+vec2(.05,.09),t,cov);
  float lit=clamp(1.-(d1s-d1)*1.8,0.,1.);
  vec3 cw=mix(vec3(.70,.78,.90),vec3(1.,.99,.97),lit*.75+.25*y);
  // zweite, ferne Schicht: kleiner, langsamer, blasser
  vec2 q2=vec2(c.x/340.+t*.008+7.,c.y/216.+3.);
  float d2=dens(q2,t*.7+20.,cov+.06)*.55;
  vec3 col=mix(sky,mix(sky,vec3(.96,.98,1.),.85),d2);
  col=mix(col,cw,d1*.96);
  // nach unten in die Seitenfarbe ausblenden
  float a=smoothstep(.0,.16,y);
  if(N>.5){
    // Nacht: nur die Wolken, mondbläulich und leise, oben und unten weich ausgeblendet
    vec3 nc=mix(vec3(.30,.40,.62),vec3(.62,.72,.90),lit);
    float na=(d1*.2+d2*.06)*smoothstep(.0,.12,y)*smoothstep(1.,.85,y);
    gl_FragColor=vec4(nc*na,na);return;}
  gl_FragColor=vec4(col*a,a);
}`;
  function sh(t, s) { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; }
  const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return;
  const pr = gl.createProgram();
  gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  const b = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(pr, "R"), uT = gl.getUniformLocation(pr, "T"), uM = gl.getUniformLocation(pr, "M"), uN = gl.getUniformLocation(pr, "N"), uS = gl.getUniformLocation(pr, "S");

  hero.prepend(cv);
  hero.classList.add("has-sky");
  const scale = 0.6; // halbe Auflösung reicht für weiche Wolken
  function size() {
    const w = Math.max(1, Math.round(hero.clientWidth * scale)), hh = Math.max(1, Math.round(hero.clientHeight * scale));
    if (cv.width !== w || cv.height !== hh) { cv.width = w; cv.height = hh; gl.viewport(0, 0, w, hh); }
    gl.uniform1f(uM, night ? 0 : innerWidth > 960 ? 1 : 0.15);
    gl.uniform1f(uN, night ? 1 : 0);
    gl.uniform1f(uS, innerWidth > 960 ? scale : scale / 1.9);
  }
  size();
  addEventListener("resize", size);
  new ResizeObserver(size).observe(hero);
  let drawn = 0;
  let vis = true, last = 0;
  new IntersectionObserver(e => { vis = e[0].isIntersecting; }).observe(hero);
  const t0 = performance.now() - (night ? 90000 : 40000);
  function frame(now) {
    requestAnimationFrame(frame);
    if (!vis || document.hidden || now - last < 33) return;
    last = now;
    gl.uniform2f(uR, cv.width, cv.height);
    // Handy schneller, sonst sieht man die Bewegung auf dem kleinen Bild kaum
    gl.uniform1f(uT, window.__skyT != null ? window.__skyT : (now - t0) / 1000 * (innerWidth > 960 ? 1.35 : 2.4));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (++drawn === 3) cv.classList.add("on");
  }
  requestAnimationFrame(frame);
}
// Ersatz-Wolkenbilder nur laden, wo kein Live-Himmel läuft (spart Ladezeit)
function bilder(el) {
  if (el && !el.classList.contains("has-sky")) el.querySelectorAll(".sky img[data-src]").forEach(i => { i.src = i.dataset.src; });
}
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  himmel(document.querySelector(".hero"), false);
  himmel(document.querySelector("#process"), true);
}
bilder(document.querySelector(".hero"));
bilder(document.querySelector("#process"));
