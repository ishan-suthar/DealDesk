import { NextResponse } from 'next/server';
import { jobRunner } from '@/server/jobs/jobRunner';

export const runtime = 'nodejs';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = jobRunner.cancelJob(params.id);
    return NextResponse.json({ success, jobId: params.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
