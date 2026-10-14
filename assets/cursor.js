/* Site-wide cursor: a glowing light-green dot (#8ACE00) that replaces the mouse pointer.
   · over anything clickable it becomes a green ↗ arrow
   · over text (and while selecting it) it becomes a green text caret, sized to the text
   Mouse / trackpad only — touch screens keep their normal behaviour. */
(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = '138,206,0';
  const ease = 'cubic-bezier(.22,.8,.2,1)';
  const css = `
  html.cd-on, html.cd-on *{cursor:none!important}
  .cd-dot,.cd-halo{position:fixed;left:0;top:0;z-index:2147483646;pointer-events:none;opacity:0;transition:opacity .25s ease}
  .cd-dot{width:0;height:0}
  .cd-shape{position:absolute;left:0;top:0;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;background:#8ACE00;
    box-shadow:0 0 6px 1px rgba(${G},.95),0 0 16px 4px rgba(${G},.55),0 0 32px 10px rgba(${G},.22);
    transition:width .28s ${ease},height .28s ${ease},margin .28s ${ease},border-radius .28s ${ease},box-shadow .28s ease,transform .2s ${ease}}
  .cd-arrow{position:absolute;left:0;top:0;width:22px;height:22px;margin:-5px 0 0 -5px;opacity:0;transform:scale(.4) rotate(20deg);transform-origin:5px 5px;
    transition:opacity .2s ease,transform .3s ${ease};filter:drop-shadow(0 0 3px rgba(${G},.9)) drop-shadow(0 0 9px rgba(${G},.5))}
  .cd-arrow svg{display:block;width:100%;height:100%;transform:scaleX(-1)} /* points up-left, like a pointer */
  .cd-halo{border-radius:50%;width:34px;height:34px;margin:-17px 0 0 -17px;background:radial-gradient(closest-side,rgba(${G},.28),rgba(${G},0));
    transition:opacity .25s ease,width .35s ${ease},height .35s ${ease},margin .35s ${ease}}
  html.cd-vis .cd-dot,html.cd-vis .cd-halo{opacity:1}
  /* link: the dot folds into a green arrow */
  html.cd-link .cd-shape{width:0;height:0;margin:0;box-shadow:none}
  html.cd-link .cd-arrow{opacity:1;transform:none}
  html.cd-link .cd-halo{width:58px;height:58px;margin:-29px 0 0 -29px;background:radial-gradient(closest-side,rgba(${G},.3),rgba(${G},0))}
  /* text: the dot stretches into a caret, like an input field */
  html.cd-text .cd-shape{width:2px;height:var(--cd-h,20px);margin:calc(var(--cd-h,20px) / -2) 0 0 -1px;border-radius:1px;
    box-shadow:0 0 4px 0 rgba(${G},.9),0 0 10px 1px rgba(${G},.45)}
  html.cd-vis.cd-text .cd-halo{opacity:0}
  html.cd-down .cd-shape{transform:scale(.7)}
  html.cd-down.cd-text .cd-shape{transform:none}
  html.cd-down .cd-arrow{transform:scale(.85)}
  html.cd-hide .cd-dot,html.cd-hide .cd-halo{opacity:0!important}
  /* dark mode inverts the page — keep the cursor its true green */
  html[data-theme="dark"] .cd-dot,html[data-theme="dark"] .cd-halo{filter:invert(1) hue-rotate(180deg)}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const root = document.documentElement; root.classList.add('cd-on');

  const LINK = 'a,button,[role="button"],label,select,summary,.zoomable,media-item.linked,.th-toggle';
  const FIELD = 'input:not([type=range]):not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]),textarea,[contenteditable="true"]';
  // the text element under the pointer, but only when it sits on an actual line of text
  function onText(x, y, t) {
    if (!t || t.closest(LINK)) return null;
    if (getComputedStyle(t).userSelect === 'none') return null;
    let n = null;
    if (document.caretRangeFromPoint) { const r = document.caretRangeFromPoint(x, y); n = r && r.startContainer; }
    else if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(x, y); n = p && p.offsetNode; }
    if (!n || n.nodeType !== 3 || !n.textContent.trim()) return null;
    const rg = document.createRange(); rg.selectNodeContents(n);
    for (const b of rg.getClientRects()) if (x >= b.left - 2 && x <= b.right + 2 && y >= b.top - 2 && y <= b.bottom + 2) return n.parentElement;
    return null;
  }

  function mount() {
    const halo = document.createElement('div'); halo.className = 'cd-halo';
    const dot = document.createElement('div'); dot.className = 'cd-dot';
    dot.innerHTML = '<div class="cd-shape"></div><div class="cd-arrow"><svg viewBox="0 0 24 24"><path d="M9.3 14.7L13.2 10.8" fill="none" stroke="#8ACE00" stroke-width="2.6" stroke-linecap="round"/><path d="M18.6 5.4L17.4 16.2 7.8 6.6z" fill="#8ACE00" stroke="#8ACE00" stroke-width="1.6" stroke-linejoin="round"/></svg></div>';
    document.body.append(halo, dot);
    let x = -100, y = -100, hx = x, hy = y, raf = 0, selecting = false, lastText = null;
    const tick = () => {
      hx += (x - hx) * (reduce ? 1 : .2); hy += (y - hy) * (reduce ? 1 : .2);
      halo.style.transform = `translate3d(${hx}px,${hy}px,0)`;
      raf = Math.abs(x - hx) + Math.abs(y - hy) > .3 ? requestAnimationFrame(tick) : 0;
    };
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      dot.style.transform = `translate3d(${x}px,${y}px,0)`;
      root.classList.add('cd-vis');
      const t = e.target && e.target.closest ? e.target : null;
      const field = !!(t && t.closest(FIELD));
      const link = !field && !!(t && t.closest(LINK));
      let textEl = null;
      if (field) textEl = t;
      else if (!link) textEl = onText(x, y, t) || (selecting ? lastText : null);
      if (textEl) lastText = textEl;
      root.classList.toggle('cd-link', link && !selecting);
      root.classList.toggle('cd-text', !!textEl);
      if (textEl) {
        const fs = parseFloat(getComputedStyle(textEl).fontSize) || 16;
        dot.style.setProperty('--cd-h', Math.round(Math.min(Math.max(fs * 1.2, 14), 64)) + 'px');
      }
      // the Work covers show their own "Open case study" pill
      root.classList.toggle('cd-hide', !!(t && t.closest('.wk-cover')));
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    addEventListener('pointerdown', () => { root.classList.add('cd-down'); selecting = root.classList.contains('cd-text'); });
    addEventListener('pointerup', () => { root.classList.remove('cd-down'); selecting = false; });
    document.addEventListener('mouseleave', () => root.classList.remove('cd-vis'));
    addEventListener('blur', () => root.classList.remove('cd-vis'));
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
