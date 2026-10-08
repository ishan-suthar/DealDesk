import { GoogleGenAI } from '@google/genai';
import type {
  ResearchProvider,
  GatherRequest,
  ExtractRequest,
  GatherEvent,
  JobContext,
} from '../types';
import { buildDiscoverySystemPrompt, buildDiscoveryUserPrompt } from '../prompts/v1_discovery';
import { buildDeepSectionSystemPrompt, buildDeepSectionUserPrompt } from '../prompts/v1_deep_section';

export class GeminiAdapter implements ResearchProvider {
  readonly id = 'gemini';
  private client: GoogleGenAI | null = null;
  private modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    this.modelName = modelName || process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    if (key) {
      this.client = new GoogleGenAI({ apiKey: key });
    }
  }

  // Resolve potential Google Search redirect links to canonical destination URLs
  private async resolveRedirectUrl(url: string, signal?: AbortSignal): Promise<string> {
    try {
      if (!url.includes('google.com/url?') && !url.includes('vertexaisearch.cloud.google.com')) {
        return url;
      }
      const parsed = new URL(url);
      const target = parsed.searchParams.get('q') || parsed.searchParams.get('url');
      if (target) return target;

      const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal });
      return res.url || url;
    } catch {
      return url;
    }
  }

  async *gather(req: GatherRequest, ctx: JobContext): AsyncIterable<GatherEvent> {
    if (!this.client) {
      yield { type: 'warning', message: "Live research isn't configured. Running in demo mode." };
      return;
    }

    yield { type: 'stage', stage: 'Finding candidates' };

    const query = req.queryVariants?.[0] || 'M&A transactions announced';
    const systemPrompt = buildDiscoverySystemPrompt(ctx.today, 'Recent announcements');

    try {
      // Call Gemini with Google Search Grounding tool
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: `${systemPrompt}\n\nSearch for and identify announced M&A transactions: "${query}". Include primary filing or company press release sources.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      // Decrement search budget
      if (ctx.budget.remainingSearches > 0) ctx.budget.remainingSearches--;

      // Parse groundingMetadata
      const candidate = response.candidates?.[0];
      const metadata = candidate?.groundingMetadata;

      if (metadata && metadata.groundingChunks) {
        for (const chunk of metadata.groundingChunks) {
          if (chunk.web?.uri) {
            const rawUrl = chunk.web.uri;
            const finalUrl = await this.resolveRedirectUrl(rawUrl, ctx.signal);
            const title = chunk.web.title || 'Google Grounded Source';

            yield {
              type: 'evidence',
              item: {
                url: finalUrl,
                title,
                publisher: 'Web Source',
                publishedAt: ctx.today,
                text: `Title: ${title}. URL: ${finalUrl}`,
                via: 'search_result',
              },
            };
          }
        }
      }
    } catch (err: any) {
      if (ctx.signal.aborted) throw err;
      yield { type: 'warning', message: `Gemini gather error: ${err.message}` };
    }
  }

  async extract<T>(req: ExtractRequest<T>, ctx: JobContext): Promise<unknown> {
    if (!this.client) {
      throw new Error('Gemini client is not configured.');
    }

    const sourcePackText = req.sourcePack
      .map(
        (s, idx) =>
          `[S${idx + 1}] Title: ${s.title}\nPublisher: ${s.publisher}\nURL: ${s.url}\nExcerpt: ${
            s.excerpt || ''
          }`
      )
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

    const promptText = `${systemPrompt}\n\n${userPrompt}\n\nOutput only a JSON object adhering to the specified schema.`;

    const response = await this.client.models.generateContent({
      model: this.modelName,
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    try {
      return JSON.parse(text);
    } catch {
      return {};
    }
  }
}

export const geminiAdapter = new GeminiAdapter();
