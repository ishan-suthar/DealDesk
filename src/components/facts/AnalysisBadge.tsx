'use client';

export function AnalysisBadge({
  showLabel = true,
  reasoning,
}: {
  showLabel?: boolean;
  reasoning?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
      title={reasoning ? `Reasoning: ${reasoning}` : 'Analysis — not investment advice'}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
      {showLabel ? 'Analysis — not investment advice' : 'Analysis'}
    </span>
  );
}
