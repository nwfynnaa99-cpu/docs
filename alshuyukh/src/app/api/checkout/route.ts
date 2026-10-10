import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/checkout/validation";
import { guard, noStore } from "@/lib/http";
import { CheckoutError, placeOrder } from "@/server/checkout/service";
import { orders } from "@/server/orders";
import { paymentGateway } from "@/server/payments";
import { successUrl } from "@/server/orders/token";

export async function POST(req: Request) {
  const blocked = guard(req, "checkout", 10);
  if (blocked) return blocked;

  const parsed = checkoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const fields = Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message]));
    return NextResponse.json({ error: "invalid", fields }, { status: 400, headers: noStore });
  }

  try {
    const order = await placeOrder(parsed.data);
    if (order.status === "paid" || order.status === "fulfilled") {
      // Same idempotency key replayed after payment completed.
      return NextResponse.json({ orderId: order.id, redirectUrl: successUrl(order.id) }, { headers: noStore });
    }
    // pending_payment, or a retry after a failed payment: open a fresh gateway session.
    const gateway = paymentGateway();
    const origin = new URL(req.url).origin;
    const session = await gateway.createSession(order, {
      returnUrl: `${origin}${successUrl(order.id)}`,
      cancelUrl: `${origin}/checkout?cancelled=${order.id}`,
    });
    await orders.updateStatus(order.id, "pending_payment", { provider: gateway.id, reference: session.reference });
    return NextResponse.json({ orderId: order.id, redirectUrl: session.redirectUrl }, { headers: noStore });
  } catch (e) {
    if (e instanceof CheckoutError) {
      return NextResponse.json({ error: e.code, message: e.message, fields: e.field ? { [e.field]: e.message } : undefined }, { status: 409, headers: noStore });
    }
    console.error("[checkout] failed", e);
    return NextResponse.json({ error: "server_error", message: "تعذّر إنشاء الطلب. حاول مرة أخرى." }, { status: 500, headers: noStore });
  }
}
