import type { Metadata } from "next";
import Link from "next/link";
import { createGroup } from "@/app/actions/admin";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { Badge, Card, Checkbox, EmptyState, Field, PageHeader } from "@/components/ui";
import { pageApi, type AdminGroup } from "@/lib/api";

export const metadata: Metadata = { title: "Turmas" };

export default async function GroupsPage() {
  const groups = await pageApi<AdminGroup[]>("/admin/groups");

  return (
    <>
      <PageHeader title="Turmas" description="Monte as turmas e acompanhe as vagas." />

      <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          {groups.length === 0 && <EmptyState>Nenhuma turma criada ainda.</EmptyState>}
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/admin/turmas/${group.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 hover:border-navy"
            >
              <div>
                <p className="font-bold text-navy">{group.name}</p>
                <p className="text-sm text-muted-foreground">
                  {group.members.length} de {group.capacity} vagas ocupadas
                </p>
              </div>
              <div className="flex gap-2">
                {group.level && <Badge>{group.level}</Badge>}
                {!group.active && <Badge tone="bad">Inativa</Badge>}
              </div>
            </Link>
          ))}
        </div>

        <Card title="Nova turma">
          <ActionForm action={createGroup} successMessage="Turma criada." className="space-y-4">
            <Field label="Nome" name="name" placeholder="Turma B1 noite" required />
            <Field label="Nível" name="level" placeholder="B1" />
            <Field label="Vagas" name="capacity" type="number" min={1} defaultValue={8} required />
            <Field
              label="Link da sala"
              name="meetingUrl"
              type="url"
              placeholder="https://meet.google.com/…"
            />
            <Checkbox label="Turma ativa" name="active" defaultChecked />
            <SubmitButton>Criar turma</SubmitButton>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
