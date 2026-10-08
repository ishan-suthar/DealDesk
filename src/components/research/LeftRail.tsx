'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Deal } from '@/domain/types';
import { Search, BookOpen, Trash2, Bookmark, ExternalLink } from 'lucide-react';

interface LeftRailProps {
  savedDeals: Deal[];
  selectedDealId?: string;
  onSelectDeal: (deal: Deal) => void;
}

export function LeftRail({
  savedDeals,
  selectedDealId,
  onSelectDeal,
}: LeftRailProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDeals = savedDeals.filter((d) =>
    d.headline.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    pending: 'bg-blue-50 text-blue-700 border-blue-200',
    closed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    terminated: 'bg-rose-50 text-rose-700 border-rose-200',
    rumored: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  return (
    <aside className="w-full flex flex-col h-full bg-white border-r border-slate-200">
      {/* Title & Search */}
      <div className="p-4 border-b border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-teal-800 fill-teal-800" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              My Deals ({savedDeals.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Study List</span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search saved deals..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:bg-white"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {savedDeals.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 px-4">
            <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
            <p className="font-medium text-slate-600">Deals you save will appear here.</p>
            <p className="text-[11px] text-slate-400 mt-1">Screen results in the center and click Save to My Deals.</p>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No saved deals match &quot;{searchTerm}&quot;
          </div>
        ) : (
          filteredDeals.map((deal) => {
            const isSelected = deal.id === selectedDealId;
            return (
              <div
                key={deal.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectDeal(deal)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectDeal(deal);
                  }
                }}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-teal-50/70 border-teal-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${
                      statusColors[deal.transactionStatus] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {deal.transactionStatus}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    researched recently
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                  {deal.headline}
                </h4>
                {deal.dealValue.display && (
                  <div className="text-[11px] font-medium text-slate-600 mt-1">
                    {deal.dealValue.display}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Navigation Links */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-medium text-slate-600">
        <Link
          href="/notebook"
          className="inline-flex items-center gap-1.5 hover:text-teal-800 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Notebook</span>
        </Link>

        <Link
          href="/recycle-bin"
          className="inline-flex items-center gap-1.5 hover:text-rose-700 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Recycle Bin</span>
        </Link>
      </div>
    </aside>
  );
}
