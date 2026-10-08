import { describe, it, expect } from 'vitest';
import { generateDemoFixtures } from '@/fixtures/demoDeals';
import { generateDemoReports } from '@/fixtures/demoReports';

describe('Demo Fixtures Sanity', () => {
  const baseDate = new Date('2026-04-15T00:00:00Z');
  const { companies, sources, deals } = generateDemoFixtures(baseDate);
  const { reports, notes } = generateDemoReports(baseDate);

  it('generates exactly 10 demo deals', () => {
    expect(deals).toHaveLength(10);
  });

  it('every deal has origin "demo"', () => {
    for (const deal of deals) {
      expect(deal.origin).toBe('demo');
    }
  });

  it('FAILS if ANY fixture URL is not under https://example.com/demo/', () => {
    expect(sources.length).toBeGreaterThan(0);
    for (const source of sources) {
      expect(source.url.startsWith('https://example.com/demo/')).toBe(true);
      expect(source.origin).toBe('demo');
    }
  });

  it('verifies demo companies are fictional only', () => {
    const REAL_CPG_GIANTS = [
      'procter & gamble',
      'pepsico',
      'coca-cola',
      'nestle',
      'unilever',
      'mondelez',
      'kraft heinz',
      'general mills',
    ];
    for (const c of companies) {
      const lower = c.name.toLowerCase();
      for (const real of REAL_CPG_GIANTS) {
        expect(lower).not.toBe(real);
      }
    }
  });

  it('fixture #1 (Maple Crest) is saved with seeded report and 3 notes', () => {
    const deal1 = deals.find((d) => d.id === 'deal-1');
    expect(deal1).toBeDefined();
    expect(deal1?.userStatus).toBe('saved');

    const report1 = reports.find((r) => r.dealId === 'deal-1');
    expect(report1).toBeDefined();
    expect(report1?.version).toBe(1);

    const deal1Notes = notes.filter((n) => n.dealId === 'deal-1');
    expect(deal1Notes).toHaveLength(3);
  });

  it('fixture #8 (Tidewell) is in review status', () => {
    const deal8 = deals.find((d) => d.id === 'deal-8');
    expect(deal8?.userStatus).toBe('review');
  });

  it('fixture #9 (Clearbrook) is in deleted status', () => {
    const deal9 = deals.find((d) => d.id === 'deal-9');
    expect(deal9?.userStatus).toBe('deleted');
  });

  it('fixture #10 (Parcelnest) is older than 90 days', () => {
    const deal10 = deals.find((d) => d.id === 'deal-10');
    expect(deal10).toBeDefined();
    const dateStr = deal10!.announcementDate.value!;
    const diffDays = Math.round(
      (baseDate.getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
    );
    expect(diffDays).toBeGreaterThan(90);
  });
});
