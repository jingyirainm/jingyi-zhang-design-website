/* Case-study mode — guide bar with scroll-spy, reveals, progress, Back, Next on */
(function () {
  const ORDER = [
    { f: 'knotboard.html', t: 'Knotboard', s: 'AI-powered SaaS for creative workflows', n: '001', img: 'assets/projects/knotboard/knotboard_intro.gif' },
    { f: 'reelshort-casting-system.html', t: 'Casting Pool', s: 'ReelShort casting system at 100M+ view scale', n: '002', img: 'https://freight.cargo.site/t/original/i/A3166357737920798636489174220286/CastPool_Hero_3x2_.gif' },
    { f: 'reelshort-addendum-studio.html', t: 'ReelShort Addendum Studio', s: 'Payroll & legal compliance system for ReelShort', n: '003', img: 'assets/projects/addendum/00_cover.jpg' },
    { f: 'yi-daily-guidance.html', t: 'Yi 易', s: 'I Ching soundscapes, from installation to app', n: '005', img: 'assets/projects/yi/cs_01_hero.jpg' },
    { f: 'cave-song.html', t: 'Cave Song', s: 'Mobile app for cultural heritage preservation', n: '006', img: 'https://freight.cargo.site/w/1600/q/85/i/C3156658344904556918719000149502/ChatGPT--2026929-10_06_09.png' }
  ];
  const segment=location.pathname.split('/').filter(Boolean).pop();
  const here = segment.endsWith('.html') ? segment : segment+'.html';
  let idx = ORDER.findIndex(o => o.f === here);
  const isWork=idx>=0;
  if(idx<0){ORDER.push({f:here,t:document.title.split(' — ')[0],s:'',n:'',img:document.querySelector('main img')?.getAttribute('src')||''});idx=ORDER.length-1;}
  const returnFile=isWork?'work.html':'menu.html';
  document.documentElement.classList.add('cm-js');
  document.body.classList.add('case-mode');
  const main = document.querySelector('main .page-content bodycopy') || document.querySelector('main .page-content');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* sections: the outlined pill labels used as section headers in every case study */
  const secs = [];
  main.querySelectorAll('span[style*="border-radius"]').forEach(s => {
    const st = s.getAttribute('style') || '';
    if (s.classList.contains('number') || !/border-width:\s*0\.1rem/.test(st) || s.closest('a')) return;
    const label = [...s.childNodes].map(n => n.nodeType === 3 ? n.textContent : n.tagName === 'BR' ? '\n' : n.textContent).join('').trim().split('\n')[0].replace(/\s+/g, ' ').replace(/&\s*/g, '& ').trim();
    if (!label || label.length > 48) return;
    const id = 'sec-' + (secs.length + 1);
    s.id = id; s.setAttribute('data-cm-sec', '');
    secs.push({ el: s, id, label: label.length > 26 ? label.slice(0, 25) + '…' : label, full: label });
  });
  if (!secs.length) main.querySelectorAll('h2').forEach((h, i) => { h.id = 'sec-' + (i + 1); h.setAttribute('data-cm-sec', ''); const l = h.textContent.trim(); secs.push({ el: h, id: h.id, label: l.slice(0, 25) + (l.length > 25 ? '…' : ''), full: l }); });

  if(!secs.length){main.id='sec-overview';secs.push({el:main,id:main.id,label:'Overview',full:'Overview'})}
  /* chrome */
  const prog = document.createElement('div'); prog.className = 'cm-progress'; document.body.appendChild(prog);
  const back = document.createElement('a'); back.className = 'cm-back'; back.href = returnFile;
  back.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8.5 2.5 4 7l4.5 4.5"/></svg>Back to Work';
  if(!isWork)back.innerHTML=back.innerHTML.replace('Back to Work','Back to Project');
  document.body.appendChild(back);

  const next1 = ORDER[(idx + 1) % ORDER.length], next2 = ORDER[(idx + 2) % ORDER.length];
  const nav = document.createElement('nav'); nav.className = 'cm-nav'; nav.setAttribute('aria-label', 'Case study guide');
  nav.innerHTML = `<a href="${returnFile}" class="cm-strong" data-leave>← Back</a><span class="cm-sep"></span>
    <div class="cm-track"><span class="cm-pillbg"></span>${secs.map(s => `<a href="#${s.id}" title="${esc(s.full)}">${esc(s.label)}</a>`).join('')}</div>
    <button class="cm-cur" aria-haspopup="true" aria-expanded="false"><span class="cm-curl">${secs[0] ? esc(secs[0].label) : 'Overview'}</span> ▴</button>
    <span class="cm-sep"></span><a href="${next1.f}" class="cm-strong" data-leave>Next →</a>`;
  document.body.appendChild(nav);
  const sheet = document.createElement('div'); sheet.className = 'cm-sheet';
  sheet.innerHTML = secs.map(s => `<a href="#${s.id}">${esc(s.full)}</a>`).join('');
  document.body.appendChild(sheet);
  const cur = nav.querySelector('.cm-cur');
  cur.onclick = () => { const o = sheet.classList.toggle('open'); cur.setAttribute('aria-expanded', o); };
  sheet.addEventListener('click', e => { if (e.target.closest('a')) { sheet.classList.remove('open'); cur.setAttribute('aria-expanded', false); } });

  /* Next on */
  const nx = document.createElement('section'); nx.className = 'cm-next';
  const card = o => `<a href="${o.f}" data-leave><div class="cm-media"><img src="${o.img}" alt="${esc(o.t)}" loading="lazy"></div><div class="cm-meta"><b>${esc(o.t)} — ${esc(o.s)}</b><span>${o.n} <span class="cm-arrow">→</span></span></div></a>`;
  nx.innerHTML = `<h5>Next on</h5><div class="cm-grid">${card(next1)}${card(next2)}</div><a class="cm-all" href="work.html" data-leave>All work</a>`;
  document.querySelector('main').appendChild(nx);

  /* smooth in-page jumps, keyed to the section offset */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href*="#sec-"]'); if (!a) return;
    const t = document.getElementById(new URL(a.href,document.baseURI).hash.slice(1)); if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 90, behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', '#' + t.id);
  });
  /* leave transition */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-leave]'); if (!a || e.metaKey || e.ctrlKey || reduce) return;
    e.preventDefault(); document.body.classList.add('cm-leaving'); setTimeout(() => { location.href = a.getAttribute('href'); }, 320);
  });
  addEventListener('pageshow', () => document.body.classList.remove('cm-leaving'));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !sheet.classList.contains('open')) { document.body.classList.add('cm-leaving'); setTimeout(() => location.href = 'work.html', 250); } });

  /* reveal on scroll: block-level children of the case body */
  const blocks = [...main.querySelectorAll(':scope > *')].filter(el => !/^(BR|HR)$/.test(el.tagName) && el.getBoundingClientRect().height > 8);
  blocks.forEach(el => el.classList.add('cm-r'));
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('cm-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  blocks.forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('cm-in'); else io.observe(el); });

  /* scroll: progress, scroll-spy with sliding pill, hide bar while scrolling fast down near the top */
  const track = nav.querySelector('.cm-track'), pill = nav.querySelector('.cm-pillbg'), links = [...track.querySelectorAll('a')], curl = nav.querySelector('.cm-curl');
  let active = -1, lastY = scrollY, ticking = false;
  function setActive(i) {
    if (i === active) return; active = i;
    links.forEach((l, j) => l.classList.toggle('on', j === i));
    sheet.querySelectorAll('a').forEach((l, j) => l.classList.toggle('on', j === i));
    if (i < 0) { pill.style.opacity = 0; return; }
    const l = links[i]; pill.style.opacity = 1; pill.style.width = l.offsetWidth + 'px'; pill.style.transform = `translateX(${l.offsetLeft}px)`;
    track.scrollTo({ left: l.offsetLeft - track.clientWidth / 2 + l.offsetWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
    if (curl) curl.textContent = secs[i].label;
  }
  function onScroll() {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    let i = -1; secs.forEach((s, j) => { if (s.el.getBoundingClientRect().top < innerHeight * .35) i = j; });
    setActive(i);
    const atEnd = nx.getBoundingClientRect().top < innerHeight * .7;
    nav.classList.toggle('cm-hide', atEnd || (scrollY > lastY + 4 && scrollY < 200));
    lastY = scrollY;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', () => { const a = active; active = -2; setActive(a); });
  onScroll();
  // Project details retain one return link; chapter guides belong to Work case studies.
  if(!isWork){nav.remove();sheet.remove();nx.remove();prog.remove();document.body.classList.add('project-detail-mode');}
  document.dispatchEvent(new Event('rs-case-ready'));
})();
