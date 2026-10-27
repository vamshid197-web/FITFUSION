import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase.js';

const STORAGE_KEY = 'fitfusion_saved_customizations';

// Helper to prevent hanging on Firestore network retries in demo/offline environments
function withTimeout(promise, ms = 1500) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore operation timeout')), ms))
  ]);
}

// Local storage fallback helpers
function getLocalCustomizations() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading saved customizations from localStorage', err);
    return [];
  }
}

function setLocalCustomizations(list) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  } catch (err) {
    console.error('Error writing saved customizations to localStorage', err);
  }
}

function sanitizePayload(obj) {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string' && obj.startsWith('data:image/') && obj.length > 500) {
      return '[PHOTO_ASSET_REFERENCE]';
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizePayload);
  }
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = sanitizePayload(value);
    }
  }
  return clean;
}

/**
 * Save a new bespoke design configuration to Firestore with localStorage backup.
 */
export async function saveCustomization({
  userId,
  productId,
  productName,
  customization,
  price,
  designName = ''
}) {
  const customizationId = 'sc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const cust = customization || {};
  const record = {
    id: customizationId,
    userId: userId || 'anonymous',
    productId: productId || cust.productId || '',
    productName: productName || cust.productName || 'Custom Garment',
    productImage: cust.productImage || null,
    fabric: cust.fabric?.name || (typeof cust.fabric === 'string' ? cust.fabric : 'Cotton'),
    color: cust.color?.name || (typeof cust.color === 'string' ? cust.color : 'Classic'),
    size: cust.size || 'M',
    fit: cust.fit || 'Regular',
    customMeasurements: cust.measurements || null,
    designElements: cust.design || null,
    printedGraphics: cust.designLayers || null,
    placement: cust.designLayers?.[0]?.placement || 'Front Center',
    printStyle: cust.designLayers?.[0]?.printStyle || 'Standard Print',
    customizationPrice: Number(cust.customizationPrice || 0),
    totalPrice: Number(price) || 0,
    price: Number(price) || 0,
    createdDate: now,
    designName: designName || (`${productName || 'Custom'} - ${cust.fabric?.name || 'Tailored'}`),
    customization: cust,
    createdAt: now,
    updatedAt: now
  };

  // Always update local cache first
  const localList = getLocalCustomizations();
  localList.unshift(record);
  setLocalCustomizations(localList);

  // Attempt Firestore write with timeout safety
  try {
    if (db && userId && userId !== 'anonymous') {
      const sanitized = sanitizePayload(record);
      await withTimeout(setDoc(doc(db, 'savedCustomizations', customizationId), sanitized));
    }
  } catch (error) {
    // Graceful offline fallback
  }

  return record;
}

/**
 * Fetch all saved designs for a user from Firestore (merging local cache).
 */
export async function getUserSavedCustomizations(userId) {
  if (!userId) {
    return getLocalCustomizations().filter(c => c.userId === 'anonymous' || !c.userId);
  }

  let firestoreList = [];
  try {
    if (db) {
      const q = query(collection(db, 'savedCustomizations'), where('userId', '==', userId));
      const snap = await withTimeout(getDocs(q));
      snap.forEach(d => {
        firestoreList.push({ id: d.id, ...d.data() });
      });
    }
  } catch (err) {
    // Graceful fallback to local cache
  }

  // Local list
  const localList = getLocalCustomizations().filter(c => c.userId === userId);

  // Merge map by ID
  const map = new Map();
  firestoreList.forEach(item => map.set(item.id, item));
  localList.forEach(item => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });

  const merged = Array.from(map.values()).sort((a, b) => {
    return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
  });

  return merged;
}

/**
 * Fetch single saved customization by ID.
 */
export async function getSavedCustomizationById(customizationId) {
  if (!customizationId) return null;

  try {
    if (db) {
      const ref = doc(db, 'savedCustomizations', customizationId);
      const snap = await withTimeout(getDoc(ref));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
    }
  } catch (err) {
    // Fallback to local
  }

  const local = getLocalCustomizations().find(c => c.id === customizationId);
  return local || null;
}

/**
 * Update an existing saved customization.
 */
export async function updateSavedCustomization(customizationId, updates) {
  const now = new Date().toISOString();
  const mergedUpdates = { ...updates, updatedAt: now };

  // Update local
  const localList = getLocalCustomizations();
  const index = localList.findIndex(c => c.id === customizationId);
  if (index !== -1) {
    localList[index] = { ...localList[index], ...mergedUpdates };
    setLocalCustomizations(localList);
  }

  // Update Firestore with timeout safety
  try {
    if (db) {
      const ref = doc(db, 'savedCustomizations', customizationId);
      await withTimeout(updateDoc(ref, sanitizePayload(mergedUpdates)));
    }
  } catch (err) {
    // Graceful fallback
  }

  return { id: customizationId, ...mergedUpdates };
}

/**
 * Delete a saved customization.
 */
export async function deleteSavedCustomization(customizationId) {
  // Remove from local
  const localList = getLocalCustomizations();
  const filtered = localList.filter(c => c.id !== customizationId);
  setLocalCustomizations(filtered);

  // Remove from Firestore with timeout safety
  try {
    if (db) {
      await withTimeout(deleteDoc(doc(db, 'savedCustomizations', customizationId)));
    }
  } catch (err) {
    // Graceful fallback
  }

  return true;
}
