import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'fitfusion_cart';
const COUPON_STORAGE_KEY = 'fitfusion_coupon';

// Mock coupon definitions for college project demo
const VALID_COUPONS = {
  FIT10: { code: 'FIT10', type: 'percent', value: 10, label: '10% Off Tailoring' },
  WELCOME10: { code: 'WELCOME10', type: 'flat', value: 100, label: '₹100 Welcome Discount' },
  CUSTOM20: { code: 'CUSTOM20', type: 'percent', value: 20, label: '20% Bespoke Craftsmanship Discount' }
};

export function CartProvider({ children }) {
  // Initialize items from localStorage safely
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Failed to load cart from localStorage:', err);
      return [];
    }
  });

  // Initialize coupon from localStorage safely
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error('Failed to load coupon from localStorage:', err);
      return null;
    }
  });

  // Synchronize cart changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err);
    }
  }, [items]);

  // Synchronize coupon changes to localStorage
  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (err) {
      console.error('Failed to save coupon to localStorage:', err);
    }
  }, [appliedCoupon]);

  // Add item to cart
  const addToCart = (newItem) => {
    setItems((prevItems) => {
      const cartItemId = newItem.id || `cart-${newItem.productId || 'item'}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const itemWithId = {
        ...newItem,
        id: cartItemId,
        quantity: newItem.quantity && newItem.quantity > 0 ? newItem.quantity : 1,
        addedAt: newItem.addedAt || new Date().toISOString()
      };
      return [...prevItems, itemWithId];
    });
  };

  // Remove item from cart
  const removeFromCart = (cartItemId) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== cartItemId));
  };

  // Update item quantity (minimum 1)
  const updateQuantity = (cartItemId, newQuantity) => {
    const validQty = Math.max(1, parseInt(newQuantity, 10) || 1);
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === cartItemId ? { ...item, quantity: validQty } : item
      )
    );
  };

  // Clear all items and reset coupon
  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear cart storage:', err);
    }
  };

  // Apply promo/coupon code
  const applyCoupon = (rawCode) => {
    if (!rawCode || !rawCode.trim()) {
      return { success: false, message: 'Please enter a coupon code.' };
    }
    const normalized = rawCode.trim().toUpperCase();

    if (appliedCoupon && appliedCoupon.code === normalized) {
      return { success: false, message: `Coupon "${normalized}" is already applied.` };
    }

    const matched = VALID_COUPONS[normalized];
    if (matched) {
      setAppliedCoupon(matched);
      return { success: true, message: `Coupon "${matched.code}" applied! (${matched.label})` };
    }

    return {
      success: false,
      message: 'Invalid coupon code. Try demo coupons: FIT10, WELCOME10, or CUSTOM20.'
    };
  };

  // Remove applied coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Computed Subtotal
  const subtotal = items.reduce(
    (sum, item) => sum + (item.totalItemPrice || item.price || 0) * (item.quantity || 1),
    0
  );

  // Total count of individual garment units
  const totalItemsCount = items.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  // Calculated Discount
  let discount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.type === 'percent') {
      discount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else if (appliedCoupon.type === 'flat') {
      discount = Math.min(subtotal, appliedCoupon.value);
    }
  }

  // Delivery calculation: Standard ₹99 delivery, complimentary above ₹1,500
  const delivery = items.length === 0 ? 0 : subtotal >= 1500 ? 0 : 99;

  // Final Estimated Total
  const total = Math.max(0, subtotal - discount + delivery);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    totalItemsCount,
    delivery,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discount,
    total,
    demoCoupons: Object.values(VALID_COUPONS)
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
