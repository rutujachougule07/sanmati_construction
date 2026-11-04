// SANMATI CONSTRUCTIONS ERP - Firebase Admin SDK Configuration
import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

let db = null;
let auth = null;
let isConfigured = false;

try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
    db = admin.firestore();
    auth = admin.auth();
    isConfigured = true;
    console.info("⚡ [Server] Firebase Admin SDK Initialized Successfully.");
  } else {
    console.info("ℹ️ [Server] Running in Self-Contained Enterprise Demonstration Mode (No live serviceAccountKey provided in .env).");
  }
} catch (err) {
  console.warn("⚠️ [Server] Firebase Admin initialization error:", err.message);
}

export { admin, db, auth, isConfigured };
