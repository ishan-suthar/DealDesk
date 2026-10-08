'use client';

import React from 'react';
import { Bookmark, MoreVertical } from 'lucide-react';

interface BlockActionMenuProps {
  blockId: string;
  sectionKey: string;
  content: string;
  sourceIds?: string[];
  reportVersionId?: string;
  onSaveToNotebook?: (data: {
    blockId: string;
    sectionKey: string;
    quote: string;
    sourceIds: string[];
    reportVersionId?: string;
  }) => void;
}

export function BlockActionMenu({
  blockId,
  sectionKey,
  content,
  sourceIds = [],
  reportVersionId,
  onSaveToNotebook,
}: BlockActionMenuProps) {
  return (
    <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-1">
      <button
        type="button"
        title="Save to Notebook"
        aria-label="Save to Notebook"
        onClick={(e) => {
          e.stopPropagation();
          if (onSaveToNotebook) {
            onSaveToNotebook({
              blockId,
              sectionKey,
              quote: content.slice(0, 2000),
              sourceIds,
              reportVersionId,
            });
          }
        }}
        className="px-2 py-1 rounded text-xs font-semibold text-slate-500 hover:text-teal-900 hover:bg-teal-50 border border-transparent hover:border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-colors flex items-center gap-1"
      >
        <Bookmark className="w-3.5 h-3.5" />
        <span>Save to Notebook</span>
      </button>
    </div>
  );
}
