import type { ResearchProvider } from './types';
import { demoProvider } from './demo/demoProvider';
import { failingTestProvider, FailingMode, FailingTestProvider } from './test/failingTestProvider';

import { AnthropicAdapter } from './anthropic/anthropicAdapter';
import { GeminiAdapter } from './gemini/geminiAdapter';

export function getProvider(overrideId?: string, failureMode?: FailingMode): ResearchProvider {
  const providerId = overrideId || process.env.RESEARCH_PROVIDER || 'demo';

  if (providerId === 'failing_test') {
    return failureMode ? new FailingTestProvider(failureMode) : failingTestProvider;
  }

  if (providerId === 'anthropic') {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('Anthropic API key not configured. Falling back to demo provider.');
      return demoProvider;
    }
    return new AnthropicAdapter();
  }

  if (providerId === 'gemini') {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('Gemini API key not configured. Falling back to demo provider.');
      return demoProvider;
    }
    return new GeminiAdapter();
  }

  return demoProvider;
}
