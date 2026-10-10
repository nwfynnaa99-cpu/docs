"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/session";
import { audit } from "@/server/auth/audit";
import { docs } from "@/server/db/docs";
import type { Coupon } from "@/server/catalog/types";
import { done, fail, fieldErrors, toHalalas, type FormState } from "@/lib/admin/form";

const Input = z
  .object({
    code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{3,20}$/, "3–20 حرفًا إنجليزيًا أو رقمًا"),
    label: z.string().trim().min(3, "اكتب وصفًا يراه العميل").max(80),
    kind: z.enum(["percent", "amount"]),
    value: z.number({ message: "اكتب القيمة" }).positive("القيمة يجب أن تكون أكبر من صفر"),
    minSubtotal: z.number().int().min(0).optional(),
    expiresAt: z.string().optional(),
  })
  .refine((c) => c.kind !== "percent" || c.value <= 90, { message: "النسبة القصوى 90%", path: ["value"] });

export async function createCoupon(_: FormState, data: FormData): Promise<FormState> {
  const user = await requireAdmin("catalog");
  const kind = String(data.get("kind"));
  const parsed = Input.safeParse({
    code: data.get("code"), label: data.get("label"), kind,
    value: kind === "percent" ? Number(data.get("value")) : toHalalas(data.get("value")),
    minSubtotal: toHalalas(data.get("minSubtotal")),
    expiresAt: String(data.get("expiresAt") ?? "") || undefined,
  });
  if (!parsed.success) return fail("راجع الحقول", fieldErrors(parsed.error));
  const c = parsed.data;
  if (docs.get("coupon", c.code)) return fail("الرمز موجود", { code: "الرمز موجود مسبقًا" });
  const coupon: Coupon = {
    id: c.code, code: c.code, label: c.label, active: true,
    ...(c.kind === "percent" ? { percent: Math.round(c.value) } : { amount: Math.round(c.value) }),
    minSubtotal: c.minSubtotal || undefined,
    expiresAt: c.expiresAt ? new Date(`${c.expiresAt}T23:59:59+03:00`).toISOString() : undefined,
  };
  docs.put("coupon", coupon, { sort: docs.list("coupon").length });
  audit(user, "create", "coupon", coupon.id, coupon.label);
  revalidatePath("/admin/coupons");
  return done("أُضيف الرمز");
}

export async function toggleCoupon(code: string, _s?: FormState, _d?: FormData): Promise<FormState> {
  const user = await requireAdmin("catalog");
  const c = docs.get<Coupon>("coupon", code);
  if (!c) return fail("غير موجود");
  c.active = !c.active;
  docs.put("coupon", c);
  audit(user, c.active ? "activate" : "deactivate", "coupon", code);
  revalidatePath("/admin/coupons");
  return done(c.active ? "مفعّل" : "موقوف");
}

export async function deleteCoupon(code: string, _s?: FormState, _d?: FormData): Promise<FormState> {
  const user = await requireAdmin("catalog");
  docs.remove("coupon", code);
  audit(user, "delete", "coupon", code);
  revalidatePath("/admin/coupons");
  return done("حُذف");
}
