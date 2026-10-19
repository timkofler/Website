// "Seide": tausende Haarsträhnen als dünne Bänder, ganz im Shader gerechnet (keine Modelle, keine Videos).
// Eine Strähne ist ein Streifen aus M Punkten; jede Instanz bekommt Lage, Zufall und Tiefe mit.
// Posen: A = fließende Welle (Start), B = glatt herabhängender Vorhang (Schnitt, Farbe, Styling).
// Der Schnitt ist exakt: Der Hauptteil endet genau an der Schnittkante, die abgeschnittenen Spitzen sind
// ein zweites, kleines Netz, das nur für schon geschnittene Strähnen sichtbar ist und nach unten fällt.

var VERT = [
  "uniform float uT, uGrow, uFlow, uCut, uCutY, uFill, uWave, uCurl, uAlpha, uPiece, uPx, uMR;",
  "uniform vec2 uP0, uP1, uP2, uP3, uM, uMV;",
  "uniform float uBand;",
  "uniform vec4 uCurt;",
  "uniform vec3 uA0, uA1, uA2, uB0, uB1, uB2;",
  "attribute vec4 aSeed;",
  "varying vec3 vCol; varying float vD, vHW, vA;",
  "vec2 bez(float t){ float k=1.-t; return k*k*k*uP0+3.*k*k*t*uP1+3.*k*t*t*uP2+t*t*t*uP3; }",
  "vec2 bezD(float t){ float k=1.-t; return 3.*k*k*(uP1-uP0)+6.*k*t*(uP2-uP1)+3.*t*t*(uP3-uP2); }",
  "vec3 grad(vec3 a, vec3 b, vec3 c, float s){ return s<.45 ? mix(a,b,smoothstep(0.,.45,s)) : mix(b,c,smoothstep(.45,1.,s)); }",
  // Lage eines Punktes bei s (0 Ansatz, 1 Spitze). z = Tiefe der Locke für die Schattierung.
  "vec3 hair(float s, float len, float cr, float clump){",
  "  float u=aSeed.x, r1=aSeed.y, r2=aSeed.z;",
  "  float lane=u-.5;",
  "  vec2 c=bez(s), d=normalize(bezD(s)+1e-5), n=vec2(-d.y,d.x);",
  "  float band=uBand*(.5+.8*s);",
  "  float off=mix(lane*band, (clump-.5)*band+lane*band*.22, .4*s);",
  "  float w=sin(uT*.9-s*6.2+cr*6.283)*.04*s + sin(uT*.53-s*3.1+r1*2.)*.018*s;",
  "  vec2 pA=c+n*(off+w)+d*(r2-.5)*.03;",
  "  float wid=uCurt.y*(1.-.18*s);",
  // Glatt: feine Bündel. Gestylt: 16 grobe Bündel, die Strähnen rücken zusammen und drehen sich als Welle oder Locke.
  "  float ci=floor(u*16.), cc=(ci+.5)/16., crc=fract(sin(ci*12.9898+1.3)*43758.5);",
  "  float curly=clamp((uCurl-2.)/5.,0.,1.);",
  "  float lx0=mix(lane*wid, (clump-.5)*wid+lane*wid*.25, .35*s);",
  "  float lxS=(cc-.5)*wid+(u-cc)*wid*mix(.7,.3,curly);",
  "  float lx=mix(lx0, lxS, uWave*smoothstep(0.,.3,s));",
  "  vec2 pB=vec2(uCurt.x+lx+sin(uT*.7+u*5.+s*2.5)*.01*s, uCurt.z-s*len*(1.-uWave*curly*.2));",
  "  vec2 p=mix(pA,pB,uFlow);",
  "  float ph=s*len/uCurt.w*uCurl*6.283+crc*6.283+(u-cc)*16.*mix(.5,.18,curly)+r1*.1+uT*.35;",
  "  float amp=uWave*mix(.032,.026,curly)*(.85+.3*crc)*smoothstep(0.,.3,s)*(.75+.5*s);",
  "  p.x+=sin(ph)*amp*uFlow + sin(ph)*amp*.6*(1.-uFlow);",
"  vec2 dm=p-uM; float f=exp(-dot(dm,dm)/(uMR*uMR))*smoothstep(0.,.4,s);",
  "  p+=clamp(uMV,-3.,3.)*f*.07 + normalize(dm+1e-4)*f*min(length(uMV),2.)*.03;",
  "  return vec3(p, cos(ph)*step(.001,amp));",
  "}",
  "void main(){",
  "  float u=aSeed.x, r1=aSeed.y, r2=aSeed.z, z=aSeed.w;",
  "  float clump=floor(u*46.)/46.; float cr=fract(sin(clump*91.7+3.1)*43758.5);",
  "  float len=uCurt.w*(1.+(r1-.5)*.24*(1.-uCut*0.));",
  "  float sC=clamp((uCurt.z-uCutY)/len,0.,1.);",
  // Schere läuft quer über den Vorhang: b ist ihre Lage, ck wie weit die Strähne schon geschnitten ist.
  "  float b=uCut*1.5-.12; float ck=clamp((b-u)/.2,0.,1.); float cut=step(.0001,ck)*step(.5,uFlow);",
  "  float s0=position.x, side=position.y, s, alpha=1.;",
  "  if(uPiece<.5){ float e=mix(1.,sC,cut); e=min(e, uGrow*1.3-r1*.3); s=s0*max(e,0.); }",
  "  else { s=mix(sC,1.,s0); alpha=cut*(1.-smoothstep(.35,.9,ck)); }",
  "  vec3 h0=hair(s,len,cr,clump), h1=hair(s+.012,len,cr,clump);",
  "  vec2 p=h0.xy, p1=h1.xy;",
  "  if(uPiece>.5){ float fall=ck*ck; vec2 o=vec2((r1-.5)*.5*ck + (s-sC)*(r2-.5)*2.6*ck + ck*.12, -fall*(1.9+r2*1.2) - ck*.05); p+=o; p1+=o+vec2((r2-.5)*.02*ck,0.); }",
  "  vec2 T=normalize(p1-p+1e-6); vec2 N=vec2(-T.y,T.x);",
  // Breite in Bildpunkten: vorne dicker, an der Spitze dünner (geschnittene Enden bleiben stumpf).
  "  float end=uPiece>.5 ? 1. : mix(1.,sC,cut);",
  "  float rel=uPiece>.5 ? s : s/max(end,.001);",
  "  float taper=uPiece<.5 && cut>.5 ? 1.-smoothstep(.985,1.,s0) : 1.-smoothstep(.55,1.,rel)*.85;",
  "  float hw=(.38+.7*z)*taper;",
  "  vHW=hw; vD=side*(hw+1.);",
  "  p+=N*side*(hw+1.)*uPx;",
  // Farbe: alte Farbe, neue Farbe läuft vom Ansatz zu den Spitzen.
  "  float front=uFill*1.4-.2+(r1-.5)*.12+(cr-.5)*.12;",
  "  float k=1.-smoothstep(front-.07,front+.07,s);",
  "  vec3 col=mix(grad(uA0,uA1,uA2,s),grad(uB0,uB1,uB2,s),k);",
  "  col*=(.55+.45*z)*(.8+.45*r1);",
  "  vec2 L2=normalize(vec2(.93,.36)); float th=dot(T,L2);",
  "  float sT=sqrt(max(1.-th*th,0.));",
  "  float sp=(pow(sT,26.)*.9+pow(sT,5.)*.18)*(.5+.9*r2);",
"  float hq=(s-.24-.03*sin(uT*.3))/.085; float halo=exp(-hq*hq)*uFlow*(.45+.55*sin(u*160.+r1*6.))*.9;",
  "  float curlL=mix(1.,.62+.38*h0.z,uWave*uFlow);",
  "  col=col*curlL*(1.+sp*.35) + vec3(1.,.92,.8)*(sp*.55+halo)*(.35+.65*z);",
  // Kleiner Glanz am frischen Farbrand, solange er noch läuft.
  "  float fq=(s-front)/.03; col+=vec3(1.,.85,.65)*exp(-fq*fq)*.25*step(.01,uFill)*step(uFill,.99);",
  "  vCol=col;",
  "  float rootIn=smoothstep(0.,.05,s0);",
  "  vA=alpha*uAlpha*(.6+.4*z)*rootIn*mix(1.,smoothstep(0.,.2,s),uFlow);",
  "  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,0.,1.);",
  "}"
].join("\n");

var FRAG = [
  "varying vec3 vCol; varying float vD, vHW, vA;",
  "void main(){ float a=clamp(vHW+.5-abs(vD),0.,1.)*vA; if(a<.004) discard; gl_FragColor=vec4(vCol,a); }"
].join("\n");

// Farben bleiben im sRGB-Raum (die Bühne rechnet ohne Farbraum-Umwandlung).
function hex(THREE, h) { var n = parseInt(h.slice(1), 16); return new THREE.Vector3((n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255); }

// Erstellt das Haar in einer fertigen Bühne (stage aus _shared/stage3d.js). n = Strähnen, m = Punkte je Strähne.
export function haar(THREE, scene, o) {
  var n = o.n, m = o.m;
  function strip(segs) {
    var g = new THREE.InstancedBufferGeometry(), pos = [], idx = [];
    for (var i = 0; i < segs; i++) { var s = i / (segs - 1); pos.push(s, -1, 0, s, 1, 0); if (i) { var a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    return g;
  }
  // Strähnen nach Tiefe sortiert (hinten zuerst), damit vordere drüber liegen. Dichte zur Mitte höher.
  var seeds = new Float32Array(n * 4), s = 11;
  function rnd() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }
  var list = [];
  for (var i = 0; i < n; i++) { var q = rnd() * 2 - 1, u = .5 + .5 * Math.sign(q) * Math.pow(Math.abs(q), 1.25); list.push([u, rnd(), rnd(), Math.pow(rnd(), .8)]); }
  list.sort(function (a, b) { return a[3] - b[3]; });
  list.forEach(function (v, i) { seeds.set(v, i * 4); });
  var C = o.colors;
  var uni = {
    uT: { value: 0 }, uGrow: { value: 0 }, uFlow: { value: 0 }, uCut: { value: 0 }, uCutY: { value: 0 }, uFill: { value: 1 }, uWave: { value: 0 }, uCurl: { value: 3 },
    uAlpha: { value: 1 }, uPiece: { value: 0 }, uPx: { value: .002 }, uMR: { value: .22 },
    uP0: { value: new THREE.Vector2() }, uP1: { value: new THREE.Vector2() }, uP2: { value: new THREE.Vector2() }, uP3: { value: new THREE.Vector2() },
    uM: { value: new THREE.Vector2(9, 9) }, uMV: { value: new THREE.Vector2() }, uBand: { value: .5 }, uCurt: { value: new THREE.Vector4(0, .7, 1.1, 1.6) },
    uA0: { value: hex(THREE, C[0]) }, uA1: { value: hex(THREE, C[1]) }, uA2: { value: hex(THREE, C[2]) },
    uB0: { value: hex(THREE, C[0]) }, uB1: { value: hex(THREE, C[1]) }, uB2: { value: hex(THREE, C[2]) }
  };
  function mat(piece) {
    var u = {}; for (var k in uni) u[k] = uni[k];
    u.uPiece = { value: piece };
    return new THREE.ShaderMaterial({ uniforms: u, vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide, transparent: true, depthTest: false, depthWrite: false, toneMapped: false });
  }
  var gMain = strip(m), gPiece = strip(Math.max(8, Math.round(m * .4)));
  var attr = new THREE.InstancedBufferAttribute(seeds, 4);
  gMain.setAttribute("aSeed", attr); gPiece.setAttribute("aSeed", attr);
  gMain.instanceCount = gPiece.instanceCount = n;
  var main = new THREE.Mesh(gMain, mat(0)), piece = new THREE.Mesh(gPiece, mat(1));
  main.frustumCulled = piece.frustumCulled = false;
  piece.renderOrder = 1;
  scene.add(main); scene.add(piece);
  return {
    u: uni,
    count: function (k) { gMain.instanceCount = gPiece.instanceCount = Math.max(200, Math.min(n, k | 0)); },
    // Farbe wechseln: bisherige (gerade sichtbare) Farbe wird zur alten, neue läuft ab uFill = 0 ein.
    color: function (cs) {
      var f = uni.uFill.value;
      if (f < 1) { ["0", "1", "2"].forEach(function (k) { uni["uA" + k].value.lerp(uni["uB" + k].value, Math.min(1, f)); }); }
      else { ["0", "1", "2"].forEach(function (k) { uni["uA" + k].value.copy(uni["uB" + k].value); }); }
      uni.uB0.value.copy(hex(THREE, cs[0])); uni.uB1.value.copy(hex(THREE, cs[1])); uni.uB2.value.copy(hex(THREE, cs[2]));
      uni.uFill.value = 0;
    },
    showPieces: function (on) { piece.visible = on; }
  };
}
