import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../services/firebase.js';
import { createUserProfile, getUserProfile } from '../services/firestoreService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  /**
   * Helper to load user profile document from Firestore `users/{uid}`
   */
  const loadUserProfile = async (firebaseUser) => {
    if (!firebaseUser?.uid) {
      setUserProfile(null);
      return null;
    }

    try {
      setProfileLoading(true);
      const profile = await getUserProfile(firebaseUser.uid);
      if (profile) {
        setUserProfile(profile);
        return profile;
      } else {
        // Fallback default profile when document does not exist yet
        const defaultProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'FITFUSION Customer',
          displayName: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          phone: '',
          role: 'customer',
          createdAt: new Date().toISOString()
        };
        setUserProfile(defaultProfile);
        return defaultProfile;
      }
    } catch (err) {
      console.warn('[AuthContext] Failed to load Firestore profile:', err?.message || err);
      const fallbackProfile = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        displayName: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        phone: '',
        role: 'customer'
      };
      setUserProfile(fallbackProfile);
      return fallbackProfile;
    } finally {
      setProfileLoading(false);
    }
  };

  /**
   * Monitor Firebase Authentication state transitions
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Authenticate user with Email & Password
   */
  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    if (credential?.user) {
      await loadUserProfile(credential.user);
    }
    return credential;
  };

  /**
   * Register new user with Email, Password, Name, and optional Phone number
   * Persists authentication in Firebase Auth, and profile in Firestore `users/{uid}`
   */
  const signup = async (email, password, displayName, phone = '') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const createdUser = userCredential.user;

    if (displayName && createdUser) {
      try {
        await updateProfile(createdUser, { displayName });
        setUser({ ...createdUser, displayName });
      } catch (profileErr) {
        console.warn('[AuthContext] Could not update Auth displayName:', profileErr);
      }
    }

    // Persist user profile to Firestore `users/{uid}` (excluding password)
    if (createdUser?.uid) {
      const profilePayload = {
        name: displayName || '',
        displayName: displayName || '',
        email: email || '',
        phone: phone || '',
        role: 'customer'
      };

      try {
        await createUserProfile(createdUser.uid, profilePayload);
        setUserProfile({ uid: createdUser.uid, ...profilePayload });
      } catch (dbErr) {
        console.warn('[AuthContext] Could not write user to Firestore:', dbErr);
        setUserProfile({ uid: createdUser.uid, ...profilePayload });
      }
    }

    return userCredential;
  };

  /**
   * Sign out current user
   */
  const logout = async () => {
    setUserProfile(null);
    return signOut(auth);
  };

  /**
   * Send password reset recovery email
   */
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  /**
   * Manually reload current user profile from Firestore
   */
  const refreshProfile = async () => {
    if (user) {
      return await loadUserProfile(user);
    }
    return null;
  };

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    login,
    signup,
    logout,
    resetPassword,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to consume AuthContext throughout the application
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
