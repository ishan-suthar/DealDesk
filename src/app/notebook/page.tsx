'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import type { Note, Deal, ResearchReport } from '@/domain/types';
import { TEMPLATE_DEFINITIONS, TemplateSectionKey } from '@/domain/template';
import {
  BookOpen,
  Search,
  Plus,
  Pin,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Download,
  FileText,
  Clock,
  Layers,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';

export default function NotebookWrapper() {
  return (
    <ToastProvider>
      <NotebookPage />
    </ToastProvider>
  );
}

function NotebookPage() {
  const { showToast } = useToast();

  const [notes, setNotes] = useState<Note[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [reportsByDeal, setReportsByDeal] = useState<Record<string, ResearchReport[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [selectedDealId, setSelectedDealId] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteForm, setNoteForm] = useState<{
    dealId: string;
    templateSection: string;
    quote: string;
    comment: string;
    pinned: boolean;
  }>({
    dealId: '',
    templateSection: '',
    quote: '',
    comment: '',
    pinned: false,
  });

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [notesRes, dealsRes] = await Promise.all([
          fetch('/api/notes'),
          fetch('/api/deals'),
        ]);

        if (notesRes.ok) {
          const notesData = await notesRes.json();
          setNotes(notesData.notes || []);
        }

        if (dealsRes.ok) {
          const dealsData = await dealsRes.json();
          const allDeals: Deal[] = dealsData.deals || [];
          setDeals(allDeals);

          // Fetch reports for saved deals to check version statuses
          const reportMap: Record<string, ResearchReport[]> = {};
          await Promise.all(
            allDeals.map(async (d) => {
              try {
                const repRes = await fetch(`/api/deals/${d.id}/reports`);
                if (repRes.ok) {
                  const repData = await repRes.json();
                  reportMap[d.id] = repData.reports || [];
                }
              } catch (e) {
                // Ignore per-deal report fetch errors
              }
            })
          );
          setReportsByDeal(reportMap);
        }
      } catch (err) {
        console.error('Failed to load notebook data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered and searched notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (selectedDealId !== 'all' && n.dealId !== selectedDealId) {
        return false;
      }
      if (selectedSection !== 'all') {
        if (selectedSection === 'general' && n.templateSection) return false;
        if (selectedSection !== 'general' && n.templateSection !== selectedSection) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesComment = n.comment && n.comment.toLowerCase().includes(q);
        const matchesQuote = n.quote && n.quote.toLowerCase().includes(q);
        if (!matchesComment && !matchesQuote) return false;
      }
      return true;
    });
  }, [notes, selectedDealId, selectedSection, searchQuery]);

  // Open editor for new note
  const handleOpenNewNote = () => {
    setEditingNote(null);
    setNoteForm({
      dealId: selectedDealId !== 'all' ? selectedDealId : '',
      templateSection: selectedSection !== 'all' && selectedSection !== 'general' ? selectedSection : '',
      quote: '',
      comment: '',
      pinned: false,
    });
    setIsEditorOpen(true);
  };

  // Open editor for editing existing note
  const handleOpenEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteForm({
      dealId: note.dealId || '',
      templateSection: note.templateSection || '',
      quote: note.quote || '',
      comment: note.comment || '',
      pinned: Boolean(note.pinned),
    });
    setIsEditorOpen(true);
  };

  // Save Note (Create or Update)
  const handleSaveNote = async () => {
    if (!noteForm.comment.trim() && !noteForm.quote.trim()) {
      showToast({ message: 'Note must contain a comment or quote', type: 'error' });
      return;
    }

    if (noteForm.quote && noteForm.quote.length > 2000) {
      showToast({ message: 'Max saved selection: 2,000 characters', type: 'error' });
      return;
    }

    try {
      if (editingNote) {
        // Update
        const res = await fetch(`/api/notes/${editingNote.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comment: noteForm.comment,
            pinned: noteForm.pinned,
          }),
        });

        if (res.ok) {
          const { note: updated } = await res.json();
          setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
          showToast({ message: 'Note updated', type: 'success' });
          setIsEditorOpen(false);
        } else {
          const data = await res.json();
          showToast({ message: data.error || 'Failed to update note', type: 'error' });
        }
      } else {
        // Create
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dealId: noteForm.dealId || undefined,
            templateSection: (noteForm.templateSection as TemplateSectionKey) || undefined,
            quote: noteForm.quote || undefined,
            comment: noteForm.comment,
            pinned: noteForm.pinned,
          }),
        });

        if (res.ok) {
          const { note: created } = await res.json();
          setNotes((prev) => [created, ...prev]);
          showToast({ message: 'Note saved', type: 'success' });
          setIsEditorOpen(false);
        } else {
          const data = await res.json();
          showToast({ message: data.error || 'Failed to create note', type: 'error' });
        }
      }
    } catch (err: any) {
      showToast({ message: err.message || 'Operation failed', type: 'error' });
    }
  };

  // Delete note with undo toast
  const handleDeleteNote = async (note: Note) => {
    try {
      const res = await fetch(`/api/notes/${note.id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== note.id));

        showToast({
          message: 'Note deleted',
          type: 'info',
          action: {
            label: 'Undo',
            onClick: async () => {
              // Re-create note on undo
              await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(note),
              });
              setNotes((prev) => [note, ...prev]);
              showToast({ message: 'Note restored', type: 'success' });
            },
          },
        });
      }
    } catch (err: any) {
      showToast({ message: err.message || 'Failed to delete note', type: 'error' });
    }
  };

  // Toggle Pin
  const handleTogglePin = async (note: Note) => {
    const newPinned = !note.pinned;
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: newPinned }),
      });
      if (res.ok) {
        const { note: updated } = await res.json();
        setNotes((prev) => {
          const updatedList = prev.map((n) => (n.id === updated.id ? updated : n));
          // Stable sort with pinned first
          return [...updatedList].sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return a.position - b.position;
          });
        });
      }
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  // Keyboard Reorder: Move Up / Move Down
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredNotes.length) return;

    const newOrder = [...filteredNotes];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    // Update local state
    setNotes((prev) => {
      const remaining = prev.filter((n) => !newOrder.find((item) => item.id === n.id));
      return [...newOrder, ...remaining];
    });

    // Persist reorder to server
    try {
      await fetch('/api/notes/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: newOrder.map((n) => n.id) }),
      });
    } catch (err) {
      console.error('Failed to persist reorder:', err);
    }
  };

  // Handle Export
  const handleExport = (dealId: string, format: 'docx' | 'markdown') => {
    window.open(`/api/export/${dealId}?format=${format}`, '_blank');
  };

  // Helper to determine if a note is from an earlier report version
  const checkIsEarlierVersion = (note: Note): boolean => {
    if (!note.dealId || !note.reportVersionId) return false;
    const dealReports = reportsByDeal[note.dealId];
    if (!dealReports || dealReports.length <= 1) return false;

    const latest = dealReports[0];
    return latest.id !== note.reportVersionId;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-teal-800" />
              <h1 className="text-2xl font-bold text-slate-900">Notebook</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Personal notes, interview talking points, and saved excerpts from M&amp;A research.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {selectedDealId !== 'all' && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleExport(selectedDealId, 'docx')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export DOCX</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport(selectedDealId, 'markdown')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export MD</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleOpenNewNote}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quotes and personal comments..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          {/* Deal Filter */}
          <div className="md:col-span-4">
            <select
              value={selectedDealId}
              onChange={(e) => setSelectedDealId(e.target.value)}
              aria-label="Filter by deal"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">All Deals ({deals.length})</option>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.headline.length > 50 ? d.headline.slice(0, 50) + '...' : d.headline}
                </option>
              ))}
            </select>
          </div>

          {/* Template Section Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              aria-label="Filter by section"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">All Sections</option>
              {TEMPLATE_DEFINITIONS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
              <option value="general">General notes</option>
            </select>
          </div>
        </div>

        {/* Notes Grid / List */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            <Layers className="w-8 h-8 text-teal-800 animate-spin mx-auto mb-2" />
            <p>Loading your notebook...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No notes found</h3>
            <p className="text-xs max-w-md mx-auto">
              Select text in any deep research report and click{' '}
              <span className="font-semibold text-slate-700">Save to Notebook</span>, or click{' '}
              <span className="font-semibold text-slate-700">New Note</span> above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note, idx) => {
              const deal = deals.find((d) => d.id === note.dealId);
              const sectionDef = TEMPLATE_DEFINITIONS.find((s) => s.key === note.templateSection);
              const isEarlierVersion = checkIsEarlierVersion(note);

              return (
                <div
                  key={note.id}
                  className={`bg-white rounded-xl border transition-all p-5 shadow-xs space-y-3 ${
                    note.pinned
                      ? 'border-amber-300 bg-amber-50/20 shadow-amber-100/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Card Header: Badges & Controls */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {note.pinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Pin className="w-3 h-3 fill-current" />
                          <span>Pinned</span>
                        </span>
                      )}

                      {deal && (
                        <span className="font-bold px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-900 border border-teal-200">
                          {deal.headline}
                        </span>
                      )}

                      <span className="font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {sectionDef?.label || 'General notes'}
                      </span>

                      {isEarlierVersion && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                          <AlertCircle className="w-3 h-3" />
                          <span>From an earlier report version</span>
                        </span>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-1">
                      {/* Keyboard Reorder Buttons */}
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0}
                        title="Move up"
                        aria-label="Move note up"
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 hover:bg-slate-100"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === filteredNotes.length - 1}
                        title="Move down"
                        aria-label="Move note down"
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 hover:bg-slate-100"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Pin button */}
                      <button
                        type="button"
                        onClick={() => handleTogglePin(note)}
                        title={note.pinned ? 'Unpin note' : 'Pin note to top'}
                        aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
                        className={`p-1.5 rounded transition-colors ${
                          note.pinned
                            ? 'text-amber-600 hover:bg-amber-100'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'fill-current' : ''}`} />
                      </button>

                      {/* Edit button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditNote(note)}
                        title="Edit note"
                        aria-label="Edit note"
                        className="p-1.5 rounded text-slate-400 hover:text-teal-800 hover:bg-slate-100"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note)}
                        title="Delete note"
                        aria-label="Delete note"
                        className="p-1.5 rounded text-slate-400 hover:text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Quoted Excerpt */}
                  {note.quote && (
                    <blockquote className="pl-3 py-1 border-l-2 border-teal-600 bg-teal-50/40 rounded-r text-xs text-slate-800 italic leading-relaxed">
                      &ldquo;{note.quote}&rdquo;
                    </blockquote>
                  )}

                  {/* Personal Comment */}
                  {note.comment && (
                    <div className="text-xs text-slate-900 leading-relaxed font-normal whitespace-pre-wrap">
                      {note.comment}
                    </div>
                  )}

                  {/* Footer Timestamp */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </span>
                    {note.blockId && (
                      <span className="font-mono text-[10px] text-slate-400">
                        Block: {note.blockId}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Note Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingNote ? 'Edit Note' : 'New Note'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Optional Deal Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Associated Deal (Optional)
                </label>
                <select
                  value={noteForm.dealId}
                  onChange={(e) => setNoteForm((prev) => ({ ...prev, dealId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                >
                  <option value="">None / General</option>
                  {deals.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.headline}
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional Template Section */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Template Section (Optional)
                </label>
                <select
                  value={noteForm.templateSection}
                  onChange={(e) =>
                    setNoteForm((prev) => ({ ...prev, templateSection: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                >
                  <option value="">General notes</option>
                  {TEMPLATE_DEFINITIONS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quoted Excerpt */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quoted Excerpt (Max 2,000 characters)
                </label>
                <textarea
                  rows={3}
                  value={noteForm.quote}
                  maxLength={2000}
                  onChange={(e) => setNoteForm((prev) => ({ ...prev, quote: e.target.value }))}
                  placeholder="Paste or edit excerpt from research report..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
                <span className="text-[10px] text-slate-400 block text-right">
                  {noteForm.quote.length}/2,000
                </span>
              </div>

              {/* Personal Comment */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Personal Comment / Talking Point
                </label>
                <textarea
                  rows={4}
                  autoFocus
                  value={noteForm.comment}
                  onChange={(e) => setNoteForm((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder="Nikita's analysis, coffee-chat questions, synthesis..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              {/* Pinned Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="note-pinned-checkbox"
                  checked={noteForm.pinned}
                  onChange={(e) => setNoteForm((prev) => ({ ...prev, pinned: e.target.checked }))}
                  className="rounded border-slate-300 text-teal-800 focus:ring-teal-600"
                />
                <label
                  htmlFor="note-pinned-checkbox"
                  className="font-medium text-slate-700 cursor-pointer"
                >
                  Pin this note to the top of its section
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-sm"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
