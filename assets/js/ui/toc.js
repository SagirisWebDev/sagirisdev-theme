(function () {
  'use strict';

  var HEADER_OFFSET = 88; // px — clears the fixed navbar + breathing room

  function slugify(text) {
    return text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function init() {
    var container = document.querySelector('.post-container');
    var nav       = document.getElementById('toc-nav');
    var sidebar   = document.querySelector('.toc-sidebar');
    if (!container || !nav || !sidebar) return;

    var headings = Array.from(container.querySelectorAll('h2, h3'))
      .filter(function (h) { return !h.closest('details'); });
    if (headings.length < 2) { sidebar.remove(); return; }

    // ── 1. Assign IDs to headings that are missing one ──────────────
    var used = {};
    headings.forEach(function (h) {
      if (h.id) { used[h.id] = true; return; }
      var base = slugify(h.textContent) || 'heading';
      var slug = base, n = 1;
      while (used[slug]) { slug = base + '-' + (++n); }
      used[slug] = true;
      h.id = slug;
    });

    // ── 2. Build TOC links ───────────────────────────────────────────
    var links = headings.map(function (h) {
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      if (h.tagName === 'H3') a.classList.add('toc-h3');
      nav.appendChild(a);
      return a;
    });

    // ── 3. Click: smooth scroll accounting for fixed header ──────────
    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var y = headings[i].getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        window.scrollTo({ top: y, behavior: 'smooth' });
        history.replaceState(null, '', '#' + headings[i].id);
      });
    });

    // ── 4. Scroll spy (rAF-throttled) ────────────────────────────────
    var activeLink = null;

    function setActive(link) {
      if (activeLink === link) return;
      if (activeLink) activeLink.classList.remove('toc-active');
      activeLink = link;
      if (activeLink) {
        activeLink.classList.add('toc-active');
        activeLink.scrollIntoView({ block: 'nearest' });
      }
    }

    function onScroll() {
      var threshold = HEADER_OFFSET + 8;
      var best = null;
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].getBoundingClientRect().top <= threshold) best = links[i];
      }
      setActive(best || links[0]);
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () { onScroll(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });

    onScroll(); // set initial state
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
