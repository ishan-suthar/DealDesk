import type { Source } from '@/domain/types';

export interface Budget {
  maxSearches: number;
  maxFetches: number;
  remainingSearches: number;
  remainingFetches: number;
}

export interface JobLogEvent {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
}

export interface JobContext {
  today: string;
  signal: AbortSignal;
  budget: Budget;
  log: (event: JobLogEvent) => void;
}

export type GatherEvent =
  | { type: 'stage'; stage: string; progress?: number }
  | {
      type: 'evidence';
      item: {
        url: string;
        title: string;
        publisher?: string;
        publishedAt?: string;
        text: string;
        via: Source['retrievedVia'];
      };
    }
  | { type: 'warning'; message: string };

export interface GatherRequest {
  kind: 'discovery' | 'deep_research';
  dealId?: string;
  queryVariants?: string[];
  filters?: Record<string, unknown>;
}

export interface ExtractRequest<T = unknown> {
  kind: 'discovery' | 'deep_section';
  sectionKey?: string;
  sourcePack: Source[];
  schemaHint?: string;
  dealContext?: Record<string, unknown>;
}

export interface ResearchProvider {
  readonly id: 'demo' | 'anthropic' | 'gemini' | 'failing_test';
  gather(req: GatherRequest, ctx: JobContext): AsyncIterable<GatherEvent>;
  extract<T>(req: ExtractRequest<T>, ctx: JobContext): Promise<unknown>;
}
