/**
 * Arcova NIT Studio — إعدادات صفحة الهبوط
 * ----------------------------------------------------------------
 * كل حاجة ممكن تتغير من غير ما تلمس التصميم موجودة هنا:
 * رابط الشيت، رقم الواتساب، أكواد البيكسل، الخدمات والألوان والأسعار، صور الشغل.
 *
 * - الأسعار: لو ربطت الشيت، الصفحة بتقرا الأسعار من تاب "Prices" (الرقم هناك بيغلب الرقم هنا).
 * - الصور: لو ربطت الشيت، أي صورة ترميها في فولدر "Arcova — معرض الأعمال" على Google Drive
 *   بتظهر في معرض الشغل لوحدها (شوف README).
 * - أي نص فيه نسخة إنجليزي بيتكتب في خانة بنفس الاسم + _en (مثلاً name و name_en).
 */
window.ARCOVA = {
  brand: {
    name: 'Arcova NIT Studio',
    phone: '+20 15 53955523',
    whatsapp: '201553955523',          // بدون + وبدون مسافات
    facebook: 'https://www.facebook.com/Arcova.nitstudio',
    instagram: '',
    tiktok: ''
  },

  /** اللغة الافتراضية لو الزائر ما اختارش. لينك الإعلان ممكن يحدد اللغة: ?lang=en */
  defaultLang: 'ar',

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
    { value: '25', label: 'سنة ضمان على الحديد والألومنيوم', label_en: 'year warranty on steel & aluminium' },
    { value: '', label: 'سنة خبرة', label_en: 'years of experience' },
    { value: '', label: 'مشروع منفّذ', label_en: 'projects delivered' }
  ],

  /** ألوان جاهزة (hex للعرض فقط). أي لون تاني العميل يكتبه في الملاحظات. */
  palettes: {
    wood: [
      { id: 'natural', name: 'طبيعي فاتح', name_en: 'Natural', hex: '#c7965f' },
      { id: 'teak', name: 'تيك', name_en: 'Teak', hex: '#9a6134' },
      { id: 'walnut', name: 'جوزي', name_en: 'Walnut', hex: '#6a4128' },
      { id: 'dark', name: 'بني غامق', name_en: 'Dark brown', hex: '#46291a' },
      { id: 'ebony', name: 'أبنوسي', name_en: 'Ebony', hex: '#231a15' },
      { id: 'olive', name: 'أخضر زيتي', name_en: 'Olive green', hex: '#7f9870' },
      { id: 'white', name: 'أبيض', name_en: 'White', hex: '#ece7dc' }
    ],
    metal: [
      { id: 'black', name: 'أسود مطفي', name_en: 'Matte black', hex: '#1d1d1d' },
      { id: 'anthracite', name: 'رمادي أنثراسايت', name_en: 'Anthracite', hex: '#3b3f42' },
      { id: 'white', name: 'أبيض', name_en: 'White', hex: '#ebe9e3' },
      { id: 'bronze', name: 'برونزي', name_en: 'Bronze', hex: '#6f5236' },
      { id: 'olive', name: 'أخضر زيتي', name_en: 'Olive green', hex: '#5f7357' },
      { id: 'woodgrain', name: 'بلون الخشب', name_en: 'Wood-effect', hex: '#8a5a33' }
    ],
    alu: [
      { id: 'black', name: 'أسود مطفي', name_en: 'Matte black', hex: '#1d1d1d' },
      { id: 'anthracite', name: 'رمادي أنثراسايت', name_en: 'Anthracite', hex: '#3b3f42' },
      { id: 'white', name: 'أبيض', name_en: 'White', hex: '#ebe9e3' },
      { id: 'champagne', name: 'شامبين', name_en: 'Champagne', hex: '#b9a17a' },
      { id: 'khash-light', name: 'خشمونيوم فاتح', name_en: 'Light wood-effect', hex: '#a8764a' },
      { id: 'khash-dark', name: 'خشمونيوم غامق', name_en: 'Dark wood-effect', hex: '#5e3b24' }
    ]
  },

  /**
   * الخدمات.
   * estimator: true  = ليها حاسبة تكلفة (البرجولات) · palette = مجموعة الألوان
   * types:  min / max = سعر المتر المربع بالجنيه (توريد + تركيب)، minTotal = أقل قيمة مشروع
   *         quote: true = السعر بعد توصيف العميل
   * options: الخامة أو المواصفة، factor بيتضرب في سعر المتر
   * ⚠️ الأرقام مبدئية للتجربة — غيّرها هنا أو من تاب Prices في الشيت.
   */
  catalog: [
    {
      id: 'wood', palette: 'wood', estimator: true,
      name: 'برجولات خشب', name_en: 'Wood pergolas',
      short: 'موسكي سويدي أو بيتش باين', short_en: 'Swedish pine or pitch pine',
      desc: 'دفء الخشب الطبيعي بتفاصيل معمارية، معالج ضد الرطوبة والحشرات ومدهون بطبقات حماية للاستخدام الخارجي.',
      desc_en: 'The warmth of natural wood with architectural detailing, treated against moisture and insects and coated for outdoor use.',
      optionsLabel: 'نوع الخشب', optionsLabel_en: 'Wood type',
      options: [
        { id: 'swedish', name: 'موسكي سويدي', name_en: 'Swedish pine', note: 'الأكثر استخداماً', note_en: 'Most popular', factor: 1 },
        { id: 'pitch-pine', name: 'بيتش باين', name_en: 'Pitch pine', note: 'أتقل وعروقه أوضح', note_en: 'Denser, bolder grain', factor: 1.2 }
      ],
      types: [
        { id: 'wood-slats', name: 'برجولة سقف شرايح', name_en: 'Slatted-roof pergola', note: 'ضل وتهوية', note_en: 'Shade with airflow', min: 2400, max: 3200, minTotal: 25000 },
        { id: 'wood-solid', name: 'برجولة سقف مصمت', name_en: 'Solid-roof pergola', note: 'حماية كاملة من الشمس', note_en: 'Full sun protection', min: 3000, max: 4000, minTotal: 30000 },
        { id: 'wood-awning', name: 'تندة خشب', name_en: 'Wood awning', note: 'على الحيطة، للبلكونة والرووف', note_en: 'Wall-mounted, balconies and rooftops', min: 2200, max: 3000, minTotal: 15000 },
        { id: 'wood-room', name: 'غرفة معيشة مقفلة بالكامل', name_en: 'Fully enclosed living room', note: 'السعر بعد التوصيف', note_en: 'Priced on request', quote: true }
      ]
    },
    {
      id: 'metal', palette: 'metal', estimator: true,
      name: 'برجولات حديد', name_en: 'Steel pergolas',
      short: 'قطاعات 8×8 أو 10×10 سم', short_en: '8×8 or 10×10 cm sections',
      desc: 'قوائم وعوارض حديد بقطاعات تقيلة، مدهونة إلكتروستاتيك، بتصميم على مقاس مكانك.',
      desc_en: 'Heavy-section steel posts and beams, powder-coated, designed to fit your space.',
      warranty: 'ضمان 25 سنة', warranty_en: '25-year warranty',
      optionsLabel: 'مقاس القطاع', optionsLabel_en: 'Section size',
      options: [
        { id: 'sec-8', name: 'قطاع 8×8 سم', name_en: '8×8 cm section', note: 'للمساحات العادية', note_en: 'Standard spans', factor: 1 },
        { id: 'sec-10', name: 'قطاع 10×10 سم', name_en: '10×10 cm section', note: 'للبحور الكبيرة', note_en: 'Long spans', factor: 1.2 }
      ],
      types: [
        { id: 'metal-design', name: 'برجولة حديد بتصميم خاص', name_en: 'Custom-design steel pergola', note: 'شكل على ذوقك', note_en: 'Designed to your taste', min: 2000, max: 3000, minTotal: 22000 },
        { id: 'metal-awning', name: 'تندة حديد بسقف شرايح', name_en: 'Steel awning, slatted roof', note: 'للبلكونة والرووف', note_en: 'Balconies and rooftops', min: 1800, max: 2600, minTotal: 15000 },
        { id: 'metal-glass-room', name: 'غرفة كاملة بتقفيلات زجاج', name_en: 'Full room with glass enclosure', note: 'السعر بعد التوصيف', note_en: 'Priced on request', quote: true }
      ]
    },
    {
      id: 'alu', palette: 'alu', estimator: true,
      name: 'برجولات ألومنيوم', name_en: 'Aluminium pergolas',
      short: 'شرائح ثابتة أو متحركة', short_en: 'Fixed or motorised louvres',
      desc: 'ألومنيوم تقيل بكل الدهانات والألوان، ومنها ألوان الخشمونيوم اللي شكلها خشب ومن غير صيانة.',
      desc_en: 'Heavy aluminium in every finish and colour, including wood-effect finishes with zero maintenance.',
      warranty: 'ضمان 25 سنة', warranty_en: '25-year warranty',
      optionsLabel: 'نوع القطاع', optionsLabel_en: 'Profile',
      options: [
        { id: 'alu-std', name: 'قطاع تقيل', name_en: 'Heavy profile', note: 'الأساسي', note_en: 'Standard', factor: 1 },
        { id: 'alu-xl', name: 'قطاع تقيل جداً', name_en: 'Extra-heavy profile', note: 'للبحور الكبيرة والرياح', note_en: 'Long spans and wind', factor: 1.15 }
      ],
      types: [
        { id: 'alu-fixed', name: 'سقف شرائح ثابتة', name_en: 'Fixed louvre roof', note: 'ضل دائم', note_en: 'Permanent shade', min: 4200, max: 5500, minTotal: 35000 },
        { id: 'alu-manual', name: 'شرائح متحركة مانيوال', name_en: 'Manual adjustable louvres', note: 'تفتح وتقفل بذراع', note_en: 'Hand-crank opening', min: 6000, max: 7500, minTotal: 55000 },
        { id: 'alu-auto', name: 'شرائح متحركة أوتوماتيك', name_en: 'Motorised louvres', note: 'موتور وريموت', note_en: 'Motor and remote', min: 7500, max: 9500, minTotal: 70000 },
        { id: 'alu-enclosed', name: 'برجولة مقفلة بالكامل', name_en: 'Fully enclosed pergola', note: 'سقف وجوانب ألومنيوم وزجاج', note_en: 'Aluminium and glass all round', quote: true }
      ]
    },
    { id: 'glass', estimator: false, name: 'أعمال الزجاج', name_en: 'Glass works',
      desc: 'تقفيلات وواجهات وأسقف زجاج، سيكوريت ودبل جلاس، بتركيب وتقفيل محكم.',
      desc_en: 'Glass enclosures, facades and roofs in tempered and double glazing, sealed tight.' },
    { id: 'aluminum', estimator: false, name: 'أعمال الألومنيوم', name_en: 'Aluminium works',
      desc: 'كل أعمال الألومنيوم: شبابيك وأبواب سلايد ومفصلي وواجهات، بقطاعات وألوان مختلفة.',
      desc_en: 'All aluminium works: sliding and hinged windows and doors and facades, in many profiles and colours.' },
    { id: 'finishing', estimator: false, name: 'التشطيبات العامة', name_en: 'General finishing',
      desc: 'تشطيب المساحات الخارجية والداخلية بالكامل: أرضيات، كهرباء، دهانات، وتجهيزات.',
      desc_en: 'Complete indoor and outdoor finishing: flooring, electrics, paint and fit-out.' },
    { id: 'cladding', estimator: false, name: 'أعمال الكلادينج', name_en: 'Cladding',
      desc: 'تكسية واجهات وحوائط بألواح الكلادينج، بشكل عصري ومقاومة للعوامل الجوية.',
      desc_en: 'Facade and wall cladding panels with a modern look that stands up to the weather.' }
  ],

  /**
   * الإضافات — متاحة مع كل أنواع البرجولات.
   * perM2 = بيتضرب في مساحة البرجولة · fixed = سعر ثابت · من غير سعر = "حسب الاختيار"
   * icon: roof | light | floor | sofa | star
   */
  addOnGroups: [
    { icon: 'roof', name: 'السقف والتغطية', name_en: 'Roof & cover', items: [
      { id: 'roof-acrylic', name: 'سقف أكريليك', name_en: 'Acrylic roof', perM2: 900 },
      { id: 'roof-sandwich', name: 'سقف ساندوتش بانل', name_en: 'Sandwich-panel roof', perM2: 1100 },
      { id: 'roof-tile', name: 'سقف قرميد بلاستيك', name_en: 'PVC roof tiles', perM2: 1000 }
    ] },
    { icon: 'light', name: 'كهرباء وإضاءة', name_en: 'Power & lighting', items: [
      { id: 'lighting', name: 'إضاءة وكهرباء', name_en: 'Lighting and wiring', fixed: 7500 },
      { id: 'ac', name: 'تكييف', name_en: 'Air conditioning' },
      { id: 'tv', name: 'شاشة وتجهيزاتها', name_en: 'TV and mounting' }
    ] },
    { icon: 'floor', name: 'أرضيات وزرع', name_en: 'Flooring & planting', items: [
      { id: 'floor', name: 'أرضية سيراميك أو رخام', name_en: 'Ceramic or marble floor', perM2: 1200 },
      { id: 'plants', name: 'زرع طبيعي أو صناعي', name_en: 'Natural or artificial plants' }
    ] },
    { icon: 'sofa', name: 'الفرش', name_en: 'Furniture', items: [
      { id: 'seating', name: 'جلسة خشب', name_en: 'Wooden seating' },
      { id: 'table', name: 'ترابيزة أو سفرة', name_en: 'Coffee or dining table' },
      { id: 'chairs', name: 'كراسي', name_en: 'Chairs' }
    ] },
    { icon: 'star', name: 'تجهيز كامل', name_en: 'Full fit-out', items: [
      { id: 'full-fitout', name: 'تجهيزات وتشطيبات كاملة للمكان', name_en: 'Complete fit-out and finishing' }
    ] }
  ],

  /**
   * صور الشغل الثابتة (بالإضافة لصور فولدر Drive).
   * cat: wood | metal | alu | glass | aluminum | finishing | cladding
   * kind: 'render' = تصميم 3D (مش مشروع منفّذ)
   */
  gallery: [
    { src: 'images/work/wood-pergola-rooftop.jpg', cat: 'wood', title: 'برجولة خشب بجوانب شرائح وإضاءة مخفية', title_en: 'Wood pergola with slatted sides and hidden lighting', place: 'رووف', place_en: 'Rooftop' },
    { src: 'images/work/wood-pergola-lattice-green.jpg', cat: 'wood', title: 'برجولة خشب بجوانب شبك مدهونة أخضر زيتي', title_en: 'Olive-green wood pergola with lattice sides', place: 'جنينة فيلا', place_en: 'Villa garden' },
    { src: 'images/work/wood-pergola-villa.jpg', cat: 'wood', title: 'برجولة خشب سقف شرايح بإضاءة LED', title_en: 'Slatted wood pergola with LED lighting', place: 'جنينة فيلا', place_en: 'Villa garden' },
    { src: 'images/work/wood-gazebo-octagon.jpg', cat: 'wood', title: 'جازيبو خشب مثمن بجلسة مدمجة', title_en: 'Octagonal wood gazebo with built-in seating', place: 'كمبوند', place_en: 'Compound' },
    { src: 'images/work/wood-pergola-rooftop-screens.jpg', cat: 'wood', title: 'برجولة خشب وسواتر شرائح', title_en: 'Wood pergola with slatted screens', place: 'رووف', place_en: 'Rooftop' },
    { src: 'images/work/wood-gazebo-terrace.jpg', cat: 'wood', title: 'جازيبو خشب بسقف هرمي', title_en: 'Wood gazebo with pyramid roof', place: 'تراس فيلا', place_en: 'Villa terrace', kind: 'render' },
    { src: 'images/work/wood-pergola-garden.jpg', cat: 'wood', title: 'برجولة خشب وجلسة خارجية', title_en: 'Wood pergola with outdoor lounge', place: 'جنينة', place_en: 'Garden', kind: 'render' }
  ],

  /** آراء العملاء — حقيقية فقط. القسم مش هيظهر طول ما القائمة فاضية. */
  testimonials: [
    // { name: 'م. أحمد', place: 'الشيخ زايد', text: '...', text_en: '...' },
  ]
};
