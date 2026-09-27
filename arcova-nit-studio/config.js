/**
 * Arcova NIT Studio — إعدادات صفحة الهبوط
 * ----------------------------------------------------------------
 * كل حاجة ممكن تتغير من غير ما تلمس التصميم موجودة هنا:
 * رابط الشيت، رقم الواتساب، أكواد البيكسل، الخدمات والأسعار، صور الشغل.
 *
 * الأسعار: لو ربطت الشيت، الصفحة بتقرا الأسعار من تاب "Prices" في الشيت
 * (أي خانة فيها رقم هناك بتغلب الرقم اللي هنا). يعني تغيّر السعر من الشيت وخلاص.
 */
window.ARCOVA = {
  brand: {
    name: 'Arcova NIT Studio',
    tagline: 'أولاً في خط النهاية',
    logo: '',                           // مثال: 'images/logo.png' — لو فاضي بيظهر الشعار المرسوم
    phone: '+20 15 53955523',
    whatsapp: '201553955523',          // بدون + وبدون مسافات
    facebook: 'https://www.facebook.com/Arcova.nitstudio',
    instagram: '',
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
    metaPixelId: '',
    ga4Id: '',
    googleAdsId: '',
    googleAdsLeadLabel: '',
    tiktokPixelId: ''
  },

  /** أرقام الثقة في الهيرو. اكتب أرقامك الحقيقية فقط — الفاضي مش بيظهر. */
  stats: [
    { value: '25', label: 'سنة ضمان على الحديد والألومنيوم' },
    { value: '', label: 'سنة خبرة' },
    { value: '', label: 'مشروع منفّذ' }
  ],

  /**
   * الخدمات.
   * estimator: true  = ليها حاسبة تكلفة (البرجولات)
   * كل نوع (types):  min / max = سعر المتر المربع بالجنيه (توريد + تركيب)، minTotal = أقل قيمة مشروع
   *                  quote: true = السعر بعد توصيف العميل (مفيش رقم تلقائي)
   * options: الخامة أو المواصفة، factor بيتضرب في سعر المتر
   *
   * ⚠️ كل الأرقام دي مبدئية للتجربة — غيّرها بأسعارك (هنا أو من تاب Prices في الشيت).
   */
  catalog: [
    {
      id: 'wood',
      name: 'برجولات خشب',
      short: 'موسكي سويدي أو بيتش باين',
      desc: 'دفء الخشب الطبيعي بتفاصيل معمارية، معالج ضد الرطوبة والحشرات ومدهون بطبقات حماية للاستخدام الخارجي.',
      estimator: true,
      specs: ['خشب موسكي سويدي أو بيتش باين', 'معالجة ضد الرطوبة والحشرات', 'دهانات حماية خارجية'],
      optionsLabel: 'نوع الخشب',
      options: [
        { id: 'swedish', name: 'موسكي سويدي', note: 'الأكثر استخداماً', factor: 1 },
        { id: 'pitch-pine', name: 'بيتش باين', note: 'أتقل وعروقه أوضح', factor: 1.2 }
      ],
      types: [
        { id: 'wood-slats', name: 'برجولة سقف شرايح', note: 'ضل وتهوية', min: 2400, max: 3200, minTotal: 25000 },
        { id: 'wood-solid', name: 'برجولة سقف مصمت', note: 'حماية كاملة من الشمس', min: 3000, max: 4000, minTotal: 30000 },
        { id: 'wood-awning', name: 'تندة خشب', note: 'على الحيطة، للبلكونة والرووف', min: 2200, max: 3000, minTotal: 15000 },
        { id: 'wood-room', name: 'غرفة معيشة مقفلة بالكامل', note: 'السعر بعد التوصيف', quote: true }
      ]
    },
    {
      id: 'metal',
      name: 'برجولات حديد',
      short: 'قطاعات 8×8 أو 10×10 سم',
      desc: 'قوائم وعوارض حديد بقطاعات تقيلة، مدهونة إلكتروستاتيك، بتصميم على مقاس مكانك.',
      estimator: true,
      warranty: 'ضمان 25 سنة',
      specs: ['قوائم وعوارض 8×8 أو 10×10 سم', 'دهان إلكتروستاتيك', 'ضمان 25 سنة'],
      optionsLabel: 'مقاس القطاع',
      options: [
        { id: 'sec-8', name: 'قطاع 8×8 سم', note: 'للمساحات العادية', factor: 1 },
        { id: 'sec-10', name: 'قطاع 10×10 سم', note: 'للبحور الكبيرة', factor: 1.2 }
      ],
      types: [
        { id: 'metal-design', name: 'برجولة حديد بتصميم خاص', note: 'شكل على ذوقك', min: 2000, max: 3000, minTotal: 22000 },
        { id: 'metal-awning', name: 'تندة حديد بسقف شرايح', note: 'للبلكونة والرووف', min: 1800, max: 2600, minTotal: 15000 },
        { id: 'metal-glass-room', name: 'غرفة كاملة بتقفيلات زجاج', note: 'السعر بعد التوصيف', quote: true }
      ]
    },
    {
      id: 'alu',
      name: 'برجولات ألومنيوم',
      short: 'شرائح ثابتة أو متحركة',
      desc: 'ألومنيوم تقيل بكل الدهانات والألوان، ومنها ألوان الخشمونيوم اللي شكلها خشب ومن غير صيانة.',
      estimator: true,
      warranty: 'ضمان 25 سنة',
      specs: ['قطاعات ألومنيوم تقيلة', 'كل الألوان ومنها الخشمونيوم', 'ضمان 25 سنة'],
      optionsLabel: 'اللون والدهان',
      options: [
        { id: 'alu-color', name: 'ألوان سادة', note: 'أسود، رمادي، أبيض…', factor: 1 },
        { id: 'alu-wood', name: 'خشمونيوم', note: 'ألومنيوم بلون وملمس الخشب', factor: 1.12 }
      ],
      types: [
        { id: 'alu-fixed', name: 'سقف شرائح ثابتة', note: 'ضل دائم', min: 4200, max: 5500, minTotal: 35000 },
        { id: 'alu-manual', name: 'شرائح متحركة مانيوال', note: 'تفتح وتقفل بذراع', min: 6000, max: 7500, minTotal: 55000 },
        { id: 'alu-auto', name: 'شرائح متحركة أوتوماتيك', note: 'موتور وريموت', min: 7500, max: 9500, minTotal: 70000 },
        { id: 'alu-enclosed', name: 'برجولة مقفلة بالكامل', note: 'سقف وجوانب ألومنيوم وزجاج', quote: true }
      ]
    },
    {
      id: 'glass',
      name: 'أعمال الزجاج',
      short: 'كل أعمال الزجاج',
      desc: 'تقفيلات وواجهات وأسقف زجاج، سيكوريت ودبل جلاس، بتركيب وتقفيل محكم.',
      estimator: false
    },
    {
      id: 'aluminum',
      name: 'أعمال الألومنيوم',
      short: 'شبابيك وأبواب وواجهات',
      desc: 'كل أعمال الألومنيوم: شبابيك وأبواب سلايد ومفصلي وواجهات، بقطاعات وألوان مختلفة.',
      estimator: false
    },
    {
      id: 'finishing',
      name: 'التشطيبات العامة',
      short: 'تشطيب كامل',
      desc: 'تشطيبات المساحات الخارجية والداخلية بالكامل: أرضيات، كهرباء، دهانات، وتجهيزات.',
      estimator: false
    },
    {
      id: 'cladding',
      name: 'أعمال الكلادينج',
      short: 'تكسيات واجهات',
      desc: 'تكسية واجهات وحوائط بألواح الكلادينج، بشكل عصري ومقاومة للعوامل الجوية.',
      estimator: false
    }
  ],

  /**
   * الإضافات — متاحة مع كل أنواع البرجولات.
   * perM2 = بيتضرب في مساحة البرجولة · fixed = سعر ثابت
   * من غير سعر = "حسب الاختيار" (بتتسجل في الطلب ويتسعر في المعاينة)
   */
  addOnGroups: [
    {
      name: 'السقف والتغطية',
      items: [
        { id: 'roof-acrylic', name: 'سقف أكريليك', perM2: 900 },
        { id: 'roof-sandwich', name: 'سقف ساندوتش بانل', perM2: 1100 },
        { id: 'roof-tile', name: 'سقف قرميد بلاستيك', perM2: 1000 }
      ]
    },
    {
      name: 'كهرباء وإضاءة',
      items: [
        { id: 'lighting', name: 'إضاءة وكهرباء', fixed: 7500 },
        { id: 'ac', name: 'تكييف' },
        { id: 'tv', name: 'شاشة وتجهيزاتها' }
      ]
    },
    {
      name: 'أرضيات وزرع',
      items: [
        { id: 'floor', name: 'أرضية سيراميك أو رخام', perM2: 1200 },
        { id: 'plants', name: 'زرع طبيعي أو صناعي' }
      ]
    },
    {
      name: 'الفرش',
      items: [
        { id: 'seating', name: 'جلسة خشب' },
        { id: 'table', name: 'ترابيزة أو سفرة' },
        { id: 'chairs', name: 'كراسي' }
      ]
    },
    {
      name: 'تجهيز كامل',
      items: [
        { id: 'full-fitout', name: 'تجهيزات وتشطيبات كاملة للمكان' }
      ]
    }
  ],

  /**
   * صور الشغل — حط صورك في images/work/ وضيف سطر هنا.
   * cat: wood | metal | alu | glass | aluminum | finishing | cladding
   * kind: 'render' = تصميم 3D (مش مشروع منفّذ) — بتظهر عليه علامة "تصميم 3D"
   * أول صورة وكل صورة خامسة بتظهر كبيرة.
   */
  gallery: [
    { src: 'images/work/wood-pergola-rooftop.jpg', cat: 'wood', title: 'برجولة خشب بجوانب شرائح وإضاءة مخفية', place: 'رووف' },
    { src: 'images/work/wood-pergola-villa.jpg', cat: 'wood', title: 'برجولة خشب سقف شرائح بإضاءة LED', place: 'جنينة فيلا' },
    { src: 'images/work/wood-pergola-rooftop-screens.jpg', cat: 'wood', title: 'برجولة خشب وسواتر شرائح', place: 'رووف' },
    { src: 'images/work/wood-gazebo-terrace.jpg', cat: 'wood', title: 'جازيبو خشب بسقف هرمي', place: 'تراس فيلا', kind: 'render' },
    { src: 'images/work/wood-pergola-garden.jpg', cat: 'wood', title: 'برجولة خشب وجلسة خارجية', place: 'جنينة', kind: 'render' }
  ],

  /** آراء العملاء — حقيقية فقط. القسم مش هيظهر طول ما القائمة فاضية. */
  testimonials: [
    // { name: 'م. أحمد', place: 'الشيخ زايد', text: 'الالتزام بالميعاد والتشطيب كانوا أحسن من المتوقع.' },
  ]
};
