import { z } from "zod";
import { CITIES } from "./shipping.ts";
import { normalizeSaudiMobile } from "./fields.ts";

export { normalizeSaudiMobile, PAYMENT_METHODS, type PaymentMethodId } from "./fields.ts";

const text = (min: number, max: number, msg: string) =>
  z.string().trim().min(min, msg).max(max, "النص أطول من المسموح").refine((v) => !/[<>]/.test(v), "يحتوي على رموز غير مسموحة");

export const checkoutSchema = z.object({
  idempotencyKey: z.string().uuid(),
  contact: z.object({
    name: text(2, 60, "اكتب اسمك"),
    phone: z.string().transform((v, ctx) => {
      const n = normalizeSaudiMobile(v);
      if (!n) ctx.addIssue({ code: "custom", message: "رقم جوال سعودي غير صحيح (05XXXXXXXX)" });
      return n ?? "";
    }),
    email: z.union([z.literal(""), z.string().trim().email("بريد غير صحيح").max(120)]).optional(),
  }),
  address: z.object({
    city: z.enum(CITIES, { message: "اختر المدينة" }),
    district: text(2, 60, "اكتب الحي"),
    street: text(3, 160, "اكتب الشارع ورقم المبنى"),
    shortAddress: z.union([z.literal(""), z.string().trim().toUpperCase().regex(/^[A-Z]{4}\d{4}$/, "العنوان المختصر 4 حروف و4 أرقام، مثل RRRD2929")]).optional(),
    notes: z.string().trim().max(200).optional(),
  }),
  shippingMethod: z.enum(["standard", "express"]),
  paymentMethod: z.enum(["applepay", "mada", "card", "tamara"]),
  coupon: z.string().trim().toUpperCase().max(32).optional(),
  lines: z.array(z.object({ productId: z.string().min(1).max(64), quantity: z.number().int().min(1).max(20) })).min(1, "السلة فارغة").max(30),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutData = z.output<typeof checkoutSchema>;
