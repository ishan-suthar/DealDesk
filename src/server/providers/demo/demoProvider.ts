import type {
  ResearchProvider,
  GatherRequest,
  ExtractRequest,
  GatherEvent,
  JobContext,
} from '../types';
import { generateDemoFixtures } from '@/fixtures/demoDeals';
import { generateDemoReports } from '@/fixtures/demoReports';

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new Error('Aborted'));
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new Error('Aborted'));
    });
  });
}

export class DemoProvider implements ResearchProvider {
  public readonly id = 'demo' as const;

  async *gather(req: GatherRequest, ctx: JobContext): AsyncIterable<GatherEvent> {
    const baseDate = new Date(ctx.today);
    const { sources } = generateDemoFixtures(baseDate);

    // Stage 1: Finding candidates
    yield { type: 'stage', stage: 'Finding candidates', progress: 25 };
    await sleep(250, ctx.signal);

    // Emit evidence items
    for (const src of sources) {
      if (ctx.signal.aborted) throw new Error('Aborted');
      yield {
        type: 'evidence',
        item: {
          url: src.url,
          title: src.title,
          publisher: src.publisher,
          publishedAt: src.publishedAt,
          text: src.excerpt || src.title,
          via: 'fixture',
        },
      };
    }

    // Stage 2: Checking primary sources
    yield { type: 'stage', stage: 'Checking primary sources', progress: 50 };
    await sleep(250, ctx.signal);

    // Stage 3: Extracting deal facts
    yield { type: 'stage', stage: 'Extracting deal facts', progress: 75 };
    await sleep(250, ctx.signal);

    // Stage 4: Ranking for interview usefulness
    yield { type: 'stage', stage: 'Ranking for interview usefulness', progress: 95 };
    await sleep(200, ctx.signal);
  }

  async extract<T>(req: ExtractRequest<T>, ctx: JobContext): Promise<unknown> {
    const baseDate = new Date(ctx.today);

    if (req.kind === 'discovery') {
      const { deals } = generateDemoFixtures(baseDate);
      return deals;
    }

    if (req.kind === 'deep_section') {
      const { reports } = generateDemoReports(baseDate);
      const rep = reports[0];
      const section = rep.sections.find((s) => s.key === req.sectionKey);
      return section ? section.fields : {};
    }

    const { reports } = generateDemoReports(baseDate);
    return reports[0];
  }
}

export const demoProvider = new DemoProvider();
