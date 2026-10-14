/* Project pages: the Role / Medium / … row sits under the first image (title stays on top). */
(function () {
  const bc = document.querySelector('main bodycopy'); if (!bc) return;
  const head = bc.querySelector(':scope > .pj-head'), meta = head && head.querySelector('.pj-meta');
  if (!meta || meta.dataset.moved) return;
  const first = [...bc.children].find(c => c !== head && (c.matches('media-item,gallery-grid,gallery-columnized,gallery-slideshow,gallery-freeform,column-set') || c.querySelector('media-item')) && c.querySelector('img,video,iframe,.embed-frame'));
  if (!first) return;
  meta.dataset.moved = '1';
  first.after(meta);
})();
