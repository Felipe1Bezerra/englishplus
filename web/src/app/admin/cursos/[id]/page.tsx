import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  createLesson,
  deleteCourse,
  deleteLesson,
  updateCourse,
  updateLesson,
} from "@/app/actions/admin";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { QuizEditor } from "@/components/quiz-editor";
import { VideoField } from "@/components/video-field";
import { Card, Checkbox, EmptyState, Field, PageHeader, TextArea } from "@/components/ui";
import { pageApi, type AdminCourse, type AdminLesson, type YoutubeStatus } from "@/lib/api";

export const metadata: Metadata = { title: "Curso" };

export default async function CoursePage({ params }: PageProps<"/admin/cursos/[id]">) {
  const { id } = await params;
  const [courses, youtube] = await Promise.all([
    pageApi<AdminCourse[]>("/admin/courses"),
    pageApi<YoutubeStatus>("/admin/youtube"),
  ]);
  const course = courses.find((candidate) => candidate.id === id);
  if (!course) notFound();

  return (
    <>
      <Link href="/admin/cursos" className="text-sm text-muted-foreground hover:text-navy">
        ← Todos os cursos
      </Link>
      <div className="mt-4">
        <PageHeader title={course.title} />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card title="Aulas">
            {course.lessons.length === 0 && <EmptyState>Nenhuma aula neste curso.</EmptyState>}
            <div className="space-y-2">
              {course.lessons.map((lesson) => (
                <details key={lesson.id} className="rounded-xl border border-border">
                  <summary className="cursor-pointer px-4 py-3 font-semibold text-navy">
                    {lesson.title}
                  </summary>
                  <div className="border-t border-border p-4">
                    <ActionForm
                      action={updateLesson.bind(null, lesson.id)}
                      successMessage="Aula salva."
                      className="space-y-4"
                    >
                      <LessonFields lesson={lesson} youtube={youtube} />
                      <SubmitButton>Salvar aula</SubmitButton>
                    </ActionForm>
                    <ActionForm
                      action={deleteLesson.bind(null, lesson.id)}
                      confirmMessage="Excluir esta aula? Isso não pode ser desfeito."
                      className="mt-3"
                    >
                      <SubmitButton variant="danger" pendingLabel="Excluindo…">
                        Excluir aula
                      </SubmitButton>
                    </ActionForm>
                  </div>
                </details>
              ))}
            </div>
          </Card>

          <Card title="Nova aula">
            <ActionForm
              action={createLesson.bind(null, course.id)}
              successMessage="Aula criada."
              className="space-y-4"
            >
              <LessonFields youtube={youtube} />
              <SubmitButton>Criar aula</SubmitButton>
            </ActionForm>
          </Card>
        </div>

        <Card title="Dados do curso">
          <ActionForm
            action={updateCourse.bind(null, course.id)}
            successMessage="Curso salvo."
            className="space-y-4"
          >
            <Field label="Título" name="title" defaultValue={course.title} required />
            <TextArea
              label="Descrição"
              name="description"
              rows={3}
              defaultValue={course.description}
            />
            <Checkbox
              label="Visível para os alunos"
              name="active"
              defaultChecked={course.active}
            />
            <SubmitButton>Salvar</SubmitButton>
          </ActionForm>

          <ActionForm
            action={deleteCourse.bind(null, course.id)}
            confirmMessage="Excluir este curso e todas as aulas dele? Isso não pode ser desfeito."
            className="mt-5 border-t border-border pt-4"
          >
            <SubmitButton variant="danger" pendingLabel="Excluindo…">
              Excluir curso
            </SubmitButton>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}

function LessonFields({ lesson, youtube }: { lesson?: AdminLesson; youtube: YoutubeStatus }) {
  return (
    <>
      <Field label="Título" name="title" defaultValue={lesson?.title} required />
      <Field
        label="Endereço"
        name="slug"
        defaultValue={lesson?.slug}
        pattern="[a-z0-9\-]+"
        hint="Só letras minúsculas, números e hífens."
        required
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Nível" name="level" defaultValue={lesson?.level} placeholder="B1" required />
        <Field
          label="Tema"
          name="topic"
          defaultValue={lesson?.topic}
          placeholder="Gramática"
          required
        />
        <Field
          label="Minutos"
          name="minutes"
          type="number"
          min={1}
          defaultValue={lesson?.minutes ?? 15}
          required
        />
      </div>
      <TextArea label="Resumo" name="summary" rows={2} defaultValue={lesson?.summary} required />
      <VideoField defaultValue={lesson?.videoUrl} youtube={youtube} />
      <TextArea label="Texto da aula" name="body" rows={6} defaultValue={lesson?.body} />
      <QuizEditor initial={lesson?.quiz} />
    </>
  );
}
