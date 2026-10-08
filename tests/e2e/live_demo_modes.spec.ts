import { test, expect } from '@playwright/test';

test.describe('Live vs Demo Mode UI and State Verification', () => {
  test('Demo mode: renders banner, settings indicator, and demo origin chips', async ({ page }) => {
    // 1. Visit Settings in default demo mode
    await page.goto('/settings');

    // Demo banner is visible
    const demoBanner = page.getByRole('status').filter({ hasText: /Demo data/i });
    await expect(demoBanner).toBeVisible();

    // Navigation badge shows Demo data
    await expect(page.locator('header').getByText('Demo data').first()).toBeVisible();

    // Settings page displays Demo mode
    await expect(page.getByText('Demo', { exact: true })).toBeVisible();

    // Reset demo data button is visible in demo mode
    await expect(page.getByRole('button', { name: /Reset demo data/i })).toBeVisible();

    // 2. Visit Research page in demo mode
    await page.goto('/research');
    await expect(demoBanner).toBeVisible();

    // Select subsector and run search to get cards
    const subsectorBtn = page.getByRole('button', { name: 'Food & Beverage' });
    if (await subsectorBtn.isVisible()) {
      await subsectorBtn.click();
    }
    const findDealsBtn = page.getByRole('button', { name: 'Find deals' });
    await expect(findDealsBtn).toBeEnabled({ timeout: 10000 });
    await findDealsBtn.click();
    // Wait for search to finish and button to become enabled again
    await expect(findDealsBtn).toBeEnabled({ timeout: 20000 });
    await expect(page.getByText(/Found \d+ verified deals/i)).toBeVisible({ timeout: 10000 });

    // Result card contains Demo data chip
    const demoChip = page.locator('div[role="button"]:has-text("Harborline Foods")').getByText('Demo data');
    await expect(demoChip.first()).toBeVisible({ timeout: 15000 });
  });

  test('Live mode: hides yellow demo banner, displays live provider badge, hides reset demo data button', async ({
    page,
  }) => {
    // Intercept settings endpoint to return live anthropic provider state
    await page.route('/api/settings', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            settings: {
              id: 'default',
              displayName: 'Nikita',
              researchMode: 'anthropic',
              isDemoMode: false,
              providerId: 'anthropic',
              geminiConfig: {},
              openAiConfig: {},
              anthropicConfig: { model: 'claude-3-7-sonnet-20250219' },
              deepReportV1Config: { enabled: true },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // 1. Visit Settings page in live mode
    await page.goto('/settings');

    // Demo banner must NOT be visible
    const demoBanner = page.getByRole('status').filter({ hasText: /Fictional transactions for preview/i });
    await expect(demoBanner).not.toBeVisible();

    // Header badge shows Live research (anthropic)
    await expect(page.locator('header').getByText(/Live research \(anthropic\)/i)).toBeVisible();

    // Mode in Settings displays Live — anthropic
    await expect(page.getByText('Live — anthropic')).toBeVisible();

    // Reset demo data button is NOT displayed in live mode
    await expect(page.getByRole('button', { name: /Reset demo data/i })).not.toBeVisible();

    // 2. Visit Research page in live mode with mocked active live search run
    await page.route('/api/search/current', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isDemoMode: false,
          providerId: 'anthropic',
          researchMode: 'anthropic',
          run: {
            id: 'run-live-e2e',
            provider: 'anthropic',
            origin: 'live',
            filters: {
              sector: 'Consumer & Retail',
              subsectors: ['Food & Beverage'],
              timeWindow: '90d',
              maxDeals: 10,
              dealStatus: 'any',
              includeRumored: false,
              geography: 'US',
            },
            status: 'completed',
            resultDealIds: ['deal-live-e2e-1'],
            createdAt: new Date().toISOString(),
          },
          job: null,
          queue: {
            onHold: [],
            restored: [],
            currentResults: [
              {
                id: 'deal-live-e2e-1',
                origin: 'live',
                dedupeKey: 'apex-artisan-foods|global-culinary|2024-03',
                headline: 'Global Culinary Holdings acquires Apex Artisan Foods for $1.25bn',
                sector: 'Consumer & Retail',
                subsectors: ['Food & Beverage'],
                geographyRegion: 'US',
                buyerIds: [],
                targetIds: [],
                sellerIds: [],
                announcementDate: {
                  value: '2024-03-15',
                  display: '2024-03-15',
                  valueStatus: 'verified',
                  sourceIds: ['S1'],
                },
                closingDate: {
                  value: '2024-03-20',
                  display: 'Closed on 2024-03-20',
                  valueStatus: 'verified',
                  sourceIds: ['S1'],
                },
                transactionStatus: 'closed',
                transactionStatusSourceIds: ['S1'],
                userStatus: 'discovered',
                dealValue: {
                  value: { amount: 1.25, currency: 'USD', unit: 'billions', valueType: 'enterprise_value' },
                  display: '$1.25bn enterprise value',
                  valueStatus: 'verified',
                  sourceIds: ['S1'],
                },
                quickPreview: {
                  summary: {
                    id: 'qp-live-1',
                    text: 'Global Culinary Holdings acquires Apex Artisan Foods for $1.25bn enterprise value.',
                    claimType: 'fact',
                    sourceIds: ['S1'],
                    confidence: 'high',
                  },
                  background: [],
                  timeline: [],
                  differentiators: [],
                  drivers: [],
                  trendTags: ['Artisan foods'],
                  noveltyTags: [],
                  advisers: [],
                  sourceIds: ['S1'],
                },
                ranking: {
                  score: 0.95,
                  features: {
                    sectorRelevance: 1.0,
                    recency: 1.0,
                    significance: 0.9,
                    primaryEvidence: 1.0,
                    trendRelevance: 1.0,
                    novelty: 0.5,
                  },
                  reasons: ['Live verified transaction'],
                },
                firstSeenRunId: 'run-live-e2e',
                searchRunIds: ['run-live-e2e'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
          },
          hiddenCount: 0,
        }),
      });
    });

    await page.goto('/research');

    // Demo banner must NOT be visible on Research page
    await expect(demoBanner).not.toBeVisible();

    // Header badge shows Live research
    await expect(page.locator('header').getByText(/Live research \(anthropic\)/i)).toBeVisible();

    // The deal card should render the Live research origin chip
    await expect(page.getByText(/Apex Artisan Foods/i).first()).toBeVisible({ timeout: 10000 });
    const liveChip = page.locator('div[role="button"]:has-text("Apex Artisan Foods")').getByText('Live research');
    await expect(liveChip.first()).toBeVisible({ timeout: 10000 });
  });
});
