import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export const SESSION_COOKIE = "english_plus_session";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
}

/** Calls the API as the logged-in visitor. Only ever runs on the server. */
export async function api<T>(path: string, { method = "GET", body }: RequestOptions = {}) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return request<T>(path, { method, body }, token);
}

/**
 * For pages loading their data. A page can start before its layout's login check finishes,
 * so an expired login or wrong role redirects here rather than showing an error.
 */
export async function pageApi<T>(path: string) {
  try {
    return await api<T>(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/entrar");
    if (error instanceof ApiError && error.status === 403) redirect("/aluno");
    throw error;
  }
}

/** For data anyone can see, so public pages don't depend on the visitor's cookies. */
export function publicApi<T>(path: string) {
  return request<T>(path, {});
}

async function request<T>(
  path: string,
  { method = "GET", body }: RequestOptions,
  token?: string,
): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!res.ok) throw new ApiError(res.status, data?.error ?? "Algo deu errado. Tente novamente.");
  return data as T;
}

export type Role = "teacher" | "student";
export type Billing = "monthly" | "yearly";
export type PackageKind = "individual" | "group" | "platform";
export type SubscriptionStatus = "pending" | "active" | "cancelled";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface PublicPackage {
  slug: string;
  name: string;
  kind: PackageKind;
  cadence: string;
  description: string;
  features: string[];
  monthlyCents: number;
  yearlyCents: number;
}

export interface CheckoutOrder {
  id: string;
  status: SubscriptionStatus;
  billing: Billing;
  priceCents: number;
  packageName: string;
  simulated: boolean;
}

export interface CalendarClass {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  meetingUrl: string | null;
  status: "scheduled" | "cancelled";
  groupName: string | null;
  studentName?: string | null;
}

export interface Dashboard {
  profile: { level: string | null; goal: string | null };
  subscriptions: {
    id: string;
    status: SubscriptionStatus;
    billing: Billing;
    priceCents: number;
    currentPeriodEnd: string | null;
    packageName: string;
    kind: PackageKind;
  }[];
  groups: { id: string; name: string; level: string }[];
  notes: { id: string; body: string; createdAt: string }[];
  upcoming: CalendarClass[];
  attendance: { present: number; total: number };
}

export interface LessonSummary {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  slug: string;
  title: string;
  level: string;
  topic: string;
  minutes: number;
  summary: string;
}

export interface Lesson {
  slug: string;
  title: string;
  level: string;
  topic: string;
  minutes: number;
  summary: string;
  videoUrl: string | null;
  sections: { heading: string; body: string; examples: string[] }[];
  vocabulary: { term: string; definition: string; example: string }[];
  quiz: { prompt: string; options: string[] }[];
}

export interface QuizResult {
  score: number;
  total: number;
  results: { correct: boolean; answerIndex: number; explanation: string }[];
}

export interface AdminOverview {
  students: number;
  activeSubscriptions: number;
  revenueThisMonthCents: number;
  upcoming: {
    id: string;
    title: string;
    startsAt: string;
    groupName: string | null;
    studentName: string | null;
  }[];
  needsPlacement: { id: string; name: string; packageName: string; kind: PackageKind }[];
}

export interface StudentRow {
  id: string;
  name: string;
  email: string;
  level: string | null;
  active: boolean;
  createdAt: string;
  packages: string[];
}

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  level: string | null;
  goal: string | null;
  active: boolean;
  createdAt: string;
  subscriptions: {
    id: string;
    status: SubscriptionStatus;
    billing: Billing;
    priceCents: number;
    provider: string;
    currentPeriodEnd: string | null;
    packageName: string;
  }[];
  groups: { id: string; name: string }[];
  notes: { id: string; body: string; shared: boolean; createdAt: string }[];
  attendance: {
    status: "present" | "absent";
    sessionId: string;
    title: string;
    startsAt: string;
  }[];
}

export interface AdminPackage extends PublicPackage {
  id: string;
  sortOrder: number;
  active: boolean;
  courseIds: string[];
}

export interface AdminLesson {
  id: string;
  title: string;
  slug: string;
  level: string;
  topic: string;
  minutes: number;
  summary: string;
  videoUrl: string | null;
  body: string;
  quiz: AdminQuizQuestion[];
}

export interface YoutubeStatus {
  /** False until GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set on the API. */
  configured: boolean;
  connected: boolean;
  channelTitle: string | null;
}

export interface YoutubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string | null;
  publishedAt: string;
  privacy: "public" | "unlisted" | "private" | (string & {});
}

export interface YoutubeVideoPage {
  videos: YoutubeVideo[];
  nextPageToken: string | null;
}

/** An activity question as the teacher edits it, answer included. */
export interface AdminQuizQuestion {
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface AdminCourse {
  id: string;
  title: string;
  description: string;
  active: boolean;
  lessons: AdminLesson[];
}

export interface AdminGroup {
  id: string;
  name: string;
  level: string;
  meetingUrl: string | null;
  capacity: number;
  active: boolean;
  members: { id: string; name: string; email: string }[];
}

export interface AdminSession extends CalendarClass {
  groupId: string | null;
  studentId: string | null;
}

export interface SessionDetail {
  id: string;
  title: string;
  startsAt: string;
  status: "scheduled" | "cancelled";
  groupId: string | null;
  studentId: string | null;
  students: { id: string; name: string; attendance: "present" | "absent" | null }[];
}

export interface PaymentRow {
  id: string;
  amountCents: number;
  paidAt: string;
  provider: string;
  billing: Billing;
  packageName: string;
  studentId: string;
  studentName: string;
}
