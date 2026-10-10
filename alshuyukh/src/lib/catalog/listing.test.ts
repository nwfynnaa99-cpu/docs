import assert from "node:assert/strict";
import { test } from "node:test";
import { applyListing, parseState, serializeState, emptyState, facetValues, type ListingItem } from "./listing.ts";
const items: ListingItem[] = [
  { id: "a", name: "a", price: 18900, rating: 4.9, reviews: 200, createdAt: "2026-01-01", bestSeller: true, inStock: true, season: "صيفي", color: "عاجي" },
  { id: "b", name: "b", price: 42000, rating: 4.8, reviews: 90, createdAt: "2026-03-01", bestSeller: false, inStock: true, season: "شتوي", color: "فحمي" },
  { id: "c", name: "c", price: 22900, rating: 5, reviews: 10, createdAt: "2026-02-01", bestSeller: false, inStock: false, color: "بني" },
];
test("price sort", () => assert.deepEqual(applyListing(items, { ...emptyState(), sort: "price-asc" }), ["a", "c", "b"]));
test("season filter", () => assert.deepEqual(applyListing(items, { ...emptyState(), season: ["شتوي"] }), ["b"]));
test("price bucket", () => assert.deepEqual(applyListing(items, { ...emptyState(), price: ["200-400"] }), ["c"]));
test("in stock + recommended puts sold-out last", () => { assert.deepEqual(applyListing(items, { ...emptyState(), inStock: true }), ["a", "b"]); assert.equal(applyListing(items, emptyState()).at(-1), "c"); });
test("url round-trip and alias", () => {
  const s = { ...emptyState(), season: ["صيفي"], price: ["0-200"], sort: "newest" as const, inStock: true };
  assert.deepEqual(parseState(new URLSearchParams(serializeState(s).slice(1))), s);
  assert.equal(parseState(new URLSearchParams("sort=best")).sort, "recommended");
  assert.deepEqual(parseState(new URLSearchParams("price=bogus,0-200")).price, ["0-200"]);
});
test("facets", () => assert.deepEqual(facetValues(items).season.map((f) => f.value).sort(), ["شتوي", "صيفي"].sort()));

import { countLabel } from "../format.ts";
test("arabic count agreement", () => {
  assert.equal(countLabel(1), "منتج واحد");
  assert.equal(countLabel(2), "منتجان");
  assert.equal(countLabel(8), "8 منتجات");
  assert.equal(countLabel(11), "11 منتجًا");
  assert.equal(countLabel(103), "103 منتجات");
});
