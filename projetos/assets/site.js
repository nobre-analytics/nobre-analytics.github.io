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
