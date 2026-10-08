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
        title="Save block to Notebook"
        aria-label="Save block to Notebook"
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
        className="p-1 rounded text-slate-400 hover:text-teal-800 hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-600 transition-colors"
      >
        <Bookmark className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
