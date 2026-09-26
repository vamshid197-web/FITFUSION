import { collection, doc, setDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase.js';

const LOCAL_STORAGE_KEY = 'fitfusion_admin_activity_logs';

/**
 * Log an administrative action for business accountability and auditing.
 * @param {object} param0
 * @param {string} param0.action - Action identifier (e.g. 'ORDER_STATUS_UPDATED', 'PRODUCT_UPDATED')
 * @param {string} param0.targetType - 'order' | 'product' | 'user' | 'offer' | 'review' | 'cashback'
 * @param {string} param0.targetId - ID of the entity affected
 * @param {string} param0.details - Human-readable summary of the action
 * @param {string} param0.adminId - UID of the administrator
 * @param {string} [param0.adminEmail] - Email of the administrator
 */
export async function logAdminActivity({
  action,
  targetType,
  targetId,
  details,
  adminId = 'admin',
  adminEmail = 'admin@fitfusion.com'
}) {
  const timestamp = new Date().toISOString();
  const id = `act-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  const activityRecord = {
    id,
    action,
    targetType,
    targetId: String(targetId || ''),
    details: String(details || ''),
    adminId,
    adminEmail,
    timestamp
  };

  // 1. Persist to local storage ledger for immediate offline access
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    existing.unshift(activityRecord);
    // Keep last 100 activities locally
    if (existing.length > 100) existing.length = 100;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.warn('[AdminActivity] Local storage write warning:', err);
  }

  // 2. Persist to Firestore /admin_activity_logs
  try {
    const docRef = doc(db, 'admin_activity_logs', id);
    await setDoc(docRef, activityRecord);
  } catch (err) {
    console.warn('[AdminActivity] Firestore write warning (using local fallback):', err?.message || err);
  }

  return activityRecord;
}

/**
 * Retrieve recent administrative activity logs
 * @param {number} limitCount
 * @returns {Promise<Array>}
 */
export async function getAdminActivities(limitCount = 20) {
  // Try Firestore first
  try {
    const collRef = collection(db, 'admin_activity_logs');
    const q = query(collRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const logs = [];
      snap.forEach((d) => logs.push({ id: d.id, ...d.data() }));
      return logs;
    }
  } catch (err) {
    console.warn('[AdminActivity] Firestore read warning, checking local storage:', err?.message || err);
  }

  // Fallback to localStorage
  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    return local.slice(0, limitCount);
  } catch {
    return [];
  }
}
