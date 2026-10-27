/* Paulo Nobre · Portfólio · comportamento compartilhado (sem dependências) */
(function(){
  'use strict';
  var doc = document, root = doc.documentElement;

  /* ---- menu no celular ---- */
  var hdr = doc.querySelector('.hdr'), btn = doc.querySelector('.menu-btn');
  if(hdr && btn){
    var setMenu = function(open){ hdr.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open)); };
    btn.addEventListener('click', function(){ setMenu(!hdr.classList.contains('open')); });
    hdr.addEventListener('click', function(e){ if(e.target.closest('.nav a')) setMenu(false); });
    doc.addEventListener('keydown', function(e){ if(e.key === 'Escape' && hdr.classList.contains('open')){ setMenu(false); btn.focus(); } });
    window.addEventListener('resize', function(){ if(window.innerWidth > 860) setMenu(false); });
  }

  /* ---- revelação discreta ao rolar (desligada com movimento reduzido) ---- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rv = doc.querySelectorAll('.rv');
  if(reduce || !('IntersectionObserver' in window)){
    rv.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:0.08, rootMargin:'0px 0px -4% 0px'});
    rv.forEach(function(el){ io.observe(el); });
  }

  /* ---- preferência de idioma lembrada entre páginas ---- */
  doc.addEventListener('click', function(e){
    var a = e.target.closest('[data-lang-link]');
    if(a){ try{ localStorage.setItem('pn-lang', a.getAttribute('data-lang-link')); }catch(err){} }
  });

  /* ---- home: idioma no mesmo endereço (?lang=pt|en) ---- */
  if(!doc.body.hasAttribute('data-i18n')) return;
  var nodes = doc.querySelectorAll('[data-pt][data-en]');
  var attrs = doc.querySelectorAll('[data-href-pt][data-href-en]');
  var aria = doc.querySelectorAll('[data-aria-pt][data-aria-en]');
  var meta = doc.querySelector('meta[name="description"]');
  function setLang(l, push){
    root.lang = l === 'pt' ? 'pt-BR' : 'en';
    root.setAttribute('data-lang', l);
    nodes.forEach(function(n){ n.innerHTML = n.getAttribute('data-' + l); });
    attrs.forEach(function(n){ n.setAttribute('href', n.getAttribute('data-href-' + l)); });
    aria.forEach(function(n){ n.setAttribute('aria-label', n.getAttribute('data-aria-' + l)); });
    if(meta) meta.setAttribute('content', meta.getAttribute('data-meta-' + l));
    doc.title = doc.body.getAttribute('data-title-' + l);
    doc.querySelectorAll('[data-set-lang]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === l)); });
    doc.querySelectorAll('[data-only]').forEach(function(n){ n.hidden = n.getAttribute('data-only') !== l; });
    try{ localStorage.setItem('pn-lang', l); }catch(err){}
    if(push && window.history && history.replaceState){
      var u = new URL(location.href); u.searchParams.set('lang', l); history.replaceState(null, '', u.pathname + u.search + u.hash);
    }
  }
  doc.addEventListener('click', function(e){
    var b = e.target.closest('[data-set-lang]'); if(b) setLang(b.getAttribute('data-set-lang'), true);
  });
  var q = (location.search.match(/[?&]lang=(pt|en)\b/) || [])[1], saved = null;
  if(!q){ try{ saved = localStorage.getItem('pn-lang'); }catch(err){} }
  var lang = q || saved || ((navigator.language || 'en').toLowerCase().indexOf('pt') === 0 ? 'pt' : 'en');
  setLang(lang, false);

  /* ---- links antigos (#case/<id>) ---- */
  var m = location.hash.match(/^#case\/([\w-]+)/);
  if(m){
    var id = m[1], pt = lang === 'pt';
    var pages = {
      rotina:'automacao-rotina-operacional.html', routine:'automacao-rotina-operacional.html',
      rejections:'central-pagamentos-rejeitados.html', engine:'central-pagamentos-rejeitados.html',
      duplicates:'pagamentos-em-duplicidade.html', monitor:'monitor-operacao.html'
    };
    if(pages[id]){ location.replace((pt ? 'projetos/' : 'projetos/en/') + pages[id]); return; }
    if(id === 'infra'){
      var d = doc.getElementById('outra-iniciativa');
      if(d){ var det = d.querySelector('details'); if(det) det.open = true; d.scrollIntoView(); }
      return;
    }
    if(history.replaceState) history.replaceState(null, '', location.pathname + location.search);
  }
})();
