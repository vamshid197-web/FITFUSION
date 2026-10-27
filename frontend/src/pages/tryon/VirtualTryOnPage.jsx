import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import { MOCK_PRODUCTS, getProductImage } from '../../data/mockProducts.js';
import { getProductById } from '../../services/firestoreService.js';
import { useCart } from '../../context/CartContext.jsx';
import { VTONClientService } from '../../services/vtonClientService.js';
import {
  analyzePhotoAesthetics,
  getOutfitRecommendations
} from '../../services/aiTryOnRecommendationService.js';
import PhotoUploadExperience from '../../components/tryon/PhotoUploadExperience.jsx';
import OutfitRecommendationsTray from '../../components/tryon/OutfitRecommendationsTray.jsx';
import TryOnResultView from '../../components/tryon/TryOnResultView.jsx';
import CustomizationStudioViewer3D from '../../components/customization/CustomizationStudioViewer3D.jsx';
import ProductImage from '../../components/common/ProductImage.jsx';
import { getProduct3DModel } from '../../data/clothing3DRegistry.js';
import CustomGarmentUpload from '../../components/tryon/CustomGarmentUpload.jsx';
import TryOnInputPreview from '../../components/tryon/TryOnInputPreview.jsx';
import KolorsStudioView from '../../components/tryon/KolorsStudioView.jsx';
import LiveTryOnStudio from '../../components/tryon/LiveTryOnStudio.jsx';

/**
 * Quick Garment Category Selector Options
 */
export const GARMENT_SELECTOR_OPTIONS = [
  { id: 'tshirt', label: 'T-Shirt', category: 'T-Shirts', icon: '👕' },
  { id: 'shirt', label: 'Shirt', category: 'Shirts', icon: '👔' },
  { id: 'hoodie', label: 'Hoodie', category: 'Hoodies', icon: '🧥' },
  { id: 'jacket', label: 'Jacket', category: 'Jackets', icon: '🧥' },
  { id: 'dress', label: 'Dress', category: 'Dresses', icon: '👗' },
  { id: 'kurta', label: 'Kurta', category: 'Traditional Wear', icon: '🥻' }
];

export default function VirtualTryOnPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Route-based experience tab:
  // 'ai_tryon' (FITFUSION AI Try-On, Default) | 'live_studio' (In-App Live Try-On Studio) | 'kolors_studio' (Original Kolors Studio) | 'studio3d' (3D Garment Studio)
  const initialExperience = useMemo(() => {
    const tabParam = searchParams.get('tab') || location.state?.tab;
    if (tabParam === 'live_studio' || tabParam === 'anywear_live' || tabParam === 'anywear' || tabParam === 'live' || tabParam === 'webcam') {
      return 'live_studio';
    }
    if (tabParam === 'kolors_studio' || tabParam === 'kolors') {
      return 'kolors_studio';
    }
    if (tabParam === 'studio3d' || tabParam === 'studio' || location.pathname.includes('studio')) {
      return 'studio3d';
    }
    return 'ai_tryon';
  }, [searchParams, location.pathname, location.state]);

  const [activeExperience, setActiveExperience] = useState(initialExperience);
  const [outfitSelectionMode, setOutfitSelectionMode] = useState('catalog'); // 'catalog' | 'custom_upload'

  // ── Selected Garment & Catalog State ─────────────────────────────────────
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  // ── Customization State ──────────────────────────────────────────────────
  const [customization, setCustomization] = useState({
    color: { name: 'Obsidian Black', hex: '#111827' },
    fabric: { name: 'Certified Cotton', composition: '100% Organic' },
    size: 'M',
    fit: 'Regular',
    monogramText: ''
  });

  // Track if customization options were changed after generating a try-on
  const [hasChangedOptionsSinceGeneration, setHasChangedOptionsSinceGeneration] = useState(false);

  // ── Kolors Photo Try-On Workflow State ───────────────────────────────────
  // Step 1: Upload Your Photo
  // Step 2: Select Your Outfit
  // Step 3: Generate AI Try-On
  // Step 4: Preview Result
  const [currentStep, setCurrentStep] = useState(1);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userPhotoFile, setUserPhotoFile] = useState(null);
  const [photoAesthetics, setPhotoAesthetics] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [recFilters, setRecFilters] = useState({
    style: 'all',
    occasion: 'all',
    budget: 'all',
    category: 'all'
  });

  // Generation & Engine States
  const [isGeneratingVTON, setIsGeneratingVTON] = useState(false);
  const [generationStage, setGenerationStage] = useState('');
  const [vtonResultImage, setVtonResultImage] = useState(null);
  const [vtonError, setVtonError] = useState(null);
  const [vtonInstructions, setVtonInstructions] = useState(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [backendStatus, setBackendStatus] = useState(null);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);

  // Full Catalog Modal State
  const [isCatalogPickerOpen, setIsCatalogPickerOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('All');

  // UI Toast Notices
  const [cartSuccessNotice, setCartSuccessNotice] = useState('');

  const abortControllerRef = useRef(null);
  const currentRequestIdRef = useRef(0);

  // ── 1. Query Backend Kolors VTON Service Status ──────────────────────────
  useEffect(() => {
    let isMounted = true;
    async function checkEngineStatus() {
      try {
        const status = await VTONClientService.checkStatus();
        if (isMounted) {
          setBackendStatus(status);
          if (status?.isCooldownActive && status?.cooldownSecondsRemaining > 0) {
            setCooldownSeconds(status.cooldownSecondsRemaining);
          }
        }
      } catch {
        // Handled gracefully in UI
      }
    }
    checkEngineStatus();
    return () => { isMounted = false; };
  }, []);

  // ── 2. Cooldown Timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // ── 3. Initialize Base Product from Route, Query Param, or State ─────────
  useEffect(() => {
    let isMounted = true;
    async function loadProductData() {
      try {
        setLoadingProduct(true);
        let product = null;

        const queryId = searchParams.get('productId') || searchParams.get('id') || searchParams.get('product');
        const targetId = id || queryId || location.state?.productId || location.state?.product?.id;

        if (targetId) {
          product = await getProductById(targetId);
          if (!product) {
            product = MOCK_PRODUCTS.find((p) => String(p.id) === String(targetId));
          }
        }

        if (!product && location.state?.product) {
          product = location.state.product;
        }

        if (!product) {
          product = MOCK_PRODUCTS[0];
        }

        if (isMounted && product) {
          setSelectedProduct(product);
          if (location.state?.customization) {
            setCustomization((prev) => ({
              ...prev,
              ...location.state.customization
            }));
          } else if (product.availableColors && product.availableColors[0]) {
            setCustomization((prev) => ({
              ...prev,
              color: product.availableColors[0]
            }));
          }
        }
      } catch (err) {
        console.warn('[VirtualTryOnPage] Error resolving product:', err);
      } finally {
        if (isMounted) setLoadingProduct(false);
      }
    }
    loadProductData();
    return () => { isMounted = false; };
  }, [id, searchParams, location.state]);

  // ── 4. Photo Handlers ────────────────────────────────────────────────────
  const handlePhotoUploaded = useCallback((dataUrl, file) => {
    setUserPhoto(dataUrl);
    setUserPhotoFile(file || null);

    // Compute aesthetic analysis & stylized outfit recommendations
    const aesthetics = analyzePhotoAesthetics(dataUrl, null);
    setPhotoAesthetics(aesthetics);

    const recs = getOutfitRecommendations({
      aesthetics,
      allProducts: MOCK_PRODUCTS,
      filters: recFilters
    });
    setRecommendations(recs);
  }, [recFilters]);

  const handlePhotoConfirmed = useCallback((dataUrl, file) => {
    handlePhotoUploaded(dataUrl, file);
    setCurrentStep(2); // Advance to Outfit Selection
  }, [handlePhotoUploaded]);

  // ── 5. Garment Selection & Customization Handlers ─────────────────────────
  const handleSelectProduct = useCallback((product) => {
    setSelectedProduct(product);
    setIsCatalogPickerOpen(false);

    if (product?.availableColors && product.availableColors[0]) {
      setCustomization((prev) => ({
        ...prev,
        color: product.availableColors[0]
      }));
    }

    // Reset previous generation result when switching products to prevent showing stale outfits
    setVtonResultImage(null);
    setHasChangedOptionsSinceGeneration(false);
  }, []);

  const handleUpdateCustomization = useCallback((field, value) => {
    setCustomization((prev) => ({
      ...prev,
      [field]: value
    }));
    if (vtonResultImage) {
      setHasChangedOptionsSinceGeneration(true);
    }
  }, [vtonResultImage]);

  const handleFilterChange = useCallback((filterTypeOrObject, value) => {
    let updated;
    if (typeof filterTypeOrObject === 'object' && filterTypeOrObject !== null) {
      updated = { ...recFilters, ...filterTypeOrObject };
    } else {
      updated = { ...recFilters, [filterTypeOrObject]: value };
    }
    setRecFilters(updated);
    const recs = getOutfitRecommendations({
      aesthetics: photoAesthetics,
      allProducts: MOCK_PRODUCTS,
      filters: updated
    });
    setRecommendations(recs);
  }, [recFilters, photoAesthetics]);

  // ── 6. Kolors Virtual Try-On Generation Dispatcher ───────────────────────
  const handleGenerateTryOn = useCallback(async () => {
    if (!userPhoto) {
      setCurrentStep(1);
      return;
    }

    if (!selectedProduct) {
      setCurrentStep(2);
      return;
    }

    // Assign unique request ID to prevent stale async responses
    const requestId = ++currentRequestIdRef.current;

    try {
      setIsGeneratingVTON(true);
      setVtonError(null);
      setVtonInstructions(null);
      setVtonResultImage(null); // Clear previous result state
      setCurrentStep(4); // Advance immediately to Step 4 so user sees active neural generation progress, real stages, and cancel controls
      setGenerationStage('Validating photograph & garment specifications...');

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const garmentImg = selectedProduct.image || getProductImage(selectedProduct);

      // Simulation stages for user transparency
      setTimeout(() => {
        if (currentRequestIdRef.current === requestId) {
          setGenerationStage('Dispatching to Kolors AI Virtual Try-On engine...');
        }
      }, 700);

      setTimeout(() => {
        if (currentRequestIdRef.current === requestId) {
          setGenerationStage('Neural diffusion: synthesizing authentic garment texture and lighting...');
        }
      }, 2500);

      setTimeout(() => {
        if (currentRequestIdRef.current === requestId) {
          setGenerationStage('Preserving natural posture, identity, and compositing result...');
        }
      }, 5000);

      const res = await VTONClientService.generateTryOn({
        personImage: userPhoto,
        garmentImage: garmentImg,
        garmentCategory: selectedProduct.category,
        productId: String(selectedProduct.id),
        productName: selectedProduct.name,
        options: customization,
        signal: abortControllerRef.current.signal
      });

      // Ignore if superseded or cancelled
      if (currentRequestIdRef.current !== requestId) {
        return;
      }

      if (!res.success) {
        setVtonError(res.error || 'Kolors Virtual Try-On service returned an issue.');
        setVtonInstructions(res.instructions || null);
        if (res.cooldownSeconds) {
          setCooldownSeconds(res.cooldownSeconds);
        }
        setIsGeneratingVTON(false);
        setGenerationStage('');
        return;
      }

      setVtonResultImage(res.resultImageUrl);
      setHasChangedOptionsSinceGeneration(false);
      setIsGeneratingVTON(false);
      setGenerationStage('');
    } catch (err) {
      if (currentRequestIdRef.current !== requestId) {
        return;
      }
      if (err.name === 'AbortError') {
        setIsGeneratingVTON(false);
        setGenerationStage('');
        return;
      }
      setIsGeneratingVTON(false);
      setGenerationStage('');
      setVtonError(err.message || 'An error occurred during virtual try-on processing.');
    }
  }, [userPhoto, selectedProduct, customization]);

  const handleCancelGeneration = useCallback(() => {
    currentRequestIdRef.current += 1;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGeneratingVTON(false);
    setGenerationStage('');
    setCurrentStep(3); // Return to input pairing preview
  }, []);

  // ── 7. Try Another Outfit & Reset All Handlers ───────────────────────────
  const handleSelectAnotherOutfit = useCallback(() => {
    setVtonResultImage(null);
    setVtonError(null);
    setVtonInstructions(null);
    setCurrentStep(2); // Keeps userPhoto intact, returns to outfit selection
  }, []);

  const handleResetAll = useCallback(() => {
    currentRequestIdRef.current += 1;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGeneratingVTON(false);
    setGenerationStage('');
    setUserPhoto(null);
    setUserPhotoFile(null);
    setVtonResultImage(null);
    setVtonError(null);
    setVtonInstructions(null);
    setHasChangedOptionsSinceGeneration(false);
    setCurrentStep(1); // Return to step 1
  }, []);

  // ── 8. Add to Bag ────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(() => {
    if (!selectedProduct) return;
    addToCart({
      ...selectedProduct,
      customization: {
        color: customization.color,
        fabric: customization.fabric,
        size: customization.size,
        fit: customization.fit,
        vtonPreviewImage: vtonResultImage || null
      }
    });

    setCartSuccessNotice(`Added ${selectedProduct.name} (${customization.size}, ${customization.color.name}) to your bag!`);
    setTimeout(() => setCartSuccessNotice(''), 5000);
  }, [selectedProduct, customization, vtonResultImage, addToCart]);

  // Filter catalog modal items
  // Filter catalog modal items
  const uniqueCategories = useMemo(() => {
    const set = new Set((MOCK_PRODUCTS || []).map((p) => p?.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, []);

  const filteredCatalog = useMemo(() => {
    return (MOCK_PRODUCTS || []).filter((p) => {
      if (!p) return false;
      const matchesSearch = !catalogSearch ||
        p.name?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        p.category?.toLowerCase().includes(catalogSearch.toLowerCase());
      const matchesCat = catalogCategory === 'All' || p.category === catalogCategory;
      return matchesSearch && matchesCat;
    });
  }, [catalogSearch, catalogCategory]);

  // Consistent reference for catalog filtering across all views
  const filteredCatalogProducts = filteredCatalog;

  return (
    <PageContainer>
      <div className="space-y-6 max-w-7xl mx-auto pb-20">
        {/* ── TOP HEADER & 3-WAY EXPERIENCE SWITCHER (FITFUSION AI / KOLORS STUDIO / 3D STUDIO) ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                FITFUSION AI LABS
              </span>
              <span className="text-neutral-500 text-xs">• Kolors AI Photo Try-On, Live Try-On Studio & 3D Garment Studio</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1.5 tracking-tight">
              Virtual Try-On & Garment Studio
            </h1>
            <p className="text-xs md:text-sm text-neutral-400 mt-1 max-w-2xl">
              Switch between our integrated AI photo try-on, in-app live camera try-on studio, Kwai-Kolors studio reference, or customize garments in 360° 3D.
            </p>
          </div>

          {/* Experience Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800 shadow-xl shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveExperience('ai_tryon');
                setSearchParams({ tab: 'ai_tryon' });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeExperience === 'ai_tryon'
                  ? 'bg-amber-500 text-neutral-950 font-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>✨</span>
              <span>FITFUSION AI TRY-ON</span>
              <span className="hidden sm:inline text-[10px] font-normal opacity-80">(AI Photo Try-On)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveExperience('live_studio');
                setSearchParams({ tab: 'live_studio' });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeExperience === 'live_studio' || activeExperience === 'anywear_live'
                  ? 'bg-amber-500 text-neutral-950 font-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>📹</span>
              <span>LIVE TRY-ON STUDIO</span>
              <span className="hidden sm:inline text-[10px] font-normal opacity-80">(Webcam)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveExperience('kolors_studio');
                setSearchParams({ tab: 'kolors_studio' });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeExperience === 'kolors_studio'
                  ? 'bg-amber-500 text-neutral-950 font-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>🎨</span>
              <span>KOLORS STUDIO</span>
              <span className="hidden sm:inline text-[10px] font-normal opacity-80">(Original App)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveExperience('studio3d');
                setSearchParams({ tab: 'studio3d' });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeExperience === 'studio3d'
                  ? 'bg-amber-500 text-neutral-950 font-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>🌐</span>
              <span>3D GARMENT STUDIO</span>
            </button>
          </div>
        </div>

        {/* Global Cart Toast */}
        {cartSuccessNotice && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-xs text-emerald-200 font-bold flex items-center justify-between shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-2">
              <span>✓</span> {cartSuccessNotice}
            </div>
            <Link to="/cart" className="text-amber-400 underline font-bold hover:text-white">
              View Bag &rarr;
            </Link>
          </div>
        )}

        {/* ========================================================================= */}
        {/* EXPERIENCE 1: KOLORS AI PHOTO VIRTUAL TRY-ON (5-STEP RESPONSIVE WORKFLOW) */}
        {/* ========================================================================= */}
        {activeExperience === 'ai_tryon' && (
          <div className="space-y-6 animate-fadeIn">
            {/* AI Provider Status Banner (Clear provider-not-configured state) */}
            {backendStatus && !backendStatus.authenticated && (
              <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-amber-950/20 border border-amber-500/40 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xl font-bold shrink-0 shadow-inner">
                    🔑
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        AI Provider Setup Required
                      </span>
                      <span className="text-neutral-500 text-xs">• Kwai-Kolors Virtual Try-On</span>
                    </div>
                    <h3 className="text-sm font-extrabold text-white mt-0.5">
                      Connect Kolors AI Provider Credentials
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">
                      Virtual Try-On is integrated with a modular backend adapter. Configure <code className="text-amber-300 font-mono">FAL_KEY</code> (recommended) or free <code className="text-amber-300 font-mono">HF_TOKEN</code> in <code className="text-amber-300 font-mono">backend/.env</code> to enable live neural synthesis.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsProviderModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider transition shadow-lg shrink-0 self-end sm:self-auto flex items-center gap-1.5 active:scale-95"
                >
                  <span>⚙️</span> View Setup Guide
                </button>
              </div>
            )}

            {backendStatus && backendStatus.authenticated && (
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-md">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-neutral-300">
                    AI Provider Online: <strong className="text-emerald-400 font-mono uppercase">{backendStatus.provider}</strong> (Kolors Virtual Try-On)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProviderModalOpen(true)}
                  className="text-[11px] text-amber-400 hover:underline font-bold"
                >
                  Provider Info ℹ️
                </button>
              </div>
            )}


            {/* 4-Step Interactive Progress Stepper */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-3.5 shadow-xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  {
                    step: 1,
                    title: '1. Upload Photo',
                    desc: userPhoto ? 'Photo Uploaded' : 'Drop or browse photo',
                    ready: Boolean(userPhoto)
                  },
                  {
                    step: 2,
                    title: '2. Select Outfit',
                    desc: selectedProduct ? selectedProduct.name : 'Choose garment',
                    ready: Boolean(selectedProduct)
                  },
                  {
                    step: 3,
                    title: '3. Generate Try-On',
                    desc: isGeneratingVTON ? 'Diffusing...' : 'Preview input pairing',
                    ready: isGeneratingVTON || Boolean(vtonResultImage)
                  },
                  {
                    step: 4,
                    title: '4. Preview Result',
                    desc: vtonResultImage ? 'Comparison ready' : 'Review try-on',
                    ready: Boolean(vtonResultImage)
                  }
                ].map((s) => {
                  const isActive = currentStep === s.step;
                  const isDone = s.ready && currentStep > s.step;

                  return (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => {
                        if (s.step === 1) setCurrentStep(1);
                        else if (s.step === 2 && userPhoto) setCurrentStep(2);
                        else if (s.step === 3 && userPhoto && selectedProduct) setCurrentStep(3);
                        else if (s.step === 4 && vtonResultImage) setCurrentStep(4);
                      }}
                      className={`text-left p-3 rounded-2xl transition-all border flex items-center gap-3 ${
                        isActive
                          ? 'bg-amber-500/10 border-amber-500/50 text-white ring-1 ring-amber-500/40 shadow-inner'
                          : isDone
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-neutral-300'
                          : 'bg-neutral-950/40 border-neutral-800 text-neutral-500'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          isActive
                            ? 'bg-amber-500 text-neutral-950'
                            : isDone
                            ? 'bg-emerald-500 text-neutral-950'
                            : 'bg-neutral-800 text-neutral-500'
                        }`}
                      >
                        {isDone ? '✓' : s.step}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate text-white">{s.title}</p>
                        <p className="text-[11px] text-neutral-400 truncate">{s.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 1: Upload Your Photo (Zero camera access, 100% file upload & validation) */}
            {currentStep === 1 && (
              <PhotoUploadExperience
                onPhotoConfirmed={handlePhotoConfirmed}
                onPhotoUploaded={handlePhotoUploaded}
                selectedProduct={selectedProduct}
                onChangeGarment={() => {
                  setOutfitSelectionMode('catalog');
                  setIsCatalogPickerOpen(true);
                }}
              />
            )}

            {/* STEP 2: Select Your Outfit (Catalog Recommendations OR Custom Garment Upload) */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 bg-neutral-900/90 p-1.5 rounded-2xl border border-neutral-800 w-fit">
                  <button
                    type="button"
                    onClick={() => setOutfitSelectionMode('catalog')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      outfitSelectionMode === 'catalog'
                        ? 'bg-amber-500 text-neutral-950 font-black shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>🛍️</span> Select Outfit from Catalog
                  </button>

                  <button
                    type="button"
                    onClick={() => setOutfitSelectionMode('custom_upload')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      outfitSelectionMode === 'custom_upload'
                        ? 'bg-amber-500 text-neutral-950 font-black shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>📤</span> Upload Custom Garment
                  </button>
                </div>

                {outfitSelectionMode === 'catalog' ? (
                  <OutfitRecommendationsTray
                    recommendations={recommendations}
                    photoAesthetics={photoAesthetics}
                    selectedProduct={selectedProduct}
                    onSelectProduct={(prod) => {
                      handleSelectProduct(prod);
                      setCurrentStep(3);
                    }}
                    activeFilters={recFilters}
                    onFilterChange={handleFilterChange}
                    onBrowseAllCatalog={() => setIsCatalogPickerOpen(true)}
                    onProceedToTryOn={() => setCurrentStep(3)}
                    userPhoto={userPhoto}
                    onChangePhoto={() => {
                      setUserPhoto(null);
                      setCurrentStep(1);
                    }}
                    isCooldownActive={cooldownSeconds > 0}
                    cooldownSeconds={cooldownSeconds}
                  />
                ) : (
                  <CustomGarmentUpload
                    onGarmentSelected={(custom) => {
                      setSelectedProduct(custom);
                      setCurrentStep(3);
                    }}
                    onCancel={() => setOutfitSelectionMode('catalog')}
                    currentGarment={selectedProduct?.isCustomGarment ? selectedProduct : null}
                  />
                )}
              </div>
            )}

            {/* STEP 3: Preview Input Pairing & Pre-Generation Verification */}
            {currentStep === 3 && (
              <TryOnInputPreview
                userPhoto={userPhoto}
                selectedProduct={selectedProduct}
                customization={customization}
                onChangePhoto={() => setCurrentStep(1)}
                onChangeGarment={() => setCurrentStep(2)}
                onGenerateTryOn={handleGenerateTryOn}
                isGenerating={isGeneratingVTON}
                isCooldownActive={cooldownSeconds > 0}
                cooldownSeconds={cooldownSeconds}
                backendStatus={backendStatus}
              />
            )}

            {/* STEP 4: Active Generation or Preview Result View */}
            {currentStep === 4 && (
              <TryOnResultView
                userPhoto={userPhoto}
                resultImage={vtonResultImage}
                selectedProduct={selectedProduct}
                isGenerating={isGeneratingVTON}
                generationStage={generationStage}
                onCancelGeneration={handleCancelGeneration}
                onRetryGeneration={handleGenerateTryOn}
                onSelectAnotherOutfit={handleSelectAnotherOutfit}
                onResetAll={handleResetAll}
                onAddToCart={handleAddToCart}
                onOpenIn3DStudio={() => setActiveExperience('studio3d')}
                error={vtonError}
                instructions={vtonInstructions}
                cooldownSeconds={cooldownSeconds}
                isCooldownActive={cooldownSeconds > 0}
                customization={customization}
                hasChangedOptionsSinceGeneration={hasChangedOptionsSinceGeneration}
              />
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* EXPERIENCE: LIVE TRY-ON STUDIO (IN-APP WEBCAM & OUTFIT STUDIO)            */}
        {/* ========================================================================= */}
        {(activeExperience === 'live_studio' || activeExperience === 'anywear_live') && (
          <LiveTryOnStudio
            catalogProducts={filteredCatalogProducts}
            selectedProduct={selectedProduct}
            onSelectProduct={handleSelectProduct}
            onTakeSnapshot={(photoDataUrl) => {
              setUserPhoto(photoDataUrl);
              setActiveExperience('ai_tryon');
              setCurrentStep(3);
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* EXPERIENCE: KOLORS STUDIO (ORIGINAL REFERENCE APPLICATION BY KWAI)        */}
        {/* ========================================================================= */}
        {activeExperience === 'kolors_studio' && (
          <KolorsStudioView />
        )}

        {/* ========================================================================= */}
        {/* EXPERIENCE 2: 3D GARMENT STUDIO (INTERACTIVE THREE.JS VIEWER - PRESERVED) */}
        {/* ========================================================================= */}
        {activeExperience === 'studio3d' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
                  Interactive 3D Garment Studio
                </span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">
                  {selectedProduct?.name || 'Garment Studio'}
                </h2>
                <p className="text-xs text-neutral-400">
                  Full 360° orbit rotation, PBR fabric simulation, color customization, and synchronized catalog details.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCatalogPickerOpen(true)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition"
                >
                  ↺ Switch Product
                </button>

                <button
                  type="button"
                  onClick={() => setActiveExperience('ai_tryon')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider transition shadow"
                >
                  ✨ Kolors AI Try-On &rarr;
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 min-h-[520px] rounded-3xl overflow-hidden border border-neutral-800 bg-[#0B0F19] shadow-2xl relative">
                <CustomizationStudioViewer3D
                  product={selectedProduct}
                  selectedColor={customization.color}
                  selectedFabric={customization.fabric}
                  autoRotateDefault={false}
                />
              </div>

              <div className="space-y-6">
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div>
                      <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        {selectedProduct?.category}
                      </span>
                      <h3 className="text-base font-extrabold text-white">
                        {selectedProduct?.name}
                      </h3>
                    </div>
                    <span className="text-lg font-black text-amber-400">
                      ₹{selectedProduct?.price || 599}
                    </span>
                  </div>

                  {/* Color Customization */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Garment Color</span>
                      <span className="text-amber-400 text-[11px] font-semibold">
                        {customization.color?.name || 'Standard'}
                      </span>
                    </label>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {[
                        { name: 'Obsidian Black', hex: '#111827' },
                        { name: 'Pure White', hex: '#F9FAFB' },
                        { name: 'Heather Grey', hex: '#6B7280' },
                        { name: 'Navy Blue', hex: '#1E3A8A' },
                        { name: 'Forest Green', hex: '#064E3B' },
                        { name: 'Crimson Red', hex: '#991B1B' },
                        { name: 'Camel Tan', hex: '#D97706' }
                      ].map((c) => {
                        const isSelected = customization.color?.hex === c.hex;
                        return (
                          <button
                            key={c.name}
                            type="button"
                            title={c.name}
                            onClick={() => handleUpdateCustomization('color', c)}
                            className={`w-7 h-7 rounded-full border-2 transition-transform ${
                              isSelected
                                ? 'border-amber-400 scale-110 ring-2 ring-amber-400/50'
                                : 'border-neutral-700 hover:scale-105'
                            }`}
                            style={{ backgroundColor: c.hex }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Add to Bag */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>🛍️</span> Add Customized Outfit to Bag &bull; ₹{selectedProduct?.price || 599}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FULL CATALOG SELECTION MODAL ─────────────────────────────────── */}
        {isCatalogPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-4xl max-h-[85vh] flex flex-col space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    Select Any FITFUSION Catalogue Outfit
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Choose any piece to try on with Kolors AI or in 3D Garment Studio.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCatalogPickerOpen(false)}
                  className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Search shirts, hoodies, jackets, dresses..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />

                <select
                  value={catalogCategory}
                  onChange={(e) => setCatalogCategory(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  {uniqueCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pr-1">
                {filteredCatalog.map((prod) => {
                  const m3d = getProduct3DModel(prod);
                  return (
                    <div
                      key={prod.id}
                      onClick={() => handleSelectProduct(prod)}
                      className="cursor-pointer group rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500 p-2.5 transition-all flex flex-col justify-between"
                    >
                      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-neutral-900 mb-2">
                        <ProductImage
                          productId={prod.id}
                          src={prod.image || getProductImage(prod)}
                          alt={prod.name}
                          fallbackCategory={prod.category}
                          aspectRatio="aspect-[3/4]"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {m3d.has3DModel && (
                          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-indigo-950/90 text-indigo-300 text-[9px] font-bold">
                            3D
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] text-neutral-400 font-semibold">{prod.category}</p>
                        <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-400">
                          {prod.name}
                        </h4>
                        <p className="text-xs font-black text-amber-400">
                          ₹{prod.price || 599}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── PROVIDER SETUP & EVALUATION MODAL ─────────────────────────────── */}
        {isProviderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">⚙️</span>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">
                      AI Virtual Try-On Provider Guide
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Modular backend architecture for Kwai-Kolors Diffusion
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProviderModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Provider Options Comparison */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Supported AI Providers
                </h4>

                {/* Option 1: Fal.ai */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">1. Fal.ai (Recommended)</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Production Ready
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-400">~₹3.50 (est.) / generation</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Official dedicated serverless API for Kolors Try-On (<code>fal-ai/kling/v1-5/kolors-virtual-try-on</code>). Fast 8–12s processing, zero public queue throttling, and free trial balance (₹80–₹800 equivalent) on signup.
                  </p>
                  <div className="text-[11px] font-mono bg-neutral-900 p-2.5 rounded-xl border border-neutral-800 text-neutral-300">
                    Add to <code className="text-amber-400">backend/.env</code>: <span className="text-emerald-400">FAL_KEY=your_key_here</span>
                  </div>
                  <a
                    href="https://fal.ai"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:underline"
                  >
                    Obtain key at fal.ai &rarr;
                  </a>
                </div>

                {/* Option 2: Hugging Face ZeroGPU */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">2. Hugging Face Kwai-Kolors Space</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        Free Community Tier
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">Free</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Official Kwai-Kolors Gradio ZeroGPU space (<code>Kwai-Kolors/Kolors-Virtual-Try-On</code>). Connects with free user access token. Note: subject to ZeroGPU community cooldowns under heavy traffic.
                  </p>
                  <div className="text-[11px] font-mono bg-neutral-900 p-2.5 rounded-xl border border-neutral-800 text-neutral-300">
                    Add to <code className="text-amber-400">backend/.env</code>: <span className="text-emerald-400">HF_TOKEN=hf_...</span>
                  </div>
                  <a
                    href="https://huggingface.co/settings/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:underline"
                  >
                    Get free token at huggingface.co/settings/tokens &rarr;
                  </a>
                </div>

                {/* Option 3: Dedicated GPU / RunPod / ComfyUI */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-white">3. Self-Hosted / Dedicated Cloud GPU</span>
                    <span className="text-xs font-bold text-neutral-400">Custom Host</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Deploy your own ComfyUI, Modal, or RunPod endpoint running Kwai-Kolors open-weights model.
                  </p>
                  <div className="text-[11px] font-mono bg-neutral-900 p-2.5 rounded-xl border border-neutral-800 text-neutral-300">
                    Set in <code className="text-amber-400">backend/.env</code>: <span className="text-emerald-400">KOLORS_API_URL=https://...</span>
                  </div>
                </div>
              </div>

              {/* Safety & Cost Commitment */}
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-400 space-y-1.5">
                <p className="font-bold text-neutral-200">🔒 Privacy, Safety & Billing Policy:</p>
                <p>
                  • All credentials remain strictly server-side in <code>backend/.env</code> and are NEVER exposed to the frontend browser.
                </p>
                <p>
                  • FITFUSION never automatically charges credit cards or buys credits without explicit user configuration.
                </p>
                <p>
                  • Uploaded user photographs are processed ephemerally in-memory and pruned within 1 hour.
                </p>
                <p>
                  • AI virtual try-on results are visual representations for style guidance and may not accurately predict real physical garment tailor fit.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsProviderModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider transition shadow-md"
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
