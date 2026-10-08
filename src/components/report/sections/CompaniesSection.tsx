'use client';

import React from 'react';
import type { ReportSection } from '@/domain/types';
import { FactValue } from '@/components/facts/FactValue';
import { BlockActionMenu } from '../BlockActionMenu';

interface SectionProps {
  section: ReportSection;
  reportVersionId: string;
  onSaveToNotebook?: (data: any) => void;
}

export function CompaniesSection({ section, reportVersionId, onSaveToNotebook }: SectionProps) {
  const fields = section.fields as Record<string, any>;
  const buyer = fields.buyer || {};
  const target = fields.target || {};

  const rows = [
    { key: 'business', label: 'Business' },
    { key: 'ceo', label: 'CEO' },
    { key: 'headquarters', label: 'Headquarters' },
    { key: 'marketCapOrEv', label: 'Market Cap / EV' },
    { key: 'revenueTtm', label: 'Revenue (TTM / FY)' },
    { key: 'ebitdaMargin', label: 'EBITDA / Margin' },
    { key: 'earnings', label: 'Earnings / EPS' },
  ];

  return (
    <section className="space-y-4">
      <div className="border-b border-slate-200 pb-2">
        <h2 className="text-base font-bold text-slate-900">2. Company Overview</h2>
        <p className="text-xs text-slate-500 mt-0.5">Side-by-side comparative company matrix</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Buyer Column */}
          <div className="p-4 space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                Buyer
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">Acquiring Entity</h3>
            </div>

            <div className="space-y-3">
              {rows.map(({ key, label }) => {
                const fact = buyer[key];
                return (
                  <div key={key} className="group relative space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">{label}</span>
                      {fact && (
                        <BlockActionMenu
                          blockId={`companies.buyer.${key}`}
                          sectionKey="companies"
                          content={fact.display || fact.value || ''}
                          sourceIds={fact.sourceIds}
                          reportVersionId={reportVersionId}
                          onSaveToNotebook={onSaveToNotebook}
                        />
                      )}
                    </div>
                    {fact ? (
                      <FactValue fact={fact} />
                    ) : (
                      <span className="text-xs text-slate-400 italic">Not available from reviewed sources</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Target Column */}
          <div className="p-4 space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                Target
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">Target Entity</h3>
            </div>

            <div className="space-y-3">
              {rows.map(({ key, label }) => {
                const fact = target[key];
                return (
                  <div key={key} className="group relative space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">{label}</span>
                      {fact && (
                        <BlockActionMenu
                          blockId={`companies.target.${key}`}
                          sectionKey="companies"
                          content={fact.display || fact.value || ''}
                          sourceIds={fact.sourceIds}
                          reportVersionId={reportVersionId}
                          onSaveToNotebook={onSaveToNotebook}
                        />
                      )}
                    </div>
                    {fact ? (
                      <FactValue fact={fact} />
                    ) : (
                      <span className="text-xs text-slate-400 italic">Not available from reviewed sources</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
