import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import CustomizationSummary from '../../components/customization/CustomizationSummary.jsx';
import { MOCK_PRODUCTS, getProductImage } from '../../data/mockProducts.js';
import { getProductById } from '../../services/firestoreService.js';
import { saveCustomization } from '../../services/savedCustomizationService.js';
import {
  getProductDesignOptions,
  getFabricSurcharge,
  MONOGRAM_THREAD_COLORS,
  MEASUREMENT_GUIDE_DATA,
  MASTER_FABRICS,
  getFabricsForCategory,
  MASTER_COLORS,
  getAvailableColors,
  MASTER_PERFUMES,
  getMeasurementFieldsForCategory
} from '../../data/customizationOptions.js';

const CUSTOMIZATION_STEPS = [
  { id: 1, title: "Fabric", description: "Select certified textile swatches and material weave." },
  { id: 2, title: "Color", description: "Choose rich colorways, pinstripes, and check patterns." },
  { id: 3, title: "Design", description: "Customize architecture, cuffs/sleeves, hardware, and monogram." },
  { id: 4, title: "Size", description: "Pick standard sizes or opt for bespoke custom measurements." },
  { id: 5, title: "Custom Measurements", description: "Input chest, waist, shoulder, and sleeve tailoring metrics." },
  { id: 6, title: "Fit", description: "Specify silhouette drape: Slim, Regular, or Relaxed fit." },
  { id: 7, title: "Perfume", description: "Discover luxury fragrance pairings suited to this garment." },
  { id: 8, title: "Preview", description: "Inspect interactive composite preview before adding to cart." }
];

const FIT_OPTIONS = [
  {
    id: "Slim",
    title: "Slim Fit",
    badge: "Modern Contour",
    desc: "Tapered cut closer through chest, waist, and sleeves for a sharp, streamlined modern silhouette."
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
    desc: "Generously cut silhouette with extra ease through chest and torso for casual elegance and comfort."
  }
];

export const MOCK_PERFUMES = MASTER_PERFUMES;

// Fragrance recommendation affinity calculation
function getRecommendedPerfumes(product, selectedFabric, selectedColor) {
  const candidatePerfumes = MASTER_PERFUMES.filter(p => p.id !== 'no-perfume');
  const scores = candidatePerfumes.map((perfume) => {
    let score = 0;
    const cat = product?.category || '';
    const fab = selectedFabric?.name?.toLowerCase() || '';
    const col = selectedColor?.name?.toLowerCase() || '';

    if (perfume.tags && perfume.tags.includes(cat)) score += 3;

    if (fab.includes('linen') || fab.includes('cotton') || fab.includes('rayon')) {
      if (perfume.fragranceFamily === 'Citrus' || perfume.fragranceFamily === 'Fresh' || perfume.fragranceFamily === 'Aquatic') score += 2;
    }
    if (fab.includes('wool') || fab.includes('denim') || fab.includes('corduroy')) {
      if (perfume.fragranceFamily === 'Woody' || perfume.fragranceFamily === 'Spicy') score += 3;
    }
    if (fab.includes('silk') || fab.includes('satin') || fab.includes('velvet')) {
      if (perfume.fragranceFamily === 'Floral' || perfume.fragranceFamily === 'Oriental' || perfume.fragranceFamily === 'Amber') score += 3;
    }

    if (col.includes('black') || col.includes('navy') || col.includes('charcoal') || col.includes('maroon') || col.includes('burgundy')) {
      if (perfume.fragranceFamily === 'Woody' || perfume.fragranceFamily === 'Oriental' || perfume.fragranceFamily === 'Amber') score += 2;
    }
    if (col.includes('white') || col.includes('blue') || col.includes('mint') || col.includes('pink') || col.includes('cream')) {
      if (perfume.fragranceFamily === 'Citrus' || perfume.fragranceFamily === 'Fresh' || perfume.fragranceFamily === 'Floral' || perfume.fragranceFamily === 'Aquatic') score += 2;
    }

    return { perfume, score };
  });

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, 4).map((s) => s.perfume);
}

export default function CustomizePage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, updateCartItem } = useCart();

  // Check if we are editing an existing item from the cart
  const editingCartItemId = location.state?.cartItemId || null;

  // Active product state
  const [product, setProduct] = useState(
    () => MOCK_PRODUCTS.find((p) => String(p.id) === String(id)) || MOCK_PRODUCTS[0]
  );

  useEffect(() => {
    let isMounted = true;
    getProductById(id).then((res) => {
      if (isMounted && res.success && res.product) {
        setProduct(res.product);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Product category design configuration
  const productDesignConfig = useMemo(() => {
    return getProductDesignOptions(product?.category);
  }, [product?.category]);

  // Expanded Fabrics (20 realistic options with category compatibility)
  const availableFabrics = useMemo(() => {
    return getFabricsForCategory(product?.category);
  }, [product?.category]);

  // Expanded Colors (30 professional colors)
  const availableColors = useMemo(() => {
    return getAvailableColors();
  }, []);

  // Category specific tailoring measurements
  const categoryMeasurementFields = useMemo(() => {
    return getMeasurementFieldsForCategory(product?.category);
  }, [product?.category]);

  // Navigation step state
  const [activeStep, setActiveStep] = useState(1);

  // Sizing Mode State: 'standard' (Default) vs 'custom'
  const [sizeMode, setSizeMode] = useState('standard');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedFit, setSelectedFit] = useState('Regular');

  // Customization selections
  const [selectedFabric, setSelectedFabric] = useState(() => availableFabrics[0] || null);
  const [selectedColor, setSelectedColor] = useState(() => availableColors[0] || null);

  // Dynamic garment design options based on product category
  const [designOptions, setDesignOptions] = useState({
    collar: 'Classic',
    cuff: 'Standard',
    buttons: 'Standard Horn'
  });

  // Monogram State
  const [monogram, setMonogram] = useState({
    enabled: false,
    text: '',
    position: 'Left Chest',
    threadColor: 'Royal Gold Silk'
  });

  // Custom measurements & unit conversion
  const [measurementUnit, setMeasurementUnit] = useState('in');
  const [customMeasurements, setCustomMeasurements] = useState({});
  const [validationError, setValidationError] = useState(null);

  // Color & Perfume Filter Tabs
  const [colorFilterGroup, setColorFilterGroup] = useState('All');
  const [perfumeFilterGroup, setPerfumeFilterGroup] = useState('All');

  // Measurement Guide Drawer/Modal state
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [activeGuideKey, setActiveGuideKey] = useState('chest');

  // Perfume selection
  const [selectedPerfume, setSelectedPerfume] = useState(null);

  // UI Toast state
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [savingDesign, setSavingDesign] = useState(false);

  // Synchronize state when editing existing configuration from Cart or Saved Designs
  useEffect(() => {
    if (location.state?.editConfig) {
      const cfg = location.state.editConfig;
      if (cfg.selectedFabric) setSelectedFabric(cfg.selectedFabric);
      else if (cfg.fabric) setSelectedFabric(cfg.fabric);

      if (cfg.selectedColor) setSelectedColor(cfg.selectedColor);
      else if (cfg.color) setSelectedColor(cfg.color);

      if (cfg.size) {
        if (cfg.size === 'Custom Tailored' || cfg.customMeasurements) {
          setSizeMode('custom');
          setSelectedSize('Custom Tailored');
        } else {
          setSizeMode('standard');
          setSelectedSize(cfg.size);
        }
      }

      if (cfg.fit) setSelectedFit(cfg.fit);

      if (cfg.designOptions) {
        setDesignOptions({
          collar: cfg.designOptions.collar || 'Classic',
          cuff: cfg.designOptions.cuff || 'Standard',
          buttons: cfg.designOptions.buttons || 'Standard Horn'
        });
      } else if (cfg.design) {
        setDesignOptions({
          collar: cfg.design.collar || 'Classic',
          cuff: cfg.design.cuff || 'Standard',
          buttons: cfg.design.buttons || 'Standard Horn'
        });
      }

      if (cfg.monogram) {
        if (typeof cfg.monogram === 'string') {
          setMonogram({
            enabled: !!cfg.monogram.trim(),
            text: cfg.monogram,
            position: 'Left Chest',
            threadColor: 'Royal Gold Silk'
          });
        } else if (typeof cfg.monogram === 'object') {
          setMonogram({
            enabled: cfg.monogram.enabled ?? !!cfg.monogram.text,
            text: cfg.monogram.text || '',
            position: cfg.monogram.position || 'Left Chest',
            threadColor: cfg.monogram.threadColor || 'Royal Gold Silk'
          });
        }
      }

      if (cfg.customMeasurements) {
        setCustomMeasurements(cfg.customMeasurements);
        setSizeMode('custom');
        setSelectedSize('Custom Tailored');
      } else if (cfg.measurements) {
        setCustomMeasurements(cfg.measurements);
        setSizeMode('custom');
        setSelectedSize('Custom Tailored');
      }

      if (cfg.measurementUnit) setMeasurementUnit(cfg.measurementUnit);

      if (cfg.selectedPerfume !== undefined) setSelectedPerfume(cfg.selectedPerfume);
      else if (cfg.perfume !== undefined) setSelectedPerfume(cfg.perfume);

      if (location.state.initialStep) setActiveStep(location.state.initialStep);
      return;
    }

    if (product) {
      if (availableFabrics.length > 0 && !selectedFabric) {
        setSelectedFabric(availableFabrics[0]);
      }
      if (availableColors.length > 0 && !selectedColor) {
        setSelectedColor(availableColors[0]);
      }
      if (productDesignConfig) {
        setDesignOptions({
          collar: productDesignConfig.section1Options?.[0]?.id || 'Classic',
          cuff: productDesignConfig.section2Options?.[0]?.id || 'Standard',
          buttons: productDesignConfig.section3Options?.[0]?.id || 'Standard Horn'
        });
        setMonogram((prev) => ({
          ...prev,
          position: productDesignConfig.monogramPositions?.[0] || 'Left Chest'
        }));
      }
    }
  }, [product?.id, productDesignConfig, location.state]);

  // Keep fabric valid if product category changed
  useEffect(() => {
    if (availableFabrics.length > 0) {
      const isCurrentFabricValid = availableFabrics.some(f => f.name === selectedFabric?.name);
      if (!isCurrentFabricValid) {
        setSelectedFabric(availableFabrics[0]);
      }
    }
  }, [availableFabrics]);

  // Pricing calculations
  const basePrice = Number(product?.basePrice || 1499);
  const fabricSurcharge = Number(selectedFabric?.priceAdjustment ?? getFabricSurcharge(selectedFabric?.name));

  // Find buttons/hardware surcharge
  const selectedHardwareObj = productDesignConfig?.section3Options?.find(
    (o) => o.id === designOptions.buttons
  );
  const hardwareSurcharge = selectedHardwareObj?.surcharge || 0;

  // Monogram surcharge: ₹150 if enabled and valid text entered
  const monogramSurcharge = monogram.enabled && monogram.text.trim().length > 0 ? 150 : 0;

  // Perfume surcharge
  const perfumePrice = selectedPerfume ? Number(selectedPerfume.price || 0) : 0;

  // Total Live Price
  const totalPrice = Math.max(0, basePrice + fabricSurcharge + hardwareSurcharge + monogramSurcharge + perfumePrice);

  const isCustomTailored = sizeMode === 'custom' || selectedSize === "Custom Tailored";

  // Unit conversion handler: in <-> cm preserving data
  const handleUnitToggle = (newUnit) => {
    if (newUnit === measurementUnit) return;

    setCustomMeasurements((prev) => {
      const converted = {};
      Object.keys(prev).forEach((key) => {
        const val = prev[key];
        if (val !== '' && !isNaN(parseFloat(val))) {
          const num = parseFloat(val);
          if (newUnit === 'cm') {
            converted[key] = (num * 2.54).toFixed(1);
          } else {
            converted[key] = (num / 2.54).toFixed(1);
          }
        } else {
          converted[key] = val;
        }
      });
      return converted;
    });

    setMeasurementUnit(newUnit);
  };

  // Safe measurement input handler
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

  const hasMeasurements = Object.values(customMeasurements).some((v) => v !== '' && v !== null && v !== undefined);

  // Recommendations calculated dynamically from current clothing choices
  const recommendedPerfumes = useMemo(() => {
    return getRecommendedPerfumes(product, selectedFabric, selectedColor);
  }, [product, selectedFabric, selectedColor]);

  // Filtered Perfumes List
  const displayedPerfumes = useMemo(() => {
    if (perfumeFilterGroup === 'All') return MASTER_PERFUMES;
    if (perfumeFilterGroup === 'Recommended') return recommendedPerfumes;
    return MASTER_PERFUMES.filter(p => p.fragranceFamily === perfumeFilterGroup);
  }, [perfumeFilterGroup, recommendedPerfumes]);

  // Filtered Colors List
  const displayedColors = useMemo(() => {
    if (colorFilterGroup === 'All') return availableColors;
    return availableColors.filter(c => c.group === colorFilterGroup);
  }, [colorFilterGroup, availableColors]);

  const resolvedProductImage = product?.image || product?.images?.[0] || getProductImage(product);

  // Master Tailoring Dossier Object for Preview & Summary
  const currentCustomizationPayload = {
    category: product?.category || 'Shirts',
    productImage: resolvedProductImage,
    silhouetteColor: product?.silhouetteColor || 'from-stone-800 to-neutral-900',
    fabric: {
      name: selectedFabric?.name || 'Cotton',
      composition: selectedFabric?.composition || '100% Cotton',
      priceAdjustment: fabricSurcharge
    },
    color: {
      name: selectedColor?.name || 'Classic Navy',
      hex: selectedColor?.hex || selectedColor?.value || '#1F2937',
      value: selectedColor?.hex || selectedColor?.value || '#1F2937'
    },
    design: {
      collar: designOptions.collar,
      cuff: designOptions.cuff,
      buttons: designOptions.buttons,
      monogram: monogram.enabled && monogram.text.trim() ? monogram.text.trim() : ''
    },
    buttons: {
      name: designOptions.buttons,
      priceAdjustment: hardwareSurcharge
    },
    fit: selectedFit,
    size: isCustomTailored ? 'Custom Tailored' : (selectedSize || 'M'),
    measurements: isCustomTailored && hasMeasurements ? { ...customMeasurements } : null,
    measurementUnit: isCustomTailored ? measurementUnit : null,
    monogram: {
      enabled: monogram.enabled,
      text: monogram.text.trim(),
      position: monogram.position,
      threadColor: monogram.threadColor,
      priceAdjustment: monogramSurcharge
    },
    perfume: selectedPerfume
      ? {
          id: selectedPerfume.id,
          name: selectedPerfume.name,
          brand: selectedPerfume.brand || 'FitFusion Atelier',
          fragranceFamily: selectedPerfume.fragranceFamily || 'Fresh',
          price: Number(selectedPerfume.price || 0)
        }
      : null
  };

  // Step Navigation Controls
  const handleNextStep = () => {
    setValidationError(null);

    // If leaving Step 4 in Standard mode, skip Step 5 (Custom Measurements) and proceed to Step 6 (Fit)
    if (activeStep === 4 && sizeMode === 'standard') {
      setActiveStep(6);
      return;
    }

    // If leaving Step 5 in Custom mode, validate required measurement fields
    if (activeStep === 5 && sizeMode === 'custom') {
      const missing = categoryMeasurementFields.filter(
        f => f.required && (!customMeasurements[f.key] || parseFloat(customMeasurements[f.key]) <= 0)
      );
      if (missing.length > 0) {
        setValidationError(`Please enter valid body measurements for: ${missing.map(m => m.label).join(', ')}`);
        return;
      }
    }

    setActiveStep((prev) => Math.min(8, prev + 1));
  };

  const handlePrevStep = () => {
    setValidationError(null);
    // If going back from Step 6 in Standard mode, jump back to Step 4
    if (activeStep === 6 && sizeMode === 'standard') {
      setActiveStep(4);
      return;
    }
    setActiveStep((prev) => Math.max(1, prev - 1));
  };

  // Add to Bag / Update Cart Item Handler
  const handleProceedToCart = () => {
    setValidationError(null);

    // Validate required custom measurements if bespoke custom measurement mode is selected
    if (sizeMode === 'custom') {
      const missing = categoryMeasurementFields.filter(
        f => f.required && (!customMeasurements[f.key] || parseFloat(customMeasurements[f.key]) <= 0)
      );
      if (missing.length > 0) {
        setActiveStep(5);
        setValidationError(`Please complete all required measurements (${missing.map(m => m.label).join(', ')}) before adding to bag.`);
        return;
      }
    }

    const finalSize = sizeMode === 'custom' ? 'Custom Tailored' : (selectedSize || 'M');
    const finalMeasurements = sizeMode === 'custom' ? { ...customMeasurements } : null;

    const cartItem = {
      id: editingCartItemId || `cart-${product.id}-${Date.now()}`,
      productId: String(product.id),
      productName: product.name || 'Custom Garment',
      category: product.category || 'Shirts',
      productImage: resolvedProductImage,
      image: resolvedProductImage,
      silhouetteColor: product.silhouetteColor || 'from-stone-800 to-neutral-900',
      accentColor: product.accentColor || '#1E3A8A',
      basePrice: basePrice,
      fabricSurcharge: fabricSurcharge,
      hardwareSurcharge: hardwareSurcharge,
      monogramSurcharge: monogramSurcharge,
      selectedFabric: selectedFabric ? {
        id: selectedFabric.id || 'fab-custom',
        name: selectedFabric.name || 'Standard Fabric',
        composition: selectedFabric.composition || '100% Textile',
        priceAdjustment: fabricSurcharge
      } : { name: 'Standard Fabric', composition: '100% Textile', priceAdjustment: 0 },
      selectedColor: selectedColor ? {
        id: selectedColor.id || 'col-custom',
        name: selectedColor.name || 'Default',
        hex: selectedColor.hex || selectedColor.value || '#1F2937',
        value: selectedColor.value || selectedColor.hex || '#1F2937'
      } : { name: 'Default', hex: '#1F2937' },
      selectedDesign: { ...designOptions },
      designOptions: { ...designOptions },
      collar: designOptions.collar || 'Classic',
      cuff: designOptions.cuff || 'Standard',
      buttons: designOptions.buttons || 'Standard Horn',
      monogram: monogram.enabled && monogram.text ? monogram.text : '',
      size: finalSize,
      customMeasurements: finalMeasurements,
      measurementUnit: sizeMode === 'custom' ? measurementUnit : null,
      fit: selectedFit || 'Regular',
      selectedPerfume: selectedPerfume && selectedPerfume.id !== 'no-perfume' ? {
        id: selectedPerfume.id,
        name: selectedPerfume.name,
        brand: selectedPerfume.brand || 'FitFusion Atelier',
        fragranceFamily: selectedPerfume.fragranceFamily || 'Fresh',
        description: selectedPerfume.description || '',
        price: Number(selectedPerfume.price || 0),
        icon: selectedPerfume.icon || '✨'
      } : null,
      perfumePrice: perfumePrice,
      itemPrice: totalPrice,
      totalItemPrice: totalPrice,
      customization: currentCustomizationPayload,
      addedAt: new Date().toISOString()
    };

    if (editingCartItemId) {
      updateCartItem(editingCartItemId, cartItem);
      navigate('/cart');
    } else {
      cartItem.quantity = 1;
      addToCart(cartItem);
      navigate('/cart');
    }
  };

  // Save Customization Handler
  const handleSaveToVault = async () => {
    setSavingDesign(true);
    setFeedbackToast(null);
    try {
      await saveCustomization({
        userId: user?.uid || 'anonymous',
        productId: product.id,
        productName: product.name,
        customization: currentCustomizationPayload,
        price: totalPrice,
        designName: `${product.name} (${selectedFabric?.name || 'Tailored'}, ${selectedColor?.name || 'Classic'})`
      });

      setFeedbackToast({
        type: 'success',
        message: 'Bespoke design saved to your Atelier Vault!'
      });
      setTimeout(() => setFeedbackToast(null), 4000);
    } catch (err) {
      setFeedbackToast({
        type: 'error',
        message: 'Could not save design right now. Please try again.'
      });
    } finally {
      setSavingDesign(false);
    }
  };

  const activeColorHex = selectedColor?.hex || selectedColor?.value || '#1F2937';

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
              {editingCartItemId && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-xs">
                  ✏️ Editing Cart Item
                </span>
              )}
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

            {(fabricSurcharge > 0 || hardwareSurcharge > 0 || monogramSurcharge > 0 || perfumePrice > 0) && (
              <div className="border-l border-neutral-200 pl-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  Custom Craft
                </div>
                <div className="text-base font-bold text-neutral-800">
                  +₹{fabricSurcharge + hardwareSurcharge + monogramSurcharge + perfumePrice}
                </div>
              </div>
            )}

            <div className="border-l border-neutral-200 pl-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
                Total Tailored Price
              </div>
              <div className="text-xl font-extrabold text-brand-dark">
                ₹{totalPrice}
              </div>
            </div>
          </div>
        </div>

        {/* Global Feedback Toast */}
        {feedbackToast && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-sm transition-all ${
              feedbackToast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{feedbackToast.type === 'success' ? '✓' : '⚠️'}</span>
              <span>{feedbackToast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackToast(null)}
              className="text-xs opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-sm font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>{validationError}</span>
            </div>
            <button type="button" onClick={() => setValidationError(null)} className="text-amber-800 text-xs">✕</button>
          </div>
        )}

        {/* Step Progress Stepper Bar */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-8 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between min-w-[720px] gap-2">
            {CUSTOMIZATION_STEPS.map((step) => {
              const isActive = activeStep === step.id;
              const isPast = activeStep > step.id;
              // If standard size is selected, indicate step 5 is skipped
              const isSkipped = step.id === 5 && sizeMode === 'standard';

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    setValidationError(null);
                    setActiveStep(step.id);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition text-left ${
                    isActive
                      ? 'bg-brand-accentLight border border-brand-accent/30 text-brand-dark'
                      : isPast
                      ? 'text-neutral-700 hover:bg-neutral-50'
                      : isSkipped
                      ? 'text-neutral-400 opacity-60'
                      : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${
                      isActive
                        ? 'bg-brand-accent text-white'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : isSkipped
                        ? 'bg-neutral-200 text-neutral-400'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {isPast ? '✓' : step.id}
                  </span>
                  <div className="text-xs">
                    <span className="font-bold block truncate">{step.title}</span>
                    <span className="text-[10px] text-neutral-400 block truncate">
                      {isSkipped ? 'Standard Sizing' : isPast ? 'Completed' : isActive ? 'Active' : 'Pending'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Workstation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Step Configuration Panel */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-neutral-100 pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                  Step {activeStep} of 8 &bull; {CUSTOMIZATION_STEPS[activeStep - 1]?.title}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-dark mt-1">
                  {CUSTOMIZATION_STEPS[activeStep - 1]?.title}
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {CUSTOMIZATION_STEPS[activeStep - 1]?.description}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveToVault}
                disabled={savingDesign}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition shadow-2xs disabled:opacity-50"
              >
                <span>💾</span>
                <span>{savingDesign ? 'Saving...' : 'Save Design'}</span>
              </button>
            </div>

            {/* STEP 1: FABRIC SELECTION (20 Realistic Fabrics with Category Compatibility) */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                    Select Material Weave ({availableFabrics.length} Available for {product?.category || 'Garment'})
                  </label>
                  <span className="text-xs text-neutral-500 font-medium">
                    Current: <strong className="text-brand-dark">{selectedFabric?.name || 'None selected'}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {availableFabrics.map((fabric) => {
                    const isSelected = selectedFabric?.name === fabric.name;
                    const surcharge = fabric.priceAdjustment || getFabricSurcharge(fabric.name);

                    return (
                      <button
                        key={fabric.id || fabric.name}
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
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-200 text-neutral-700">
                              {fabric.badge || 'Atelier'}
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
                          <div className="text-xs text-neutral-500 mt-1 font-medium">
                            {fabric.composition}
                          </div>
                          {fabric.description && (
                            <p className="text-[11px] text-neutral-600 mt-1.5 leading-relaxed">
                              {fabric.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-2.5 border-t border-neutral-200/60 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-brand-accent">
                            {surcharge > 0 ? `+₹${surcharge} Premium` : 'Included Standard'}
                          </span>
                          <span className="text-neutral-400">Grade A Certified</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: COLOR SELECTION (30 Professional Colorways) */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                    Available Atelier Palette ({availableColors.length} Colors)
                  </label>
                  <span className="text-xs text-neutral-500 font-medium">
                    Selected: <strong className="text-brand-dark">{selectedColor?.name || 'None selected'}</strong>
                  </span>
                </div>

                {/* Color Group Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-neutral-100">
                  {['All', 'Neutrals', 'Blues', 'Greens', 'Reds', 'Warm', 'Earth'].map((grp) => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setColorFilterGroup(grp)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        colorFilterGroup === grp
                          ? 'bg-brand-dark text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {grp}
                    </button>
                  ))}
                </div>

                {/* Visual Swatches Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {displayedColors.map((color) => {
                    const isSelected = selectedColor?.name === color.name;
                    const hexVal = color.hex || color.value || '#1F2937';

                    return (
                      <button
                        key={color.id || color.name}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        aria-label={`Select color ${color.name}`}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2.5 ${
                          isSelected
                            ? 'border-brand-accent bg-brand-accentLight/40 ring-2 ring-brand-accent shadow-sm'
                            : 'border-neutral-200 bg-neutral-50 hover:bg-white hover:border-neutral-300'
                        }`}
                      >
                        <div className="relative">
                          <span
                            style={{ backgroundColor: hexVal }}
                            className="block w-10 h-10 rounded-full border-2 border-neutral-300 shadow-inner"
                          />
                          {isSelected && (
                            <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow font-bold text-sm">
                              &#10003;
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-brand-dark truncate max-w-[90px]">
                            {color.name}
                          </div>
                          <div className="text-[10px] text-neutral-400 uppercase">
                            {color.group || 'Swatch'}
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
                      style={{ backgroundColor: activeColorHex }}
                      className="w-10 h-10 rounded-lg border border-neutral-300 shadow-sm shrink-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-brand-dark">
                        Active Hue: {selectedColor.name} ({activeColorHex})
                      </div>
                      <div className="text-xs text-neutral-500">
                        Color-fast reactive dye with premium hue vibrancy and multi-wash longevity.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: PRODUCT-SPECIFIC DESIGN SELECTION */}
            {activeStep === 3 && (
              <div className="space-y-6">
                {/* 1. Dynamic Section 1 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                      1. {productDesignConfig.section1Title}
                    </label>
                    <span className="text-xs font-semibold text-brand-accent">
                      {designOptions.collar}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {productDesignConfig.section1Options.map((opt) => {
                      const isSelected = designOptions.collar === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDesignOptions((prev) => ({ ...prev, collar: opt.id }))}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-brand-accent bg-brand-accentLight/60 ring-2 ring-brand-accent'
                              : 'border-neutral-200 bg-neutral-50 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-brand-dark">{opt.title}</span>
                            {isSelected && <span className="text-brand-accent text-xs font-bold">&#10003;</span>}
                          </div>
                          <p className="text-xs text-neutral-600 leading-relaxed">{opt.desc}</p>
                          {opt.surcharge > 0 && (
                            <span className="inline-block mt-2 text-[10px] font-bold text-amber-600">
                              +₹{opt.surcharge} Special Architecture
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Dynamic Section 2 */}
                <div className="space-y-3 pt-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                      2. {productDesignConfig.section2Title}
                    </label>
                    <span className="text-xs font-semibold text-brand-accent">
                      {designOptions.cuff}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {productDesignConfig.section2Options.map((opt) => {
                      const isSelected = designOptions.cuff === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDesignOptions((prev) => ({ ...prev, cuff: opt.id }))}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-brand-accent bg-brand-accentLight/60 ring-2 ring-brand-accent'
                              : 'border-neutral-200 bg-neutral-50 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-brand-dark">{opt.title}</span>
                            {isSelected && <span className="text-brand-accent text-xs font-bold">&#10003;</span>}
                          </div>
                          <p className="text-xs text-neutral-600 leading-relaxed">{opt.desc}</p>
                          {opt.surcharge > 0 && (
                            <span className="inline-block mt-2 text-[10px] font-bold text-amber-600">
                              +₹{opt.surcharge} Tailoring
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Dynamic Section 3 */}
                <div className="space-y-3 pt-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                      3. {productDesignConfig.section3Title}
                    </label>
                    <span className="text-xs font-semibold text-brand-accent">
                      {designOptions.buttons}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {productDesignConfig.section3Options.map((btn) => {
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
                            style={{ backgroundColor: btn.color || '#4B5563' }}
                            className="w-6 h-6 rounded-full shrink-0 mt-0.5 shadow-sm border border-neutral-400/50"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-brand-dark">{btn.title}</span>
                              {isSelected && <span className="text-brand-accent text-xs font-bold">&#10003;</span>}
                            </div>
                            <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">{btn.desc}</p>
                            {btn.surcharge > 0 && (
                              <span className="inline-block mt-1 text-[10px] font-bold text-amber-600">
                                +₹{btn.surcharge} Material Surcharge
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Monogram Studio */}
                <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="monogram-toggle"
                        checked={monogram.enabled}
                        onChange={(e) => setMonogram((prev) => ({ ...prev, enabled: e.target.checked }))}
                        className="w-4 h-4 text-brand-accent rounded border-neutral-300 focus:ring-brand-accent"
                      />
                      <label htmlFor="monogram-toggle" className="text-sm font-bold text-brand-dark cursor-pointer">
                        Personalized Silk Monogramming (+₹150)
                      </label>
                    </div>
                    {monogram.enabled && (
                      <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                        Atelier Embroidery
                      </span>
                    )}
                  </div>

                  {monogram.enabled && (
                    <div className="space-y-4 pt-2 border-t border-neutral-200/80">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">
                          Monogram Characters (Initials or Name, max 6 characters)
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="e.g. VMD"
                          value={monogram.text}
                          onChange={(e) => setMonogram((prev) => ({ ...prev, text: e.target.value.toUpperCase() }))}
                          className="w-full sm:w-64 px-3.5 py-2 rounded-lg border border-neutral-300 font-mono tracking-widest text-base font-bold text-brand-dark uppercase focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-neutral-600 block mb-1">
                            Embroidery Position
                          </label>
                          <select
                            value={monogram.position}
                            onChange={(e) => setMonogram((prev) => ({ ...prev, position: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-semibold text-brand-dark bg-white"
                          >
                            {(productDesignConfig.monogramPositions || ['Left Chest', 'Cuff', 'Hem']).map((pos) => (
                              <option key={pos} value={pos}>{pos}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-neutral-600 block mb-1">
                            Thread Color
                          </label>
                          <select
                            value={monogram.threadColor}
                            onChange={(e) => setMonogram((prev) => ({ ...prev, threadColor: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-semibold text-brand-dark bg-white"
                          >
                            {MONOGRAM_THREAD_COLORS.map((col) => (
                              <option key={col.id} value={col.name}>{col.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: SIZE SELECTION (PART 5: Standard Size vs Custom Measurement Toggle) */}
            {activeStep === 4 && (
              <div className="space-y-6">
                {/* Mode Selector Toggle: Standard Size (Default) vs Custom Measurement */}
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                      Choose Sizing Method
                    </label>
                    <span className="text-xs font-bold text-brand-accent">
                      {sizeMode === 'standard' ? `Standard Size: ${selectedSize}` : 'Bespoke Custom Measurements'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSizeMode('standard');
                        setSelectedSize(prev => (prev === 'Custom Tailored' ? 'M' : prev || 'M'));
                        setCustomMeasurements({});
                        setValidationError(null);
                      }}
                      className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                        sizeMode === 'standard'
                          ? 'border-brand-accent bg-white ring-2 ring-brand-accent shadow-sm'
                          : 'border-neutral-200 bg-neutral-100 hover:bg-neutral-200/60'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                        sizeMode === 'standard' ? 'border-brand-accent bg-brand-accent text-white text-[10px]' : 'border-neutral-400 bg-white'
                      }`}>
                        {sizeMode === 'standard' && '●'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-brand-dark">Standard Size</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-accentLight text-brand-accent">
                            Default
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          Standard atelier sizing calibrated to Indian and international standards (S, M, L, XL, XXL).
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSizeMode('custom');
                        setSelectedSize('Custom Tailored');
                        setValidationError(null);
                      }}
                      className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                        sizeMode === 'custom'
                          ? 'border-amber-600 bg-white ring-2 ring-amber-500 shadow-sm'
                          : 'border-neutral-200 bg-neutral-100 hover:bg-neutral-200/60'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                        sizeMode === 'custom' ? 'border-amber-600 bg-amber-600 text-white text-[10px]' : 'border-neutral-400 bg-white'
                      }`}>
                        {sizeMode === 'custom' && '●'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-brand-dark">Custom Measurement</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            Bespoke
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          Provide exact body metrics in Step 5 tailored specifically for {product?.category || 'this garment'}.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* When Standard Size is selected: show S, M, L, XL, XXL and hide custom measurement form */}
                {sizeMode === 'standard' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                        Select Standard Size (S, M, L, XL, XXL)
                      </label>
                      <span className="text-xs font-semibold text-neutral-500">
                        Selected: <strong className="text-brand-dark">{selectedSize}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {['S', 'M', 'L', 'XL', 'XXL', '3XL'].map((s) => {
                        const isSelected = selectedSize === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSelectedSize(s)}
                            className={`py-4 px-3 rounded-xl border text-center transition-all ${
                              isSelected
                                ? 'border-brand-accent bg-brand-accentLight/60 ring-2 ring-brand-accent text-brand-dark font-black shadow-sm'
                                : 'border-neutral-200 bg-neutral-50 hover:bg-white text-neutral-700 font-bold'
                            }`}
                          >
                            <div className="text-lg">{s}</div>
                            <div className="text-[10px] text-neutral-400 font-normal mt-0.5">Atelier Fit</div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 flex items-center justify-between">
                      <span>Standard size <strong>{selectedSize}</strong> active. Detailed custom measurement form is hidden.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSizeMode('custom');
                          setSelectedSize('Custom Tailored');
                          setValidationError(null);
                        }}
                        className="text-xs text-amber-600 hover:underline font-bold"
                      >
                        Switch to Custom Measurement &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* When Custom Measurement is selected */}
                {sizeMode === 'custom' && (
                  <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="font-bold flex items-center gap-2 text-sm text-amber-950">
                        <span>✨</span> Bespoke Custom Tailored Active
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveStep(5)}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition shadow-xs"
                      >
                        Proceed to Measurements (Step 5) &rarr;
                      </button>
                    </div>
                    <p className="text-amber-800 leading-relaxed">
                      Custom tailored mode enabled. You will input your exact measurements in Step 5 tailored specifically for {product?.category || 'garments'}.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: CUSTOM MEASUREMENTS & CATEGORY TAILORING FORM (PART 5) */}
            {activeStep === 5 && (
              <div className="space-y-6">
                {/* If user is in Standard Size mode, form is hidden and prompt is shown */}
                {sizeMode === 'standard' ? (
                  <div className="p-8 rounded-2xl bg-neutral-50 border border-neutral-200 text-center space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-full bg-neutral-200 flex items-center justify-center text-3xl">
                      📏
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-base text-brand-dark">
                        Standard Size Active (Size: {selectedSize})
                      </h3>
                      <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                        The custom measurement form is hidden because you have selected standard calibrated sizing. If you have unique body proportions, switch to custom measurement below.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSizeMode('custom');
                          setSelectedSize('Custom Tailored');
                          setValidationError(null);
                        }}
                        className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs"
                      >
                        Switch to Custom Measurement
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveStep(6)}
                        className="px-4 py-2 rounded-lg bg-brand-dark hover:bg-black text-white text-xs font-bold transition"
                      >
                        Continue to Step 6: Fit (Size: {selectedSize}) &rarr;
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Header callout with category & guide */}
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="text-base">📐</span>
                        <div>
                          <strong className="block font-bold">
                            Bespoke Measurements for {product?.category || 'Garment'}
                          </strong>
                          <span>
                            Enter required tailoring dimensions in {measurementUnit}. Master artisan tolerances applied.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSizeMode('standard');
                            setSelectedSize('M');
                            setCustomMeasurements({});
                            setValidationError(null);
                            setActiveStep(4);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 font-bold text-xs transition"
                        >
                          &larr; Switch to Standard Size
                        </button>
                        <button
                          type="button"
                          onClick={() => setGuideModalOpen(true)}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition shadow-xs"
                        >
                          📖 How to Measure Guide
                        </button>
                      </div>
                    </div>

                    {/* Unit Switcher */}
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                        Measurement Unit (Values convert automatically)
                      </span>
                      <div className="flex items-center p-1 rounded-lg bg-neutral-100 border border-neutral-200">
                        <button
                          type="button"
                          onClick={() => handleUnitToggle('in')}
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
                          onClick={() => handleUnitToggle('cm')}
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

                    {/* Metric Fields Grid tailored to product category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {categoryMeasurementFields.map((field) => (
                        <div key={field.key} className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor={`metric-${field.key}`}
                              className="text-xs font-bold uppercase tracking-wider text-brand-dark"
                            >
                              {field.label} {field.required && <span className="text-red-500 font-bold">*</span>}
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveGuideKey(field.key);
                                setGuideModalOpen(true);
                              }}
                              className="text-[10px] text-amber-600 hover:underline font-semibold"
                            >
                              Help ?
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              id={`metric-${field.key}`}
                              type="number"
                              min="0"
                              step="0.1"
                              placeholder={
                                measurementUnit === 'cm' && field.placeholder
                                  ? (parseFloat(field.placeholder) * 2.54).toFixed(1)
                                  : field.placeholder
                              }
                              value={customMeasurements[field.key] || ''}
                              onChange={(e) => {
                                setValidationError(null);
                                handleMeasurementChange(field.key, e.target.value);
                              }}
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

                    {/* Clear / Reset Fields */}
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
                          onClick={() => setCustomMeasurements({})}
                          className="text-red-600 hover:underline font-semibold"
                        >
                          Clear All Fields
                        </button>
                      )}
                    </div>
                  </>
                )}
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

            {/* STEP 7: PERFUME (PART 4: 18 Fictional Perfumes across 10 Families + "No Perfume") */}
            {activeStep === 7 && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedPerfume?.icon || '🌿'}</span>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Selected Fragrance
                      </div>
                      <div className="text-sm font-bold text-brand-dark">
                        {selectedPerfume && selectedPerfume.id !== 'no-perfume'
                          ? `${selectedPerfume.name} by ${selectedPerfume.brand || 'Atelier'} (+₹${selectedPerfume.price})`
                          : 'No Perfume Selected (₹0)'}
                      </div>
                    </div>
                  </div>
                  {selectedPerfume && (
                    <button
                      type="button"
                      onClick={() => setSelectedPerfume(null)}
                      className="text-xs text-red-600 hover:underline font-semibold"
                    >
                      Reset to No Fragrance
                    </button>
                  )}
                </div>

                {/* Fragrance Family Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-neutral-100">
                  {['All', 'Recommended', 'Fresh', 'Citrus', 'Aquatic', 'Woody', 'Amber', 'Floral', 'Musk', 'Spicy', 'Oriental', 'Green'].map((fam) => (
                    <button
                      key={fam}
                      type="button"
                      onClick={() => setPerfumeFilterGroup(fam)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        perfumeFilterGroup === fam
                          ? 'bg-brand-dark text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {fam}
                    </button>
                  ))}
                </div>

                {/* Perfumes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedPerfumes.map((perfume) => {
                    const isSelected = selectedPerfume?.id === perfume.id || (!selectedPerfume && perfume.id === 'no-perfume');
                    const isFreeOption = perfume.price === 0;

                    return (
                      <div
                        key={perfume.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'border-brand-accent bg-brand-accentLight/40 ring-2 ring-brand-accent shadow-sm'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">{perfume.icon || '✨'}</span>
                            <span className={`text-xs font-black ${isFreeOption ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded' : 'text-brand-accent'}`}>
                              {isFreeOption ? '₹0 Included' : `+₹${perfume.price}`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-sm text-brand-dark">{perfume.name}</h4>
                            {perfume.rating && (
                              <span className="text-[11px] font-bold text-amber-600">★ {perfume.rating}</span>
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-500 block mb-1.5">
                            {perfume.brand} &bull; {perfume.fragranceFamily}
                          </span>
                          <p className="text-xs text-neutral-600 leading-relaxed mb-3">
                            {perfume.description}
                          </p>

                          {perfume.notes && perfume.notes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {perfume.notes.map((note) => (
                                <span key={note} className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                                  {note}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedPerfume(perfume.id === 'no-perfume' ? null : perfume)}
                          className={`mt-3 w-full py-2 rounded-lg text-xs font-bold transition ${
                            isSelected
                              ? 'bg-brand-accent text-white'
                              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                          }`}
                        >
                          {isSelected ? '✓ Selected' : isFreeOption ? 'Select No Fragrance' : 'Pair With Outfit'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 8: COMPOSITE FINAL PREVIEW */}
            {activeStep === 8 && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    <span>Review your bespoke master pattern specifications before dispatching to the tailor.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveToVault}
                    disabled={savingDesign}
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 text-amber-300 text-xs font-bold hover:bg-black transition shadow-xs disabled:opacity-50"
                  >
                    {savingDesign ? 'Saving...' : '💾 Save to Vault'}
                  </button>
                </div>

                {/* Embedded Reusable CustomizationSummary Component */}
                <CustomizationSummary
                  product={product}
                  customization={currentCustomizationPayload}
                  price={totalPrice}
                  compact={false}
                  showPricing={true}
                  onEdit={(step) => setActiveStep(typeof step === 'number' ? step : 1)}
                  onAddToCart={handleProceedToCart}
                />
              </div>
            )}

            {/* Configurator Navigation Step Controls */}
            <div className="pt-6 border-t border-neutral-100 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={activeStep === 1}
                className="px-4 py-2 rounded-lg border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                &larr; Previous Step
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveToVault}
                  disabled={savingDesign}
                  className="px-4 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  {savingDesign ? 'Saving...' : 'Save Design'}
                </button>

                {activeStep < 8 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-5 py-2 rounded-lg bg-brand-dark text-white text-xs font-bold hover:bg-black transition shadow-sm"
                  >
                    Next: {activeStep === 4 && sizeMode === 'standard' ? 'Fit' : CUSTOMIZATION_STEPS[activeStep]?.title} &rarr;
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleProceedToCart}
                    className="px-6 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accentHover text-white text-xs font-extrabold transition shadow-md"
                  >
                    {editingCartItemId ? 'Update Bag Item →' : 'Add to Bag →'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent">
                    Atelier Summary
                  </span>
                  <h3 className="font-extrabold text-base text-brand-dark">
                    {product.name}
                  </h3>
                </div>
                <span
                  style={{ backgroundColor: activeColorHex }}
                  className="w-5 h-5 rounded-full border border-neutral-300 shadow-xs"
                  title={selectedColor?.name}
                />
              </div>

              {/* Compact Summary Component */}
              <CustomizationSummary
                product={product}
                customization={currentCustomizationPayload}
                price={totalPrice}
                compact={true}
                showPricing={false}
                onEdit={(step) => setActiveStep(typeof step === 'number' ? step : 1)}
              />

              <div className="pt-3 border-t border-neutral-100">
                <Button
                  onClick={activeStep === 8 ? handleProceedToCart : handleNextStep}
                  variant="primary"
                  className="w-full text-xs font-bold"
                >
                  {activeStep === 8 ? (editingCartItemId ? 'Update Bag Item →' : 'Add to Bag →') : `Continue: ${CUSTOMIZATION_STEPS[activeStep]?.title || 'Next'} →`}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal: How to Measure Guide */}
        {guideModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-neutral-200">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="font-extrabold text-base text-brand-dark flex items-center gap-2">
                  <span>📐</span> How to Measure Guide
                </h3>
                <button
                  type="button"
                  onClick={() => setGuideModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-800 text-base font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {Object.entries(MEASUREMENT_GUIDE_DATA).map(([k, guide]) => (
                  <div
                    key={k}
                    className={`p-3.5 rounded-xl border text-xs space-y-1 transition ${
                      activeGuideKey === k
                        ? 'border-brand-accent bg-brand-accentLight/30 ring-1 ring-brand-accent'
                        : 'border-neutral-200 bg-neutral-50'
                    }`}
                  >
                    <div className="font-bold text-brand-dark flex items-center justify-between">
                      <span>{guide.title}</span>
                      {activeGuideKey === k && (
                        <span className="text-[10px] font-bold text-brand-accent uppercase">Selected Metric</span>
                      )}
                    </div>
                    <p className="text-neutral-600 leading-relaxed">
                      {guide.instruction}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-neutral-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setGuideModalOpen(false)}
                  className="px-4 py-2 bg-brand-dark text-white rounded-lg text-xs font-bold hover:bg-black transition"
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
