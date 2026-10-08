'use client';

import React from 'react';
import type { ReportSection, Claim, FactValue as FactValueType } from '@/domain/types';
import { FactValue } from '@/components/facts/FactValue';
import { CitationBadgeList } from '@/components/facts/CitationBadge';
import { AnalysisBadge } from '@/components/facts/AnalysisBadge';
import { BlockActionMenu } from '../BlockActionMenu';

interface SectionProps {
  section: ReportSection;
  reportVersionId: string;
  onSaveToNotebook?: (data: any) => void;
}

export function SnapshotSection({ section, reportVersionId, onSaveToNotebook }: SectionProps) {
  const fields = section.fields as Record<string, any>;

  return (
    <section className="space-y-6">
      <div className="border-b border-slate-200 pb-2">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>1. Deal Snapshot</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">High-level transaction summary and valuation snapshot</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deal */}
        {fields.deal && (
          <div className="group relative p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deal</span>
              <BlockActionMenu
                blockId="snapshot.deal.value"
                sectionKey="snapshot"
                content={fields.deal.display || fields.deal.value}
                sourceIds={fields.deal.sourceIds}
                reportVersionId={reportVersionId}
                onSaveToNotebook={onSaveToNotebook}
              />
            </div>
            <FactValue fact={fields.deal} />
          </div>
        )}

        {/* Price */}
        {fields.price && (
          <div className="group relative p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price</span>
              <BlockActionMenu
                blockId="snapshot.price.value"
                sectionKey="snapshot"
                content={fields.price.display || fields.price.value}
                sourceIds={fields.price.sourceIds}
                reportVersionId={reportVersionId}
                onSaveToNotebook={onSaveToNotebook}
              />
            </div>
            <FactValue fact={fields.price} />
          </div>
        )}

        {/* Premium */}
        {fields.premium && (
          <div className="group relative p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Premium</span>
              <BlockActionMenu
                blockId="snapshot.premium.value"
                sectionKey="snapshot"
                content={fields.premium.display || String(fields.premium.value)}
                sourceIds={fields.premium.sourceIds}
                reportVersionId={reportVersionId}
                onSaveToNotebook={onSaveToNotebook}
              />
            </div>
            <FactValue fact={fields.premium} />
          </div>
        )}

        {/* EBITDA Multiple */}
        {fields.ebitdaMultiple && (
          <div className="group relative p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">EBITDA Multiple</span>
              <BlockActionMenu
                blockId="snapshot.ebitdaMultiple.value"
                sectionKey="snapshot"
                content={fields.ebitdaMultiple.display || String(fields.ebitdaMultiple.value)}
                sourceIds={fields.ebitdaMultiple.sourceIds}
                reportVersionId={reportVersionId}
                onSaveToNotebook={onSaveToNotebook}
              />
            </div>
            <FactValue fact={fields.ebitdaMultiple} />
          </div>
        )}

        {/* Buy-side Banks */}
        {fields.buySideBanks && (
          <div className="group relative p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Buy-Side Banks</span>
              <BlockActionMenu
                blockId="snapshot.buySideBanks.value"
                sectionKey="snapshot"
                content={fields.buySideBanks.display || fields.buySideBanks.value}
                sourceIds={fields.buySideBanks.sourceIds}
                reportVersionId={reportVersionId}
                onSaveToNotebook={onSaveToNotebook}
              />
            </div>
            <FactValue fact={fields.buySideBanks} />
          </div>
        )}

        {/* Sell-side Banks */}
        {fields.sellSideBanks && (
          <div className="group relative p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sell-Side Banks</span>
              <BlockActionMenu
                blockId="snapshot.sellSideBanks.value"
                sectionKey="snapshot"
                content={fields.sellSideBanks.display || fields.sellSideBanks.value}
                sourceIds={fields.sellSideBanks.sourceIds}
                reportVersionId={reportVersionId}
                onSaveToNotebook={onSaveToNotebook}
              />
            </div>
            <FactValue fact={fields.sellSideBanks} />
          </div>
        )}
      </div>

      {/* Brief Summary Claims */}
      {fields.briefSummary && Array.isArray(fields.briefSummary) && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Brief Summary</h3>
          <div className="space-y-2">
            {fields.briefSummary.map((claim: Claim) => (
              <div
                key={claim.id}
                className="group relative p-3 bg-white rounded-lg border border-slate-200 text-sm flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="text-slate-900 leading-relaxed font-medium">
                    {claim.text}
                    <CitationBadgeList sourceIds={claim.sourceIds} />
                  </div>
                  {claim.claimType === 'analysis' && <AnalysisBadge reasoning={claim.reasoning} />}
                </div>
                <BlockActionMenu
                  blockId={`snapshot.briefSummary.${claim.id}`}
                  sectionKey="snapshot"
                  content={claim.text}
                  sourceIds={claim.sourceIds}
                  reportVersionId={reportVersionId}
                  onSaveToNotebook={onSaveToNotebook}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coffee-Chat Talking Points */}
      {fields.talkingPoints && Array.isArray(fields.talkingPoints) && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Coffee-Chat Talking Points
            </h3>
            <AnalysisBadge />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {fields.talkingPoints.map((tp: Claim) => (
              <div
                key={tp.id}
                className="group relative p-3 bg-indigo-50/40 rounded-lg border border-indigo-100 flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-indigo-900 mb-1">
                    {tp.text}
                    <CitationBadgeList sourceIds={tp.sourceIds} />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <BlockActionMenu
                    blockId={`snapshot.talkingPoints.${tp.id}`}
                    sectionKey="snapshot"
                    content={tp.text}
                    sourceIds={tp.sourceIds}
                    reportVersionId={reportVersionId}
                    onSaveToNotebook={onSaveToNotebook}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
