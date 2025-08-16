
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { syncData } from '../services/syncService';

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface SyncContextType {
  syncStatus: SyncStatus;
  lastSyncTime: Date | null;
  runSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const runSync = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      await syncData();
      setSyncStatus('synced');
      setLastSyncTime(new Date());
    } catch (error) {
      console.error("Sync failed:", error);
      setSyncStatus('error');
    }
  }, []);

  return (
    <SyncContext.Provider value={{ syncStatus, lastSyncTime, runSync }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
