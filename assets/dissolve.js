/* Dissolve + soft navigation.
   - Media fades and un-blurs as it scrolls into view.
   - Internal links swap only the main content; the side bar never reloads.
     (Falls back to a normal page load when fetch isn't available, e.g. opened as a local file,
      or when the target is a full-screen case study.) */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ---------- type scale for styles that scripts inject at runtime (linked CSS is handled by type-scale.css) ---------- */
  const TS = 0.9, done = new WeakSet();
  function scaleRules(list) {
    for (const r of list) {
      if (r.cssRules && !r.style) { scaleRules(r.cssRules); continue; }
      if (!r.style) continue;
      const v = r.style.getPropertyValue('font-size');
      if (!v || /(^|[^r])em\b|%|var\(|calc\(\(/.test(v) || !/\d/.test(v)) continue;
      r.style.setProperty('font-size', `calc((${v}) * ${TS})`, r.style.getPropertyPriority('font-size'));
    }
  }
  function scaleStyles() {
    document.querySelectorAll('style').forEach(st => { if (done.has(st) || !st.sheet) return; done.add(st); try { scaleRules(st.sheet.cssRules); } catch (e) {} });
  }
  scaleStyles();
  new MutationObserver(scaleStyles).observe(document.documentElement, { childList: true, subtree: true });

  /* ---------- dissolve media ---------- */
  let io; const revealed = new WeakSet();
  function scan(scope) {
    if (reduce) return;
    io = io || new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, d = +el.dataset.dzd || 0; io.unobserve(el);
      setTimeout(() => el.classList.add('dz-in'), d);
      setTimeout(() => el.classList.remove('dz', 'dz-in'), 1800 + d);
    }), { rootMargin: '0px 0px -6% 0px' });
    const shared = document.body.matches('.page-homepage-desktop-1,.page-work,.page-menu,.page-about');
    const els = [...(scope || document).querySelectorAll(shared ? '.mi-frame, .wk-desc, .pl-hov, .mobile-intro' : '.mi-frame, .yx-ph, .wk-cover, iframe')]
      .filter(e => e.closest('.main') && (!e.closest('.th-keep, .yx-scr') || e.classList.contains('yx-ph')));
    let row = 0, last = -1;
    els.forEach(el => {
      if(revealed.has(el))return;revealed.add(el);
      const top = Math.round(el.getBoundingClientRect().top / 40);
      row = top === last ? row + 1 : 0; last = top;
      el.dataset.dzd = Math.min(row, 4) * 110 + 250;
      el.classList.add('dz'); io.observe(el);
    });
  }
  scan(document);
  let scanPending=false;
  new MutationObserver(()=>{if(scanPending)return;scanPending=true;requestAnimationFrame(()=>{scanPending=false;scan(document)})}).observe(document.body,{childList:true,subtree:true});


  /* ---------- side bar: fixed, never scrolls. Photo + social icons are pinned to its bottom edge;
     the rest is scaled down only if it would run into them ---------- */
  function dockSide() {
    document.querySelectorAll('.pin-left').forEach(pin => {
      if (pin.querySelector('.side-foot')) return;
      const bc = pin.querySelector('bodycopy'); if (!bc) return;
      const photo = [...bc.querySelectorAll('media-item')].find(m => !m.querySelector('img[src*="JingyiZhang_logo"]'));
      const so = bc.querySelector('.so-row'); const soBlock = so && (so.closest('column-set') || so);
      if (!photo && !soBlock) return;
      const foot = document.createElement('div'); foot.className = 'side-foot';
      if (photo) foot.appendChild(photo);
      if (soBlock) foot.appendChild(soBlock);
      // tidy the run of line breaks the moved items leave behind
      let n = bc.lastChild; while (n && (n.nodeName === 'BR' || (n.nodeType === 3 && !n.textContent.trim()))) { const p = n.previousSibling; n.remove(); n = p; }
      // the Change Mode control lives in the bottom-left corner on desktop, next to the social icons
      const th = document.querySelector('body > .th-float');
      if (th) { th.classList.add('th-side'); foot.appendChild(th); }
      pin.querySelector('.page-content').appendChild(foot);
    });
  }
  function fitSide() {
    document.querySelectorAll('.pin-left .page-content').forEach(c => {
      const bc = c.querySelector('bodycopy'), foot = c.querySelector('.side-foot');
      if (!bc) return;
      if (foot) { bc.style.transform = ''; const r = bc.getBoundingClientRect(); foot.style.left = r.left + 'px'; foot.style.width = r.width + 'px'; }
      bc.style.transform = ''; bc.style.transformOrigin = '0 0';
      const top = bc.getBoundingClientRect().top, room = (foot ? foot.getBoundingClientRect().top - 24 : innerHeight) - top;
      const h = bc.scrollHeight;
      if (h > room && room > 0) bc.style.transform = `scale(${Math.max(.6, room / h)})`;
    });
  }
  dockSide(); fitSide(); addEventListener('resize', fitSide);
  if (document.readyState !== 'complete') addEventListener('load', () => { dockSide(); fitSide(); });
  fitSide(); addEventListener('resize', fitSide); addEventListener('load', fitSide);

  /* ---------- soft navigation ---------- */
  const loaded = new Set([...document.scripts].map(s => s.src).filter(Boolean));
  let busy = false;
  const isPage = u => (u.protocol === location.protocol && u.host === location.host) && /(\.html|\/)$/.test(u.pathname);

  function hard(url) {
    try { sessionStorage.setItem('rs-keep', '1'); } catch (e) {}
    root.classList.add('rs-leaving');
    setTimeout(() => { location.href = url; }, 430);
  }

  const pageFile = u => (new URL(u, location.href).pathname.split('/').pop() || 'jingyizhang-design.html');
  function pageData(url) {
    const f = pageFile(url);
    window.rsPages = window.rsPages || {};
    if (window.rsPages[f]) return Promise.resolve(window.rsPages[f]);
    return new Promise((res, rej) => {
      const n = document.createElement('script');
      n.src = new URL('assets/pages/' + f.replace(/\.html$/, '.js'), document.baseURI).href;
      n.onload = () => window.rsPages[f] ? res(window.rsPages[f]) : rej(); n.onerror = rej;
      document.head.appendChild(n);
    });
  }

  let shown = location.hash.startsWith('#/') ? location.hash.slice(2) : (location.pathname.split('/').pop() || 'jingyizhang-design.html');
  const canSoft = () => !!document.querySelector('.pin-left') && !document.body.classList.contains('case-mode') && !document.querySelector('link[href*="case.css"]');
  window.rsPageData = pageData;
  async function go(url, push = true) {
    if (!canSoft()) return hard(url);
    if (busy) return; busy = true;
    const main = document.querySelector('.main');
    let d;
    main.classList.add('rs-out');
    try { [d] = await Promise.all([pageData(url), new Promise(r => setTimeout(r, 380))]); }
    catch (e) { busy = false; main.classList.remove('rs-out'); return hard(url); }   // full-screen case study, or no page data

    if (push) {
      if (location.protocol === 'file:') history.pushState({ rs: 1 }, '', '#/' + pageFile(url));   // local files can't change the path
      else history.pushState({ rs: 1 }, '', url);
    }
    document.title = d.title;
    const keep = document.body.classList.contains('mobile');
    document.body.className = d.body; if (keep) document.body.classList.add('mobile');
    const tpl = document.createElement('template'); tpl.innerHTML = d.main;
    const fresh = tpl.content.firstElementChild;
    main.replaceWith(fresh);
    scrollTo(0, 0);

    if (window.rsSite) window.rsSite.init();
    for (const src of d.scripts) {
      await new Promise(r => { const n = document.createElement('script'); n.src = new URL(src, document.baseURI).href; n.onload = n.onerror = r; document.body.appendChild(n); });
    }
    scan(fresh);
    shown = pageFile(url);
    if (window.rsNavSet) window.rsNavSet();
    if (window.rsSite) setTimeout(window.rsSite.relayout, 60);
    busy = false;
  }
  window.rsGo = url => go(new URL(url, location.href).href);

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || a.target === '_blank' || a.hasAttribute('download') || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const u = new URL(a.href, location.href);
    if (!isPage(u) || (u.pathname === location.pathname && u.hash && !u.hash.startsWith('#/'))) return;
    if (!canSoft()) return;   // let the browser load it normally
    e.preventDefault();
    if (pageFile(u.href) === pageFile(target())) return;
    go(u.href);
  });
  const target = () => location.hash.startsWith('#/') ? new URL(location.hash.slice(2), document.baseURI).href : location.href;
  addEventListener('popstate', () => {
    if (pageFile(target()) === shown) return;                            // same page: nothing to swap
    go(target(), false);
  });
  if (location.hash.startsWith('#/')) {
    if (!canSoft()) history.replaceState(null, '', location.pathname + location.search);   // stale soft-nav hash on a case study
    else if (location.hash.slice(2) !== pageFile(location.href)) go(target(), false);
  }
  addEventListener('pageshow', e => { if (e.persisted) root.classList.remove('rs-leaving'); });
})();
