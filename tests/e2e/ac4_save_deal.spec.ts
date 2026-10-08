import { test, expect } from '@playwright/test';

test.describe('AC4: Save to My Deals and left rail persistence', () => {
  test('saves deal, shows toast, updates left rail, and persists across reload', async ({ page }) => {
    await page.goto('/research');

    // Click on a discovered deal (e.g., Copperleaf Beverage)
    const dealCard = page.locator('div[role="button"]:has-text("Copperleaf Beverage")').first();
    await dealCard.click();

    // Click Save to My Deals
    const saveBtn = page.getByRole('button', { name: 'Save to My Deals' });
    if (await saveBtn.isVisible()) {
      await saveBtn.click();

      // Check success toast
      await expect(page.getByText('Saved to My Deals').first()).toBeVisible();

      // Verify appears in left rail
      const leftRail = page.locator('aside');
      await expect(leftRail.getByText('Copperleaf Beverage')).toBeVisible();

      // Reload page and verify still in left rail
      await page.reload();
      await expect(page.locator('aside').getByText('Copperleaf Beverage')).toBeVisible();
    } else {
      // Already saved
      await expect(page.locator('aside').getByText('Copperleaf Beverage')).toBeVisible();
    }
  });
});
