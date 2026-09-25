import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import { MOCK_PRODUCTS } from '../../data/mockProducts.js';

const CUSTOMIZATION_STEPS = [
  { id: 1, title: "Fabric", description: "Select certified textile swatches and material weave." },
  { id: 2, title: "Color", description: "Choose rich colorways, pinstripes, and check patterns." },
  { id: 3, title: "Design", description: "Customize collar, cuff styles, buttons, and monograms." },
  { id: 4, title: "Size", description: "Pick standard sizes or opt for bespoke custom measurements." },
  { id: 5, title: "Custom Measurements", description: "Input neck, chest, waist, and sleeve tailoring metrics." },
  { id: 6, title: "Fit", description: "Specify silhouette drape: Slim, Regular, or Relaxed fit." },
  { id: 7, title: "Perfume", description: "Discover luxury fragrance pairings suited to this garment." },
  { id: 8, title: "Preview", description: "Inspect interactive composite preview before adding to cart." }
];

const COLLAR_OPTIONS = [
  { id: "Classic", title: "Classic", desc: "Timeless medium-spread collar suitable for any tie or open-neck look." },
  { id: "Spread", title: "Spread", desc: "Wider flared points offering a modern European cutaway aesthetic." },
  { id: "Mandarin", title: "Mandarin", desc: "Minimalist band collar for clean, contemporary architectural style." },
  { id: "Button Down", title: "Button Down", desc: "Structured roll-point collar with anchor buttons for smart casual." }
];

const CUFF_OPTIONS = [
  { id: "Standard", title: "Standard", desc: "Single-button barrel cuff designed for versatile daily sophistication." },
  { id: "French", title: "French", desc: "Double fold-back cuff designed for heirloom cufflinks on formal occasions." },
  { id: "Rounded", title: "Rounded", desc: "Subtly contoured barrel cuff providing sleek comfort at the wrists." }
];

const BUTTON_OPTIONS = [
  { id: "Standard", title: "Standard Horn", desc: "Classic polished resin horn buttons with natural tonal finish.", color: "#4B5563" },
  { id: "Matte Black", title: "Matte Black", desc: "Contemporary satin dark finish with subtle muted luster.", color: "#18181B" },
  { id: "Pearl", title: "Mother of Pearl", desc: "Iridescent natural shell sheen for refined luxury tailoring.", color: "#F3F4F6", border: true },
  { id: "Brass", title: "Antique Brass", desc: "Vintage burnished metallic buttons with artisanal patina.", color: "#B45309" }
];

const FIT_OPTIONS = [
  {
    id: "Slim",
    title: "Slim Fit",
    badge: "Modern Contour",
    desc: "Tapered cut close through chest, waist, and sleeves for a sharp, streamlined modern silhouette."
  },
  {
    id: "Regular",
    title: "Regular Fit",
    badge: "Tailor's Choice",
    desc: "Classic tailored proportion with balanced ease for comfortable movement and clean drape."
  },
  {
    id: "Relaxed",
    title: "Relaxed Fit",
    badge: "Casual Comfort",
    desc: "Generously cut silhouette with extra ease through the chest and torso for casual elegance."
  }
];

const MEASUREMENT_FIELDS = [
  { key: "neck", label: "Neck Circumference", guide: "Measure around base of neck where collar sits", placeholder: "15.5" },
  { key: "chest", label: "Chest Width", guide: "Measure around fullest part of chest under armpits", placeholder: "40.0" },
  { key: "waist", label: "Waist Line", guide: "Measure around natural waistline above hip bone", placeholder: "34.0" },
  { key: "shoulder", label: "Shoulder Span", guide: "Measure from shoulder point across back to opposite point", placeholder: "18.0" },
  { key: "sleeve", label: "Sleeve Length", guide: "Measure from shoulder seam along arm to wrist bone", placeholder: "25.5" },
  { key: "length", label: "Garment Length", guide: "Measure from base of collar down to desired hemline", placeholder: "30.0" }
];

export default function CustomizePage() {
  const { id } = useParams();
  const product = MOCK_PRODUCTS.find((p) => p.id === id) || MOCK_PRODUCTS[0];

  const availableFabrics = product?.availableFabrics || [];
  const availableColors = product?.availableColors || [];
  const availableSizes = product?.availableSizes || ["S", "M", "L", "XL", "Custom Tailored"];

  // Step state
  const [activeStep, setActiveStep] = useState(1);

  // Customization selections
  const [selectedFabric, setSelectedFabric] = useState(availableFabrics[0] || null);
  const [selectedColor, setSelectedColor] = useState(availableColors[0] || null);
  const [selectedSize, setSelectedSize] = useState(availableSizes[0] || 'M');
  const [selectedFit, setSelectedFit] = useState('Regular');

  // Garment design options
  const [designOptions, setDesignOptions] = useState({
    collar: 'Classic',
    cuff: 'Standard',
    buttons: 'Standard',
    monogram: ''
  });

  // Custom bespoke measurements
  const [measurementUnit, setMeasurementUnit] = useState('in');
  const [customMeasurements, setCustomMeasurements] = useState({
    neck: '',
    chest: '',
    waist: '',
    shoulder: '',
    sleeve: '',
    length: ''
  });

  // Synchronize defaults if product changes
  useEffect(() => {
    if (product) {
      setSelectedFabric(product.availableFabrics?.[0] || null);
      setSelectedColor(product.availableColors?.[0] || null);
      setSelectedSize(product.availableSizes?.[0] || 'M');
      setSelectedFit('Regular');
    }
  }, [product?.id]);

  const currentStepInfo = CUSTOMIZATION_STEPS.find((s) => s.id === activeStep) || CUSTOMIZATION_STEPS[0];

  const isCustomTailored = selectedSize === "Custom Tailored";

  // Handle measurement input changes with positive number validation
  const handleMeasurementChange = (field, value) => {
    if (value === '') {
      setCustomMeasurements((prev) => ({ ...prev, [field]: '' }));
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setCustomMeasurements((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Check if any measurement has been filled
  const hasMeasurements = Object.values(customMeasurements).some((v) => v !== '');

  return (
    <div className="py-8 sm:py-12 bg-brand-cream min-h-screen">
      <PageContainer>
        {/* Top Header bar with product overview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-neutral-200 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1.5">
              <Link to="/shop" className="hover:text-brand-dark transition-colors">&larr; Back to Shop</Link>
              <span>/</span>
              <Link to={`/product/${product.id}`} className="hover:text-brand-dark transition-colors">{product.name}</Link>
              <span>/</span>
              <span className="text-brand-accent font-semibold">Customization Engine</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
                Customize: {product.name}
              </h1>
              <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-accentLight text-brand-accent border border-brand-accent/20">
                {product.category}
              </span>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200/80 shadow-sm flex items-center gap-6">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Base Price
              </div>
              <div className="text-xl font-extrabold text-brand-dark">
                ${product.basePrice}
              </div>
            </div>
            <div className="border-l border-neutral-200 pl-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Customization
              </div>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <span>&#10003;</span> Included
              </div>
            </div>
          </div>
        </div>

        {/* 8-Step Stepper Progress Bar */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Phase 3 &bull; Customization Engine
            </span>
            <span className="text-xs font-semibold text-neutral-600">
              Step {activeStep} of {CUSTOMIZATION_STEPS.length}: <strong className="text-brand-dark">{currentStepInfo.title}</strong>
            </span>
          </div>

          {/* Stepper Navigation Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {CUSTOMIZATION_STEPS.map((step) => {
              const isActive = activeStep === step.id;
              const isPast = step.id < activeStep;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all duration-150 ${
                    isActive
                      ? 'border-brand-accent bg-brand-accentLight/60 ring-2 ring-brand-accent shadow-sm'
                      : isPast
                      ? 'border-neutral-300 bg-neutral-100/80 text-neutral-700 hover:bg-neutral-100'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-400 hover:bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-brand-accent text-white'
                          : isPast
                          ? 'bg-neutral-700 text-white'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {step.id}
                    </span>
                    {isPast && (
                      <span className="text-brand-accent text-xs font-bold">&#10003;</span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-brand-dark mt-1.5 truncate">
                    {step.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Layout: Configurator (Left 8 cols) + Real-Time Summary (Right 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Step Configurator Panel */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Step Header */}
            <div className="border-b border-neutral-100 pb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-accent bg-brand-accentLight px-2 py-0.5 rounded">
                  Section {activeStep}
                </span>
                <span className="text-xs text-neutral-400">&bull;</span>
                <span className="text-xs text-neutral-500 font-medium">Bespoke Options</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-brand-dark">
                {currentStepInfo.title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                {currentStepInfo.description}
              </p>
            </div>

            {/* STEP 1: FABRIC SELECTION */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                    Select Material Weave ({availableFabrics.length} Available)
                  </label>
                  <span className="text-xs text-neutral-500 font-medium">
                    Current: <strong className="text-brand-dark">{selectedFabric?.name || 'None selected'}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {availableFabrics.map((fabric) => {
                    const isSelected = selectedFabric?.name === fabric.name;
                    return (
                      <button
                        key={fabric.name}
                        type="button"
                        onClick={() => setSelectedFabric(fabric)}
                        className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between h-full ${
                          isSelected
                            ? 'border-brand-accent bg-brand-accentLight/50 ring-2 ring-brand-accent shadow-sm'
                            : 'border-neutral-200 bg-neutral-50 hover:bg-white hover:border-neutral-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="w-8 h-8 rounded-lg bg-neutral-200/80 flex items-center justify-center text-xs font-bold text-neutral-700">
                              🧵
                            </span>
                            {isSelected && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-accent text-white">
                                Selected &#10003;
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-sm text-brand-dark">
                            {fabric.name}
                          </div>
                          <div className="text-xs text-neutral-500 mt-1">
                            {fabric.composition}
                          </div>
                        </div>

                        <div className="mt-4 pt-2.5 border-t border-neutral-200/60 flex items-center justify-between text-[11px] text-neutral-600">
                          <span className="font-medium text-brand-accent">Certified Textile</span>
                          <span>Grade A</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: COLOR SELECTION */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                    Available Palette Swatches
                  </label>
                  <span className="text-xs text-neutral-500 font-medium">
                    Selected: <strong className="text-brand-dark">{selectedColor?.name || 'None selected'}</strong>
                  </span>
                </div>

                {/* Visual Swatches Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {availableColors.map((color) => {
                    const isSelected = selectedColor?.name === color.name;
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-3 ${
                          isSelected
                            ? 'border-brand-accent bg-brand-accentLight/40 ring-2 ring-brand-accent shadow-sm'
                            : 'border-neutral-200 bg-neutral-50 hover:bg-white hover:border-neutral-300'
                        }`}
                      >
                        <div className="relative">
                          <span
                            style={{ backgroundColor: color.hex }}
                            className="block w-12 h-12 rounded-full border-2 border-neutral-300 shadow-inner"
                          />
                          {isSelected && (
                            <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow font-bold text-base">
                              &#10003;
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-brand-dark">
                            {color.name}
                          </div>
                          <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                            {color.hex}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Banner showing active color preview */}
                {selectedColor && (
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-4">
                    <span
                      style={{ backgroundColor: selectedColor.hex }}
                      className="w-10 h-10 rounded-lg border border-neutral-300 shadow-sm shrink-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-brand-dark">
                        Active Dye: {selectedColor.name}
                      </div>
                      <div className="text-xs text-neutral-500">
                        Color-fast dye with premium hue vibrancy and wash resistance.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: DESIGN SELECTION */}
            {activeStep === 3 && (
              <div className="space-y-6">
                {/* 1. Collar Style */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                      1. Collar Architecture
                    </label>
                    <span className="text-xs font-semibold text-brand-accent">
                      {designOptions.collar}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {COLLAR_OPTIONS.map((col) => {
                      const isSelected = designOptions.collar === col.id;
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => setDesignOptions((prev) => ({ ...prev, collar: col.id }))}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-brand-accent bg-brand-accentLight/60 ring-2 ring-brand-accent'
                              : 'border-neutral-200 bg-neutral-50 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-brand-dark">{col.title}</span>
                            {isSelected && <span className="text-brand-accent text-xs font-bold">&#10003;</span>}
                          </div>
                          <p className="text-xs text-neutral-600 leading-relaxed">{col.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Cuff Style */}
                <div className="space-y-3 pt-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                      2. Cuff Architecture
                    </label>
                    <span className="text-xs font-semibold text-brand-accent">
                      {designOptions.cuff}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {CUFF_OPTIONS.map((cuff) => {
                      const isSelected = designOptions.cuff === cuff.id;
                      return (
                        <button
                          key={cuff.id}
                          type="button"
                          onClick={() => setDesignOptions((prev) => ({ ...prev, cuff: cuff.id }))}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-brand-accent bg-brand-accentLight/60 ring-2 ring-brand-accent'
                              : 'border-neutral-200 bg-neutral-50 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-brand-dark">{cuff.title}</span>
                            {isSelected && <span className="text-brand-accent text-xs font-bold">&#10003;</span>}
                          </div>
                          <p className="text-xs text-neutral-600 leading-relaxed">{cuff.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Button Finishes */}
                <div className="space-y-3 pt-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                      3. Buttons & Hardware
                    </label>
                    <span className="text-xs font-semibold text-brand-accent">
                      {designOptions.buttons}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BUTTON_OPTIONS.map((btn) => {
                      const isSelected = designOptions.buttons === btn.id;
                      return (
                        <button
                          key={btn.id}
                          type="button"
                          onClick={() => setDesignOptions((prev) => ({ ...prev, buttons: btn.id }))}
                          className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                            isSelected
                              ? 'border-brand-accent bg-brand-accentLight/60 ring-2 ring-brand-accent'
                              : 'border-neutral-200 bg-neutral-50 hover:bg-white'
                          }`}
                        >
                          <span
                            style={{ backgroundColor: btn.color }}
                            className={`w-6 h-6 rounded-full shrink-0 mt-0.5 shadow-sm ${
                              btn.border ? 'border border-neutral-300' : ''
                            }`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-brand-dark">{btn.title}</span>
                              {isSelected && <span className="text-brand-accent text-xs font-bold">&#10003;</span>}
                            </div>
                            <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">{btn.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Monogram Personalization */}
                <div className="space-y-3 pt-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                      4. Bespoke Monogram (Optional)
                    </label>
                    <span className="text-xs text-neutral-500">
                      {designOptions.monogram.length}/12 characters
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="relative flex-1 w-full">
                      <input
                        type="text"
                        maxLength={12}
                        value={designOptions.monogram}
                        onChange={(e) => setDesignOptions((prev) => ({ ...prev, monogram: e.target.value }))}
                        placeholder="e.g. J.D. or FIT"
                        className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm text-brand-dark uppercase tracking-widest placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
                      />
                      {designOptions.monogram && (
                        <button
                          type="button"
                          onClick={() => setDesignOptions((prev) => ({ ...prev, monogram: '' }))}
                          className="absolute right-3 top-2.5 text-xs text-neutral-400 hover:text-neutral-600"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Monogram Live Preview Plaque */}
                    <div className="px-4 py-2 rounded-lg bg-neutral-900 text-amber-200 text-xs font-serif tracking-widest border border-amber-300/30 flex items-center gap-2 shrink-0">
                      <span>🧵 Plaque:</span>
                      <strong className="tracking-widest">
                        {designOptions.monogram ? designOptions.monogram : "NO MONOGRAM"}
                      </strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Hand-stitched onto cuff or chest placket in tone-on-tone embroidery thread.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 4: SIZE SELECTION */}
            {activeStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                    Available Sizing Dimensions
                  </label>
                  <span className="text-xs text-neutral-500 font-medium">
                    Selected: <strong className="text-brand-dark">{selectedSize}</strong>
                  </span>
                </div>

                {/* Sizing Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availableSizes.map((size) => {
                    const isSelected = selectedSize === size;
                    const isBespoke = size === "Custom Tailored";

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`p-4 rounded-xl border text-center transition-all ${
                          isBespoke ? 'col-span-2 sm:col-span-2' : ''
                        } ${
                          isSelected
                            ? 'border-brand-dark bg-brand-dark text-white shadow-md ring-2 ring-brand-dark/20'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-white hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-extrabold text-sm sm:text-base">
                            {size}
                          </span>
                          {isBespoke && (
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-amber-400 text-neutral-900' : 'bg-brand-accentLight text-brand-accent'
                            }`}>
                              Bespoke
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] mt-1 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          {isBespoke ? 'Personalized body metrics in Step 5' : 'Standard off-the-rack sizing'}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Notice based on chosen size */}
                {isCustomTailored ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>✨</span> Bespoke Custom Tailored Active
                    </div>
                    <p className="text-amber-800">
                      Step 5 (Custom Measurements) will prompt you for your precise neck, chest, waist, and sleeve specifications.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600">
                    Standard size <strong>{selectedSize}</strong> selected. If you have unique body proportions, you may also specify custom measurements in Step 5.
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: CUSTOM MEASUREMENTS */}
            {activeStep === 5 && (
              <div className="space-y-6">
                {/* Status Callout */}
                {isCustomTailored ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                    <span className="text-base">📐</span>
                    <div>
                      <strong className="block font-bold">Bespoke Custom Tailored is Active</strong>
                      <span>Please enter your body measurements below. Measurements are tailored to precision within 1/8th inch.</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 flex items-start justify-between gap-4">
                    <div>
                      <strong className="block text-brand-dark mb-0.5">Standard Size ({selectedSize}) Selected</strong>
                      <span>Entering measurements below is optional for minor adjustments, or you can switch to "Custom Tailored" in Step 4.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSize("Custom Tailored");
                      }}
                      className="text-brand-accent hover:underline font-bold text-xs shrink-0"
                    >
                      Switch to Bespoke &rarr;
                    </button>
                  </div>
                )}

                {/* Unit Switcher */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                    Measurement Units
                  </span>
                  <div className="flex items-center p-1 rounded-lg bg-neutral-100 border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setMeasurementUnit('in')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                        measurementUnit === 'in'
                          ? 'bg-white text-brand-dark shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      Inches (in)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMeasurementUnit('cm')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                        measurementUnit === 'cm'
                          ? 'bg-white text-brand-dark shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      Centimeters (cm)
                    </button>
                  </div>
                </div>

                {/* 6 Metric Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MEASUREMENT_FIELDS.map((field) => (
                    <div key={field.key} className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor={`metric-${field.key}`}
                          className="text-xs font-bold uppercase tracking-wider text-brand-dark"
                        >
                          {field.label} {isCustomTailored && <span className="text-amber-600">*</span>}
                        </label>
                        <span className="text-[11px] font-semibold text-neutral-400 uppercase">
                          {measurementUnit}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          id={`metric-${field.key}`}
                          type="number"
                          min="0"
                          step="0.25"
                          placeholder={field.placeholder}
                          value={customMeasurements[field.key]}
                          onChange={(e) => handleMeasurementChange(field.key, e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 bg-white text-sm font-semibold text-brand-dark placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
                        />
                        <span className="absolute right-3 top-2 text-xs font-semibold text-neutral-400">
                          {measurementUnit}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-tight">
                        {field.guide}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Measurement summary status */}
                <div className="p-3 rounded-lg bg-white border border-neutral-200 text-xs text-neutral-500 flex items-center justify-between">
                  <span>
                    Metrics status:{' '}
                    <strong className="text-brand-dark">
                      {hasMeasurements ? 'Custom metrics registered' : 'No measurements recorded'}
                    </strong>
                  </span>
                  {hasMeasurements && (
                    <button
                      type="button"
                      onClick={() =>
                        setCustomMeasurements({
                          neck: '',
                          chest: '',
                          waist: '',
                          shoulder: '',
                          sleeve: '',
                          length: ''
                        })
                      }
                      className="text-xs text-red-500 hover:underline font-medium"
                    >
                      Reset all fields
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 6: FIT SILHOUETTE */}
            {activeStep === 6 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                    Silhouette Drape & Ease
                  </label>
                  <span className="text-xs text-neutral-500 font-medium">
                    Current Fit: <strong className="text-brand-dark">{selectedFit}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {FIT_OPTIONS.map((fit) => {
                    const isSelected = selectedFit === fit.id;

                    return (
                      <button
                        key={fit.id}
                        type="button"
                        onClick={() => setSelectedFit(fit.id)}
                        className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between h-full ${
                          isSelected
                            ? 'border-brand-accent bg-brand-accentLight/60 ring-2 ring-brand-accent shadow-sm'
                            : 'border-neutral-200 bg-neutral-50 hover:bg-white hover:border-neutral-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-200/80 text-neutral-700">
                              {fit.badge}
                            </span>
                            {isSelected && (
                              <span className="text-brand-accent text-sm font-bold">&#10003;</span>
                            )}
                          </div>
                          <div className="font-black text-base text-brand-dark mb-1.5">
                            {fit.title}
                          </div>
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            {fit.desc}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-200/60 text-[11px] font-semibold text-brand-accent">
                          {isSelected ? 'Active Silhouette' : 'Click to select'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 7: PERFUME (Phase 4 Placeholder - Preserved cleanly) */}
            {activeStep === 7 && (
              <div className="space-y-6 text-center py-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-brand-accentLight flex items-center justify-center border border-brand-accent/30 text-2xl">
                  🧴
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                    Olfactory Curation
                  </span>
                  <h3 className="text-xl font-bold text-brand-dark">
                    Luxury Fragrance Pairing
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600">
                    In Phase 4, FITFUSION will introduce AI-powered perfume recommendations paired directly to your selected {selectedFabric?.name || 'fabric'} and {selectedColor?.name || 'color'} mood.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-left max-w-md mx-auto space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Phase 4 Feature Preview
                  </div>
                  <p className="text-xs text-amber-800">
                    Fragrance profiles (Citrus, Amber, Woody, Fresh Aquatics) will be fully interactive in Phase 4.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 8: PREVIEW (Phase 4 Placeholder - Preserved cleanly) */}
            {activeStep === 8 && (
              <div className="space-y-6 text-center py-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-brand-accentLight flex items-center justify-center border border-brand-accent/30 text-2xl">
                  👔
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                    Final Preview Stage
                  </span>
                  <h3 className="text-xl font-bold text-brand-dark">
                    Composite Render Architecture
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600">
                    In Phase 4, the real-time 3D rendered mannequin and high-definition cloth simulation canvas will be rendered here.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-left max-w-md mx-auto space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Phase 3 Customization Specifications Ready
                  </div>
                  <p className="text-xs text-emerald-800">
                    All your customization selections have been recorded in the live engine state. Review the summary card on the right.
                  </p>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-neutral-100 gap-3">
              <Button
                variant="outline"
                size="md"
                disabled={activeStep === 1}
                onClick={() => setActiveStep((prev) => Math.max(prev - 1, 1))}
              >
                &larr; Previous Step
              </Button>

              <div className="text-xs text-neutral-500 hidden sm:block">
                Step {activeStep} of {CUSTOMIZATION_STEPS.length}
              </div>

              {activeStep < CUSTOMIZATION_STEPS.length ? (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setActiveStep((prev) => Math.min(prev + 1, CUSTOMIZATION_STEPS.length))}
                >
                  Next: {CUSTOMIZATION_STEPS[activeStep]?.title} &rarr;
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  to="/cart"
                >
                  Proceed to Cart &rarr;
                </Button>
              )}
            </div>
          </div>

          {/* Right Column: Live Customization Summary Section */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">
                  Live Customization
                </span>
                <h3 className="text-lg font-black text-brand-dark">
                  Summary & Specs
                </h3>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Live Sync Active" />
            </div>

            {/* Selected Spec List */}
            <div className="space-y-4 text-xs">
              {/* 1. Fabric */}
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/70 space-y-1">
                <div className="flex items-center justify-between text-neutral-500 font-semibold uppercase text-[10px]">
                  <span>1. Fabric</span>
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="text-brand-accent hover:underline lowercase font-medium"
                  >
                    edit
                  </button>
                </div>
                <div className="font-bold text-brand-dark text-sm">
                  {selectedFabric?.name || 'Standard Cotton'}
                </div>
                <div className="text-neutral-500 text-[11px]">
                  {selectedFabric?.composition || '100% Cotton'}
                </div>
              </div>

              {/* 2. Color */}
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/70 space-y-1">
                <div className="flex items-center justify-between text-neutral-500 font-semibold uppercase text-[10px]">
                  <span>2. Color</span>
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="text-brand-accent hover:underline lowercase font-medium"
                  >
                    edit
                  </button>
                </div>
                <div className="flex items-center gap-2.5">
                  <span
                    style={{ backgroundColor: selectedColor?.hex || '#171717' }}
                    className="w-4 h-4 rounded-full border border-neutral-300 shadow-xs"
                  />
                  <span className="font-bold text-brand-dark text-sm">
                    {selectedColor?.name || 'Default'}
                  </span>
                </div>
              </div>

              {/* 3. Design Options */}
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-neutral-500 font-semibold uppercase text-[10px]">
                  <span>3. Design Architecture</span>
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="text-brand-accent hover:underline lowercase font-medium"
                  >
                    edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-neutral-700">
                  <div>Collar: <strong className="text-brand-dark">{designOptions.collar}</strong></div>
                  <div>Cuff: <strong className="text-brand-dark">{designOptions.cuff}</strong></div>
                  <div>Buttons: <strong className="text-brand-dark">{designOptions.buttons}</strong></div>
                  <div>
                    Monogram:{' '}
                    <strong className="text-brand-dark">
                      {designOptions.monogram ? `"${designOptions.monogram}"` : 'None'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 4. Size & Custom Measurements */}
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-neutral-500 font-semibold uppercase text-[10px]">
                  <span>4 & 5. Size & Measurements</span>
                  <button
                    type="button"
                    onClick={() => setActiveStep(4)}
                    className="text-brand-accent hover:underline lowercase font-medium"
                  >
                    edit
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-dark text-sm">
                    {selectedSize}
                  </span>
                  {isCustomTailored && (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      Bespoke
                    </span>
                  )}
                </div>

                {hasMeasurements ? (
                  <div className="pt-1.5 border-t border-neutral-200 text-[11px] text-neutral-600 grid grid-cols-2 gap-1">
                    {customMeasurements.neck && <div>Neck: {customMeasurements.neck} {measurementUnit}</div>}
                    {customMeasurements.chest && <div>Chest: {customMeasurements.chest} {measurementUnit}</div>}
                    {customMeasurements.waist && <div>Waist: {customMeasurements.waist} {measurementUnit}</div>}
                    {customMeasurements.shoulder && <div>Shoulder: {customMeasurements.shoulder} {measurementUnit}</div>}
                    {customMeasurements.sleeve && <div>Sleeve: {customMeasurements.sleeve} {measurementUnit}</div>}
                    {customMeasurements.length && <div>Length: {customMeasurements.length} {measurementUnit}</div>}
                  </div>
                ) : (
                  <div className="text-[11px] text-neutral-400">
                    Standard garment calibration
                  </div>
                )}
              </div>

              {/* 5. Fit */}
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/70 space-y-1">
                <div className="flex items-center justify-between text-neutral-500 font-semibold uppercase text-[10px]">
                  <span>6. Fit Silhouette</span>
                  <button
                    type="button"
                    onClick={() => setActiveStep(6)}
                    className="text-brand-accent hover:underline lowercase font-medium"
                  >
                    edit
                  </button>
                </div>
                <div className="font-bold text-brand-dark text-sm">
                  {selectedFit} Fit
                </div>
                <div className="text-neutral-500 text-[11px]">
                  {FIT_OPTIONS.find((f) => f.id === selectedFit)?.badge || 'Custom Drape'}
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="pt-4 border-t border-neutral-100 space-y-2 text-xs">
              <div className="flex justify-between items-center text-neutral-600">
                <span>Base Garment Price:</span>
                <span className="font-semibold text-brand-dark">${product.basePrice}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>Customization Engine:</span>
                <span className="font-semibold text-emerald-600">Included</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-neutral-200 text-sm font-extrabold text-brand-dark">
                <span>Estimated Total:</span>
                <span className="text-base text-brand-dark">${product.basePrice}</span>
              </div>
            </div>

            {/* Quality Commitment Badges */}
            <div className="pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2 text-[10px] text-neutral-500">
              <div className="flex items-center gap-1.5">
                <span className="text-brand-accent font-bold">&#10003;</span> Master Tailored
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-brand-accent font-bold">&#10003;</span> Fit Guaranteed
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
