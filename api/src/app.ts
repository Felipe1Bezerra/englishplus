import express, { type ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "./lib/http.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { lessonsRouter } from "./routes/lessons.js";
import { checkoutRouter, packagesRouter } from "./routes/packages.js";
import { studentRouter } from "./routes/student.js";
import { webhooksRouter } from "./routes/webhooks.js";

const handleError: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: err.issues[0]?.message ?? "Dados inválidos." });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  const status = typeof err.status === "number" ? err.status : 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    error: status >= 500 ? "Erro interno. Tente novamente." : err.message,
  });
};

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", packagesRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/webhooks", webhooksRouter);
  app.use("/api/lessons", lessonsRouter);
  app.use("/api/me", studentRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api", checkoutRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Não encontrado." });
  });

  app.use(handleError);

  return app;
}
