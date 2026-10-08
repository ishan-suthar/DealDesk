export type FieldRuleCode = 'S' | 'C' | 'A' | 'D' | 'M' | 'S/A' | 'C/M' | 'S/C' | 'S/M' | 'S/D';

export interface TemplateFieldDef {
  key: string;
  label: string;
  rule: FieldRuleCode;
  notes?: string;
  isCompanyMatrix?: boolean;
}

export interface TemplateSectionDef {
  key: TemplateSectionKey;
  label: string;
  description: string;
  fields: TemplateFieldDef[];
}

export const TEMPLATE_SECTIONS = [
  'snapshot',
  'companies',
  'mechanics',
  'rationale',
  'sources',
] as const;

export type TemplateSectionKey = (typeof TEMPLATE_SECTIONS)[number];

export const TEMPLATE_DEFINITIONS: TemplateSectionDef[] = [
  {
    key: 'snapshot',
    label: 'Deal Snapshot',
    description: 'High-level transaction summary and key financial metrics',
    fields: [
      { key: 'deal', label: 'Deal', rule: 'S', notes: '{Buyer} to acquire {Target} + transaction status' },
      { key: 'briefSummary', label: 'Brief Summary', rule: 'S/A', notes: '2–3 sentences; facts cited, framing marked Analysis' },
      { key: 'price', label: 'Price', rule: 'S', notes: 'Must state basis: equity purchase price, transaction EV, or other; currency' },
      { key: 'premium', label: 'Premium', rule: 'C/M', notes: 'One-day, 30-day, and to unaffected price; each with reference date' },
      { key: 'ebitdaMultiple', label: 'EBITDA Multiple', rule: 'S/C', notes: 'State LTM vs forward and the source of EBITDA' },
      { key: 'transactionComps', label: 'Transaction Comps', rule: 'S', notes: 'Comps named in fairness opinion, company materials, or media' },
      { key: 'buySideBanks', label: 'Buy-side Banks', rule: 'S', notes: 'Financial advisers to the buyer; legal advisers listed separately' },
      { key: 'sellSideBanks', label: 'Sell-side Banks', rule: 'S', notes: 'Financial advisers to target/seller; legal advisers listed separately' },
      { key: 'buyerRationale', label: 'Buyer Rationale', rule: 'S', notes: 'As stated by buyer or sourced reporting' },
      { key: 'sellerRationale', label: 'Seller Rationale', rule: 'S/A', notes: 'As stated or sourced; analysis marked' },
      {
        key: 'analystView',
        label: 'Analyst View on Price',
        rule: 'A',
        notes: 'Weighs cited evidence. If insufficient, exactly "Insufficient evidence to assess." Never advice.',
      },
      {
        key: 'talkingPoints',
        label: 'Coffee-chat Talking Points',
        rule: 'A',
        notes: '3 short points tied to cited facts: what is distinctive, trend illustrated, smart question',
      },
    ],
  },
  {
    key: 'companies',
    label: 'Company Overview',
    description: 'Side-by-side Buyer and Target profiles (and Seller for carve-outs)',
    fields: [
      { key: 'business', label: 'Business', rule: 'S', notes: 'One sentence description', isCompanyMatrix: true },
      { key: 'ceo', label: 'CEO', rule: 'S', notes: 'As of latest source with date', isCompanyMatrix: true },
      { key: 'marketCapOrEv', label: 'Market Cap / EV', rule: 'M', notes: 'With asOf; private = not_publicly_disclosed', isCompanyMatrix: true },
      { key: 'revenueTtm', label: 'Revenue (TTM / FY)', rule: 'S', notes: 'Label period exactly as source does', isCompanyMatrix: true },
      { key: 'ebitdaMargin', label: 'EBITDA / Margin', rule: 'S/C', notes: 'Margin computed only when EBITDA & revenue share period', isCompanyMatrix: true },
      { key: 'headquarters', label: 'Headquarters', rule: 'S', notes: 'City, Country', isCompanyMatrix: true },
      {
        key: 'earnings',
        label: 'Earnings / EPS',
        rule: 'S',
        notes: 'Rolling 3 fiscal years ending with current FY. Actual or Estimate.',
        isCompanyMatrix: true,
      },
    ],
  },
  {
    key: 'mechanics',
    label: 'Deal Summary & Mechanics',
    description: 'Structure, financing, valuation multiples, and timing',
    fields: [
      { key: 'dealType', label: 'Type of Deal', rule: 'S', notes: 'Merger, acquisition, tender offer, carve-out, etc.' },
      { key: 'announcement', label: 'Announcement Date & Market Reaction', rule: 'S/M', notes: 'Date verified; reaction only if reported' },
      { key: 'exchangeRatio', label: 'Exchange Ratio', rule: 'S', notes: 'For stock consideration; else Not applicable (all-cash)' },
      { key: 'cashStockMix', label: 'Cash / Stock Mix', rule: 'S', notes: 'Per-share and aggregate if stated' },
      { key: 'postDealStructure', label: 'Post-deal Structure', rule: 'S', notes: 'Ownership split, board, operating structure' },
      { key: 'multiplesAtAnnouncement', label: 'Multiples at Announcement', rule: 'S/C', notes: 'Equity Value, EV, EV/Rev, EV/EBITDA, etc.' },
      { key: 'closingDate', label: 'Closing Date', rule: 'S', notes: 'Actual (closed) or expected (pending)' },
      { key: 'multiplesAtClose', label: 'Multiples at Close', rule: 'S/C', notes: 'Only if >5% different from announcement' },
      { key: 'premiumPaid', label: 'Premium Paid', rule: 'C/M', notes: 'One-day, 30-day, unaffected premiums' },
      { key: 'debtAssumed', label: 'Debt Assumed', rule: 'S', notes: 'Debt assumed and financing commitments' },
      { key: 'competitors', label: 'Competitors', rule: 'S', notes: 'From company filings or reputable sources' },
      { key: 'accretionDilution', label: 'Dilution / Accretion', rule: 'S', notes: 'Only as stated by company/analysts; never computed' },
      { key: 'advisersAndFees', label: 'Financial Advisors & Fees', rule: 'S/D', notes: 'Fees not_publicly_disclosed unless filed' },
    ],
  },
  {
    key: 'rationale',
    label: 'Rationale & Judgment',
    description: 'Strategic logic, synergies, risks, and price evaluation',
    fields: [
      { key: 'acquirerRationale', label: 'Acquirer Rationale', rule: 'S', notes: 'Strategic rationale stated by acquirer' },
      { key: 'targetRationale', label: 'Target Rationale', rule: 'S/A', notes: 'Target board rationale' },
      { key: 'synergies', label: 'Synergies (Revenue / Cost)', rule: 'S/D', notes: 'Figures only if stated, else not_publicly_disclosed' },
      { key: 'risks', label: 'Risks', rule: 'S/A', notes: 'Execution, regulatory, financing, integration, etc.' },
      {
        key: 'priceReasonableness',
        label: 'Is the Price Reasonable?',
        rule: 'A',
        notes: 'Proxy fairness opinions, cited comps. No DCF performed. Limitations box.',
      },
      { key: 'relatedTransactions', label: 'Other Related Transactions', rule: 'S', notes: 'Cited precedent or parallel transactions' },
    ],
  },
  {
    key: 'sources',
    label: 'Sources & Research Gaps',
    description: 'Full bibliography, open questions, and audit trail',
    fields: [
      { key: 'sourceList', label: 'Consolidated Sources', rule: 'S', notes: 'All primary and secondary sources cited' },
      { key: 'openQuestions', label: 'Open Questions / Missing Data', rule: 'A', notes: 'Information gaps identified during research' },
      { key: 'metadata', label: 'Research Metadata', rule: 'S', notes: 'Provider, model, prompt version, timestamp' },
    ],
  },
];

export type TemplateFieldKey = string;

export function getSectionDef(key: TemplateSectionKey): TemplateSectionDef | undefined {
  return TEMPLATE_DEFINITIONS.find((s) => s.key === key);
}

export function getAllFieldKeysForSection(key: TemplateSectionKey): string[] {
  const section = getSectionDef(key);
  return section ? section.fields.map((f) => f.key) : [];
}
