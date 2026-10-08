export const recordedAnthropicSearchResponse = {
  id: 'msg_01recordedAnthropic123',
  type: 'message' as const,
  role: 'assistant' as const,
  model: 'claude-3-5-haiku-20241022',
  content: [
    {
      type: 'text' as const,
      text: 'I have conducted web searches for announced M&A transactions.',
    },
    {
      type: 'tool_result' as any,
      tool_use_id: 'tool_search_1',
      content: [
        {
          url: 'https://example.com/demo/filings/recorded-merger-8k',
          title: 'Recorded Buyer Form 8-K Definitive Merger Agreement',
          publisher: 'SEC EDGAR',
          published_at: '2026-03-01',
          text: 'Recorded Buyer agreed to acquire Recorded Target for $2.5 billion in cash.',
        },
      ],
    },
  ],
  usage: { input_tokens: 120, output_tokens: 85 },
  stop_reason: 'end_turn' as const,
  stop_sequence: null,
};

export const recordedAnthropicExtractResponse = {
  id: 'msg_01recordedExtract123',
  type: 'message' as const,
  role: 'assistant' as const,
  model: 'claude-3-5-haiku-20241022',
  content: [
    {
      type: 'tool_use' as const,
      id: 'toolu_submit_result_1',
      name: 'submit_result',
      input: {
        extractedData: {
          deals: [
            {
              headline: 'Recorded Buyer to acquire Recorded Target for $2.5bn',
              dealValue: { amount: 2.5, currency: 'USD', unit: 'billions', valueType: 'enterprise_value' },
              buyerName: 'Recorded Buyer',
              targetName: 'Recorded Target',
              sourceIds: ['S1'],
            },
          ],
        },
      },
    },
  ],
  usage: { input_tokens: 250, output_tokens: 110 },
  stop_reason: 'tool_use' as const,
  stop_sequence: null,
};

export const recordedGeminiSearchResponse = {
  candidates: [
    {
      content: {
        parts: [{ text: 'Found announced transaction details.' }],
        role: 'model',
      },
      groundingMetadata: {
        groundingChunks: [
          {
            web: {
              uri: 'https://example.com/demo/filings/gemini-recorded-filing',
              title: 'Gemini Recorded Filing: Buyer to acquire Target',
            },
          },
        ],
        groundingSupports: [
          {
            groundingChunkIndices: [0],
            confidenceScores: [0.95],
          },
        ],
      },
    },
  ],
};

export const recordedGeminiExtractResponse = {
  text: JSON.stringify({
    deals: [
      {
        headline: 'Gemini Buyer to acquire Gemini Target for $1.8bn',
        dealValue: { amount: 1.8, currency: 'USD', unit: 'billions', valueType: 'enterprise_value' },
        buyerName: 'Gemini Buyer',
        targetName: 'Gemini Target',
        sourceIds: ['S1'],
      },
    ],
  }),
};

export const recordedEdgarSearchResponse = {
  hits: {
    total: { value: 1, relation: 'eq' },
    hits: [
      {
        _id: 'edgar-hit-001',
        _source: {
          display_names: ['Recorded CPG Corp (CIK 0001099881)'],
          entity_name: 'Recorded CPG Corp',
          root_form: '8-K',
          file_date: '2026-03-01',
          adsh: '0001099881-26-000042',
          file_name: 'merger8k.htm',
          file_description: 'Entry into Material Definitive Agreement',
          ciks: ['0001099881'],
        },
      },
    ],
  },
};
