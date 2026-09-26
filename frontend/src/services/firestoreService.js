import {
  collection,
  onSnapshot,
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
import { MOCK_PRODUCTS } from '../data/mockProducts.js';

/**
 * =====================================================================
 * FITFUSION FIRESTORE PERSISTENCE SERVICE (PHASE 6)
 * =====================================================================
 * Handles users, orders, and products persistence with Cloud Firestore.
 * Includes graceful offline/demo fallbacks to prevent screen crashes.
 */

// Helper to remove any undefined fields before Firestore serialization
function sanitizePayload(obj) {
  if (obj === null || typeof obj !== 'object') {
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
 * ---------------------------------------------------------------------
 * 1. USER PROFILE MANAGEMENT (`users` Collection)
 * ---------------------------------------------------------------------
 */

/**
 * Create or initialize a Firestore profile document for a user upon signup
 * @param {string} uid - Firebase Auth user UID
 * @param {object} profileData - { name, email, phone, role }
 */
export async function createUserProfile(uid, profileData = {}) {
  if (!uid) throw new Error('User UID is required to create Firestore profile');

  try {
    const userRef = doc(db, 'users', uid);
    const nowIso = new Date().toISOString();

    const payload = sanitizePayload({
      uid,
      name: profileData.name || profileData.displayName || '',
      displayName: profileData.name || profileData.displayName || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      role: profileData.role || 'customer',
      createdAt: nowIso,
      updatedAt: nowIso
    });

    await setDoc(userRef, payload, { merge: true });
    return { success: true, profile: payload };
  } catch (err) {
    console.warn('[Firestore] Failed to create user profile in Firestore:', err?.message || err);
    return { success: false, error: err };
  }
}

/**
 * Retrieve user profile from Firestore `users/{uid}`
 * @param {string} uid - Firebase Auth user UID
 */
export async function getUserProfile(uid) {
  if (!uid) return null;

  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (err) {
    console.warn('[Firestore] Failed to fetch user profile:', err?.message || err);
    return null;
  }
}

/**
 * Update an existing user's profile
 * @param {string} uid - User UID
 * @param {object} updates - Fields to update (e.g. phone, name)
 */
export async function updateUserProfile(uid, updates = {}) {
  if (!uid) throw new Error('User UID is required to update profile');

  try {
    const userRef = doc(db, 'users', uid);
    const cleanUpdates = sanitizePayload({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    await updateDoc(userRef, cleanUpdates);
    return { success: true };
  } catch (err) {
    console.warn('[Firestore] Failed to update user profile:', err?.message || err);
    return { success: false, error: err };
  }
}

/**
 * ---------------------------------------------------------------------
 * 2. ORDER PERSISTENCE (`orders` Collection)
 * ---------------------------------------------------------------------
 */

/**
 * Save completed bespoke order to Firestore
 * @param {object} order - Complete order object from checkout
 * @param {string} userId - Authenticated user UID
 */
export async function createFirestoreOrder(order, userId) {
  if (!order) throw new Error('Order data is required');

  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const orderId = order.id || order.orderId || `FF-2026-${randomSuffix}`;
  const nowIso = new Date().toISOString();

  // Normalize items to preserve all bespoke customization specifications
  const normalizedItems = (order.items || []).map((item, index) => {
    return sanitizePayload({
      cartItemId: item.id || `item-${index}`,
      productId: item.productId || 'custom',
      productName: item.productName || 'Bespoke Garment',
      category: item.category || 'Custom Apparel',
      productImage: item.productImage || null,
      silhouetteColor: item.silhouetteColor || 'from-stone-100 to-amber-50',
      accentColor: item.accentColor || '#1F2937',
      basePrice: item.basePrice || item.itemPrice || 0,
      
      // Fabric specifications
      selectedFabric: item.selectedFabric || null,
      fabric: item.selectedFabric || item.fabric || null,

      // Color specifications
      selectedColor: item.selectedColor || null,
      color: item.selectedColor || item.color || null,

      // Design specifications
      designOptions: item.designOptions || item.selectedDesign || {},
      design: item.selectedDesign || item.designOptions || {
        collar: item.collar || 'Standard',
        cuff: item.cuff || 'Standard',
        buttons: item.buttons || 'Standard',
        monogram: item.monogram || null
      },
      collar: item.collar || item.designOptions?.collar || 'Standard',
      cuff: item.cuff || item.designOptions?.cuff || 'Standard',
      buttons: item.buttons || item.designOptions?.buttons || 'Standard',
      monogram: item.monogram || item.designOptions?.monogram || null,

      // Size & tailoring metrics
      size: item.size || 'Custom Tailored',
      customMeasurements: item.customMeasurements || {},
      measurementUnit: item.measurementUnit || 'inches',
      fit: item.fit || 'Regular',

      // Fragrance pairing
      selectedPerfume: item.selectedPerfume || null,
      perfume: item.selectedPerfume || item.perfume || null,
      perfumePrice: item.perfumePrice || 0,

      // Quantity & pricing
      quantity: Number(item.quantity) || 1,
      itemPrice: Number(item.itemPrice) || Number(item.basePrice) || 0,
      totalItemPrice: Number(item.totalItemPrice) || Number(item.price) || 0
    });
  });

  const completeOrder = sanitizePayload({
    id: orderId,
    orderId: orderId,
    orderNumber: orderId,
    userId: userId || order.userId || 'guest',
    createdAt: order.createdAt || nowIso,
    date: order.date || order.createdAt || nowIso,
    formattedDate: order.formattedDate || new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    customer: {
      fullName: order.customer?.fullName || '',
      email: order.customer?.email || '',
      phone: order.customer?.phone || ''
    },
    deliveryAddress: {
      address: order.deliveryAddress?.address || order.shippingAddress?.address || '',
      city: order.deliveryAddress?.city || order.shippingAddress?.city || '',
      state: order.deliveryAddress?.state || order.shippingAddress?.state || '',
      pincode: order.deliveryAddress?.pincode || order.shippingAddress?.pincode || ''
    },
    shippingAddress: {
      address: order.deliveryAddress?.address || order.shippingAddress?.address || '',
      city: order.deliveryAddress?.city || order.shippingAddress?.city || '',
      state: order.deliveryAddress?.state || order.shippingAddress?.state || '',
      pincode: order.deliveryAddress?.pincode || order.shippingAddress?.pincode || ''
    },
    paymentMethod: order.paymentMethod || 'Cash on Delivery',
    paymentStatus: order.paymentStatus || (order.paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid'),
    paymentReference: order.paymentReference || null,
    orderStatus: order.status || order.orderStatus || 'Order Confirmed',
    status: order.status || order.orderStatus || 'Order Confirmed',
    tailoringStatus: order.tailoringStatus || 'Pattern Drafting & Fabric Allocation',
    items: normalizedItems,
    subtotal: Number(order.subtotal) || 0,
    delivery: Number(order.delivery) || 0,
    discount: Number(order.discount) || 0,
    coupon: order.couponCode || order.coupon || null,
    couponCode: order.couponCode || order.coupon || null,
    total: Number(order.total) || 0,
    pricing: {
      subtotal: Number(order.subtotal) || 0,
      delivery: Number(order.delivery) || 0,
      discount: Number(order.discount) || 0,
      total: Number(order.total) || 0
    },
    updatedAt: nowIso
  });

  try {
    const orderDocRef = doc(db, 'orders', orderId);
    await setDoc(orderDocRef, completeOrder);
    return { success: true, order: completeOrder, id: orderId };
  } catch (err) {
    console.warn('[Firestore] Failed to save order to Firestore:', err?.message || err);
    // Return order object even if Firestore fails so caller can perform graceful fallback
    return { success: false, order: completeOrder, error: err };
  }
}

/**
 * Fetch orders for the currently authenticated user
 * @param {string} userId - Current user UID
 */
export async function getUserOrders(userId) {
  if (!userId) {
    return { success: true, orders: [], source: 'empty' };
  }

  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId));
    const snap = await getDocs(q);

    const orders = [];
    snap.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() });
    });

    // In-memory newest first sorting (resilient against missing composite indexes)
    orders.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.date || 0).getTime();
      const timeB = new Date(b.createdAt || b.date || 0).getTime();
      return timeB - timeA;
    });

    return { success: true, orders, source: 'firestore' };
  } catch (err) {
    console.warn('[Firestore] Failed to fetch orders from Firestore:', err?.message || err);
    return { success: false, orders: [], error: err, source: 'error' };
  }
}

/**
 * Unified Order Lifecycle Tracking Stages
 */
export const ORDER_TRACKING_STAGES = [
  'Order Confirmed',
  'Fabric Cutting',
  'Artisan Stitching',
  'Master QA Check',
  'Dispatched',
  'Delivered'
];

export const TAILORING_LIFECYCLE_MAPPING = {
  'Order Confirmed': 'Pattern Drafting & Fabric Allocation',
  'Fabric Cutting': 'Textile Allocation & Laser Fabric Cutting',
  'Artisan Stitching': 'Hand-stitched by Master Atelier Artisan',
  'Master QA Check': 'Final Quality & Dimensional Audit',
  'Dispatched': 'Packaged in Luxury Box & Dispatched to Courier',
  'Delivered': 'Delivered to Client & Fitting Confirmed',
  'Cancelled': 'Order Cancelled & Production Halted'
};

/**
 * Retrieve a single bespoke tailoring order by ID
 * @param {string} orderId - Order identifier (e.g. FF-2026-XXXXXX)
 * @param {string} [userId] - Optional user UID for ownership validation
 */
export async function getOrderById(orderId, userId = null) {
  if (!orderId) {
    return { success: false, order: null, error: new Error('Order ID is required') };
  }

  const cleanOrderId = String(orderId).trim();

  try {
    const orderDocRef = doc(db, 'orders', cleanOrderId);
    const snap = await getDoc(orderDocRef);

    if (snap.exists()) {
      const order = { id: snap.id, ...snap.data() };
      return { success: true, order, source: 'firestore' };
    }
  } catch (err) {
    console.warn('[Firestore] getOrderById failed for ' + cleanOrderId + ':', err?.message || err);
  }

  // Graceful local cache fallback (offline resilience)
  try {
    const saved = localStorage.getItem('fitfusion_orders');
    if (saved) {
      const localOrders = JSON.parse(saved);
      if (Array.isArray(localOrders)) {
        const found = localOrders.find(
          (o) => String(o.id || o.orderId || o.orderNumber) === cleanOrderId
        );
        if (found) {
          return { success: true, order: found, source: 'local_cache' };
        }
      }
    }
  } catch (cacheErr) {
    console.warn('[Firestore] Failed inspecting local cache for order:', cacheErr);
  }

  return { success: false, order: null, source: 'not_found' };
}

/**
 * Real-time listener for a single order's status
 * @param {string} orderId
 * @param {function} onUpdate - callback(order)
 * @param {function} [onError] - callback(error)
 * @returns {function} unsubscribe function
 */
export function subscribeToOrder(orderId, onUpdate, onError) {
  if (!orderId) return () => {};
  try {
    const orderDocRef = doc(db, 'orders', String(orderId).trim());
    return onSnapshot(
      orderDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate({ id: docSnap.id, ...docSnap.data() });
        } else {
          onUpdate(null);
        }
      },
      (err) => {
        console.warn('[Firestore Realtime] Error on order ' + orderId + ':', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn('[Firestore Realtime] Failed attaching listener:', err);
    return () => {};
  }
}


/**
 * ---------------------------------------------------------------------
 * 3. PRODUCT CATALOG PERSISTENCE (`products` Collection)
 * ---------------------------------------------------------------------
 */

/**
 * Fetch a single product by ID from Firestore with fallback to MOCK_PRODUCTS
 * @param {string} productId
 */
export async function getProductById(productId) {
  if (!productId) return { success: false, product: null };
  const cleanId = String(productId).trim();

  try {
    const prodRef = doc(db, 'products', cleanId);
    const snap = await getDoc(prodRef);
    if (snap.exists()) {
      return { success: true, product: { id: snap.id, ...snap.data() }, source: 'firestore' };
    }
  } catch (err) {
    console.warn('[Firestore] getProductById failed for ' + cleanId + ':', err?.message || err);
  }

  // Fallback to MOCK_PRODUCTS
  const fallback = MOCK_PRODUCTS.find((p) => String(p.id) === cleanId || p.slug === cleanId);
  if (fallback) {
    return { success: true, product: fallback, source: 'fallback' };
  }

  return { success: false, product: null, source: 'not_found' };
}

/**
 * Fetch apparel catalog from Firestore with fallback to MOCK_PRODUCTS
 */
export async function getProductsFromFirestore() {
  try {
    const productsRef = collection(db, 'products');
    const snap = await getDocs(productsRef);

    if (!snap.empty) {
      const products = [];
      snap.forEach((docSnap) => {
        products.push({ id: docSnap.id, ...docSnap.data() });
      });
      return { success: true, products, source: 'firestore' };
    }
  } catch (err) {
    console.warn('[Firestore] Could not load products from Firestore, using mock fallback:', err?.message || err);
  }

  // Safe fallback to mock dataset
  return { success: true, products: MOCK_PRODUCTS, source: 'fallback' };
}

/**
 * Seed initial mock products into Firestore (used for setup/admin)
 */
export async function seedProductsToFirestore() {
  const results = { successful: 0, failed: 0 };
  const nowIso = new Date().toISOString();

  for (const product of MOCK_PRODUCTS) {
    try {
      const prodRef = doc(db, 'products', String(product.id));
      const payload = sanitizePayload({
        ...product,
        available: true,
        createdAt: nowIso,
        updatedAt: nowIso
      });
      await setDoc(prodRef, payload, { merge: true });
      results.successful += 1;
    } catch (err) {
      console.warn(`[Firestore] Failed seeding product ${product.id}:`, err?.message || err);
      results.failed += 1;
    }
  }

  return results;
}



/**
* ---------------------------------------------------------------------
 * 4. PHASE 7 ADMIN OPERATIONS (Orders, Users & Catalog Management)
 * ---------------------------------------------------------------------
*/

/**
 * Fetch all bespoke tailoring orders for admin oversight
 * Orders are sorted newest-first in memory.
 */
export async function getAllOrdersForAdmin() {
  try {
    const ordersRef = collection(db, 'orders');
    const snap = await getDocs(ordersRef);

    const orders = [];
    snap.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() });
    });

    // In-memory newest first sorting
    orders.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.date || 0).getTime();
      const timeB = new Date(b.createdAt || b.date || 0).getTime();
      return timeB - timeA;
    });

    return { success: true, orders, count: orders.length, source: 'firestore' };
  } catch (err) {
    console.warn('[Firestore Admin] Failed fetching all orders:', err?.message || err);
    return { success: false, orders: [], count: 0, error: err, source: 'error' };
  }
}

/**
 * Update tailoring & lifecycle status of an order
 * @param {string} orderId
 * @param {object} updates - { orderStatus, tailoringStatus, notes, trackingNumber }
 */
export async function updateOrderStatus(orderId, updates = {}) {
  if (!orderId) {
    throw new Error('Order ID is required to update order status');
  }

  const nowIso = new Date().toISOString();
  const payload = sanitizePayload({
    ...updates,
    status: updates.orderStatus || updates.status,
    orderStatus: updates.orderStatus || updates.status,
    tailoringStatus: updates.tailoringStatus,
    updatedAt: nowIso
  });

  try {
    const orderDocRef = doc(db, 'orders', String(orderId));
    await updateDoc(orderDocRef, payload);
    return { success: true, id: orderId, updates: payload };
  } catch (err) {
    console.warn(`[
Firestore Admin] Failed updating order ${orderId}:`, err?.message || err);
    return { success: false, id: orderId, error: err };
  }
}

/**
 * Fetch all registered users for customer oversight
 * Never returns sensitive password fields (passwords reside in Firebase Auth only).
 */
export async function getAllUsersForAdmin() {
  try {
    const usersRef = collection(db, 'users');
    const snap = await getDocs(usersRef);

    const users = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      users.push({
        id: docSnap.id,
        uid: data.uid || docSnap.id,
        name: data.name || data.displayName || 'Customer',
        displayName: data.displayName || data.name || '',
        email: data.email || 'N/A',
        phone: data.phone || '',
        role: data.role || 'customer',
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null
      });
    });

    // In-memory newest first
    users.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return { success: true, users, count: users.length, source: 'firestore' };
  } catch (err) {
    console.warn('[Firestore Admin] Failed fetching users:', err?.message || err);
    return { success: false, users: [], count: 0, error: err, source: 'error' };
  }
}

/**
 * Fetch product catalog for admin management
 * Automatically falls back to MOCK_PRODUCTS if Firestore catalog is empty.
 */
export async function getAdminProducts() {
  try {
    const productsRef = collection(db, 'products');
    const snap = await getDocs(productsRef);

    if (!snap.empty) {
      const products = [];
      snap.forEach((docSnap) => {
        products.push({ id: docSnap.id, ...docSnap.data() });
      });
      return { success: true, products, count: products.length, source: 'firestore' };
    }
  } catch (err) {
    console.warn('[Firestore Admin] Could not load products from Firestore, using mock fallback:', err?.message || err);
  }

  // Fallback to MOCK_PRODUCTS with default available: true
  const fallback = MOCK_PRODUCTS.map((p) => ({
    ...p,
    available: p.available !== false
  }));
  return { success: true, products: fallback, count: fallback.length, source: 'fallback' };
}

/**
 * Create a new product in the catalog
 * @param {object} productData
 */
export async function createAdminProduct(productData) {
  const nowIso = new Date().toISOString();
  const id = productData.id ? String(productData.id) : 'prod-' + Date.now();
  const slug = productData.slug || (productData.name ? productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : id);

  const payload = sanitizePayload({
    ...productData,
    id,
    slug,
    currency: 'INR',
    basePrice: Number(productData.basePrice || productData.price) || 0,
    compareAtPrice: productData.compareAtPrice ? Number(productData.compareAtPrice) : null,
    available: productData.available !== false,
    stock: productData.stock !== undefined ? Math.max(0, Number(productData.stock)) : 25,
    lowStockThreshold: productData.lowStockThreshold !== undefined ? Math.max(1, Number(productData.lowStockThreshold)) : 5,
    stockStatus: productData.stockStatus || (productData.available === false || Number(productData.stock) === 0 ? 'Out of Stock' : (Number(productData.stock) <= (Number(productData.lowStockThreshold) || 5) ? 'Low Stock' : 'In Stock')),
    customizationEnabled: productData.customizationEnabled !== false,
    featured: Boolean(productData.featured),
    trending: Boolean(productData.trending),
    recommended: Boolean(productData.recommended),
    rating: Number(productData.rating) || 5.0,
    reviewsCount: Number(productData.reviewsCount) || 0,
    createdAt: nowIso,
    updatedAt: nowIso
  });

  try {
    const prodRef = doc(db, 'products', id);
    await setDoc(prodRef, payload);
    return { success: true, id, product: payload };
  } catch (err) {
    console.warn('[Firestore Admin] Failed creating product:', err?.message || err);
    return { success: false, error: err };
  }
}

/**
 * Update an existing product document
 * @param {string} productId
 * @param {object} updates
 */
export async function updateAdminProduct(productId, updates = {}) {
  if (!productId) {
    throw new Error('Product ID is required to update');
  }

  const nowIso = new Date().toISOString();
  const payload = sanitizePayload({
    ...updates,
    id: String(productId),
    updatedAt: nowIso
  });

  if (updates.basePrice !== undefined || updates.price !== undefined) {
    payload.basePrice = Number(updates.basePrice || updates.price) || 0;
  }

  try {
    const prodRef = doc(db, 'products', String(productId));
    await setDoc(prodRef, payload, { merge: true });
    return { success: true, id: productId, updates: payload };
  } catch (err) {
    console.warn(`[
Firestore Admin] Failed updating product ${productId}:`, err?.message || err);
    return { success: false, error: err };
  }
}

/**
 * Toggle product active/disabled status
 * @param {string} productId
 * @param {boolean} available
 */
export async function toggleProductAvailability(productId, available) {
  return updateAdminProduct(productId, { available: Boolean(available) });
}


/**
 * Phase 17: Update product inventory stock and threshold directly
 * @param {string} productId
 * @param {number} stock
 * @param {number} [lowStockThreshold]
 */
export async function updateProductStock(productId, stock, lowStockThreshold = 5) {
  const stockNum = Math.max(0, Number(stock) || 0);
  const thresholdNum = Math.max(1, Number(lowStockThreshold) || 5);
  let stockStatus = 'In Stock';
  let available = true;

  if (stockNum === 0) {
    stockStatus = 'Out of Stock';
    available = false;
  } else if (stockNum <= thresholdNum) {
    stockStatus = 'Low Stock';
  }

  return updateAdminProduct(productId, {
    stock: stockNum,
    lowStockThreshold: thresholdNum,
    stockStatus,
    available
  });
}
