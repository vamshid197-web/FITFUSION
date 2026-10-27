import React, { useState, useEffect, useRef } from 'react';
import ProductImage from '../common/ProductImage.jsx';
import { getProductImage } from '../../data/mockProducts.js';
import { MASTER_COLORS } from '../../data/customizationOptions.js';
import { GRAPHICS_LIBRARY, PATCHES_LIBRARY } from '../../data/clothingDesignLibrary.js';
import { ThreeGarmentEngine } from '../../services/clothing3DService.js';

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
    perfume,
    designLayers = []
  } = customization || {};

  const activeMeasurements = customMeasurements || measurements || {};

  // Resolve best product image URL
  const baseImg = customization?.productImage || product?.image || getProductImage(product);
  
  // Resolve color hex with fallbacks
  let colorHex = color?.hex || color?.value || null;
  if (!colorHex && color) {
    const colorStr = typeof color === 'string' ? color : color?.name;
    if (colorStr) {
      if (colorStr.startsWith('#')) {
        colorHex = colorStr;
      } else {
        const match = MASTER_COLORS.find(c => c.name.toLowerCase() === colorStr.toLowerCase());
        if (match) colorHex = match.hex;
      }
    }
  }

  // Format currency
  const formatPrice = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  // Interactive Preview Mode: '3d' | '2d'
  const [previewMode, setPreviewMode] = useState('3d');
  const threeCanvasRef = useRef(null);
  const threeContainerRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    if (previewMode !== '3d' || !threeCanvasRef.current || !threeContainerRef.current) return;

    let engine = null;
    try {
      engine = new ThreeGarmentEngine(threeCanvasRef.current, threeContainerRef.current, {
        mode: 'studio',
        product: product,
        customization: customization
      });
      engineRef.current = engine;
    } catch (err) {
      console.warn('[CustomizationSummary] 3D Engine init error:', err);
    }

    return () => {
      if (engine) {
        engine.dispose();
      }
      engineRef.current = null;
    };
  }, [previewMode, product, customization]);

  // ── Compact Mode (Sticky Sidebar) ──────────────────────────────────────────
  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-4 text-xs text-neutral-700 space-y-3 shadow-xs">
        <div className="flex gap-3 items-center">
          {/* Garment Image with live color tint */}
          <div className="w-16 h-20 rounded-lg overflow-hidden border border-neutral-200 shrink-0 bg-neutral-100">
            <ProductImage
              productId={product?.id}
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
          {designLayers && designLayers.length > 0 && (
            <div className="col-span-2 pt-1.5 border-t border-neutral-100 text-[11px] space-y-0.5">
              <div className="text-neutral-500 font-semibold flex items-center justify-between">
                <span>🎨 Artwork Designs ({designLayers.length}):</span>
                <span className="text-[10px] text-brand-accent uppercase font-bold">
                  {[...new Set(designLayers.map(l => l.printStyle || 'Solid'))][0]}
                </span>
              </div>
              <div className="text-neutral-800 font-medium truncate">
                {designLayers.map(l => l.name || (l.type === 'text' ? `"${l.text}"` : l.type)).join(' • ')}
              </div>
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
      <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-accent">
            Customization Summary
          </span>
          <h2 className="text-xl font-extrabold text-brand-dark">Your Customized Garment</h2>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-neutral-200/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setPreviewMode('3d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                previewMode === '3d'
                  ? 'bg-neutral-900 text-amber-300 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <span>🌐</span> 3D Garment
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('2d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                previewMode === '2d'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <span>📸</span> Atelier Photo
            </button>
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
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Main Product Hero with 3D Canvas / 2D Photo */}
        <div className="max-w-md mx-auto">
          {previewMode === '3d' ? (
            <div
              ref={threeContainerRef}
              className="relative rounded-2xl overflow-hidden border border-neutral-200 shadow-md bg-gradient-to-b from-neutral-100 to-neutral-200 aspect-square flex items-center justify-center"
            >
              <canvas ref={threeCanvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold text-neutral-700 border border-neutral-200/80 shadow-2xs">
                🔄 Drag to rotate 360° &bull; Scroll to zoom
              </div>
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-xs border border-neutral-200/80 flex items-center gap-2">
                {colorHex && (
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-2xs shrink-0"
                    style={{ backgroundColor: colorHex }}
                  />
                )}
                <span className="text-xs font-bold text-neutral-800">
                  {color?.name || 'Custom Color'} ({fit || 'Regular Fit'})
                </span>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-neutral-200 shadow-md bg-neutral-100 group">
              <ProductImage
                productId={product?.id}
                src={baseImg}
                alt={product?.name || 'Garment preview'}
                fallbackCategory={product?.category || 'Shirts'}
                tintColor={colorHex}
                colorImages={product?.colorImages}
                selectedColor={color}
                aspectRatio="aspect-[4/3] sm:aspect-square"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Design layers overlay rendered on top of garment */}
              {designLayers && designLayers.length > 0 && (
                <div
                  className="absolute pointer-events-none overflow-hidden"
                  style={{
                    width: '60%',
                    height: '62%',
                    top: '19%',
                    left: '20%'
                  }}
                >
                  {designLayers.map((layer) => {
                    const pos = layer.position || { x: 50, y: 50 };
                    const scale = layer.scale || 1;
                    const rot = layer.rotation || 0;
                    const opacity = layer.opacity ?? 1;

                    return (
                      <div
                        key={layer.id}
                        style={{
                          position: 'absolute',
                          left: `${pos.x}%`,
                          top: `${pos.y}%`,
                          transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`,
                          opacity: opacity
                        }}
                        className="drop-shadow-md"
                      >
                        {layer.type === 'text' && (
                          <span
                            style={{
                              color: layer.color || '#FFFFFF',
                              fontFamily: layer.font || 'sans-serif',
                              fontWeight: 'bold',
                              whiteSpace: 'nowrap',
                              textShadow: '0 2px 4px rgba(0,0,0,0.6)'
                            }}
                            className="text-xs sm:text-sm tracking-wider"
                          >
                            {layer.text}
                          </span>
                        )}
                        {layer.type === 'photo' && layer.asset && (
                          <img src={layer.asset} alt="Print" className="w-16 h-16 object-cover rounded shadow-sm" />
                        )}
                        {layer.type === 'drawing' && layer.asset && (
                          <img src={layer.asset} alt="Drawing" className="w-16 h-16 object-contain" />
                        )}
                        {layer.type === 'graphic' && (
                          <div
                            className="w-16 h-16 flex items-center justify-center pointer-events-none"
                            style={{ color: layer.color || '#FFFFFF' }}
                            dangerouslySetInnerHTML={{
                              __html: GRAPHICS_LIBRARY.find((g) => g.id === layer.asset)?.svg || ''
                            }}
                          />
                        )}
                        {layer.type === 'patch' && (
                          <div
                            className="w-14 h-14 flex items-center justify-center pointer-events-none"
                            style={{ color: layer.color || '#2563EB' }}
                            dangerouslySetInnerHTML={{
                              __html: PATCHES_LIBRARY.find((p) => p.id === layer.asset)?.svg || ''
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Color name badge */}
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-xs border border-neutral-200/80 flex items-center gap-2">
                {colorHex && (
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-2xs shrink-0"
                    style={{ backgroundColor: colorHex }}
                  />
                )}
                <span className="text-xs font-bold text-neutral-800">
                  {color?.name || 'Default Color'}
                </span>
              </div>
            </div>
          )}
          <p className="text-center text-xs text-neutral-500 mt-2">
            Selected garment shown in <strong className="text-neutral-800">{color?.name || 'chosen color'}</strong> ({previewMode === '3d' ? 'Interactive 3D WebGL Model' : 'Photoreal Atelier View'})
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

          {/* Card 4: Perfume Pairing */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="font-bold text-xs uppercase tracking-wider text-neutral-500">Perfume Pairing</span>
              {onEdit && (
                <button type="button" onClick={() => onEdit(7)} className="text-xs text-brand-accent hover:underline font-semibold">
                  Change
                </button>
              )}
            </div>
            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Selected Perfume:</span>
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

          {/* Card 5 (Section 18): DESIGNS, PRINT STYLE & PLACEMENT */}
          {designLayers && designLayers.length > 0 && (
            <div className="col-span-1 md:col-span-2 p-5 rounded-xl border border-neutral-200 bg-neutral-50/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <span className="font-bold text-xs uppercase tracking-wider text-neutral-500">
                  Custom Artwork & Graphic Designs ({designLayers.length})
                </span>
                {onEdit && (
                  <button type="button" onClick={() => onEdit(3)} className="text-xs text-brand-accent hover:underline font-semibold">
                    Edit Designs &rarr;
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* DESIGNS List */}
                <div>
                  <span className="text-neutral-500 font-bold uppercase tracking-wider block mb-1.5 text-[11px]">
                    DESIGNS
                  </span>
                  <ul className="space-y-1 text-neutral-900 font-semibold">
                    {designLayers.map((l, i) => (
                      <li key={i} className="flex items-center gap-1.5 truncate">
                        <span className="text-brand-accent font-bold">&bull;</span>
                        <span>{l.name || (l.type === 'text' ? `"${l.text}" Text` : `${l.type} Design`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* PRINT STYLE */}
                <div>
                  <span className="text-neutral-500 font-bold uppercase tracking-wider block mb-1.5 text-[11px]">
                    PRINT STYLE
                  </span>
                  <div className="font-extrabold text-brand-dark text-sm">
                    {[...new Set(designLayers.map(l => l.printStyle || 'solid'))].map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}
                  </div>
                  <span className="text-[11px] text-neutral-400 block mt-0.5">
                    High-definition textile bonding
                  </span>
                </div>

                {/* PLACEMENT */}
                <div>
                  <span className="text-neutral-500 font-bold uppercase tracking-wider block mb-1.5 text-[11px]">
                    PLACEMENT
                  </span>
                  <div className="font-extrabold text-brand-dark text-sm">
                    {[...new Set(designLayers.map(l => (l.printArea || 'front').replace('_', ' ')))].map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(' / ')}
                  </div>
                  <span className="text-[11px] text-neutral-400 block mt-0.5">
                    Garment-specific print coordinates
                  </span>
                </div>
              </div>
            </div>
          )}
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
