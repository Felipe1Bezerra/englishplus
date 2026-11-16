import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { LessonContent } from "../types.js";

export const roleEnum = pgEnum("role", ["teacher", "student"]);
export const packageKindEnum = pgEnum("package_kind", ["individual", "group", "platform"]);
export const billingEnum = pgEnum("billing_cycle", ["monthly", "yearly"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "pending",
  "active",
  "cancelled",
]);
export const sessionStatusEnum = pgEnum("class_status", ["scheduled", "cancelled"]);
export const attendanceEnum = pgEnum("attendance_status", ["present", "absent"]);

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const users = pgTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("student"),
  phone: text("phone"),
  level: text("level"),
  goal: text("goal"),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
});

/** Only a hash of each login token is stored, so a database leak can't be used to log in. */
export const authSessions = pgTable("auth_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const packages = pgTable("packages", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  kind: packageKindEnum("kind").notNull(),
  cadence: text("cadence").notNull(),
  description: text("description").notNull(),
  features: text("features").array().notNull(),
  monthlyCents: integer("monthly_cents").notNull(),
  yearlyCents: integer("yearly_cents").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
});

export const courses = pgTable("courses", {
  id: id(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
});

export const packageCourses = pgTable(
  "package_courses",
  {
    packageId: uuid("package_id")
      .notNull()
      .references(() => packages.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.packageId, table.courseId] })],
);

export const lessons = pgTable("lessons", {
  id: id(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  level: text("level").notNull(),
  topic: text("topic").notNull(),
  minutes: integer("minutes").notNull(),
  summary: text("summary").notNull(),
  videoUrl: text("video_url"),
  content: jsonb("content").$type<LessonContent>().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
});

export const subscriptions = pgTable("subscriptions", {
  id: id(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  packageId: uuid("package_id")
    .notNull()
    .references(() => packages.id),
  billing: billingEnum("billing").notNull(),
  status: subscriptionStatusEnum("status").notNull().default("pending"),
  /** The price agreed at purchase; later price changes don't alter it. */
  priceCents: integer("price_cents").notNull(),
  provider: text("provider").notNull(),
  /** Mercado Pago subscription id, for monthly plans. */
  providerRef: text("provider_ref"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: createdAt(),
});

export const payments = pgTable(
  "payments",
  {
    id: id(),
    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerPaymentId: text("provider_payment_id").notNull(),
    amountCents: integer("amount_cents").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }).notNull().defaultNow(),
  },
  // Notifications can repeat; this stops one payment being recorded twice.
  (table) => [uniqueIndex("payments_provider_id").on(table.provider, table.providerPaymentId)],
);

export const groups = pgTable("groups", {
  id: id(),
  name: text("name").notNull(),
  level: text("level").notNull().default(""),
  meetingUrl: text("meeting_url"),
  capacity: integer("capacity").notNull().default(8),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
});

export const groupMembers = pgTable(
  "group_members",
  {
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.groupId, table.userId] })],
);

/** A class on the calendar: for a group, or for one student when groupId is null. */
export const classSessions = pgTable("class_sessions", {
  id: id(),
  title: text("title").notNull(),
  groupId: uuid("group_id").references(() => groups.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").references(() => users.id, { onDelete: "cascade" }),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  meetingUrl: text("meeting_url"),
  status: sessionStatusEnum("status").notNull().default("scheduled"),
  createdAt: createdAt(),
});

export const attendance = pgTable(
  "attendance",
  {
    sessionId: uuid("session_id")
      .notNull()
      .references(() => classSessions.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: attendanceEnum("status").notNull(),
  },
  (table) => [primaryKey({ columns: [table.sessionId, table.studentId] })],
);

/** The teacher's YouTube channel, connected read-only so lessons can pick its videos. */
export const youtubeAccounts = pgTable("youtube_accounts", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  channelId: text("channel_id").notNull(),
  channelTitle: text("channel_title").notNull(),
  uploadsPlaylistId: text("uploads_playlist_id").notNull(),
  refreshToken: text("refresh_token").notNull(),
  accessToken: text("access_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  createdAt: createdAt(),
});

/** Follow-up notes. Students only ever see the ones marked shared. */
export const followUpNotes = pgTable("follow_up_notes", {
  id: id(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id),
  body: text("body").notNull(),
  shared: boolean("shared").notNull().default(false),
  createdAt: createdAt(),
});
