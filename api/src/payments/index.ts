import { env } from "../env.js";
import { mercadoPago } from "./mercadopago.js";
import type { PaymentProvider } from "./types.js";

/** Local stand-in used until Mercado Pago credentials are set. No money moves. */
const simulated: PaymentProvider = {
  name: "simulated",
  createCheckout: async ({ subscriptionId }) => ({
    url: `${env.webUrl}/assinar/simulado?assinatura=${subscriptionId}`,
  }),
  cancelRecurring: async () => {},
};

// env.ts refuses to start in production without a token, so this can't fall back there.
export const paymentProvider: PaymentProvider = env.mercadoPagoToken ? mercadoPago : simulated;

export const isSimulatedPayments = paymentProvider === simulated;
