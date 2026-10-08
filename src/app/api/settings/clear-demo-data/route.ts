import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { dealsTable, notesTable, researchReportsTable, searchRunsTable, sourcesTable } from '@/server/db/schema';

export const runtime = 'nodejs';

const ClearDemoDataSchema = z.object({ confirmation: z.literal('CLEAR') });

/** Removes fictitious records but keeps live deals. Notebook notes are cleared in full by explicit confirmation. */
export async function POST(req: Request) {
  try {
    const parsed = ClearDemoDataSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Type CLEAR to confirm this action.' }, { status: 400 });
    }

    const demoDealIds = db.select({ id: dealsTable.id }).from(dealsTable)
      .where(eq(dealsTable.origin, 'demo')).all().map((deal) => deal.id);
    const deletedNotebookNotes = db.select({ id: notesTable.id }).from(notesTable).all().length;

    db.transaction(() => {
      db.delete(notesTable).run();
      if (demoDealIds.length > 0) {
        db.delete(researchReportsTable).where(inArray(researchReportsTable.dealId, demoDealIds)).run();
        db.delete(dealsTable).where(inArray(dealsTable.id, demoDealIds)).run();
      }
      db.delete(sourcesTable).where(eq(sourcesTable.origin, 'demo')).run();
      db.delete(searchRunsTable).where(eq(searchRunsTable.origin, 'demo')).run();
    });

    return NextResponse.json({ success: true, deletedDemoDeals: demoDealIds.length, deletedNotebookNotes });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
