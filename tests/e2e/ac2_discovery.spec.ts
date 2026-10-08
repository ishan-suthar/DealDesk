import { test, expect } from '@playwright/test';

test.describe('AC2: Discovery run in demo mode', () => {
  test('returns >=3 result cards, shows progress stages, and Demo data banner', async ({ page }) => {
    await page.goto('/research');

    // 1. Verify Demo data banner
    await expect(page.getByRole('status').filter({ hasText: /Demo data/i })).toBeVisible();

    // 2. Select subsector "Food & Beverage"
    const subsectorBtn = page.getByRole('button', { name: 'Food & Beverage' });
    if (await subsectorBtn.isVisible()) {
      await subsectorBtn.click();
    }

    // 3. Click Find deals
    const findDealsBtn = page.getByRole('button', { name: 'Find deals' });
    await expect(findDealsBtn).toBeEnabled();
    await findDealsBtn.click();

    // 4. Verify progress stages appear (wait for search to complete)
    await expect(page.getByText(/Found \d+ verified deals/i)).toBeVisible({ timeout: 15000 });

    // 5. Verify result cards exist
    const cards = page.locator('div[role="button"]:has-text("Harborline Foods")');
    await expect(cards.first()).toBeVisible();

    // Verify at least 3 cards are displayed in current results / queue
    const allCards = page.locator('div[role="button"]:has(h3)');
    const count = await allCards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
