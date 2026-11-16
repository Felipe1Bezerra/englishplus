import type { Metadata } from "next";
import Link from "next/link";
import { Badge, EmptyState, PageHeader, Table } from "@/components/ui";
import { pageApi, type StudentRow } from "@/lib/api";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Alunos" };

export default async function StudentsPage({ searchParams }: PageProps<"/admin/alunos">) {
  const { q } = await searchParams;
  const search = typeof q === "string" ? q : "";
  const students = await pageApi<StudentRow[]>(`/admin/students?q=${encodeURIComponent(search)}`);

  return (
    <>
      <PageHeader title="Alunos" description="Abra um aluno para ver o acompanhamento completo." />

      <form className="mb-5 flex max-w-md gap-2" role="search">
        <input
          name="q"
          type="search"
          defaultValue={search}
          aria-label="Buscar por nome ou e-mail"
          placeholder="Buscar por nome ou e-mail"
          className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-[15px]"
        />
        <button
          type="submit"
          className="rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-cream"
        >
          Buscar
        </button>
      </form>

      {students.length === 0 ? (
        <EmptyState>{search ? "Nenhum aluno encontrado." : "Ainda não há alunos."}</EmptyState>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Pacotes ativos</th>
              <th>Nível</th>
              <th>Desde</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>
                  <Link
                    href={`/admin/alunos/${student.id}`}
                    className="font-semibold text-navy underline-offset-4 hover:underline"
                  >
                    {student.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{student.email}</p>
                  {!student.active && <Badge tone="bad">Desativado</Badge>}
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {student.packages.length === 0 && (
                      <span className="text-muted-foreground">Nenhum</span>
                    )}
                    {student.packages.map((name) => (
                      <Badge key={name} tone="good">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td>{student.level ?? "–"}</td>
                <td>{formatDate(student.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
