/* Work page: hovering a project cover shows an "Open case study" pill that follows the cursor.
   On touch screens the pill sits on the cover instead. */
(function () {
  const css = `
  .wk-cover{position:relative;display:block;overflow:hidden;border-radius:2rem}
  .wk-cover img,.wk-cover video{transition:transform 1.1s cubic-bezier(.22,.8,.2,1)!important}
  .wk-cover:hover img,.wk-cover:hover video{transform:scale(1.025)}
  @media (hover:hover) and (pointer:fine){.wk-cover,.wk-cover *{cursor:none!important}}
  .wk-cursor{position:fixed;left:0;top:0;z-index:80;pointer-events:none;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;
    padding:11px 16px 11px 18px;border-radius:99px;background:#111;color:#fff;font:500 13px/1 Inter,'Diatype',-apple-system,sans-serif;letter-spacing:.01em;
    box-shadow:0 14px 30px -12px rgba(0,0,0,.45);transform:translate(-50%,-50%) scale(.4);opacity:0;transition:opacity .25s ease,transform .35s cubic-bezier(.22,.8,.2,1)}
  .wk-cursor.on{opacity:1;transform:translate(-50%,-50%) scale(1)}
  .wk-cursor i{font-style:normal;display:inline-block;transition:transform .35s cubic-bezier(.22,.8,.2,1)}
  .wk-cursor.on i{transform:translateX(2px)}
  .wk-tag{position:absolute;left:1.2rem;bottom:1.2rem;z-index:3;display:none;align-items:center;gap:6px;padding:8px 13px;border-radius:99px;
    background:rgba(17,17,17,.82);color:#fff;font:500 12px/1 Inter,-apple-system,sans-serif;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
  @media (hover:none),(pointer:coarse){.wk-tag{display:inline-flex}}
  @media (prefers-reduced-motion:reduce){.wk-cover img,.wk-cover video,.wk-cursor{transition:none!important}}`;
  if (!document.getElementById('wk-css')) { const st = document.createElement('style'); st.id = 'wk-css'; st.textContent = css; document.head.appendChild(st); }

  let pill = document.querySelector('.wk-cursor');
  if (!pill) { pill = document.createElement('div'); pill.className = 'wk-cursor'; pill.setAttribute('aria-hidden', 'true');
  pill.innerHTML = 'Open case study <i>→</i>'; document.body.appendChild(pill); }
  pill.classList.remove('on');

  // covers = the media links and the live Yi board on the Work list
  const covers = new Set();
  document.querySelectorAll('main a.mi-link').forEach(a => { const f = a.closest('media-item') || a; covers.add([f, a]); });
  document.querySelectorAll('main .yi-live-cover').forEach(c => covers.add([c, c.querySelector('a')]));
  let x = 0, y = 0, tx = 0, ty = 0, raf = 0, over = false;
  const loop = () => { x += (tx - x) * .22; y += (ty - y) * .22; pill.style.left = x + 'px'; pill.style.top = y + 'px'; raf = over || Math.abs(tx - x) > .5 ? requestAnimationFrame(loop) : 0; };
  covers.forEach(([el, link]) => {
    if (!link) return;
    el.classList.add('wk-cover');
    const tag = document.createElement('span'); tag.className = 'wk-tag'; tag.textContent = 'Open case study →';
    (el.querySelector('.mi-frame') || el).appendChild(tag);
    if (getComputedStyle(el.querySelector('.mi-frame') || el).position === 'static') (el.querySelector('.mi-frame') || el).style.position = 'relative';
    el.addEventListener('pointerenter', e => { if (e.pointerType !== 'mouse') return; over = true; tx = x = e.clientX; ty = y = e.clientY; pill.classList.add('on'); if (!raf) raf = requestAnimationFrame(loop); });
    el.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
    el.addEventListener('pointerleave', () => { over = false; pill.classList.remove('on'); });
  });
  addEventListener('scroll', () => { if (over) { /* keep the pill pinned to the pointer while scrolling */ } }, { passive: true });
})();

/* Work page: list view (one project per row) or grid view (two per row), switched from the control above the list. */
(function () {
  const bc = document.querySelector('body.page-work main bodycopy');
  if (!bc || bc.querySelector('.wk-grid')) return;
  const css = `
  .wk-bar{display:flex;justify-content:flex-end;margin:0 0 1.6rem}
  .wk-view{display:inline-flex;gap:2px;padding:3px;border-radius:99px;background:rgba(17,17,17,.05);box-shadow:inset 0 0 0 1px rgba(17,17,17,.06)}
  .wk-view button{all:unset;display:grid;place-items:center;width:34px;height:28px;border-radius:99px;color:rgba(17,17,17,.45);transition:background .3s,color .3s,box-shadow .3s}
  .wk-view button:hover{color:#111}
  .wk-view button[aria-pressed="true"]{background:#fff;color:#111;box-shadow:0 1px 3px rgba(0,0,0,.12),0 0 0 .5px rgba(0,0,0,.06)}
  .wk-view button:focus-visible{outline:2px solid #111;outline-offset:2px}
  .wk-view svg{width:15px;height:15px;display:block}
  .wk-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(3.5rem,7vw,6rem)}
  .wk-item{display:flex;flex-direction:column;gap:1.1rem;min-width:0;transition:opacity .4s ease}
  .wk-item>p.wk-desc{margin:0}
  .wk-grid.two{grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(2.6rem,5vw,4rem) clamp(1.4rem,2.6vw,2.4rem)}
  .wk-grid.two .wk-item{gap:.9rem}
  /* grid view card: [number + name] / cover / type / one-liner / short description */
  .wk-g{display:none}
  .wk-grid.two .wk-item>column-set{display:none}
  .wk-grid.two .wk-g{display:flex}
  .wk-grid.two .wk-head{order:0} .wk-grid.two .wk-item>gallery-slideshow,.wk-grid.two .wk-item>media-item,.wk-grid.two .wk-item>div:not(.wk-g){order:1}
  .wk-grid.two .wk-type{order:2} .wk-grid.two .wk-line{order:3} .wk-grid.two p.wk-desc{order:4}
  .wk-head{align-items:center;gap:.6rem;min-width:0}
  .wk-head .number{flex:none;transform:scale(.9);transform-origin:left center}
  .wk-head .wk-nm{font-size:1.08rem;font-weight:500;letter-spacing:-.01em;line-height:1.2;color:#111;text-decoration:none}
  .wk-head a.wk-nm:hover{opacity:.7}
  .wk-head .wk-soon{font-size:.72rem;color:rgba(17,17,17,.45);border:1px dashed rgba(17,17,17,.25);border-radius:99px;padding:.2rem .55rem;white-space:nowrap}
  .wk-type{align-items:center;margin-top:calc(.1rem + .75em)}
  .wk-type .wenshi{white-space:pre}
  .wk-line{font-size:.98rem;line-height:1.35;color:#111;letter-spacing:-.01em;margin-top:-.45rem}
  .wk-grid.two p.wk-desc{font-size:.86rem;line-height:1.5;color:rgba(17,17,17,.6);margin-top:-.4rem}
  .wk-grid.two .wk-item media-item .mi-frame,.wk-grid.two .wk-item .yi-live-cover{aspect-ratio:16/10;overflow:hidden;border-radius:1.4rem}
  .wk-grid.two .wk-item media-item .mi-frame>a,.wk-grid.two .wk-item media-item .mi-frame>.media{display:block;width:100%;height:100%}
  .wk-grid.two .wk-item media-item .media{width:100%!important;height:100%!important;object-fit:cover;border-radius:0!important}
  .wk-grid.wk-swap .wk-item{opacity:0}
  body.mobile .wk-bar{display:none}
  body.mobile .wk-grid.two{grid-template-columns:minmax(0,1fr)}
  @media (prefers-reduced-motion:reduce){.wk-item{transition:none}}`;
  if (!document.getElementById('wk-view-css')) { const st = document.createElement('style'); st.id = 'wk-view-css'; st.textContent = css; document.head.appendChild(st); }

  // group the flat page into one block per project: each starts at a header row with a project number
  const isStart = n => n.nodeType === 1 && n.matches('column-set') && n.querySelector('.number');
  const kids = [...bc.childNodes];
  const first = kids.findIndex(isStart);
  if (first < 0) return;
  const grid = document.createElement('div'); grid.className = 'wk-grid';
  bc.insertBefore(grid, kids[first]);
  let item = null;
  kids.slice(first).forEach(n => {
    if (isStart(n)) { item = document.createElement('article'); item.className = 'wk-item'; grid.appendChild(item); }
    item.appendChild(n);
  });
  const BLOCK = 'column-set,gallery-slideshow,gallery-columnized,media-item,div,figure,section';
  grid.querySelectorAll('.wk-item').forEach(it => {
    [...it.childNodes].forEach(n => { if (n.nodeName === 'BR') n.remove(); });
    let p = null;
    [...it.childNodes].forEach(n => {
      const block = n.nodeType === 1 && n.matches(BLOCK);
      if (block) { p = null; return; }
      if (n.nodeType === 3 && !n.textContent.trim()) { if (!p) n.remove(); else p.appendChild(n); return; }
      if (!p) { p = document.createElement('p'); p.className = 'wk-desc'; it.insertBefore(p, n); }
      p.appendChild(n);
    });
  });

  // grid view pieces, read from each project's header row
  const tidy = t => t.replace(/\s+/g, ' ').replace(/\s*\/\s*/g, ' / ').trim();
  grid.querySelectorAll('.wk-item').forEach(it => {
    const head = it.querySelector(':scope>column-set'); if (!head) return;
    const units = head.querySelectorAll(':scope>.cu');
    const num = head.querySelector('.number');
    const titleEl = units[1] ? units[1].cloneNode(true) : null;
    let soon = false;
    if (titleEl) titleEl.querySelectorAll('span').forEach(sp => { if (/in progress/i.test(sp.textContent)) { soon = true; sp.remove(); } });
    const full = titleEl ? tidy(titleEl.textContent) : '';
    const cut = full.search(/\s*[—–]\s*/);
    const name = cut > 0 ? full.slice(0, cut).trim() : full;
    const line = cut > 0 ? full.slice(cut).replace(/^\s*[—–]\s*/, '').trim() : '';
    const type = units[2] ? tidy(units[2].textContent) : '';
    const link = head.querySelector('a[href$=".html"]') || it.querySelector('a.mi-link[href$=".html"]');
    const h = document.createElement('div'); h.className = 'wk-g wk-head';
    if (num) { const n = num.cloneNode(true); n.removeAttribute('href'); h.appendChild(n.tagName === 'A' ? Object.assign(document.createElement('span'), { className: n.className, innerHTML: n.innerHTML, style: n.getAttribute('style') }) : n); }
    const nm = document.createElement(link ? 'a' : 'span'); nm.className = 'wk-nm'; nm.textContent = name; if (link) nm.href = link.getAttribute('href');
    h.appendChild(nm);
    if (soon) { const b = document.createElement('span'); b.className = 'wk-soon'; b.textContent = 'In progress'; h.appendChild(b); }
    it.prepend(h);
    if (type) {
      const t = document.createElement('div'); t.className = 'wk-g wk-type';
      // same outlined tag as the list view (cloned, so it keeps its look)
      const tag = units[2].querySelector('.wenshi');
      if (tag) { let top = tag; while (top.parentElement && top.parentElement.classList.contains('wenshi')) top = top.parentElement; t.appendChild(top.cloneNode(true)); }
      else t.textContent = type;
      it.appendChild(t);
    }
    if (line) { const l = document.createElement('div'); l.className = 'wk-g wk-line'; l.textContent = line; it.appendChild(l); }
  });

  // the control: list / grid
  const ICON_LIST = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="2.5" width="12" height="4.5" rx="1.2"/><rect x="2" y="9" width="12" height="4.5" rx="1.2"/></svg>';
  const ICON_GRID = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="2.5" width="5.2" height="4.5" rx="1.2"/><rect x="8.8" y="2.5" width="5.2" height="4.5" rx="1.2"/><rect x="2" y="9" width="5.2" height="4.5" rx="1.2"/><rect x="8.8" y="9" width="5.2" height="4.5" rx="1.2"/></svg>';
  const bar = document.createElement('div'); bar.className = 'wk-bar';
  bar.innerHTML = `<div class="wk-view" role="group" aria-label="Layout"><button type="button" data-v="one" aria-label="One project per row" title="List">${ICON_LIST}</button><button type="button" data-v="two" aria-label="Two projects per row" title="Grid">${ICON_GRID}</button></div>`;
  grid.before(bar);
  const KEY = 'rs-work-view';
  let saved = 'one'; try { saved = localStorage.getItem(KEY) || 'one'; } catch (e) {}
  const apply = (v, animate) => {
    const go = () => {
      grid.classList.toggle('two', v === 'two');
      bar.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v));
      if (window.rsSite && window.rsSite.relayout) window.rsSite.relayout();
      dispatchEvent(new Event('resize'));
    };
    if (!animate) return go();
    grid.classList.add('wk-swap');
    setTimeout(() => { go(); requestAnimationFrame(() => grid.classList.remove('wk-swap')); }, 260);
  };
  apply(saved, false);
  bar.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.getAttribute('aria-pressed') === 'true') return;
    try { localStorage.setItem(KEY, b.dataset.v); } catch (err) {}
    apply(b.dataset.v, true);
  });
})();
