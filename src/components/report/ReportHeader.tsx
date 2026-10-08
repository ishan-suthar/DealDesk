'use client';

import React, { useState } from 'react';
import type { Deal, ResearchReport, Job } from '@/domain/types';
import {
  RotateCcw,
  Trash2,
  ChevronDown,
  Clock,
  AlertCircle,
  Loader2,
  XCircle,
  MoreHorizontal,
} from 'lucide-react';

interface ReportHeaderProps {
  deal: Deal;
  currentReport: ResearchReport;
  allReports: ResearchReport[];
  activeJob: Job | null;
  onSelectVersion: (version: number) => void;
  onRefresh: () => void;
  onCancelRefresh: () => void;
  onRemoveFromMyDeals: () => void;
}

export function ReportHeader({
  deal,
  currentReport,
  allReports,
  activeJob,
  onSelectVersion,
  onRefresh,
  onCancelRefresh,
  onRemoveFromMyDeals,
}: ReportHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  // Compute relative time since report creation
  const reportTime = new Date(currentReport.createdAt).getTime();
  const elapsedDays = Math.floor((Date.now() - reportTime) / (1000 * 60 * 60 * 24));
  const isOutOfDate = elapsedDays >= 7;

  const relativeTimeStr =
    elapsedDays === 0
      ? 'today'
      : elapsedDays === 1
      ? 'yesterday'
      : `${elapsedDays} days ago`;

  const isRefreshing = activeJob && (activeJob.status === 'running' || activeJob.status === 'queued');

  return (
    <div className="p-6 bg-white border-b border-slate-200 space-y-4">
      {/* Top Bar: Headline, Version Selector & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-teal-800 text-white">
              Deep Research Report
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize border border-slate-200">
              {deal.transactionStatus}
            </span>
            {isOutOfDate && (
              <span className="text-xs text-amber-700 font-medium inline-flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <AlertCircle className="w-3 h-3" />
                <span>May be out of date</span>
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-slate-900 leading-snug">{deal.headline}</h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Version Selector Menu */}
          {allReports.length > 1 && (
            <select
              value={currentReport.version}
              onChange={(e) => onSelectVersion(Number(e.target.value))}
              aria-label="Report version"
              className="text-xs font-semibold rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              {allReports.map((r, idx) => (
                <option key={r.id} value={r.version}>
                  Version {r.version} {idx === 0 ? '(latest)' : ''}
                </option>
              ))}
            </select>
          )}

          {/* Refresh Research Button (exact copy) */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={Boolean(isRefreshing)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh research</span>
          </button>

          {/* More options menu (Remove from My Deals) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              aria-label="Report options menu"
              className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onRemoveFromMyDeals();
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove from My Deals</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timestamp & Metadata subtitle */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Last researched {relativeTimeStr}</span>
          <span>•</span>
          <span>Version {currentReport.version}</span>
          <span>•</span>
          <span>Model: {currentReport.model}</span>
        </div>
      </div>

      {/* Non-blocking progress indicator if refreshing */}
      {isRefreshing && (
        <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-lg flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-teal-700 animate-spin" />
            <span className="font-semibold text-teal-900">
              Refreshing research ({activeJob.stage || 'In progress'} — {activeJob.progress}%)
            </span>
            <span className="text-teal-700 hidden sm:inline">
              — Prior report remains active and editable below
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelRefresh}
            className="text-xs font-bold text-teal-900 hover:text-teal-700 underline flex items-center gap-1"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        </div>
      )}
    </div>
  );
}
