import { describe, it, expect } from 'vitest';
import {
  computeMultiple,
  computePremium,
  deriveWeakestStatus,
} from '@/server/services/calculations';

describe('calculations service', () => {
  it('computes EV/EBITDA multiple and caps status at reported', () => {
    const res = computeMultiple(
      { label: 'EV', value: 4200, currency: 'USD', status: 'verified', sourceIds: ['S1'] },
      { label: 'EBITDA', value: 290, currency: 'USD', status: 'verified', sourceIds: ['S2'] },
      'EV / EBITDA'
    );

    expect(res.value).toBe(14.5);
    expect(res.display).toBe('14.5x');
    expect(res.valueStatus).toBe('reported'); // Rule §7: calculated multiple never exceeds reported
    expect(res.sourceIds).toEqual(['S1', 'S2']);
    expect(res.calc?.formula).toBe('EV (4200) / EBITDA (290)');
  });

  it('rejects multiple calculation with mismatched currencies', () => {
    const res = computeMultiple(
      { label: 'EV', value: 4200, currency: 'USD', status: 'verified', sourceIds: ['S1'] },
      { label: 'EBITDA', value: 290, currency: 'EUR', status: 'verified', sourceIds: ['S2'] },
      'EV / EBITDA'
    );

    expect(res.valueStatus).toBe('not_found');
    expect(res.note).toContain('Incompatible currencies');
  });

  it('computes premium percentage correctly', () => {
    const res = computePremium(
      { label: 'Offer Price', value: 34.0, status: 'verified', sourceIds: ['S1'] },
      { label: 'Unaffected Price', value: 25.75, status: 'reported', sourceIds: ['S2'] },
      '2026-03-20'
    );

    expect(res.value).toBe(32.0);
    expect(res.display).toBe('32%');
    expect(res.valueStatus).toBe('reported');
    expect(res.sourceIds).toEqual(['S1', 'S2']);
  });

  it('weakest status derivation handles estimate and conflicting', () => {
    expect(deriveWeakestStatus(['verified', 'estimate'])).toBe('estimate');
    expect(deriveWeakestStatus(['verified', 'conflicting'])).toBe('conflicting');
    expect(deriveWeakestStatus(['verified', 'not_found'])).toBe('not_found');
  });
});
