import React from 'react';
import ProductImage from '../common/ProductImage.jsx';
import { getProductImage } from '../../data/mockProducts.js';

/**
 * Reusable CustomizationSummary Component (Parts 5, 6, 9)
 * Displays a clean, prominent clothing preview with live color reflection,
 * tailoring specifications, and clear pricing in simple English.
 */
export default function CustomizationSummary({
  product,
  customization = {},
  price,
  compact = false,
  showPricing = true,
  onEdit = null,
  onAddToCart = null
}) {
  const {
    fabric,
    color,
    design = {},
    buttons,
    fit,
    size,
    measurements,
    customMeasurements,
    measurementUnit = 'in',
    monogram,
    perfume
  } = customization || {};

  const activeMeasurements = customMeasurements || measurements || {};

  // Resolve best product image URL
  const baseImg = customization?.productImage || product?.image || getProductImage(product);
  const colorHex = color?.hex || color?.value || null;

  // Format currency
  const formatPrice = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  // ── Compact Mode (Sticky Sidebar) ──────────────────────────────────────────
  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-4 text-xs text-neutral-700 space-y-3 shadow-xs">
        <div className="flex gap-3 items-center">
          {/* Garment Image with live color tint */}
          <div className="w-16 h-20 rounded-lg overflow-hidden border border-neutral-200 shrink-0 bg-neutral-100">
            <ProductImage
              src={baseImg}
              alt={product?.name || 'Custom Garment'}
              fallbackCategory={product?.category || 'Shirts'}
              tintColor={colorHex}
              aspectRatio="aspect-square"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-sm text-brand-dark truncate">
              {product?.name || 'Custom Garment'}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              {colorHex && (
                <span
                  className="w-2.5 h-2.5 rounded-full border border-neutral-300 inline-block shrink-0"
                  style={{ backgroundColor: colorHex }}
                />
              )}
              <span className="text-neutral-600 truncate">{color?.name || 'Default Color'}</span>
            </div>
            <div className="text-neutral-500 mt-0.5 truncate">
              {fabric?.name || 'Cotton'} &bull; {size || 'M'} ({fit || 'Regular'})
            </div>
            {showPricing && price && (
              <div className="font-black text-brand-dark text-sm mt-1">
                {formatPrice(price)}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-2 border-t border-neutral-100 text-[11px]">
          <div><span className="text-neutral-400">Fabric:</span> <span className="font-medium text-neutral-800">{fabric?.name || 'Cotton'}</span></div>
          <div><span className="text-neutral-400">Fit:</span> <span className="font-medium text-neutral-800">{fit || 'Regular'}</span></div>
          <div><span className="text-neutral-400">Size:</span> <span className="font-medium text-neutral-800">{size || 'M'}</span></div>
          {design?.collar && <div><span className="text-neutral-400">Style:</span> <span className="font-medium text-neutral-800">{design.collar}</span></div>}
          {design?.cuff && <div><span className="text-neutral-400">Cuff/Sleeve:</span> <span className="font-medium text-neutral-800">{design.cuff}</span></div>}
          {buttons?.name && <div><span className="text-neutral-400">Buttons:</span> <span className="font-medium text-neutral-800">{buttons.name}</span></div>}
          {perfume?.name && (
            <div className="col-span-2 text-brand-accent font-medium truncate">
              <span>✨ Fragrance:</span> {perfume.name}
            </div>
          )}
        </div>

        {onEdit && (
          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={() => onEdit(1)}
              className="text-brand-accent hover:underline text-[11px] font-semibold transition"
            >
              Modify Options &rarr;
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Full Preview Mode (Part 5: Main Preview Screen) ─────────────────────────
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-md">
      {/* Header */}
      <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-accent">
            Customization Summary
          </span>
          <h2 className="text-xl font-extrabold text-brand-dark">Your Preview</h2>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(1)}
            className="px-3.5 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition shadow-2xs"
          >
            Edit Customization
          </button>
        )}
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Main Product Image Hero with live color tinting */}
        <div className="max-w-md mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-neutral-200 shadow-md bg-neutral-100 group">
            <ProductImage
              src={baseImg}
              alt={product?.name || 'Garment preview'}
              fallbackCategory={product?.category || 'Shirts'}
              tintColor={colorHex}
              aspectRatio="aspect-[4/3] sm:aspect-square"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Color name badge */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-xs border border-neutral-200/80 flex items-center gap-2">
              {colorHex && (
                <span
                  className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-2xs shrink-0"
                  style={{ backgroundColor: colorHex }}
                />
              )}
              <span className="text-xs font-bold text-neutral-800">{color?.name || 'Selected Color'}</span>
            </div>

            <div className="absolute top-3 right-3 bg-brand-dark/85 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs">
              {product?.category || 'Apparel'}
            </div>
          </div>
          <p className="text-center text-xs text-neutral-500 mt-2">
            Selected garment shown in <strong className="text-neutral-800">{color?.name || 'chosen color'}</strong>
          </p>
        </div>

        {/* Garment Details & Customization Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Fabric & Color */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="font-bold text-xs uppercase tracking-wider text-neutral-500">Fabric & Color</span>
              {onEdit && (
                <button type="button" onClick={() => onEdit(1)} className="text-xs text-brand-accent hover:underline font-semibold">
                  Change
                </button>
              )}
            </div>
            <div className="flex justify-between items-center text-sm pt-1">
              <span className="text-neutral-500">Fabric:</span>
              <span className="font-bold text-neutral-900">{fabric?.name || 'Cotton'}</span>
            </div>
            {fabric?.composition && (
              <p className="text-xs text-neutral-500">{fabric.composition}</p>
            )}
            <div className="flex justify-between items-center text-sm pt-1">
              <span className="text-neutral-500">Color:</span>
              <div className="flex items-center gap-1.5">
                {colorHex && (
                  <span
                    className="w-3 h-3 rounded-full border border-neutral-300"
                    style={{ backgroundColor: colorHex }}
                  />
                )}
                <span className="font-bold text-neutral-900">{color?.name || 'Classic'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Size & Fit */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="font-bold text-xs uppercase tracking-wider text-neutral-500">Size & Fit</span>
              {onEdit && (
                <button type="button" onClick={() => onEdit(measurements && Object.keys(measurements).length > 0 ? 5 : 4)} className="text-xs text-brand-accent hover:underline font-semibold">
                  Change
                </button>
              )}
            </div>
            <div className="flex justify-between items-center text-sm pt-1">
              <span className="text-neutral-500">Fit Type:</span>
              <span className="font-bold text-neutral-900">{fit || 'Regular Fit'}</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-1">
              <span className="text-neutral-500">Size:</span>
              <span className="font-bold text-neutral-900">
                {size === 'Custom Tailored' || size === 'Custom Measurement' ? 'Custom Measurement' : (size || 'M')}
              </span>
            </div>
            {(size === 'Custom Tailored' || size === 'Custom Measurement' || Object.keys(activeMeasurements).length > 0) && Object.keys(activeMeasurements).some(k => activeMeasurements[k]) && (
              <div className="pt-2 border-t border-neutral-200 text-xs">
                <span className="text-neutral-500 block mb-1">Custom Measurements ({measurementUnit}):</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                  {Object.entries(activeMeasurements).map(([k, v]) => (
                    v ? (
                      <div key={k} className="bg-white px-2 py-1 rounded border border-neutral-200 flex justify-between">
                        <span className="capitalize text-neutral-500">{k}:</span>
                        <span className="font-bold text-neutral-800">{v} {measurementUnit}</span>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Design & Styling */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="font-bold text-xs uppercase tracking-wider text-neutral-500">Garment Design</span>
              {onEdit && (
                <button type="button" onClick={() => onEdit(3)} className="text-xs text-brand-accent hover:underline font-semibold">
                  Change
                </button>
              )}
            </div>
            <div className="space-y-1.5 text-xs pt-1">
              {design?.collar && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Collar / Neckline:</span>
                  <span className="font-bold text-neutral-900">{design.collar}</span>
                </div>
              )}
              {design?.cuff && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Cuff / Sleeve:</span>
                  <span className="font-bold text-neutral-900">{design.cuff}</span>
                </div>
              )}
              {buttons?.name && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Buttons:</span>
                  <span className="font-bold text-neutral-900">{buttons.name}</span>
                </div>
              )}
              {design?.hoodStyle && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Hood:</span>
                  <span className="font-bold text-neutral-900">{design.hoodStyle}</span>
                </div>
              )}
              {design?.pocketStyle && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Pocket:</span>
                  <span className="font-bold text-neutral-900">{design.pocketStyle}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Extras & Perfume */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="font-bold text-xs uppercase tracking-wider text-neutral-500">Extras & Perfume</span>
              {onEdit && (
                <button type="button" onClick={() => onEdit(7)} className="text-xs text-brand-accent hover:underline font-semibold">
                  Change
                </button>
              )}
            </div>
            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Monogram:</span>
                {monogram?.enabled && monogram?.text ? (
                  <span className="font-bold text-brand-accent">
                    "{monogram.text}" ({monogram.position || 'Chest'})
                  </span>
                ) : (
                  <span className="text-neutral-400">None</span>
                )}
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-neutral-200">
                <span className="text-neutral-500">Perfume Pairing:</span>
                {perfume?.name && perfume.id !== 'no-perfume' ? (
                  <div className="text-right">
                    <span className="font-bold text-brand-accent">✨ {perfume.name}</span>
                    {perfume?.price > 0 && (
                      <span className="text-neutral-400 block text-[10px]">+{formatPrice(perfume.price)}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-neutral-400">No Perfume (Unscented)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Summary & Action CTA */}
        {showPricing && price && (
          <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                Total Price
              </span>
              <div className="text-2xl sm:text-3xl font-black text-brand-dark">
                {formatPrice(price)}
              </div>
              <span className="text-[11px] text-neutral-400">Includes all chosen customizations and fabric</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(1)}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition"
                >
                  Edit
                </button>
              )}
              {onAddToCart && (
                <button
                  type="button"
                  onClick={onAddToCart}
                  className="flex-1 sm:flex-none px-7 py-2.5 rounded-xl bg-brand-dark hover:bg-neutral-800 text-white text-xs font-bold transition shadow-sm"
                >
                  Add to Bag &rarr;
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
