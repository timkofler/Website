// Vorschaubild (og:image) für /tools/qr-code/ rendern.
// Aufruf (Server läuft, z. B. php -S 127.0.0.1:8103 -t webdesign):
//   node quellen/qr-code/og.js /tmp/og-qr.png
// Danach als JPG (Qualität 86) unter webdesign/assets/img/og-qr-code.jpg speichern (bei Änderung neuer Dateiname).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = process.env.URL || 'http://127.0.0.1:8103';
(async () => {
  const b = await chromium.launch({ args: ['--no-proxy-server'] });
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.route(BASE + '/__og', r => r.fulfill({ contentType: 'text/html; charset=utf-8', body: fs.readFileSync(path.join(__dirname, 'og.html'), 'utf8') }));
  await p.goto(BASE + '/__og', { waitUntil: 'networkidle' });
  await p.addScriptTag({ url: BASE + '/beispiele/_shared/vendor/qrcode-generator-2.0.4/qrcode.js' });
  await p.addScriptTag({ url: BASE + '/assets/js/tk-qr.js' });
  await p.evaluate(() => { document.getElementById('qr').innerHTML = tkQR.svg('https://tim-kofler.at/tools/qr-code/', { logo: tkQR.TK, ink: '#111111', quiet: 0, utf8: true }); });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.screenshot({ path: process.argv[2] || 'og-qr.png' });
  await b.close();
})();
