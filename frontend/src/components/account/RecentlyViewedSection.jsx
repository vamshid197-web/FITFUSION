import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecentlyViewed, clearRecentlyViewed } from '../../services/recentlyViewedService.js';
import WishlistButton from '../common/WishlistButton.jsx';

export default function RecentlyViewedSection({ currentProductId = null, showClear = true }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const list = getRecentlyViewed();
    // Exclude current product if on product details page
    const filtered = currentProductId
      ? list.filter((p) => String(p.id || p.productId) !== String(currentProductId))
      : list;
    setItems(filtered);
  }, [currentProductId]);

  const handleClear = () => {
    clearRecentlyViewed();
    setItems([]);
  };

  // If there are no items, gracefully return null (do not show a large empty section)
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
        <div>
          <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
            <span>👁️</span> Recently Viewed Pieces
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Bespoke silhouettes and foundations you inspected during your session.
          </p>
        </div>

        {showClear && items.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] font-semibold text-neutral-400 hover:text-rose-600 transition-colors"
          >
            Clear History
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((prod) => {
          const prodId = prod.id || prod.productId;
          const price = Number(prod.price || 0);

          return (
            <div
              key={prodId}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative"
            >
              <div
                className={`aspect-[4/3] bg-gradient-to-br ${
                  prod.silhouetteColor || 'from-stone-100 to-amber-50'
                } p-2 flex flex-col justify-between relative overflow-hidden`}
              >
                <div className="flex justify-between items-start z-10">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/95 text-neutral-700 shadow-2xs">
                    {prod.category || 'Apparel'}
                  </span>
                  <WishlistButton product={prod} size="sm" />
                </div>

                <div className="my-auto text-center z-10">
                  <Link to={`/product/${prodId}`} className="block group-hover:scale-105 transition-transform duration-200">
                    <div className="w-12 h-16 mx-auto rounded-lg bg-white/95 border border-neutral-200 shadow-xs flex flex-col items-center justify-center p-1.5 space-y-1">
                      <svg className="w-5 h-5 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 3v2m6-2v2M9 5H7a2 2 0 00-2 2v2l2 1v9a2 2 0 002 2h6a2 2 0 002-2v-9l2-1V7a2 2 0 00-2-2h-2m-6 0a2 2 0 002 2h2a2 2 0 002-2m-6 0h6"
                        />
                      </svg>
                      <span className="text-[7px] font-bold text-neutral-400">FITFUSION</span>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="p-3 space-y-1.5 flex flex-col justify-between flex-1">
                <div>
                  <Link to={`/product/${prodId}`}>
                    <h4 className="text-xs font-bold text-brand-dark hover:text-brand-accent line-clamp-1">
                      {prod.name}
                    </h4>
                  </Link>
                  <p className="text-xs font-semibold text-neutral-900 font-mono mt-0.5">
                    ₹{price.toLocaleString('en-IN')}
                  </p>
                </div>

                <Link
                  to={`/product/${prodId}`}
                  className="block text-center py-1.5 px-2 bg-neutral-100 hover:bg-brand-dark hover:text-white rounded-lg text-[10px] font-bold text-neutral-800 transition-colors"
                >
                  View Garment &rarr;
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
