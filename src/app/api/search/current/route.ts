import { NextResponse } from 'next/server';
import { searchRunsRepository } from '@/server/repositories/searchRunsRepository';
import { dealsRepository } from '@/server/repositories/dealsRepository';
import { jobsRepository } from '@/server/repositories/jobsRepository';
import type { Deal } from '@/domain/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const latestRun = await searchRunsRepository.getLatest();
    const allDeals = await dealsRepository.list();

    const activeJob = latestRun ? await jobsRepository.getById(latestRun.jobId) : null;

    // Filter deals into queue groups
    // 1. On hold: all 'review' deals from any run
    const onHold = allDeals.filter((d) => d.userStatus === 'review');

    // 2. Restored: deals restored to 'discovered' whose run is not the current run
    const restored = allDeals.filter(
      (d) =>
        d.userStatus === 'discovered' &&
        latestRun &&
        !latestRun.resultDealIds.includes(d.id)
    );

    // 3. Current results: latest run result deals, excluding deleted
    let currentResults: Deal[] = [];
    if (latestRun) {
      const runDealMap = new Map(allDeals.map((d) => [d.id, d]));
      currentResults = latestRun.resultDealIds
        .map((id) => runDealMap.get(id))
        .filter((d): d is Deal => Boolean(d && d.userStatus !== 'deleted' && d.userStatus !== 'review'));
    }

    // Hidden in Recycle Bin count
    const hiddenCount = allDeals.filter((d) => d.userStatus === 'deleted').length;

    return NextResponse.json({
      run: latestRun || null,
      job: activeJob || null,
      queue: {
        onHold,
        restored,
        currentResults,
      },
      hiddenCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
