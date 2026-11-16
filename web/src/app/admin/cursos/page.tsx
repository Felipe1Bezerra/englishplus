import type { Metadata } from "next";
import Link from "next/link";
import { createCourse } from "@/app/actions/admin";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { Badge, Card, Checkbox, EmptyState, Field, PageHeader, TextArea } from "@/components/ui";
import { pageApi, type AdminCourse } from "@/lib/api";

export const metadata: Metadata = { title: "Cursos" };

export default async function CoursesAdminPage() {
  const courses = await pageApi<AdminCourse[]>("/admin/courses");

  return (
    <>
      <PageHeader
        title="Cursos"
        description="Crie cursos e escolha em Pacotes quais fazem parte de cada um."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          {courses.length === 0 && <EmptyState>Nenhum curso criado ainda.</EmptyState>}
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/admin/cursos/${course.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 hover:border-navy"
            >
              <div className="min-w-0">
                <p className="font-bold text-navy">{course.title}</p>
                <p className="text-sm text-muted-foreground">
                  {course.lessons.length} {course.lessons.length === 1 ? "aula" : "aulas"}
                </p>
              </div>
              {!course.active && <Badge tone="bad">Oculto</Badge>}
            </Link>
          ))}
        </div>

        <Card title="Novo curso">
          <ActionForm action={createCourse} successMessage="Curso criado." className="space-y-4">
            <Field label="Título" name="title" required />
            <TextArea label="Descrição" name="description" rows={3} />
            <Checkbox label="Visível para os alunos" name="active" defaultChecked />
            <SubmitButton>Criar curso</SubmitButton>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
