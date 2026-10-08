'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface ProviderStatus {
  isDemoMode: boolean;
  providerId: string;
  researchMode: string;
  modeDisplay: string;
  isLive: boolean;
}

const defaultStatus: ProviderStatus = {
  isDemoMode: true,
  providerId: 'demo',
  researchMode: 'demo',
  modeDisplay: 'Demo',
  isLive: false,
};

interface ProviderContextValue {
  status: ProviderStatus;
  refreshStatus: () => Promise<void>;
}

const ProviderContext = createContext<ProviderContextValue>({
  status: defaultStatus,
  refreshStatus: async () => {},
});

export function ProviderStatusProvider({
  initialStatus,
  children,
}: {
  initialStatus?: ProviderStatus;
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<ProviderStatus>(initialStatus || defaultStatus);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          const isLive = !data.settings.isDemoMode;
          const providerId = data.settings.providerId || (isLive ? data.settings.researchMode : 'demo');
          const researchMode = data.settings.researchMode || 'demo';
          const modeDisplay = isLive ? `Live — ${researchMode}` : 'Demo';
          setStatus({
            isDemoMode: Boolean(data.settings.isDemoMode),
            providerId,
            researchMode,
            modeDisplay,
            isLive,
          });
        }
      }
    } catch (err) {
      console.error('Failed to refresh provider status:', err);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return (
    <ProviderContext.Provider value={{ status, refreshStatus }}>
      {children}
    </ProviderContext.Provider>
  );
}

export function useProviderStatus(): ProviderContextValue {
  return useContext(ProviderContext);
}
