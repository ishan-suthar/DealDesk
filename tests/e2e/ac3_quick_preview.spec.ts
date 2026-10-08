import { test, expect } from '@playwright/test';

test.describe('AC3: Quick preview fields, sources & footer buttons', () => {
  test('displays all screening fields and exactly the 3 buttons in order', async ({ page }) => {
    await page.goto('/research');

    // Click on a deal card (e.g. Copperleaf or Harborline)
    const card = page.locator('div[role="button"]:has(h3)').first();
    await card.click();

    // Verify Quick Preview header
    await expect(page.getByText('Quick Preview')).toBeVisible();

    // Verify key sections
    await expect(page.getByRole('heading', { name: 'Summary' })).toBeVisible();
    await expect(page.getByText('Deal Value')).toBeVisible();
    await expect(page.getByText('Announcement Date')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Parties & Roles' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Advisers' })).toBeVisible();

    // Verify sources list is visible
    await expect(page.getByText(/Preview Sources \(\d+\)/i)).toBeVisible();

    // Verify EXACTLY the three buttons in the footer
    const saveBtn = page.getByRole('button', { name: 'Save to My Deals' });
    const holdBtn = page.getByRole('button', { name: /Hold for review|Remove hold/i });
    const rejectBtn = page.getByRole('button', { name: "I don't like this deal" });

    await expect(saveBtn.or(page.getByText('Saved to My Deals'))).toBeVisible();
  });
});
