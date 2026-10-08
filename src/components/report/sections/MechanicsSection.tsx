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

export function MechanicsSection({ section, reportVersionId, onSaveToNotebook }: SectionProps) {
  const fields = section.fields as Record<string, any>;

  const mechanicsFields = [
    { key: 'dealType', label: 'Type of Deal' },
    { key: 'announcement', label: 'Announcement Date & Market Reaction' },
    { key: 'exchangeRatio', label: 'Exchange Ratio' },
    { key: 'cashStockMix', label: 'Cash / Stock Mix' },
    { key: 'postDealStructure', label: 'Post-Deal Structure' },
    { key: 'multiplesAtAnnouncement', label: 'Multiples at Announcement' },
    { key: 'closingDate', label: 'Closing Date' },
    { key: 'multiplesAtClose', label: 'Multiples at Close' },
    { key: 'premiumPaid', label: 'Premium Paid' },
    { key: 'debtAssumed', label: 'Debt Assumed' },
    { key: 'competitors', label: 'Competitors' },
    { key: 'accretionDilution', label: 'Dilution / Accretion' },
    { key: 'advisersAndFees', label: 'Financial Advisors & Fees' },
  ];

  return (
    <section className="space-y-4">
      <div className="border-b border-slate-200 pb-2">
        <h2 className="text-base font-bold text-slate-900">3. Deal Summary and Mechanics</h2>
        <p className="text-xs text-slate-500 mt-0.5">Financing structure, consideration, and timeline</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mechanicsFields.map(({ key, label }) => {
          const fact = fields[key];
          return (
            <div key={key} className="group relative p-3.5 bg-white rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                {fact && (
                  <BlockActionMenu
                    blockId={`mechanics.${key}.value`}
                    sectionKey="mechanics"
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
    </section>
  );
}
