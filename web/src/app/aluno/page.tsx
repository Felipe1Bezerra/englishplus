import type { Metadata } from "next";
import Link from "next/link";
import { cancelMySubscription } from "@/app/actions/student";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { Badge, Card, EmptyState, PageHeader, Stat } from "@/components/ui";
import { pageApi, type Dashboard } from "@/lib/api";
import { brl, formatDate, formatDateTime } from "@/lib/format";
import { getUser } from "@/lib/session";

export const metadata: Metadata = { title: "Área do aluno" };

export default async function StudentHome() {
  const [user, data] = await Promise.all([getUser(), pageApi<Dashboard>("/me/dashboard")]);
  const firstName = user?.name.split(" ")[0] ?? "";
  const { attendance } = data;
  const rate = attendance.total > 0 ? Math.round((attendance.present / attendance.total) * 100) : 0;

  return (
    <>
      <PageHeader title={`Oi, ${firstName}!`} description="Veja o que vem por aí nas suas aulas." />

      {data.subscriptions.length === 0 && (
        <Card className="mb-6">
          <p className="font-semibold text-navy">Você ainda não tem um pacote ativo.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha um pacote para liberar suas aulas e seu calendário.
          </p>
          <Link
            href="/#planos"
            className="mt-4 inline-block rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-navy"
          >
            Ver pacotes
          </Link>
        </Card>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Nível" value={data.profile.level ?? "A definir"} />
        <Stat label="Presença" value={attendance.total > 0 ? `${rate}%` : "–"} />
        <Stat label="Aulas registradas" value={attendance.total} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Próximas aulas"
          action={
            <Link href="/aluno/calendario" className="text-sm font-semibold text-navy underline">
              Ver calendário
            </Link>
          }
        >
          {data.upcoming.length === 0 && <EmptyState>Nenhuma aula marcada ainda.</EmptyState>}
          <ul className="divide-y divide-border">
            {data.upcoming.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-navy">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(item.startsAt)}</p>
                </div>
                {item.meetingUrl && (
                  <a
                    href={item.meetingUrl}
                    target="_blank"
                    rel="noopener"
                    className="shrink-0 rounded-full bg-navy px-4 py-1.5 text-sm font-bold text-cream"
                  >
                    Entrar
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Acompanhamento do professor">
          {data.profile.goal && (
            <p className="mb-3 text-sm">
              <span className="font-semibold text-navy">Objetivo: </span>
              {data.profile.goal}
            </p>
          )}
          {data.notes.length === 0 && (
            <EmptyState>As observações do Felipe sobre sua evolução aparecem aqui.</EmptyState>
          )}
          <ul className="space-y-3">
            {data.notes.map((note) => (
              <li key={note.id} className="rounded-xl bg-cream-soft p-3">
                <p className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</p>
                <p className="mt-1 text-sm whitespace-pre-line">{note.body}</p>
              </li>
            ))}
          </ul>
        </Card>

        {data.subscriptions.length > 0 && (
          <Card title="Meus pacotes">
            <ul className="divide-y divide-border">
              {data.subscriptions.map((item) => (
                <li key={item.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-navy">{item.packageName}</p>
                    <Badge tone={item.status === "active" ? "good" : "neutral"}>
                      {item.status === "active" ? "Ativo" : "Cancelado"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {brl(item.priceCents)} {item.billing === "yearly" ? "por ano" : "por mês"}
                    {item.currentPeriodEnd &&
                      ` · ${item.status === "active" && item.billing === "monthly" ? "renova" : "acesso até"} ${formatDate(item.currentPeriodEnd)}`}
                  </p>
                  {item.status === "active" && item.billing === "monthly" && (
                    <ActionForm
                      action={cancelMySubscription.bind(null, item.id)}
                      confirmMessage="Cancelar a renovação? Você mantém o acesso até o fim do período pago."
                      className="mt-2"
                    >
                      <SubmitButton
                        variant="secondary"
                        className="px-4! py-1.5!"
                        pendingLabel="Cancelando…"
                      >
                        Cancelar renovação
                      </SubmitButton>
                    </ActionForm>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {data.groups.length > 0 && (
          <Card title="Minhas turmas">
            <ul className="space-y-2">
              {data.groups.map((group) => (
                <li key={group.id} className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-navy">{group.name}</span>
                  {group.level && <Badge>{group.level}</Badge>}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}
