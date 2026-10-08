import { db } from '../db/client';
import { dealsTable } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { Deal, UserStatus } from '@/domain/types';

export const dealsRepository = {
  async getById(id: string): Promise<Deal | undefined> {
    const row = db.select().from(dealsTable).where(eq(dealsTable.id, id)).get();
    return row ? (row as unknown as Deal) : undefined;
  },

  async getByDedupeKey(dedupeKey: string): Promise<Deal | undefined> {
    const row = db.select().from(dealsTable).where(eq(dealsTable.dedupeKey, dedupeKey)).get();
    return row ? (row as unknown as Deal) : undefined;
  },

  async list(filters?: { userStatus?: UserStatus; sector?: string }): Promise<Deal[]> {
    let rows = db.select().from(dealsTable).all();
    if (filters?.userStatus) {
      rows = rows.filter((r) => r.userStatus === filters.userStatus);
    }
    if (filters?.sector) {
      rows = rows.filter((r) => r.sector === filters.sector);
    }
    return rows as unknown as Deal[];
  },

  async getSavedDeals(): Promise<Deal[]> {
    const rows = db.select().from(dealsTable).where(eq(dealsTable.userStatus, 'saved')).all();
    return rows as unknown as Deal[];
  },

  async getDeletedDeals(): Promise<Deal[]> {
    const rows = db
      .select()
      .from(dealsTable)
      .where(eq(dealsTable.userStatus, 'deleted'))
      .orderBy(desc(dealsTable.deletedAt))
      .all();
    return rows as unknown as Deal[];
  },

  async upsert(deal: Deal): Promise<Deal> {
    const values = {
      ...deal,
      updatedAt: new Date().toISOString(),
    };
    db.insert(dealsTable)
      .values(values as any)
      .onConflictDoUpdate({
        target: dealsTable.id,
        set: values as any,
      })
      .run();
    return values;
  },

  async updateStatus(
    id: string,
    nextStatus: UserStatus,
    statusBeforeDelete?: Exclude<UserStatus, 'deleted'>
  ): Promise<Deal | undefined> {
    const current = await this.getById(id);
    if (!current) return undefined;

    const nowIso = new Date().toISOString();
    const updateData: Partial<typeof dealsTable.$inferInsert> = {
      userStatus: nextStatus,
      updatedAt: nowIso,
    };

    if (nextStatus === 'deleted') {
      updateData.deletedAt = nowIso;
      updateData.statusBeforeDelete = statusBeforeDelete ?? current.userStatus as Exclude<UserStatus, 'deleted'>;
    } else {
      updateData.deletedAt = null;
      updateData.statusBeforeDelete = statusBeforeDelete;
    }

    db.update(dealsTable)
      .set(updateData as any)
      .where(eq(dealsTable.id, id))
      .run();

    return this.getById(id);
  },

  async purge(id: string): Promise<boolean> {
    const result = db.delete(dealsTable).where(eq(dealsTable.id, id)).run();
    return result.changes > 0;
  },

  async deleteAll(): Promise<void> {
    db.delete(dealsTable).run();
  },
};
