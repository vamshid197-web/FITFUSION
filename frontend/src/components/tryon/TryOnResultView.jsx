import React, { useState, useRef, useCallback } from 'react';
import ProductImage from '../common/ProductImage.jsx';
import { getProductImage } from '../../data/mockProducts.js';

/**
 * TryOnResultView
 * Results presentation for Kolors AI Virtual Try-On:
 * - Active multi-stage neural diffusion generation display.
 * - Honest credential & quota error handling with clear setup guidance.
 * - Side-by-side or interactive split-screen slider comparing:
 *   1. User Reference Photo
 *   2. Catalogue Garment Reference Image
 *   3. Kolors AI Try-On Preview Result
 * - Customization disclaimers:
 *   - Changing colour/size does not alter the generated preview unless re-generated.
 *   - AI preview does not guarantee physical millimeter bespoke garment fit.
 * - Actions: Try Another Outfit, Reset, Add to Bag, 3D Studio Preview.
 */
export default function TryOnResultView({
  userPhoto,
  resultImage,
  selectedProduct,
  isGenerating,
  generationStage,
  onCancelGeneration,
  onRetryGeneration,
  onSelectAnotherOutfit,
  onResetAll,
  onAddToCart,
  onOpenIn3DStudio,
  error,
  instructions,
  cooldownSeconds = 0,
  isCooldownActive = false,
  customization = {},
  hasChangedOptionsSinceGeneration = false
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState('slider'); // 'slider' | 'side_by_side' | 'three_way'
  const sliderContainerRef = useRef(null);

  // Split-screen drag handler
  const handleSliderMove = useCallback((clientX) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPos(percent);
  }, []);

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) {
      handleSliderMove(e.clientX);
    }
  };

  // Format countdown seconds into HH:MM:SS
  const formatCooldown = (seconds) => {
    if (!seconds || seconds <= 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const handleDownload = async () => {
    if (!resultImage) return;
    const filename = `fitfusion-kolors-tryon-${selectedProduct?.id || 'outfit'}.png`;

    try {
      if (resultImage.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const res = await fetch(resultImage);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      // Fallback to direct anchor download
      const link = document.createElement('a');
      link.href = resultImage;
      link.target = '_blank';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isCredentialsRequired = error && (
    error.includes('credentials not configured') ||
    error.includes('CREDENTIALS_REQUIRED') ||
    error.includes('FAL_KEY') ||
    error.includes('HF_TOKEN')
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── 1. ACTIVE GENERATION LOADING STATE ──────────────────────────────── */}
      {isGenerating && (
        <div className="bg-neutral-900/95 border border-neutral-800 rounded-3xl p-8 md:p-12 shadow-2xl text-center max-w-2xl mx-auto space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
            <div className="w-full h-full flex items-center justify-center text-4xl">
              ✨
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider text-amber-400">
              Kolors AI Neural Diffusion
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Synthesizing Kolors Virtual Try-On
            </h3>
            <p className="text-sm font-semibold text-amber-400 animate-pulse">
              {generationStage || 'Compositing photorealistic fabric & body geometry...'}
            </p>
            <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
              Warps authentic garment texture, preserves user facial features & natural anatomy, and computes photorealistic ambient lighting.
            </p>
          </div>

          {/* Product Pill */}
          {selectedProduct && (
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Trying on: <strong className="text-white">{selectedProduct.name}</strong></span>
              <span className="text-neutral-600">•</span>
              <span className="text-amber-400 font-bold">₹{selectedProduct.price || 599}</span>
            </div>
          )}

          {/* Privacy Note */}
          <p className="text-[11px] text-neutral-500 italic">
            🔒 Photo processed ephemerally in-memory. Never stored permanently.
          </p>

          {/* Cancellation Control */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onCancelGeneration}
              className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-bold border border-neutral-700 transition-all shadow-md"
            >
              Cancel Request
            </button>
          </div>
        </div>
      )}

      {/* ── 2. ERROR & CREDENTIALS HANDLING ─────────────────────────────────── */}
      {!isGenerating && error && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl max-w-2xl mx-auto space-y-6">
          {/* Case A: API Credentials Required */}
          {isCredentialsRequired ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-amber-400">
                <span className="text-3xl">🔑</span>
                <div>
                  <h3 className="text-base md:text-lg font-black text-white">
                    Kolors AI Provider Setup Required
                  </h3>
                  <p className="text-xs text-amber-400/90 font-semibold">
                    Backend API credentials need to be configured
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-neutral-300 space-y-3 leading-relaxed">
                <p>
                  {error}
                </p>

                <div className="pt-2 border-t border-amber-500/20 text-neutral-300 space-y-2">
                  <p className="font-bold text-amber-300">⚙️ How to configure Kolors Virtual Try-On:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 font-mono text-[11px] bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                    <li>
                      <strong>Option 1 (Recommended):</strong> Get a key at{' '}
                      <a href="https://fal.ai" target="_blank" rel="noreferrer" className="text-amber-400 underline font-sans font-bold">
                        fal.ai
                      </a>{' '}
                      and add <span className="text-emerald-400 font-bold">FAL_KEY=...</span> in <code className="text-amber-300">backend/.env</code>
                    </li>
                    <li>
                      <strong>Option 2:</strong> Get a free token at{' '}
                      <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" className="text-amber-400 underline font-sans font-bold">
                        huggingface.co/settings/tokens
                      </a>{' '}
                      and add <span className="text-emerald-400 font-bold">HF_TOKEN=...</span> in <code className="text-amber-300">backend/.env</code>
                    </li>
                    <li>Save the file. The backend auto-refreshes credentials immediately with zero server restart needed.</li>
                  </ol>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={onSelectAnotherOutfit}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all"
                >
                  &larr; Select Different Outfit
                </button>

                <button
                  type="button"
                  onClick={onRetryGeneration}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-lg transition-all"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          ) : isCooldownActive || cooldownSeconds > 0 ? (
            /* Case B: Cooldown Active */
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-amber-400">
                <span className="text-2xl">⏳</span>
                <div>
                  <h3 className="text-base md:text-lg font-black text-white">
                    Provider Quota Cooldown Active
                  </h3>
                  <p className="text-xs text-amber-400/90 font-semibold">
                    Cooldown active for: {formatCooldown(cooldownSeconds)}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-neutral-300 space-y-2 leading-relaxed">
                <p>
                  The public community GPU queue is currently in cooldown. Automated retry requests are paused until the cooldown expires.
                </p>
                <p className="text-[11px] text-neutral-400">
                  Tip: Setting your own <code className="text-amber-300">FAL_KEY</code> in <code className="text-amber-300">backend/.env</code> provides dedicated, unconstrained GPU inference.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onSelectAnotherOutfit}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all"
                >
                  &larr; Choose Different Outfit
                </button>

                <button
                  type="button"
                  disabled={cooldownSeconds > 0}
                  onClick={onRetryGeneration}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    cooldownSeconds > 0
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                      : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg'
                  }`}
                >
                  {cooldownSeconds > 0 ? `Cooldown (${cooldownSeconds}s)` : 'Retry Try-On'}
                </button>
              </div>
            </div>
          ) : (
            /* Case C: Generic Error */
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-red-400">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="text-base md:text-lg font-black text-white">
                    Virtual Try-On Issue
                  </h3>
                  <p className="text-xs text-neutral-400">
                    The inference service returned an error.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 text-xs text-red-300">
                {error}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onSelectAnotherOutfit}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all"
                >
                  &larr; Select Different Outfit
                </button>

                <button
                  type="button"
                  onClick={onRetryGeneration}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-lg transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 3. SUCCESSFUL GENERATED TRY-ON RESULT VIEW ───────────────────────── */}
      {!isGenerating && resultImage && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Controls: Mode Toggles & Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  KOLORS AI TRY-ON COMPLETE
                </span>
                <span className="text-neutral-500 text-xs">• Kwai-Kolors Diffusion Model</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                Your Virtual Try-On Preview
              </h2>
            </div>

            {/* View Mode Toggle: Interactive Split Slider vs Side-by-Side vs 3-Way Reference */}
            <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('slider')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'slider'
                    ? 'bg-amber-500 text-neutral-950 shadow-md font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Split Slider
              </button>
              <button
                type="button"
                onClick={() => setViewMode('side_by_side')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'side_by_side'
                    ? 'bg-amber-500 text-neutral-950 shadow-md font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Side-by-Side
              </button>
              <button
                type="button"
                onClick={() => setViewMode('three_way')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'three_way'
                    ? 'bg-amber-500 text-neutral-950 shadow-md font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Full Comparison
              </button>
            </div>
          </div>

          {/* Stale Generation Warning Banner */}
          {hasChangedOptionsSinceGeneration && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200">
              <div className="flex items-center gap-2.5">
                <span className="text-lg shrink-0">⚠️</span>
                <span>
                  <strong className="text-amber-300">Customization Changed:</strong> You modified garment options after generating. This preview reflects your previous generation.
                </span>
              </div>
              <button
                type="button"
                onClick={onRetryGeneration}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs whitespace-nowrap shadow-md transition-all self-start sm:self-auto"
              >
                Regenerate Preview
              </button>
            </div>
          )}

          {/* Mandatory Customization & Fit Disclaimers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-start gap-2.5 text-neutral-400">
              <span className="text-amber-400 text-sm shrink-0">⚠️</span>
              <p className="leading-relaxed">
                <strong className="text-neutral-200">Customization Notice:</strong> Changing product options (colour: {customization.color?.name || 'Standard'}, size: {customization.size || 'M'}) updates order specifications, but does not alter this generated image unless a new AI generation is performed.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-start gap-2.5 text-neutral-400">
              <span className="text-amber-400 text-sm shrink-0">ℹ️</span>
              <p className="leading-relaxed">
                <strong className="text-neutral-200">Fit Disclaimer:</strong> This preview is an illustrative AI neural simulation for aesthetic style visualization. It does not guarantee exact millimeter bespoke physical garment fit.
              </p>
            </div>
          </div>

          {/* Display View: Split Slider Mode */}
          {viewMode === 'slider' && (
            <div className="space-y-3">
              <div
                ref={sliderContainerRef}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                className="relative aspect-[3/4] md:aspect-[16/11] max-h-[640px] rounded-3xl overflow-hidden border border-neutral-700/80 shadow-2xl bg-black cursor-ew-resize select-none mx-auto"
              >
                {/* Generated AI Image (Underlayer) */}
                <img
                  src={resultImage}
                  alt="Kolors AI Virtual Try-On Result"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Original Photo (Top Clipped Layer) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={userPhoto}
                    alt="Original User Photo"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{
                      width: sliderContainerRef.current?.clientWidth || '100%',
                      height: '100%'
                    }}
                  />
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-neutral-950/80 backdrop-blur-md border border-neutral-700 text-xs font-black text-white shadow-lg">
                    BEFORE (YOUR PHOTO)
                  </div>
                </div>

                {/* Right Badge */}
                <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur-md border border-amber-400 text-xs font-black text-neutral-950 shadow-lg">
                  AFTER (KOLORS AI TRY-ON)
                </div>

                {/* Slider Divider Bar */}
                <div
                  className="absolute top-0 bottom-0 z-20 w-1 bg-white shadow-2xl pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-neutral-950 font-black text-xs flex items-center justify-center shadow-2xl border-2 border-neutral-900">
                    ↔
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-neutral-500 text-center font-medium">
                Drag the divider left or right to compare your original photo with the Kolors AI virtual try-on.
              </p>
            </div>
          )}

          {/* Display View: Side-by-Side Mode */}
          {viewMode === 'side_by_side' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-neutral-800 bg-black shadow-xl">
                <img
                  src={userPhoto}
                  alt="Original Photo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-neutral-950/80 backdrop-blur-md border border-neutral-700 text-xs font-black text-white shadow-lg">
                  ORIGINAL USER PHOTO
                </div>
              </div>

              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-amber-500/40 bg-black shadow-2xl ring-1 ring-amber-500/30">
                <img
                  src={resultImage}
                  alt="Kolors AI Virtual Try-On Result"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500 text-neutral-950 text-xs font-black shadow-lg">
                  KOLORS AI TRY-ON PREVIEW
                </div>
              </div>
            </div>
          )}

          {/* Display View: 3-Way Full Comparison Mode */}
          {viewMode === 'three_way' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 1. User Photo */}
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-neutral-800 bg-black shadow-xl">
                <img
                  src={userPhoto}
                  alt="User Reference Photo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-neutral-950/80 backdrop-blur-md border border-neutral-700 text-[10px] font-black text-white">
                  1. YOUR PHOTO
                </div>
              </div>

              {/* 2. Original Catalogue Garment Image */}
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-xl">
                {selectedProduct && (
                  <ProductImage
                    productId={selectedProduct.id}
                    src={selectedProduct.image || getProductImage(selectedProduct)}
                    alt={selectedProduct.name}
                    fallbackCategory={selectedProduct.category}
                    aspectRatio="aspect-[3/4]"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-neutral-950/80 backdrop-blur-md border border-neutral-700 text-[10px] font-black text-amber-400">
                  2. CATALOGUE GARMENT
                </div>
              </div>

              {/* 3. Generated Kolors AI Try-On */}
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-amber-500/40 bg-black shadow-2xl ring-1 ring-amber-500/30">
                <img
                  src={resultImage}
                  alt="Kolors AI Try-On Result"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-black shadow-lg">
                  3. AI PREVIEW RESULT
                </div>
              </div>
            </div>
          )}

          {/* ── Product Details & Checkout Sync Card ────────────────────────── */}
          {selectedProduct && (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-16 h-20 rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-950 shrink-0">
                  <ProductImage
                    productId={selectedProduct.id}
                    src={selectedProduct.image || getProductImage(selectedProduct)}
                    alt={selectedProduct.name}
                    fallbackCategory={selectedProduct.category}
                    aspectRatio="aspect-square"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      {selectedProduct.category}
                    </span>
                    <span className="text-neutral-600 text-xs">•</span>
                    <span className="text-xs text-neutral-400 font-semibold">
                      Size: {customization.size || 'M'} • Color: {customization.color?.name || 'Standard'}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-base font-black text-amber-400 mt-0.5">
                    ₹{selectedProduct.price || 599}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Try Another Outfit, Reset, Download, 3D Studio, Add to Bag */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
                <button
                  type="button"
                  onClick={onSelectAnotherOutfit}
                  className="px-4 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all shadow-md flex items-center gap-1.5"
                >
                  <span>↺</span> Try Another Outfit
                </button>

                <button
                  type="button"
                  onClick={onResetAll}
                  className="px-3 py-3 rounded-2xl bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-bold border border-neutral-800 transition-all shadow-md"
                  title="Reset photo and garment selection"
                >
                  🔄 Reset
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3.5 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold border border-neutral-700 transition shadow-md"
                  title="Download result image"
                >
                  ⬇️ Save
                </button>

                <button
                  type="button"
                  onClick={onOpenIn3DStudio}
                  className="px-4 py-3 rounded-2xl bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 text-xs font-bold border border-indigo-500/40 transition-all shadow-md flex items-center gap-1.5"
                >
                  <span>🌐</span> 3D Studio
                </button>

                <button
                  type="button"
                  onClick={onAddToCart}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>🛍️</span> Add to Bag &bull; ₹{selectedProduct.price || 599}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
