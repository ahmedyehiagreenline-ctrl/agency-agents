/**
 * Arcova NIT Studio — إعدادات الصفحة
 * ----------------------------------------------------------------
 * - الأسعار: لو ربطت الشيت، الصفحة بتقرا تاب "Prices" (الرقم هناك بيغلب الرقم هنا).
 * - الصور: أي صورة في فولدر "Arcova — معرض الأعمال" على Drive بتظهر في المعرض لوحدها.
 * - النص الإنجليزي بيتكتب في خانة بنفس الاسم + _en.
 */
window.ARCOVA = {
  brand: {
    phone: '+20 15 53955523',
    whatsapp: '201553955523',
    facebook: 'https://www.facebook.com/Arcova.nitstudio',
    instagram: '',
    tiktok: ''
  },
  defaultLang: 'ar',

  /** رابط Google Apps Script بعد النشر — لو فاضي الطلب بيروح واتساب */
  sheetWebhookUrl: '',

  tracking: { metaPixelId: '', ga4Id: '', googleAdsId: '', googleAdsLeadLabel: '', tiktokPixelId: '' },

  /** صور الهيرو (بتتبدل كل كام ثانية) */
  hero: ['hero-rooftop-dusk', 'pool-lounge-dusk', 'alu-black-villa', 'lattice-green-lounge', 'gazebo-terrace', 'wood-cube-garden'],

  /** من الفكرة للحقيقة — نفس المشروع في 3 مراحل */
  story: [
    { img: 'sketch-steel', name: 'الاسكتش', name_en: 'Sketch' },
    { img: 'steel-black-real', name: 'التنفيذ', name_en: 'Build' },
    { img: 'steel-black-render', name: 'المساحة جاهزة', name_en: 'Ready to live' }
  ],

  palettes: {
    wood: [
      { id: 'natural', name: 'طبيعي', name_en: 'Natural', hex: '#c7965f' },
      { id: 'teak', name: 'تيك', name_en: 'Teak', hex: '#9a6134' },
      { id: 'walnut', name: 'جوزي', name_en: 'Walnut', hex: '#6a4128' },
      { id: 'dark', name: 'بني غامق', name_en: 'Dark brown', hex: '#46291a' },
      { id: 'olive', name: 'أخضر زيتي', name_en: 'Olive', hex: '#7f9870' },
      { id: 'white', name: 'أبيض', name_en: 'White', hex: '#ece7dc' }
    ],
    metal: [
      { id: 'black', name: 'أسود', name_en: 'Black', hex: '#1d1d1d' },
      { id: 'anthracite', name: 'أنثراسايت', name_en: 'Anthracite', hex: '#3b3f42' },
      { id: 'white', name: 'أبيض', name_en: 'White', hex: '#ebe9e3' },
      { id: 'bronze', name: 'برونزي', name_en: 'Bronze', hex: '#6f5236' },
      { id: 'woodgrain', name: 'بلون الخشب', name_en: 'Wood-effect', hex: '#8a5a33' }
    ],
    alu: [
      { id: 'black', name: 'أسود', name_en: 'Black', hex: '#1d1d1d' },
      { id: 'anthracite', name: 'أنثراسايت', name_en: 'Anthracite', hex: '#3b3f42' },
      { id: 'white', name: 'أبيض', name_en: 'White', hex: '#ebe9e3' },
      { id: 'champagne', name: 'شامبين', name_en: 'Champagne', hex: '#b9a17a' },
      { id: 'khash', name: 'خشمونيوم', name_en: 'Wood-effect', hex: '#8a5a33' }
    ]
  },

  /**
   * الخدمات. min / max = سعر المتر المربع (توريد + تركيب)، minTotal = أقل قيمة مشروع.
   * quote: true = السعر بعد التوصيف. ⚠️ الأرقام مبدئية — غيّرها هنا أو من تاب Prices.
   */
  catalog: [
    {
      id: 'wood', palette: 'wood', estimator: true, img: 'hero-rooftop-dusk',
      name: 'برجولات خشب', name_en: 'Wood pergolas', short: 'خشب', short_en: 'Wood',
      line: 'موسكي سويدي أو بيتش باين', line_en: 'Swedish pine or pitch pine',
      optionsLabel: 'نوع الخشب', optionsLabel_en: 'Wood',
      options: [
        { id: 'swedish', name: 'موسكي سويدي', name_en: 'Swedish pine', factor: 1 },
        { id: 'pitch-pine', name: 'بيتش باين', name_en: 'Pitch pine', factor: 1.2 }
      ],
      types: [
        { id: 'wood-slats', name: 'سقف شرايح', name_en: 'Slatted roof', min: 2400, max: 3200, minTotal: 25000 },
        { id: 'wood-solid', name: 'سقف مصمت', name_en: 'Solid roof', min: 3000, max: 4000, minTotal: 30000 },
        { id: 'wood-awning', name: 'تندة', name_en: 'Awning', min: 2200, max: 3000, minTotal: 15000 },
        { id: 'wood-room', name: 'غرفة مقفلة بالكامل', name_en: 'Enclosed room', quote: true }
      ]
    },
    {
      id: 'metal', palette: 'metal', estimator: true, img: 'steel-black-render',
      name: 'برجولات حديد', name_en: 'Steel pergolas', short: 'حديد', short_en: 'Steel',
      line: 'قطاعات 8×8 و10×10 · ضمان 25 سنة', line_en: '8×8 & 10×10 sections · 25-year warranty',
      warranty: 'ضمان 25 سنة', warranty_en: '25-year warranty',
      optionsLabel: 'القطاع', optionsLabel_en: 'Section',
      options: [
        { id: 'sec-8', name: '8×8 سم', name_en: '8×8 cm', factor: 1 },
        { id: 'sec-10', name: '10×10 سم', name_en: '10×10 cm', factor: 1.2 }
      ],
      types: [
        { id: 'metal-design', name: 'بتصميم خاص', name_en: 'Custom design', min: 2000, max: 3000, minTotal: 22000 },
        { id: 'metal-awning', name: 'تندة بسقف شرايح', name_en: 'Slatted awning', min: 1800, max: 2600, minTotal: 15000 },
        { id: 'metal-glass-room', name: 'غرفة بتقفيلات زجاج', name_en: 'Glass-enclosed room', quote: true }
      ]
    },
    {
      id: 'alu', palette: 'alu', estimator: true, img: 'alu-black-villa',
      name: 'برجولات ألومنيوم', name_en: 'Aluminium pergolas', short: 'ألومنيوم', short_en: 'Aluminium',
      line: 'شرائح ثابتة أو متحركة · ضمان 25 سنة', line_en: 'Fixed or moving louvres · 25-year warranty',
      warranty: 'ضمان 25 سنة', warranty_en: '25-year warranty',
      optionsLabel: 'القطاع', optionsLabel_en: 'Profile',
      options: [
        { id: 'alu-std', name: 'تقيل', name_en: 'Heavy', factor: 1 },
        { id: 'alu-xl', name: 'تقيل جداً', name_en: 'Extra heavy', factor: 1.15 }
      ],
      types: [
        { id: 'alu-fixed', name: 'شرائح ثابتة', name_en: 'Fixed louvres', min: 4200, max: 5500, minTotal: 35000 },
        { id: 'alu-manual', name: 'متحركة مانيوال', name_en: 'Manual louvres', min: 6000, max: 7500, minTotal: 55000 },
        { id: 'alu-auto', name: 'متحركة أوتوماتيك', name_en: 'Motorised louvres', min: 7500, max: 9500, minTotal: 70000 },
        { id: 'alu-enclosed', name: 'مقفلة بالكامل', name_en: 'Fully enclosed', quote: true }
      ]
    },
    { id: 'glass', name: 'أعمال الزجاج', name_en: 'Glass works' },
    { id: 'aluminum', name: 'أعمال الألومنيوم', name_en: 'Aluminium works' },
    { id: 'finishing', name: 'التشطيبات', name_en: 'Finishing' },
    { id: 'cladding', name: 'الكلادينج', name_en: 'Cladding' }
  ],

  /** الإضافات — perM2 بيتضرب في المساحة، fixed سعر ثابت، من غير سعر = حسب الاختيار */
  addOns: [
    { id: 'lighting', icon: 'light', name: 'إضاءة وكهرباء', name_en: 'Lighting', fixed: 7500 },
    { id: 'roof-acrylic', icon: 'roof', name: 'سقف أكريليك', name_en: 'Acrylic roof', perM2: 900 },
    { id: 'roof-sandwich', icon: 'roof', name: 'ساندوتش بانل', name_en: 'Sandwich panel', perM2: 1100 },
    { id: 'roof-tile', icon: 'roof', name: 'قرميد', name_en: 'Roof tiles', perM2: 1000 },
    { id: 'floor', icon: 'floor', name: 'سيراميك أو رخام', name_en: 'Tiles or marble', perM2: 1200 },
    { id: 'plants', icon: 'leaf', name: 'زرع', name_en: 'Planting' },
    { id: 'seating', icon: 'sofa', name: 'جلسة خشب', name_en: 'Seating' },
    { id: 'table', icon: 'table', name: 'ترابيزة أو سفرة', name_en: 'Table' },
    { id: 'ac', icon: 'ac', name: 'تكييف', name_en: 'A/C' },
    { id: 'tv', icon: 'tv', name: 'شاشة', name_en: 'TV' },
    { id: 'full-fitout', icon: 'star', name: 'تجهيز كامل', name_en: 'Full fit-out' }
  ],

  /** المعرض — img = اسم الصورة في images/p */
  gallery: [
    { img: 'hero-rooftop-dusk', cat: 'wood', title: 'برجولة رووف بإضاءة مخفية', title_en: 'Rooftop pergola, hidden lighting' },
    { img: 'alu-black-villa', cat: 'alu', title: 'ألومنيوم أسود بشرائح', title_en: 'Black aluminium louvres' },
    { img: 'lattice-green-lounge', cat: 'wood', title: 'جلسة تحت برجولة خضرا', title_en: 'Lounge under a green pergola' },
    { img: 'pool-lounge-dusk', cat: 'wood', title: 'برجولة وجلسة على البيسين', title_en: 'Pergola lounge by the pool' },
    { img: 'villa-pool-kitchen', cat: 'wood', title: 'مطبخ خارجي تحت برجولة', title_en: 'Outdoor kitchen under a pergola' },
    { img: 'villa-pergola-garden-v', cat: 'wood', title: 'برجولة فيلا بجلسة كاملة', title_en: 'Villa pergola lounge' },
    { img: 'villa-slatted-deck', cat: 'wood', title: 'سواتر شرايح وديك خشب', title_en: 'Slatted screens and wood deck' },
    { img: 'villa-pool-night', cat: 'wood', title: 'برجولة البيسين بالليل', title_en: 'Poolside pergola at night' },
    { img: 'villa-pergola-stone-v', cat: 'wood', title: 'برجولة ممتدة على البيسين', title_en: 'Long poolside pergola' },
    { img: 'villa-pool-dining', cat: 'wood', title: 'سفرة على البيسين', title_en: 'Poolside dining' },
    { img: 'villa-pergola-columns', cat: 'wood', title: 'برجولة بأعمدة كلاسيك', title_en: 'Pergola with classic columns' },
    { img: 'villa-pergola-pool-v', cat: 'wood', title: 'برجولة على البيسين', title_en: 'Pergola over the pool' },
    { img: 'villa-pergola-dining', cat: 'wood', title: 'سفرة تحت البرجولة', title_en: 'Dining under the pergola' },
    { img: 'villa-pergola-kitchen', cat: 'wood', title: 'برجولة ومطبخ', title_en: 'Pergola and kitchen' },
    { img: 'villa-pool-sunset-v', cat: 'wood', title: 'غروب على البيسين', title_en: 'Pool at sunset' },
    { img: 'villa-pergola-poolside', cat: 'wood', title: 'برجولة جنب البيسين', title_en: 'Poolside pergola' },
    { img: 'villa-pergola-terrace', cat: 'wood', title: 'تراس مغطى', title_en: 'Covered terrace' },
    { img: 'villa-pool-dusk', cat: 'wood', title: 'البيسين وقت المغرب', title_en: 'Pool at dusk' },
    { img: 'villa-pergola-garden', cat: 'wood', title: 'برجولة في الجنينة', title_en: 'Garden pergola' },
    { img: 'villa-pergola-pool', cat: 'wood', title: 'برجولة وبيسين', title_en: 'Pergola and pool' },
    { img: 'villa-pool-dining-v', cat: 'wood', title: 'سفرة وبيسين', title_en: 'Dining and pool' },
    { img: 'villa-pergola-poolside-v', cat: 'wood', title: 'برجولة البيسين', title_en: 'Pool pergola' },
    { img: 'villa-pergola-dining-v', cat: 'wood', title: 'سفرة خشب', title_en: 'Wooden dining' },
    { img: 'villa-pergola-columns-v', cat: 'wood', title: 'أعمدة وخشب', title_en: 'Columns and wood' },
    { img: 'rooftop-lounge', cat: 'wood', title: 'رووف بسواتر شرائح', title_en: 'Rooftop with slatted screens' },
    { img: 'wood-cube-garden', cat: 'wood', title: 'مكعب خشب في الجنينة', title_en: 'Garden wood cube' },
    { img: 'steel-black-rooftop', cat: 'metal', title: 'حديد أسود على الرووف', title_en: 'Black steel rooftop pergola' },
    { img: 'gazebo-terrace', cat: 'wood', title: 'جازيبو بسقف هرمي', title_en: 'Pyramid-roof gazebo' },
    { img: 'glass-room', cat: 'glass', title: 'غرفة زجاج', title_en: 'Glass room' },
    { img: 'wood-screens-terrace', cat: 'wood', title: 'برجولة بسواتر', title_en: 'Pergola with screens' },
    { img: 'alu-white', cat: 'alu', title: 'ألومنيوم أبيض', title_en: 'White aluminium' },
    { img: 'rooftop-lounge-inside', cat: 'wood', title: 'سقف شرايح بإضاءة', title_en: 'Lit slatted ceiling' },
    { img: 'gazebo-octagon', cat: 'wood', title: 'جازيبو مثمن', title_en: 'Octagonal gazebo' },
    { img: 'glass-pergola-garden', cat: 'glass', title: 'برجولة بتقفيل زجاج', title_en: 'Glass-enclosed pergola' },
    { img: 'wood-black-corner', cat: 'metal', title: 'حديد وخشب', title_en: 'Steel and wood' },
    { img: 'wood-cabin-green-wall', cat: 'wood', title: 'كابينة خشب بإضاءة', title_en: 'Lit wood cabin' },
    { img: 'alu-black-louvre', cat: 'alu', title: 'شرائح ألومنيوم', title_en: 'Aluminium louvres' },
    { img: 'lattice-green-1', cat: 'wood', title: 'برجولة شبك خضرا', title_en: 'Green lattice pergola' },
    { img: 'wood-pergola-carved', cat: 'wood', title: 'تفاصيل محفورة', title_en: 'Carved details' },
    { img: 'steel-wood-tv', cat: 'metal', title: 'جلسة بشاشة', title_en: 'Lounge with TV' },
    { img: 'cladding-deck', cat: 'cladding', title: 'تكسية وديك خشب', title_en: 'Cladding and decking' },
    { img: 'wood-pergola-marble', cat: 'wood', title: 'برجولة على رخام', title_en: 'Pergola on marble' },
    { img: 'glass-box-pool', cat: 'glass', title: 'بوكس زجاج على البيسين', title_en: 'Glass box by the pool' },
    { img: 'wood-lounge-blue', cat: 'wood', title: 'جلسة مقفولة جزئياً', title_en: 'Semi-enclosed lounge' },
    { img: 'steel-frame-planters', cat: 'metal', title: 'حديد بأحواض زرع', title_en: 'Steel with planters' },
    { img: 'wood-garden-lights', cat: 'wood', title: 'جنينة بالليل', title_en: 'Garden at night' },
    { img: 'wood-rooftop-bar', cat: 'wood', title: 'بار على الرووف', title_en: 'Rooftop bar' },
    { img: 'wood-swing-pergola', cat: 'wood', title: 'برجولة بمرجيحة', title_en: 'Pergola with swing' },
    { img: 'gazebo-seating', cat: 'wood', title: 'جازيبو بجلسة مبنية', title_en: 'Gazebo with built-in seating' },
    { img: 'wood-dining-white', cat: 'wood', title: 'سفرة خارجية', title_en: 'Outdoor dining' },
    { img: 'cladding-room', cat: 'cladding', title: 'غرفة بتكسية خشب', title_en: 'Wood-clad room' },
    { img: 'wood-pergola-grid', cat: 'wood', title: 'سقف شبكي', title_en: 'Grid roof' },
    { img: 'wood-green-wall', cat: 'wood', title: 'جلسة بحيطة زرع', title_en: 'Lounge with green wall' },
    { img: 'wood-pool-pergola', cat: 'wood', title: 'برجولة على البيسين', title_en: 'Poolside pergola' },
    { img: 'wood-screens-sofa', cat: 'metal', title: 'إطار أسود وخشب', title_en: 'Black frame and wood' },
    { img: 'wood-corner-sofa', cat: 'wood', title: 'زاوية جلوس', title_en: 'Corner lounge' },
    { img: 'wood-stone-terrace', cat: 'wood', title: 'تراس حجر', title_en: 'Stone terrace' },
    { img: 'wood-lattice-garden', cat: 'wood', title: 'برجولة بين الورد', title_en: 'Among the flowers' },
    { img: 'wood-pergola-stairs', cat: 'wood', title: 'مدخل مغطى', title_en: 'Covered entrance' },
    { img: 'wood-slatted-frame', cat: 'wood', title: 'هيكل شرايح', title_en: 'Slatted frame' },
    { img: 'wood-lounge-lawn', cat: 'wood', title: 'جلسة على النجيلة', title_en: 'Lawn lounge' },
    { img: 'wood-dining-pergola', cat: 'wood', title: 'سفرة في الجنينة', title_en: 'Garden dining' },
    { img: 'wood-bar-pergola', cat: 'wood', title: 'ركن بار', title_en: 'Bar corner' },
    { img: 'wood-pergola-turf', cat: 'wood', title: 'برجولة رووف', title_en: 'Rooftop pergola' },
    { img: 'wood-pergola-deck-screen', cat: 'wood', title: 'ساتر وديك', title_en: 'Screen and deck' },
    { img: 'wood-pergola-fence', cat: 'wood', title: 'برجولة سور', title_en: 'Fence-side pergola' },
    { img: 'wood-balcony-pergola', cat: 'wood', title: 'برجولة بلكونة', title_en: 'Balcony pergola' },
    { img: 'wood-pergola-garden-sunset', cat: 'wood', title: 'غروب في الجنينة', title_en: 'Garden sunset' },
    { img: 'wood-lounge-pool', cat: 'wood', title: 'جلسة زجاج وخشب', title_en: 'Glass and wood lounge' },
    { img: 'lattice-green-2', cat: 'wood', title: 'تفصيلة الشبك', title_en: 'Lattice detail' },
    { img: 'steel-wood-slats', cat: 'metal', title: 'حديد بشرائح خشب', title_en: 'Steel with wood slats' },
    { img: 'rooftop-pergola-front', cat: 'wood', title: 'برجولة رووف', title_en: 'Rooftop pergola' }
  ],

  testimonials: []
};
