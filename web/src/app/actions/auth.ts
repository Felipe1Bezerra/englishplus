"use server";

import { redirect } from "next/navigation";
import { failureFrom, runAction, text, type ActionState } from "@/lib/action";
import { api, type User } from "@/lib/api";
import { clearSessionCookie, homeFor, safeNext, setSessionCookie } from "@/lib/session";

interface AuthResponse {
  token: string;
  user: User;
}

async function authenticate(
  path: string,
  body: Record<string, string>,
  next: unknown,
): Promise<ActionState> {
  let session: AuthResponse;

  try {
    session = await api<AuthResponse>(path, { method: "POST", body });
  } catch (error) {
    return failureFrom(error);
  }

  await setSessionCookie(session.token);
  redirect(safeNext(next) ?? homeFor(session.user.role));
}

export async function login(_state: ActionState, form: FormData): Promise<ActionState> {
  return authenticate(
    "/auth/login",
    { email: text(form, "email"), password: String(form.get("password") ?? "") },
    form.get("next"),
  );
}

export async function register(_state: ActionState, form: FormData): Promise<ActionState> {
  return authenticate(
    "/auth/register",
    {
      name: text(form, "name"),
      email: text(form, "email"),
      password: String(form.get("password") ?? ""),
    },
    form.get("next"),
  );
}

export async function logout(): Promise<void> {
  await api("/auth/logout", { method: "POST" }).catch(() => undefined);
  await clearSessionCookie();
  redirect("/");
}

export async function changePassword(_state: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { token } = await api<{ token: string }>("/auth/change-password", {
      method: "POST",
      body: {
        currentPassword: String(form.get("currentPassword") ?? ""),
        newPassword: String(form.get("newPassword") ?? ""),
      },
    });
    await setSessionCookie(token);
  });
}

