import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../services/firebase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Sign in existing user with email and password
   */
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  /**
   * Register a new user with email, password, and profile display name
   */
  const signup = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
      // Update local state copy with new display name
      setUser({ ...userCredential.user, displayName });
    }
    return userCredential;
  };

  /**
   * Sign out current user
   */
  const logout = () => {
    return signOut(auth);
  };

  /**
   * Send password reset recovery email
   */
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    resetPassword
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
