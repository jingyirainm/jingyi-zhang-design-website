/* Project page, "play" style: a quiet two-column grid of hairline cards.
   Hover a card → its title + one line fade in over the image; videos get a Play / Pause preview pill.
   Click a card → it expands into a large view with the title, "Open ↗" (when there is a project page) and ×. */
(function () {
  const bc = document.querySelector('body.page-menu main bodycopy');
  if (!bc || bc.dataset.play) return;
  bc.dataset.play = '1';
  const E = 'cubic-bezier(.22,.8,.2,1)';
  const relayout = () => { if (window.rsSite && window.rsSite.relayout) window.rsSite.relayout(); };
  const css = `
  body.page-menu .main bodycopy>br,body.page-menu .mf-sec>br{display:none}
  .pl-head{display:none!important}
  .pl-sec{margin:0 0 clamp(3.2rem,6vw,5rem)}
  .pl-title{display:flex;align-items:center;gap:.65rem;margin:0 0 1.1rem;padding:0;font:400 .98rem/1.2 Inter,'Diatype',-apple-system,sans-serif;letter-spacing:-.005em;color:#111}
  .pl-title i{font-style:normal;flex:none;display:inline-grid;place-items:center;min-width:3.1em;height:1.75em;padding:0 .7em;border-radius:99px;background:#111;color:#fff;font:500 .78em/1 Inter,'Diatype',-apple-system,sans-serif;letter-spacing:.04em}
  body.page-menu gallery-columnized media-item.pl-card{cursor:pointer}
  .pl-card .mi-frame{position:relative;background:#fff;border-radius:18px;padding:10px;box-shadow:0 0 0 1px rgba(17,17,17,.08);overflow:hidden;transition:box-shadow .35s ease}
  .pl-card:hover .mi-frame{box-shadow:0 0 0 1px rgba(17,17,17,.14),0 10px 28px -18px rgba(0,0,0,.25)}
  .pl-card .mi-frame .media{display:block;width:100%;height:auto;border-radius:0!important}
  .pl-card figcaption{display:none!important}
  .pl-hov{position:absolute;inset:10px;border-radius:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.35rem;padding:1.2rem;text-align:center;
    background:rgba(255,255,255,.72);backdrop-filter:blur(6px) saturate(1.1);-webkit-backdrop-filter:blur(6px) saturate(1.1);opacity:0;transition:opacity .35s ease;pointer-events:none;
    font-family:Inter,'Diatype',-apple-system,sans-serif;color:#111}
  .pl-card:hover .pl-hov,.pl-card:focus-visible .pl-hov{opacity:1}
  .pl-hov b{font-size:2.1rem;font-weight:300;letter-spacing:-.02em;line-height:1.1;transform:translateY(6px);transition:transform .5s ${E}}
  .pl-hov span{margin-top:1.35em;font-size:.84rem;line-height:1.35;color:rgba(17,17,17,.62);max-width:28ch;transform:translateY(6px);transition:transform .55s ${E}}
  .pl-hov p{margin:.35rem 0 0;font-size:.76rem;line-height:1.45;color:rgba(17,17,17,.7);max-width:34ch;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden;transform:translateY(6px);transition:transform .6s ${E}}
  .pl-card:hover .pl-hov b,.pl-card:hover .pl-hov span,.pl-card:hover .pl-hov p{transform:none}
  .pl-box.has-intro .pl-stage img,.pl-box.has-intro .pl-stage video{max-height:calc(92vh - 320px)}
  .pl-intro{margin:-6px 0 27px;padding:0 27px;box-sizing:border-box;width:100%;max-width:none;text-align:center;font-size:.98rem;line-height:1.6;color:rgba(17,17,17,.7)}
  .pl-pill{all:unset;position:absolute;right:16px;bottom:16px;z-index:2;padding:7px 12px;border-radius:99px;background:rgba(255,255,255,.92);color:#111;
    font:500 12px/1 Inter,'Diatype',-apple-system,sans-serif;box-shadow:0 1px 3px rgba(0,0,0,.12),0 0 0 .5px rgba(0,0,0,.06);cursor:pointer}
  .pl-pill:hover{background:#fff}
  .pl-modal{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:4vh 4vw;background:rgba(255,255,255,.55);
    backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);opacity:0;transition:opacity .35s ease}
  .pl-modal.on{opacity:1}
  .pl-box{position:relative;width:min(1100px,100%);max-height:92vh;display:flex;flex-direction:column;background:#fff;border-radius:22px;box-shadow:0 0 0 1px rgba(17,17,17,.08),0 30px 80px -30px rgba(0,0,0,.35);
    transform:translateY(16px) scale(.98);transition:transform .5s ${E};font-family:Inter,'Diatype',-apple-system,sans-serif;color:#111}
  .pl-modal.on .pl-box{transform:none}
  .pl-top{display:flex;align-items:center;gap:1rem;padding:21px 23px 12px 27px}
  .pl-top h3{flex:1;margin:0;font-size:1.42rem;font-weight:500;letter-spacing:-.012em;line-height:1.2}
  .pl-meta{display:flex;flex-wrap:wrap;gap:.6rem 2.2rem;margin:0;padding:2px 27px 16px;font-family:Inter,'Diatype',-apple-system,sans-serif}
  .pl-meta div{min-width:0;max-width:30rem}
  .pl-meta dt{font-size:.76rem;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:rgba(17,17,17,.42);margin:0 0 3px}
  .pl-meta dd{margin:0;font-size:.95rem;line-height:1.4;color:#111}
  .pl-top small{display:block;font-size:1.08rem;font-weight:400;color:rgba(17,17,17,.55);margin-top:4px}
  .pl-open{color:#111!important;text-decoration:none!important;font-size:1.14rem;opacity:.75}
  .pl-open:hover{opacity:1}
  .pl-x{all:unset;cursor:pointer;width:40px;height:40px;display:grid;place-items:center;border-radius:50%}
  .pl-x:hover{background:rgba(17,17,17,.06)}
  .pl-x svg{width:21px;height:21px;stroke:#111;stroke-width:1.6;fill:none}
  .pl-stage{position:relative;flex:1;min-height:0;display:grid;place-items:center;padding:6px 27px 27px}
  .pl-stage img,.pl-stage video{display:block;max-width:100%;max-height:calc(92vh - 210px);width:auto;height:auto;border-radius:12px}
  .pl-stage .pl-pill{right:39px;bottom:39px}
  html[data-theme="dark"] .pl-modal{background:rgba(255,255,255,.4)}
  body.mobile .pl-hov{display:none}
  @media (prefers-reduced-motion:reduce){.pl-card *,.pl-modal,.pl-box{transition:none!important}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // project pages for cards that only had a lightbox
  const PAGES = { 'vibe painting': 'vibe-painting.html', 'artificial appetite': 'artificial-appetite.html', 'knitted nature': 'knitted-nature.html' };
  // titles + one-liners for the cards, matched by the cover file name
  const CARDS = {
    '9.png':        ['Afterglow', 'Poster / Key Visual Design'],
    '7-04.png':     ['AASIGNAL', 'Poster / Key Visual Design'],
    '4.png':        ['DREAM QUESTION', 'Poster / Key Visual Design'],
    'rainmelonzjy_72706_httpss.mj.rungPpANqcPD2M_A_wrinkled_photog_832ec222-a416-43f4-8388-419281ec3318_1.png': ['Selection 1', 'AIGC Key Visual – Conceptual Series', 'A series of conceptual key visuals made with Midjourney and finished in post-production. I write and refine the prompts, steer composition and lighting, and curate the results until the series reads as one art direction. It’s the same workflow I use in product design to turn an abstract idea into a strong visual direction in hours, not weeks.'],
    'fashion-ai-cover.png': ['Selection 2', 'AIGC Key Visual – Fashion Series', 'AI-generated fashion imagery that explores styling, materials and mood for a cohesive editorial look. I use generative tools as a fast art-direction sandbox: exploring many looks, keeping the strongest, and refining them into brand-ready visuals. In product work, this lets me build mood boards and campaign concepts quickly to support brand design.'],
    'rainmelonzjy_72706_httpss.mj.runNqo7D69ohmo_httpss.mj.run3rrdAV_3cb399b2-6439-481e-a94d-358930393717_.png': ['Selection 3', 'AIGC Key Visual – Product Series', 'Product-focused key visuals that place objects in staged, cinematic scenes, from material and lighting studies to campaign-style shots. With AIGC I can prototype hero images, launch visuals and marketing assets early in a project, so product and brand teams can align on the look before investing in a photo shoot or 3D production.'],
    'mindspace.html':            ['Mindspace', 'AIGC Video'],
    'a-meditation-practice.html': ['A Meditation Practice', 'AIGC Video'],
    'new-york-fashion-week-fw26.html':     ['New York Fashion Week FW26', 'Fashion Runway Photography'],
    '.png':                       ['New York Fashion Week SS27', 'Fashion Runway Photography'],
    'knitted-nature.html':        ['Knitted Nature', 'Fashion Photography / Featured on Bazaar China website'],
  };
  const cardKey = it => {
    const l = it.querySelector('a.mi-link'); if (l && CARDS[l.getAttribute('href')]) return l.getAttribute('href');
    const m = it.querySelector('.media'); const f = m ? decodeURIComponent((m.getAttribute('src') || '').split('?')[0].split('/').pop()) : '';
    return CARDS[f] ? f : null;
  };
  const clean = t => t.replace(/ /g, ' ').replace(/\s+/g, ' ').replace(/\s*&\s*/g, ' & ').replace(/\s*\/\s*/g, ' / ').trim();

  // keep the original sections (the filter bar shows / hides them) with a clean small title above each grid
  const NAMES = { 'graphic/motion design': 'Graphic / Motion Design', 'aigc creation/ key visual': 'AIGC Creation / Key Visual', 'photography / art direction': 'Photography / Creative Direction', 'photography/ art direction': 'Photography / Creative Direction' };
  const secs = [...bc.querySelectorAll('.mf-sec')];
  (secs.length ? secs : [bc]).forEach(sec => {
    sec.classList.add('pl-sec');
    const hasGal = n => n && n.nodeType === 1 && (n.matches('gallery-columnized') || !!n.querySelector('gallery-columnized'));
    let label = '';
    const ic = sec.querySelector('.text-icon');
    if (ic) {
      // the label is the text right after the ◐ icon, up to the first line break
      let n = ic.nextSibling, got = '';
      while (n && n.nodeName !== 'BR' && !hasGal(n)) { got += n.textContent; n = n.nextSibling; }
      if (!got.trim() && ic.parentElement) got = ic.parentElement.firstChild === ic ? ic.parentElement.textContent : got;
      label = clean(got.replace('◐', '')).split(' I have ')[0];
      label = NAMES[label.toLowerCase()] || label;
      // drop the icon, the label and any loose text / breaks before the grid
      n = ic;
      while (n && !hasGal(n)) { const nx = n.nextSibling || (n.parentElement && n.parentElement !== sec && !hasGal(n.parentElement) ? n.parentElement.nextSibling : null); n.remove(); n = nx; }
    }
    // loose text nodes directly in the section (e.g. the old AIGC sentence) go too
    [...sec.childNodes].forEach(n => { if (n.nodeType === 3 && n.textContent.trim()) n.remove(); else if (n.nodeType === 1 && !hasGal(n) && !n.querySelector('img,video')) n.classList.add('pl-head'); });
    const gal = sec.querySelector('gallery-columnized');
    if (label && gal) {
      const h = document.createElement('h3'); h.className = 'pl-title';
      const no = document.createElement('i'); no.textContent = String(secs.indexOf(sec) + 1).padStart(3, '0');
      h.append(no, document.createTextNode(label));
      const block = [...sec.children].find(c => c.contains(gal)) || gal;
      sec.insertBefore(h, block);
    }
    // Keep the video previews in a dedicated two-column row before the AI images.
    sec.querySelectorAll('gallery-columnized').forEach(g => {
      const videos = [...g.querySelectorAll(':scope>media-item')].filter(it =>
        it.querySelector('a[href="mindspace.html"],a[href="a-meditation-practice.html"]'));
      if (!videos.length) return;
      const row = document.createElement('gallery-columnized');
      row.classList.add('pl-video-row');
      row.dataset.cols = '2';
      row.dataset.mcols = '1';
      row.style.setProperty('--mgap', '14px');
      row.style.marginBottom = '14px';
      g.before(row);
      videos.forEach(it => { it.removeAttribute('data-span'); row.appendChild(it); });
    });
    sec.querySelectorAll('gallery-columnized').forEach(g => {
      g.dataset.cols = g.classList.contains('pl-video-row') ? '2' : '3';
      g.style.setProperty('--gap', '14px 14px');
      g.querySelectorAll(':scope>media-item').forEach(it => card(it, label));
    });
  });

  function card(it, sectionLabel) {
    it.classList.add('pl-card'); it.classList.remove('zoomable'); it.tabIndex = 0;
    const cap = it.querySelector('figcaption');
    let lines = [];
    if (cap) { const c = cap.cloneNode(true); c.querySelectorAll('br').forEach(b => b.replaceWith('\n')); lines = c.textContent.split('\n').map(clean).filter(Boolean); }
    const info = (window.rsIntros || {})[(lines[0] || '').toLowerCase()] || null;
    const ck = cardKey(it); const over = ck ? CARDS[ck] : null;
    if (over) lines = [over[0], over[1]];
    const title = info ? info.title : (lines[0] || sectionLabel || 'Untitled');
    const rm = (window.rsMeta || {})[title] || null;
    const year = rm ? '' : (lines.find(l => /^\d{4}$/.test(l)) || '');
    const desc = rm ? rm.medium : (info ? info.type : lines.slice(1).filter(l => l !== year).join(' · '));
    const intro = info ? info.intro : ((over && over[2]) || '');
    const link = it.querySelector('a.mi-link');
    let href = (rm && rm.page) ? rm.page + '.html' : (link ? link.getAttribute('href') : (PAGES[title.toLowerCase()] || ''));
    const aliases={'jackery-home-power-3600.html':'jackery-brand-campaign.html','mind-space.html':'mindspace.html','aigc-conceptual.html':'selection-1.html','aigc-fashion.html':'selection-2.html','aigc-product.html':'selection-3.html','nyfw26-post-realm.html':'new-york-fashion-week-fw26.html'};
    href=aliases[href]||href||({'Afterglow':'afterglow.html','AASIGNAL':'aasignal.html','DREAM QUESTION':'dream-question.html'}[title]||'');
    if (link) link.addEventListener('click', e => e.preventDefault());
    it.dataset.plTitle = title; it.dataset.plDesc = [desc, year].filter(Boolean).join(' · '); it.dataset.plHref = href; it.dataset.plIntro = intro;
    const frame = it.querySelector('.mi-frame'); if (!frame) return;
    const hov = document.createElement('div'); hov.className = 'pl-hov';
    hov.innerHTML = `<b></b>${desc ? '<span></span>' : ''}`;
    hov.querySelector('b').textContent = title; if (desc) hov.querySelector('span').textContent = desc;
    frame.appendChild(hov);
    const v = frame.querySelector('video');
    if (v) frame.appendChild(pill(v));
    it.addEventListener('click', e => { if (e.target.closest('.pl-pill')) return; e.preventDefault(); e.stopPropagation(); open(it); }, true);
    it.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(it); } });
  }

  function pill(v) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pl-pill';
    const sync = () => { b.textContent = v.paused ? 'Play preview' : 'Pause preview'; };
    b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); v.paused ? v.play() : v.pause(); sync(); }, true);
    v.addEventListener('play', sync); v.addEventListener('pause', sync); sync();
    return b;
  }

  let modal = null;
  function open(it) {
    if(matchMedia('(min-width:768px)').matches && it.dataset.plHref){location.href=new URL(it.dataset.plHref.replace(/\.html$/, '/'),document.baseURI).href;return;}
    close(true);
    const src = it.querySelector('.media'); if (!src) return;
    modal = document.createElement('div'); modal.className = 'pl-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
    const href = it.dataset.plHref;
    modal.innerHTML = `<div class="pl-box"><div class="pl-top"><h3></h3>${href ? '<a class="pl-open">Open ↗</a>' : ''}<button type="button" class="pl-x" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg></button></div><div class="pl-stage"></div></div>`;
    const h = modal.querySelector('h3'); h.textContent = it.dataset.plTitle;
    const rmo = (window.rsMeta || {})[it.dataset.plTitle];
    const info = rmo ? Object.fromEntries([['Role', rmo.role], ['Medium', rmo.medium], ...(rmo.other || [])].filter(x => x[1])) : null;
    if (info) {
      const bar = document.createElement('dl'); bar.className = 'pl-meta';
      Object.entries(info).forEach(([k, v]) => { const d = document.createElement('div'); const t = document.createElement('dt'); t.textContent = k; const dd = document.createElement('dd'); dd.textContent = v; d.append(t, dd); bar.appendChild(d); });
      modal.querySelector('.pl-top').after(bar);
    } else if (it.dataset.plDesc) { const s = document.createElement('small'); s.textContent = it.dataset.plDesc; h.appendChild(s); }
    if (it.dataset.plIntro) { const p = document.createElement('p'); p.className = 'pl-intro'; p.textContent = it.dataset.plIntro; modal.querySelector('.pl-box').appendChild(p); modal.querySelector('.pl-box').classList.add('has-intro'); }
    if (href) { const o = modal.querySelector('.pl-open'); o.href = href; o.addEventListener('click', () => close(true)); }
    const stage = modal.querySelector('.pl-stage');
    let m;
    if (src.tagName === 'VIDEO') { m = document.createElement('video'); m.src = src.currentSrc || src.src; m.poster = src.poster || ''; if (src.getAttribute('width')) { m.width = +src.getAttribute('width'); m.height = +src.getAttribute('height'); } m.muted = true; m.loop = true; m.autoplay = true; m.playsInline = true; stage.appendChild(m); stage.appendChild(pill(m)); m.play().catch(() => {}); }
    else { m = document.createElement('img'); m.src = it.dataset.full || src.currentSrc || src.src; m.alt = it.dataset.plTitle; stage.appendChild(m); }
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('on'));
    modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.pl-x')) close(); });
    modal.querySelector('.pl-x').focus();
  }
  function close(now) {
    if (!modal) return; const m = modal; modal = null;
    if (now) return m.remove();
    m.classList.remove('on'); setTimeout(() => m.remove(), 350);
  }
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  // leaving the page (soft navigation swaps <main>, or the browser goes back / forward) always clears the expanded view
  addEventListener('popstate', () => close(true)); addEventListener('pagehide', () => close(true));
  // once this copy of the page is swapped out (soft navigation), close its own view and stop watching —
  // a fresh copy of play.js runs for the new page and must not be disturbed
  const mo = new MutationObserver(() => { if (!document.body.contains(bc)) { close(true); mo.disconnect(); } });
  mo.observe(document.body, { childList: true, subtree: true });

  // the filter bar sits on the same line as "Index" in the side bar (desktop)
  const align = () => {
    const wrap = document.querySelector('.mf-wrap'); if (!wrap) return;
    if (document.body.classList.contains('mobile')) { wrap.style.marginTop = ''; return; }
    const idx = [...document.querySelectorAll('.pin-left a')].find(a => a.textContent.trim() === 'Index'); if (!idx) return;
    wrap.style.marginTop = '0px';
    const r = idx.getBoundingClientRect(), w = wrap.getBoundingClientRect();
    const d = (r.top + r.height / 2) - (w.top + w.height / 2) + scrollY * 0;
    wrap.style.marginTop = Math.round(d) + 'px';
  };
  align(); setTimeout(align, 200); addEventListener('load', align); addEventListener('resize', align);
  relayout(); setTimeout(relayout, 300); addEventListener('load', relayout);
})();
