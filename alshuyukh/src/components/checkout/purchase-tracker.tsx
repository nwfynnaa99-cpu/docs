"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";
import { cartStore } from "@/lib/store/cart";
import type { AnalyticsItem } from "@/lib/analytics/events";

/** Fires `purchase` once per order (reloads don't double count) and empties the cart. */
export function PurchaseTracker({ order }: { order: { id: string; total: number; shipping: number; tax: number; coupon?: string; items: AnalyticsItem[] } }) {
  useEffect(() => {
    const key = `alshuyukh.purchase.${order.id}`;
    try {
      if (window.localStorage.getItem(key)) return;
      window.localStorage.setItem(key, "1");
    } catch {
      /* storage blocked: still track once per page load */
    }
    track("purchase", { currency: "SAR", transaction_id: order.id, value: order.total / 100, shipping: order.shipping / 100, tax: order.tax / 100, coupon: order.coupon, items: order.items });
    cartStore.set({ lines: [] });
  }, [order]);
  return null;
}
