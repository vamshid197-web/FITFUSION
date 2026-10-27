import React from 'react';
import { useCompare } from '../../context/CompareContext.jsx';
import ProductImage from './ProductImage.jsx';
import { getProductImage } from '../../data/mockProducts.js';

export default function ComparisonBottomBar() {
  const {
    comparedProducts,
    removeFromCompare,
    clearCompare,
    setIsModalOpen,
    alertMessage
  } = useCompare();

  if (comparedProducts.length === 0 && !alertMessage) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 inset-x-3 sm:inset-x-auto sm:right-6 sm:max-w-md z-40 animate-slideUp">
      {/* Alert toast for limit message */}
      {alertMessage && (
        <div className="mb-2 p-3 bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-between">
          <span>⚠️ {alertMessage}</span>
        </div>
      )}

      {comparedProducts.length > 0 && (
        <div className="bg-neutral-900/95 backdrop-blur-md text-white rounded-2xl p-3 sm:p-4 shadow-2xl border border-neutral-700 flex items-center justify-between gap-3">
          {/* Thumbnails of compared products */}
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {comparedProducts.map((p) => {
              const imgUrl = p.image || p.images?.[0] || p.thumbnail || getProductImage(p);
              return (
                <div
                  key={p.id}
                  className="relative group shrink-0 w-11 h-11 rounded-lg overflow-hidden border border-neutral-600 bg-neutral-800"
                  title={p.name}
                >
                  <ProductImage
                    productId={p.id}
                    src={imgUrl}
                    alt={p.name}
                    category={p.category}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFromCompare(p.id)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                    title={`Remove ${p.name}`}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          {/* Action Button & Clear */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="py-2 px-3 sm:px-4 bg-brand-accent hover:bg-brand-accentHover text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>⚖️</span>
              <span>Compare {comparedProducts.length} {comparedProducts.length === 1 ? 'product' : 'products'}</span>
            </button>

            <button
              type="button"
              onClick={clearCompare}
              className="p-2 text-neutral-400 hover:text-white text-xs transition"
              title="Clear all"
              aria-label="Clear all compared items"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
