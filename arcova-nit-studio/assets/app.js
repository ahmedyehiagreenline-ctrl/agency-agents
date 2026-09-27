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
  var phoneEl = $('.js-phone');
  phoneEl.textContent = C.brand.phone;
  phoneEl.href = 'tel:' + C.brand.phone.replace(/\s/g, '');
  phoneEl.addEventListener('click', function () { track('Contact', { method: 'phone' }); });

  $('#stats').innerHTML = (C.stats || []).filter(function (s) { return s.value; })
    .map(function (s) { return '<li><b>' + esc(s.value) + '</b><span>' + esc(s.label) + '</span></li>'; }).join('');

  var social = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok']]
    .filter(function (p) { return C.brand[p[0]]; })
    .map(function (p) { return '<a href="' + esc(C.brand[p[0]]) + '" target="_blank" rel="noopener">' + p[1] + '</a>'; });
  $('#footLinks').innerHTML = social.join('') + '<a href="#book">احجز معاينة</a>';

  // Services
  $('#servicesList').innerHTML = C.services.map(function (s, i) {
    return '<article class="svc">' +
      '<span class="svc-code">A-0' + (i + 1) + '</span>' +
      '<h3>' + esc(s.name) + '</h3>' +
      '<span class="short">' + esc(s.short) + '</span>' +
      '<p class="desc">' + esc(s.desc) + '</p>' +
      '<div class="from"><small>يبدأ من</small><b>' + fmt(s.min) + '</b><small>ج / ' + esc(s.unit) + '</small></div>' +
      '<a class="go" href="#estimate" data-svc="' + s.id + '">احسب تكلفتك ←</a>' +
      '</article>';
  }).join('');

  // Tiers (pricing section): per-m² start price of each service at that tier
  $('#tiers').innerHTML = C.tiers.map(function (t) {
    var rows = C.services.map(function (s) {
      return '<tr><td>' + esc(s.name) + '</td><td>' + fmt(round500(s.min * t.factor)) + ' +</td></tr>';
    }).join('');
    return '<div class="tier' + (t.factor === 1 ? ' pop' : '') + '">' +
      '<div class="tier-top"><h3>' + esc(t.name) + '</h3>' + (t.factor === 1 ? '<span class="badge">الأكثر طلباً</span>' : '') + '</div>' +
      '<p class="note">' + esc(t.note) + '</p>' +
      '<table><tbody>' + rows + '</tbody></table>' +
      '<p class="hint">ج / م² — توريد وتركيب</p></div>';
  }).join('');

  // Testimonials (only real ones from config)
  if (C.testimonials && C.testimonials.length) {
    $('#reviews').hidden = false;
    $('#reviewsList').innerHTML = C.testimonials.map(function (r) {
      return '<figure class="review"><blockquote>' + esc(r.text) + '</blockquote><figcaption>' + esc(r.name) + (r.place ? ' · ' + esc(r.place) : '') + '</figcaption></figure>';
    }).join('');
  }

  /* ---------- Gallery + lightbox ---------- */
  var CAT = { wood: 'خشب', metal: 'معدن', aluminum: 'ألومنيوم', glass: 'زجاج' };
  var visible = [];
  function renderGallery(cat) {
    visible = C.gallery.filter(function (g) { return cat === 'all' || g.cat === cat; });
    $('#gallery').innerHTML = visible.map(function (g, i) {
      return '<button type="button" class="g-item' + (i % 5 === 0 ? ' wide' : '') + '" data-i="' + i + '">' +
        '<img src="' + esc(g.src) + '" alt="' + esc(g.title) + '" loading="lazy">' +
        '<span class="g-tag">' + (g.placeholder ? 'صورة توضيحية' : esc(CAT[g.cat] || '')) + '</span>' +
        '<span class="g-cap"><b>' + esc(g.title) + '</b>' + (g.place && !g.placeholder ? '<small>' + esc(g.place) + '</small>' : '') + '</span>' +
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
    $('#lbCap').textContent = g.title + (g.place && !g.placeholder ? ' — ' + g.place : '');
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
  var state = { svc: C.services[0].id, len: 5, wid: 4, tier: 'signature', addOns: ['lighting'] };

  $('#estService').innerHTML = C.services.map(function (s) {
    return '<label class="chip"><input type="radio" name="svc" value="' + s.id + '"><span>' + esc(s.name) + '<small>' + esc(s.short) + '</small></span></label>';
  }).join('');
  $('#estTier').innerHTML = C.tiers.map(function (t) {
    return '<label class="chip"><input type="radio" name="tier" value="' + t.id + '"><span>' + esc(t.name) + '<small>' + esc(t.note) + '</small></span></label>';
  }).join('');
  $('#estAddons').innerHTML = C.addOns.map(function (a) {
    var price = a.label ? a.label : a.perM2 ? '+' + fmt(a.perM2) + ' / م²' : '+' + fmt(a.fixed);
    return '<label class="addon"><input type="checkbox" name="addon" value="' + a.id + '"><span>' + esc(a.name) + '</span><b>' + esc(price) + '</b></label>';
  }).join('');
  $('#fService').innerHTML = C.services.map(function (s) { return '<option value="' + esc(s.name) + '">' + esc(s.name) + '</option>'; }).join('') +
    '<option value="أخرى / أكثر من خدمة">أخرى / أكثر من خدمة</option>';

  function clampSize(v) { v = parseFloat(v); if (!isFinite(v)) v = 1; return Math.min(30, Math.max(1, Math.round(v * 2) / 2)); }

  function calc() {
    var s = C.services.find(function (x) { return x.id === state.svc; });
    var t = C.tiers.find(function (x) { return x.id === state.tier; });
    var area = state.len * state.wid;
    var extras = state.addOns.reduce(function (sum, id) {
      var a = C.addOns.find(function (x) { return x.id === id; });
      if (!a) return sum;
      // side glass is priced on the perimeter elevation (perimeter × 2.5 m average height)
      var qty = a.perM2 ? (state.len + state.wid) * 2.5 : 1;
      return sum + (a.perM2 ? a.perM2 * qty : a.fixed);
    }, 0);
    var lo = Math.max(s.minTotal, area * s.min * t.factor) + extras;
    var hi = Math.max(s.minTotal * 1.15, area * s.max * t.factor) + extras;
    return { s: s, t: t, area: area, lo: round500(lo), hi: round500(hi) };
  }

  function drawPlan(len, wid, svcId) {
    var W = 320, H = 240, pad = 44;
    var scale = Math.min((W - pad * 2) / len, (H - pad * 2) / wid);
    var w = len * scale, h = wid * scale, x = (W - w) / 2 + 10, y = (H - h) / 2 - 8;
    var ink = 'rgba(243,245,240,.9)', faint = 'rgba(243,245,240,.35)', accent = '#d29a61';
    var out = '';
    out += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="rgba(243,245,240,.04)" stroke="' + ink + '" stroke-width="1.5"/>';
    // Slats / panels depending on service
    var isGlass = svcId === 'glass-room' || svcId === 'aluminum';
    var gap = isGlass ? Math.max(w / Math.ceil(len / 1.2), 18) : Math.max(scale * 0.25, 6);
    for (var sx = x + gap; sx < x + w - 2; sx += gap) {
      out += '<line x1="' + sx + '" y1="' + y + '" x2="' + sx + '" y2="' + (y + h) + '" stroke="' + faint + '" stroke-width="' + (isGlass ? 1 : 1.2) + '"/>';
    }
    // Posts at corners (and mid-span above 5 m)
    var posts = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]];
    if (len > 5) { posts.push([x + w / 2, y], [x + w / 2, y + h]); }
    posts.forEach(function (p) { out += '<rect x="' + (p[0] - 4) + '" y="' + (p[1] - 4) + '" width="8" height="8" fill="' + accent + '"/>'; });
    // Dimension lines
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
    $('#sumService').textContent = r.s.name;
    $('#sumArea').textContent = state.len + ' × ' + state.wid + ' م = ' + r.area.toFixed(1) + ' م²';
    $('#sumTier').textContent = r.t.name;
    $('#sumPrice').textContent = fmt(r.lo) + ' – ' + fmt(r.hi);
    drawPlan(state.len, state.wid, state.svc);
    var addNames = state.addOns.map(function (id) { var a = C.addOns.find(function (x) { return x.id === id; }); return a ? a.name : ''; }).filter(Boolean);
    estimateText = fmt(r.lo) + ' – ' + fmt(r.hi) + ' ج.م';
    $('#leadEstText').textContent = r.s.name + ' · ' + state.len + '×' + state.wid + ' م · ' + estimateText;
    $('#fService').value = r.s.name;
    state.result = r; state.addNames = addNames;
    store.set('arcova_est', { svc: state.svc, len: state.len, wid: state.wid, tier: state.tier, addOns: state.addOns });
  }

  function syncInputs() {
    $$('input[name="svc"]').forEach(function (i) { i.checked = i.value === state.svc; });
    $$('input[name="tier"]').forEach(function (i) { i.checked = i.value === state.tier; });
    $$('input[name="addon"]').forEach(function (i) { i.checked = state.addOns.indexOf(i.value) > -1; });
    $('#estLen').value = state.len; $('#estWid').value = state.wid;
  }

  var saved = store.get('arcova_est');
  if (saved && C.services.some(function (s) { return s.id === saved.svc; })) Object.assign(state, saved);
  syncInputs(); update();

  $('#estForm').addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'svc') state.svc = t.value;
    if (t.name === 'tier') state.tier = t.value;
    if (t.name === 'addon') state.addOns = $$('input[name="addon"]:checked').map(function (i) { return i.value; });
    if (t.id === 'estLen') { state.len = clampSize(t.value); t.value = state.len; }
    if (t.id === 'estWid') { state.wid = clampSize(t.value); t.value = state.wid; }
    update();
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
  // "احسب تكلفتك" on a service card preselects it
  $('#servicesList').addEventListener('click', function (e) {
    var a = e.target.closest('[data-svc]'); if (!a) return;
    state.svc = a.dataset.svc; syncInputs(); update();
  });

  /* ---------- WhatsApp links ---------- */
  function waUrl(text) { return 'https://wa.me/' + C.brand.whatsapp + '?text=' + encodeURIComponent(text); }
  function estimateSummary() {
    var r = state.result;
    return r.s.name + ' بمقاس ' + state.len + '×' + state.wid + ' م (' + r.area.toFixed(1) + ' م²)، تشطيب ' + r.t.name +
      (state.addNames.length ? '، إضافات: ' + state.addNames.join('، ') : '') + '. التقدير: ' + estimateText + '.';
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
  bindWa('.js-wa', function () { return 'أهلاً Arcova، عايز أستفسر عن مشروع ' + state.result.s.name + '.'; });
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

    var r = state.result;
    var payload = {
      leadId: 'ARC-' + Date.now().toString(36).toUpperCase(),
      name: name,
      phone: phone,
      location: area,
      project: $('#fService').value,
      size: state.len + ' × ' + state.wid + ' م (' + r.area.toFixed(1) + ' م²)',
      estimate: estimateText,
      addOns: state.addNames.join('، '),
      tier: r.t.name,
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
      done(payload);
    }).catch(function (err) {
      // Fallback: never lose the lead — hand it to WhatsApp with all details
      var text = 'أهلاً Arcova، أنا ' + payload.name + '. عايز أحجز معاينة: ' + estimateSummary() +
        ' المنطقة: ' + payload.location + '. موبايل: ' + payload.phone + (payload.notes ? '. ملاحظات: ' + payload.notes : '') + ' [' + payload.leadId + ']';
      if (err && err.message !== 'no-webhook' && window.console) console.warn('Arcova lead webhook failed:', err);
      done(payload, text);
    });
  });

  function done(p, waFallback) {
    track('Lead', { value: state.result.lo, currency: 'EGP', content_name: p.project });
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
