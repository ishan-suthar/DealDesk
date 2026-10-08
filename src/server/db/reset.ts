import { runMigrations } from './migrate';
import { settingsRepository } from '../repositories/settingsRepository';
import { companiesRepository } from '../repositories/companiesRepository';
import { sourcesRepository } from '../repositories/sourcesRepository';
import { dealsRepository } from '../repositories/dealsRepository';
import { reportsRepository } from '../repositories/reportsRepository';
import { notesRepository } from '../repositories/notesRepository';
import { searchRunsRepository } from '../repositories/searchRunsRepository';
import { jobsRepository } from '../repositories/jobsRepository';

export async function resetDatabase() {
  console.log('Resetting database...');
  await runMigrations();

  await notesRepository.deleteAll();
  await reportsRepository.deleteAll();
  await dealsRepository.deleteAll();
  await sourcesRepository.deleteAll();
  await companiesRepository.deleteAll();
  await searchRunsRepository.deleteAll();
  await jobsRepository.deleteAll();
  await settingsRepository.resetSettings();

  console.log('Database reset complete.');
}

if (process.argv[1] && /reset(\.ts)?$/.test(process.argv[1])) {
  resetDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Reset failed:', err);
      process.exit(1);
    });
}
