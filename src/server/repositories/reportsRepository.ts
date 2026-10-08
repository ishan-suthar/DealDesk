import { db } from '../db/client';
import { researchReportsTable } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import type { ResearchReport } from '@/domain/types';

export const reportsRepository = {
  async getLatestForDeal(dealId: string): Promise<ResearchReport | undefined> {
    const row = db
      .select()
      .from(researchReportsTable)
      .where(eq(researchReportsTable.dealId, dealId))
      .orderBy(desc(researchReportsTable.version))
      .get();
    return row ? (row as unknown as ResearchReport) : undefined;
  },

  async getAllForDeal(dealId: string): Promise<ResearchReport[]> {
    const rows = db
      .select()
      .from(researchReportsTable)
      .where(eq(researchReportsTable.dealId, dealId))
      .orderBy(desc(researchReportsTable.version))
      .all();
    return rows as unknown as ResearchReport[];
  },

  async getByDealAndVersion(dealId: string, version: number): Promise<ResearchReport | undefined> {
    const row = db
      .select()
      .from(researchReportsTable)
      .where(
        and(
          eq(researchReportsTable.dealId, dealId),
          eq(researchReportsTable.version, version)
        )
      )
      .get();
    return row ? (row as unknown as ResearchReport) : undefined;
  },

  async create(report: ResearchReport): Promise<ResearchReport> {
    db.insert(researchReportsTable).values(report as any).run();
    return report;
  },

  async deleteByDealId(dealId: string): Promise<number> {
    const result = db
      .delete(researchReportsTable)
      .where(eq(researchReportsTable.dealId, dealId))
      .run();
    return result.changes;
  },

  async deleteAll(): Promise<void> {
    db.delete(researchReportsTable).run();
  },
};
