import { createApp } from "./app.js";
import { runMigrations } from "./db/index.js";
import { seed } from "./db/seed.js";
import { env } from "./env.js";

await runMigrations();
await seed();

createApp().listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});
