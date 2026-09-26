import React, { useState } from 'react';

/**
 * Clean SVG silhouettes for category fallbacks (No emojis, no broken icons)
 */
function CategorySilhouette({ category = 'Shirts', className = 'w-12 h-12 text-neutral-400' }) {
  const cat = (category || '').toLowerCase();

  if (cat.includes('t-shirt') || cat.includes('tee') || cat.includes('polo')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3L2 7l4 2v12h12V9l4-2-4-4-4 2a4 4 0 01-4 0L6 3z" />
      </svg>
    );
  }

  if (cat.includes('hoodie') || cat.includes('sweatshirt') || cat.includes('sweater')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3a4 4 0 008 0l4 5-3 2v11H7V10L4 8l4-5z" />
        <path d="M9 14h6" />
      </svg>
    );
  }

  if (cat.includes('jean') || cat.includes('pant') || cat.includes('trouser') || cat.includes('chino') || cat.includes('short')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 4h14l-1 17-5-1-1-9-1 9-5 1L5 4z" />
        <path d="M5 8h14" />
      </svg>
    );
  }

  if (cat.includes('blazer') || cat.includes('suit') || cat.includes('jacket') || cat.includes('coat')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l5 3 3 5 3-5 5-3v17H4V4z" />
        <path d="M12 12v9" />
        <path d="M9 7L4 4" />
        <path d="M15 7l5-4" />
      </svg>
    );
  }

  if (cat.includes('dress') || cat.includes('skirt') || cat.includes('kurta')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3h8l4 6-3 12H7L4 9l4-6z" />
        <path d="M10 3v4a2 2 0 004 0V3" />
      </svg>
    );
  }

  // Default: Shirt silhouette
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3L2 7l4 2v12h12V9l4-2-4-4-3 2a3 3 0 01-4 0L6 3z" />
      <path d="M12 7v14" />
      <circle cx="12" cy="10" r="0.7" fill="currentColor" />
      <circle cx="12" cy="14" r="0.7" fill="currentColor" />
      <circle cx="12" cy="18" r="0.7" fill="currentColor" />
    </svg>
  );
}

/**
 * Reusable ProductImage Component (Part 12)
 * Handles:
 * - Valid image
 * - Missing image
 * - Broken image (onError fallback)
 * - Loading state
 * - Optional color tint overlay for live preview (Part 6)
 */
export default function ProductImage({
  src,
  alt = 'Product image',
  className = '',
  containerClassName = '',
  fallbackCategory = 'Shirts',
  tintColor = null,
  aspectRatio = 'aspect-4/3',
  loading = 'lazy'
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const shouldShowFallback = hasError || !src || typeof src !== 'string' || src.trim() === '';

  // Calculate if color overlay should apply
  // Skip tinting if white or near-white or null
  const isWhiteOrNull = !tintColor || 
    tintColor.toLowerCase() === '#ffffff' || 
    tintColor.toLowerCase() === '#fff' ||
    tintColor.toLowerCase() === 'white' ||
    tintColor.toLowerCase() === '#f9fafb' ||
    tintColor.toLowerCase() === '#fffbeb';

  return (
    <div className={`relative overflow-hidden ${aspectRatio} bg-neutral-100 flex items-center justify-center ${containerClassName}`}>
      {shouldShowFallback ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-neutral-50 text-neutral-400 select-none">
          <CategorySilhouette category={fallbackCategory} className="w-12 h-12 text-neutral-400/80 mb-2 drop-shadow-xs" />
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            {fallbackCategory || 'FitFusion Apparel'}
          </span>
        </div>
      ) : (
        <>
          {/* Skeleton placeholder while loading */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
          )}

          {/* Actual Clothing Image */}
          <img
            src={src}
            alt={alt}
            loading={loading}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
          />

          {/* Color Tint Overlay for Garment Reflection (Part 6) */}
          {!isWhiteOrNull && isLoaded && (
            <div
              className="absolute inset-0 pointer-events-none transition-colors duration-500"
              style={{
                backgroundColor: tintColor,
                mixBlendMode: 'multiply',
                opacity: 0.58
              }}
              title={`Color: ${tintColor}`}
            />
          )}
        </>
      )}
    </div>
  );
}
