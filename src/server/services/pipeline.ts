import type { SearchFilters, SearchRun, Deal, Source, UserStatus } from '@/domain/types';
import { getProvider } from '../providers/providerFactory';
import { sourcesRepository } from '../repositories/sourcesRepository';
import { dealsRepository } from '../repositories/dealsRepository';
import { searchRunsRepository } from '../repositories/searchRunsRepository';
import {
  canonicalizeUrl,
  deduplicateSources,
  normalizeDiscoveryPayload,
  candidateToDeal,
} from './normalizer';
import { classifySourceDomain } from './sourceClassifier';
import { verifyFactValue, isDateWithinWindow } from './verification';
import { rankDeal } from './ranking';

export interface DiscoveryPipelineParams {
  runId: string;
  jobId: string;
  filters: SearchFilters;
  signal: AbortSignal;
  onProgress: (stage: string, progress: number) => Promise<void>;
  providerOverride?: string;
  todayDate?: Date;
}

export async function runDiscoveryPipeline(params: DiscoveryPipelineParams): Promise<Deal[]> {
  const { runId, jobId, filters, signal, onProgress, providerOverride, todayDate = new Date() } = params;
  const todayStr = todayDate.toISOString().split('T')[0];

  const provider = getProvider(providerOverride);

  // 1. Gather
  await onProgress('Finding candidates', 15);

  const gatheredSources: Source[] = [];
  let sourceIndex = 1;

  const ctx = {
    today: todayStr,
    signal,
    budget: { maxSearches: 20, maxFetches: 15, remainingSearches: 20, remainingFetches: 15 },
    log: () => {},
  };

  for await (const event of provider.gather({ kind: 'discovery', filters }, ctx)) {
    if (signal.aborted) throw new Error('Aborted');

    if (event.type === 'stage') {
      await onProgress(event.stage, event.progress || 30);
    } else if (event.type === 'evidence') {
      const canonical = canonicalizeUrl(event.item.url);
      const sType = classifySourceDomain(canonical);
      const source: Source = {
        id: `S${sourceIndex++}`,
        jobId,
        origin: provider.id === 'demo' ? 'demo' : 'live',
        url: canonical,
        publisher: event.item.publisher || 'Web Source',
        title: event.item.title,
        publishedAt: event.item.publishedAt,
        accessedAt: new Date().toISOString(),
        sourceType: sType,
        retrievedVia: event.item.via,
        excerpt: event.item.text.slice(0, 300),
      };
      gatheredSources.push(source);
    }
  }

  // Deduplicate sources and persist
  const dedupedSources = deduplicateSources(gatheredSources);
  await sourcesRepository.insertMany(dedupedSources);

  // 2. Extract
  await onProgress('Extracting deal facts', 65);
  const rawExtraction = await provider.extract(
    { kind: 'discovery', sourcePack: dedupedSources },
    ctx
  );
  const dealOrigin = (provider.id === 'demo' || provider.id === 'failing_test') ? 'demo' : 'live';
  const payload = normalizeDiscoveryPayload(rawExtraction);

  // 3. Checking primary sources & Verification
  await onProgress('Checking primary sources', 80);
  const sourceMap = new Map<string, Source>(dedupedSources.map((s) => [s.id, s]));

  const verifiedDeals: Deal[] = [];
  const excluded: { reason: string; label: string }[] = [];

  for (let idx = 0; idx < payload.candidates.length; idx++) {
    if (signal.aborted) throw new Error('Aborted');
    const candidate = payload.candidates[idx];

    const rawDeal = candidateToDeal(candidate, {
      index: idx,
      filters,
      sources: dedupedSources,
      today: todayStr,
      runId,
      origin: dealOrigin,
    });

    if (!rawDeal) {
      continue; // Discard invalid candidate per contract
    }

    // Rule 6: Check announcement date window
    const annDateVal = rawDeal.announcementDate.value;
    if (!annDateVal || !isDateWithinWindow(annDateVal, filters.timeWindow, todayDate, {
      start: filters.customStartDate,
      end: filters.customEndDate,
    })) {
      excluded.push({
        reason: 'outside_time_window',
        label: `${rawDeal.headline} (outside ${filters.timeWindow} window)`,
      });
      continue;
    }

    // Status filter
    if (filters.dealStatus !== 'any' && rawDeal.transactionStatus !== filters.dealStatus) {
      excluded.push({
        reason: 'status_mismatch',
        label: `${rawDeal.headline} (status is ${rawDeal.transactionStatus})`,
      });
      continue;
    }

    // Rumored deals filter
    if (!filters.includeRumored && rawDeal.transactionStatus === 'rumored') {
      excluded.push({
        reason: 'rumored_excluded',
        label: `${rawDeal.headline} (rumored deal not requested)`,
      });
      continue;
    }

    // Geography filter
    if (filters.geography !== 'Global' && rawDeal.geographyRegion !== filters.geography) {
      if (!(filters.geography === 'North America' && rawDeal.geographyRegion === 'US')) {
        excluded.push({
          reason: 'geography_mismatch',
          label: `${rawDeal.headline} (region ${rawDeal.geographyRegion})`,
        });
        continue;
      }
    }

    // Subsector filter (if specified)
    if (filters.subsectors && filters.subsectors.length > 0) {
      const matchesSubsector = rawDeal.subsectors.some((s) => filters.subsectors.includes(s));
      if (!matchesSubsector) {
        excluded.push({
          reason: 'subsector_mismatch',
          label: `${rawDeal.headline} (subsectors: ${rawDeal.subsectors.join(', ')})`,
        });
        continue;
      }
    }

    // Verify Deal Value
    const verifiedDealValue = verifyFactValue(rawDeal.dealValue, sourceMap, {
      isRumored: rawDeal.transactionStatus === 'rumored',
      numericCheck: rawDeal.dealValue.value
        ? {
            targetNumber: rawDeal.dealValue.value.amount,
            unit: rawDeal.dealValue.value.unit,
          }
        : undefined,
    });

    // Check if existing deal already exists in database (Deduplication across runs §2.3)
    const existing = await dealsRepository.getByDedupeKey(rawDeal.dedupeKey);
    const userStatus: UserStatus = existing ? existing.userStatus : 'discovered';

    const processedDeal: Deal = {
      ...rawDeal,
      origin: dealOrigin,
      dealValue: verifiedDealValue,
      userStatus,
      statusBeforeDelete: existing ? existing.statusBeforeDelete : undefined,
      firstSeenRunId: existing ? existing.firstSeenRunId : runId,
      searchRunIds: existing
        ? Array.from(new Set([...existing.searchRunIds, runId]))
        : [runId],
    };

    verifiedDeals.push(processedDeal);
  }

  // 4. Rank
  await onProgress('Ranking for interview usefulness', 95);

  const windowDays = filters.timeWindow === '30d' ? 30 : filters.timeWindow === '12m' ? 365 : 90;

  const rankedDeals = verifiedDeals.map((deal) => {
    const ranking = rankDeal({
      deal,
      sources: dedupedSources,
      selectedSector: filters.sector,
      selectedSubsectors: filters.subsectors,
      windowDays,
      today: todayDate,
    });
    return { ...deal, ranking };
  });

  // Sort descending by ranking score
  rankedDeals.sort((a, b) => b.ranking.score - a.ranking.score);

  // Limit to maxDeals
  const finalDeals = rankedDeals.slice(0, filters.maxDeals);

  // Persist deals incrementally
  for (const deal of finalDeals) {
    await dealsRepository.upsert(deal);
  }

  // Update search run with results and exclusions
  await searchRunsRepository.update(runId, {
    resultDealIds: finalDeals.map((d) => d.id),
    excluded,
    finishedAt: new Date().toISOString(),
  });

  return finalDeals;
}
