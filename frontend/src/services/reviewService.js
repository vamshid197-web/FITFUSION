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
import { getUserOrders } from './firestoreService.js';

const STORAGE_KEY = 'fitfusion_reviews_store';

function withTimeout(promise, ms = 1500) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), ms))
  ]);
}

function getLocalReviews() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[ReviewService] LocalStorage read failed:', err);
    return [];
  }
}

function setLocalReviews(items) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  } catch (err) {
    console.warn('[ReviewService] LocalStorage write failed:', err);
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
 * Verify whether a customer actually purchased the product in any placed order
 * @param {string} userId - User UID
 * @param {string|number} productId - Product ID
 * @returns {Promise<{ isVerified: boolean, orderId: string|null }>}
 */
export async function verifyCustomerPurchase(userId, productId) {
  if (!userId || !productId) {
    return { isVerified: false, orderId: null };
  }

  const prodIdStr = String(productId);

  try {
    const res = await getUserOrders(userId);
    if (res && res.success && Array.isArray(res.orders)) {
      for (const order of res.orders) {
        const hasProduct = (order.items || []).some(
          (item) => String(item.productId || item.id) === prodIdStr
        );
        if (hasProduct) {
          return { isVerified: true, orderId: order.id || order.orderId || null };
        }
      }
    }
  } catch (err) {
    console.warn('[ReviewService] Purchase verification lookup error:', err);
  }

  return { isVerified: false, orderId: null };
}

/**
 * Calculate dynamic rating metrics from a list of published reviews
 * @param {Array} reviews - List of review objects
 * @returns {object} { averageRating, totalReviews, ratingBreakdown }
 */
export function calculateProductRatingStats(reviews = []) {
  const published = reviews.filter((r) => r.status === 'published' || !r.status);
  const total = published.length;

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  published.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating || 5))));
    breakdown[star] = (breakdown[star] || 0) + 1;
    sum += Number(r.rating || 5);
  });

  const avg = total > 0 ? Number((sum / total).toFixed(1)) : 0;

  return {
    averageRating: avg,
    totalReviews: total,
    ratingBreakdown: breakdown,
    percentages: {
      5: total > 0 ? Math.round((breakdown[5] / total) * 100) : 0,
      4: total > 0 ? Math.round((breakdown[4] / total) * 100) : 0,
      3: total > 0 ? Math.round((breakdown[3] / total) * 100) : 0,
      2: total > 0 ? Math.round((breakdown[2] / total) * 100) : 0,
      1: total > 0 ? Math.round((breakdown[1] / total) * 100) : 0
    }
  };
}

/**
 * Fetch all reviews for a product
 * @param {string|number} productId - Product ID
 * @param {boolean} includeHidden - Admin toggle to view unmoderated reviews
 */
export async function getProductReviews(productId, includeHidden = false) {
  if (!productId) return [];
  const prodIdStr = String(productId);

  let firestoreReviews = [];
  try {
    if (db) {
      const q = query(collection(db, 'reviews'), where('productId', '==', prodIdStr));
      const snap = await withTimeout(getDocs(q));
      snap.forEach((d) => {
        firestoreReviews.push({ id: d.id, ...d.data() });
      });
    }
  } catch (err) {
    // Network fallback
  }

  const localReviews = getLocalReviews().filter((r) => String(r.productId) === prodIdStr);

  const map = new Map();
  firestoreReviews.forEach((r) => map.set(r.id, r));
  localReviews.forEach((r) => {
    if (!map.has(r.id)) {
      map.set(r.id, r);
    }
  });

  const merged = Array.from(map.values());

  const filtered = includeHidden
    ? merged
    : merged.filter((r) => r.status === 'published' || !r.status);

  return filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

/**
 * Fetch all reviews written by a specific customer
 * @param {string} userId - User UID
 */
export async function getUserReviews(userId) {
  if (!userId) return [];

  let firestoreReviews = [];
  try {
    if (db) {
      const q = query(collection(db, 'reviews'), where('userId', '==', userId));
      const snap = await withTimeout(getDocs(q));
      snap.forEach((d) => {
        firestoreReviews.push({ id: d.id, ...d.data() });
      });
    }
  } catch (err) {
    // Network fallback
  }

  const localReviews = getLocalReviews().filter((r) => r.userId === userId);

  const map = new Map();
  firestoreReviews.forEach((r) => map.set(r.id, r));
  localReviews.forEach((r) => {
    if (!map.has(r.id)) {
      map.set(r.id, r);
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
}

/**
 * Fetch all reviews across all products for Admin Review Moderation
 */
export async function getAllReviewsForAdmin() {
  let firestoreReviews = [];
  try {
    if (db) {
      const snap = await withTimeout(getDocs(collection(db, 'reviews')));
      snap.forEach((d) => {
        firestoreReviews.push({ id: d.id, ...d.data() });
      });
    }
  } catch (err) {
    // Network fallback
  }

  const localReviews = getLocalReviews();
  const map = new Map();
  firestoreReviews.forEach((r) => map.set(r.id, r));
  localReviews.forEach((r) => {
    if (!map.has(r.id)) {
      map.set(r.id, r);
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
}

/**
 * Submit a customer review
 */
export async function createReview({
  productId,
  productName = 'Bespoke Garment',
  userId,
  userDisplayName = 'Verified Patron',
  rating,
  title,
  comment
}) {
  if (!userId) throw new Error('You must be signed in to submit a review.');
  if (!productId) throw new Error('Product ID is required.');

  const numRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));
  const trimmedTitle = (title || '').trim();
  const trimmedComment = (comment || '').trim();

  if (trimmedTitle.length < 3 || trimmedTitle.length > 80) {
    throw new Error('Review title must be between 3 and 80 characters.');
  }
  if (trimmedComment.length < 10 || trimmedComment.length > 1000) {
    throw new Error('Review comment must be between 10 and 1,000 characters.');
  }

  // Duplicate prevention check: Check if user already reviewed this product
  const existingUserReviews = await getUserReviews(userId);
  const existingReview = existingUserReviews.find(
    (r) => String(r.productId) === String(productId)
  );

  if (existingReview) {
    throw new Error('You have already reviewed this piece. You can edit your existing review below.');
  }

  // Automatic Genuine Purchase Verification from actual order data
  const { isVerified, orderId } = await verifyCustomerPurchase(userId, productId);

  const reviewId = 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const nowIso = new Date().toISOString();

  const newReview = {
    id: reviewId,
    productId: String(productId),
    productName: productName || 'Bespoke Garment',
    userId,
    userDisplayName: userDisplayName || 'Patron',
    orderId: orderId || null,
    rating: numRating,
    title: trimmedTitle,
    comment: trimmedComment,
    verifiedPurchase: Boolean(isVerified),
    status: 'published', // 'published' | 'hidden' | 'pending'
    createdAt: nowIso,
    updatedAt: nowIso
  };

  // 1. Update local cache
  const localList = getLocalReviews();
  localList.unshift(newReview);
  setLocalReviews(localList);

  // 2. Persist to Firestore
  if (db) {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await withTimeout(setDoc(reviewRef, sanitizePayload(newReview)));
    } catch (err) {
      console.warn('[ReviewService] Firestore save error (cached locally):', err?.message);
    }
  }

  return newReview;
}

/**
 * Update an existing customer review (owner only)
 */
export async function updateReview(reviewId, userId, { rating, title, comment }) {
  if (!reviewId || !userId) throw new Error('Review ID and User ID are required.');

  const numRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));
  const trimmedTitle = (title || '').trim();
  const trimmedComment = (comment || '').trim();

  if (trimmedTitle.length < 3 || trimmedTitle.length > 80) {
    throw new Error('Review title must be between 3 and 80 characters.');
  }
  if (trimmedComment.length < 10 || trimmedComment.length > 1000) {
    throw new Error('Review comment must be between 10 and 1,000 characters.');
  }

  const nowIso = new Date().toISOString();
  const localList = getLocalReviews();
  const target = localList.find((r) => r.id === reviewId);

  if (target && target.userId !== userId) {
    throw new Error('Unauthorized: You can only edit your own reviews.');
  }

  const updatedFields = {
    rating: numRating,
    title: trimmedTitle,
    comment: trimmedComment,
    updatedAt: nowIso
  };

  const updatedList = localList.map((r) =>
    r.id === reviewId ? { ...r, ...updatedFields } : r
  );
  setLocalReviews(updatedList);

  if (db) {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await withTimeout(updateDoc(reviewRef, sanitizePayload(updatedFields)));
    } catch (err) {
      console.warn('[ReviewService] Firestore update error:', err?.message);
    }
  }

  return { id: reviewId, ...updatedFields };
}

/**
 * Delete a review (owner or admin)
 */
export async function deleteReview(reviewId, userId, isAdmin = false) {
  if (!reviewId) return false;

  const localList = getLocalReviews();
  const target = localList.find((r) => r.id === reviewId);

  if (target && !isAdmin && target.userId !== userId) {
    throw new Error('Unauthorized: You can only delete your own reviews.');
  }

  const filtered = localList.filter((r) => r.id !== reviewId);
  setLocalReviews(filtered);

  if (db) {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await withTimeout(deleteDoc(reviewRef));
    } catch (err) {
      console.warn('[ReviewService] Firestore delete error:', err?.message);
    }
  }

  return true;
}

/**
 * Moderate a review status (Admin only: 'published' | 'hidden')
 */
export async function moderateReview(reviewId, status) {
  if (!reviewId) return false;
  if (status !== 'published' && status !== 'hidden') {
    throw new Error('Invalid moderation status');
  }

  const nowIso = new Date().toISOString();
  const localList = getLocalReviews();
  const updatedList = localList.map((r) =>
    r.id === reviewId ? { ...r, status, updatedAt: nowIso } : r
  );
  setLocalReviews(updatedList);

  if (db) {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await withTimeout(updateDoc(reviewRef, { status, updatedAt: nowIso }));
    } catch (err) {
      console.warn('[ReviewService] Moderation error:', err?.message);
    }
  }

  return true;
}

/**
 * Check if a user has already reviewed a specific product (Duplicate prevention)
 * @param {string} userId
 * @param {string} productId
 * @returns {Promise<{ hasReviewed: boolean, review: object|null }>}
 */
export async function hasUserReviewedProduct(userId, productId) {
  if (!userId || !productId) return { hasReviewed: false, review: null };
  try {
    const userReviews = await getUserReviews(userId);
    const existing = userReviews.find(r => String(r.productId) === String(productId));
    return { hasReviewed: !!existing, review: existing || null };
  } catch (err) {
    console.warn('[reviewService] Error checking user review existence:', err);
    return { hasReviewed: false, review: null };
  }
}
