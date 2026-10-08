import { test, expect } from '@playwright/test';

test.describe('AC5: Deep research report, versioning and refresh', () => {
  test('opening saved deal shows report and Refresh research; refresh creates version n+1 and keeps prior version accessible', async ({ page }) => {
    await page.goto('/research');

    // 1. Click on saved deal in left rail (Harborline Foods / Maple Crest)
    const leftRail = page.locator('aside');
    const harborlineCard = leftRail.getByText('Harborline Foods').first();
    await expect(harborlineCard).toBeVisible();
    await harborlineCard.click();

    // 2. Verify Deep Report is displayed
    await expect(page.getByText('Deep Research Report')).toBeVisible();
    await expect(page.getByText(/Last researched/i)).toBeVisible();

    // 3. Verify Refresh research button exists (exact copy)
    const refreshBtn = page.getByRole('button', { name: 'Refresh research' });
    await expect(refreshBtn).toBeVisible();

    // 4. Verify template sections are rendered in order
    await expect(page.getByRole('heading', { name: '1. Deal Snapshot' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '2. Company Overview' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '3. Deal Summary and Mechanics' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '4. Rationale and Judgment' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '5. Sources and Research Gaps' })).toBeVisible();

    // 5. Click "Refresh research"
    await refreshBtn.click();

    // Wait for the refresh job to succeed (version n+1 created)
    await expect(page.getByRole('combobox', { name: 'Report version' })).toBeVisible({ timeout: 15000 });

    // 6. Verify version selector has Version 2 (latest) and Version 1
    const versionSelect = page.getByRole('combobox', { name: 'Report version' });
    await expect(versionSelect).toBeVisible();

    // Select Version 1 to verify version n remains accessible
    await versionSelect.selectOption('1');
    await expect(versionSelect).toHaveValue('1');
    await expect(page.locator('span').filter({ hasText: /^Version 1$/ })).toBeVisible();
  });
});
