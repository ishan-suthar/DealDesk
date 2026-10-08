import type { Deal, Source } from '@/domain/types';

export interface RankingParams {
  deal: Deal;
  sources: Source[];
  selectedSector: string;
  selectedSubsectors: string[];
  windowDays: number;
  today?: Date;
}

export interface RankingResult {
  score: number;
  features: {
    sectorRelevance: number;
    recency: number;
    significance: number;
    primaryEvidence: number;
    trendRelevance: number;
    novelty: number;
  };
  reasons: string[];
}

export const NOVELTY_TAG_CANDIDATES = [
  'carve-out',
  'sponsor involvement',
  'contested/competing bid',
  'activist angle',
  'cross-border',
  'regulatory review',
  'unusual structure',
];

/**
 * Computes deal score purely in code from structured features per PRODUCT_SPEC §4.
 */
export function rankDeal(params: RankingParams): RankingResult {
  const { deal, sources, selectedSector, selectedSubsectors, windowDays, today = new Date() } = params;

  // 1. Sector/Subsector relevance (Weight: 30%)
  let sectorRelevance = 0;
  if (deal.sector === selectedSector) {
    if (selectedSubsectors.length === 0) {
      sectorRelevance = 1.0;
    } else {
      const hasDirect = deal.subsectors.some((s) => selectedSubsectors.includes(s));
      sectorRelevance = hasDirect ? 1.0 : 0.5; // 0.5 if within same sector
    }
  }

  // 2. Recency (Weight: 20%)
  let recency = 0;
  if (deal.announcementDate.value) {
    const annDate = new Date(deal.announcementDate.value).getTime();
    const todayTime = today.getTime();
    const windowMs = Math.max(windowDays, 1) * 24 * 60 * 60 * 1000;
    const elapsedMs = Math.max(0, todayTime - annDate);
    recency = Math.max(0, Math.min(1.0, 1.0 - elapsedMs / windowMs));
  }

  // 3. Significance / Value (Weight: 15%)
  let significance = 0.3; // default for undisclosed
  if (deal.dealValue && deal.dealValue.value && deal.dealValue.value.amount) {
    let amountInMillions = deal.dealValue.value.amount;
    const unit = deal.dealValue.value.unit;
    if (unit === 'billions') amountInMillions *= 1000;
    else if (unit === 'thousands') amountInMillions /= 1000;

    // Log-scaled disclosed value: $100m -> ~0.4, $1bn -> ~0.7, $10bn+ -> 1.0
    if (amountInMillions > 0) {
      const logVal = Math.log10(amountInMillions);
      // log10(100) = 2, log10(10000) = 4
      significance = Math.max(0.4, Math.min(1.0, (logVal - 1.5) / 2.5));
    }
  }

  // 4. Primary-source evidence (Weight: 15%)
  const dealSources = sources.filter((s) => deal.quickPreview.sourceIds.includes(s.id));
  const hasPrimary = dealSources.some((s) => s.sourceType === 'primary');
  const primaryEvidence = hasPrimary ? 1.0 : 0.4;

  // 5. Strategic rationale / trend relevance (Weight: 15%)
  const hasRationale = deal.quickPreview.differentiators.length > 0 || deal.quickPreview.drivers.length > 0;
  const hasTrend = deal.quickPreview.trendTags.length > 0;
  let trendRelevance = 0;
  if (hasRationale && hasTrend) trendRelevance = 1.0;
  else if (hasRationale || hasTrend) trendRelevance = 0.5;

  // 6. Coffee-chat novelty (Weight: 5%)
  const noveltyCount = deal.quickPreview.noveltyTags.length;
  const novelty = Math.min(1.0, noveltyCount * 0.25);

  // Compute final composite score
  const score =
    sectorRelevance * 0.3 +
    recency * 0.2 +
    significance * 0.15 +
    primaryEvidence * 0.15 +
    trendRelevance * 0.15 +
    novelty * 0.05;

  // Generate top 2-3 contributing reasons
  const candidateReasons: { text: string; weight: number }[] = [];

  if (hasPrimary) {
    candidateReasons.push({ text: 'Primary filing or press release verified', weight: 0.95 });
  }
  if (sectorRelevance === 1.0 && selectedSubsectors.length > 0) {
    candidateReasons.push({ text: `Exact subsector match (${deal.subsectors[0]})`, weight: 0.9 });
  } else if (sectorRelevance === 1.0) {
    candidateReasons.push({ text: `Sector core fit (${deal.sector})`, weight: 0.85 });
  }
  if (significance >= 0.75 && deal.dealValue.display) {
    candidateReasons.push({ text: `Significant valuation: ${deal.dealValue.display}`, weight: 0.88 });
  }
  if (recency >= 0.8) {
    candidateReasons.push({ text: 'Announced very recently', weight: 0.8 });
  }
  if (deal.quickPreview.noveltyTags.length > 0) {
    candidateReasons.push({ text: deal.quickPreview.noveltyTags[0], weight: 0.86 });
  }
  if (deal.quickPreview.trendTags.length > 0) {
    candidateReasons.push({ text: `Trend: ${deal.quickPreview.trendTags[0]}`, weight: 0.82 });
  }

  // Sort candidate reasons by weight and pick top 3
  candidateReasons.sort((a, b) => b.weight - a.weight);
  const reasons = candidateReasons.slice(0, 3).map((r) => r.text);

  if (reasons.length === 0) {
    reasons.push('Meets minimum evidence screening criteria');
  }

  return {
    score: Math.round(score * 100) / 100,
    features: {
      sectorRelevance,
      recency: Math.round(recency * 100) / 100,
      significance: Math.round(significance * 100) / 100,
      primaryEvidence,
      trendRelevance,
      novelty,
    },
    reasons,
  };
}
