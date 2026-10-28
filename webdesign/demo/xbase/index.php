<?php require __DIR__ . "/_gate.php"; ?><!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XBASE Aero – Best Aviation Services, Delivered by Xperts</title>
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="XBASE Aero supports airlines, CAMOs, maintenance organisations and operators with engineering, compliance, materials and qualified aviation professionals. Based at Vienna International Airport.">
<meta name="theme-color" content="#f3f7fc">
<link rel="preload" href="assets/fonts/outfit.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<style>
@font-face{font-family:"Outfit";src:url(assets/fonts/outfit.woff2) format("woff2");font-weight:100 900;font-display:swap}
@font-face{font-family:"Inter";src:url(assets/fonts/inter.woff2) format("woff2");font-weight:100 900;font-display:swap}
@font-face{font-family:"Space Mono";src:url(assets/fonts/spacemono-400.woff2) format("woff2");font-weight:400;font-display:swap}
:root{--bg:#f3f7fc;--white:#fff;--ink:#0a1a33;--ink2:#22334f;--mut:#5b6b84;--line:rgba(10,26,51,.1);--line2:rgba(10,26,51,.18);
  --sky:#00b0ff;--blue:#0a6cf0;--deep:#0b3fa8;--navy:#061632;--navy2:#0b2147;--grad:linear-gradient(120deg,#00b8ff,#0a6cf0 55%,#0b3fa8);
  --sans:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;--head:"Outfit","Inter",system-ui,sans-serif;--mono:"Space Mono",ui-monospace,Menlo,Consolas,monospace;--navh:76px}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:calc(var(--navh) + 12px)}
body{margin:0;background:var(--bg);color:var(--ink);font:400 17px/1.62 var(--sans);-webkit-font-smoothing:antialiased;overflow-x:clip}
img,svg{display:block;max-width:100%}
a{color:inherit}
p{margin:0}
h1,h2,h3{margin:0;font-family:var(--head);font-weight:600;line-height:1.04;letter-spacing:-.03em;text-wrap:balance}
.g{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
:focus-visible{outline:2px solid var(--blue);outline-offset:3px;border-radius:6px}
.wrap{width:min(1240px,100% - 40px);margin-inline:auto}
.k{font:400 12px/1.3 var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--blue);display:inline-flex;align-items:center;gap:10px}
.k::before{content:"";width:22px;height:2px;border-radius:2px;background:var(--grad)}
.h2{font-size:clamp(36px,4.8vw,64px);margin-top:16px}
.lead{color:var(--mut);font-size:clamp(17px,1.35vw,19px);max-width:56ch;margin-top:20px}
.sec{padding:clamp(80px,10vw,136px) 0}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:54px;padding:0 26px;border-radius:999px;font:600 16px/1 var(--sans);text-decoration:none;border:0;cursor:pointer;transition:transform .25s,box-shadow .25s,background .25s,border-color .25s}
.btn svg{width:18px;height:18px;transition:transform .25s}
.btn:hover svg{transform:translateX(4px)}
.btn--p{background:var(--grad);color:#fff;box-shadow:0 14px 34px -18px rgba(10,108,240,.9)}
.btn--p:hover{transform:translateY(-2px);box-shadow:0 20px 40px -18px rgba(10,108,240,1)}
.btn--l{border:1px solid var(--line2);color:var(--ink);background:rgba(255,255,255,.7)}
.btn--l:hover{border-color:var(--blue);background:#fff}

/* Kopfleiste */
.nav{position:fixed;inset:0 0 auto;z-index:50;transition:background .3s,box-shadow .3s}
.nav.is-s{background:rgba(243,247,252,.86);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 1px 0 var(--line)}
.nav .wrap{display:flex;align-items:center;justify-content:space-between;height:var(--navh);gap:20px}
.logo img{height:46px;width:auto}
.nav__links{display:flex;gap:2px;margin-left:auto}
.nav__links a{text-decoration:none;font-weight:500;font-size:15px;padding:10px 15px;border-radius:999px;color:var(--ink2);transition:background .2s,color .2s}
.nav__links a:hover{background:rgba(10,108,240,.08);color:var(--blue)}
.lang{display:flex;border:1px solid var(--line2);border-radius:999px;padding:3px;font:400 12px/1 var(--mono)}
.lang span{padding:7px 10px;border-radius:999px;color:var(--mut)}
.lang .on{background:var(--ink);color:#fff}
.nav .btn{min-height:46px;padding:0 20px;font-size:15px}
.burger{display:none;width:48px;height:48px;border-radius:999px;border:1px solid var(--line2);background:rgba(255,255,255,.7);cursor:pointer;place-items:center;color:var(--ink)}
.burger span,.burger span::before,.burger span::after{display:block;width:18px;height:2px;background:currentColor;position:relative;transition:transform .3s,background .3s}
.burger span::before,.burger span::after{content:"";position:absolute;left:0}
.burger span::before{top:-6px}.burger span::after{top:6px}
.burger[aria-expanded="true"] span{background:transparent}
.burger[aria-expanded="true"] span::before{transform:translateY(6px) rotate(45deg)}
.burger[aria-expanded="true"] span::after{transform:translateY(-6px) rotate(-45deg)}
.mpanel{position:fixed;inset:var(--navh) 0 auto 0;z-index:49;background:var(--bg);border-bottom:1px solid var(--line);padding:4px 20px 24px;opacity:0;visibility:hidden;transform:translateY(-10px);transition:opacity .3s,transform .3s,visibility 0s .3s;box-shadow:0 30px 40px -30px rgba(10,26,51,.35)}
.mpanel.open{opacity:1;visibility:visible;transform:none;transition:opacity .3s,transform .3s}
.mpanel a:not(.btn){display:flex;align-items:center;justify-content:space-between;min-height:58px;border-bottom:1px solid var(--line);text-decoration:none;font:600 24px/1 var(--head);letter-spacing:-.02em}
.mpanel a:not(.btn)::after{content:"→";color:var(--blue);font-family:var(--sans);font-size:20px}
.mpanel .btn{width:100%;margin-top:20px}

/* Startbild mit Flugzeug-Bauplan */
.hero{position:relative;min-height:100vh;min-height:100svh;display:flex;align-items:center;padding:calc(var(--navh) + 40px) 0 70px;overflow:hidden;
  background:radial-gradient(70% 70% at 72% 45%,rgba(0,176,255,.16),transparent 70%),
  linear-gradient(rgba(10,108,240,.07) 1px,transparent 1px) 0 0/40px 40px,linear-gradient(90deg,rgba(10,108,240,.07) 1px,transparent 1px) 0 0/40px 40px,var(--bg)}
.hero::after{content:"";position:absolute;inset:auto 0 0;height:160px;background:linear-gradient(transparent,var(--bg));pointer-events:none}
.hero .wrap{position:relative;z-index:2;display:grid;grid-template-columns:minmax(0,1.02fr) minmax(0,1fr);gap:40px;align-items:center}
.hero__tag{display:inline-flex;align-items:center;gap:10px;padding:8px 14px 8px 10px;border-radius:999px;background:#fff;border:1px solid var(--line);font:500 14px/1 var(--sans);color:var(--ink2);box-shadow:0 10px 24px -18px rgba(10,26,51,.4)}
.hero__tag i{width:9px;height:9px;border-radius:50%;background:#18c37e;box-shadow:0 0 0 4px rgba(24,195,126,.18)}
.hero h1{font-size:clamp(44px,5.3vw,80px);margin-top:24px}
.hero .lead{margin-top:26px;font-size:clamp(18px,1.45vw,21px)}
.hero__cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:36px}
.hero__facts{display:flex;flex-wrap:wrap;gap:28px;margin-top:40px;padding-top:26px;border-top:1px solid var(--line);max-width:560px}
.hero__facts div{font:400 12px/1.4 var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--mut)}
.hero__facts b{display:block;font:600 22px/1.1 var(--head);letter-spacing:-.02em;text-transform:none;color:var(--ink);margin-top:6px}
.plan{position:relative;aspect-ratio:1;width:100%;max-width:640px;justify-self:end;perspective:1400px}
.plan__in{position:absolute;inset:0;transform:rotateX(var(--rx,10deg)) rotateY(var(--ry,-8deg));transform-style:preserve-3d;transition:transform .6s cubic-bezier(.2,.7,.2,1)}
.plan__in>svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.ac{transform:rotate(38deg);transform-origin:500px 500px}
.ac .o{fill:rgba(255,255,255,.72);stroke:var(--deep);stroke-width:2.2;stroke-linejoin:round}
.ac .d{fill:none;stroke:rgba(11,63,168,.38);stroke-width:1.1}
.ac .e{fill:rgba(0,176,255,.12);stroke:var(--blue);stroke-width:1.8}
.ac .draw{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 2.4s cubic-bezier(.5,0,.2,1) forwards}
.ac .d.draw{animation-delay:.9s;animation-duration:2s}
@keyframes draw{to{stroke-dashoffset:0}}
.ac .o{fill-opacity:0;animation:fill 1.2s 1.8s forwards}
@keyframes fill{to{fill-opacity:1}}
.dim{font:400 13px/1 var(--mono);fill:var(--mut);letter-spacing:.04em}
.dim-l{stroke:rgba(10,26,51,.3);stroke-width:1;fill:none}
.scan{animation:scan 5.5s 2.4s cubic-bezier(.45,0,.55,1) infinite;opacity:0}
@keyframes scan{0%{transform:translateY(-80px);opacity:0}10%{opacity:1}85%{opacity:1}100%{transform:translateY(1000px);opacity:0}}
.hs{opacity:0;animation:pop .5s forwards}
.hs circle.r{fill:none;stroke:var(--blue);stroke-width:2;transform-box:fill-box;transform-origin:center;animation:ring 2.4s infinite}
@keyframes ring{0%{transform:scale(.6);opacity:1}100%{transform:scale(2.6);opacity:0}}
@keyframes pop{to{opacity:1}}
.chip{position:absolute;display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:14px;background:rgba(255,255,255,.88);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid var(--line);box-shadow:0 18px 40px -24px rgba(10,26,51,.55);font:500 14px/1.2 var(--sans);white-space:nowrap;opacity:0;transform:translateY(10px) translateZ(60px);animation:chip .6s forwards}
.chip small{display:block;font:400 11px/1.3 var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--mut)}
.chip .ok{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:rgba(24,195,126,.14);color:#0f9a62;flex:none}
.chip .ok svg{width:14px;height:14px}
@keyframes chip{to{opacity:1;transform:translateY(0) translateZ(60px)}}
.hero__gl{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none}
.gl-on .plan__in{visibility:hidden}
.hero__chips{position:absolute;inset:0;z-index:3;pointer-events:none}
.hero__chips .chip{opacity:0;will-change:transform,opacity}

/* Leistungen */
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:56px}
.card{position:relative;background:#fff;border:1px solid var(--line);border-radius:24px;padding:34px 30px 32px;overflow:hidden;transition:transform .35s,box-shadow .35s,border-color .35s}
.card:hover{transform:translateY(-4px);box-shadow:0 30px 60px -36px rgba(10,26,51,.45);border-color:rgba(10,108,240,.3)}
.card::before{content:"";position:absolute;inset:0 0 auto;height:3px;background:var(--grad);transform:scaleX(0);transform-origin:left;transition:transform .45s}
.card:hover::before{transform:scaleX(1)}
.card__n{font:400 12px/1 var(--mono);color:var(--mut);letter-spacing:.08em}
.card__i{width:58px;height:58px;border-radius:16px;display:grid;place-items:center;background:linear-gradient(140deg,rgba(0,184,255,.14),rgba(11,63,168,.12));color:var(--blue);margin:22px 0 26px}
.card__i svg{width:28px;height:28px}
.card h3{font-size:27px}
.card p{color:var(--mut);margin-top:12px;font-size:16px}
.card ul{list-style:none;margin:22px 0 0;padding:20px 0 0;border-top:1px solid var(--line);display:grid;gap:10px;font-size:15px;color:var(--ink2)}
.card li{display:flex;gap:10px;align-items:baseline}
.card li::before{content:"";width:6px;height:6px;border-radius:2px;background:var(--blue);transform:rotate(45deg) translateY(-2px);flex:none}

/* Für wen */
.who{display:flex;flex-wrap:wrap;gap:10px;margin-top:40px}
.who span{display:inline-flex;align-items:center;gap:10px;padding:13px 20px;border-radius:999px;background:#fff;border:1px solid var(--line);font-weight:500;font-size:16px}
.who span svg{width:18px;height:18px;color:var(--blue)}

/* Dunkler Abschnitt: Ablauf */
.dark{background:radial-gradient(60% 80% at 85% 0%,rgba(0,176,255,.22),transparent 60%),radial-gradient(50% 60% at 0% 100%,rgba(10,108,240,.2),transparent 60%),var(--navy);color:#eaf2ff;position:relative;overflow:hidden}
.dark::before{content:"";position:absolute;inset:0;background:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px) 0 0/40px 40px,linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px) 0 0/40px 40px;mask:radial-gradient(70% 70% at 50% 40%,#000,transparent);-webkit-mask:radial-gradient(70% 70% at 50% 40%,#000,transparent)}
.dark .wrap{position:relative}
.dark .k{color:#6fd0ff}
.dark .lead{color:#a9bad6}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:64px;position:relative}
.steps::before{content:"";position:absolute;left:0;right:0;top:27px;height:2px;background:linear-gradient(90deg,rgba(111,208,255,.6),rgba(111,208,255,.08))}
.step{padding-right:28px;position:relative;z-index:2}
.steps::after{content:"";position:absolute;z-index:1;left:0;top:27px;height:2px;width:calc(var(--p,0) * 100%);background:linear-gradient(90deg,#00b8ff,#6fd0ff);box-shadow:0 0 12px rgba(0,184,255,.8)}
.steps__fly{position:absolute;top:28px;left:calc(var(--p,0) * 100%);width:30px;height:30px;transform:translate(-50%,-50%) rotate(90deg);color:#fff;filter:drop-shadow(0 0 10px rgba(0,184,255,.9));z-index:2;pointer-events:none}
.step .step__d{z-index:3;transition:background .4s,border-color .4s,color .4s,box-shadow .4s}
.step.on .step__d{background:linear-gradient(140deg,#00b8ff,#0a6cf0);border-color:transparent;color:#fff;box-shadow:0 0 0 8px var(--navy),0 0 30px rgba(0,184,255,.55)}
.step__d{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:var(--navy2);border:1px solid rgba(111,208,255,.45);font:400 15px/1 var(--mono);color:#6fd0ff;position:relative;box-shadow:0 0 0 8px var(--navy)}
.step h3{font-size:24px;margin-top:28px;color:#fff}
.step p{color:#a9bad6;margin-top:10px;font-size:16px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);margin-top:90px;border:1px solid rgba(255,255,255,.1);border-radius:24px;overflow:hidden;background:rgba(255,255,255,.03)}
.stats div{padding:30px 28px;border-right:1px solid rgba(255,255,255,.1)}
.stats div:last-child{border:0}
.stats b{display:block;font:600 clamp(30px,3vw,42px)/1 var(--head);letter-spacing:-.03em;color:#fff}
.stats span{display:block;margin-top:10px;font:400 12px/1.4 var(--mono);letter-spacing:.06em;text-transform:uppercase;color:#8aa0c2}

/* Karriere */
.job{display:grid;grid-template-columns:1.1fr .9fr;gap:22px;align-items:stretch}
.job__main{background:#fff;border:1px solid var(--line);border-radius:28px;padding:clamp(32px,4vw,56px)}
.job__list{display:grid;gap:12px}
.job__item{display:flex;align-items:center;justify-content:space-between;gap:16px;background:#fff;border:1px solid var(--line);border-radius:20px;padding:22px 24px;text-decoration:none;transition:border-color .25s,transform .25s}
.job__item:hover{border-color:var(--blue);transform:translateX(4px)}
.job__item b{display:block;font:600 19px/1.2 var(--head);letter-spacing:-.01em}
.job__item small{display:block;color:var(--mut);font-size:14px;margin-top:4px}
.job__item svg{width:22px;height:22px;color:var(--blue);flex:none}
.tagx{display:inline-block;font:400 11px/1 var(--mono);letter-spacing:.06em;text-transform:uppercase;padding:6px 9px;border-radius:999px;background:rgba(10,108,240,.08);color:var(--blue);margin:0 0 8px}

/* Team */
.team{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:52px}
.person{display:flex;gap:22px;align-items:center;background:#fff;border:1px solid var(--line);border-radius:24px;padding:24px}
.avatar{width:96px;height:96px;border-radius:22px;flex:none;display:grid;place-items:center;background:var(--grad);color:#fff;font:600 30px/1 var(--head);letter-spacing:-.02em;position:relative}
.avatar::after{content:"Photo";position:absolute;bottom:6px;font:400 9px/1 var(--mono);letter-spacing:.1em;text-transform:uppercase;opacity:.7}
.person b{display:block;font:600 22px/1.2 var(--head);letter-spacing:-.02em}
.person span{display:block;color:var(--blue);font-size:14px;font-weight:600;margin-top:4px}
.person p{color:var(--mut);font-size:15px;margin-top:8px}

/* Kontakt */
.contact{display:grid;grid-template-columns:.9fr 1.1fr;gap:22px;margin-top:56px}
.cbox{border-radius:28px;padding:clamp(30px,3.6vw,48px)}
.cbox--d{background:var(--navy);color:#eaf2ff;position:relative;overflow:hidden}
.cbox--d::after{content:"";position:absolute;width:420px;height:420px;right:-160px;bottom:-200px;border-radius:50%;background:radial-gradient(rgba(0,176,255,.35),transparent 65%)}
.cbox--d h3{font-size:30px;color:#fff}
.cbox--d{display:flex;flex-direction:column}
.rwy{margin-top:auto;padding-top:36px;position:relative;z-index:1}
.rwy svg{width:100%;max-width:420px;height:auto}
.rwy small{display:block;font:400 11px/1.4 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:#6c83a8;margin-top:10px}
.cline{display:flex;gap:16px;align-items:flex-start;margin-top:28px;position:relative;z-index:1}
.cline svg{width:22px;height:22px;color:#6fd0ff;flex:none;margin-top:3px}
.cline small{display:block;font:400 11px/1.4 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:#8aa0c2}
.cline b{font-weight:500;font-size:17px}
.cbox--f{background:#fff;border:1px solid var(--line)}
.form{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.form label{display:grid;gap:8px;font-size:14px;font-weight:500;color:var(--ink2)}
.form .full{grid-column:1/-1}
.form input,.form select,.form textarea{font:inherit;font-size:16px;color:var(--ink);background:var(--bg);border:1px solid var(--line2);border-radius:14px;padding:14px 16px;width:100%;transition:border-color .2s,box-shadow .2s;appearance:none}
.form textarea{min-height:120px;resize:vertical}
.form input:focus,.form select:focus,.form textarea:focus{outline:0;border-color:var(--blue);box-shadow:0 0 0 4px rgba(10,108,240,.12);background:#fff}
.seg{display:flex;flex-wrap:wrap;gap:8px}
.seg button{font:500 15px/1 var(--sans);padding:12px 16px;border-radius:999px;border:1px solid var(--line2);background:#fff;color:var(--ink2);cursor:pointer;transition:all .2s}
.seg button[aria-pressed="true"]{background:var(--ink);color:#fff;border-color:var(--ink)}
.form .btn{justify-self:start}
.note{font-size:13px;color:var(--mut)}

/* Fuß */
.foot{background:var(--navy);color:#a9bad6;padding:70px 0 34px;margin-top:clamp(80px,10vw,136px)}
.foot__top{display:flex;justify-content:space-between;gap:40px;flex-wrap:wrap;padding-bottom:40px;border-bottom:1px solid rgba(255,255,255,.1)}
.foot img{height:50px;width:auto}
.foot__top p{max-width:36ch;margin-top:18px;font-size:15px}
.foot__nav{display:flex;gap:56px;flex-wrap:wrap}
.foot__nav div{display:grid;gap:10px;font-size:15px;align-content:start}
.foot__nav small{font:400 11px/1.4 var(--mono);letter-spacing:.1em;text-transform:uppercase;color:#6c83a8;margin-bottom:4px}
.foot a{text-decoration:none}
.foot a:hover{color:#fff}
.foot__bot{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;padding-top:26px;font-size:13px}

/* Hinweis Entwurf */
.draft{position:fixed;left:16px;bottom:16px;z-index:60;display:flex;align-items:center;gap:10px;padding:9px 14px 9px 10px;border-radius:999px;background:#0b0b0b;color:#f4f4f0;font:500 12.5px/1 var(--sans);box-shadow:0 12px 30px -12px rgba(0,0,0,.6);text-decoration:none}
.draft img{height:15px;width:auto}

.rv{opacity:0;transform:translateY(24px);transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)}
.rv.in{opacity:1;transform:none}

@media (max-width:1100px){
  .nav__links,.nav .lang,.nav .btn{display:none}
  .burger{display:grid}
}
@media (max-width:960px){
  .hero{align-items:flex-start;min-height:0;padding-top:calc(var(--navh) + 26px);padding-bottom:20px}
  .hero .wrap{grid-template-columns:1fr;gap:10px}
  .plan{max-width:520px;justify-self:center;margin:-10px auto -40px;order:2}
  .cards,.team,.contact,.job{grid-template-columns:1fr}
  .steps{grid-template-columns:1fr 1fr;row-gap:44px}
  .steps::before,.steps::after,.steps__fly{display:none}
  .stats{grid-template-columns:1fr 1fr}
  .stats div:nth-child(2){border-right:0}
  .stats div:nth-child(-n+2){border-bottom:1px solid rgba(255,255,255,.1)}
}
@media (max-width:600px){
  :root{--navh:68px}
  body{font-size:16px}
  .wrap{width:calc(100% - 32px)}
  .logo img{height:38px}
  .hero h1{font-size:clamp(40px,11.4vw,54px);margin-top:22px}
  .hero__facts{display:none}
  .hero .lead{font-size:17px}
  .draft span{display:none}
  .draft{padding:10px 12px}
  .hero__cta .btn{flex:1 1 100%}
  .chip{font-size:12.5px;padding:8px 11px;border-radius:12px}
  .chip .ok{width:22px;height:22px}
  .steps{grid-template-columns:1fr;row-gap:34px}
  .step{padding-right:0;display:grid;grid-template-columns:56px 1fr;column-gap:20px;align-content:start}
  .step__d{grid-row:span 2}
  .step h3{margin-top:12px}
  .step p{grid-column:2;margin-top:6px}
  .plan{width:calc(100% + 24px);max-width:none;margin:0 -12px -30px}
  .form{grid-template-columns:1fr}
  .person{padding:18px;gap:16px}
  .avatar{width:76px;height:76px;font-size:24px;border-radius:18px}
  .card{padding:28px 24px}
  .foot__nav{gap:36px}
}
@media (prefers-reduced-motion:reduce){
  *{animation-duration:.01ms!important;animation-iteration-count:1!important;transition:none!important}
  .scan{display:none}
  .rv{opacity:1;transform:none}
}

/* Himmel mit Wolken */
.hero{background:linear-gradient(180deg,#5aaef6 0%,#8fcbfb 38%,#cde9ff 72%,var(--bg) 100%)}
.hero::before{content:"";position:absolute;inset:0;background:radial-gradient(60% 50% at 78% 30%,rgba(255,255,255,.55),transparent 70%);pointer-events:none}
.sky{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none}
.sky img{position:absolute;left:0;max-width:none;height:auto;opacity:.95;will-change:transform;animation:drift linear infinite}
.sky .c1{top:9%;width:min(760px,90vw);animation-duration:120s;animation-delay:-40s}
.sky .c2{top:30%;width:min(520px,70vw);animation-duration:90s;animation-delay:-70s;opacity:.85}
.sky .c3{top:58%;width:min(900px,110vw);animation-duration:150s;animation-delay:-20s;opacity:.9}
.sky .c4{top:18%;width:min(420px,60vw);animation-duration:75s;animation-delay:-10s;opacity:.7;filter:blur(1px)}
.sky .c5{top:74%;width:min(640px,90vw);animation-duration:110s;animation-delay:-95s}
@keyframes drift{from{transform:translateX(-110%)}to{transform:translateX(110vw)}}
.nav{background:rgba(255,255,255,.62);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 1px 0 rgba(255,255,255,.5)}
.nav.is-s{background:rgba(243,247,252,.9)}
.hero .lead{color:var(--ink2)}
.hero__tag{background:rgba(255,255,255,.85)}
.hero h1 .l2{display:block;margin-top:.08em}
@media (min-width:961px){.hero h1{font-size:clamp(40px,4.3vw,66px)}.hero .wrap{grid-template-columns:minmax(0,1.12fr) minmax(0,.88fr)}.hero h1 .l2{white-space:nowrap}}
.xp{position:relative;display:inline-block;padding-bottom:.12em}
.xp b{font-weight:700;font-style:italic;font-size:1.18em;line-height:.8;background:linear-gradient(135deg,#00c2ff,#0a6cf0 50%,#0b3fa8);-webkit-background-clip:text;background-clip:text;color:transparent;padding-right:.04em}
.xp svg{position:absolute;left:-2%;bottom:-.08em;width:104%;height:.3em;overflow:visible}
.xp path{fill:none;stroke:url(#sw);stroke-width:5;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.4s .5s cubic-bezier(.5,0,.2,1) forwards}
.hero__facts{border-top-color:rgba(10,26,51,.14)}

/* Services */
.cards--7{grid-template-columns:repeat(4,1fr);gap:16px}
.cards--7 .card{padding:30px 26px 28px}
.cards--7 .card h3{font-size:22px;line-height:1.12}
.cards--7 .card p{font-size:15.5px}
.cards--7 .card__i{margin:20px 0 22px}
.card--cta{background:var(--navy);color:#eaf2ff;border-color:transparent;display:flex;flex-direction:column;text-decoration:none}
.card--cta::after{content:"";position:absolute;width:300px;height:300px;right:-120px;bottom:-140px;border-radius:50%;background:radial-gradient(rgba(0,176,255,.4),transparent 65%)}
.card--cta h3{color:#fff}
.card--cta p{color:#a9bad6}
.card--cta .card__n{color:#6fd0ff}
.card--cta .card__i{background:rgba(111,208,255,.14);color:#6fd0ff}
.card--cta .more{margin-top:auto;padding-top:22px;display:inline-flex;align-items:center;gap:8px;font-weight:600;color:#fff;position:relative;z-index:1}
.card--cta .more svg{width:18px;height:18px;transition:transform .25s}
.card--cta:hover .more svg{transform:translateX(4px)}

/* Bildband mit Flugzeug */
.band{position:relative;min-height:clamp(420px,52vw,640px);display:flex;align-items:flex-end;overflow:hidden;color:#fff}
.band img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 45%}
.band::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,22,50,0) 35%,rgba(6,22,50,.72))}
.band .wrap{position:relative;z-index:1;padding-bottom:clamp(34px,5vw,64px)}
.band p{font:600 clamp(30px,4.2vw,58px)/1.02 var(--head);letter-spacing:-.03em;max-width:16ch;text-shadow:0 6px 30px rgba(0,0,0,.25)}
.band small{display:block;margin-top:14px;font:400 12px/1.4 var(--mono);letter-spacing:.1em;text-transform:uppercase;color:#cfe6ff}

/* About */
.about{display:grid;grid-template-columns:1fr 1fr;gap:clamp(30px,5vw,72px);align-items:center}
.about__pics{display:grid;grid-template-columns:1.1fr .9fr;gap:14px;align-items:end}
.about__pics img{width:100%;border-radius:22px;object-fit:cover;box-shadow:0 30px 60px -36px rgba(10,26,51,.55)}
.about__pics img:first-child{aspect-ratio:4/5;object-position:50% 78%}
.about__pics img:last-child{aspect-ratio:1;margin-bottom:-36px}
.vals{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:30px}
.vals div{background:#fff;border:1px solid var(--line);border-radius:18px;padding:18px 18px 16px}
.vals b{display:block;font:600 18px/1.2 var(--head);letter-spacing:-.01em}
.vals span{display:block;color:var(--mut);font-size:14.5px;margin-top:6px;line-height:1.5}
.who-t{margin-top:clamp(70px,8vw,110px)}

/* Referenzen */
.refs{display:grid;grid-template-columns:.9fr 1.1fr;gap:22px;align-items:stretch;margin-top:48px}
.ref{background:#fff;border:1px solid var(--line);border-radius:28px;padding:clamp(28px,4vw,48px);display:grid;place-items:center;min-height:240px}
.ref img{width:min(320px,80%);height:auto}
.ref__txt{background:linear-gradient(140deg,rgba(0,184,255,.1),rgba(11,63,168,.08));border:1px solid rgba(10,108,240,.16);border-radius:28px;padding:clamp(28px,4vw,48px);display:flex;flex-direction:column;justify-content:center}
.ref__txt q{font:500 clamp(22px,2.2vw,28px)/1.3 var(--head);letter-spacing:-.02em;quotes:none}
.ref__txt small{display:block;margin-top:18px;font:400 12px/1.4 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}

/* Kontakt-Reiter */
.tabs{display:inline-flex;gap:4px;padding:4px;border-radius:999px;background:var(--bg);border:1px solid var(--line2);margin-bottom:24px}
.tabs button{font:600 15px/1 var(--sans);padding:12px 18px;border-radius:999px;border:0;background:transparent;color:var(--ink2);cursor:pointer;transition:background .2s,color .2s}
.tabs button[aria-selected="true"]{background:var(--ink);color:#fff}
.pane[hidden]{display:none}
.seg--aog button[aria-pressed="true"][data-v="AOG"]{background:#e5484d;border-color:#e5484d}
@media (min-width:961px){.band .wrap{display:flex;flex-direction:column;align-items:flex-end;text-align:right}}
@media (max-width:1100px){.cards--7{grid-template-columns:repeat(2,1fr)}}
@media (max-width:960px){.about,.refs{grid-template-columns:1fr}.about__pics img:last-child{margin-bottom:0}.about__pics{grid-template-columns:1fr 1fr}.about__pics img:first-child,.about__pics img:last-child{aspect-ratio:4/5}.band img{object-position:28% 50%}}
@media (max-width:600px){.cards--7{grid-template-columns:1fr}.cards--7 .card{display:grid;grid-template-columns:48px 1fr;column-gap:16px;align-items:center;padding:22px 20px}.cards--7 .card__n{display:none}.cards--7 .card__i{width:48px;height:48px;border-radius:14px;margin:0}.cards--7 .card__i svg{width:24px;height:24px}.cards--7 .card h3{font-size:19px}.cards--7 .card p{grid-column:1/-1;margin-top:12px;font-size:15px}.card--cta .more{grid-column:1/-1;padding-top:16px}.hero h1{font-size:clamp(36px,10.4vw,46px)}.band p{font-size:30px}.vals{grid-template-columns:1fr}.tabs{display:flex}.tabs button{flex:1;padding:12px 10px}}
@media (prefers-reduced-motion:reduce){.sky img{animation:none!important;transform:translateX(8vw)}.sky .c2{transform:translateX(55vw)}.sky .c5{transform:translateX(35vw)}.xp path{stroke-dashoffset:0}}

/* Feinschliff Handy (28.10.) */
.foot{padding-bottom:84px}
.sky .c1{animation-duration:62s}.sky .c2{animation-duration:48s}.sky .c3{animation-duration:80s}.sky .c4{animation-duration:40s}.sky .c5{animation-duration:58s}
.draft{transition:transform .35s cubic-bezier(.2,.7,.2,1),opacity .35s}
.draft.hide{transform:translateY(140%);opacity:0;pointer-events:none}
.stats b{background:linear-gradient(120deg,#fff 30%,#6fd0ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.foot__cta{display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap;padding:34px clamp(24px,4vw,48px);margin-bottom:56px;border-radius:28px;background:radial-gradient(60% 120% at 100% 0%,rgba(0,184,255,.35),transparent 60%),linear-gradient(140deg,#0a2a66,#0b3fa8);border:1px solid rgba(111,208,255,.18);position:relative;overflow:hidden}
.foot__cta h2{font-size:clamp(30px,3.4vw,44px);color:#fff}
.foot__cta p{color:#bcd3f2;margin-top:8px;font-size:16px}
.foot__cta .hero__cta{margin-top:0}
.foot__cta .btn--l{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.25);color:#fff}
.foot__cta .btn--l:hover{background:rgba(255,255,255,.18)}
.foot__cta .btn--w{background:#fff;color:var(--ink)}
@media (max-width:960px){
  .about__pics{grid-template-columns:1fr;gap:14px}
  .about__pics img:first-child,.about__pics img:last-child{aspect-ratio:4/3;object-position:50% 50%;margin:0}
}
@media (max-width:600px){
  .hero h1{font-size:calc((100vw - 32px) * .106);line-height:1.06}
  .hero h1 .l2{white-space:nowrap;margin-top:.04em}
  .plan{margin-bottom:-70px}
  #services{padding-top:44px}
  .steps{row-gap:30px;padding-left:0}
  .steps::before,.steps::after{display:block;left:27px;right:auto;top:28px;bottom:28px;width:2px;height:auto}
  .steps::before{background:linear-gradient(180deg,rgba(111,208,255,.6),rgba(111,208,255,.08))}
  .steps::after{bottom:auto;height:calc(var(--p,0) * (100% - 56px));background:linear-gradient(180deg,#00b8ff,#6fd0ff)}
  .steps__fly{display:block;left:28px;top:calc(28px + var(--p,0) * (100% - 56px));transform:translate(-50%,-50%) rotate(180deg);width:26px;height:26px;z-index:1}
  .stats{margin-top:64px}
  .stats div{padding:24px 20px}
  .job__main{padding:30px 24px}
  .job__item{padding:20px}
  .cbox{padding:28px 22px}
  .foot{padding-top:44px}
  .foot__cta{padding:28px 22px;margin-bottom:44px}
  .foot__cta .hero__cta,.foot__cta .btn{width:100%}
  .foot__top{gap:30px}
  .foot__bot{flex-direction:column;gap:8px;padding-bottom:64px;line-height:1.5}
}
</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="sw" x1="0" x2="1"><stop offset="0" stop-color="#0a6cf0" stop-opacity="0"/><stop offset=".25" stop-color="#00b8ff"/><stop offset="1" stop-color="#0b3fa8"/></linearGradient></defs></svg>

<header class="nav" id="nav">
  <div class="wrap">
    <a class="logo" href="#top" aria-label="XBASE Aero – back to top"><img src="assets/img/xbase-logo.webp" width="600" height="164" alt="XBASE Aero"></a>
    <nav class="nav__links" aria-label="Main menu">
      <a href="#services">Services</a><a href="#about">About us</a><a href="#references">References</a><a href="#careers">Careers</a><a href="#contact">Contact</a>
    </nav>
    <a class="btn btn--p" href="#contact" data-tab="material">Material request</a>
    <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="mpanel"><span></span></button>
  </div>
</header>
<div class="mpanel" id="mpanel">
  <a href="#services">Services</a><a href="#about">About us</a><a href="#references">References</a><a href="#careers">Careers</a><a href="#contact">Contact</a>
  <a class="btn btn--p" href="#contact" data-tab="material">Material request</a>
</div>

<main id="top">
<section class="hero">
  <div class="sky" aria-hidden="true">
    <img class="c1" src="assets/img/wolke-1.webp" width="1400" height="560" alt="">
    <img class="c4" src="assets/img/wolke-2.webp" width="1000" height="460" alt="">
    <img class="c2" src="assets/img/wolke-2.webp" width="1000" height="460" alt="">
    <img class="c3" src="assets/img/wolke-3.webp" width="1600" height="420" alt="">
    <img class="c5" src="assets/img/wolke-1.webp" width="1400" height="560" alt="">
  </div>
  <div class="wrap">
    <div>
      <span class="hero__tag"><i></i>Based at Vienna International Airport</span>
      <h1>Best Aviation Services <span class="l2"><span class="g">Delivered by</span> <span class="xp"><b>X</b><span class="g">perts.</span><svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M4 18 C 90 4, 200 2, 296 10"/></svg></span></span></h1>
      <p class="lead">XBASE Aero supports airlines, CAMOs, maintenance organisations and operators with engineering, compliance, materials and qualified aviation professionals. One partner, one point of contact.</p>
      <div class="hero__cta">
        <a class="btn btn--p" href="#contact">Get in touch <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
        <a class="btn btn--l" href="#services">Our services</a>
      </div>
      <div class="hero__facts">
        <div>Location<b>Vienna Airport · VIE</b></div>
        <div>Services<b>7 areas, one partner</b></div>
      </div>
    </div>

    <div class="plan" id="plan" aria-hidden="true">
      <div class="plan__in">
        <svg viewBox="0 0 1000 1000">
          <defs>
            <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#00b8ff" stop-opacity="0"/><stop offset=".85" stop-color="#00b8ff" stop-opacity=".22"/><stop offset="1" stop-color="#00b8ff" stop-opacity=".9"/></linearGradient>
            <clipPath id="acclip"><use href="#acshape"/></clipPath>
          </defs>
          
          <g class="dimg" opacity=".9">
            <circle cx="500" cy="500" r="430" class="dim-l" stroke-dasharray="2 8"/>
            <circle cx="500" cy="500" r="330" class="dim-l" stroke-dasharray="1 10" opacity=".7"/>
            <path class="dim-l" d="M500 40v30M500 930v30M40 500h30M930 500h30"/>
            <text class="dim" x="512" y="58">N 48°06′</text>
            <text class="dim" x="868" y="488">E 16°34′</text>
            <text class="dim" x="60" y="960">VIE · LOWW · RWY 11/29</text>
          </g>
          <g class="ac">
            <g id="acshape">
              
              <path class="o draw" pathLength="1" d="M466 436 L150 612 C138 619 132 630 134 640 L142 648 L466 566 Z"/>
              <path class="o draw" pathLength="1" d="M534 436 L850 612 C862 619 868 630 866 640 L858 648 L534 566 Z"/>
              
              <path class="o draw" pathLength="1" d="M468 806 L340 870 C334 874 333 884 338 888 L468 862 Z"/>
              <path class="o draw" pathLength="1" d="M532 806 L660 870 C666 874 667 884 662 888 L532 862 Z"/>
              
              <path class="o draw" pathLength="1" d="M500 78 C524 80 535 130 535 196 L535 820 C535 868 518 906 500 920 C482 906 465 868 465 820 L465 196 C465 130 476 80 500 78 Z"/>
            </g>
            
            <rect class="e draw" pathLength="1" x="311" y="468" width="38" height="108" rx="17"/>
            <rect class="e draw" pathLength="1" x="651" y="468" width="38" height="108" rx="17"/>
            
            <path class="d draw" pathLength="1" d="M478 132 Q500 118 522 132 M474 150 Q500 138 526 150"/>
            <path class="d draw" pathLength="1" d="M465 240h70M465 300h70M465 380h70M465 620h70M465 700h70M465 760h70"/>
            <path class="d draw" pathLength="1" d="M500 790 L500 918"/>
            <path class="d draw" pathLength="1" d="M300 545 L190 598 M300 545 L330 538 M700 545 L810 598 M700 545 L670 538"/>
            <path class="d draw" pathLength="1" d="M466 520 L230 606 M534 520 L770 606"/>
            <path class="d draw" pathLength="1" d="M470 200 v14 M530 200 v14 M470 840 v12 M530 840 v12"/>
            
            <g clip-path="url(#acclip)"><rect class="scan" x="0" y="-120" width="1000" height="120" fill="url(#sg)"/></g>
            
            <g class="hs" style="animation-delay:2.6s"><circle class="r" cx="500" cy="138" r="10"/><circle cx="500" cy="138" r="6" fill="#0a6cf0"/></g>
            <g class="hs" style="animation-delay:3.1s"><circle class="r" cx="330" cy="522" r="10"/><circle cx="330" cy="522" r="6" fill="#0a6cf0"/></g>
            <g class="hs" style="animation-delay:3.6s"><circle class="r" cx="500" cy="540" r="10"/><circle cx="500" cy="540" r="6" fill="#0a6cf0"/></g>
            <g class="hs" style="animation-delay:4.1s"><circle class="r" cx="600" cy="840" r="10"/><circle cx="600" cy="840" r="6" fill="#0a6cf0"/></g>
          </g>
        </svg>
        <div class="chip" style="left:56%;top:7%;animation-delay:2.9s"><span class="ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L19 7"/></svg></span><span><small>Avionics</small>System check</span></div>
        <div class="chip" style="left:2%;top:30%;animation-delay:3.4s"><span class="ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L19 7"/></svg></span><span><small>Engine</small>Inspected</span></div>
        <div class="chip" style="left:60%;top:56%;animation-delay:3.9s"><span class="ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L19 7"/></svg></span><span><small>Workforce</small>Ready</span></div>
        <div class="chip" style="left:10%;top:80%;animation-delay:4.4s"><span class="ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L19 7"/></svg></span><span><small>Structure</small>Released</span></div>
      </div>
    </div>
  </div>
</section>

<section class="sec" id="services">
  <div class="wrap">
    <span class="k rv">Services</span>
    <h2 class="h2 rv">Everything your operation needs. <span class="g">From one partner.</span></h2>
    <p class="lead rv">From continuing airworthiness to parts and people: we support you where you need it, for a single task or as a long-term partner.</p>
    <div class="cards cards--7">
      <article class="card rv">
        <span class="card__n">01</span>
        <div class="card__i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/></svg></div>
        <h3>CAMO Technical Support &amp; Engineering</h3>
        <p>Support for continuing airworthiness: maintenance programmes, AD and SB evaluation, reliability and technical records.</p>
      </article>
      <article class="card rv">
        <span class="card__n">02</span>
        <div class="card__i"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg></div>
        <h3>Flight Operations Engineering</h3>
        <p>Engineering support for your flight operations, from performance and weight and balance to operational procedures.</p>
      </article>
      <article class="card rv">
        <span class="card__n">03</span>
        <div class="card__i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg></div>
        <h3>Compliance Monitoring &amp; Safety Management</h3>
        <p>Audits, compliance monitoring and SMS support that keep your organisation safe and ready for the next inspection.</p>
      </article>
      <article class="card rv">
        <span class="card__n">04</span>
        <div class="card__i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg></div>
        <h3>Aviation Documentation &amp; Publication</h3>
        <p>Manuals, procedures and technical publications, written, revised and kept up to date with current requirements.</p>
      </article>
      <article class="card rv">
        <span class="card__n">05</span>
        <div class="card__i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg></div>
        <h3>Aircraft Materials &amp; Logistics</h3>
        <p>Sourcing of parts and materials, from routine orders to AOG situations. Fast, traceable and with the right paperwork.</p>
      </article>
      <article class="card rv">
        <span class="card__n">06</span>
        <div class="card__i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.5A6.5 6.5 0 0 1 21.5 20"/></svg></div>
        <h3>Aviation Workforce Solutions</h3>
        <p>Qualified engineers, technicians and specialists for short-term peaks, projects or long-term support.</p>
      </article>
      <article class="card rv">
        <span class="card__n">07</span>
        <div class="card__i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16M6 15l4-4 3 3 6-7"/><path d="M15 7h4v4"/></svg></div>
        <h3>Technical Consulting &amp; Project Management</h3>
        <p>Hands-on experience for your projects, from first planning to handover, including fleet and entry-into-service projects.</p>
      </article>
      <a class="card card--cta rv" href="#contact" data-tab="material">
        <span class="card__n">AOG?</span>
        <div class="card__i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div>
        <h3>Need a part, fast?</h3>
        <p>Send us your material request with part number and quantity. We take care of the rest.</p>
        <span class="more">Material request <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>
    </div>
    <div class="who rv" aria-label="Who we work for">
      <span><svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>Airlines</span>
      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/></svg>CAMOs</span>
      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V9l9-6 9 6v12"/><path d="M7 21v-7h10v7"/></svg>Maintenance organisations</span>
      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 6 6 .9-4.5 4.3 1 6.3L12 16.6 6.5 19.5l1-6.3L3 8.9 9 8z"/></svg>Business aviation</span>
      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/></svg>Operators</span>
    </div>
  </div>
</section>

<section class="band" aria-label="XBASE Aero">
  <img src="assets/img/xbase-flugzeug.webp" srcset="assets/img/xbase-flugzeug-1000.webp 1000w, assets/img/xbase-flugzeug.webp 2000w" sizes="100vw" width="2000" height="1333" alt="Aircraft in XBASE Aero livery above the clouds" loading="lazy">
  <div class="wrap rv"><p>Best Aviation Services. Delivered by Xperts.</p><small>XBASE Aero · Vienna</small></div>
</section>

<section class="sec" id="about">
  <div class="wrap">
    <div class="about">
      <div>
        <span class="k rv">About us</span>
        <h2 class="h2 rv">From aviation. <span class="g">For aviation.</span></h2>
        <p class="lead rv">XBASE Aero was founded in 2026 at Vienna International Airport. We bring together experience from engineering, operations and maintenance, and we know what counts in day-to-day aviation: safety, speed and reliability.</p>
        <div class="vals">
          <div class="rv"><b>Xpertise</b><span>People who have worked in the industry and speak your language.</span></div>
          <div class="rv"><b>Fast response</b><span>Short decision paths and a direct line to the people in charge.</span></div>
          <div class="rv"><b>Compliance first</b><span>Every job done with the regulations and your approvals in mind.</span></div>
          <div class="rv"><b>One partner</b><span>Seven service areas, one point of contact for your organisation.</span></div>
        </div>
      </div>
      <div class="about__pics rv">
        <img src="assets/img/cockpit-800.webp" srcset="assets/img/cockpit-800.webp 800w, assets/img/cockpit.webp 1600w" sizes="(max-width:960px) 100vw, 28vw" width="800" height="600" alt="Cockpit overhead panel" loading="lazy">
        <img src="assets/img/triebwerk-800.webp" srcset="assets/img/triebwerk-800.webp 800w, assets/img/triebwerk.webp 1600w" sizes="(max-width:960px) 100vw, 22vw" width="800" height="600" alt="Aircraft engine on the apron" loading="lazy">
      </div>
    </div>

    <div class="who-t" id="team">
      <span class="k rv">Who we are</span>
      <h2 class="h2 rv">The people <span class="g">behind XBASE.</span></h2>
      <div class="team">
        <div class="person rv"><div class="avatar">NG</div><div><b>Nikolaos Gialuris</b><span>Managing Director</span><p>Your contact for engineering, materials and workforce.</p></div></div>
        <div class="person rv"><div class="avatar">CR</div><div><b>Christoph Ritschl</b><span>Managing Director</span><p>Your contact for consulting and projects.</p></div></div>
      </div>
    </div>
  </div>
</section>

<section class="sec" id="references" style="padding-top:0">
  <div class="wrap">
    <span class="k rv">References</span>
    <h2 class="h2 rv">Trusted <span class="g">in the industry.</span></h2>
    <div class="refs">
      <div class="ref rv"><img src="assets/img/peoples-logo.webp" width="700" height="302" alt="People's Airline"></div>
      <div class="ref__txt rv"><q>People's, the airline connecting Vienna and St. Gallen-Altenrhein, works with XBASE Aero.</q><small>Reference customer · Airline</small></div>
    </div>
  </div>
</section>

<section class="sec dark" id="process">
  <div class="wrap">
    <span class="k rv">How it works</span>
    <h2 class="h2 rv" style="color:#fff">From request <span class="g" style="background-image:linear-gradient(120deg,#6fd0ff,#3d8bff)">to take-off.</span></h2>
    <p class="lead rv">Clear steps, quick decisions. You always know who your contact is and when things start.</p>
    <div class="steps">
      <div class="step rv"><span class="step__d">01</span><h3>Request</h3><p>Tell us briefly what you need, by form, e-mail or phone.</p></div>
      <div class="step rv"><span class="step__d">02</span><h3>Scope</h3><p>We agree on scope, qualifications, timing and location.</p></div>
      <div class="step rv"><span class="step__d">03</span><h3>Solution</h3><p>You receive a clear offer and the right people or parts.</p></div>
      <div class="step rv"><span class="step__d">04</span><h3>Support</h3><p>We stay with you and look after the job until it is done.</p></div>
    </div>
    <div class="stats rv">
      <div><b>VIE</b><span>Based at Vienna Airport</span></div>
      <div><b>7</b><span>Service areas</span></div>
      <div><b>1</b><span>Point of contact</span></div>
      <div><b>2026</b><span>Founded in Schwechat</span></div>
    </div>
  </div>
</section>

<section class="sec" id="careers">
  <div class="wrap job">
    <div class="job__main rv">
      <span class="k">Careers</span>
      <h2 class="h2">Take off with <span class="g">XBASE Aero.</span></h2>
      <p class="lead">You work in aviation and are looking for interesting assignments, fair conditions and a team that knows you? Get in touch, even if there is no matching vacancy.</p>
      <div class="hero__cta"><a class="btn btn--p" href="#contact" data-topic="Careers">Apply now <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>
    </div>
    <div class="job__list">
      <a class="job__item rv" href="#contact" data-topic="Careers"><span><span class="tagx">Example</span><b>Aircraft Technician B1/B2 (m/f/d)</b><small>Vienna Airport · Full-time</small></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
      <a class="job__item rv" href="#contact" data-topic="Careers"><span><span class="tagx">Example</span><b>CAMO Engineer (m/f/d)</b><small>Vienna · Full-time</small></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
      <a class="job__item rv" href="#contact" data-topic="Careers"><span><span class="tagx">Example</span><b>Technical Writer Aviation (m/f/d)</b><small>Office or remote · Part-time possible</small></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
      <a class="job__item rv" href="#contact" data-topic="Careers"><span><b>Open application</b><small>We will get back to you within a few days</small></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
    </div>
  </div>
</section>

<section id="contact" style="padding-top:0">
  <div class="wrap">
    <span class="k rv">Contact</span>
    <h2 class="h2 rv">How can we <span class="g">help?</span></h2>
    <div class="contact">
      <div class="cbox cbox--d rv">
        <h3>XBASE Aero AM GmbH</h3>
        <div class="cline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg><div><small>Address</small><b>Tower Straße 3/VAC 8<br>1300 Vienna Airport, Austria</b></div></div>
        <div class="cline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg><div><small>E-mail</small><b>office@xbase.aero</b></div></div>
        <div class="cline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg><div><small>Phone</small><b>+43 … (to follow)</b></div></div>
        <div class="cline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><div><small>Office hours</small><b>Mon–Fri, 8 am – 5 pm</b></div></div>
        <div class="rwy" aria-hidden="true"><svg viewBox="0 0 420 150" fill="none"><g stroke="rgba(111,208,255,.55)" stroke-width="10" stroke-linecap="round"><path d="M30 40 L390 96"/><path d="M250 12 L300 140"/></g><g stroke="#061632" stroke-width="1.6" stroke-dasharray="8 8"><path d="M30 40 L390 96"/><path d="M250 12 L300 140"/></g><circle cx="262" cy="74" r="7" fill="#00b8ff"/><circle cx="262" cy="74" r="16" stroke="#00b8ff" stroke-opacity=".4"/><text x="282" y="70" fill="#eaf2ff" font-family="Space Mono,monospace" font-size="12">XBASE Aero</text><text x="30" y="30" fill="#6c83a8" font-family="Space Mono,monospace" font-size="10">RWY 11</text><text x="330" y="140" fill="#6c83a8" font-family="Space Mono,monospace" font-size="10">RWY 34</text></svg><small>Vienna International Airport · LOWW</small></div>
      </div>
      <div class="cbox cbox--f rv">
        <div class="tabs" role="tablist" aria-label="Request type">
          <button type="button" role="tab" id="t-contact" aria-controls="p-contact" aria-selected="true">Contact us</button>
          <button type="button" role="tab" id="t-material" aria-controls="p-material" aria-selected="false">Material request</button>
        </div>
        <form class="pane" id="p-contact" role="tabpanel" aria-labelledby="t-contact">
          <div class="form">
            <div class="full"><span style="display:block;font-size:14px;font-weight:500;color:var(--ink2);margin-bottom:10px">What is it about?</span>
              <div class="seg" id="topic" role="group" aria-label="Topic"><button type="button" aria-pressed="true">Services</button><button type="button" aria-pressed="false">Workforce</button><button type="button" aria-pressed="false">Consulting</button><button type="button" aria-pressed="false">Careers</button></div></div>
            <label>Name<input name="name" autocomplete="name" placeholder="First and last name"></label>
            <label>Company<input name="company" autocomplete="organization" placeholder="optional"></label>
            <label>E-mail<input name="email" type="email" autocomplete="email" placeholder="name@company.com"></label>
            <label>Phone<input name="tel" type="tel" autocomplete="tel" placeholder="optional"></label>
            <label class="full">Message<textarea name="msg" placeholder="What do you need, when and where?"></textarea></label>
            <button class="btn btn--p" type="submit">Send request <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
            <p class="note full">We usually reply within one working day.</p>
          </div>
        </form>
        <form class="pane" id="p-material" role="tabpanel" aria-labelledby="t-material" hidden>
          <div class="form">
            <div class="full"><span style="display:block;font-size:14px;font-weight:500;color:var(--ink2);margin-bottom:10px">Priority</span>
              <div class="seg seg--aog" role="group" aria-label="Priority"><button type="button" aria-pressed="true" data-v="Routine">Routine</button><button type="button" aria-pressed="false" data-v="Urgent">Urgent</button><button type="button" aria-pressed="false" data-v="AOG">AOG</button></div></div>
            <label>Part number<input name="pn" placeholder="e.g. 3214552-1" autocapitalize="characters"></label>
            <label>Quantity<input name="qty" type="number" min="1" value="1" inputmode="numeric"></label>
            <label class="full">Description<input name="desc" placeholder="e.g. Brake assembly"></label>
            <label>Condition<select name="cond"><option>Any</option><option>NE (new)</option><option>NS (new surplus)</option><option>OH (overhauled)</option><option>SV (serviceable)</option><option>AR (as removed)</option></select></label>
            <label>Aircraft type<input name="ac" placeholder="e.g. A320, E195"></label>
            <label>Name<input name="name" autocomplete="name" placeholder="First and last name"></label>
            <label>Company<input name="company" autocomplete="organization" placeholder="Airline / MRO"></label>
            <label>E-mail<input name="email" type="email" autocomplete="email" placeholder="name@company.com"></label>
            <label>Required by<input name="date" type="date"></label>
            <label class="full">Notes<textarea name="msg" placeholder="Delivery address, certificate (EASA Form 1, FAA 8130-3), alternate part numbers …"></textarea></label>
            <button class="btn btn--p" type="submit">Send material request <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
            <p class="note full">AOG requests are handled with top priority.</p>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>
</main>

<footer class="foot">
  <div class="wrap">
    <div class="foot__cta">
      <div><h2>Ready for take-off?</h2><p>Tell us what you need. We usually reply within one working day.</p></div>
      <div class="hero__cta"><a class="btn btn--w" href="#contact" data-topic="Services">Get in touch <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a><a class="btn btn--l" href="#contact" data-tab="material">Material request</a></div>
    </div>
    <div class="foot__top">
      <div><img src="assets/img/xbase-logo-weiss.webp" width="600" height="164" alt="XBASE Aero"><p>Best Aviation Services. Delivered by Xperts. Based at Vienna International Airport.</p></div>
      <div class="foot__nav">
        <div><small>Company</small><a href="#services">Services</a><a href="#about">About us</a><a href="#references">References</a><a href="#careers">Careers</a></div>
        <div><small>Legal</small><a href="#">Legal notice</a><a href="#">Privacy policy</a><a href="#">Accessibility</a></div>
      </div>
    </div>
    <div class="foot__bot"><span>© 2026 XBASE Aero AM GmbH · FN 682819x · Registered office Schwechat</span><span>Web design: Tim Kofler</span></div>
  </div>
</footer>

<a class="draft" href="https://tim-kofler.at" target="_blank" rel="noopener"><img src="assets/img/tk-logo-2.svg" width="702" height="358" alt=""><span>Draft by Tim Kofler</span></a>

<script src="assets/app.js?v=4" defer></script>
<script type="module" src="assets/flug3d.js?v=5"></script>
</body></html>
