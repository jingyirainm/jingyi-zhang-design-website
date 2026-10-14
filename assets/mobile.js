/* Mobile navigation follows the same destinations as the desktop navigation. */
(()=>{const mount=()=>{const host=document.querySelector('.pin-mtop bodycopy');if(!host)return;const nav=document.querySelector('.pin-left');const names=['Index','Work','Project','About'];const links=names.map(name=>{const a=nav&&[...nav.querySelectorAll('a')].find(a=>a.textContent.replace('>','').trim()===name);return [name,a?a.getAttribute('href'):({Index:'jingyizhang-design.html',Work:'work.html',Project:'menu.html',About:'about.html'})[name]]});const existingToggle=host.querySelector('.th-toggle');const row=document.createElement('div');row.className='mobile-nav';const brand=document.createElement('a');brand.className='mobile-brand';brand.href='jingyizhang-design.html';brand.textContent='Jingyi Zhang';const menu=document.createElement('nav');menu.setAttribute('aria-label','Main navigation');links.forEach(([name,href])=>{const a=document.createElement('a');a.href=href;a.textContent=name;menu.append(a)});row.append(brand,menu);if(existingToggle)row.append(existingToggle);else{const toggle=document.createElement('button');toggle.type='button';toggle.className='th-toggle th-inbar';toggle.setAttribute('aria-label','Change mode: switch between light and dark');toggle.setAttribute('aria-pressed',document.documentElement.getAttribute('data-theme')==='dark');toggle.innerHTML='<span class="th-ico" aria-hidden="true"></span>';toggle.addEventListener('click',()=>{const original=document.querySelector('.pin-left .th-toggle');if(original)original.click();toggle.setAttribute('aria-pressed',document.documentElement.getAttribute('data-theme')==='dark')});row.append(toggle);}host.replaceChildren(row)};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount()})();

/* Phone-only additions; desktop presentation remains unchanged. */
(()=>{
 const phone=matchMedia('(max-width:767px)');
 const apply=()=>{
  const main=document.querySelector('main'); if(!main)return;
  if(document.body.classList.contains('page-homepage-desktop-1')){
   main.querySelectorAll('bodycopy').forEach(content=>{
   if(!content.querySelector('.mobile-intro')){
    const intro=document.createElement('section');intro.className='mobile-intro';intro.setAttribute('aria-label','Introduction');
    intro.innerHTML='<p>Hi, I am Jingyi <span class="mobile-green-dot" aria-hidden="true"></span>, an AI-native designer with a strong sense of product thinking, aesthetics, and creativity. I turn complex ideas into systems and bring them to life through design and code.</p><p>Recently at <a href="https://www.reelshort.com/" target="_blank" rel="noopener">@ReelShort</a>.</p>';
    content.prepend(intro);
   }});
   main.querySelectorAll('gallery-columnized').forEach(g=>{g.dataset.mcols='2'});
  }
  const footer=document.querySelector('.pin-mbottom');
  if(footer&&!footer.querySelector('.mobile-copyright')){const c=document.createElement('span');c.className='mobile-copyright';c.textContent='© 2026';footer.append(c)}
  if(phone.matches&&!['page-homepage-desktop-1','page-work','page-menu','page-list','page-project'].some(c=>document.body.classList.contains(c))){
   main.querySelectorAll('*').forEach(e=>{
    if(!e.textContent.trim()||e.matches('svg,svg *,img,video,canvas,iframe'))return;
    const rgb=getComputedStyle(e).color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if(rgb&&+rgb[1]>90&&+rgb[1]>+rgb[2]*1.35&&+rgb[1]>+rgb[3]*1.3)e.classList.add('mobile-black-text');
   });
  }
  if(phone.matches&&document.body.classList.contains('case-mode')){
   const candidates=[...main.querySelectorAll('p,li,figcaption,.caption,.description,.descriptions,.wenshi,.description-photo-textile,.description-language1')];
   const sizes=new Map();
   candidates.forEach(e=>{if(e.closest('button,nav,.cm-nav')||e.querySelector('button,h1,h2,h3,h4')||e.classList.contains('mobile-case-copy'))return;
    [e,...e.querySelectorAll('span,a,b,strong,i,em')].forEach(n=>{if(!n.closest('button'))sizes.set(n,parseFloat(getComputedStyle(n).fontSize)*.8)});
   });
   sizes.forEach((size,e)=>{e.style.setProperty('--mobile-copy-size',size+'px');e.classList.add('mobile-case-copy')});
  }
  if(window.rsSite)window.rsSite.relayout();
 };
 let pending=false;const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;apply()})};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
 phone.addEventListener('change',schedule);
 new MutationObserver(ms=>{if(ms.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches('main')||n.querySelector('main')))))schedule()}).observe(document.body,{childList:true,subtree:true});
})();
