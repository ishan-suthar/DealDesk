import type { Metadata } from 'next';
import './globals.css';
import { getActiveProviderInfo } from '@/server/providers/providerFactory';
import { ProviderStatusProvider } from '@/components/layout/ProviderContext';

export const metadata: Metadata = {
  title: 'Deal Desk — IB M&A Research Workspace',
  description: 'Single-user research workspace for Investment Banking M&A screening and preparation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const activeInfo = getActiveProviderInfo();
  const initialStatus = {
    isDemoMode: activeInfo.isDemoMode,
    providerId: activeInfo.providerId,
    researchMode: activeInfo.researchMode,
    modeDisplay: activeInfo.modeDisplay,
    isLive: activeInfo.isLive,
  };

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <ProviderStatusProvider initialStatus={initialStatus}>
          {children}
        </ProviderStatusProvider>
      </body>
    </html>
  );
}
