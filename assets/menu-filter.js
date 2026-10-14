/* Project page: a floating category bar (same look as the case-study guide bar).
   All / Product Design / Visual Design / AIGC Art / Photography & Creative Direction */
(function () {
  const bc = document.querySelector('.main bodycopy');
  if (!bc || bc.querySelector('.mf-bar')) return;
  const CATS = [['all', 'All'], ['product', 'Product Design'], ['visual', 'Visual Design'], ['aigc', 'AIGC Art'], ['photo', 'Photography & Creative Direction']];
  const KEY = t => /aigc/i.test(t) ? 'aigc' : /product|playground|engineer/i.test(t) ? 'product' : /graphic|motion/i.test(t) ? 'visual' : /photo|art direction/i.test(t) ? 'photo' : null;

  if (!document.getElementById('mf-css')) {
    const st = document.createElement('style'); st.id = 'mf-css';
    st.textContent = `
    .mf-wrap{position:sticky;top:1.2rem;z-index:20;display:flex;justify-content:flex-start;margin:0 0 2.2rem;pointer-events:none}
    .mf-bar{pointer-events:auto;position:relative;display:flex;align-items:center;gap:.2rem;padding:.38rem;border-radius:99px;max-width:100%;overflow-x:auto;scrollbar-width:none;
      background:rgba(255,255,255,.82);backdrop-filter:blur(16px) saturate(1.4);-webkit-backdrop-filter:blur(16px) saturate(1.4);
      box-shadow:0 0 0 1px rgba(17,17,17,.1) inset,0 18px 40px -20px rgba(0,0,0,.25)}
    .mf-bar::-webkit-scrollbar{display:none}
    .mf-bar button{position:relative;z-index:1;flex:none;border:0;background:none;cursor:pointer;padding:.62rem 1.05rem;border-radius:99px;
      font:500 .82rem/1 Inter,'Diatype',-apple-system,sans-serif;letter-spacing:.005em;color:rgba(17,17,17,.5);transition:color .35s ease}
    .mf-bar button:hover{color:rgba(17,17,17,.9)}
    .mf-bar button.on{color:#fff}
    .mf-ind{position:absolute;z-index:0;top:.38rem;bottom:.38rem;left:0;width:0;border-radius:99px;background:#111;
      box-shadow:0 6px 16px -6px rgba(0,0,0,.35);transition:transform .55s cubic-bezier(.22,.8,.2,1),width .55s cubic-bezier(.22,.8,.2,1)}
    .mf-sec{transition:opacity .45s ease,filter .5s ease}
    .mf-sec.mf-out{opacity:0;filter:blur(8px)}
    .mf-sec[hidden]{display:none!important}
    @media (prefers-reduced-motion:reduce){.mf-ind,.mf-sec{transition:none}}`;
    document.head.appendChild(st);
  }

  // group the page into sections: each "◐ heading" up to the next one
  const kids = [...bc.childNodes]; const secs = []; let cur = null;
  kids.forEach(n => {
    const icon = n.nodeType === 1 && (n.matches('.text-icon') ? n : n.querySelector && n.querySelector('.text-icon'));
    if (icon) { const k = KEY(n.textContent); cur = document.createElement('div'); cur.className = 'mf-sec'; cur.dataset.cat = k || 'other'; n.before(cur); secs.push(cur); }
    if (cur) cur.appendChild(n);
  });
  if (!secs.length) return;

  const wrap = document.createElement('div'); wrap.className = 'mf-wrap';
  const bar = document.createElement('div'); bar.className = 'mf-bar'; bar.setAttribute('role', 'tablist'); bar.setAttribute('aria-label', 'Filter projects');
  const ind = document.createElement('span'); ind.className = 'mf-ind'; bar.appendChild(ind);
  CATS.forEach(([k, t], i) => { const b = document.createElement('button'); b.type = 'button'; b.dataset.k = k; b.textContent = t; b.setAttribute('role', 'tab');
    if (!i) { b.classList.add('on'); b.setAttribute('aria-selected', 'true'); } bar.appendChild(b); });
  wrap.appendChild(bar); secs[0].before(wrap);

  const label=document.createElement('div');label.className='mobile-category';
  const caption=document.createElement('span');caption.textContent='Select Category';
  const trigger=document.createElement('button');trigger.type='button';trigger.className='category-trigger';trigger.textContent='All';trigger.setAttribute('aria-label','Select Category');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls','category-options');
  const options=document.createElement('div');options.id='category-options';options.className='category-options';options.hidden=true;
  const closeMenu=()=>{options.hidden=true;trigger.setAttribute('aria-expanded','false')};
  const syncCategory=k=>{trigger.textContent=CATS.find(c=>c[0]===k)[1];options.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.k===k))};
  CATS.forEach(([k,t])=>{const b=document.createElement('button');b.type='button';b.dataset.k=k;b.textContent=t;b.setAttribute('aria-pressed',k==='all');b.addEventListener('click',()=>{bar.querySelector(`[data-k="${k}"]`).click();closeMenu();trigger.focus()});options.append(b)});
  trigger.addEventListener('click',()=>{options.hidden=!options.hidden;trigger.setAttribute('aria-expanded',!options.hidden)});
  label.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();trigger.focus()}});
  document.addEventListener('click',e=>{if(!label.contains(e.target))closeMenu()});
  label.append(caption,trigger,options);wrap.append(label);
  const move = b => { ind.style.width = b.offsetWidth + 'px'; ind.style.transform = `translateX(${b.offsetLeft}px)`; };
  requestAnimationFrame(() => move(bar.querySelector('.on')));
  addEventListener('resize', () => { const b = bar.querySelector('.on'); if (b && b.isConnected) move(b); });

  let t1;
  bar.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.classList.contains('on')) return;
    bar.querySelectorAll('button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
    move(b); b.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    const k = b.dataset.k; syncCategory(k);
    secs.forEach(s => s.classList.add('mf-out'));
    clearTimeout(t1);
    t1 = setTimeout(() => {
      secs.forEach(s => { s.hidden = !(k === 'all' || s.dataset.cat === k); });
      if (window.rsSite) window.rsSite.relayout();
      const top = wrap.getBoundingClientRect().top + scrollY - 20;
      if (scrollY > top) scrollTo({ top, behavior: 'smooth' });
      requestAnimationFrame(() => requestAnimationFrame(() => secs.forEach(s => s.classList.remove('mf-out'))));
      setTimeout(() => window.rsSite && window.rsSite.relayout(), 80);
    }, 380);
  });
})();
