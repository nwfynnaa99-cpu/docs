/** Zod-free checkout helpers that the browser bundle can import cheaply. */

/** Normalizes Saudi mobile numbers to 05XXXXXXXX. Accepts +9665…, 9665…, 05…, 5…, and Arabic-Indic digits. */
export function normalizeSaudiMobile(input: string) {
  const digits = input
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[^\d]/g, "");
  const local = digits.replace(/^(00966|966)/, "").replace(/^0/, "");
  return /^5\d{8}$/.test(local) ? `0${local}` : null;
}

export const PAYMENT_METHODS = [
  { id: "applepay", label: "Apple Pay", note: "ادفع بلمسة" },
  { id: "mada", label: "مدى", note: "بطاقة مدى البنكية" },
  { id: "card", label: "Visa / Mastercard", note: "بطاقة ائتمانية" },
  { id: "tamara", label: "تمارا", note: "قسّمها على 4 دفعات بدون فوائد" },
] as const;
export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];
