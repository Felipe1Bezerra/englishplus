import { and, asc, count, desc, eq, gte, ilike, inArray, lt, or, sql, sum } from "drizzle-orm";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import {
  attendance,
  authSessions,
  classSessions,
  courses,
  followUpNotes,
  groupMembers,
  groups,
  lessons,
  packageCourses,
  packages,
  payments,
  subscriptions,
  users,
} from "../db/schema.js";
import { hashPassword, requireAuth, requireTeacher } from "../lib/auth.js";
import { HttpError, validateUuidParams } from "../lib/http.js";
import * as youtube from "../lib/youtube.js";
import { paymentProvider } from "../payments/index.js";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || null)
  .nullable()
  .optional();

const optionalUrl = z
  .union([z.url("Informe um link válido, começando com https://"), z.literal(""), z.null()])
  .transform((value) => value || null)
  .optional();

const packageBody = z.object({
  name: z.string().trim().min(1, "Informe o nome do pacote."),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "O endereço usa só letras minúsculas, números e hífens."),
  kind: z.enum(["individual", "group", "platform"]),
  cadence: z.string().trim().min(1, "Informe a frequência das aulas."),
  description: z.string().trim().min(1, "Informe a descrição."),
  features: z.array(z.string().trim().min(1)).min(1, "Inclua pelo menos um benefício."),
  monthlyCents: z.number().int().positive("Informe o preço mensal."),
  yearlyCents: z.number().int().positive("Informe o preço anual."),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

const courseBody = z.object({
  title: z.string().trim().min(1, "Informe o título do curso."),
  description: z.string().trim().default(""),
  active: z.boolean().default(true),
});

const quizQuestion = z
  .object({
    prompt: z.string().trim().min(1, "Escreva o enunciado de cada pergunta."),
    options: z
      .array(z.string().trim().min(1, "Preencha todas as alternativas."))
      .min(2, "Cada pergunta precisa de pelo menos 2 alternativas.")
      .max(6, "Use no máximo 6 alternativas por pergunta."),
    answerIndex: z.number().int().min(0),
    explanation: z.string().trim().default(""),
  })
  .refine((question) => question.answerIndex < question.options.length, {
    message: "Marque a alternativa certa de cada pergunta.",
  })
  .refine((question) => new Set(question.options).size === question.options.length, {
    message: "As alternativas de uma pergunta não podem se repetir.",
  });

const lessonBody = z.object({
  title: z.string().trim().min(1, "Informe o título da aula."),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "O endereço usa só letras minúsculas, números e hífens."),
  level: z.string().trim().min(1, "Informe o nível."),
  topic: z.string().trim().min(1, "Informe o tema."),
  minutes: z.number().int().positive("Informe a duração."),
  summary: z.string().trim().min(1, "Informe o resumo."),
  videoUrl: optionalUrl,
  body: z.string().trim().default(""),
  /** Left out, the lesson keeps the activities it already has. */
  quiz: z.array(quizQuestion).max(50, "Use no máximo 50 perguntas.").optional(),
});

const groupBody = z.object({
  name: z.string().trim().min(1, "Informe o nome da turma."),
  level: z.string().trim().default(""),
  meetingUrl: optionalUrl,
  capacity: z.number().int().positive("Informe a capacidade."),
  active: z.boolean().default(true),
});

const sessionBody = z
  .object({
    title: z.string().trim().min(1, "Informe o título da aula."),
    groupId: z.uuid().nullable().optional(),
    studentId: z.uuid().nullable().optional(),
    startsAt: z.coerce.date(),
    durationMinutes: z.number().int().positive("Informe a duração."),
    meetingUrl: optionalUrl,
    weeks: z.number().int().min(1).max(52).default(1),
  })
  .refine((body) => Boolean(body.groupId) !== Boolean(body.studentId), {
    message: "Escolha uma turma ou um aluno.",
  });

const studentPatch = z.object({
  name: z.string().trim().min(2, "Informe o nome.").optional(),
  phone: optionalText,
  level: optionalText,
  goal: optionalText,
  active: z.boolean().optional(),
});

const noteBody = z.object({
  body: z.string().trim().min(1, "Escreva a anotação."),
  shared: z.boolean().default(false),
});

const grantBody = z.object({ packageId: z.uuid(), billing: z.enum(["monthly", "yearly"]) });

const attendanceBody = z.object({
  studentId: z.uuid(),
  status: z.enum(["present", "absent"]),
});

function notFoundUnless<T>(row: T | undefined, message = "Não encontrado."): T {
  if (row === undefined) throw new HttpError(404, message);
  return row;
}

export const adminRouter = Router();

validateUuidParams(adminRouter, "id", "userId");

// Every route below this line is teacher-only.
adminRouter.use(requireAuth, requireTeacher);

adminRouter.get("/overview", async (_req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [students] = await db
    .select({ value: count() })
    .from(users)
    .where(and(eq(users.role, "student"), eq(users.active, true)));

  const [activeSubscriptions] = await db
    .select({ value: count() })
    .from(subscriptions)
    .where(and(eq(subscriptions.status, "active"), gte(subscriptions.currentPeriodEnd, now)));

  const [revenue] = await db
    .select({ value: sum(payments.amountCents) })
    .from(payments)
    .where(gte(payments.paidAt, monthStart));

  const upcoming = await db
    .select({
      id: classSessions.id,
      title: classSessions.title,
      startsAt: classSessions.startsAt,
      groupName: groups.name,
      studentName: users.name,
    })
    .from(classSessions)
    .leftJoin(groups, eq(groups.id, classSessions.groupId))
    .leftJoin(users, eq(users.id, classSessions.studentId))
    .where(and(gte(classSessions.startsAt, now), eq(classSessions.status, "scheduled")))
    .orderBy(asc(classSessions.startsAt))
    .limit(6);

  // People who paid for live classes but have nothing arranged yet.
  const needsPlacement = await db
    .select({ id: users.id, name: users.name, packageName: packages.name, kind: packages.kind })
    .from(subscriptions)
    .innerJoin(users, eq(users.id, subscriptions.userId))
    .innerJoin(packages, eq(packages.id, subscriptions.packageId))
    .where(
      and(
        eq(subscriptions.status, "active"),
        gte(subscriptions.currentPeriodEnd, now),
        or(
          and(
            eq(packages.kind, "group"),
            sql`not exists (select 1 from ${groupMembers} where ${groupMembers.userId} = ${users.id})`,
          ),
          and(
            eq(packages.kind, "individual"),
            sql`not exists (select 1 from ${classSessions} where ${classSessions.studentId} = ${users.id} and ${classSessions.startsAt} >= ${now})`,
          ),
        ),
      ),
    );

  res.json({
    students: students?.value ?? 0,
    activeSubscriptions: activeSubscriptions?.value ?? 0,
    revenueThisMonthCents: Number(revenue?.value ?? 0),
    upcoming,
    needsPlacement,
  });
});

/* Students and follow-up */

adminRouter.get("/students", async (req, res) => {
  const search = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const pattern = `%${search}%`;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      level: users.level,
      active: users.active,
      createdAt: users.createdAt,
      packages: sql<string[]>`coalesce(
        array_agg(${packages.name}) filter (where ${packages.name} is not null),
        '{}'
      )`,
    })
    .from(users)
    .leftJoin(
      subscriptions,
      and(
        eq(subscriptions.userId, users.id),
        eq(subscriptions.status, "active"),
        gte(subscriptions.currentPeriodEnd, new Date()),
      ),
    )
    .leftJoin(packages, eq(packages.id, subscriptions.packageId))
    .where(
      and(
        eq(users.role, "student"),
        search ? or(ilike(users.name, pattern), ilike(users.email, pattern)) : undefined,
      ),
    )
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));

  res.json(rows);
});

adminRouter.get("/students/:id", async (req, res) => {
  const id = req.params.id!;

  const [student] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      level: users.level,
      goal: users.goal,
      active: users.active,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(and(eq(users.id, id), eq(users.role, "student")));
  notFoundUnless(student, "Aluno não encontrado.");

  const [studentSubscriptions, studentGroups, notes, attendanceRows] = await Promise.all([
    db
      .select({
        id: subscriptions.id,
        status: subscriptions.status,
        billing: subscriptions.billing,
        priceCents: subscriptions.priceCents,
        provider: subscriptions.provider,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        packageName: packages.name,
      })
      .from(subscriptions)
      .innerJoin(packages, eq(packages.id, subscriptions.packageId))
      .where(eq(subscriptions.userId, id))
      .orderBy(desc(subscriptions.createdAt)),
    db
      .select({ id: groups.id, name: groups.name })
      .from(groupMembers)
      .innerJoin(groups, eq(groups.id, groupMembers.groupId))
      .where(eq(groupMembers.userId, id)),
    db
      .select()
      .from(followUpNotes)
      .where(eq(followUpNotes.studentId, id))
      .orderBy(desc(followUpNotes.createdAt)),
    db
      .select({
        status: attendance.status,
        sessionId: classSessions.id,
        title: classSessions.title,
        startsAt: classSessions.startsAt,
      })
      .from(attendance)
      .innerJoin(classSessions, eq(classSessions.id, attendance.sessionId))
      .where(eq(attendance.studentId, id))
      .orderBy(desc(classSessions.startsAt))
      .limit(20),
  ]);

  res.json({
    ...student,
    subscriptions: studentSubscriptions,
    groups: studentGroups,
    notes,
    attendance: attendanceRows,
  });
});

adminRouter.patch("/students/:id", async (req, res) => {
  const body = studentPatch.parse(req.body);
  const [updated] = await db
    .update(users)
    .set(body)
    .where(and(eq(users.id, req.params.id!), eq(users.role, "student")))
    .returning({ id: users.id });
  notFoundUnless(updated, "Aluno não encontrado.");

  if (body.active === false) {
    await db.delete(authSessions).where(eq(authSessions.userId, updated!.id));
  }
  res.status(204).end();
});

adminRouter.post("/students/:id/password", async (req, res) => {
  const password = z
    .string()
    .min(8, "A senha precisa ter pelo menos 8 caracteres.")
    .parse(req.body?.password);

  const [updated] = await db
    .update(users)
    .set({ passwordHash: await hashPassword(password) })
    .where(and(eq(users.id, req.params.id!), eq(users.role, "student")))
    .returning({ id: users.id });
  notFoundUnless(updated, "Aluno não encontrado.");

  await db.delete(authSessions).where(eq(authSessions.userId, updated!.id));
  res.status(204).end();
});

adminRouter.post("/students/:id/notes", async (req, res) => {
  const body = noteBody.parse(req.body);
  await db
    .insert(followUpNotes)
    .values({ ...body, studentId: req.params.id!, authorId: req.user!.id });
  res.status(201).end();
});

adminRouter.delete("/notes/:id", async (req, res) => {
  await db.delete(followUpNotes).where(eq(followUpNotes.id, req.params.id!));
  res.status(204).end();
});

adminRouter.post("/students/:id/subscriptions", async (req, res) => {
  const body = grantBody.parse(req.body);
  const [selected] = await db.select().from(packages).where(eq(packages.id, body.packageId));
  const chosen = notFoundUnless(selected, "Pacote não encontrado.");

  const periodEnd = new Date();
  if (body.billing === "yearly") periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  else periodEnd.setMonth(periodEnd.getMonth() + 1);

  await db.insert(subscriptions).values({
    userId: req.params.id!,
    packageId: chosen.id,
    billing: body.billing,
    status: "active",
    priceCents: body.billing === "yearly" ? chosen.yearlyCents : chosen.monthlyCents,
    provider: "manual",
    currentPeriodEnd: periodEnd,
  });
  res.status(201).end();
});

/** Ends a subscription now, unlike a student's cancellation, which runs to the period's end. */
adminRouter.post("/subscriptions/:id/cancel", async (req, res) => {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, req.params.id!));
  const found = notFoundUnless(subscription, "Assinatura não encontrada.");

  if (found.providerRef) await paymentProvider.cancelRecurring(found.providerRef);

  await db
    .update(subscriptions)
    .set({ status: "cancelled", currentPeriodEnd: new Date() })
    .where(eq(subscriptions.id, found.id));
  res.status(204).end();
});

/* Packages */

adminRouter.get("/packages", async (_req, res) => {
  const rows = await db.select().from(packages).orderBy(asc(packages.sortOrder));
  const links = await db.select().from(packageCourses);

  res.json(
    rows.map((row) => ({
      ...row,
      courseIds: links.filter((link) => link.packageId === row.id).map((link) => link.courseId),
    })),
  );
});

adminRouter.post("/packages", async (req, res) => {
  const body = packageBody.parse(req.body);
  const created = await db
    .insert(packages)
    .values(body)
    .onConflictDoNothing()
    .returning({ id: packages.id });
  if (created.length === 0) throw new HttpError(409, "Já existe um pacote com este endereço.");
  res.status(201).json(created[0]);
});

adminRouter.put("/packages/:id", async (req, res) => {
  const body = packageBody.parse(req.body);
  const [updated] = await db
    .update(packages)
    .set(body)
    .where(eq(packages.id, req.params.id!))
    .returning({ id: packages.id });
  notFoundUnless(updated, "Pacote não encontrado.");
  res.status(204).end();
});

adminRouter.put("/packages/:id/courses", async (req, res) => {
  const courseIds = z.array(z.uuid()).parse(req.body?.courseIds);
  const packageId = req.params.id!;

  await db.transaction(async (tx) => {
    await tx.delete(packageCourses).where(eq(packageCourses.packageId, packageId));
    if (courseIds.length > 0) {
      await tx
        .insert(packageCourses)
        .values(courseIds.map((courseId) => ({ packageId, courseId })));
    }
  });
  res.status(204).end();
});

/* Courses and lessons */

adminRouter.get("/courses", async (_req, res) => {
  const rows = await db.select().from(courses).orderBy(asc(courses.title));
  const courseLessons = await db
    .select({
      id: lessons.id,
      courseId: lessons.courseId,
      title: lessons.title,
      slug: lessons.slug,
      level: lessons.level,
      topic: lessons.topic,
      minutes: lessons.minutes,
      summary: lessons.summary,
      videoUrl: lessons.videoUrl,
      content: lessons.content,
    })
    .from(lessons)
    .orderBy(asc(lessons.sortOrder));

  res.json(
    rows.map((row) => ({
      ...row,
      lessons: courseLessons
        .filter((lesson) => lesson.courseId === row.id)
        .map(({ content, ...lesson }) => ({
          ...lesson,
          body: content.sections[0]?.body ?? "",
          quiz: content.quiz,
        })),
    })),
  );
});

adminRouter.post("/courses", async (req, res) => {
  const [created] = await db
    .insert(courses)
    .values(courseBody.parse(req.body))
    .returning({ id: courses.id });
  res.status(201).json(created);
});

adminRouter.put("/courses/:id", async (req, res) => {
  const [updated] = await db
    .update(courses)
    .set(courseBody.parse(req.body))
    .where(eq(courses.id, req.params.id!))
    .returning({ id: courses.id });
  notFoundUnless(updated, "Curso não encontrado.");
  res.status(204).end();
});

adminRouter.delete("/courses/:id", async (req, res) => {
  await db.delete(courses).where(eq(courses.id, req.params.id!));
  res.status(204).end();
});

adminRouter.post("/courses/:id/lessons", async (req, res) => {
  const { body, quiz, ...lesson } = lessonBody.parse(req.body);
  const created = await db
    .insert(lessons)
    .values({
      ...lesson,
      courseId: req.params.id!,
      content: {
        sections: body ? [{ heading: lesson.title, body, examples: [] }] : [],
        vocabulary: [],
        quiz: quiz ?? [],
      },
    })
    .onConflictDoNothing()
    .returning({ id: lessons.id });
  if (created.length === 0) throw new HttpError(409, "Já existe uma aula com este endereço.");
  res.status(201).json(created[0]);
});

adminRouter.put("/lessons/:id", async (req, res) => {
  const { body, quiz, ...details } = lessonBody.parse(req.body);
  const [existing] = await db.select().from(lessons).where(eq(lessons.id, req.params.id!));
  const lesson = notFoundUnless(existing, "Aula não encontrada.");

  // The form edits the first text block and the activities; examples and vocabulary stay as they are.
  const [first, ...rest] = lesson.content.sections;
  const sections = body
    ? [{ heading: first?.heading ?? details.title, examples: [], ...first, body }, ...rest]
    : rest;

  await db
    .update(lessons)
    .set({
      ...details,
      content: { ...lesson.content, sections, quiz: quiz ?? lesson.content.quiz },
    })
    .where(eq(lessons.id, lesson.id));
  res.status(204).end();
});

adminRouter.delete("/lessons/:id", async (req, res) => {
  await db.delete(lessons).where(eq(lessons.id, req.params.id!));
  res.status(204).end();
});

/* YouTube: connect the teacher's channel and list its videos for lessons */

adminRouter.get("/youtube", async (req, res) => {
  const account = await youtube.getAccount(req.user!.id);
  res.json({
    configured: youtube.isConfigured(),
    connected: Boolean(account),
    channelTitle: account?.channelTitle ?? null,
  });
});

adminRouter.post("/youtube/connect", async (req, res) => {
  const returnTo = z
    .string()
    .regex(/^\/admin(\/[\w/-]*)?$/)
    .catch("/admin/cursos")
    .parse(req.body?.returnTo);
  res.json({ url: youtube.startConnection(req.user!.id, returnTo) });
});

adminRouter.post("/youtube/callback", async (req, res) => {
  const { code, state } = z
    .object({ code: z.string().min(1), state: z.string().min(1) })
    .parse(req.body);
  res.json({ returnTo: await youtube.finishConnection(req.user!.id, code, state) });
});

adminRouter.get("/youtube/videos", async (req, res) => {
  const account = await youtube.getAccount(req.user!.id);
  if (!account) throw new HttpError(409, "Conecte o seu canal do YouTube primeiro.");
  const pageToken = z.string().max(200).optional().catch(undefined).parse(req.query.pageToken);
  res.json(await youtube.listVideos(account, pageToken));
});

adminRouter.delete("/youtube", async (req, res) => {
  const account = await youtube.getAccount(req.user!.id);
  if (account) await youtube.disconnect(account);
  res.status(204).end();
});

/* Groups */

adminRouter.get("/groups", async (_req, res) => {
  const rows = await db.select().from(groups).orderBy(asc(groups.name));
  const members = await db
    .select({
      groupId: groupMembers.groupId,
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(groupMembers)
    .innerJoin(users, eq(users.id, groupMembers.userId))
    .orderBy(asc(users.name));

  res.json(
    rows.map((row) => ({
      ...row,
      members: members
        .filter((member) => member.groupId === row.id)
        .map(({ id, name, email }) => ({ id, name, email })),
    })),
  );
});

adminRouter.post("/groups", async (req, res) => {
  const [created] = await db
    .insert(groups)
    .values(groupBody.parse(req.body))
    .returning({ id: groups.id });
  res.status(201).json(created);
});

adminRouter.put("/groups/:id", async (req, res) => {
  const [updated] = await db
    .update(groups)
    .set(groupBody.parse(req.body))
    .where(eq(groups.id, req.params.id!))
    .returning({ id: groups.id });
  notFoundUnless(updated, "Turma não encontrada.");
  res.status(204).end();
});

adminRouter.delete("/groups/:id", async (req, res) => {
  await db.delete(groups).where(eq(groups.id, req.params.id!));
  res.status(204).end();
});

adminRouter.post("/groups/:id/members", async (req, res) => {
  const userId = z.uuid("Escolha um aluno.").parse(req.body?.userId);
  const groupId = req.params.id!;

  const [group] = await db.select().from(groups).where(eq(groups.id, groupId));
  const found = notFoundUnless(group, "Turma não encontrada.");

  const [members] = await db
    .select({ value: count() })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId));
  if ((members?.value ?? 0) >= found.capacity) throw new HttpError(409, "Esta turma está cheia.");

  await db.insert(groupMembers).values({ groupId, userId }).onConflictDoNothing();
  res.status(201).end();
});

adminRouter.delete("/groups/:id/members/:userId", async (req, res) => {
  await db
    .delete(groupMembers)
    .where(
      and(eq(groupMembers.groupId, req.params.id!), eq(groupMembers.userId, req.params.userId!)),
    );
  res.status(204).end();
});

/* Calendar */

adminRouter.get("/sessions", async (req, res) => {
  const { from, to } = z
    .object({ from: z.coerce.date(), to: z.coerce.date() })
    .parse(req.query);

  const rows = await db
    .select({
      id: classSessions.id,
      title: classSessions.title,
      startsAt: classSessions.startsAt,
      endsAt: classSessions.endsAt,
      meetingUrl: classSessions.meetingUrl,
      status: classSessions.status,
      groupId: classSessions.groupId,
      groupName: groups.name,
      groupMeetingUrl: groups.meetingUrl,
      studentId: classSessions.studentId,
      studentName: users.name,
    })
    .from(classSessions)
    .leftJoin(groups, eq(groups.id, classSessions.groupId))
    .leftJoin(users, eq(users.id, classSessions.studentId))
    .where(and(gte(classSessions.startsAt, from), lt(classSessions.startsAt, to)))
    .orderBy(asc(classSessions.startsAt));

  res.json(rows);
});

adminRouter.get("/sessions/:id", async (req, res) => {
  const [session] = await db
    .select({
      id: classSessions.id,
      title: classSessions.title,
      startsAt: classSessions.startsAt,
      status: classSessions.status,
      groupId: classSessions.groupId,
      studentId: classSessions.studentId,
    })
    .from(classSessions)
    .where(eq(classSessions.id, req.params.id!));
  const found = notFoundUnless(session, "Aula não encontrada.");

  const memberIds = found.groupId
    ? (
        await db
          .select({ userId: groupMembers.userId })
          .from(groupMembers)
          .where(eq(groupMembers.groupId, found.groupId))
      ).map((row) => row.userId)
    : [found.studentId!];

  const students =
    memberIds.length > 0
      ? await db
          .select({ id: users.id, name: users.name })
          .from(users)
          .where(inArray(users.id, memberIds))
          .orderBy(asc(users.name))
      : [];

  const marks = await db.select().from(attendance).where(eq(attendance.sessionId, found.id));

  res.json({
    ...found,
    students: students.map((student) => ({
      ...student,
      attendance: marks.find((mark) => mark.studentId === student.id)?.status ?? null,
    })),
  });
});

adminRouter.post("/sessions", async (req, res) => {
  const { weeks, durationMinutes, startsAt, ...session } = sessionBody.parse(req.body);

  await db.insert(classSessions).values(
    Array.from({ length: weeks }, (_, week) => {
      const start = new Date(startsAt.getTime() + week * WEEK_MS);
      return {
        ...session,
        groupId: session.groupId ?? null,
        studentId: session.studentId ?? null,
        startsAt: start,
        endsAt: new Date(start.getTime() + durationMinutes * 60 * 1000),
      };
    }),
  );
  res.status(201).end();
});

adminRouter.post("/sessions/:id/status", async (req, res) => {
  const status = z.enum(["scheduled", "cancelled"]).parse(req.body?.status);
  const [updated] = await db
    .update(classSessions)
    .set({ status })
    .where(eq(classSessions.id, req.params.id!))
    .returning({ id: classSessions.id });
  notFoundUnless(updated, "Aula não encontrada.");
  res.status(204).end();
});

adminRouter.delete("/sessions/:id", async (req, res) => {
  await db.delete(classSessions).where(eq(classSessions.id, req.params.id!));
  res.status(204).end();
});

adminRouter.put("/sessions/:id/attendance", async (req, res) => {
  const { studentId, status } = attendanceBody.parse(req.body);
  await db
    .insert(attendance)
    .values({ sessionId: req.params.id!, studentId, status })
    .onConflictDoUpdate({
      target: [attendance.sessionId, attendance.studentId],
      set: { status },
    });
  res.status(204).end();
});

/* Payments */

adminRouter.get("/payments", async (_req, res) => {
  const rows = await db
    .select({
      id: payments.id,
      amountCents: payments.amountCents,
      paidAt: payments.paidAt,
      provider: payments.provider,
      billing: subscriptions.billing,
      packageName: packages.name,
      studentId: users.id,
      studentName: users.name,
    })
    .from(payments)
    .innerJoin(subscriptions, eq(subscriptions.id, payments.subscriptionId))
    .innerJoin(packages, eq(packages.id, subscriptions.packageId))
    .innerJoin(users, eq(users.id, subscriptions.userId))
    .orderBy(desc(payments.paidAt))
    .limit(100);

  res.json(rows);
});
