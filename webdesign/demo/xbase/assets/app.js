(()=>{
  const nav=document.getElementById('nav'),b=document.getElementById('burger'),p=document.getElementById('mpanel');
  const onS=()=>nav.classList.toggle('is-s',scrollY>10);onS();addEventListener('scroll',onS,{passive:true});
  const close=()=>{p.classList.remove('open');b.setAttribute('aria-expanded','false');nav.classList.toggle('is-s',scrollY>10)};
  b.addEventListener('click',()=>{const o=!p.classList.contains('open');p.classList.toggle('open',o);b.setAttribute('aria-expanded',String(o));if(o)nav.classList.add('is-s')});
  p.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
  document.querySelectorAll('.seg button').forEach(x=>x.addEventListener('click',()=>{x.parentNode.querySelectorAll('button').forEach(y=>y.setAttribute('aria-pressed',String(y===x)))}));
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.rv').forEach((el,i)=>{el.style.transitionDelay=(el.parentNode.children.length>2?(Array.prototype.indexOf.call(el.parentNode.children,el)%4)*70:0)+'ms';io.observe(el)});
  const f=document.getElementById('kform');f.addEventListener('submit',e=>{e.preventDefault();f.querySelector('.note').textContent='Danke! Das ist ein Entwurf, im echten Betrieb kommt die Anfrage per Mail an.'});
  const plan=document.querySelector('.plan__in');
  if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
    addEventListener('pointermove',e=>{const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;plan.style.setProperty('--ry',(-8+x*14)+'deg');plan.style.setProperty('--rx',(10-y*12)+'deg')},{passive:true});
  }
  // Ablauf: Linie füllt sich beim Scrollen, ein Flugzeug fliegt mit
  const steps=document.querySelector('.steps');
  if(steps){
    const fly=document.createElement('span');fly.className='steps__fly';fly.setAttribute('aria-hidden','true');
    fly.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>';
    steps.appendChild(fly);
    const upd=()=>{const r=steps.getBoundingClientRect();const p=Math.min(1,Math.max(0,(innerHeight*0.78-r.top)/(r.height+innerHeight*0.25)));steps.style.setProperty('--p',p.toFixed(3));steps.querySelectorAll('.step').forEach((el,i)=>el.classList.toggle('on',p>=i/4+0.02))};
    upd();addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);
  }
})();
