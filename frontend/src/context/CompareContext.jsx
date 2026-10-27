import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext(null);
const STORAGE_KEY = 'fitfusion_compared_products';
const MAX_COMPARE = 3;

export function CompareProvider({ children }) {
  const [comparedProducts, setComparedProducts] = useState(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(comparedProducts));
      }
    } catch (e) {
      console.warn('[CompareContext] Failed to persist compare list:', e);
    }
  }, [comparedProducts]);

  const addToCompare = (product) => {
    if (!product || !product.id) return { success: false };

    const prodId = String(product.id);
    const existingIndex = comparedProducts.findIndex(
      (p) => String(p.id) === prodId
    );

    if (existingIndex !== -1) {
      // Already in list, return success
      return { success: true, alreadyAdded: true };
    }

    if (comparedProducts.length >= MAX_COMPARE) {
      const msg = 'Compare up to 3 products at a time.';
      setAlertMessage(msg);
      setTimeout(() => setAlertMessage(''), 4000);
      return { success: false, message: msg };
    }

    setComparedProducts((prev) => [...prev, product]);
    return { success: true };
  };

  const removeFromCompare = (productId) => {
    const prodId = String(productId);
    setComparedProducts((prev) => prev.filter((p) => String(p.id) !== prodId));
  };

  const toggleCompare = (product) => {
    if (!product || !product.id) return;
    const prodId = String(product.id);
    const isPresent = comparedProducts.some((p) => String(p.id) === prodId);
    if (isPresent) {
      removeFromCompare(prodId);
      return { success: true, removed: true };
    } else {
      return addToCompare(product);
    }
  };

  const clearCompare = () => {
    setComparedProducts([]);
  };

  const isCompared = (productId) => {
    if (!productId) return false;
    return comparedProducts.some((p) => String(p.id) === String(productId));
  };

  return (
    <CompareContext.Provider
      value={{
        comparedProducts,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
        isCompared,
        isModalOpen,
        setIsModalOpen,
        alertMessage,
        setAlertMessage
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
