import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './client';
import path from 'path';

export async function runMigrations() {
  console.log('Running database migrations...');
  const migrationsFolder = path.resolve(process.cwd(), 'drizzle');
  migrate(db, { migrationsFolder });
  console.log('Migrations completed successfully.');
}

if (process.argv[1] && /migrate(\.ts)?$/.test(process.argv[1])) {
  runMigrations().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
