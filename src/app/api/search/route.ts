import { NextResponse } from 'next/server';
import { SearchFiltersSchema } from '@/domain/schemas';
import { jobsRepository } from '@/server/repositories/jobsRepository';
import { searchRunsRepository } from '@/server/repositories/searchRunsRepository';
import { jobRunner } from '@/server/jobs/jobRunner';
import { runDiscoveryPipeline } from '@/server/services/pipeline';
import { getActiveProviderInfo } from '@/server/providers/providerFactory';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parseResult = SearchFiltersSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid search filters', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const filters = parseResult.data;

    // Concurrency check: max 1 discovery job running at a time
    const activeJob = await jobsRepository.getActiveDiscoveryJob();
    if (activeJob) {
      return NextResponse.json(
        { error: 'A discovery search is already in progress.', jobId: activeJob.id },
        { status: 409 }
      );
    }

    const runId = `run-${crypto.randomUUID()}`;
    const jobId = `job-${crypto.randomUUID()}`;
    const nowIso = new Date().toISOString();

    await jobsRepository.create({
      id: jobId,
      kind: 'discovery',
      status: 'queued',
      stage: 'Queued',
      progress: 0,
      startedAt: nowIso,
      heartbeatAt: nowIso,
      usage: { searches: 0, fetches: 0, inputTokens: 0, outputTokens: 0 },
      createdAt: nowIso,
    });

    const activeInfo = getActiveProviderInfo();
    const activeOrigin = activeInfo.isLive ? 'live' : 'demo';

    await searchRunsRepository.create({
      id: runId,
      filters,
      provider: activeInfo.providerId,
      origin: activeOrigin,
      jobId,
      startedAt: nowIso,
      resultDealIds: [],
      excluded: [],
    });

    jobRunner.startJob(jobId, async (signal, updateProgress) => {
      await runDiscoveryPipeline({
        runId,
        jobId,
        filters,
        signal,
        onProgress: updateProgress,
        providerOverride: activeInfo.providerId,
      });
    });

    return NextResponse.json({ runId, jobId }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
