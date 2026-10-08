import { NextResponse } from 'next/server';
import { reportsRepository } from '@/server/repositories/reportsRepository';
import { dealsRepository } from '@/server/repositories/dealsRepository';
import { jobsRepository } from '@/server/repositories/jobsRepository';
import { jobRunner } from '@/server/jobs/jobRunner';
import { runDeepResearchPipeline } from '@/server/services/deepPipeline';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deal = await dealsRepository.getById(params.id);
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    const reports = await reportsRepository.getAllForDeal(params.id);
    const latest = reports.length > 0 ? reports[0] : null;

    // Check if an active deep research job is running for this deal
    const activeJob = await jobsRepository.getActiveDeepJob(params.id);

    return NextResponse.json({ reports, latest, activeJob: activeJob || null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deal = await dealsRepository.getById(params.id);
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Concurrency check: 1 deep-research job per deal at a time (return existing)
    const existingJob = await jobsRepository.getActiveDeepJob(params.id);
    if (existingJob) {
      return NextResponse.json(
        { jobId: existingJob.id, message: 'Deep research already running for this deal.' },
        { status: 200 }
      );
    }

    const reports = await reportsRepository.getAllForDeal(params.id);
    const nextVersion = reports.length > 0 ? reports[0].version + 1 : 1;

    const jobId = `job-deep-${crypto.randomUUID()}`;
    const nowIso = new Date().toISOString();

    await jobsRepository.create({
      id: jobId,
      kind: 'deep_research',
      dealId: params.id,
      status: 'queued',
      stage: 'Queued',
      progress: 0,
      startedAt: nowIso,
      heartbeatAt: nowIso,
      usage: { searches: 0, fetches: 0, inputTokens: 0, outputTokens: 0 },
      createdAt: nowIso,
    });

    jobRunner.startJob(jobId, async (signal, updateProgress) => {
      await runDeepResearchPipeline({
        dealId: params.id,
        jobId,
        signal,
        onProgress: updateProgress,
      });
    });

    return NextResponse.json({ jobId, version: nextVersion }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
