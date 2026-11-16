import Link from "next/link";
import type { LessonSummary } from "@/lib/api";

export function LessonCard({ lesson }: { lesson: LessonSummary }) {
  return (
    <Link
      href={`/aluno/aulas/${lesson.slug}`}
      className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-navy"
    >
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-navy">{lesson.level}</span> · {lesson.topic} ·{" "}
        {lesson.minutes} min
      </p>
      <h3 className="mt-2 text-lg font-bold text-navy">{lesson.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{lesson.summary}</p>
    </Link>
  );
}
