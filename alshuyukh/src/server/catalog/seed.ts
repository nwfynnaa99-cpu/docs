import type { Category, Collection, HomepageContent, Media, Offer, Product, Review } from "./types";

/*
 * Development seed. Images are procedurally generated placeholders
 * (scripts/generate-textures.mjs); replace with real photography in the CMS.
 */

const img = (name: string, alt: string): Media => ({
  src: `/media/${name}.webp`,
  macro: `/media/${name}-macro.webp`,
  alt,
  width: 1200,
  height: 1500,
});

export const categories: Category[] = [
  { id: "c-fabrics", slug: "fabrics", name: "الأقمشة", description: "أقمشة رجالية مختارة لكل موسم ومناسبة.", sortOrder: 1 },
  { id: "c-summer", slug: "summer-fabrics", parentId: "c-fabrics", name: "أقمشة صيفية", description: "خامات خفيفة تتنفس مع حرارة الصيف.", image: img("summer-ivory", "قماش صيفي عاجي"), sortOrder: 1 },
  { id: "c-winter", slug: "winter-fabrics", parentId: "c-fabrics", name: "أقمشة شتوية", description: "صوف ومزائج دافئة بحضور ثقيل.", image: img("winter-charcoal", "قماش شتوي فحمي"), sortOrder: 2 },
  { id: "c-japanese", slug: "japanese-fabrics", parentId: "c-fabrics", name: "أقمشة يابانية", description: "نسيج ياباني دقيق بلمعة هادئة.", image: img("japanese-white", "قماش ياباني أبيض"), sortOrder: 3 },
  { id: "c-cotton", slug: "cotton-fabrics", parentId: "c-fabrics", name: "أقمشة قطنية", description: "قطن طبيعي ناعم للاستخدام اليومي.", image: img("cotton-sand", "قماش قطني رملي"), sortOrder: 4 },
  { id: "c-luxury", slug: "luxury-fabrics", parentId: "c-fabrics", name: "أقمشة فاخرة", description: "خامات نادرة للمناسبات الخاصة.", image: img("luxury-navy", "قماش فاخر كحلي"), sortOrder: 5 },
  { id: "c-daily", slug: "daily-fabrics", parentId: "c-fabrics", name: "أقمشة يومية", description: "عملية وأنيقة لكل يوم.", image: img("daily-grey", "قماش يومي رمادي"), sortOrder: 6 },
  { id: "c-thobes", slug: "thobes", name: "الثياب", description: "ثياب جاهزة بقصّات مدروسة.", sortOrder: 2 },
  { id: "c-boxes", slug: "boxes", name: "البوكسات", description: "بوكسات هدايا مختارة.", sortOrder: 4 },
  { id: "c-acc", slug: "accessories", name: "مستلزمات الإطلالة", description: "كل ما يكمل حضورك.", sortOrder: 5 },
  { id: "c-shemagh", slug: "shemagh", parentId: "c-acc", name: "شماغ", description: "", sortOrder: 1 },
  { id: "c-agal", slug: "agal", parentId: "c-acc", name: "عقال", description: "", sortOrder: 2 },
  { id: "c-sedairi", slug: "sedairi", parentId: "c-acc", name: "سديري", description: "", sortOrder: 3 },
  { id: "c-misbaha", slug: "misbaha", parentId: "c-acc", name: "سبحة", description: "", sortOrder: 4 },
  { id: "c-perfumes", slug: "perfumes", parentId: "c-acc", name: "عطور", description: "", sortOrder: 5 },
  { id: "c-oud", slug: "oud-bakhoor", parentId: "c-acc", name: "عود وبخور", description: "", sortOrder: 6 },
  { id: "c-gifts", slug: "gifts", parentId: "c-acc", name: "هدايا", description: "", sortOrder: 7 },
];

const fabric = (o: Partial<Product> & Pick<Product, "id" | "slug" | "name" | "shortDescription" | "price" | "categoryIds" | "images" | "fabric">): Product => ({
  sku: o.id.toUpperCase(),
  description: o.shortDescription,
  unit: "meter",
  rating: { average: 4.8, count: 120 },
  tags: [],
  inventory: 40,
  createdAt: "2026-09-01T00:00:00.000Z",
  ...o,
});

export const products: Product[] = [
  fabric({
    id: "p-ivory-zephyr",
    slug: "ivory-zephyr-summer",
    name: "زفير عاجي",
    shortDescription: "قماش صيفي خفيف بلون عاجي دافئ.",
    description: "نسيج صيفي يجمع بين الخفة والانسدال الهادئ. يمرّ الهواء خلاله بسهولة ويحتفظ بشكله طوال اليوم.",
    price: 18900,
    compareAtPrice: 22900,
    categoryIds: ["c-fabrics", "c-summer"],
    images: [img("summer-ivory", "قماش زفير عاجي منسدل")],
    fabric: { type: "تويل خفيف", material: "بوليستر وفسكوز", texture: "ناعم بانسدال", season: "صيفي", color: "عاجي", width: "150 سم", origin: "كوريا" },
    rating: { average: 4.9, count: 214 },
    isBestSeller: true,
    tags: ["صيفي", "أبيض", "عاجي"],
  }),
  fabric({
    id: "p-kyoto-white",
    slug: "kyoto-japanese-white",
    name: "كيوتو الأبيض",
    shortDescription: "قماش ياباني بلمعة هادئة وملمس مصقول.",
    description: "نسيج ياباني بكثافة خيوط عالية يمنح الثوب بياضًا نقيًا ولمعة خفيفة لا تُرى إلا تحت الضوء.",
    price: 34500,
    categoryIds: ["c-fabrics", "c-japanese", "c-luxury"],
    images: [img("japanese-white", "قماش كيوتو الياباني الأبيض")],
    fabric: { type: "ساتان ياباني", material: "بوليستر ياباني عالي الكثافة", texture: "مصقول بلمعة هادئة", season: "كل المواسم", color: "أبيض ثلجي", width: "152 سم", origin: "اليابان" },
    rating: { average: 5, count: 168 },
    isBestSeller: true,
    tags: ["ياباني", "أبيض", "فاخر", "يابانية"],
  }),
  fabric({
    id: "p-charcoal-wool",
    slug: "charcoal-winter-wool",
    name: "صوف فحمي",
    shortDescription: "مزيج صوف شتوي بحضور ثقيل ودافئ.",
    description: "قماش شتوي من مزيج الصوف يمنح دفئًا متوازنًا دون ثقل مزعج، بلون فحمي عميق.",
    price: 42000,
    compareAtPrice: 48000,
    categoryIds: ["c-fabrics", "c-winter", "c-luxury"],
    images: [img("winter-charcoal", "قماش صوف شتوي فحمي")],
    fabric: { type: "صوف ممزوج", material: "صوف 60% وبوليستر 40%", texture: "دافئ ومتماسك", season: "شتوي", color: "فحمي", width: "150 سم", origin: "إيطاليا" },
    rating: { average: 4.8, count: 96 },
    isBestSeller: true,
    tags: ["شتوي", "صوف", "رمادي"],
  }),
  fabric({
    id: "p-sand-cotton",
    slug: "sand-pure-cotton",
    name: "قطن رملي",
    shortDescription: "قطن طبيعي بلون رملي هادئ.",
    description: "قطن طبيعي ناعم على البشرة، مثالي للاستخدام اليومي في الأجواء الحارة.",
    price: 15900,
    categoryIds: ["c-fabrics", "c-cotton", "c-daily"],
    images: [img("cotton-sand", "قماش قطني رملي")],
    fabric: { type: "قطن مغزول", material: "قطن 100%", texture: "طبيعي ومريح", season: "صيفي", color: "رملي", width: "145 سم", origin: "مصر" },
    rating: { average: 4.7, count: 132 },
    isBestSeller: true,
    tags: ["قطن", "يومي", "بيج"],
  }),
  fabric({
    id: "p-midnight-navy",
    slug: "midnight-navy-luxury",
    name: "كحلي منتصف الليل",
    shortDescription: "قماش فاخر بلون كحلي عميق.",
    description: "خامة فاخرة للمناسبات المسائية، بلون كحلي يقترب من الأسود في الإضاءة الخافتة.",
    price: 38900,
    categoryIds: ["c-fabrics", "c-luxury", "c-winter"],
    images: [img("luxury-navy", "قماش كحلي فاخر")],
    fabric: { type: "تويل فاخر", material: "صوف ممزوج", texture: "كثيف وناعم", season: "شتوي", color: "كحلي", width: "150 سم", origin: "إيطاليا" },
    rating: { average: 4.9, count: 71 },
  }),
  fabric({
    id: "p-stone-daily",
    slug: "stone-grey-daily",
    name: "رمادي حجري",
    shortDescription: "قماش يومي عملي بلون رمادي متوازن.",
    description: "قماش يومي يقاوم التجعد ويحافظ على أناقته من الصباح حتى المساء.",
    price: 13900,
    compareAtPrice: 16900,
    categoryIds: ["c-fabrics", "c-daily"],
    images: [img("daily-grey", "قماش رمادي يومي")],
    fabric: { type: "بوبلين", material: "بوليستر وقطن", texture: "عملي ومقاوم للتجعد", season: "كل المواسم", color: "رمادي حجري", width: "150 سم" },
    rating: { average: 4.6, count: 88 },
  }),
  fabric({
    id: "p-oud-brown",
    slug: "oud-brown-winter",
    name: "بني العود",
    shortDescription: "قماش شتوي بلون بني دافئ.",
    description: "لون مستوحى من خشب العود، بنسيج شتوي متماسك يناسب أمسيات الشتاء.",
    price: 36900,
    categoryIds: ["c-fabrics", "c-winter"],
    images: [img("winter-brown", "قماش شتوي بني")],
    fabric: { type: "صوف ممزوج", material: "صوف 50% وفسكوز 50%", texture: "دافئ بملمس مخملي", season: "شتوي", color: "بني", width: "150 سم" },
    rating: { average: 4.8, count: 54 },
  }),
  fabric({
    id: "p-noir-silk",
    slug: "noir-silk-touch",
    name: "نوار",
    shortDescription: "قماش أسود بلمسة حريرية.",
    description: "أسود عميق بلمسة حريرية وانسدال انسيابي. حضور هادئ لا يحتاج إلى كلام.",
    price: 45900,
    categoryIds: ["c-fabrics", "c-luxury"],
    images: [img("black-silk", "قماش أسود بلمسة حريرية")],
    fabric: { type: "ساتان", material: "فسكوز وحرير", texture: "حريري انسيابي", season: "كل المواسم", color: "أسود", width: "140 سم", origin: "اليابان" },
    rating: { average: 5, count: 39 },
    tags: ["أسود", "حرير", "ياباني"],
  }),
];

export const collections: Collection[] = [
  { id: "col-summer", slug: "summer", title: "الصيفي", subtitle: "خفة تتنفس", href: "/categories/summer-fabrics", image: img("summer-ivory", "مجموعة الأقمشة الصيفية"), sortOrder: 1 },
  { id: "col-winter", slug: "winter", title: "الشتوي", subtitle: "دفء بحضور", href: "/categories/winter-fabrics", image: img("winter-charcoal", "مجموعة الأقمشة الشتوية"), sortOrder: 2 },
  { id: "col-japanese", slug: "japanese", title: "الياباني", subtitle: "دقة النسيج", href: "/categories/japanese-fabrics", image: img("japanese-white", "مجموعة الأقمشة اليابانية"), sortOrder: 3 },
  { id: "col-cotton", slug: "cotton", title: "القطني", subtitle: "راحة طبيعية", href: "/categories/cotton-fabrics", image: img("cotton-sand", "مجموعة الأقمشة القطنية"), sortOrder: 4 },
  { id: "col-best", slug: "best-sellers", title: "الأكثر مبيعًا", subtitle: "اختيار عملائنا", href: "/categories/fabrics?sort=best", image: img("luxury-navy", "الأقمشة الأكثر مبيعًا"), sortOrder: 5 },
];

export const offers: Offer[] = [
  { id: "o-summer-pair", label: "بكج الصيف", title: "قطعتان من الصيفي", description: "قماشان صيفيان من اختيارك بقيمة أفضل.", href: "/offers/summer-pair", price: 32900, compareAtPrice: 37800, image: img("summer-ivory", "بكج قماشين صيفيين") },
  { id: "o-winter-set", label: "إطلالة الشتاء", title: "قماش شتوي وشماغ", description: "قماش صوف مع شماغ شتوي مطابق.", href: "/offers/winter-set", price: 49900, compareAtPrice: 57500, image: img("winter-brown", "بكج إطلالة الشتاء") },
  { id: "o-japanese-trio", label: "الثلاثية اليابانية", title: "ثلاثة أقمشة يابانية", description: "للخزانة الكاملة لموسم كامل.", href: "/offers/japanese-trio", price: 89900, compareAtPrice: 103500, image: img("japanese-white", "ثلاثة أقمشة يابانية") },
];

export const reviews: Review[] = [
  { id: "r1", author: "عبدالله الحربي", city: "الرياض", rating: 5, body: "القماش الياباني أفضل مما توقعت. اللمعة هادئة والخياط أثنى على جودته.", createdAt: "2026-08-12", verified: true },
  { id: "r2", author: "فيصل القحطاني", city: "جدة", rating: 5, body: "التغليف وحده يكفي ليعطيك انطباع الفخامة. والتوصيل كان في يومين.", createdAt: "2026-08-30", verified: true },
  { id: "r3", author: "سلطان العتيبي", city: "الدمام", rating: 5, body: "طلبت بوكس هدية لوالدي، وكانت التفاصيل مرتبة بعناية. تجربة تستحق.", createdAt: "2026-09-14", verified: true },
  { id: "r4", author: "ماجد الشهري", city: "أبها", rating: 4, body: "الصوف الفحمي دافئ وثقيل بالشكل الصحيح. سأعود للموسم القادم.", createdAt: "2026-09-21", verified: true },
];

export const homepage: HomepageContent = {
  hero: {
    eyebrow: "دار أقمشة رجالية سعودية",
    title: "الشيوخ",
    tagline: "فخامة تلبسها.",
    body: "أقمشة رجالية مختارة بعناية، لتصنع إطلالة تليق بك.",
    primaryCta: { label: "اكتشف الأقمشة", href: "/categories/fabrics" },
    secondaryCta: { label: "تسوق الآن", href: "/categories/summer-fabrics" },
    image: { src: "/media/hero-drape.webp", alt: "قماش رجالي أسود فاخر منسدل", width: 2400, height: 1500 },
  },
  fabricDetail: {
    title: "تفاصيل تحكي الفخامة",
    body: "اقترب من القماش كما تقترب منه في الدار. مرّر المؤشر على الصورة لترى النسيج خيطًا خيطًا.",
    image: { src: "/media/japanese-white-macro.webp", alt: "صورة مقرّبة لنسيج قماش ياباني أبيض", width: 1200, height: 1200 },
    points: [
      { label: "النسيج", text: "خيوط متقاربة بكثافة عالية تمنح سطحًا متساويًا." },
      { label: "الخامة", text: "ألياف مختارة تحافظ على البياض والانسدال." },
      { label: "الملمس", text: "ناعم ومصقول، بارد على البشرة في الصيف." },
      { label: "اللون", text: "أبيض ثلجي ثابت لا يصفرّ مع الغسيل." },
    ],
  },
  boxes: {
    title: "بوكسات الشيوخ",
    subtitle: "هديتك تبدأ من التفاصيل.",
    body: "قماش مختار، وشماغ، وعطر، ولمسة عود. في صندوق يُفتح على مهل.",
    href: "/categories/boxes",
    priceFrom: 59900,
  },
};
