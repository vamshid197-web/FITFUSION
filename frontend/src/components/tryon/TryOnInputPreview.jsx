import React from 'react';
import ProductImage from '../common/ProductImage.jsx';
import { getProductImage } from '../../data/mockProducts.js';

/**
 * TryOnInputPreview
 * Dual input preview stage displaying both the uploaded Person photograph
 * and the selected clothing item (from catalog or custom upload) prior to AI generation.
 */
export default function TryOnInputPreview({
  userPhoto,
  selectedProduct,
  customization = {},
  onChangePhoto,
  onChangeGarment,
  onGenerateTryOn,
  isGenerating = false,
  isCooldownActive = false,
  cooldownSeconds = 0,
  backendStatus = null
}) {
  const garmentImg = selectedProduct?.image || getProductImage(selectedProduct);
  const isCustom = selectedProduct?.isCustomGarment;

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              STEP 3: PREVIEW INPUTS
            </span>
            <span className="text-neutral-500 text-xs">• Verification Prior to AI Diffusion</span>
          </div>
          <h3 className="text-lg md:text-xl font-extrabold text-white mt-1">
            Preview Input Images & Specifications
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Review your reference photo and garment pairing before dispatching to Kolors AI Virtual Try-On.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-neutral-300">
            {backendStatus?.model || 'Kolors-Virtual-Try-On'} Ready
          </span>
        </div>
      </div>

      {/* ── Dual Input Preview Cards (Person Photo + Garment Image) ────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Input 1: Person Photograph */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-4 flex flex-col justify-between space-y-4 shadow-lg group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-amber-400 text-xs font-black flex items-center justify-center border border-neutral-800">
                1
              </span>
              <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                Person Image
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              ✓ Subject Ready
            </span>
          </div>

          <div className="relative aspect-[3/4] max-h-80 rounded-2xl overflow-hidden border border-neutral-800 bg-black mx-auto w-full">
            {userPhoto ? (
              <img
                src={userPhoto}
                alt="Your Reference Photograph"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                No user photo
              </div>
            )}
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-neutral-950/80 backdrop-blur-md border border-neutral-700 text-[10px] font-black text-white">
              YOUR PHOTO
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-neutral-400">
              🔒 In-memory ephemeral processing
            </div>
            <button
              type="button"
              onClick={onChangePhoto}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 transition"
            >
              ↺ Change Photo
            </button>
          </div>
        </div>

        {/* Input 2: Clothing Reference (Catalog or Custom) */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-4 flex flex-col justify-between space-y-4 shadow-lg group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-amber-400 text-xs font-black flex items-center justify-center border border-neutral-800">
                2
              </span>
              <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                Garment Image
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
              {isCustom ? 'Custom Upload' : 'FITFUSION Catalog'}
            </span>
          </div>

          <div className="relative aspect-[3/4] max-h-80 rounded-2xl overflow-hidden border border-neutral-800 bg-black mx-auto w-full">
            {isCustom ? (
              <img
                src={garmentImg}
                alt={selectedProduct?.name || 'Custom Garment'}
                className="w-full h-full object-contain bg-neutral-900"
              />
            ) : selectedProduct ? (
              <ProductImage
                productId={selectedProduct.id}
                src={garmentImg}
                alt={selectedProduct.name}
                fallbackCategory={selectedProduct.category}
                aspectRatio="aspect-[3/4]"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                No garment selected
              </div>
            )}
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-neutral-950/80 backdrop-blur-md border border-neutral-700 text-[10px] font-black text-amber-400">
              {isCustom ? 'CUSTOM GARMENT' : 'CATALOGUE GARMENT'}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-white font-bold truncate max-w-[180px]">
              {selectedProduct?.name} {!isCustom && `(₹${selectedProduct?.price || 599})`}
            </div>
            <button
              type="button"
              onClick={onChangeGarment}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 transition shrink-0"
            >
              ↺ Change Outfit
            </button>
          </div>
        </div>
      </div>

      {/* ── Customization Specs Summary Bar ──────────────────────────────── */}
      {!isCustom && (
        <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-neutral-500 text-[11px] block">Selected Color</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="w-3.5 h-3.5 rounded-full border border-neutral-600 shrink-0"
                style={{ backgroundColor: customization.color?.hex || '#111827' }}
              />
              <span className="font-bold text-white truncate">
                {customization.color?.name || 'Standard'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-neutral-500 text-[11px] block">Chosen Size</span>
            <span className="font-bold text-white mt-0.5 block">
              {customization.size || 'M'}
            </span>
          </div>

          <div>
            <span className="text-neutral-500 text-[11px] block">Tailored Fit</span>
            <span className="font-bold text-white mt-0.5 block">
              {customization.fit || 'Regular Fit'}
            </span>
          </div>

          <div>
            <span className="text-neutral-500 text-[11px] block">Material Fabric</span>
            <span className="font-bold text-white mt-0.5 block truncate">
              {customization.fabric?.name || 'Organic Cotton'}
            </span>
          </div>
        </div>
      )}

      {/* ── Disclaimers Notice ────────────────────────────────────────────── */}
      <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5 text-xs text-neutral-400">
        <span className="text-amber-400 text-sm shrink-0">ℹ️</span>
        <p className="leading-relaxed text-[11px]">
          <strong className="text-neutral-200">Neural Try-On Processing:</strong> Kolors AI will composite the garment onto your natural silhouette, matching lighting, posture, wrinkles, and authentic fabric drape. User identity and expression are fully preserved.
        </p>
      </div>

      {/* ── Generate Action CTA ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-neutral-800">
        <div className="text-xs text-neutral-400 text-center sm:text-left">
          Estimated generation time: <strong className="text-white">~8–15 seconds</strong> via Kolors AI
        </div>

        <button
          type="button"
          disabled={isGenerating || isCooldownActive}
          onClick={onGenerateTryOn}
          className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-2xl flex items-center justify-center gap-2 ${
            isGenerating || isCooldownActive
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
              : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 hover:scale-105 active:scale-95 hover:shadow-amber-500/20'
          }`}
        >
          {isGenerating ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-neutral-950 border-t-transparent animate-spin" />
              <span>Generating Try-On...</span>
            </>
          ) : isCooldownActive ? (
            <span>⏳ Cooldown Active ({cooldownSeconds}s)</span>
          ) : (
            <>
              <span>✨</span>
              <span>Generate Kolors AI Try-On &rarr;</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
