import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import WishlistButton from './WishlistButton.jsx';
import StarRating from './StarRating.jsx';
import ProductImage from './ProductImage.jsx';
import { getProductImage } from '../../data/mockProducts.js';
import { useCompare } from '../../context/CompareContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

/**
 * Standard FitFusion Product Card Component (Parts 3, 12, 13)
 * Displays actual clothing picture, clean details, color variant switching, and quick Add to Cart.
 */
export default function ProductCard({ product, className = '' }) {
  if (!product) return null;

  const { isCompared, toggleCompare } = useCompare();
  const { addToCart } = useCart();
  const isItemCompared = isCompared(product.id);

  const [selectedColor, setSelectedColor] = useState(
    product.availableColors && product.availableColors.length > 0 ? product.availableColors[0] : null
  );
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const basePrice = Number(product.basePrice || product.price || 0);
  const compareAt = Number(product.compareAtPrice || 0);
  const discountPercent =
    compareAt > basePrice ? Math.round(((compareAt - basePrice) / compareAt) * 100) : 0;

  const isAvailable = product.available !== false && product.stockStatus !== 'Out of Stock';

  // Resolve matching image for selected color variant
  let resolvedImg = getProductImage(product) || product.image || product.images?.[0];
  if (selectedColor && product.colorImages) {
    const colorKey = selectedColor.name;
    const candidate = product.colorImages[colorKey] || product.colorImages[colorKey.split(' ')[0]];
    if (candidate && !candidate.includes('/images/products/')) {
      resolvedImg = candidate;
    }
  }

  // Multi-angle hover transition (shows secondary angle on hover if available)
  const secondaryImg = product.images && product.images.length > 1 ? product.images[1] : null;
  const displayImg = isHovered && secondaryImg ? secondaryImg : resolvedImg;

  const mainFabric = product.availableFabrics?.[0]?.name || product.fabric || 'Cotton';

  const handleQuickAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const colorObj = selectedColor || { name: 'Standard', hex: '#111827' };
    const fabricObj = product.availableFabrics?.[0] || { name: 'Premium Cotton', composition: 'High Quality Fabric' };
    const defaultSize = product.availableSizes?.[0] || 'M';

    const cartItem = {
      id: `cart-${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      category: product.category || 'Apparel',
      productImage: resolvedImg,
      image: resolvedImg,
      silhouetteColor: product.silhouetteColor || 'from-stone-100 to-amber-50',
      accentColor: colorObj.hex || '#1F2937',
      basePrice: basePrice,
      selectedFabric: fabricObj,
      fabric: fabricObj,
      selectedColor: colorObj,
      color: colorObj,
      size: defaultSize,
      fit: 'Regular',
      itemPrice: basePrice,
      totalItemPrice: basePrice,
      quantity: 1,
      addedAt: new Date().toISOString()
    };

    addToCart(cartItem);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Image Area with Professional Fashion Portrait Aspect Ratio */}
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
        <Link
          to={`/product/${product.id}`}
          className="block w-full h-full"
          title={`View ${product.name}`}
        >
          <ProductImage
            src={displayImg}
            productId={product.id}
            alt={product.name}
            fallbackCategory={product.category || 'Shirts'}
            category={product.category}
            tintColor={selectedColor?.hex ? selectedColor.hex : null}
            aspectRatio="aspect-[3/4]"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Multi-Angle Badge */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/95 text-neutral-700 shadow-xs backdrop-blur-xs">
              {product.images.length} Views
            </span>
          </div>
        )}

        {/* Top Badges & Wishlist Overlay */}
        <div className="absolute top-2.5 inset-x-2.5 flex justify-between items-start pointer-events-none z-10">
          <div className="flex flex-col gap-1 items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/95 text-neutral-800 shadow-2xs backdrop-blur-xs">
              {product.subcategory || product.category || 'Clothing'}
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

        {/* Color Palette Swatches & Compare Row */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {product.availableColors && product.availableColors.length > 0 ? (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-neutral-400 mr-1">Colors:</span>
              {product.availableColors.slice(0, 5).map((color, idx) => {
                const isSelected = selectedColor?.name === color.name;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedColor(color);
                    }}
                    onMouseEnter={() => setSelectedColor(color)}
                    className={`w-3.5 h-3.5 rounded-full border shadow-2xs inline-block shrink-0 transition-transform ${
                      isSelected ? 'ring-2 ring-brand-dark ring-offset-1 scale-110 border-white' : 'border-neutral-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex || '#1E3A8A' }}
                    title={`Color: ${color.name}`}
                    aria-label={`Select ${color.name}`}
                  />
                );
              })}
              {product.availableColors.length > 5 && (
                <span className="text-[9px] text-neutral-400 font-semibold ml-0.5">
                  +{product.availableColors.length - 5}
                </span>
              )}
            </div>
          ) : (
            <div />
          )}

          {/* Compare toggle button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleCompare(product);
            }}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
              isItemCompared
                ? 'bg-brand-dark text-white border-brand-dark'
                : 'bg-neutral-50 text-neutral-600 border-neutral-300 hover:border-brand-dark hover:text-brand-dark'
            }`}
            title={isItemCompared ? 'Remove from compare' : 'Add to compare'}
          >
            <span>{isItemCompared ? '✓ Compared' : '+ Compare'}</span>
          </button>
        </div>

        {/* Action CTAs: Add to Cart, Customize, View Details */}
        <div className="pt-2 border-t border-neutral-100 flex items-center gap-1.5">
          {/* Quick Add to Cart button */}
          <button
            type="button"
            onClick={handleQuickAddToCart}
            disabled={!isAvailable}
            className={`flex-1 text-center py-2 px-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-200'
            }`}
            title="Add to Shopping Cart"
          >
            {isAdded ? '✓ Added' : '+ Add to Cart'}
          </button>

          {/* Customize / View Item button */}
          {product.customizationEnabled !== false ? (
            <Link
              to={`/customize/${product.id}`}
              className="flex-1 text-center py-2 px-2.5 bg-brand-dark hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Customize &rarr;
            </Link>
          ) : (
            <Link
              to={`/product/${product.id}`}
              className="flex-1 text-center py-2 px-2.5 bg-brand-dark hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              View Item &rarr;
            </Link>
          )}

          <Link
            to={`/product/${product.id}`}
            className="p-2 border border-neutral-200 hover:border-brand-accent text-neutral-700 hover:text-brand-accent rounded-xl text-xs font-bold transition-colors shrink-0"
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

export { default as ProductCoverCard } from './ProductCoverCard.jsx';

