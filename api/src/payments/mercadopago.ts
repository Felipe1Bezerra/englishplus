import { env } from "../env.js";
import { HttpError } from "../lib/http.js";
import type { CheckoutRequest, CheckoutResult, PaymentProvider } from "./types.js";

const BASE_URL = "https://api.mercadopago.com";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.mercadoPagoToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    console.error(`Mercado Pago ${path} failed (${res.status}): ${await res.text()}`);
    throw new HttpError(502, "Não foi possível falar com o Mercado Pago. Tente novamente.");
  }

  return res.json() as Promise<T>;
}

export interface MercadoPagoPayment {
  id: number;
  status: string;
  transaction_amount: number;
  external_reference?: string | null;
}

export interface MercadoPagoSubscription {
  id: string;
  status: string;
  external_reference?: string | null;
  next_payment_date?: string | null;
}

interface AuthorizedPayment {
  preapproval_id?: string;
}

export const getPayment = (id: string) => request<MercadoPagoPayment>(`/v1/payments/${id}`);

export const getSubscription = (id: string) =>
  request<MercadoPagoSubscription>(`/preapproval/${id}`);

export const getAuthorizedPayment = (id: string) =>
  request<AuthorizedPayment>(`/authorized_payments/${id}`);

function returnUrl(subscriptionId: string): string {
  return `${env.webUrl}/assinar/retorno?assinatura=${subscriptionId}`;
}

/** Yearly plans are a single payment, so Pix, card and boleto all work. */
async function createOneTimeCheckout(checkout: CheckoutRequest): Promise<CheckoutResult> {
  const back = returnUrl(checkout.subscriptionId);
  const preference = await request<{ init_point: string }>("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify({
      items: [
        {
          title: checkout.title,
          quantity: 1,
          unit_price: checkout.amountCents / 100,
          currency_id: "BRL",
        },
      ],
      payer: { email: checkout.payerEmail },
      external_reference: checkout.subscriptionId,
      back_urls: { success: back, pending: back, failure: back },
      auto_return: "approved",
      notification_url: `${env.apiUrl}/api/webhooks/mercadopago`,
    }),
  });

  return { url: preference.init_point };
}

/** Monthly plans charge automatically every month. */
async function createRecurringCheckout(checkout: CheckoutRequest): Promise<CheckoutResult> {
  const subscription = await request<{ id: string; init_point: string }>("/preapproval", {
    method: "POST",
    body: JSON.stringify({
      reason: checkout.title,
      external_reference: checkout.subscriptionId,
      payer_email: checkout.payerEmail,
      back_url: returnUrl(checkout.subscriptionId),
      status: "pending",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: checkout.amountCents / 100,
        currency_id: "BRL",
      },
    }),
  });

  return { url: subscription.init_point, providerRef: subscription.id };
}

export const mercadoPago: PaymentProvider = {
  name: "mercadopago",
  createCheckout: (checkout) =>
    checkout.billing === "yearly"
      ? createOneTimeCheckout(checkout)
      : createRecurringCheckout(checkout),
  cancelRecurring: async (providerRef) => {
    await request(`/preapproval/${providerRef}`, {
      method: "PUT",
      body: JSON.stringify({ status: "canceled" }),
    });
  },
};
