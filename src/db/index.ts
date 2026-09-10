import {drizzle} from "drizzle-orm/node-postgres";
import {Pool} from "pg";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

const globalDb = globalThis as unknown as { db?: NodePgDatabase };

const db = globalDb.db ?? drizzle(new Pool({
  connectionString: process.env.DATABASE_URL,
}));

if (!globalDb.db) globalDb.db = db;

export { db };