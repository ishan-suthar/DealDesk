import type { Deal, ResearchReport, Source, Note } from '@/domain/types';
import { TEMPLATE_DEFINITIONS, type TemplateSectionKey } from '@/domain/template';

export interface ExportLegendItem {
  status: string;
  label: string;
  meaning: string;
}

export interface ExportSourceItem {
  index: number;
  id: string;
  title: string;
  publisher: string;
  publishedAt?: string;
  url: string;
  sourceType: string;
}

export interface ExportFieldValue {
  fieldKey: string;
  label: string;
  displayValue: string;
  valueStatus: string;
  statusLabel: string;
  footnotes: number[];
  isAnalysis?: boolean;
}

export interface ExportSection {
  key: string;
  label: string;
  fields: ExportFieldValue[];
}

export interface ExportNoteItem {
  id: string;
  quote?: string;
  comment: string;
  pinned: boolean;
  blockId?: string;
  reportVersionId?: string;
  isEarlierVersion?: boolean;
  createdAt: string;
  sourceFootnotes: number[];
}

export interface ExportNoteGroup {
  sectionKey: string;
  sectionLabel: string;
  notes: ExportNoteItem[];
}

export interface ExportDocument {
  title: string;
  dealHeadline: string;
  exportDate: string;
  reportVersion: number;
  isDemoData: boolean;
  displayName: string;
  legend: ExportLegendItem[];
  sections: ExportSection[];
  notebook: {
    title: string;
    groups: ExportNoteGroup[];
  };
  sourcesAndGaps: {
    sources: ExportSourceItem[];
    openQuestions: string[];
    metadata: {
      provider: string;
      model: string;
      promptVersion: string;
      researchedAt: string;
    };
  };
}

export const VALUE_STATUS_LABELS: Record<string, { label: string; meaning: string }> = {
  verified: {
    label: 'Verified',
    meaning: 'Stated by at least one primary source',
  },
  reported: {
    label: 'Reported',
    meaning: 'Stated by secondary/contextual sources only, or deal is rumored',
  },
  estimate: {
    label: 'Estimate',
    meaning: 'Source labels it as an estimate, projection, or consensus',
  },
  conflicting: {
    label: 'Conflicting sources',
    meaning: 'Sources disagree on the same metric; all values shown',
  },
  not_publicly_disclosed: {
    label: 'Not publicly disclosed',
    meaning: 'A source says it is undisclosed, or the item is confidential by nature and unsourced',
  },
  not_found: {
    label: 'Not available from reviewed sources',
    meaning: 'Not located in the reviewed sources',
  },
};

export interface BuildExportDocumentParams {
  deal: Deal;
  report: ResearchReport;
  sources: Source[];
  notes: Note[];
  allReports?: ResearchReport[];
  displayName?: string;
  exportDate?: string;
}

export function buildExportDocument({
  deal,
  report,
  sources,
  notes,
  allReports = [],
  displayName = 'Nikita',
  exportDate = new Date().toISOString().split('T')[0],
}: BuildExportDocumentParams): ExportDocument {
  // 1. Build consolidated source map: sourceId -> 1-based footnote index
  const sourceIdToFootnote = new Map<string, number>();
  const exportSources: ExportSourceItem[] = [];

  // Register sources that exist in `sources`
  sources.forEach((s) => {
    if (!sourceIdToFootnote.has(s.id)) {
      const idx = exportSources.length + 1;
      sourceIdToFootnote.set(s.id, idx);
      exportSources.push({
        index: idx,
        id: s.id,
        title: s.title,
        publisher: s.publisher,
        publishedAt: s.publishedAt,
        url: s.url,
        sourceType: s.sourceType,
      });
    }
  });

  // Ensure any source ID cited in report.sourceIds is indexed
  report.sourceIds?.forEach((sid) => {
    if (!sourceIdToFootnote.has(sid)) {
      const idx = exportSources.length + 1;
      sourceIdToFootnote.set(sid, idx);
      exportSources.push({
        index: idx,
        id: sid,
        title: `Source ${sid}`,
        publisher: 'Reviewed Source',
        url: `https://example.com/demo/source/${sid}`,
        sourceType: 'secondary',
      });
    }
  });

  const getFootnotes = (sourceIds?: string[]): number[] => {
    if (!sourceIds || sourceIds.length === 0) return [];
    return sourceIds
      .map((id) => sourceIdToFootnote.get(id))
      .filter((n): n is number => n !== undefined)
      .sort((a, b) => a - b);
  };

  // 2. Build Legend
  const legend: ExportLegendItem[] = Object.entries(VALUE_STATUS_LABELS).map(([status, info]) => ({
    status,
    label: info.label,
    meaning: info.meaning,
  }));

  // 3. Process Sections 1-4 from TEMPLATE_DEFINITIONS
  const sections: ExportSection[] = [];
  const reportSectionsMap = new Map(report.sections.map((s) => [s.key, s.fields]));

  for (const def of TEMPLATE_DEFINITIONS) {
    if (def.key === 'sources') continue; // Handled separately in section 5

    const sectionFieldsData = (reportSectionsMap.get(def.key) || {}) as Record<string, any>;
    const exportFields: ExportFieldValue[] = [];

    if (def.key === 'companies') {
      // Company Overview matrix: Acquirer / Target rows
      const buyerData = sectionFieldsData.buyer || {};
      const targetData = sectionFieldsData.target || {};

      for (const fieldDef of def.fields) {
        // Buyer cell
        const buyerVal = buyerData[fieldDef.key];
        exportFields.push(formatExportCell(fieldDef.label + ' (Buyer)', fieldDef.rule, buyerVal, getFootnotes));

        // Target cell
        const targetVal = targetData[fieldDef.key];
        exportFields.push(formatExportCell(fieldDef.label + ' (Target)', fieldDef.rule, targetVal, getFootnotes));
      }
    } else {
      // Standard section fields
      for (const fieldDef of def.fields) {
        const rawVal = sectionFieldsData[fieldDef.key];
        exportFields.push(formatExportCell(fieldDef.label, fieldDef.rule, rawVal, getFootnotes));
      }
    }

    sections.push({
      key: def.key,
      label: def.label,
      fields: exportFields,
    });
  }

  // 4. Notebook notes grouping
  // Group in order: snapshot, companies, mechanics, rationale, sources, then general
  const sectionKeysOrder: (string)[] = ['snapshot', 'companies', 'mechanics', 'rationale', 'sources', 'general'];
  const notesBySection: Record<string, ExportNoteItem[]> = {
    snapshot: [],
    companies: [],
    mechanics: [],
    rationale: [],
    sources: [],
    general: [],
  };

  // Determine latest report version for checking earlier version tag
  const latestReportVersion = allReports.length > 0 ? Math.max(...allReports.map((r) => r.version)) : report.version;

  // Filter notes relevant to this deal (or unassigned if deal matches)
  const dealNotes = notes.filter((n) => !n.dealId || n.dealId === deal.id);

  dealNotes.forEach((n) => {
    const groupKey = n.templateSection && sectionKeysOrder.includes(n.templateSection) ? n.templateSection : 'general';
    const isEarlier = Boolean(n.reportVersionId && n.reportVersionId !== report.id && report.version < latestReportVersion);

    notesBySection[groupKey].push({
      id: n.id,
      quote: n.quote,
      comment: n.comment,
      pinned: Boolean(n.pinned),
      blockId: n.blockId,
      reportVersionId: n.reportVersionId,
      isEarlierVersion: isEarlier,
      createdAt: n.createdAt,
      sourceFootnotes: getFootnotes(n.sourceIds),
    });
  });

  // Sort notes: pinned first, then position/createdAt
  const notebookGroups: ExportNoteGroup[] = [];
  const sectionLabels: Record<string, string> = {
    snapshot: 'Deal Snapshot',
    companies: 'Company Overview',
    mechanics: 'Deal Summary & Mechanics',
    rationale: 'Rationale & Judgment',
    sources: 'Sources & Research Gaps',
    general: 'General Notes',
  };

  sectionKeysOrder.forEach((secKey) => {
    const groupNotes = notesBySection[secKey];
    if (groupNotes.length > 0) {
      groupNotes.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      notebookGroups.push({
        sectionKey: secKey,
        sectionLabel: sectionLabels[secKey] || secKey,
        notes: groupNotes,
      });
    }
  });

  return {
    title: `Deal Desk: ${deal.headline}`,
    dealHeadline: deal.headline,
    exportDate,
    reportVersion: report.version,
    isDemoData: deal.origin === 'demo',
    displayName,
    legend,
    sections,
    notebook: {
      title: `${displayName}'s Notebook`,
      groups: notebookGroups,
    },
    sourcesAndGaps: {
      sources: exportSources,
      openQuestions: report.openQuestions || [],
      metadata: {
        provider: report.provider,
        model: report.model,
        promptVersion: report.promptVersion,
        researchedAt: report.createdAt,
      },
    },
  };
}

function formatExportCell(
  label: string,
  rule: string,
  val: any,
  getFootnotes: (ids?: string[]) => number[]
): ExportFieldValue {
  const isDefaultUndisclosed = rule.includes('D');
  const defaultStatus = isDefaultUndisclosed ? 'not_publicly_disclosed' : 'not_found';
  const defaultLabel = isDefaultUndisclosed ? 'Not publicly disclosed' : 'Not available from reviewed sources';

  if (!val) {
    return {
      fieldKey: label,
      label,
      displayValue: defaultLabel,
      valueStatus: defaultStatus,
      statusLabel: defaultLabel,
      footnotes: [],
    };
  }

  // If array of claims (e.g. buyerRationale, talkingPoints, transactionComps)
  if (Array.isArray(val)) {
    if (val.length === 0) {
      return {
        fieldKey: label,
        label,
        displayValue: defaultLabel,
        valueStatus: defaultStatus,
        statusLabel: defaultLabel,
        footnotes: [],
      };
    }

    const textParts: string[] = [];
    const allSourceIds = new Set<string>();
    let hasAnalysis = false;

    val.forEach((item: any) => {
      if (typeof item === 'string') {
        textParts.push(item);
      } else if (item.text) {
        textParts.push(item.text);
        if (item.claimType === 'analysis') hasAnalysis = true;
        item.sourceIds?.forEach((s: string) => allSourceIds.add(s));
      }
    });

    const footnotes = getFootnotes(Array.from(allSourceIds));
    return {
      fieldKey: label,
      label,
      displayValue: textParts.join('\n\n'),
      valueStatus: hasAnalysis ? 'analysis' : 'verified',
      statusLabel: hasAnalysis ? 'Analysis — not investment advice' : 'Verified',
      footnotes,
      isAnalysis: hasAnalysis,
    };
  }

  // If FactValue object
  if (typeof val === 'object') {
    const status = val.valueStatus || defaultStatus;
    const statusInfo = VALUE_STATUS_LABELS[status];
    const statusLabel = statusInfo ? statusInfo.label : status;

    if (status === 'not_found' || status === 'not_publicly_disclosed') {
      return {
        fieldKey: label,
        label,
        displayValue: statusInfo ? statusInfo.label : defaultLabel,
        valueStatus: status,
        statusLabel: statusInfo ? statusInfo.label : defaultLabel,
        footnotes: [],
      };
    }

    const display = val.display || (val.value !== undefined ? String(val.value) : defaultLabel);
    const footnotes = getFootnotes(val.sourceIds);

    return {
      fieldKey: label,
      label,
      displayValue: display,
      valueStatus: status,
      statusLabel,
      footnotes,
      isAnalysis: rule.includes('A'),
    };
  }

  // Primitive string / number
  return {
    fieldKey: label,
    label,
    displayValue: String(val),
    valueStatus: 'verified',
    statusLabel: 'Verified',
    footnotes: [],
  };
}
