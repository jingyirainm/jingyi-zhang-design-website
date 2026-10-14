/* Project detail pages: a small "← Back" control at the top of the content.
   Goes back in history when the visitor came from this site, otherwise opens the Project page. */
(function () {
  const main = document.querySelector('main .page-content');
  if (!main || document.body.classList.contains('case-mode') || main.querySelector('.bk-btn')) return;
  if (!document.getElementById('bk-css')) {
    const st = document.createElement('style'); st.id = 'bk-css';
    st.textContent = `
    .bk-bar{position:sticky;top:1.2rem;z-index:30;margin:0 0 1.6rem;pointer-events:none}
    .bk-btn{all:unset;pointer-events:auto;cursor:pointer;display:inline-flex;align-items:center;gap:.45rem;padding:.55rem .95rem .55rem .75rem;border-radius:99px;
      background:rgba(255,255,255,.86);backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4);
      box-shadow:0 0 0 1px rgba(17,17,17,.1) inset,0 10px 26px -16px rgba(0,0,0,.3);font:500 13px/1 Inter,'Diatype',-apple-system,sans-serif;color:#111;transition:background .25s}
    .bk-btn:hover{background:#fff}
    .bk-btn svg{width:15px;height:15px;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round;transition:transform .35s cubic-bezier(.22,.8,.2,1)}
    .bk-btn:hover svg{transform:translateX(-2px)}
    .bk-btn:focus-visible{outline:2px solid #111;outline-offset:3px}`;
    document.head.appendChild(st);
  }
  const bar = document.createElement('div'); bar.className = 'bk-bar';
  const b = document.createElement('a'); b.className = 'bk-btn'; b.href = 'menu.html'; b.setAttribute('aria-label', 'Back');
  b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>Back';
  b.addEventListener('click', e => {
    let same = false; try { same = document.referrer && new URL(document.referrer).origin === location.origin; } catch (err) {}
    if (same && history.length > 1) { e.preventDefault(); history.back(); }
  });
  bar.appendChild(b);
  main.prepend(bar);
})();
