"use client";

import { track } from "@/lib/analytics/track";
import { createStore } from "./create-store";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  /** Display price only — the server recalculates every price at checkout. */
  unitPrice: number;
  unitLabel?: string;
  quantity: number;
};

type CartState = { lines: CartLine[] };

export const cartStore = createStore<CartState>({ lines: [] }, { persistKey: "alshuyukh.cart.v1" });

const MAX_QTY = 20;
const toItem = (l: CartLine, quantity = l.quantity) => ({ item_id: l.productId, item_name: l.name, price: l.unitPrice / 100, quantity });

export const cart = {
  add(line: Omit<CartLine, "quantity">, quantity = 1) {
    cartStore.set((s) => {
      const existing = s.lines.find((l) => l.productId === line.productId);
      const lines = existing
        ? s.lines.map((l) => (l.productId === line.productId ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + quantity) } : l))
        : [...s.lines, { ...line, quantity: Math.min(MAX_QTY, quantity) }];
      return { lines };
    });
    track("add_to_cart", { currency: "SAR", value: (line.unitPrice * quantity) / 100, items: [toItem({ ...line, quantity }, quantity)] });
    ui.set((u) => ({ ...u, cartOpen: true }));
  },
  setQuantity(productId: string, quantity: number) {
    if (quantity <= 0) return cart.remove(productId);
    cartStore.set((s) => ({ lines: s.lines.map((l) => (l.productId === productId ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l)) }));
  },
  remove(productId: string) {
    const line = cartStore.get().lines.find((l) => l.productId === productId);
    cartStore.set((s) => ({ lines: s.lines.filter((l) => l.productId !== productId) }));
    if (line) track("remove_from_cart", { currency: "SAR", value: (line.unitPrice * line.quantity) / 100, items: [toItem(line)] });
  },
};

export const cartTotals = (lines: CartLine[]) => ({
  count: lines.reduce((n, l) => n + l.quantity, 0),
  subtotal: lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0),
});

/* UI overlays share one store so only one can be open at a time. */
type UiState = { cartOpen: boolean; searchOpen: boolean; menuOpen: boolean };
export const ui = createStore<UiState>({ cartOpen: false, searchOpen: false, menuOpen: false });
export const openOverlay = (key: keyof UiState) => ui.set({ cartOpen: false, searchOpen: false, menuOpen: false, [key]: true });
export const closeOverlays = () => ui.set({ cartOpen: false, searchOpen: false, menuOpen: false });

/* Wishlist */
export const wishlistStore = createStore<{ ids: string[] }>({ ids: [] }, { persistKey: "alshuyukh.wishlist.v1" });
export const toggleWishlist = (item: { id: string; name: string; price: number }) => {
  const has = wishlistStore.get().ids.includes(item.id);
  wishlistStore.set((s) => ({ ids: has ? s.ids.filter((i) => i !== item.id) : [...s.ids, item.id] }));
  if (!has) track("wishlist_add", { currency: "SAR", value: item.price / 100, items: [{ item_id: item.id, item_name: item.name, price: item.price / 100 }] });
};
