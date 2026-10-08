import { db } from '../db/client';
import { searchRunsTable } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import type { SearchRun } from '@/domain/types';

export const searchRunsRepository = {
  async getById(id: string): Promise<SearchRun | undefined> {
    const row = db.select().from(searchRunsTable).where(eq(searchRunsTable.id, id)).get();
    return row ? (row as unknown as SearchRun) : undefined;
  },

  async getLatest(): Promise<SearchRun | undefined> {
    const row = db
      .select()
      .from(searchRunsTable)
      .orderBy(desc(searchRunsTable.startedAt))
      .get();
    return row ? (row as unknown as SearchRun) : undefined;
  },

  async create(run: SearchRun): Promise<SearchRun> {
    db.insert(searchRunsTable).values(run as any).run();
    return run;
  },

  async update(id: string, partial: Partial<SearchRun>): Promise<SearchRun | undefined> {
    const current = await this.getById(id);
    if (!current) return undefined;

    const updated = { ...current, ...partial };
    db.update(searchRunsTable)
      .set(updated as any)
      .where(eq(searchRunsTable.id, id))
      .run();
    return updated;
  },

  async deleteAll(): Promise<void> {
    db.delete(searchRunsTable).run();
  },
};
