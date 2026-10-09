import type { Product } from "@/server/catalog";
import type { ListingItem } from "./listing";

export const toListingItem = (p: Product): ListingItem => ({
  id: p.id,
  name: p.name,
  price: p.price,
  compareAt: p.compareAtPrice ?? null,
  rating: p.rating.average,
  reviews: p.rating.count,
  createdAt: p.createdAt,
  bestSeller: !!p.isBestSeller,
  inStock: p.inventory > 0,
  season: p.fabric?.season ?? p.attributes?.season,
  color: p.fabric?.color ?? p.attributes?.color,
  origin: p.fabric?.origin ?? p.attributes?.origin,
});
