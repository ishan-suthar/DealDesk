import type { GatherEvent } from '../providers/types';

export interface EdgarFilingHit {
  id: string;
  cik: string;
  companyName: string;
  form: string;
  filingDate: string;
  description: string;
  url: string;
}

export class EdgarClient {
  private userAgent: string;
  private lastRequestTime = 0;
  private readonly minSpacingMs = 160; // SEC fair access limit: >= 150 ms spacing (< 10 req/sec)

  constructor(userAgent?: string) {
    this.userAgent =
      userAgent ||
      process.env.SEC_USER_AGENT ||
      'DealDesk/1.0 (Nikita; contact: research@booth.uchicago.edu)';
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minSpacingMs) {
      const waitTime = this.minSpacingMs - elapsed;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  private async fetchWithRetry(url: string, signal?: AbortSignal, maxRetries = 2): Promise<Response> {
    await this.rateLimit();

    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.userAgent,
            Accept: 'application/json, text/plain, */*',
          },
          signal,
        });

        if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
          attempt++;
          if (attempt > maxRetries) return response;
          const backoff = Math.pow(2, attempt) * 200;
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }

        return response;
      } catch (err: any) {
        if (signal?.aborted) throw err;
        attempt++;
        if (attempt > maxRetries) throw err;
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
    throw new Error(`Failed to fetch from SEC EDGAR after ${maxRetries} retries`);
  }

  async searchFilings(
    query: string,
    options?: {
      startDt?: string;
      endDt?: string;
      forms?: string[];
      signal?: AbortSignal;
    }
  ): Promise<EdgarFilingHit[]> {
    const forms = options?.forms || ['8-K', 'DEFM14A', 'SC TO-T', '425'];
    const formsParam = forms.join(',');
    const startDt = options?.startDt || '';
    const endDt = options?.endDt || '';

    const url = `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(
      query
    )}&forms=${encodeURIComponent(formsParam)}&startdt=${startDt}&enddt=${endDt}`;

    try {
      const res = await this.fetchWithRetry(url, options?.signal);
      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      const hits: EdgarFilingHit[] = [];

      if (data && data.hits && Array.isArray(data.hits.hits)) {
        for (const hit of data.hits.hits) {
          const source = hit._source || {};
          const accessionNum = (source.adsh || '').replace(/-/g, '');
          const cik = String(source.ciks?.[0] || hit._id || '').replace(/^0+/, '');
          const docName = source.root_form || source.file_num || 'filing';

          const docUrl =
            accessionNum && cik
              ? `https://www.sec.gov/Archives/edgar/data/${cik}/${accessionNum}/${source.file_name || docName}`
              : `https://www.sec.gov/edgar/browse/?CIK=${cik}`;

          hits.push({
            id: hit._id || String(Math.random()),
            cik,
            companyName: source.display_names?.[0] || source.entity_name || 'Public Company',
            form: source.root_form || source.form || '8-K',
            filingDate: source.file_date || source.period_ending || '',
            description: source.file_description || source.root_form_description || '',
            url: docUrl,
          });
        }
      }

      return hits;
    } catch (err) {
      return [];
    }
  }

  filingHitToEvidence(hit: EdgarFilingHit): GatherEvent {
    return {
      type: 'evidence',
      item: {
        url: hit.url,
        title: `SEC Form ${hit.form}: ${hit.companyName}`,
        publisher: 'U.S. Securities and Exchange Commission (EDGAR)',
        publishedAt: hit.filingDate,
        text: `Company: ${hit.companyName}. Form: ${hit.form}. Filed: ${hit.filingDate}. Description: ${hit.description}. URL: ${hit.url}`,
        via: 'edgar',
      },
    };
  }
}

export const edgarClient = new EdgarClient();
