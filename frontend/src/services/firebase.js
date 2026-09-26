import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase Client Configuration
 * Credentials are read from environment variables to ensure secrets are never committed.
 * Placeholders are used as safe fallbacks during build/static analysis.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoPlaceholderKeyForBuild',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'fitfusion-demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'fitfusion-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'fitfusion-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:demoappplaceholder'
};

// Initialize Firebase app only once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Cloud Firestore database instance
const db = getFirestore(app);

export { app, auth, db };
export default app;