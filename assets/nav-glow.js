/* Side-nav glow: the current section sits in a soft, blurred pill of light; clicking another item moves the glow there before the page changes. */
(function () {
  const ITEMS = [['jingyizhang-design.html', 'Index'], ['work.html', 'Work'], ['menu.html', 'Project'], ['about.html', 'About']];
  const WORK = ['knotboard', 'reelshort-casting-system', 'addendum-studio', 'vibe-painting', 'yi-iching-soundscapes', 'cave-song'];
  const PAGE = () => ((location.hash.startsWith('#/') ? location.hash.slice(2) : '') || location.pathname.split('/').pop() || 'jingyizhang-design.html').replace(/\.html$/, '') || 'index';

  const css = document.createElement('style');
  css.textContent = `
.nv-list{display:flex;flex-direction:column;align-items:flex-start;gap:.15em;margin:.2em 0 .1em}
.nv{position:relative;display:inline-block;padding:.12em 0;color:#1d1b18!important;opacity:1!important;text-decoration:none!important;isolation:isolate}
.nv::before{content:'';position:absolute;left:-1.6em;right:-1.6em;top:-.9em;bottom:-.9em;z-index:-1;pointer-events:none;
  background:radial-gradient(closest-side,rgba(138,206,0,.85),rgba(138,206,0,.45) 45%,rgba(138,206,0,0) 100%);
  filter:blur(14px);opacity:0;transform:scale(.6);
  transition:opacity .6s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1)}
.nv:hover::before{opacity:.35;transform:scale(.9)}
.nv span{transition:color .5s ease}
.nv.on span{color:#5e9c00}
html[data-theme="dark"] .nv.on span{color:#8ACE00;filter:invert(1) hue-rotate(180deg)}
.nv.on::before{opacity:1;transform:scale(1)}
.nv-list.moving .nv.on:not(.go)::before{opacity:0;transform:scale(.6)}
html[data-theme="dark"] .nv{color:inherit!important}
html[data-theme="dark"] .nv::before{background:radial-gradient(closest-side,#1c5a00,rgba(28,90,0,.9) 45%,rgba(28,90,0,0) 100%);filter:blur(16px)}
@media (prefers-reduced-motion:reduce){.nv::before{transition:none}}`;
  document.head.appendChild(css);

  function current(pg) {
    const page = pg || PAGE();
    if (page === 'index' || page === 'list') return 'jingyizhang-design.html';
    if (page === 'work' || WORK.includes(page)) return 'work.html';
    if (page === 'about') return 'about.html';
    return 'menu.html';
  }

  function build(root) {
    const first = [...root.querySelectorAll('a[href="jingyizhang-design.html"]')].find(a => a.textContent.trim() === 'Index');
    if (!first) return;
    // gather every old nav node (links, "> " text, line breaks, wrapper spans) between Index and About
    const about = [...root.querySelectorAll('a[href="about.html"]')].pop();
    if (!about) return;
    const list = document.createElement('div');
    list.className = 'nv-list';
    const cur = current();
    ITEMS.forEach(([h, t]) => {
      const a = document.createElement('a');
      a.href = h; a.className = 'nv' + (h === cur ? ' on' : '');
      a.innerHTML = '<span>' + t + '</span>';
      if (h === cur) a.setAttribute('aria-current', 'page');
      list.appendChild(a);
    });
    // remove old nodes: walk from the "> " text before Index to About
    const range = document.createRange();
    let start = first.previousSibling;
    range.setStartBefore(start && start.nodeType === 3 && start.textContent.includes('>') ? start : first);
    range.setEndAfter(about);
    range.deleteContents();
    range.insertNode(list);
    // tidy: drop now-empty wrapper spans and the stray break right after the list
    list.parentNode.querySelectorAll('span:empty,b:empty').forEach(e => e.remove());

    list.addEventListener('click', e => {
      const a = e.target.closest('.nv');
      if (!a || a.classList.contains('on') || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault(); e.stopPropagation();
      list.classList.add('moving');
      list.querySelectorAll('.nv').forEach(n => n.classList.remove('go'));
      a.classList.add('on', 'go');
      if (window.rsGo) window.rsGo(a.href); else location.href = a.href;
    });
  }

  window.rsNavSet = function () {
    const cur = current();
    document.querySelectorAll('.nv-list').forEach(l => { l.classList.remove('moving');
      l.querySelectorAll('.nv').forEach(n => { const on = n.getAttribute('href') === cur; n.classList.toggle('on', on); n.classList.remove('go'); on ? n.setAttribute('aria-current', 'page') : n.removeAttribute('aria-current'); }); });
  };
  function run() { document.querySelectorAll('.pin-left bodycopy').forEach(build); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  
})();
