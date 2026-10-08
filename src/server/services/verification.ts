import type {
  FactValue,
  Claim,
  Source,
  ValueStatus,
  SourceType,
  TransactionStatus,
  Money,
} from '@/domain/types';

/**
 * Checks if a numeric value appears in text in a recognized financial or percentage format.
 * Examples: $4.2 billion, $4.2bn, 4,200 million, US$4.2B, €850m, 28.5%, 14.5x
 */
export function numberAppearsInText(
  text: string,
  targetNumber: number,
  options?: { unit?: 'units' | 'thousands' | 'millions' | 'billions'; isPercentage?: boolean; isMultiple?: boolean }
): boolean {
  if (!text || targetNumber === undefined || targetNumber === null || isNaN(targetNumber)) {
    return false;
  }

  const cleanText = text.replace(/,/g, '');
  const targetStr = targetNumber.toString();

  // 1. Direct number match
  const directPattern = new RegExp(`(^|[^0-9.])${escapeRegExp(targetStr)}([^0-9.]|$)`, 'i');
  if (directPattern.test(cleanText)) {
    return true;
  }

  // 2. Fixed decimals variation (e.g. 4.2 -> 4.20 or 4 -> 4.0)
  const formattedFixed = targetNumber.toFixed(2);
  if (new RegExp(`(^|[^0-9.])${escapeRegExp(formattedFixed)}([^0-9.]|$)`, 'i').test(cleanText)) {
    return true;
  }
  const formattedOneDec = targetNumber.toFixed(1);
  if (new RegExp(`(^|[^0-9.])${escapeRegExp(formattedOneDec)}([^0-9.]|$)`, 'i').test(cleanText)) {
    return true;
  }

  // 3. Multiples (e.g. 14.5 -> 14.5x, 14.5 x)
  const multiplePattern = new RegExp(`(^|[^0-9.])${escapeRegExp(targetStr)}\\s*x([^a-zA-Z]|$)`, 'i');
  if (multiplePattern.test(cleanText)) {
    return true;
  }

  // 4. Percentage (e.g. 28.5 -> 28.5% or 28.5 percent)
  const percentPattern = new RegExp(`(^|[^0-9.])${escapeRegExp(targetStr)}\\s*(%|percent)`, 'i');
  if (percentPattern.test(cleanText)) {
    return true;
  }

  // 5. Financial scales: billions / millions / thousands
  // If targetNumber is 4.2 with unit billions, it could appear as 4.2 billion, 4.2bn, 4.2B, 4200 million, 4,200m
  if (options?.unit === 'billions' || targetNumber >= 1000000000 || targetNumber < 100) {
    const bValue = options?.unit === 'billions' ? targetNumber : targetNumber / 1e9;
    const bStr = bValue.toString();
    const bRegex = new RegExp(`(^|[^0-9.])(\\$|US\\$|€|£)?\\s*${escapeRegExp(bStr)}\\s*(bn|b|billion)`, 'i');
    if (bRegex.test(cleanText)) return true;

    // Check equivalent in millions: 4.2b = 4200m
    const mEquiv = (bValue * 1000).toString();
    const mRegex = new RegExp(`(^|[^0-9.])(\\$|US\\$|€|£)?\\s*${escapeRegExp(mEquiv)}\\s*(m|mm|million)`, 'i');
    if (mRegex.test(cleanText)) return true;
  }

  if (options?.unit === 'millions' || targetNumber >= 1000000) {
    const mValue = options?.unit === 'millions' ? targetNumber : targetNumber / 1e6;
    const mStr = mValue.toString();
    const mRegex = new RegExp(`(^|[^0-9.])(\\$|US\\$|€|£)?\\s*${escapeRegExp(mStr)}\\s*(m|mm|million)`, 'i');
    if (mRegex.test(cleanText)) return true;

    // Check equivalent in billions: 1250m = 1.25bn
    const bEquiv = (mValue / 1000).toString();
    const bRegex = new RegExp(`(^|[^0-9.])(\\$|US\\$|€|£)?\\s*${escapeRegExp(bEquiv)}\\s*(bn|b|billion)`, 'i');
    if (bRegex.test(cleanText)) return true;
  }

  return false;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Rule 1: Provenance Filter. Removes source IDs not present in knownSources.
 */
export function filterKnownSourceIds(sourceIds: string[], knownSourceIds: Set<string>): string[] {
  return sourceIds.filter((id) => knownSourceIds.has(id));
}

/**
 * Rule 4: Compute status ceiling based on sources and deal condition.
 * Rumored deals cap all facts at 'reported'.
 * 'verified' requires >= 1 primary source.
 * 'discovery' sources cannot be the sole support.
 */
export function computeStatusCeiling(
  candidateStatus: ValueStatus,
  sourceIds: string[],
  sourceMap: Map<string, Source>,
  isRumored = false
): ValueStatus {
  if (candidateStatus === 'not_found' || candidateStatus === 'not_publicly_disclosed') {
    return candidateStatus;
  }

  if (isRumored) {
    return candidateStatus === 'verified' ? 'reported' : candidateStatus;
  }

  if (sourceIds.length === 0) {
    return 'not_found';
  }

  const sources = sourceIds.map((id) => sourceMap.get(id)).filter(Boolean) as Source[];
  const hasPrimary = sources.some((s) => s.sourceType === 'primary');
  const allDiscovery = sources.every((s) => s.sourceType === 'discovery');

  if (allDiscovery) {
    return 'not_found';
  }

  if (candidateStatus === 'verified' && !hasPrimary) {
    return 'reported';
  }

  return candidateStatus;
}

/**
 * Verifies a FactValue according to Rules 1, 2, 3, and 4.
 */
export function verifyFactValue<T>(
  fact: FactValue<T>,
  knownSourceMap: Map<string, Source>,
  options?: {
    isRumored?: boolean;
    numericCheck?: {
      targetNumber: number;
      unit?: 'units' | 'thousands' | 'millions' | 'billions';
      isPercentage?: boolean;
      isMultiple?: boolean;
    };
  }
): FactValue<T> {
  const knownIds = new Set(knownSourceMap.keys());
  const validSourceIds = filterKnownSourceIds(fact.sourceIds, knownIds);

  // Rule 2: If no sources remain, downgrade to not_found
  if (validSourceIds.length === 0 && fact.valueStatus !== 'not_publicly_disclosed') {
    return {
      ...fact,
      value: undefined,
      display: undefined,
      valueStatus: 'not_found',
      sourceIds: [],
      note: 'Not available from reviewed sources',
    };
  }

  // Rule 4: Apply status ceiling
  let effectiveStatus = computeStatusCeiling(
    fact.valueStatus,
    validSourceIds,
    knownSourceMap,
    options?.isRumored
  );

  // Rule 3: Number matching
  if (
    options?.numericCheck &&
    (effectiveStatus === 'verified' || effectiveStatus === 'reported' || effectiveStatus === 'estimate')
  ) {
    const sources = validSourceIds.map((id) => knownSourceMap.get(id)).filter(Boolean) as Source[];
    const textCorpus = sources.map((s) => `${s.title} ${s.excerpt || ''}`).join(' ');

    const matched = numberAppearsInText(textCorpus, options.numericCheck.targetNumber, {
      unit: options.numericCheck.unit,
      isPercentage: options.numericCheck.isPercentage,
      isMultiple: options.numericCheck.isMultiple,
    });

    if (!matched) {
      return {
        ...fact,
        value: undefined,
        display: undefined,
        valueStatus: 'not_found',
        sourceIds: validSourceIds,
        note: 'Value proposed by model could not be matched to source text.',
      };
    }
  }

  return {
    ...fact,
    valueStatus: effectiveStatus,
    sourceIds: validSourceIds,
  };
}

/**
 * Rule 5: Detects conflicting values differing by > 1% on the same metric and value type.
 */
export function detectConflicts<T extends number>(
  values: { value: T; display: string; sourceIds: string[]; valueType?: string }[]
): {
  isConflict: boolean;
  base?: { value: T; display: string; sourceIds: string[] };
  alternatives?: { value: T; display: string; sourceIds: string[]; note?: string }[];
} {
  if (values.length <= 1) {
    return { isConflict: false, base: values[0] };
  }

  const base = values[0];
  const alternatives: { value: T; display: string; sourceIds: string[]; note?: string }[] = [];
  let isConflict = false;

  for (let i = 1; i < values.length; i++) {
    const current = values[i];
    // Check if value types are identical (different value types e.g. equity vs EV are not conflicts)
    if (base.valueType && current.valueType && base.valueType !== current.valueType) {
      continue;
    }

    const diff = Math.abs(current.value - base.value) / Math.max(Math.abs(base.value), 0.0001);
    if (diff > 0.01) {
      isConflict = true;
      alternatives.push({
        value: current.value,
        display: current.display,
        sourceIds: current.sourceIds,
        note: `Differs by ${(diff * 100).toFixed(1)}% from primary estimate`,
      });
    }
  }

  return { isConflict, base, alternatives: isConflict ? alternatives : undefined };
}

/**
 * Rule 6: Announcement date validation within window relative to server today.
 */
export function isDateWithinWindow(
  dateIso: string,
  window: '30d' | '90d' | '12m' | 'custom',
  today: Date = new Date(),
  customRange?: { start?: string; end?: string }
): boolean {
  const d = new Date(dateIso).getTime();
  if (isNaN(d)) return false;

  const todayTime = today.getTime();
  if (d > todayTime) return false; // In future

  if (window === '30d') {
    const minTime = todayTime - 30 * 24 * 60 * 60 * 1000;
    return d >= minTime;
  }
  if (window === '90d') {
    const minTime = todayTime - 90 * 24 * 60 * 60 * 1000;
    return d >= minTime;
  }
  if (window === '12m') {
    const minTime = todayTime - 365 * 24 * 60 * 60 * 1000;
    return d >= minTime;
  }
  if (window === 'custom' && customRange) {
    const start = customRange.start ? new Date(customRange.start).getTime() : 0;
    const end = customRange.end ? new Date(customRange.end).getTime() : todayTime;
    return d >= start && d <= end;
  }

  return true;
}

/**
 * Rule 7: Verifies Analysis claims: must have reasoning and reference >= 1 supported fact.
 */
export function verifyClaim(
  claim: Claim,
  knownSourceMap: Map<string, Source>,
  supportedFactClaimIds: Set<string>
): { valid: boolean; verifiedClaim?: Claim; topicForOpenQuestion?: string } {
  const validSourceIds = filterKnownSourceIds(claim.sourceIds, new Set(knownSourceMap.keys()));

  if (claim.claimType === 'fact') {
    if (validSourceIds.length === 0) {
      return {
        valid: false,
        topicForOpenQuestion: `Unverified claim without valid sources: "${claim.text}"`,
      };
    }
    return {
      valid: true,
      verifiedClaim: { ...claim, sourceIds: validSourceIds },
    };
  }

  if (claim.claimType === 'analysis') {
    if (!claim.reasoning || claim.reasoning.trim().length === 0) {
      return {
        valid: false,
        topicForOpenQuestion: `Analysis claim without reasoning: "${claim.text}"`,
      };
    }
    // Must reference supported facts or sources
    if (validSourceIds.length === 0 && !claim.sourceIds.some((id) => supportedFactClaimIds.has(id))) {
      return {
        valid: false,
        topicForOpenQuestion: `Analysis claim without supported fact references: "${claim.text}"`,
      };
    }
    return {
      valid: true,
      verifiedClaim: { ...claim, sourceIds: validSourceIds },
    };
  }

  return { valid: false };
}
