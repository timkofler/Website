(()=>{
  const nav=document.getElementById('nav'),b=document.getElementById('burger'),p=document.getElementById('mpanel');
  const onS=()=>nav.classList.toggle('is-s',scrollY>10);onS();addEventListener('scroll',onS,{passive:true});
  const close=()=>{p.classList.remove('open');b.setAttribute('aria-expanded','false');nav.classList.toggle('is-s',scrollY>10)};
  b.addEventListener('click',()=>{const o=!p.classList.contains('open');p.classList.toggle('open',o);b.setAttribute('aria-expanded',String(o));if(o)nav.classList.add('is-s')});
  p.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
  document.querySelectorAll('.seg button').forEach(x=>x.addEventListener('click',()=>{x.parentNode.querySelectorAll('button').forEach(y=>y.setAttribute('aria-pressed',String(y===x)))}));
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.rv').forEach((el,i)=>{el.style.transitionDelay=(el.parentNode.children.length>2?(Array.prototype.indexOf.call(el.parentNode.children,el)%4)*70:0)+'ms';io.observe(el)});
  // Leistungs-Kästen: Linie oben bleibt, wenn man einmal drüber war
  document.querySelectorAll('.card').forEach(c=>c.addEventListener('pointerenter',()=>c.classList.add('is-seen'),{once:true}));
  // Kontakt: Reiter "Contact us" / "Material request"
  const tabs=[...document.querySelectorAll('.tabs [role=tab]')];
  const show=id=>tabs.forEach(t=>{const on=t.id==='t-'+id;t.setAttribute('aria-selected',String(on));document.getElementById(t.getAttribute('aria-controls')).hidden=!on});
  tabs.forEach(t=>t.addEventListener('click',()=>show(t.id.slice(2))));
  document.querySelectorAll('[data-tab]').forEach(a=>a.addEventListener('click',()=>show(a.dataset.tab)));
  document.querySelectorAll('[data-topic]').forEach(a=>a.addEventListener('click',()=>{show('contact');document.querySelectorAll('#topic button').forEach(y=>y.setAttribute('aria-pressed',String(y.textContent===a.dataset.topic)))}));
  // Am Handy steht das Formular unter der Adresskarte: Knöpfe springen direkt zum Formular
  const fbox=document.querySelector('.cbox--f');
  document.querySelectorAll('a[href="#contact"]').forEach(a=>a.addEventListener('click',e=>{if(!fbox||!matchMedia('(max-width:960px)').matches)return;e.preventDefault();if(!a.dataset.tab&&!a.dataset.topic)show('contact');setTimeout(()=>fbox.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}),30)}));
  document.querySelectorAll('.pane').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();sendFly(f);f.querySelector('.note').textContent='Thank you! This is a draft. On the live site your request will be sent by e-mail.'}));
  // Entwurf-Abzeichen: beim Runterscrollen weg, beim Hochscrollen und ganz unten wieder da
  const dr=document.querySelector('.draft');
  if(dr){let ly=scrollY;addEventListener('scroll',()=>{const y=scrollY,end=y+innerHeight>document.documentElement.scrollHeight-40;dr.classList.toggle('hide',y>ly&&y>200&&!end);if(y<ly||end)dr.classList.remove('hide');ly=y},{passive:true})}
  const plan=document.querySelector('.plan__in');
  if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
    addEventListener('pointermove',e=>{const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;plan.style.setProperty('--ry',(-8+x*14)+'deg');plan.style.setProperty('--rx',(10-y*12)+'deg')},{passive:true});
    // Glas-Banner im Footer: Lichtschein folgt der Maus, Banner neigt sich leicht
    const cta=document.querySelector('.foot__cta');
    if(cta){cta.addEventListener('pointermove',e=>{const r=cta.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;cta.classList.add('is-m');cta.style.setProperty('--mx',(x*100).toFixed(1)+'%');cta.style.setProperty('--my',(y*100).toFixed(1)+'%');cta.style.setProperty('--ry',((x-.5)*5).toFixed(2)+'deg');cta.style.setProperty('--rx',((.5-y)*5).toFixed(2)+'deg')});
      cta.addEventListener('pointerleave',()=>{cta.classList.remove('is-m');cta.style.setProperty('--rx','0deg');cta.style.setProperty('--ry','0deg')})}
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

// Abschicken: Knopf faltet sich zum Flieger, der davonfliegt
function sendFly(f){
  const b=f.querySelector('button[type=submit]');
  if(!b||b.classList.contains('is-sent')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const r=b.getBoundingClientRect(),p=document.createElement('span');
  p.className='fly-plane';
  p.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>';
  p.style.left=r.left+r.width/2+'px';p.style.top=r.top+r.height/2+'px';
  document.body.appendChild(p);b.classList.add('is-sent');
  setTimeout(()=>p.remove(),1800);
  setTimeout(()=>{b.classList.remove('is-sent');b.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:400,easing:'ease-out'})},3200);
}
