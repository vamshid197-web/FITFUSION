import React, { useState } from 'react';

/**
 * Reusable StarRating Component (Phase 14)
 * Supports both display and interactive selection modes with ARIA accessibility.
 */
export default function StarRating({
  rating = 5,
  maxStars = 5,
  size = 'md', // 'sm' | 'md' | 'lg'
  interactive = false,
  onChange,
  showValue = false,
  count = null,
  className = ''
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  }[size] || 'w-4 h-4';

  const textSizes = {
    sm: 'text-[11px]',
    md: 'text-xs',
    lg: 'text-sm'
  }[size] || 'text-xs';

  const currentVal = interactive ? (hoverRating || rating) : rating;

  const handleKeyDown = (e, starValue) => {
    if (!interactive || !onChange) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(starValue);
    } else if (e.key === 'ArrowRight' && starValue < maxStars) {
      onChange(starValue + 1);
    } else if (e.key === 'ArrowLeft' && starValue > 1) {
      onChange(starValue - 1);
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${className}`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={interactive ? 'Rating selector' : `Rating: ${rating} out of ${maxStars} stars`}
    >
      <div className="flex items-center">
        {Array.from({ length: maxStars }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= currentVal;

          return interactive ? (
            <button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={rating === starValue}
              aria-label={`Rate ${starValue} out of ${maxStars} stars`}
              onClick={() => onChange && onChange(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(0)}
              onKeyDown={(e) => handleKeyDown(e, starValue)}
              className="p-0.5 text-neutral-300 hover:scale-115 focus:outline-hidden focus:ring-1 focus:ring-amber-400 rounded-sm transition-transform cursor-pointer"
            >
              <svg
                className={`${starSizes} transition-colors ${
                  isFilled ? 'text-amber-400 fill-amber-400' : 'text-neutral-300 fill-neutral-200'
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ) : (
            <span key={starValue} className="p-0.5">
              <svg
                className={`${starSizes} ${
                  isFilled ? 'text-amber-400 fill-amber-400' : 'text-neutral-200 fill-neutral-200'
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </span>
          );
        })}
      </div>

      {showValue && (
        <span className={`font-mono font-bold text-neutral-800 ${textSizes}`}>
          {Number(rating || 0).toFixed(1)}
        </span>
      )}

      {count !== null && (
        <span className={`text-neutral-500 font-medium ${textSizes}`}>
          ({count})
        </span>
      )}
    </div>
  );
}
