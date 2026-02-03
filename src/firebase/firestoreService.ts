import {
  collection,
  getDocs,
  getDocsFromCache,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocFromCache,
  type DocumentData,
  type UpdateData,
} from 'firebase/firestore';
import { db } from '../firebase';

// Generic Firestore service
type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

type FirestoreDoc = { id: string };

const FORCE_REFRESH_UNTIL_KEY = 'forceRefreshUntil';
const FORCE_REFRESH_WINDOW_MS = 15 * 1000;
const collectionCache = new Map<string, CacheEntry<FirestoreDoc[]>>();
const documentCache = new Map<string, CacheEntry<FirestoreDoc | undefined>>();

const hasCache = (entry?: CacheEntry<unknown>) => entry !== undefined;

const makeDocKey = (collectionName: string, id: string) => `${collectionName}:${id}`;

const updateCollectionCache = <T extends FirestoreDoc>(collectionName: string, items: T[]) => {
  collectionCache.set(collectionName, { data: items, timestamp: Date.now() });
};

const upsertCollectionItem = <T extends FirestoreDoc>(collectionName: string, item: T) => {
  const existing = collectionCache.get(collectionName);
  if (!existing) return;
  const updated = existing.data.map((doc) => (doc.id === item.id ? { ...doc, ...item } : doc));
  const hasItem = existing.data.some((doc) => doc.id === item.id);
  updateCollectionCache(collectionName, hasItem ? updated : [item, ...existing.data]);
};

const removeCollectionItem = (collectionName: string, id: string) => {
  const existing = collectionCache.get(collectionName);
  if (!existing) return;
  updateCollectionCache(collectionName, existing.data.filter((doc) => doc.id !== id));
};

const shouldForceRefresh = () => {
  if (typeof window === 'undefined') return false;
  const until = Number(localStorage.getItem(FORCE_REFRESH_UNTIL_KEY) || 0);
  return Date.now() < until;
};

export const requestFirestoreRefresh = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FORCE_REFRESH_UNTIL_KEY, String(Date.now() + FORCE_REFRESH_WINDOW_MS));
};

export const getCollection = async <T extends FirestoreDoc = FirestoreDoc>(
  collectionName: string,
  options?: { force?: boolean }
): Promise<T[]> => {
  const force = (options?.force ?? false) || shouldForceRefresh();
  const cached = collectionCache.get(collectionName);
  if (!force && hasCache(cached)) {
    return cached.data as T[];
  }

  if (!force) {
    try {
      const querySnapshot = await getDocsFromCache(collection(db, collectionName));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
      updateCollectionCache(collectionName, data);
      return data;
    } catch (cacheError) {
      console.warn(`getCollection persistent cache empty for ${collectionName}`, cacheError);
    }
  }

  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
    updateCollectionCache(collectionName, data);
    return data;
  } catch (error) {
    console.warn(`getCollection fallback to cache for ${collectionName}`, error);
    if (cached) {
      return cached.data as T[];
    }
    try {
      const querySnapshot = await getDocsFromCache(collection(db, collectionName));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
      updateCollectionCache(collectionName, data);
      return data;
    } catch (cacheError) {
      console.warn(`getCollection cache empty for ${collectionName}`, cacheError);
      updateCollectionCache(collectionName, []);
      return [];
    }
  }
};

export const getDocument = async <T extends FirestoreDoc = FirestoreDoc>(
  collectionName: string,
  id: string,
  options?: { force?: boolean }
): Promise<T | undefined> => {
  const force = (options?.force ?? false) || shouldForceRefresh();
  const key = makeDocKey(collectionName, id);
  const cachedDoc = documentCache.get(key);
  if (!force && hasCache(cachedDoc)) {
    return cachedDoc.data as T | undefined;
  }

  const cachedCollection = collectionCache.get(collectionName);
  if (!force && hasCache(cachedCollection)) {
    const found = cachedCollection.data.find((doc) => doc.id === id);
    if (found) {
      documentCache.set(key, { data: found, timestamp: Date.now() });
      return found as T;
    }
    return undefined;
  }

  const docRef = doc(db, collectionName, id);
  if (!force) {
    try {
      const docSnap = await getDocFromCache(docRef);
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as T;
        documentCache.set(key, { data, timestamp: Date.now() });
        upsertCollectionItem(collectionName, data);
        return data;
      }
    } catch (cacheError) {
      console.warn(`getDocument persistent cache empty for ${collectionName}/${id}`, cacheError);
    }
  }

  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = { id: docSnap.id, ...docSnap.data() } as T;
      documentCache.set(key, { data, timestamp: Date.now() });
      upsertCollectionItem(collectionName, data);
      return data;
    }
    return undefined;
  } catch (error) {
    console.warn(`getDocument fallback to cache for ${collectionName}/${id}`, error);
    if (cachedDoc) {
      return cachedDoc.data as T | undefined;
    }
    try {
      const docSnap = await getDocFromCache(docRef);
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as T;
        documentCache.set(key, { data, timestamp: Date.now() });
        upsertCollectionItem(collectionName, data);
        return data;
      }
      return undefined;
    } catch (cacheError) {
      console.warn(`getDocument cache empty for ${collectionName}/${id}`, cacheError);
      documentCache.set(key, { data: undefined, timestamp: Date.now() });
      return undefined;
    }
  }
};

export const addDocument = async <T extends object>(
  collectionName: string,
  data: T
): Promise<string> => {
  const docRef = await addDoc(collection(db, collectionName), data as DocumentData);
  const item = { id: docRef.id, ...data } as FirestoreDoc;
  documentCache.set(makeDocKey(collectionName, docRef.id), { data: item, timestamp: Date.now() });
  upsertCollectionItem(collectionName, item);
  return docRef.id;
};

export const updateDocument = async (
  collectionName: string,
  id: string,
  data: UpdateData<DocumentData>
): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
  const key = makeDocKey(collectionName, id);
  const cached = documentCache.get(key);
  const merged = (cached?.data ? { ...cached.data, ...data } : { id, ...data }) as FirestoreDoc;
  documentCache.set(key, { data: merged, timestamp: Date.now() });
  upsertCollectionItem(collectionName, merged);
};

export const deleteDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
  documentCache.delete(makeDocKey(collectionName, id));
  removeCollectionItem(collectionName, id);
};

export const clearFirestoreCache = () => {
  collectionCache.clear();
  documentCache.clear();
};
