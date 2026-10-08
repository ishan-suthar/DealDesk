import { test, expect } from '@playwright/test';

test.describe('AC6: Notebook and quote extraction', () => {
  test('saving note from report creates note findable by search in /notebook after reload', async ({ page }) => {
    // 1. Open research dashboard and select saved deal
    await page.goto('/research');

    const leftRail = page.locator('aside');
    const harborlineCard = leftRail.getByText('Harborline Foods').first();
    await expect(harborlineCard).toBeVisible({ timeout: 15000 });
    await harborlineCard.click();

    // 2. Wait for Deep Report to appear
    await expect(page.getByText('Deep Research Report')).toBeVisible({ timeout: 15000 });

    // 3. Locate a block and click "Save to Notebook"
    // Snapshot section has accessible block action buttons
    const saveToNotebookButtons = page.getByRole('button', { name: 'Save to Notebook' });
    await expect(saveToNotebookButtons.first()).toBeAttached({ timeout: 10000 });

    // Click the first Save to Notebook button
    await saveToNotebookButtons.first().click({ force: true });

    // 4. Verify toast notification appears
    await expect(page.getByText('Saved to Notebook')).toBeVisible();

    // 5. Navigate to /notebook
    await page.goto('/notebook');
    await expect(page.getByRole('heading', { name: 'Notebook' })).toBeVisible();

    // 6. Verify the note card is visible in notebook with quote
    const noteQuote = page.locator('blockquote').first();
    await expect(noteQuote).toBeVisible();
    await expect(noteQuote).toContainText('Harborline Foods');

    // 7. Test full-text search
    const searchInput = page.getByPlaceholder('Search quotes and personal comments...');
    await searchInput.fill('Harborline');

    // Note remains visible
    await expect(noteQuote).toBeVisible();
    await expect(noteQuote).toContainText('Harborline Foods');

    // 8. Reload page to verify persistence
    await page.reload();

    // Verify search input still finds the note
    const reloadedSearchInput = page.getByPlaceholder('Search quotes and personal comments...');
    await reloadedSearchInput.fill('Harborline');
    await expect(page.locator('blockquote').first()).toBeVisible();
    await expect(page.locator('blockquote').first()).toContainText('Harborline Foods');

    // Clear search filter so newly added note is not filtered out
    await reloadedSearchInput.fill('');

    // 9. Add a manual note
    const newNoteBtn = page.getByRole('button', { name: 'New Note' });
    await newNoteBtn.click();

    await expect(page.getByRole('heading', { name: 'New Note' })).toBeVisible();
    await page.getByPlaceholder("Nikita's analysis, coffee-chat questions, synthesis...").fill('Booth coffee chat talking point: examine direct store delivery margin impact.');
    await page.getByRole('button', { name: 'Save Note' }).click();

    await expect(page.getByText('Note saved')).toBeVisible();
    await expect(
      page.getByText('Booth coffee chat talking point: examine direct store delivery margin impact.').first()
    ).toBeVisible();
  });
});
