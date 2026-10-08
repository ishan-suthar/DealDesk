'use client';

import React from 'react';
import type { FactValue as FactValueType } from '@/domain/types';
import { VALUE_STATUS_LABELS, VALUE_STATUS_DESCRIPTIONS } from '@/domain/enums';
import { CitationBadgeList } from './CitationBadge';
import { HelpCircle, AlertTriangle, Calculator } from 'lucide-react';

interface FactValueProps<T = unknown> {
  fact: FactValueType<T>;
  label?: string;
  className?: string;
  onSourceClick?: (id: string) => void;
  showStatusBadge?: boolean;
}

export function FactValue<T = unknown>({
  fact,
  label,
  className = '',
  onSourceClick,
  showStatusBadge = true,
}: FactValueProps<T>) {
  if (!fact || !fact.valueStatus) {
    throw new Error('FactValue requires a valueStatus property.');
  }

  const { valueStatus, display, value, sourceIds, note, alternatives, calc, asOf } = fact;

  // Status-specific badge colors
  const badgeStyles: Record<string, string> = {
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    reported: 'bg-sky-50 text-sky-700 border-sky-200',
    estimate: 'bg-amber-50 text-amber-800 border-amber-200',
    conflicting: 'bg-purple-50 text-purple-700 border-purple-200',
    not_publicly_disclosed: 'bg-slate-100 text-slate-600 border-slate-200 italic',
    not_found: 'bg-slate-100 text-slate-500 border-slate-200 italic',
  };

  const statusLabel = VALUE_STATUS_LABELS[valueStatus];
  const statusDesc = VALUE_STATUS_DESCRIPTIONS[valueStatus];

  // Handling not_publicly_disclosed and not_found
  if (valueStatus === 'not_publicly_disclosed') {
    return (
      <div className={`inline-flex items-center gap-1.5 text-sm text-slate-500 italic ${className}`}>
        <span>Not publicly disclosed</span>
        {showStatusBadge && (
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded border font-medium uppercase tracking-wider ${badgeStyles[valueStatus]}`}
            title={statusDesc}
          >
            {statusLabel}
          </span>
        )}
      </div>
    );
  }

  if (valueStatus === 'not_found') {
    return (
      <div className={`inline-flex items-center gap-1.5 text-sm text-slate-400 italic ${className}`}>
        <span>Not available from reviewed sources</span>
        {showStatusBadge && (
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded border font-medium uppercase tracking-wider ${badgeStyles[valueStatus]}`}
            title={note || statusDesc}
          >
            {statusLabel}
          </span>
        )}
      </div>
    );
  }

  const renderedText = display ?? (typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''));

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <div className="inline-flex items-center flex-wrap gap-1.5 text-sm font-medium text-slate-900">
        <span>{renderedText}</span>

        {asOf && (
          <span className="text-xs text-slate-500 font-normal">
            (as of {asOf})
          </span>
        )}

        {showStatusBadge && (
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold tracking-wide uppercase ${
              badgeStyles[valueStatus] || 'bg-slate-100 text-slate-700'
            }`}
            title={`${statusLabel}: ${statusDesc}`}
          >
            {statusLabel}
          </span>
        )}

        {calc && (
          <span
            className="inline-flex items-center text-xs text-slate-500 cursor-help"
            title={`Calculation: ${calc.formula}`}
          >
            <Calculator className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 ml-0.5" />
          </span>
        )}

        <CitationBadgeList sourceIds={sourceIds} onSourceClick={onSourceClick} />
      </div>

      {/* Conflicting alternatives view */}
      {valueStatus === 'conflicting' && alternatives && alternatives.length > 0 && (
        <div className="text-xs text-purple-900 bg-purple-50/70 p-2 rounded border border-purple-200 mt-1 space-y-1">
          <div className="font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
            <span>Conflicting reported metrics:</span>
          </div>
          {alternatives.map((alt, idx) => (
            <div key={idx} className="flex items-center gap-1 pl-4">
              <span>• {alt.display}</span>
              {alt.note && <span className="text-slate-500">({alt.note})</span>}
              <CitationBadgeList sourceIds={alt.sourceIds} onSourceClick={onSourceClick} />
            </div>
          ))}
        </div>
      )}

      {note && valueStatus !== 'conflicting' && (
        <span className="text-xs text-slate-500">{note}</span>
      )}
    </div>
  );
}
