import { z } from 'zod';
import {
  SourceSchema,
  CompanySchema,
  AdviserSchema,
  ClaimSchema,
  MoneySchema,
  QuickPreviewSchema,
  DealSchema,
  ReportSectionSchema,
  ResearchReportSchema,
  NoteSchema,
  SearchFiltersSchema,
  SearchRunSchema,
  JobSchema,
  JobUsageSchema,
  JobErrorSchema,
  SettingsSchema,
} from './schemas';
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
import { TemplateSectionKey } from './template';

export type {
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
  TemplateSectionKey,
};

export interface FactValue<T = unknown> {
  value?: T;
  display?: string;
  valueStatus: ValueStatus;
  sourceIds: string[];
  asOf?: string;
  alternatives?: { value: T; display: string; sourceIds: string[]; note?: string }[];
  calc?: { formula: string; inputs: { label: string; value: number; sourceIds: string[]; period?: string }[] };
  note?: string;
}

export type Source = z.infer<typeof SourceSchema>;
export type Company = z.infer<typeof CompanySchema>;
export type Adviser = z.infer<typeof AdviserSchema>;
export type Claim = z.infer<typeof ClaimSchema>;
export type Money = z.infer<typeof MoneySchema>;
export type QuickPreview = z.infer<typeof QuickPreviewSchema>;
export type Deal = z.infer<typeof DealSchema>;
export type ReportSection = z.infer<typeof ReportSectionSchema>;
export type ResearchReport = z.infer<typeof ResearchReportSchema>;
export type Note = z.infer<typeof NoteSchema>;
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;
export type SearchRun = z.infer<typeof SearchRunSchema>;
export type Job = z.infer<typeof JobSchema>;
export type JobUsage = z.infer<typeof JobUsageSchema>;
export type JobError = z.infer<typeof JobErrorSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
