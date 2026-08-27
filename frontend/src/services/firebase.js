// Firebase SDK initialization with Google OAuth support.
// All config values are loaded from the .env file via Vite's import.meta.env.

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

// ── Firebase configuration (from .env) ─────────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ── Initialize Firebase ────────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);

// ── Google OAuth Provider ──────────────────────────────────────────────────
const googleProvider = new GoogleAuthProvider();
// Request additional scopes if needed (optional)
googleProvider.addScope("profile");
googleProvider.addScope("email");

/**
 * Sign in with Google via popup.
 * Returns the Firebase UserCredential on success.
 * Throws on failure — catch in the calling component.
 */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result;
}

/**
 * Sign out the currently authenticated Firebase user.
 */
export async function firebaseSignOut() {
  await signOut(auth);
}

export default app;