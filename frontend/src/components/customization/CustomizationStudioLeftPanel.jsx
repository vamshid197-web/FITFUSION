import React from 'react';
import { Link } from 'react-router-dom';
import ProductImage from '../common/ProductImage.jsx';
import { getProductImage } from '../../data/mockProducts.js';
import { getProduct3DModel } from '../../data/clothing3DRegistry.js';

export const CURATED_STUDIO_GARMENTS = [
  { id: '1', name: 'Classic Crew Neck T-Shirt', category: 'T-Shirts', label: 'T-Shirt', icon: '👕' },
  { id: '7', name: 'Classic French Terry Hoodie', category: 'Hoodies', label: 'Hoodie', icon: '🧥' },
  { id: '13', name: 'Custom Tailored Chino Trousers', category: 'Jeans & Pants', label: 'Trousers/Pants', icon: '👖' },
  { id: '16', name: 'Pure Silk Slip Evening Dress', category: 'Dresses', label: 'Dress', icon: '👗' },
  { id: '14', name: 'Classic Handloom Cotton Kurta', category: 'Traditional Wear', label: 'Ethnic Kurta', icon: '🥻' },
  { id: '10', name: 'Classic Trucker Denim Jacket', category: 'Jackets', label: 'Jacket/Blazer', icon: '🧥' },
  { id: 'shirt-1', name: 'Classic Cotton Poplin Shirt', category: 'Shirts', label: 'Formal Shirt', icon: '👔' },
  { id: 'unisex-breathable-running-sports-t-shirt', name: 'Breathable Running Sports T-Shirt', category: 'Sports & Activewear', label: 'Sportswear', icon: '🏃' },
  { id: 'unisex-retro-leather-court-sneakers', name: 'Retro Leather Court Sneakers', category: 'Footwear', label: 'Footwear (No 3D)', icon: '👟' }
];

/**
 * CustomizationStudioLeftPanel
 * Displays:
 * - Back to Products link
 * - Current product thumbnail, title, price, category, sizes, 3D model badge
 * - Curated Garment Type Switcher
 * - Studio section navigation (3D View, Color, Design, Fabric, Size & Fit)
 * - Similar products from the FITFUSION catalog
 */
export default function CustomizationStudioLeftPanel({
  product,
  similarProducts = [],
  onSelectSimilarProduct,
  activeStep,
  onSelectStep,
  className = ''
}) {
  const modelMeta = getProduct3DModel(product);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const navItems = [
    { id: 5, label: '3D View', icon: 'cube' },
    { id: 4, label: 'Color', icon: 'palette' },
    { id: 2, label: 'Design & Text', icon: 'brush' },
    { id: 4, label: 'Fabric', icon: 'fabric' },
    { id: 4, label: 'Size & Fit', icon: 'ruler' },
    { id: 6, label: 'Final Preview', icon: 'eye' }
  ];

  return (
    <aside className={`flex flex-col gap-5 text-white ${className}`}>
      {/* 1. Back to Products Link */}
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-blue-400 transition-colors group w-fit"
      >
        <span className="p-1 rounded-lg bg-neutral-900 border border-neutral-800 group-hover:border-blue-500/50 transition-colors">
          <svg className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </span>
        <span>Back to Products</span>
      </Link>

      {/* 2. Selected Real Product Card */}
      <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-xl backdrop-blur-md">
        <div className="flex gap-3.5 items-center">
          {/* Product Thumbnail */}
          <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 shrink-0">
            <ProductImage
              productId={product?.id}
              src={product?.image || getProductImage(product)}
              alt={product?.name || 'Garment'}
              fallbackCategory={product?.category || 'T-Shirts'}
              aspectRatio="aspect-square"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </div>

          {/* Product Meta */}
          <div className="flex-1 min-w-0">
            <span className="inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-blue-400 bg-blue-950/60 border border-blue-800/60 rounded-md mb-1">
              {product?.category || 'T-Shirts'}
            </span>
            <h3 className="font-bold text-sm text-neutral-100 truncate leading-snug">
              {product?.name || 'Classic Garment'}
            </h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-base font-extrabold text-blue-400">
                {formatPrice(product?.basePrice || product?.price || 599)}
              </span>
              {product?.compareAtPrice && (
                <span className="text-xs text-neutral-500 line-through">
                  {formatPrice(product?.compareAtPrice)}
                </span>
              )}
            </div>
            {/* Stock / Rating info */}
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-neutral-400">
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                ★ {product?.rating || 4.8}
              </span>
              <span>&bull;</span>
              <span className="text-emerald-400 font-medium">In Stock</span>
            </div>

            {/* 3D Asset Availability Indicator */}
            {modelMeta.has3DModel ? (
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="truncate">3D Model: {modelMeta.modelName}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-amber-400 font-medium">
                <span>⚠️</span>
                <span>3D Model Pending</span>
              </div>
            )}
          </div>
        </div>

        {/* Available Sizes list */}
        <div className="mt-3.5 pt-3 border-t border-neutral-800/80">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-neutral-400 font-medium">Supported Sizes</span>
            <span className="text-neutral-500 text-[10px]">Standard & Bespoke</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(product?.availableSizes || ['XS', 'S', 'M', 'L', 'XL', '2XL']).map((sz) => (
              <span
                key={sz}
                className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-neutral-800 border border-neutral-700/80 text-neutral-300"
              >
                {sz}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2b. Curated Garment Category Switcher (Instant Product Switching Across Categories) */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h4 className="text-[11px] font-bold tracking-wider uppercase text-neutral-400">
            Switch Garment Category
          </h4>
          <span className="text-[10px] text-blue-400 font-semibold">9 Outfits</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {CURATED_STUDIO_GARMENTS.map((garment) => {
            const isSelected = String(product?.id) === String(garment.id);
            return (
              <button
                key={garment.id}
                type="button"
                onClick={() => onSelectSimilarProduct(garment)}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-blue-600/25 border-blue-500 text-white shadow-md shadow-blue-600/30 font-bold scale-[1.02]'
                    : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
                title={garment.name}
              >
                <span className="text-base">{garment.icon}</span>
                <span className="text-[10px] leading-tight truncate w-full">
                  {garment.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Fast Studio Navigation */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-xl backdrop-blur-md">
        <h4 className="text-[11px] font-bold tracking-wider uppercase text-neutral-400 mb-2.5 px-1">
          Quick Studio Navigation
        </h4>
        <div className="space-y-1">
          {navItems.map((item, idx) => {
            const isActive = activeStep === item.id;
            return (
              <button
                key={`${item.label}-${idx}`}
                type="button"
                onClick={() => onSelectStep(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800/70 border border-transparent'
                }`}
              >
                <span>{item.label}</span>
                <span className="text-[10px] font-mono text-neutral-500">&rarr;</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Similar Products from FITFUSION Catalog */}
      {similarProducts.length > 0 && (
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-xl backdrop-blur-md">
          <h4 className="text-[11px] font-bold tracking-wider uppercase text-neutral-400 mb-3">
            Similar Catalog Products
          </h4>
          <div className="space-y-2.5">
            {similarProducts.slice(0, 4).map((sim) => (
              <button
                key={sim.id}
                type="button"
                onClick={() => onSelectSimilarProduct(sim)}
                className="w-full flex items-center gap-3 p-2 rounded-xl bg-neutral-950/60 border border-neutral-800/80 hover:border-blue-500/50 hover:bg-neutral-800/50 transition-all text-left group"
              >
                <div className="w-12 h-14 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
                  <ProductImage
                    productId={sim.id}
                    src={sim.image || getProductImage(sim)}
                    alt={sim.name}
                    fallbackCategory={sim.category || 'T-Shirts'}
                    aspectRatio="aspect-square"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-neutral-200 truncate group-hover:text-blue-400 transition-colors">
                    {sim.name}
                  </p>
                  <p className="text-[11px] font-semibold text-blue-400 mt-0.5">
                    {formatPrice(sim.basePrice || sim.price)}
                  </p>
                  <span className="text-[10px] text-neutral-500 truncate block">
                    {sim.category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
