import type { ResearchReport, Note } from '@/domain/types';
import { getDaysAgoDate } from './demoDeals';

export function generateDemoReports(baseDate = new Date()): {
  reports: ResearchReport[];
  notes: Note[];
} {
  const nowIso = baseDate.toISOString();
  const dateStr = getDaysAgoDate(14, baseDate);

  const report1: ResearchReport = {
    id: 'report-deal-1-v1',
    dealId: 'deal-1',
    version: 1,
    jobId: 'job-demo-deep-1',
    createdAt: nowIso,
    provider: 'demo',
    model: 'demo-deterministic-v1',
    promptVersion: 'v1.0.0',
    sections: [
      {
        key: 'snapshot',
        fields: {
          deal: {
            value: 'Harborline Foods to acquire Maple Crest Snacks',
            display: 'Harborline Foods to acquire Maple Crest Snacks (Pending)',
            valueStatus: 'verified',
            sourceIds: ['S1'],
          },
          briefSummary: [
            {
              id: 'c-sum-1',
              text: 'Harborline Foods entered into a definitive merger agreement to acquire Maple Crest Snacks for $4.2bn enterprise value in an all-cash transaction.',
              claimType: 'fact',
              sourceIds: ['S1'],
              confidence: 'high',
            },
            {
              id: 'c-sum-2',
              text: 'The acquisition accelerates Harborline presence in premium better-for-you snacking channels.',
              claimType: 'analysis',
              sourceIds: ['S3'],
              reasoning: 'Extracted from strategic commentary on channel expansion.',
              confidence: 'medium',
            },
          ],
          price: {
            value: '$4.2bn enterprise value ($3.8bn equity purchase price)',
            display: '$4.2bn enterprise value in cash',
            valueStatus: 'verified',
            sourceIds: ['S1'],
          },
          premium: {
            value: 28.5,
            display: '28.5% premium to 30-day VWAP ($42.00 per share)',
            valueStatus: 'reported',
            sourceIds: ['S2'],
            asOf: dateStr,
          },
          ebitdaMultiple: {
            value: 14.5,
            display: '14.5x LTM EBITDA (based on $290m adjusted EBITDA)',
            valueStatus: 'reported',
            sourceIds: ['S3'],
            calc: {
              formula: 'Enterprise Value ($4,200m) / LTM EBITDA ($290m)',
              inputs: [
                { label: 'Enterprise Value', value: 4200, sourceIds: ['S1'] },
                { label: 'LTM EBITDA', value: 290, sourceIds: ['S3'], period: 'LTM' },
              ],
            },
          },
          transactionComps: [
            {
              id: 'c-tc-1',
              text: 'Comparable transactions cited include Greenfield Foods / Sunridge Organics (15.2x EV/EBITDA) and Crestview Brands / Artisan Harvest (13.8x EV/EBITDA).',
              claimType: 'fact',
              sourceIds: ['S3'],
              confidence: 'medium',
            },
          ],
          buySideBanks: {
            value: 'Morgan Stanley (lead financial advisor)',
            display: 'Morgan Stanley (Financial); Davis Polk & Wardwell (Legal)',
            valueStatus: 'verified',
            sourceIds: ['S1', 'S2'],
          },
          sellSideBanks: {
            value: 'Centerview Partners (financial advisor)',
            display: 'Centerview Partners (Financial); Wachtell, Lipton, Rosen & Katz (Legal)',
            valueStatus: 'verified',
            sourceIds: ['S1', 'S2'],
          },
          buyerRationale: [
            {
              id: 'c-br-1',
              text: 'Expands exposure to high-growth savory snack segments with direct-store-delivery capabilities.',
              claimType: 'fact',
              sourceIds: ['S1', 'S3'],
              confidence: 'high',
            },
          ],
          sellerRationale: [
            {
              id: 'c-sr-1',
              text: 'Delivers full and immediate cash value to Maple Crest shareholders at a competitive premium.',
              claimType: 'fact',
              sourceIds: ['S2'],
              confidence: 'high',
            },
          ],
          analystView: [
            {
              id: 'c-av-1',
              text: 'The 14.5x EBITDA multiple sits in line with median specialty snack precedents (14.0x–15.5x), reflecting a fair strategic valuation without overpaying.',
              claimType: 'analysis',
              sourceIds: ['S3'],
              reasoning: 'Precedent transaction multiple comparison based on reported historical multiples.',
              confidence: 'medium',
            },
          ],
          talkingPoints: [
            {
              id: 'c-tp-1',
              text: 'Strategic Fit: Positions Harborline in better-for-you snacks, offsetting slower legacy staple growth.',
              claimType: 'analysis',
              sourceIds: ['S3'],
              reasoning: 'Synthesized market context.',
              confidence: 'high',
            },
            {
              id: 'c-tp-2',
              text: 'Multiple Discipline: 14.5x trailing EBITDA aligns with recent branded CPG transactions.',
              claimType: 'analysis',
              sourceIds: ['S3'],
              reasoning: 'Multiples comparison analysis.',
              confidence: 'high',
            },
            {
              id: 'c-tp-3',
              text: 'Smart Question: How will Harborline integrate Maple Crest direct-store-delivery logistics without diluting current operating margins?',
              claimType: 'analysis',
              sourceIds: ['S1', 'S3'],
              reasoning: 'Coffee chat conversation starter formulation.',
              confidence: 'high',
            },
          ],
        },
      },
      {
        key: 'companies',
        fields: {
          buyer: {
            business: { value: 'Diversified consumer packaged food company', display: 'Diversified consumer packaged food company', valueStatus: 'verified', sourceIds: ['S1'] },
            ceo: { value: 'Elena Rostova', display: 'Elena Rostova (since 2021)', valueStatus: 'verified', sourceIds: ['S1'] },
            marketCapOrEv: { value: 12500, display: '$12.5bn Market Cap / $15.2bn EV', valueStatus: 'reported', sourceIds: ['S3'], asOf: dateStr },
            revenueTtm: { value: 6800, display: '$6.8bn (FY2025)', valueStatus: 'verified', sourceIds: ['S1'] },
            ebitdaMargin: { value: 18.2, display: '18.2% EBITDA Margin', valueStatus: 'reported', sourceIds: ['S3'] },
            headquarters: { value: 'Chicago, IL', display: 'Chicago, IL, United States', valueStatus: 'verified', sourceIds: ['S1'] },
            earnings: { value: 'FY23: $2.45 | FY24: $2.62 | FY25: $2.80 (EPS Diluted)', display: '3-year EPS CAGR: 6.9%', valueStatus: 'reported', sourceIds: ['S3'] },
          },
          target: {
            business: { value: 'Organic and non-GMO salty snack producer', display: 'Organic and non-GMO salty snack producer', valueStatus: 'verified', sourceIds: ['S1'] },
            ceo: { value: 'Marcus Vance', display: 'Marcus Vance (Founder & CEO)', valueStatus: 'verified', sourceIds: ['S2'] },
            marketCapOrEv: { value: 3800, display: '$3.8bn Market Cap (prior to offer)', valueStatus: 'reported', sourceIds: ['S2'], asOf: dateStr },
            revenueTtm: { value: 1150, display: '$1.15bn LTM Revenue', valueStatus: 'verified', sourceIds: ['S1'] },
            ebitdaMargin: { value: 25.2, display: '25.2% Adjusted EBITDA Margin ($290m EBITDA)', valueStatus: 'reported', sourceIds: ['S3'] },
            headquarters: { value: 'Boulder, CO', display: 'Boulder, CO, United States', valueStatus: 'verified', sourceIds: ['S2'] },
            earnings: { value: 'FY23: $1.10 | FY24: $1.42 | FY25: $1.75 (EPS Diluted)', display: '3-year EPS CAGR: 26.1%', valueStatus: 'reported', sourceIds: ['S3'] },
          },
        },
      },
      {
        key: 'mechanics',
        fields: {
          dealType: { value: 'Acquisition / Cash Merger', display: 'All-cash statutory merger', valueStatus: 'verified', sourceIds: ['S1'] },
          announcement: { value: dateStr, display: `Announced ${dateStr}; stock rose 3.4% on release`, valueStatus: 'verified', sourceIds: ['S1'], asOf: dateStr },
          exchangeRatio: { value: 'Not applicable (all-cash)', display: 'Not applicable (all-cash)', valueStatus: 'verified', sourceIds: ['S1'] },
          cashStockMix: { value: '100% Cash consideration', display: '100% Cash ($42.00 per share)', valueStatus: 'verified', sourceIds: ['S1'] },
          postDealStructure: { value: 'Wholly owned operating subsidiary', display: 'Maple Crest will operate as an independent business unit within Harborline North America', valueStatus: 'verified', sourceIds: ['S1'] },
          multiplesAtAnnouncement: {
            value: '14.5x EV/EBITDA, 3.65x EV/Revenue',
            display: 'EV/EBITDA: 14.5x | EV/Revenue: 3.65x',
            valueStatus: 'reported',
            sourceIds: ['S3'],
          },
          closingDate: { value: getDaysAgoDate(-45, baseDate), display: 'Expected Q3 closing', valueStatus: 'verified', sourceIds: ['S1'] },
          multiplesAtClose: { value: 'Pending closing', display: 'No material change reported', valueStatus: 'verified', sourceIds: ['S1'] },
          premiumPaid: { value: 28.5, display: '28.5% over 30-day VWAP; 31.2% over unaffected share price', valueStatus: 'reported', sourceIds: ['S2'], asOf: dateStr },
          debtAssumed: { value: 400, display: '$400m existing debt refinanced via term loan facility', valueStatus: 'reported', sourceIds: ['S1'] },
          competitors: { value: 'Mondelez, PepsiCo (Frito-Lay), Campbell Soup (Snyder\'s-Lance)', display: 'Mondelez, PepsiCo, Campbell Soup Company', valueStatus: 'reported', sourceIds: ['S3'] },
          accretionDilution: { value: 'Accretive by Year 2', display: 'Management projects low single-digit adjusted EPS accretion by Year 2 post-close', valueStatus: 'verified', sourceIds: ['S1'] },
          advisersAndFees: { value: 'Not publicly disclosed', display: 'Adviser advisory fee schedules not publicly disclosed in initial 8-K', valueStatus: 'not_publicly_disclosed', sourceIds: [] },
        },
      },
      {
        key: 'rationale',
        fields: {
          acquirerRationale: [
            {
              id: 'c-ar-1',
              text: 'Capitalizes on consumer shift toward premium clean-label savory snacks while leveraging Harborline supply chain efficiencies.',
              claimType: 'fact',
              sourceIds: ['S1'],
              confidence: 'high',
            },
          ],
          targetRationale: [
            {
              id: 'c-tr-1',
              text: 'Enables nationwide retail store distribution expansion beyond natural grocery channels.',
              claimType: 'fact',
              sourceIds: ['S2'],
              confidence: 'high',
            },
          ],
          synergies: {
            value: 65,
            display: '$65m in run-rate cost synergies targeted within 36 months',
            valueStatus: 'verified',
            sourceIds: ['S1'],
          },
          risks: [
            {
              id: 'c-rk-1',
              text: 'Integration risk related to distinct company cultures and direct-store-delivery logistics.',
              claimType: 'analysis',
              sourceIds: ['S3'],
              reasoning: 'Management discussion on integration milestones.',
              confidence: 'medium',
            },
            {
              id: 'c-rk-2',
              text: 'Antitrust review focusing on organic chip category concentration.',
              claimType: 'analysis',
              sourceIds: ['S3'],
              reasoning: 'Market concentration analysis.',
              confidence: 'low',
            },
          ],
          priceReasonableness: [
            {
              id: 'c-pr-1',
              text: 'Valuation is well-supported by peer branded CPG benchmarks. Precedent deals in specialty snacks averaged 14.5x forward EBITDA. Limitations: Fairness opinion ranges have not yet been filed in a preliminary proxy.',
              claimType: 'analysis',
              sourceIds: ['S3'],
              reasoning: 'Synthesis of cited precedent valuation multiples against 14.5x transaction metric.',
              confidence: 'high',
            },
          ],
          relatedTransactions: [
            {
              id: 'c-rt-1',
              text: 'Precedent transactions: Greenfield Foods / Sunridge Organics ($2.8bn, 15.2x EBITDA), Crestview Brands / Artisan Harvest ($1.6bn, 13.8x EBITDA).',
              claimType: 'fact',
              sourceIds: ['S3'],
              confidence: 'high',
            },
          ],
        },
      },
      {
        key: 'sources',
        fields: {
          sourceList: ['S1', 'S2', 'S3'],
          openQuestions: [
            'Will the FTC request additional information regarding regional distribution overlap?',
            'What is the precise breakdown of the $65m synergy target between procurement and distribution?',
          ],
          metadata: {
            provider: 'demo',
            model: 'demo-deterministic-v1',
            promptVersion: 'v1.0.0',
            lastResearched: nowIso,
          },
        },
      },
    ],
    openQuestions: [
      'Will the FTC request additional information regarding regional distribution overlap?',
      'What is the precise breakdown of the $65m synergy target between procurement and distribution?',
    ],
    sourceIds: ['S1', 'S2', 'S3'],
  };

  const notes: Note[] = [
    {
      id: 'note-1',
      dealId: 'deal-1',
      templateSection: 'snapshot',
      quote: 'Harborline Foods entered into a definitive merger agreement to acquire Maple Crest Snacks for $4.2bn enterprise value in an all-cash transaction.',
      blockId: 'snapshot.briefSummary.c-sum-1',
      coveredBlockIds: ['snapshot.briefSummary.c-sum-1'],
      sourceIds: ['S1'],
      reportVersionId: 'report-deal-1-v1',
      comment: 'Great example of a strategic premium snack bolt-on at a reasonable multiple.',
      pinned: true,
      position: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'note-2',
      dealId: 'deal-1',
      templateSection: 'mechanics',
      quote: 'EV/EBITDA: 14.5x | EV/Revenue: 3.65x',
      blockId: 'mechanics.multiplesAtAnnouncement.value',
      coveredBlockIds: ['mechanics.multiplesAtAnnouncement.value'],
      sourceIds: ['S3'],
      reportVersionId: 'report-deal-1-v1',
      comment: 'Check whether the 14.5x EBITDA multiple is based on adjusted EBITDA or unadjusted GAAP EBITDA.',
      pinned: false,
      position: 1,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'note-3',
      dealId: 'deal-1',
      templateSection: 'snapshot',
      quote: undefined,
      blockId: undefined,
      coveredBlockIds: [],
      sourceIds: [],
      reportVersionId: undefined,
      comment: 'Nikita: Mention Morgan Stanley advised Harborline when talking with Chicago consumer coverage bankers.',
      pinned: true,
      position: 2,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];

  return { reports: [report1], notes };
}
