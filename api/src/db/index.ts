import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { env } from "../env.js";
import * as schema from "./schema.js";

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const migrationsFolder = resolve(apiRoot, "drizzle");

function connect() {
  if (env.databaseUrl) {
    const pool = new pg.Pool({ connectionString: env.databaseUrl });
    return {
      db: drizzlePg(pool, { schema }),
      migrate: () => migratePg(drizzlePg(pool), { migrationsFolder }),
    };
  }

  // Real Postgres running inside this process, so development needs no install.
  // Tests pass DATA_DIR=memory:// to get a throwaway database.
  const dataDir = process.env.DATA_DIR ?? resolve(apiRoot, ".data");
  if (!dataDir.startsWith("memory://")) mkdirSync(dataDir, { recursive: true });
  const client = new PGlite(dataDir);

  return {
    db: drizzlePglite(client, { schema }) as unknown as ReturnType<
      typeof drizzlePg<typeof schema>
    >,
    migrate: () => migratePglite(drizzlePglite(client), { migrationsFolder }),
  };
}

const connection = connect();

export const db = connection.db;
export const runMigrations = connection.migrate;
