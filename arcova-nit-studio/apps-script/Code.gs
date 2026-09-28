/**
 * Arcova NIT Studio — Leads Webhook (v4)
 * Google Apps Script bound to the Arcova Leads spreadsheet.
 *
 * What it does
 *  - doPost: receives a lead from the landing page and appends it to the "Leads" tab.
 *    Columns 1–14 keep the same order as v1, so existing rows stay aligned.
 *  - Saves the client's site photo (optional) into a Drive folder and links it in the row.
 *  - Optional e-mail alert for every new lead.
 *  - doGet?gallery=1: lists the photos in the Drive folder "Arcova — معرض الأعمال" for the gallery.
 *  - doGet?prices=1: serves the "Prices" tab so the page shows the prices typed in the sheet.
 *  - setup(): creates headers, status dropdown, the Prices tab and formatting (run once).
 *  - buildAdsAudience(): turns your existing customers sheet into a Meta / Google
 *    Customer Match upload list (normalised Egyptian phones, deduplicated).
 */
const SPREADSHEET_ID = '1Hax_I25EqB1mjpEL1AyPofvTR8bi3c7ZMVX3y4CrdHo';
const SHEET_NAME = 'Leads';
const PHOTOS_FOLDER_NAME = 'Arcova Leads — صور المواقع';
const NOTIFY_EMAIL = '';            // e.g. 'sales@arcova.com' — leave empty to disable
const STATUSES = ['جديد', 'تم التواصل', 'معاينة محجوزة', 'عرض سعر', 'تم التعاقد', 'مؤجل', 'غير مهتم'];

const HEADERS = [
  // v1 columns (same order)
  'التاريخ', 'الاسم', 'الموبايل', 'المنطقة', 'المشروع', 'المقاس', 'التقدير', 'الإضافات',
  'صورة المكان', 'ملاحظات', 'المصدر (utm_source)', 'الحملة (utm_campaign)', 'الحالة', 'متابعة',
  // v2 columns
  'رقم الطلب', 'الخامة / المواصفات', 'وقت التواصل', 'utm_medium', 'utm_content', 'utm_term',
  'Click ID', 'صفحة الدخول', 'Referrer', 'واتساب',
  // v4 columns
  'اللون', 'لغة الصفحة', 'عرض السعر PDF'
];

const PRICES_SHEET = 'Prices';
const PRICE_FIELDS = ['min', 'max', 'minTotal', 'fixed', 'perM2', 'factor'];
const PRICE_HEADERS = ['id (لا تغيّره)', 'البند', 'سعر المتر من', 'سعر المتر إلى', 'أقل قيمة مشروع', 'سعر ثابت', 'سعر للمتر (إضافات)', 'معامل الخامة', 'ملاحظة / اقتراح'];
// Suggested starting prices (EGP, supply + install). Every number is a suggestion to replace with Arcova's real price.
// Rows with an empty id are section titles and are ignored by the page.
const PRICE_SEED = [
  ['', '— برجولات خشب (سعر المتر المربع) —', '', '', '', '', '', '', ''],
  ['wood-slats', 'خشب — سقف شرايح', 2400, 3200, 25000, '', '', '', 'الأكثر طلباً'],
  ['wood-solid', 'خشب — سقف مصمت', 3000, 4000, 30000, '', '', '', ''],
  ['wood-awning', 'خشب — تندة', 2200, 3000, 15000, '', '', '', 'على الحيطة'],
  ['wood-room', 'خشب — غرفة مقفلة بالكامل', '', '', '', '', '', '', 'سيبها فاضية = "بعد التوصيف"، أو اكتب سعر المتر'],
  ['swedish', 'خامة: موسكي سويدي', '', '', '', '', '', 1, '1 = السعر الأساسي'],
  ['pitch-pine', 'خامة: بيتش باين', '', '', '', '', '', 1.2, '1.2 = أغلى 20%'],
  ['', '— برجولات حديد —', '', '', '', '', '', '', ''],
  ['metal-design', 'حديد — بتصميم خاص', 2000, 3000, 22000, '', '', '', ''],
  ['metal-awning', 'حديد — تندة بسقف شرايح', 1800, 2600, 15000, '', '', '', ''],
  ['metal-glass-room', 'حديد — غرفة بتقفيلات زجاج', '', '', '', '', '', '', 'فاضي = "بعد التوصيف"'],
  ['sec-8', 'قطاع 8×8 سم', '', '', '', '', '', 1, ''],
  ['sec-10', 'قطاع 10×10 سم', '', '', '', '', '', 1.2, ''],
  ['', '— برجولات ألومنيوم —', '', '', '', '', '', '', ''],
  ['alu-fixed', 'ألومنيوم — شرائح ثابتة', 4200, 5500, 35000, '', '', '', ''],
  ['alu-manual', 'ألومنيوم — متحركة مانيوال', 6000, 7500, 55000, '', '', '', ''],
  ['alu-auto', 'ألومنيوم — متحركة أوتوماتيك', 7500, 9500, 70000, '', '', '', 'شامل الموتور والريموت'],
  ['alu-enclosed', 'ألومنيوم — مقفلة بالكامل', '', '', '', '', '', '', 'فاضي = "بعد التوصيف"'],
  ['alu-std', 'قطاع ألومنيوم تقيل', '', '', '', '', '', 1, ''],
  ['alu-xl', 'قطاع ألومنيوم تقيل جداً', '', '', '', '', '', 1.15, ''],
  ['', '— الإضافات —', '', '', '', '', '', '', ''],
  ['lighting', 'إضاءة وكهرباء', '', '', '', 7500, '', '', 'سعر ثابت'],
  ['roof-acrylic', 'سقف أكريليك', '', '', '', '', 900, '', 'بيتضرب في المساحة'],
  ['roof-sandwich', 'سقف ساندوتش بانل', '', '', '', '', 1100, '', 'بيتضرب في المساحة'],
  ['roof-tile', 'سقف قرميد', '', '', '', '', 1000, '', 'بيتضرب في المساحة'],
  ['floor', 'أرضية سيراميك أو رخام', '', '', '', '', 1200, '', 'بيتضرب في المساحة'],
  ['plants', 'زرع', '', '', '', '', '', '', 'فاضي = "حسب الاختيار"'],
  ['seating', 'جلسة خشب', '', '', '', '', '', '', 'فاضي = "حسب الاختيار"'],
  ['table', 'ترابيزة أو سفرة', '', '', '', '', '', '', 'فاضي = "حسب الاختيار"'],
  ['ac', 'تكييف', '', '', '', '', '', '', 'فاضي = "حسب الاختيار"'],
  ['tv', 'شاشة', '', '', '', '', '', '', 'فاضي = "حسب الاختيار"'],
  ['full-fitout', 'تجهيز كامل', '', '', '', '', '', '', 'فاضي = "حسب الاختيار"']
];

function doGet(e) {
  if (e && e.parameter && e.parameter.gallery) {
    const cache = CacheService.getScriptCache();
    const hit = cache.get('gallery');
    if (hit) return json_({ ok: true, gallery: JSON.parse(hit) });
    const items = readGallery_();
    try { cache.put('gallery', JSON.stringify(items), 600); } catch (ignored) {} // 10 minutes (skipped if > 100KB)
    return json_({ ok: true, gallery: items });
  }
  if (e && e.parameter && e.parameter.prices) {
    const cache = CacheService.getScriptCache();
    const hit = cache.get('prices');
    if (hit) return json_({ ok: true, prices: JSON.parse(hit) });
    const prices = readPrices_();
    cache.put('prices', JSON.stringify(prices), 300); // 5 minutes
    return json_({ ok: true, prices: prices });
  }
  return json_({ ok: true, service: 'arcova-leads-webhook', version: 4 });
}

/** Reads the Prices tab into { id: { min, max, ... } }, skipping empty cells. */
function readPrices_() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(PRICES_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return {};
  const out = {};
  sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues().forEach(function (r) {
    const id = String(r[0]).trim();
    if (!id) return;
    const item = {};
    PRICE_FIELDS.forEach(function (f, i) {
      const v = r[i + 2];
      if (v !== '' && v !== null && !isNaN(Number(v))) item[f] = Number(v);
    });
    out[id] = item;
  });
  return out;
}

/* ---------------- Gallery from Google Drive ----------------
 * Folder "Arcova — معرض الأعمال" with one sub-folder per category, named "<id> - <name>".
 * Drop photos in the right sub-folder and they appear on the page (newest first).
 * File name = caption:  "برجولة خشب سقف شرايح | الشيخ زايد.jpg"  → title | place
 * Put "3D" anywhere in the name to mark it as a 3D design.
 */
const GALLERY_FOLDER_NAME = 'Arcova — معرض الأعمال';
const GALLERY_CATEGORIES = [
  ['wood', 'برجولات خشب'], ['metal', 'برجولات حديد'], ['alu', 'برجولات ألومنيوم'],
  ['glass', 'أعمال الزجاج'], ['aluminum', 'أعمال الألومنيوم'], ['finishing', 'التشطيبات العامة'], ['cladding', 'أعمال الكلادينج']
];

function getGalleryFolder_() {
  const it = DriveApp.getFoldersByName(GALLERY_FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(GALLERY_FOLDER_NAME);
}

function readGallery_() {
  const root = getGalleryFolder_();
  const items = [];
  const subs = root.getFolders();
  while (subs.hasNext()) {
    const folder = subs.next();
    const cat = String(folder.getName()).split(' - ')[0].trim();
    const files = folder.getFiles();
    while (files.hasNext()) {
      const f = files.next();
      if (String(f.getMimeType()).indexOf('image/') !== 0) continue;
      if (f.getSharingAccess() !== DriveApp.Access.ANYONE_WITH_LINK) {
        try { f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (err) { continue; }
      }
      const base = String(f.getName()).replace(/\.[^.]+$/, '');
      const render = /(^|[^a-z])3d([^a-z]|$)/i.test(base);
      const parts = base.replace(/\b3d\b/ig, '').replace(/[_]+/g, ' ').split('|');
      const title = parts[0].replace(/\s+/g, ' ').replace(/^[\s\-–]+|[\s\-–]+$/g, '');
      // Camera-style names (IMG 2034, WhatsApp Image…) get no caption; the page shows the category instead
      const plain = /^(img|dsc|pxl|photo|whatsapp|screenshot|image)|^[\d\s-]+$/i.test(title) ? '' : title;
      items.push({
        id: f.getId(),
        cat: cat,
        title: plain,
        place: parts[1] ? parts[1].trim() : '',
        kind: render ? 'render' : '',
        src: 'https://lh3.googleusercontent.com/d/' + f.getId() + '=w1800',
        thumb: 'https://lh3.googleusercontent.com/d/' + f.getId() + '=w900',
        t: f.getDateCreated().getTime()
      });
    }
  }
  items.sort(function (a, b) { return b.t - a.t; });
  return items;
}

/** Clears the gallery cache — run after adding photos to show them immediately. */
function refreshGallery() {
  CacheService.getScriptCache().remove('gallery');
}

/** Clears the 5-minute price cache — run after editing prices to make them live immediately. */
function refreshPrices() {
  CacheService.getScriptCache().remove('prices');
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(raw);
    if (!data.name || !data.phone) throw new Error('name and phone are required');
    if (data.website) return json_({ ok: true }); // honeypot

    const sheet = getLeadsSheet_();
    const phone = normalizeEgyptPhone_(data.phone) || clean_(data.phone);
    const imageUrl = data.imageData ? savePhoto_(data) : clean_(data.imageUrl);
    const quoteUrl = data.quote ? buildQuotePdf_(data) : '';

    lock.waitLock(20000);
    sheet.appendRow([
      new Date(),
      clean_(data.name),
      "'" + phone,                 // keep the leading zero
      clean_(data.location),
      clean_(data.project),
      clean_(data.size),
      clean_(data.estimate),
      clean_(data.addOns),
      imageUrl,
      clean_(data.notes),
      clean_(data.utmSource),
      clean_(data.utmCampaign),
      'جديد',
      '',
      clean_(data.leadId),
      clean_(data.material || data.tier),
      clean_(data.contactTime),
      clean_(data.utmMedium),
      clean_(data.utmContent),
      clean_(data.utmTerm),
      clean_(data.clickId),
      clean_(data.pageUrl),
      clean_(data.referrer),
      phone ? 'https://wa.me/2' + phone : '',
      clean_(data.color),
      clean_(data.lang) === 'en' ? 'English' : 'عربي',
      quoteUrl
    ]);
    lock.releaseLock();

    if (NOTIFY_EMAIL) notify_(data, phone, imageUrl);
    return json_({ ok: true, leadId: clean_(data.leadId), quoteUrl: quoteUrl });
  } catch (error) {
    try { lock.releaseLock(); } catch (ignored) {}
    return json_({ ok: false, error: String(error.message || error) });
  }
}

/** Run once from the Apps Script editor: headers, status dropdown, frozen row, widths. */
function setup() {
  const sheet = getLeadsSheet_();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    .setFontWeight('bold').setBackground('#183f33').setFontColor('#ffffff');
  sheet.setFrozenRows(1);
  sheet.setRightToLeft(true);
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).setAllowInvalid(true).build();
  sheet.getRange(2, 13, sheet.getMaxRows() - 1, 1).setDataValidation(rule);
  sheet.getRange(2, 1, sheet.getMaxRows() - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm');
  sheet.setColumnWidths(1, HEADERS.length, 140);
  getPhotosFolder_();

  const gallery = getGalleryFolder_();
  GALLERY_CATEGORIES.forEach(function (c) {
    const name = c[0] + ' - ' + c[1];
    if (!gallery.getFoldersByName(name).hasNext()) gallery.createFolder(name);
  });

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  if (!ss.getSheetByName(PRICES_SHEET)) {
    const prices = ss.insertSheet(PRICES_SHEET);
    prices.getRange(1, 1, 1, PRICE_HEADERS.length).setValues([PRICE_HEADERS])
      .setFontWeight('bold').setBackground('#183f33').setFontColor('#ffffff');
    prices.getRange(2, 1, PRICE_SEED.length, PRICE_HEADERS.length).setValues(PRICE_SEED);
    prices.getRange(2, 3, PRICE_SEED.length, 5).setNumberFormat('#,##0');
    prices.getRange(2, 3, PRICE_SEED.length, 6).setBackground('#fff8e6'); // cells to edit
    PRICE_SEED.forEach(function (r, i) {
      if (!r[0]) prices.getRange(i + 2, 1, 1, PRICE_HEADERS.length).setFontWeight('bold').setBackground('#efe7d8');
    });
    prices.setFrozenRows(1);
    prices.setRightToLeft(true);
    prices.setColumnWidth(1, 120);
    prices.setColumnWidth(2, 260);
    prices.setColumnWidth(9, 320);
  }
}

/**
 * Build a Custom Audience list from an existing customers tab.
 * 1. Put the tab name of your customers sheet in SOURCE_SHEET (same spreadsheet),
 *    or paste it as a new tab called "Customers".
 * 2. Run buildAdsAudience from the editor.
 * 3. File → Download → CSV on the new "Ads_Audience" tab and upload it to
 *    Meta Ads Manager → Audiences → Custom Audience → Customer list
 *    (and/or Google Ads → Audience manager → Customer list).
 * Column headers are detected by name (phone / موبايل / رقم, name / اسم, city / منطقة).
 */
function buildAdsAudience(sourceSheetName) {
  const SOURCE_SHEET = sourceSheetName || 'Customers';
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const src = ss.getSheetByName(SOURCE_SHEET);
  if (!src) throw new Error('Tab "' + SOURCE_SHEET + '" not found');
  const values = src.getDataRange().getDisplayValues();
  const head = values[0].map(function (h) { return String(h).toLowerCase(); });
  const find = function (words) {
    return head.findIndex(function (h) { return words.some(function (w) { return h.indexOf(w) > -1; }); });
  };
  const iPhone = find(['phone', 'mobile', 'موبايل', 'هاتف', 'رقم', 'تليفون', 'واتس']);
  const iName = find(['name', 'اسم']);
  const iCity = find(['city', 'area', 'منطقة', 'مدينة', 'محافظة', 'العنوان']);
  if (iPhone < 0) throw new Error('No phone column found in "' + SOURCE_SHEET + '"');

  const seen = {};
  const rows = [['phone', 'fn', 'ln', 'ct', 'country']];
  let skipped = 0;
  values.slice(1).forEach(function (r) {
    const p = normalizeEgyptPhone_(r[iPhone]);
    if (!p || seen[p]) { skipped++; return; }
    seen[p] = true;
    const parts = iName > -1 ? String(r[iName]).trim().split(/\s+/) : [];
    rows.push(['+2' + p, parts[0] || '', parts.slice(1).join(' '), iCity > -1 ? String(r[iCity]).trim() : '', 'EG']);
  });

  let out = ss.getSheetByName('Ads_Audience');
  if (out) out.clear(); else out = ss.insertSheet('Ads_Audience');
  out.getRange(1, 1, rows.length, rows[0].length).setNumberFormat('@').setValues(rows);
  Logger.log('Audience rows: ' + (rows.length - 1) + ' · skipped (invalid/duplicate): ' + skipped);
  return rows.length - 1;
}

/* ---------------- Quote PDF ----------------
 * The page sends the quote already translated (Arabic or English). This lays it out with
 * simple tables (what Google's HTML→PDF converter supports), saves it in the Drive folder
 * "Arcova — عروض الأسعار" and returns a view link. Any failure returns '' and the page
 * falls back to the browser's "Save as PDF".
 */
const QUOTES_FOLDER_NAME = 'Arcova — عروض الأسعار';

function buildQuotePdf_(data) {
  try {
    const q = data.quote;
    const rtl = q.lang !== 'en';
    const dir = rtl ? 'rtl' : 'ltr', start = rtl ? 'right' : 'left', end = rtl ? 'left' : 'right';
    const e = function (v) { return clean_(v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    const pairs = function (rows) {
      return (rows || []).map(function (r) {
        return '<tr><td style="color:#6d6555;padding:3px 0;">' + e(r[0]) + '</td><td style="font-weight:bold;text-align:' + end + ';padding:3px 0;">' + e(r[1]) + '</td></tr>';
      }).join('');
    };
    let logo = '';
    try {
      if (/^https:\/\//.test(clean_(q.logoUrl))) {
        const res = UrlFetchApp.fetch(q.logoUrl, { muteHttpExceptions: true });
        if (res.getResponseCode() === 200) logo = '<img src="data:image/png;base64,' + Utilities.base64Encode(res.getContent()) + '" width="84" height="84">';
      }
    } catch (ignored) {}
    const items = (q.items || []).map(function (it) {
      return '<tr><td style="padding:8px;border-bottom:1px solid #ddd3c1;">' + e(it[0]) + (it[1] ? '<br><span style="color:#6d6555;font-size:10px;">' + e(it[1]) + '</span>' : '') + '</td>' +
        '<td style="padding:8px;border-bottom:1px solid #ddd3c1;white-space:nowrap;">' + e(it[2]) + '</td>' +
        '<td dir="ltr" style="padding:8px;border-bottom:1px solid #ddd3c1;text-align:' + end + ';white-space:nowrap;">' + e(it[3]) + '</td></tr>';
    }).join('');
    const html =
      '<html dir="' + dir + '"><head><meta charset="utf-8"><style>' +
      'body{font-family:Arial,Tahoma,sans-serif;font-size:12px;color:#1d1a14;direction:' + dir + ';margin:0;}' +
      'table{border-collapse:collapse;width:100%;} td,th{text-align:' + start + ';vertical-align:top;}' +
      'h1{font-size:20px;margin:0 0 6px;} h3{font-size:13px;color:#8f6b33;margin:18px 0 6px;}' +
      '</style></head><body>' +
      '<div style="border-top:6px solid #c9a45c;padding:28px 34px;">' +
      '<table><tr>' +
        '<td style="width:96px;">' + logo + '</td>' +
        '<td><div style="font-size:15px;font-weight:bold;letter-spacing:3px;" dir="ltr">ARCOVA NIT STUDIO</div>' +
          '<div style="font-size:9px;letter-spacing:3px;color:#8f6b33;" dir="ltr">FIRST AT THE FINISH LINE</div>' +
          '<div style="color:#6d6555;" dir="ltr">' + e(q.phone) + '</div></td>' +
        '<td style="width:44%;"><h1>' + e(q.title) + '</h1><table>' + pairs(q.meta) + '</table></td>' +
      '</tr></table>' +
      '<hr style="border:0;border-top:1px solid #ddd3c1;margin:18px 0;">' +
      '<table><tr>' +
        '<td style="width:48%;"><h3>' + e(q.clientLabel) + '</h3><table>' + pairs(q.client) + '</table></td><td style="width:4%;"></td>' +
        '<td style="width:48%;"><h3>' + e(q.projectLabel) + '</h3><table>' + pairs(q.project) + '</table></td>' +
      '</tr></table>' +
      (items ? '<table style="margin-top:18px;"><tr style="background:#efe7d8;color:#6d6555;">' +
        '<th style="padding:8px;">' + e(q.head[0]) + '</th><th style="padding:8px;">' + e(q.head[1]) + '</th><th style="padding:8px;text-align:' + end + ';">' + e(q.head[2]) + '</th></tr>' + items + '</table>' : '') +
      // The HTML→PDF converter ignores table backgrounds, so the total uses borders and dark text
      '<table style="margin-top:18px;border-top:3px solid #c9a45c;border-bottom:1px solid #ddd3c1;"><tr>' +
        '<td style="padding:14px 4px;font-weight:bold;font-size:14px;color:#1d1a14;">' + e(q.totalLabel) + (q.totalNote ? '<br><span style="font-size:10px;font-weight:normal;color:#6d6555;">' + e(q.totalNote) + '</span>' : '') + '</td>' +
        '<td style="padding:14px 4px;text-align:' + end + ';font-size:20px;font-weight:bold;color:#1d1a14;white-space:nowrap;"><span dir="ltr">' + e(q.total) + '</span> ' + e(q.unit) + '</td>' +
      '</tr></table>' +
      (q.notes ? '<h3>' + e(q.notesLabel) + '</h3><div>' + e(q.notes) + '</div>' : '') +
      '<h3>' + e(q.termsLabel) + '</h3><ol style="color:#6d6555;margin:0;padding-' + start + ':18px;">' +
        (q.terms || []).map(function (x) { return '<li>' + e(x) + '</li>'; }).join('') + '</ol>' +
      '<hr style="border:0;border-top:1px solid #ddd3c1;margin:18px 0 10px;">' +
      '<div style="font-weight:bold;">' + e(q.next) + '</div>' +
      '</div></body></html>';

    const name = clean_(data.leadId) + ' - ' + clean_(data.name) + '.pdf';
    const pdf = Utilities.newBlob(html, 'text/html', 'quote.html').getAs('application/pdf').setName(name);
    const it = DriveApp.getFoldersByName(QUOTES_FOLDER_NAME);
    const folder = it.hasNext() ? it.next() : DriveApp.createFolder(QUOTES_FOLDER_NAME);
    const file = folder.createFile(pdf);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    return '';
  }
}

/* ---------------- helpers ---------------- */

function getLeadsSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  return sheet;
}

function getPhotosFolder_() {
  const it = DriveApp.getFoldersByName(PHOTOS_FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(PHOTOS_FOLDER_NAME);
}

function savePhoto_(data) {
  try {
    const bytes = Utilities.base64Decode(data.imageData);
    if (bytes.length > 8 * 1024 * 1024) return 'الصورة أكبر من 8MB';
    const name = [clean_(data.leadId), clean_(data.name), clean_(data.imageName) || 'site.jpg'].filter(String).join(' - ');
    const file = getPhotosFolder_().createFile(Utilities.newBlob(bytes, 'image/jpeg', name));
    return file.getUrl();
  } catch (err) {
    return 'تعذر حفظ الصورة: ' + err.message;
  }
}

/** Returns 01XXXXXXXXX for valid Egyptian mobiles, otherwise ''. Handles Arabic digits, +20, 0020. */
function normalizeEgyptPhone_(value) {
  let d = String(value || '')
    .replace(/[٠-٩]/g, function (c) { return String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)); })
    .replace(/\D/g, '');
  if (d.indexOf('0020') === 0) d = d.slice(4);
  if (d.indexOf('20') === 0 && d.length === 12) d = d.slice(2);
  if (d.length === 10 && d.charAt(0) === '1') d = '0' + d;
  return /^01[0125]\d{8}$/.test(d) ? d : '';
}

function notify_(data, phone, imageUrl) {
  const lines = [
    'طلب معاينة جديد — ' + clean_(data.leadId),
    'الاسم: ' + clean_(data.name),
    'الموبايل: ' + phone,
    'المنطقة: ' + clean_(data.location),
    'المشروع: ' + clean_(data.project) + ' · ' + clean_(data.size) + ' · ' + clean_(data.material || data.tier),
    'التقدير: ' + clean_(data.estimate),
    'الإضافات: ' + clean_(data.addOns),
    'وقت التواصل: ' + clean_(data.contactTime),
    'ملاحظات: ' + clean_(data.notes),
    'الصورة: ' + (imageUrl || '—'),
    'المصدر: ' + clean_(data.utmSource) + ' / ' + clean_(data.utmCampaign),
    phone ? 'واتساب: https://wa.me/2' + phone : ''
  ];
  MailApp.sendEmail(NOTIFY_EMAIL, 'Arcova — طلب جديد من ' + clean_(data.name), lines.join('\n'));
}

function clean_(value) {
  return value === undefined || value === null ? '' : String(value).trim();
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
