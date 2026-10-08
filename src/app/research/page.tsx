'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { SearchControls } from '@/components/research/SearchControls';
import { FilterChips } from '@/components/research/FilterChips';
import { ProgressStage } from '@/components/research/ProgressStage';
import { DealCard } from '@/components/research/DealCard';
import { QuickPreview } from '@/components/research/QuickPreview';
import { LeftRail } from '@/components/research/LeftRail';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import type { Deal, SearchRun, Job, Company, Source, SearchFilters } from '@/domain/types';
import { ChevronDown, ChevronUp, AlertCircle, Info, Layers } from 'lucide-react';

export default function ResearchPageWrapper() {
  return (
    <ToastProvider>
      <ResearchDashboard />
    </ToastProvider>
  );
}

function ResearchDashboard() {
  const { showToast } = useToast();

  // State
  const [activeTab, setActiveTab] = useState<'myDeals' | 'results' | 'workspace'>('results');
  const [currentRun, setCurrentRun] = useState<SearchRun | null>(null);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [resultsCollapsed, setResultsCollapsed] = useState(false);

  // Queue groups
  const [onHoldDeals, setOnHoldDeals] = useState<Deal[]>([]);
  const [restoredDeals, setRestoredDeals] = useState<Deal[]>([]);
  const [currentResults, setCurrentResults] = useState<Deal[]>([]);
  const [savedDeals, setSavedDeals] = useState<Deal[]>([]);
  const [hiddenCount, setHiddenCount] = useState(0);

  // Selection & Details
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [dealCompanies, setDealCompanies] = useState<Company[]>([]);
  const [dealSources, setDealSources] = useState<Source[]>([]);
  const [isLoadingDealDetails, setIsLoadingDealDetails] = useState(false);

  // System state error / notices
  const [runErrorNotice, setRunErrorNotice] = useState<string | null>(null);
  const [budgetNotice, setBudgetNotice] = useState<string | null>(null);

  // Fetch initial queue and saved deals
  const refreshQueue = useCallback(async () => {
    try {
      const res = await fetch('/api/search/current');
      if (res.ok) {
        const data = await res.json();
        setCurrentRun(data.run);
        setOnHoldDeals(data.queue.onHold || []);
        setRestoredDeals(data.queue.restored || []);
        setCurrentResults(data.queue.currentResults || []);
        setHiddenCount(data.hiddenCount || 0);

        if (data.job && (data.job.status === 'running' || data.job.status === 'queued')) {
          setActiveJob(data.job);
          setIsSearching(true);
        }
      }

      // Fetch saved deals for left rail
      const savedRes = await fetch('/api/deals?userStatus=saved');
      if (savedRes.ok) {
        const savedData = await savedRes.json();
        setSavedDeals(savedData.deals || []);
      }
    } catch (err) {
      console.error('Failed to refresh queue:', err);
    }
  }, []);

  useEffect(() => {
    refreshQueue();
  }, [refreshQueue]);

  // Load detailed companies and sources when a deal is selected
  const loadDealDetails = useCallback(async (deal: Deal) => {
    setSelectedDeal(deal);
    setIsLoadingDealDetails(true);
    try {
      const res = await fetch(`/api/deals/${deal.id}`);
      if (res.ok) {
        const data = await res.json();
        setDealCompanies(data.companies || []);
        setDealSources(data.sources || []);
      }
    } catch (err) {
      console.error('Failed to load deal details:', err);
    } finally {
      setIsLoadingDealDetails(false);
    }
  }, []);

  // Set default selection if none selected
  useEffect(() => {
    if (!selectedDeal) {
      if (currentResults.length > 0) {
        loadDealDetails(currentResults[0]);
      } else if (onHoldDeals.length > 0) {
        loadDealDetails(onHoldDeals[0]);
      } else if (savedDeals.length > 0) {
        loadDealDetails(savedDeals[0]);
      }
    }
  }, [currentResults, onHoldDeals, savedDeals, selectedDeal, loadDealDetails]);

  // Polling active job every 1s
  useEffect(() => {
    if (!activeJob || (activeJob.status !== 'running' && activeJob.status !== 'queued')) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${activeJob.id}`);
        if (res.ok) {
          const { job } = await res.json();
          setActiveJob(job);

          if (job.status === 'succeeded') {
            setIsSearching(false);
            refreshQueue();
            clearInterval(interval);
          } else if (job.status === 'failed') {
            setIsSearching(false);
            setRunErrorNotice(job.error?.message || 'Search encountered an error.');
            refreshQueue();
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Job polling error:', err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeJob, refreshQueue]);

  // Handle Find Deals
  const handleStartSearch = async (filters: SearchFilters) => {
    setIsSearching(true);
    setRunErrorNotice(null);
    setBudgetNotice(null);
    setResultsCollapsed(false);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      if (!res.ok) {
        const err = await res.json();
        setIsSearching(false);
        setRunErrorNotice(err.error || 'Failed to start discovery search.');
        return;
      }

      const { jobId, runId } = await res.json();
      setActiveJob({
        id: jobId,
        kind: 'discovery',
        status: 'running',
        stage: 'Finding candidates',
        progress: 15,
        usage: { searches: 0, fetches: 0, inputTokens: 0, outputTokens: 0 },
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      setIsSearching(false);
      setRunErrorNotice(err.message || 'Network error starting search.');
    }
  };

  // Handle State Machine Actions on Deal
  const handleDealAction = async (action: 'save' | 'hold' | 'unhold' | 'reject') => {
    if (!selectedDeal) return;

    const currentDeal = selectedDeal;
    try {
      const res = await fetch(`/api/deals/${currentDeal.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const err = await res.json();
        showToast({ message: err.error || 'Action rejected.', type: 'error' });
        return;
      }

      const { deal: updatedDeal } = await res.json();
      setSelectedDeal(updatedDeal);
      await refreshQueue();

      if (action === 'save') {
        showToast({
          message: 'Saved to My Deals',
          type: 'success',
        });
      } else if (action === 'reject') {
        showToast({
          message: 'Deal moved to Recycle Bin',
          durationMs: 8000,
          action: {
            label: 'Undo',
            onClick: async () => {
              await fetch(`/api/deals/${currentDeal.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'restore' }),
              });
              await refreshQueue();
              loadDealDetails(currentDeal);
            },
          },
        });
      } else if (action === 'hold') {
        showToast({ message: 'Deal held for review' });
      } else if (action === 'unhold') {
        showToast({ message: 'Hold removed' });
      }
    } catch (err: any) {
      showToast({ message: err.message || 'Action failed', type: 'error' });
    }
  };

  const totalResultsCount = currentResults.length;
  const requestedMax = currentRun?.filters.maxDeals ?? 10;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navigation />

      {/* Mobile / Tablet Tab Bar (Below 1024px) */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-around text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('myDeals')}
          className={`px-3 py-1.5 rounded-md ${
            activeTab === 'myDeals' ? 'bg-teal-50 text-teal-800' : 'text-slate-600'
          }`}
        >
          My Deals ({savedDeals.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('results')}
          className={`px-3 py-1.5 rounded-md ${
            activeTab === 'results' ? 'bg-teal-50 text-teal-800' : 'text-slate-600'
          }`}
        >
          Results ({currentResults.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('workspace')}
          className={`px-3 py-1.5 rounded-md ${
            activeTab === 'workspace' ? 'bg-teal-50 text-teal-800' : 'text-slate-600'
          }`}
        >
          Workspace
        </button>
      </div>

      {/* Main 3-Column Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: My Deals Study List (3 cols) */}
        <div
          className={`lg:col-span-3 lg:block ${
            activeTab === 'myDeals' ? 'block' : 'hidden'
          } h-[calc(100vh-120px)] sticky top-20`}
        >
          <LeftRail
            savedDeals={savedDeals}
            selectedDealId={selectedDeal?.id}
            onSelectDeal={(deal) => {
              loadDealDetails(deal);
              setActiveTab('workspace');
            }}
          />
        </div>

        {/* Center Column: Temporary Discovery Queue (5 cols) */}
        <div
          className={`lg:col-span-5 lg:block ${
            activeTab === 'results' ? 'block' : 'hidden'
          } space-y-4`}
        >
          {/* Top Search Controls */}
          <SearchControls onSearch={handleStartSearch} isLoading={isSearching} />

          {/* Active Filter Chips */}
          {currentRun && <FilterChips filters={currentRun.filters} />}

          {/* Search Progress */}
          {isSearching && activeJob && (
            <ProgressStage
              currentStage={activeJob.stage}
              progress={activeJob.progress}
            />
          )}

          {/* Error Notices / System States */}
          {runErrorNotice && (
            <div role="alert" className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Search stopped early:</span>
                <span>{runErrorNotice}</span>
              </div>
            </div>
          )}

          {budgetNotice && (
            <div role="alert" className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Search budget for this run was reached; results may be incomplete.</span>
            </div>
          )}

          {/* Results Header: summary line & collapse toggle */}
          {currentRun && (
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="text-slate-700 font-medium">
                <span>Found {totalResultsCount} verified deals (up to {requestedMax} requested)</span>
                {totalResultsCount < requestedMax && (
                  <span className="block text-slate-500 text-[11px] mt-0.5">
                    Fewer deals met the evidence bar than requested.
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setResultsCollapsed((prev) => !prev)}
                className="inline-flex items-center gap-1 font-semibold text-teal-800 hover:text-teal-900 bg-slate-50 px-2.5 py-1 rounded border border-slate-200"
              >
                <span>{resultsCollapsed ? 'Show results' : 'Collapse results'}</span>
                {resultsCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* Center Queue Groups */}
          {!resultsCollapsed && (
            <div className="space-y-4">
              {/* Group 1: On Hold */}
              {onHoldDeals.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                      On Hold ({onHoldDeals.length})
                    </span>
                    <span className="text-[11px] text-slate-500">Deals held for review</span>
                  </div>
                  <div className="space-y-2">
                    {onHoldDeals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        isSelected={selectedDeal?.id === deal.id}
                        onSelect={(d) => {
                          loadDealDetails(d);
                          setActiveTab('workspace');
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Group 2: Restored */}
              {restoredDeals.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Restored ({restoredDeals.length})
                    </span>
                    <span className="text-[11px] text-slate-500">Restored from Recycle Bin</span>
                  </div>
                  <div className="space-y-2">
                    {restoredDeals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        isSelected={selectedDeal?.id === deal.id}
                        onSelect={(d) => {
                          loadDealDetails(d);
                          setActiveTab('workspace');
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Group 3: Current Results */}
              <div className="space-y-2">
                {currentRun && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                      Current Results ({currentResults.length})
                    </span>
                  </div>
                )}

                {currentResults.length === 0 && !isSearching && !currentRun && (
                  <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                    <p className="font-medium text-slate-700">Set your filters and click Find deals.</p>
                  </div>
                )}

                {currentResults.length === 0 && !isSearching && currentRun && (
                  <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
                    <p className="font-medium text-slate-700">
                      No deals met the evidence bar for these filters. Try a longer time window or more subsectors.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  {currentResults.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      isSelected={selectedDeal?.id === deal.id}
                      onSelect={(d) => {
                        loadDealDetails(d);
                        setActiveTab('workspace');
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Hidden in Recycle Bin line */}
              {hiddenCount > 0 && (
                <div className="text-center text-xs text-slate-500 pt-2">
                  <span>{hiddenCount} hidden in Recycle Bin</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Quick Preview / Workspace (4 cols) */}
        <div
          className={`lg:col-span-4 lg:block ${
            activeTab === 'workspace' ? 'block' : 'hidden'
          } sticky top-20`}
        >
          {selectedDeal ? (
            <QuickPreview
              deal={selectedDeal}
              companies={dealCompanies}
              sources={dealSources}
              onAction={handleDealAction}
              onOpenReport={(dealId) => {
                window.location.href = `/research?dealId=${dealId}#report`;
              }}
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-700">Select a deal to view its quick preview.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
