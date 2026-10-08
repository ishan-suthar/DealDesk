'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { Settings as SettingsIcon, Save, RotateCcw, AlertTriangle } from 'lucide-react';

export default function SettingsWrapper() {
  return (
    <ToastProvider>
      <SettingsPage />
    </ToastProvider>
  );
}

function SettingsPage() {
  const { showToast } = useToast();
  const [displayName, setDisplayName] = useState('Nikita');
  const [researchMode, setResearchMode] = useState('demo');
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setDisplayName(data.settings.displayName || 'Nikita');
          setResearchMode(data.settings.researchMode || 'demo');
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      });
      if (res.ok) {
        showToast({ message: 'Settings saved successfully', type: 'success' });
      } else {
        const err = await res.json();
        showToast({ message: err.error || 'Failed to save', type: 'error' });
      }
    } catch (err: any) {
      showToast({ message: err.message || 'Network error', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDemoData = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/settings/reset-demo', {
        method: 'POST',
      });
      if (res.ok) {
        showToast({ message: 'Demo data reset successfully', type: 'success' });
        setShowResetConfirm(false);
      } else {
        const err = await res.json();
        showToast({ message: err.error || 'Failed to reset demo data', type: 'error' });
      }
    } catch (err: any) {
      showToast({ message: err.message || 'Network error', type: 'error' });
    } finally {
      setIsResetting(false);
    }
  };

  const isDemo = researchMode === 'demo';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navigation isDemoMode={isDemo} providerId={researchMode} />

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-8 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-slate-500" />
            <span>Settings</span>
          </h1>
          <p className="text-xs text-slate-500">
            Configure your research environment and profile details.
          </p>
        </div>

        {/* Display Name Form */}
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-900">Display Name</label>
            <p className="text-xs text-slate-500">
              Personalized greeting shown on the welcome screen.
            </p>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full max-w-md px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
            />
          </div>

          <div className="space-y-1.5 pt-4 border-t border-slate-100">
            <label className="text-sm font-bold text-slate-900">Research Mode</label>
            <p className="text-xs text-slate-500">
              Live mode is configured via server environment variables (.env.local).
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              <span>{isDemo ? 'Demo' : `Live — ${researchMode}`}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>

        {/* Demo Data Reset (when in demo mode) */}
        {isDemo && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Reset Demo Data</h2>
            <p className="text-xs text-slate-500">
              Restores the 10 standard fictional fixtures, deep report v1, and 3 notes to their default state.
            </p>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset demo data</span>
            </button>
          </div>
        )}
      </main>

      {/* Confirmation Dialog for Reset Demo Data */}
      {showResetConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-amber-50 text-amber-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Reset All Demo Data?</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  This will erase all modifications, notes, and research runs, restoring the original 10 fictional demo fixtures.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetDemoData}
                disabled={isResetting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-sm transition-colors"
              >
                {isResetting ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
