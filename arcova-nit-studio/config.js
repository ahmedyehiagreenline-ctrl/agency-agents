/**
 * Arcova NIT Studio — إعدادات صفحة الهبوط
 * ----------------------------------------------------------------
 * كل حاجة ممكن تتغير من غير ما تلمس التصميم موجودة هنا:
 * رابط الشيت، رقم الواتساب، أكواد البيكسل، الأسعار، صور الشغل.
 */
window.ARCOVA = {
  brand: {
    name: 'Arcova NIT Studio',
    city: 'القاهرة الكبرى والساحل',
    phone: '+20 15 53955523',
    whatsapp: '201553955523',          // بدون + وبدون مسافات
    instagram: '',                      // مثال: https://instagram.com/arcova.nit
    facebook: '',                       // مثال: https://facebook.com/arcova.nit
    tiktok: ''
  },

  /**
   * رابط Google Apps Script بعد النشر (Deploy → Web app).
   * شكله: https://script.google.com/macros/s/XXXXXXXX/exec
   * لو فاضي، الطلب يتحول لواتساب تلقائياً عشان مفيش عميل يضيع.
   */
  sheetWebhookUrl: '',

  /** أكواد التتبع للحملات — سيبها فاضية لو مش مستخدمها */
  tracking: {
    metaPixelId: '',      // Meta (Facebook / Instagram) Pixel ID
    ga4Id: '',            // Google Analytics 4 — G-XXXXXXX
    googleAdsId: '',      // Google Ads — AW-XXXXXXX
    googleAdsLeadLabel: '', // Conversion label لتحويل "طلب معاينة"
    tiktokPixelId: ''
  },

  /**
   * أرقام الثقة في الهيرو. اكتب أرقامك الحقيقية فقط.
   * أي عنصر value بتاعه فاضي مش هيظهر.
   */
  stats: [
    { value: '', label: 'سنة خبرة' },
    { value: '', label: 'مشروع منفّذ' },
    { value: '', label: 'ضمان على التنفيذ' }
  ],

  /**
   * مبدأ التسعير: (المساحة م² × سعر المتر للخامة) × معامل درجة التشطيب + الإضافات
   * الأسعار دي مبدئية للتجربة — عدّلها بأسعارك الفعلية قبل تشغيل الإعلانات.
   * min/max = نطاق سعر المتر المربع بالجنيه المصري (توريد + تركيب).
   */
  services: [
    {
      id: 'wood-pergola',
      name: 'برجولة خشبية',
      short: 'خشب موسكي أو زان معالج',
      desc: 'دفء الخشب الطبيعي بتفاصيل معمارية، معالج ضد الرطوبة والحشرات ومدهون بطبقات حماية خارجية.',
      unit: 'م²',
      min: 2400,
      max: 3400,
      minTotal: 25000
    },
    {
      id: 'metal-pergola',
      name: 'برجولة معدنية',
      short: 'حديد مجلفن أو استانلس',
      desc: 'هيكل حديد مجلفن بدهان إلكتروستاتيك، بخطوط رفيعة وعمر أطول بدون صيانة تقريباً.',
      unit: 'م²',
      min: 1900,
      max: 2800,
      minTotal: 20000
    },
    {
      id: 'louver-pergola',
      name: 'برجولة ألومنيوم متحركة',
      short: 'شرائح تفتح وتقفل (Bioclimatic)',
      desc: 'شرائح ألومنيوم بتتحكم فيها يدوي أو بموتور — شمس لما تحب، ضل وحماية من المطر لما تحتاج.',
      unit: 'م²',
      min: 6500,
      max: 9500,
      minTotal: 60000
    },
    {
      id: 'glass-room',
      name: 'غرف وأسقف زجاج',
      short: 'سكاي لايت وغرف زجاج',
      desc: 'زجاج سيكوريت أو دبل جلاس على قطاعات ألومنيوم، يحوّل الرووف أو الجنينة لمساحة تستخدمها طول السنة.',
      unit: 'م²',
      min: 4800,
      max: 7500,
      minTotal: 40000
    },
    {
      id: 'aluminum',
      name: 'شبابيك وواجهات ألومنيوم',
      short: 'قطاعات جامبو وسلايد',
      desc: 'شبابيك وأبواب ومطابخ ألومنيوم وواجهات كرتن وول، بعزل صوت وتقفيل محكم.',
      unit: 'م²',
      min: 3200,
      max: 5800,
      minTotal: 15000
    }
  ],

  /** درجات التشطيب — معامل بيتضرب في سعر المتر */
  tiers: [
    { id: 'essential', name: 'أساسي', factor: 0.9, note: 'خامات موثوقة وتشطيب نظيف' },
    { id: 'signature', name: 'سيجنتشر', factor: 1.0, note: 'الأكثر طلباً — توازن بين الخامة والسعر' },
    { id: 'prestige', name: 'بريستيج', factor: 1.3, note: 'أعلى خامة وتفاصيل مخصصة بالكامل' }
  ],

  /** إضافات — perM2 يعني السعر بيتضرب في المساحة، fixed سعر ثابت */
  addOns: [
    { id: 'lighting', name: 'إضاءة LED مخفية', fixed: 6500 },
    { id: 'screens', name: 'ستائر جانبية أو شاشات خصوصية', fixed: 9500 },
    { id: 'glass-sides', name: 'جوانب زجاج سيكوريت', perM2: 1400 },
    { id: 'motor', name: 'موتور وريموت للفتح والقفل', fixed: 18000 },
    { id: 'design3d', name: 'تصميم 3D قبل التنفيذ', fixed: 0, label: 'مجاناً مع التعاقد' }
  ],

  /**
   * صور الشغل. حط صورك في images/work/ واكتب هنا اسم الملف.
   * cat لازم تكون واحدة من: wood | metal | aluminum | glass
   * placeholder: true = صورة توضيحية مؤقتة، هتظهر عليها علامة، امسحها لما تحط صورك.
   */
  gallery: [
    { src: 'images/placeholder/facade-night.jpg', cat: 'wood', title: 'تكسية خشب وتراس مغطى', place: 'صورة توضيحية', placeholder: true },
    { src: 'images/placeholder/glass-aluminum.jpg', cat: 'glass', title: 'واجهة زجاج بقطاع رفيع', place: 'صورة توضيحية', placeholder: true },
    { src: 'images/placeholder/glass-living.jpg', cat: 'aluminum', title: 'سلايد ألومنيوم على الجنينة', place: 'صورة توضيحية', placeholder: true }
    // { src: 'images/work/pergola-new-cairo.jpg', cat: 'wood', title: 'برجولة خشب موسكي 5×4 م', place: 'التجمع الخامس' },
  ],

  /** آراء العملاء — حقيقية فقط. القسم مش هيظهر طول ما القائمة فاضية. */
  testimonials: [
    // { name: 'م. أحمد', place: 'الشيخ زايد', text: 'الالتزام بالميعاد والتشطيب كانوا أحسن من المتوقع.' },
  ]
};
