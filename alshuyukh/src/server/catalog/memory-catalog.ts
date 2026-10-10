import { normalizeArabic, stemArabic } from "@/lib/arabic";
import type { CatalogRepository } from "./repository";
import type { Category, Collection, HomepageContent, Offer, Product, Review } from "./types";

export type CatalogSnapshot = {
  categories: Category[];
  products: Product[];
  collections: Collection[];
  offers: Offer[];
  reviews: Review[];
  homepage: HomepageContent;
};

/**
 * Read logic over an in-memory snapshot (filtering, search, ordering).
 * `load` supplies the data: the seed arrays, or a fresh read from the database.
 */
export function memoryCatalog(load: () => CatalogSnapshot): CatalogRepository {
  const haystack = (p: Product, categories: Category[]) =>
    normalizeArabic(
      [p.name, p.shortDescription, p.tags.join(" "), p.fabric ? Object.values(p.fabric).join(" ") : "",
        p.categoryIds.map((id) => categories.find((c) => c.id === id)?.name ?? "").join(" ")].join(" "),
    );
  const score = (p: Product, terms: string[], categories: Category[]) => {
    const text = haystack(p, categories);
    const name = normalizeArabic(p.name);
    let s = 0;
    for (const t of terms) {
      if (!text.includes(t)) return 0;
      s += name.includes(t) ? 3 : 1;
    }
    return s + (p.isBestSeller ? 0.5 : 0);
  };
  // Storefront only sees approved reviews; seed reviews without the flag count as approved.
  const visible = (r: Review) => r.approved !== false;

  return {
    async listCategories() {
      return [...load().categories].sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async getCategory(slug) {
      return load().categories.find((c) => c.slug === slug) ?? null;
    },
    async listProducts(filter = {}) {
      const { categories, products } = load();
      let list = products;
      if (filter.categorySlug) {
        const cat = categories.find((c) => c.slug === filter.categorySlug);
        list = cat ? list.filter((p) => p.categoryIds.includes(cat.id)) : [];
      }
      if (filter.bestSeller) list = list.filter((p) => p.isBestSeller);
      return filter.limit ? list.slice(0, filter.limit) : list;
    },
    async getProduct(slug) {
      return load().products.find((p) => p.slug === slug) ?? null;
    },
    async searchProducts(query, limit = 8) {
      const terms = normalizeArabic(query).split(" ").filter(Boolean).map(stemArabic);
      if (!terms.length) return [];
      const { products, categories } = load();
      return products
        .map((p) => ({ p, s: score(p, terms, categories) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, limit)
        .map((x) => x.p);
    },
    async listCollections() {
      return [...load().collections].sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async listOffers() {
      return load().offers;
    },
    async listReviews(filter = {}) {
      let list = load().reviews.filter(visible);
      if (filter.productId) list = list.filter((r) => r.productId === filter.productId);
      if (filter.featured) list = list.filter((r) => r.featured);
      return filter.limit ? list.slice(0, filter.limit) : list;
    },
    async getHomepage() {
      return load().homepage;
    },
  };
}
