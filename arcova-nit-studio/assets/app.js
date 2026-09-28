/* Arcova NIT Studio — page logic (no dependencies) */
(function () {
  'use strict';
  var C = window.ARCOVA, I = window.I18N;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };
  var round500 = function (n) { return Math.round(n / 500) * 500; };
  // LTR isolates keep "40,000 – 60,000" in order inside Arabic text
  var rng = function (lo, hi) { return '⁦' + fmt(lo) + ' – ' + fmt(hi) + '⁩'; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var session = {
    get: function (k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* blocked */ } }
  };
  var local = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* blocked */ } }
  };
  var photo = function (name, small) { return 'images/p/' + name + (small ? '-s' : '') + '.jpg'; };

  /* ---------- Language ---------- */
  var lang = 'ar';
  var t = function (k) { return I.rt[lang][k] || I.rt.ar[k] || k; };
  var tx = function (o, f) { return o ? (lang === 'en' && o[f + '_en']) || o[f] || '' : ''; };
  var AR = { text: {}, html: {}, ph: {} };
  $$('[data-i18n]').forEach(function (el) { AR.text[el.dataset.i18n] = el.textContent; });
  $$('[data-i18n-html]').forEach(function (el) { AR.html[el.dataset.i18nHtml] = el.innerHTML; });
  $$('[data-i18n-ph]').forEach(function (el) { AR.ph[el.dataset.i18nPh] = el.placeholder; });
  function applyStatic() {
    var en = lang === 'en';
    document.documentElement.lang = lang;
    document.documentElement.dir = en ? 'ltr' : 'rtl';
    $$('[data-i18n]').forEach(function (el) { var k = el.dataset.i18n; el.textContent = en ? (I.en[k] || AR.text[k]) : AR.text[k]; });
    $$('[data-i18n-html]').forEach(function (el) { var k = el.dataset.i18nHtml; el.innerHTML = en ? (I.en[k] || AR.html[k]) : AR.html[k]; });
    $$('[data-i18n-ph]').forEach(function (el) { var k = el.dataset.i18nPh; el.placeholder = en ? (I.en[k] || AR.ph[k]) : AR.ph[k]; });
    $('#langToggle').textContent = en ? 'ع' : 'EN';
  }
  function setLang(l, remember) {
    lang = l === 'en' ? 'en' : 'ar';
    if (remember) local.set('arcova_lang', lang);
    applyStatic(); renderAll();
  }

  /* ---------- Catalog ---------- */
  var CATS = C.catalog;
  var EST = CATS.filter(function (c) { return c.estimator; });
  var OTHER = CATS.filter(function (c) { return !c.estimator; });
  var byId = function (list, id) { return (list || []).find(function (x) { return x.id === id; }); };
  var catOf = function (id) { return byId(CATS, id); };
  var paletteOf = function (c) { return C.palettes[c.palette] || []; };
  var priced = function (a) { return a.fixed > 0 || a.perM2 > 0; };
  var fromPrice = function (c) { var m = c.types.filter(function (x) { return !x.quote; }).map(function (x) { return x.min; }); return m.length ? Math.min.apply(null, m) : 0; };

  /* ---------- Attribution ---------- */
  var query = new URLSearchParams(location.search);
  var attribution = (function () {
    var saved = session.get('arcova_attr') || {}, fresh = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'ttclid'].forEach(function (k) { if (query.get(k)) fresh[k] = query.get(k); });
    if (Object.keys(fresh).length) { saved = fresh; saved.landing = location.href; session.set('arcova_attr', saved); }
    if (!saved.referrer && document.referrer) { saved.referrer = document.referrer; session.set('arcova_attr', saved); }
    return saved;
  })();

  /* ---------- Tracking ---------- */
  var T = C.tracking || {};
  function loadScript(src) { var s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); }
  if (T.metaPixelId) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', T.metaPixelId); fbq('track', 'PageView');
  }
  if (T.ga4Id || T.googleAdsId) {
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + (T.ga4Id || T.googleAdsId));
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    if (T.ga4Id) gtag('config', T.ga4Id);
    if (T.googleAdsId) gtag('config', T.googleAdsId);
  }
  if (T.tiktokPixelId) {
    !function (w, d, t) { w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || []; ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie']; ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; }; for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]); ttq.load = function (e) { var n = 'https://analytics.tiktok.com/i18n/pixel/events.js'; ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = n; ttq._t = ttq._t || {}; ttq._t[e] = +new Date(); var o = d.createElement('script'); o.type = 'text/javascript'; o.async = !0; o.src = n + '?sdkid=' + e + '&lib=' + t; var a = d.getElementsByTagName('script')[0]; a.parentNode.insertBefore(o, a); }; ttq.load(T.tiktokPixelId); ttq.page(); }(window, document, 'ttq');
  }
  function track(event, params) {
    params = params || {};
    try {
      if (window.fbq) ({ Lead: 1, Contact: 1, ViewContent: 1 })[event] ? fbq('track', event, params) : fbq('trackCustom', event, params);
      if (window.gtag) {
        gtag('event', event === 'Lead' ? 'generate_lead' : event, params);
        if (event === 'Lead' && T.googleAdsId && T.googleAdsLeadLabel) gtag('event', 'conversion', { send_to: T.googleAdsId + '/' + T.googleAdsLeadLabel, value: params.value || 0, currency: 'EGP' });
      }
      if (window.ttq) { var tt = { Lead: 'SubmitForm', Contact: 'Contact', ViewContent: 'ViewContent' }[event]; if (tt) ttq.track(tt, params); }
    } catch (e) { /* never block the page */ }
  }

  /* ---------- Header + hero ---------- */
  var head = $('#head');
  var onScroll = function () { head.classList.toggle('solid', window.scrollY > window.innerHeight * 0.6); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var heroIdx = 0;
  $('#heroSlides').innerHTML = C.hero.map(function (n, i) { return '<img src="' + photo(n) + '" alt="" ' + (i ? 'loading="lazy"' : 'fetchpriority="high"') + (i === 0 ? ' class="on"' : '') + '>'; }).join('');
  $('#heroDots').innerHTML = C.hero.map(function (_, i) { return '<i' + (i === 0 ? ' class="on"' : '') + '></i>'; }).join('');
  setInterval(function () {
    var imgs = $$('#heroSlides img'), dots = $$('#heroDots i');
    imgs[heroIdx].classList.remove('on'); dots[heroIdx].classList.remove('on');
    heroIdx = (heroIdx + 1) % imgs.length;
    imgs[heroIdx].classList.add('on'); dots[heroIdx].classList.add('on');
  }, 5500);

  $('#year').textContent = new Date().getFullYear();
  var phoneEl = $('.js-phone');
  phoneEl.textContent = C.brand.phone;
  phoneEl.href = 'tel:' + C.brand.phone.replace(/\s/g, '');

  var ICONS = {
    light: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
    roof: '<path d="M2 11 12 4l10 7"/><path d="M5 9.5V20h14V9.5"/>',
    floor: '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 12h18M12 3v18"/>',
    leaf: '<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z"/><path d="M5 19 13 11"/>',
    sofa: '<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M2 12a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2z"/>',
    table: '<path d="M3 9h18M6 9v11M18 9v11M8 9V6h8v3"/>',
    ac: '<rect x="2" y="5" width="20" height="8" rx="2"/><path d="M6 17c0 1.5 1 2 2 2M12 16v4M18 17c0 1.5-1 2-2 2"/>',
    tv: '<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20h8M12 16v4"/>',
    star: '<path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>'
  };
  var icon = function (k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[k] || ICONS.star) + '</svg>'; };

  /* ---------- WhatsApp ---------- */
  var waUrl = function (text) { return 'https://wa.me/' + C.brand.whatsapp + '?text=' + encodeURIComponent(text); };
  var waFallback = null;
  function wireWa() {
    $$('.js-wa').forEach(function (a) { a.href = waUrl(t('waHello')); a.target = '_blank'; a.rel = 'noopener'; });
    $$('.js-wa-done').forEach(function (a) { a.href = waUrl(waFallback || t('waHello')); a.target = '_blank'; a.rel = 'noopener'; });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="https://wa.me"]');
    if (a) track('Contact', { method: 'whatsapp', placement: a.dataset.track || '' });
    if (e.target.closest('.js-phone')) track('Contact', { method: 'phone' });
  });

  /* ---------- Types + also ---------- */
  function renderTypes() {
    $('#typeCards').innerHTML = EST.map(function (c, i) {
      return '<a class="type" href="#price" data-cat="' + c.id + '">' +
        '<img src="' + photo(c.img, true) + '" alt="" loading="lazy">' +
        '<div class="type-in"><span class="type-no">0' + (i + 1) + '</span>' +
        '<h3>' + esc(tx(c, 'name')) + '</h3><p>' + esc(tx(c, 'line')) + '</p>' +
        '<div class="type-foot"><b><small>' + esc(t('from')) + '</small> ' + fmt(fromPrice(c)) + ' <small>' + esc(t('perM2')) + '</small></b><span class="type-go">→</span></div>' +
        '</div></a>';
    }).join('');
    $('#alsoList').innerHTML = OTHER.map(function (c) {
      return '<a href="' + esc(waUrl((lang === 'en' ? 'Hello Arcova, I’d like a quote for ' : 'أهلاً Arcova، عايز عرض سعر لـ ') + c.name)) + '" target="_blank" rel="noopener" data-track="also_' + c.id + '">' + esc(tx(c, 'name')) + '</a>';
    }).join('');
  }
  $('#typeCards').addEventListener('click', function (e) {
    var a = e.target.closest('[data-cat]'); if (!a) return;
    setCat(a.dataset.cat); goStep(1);
  });

  /* ---------- Story ---------- */
  var storyIdx = 0, storyTimer = null;
  function renderStory() {
    $('#storyStage').innerHTML = C.story.map(function (s, i) { return '<img src="' + photo(s.img) + '" alt="' + esc(tx(s, 'name')) + '" loading="lazy"' + (i === storyIdx ? ' class="on"' : '') + '>'; }).join('');
    $('#storyTabs').innerHTML = C.story.map(function (s, i) { return '<button type="button" role="tab" aria-selected="' + (i === storyIdx) + '" data-i="' + i + '"><span>0' + (i + 1) + '</span>' + esc(tx(s, 'name')) + '</button>'; }).join('');
  }
  function showStory(i) {
    storyIdx = i;
    $$('#storyStage img').forEach(function (im, k) { im.classList.toggle('on', k === i); });
    $$('#storyTabs button').forEach(function (b, k) { b.setAttribute('aria-selected', String(k === i)); });
  }
  $('#storyTabs').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    clearInterval(storyTimer); storyTimer = null; showStory(+b.dataset.i);
  });
  storyTimer = setInterval(function () { showStory((storyIdx + 1) % C.story.length); }, 3500);

  /* ---------- Gallery ---------- */
  var PAGE = 12, drive = [], gCat = 'all', gShown = PAGE, visible = [];
  var photos = function () {
    return drive.concat(C.gallery.map(function (g) { return { cat: g.cat, title: g.title, title_en: g.title_en, src: photo(g.img), thumb: photo(g.img, true) }; }));
  };
  function renderFilters() {
    var list = photos();
    var cats = CATS.filter(function (c) { return list.some(function (g) { return g.cat === c.id; }); });
    $('#filters').innerHTML = '<button type="button" role="tab" data-cat="all">' + esc(t('all')) + '</button>' +
      cats.map(function (c) { return '<button type="button" role="tab" data-cat="' + c.id + '">' + esc(tx(c, 'short') || tx(c, 'name')) + '</button>'; }).join('');
    $$('#filters button').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.cat === gCat)); });
  }
  function renderGallery() {
    var list = photos().filter(function (g) { return gCat === 'all' || g.cat === gCat; });
    visible = list.slice(0, gShown);
    $('#gallery').innerHTML = visible.map(function (g, i) {
      var c = catOf(g.cat), title = tx(g, 'title') || (c ? tx(c, 'name') : '');
      return '<button type="button" class="tile" data-i="' + i + '"><img src="' + esc(g.thumb || g.src) + '" alt="' + esc(title) + '" loading="lazy"><span>' + esc(title) + '</span></button>';
    }).join('');
    $('#galleryMore').hidden = list.length <= gShown;
  }
  $('#filters').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    gCat = b.dataset.cat; gShown = PAGE; renderFilters(); renderGallery();
  });
  $('#galleryMore').addEventListener('click', function () { gShown += PAGE; renderGallery(); });

  var lb = $('#lb'), lbIdx = 0, lastFocus = null;
  function showLb(i) {
    lbIdx = (i + visible.length) % visible.length;
    var g = visible[lbIdx], c = catOf(g.cat), title = tx(g, 'title') || (c ? tx(c, 'name') : '');
    $('#lbImg').src = g.src; $('#lbImg').alt = title; $('#lbCap').textContent = title;
  }
  $('#gallery').addEventListener('click', function (e) {
    var b = e.target.closest('.tile'); if (!b) return;
    lastFocus = b; showLb(+b.dataset.i); lb.hidden = false; $('#lbX').focus();
    track('ViewContent', { content_name: 'gallery' });
  });
  var closeLb = function () { lb.hidden = true; if (lastFocus) lastFocus.focus(); };
  $('#lbX').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', function () { showLb(lbIdx - 1); });
  $('#lbNext').addEventListener('click', function () { showLb(lbIdx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (!lb.hidden) closeLb(); if (!$('#quoteModal').hidden) closeQuote(); }
    if (lb.hidden) return;
    var rtl = document.documentElement.dir === 'rtl';
    if (e.key === 'ArrowLeft') showLb(lbIdx + (rtl ? 1 : -1));
    if (e.key === 'ArrowRight') showLb(lbIdx + (rtl ? -1 : 1));
  });

  /* ---------- Wizard ---------- */
  var st = { step: 1, cat: EST[0].id, type: EST[0].types[0].id, opt: EST[0].options[0].id, color: paletteOf(EST[0])[0].id, len: 5, wid: 4, addOns: ['lighting'] };
  var saved = session.get('arcova_wiz');
  if (saved && catOf(saved.cat) && catOf(saved.cat).estimator) { Object.assign(st, saved); st.step = 1; }
  st.addOns = st.addOns.filter(function (id) { return byId(C.addOns, id); });

  function setCat(id) {
    var c = catOf(id); if (!c || !c.estimator) return;
    st.cat = id;
    if (!byId(c.types, st.type)) st.type = c.types[0].id;
    if (!byId(c.options, st.opt)) st.opt = c.options[0].id;
    if (st.color !== 'custom' && !byId(paletteOf(c), st.color)) st.color = paletteOf(c)[0].id;
    renderWizard(); update();
  }
  function colorOf(c) { return st.color === 'custom' ? { name: 'حسب الطلب', name_en: 'Custom', hex: '' } : byId(paletteOf(c), st.color) || paletteOf(c)[0]; }

  function renderWizard() {
    var c = catOf(st.cat);
    $('#catPicks').innerHTML = EST.map(function (x) {
      return '<label class="cat"><input type="radio" name="cat" value="' + x.id + '"' + (x.id === st.cat ? ' checked' : '') + '><img src="' + photo(x.img, true) + '" alt="" loading="lazy"><b>' + esc(tx(x, 'short')) + '</b></label>';
    }).join('');
    $('#typePicks').innerHTML = c.types.map(function (x) {
      return '<label class="chip"><input type="radio" name="type" value="' + x.id + '"' + (x.id === st.type ? ' checked' : '') + '><span>' + esc(tx(x, 'name')) + (x.quote ? ' <small>' + esc(t('onReq')) + '</small>' : '') + '</span></label>';
    }).join('');
    $('#optLegend').textContent = tx(c, 'optionsLabel');
    $('#optPicks').innerHTML = c.options.map(function (o) {
      var pct = Math.round((o.factor - 1) * 100);
      return '<label class="chip"><input type="radio" name="opt" value="' + o.id + '"' + (o.id === st.opt ? ' checked' : '') + '><span>' + esc(tx(o, 'name')) + (pct > 0 ? ' <small>+' + pct + '%</small>' : '') + '</span></label>';
    }).join('');
    $('#colorPicks').innerHTML = paletteOf(c).map(function (p) {
      return '<label class="sw" title="' + esc(tx(p, 'name')) + '"><input type="radio" name="color" value="' + p.id + '" aria-label="' + esc(tx(p, 'name')) + '"' + (p.id === st.color ? ' checked' : '') + '><i style="background:' + p.hex + '"></i></label>';
    }).join('') + '<label class="sw sw-custom" title="' + esc(t('custom')) + '"><input type="radio" name="color" value="custom" aria-label="' + esc(t('custom')) + '"' + (st.color === 'custom' ? ' checked' : '') + '><i></i></label>';
    $('#addonPicks').innerHTML = C.addOns.map(function (a) {
      var p = a.perM2 ? '\u2066+' + fmt(a.perM2) + '\u2069 / ' + t('m2') : a.fixed ? '\u2066+' + fmt(a.fixed) + '\u2069' : t('bySel');
      return '<label class="addon"><input type="checkbox" name="addon" value="' + a.id + '"' + (st.addOns.indexOf(a.id) > -1 ? ' checked' : '') + '><span>' + icon(a.icon) + '<b>' + esc(tx(a, 'name')) + '</b><small>' + esc(p) + '</small></span></label>';
    }).join('');
    $('#len').value = st.len; $('#wid').value = st.wid;
  }

  function calc() {
    var c = catOf(st.cat), ty = byId(c.types, st.type) || c.types[0], o = byId(c.options, st.opt) || c.options[0];
    var area = st.len * st.wid;
    var lines = st.addOns.map(function (id) { return byId(C.addOns, id); }).filter(Boolean).map(function (a) {
      return { a: a, perArea: !!a.perM2, amount: a.perM2 ? a.perM2 * area : a.fixed || 0, priced: priced(a) };
    });
    var extras = lines.reduce(function (s, l) { return s + l.amount; }, 0);
    var r = { c: c, t: ty, o: o, col: colorOf(c), area: area, quote: !!ty.quote, lines: lines, unpriced: lines.filter(function (l) { return !l.priced; }) };
    if (!r.quote) {
      r.baseLo = round500(Math.max(ty.minTotal || 0, area * ty.min * o.factor));
      r.baseHi = round500(Math.max((ty.minTotal || 0) * 1.15, area * ty.max * o.factor));
      r.lo = round500(r.baseLo + extras); r.hi = round500(r.baseHi + extras);
    }
    return r;
  }
  var label = function (r) { return tx(r.c, 'name') + ' — ' + tx(r.t, 'name'); };
  var sizeText = function (r) { return st.len + ' × ' + st.wid + ' ' + t('m') + ' = ' + r.area.toFixed(1) + ' ' + t('m2'); };

  function drawPlan(r) {
    var W = 300, H = 220, pad = 40, len = st.len, wid = st.wid;
    var sc = Math.min((W - pad * 2) / len, (H - pad * 2) / wid);
    var w = len * sc, h = wid * sc, x = (W - w) / 2 + 8, y = (H - h) / 2 - 6;
    var tone = r.col.hex || '#a37b3a', ink = '#16120e', faint = '#b9b0a2';
    var solid = /solid/.test(r.t.id), out = '';
    out += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + tone + '" fill-opacity="' + (solid ? .6 : .12) + '" stroke="' + ink + '" stroke-width="' + (r.quote ? 3 : 1.4) + '"/>';
    if (!solid) for (var sx = x + Math.max(sc * .3, 7); sx < x + w - 2; sx += Math.max(sc * .3, 7)) out += '<line x1="' + sx + '" y1="' + y + '" x2="' + sx + '" y2="' + (y + h) + '" stroke="' + tone + '" stroke-width="2.4"/>';
    [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(function (p) { out += '<rect x="' + (p[0] - 5) + '" y="' + (p[1] - 5) + '" width="10" height="10" fill="' + ink + '"/>'; });
    var dy = y + h + 18, dx = x - 18;
    out += '<g stroke="' + faint + '"><line x1="' + x + '" y1="' + dy + '" x2="' + (x + w) + '" y2="' + dy + '"/><line x1="' + dx + '" y1="' + y + '" x2="' + dx + '" y2="' + (y + h) + '"/></g>';
    var f = 'font-family="Alexandria, sans-serif" font-size="12" fill="' + ink + '"';
    out += '<text x="' + (x + w / 2) + '" y="' + (dy + 15) + '" text-anchor="middle" ' + f + '>' + len.toFixed(1) + ' m</text>';
    out += '<text x="' + (dx - 7) + '" y="' + (y + h / 2) + '" text-anchor="middle" transform="rotate(-90 ' + (dx - 7) + ' ' + (y + h / 2) + ')" ' + f + '>' + wid.toFixed(1) + ' m</text>';
    $('#plan').innerHTML = out;
  }

  function update() {
    var r = st.r = calc();
    $('#tImg').src = photo(r.c.img, true);
    $('#tType').textContent = label(r);
    $('#tMeta').innerHTML = esc(tx(r.o, 'name')) + ' · ' + (r.col.hex ? '<i class="dot" style="background:' + r.col.hex + '"></i>' : '') + esc(tx(r.col, 'name')) + ' · ' + esc(sizeText(r));
    $('#tPrice').textContent = r.quote ? t('onReq') : rng(r.lo, r.hi) + ' ' + t('egp');
    $('#tNote').textContent = r.quote ? t('noteQuote') : t('noteRange') + (r.unpriced.length ? t('notePlus') : '');
    $('#colorName').textContent = tx(r.col, 'name');
    $('#lenOut').textContent = st.len + ' ' + t('m'); $('#widOut').textContent = st.wid + ' ' + t('m');
    drawPlan(r);
    session.set('arcova_wiz', { cat: st.cat, type: st.type, opt: st.opt, color: st.color, len: st.len, wid: st.wid, addOns: st.addOns });
  }

  function goStep(n) {
    st.step = Math.max(1, Math.min(5, n));
    $$('.panel').forEach(function (p) { p.hidden = +p.dataset.panel !== st.step; });
    $$('#wizSteps li').forEach(function (li) { var k = +li.dataset.step; li.classList.toggle('on', k === st.step); li.classList.toggle('ok', k < st.step); });
    $('#wizBack').hidden = st.step === 1;
    $('#wizNext').hidden = st.step === 5;
    $('#wizSubmit').hidden = st.step !== 5;
  }
  var viewed = false;
  $('#wizForm').addEventListener('change', function (e) {
    var el = e.target;
    if (el.name === 'cat') { setCat(el.value); return; }
    if (el.name === 'type') st.type = el.value;
    if (el.name === 'opt') st.opt = el.value;
    if (el.name === 'color') st.color = el.value;
    if (el.name === 'addon') st.addOns = $$('input[name="addon"]:checked').map(function (i) { return i.value; });
    update();
    if (!viewed) { viewed = true; track('ViewContent', { content_name: 'estimator' }); }
  });
  ['len', 'wid'].forEach(function (k) { $('#' + k).addEventListener('input', function () { st[k] = parseFloat(this.value); update(); }); });
  $('#wizNext').addEventListener('click', function () { goStep(st.step + 1); $('#wiz').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  $('#wizBack').addEventListener('click', function () { goStep(st.step - 1); });
  $('#wizSteps').addEventListener('click', function (e) { var li = e.target.closest('li'); if (li && +li.dataset.step < st.step) goStep(+li.dataset.step); });

  /* ---------- Submit ---------- */
  function normalizePhone(v) {
    var d = String(v || '').replace(/[٠-٩]/g, function (c) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(c); }).replace(/\D/g, '');
    if (d.indexOf('0020') === 0) d = d.slice(4);
    if (d.indexOf('20') === 0 && d.length === 12) d = d.slice(2);
    if (d.length === 10 && d[0] === '1') d = '0' + d;
    return /^01[0125]\d{8}$/.test(d) ? d : null;
  }
  function compressImage(file) {
    return new Promise(function (resolve) {
      if (!file || !/^image\//.test(file.type)) return resolve(null);
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, 1600 / Math.max(img.width, img.height)), cv = document.createElement('canvas');
        cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url);
        resolve({ name: file.name.replace(/\.[^.]+$/, '') + '.jpg', data: cv.toDataURL('image/jpeg', 0.8).split(',')[1] });
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }
  var lastQuote = null;
  function summary(r) {
    return [label(r), tx(r.o, 'name'), tx(r.col, 'name'), sizeText(r)].concat(r.lines.length ? [r.lines.map(function (l) { return tx(l.a, 'name'); }).join(' + ')] : []).join(t('sep')) +
      ' — ' + (r.quote ? t('onReq') : rng(r.lo, r.hi) + ' ' + t('egp'));
  }

  $('#wizForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if ($('#fWebsite').value) return;
    var err = $('#formErr'), name = $('#fName').value.trim(), phone = normalizePhone($('#fPhone').value), area = $('#fArea').value.trim();
    $('#fPhone').setAttribute('aria-invalid', String(!phone));
    if (!name || !phone || !area) {
      err.textContent = !name ? t('errName') : !phone ? t('errPhone') : t('errArea'); err.hidden = false;
      (!name ? $('#fName') : !phone ? $('#fPhone') : $('#fArea')).focus(); return;
    }
    err.hidden = true;
    var r = st.r, ar = function (o) { return o ? o.name : ''; };
    var p = {
      leadId: 'ARC-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
      name: name, phone: phone, location: area,
      project: r.c.name + ' — ' + r.t.name,
      size: st.len + ' × ' + st.wid + ' م (' + r.area.toFixed(1) + ' م²)',
      estimate: r.quote ? 'بعد التوصيف' : rng(r.lo, r.hi) + ' ج.م' + (r.unpriced.length ? ' + بنود حسب الاختيار' : ''),
      addOns: r.lines.map(function (l) { return ar(l.a); }).join('، '),
      material: ar(r.o), color: ar(r.col), contactTime: '', notes: $('#fNotes').value.trim(), lang: lang,
      utmSource: attribution.utm_source || (attribution.referrer ? 'referral' : 'direct'),
      utmMedium: attribution.utm_medium || '', utmCampaign: attribution.utm_campaign || '', utmContent: attribution.utm_content || '', utmTerm: attribution.utm_term || '',
      clickId: attribution.fbclid || attribution.gclid || attribution.ttclid || '',
      pageUrl: attribution.landing || location.href, referrer: attribution.referrer || '', userAgent: navigator.userAgent
    };
    lastQuote = { p: p, r: r, len: st.len, wid: st.wid, date: new Date() };
    p.quote = quoteData(lastQuote);
    var btn = $('#wizSubmit'), btnText = btn.textContent;
    btn.disabled = true; btn.textContent = t('sending');
    compressImage($('#fPhoto').files[0]).then(function (img) {
      if (img) { p.imageName = img.name; p.imageData = img.data; }
      if (!C.sheetWebhookUrl) throw new Error('no-webhook');
      return fetch(C.sheetWebhookUrl, { method: 'POST', body: JSON.stringify(p), redirect: 'follow' })
        .then(function (res) { return res.json(); })
        .then(function (j) { if (!j.ok) throw new Error(j.error || 'sheet'); if (j.quoteUrl) lastQuote.pdfUrl = j.quoteUrl; });
    }).then(function () { finish(p, false); }, function (e2) {
      if (e2 && e2.message !== 'no-webhook' && window.console) console.warn('Lead webhook failed:', e2);
      waFallback = t('waLead') + p.name + t('waWant') + summary(r) + t('waArea') + p.location + t('waPhone') + p.phone + ' [' + p.leadId + ']';
      finish(p, true);
    }).then(function () { btn.disabled = false; btn.textContent = btnText; });
  });
  function finish(p, viaWa) {
    track('Lead', { value: st.r.lo || 0, currency: 'EGP', content_name: p.project });
    $('#wiz').hidden = true;
    $('#doneName').textContent = p.name.split(' ')[0];
    if (viaWa) $('#doneText').textContent = t('fbText');
    $('#done').hidden = false; wireWa();
    $('#done').scrollIntoView({ behavior: 'smooth', block: 'center' });
    openQuote();
  }

  /* ---------- Quote ---------- */
  var fmtDate = function (d) { return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'ar-EG-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }); };
  function quoteRows(q) {
    var r = q.r, rows = [[t('qStructure'), label(r) + ' · ' + tx(r.o, 'name'), r.area.toFixed(1) + ' ' + t('m2'), r.quote ? t('onReq') : rng(r.baseLo, r.baseHi)]];
    r.lines.forEach(function (l) { rows.push([tx(l.a, 'name'), '', l.perArea ? r.area.toFixed(1) + ' ' + t('m2') : '1', l.priced ? fmt(l.amount) : t('qOnSite')]); });
    return rows;
  }
  function quoteData(q) {
    var r = q.r, p = q.p, strip = function (x) { return String(x).replace(/[⁦-⁩]/g, ''); };
    return {
      lang: lang, title: t('qTitle'), phone: C.brand.phone, logoUrl: new URL('images/logo-160.png', location.href).href,
      meta: [[t('qNo'), p.leadId], [t('qDate'), fmtDate(q.date)], [t('qValid'), fmtDate(new Date(q.date.getTime() + 14 * 864e5))]],
      clientLabel: t('qClient'), client: [[t('qName'), p.name], [t('qPhone'), p.phone], [t('qArea'), p.location]],
      projectLabel: t('qProject'), project: [[t('qType'), label(r)], [t('qMat'), tx(r.o, 'name')], [t('qColor'), tx(r.col, 'name')], [t('qDims'), sizeText(r)]],
      head: [t('qItem'), t('qQty'), t('qAmount') + ' (' + t('egp') + ')'],
      items: quoteRows(q).map(function (x) { return x.map(strip); }),
      totalLabel: t('qTotal'), total: r.quote ? t('onReq') : strip(rng(r.lo, r.hi)), unit: r.quote ? '' : t('egp'),
      totalNote: r.unpriced.length ? '+ ' + r.unpriced.map(function (l) { return tx(l.a, 'name'); }).join(t('sep')) + ' — ' + t('qOnSite') : '',
      notesLabel: t('qNotes'), notes: p.notes, termsLabel: t('qTerms'), terms: [t('qT1'), t('qT2'), t('qT3'), t('qT4')], next: t('qNext')
    };
  }
  function buildQuote(q) {
    var r = q.r, p = q.p, d = quoteData(q);
    var dl = function (rows) { return '<dl>' + rows.map(function (x) { return '<div><dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd></div>'; }).join('') + '</dl>'; };
    return '<header class="q-head"><div class="q-brand"><img src="images/logo-160.png" alt=""><div><b>ARCOVA NIT STUDIO</b><small>FIRST AT THE FINISH LINE</small><div dir="ltr">' + esc(C.brand.phone) + '</div></div></div>' +
      '<div class="q-title"><h2>' + esc(d.title) + '</h2>' + dl(d.meta) + '</div></header>' +
      '<div class="q-grid"><section><h3>' + esc(d.clientLabel) + '</h3>' + dl(d.client) + '</section><section><h3>' + esc(d.projectLabel) + '</h3>' +
        dl(d.project).replace(esc(tx(r.col, 'name')) + '</dd>', (r.col.hex ? '<i class="dot" style="background:' + r.col.hex + '"></i>' : '') + esc(tx(r.col, 'name')) + '</dd>') + '</section></div>' +
      '<table class="q-items"><thead><tr>' + d.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        quoteRows(q).map(function (x) { return '<tr><td>' + esc(x[0]) + (x[1] ? '<small>' + esc(x[1]) + '</small>' : '') + '</td><td>' + esc(x[2]) + '</td><td>' + esc(x[3]) + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<div class="q-total"><span>' + esc(d.totalLabel) + '</span><b>' + esc(r.quote ? d.total : rng(r.lo, r.hi) + ' ' + d.unit) + '</b>' + (d.totalNote ? '<small>' + esc(d.totalNote) + '</small>' : '') + '</div>' +
      (p.notes ? '<section><h3>' + esc(d.notesLabel) + '</h3><p>' + esc(p.notes) + '</p></section>' : '') +
      '<section class="q-terms"><h3>' + esc(d.termsLabel) + '</h3><ol>' + d.terms.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></section>' +
      '<footer class="q-foot">' + esc(d.next) + '</footer>';
  }
  function openQuote() {
    if (!lastQuote) return;
    $('#quoteDoc').innerHTML = buildQuote(lastQuote);
    $('#quoteDoc').dir = lang === 'en' ? 'ltr' : 'rtl';
    $('#qWa').href = waUrl(t('waQuoteIntro') + lastQuote.p.leadId + ': ' + summary(lastQuote.r));
    $('#quoteModal').hidden = false; document.body.classList.add('lock'); $('#qClose').focus();
  }
  function closeQuote() { $('#quoteModal').hidden = true; document.body.classList.remove('lock'); }
  $('#openQuote').addEventListener('click', openQuote);
  $('#qClose').addEventListener('click', closeQuote);
  // PDF: made by the sheet script (proper Arabic) and stored on Drive; otherwise the browser's "Save as PDF"
  $('#qPdf').addEventListener('click', function () {
    track('DownloadQuote', { quote: lastQuote ? lastQuote.p.leadId : '' });
    if (lastQuote && lastQuote.pdfUrl) {
      var a = document.createElement('a'); a.href = lastQuote.pdfUrl; a.target = '_blank'; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
    } else window.print();
  });

  /* ---------- Sheet data: prices + Drive photos ---------- */
  function applyPrices(map) {
    var apply = function (item) {
      var p = map[item.id]; if (!p) return;
      ['min', 'max', 'minTotal', 'fixed', 'perM2', 'factor'].forEach(function (f) { var v = parseFloat(p[f]); if (isFinite(v) && v >= 0) item[f] = v; });
    };
    EST.forEach(function (c) { c.types.forEach(apply); c.options.forEach(apply); });
    C.addOns.forEach(apply);
  }
  function sheetGet(param, key, onData) {
    if (!C.sheetWebhookUrl) return;
    var cached = session.get(key); if (cached) onData(cached);
    fetch(C.sheetWebhookUrl + (C.sheetWebhookUrl.indexOf('?') > -1 ? '&' : '?') + param + '=1')
      .then(function (res) { return res.json(); })
      .then(function (j) { if (j && j.ok && j[param]) { session.set(key, j[param]); onData(j[param]); } })
      .catch(function () { /* keep defaults */ });
  }

  /* ---------- Render + boot ---------- */
  function renderAll() {
    renderTypes(); renderStory(); renderFilters(); renderGallery(); renderWizard(); update(); goStep(st.step); wireWa();
    var social = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['tiktok', 'TikTok']].filter(function (s) { return C.brand[s[0]]; });
    $('#footLinks').innerHTML = social.map(function (s) { return '<a href="' + esc(C.brand[s[0]]) + '" target="_blank" rel="noopener">' + s[1] + '</a>'; }).join('');
    if (lastQuote && !$('#quoteModal').hidden) openQuote();
  }
  var qLang = query.get('lang'), savedLang = local.get('arcova_lang');
  lang = (qLang === 'en' || qLang === 'ar') ? qLang : (savedLang === 'en' || savedLang === 'ar') ? savedLang : (C.defaultLang || 'ar');
  applyStatic(); renderAll();
  if (!qLang && !savedLang) { $('#langGate').hidden = false; document.body.classList.add('lock'); }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { $('#langGate').hidden = true; document.body.classList.remove('lock'); setLang(b.dataset.setLang, true); }); });
  $('#langToggle').addEventListener('click', function () { setLang(lang === 'en' ? 'ar' : 'en', true); });

  sheetGet('prices', 'arcova_prices', function (m) { applyPrices(m); renderAll(); });
  sheetGet('gallery', 'arcova_gallery', function (items) {
    drive = (items || []).filter(function (g) { return g && g.src && catOf(g.cat); });
    renderFilters(); renderGallery();
  });
})();
