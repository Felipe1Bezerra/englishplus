import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { confirmSimulatedPayment } from "@/app/actions/student";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { ApiError, api, type CheckoutOrder } from "@/lib/api";
import { brl } from "@/lib/format";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Pagamento de teste" };

export default function SimulatedPaymentPage({ searchParams }: PageProps<"/assinar/simulado">) {
  return (
    <Suspense>
      <SimulatedPayment searchParams={searchParams} />
    </Suspense>
  );
}

async function SimulatedPayment({
  searchParams,
}: Pick<PageProps<"/assinar/simulado">, "searchParams">) {
  const { assinatura } = await searchParams;
  if (typeof assinatura !== "string") notFound();

  await requireUser(`/assinar/simulado?assinatura=${assinatura}`);

  const order = await api<CheckoutOrder>(`/checkout/${assinatura}`).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });
  if (!order.simulated) notFound();

  return (
    <div className="rounded-3xl border border-gold/50 bg-noir-card p-7 text-cream sm:p-9">
      <p className="rounded-xl bg-gold/15 px-4 py-3 text-sm font-semibold text-gold-light">
        Modo de teste: nenhum valor é cobrado. Com o Mercado Pago conectado, esta tela não existe.
      </p>
      <h1 className="mt-6 text-2xl font-extrabold">{order.packageName}</h1>
      <p className="mt-1 text-cream/75">
        {brl(order.priceCents)} {order.billing === "yearly" ? "por ano" : "por mês"}
      </p>
      <ActionForm action={confirmSimulatedPayment.bind(null, order.id)} className="mt-6">
        <SubmitButton variant="gold" className="w-full py-3.5!" pendingLabel="Confirmando…">
          Simular pagamento aprovado
        </SubmitButton>
      </ActionForm>
    </div>
  );
}
