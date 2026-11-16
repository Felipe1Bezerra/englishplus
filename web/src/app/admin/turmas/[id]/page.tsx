import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { addMember, deleteGroup, removeMember, updateGroup } from "@/app/actions/admin";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { Card, Checkbox, EmptyState, Field, PageHeader, Select } from "@/components/ui";
import { pageApi, type AdminGroup, type StudentRow } from "@/lib/api";

export const metadata: Metadata = { title: "Turma" };

export default async function GroupPage({ params }: PageProps<"/admin/turmas/[id]">) {
  const { id } = await params;
  const [groups, students] = await Promise.all([
    pageApi<AdminGroup[]>("/admin/groups"),
    pageApi<StudentRow[]>("/admin/students?q="),
  ]);

  const group = groups.find((candidate) => candidate.id === id);
  if (!group) notFound();

  const memberIds = new Set(group.members.map((member) => member.id));
  const available = students.filter((student) => student.active && !memberIds.has(student.id));
  const isFull = group.members.length >= group.capacity;

  return (
    <>
      <Link href="/admin/turmas" className="text-sm text-muted-foreground hover:text-navy">
        ← Todas as turmas
      </Link>
      <div className="mt-4">
        <PageHeader
          title={group.name}
          description={`${group.members.length} de ${group.capacity} vagas ocupadas`}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Alunos da turma">
          {group.members.length === 0 && <EmptyState>Nenhum aluno nesta turma.</EmptyState>}
          <ul className="mb-4 divide-y divide-border">
            {group.members.map((member) => (
              <li key={member.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/admin/alunos/${member.id}`}
                    className="font-semibold text-navy underline-offset-4 hover:underline"
                  >
                    {member.name}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                </div>
                <ActionForm action={removeMember.bind(null, group.id, member.id)}>
                  <SubmitButton
                    variant="secondary"
                    className="px-4! py-1.5!"
                    pendingLabel="Removendo…"
                  >
                    Remover
                  </SubmitButton>
                </ActionForm>
              </li>
            ))}
          </ul>

          {isFull ? (
            <p className="text-sm font-medium text-bad">Turma cheia.</p>
          ) : (
            <ActionForm action={addMember.bind(null, group.id)} className="space-y-3">
              <Select label="Adicionar aluno" name="userId" required defaultValue="">
                <option value="" disabled>
                  Escolha um aluno
                </option>
                {available.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </Select>
              <SubmitButton pendingLabel="Adicionando…">Adicionar à turma</SubmitButton>
            </ActionForm>
          )}
        </Card>

        <Card title="Dados da turma">
          <ActionForm
            action={updateGroup.bind(null, group.id)}
            successMessage="Turma atualizada."
            className="space-y-4"
          >
            <Field label="Nome" name="name" defaultValue={group.name} required />
            <Field label="Nível" name="level" defaultValue={group.level} />
            <Field
              label="Vagas"
              name="capacity"
              type="number"
              min={1}
              defaultValue={group.capacity}
              required
            />
            <Field
              label="Link da sala"
              name="meetingUrl"
              type="url"
              defaultValue={group.meetingUrl ?? ""}
            />
            <Checkbox label="Turma ativa" name="active" defaultChecked={group.active} />
            <SubmitButton>Salvar</SubmitButton>
          </ActionForm>

          <ActionForm
            action={deleteGroup.bind(null, group.id)}
            confirmMessage="Excluir esta turma e todas as aulas dela? Isso não pode ser desfeito."
            className="mt-5 border-t border-border pt-4"
          >
            <SubmitButton variant="danger" pendingLabel="Excluindo…">
              Excluir turma
            </SubmitButton>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
