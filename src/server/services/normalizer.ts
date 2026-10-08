import type { Source } from '@/domain/types';

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
