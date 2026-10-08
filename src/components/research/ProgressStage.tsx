'use client';

import React from 'react';
import { CheckCircle2, CircleDot, Circle } from 'lucide-react';

const STAGES = [
  'Finding candidates',
  'Checking primary sources',
  'Extracting deal facts',
  'Ranking for interview usefulness',
] as const;

interface ProgressStageProps {
  currentStage?: string;
  progress: number;
}

export function ProgressStage({ currentStage = 'Finding candidates', progress }: ProgressStageProps) {
  const currentIndex = STAGES.findIndex((s) => s.toLowerCase() === currentStage.toLowerCase());
  const effectiveIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
        <span>Research Progress</span>
        <span>{progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-teal-700 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.max(5, progress)}%` }}
        />
      </div>

      {/* 4 Stages Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
        {STAGES.map((stage, idx) => {
          const isDone = idx < effectiveIndex || progress >= 100;
          const isCurrent = idx === effectiveIndex && progress < 100;

          return (
            <div
              key={stage}
              className={`flex items-center gap-1.5 text-xs font-medium ${
                isDone
                  ? 'text-emerald-700'
                  : isCurrent
                  ? 'text-teal-800 font-bold animate-pulse'
                  : 'text-slate-400'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : isCurrent ? (
                <CircleDot className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              )}
              <span className="truncate">{stage}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
