import { useEffect, useState } from 'react';
import { collection, limit, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';

export const useSyncStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineMode, setOfflineMode] = useState(
    localStorage.getItem('offlineMode') === 'true'
  );
  const [hasPendingWrites, setHasPendingWrites] = useState(false);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleOfflineMode = () => {
      setOfflineMode(localStorage.getItem('offlineMode') === 'true');
    };
    window.addEventListener('offline-mode-changed', handleOfflineMode);
    window.addEventListener('storage', handleOfflineMode);
    return () => {
      window.removeEventListener('offline-mode-changed', handleOfflineMode);
      window.removeEventListener('storage', handleOfflineMode);
    };
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'medicaments'), limit(1));
    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        setHasPendingWrites(snapshot.metadata.hasPendingWrites);
        setFromCache(snapshot.metadata.fromCache);
      },
      () => {
        setHasPendingWrites(false);
        setFromCache(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return {
    isOnline,
    offlineMode,
    hasPendingWrites,
    fromCache,
  };
};
