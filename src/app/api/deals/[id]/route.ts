import { NextResponse } from 'next/server';
import { dealsRepository } from '@/server/repositories/dealsRepository';
import { sourcesRepository } from '@/server/repositories/sourcesRepository';
import { companiesRepository } from '@/server/repositories/companiesRepository';
import { reportsRepository } from '@/server/repositories/reportsRepository';
import { notesRepository } from '@/server/repositories/notesRepository';

export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deal = await dealsRepository.getById(params.id);
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    const companyIds = Array.from(
      new Set([...deal.buyerIds, ...deal.targetIds, ...deal.sellerIds])
    );
    const companies = await companiesRepository.getByIds(companyIds);
    const sources = await sourcesRepository.getByIds(deal.quickPreview.sourceIds);

    return NextResponse.json({ deal, companies, sources });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deal = await dealsRepository.getById(params.id);
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    if (deal.userStatus !== 'deleted') {
      return NextResponse.json(
        { error: 'Cannot permanently remove deal unless its status is deleted.' },
        { status: 409 }
      );
    }

    const purgedNotesCount = await notesRepository.deleteByDealId(params.id);
    const purgedReportsCount = await reportsRepository.deleteByDealId(params.id);
    const success = await dealsRepository.purge(params.id);

    return NextResponse.json({
      success,
      deletedDealId: params.id,
      purgedNotesCount,
      purgedReportsCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
