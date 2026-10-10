/** Public shipping rules (safe to ship to the client). Amounts in halalas. */

export const CITIES = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "الظهران", "الأحساء",
  "الطائف", "تبوك", "بريدة", "عنيزة", "حائل", "أبها", "خميس مشيط", "جازان", "نجران", "الباحة",
  "الجبيل", "ينبع", "القطيف", "سكاكا", "عرعر", "حفر الباطن",
] as const;
export type City = (typeof CITIES)[number];

const EXPRESS_CITIES = new Set<string>(["الرياض", "جدة", "الدمام", "الخبر", "الظهران"]);

export type ShippingMethodId = "standard" | "express";

export const FREE_SHIPPING_THRESHOLD = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 500) * 100;
const STANDARD_FEE = 2500;
const EXPRESS_FEE = 4500;

export type ShippingOption = { id: ShippingMethodId; label: string; eta: string; fee: number; available: boolean };

/** Standard is free above the threshold; express is a flat fee in major cities only. */
export function shippingOptions(city: string | undefined, merchandiseTotal: number): ShippingOption[] {
  return [
    { id: "standard", label: "توصيل عادي", eta: "2–4 أيام عمل", fee: merchandiseTotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_FEE, available: true },
    { id: "express", label: "توصيل سريع", eta: "خلال 24 ساعة", fee: EXPRESS_FEE, available: !!city && EXPRESS_CITIES.has(city) },
  ];
}

export function shippingFee(method: ShippingMethodId, city: string | undefined, merchandiseTotal: number) {
  const opt = shippingOptions(city, merchandiseTotal).find((o) => o.id === method);
  return opt && opt.available ? opt.fee : null;
}
