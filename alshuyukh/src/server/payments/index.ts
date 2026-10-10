import "server-only";
import { mockGateway } from "./mock";
import type { PaymentGateway } from "./types";

/**
 * Selects the gateway from PAYMENT_PROVIDER. Add real adapters here
 * (e.g. "moyasar", "tap", "hyperpay", "tamara") implementing PaymentGateway.
 */
export function paymentGateway(): PaymentGateway {
  const id = process.env.PAYMENT_PROVIDER ?? "mock";
  switch (id) {
    case "mock":
      return mockGateway;
    default:
      throw new Error(`Unknown PAYMENT_PROVIDER "${id}"`);
  }
}
export type * from "./types";
