// Ein durchgehender, ruhiger Lauf über crypto-x.at: von oben bis zum großen 3D-X im Schlussband, ohne Schnitt.
// Aufruf: node rec.js <von> <bis>  (Bildnummern). Teile können parallel laufen; jeder Teil spielt 6 s Vorlauf
// ungespeichert ab, damit Dämpfung und Animationen beim Übergang gleich stehen. "node rec.js 0 -1" nennt die Bildanzahl.
// requestAnimationFrame/performance.now laufen über eine eigene Uhr, so entsteht jedes Bild ruckelfrei (WebGL über SwiftShader).
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const fs = require('fs');
const FPS = 60, W = 1280, H = 800;
const HOLD0 = 0.8, ACC = 1.6, DEC = 2.2, HOLD1 = 2.0, SPEED = 640; // Sekunden bzw. px/s im Mittelteil
const A = +process.argv[2], B = +process.argv[3];
(async () => {
  const b = await chromium.launch({ args: ['--no-proxy-server', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.addInitScript(() => {
    let T = 0, id = 0, q = new Map();
    window.requestAnimationFrame = cb => { q.set(++id, cb); return id; };
    window.cancelAnimationFrame = i => q.delete(i);
    // setTimeout/setInterval (z. B. die Reiter, die sich selbst weiterschalten) ebenfalls nach dieser Uhr
    let tid = 0; const tm = new Map();
    window.setTimeout = (fn, d, ...a) => { tm.set(++tid, { at: T + (+d || 0), fn, a }); return tid; };
    window.setInterval = (fn, d, ...a) => { tm.set(++tid, { at: T + Math.max(1, +d || 0), fn, a, every: Math.max(1, +d || 0) }); return tid; };
    window.clearTimeout = window.clearInterval = i => tm.delete(i);
    performance.now = () => T;
    // CSS-Übergänge und -Animationen laufen ebenfalls nach dieser Uhr: anhalten und von Hand weiterstellen
    const ct = new WeakMap();
    window.__step = ms => {
      T += ms;
      for (let k = 0; k < 100; k++) {
        const due = [...tm.entries()].filter(([, t]) => t.at <= T).sort((x, y) => x[1].at - y[1].at)[0];
        if (!due) break;
        const [i, t] = due;
        if (t.every) t.at += t.every; else tm.delete(i);
        try { typeof t.fn === 'function' ? t.fn(...t.a) : 0; } catch (e) {}
      }
      const c = [...q.values()]; q.clear(); c.forEach(f => { try { f(T); } catch (e) {} });
      document.getAnimations().forEach(a => { const t = (ct.get(a) || 0) + ms; ct.set(a, t); a.pause(); a.currentTime = t; });
    };
  });
  const step = ms => p.evaluate(m => window.__step(m), ms);
  await p.goto('http://127.0.0.1:8091/', { waitUntil: 'networkidle' });
  // Weiches Scrollen per CSS würde in Echtzeit laufen, darum aus
  await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  // Alle Bilder sofort laden, damit Seitenhöhe und Parallax in jedem Teil gleich sind
  await p.evaluate(() => Promise.all([...document.images].map(im => { im.loading = 'eager'; return im.decode().catch(() => {}); })));
  await p.waitForLoadState('networkidle');
  await p.waitForTimeout(800); for (let k = 0; k < 60; k++) await step(1000 / 30);
  const D = await p.evaluate(() => { const r = document.querySelector('.band__x').getBoundingClientRect(); return Math.round(r.top + scrollY + r.height / 2 - innerHeight / 2); });
  // Weg-Zeit-Verlauf: sanft anfahren, gleichmäßig laufen, sanft abbremsen
  const v = SPEED, dAcc = v * ACC / 2, dDec = v * DEC / 2, tMid = (D - dAcc - dDec) / v;
  const N = Math.round((HOLD0 + ACC + tMid + DEC + HOLD1) * FPS);
  const pos = t => {
    t -= HOLD0; if (t <= 0) return 0;
    if (t < ACC) return v * t * t / (2 * ACC);
    t -= ACC; if (t < tMid) return dAcc + v * t;
    t -= tMid; if (t < DEC) return dAcc + v * tMid + v * t - v * t * t / (2 * DEC);
    return D;
  };
  if (B < 0) { console.log('frames', N); await b.close(); return; }
  fs.mkdirSync('g', { recursive: true });
  const to = Math.min(B, N);
  for (let i = Math.max(0, A - 6 * FPS); i < to; i++) {
    const t = i / FPS;
    await p.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), Math.round(pos(t)));
    await p.mouse.move(820 + Math.sin(t * .7) * 220, 380 + Math.cos(t * .5) * 120);
    await step(1000 / FPS);
    if (i >= A) await p.screenshot({ path: `g/${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 94 });
  }
  console.log('done', A, to);
  await b.close();
})();
