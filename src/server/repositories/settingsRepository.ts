import { db } from '../db/client';
import { settingsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { Settings } from '@/domain/types';
import { getActiveProviderInfo } from '../providers/providerFactory';

export const settingsRepository = {
  async getSettings(): Promise<Settings> {
    const existing = db.select().from(settingsTable).where(eq(settingsTable.id, 'default')).get();
    const info = getActiveProviderInfo();
    const displayName = existing ? existing.displayName : 'Nikita';

    if (existing) {
      if (existing.researchMode !== info.researchMode) {
        db.update(settingsTable)
          .set({ researchMode: info.researchMode, updatedAt: new Date().toISOString() })
          .where(eq(settingsTable.id, 'default'))
          .run();
      }
      return {
        id: existing.id,
        displayName,
        researchMode: info.researchMode,
        isDemoMode: info.isDemoMode,
        providerId: info.providerId,
        updatedAt: existing.updatedAt,
      };
    }

    const defaultSettings: Settings = {
      id: 'default',
      displayName: 'Nikita',
      researchMode: info.researchMode,
      isDemoMode: info.isDemoMode,
      providerId: info.providerId,
      updatedAt: new Date().toISOString(),
    };
    db.insert(settingsTable).values({
      id: defaultSettings.id,
      displayName: defaultSettings.displayName,
      researchMode: defaultSettings.researchMode,
      updatedAt: defaultSettings.updatedAt,
    }).run();
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
