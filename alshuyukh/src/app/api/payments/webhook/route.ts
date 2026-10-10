import { NextResponse } from "next/server";
import { orders } from "@/server/orders";
import { paymentGateway } from "@/server/payments";

/**
 * Server-to-server payment notifications. The order is only marked paid
 * after the gateway signature verifies; the browser redirect alone never
 * marks an order paid.
 */
export async function POST(req: Request) {
  const result = await paymentGateway().verifyWebhook(req);
  if (!result) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const order = await orders.get(result.orderId);
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (order.status === "pending_payment" || order.status === "payment_failed") {
    await orders.updateStatus(order.id, result.status, { reference: result.reference, failureReason: result.reason });
  }
  return NextResponse.json({ ok: true });
}
