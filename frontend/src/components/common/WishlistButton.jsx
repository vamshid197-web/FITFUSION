import React, { useState } from 'react';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable Wishlist Heart Toggle Button (Phase 13)
 * Provides instant optimistic toggle, accessible ARIA states,
 * and friendly unauthenticated handling.
 */
export default function WishlistButton({
  product,
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  showLabel = false,
  variant = 'icon' // 'icon' | 'badge' | 'button'
}) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [animating, setAnimating] = useState(false);
  const [showToast, setShowToast] = useState(false);

  if (!product || !product.id) return null;

  const saved = isWishlisted(product.id);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.uid) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
      return;
    }

    setAnimating(true);
    await toggleWishlist(product);
    setTimeout(() => setAnimating(false), 400);
  };

  // Sizing definitions
  const sizeClasses = {
    sm: 'w-7 h-7 p-1 text-xs',
    md: 'w-9 h-9 p-1.5 text-sm',
    lg: 'w-11 h-11 p-2 text-base'
  }[size] || 'w-9 h-9 p-1.5';

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }[size] || 'w-5 h-5';

  return (
    <div className="relative inline-flex items-center">
      {variant === 'button' ? (
        <button
          type="button"
          onClick={handleClick}
          aria-label={saved ? `Remove ${product.name || 'garment'} from wishlist` : `Save ${product.name || 'garment'} to wishlist`}
          aria-pressed={saved}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 select-none shadow-xs ${
            saved
              ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 hover:border-rose-300'
              : 'bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50'
          } ${animating ? 'scale-105' : 'scale-100'} ${className}`}
        >
          <svg
            className={`${iconSizes} transition-transform duration-200 ${animating ? 'scale-125' : ''}`}
            fill={saved ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={saved ? 2 : 1.8}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>{saved ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          aria-label={saved ? `Remove ${product.name || 'garment'} from wishlist` : `Save ${product.name || 'garment'} to wishlist`}
          aria-pressed={saved}
          title={saved ? 'Remove from Wishlist' : 'Save to Wishlist'}
          className={`rounded-full flex items-center justify-center transition-all duration-200 select-none ${sizeClasses} ${
            saved
              ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs hover:bg-rose-100 hover:scale-110'
              : 'bg-white/90 backdrop-blur-xs text-neutral-600 hover:text-rose-600 hover:bg-white border border-neutral-200/80 shadow-xs hover:scale-110'
          } ${animating ? 'scale-125' : 'scale-100'} ${className}`}
        >
          <svg
            className={`${iconSizes} transition-all duration-200 ${animating ? 'scale-125' : ''}`}
            fill={saved ? '#E11D48' : 'none'}
            stroke={saved ? '#E11D48' : 'currentColor'}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={saved ? 2 : 1.8}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          {showLabel && (
            <span className="ml-1 text-xs font-semibold">
              {saved ? 'Wishlisted' : 'Wishlist'}
            </span>
          )}
        </button>
      )}

      {/* Guest Authentication Prompt Flyout */}
      {showToast && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-2 w-64 p-3 bg-neutral-900 text-white rounded-xl shadow-2xl z-50 text-left border border-neutral-700 animate-fadeIn"
        >
          <div className="flex items-start gap-2">
            <span className="text-rose-400 text-base">♥</span>
            <div className="flex-1 space-y-1">
              <p className="text-xs font-medium leading-snug">
                Sign in to save pieces to your bespoke wishlist and access them anywhere.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-2.5 py-1 bg-white text-neutral-900 text-[11px] font-bold rounded-md hover:bg-neutral-100"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setShowToast(false)}
                  className="text-[11px] text-neutral-400 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
