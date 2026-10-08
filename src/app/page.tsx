import Link from 'next/link';
import { settingsRepository } from '@/server/repositories/settingsRepository';

export const dynamic = 'force-dynamic';

export default async function WelcomePage() {
  const settings = await settingsRepository.getSettings();
  const displayName = settings.displayName || 'Nikita';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-xl w-full text-center space-y-8 p-10 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span>Investment Banking M&A Workspace</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Welcome {displayName}
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Find a deal worth talking about.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/research"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
          >
            Start researching
          </Link>
        </div>
      </div>
    </main>
  );
}
