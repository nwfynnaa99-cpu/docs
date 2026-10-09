import { normalizeArabic, stemArabic } from "@/lib/arabic";
import type { CatalogRepository } from "./repository";
import { categories, collections, homepage, offers, products, reviews } from "./seed";
import type { Product } from "./types";

const byCategorySlug = (slug: string) => categories.find((c) => c.slug === slug);

const haystack = (p: Product) =>
  normalizeArabic(
    [p.name, p.shortDescription, p.tags.join(" "), p.fabric ? Object.values(p.fabric).join(" ") : "",
      p.categoryIds.map((id) => categories.find((c) => c.id === id)?.name ?? "").join(" ")].join(" "),
  );

const score = (p: Product, terms: string[]) => {
  const text = haystack(p);
  const name = normalizeArabic(p.name);
  let s = 0;
  for (const t of terms) {
    if (!text.includes(t)) return 0;
    s += name.includes(t) ? 3 : 1;
  }
  return s + (p.isBestSeller ? 0.5 : 0);
};

export const seedRepository: CatalogRepository = {
  async listCategories() {
    return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async getCategory(slug) {
    return byCategorySlug(slug) ?? null;
  },
  async listProducts(filter = {}) {
    let list = products;
    if (filter.categorySlug) {
      const cat = byCategorySlug(filter.categorySlug);
      list = cat ? list.filter((p) => p.categoryIds.includes(cat.id)) : [];
    }
    if (filter.bestSeller) list = list.filter((p) => p.isBestSeller);
    return filter.limit ? list.slice(0, filter.limit) : list;
  },
  async getProduct(slug) {
    return products.find((p) => p.slug === slug) ?? null;
  },
  async searchProducts(query, limit = 8) {
    const terms = normalizeArabic(query).split(" ").filter(Boolean).map(stemArabic);
    if (!terms.length) return [];
    return products
      .map((p) => ({ p, s: score(p, terms) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, limit)
      .map((x) => x.p);
  },
  async listCollections() {
    return [...collections].sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async listOffers() {
    return offers;
  },
  async listReviews(filter = {}) {
    const list = filter.productId ? reviews.filter((r) => r.productId === filter.productId) : reviews;
    return filter.limit ? list.slice(0, filter.limit) : list;
  },
  async getHomepage() {
    return homepage;
  },
};
