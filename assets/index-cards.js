/* Index: hover reveals the bottom label; the whole card links directly to its project. */
(function () {
  const PROJECTS = {
    knot:  { n: 'Knotboard', m: 'SaaS', d: "Designed an all-in-one creative SaaS workspace that turns inspiration into action — helping creatives collect and organize ideas in a visual library, plan projects, track progress through dashboards, and use an AI agent to optimize plans in their creative process.", href: 'knotboard.html' },
    cast:  { n: 'ReelShort Casting System', m: 'B2B SaaS', d: "Redesigned and launched an internal casting platform for the leading global short- drama company, featuring a talent database and project management dashboard to support faster production decisions across high-volume TV productions.", href: 'reelshort-casting-system.html' },
    add:   { n: 'ReelShort Addendum Studio', m: 'B2B SaaS', d: "Designed and built an automated payroll documentation tool for ReelShort, simplifying contract preparation, payment paperwork, and compliance workflows for production teams.", href: 'reelshort-addendum-studio.html' },
    cave:  { n: 'Cave Song', m: 'Consumer Mobile App', d: "Designed a digital cultural heritage platform dedicated to preserving and promoting China's Mogao Caves, including educational resources, digital exhibitions, and cultural products to make historical heritage more accessible to new generations.", href: 'cave-song.html' },
    yi:    { n: 'Yi', m: 'Consumer Mobile App', d: "Designed a divination app inspired by the I Ching, combining tarot- and astrology-style daily guidance, mood check-ins, and personalized hexagram readings to support self-reflection, emotional well-being, and personal growth.", href: 'yi-daily-guidance.html' },
    vibe:  { n: 'VIBE', m: 'Consumer Mobile App', d: 'Consumer fashion AI app, built with Google Developer Group.', href: null },
    somni: { n: 'Somniloquy', m: 'Interactive Design / Video Game', d: 'Video installation and performance that became a playable dream world.', href: 'somniloquy.html' },
    vp:    { n: 'Vibe Painting', m: 'Facial Recognition-Based Interactive Design', d: 'Blow, blink and move your finger to marble a poster; your face is the brush.', href: 'vibe-painting.html' }
  };
  // which project each cover belongs to, matched on its file name
  const MATCH = [[/knot-?agent|knotboard/i, 'knot'], [/castpool/i, 'cast'], [/addendum/i, 'add'], [/chatgpt--2026929/i, 'cave'],
    [/hexagram|yi_|sq_/i, 'yi'], [/developers-social/i, 'vibe'], [/somniloquy/i, 'somni'], [/vibe_painting|vibe_tile/i, 'vp']];
  const galleries = [...document.querySelectorAll('main gallery-columnized')]; if (!galleries.length) return;
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const css = `
  .ic-card{cursor:pointer;outline:none;transition:opacity .5s cubic-bezier(.22,.8,.2,1),filter .5s cubic-bezier(.22,.8,.2,1)}
  .ic-card .mi-frame{position:relative;overflow:hidden;border-radius:2rem;isolation:isolate}
  .ic-card .mi-frame img,.ic-card .mi-frame video{transition:transform 1.2s cubic-bezier(.22,.8,.2,1),filter .6s ease!important}
  .ic-card:hover .mi-frame img,.ic-card:hover .mi-frame video{transform:scale(1.035)}
  .ic-cap{position:absolute;left:.8rem;right:.8rem;bottom:.8rem;z-index:3;display:flex;flex-direction:column;gap:.2rem;padding:.6rem .8rem;border-radius:1rem;
    background:rgba(255,255,255,.8);backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4);font-family:Inter,'Diatype',-apple-system,sans-serif;color:#111;
    transform:translateY(calc(100% + 1rem));opacity:0;transition:transform .55s cubic-bezier(.22,.8,.2,1),opacity .4s ease;pointer-events:none}
  .ic-card:hover .ic-cap,.ic-card:focus-visible .ic-cap{transform:none;opacity:1}
  .ic-cap b{font-size:.85rem;font-weight:500;line-height:1.2}
  .ic-cap i{font-style:normal;font-size:.72rem;line-height:1.25;color:rgba(17,17,17,.55)}
  .ic-link{position:absolute;inset:0;z-index:4;display:block;color:inherit!important;text-decoration:none!important;border-radius:inherit}
  .ic-link:focus-visible{outline:2px solid #111;outline-offset:-3px}
  .ic-link:focus-visible .ic-cap{transform:none;opacity:1}
  .ic-card.ic-unavailable{cursor:default}
  @media (hover:none){.ic-cap{transform:none;opacity:1}}
  @media (prefers-reduced-motion:reduce){.ic-card,.ic-card *{transition:none!important}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // desktop: one seamless block of cards, numbered 01, 02 … (sizes stay as before)
  if (!document.getElementById('ic-flush-css')) {
    const fs = document.createElement('style'); fs.id = 'ic-flush-css';
    fs.textContent = `
    body:not(.mobile) gallery-columnized.ic-flush{--gap:14px!important}
    body:not(.mobile) .ic-flush .ic-card .mi-frame{border-radius:1.6rem!important;overflow:hidden}
    body:not(.mobile) .ic-flush .ic-card .mi-frame::after{content:'';position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 1px rgba(17,17,17,.07);pointer-events:none;z-index:2}
    body:not(.mobile) .ic-flush .ic-card .mi-frame img,body:not(.mobile) .ic-flush .ic-card .mi-frame video{border-radius:0!important;width:100%;height:100%;object-fit:cover;display:block}
    .ic-no{display:none}
    body:not(.mobile) .ic-flush .ic-no{display:block;position:absolute;left:1.2rem;top:1.1rem;z-index:3;pointer-events:none;
      font:400 .95rem/1 ui-monospace,'SF Mono',Menlo,monospace;letter-spacing:.02em;color:#fff;mix-blend-mode:difference}
    body:not(.mobile) .ic-flush .ic-cap{left:1rem;right:1rem;bottom:1rem}`;
    document.head.appendChild(fs);
  }
  let num = 0;
  galleries.forEach(gal => {
    gal.classList.add('ic-gal', 'ic-flush'); num = 0;
    gal.querySelectorAll('media-item').forEach(mi => {
      const src = (mi.querySelector('img,video') || {}).currentSrc || (mi.querySelector('img,video') || {}).src || '';
      const hit = MATCH.find(([re]) => re.test(decodeURIComponent(src))); if (!hit) return;
      const p = PROJECTS[hit[1]], frame = mi.querySelector('.mi-frame') || mi;
      num++; frame.insertAdjacentHTML('afterbegin', `<span class="ic-no" aria-hidden="true">${String(num).padStart(2, '0')}</span>`);
      mi.classList.add('ic-card');
      mi.classList.remove('zoomable'); mi.removeAttribute('data-full');
      // Remove the old image-only link so each card has one native link and one tab stop.
      frame.querySelectorAll('a.mi-link').forEach(a => a.replaceWith(...a.childNodes));
      const caption = `<div class="ic-cap"><b>${esc(p.n)}</b><i>${esc(p.m)}${p.href ? '' : ' · Case study in progress'}</i></div>`;
      if (p.href) {
        frame.insertAdjacentHTML('beforeend', `<a class="ic-link" href="${p.href}" aria-label="${esc(p.n)}, ${esc(p.m)}">${caption}</a>`);
      } else {
        mi.classList.add('ic-unavailable');
        frame.insertAdjacentHTML('beforeend', caption);
      }
    });
  });
})();
