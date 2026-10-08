import type { Deal, Company, Source } from '@/domain/types';

export function getDaysAgoDate(days: number, baseDate = new Date()): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

export function generateDemoFixtures(baseDate = new Date()): {
  companies: Company[];
  sources: Source[];
  deals: Deal[];
} {
  const todayStr = baseDate.toISOString().split('T')[0];
  const nowIso = baseDate.toISOString();

  // Companies
  const companies: Company[] = [
    // Deal 1: Harborline Foods -> Maple Crest Snacks
    { id: 'c-harborline', name: 'Harborline Foods', aliases: ['Harborline', 'Harborline Foods Inc'], ticker: 'HBF', exchange: 'NYSE', cik: '0001099881', hqCountry: 'US', isSponsor: false },
    { id: 'c-maplecrest', name: 'Maple Crest Snacks', aliases: ['Maple Crest', 'Maple Crest Snacks Co'], ticker: 'MCST', exchange: 'NASDAQ', cik: '0001299882', hqCountry: 'US', isSponsor: false },
    // Deal 2: Copperleaf Beverage Co. -> Brightwater Seltzer
    { id: 'c-copperleaf', name: 'Copperleaf Beverage Co.', aliases: ['Copperleaf Beverage', 'Copperleaf'], ticker: 'CPLF', exchange: 'NYSE', cik: '0001399883', hqCountry: 'US', isSponsor: false },
    { id: 'c-brightwater', name: 'Brightwater Seltzer', aliases: ['Brightwater', 'Brightwater Beverages'], cik: '0001499884', hqCountry: 'US', isSponsor: false },
    // Deal 3: Nimbus Pet Brands -> Tallgrass Pet Supply
    { id: 'c-nimbus', name: 'Nimbus Pet Brands', aliases: ['Nimbus Pet'], hqCountry: 'US', isSponsor: false },
    { id: 'c-tallgrass', name: 'Tallgrass Pet Supply', aliases: ['Tallgrass Pet'], hqCountry: 'US', isSponsor: false },
    // Deal 4: Verity Beauty Group -> Oakmoss Naturals
    { id: 'c-verity', name: 'Verity Beauty Group', aliases: ['Verity Beauty'], ticker: 'VBG', exchange: 'NYSE', cik: '0001599885', hqCountry: 'US', isSponsor: false },
    { id: 'c-oakmoss', name: 'Oakmoss Naturals', aliases: ['Oakmoss'], hqCountry: 'US', isSponsor: false },
    // Deal 5: Summit Ridge Partners -> Lark & Linen
    { id: 'c-summitridge', name: 'Summit Ridge Partners', aliases: ['Summit Ridge'], hqCountry: 'US', isSponsor: true },
    { id: 'c-larklinen', name: 'Lark & Linen', aliases: ['Lark & Linen Co'], ticker: 'LARK', exchange: 'NYSE', cik: '0001699886', hqCountry: 'US', isSponsor: false },
    // Deal 6: Corvane Retail -> Bluefin Outfitters
    { id: 'c-corvane', name: 'Corvane Retail', aliases: ['Corvane'], ticker: 'CRVN', exchange: 'NASDAQ', cik: '0001799887', hqCountry: 'US', isSponsor: false },
    { id: 'c-bluefin', name: 'Bluefin Outfitters', aliases: ['Bluefin'], ticker: 'BLFN', exchange: 'NYSE', cik: '0001899888', hqCountry: 'US', isSponsor: false },
    // Deal 7: Hearthstone Home -> Juniper Living
    { id: 'c-hearthstone', name: 'Hearthstone Home', aliases: ['Hearthstone'], hqCountry: 'US', isSponsor: false },
    { id: 'c-juniper', name: 'Juniper Living', aliases: ['Juniper'], hqCountry: 'US', isSponsor: false },
    // Deal 8: Fennimore Kitchen Group -> Tidewell Tacos (carve-out from Ostrander Holdings)
    { id: 'c-fennimore', name: 'Fennimore Kitchen Group', aliases: ['Fennimore Kitchen'], hqCountry: 'US', isSponsor: false },
    { id: 'c-tidewell', name: 'Tidewell Tacos', aliases: ['Tidewell'], hqCountry: 'US', isSponsor: false },
    { id: 'c-ostrander', name: 'Ostrander Holdings', aliases: ['Ostrander'], ticker: 'OSTH', exchange: 'NYSE', cik: '0001999889', hqCountry: 'US', isSponsor: false },
    // Deal 9: Pemberton Household -> Clearbrook Cleaning
    { id: 'c-pemberton', name: 'Pemberton Household', aliases: ['Pemberton'], hqCountry: 'US', isSponsor: false },
    { id: 'c-clearbrook', name: 'Clearbrook Cleaning', aliases: ['Clearbrook'], hqCountry: 'US', isSponsor: false },
    // Deal 10: Alder & Finch Marketplace -> Parcelnest
    { id: 'c-alderfinch', name: 'Alder & Finch Marketplace', aliases: ['Alder & Finch'], ticker: 'ALDF', exchange: 'NASDAQ', cik: '0002099890', hqCountry: 'US', isSponsor: false },
    { id: 'c-parcelnest', name: 'Parcelnest', aliases: ['Parcelnest Logistics'], hqCountry: 'US', isSponsor: false },
  ].map((c) => ({ ...c, createdAt: nowIso }));

  // Sources (All strictly under https://example.com/demo/...)
  const sources: Source[] = [
    // S1..S3 for Deal 1
    {
      id: 'S1',
      jobId: 'demo-job-1',
      origin: 'demo',
      url: 'https://example.com/demo/filings/harborline-8k-maplecrest',
      publisher: 'Demo SEC Filing',
      title: 'Harborline Foods Inc. Form 8-K Definitive Merger Agreement',
      publishedAt: getDaysAgoDate(14, baseDate),
      accessedAt: nowIso,
      sourceType: 'primary',
      retrievedVia: 'edgar',
      excerpt: 'Harborline Foods enters definitive agreement to acquire Maple Crest Snacks for $4.2bn enterprise value in cash.',
    },
    {
      id: 'S2',
      jobId: 'demo-job-1',
      origin: 'demo',
      url: 'https://example.com/demo/news/maplecrest-advisers-release',
      publisher: 'Demo Newswire',
      title: 'Maple Crest Snacks Reaches $4.2B Sale Agreement with Harborline Foods',
      publishedAt: getDaysAgoDate(14, baseDate),
      accessedAt: nowIso,
      sourceType: 'primary',
      retrievedVia: 'fixture',
      excerpt: 'Centerview Partners advised Maple Crest Snacks; Morgan Stanley acted as lead financial advisor to Harborline Foods.',
    },
    {
      id: 'S3',
      jobId: 'demo-job-1',
      origin: 'demo',
      url: 'https://example.com/demo/reports/snack-sector-analysis-harborline',
      publisher: 'Demo Financial Times',
      title: 'Harborline Snack Expansion Signals Consolidation Wave',
      publishedAt: getDaysAgoDate(12, baseDate),
      accessedAt: nowIso,
      sourceType: 'strong_secondary',
      retrievedVia: 'fixture',
      excerpt: 'The $4.2 billion transaction represents a 14.5x trailing EBITDA multiple and broadens premium snack presence.',
    },

    // S4..S5 for Deal 2
    {
      id: 'S4',
      jobId: 'demo-job-2',
      origin: 'demo',
      url: 'https://example.com/demo/filings/copperleaf-merger-brightwater',
      publisher: 'Demo SEC Filing',
      title: 'Copperleaf Beverage Form 8-K Closing of Brightwater Seltzer',
      publishedAt: getDaysAgoDate(35, baseDate),
      accessedAt: nowIso,
      sourceType: 'primary',
      retrievedVia: 'edgar',
      excerpt: 'Copperleaf Beverage Co. has completed its acquisition of Brightwater Seltzer for $1.8bn in cash and stock with exchange ratio of 0.425.',
    },
    {
      id: 'S5',
      jobId: 'demo-job-2',
      origin: 'demo',
      url: 'https://example.com/demo/news/copperleaf-closes-brightwater',
      publisher: 'Demo Newswire',
      title: 'Copperleaf Closes Brightwater Seltzer Acquisition',
      publishedAt: getDaysAgoDate(35, baseDate),
      accessedAt: nowIso,
      sourceType: 'primary',
      retrievedVia: 'fixture',
      excerpt: 'The transaction valued Brightwater at $1.8 billion with consideration consisting of 60% cash and 40% stock.',
    },

    // S6 for Deal 3
    {
      id: 'S6',
      jobId: 'demo-job-3',
      origin: 'demo',
      url: 'https://example.com/demo/news/nimbus-acquires-tallgrass',
      publisher: 'Demo Newswire',
      title: 'Nimbus Pet Brands Announces Acquisition of Tallgrass Pet Supply',
      publishedAt: getDaysAgoDate(28, baseDate),
      accessedAt: nowIso,
      sourceType: 'primary',
      retrievedVia: 'fixture',
      excerpt: 'Nimbus Pet Brands acquires Tallgrass Pet Supply for $650m in all-cash transaction. Financial advisers were not disclosed.',
    },

    // S7..S8 for Deal 4 (conflicting values)
    {
      id: 'S7',
      jobId: 'demo-job-4',
      origin: 'demo',
      url: 'https://example.com/demo/filings/verity-oakmoss-proxy',
      publisher: 'Demo SEC Filing',
      title: 'Verity Beauty Group Definitive Agreement for Oakmoss Naturals',
      publishedAt: getDaysAgoDate(40, baseDate),
      accessedAt: nowIso,
      sourceType: 'primary',
      retrievedVia: 'edgar',
      excerpt: 'Verity Beauty agrees to acquire Oakmoss Naturals for $1,250 million enterprise value ($1.25bn EV) and $1,100 million equity purchase price.',
    },
    {
      id: 'S8',
      jobId: 'demo-job-4',
      origin: 'demo',
      url: 'https://example.com/demo/reports/oakmoss-valuation-review',
      publisher: 'Demo Financial Times',
      title: 'Oakmoss Naturals Deal Pegged at $1.32bn Valuation Including Contingent Earnouts',
      publishedAt: getDaysAgoDate(38, baseDate),
      accessedAt: nowIso,
      sourceType: 'strong_secondary',
      retrievedVia: 'fixture',
      excerpt: 'Market sources report the transaction values Oakmoss at $1.32bn enterprise value inclusive of maximum milestone payments.',
    },

    // S9..S10 for Deal 5 (take-private, sponsor)
    {
      id: 'S9',
      jobId: 'demo-job-5',
      origin: 'demo',
      url: 'https://example.com/demo/filings/summitridge-lark-linen-13d',
      publisher: 'Demo SEC Filing',
      title: 'Summit Ridge Partners Take-Private Agreement for Lark & Linen Co',
      publishedAt: getDaysAgoDate(20, baseDate),
      accessedAt: nowIso,
      sourceType: 'primary',
      retrievedVia: 'edgar',
      excerpt: 'Summit Ridge Partners to take Lark & Linen private at $34.00 per share, an enterprise value of $2.1bn, representing a 32% premium to unaffected share price.',
    },
    {
      id: 'S10',
      jobId: 'demo-job-5',
      origin: 'demo',
      url: 'https://example.com/demo/news/lark-linen-sponsor-take-private',
      publisher: 'Demo Newswire',
      title: 'Lark & Linen Enters $2.1B Merger with Summit Ridge Partners',
      publishedAt: getDaysAgoDate(20, baseDate),
      accessedAt: nowIso,
      sourceType: 'primary',
      retrievedVia: 'fixture',
      excerpt: 'Stockholders will receive $34.00 per share in cash. Unaffected trading price prior to announcement rumors was $25.75.',
    },

    // S11 for Deal 6 (terminated)
    {
      id: 'S11',
      jobId: 'demo-job-6',
      origin: 'demo',
      url: 'https://example.com/demo/filings/corvane-bluefin-termination',
      publisher: 'Demo SEC Filing',
      title: 'Corvane Retail Mutual Termination of Merger with Bluefin Outfitters',
      publishedAt: getDaysAgoDate(45, baseDate),
      accessedAt: nowIso,
      sourceType: 'primary',
      retrievedVia: 'edgar',
      excerpt: 'Corvane Retail and Bluefin Outfitters have mutually agreed to terminate their proposed $950m transaction following regulatory challenges.',
    },

    // S12 for Deal 7 (rumored)
    {
      id: 'S12',
      jobId: 'demo-job-7',
      origin: 'demo',
      url: 'https://example.com/demo/reports/hearthstone-juniper-rumor',
      publisher: 'Demo Financial Times',
      title: 'Hearthstone Home in Advanced Talks to Buy Juniper Living for Around $500m',
      publishedAt: getDaysAgoDate(10, baseDate),
      accessedAt: nowIso,
      sourceType: 'strong_secondary',
      retrievedVia: 'fixture',
      excerpt: 'Hearthstone Home is exploring a buyout of rival Juniper Living for approximately $500 million. No definitive agreement signed.',
    },

    // S13 for Deal 8 (carve-out)
    {
      id: 'S13',
      jobId: 'demo-job-8',
      origin: 'demo',
      url: 'https://example.com/demo/filings/ostrander-tidewell-carveout',
      publisher: 'Demo SEC Filing',
      title: 'Ostrander Holdings Agreement to Divest Tidewell Tacos to Fennimore Kitchen',
      publishedAt: getDaysAgoDate(15, baseDate),
      accessedAt: nowIso,
      sourceType: 'primary',
      retrievedVia: 'edgar',
      excerpt: 'Ostrander Holdings will divest its Tidewell Tacos brand to Fennimore Kitchen Group for $380m in cash.',
    },

    // S14 for Deal 9 (deleted)
    {
      id: 'S14',
      jobId: 'demo-job-9',
      origin: 'demo',
      url: 'https://example.com/demo/news/pemberton-clearbrook-acquisition',
      publisher: 'Demo Newswire',
      title: 'Pemberton Household Completes Purchase of Clearbrook Cleaning',
      publishedAt: getDaysAgoDate(50, baseDate),
      accessedAt: nowIso,
      sourceType: 'primary',
      retrievedVia: 'fixture',
      excerpt: 'Pemberton Household closes buyout of Clearbrook Cleaning for $220m.',
    },

    // S15 for Deal 10 (>90 days old)
    {
      id: 'S15',
      jobId: 'demo-job-10',
      origin: 'demo',
      url: 'https://example.com/demo/filings/alder-finch-parcelnest-merger',
      publisher: 'Demo SEC Filing',
      title: 'Alder & Finch Marketplace Form 8-K Purchase of Parcelnest Logistics',
      publishedAt: getDaysAgoDate(150, baseDate),
      accessedAt: nowIso,
      sourceType: 'primary',
      retrievedVia: 'edgar',
      excerpt: 'Alder & Finch Marketplace agrees to acquire Parcelnest for $820m cash.',
    },
  ];

  // 10 Deals matching Table in DATA_AND_RESEARCH §10
  const deals: Deal[] = [
    // #1: Harborline Foods -> Maple Crest Snacks (Saved, pending, full advisers)
    {
      id: 'deal-1',
      origin: 'demo',
      dedupeKey: 'harborline foods|maple crest snacks|' + getDaysAgoDate(14, baseDate).slice(0, 7),
      headline: 'Harborline Foods to acquire Maple Crest Snacks for $4.2bn',
      sector: 'Consumer & Retail',
      subsectors: ['Food & Beverage'],
      geographyRegion: 'US',
      buyerIds: ['c-harborline'],
      targetIds: ['c-maplecrest'],
      sellerIds: [],
      announcementDate: {
        value: getDaysAgoDate(14, baseDate),
        display: getDaysAgoDate(14, baseDate),
        valueStatus: 'verified',
        sourceIds: ['S1'],
      },
      closingDate: {
        value: getDaysAgoDate(-45, baseDate), // expected 45 days in future
        display: `Expected Q3 (approx. ${getDaysAgoDate(-45, baseDate)})`,
        valueStatus: 'verified',
        sourceIds: ['S1'],
        note: 'Expected closing date subject to regulatory clearance',
      },
      transactionStatus: 'pending',
      transactionStatusSourceIds: ['S1'],
      userStatus: 'saved',
      dealValue: {
        value: { amount: 4.2, currency: 'USD', unit: 'billions', valueType: 'enterprise_value' },
        display: '$4.2bn enterprise value',
        valueStatus: 'verified',
        sourceIds: ['S1', 'S3'],
      },
      quickPreview: {
        summary: {
          id: 'qp-1-sum',
          text: 'Harborline Foods agreed to acquire premium snack maker Maple Crest Snacks in an all-cash transaction valued at $4.2 billion enterprise value.',
          claimType: 'fact',
          sourceIds: ['S1'],
          confidence: 'high',
        },
        background: [
          {
            id: 'qp-1-bg-1',
            text: 'Harborline has sought to diversify away from shelf-stable pantry items toward fast-growing better-for-you snacking categories.',
            claimType: 'fact',
            sourceIds: ['S3'],
            confidence: 'high',
          },
        ],
        parties: [
          { companyId: 'c-harborline', role: 'buyer', sourceIds: ['S1'] },
          { companyId: 'c-maplecrest', role: 'target', sourceIds: ['S1'] },
        ],
        advisers: [
          { firm: 'Morgan Stanley', role: 'financial', side: 'buyer', sourceIds: ['S2'] },
          { firm: 'Centerview Partners', role: 'financial', side: 'target', sourceIds: ['S2'] },
          { firm: 'Davis Polk & Wardwell', role: 'legal', side: 'buyer', sourceIds: ['S1'] },
          { firm: 'Wachtell, Lipton, Rosen & Katz', role: 'legal', side: 'target', sourceIds: ['S1'] },
        ],
        dealValue: {
          value: { amount: 4.2, currency: 'USD', unit: 'billions', valueType: 'enterprise_value' },
          display: '$4.2bn enterprise value',
          valueStatus: 'verified',
          sourceIds: ['S1'],
        },
        multiples: [
          {
            label: 'EV / LTM EBITDA',
            fact: {
              value: 14.5,
              display: '14.5x',
              valueStatus: 'reported',
              sourceIds: ['S3'],
            },
          },
        ],
        timeline: [
          {
            id: 'qp-1-time-1',
            text: `Announced on ${getDaysAgoDate(14, baseDate)}; anticipated closing in Q3.`,
            claimType: 'fact',
            sourceIds: ['S1'],
            confidence: 'high',
          },
        ],
        differentiators: [
          {
            id: 'qp-1-diff-1',
            text: 'Maple Crest offers direct-store-delivery distribution in key natural grocery channels, enhancing Harborline footprint.',
            claimType: 'analysis',
            sourceIds: ['S3'],
            reasoning: 'Extracted from industry review noting regional distribution exclusivity.',
            confidence: 'medium',
          },
        ],
        drivers: [
          {
            id: 'qp-1-driv-1',
            text: 'Growing consumer preference for organic, non-GMO snacks drives premium consolidation.',
            claimType: 'analysis',
            sourceIds: ['S3'],
            reasoning: 'Synthesized from management statements on brand consumer overlap.',
            confidence: 'high',
          },
        ],
        trendTags: ['Better-for-you snacking', 'Direct-store-delivery', 'CPG consolidation'],
        noveltyTags: ['Contested pre-bid process'],
        sourceIds: ['S1', 'S2', 'S3'],
      },
      ranking: {
        score: 0.92,
        features: {
          sectorRelevance: 1.0,
          recency: 0.84,
          significance: 0.95,
          primaryEvidence: 1.0,
          trendRelevance: 1.0,
          novelty: 0.5,
        },
        reasons: ['Primary 8-K verified', 'Leading Food & Beverage subsector fit', 'Disclosed $4.2bn transaction size'],
      },
      firstSeenRunId: 'run-seed-1',
      searchRunIds: ['run-seed-1'],
      createdAt: nowIso,
      updatedAt: nowIso,
    },

    // #2: Copperleaf Beverage Co. -> Brightwater Seltzer (Closed, cash + stock, exchange ratio)
    {
      id: 'deal-2',
      origin: 'demo',
      dedupeKey: 'copperleaf beverage co.|brightwater seltzer|' + getDaysAgoDate(35, baseDate).slice(0, 7),
      headline: 'Copperleaf Beverage acquires Brightwater Seltzer for $1.8bn',
      sector: 'Consumer & Retail',
      subsectors: ['Food & Beverage'],
      geographyRegion: 'US',
      buyerIds: ['c-copperleaf'],
      targetIds: ['c-brightwater'],
      sellerIds: [],
      announcementDate: {
        value: getDaysAgoDate(35, baseDate),
        display: getDaysAgoDate(35, baseDate),
        valueStatus: 'verified',
        sourceIds: ['S4'],
      },
      closingDate: {
        value: getDaysAgoDate(5, baseDate),
        display: `Closed on ${getDaysAgoDate(5, baseDate)}`,
        valueStatus: 'verified',
        sourceIds: ['S4'],
        note: 'Transaction officially closed',
      },
      transactionStatus: 'closed',
      transactionStatusSourceIds: ['S4'],
      userStatus: 'discovered',
      dealValue: {
        value: { amount: 1.8, currency: 'USD', unit: 'billions', valueType: 'enterprise_value' },
        display: '$1.8bn enterprise value',
        valueStatus: 'verified',
        sourceIds: ['S4'],
      },
      quickPreview: {
        summary: {
          id: 'qp-2-sum',
          text: 'Copperleaf Beverage completed the acquisition of craft sparkling water brand Brightwater Seltzer for $1.8bn in cash and stock.',
          claimType: 'fact',
          sourceIds: ['S4', 'S5'],
          confidence: 'high',
        },
        background: [
          {
            id: 'qp-2-bg-1',
            text: 'Transaction structure includes 60% cash and 40% Copperleaf common stock at a fixed exchange ratio of 0.425.',
            claimType: 'fact',
            sourceIds: ['S4'],
            confidence: 'high',
          },
        ],
        parties: [
          { companyId: 'c-copperleaf', role: 'buyer', sourceIds: ['S4'] },
          { companyId: 'c-brightwater', role: 'target', sourceIds: ['S4'] },
        ],
        advisers: [
          { firm: 'Goldman Sachs', role: 'financial', side: 'buyer', sourceIds: ['S5'] },
          { firm: 'Evercore', role: 'financial', side: 'target', sourceIds: ['S5'] },
        ],
        dealValue: {
          value: { amount: 1.8, currency: 'USD', unit: 'billions', valueType: 'enterprise_value' },
          display: '$1.8bn enterprise value',
          valueStatus: 'verified',
          sourceIds: ['S4'],
        },
        multiples: [
          {
            label: 'EV / Revenue',
            fact: {
              value: 4.8,
              display: '4.8x',
              valueStatus: 'reported',
              sourceIds: ['S5'],
            },
          },
        ],
        timeline: [
          {
            id: 'qp-2-time-1',
            text: `Announced ${getDaysAgoDate(35, baseDate)}, completed ${getDaysAgoDate(5, baseDate)}.`,
            claimType: 'fact',
            sourceIds: ['S4'],
            confidence: 'high',
          },
        ],
        differentiators: [
          {
            id: 'qp-2-diff-1',
            text: 'Combines direct sparkling distribution with nationwide wholesale reach.',
            claimType: 'analysis',
            sourceIds: ['S5'],
            reasoning: 'Market analysis of beverage network synergies.',
            confidence: 'medium',
          },
        ],
        drivers: [
          {
            id: 'qp-2-driv-1',
            text: 'Beverage giants deploying balance sheets to capture flavored functional seltzer category growth.',
            claimType: 'analysis',
            sourceIds: ['S5'],
            reasoning: 'Synthesized trend observations.',
            confidence: 'high',
          },
        ],
        trendTags: ['Functional beverages', 'Stock consideration', 'Exchange ratio'],
        noveltyTags: ['Cash/stock hybrid structure'],
        sourceIds: ['S4', 'S5'],
      },
      ranking: {
        score: 0.88,
        features: { sectorRelevance: 1.0, recency: 0.65, significance: 0.88, primaryEvidence: 1.0, trendRelevance: 1.0, novelty: 0.5 },
        reasons: ['Primary 8-K verified', 'Cash + stock consideration structure', 'Subsector exact match'],
      },
      firstSeenRunId: 'run-seed-1',
      searchRunIds: ['run-seed-1'],
      createdAt: nowIso,
      updatedAt: nowIso,
    },

    // #3: Nimbus Pet Brands -> Tallgrass Pet Supply (No advisers disclosed)
    {
      id: 'deal-3',
      origin: 'demo',
      dedupeKey: 'nimbus pet brands|tallgrass pet supply|' + getDaysAgoDate(28, baseDate).slice(0, 7),
      headline: 'Nimbus Pet Brands purchases Tallgrass Pet Supply for $650m',
      sector: 'Consumer & Retail',
      subsectors: ['Pet'],
      geographyRegion: 'US',
      buyerIds: ['c-nimbus'],
      targetIds: ['c-tallgrass'],
      sellerIds: [],
      announcementDate: {
        value: getDaysAgoDate(28, baseDate),
        display: getDaysAgoDate(28, baseDate),
        valueStatus: 'verified',
        sourceIds: ['S6'],
      },
      closingDate: {
        value: getDaysAgoDate(-30, baseDate),
        display: 'Expected within 60 days',
        valueStatus: 'verified',
        sourceIds: ['S6'],
      },
      transactionStatus: 'pending',
      transactionStatusSourceIds: ['S6'],
      userStatus: 'discovered',
      dealValue: {
        value: { amount: 650, currency: 'USD', unit: 'millions', valueType: 'purchase_price' },
        display: '$650m purchase price',
        valueStatus: 'verified',
        sourceIds: ['S6'],
      },
      quickPreview: {
        summary: {
          id: 'qp-3-sum',
          text: 'Nimbus Pet Brands reached an agreement to acquire organic pet treats producer Tallgrass Pet Supply for $650 million.',
          claimType: 'fact',
          sourceIds: ['S6'],
          confidence: 'high',
        },
        background: [
          {
            id: 'qp-3-bg-1',
            text: 'Privately held Tallgrass Pet Supply expands Nimbus portfolio in high-margin canine nutrition.',
            claimType: 'fact',
            sourceIds: ['S6'],
            confidence: 'high',
          },
        ],
        parties: [
          { companyId: 'c-nimbus', role: 'buyer', sourceIds: ['S6'] },
          { companyId: 'c-tallgrass', role: 'target', sourceIds: ['S6'] },
        ],
        advisers: [], // Intentionally empty: UI must show "Not yet found"
        dealValue: {
          value: { amount: 650, currency: 'USD', unit: 'millions', valueType: 'purchase_price' },
          display: '$650m purchase price',
          valueStatus: 'verified',
          sourceIds: ['S6'],
        },
        multiples: [],
        timeline: [
          {
            id: 'qp-3-time-1',
            text: `Announced on ${getDaysAgoDate(28, baseDate)}.`,
            claimType: 'fact',
            sourceIds: ['S6'],
            confidence: 'high',
          },
        ],
        differentiators: [
          {
            id: 'qp-3-diff-1',
            text: 'Direct-to-consumer subscriber base represents 40% of target recurring revenues.',
            claimType: 'analysis',
            sourceIds: ['S6'],
            reasoning: 'Extracted company business description.',
            confidence: 'medium',
          },
        ],
        drivers: [
          {
            id: 'qp-3-driv-1',
            text: 'Pet humanization trend fueling premium holistic treat acquisitions.',
            claimType: 'analysis',
            sourceIds: ['S6'],
            reasoning: 'Sector trend synthesis.',
            confidence: 'high',
          },
        ],
        trendTags: ['Pet humanization', 'DTC subscription'],
        noveltyTags: [],
        sourceIds: ['S6'],
      },
      ranking: {
        score: 0.74,
        features: { sectorRelevance: 0.8, recency: 0.72, significance: 0.65, primaryEvidence: 1.0, trendRelevance: 0.8, novelty: 0.0 },
        reasons: ['Primary newswire verified', 'Active pet care consolidation', 'No financial advisers disclosed'],
      },
      firstSeenRunId: 'run-seed-1',
      searchRunIds: ['run-seed-1'],
      createdAt: nowIso,
      updatedAt: nowIso,
    },

    // #4: Verity Beauty Group -> Oakmoss Naturals (Conflicting values EV $1.25bn vs $1.32bn)
    {
      id: 'deal-4',
      origin: 'demo',
      dedupeKey: 'verity beauty group|oakmoss naturals|' + getDaysAgoDate(40, baseDate).slice(0, 7),
      headline: 'Verity Beauty Group agrees to purchase Oakmoss Naturals',
      sector: 'Consumer & Retail',
      subsectors: ['Beauty & Personal Care'],
      geographyRegion: 'US',
      buyerIds: ['c-verity'],
      targetIds: ['c-oakmoss'],
      sellerIds: [],
      announcementDate: {
        value: getDaysAgoDate(40, baseDate),
        display: getDaysAgoDate(40, baseDate),
        valueStatus: 'verified',
        sourceIds: ['S7'],
      },
      closingDate: {
        value: getDaysAgoDate(-15, baseDate),
        display: 'Pending HSR clearance',
        valueStatus: 'verified',
        sourceIds: ['S7'],
      },
      transactionStatus: 'pending',
      transactionStatusSourceIds: ['S7'],
      userStatus: 'discovered',
      dealValue: {
        value: { amount: 1.25, currency: 'USD', unit: 'billions', valueType: 'enterprise_value' },
        display: '$1.25bn enterprise value',
        valueStatus: 'conflicting',
        sourceIds: ['S7', 'S8'],
        alternatives: [
          {
            value: { amount: 1.32, currency: 'USD', unit: 'billions', valueType: 'enterprise_value' },
            display: '$1.32bn enterprise value (incl. earnouts)',
            sourceIds: ['S8'],
            note: 'Secondary source includes max contingent milestones',
          },
        ],
        note: 'Disclosed base enterprise value is $1.25bn; press reports cite up to $1.32bn with earnouts.',
      },
      quickPreview: {
        summary: {
          id: 'qp-4-sum',
          text: 'Verity Beauty Group signed a definitive agreement to acquire clean skincare brand Oakmoss Naturals.',
          claimType: 'fact',
          sourceIds: ['S7'],
          confidence: 'high',
        },
        background: [
          {
            id: 'qp-4-bg-1',
            text: 'Filing states $1.25bn headline EV with $1.10bn upfront equity value, while secondary media quotes $1.32bn including performance earnouts.',
            claimType: 'fact',
            sourceIds: ['S7', 'S8'],
            confidence: 'high',
          },
        ],
        parties: [
          { companyId: 'c-verity', role: 'buyer', sourceIds: ['S7'] },
          { companyId: 'c-oakmoss', role: 'target', sourceIds: ['S7'] },
        ],
        advisers: [
          { firm: 'Lazard', role: 'financial', side: 'buyer', sourceIds: ['S7'] },
          { firm: 'Jefferies', role: 'financial', side: 'target', sourceIds: ['S8'] },
        ],
        dealValue: {
          value: { amount: 1.25, currency: 'USD', unit: 'billions', valueType: 'enterprise_value' },
          display: '$1.25bn enterprise value',
          valueStatus: 'conflicting',
          sourceIds: ['S7', 'S8'],
          alternatives: [
            {
              value: { amount: 1.32, currency: 'USD', unit: 'billions', valueType: 'enterprise_value' },
              display: '$1.32bn enterprise value',
              sourceIds: ['S8'],
              note: 'Includes earnouts',
            },
          ],
        },
        multiples: [],
        timeline: [
          { id: 'qp-4-time-1', text: `Announced ${getDaysAgoDate(40, baseDate)}.`, claimType: 'fact', sourceIds: ['S7'], confidence: 'high' },
        ],
        differentiators: [
          { id: 'qp-4-diff-1', text: 'Clean-beauty clinical validation credentials appeal to prestige department stores.', claimType: 'analysis', sourceIds: ['S8'], reasoning: 'Product positioning synthesis.', confidence: 'medium' },
        ],
        drivers: [
          { id: 'qp-4-driv-1', text: 'Major cosmetics strategics buying clinical clean indie brands to counter legacy brand decay.', claimType: 'analysis', sourceIds: ['S8'], reasoning: 'Beauty M&A trend context.', confidence: 'high' },
        ],
        trendTags: ['Clean beauty', 'Clinical skincare', 'Earnout structure'],
        noveltyTags: ['Contingent milestone earnouts'],
        sourceIds: ['S7', 'S8'],
      },
      ranking: {
        score: 0.82,
        features: { sectorRelevance: 0.9, recency: 0.58, significance: 0.82, primaryEvidence: 1.0, trendRelevance: 0.9, novelty: 0.5 },
        reasons: ['Conflicting valuation reports surfaced', 'Primary proxy filing confirmed', 'Clinical skincare momentum'],
      },
      firstSeenRunId: 'run-seed-1',
      searchRunIds: ['run-seed-1'],
      createdAt: nowIso,
      updatedAt: nowIso,
    },

    // #5: Summit Ridge Partners (sponsor) -> Lark & Linen (Take-private, premium with unaffected date)
    {
      id: 'deal-5',
      origin: 'demo',
      dedupeKey: 'summit ridge partners|lark & linen|' + getDaysAgoDate(20, baseDate).slice(0, 7),
      headline: 'Summit Ridge Partners to take Lark & Linen private for $2.1bn',
      sector: 'Consumer & Retail',
      subsectors: ['Apparel & Luxury'],
      geographyRegion: 'US',
      buyerIds: ['c-summitridge'],
      targetIds: ['c-larklinen'],
      sellerIds: [],
      announcementDate: {
        value: getDaysAgoDate(20, baseDate),
        display: getDaysAgoDate(20, baseDate),
        valueStatus: 'verified',
        sourceIds: ['S9'],
      },
      closingDate: {
        value: getDaysAgoDate(-60, baseDate),
        display: 'Expected Q4',
        valueStatus: 'verified',
        sourceIds: ['S9'],
      },
      transactionStatus: 'pending',
      transactionStatusSourceIds: ['S9'],
      userStatus: 'discovered',
      dealValue: {
        value: { amount: 2.1, currency: 'USD', unit: 'billions', valueType: 'enterprise_value' },
        display: '$2.1bn enterprise value',
        valueStatus: 'verified',
        sourceIds: ['S9'],
      },
      quickPreview: {
        summary: {
          id: 'qp-5-sum',
          text: 'Private equity firm Summit Ridge Partners agreed to acquire apparel retailer Lark & Linen Co in a $2.1bn take-private transaction at $34.00 per share.',
          claimType: 'fact',
          sourceIds: ['S9', 'S10'],
          confidence: 'high',
        },
        background: [
          {
            id: 'qp-5-bg-1',
            text: `The $34.00 offer price represents a 32% premium over the unaffected closing price of $25.75 on ${getDaysAgoDate(25, baseDate)}.`,
            claimType: 'fact',
            sourceIds: ['S9', 'S10'],
            confidence: 'high',
          },
        ],
        parties: [
          { companyId: 'c-summitridge', role: 'buyer', sourceIds: ['S9'] },
          { companyId: 'c-larklinen', role: 'target', sourceIds: ['S9'] },
        ],
        advisers: [
          { firm: 'Barclays', role: 'financial', side: 'buyer', sourceIds: ['S10'] },
          { firm: 'J.P. Morgan', role: 'financial', side: 'target', sourceIds: ['S10'] },
        ],
        dealValue: {
          value: { amount: 2.1, currency: 'USD', unit: 'billions', valueType: 'enterprise_value' },
          display: '$2.1bn enterprise value',
          valueStatus: 'verified',
          sourceIds: ['S9'],
        },
        multiples: [],
        timeline: [
          { id: 'qp-5-time-1', text: `Announced ${getDaysAgoDate(20, baseDate)}.`, claimType: 'fact', sourceIds: ['S9'], confidence: 'high' },
        ],
        differentiators: [
          { id: 'qp-5-diff-1', text: 'Sponsor plans store footprint optimization away from underperforming malls toward street retail.', claimType: 'analysis', sourceIds: ['S10'], reasoning: 'Turnaround thesis in press reports.', confidence: 'medium' },
        ],
        drivers: [
          { id: 'qp-5-driv-1', text: 'Depressed retail multiples creating attractive take-private entry valuations for sponsors.', claimType: 'analysis', sourceIds: ['S10'], reasoning: 'Sponsor sector context.', confidence: 'high' },
        ],
        trendTags: ['Take-private', 'Sponsor LBO', 'Retail turnaround'],
        noveltyTags: ['Sponsor involvement', '32% unaffected premium'],
        sourceIds: ['S9', 'S10'],
      },
      ranking: {
        score: 0.89,
        features: { sectorRelevance: 0.9, recency: 0.78, significance: 0.9, primaryEvidence: 1.0, trendRelevance: 0.9, novelty: 0.75 },
        reasons: ['PE Sponsor take-private', '32% verified unaffected premium', 'Primary Schedule 13D filing'],
      },
      firstSeenRunId: 'run-seed-1',
      searchRunIds: ['run-seed-1'],
      createdAt: nowIso,
      updatedAt: nowIso,
    },

    // #6: Corvane Retail -> Bluefin Outfitters (Terminated after regulatory review)
    {
      id: 'deal-6',
      origin: 'demo',
      dedupeKey: 'corvane retail|bluefin outfitters|' + getDaysAgoDate(45, baseDate).slice(0, 7),
      headline: 'Corvane Retail and Bluefin Outfitters terminate $950m merger',
      sector: 'Consumer & Retail',
      subsectors: ['Retail'],
      geographyRegion: 'US',
      buyerIds: ['c-corvane'],
      targetIds: ['c-bluefin'],
      sellerIds: [],
      announcementDate: {
        value: getDaysAgoDate(75, baseDate),
        display: getDaysAgoDate(75, baseDate),
        valueStatus: 'verified',
        sourceIds: ['S11'],
      },
      closingDate: {
        value: getDaysAgoDate(45, baseDate),
        display: `Terminated on ${getDaysAgoDate(45, baseDate)}`,
        valueStatus: 'verified',
        sourceIds: ['S11'],
        note: 'Terminated following antitrust second request',
      },
      transactionStatus: 'terminated',
      transactionStatusSourceIds: ['S11'],
      userStatus: 'discovered',
      dealValue: {
        value: { amount: 950, currency: 'USD', unit: 'millions', valueType: 'enterprise_value' },
        display: '$950m enterprise value',
        valueStatus: 'verified',
        sourceIds: ['S11'],
      },
      quickPreview: {
        summary: {
          id: 'qp-6-sum',
          text: 'Corvane Retail and Bluefin Outfitters mutually agreed to abandon their proposed $950m transaction following antitrust opposition.',
          claimType: 'fact',
          sourceIds: ['S11'],
          confidence: 'high',
        },
        background: [
          {
            id: 'qp-6-bg-1',
            text: 'Regulatory authorities expressed concerns regarding regional market concentration in outdoor sports equipment.',
            claimType: 'fact',
            sourceIds: ['S11'],
            confidence: 'high',
          },
        ],
        parties: [
          { companyId: 'c-corvane', role: 'buyer', sourceIds: ['S11'] },
          { companyId: 'c-bluefin', role: 'target', sourceIds: ['S11'] },
        ],
        advisers: [],
        dealValue: {
          value: { amount: 950, currency: 'USD', unit: 'millions', valueType: 'enterprise_value' },
          display: '$950m enterprise value',
          valueStatus: 'verified',
          sourceIds: ['S11'],
        },
        multiples: [],
        timeline: [
          { id: 'qp-6-time-1', text: `Announced ${getDaysAgoDate(75, baseDate)}, terminated ${getDaysAgoDate(45, baseDate)}.`, claimType: 'fact', sourceIds: ['S11'], confidence: 'high' },
        ],
        differentiators: [
          { id: 'qp-6-diff-1', text: 'Regulatory remedy divestitures were deemed uneconomic by Corvane management.', claimType: 'analysis', sourceIds: ['S11'], reasoning: 'Termination filing analysis.', confidence: 'medium' },
        ],
        drivers: [
          { id: 'qp-6-driv-1', text: 'Heightened FTC/DOJ scrutiny on regional specialty retail mergers.', claimType: 'analysis', sourceIds: ['S11'], reasoning: 'Antitrust climate review.', confidence: 'high' },
        ],
        trendTags: ['Regulatory challenge', 'Breakup', 'Antitrust review'],
        noveltyTags: ['Regulatory review termination'],
        sourceIds: ['S11'],
      },
      ranking: {
        score: 0.71,
        features: { sectorRelevance: 0.8, recency: 0.45, significance: 0.72, primaryEvidence: 1.0, trendRelevance: 0.8, novelty: 0.5 },
        reasons: ['Antitrust regulatory termination', 'Terminated status verified by 8-K', 'Retail outdoor equipment'],
      },
      firstSeenRunId: 'run-seed-1',
      searchRunIds: ['run-seed-1'],
      createdAt: nowIso,
      updatedAt: nowIso,
    },

    // #7: Hearthstone Home -> Juniper Living (Rumored, secondary source only)
    {
      id: 'deal-7',
      origin: 'demo',
      dedupeKey: 'hearthstone home|juniper living|' + getDaysAgoDate(10, baseDate).slice(0, 7),
      headline: 'Hearthstone Home rumored in talks to acquire Juniper Living for $500m',
      sector: 'Consumer & Retail',
      subsectors: ['Home & Leisure'],
      geographyRegion: 'US',
      buyerIds: ['c-hearthstone'],
      targetIds: ['c-juniper'],
      sellerIds: [],
      announcementDate: {
        value: getDaysAgoDate(10, baseDate),
        display: `Reported on ${getDaysAgoDate(10, baseDate)}`,
        valueStatus: 'reported',
        sourceIds: ['S12'],
        note: 'Reported — not announced',
      },
      closingDate: {
        valueStatus: 'not_found',
        sourceIds: [],
        note: 'Rumored deal; no closing timetable established',
      },
      transactionStatus: 'rumored',
      transactionStatusSourceIds: ['S12'],
      userStatus: 'discovered',
      dealValue: {
        value: { amount: 500, currency: 'USD', unit: 'millions', valueType: 'enterprise_value' },
        display: '~$500m enterprise value (rumored)',
        valueStatus: 'reported',
        sourceIds: ['S12'],
        note: 'Reported — not announced',
      },
      quickPreview: {
        summary: {
          id: 'qp-7-sum',
          text: 'Hearthstone Home is reportedly exploring an acquisition of direct-to-consumer home furnishings maker Juniper Living.',
          claimType: 'fact',
          sourceIds: ['S12'],
          confidence: 'medium',
        },
        background: [
          {
            id: 'qp-7-bg-1',
            text: 'Discussions remain ongoing and an agreement may not materialize.',
            claimType: 'fact',
            sourceIds: ['S12'],
            confidence: 'medium',
          },
        ],
        parties: [
          { companyId: 'c-hearthstone', role: 'buyer', sourceIds: ['S12'] },
          { companyId: 'c-juniper', role: 'target', sourceIds: ['S12'] },
        ],
        advisers: [],
        dealValue: {
          value: { amount: 500, currency: 'USD', unit: 'millions', valueType: 'enterprise_value' },
          display: '~$500m enterprise value',
          valueStatus: 'reported',
          sourceIds: ['S12'],
        },
        multiples: [],
        timeline: [
          { id: 'qp-7-time-1', text: `First reported ${getDaysAgoDate(10, baseDate)}.`, claimType: 'fact', sourceIds: ['S12'], confidence: 'medium' },
        ],
        differentiators: [
          { id: 'qp-7-diff-1', text: 'Juniper Living offers modern modular upholstery appealing to younger demographics.', claimType: 'analysis', sourceIds: ['S12'], reasoning: 'Market reporting assessment.', confidence: 'low' },
        ],
        drivers: [
          { id: 'qp-7-driv-1', text: 'Legacy furniture retailers seeking digital DTC native brands.', claimType: 'analysis', sourceIds: ['S12'], reasoning: 'Industry trend synthesis.', confidence: 'medium' },
        ],
        trendTags: ['DTC furnishings', 'Rumored deal'],
        noveltyTags: ['Unconfirmed market talks'],
        sourceIds: ['S12'],
      },
      ranking: {
        score: 0.65,
        features: { sectorRelevance: 0.8, recency: 0.9, significance: 0.58, primaryEvidence: 0.4, trendRelevance: 0.7, novelty: 0.25 },
        reasons: ['Reported — not announced', 'Recent press rumor', 'Secondary media report only'],
      },
      firstSeenRunId: 'run-seed-1',
      searchRunIds: ['run-seed-1'],
      createdAt: nowIso,
      updatedAt: nowIso,
    },

    // #8: Fennimore Kitchen Group -> Tidewell Tacos (carve-out from Ostrander, Review status)
    {
      id: 'deal-8',
      origin: 'demo',
      dedupeKey: 'fennimore kitchen group|tidewell tacos|' + getDaysAgoDate(15, baseDate).slice(0, 7),
      headline: 'Fennimore Kitchen Group buys Tidewell Tacos carve-out for $380m',
      sector: 'Consumer & Retail',
      subsectors: ['Restaurants'],
      geographyRegion: 'US',
      buyerIds: ['c-fennimore'],
      targetIds: ['c-tidewell'],
      sellerIds: ['c-ostrander'],
      announcementDate: {
        value: getDaysAgoDate(15, baseDate),
        display: getDaysAgoDate(15, baseDate),
        valueStatus: 'verified',
        sourceIds: ['S13'],
      },
      closingDate: {
        value: getDaysAgoDate(-30, baseDate),
        display: 'Expected closing next month',
        valueStatus: 'verified',
        sourceIds: ['S13'],
      },
      transactionStatus: 'pending',
      transactionStatusSourceIds: ['S13'],
      userStatus: 'review', // "On hold" in queue
      dealValue: {
        value: { amount: 380, currency: 'USD', unit: 'millions', valueType: 'purchase_price' },
        display: '$380m purchase price',
        valueStatus: 'verified',
        sourceIds: ['S13'],
      },
      quickPreview: {
        summary: {
          id: 'qp-8-sum',
          text: 'Fennimore Kitchen Group agreed to acquire fast-casual brand Tidewell Tacos from seller Ostrander Holdings for $380 million in cash.',
          claimType: 'fact',
          sourceIds: ['S13'],
          confidence: 'high',
        },
        background: [
          {
            id: 'qp-8-bg-1',
            text: 'Ostrander is divesting Tidewell to refocus capital on its core casual dining restaurant concepts.',
            claimType: 'fact',
            sourceIds: ['S13'],
            confidence: 'high',
          },
        ],
        parties: [
          { companyId: 'c-fennimore', role: 'buyer', sourceIds: ['S13'] },
          { companyId: 'c-tidewell', role: 'target', sourceIds: ['S13'] },
          { companyId: 'c-ostrander', role: 'seller', sourceIds: ['S13'] },
        ],
        advisers: [
          { firm: 'Piper Sandler', role: 'financial', side: 'seller', sourceIds: ['S13'] },
        ],
        dealValue: {
          value: { amount: 380, currency: 'USD', unit: 'millions', valueType: 'purchase_price' },
          display: '$380m purchase price',
          valueStatus: 'verified',
          sourceIds: ['S13'],
        },
        multiples: [],
        timeline: [
          { id: 'qp-8-time-1', text: `Announced ${getDaysAgoDate(15, baseDate)}.`, claimType: 'fact', sourceIds: ['S13'], confidence: 'high' },
        ],
        differentiators: [
          { id: 'qp-8-diff-1', text: 'Fast-casual Mexican concept boasts 22% unit-level restaurant operating margins.', claimType: 'analysis', sourceIds: ['S13'], reasoning: 'Divestiture presentation metrics.', confidence: 'medium' },
        ],
        drivers: [
          { id: 'qp-8-driv-1', text: 'Multi-concept restaurant operators streamlining holding company portfolios via brand carve-outs.', claimType: 'analysis', sourceIds: ['S13'], reasoning: 'Portfolio restructuring rationale.', confidence: 'high' },
        ],
        trendTags: ['Corporate carve-out', 'Fast casual', 'Divestiture'],
        noveltyTags: ['Carve-out with designated seller'],
        sourceIds: ['S13'],
      },
      ranking: {
        score: 0.81,
        features: { sectorRelevance: 0.85, recency: 0.82, significance: 0.54, primaryEvidence: 1.0, trendRelevance: 0.85, novelty: 0.5 },
        reasons: ['Corporate carve-out structure', 'Primary 8-K verified', 'Distinct seller entity identified'],
      },
      firstSeenRunId: 'run-seed-1',
      searchRunIds: ['run-seed-1'],
      createdAt: nowIso,
      updatedAt: nowIso,
    },

    // #9: Pemberton Household -> Clearbrook Cleaning (Deleted in Recycle Bin)
    {
      id: 'deal-9',
      origin: 'demo',
      dedupeKey: 'pemberton household|clearbrook cleaning|' + getDaysAgoDate(50, baseDate).slice(0, 7),
      headline: 'Pemberton Household closes $220m acquisition of Clearbrook Cleaning',
      sector: 'Consumer & Retail',
      subsectors: ['Household Products'],
      geographyRegion: 'US',
      buyerIds: ['c-pemberton'],
      targetIds: ['c-clearbrook'],
      sellerIds: [],
      announcementDate: {
        value: getDaysAgoDate(50, baseDate),
        display: getDaysAgoDate(50, baseDate),
        valueStatus: 'verified',
        sourceIds: ['S14'],
      },
      closingDate: {
        value: getDaysAgoDate(20, baseDate),
        display: `Closed on ${getDaysAgoDate(20, baseDate)}`,
        valueStatus: 'verified',
        sourceIds: ['S14'],
      },
      transactionStatus: 'closed',
      transactionStatusSourceIds: ['S14'],
      userStatus: 'deleted',
      statusBeforeDelete: 'discovered',
      deletedAt: getDaysAgoDate(5, baseDate),
      dealValue: {
        value: { amount: 220, currency: 'USD', unit: 'millions', valueType: 'enterprise_value' },
        display: '$220m enterprise value',
        valueStatus: 'verified',
        sourceIds: ['S14'],
      },
      quickPreview: {
        summary: {
          id: 'qp-9-sum',
          text: 'Pemberton Household acquired eco-friendly cleaning supplies brand Clearbrook Cleaning for $220 million.',
          claimType: 'fact',
          sourceIds: ['S14'],
          confidence: 'high',
        },
        background: [
          {
            id: 'qp-9-bg-1',
            text: 'Clearbrook products feature refillable plant-based concentrates.',
            claimType: 'fact',
            sourceIds: ['S14'],
            confidence: 'high',
          },
        ],
        parties: [
          { companyId: 'c-pemberton', role: 'buyer', sourceIds: ['S14'] },
          { companyId: 'c-clearbrook', role: 'target', sourceIds: ['S14'] },
        ],
        advisers: [],
        dealValue: {
          value: { amount: 220, currency: 'USD', unit: 'millions', valueType: 'enterprise_value' },
          display: '$220m enterprise value',
          valueStatus: 'verified',
          sourceIds: ['S14'],
        },
        multiples: [],
        timeline: [
          { id: 'qp-9-time-1', text: `Announced ${getDaysAgoDate(50, baseDate)}, closed ${getDaysAgoDate(20, baseDate)}.`, claimType: 'fact', sourceIds: ['S14'], confidence: 'high' },
        ],
        differentiators: [
          { id: 'qp-9-diff-1', text: 'Zero-plastic packaging certification.', claimType: 'analysis', sourceIds: ['S14'], reasoning: 'Product claim review.', confidence: 'medium' },
        ],
        drivers: [
          { id: 'qp-9-driv-1', text: 'Household giants bolstering sustainability portfolios.', claimType: 'analysis', sourceIds: ['S14'], reasoning: 'Sector overview.', confidence: 'high' },
        ],
        trendTags: ['Eco cleaning', 'Refill concentrates'],
        noveltyTags: [],
        sourceIds: ['S14'],
      },
      ranking: {
        score: 0.68,
        features: { sectorRelevance: 0.8, recency: 0.48, significance: 0.45, primaryEvidence: 1.0, trendRelevance: 0.8, novelty: 0.0 },
        reasons: ['Deleted by user', 'Sustainable cleaning products', 'Completed all-cash acquisition'],
      },
      firstSeenRunId: 'run-seed-1',
      searchRunIds: ['run-seed-1'],
      createdAt: nowIso,
      updatedAt: nowIso,
    },

    // #10: Alder & Finch Marketplace -> Parcelnest (>90 days old: 150 days ago)
    {
      id: 'deal-10',
      origin: 'demo',
      dedupeKey: 'alder & finch marketplace|parcelnest|' + getDaysAgoDate(150, baseDate).slice(0, 7),
      headline: 'Alder & Finch Marketplace to acquire Parcelnest for $820m',
      sector: 'Consumer & Retail',
      subsectors: ['E-commerce & Marketplaces'],
      geographyRegion: 'US',
      buyerIds: ['c-alderfinch'],
      targetIds: ['c-parcelnest'],
      sellerIds: [],
      announcementDate: {
        value: getDaysAgoDate(150, baseDate),
        display: getDaysAgoDate(150, baseDate),
        valueStatus: 'verified',
        sourceIds: ['S15'],
      },
      closingDate: {
        value: getDaysAgoDate(80, baseDate),
        display: `Closed on ${getDaysAgoDate(80, baseDate)}`,
        valueStatus: 'verified',
        sourceIds: ['S15'],
      },
      transactionStatus: 'closed',
      transactionStatusSourceIds: ['S15'],
      userStatus: 'discovered',
      dealValue: {
        value: { amount: 820, currency: 'USD', unit: 'millions', valueType: 'enterprise_value' },
        display: '$820m enterprise value',
        valueStatus: 'verified',
        sourceIds: ['S15'],
      },
      quickPreview: {
        summary: {
          id: 'qp-10-sum',
          text: 'Alder & Finch Marketplace completed the buyout of last-mile logistics and fulfillment provider Parcelnest for $820m.',
          claimType: 'fact',
          sourceIds: ['S15'],
          confidence: 'high',
        },
        background: [
          {
            id: 'qp-10-bg-1',
            text: 'Parcelnest operates automated micro-fulfillment centers in 18 metropolitan areas.',
            claimType: 'fact',
            sourceIds: ['S15'],
            confidence: 'high',
          },
        ],
        parties: [
          { companyId: 'c-alderfinch', role: 'buyer', sourceIds: ['S15'] },
          { companyId: 'c-parcelnest', role: 'target', sourceIds: ['S15'] },
        ],
        advisers: [],
        dealValue: {
          value: { amount: 820, currency: 'USD', unit: 'millions', valueType: 'enterprise_value' },
          display: '$820m enterprise value',
          valueStatus: 'verified',
          sourceIds: ['S15'],
        },
        multiples: [],
        timeline: [
          { id: 'qp-10-time-1', text: `Announced ${getDaysAgoDate(150, baseDate)}.`, claimType: 'fact', sourceIds: ['S15'], confidence: 'high' },
        ],
        differentiators: [
          { id: 'qp-10-diff-1', text: 'Same-day delivery fulfillment software integration reduces marketplace churn.', claimType: 'analysis', sourceIds: ['S15'], reasoning: 'Strategic synergies review.', confidence: 'medium' },
        ],
        drivers: [
          { id: 'qp-10-driv-1', text: 'E-commerce platforms verticalizing last-mile delivery infrastructure.', claimType: 'analysis', sourceIds: ['S15'], reasoning: 'Market trend analysis.', confidence: 'high' },
        ],
        trendTags: ['Last-mile logistics', 'Micro-fulfillment', 'Vertical integration'],
        noveltyTags: [],
        sourceIds: ['S15'],
      },
      ranking: {
        score: 0.70,
        features: { sectorRelevance: 0.85, recency: 0.25, significance: 0.74, primaryEvidence: 1.0, trendRelevance: 0.85, novelty: 0.0 },
        reasons: ['Older than 90 days (150d ago)', 'Primary 8-K verified', 'E-commerce logistics integration'],
      },
      firstSeenRunId: 'run-seed-1',
      searchRunIds: ['run-seed-1'],
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];

  return { companies, sources, deals };
}
