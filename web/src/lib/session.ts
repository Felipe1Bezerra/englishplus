import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, api, SESSION_COOKIE, type User } from "./api";

const THIRTY_DAYS = 30 * 24 * 60 * 60;

export async function setSessionCookie(token: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Null for visitors. Any problem other than a bad login is still raised. */
export async function getUser(): Promise<User | null> {
  const hasCookie = (await cookies()).has(SESSION_COOKIE);
  if (!hasCookie) return null;

  try {
    return await api<User>("/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export async function requireUser(next: string): Promise<User> {
  const user = await getUser();
  if (!user) redirect(`/entrar?next=${encodeURIComponent(next)}`);
  return user;
}

/** Hides the admin area. The API separately enforces this on every admin request. */
export async function requireTeacher(): Promise<User> {
  const user = await requireUser("/admin");
  if (user.role !== "teacher") redirect("/aluno");
  return user;
}

export function homeFor(role: User["role"]): string {
  return role === "teacher" ? "/admin" : "/aluno";
}

/** Only same-site paths, so a crafted login link can't send someone elsewhere. */
export function safeNext(next: unknown): string | null {
  return typeof next === "string" && /^\/(?![/\\])/.test(next) ? next : null;
}
