import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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
