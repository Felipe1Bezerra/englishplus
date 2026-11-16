import { CircleCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { startCheckout } from "@/app/actions/student";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { publicApi, type PublicPackage } from "@/lib/api";
import { brl } from "@/lib/format";

export const metadata: Metadata = { title: "Assinar" };

export default function CheckoutPage({ params, searchParams }: PageProps<"/assinar/[slug]">) {
  return (
    <Suspense
      fallback={<div className="h-[34rem] animate-pulse rounded-3xl bg-noir-card" aria-hidden />}
    >
      <Checkout params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Checkout({ params, searchParams }: PageProps<"/assinar/[slug]">) {
  const { slug } = await params;
  const { ciclo } = await searchParams;
  const packages = await publicApi<PublicPackage[]>("/packages");
  const item = packages.find((candidate) => candidate.slug === slug);
  if (!item) notFound();

  const yearlyDefault = ciclo === "anual";
  const savedCents = item.monthlyCents * 12 - item.yearlyCents;

  return (
    <div className="rounded-3xl border border-gold/50 bg-linear-to-b from-noir-card to-noir p-7 sm:p-9">
      <p className="text-sm font-bold tracking-widest text-gold uppercase">Seu pacote</p>
      <h1 className="mt-1 text-3xl font-extrabold text-cream">{item.name}</h1>
      <p className="mt-1 text-cream/75">{item.cadence}</p>

      <ul className="mt-5 space-y-2 text-[15px] text-cream/85">
        {item.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-gold" />
            {feature}
          </li>
        ))}
      </ul>

      <ActionForm action={startCheckout.bind(null, item.slug)} className="mt-7">
        <fieldset className="space-y-3">
          <legend className="mb-3 font-bold text-cream">Como você quer pagar?</legend>
          <CycleOption
            value="monthly"
            title={`${brl(item.monthlyCents)} por mês`}
            detail="Cobrança automática no cartão. Cancele quando quiser."
            defaultChecked={!yearlyDefault}
          />
          <CycleOption
            value="yearly"
            title={`${brl(item.yearlyCents)} por ano`}
            detail={`2 meses grátis: economize ${brl(savedCents)}. Pix, cartão ou boleto.`}
            defaultChecked={yearlyDefault}
          />
        </fieldset>
        <SubmitButton variant="gold" className="mt-6 w-full py-3.5!" pendingLabel="Abrindo…">
          Continuar para o pagamento
        </SubmitButton>
      </ActionForm>

      <p className="mt-5 text-center text-sm text-cream/60">
        <Link href="/#planos" className="underline underline-offset-4 hover:text-cream">
          Ver outros planos
        </Link>
      </p>
    </div>
  );
}

function CycleOption({
  value,
  title,
  detail,
  defaultChecked,
}: {
  value: string;
  title: string;
  detail: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-2xl border border-white/15 p-4 has-checked:border-gold has-checked:bg-gold/10">
      <input
        type="radio"
        name="billing"
        value={value}
        defaultChecked={defaultChecked}
        className="mt-1 size-4 accent-gold"
      />
      <span>
        <span className="block font-bold text-cream">{title}</span>
        <span className="block text-sm text-cream/70">{detail}</span>
      </span>
    </label>
  );
}
