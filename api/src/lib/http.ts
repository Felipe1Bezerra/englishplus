import type { Router } from "express";
import { z } from "zod";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Turns malformed ids into a 404 instead of a database error. */
export function validateUuidParams(router: Router, ...names: string[]): void {
  for (const name of names) {
    router.param(name, (_req, _res, next, value: string) => {
      next(z.uuid().safeParse(value).success ? undefined : new HttpError(404, "Não encontrado."));
    });
  }
}
