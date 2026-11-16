import "server-only";
import { revalidatePath } from "next/cache";
import { ApiError } from "./api";

export interface ActionState {
  ok?: boolean;
  error?: string;
}

/**
 * Next only leaves its "action" phase when the page is revalidated. A form sent before the
 * page finishes loading re-renders regardless, and in that phase reading cookies fails, so
 * failures revalidate too.
 */
function refresh(): void {
  revalidatePath("/", "layout");
}

export function failure(message: string): ActionState {
  refresh();
  return { error: message };
}

export function failureFrom(error: unknown): ActionState {
  if (error instanceof ApiError) return failure(error.message);
  console.error(error);
  return failure("Não foi possível concluir agora. Tente novamente.");
}

/** Runs a change, then refreshes the pages, turning failures into a message for the form. */
export async function runAction(change: () => Promise<unknown>): Promise<ActionState> {
  try {
    await change();
  } catch (error) {
    return failureFrom(error);
  }

  refresh();
  return { ok: true };
}

export const text = (form: FormData, name: string) => String(form.get(name) ?? "").trim();
export const checked = (form: FormData, name: string) => form.get(name) === "on";
