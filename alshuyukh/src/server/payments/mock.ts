import "server-only";
import type { PaymentGateway } from "./types";

/**
 * Development gateway: redirects to a local page that simulates the
 * gateway's hosted checkout. Refuses to run in production.
 */
export const mockGateway: PaymentGateway = {
  id: "mock",
  async createSession(order) {
    if (process.env.NODE_ENV === "production" && process.env.PAYMENT_PROVIDER !== "mock") throw new Error("Mock gateway is disabled in production");
    return { redirectUrl: `/checkout/pay/${encodeURIComponent(order.id)}`, reference: `mock_${order.id}` };
  },
  async verifyWebhook() {
    return null; // the mock confirms through /api/payments/mock-confirm instead
  },
};
