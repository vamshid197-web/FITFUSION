import React from 'react';
import ProductImage from '../common/ProductImage.jsx';
import { MOCK_PRODUCTS, getProductImage } from '../../data/mockProducts.js';
import { MASTER_COLORS } from '../../data/customizationOptions.js';

export default function SavedDesignCard({ design, onEdit, onAddToCart, onDelete, isDeleting = false }) {
  if (!design) return null;

  const cust = design.customization || {};
  const price = Number(design.totalPrice || design.price || 0);

  // Find image from design or product catalog
  const catalogMatch = MOCK_PRODUCTS.find((p) => String(p.id) === String(design.productId));
  const productImage =
    design.productImage ||
    cust.productImage ||
    catalogMatch?.image ||
    catalogMatch?.images?.[0] ||
    (catalogMatch ? getProductImage(catalogMatch) : null);

  const fabricName = design.fabric || cust.fabric?.name || (typeof cust.fabric === 'string' ? cust.fabric : 'Cotton');
  const colorName = design.color || cust.color?.name || (typeof cust.color === 'string' ? cust.color : 'Classic');
  const sizeName = design.size || cust.size || 'M';
  const fitName = design.fit || cust.fit || 'Regular';

  let resolvedColorHex = design.colorHex || cust.color?.hex || cust.color?.value || null;
  if (!resolvedColorHex && colorName) {
    if (colorName.startsWith('#')) {
      resolvedColorHex = colorName;
    } else {
      const match = MASTER_COLORS.find(c => c.name.toLowerCase() === colorName.toLowerCase());
      if (match) resolvedColorHex = match.hex;
    }
  }

  // Format short summary
  const summaryParts = [
    fabricName,
    colorName,
    `Size: ${sizeName}`,
    `${fitName} Fit`
  ];
  if (cust.measurements || design.customMeasurements) {
    summaryParts.push('Custom Sizing');
  }
  if (design.printedGraphics?.length > 0 || cust.designLayers?.length > 0) {
    summaryParts.push('Custom Graphics');
  }

  const formatPrice = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      {/* Product Image & Top Info */}
      <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden">
        <ProductImage
          productId={design.productId || design.id}
          src={productImage}
          alt={design.productName}
          category={cust.category || 'Clothing'}
          tintColor={resolvedColorHex}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/95 text-neutral-800 shadow-2xs">
            {cust.category || 'Custom Wear'}
          </span>
        </div>
        <div className="absolute bottom-2.5 left-2.5 text-xs font-bold text-brand-dark bg-white/95 px-2 py-0.5 rounded shadow-2xs">
          {formatPrice(price)}
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <h3 className="font-bold text-sm sm:text-base text-brand-dark line-clamp-1">
            {design.productName}
          </h3>
          <p className="text-xs text-neutral-500 font-medium line-clamp-2 leading-relaxed">
            {summaryParts.join(' • ')}
          </p>
        </div>

        {/* Buttons Row: Edit Design, Add to Bag, Delete */}
        <div className="pt-3 border-t border-neutral-100 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onEdit(design)}
              className="py-1.5 px-3 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold text-center transition cursor-pointer"
            >
              Edit Design
            </button>

            <button
              type="button"
              onClick={() => onAddToCart(design)}
              className="py-1.5 px-3 rounded-lg bg-brand-dark hover:bg-black text-white text-xs font-bold text-center transition shadow-xs cursor-pointer"
            >
              Add to Bag
            </button>
          </div>

          <button
            type="button"
            onClick={() => onDelete(design.id)}
            disabled={isDeleting}
            className="w-full text-center py-1 text-xs text-neutral-400 hover:text-rose-600 transition disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
