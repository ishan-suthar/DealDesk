import { describe, it, expect } from 'vitest';
import {
  numberAppearsInText,
  filterKnownSourceIds,
  computeStatusCeiling,
  verifyFactValue,
  detectConflicts,
  isDateWithinWindow,
  verifyClaim,
} from '@/server/services/verification';
import type { Source, FactValue, Claim } from '@/domain/types';

describe('verification service', () => {
  describe('numberAppearsInText', () => {
    it('matches $4.2 billion in varying financial expressions', () => {
      expect(numberAppearsInText('Transaction value is $4.2 billion in cash', 4.2, { unit: 'billions' })).toBe(true);
      expect(numberAppearsInText('Acquisition valued at $4.2bn enterprise value', 4.2, { unit: 'billions' })).toBe(true);
      expect(numberAppearsInText('Valuation reached 4,200 million USD', 4.2, { unit: 'billions' })).toBe(true);
      expect(numberAppearsInText('Deal size is US$4.2B', 4.2, { unit: 'billions' })).toBe(true);
      expect(numberAppearsInText('Valued at 4200m total consideration', 4.2, { unit: 'billions' })).toBe(true);
    });

    it('matches millions and foreign currency notation like €850m', () => {
      expect(numberAppearsInText('Enterprise value is €850m', 850, { unit: 'millions' })).toBe(true);
      expect(numberAppearsInText('Purchase price of $650m in cash', 650, { unit: 'millions' })).toBe(true);
      expect(numberAppearsInText('Purchase price of $650 million', 650, { unit: 'millions' })).toBe(true);
    });

    it('matches valuation multiples like 14.5x', () => {
      expect(numberAppearsInText('Representing a 14.5x trailing EBITDA multiple', 14.5, { isMultiple: true })).toBe(true);
      expect(numberAppearsInText('Priced at 14.5 x EBITDA', 14.5, { isMultiple: true })).toBe(true);
      expect(numberAppearsInText('Multiple is 12.0x EBITDA', 14.5, { isMultiple: true })).toBe(false);
    });

    it('matches percentages like 28.5%', () => {
      expect(numberAppearsInText('A 28.5% premium to 30-day VWAP', 28.5, { isPercentage: true })).toBe(true);
      expect(numberAppearsInText('A 28.5 percent premium', 28.5, { isPercentage: true })).toBe(true);
      expect(numberAppearsInText('A 35% premium', 28.5, { isPercentage: true })).toBe(false);
    });

    it('returns false when target number is absent', () => {
      expect(numberAppearsInText('Deal terms were not disclosed by parties', 4.2, { unit: 'billions' })).toBe(false);
    });
  });

  describe('Rule 1 & Rule 2: Provenance and Fact Support', () => {
    it('Rule 1: filters out unknown source IDs', () => {
      const known = new Set(['S1', 'S2']);
      const cited = ['S1', 'S999', 'S2', 'S1000'];
      expect(filterKnownSourceIds(cited, known)).toEqual(['S1', 'S2']);
    });

    it('Rule 2 & AC10: downgrades FactValue to not_found if all sources are unknown', () => {
      const sourceMap = new Map<string, Source>([
        ['S1', { id: 'S1', origin: 'demo', jobId: 'j1', url: 'https://example.com/demo/1', publisher: 'PR', title: 'T1', accessedAt: 'now', sourceType: 'primary', retrievedVia: 'fixture' }],
      ]);
      const fact: FactValue<string> = {
        value: 'Some claim',
        display: 'Some claim',
        valueStatus: 'verified',
        sourceIds: ['S_UNKNOWN_99'],
      };

      const verified = verifyFactValue(fact, sourceMap);
      expect(verified.valueStatus).toBe('not_found');
      expect(verified.sourceIds).toHaveLength(0);
      expect(verified.value).toBeUndefined();
    });
  });

  describe('Rule 3: Number Matching in Sources', () => {
    it('downgrades numeric fact to not_found if number does not appear in cited source text', () => {
      const sourceMap = new Map<string, Source>([
        ['S1', {
          id: 'S1',
          origin: 'demo',
          jobId: 'j1',
          url: 'https://example.com/demo/1',
          publisher: 'Newswire',
          title: 'Company announced merger',
          excerpt: 'Terms were announced yesterday for undisclosed cash amount.',
          accessedAt: 'now',
          sourceType: 'primary',
          retrievedVia: 'fixture',
        }],
      ]);

      const fact: FactValue<number> = {
        value: 4.2,
        display: '$4.2bn enterprise value',
        valueStatus: 'verified',
        sourceIds: ['S1'],
      };

      const result = verifyFactValue(fact, sourceMap, {
        numericCheck: { targetNumber: 4.2, unit: 'billions' },
      });

      expect(result.valueStatus).toBe('not_found');
      expect(result.note).toContain('Value proposed by model could not be matched to source text');
    });

    it('preserves status when number is verified in cited source text', () => {
      const sourceMap = new Map<string, Source>([
        ['S1', {
          id: 'S1',
          origin: 'demo',
          jobId: 'j1',
          url: 'https://example.com/demo/1',
          publisher: 'Newswire',
          title: 'Definitive merger agreement',
          excerpt: 'Harborline acquires Maple Crest for $4.2bn enterprise value in cash.',
          accessedAt: 'now',
          sourceType: 'primary',
          retrievedVia: 'fixture',
        }],
      ]);

      const fact: FactValue<number> = {
        value: 4.2,
        display: '$4.2bn enterprise value',
        valueStatus: 'verified',
        sourceIds: ['S1'],
      };

      const result = verifyFactValue(fact, sourceMap, {
        numericCheck: { targetNumber: 4.2, unit: 'billions' },
      });

      expect(result.valueStatus).toBe('verified');
      expect(result.value).toBe(4.2);
    });
  });

  describe('Rule 4: Status Ceiling', () => {
    it('downgrades verified to reported if only secondary sources cite it', () => {
      const sourceMap = new Map<string, Source>([
        ['S2', { id: 'S2', origin: 'demo', jobId: 'j1', url: 'https://example.com/demo/2', publisher: 'FT', title: 'T2', accessedAt: 'now', sourceType: 'strong_secondary', retrievedVia: 'fixture' }],
      ]);

      const status = computeStatusCeiling('verified', ['S2'], sourceMap, false);
      expect(status).toBe('reported');
    });

    it('caps rumored deal facts at reported even with primary sources', () => {
      const sourceMap = new Map<string, Source>([
        ['S1', { id: 'S1', origin: 'demo', jobId: 'j1', url: 'https://example.com/demo/1', publisher: 'SEC', title: 'T1', accessedAt: 'now', sourceType: 'primary', retrievedVia: 'fixture' }],
      ]);

      const status = computeStatusCeiling('verified', ['S1'], sourceMap, true);
      expect(status).toBe('reported');
    });

    it('downgrades to not_found if only discovery-type sources are cited', () => {
      const sourceMap = new Map<string, Source>([
        ['S3', { id: 'S3', origin: 'demo', jobId: 'j1', url: 'https://example.com/demo/3', publisher: 'Blog', title: 'T3', accessedAt: 'now', sourceType: 'discovery', retrievedVia: 'fixture' }],
      ]);

      const status = computeStatusCeiling('reported', ['S3'], sourceMap, false);
      expect(status).toBe('not_found');
    });
  });

  describe('Rule 5: Conflicts', () => {
    it('detects conflicting values differing by >1% on the same value type', () => {
      const values = [
        { value: 1.25, display: '$1.25bn EV', sourceIds: ['S1'], valueType: 'enterprise_value' },
        { value: 1.32, display: '$1.32bn EV', sourceIds: ['S2'], valueType: 'enterprise_value' },
      ];
      const res = detectConflicts(values);
      expect(res.isConflict).toBe(true);
      expect(res.alternatives).toHaveLength(1);
    });

    it('does not treat different value types as conflict (e.g. equity value vs EV)', () => {
      const values = [
        { value: 1.25, display: '$1.25bn EV', sourceIds: ['S1'], valueType: 'enterprise_value' },
        { value: 1.10, display: '$1.10bn Equity Value', sourceIds: ['S2'], valueType: 'equity_value' },
      ];
      const res = detectConflicts(values);
      expect(res.isConflict).toBe(false);
    });
  });

  describe('Rule 6: Date Window Validation', () => {
    const today = new Date('2026-04-15T00:00:00Z');

    it('accepts date within 90 days', () => {
      expect(isDateWithinWindow('2026-03-01', '90d', today)).toBe(true);
    });

    it('rejects date older than 90 days for 90d window', () => {
      expect(isDateWithinWindow('2025-11-01', '90d', today)).toBe(false);
    });

    it('accepts older date for 12m window', () => {
      expect(isDateWithinWindow('2025-11-01', '12m', today)).toBe(true);
    });
  });

  describe('Rule 7: Analysis Claims', () => {
    const sourceMap = new Map<string, Source>([
      ['S1', { id: 'S1', origin: 'demo', jobId: 'j1', url: 'https://example.com/demo/1', publisher: 'SEC', title: 'T1', accessedAt: 'now', sourceType: 'primary', retrievedVia: 'fixture' }],
    ]);

    it('rejects analysis claim without reasoning', () => {
      const claim: Claim = {
        id: 'c1',
        text: 'The deal is strategically sound',
        claimType: 'analysis',
        sourceIds: ['S1'],
        confidence: 'high',
      };
      const res = verifyClaim(claim, sourceMap, new Set(['fact-1']));
      expect(res.valid).toBe(false);
      expect(res.topicForOpenQuestion).toContain('without reasoning');
    });

    it('accepts analysis claim with reasoning and supported references', () => {
      const claim: Claim = {
        id: 'c2',
        text: 'The multiple represents premium positioning',
        claimType: 'analysis',
        reasoning: 'Synthesized against 14.5x peer averages',
        sourceIds: ['S1'],
        confidence: 'high',
      };
      const res = verifyClaim(claim, sourceMap, new Set());
      expect(res.valid).toBe(true);
      expect(res.verifiedClaim?.text).toBe(claim.text);
    });
  });
});
