import { NextResponse } from 'next/server';
import { reportsRepository } from '@/server/repositories/reportsRepository';
import { sourcesRepository } from '@/server/repositories/sourcesRepository';
import { dealsRepository } from '@/server/repositories/dealsRepository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string; version: string } }
) {
  try {
    const versionNum = parseInt(params.version, 10);
    if (isNaN(versionNum)) {
      return NextResponse.json({ error: 'Invalid version number' }, { status: 400 });
    }

    const report = await reportsRepository.getByDealAndVersion(params.id, versionNum);
    if (!report) {
      return NextResponse.json({ error: 'Report version not found' }, { status: 404 });
    }

    const sources = await sourcesRepository.getByIds(report.sourceIds);
    return NextResponse.json({ report, sources });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
