'use client';

import React, { useState } from 'react';
import { SECTORS, getSubsectorsForSector, Sector } from '@/domain/taxonomy';
import type { SearchFilters, TimeWindow, GeographyRegion, DealStatusFilter } from '@/domain/types';
import { Search, Loader2 } from 'lucide-react';

interface SearchControlsProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading: boolean;
}

export function SearchControls({ onSearch, isLoading }: SearchControlsProps) {
  const [sector, setSector] = useState<Sector>('Consumer & Retail');
  const [selectedSubsectors, setSelectedSubsectors] = useState<string[]>([]);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('90d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [maxDeals, setMaxDeals] = useState<5 | 10 | 15 | 25>(10);
  const [dealStatus, setDealStatus] = useState<DealStatusFilter>('any');
  const [includeRumored, setIncludeRumored] = useState(false);
  const [geography, setGeography] = useState<GeographyRegion>('US');

  const availableSubsectors = getSubsectorsForSector(sector);

  const handleSectorChange = (newSector: Sector) => {
    setSector(newSector);
    setSelectedSubsectors([]);
  };

  const toggleSubsector = (sub: string) => {
    setSelectedSubsectors((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    onSearch({
      sector,
      subsectors: selectedSubsectors,
      timeWindow,
      customStartDate: timeWindow === 'custom' ? customStart : undefined,
      customEndDate: timeWindow === 'custom' ? customEnd : undefined,
      maxDeals,
      dealStatus,
      includeRumored,
      geography,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* 1. Sector */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Sector</label>
          <select
            value={sector}
            onChange={(e) => handleSectorChange(e.target.value as Sector)}
            disabled={isLoading}
            className="w-full text-xs rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Time Window */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Time Window</label>
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value as TimeWindow)}
            disabled={isLoading}
            className="w-full text-xs rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
            <option value="custom">Custom dates</option>
          </select>
        </div>

        {/* 3. Number of Deals */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Max Deals</label>
          <select
            value={maxDeals}
            onChange={(e) => setMaxDeals(Number(e.target.value) as 5 | 10 | 15 | 25)}
            disabled={isLoading}
            className="w-full text-xs rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value={5}>5 deals</option>
            <option value={10}>10 deals (default)</option>
            <option value={15}>15 deals</option>
            <option value={25}>25 deals</option>
          </select>
        </div>

        {/* 4. Deal Status */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Status</label>
          <select
            value={dealStatus}
            onChange={(e) => setDealStatus(e.target.value as DealStatusFilter)}
            disabled={isLoading}
            className="w-full text-xs rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="any">Any (default)</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        {/* 5. Geography */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Geography</label>
          <select
            value={geography}
            onChange={(e) => setGeography(e.target.value as GeographyRegion)}
            disabled={isLoading}
            className="w-full text-xs rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="US">U.S. (default)</option>
            <option value="North America">North America</option>
            <option value="Europe">Europe</option>
            <option value="Global">Global</option>
          </select>
        </div>

        {/* Action Button: Find deals */}
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Find deals</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Subsectors filter & Rumored checkbox */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="font-semibold text-slate-600 mr-1">Subsectors:</span>
          {availableSubsectors.map((sub) => {
            const isSelected = selectedSubsectors.includes(sub);
            return (
              <button
                type="button"
                key={sub}
                onClick={() => toggleSubsector(sub)}
                disabled={isLoading}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors border ${
                  isSelected
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>

        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeRumored}
            onChange={(e) => setIncludeRumored(e.target.checked)}
            disabled={isLoading}
            className="rounded border-slate-300 text-teal-700 focus:ring-teal-600"
          />
          <span className="font-medium text-slate-700">Include rumored deals</span>
        </label>
      </div>
    </form>
  );
}
