import { db } from '../db/client';
import { jobsTable } from '../db/schema';
import { eq, and, or, lt } from 'drizzle-orm';
import type { Job } from '@/domain/types';

export const jobsRepository = {
  async getById(id: string): Promise<Job | undefined> {
    const row = db.select().from(jobsTable).where(eq(jobsTable.id, id)).get();
    return row ? (row as unknown as Job) : undefined;
  },

  async create(job: Job): Promise<Job> {
    db.insert(jobsTable).values(job as any).run();
    return job;
  },

  async update(id: string, partial: Partial<Job>): Promise<Job | undefined> {
    const current = await this.getById(id);
    if (!current) return undefined;

    const updated = { ...current, ...partial };
    db.update(jobsTable)
      .set(updated as any)
      .where(eq(jobsTable.id, id))
      .run();
    return updated;
  },

  async getActiveDiscoveryJob(): Promise<Job | undefined> {
    const row = db
      .select()
      .from(jobsTable)
      .where(
        and(
          eq(jobsTable.kind, 'discovery'),
          or(eq(jobsTable.status, 'queued'), eq(jobsTable.status, 'running'))
        )
      )
      .get();
    return row ? (row as unknown as Job) : undefined;
  },

  async getActiveDeepJob(dealId: string): Promise<Job | undefined> {
    const row = db
      .select()
      .from(jobsTable)
      .where(
        and(
          eq(jobsTable.kind, 'deep_research'),
          eq(jobsTable.dealId, dealId),
          or(eq(jobsTable.status, 'queued'), eq(jobsTable.status, 'running'))
        )
      )
      .get();
    return row ? (row as unknown as Job) : undefined;
  },

  async heartbeat(id: string): Promise<void> {
    db.update(jobsTable)
      .set({ heartbeatAt: new Date().toISOString() })
      .where(eq(jobsTable.id, id))
      .run();
  },

  async markInterrupted(cutoffIso: string): Promise<number> {
    const runningJobs = db
      .select()
      .from(jobsTable)
      .where(
        and(
          eq(jobsTable.status, 'running'),
          lt(jobsTable.heartbeatAt, cutoffIso)
        )
      )
      .all();

    for (const j of runningJobs) {
      db.update(jobsTable)
        .set({
          status: 'failed',
          finishedAt: new Date().toISOString(),
          error: {
            code: 'interrupted',
            message: 'Job was interrupted by server restart or lost heartbeat.',
          },
        })
        .where(eq(jobsTable.id, j.id))
        .run();
    }

    return runningJobs.length;
  },

  async deleteAll(): Promise<void> {
    db.delete(jobsTable).run();
  },
};
