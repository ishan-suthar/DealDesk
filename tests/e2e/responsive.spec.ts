import { test, expect } from '@playwright/test';

test.describe('M6: Responsive Design Verification', () => {
  test('desktop viewport (1280px) displays full 3-column layout without mobile tabs', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/research');

    // Left rail is visible
    const leftRail = page.locator('aside');
    await expect(leftRail).toBeVisible();

    // Center column search controls are visible
    await expect(page.getByRole('button', { name: 'Find deals' })).toBeVisible();

    // Mobile navigation tabs are hidden on desktop
    const mobileTabs = page.locator('div.lg\\:hidden');
    await expect(mobileTabs).not.toBeVisible();
  });

  test('tablet/mobile viewport (768px) enables tabs and allows clean view switching', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/research');

    // Mobile tabs container is visible
    const mobileTabs = page.locator('div.lg\\:hidden');
    await expect(mobileTabs).toBeVisible();

    // 1. Results tab is active by default; search controls are visible
    await expect(page.getByRole('button', { name: 'Find deals' })).toBeVisible();

    // 2. Switch to 'My Deals' tab
    const myDealsTabBtn = page.getByRole('button', { name: /My Deals \(\d+\)/ });
    await myDealsTabBtn.click();

    // Left rail is now visible
    const leftRail = page.locator('aside');
    await expect(leftRail).toBeVisible();

    // 3. Switch back to 'Results' tab and trigger a search
    const resultsTabBtn = page.getByRole('button', { name: /Results \(\d+\)/ });
    await resultsTabBtn.click();
    const findDealsBtn = page.getByRole('button', { name: 'Find deals' });
    await expect(findDealsBtn).toBeVisible();
    await findDealsBtn.click();

    // Click on a discovered deal card
    const dealCard = page.locator('div[role="button"]:has-text("Copperleaf Beverage"):has-text("Announced")').first();
    await expect(dealCard).toBeVisible();
    await dealCard.click();

    // Deal selection automatically switches active tab to Workspace
    await expect(page.getByText('Quick Preview').first()).toBeVisible();

    // 4. Test switching directly to Workspace tab
    const workspaceTabBtn = page.getByRole('button', { name: 'Workspace' });
    await workspaceTabBtn.click();
    await expect(page.getByText('Quick Preview').first()).toBeVisible();
  });

  test('viewport 1024px displays properly', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/research');

    // At 1024px (lg breakpoint), main 3-column layout is active
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Find deals' })).toBeVisible();
  });
});
