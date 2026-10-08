'use client';

import React from 'react';
import type { SearchFilters } from '@/domain/types';

interface FilterChipsProps {
  filters: SearchFilters;
}

export function FilterChips({ filters }: FilterChipsProps) {
  const chips: string[] = [
    filters.sector,
    ...(filters.subsectors && filters.subsectors.length > 0 ? filters.subsectors : ['All subsectors']),
    filters.timeWindow === '30d'
      ? 'Last 30 days'
      : filters.timeWindow === '90d'
      ? 'Last 90 days'
      : filters.timeWindow === '12m'
      ? 'Last 12 months'
      : 'Custom dates',
    filters.dealStatus === 'any' ? 'Any status' : `Status: ${filters.dealStatus}`,
    `Up to ${filters.maxDeals} deals`,
    `Region: ${filters.geography}`,
  ];

  if (filters.includeRumored) {
    chips.push('Incl. rumored');
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1">
      <span className="text-xs font-semibold text-slate-500 mr-1">Filters:</span>
      {chips.map((chip, idx) => (
        <span
          key={idx}
          className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
        >
          {chip}
        </span>
      ))}
    </div>
  );
}
