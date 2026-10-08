import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

const dbPath = process.env.DATABASE_URL || path.resolve(process.cwd(), 'deal_desk.db');

interface GlobalWithDb {
  __dealDeskSqlite?: Database.Database;
}

const globalForDb = globalThis as unknown as GlobalWithDb;

const sqlite = globalForDb.__dealDeskSqlite || new Database(dbPath);
if (process.env.NODE_ENV !== 'production') {
  globalForDb.__dealDeskSqlite = sqlite;
}

// Enable WAL mode for concurrent performance
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
export { sqlite };
