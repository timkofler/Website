// Kundenportal-Video für /ablauf/: echte Bedienung am Handy (390×844, 2x), aufgenommen per CDP-Screencast in Echtzeit, bewusst ruhiges Tempo.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:8096';
(async () => {
  const b = await chromium.launch({ args: ['--no-proxy-server'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.addInitScript(() => {
    const css = 'html{scroll-behavior:auto!important}.__tap{position:fixed;z-index:99999;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(255,255,255,.28);border:2px solid rgba(255,255,255,.85);pointer-events:none;animation:__t .6s ease-out forwards}@keyframes __t{0%{transform:scale(.4);opacity:1}100%{transform:scale(1.25);opacity:0}}';
    const add = () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); };
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', add) : add();
    window.__tap = (x, y) => { const d = document.createElement('div'); d.className = '__tap'; d.style.left = x + 'px'; d.style.top = y + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 700); };
    window.__scroll = (to, ms) => new Promise(r => { const s = scrollY, t0 = performance.now(); const e = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const f = now => { const k = Math.min(1, (now - t0) / ms); scrollTo(0, s + (to - s) * e(k)); k < 1 ? requestAnimationFrame(f) : r(); }; requestAnimationFrame(f); });
  });
  const cdp = await ctx.newCDPSession(p);
  const frames = [];
  cdp.on('Page.screencastFrame', async f => { frames.push({ t: f.metadata.timestamp, d: f.data }); try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch (e) {} });
  const wait = ms => p.waitForTimeout(ms);
  const tap = async sel => {
    const el = p.locator(sel).first(); await el.scrollIntoViewIfNeeded();
    const bb = await el.boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
    await p.evaluate(([x, y]) => window.__tap(x, y), [x, y]); await wait(260); await el.click();
  };
  const scrollTo = async (sel, off = 70, ms = 900) => {
    const y = await p.evaluate(([s, o]) => { const r = document.querySelector(s).getBoundingClientRect(); return Math.max(0, Math.min(r.top + scrollY - o, document.documentElement.scrollHeight - innerHeight)); }, [sel, off]);
    await p.evaluate(([y, ms]) => window.__scroll(y, ms), [y, ms]);
  };
  await p.goto(BASE + '/kunden/'); await p.waitForLoadState('networkidle');
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, everyNthFrame: 1 });
  // 1) Anmelden (Glas-Karte, ruhig tippen)
  await wait(2600);
  await tap('input[name=benutzer]'); await p.keyboard.type('baeckerei-muster', { delay: 95 });
  await wait(500);
  await tap('input[name=passwort]'); await p.keyboard.type('kornspitz-2026', { delay: 85 });
  await wait(800);
  await tap('button[type=submit]');
  await p.waitForLoadState('networkidle'); await wait(2800);
  // 2) Stand der Webseite
  await scrollTo('.kp-projekt', 60, 1800); await wait(3800);
  // 3) Wunsch schreiben
  await scrollTo('.kp-chat .kp-chip', 470, 2000); await wait(1600);
  await tap('.kp-chip--wunsch'); await wait(600);
  await tap('.kp-chat textarea'); await p.keyboard.type('Bitte noch unser Kornspitz-Foto auf die Startseite. Ich lade es gleich hoch.', { delay: 55 });
  await wait(900);
  await tap('.kp-chat button[type=submit]');
  await p.waitForLoadState('networkidle'); await wait(500);
  await scrollTo('.kp-chat .kp-chip', 520, 1000); await wait(3200);
  // 4) Dateien hochladen
  await scrollTo('.kp-tiles', 90, 1600); await wait(900);
  await tap('[data-kp-tab=dateien]'); await wait(1200);
  await scrollTo('.kp-upload', 70, 1300); await wait(900);
  const pick = p.locator('.kp-pick'); const bb = await pick.boundingBox();
  await p.evaluate(([x, y]) => window.__tap(x, y), [bb.x + bb.width / 2, bb.y + bb.height / 2]); await wait(600);
  await p.setInputFiles('.kp-pick input', ['up/kornspitz.jpg', 'up/verkaufsraum.jpg', 'up/logo-baeckerei.png']); await wait(1800);
  await tap('.kp-upload .form__check input'); await wait(800);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 20, downloadThroughput: -1, uploadThroughput: 2.2e6 });
  await tap('.kp-upload button[type=submit]');
  await p.waitForFunction(() => !!document.querySelector('.form__status.is-ok'), null, { timeout: 30000 });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await wait(2400);
  await scrollTo('.kp-tiles', 90, 1400); await wait(600);
  await tap('[data-kp-tab=dateien]'); await wait(800);
  await p.evaluate(() => { const d = document.querySelector('.kp-batch'); if (d) d.open = true; });
  await scrollTo('.kp-batch', 300, 1500); await wait(3400);
  // 5) Zwei-Faktor-Anmeldung (freiwillig) mit QR-Code
  await scrollTo('#zweifaktor', 120, 1800); await wait(900);
  await tap('#zweifaktor > summary'); await wait(1000);
  await scrollTo('.kp-qr', 230, 1500); await wait(3600);
  // 6) Fuß mit Lauflicht
  await p.evaluate(() => window.__scroll(document.documentElement.scrollHeight - innerHeight, 2200)); await wait(4500);
  await cdp.send('Page.stopScreencast'); await wait(200);
  fs.rmSync('f', { recursive: true, force: true }); fs.mkdirSync('f');
  let list = '';
  frames.forEach((f, i) => { const n = `f/${String(i).padStart(5, '0')}.jpg`; fs.writeFileSync(n, Buffer.from(f.d, 'base64'));
    const dur = i + 1 < frames.length ? frames[i + 1].t - f.t : 0.5; list += `file '${n}'\nduration ${dur.toFixed(4)}\n`; });
  list += `file 'f/${String(frames.length - 1).padStart(5, '0')}.jpg'\n`;
  fs.writeFileSync('list.txt', list);
  console.log('frames', frames.length, 'sec', (frames.at(-1).t - frames[0].t).toFixed(1));
  await b.close();
})();
