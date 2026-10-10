import type { Order } from "@/server/orders";

export type PaymentSession = { redirectUrl: string; reference: string };

export type WebhookResult = { orderId: string; status: "paid" | "payment_failed"; reference?: string; reason?: string };

/**
 * Payment gateway contract. Card entry always happens on the gateway's
 * hosted page or hosted fields (Moyasar, Tap, HyperPay, Tamara checkout),
 * so card numbers never touch this server.
 */
export interface PaymentGateway {
  readonly id: string;
  createSession(order: Order, opts: { returnUrl: string; cancelUrl: string }): Promise<PaymentSession>;
  /** Verifies the gateway signature and returns the outcome, or null if the request is not authentic. */
  verifyWebhook(req: Request): Promise<WebhookResult | null>;
}
