import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * Firebase configuration object utilizing Next.js environment variables.
 * These variables must be strictly defined in your .env.local file.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Initialize Firebase Application.
 * Utilizes the singleton pattern to prevent re-initialization errors during 
 * Next.js Hot Module Replacement (HMR) or Server-Side Rendering (SSR).
 */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/**
 * Firestore Database instance for all CRUD operations.
 */
const db = getFirestore(app);

/**
 * Firebase Authentication instance for managing user sessions and security.
 */
const auth = getAuth(app);

export { app, db, auth };