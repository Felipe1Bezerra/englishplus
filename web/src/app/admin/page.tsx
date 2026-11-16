import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, EmptyState, PageHeader, Stat } from "@/components/ui";
import { pageApi, type AdminOverview } from "@/lib/api";
import { brl, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Painel do professor" };

export default async function AdminHome() {
  const data = await pageApi<AdminOverview>("/admin/overview");

  return (
    <>
      <PageHeader title="Visão geral" description="O que precisa da sua atenção hoje." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Alunos" value={data.students} />
        <Stat label="Assinaturas ativas" value={data.activeSubscriptions} />
        <Stat label="Recebido neste mês" value={brl(data.revenueThisMonthCents)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Precisam de turma ou horário">
          {data.needsPlacement.length === 0 && <EmptyState>Tudo organizado por aqui.</EmptyState>}
          <ul className="divide-y divide-border">
            {data.needsPlacement.map((student) => (
              <li key={student.id} className="flex items-center justify-between gap-3 py-3">
                <Link
                  href={`/admin/alunos/${student.id}`}
                  className="font-semibold text-navy underline-offset-4 hover:underline"
                >
                  {student.name}
                </Link>
                <Badge tone="gold">{student.packageName}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="Próximas aulas"
          action={
            <Link href="/admin/calendario" className="text-sm font-semibold text-navy underline">
              Calendário
            </Link>
          }
        >
          {data.upcoming.length === 0 && <EmptyState>Nenhuma aula marcada.</EmptyState>}
          <ul className="divide-y divide-border">
            {data.upcoming.map((item) => (
              <li key={item.id} className="py-3">
                <Link
                  href={`/admin/calendario/${item.id}`}
                  className="font-semibold text-navy underline-offset-4 hover:underline"
                >
                  {item.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(item.startsAt)} · {item.groupName ?? item.studentName}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
