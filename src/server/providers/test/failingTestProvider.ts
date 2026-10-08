import type {
  ResearchProvider,
  GatherRequest,
  ExtractRequest,
  GatherEvent,
  JobContext,
} from '../types';

export type FailingMode = 'partial' | 'budget_reached' | 'no_results' | 'provider_error';

export class FailingTestProvider implements ResearchProvider {
  public readonly id = 'failing_test' as const;

  constructor(public mode: FailingMode = 'provider_error') {}

  async *gather(req: GatherRequest, ctx: JobContext): AsyncIterable<GatherEvent> {
    yield { type: 'stage', stage: 'Finding candidates', progress: 20 };

    if (this.mode === 'provider_error') {
      throw new Error('Simulated upstream provider outage (503 Service Unavailable)');
    }

    if (this.mode === 'budget_reached') {
      ctx.budget.remainingSearches = 0;
      yield { type: 'warning', message: 'Search budget for this run was reached; results may be incomplete.' };
      return;
    }

    if (this.mode === 'no_results') {
      yield { type: 'stage', stage: 'Checking primary sources', progress: 60 };
      yield { type: 'stage', stage: 'Ranking for interview usefulness', progress: 100 };
      return;
    }

    if (this.mode === 'partial') {
      yield {
        type: 'evidence',
        item: {
          url: 'https://example.com/demo/partial-evidence',
          title: 'Partial Candidate Evidence',
          text: 'Harborline Foods partial candidate information.',
          via: 'fixture',
        },
      };
      yield { type: 'stage', stage: 'Checking primary sources', progress: 50 };
      throw new Error('Partial failure during secondary source retrieval.');
    }
  }

  async extract<T>(req: ExtractRequest<T>, ctx: JobContext): Promise<unknown> {
    if (this.mode === 'no_results') {
      return [];
    }
    if (this.mode === 'provider_error') {
      throw new Error('Extraction failed due to simulated model overload.');
    }
    return [];
  }
}

export const failingTestProvider = new FailingTestProvider();
