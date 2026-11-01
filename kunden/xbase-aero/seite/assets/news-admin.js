// News-Editor (Demo): Anmeldung nur zum Ansehen, Beiträge landen in localStorage "xbaseNews" und erscheinen auf der Startseite
(()=>{
  const $=id=>document.getElementById(id);
  const KEY='xbaseNews',IN='xbaseNewsIn';
  const EXAMPLES=[
    {title:'We are hiring aircraft technicians',date:'2026-10-20',img:'../assets/img/triebwerk-800.webp'},
    {title:"Working with People's on the Vienna route",date:'2026-09-02',img:'../assets/img/cockpit-800.webp'},
    {title:'XBASE Aero is cleared for take-off',date:'2026-07-17',img:'../assets/img/xbase-flugzeug-1000.webp'}
  ];
  const load=()=>{try{const l=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(l)?l:[]}catch(e){return[]}};
  const save=l=>{try{localStorage.setItem(KEY,JSON.stringify(l));return true}catch(e){return false}};
  const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],fmt=d=>{const m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(d||'');return m?(+m[3])+' '+MON[m[2]-1]+' '+m[1]:''};
  // LinkedIn-Link: auch ohne https://, mit Länder-Subdomain (de.linkedin.com) oder Kurzlink lnkd.in
  const liUrl=v=>{v=(v||'').trim();if(!v)return'';if(!/^https?:\/\//i.test(v))v='https://'+v;v=v.replace(/^http:/i,'https:');return/^https:\/\/([a-z0-9-]+\.)?linkedin\.com\/|^https:\/\/lnkd\.in\//i.test(v)?v:''};
  const today=()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)};

  // Anmelden / Abmelden
  const show=()=>{const ok=sessionStorage.getItem(IN)==='1';$('login').hidden=ok;$('app').hidden=!ok;if(ok)render()};
  $('loginForm').addEventListener('submit',e=>{e.preventDefault();try{sessionStorage.setItem(IN,'1')}catch(x){}show();scrollTo(0,0)});
  $('logout').addEventListener('click',()=>{try{sessionStorage.removeItem(IN)}catch(x){}show()});

  // Formular mit Live-Vorschau
  const f=$('ed'),DEF_IMG='../assets/img/xbase-flugzeug-1000.webp';let img='';
  f.date.value=today();
  const prev=()=>{
    $('prevTitle').textContent=f.title.value.trim()||'Your title';
    $('prevText').textContent=f.text.value.trim()||'Your text appears here while you type.';
    $('prevDate').textContent=fmt(f.date.value);
    const pi=$('prevImg'),src=img||DEF_IMG;if(pi.getAttribute('src')!==src){const box=pi.parentNode;box.classList.remove('fit');box.querySelector('.bg')?.remove();pi.classList.remove('fg');pi.src=src;fitPostImg(pi)}
    $('prevLi').hidden=!liUrl(f.li.value);
    $('count').textContent=f.text.value.length+' / 600';
  };
  f.addEventListener('input',prev);prev();

  // Foto: verkleinern (max. 1200 px, JPEG), damit es in den Browser-Speicher passt
  const pic=$('pic'),drop=$('picDrop'),ico=drop.querySelector('.pic__ico'),picT=drop.querySelector('.pic__t');
  const setIco=()=>{ico.innerHTML=img?'':ico.dataset.svg;if(img){const i=new Image();i.src=img;i.alt='';ico.appendChild(i)}picT.querySelector('b').textContent=img?'Change photo':'Choose a photo'};
  ico.dataset.svg=ico.innerHTML;
  pic.addEventListener('change',()=>{
    const file=pic.files[0];if(!file)return;
    if(!/^image\/(jpeg|png|webp|gif)$/.test(file.type)){picT.querySelector('small').textContent='Please choose a JPG or PNG photo.';return}
    const r=new FileReader();
    r.onload=()=>{const i=new Image();i.onload=()=>{const s=Math.min(1,1200/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=Math.round(i.width*s);c.height=Math.round(i.height*s);c.getContext('2d').drawImage(i,0,0,c.width,c.height);img=c.toDataURL('image/jpeg',.8);picT.querySelector('small').textContent=file.name;setIco();prev()};i.src=r.result};
    r.readAsDataURL(file);
  });
  ['dragenter','dragover'].forEach(t=>drop.addEventListener(t,()=>drop.classList.add('is-over')));
  ['dragleave','drop'].forEach(t=>drop.addEventListener(t,()=>drop.classList.remove('is-over')));

  // Liste: eigene Beiträge (löschbar) + Beispiele
  const X='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const LK='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.1c0-1.22-.02-2.78-1.7-2.78-1.7 0-1.96 1.33-1.96 2.7V21h-4z"/></svg>';
  const row=(n,own)=>{
    const li=document.createElement('li'),im=new Image(),sp=document.createElement('span'),b=document.createElement('b'),s=document.createElement('small'),em=document.createElement('em');
    im.src=n.img&&(/^data:image\//.test(n.img)||own===false)?n.img:DEF_IMG;im.alt='';
    b.textContent=n.title;s.textContent=fmt(n.date);sp.append(b,s);
    em.textContent=own?'Live':'Example';if(own)em.className='live';
    li.append(im,sp,em);
    if(own){
      // LinkedIn-Link nachträglich eintragen (der Beitrag auf LinkedIn entsteht ja erst nach dem Veröffentlichen)
      const k=document.createElement('button');k.type='button';k.className='lk'+(n.li?' on':'');k.innerHTML=LK;k.setAttribute('aria-label',(n.li?'Change':'Add')+' LinkedIn link');k.title=n.li?'LinkedIn link added':'Add LinkedIn link';
      const fm=document.createElement('form');fm.className='lkf';fm.hidden=true;fm.noValidate=true;
      const inp=document.createElement('input');inp.type='url';inp.placeholder='Paste the link of your LinkedIn post';inp.value=n.li||'';inp.setAttribute('aria-label','LinkedIn post link');
      const ok=document.createElement('button');ok.type='submit';ok.className='btn btn--s';ok.textContent='Save';
      const er=document.createElement('small');er.className='lkf__e';er.hidden=true;er.textContent='Please paste a linkedin.com link.';
      fm.append(inp,ok,er);
      k.addEventListener('click',()=>{fm.hidden=!fm.hidden;if(!fm.hidden)inp.focus()});
      fm.addEventListener('submit',e=>{e.preventDefault();const v=liUrl(inp.value);if(inp.value.trim()&&!v){er.hidden=false;return}save(load().map(o=>o.id===n.id?{...o,li:v}:o));render()});
      li.appendChild(k);
      const x=document.createElement('button');x.type='button';x.innerHTML=X;x.setAttribute('aria-label','Delete '+n.title);x.addEventListener('click',()=>{if(!confirm('Delete this post?'))return;save(load().filter(o=>o.id!==n.id));render()});li.append(x,fm)}
    return li;
  };
  const render=()=>{const l=$('list');l.textContent='';load().slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).forEach(n=>l.appendChild(row(n,true)));EXAMPLES.forEach(n=>l.appendChild(row(n,false)))};

  // Veröffentlichen
  f.addEventListener('submit',e=>{
    e.preventDefault();
    const li=f.li.value;
    const n={id:Date.now().toString(36),title:f.title.value.trim(),date:f.date.value,text:f.text.value.trim(),img,li:liUrl(li)};
    const l=load();l.push(n);
    if(!save(l)){n.img='';l[l.length-1]=n;save(l)}
    render();
    $('share').href='https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent('https://xbase.aero/news/#'+n.id);
    $('done').hidden=false;$('share').focus();
  });
  const reset=()=>{$('done').hidden=true;f.reset();f.date.value=today();img='';setIco();picT.querySelector('small').textContent='JPG or PNG, it gets resized automatically';prev();f.title.focus()};
  $('again').addEventListener('click',reset);
  // Nach "Share on LinkedIn": wer zurückkommt (auch nach Abbrechen), landet wieder im leeren Formular
  let shared=false;
  $('share').addEventListener('click',()=>{shared=true;setTimeout(()=>{if(shared){shared=false;reset()}},800)});
  addEventListener('pageshow',e=>{if(e.persisted&&!$('done').hidden)reset()});
  $('done').addEventListener('click',e=>{if(e.target.id==='done')$('done').hidden=true});
  addEventListener('keydown',e=>{if(e.key==='Escape')$('done').hidden=true});
  show();
})();

// Hochformat-Fotos nicht abschneiden: ganzes Bild zeigen, weichgezeichnete Kopie füllt den Rest
function fitPostImg(img){
  const go=()=>{const box=img.parentNode;if(!img.naturalWidth||img.naturalWidth/img.naturalHeight>1.3||box.classList.contains('fit'))return;
    const bg=new Image();bg.src=img.src;bg.alt='';bg.className='bg';bg.setAttribute('aria-hidden','true');img.classList.add('fg');box.classList.add('fit');box.prepend(bg)};
  img.complete?go():img.addEventListener('load',go,{once:true});
}
