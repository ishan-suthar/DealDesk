'use client';

interface CitationBadgeProps {
  sourceId: string;
  onClick?: (id: string) => void;
}

export function CitationBadge({ sourceId, onClick }: CitationBadgeProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(sourceId);
        else {
          const el = document.getElementById(`source-${sourceId}`);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }}
      className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-mono font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200 ml-1 cursor-pointer transition-colors"
      title={`Source ${sourceId}`}
    >
      [{sourceId}]
    </button>
  );
}

export function CitationBadgeList({
  sourceIds,
  onSourceClick,
}: {
  sourceIds: string[];
  onSourceClick?: (id: string) => void;
}) {
  if (!sourceIds || sourceIds.length === 0) return null;
  return (
    <span className="inline-flex items-center flex-wrap gap-0.5 ml-1">
      {sourceIds.map((id) => (
        <CitationBadge key={id} sourceId={id} onClick={onSourceClick} />
      ))}
    </span>
  );
}
