import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import ProductCard from '../../components/common/ProductCard.jsx';
import ProductImage from '../../components/common/ProductImage.jsx';
import AiStyleSearchResult from '../../components/search/AiStyleSearchResult.jsx';
import FindMySizeModal from '../../components/common/FindMySizeModal.jsx';
import RecentlyViewedSection from '../../components/account/RecentlyViewedSection.jsx';
import { useCompare } from '../../context/CompareContext.jsx';
import { MOCK_PRODUCTS, CATEGORY_GROUPS, CATEGORY_IMAGES, getCategoryImage } from '../../data/mockProducts.js';
import { normalizeCategory } from '../../services/catalogFilterService.js';
import { evaluateStyleSearch } from '../../services/aiStyleSearchService.js';

export default function HomePage() {
  const { setIsModalOpen: setIsCompareModalOpen } = useCompare();
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [stylePrompt, setStylePrompt] = useState('');
  const [styleInputVal, setStyleInputVal] = useState('');
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const featuredItems = useMemo(() => MOCK_PRODUCTS.filter((p) => p.badge === 'Featured').slice(0, 8), []);
  const trendingItems = useMemo(() => MOCK_PRODUCTS.filter((p) => p.badge === 'Trending').slice(0, 8), []);
  const recommendedItems = useMemo(() => MOCK_PRODUCTS.filter((p) => p.badge === 'Recommended' || p.featured).slice(0, 8), []);

  // AI Style Search Result evaluation
  const aiSearchResult = useMemo(() => {
    if (!stylePrompt || !stylePrompt.trim()) return null;
    return evaluateStyleSearch(MOCK_PRODUCTS, stylePrompt);
  }, [stylePrompt]);

  const handleHeroSearch = (e) => {
    if (e) e.preventDefault();
    if (searchFilter.trim()) {
      setStylePrompt(searchFilter.trim());
      setStyleInputVal(searchFilter.trim());
      const el = document.getElementById('ai-style-recommendations');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleApplyStylePrompt = (promptText) => {
    setStylePrompt(promptText);
    setStyleInputVal(promptText);
    const el = document.getElementById('ai-style-recommendations');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const copyPromoCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Categories list based on active tab
  const displayedCategories = useMemo(() => {
    if (selectedGender === 'Men') return CATEGORY_GROUPS.Men;
    if (selectedGender === 'Women') return CATEGORY_GROUPS.Women;
    if (selectedGender === 'Special') return CATEGORY_GROUPS.Special;
    return [
      'T-Shirts', 'Shirts', 'Hoodies', 'Jeans & Pants', 'Dresses', 'Jackets', 'Traditional Wear', 'Suits'
    ];
  }, [selectedGender]);

  // Filtered products when a category is selected
  const categoryFilteredItems = useMemo(() => {
    if (selectedCategory === 'All') return [];
    const targetNorm = normalizeCategory(selectedCategory);
    return MOCK_PRODUCTS.filter((p) => normalizeCategory(p.category) === targetNorm);
  }, [selectedCategory]);

  return (
    <div className="py-4 sm:py-8 space-y-12 sm:space-y-20">
      {/* ========================================================
          1. HERO BANNER: REAL FASHION PHOTOGRAPH & BESPOKE CTA
          ======================================================== */}
      <PageContainer>
        <div className="relative rounded-3xl bg-radial from-neutral-900 via-brand-dark to-black text-white p-6 sm:p-12 lg:p-16 shadow-2xl overflow-hidden border border-neutral-800">
          {/* Subtle atmospheric ambient glows */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-brand-accent/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Hero Copy Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-accent/20 border border-brand-accent/40 text-brand-accent text-xs font-bold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
                Customized Clothing Platform
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                Design It. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent via-amber-400 to-amber-200">
                  Customize It.
                </span> <br />
                Wear It.
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-neutral-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Craft clothing that matches your exact fit, style, and identity. Choose certified luxury fabrics, personalize collars, cuffs, and 3D artwork, and get made-to-measure garments delivered right to your door.
              </p>

              {/* Quick in-hero Search */}
              <form onSubmit={handleHeroSearch} className="pt-2 max-w-lg mx-auto lg:mx-0">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search shirts, hoodies, t-shirts, kurtas, jeans..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-10 pr-28 py-3.5 rounded-2xl bg-neutral-800/90 border border-neutral-700 text-white placeholder-neutral-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent shadow-inner"
                  />
                  <svg
                    className="w-5 h-5 text-neutral-400 absolute left-3 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <div className="absolute right-2 flex items-center gap-1.5">
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-brand-accent hover:bg-brand-accentHover text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      AI Search
                    </button>
                  </div>
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Button to="/customize/1" variant="secondary" size="lg" className="w-full sm:w-auto font-bold shadow-lg shadow-brand-accent/25">
                  Customize Now
                </Button>
                <Button to="/shop" variant="outline" size="lg" className="w-full sm:w-auto text-white border-neutral-600 hover:bg-white hover:text-brand-dark">
                  Explore Collection
                </Button>
                <Link
                  to="/virtual-try-on"
                  className="text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white underline underline-offset-4 py-2"
                >
                  Kolors AI Try-On &rarr;
                </Link>
              </div>

              {/* Trust Metrics */}
              <div className="pt-6 border-t border-neutral-800 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">100%</div>
                  <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Made to Measure</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">500+</div>
                  <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Authentic Styles</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-brand-accent">3D Studio</div>
                  <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Live Fitting Preview</div>
                </div>
              </div>
            </div>

            {/* Hero Visual Card (Real Fashion Photography Showcase) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm sm:max-w-md rounded-3xl bg-neutral-900/80 backdrop-blur-md border border-neutral-800 p-4 sm:p-5 shadow-2xl">
                {/* Product Photograph Frame */}
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-950 shadow-inner group">
                  <img
                    src="/images/campaign/hero-fashion-campaign.jpg"
                    alt="FITFUSION Bespoke Fashion Campaign"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Floating Top Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="bg-black/75 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">
                      Bespoke Campaign
                    </span>
                    <span className="bg-brand-accent/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider shadow-sm">
                      Runway Edition
                    </span>
                  </div>

                  {/* Gradient Card Overlay with Specs */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 pt-12 text-left">
                    <div className="text-sm sm:text-base font-bold text-white leading-tight">
                      Bespoke Tailoring Campaign
                    </div>
                    <div className="text-xs text-neutral-300 font-medium mt-0.5 flex items-center gap-2">
                      <span>Organic Linen & Wool</span>
                      <span>&bull;</span>
                      <span>Structured Shoulders</span>
                      <span>&bull;</span>
                      <span>Bespoke Fit</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
                      <div className="text-[11px] text-neutral-300">
                        <span className="text-emerald-400 font-semibold">✓ Custom Tailored</span> &bull; Made to Measure
                      </div>
                      <Link
                        to="/customize/1"
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1"
                      >
                        Customize &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* ========================================================
          2. OFFERS & CASHBACK SECTION (VALID CONFIGURED OFFERS)
          ======================================================== */}
      <PageContainer>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Offer 1: Welcome Discount */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-full inline-block">
                First Order Special
              </span>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                20% Off Your First Custom Outfit
              </h2>
              <p className="text-xs text-neutral-600">
                Use code <span className="font-mono font-bold text-brand-dark bg-white px-2 py-0.5 rounded border border-amber-300">WELCOME10</span> at checkout
              </p>
            </div>
            <div className="flex sm:flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => copyPromoCode('WELCOME10')}
                className="w-full sm:w-auto px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {copiedCode === 'WELCOME10' ? 'Copied! ✓' : 'Copy Code'}
              </button>
              <Button to="/shop" variant="outline" size="sm" className="w-full sm:w-auto text-xs">
                Shop Now
              </Button>
            </div>
          </div>

          {/* Offer 2: Wallet Cashback */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-900 bg-emerald-200/80 px-2.5 py-1 rounded-full inline-block">
                Loyalty Rewards
              </span>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                5% Cashback on Made-to-Measure
              </h2>
              <p className="text-xs text-neutral-600">
                Instant wallet credit with complimentary signature fragrance pairing
              </p>
            </div>
            <div className="flex sm:flex-col items-center gap-2">
              <Button to="/profile" variant="outline" size="sm" className="w-full sm:w-auto text-xs border-emerald-600 text-emerald-900 hover:bg-emerald-100">
                View Wallet
              </Button>
              <Button to="/customize/1" variant="secondary" size="sm" className="w-full sm:w-auto text-xs">
                Start Design
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* ========================================================
          3. BROWSE APPAREL CATEGORIES (REAL PHOTOGRAPHY CARDS)
          ======================================================== */}
      <PageContainer>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-neutral-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                Shop By Garment
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark mt-0.5">
                Browse Apparel Categories
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Authentic fabric photography across our complete made-to-measure catalogue.
              </p>
            </div>

            {/* Collection Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-neutral-100 p-1.5 rounded-2xl overflow-x-auto">
              {[
                { id: 'All', label: 'All Categories' },
                { id: 'Men', label: "Men's Apparel" },
                { id: 'Women', label: "Women's Apparel" },
                { id: 'Special', label: 'Special Collections' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSelectedGender(tab.id);
                    setSelectedCategory('All');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedGender === tab.id
                      ? 'bg-white text-brand-dark shadow-xs'
                      : 'text-neutral-600 hover:text-brand-dark'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Apparel Category Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedCategories.map((cat) => {
              const catImg = getCategoryImage(cat);
              const isSelected = selectedCategory === cat;

              return (
                <div
                  key={cat}
                  onClick={() => setSelectedCategory(isSelected ? 'All' : cat)}
                  className={`cursor-pointer group rounded-2xl border overflow-hidden transition-all duration-300 bg-white flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-accent ring-2 ring-brand-accent shadow-lg'
                      : 'border-neutral-200 hover:border-neutral-400 hover:shadow-md'
                  }`}
                >
                  {/* Category Image with Real Clothing Photography */}
                  <div className="aspect-[3/4] bg-neutral-100 overflow-hidden relative">
                    <ProductImage
                      src={catImg}
                      alt={`${cat} Collection`}
                      fallbackCategory={cat}
                      aspectRatio="aspect-[3/4]"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-xs text-white font-bold flex items-center gap-1">
                        Explore {cat} &rarr;
                      </span>
                    </div>
                  </div>

                  {/* Card Title & Link */}
                  <div className="p-3.5 text-center flex items-center justify-between bg-neutral-50/50">
                    <h3 className="font-bold text-sm text-neutral-900 group-hover:text-brand-accent transition-colors truncate">
                      {cat}
                    </h3>
                    <Link
                      to={`/shop?category=${encodeURIComponent(cat)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-brand-accent font-semibold hover:underline"
                    >
                      Shop &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PageContainer>

      {/* Dynamic Category Section (when user selects a category card) */}
      {selectedCategory !== 'All' && (
        <PageContainer>
          <div className="flex items-baseline justify-between mb-6 border-b border-neutral-200 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                Active Category Selection
              </span>
              <h2 className="text-2xl font-extrabold text-brand-dark">{selectedCategory}</h2>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={`/shop?category=${encodeURIComponent(selectedCategory)}`}
                className="text-xs font-bold text-brand-dark hover:underline"
              >
                View all in Shop &rarr;
              </Link>
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className="text-xs font-semibold text-neutral-500 hover:text-red-600 underline cursor-pointer"
              >
                Clear Filter
              </button>
            </div>
          </div>

          {categoryFilteredItems.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-neutral-200 text-xs text-neutral-500 space-y-2">
              <p>Exploring new bespoke models for {selectedCategory}.</p>
              <Link to="/shop" className="text-brand-accent font-bold hover:underline inline-block">
                Browse full catalog &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {categoryFilteredItems.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </PageContainer>
      )}

      {/* ========================================================
          4. CUSTOMIZATION PROMOTION: BESPOKE 3-STEP CRAFTSMANSHIP
          ======================================================== */}
      <PageContainer>
        <div className="rounded-3xl bg-neutral-900 text-white p-8 sm:p-12 lg:p-16 border border-neutral-800 relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-3 mb-10 text-center mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Atelier Craftsmanship
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold">
              How FITFUSION Custom Tailoring Works
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              No generic off-the-rack garments. Experience digital bespoke clothing from design to delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {/* Step 1 */}
            <div className="bg-neutral-800/60 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/80 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent font-black text-lg">
                  01
                </div>
                <h3 className="text-base font-bold text-white">Select Style & Master Fabric</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Pick from 500+ verified silhouettes. Choose 100% Giza Cotton, Merino Wool, French Terry, or Breathable Normandy Linen with real texture inspection.
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-brand-accent">
                50+ Luxury Textiles &bull; Color Swatches
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-neutral-800/60 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/80 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-lg">
                  02
                </div>
                <h3 className="text-base font-bold text-white">Personalize & 3D Garment Studio</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Customize collars, cuffs, buttons, custom typography, and original embroidery patches. Inspect every angle with 360° rotation in our WebGL 3D Studio.
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-amber-400">
                Interactive 3D Preview &bull; Decal Geometry
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-neutral-800/60 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/80 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-lg">
                  03
                </div>
                <h3 className="text-base font-bold text-white">Made-to-Measure Delivery</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Input custom measurements or standard sizes. Preview your look with Kolors AI Photo Try-On and receive your tailored outfit in artisanal packaging.
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-emerald-400">
                Tailored Fit Guarantee &bull; Signature Perfume
              </div>
            </div>
          </div>

          {/* Promotion CTA Bar */}
          <div className="mt-10 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="text-sm font-bold text-white">Ready to design your bespoke piece?</div>
              <div className="text-xs text-neutral-400">Launch the 3D Customizer with genuine GLB garment models.</div>
            </div>
            <Button to="/customize/1" variant="secondary" size="md" className="font-bold">
              Customize Now &rarr;
            </Button>
          </div>
        </div>
      </PageContainer>

      {/* ========================================================
          5. FEATURED CLOTHING COLLECTION
          ======================================================== */}
      <PageContainer>
        <div className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-neutral-200 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                Curated Selection
              </span>
              <h2 className="text-2xl font-extrabold text-brand-dark">Featured Collection</h2>
            </div>
            <Link to="/shop" className="text-xs font-bold text-brand-accent hover:underline">
              View All Featured &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {featuredItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </PageContainer>

      {/* ========================================================
          6. TRENDING OUTFITS
          ======================================================== */}
      <PageContainer>
        <div className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-neutral-200 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                Most Popular
              </span>
              <h2 className="text-2xl font-extrabold text-brand-dark">Trending Outfits</h2>
            </div>
            <Link to="/shop" className="text-xs font-bold text-brand-accent hover:underline">
              Explore Trending &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {trendingItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </PageContainer>

      {/* ========================================================
          7. RECOMMENDED PRODUCTS
          ======================================================== */}
      <PageContainer>
        <div className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-neutral-200 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                Selected For You
              </span>
              <h2 className="text-2xl font-extrabold text-brand-dark">Recommended Products</h2>
            </div>
            <Link to="/shop" className="text-xs font-bold text-brand-accent hover:underline">
              See All &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {recommendedItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </PageContainer>

      {/* ========================================================
          8. AI STYLE SEARCH & RECOMMENDATIONS (PHASE 22 TEST INVARIANT)
          ======================================================== */}
      <PageContainer>
        <section id="ai-style-recommendations" className="space-y-6 scroll-mt-20">
          <div className="bg-gradient-to-r from-neutral-900 via-brand-dark to-neutral-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-neutral-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-accent/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-brand-accent/20 border border-brand-accent/40 text-brand-accent text-xs font-bold uppercase tracking-wider">
                  ✨ AI Style Assistant
                </span>
                <span className="text-xs text-neutral-400">Smart Alternatives & Catalog Grounding</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                AI Style Search & Smart Recommendations
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Describe your desired outfit, occasion, or style vibe. If what you want isn&apos;t an exact match, our AI never guesses—it detects style clashes or unattainable budgets and recommends smart alternatives tailored to our catalog.
              </p>

              {/* Style Search Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (styleInputVal.trim()) {
                    handleApplyStylePrompt(styleInputVal.trim());
                  }
                }}
                className="pt-2"
              >
                <div className="relative flex items-center max-w-2xl">
                  <input
                    type="text"
                    id="ai-style-prompt-input"
                    placeholder="e.g., 'A green hoodie for a wedding', 'traditional outfit for a festival', 'black formal shirt under ₹100'..."
                    value={styleInputVal}
                    onChange={(e) => setStyleInputVal(e.target.value)}
                    className="w-full pl-11 pr-28 py-3.5 rounded-2xl bg-neutral-800/90 border border-neutral-700 text-white placeholder-neutral-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent shadow-inner"
                  />
                  <span className="absolute left-4 text-brand-accent pointer-events-none text-base">
                    ✦
                  </span>
                  <div className="absolute right-2 flex items-center gap-1.5">
                    {stylePrompt && (
                      <button
                        type="button"
                        onClick={() => {
                          setStylePrompt('');
                          setStyleInputVal('');
                        }}
                        className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-accent hover:bg-brand-accentHover text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      Ask AI
                    </button>
                  </div>
                </div>
              </form>

              {/* Starter Quick Prompt Pills */}
              <div className="pt-2 space-y-2">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                  Try popular style queries:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    'A wedding outfit',
                    'Traditional outfit for a festival',
                    'Comfortable clothes for college',
                    'A green hoodie for a wedding',
                    'Black formal shirt under ₹100',
                    'A-Line casual dress under ₹1500'
                  ].map((quickPrompt) => (
                    <button
                      key={quickPrompt}
                      type="button"
                      onClick={() => handleApplyStylePrompt(quickPrompt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                        stylePrompt === quickPrompt
                          ? 'bg-brand-accent text-white border-brand-accent shadow-xs'
                          : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 border-neutral-700 hover:border-neutral-500'
                      }`}
                    >
                      &ldquo;{quickPrompt}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Render AiStyleSearchResult when active */}
          {aiSearchResult && (
            <div className="pt-2">
              <AiStyleSearchResult
                searchResult={aiSearchResult}
                onSelectPrompt={handleApplyStylePrompt}
                onResetSearch={() => {
                  setStylePrompt('');
                  setStyleInputVal('');
                }}
              />
            </div>
          )}
        </section>
      </PageContainer>

      {/* ========================================================
          9. INTERACTIVE TOOLS FOR SHOPPERS
          ======================================================== */}
      <PageContainer>
        <section className="space-y-4">
          <div className="border-b border-neutral-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
              Interactive Tools
            </span>
            <h2 className="text-2xl font-extrabold text-brand-dark mt-0.5">
              Tools for You
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Smart tools to build complete outfits, get size recommendations, and compare garments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Build an Outfit */}
            <Link
              to="/outfit-builder"
              className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs hover:shadow-md hover:border-neutral-400 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/60 flex items-center justify-center text-xl">
                  ✨
                </div>
                <h3 className="font-bold text-sm sm:text-base text-brand-dark group-hover:text-brand-accent transition-colors">
                  Build an Outfit
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Mix and match garments to create a complete bespoke wardrobe.
                </p>
              </div>
              <div className="pt-3 text-xs font-bold text-brand-accent flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Start Building</span> &rarr;
              </div>
            </Link>

            {/* Card 2: Find My Size */}
            <div
              onClick={() => setIsSizeModalOpen(true)}
              className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs hover:shadow-md hover:border-neutral-400 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 border border-blue-200/60 flex items-center justify-center text-xl">
                  📏
                </div>
                <h3 className="font-bold text-sm sm:text-base text-brand-dark group-hover:text-brand-accent transition-colors">
                  Find My Size
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Get a personalized fit recommendation before ordering.
                </p>
              </div>
              <div className="pt-3 text-xs font-bold text-brand-accent flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Find My Size</span> &rarr;
              </div>
            </div>

            {/* Card 3: Compare Products */}
            <div
              onClick={() => setIsCompareModalOpen(true)}
              className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs hover:shadow-md hover:border-neutral-400 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/60 flex items-center justify-center text-xl">
                  ⚖️
                </div>
                <h3 className="font-bold text-sm sm:text-base text-brand-dark group-hover:text-brand-accent transition-colors">
                  Compare Products
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Compare fabric, weight, price, and customization side-by-side.
                </p>
              </div>
              <div className="pt-3 text-xs font-bold text-brand-accent flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Compare Products</span> &rarr;
              </div>
            </div>

            {/* Card 4: My Designs */}
            <Link
              to="/saved-designs"
              className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs hover:shadow-md hover:border-neutral-400 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-900 border border-purple-200/60 flex items-center justify-center text-xl">
                  🎨
                </div>
                <h3 className="font-bold text-sm sm:text-base text-brand-dark group-hover:text-brand-accent transition-colors">
                  My Designs
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Continue editing your saved bespoke creations and artwork.
                </p>
              </div>
              <div className="pt-3 text-xs font-bold text-brand-accent flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>My Designs</span> &rarr;
              </div>
            </Link>
          </div>
        </section>
      </PageContainer>

      {/* ========================================================
          10. RECENTLY VIEWED SECTION
          ======================================================== */}
      <PageContainer>
        <RecentlyViewedSection showClear={false} title="Recently Viewed Garments" />
      </PageContainer>

      {/* ========================================================
          11. BOTTOM CTA BANNER: STEP INTO 3D CUSTOMIZER
          ======================================================== */}
      <PageContainer>
        <div className="rounded-3xl bg-radial from-neutral-900 via-brand-dark to-black text-white p-8 sm:p-14 text-center relative overflow-hidden border border-neutral-800 shadow-2xl">
          <div className="max-w-xl mx-auto space-y-4">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-accent">
              Bespoke Made Simple
            </span>
            <h2 className="text-2xl sm:text-4xl font-black">
              Ready to Design Your Custom Garment?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Step into the 3D Garment Studio. Select colors, customize fit and collar styling, place artwork and text decals, and order clothes tailored to your exact measurements.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button to="/customize/1" variant="secondary" size="lg" className="font-bold w-full sm:w-auto shadow-lg shadow-brand-accent/25">
                Customize Now &rarr;
              </Button>
              <Button to="/virtual-try-on" variant="outline" size="lg" className="w-full sm:w-auto text-white border-neutral-600 hover:bg-white hover:text-brand-dark">
                AI Photo Try-On
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Find My Size Modal */}
      <FindMySizeModal
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
        onSelectSize={() => setIsSizeModalOpen(false)}
        initialSize="M"
        gender={selectedGender === 'Women' ? 'Women' : 'Men'}
        availableSizes={['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']}
      />
    </div>
  );
}
