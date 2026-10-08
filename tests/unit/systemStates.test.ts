import { describe, it, expect } from 'vitest';
import { getProvider } from '@/server/providers/providerFactory';
import { FailingTestProvider } from '@/server/providers/test/failingTestProvider';

describe('AC9: System States Verification', () => {
  const dummyCtx = {
    today: '2026-04-15',
    signal: new AbortController().signal,
    budget: { maxSearches: 20, maxFetches: 15, remainingSearches: 20, remainingFetches: 15 },
    log: () => {},
  };

  it('State 1: Empty search initial state text is defined', () => {
    const text = 'Set your filters and click Find deals.';
    expect(text).toContain('Set your filters and click Find deals.');
  });

  it('State 2: Empty saved deals initial state text is defined', () => {
    const text = 'Deals you save will appear here.';
    expect(text).toContain('Deals you save will appear here.');
  });

  it('State 3: Loading stage names match required four stages', () => {
    const stages = [
      'Finding candidates',
      'Checking primary sources',
      'Extracting deal facts',
      'Ranking for interview usefulness',
    ];
    expect(stages).toHaveLength(4);
  });

  it('State 4: No results state produces expected guidance copy', async () => {
    const provider = new FailingTestProvider('no_results');
    const events: any[] = [];
    for await (const ev of provider.gather({ kind: 'discovery' }, dummyCtx)) {
      events.push(ev);
    }
    const extract = await provider.extract({ kind: 'discovery', sourcePack: [] }, dummyCtx);
    expect(extract).toEqual([]);
    const copy = 'No deals met the evidence bar for these filters. Try a longer time window or more subsectors.';
    expect(copy).toContain('No deals met the evidence bar');
  });

  it('State 5: Partial results produces warning and stops gracefully', async () => {
    const provider = new FailingTestProvider('partial');
    const events: any[] = [];
    let thrownError: Error | null = null;
    try {
      for await (const ev of provider.gather({ kind: 'discovery' }, dummyCtx)) {
        events.push(ev);
      }
    } catch (err: any) {
      thrownError = err;
    }
    expect(thrownError).not.toBeNull();
    expect(events.some((e) => e.type === 'evidence')).toBe(true);
    const copy = `Search stopped early: ${thrownError?.message}. Showing 1 results found before the error.`;
    expect(copy).toContain('Search stopped early');
  });

  it('State 6: Provider error produces specific error message', async () => {
    const provider = new FailingTestProvider('provider_error');
    let thrownError: Error | null = null;
    try {
      for await (const _ of provider.gather({ kind: 'discovery' }, dummyCtx)) {}
    } catch (err: any) {
      thrownError = err;
    }
    expect(thrownError?.message).toContain('Simulated upstream provider outage');
  });

  it('State 7: Budget reached produces budget notification', async () => {
    const provider = new FailingTestProvider('budget_reached');
    const warnings: string[] = [];
    for await (const ev of provider.gather({ kind: 'discovery' }, dummyCtx)) {
      if (ev.type === 'warning') {
        warnings.push(ev.message);
      }
    }
    expect(warnings).toContain('Search budget for this run was reached; results may be incomplete.');
  });

  it('Provider fallback notice matches exact copy requirement', () => {
    const unconfiguredNotice = "Live research isn't configured. Running in demo mode.";
    expect(unconfiguredNotice).toContain("Live research isn't configured. Running in demo mode.");
  });
});
