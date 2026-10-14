/* Yi case study: live prototype frames, animated mockups, King Wen table */
(function () {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const IMG = 'assets/projects/yi/';

  // scale each 390×844 iframe or drawn screen into its phone
  function fit() { $$('.yx-scr').forEach(s => { const w = s.clientWidth; $$(':scope > iframe, :scope > .yx-ui', s).forEach(el => el.style.transform = `scale(${w / 390})`); }); }
  new ResizeObserver(fit).observe(document.body); fit();

  // load prototype frames as they approach the viewport
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const f = e.target; if (!f.src) f.src = f.dataset.src; io.unobserve(f); } }), { rootMargin: '400px' });
  $$('.yx-scr iframe[data-src]').forEach(f => io.observe(f));

  // trigram marquee
  const T = [['乾','Qian','Heaven'],['坤','Kun','Earth'],['巽','Xun','Wind'],['离','Li','Fire'],['兑','Dui','Rain'],['坎','Kan','Water'],['艮','Gen','Mountain'],['震','Zhen','Thunder']];
  const one = T.map(t => `<div class="yx-tri"><img src="${IMG}sq_${t[2]}.webp" alt="${t[2]}" loading="lazy"><div><b>${t[0]}</b><span>${t[1]} · ${t[2]}</span></div></div>`).join('');
  $$('.yx-track').forEach(tr => tr.innerHTML = one + one);

  // hero starfield
  $$('.yx-stars').forEach(c => {
    const x = c.getContext('2d'); let W, H, P = [];
    const size = () => { const r = c.getBoundingClientRect(); W = c.width = r.width * devicePixelRatio; H = c.height = r.height * devicePixelRatio;
      P = Array.from({ length: Math.round(W * H / 9000) }, () => ({ x: Math.random() * W, y: Math.random() * H, v: .08 + Math.random() * .3, s: (Math.random() < .08 ? 2.2 : 1.1) * devicePixelRatio, a: .2 + Math.random() * .6 })); };
    size(); addEventListener('resize', size);
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    (function f() { x.clearRect(0, 0, W, H); P.forEach(p => { if (!still) { p.y -= p.v; if (p.y < 0) { p.y = H; p.x = Math.random() * W; } } x.fillStyle = `rgba(242,239,232,${p.a})`; x.fillRect(p.x, p.y, p.s, p.s); }); requestAnimationFrame(f); })();
  });

  // tilt the live phone toward the pointer
  $$('.yx-stage').forEach(st => {
    const live = st.querySelector('.yx-s2');
    st.addEventListener('pointermove', e => { if (document.body.classList.contains('mobile')) return; const r = st.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5; live.style.transform = `rotateY(${dx * 8}deg) rotateX(${-dy * 6}deg)`; });
    st.addEventListener('pointerleave', () => live.style.transform = '');
  });

  // lock screen: live clock, moving waveforms, progress
  const two = n => String(n).padStart(2, '0');
  const tick = () => { const d = new Date(), t = `${d.getHours() % 12 || 12}:${two(d.getMinutes())}`;
    $$('.yx-ltime, .yx-htime').forEach(e => e.textContent = t);
    $$('.yx-ldate').forEach(e => e.textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })); };
  tick(); setInterval(tick, 15000);
  const waves = $$('.yx-lw').map(c => ({ x: c.getContext('2d'), k: +c.dataset.k, a: +c.dataset.a }));
  const t0 = performance.now(), dur = 20 * 60;
  (function f(ts) {
    waves.forEach(({ x, k, a }) => { x.clearRect(0, 0, 700, 44); x.strokeStyle = '#F2EFE8'; x.lineWidth = 2.2; x.beginPath();
      for (let i = 0; i <= 160; i++) { const px = i / 160 * 700, v = Math.sin(i * .38 * k + ts / 170) * .34 * Math.sin(i * .045 + ts / 1100) + Math.sin(i * 1.3 + ts / 60) * .05 + (Math.random() - .5) * .08; const py = 22 + v * a * 40; i ? x.lineTo(px, py) : x.moveTo(px, py); }
      x.stroke(); });
    const s = ((ts - t0) / 1000 + 482) % dur;
    $$('.yx-lbar').forEach(b => b.style.width = (s / dur * 100) + '%');
    $$('.yx-lt').forEach(e => e.textContent = `${Math.floor(s / 60)}:${two(Math.floor(s % 60))}`);
    requestAnimationFrame(f);
  })(performance.now());

  // King Wen table (rows: lower trigram, columns: upper trigram)
  const TR = { qian: ['乾','Heaven'], zhen: ['震','Thunder'], kan: ['坎','Water'], gen: ['艮','Mountain'], kun: ['坤','Earth'], xun: ['巽','Wind'], li: ['离','Fire'], dui: ['兑','Rain'] };
  const O = ['qian','zhen','kan','gen','kun','xun','li','dui'];
  const KW = [[1,34,5,26,11,9,14,43],[25,51,3,27,24,42,21,17],[6,40,29,4,7,59,64,47],[33,62,39,52,15,53,56,31],[12,16,8,23,2,20,35,45],[44,32,48,18,46,57,50,28],[13,55,63,22,36,37,30,49],[10,54,60,41,19,61,38,58]];
  const HX = [,['乾','Qian','The Creative'],['坤','Kun','The Receptive'],['屯','Zhun','Difficulty at the Beginning'],['蒙','Meng','Youthful Folly'],['需','Xu','Waiting'],['讼','Song','Conflict'],['师','Shi','The Army'],['比','Bi','Holding Together'],['小畜','Xiao Chu','Small Taming'],['履','Lü','Treading'],['泰','Tai','Peace'],['否','Pi','Standstill'],['同人','Tong Ren','Fellowship'],['大有','Da You','Great Possession'],['谦','Qian','Modesty'],['豫','Yu','Enthusiasm'],['随','Sui','Following'],['蛊','Gu','Work on the Decayed'],['临','Lin','Approach'],['观','Guan','Contemplation'],['噬嗑','Shi He','Biting Through'],['贲','Bi','Grace'],['剥','Bo','Splitting Apart'],['复','Fu','Return'],['无妄','Wu Wang','Innocence'],['大畜','Da Chu','Great Taming'],['颐','Yi','Nourishment'],['大过','Da Guo','Great Exceeding'],['坎','Kan','The Abysmal'],['离','Li','The Clinging'],['咸','Xian','Influence'],['恒','Heng','Duration'],['遯','Dun','Retreat'],['大壮','Da Zhuang','Great Power'],['晋','Jin','Progress'],['明夷','Ming Yi','Darkening of the Light'],['家人','Jia Ren','The Family'],['睽','Kui','Opposition'],['蹇','Jian','Obstruction'],['解','Xie','Deliverance'],['损','Sun','Decrease'],['益','Yi','Increase'],['夬','Guai','Breakthrough'],['姤','Gou','Coming to Meet'],['萃','Cui','Gathering Together'],['升','Sheng','Pushing Upward'],['困','Kun','Oppression'],['井','Jing','The Well'],['革','Ge','Revolution'],['鼎','Ding','The Cauldron'],['震','Zhen','The Arousing'],['艮','Gen','Keeping Still'],['渐','Jian','Development'],['归妹','Gui Mei','The Marrying Maiden'],['丰','Feng','Abundance'],['旅','Lü','The Wanderer'],['巽','Xun','The Gentle'],['兑','Dui','The Joyous'],['涣','Huan','Dispersion'],['节','Jie','Limitation'],['中孚','Zhong Fu','Inner Truth'],['小过','Xiao Guo','Small Exceeding'],['既济','Ji Ji','After Completion'],['未济','Wei Ji','Before Completion']];
  const SC = { 11: ['Tai','Gaze at the Earth, in the Cosmos'], 37: ['Jiaren','The Windy Bonfire Night'], 31: ['Xian','The Spring Mountain in the Rain'], 40: ['Xie','On the River, Before the Summer Rain'] };
  $$('.yx-kw').forEach(kw => {
    const g = kw.querySelector('.yx-kwg'), info = kw.querySelector('.yx-kwinfo');
    let h = '<div class="hd">lower ↓<br>upper →</div>' + O.map(u => `<div class="hd"><b>${TR[u][0]}</b>${TR[u][1]}</div>`).join('');
    O.forEach((lo, i) => { h += `<div class="hd rh"><b>${TR[lo][0]}</b>${TR[lo][1]}</div>`;
      O.forEach((up, j) => { const n = KW[i][j]; h += `<button type="button" class="${SC[n] ? 'sc' : ''}" data-n="${n}" data-lo="${lo}" data-up="${up}" aria-label="Hexagram ${n}, ${HX[n][1]}: ${TR[up][1]} over ${TR[lo][1]}"><b>${HX[n][0]}</b><small>${n}</small></button>`; }); });
    g.innerHTML = h;
    const show = b => { $$('button.on', g).forEach(x => x.classList.remove('on')); b.classList.add('on');
      const n = +b.dataset.n, lo = b.dataset.lo, up = b.dataset.up, s = SC[n];
      const imgs = s ? `<img src="${IMG}sq_${s[0]}.webp" alt="">` : (lo === up ? `<img src="${IMG}sq_${TR[lo][1]}.webp" alt="">` : `<img src="${IMG}sq_${TR[lo][1]}.webp" alt=""><img src="${IMG}sq_${TR[up][1]}.webp" alt="">`);
      info.innerHTML = `<div class="e">Hexagram ${n} · ${s ? 'Authored scene' : 'Layered mix'}</div><div class="z">${HX[n][0]}</div><b>${HX[n][1]} · ${HX[n][2]}</b><span>${TR[up][0]} ${TR[up][1]} above, ${TR[lo][0]} ${TR[lo][1]} below.${s ? '<br><i>' + s[1] + '</i>' : ''}</span><div class="sq">${imgs}</div>`; };
    ['pointerover', 'click', 'focusin'].forEach(ev => g.addEventListener(ev, e => { const b = e.target.closest('button'); if (b) show(b); }));
    show(g.querySelector('button[data-n="40"]'));
  });
})();
