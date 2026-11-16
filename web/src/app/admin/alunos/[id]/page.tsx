import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addNote,
  cancelSubscription,
  deleteNote,
  grantPackage,
  setStudentPassword,
  updateStudent,
} from "@/app/actions/admin";
import { ActionForm, SubmitButton } from "@/components/action-form";
import {
  Badge,
  Card,
  Checkbox,
  EmptyState,
  Field,
  PageHeader,
  Select,
  TextArea,
} from "@/components/ui";
import { ApiError, pageApi, type AdminPackage, type StudentRecord } from "@/lib/api";
import { brl, formatDate, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Acompanhamento do aluno" };

const STATUS_LABEL = { pending: "Aguardando", active: "Ativo", cancelled: "Cancelado" };
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default async function StudentRecordPage({ params }: PageProps<"/admin/alunos/[id]">) {
  const { id } = await params;

  const [student, packages] = await Promise.all([
    pageApi<StudentRecord>(`/admin/students/${id}`).catch((error) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    }),
    pageApi<AdminPackage[]>("/admin/packages"),
  ]);

  const present = student.attendance.filter((row) => row.status === "present").length;

  return (
    <>
      <Link href="/admin/alunos" className="text-sm text-muted-foreground hover:text-navy">
        ← Todos os alunos
      </Link>
      <div className="mt-4">
        <PageHeader
          title={student.name}
          description={`${student.email} · aluno desde ${formatDate(student.createdAt)}`}
          action={!student.active ? <Badge tone="bad">Desativado</Badge> : undefined}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card title="Acompanhamento">
            <ActionForm
              action={addNote.bind(null, student.id)}
              successMessage="Anotação salva."
              className="mb-5 space-y-3"
            >
              <TextArea
                label="Nova anotação"
                name="body"
                rows={3}
                placeholder="Como foi a aula, pontos a melhorar, próximos passos…"
                required
              />
              <Checkbox label="Mostrar para o aluno" name="shared" />
              <SubmitButton>Salvar anotação</SubmitButton>
            </ActionForm>

            {student.notes.length === 0 && <EmptyState>Nenhuma anotação ainda.</EmptyState>}
            <ul className="space-y-3">
              {student.notes.map((note) => (
                <li key={note.id} className="rounded-xl bg-cream-soft p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(note.createdAt)}
                    </span>
                    <Badge tone={note.shared ? "good" : "neutral"}>
                      {note.shared ? "Visível ao aluno" : "Privada"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm whitespace-pre-line">{note.body}</p>
                  <ActionForm
                    action={deleteNote.bind(null, note.id)}
                    confirmMessage="Excluir esta anotação?"
                  >
                    <button
                      type="submit"
                      className="mt-1 text-xs font-semibold text-bad hover:underline"
                    >
                      Excluir
                    </button>
                  </ActionForm>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Presença">
            {student.attendance.length === 0 ? (
              <EmptyState>Nenhuma presença registrada.</EmptyState>
            ) : (
              <>
                <p className="mb-3 text-sm text-muted-foreground">
                  {present} de {student.attendance.length} aulas recentes
                </p>
                <ul className="divide-y divide-border">
                  {student.attendance.map((row) => (
                    <li
                      key={row.sessionId}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      <div>
                        <Link
                          href={`/admin/calendario/${row.sessionId}`}
                          className="text-sm font-semibold text-navy"
                        >
                          {row.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(row.startsAt)}
                        </p>
                      </div>
                      <Badge tone={row.status === "present" ? "good" : "bad"}>
                        {row.status === "present" ? "Presente" : "Faltou"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Perfil">
            <ActionForm
              action={updateStudent.bind(null, student.id)}
              successMessage="Perfil atualizado."
              className="space-y-4"
            >
              <Field label="Nome" name="name" defaultValue={student.name} required />
              <Field label="Telefone" name="phone" defaultValue={student.phone ?? ""} />
              <Select label="Nível" name="level" defaultValue={student.level ?? ""}>
                <option value="">A definir</option>
                {LEVELS.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </Select>
              <TextArea label="Objetivo" name="goal" rows={2} defaultValue={student.goal ?? ""} />
              <Checkbox label="Conta ativa" name="active" defaultChecked={student.active} />
              <SubmitButton>Salvar perfil</SubmitButton>
            </ActionForm>
          </Card>

          <Card title="Pacotes">
            {student.subscriptions.length === 0 && (
              <EmptyState>Nenhum pacote contratado.</EmptyState>
            )}
            <ul className="mb-4 divide-y divide-border">
              {student.subscriptions.map((item) => (
                <li key={item.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-navy">{item.packageName}</p>
                    <Badge tone={item.status === "active" ? "good" : "neutral"}>
                      {STATUS_LABEL[item.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {brl(item.priceCents)} {item.billing === "yearly" ? "por ano" : "por mês"}
                    {item.currentPeriodEnd && ` · até ${formatDate(item.currentPeriodEnd)}`}
                  </p>
                  {item.status === "active" && (
                    <ActionForm
                      action={cancelSubscription.bind(null, item.id)}
                      confirmMessage="Cancelar agora? O aluno perde o acesso imediatamente."
                      className="mt-2"
                    >
                      <SubmitButton
                        variant="danger"
                        className="px-4! py-1.5!"
                        pendingLabel="Cancelando…"
                      >
                        Cancelar agora
                      </SubmitButton>
                    </ActionForm>
                  )}
                </li>
              ))}
            </ul>

            <ActionForm
              action={grantPackage.bind(null, student.id)}
              successMessage="Pacote liberado."
              className="space-y-3 border-t border-border pt-4"
            >
              <Select label="Liberar pacote manualmente" name="packageId" required>
                {packages.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
              <Select label="Período" name="billing">
                <option value="monthly">1 mês</option>
                <option value="yearly">1 ano</option>
              </Select>
              <SubmitButton variant="secondary">Liberar pacote</SubmitButton>
            </ActionForm>
          </Card>

          <Card title="Turmas">
            {student.groups.length === 0 ? (
              <EmptyState>
                Sem turma.{" "}
                <Link href="/admin/turmas" className="font-semibold text-navy underline">
                  Abrir turmas
                </Link>
              </EmptyState>
            ) : (
              <ul className="space-y-1">
                {student.groups.map((group) => (
                  <li key={group.id}>
                    <Link
                      href={`/admin/turmas/${group.id}`}
                      className="font-semibold text-navy underline-offset-4 hover:underline"
                    >
                      {group.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Redefinir senha">
            <ActionForm
              action={setStudentPassword.bind(null, student.id)}
              successMessage="Senha redefinida. O aluno precisa entrar de novo."
              className="space-y-3"
            >
              <Field
                label="Nova senha"
                name="password"
                type="text"
                autoComplete="off"
                minLength={8}
                required
              />
              <SubmitButton variant="secondary">Redefinir senha</SubmitButton>
            </ActionForm>
          </Card>
        </div>
      </div>
    </>
  );
}
