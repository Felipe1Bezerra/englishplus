"use server";

import { redirect } from "next/navigation";
import { failureFrom, runAction, text, type ActionState } from "@/lib/action";
import { api, type Billing } from "@/lib/api";
import { getUser } from "@/lib/session";

/** Sends a visitor to sign up first, then straight back to this package. */
export async function startCheckout(
  slug: string,
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  const billing: Billing = text(form, "billing") === "yearly" ? "yearly" : "monthly";

  const user = await getUser();
  if (!user) {
    const cycle = billing === "yearly" ? "anual" : "mensal";
    redirect(`/cadastro?next=${encodeURIComponent(`/assinar/${slug}?ciclo=${cycle}`)}`);
  }

  let url: string;

  try {
    ({ url } = await api<{ url: string }>("/checkout", {
      method: "POST",
      body: { slug, billing },
    }));
  } catch (error) {
    return failureFrom(error);
  }

  redirect(url);
}

export async function confirmSimulatedPayment(
  subscriptionId: string): Promise<ActionState> {
  const result = await runAction(() =>
    api(`/checkout/${subscriptionId}/simulate`, { method: "POST" }),
  );
  if (result.error) return result;
  redirect(`/assinar/retorno?assinatura=${subscriptionId}`);
}

export async function cancelMySubscription(
  subscriptionId: string): Promise<ActionState> {
  return runAction(() => api(`/me/subscriptions/${subscriptionId}/cancel`, { method: "POST" }));
}
