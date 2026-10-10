const sar = new Intl.NumberFormat("ar-SA-u-nu-latn", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

/** Formats halalas (integer minor units) as a SAR amount, e.g. 45900 → "459". */
export const formatAmount = (halalas: number) => sar.format(halalas / 100);

/**
 * Arabic count agreement: 1 → "منتج واحد", 2 → "منتجان", 3–10 → "3 منتجات",
 * 11+ → "11 منتجًا" (also 100+ with a tens/units remainder of 11+).
 */
export function countLabel(n: number, forms = { one: "منتج واحد", two: "منتجان", few: "منتجات", many: "منتجًا", zero: "لا منتجات" }) {
  if (n === 0) return forms.zero;
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  const r = n % 100;
  return r >= 3 && r <= 10 ? `${n} ${forms.few}` : `${n} ${forms.many}`;
}

export const discountPercent = (price: number, compareAt?: number | null) =>
  compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
