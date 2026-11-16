import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { and, eq, gt } from "drizzle-orm";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { db } from "../db/index.js";
import { authSessions, users } from "../db/schema.js";
import type { AuthUser } from "../types.js";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keyLength: number,
) => Promise<Buffer>;

const SESSION_DAYS = 30;

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = await scryptAsync(password, Buffer.from(salt, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await db.insert(authSessions).values({
    tokenHash: hashToken(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000),
  });
  return token;
}

export async function deleteSession(token: string): Promise<void> {
  await db.delete(authSessions).where(eq(authSessions.tokenHash, hashToken(token)));
}

export function bearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
}

/** Sets req.user when the request carries a valid login, and rejects it otherwise. */
export const requireAuth: RequestHandler = async (req, res, next) => {
  const token = bearerToken(req);
  if (!token) {
    res.status(401).json({ error: "Faça login para continuar." });
    return;
  }

  const [row] = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(authSessions)
    .innerJoin(users, eq(users.id, authSessions.userId))
    .where(
      and(
        eq(authSessions.tokenHash, hashToken(token)),
        gt(authSessions.expiresAt, new Date()),
        eq(users.active, true),
      ),
    );

  if (!row) {
    res.status(401).json({ error: "Sua sessão expirou. Faça login novamente." });
    return;
  }

  req.user = row;
  next();
};

/** Must run after requireAuth. */
export function requireTeacher(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== "teacher") {
    res.status(403).json({ error: "Acesso permitido apenas ao professor." });
    return;
  }
  next();
}
