/* Paulo Nobre · Projetos: scroll reveal for sections below the fold. */
(function () {
  // Scroll reveal
  var items = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });

  // Coming back from the browser cache: show everything right away
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) items.forEach(function (el) { el.classList.add('in'); });
  });
})();

/* Remember the language, shared with the portfolio (same key it uses) */
try { localStorage.setItem('pn-lang', document.documentElement.lang.indexOf('pt') === 0 ? 'pt' : 'en'); } catch (e) {}

/* Page push fallback where cross-page view transitions are not available */
(function () {
  if ('onpagereveal' in window) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    var url = new URL(a.getAttribute('href'), location.href);
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname) || url.pathname.indexOf('/demos/') > -1) return;
    if (url.pathname === location.pathname) return;
    e.preventDefault();
    var back = /(?:^|\/)(index\.html)?$/.test(url.pathname) && !/(?:^|\/)(index\.html)?$/.test(location.pathname);
    document.documentElement.classList.add('leaving'); if (back) document.documentElement.classList.add('back');
    setTimeout(function () { location.href = url.href; }, 330);
  });
  window.addEventListener('pageshow', function () { document.documentElement.classList.remove('leaving', 'back'); });
})();
