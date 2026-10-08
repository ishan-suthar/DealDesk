import type { ExportDocument } from './buildExportDocument';

export function renderMarkdown(doc: ExportDocument): string {
  const lines: string[] = [];

  // Title & Subtitle
  lines.push(`# ${doc.title}`);
  lines.push('');
  const subtitleParts = [
    `**Export Date:** ${doc.exportDate}`,
    `**Report Version:** ${doc.reportVersion}`,
  ];
  if (doc.isDemoData) {
    subtitleParts.push(`**Demo data**`);
  }
  lines.push(subtitleParts.join(' | '));
  lines.push('');
  lines.push('---');
  lines.push('');

  // Render-State Legend
  lines.push('## Render-State Legend');
  lines.push('');
  lines.push('| Status | Meaning |');
  lines.push('|---|---|');
  doc.legend.forEach((item) => {
    lines.push(`| **${item.label}** | ${item.meaning} |`);
  });
  lines.push('');
  lines.push('---');
  lines.push('');

  // Sections 1–4
  doc.sections.forEach((sec, idx) => {
    lines.push(`## ${idx + 1}. ${sec.label}`);
    lines.push('');

    sec.fields.forEach((field) => {
      const footnoteStr =
        field.footnotes.length > 0 ? ` [${field.footnotes.map((f) => `^${f}`).join(', ')}]` : '';
      const analysisBadge = field.isAnalysis ? ' *(Analysis — not investment advice)*' : '';

      lines.push(`### ${field.label}`);
      lines.push(`*Status:* **${field.statusLabel}**${analysisBadge}${footnoteStr}`);
      lines.push('');
      lines.push(field.displayValue);
      lines.push('');
    });

    lines.push('---');
    lines.push('');
  });

  // Notebook
  lines.push(`## ${doc.notebook.title}`);
  lines.push('');

  if (doc.notebook.groups.length === 0) {
    lines.push('*No notes saved for this deal.*');
    lines.push('');
  } else {
    doc.notebook.groups.forEach((group) => {
      lines.push(`### ${group.sectionLabel}`);
      lines.push('');

      group.notes.forEach((note) => {
        if (note.pinned) {
          lines.push(`📌 **Pinned Note**`);
        }
        if (note.quote) {
          const fnStr =
            note.sourceFootnotes.length > 0
              ? ` [${note.sourceFootnotes.map((f) => `^${f}`).join(', ')}]`
              : '';
          lines.push(`> "${note.quote}"${fnStr}`);
          lines.push('');
        }
        if (note.isEarlierVersion) {
          lines.push(`*(From an earlier report version)*`);
          lines.push('');
        }
        lines.push(`**Comment:** ${note.comment || '*(No comment added)*'}`);
        lines.push('');
      });
    });
  }

  lines.push('---');
  lines.push('');

  // Sources and Gaps
  lines.push('## 5. Sources and Research Gaps');
  lines.push('');

  lines.push('### Consolidated Sources');
  lines.push('');
  if (doc.sourcesAndGaps.sources.length === 0) {
    lines.push('*No external sources recorded.*');
  } else {
    doc.sourcesAndGaps.sources.forEach((s) => {
      const pubDate = s.publishedAt ? ` (${s.publishedAt})` : '';
      lines.push(`[^${s.index}]: **${s.title}** — ${s.publisher}${pubDate}. [Link](${s.url})`);
    });
  }
  lines.push('');

  if (doc.sourcesAndGaps.openQuestions.length > 0) {
    lines.push('### Open Questions / Missing Data');
    lines.push('');
    doc.sourcesAndGaps.openQuestions.forEach((q) => {
      lines.push(`- ${q}`);
    });
    lines.push('');
  }

  lines.push('### Research Metadata');
  lines.push('');
  lines.push(`- **Provider:** ${doc.sourcesAndGaps.metadata.provider}`);
  lines.push(`- **Model:** ${doc.sourcesAndGaps.metadata.model}`);
  lines.push(`- **Prompt Version:** ${doc.sourcesAndGaps.metadata.promptVersion}`);
  lines.push(`- **Researched At:** ${doc.sourcesAndGaps.metadata.researchedAt}`);
  lines.push('');

  return lines.join('\n');
}
