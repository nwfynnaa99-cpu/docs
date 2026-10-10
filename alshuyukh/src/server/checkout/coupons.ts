import "server-only";
import { docs } from "@/server/db/docs";
import type { Coupon } from "@/server/catalog/types";

/** Coupons are managed in the admin (/admin/coupons). */
export function evaluateCoupon(code: string | undefined, subtotal: number): { ok: true; code: string; discount: number; label: string } | { ok: false; message: string } | null {
  if (!code) return null;
  const c = docs.get<Coupon>("coupon", code.trim().toUpperCase());
  if (!c || !c.active || (c.expiresAt && new Date(c.expiresAt) < new Date())) return { ok: false, message: "رمز الخصم غير صحيح أو منتهي" };
  if (c.minSubtotal && subtotal < c.minSubtotal) return { ok: false, message: `هذا الرمز للطلبات من ${c.minSubtotal / 100} ر.س` };
  const discount = c.percent ? Math.round((subtotal * c.percent) / 100) : (c.amount ?? 0);
  return { ok: true, code: c.code, discount, label: c.label };
}
