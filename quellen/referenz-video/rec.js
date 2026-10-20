// Nimmt die Startseite von crypto-x.at (lokal) als Einzelbilder auf: Hero, dann das große 3D-X im Schlussband.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const fs = require('fs');
const SCENE = +process.argv[2]; const FPS = 30, W = 1280, H = 800;
const ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
(async () => {
  const b = await chromium.launch({ args: ['--no-proxy-server','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.addInitScript(() => {
    let T = 0, id = 0, q = new Map();
    window.requestAnimationFrame = cb => { q.set(++id, cb); return id; };
    window.cancelAnimationFrame = i => q.delete(i);
    performance.now = () => T;
    window.__step = ms => { T += ms; const c = [...q.values()]; q.clear(); c.forEach(f => { try { f(T); } catch (e) {} }); };
  });
  const step = ms => p.evaluate(m => window.__step(m), ms);
  await p.goto('http://127.0.0.1:8091/', { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: '.reveal-wait,.modules .module.reveal-wait>*{opacity:1!important;transform:none!important} .reveal-in{transition:none!important}' });
  await p.waitForTimeout(800); for (let k = 0; k < 60; k++) await step(1000 / 30);
  let n = 0;
  const shot = async () => { await p.screenshot({ path: `f${SCENE}/${String(n++).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 95 }); };
  fs.mkdirSync('f' + SCENE, { recursive: true });
  if (SCENE === 1) {
  // Szene 1: Hero, langsam etwas nach unten, Dashboard richtet sich auf
  const S1 = 3.6 * FPS;
  for (let i = 0; i < S1; i++) {
    const t = i / S1;
    await p.evaluate(y => scrollTo(0, y), Math.round(ease((t - .15) / .85) * 420));
    await p.mouse.move(640 + Math.sin(t * 3) * 200, 420);
    await step(1000 / FPS); await shot();
  }
  }
  if (SCENE === 2) {
  // Szene 2: Schlussband mit 3D-X, Münze kommt von unten und dreht sich ein
  const bx = await p.evaluate(() => { const r = document.querySelector('.band__x').getBoundingClientRect(); return Math.round(r.top + scrollY + r.height / 2); });
  const yA = bx - H / 2 - 300, yB = bx - H / 2 - 10;
  await p.evaluate(y => scrollTo(0, y), yA);
  await p.waitForTimeout(1500); // Three.js laden lassen (Uhr steht, Münze startet noch nicht)
  await step(16); await p.waitForTimeout(300);
  const S2 = 6 * FPS;
  for (let i = 0; i < S2; i++) {
    const t = i / S2;
    await p.evaluate(y => scrollTo(0, y), Math.round(yA + (yB - yA) * ease(t / .8)));
    await p.mouse.move(980 + Math.sin(t * 5) * 160, 400 + Math.cos(t * 4) * 120);
    await step(1000 / FPS); await shot();
  }
  }
  console.log('frames', n);
  await b.close();
})();
