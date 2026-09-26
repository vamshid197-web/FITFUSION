/**
 * FITFUSION OFFERS & PROMOTIONS SERVICE (PHASE 16)
 * Centralized store promotions, category offers, minimum-order rewards, and first-order privileges.
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase.js';

const OFFERS_COLLECTION = 'offers';
const OFFERS_CACHE_KEY = 'fitfusion_offers_cache';

/**
 * Standard Default Curated Offers for FitFusion
 * Fully configurable by admins via /admin/offers
 */
export const DEFAULT_OFFERS = [
  {
    id: 'OFFER_FIRST500',
    code: 'FIRST500',
    name: 'First Order Privilege',
    description: 'Flat ₹500 off on your maiden bespoke commission of ₹2,999 or more.',
    type: 'first_order', // 'first_order' | 'storewide' | 'category' | 'product' | 'cashback'
    discountType: 'flat', // 'flat' | 'percent' | 'cashback'
    discountValue: 500,
    minimumOrderValue: 2999,
    applicableCategories: ['All'],
    applicableProducts: [],
    cashbackPercentage: 0,
    startAt: '2026-01-01T00:00:00.000Z',
    endAt: '2026-12-31T23:59:59.000Z',
    active: true,
    badge: 'NEW PATRON',
    priority: 10
  },
  {
    id: 'OFFER_ROYAL15',
    code: 'ROYAL15',
    name: 'Atelier Royal Commission',
    description: '15% instant reduction on luxury orders exceeding ₹4,999.',
    type: 'storewide',
    discountType: 'percent',
    discountValue: 15,
    minimumOrderValue: 4999,
    applicableCategories: ['All'],
    applicableProducts: [],
    cashbackPercentage: 0,
    startAt: '2026-01-01T00:00:00.000Z',
    endAt: '2026-12-31T23:59:59.000Z',
    active: true,
    badge: '15% OFF',
    priority: 8
  },
  {
    id: 'OFFER_SHIRTS10',
    code: 'SHIRTS10',
    name: "Gentleman's Shirting Special",
    description: '10% privilege discount on all handcrafted bespoke shirts.',
    type: 'category',
    discountType: 'percent',
    discountValue: 10,
    minimumOrderValue: 0,
    applicableCategories: ['Shirts'],
    applicableProducts: [],
    cashbackPercentage: 0,
    startAt: '2026-01-01T00:00:00.000Z',
    endAt: '2026-12-31T23:59:59.000Z',
    active: true,
    badge: 'CATEGORY OFFER',
    priority: 6
  },
  {
    id: 'OFFER_CASHBACK5',
    code: 'PATRON5',
    name: 'Privilege Patron Cashback',
    description: 'Earn 5% cashback directly into your Atelier Wallet on orders above ₹1,999.',
    type: 'cashback',
    discountType: 'cashback',
    discountValue: 5,
    minimumOrderValue: 1999,
    applicableCategories: ['All'],
    applicableProducts: [],
    cashbackPercentage: 5,
    startAt: '2026-01-01T00:00:00.000Z',
    endAt: '2026-12-31T23:59:59.000Z',
    active: true,
    badge: '5% CASHBACK',
    priority: 5
  },
  {
    id: 'OFFER_PERFUME_TIER',
    code: 'FREEPERFUME',
    name: 'Artisan Fragrance Compliments',
    description: 'Complimentary 50ml artisan fragrance bottle with orders of ₹3,999 or more.',
    type: 'storewide',
    discountType: 'free_item',
    discountValue: 499,
    minimumOrderValue: 3999,
    applicableCategories: ['All'],
    applicableProducts: [],
    cashbackPercentage: 0,
    startAt: '2026-01-01T00:00:00.000Z',
    endAt: '2026-12-31T23:59:59.000Z',
    active: true,
    badge: 'FREE PERFUME',
    priority: 7
  }
];

/**
 * Fetch all offers from Firestore with fallback to cached/default offers
 * @returns {Promise<Array>}
 */
export async function getAllOffers() {
  try {
    const colRef = collection(db, OFFERS_COLLECTION);
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const list = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      try {
        localStorage.setItem(OFFERS_CACHE_KEY, JSON.stringify(list));
      } catch (e) {}
      return list;
    }
  } catch (err) {
    console.warn('[offerService] Firestore read failed, falling back to cache/defaults:', err.message);
  }

  // Fallback to local storage or defaults
  try {
    const cached = localStorage.getItem(OFFERS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  return DEFAULT_OFFERS;
}

/**
 * Fetch only active, valid offers based on current timestamp
 * @returns {Promise<Array>}
 */
export async function getActiveOffers() {
  const all = await getAllOffers();
  const now = new Date().toISOString();

  return all
    .filter((offer) => {
      if (!offer.active) return false;
      if (offer.startAt && offer.startAt > now) return false;
      if (offer.endAt && offer.endAt < now) return false;
      return true;
    })
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

/**
 * Check if an offer is applicable to the current cart
 * @param {object} params
 * @param {object} params.offer
 * @param {Array} params.cartItems
 * @param {number} params.subtotal
 * @param {boolean} params.isFirstOrder
 * @returns {{ eligible: boolean, reason?: string, discountAmount: number }}
 */
export function validateOfferForCart({
  offer,
  cartItems = [],
  subtotal = 0,
  isFirstOrder = false
}) {
  if (!offer || !offer.active) {
    return { eligible: false, reason: 'Offer is currently inactive.', discountAmount: 0 };
  }

  const now = new Date().toISOString();
  if (offer.startAt && offer.startAt > now) {
    return { eligible: false, reason: 'Offer has not started yet.', discountAmount: 0 };
  }
  if (offer.endAt && offer.endAt < now) {
    return { eligible: false, reason: 'Offer has expired.', discountAmount: 0 };
  }

  // Minimum Order Value check
  const minOrder = Number(offer.minimumOrderValue || 0);
  if (subtotal < minOrder) {
    const diff = minOrder - subtotal;
    return {
      eligible: false,
      reason: `Add ₹${diff.toLocaleString('en-IN')} more to unlock this offer.`,
      discountAmount: 0
    };
  }

  // First Order check
  if (offer.type === 'first_order' && !isFirstOrder) {
    return {
      eligible: false,
      reason: 'This promotion is exclusive to maiden commissions (first order only).',
      discountAmount: 0
    };
  }

  // Category / Product restriction check
  let qualifyingSubtotal = subtotal;
  if (offer.applicableCategories && offer.applicableCategories.length > 0 && !offer.applicableCategories.includes('All')) {
    const allowed = offer.applicableCategories.map((c) => c.toLowerCase());
    const qualifyingItems = cartItems.filter((i) => allowed.includes((i.category || '').toLowerCase()));

    if (qualifyingItems.length === 0) {
      return {
        eligible: false,
        reason: `Offer applies only to garments in: ${offer.applicableCategories.join(', ')}.`,
        discountAmount: 0
      };
    }
    qualifyingSubtotal = qualifyingItems.reduce(
      (sum, item) => sum + (item.totalItemPrice || item.price || 0) * (item.quantity || 1),
      0
    );
  }

  // Calculate discount
  let discountAmount = 0;
  if (offer.discountType === 'percent') {
    discountAmount = Math.round((qualifyingSubtotal * Number(offer.discountValue || 0)) / 100);
  } else if (offer.discountType === 'flat') {
    discountAmount = Math.min(qualifyingSubtotal, Number(offer.discountValue || 0));
  } else if (offer.discountType === 'cashback') {
    // Cashback does not reduce payable price directly; it awards wallet balance
    discountAmount = 0;
  } else if (offer.discountType === 'free_item') {
    discountAmount = 0; // handled by complimentary item flow
  }

  return { eligible: true, discountAmount };
}

/**
 * Admin: Create or update an offer in Firestore
 * @param {object} offerData 
 * @returns {Promise<{ success: boolean, offer?: object, error?: string }>}
 */
export async function saveOffer(offerData) {
  try {
    const offerId = offerData.id || `OFFER_${Date.now()}`;
    const cleaned = {
      id: offerId,
      code: (offerData.code || offerId).trim().toUpperCase(),
      name: (offerData.name || 'Special Offer').trim(),
      description: (offerData.description || '').trim(),
      type: offerData.type || 'storewide',
      discountType: offerData.discountType || 'percent',
      discountValue: Math.max(0, Number(offerData.discountValue || 0)),
      minimumOrderValue: Math.max(0, Number(offerData.minimumOrderValue || 0)),
      applicableCategories: Array.isArray(offerData.applicableCategories) && offerData.applicableCategories.length > 0
        ? offerData.applicableCategories
        : ['All'],
      applicableProducts: Array.isArray(offerData.applicableProducts) ? offerData.applicableProducts : [],
      cashbackPercentage: Math.max(0, Number(offerData.cashbackPercentage || 0)),
      startAt: offerData.startAt || new Date().toISOString(),
      endAt: offerData.endAt || new Date(Date.now() + 365 * 86400000).toISOString(),
      active: offerData.active !== false,
      badge: offerData.badge || 'SPECIAL OFFER',
      priority: Number(offerData.priority || 5),
      updatedAt: new Date().toISOString()
    };

    if (!offerData.id) {
      cleaned.createdAt = new Date().toISOString();
    }

    // Persist to Firestore
    try {
      const docRef = doc(db, OFFERS_COLLECTION, offerId);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (fsErr) {
      console.warn('[offerService] Firestore write failed:', fsErr.message);
    }

    // Update local cache
    const current = await getAllOffers();
    const updated = [cleaned, ...current.filter((o) => o.id !== offerId)];
    try {
      localStorage.setItem(OFFERS_CACHE_KEY, JSON.stringify(updated));
    } catch (e) {}

    return { success: true, offer: cleaned };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Admin: Delete an offer
 * @param {string} offerId 
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function deleteOffer(offerId) {
  try {
    try {
      const docRef = doc(db, OFFERS_COLLECTION, offerId);
      await deleteDoc(docRef);
    } catch (fsErr) {
      console.warn('[offerService] Firestore delete failed:', fsErr.message);
    }

    const current = await getAllOffers();
    const filtered = current.filter((o) => o.id !== offerId);
    try {
      localStorage.setItem(OFFERS_CACHE_KEY, JSON.stringify(filtered));
    } catch (e) {}

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}


// Phase 16 convenience alias
export const getOffers = getAllOffers;
