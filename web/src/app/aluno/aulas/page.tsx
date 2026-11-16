import type { Metadata } from "next";
import Link from "next/link";
import { LessonCard } from "@/components/lesson-card";
import { EmptyState, PageHeader } from "@/components/ui";
import { pageApi, type LessonSummary } from "@/lib/api";

export const metadata: Metadata = { title: "Cursos e aulas" };

export default async function CoursesPage() {
  const lessons = await pageApi<LessonSummary[]>("/lessons");
  const courses = [...new Map(lessons.map((lesson) => [lesson.courseId, lesson])).values()];

  return (
    <>
      <PageHeader title="Cursos e aulas" description="Os cursos incluídos nos seus pacotes." />

      {courses.length === 0 && (
        <EmptyState>
          Seus cursos aparecem aqui quando você tiver um pacote ativo.{" "}
          <Link href="/#planos" className="font-bold text-navy underline">
            Ver pacotes
          </Link>
        </EmptyState>
      )}

      <div className="space-y-10">
        {courses.map(({ courseId, courseTitle, courseDescription }) => (
          <section key={courseId}>
            <h2 className="text-xl font-bold text-navy">{courseTitle}</h2>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">{courseDescription}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {lessons
                .filter((lesson) => lesson.courseId === courseId)
                .map((lesson) => (
                  <LessonCard key={lesson.slug} lesson={lesson} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
