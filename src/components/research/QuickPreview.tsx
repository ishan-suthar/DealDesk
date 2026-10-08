'use client';

import React from 'react';
import type { Deal, Company, Source } from '@/domain/types';
import { FactValue } from '../facts/FactValue';
import { CitationBadgeList } from '../facts/CitationBadge';
import { AnalysisBadge } from '../facts/AnalysisBadge';
import { Bookmark, PauseCircle, Trash2, ExternalLink, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

interface QuickPreviewProps {
  deal: Deal;
  companies: Company[];
  sources: Source[];
  onAction: (action: 'save' | 'hold' | 'unhold' | 'reject') => void;
  onOpenReport?: (dealId: string) => void;
}

export function QuickPreview({
  deal,
  companies,
  sources,
  onAction,
  onOpenReport,
}: QuickPreviewProps) {
  const { headline, quickPreview, transactionStatus, userStatus, announcementDate, closingDate } = deal;

  const companyMap = new Map<string, Company>(companies.map((c) => [c.id, c]));

  // Separate financial and legal advisers
  const financialAdvisers = quickPreview.advisers.filter((a) => a.role === 'financial');
  const legalAdvisers = quickPreview.advisers.filter((a) => a.role === 'legal');

  // Filter sources referenced in preview
  const previewSources = sources.filter((s) => quickPreview.sourceIds.includes(s.id));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full max-h-[calc(100vh-140px)] overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800">
            Quick Preview
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Screening brief for coffee chats
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">{headline}</h2>
      </div>

      {/* Scrollable Content */}
      <div className="p-5 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
        {/* 1. Summary & Background */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Summary</h4>
          <p className="font-medium text-slate-900 leading-relaxed">
            {quickPreview.summary.text}
            <CitationBadgeList sourceIds={quickPreview.summary.sourceIds} />
          </p>

          {quickPreview.background && quickPreview.background.length > 0 && (
            <div className="pt-2 text-slate-600 space-y-1">
              {quickPreview.background.map((bg) => (
                <p key={bg.id}>
                  {bg.text}
                  <CitationBadgeList sourceIds={bg.sourceIds} />
                </p>
              ))}
            </div>
          )}
        </div>

        {/* 2. Key Transaction Facts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-lg border border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-0.5">Deal Value</span>
            <FactValue fact={deal.dealValue} />
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-0.5">Announcement Date</span>
            <FactValue fact={announcementDate} />
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-0.5">Transaction Status</span>
            <div className="inline-flex items-center gap-1.5 font-medium text-slate-900">
              <span className="capitalize">{transactionStatus}</span>
              <CitationBadgeList sourceIds={deal.transactionStatusSourceIds} />
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-0.5">Expected / Actual Closing</span>
            <FactValue fact={closingDate} />
          </div>

          {quickPreview.multiples && quickPreview.multiples.length > 0 && (
            <div className="sm:col-span-2 pt-2 border-t border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Valuation Multiples</span>
              <div className="flex flex-wrap gap-4">
                {quickPreview.multiples.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-600">{m.label}:</span>
                    <FactValue fact={m.fact} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Parties & Roles */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Parties & Roles</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {quickPreview.parties.map((p, idx) => {
              const comp = companyMap.get(p.companyId);
              return (
                <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    {p.role} {comp?.isSponsor && '(PE Sponsor)'}
                  </div>
                  <div className="font-bold text-slate-900 text-xs mt-0.5">
                    {comp ? comp.name : p.companyId}
                    <CitationBadgeList sourceIds={p.sourceIds} />
                  </div>
                  {comp?.hqCountry && (
                    <div className="text-[10px] text-slate-500 mt-0.5">HQ: {comp.hqCountry}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Advisers */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Advisers</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-700 block">Financial Advisers</span>
              {financialAdvisers.length > 0 ? (
                <ul className="text-xs space-y-1">
                  {financialAdvisers.map((adv, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <span>• {adv.firm} ({adv.side})</span>
                      <CitationBadgeList sourceIds={adv.sourceIds} />
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-xs text-slate-500 italic">Not yet found</span>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-700 block">Legal Advisers</span>
              {legalAdvisers.length > 0 ? (
                <ul className="text-xs space-y-1">
                  {legalAdvisers.map((adv, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <span>• {adv.firm} ({adv.side})</span>
                      <CitationBadgeList sourceIds={adv.sourceIds} />
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-xs text-slate-500 italic">Not yet found</span>
              )}
            </div>
          </div>
        </div>

        {/* 5. Differentiating Insights */}
        {quickPreview.differentiators && quickPreview.differentiators.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Differentiating Insights
              </h4>
              <AnalysisBadge />
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {quickPreview.differentiators.map((diff) => (
                <li key={diff.id} className="p-2.5 rounded bg-indigo-50/40 border border-indigo-100">
                  <div className="font-medium text-slate-900">
                    {diff.text}
                    <CitationBadgeList sourceIds={diff.sourceIds} />
                  </div>
                  {diff.reasoning && (
                    <div className="text-[11px] text-slate-500 mt-1 italic">
                      Basis: {diff.reasoning}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 6. Drivers & Trends */}
        {quickPreview.drivers && quickPreview.drivers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Deal Drivers & Trends
              </h4>
              <AnalysisBadge />
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {quickPreview.drivers.map((driv) => (
                <li key={driv.id} className="p-2.5 rounded bg-indigo-50/40 border border-indigo-100">
                  <div className="font-medium text-slate-900">
                    {driv.text}
                    <CitationBadgeList sourceIds={driv.sourceIds} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 7. Sources */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Preview Sources ({previewSources.length})
          </h4>
          <ul className="space-y-1.5 text-xs">
            {previewSources.map((s) => (
              <li
                key={s.id}
                id={`source-${s.id}`}
                className="p-2 rounded border border-slate-200 bg-slate-50 flex items-start justify-between gap-2"
              >
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="text-teal-800 font-mono text-[11px]">[{s.id}]</span>
                    <span>{s.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {s.publisher} • {s.publishedAt || 'Undated'} • {s.sourceType}
                  </div>
                </div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-slate-400 hover:text-teal-700"
                  title="Open source link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer: ALWAYS EXACTLY THE THREE PRESCRIBED BUTTONS IN ORDER */}
      <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
        {userStatus === 'saved' ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold text-teal-800 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 fill-current" />
              <span>Saved to My Deals</span>
            </span>
            <button
              type="button"
              onClick={() => onOpenReport && onOpenReport(deal.id)}
              className="px-4 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-md shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              Open research
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 w-full">
            {/* Button 1: Save to My Deals */}
            <button
              type="button"
              onClick={() => onAction('save')}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-md shadow-sm transition-all"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save to My Deals</span>
            </button>

            {/* Button 2: Hold for review / Remove hold */}
            <button
              type="button"
              onClick={() => onAction(userStatus === 'review' ? 'unhold' : 'hold')}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition-all"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              <span>{userStatus === 'review' ? 'Remove hold' : 'Hold for review'}</span>
            </button>

            {/* Button 3: I don't like this deal */}
            <button
              type="button"
              onClick={() => onAction('reject')}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md border border-rose-200 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>I don&apos;t like this deal</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
