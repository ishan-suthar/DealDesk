import { test, expect } from '@playwright/test';

test.describe('AC8: Deal Research Export (DOCX & Markdown)', () => {
  test('exports DOCX and Markdown with full template layout, legend, and non-empty content', async ({ page, request }) => {
    // 1. Visit research page and select saved deal
    await page.goto('/research');

    const leftRail = page.locator('aside');
    const harborlineCard = leftRail.getByText('Harborline Foods').first();
    await expect(harborlineCard).toBeVisible();
    await harborlineCard.click();

    // 2. Wait for report to load
    await expect(page.getByText('Deep Research Report')).toBeVisible();

    // 3. Test DOCX API endpoint directly
    const docxResponse = await request.get('/api/export/deal-1?format=docx');
    expect(docxResponse.status()).toBe(200);

    const docxContentType = docxResponse.headers()['content-type'];
    expect(docxContentType).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    const docxDisposition = docxResponse.headers()['content-disposition'];
    expect(docxDisposition).toContain('attachment');
    expect(docxDisposition).toContain('.docx');

    const docxBody = await docxResponse.body();
    expect(docxBody.length).toBeGreaterThan(2000); // Non-empty Word document

    // 4. Test Markdown API endpoint directly
    const mdResponse = await request.get('/api/export/deal-1?format=markdown');
    expect(mdResponse.status()).toBe(200);

    const mdContentType = mdResponse.headers()['content-type'];
    expect(mdContentType).toContain('text/markdown');

    const mdText = await mdResponse.text();
    expect(mdText).toContain('# Deal Desk: Harborline Foods to acquire Maple Crest Snacks');
    expect(mdText).toContain('## Render-State Legend');
    expect(mdText).toContain('## 1. Deal Snapshot');
    expect(mdText).toContain('## 2. Company Overview');
    expect(mdText).toContain('## 3. Deal Summary & Mechanics');
    expect(mdText).toContain('## 4. Rationale & Judgment');
    expect(mdText).toContain("## Nikita's Notebook");
    expect(mdText).toContain('## 5. Sources and Research Gaps');
    expect(mdText).toContain('Consolidated Sources');

    // 5. Test Export menu UI on the report header
    const exportButton = page.getByRole('button', { name: 'Report export and options' });
    await expect(exportButton).toBeVisible();
    await exportButton.click();

    const docxMenuItem = page.getByText('Export DOCX (Word)');
    await expect(docxMenuItem).toBeVisible();

    const mdMenuItem = page.getByText('Export Markdown');
    await expect(mdMenuItem).toBeVisible();
  });
});
