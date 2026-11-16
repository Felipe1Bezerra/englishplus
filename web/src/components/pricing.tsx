"use client";

import { CircleCheck, Laptop, User, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Billing, PackageKind, PublicPackage } from "@/lib/api";
import { brl, priceLabel } from "@/lib/format";

const ICONS: Record<PackageKind, typeof User> = {
  individual: User,
  group: Users,
  platform: Laptop,
};

export function Pricing({ packages }: { packages: PublicPackage[] }) {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <>
      <div
        role="group"
        aria-label="Forma de pagamento"
        className="mx-auto mb-10 flex w-fit rounded-full border border-gold/40 bg-white/5 p-1"
      >
        <CycleButton active={billing === "monthly"} onClick={() => setBilling("monthly")}>
          Mensal
        </CycleButton>
        <CycleButton active={billing === "yearly"} onClick={() => setBilling("yearly")}>
          Anual <span className="ml-1 text-xs font-semibold opacity-80">2 meses grátis</span>
        </CycleButton>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {packages.map((item) => (
          <PackageCard key={item.slug} item={item} billing={billing} />
        ))}
      </div>
    </>
  );
}

function CycleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
        active ? "bg-gold text-noir" : "text-cream/80 hover:text-cream"
      }`}
    >
      {children}
    </button>
  );
}

function PackageCard({ item, billing }: { item: PublicPackage; billing: Billing }) {
  const Icon = ICONS[item.kind];
  const isYearly = billing === "yearly";
  const priceCents = isYearly ? item.yearlyCents : item.monthlyCents;
  const savedCents = item.monthlyCents * 12 - item.yearlyCents;
  const featured = item.kind === "group";

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-3xl border bg-linear-to-b from-noir-card to-noir ${
        featured ? "border-cream/70" : "border-gold/60"
      }`}
    >
      <div className="px-7 pt-8 pb-7 text-center">
        <Icon aria-hidden strokeWidth={1.25} className="mx-auto size-14 text-gold" />
        <h3 className="mt-4 text-2xl font-extrabold tracking-wide text-gold uppercase">
          {item.name}
        </h3>
        <p className="mt-1 text-sm font-medium tracking-wide text-cream/85 uppercase">
          {item.cadence}
        </p>
        <div className="mx-auto my-5 h-px w-4/5 bg-gold/40" />
        <p className="text-[15px] text-cream/80 lg:min-h-[4.25rem]">{item.description}</p>
      </div>

      <div className="flex flex-1 flex-col border-t border-gold/25 bg-white/[0.03] px-7 pt-7 pb-8">
        <div className="text-center">
          <p className="text-sm font-bold tracking-widest text-gold uppercase">
            {isYearly ? "Anual" : "Mensal"}
          </p>
          <p className="mt-1 font-display text-5xl font-extrabold text-cream">
            {priceLabel(priceCents)}
          </p>
          <p className="mt-1 text-sm font-bold tracking-widest text-gold uppercase">
            {isYearly ? "Por ano" : "Por mês"}
          </p>
          <p className="mt-2 min-h-5 text-sm text-cream/70">
            {isYearly &&
              `Equivale a ${brl(Math.round(item.yearlyCents / 12))}/mês · economize ${priceLabel(savedCents)}`}
          </p>
        </div>

        <ul className="mt-5 flex-1 space-y-3 text-[15px] text-cream/85">
          {item.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-gold" />
              {feature}
            </li>
          ))}
        </ul>

        <Link
          href={`/assinar/${item.slug}?ciclo=${isYearly ? "anual" : "mensal"}`}
          className="mt-7 block rounded-full bg-gold px-6 py-3.5 text-center text-sm font-extrabold text-noir transition-transform hover:-translate-y-0.5"
        >
          Quero o {item.name}
        </Link>
      </div>
    </article>
  );
}
