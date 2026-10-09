/** Catalog domain model. Money is stored in halalas (integer minor units of SAR). */

export type Media = { src: string; alt: string; width: number; height: number; macro?: string };

export type FabricSpec = {
  type: string; // نوع القماش
  material: string; // الخامة
  texture: string; // الملمس
  season: string; // الموسم
  color: string; // اللون
  width: string; // العرض
  origin?: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  parentId?: string;
  image?: Media;
  sortOrder: number;
};

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  shortDescription: string;
  description: string;
  categoryIds: string[];
  price: number;
  compareAtPrice?: number | null;
  unit: "piece" | "meter" | "set";
  rating: { average: number; count: number };
  images: Media[];
  fabric?: FabricSpec;
  /** Filterable attributes for products without a fabric spec (accessories, boxes). */
  attributes?: { color?: string; season?: string; origin?: string };
  tags: string[];
  inventory: number;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  createdAt: string;
};

export type Collection = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  href: string;
  image: Media;
  sortOrder: number;
};

export type Offer = {
  id: string;
  title: string;
  description: string;
  href: string;
  price: number;
  compareAtPrice: number;
  image: Media;
  label: string;
};

export type Review = {
  id: string;
  productId?: string;
  author: string;
  city?: string;
  rating: number;
  body: string;
  createdAt: string;
  verified: boolean;
};

export type HomepageContent = {
  hero: { eyebrow: string; title: string; tagline: string; body: string; primaryCta: { label: string; href: string }; secondaryCta: { label: string; href: string }; image: Media };
  fabricDetail: { title: string; body: string; image: Media; points: { label: string; text: string }[] };
  boxes: { title: string; subtitle: string; body: string; href: string; priceFrom: number };
};
