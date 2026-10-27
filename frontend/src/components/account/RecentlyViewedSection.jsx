import React, { useState, useEffect } from 'react';
import { getRecentlyViewed, clearRecentlyViewed } from '../../services/recentlyViewedService.js';
import { MOCK_PRODUCTS } from '../../data/mockProducts.js';
import ProductCard from '../common/ProductCard.jsx';

export default function RecentlyViewedSection({ currentProductId = null, showClear = true, title = 'Recently Viewed' }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const list = getRecentlyViewed();
    // Exclude current product if on product details page
    const filtered = currentProductId
      ? list.filter((p) => String(p.id || p.productId) !== String(currentProductId))
      : list;

    // Enrich items by matching with MOCK_PRODUCTS catalog for complete attributes
    const enriched = filtered.map((item) => {
      const match = MOCK_PRODUCTS.find((p) => String(p.id) === String(item.id || item.productId));
      return match || item;
    });

    setItems(enriched);
  }, [currentProductId]);

  const handleClear = () => {
    clearRecentlyViewed();
    setItems([]);
  };

  // If there are no items, gracefully return null
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
        <div>
          <h3 className="text-xl font-bold text-brand-dark flex items-center gap-2">
            <span>👁️</span> {title}
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Products you recently browsed in your session (up to 10 items).
          </p>
        </div>

        {showClear && items.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            Clear History
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((prod) => (
          <ProductCard key={prod.id || prod.productId} product={prod} />
        ))}
      </div>
    </div>
  );
}
