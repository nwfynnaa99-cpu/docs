/**
 * Pure listing logic shared by the server (building the lean listing DTO)
 * and the client (filtering and sorting in the browser). No React, no I/O.
 */

export type ListingItem = {
  id: string;
  name: string;
  price: number; // halalas
  compareAt?: number | null;
  rating: number;
  reviews: number;
  createdAt: string;
  bestSeller: boolean;
  inStock: boolean;
  season?: string;
  color?: string;
  origin?: string;
};

export const SORTS = [
  { id: "recommended", label: "المقترح" },
  { id: "newest", label: "الأحدث" },
  { id: "price-asc", label: "السعر: من الأقل" },
  { id: "price-desc", label: "السعر: من الأعلى" },
  { id: "rating", label: "الأعلى تقييمًا" },
] as const;
export type SortId = (typeof SORTS)[number]["id"];

export const PRICE_BUCKETS = [
  { id: "0-200", label: "أقل من 200 ر.س", min: 0, max: 20000 },
  { id: "200-400", label: "200 – 400 ر.س", min: 20000, max: 40000 },
  { id: "400-plus", label: "أكثر من 400 ر.س", min: 40000, max: Infinity },
] as const;

export const FACETS = [
  { key: "season", label: "الموسم" },
  { key: "color", label: "اللون" },
  { key: "origin", label: "المنشأ" },
] as const;
export type FacetKey = (typeof FACETS)[number]["key"];

export type ListingState = {
  season: string[];
  color: string[];
  origin: string[];
  price: string[];
  inStock: boolean;
  sort: SortId;
};

export const emptyState = (): ListingState => ({ season: [], color: [], origin: [], price: [], inStock: false, sort: "recommended" });

export const activeFilterCount = (s: ListingState) =>
  s.season.length + s.color.length + s.origin.length + s.price.length + (s.inStock ? 1 : 0);

const sortIds = new Set<string>(SORTS.map((x) => x.id));
// Older links use ?sort=best
const sortAliases: Record<string, SortId> = { best: "recommended", new: "newest" };

export function parseState(params: URLSearchParams): ListingState {
  const list = (k: string) => (params.get(k) ?? "").split(",").map((v) => v.trim()).filter(Boolean).slice(0, 20);
  const rawSort = params.get("sort") ?? "";
  const sort = (sortAliases[rawSort] ?? (sortIds.has(rawSort) ? rawSort : "recommended")) as SortId;
  return {
    season: list("season"),
    color: list("color"),
    origin: list("origin"),
    price: list("price").filter((p) => PRICE_BUCKETS.some((b) => b.id === p)),
    inStock: params.get("stock") === "1",
    sort,
  };
}

export function serializeState(s: ListingState): string {
  const p = new URLSearchParams();
  for (const k of ["season", "color", "origin", "price"] as const) if (s[k].length) p.set(k, s[k].join(","));
  if (s.inStock) p.set("stock", "1");
  if (s.sort !== "recommended") p.set("sort", s.sort);
  const q = p.toString();
  return q ? `?${q}` : "";
}

export function facetValues(items: ListingItem[]) {
  const out = {} as Record<FacetKey, { value: string; count: number }[]>;
  for (const { key } of FACETS) {
    const counts = new Map<string, number>();
    for (const i of items) if (i[key]) counts.set(i[key]!, (counts.get(i[key]!) ?? 0) + 1);
    out[key] = [...counts].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, "ar"));
  }
  return out;
}

const matches = (i: ListingItem, s: ListingState) =>
  (!s.season.length || (i.season && s.season.includes(i.season))) &&
  (!s.color.length || (i.color && s.color.includes(i.color))) &&
  (!s.origin.length || (i.origin && s.origin.includes(i.origin))) &&
  (!s.price.length || s.price.some((id) => {
    const b = PRICE_BUCKETS.find((x) => x.id === id);
    return b ? i.price >= b.min && i.price < b.max : false;
  })) &&
  (!s.inStock || i.inStock);

const comparators: Record<SortId, (a: ListingItem, b: ListingItem) => number> = {
  recommended: (a, b) => Number(b.inStock) - Number(a.inStock) || Number(b.bestSeller) - Number(a.bestSeller) || b.rating * Math.log1p(b.reviews) - a.rating * Math.log1p(a.reviews),
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
};

/** Returns matching item ids in display order. */
export function applyListing(items: ListingItem[], s: ListingState): string[] {
  return items.filter((i) => matches(i, s)).sort(comparators[s.sort]).map((i) => i.id);
}
