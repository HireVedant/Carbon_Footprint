import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Firebase configuration using Vite environment variables.
// Local development tolerates missing variables (falls back to placeholders so the dev server can start).
// Production builds MUST have real config — connecting to the placeholder project silently causes
// every Firestore call to fail with PERMISSION_DENIED ("Missing or insufficient permissions.").
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

const PLACEHOLDER_PROJECT_ID = 'ecotrack-ai';

if (
  import.meta.env.PROD &&
  (!apiKey ||
    !authDomain ||
    !projectId ||
    !storageBucket ||
    !messagingSenderId ||
    !appId ||
    projectId === PLACEHOLDER_PROJECT_ID ||
    apiKey.includes('Dummy') ||
    apiKey.includes('YOUR_'))
) {
  throw new Error(
    '[EcoTrack] Firebase environment variables are missing in this production build. ' +
      'Set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, ' +
      'VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, and VITE_FIREBASE_APP_ID ' +
      'in your build environment (e.g. Vercel dashboard) before deploying. ' +
      'For local development: cp .env.example .env'
  );
}

const firebaseConfig = {
  apiKey: apiKey || 'AIzaSyDummyKeyPlaceholderForBuildDev',
  authDomain: authDomain || 'ecotrack-ai.firebaseapp.com',
  projectId: projectId || PLACEHOLDER_PROJECT_ID,
  storageBucket: storageBucket || 'ecotrack-ai.appspot.com',
  messagingSenderId: messagingSenderId || '000000000000',
  appId: appId || '1:000000000000:web:abcdef0000000000000000'
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
