/**
 * Arcova NIT Studio — Leads Webhook (v3)
 * Google Apps Script bound to the Arcova Leads spreadsheet.
 *
 * What it does
 *  - doPost: receives a lead from the landing page and appends it to the "Leads" tab.
 *    Columns 1–14 keep the same order as v1, so existing rows stay aligned.
 *  - Saves the client's site photo (optional) into a Drive folder and links it in the row.
 *  - Optional e-mail alert for every new lead.
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
  'Click ID', 'صفحة الدخول', 'Referrer', 'واتساب'
];

const PRICES_SHEET = 'Prices';
const PRICE_FIELDS = ['min', 'max', 'minTotal', 'fixed', 'perM2', 'factor'];
const PRICE_HEADERS = ['id (لا تغيّره)', 'البند', 'سعر المتر من', 'سعر المتر إلى', 'أقل قيمة مشروع', 'سعر ثابت', 'سعر للمتر (إضافات)', 'معامل الخامة'];
// Starting rows for the Prices tab — same ids and starting numbers as config.js.
const PRICE_SEED = [
  ['wood-slats', 'خشب — برجولة سقف شرايح', 2400, 3200, 25000, '', '', ''],
  ['wood-solid', 'خشب — برجولة سقف مصمت', 3000, 4000, 30000, '', '', ''],
  ['wood-awning', 'خشب — تندة', 2200, 3000, 15000, '', '', ''],
  ['swedish', 'خشب — موسكي سويدي', '', '', '', '', '', 1],
  ['pitch-pine', 'خشب — بيتش باين', '', '', '', '', '', 1.2],
  ['metal-design', 'حديد — برجولة بتصميم خاص', 2000, 3000, 22000, '', '', ''],
  ['metal-awning', 'حديد — تندة بسقف شرايح', 1800, 2600, 15000, '', '', ''],
  ['sec-8', 'حديد — قطاع 8×8', '', '', '', '', '', 1],
  ['sec-10', 'حديد — قطاع 10×10', '', '', '', '', '', 1.2],
  ['alu-fixed', 'ألومنيوم — شرائح ثابتة', 4200, 5500, 35000, '', '', ''],
  ['alu-manual', 'ألومنيوم — شرائح متحركة مانيوال', 6000, 7500, 55000, '', '', ''],
  ['alu-auto', 'ألومنيوم — شرائح متحركة أوتوماتيك', 7500, 9500, 70000, '', '', ''],
  ['alu-color', 'ألومنيوم — ألوان سادة', '', '', '', '', '', 1],
  ['alu-wood', 'ألومنيوم — خشمونيوم', '', '', '', '', '', 1.12],
  ['roof-acrylic', 'إضافة — سقف أكريليك', '', '', '', '', 900, ''],
  ['roof-sandwich', 'إضافة — سقف ساندوتش بانل', '', '', '', '', 1100, ''],
  ['roof-tile', 'إضافة — سقف قرميد بلاستيك', '', '', '', '', 1000, ''],
  ['lighting', 'إضافة — إضاءة وكهرباء', '', '', '', 7500, '', ''],
  ['floor', 'إضافة — أرضية سيراميك أو رخام', '', '', '', '', 1200, ''],
  ['ac', 'إضافة — تكييف (فاضي = حسب الاختيار)', '', '', '', '', '', ''],
  ['tv', 'إضافة — شاشة', '', '', '', '', '', ''],
  ['plants', 'إضافة — زرع طبيعي أو صناعي', '', '', '', '', '', ''],
  ['seating', 'إضافة — جلسة خشب', '', '', '', '', '', ''],
  ['table', 'إضافة — ترابيزة أو سفرة', '', '', '', '', '', ''],
  ['chairs', 'إضافة — كراسي', '', '', '', '', '', ''],
  ['full-fitout', 'إضافة — تجهيزات كاملة', '', '', '', '', '', '']
];

function doGet(e) {
  if (e && e.parameter && e.parameter.prices) {
    const cache = CacheService.getScriptCache();
    const hit = cache.get('prices');
    if (hit) return json_({ ok: true, prices: JSON.parse(hit) });
    const prices = readPrices_();
    cache.put('prices', JSON.stringify(prices), 300); // 5 minutes
    return json_({ ok: true, prices: prices });
  }
  return json_({ ok: true, service: 'arcova-leads-webhook', version: 3 });
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
      phone ? 'https://wa.me/2' + phone : ''
    ]);
    lock.releaseLock();

    if (NOTIFY_EMAIL) notify_(data, phone, imageUrl);
    return json_({ ok: true, leadId: clean_(data.leadId) });
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

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  if (!ss.getSheetByName(PRICES_SHEET)) {
    const prices = ss.insertSheet(PRICES_SHEET);
    prices.getRange(1, 1, 1, PRICE_HEADERS.length).setValues([PRICE_HEADERS])
      .setFontWeight('bold').setBackground('#183f33').setFontColor('#ffffff');
    prices.getRange(2, 1, PRICE_SEED.length, PRICE_HEADERS.length).setValues(PRICE_SEED);
    prices.getRange(2, 3, PRICE_SEED.length, 5).setNumberFormat('#,##0');
    prices.setFrozenRows(1);
    prices.setRightToLeft(true);
    prices.setColumnWidth(1, 120);
    prices.setColumnWidth(2, 260);
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
