import { getProvider } from '../providers/providerFactory';
import { edgarClient } from '../services/edgarClient';
import type { JobContext } from '../providers/types';

async function runLiveSmoke() {
  console.log('==============================================');
  console.log(' Deal Desk — Live Provider Smoke Test');
  console.log('==============================================\n');

  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const providerEnv = process.env.RESEARCH_PROVIDER || 'demo';

  console.log(`Current RESEARCH_PROVIDER: ${providerEnv}`);
  console.log(`ANTHROPIC_API_KEY present: ${hasAnthropic ? 'Yes' : 'No'}`);
  console.log(`GEMINI_API_KEY present:    ${hasGemini ? 'Yes' : 'No'}\n`);

  if (!hasAnthropic && !hasGemini) {
    console.log('Notice: No live API keys configured.');
    console.log('To run live research against frontier models:');
    console.log('  1. Add ANTHROPIC_API_KEY or GEMINI_API_KEY to .env.local');
    console.log('  2. Set RESEARCH_PROVIDER=anthropic or RESEARCH_PROVIDER=gemini');
    console.log('\nVerifying provider fallback to demo mode...');
  }

  const provider = getProvider();
  console.log(`Active provider ID: ${provider.id}`);

  // Test EDGAR Client search
  console.log('\nChecking SEC EDGAR client connectivity...');
  try {
    const hits = await edgarClient.searchFilings('definitive agreement', {
      forms: ['8-K'],
    });
    console.log(`✓ SEC EDGAR query returned ${hits.length} filings.`);
  } catch (err: any) {
    console.log(`SEC EDGAR query notice: ${err.message}`);
  }

  // Test Provider Gather
  console.log(`\nTesting ${provider.id} provider gather...`);
  const ctx: JobContext = {
    today: new Date().toISOString().split('T')[0],
    signal: new AbortController().signal,
    budget: {
      maxSearches: 5,
      maxFetches: 5,
      remainingSearches: 5,
      remainingFetches: 5,
    },
    log: (e) => console.log(`[JobLog] ${e.message}`),
  };

  let count = 0;
  for await (const event of provider.gather({ kind: 'discovery', queryVariants: ['acquisition'] }, ctx)) {
    if (event.type === 'stage') {
      console.log(`→ Stage: ${event.stage}`);
    } else if (event.type === 'evidence') {
      count++;
    } else if (event.type === 'warning') {
      console.log(`⚠ Warning: ${event.message}`);
    }
  }

  console.log(`✓ Gather produced ${count} evidence items.`);
  console.log('\n==============================================');
  console.log(' Smoke test complete.');
  console.log('==============================================');
}

runLiveSmoke()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Smoke test failed:', err);
    process.exit(1);
  });
