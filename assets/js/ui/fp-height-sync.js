// Front-page layout sync
// The .fp-content block is absolutely positioned, so <main> doesn't naturally
// contain it. Set main's min-height to extend to fp-content's bottom edge so
// the page is scrollable to include all hero content and the footer sits below.
// Watches body resize for viewport changes (which shift fp-content's position).
(function () {
  var fp = document.querySelector('.fp-content');
  var main = document.querySelector('main');
  if (!fp || !main) return;

  function sync() {
    main.style.minHeight = (fp.getBoundingClientRect().bottom - main.getBoundingClientRect().top) + 'px';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync);
  } else {
    sync();
  }
  new ResizeObserver(sync).observe(document.body);
})();
