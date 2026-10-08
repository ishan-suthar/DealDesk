import { describe, it, expect, vi } from 'vitest';
import { AnthropicAdapter } from '@/server/providers/anthropic/anthropicAdapter';
import {
  normalizeDiscoveryPayload,
  normalizeDiscoveryCandidates,
  candidateToDeal,
} from '@/server/services/normalizer';
import { DealSchema, CandidateDealSchema, DiscoveryPayloadSchema } from '@/domain/schemas';
import {
  recordedAnthropicExtractResponse,
  recordedAnthropicSearchResponse,
} from '../fixtures/recordedResponses';
import { generateDemoFixtures } from '@/fixtures/demoDeals';
import { runDiscoveryPipeline } from '@/server/services/pipeline';
import { searchRunsRepository } from '@/server/repositories/searchRunsRepository';
import type { JobContext } from '@/server/providers/types';
import type { Source } from '@/domain/types';

function createMockContext(): JobContext {
  return {
    today: '2026-03-01',
    signal: new AbortController().signal,
    budget: {
      maxSearches: 10,
      maxFetches: 10,
      remainingSearches: 10,
      remainingFetches: 10,
    },
    log: vi.fn(),
  };
}

describe('Anthropic Discovery Regression Test: Canonical Discovery Contract', () => {
  const mockSourceS1: Source = {
    id: 'S1',
    jobId: 'job-regression-1',
    origin: 'live',
    url: 'https://example.com/demo/filings/recorded-merger-8k',
    publisher: 'SEC EDGAR',
    title: 'Recorded Buyer Form 8-K Definitive Merger Agreement',
    publishedAt: '2026-03-01',
    accessedAt: '2026-03-01T12:00:00.000Z',
    sourceType: 'primary',
    retrievedVia: 'search_result',
    excerpt: 'Recorded Buyer agreed to acquire Recorded Target for $2.5 billion in cash.',
  };

  it('Anthropic adapter returns canonical { candidates: [...] } schema consistently for discovery', async () => {
    const adapter = new AnthropicAdapter('mock-api-key');

    (adapter as any).client = {
      messages: {
        create: vi.fn().mockResolvedValue(recordedAnthropicExtractResponse),
      },
    };

    const ctx = createMockContext();
    const result = await adapter.extract(
      {
        kind: 'discovery',
        sourcePack: [mockSourceS1],
      },
      ctx
    );

    // Conforms to DiscoveryPayloadSchema
    const parsed = DiscoveryPayloadSchema.safeParse(result);
    expect(parsed.success).toBe(true);
    expect(result).toHaveProperty('candidates');
    expect(result).toHaveProperty('deals'); // backwards compatibility alias

    const payload = result as any;
    expect(Array.isArray(payload.candidates)).toBe(true);
    expect(payload.candidates).toHaveLength(1);
    expect(payload.candidates[0].headline).toBe('Recorded Buyer to acquire Recorded Target for $2.5bn');
    expect(payload.candidates[0].sourceIds).toEqual(['S1']);
  });

  it('normalizes top-level array input (backward compatibility for demo fixtures or direct arrays)', () => {
    const rawArray = [
      {
        headline: 'Acquirer A buys Target B for $500m',
        buyerName: 'Acquirer A',
        targetName: 'Target B',
        sourceIds: ['S1'],
      },
      {
        headline: 'Acquirer C buys Target D for $300m',
        buyerName: 'Acquirer C',
        targetName: 'Target D',
        sourceIds: ['S2'],
      },
    ];

    const payload = normalizeDiscoveryPayload(rawArray);
    expect(payload.candidates).toHaveLength(2);
    expect(payload.candidates[0].headline).toBe('Acquirer A buys Target B for $500m');
    expect(payload.candidates[1].headline).toBe('Acquirer C buys Target D for $300m');
  });

  it('normalizes canonical { candidates: [...] } input', () => {
    const canonicalInput = {
      candidates: [
        {
          headline: 'Tech Giant acquires AI Startup for $1.2bn',
          buyerName: 'Tech Giant',
          targetName: 'AI Startup',
          dealValue: { amount: 1.2, currency: 'USD', unit: 'billions', valueType: 'enterprise_value' },
          sourceIds: ['S1', 'S2'],
        },
      ],
    };

    const payload = normalizeDiscoveryPayload(canonicalInput);
    expect(payload.candidates).toHaveLength(1);
    expect(payload.candidates[0].headline).toBe('Tech Giant acquires AI Startup for $1.2bn');
    expect(payload.candidates[0].sourceIds).toEqual(['S1', 'S2']);
  });

  it('validates every candidate with Zod, discards invalid candidates, and retains valid ones with provenance', () => {
    const mixedInput = {
      candidates: [
        // Valid candidate 1
        {
          headline: 'Valid Deal 1: Alpha acquires Beta',
          buyerName: 'Alpha Corp',
          targetName: 'Beta Inc',
          sourceIds: ['S1'],
        },
        // Invalid candidate: missing headline
        {
          buyerName: 'No Headline Buyer',
          targetName: 'No Headline Target',
          sourceIds: ['S1'],
        },
        // Invalid candidate: empty headline
        {
          headline: '   ',
          buyerName: 'Blank Headline',
          sourceIds: ['S1'],
        },
        // Invalid candidate: not an object
        null,
        // Valid candidate 2
        {
          headline: 'Valid Deal 2: Gamma acquires Delta',
          buyerName: 'Gamma Corp',
          targetName: 'Delta Inc',
          sourceIds: ['S2'],
        },
      ],
    };

    const payload = normalizeDiscoveryPayload(mixedInput);
    // Invalid candidates discarded; 2 valid candidates retained
    expect(payload.candidates).toHaveLength(2);
    expect(payload.candidates[0].headline).toBe('Valid Deal 1: Alpha acquires Beta');
    expect(payload.candidates[0].sourceIds).toEqual(['S1']);
    expect(payload.candidates[1].headline).toBe('Valid Deal 2: Gamma acquires Delta');
    expect(payload.candidates[1].sourceIds).toEqual(['S2']);
  });

  it('returns a readable provider error when extraction response is malformed', () => {
    // 1. null response
    expect(() => normalizeDiscoveryPayload(null)).toThrow(
      'Provider extraction error: model response is malformed. Expected a list of candidate deals.'
    );

    // 2. empty or non-deals object
    expect(() => normalizeDiscoveryPayload({ error: 'Model overloaded' })).toThrow(
      'Provider extraction error: model response is malformed. Expected a list of candidate deals.'
    );

    // 3. candidates is not an array
    expect(() => normalizeDiscoveryPayload({ candidates: 'invalid_string' })).toThrow(
      'Provider extraction error: model response is malformed. Expected a list of candidate deals.'
    );

    // 4. primitive value
    expect(() => normalizeDiscoveryPayload(12345)).toThrow(
      'Provider extraction error: model response is malformed. Expected a list of candidate deals.'
    );
  });

  it('transforms CandidateDeal to full Deal, preserving source IDs and provenance', () => {
    const candidate = {
      headline: 'Recorded Buyer to acquire Recorded Target for $2.5bn',
      buyerName: 'Recorded Buyer',
      targetName: 'Recorded Target',
      dealValue: { amount: 2.5, currency: 'USD', unit: 'billions', valueType: 'enterprise_value' },
      sourceIds: ['S1'],
    };

    const deal = candidateToDeal(candidate, {
      sources: [mockSourceS1],
      today: '2026-03-01',
      runId: 'run-candidate-test',
      origin: 'live',
    });

    expect(deal).not.toBeNull();
    if (deal) {
      expect(deal.headline).toBe('Recorded Buyer to acquire Recorded Target for $2.5bn');
      expect(deal.origin).toBe('live');
      expect(deal.dealValue.sourceIds).toContain('S1');
      expect(deal.dealValue.value?.amount).toBe(2.5);
      expect(deal.announcementDate.sourceIds).toContain('S1');
      expect(deal.transactionStatusSourceIds).toContain('S1');
      expect(deal.quickPreview.sourceIds).toContain('S1');
      expect(deal.quickPreview.summary.sourceIds).toContain('S1');

      // Passes full DealSchema validation
      const parseResult = DealSchema.safeParse(deal);
      expect(parseResult.success).toBe(true);
    }
  });

  it('preserves demo-mode behavior without alteration', () => {
    const { deals: demoDeals } = generateDemoFixtures(new Date('2026-03-01'));
    expect(demoDeals).toHaveLength(10);

    const payload = normalizeDiscoveryPayload(demoDeals);
    expect(payload.candidates).toHaveLength(10);

    const normalizedDeals = normalizeDiscoveryCandidates(demoDeals, {
      origin: 'demo',
      today: '2026-03-01',
    });

    expect(normalizedDeals).toHaveLength(10);
    expect(normalizedDeals[0].id).toBe(demoDeals[0].id);
    expect(normalizedDeals[0].headline).toBe(demoDeals[0].headline);
    expect(normalizedDeals[0].origin).toBe('demo');
    expect(normalizedDeals[0].dealValue.display).toBe(demoDeals[0].dealValue.display);
  });

  it('executes full discovery pipeline end-to-end consuming payload.candidates with live provider', async () => {
    process.env.ANTHROPIC_API_KEY = 'mock-key';
    const originalProvider = process.env.RESEARCH_PROVIDER;
    process.env.RESEARCH_PROVIDER = 'anthropic';

    const mockAdapter = new AnthropicAdapter('mock-key');
    (mockAdapter as any).client = {
      messages: {
        create: vi
          .fn()
          .mockResolvedValueOnce(recordedAnthropicSearchResponse)
          .mockResolvedValueOnce(recordedAnthropicExtractResponse),
      },
    };

    const providerFactory = await import('@/server/providers/providerFactory');
    const getProviderSpy = vi.spyOn(providerFactory, 'getProvider').mockReturnValue(mockAdapter);

    try {
      const runId = `reg-run-${Date.now()}`;
      await searchRunsRepository.create({
        id: runId,
        filters: {
          sector: 'Consumer & Retail',
          subsectors: ['Food & Beverage'],
          timeWindow: '90d',
          maxDeals: 10,
          dealStatus: 'any',
          includeRumored: false,
          geography: 'US',
        },
        provider: 'anthropic',
        origin: 'live',
        jobId: `job-${runId}`,
        startedAt: new Date().toISOString(),
        resultDealIds: [],
        excluded: [],
      });

      const deals = await runDiscoveryPipeline({
        runId,
        jobId: `job-${runId}`,
        filters: {
          sector: 'Consumer & Retail',
          subsectors: ['Food & Beverage'],
          timeWindow: '90d',
          maxDeals: 10,
          dealStatus: 'any',
          includeRumored: false,
          geography: 'US',
        },
        signal: new AbortController().signal,
        onProgress: async () => {},
        todayDate: new Date('2026-03-01'),
      });

      expect(deals.length).toBeGreaterThanOrEqual(1);
      expect(deals[0].headline).toBe('Recorded Buyer to acquire Recorded Target for $2.5bn');
      expect(deals[0].origin).toBe('live');
      expect(deals[0].dealValue.sourceIds).toContain('S1');
    } finally {
      getProviderSpy.mockRestore();
      if (originalProvider) process.env.RESEARCH_PROVIDER = originalProvider;
      else delete process.env.RESEARCH_PROVIDER;
      delete process.env.ANTHROPIC_API_KEY;
    }
  });
});
