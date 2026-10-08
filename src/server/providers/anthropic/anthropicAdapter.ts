import Anthropic from '@anthropic-ai/sdk';
import type {
  ResearchProvider,
  GatherRequest,
  ExtractRequest,
  GatherEvent,
  JobContext,
} from '../types';
import { ANTHROPIC_CONFIG } from './config';
import { buildDiscoverySystemPrompt, buildDiscoveryUserPrompt } from '../prompts/v1_discovery';
import { buildDeepSectionSystemPrompt, buildDeepSectionUserPrompt } from '../prompts/v1_deep_section';
import { normalizeDiscoveryPayload } from '../../services/normalizer';

export class AnthropicAdapter implements ResearchProvider {
  readonly id = 'anthropic';
  private client: Anthropic | null = null;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (key) {
      this.client = new Anthropic({ apiKey: key });
    }
  }

  async *gather(req: GatherRequest, ctx: JobContext): AsyncIterable<GatherEvent> {
    if (!this.client) {
      yield { type: 'warning', message: "Live research isn't configured. Running in demo mode." };
      return;
    }

    yield { type: 'stage', stage: 'Finding candidates' };

    const query = req.queryVariants?.[0] || 'M&A definitive agreements';
    const systemPrompt = buildDiscoverySystemPrompt(ctx.today, 'Recent announcements');

    try {
      const messages: Anthropic.MessageParam[] = [
        {
          role: 'user',
          content: `Search for announced M&A transactions matching query: "${query}". Retrieve relevant filing and press release evidence.`,
        },
      ];

      // Call Anthropic Messages with search and fetch tools
      const response = await this.client.messages.create(
        {
          model: ANTHROPIC_CONFIG.modelFast,
          max_tokens: 4096,
          system: systemPrompt,
          messages,
          tools: [
            {
              type: ANTHROPIC_CONFIG.webSearchTool.type as any,
              name: ANTHROPIC_CONFIG.webSearchTool.name,
              description: 'Search the web for transaction announcements and news',
              input_schema: {
                type: 'object',
                properties: { query: { type: 'string' } },
                required: ['query'],
              },
            } as any,
            {
              type: ANTHROPIC_CONFIG.webFetchTool.type as any,
              name: ANTHROPIC_CONFIG.webFetchTool.name,
              description: 'Fetch web page content for transaction details',
              input_schema: {
                type: 'object',
                properties: { url: { type: 'string' } },
                required: ['url'],
              },
            } as any,
          ],
        },
        { signal: ctx.signal }
      );

      // Decrement budget
      if (ctx.budget.remainingSearches > 0) ctx.budget.remainingSearches--;

      // Inspect content blocks for tool results
      for (const block of response.content) {
        if ((block as any).type === 'tool_result' || (block as any).type === 'web_search_tool_result') {
          const resBlock = block as any;
          if (resBlock.error_code) {
            yield {
              type: 'warning',
              message: `Search tool warning (${resBlock.error_code}): ${resBlock.error_message || 'Search failed'}`,
            };
            continue;
          }

          if (resBlock.content && Array.isArray(resBlock.content)) {
            for (const item of resBlock.content) {
              if (item.url && item.text) {
                yield {
                  type: 'evidence',
                  item: {
                    url: item.url,
                    title: item.title || 'Web Search Result',
                    publisher: item.publisher || 'Web Source',
                    publishedAt: item.published_at || ctx.today,
                    text: item.text,
                    via: 'search_result',
                  },
                };
              }
            }
          }
        }
      }
    } catch (err: any) {
      if (ctx.signal.aborted) throw err;
      yield { type: 'warning', message: `Anthropic gather error: ${err.message}` };
    }
  }

  async extract<T>(req: ExtractRequest<T>, ctx: JobContext): Promise<unknown> {
    if (!this.client) {
      throw new Error('Anthropic client is not configured.');
    }

    const sourcePackText = req.sourcePack
      .map((s, idx) => `[S${idx + 1}] Title: ${s.title}\nPublisher: ${s.publisher}\nURL: ${s.url}\nExcerpt: ${s.excerpt || ''}`)
      .join('\n\n');

    let systemPrompt: string;
    let userPrompt: string;

    if (req.kind === 'discovery') {
      systemPrompt = buildDiscoverySystemPrompt(ctx.today, 'Target window');
      userPrompt = buildDiscoveryUserPrompt(sourcePackText, 'Target Sector', []);
    } else {
      systemPrompt = buildDeepSectionSystemPrompt(ctx.today, req.sectionKey || 'snapshot');
      userPrompt = buildDeepSectionUserPrompt(
        req.sectionKey || 'snapshot',
        String(req.dealContext?.headline || 'Transaction'),
        sourcePackText
      );
    }

    // Extraction call: Tool-free or forced submit_result tool call to return clean JSON
    const discoverySchema = {
      type: 'object',
      properties: {
        candidates: {
          type: 'array',
          description: 'List of candidate M&A transactions',
          items: {
            type: 'object',
            properties: {
              headline: { type: 'string', description: 'Transaction headline' },
              buyerName: { type: 'string', description: 'Acquiring entity or buyer' },
              targetName: { type: 'string', description: 'Target company acquired' },
              dealValue: {
                type: 'object',
                properties: {
                  amount: { type: 'number' },
                  currency: { type: 'string' },
                  unit: { type: 'string', enum: ['units', 'thousands', 'millions', 'billions'] },
                  valueType: { type: 'string', enum: ['equity_value', 'enterprise_value', 'purchase_price', 'unknown'] },
                },
              },
              announcementDate: { type: 'string', description: 'Announcement date YYYY-MM-DD' },
              transactionStatus: { type: 'string', enum: ['pending', 'closed', 'rumored', 'terminated', 'unknown'] },
              sourceIds: { type: 'array', items: { type: 'string' }, description: 'Cited source IDs (e.g. S1, S2)' },
            },
            required: ['headline', 'sourceIds'],
          },
        },
        deals: {
          type: 'array',
          description: 'Alternative candidate deals list',
        },
        extractedData: {
          type: 'object',
          description: 'Nested extraction container',
        },
      },
    };

    const deepSectionSchema = {
      type: 'object',
      properties: {
        extractedData: {
          type: 'object',
          description: 'The structured extraction output',
        },
      },
      required: ['extractedData'],
    };

    const response = await this.client.messages.create(
      {
        model: req.kind === 'deep_section' ? ANTHROPIC_CONFIG.modelDeep : ANTHROPIC_CONFIG.modelFast,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        tools: [
          {
            name: 'submit_result',
            description: 'Submit the extracted structured data adhering strictly to the schema',
            input_schema: (req.kind === 'discovery' ? discoverySchema : deepSectionSchema) as any,
          },
        ],
        tool_choice: { type: 'tool', name: 'submit_result' },
      },
      { signal: ctx.signal }
    );

    let rawPayload: unknown = null;
    for (const block of response.content) {
      if (block.type === 'tool_use' && block.name === 'submit_result') {
        const input = block.input as any;
        rawPayload = input.extractedData || input;
        break;
      }
    }

    if (req.kind === 'discovery') {
      return normalizeDiscoveryPayload(rawPayload ?? {});
    }

    return rawPayload ?? {};
  }
}

export const anthropicAdapter = new AnthropicAdapter();
