import { NextResponse } from 'next/server';
import { SearchFiltersSchema } from '@/domain/schemas';
import { jobsRepository } from '@/server/repositories/jobsRepository';
import { searchRunsRepository } from '@/server/repositories/searchRunsRepository';
import { jobRunner } from '@/server/jobs/jobRunner';
import { runDiscoveryPipeline } from '@/server/services/pipeline';
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

    await searchRunsRepository.create({
      id: runId,
      filters,
      provider: process.env.RESEARCH_PROVIDER || 'demo',
      origin: 'demo',
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
      });
    });

    return NextResponse.json({ runId, jobId }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
