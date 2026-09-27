/* Arcova NIT Studio — landing page logic (no dependencies) */
(function () {
  'use strict';
  var C = window.ARCOVA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };
  var round500 = function (n) { return Math.round(n / 500) * 500; };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var store = {
    get: function (k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }
  };

  /* ---------- Catalog lookups ---------- */
  var CATS = C.catalog;
  var EST_CATS = CATS.filter(function (c) { return c.estimator; });
  var OTHER_CATS = CATS.filter(function (c) { return !c.estimator; });
  var ADDONS = [];
  C.addOnGroups.forEach(function (g) { g.items.forEach(function (a) { ADDONS.push(a); }); });
  var byId = function (list, id) { return list.find(function (x) { return x.id === id; }); };
  var catOf = function (id) { return byId(CATS, id); };
  var isPriced = function (a) { return a.fixed > 0 || a.perM2 > 0; };
  function fromPrice(cat) {
    var mins = cat.types.filter(function (t) { return !t.quote && t.min; }).map(function (t) { return t.min; });
    return mins.length ? Math.min.apply(null, mins) : 0;
  }
  function projectLabel(cat, type) { return cat.name + ' — ' + type.name; }

  /* ---------- Attribution: keep UTM / click IDs for the whole visit ---------- */
  var ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'ttclid'];
  var attribution = (function () {
    var saved = store.get('arcova_attr') || {};
    var q = new URLSearchParams(location.search);
    var fresh = {};
    ATTR_KEYS.forEach(function (k) { if (q.get(k)) fresh[k] = q.get(k); });
    if (Object.keys(fresh).length) { saved = fresh; saved.landing = location.href; store.set('arcova_attr', saved); }
    if (!saved.referrer && document.referrer) { saved.referrer = document.referrer; store.set('arcova_attr', saved); }
    return saved;
  })();

  /* ---------- Tracking pixels ---------- */
  var T = C.tracking || {};
  function loadScript(src) { var s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); }
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

  /* ---------- Static content from config ---------- */
  $('#year').textContent = new Date().getFullYear();
  $('#footTag').textContent = C.brand.tagline || '';
  if (C.brand.logo) {
    var li = $('#logoImg'); li.src = C.brand.logo; li.hidden = false;
    $('.logo-mark').hidden = true; $('.logo-type').hidden = true;
  }
  var phoneEl = $('.js-phone');
  phoneEl.textContent = C.brand.phone;
  phoneEl.href = 'tel:' + C.brand.phone.replace(/\s/g, '');
  phoneEl.addEventListener('click', function () { track('Contact', { method: 'phone' }); });

  $('#stats').innerHTML = (C.stats || []).filter(function (s) { return s.value; })
    .map(function (s) { return '<li><b>' + esc(s.value) + '</b><span>' + esc(s.label) + '</span></li>'; }).join('');

  var social = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['tiktok', 'TikTok']]
    .filter(function (p) { return C.brand[p[0]]; })
    .map(function (p) { return '<a href="' + esc(C.brand[p[0]]) + '" target="_blank" rel="noopener">' + p[1] + '</a>'; });
  $('#footLinks').innerHTML = social.join('') + '<a href="#book">احجز معاينة</a>';

  function typePrice(t) { return t.quote ? 'بعد التوصيف' : 'من ' + fmt(t.min) + ' ج/م²'; }

  function renderServices() {
    $('#servicesList').innerHTML = EST_CATS.map(function (c, i) {
      var from = fromPrice(c);
      return '<article class="svc">' +
        '<div class="svc-top"><span class="svc-code">P-0' + (i + 1) + '</span>' + (c.warranty ? '<span class="badge">' + esc(c.warranty) + '</span>' : '') + '</div>' +
        '<h3>' + esc(c.name) + '</h3>' +
        '<span class="short">' + esc(c.short) + '</span>' +
        '<p class="desc">' + esc(c.desc) + '</p>' +
        '<ul class="svc-types">' + c.types.map(function (t) {
          return '<li><span>' + esc(t.name) + '</span><b>' + esc(t.quote ? 'بعد التوصيف' : fmt(t.min) + ' +') + '</b></li>';
        }).join('') + '</ul>' +
        '<div class="from"><small>يبدأ من</small><b>' + fmt(from) + '</b><small>ج / م²</small></div>' +
        '<a class="go" href="#estimate" data-cat="' + c.id + '">احسب تكلفتك ←</a>' +
        '</article>';
    }).join('');

    $('#extrasList').innerHTML = ADDONS.map(function (a) { return '<li>' + esc(a.name) + '</li>'; }).join('');

    $('#otherList').innerHTML = OTHER_CATS.map(function (c) {
      return '<article class="other">' +
        '<h4>' + esc(c.name) + '</h4><p>' + esc(c.desc) + '</p>' +
        '<a class="go" href="#book" data-project="' + esc(c.name) + '">اطلب عرض سعر ←</a></article>';
    }).join('');
  }

  function renderPriceTables() {
    $('#priceTables').innerHTML = EST_CATS.map(function (c, i) {
      var rows = c.types.map(function (t) {
        return '<tr><td>' + esc(t.name) + '</td><td>' + esc(t.quote ? 'بعد التوصيف' : fmt(t.min) + ' – ' + fmt(t.max)) + '</td></tr>';
      }).join('');
      var opts = c.options.map(function (o) {
        var pct = Math.round((o.factor - 1) * 100);
        return '<li>' + esc(o.name) + (pct > 0 ? ' <b>+' + pct + '%</b>' : '') + '</li>';
      }).join('');
      return '<div class="tier' + (i === 0 ? ' pop' : '') + '">' +
        '<div class="tier-top"><h3>' + esc(c.name) + '</h3>' + (c.warranty ? '<span class="badge">' + esc(c.warranty) + '</span>' : '') + '</div>' +
        '<p class="note">' + esc(c.short) + '</p>' +
        '<table><tbody>' + rows + '</tbody></table>' +
        '<p class="opt-h">' + esc(c.optionsLabel) + '</p><ul class="opts">' + opts + '</ul>' +
        '</div>';
    }).join('');
  }

  // Testimonials (only real ones from config)
  if (C.testimonials && C.testimonials.length) {
    $('#reviews').hidden = false;
    $('#reviewsList').innerHTML = C.testimonials.map(function (r) {
      return '<figure class="review"><blockquote>' + esc(r.text) + '</blockquote><figcaption>' + esc(r.name) + (r.place ? ' · ' + esc(r.place) : '') + '</figcaption></figure>';
    }).join('');
  }

  /* ---------- Gallery + lightbox ---------- */
  var visible = [];
  var galleryCats = CATS.filter(function (c) { return C.gallery.some(function (g) { return g.cat === c.id; }); });
  if (galleryCats.length > 1) {
    $('#filters').innerHTML = '<button type="button" role="tab" aria-selected="true" data-cat="all">الكل</button>' +
      galleryCats.map(function (c) { return '<button type="button" role="tab" aria-selected="false" data-cat="' + c.id + '">' + esc(c.name) + '</button>'; }).join('');
  } else {
    $('#filters').hidden = true;
  }
  function renderGallery(cat) {
    visible = C.gallery.filter(function (g) { return cat === 'all' || g.cat === cat; });
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
      return '<button type="button" class="g-item' + sizeOf(i) + '" data-i="' + i + '">' +
        '<img src="' + esc(g.src) + '" alt="' + esc(g.title) + '" loading="lazy">' +
        '<span class="g-tag' + (g.kind === 'render' ? ' g-render' : '') + '">' + (g.kind === 'render' ? 'تصميم 3D' : esc(c ? c.name : '')) + '</span>' +
        '<span class="g-cap"><b>' + esc(g.title) + '</b>' + (g.place ? '<small>' + esc(g.place) + '</small>' : '') + '</span>' +
        '</button>';
    }).join('');
    $('#galleryEmpty').hidden = visible.length > 0;
  }
  $('#filters').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    $$('#filters button').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
    renderGallery(b.dataset.cat);
  });
  renderGallery('all');

  var lb = $('#lightbox'), lbIdx = 0, lastFocus = null;
  function showLb(i) {
    lbIdx = (i + visible.length) % visible.length;
    var g = visible[lbIdx];
    $('#lbImg').src = g.src; $('#lbImg').alt = g.title;
    $('#lbCap').textContent = g.title + (g.place ? ' — ' + g.place : '') + (g.kind === 'render' ? ' (تصميم 3D)' : '');
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
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') showLb(lbIdx + 1);
    if (e.key === 'ArrowRight') showLb(lbIdx - 1);
  });

  /* ---------- Estimator ---------- */
  var state = { cat: EST_CATS[0].id, type: EST_CATS[0].types[0].id, opt: EST_CATS[0].options[0].id, len: 5, wid: 4, addOns: ['lighting'] };

  $('#estCat').innerHTML = EST_CATS.map(function (c) {
    return '<label class="chip chip-cat"><input type="radio" name="cat" value="' + c.id + '"><span>' + esc(c.name) + '</span></label>';
  }).join('');
  $('#estAddons').innerHTML = C.addOnGroups.map(function (g) {
    return '<div class="addon-group"><p class="addon-h">' + esc(g.name) + '</p><div class="addons">' + g.items.map(function (a) {
      var price = a.perM2 ? '+' + fmt(a.perM2) + ' / م²' : a.fixed ? '+' + fmt(a.fixed) : 'حسب الاختيار';
      return '<label class="addon"><input type="checkbox" name="addon" value="' + a.id + '"><span>' + esc(a.name) + '</span><b data-addon-price="' + a.id + '">' + esc(price) + '</b></label>';
    }).join('') + '</div></div>';
  }).join('');

  function renderLeadOptions() {
    var sel = $('#fService'), cur = sel.value;
    sel.innerHTML = EST_CATS.map(function (c) {
      return '<optgroup label="' + esc(c.name) + '">' + c.types.map(function (t) {
        var v = projectLabel(c, t);
        return '<option value="' + esc(v) + '">' + esc(t.name) + '</option>';
      }).join('') + '</optgroup>';
    }).join('') +
      '<optgroup label="خدمات تانية">' + OTHER_CATS.map(function (c) { return '<option value="' + esc(c.name) + '">' + esc(c.name) + '</option>'; }).join('') +
      '<option value="أكتر من خدمة / أخرى">أكتر من خدمة / أخرى</option></optgroup>';
    if (cur) sel.value = cur;
  }

  function renderTypeChips() {
    var c = catOf(state.cat);
    $('#estType').innerHTML = c.types.map(function (t) {
      return '<label class="chip"><input type="radio" name="type" value="' + t.id + '"><span>' + esc(t.name) + '<small>' + esc(t.note || '') + '</small></span></label>';
    }).join('');
    $('#estOpt').innerHTML = c.options.map(function (o) {
      return '<label class="chip"><input type="radio" name="opt" value="' + o.id + '"><span>' + esc(o.name) + '<small>' + esc(o.note || '') + '</small></span></label>';
    }).join('');
    $('#estOptLabel').textContent = c.optionsLabel;
    $('#sumOptLabel').textContent = c.optionsLabel;
  }

  function clampSize(v) { v = parseFloat(v); if (!isFinite(v)) v = 1; return Math.min(30, Math.max(1, Math.round(v * 2) / 2)); }

  function calc() {
    var c = catOf(state.cat);
    var t = byId(c.types, state.type) || c.types[0];
    var o = byId(c.options, state.opt) || c.options[0];
    var area = state.len * state.wid;
    var picked = state.addOns.map(function (id) { return byId(ADDONS, id); }).filter(Boolean);
    var extras = picked.reduce(function (sum, a) { return sum + (a.perM2 ? a.perM2 * area : a.fixed || 0); }, 0);
    var r = { c: c, t: t, o: o, area: area, quote: !!t.quote, picked: picked,
      unpriced: picked.filter(function (a) { return !isPriced(a); }).map(function (a) { return a.name; }) };
    if (!r.quote) {
      r.lo = round500(Math.max(t.minTotal || 0, area * t.min * o.factor) + extras);
      r.hi = round500(Math.max((t.minTotal || 0) * 1.15, area * t.max * o.factor) + extras);
    }
    return r;
  }

  function drawPlan(len, wid, t) {
    var W = 320, H = 240, pad = 44;
    var scale = Math.min((W - pad * 2) / len, (H - pad * 2) / wid);
    var w = len * scale, h = wid * scale, x = (W - w) / 2 + 10, y = (H - h) / 2 - 8;
    var ink = 'rgba(243,245,240,.9)', faint = 'rgba(243,245,240,.35)', accent = '#d29a61';
    var enclosed = !!t.quote, solid = /solid|sandwich/.test(t.id);
    var out = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + (solid ? 'rgba(243,245,240,.14)' : 'rgba(243,245,240,.04)') + '" stroke="' + ink + '" stroke-width="' + (enclosed ? 3 : 1.5) + '"/>';
    if (!solid) {
      var gap = enclosed ? Math.max(w / Math.ceil(len / 1.2), 18) : Math.max(scale * 0.25, 6);
      for (var sx = x + gap; sx < x + w - 2; sx += gap) {
        out += '<line x1="' + sx + '" y1="' + y + '" x2="' + sx + '" y2="' + (y + h) + '" stroke="' + faint + '" stroke-width="1.1"/>';
      }
    }
    var posts = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]];
    if (len > 5) posts.push([x + w / 2, y], [x + w / 2, y + h]);
    posts.forEach(function (p) { out += '<rect x="' + (p[0] - 4) + '" y="' + (p[1] - 4) + '" width="8" height="8" fill="' + accent + '"/>'; });
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
    out += '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 5) + '" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="15" font-weight="500" fill="' + accent + '">' + (len * wid).toFixed(1) + ' m²</text>';
    $('#planSvg').innerHTML = out;
  }

  var estimateText = '';
  var viewedEstimator = false;
  function update() {
    var r = calc();
    state.result = r;
    $('#sumService').textContent = r.c.name + ' — ' + r.t.name;
    $('#sumArea').textContent = state.len + ' × ' + state.wid + ' م = ' + r.area.toFixed(1) + ' م²';
    $('#sumOpt').textContent = r.o.name;
    $('#sumQuoteRow').hidden = !r.unpriced.length;
    $('#sumQuote').textContent = r.unpriced.join('، ');
    if (r.quote) {
      $('#sumPrice').textContent = 'بعد التوصيف';
      $('#sumPriceNote').textContent = 'احكيلنا تفاصيل المكان وهنبعتلك عرض سعر مفصّل';
      estimateText = 'بعد التوصيف';
    } else {
      $('#sumPrice').textContent = fmt(r.lo) + ' – ' + fmt(r.hi);
      $('#sumPriceNote').textContent = 'جنيه مصري · توريد وتركيب' + (r.unpriced.length ? ' · + بنود حسب الاختيار' : '');
      estimateText = fmt(r.lo) + ' – ' + fmt(r.hi) + ' ج.م' + (r.unpriced.length ? ' + بنود حسب الاختيار' : '');
    }
    $('#estToBook').textContent = r.quote ? 'احكيلنا التفاصيل واحجز معاينة' : 'احجز معاينة بالتقدير ده';
    drawPlan(state.len, state.wid, r.t);
    $('#fService').value = projectLabel(r.c, r.t);
    syncLeadEst();
    store.set('arcova_est', { cat: state.cat, type: state.type, opt: state.opt, len: state.len, wid: state.wid, addOns: state.addOns });
  }

  // The estimate travels with the lead only while the form's project matches the estimator
  function estApplies() { var r = state.result; return !!r && $('#fService').value === projectLabel(r.c, r.t); }
  function syncLeadEst() {
    var r = state.result, on = estApplies();
    $('#leadEst').hidden = !on;
    if (on) $('#leadEstText').textContent = r.t.name + ' · ' + r.o.name + ' · ' + state.len + '×' + state.wid + ' م · ' + estimateText;
  }

  function syncInputs() {
    $$('input[name="cat"]').forEach(function (i) { i.checked = i.value === state.cat; });
    $$('input[name="type"]').forEach(function (i) { i.checked = i.value === state.type; });
    $$('input[name="opt"]').forEach(function (i) { i.checked = i.value === state.opt; });
    $$('input[name="addon"]').forEach(function (i) { i.checked = state.addOns.indexOf(i.value) > -1; });
    $('#estLen').value = state.len; $('#estWid').value = state.wid;
  }

  function setCat(id) {
    var c = catOf(id); if (!c || !c.estimator) return;
    state.cat = id;
    if (!byId(c.types, state.type)) state.type = c.types[0].id;
    if (!byId(c.options, state.opt)) state.opt = c.options[0].id;
    renderTypeChips();
  }

  renderServices(); renderPriceTables(); renderLeadOptions();
  var saved = store.get('arcova_est');
  if (saved && catOf(saved.cat) && catOf(saved.cat).estimator) {
    Object.assign(state, saved);
    state.addOns = (saved.addOns || []).filter(function (id) { return byId(ADDONS, id); });
  }
  setCat(state.cat); syncInputs(); update();

  $('#estForm').addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'cat') { setCat(t.value); }
    if (t.name === 'type') state.type = t.value;
    if (t.name === 'opt') state.opt = t.value;
    if (t.name === 'addon') state.addOns = $$('input[name="addon"]:checked').map(function (i) { return i.value; });
    if (t.id === 'estLen') state.len = clampSize(t.value);
    if (t.id === 'estWid') state.wid = clampSize(t.value);
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
  // Service cards preselect the estimator category, "other services" preselect the form
  $('#servicesList').addEventListener('click', function (e) {
    var a = e.target.closest('[data-cat]'); if (!a) return;
    setCat(a.dataset.cat); syncInputs(); update();
  });
  $('#otherList').addEventListener('click', function (e) {
    var a = e.target.closest('[data-project]'); if (!a) return;
    $('#fService').value = a.dataset.project; syncLeadEst();
  });
  $('#fService').addEventListener('change', syncLeadEst);

  /* ---------- Live prices from the Google Sheet "Prices" tab ---------- */
  function applyPrices(map) {
    var fields = ['min', 'max', 'minTotal', 'fixed', 'perM2', 'factor'];
    var apply = function (item) {
      var p = map[item.id]; if (!p) return;
      fields.forEach(function (f) { var v = parseFloat(p[f]); if (isFinite(v) && v >= 0) item[f] = v; });
    };
    EST_CATS.forEach(function (c) { c.types.forEach(apply); c.options.forEach(apply); });
    ADDONS.forEach(apply);
    renderServices(); renderPriceTables();
    ADDONS.forEach(function (a) {
      var el = $('[data-addon-price="' + a.id + '"]');
      if (el) el.textContent = a.perM2 ? '+' + fmt(a.perM2) + ' / م²' : a.fixed ? '+' + fmt(a.fixed) : 'حسب الاختيار';
    });
    update();
  }
  if (C.sheetWebhookUrl) {
    var cachedPrices = store.get('arcova_prices');
    if (cachedPrices) applyPrices(cachedPrices);
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 6000);
    fetch(C.sheetWebhookUrl + (C.sheetWebhookUrl.indexOf('?') > -1 ? '&' : '?') + 'prices=1', ctrl ? { signal: ctrl.signal } : {})
      .then(function (res) { return res.json(); })
      .then(function (j) { clearTimeout(timer); if (j && j.ok && j.prices) { store.set('arcova_prices', j.prices); applyPrices(j.prices); } })
      .catch(function () { /* keep config prices */ });
  }

  /* ---------- WhatsApp links ---------- */
  function waUrl(text) { return 'https://wa.me/' + C.brand.whatsapp + '?text=' + encodeURIComponent(text); }
  function estimateSummary() {
    var r = state.result;
    var addNames = r.picked.map(function (a) { return a.name; });
    return r.c.name + ' (' + r.t.name + ')، ' + r.o.name + '، مقاس ' + state.len + '×' + state.wid + ' م (' + r.area.toFixed(1) + ' م²)' +
      (addNames.length ? '، إضافات: ' + addNames.join('، ') : '') + '. التقدير: ' + estimateText + '.';
  }
  function bindWa(sel, textFn) {
    $$(sel).forEach(function (a) {
      a.target = '_blank'; a.rel = 'noopener';
      var refresh = function () { a.href = waUrl(textFn()); };
      refresh();
      a.addEventListener('pointerdown', refresh);
      a.addEventListener('focus', refresh);
      a.addEventListener('click', function () { refresh(); track('Contact', { method: 'whatsapp', placement: a.dataset.track || '' }); });
    });
  }
  bindWa('.js-wa', function () { return 'أهلاً Arcova، عايز أستفسر عن ' + state.result.c.name + '.'; });
  bindWa('.js-wa-est', function () { return 'أهلاً Arcova، حسبت تكلفة مشروعي على الموقع: ' + estimateSummary() + ' عايز أحجز معاينة.'; });
  var waThanksText = null; // set when the sheet is unreachable, so the lead goes out on WhatsApp instead
  bindWa('.js-wa-thanks', function () { return waThanksText || 'أهلاً Arcova، لسه باعت طلب معاينة باسم ' + ($('#fName').value || '') + '. دي صور المكان:'; });

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
      msg.textContent = !name ? 'اكتب اسمك.' : !phone ? 'رقم الموبايل غير صحيح. اكتبه كده: 01012345678' : 'اكتب منطقتك عشان نرتب المعاينة.';
      msg.hidden = false;
      (!name ? $('#fName') : !phone ? $('#fPhone') : $('#fLocation')).focus();
      return;
    }

    var r = state.result, withEst = estApplies();
    var payload = {
      leadId: 'ARC-' + Date.now().toString(36).toUpperCase(),
      name: name,
      phone: phone,
      location: area,
      project: $('#fService').value,
      size: withEst ? state.len + ' × ' + state.wid + ' م (' + r.area.toFixed(1) + ' م²)' : '',
      estimate: withEst ? estimateText : '',
      addOns: withEst ? r.picked.map(function (a) { return a.name; }).join('، ') : '',
      material: withEst ? r.o.name : '',
      contactTime: $('#fTime').value,
      notes: $('#fNotes').value.trim(),
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

    submitBtn.disabled = true; submitBtn.textContent = 'جارٍ الإرسال...';

    compressImage($('#fPhoto').files[0]).then(function (img) {
      if (img) { payload.imageName = img.name; payload.imageData = img.data; }
      if (!C.sheetWebhookUrl) throw new Error('no-webhook');
      // text/plain avoids a CORS preflight, which Apps Script cannot answer
      return fetch(C.sheetWebhookUrl, { method: 'POST', body: JSON.stringify(payload), redirect: 'follow' })
        .then(function (res) { return res.json(); })
        .then(function (j) { if (!j.ok) throw new Error(j.error || 'sheet-error'); });
    }).then(function () {
      done(payload, null, withEst);
    }).catch(function (err) {
      // Fallback: never lose the lead — hand it to WhatsApp with all details
      var text = 'أهلاً Arcova، أنا ' + payload.name + '. عايز أحجز معاينة: ' + (withEst ? estimateSummary() : payload.project + '.') +
        ' المنطقة: ' + payload.location + '. موبايل: ' + payload.phone + (payload.notes ? '. ملاحظات: ' + payload.notes : '') + ' [' + payload.leadId + ']';
      if (err && err.message !== 'no-webhook' && window.console) console.warn('Arcova lead webhook failed:', err);
      done(payload, text, withEst);
    });
  });

  function done(p, waFallback, withEst) {
    track('Lead', { value: withEst && state.result.lo ? state.result.lo : 0, currency: 'EGP', content_name: p.project });
    store.set('arcova_lead', { name: p.name, id: p.leadId });
    form.hidden = true;
    $('#thanksName').textContent = p.name.split(' ')[0];
    var t = $('#thanks'); t.hidden = false;
    if (waFallback) {
      var a = $('.js-wa-thanks');
      waThanksText = waFallback;
      a.href = waUrl(waFallback);
      a.textContent = 'أكّد الطلب على واتساب';
      t.querySelector('p:not(.eyebrow)').textContent = 'اضغط الزرار ده عشان طلبك يوصلنا على واتساب بكل التفاصيل.';
    }
    t.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
})();
