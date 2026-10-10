import "server-only";

/** Development coupons. Managed from the CMS in phase 6. */
type Coupon = { code: string; percent?: number; amount?: number; minSubtotal?: number; label: string };

const COUPONS: Coupon[] = [
  { code: "WELCOME10", percent: 10, label: "خصم 10% على أول طلب" },
  { code: "SHUYUKH50", amount: 5000, minSubtotal: 40000, label: "خصم 50 ر.س على الطلبات من 400 ر.س" },
];

export function evaluateCoupon(code: string | undefined, subtotal: number): { ok: true; code: string; discount: number; label: string } | { ok: false; message: string } | null {
  if (!code) return null;
  const c = COUPONS.find((x) => x.code === code.trim().toUpperCase());
  if (!c) return { ok: false, message: "رمز الخصم غير صحيح" };
  if (c.minSubtotal && subtotal < c.minSubtotal) return { ok: false, message: `هذا الرمز للطلبات من ${c.minSubtotal / 100} ر.س` };
  const discount = c.percent ? Math.round((subtotal * c.percent) / 100) : (c.amount ?? 0);
  return { ok: true, code: c.code, discount, label: c.label };
}
