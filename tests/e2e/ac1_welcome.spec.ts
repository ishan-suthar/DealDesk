import { test, expect } from '@playwright/test';

test.describe('AC1: Welcome flow', () => {
  test('one click on Start researching reaches /research', async ({ page }) => {
    await page.goto('/');

    // Check heading
    await expect(page.getByRole('heading', { name: /Welcome Nikita/i })).toBeVisible();
    await expect(page.getByText('Find a deal worth talking about.')).toBeVisible();

    // Click Start researching
    const startButton = page.getByRole('link', { name: 'Start researching' });
    await expect(startButton).toBeVisible();
    await startButton.click();

    // Verify reached /research
    await expect(page).toHaveURL(/\/research/);
    await expect(page.getByRole('button', { name: 'Find deals' })).toBeVisible();
  });
});
