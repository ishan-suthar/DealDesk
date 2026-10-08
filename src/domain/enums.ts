export const ValueStatus = [
  'verified',
  'reported',
  'estimate',
  'conflicting',
  'not_publicly_disclosed',
  'not_found',
] as const;
export type ValueStatus = (typeof ValueStatus)[number];

export const SourceType = [
  'primary',
  'strong_secondary',
  'contextual',
  'discovery',
] as const;
export type SourceType = (typeof SourceType)[number];

export const TransactionStatus = [
  'rumored',
  'pending',
  'closed',
  'terminated',
  'unknown',
] as const;
export type TransactionStatus = (typeof TransactionStatus)[number];

export const UserStatus = [
  'discovered',
  'review',
  'saved',
  'deleted',
] as const;
export type UserStatus = (typeof UserStatus)[number];

export const ClaimType = ['fact', 'analysis'] as const;
export type ClaimType = (typeof ClaimType)[number];

export const ValueType = [
  'equity_value',
  'enterprise_value',
  'purchase_price',
  'unknown',
] as const;
export type ValueType = (typeof ValueType)[number];

export const JobStatus = [
  'queued',
  'running',
  'succeeded',
  'failed',
  'cancelled',
] as const;
export type JobStatus = (typeof JobStatus)[number];

export const DataOrigin = ['demo', 'live'] as const;
export type DataOrigin = (typeof DataOrigin)[number];

export const TimeWindow = ['30d', '90d', '12m', 'custom'] as const;
export type TimeWindow = (typeof TimeWindow)[number];

export const GeographyRegion = ['US', 'North America', 'Europe', 'Global'] as const;
export type GeographyRegion = (typeof GeographyRegion)[number];

export const DealCountOption = [5, 10, 15, 25] as const;
export type DealCountOption = (typeof DealCountOption)[number];

export const DealStatusFilter = ['any', 'pending', 'closed', 'terminated'] as const;
export type DealStatusFilter = (typeof DealStatusFilter)[number];

export const VALUE_STATUS_LABELS: Record<ValueStatus, string> = {
  verified: 'Verified',
  reported: 'Reported',
  estimate: 'Estimate',
  conflicting: 'Conflicting sources',
  not_publicly_disclosed: 'Not publicly disclosed',
  not_found: 'Not available from reviewed sources',
};

export const VALUE_STATUS_DESCRIPTIONS: Record<ValueStatus, string> = {
  verified: 'Stated by at least one primary source',
  reported: 'Stated by secondary/contextual sources only, or deal is rumored',
  estimate: 'Source labels it as an estimate, projection, or consensus',
  conflicting: 'Sources disagree on the same metric; all values shown',
  not_publicly_disclosed: 'A source says it is undisclosed, or the item is confidential by nature and unsourced',
  not_found: 'Not located in the reviewed sources',
};
