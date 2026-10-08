export const SECTORS = [
  'Consumer & Retail',
  'Healthcare',
  'Technology',
  'Financial Institutions',
  'Industrials',
  'Energy & Power',
  'Real Estate',
  'Media & Telecom',
] as const;

export type Sector = (typeof SECTORS)[number];

export const TAXONOMY: Record<Sector, readonly string[]> = {
  'Consumer & Retail': [
    'Food & Beverage',
    'Consumer Products',
    'Retail',
    'E-commerce & Marketplaces',
    'Restaurants',
    'Beauty & Personal Care',
    'Apparel & Luxury',
    'Household Products',
    'Pet',
    'Home & Leisure',
    'Consumer Services',
  ],
  Healthcare: [
    'Biotechnology',
    'Pharmaceuticals',
    'Medical Devices & Supplies',
    'Healthcare Services & Facilities',
    'Healthcare IT & Digital Health',
    'Diagnostics & Life Sciences Tools',
  ],
  Technology: [
    'Enterprise Software & SaaS',
    'Semiconductors & Equipment',
    'Cybersecurity',
    'Cloud & Infrastructure',
    'AI & Data Analytics',
    'Fintech',
    'Consumer Internet',
  ],
  'Financial Institutions': [
    'Banking & Depository',
    'Asset & Wealth Management',
    'Insurance & Underwriting',
    'Specialty Finance & Lending',
    'Payments & Processing',
    'Broker-Dealers & Exchanges',
  ],
  Industrials: [
    'Aerospace & Defense',
    'Automotive & Mobility',
    'Machinery & Equipment',
    'Transportation & Logistics',
    'Building Products',
    'Packaging & Containers',
    'Chemicals & Advanced Materials',
  ],
  'Energy & Power': [
    'Oil & Gas Exploration & Production',
    'Midstream & Refining',
    'Renewable & Alternative Energy',
    'Utilities & Power Generation',
    'Energy Transition & Clean Tech',
    'Oilfield Services & Equipment',
  ],
  'Real Estate': [
    'Commercial Real Estate',
    'Residential Real Estate',
    'REITs',
    'Industrial & Logistics Properties',
    'Hospitality & Leisure Real Estate',
    'PropTech & Real Estate Services',
  ],
  'Media & Telecom': [
    'Broadband & Cable Providers',
    'Wireless & Mobile Carriers',
    'Film, TV & Streaming Entertainment',
    'Digital Media & Publishing',
    'Advertising & Marketing Tech',
    'Gaming & Interactive Entertainment',
  ],
};

export function getSubsectorsForSector(sector: Sector): readonly string[] {
  return TAXONOMY[sector] || [];
}

export function isValidSubsector(sector: Sector, subsector: string): boolean {
  return TAXONOMY[sector]?.includes(subsector) ?? false;
}
