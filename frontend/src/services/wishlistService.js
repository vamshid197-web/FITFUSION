import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase.js';

const STORAGE_PREFIX = 'fitfusion_wishlist_';

function getStorageKey(userId) {
  return `${STORAGE_PREFIX}${userId || 'guest'}`;
}

// Helper to prevent hanging on Firestore network delays in demo/offline environments
function withTimeout(promise, ms = 1500) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), ms))
  ]);
}

// Local cache helpers
function getLocalWishlist(userId) {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(getStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[WishlistService] LocalStorage read failed:', err);
    return [];
  }
}

function setLocalWishlist(userId, items) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(getStorageKey(userId), JSON.stringify(items));
    }
  } catch (err) {
    console.warn('[WishlistService] LocalStorage write failed:', err);
  }
}

function sanitizePayload(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizePayload);
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = sanitizePayload(value);
    }
  }
  return clean;
}

/**
 * Fetch all wishlisted items for a customer
 * @param {string} userId - Authenticated user UID
 * @returns {Promise<Array>} Array of wishlisted product items
 */
export async function getUserWishlist(userId) {
  if (!userId) {
    return getLocalWishlist('guest');
  }

  const localItems = getLocalWishlist(userId);
  let firestoreItems = [];

  try {
    if (db) {
      const wishlistCol = collection(db, 'users', userId, 'wishlist');
      const snap = await withTimeout(getDocs(wishlistCol));
      snap.forEach((d) => {
        firestoreItems.push({ id: d.id, ...d.data() });
      });
    }
  } catch (err) {
    // Network fallback: use local cache
  }

  // Merge Firestore items and local cache, preserving newest
  const map = new Map();
  firestoreItems.forEach((item) => map.set(String(item.productId || item.id), item));
  localItems.forEach((item) => {
    const key = String(item.productId || item.id);
    if (!map.has(key)) {
      map.set(key, item);
    }
  });

  const merged = Array.from(map.values()).sort((a, b) => {
    return new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
  });

  // Keep local cache synced
  setLocalWishlist(userId, merged);
  return merged;
}

/**
 * Add a product to the user's wishlist
 * @param {string} userId - Authenticated user UID
 * @param {object} product - Product catalog object
 */
export async function addProductToWishlist(userId, product) {
  if (!product || !product.id) {
    throw new Error('Invalid product object');
  }

  const prodId = String(product.id);
  const nowIso = new Date().toISOString();

  const wishlistItem = {
    productId: prodId,
    productName: product.name || product.productName || 'Bespoke Garment',
    category: product.category || 'Apparel',
    price: Number(product.basePrice || product.price || 0),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    productImage: product.images?.[0] || product.thumbnail || product.productImage || null,
    silhouetteColor: product.silhouetteColor || 'from-stone-100 to-amber-50',
    available: product.available !== false && product.stockStatus !== 'Out of Stock',
    customizable: product.customizable !== false,
    addedAt: nowIso,
    userId: userId || 'guest'
  };

  // 1. Update local cache immediately
  const localList = getLocalWishlist(userId);
  const exists = localList.some((item) => String(item.productId || item.id) === prodId);
  if (!exists) {
    localList.unshift(wishlistItem);
    setLocalWishlist(userId, localList);
  }

  // 2. Persist to Firestore if user is authenticated
  if (db && userId && userId !== 'guest') {
    try {
      const itemRef = doc(db, 'users', userId, 'wishlist', prodId);
      await withTimeout(setDoc(itemRef, sanitizePayload(wishlistItem), { merge: true }));
    } catch (err) {
      console.warn('[WishlistService] Firestore save error (cached locally):', err?.message);
    }
  }

  return wishlistItem;
}

/**
 * Remove a product from the user's wishlist
 * @param {string} userId - Authenticated user UID
 * @param {string|number} productId - Product ID
 */
export async function removeProductFromWishlist(userId, productId) {
  if (!productId) return false;
  const prodId = String(productId);

  // 1. Update local cache
  const localList = getLocalWishlist(userId);
  const filtered = localList.filter((item) => String(item.productId || item.id) !== prodId);
  setLocalWishlist(userId, filtered);

  // 2. Delete from Firestore
  if (db && userId && userId !== 'guest') {
    try {
      const itemRef = doc(db, 'users', userId, 'wishlist', prodId);
      await withTimeout(deleteDoc(itemRef));
    } catch (err) {
      console.warn('[WishlistService] Firestore delete error (removed locally):', err?.message);
    }
  }

  return true;
}

/**
 * Check if a product is in the user's wishlist
 * @param {string} userId - User UID
 * @param {string|number} productId - Product ID
 */
export function isProductInWishlist(userId, productId) {
  if (!productId) return false;
  const prodId = String(productId);
  const localList = getLocalWishlist(userId);
  return localList.some((item) => String(item.productId || item.id) === prodId);
}
