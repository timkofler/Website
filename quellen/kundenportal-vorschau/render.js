// Setzt vorschau.html (unter http://localhost:8096/_comp/) in doppelter Auflösung zusammen. Aufruf: node render.js comp2x.png
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--no-proxy-server']});
const p=await b.newPage({viewport:{width:720,height:450},deviceScaleFactor:2});
await p.goto('http://localhost:8096/_comp/'); await p.waitForTimeout(800);
await p.screenshot({path:process.argv[2]}); await b.close();})();
