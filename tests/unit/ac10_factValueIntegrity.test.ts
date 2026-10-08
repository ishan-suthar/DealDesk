import { describe, it, expect } from 'vitest';
import { verifyFactValue, filterKnownSourceIds } from '@/server/services/verification';
import { TEMPLATE_SECTIONS, TEMPLATE_DEFINITIONS } from '@/domain/template';
import type { FactValue, Source } from '@/domain/types';

describe('AC10: Fact Value Integrity and Server-Side Verification', () => {
  it('downgrades fact citing unknown source ID to not_found', () => {
    const knownSources = new Map<string, Source>([
      ['S1', { id: 'S1', origin: 'demo', jobId: 'j1', url: 'https://example.com/demo/1', publisher: 'PR', title: 'T1', accessedAt: 'now', sourceType: 'primary', retrievedVia: 'fixture' }],
    ]);

    const factWithUnknownSource: FactValue<string> = {
      value: 'Fabricated revenue growth of 45%',
      display: '45% revenue growth',
      valueStatus: 'verified',
      sourceIds: ['S999_UNKNOWN'],
    };

    const verified = verifyFactValue(factWithUnknownSource, knownSources);
    expect(verified.valueStatus).toBe('not_found');
    expect(verified.sourceIds).toHaveLength(0);
    expect(verified.value).toBeUndefined();
  });

  it('drops unknown source IDs while keeping known valid source IDs', () => {
    const knownSourceIds = new Set(['S1', 'S2']);
    const modelCitedIds = ['S1', 'S88_FAKE', 'S2', 'S99_HALLUCINATED'];

    const filtered = filterKnownSourceIds(modelCitedIds, knownSourceIds);
    expect(filtered).toEqual(['S1', 'S2']);
  });

  it('downgrades numeric fact when number does not appear in cited source text', () => {
    const knownSources = new Map<string, Source>([
      ['S1', {
        id: 'S1',
        origin: 'demo',
        jobId: 'j1',
        url: 'https://example.com/demo/1',
        publisher: 'PR',
        title: 'Harborline announcement',
        excerpt: 'Deal announced with cash terms not stated.',
        accessedAt: 'now',
        sourceType: 'primary',
        retrievedVia: 'fixture',
      }],
    ]);

    const numericFact: FactValue<number> = {
      value: 18.5,
      display: '18.5x EBITDA',
      valueStatus: 'verified',
      sourceIds: ['S1'],
    };

    const verified = verifyFactValue(numericFact, knownSources, {
      numericCheck: { targetNumber: 18.5, isMultiple: true },
    });

    expect(verified.valueStatus).toBe('not_found');
    expect(verified.note).toContain('could not be matched to source text');
  });

  it('TEMPLATE_MAPPING governed order matches template.ts definition', () => {
    expect(TEMPLATE_SECTIONS).toEqual([
      'snapshot',
      'companies',
      'mechanics',
      'rationale',
      'sources',
    ]);

    expect(TEMPLATE_DEFINITIONS.map((d) => d.key)).toEqual([
      'snapshot',
      'companies',
      'mechanics',
      'rationale',
      'sources',
    ]);
  });
});
