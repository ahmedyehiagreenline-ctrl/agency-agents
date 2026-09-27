/* Arcova NIT Studio — landing page logic (no dependencies) */
(function () {
  'use strict';
  var C = window.ARCOVA, I = window.I18N;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };
  var round500 = function (n) { return Math.round(n / 500) * 500; };
  // Number ranges are wrapped in LTR isolates so "40,000 – 60,000" never flips inside Arabic text
  var rng = function (lo, hi) { return '\u2066' + fmt(lo) + ' – ' + fmt(hi) + '\u2069'; };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var session = {
    get: function (k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }
  };
  var local = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }
  };

  /* ---------- Language ---------- */
  var lang = 'ar';
  var t = function (k) { return I.rt[lang][k] || I.rt.ar[k] || k; };
  var sep = function () { return lang === 'en' ? ', ' : '، '; };
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
    $('#langToggle').setAttribute('aria-label', en ? 'التحويل للعربية' : 'Switch to English');
  }
  function setLang(l, remember) {
    lang = l === 'en' ? 'en' : 'ar';
    if (remember) local.set('arcova_lang', lang);
    applyStatic();
    renderAll();
  }

  /* ---------- Catalog lookups ---------- */
  var CATS = C.catalog;
  var EST_CATS = CATS.filter(function (c) { return c.estimator; });
  var OTHER_CATS = CATS.filter(function (c) { return !c.estimator; });
  var ADDONS = [];
  C.addOnGroups.forEach(function (g) { g.items.forEach(function (a) { ADDONS.push(a); }); });
  var byId = function (list, id) { return (list || []).find(function (x) { return x.id === id; }); };
  var catOf = function (id) { return byId(CATS, id); };
  var paletteOf = function (c) { return C.palettes[c.palette] || []; };
  var isPriced = function (a) { return a.fixed > 0 || a.perM2 > 0; };
  function fromPrice(cat) {
    var mins = cat.types.filter(function (x) { return !x.quote && x.min; }).map(function (x) { return x.min; });
    return mins.length ? Math.min.apply(null, mins) : 0;
  }
  // Project labels stay Arabic in the sheet so the team reads one language
  function projectValue(cat, type) { return cat.name + ' — ' + type.name; }
  function projectLabel(cat, type) { return tx(cat, 'name') + ' — ' + tx(type, 'name'); }
  function addonPrice(a) { return a.perM2 ? '+' + fmt(a.perM2) + ' / ' + t('m2') : a.fixed ? '+' + fmt(a.fixed) : t('bySelection'); }

  /* ---------- Attribution: keep UTM / click IDs for the whole visit ---------- */
  var ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'ttclid'];
  var query = new URLSearchParams(location.search);
  var attribution = (function () {
    var saved = session.get('arcova_attr') || {};
    var fresh = {};
    ATTR_KEYS.forEach(function (k) { if (query.get(k)) fresh[k] = query.get(k); });
    if (Object.keys(fresh).length) { saved = fresh; saved.landing = location.href; session.set('arcova_attr', saved); }
    if (!saved.referrer && document.referrer) { saved.referrer = document.referrer; session.set('arcova_attr', saved); }
    return saved;
  })();

  /* ---------- Tracking pixels ---------- */
  var T = C.tracking || {};
  function loadScript(src, onload) { var s = document.createElement('script'); s.async = true; s.src = src; if (onload) { s.onload = function () { onload(null); }; s.onerror = function () { onload(new Error('load')); }; } document.head.appendChild(s); }
  if (T.metaPixelId) {
    /* Standard Meta Pixel bootstrap */
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
      if (window.fbq) {
        var std = { Lead: 1, Contact: 1, ViewContent: 1 };
        std[event] ? fbq('track', event, params) : fbq('trackCustom', event, params);
      }
      if (window.gtag) {
        gtag('event', event === 'Lead' ? 'generate_lead' : event, params);
        if (event === 'Lead' && T.googleAdsId && T.googleAdsLeadLabel) {
          gtag('event', 'conversion', { send_to: T.googleAdsId + '/' + T.googleAdsLeadLabel, value: params.value || 0, currency: 'EGP' });
        }
      }
      if (window.ttq) {
        var tt = { Lead: 'SubmitForm', Contact: 'Contact', ViewContent: 'ViewContent' }[event];
        if (tt) ttq.track(tt, params);
      }
    } catch (e) { /* never block the page on analytics */ }
  }

  /* ---------- Fixed bits ---------- */
  $('#year').textContent = new Date().getFullYear();
  var phoneEl = $('.js-phone');
  phoneEl.textContent = C.brand.phone;
  phoneEl.href = 'tel:' + C.brand.phone.replace(/\s/g, '');
  phoneEl.addEventListener('click', function () { track('Contact', { method: 'phone' }); });

  var ICONS = {
    roof: '<path d="M3 11 12 4l9 7"/><path d="M5 10v9h14v-9"/><path d="M9 19v-5h6v5"/>',
    light: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
    floor: '<path d="M3 9h18M3 15h18M9 3v18M15 3v18"/><rect x="3" y="3" width="18" height="18" rx="1"/>',
    sofa: '<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M2 12a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2z"/><path d="M5 17v2M19 17v2"/>',
    star: '<path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>'
  };
  var icon = function (k) { return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[k] || ICONS.star) + '</svg>'; };

  /* ---------- Sections rendered from config ---------- */
  function renderStatsAndLinks() {
    $('#stats').innerHTML = (C.stats || []).filter(function (s) { return s.value; })
      .map(function (s) { return '<li><b>' + esc(s.value) + '</b><span>' + esc(tx(s, 'label')) + '</span></li>'; }).join('');
    var social = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['tiktok', 'TikTok']]
      .filter(function (p) { return C.brand[p[0]]; })
      .map(function (p) { return '<a href="' + esc(C.brand[p[0]]) + '" target="_blank" rel="noopener">' + p[1] + '</a>'; });
    $('#footLinks').innerHTML = social.join('') + '<a href="#book">' + esc(lang === 'en' ? I.en['cta.book'] : AR.text['cta.book']) + '</a>';
  }

  function renderServices() {
    $('#servicesList').innerHTML = EST_CATS.map(function (c, i) {
      var sw = paletteOf(c).slice(0, 6).map(function (p) { return '<i style="background:' + p.hex + '" title="' + esc(tx(p, 'name')) + '"></i>'; }).join('');
      return '<article class="svc">' +
        '<div class="svc-top"><span class="svc-code">P—0' + (i + 1) + '</span>' + (c.warranty ? '<span class="badge">' + esc(tx(c, 'warranty')) + '</span>' : '') + '</div>' +
        '<h3>' + esc(tx(c, 'name')) + '</h3>' +
        '<span class="short">' + esc(tx(c, 'short')) + '</span>' +
        '<p class="desc">' + esc(tx(c, 'desc')) + '</p>' +
        '<ul class="svc-types">' + c.types.map(function (x) {
          return '<li><span>' + esc(tx(x, 'name')) + '</span><b>' + esc(x.quote ? t('afterSpec') : fmt(x.min) + ' +') + '</b></li>';
        }).join('') + '</ul>' +
        '<div class="svc-sw" aria-hidden="true">' + sw + '</div>' +
        '<div class="from"><small>' + esc(t('startsFrom')) + '</small><b>' + fmt(fromPrice(c)) + '</b><small>' + esc(t('perM2')) + '</small></div>' +
        '<a class="go" href="#estimate" data-cat="' + c.id + '">' + esc(t('calc')) + '</a>' +
        '</article>';
    }).join('');

    $('#otherList').innerHTML = OTHER_CATS.map(function (c) {
      return '<article class="other">' +
        '<h4>' + esc(tx(c, 'name')) + '</h4><p>' + esc(tx(c, 'desc')) + '</p>' +
        '<a class="go" href="#book" data-project="' + esc(c.name) + '">' + esc(t('askQuote')) + '</a></article>';
    }).join('');

    $('#addonCards').innerHTML = C.addOnGroups.map(function (g) {
      return '<article class="addon-card"><span class="addon-ico">' + icon(g.icon) + '</span><h3>' + esc(tx(g, 'name')) + '</h3><ul>' +
        g.items.map(function (a) { return '<li><span>' + esc(tx(a, 'name')) + '</span><b>' + esc(addonPrice(a)) + '</b></li>'; }).join('') +
        '</ul></article>';
    }).join('');
  }

  function renderPriceTables() {
    $('#priceTables').innerHTML = EST_CATS.map(function (c, i) {
      var rows = c.types.map(function (x) {
        return '<tr><td>' + esc(tx(x, 'name')) + '</td><td>' + esc(x.quote ? t('afterSpec') : fmt(x.min) + ' – ' + fmt(x.max)) + '</td></tr>';
      }).join('');
      var opts = c.options.map(function (o) {
        var pct = Math.round((o.factor - 1) * 100);
        return '<li>' + esc(tx(o, 'name')) + (pct > 0 ? ' <b>+' + pct + '%</b>' : '') + '</li>';
      }).join('');
      return '<div class="tier' + (i === 0 ? ' pop' : '') + '">' +
        '<div class="tier-top"><h3>' + esc(tx(c, 'name')) + '</h3>' + (c.warranty ? '<span class="badge">' + esc(tx(c, 'warranty')) + '</span>' : '') + '</div>' +
        '<p class="note">' + esc(tx(c, 'short')) + '</p>' +
        '<table><tbody>' + rows + '</tbody></table>' +
        '<p class="opt-h">' + esc(tx(c, 'optionsLabel')) + '</p><ul class="opts">' + opts + '</ul>' +
        '</div>';
    }).join('');
  }

  function renderReviews() {
    if (!(C.testimonials && C.testimonials.length)) return;
    $('#reviews').hidden = false;
    $('#reviewsList').innerHTML = C.testimonials.map(function (r) {
      return '<figure class="review"><blockquote>' + esc(tx(r, 'text')) + '</blockquote><figcaption>' + esc(tx(r, 'name')) + (r.place ? ' · ' + esc(tx(r, 'place')) : '') + '</figcaption></figure>';
    }).join('');
  }

  /* ---------- Gallery (config photos + Google Drive folder) + lightbox ---------- */
  var PAGE = 9;
  var driveItems = [];
  var galleryCat = 'all', galleryShown = PAGE, visible = [];
  function allPhotos() { return driveItems.concat(C.gallery); }

  function renderFilters() {
    var photos = allPhotos();
    var cats = CATS.filter(function (c) { return photos.some(function (g) { return g.cat === c.id; }); });
    var f = $('#filters');
    f.hidden = cats.length < 2;
    f.innerHTML = '<button type="button" role="tab" data-cat="all">' + esc(t('all')) + '</button>' +
      cats.map(function (c) { return '<button type="button" role="tab" data-cat="' + c.id + '">' + esc(tx(c, 'name')) + '</button>'; }).join('');
    $$('#filters button').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.cat === galleryCat)); });
  }
  function renderGallery() {
    var list = allPhotos().filter(function (g) { return galleryCat === 'all' || g.cat === galleryCat; });
    visible = list.slice(0, galleryShown);
    // First photo is large; the rest run in rows of three, and a short last row stretches to fill
    var n = visible.length, tail = n > 3 ? (n - 3) % 3 : 0;
    var sizeOf = function (i) {
      if (i === 0 && n > 2) return ' wide';
      if (tail === 2 && i >= n - 2) return ' half';
      if (tail === 1 && i === n - 1) return ' full';
      return '';
    };
    $('#gallery').innerHTML = visible.map(function (g, i) {
      var c = catOf(g.cat);
      var title = tx(g, 'title') || (c ? tx(c, 'name') : '');
      return '<button type="button" class="g-item' + sizeOf(i) + '" data-i="' + i + '">' +
        '<img src="' + esc(g.thumb || g.src) + '" alt="' + esc(title) + '" loading="lazy">' +
        '<span class="g-tag' + (g.kind === 'render' ? ' g-render' : '') + '">' + esc(g.kind === 'render' ? t('render') : c ? tx(c, 'name') : '') + '</span>' +
        '<span class="g-cap"><b>' + esc(title) + '</b>' + (g.place ? '<small>' + esc(tx(g, 'place')) + '</small>' : '') + '</span>' +
        '</button>';
    }).join('');
    $('#galleryEmpty').hidden = n > 0;
    $('#galleryMore').hidden = list.length <= galleryShown;
  }
  $('#filters').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    galleryCat = b.dataset.cat; galleryShown = PAGE;
    $$('#filters button').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
    renderGallery();
  });
  $('#galleryMore').addEventListener('click', function () { galleryShown += PAGE; renderGallery(); });

  var lb = $('#lightbox'), lbIdx = 0, lastFocus = null;
  function showLb(i) {
    lbIdx = (i + visible.length) % visible.length;
    var g = visible[lbIdx];
    var c = catOf(g.cat), title = tx(g, 'title') || (c ? tx(c, 'name') : '');
    $('#lbImg').src = g.src; $('#lbImg').alt = title;
    $('#lbCap').textContent = title + (g.place ? ' — ' + tx(g, 'place') : '') + (g.kind === 'render' ? ' (' + t('render') + ')' : '');
  }
  $('#gallery').addEventListener('click', function (e) {
    var b = e.target.closest('.g-item'); if (!b) return;
    lastFocus = b; showLb(+b.dataset.i); lb.hidden = false; $('#lbClose').focus();
    track('ViewContent', { content_name: 'gallery' });
  });
  function closeLb() { lb.hidden = true; if (lastFocus) lastFocus.focus(); }
  $('#lbClose').addEventListener('click', closeLb);
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

  /* ---------- Estimator ---------- */
  var first = EST_CATS[0];
  var state = { cat: first.id, type: first.types[0].id, opt: first.options[0].id, color: paletteOf(first)[0].id, len: 5, wid: 4, addOns: ['lighting'] };

  function renderEstimatorChips() {
    $('#estCat').innerHTML = EST_CATS.map(function (c) {
      return '<label class="chip chip-cat"><input type="radio" name="cat" value="' + c.id + '"><span>' + esc(tx(c, 'name')) + '</span></label>';
    }).join('');
    var c = catOf(state.cat);
    $('#estType').innerHTML = c.types.map(function (x) {
      return '<label class="chip"><input type="radio" name="type" value="' + x.id + '"><span>' + esc(tx(x, 'name')) + '<small>' + esc(tx(x, 'note')) + '</small></span></label>';
    }).join('');
    $('#estOpt').innerHTML = c.options.map(function (o) {
      return '<label class="chip"><input type="radio" name="opt" value="' + o.id + '"><span>' + esc(tx(o, 'name')) + '<small>' + esc(tx(o, 'note')) + '</small></span></label>';
    }).join('');
    $('#estColor').innerHTML = paletteOf(c).map(function (p) {
      return '<label class="sw" title="' + esc(tx(p, 'name')) + '"><input type="radio" name="color" value="' + p.id + '" aria-label="' + esc(tx(p, 'name')) + '"><i style="background:' + p.hex + '"></i><span>' + esc(tx(p, 'name')) + '</span></label>';
    }).join('') + '<label class="sw sw-custom" title="' + esc(t('customColor')) + '"><input type="radio" name="color" value="custom" aria-label="' + esc(t('customColor')) + '"><i></i><span>' + esc(t('customColor')) + '</span></label>';
    $('#estOptLabel').textContent = tx(c, 'optionsLabel');
    $('#sumOptLabel').textContent = tx(c, 'optionsLabel');
    $('#estAddons').innerHTML = C.addOnGroups.map(function (g) {
      return '<div class="addon-group"><p class="addon-h">' + icon(g.icon) + esc(tx(g, 'name')) + '</p><div class="addons">' + g.items.map(function (a) {
        return '<label class="addon"><input type="checkbox" name="addon" value="' + a.id + '"><span>' + esc(tx(a, 'name')) + '</span><b>' + esc(addonPrice(a)) + '</b></label>';
      }).join('') + '</div></div>';
    }).join('');
    syncInputs();
  }

  function renderLeadOptions() {
    var sel = $('#fService'), cur = sel.value;
    sel.innerHTML = EST_CATS.map(function (c) {
      return '<optgroup label="' + esc(tx(c, 'name')) + '">' + c.types.map(function (x) {
        return '<option value="' + esc(projectValue(c, x)) + '">' + esc(tx(x, 'name')) + '</option>';
      }).join('') + '</optgroup>';
    }).join('') +
      '<optgroup label="' + esc(t('other')) + '">' + OTHER_CATS.map(function (c) { return '<option value="' + esc(c.name) + '">' + esc(tx(c, 'name')) + '</option>'; }).join('') +
      '<option value="أكتر من خدمة / أخرى">' + esc(t('otherOpt')) + '</option></optgroup>';
    if (cur) sel.value = cur;
  }

  function clampSize(v) { v = parseFloat(v); if (!isFinite(v)) v = 1; return Math.min(30, Math.max(1, Math.round(v * 2) / 2)); }
  function colorOf(c, id) { return id === 'custom' ? { id: 'custom', name: 'لون حسب الطلب', name_en: 'Custom colour', hex: '' } : byId(paletteOf(c), id) || paletteOf(c)[0]; }

  function calc() {
    var c = catOf(state.cat);
    var ty = byId(c.types, state.type) || c.types[0];
    var o = byId(c.options, state.opt) || c.options[0];
    var col = colorOf(c, state.color);
    var area = state.len * state.wid;
    var picked = state.addOns.map(function (id) { return byId(ADDONS, id); }).filter(Boolean);
    var lines = picked.map(function (a) {
      var amount = a.perM2 ? a.perM2 * area : a.fixed || 0;
      return { a: a, perArea: !!a.perM2, amount: amount, priced: isPriced(a) };
    });
    var extras = lines.reduce(function (s, l) { return s + l.amount; }, 0);
    var r = { c: c, t: ty, o: o, col: col, area: area, quote: !!ty.quote, picked: picked, lines: lines,
      unpriced: lines.filter(function (l) { return !l.priced; }) };
    if (!r.quote) {
      r.baseLo = round500(Math.max(ty.minTotal || 0, area * ty.min * o.factor));
      r.baseHi = round500(Math.max((ty.minTotal || 0) * 1.15, area * ty.max * o.factor));
      r.lo = round500(r.baseLo + extras);
      r.hi = round500(r.baseHi + extras);
    }
    return r;
  }

  function drawPlan(len, wid, ty, hex) {
    var W = 320, H = 240, pad = 44;
    var scale = Math.min((W - pad * 2) / len, (H - pad * 2) / wid);
    var w = len * scale, h = wid * scale, x = (W - w) / 2 + 10, y = (H - h) / 2 - 8;
    var ink = 'rgba(241,235,223,.9)', faint = 'rgba(241,235,223,.3)', gold = '#d8b56d';
    var tone = hex || gold;
    var enclosed = !!ty.quote, solid = /solid/.test(ty.id);
    var out = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + tone + '" fill-opacity="' + (solid ? 0.55 : 0.12) + '" stroke="' + ink + '" stroke-width="' + (enclosed ? 3 : 1.4) + '"/>';
    if (!solid) {
      var gap = enclosed ? Math.max(w / Math.ceil(len / 1.2), 18) : Math.max(scale * 0.25, 6);
      for (var sx = x + gap; sx < x + w - 2; sx += gap) {
        out += '<line x1="' + sx + '" y1="' + y + '" x2="' + sx + '" y2="' + (y + h) + '" stroke="' + tone + '" stroke-opacity=".9" stroke-width="2.2"/>';
      }
    }
    var posts = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]];
    if (len > 5) posts.push([x + w / 2, y], [x + w / 2, y + h]);
    posts.forEach(function (p) { out += '<rect x="' + (p[0] - 5) + '" y="' + (p[1] - 5) + '" width="10" height="10" fill="' + tone + '" stroke="' + ink + '" stroke-width="1"/>'; });
    var dy = y + h + 20, dx = x - 20;
    out += '<g stroke="' + faint + '" stroke-width="1">' +
      '<line x1="' + x + '" y1="' + dy + '" x2="' + (x + w) + '" y2="' + dy + '"/>' +
      '<line x1="' + x + '" y1="' + (dy - 5) + '" x2="' + x + '" y2="' + (dy + 5) + '"/>' +
      '<line x1="' + (x + w) + '" y1="' + (dy - 5) + '" x2="' + (x + w) + '" y2="' + (dy + 5) + '"/>' +
      '<line x1="' + dx + '" y1="' + y + '" x2="' + dx + '" y2="' + (y + h) + '"/>' +
      '<line x1="' + (dx - 5) + '" y1="' + y + '" x2="' + (dx + 5) + '" y2="' + y + '"/>' +
      '<line x1="' + (dx - 5) + '" y1="' + (y + h) + '" x2="' + (dx + 5) + '" y2="' + (y + h) + '"/></g>';
    var font = 'font-family="IBM Plex Mono, monospace" font-size="12" fill="' + ink + '"';
    out += '<text x="' + (x + w / 2) + '" y="' + (dy + 16) + '" text-anchor="middle" ' + font + '>' + len.toFixed(2) + ' m</text>';
    out += '<text x="' + (dx - 8) + '" y="' + (y + h / 2) + '" text-anchor="middle" transform="rotate(-90 ' + (dx - 8) + ' ' + (y + h / 2) + ')" ' + font + '>' + wid.toFixed(2) + ' m</text>';
    out += '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 5) + '" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="15" font-weight="500" fill="' + gold + '" paint-order="stroke" stroke="#14120e" stroke-width="4">' + (len * wid).toFixed(1) + ' m²</text>';
    $('#planSvg').innerHTML = out;
  }

  var estimateText = '';
  var viewedEstimator = false;
  function estimateString(r) {
    if (r.quote) return t('afterSpec');
    return rng(r.lo, r.hi) + ' ' + t('egp') + (r.unpriced.length ? ' +' : '');
  }
  function update() {
    var r = calc();
    state.result = r;
    $('#sumService').textContent = projectLabel(r.c, r.t);
    $('#sumOpt').textContent = tx(r.o, 'name');
    $('#sumColor').innerHTML = (r.col.hex ? '<i class="dot" style="background:' + r.col.hex + '"></i>' : '') + esc(tx(r.col, 'name'));
    $('#estColorName').textContent = '— ' + tx(r.col, 'name');
    $('#sumArea').textContent = state.len + ' × ' + state.wid + ' ' + t('m') + ' = ' + r.area.toFixed(1) + ' ' + t('m2');
    $('#sumAddRow').hidden = !r.picked.length;
    $('#sumAdds').textContent = r.picked.map(function (a) { return tx(a, 'name'); }).join(sep());
    if (r.quote) {
      $('#sumPrice').textContent = t('afterSpec');
      $('#sumPriceNote').textContent = t('quoteNote');
    } else {
      $('#sumPrice').textContent = fmt(r.lo) + ' – ' + fmt(r.hi);
      $('#sumPriceNote').textContent = t('priceNote') + (r.unpriced.length ? t('plusSel') : '');
    }
    estimateText = estimateString(r);
    $('#estToBook').textContent = r.quote ? t('toBookQuote') : t('toBook');
    drawPlan(state.len, state.wid, r.t, r.col.hex);
    $('#fService').value = projectValue(r.c, r.t);
    syncLeadEst();
    session.set('arcova_est', { cat: state.cat, type: state.type, opt: state.opt, color: state.color, len: state.len, wid: state.wid, addOns: state.addOns });
  }

  // The estimate travels with the lead only while the form's project matches the estimator
  function estApplies() { var r = state.result; return !!r && $('#fService').value === projectValue(r.c, r.t); }
  function syncLeadEst() {
    var r = state.result, on = estApplies();
    $('#leadEst').hidden = !on;
    if (on) $('#leadEstText').textContent = tx(r.t, 'name') + ' · ' + tx(r.o, 'name') + ' · ' + tx(r.col, 'name') + ' · ' + state.len + '×' + state.wid + ' ' + t('m') + ' · ' + estimateText;
  }

  function syncInputs() {
    $$('input[name="cat"]').forEach(function (i) { i.checked = i.value === state.cat; });
    $$('input[name="type"]').forEach(function (i) { i.checked = i.value === state.type; });
    $$('input[name="opt"]').forEach(function (i) { i.checked = i.value === state.opt; });
    $$('input[name="color"]').forEach(function (i) { i.checked = i.value === state.color; });
    $$('input[name="addon"]').forEach(function (i) { i.checked = state.addOns.indexOf(i.value) > -1; });
    $('#estLen').value = state.len; $('#estWid').value = state.wid;
  }

  function setCat(id) {
    var c = catOf(id); if (!c || !c.estimator) return;
    state.cat = id;
    if (!byId(c.types, state.type)) state.type = c.types[0].id;
    if (!byId(c.options, state.opt)) state.opt = c.options[0].id;
    if (state.color !== 'custom' && !byId(paletteOf(c), state.color)) state.color = paletteOf(c)[0].id;
    renderEstimatorChips();
  }

  var saved = session.get('arcova_est');
  if (saved && catOf(saved.cat) && catOf(saved.cat).estimator) {
    Object.assign(state, saved);
    state.addOns = (saved.addOns || []).filter(function (id) { return byId(ADDONS, id); });
  }

  $('#estForm').addEventListener('change', function (e) {
    var el = e.target;
    if (el.name === 'cat') setCat(el.value);
    if (el.name === 'type') state.type = el.value;
    if (el.name === 'opt') state.opt = el.value;
    if (el.name === 'color') state.color = el.value;
    if (el.name === 'addon') state.addOns = $$('input[name="addon"]:checked').map(function (i) { return i.value; });
    if (el.id === 'estLen') state.len = clampSize(el.value);
    if (el.id === 'estWid') state.wid = clampSize(el.value);
    syncInputs(); update();
    if (!viewedEstimator) { viewedEstimator = true; track('ViewContent', { content_name: 'estimator' }); }
  });
  $('#estForm').addEventListener('input', function (e) {
    if (e.target.id === 'estLen' || e.target.id === 'estWid') {
      var v = parseFloat(e.target.value);
      if (isFinite(v) && v >= 1 && v <= 30) { state[e.target.id === 'estLen' ? 'len' : 'wid'] = v; update(); }
    }
  });
  $('#estForm').addEventListener('submit', function (e) { e.preventDefault(); });
  $$('[data-step]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.dataset.step;
      state[k] = clampSize(state[k] + parseFloat(b.dataset.d));
      syncInputs(); update();
    });
  });
  $('#servicesList').addEventListener('click', function (e) {
    var a = e.target.closest('[data-cat]'); if (!a) return;
    setCat(a.dataset.cat); update();
  });
  $('#otherList').addEventListener('click', function (e) {
    var a = e.target.closest('[data-project]'); if (!a) return;
    $('#fService').value = a.dataset.project; syncLeadEst();
  });
  $('#fService').addEventListener('change', syncLeadEst);

  function renderAll() {
    renderStatsAndLinks(); renderServices(); renderPriceTables(); renderReviews();
    renderFilters(); renderGallery();
    setCat(state.cat); renderLeadOptions(); update();
    bindWaAll();
  }

  /* ---------- Live data from the Google Sheet: prices + Drive gallery ---------- */
  function applyPrices(map) {
    var fields = ['min', 'max', 'minTotal', 'fixed', 'perM2', 'factor'];
    var apply = function (item) {
      var p = map[item.id]; if (!p) return;
      fields.forEach(function (f) { var v = parseFloat(p[f]); if (isFinite(v) && v >= 0) item[f] = v; });
    };
    EST_CATS.forEach(function (c) { c.types.forEach(apply); c.options.forEach(apply); });
    ADDONS.forEach(apply);
  }
  function sheetGet(param, cacheKey, onData) {
    if (!C.sheetWebhookUrl) return;
    var cached = session.get(cacheKey);
    if (cached) onData(cached);
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
    fetch(C.sheetWebhookUrl + (C.sheetWebhookUrl.indexOf('?') > -1 ? '&' : '?') + param + '=1', ctrl ? { signal: ctrl.signal } : {})
      .then(function (res) { return res.json(); })
      .then(function (j) { clearTimeout(timer); if (j && j.ok && j[param]) { session.set(cacheKey, j[param]); onData(j[param]); } })
      .catch(function () { /* keep what we have */ });
  }

  /* ---------- WhatsApp links ---------- */
  function waUrl(text) { return 'https://wa.me/' + C.brand.whatsapp + '?text=' + encodeURIComponent(text); }
  function estimateSummary() {
    var r = state.result;
    var addNames = r.picked.map(function (a) { return tx(a, 'name'); });
    return [projectLabel(r.c, r.t), tx(r.o, 'name'), tx(r.col, 'name'), t('sizeWord') + ' ' + state.len + '×' + state.wid + ' ' + t('m') + ' (' + r.area.toFixed(1) + ' ' + t('m2') + ')']
      .concat(addNames.length ? [t('addsWord') + ': ' + addNames.join(sep())] : []).join(sep()) + '. ' + t('estWord') + ': ' + estimateText + '.';
  }
  var waThanksText = null; // set when the sheet is unreachable, so the lead goes out on WhatsApp instead
  var waBound = false;
  function bindWa(sel, textFn) {
    $$(sel).forEach(function (a) {
      a.target = '_blank'; a.rel = 'noopener';
      var refresh = function () { a.href = waUrl(textFn()); };
      refresh();
      if (waBound) return;
      a.addEventListener('pointerdown', refresh);
      a.addEventListener('focus', refresh);
      a.addEventListener('click', function () { refresh(); track('Contact', { method: 'whatsapp', placement: a.dataset.track || '' }); });
    });
  }
  function bindWaAll() {
    bindWa('.js-wa', function () { return t('waHello') + tx(state.result.c, 'name') + '.'; });
    bindWa('.js-wa-est', function () { return t('waEst') + estimateSummary() + t('waBook'); });
    bindWa('.js-wa-thanks', function () { return waThanksText || t('waThanks') + ($('#fName').value || '') + t('waPhotos'); });
    waBound = true;
  }

  /* ---------- Lead form ---------- */
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
        var max = 1600, s = Math.min(1, max / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve({ name: file.name.replace(/\.[^.]+$/, '') + '.jpg', data: c.toDataURL('image/jpeg', 0.8).split(',')[1] });
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }

  var form = $('#leadForm'), msg = $('#formMsg'), submitBtn = $('#leadSubmit');
  var lastQuote = null;
  $('#fPhone').addEventListener('blur', function () {
    var ok = !this.value || !!normalizePhone(this.value);
    this.setAttribute('aria-invalid', String(!ok)); $('#phoneErr').hidden = ok;
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.hidden = true;
    if ($('#fWebsite').value) return; // honeypot: bots fill hidden fields
    var name = $('#fName').value.trim(), phone = normalizePhone($('#fPhone').value), area = $('#fLocation').value.trim();
    $('#phoneErr').hidden = !!phone; $('#fPhone').setAttribute('aria-invalid', String(!phone));
    if (!name || !phone || !area) {
      msg.textContent = !name ? t('errName') : !phone ? t('errPhone') : t('errArea');
      msg.hidden = false;
      (!name ? $('#fName') : !phone ? $('#fPhone') : $('#fLocation')).focus();
      return;
    }

    var r = state.result, withEst = estApplies();
    var arName = function (o) { return o ? o.name : ''; };
    var payload = {
      leadId: 'ARC-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
      name: name,
      phone: phone,
      location: area,
      project: $('#fService').value,
      size: withEst ? state.len + ' × ' + state.wid + ' م (' + r.area.toFixed(1) + ' م²)' : '',
      estimate: withEst ? (r.quote ? 'بعد التوصيف' : rng(r.lo, r.hi) + ' ج.م' + (r.unpriced.length ? ' + بنود حسب الاختيار' : '')) : '',
      addOns: withEst ? r.picked.map(arName).join('، ') : '',
      material: withEst ? arName(r.o) : '',
      color: withEst ? arName(r.col) : '',
      contactTime: $('#fTime').selectedOptions[0] ? AR.text[$('#fTime').selectedOptions[0].dataset.i18n] || $('#fTime').value : '',
      notes: $('#fNotes').value.trim(),
      lang: lang,
      utmSource: attribution.utm_source || (attribution.referrer ? 'referral' : 'direct'),
      utmMedium: attribution.utm_medium || '',
      utmCampaign: attribution.utm_campaign || '',
      utmContent: attribution.utm_content || '',
      utmTerm: attribution.utm_term || '',
      clickId: attribution.fbclid || attribution.gclid || attribution.ttclid || '',
      pageUrl: attribution.landing || location.href,
      referrer: attribution.referrer || '',
      userAgent: navigator.userAgent
    };
    lastQuote = { p: payload, r: r, withEst: withEst, len: state.len, wid: state.wid, date: new Date() };
    payload.quote = quoteData(lastQuote);

    submitBtn.disabled = true; submitBtn.textContent = t('sending');

    compressImage($('#fPhoto').files[0]).then(function (img) {
      if (img) { payload.imageName = img.name; payload.imageData = img.data; }
      if (!C.sheetWebhookUrl) throw new Error('no-webhook');
      // text/plain avoids a CORS preflight, which Apps Script cannot answer
      return fetch(C.sheetWebhookUrl, { method: 'POST', body: JSON.stringify(payload), redirect: 'follow' })
        .then(function (res) { return res.json(); })
        .then(function (j) { if (!j.ok) throw new Error(j.error || 'sheet-error'); if (j.quoteUrl) lastQuote.pdfUrl = j.quoteUrl; });
    }).then(function () {
      done(payload, null, withEst);
    }).catch(function (err) {
      // Fallback: never lose the lead — hand it to WhatsApp with all details
      var text = t('waIam') + payload.name + t('waWant') + (withEst ? estimateSummary() : payload.project + '.') +
        t('waArea') + payload.location + t('waPhone') + payload.phone + (payload.notes ? t('waNotes') + payload.notes : '') + ' [' + payload.leadId + ']';
      if (err && err.message !== 'no-webhook' && window.console) console.warn('Arcova lead webhook failed:', err);
      done(payload, text, withEst);
    });
  });

  function done(p, waFallback, withEst) {
    track('Lead', { value: withEst && state.result.lo ? state.result.lo : 0, currency: 'EGP', content_name: p.project });
    form.hidden = true;
    submitBtn.disabled = false; submitBtn.textContent = t('submit');
    $('#thanksName').textContent = p.name.split(' ')[0];
    var th = $('#thanks'); th.hidden = false;
    if (waFallback) {
      var a = $('.js-wa-thanks');
      waThanksText = waFallback;
      a.href = waUrl(waFallback);
      a.textContent = t('fbBtn');
      $('#thanksText').textContent = t('fbText');
    }
    th.scrollIntoView({ behavior: 'smooth', block: 'center' });
    openQuote();
  }

  /* ---------- Quote document ---------- */
  function fmtDate(d) {
    return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'ar-EG-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function buildQuote(q) {
    var r = q.r, p = q.p, en = lang === 'en';
    var valid = new Date(q.date.getTime() + 14 * 864e5);
    var row = function (k, v) { return '<div><dt>' + esc(k) + '</dt><dd>' + v + '</dd></div>'; };
    var items = '';
    var projectText = q.withEst ? esc(projectLabel(r.c, r.t)) : esc(p.project);
    if (q.withEst) {
      items += '<tr><td>' + esc(t('qStructure')) + '<small>' + esc(projectLabel(r.c, r.t)) + ' · ' + esc(tx(r.o, 'name')) + '</small></td><td>' + r.area.toFixed(1) + ' ' + t('m2') + '</td><td>' +
        (r.quote ? esc(t('afterSpec')) : rng(r.baseLo, r.baseHi)) + '</td></tr>';
      r.lines.forEach(function (l) {
        items += '<tr><td>' + esc(tx(l.a, 'name')) + '</td><td>' + (l.perArea ? r.area.toFixed(1) + ' ' + t('m2') : '1') + '</td><td>' + (l.priced ? fmt(l.amount) : '<em>' + esc(t('qOnSite')) + '</em>') + '</td></tr>';
      });
    }
    var total = q.withEst ? (r.quote ? t('afterSpec') : rng(r.lo, r.hi) + ' ' + t('egp')) : t('afterSpec');
    return '' +
      '<header class="q-head">' +
        '<img src="images/logo-512.png" alt="Arcova NIT Studio" width="92" height="92">' +
        '<div class="q-brand"><b>ARCOVA NIT STUDIO</b><span>FIRST AT THE FINISH LINE</span><span dir="ltr">' + esc(C.brand.phone) + '</span></div>' +
        '<div class="q-meta"><h2 id="qTitle">' + esc(t('qTitle')) + '</h2><dl>' +
          row(t('qNo'), '<span dir="ltr">' + esc(p.leadId) + '</span>') + row(t('qDate'), esc(fmtDate(q.date))) + row(t('qValid'), esc(fmtDate(valid))) +
        '</dl></div>' +
      '</header>' +
      '<div class="q-grid">' +
        '<section><h3>' + esc(t('qClient')) + '</h3><dl>' + row(t('qName'), esc(p.name)) + row(t('qPhone'), '<span dir="ltr">' + esc(p.phone) + '</span>') + row(t('qArea'), esc(p.location)) + '</dl></section>' +
        '<section><h3>' + esc(t('qProject')) + '</h3><dl>' + row(t('qType'), projectText) +
          (q.withEst ? row(t('qMat'), esc(tx(r.o, 'name'))) + row(t('qColor'), (r.col.hex ? '<i class="dot" style="background:' + r.col.hex + '"></i>' : '') + esc(tx(r.col, 'name'))) +
            row(t('qDims'), q.len + ' × ' + q.wid + ' ' + t('m') + ' = ' + r.area.toFixed(1) + ' ' + t('m2')) : '') +
        '</dl></section>' +
      '</div>' +
      (items ? '<table class="q-items"><thead><tr><th>' + esc(t('qItem')) + '</th><th>' + esc(t('qQty')) + '</th><th>' + esc(t('qAmount')) + ' (' + esc(t('egp')) + ')</th></tr></thead><tbody>' + items + '</tbody></table>' : '') +
      '<div class="q-total"><span>' + esc(t('qTotal')) + '</span><b>' + esc(total) + '</b>' + (q.withEst && r.unpriced.length ? '<small>+ ' + esc(r.unpriced.map(function (l) { return tx(l.a, 'name'); }).join(sep())) + ' — ' + esc(t('qOnSite')) + '</small>' : '') + '</div>' +
      (p.notes ? '<section class="q-notes"><h3>' + esc(t('qNotes')) + '</h3><p>' + esc(p.notes) + '</p></section>' : '') +
      '<section class="q-terms"><h3>' + esc(t('qTerms')) + '</h3><ol><li>' + esc(t('qT1')) + '</li><li>' + esc(t('qT2')) + '</li><li>' + esc(t('qT3')) + '</li><li>' + esc(t('qT4')) + '</li></ol></section>' +
      '<footer class="q-foot"><p>' + esc(t('qNext')) + '</p><p dir="ltr">' + esc(C.brand.phone) + (C.brand.facebook ? ' · facebook.com/' + esc(C.brand.facebook.split('/').filter(Boolean).pop()) : '') + '</p></footer>';
  }
  // Plain, already-translated data the sheet script lays out as a PDF
  function quoteData(q) {
    var r = q.r, p = q.p, strip = function (x) { return String(x).replace(/[\u2066-\u2069]/g, ''); };
    var valid = new Date(q.date.getTime() + 14 * 864e5);
    var items = [];
    if (q.withEst) {
      items.push([t('qStructure'), projectLabel(r.c, r.t) + ' · ' + tx(r.o, 'name'), r.area.toFixed(1) + ' ' + t('m2'), r.quote ? t('afterSpec') : strip(rng(r.baseLo, r.baseHi))]);
      r.lines.forEach(function (l) {
        items.push([tx(l.a, 'name'), '', l.perArea ? r.area.toFixed(1) + ' ' + t('m2') : '1', l.priced ? fmt(l.amount) : t('qOnSite')]);
      });
    }
    var project = [[t('qType'), q.withEst ? projectLabel(r.c, r.t) : p.project]];
    if (q.withEst) {
      project.push([t('qMat'), tx(r.o, 'name')], [t('qColor'), tx(r.col, 'name')], [t('qDims'), q.len + ' × ' + q.wid + ' ' + t('m') + ' = ' + r.area.toFixed(1) + ' ' + t('m2')]);
    }
    return {
      lang: lang, title: t('qTitle'), phone: C.brand.phone,
      logoUrl: new URL('images/logo-160.png', location.href).href,
      meta: [[t('qNo'), p.leadId], [t('qDate'), fmtDate(q.date)], [t('qValid'), fmtDate(valid)]],
      clientLabel: t('qClient'), client: [[t('qName'), p.name], [t('qPhone'), p.phone], [t('qArea'), p.location]],
      projectLabel: t('qProject'), project: project,
      head: [t('qItem'), t('qQty'), t('qAmount') + ' (' + t('egp') + ')'], items: items,
      totalLabel: t('qTotal'),
      total: q.withEst && !r.quote ? strip(rng(r.lo, r.hi)) : t('afterSpec'),
      unit: q.withEst && !r.quote ? t('egp') : '',
      totalNote: q.withEst && r.unpriced.length ? '+ ' + r.unpriced.map(function (l) { return tx(l.a, 'name'); }).join(sep()) + ' — ' + t('qOnSite') : '',
      notesLabel: t('qNotes'), notes: p.notes,
      termsLabel: t('qTerms'), terms: [t('qT1'), t('qT2'), t('qT3'), t('qT4')],
      next: t('qNext')
    };
  }
  function openQuote() {
    if (!lastQuote) return;
    var doc = $('#quoteDoc');
    doc.innerHTML = buildQuote(lastQuote);
    doc.dir = lang === 'en' ? 'ltr' : 'rtl';
    $('#qWa').href = waUrl(t('waQuote') + lastQuote.p.leadId + ': ' + (lastQuote.withEst ? estimateSummary() : lastQuote.p.project));
    $('#quoteModal').hidden = false;
    document.body.classList.add('no-scroll');
    $('#qClose').focus();
  }
  function closeQuote() { $('#quoteModal').hidden = true; document.body.classList.remove('no-scroll'); }
  $('#openQuote').addEventListener('click', openQuote);
  $('#qClose').addEventListener('click', closeQuote);
  $('#qPrint').addEventListener('click', function () { window.print(); });
  // The PDF is rendered by the Google Sheet script (proper Arabic shaping) and stored on Drive.
  // Without it, the browser's own print dialog ("Save as PDF") is the fallback.
  $('#qPdf').addEventListener('click', function () {
    track('DownloadQuote', { quote: lastQuote ? lastQuote.p.leadId : '' });
    if (lastQuote && lastQuote.pdfUrl) {
      var a = document.createElement('a');
      a.href = lastQuote.pdfUrl; a.target = '_blank'; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
    } else {
      window.print();
    }
  });

  /* ---------- Boot ---------- */
  var qLang = query.get('lang'), savedLang = local.get('arcova_lang');
  lang = (qLang === 'en' || qLang === 'ar') ? qLang : (savedLang === 'en' || savedLang === 'ar') ? savedLang : (C.defaultLang || 'ar');
  applyStatic();
  renderAll();
  if (!qLang && !savedLang) {
    var gate = $('#langGate'); gate.hidden = false;
    gate.querySelector('[data-set-lang="' + lang + '"]').focus();
  }
  $$('[data-set-lang]').forEach(function (b) {
    b.addEventListener('click', function () { $('#langGate').hidden = true; setLang(b.dataset.setLang, true); });
  });
  $('#langToggle').addEventListener('click', function () { setLang(lang === 'en' ? 'ar' : 'en', true); });

  sheetGet('prices', 'arcova_prices', function (map) { applyPrices(map); renderAll(); });
  sheetGet('gallery', 'arcova_gallery', function (items) {
    driveItems = (items || []).filter(function (g) { return g && g.src && catOf(g.cat); });
    renderFilters(); renderGallery();
  });
})();
