/**
 * Typed e-commerce event catalogue. Names and item shape follow the GA4
 * e-commerce schema so GTM can forward them to GA4, Meta Pixel, and TikTok
 * Pixel without remapping in the app.
 */
export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price: number; // SAR, major units
  quantity?: number;
  discount?: number;
  index?: number;
};

type Commerce = { currency: "SAR"; value: number; items: AnalyticsItem[] };

export type AnalyticsEventMap = {
  view_item: Commerce;
  add_to_cart: Commerce;
  remove_from_cart: Commerce;
  begin_checkout: Commerce & { coupon?: string };
  add_payment_info: Commerce & { payment_type: string };
  purchase: Commerce & { transaction_id: string; shipping?: number; tax?: number; coupon?: string };
  search: { search_term: string };
  view_category: { item_list_id: string; item_list_name: string; items?: AnalyticsItem[] };
  select_product: { item_list_id?: string; item_list_name?: string; items: AnalyticsItem[] };
  wishlist_add: Commerce;
};

export type AnalyticsEventName = keyof AnalyticsEventMap;
