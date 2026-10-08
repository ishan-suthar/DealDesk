import { describe, it, expect } from 'vitest';
import { buildExportDocument, VALUE_STATUS_LABELS } from '@/server/services/export/buildExportDocument';
import { renderMarkdown } from '@/server/services/export/renderMarkdown';
import { renderDocx } from '@/server/services/export/renderDocx';
import { generateDemoFixtures } from '@/fixtures/demoDeals';
import { generateDemoReports } from '@/fixtures/demoReports';

describe('buildExportDocument and Exporters (AC8)', () => {
  const { deals, sources } = generateDemoFixtures();
  const deal = deals[0];
  const { reports, notes } = generateDemoReports();
  const report = reports[0];

  it('builds format-neutral ExportDocument following template section order', () => {
    const doc = buildExportDocument({
      deal,
      report,
      sources,
      notes,
      displayName: 'Nikita',
    });

    // Verify Title & Subtitle
    expect(doc.title).toContain(deal.headline);
    expect(doc.displayName).toBe('Nikita');
    expect(doc.isDemoData).toBe(true);

    // Verify Legend
    expect(doc.legend).toHaveLength(6);
    const legendKeys = doc.legend.map((l) => l.status);
    expect(legendKeys).toContain('verified');
    expect(legendKeys).toContain('reported');
    expect(legendKeys).toContain('estimate');
    expect(legendKeys).toContain('conflicting');
    expect(legendKeys).toContain('not_publicly_disclosed');
    expect(legendKeys).toContain('not_found');

    // Verify Sections 1–4 order
    expect(doc.sections).toHaveLength(4);
    expect(doc.sections[0].key).toBe('snapshot');
    expect(doc.sections[1].key).toBe('companies');
    expect(doc.sections[2].key).toBe('mechanics');
    expect(doc.sections[3].key).toBe('rationale');

    // Verify no field value lacks a status or statusLabel
    for (const section of doc.sections) {
      expect(section.fields.length).toBeGreaterThan(0);
      for (const field of section.fields) {
        expect(field.valueStatus).toBeTruthy();
        expect(field.statusLabel).toBeTruthy();
        expect(field.displayValue).toBeTruthy();
      }
    }
  });

  it('correctly handles missing or default-undisclosed fields with exact copy', () => {
    // Empty report sections
    const emptyReport = {
      ...report,
      sections: [],
    };

    const doc = buildExportDocument({
      deal,
      report: emptyReport,
      sources: [],
      notes: [],
    });

    const snapshot = doc.sections.find((s) => s.key === 'snapshot');
    expect(snapshot).toBeDefined();

    // Sourced field defaults to 'Not available from reviewed sources'
    const priceField = snapshot?.fields.find((f) => f.label === 'Price');
    expect(priceField?.displayValue).toBe('Not available from reviewed sources');
    expect(priceField?.statusLabel).toBe('Not available from reviewed sources');

    // Rationale section with synergies (rule S/D) defaults to 'Not publicly disclosed'
    const rationale = doc.sections.find((s) => s.key === 'rationale');
    const synergiesField = rationale?.fields.find((f) => f.label === 'Synergies (Revenue / Cost)');
    expect(synergiesField?.displayValue).toBe('Not publicly disclosed');
    expect(synergiesField?.statusLabel).toBe('Not publicly disclosed');
  });

  it('groups notes by template section with pinned notes first', () => {
    const customNotes = [
      {
        id: 'n1',
        dealId: deal.id,
        templateSection: 'snapshot' as any,
        quote: 'Unpinned quote in snapshot',
        comment: 'Comment 1',
        pinned: false,
        coveredBlockIds: [],
        sourceIds: ['S1'],
        position: 0,
        createdAt: '2026-03-01T10:00:00Z',
        updatedAt: '2026-03-01T10:00:00Z',
      },
      {
        id: 'n2',
        dealId: deal.id,
        templateSection: 'snapshot' as any,
        quote: 'Pinned quote in snapshot',
        comment: 'Comment 2',
        pinned: true,
        coveredBlockIds: [],
        sourceIds: ['S1'],
        position: 1,
        createdAt: '2026-03-01T09:00:00Z',
        updatedAt: '2026-03-01T09:00:00Z',
      },
      {
        id: 'n3',
        dealId: deal.id,
        templateSection: undefined,
        comment: 'General note without section',
        pinned: false,
        coveredBlockIds: [],
        sourceIds: [],
        position: 2,
        createdAt: '2026-03-01T11:00:00Z',
        updatedAt: '2026-03-01T11:00:00Z',
      },
    ];

    const doc = buildExportDocument({
      deal,
      report,
      sources,
      notes: customNotes,
      displayName: 'Nikita',
    });

    expect(doc.notebook.title).toBe("Nikita's Notebook");
    expect(doc.notebook.groups.length).toBe(2);

    const snapshotGroup = doc.notebook.groups.find((g) => g.sectionKey === 'snapshot');
    expect(snapshotGroup).toBeDefined();
    expect(snapshotGroup?.notes[0].pinned).toBe(true);
    expect(snapshotGroup?.notes[0].id).toBe('n2');
    expect(snapshotGroup?.notes[1].id).toBe('n1');

    const generalGroup = doc.notebook.groups.find((g) => g.sectionKey === 'general');
    expect(generalGroup).toBeDefined();
    expect(generalGroup?.notes[0].id).toBe('n3');
  });

  it('renders markdown export with all required sections and footnotes', () => {
    const doc = buildExportDocument({
      deal,
      report,
      sources,
      notes,
    });

    const md = renderMarkdown(doc);
    expect(md).toContain(`# Deal Desk: ${deal.headline}`);
    expect(md).toContain('## Render-State Legend');
    expect(md).toContain('## 1. Deal Snapshot');
    expect(md).toContain('## 2. Company Overview');
    expect(md).toContain('## 3. Deal Summary & Mechanics');
    expect(md).toContain('## 4. Rationale & Judgment');
    expect(md).toContain("## Nikita's Notebook");
    expect(md).toContain('## 5. Sources and Research Gaps');
    expect(md).toContain('### Consolidated Sources');
    expect(md).toContain('Demo data');
  });

  it('renders DOCX export buffer without throwing', async () => {
    const doc = buildExportDocument({
      deal,
      report,
      sources,
      notes,
    });

    const docxBuffer = await renderDocx(doc);
    expect(docxBuffer).toBeInstanceOf(Buffer);
    expect(docxBuffer.length).toBeGreaterThan(1000);
  });
});
