import { eq, sql } from "drizzle-orm";
import { lessons as seedLessons } from "../data/lessons.js";
import { hashPassword } from "../lib/auth.js";
import { db } from "./index.js";
import { courses, lessons, packageCourses, packages, users } from "./schema.js";

const PACKAGES = [
  {
    slug: "individual",
    name: "Individual",
    kind: "individual" as const,
    cadence: "2 aulas por semana",
    description: "Aulas particulares ao vivo 100% personalizadas para o seu objetivo.",
    features: [
      "Aulas 1-1 ao vivo",
      "Conteúdo personalizado",
      "Foco total em você",
      "Flexibilidade de horários",
    ],
    monthlyCents: 80000,
    yearlyCents: 800000,
    sortOrder: 1,
  },
  {
    slug: "em-grupo",
    name: "Em Grupo",
    kind: "group" as const,
    cadence: "2 aulas por semana",
    description: "Aulas ao vivo em grupo com interação e prática de conversação.",
    features: [
      "Aulas ao vivo em grupo",
      "Prática com outros alunos",
      "Ambiente dinâmico",
      "Ótimo custo-benefício",
    ],
    monthlyCents: 30000,
    yearlyCents: 300000,
    sortOrder: 2,
  },
  {
    slug: "plataforma",
    name: "Plataforma",
    kind: "platform" as const,
    cadence: "2 aulas gravadas por semana",
    description: "Acesso ilimitado a uma plataforma completa com aulas, exercícios e muito mais.",
    features: [
      "2 aulas novas gravadas/semana",
      "Plataforma super completa",
      "Exercícios e materiais",
      "Acesso 24h por dia",
    ],
    monthlyCents: 4990,
    yearlyCents: 49900,
    sortOrder: 3,
  },
];

const COURSES = [
  {
    title: "Inglês para o dia a dia",
    description: "Frases e situações reais para se virar em qualquer conversa.",
    lessonSlugs: ["ordering-at-a-restaurant"],
  },
  {
    title: "Gramática sem decoreba",
    description: "A estrutura do inglês explicada no contexto certo.",
    lessonSlugs: ["present-perfect-vs-past-simple"],
  },
  {
    title: "Inglês para o trabalho",
    description: "Vocabulário e escrita para reuniões, e-mails e o dia a dia profissional.",
    lessonSlugs: ["phrasal-verbs-at-work", "writing-polite-emails"],
  },
];

async function seedCatalog(): Promise<void> {
  await db.insert(packages).values(PACKAGES).onConflictDoNothing();

  const [{ count } = { count: 0 }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(courses);
  if (count > 0) return;

  const allPackages = await db.select({ id: packages.id }).from(packages);

  for (const { lessonSlugs, ...course } of COURSES) {
    const [created] = await db.insert(courses).values(course).returning({ id: courses.id });
    if (!created) continue;

    await db
      .insert(packageCourses)
      .values(allPackages.map(({ id }) => ({ packageId: id, courseId: created.id })));

    for (const [sortOrder, slug] of lessonSlugs.entries()) {
      const lesson = seedLessons.find((item) => item.slug === slug);
      if (!lesson) continue;
      const { sections, vocabulary, quiz, ...details } = lesson;
      await db.insert(lessons).values({
        ...details,
        courseId: created.id,
        sortOrder,
        content: { sections, vocabulary, quiz },
      });
    }
  }
}

/** Creates the teacher login from TEACHER_EMAIL and TEACHER_PASSWORD on first start. */
async function seedTeacher(): Promise<void> {
  const email = process.env.TEACHER_EMAIL?.toLowerCase();
  const password = process.env.TEACHER_PASSWORD;
  if (!email || !password) return;

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.role, "teacher"));
  if (existing) return;

  await db.insert(users).values({
    name: process.env.TEACHER_NAME ?? "Felipe Bezerra",
    email,
    passwordHash: await hashPassword(password),
    role: "teacher",
  });
}

export async function seed(): Promise<void> {
  await seedCatalog();
  await seedTeacher();
}
