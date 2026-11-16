import type { Metadata } from "next";
import { connection } from "next/server";
import { MonthCalendar } from "@/components/month-calendar";
import { PageHeader } from "@/components/ui";
import { pageApi, type CalendarClass } from "@/lib/api";
import { monthRange, parseMonth } from "@/lib/format";

export const metadata: Metadata = { title: "Calendário" };

export default async function StudentCalendar({ searchParams }: PageProps<"/aluno/calendario">) {
  const { mes } = await searchParams;
  await connection(); // "Today" must be worked out per request, not at build time.
  const month = parseMonth(mes, new Date());
  const { from, to } = monthRange(month);
  const classes = await pageApi<CalendarClass[]>(`/me/calendar?from=${from}&to=${to}`);

  return (
    <>
      <PageHeader
        title="Calendário"
        description="Suas aulas e as da sua turma, no horário de Brasília."
      />
      <MonthCalendar
        month={month}
        classes={classes}
        basePath="/aluno/calendario"
        classHref={() => null}
      />
    </>
  );
}
