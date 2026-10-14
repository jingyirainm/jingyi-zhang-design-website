/* Replaces "© 2026" in the side nav (desktop) and footer bar (phones) with LinkedIn · Email · Instagram icons. */
(function () {
  const LINKS = [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jingyizhang145/', svg: '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h3.96V21H3zM9.5 9.75h3.8v1.54h.05c.53-1 1.82-2.05 3.75-2.05 4 0 4.74 2.63 4.74 6.06V21h-3.96v-5.06c0-1.2-.02-2.76-1.68-2.76-1.69 0-1.95 1.32-1.95 2.67V21H9.5z" fill="currentColor"/>' },
    { label: 'Email', href: 'mailto:jingyizhang145@gmail.com', svg: '<rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>' },
    { label: 'Instagram', href: 'https://www.instagram.com/jingyi_rainmz/', svg: '<rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3.9" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"/>' }
  ];
  const st = document.createElement('style');
  st.textContent = `.so-row{display:inline-flex;align-items:center;gap:.9em;vertical-align:middle}
  .so-row a{display:inline-flex;color:inherit!important;opacity:.75;transition:opacity .2s,transform .3s cubic-bezier(.22,.8,.2,1)}
  .so-row a:hover{opacity:1;transform:translateY(-1px)}
  .so-row a:focus-visible{outline:2px solid currentColor;outline-offset:3px;border-radius:4px}
  .so-row svg{width:1.15em;height:1.15em;display:block}
  .pin-mbottom .so-row svg{width:16px;height:16px}
  .so-list a{align-items:center;gap:.55em;opacity:.8;font:400 12.6px/1.2 Inter,'Diatype',-apple-system,sans-serif}
  .so-list .so-arr{display:inline-block;font-size:.9em;transition:transform .3s cubic-bezier(.22,.8,.2,1)}
  .so-list a:hover{transform:none}
  .so-list a:hover .so-arr{transform:translate(2px,-2px)}`;
  document.head.appendChild(st);
  const row = () => {
    const r = document.createElement('span'); r.className = 'so-row';
    r.innerHTML = LINKS.map(l => `<a href="${l.href}" ${l.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} aria-label="${l.label}" title="${l.label === 'Email' ? 'jingyizhang145@gmail.com' : l.label}"><svg viewBox="0 0 24 24" aria-hidden="true">${l.svg}</svg></a>`).join('');
    return r;
  };
  const list = () => {
    const r = document.createElement('span'); r.className = 'so-row so-list';
    const order = ['Instagram', 'Email', 'LinkedIn'];
    r.innerHTML = order.map(n => LINKS.find(l => l.label === n)).map(l => `<a href="${l.href}" ${l.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} title="${l.label === 'Email' ? 'jingyizhang145@gmail.com' : l.label}"><svg viewBox="0 0 24 24" aria-hidden="true">${l.svg}</svg><span class="so-t">${l.label}</span><span class="so-arr" aria-hidden="true">↗</span></a>`).join('');
    return r;
  };
  function mount() {
    document.querySelectorAll('.pin-left .jingyi-nametag, .pin-mbottom .page-nav').forEach(el => {
      if (el.querySelector('.so-row')) return;
      if (/©\s*2026/.test(el.textContent)) { el.textContent = ''; el.appendChild(el.closest('.pin-left') ? list() : row()); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
