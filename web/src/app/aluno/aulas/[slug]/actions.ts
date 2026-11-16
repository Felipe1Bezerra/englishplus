"use server";

import { api, type QuizResult } from "@/lib/api";

export type CheckQuizResponse =
  | { ok: true; result: QuizResult }
  | { ok: false; message: string };

export async function checkQuiz(slug: string, answers: number[]): Promise<CheckQuizResponse> {
  try {
    const result = await api<QuizResult>(`/lessons/${encodeURIComponent(slug)}/check`, {
      method: "POST",
      body: { answers },
    });
    return { ok: true, result };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Não conseguimos corrigir agora. Tente novamente." };
  }
}
