import { eq } from "drizzle-orm";
import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { authSessions, users } from "../db/schema.js";
import {
  bearerToken,
  createSession,
  deleteSession,
  hashPassword,
  requireAuth,
  verifyPassword,
} from "../lib/auth.js";
import { HttpError } from "../lib/http.js";

const password = z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(200);

const registerBody = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  email: z.email("Informe um e-mail válido.").toLowerCase(),
  password,
});

const loginBody = z.object({
  email: z.string().trim().toLowerCase(),
  password: z.string(),
});

const changePasswordBody = z.object({ currentPassword: z.string(), newPassword: password });

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

/** Slows password guessing against one account. */
const limitLogin: RequestHandler = (req, _res, next) => {
  const key = String(req.body?.email ?? "").toLowerCase();
  const now = Date.now();
  const entry = loginAttempts.get(key);

  if (!entry || entry.resetAt < now) {
    loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else if (++entry.count > MAX_ATTEMPTS) {
    throw new HttpError(429, "Muitas tentativas. Aguarde alguns minutos e tente de novo.");
  }
  next();
};

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const body = registerBody.parse(req.body);

  const created = await db
    .insert(users)
    .values({
      name: body.name,
      email: body.email,
      passwordHash: await hashPassword(body.password),
    })
    .onConflictDoNothing()
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

  const user = created[0];
  if (!user) throw new HttpError(409, "Já existe uma conta com este e-mail.");

  res.status(201).json({ token: await createSession(user.id), user });
});

authRouter.post("/login", limitLogin, async (req, res) => {
  const body = loginBody.parse(req.body);
  const [user] = await db.select().from(users).where(eq(users.email, body.email));

  const valid =
    user?.active === true && (await verifyPassword(body.password, user.passwordHash));
  if (!user || !valid) throw new HttpError(401, "E-mail ou senha incorretos.");

  loginAttempts.delete(body.email);
  const { id, name, email, role } = user;
  res.json({ token: await createSession(id), user: { id, name, email, role } });
});

authRouter.post("/logout", async (req, res) => {
  const token = bearerToken(req);
  if (token) await deleteSession(token);
  res.status(204).end();
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json(req.user);
});

authRouter.post("/change-password", requireAuth, async (req, res) => {
  const body = changePasswordBody.parse(req.body);
  const userId = req.user!.id;
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user || !(await verifyPassword(body.currentPassword, user.passwordHash))) {
    throw new HttpError(400, "A senha atual está incorreta.");
  }

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(body.newPassword) })
    .where(eq(users.id, userId));
  await db.delete(authSessions).where(eq(authSessions.userId, userId));

  res.json({ token: await createSession(userId) });
});
