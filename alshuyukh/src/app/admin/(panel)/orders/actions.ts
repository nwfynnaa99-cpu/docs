"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth/session";
import { audit } from "@/server/auth/audit";
import { orders, type OrderStatus } from "@/server/orders";
import { done, fail, type FormState } from "@/lib/admin/form";

/** Allowed manual transitions. Payment outcomes come only from the gateway. */
const ALLOWED: Partial<Record<OrderStatus, OrderStatus[]>> = {
  paid: ["fulfilled", "cancelled"],
  pending_payment: ["cancelled"],
  payment_failed: ["cancelled"],
  fulfilled: ["cancelled"],
};

export async function setOrderStatus(id: string, to: OrderStatus, _s?: FormState, _d?: FormData): Promise<FormState> {
  const user = await requireAdmin("orders.manage");
  const order = await orders.get(id);
  if (!order) return fail("الطلب غير موجود");
  if (!ALLOWED[order.status]?.includes(to)) return fail("لا يمكن تغيير الحالة بهذا الشكل");
  await orders.updateStatus(id, to);
  audit(user, "status", "order", id, `${order.status} → ${to}${to === "cancelled" && order.status !== "pending_payment" ? " (أُعيد المخزون)" : ""}`);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/", "layout"); // stock may have changed
  return done(to === "fulfilled" ? "سُجّل الشحن" : "أُلغي الطلب");
}
