import type {
  Source,
  Deal,
  SearchFilters,
  DataOrigin,
  FactValue,
  Money,
  CandidateDeal,
  DiscoveryPayload,
} from '@/domain/types';
import {
  DealSchema,
  MoneySchema,
  CandidateDealSchema,
  DiscoveryPayloadSchema,
} from '@/domain/schemas';

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'ref',
  'fbclid',
  'gclid',
  '_hsenc',
  '_hsmi',
  'mc_cid',
  'mc_eid',
]);

/**
 * Canonicalizes a URL by lowercasing host, removing tracking parameters,
 * removing hash fragments, and stripping trailing slashes.
 */
export function canonicalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());
    parsed.hash = '';

    const keysToDelete: string[] = [];
    parsed.searchParams.forEach((_, key) => {
      if (TRACKING_PARAMS.has(key.toLowerCase()) || key.toLowerCase().startsWith('utm_')) {
        keysToDelete.push(key);
      }
    });
    for (const key of keysToDelete) {
      parsed.searchParams.delete(key);
    }

    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    parsed.pathname = pathname;

    return parsed.toString();
  } catch {
    return rawUrl.trim();
  }
}

/**
 * Deduplicates an array of sources by their canonical URL, preserving the earliest source.
 */
export function deduplicateSources<T extends { url: string }>(sources: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const s of sources) {
    const canonical = canonicalizeUrl(s.url);
    if (!seen.has(canonical)) {
      seen.add(canonical);
      result.push(s);
    }
  }

  return result;
}

const SUFFIX_REGEX = /\b(inc|incorporated|corp|corporation|plc|llc|holdings|co|group|ltd|limited)\b/gi;

/**
 * Normalizes a company name: lowercase, strip punctuation and legal suffixes, collapse whitespace.
 */
export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(SUFFIX_REGEX, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates the deterministic dedupeKey for a deal:
 * sortedBuyerNames + '|' + sortedTargetNames + '|' + announcementMonth (YYYY-MM)
 */
export function generateDedupeKey(
  buyerNames: string[],
  targetNames: string[],
  announcementDate: string
): string {
  const normBuyers = buyerNames.map(normalizeCompanyName).filter(Boolean).sort().join(',');
  const normTargets = targetNames.map(normalizeCompanyName).filter(Boolean).sort().join(',');
  const month = announcementDate.slice(0, 7); // YYYY-MM
  return `${normBuyers}|${normTargets}|${month}`;
}

/**
 * Checks if two deals represent the same economic transaction:
 * Exact name match and announcement dates within 10 days.
 */
export function areDealsDuplicate(
  dealA: { buyers: string[]; targets: string[]; announcementDate: string },
  dealB: { buyers: string[]; targets: string[]; announcementDate: string }
): boolean {
  const buyersA = dealA.buyers.map(normalizeCompanyName).sort().join(',');
  const buyersB = dealB.buyers.map(normalizeCompanyName).sort().join(',');
  const targetsA = dealA.targets.map(normalizeCompanyName).sort().join(',');
  const targetsB = dealB.targets.map(normalizeCompanyName).sort().join(',');

  if (buyersA !== buyersB || targetsA !== targetsB) {
    return false;
  }

  const dateA = new Date(dealA.announcementDate).getTime();
  const dateB = new Date(dealB.announcementDate).getTime();
  if (isNaN(dateA) || isNaN(dateB)) return false;

  const diffDays = Math.abs(dateA - dateB) / (1000 * 60 * 60 * 24);
  return diffDays <= 10;
}

export interface NormalizeDiscoveryOptions {
  filters?: Partial<SearchFilters>;
  sources?: Source[];
  sourceMap?: Map<string, Source>;
  today?: string;
  runId?: string;
  origin?: 'demo' | 'live';
}

/**
 * Normalizes raw structured discovery extraction results into the canonical DiscoveryPayload schema:
 * { candidates: CandidateDeal[], deals: CandidateDeal[] }
 * Unwraps top-level arrays, { candidates: [...] }, { deals: [...] }, { extractedData: ... },
 * validates every candidate with CandidateDealSchema, discards invalid candidates while retaining
 * valid ones with source provenance, and throws a clear provider error if the container is malformed.
 */
export function normalizeDiscoveryPayload(rawExtraction: unknown): DiscoveryPayload {
  let parsedJson = rawExtraction;
  if (typeof parsedJson === 'string') {
    try {
      parsedJson = JSON.parse(parsedJson);
    } catch {
      throw new Error(
        'Provider extraction error: model response is malformed. Expected valid JSON.'
      );
    }
  }

  if (!parsedJson || typeof parsedJson !== 'object') {
    throw new Error(
      'Provider extraction error: model response is malformed. Expected a list of candidate deals.'
    );
  }

  let candidatesList: unknown[] | null = null;

  if (Array.isArray(parsedJson)) {
    candidatesList = parsedJson;
  } else {
    const obj = parsedJson as Record<string, unknown>;
    if (Array.isArray(obj.candidates)) {
      candidatesList = obj.candidates;
    } else if (Array.isArray(obj.deals)) {
      candidatesList = obj.deals;
    } else if (Array.isArray(obj.rawCandidates)) {
      candidatesList = obj.rawCandidates;
    } else if (Array.isArray(obj.transactions)) {
      candidatesList = obj.transactions;
    } else if (obj.extractedData && typeof obj.extractedData === 'object') {
      const ext = obj.extractedData as Record<string, unknown>;
      if (Array.isArray(ext.candidates)) {
        candidatesList = ext.candidates;
      } else if (Array.isArray(ext.deals)) {
        candidatesList = ext.deals;
      } else if (Array.isArray(ext.rawCandidates)) {
        candidatesList = ext.rawCandidates;
      } else if (Array.isArray(ext.transactions)) {
        candidatesList = ext.transactions;
      } else if (Array.isArray(obj.extractedData)) {
        candidatesList = obj.extractedData;
      }
    } else if (obj.data && typeof obj.data === 'object') {
      const dataObj = obj.data as Record<string, unknown>;
      if (Array.isArray(dataObj.candidates)) {
        candidatesList = dataObj.candidates;
      } else if (Array.isArray(dataObj.deals)) {
        candidatesList = dataObj.deals;
      } else if (Array.isArray(obj.data)) {
        candidatesList = obj.data;
      }
    }
  }

  if (!candidatesList) {
    throw new Error(
      'Provider extraction error: model response is malformed. Expected a list of candidate deals.'
    );
  }

  const validCandidates: CandidateDeal[] = [];

  for (const rawCandidate of candidatesList) {
    if (!rawCandidate || typeof rawCandidate !== 'object') {
      continue; // Discard invalid candidate (not an object)
    }

    const candidateObj = rawCandidate as Record<string, unknown>;
    if (typeof candidateObj.headline !== 'string' || !candidateObj.headline.trim()) {
      continue; // Discard invalid candidate (missing headline)
    }

    const parseResult = CandidateDealSchema.safeParse(rawCandidate);
    if (parseResult.success) {
      validCandidates.push(parseResult.data);
    }
  }

  return {
    candidates: validCandidates,
    deals: validCandidates,
  };
}

/**
 * Transforms a validated CandidateDeal into a full Deal for pipeline verification.
 * Preserves source IDs and provenance, and validates against DealSchema.
 */
export function candidateToDeal(
  candidate: CandidateDeal,
  options?: NormalizeDiscoveryOptions & { index?: number }
): Deal | null {
  // If candidate is already a fully valid Deal (e.g. demo fixtures), return it directly
  const directParse = DealSchema.safeParse(candidate);
  if (directParse.success) {
    return directParse.data;
  }

  // Preserve source IDs / provenance
  const rawSourceIds = Array.isArray(candidate.sourceIds)
    ? candidate.sourceIds.filter((s) => typeof s === 'string' && s.trim().length > 0)
    : [];

  const candidateSourceIds =
    rawSourceIds.length > 0
      ? rawSourceIds
      : options?.sources?.[0]?.id
      ? [options.sources[0].id]
      : ['S1'];

  const buyerName =
    candidate.buyerName ||
    (Array.isArray(candidate.buyers) ? candidate.buyers[0] : null) ||
    'Unknown Buyer';

  const targetName =
    candidate.targetName ||
    (Array.isArray(candidate.targets) ? candidate.targets[0] : null) ||
    'Unknown Target';

  const buyerId =
    (candidate.buyerIds && candidate.buyerIds[0]) ||
    normalizeCompanyName(buyerName).replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') ||
    'buyer';

  const targetId =
    (candidate.targetIds && candidate.targetIds[0]) ||
    normalizeCompanyName(targetName).replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') ||
    'target';

  let announcementDate: FactValue<string>;
  if (
    candidate.announcementDate &&
    typeof candidate.announcementDate === 'object' &&
    'valueStatus' in candidate.announcementDate
  ) {
    announcementDate = candidate.announcementDate as FactValue<string>;
  } else {
    const dateVal =
      typeof candidate.announcementDate === 'string'
        ? candidate.announcementDate
        : options?.sources?.find((s) => candidateSourceIds.includes(s.id))?.publishedAt ||
          options?.today ||
          new Date().toISOString().split('T')[0];

    announcementDate = {
      value: dateVal,
      display: dateVal,
      valueStatus: 'reported',
      sourceIds: candidateSourceIds,
    };
  }

  let closingDate: FactValue<string>;
  if (
    candidate.closingDate &&
    typeof candidate.closingDate === 'object' &&
    'valueStatus' in candidate.closingDate
  ) {
    closingDate = candidate.closingDate as FactValue<string>;
  } else if (typeof candidate.closingDate === 'string') {
    closingDate = {
      value: candidate.closingDate,
      display: candidate.closingDate,
      valueStatus: 'reported',
      sourceIds: candidateSourceIds,
    };
  } else {
    closingDate = {
      valueStatus: 'not_publicly_disclosed',
      display: 'Not publicly disclosed',
      sourceIds: [],
    };
  }

  const validStatuses = ['pending', 'closed', 'rumored', 'terminated', 'unknown'] as const;
  const transactionStatus = (
    candidate.transactionStatus && validStatuses.includes(candidate.transactionStatus as any)
      ? candidate.transactionStatus
      : 'pending'
  ) as Deal['transactionStatus'];

  let dealValue: FactValue<Money>;
  if (candidate.dealValue && typeof candidate.dealValue === 'object') {
    if ('valueStatus' in candidate.dealValue) {
      dealValue = candidate.dealValue as FactValue<Money>;
    } else {
      const moneyParsed = MoneySchema.safeParse(candidate.dealValue);
      if (moneyParsed.success) {
        const money = moneyParsed.data;
        const unitSuffix = money.unit === 'billions' ? 'bn' : money.unit === 'millions' ? 'm' : '';
        const typeLabel = money.valueType.replace(/_/g, ' ');
        dealValue = {
          value: money,
          display: `$${money.amount}${unitSuffix} ${typeLabel}`,
          valueStatus: 'reported',
          sourceIds: candidateSourceIds,
        };
      } else {
        dealValue = {
          valueStatus: 'not_publicly_disclosed',
          display: 'Not publicly disclosed',
          sourceIds: [],
        };
      }
    }
  } else {
    dealValue = {
      valueStatus: 'not_publicly_disclosed',
      display: 'Not publicly disclosed',
      sourceIds: [],
    };
  }

  const dedupeKey =
    typeof candidate.dedupeKey === 'string' && candidate.dedupeKey
      ? candidate.dedupeKey
      : generateDedupeKey(
          [buyerName],
          [targetName],
          announcementDate.value || options?.today || '2026-03-01'
        );

  const idx = options?.index ?? 0;
  const id = candidate.id || `live-candidate-${idx + 1}-${Date.now()}`;
  const origin: DataOrigin = options?.origin || 'live';
  const sector = candidate.sector || options?.filters?.sector || 'Consumer & Retail';
  const subsectors =
    Array.isArray(candidate.subsectors) && candidate.subsectors.length > 0
      ? candidate.subsectors
      : options?.filters?.subsectors && options.filters.subsectors.length > 0
      ? options.filters.subsectors
      : ['Food & Beverage'];
  const rawGeo = candidate.geographyRegion || options?.filters?.geography || 'US';
  const geographyRegion: Deal['geographyRegion'] = rawGeo === 'Global' ? 'Other' : rawGeo;

  const quickPreview = candidate.quickPreview || {
    summary: {
      id: `qp-${id}-summary`,
      text: candidate.headline,
      claimType: 'fact' as const,
      sourceIds: candidateSourceIds,
      confidence: 'high' as const,
    },
    background: [],
    parties: [
      { companyId: buyerId, role: 'buyer' as const, sourceIds: candidateSourceIds },
      { companyId: targetId, role: 'target' as const, sourceIds: candidateSourceIds },
    ],
    advisers: [],
    dealValue,
    multiples: [],
    timeline: [
      {
        id: `qp-${id}-time-1`,
        text: `Announced ${announcementDate.value || 'recently'}`,
        claimType: 'fact' as const,
        sourceIds: candidateSourceIds,
        confidence: 'high' as const,
      },
    ],
    differentiators: [],
    drivers: [],
    trendTags: [],
    noveltyTags: [],
    sourceIds: candidateSourceIds,
  };

  const normalizedDeal: Deal = {
    id,
    origin,
    dedupeKey,
    headline: candidate.headline,
    sector,
    subsectors,
    geographyRegion,
    buyerIds: candidate.buyerIds || [buyerId],
    targetIds: candidate.targetIds || [targetId],
    sellerIds: candidate.sellerIds || [],
    announcementDate,
    closingDate,
    transactionStatus,
    transactionStatusSourceIds: candidateSourceIds,
    userStatus: 'discovered',
    statusBeforeDelete: undefined,
    dealValue,
    quickPreview,
    ranking: candidate.ranking || {
      score: 0.8,
      features: {},
      reasons: [],
    },
    firstSeenRunId: options?.runId || 'run-initial',
    searchRunIds: [options?.runId || 'run-initial'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const validationResult = DealSchema.safeParse(normalizedDeal);
  if (!validationResult.success) {
    return null;
  }

  return validationResult.data;
}

/**
 * Normalizes discovery extraction results into an array of validated Deal objects.
 */
export function normalizeDiscoveryCandidates(
  rawExtraction: unknown,
  options?: NormalizeDiscoveryOptions
): Deal[] {
  const payload = normalizeDiscoveryPayload(rawExtraction);
  const deals: Deal[] = [];

  for (let i = 0; i < payload.candidates.length; i++) {
    const deal = candidateToDeal(payload.candidates[i], { ...options, index: i });
    if (deal) {
      deals.push(deal);
    }
  }

  return deals;
}

