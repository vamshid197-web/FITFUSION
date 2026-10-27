import React, { useState } from 'react';
import { MASTER_PERFUMES } from '../../data/customizationOptions.js';
import { getProduct3DModel } from '../../data/clothing3DRegistry.js';

export const STUDIO_COLORS = [
  { name: 'White', hex: '#FFFFFF', border: true },
  { name: 'Black', hex: '#111827' },
  { name: 'Charcoal', hex: '#374151' },
  { name: 'Light Grey', hex: '#D1D5DB' },
  { name: 'Navy', hex: '#1E3A8A' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Sky Blue', hex: '#38BDF8' },
  { name: 'Forest Green', hex: '#166534' },
  { name: 'Olive Green', hex: '#4D7C0F' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Maroon', hex: '#881337' },
  { name: 'Orange', hex: '#EA580C' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Lavender', hex: '#C084FC' },
  { name: 'Purple', hex: '#7E22CE' },
  { name: 'Beige', hex: '#D4C5B9' }
];

export const STUDIO_FABRICS = [
  { id: 'cotton', name: 'Cotton', desc: '100% Breathable natural combed weave. Classic soft finish.', surcharge: 0 },
  { id: 'polyester', name: 'Polyester', desc: 'High-durability moisture-wicking synthetic with light sheen.', surcharge: 0 },
  { id: 'blend', name: 'Cotton-Polyester Blend', desc: 'Optimal wrinkle-resistance and athletic durability.', surcharge: 50 },
  { id: 'supima', name: 'Premium Supima Cotton', desc: 'Extra-long staple cotton offering ultra-luminous drape.', surcharge: 150 },
  { id: 'linen', name: 'Pure Linen', desc: 'Airy luxury flax fiber with artisanal organic texture.', surcharge: 200 },
  { id: 'denim', name: 'Raw Denim', desc: 'Heavyweight twill weave with rugged texture and authentic fade.', surcharge: 250 },
  { id: 'wool', name: 'Merino Wool', desc: 'Ultra-fine temperature-regulating wool offering exquisite warmth.', surcharge: 300 },
  { id: 'silk', name: 'Mulberry Silk', desc: 'Supreme natural protein luster with fluid drape and softness.', surcharge: 400 }
];

const AI_STYLE_PRESETS = [
  'Realistic', 'Minimal', 'Vintage', 'Abstract', 'Typography', 'Anime', 'Custom'
];

/**
 * CustomizationStudioControls
 * Right panel driving all 7 customization steps.
 */
export default function CustomizationStudioControls({
  product,
  activeStep,
  setActiveStep,
  selectedColor,
  setSelectedColor,
  selectedFabric,
  setSelectedFabric,
  selectedSize,
  setSelectedSize,
  selectedFit,
  setSelectedFit,
  sizeMode,
  setSizeMode,
  customMeasurements,
  setCustomMeasurements,
  measurementUnit,
  setMeasurementUnit,
  customText,
  setCustomText,
  textFont,
  setTextFont,
  textColor,
  setTextColor,
  activePlacement,
  setActivePlacement,
  uploadedImage,
  setUploadedImage,
  aiPrompt,
  setAiPrompt,
  aiStyle,
  setAiStyle,
  onGenerateAiDesign,
  isGeneratingAi,
  aiGeneratedDesign,
  onApplyChanges,
  isApplying,
  onAddToCart,
  isAddingToCart,
  onSaveDesign,
  isSavingDesign,
  selectedPerfume,
  setSelectedPerfume,
  totalPrice,
  className = ''
}) {
  const [uploadError, setUploadError] = useState(null);

  const modelMeta = getProduct3DModel(product);
  const availableSizes = (product?.availableSizes && product.availableSizes.length > 0)
    ? product.availableSizes
    : (product?.sizes && product.sizes.length > 0)
    ? product.sizes
    : ['XS', 'S', 'M', 'L', 'XL', '2XL'];

  // Handle image file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/i)) {
      setUploadError('Please select a PNG, JPG, or WEBP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be under 5MB.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const formatPrice = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  return (
    <div className={`flex flex-col gap-5 text-white ${className}`}>
      {/* ── STEP 1: CHOOSE PRODUCT ────────────────────────────────────────── */}
      {activeStep === 1 && (
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs">
                1
              </span>
              <span>Selected Product</span>
            </h3>
            <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
              {product?.category}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2">
            <p className="font-extrabold text-lg text-white">{product?.name}</p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {product?.description || product?.shortDescription}
            </p>
            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-xl font-black text-blue-400">{formatPrice(product?.basePrice || product?.price)}</span>
              {product?.compareAtPrice && (
                <span className="text-sm text-neutral-500 line-through">{formatPrice(product?.compareAtPrice)}</span>
              )}
            </div>

            {/* 3D Asset Availability Status */}
            <div className="mt-3 pt-3 border-t border-neutral-800/80">
              {modelMeta.has3DModel ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Interactive 3D Model: {modelMeta.modelName}</span>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs">
                  <span className="text-sm">⚠️</span>
                  <div>
                    <p className="font-semibold">3D model not available for this product yet.</p>
                    <p className="text-[11px] text-amber-200/70 mt-0.5">
                      You can still fully customize sizes, tailoring, and luxury add-ons.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Upload & Text</span>
            <span>&rarr;</span>
          </button>
        </div>
      )}

      {/* ── STEP 2: UPLOAD IMAGE / ADD TEXT ──────────────────────────────── */}
      {activeStep === 2 && (
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-xl backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs">
                2
              </span>
              <span>Upload Image / Add Text</span>
            </h3>
          </div>

          {/* Placement selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Design Placement
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'front', label: 'Chest' },
                { id: 'back', label: 'Back' },
                { id: 'left_sleeve', label: 'Sleeve' }
              ].map((pl) => (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => setActivePlacement(pl.id)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                    activePlacement === pl.id
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  {pl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Add Text Section */}
          <div className="pt-3 border-t border-neutral-800/80 space-y-3">
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Add Text
            </label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. GOOD VIBES"
              maxLength={24}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm font-semibold placeholder-neutral-600 focus:outline-none focus:border-blue-500 transition-colors"
            />

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Font</label>
                <select
                  value={textFont}
                  onChange={(e) => setTextFont(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="Montserrat">Montserrat (Modern Bold)</option>
                  <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                  <option value="Inter">Inter (Clean Minimal)</option>
                  <option value="Anton">Anton (Heavy Streetwear)</option>
                  <option value="Pacifico">Pacifico (Artisanal Script)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Text Color</label>
                <div className="flex items-center gap-1.5 pt-0.5">
                  {[
                    { hex: '#FFFFFF', name: 'White' },
                    { hex: '#111827', name: 'Black' },
                    { hex: '#F59E0B', name: 'Gold' },
                    { hex: '#E5E7EB', name: 'Silver' },
                    { hex: '#EF4444', name: 'Red' },
                    { hex: '#3B82F6', name: 'Blue' }
                  ].map((tc) => (
                    <button
                      key={tc.hex}
                      type="button"
                      onClick={() => setTextColor(tc.hex)}
                      className={`w-6 h-6 rounded-full border transition-transform ${
                        textColor === tc.hex ? 'scale-125 border-white ring-2 ring-blue-500' : 'border-neutral-700'
                      }`}
                      style={{ backgroundColor: tc.hex }}
                      title={tc.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Upload Image Section */}
          <div className="pt-3 border-t border-neutral-800/80 space-y-3">
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Upload Image (Logo / Graphic)
            </label>
            <div className="relative border-2 border-dashed border-neutral-800 hover:border-blue-500/60 rounded-xl p-4 text-center transition-colors bg-neutral-950/50">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-1">
                <svg className="w-7 h-7 mx-auto text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs font-semibold text-neutral-300">
                  Click or drag image here
                </p>
                <p className="text-[10px] text-neutral-500">Supports PNG, JPG, WEBP (Up to 5MB)</p>
              </div>
            </div>

            {uploadError && (
              <p className="text-xs text-red-400 font-medium">{uploadError}</p>
            )}

            {uploadedImage && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="flex items-center gap-3">
                  <img src={uploadedImage} alt="Uploaded logo" className="w-10 h-10 object-contain rounded-lg bg-neutral-900 border border-neutral-800" />
                  <span className="text-xs font-medium text-neutral-300">Custom Graphic Loaded</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadedImage(null)}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold px-2 py-1 rounded-md hover:bg-red-950/30 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-800/60 hover:bg-neutral-800 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all text-center"
            >
              Continue to AI Design &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: AI PROMPT DESIGN ──────────────────────────────────────── */}
      {activeStep === 3 && (
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs">
                3
              </span>
              <span>AI Prompt Design</span>
            </h3>
            <span className="text-[11px] font-semibold text-purple-400 bg-purple-950/50 border border-purple-800/50 px-2 py-0.5 rounded-md">
              Generative Engine
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Describe your design idea
            </label>
            <textarea
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Minimal mountain design with sunset and Good Vibes text"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs leading-relaxed placeholder-neutral-600 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Design Style
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AI_STYLE_PRESETS.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setAiStyle(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    aiStyle === st
                      ? 'bg-purple-600 text-white border border-purple-400 shadow-md shadow-purple-600/30'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={isGeneratingAi || !aiPrompt.trim()}
            onClick={onGenerateAiDesign}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              isGeneratingAi || !aiPrompt.trim()
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-purple-600/25 active:scale-[0.99]'
            }`}
          >
            {isGeneratingAi ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Generating Design...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Generate Design</span>
              </>
            )}
          </button>

          {aiGeneratedDesign && (
            <div className="p-3 rounded-xl bg-neutral-950 border border-purple-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={aiGeneratedDesign} alt="AI Design" className="w-12 h-12 rounded-lg object-contain bg-neutral-900 border border-neutral-800" />
                <div>
                  <p className="text-xs font-bold text-purple-300">AI Design Synthesized</p>
                  <p className="text-[11px] text-neutral-400">{aiStyle} Style Applied to 3D Model</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-800/60 hover:bg-neutral-800 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all text-center"
            >
              Continue to Size & Color &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: CHOOSE SIZE & COLOR & FABRIC ─────────────────────────── */}
      {activeStep === 4 && (
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-xl backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs">
                4
              </span>
              <span>Choose Size & Color</span>
            </h3>
          </div>

          {/* 1. Choose Color (16 Circular Swatches) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Choose Color
              </label>
              <span className="text-xs font-semibold text-blue-400">
                {typeof selectedColor === 'string' ? selectedColor : selectedColor?.name || 'White'}
              </span>
            </div>
            <div className="grid grid-cols-8 gap-2.5 p-3 rounded-xl bg-neutral-950/70 border border-neutral-800">
              {STUDIO_COLORS.map((swatch) => {
                const isSelected =
                  (typeof selectedColor === 'string' && selectedColor.toLowerCase() === swatch.name.toLowerCase()) ||
                  (selectedColor?.name && selectedColor.name.toLowerCase() === swatch.name.toLowerCase()) ||
                  (selectedColor?.hex && selectedColor.hex.toLowerCase() === swatch.hex.toLowerCase());

                return (
                  <button
                    key={swatch.name}
                    type="button"
                    onClick={() => setSelectedColor(swatch)}
                    title={swatch.name}
                    className={`relative w-8 h-8 rounded-full transition-transform hover:scale-115 cursor-pointer ${
                      isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-neutral-950 scale-110 shadow-lg' : ''
                    } ${swatch.border ? 'border border-neutral-600' : 'border border-neutral-800'}`}
                    style={{ backgroundColor: swatch.hex }}
                  >
                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white mix-blend-difference">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Choose Fabric */}
          <div className="pt-2 border-t border-neutral-800/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Choose Fabric
              </label>
              <span className="text-xs font-semibold text-indigo-400">
                {selectedFabric?.name || 'Cotton'}
              </span>
            </div>
            <div className="space-y-2">
              {STUDIO_FABRICS.map((fab) => {
                const isSel = selectedFabric?.id === fab.id || selectedFabric?.name === fab.name;
                return (
                  <button
                    key={fab.id}
                    type="button"
                    onClick={() => setSelectedFabric(fab)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSel
                        ? 'bg-indigo-950/40 border-indigo-500/70 text-white'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{fab.name}</p>
                      <p className="text-[10px] text-neutral-400">{fab.desc}</p>
                    </div>
                    {fab.surcharge > 0 && (
                      <span className="text-[11px] font-bold text-blue-400 whitespace-nowrap ml-2">
                        +{formatPrice(fab.surcharge)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Choose Size */}
          <div className="pt-2 border-t border-neutral-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Size & Fit
              </label>
              <div className="flex items-center p-0.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setSizeMode('standard')}
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all ${
                    sizeMode === 'standard' ? 'bg-blue-600 text-white' : 'text-neutral-400'
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setSizeMode('custom')}
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all ${
                    sizeMode === 'custom' ? 'bg-blue-600 text-white' : 'text-neutral-400'
                  }`}
                >
                  Custom Measurements
                </button>
              </div>
            </div>

            {sizeMode === 'standard' ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-[44px] flex-1 py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedSize === sz
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  {['Slim', 'Regular', 'Relaxed'].map((fit) => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => setSelectedFit(fit)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                        selectedFit === fit
                          ? 'bg-neutral-800 text-white border-neutral-600'
                          : 'bg-neutral-950 border-neutral-850 text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      {fit} Fit
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-3 rounded-xl bg-neutral-950/80 border border-neutral-800">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Custom Tailoring Units</span>
                  <div className="flex items-center gap-1 font-bold">
                    <button
                      type="button"
                      onClick={() => setMeasurementUnit('in')}
                      className={`px-1.5 py-0.5 rounded ${measurementUnit === 'in' ? 'bg-blue-600 text-white' : 'text-neutral-500'}`}
                    >
                      IN
                    </button>
                    <span>/</span>
                    <button
                      type="button"
                      onClick={() => setMeasurementUnit('cm')}
                      className={`px-1.5 py-0.5 rounded ${measurementUnit === 'cm' ? 'bg-blue-600 text-white' : 'text-neutral-500'}`}
                    >
                      CM
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['chest', 'waist', 'length', 'shoulder'].map((field) => (
                    <div key={field}>
                      <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">{field}</span>
                      <input
                        type="number"
                        placeholder={measurementUnit === 'in' ? '38' : '96'}
                        value={customMeasurements[field] || ''}
                        onChange={(e) => setCustomMeasurements({ ...customMeasurements, [field]: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-800/60 hover:bg-neutral-800 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(5)}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all text-center"
            >
              Continue to 3D Customization &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 5: 3D CUSTOMIZATION & APPLY CHANGES ─────────────────────── */}
      {activeStep === 5 && (
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs">
                5
              </span>
              <span>3D Customization</span>
            </h3>
            <span className="text-xs text-emerald-400 font-mono">Live WebGL</span>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed">
            Verify your genuine 3D garment from all viewing angles in the central viewer.
            Mouse drag or touch drag to rotate 360°, scroll to zoom, and click Apply Changes to commit your design.
          </p>

          <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-400">Garment Color:</span>
              <span className="font-bold text-white">{typeof selectedColor === 'string' ? selectedColor : selectedColor?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Fabric Texture:</span>
              <span className="font-bold text-white">{selectedFabric?.name || 'Cotton'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Text & Graphics:</span>
              <span className="font-bold text-blue-400">
                {customText ? `"${customText}" (${activePlacement})` : uploadedImage ? 'Uploaded Logo' : aiGeneratedDesign ? 'AI Design' : 'Clean / Plain'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Size & Drape:</span>
              <span className="font-bold text-white">{sizeMode === 'standard' ? `${selectedSize} (${selectedFit})` : 'Custom Tailoring'}</span>
            </div>
          </div>

          {/* Primary Action: APPLY CHANGES */}
          <button
            type="button"
            onClick={onApplyChanges}
            disabled={isApplying}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {isApplying ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Applying Changes...</span>
              </>
            ) : (
              <>
                <span>✓</span>
                <span>APPLY CHANGES</span>
              </>
            )}
          </button>

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-800/60 hover:bg-neutral-800 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(6)}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white transition-all text-center"
            >
              Proceed to Preview &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 6: FINAL PREVIEW & CHECKOUT ─────────────────────────────── */}
      {activeStep === 6 && (
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs">
                6
              </span>
              <span>Final Preview & Checkout</span>
            </h3>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-md">
              Ready for Tailoring
            </span>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-850">
              <span className="text-neutral-400 font-medium">Garment Name</span>
              <span className="font-bold text-white">{product?.name}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-neutral-850">
              <span className="text-neutral-400 font-medium">Base Color</span>
              <span className="font-bold flex items-center gap-1.5 text-white">
                <span
                  className="w-3 h-3 rounded-full border border-neutral-600 inline-block"
                  style={{ backgroundColor: typeof selectedColor === 'string' ? selectedColor : selectedColor?.hex }}
                />
                <span>{typeof selectedColor === 'string' ? selectedColor : selectedColor?.name}</span>
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-neutral-850">
              <span className="text-neutral-400 font-medium">Fabric Weave</span>
              <span className="font-bold text-white">{selectedFabric?.name || 'Cotton'}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-neutral-850">
              <span className="text-neutral-400 font-medium">Size Specification</span>
              <span className="font-bold text-white">
                {sizeMode === 'standard' ? `${selectedSize} (${selectedFit})` : 'Custom Tailored'}
              </span>
            </div>
            {customText && (
              <div className="flex justify-between items-center pb-2 border-b border-neutral-850">
                <span className="text-neutral-400 font-medium">Typography</span>
                <span className="font-bold text-blue-400">"{customText}"</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2">
              <span className="text-sm font-bold text-neutral-300">Total Price</span>
              <span className="text-xl font-black text-blue-400">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          {/* Action Buttons: Save Design & Add to Cart */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={onAddToCart}
              disabled={isAddingToCart}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isAddingToCart ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Adding to Cart...</span>
                </>
              ) : (
                <>
                  <span>🛒</span>
                  <span>Add to Cart & Checkout</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onSaveDesign}
              disabled={isSavingDesign}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/60 transition-colors flex items-center justify-center gap-2"
            >
              <span>💾</span>
              <span>{isSavingDesign ? 'Saving...' : 'Save Design for Later'}</span>
            </button>
          </div>

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setActiveStep(5)}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-800/60 hover:bg-neutral-800 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(7)}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-neutral-850 hover:bg-neutral-800 text-neutral-300 transition-all text-center"
            >
              Optional Luxury Extras &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 7: ADDITIONAL FEATURES (PERFUME & CARE) ──────────────────── */}
      {activeStep === 7 && (
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs">
                7
              </span>
              <span>Additional Luxury Features</span>
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Signature Perfume Pairing
            </label>
            <div className="space-y-2">
              {MASTER_PERFUMES.slice(0, 3).map((perf) => {
                const isSelected = selectedPerfume?.id === perf.id;
                return (
                  <button
                    key={perf.id}
                    type="button"
                    onClick={() => setSelectedPerfume(isSelected ? null : perf)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500/70 text-white'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{perf.name}</p>
                      <p className="text-[10px] text-neutral-400">{perf.fragranceFamily} &bull; {perf.notes}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-400 ml-2">
                      {perf.price === 0 ? 'Included' : `+${formatPrice(perf.price)}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5 text-xs text-neutral-400">
            <p className="font-bold text-neutral-200">Bespoke Quality Assurance</p>
            <p className="text-[11px] leading-relaxed">
              Every custom FITFUSION piece is hand-tailored, precision-printed, and individually inspected.
              Complimentary alteration warranty included on bespoke orders.
            </p>
          </div>

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setActiveStep(6)}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-800/60 hover:bg-neutral-800 transition-colors"
            >
              Back to Checkout
            </button>
            <button
              type="button"
              onClick={onAddToCart}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all text-center"
            >
              Add to Cart & Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
