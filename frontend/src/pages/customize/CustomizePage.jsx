import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
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
    badge: "Casual Ease",
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

export const MOCK_PERFUMES = [
  {
    id: "p1",
    name: "Bergamot & Sea Salt",
    brand: "Atelier Riviera",
    fragranceFamily: "Citrus",
    description: "Crisp Italian bergamot infused with coastal sea breeze and sun-drenched neroli for a vibrant, uplifting trail.",
    price: 38,
    suitableOccasion: "Daytime Casual & Summer Resort",
    accentColor: "#F59E0B",
    icon: "🍋",
    tags: ["Citrus", "Daytime", "Cotton", "Linen", "Shirts", "T-Shirts"]
  },
  {
    id: "p2",
    name: "Smoked Cedar & Vetiver",
    brand: "Maison d'Artisan",
    fragranceFamily: "Woody",
    description: "Deep Virginian cedarwood anchored by earthy bourbon vetiver and subtle cracked black pepper notes.",
    price: 45,
    suitableOccasion: "Boardroom Formal & Evening Soirée",
    accentColor: "#78350F",
    icon: "🌲",
    tags: ["Woody", "Formal", "Evening", "Wool", "Denim", "Jackets", "Shirts"]
  },
  {
    id: "p3",
    name: "Velvet Amber & Cardamom",
    brand: "Sultana Botanicals",
    fragranceFamily: "Oriental",
    description: "Warm golden resinous amber layered with spiced Guatemalan cardamom and creamy bourbon vanilla undertones.",
    price: 52,
    suitableOccasion: "Evening Black-Tie & Autumn Occasions",
    accentColor: "#9A3412",
    icon: "✨",
    tags: ["Oriental", "Evening", "Silk", "Traditional Wear", "Jackets", "Dresses"]
  },
  {
    id: "p4",
    name: "White Iris & Cashmere",
    brand: "L'Ombre Blanche",
    fragranceFamily: "Floral",
    description: "Powdery Florentine orris blended with soft white musk and delicate morning dew petals for quiet sophistication.",
    price: 42,
    suitableOccasion: "Smart Casual & Spring Afternoons",
    accentColor: "#8B5CF6",
    icon: "🌸",
    tags: ["Floral", "Soft", "Silk", "Cotton", "Dresses", "Relaxed"]
  },
  {
    id: "p5",
    name: "Alpine Mist & Juniper",
    brand: "Nordic Atelier",
    fragranceFamily: "Fresh",
    description: "Invigorating glacial water accord with crushed wild juniper berries, mint leaf, and sheer white birch.",
    price: 36,
    suitableOccasion: "Athletic Minimal & Weekend Leisure",
    accentColor: "#0284C7",
    icon: "🌿",
    tags: ["Fresh", "Casual", "Daytime", "T-Shirts", "Hoodies", "Jeans/Pants"]
  },
  {
    id: "p6",
    name: "Royal Oud & Dark Leather",
    brand: "Heritage Parfums",
    fragranceFamily: "Woody",
    description: "Opulent aged Cambodian agarwood softened by hand-buffed saddle leather notes and dark tonka bean.",
    price: 60,
    suitableOccasion: "Gala & Bespoke Evenings",
    accentColor: "#171717",
    icon: "👑",
    tags: ["Woody", "Oriental", "Evening", "Jackets", "Traditional Wear", "Luxury"]
  }
];

// Recommendation logic based on clothing selections
function getRecommendedPerfumes(product, selectedFabric, selectedColor) {
  const scores = MOCK_PERFUMES.map((perfume) => {
    let score = 0;
    const cat = product?.category || '';
    const fab = selectedFabric?.name?.toLowerCase() || '';
    const col = selectedColor?.name?.toLowerCase() || '';

    // Category affinity
    if (perfume.tags.includes(cat)) score += 3;

    // Fabric affinity
    if (fab.includes('linen') || fab.includes('cotton') || fab.includes('jersey')) {
      if (perfume.fragranceFamily === 'Citrus' || perfume.fragranceFamily === 'Fresh') score += 2;
    }
    if (fab.includes('wool') || fab.includes('denim')) {
      if (perfume.fragranceFamily === 'Woody') score += 3;
    }
    if (fab.includes('silk') || fab.includes('khadi')) {
      if (perfume.fragranceFamily === 'Floral' || perfume.fragranceFamily === 'Oriental') score += 3;
    }

    // Color affinity
    if (col.includes('black') || col.includes('navy') || col.includes('charcoal') || col.includes('dark') || col.includes('crimson')) {
      if (perfume.fragranceFamily === 'Woody' || perfume.fragranceFamily === 'Oriental') score += 2;
    }
    if (col.includes('white') || col.includes('blue') || col.includes('sand') || col.includes('mist') || col.includes('gold')) {
      if (perfume.fragranceFamily === 'Citrus' || perfume.fragranceFamily === 'Fresh' || perfume.fragranceFamily === 'Floral') score += 2;
    }

    return { perfume, score };
  });

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, 3).map((s) => s.perfume);
}

export default function CustomizePage() {
  const { id } = useParams();
  const product = MOCK_PRODUCTS.find((p) => p.id === id) || MOCK_PRODUCTS[0];

  const availableFabrics = product?.availableFabrics || [];
  const availableColors = product?.availableColors || [];
  const availableSizes = product?.availableSizes || ["S", "M", "L", "XL", "Custom Tailored"];

  // Navigation step state
  const [activeStep, setActiveStep] = useState(1);

  // Customization selections (Phase 3)
  const [selectedFabric, setSelectedFabric] = useState(availableFabrics[0] || null);
  const [selectedColor, setSelectedColor] = useState(availableColors[0] || null);
  const [selectedSize, setSelectedSize] = useState(availableSizes[0] || 'M');
  const [selectedFit, setSelectedFit] = useState('Regular');

  // Garment design options (Phase 3)
  const [designOptions, setDesignOptions] = useState({
    collar: 'Classic',
    cuff: 'Standard',
    buttons: 'Standard',
    monogram: ''
  });

  // Custom measurements (Phase 3)
  const [measurementUnit, setMeasurementUnit] = useState('in');
  const [customMeasurements, setCustomMeasurements] = useState({
    neck: '',
    chest: '',
    waist: '',
    shoulder: '',
    sleeve: '',
    length: ''
  });

  // Perfume selection state (Phase 4: null means "No Perfume" / ₹0 additional cost)
  const [selectedPerfume, setSelectedPerfume] = useState(null);

  // Synchronize defaults if product changes
  useEffect(() => {
    if (location.state?.editConfig) {
      const cfg = location.state.editConfig;
      if (cfg.selectedFabric) setSelectedFabric(cfg.selectedFabric);
      if (cfg.selectedColor) setSelectedColor(cfg.selectedColor);
      if (cfg.size) setSelectedSize(cfg.size);
      if (cfg.fit) setSelectedFit(cfg.fit);
      if (cfg.designOptions) setDesignOptions(cfg.designOptions);
      if (cfg.customMeasurements) setCustomMeasurements(cfg.customMeasurements);
      if (cfg.measurementUnit) setMeasurementUnit(cfg.measurementUnit);
      if (cfg.selectedPerfume !== undefined) setSelectedPerfume(cfg.selectedPerfume);
      if (location.state.initialStep) setActiveStep(location.state.initialStep);
      return;
    }

    if (product) {
      setSelectedFabric(product.availableFabrics?.[0] || null);
      setSelectedColor(product.availableColors?.[0] || null);
      setSelectedSize(product.availableSizes?.[0] || 'M');
      setSelectedFit('Regular');
      setSelectedPerfume(null);
    }
  }, [product?.id, location.state]);

  // Dynamic pricing calculation
  const basePrice = product?.basePrice || 0;
  const perfumePrice = selectedPerfume ? selectedPerfume.price : 0;
  const totalPrice = basePrice + perfumePrice;

  const currentStepInfo = CUSTOMIZATION_STEPS.find((s) => s.id === activeStep) || CUSTOMIZATION_STEPS[0];
  const isCustomTailored = selectedSize === "Custom Tailored";

  // Handle Proceed to Cart with complete preserved configuration
  const handleProceedToCart = () => {
    const cartItem = {
      id: `cart-${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      category: product.category,
      productImage: product.images?.[0] || product.image || null,
      silhouetteColor: product.silhouetteColor,
      accentColor: product.accentColor,
      basePrice: basePrice,
      selectedFabric: selectedFabric,
      selectedColor: selectedColor,
      selectedDesign: { ...designOptions },
      designOptions: { ...designOptions },
      collar: designOptions.collar,
      cuff: designOptions.cuff,
      buttons: designOptions.buttons,
      monogram: designOptions.monogram,
      size: selectedSize,
      customMeasurements: { ...customMeasurements },
      measurementUnit: measurementUnit,
      fit: selectedFit,
      selectedPerfume: selectedPerfume,
      perfumePrice: perfumePrice,
      itemPrice: totalPrice,
      totalItemPrice: totalPrice,
      quantity: 1,
      addedAt: new Date().toISOString()
    };

    addToCart(cartItem);
    navigate('/cart');
  };

  // Recommendations calculated dynamically from current clothing choices
  const recommendedPerfumes = useMemo(() => {
    return getRecommendedPerfumes(product, selectedFabric, selectedColor);
  }, [product, selectedFabric, selectedColor]);

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
                Base Garment
              </div>
              <div className="text-base font-bold text-neutral-700">
                ₹{basePrice}
              </div>
            </div>
            {selectedPerfume && (
              <div className="border-l border-neutral-200 pl-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  Perfume
                </div>
                <div className="text-base font-bold text-brand-accent">
                  +₹{perfumePrice}
                </div>
              </div>
            )}
            <div className="border-l border-neutral-200 pl-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Estimated Total
              </div>
              <div className="text-xl font-extrabold text-brand-dark">
                ₹{totalPrice}
              </div>
            </div>
          </div>
        </div>

        {/* 8-Step Stepper Progress Bar */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Bespoke Customization Studio
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

            {/* STEP 7: PERFUME (Phase 4 — Fully Functional Scent Pairing) */}
            {activeStep === 7 && (
              <div className="space-y-6">
                {/* Active Fragrance Selection Banner */}
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-brand-accentLight border border-brand-accent/30 flex items-center justify-center text-lg">
                      {selectedPerfume ? selectedPerfume.icon : '🚫'}
                    </span>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        Current Fragrance Selection
                      </div>
                      <div className="text-sm font-bold text-brand-dark flex items-center gap-2">
                        <span>{selectedPerfume ? `${selectedPerfume.name} by ${selectedPerfume.brand}` : 'No Perfume Selected'}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-accentLight text-brand-accent">
                          {selectedPerfume ? `+₹${selectedPerfume.price}` : '+₹0'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedPerfume && (
                    <button
                      type="button"
                      onClick={() => setSelectedPerfume(null)}
                      className="text-xs font-semibold text-neutral-500 hover:text-red-600 transition-colors self-start sm:self-center"
                    >
                      Clear &bull; Opt for No Perfume
                    </button>
                  )}
                </div>

                {/* Section A: Recommended for your style */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-brand-accent text-base">✨</span>
                    <div>
                      <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider">
                        Recommended For Your Style
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Curated to complement your {selectedFabric?.name || 'fabric'} in {selectedColor?.name || 'color'} ({product.category})
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {recommendedPerfumes.map((perfume) => {
                      const isSelected = selectedPerfume?.id === perfume.id;
                      return (
                        <div
                          key={perfume.id}
                          className={`p-4 rounded-xl border transition-all flex flex-col justify-between relative ${
                            isSelected
                              ? 'border-brand-accent bg-brand-accentLight/50 ring-2 ring-brand-accent shadow-sm'
                              : 'border-amber-200/80 bg-amber-50/30 hover:bg-white hover:border-amber-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1 mb-2">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                                <span>⭐</span> Curated Match
                              </span>
                              <span className="text-xs font-bold text-brand-dark">
                                +₹{perfume.price}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{perfume.icon}</span>
                              <div>
                                <h4 className="font-bold text-sm text-brand-dark leading-tight">
                                  {perfume.name}
                                </h4>
                                <span className="text-[11px] text-neutral-500 italic">
                                  {perfume.brand}
                                </span>
                              </div>
                            </div>

                            <div className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 mb-2">
                              Family: {perfume.fragranceFamily}
                            </div>

                            <p className="text-xs text-neutral-600 line-clamp-3 mb-2 leading-relaxed">
                              {perfume.description}
                            </p>

                            <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                              <span className="font-semibold text-neutral-700">Occasion:</span> {perfume.suitableOccasion}
                            </div>
                          </div>

                          <div className="pt-3 mt-3 border-t border-neutral-200/60">
                            <button
                              type="button"
                              onClick={() => setSelectedPerfume(isSelected ? null : perfume)}
                              className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-brand-accent text-white shadow-sm'
                                  : 'bg-white border border-neutral-300 text-brand-dark hover:bg-neutral-50'
                              }`}
                            >
                              {isSelected ? 'Selected ✓' : 'Select Perfume'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section B: All Fragrance Options & No Perfume Option */}
                <div className="space-y-3 pt-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                      All Artisanal Fragrances ({MOCK_PERFUMES.length} Available)
                    </label>
                    <span className="text-xs text-neutral-500">
                      Fragrance pairing is completely optional
                    </span>
                  </div>

                  {/* "No Perfume" Option Card */}
                  <div
                    onClick={() => setSelectedPerfume(null)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                      selectedPerfume === null
                        ? 'border-brand-dark bg-brand-dark text-white ring-2 ring-brand-dark/20 shadow-sm'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-white text-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        selectedPerfume === null ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        🚫
                      </span>
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          <span>No Perfume (Garment Only)</span>
                          {selectedPerfume === null && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-brand-dark">
                              Active Choice
                            </span>
                          )}
                        </div>
                        <div className={`text-xs ${selectedPerfume === null ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          Receive your tailored cloth without any fragrance pairing. No additional fee.
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-sm font-bold ${selectedPerfume === null ? 'text-emerald-300' : 'text-emerald-600'}`}>
                        +₹0 (Free)
                      </span>
                    </div>
                  </div>

                  {/* Full Grid of All Fragrances */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {MOCK_PERFUMES.map((perfume) => {
                      const isSelected = selectedPerfume?.id === perfume.id;
                      return (
                        <div
                          key={perfume.id}
                          className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-brand-accent bg-brand-accentLight/60 ring-2 ring-brand-accent shadow-sm'
                              : 'border-neutral-200 bg-neutral-50 hover:bg-white'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-200/80 text-neutral-700">
                                {perfume.fragranceFamily}
                              </span>
                              <span className="text-xs font-bold text-brand-dark">
                                +₹{perfume.price}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-lg">{perfume.icon}</span>
                              <div>
                                <h4 className="font-bold text-sm text-brand-dark">
                                  {perfume.name}
                                </h4>
                                <span className="text-xs text-neutral-500 italic">
                                  {perfume.brand}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-neutral-600 leading-relaxed mb-2">
                              {perfume.description}
                            </p>

                            <div className="text-[11px] text-neutral-500">
                              <strong className="text-neutral-700">Occasion:</strong> {perfume.suitableOccasion}
                            </div>
                          </div>

                          <div className="pt-3 mt-3 border-t border-neutral-200/60 flex items-center justify-between">
                            <span className="text-xs font-bold text-brand-dark">
                              ₹{perfume.price} Add-on
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedPerfume(isSelected ? null : perfume)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-brand-accent text-white shadow-sm'
                                  : 'bg-white border border-neutral-300 text-brand-dark hover:bg-neutral-100'
                              }`}
                            >
                              {isSelected ? 'Selected ✓' : 'Select'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 8: PREVIEW (Phase 4 — Complete Composite Garment & Scent Overview) */}
            {activeStep === 8 && (
              <div className="space-y-8">
                {/* Visual Product Preview Card (Step 4 requirement) */}
                <div className={`rounded-2xl bg-gradient-to-br ${product.silhouetteColor || 'from-stone-100 to-amber-50'} p-6 sm:p-8 border border-neutral-300/80 shadow-md relative overflow-hidden`}>
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white text-brand-dark shadow-sm">
                        {product.category}
                      </span>
                      <span className="text-xs font-semibold text-neutral-700 bg-white/90 px-2.5 py-1 rounded-md">
                        Model #{product.id}
                      </span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-accent bg-white/95 px-3 py-1 rounded-full shadow-sm">
                      ✨ Customized Bespoke Edition
                    </span>
                  </div>

                  {/* Centered Garment Stylized Showcase */}
                  <div className="my-6 text-center">
                    <div className="w-48 sm:w-56 mx-auto rounded-2xl bg-white/95 border border-neutral-300/80 shadow-xl flex flex-col items-center justify-center p-6 space-y-3 relative group">
                      <svg
                        className="w-20 h-20 transition-transform group-hover:scale-105 duration-200"
                        style={{ color: selectedColor?.hex || '#1F2937' }}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 3v2m6-2v2M9 5H7a2 2 0 00-2 2v2l2 1v9a2 2 0 002 2h6a2 2 0 002-2v-9l2-1V7a2 2 0 00-2-2h-2m-6 0a2 2 0 002 2h2a2 2 0 002-2m-6 0h6" />
                      </svg>

                      <div className="space-y-1">
                        <div className="text-sm font-black text-brand-dark">
                          {product.name}
                        </div>
                        <div className="text-xs text-neutral-600 flex items-center justify-center gap-1.5">
                          <span
                            style={{ backgroundColor: selectedColor?.hex || '#171717' }}
                            className="w-3 h-3 rounded-full border border-neutral-300 inline-block"
                          />
                          <span>{selectedColor?.name || 'Default'}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 font-medium">
                          {selectedFabric?.name} &bull; {selectedFit} Fit
                        </div>
                      </div>

                      {/* Monogram Badge Overlay if applied */}
                      {designOptions.monogram && (
                        <div className="px-3 py-1 rounded-md bg-neutral-950 text-amber-300 text-[10px] font-serif tracking-widest border border-amber-400/40 shadow-sm">
                          🧵 Monogram: "{designOptions.monogram}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visual Preview Specs Bar */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3.5 border border-neutral-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <div className="text-neutral-500 text-[10px] uppercase font-semibold">Collar & Cuff</div>
                      <div className="font-bold text-brand-dark">{designOptions.collar} / {designOptions.cuff}</div>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-[10px] uppercase font-semibold">Hardware</div>
                      <div className="font-bold text-brand-dark">{designOptions.buttons}</div>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-[10px] uppercase font-semibold">Sizing</div>
                      <div className="font-bold text-brand-dark">{selectedSize} ({selectedFit})</div>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-[10px] uppercase font-semibold">Fragrance</div>
                      <div className="font-bold text-brand-accent truncate">
                        {selectedPerfume ? selectedPerfume.name : 'No Perfume'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comprehensive Specification Breakdown with Edit Buttons (Steps 3, 5, 6) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-brand-dark uppercase tracking-wider">
                      Customization Specifications & Review
                    </h3>
                    <span className="text-xs text-neutral-500">
                      Click "Edit" on any section to adjust
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. Fabric Spec */}
                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                          1. Fabric Selection
                        </div>
                        <div className="font-bold text-brand-dark text-sm">
                          {selectedFabric?.name || 'Standard Weave'}
                        </div>
                        <div className="text-xs text-neutral-600">
                          Composition: {selectedFabric?.composition || '100% Certified Textile'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveStep(1)}
                        className="px-2.5 py-1 rounded-md bg-white border border-neutral-300 text-xs font-semibold text-brand-accent hover:bg-neutral-100 transition-colors shrink-0"
                      >
                        Edit Fabric
                      </button>
                    </div>

                    {/* 2. Color Spec */}
                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                          2. Colorway Dye
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            style={{ backgroundColor: selectedColor?.hex || '#171717' }}
                            className="w-4 h-4 rounded-full border border-neutral-300 inline-block shadow-xs"
                          />
                          <span className="font-bold text-brand-dark text-sm">
                            {selectedColor?.name || 'Default Color'}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-600 font-mono">
                          Hex: {selectedColor?.hex || '#171717'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveStep(2)}
                        className="px-2.5 py-1 rounded-md bg-white border border-neutral-300 text-xs font-semibold text-brand-accent hover:bg-neutral-100 transition-colors shrink-0"
                      >
                        Edit Color
                      </button>
                    </div>

                    {/* 3. Design Spec */}
                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                          3. Garment Architecture
                        </div>
                        <div className="text-xs text-neutral-700 space-y-0.5">
                          <div>Collar: <strong className="text-brand-dark">{designOptions.collar}</strong></div>
                          <div>Cuff: <strong className="text-brand-dark">{designOptions.cuff}</strong></div>
                          <div>Buttons: <strong className="text-brand-dark">{designOptions.buttons}</strong></div>
                          <div>
                            Monogram: <strong className="text-brand-dark">{designOptions.monogram ? `"${designOptions.monogram}"` : 'None'}</strong>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveStep(3)}
                        className="px-2.5 py-1 rounded-md bg-white border border-neutral-300 text-xs font-semibold text-brand-accent hover:bg-neutral-100 transition-colors shrink-0"
                      >
                        Edit Design
                      </button>
                    </div>

                    {/* 4 & 5. Size & Measurements Spec */}
                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                          4 & 5. Sizing & Tailoring Metrics
                        </div>
                        <div className="font-bold text-brand-dark text-sm flex items-center gap-2">
                          <span>{selectedSize}</span>
                          {isCustomTailored && (
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                              Bespoke
                            </span>
                          )}
                        </div>
                        {hasMeasurements ? (
                          <div className="text-[11px] text-neutral-600 grid grid-cols-2 gap-x-2 gap-y-0.5 pt-1">
                            {customMeasurements.neck && <span>Neck: {customMeasurements.neck} {measurementUnit}</span>}
                            {customMeasurements.chest && <span>Chest: {customMeasurements.chest} {measurementUnit}</span>}
                            {customMeasurements.waist && <span>Waist: {customMeasurements.waist} {measurementUnit}</span>}
                            {customMeasurements.shoulder && <span>Shoulder: {customMeasurements.shoulder} {measurementUnit}</span>}
                            {customMeasurements.sleeve && <span>Sleeve: {customMeasurements.sleeve} {measurementUnit}</span>}
                            {customMeasurements.length && <span>Length: {customMeasurements.length} {measurementUnit}</span>}
                          </div>
                        ) : (
                          <div className="text-xs text-neutral-500">
                            Standard off-the-rack dimensions
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setActiveStep(4)}
                          className="px-2.5 py-1 rounded-md bg-white border border-neutral-300 text-xs font-semibold text-brand-accent hover:bg-neutral-100 transition-colors"
                        >
                          Edit Size
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveStep(5)}
                          className="px-2.5 py-1 rounded-md bg-white border border-neutral-300 text-xs font-semibold text-brand-accent hover:bg-neutral-100 transition-colors"
                        >
                          Edit Metrics
                        </button>
                      </div>
                    </div>

                    {/* 6. Fit Spec */}
                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                          6. Silhouette Fit
                        </div>
                        <div className="font-bold text-brand-dark text-sm">
                          {selectedFit} Fit
                        </div>
                        <div className="text-xs text-neutral-600">
                          {FIT_OPTIONS.find((f) => f.id === selectedFit)?.desc || 'Classic drape and balance.'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveStep(6)}
                        className="px-2.5 py-1 rounded-md bg-white border border-neutral-300 text-xs font-semibold text-brand-accent hover:bg-neutral-100 transition-colors shrink-0"
                      >
                        Edit Fit
                      </button>
                    </div>

                    {/* 7. Perfume Spec */}
                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                          7. Fragrance Pairing
                        </div>
                        {selectedPerfume ? (
                          <>
                            <div className="font-bold text-brand-dark text-sm flex items-center gap-1.5">
                              <span>{selectedPerfume.icon}</span>
                              <span>{selectedPerfume.name}</span>
                            </div>
                            <div className="text-xs text-neutral-600">
                              By {selectedPerfume.brand} &bull; {selectedPerfume.fragranceFamily} (+₹{selectedPerfume.price})
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-bold text-brand-dark text-sm flex items-center gap-1.5">
                              <span>🚫</span> No Perfume Selected
                            </div>
                            <div className="text-xs text-neutral-500">
                              Garment-only delivery (+₹0)
                            </div>
                          </>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveStep(7)}
                        className="px-2.5 py-1 rounded-md bg-white border border-neutral-300 text-xs font-semibold text-brand-accent hover:bg-neutral-100 transition-colors shrink-0"
                      >
                        Edit Perfume
                      </button>
                    </div>
                  </div>
                </div>

                {/* Final Price Breakdown Card (Step 3 & 6 requirement) */}
                <div className="p-6 rounded-2xl bg-neutral-900 text-white shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <h4 className="text-base font-bold uppercase tracking-wider text-amber-300">
                      Final Order Price Breakdown
                    </h4>
                    <span className="text-xs text-neutral-400">
                      Currency: INR (₹)
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center text-neutral-300">
                      <span>Base Clothing Price ({product.name}):</span>
                      <span className="font-semibold text-white">₹{basePrice}</span>
                    </div>

                    <div className="flex justify-between items-center text-neutral-300">
                      <span>Customization & Tailoring Architecture:</span>
                      <span className="font-semibold text-emerald-400">Included (₹0)</span>
                    </div>

                    <div className="flex justify-between items-center text-neutral-300">
                      <span>
                        Fragrance Pairing {selectedPerfume ? `(${selectedPerfume.name})` : '(None)'}:
                      </span>
                      <span className="font-semibold text-amber-300">
                        {selectedPerfume ? `+₹${perfumePrice}` : '₹0'}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-neutral-800 flex justify-between items-baseline">
                      <div>
                        <div className="text-base font-extrabold text-white">
                          Final Estimated Total
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          Taxes and complimentary bespoke packaging included
                        </div>
                      </div>
                      <div className="text-2xl font-black text-amber-300">
                        ₹{totalPrice}
                      </div>
                    </div>
                  </div>
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
                  className="font-bold shadow-md bg-brand-dark hover:bg-neutral-800"
                >
                  Proceed to Cart (₹{totalPrice}) &rarr;
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

              {/* 4 & 5. Size & Custom Measurements */}
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

              {/* 6. Fit */}
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

              {/* 7. Perfume (Phase 4) */}
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/70 space-y-1">
                <div className="flex items-center justify-between text-neutral-500 font-semibold uppercase text-[10px]">
                  <span>7. Fragrance Pairing</span>
                  <button
                    type="button"
                    onClick={() => setActiveStep(7)}
                    className="text-brand-accent hover:underline lowercase font-medium"
                  >
                    edit
                  </button>
                </div>
                {selectedPerfume ? (
                  <div>
                    <div className="font-bold text-brand-dark text-sm flex items-center justify-between">
                      <span className="truncate">{selectedPerfume.name}</span>
                      <span className="text-brand-accent font-bold">+₹{selectedPerfume.price}</span>
                    </div>
                    <div className="text-neutral-500 text-[11px]">
                      {selectedPerfume.brand} &bull; {selectedPerfume.fragranceFamily}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-semibold text-brand-dark text-sm flex items-center justify-between">
                      <span>No Perfume</span>
                      <span className="text-emerald-600 font-semibold">₹0</span>
                    </div>
                    <div className="text-neutral-500 text-[11px]">
                      Garment-only option
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Section (Dynamic calculated total) */}
            <div className="pt-4 border-t border-neutral-100 space-y-2 text-xs">
              <div className="flex justify-between items-center text-neutral-600">
                <span>Base Garment Price:</span>
                <span className="font-semibold text-brand-dark">₹{basePrice}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>Customization Engine:</span>
                <span className="font-semibold text-emerald-600">Included</span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>Fragrance Pairing:</span>
                <span className={`font-semibold ${selectedPerfume ? 'text-brand-accent' : 'text-neutral-600'}`}>
                  {selectedPerfume ? `+₹${perfumePrice}` : '₹0'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-neutral-200 text-sm font-extrabold text-brand-dark">
                <span>Estimated Total:</span>
                <span className="text-base text-brand-dark">₹{totalPrice}</span>
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
