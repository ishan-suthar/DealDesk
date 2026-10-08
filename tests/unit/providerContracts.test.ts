import { describe, it, expect, vi } from 'vitest';
import { AnthropicAdapter } from '@/server/providers/anthropic/anthropicAdapter';
import { GeminiAdapter } from '@/server/providers/gemini/geminiAdapter';
import { EdgarClient } from '@/server/services/edgarClient';
import { getProvider } from '@/server/providers/providerFactory';
import {
  recordedAnthropicSearchResponse,
  recordedAnthropicExtractResponse,
  recordedGeminiSearchResponse,
  recordedGeminiExtractResponse,
  recordedEdgarSearchResponse,
} from '../fixtures/recordedResponses';
import type { JobContext } from '@/server/providers/types';

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

describe('Provider Contract Tests (M5 — Recorded Responses, Zero Network)', () => {
  it('AnthropicAdapter gather yields structured evidence from recorded tool-result blocks', async () => {
    const adapter = new AnthropicAdapter('mock-api-key');

    // Mock Anthropic SDK messages.create with recorded response
    (adapter as any).client = {
      messages: {
        create: vi.fn().mockResolvedValue(recordedAnthropicSearchResponse),
      },
    };

    const ctx = createMockContext();
    const events = [];
    for await (const event of adapter.gather({ kind: 'discovery', queryVariants: ['test query'] }, ctx)) {
      events.push(event);
    }

    expect(events.length).toBeGreaterThanOrEqual(2);
    expect(events[0]).toEqual({ type: 'stage', stage: 'Finding candidates' });

    const evidence = events.find((e) => e.type === 'evidence');
    expect(evidence).toBeDefined();
    if (evidence && evidence.type === 'evidence') {
      expect(evidence.item.url).toBe('https://example.com/demo/filings/recorded-merger-8k');
      expect(evidence.item.title).toContain('Recorded Buyer');
      expect(evidence.item.publisher).toBe('SEC EDGAR');
      expect(evidence.item.via).toBe('search_result');
    }

    expect(ctx.budget.remainingSearches).toBe(9);
  });

  it('AnthropicAdapter extract parses forced submit_result tool call into structured JSON', async () => {
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
        sourcePack: [],
      },
      ctx
    );

    expect(result).toHaveProperty('deals');
    const deals = (result as any).deals;
    expect(deals).toHaveLength(1);
    expect(deals[0].headline).toBe('Recorded Buyer to acquire Recorded Target for $2.5bn');
    expect(deals[0].buyerName).toBe('Recorded Buyer');
  });

  it('GeminiAdapter gather extracts evidence from recorded Google groundingMetadata', async () => {
    const adapter = new GeminiAdapter('mock-gemini-key');

    (adapter as any).client = {
      models: {
        generateContent: vi.fn().mockResolvedValue(recordedGeminiSearchResponse),
      },
    };

    const ctx = createMockContext();
    const events = [];
    for await (const event of adapter.gather({ kind: 'discovery' }, ctx)) {
      events.push(event);
    }

    const evidence = events.find((e) => e.type === 'evidence');
    expect(evidence).toBeDefined();
    if (evidence && evidence.type === 'evidence') {
      expect(evidence.item.url).toBe('https://example.com/demo/filings/gemini-recorded-filing');
      expect(evidence.item.title).toContain('Gemini Recorded Filing');
    }
  });

  it('GeminiAdapter extract returns parsed JSON adhering to output schema', async () => {
    const adapter = new GeminiAdapter('mock-gemini-key');

    (adapter as any).client = {
      models: {
        generateContent: vi.fn().mockResolvedValue(recordedGeminiExtractResponse),
      },
    };

    const ctx = createMockContext();
    const result = await adapter.extract(
      {
        kind: 'discovery',
        sourcePack: [],
      },
      ctx
    );

    expect(result).toHaveProperty('deals');
    const deals = (result as any).deals;
    expect(deals[0].headline).toBe('Gemini Buyer to acquire Gemini Target for $1.8bn');
  });

  it('EdgarClient searches and formats filings with rate limiting spacing and primary source status', async () => {
    const client = new EdgarClient('DealDeskTest/1.0');

    // Mock global fetch for EDGAR API
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => recordedEdgarSearchResponse,
    }) as any;

    try {
      const hits = await client.searchFilings('merger');
      expect(hits).toHaveLength(1);
      expect(hits[0].companyName).toContain('Recorded CPG Corp');
      expect(hits[0].form).toBe('8-K');

      const evidence = client.filingHitToEvidence(hits[0]);
      expect(evidence.type).toBe('evidence');
      if (evidence.type === 'evidence') {
        expect(evidence.item.via).toBe('edgar');
        expect(evidence.item.publisher).toBe('U.S. Securities and Exchange Commission (EDGAR)');
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('providerFactory falls back to demoProvider when live keys are absent', () => {
    const originalAnthropicKey = process.env.ANTHROPIC_API_KEY;
    const originalGeminiKey = process.env.GEMINI_API_KEY;

    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const anthropicProvider = getProvider('anthropic');
    expect(anthropicProvider.id).toBe('demo');

    const geminiProvider = getProvider('gemini');
    expect(geminiProvider.id).toBe('demo');

    // Restore env
    if (originalAnthropicKey) process.env.ANTHROPIC_API_KEY = originalAnthropicKey;
    if (originalGeminiKey) process.env.GEMINI_API_KEY = originalGeminiKey;
  });

  it('providerFactory returns live adapters when keys are configured', () => {
    process.env.ANTHROPIC_API_KEY = 'mock-anthropic-key';
    process.env.GEMINI_API_KEY = 'mock-gemini-key';

    const anthropicProvider = getProvider('anthropic');
    expect(anthropicProvider.id).toBe('anthropic');

    const geminiProvider = getProvider('gemini');
    expect(geminiProvider.id).toBe('gemini');

    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GEMINI_API_KEY;
  });
});
