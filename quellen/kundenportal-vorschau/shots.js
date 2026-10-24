// Screenshots fürs Vorschaubild: Anmeldung, Startansicht nach drei Uploads, QR-Code der Zwei-Faktor-Anmeldung. Aufruf: node shots.js <arbeitsordner>
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const B='http://localhost:8096', O=process.argv[2];
(async()=>{
 const b=await chromium.launch({args:['--no-proxy-server']});
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const p=await ctx.newPage();
 await p.goto(B+'/kunden/'); await p.waitForLoadState('networkidle'); await p.waitForTimeout(1500);
 await p.screenshot({path:O+'/login.png'});
 await p.fill('input[name=benutzer]','baeckerei-muster'); await p.fill('input[name=passwort]','kornspitz-2026');
 await p.click('button[type=submit]'); await p.waitForLoadState('networkidle');
 await p.click('[data-kp-tab=dateien]'); await p.waitForTimeout(400);
 await p.setInputFiles('.kp-pick input',[O+'/up/kornspitz.jpg',O+'/up/verkaufsraum.jpg',O+'/up/logo-baeckerei.png']);
 await p.check('.kp-upload .form__check input').catch(()=>p.click('.kp-upload .form__check input'));
 await p.click('.kp-upload button[type=submit]');
 await p.waitForFunction(()=>!!document.querySelector('.form__status.is-ok'),null,{timeout:30000});
 await p.goto(B+'/kunden/'); await p.waitForLoadState('networkidle'); await p.waitForTimeout(1500);
 await p.screenshot({path:O+'/dash2.png'});
 await p.click('[data-kp-tab=dateien]'); await p.waitForTimeout(500);
 const tf=p.locator('#zweifaktor summary, #zweifaktor').first(); await tf.click().catch(()=>{}); await p.waitForTimeout(800);
 await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>{if(d.closest('#zweifaktor')||d.id==='zweifaktor')d.open=true})); await p.waitForTimeout(800);
 const q=p.locator('.kp-qr').first(); await q.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
 await q.screenshot({path:O+'/qr.png'});
 await b.close();
})();
