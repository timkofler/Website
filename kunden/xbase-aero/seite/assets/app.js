(()=>{
  const nav=document.getElementById('nav'),b=document.getElementById('burger'),p=document.getElementById('mpanel');
  const onS=()=>nav.classList.toggle('is-s',scrollY>10);onS();addEventListener('scroll',onS,{passive:true});
  const close=()=>{p.classList.remove('open');b.setAttribute('aria-expanded','false');nav.classList.toggle('is-s',scrollY>10)};
  b.addEventListener('click',()=>{const o=!p.classList.contains('open');p.classList.toggle('open',o);b.setAttribute('aria-expanded',String(o));if(o)nav.classList.add('is-s')});
  p.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
  document.querySelectorAll('.seg button').forEach(x=>x.addEventListener('click',()=>{x.parentNode.querySelectorAll('button').forEach(y=>y.setAttribute('aria-pressed',String(y===x)))}));
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.rv').forEach((el,i)=>{el.style.transitionDelay=(el.parentNode.children.length>2?(Array.prototype.indexOf.call(el.parentNode.children,el)%4)*70:0)+'ms';io.observe(el)});
  // Kontakt: Reiter "Contact us" / "Material request"
  const tabs=[...document.querySelectorAll('.tabs [role=tab]')];
  const show=id=>tabs.forEach(t=>{const on=t.id==='t-'+id;t.setAttribute('aria-selected',String(on));document.getElementById(t.getAttribute('aria-controls')).hidden=!on});
  tabs.forEach(t=>t.addEventListener('click',()=>show(t.id.slice(2))));
  document.querySelectorAll('[data-tab]').forEach(a=>a.addEventListener('click',()=>show(a.dataset.tab)));
  document.querySelectorAll('[data-topic]').forEach(a=>a.addEventListener('click',()=>{show('contact');document.querySelectorAll('#topic button').forEach(y=>y.setAttribute('aria-pressed',String(y.textContent===a.dataset.topic)))}));
  document.querySelectorAll('.pane').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();f.querySelector('.note').textContent='Thank you! This is a draft. On the live site your request will be sent by e-mail.'}));
  // Entwurf-Abzeichen: beim Runterscrollen weg, beim Hochscrollen und ganz unten wieder da
  const dr=document.querySelector('.draft');
  if(dr){let ly=scrollY;addEventListener('scroll',()=>{const y=scrollY,end=y+innerHeight>document.documentElement.scrollHeight-40;dr.classList.toggle('hide',y>ly&&y>200&&!end);if(y<ly||end)dr.classList.remove('hide');ly=y},{passive:true})}
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
    const ds=steps.querySelectorAll('.step__d');const upd=()=>{const r=steps.getBoundingClientRect();const a=ds[0].getBoundingClientRect(),z=ds[ds.length-1].getBoundingClientRect();steps.style.setProperty('--len',(z.top-a.top)+'px');const p=Math.min(1,Math.max(0,(innerHeight*0.78-r.top)/(r.height+innerHeight*0.25)));steps.style.setProperty('--p',p.toFixed(3));steps.querySelectorAll('.step').forEach((el,i)=>el.classList.toggle('on',p>=i/4+0.02))};
    upd();addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);
  }
})();
