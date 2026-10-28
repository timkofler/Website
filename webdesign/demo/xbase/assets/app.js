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
})();
