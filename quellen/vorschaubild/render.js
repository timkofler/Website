const { chromium } = require('playwright');
const V=JSON.parse(require('fs').readFileSync(process.argv[2]));const pre=process.argv[3];
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-proxy-server','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1,reducedMotion:process.env.RM||'no-preference'});
await p.goto(process.env.URL||'http://127.0.0.1:8765/',{waitUntil:'networkidle'});
await p.addStyleTag({content:`
 .header,.tk-chat-btn,.tk-marquee,.tk-free-chip,.btn-row,.lead{display:none!important}
 .tk-hero{padding:0!important;height:630px;display:flex;align-items:center}
 .tk-hero .container{width:100%;max-width:none;padding:0 0 0 72px!important;margin:0}
 .tk-hero h1{font-size:62px!important;max-width:none!important;line-height:1.02;margin-top:18px}
 .tk-hero .label{font-size:15px}
 .og-sub{margin-top:24px;font-size:22px;line-height:1.45;color:#bdbdbd;max-width:34ch}
 .og-chips{display:flex;gap:12px;margin-top:30px}
 .og-chips span{font:600 17px var(--mono);padding:10px 18px;border-radius:999px;border:1px solid rgba(255,255,255,.18);color:#eee;background:rgba(255,255,255,.04)}
 .og-chips span.hot{background:var(--hot-grad);color:#0b0b0b;border-color:transparent}
 .og-url{position:absolute;right:56px;bottom:40px;font:500 20px var(--mono);color:#eee;display:flex;align-items:center;gap:10px;z-index:3}
 .og-url:before{content:"";width:10px;height:10px;background:#ff5a1f;transform:rotate(45deg)}
 .tk-hero__stage{right:40px!important;width:430px!important}
 .tk-hero::after{display:none}
 body{overflow:hidden}
 .tk-hero h1 .lime{animation:none!important;background-position:0 50%!important}
 body:before{content:"";position:fixed;left:0;right:0;top:0;height:4px;background:var(--hot-grad);z-index:5}
`});
await p.evaluate((V)=>{const c=document.querySelector('.tk-hero .container');
 const h=c.querySelector('h1'); h.innerHTML=V.h;if(V.fs)h.style.setProperty('font-size',V.fs+'px','important');
 const s=document.createElement('p');s.className='og-sub';s.textContent=V.s;c.appendChild(s);
 const ch=document.createElement('div');ch.className='og-chips';ch.innerHTML=V.c.map((x,i)=>'<span'+(i?'':' class="hot"')+'>'+x+'</span>').join('');c.appendChild(ch);
 const u=document.createElement('div');u.className='og-url';u.textContent='tim-kofler.at';document.querySelector('.tk-hero').appendChild(u);
 window.scrollTo(0,0);window.dispatchEvent(new Event('resize'));},V);
await p.waitForTimeout(4600);for(let i=0;i<5;i++){await p.screenshot({path:pre+i+'.png'});await p.waitForTimeout(250);}
await b.close();})();

