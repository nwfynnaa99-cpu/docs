/** Pure order math shared by the checkout UI (display) and the server (authoritative). */

export const VAT_RATE = 0.15;

export type PricedLine = { productId: string; name: string; unitPrice: number; quantity: number };

export type Totals = {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  /** VAT already included in `total` (Saudi prices are VAT-inclusive). */
  vatIncluded: number;
};

export function computeTotals(lines: PricedLine[], { discount = 0, shipping = 0 }: { discount?: number; shipping?: number } = {}): Totals {
  const subtotal = lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0);
  const d = Math.min(Math.max(0, Math.round(discount)), subtotal);
  const total = subtotal - d + shipping;
  return { subtotal, discount: d, shipping, total, vatIncluded: Math.round(total - total / (1 + VAT_RATE)) };
}
