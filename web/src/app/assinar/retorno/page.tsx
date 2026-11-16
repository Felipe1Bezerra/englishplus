import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ApiError, api, type CheckoutOrder } from "@/lib/api";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Pagamento" };

export default function ReturnPage({ searchParams }: PageProps<"/assinar/retorno">) {
  return (
    <div className="rounded-3xl border border-gold/50 bg-noir-card p-7 text-center text-cream sm:p-9">
      <Suspense fallback={<p className="text-cream/75">Confirmando seu pagamento…</p>}>
        <PaymentResult searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function PaymentResult({
  searchParams,
}: Pick<PageProps<"/assinar/retorno">, "searchParams">) {
  const { assinatura, payment_id: paymentId } = await searchParams;
  if (typeof assinatura !== "string") notFound();

  await requireUser(`/assinar/retorno?assinatura=${assinatura}`);

  const query = typeof paymentId === "string" ? `?paymentId=${encodeURIComponent(paymentId)}` : "";
  const order = await api<CheckoutOrder>(`/checkout/${assinatura}${query}`).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  const isActive = order.status === "active";

  return (
    <>
      <h1 className="text-2xl font-extrabold">
        {isActive ? "Pagamento confirmado!" : "Estamos aguardando a confirmação"}
      </h1>
      <p className="mt-2 text-cream/75">
        {isActive
          ? `Seu pacote ${order.packageName} já está ativo.`
          : "Pix e boleto podem levar alguns minutos. Seu pacote aparece na sua área assim que o pagamento for aprovado."}
      </p>
      <Link
        href="/aluno"
        className="mt-6 inline-block rounded-full bg-gold px-7 py-3.5 text-sm font-extrabold text-noir"
      >
        Ir para minha área
      </Link>
    </>
  );
}
