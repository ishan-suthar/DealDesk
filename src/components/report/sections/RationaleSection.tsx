'use client';

import React from 'react';
import type { ReportSection, Claim } from '@/domain/types';
import { FactValue } from '@/components/facts/FactValue';
import { CitationBadgeList } from '@/components/facts/CitationBadge';
import { AnalysisBadge } from '@/components/facts/AnalysisBadge';
import { BlockActionMenu } from '../BlockActionMenu';
import { AlertCircle } from 'lucide-react';

interface SectionProps {
  section: ReportSection;
  reportVersionId: string;
  onSaveToNotebook?: (data: any) => void;
}

export function RationaleSection({ section, reportVersionId, onSaveToNotebook }: SectionProps) {
  const fields = section.fields as Record<string, any>;

  return (
    <section className="space-y-6">
      <div className="border-b border-slate-200 pb-2">
        <h2 className="text-base font-bold text-slate-900">4. Rationale and Judgment</h2>
        <p className="text-xs text-slate-500 mt-0.5">Strategic logic, synergies, risks, and price assessment</p>
      </div>

      <div className="space-y-4">
        {/* Acquirer Rationale */}
        {fields.acquirerRationale && (
          <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Acquirer Rationale
            </h3>
            {Array.isArray(fields.acquirerRationale) ? (
              fields.acquirerRationale.map((c: Claim) => (
                <div key={c.id} className="group relative flex items-start justify-between gap-3 text-sm">
                  <div>
                    <span className="font-medium text-slate-900">{c.text}</span>
                    <CitationBadgeList sourceIds={c.sourceIds} />
                  </div>
                  <BlockActionMenu
                    blockId={`rationale.acquirerRationale.${c.id}`}
                    sectionKey="rationale"
                    content={c.text}
                    sourceIds={c.sourceIds}
                    reportVersionId={reportVersionId}
                    onSaveToNotebook={onSaveToNotebook}
                  />
                </div>
              ))
            ) : null}
          </div>
        )}

        {/* Target Rationale */}
        {fields.targetRationale && (
          <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Target Rationale
            </h3>
            {Array.isArray(fields.targetRationale) ? (
              fields.targetRationale.map((c: Claim) => (
                <div key={c.id} className="group relative flex items-start justify-between gap-3 text-sm">
                  <div>
                    <span className="font-medium text-slate-900">{c.text}</span>
                    <CitationBadgeList sourceIds={c.sourceIds} />
                  </div>
                  <BlockActionMenu
                    blockId={`rationale.targetRationale.${c.id}`}
                    sectionKey="rationale"
                    content={c.text}
                    sourceIds={c.sourceIds}
                    reportVersionId={reportVersionId}
                    onSaveToNotebook={onSaveToNotebook}
                  />
                </div>
              ))
            ) : null}
          </div>
        )}

        {/* Synergies */}
        {fields.synergies && (
          <div className="group relative p-4 bg-white rounded-lg border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Synergies (Revenue / Cost)
              </span>
              <BlockActionMenu
                blockId="rationale.synergies.value"
                sectionKey="rationale"
                content={fields.synergies.display || String(fields.synergies.value || '')}
                sourceIds={fields.synergies.sourceIds}
                reportVersionId={reportVersionId}
                onSaveToNotebook={onSaveToNotebook}
              />
            </div>
            <FactValue fact={fields.synergies} />
          </div>
        )}

        {/* Risks */}
        {fields.risks && Array.isArray(fields.risks) && (
          <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Key Risks</h3>
              <AnalysisBadge />
            </div>
            <div className="space-y-2 text-sm">
              {fields.risks.map((c: Claim) => (
                <div
                  key={c.id}
                  className="group relative p-2.5 rounded bg-rose-50/30 border border-rose-100 flex items-start justify-between gap-3"
                >
                  <div>
                    <span className="font-medium text-slate-900">{c.text}</span>
                    <CitationBadgeList sourceIds={c.sourceIds} />
                    {c.reasoning && (
                      <p className="text-xs text-slate-500 mt-1 italic">{c.reasoning}</p>
                    )}
                  </div>
                  <BlockActionMenu
                    blockId={`rationale.risks.${c.id}`}
                    sectionKey="rationale"
                    content={c.text}
                    sourceIds={c.sourceIds}
                    reportVersionId={reportVersionId}
                    onSaveToNotebook={onSaveToNotebook}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price Reasonableness Box */}
        {fields.priceReasonableness && (
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                Is the Price Reasonable?
              </h3>
              <AnalysisBadge />
            </div>

            {Array.isArray(fields.priceReasonableness) ? (
              fields.priceReasonableness.map((c: Claim) => (
                <div key={c.id} className="group relative flex items-start justify-between gap-3 text-sm">
                  <div className="text-indigo-950 font-medium leading-relaxed">
                    {c.text}
                    <CitationBadgeList sourceIds={c.sourceIds} />
                  </div>
                  <BlockActionMenu
                    blockId={`rationale.priceReasonableness.${c.id}`}
                    sectionKey="rationale"
                    content={c.text}
                    sourceIds={c.sourceIds}
                    reportVersionId={reportVersionId}
                    onSaveToNotebook={onSaveToNotebook}
                  />
                </div>
              ))
            ) : null}

            {/* Prominent Limitations Box */}
            <div className="p-3 bg-white rounded-lg border border-indigo-200 text-xs text-slate-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Analytical Limitations</strong>
                <span>
                  No discounted cash flow (DCF) is modeled. Assessments reflect reported transaction comps
                  and peer multiples cited in primary proxy filings or reputable financial disclosures.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
