import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { MOCK_PRODUCTS, getProductImage } from '../../data/mockProducts.js';
import { getProductById } from '../../services/firestoreService.js';
import { saveCustomization } from '../../services/savedCustomizationService.js';
import CustomizationStudioViewer3D from '../../components/customization/CustomizationStudioViewer3D.jsx';
import CustomizationStudioLeftPanel from '../../components/customization/CustomizationStudioLeftPanel.jsx';
import CustomizationStudioControls, { STUDIO_COLORS, STUDIO_FABRICS } from '../../components/customization/CustomizationStudioControls.jsx';

export const FIT_OPTIONS = [
  {
    id: 'slim',
    title: 'Slim Fit',
    desc: 'Closer cut through chest and waist for a tailored, athletic silhouette.',
    image: '/products/customization/fits/slim-fit.jpg'
  },
  {
    id: 'regular',
    title: 'Regular Fit',
    desc: 'Timeless classic comfort drape offering balanced ease of movement.',
    image: '/products/customization/fits/regular-fit.jpg'
  },
  {
    id: 'relaxed',
    title: 'Relaxed Fit',
    desc: 'Generous casual cut with roomier torso and laid-back modern styling.',
    image: '/products/customization/fits/relaxed-fit.jpg'
  }
];

const WORKFLOW_STEPS = [
  { id: 1, label: '1. Product', short: 'Product' },
  { id: 2, label: '2. Upload & Text', short: 'Upload' },
  { id: 3, label: '3. AI Design', short: 'AI Design' },
  { id: 4, label: '4. Size & Color', short: 'Size/Color' },
  { id: 5, label: '5. 3D Studio', short: '3D Studio' },
  { id: 6, label: '6. Preview', short: 'Preview' },
  { id: 7, label: '7. Luxury Extras', short: 'Extras' }
];

export default function CustomizePage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, totalItemsCount = 0 } = useCart();
  const [showAboutModal, setShowAboutModal] = useState(false);

  // 1. Resolve Active Real FITFUSION Product
  // Starts with product 1 ("Classic Crew Neck T-Shirt") or URL param ID
  const [product, setProduct] = useState(() => {
    const targetId = id || '1';
    return MOCK_PRODUCTS.find((p) => String(p.id) === String(targetId)) || MOCK_PRODUCTS[0];
  });

  useEffect(() => {
    const targetId = id || '1';
    const found = MOCK_PRODUCTS.find((p) => String(p.id) === String(targetId));
    if (found) {
      setProduct(found);
      const sizes = found.availableSizes || found.sizes || ['XS', 'S', 'M', 'L', 'XL', '2XL'];
      if (!sizes.includes(selectedSize)) {
        setSelectedSize(sizes[0] || 'M');
      }
    }
    // Reset product-specific upload and generated design to avoid state leakage across products
    if (!location.state?.editConfig) {
      setUploadedImage(null);
      setAiGeneratedDesign(null);
      setAiPrompt('');
      setSelectedPerfume(null);
    }

    // Also check Firestore if available
    let isMounted = true;
    getProductById(targetId).then((res) => {
      if (isMounted && res.success && res.product) {
        setProduct(res.product);
        const sizes = res.product.availableSizes || res.product.sizes || ['XS', 'S', 'M', 'L', 'XL', '2XL'];
        if (!sizes.includes(selectedSize)) {
          setSelectedSize(sizes[0] || 'M');
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Similar products from existing FITFUSION catalog
  const similarProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(
      (p) => p.category === product?.category && String(p.id) !== String(product?.id)
    ).slice(0, 4);
  }, [product?.category, product?.id]);

  // 2. Customization States
  const [activeStep, setActiveStep] = useState(1);
  const [selectedColor, setSelectedColor] = useState(() => STUDIO_COLORS[0]); // White default
  const [selectedFabric, setSelectedFabric] = useState(() => STUDIO_FABRICS[0]); // Cotton default
  const [sizeMode, setSizeMode] = useState('standard');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedFit, setSelectedFit] = useState('Regular');
  const [measurementUnit, setMeasurementUnit] = useState('in');
  const [customMeasurements, setCustomMeasurements] = useState({
    chest: '38',
    waist: '32',
    length: '28',
    shoulder: '17'
  });

  // Text & Graphic customizer states
  const [customText, setCustomText] = useState('GOOD VIBES');
  const [textFont, setTextFont] = useState('Montserrat');
  const [textColor, setTextColor] = useState('#111827');
  const [activePlacement, setActivePlacement] = useState('front'); // 'front' | 'back' | 'left_sleeve'
  const [uploadedImage, setUploadedImage] = useState(null);

  // AI Prompt Design states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState('Minimal');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiGeneratedDesign, setAiGeneratedDesign] = useState(null);

  // Perfume extra
  const [selectedPerfume, setSelectedPerfume] = useState(null);

  // Feedback toast & UI loaders
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isSavingDesign, setIsSavingDesign] = useState(false);

  // Handle loading saved configuration from Cart or Saved Designs
  useEffect(() => {
    if (location.state?.selectedColor) {
      const incomingColor = location.state.selectedColor;
      const matched = STUDIO_COLORS.find(c => c.hex?.toLowerCase() === incomingColor.hex?.toLowerCase() || c.name?.toLowerCase() === incomingColor.name?.toLowerCase());
      setSelectedColor(matched || incomingColor);
    }
    // Live Garment Color Preview (Step 2/4 color selection: onSelect={setSelectedColor})
    if (location.state?.editConfig) {
      const cfg = location.state.editConfig;
      if (cfg.color) {
        const matchCol = STUDIO_COLORS.find(
          (c) => c.name.toLowerCase() === (cfg.color?.name || cfg.color).toLowerCase()
        );
        if (matchCol) setSelectedColor(matchCol);
      }
      if (cfg.fabric) {
        const matchFab = STUDIO_FABRICS.find(
          (f) => f.name.toLowerCase() === (cfg.fabric?.name || cfg.fabric).toLowerCase()
        );
        if (matchFab) setSelectedFabric(matchFab);
      }
      if (cfg.size) setSelectedSize(cfg.size);
      if (cfg.fit) setSelectedFit(cfg.fit);
      if (cfg.customText) setCustomText(cfg.customText);
      if (cfg.customMeasurements) {
        setSizeMode('custom');
        setCustomMeasurements(cfg.customMeasurements);
      }
      if (location.state.initialStep) {
        setActiveStep(location.state.initialStep);
      }
    }
  }, [location.state]);

  // Price Calculation
  const totalPrice = useMemo(() => {
    const base = Number(product?.basePrice || product?.price || 599);
    const fabSurcharge = Number(selectedFabric?.surcharge || 0);
    const perfSurcharge = Number(selectedPerfume?.price || 0);
    return base + fabSurcharge + perfSurcharge;
  }, [product?.basePrice, product?.price, selectedFabric?.surcharge, selectedPerfume?.price]);

  // Handle AI Design Generation
  const handleGenerateAiDesign = useCallback(() => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);

    // Synthesize design on an offscreen canvas with artistic badge & typography
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.clearRect(0, 0, 512, 512);

        // Circular background crest
        const gradient = ctx.createLinearGradient(0, 0, 512, 512);
        gradient.addColorStop(0, '#3B82F6');
        gradient.addColorStop(0.5, '#6366F1');
        gradient.addColorStop(1, '#EC4899');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(256, 256, 200, 0, Math.PI * 2);
        ctx.stroke();

        // Inner decorative circle
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(256, 256, 185, 0, Math.PI * 2);
        ctx.stroke();

        // Mountain graphic silhouette if prompt mentions mountain/nature
        const lowerPrompt = aiPrompt.toLowerCase();
        if (lowerPrompt.includes('mountain') || lowerPrompt.includes('nature') || lowerPrompt.includes('sunset')) {
          // Sunset orb
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(256, 210, 70, 0, Math.PI * 2);
          ctx.fill();

          // Mountain peaks
          ctx.fillStyle = '#1E1B4B';
          ctx.beginPath();
          ctx.moveTo(120, 340);
          ctx.lineTo(256, 160);
          ctx.lineTo(392, 340);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#312E81';
          ctx.beginPath();
          ctx.moveTo(210, 340);
          ctx.lineTo(310, 200);
          ctx.lineTo(410, 340);
          ctx.closePath();
          ctx.fill();
        } else {
          // Abstract geometric star
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '900 120px Montserrat, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✦', 256, 220);
        }

        // Prompt text / Typography overlay
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 32px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 8;
        const bannerText = aiPrompt.length > 20 ? aiPrompt.substring(0, 18).toUpperCase() + '...' : aiPrompt.toUpperCase();
        ctx.fillText(bannerText, 256, 380);
      }

      const generatedUrl = canvas.toDataURL('image/png');
      setAiGeneratedDesign(generatedUrl);
      setIsGeneratingAi(false);

      setFeedbackToast({
        type: 'success',
        message: 'AI Design synthesized and projected onto 3D garment!'
      });
      setTimeout(() => setFeedbackToast(null), 4000);
    }, 900);
  }, [aiPrompt, aiStyle]);

  // Apply Changes Handler (Section 12)
  const handleApplyChanges = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setFeedbackToast({
        type: 'success',
        message: 'Changes applied! 3D garment updated with your custom selections.'
      });
      setTimeout(() => setFeedbackToast(null), 3500);
    }, 400);
  };

  // Add to Existing FITFUSION Cart (Section 14)
  const handleAddToCart = () => {
    setIsAddingToCart(true);

    const customItem = {
      id: `custom-${product.id}-${Date.now()}`,
      productId: String(product.id),
      productName: product.name,
      category: product.category || 'T-Shirts',
      basePrice: Number(product.basePrice || product.price || 599),
      price: totalPrice,
      quantity: 1,
      selectedColor: typeof selectedColor === 'string' ? { name: selectedColor, hex: '#FFFFFF' } : selectedColor,
      selectedFabric: selectedFabric,
      selectedSize: sizeMode === 'standard' ? selectedSize : 'Custom Tailoring',
      selectedFit: selectedFit,
      sizeMode: sizeMode,
      customMeasurements: sizeMode === 'custom' ? customMeasurements : null,
      measurementUnit: measurementUnit,
      customText: customText,
      design: {
        text: customText,
        font: textFont,
        color: textColor,
        placement: activePlacement,
        hasUploadedLogo: Boolean(uploadedImage),
        hasAiDesign: Boolean(aiGeneratedDesign)
      },
      productImage: product.image || getProductImage(product),
      perfume: selectedPerfume,
      customizationState: {
        color: selectedColor,
        fabric: selectedFabric,
        size: selectedSize,
        fit: selectedFit,
        text: customText,
        placement: activePlacement
      }
    };

    try {
      addToCart(customItem);
      setFeedbackToast({
        type: 'success',
        message: `"${product.name}" added to cart with custom 3D specifications!`
      });
      setTimeout(() => {
        setIsAddingToCart(false);
        navigate('/cart');
      }, 700);
    } catch (err) {
      console.error('[CustomizePage] Add to cart error:', err);
      setIsAddingToCart(false);
      setFeedbackToast({
        type: 'error',
        message: 'Could not add to cart. Please try again.'
      });
    }
  };

  // Save Design for later
  const handleSaveDesign = async () => {
    setIsSavingDesign(true);
    try {
      const designPayload = {
        productId: String(product.id),
        productName: product.name,
        category: product.category,
        totalPrice: totalPrice,
        customization: {
          color: selectedColor,
          fabric: selectedFabric,
          size: selectedSize,
          fit: selectedFit,
          customText: customText,
          placement: activePlacement,
          customMeasurements: sizeMode === 'custom' ? customMeasurements : null
        },
        image: product.image || getProductImage(product),
        createdAt: new Date().toISOString()
      };

      await saveCustomization(user?.uid || 'anonymous', designPayload);
      setFeedbackToast({
        type: 'success',
        message: 'Your custom 3D design has been saved to your profile!'
      });
      setTimeout(() => setFeedbackToast(null), 4000);
    } catch (err) {
      console.error('[CustomizePage] Save design error:', err);
      setFeedbackToast({
        type: 'error',
        message: 'Failed to save design. Please try again.'
      });
    } finally {
      setIsSavingDesign(false);
    }
  };

  // Switch to similar product from catalog
  const handleSelectSimilarProduct = (simProduct) => {
    navigate(`/customize/${simProduct.id}`);
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-neutral-100 flex flex-col font-sans">
      {/* ── Top Header: FITFUSION Customization Studio Branding ────────── */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-neutral-800/80 px-4 lg:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand Logo & Navigation Links */}
          <div className="flex items-center gap-6">
            <Link to="/home" className="flex items-center gap-2.5 group">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                FF
              </span>
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                <span>FITFUSION</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-1.5 py-0.5 rounded">
                  3D
                </span>
              </span>
            </Link>

            {/* Desktop Navigation Links: Home, Shop, Customize, Virtual Try-On, About */}
            <nav className="hidden md:flex items-center space-x-1 pl-2 border-l border-neutral-800">
              <Link
                to="/home"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/shop"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
              >
                Shop
              </Link>
              <Link
                to="/customize"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-indigo-500/50 shadow-md shadow-indigo-500/20"
              >
                Customize
              </Link>
              <Link
                to="/virtual-try-on"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
              >
                Virtual Try-On
              </Link>
              <button
                type="button"
                onClick={() => setShowAboutModal(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
              >
                About
              </button>
            </nav>
          </div>

          {/* Quick Price & Action bar */}
          <div className="flex items-center gap-4 self-end md:self-auto">
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 block uppercase font-bold tracking-wider">Estimated Total</span>
              <span className="text-base font-black text-blue-400">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalPrice)}
              </span>
            </div>

            {/* Cart Icon Link */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="View Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="py-2 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>🛒</span>
              <span>Checkout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden max-w-7xl mx-auto mt-2 pt-2 border-t border-neutral-800/60 flex items-center justify-around text-xs">
          <Link to="/home" className="text-neutral-400 hover:text-white font-medium py-1">Home</Link>
          <Link to="/shop" className="text-neutral-400 hover:text-white font-medium py-1">Shop</Link>
          <Link to="/customize" className="text-blue-400 font-bold py-1">Customize</Link>
          <Link to="/virtual-try-on" className="text-neutral-400 hover:text-white font-medium py-1">Try-On</Link>
          <button type="button" onClick={() => setShowAboutModal(true)} className="text-neutral-400 hover:text-white font-medium py-1">About</button>
        </div>

        {/* ── Workflow Step Progress Bar (7 Steps) ─────────────────────── */}
        <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-neutral-800/60 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 min-w-max pb-1">
            {WORKFLOW_STEPS.map((step) => {
              const isCurrent = activeStep === step.id;
              const isPast = activeStep > step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : isPast
                      ? 'bg-neutral-900/90 text-blue-400 hover:bg-neutral-800 border border-neutral-800'
                      : 'bg-neutral-900/40 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-850'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
                      isCurrent
                        ? 'bg-white text-blue-600 font-bold'
                        : isPast
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    {isPast ? '✓' : step.id}
                  </span>
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>


      {/* ── Toast Notification ────────────────────────────────────────── */}
      {feedbackToast && (
        <div className="fixed top-20 right-6 z-50 animate-fade-in-up">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border text-xs font-bold flex items-center gap-2.5 ${
              feedbackToast.type === 'error'
                ? 'bg-red-950/90 border-red-800 text-red-200'
                : 'bg-neutral-900/95 border-blue-500/50 text-white shadow-blue-500/20'
            }`}
          >
            <span>{feedbackToast.type === 'error' ? '⚠️' : '✨'}</span>
            <span>{feedbackToast.message}</span>
          </div>
        </div>
      )}

      {/* ── Main Pro Studio Layout (3-Column Desktop, Stacked Mobile) ─── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Product Overview & Catalog Navigation (Cols: 3) */}
        <div className="lg:col-span-3 w-full">
          <CustomizationStudioLeftPanel
            product={product}
            similarProducts={similarProducts}
            onSelectSimilarProduct={handleSelectSimilarProduct}
            activeStep={activeStep}
            onSelectStep={setActiveStep}
          />
        </div>

        {/* CENTER COLUMN: Genuine 3D Garment Viewer (Cols: 5) ───────────── */}
        <div className="lg:col-span-5 w-full flex flex-col gap-4">
          <CustomizationStudioViewer3D
            product={product}
            selectedColor={selectedColor}
            selectedFabric={selectedFabric}
            activePlacement={activePlacement}
            customText={customText}
            textFont={textFont}
            textColor={textColor}
            uploadedImage={uploadedImage}
            aiGeneratedDesign={aiGeneratedDesign}
            autoRotateDefault={false}
          />
        </div>

        {/* RIGHT COLUMN: Customization Step Controls (Cols: 4) ──────────── */}
        <div className="lg:col-span-4 w-full">
          <CustomizationStudioControls
            product={product}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedFabric={selectedFabric}
            setSelectedFabric={setSelectedFabric}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            selectedFit={selectedFit}
            setSelectedFit={setSelectedFit}
            sizeMode={sizeMode}
            setSizeMode={setSizeMode}
            customMeasurements={customMeasurements}
            setCustomMeasurements={setCustomMeasurements}
            measurementUnit={measurementUnit}
            setMeasurementUnit={setMeasurementUnit}
            customText={customText}
            setCustomText={setCustomText}
            textFont={textFont}
            setTextFont={setTextFont}
            textColor={textColor}
            setTextColor={setTextColor}
            activePlacement={activePlacement}
            setActivePlacement={setActivePlacement}
            uploadedImage={uploadedImage}
            setUploadedImage={setUploadedImage}
            aiPrompt={aiPrompt}
            setAiPrompt={setAiPrompt}
            aiStyle={aiStyle}
            setAiStyle={setAiStyle}
            onGenerateAiDesign={handleGenerateAiDesign}
            isGeneratingAi={isGeneratingAi}
            aiGeneratedDesign={aiGeneratedDesign}
            onApplyChanges={handleApplyChanges}
            isApplying={isApplying}
            onAddToCart={handleAddToCart}
            isAddingToCart={isAddingToCart}
            onSaveDesign={handleSaveDesign}
            isSavingDesign={isSavingDesign}
            selectedPerfume={selectedPerfume}
            setSelectedPerfume={setSelectedPerfume}
            totalPrice={totalPrice}
          />
        </div>
      </main>

      {/* ── Bottom Feature Section for Rotation, Realistic Materials, Color Customization, and Fit ── */}
      <section className="max-w-7xl w-full mx-auto px-4 lg:px-6 py-8 border-t border-neutral-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-sm shadow-blue-500/50" />
              <span>Studio 3D Engineering & Customization Highlights</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Interactive WebGL graphics, authentic PBR optical simulation, and precision tailoring.
            </p>
          </div>
          <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-2.5 py-1 rounded-full w-fit">
            Three.js &bull; 10,513 Vertices
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. 360° Rotation */}
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-indigo-500/50 backdrop-blur-md transition-all group shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-sm text-white">360° Rotation</h4>
              <span className="text-[10px] font-semibold text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded">Orbital</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Smooth full-range orbit navigation, quick front/back/profile angle presets, and auto-rotation.
            </p>
          </div>

          {/* 2. Realistic PBR Materials */}
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-indigo-500/50 backdrop-blur-md transition-all group shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-sm text-white">Realistic Materials</h4>
              <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded">PBR Shaders</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Optical physics shaders calculate real fabric roughness, weave texture, sheen, and studio shadow drop.
            </p>
          </div>

          {/* 3. Color Customization */}
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-purple-500/50 backdrop-blur-md transition-all group shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600/20 to-pink-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4 4 4 0 014-4c.48 0 .93.08 1.34.23L16.2 3.37a2 2 0 012.83 0l1.6 1.6a2 2 0 010 2.83L10.77 17.66c.15.41.23.86.23 1.34a4 4 0 01-4 4z" />
              </svg>
            </div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-sm text-white">Color Customization</h4>
              <span className="text-[10px] font-semibold text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded">16 Swatches</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Live multi-palette reactive tinting updates garment meshes instantly without disturbing backdrop or studio lights.
            </p>
          </div>

          {/* 4. Precision Fit & Sizing */}
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-blue-500/50 backdrop-blur-md transition-all group shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-sm text-white">Precision Fit</h4>
              <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded">Tailored</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Configure Slim, Regular, or Relaxed cuts, or input bespoke measurements for a personalized fit.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer / Trust Badges ─────────────────────────────────────── */}
      <footer className="mt-auto border-t border-neutral-900 bg-[#06080E] px-4 py-4 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} FITFUSION Customization Studio. All rights reserved.</span>
          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <span>Genuine 3D WebGL</span>
            <span>&bull;</span>
            <span>High Precision Tailoring</span>
            <span>&bull;</span>
            <span>Authentic Real Photography Catalog</span>
          </div>
        </div>
      </footer>

      {/* ── About FITFUSION Studio Modal ─────────────────────────────── */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B0F19] border border-neutral-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-600/30">
                FF
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">About FITFUSION</h3>
                <p className="text-xs text-neutral-400">Next-Gen Bespoke 3D Customization</p>
              </div>
            </div>
            <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
              <p>
                FITFUSION brings haute couture and contemporary apparel personalization together through real-time 3D WebGL rendering, physically-based materials, and surface decals.
              </p>
              <p>
                Every garment is calibrated with exact millimeter geometry, high vertex fidelity, and adaptive lighting to give you an uncompromising preview before tailoring.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

