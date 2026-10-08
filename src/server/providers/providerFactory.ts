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

export interface ActiveProviderInfo {
  provider: ResearchProvider;
  providerId: 'demo' | 'anthropic' | 'gemini' | 'failing_test';
  isLive: boolean;
  isDemoMode: boolean;
  researchMode: string;
  modeDisplay: string;
}

export function getActiveProviderInfo(overrideId?: string, failureMode?: FailingMode): ActiveProviderInfo {
  const provider = getProvider(overrideId, failureMode);
  const isLive = provider.id === 'anthropic' || provider.id === 'gemini';
  const isDemoMode = !isLive;
  const providerId = provider.id;
  const researchMode = isLive ? providerId : 'demo';
  const modeDisplay = isLive ? `Live — ${providerId}` : 'Demo';

  return {
    provider,
    providerId,
    isLive,
    isDemoMode,
    researchMode,
    modeDisplay,
  };
}
