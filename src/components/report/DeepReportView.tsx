'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Deal, ResearchReport, Source, Job } from '@/domain/types';
import { ReportHeader } from './ReportHeader';
import { SnapshotSection } from './sections/SnapshotSection';
import { CompaniesSection } from './sections/CompaniesSection';
import { MechanicsSection } from './sections/MechanicsSection';
import { RationaleSection } from './sections/RationaleSection';
import { SourcesSection } from './sections/SourcesSection';
import { Bookmark } from 'lucide-react';

interface DeepReportViewProps {
  deal: Deal;
  currentReport: ResearchReport;
  allReports: ResearchReport[];
  sources: Source[];
  activeJob: Job | null;
  onSelectVersion: (version: number) => void;
  onRefresh: () => void;
  onCancelRefresh: () => void;
  onRemoveFromMyDeals: () => void;
  onSaveToNotebook?: (data: {
    blockId: string;
    sectionKey: string;
    quote: string;
    sourceIds: string[];
    reportVersionId?: string;
  }) => void;
}

export function DeepReportView({
  deal,
  currentReport,
  allReports,
  sources,
  activeJob,
  onSelectVersion,
  onRefresh,
  onCancelRefresh,
  onRemoveFromMyDeals,
  onSaveToNotebook,
}: DeepReportViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [floatingSelection, setFloatingSelection] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // Floating button on text selection (§3.6)
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setFloatingSelection(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length === 0) {
        setFloatingSelection(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setFloatingSelection({
        text: text.slice(0, 2000), // Max 2,000 characters
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      if (container) {
        container.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, []);

  const snapshotSec = currentReport.sections.find((s) => s.key === 'snapshot');
  const companiesSec = currentReport.sections.find((s) => s.key === 'companies');
  const mechanicsSec = currentReport.sections.find((s) => s.key === 'mechanics');
  const rationaleSec = currentReport.sections.find((s) => s.key === 'rationale');

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full max-h-[calc(100vh-120px)] overflow-hidden relative"
    >
      {/* Floating Save to Notebook button */}
      {floatingSelection && (
        <div
          style={{
            position: 'fixed',
            left: `${floatingSelection.x}px`,
            top: `${floatingSelection.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="z-50 animate-in fade-in zoom-in-95"
        >
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              if (onSaveToNotebook) {
                onSaveToNotebook({
                  blockId: 'selection',
                  sectionKey: 'snapshot',
                  quote: floatingSelection.text,
                  sourceIds: currentReport.sourceIds,
                  reportVersionId: currentReport.id,
                });
              }
              setFloatingSelection(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-lg hover:bg-slate-800 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Save to Notebook</span>
          </button>
        </div>
      )}

      {/* Header */}
      <ReportHeader
        deal={deal}
        currentReport={currentReport}
        allReports={allReports}
        activeJob={activeJob}
        onSelectVersion={onSelectVersion}
        onRefresh={onRefresh}
        onCancelRefresh={onCancelRefresh}
        onRemoveFromMyDeals={onRemoveFromMyDeals}
      />

      {/* Report Body in TEMPLATE_MAPPING order */}
      <div className="p-6 overflow-y-auto space-y-8 flex-1">
        {snapshotSec && (
          <SnapshotSection
            section={snapshotSec}
            reportVersionId={currentReport.id}
            onSaveToNotebook={onSaveToNotebook}
          />
        )}

        {companiesSec && (
          <CompaniesSection
            section={companiesSec}
            reportVersionId={currentReport.id}
            onSaveToNotebook={onSaveToNotebook}
          />
        )}

        {mechanicsSec && (
          <MechanicsSection
            section={mechanicsSec}
            reportVersionId={currentReport.id}
            onSaveToNotebook={onSaveToNotebook}
          />
        )}

        {rationaleSec && (
          <RationaleSection
            section={rationaleSec}
            reportVersionId={currentReport.id}
            onSaveToNotebook={onSaveToNotebook}
          />
        )}

        <SourcesSection report={currentReport} sources={sources} />
      </div>
    </div>
  );
}
