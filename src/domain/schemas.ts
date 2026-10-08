import { z } from 'zod';
import {
  ValueStatus,
  SourceType,
  TransactionStatus,
  UserStatus,
  ClaimType,
  ValueType,
  JobStatus,
  DataOrigin,
  TimeWindow,
  GeographyRegion,
} from './enums';
import { TEMPLATE_SECTIONS } from './template';

export const ValueStatusSchema = z.enum(ValueStatus);
export const SourceTypeSchema = z.enum(SourceType);
export const TransactionStatusSchema = z.enum(TransactionStatus);
export const UserStatusSchema = z.enum(UserStatus);
export const ClaimTypeSchema = z.enum(ClaimType);
export const ValueTypeSchema = z.enum(ValueType);
export const JobStatusSchema = z.enum(JobStatus);
export const DataOriginSchema = z.enum(DataOrigin);
export const TimeWindowSchema = z.enum(TimeWindow);
export const GeographyRegionSchema = z.enum(GeographyRegion);

export const RetrievedViaSchema = z.enum(['search_result', 'fetch', 'edgar', 'fixture']);

export const SourceSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  origin: DataOriginSchema,
  url: z.string().url(),
  publisher: z.string(),
  title: z.string(),
  publishedAt: z.string().optional(),
  accessedAt: z.string(),
  sourceType: SourceTypeSchema,
  retrievedVia: RetrievedViaSchema,
  reliabilityNote: z.string().optional(),
  excerpt: z.string().max(300).optional(),
});

export function makeFactValueSchema<T extends z.ZodTypeAny>(valueSchema: T) {
  return z.object({
    value: valueSchema.optional(),
    display: z.string().optional(),
    valueStatus: ValueStatusSchema,
    sourceIds: z.array(z.string()),
    asOf: z.string().optional(),
    alternatives: z
      .array(
        z.object({
          value: valueSchema,
          display: z.string(),
          sourceIds: z.array(z.string()),
          note: z.string().optional(),
        })
      )
      .optional(),
    calc: z
      .object({
        formula: z.string(),
        inputs: z.array(
          z.object({
            label: z.string(),
            value: z.number(),
            sourceIds: z.array(z.string()),
            period: z.string().optional(),
          })
        ),
      })
      .optional(),
    note: z.string().optional(),
  });
}

export const GenericFactValueSchema = makeFactValueSchema(z.unknown());
export const StringFactValueSchema = makeFactValueSchema(z.string());
export const NumberFactValueSchema = makeFactValueSchema(z.number());

export const MoneySchema = z.object({
  amount: z.number(),
  currency: z.string(),
  unit: z.enum(['units', 'thousands', 'millions', 'billions']),
  valueType: ValueTypeSchema,
});

export const MoneyFactValueSchema = makeFactValueSchema(MoneySchema);

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  aliases: z.array(z.string()),
  ticker: z.string().optional(),
  exchange: z.string().optional(),
  cik: z.string().optional(),
  hqCountry: z.string().optional(),
  isSponsor: z.boolean(),
});

export const AdviserSchema = z.object({
  firm: z.string(),
  role: z.enum(['financial', 'legal', 'other']),
  side: z.enum(['buyer', 'target', 'seller', 'unknown']),
  sourceIds: z.array(z.string()),
});

export const ClaimSchema = z.object({
  id: z.string(),
  text: z.string(),
  claimType: ClaimTypeSchema,
  sourceIds: z.array(z.string()),
  reasoning: z.string().optional(),
  confidence: z.enum(['high', 'medium', 'low']),
});

export const QuickPreviewSchema = z.object({
  summary: ClaimSchema,
  background: z.array(ClaimSchema),
  parties: z.array(
    z.object({
      companyId: z.string(),
      role: z.enum(['buyer', 'target', 'seller']),
      sourceIds: z.array(z.string()),
    })
  ),
  advisers: z.array(AdviserSchema),
  dealValue: MoneyFactValueSchema,
  multiples: z.array(
    z.object({
      label: z.string(),
      fact: NumberFactValueSchema,
    })
  ),
  timeline: z.array(ClaimSchema),
  differentiators: z.array(ClaimSchema),
  drivers: z.array(ClaimSchema),
  trendTags: z.array(z.string()),
  noveltyTags: z.array(z.string()),
  sourceIds: z.array(z.string()),
});

export const DealRankingSchema = z.object({
  score: z.number(),
  features: z.record(z.string(), z.number()),
  reasons: z.array(z.string()),
});

export const DealSchema = z.object({
  id: z.string(),
  origin: DataOriginSchema,
  dedupeKey: z.string(),
  headline: z.string(),
  sector: z.string(),
  subsectors: z.array(z.string()),
  geographyRegion: z.enum(['US', 'North America', 'Europe', 'Other']),
  buyerIds: z.array(z.string()),
  targetIds: z.array(z.string()),
  sellerIds: z.array(z.string()),
  announcementDate: StringFactValueSchema,
  closingDate: StringFactValueSchema,
  transactionStatus: TransactionStatusSchema,
  transactionStatusSourceIds: z.array(z.string()),
  userStatus: UserStatusSchema,
  statusBeforeDelete: z.enum(['discovered', 'review', 'saved']).optional(),
  dealValue: MoneyFactValueSchema,
  quickPreview: QuickPreviewSchema,
  ranking: DealRankingSchema,
  firstSeenRunId: z.string(),
  searchRunIds: z.array(z.string()),
  deletedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TemplateSectionKeySchema = z.enum([
  'snapshot',
  'companies',
  'mechanics',
  'rationale',
  'sources',
]);

export const ReportSectionSchema = z.object({
  key: TemplateSectionKeySchema,
  fields: z.record(z.string(), z.unknown()),
});

export const ResearchReportSchema = z.object({
  id: z.string(),
  dealId: z.string(),
  version: z.number(),
  jobId: z.string(),
  createdAt: z.string(),
  provider: z.string(),
  model: z.string(),
  promptVersion: z.string(),
  sections: z.array(ReportSectionSchema),
  openQuestions: z.array(z.string()),
  sourceIds: z.array(z.string()),
});

export const NoteSchema = z.object({
  id: z.string(),
  dealId: z.string().optional(),
  templateSection: TemplateSectionKeySchema.optional(),
  quote: z.string().max(2000).optional(),
  blockId: z.string().optional(),
  coveredBlockIds: z.array(z.string()),
  sourceIds: z.array(z.string()),
  reportVersionId: z.string().optional(),
  comment: z.string(),
  pinned: z.boolean(),
  position: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SearchFiltersSchema = z.object({
  sector: z.string().min(1),
  subsectors: z.array(z.string()).default([]),
  timeWindow: TimeWindowSchema.default('90d'),
  customStartDate: z.string().optional(),
  customEndDate: z.string().optional(),
  maxDeals: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(25)]).default(10),
  dealStatus: z.enum(['any', 'pending', 'closed', 'terminated']).default('any'),
  includeRumored: z.boolean().default(false),
  geography: GeographyRegionSchema.default('US'),
});

export const SearchRunSchema = z.object({
  id: z.string(),
  filters: SearchFiltersSchema,
  provider: z.string(),
  origin: DataOriginSchema,
  startedAt: z.string(),
  finishedAt: z.string().optional(),
  jobId: z.string(),
  resultDealIds: z.array(z.string()),
  excluded: z.array(
    z.object({
      reason: z.string(),
      label: z.string(),
    })
  ),
});

export const JobUsageSchema = z.object({
  searches: z.number().default(0),
  fetches: z.number().default(0),
  inputTokens: z.number().default(0),
  outputTokens: z.number().default(0),
});

export const JobErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export const JobSchema = z.object({
  id: z.string(),
  kind: z.enum(['discovery', 'deep_research']),
  dealId: z.string().optional(),
  status: JobStatusSchema,
  stage: z.string().optional(),
  progress: z.number().min(0).max(100),
  startedAt: z.string().optional(),
  heartbeatAt: z.string().optional(),
  finishedAt: z.string().optional(),
  error: JobErrorSchema.optional(),
  usage: JobUsageSchema,
  createdAt: z.string(),
});

export const SettingsSchema = z.object({
  id: z.string().default('default'),
  displayName: z.string().min(1).default('Nikita'),
  researchMode: z.string().default('demo'),
  updatedAt: z.string(),
});
