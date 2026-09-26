import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import {
  getUserWishlist,
  addProductToWishlist,
  removeProductFromWishlist,
  isProductInWishlist
} from '../services/wishlistService.js';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authNotice, setAuthNotice] = useState(null); // String message for guests

  // Load wishlist whenever active user changes
  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const items = await getUserWishlist(user?.uid || null);
      setWishlist(items);
    } catch (err) {
      console.warn('[WishlistContext] Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Check if a specific product ID is wishlisted
  const isWishlisted = useCallback(
    (productId) => {
      if (!productId) return false;
      const idStr = String(productId);
      return wishlist.some((item) => String(item.productId || item.id) === idStr);
    },
    [wishlist]
  );

  // Add a product to wishlist
  const addToWishlist = useCallback(
    async (product) => {
      if (!product || !product.id) return false;

      // Friendly prompt for guest users
      if (!user?.uid) {
        setAuthNotice('Please sign in to save pieces to your bespoke wishlist and access them anytime.');
        return false;
      }

      const prodId = String(product.id);
      // Optimistic update
      const nowIso = new Date().toISOString();
      const optimisticItem = {
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
        userId: user.uid
      };

      setWishlist((prev) => {
        const filtered = prev.filter((item) => String(item.productId || item.id) !== prodId);
        return [optimisticItem, ...filtered];
      });

      try {
        await addProductToWishlist(user.uid, product);
        return true;
      } catch (err) {
        console.error('[WishlistContext] Failed to persist wishlist add:', err);
        // Rollback on failure
        loadWishlist();
        return false;
      }
    },
    [user?.uid, loadWishlist]
  );

  // Remove a product from wishlist
  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!productId) return false;
      const prodId = String(productId);

      // Optimistic update
      setWishlist((prev) => prev.filter((item) => String(item.productId || item.id) !== prodId));

      try {
        await removeProductFromWishlist(user?.uid || null, prodId);
        return true;
      } catch (err) {
        console.error('[WishlistContext] Failed to persist wishlist removal:', err);
        loadWishlist();
        return false;
      }
    },
    [user?.uid, loadWishlist]
  );

  // Toggle wishlist state for a product
  const toggleWishlist = useCallback(
    async (product) => {
      if (!product || !product.id) return false;

      if (!user?.uid) {
        setAuthNotice('Please sign in to save pieces to your bespoke wishlist and access them anytime.');
        return false;
      }

      const prodId = String(product.id);
      const currentlySaved = isWishlisted(prodId);

      if (currentlySaved) {
        await removeFromWishlist(prodId);
        return false; // Now not saved
      } else {
        await addToWishlist(product);
        return true; // Now saved
      }
    },
    [user?.uid, isWishlisted, removeFromWishlist, addToWishlist]
  );

  const dismissAuthNotice = useCallback(() => {
    setAuthNotice(null);
  }, []);

  const value = {
    wishlist,
    wishlistCount: wishlist.length,
    loading,
    isWishlisted,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    authNotice,
    setAuthNotice,
    dismissAuthNotice,
    refreshWishlist: loadWishlist
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
