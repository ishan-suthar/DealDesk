export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dealsRepository } from '@/server/repositories/dealsRepository';
import { reportsRepository } from '@/server/repositories/reportsRepository';
import { sourcesRepository } from '@/server/repositories/sourcesRepository';
import { notesRepository } from '@/server/repositories/notesRepository';
import { settingsRepository } from '@/server/repositories/settingsRepository';
import { buildExportDocument } from '@/server/services/export/buildExportDocument';
import { renderMarkdown } from '@/server/services/export/renderMarkdown';
import { renderDocx } from '@/server/services/export/renderDocx';

export async function GET(
  req: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const dealId = params.dealId;
    const deal = await dealsRepository.getById(dealId);
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    const allReports = await reportsRepository.getAllForDeal(dealId);
    if (!allReports || allReports.length === 0) {
      return NextResponse.json(
        { error: 'No research report available to export for this deal' },
        { status: 404 }
      );
    }

    const latestReport = allReports[0];
    const sources = await sourcesRepository.getByIds(latestReport.sourceIds || []);
    const notes = await notesRepository.list({ dealId });
    const settings = await settingsRepository.getSettings();

    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'docx';

    const exportDoc = buildExportDocument({
      deal,
      report: latestReport,
      sources,
      notes,
      allReports,
      displayName: settings?.displayName || 'Nikita',
    });

    // Generate safe filename
    const safeHeadline = deal.headline
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);

    if (format === 'markdown') {
      const markdownText = renderMarkdown(exportDoc);
      return new NextResponse(markdownText, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="${safeHeadline}-v${latestReport.version}.md"`,
        },
      });
    }

    // Default: DOCX
    const docxBuffer = await renderDocx(exportDoc);
    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${safeHeadline}-v${latestReport.version}.docx"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating export:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during export' },
      { status: 500 }
    );
  }
}
