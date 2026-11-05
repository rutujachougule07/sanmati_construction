// SANMATI CONSTRUCTIONS ERP - Firebase Client Service
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyASdMUllfipQZA-f59K_pAevsLtkhHGwP0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sanmati-4380a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sanmati-4380a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sanmati-4380a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "668749445035",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:668749445035:web:faf0aa1b37d83f59e144ee",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-999S0DVN8V"
};

// Check if credentials have been populated
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "" &&
  !firebaseConfig.apiKey.includes("YOUR_")
);

let app = null;
let auth = null;
let db = null;
let storage = null;
let analytics = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      }).catch(() => {});
    }
    console.info("⚡ [SANMATI ERP] Connected to Live Firebase Cloud Backend (Project: " + firebaseConfig.projectId + ")!");
  } catch (err) {
    console.warn("⚠️ [SANMATI ERP] Firebase initialization error, switching to fallback mode:", err.message);
  }
} else {
  console.info("ℹ️ [SANMATI ERP] Running in Enterprise Hybrid Demonstration Mode with Local Simulated Database.");
}

export {
  app,
  auth,
  db,
  storage,
  analytics,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  ref,
  uploadBytes,
  getDownloadURL
};
