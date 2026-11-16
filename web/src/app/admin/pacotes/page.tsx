import type { Metadata } from "next";
import Link from "next/link";
import { Badge, PageHeader } from "@/components/ui";
import { pageApi, type AdminPackage } from "@/lib/api";
import { brl } from "@/lib/format";

export const metadata: Metadata = { title: "Pacotes" };

export default async function PackagesPage() {
  const packages = await pageApi<AdminPackage[]>("/admin/packages");

  return (
    <>
      <PageHeader
        title="Pacotes"
        description="Preços, benefícios e cursos de cada pacote à venda."
        action={
          <Link
            href="/admin/pacotes/novo"
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-cream"
          >
            Novo pacote
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {packages.map((item) => (
          <Link
            key={item.id}
            href={`/admin/pacotes/${item.id}`}
            className="rounded-2xl border border-border bg-card p-5 hover:border-navy"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-navy">{item.name}</h2>
              <Badge tone={item.active ? "good" : "neutral"}>
                {item.active ? "À venda" : "Oculto"}
              </Badge>
            </div>
            <p className="mt-3 font-display text-2xl font-extrabold text-navy">
              {brl(item.monthlyCents)}
              <span className="text-sm font-medium text-muted-foreground"> /mês</span>
            </p>
            <p className="text-sm text-muted-foreground">{brl(item.yearlyCents)} /ano</p>
            <p className="mt-3 text-sm text-muted-foreground">
              {item.courseIds.length} {item.courseIds.length === 1 ? "curso" : "cursos"} incluídos
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
