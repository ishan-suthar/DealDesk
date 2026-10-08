'use client';

import React from 'react';
import type { Deal } from '@/domain/types';
import { ArrowRight, ShieldCheck, FileText, Bookmark } from 'lucide-react';

interface DealCardProps {
  deal: Deal;
  isSelected?: boolean;
  onSelect: (deal: Deal) => void;
}

export function DealCard({ deal, isSelected = false, onSelect }: DealCardProps) {
  const { headline, transactionStatus, userStatus, ranking, quickPreview, announcementDate } = deal;

  const hasPrimary = ranking.features.primaryEvidence >= 1.0;

  const statusColors: Record<string, string> = {
    pending: 'bg-blue-50 text-blue-700 border-blue-200',
    closed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    terminated: 'bg-rose-50 text-rose-700 border-rose-200',
    rumored: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  const statusText =
    transactionStatus === 'rumored'
      ? 'Reported — not announced'
      : transactionStatus.charAt(0).toUpperCase() + transactionStatus.slice(1);

  return (
    <div
      onClick={() => onSelect(deal)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(deal);
        }
      }}
      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
        isSelected
          ? 'bg-teal-50/50 border-teal-600 shadow-sm ring-1 ring-teal-600'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Transaction status chip */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                statusColors[transactionStatus] || 'bg-slate-100 text-slate-700'
              }`}
            >
              {statusText}
            </span>

            {/* Evidence badge */}
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
                hasPrimary
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              {hasPrimary ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Primary source</span>
                </>
              ) : (
                <>
                  <FileText className="w-3 h-3 text-slate-500" />
                  <span>Secondary only</span>
                </>
              )}
            </span>

            {/* User status chips */}
            {userStatus === 'saved' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-800 text-white inline-flex items-center gap-1">
                <Bookmark className="w-2.5 h-2.5 fill-current" />
                <span>Saved</span>
              </span>
            )}

            {userStatus === 'review' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300">
                On hold
              </span>
            )}
          </div>

          <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
            {headline}
          </h3>
        </div>

        {deal.dealValue.display && (
          <div className="text-xs font-semibold text-slate-900 shrink-0 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            {deal.dealValue.display}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
        <span>Announced: {announcementDate.display || announcementDate.value || 'Undisclosed'}</span>
        <span>•</span>
        <span>{deal.subsectors.join(', ')}</span>
      </div>

      {/* Top 2-3 ranking reasons */}
      {ranking.reasons && ranking.reasons.length > 0 && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
          {ranking.reasons.slice(0, 3).map((reason, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-100"
            >
              • {reason}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
