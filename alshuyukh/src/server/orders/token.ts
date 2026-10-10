import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Order numbers are short and guessable, so pages that show order details
 * also require an HMAC token bound to the order id.
 */
function secret() {
  const s = process.env.ORDER_TOKEN_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") throw new Error("ORDER_TOKEN_SECRET (32+ chars) is required in production");
  const g = globalThis as unknown as { __alshuyukhDevSecret?: string };
  return (g.__alshuyukhDevSecret ??= randomBytes(32).toString("hex"));
}

export const orderToken = (orderId: string) => createHmac("sha256", secret()).update(orderId).digest("base64url").slice(0, 32);

export function verifyOrderToken(orderId: string, token: string | undefined | null) {
  if (!token) return false;
  const a = Buffer.from(orderToken(orderId));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const successUrl = (orderId: string) => `/checkout/success?order=${encodeURIComponent(orderId)}&t=${orderToken(orderId)}`;
