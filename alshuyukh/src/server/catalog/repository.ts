import type { Category, Collection, HomepageContent, Offer, Product, Review } from "./types";

/**
 * Storage-agnostic catalog contract. UI code depends only on this
 * interface. The seed implementation backs development; the CMS phase
 * adds a database implementation behind the same contract.
 */
export interface CatalogRepository {
  listCategories(): Promise<Category[]>;
  getCategory(slug: string): Promise<Category | null>;
  listProducts(filter?: { categorySlug?: string; bestSeller?: boolean; limit?: number }): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | null>;
  searchProducts(query: string, limit?: number): Promise<Product[]>;
  listCollections(): Promise<Collection[]>;
  listOffers(): Promise<Offer[]>;
  listReviews(filter?: { productId?: string; limit?: number }): Promise<Review[]>;
  getHomepage(): Promise<HomepageContent>;
}
