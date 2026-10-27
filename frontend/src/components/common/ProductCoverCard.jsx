import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import WishlistButton from './WishlistButton.jsx';
import StarRating from './StarRating.jsx';
import ProductImage from './ProductImage.jsx';
import { getProductMappedImage, getProductGallery } from '../../data/productImageMap.js';
import { useCompare } from '../../context/CompareContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

/**
 * ProductCoverCard
 * Universal FITFUSION luxury editorial product cover component.
 * Features:
 * - Neutral, studio-lit editorial backdrop
 * - Authentic fashion photography with multi-angle view transition on hover
 * - High-contrast editorial typography and FITFUSION Atelier branding
 * - Dynamic Indian Rupee (INR) currency formatting and discount computation
 * - Interactive variant color swatches with live garment tinting
 * - Direct deep links to 3D Customization Studio and Instant Bag additions
 */
export default function ProductCoverCard({
  product,
  aspectRatio = 'aspect-[3/4]',
  className = '',
  showQuickActions = true,
  showCustomizationBadge = true
}) {
  if (!product) return null;

  const { isCompared, toggleCompare } = useCompare();
  const { addToCart } = useCart();
  const isItemCompared = isCompared(product.id);

  const [selectedColor, setSelectedColor] = useState(
    product.availableColors && product.availableColors.length > 0 ? product.availableColors[0] : null
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const basePrice = Number(product.basePrice || product.price || 0);
  const compareAt = Number(product.compareAtPrice || 0);
  const discountPercent =
    compareAt > basePrice ? Math.round(((compareAt - basePrice) / compareAt) * 100) : 0;

  const isAvailable = product.available !== false && product.stockStatus !== 'Out of Stock';

  // Multi-angle gallery discovery
  const gallery = getProductGallery(product);
  const primaryImage = product.image || product.images?.[0] || getProductMappedImage(product);
  const secondaryImage = gallery.length > 1 ? gallery[1] : primaryImage;

  // Image to display (switches to angle 2 on desktop hover if available)
  const activeImage = isHovered && secondaryImage !== primaryImage ? secondaryImage : primaryImage;

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
      productImage: primaryImage,
      image: primaryImage,
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
    <article
      className={`group relative bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── 1. PHOTOGRAPHY COVER CANVAS ────────────────────────────────────── */}
      <div className={`relative ${aspectRatio} overflow-hidden bg-neutral-100/90`}>
        <Link
          to={`/product/${product.id}`}
          className="block w-full h-full focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          title={`Explore ${product.name}`}
          aria-label={`View details for ${product.name}`}
        >
          <ProductImage
            src={activeImage}
            productId={product.id}
            alt={product.name}
            fallbackCategory={product.category || 'Apparel'}
            category={product.category}
            tintColor={selectedColor?.hex}
            aspectRatio={aspectRatio}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Top Floating Header Badges & Wishlist */}
        <div className="absolute top-2.5 inset-x-2.5 flex justify-between items-start pointer-events-none z-10">
          <div className="flex flex-col gap-1 items-start">
            <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md bg-neutral-900/90 text-white backdrop-blur-md shadow-xs">
              {product.category || 'Collection'}
            </span>
            {discountPercent > 0 && (
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-600 text-white shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
            {product.badge && discountPercent === 0 && (
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-neutral-950 shadow-xs">
                {product.badge}
              </span>
            )}
          </div>

          <div className="pointer-events-auto">
            <WishlistButton
              product={product}
              variant="icon"
              size="sm"
              className="bg-white/95 hover:bg-white text-neutral-800 shadow-md backdrop-blur-xs rounded-full p-2"
            />
          </div>
        </div>

        {/* Multi-Angle Indicator Pill */}
        {gallery.length > 1 && (
          <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 text-neutral-700 shadow-xs backdrop-blur-xs">
              {gallery.length} Angles
            </span>
          </div>
        )}

        {/* Floating Quick Action Overlay on Desktop Hover */}
        {showQuickActions && isAvailable && (
          <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-auto flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {showCustomizationBadge && product.customizationEnabled !== false && (
              <Link
                to={`/customize/${product.id}`}
                className="px-2.5 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-900 text-white text-[11px] font-bold shadow-lg backdrop-blur-xs transition-transform active:scale-95 flex items-center gap-1"
                title="Customize in 3D Studio"
              >
                <span>3D</span>
              </Link>
            )}

            <button
              type="button"
              onClick={handleQuickAddToCart}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-lg backdrop-blur-xs transition-all active:scale-95 ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
              }`}
              title="Add to Bag"
              aria-label={`Add ${product.name} to bag`}
            >
              {isAdded ? 'Added ✓' : '+ Bag'}
            </button>
          </div>
        )}
      </div>

      {/* ── 2. EDITORIAL PRODUCT INFORMATION ────────────────────────────────── */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Brand & Collection Attribution */}
          <div className="flex items-center justify-between text-[11px] font-medium text-neutral-500">
            <span className="uppercase tracking-wider font-bold text-neutral-600">
              FITFUSION ATELIER
            </span>
            {product.gender && (
              <span className="text-neutral-500">{product.gender}</span>
            )}
          </div>

          {/* Title */}
          <Link to={`/product/${product.id}`} className="block mt-1">
            <h3 className="font-bold text-sm text-neutral-900 group-hover:text-amber-600 transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Short Description or Fabric */}
          <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
            {product.availableFabrics?.[0]?.name || product.fabric || 'Pure Combed Cotton'} &bull; {product.shortDescription || 'Tailored design'}
          </p>
        </div>

        {/* Pricing, Reviews & Variant Color Palette */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            <span className="font-black text-neutral-950 text-sm sm:text-base">
              ₹{basePrice.toLocaleString('en-IN')}
            </span>
            {compareAt > basePrice && (
              <span className="text-xs text-neutral-400 line-through">
                ₹{compareAt.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Available Color Swatches */}
          {product.availableColors && product.availableColors.length > 0 && (
            <div className="flex items-center gap-1" title={`${product.availableColors.length} colors available`}>
              {product.availableColors.slice(0, 4).map((color, idx) => {
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
                    className={`w-3.5 h-3.5 rounded-full border shadow-2xs transition-transform ${
                      isSelected
                        ? 'ring-2 ring-neutral-900 ring-offset-1 scale-110 border-white'
                        : 'border-neutral-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex || '#111827' }}
                    aria-label={`Select ${color.name} color`}
                    title={color.name}
                  />
                );
              })}
              {product.availableColors.length > 4 && (
                <span className="text-[10px] font-bold text-neutral-600 ml-0.5">
                  +{product.availableColors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
