import { db } from '../db/client';
import { settingsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { Settings } from '@/domain/types';

export const settingsRepository = {
  async getSettings(): Promise<Settings> {
    const existing = db.select().from(settingsTable).where(eq(settingsTable.id, 'default')).get();
    if (existing) {
      return {
        id: existing.id,
        displayName: existing.displayName,
        researchMode: existing.researchMode,
        updatedAt: existing.updatedAt,
      };
    }
    const defaultSettings: Settings = {
      id: 'default',
      displayName: 'Nikita',
      researchMode: process.env.RESEARCH_PROVIDER || 'demo',
      updatedAt: new Date().toISOString(),
    };
    db.insert(settingsTable).values(defaultSettings).run();
    return defaultSettings;
  },

  async updateDisplayName(displayName: string): Promise<Settings> {
    const current = await this.getSettings();
    const updated: Settings = {
      ...current,
      displayName,
      updatedAt: new Date().toISOString(),
    };
    db.update(settingsTable)
      .set({
        displayName: updated.displayName,
        updatedAt: updated.updatedAt,
      })
      .where(eq(settingsTable.id, 'default'))
      .run();
    return updated;
  },

  async updateResearchMode(mode: string): Promise<Settings> {
    const current = await this.getSettings();
    const updated: Settings = {
      ...current,
      researchMode: mode,
      updatedAt: new Date().toISOString(),
    };
    db.update(settingsTable)
      .set({
        researchMode: updated.researchMode,
        updatedAt: updated.updatedAt,
      })
      .where(eq(settingsTable.id, 'default'))
      .run();
    return updated;
  },

  async resetSettings(): Promise<Settings> {
    db.delete(settingsTable).where(eq(settingsTable.id, 'default')).run();
    return this.getSettings();
  },
};
