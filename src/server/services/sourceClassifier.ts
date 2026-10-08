import type { SourceType } from '@/domain/types';

const PRIMARY_DOMAINS = [
  'sec.gov',
  'prnewswire.com',
  'businesswire.com',
  'globenewswire.com',
  'ftc.gov',
  'justice.gov',
  'gov.uk',
  'ec.europa.eu',
];

const STRONG_SECONDARY_DOMAINS = [
  'reuters.com',
  'bloomberg.com',
  'ft.com',
  'wsj.com',
  'apnews.com',
  'cnbc.com',
  'forbes.com',
];

const CONTEXTUAL_DOMAINS = [
  'fooddive.com',
  'grocerydive.com',
  'restaurantdive.com',
  'retaildive.com',
  'beautyindependent.com',
  'petbusiness.com',
  'beveragedaily.com',
  'techcrunch.com',
];

export function classifySourceDomain(url: string, explicitType?: SourceType): SourceType {
  if (explicitType) return explicitType;

  try {
    const hostname = new URL(url).hostname.toLowerCase();

    // Check demo fixture domain rule
    if (hostname === 'example.com') {
      if (url.includes('/filings/') || url.includes('/news/')) return 'primary';
      if (url.includes('/reports/')) return 'strong_secondary';
      return 'primary';
    }

    if (PRIMARY_DOMAINS.some((d) => hostname === d || hostname.endsWith('.' + d))) {
      return 'primary';
    }

    if (STRONG_SECONDARY_DOMAINS.some((d) => hostname === d || hostname.endsWith('.' + d))) {
      return 'strong_secondary';
    }

    if (CONTEXTUAL_DOMAINS.some((d) => hostname === d || hostname.endsWith('.' + d))) {
      return 'contextual';
    }

    return 'discovery';
  } catch {
    return 'discovery';
  }
}
