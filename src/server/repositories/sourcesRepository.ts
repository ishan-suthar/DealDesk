import { db } from '../db/client';
import { sourcesTable } from '../db/schema';
import { inArray, eq } from 'drizzle-orm';
import type { Source } from '@/domain/types';

export const sourcesRepository = {
  async getById(id: string): Promise<Source | undefined> {
    const row = db.select().from(sourcesTable).where(eq(sourcesTable.id, id)).get();
    return row ? (row as Source) : undefined;
  },

  async getByIds(ids: string[]): Promise<Source[]> {
    if (ids.length === 0) return [];
    const rows = db.select().from(sourcesTable).where(inArray(sourcesTable.id, ids)).all();
    return rows as Source[];
  },

  async getByJobId(jobId: string): Promise<Source[]> {
    const rows = db.select().from(sourcesTable).where(eq(sourcesTable.jobId, jobId)).all();
    return rows as Source[];
  },

  async insert(source: Source): Promise<Source> {
    db.insert(sourcesTable)
      .values(source)
      .onConflictDoUpdate({
        target: sourcesTable.id,
        set: source,
      })
      .run();
    return source;
  },

  async insertMany(sources: Source[]): Promise<Source[]> {
    for (const s of sources) {
      await this.insert(s);
    }
    return sources;
  },

  async deleteAll(): Promise<void> {
    db.delete(sourcesTable).run();
  },
};
