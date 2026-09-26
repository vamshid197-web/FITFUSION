import React, { createContext, useContext, useState, useEffect } from 'react';
import { FREE_PERFUME_RULES, checkFreePerfumeEligibility, amountRemainingForFreePerfume } from '../data/promotions.js';
import { validateOfferForCart } from '../services/offerService.js';
import { getCashbackWallet } from '../services/cashbackService.js';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'fitfusion_cart';
const COUPON_STORAGE_KEY = 'fitfusion_coupon';
const BUDGET_STORAGE_KEY = 'fitfusion_customer_budget';
const FREE_PERFUME_STORAGE_KEY = 'fitfusion_free_perfume';

// Mock coupon definitions for college project demo
const VALID_COUPONS = {
  FIT10: { code: 'FIT10', type: 'percent', value: 10, label: '10% Off Tailoring' },
  WELCOME10: { code: 'WELCOME10', type: 'flat', value: 100, label: '₹100 Welcome Discount' },
  CUSTOM20: { code: 'CUSTOM20', type: 'percent', value: 20, label: '20% Bespoke Craftsmanship Discount' }
};


/**
 * Defensive sanitizer for cart items ensuring backward compatibility and safe rendering
 */
export function sanitizeCartItem(rawItem) {
  if (!rawItem || typeof rawItem !== 'object') {
    return null;
  }

  const id = rawItem.id || `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const productId = String(rawItem.productId || rawItem.id || '1');
  const productName = rawItem.productName || rawItem.name || 'Custom Garment';
  const category = rawItem.category || 'Shirts';
  const productImage = rawItem.productImage || rawItem.image || rawItem.thumbnail || null;
  const silhouetteColor = rawItem.silhouetteColor || 'from-stone-800 to-neutral-900';
  const accentColor = rawItem.accentColor || '#1E3A8A';

  const basePrice = Math.max(0, Number(rawItem.basePrice || rawItem.price || 0));
  const fabricSurcharge = Math.max(0, Number(rawItem.fabricSurcharge || 0));
  const hardwareSurcharge = Math.max(0, Number(rawItem.hardwareSurcharge || 0));
  const monogramSurcharge = Math.max(0, Number(rawItem.monogramSurcharge || 0));

  // Fabric normalization
  let selectedFabric = rawItem.selectedFabric;
  if (!selectedFabric && rawItem.fabric) selectedFabric = rawItem.fabric;
  if (typeof selectedFabric === 'string') {
    selectedFabric = { name: selectedFabric, composition: 'Certified Textile', priceAdjustment: fabricSurcharge };
  } else if (!selectedFabric || typeof selectedFabric !== 'object') {
    selectedFabric = { name: 'Standard Fabric', composition: '100% Cotton', priceAdjustment: 0 };
  } else {
    selectedFabric = {
      id: selectedFabric.id || 'fab-custom',
      name: selectedFabric.name || 'Standard Fabric',
      composition: selectedFabric.composition || '100% Textile',
      priceAdjustment: Math.max(0, Number(selectedFabric.priceAdjustment ?? fabricSurcharge ?? 0))
    };
  }

  // Color normalization
  let selectedColor = rawItem.selectedColor;
  if (!selectedColor && rawItem.color) selectedColor = rawItem.color;
  if (typeof selectedColor === 'string') {
    selectedColor = { name: selectedColor, hex: '#1F2937', value: '#1F2937' };
  } else if (!selectedColor || typeof selectedColor !== 'object') {
    selectedColor = { name: 'Default', hex: '#1F2937', value: '#1F2937' };
  } else {
    selectedColor = {
      id: selectedColor.id || 'col-custom',
      name: selectedColor.name || 'Default',
      hex: selectedColor.hex || selectedColor.value || '#1F2937',
      value: selectedColor.value || selectedColor.hex || '#1F2937'
    };
  }

  // Perfume normalization
  let selectedPerfume = rawItem.selectedPerfume;
  if (selectedPerfume === undefined && rawItem.perfume !== undefined) selectedPerfume = rawItem.perfume;
  if (selectedPerfume) {
    if (typeof selectedPerfume === 'string') {
      if (selectedPerfume.toLowerCase() === 'no perfume' || selectedPerfume.toLowerCase() === 'none') {
        selectedPerfume = null;
      } else {
        selectedPerfume = {
          id: 'perfume-custom',
          name: selectedPerfume,
          brand: 'Atelier Parfums',
          fragranceFamily: 'Fresh',
          description: '',
          price: 0,
          icon: '✨'
        };
      }
    } else if (typeof selectedPerfume === 'object') {
      if (selectedPerfume.id === 'no-perfume' || selectedPerfume.name === 'No Perfume' || selectedPerfume.price === 0 && selectedPerfume.fragranceFamily === 'Unscented') {
        selectedPerfume = null;
      } else {
        selectedPerfume = {
          id: selectedPerfume.id || 'perfume-custom',
          name: selectedPerfume.name || 'Atelier Fragrance',
          brand: selectedPerfume.brand || 'FitFusion Atelier',
          fragranceFamily: selectedPerfume.fragranceFamily || 'Fresh',
          description: selectedPerfume.description || '',
          price: Math.max(0, Number(selectedPerfume.price || 0)),
          icon: selectedPerfume.icon || '✨'
        };
      }
    } else {
      selectedPerfume = null;
    }
  } else {
    selectedPerfume = null;
  }

  const perfumePrice = selectedPerfume ? Math.max(0, Number(selectedPerfume.price || 0)) : 0;

  // Custom Measurements & Size
  const size = rawItem.size || 'M';
  const isCustomTailored = size === 'Custom Tailored' || rawItem.sizeMode === 'custom';

  let customMeasurements = null;
  if (isCustomTailored && (rawItem.customMeasurements || rawItem.measurements)) {
    const rawMetrics = rawItem.customMeasurements || rawItem.measurements;
    if (typeof rawMetrics === 'object' && rawMetrics !== null) {
      customMeasurements = {};
      Object.keys(rawMetrics).forEach(k => {
        const val = rawMetrics[k];
        if (val !== '' && val !== null && val !== undefined) {
          customMeasurements[k] = String(val);
        }
      });
      if (Object.keys(customMeasurements).length === 0) {
        customMeasurements = null;
      }
    }
  }

  const quantity = Math.max(1, parseInt(rawItem.quantity, 10) || 1);

  // Price calculations
  let calculatedItemPrice = Number(rawItem.totalItemPrice ?? rawItem.itemPrice ?? rawItem.price);
  if (isNaN(calculatedItemPrice) || calculatedItemPrice <= 0) {
    calculatedItemPrice = basePrice + (selectedFabric.priceAdjustment || 0) + hardwareSurcharge + monogramSurcharge + perfumePrice;
  }

  const designOptions = rawItem.designOptions || rawItem.selectedDesign || {
    collar: rawItem.collar || 'Classic',
    cuff: rawItem.cuff || 'Standard',
    buttons: rawItem.buttons || 'Standard Horn'
  };

  return {
    ...rawItem,
    id,
    productId,
    productName,
    category,
    productImage,
    silhouetteColor,
    accentColor,
    basePrice,
    fabricSurcharge: selectedFabric.priceAdjustment || fabricSurcharge,
    hardwareSurcharge,
    monogramSurcharge,
    selectedFabric,
    selectedColor,
    selectedPerfume,
    perfumePrice,
    size: isCustomTailored ? 'Custom Tailored' : size,
    customMeasurements,
    measurementUnit: rawItem.measurementUnit || 'in',
    fit: rawItem.fit || 'Regular',
    designOptions,
    selectedDesign: designOptions,
    collar: designOptions.collar || 'Classic',
    cuff: designOptions.cuff || 'Standard',
    buttons: designOptions.buttons || 'Standard Horn',
    monogram: typeof rawItem.monogram === 'string' ? rawItem.monogram : (rawItem.monogram?.text || ''),
    quantity,
    itemPrice: calculatedItemPrice,
    totalItemPrice: calculatedItemPrice,
    addedAt: rawItem.addedAt || new Date().toISOString()
  };
}

export function CartProvider({ children }) {
  // 1. Items in cart (sanitized on load)
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(sanitizeCartItem).filter(Boolean);
    } catch (err) {
      console.error('Failed to load cart from localStorage:', err);
      return [];
    }
  });

  // 2. Applied coupon
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error('Failed to load coupon from localStorage:', err);
      return null;
    }
  });

  // 3. Customer shopping budget (Phase 14)
  const [customerBudget, setCustomerBudgetState] = useState(() => {
    try {
      const saved = localStorage.getItem(BUDGET_STORAGE_KEY);
      return saved ? Number(saved) : null;
    } catch (err) {
      return null;
    }
  });

  // 4. Claimed free promotional perfume (Phase 14)
  const [freePerfume, setFreePerfumeState] = useState(() => {
    try {
      const saved = localStorage.getItem(FREE_PERFUME_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      return null;
    }
  });

  // 5. Applied Store Offer (Phase 16)
  const [appliedOffer, setAppliedOffer] = useState(() => {
    try {
      const saved = localStorage.getItem('fitfusion_applied_offer');
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      return null;
    }
  });

  // 6. Redeemed Cashback at Checkout (Phase 16)
  const [redeemedCashback, setRedeemedCashbackState] = useState(0);

  // 7. Live Customer Cashback Wallet Balance (Phase 16)
  const [cashbackWallet, setCashbackWallet] = useState({
    available: 0,
    pending: 0,
    totalEarned: 0,
    totalRedeemed: 0
  });

  // Function to refresh customer wallet
  const refreshCashbackWallet = async (userId) => {
    if (!userId) return;
    try {
      const wallet = await getCashbackWallet(userId);
      setCashbackWallet(wallet);
    } catch (err) {
      console.warn('[CartContext] Error refreshing wallet:', err);
    }
  };

  // Synchronize items
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err);
    }
  }, [items]);

  // Synchronize coupon
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

  // Synchronize budget
  const setCustomerBudget = (val) => {
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      setCustomerBudgetState(num);
      try {
        localStorage.setItem(BUDGET_STORAGE_KEY, String(num));
      } catch (err) {
        // ignore
      }
    } else {
      setCustomerBudgetState(null);
      try {
        localStorage.removeItem(BUDGET_STORAGE_KEY);
      } catch (err) {
        // ignore
      }
    }
  };

  const clearCustomerBudget = () => {
    setCustomerBudgetState(null);
    try {
      localStorage.removeItem(BUDGET_STORAGE_KEY);
    } catch (err) {
      // ignore
    }
  };

  // Add item to cart with defensive sanitization
  const addToCart = (newItem) => {
    const sanitized = sanitizeCartItem(newItem);
    if (!sanitized) return;
    setItems((prevItems) => {
      return [...prevItems, sanitized];
    });
  };

  // Remove item from cart
  const removeFromCart = (cartItemId) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== cartItemId));
  };

  // Update existing cart item customization & pricing defensively
  const updateCartItem = (cartItemId, updatedFields) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === cartItemId) {
          const merged = sanitizeCartItem({
            ...item,
            ...updatedFields,
            id: cartItemId,
            quantity: item.quantity
          });
          return merged || item;
        }
        return item;
      })
    );
  };

  // Replace an item in the cart with a similar lower-cost alternative (Phase 14)
  const replaceCartItem = (cartItemId, newProduct, compatibleCustomization = null) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === cartItemId) {
          const newBasePrice = Number(newProduct.basePrice || newProduct.price || 0);
          return {
            ...item,
            productId: String(newProduct.id),
            productName: newProduct.name,
            category: newProduct.category || item.category,
            silhouetteColor: newProduct.silhouetteColor || item.silhouetteColor,
            productImage: newProduct.images?.[0] || newProduct.thumbnail || null,
            basePrice: newBasePrice,
            itemPrice: newBasePrice,
            totalItemPrice: newBasePrice + (item.perfumePrice || 0),
            // Preserve or update customization
            ...(compatibleCustomization ? { designOptions: compatibleCustomization, selectedDesign: compatibleCustomization } : {})
          };
        }
        return item;
      })
    );
  };

  // Update item quantity
  const updateQuantity = (cartItemId, newQuantity) => {
    const validQty = Math.max(1, parseInt(newQuantity, 10) || 1);
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === cartItemId ? { ...item, quantity: validQty } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setFreePerfumeState(null);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(COUPON_STORAGE_KEY);
      localStorage.removeItem(FREE_PERFUME_STORAGE_KEY);
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

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Phase 16: Apply store offer
  const applyOffer = (offer, isFirstOrder = false) => {
    if (!offer) return { success: false, message: 'Invalid offer' };
    const validation = validateOfferForCart({
      offer,
      cartItems: items,
      subtotal,
      isFirstOrder
    });

    if (!validation.eligible) {
      return { success: false, message: validation.reason || 'Offer not applicable to this cart.' };
    }

    setAppliedOffer(offer);
    try {
      localStorage.setItem('fitfusion_applied_offer', JSON.stringify(offer));
    } catch (e) {}

    return {
      success: true,
      message: `Offer "${offer.name}" applied successfully!`
    };
  };

  const removeOffer = () => {
    setAppliedOffer(null);
    try {
      localStorage.removeItem('fitfusion_applied_offer');
    } catch (e) {}
  };

  // Phase 16: Set redeemed cashback amount
  const setRedeemedCashback = (amount) => {
    const num = Math.max(0, Math.round(Number(amount) || 0));
    setRedeemedCashbackState(num);
  };

  // Computed Subtotal
  const subtotal = items.reduce(
    (sum, item) => sum + (item.totalItemPrice || item.price || 0) * (item.quantity || 1),
    0
  );

  // Total count of garments
  const totalItemsCount = items.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  // Free Perfume Eligibility (Subtotal >= ₹3,999)
  const isEligibleForFreePerfume = checkFreePerfumeEligibility(subtotal);
  const remainingForFreePerfume = amountRemainingForFreePerfume(subtotal);

  // Synchronize and validate free perfume selection
  const claimFreePerfume = (perfume) => {
    if (!isEligibleForFreePerfume) {
      return {
        success: false,
        message: `Add ₹${remainingForFreePerfume.toLocaleString('en-IN')} more to unlock a free luxury perfume.`
      };
    }

    const promoItem = {
      id: perfume.id || 'promo-perfume',
      name: perfume.name,
      brand: perfume.brand,
      fragranceFamily: perfume.fragranceFamily,
      description: perfume.description,
      icon: perfume.icon || '🎁',
      normalPrice: perfume.normalPrice || 499,
      promotionalPrice: 0,
      isPromotionalFree: true,
      promoReason: `Cart subtotal ₹${subtotal.toLocaleString('en-IN')} qualifies for Free Atelier Fragrance`
    };

    setFreePerfumeState(promoItem);
    try {
      localStorage.setItem(FREE_PERFUME_STORAGE_KEY, JSON.stringify(promoItem));
    } catch (err) {
      // ignore
    }

    return { success: true, message: `Claimed complimentary "${perfume.name}"!` };
  };

  const removeFreePerfume = () => {
    setFreePerfumeState(null);
    try {
      localStorage.removeItem(FREE_PERFUME_STORAGE_KEY);
    } catch (err) {
      // ignore
    }
  };

  // If subtotal drops below eligibility threshold, free perfume discount is 0
  const activeFreePerfume = (isEligibleForFreePerfume && freePerfume) ? freePerfume : null;
  const freePerfumeDiscount = activeFreePerfume ? Number(activeFreePerfume.normalPrice || 499) : 0;

  // Phase 16: Calculated Store Offer Discount
  let offerDiscount = 0;
  if (appliedOffer && subtotal > 0) {
    const offerCheck = validateOfferForCart({
      offer: appliedOffer,
      cartItems: items,
      subtotal,
      isFirstOrder: false // validated at apply time
    });
    if (offerCheck.eligible) {
      offerDiscount = offerCheck.discountAmount;
    }
  }

  // Calculated Coupon Discount
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

  // Net payable before cashback redemption
  const payableBeforeCashback = Math.max(0, subtotal - offerDiscount - discount + delivery);

  // Validated cashback redemption (capped at payable amount and available balance)
  const validCashbackUsed = Math.min(redeemedCashback, payableBeforeCashback, Number(cashbackWallet.available || 0));

  // Final Estimated Total (never negative)
  const total = Math.max(0, payableBeforeCashback - validCashbackUsed);

  // Potential Cashback earned on this order (credited upon delivery)
  let potentialCashback = 0;
  if (subtotal >= 1999) {
    const cashbackPct = appliedOffer?.cashbackPercentage || 5;
    potentialCashback = Math.round((Math.max(0, subtotal - offerDiscount - discount) * cashbackPct) / 100);
  }

  // Budget calculations
  const isOverBudget = Boolean(customerBudget && customerBudget > 0 && total > customerBudget);
  const overBudgetAmount = isOverBudget ? Math.max(0, total - customerBudget) : 0;
  const underBudgetAmount = customerBudget && total <= customerBudget ? Math.max(0, customerBudget - total) : 0;

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateCartItem,
    replaceCartItem,
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
    demoCoupons: Object.values(VALID_COUPONS),

    // Phase 14 Smart Budget & Free Perfume
    customerBudget,
    setCustomerBudget,
    clearCustomerBudget,
    isOverBudget,
    overBudgetAmount,
    underBudgetAmount,

    freePerfume: activeFreePerfume,
    isEligibleForFreePerfume,
    remainingForFreePerfume,
    freePerfumeThreshold: FREE_PERFUME_RULES.THRESHOLD,
    freePerfumeDiscount,
    claimFreePerfume,
    removeFreePerfume,

    // Phase 16 Offers & Loyalty
    appliedOffer,
    applyOffer,
    removeOffer,
    offerDiscount,
    redeemedCashback: validCashbackUsed,
    setRedeemedCashback,
    cashbackWallet,
    refreshCashbackWallet,
    potentialCashback
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
