import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteClass, markAttendance, setClassStatus } from "@/app/actions/admin";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { ApiError, pageApi, type SessionDetail } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Aula" };

export default async function ClassPage({ params }: PageProps<"/admin/calendario/[id]">) {
  const { id } = await params;
  const session = await pageApi<SessionDetail>(`/admin/sessions/${id}`).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  const isCancelled = session.status === "cancelled";

  return (
    <>
      <Link href="/admin/calendario" className="text-sm text-muted-foreground hover:text-navy">
        ← Calendário
      </Link>
      <div className="mt-4">
        <PageHeader
          title={session.title}
          description={formatDateTime(session.startsAt)}
          action={isCancelled ? <Badge tone="bad">Cancelada</Badge> : undefined}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Presença">
          {session.students.length === 0 && <EmptyState>Nenhum aluno nesta aula.</EmptyState>}
          <ul className="divide-y divide-border">
            {session.students.map((student) => (
              <li key={student.id} className="flex items-center justify-between gap-3 py-3">
                <Link
                  href={`/admin/alunos/${student.id}`}
                  className="font-semibold text-navy underline-offset-4 hover:underline"
                >
                  {student.name}
                </Link>
                <div className="flex gap-2">
                  <AttendanceButton
                    sessionId={session.id}
                    studentId={student.id}
                    status="present"
                    current={student.attendance}
                  />
                  <AttendanceButton
                    sessionId={session.id}
                    studentId={student.id}
                    status="absent"
                    current={student.attendance}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Gerenciar aula">
          <div className="space-y-3">
            <ActionForm
              action={setClassStatus.bind(
                null,
                session.id,
                isCancelled ? "scheduled" : "cancelled",
              )}
            >
              <SubmitButton variant="secondary" className="w-full">
                {isCancelled ? "Reativar aula" : "Cancelar aula"}
              </SubmitButton>
            </ActionForm>
            <ActionForm
              action={deleteClass.bind(null, session.id)}
              confirmMessage="Excluir esta aula e suas presenças? Isso não pode ser desfeito."
            >
              <SubmitButton variant="danger" className="w-full" pendingLabel="Excluindo…">
                Excluir aula
              </SubmitButton>
            </ActionForm>
          </div>
        </Card>
      </div>
    </>
  );
}

function AttendanceButton({
  sessionId,
  studentId,
  status,
  current,
}: {
  sessionId: string;
  studentId: string;
  status: "present" | "absent";
  current: "present" | "absent" | null;
}) {
  const isSelected = current === status;
  const label = status === "present" ? "Presente" : "Faltou";

  return (
    <ActionForm action={markAttendance.bind(null, sessionId, studentId, status)}>
      <button
        type="submit"
        aria-pressed={isSelected}
        className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
          isSelected
            ? status === "present"
              ? "border-good bg-good-soft text-good"
              : "border-bad bg-bad-soft text-bad"
            : "border-border bg-card text-navy hover:border-navy"
        }`}
      >
        {label}
      </button>
    </ActionForm>
  );
}
