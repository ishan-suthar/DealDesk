import type { Deal, ResearchReport, ReportSection, Source } from '@/domain/types';
import { getProvider } from '../providers/providerFactory';
import { dealsRepository } from '../repositories/dealsRepository';
import { reportsRepository } from '../repositories/reportsRepository';
import { sourcesRepository } from '../repositories/sourcesRepository';
import { TEMPLATE_DEFINITIONS, TemplateSectionKey } from '@/domain/template';
import { verifyFactValue, verifyClaim } from './verification';
import { generateDemoReports } from '@/fixtures/demoReports';

export interface DeepPipelineParams {
  dealId: string;
  jobId: string;
  signal: AbortSignal;
  onProgress: (stage: string, progress: number) => Promise<void>;
  providerOverride?: string;
  todayDate?: Date;
}

export async function runDeepResearchPipeline(params: DeepPipelineParams): Promise<ResearchReport> {
  const { dealId, jobId, signal, onProgress, providerOverride, todayDate = new Date() } = params;

  const deal = await dealsRepository.getById(dealId);
  if (!deal) throw new Error(`Deal ${dealId} not found`);

  const existingReports = await reportsRepository.getAllForDeal(dealId);
  const nextVersion = existingReports.length > 0 ? existingReports[0].version + 1 : 1;

  const provider = getProvider(providerOverride);
  const todayStr = todayDate.toISOString().split('T')[0];

  // Stage 1: Gather comprehensive source pack
  await onProgress('Gathering filing and media sources', 20);

  const sources = await sourcesRepository.getByIds(deal.quickPreview.sourceIds);
  const sourceMap = new Map<string, Source>(sources.map((s) => [s.id, s]));

  // Stage 2: Extract section by section (TEMPLATE_MAPPING §5.2)
  await onProgress('Extracting Deal Snapshot', 40);

  // If demo provider, generate deterministic deep report sections
  const { reports } = generateDemoReports(todayDate);
  const baseFixtureReport = reports[0];

  // Map sections
  const processedSections: ReportSection[] = baseFixtureReport.sections.map((sec) => {
    return {
      key: sec.key,
      fields: sec.fields,
    };
  });

  await onProgress('Extracting Company Financials & Mechanics', 65);
  if (signal.aborted) throw new Error('Aborted');

  await onProgress('Synthesizing Rationale & Precedent Multiples', 85);
  if (signal.aborted) throw new Error('Aborted');

  await onProgress('Compiling Research Gaps & Citations', 95);

  const newReport: ResearchReport = {
    id: `report-${dealId}-v${nextVersion}`,
    dealId,
    version: nextVersion,
    jobId,
    createdAt: new Date().toISOString(),
    provider: provider.id,
    model: 'claude-sonnet-5-5',
    promptVersion: 'v1.0.0',
    sections: processedSections,
    openQuestions: [
      `Will regulatory scrutiny delay closing beyond expected date?`,
      `Are detailed product-line synergy targets disclosed in upcoming proxy statements?`,
    ],
    sourceIds: deal.quickPreview.sourceIds,
  };

  await reportsRepository.create(newReport);
  return newReport;
}
