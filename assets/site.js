/* Rainmelon Studio — behaviour layer replacing Cargo's runtime:
   mobile flag, masonry columns, slideshows, freeform galleries, marquees, lightbox. */
(function () {
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var isMobile = function () { return window.matchMedia('(max-width:767px)').matches; };
  var remPx = function () { return parseFloat(getComputedStyle(document.documentElement).fontSize); };
  function len(v) { // "6rem" / "12px" -> px
    v = (v || '').trim(); if (!v) return 0;
    var n = parseFloat(v); if (v.indexOf('rem') > -1) return n * remPx(); return n;
  }

  /* ---- mobile class (site.css uses `.mobile ...` rules) ---- */
  function setMode() { document.body.classList.toggle('mobile', isMobile()); }

  /* ---- masonry for <gallery-columnized> ---- */
  function layoutColumns() {
    $$('gallery-columnized').forEach(function (g) {
      var mobile = isMobile();
      var cols = parseInt(mobile ? g.dataset.mcols : g.dataset.cols, 10) || (mobile ? 1 : 3);
      var gap = getComputedStyle(g).getPropertyValue(mobile ? '--mgap' : '--gap').trim().split(/\s+/);
      var rowGap = len(gap[0]), colGap = len(gap[1] || gap[0]);
      var W = g.clientWidth, colW = (W - colGap * (cols - 1)) / cols;
      var heights = []; for (var i = 0; i < cols; i++) heights.push(0);
      var items = $$(':scope > media-item', g);
      var flush = g.classList.contains('ic-flush') && !mobile;
      items.forEach(function (it) { var f = it.querySelector('.mi-frame'); if (f && f.style.height) f.style.height = ''; });
      g.classList.add('ready');
      items.forEach(function (it) {
        var span = Math.min(cols, parseInt(it.dataset.span || '1', 10) || 1);
        var best = 0, bestY = Infinity;
        for (var c = 0; c + span <= cols; c++) {
          var y = Math.max.apply(null, heights.slice(c, c + span));
          if (y < bestY - 0.5) { bestY = y; best = c; }
        }
        var w = colW * span + colGap * (span - 1);
        it.style.width = w + 'px';
        it.style.transform = 'translate(' + (best * (colW + colGap)) + 'px,' + bestY + 'px)';
        var h = it.offsetHeight;
        for (var k = best; k < best + span; k++) heights[k] = bestY + h + rowGap;
        it._col = best;
      });
      // seamless grid: stretch the last card of each column so every column ends flush
      if (flush) {
        var maxH = Math.max.apply(null, heights), last = {};
        items.forEach(function (it) { last[it._col] = it; });
        Object.keys(last).forEach(function (c) {
          var it = last[c], f = it.querySelector('.mi-frame'), d = maxH - heights[c];
          if (f && d > 0.5) { f.style.height = (f.offsetHeight + d) + 'px'; heights[c] = maxH; }
        });
      }
      g.style.height = Math.max(0, Math.max.apply(null, heights) - rowGap) + 'px';
    });
  }

  /* ---- freeform: container height = lowest item ---- */
  function layoutFreeform() {
    $$('gallery-freeform').forEach(function (g) {
      if (isMobile()) { g.style.height = 'auto'; return; }
      var max = 0, top = g.getBoundingClientRect().top;
      $$(':scope > media-item', g).forEach(function (it) { max = Math.max(max, it.getBoundingClientRect().bottom - top); });
      g.style.height = max + 'px';
    });
  }

  /* ---- slideshows ---- */
  function initSlideshows() {
    $$('gallery-slideshow').forEach(function (g) {
      var slides = $$(':scope > media-item', g);
      if (!slides.length) return;
      var i = 0, timer = null;
      g.style.setProperty('--speed', (parseFloat(g.dataset.speed) || 0.8) + 's');
      var count = null;
      if (slides.length > 1 && g.dataset.nav !== 'none') {
        count = document.createElement('span'); count.className = 'ss-count'; g.appendChild(count);
      }
      function show(n) {
        slides[i].classList.remove('on'); i = (n + slides.length) % slides.length; slides[i].classList.add('on');
        if (count) count.textContent = (i + 1) + ' / ' + slides.length;
        var v = slides[i].querySelector('video'); if (v) { try { v.play(); } catch (e) {} }
      }
      show(0);
      if (slides.length < 2) return;
      if (g.dataset.autoplay === 'true') {
        var delay = Math.max(0.6, parseFloat(g.dataset.delay) || 3) * 1000;
        timer = setInterval(function () { show(i + 1); }, delay);
      }
      if (g.dataset.nav !== 'none') {
        g.addEventListener('mousemove', function (e) {
          var r = g.getBoundingClientRect(); g.classList.toggle('prev-zone', e.clientX < r.left + r.width / 2);
        });
        g.addEventListener('click', function (e) {
          if (e.target.closest('a')) return;
          e.preventDefault(); e.stopPropagation();
          var r = g.getBoundingClientRect();
          show(e.clientX < r.left + r.width / 2 ? i - 1 : i + 1);
          if (timer) { clearInterval(timer); timer = null; }
        });
      }
    });
  }

  /* ---- marquees ---- */
  function initMarquees() {
    $$('marquee-set').forEach(function (m) {
      var speed = parseFloat(m.dataset.speed) || -10;
      m.dataset.dir = speed > 0 ? 'right' : 'left';
      var track = m.querySelector('.mq-track');
      var w = track.scrollWidth / 2;
      track.style.setProperty('--dur', Math.max(8, w / (Math.abs(speed) * 6)) + 's');
    });
  }

  /* ---- lightbox for .zoomable media (project detail pages get ‹ › arrows) ---- */
  function initLightbox() {
    var lb = document.querySelector('.lightbox'); if (!lb) return;
    var stage = lb.querySelector('.lb-stage');
    if (!lb.querySelector('.lb-prev')) {
      lb.insertAdjacentHTML('beforeend',
        '<button class="lb-nav lb-prev" aria-label="Previous"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>' +
        '<button class="lb-nav lb-next" aria-label="Next"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>');
    }
    var NOT_DETAIL = ['page-homepage-desktop-1', 'page-work', 'page-menu', 'page-about', 'page-list', 'case-mode'];
    function isDetail() { var c = document.body.classList; return !NOT_DETAIL.some(function (k) { return c.contains(k); }); }
    var items = [], idx = 0, tx = null;
    function eligible(mi) { return mi.dataset.full && !mi.closest('gallery-slideshow[data-nav="cursor-zones"]'); }
    function render(fade) {
      var mi = items[idx], full = mi.dataset.full;
      var html = mi.dataset.video === 'true'
        ? '<video src="' + full + '" autoplay muted loop playsinline controls></video>'
        : '<img src="' + full + '" alt="">';
      if (!fade) { stage.innerHTML = html; return; }
      stage.classList.add('lb-fade');
      setTimeout(function () { stage.innerHTML = html; requestAnimationFrame(function () { stage.classList.remove('lb-fade'); }); }, 160);
    }
    function go(d) { if (items.length < 2) return; idx = (idx + d + items.length) % items.length; render(true); }
    function close() { lb.hidden = true; stage.innerHTML = ''; stage.classList.remove('lb-fade'); document.documentElement.style.overflow = ''; }
    document.addEventListener('click', function (e) {
      var mi = e.target.closest('media-item.zoomable');
      if (!mi || e.target.closest('a') || !eligible(mi) || lb.contains(mi)) return;
      var scope = document.querySelector('main') || document;
      items = isDetail() ? [].filter.call(scope.querySelectorAll('media-item.zoomable'), eligible) : [mi];
      idx = Math.max(0, items.indexOf(mi));
      lb.classList.toggle('lb-multi', items.length > 1);
      render(false);
      lb.hidden = false; document.documentElement.style.overflow = 'hidden';
    });
    lb.addEventListener('click', function (e) {
      if (e.target.closest('.lb-prev')) return go(-1);
      if (e.target.closest('.lb-next')) return go(1);
      if (e.target.closest('.lb-stage img, .lb-stage video') && !e.target.closest('.lb-close')) return;
      close();
    });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    });
    lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    });
    /* soft navigation swaps <main>: make sure an open lightbox never lingers */
    window.addEventListener('popstate', close);
    window.rsLightboxClose = close;
  }

  function relayout() { setMode(); layoutColumns(); layoutFreeform(); }
  var raf = null;
  function schedule() { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(relayout); }

  var ro = window.ResizeObserver ? new ResizeObserver(function () { schedule(); }) : null;
  function initContent() {
    setMode(); initSlideshows(); relayout(); initMarquees();
    $$('img').forEach(function (img) { if (!img.complete) img.addEventListener('load', schedule); });
    $$('video').forEach(function (v) { v.addEventListener('loadedmetadata', schedule); });
    if (ro) $$('gallery-columnized > media-item > .mi-frame').forEach(function (f) { ro.observe(f); });
  }
  window.rsSite = { init: initContent, relayout: schedule };
  document.addEventListener('DOMContentLoaded', function () {
    initContent(); initLightbox();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    window.addEventListener('resize', schedule);
    window.addEventListener('load', function () { schedule(); initMarquees(); });
  });
})();
