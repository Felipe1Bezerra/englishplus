import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, beforeEach, describe, it } from "node:test";

// Set before anything reads the environment: a throwaway database and no real payments.
process.env.DATA_DIR = "memory://";
process.env.TEACHER_EMAIL = "teacher@example.test";
process.env.TEACHER_PASSWORD = "teacher-test-password";
delete process.env.DATABASE_URL;
delete process.env.MP_ACCESS_TOKEN;
process.env.GOOGLE_CLIENT_ID = "test-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";

const { createApp } = await import("./app.js");
const { runMigrations } = await import("./db/index.js");
const { seed } = await import("./db/seed.js");

let base: string;
let closeServer: () => void;
let userCounter = 0;

const realFetch = globalThis.fetch;

interface CallOptions {
  method?: string;
  token?: string;
  body?: unknown;
}

async function call(path: string, { method = "GET", token, body }: CallOptions = {}) {
  const res = await realFetch(`${base}/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : undefined };
}

async function newStudent(extra: object = {}) {
  const email = `student${++userCounter}@example.test`;
  const res = await call("/auth/register", {
    method: "POST",
    body: { name: "Student", email, password: "student-password", ...extra },
  });
  assert.equal(res.status, 201);
  return { token: res.body.token as string, id: res.body.user.id as string, user: res.body.user };
}

async function teacherToken(): Promise<string> {
  const res = await call("/auth/login", {
    method: "POST",
    body: { email: process.env.TEACHER_EMAIL, password: process.env.TEACHER_PASSWORD },
  });
  assert.equal(res.status, 200);
  return res.body.token;
}

async function buy(token: string, slug = "plataforma", billing = "monthly") {
  const res = await call("/checkout", { method: "POST", token, body: { slug, billing } });
  assert.equal(res.status, 201);
  const id = new URL(res.body.url).searchParams.get("assinatura")!;
  const paid = await call(`/checkout/${id}/simulate`, { method: "POST", token });
  assert.equal(paid.status, 204);
  return id;
}

before(async () => {
  await runMigrations();
  await seed();
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  closeServer = () => server.close();
});

after(() => closeServer());

describe("prices", () => {
  it("serves the image's monthly prices and two months free per year", async () => {
    const { body } = await call("/packages");
    assert.deepEqual(
      body.map((p: { slug: string; monthlyCents: number; yearlyCents: number }) => [
        p.slug,
        p.monthlyCents,
        p.yearlyCents,
      ]),
      [
        ["individual", 80000, 800000],
        ["em-grupo", 30000, 300000],
        ["plataforma", 4990, 49900],
      ],
    );
  });

  it("ignores a price sent by the browser", async () => {
    const { token } = await newStudent();
    const res = await call("/checkout", {
      method: "POST",
      token,
      body: { slug: "individual", billing: "monthly", priceCents: 1, amountCents: 1 },
    });
    const id = new URL(res.body.url).searchParams.get("assinatura")!;
    const order = await call(`/checkout/${id}`, { token });
    assert.equal(order.body.priceCents, 80000);
  });

  it("charges the yearly price for a yearly plan and grants a year", async () => {
    const student = await newStudent();
    await buy(student.token, "em-grupo", "yearly");
    const { body } = await call("/me/dashboard", { token: student.token });
    const [subscription] = body.subscriptions;
    assert.equal(subscription.priceCents, 300000);
    const days = (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / 86_400_000;
    assert.ok(days > 360 && days < 370);
  });
});

describe("permissions", () => {
  const adminPaths = [
    "/admin/overview",
    "/admin/students",
    "/admin/packages",
    "/admin/courses",
    "/admin/groups",
    "/admin/payments",
    "/admin/sessions?from=2026-01-01&to=2027-01-01",
  ];

  it("blocks visitors and students from every admin route", async () => {
    const { token } = await newStudent();
    for (const path of adminPaths) {
      assert.equal((await call(path)).status, 401, path);
      assert.equal((await call(path, { token })).status, 403, path);
    }
  });

  it("lets the teacher into every admin route", async () => {
    const token = await teacherToken();
    for (const path of adminPaths) assert.equal((await call(path, { token })).status, 200, path);
  });

  it("blocks a student from changing data through admin routes", async () => {
    const student = await newStudent();
    const { token } = student;
    const res = await call(`/admin/students/${student.id}/subscriptions`, {
      method: "POST",
      token,
      body: { packageId: "00000000-0000-4000-8000-000000000000", billing: "yearly" },
    });
    assert.equal(res.status, 403);
  });

  it("never lets a sign-up choose the teacher role", async () => {
    const student = await newStudent({ role: "teacher" });
    assert.equal(student.user.role, "student");
    assert.equal((await call("/admin/overview", { token: student.token })).status, 403);
  });

  it("logs a deactivated student out immediately", async () => {
    const student = await newStudent();
    const teacher = await teacherToken();
    await call(`/admin/students/${student.id}`, {
      method: "PATCH",
      token: teacher,
      body: { active: false },
    });
    assert.equal((await call("/auth/me", { token: student.token })).status, 401);
  });

  it("keeps one student out of another's purchase", async () => {
    const owner = await newStudent();
    const other = await newStudent();
    const res = await call("/checkout", {
      method: "POST",
      token: owner.token,
      body: { slug: "plataforma", billing: "monthly" },
    });
    const id = new URL(res.body.url).searchParams.get("assinatura")!;
    assert.equal((await call(`/checkout/${id}`, { token: other.token })).status, 404);
    assert.equal(
      (await call(`/checkout/${id}/simulate`, { method: "POST", token: other.token })).status,
      404,
    );
  });
});

describe("lessons", () => {
  const slug = "phrasal-verbs-at-work";

  it("needs a paid package", async () => {
    const { token } = await newStudent();
    assert.equal((await call(`/lessons/${slug}`)).status, 401);
    assert.equal((await call(`/lessons/${slug}`, { token })).status, 403);
    assert.deepEqual((await call("/lessons", { token })).body, []);
  });

  it("opens after payment, without exposing quiz answers", async () => {
    const { token } = await newStudent();
    await buy(token);
    const res = await call(`/lessons/${slug}`, { token });
    assert.equal(res.status, 200);
    assert.doesNotMatch(JSON.stringify(res.body), /answerIndex|explanation/);
  });

  it("stops at the end of the paid period when cancelled by the teacher", async () => {
    const student = await newStudent();
    const id = await buy(student.token);
    const teacher = await teacherToken();
    await call(`/admin/subscriptions/${id}/cancel`, { method: "POST", token: teacher });
    assert.equal((await call(`/lessons/${slug}`, { token: student.token })).status, 403);
  });

  it("keeps access until the period ends when a student cancels", async () => {
    const student = await newStudent();
    const id = await buy(student.token);
    const res = await call(`/me/subscriptions/${id}/cancel`, {
      method: "POST",
      token: student.token,
    });
    assert.equal(res.status, 204);
    assert.equal((await call(`/lessons/${slug}`, { token: student.token })).status, 200);
  });

  it("lets the teacher write activities that students can answer", async () => {
    const teacher = await teacherToken();
    const course = await call("/admin/courses", {
      method: "POST",
      token: teacher,
      body: { title: "Activities course" },
    });
    const lesson = {
      title: "Past simple",
      slug: "past-simple-activities",
      level: "A2",
      topic: "Grammar",
      minutes: 10,
      summary: "Practice.",
      quiz: [
        {
          prompt: "Yesterday I ___ to work.",
          options: ["go", "went"],
          answerIndex: 1,
          explanation: "Past simple of go.",
        },
      ],
    };
    const created = await call(`/admin/courses/${course.body.id}/lessons`, {
      method: "POST",
      token: teacher,
      body: lesson,
    });
    assert.equal(created.status, 201);

    const bad = await call(`/admin/lessons/${created.body.id}`, {
      method: "PUT",
      token: teacher,
      body: { ...lesson, quiz: [{ ...lesson.quiz[0], answerIndex: 5 }] },
    });
    assert.equal(bad.status, 400);

    // Saving without a quiz keeps the activities the lesson already has.
    const { quiz: _quiz, ...withoutQuiz } = lesson;
    await call(`/admin/lessons/${created.body.id}`, {
      method: "PUT",
      token: teacher,
      body: withoutQuiz,
    });
    const check = await call(`/lessons/${lesson.slug}/check`, {
      method: "POST",
      token: teacher,
      body: { answers: [1] },
    });
    assert.equal(check.body.score, 1);
  });

  it("does not let a student cancel a yearly plan alone", async () => {
    const student = await newStudent();
    const id = await buy(student.token, "plataforma", "yearly");
    const res = await call(`/me/subscriptions/${id}/cancel`, {
      method: "POST",
      token: student.token,
    });
    assert.equal(res.status, 409);
  });
});

describe("follow-up", () => {
  it("shows a student only the notes marked as shared", async () => {
    const student = await newStudent();
    const token = await teacherToken();
    const notes = `/admin/students/${student.id}/notes`;
    await call(notes, { method: "POST", token, body: { body: "Private note", shared: false } });
    await call(notes, { method: "POST", token, body: { body: "Shared note", shared: true } });

    const dashboard = await call("/me/dashboard", { token: student.token });
    assert.deepEqual(
      dashboard.body.notes.map((note: { body: string }) => note.body),
      ["Shared note"],
    );

    const record = await call(`/admin/students/${student.id}`, { token });
    assert.equal(record.body.notes.length, 2);
  });
});

describe("calendar", () => {
  it("shows a group's classes to its members only, repeating weekly", async () => {
    const member = await newStudent();
    const outsider = await newStudent();
    const token = await teacherToken();

    const group = await call("/admin/groups", {
      method: "POST",
      token,
      body: { name: "Turma B1", capacity: 2 },
    });
    const members = `/admin/groups/${group.body.id}/members`;
    await call(members, { method: "POST", token, body: { userId: member.id } });

    const created = await call("/admin/sessions", {
      method: "POST",
      token,
      body: {
        title: "Conversação",
        groupId: group.body.id,
        startsAt: "2030-01-07T22:00:00.000Z",
        durationMinutes: 60,
        weeks: 3,
      },
    });
    assert.equal(created.status, 201);

    const range = "/me/calendar?from=2030-01-01&to=2030-02-01";
    assert.equal((await call(range, { token: member.token })).body.length, 3);
    assert.equal((await call(range, { token: outsider.token })).body.length, 0);
  });

  it("refuses a student once a group is full", async () => {
    const token = await teacherToken();
    const group = await call("/admin/groups", {
      method: "POST",
      token,
      body: { name: "Turma pequena", capacity: 1 },
    });
    const members = `/admin/groups/${group.body.id}/members`;
    const first = await newStudent();
    const second = await newStudent();
    await call(members, { method: "POST", token, body: { userId: first.id } });
    const res = await call(members, { method: "POST", token, body: { userId: second.id } });
    assert.equal(res.status, 409);
  });

  it("needs either a group or a student", async () => {
    const token = await teacherToken();
    const res = await call("/admin/sessions", {
      method: "POST",
      token,
      body: { title: "Aula", startsAt: "2030-01-07T22:00:00Z", durationMinutes: 60 },
    });
    assert.equal(res.status, 400);
  });
});

describe("YouTube", () => {
  const googleCalls: string[] = [];

  before(() => {
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
      if (url.startsWith("https://oauth2.googleapis.com/token")) {
        googleCalls.push("token");
        const grant = new URLSearchParams(String(init?.body)).get("code");
        if (grant === "bad-code") {
          return new Response(JSON.stringify({ error: "invalid_grant" }), { status: 400 });
        }
        return json({ access_token: "access", expires_in: 3600, refresh_token: "refresh" });
      }
      if (url.startsWith("https://www.googleapis.com/youtube/v3/channels")) {
        return json({
          items: [
            {
              id: "UC1",
              snippet: { title: "English+ Channel" },
              contentDetails: { relatedPlaylists: { uploads: "UU1" } },
            },
          ],
        });
      }
      if (url.startsWith("https://www.googleapis.com/youtube/v3/playlistItems")) {
        assert.equal(new URL(url).searchParams.get("playlistId"), "UU1");
        return json({
          nextPageToken: "page-2",
          items: [
            {
              snippet: {
                title: "Lesson one",
                publishedAt: "2026-01-01T00:00:00Z",
                resourceId: { videoId: "abcDEF12345" },
                thumbnails: { medium: { url: "https://i.ytimg.com/vi/abcDEF12345/mqdefault.jpg" } },
              },
              status: { privacyStatus: "unlisted" },
            },
          ],
        });
      }
      if (url.startsWith("https://oauth2.googleapis.com/revoke")) {
        googleCalls.push("revoke");
        return new Response("", { status: 200 });
      }
      return realFetch(input, init);
    }) as typeof fetch;
  });

  after(() => {
    globalThis.fetch = realFetch;
  });

  async function startConnect(token: string) {
    const res = await call("/admin/youtube/connect", {
      method: "POST",
      token,
      body: { returnTo: "/admin/cursos/abc" },
    });
    assert.equal(res.status, 200);
    const url = new URL(res.body.url);
    assert.equal(url.hostname, "accounts.google.com");
    assert.equal(url.searchParams.get("scope"), "https://www.googleapis.com/auth/youtube.readonly");
    return url.searchParams.get("state")!;
  }

  it("is for the teacher only", async () => {
    const { token } = await newStudent();
    assert.equal((await call("/admin/youtube", { token })).status, 403);
    assert.equal((await call("/admin/youtube/videos", { token })).status, 403);
  });

  it("connects the channel, lists its videos and disconnects", async () => {
    const token = await teacherToken();
    assert.deepEqual((await call("/admin/youtube", { token })).body, {
      configured: true,
      connected: false,
      channelTitle: null,
    });
    assert.equal((await call("/admin/youtube/videos", { token })).status, 409);

    const state = await startConnect(token);
    const done = await call("/admin/youtube/callback", {
      method: "POST",
      token,
      body: { code: "good-code", state },
    });
    assert.equal(done.status, 200);
    assert.equal(done.body.returnTo, "/admin/cursos/abc");

    // A state works once only.
    const again = await call("/admin/youtube/callback", {
      method: "POST",
      token,
      body: { code: "good-code", state },
    });
    assert.equal(again.status, 400);

    const status = await call("/admin/youtube", { token });
    assert.equal(status.body.channelTitle, "English+ Channel");

    const videos = await call("/admin/youtube/videos", { token });
    assert.equal(videos.status, 200);
    assert.equal(videos.body.nextPageToken, "page-2");
    assert.deepEqual(videos.body.videos[0], {
      id: "abcDEF12345",
      title: "Lesson one",
      url: "https://www.youtube.com/watch?v=abcDEF12345",
      thumbnailUrl: "https://i.ytimg.com/vi/abcDEF12345/mqdefault.jpg",
      publishedAt: "2026-01-01T00:00:00Z",
      privacy: "unlisted",
    });

    assert.equal((await call("/admin/youtube", { method: "DELETE", token })).status, 204);
    assert.ok(googleCalls.includes("revoke"));
    assert.equal((await call("/admin/youtube", { token })).body.connected, false);
  });

  it("rejects a code Google refuses", async () => {
    const token = await teacherToken();
    const state = await startConnect(token);
    const res = await call("/admin/youtube/callback", {
      method: "POST",
      token,
      body: { code: "bad-code", state },
    });
    assert.equal(res.status, 400);
    assert.equal((await call("/admin/youtube", { token })).body.connected, false);
  });

  it("sends Google back only to admin pages", async () => {
    const token = await teacherToken();
    const res = await call("/admin/youtube/connect", {
      method: "POST",
      token,
      body: { returnTo: "https://evil.example/admin" },
    });
    const state = new URL(res.body.url).searchParams.get("state")!;
    const done = await call("/admin/youtube/callback", {
      method: "POST",
      token,
      body: { code: "good-code", state },
    });
    assert.equal(done.body.returnTo, "/admin/cursos");
    await call("/admin/youtube", { method: "DELETE", token });
  });
});

describe("Mercado Pago notifications", () => {
  let mercadoPagoAnswer: unknown;

  beforeEach(() => {
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      if (String(input).startsWith("https://api.mercadopago.com")) {
        return new Response(JSON.stringify(mercadoPagoAnswer), { status: 200 });
      }
      return realFetch(input, init);
    }) as typeof fetch;
  });

  after(() => {
    globalThis.fetch = realFetch;
  });

  async function pendingOrder(billing = "yearly") {
    const student = await newStudent();
    const res = await call("/checkout", {
      method: "POST",
      token: student.token,
      body: { slug: "plataforma", billing },
    });
    return { student, id: new URL(res.body.url).searchParams.get("assinatura")! };
  }

  const notify = (paymentId: string) =>
    call("/webhooks/mercadopago", {
      method: "POST",
      body: { type: "payment", data: { id: paymentId } },
    });

  const orderStatus = async (id: string, token: string) =>
    (await call(`/checkout/${id}`, { token })).body.status;

  it("ignores a forged notification when Mercado Pago did not approve the payment", async () => {
    const { student, id } = await pendingOrder();
    mercadoPagoAnswer = {
      id: 1,
      status: "rejected",
      transaction_amount: 499,
      external_reference: id,
    };
    assert.equal((await notify("1")).status, 200);
    assert.equal(await orderStatus(id, student.token), "pending");
  });

  it("ignores an approved payment below the price", async () => {
    const { student, id } = await pendingOrder();
    mercadoPagoAnswer = {
      id: 2,
      status: "approved",
      transaction_amount: 1,
      external_reference: id,
    };
    await notify("2");
    assert.equal(await orderStatus(id, student.token), "pending");
  });

  it("activates once for an approved payment, even if notified twice", async () => {
    const { student, id } = await pendingOrder();
    mercadoPagoAnswer = {
      id: 3,
      status: "approved",
      transaction_amount: 499,
      external_reference: id,
    };
    await notify("3");
    const first = await call("/me/dashboard", { token: student.token });
    await notify("3");
    const second = await call("/me/dashboard", { token: student.token });

    assert.equal(first.body.subscriptions[0].status, "active");
    assert.equal(
      second.body.subscriptions[0].currentPeriodEnd,
      first.body.subscriptions[0].currentPeriodEnd,
    );
  });

  it("drops ids that could reach other API paths", async () => {
    const { student, id } = await pendingOrder();
    mercadoPagoAnswer = {
      id: 4,
      status: "approved",
      transaction_amount: 499,
      external_reference: id,
    };
    await notify("../../somewhere");
    assert.equal(await orderStatus(id, student.token), "pending");
  });
});
