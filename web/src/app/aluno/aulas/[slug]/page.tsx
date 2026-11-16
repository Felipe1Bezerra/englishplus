import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Quiz } from "@/components/quiz";
import { Card } from "@/components/ui";
import { ApiError, api, type Lesson } from "@/lib/api";
import { youtubeEmbed, youtubeId } from "@/lib/youtube";

export const metadata: Metadata = { title: "Aula" };

export default async function LessonPage({ params }: PageProps<"/aluno/aulas/[slug]">) {
  const { slug } = await params;

  let lesson: Lesson;

  try {
    lesson = await api<Lesson>(`/lessons/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/entrar");
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) return <NoAccess />;
    throw error;
  }

  const videoId = youtubeId(lesson.videoUrl);

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/aluno/aulas" className="text-sm text-muted-foreground hover:text-navy">
        ← Todas as aulas
      </Link>
      <title>{`${lesson.title} | English+`}</title>
      <header className="mt-6 border-b border-border pb-8">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-navy">{lesson.level}</span> · {lesson.topic} ·{" "}
          {lesson.minutes} min
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-balance text-navy sm:text-4xl">
          {lesson.title}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">{lesson.summary}</p>
        {videoId ? (
          <div className="mt-6 aspect-video overflow-hidden rounded-2xl border border-border bg-navy">
            <iframe
              src={youtubeEmbed(videoId)}
              title={`Vídeo: ${lesson.title}`}
              className="size-full"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : lesson.videoUrl && (
          <a
            href={lesson.videoUrl}
            target="_blank"
            rel="noopener"
            className="mt-5 inline-block rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-cream"
          >
            Assistir à aula
          </a>
        )}
      </header>

      {lesson.sections.map((section) => (
        <section key={section.heading} className="mt-10">
          <h2 className="text-2xl font-bold text-navy">{section.heading}</h2>
          <p className="mt-3 leading-7 whitespace-pre-line">{section.body}</p>
          {section.examples.length > 0 && (
            <ul lang="en" className="mt-4 space-y-2 border-l-2 border-gold pl-4">
              {section.examples.map((example) => (
                <li key={example} className="text-muted-foreground italic">
                  {example}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {lesson.vocabulary.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-navy">Vocabulário</h2>
          <dl className="mt-4 divide-y divide-border border-y border-border">
            {lesson.vocabulary.map((item) => (
              <div key={item.term} className="py-4">
                <dt className="font-semibold">{item.term}</dt>
                <dd className="mt-1">{item.definition}</dd>
                <dd className="mt-1 text-muted-foreground italic">{item.example}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {lesson.quiz.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-navy">Exercício</h2>
          <p className="mt-2 mb-6 text-muted-foreground">
            Responda tudo e confira sua nota.
          </p>
          <Quiz slug={lesson.slug} questions={lesson.quiz} />
        </section>
      )}
    </article>
  );
}

function NoAccess() {
  return (
    <Card className="mx-auto max-w-xl text-center">
      <h1 className="text-xl font-bold text-navy">Esta aula não está nos seus pacotes</h1>
      <p className="mt-2 text-muted-foreground">Escolha um pacote para liberar este conteúdo.</p>
      <Link
        href="/#planos"
        className="mt-5 inline-block rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-navy"
      >
        Ver pacotes
      </Link>
    </Card>
  );
}
