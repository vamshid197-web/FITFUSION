/**
 * FITFUSION CASHBACK WALLET & LOYALTY LEDGER SERVICE (PHASE 16)
 * Manages customer cashback balances, pending earnings, and redemption ledger.
 */

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import { createNotification } from './notificationService.js';
import { logAdminActivity } from './adminActivityService.js';

const WALLET_KEY_PREFIX = 'fitfusion_cashback_wallet_';
const TXN_KEY_PREFIX = 'fitfusion_cashback_txns_';

/**
 * Standard default empty wallet state
 */
const INITIAL_WALLET = {
  available: 0,
  pending: 0,
  totalEarned: 0,
  totalRedeemed: 0
};

/**
 * Retrieve a customer's cashback wallet balance
 * @param {string} userId 
 * @returns {Promise<{ available: number, pending: number, totalEarned: number, totalRedeemed: number }>}
 */
export async function getCashbackWallet(userId) {
  if (!userId) return INITIAL_WALLET;

  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.cashbackWallet) {
        const wallet = {
          available: Number(data.cashbackWallet.available || 0),
          pending: Number(data.cashbackWallet.pending || 0),
          totalEarned: Number(data.cashbackWallet.totalEarned || 0),
          totalRedeemed: Number(data.cashbackWallet.totalRedeemed || 0)
        };
        try {
          localStorage.setItem(WALLET_KEY_PREFIX + userId, JSON.stringify(wallet));
        } catch (e) {}
        return wallet;
      }
    }
  } catch (err) {
    console.warn('[cashbackService] Firestore wallet read error, falling back to cache:', err.message);
  }

  // Fallback to local storage
  try {
    const cached = localStorage.getItem(WALLET_KEY_PREFIX + userId);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {}

  return INITIAL_WALLET;
}

/**
 * Retrieve transaction history for a customer's wallet
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export async function getCashbackTransactions(userId) {
  if (!userId) return [];

  try {
    const cached = localStorage.getItem(TXN_KEY_PREFIX + userId);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return parsed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }
  } catch (e) {}

  return [];
}

/**
 * Save updated wallet state to Firestore and local storage
 * @param {string} userId 
 * @param {object} wallet 
 */
async function persistWallet(userId, wallet) {
  try {
    localStorage.setItem(WALLET_KEY_PREFIX + userId, JSON.stringify(wallet));
  } catch (e) {}

  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      cashbackWallet: wallet,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[cashbackService] Firestore wallet update warning:', err.message);
  }
}

/**
 * Save a new transaction to the customer's ledger
 * @param {string} userId 
 * @param {object} txn 
 */
async function appendTransaction(userId, txn) {
  const current = await getCashbackTransactions(userId);
  const updated = [txn, ...current];
  try {
    localStorage.setItem(TXN_KEY_PREFIX + userId, JSON.stringify(updated));
  } catch (e) {}
}

/**
 * Record pending cashback on qualifying order placement
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.orderId
 * @param {number} params.cashbackAmount
 * @param {string} [params.description]
 * @returns {Promise<{ success: boolean, pendingAmount: number }>}
 */
export async function recordPendingCashback({
  userId,
  orderId,
  cashbackAmount = 0,
  description = 'Cashback earned (Unlocks upon delivery)'
}) {
  if (!userId || Number(cashbackAmount) <= 0) {
    return { success: false, pendingAmount: 0 };
  }

  const amount = Math.round(Number(cashbackAmount));
  const wallet = await getCashbackWallet(userId);

  wallet.pending = Number(wallet.pending || 0) + amount;
  wallet.totalEarned = Number(wallet.totalEarned || 0) + amount;

  await persistWallet(userId, wallet);

  const txn = {
    id: `txn_pending_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type: 'pending',
    amount,
    orderId,
    description: description || `Order #${orderId} Cashback (Pending Delivery)`,
    createdAt: new Date().toISOString()
  };

  await appendTransaction(userId, txn);

  // Notify customer of pending rewards
  try {
    await createNotification({
      userId,
      title: '✨ Cashback Pending',
      message: `₹${amount.toLocaleString('en-IN')} cashback is pending for Order #${orderId}. It will be unlocked once your bespoke piece is delivered!`,
      type: 'order',
      link: `/orders/${orderId}`
    });
  } catch (e) {}

  return { success: true, pendingAmount: amount };
}

/**
 * Unlock pending cashback when order status changes to 'Delivered'
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.orderId
 * @returns {Promise<{ success: boolean, unlockedAmount: number }>}
 */
export async function unlockDeliveredCashback({ userId, orderId }) {
  if (!userId || !orderId) return { success: false, unlockedAmount: 0 };

  const txns = await getCashbackTransactions(userId);
  const pendingTxn = txns.find((t) => t.orderId === orderId && t.type === 'pending');

  if (!pendingTxn) {
    return { success: false, unlockedAmount: 0 };
  }

  // Prevent double unlocking
  const alreadyUnlocked = txns.some((t) => t.orderId === orderId && t.type === 'credit');
  if (alreadyUnlocked) {
    return { success: false, unlockedAmount: 0 };
  }

  const amount = Number(pendingTxn.amount || 0);
  if (amount <= 0) return { success: false, unlockedAmount: 0 };

  const wallet = await getCashbackWallet(userId);

  wallet.pending = Math.max(0, Number(wallet.pending || 0) - amount);
  wallet.available = Number(wallet.available || 0) + amount;

  await persistWallet(userId, wallet);

  const unlockedTxn = {
    id: `txn_unlocked_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type: 'credit',
    amount,
    orderId,
    description: `Cashback unlocked for delivered Order #${orderId}`,
    createdAt: new Date().toISOString()
  };

  await appendTransaction(userId, unlockedTxn);

  // Send celebratory notification to patron
  try {
    await createNotification({
      userId,
      title: '🎉 Cashback Unlocked!',
      message: `₹${amount.toLocaleString('en-IN')} cashback from Order #${orderId} is now unlocked and available in your Atelier Wallet!`,
      type: 'order',
      link: '/profile'
    });
  } catch (e) {}

  return { success: true, unlockedAmount: amount };
}

/**
 * Redeem available cashback balance during checkout
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.orderId
 * @param {number} params.amount
 * @returns {Promise<{ success: boolean, redeemedAmount: number, error?: string }>}
 */
export async function redeemCashback({ userId, orderId, amount = 0 }) {
  if (!userId) return { success: false, redeemedAmount: 0, error: 'User must be signed in.' };

  const redeemAmt = Math.round(Number(amount));
  if (redeemAmt <= 0) return { success: true, redeemedAmount: 0 };

  const wallet = await getCashbackWallet(userId);
  if (redeemAmt > wallet.available) {
    return {
      success: false,
      redeemedAmount: 0,
      error: `Insufficient cashback balance. You have ₹${wallet.available.toLocaleString('en-IN')} available.`
    };
  }

  wallet.available = Math.max(0, wallet.available - redeemAmt);
  wallet.totalRedeemed = Number(wallet.totalRedeemed || 0) + redeemAmt;

  await persistWallet(userId, wallet);

  const debitTxn = {
    id: `txn_debit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type: 'debit',
    amount: redeemAmt,
    orderId,
    description: `Cashback redeemed on Order #${orderId}`,
    createdAt: new Date().toISOString()
  };

  await appendTransaction(userId, debitTxn);

  return { success: true, redeemedAmount: redeemAmt };
}


/**
 * Phase 17: Auditable administrative cashback adjustment for customer support
 * @param {object} params
 * @param {string} params.userId
 * @param {number} params.amount - Positive to grant, negative to deduct
 * @param {string} params.reason - Mandatory explanation for business auditing
 * @param {string} [params.adminId]
 * @param {string} [params.adminEmail]
 * @param {string} [params.orderId]
 */
export async function adjustCustomerCashbackAdmin({
  userId,
  amount,
  reason,
  adminId = 'admin',
  adminEmail = 'admin@fitfusion.com',
  orderId = null
}) {
  if (!userId) return { success: false, error: 'User ID is required' };
  const adjAmt = Math.round(Number(amount));
  if (isNaN(adjAmt) || adjAmt === 0) {
    return { success: false, error: 'Valid non-zero adjustment amount is required' };
  }
  if (!reason || !reason.trim()) {
    return { success: false, error: 'Mandatory audit reason is required for administrative adjustment' };
  }

  const wallet = await getCashbackWallet(userId);
  if (adjAmt < 0 && Math.abs(adjAmt) > wallet.available) {
    return {
      success: false,
      error: `Cannot deduct ₹${Math.abs(adjAmt).toLocaleString('en-IN')}. Customer only has ₹${wallet.available.toLocaleString('en-IN')} available.`
    };
  }

  // Update wallet
  wallet.available = Math.max(0, wallet.available + adjAmt);
  if (adjAmt > 0) {
    wallet.totalEarned = Number(wallet.totalEarned || 0) + adjAmt;
  } else {
    wallet.totalRedeemed = Number(wallet.totalRedeemed || 0) + Math.abs(adjAmt);
  }

  await persistWallet(userId, wallet);

  // Auditable transaction entry
  const txn = {
    id: `txn_admin_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type: adjAmt > 0 ? 'credit' : 'debit',
    amount: Math.abs(adjAmt),
    orderId: orderId || null,
    adminId,
    adminEmail,
    reason: reason.trim(),
    description: `Executive Adjustment: ${reason.trim()} (${adjAmt > 0 ? '+' : '-'}₹${Math.abs(adjAmt).toLocaleString('en-IN')})`,
    createdAt: new Date().toISOString()
  };

  await appendTransaction(userId, txn);

  // Log in Admin Activity Log
  try {
    await logAdminActivity({
      action: 'CASHBACK_ADJUSTED',
      targetType: 'cashback',
      targetId: userId,
      details: `${adjAmt > 0 ? 'Credited' : 'Debited'} ₹${Math.abs(adjAmt)} for user ${userId}. Reason: ${reason.trim()}`,
      adminId,
      adminEmail
    });
  } catch (e) {}

  // Notify customer
  try {
    await createNotification({
      userId,
      title: '💳 Atelier Wallet Adjustment',
      message: `Your cashback wallet was adjusted by ${adjAmt > 0 ? '+' : '-'}₹${Math.abs(adjAmt).toLocaleString('en-IN')}. Note: ${reason.trim()}`,
      type: 'system',
      link: '/profile'
    });
  } catch (e) {}

  return { success: true, newBalance: wallet.available, transaction: txn };
}

/**
 * Phase 17: Aggregate cashback metrics across the entire platform
 * @param {Array<string>} [allUserIds]
 * @returns {Promise<{ totalIssued: number, totalRedeemed: number, totalPending: number, totalAvailable: number }>}
 */
export async function getAggregateCashbackMetrics(allUserIds = []) {
  let totalIssued = 0;
  let totalRedeemed = 0;
  let totalPending = 0;
  let totalAvailable = 0;

  // Check all localStorage wallets
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(WALLET_KEY_PREFIX)) {
        try {
          const w = JSON.parse(localStorage.getItem(key));
          if (w) {
            totalIssued += Number(w.totalEarned || 0);
            totalRedeemed += Number(w.totalRedeemed || 0);
            totalPending += Number(w.pending || 0);
            totalAvailable += Number(w.available || 0);
          }
        } catch (e) {}
      }
    }
  } catch (e) {}

  return {
    totalIssued,
    totalRedeemed,
    totalPending,
    totalAvailable
  };
}
