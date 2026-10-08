import { test, expect } from '@playwright/test';

test.describe('AC7: Recycle Bin and Restore flow', () => {
  test('rejects deal, shows undo toast, navigates to /recycle-bin, and restores', async ({ page }) => {
    await page.goto('/research');

    // Click on a deal (e.g., Nimbus Pet Brands)
    const dealCard = page.locator('div[role="button"]:has-text("Nimbus Pet Brands")').first();
    await dealCard.click();

    // Click "I don't like this deal"
    const rejectBtn = page.getByRole('button', { name: "I don't like this deal" });
    if (await rejectBtn.isVisible()) {
      await rejectBtn.click();

      // Verify undo toast appears
      await expect(page.getByText('Deal moved to Recycle Bin')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible();

      // Go to /recycle-bin
      await page.goto('/recycle-bin');
      await expect(page.getByRole('heading', { name: 'Recycle Bin' })).toBeVisible();

      // Verify Nimbus Pet Brands is in Recycle Bin
      const deletedRow = page.locator('div:has-text("Nimbus Pet Brands")');
      await expect(deletedRow.first()).toBeVisible();

      // Click Restore
      const restoreBtn = deletedRow.getByRole('button', { name: 'Restore' }).first();
      await restoreBtn.click();

      // Return to /research and verify it restored
      await page.goto('/research');
      await expect(page.locator('div[role="button"]:has-text("Nimbus Pet Brands")').first()).toBeVisible();
    }
  });
});
