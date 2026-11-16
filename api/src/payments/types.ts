export interface CheckoutRequest {
  subscriptionId: string;
  title: string;
  billing: "monthly" | "yearly";
  amountCents: number;
  payerEmail: string;
}

export interface CheckoutResult {
  url: string;
  /** Set for recurring plans, which the provider tracks as a subscription. */
  providerRef?: string;
}

export interface PaymentProvider {
  name: string;
  createCheckout(request: CheckoutRequest): Promise<CheckoutResult>;
  cancelRecurring(providerRef: string): Promise<void>;
}
