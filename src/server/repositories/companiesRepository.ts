import { db } from '../db/client';
import { companiesTable } from '../db/schema';
import { inArray, eq } from 'drizzle-orm';
import type { Company } from '@/domain/types';

export const companiesRepository = {
  async getById(id: string): Promise<Company | undefined> {
    const row = db.select().from(companiesTable).where(eq(companiesTable.id, id)).get();
    return row ? (row as unknown as Company) : undefined;
  },

  async getByIds(ids: string[]): Promise<Company[]> {
    if (ids.length === 0) return [];
    const rows = db.select().from(companiesTable).where(inArray(companiesTable.id, ids)).all();
    return rows as unknown as Company[];
  },

  async insert(company: Company): Promise<Company> {
    const row = {
      ...company,
      createdAt: (company as any).createdAt || new Date().toISOString(),
    };
    db.insert(companiesTable)
      .values(row as any)
      .onConflictDoUpdate({
        target: companiesTable.id,
        set: row as any,
      })
      .run();
    return row as any;
  },

  async insertMany(companies: Company[]): Promise<Company[]> {
    for (const c of companies) {
      await this.insert(c);
    }
    return companies;
  },

  async deleteAll(): Promise<void> {
    db.delete(companiesTable).run();
  },
};
