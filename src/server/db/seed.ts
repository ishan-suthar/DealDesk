import { resetDatabase } from './reset';
import { settingsRepository } from '../repositories/settingsRepository';
import { companiesRepository } from '../repositories/companiesRepository';
import { sourcesRepository } from '../repositories/sourcesRepository';
import { dealsRepository } from '../repositories/dealsRepository';
import { reportsRepository } from '../repositories/reportsRepository';
import { notesRepository } from '../repositories/notesRepository';
import { searchRunsRepository } from '../repositories/searchRunsRepository';
import { generateDemoFixtures } from '@/fixtures/demoDeals';
import { generateDemoReports } from '@/fixtures/demoReports';

export async function seedDatabase(baseDate = new Date()) {
  console.log('Seeding database with demo fixtures...');
  await resetDatabase();

  await settingsRepository.getSettings(); // Ensures default Nikita settings

  const { companies, sources, deals } = generateDemoFixtures(baseDate);
  const { reports, notes } = generateDemoReports(baseDate);

  await companiesRepository.insertMany(companies);
  await sourcesRepository.insertMany(sources);

  for (const deal of deals) {
    await dealsRepository.upsert(deal);
  }

  for (const report of reports) {
    await reportsRepository.create(report);
  }

  for (const note of notes) {
    await notesRepository.create(note);
  }

  // Create initial search run for seeded discovery queue
  const seededDealIds = deals.map((d) => d.id);
  await searchRunsRepository.create({
    id: 'run-seed-1',
    filters: {
      sector: 'Consumer & Retail',
      subsectors: [],
      timeWindow: '90d',
      maxDeals: 10,
      dealStatus: 'any',
      includeRumored: true,
      geography: 'US',
    },
    provider: 'demo',
    origin: 'demo',
    jobId: 'job-seed-1',
    startedAt: baseDate.toISOString(),
    finishedAt: baseDate.toISOString(),
    resultDealIds: seededDealIds,
    excluded: [],
  });

  console.log(`Seeded successfully: ${companies.length} companies, ${sources.length} sources, ${deals.length} deals, ${reports.length} report, ${notes.length} notes.`);
}

if (process.argv[1] && /seed(\.ts)?$/.test(process.argv[1])) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
