export const ANTHROPIC_CONFIG = {
  modelFast: process.env.ANTHROPIC_MODEL_FAST || 'claude-3-5-haiku-20241022',
  modelDeep: process.env.ANTHROPIC_MODEL_DEEP || 'claude-3-5-sonnet-20241022',
  webSearchTool: {
    type: 'web_search_20250101',
    name: 'web_search',
  },
  webFetchTool: {
    type: 'web_fetch_20250101',
    name: 'web_fetch',
  },
} as const;
