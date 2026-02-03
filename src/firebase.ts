import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, enableNetwork, disableNetwork } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBQq0_f3OumWzF_gRsc4hxms4S_4-BBnL0",
  authDomain: "hopital-de-juvenat-ca13b.firebaseapp.com",
  projectId: "hopital-de-juvenat-ca13b",
  storageBucket: "hopital-de-juvenat-ca13b.firebasestorage.app",
  messagingSenderId: "907642547883",
  appId: "1:907642547883:web:110738d410126bb63fd1ee"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Enable offline persistence (IndexedDB)
enableIndexedDbPersistence(db).catch((err) => {
  // Non-blocking: fails if multiple tabs or unsupported browser
  console.warn('Firestore persistence error:', err);
});

export const setFirestoreNetworkEnabled = async (enabled: boolean) => {
  if (enabled) {
    await enableNetwork(db);
  } else {
    await disableNetwork(db);
  }
};

if (typeof window !== 'undefined') {
  const offlineMode = localStorage.getItem('offlineMode') === 'true';
  if (offlineMode) {
    disableNetwork(db).catch(() => undefined);
  }
}
