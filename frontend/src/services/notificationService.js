import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase.js';

/**
 * Standard Notification Types for FitFusion
 */
export const NOTIFICATION_TYPES = {
  ORDER_CREATED: 'ORDER_CREATED',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  ORDER_STATUS_UPDATED: 'ORDER_STATUS_UPDATED',
  TAILORING_STATUS_UPDATED: 'TAILORING_STATUS_UPDATED',
  ORDER_DISPATCHED: 'ORDER_DISPATCHED',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  GENERAL: 'GENERAL'
};

const LOCAL_STORAGE_KEY = 'fitfusion_notifications';
// In-memory cache for recent notification keys to guarantee zero duplicates within 60s
const recentNotificationsCache = new Map();

/**
 * Helper to strip undefined values for Firestore serialization
 */
function sanitizePayload(obj) {
  const clean = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
        clean[key] = sanitizePayload(obj[key]);
      } else {
        clean[key] = obj[key];
      }
    }
  });
  return clean;
}

/**
 * Formats timestamps into elegant, customer-friendly relative strings
 */
export function formatNotificationTime(isoString) {
  if (!isoString) return 'Just now';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return 'Recently';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);

  if (diffSec < 45) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) {
    const isToday = now.toDateString() === date.toDateString();
    if (isToday) {
      return `Today, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `${diffHours}h ago`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (yesterday.toDateString() === date.toDateString()) {
    return `Yesterday, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Local cache read helper
 */
function getLocalNotifications() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[NotificationService] LocalStorage read warning:', err);
    return [];
  }
}

/**
 * Local cache write helper
 */
function saveLocalNotifications(list) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('[NotificationService] LocalStorage write warning:', err);
  }
}

/**
 * Create a new notification with duplicate suppression and offline fallback
 * @param {object} param0
 * @returns {Promise<{success: boolean, notification: object}>}
 */
export async function createNotification({
  userId,
  type = NOTIFICATION_TYPES.GENERAL,
  title,
  message,
  orderId = null,
  metadata = {}
}) {
  if (!userId) {
    console.warn('[NotificationService] Notification skipped: userId is missing');
    return { success: false, reason: 'missing_user_id' };
  }

  if (!title || !message) {
    console.warn('[NotificationService] Notification skipped: title or message missing');
    return { success: false, reason: 'missing_content' };
  }

  // Duplicate Prevention: suppress identical notifications within 60 seconds
  const dedupKey = `${userId}_${type}_${orderId || ''}_${title}`;
  const lastSentTime = recentNotificationsCache.get(dedupKey);
  const now = Date.now();
  if (lastSentTime && now - lastSentTime < 60000) {
    // Duplicate notification suppressed
    return { success: true, dedupSuppressed: true };
  }
  recentNotificationsCache.set(dedupKey, now);

  const notifId = 'notif_' + now + '_' + Math.random().toString(36).substring(2, 7);
  const nowIso = new Date().toISOString();

  const notificationData = sanitizePayload({
    id: notifId,
    userId,
    type,
    title,
    message,
    orderId: orderId ? String(orderId) : null,
    metadata: metadata || {},
    read: false,
    createdAt: nowIso,
    updatedAt: nowIso
  });

  // 1. Persist to local cache immediately
  const localList = getLocalNotifications();
  saveLocalNotifications([notificationData, ...localList]);

  // 2. Persist to Cloud Firestore
  try {
    const docRef = doc(db, 'notifications', notifId);
    await setDoc(docRef, notificationData);
  } catch (firestoreErr) {
    console.warn('[NotificationService] Firestore write failed, stored in local cache:', firestoreErr?.message || firestoreErr);
  }

  return { success: true, notification: notificationData };
}

/**
 * Fetch notifications for a given user (or admin)
 * @param {string} userId
 * @param {boolean} isAdmin
 * @returns {Promise<{success: boolean, notifications: Array}>}
 */
export async function getUserNotifications(userId, isAdmin = false) {
  if (!userId) return { success: true, notifications: [] };

  try {
    const notifsRef = collection(db, 'notifications');
    let q;

    if (isAdmin) {
      // Admins see notifications intended for them as well as system alerts
      q = query(notifsRef, where('userId', 'in', [userId, 'admin', 'all']));
    } else {
      // Normal customers see their own notifications and broadcast alerts
      q = query(notifsRef, where('userId', 'in', [userId, 'all']));
    }

    const snap = await getDocs(q);
    const firestoreItems = [];
    snap.forEach((docSnap) => {
      firestoreItems.push({ id: docSnap.id, ...docSnap.data() });
    });

    if (firestoreItems.length > 0) {
      // Merge with any local offline notifications and sort newest first
      const localList = getLocalNotifications().filter((n) =>
        isAdmin ? n.userId === userId || n.userId === 'admin' || n.userId === 'all' : n.userId === userId || n.userId === 'all'
      );
      const idMap = new Map();
      firestoreItems.forEach((item) => idMap.set(item.id, item));
      localList.forEach((item) => {
        if (!idMap.has(item.id)) idMap.set(item.id, item);
      });

      const combined = Array.from(idMap.values());
      combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      return { success: true, notifications: combined, source: 'firestore' };
    }
  } catch (err) {
    console.warn('[NotificationService] Firestore query error, falling back to local storage:', err?.message || err);
  }

  // Fallback to local storage
  const localList = getLocalNotifications().filter((n) =>
    isAdmin ? n.userId === userId || n.userId === 'admin' || n.userId === 'all' : n.userId === userId || n.userId === 'all'
  );
  localList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  return { success: true, notifications: localList, source: 'local' };
}

/**
 * Real-time listener for user notifications with automatic cleanup
 * @param {string} userId
 * @param {Function} onUpdate - callback received notifications array
 * @param {boolean} isAdmin
 * @returns {Function} unsubscribe function
 */
export function subscribeToUserNotifications(userId, onUpdate, isAdmin = false) {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  // Provide initial immediate cached state so UI never flickers
  getUserNotifications(userId, isAdmin).then((res) => {
    if (res.success && res.notifications) {
      onUpdate(res.notifications);
    }
  });

  try {
    const notifsRef = collection(db, 'notifications');
    const q = isAdmin
      ? query(notifsRef, where('userId', 'in', [userId, 'admin', 'all']))
      : query(notifsRef, where('userId', 'in', [userId, 'all']));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const notifs = [];
        snap.forEach((docSnap) => {
          notifs.push({ id: docSnap.id, ...docSnap.data() });
        });

        // Merge with local fallback
        const localList = getLocalNotifications().filter((n) =>
          isAdmin ? n.userId === userId || n.userId === 'admin' || n.userId === 'all' : n.userId === userId || n.userId === 'all'
        );
        const idMap = new Map();
        notifs.forEach((item) => idMap.set(item.id, item));
        localList.forEach((item) => {
          if (!idMap.has(item.id)) idMap.set(item.id, item);
        });

        const combined = Array.from(idMap.values());
        combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        onUpdate(combined);
      },
      (err) => {
        console.warn('[NotificationService] Snapshot listener warning (using fallback):', err?.message || err);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[NotificationService] Could not establish Firestore snapshot listener:', err);
    return () => {};
  }
}

/**
 * Mark a single notification as read
 * @param {string} notificationId
 */
export async function markNotificationAsRead(notificationId) {
  if (!notificationId) return { success: false };

  const nowIso = new Date().toISOString();

  // 1. Update local storage
  const localList = getLocalNotifications().map((item) => {
    if (item.id === notificationId) {
      return { ...item, read: true, updatedAt: nowIso };
    }
    return item;
  });
  saveLocalNotifications(localList);

  // 2. Update Firestore
  try {
    const docRef = doc(db, 'notifications', notificationId);
    await updateDoc(docRef, { read: true, updatedAt: nowIso });
  } catch (err) {
    console.warn('[NotificationService] Firestore mark as read warning:', err?.message || err);
  }

  return { success: true, notificationId };
}

/**
 * Mark all notifications as read for a given user
 * @param {string} userId
 * @param {Array} currentNotifications
 */
export async function markAllNotificationsAsRead(userId, currentNotifications = []) {
  if (!userId) return { success: false };

  const nowIso = new Date().toISOString();

  // 1. Update local storage
  const localList = getLocalNotifications().map((item) => {
    if (item.userId === userId || item.userId === 'all' || (userId === 'admin' && item.userId === 'admin')) {
      return { ...item, read: true, updatedAt: nowIso };
    }
    return item;
  });
  saveLocalNotifications(localList);

  // 2. Batch update unread notifications in Firestore
  const unreadToUpdate = currentNotifications.filter((n) => !n.read);
  for (const notif of unreadToUpdate) {
    try {
      const docRef = doc(db, 'notifications', notif.id);
      await updateDoc(docRef, { read: true, updatedAt: nowIso });
    } catch (err) {
      // Continue updating remaining
    }
  }

  return { success: true, updatedCount: unreadToUpdate.length };
}

/**
 * Calculate total unread count for user
 * @param {Array} notifications
 */
export function countUnreadNotifications(notifications = []) {
  return notifications.reduce((acc, curr) => (curr && !curr.read ? acc + 1 : acc), 0);
}
