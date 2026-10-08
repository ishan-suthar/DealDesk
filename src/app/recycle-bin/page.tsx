'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import type { Deal } from '@/domain/types';
import { Trash2, RotateCcw, AlertTriangle, Layers } from 'lucide-react';

export default function RecycleBinWrapper() {
  return (
    <ToastProvider>
      <RecycleBinPage />
    </ToastProvider>
  );
}

function RecycleBinPage() {
  const { showToast } = useToast();
  const [deletedDeals, setDeletedDeals] = useState<Deal[]>([]);
  const [dealToPurge, setDealToPurge] = useState<Deal | null>(null);
  const [isPurging, setIsPurging] = useState(false);

  const fetchDeleted = useCallback(async () => {
    try {
      const res = await fetch('/api/deals?userStatus=deleted');
      if (res.ok) {
        const data = await res.json();
        setDeletedDeals(data.deals || []);
      }
    } catch (err) {
      console.error('Failed to load deleted deals:', err);
    }
  }, []);

  useEffect(() => {
    fetchDeleted();
  }, [fetchDeleted]);

  const handleRestore = async (deal: Deal) => {
    try {
      const res = await fetch(`/api/deals/${deal.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' }),
      });

      if (res.ok) {
        showToast({ message: `Restored "${deal.headline}"`, type: 'success' });
        await fetchDeleted();
      } else {
        const err = await res.json();
        showToast({ message: err.error || 'Failed to restore deal', type: 'error' });
      }
    } catch (err: any) {
      showToast({ message: err.message || 'Network error', type: 'error' });
    }
  };

  const confirmPermanentPurge = async () => {
    if (!dealToPurge) return;
    setIsPurging(true);
    try {
      const res = await fetch(`/api/deals/${dealToPurge.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const result = await res.json();
        showToast({
          message: `Permanently removed deal, ${result.purgedNotesCount} notes, and ${result.purgedReportsCount} report versions.`,
          type: 'info',
        });
        setDealToPurge(null);
        await fetchDeleted();
      } else {
        const err = await res.json();
        showToast({ message: err.error || 'Failed to purge deal', type: 'error' });
      }
    } catch (err: any) {
      showToast({ message: err.message || 'Network error', type: 'error' });
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Trash2 className="w-6 h-6 text-slate-500" />
              <span>Recycle Bin</span>
            </h1>
            <p className="text-xs text-slate-500">
              Deals rejected during screening. Restore them to their prior queue group or remove permanently.
            </p>
          </div>

          <div className="text-xs font-semibold px-3 py-1 bg-slate-100 rounded-full text-slate-700">
            {deletedDeals.length} deleted deals
          </div>
        </div>

        {/* Deleted Deals List */}
        <div className="space-y-3">
          {deletedDeals.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">The Recycle Bin is empty.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Rejected deals will appear here.</p>
            </div>
          ) : (
            deletedDeals.map((deal) => (
              <div
                key={deal.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
                      Deleted
                    </span>
                    <span className="text-xs text-slate-500">
                      Prior status:{' '}
                      <strong className="text-slate-700 capitalize">
                        {deal.statusBeforeDelete || 'discovered'}
                      </strong>
                    </span>
                    {deal.deletedAt && (
                      <span className="text-xs text-slate-400">
                        • Deleted on {deal.deletedAt.split('T')[0]}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{deal.headline}</h3>

                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[11px]">
                      {deal.sector}
                    </span>
                    {deal.subsectors.map((sub) => (
                      <span
                        key={sub}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[11px]"
                      >
                        {sub}
                      </span>
                    ))}
                    {deal.dealValue.display && <span>• {deal.dealValue.display}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Exact copy: Restore */}
                  <button
                    type="button"
                    onClick={() => handleRestore(deal)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>

                  {/* Exact copy: Permanently remove */}
                  <button
                    type="button"
                    onClick={() => setDealToPurge(deal)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently remove</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Confirmation Dialog for Permanent Removal */}
      {dealToPurge && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-rose-50 text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Permanently Remove Deal?</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to permanently remove{' '}
                  <strong className="text-slate-900">{dealToPurge.headline}</strong>? This action
                  cannot be undone. Any saved notes and deep research report versions associated with
                  this deal will also be permanently removed.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDealToPurge(null)}
                disabled={isPurging}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPermanentPurge}
                disabled={isPurging}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-sm transition-colors"
              >
                {isPurging ? 'Removing...' : 'Permanently remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
