import assert from "node:assert/strict";
import { test } from "node:test";
import { computeTotals } from "./totals.ts";
import { shippingFee, shippingOptions } from "./shipping.ts";
import { normalizeSaudiMobile } from "./fields.ts";

test("totals include VAT and clamp discount", () => {
  const t = computeTotals([{ productId: "a", name: "a", unitPrice: 34500, quantity: 4 }], { discount: 13800, shipping: 0 });
  assert.equal(t.subtotal, 138000);
  assert.equal(t.total, 124200);
  assert.equal(t.vatIncluded, Math.round(124200 - 124200 / 1.15));
  assert.equal(computeTotals([{ productId: "a", name: "a", unitPrice: 100, quantity: 1 }], { discount: 999 }).discount, 100);
});

test("standard shipping is free above the threshold", () => {
  assert.equal(shippingFee("standard", "الرياض", 49900), 2500);
  assert.equal(shippingFee("standard", "الرياض", 50000), 0);
});

test("express only in major cities", () => {
  assert.equal(shippingFee("express", "الرياض", 10000), 4500);
  assert.equal(shippingFee("express", "تبوك", 10000), null);
  assert.equal(shippingOptions("تبوك", 0).find((o) => o.id === "express")?.available, false);
});

test("saudi mobile normalization", () => {
  assert.equal(normalizeSaudiMobile("+966 55 123 4567"), "0551234567");
  assert.equal(normalizeSaudiMobile("0551234567"), "0551234567");
  assert.equal(normalizeSaudiMobile("٠٥٥١٢٣٤٥٦٧"), "0551234567");
  assert.equal(normalizeSaudiMobile("551234567"), "0551234567");
  assert.equal(normalizeSaudiMobile("0451234567"), null);
  assert.equal(normalizeSaudiMobile("05512345"), null);
});
