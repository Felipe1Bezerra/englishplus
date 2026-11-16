import { ChartNoAxesCombined, Globe, MessagesSquare, Target } from "lucide-react";
import { Suspense } from "react";
import { publicApi, type PublicPackage } from "@/lib/api";
import { WHATSAPP_URL } from "@/lib/site";
import { Pricing } from "./pricing";

const PROMISES = [
  { icon: Globe, label: "Inglês para a vida real" },
  { icon: Target, label: "Foco no seu objetivo" },
  { icon: ChartNoAxesCombined, label: "Evolução constante" },
  { icon: MessagesSquare, label: "Suporte e acompanhamento" },
];

export function PackagesSection() {
  return (
    <section id="planos" className="scroll-mt-20 bg-noir py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-display text-4xl leading-tight font-extrabold uppercase sm:text-6xl">
            <span className="text-gold">Planos de</span>
            <br />
            <span className="text-cream">Aulas de inglês</span>
          </h2>
          <div className="mt-5 flex items-center justify-center gap-4 text-gold" aria-hidden>
            <span className="h-px w-16 bg-gold/50 sm:w-40" />
            <span className="tracking-[6px]">★★★★★</span>
            <span className="h-px w-16 bg-gold/50 sm:w-40" />
          </div>
          <p className="mt-5 tracking-wider text-cream/85 uppercase">
            Escolha o plano ideal para <b className="text-gold">você</b>
          </p>
        </div>

        <Suspense fallback={<PricingSkeleton />}>
          <PackagesList />
        </Suspense>

        <ul className="mt-8 grid grid-cols-2 gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:grid-cols-4">
          {PROMISES.map(({ icon: Icon, label }) => (
            <li key={label} className="text-center">
              <Icon aria-hidden strokeWidth={1.25} className="mx-auto size-11 text-gold" />
              <p className="mt-2 text-sm font-medium tracking-wide text-cream/85 uppercase">
                {label}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center tracking-wide text-cream/85 uppercase">
          Invista em você. <b className="text-gold">Fale inglês.</b> Abra novas portas.
        </p>
      </div>
    </section>
  );
}

async function PackagesList() {
  let packages: PublicPackage[];

  try {
    packages = await publicApi<PublicPackage[]>("/packages");
  } catch (error) {
    console.error(error);
    return (
      <p className="text-center text-cream/85">
        Não conseguimos carregar os planos agora.{" "}
        <a href={WHATSAPP_URL} className="font-bold text-gold underline">
          Fale com o Felipe no WhatsApp
        </a>
        .
      </p>
    );
  }

  return <Pricing packages={packages} />;
}

function PricingSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3" aria-hidden>
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-[42rem] animate-pulse rounded-3xl bg-noir-card" />
      ))}
    </div>
  );
}
