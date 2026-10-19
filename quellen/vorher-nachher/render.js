// Erzeugt die Bilder für den Vorher/Nachher-Regler auf /entwurf/.
// Voraussetzung: lokaler Server im Repo-Wurzelordner (python3 -m http.server 8124)
// und einer in webdesign/ (python3 -m http.server 8123).
// Aufruf: node render.js [Ausgabeordner] [branche,branche,...]  →  danach webp.py
const { chromium } = require(process.env.NPM_G + '/playwright');
const out = process.argv[2] || 'png';
const B = (process.argv[3] || 'tischlerei,gasthaus,friseur,baeckerei').split(',');
const T = { tischlerei: 2.2, gasthaus: 3, friseur: 2, baeckerei: 4 };
const GER = { pc: { w: 1280, h: 800, dpr: 1.5 }, handy: { w: 390, h: 844, dpr: 2 } };
(async () => {
  require('fs').mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [g, v] of Object.entries(GER)) {
    const m = g === 'handy';
    const ctx = await b.newContext({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: v.dpr, isMobile: m, hasTouch: m });
    for (const n of B) {
      const p = await ctx.newPage();
      await p.goto(`http://localhost:8124/quellen/vorher-nachher/vorher.html?b=${n}`, { waitUntil: 'networkidle' });
      await p.screenshot({ path: `${out}/${n}-vorher-${g}.png` });
      await p.goto(`http://localhost:8123/beispiele/${n}/`, { waitUntil: 'networkidle' });
      await p.addStyleTag({ content: ':root{--bar:0px!important}.tk-demo-bar{display:none!important}' });
      // Das Bäckerei-Video ist als Standbild unscharf (Teig kneten): dort das Brotfoto der Seite zeigen.
      if (n === 'baeckerei') await p.evaluate(() => {
        const v = document.querySelector('video'), i = document.createElement('img');
        i.src = '/beispiele/_shared/media/brot-hero.jpg'; i.className = v.className; i.style.objectFit = 'cover';
        v.replaceWith(i); return new Promise(r => { i.onload = r; setTimeout(r, 3000); });
      });
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.evaluate(async (t) => {
        for (const vid of document.querySelectorAll('video')) {
          vid.pause();
          await new Promise(r => { vid.addEventListener('seeked', r, { once: true }); vid.currentTime = t; setTimeout(r, 3000); });
        }
      }, T[n]);
      await p.waitForTimeout(2500);
      await p.screenshot({ path: `${out}/${n}-nachher-${g}.png` });
      await p.close();
    }
    await ctx.close();
  }
  await b.close();
})();
