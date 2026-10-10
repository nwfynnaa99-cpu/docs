import { NextResponse } from "next/server";
import { z } from "zod";
import { guard, noStore } from "@/lib/http";
import { orders } from "@/server/orders";
import { paymentGateway } from "@/server/payments";
import { successUrl } from "@/server/orders/token";

const Input = z.object({ orderId: z.string().regex(/^SH-[A-Z0-9]{6}$/), outcome: z.enum(["paid", "failed"]) });

/** Development only: stands in for the gateway's server-to-server callback. */
export async function POST(req: Request) {
  if (paymentGateway().id !== "mock") return NextResponse.json({ error: "not_found" }, { status: 404 });
  const blocked = guard(req, "mock-confirm", 20);
  if (blocked) return blocked;
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const order = await orders.get(parsed.data.orderId);
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (order.status !== "pending_payment" && order.status !== "payment_failed") {
    return NextResponse.json({ redirectUrl: successUrl(order.id) }, { headers: noStore });
  }
  if (parsed.data.outcome === "paid") {
    await orders.updateStatus(order.id, "paid");
    return NextResponse.json({ redirectUrl: successUrl(order.id) }, { headers: noStore });
  }
  await orders.updateStatus(order.id, "payment_failed", { failureReason: "declined" });
  return NextResponse.json({ redirectUrl: `/checkout?failed=${order.id}` }, { headers: noStore });
}
