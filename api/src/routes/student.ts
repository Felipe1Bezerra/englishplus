import { and, asc, desc, eq, gte, inArray, lt, or } from "drizzle-orm";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import {
  attendance,
  classSessions,
  followUpNotes,
  groupMembers,
  groups,
  packages,
  subscriptions,
  users,
} from "../db/schema.js";
import { requireAuth } from "../lib/auth.js";
import { HttpError, validateUuidParams } from "../lib/http.js";
import { paymentProvider } from "../payments/index.js";

const rangeQuery = z.object({ from: z.coerce.date(), to: z.coerce.date() });

/** Classes a student belongs to, directly or through a group. */
async function studentClasses(userId: string, from: Date, to: Date, limit?: number) {
  const memberships = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, userId));
  const groupIds = memberships.map((row) => row.groupId);

  const query = db
    .select({
      id: classSessions.id,
      title: classSessions.title,
      startsAt: classSessions.startsAt,
      endsAt: classSessions.endsAt,
      meetingUrl: classSessions.meetingUrl,
      status: classSessions.status,
      groupName: groups.name,
      groupMeetingUrl: groups.meetingUrl,
    })
    .from(classSessions)
    .leftJoin(groups, eq(groups.id, classSessions.groupId))
    .where(
      and(
        gte(classSessions.startsAt, from),
        lt(classSessions.startsAt, to),
        or(
          eq(classSessions.studentId, userId),
          groupIds.length > 0 ? inArray(classSessions.groupId, groupIds) : undefined,
        ),
      ),
    )
    .orderBy(asc(classSessions.startsAt));

  const rows = await (limit ? query.limit(limit) : query);
  return rows.map(({ groupMeetingUrl, ...row }) => ({
    ...row,
    meetingUrl: row.meetingUrl ?? groupMeetingUrl,
  }));
}

export const studentRouter = Router();

validateUuidParams(studentRouter, "id");
studentRouter.use(requireAuth);

studentRouter.get("/dashboard", async (req, res) => {
  const userId = req.user!.id;
  const now = new Date();
  const farFuture = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  const [profile] = await db
    .select({ level: users.level, goal: users.goal })
    .from(users)
    .where(eq(users.id, userId));

  const mySubscriptions = await db
    .select({
      id: subscriptions.id,
      status: subscriptions.status,
      billing: subscriptions.billing,
      priceCents: subscriptions.priceCents,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      packageName: packages.name,
      kind: packages.kind,
    })
    .from(subscriptions)
    .innerJoin(packages, eq(packages.id, subscriptions.packageId))
    .where(and(eq(subscriptions.userId, userId), gte(subscriptions.currentPeriodEnd, now)))
    .orderBy(desc(subscriptions.createdAt));

  const myGroups = await db
    .select({ id: groups.id, name: groups.name, level: groups.level })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.userId, userId));

  // Only notes the teacher chose to share; private ones never leave the admin area.
  const notes = await db
    .select({
      id: followUpNotes.id,
      body: followUpNotes.body,
      createdAt: followUpNotes.createdAt,
    })
    .from(followUpNotes)
    .where(and(eq(followUpNotes.studentId, userId), eq(followUpNotes.shared, true)))
    .orderBy(desc(followUpNotes.createdAt))
    .limit(10);

  const attendanceRows = await db
    .select({ status: attendance.status })
    .from(attendance)
    .where(eq(attendance.studentId, userId));

  res.json({
    profile,
    subscriptions: mySubscriptions,
    groups: myGroups,
    notes,
    upcoming: (await studentClasses(userId, now, farFuture, 5)).filter(
      (session) => session.status === "scheduled",
    ),
    attendance: {
      present: attendanceRows.filter((row) => row.status === "present").length,
      total: attendanceRows.length,
    },
  });
});

studentRouter.get("/calendar", async (req, res) => {
  const { from, to } = rangeQuery.parse(req.query);
  res.json(await studentClasses(req.user!.id, from, to));
});

studentRouter.post("/subscriptions/:id/cancel", async (req, res) => {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.id, req.params.id!), eq(subscriptions.userId, req.user!.id)));
  if (!subscription) throw new HttpError(404, "Assinatura não encontrada.");

  if (subscription.billing === "yearly") {
    throw new HttpError(409, "Para cancelar o plano anual, fale com o professor.");
  }

  if (subscription.providerRef) await paymentProvider.cancelRecurring(subscription.providerRef);

  // Access runs until the end of the period already paid for.
  await db
    .update(subscriptions)
    .set({ status: "cancelled" })
    .where(eq(subscriptions.id, subscription.id));

  res.status(204).end();
});
