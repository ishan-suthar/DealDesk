import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import type {
  FactValue,
  Money,
  QuickPreview,
  ReportSection,
  SearchFilters,
  DataOrigin,
  SourceType,
  TransactionStatus,
  UserStatus,
  JobStatus,
} from '@/domain/types';

export const settingsTable = sqliteTable('settings', {
  id: text('id').primaryKey().$default(() => 'default'),
  displayName: text('display_name').notNull().default('Nikita'),
  researchMode: text('research_mode').notNull().default('demo'),
  updatedAt: text('updated_at').notNull(),
});

export const companiesTable = sqliteTable('companies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  aliases: text('aliases', { mode: 'json' }).$type<string[]>().notNull(),
  ticker: text('ticker'),
  exchange: text('exchange'),
  cik: text('cik'),
  hqCountry: text('hq_country'),
  isSponsor: integer('is_sponsor', { mode: 'boolean' }).notNull(),
  createdAt: text('created_at').notNull(),
});

export const sourcesTable = sqliteTable('sources', {
  id: text('id').primaryKey(),
  jobId: text('job_id').notNull(),
  origin: text('origin').$type<DataOrigin>().notNull(),
  url: text('url').notNull(),
  publisher: text('publisher').notNull(),
  title: text('title').notNull(),
  publishedAt: text('published_at'),
  accessedAt: text('accessed_at').notNull(),
  sourceType: text('source_type').$type<SourceType>().notNull(),
  retrievedVia: text('retrieved_via').$type<'search_result' | 'fetch' | 'edgar' | 'fixture'>().notNull(),
  reliabilityNote: text('reliability_note'),
  excerpt: text('excerpt'),
});

export const dealsTable = sqliteTable('deals', {
  id: text('id').primaryKey(),
  origin: text('origin').$type<DataOrigin>().notNull(),
  dedupeKey: text('dedupe_key').notNull(),
  headline: text('headline').notNull(),
  sector: text('sector').notNull(),
  subsectors: text('subsectors', { mode: 'json' }).$type<string[]>().notNull(),
  geographyRegion: text('geography_region').$type<'US' | 'North America' | 'Europe' | 'Other'>().notNull(),
  buyerIds: text('buyer_ids', { mode: 'json' }).$type<string[]>().notNull(),
  targetIds: text('target_ids', { mode: 'json' }).$type<string[]>().notNull(),
  sellerIds: text('seller_ids', { mode: 'json' }).$type<string[]>().notNull(),
  announcementDate: text('announcement_date', { mode: 'json' }).$type<FactValue<string>>().notNull(),
  closingDate: text('closing_date', { mode: 'json' }).$type<FactValue<string>>().notNull(),
  transactionStatus: text('transaction_status').$type<TransactionStatus>().notNull(),
  transactionStatusSourceIds: text('transaction_status_source_ids', { mode: 'json' }).$type<string[]>().notNull(),
  userStatus: text('user_status').$type<UserStatus>().notNull(),
  statusBeforeDelete: text('status_before_delete').$type<Exclude<UserStatus, 'deleted'>>(),
  dealValue: text('deal_value', { mode: 'json' }).$type<FactValue<Money>>().notNull(),
  quickPreview: text('quick_preview', { mode: 'json' }).$type<QuickPreview>().notNull(),
  ranking: text('ranking', { mode: 'json' }).$type<{
    score: number;
    features: Record<string, number>;
    reasons: string[];
  }>().notNull(),
  firstSeenRunId: text('first_seen_run_id').notNull(),
  searchRunIds: text('search_run_ids', { mode: 'json' }).$type<string[]>().notNull(),
  deletedAt: text('deleted_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const researchReportsTable = sqliteTable('research_reports', {
  id: text('id').primaryKey(),
  dealId: text('deal_id').notNull(),
  version: integer('version').notNull(),
  jobId: text('job_id').notNull(),
  createdAt: text('created_at').notNull(),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  promptVersion: text('prompt_version').notNull(),
  sections: text('sections', { mode: 'json' }).$type<ReportSection[]>().notNull(),
  openQuestions: text('open_questions', { mode: 'json' }).$type<string[]>().notNull(),
  sourceIds: text('source_ids', { mode: 'json' }).$type<string[]>().notNull(),
});

export const notesTable = sqliteTable('notes', {
  id: text('id').primaryKey(),
  dealId: text('deal_id'),
  templateSection: text('template_section'),
  quote: text('quote'),
  blockId: text('block_id'),
  coveredBlockIds: text('covered_block_ids', { mode: 'json' }).$type<string[]>().notNull(),
  sourceIds: text('source_ids', { mode: 'json' }).$type<string[]>().notNull(),
  reportVersionId: text('report_version_id'),
  comment: text('comment').notNull(),
  pinned: integer('pinned', { mode: 'boolean' }).notNull().default(false),
  position: integer('position').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const searchRunsTable = sqliteTable('search_runs', {
  id: text('id').primaryKey(),
  filters: text('filters', { mode: 'json' }).$type<SearchFilters>().notNull(),
  provider: text('provider').notNull(),
  origin: text('origin').$type<DataOrigin>().notNull(),
  jobId: text('job_id').notNull(),
  resultDealIds: text('result_deal_ids', { mode: 'json' }).$type<string[]>().notNull(),
  excluded: text('excluded', { mode: 'json' }).$type<{ reason: string; label: string }[]>().notNull(),
  startedAt: text('started_at').notNull(),
  finishedAt: text('finished_at'),
});

export const jobsTable = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  kind: text('kind').$type<'discovery' | 'deep_research'>().notNull(),
  dealId: text('deal_id'),
  status: text('status').$type<JobStatus>().notNull(),
  stage: text('stage'),
  progress: integer('progress').notNull().default(0),
  startedAt: text('started_at'),
  heartbeatAt: text('heartbeat_at'),
  finishedAt: text('finished_at'),
  error: text('error', { mode: 'json' }).$type<{ code: string; message: string }>(),
  usage: text('usage', { mode: 'json' }).$type<{
    searches: number;
    fetches: number;
    inputTokens: number;
    outputTokens: number;
  }>().notNull(),
  createdAt: text('created_at').notNull(),
});
