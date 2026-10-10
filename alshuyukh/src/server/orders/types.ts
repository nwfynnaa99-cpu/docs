import type { PaymentMethodId } from "@/lib/checkout/validation";
import type { ShippingMethodId } from "@/lib/checkout/shipping";
import type { Totals } from "@/lib/checkout/totals";

export type OrderStatus = "pending_payment" | "paid" | "payment_failed" | "cancelled" | "fulfilled";

export type OrderLine = { productId: string; slug: string; name: string; image: string; unitPrice: number; quantity: number; unitLabel?: string };

export type Order = {
  id: string; // public order number, e.g. SH-7K2M9Q
  idempotencyKey: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  contact: { name: string; phone: string; email?: string };
  address: { city: string; district: string; street: string; shortAddress?: string; notes?: string };
  shippingMethod: ShippingMethodId;
  paymentMethod: PaymentMethodId;
  coupon?: string;
  lines: OrderLine[];
  totals: Totals;
  /** Gateway reference only. Card data never reaches this system. */
  payment?: { provider: string; reference?: string; failureReason?: string };
};
