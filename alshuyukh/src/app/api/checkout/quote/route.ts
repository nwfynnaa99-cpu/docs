import { NextResponse } from "next/server";
import { z } from "zod";
import { checkoutSchema } from "@/lib/checkout/validation";
import { guard, noStore } from "@/lib/http";
import { CheckoutError, quote } from "@/server/checkout/service";

const QuoteInput = checkoutSchema.pick({ lines: true, coupon: true, shippingMethod: true }).extend({ city: z.string().max(40).optional() });

export async function POST(req: Request) {
  const blocked = guard(req, "quote", 60);
  if (blocked) return blocked;
  const parsed = QuoteInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400, headers: noStore });
  try {
    const q = await quote(parsed.data);
    return NextResponse.json(
      { totals: q.totals, coupon: q.coupon, shippingAvailable: q.shippingAvailable, lines: q.lines.map(({ productId, unitPrice, quantity }) => ({ productId, unitPrice, quantity })) },
      { headers: noStore },
    );
  } catch (e) {
    if (e instanceof CheckoutError) return NextResponse.json({ error: e.code, message: e.message }, { status: 409, headers: noStore });
    throw e;
  }
}
