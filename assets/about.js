/* About page: live New York time, "show all" lists, quiet reveals. Safe to run again after soft navigation. */
(function () {
  const root = document.querySelector('.ab');
  if (!root) return;
  root.classList.add('ab-js');

  const clock = root.querySelector('[data-ny-time]');
  const tick = () => {
    if (!clock || !clock.isConnected) return clearInterval(timer);
    clock.textContent = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' }).format(new Date());
  };
  const timer = setInterval(tick, 20000); tick();

  root.querySelectorAll('.ab-more').forEach(btn => {
    const list = document.getElementById(btn.getAttribute('aria-controls'));
    if (!list) return;
    const n = list.children.length;
    if (n <= 6) { btn.remove(); list.classList.remove('clip'); return; }
    const label = () => btn.firstChild.textContent = list.classList.contains('clip') ? `Show all ${n}` : 'Show less';
    label();
    btn.addEventListener('click', () => {
      list.classList.toggle('clip');
      btn.setAttribute('aria-expanded', !list.classList.contains('clip'));
      label();
      if (window.rsSite && window.rsSite.relayout) window.rsSite.relayout();
    });
  });

  if (!('IntersectionObserver' in window)) { root.querySelectorAll('.ab-rv').forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
    { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  root.querySelectorAll('.ab-rv:not(.in)').forEach(e => io.observe(e));
})();
