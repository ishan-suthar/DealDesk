import type { FactValue, ValueStatus } from '@/domain/types';

export interface NumericInput {
  label: string;
  value: number;
  currency?: string;
  period?: string;
  status: ValueStatus;
  sourceIds: string[];
}

/**
 * Derives the weakest status from a set of inputs. The result is never better than 'reported'.
 */
export function deriveWeakestStatus(statuses: ValueStatus[]): ValueStatus {
  if (statuses.includes('not_found') || statuses.includes('not_publicly_disclosed')) {
    return 'not_found';
  }
  if (statuses.includes('conflicting')) {
    return 'conflicting';
  }
  if (statuses.includes('estimate')) {
    return 'estimate';
  }
  // Even if both inputs are 'verified', calculated multiples cannot exceed 'reported' per rule §7
  return 'reported';
}

/**
 * Computes valuation multiples (EV/EBITDA, EV/Revenue, etc.)
 */
export function computeMultiple(
  numerator: NumericInput,
  denominator: NumericInput,
  label: string
): FactValue<number> {
  // Compatibility checks
  if (numerator.currency && denominator.currency && numerator.currency !== denominator.currency) {
    return {
      valueStatus: 'not_found',
      sourceIds: [],
      note: 'Incompatible currencies: cannot compute multiple across different currencies without FX source.',
    };
  }

  if (denominator.value <= 0) {
    return {
      valueStatus: 'not_found',
      sourceIds: [],
      note: 'Cannot compute multiple with zero or negative denominator.',
    };
  }

  const multipleVal = Math.round((numerator.value / denominator.value) * 10) / 10;
  const combinedSourceIds = Array.from(new Set([...numerator.sourceIds, ...denominator.sourceIds]));
  const status = deriveWeakestStatus([numerator.status, denominator.status]);

  return {
    value: multipleVal,
    display: `${multipleVal}x`,
    valueStatus: status,
    sourceIds: combinedSourceIds,
    calc: {
      formula: `${numerator.label} (${numerator.value}) / ${denominator.label} (${denominator.value})`,
      inputs: [
        { label: numerator.label, value: numerator.value, sourceIds: numerator.sourceIds, period: numerator.period },
        { label: denominator.label, value: denominator.value, sourceIds: denominator.sourceIds, period: denominator.period },
      ],
    },
  };
}

/**
 * Computes premium percentage from offer price and unaffected share price.
 */
export function computePremium(
  offerPrice: NumericInput,
  unaffectedPrice: NumericInput,
  asOfDate?: string
): FactValue<number> {
  if (unaffectedPrice.value <= 0) {
    return {
      valueStatus: 'not_found',
      sourceIds: [],
      note: 'Unaffected price must be positive to calculate premium.',
    };
  }

  const premiumPercent = Math.round(((offerPrice.value - unaffectedPrice.value) / unaffectedPrice.value) * 1000) / 10;
  const combinedSourceIds = Array.from(new Set([...offerPrice.sourceIds, ...unaffectedPrice.sourceIds]));
  const status = deriveWeakestStatus([offerPrice.status, unaffectedPrice.status]);

  return {
    value: premiumPercent,
    display: `${premiumPercent}%`,
    valueStatus: status,
    sourceIds: combinedSourceIds,
    asOf: asOfDate,
    calc: {
      formula: `(${offerPrice.label} - ${unaffectedPrice.label}) / ${unaffectedPrice.label}`,
      inputs: [
        { label: offerPrice.label, value: offerPrice.value, sourceIds: offerPrice.sourceIds },
        { label: unaffectedPrice.label, value: unaffectedPrice.value, sourceIds: unaffectedPrice.sourceIds },
      ],
    },
  };
}
