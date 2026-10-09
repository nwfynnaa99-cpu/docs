const sar = new Intl.NumberFormat("ar-SA-u-nu-latn", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

/** Formats halalas (integer minor units) as a SAR amount, e.g. 45900 → "459". */
export const formatAmount = (halalas: number) => sar.format(halalas / 100);

export const discountPercent = (price: number, compareAt?: number | null) =>
  compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
