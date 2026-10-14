/* Light / dark mode. Runs in <head> (no flash), then adds the "Change Mode" control once the page is parsed.
   Default follows the system setting and keeps following it live; a click overrides it and is remembered. */
(function () {
  const KEY = 'rs-theme', root = document.documentElement, mq = matchMedia('(prefers-color-scheme: dark)');
  const saved = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const apply = t => root.setAttribute('data-theme', t);
  apply(saved() || (mq.matches ? 'dark' : 'light'));
  try { if (sessionStorage.getItem('rs-keep')) { root.classList.add('rs-keep'); sessionStorage.removeItem('rs-keep'); } } catch (e) {}
  mq.addEventListener && mq.addEventListener('change', e => { if (!saved()) apply(e.matches ? 'dark' : 'light'); });

  function toggle() {
    const t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(t); try { localStorage.setItem(KEY, t); } catch (e) {}
    document.querySelectorAll('.th-toggle').forEach(b => b.setAttribute('aria-pressed', t === 'dark'));
  }
  function button(cls) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'th-toggle ' + (cls || '');
    b.setAttribute('aria-pressed', root.getAttribute('data-theme') === 'dark');
    b.setAttribute('aria-label', 'Change mode: switch between light and dark');
    b.innerHTML = '<span class="th-ico" aria-hidden="true"></span>Change Mode';
    b.addEventListener('click', toggle);
    return b;
  }
  function mount() {
    // already-dark product panels keep their own look in dark mode
    document.querySelectorAll('.yx-hero,.yx-strip,.yx-panel.dark,.yx-kwinfo,.yi-live-cover,.yix-hmw,.adx-sheet .dept').forEach(el => el.classList.add('th-keep'));
    // top-right on every page (floating); on phones it joins the top bar instead
    const foot = document.querySelector('.pin-left .side-foot');
    if (foot) foot.appendChild(button('th-float th-side')); else document.body.appendChild(button('th-float'));
    const mt = document.querySelector('.pin-mtop .mobile-nav, .pin-mtop .nametag');
    if (mt && !mt.querySelector('.th-toggle')) { mt.appendChild(button('th-inbar')); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(mount, 0)); else setTimeout(mount, 0);
})();
