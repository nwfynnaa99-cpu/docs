export const site = {
  name: "الشيوخ",
  nameLatin: "ALSHUYUKH",
  tagline: "فخامة تلبسها.",
  description:
    "الشيوخ دار أقمشة رجالية سعودية فاخرة. أقمشة صيفية وشتوية ويابانية مختارة بعناية، ومستلزمات الإطلالة الرجالية من الشماغ والعقال إلى العود والهدايا.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "ar_SA",
  currency: "SAR",
  freeShippingThreshold: Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 500),
  contact: { phone: "+966500000000", email: "care@alshuyukh.sa", whatsapp: "966500000000" },
  social: {
    instagram: "https://instagram.com/alshuyukh",
    x: "https://x.com/alshuyukh",
    tiktok: "https://tiktok.com/@alshuyukh",
    snapchat: "https://snapchat.com/add/alshuyukh",
  },
} as const;

export type NavItem = { label: string; href: string; children?: NavItem[] };

export const mainNav: NavItem[] = [
  { label: "الرئيسية", href: "/" },
  {
    label: "الأقمشة",
    href: "/categories/fabrics",
    children: [
      { label: "أقمشة صيفية", href: "/categories/summer-fabrics" },
      { label: "أقمشة شتوية", href: "/categories/winter-fabrics" },
      { label: "أقمشة يابانية", href: "/categories/japanese-fabrics" },
      { label: "أقمشة قطنية", href: "/categories/cotton-fabrics" },
      { label: "أقمشة فاخرة", href: "/categories/luxury-fabrics" },
      { label: "أقمشة يومية", href: "/categories/daily-fabrics" },
    ],
  },
  { label: "الثياب", href: "/categories/thobes" },
  { label: "العروض", href: "/offers" },
  { label: "البوكسات", href: "/categories/boxes" },
  {
    label: "مستلزمات الإطلالة",
    href: "/categories/accessories",
    children: [
      { label: "شماغ", href: "/categories/shemagh" },
      { label: "عقال", href: "/categories/agal" },
      { label: "سديري", href: "/categories/sedairi" },
      { label: "سبحة", href: "/categories/misbaha" },
      { label: "عطور", href: "/categories/perfumes" },
      { label: "عود وبخور", href: "/categories/oud-bakhoor" },
      { label: "هدايا", href: "/categories/gifts" },
    ],
  },
];

export const policyNav: NavItem[] = [
  { label: "الشحن والتوصيل", href: "/policies/shipping" },
  { label: "الاسترجاع", href: "/policies/returns" },
  { label: "الاستبدال", href: "/policies/exchange" },
  { label: "سياسة الخصوصية", href: "/policies/privacy" },
  { label: "الشروط والأحكام", href: "/policies/terms" },
];
