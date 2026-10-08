import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from 'docx';
import type { ExportDocument } from './buildExportDocument';

export async function renderDocx(doc: ExportDocument): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      text: doc.title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 120 },
    })
  );

  // Subtitle
  const subText = [
    `Export Date: ${doc.exportDate}`,
    `Report Version: ${doc.reportVersion}`,
    doc.isDemoData ? 'Demo data' : '',
  ]
    .filter(Boolean)
    .join('  |  ');

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: subText,
          italics: true,
          color: '555555',
          size: 20,
        }),
      ],
      spacing: { after: 300 },
    })
  );

  // 1. Render-State Legend Table
  children.push(
    new Paragraph({
      text: 'Render-State Legend',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    })
  );

  const legendRows = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Status', bold: true })] })],
        }),
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Meaning', bold: true })] })],
        }),
      ],
    }),
    ...doc.legend.map(
      (item) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: item.label, bold: true })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: item.meaning })] })],
            }),
          ],
        })
    ),
  ];

  children.push(
    new Table({
      rows: legendRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  );

  children.push(new Paragraph({ spacing: { after: 300 } }));

  // 2. Sections 1–4
  doc.sections.forEach((sec, idx) => {
    children.push(
      new Paragraph({
        text: `${idx + 1}. ${sec.label}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 150 },
      })
    );

    sec.fields.forEach((field) => {
      const footnoteText =
        field.footnotes.length > 0 ? ` [${field.footnotes.map((f) => `^${f}`).join(', ')}]` : '';
      const analysisText = field.isAnalysis ? ' (Analysis — not investment advice)' : '';

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: field.label, bold: true, size: 22 }),
            new TextRun({
              text: `  [${field.statusLabel}${analysisText}]${footnoteText}`,
              italics: true,
              color: '666666',
              size: 18,
            }),
          ],
          spacing: { before: 100, after: 60 },
        })
      );

      // Value lines
      field.displayValue.split('\n\n').forEach((line) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: line, size: 20 })],
            spacing: { after: 80 },
          })
        );
      });
    });
  });

  // 3. Notebook
  children.push(
    new Paragraph({
      text: doc.notebook.title,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 150 },
    })
  );

  if (doc.notebook.groups.length === 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'No notes saved for this deal.', italics: true })],
        spacing: { after: 200 },
      })
    );
  } else {
    doc.notebook.groups.forEach((group) => {
      children.push(
        new Paragraph({
          text: group.sectionLabel,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      group.notes.forEach((note) => {
        const noteRuns: TextRun[] = [];
        if (note.pinned) {
          noteRuns.push(new TextRun({ text: '[Pinned] ', bold: true, color: 'B45309' }));
        }
        if (note.quote) {
          const fn =
            note.sourceFootnotes.length > 0
              ? ` [${note.sourceFootnotes.map((f) => `^${f}`).join(', ')}]`
              : '';
          noteRuns.push(new TextRun({ text: `"${note.quote}"${fn}\n`, italics: true, color: '1E293B' }));
        }
        if (note.isEarlierVersion) {
          noteRuns.push(
            new TextRun({ text: '(From an earlier report version)\n', italics: true, color: '94A3B8' })
          );
        }
        noteRuns.push(new TextRun({ text: `Comment: `, bold: true }));
        noteRuns.push(new TextRun({ text: note.comment || '(No comment added)' }));

        children.push(
          new Paragraph({
            children: noteRuns,
            spacing: { before: 80, after: 140 },
          })
        );
      });
    });
  }

  // 4. Sources and Research Gaps
  children.push(
    new Paragraph({
      text: '5. Sources and Research Gaps',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 150 },
    })
  );

  children.push(
    new Paragraph({
      text: 'Consolidated Sources',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 150, after: 100 },
    })
  );

  doc.sourcesAndGaps.sources.forEach((s) => {
    const pub = s.publishedAt ? ` (${s.publishedAt})` : '';
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `[${s.index}] `, bold: true }),
          new TextRun({ text: `${s.title} — ${s.publisher}${pub}. ` }),
          new TextRun({ text: s.url, italics: true, color: '0284C7' }),
        ],
        spacing: { after: 80 },
      })
    );
  });

  if (doc.sourcesAndGaps.openQuestions.length > 0) {
    children.push(
      new Paragraph({
        text: 'Open Questions / Missing Data',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    );
    doc.sourcesAndGaps.openQuestions.forEach((q) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${q}` })],
          spacing: { after: 60 },
        })
      );
    });
  }

  children.push(
    new Paragraph({
      text: 'Research Metadata',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    })
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Provider: ${doc.sourcesAndGaps.metadata.provider}  |  Model: ${doc.sourcesAndGaps.metadata.model}  |  Prompt: ${doc.sourcesAndGaps.metadata.promptVersion}  |  Researched: ${doc.sourcesAndGaps.metadata.researchedAt}`,
          italics: true,
          color: '64748B',
        }),
      ],
      spacing: { after: 200 },
    })
  );

  const document = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return await Packer.toBuffer(document);
}
