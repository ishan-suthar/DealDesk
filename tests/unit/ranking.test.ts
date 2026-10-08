import { describe, it, expect } from 'vitest';
import { rankDeal } from '@/server/services/ranking';
import { generateDemoFixtures } from '@/fixtures/demoDeals';

describe('ranking service', () => {
  const baseDate = new Date('2026-04-15T00:00:00Z');
  const { deals, sources } = generateDemoFixtures(baseDate);

  it('ranks deal with exact subsector match higher than general sector', () => {
    const deal1 = deals[0]; // Maple Crest (Food & Beverage)
    const deal3 = deals[2]; // Tallgrass Pet (Pet)

    const rankExact = rankDeal({
      deal: deal1,
      sources,
      selectedSector: 'Consumer & Retail',
      selectedSubsectors: ['Food & Beverage'],
      windowDays: 90,
      today: baseDate,
    });

    const rankAdjacent = rankDeal({
      deal: deal3,
      sources,
      selectedSector: 'Consumer & Retail',
      selectedSubsectors: ['Food & Beverage'],
      windowDays: 90,
      today: baseDate,
    });

    expect(rankExact.score).toBeGreaterThan(rankAdjacent.score);
    expect(rankExact.features.sectorRelevance).toBe(1.0);
    expect(rankAdjacent.features.sectorRelevance).toBe(0.5);
  });

  it('generates top 2-3 reasons based on features', () => {
    const deal1 = deals[0];
    const ranked = rankDeal({
      deal: deal1,
      sources,
      selectedSector: 'Consumer & Retail',
      selectedSubsectors: ['Food & Beverage'],
      windowDays: 90,
      today: baseDate,
    });

    expect(ranked.reasons.length).toBeGreaterThanOrEqual(2);
    expect(ranked.reasons.length).toBeLessThanOrEqual(3);
    expect(ranked.reasons).toContain('Primary filing or press release verified');
  });

  it('weights recency linearly from window start to today', () => {
    const dealRecent = deals[0]; // 14 days ago
    const dealOlder = deals[9]; // 150 days ago

    const rankRecent = rankDeal({
      deal: dealRecent,
      sources,
      selectedSector: 'Consumer & Retail',
      selectedSubsectors: [],
      windowDays: 180,
      today: baseDate,
    });

    const rankOlder = rankDeal({
      deal: dealOlder,
      sources,
      selectedSector: 'Consumer & Retail',
      selectedSubsectors: [],
      windowDays: 180,
      today: baseDate,
    });

    expect(rankRecent.features.recency).toBeGreaterThan(rankOlder.features.recency);
  });
});
