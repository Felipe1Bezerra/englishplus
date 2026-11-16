import type { Metadata } from "next";
import { connection } from "next/server";
import { createClass } from "@/app/actions/admin";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { MonthCalendar } from "@/components/month-calendar";
import { Card, Field, PageHeader, Select } from "@/components/ui";
import { pageApi, type AdminGroup, type AdminSession, type StudentRow } from "@/lib/api";
import { monthRange, parseMonth } from "@/lib/format";

export const metadata: Metadata = { title: "Calendário" };

export default async function AdminCalendar({ searchParams }: PageProps<"/admin/calendario">) {
  const { mes } = await searchParams;
  await connection(); // "Today" must be worked out per request, not at build time.
  const month = parseMonth(mes, new Date());
  const { from, to } = monthRange(month);

  const [sessions, groups, students] = await Promise.all([
    pageApi<AdminSession[]>(`/admin/sessions?from=${from}&to=${to}`),
    pageApi<AdminGroup[]>("/admin/groups"),
    pageApi<StudentRow[]>("/admin/students?q="),
  ]);

  return (
    <>
      <PageHeader
        title="Calendário"
        description="Aulas de todas as turmas e alunos, no horário de Brasília."
      />

      <div className="space-y-6">
        <MonthCalendar
          month={month}
          classes={sessions}
          basePath="/admin/calendario"
          classHref={(item) => `/admin/calendario/${item.id}`}
        />

        <Card title="Marcar aula">
          <ActionForm
            action={createClass}
            successMessage="Aula marcada."
            className="grid gap-4 sm:grid-cols-2"
          >
            <Field label="Título" name="title" placeholder="Conversação" required />
            <Select label="Para quem" name="audience" required defaultValue="">
              <option value="" disabled>
                Escolha uma turma ou aluno
              </option>
              <optgroup label="Turmas">
                {groups.map((group) => (
                  <option key={group.id} value={`group:${group.id}`}>
                    {group.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Aulas individuais">
                {students.map((student) => (
                  <option key={student.id} value={`student:${student.id}`}>
                    {student.name}
                  </option>
                ))}
              </optgroup>
            </Select>
            <Field label="Data e horário" name="startsAt" type="datetime-local" required />
            <Field
              label="Duração (minutos)"
              name="duration"
              type="number"
              min={15}
              step={15}
              defaultValue={60}
              required
            />
            <Field
              label="Repetir por quantas semanas"
              name="weeks"
              type="number"
              min={1}
              max={52}
              defaultValue={1}
              hint="1 marca só esta aula."
              required
            />
            <Field
              label="Link da sala"
              name="meetingUrl"
              type="url"
              hint="Em branco usa o link da turma."
            />
            <div className="sm:col-span-2">
              <SubmitButton pendingLabel="Marcando…">Marcar aula</SubmitButton>
            </div>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
