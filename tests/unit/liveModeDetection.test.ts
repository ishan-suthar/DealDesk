import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getActiveProviderInfo, getProvider } from '@/server/providers/providerFactory';
import { settingsRepository } from '@/server/repositories/settingsRepository';
import { searchRunsRepository } from '@/server/repositories/searchRunsRepository';
import crypto from 'crypto';

describe('Live Mode Detection & Origin Persistence (Provider, Settings, Search Runs)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('getActiveProviderInfo()', () => {
    it('returns demo mode when RESEARCH_PROVIDER is unset or "demo"', () => {
      delete process.env.RESEARCH_PROVIDER;
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.GEMINI_API_KEY;

      const info = getActiveProviderInfo();
      expect(info.isLive).toBe(false);
      expect(info.isDemoMode).toBe(true);
      expect(info.providerId).toBe('demo');
      expect(info.researchMode).toBe('demo');
      expect(info.modeDisplay).toBe('Demo');
    });

    it('falls back to demo mode when live provider is requested but API key is missing', () => {
      process.env.RESEARCH_PROVIDER = 'anthropic';
      delete process.env.ANTHROPIC_API_KEY;

      const info = getActiveProviderInfo();
      expect(info.isLive).toBe(false);
      expect(info.isDemoMode).toBe(true);
      expect(info.providerId).toBe('demo');
      expect(info.researchMode).toBe('demo');
    });

    it('detects live mode when RESEARCH_PROVIDER=anthropic and ANTHROPIC_API_KEY is configured', () => {
      process.env.RESEARCH_PROVIDER = 'anthropic';
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

      const info = getActiveProviderInfo();
      expect(info.isLive).toBe(true);
      expect(info.isDemoMode).toBe(false);
      expect(info.providerId).toBe('anthropic');
      expect(info.researchMode).toBe('anthropic');
      expect(info.modeDisplay).toBe('Live — anthropic');
    });

    it('detects live mode when RESEARCH_PROVIDER=gemini and GEMINI_API_KEY is configured', () => {
      process.env.RESEARCH_PROVIDER = 'gemini';
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      const info = getActiveProviderInfo();
      expect(info.isLive).toBe(true);
      expect(info.isDemoMode).toBe(false);
      expect(info.providerId).toBe('gemini');
      expect(info.researchMode).toBe('gemini');
      expect(info.modeDisplay).toBe('Live — gemini');
    });
  });

  describe('settingsRepository.getSettings() dynamic provider reflection', () => {
    it('returns isDemoMode=true and researchMode="demo" when in demo mode', async () => {
      delete process.env.RESEARCH_PROVIDER;
      delete process.env.ANTHROPIC_API_KEY;

      const settings = await settingsRepository.getSettings();
      expect(settings.isDemoMode).toBe(true);
      expect(settings.researchMode).toBe('demo');
    });

    it('returns isDemoMode=false and live provider researchMode when live keys are configured', async () => {
      process.env.RESEARCH_PROVIDER = 'anthropic';
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

      const settings = await settingsRepository.getSettings();
      expect(settings.isDemoMode).toBe(false);
      expect(settings.researchMode).toBe('anthropic');
      expect(settings.providerId).toBe('anthropic');
    });
  });

  describe('Search Runs origin persistence', () => {
    it('persists origin: "demo" and provider: "demo" in demo mode', async () => {
      delete process.env.RESEARCH_PROVIDER;
      delete process.env.ANTHROPIC_API_KEY;

      const activeInfo = getActiveProviderInfo();
      const runId = `test-run-demo-${crypto.randomUUID()}`;

      await searchRunsRepository.create({
        id: runId,
        filters: {
          sector: 'Consumer & Retail',
          subsectors: ['Food & Beverage'],
          timeWindow: '90d',
          maxDeals: 10,
          dealStatus: 'any',
          includeRumored: false,
          geography: 'US',
        },
        provider: activeInfo.providerId,
        origin: activeInfo.isLive ? 'live' : 'demo',
        jobId: `test-job-${crypto.randomUUID()}`,
        startedAt: new Date().toISOString(),
        resultDealIds: [],
        excluded: [],
      });

      const retrieved = await searchRunsRepository.getById(runId);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.origin).toBe('demo');
      expect(retrieved?.provider).toBe('demo');
    });

    it('persists origin: "live" and provider: "anthropic" in live mode', async () => {
      process.env.RESEARCH_PROVIDER = 'anthropic';
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

      const activeInfo = getActiveProviderInfo();
      const runId = `test-run-live-${crypto.randomUUID()}`;

      await searchRunsRepository.create({
        id: runId,
        filters: {
          sector: 'Technology',
          subsectors: ['Enterprise Software'],
          timeWindow: '90d',
          maxDeals: 10,
          dealStatus: 'any',
          includeRumored: false,
          geography: 'US',
        },
        provider: activeInfo.providerId,
        origin: activeInfo.isLive ? 'live' : 'demo',
        jobId: `test-job-${crypto.randomUUID()}`,
        startedAt: new Date().toISOString(),
        resultDealIds: [],
        excluded: [],
      });

      const retrieved = await searchRunsRepository.getById(runId);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.origin).toBe('live');
      expect(retrieved?.provider).toBe('anthropic');
    });
  });
});
