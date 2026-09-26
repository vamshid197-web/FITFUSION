import React from 'react';
import { Link } from 'react-router-dom';
import WishlistButton from './WishlistButton.jsx';
import StarRating from './StarRating.jsx';
import ProductImage from './ProductImage.jsx';
import { getProductImage } from '../../data/mockProducts.js';

/**
 * Standard FitFusion Product Card Component (Parts 3, 12, 13)
 * Displays actual clothing picture, clean details, and simple English.
 */
export default function ProductCard({ product, className = '' }) {
  if (!product) return null;

  const basePrice = Number(product.basePrice || product.price || 0);
  const compareAt = Number(product.compareAtPrice || 0);
  const discountPercent =
    compareAt > basePrice ? Math.round(((compareAt - basePrice) / compareAt) * 100) : 0;

  const isAvailable = product.available !== false && product.stockStatus !== 'Out of Stock';
  const imgUrl = product.image || product.images?.[0] || getProductImage(product);
  const mainFabric = product.availableFabrics?.[0]?.name || product.fabric || 'Cotton';

  return (
    <div
      className={`bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group ${className}`}
    >
      {/* Top Image Area */}
      <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
        <Link
          to={`/product/${product.id}`}
          className="block w-full h-full"
          title={`View ${product.name}`}
        >
          <ProductImage
            src={imgUrl}
            alt={product.name}
            fallbackCategory={product.category || 'Shirts'}
            aspectRatio="aspect-4/3"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Top Badges & Wishlist Overlay */}
        <div className="absolute top-2.5 inset-x-2.5 flex justify-between items-start pointer-events-none z-10">
          <div className="flex flex-col gap-1 items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/95 text-neutral-800 shadow-2xs backdrop-blur-xs">
              {product.category || 'Clothing'}
            </span>
            {product.badge && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-accent text-white shadow-2xs">
                {product.badge}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-600 text-white shadow-2xs">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <div className="pointer-events-auto">
            <WishlistButton
              product={product}
              variant="icon"
              size="sm"
              className="bg-white/90 hover:bg-white text-neutral-700 shadow-xs backdrop-blur-xs rounded-full"
            />
          </div>
        </div>

        {/* Price & Rating Floating Pill */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex justify-between items-end pointer-events-none z-10">
          <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow-xs flex items-baseline gap-1.5">
            <span className="text-[10px] text-neutral-500 font-medium">From</span>
            <span className="font-extrabold text-brand-dark text-xs sm:text-sm">
              ₹{basePrice.toLocaleString('en-IN')}
            </span>
            {compareAt > basePrice && (
              <span className="text-[10px] text-neutral-400 line-through">
                ₹{compareAt.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="bg-white/95 backdrop-blur-xs px-2 py-1 rounded-lg shadow-xs flex items-center gap-1 text-[11px]">
            <StarRating
              rating={product.rating || 4.8}
              count={product.reviewsCount || 0}
              size="sm"
              showValue
            />
          </div>
        </div>
      </div>

      {/* Card Body Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-bold text-sm sm:text-base text-brand-dark group-hover:text-brand-accent transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <div className="text-xs text-neutral-500 font-medium mt-0.5">
            {mainFabric} &bull; {product.gender ? `${product.gender}'s Collection` : 'All Seasons'}
          </div>
          <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
            {product.shortDescription || product.description}
          </p>
        </div>

        {/* Color Palette Swatches Preview */}
        {product.availableColors && product.availableColors.length > 0 && (
          <div className="flex items-center gap-1 pt-1">
            <span className="text-[10px] text-neutral-400 mr-1">Colors:</span>
            {product.availableColors.slice(0, 5).map((color, idx) => (
              <span
                key={idx}
                className="w-2.5 h-2.5 rounded-full border border-neutral-300 shadow-2xs inline-block shrink-0"
                style={{ backgroundColor: color.hex || '#1E3A8A' }}
                title={color.name}
              />
            ))}
            {product.availableColors.length > 5 && (
              <span className="text-[9px] text-neutral-400 font-semibold">
                +{product.availableColors.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Action CTAs */}
        <div className="pt-2 border-t border-neutral-100 flex items-center gap-2">
          {product.customizationEnabled !== false ? (
            <Link
              to={`/customize/${product.id}`}
              className="flex-1 text-center py-2 px-3 bg-brand-dark hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Customize &rarr;
            </Link>
          ) : (
            <Link
              to={`/product/${product.id}`}
              className="flex-1 text-center py-2 px-3 bg-brand-dark hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              View Item &rarr;
            </Link>
          )}

          <Link
            to={`/product/${product.id}`}
            className="p-2 border border-neutral-200 hover:border-brand-accent text-neutral-700 hover:text-brand-accent rounded-xl text-xs font-bold transition-colors"
            title="View Details"
            aria-label={`View details for ${product.name}`}
          >
            &#8599;
          </Link>
        </div>
      </div>
    </div>
  );
}
