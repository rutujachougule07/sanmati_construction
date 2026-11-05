// SANMATI CONSTRUCTIONS ERP - Universal Firebase Live Sync & Anti-Duplicate Service
import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from './firebase';

/**
 * Sanitizes a string to make it a safe, clean, deterministic Firestore Document ID
 */
export const sanitizeId = (str) => {
  if (!str) return `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return String(str)
    .trim()
    .replace(/[/\\#?%*:[\]]/g, '_')
    .replace(/\s+/g, '_');
};

/**
 * Subscribes in real-time to a Firestore collection with local state synchronization.
 * If live Firebase has data, it populates the local state.
 * Returns an unsubscribe function.
 */
export const subscribeToModuleCollection = (collectionName, onDataReceived) => {
  if (!isFirebaseConfigured || !db) {
    return () => {};
  }

  try {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const items = [];
          snapshot.forEach((docSnap) => {
            items.push({ id: docSnap.id, ...docSnap.data() });
          });
          onDataReceived(items);
        }
      },
      (error) => {
        console.warn(`[FirebaseSync] Error syncing ${collectionName}:`, error.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn(`[FirebaseSync] Failed to initialize listener for ${collectionName}:`, err.message);
    return () => {};
  }
};

/**
 * Deep cleans an object to ensure no `undefined` values are passed to Firestore
 */
export const cleanForFirestore = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  try {
    return JSON.parse(JSON.stringify(obj, (key, value) => {
      if (value === undefined) return null;
      return value;
    }));
  } catch (e) {
    return obj;
  }
};

/**
 * Saves a document to Firebase Firestore with anti-duplicate deterministic ID guarantee.
 */
export const saveModuleRecord = async (collectionName, docId, data) => {
  if (!isFirebaseConfigured || !db) return null;

  try {
    const cleanId = sanitizeId(docId);
    const docRef = doc(db, collectionName, cleanId);
    
    // Clean data of undefined values and add timestamp
    const cleanedData = cleanForFirestore(data) || {};
    const payload = {
      ...cleanedData,
      id: cleanId,
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(docRef, payload, { merge: true });
    console.info(`🔥 [Firebase Direct Write] Saved to ${collectionName}/${cleanId}`, payload);
    return payload;
  } catch (err) {
    console.error(`❌ [Firebase Sync Error] Failed to write to ${collectionName}/${docId}:`, err);
    return null;
  }
};

/**
 * Deletes a document from Firebase Firestore.
 */
export const removeModuleRecord = async (collectionName, docId) => {
  if (!isFirebaseConfigured || !db || !docId) return false;

  try {
    const cleanId = sanitizeId(docId);
    const docRef = doc(db, collectionName, cleanId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error(`[FirebaseSync] Failed to delete record ${collectionName}/${docId}:`, err);
    return false;
  }
};
