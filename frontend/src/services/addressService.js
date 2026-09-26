import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase.js';

const STORAGE_PREFIX = 'fitfusion_addresses_';

function getStorageKey(userId) {
  return `${STORAGE_PREFIX}${userId || 'guest'}`;
}

function withTimeout(promise, ms = 1500) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), ms))
  ]);
}

function getLocalAddresses(userId) {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(getStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[AddressService] LocalStorage read failed:', err);
    return [];
  }
}

function setLocalAddresses(userId, items) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(getStorageKey(userId), JSON.stringify(items));
    }
  } catch (err) {
    console.warn('[AddressService] LocalStorage write failed:', err);
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
 * Validate customer address fields based on Indian shipping standards
 * @param {object} addr
 * @returns {{ valid: boolean, errors: object }}
 */
export function validateAddress(addr) {
  const errors = {};

  if (!addr.fullName || addr.fullName.trim().length < 2) {
    errors.fullName = 'Full Name must be at least 2 characters';
  }

  const cleanPhone = (addr.phone || '').replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length !== 10) {
    errors.phone = 'Valid 10-digit mobile number is required';
  }

  if (!addr.addressLine1 || addr.addressLine1.trim().length < 5) {
    errors.addressLine1 = 'Street address must be at least 5 characters';
  }

  if (!addr.city || addr.city.trim().length < 2) {
    errors.city = 'City name is required';
  }

  if (!addr.state || addr.state.trim().length < 2) {
    errors.state = 'State is required';
  }

  const cleanPincode = (addr.pincode || '').replace(/\D/g, '');
  if (!cleanPincode || cleanPincode.length !== 6) {
    errors.pincode = 'Valid 6-digit PIN code is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Fetch all saved delivery addresses for a customer
 * @param {string} userId - User UID
 * @returns {Promise<Array>}
 */
export async function getUserAddresses(userId) {
  if (!userId) {
    return getLocalAddresses('guest');
  }

  const localItems = getLocalAddresses(userId);
  let firestoreItems = [];

  try {
    if (db) {
      const addrCol = collection(db, 'users', userId, 'addresses');
      const snap = await withTimeout(getDocs(addrCol));
      snap.forEach((d) => {
        firestoreItems.push({ id: d.id, ...d.data() });
      });
    }
  } catch (err) {
    // Network fallback
  }

  const map = new Map();
  firestoreItems.forEach((item) => map.set(item.id, item));
  localItems.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });

  const merged = Array.from(map.values()).sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  setLocalAddresses(userId, merged);
  return merged;
}

/**
 * Add a new delivery address
 */
export async function addAddress(userId, addressData) {
  const validation = validateAddress(addressData);
  if (!validation.valid) {
    throw new Error(Object.values(validation.errors)[0] || 'Invalid address data');
  }

  const addressId = 'addr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const nowIso = new Date().toISOString();

  const existingList = getLocalAddresses(userId);
  const willBeDefault = Boolean(addressData.isDefault) || existingList.length === 0;

  // If new address is marked default, unset default flag on all others
  let updatedList = existingList;
  if (willBeDefault) {
    updatedList = existingList.map((a) => ({ ...a, isDefault: false }));
  }

  const newAddress = {
    id: addressId,
    userId: userId || 'guest',
    fullName: addressData.fullName.trim(),
    phone: addressData.phone.replace(/\D/g, ''),
    addressLine1: addressData.addressLine1.trim(),
    addressLine2: (addressData.addressLine2 || '').trim(),
    city: addressData.city.trim(),
    state: addressData.state.trim(),
    pincode: addressData.pincode.replace(/\D/g, ''),
    label: addressData.label || 'Home', // 'Home' | 'Work' | 'Other'
    isDefault: willBeDefault,
    createdAt: nowIso,
    updatedAt: nowIso
  };

  updatedList.unshift(newAddress);
  setLocalAddresses(userId, updatedList);

  if (db && userId && userId !== 'guest') {
    try {
      const addrRef = doc(db, 'users', userId, 'addresses', addressId);
      await withTimeout(setDoc(addrRef, sanitizePayload(newAddress)));

      // If default, update user document primary savedAddress for backwards compatibility
      if (willBeDefault) {
        const userRef = doc(db, 'users', userId);
        const fullStreet = [newAddress.addressLine1, newAddress.addressLine2].filter(Boolean).join(', ');
        await withTimeout(
          setDoc(
            userRef,
            {
              savedAddress: {
                address: fullStreet,
                city: newAddress.city,
                state: newAddress.state,
                pincode: newAddress.pincode,
                phone: newAddress.phone,
                fullName: newAddress.fullName
              }
            },
            { merge: true }
          )
        );
      }
    } catch (err) {
      console.warn('[AddressService] Firestore save error (cached locally):', err?.message);
    }
  }

  return newAddress;
}

/**
 * Update an existing delivery address
 */
export async function updateAddress(userId, addressId, addressData) {
  const validation = validateAddress(addressData);
  if (!validation.valid) {
    throw new Error(Object.values(validation.errors)[0] || 'Invalid address data');
  }

  const nowIso = new Date().toISOString();
  const existingList = getLocalAddresses(userId);
  const targetIndex = existingList.findIndex((a) => a.id === addressId);
  if (targetIndex === -1) {
    throw new Error('Address not found');
  }

  const isBecomingDefault = Boolean(addressData.isDefault);
  const updatedList = existingList.map((a) => {
    if (a.id === addressId) {
      return {
        ...a,
        fullName: addressData.fullName.trim(),
        phone: addressData.phone.replace(/\D/g, ''),
        addressLine1: addressData.addressLine1.trim(),
        addressLine2: (addressData.addressLine2 || '').trim(),
        city: addressData.city.trim(),
        state: addressData.state.trim(),
        pincode: addressData.pincode.replace(/\D/g, ''),
        label: addressData.label || a.label || 'Home',
        isDefault: isBecomingDefault ? true : a.isDefault,
        updatedAt: nowIso
      };
    }
    if (isBecomingDefault) {
      return { ...a, isDefault: false };
    }
    return a;
  });

  setLocalAddresses(userId, updatedList);
  const updatedRecord = updatedList.find((a) => a.id === addressId);

  if (db && userId && userId !== 'guest') {
    try {
      const addrRef = doc(db, 'users', userId, 'addresses', addressId);
      await withTimeout(setDoc(addrRef, sanitizePayload(updatedRecord), { merge: true }));

      if (updatedRecord.isDefault) {
        const userRef = doc(db, 'users', userId);
        const fullStreet = [updatedRecord.addressLine1, updatedRecord.addressLine2].filter(Boolean).join(', ');
        await withTimeout(
          setDoc(
            userRef,
            {
              savedAddress: {
                address: fullStreet,
                city: updatedRecord.city,
                state: updatedRecord.state,
                pincode: updatedRecord.pincode,
                phone: updatedRecord.phone,
                fullName: updatedRecord.fullName
              }
            },
            { merge: true }
          )
        );
      }
    } catch (err) {
      console.warn('[AddressService] Firestore update error:', err?.message);
    }
  }

  return updatedRecord;
}

/**
 * Delete a delivery address
 */
export async function deleteAddress(userId, addressId) {
  const existingList = getLocalAddresses(userId);
  const filtered = existingList.filter((a) => a.id !== addressId);

  // If deleted address was default and other addresses remain, make the first one default
  const wasDefault = existingList.find((a) => a.id === addressId)?.isDefault;
  if (wasDefault && filtered.length > 0) {
    filtered[0].isDefault = true;
  }

  setLocalAddresses(userId, filtered);

  if (db && userId && userId !== 'guest') {
    try {
      const addrRef = doc(db, 'users', userId, 'addresses', addressId);
      await withTimeout(deleteDoc(addrRef));

      if (filtered.length > 0 && wasDefault) {
        const nextDefaultRef = doc(db, 'users', userId, 'addresses', filtered[0].id);
        await withTimeout(updateDoc(nextDefaultRef, { isDefault: true }));
      }
    } catch (err) {
      console.warn('[AddressService] Firestore delete error:', err?.message);
    }
  }

  return true;
}

/**
 * Mark an address as default
 */
export async function setDefaultAddress(userId, addressId) {
  const existingList = getLocalAddresses(userId);
  const updatedList = existingList.map((a) => ({
    ...a,
    isDefault: a.id === addressId
  }));

  setLocalAddresses(userId, updatedList);
  const target = updatedList.find((a) => a.id === addressId);

  if (db && userId && userId !== 'guest') {
    try {
      for (const a of updatedList) {
        const ref = doc(db, 'users', userId, 'addresses', a.id);
        await withTimeout(updateDoc(ref, { isDefault: a.isDefault }));
      }

      if (target) {
        const userRef = doc(db, 'users', userId);
        const fullStreet = [target.addressLine1, target.addressLine2].filter(Boolean).join(', ');
        await withTimeout(
          setDoc(
            userRef,
            {
              savedAddress: {
                address: fullStreet,
                city: target.city,
                state: target.state,
                pincode: target.pincode,
                phone: target.phone,
                fullName: target.fullName
              }
            },
            { merge: true }
          )
        );
      }
    } catch (err) {
      console.warn('[AddressService] Firestore default update error:', err?.message);
    }
  }

  return target;
}
