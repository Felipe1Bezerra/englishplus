"use server";

import { redirect } from "next/navigation";
import { checked, failure, failureFrom, runAction, text, type ActionState } from "@/lib/action";
import { api, ApiError, type YoutubeVideoPage } from "@/lib/api";
import { localInputToIso, parseBrl } from "@/lib/format";

/* Every action calls an admin API route, and the API rejects anyone but the teacher. */

const lines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

/* Students */

export async function updateStudent(id: string, _state: ActionState, form: FormData) {
  return runAction(() =>
    api(`/admin/students/${id}`, {
      method: "PATCH",
      body: {
        name: text(form, "name"),
        phone: text(form, "phone"),
        level: text(form, "level"),
        goal: text(form, "goal"),
        active: checked(form, "active"),
      },
    }),
  );
}

export async function setStudentPassword(id: string, _state: ActionState, form: FormData) {
  return runAction(() =>
    api(`/admin/students/${id}/password`, {
      method: "POST",
      body: { password: String(form.get("password") ?? "") },
    }),
  );
}

export async function addNote(id: string, _state: ActionState, form: FormData) {
  return runAction(() =>
    api(`/admin/students/${id}/notes`, {
      method: "POST",
      body: { body: text(form, "body"), shared: checked(form, "shared") },
    }),
  );
}

export async function deleteNote(id: string) {
  return runAction(() => api(`/admin/notes/${id}`, { method: "DELETE" }));
}

export async function grantPackage(id: string, _state: ActionState, form: FormData) {
  return runAction(() =>
    api(`/admin/students/${id}/subscriptions`, {
      method: "POST",
      body: { packageId: text(form, "packageId"), billing: text(form, "billing") },
    }),
  );
}

export async function cancelSubscription(id: string) {
  return runAction(() => api(`/admin/subscriptions/${id}/cancel`, { method: "POST" }));
}

/* Packages */

function packageBody(form: FormData) {
  return {
    name: text(form, "name"),
    slug: text(form, "slug"),
    kind: text(form, "kind"),
    cadence: text(form, "cadence"),
    description: text(form, "description"),
    features: lines(text(form, "features")),
    monthlyCents: parseBrl(text(form, "monthly")),
    yearlyCents: parseBrl(text(form, "yearly")),
    sortOrder: Number(text(form, "sortOrder")) || 0,
    active: checked(form, "active"),
  };
}

export async function savePackage(
  id: string | null,
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  const body = packageBody(form);
  if (body.monthlyCents === null) return failure("Informe o preço mensal, como 49,90.");
  if (body.yearlyCents === null) return failure("Informe o preço anual, como 499,00.");

  const courseIds = form.getAll("courseIds").map(String);

  let savedId = id;

  try {
    if (id) {
      await api(`/admin/packages/${id}`, { method: "PUT", body });
    } else {
      ({ id: savedId } = await api<{ id: string }>("/admin/packages", { method: "POST", body }));
    }
  } catch (error) {
    return failureFrom(error);
  }

  const result = await runAction(() =>
    api(`/admin/packages/${savedId}/courses`, { method: "PUT", body: { courseIds } }),
  );
  if (!id && !result.error) redirect(`/admin/pacotes/${savedId}`);
  return result;
}

/* Courses and lessons */

function courseBody(form: FormData) {
  return {
    title: text(form, "title"),
    description: text(form, "description"),
    active: checked(form, "active"),
  };
}

export async function createCourse(_state: ActionState, form: FormData) {
  return runAction(() => api("/admin/courses", { method: "POST", body: courseBody(form) }));
}

export async function updateCourse(id: string, _state: ActionState, form: FormData) {
  return runAction(() => api(`/admin/courses/${id}`, { method: "PUT", body: courseBody(form) }));
}

export async function deleteCourse(id: string): Promise<ActionState> {
  const result = await runAction(() => api(`/admin/courses/${id}`, { method: "DELETE" }));
  if (result.error) return result;
  redirect("/admin/cursos");
}

function lessonBody(form: FormData) {
  return {
    title: text(form, "title"),
    slug: text(form, "slug"),
    level: text(form, "level"),
    topic: text(form, "topic"),
    minutes: Number(text(form, "minutes")) || 0,
    summary: text(form, "summary"),
    videoUrl: text(form, "videoUrl"),
    body: text(form, "body"),
    quiz: parseQuiz(form),
  };
}

/** The activity editor sends its questions as JSON; the API checks them. */
function parseQuiz(form: FormData): unknown {
  const raw = form.get("quiz");
  if (typeof raw !== "string" || raw === "") return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export async function createLesson(courseId: string, _state: ActionState, form: FormData) {
  return runAction(() =>
    api(`/admin/courses/${courseId}/lessons`, { method: "POST", body: lessonBody(form) }),
  );
}

export async function updateLesson(id: string, _state: ActionState, form: FormData) {
  return runAction(() => api(`/admin/lessons/${id}`, { method: "PUT", body: lessonBody(form) }));
}

export async function deleteLesson(id: string) {
  return runAction(() => api(`/admin/lessons/${id}`, { method: "DELETE" }));
}

/* YouTube */

/** Sends the teacher to Google to allow read-only access to their channel. */
export async function connectYoutube(returnTo: string): Promise<ActionState> {
  let url: string;
  try {
    ({ url } = await api<{ url: string }>("/admin/youtube/connect", {
      method: "POST",
      body: { returnTo },
    }));
  } catch (error) {
    return failureFrom(error);
  }
  redirect(url);
}

export type LoadVideosResult = { ok: true; page: YoutubeVideoPage } | { ok: false; error: string };

/** Read-only, so it doesn't refresh the page the way the form actions do. */
export async function loadYoutubeVideos(pageToken?: string): Promise<LoadVideosResult> {
  try {
    const query = pageToken ? `?pageToken=${encodeURIComponent(pageToken)}` : "";
    return { ok: true, page: await api<YoutubeVideoPage>(`/admin/youtube/videos${query}`) };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Não foi possível carregar os vídeos. Tente novamente." };
  }
}

export async function disconnectYoutube(): Promise<ActionState> {
  return runAction(() => api("/admin/youtube", { method: "DELETE" }));
}

/* Groups */

function groupBody(form: FormData) {
  return {
    name: text(form, "name"),
    level: text(form, "level"),
    meetingUrl: text(form, "meetingUrl"),
    capacity: Number(text(form, "capacity")) || 0,
    active: checked(form, "active"),
  };
}

export async function createGroup(_state: ActionState, form: FormData) {
  return runAction(() => api("/admin/groups", { method: "POST", body: groupBody(form) }));
}

export async function updateGroup(id: string, _state: ActionState, form: FormData) {
  return runAction(() => api(`/admin/groups/${id}`, { method: "PUT", body: groupBody(form) }));
}

export async function deleteGroup(id: string): Promise<ActionState> {
  const result = await runAction(() => api(`/admin/groups/${id}`, { method: "DELETE" }));
  if (result.error) return result;
  redirect("/admin/turmas");
}

export async function addMember(groupId: string, _state: ActionState, form: FormData) {
  return runAction(() =>
    api(`/admin/groups/${groupId}/members`, {
      method: "POST",
      body: { userId: text(form, "userId") },
    }),
  );
}

export async function removeMember(groupId: string, userId: string) {
  return runAction(() => api(`/admin/groups/${groupId}/members/${userId}`, { method: "DELETE" }));
}

/* Calendar */

export async function createClass(_state: ActionState, form: FormData): Promise<ActionState> {
  const startsAt = text(form, "startsAt");
  if (!startsAt) return failure("Informe a data e o horário.");

  const [kind, id] = text(form, "audience").split(":");

  return runAction(() =>
    api("/admin/sessions", {
      method: "POST",
      body: {
        title: text(form, "title"),
        groupId: kind === "group" ? id : null,
        studentId: kind === "student" ? id : null,
        startsAt: localInputToIso(startsAt),
        durationMinutes: Number(text(form, "duration")) || 0,
        meetingUrl: text(form, "meetingUrl"),
        weeks: Number(text(form, "weeks")) || 1,
      },
    }),
  );
}

export async function setClassStatus(
  id: string,
  status: "scheduled" | "cancelled") {
  return runAction(() =>
    api(`/admin/sessions/${id}/status`, { method: "POST", body: { status } }),
  );
}

export async function deleteClass(id: string): Promise<ActionState> {
  const result = await runAction(() => api(`/admin/sessions/${id}`, { method: "DELETE" }));
  if (result.error) return result;
  redirect("/admin/calendario");
}

export async function markAttendance(
  sessionId: string,
  studentId: string,
  status: "present" | "absent") {
  return runAction(() =>
    api(`/admin/sessions/${sessionId}/attendance`, {
      method: "PUT",
      body: { studentId, status },
    }),
  );
}
