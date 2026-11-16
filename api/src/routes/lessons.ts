import { and, asc, eq, inArray } from "drizzle-orm";
import { Router, type Request } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { courses, lessons } from "../db/schema.js";
import { requireAuth } from "../lib/auth.js";
import { HttpError } from "../lib/http.js";
import { activeCourseIds } from "../lib/subscriptions.js";
import type { LessonContent } from "../types.js";

function publicContent(content: LessonContent) {
  return {
    ...content,
    quiz: content.quiz.map(({ prompt, options }) => ({ prompt, options })),
  };
}

/** The teacher can open everything; a student needs a package with this course. */
async function findLesson(req: Request, slug: string) {
  const [lesson] = await db.select().from(lessons).where(eq(lessons.slug, slug));
  if (!lesson) throw new HttpError(404, "Aula não encontrada.");

  if (req.user!.role !== "teacher") {
    const allowed = await activeCourseIds(req.user!.id);
    if (!allowed.includes(lesson.courseId)) {
      throw new HttpError(403, "Esta aula não faz parte dos seus pacotes.");
    }
  }

  return lesson;
}

export const lessonsRouter = Router();

lessonsRouter.use(requireAuth);

lessonsRouter.get("/", async (req, res) => {
  const isTeacher = req.user!.role === "teacher";
  const allowed = isTeacher ? [] : await activeCourseIds(req.user!.id);

  if (!isTeacher && allowed.length === 0) {
    res.json([]);
    return;
  }

  const rows = await db
    .select({
      courseId: courses.id,
      courseTitle: courses.title,
      courseDescription: courses.description,
      slug: lessons.slug,
      title: lessons.title,
      level: lessons.level,
      topic: lessons.topic,
      minutes: lessons.minutes,
      summary: lessons.summary,
    })
    .from(lessons)
    .innerJoin(courses, eq(courses.id, lessons.courseId))
    .where(
      and(eq(courses.active, true), isTeacher ? undefined : inArray(courses.id, allowed)),
    )
    .orderBy(asc(courses.title), asc(lessons.sortOrder));

  res.json(rows);
});

lessonsRouter.get("/:slug", async (req, res) => {
  const { content, ...lesson } = await findLesson(req, req.params.slug);
  res.json({ ...lesson, ...publicContent(content) });
});

lessonsRouter.post("/:slug/check", async (req, res) => {
  const { content } = await findLesson(req, req.params.slug);
  const { quiz } = content;

  const answers = z
    .array(z.number().int().min(0))
    .length(quiz.length, "Responda todas as perguntas.")
    .parse(req.body?.answers);

  const results = quiz.map((question, i) => ({
    correct: answers[i] === question.answerIndex,
    answerIndex: question.answerIndex,
    explanation: question.explanation,
  }));

  res.json({
    score: results.filter((result) => result.correct).length,
    total: results.length,
    results,
  });
});
