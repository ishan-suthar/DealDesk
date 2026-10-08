import { db } from '../db/client';
import { notesTable } from '../db/schema';
import { eq, desc, asc } from 'drizzle-orm';
import type { Note } from '@/domain/types';

export const notesRepository = {
  async getById(id: string): Promise<Note | undefined> {
    const row = db.select().from(notesTable).where(eq(notesTable.id, id)).get();
    return row ? (row as unknown as Note) : undefined;
  },

  async list(filters?: { dealId?: string; templateSection?: string; search?: string }): Promise<Note[]> {
    let rows = db
      .select()
      .from(notesTable)
      .orderBy(desc(notesTable.pinned), asc(notesTable.position), desc(notesTable.createdAt))
      .all();

    let notes = rows as unknown as Note[];

    if (filters?.dealId) {
      notes = notes.filter((n) => n.dealId === filters.dealId);
    }
    if (filters?.templateSection) {
      notes = notes.filter((n) => n.templateSection === filters.templateSection);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      notes = notes.filter((n) =>
        (n.comment && n.comment.toLowerCase().includes(q)) ||
        (n.quote && n.quote.toLowerCase().includes(q))
      );
    }

    return notes;
  },

  async create(note: Note): Promise<Note> {
    const row = {
      ...note,
      createdAt: note.createdAt || new Date().toISOString(),
      updatedAt: note.updatedAt || new Date().toISOString(),
    };
    db.insert(notesTable).values(row as any).run();
    return row;
  },

  async update(id: string, partial: Partial<Note>): Promise<Note | undefined> {
    const current = await this.getById(id);
    if (!current) return undefined;

    const updated = {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString(),
    };

    db.update(notesTable)
      .set(updated as any)
      .where(eq(notesTable.id, id))
      .run();

    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const result = db.delete(notesTable).where(eq(notesTable.id, id)).run();
    return result.changes > 0;
  },

  async deleteByDealId(dealId: string): Promise<number> {
    const result = db.delete(notesTable).where(eq(notesTable.dealId, dealId)).run();
    return result.changes;
  },

  async reorder(orderedIds: string[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      db.update(notesTable)
        .set({ position: i, updatedAt: new Date().toISOString() })
        .where(eq(notesTable.id, orderedIds[i]))
        .run();
    }
  },

  async deleteAll(): Promise<void> {
    db.delete(notesTable).run();
  },
};
