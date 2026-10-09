"use client";

import type { AnalyticsEventMap, AnalyticsEventName } from "./events";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, payload?: Record<string, unknown>) => void };
  }
}

/** GA4 recommended names differ from ours for two events; Meta/TikTok use their own standard names. */
const ga4Name: Partial<Record<AnalyticsEventName, string>> = {
  view_category: "view_item_list",
  select_product: "select_item",
  wishlist_add: "add_to_wishlist",
};
const metaName: Partial<Record<AnalyticsEventName, string>> = {
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  add_payment_info: "AddPaymentInfo",
  purchase: "Purchase",
  search: "Search",
  wishlist_add: "AddToWishlist",
};
const tiktokName: Partial<Record<AnalyticsEventName, string>> = {
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  add_payment_info: "AddPaymentInfo",
  purchase: "CompletePayment",
  search: "Search",
  wishlist_add: "AddToWishlist",
};

/**
 * Single entry point for analytics. Pushes to the GTM dataLayer (which
 * fans out to GA4) and calls Meta/TikTok pixels directly when present.
 * Safe to call before any provider loads; it never throws.
 */
export function track<E extends AnalyticsEventName>(event: E, payload: AnalyticsEventMap[E]) {
  if (typeof window === "undefined") return;
  try {
    const p = payload as Record<string, unknown>;
    window.dataLayer = window.dataLayer ?? [];
    if ("items" in p) window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({ event: ga4Name[event] ?? event, app_event: event, ecommerce: "items" in p ? p : undefined, ...("items" in p ? {} : p) });

    const m = metaName[event];
    if (m && window.fbq) {
      const items = (p.items as { item_id: string }[] | undefined) ?? [];
      window.fbq("track", m, { currency: p.currency, value: p.value, content_ids: items.map((i) => i.item_id), content_type: "product", search_string: p.search_term });
    }
    const t = tiktokName[event];
    if (t && window.ttq) window.ttq.track(t, { currency: p.currency, value: p.value, query: p.search_term });

    if (process.env.NODE_ENV === "development") console.debug("[analytics]", event, payload);
  } catch {
    /* analytics must never break the store */
  }
}
