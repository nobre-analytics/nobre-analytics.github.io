/* Paulo Nobre · Projetos: direction of the page slide.
   Loaded in <head> so the listeners exist before the new page is revealed. */
(function () {
  // Order of the pages. The slide goes "forward" when moving to a higher number.
  var ORDER = {
    '': 0, 'index': 0,
    'central-pagamentos-rejeitados': 1,
    'pagamentos-em-duplicidade': 2,
    'monitor-operacao': 3,
    'monitor-operacao-celular': 4
  };

  function orderOf(url) {
    try {
      var path = new URL(url, location.href).pathname;
      var slug = path.split('/').pop().replace(/\.html$/, '');
      return slug in ORDER ? ORDER[slug] : null;
    } catch (e) { return null; }
  }

  // New page: decide the direction once it is revealed.
  window.addEventListener('pagereveal', function (e) {
    if (!e.viewTransition || !window.navigation || !navigation.activation) return;
    var from = navigation.activation.from && orderOf(navigation.activation.from.url);
    var to = orderOf(location.href);
    if (from == null || to == null) return;
    e.viewTransition.types.add(to < from ? 'back' : 'forward');
  });

  // Old page: same rule, so both snapshots agree on the direction.
  window.addEventListener('pageswap', function (e) {
    if (!e.viewTransition || !e.activation || !e.activation.entry) return;
    var from = orderOf(location.href);
    var to = orderOf(e.activation.entry.url);
    if (from == null || to == null) return;
    e.viewTransition.types.add(to < from ? 'back' : 'forward');
  });

})();
