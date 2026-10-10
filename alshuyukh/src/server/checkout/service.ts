import "server-only";
import { randomInt } from "node:crypto";
import { catalog } from "@/server/catalog";
import { orders, type Order } from "@/server/orders";
import { computeTotals } from "@/lib/checkout/totals";
import { shippingFee } from "@/lib/checkout/shipping";
import type { CheckoutData } from "@/lib/checkout/validation";
import { evaluateCoupon } from "./coupons";

export class CheckoutError extends Error {
  constructor(public code: string, message: string, public field?: string) {
    super(message);
  }
}

const unitLabel = { meter: "متر", piece: "قطعة", set: "طقم" } as const;
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/O/1/I/L for phone support

const newOrderId = () => `SH-${Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("")}`;

/** Re-prices every line from the catalog. Client-sent prices are never used. */
export async function priceCart(lines: CheckoutData["lines"]) {
  const merged = new Map<string, number>();
  for (const l of lines) merged.set(l.productId, Math.min(20, (merged.get(l.productId) ?? 0) + l.quantity));
  const all = await catalog.listProducts();
  return [...merged].map(([productId, quantity]) => {
    const p = all.find((x) => x.id === productId);
    if (!p) throw new CheckoutError("unknown_product", "أحد المنتجات لم يعد متوفرًا. حدّث السلة وحاول مجددًا.");
    if (p.inventory < quantity) throw new CheckoutError("out_of_stock", `الكمية المتاحة من «${p.name}» لا تكفي.`);
    return { productId: p.id, slug: p.slug, name: p.name, image: p.images[0]?.src ?? "", unitPrice: p.price, quantity, unitLabel: unitLabel[p.unit] };
  });
}

export async function quote(data: Pick<CheckoutData, "lines" | "coupon" | "shippingMethod"> & { city?: string }) {
  const lines = await priceCart(data.lines);
  const base = computeTotals(lines);
  const coupon = evaluateCoupon(data.coupon, base.subtotal);
  const discount = coupon?.ok ? coupon.discount : 0;
  const fee = shippingFee(data.shippingMethod, data.city, base.subtotal - discount);
  return { lines, coupon, totals: computeTotals(lines, { discount, shipping: fee ?? 0 }), shippingAvailable: fee !== null };
}

export async function placeOrder(data: CheckoutData): Promise<Order> {
  // Double-submit / retry safety: the same key always returns the same order.
  const existing = await orders.findByIdempotencyKey(data.idempotencyKey);
  if (existing) return existing;

  const q = await quote({ lines: data.lines, coupon: data.coupon, shippingMethod: data.shippingMethod, city: data.address.city });
  if (!q.shippingAvailable) throw new CheckoutError("shipping_unavailable", "التوصيل السريع غير متاح في هذه المدينة.", "shippingMethod");
  if (q.coupon && !q.coupon.ok) throw new CheckoutError("invalid_coupon", q.coupon.message, "coupon");

  const now = new Date().toISOString();
  const order: Order = {
    id: newOrderId(),
    idempotencyKey: data.idempotencyKey,
    status: "pending_payment",
    createdAt: now,
    updatedAt: now,
    contact: { name: data.contact.name, phone: data.contact.phone, email: data.contact.email || undefined },
    address: { ...data.address, shortAddress: data.address.shortAddress || undefined, notes: data.address.notes || undefined },
    shippingMethod: data.shippingMethod,
    paymentMethod: data.paymentMethod,
    coupon: q.coupon?.ok ? q.coupon.code : undefined,
    lines: q.lines,
    totals: q.totals,
  };
  return orders.create(order);
}
