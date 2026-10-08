'use client';

import React from 'react';
import type { Source, ResearchReport } from '@/domain/types';
import { ExternalLink, HelpCircle, Database } from 'lucide-react';

interface SourcesSectionProps {
  report: ResearchReport;
  sources: Source[];
}

export function SourcesSection({ report, sources }: SourcesSectionProps) {
  return (
    <section className="space-y-6 pt-4 border-t border-slate-200">
      <div className="border-b border-slate-200 pb-2">
        <h2 className="text-base font-bold text-slate-900">5. Sources and Research Gaps</h2>
        <p className="text-xs text-slate-500 mt-0.5">Bibliography, identified research gaps, and audit metadata</p>
      </div>

      {/* Open Questions / Missing Data */}
      {report.openQuestions && report.openQuestions.length > 0 && (
        <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-700" />
            <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              Open Questions & Research Gaps
            </h3>
          </div>
          <ul className="space-y-1.5 text-xs text-amber-900 pl-6 list-disc">
            {report.openQuestions.map((q, idx) => (
              <li key={idx} className="leading-relaxed">
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Consolidated Sources Table / List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Consolidated Sources ({sources.length})
        </h3>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {sources.map((s) => (
              <div
                key={s.id}
                id={`source-${s.id}`}
                className="p-3.5 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                      [{s.id}]
                    </span>
                    <span className="font-bold text-slate-900">{s.title}</span>
                  </div>
                  <div className="text-slate-500 flex items-center gap-2 flex-wrap">
                    <span>{s.publisher}</span>
                    <span>•</span>
                    <span className="capitalize">{s.sourceType}</span>
                    <span>•</span>
                    <span>Published: {s.publishedAt || 'Undated'}</span>
                    <span>•</span>
                    <span>Accessed: {s.accessedAt.split('T')[0]}</span>
                  </div>
                  {s.excerpt && (
                    <p className="text-slate-600 italic bg-slate-50 p-2 rounded mt-1 border border-slate-100 text-[11px]">
                      &quot;{s.excerpt}&quot;
                    </p>
                  )}
                </div>

                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-teal-800 shrink-0"
                  title="Open source URL"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Metadata */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <Database className="w-3.5 h-3.5" />
          <span>Research Audit Trail</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
          <div>
            <span className="block text-slate-400">Report ID</span>
            <span className="font-mono text-slate-700">{report.id}</span>
          </div>
          <div>
            <span className="block text-slate-400">Version</span>
            <span className="font-mono text-slate-700">v{report.version}</span>
          </div>
          <div>
            <span className="block text-slate-400">Provider & Model</span>
            <span className="font-mono text-slate-700">{report.provider} ({report.model})</span>
          </div>
          <div>
            <span className="block text-slate-400">Prompt Version</span>
            <span className="font-mono text-slate-700">{report.promptVersion}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
