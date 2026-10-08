import { test, expect } from '@playwright/test';

test.describe('M6: Accessibility & Full Keyboard Path', () => {
  test('verifies semantic headings and labels across pages', async ({ page }) => {
    // Welcome page has h1
    await page.goto('/');
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Welcome Nikita');

    // Research page has semantic hierarchy
    await page.goto('/research');
    await expect(page.getByRole('heading', { name: 'My Deals' })).toBeVisible();

    // Form inputs in SearchControls have labels
    await expect(page.getByLabel('Sector')).toBeVisible();
    await expect(page.getByLabel('Time Window')).toBeVisible();
    await expect(page.getByLabel('Max Deals')).toBeVisible();
  });

  test('completes full keyboard flow: search -> preview -> save -> report -> notebook', async ({ page }) => {
    await page.goto('/research');

    // 1. Trigger search via keyboard
    const findDealsBtn = page.getByRole('button', { name: 'Find deals' });
    await findDealsBtn.focus();
    await page.keyboard.press('Enter');

    // Wait for search job to finish
    await expect(page.getByText(/Found \d+ verified deals/i)).toBeVisible({ timeout: 15000 });

    // Wait for discovery cards to appear
    const dealCard = page.locator('div[role="button"]:has-text("Harborline Foods"):has-text("Announced")').first();
    await expect(dealCard).toBeVisible();

    // 2. Select deal card using keyboard (Enter)
    await dealCard.focus();
    await page.keyboard.press('Enter');

    // 3. Quick preview opens
    await expect(page.getByText('Quick Preview').first()).toBeVisible();

    // 4. Navigate to and trigger 'Save to My Deals' via keyboard (if not yet saved)
    const saveBtn = page.getByRole('button', { name: 'Save to My Deals' });
    if (await saveBtn.isVisible()) {
      await saveBtn.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByText('Saved to My Deals').first()).toBeVisible();
    }

    // 5. Open deep research report via keyboard
    const openResearchBtn = page.getByRole('button', { name: 'Open research' });
    await expect(openResearchBtn).toBeVisible();
    await openResearchBtn.focus();
    await page.keyboard.press('Enter');

    // Report view renders
    await expect(page.getByRole('button', { name: 'Refresh research' })).toBeVisible({ timeout: 15000 });

    // 6. Block action menu button is keyboard focusable
    const saveBlockBtn = page.locator('button[aria-label="Save to Notebook"]').first();
    if (await saveBlockBtn.isVisible()) {
      await saveBlockBtn.focus();
      await expect(saveBlockBtn).toBeFocused();
    }

    // 7. Navigate to Notebook via keyboard link in header
    const notebookLink = page.locator('header').getByRole('link', { name: 'Notebook' });
    await notebookLink.focus();
    await page.keyboard.press('Enter');

    // Notebook page loads
    await expect(page).toHaveURL(/\/notebook/);
    await expect(page.getByRole('heading', { name: 'Notebook' })).toBeVisible();
  });
});
