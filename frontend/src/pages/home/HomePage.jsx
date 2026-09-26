import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import ProductCard from '../../components/common/ProductCard.jsx';
import ProductImage from '../../components/common/ProductImage.jsx';
import { MOCK_PRODUCTS, CATEGORY_GROUPS, CATEGORY_IMAGES, getCategoryImage } from '../../data/mockProducts.js';

export default function HomePage() {
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');

  const featuredItems = MOCK_PRODUCTS.filter((p) => p.badge === 'Featured');
  const trendingItems = MOCK_PRODUCTS.filter((p) => p.badge === 'Trending');
  const recommendedItems = MOCK_PRODUCTS.filter((p) => p.badge === 'Recommended' || p.badge === 'Featured');

  // Categories list based on active tab
  const displayedCategories = React.useMemo(() => {
    if (selectedGender === 'Men') return CATEGORY_GROUPS.Men;
    if (selectedGender === 'Women') return CATEGORY_GROUPS.Women;
    if (selectedGender === 'Special') return CATEGORY_GROUPS.Special;
    // 'All': Show curated popular categories from all groups
    return [
      'T-Shirts', 'Polo T-Shirts', 'Shirts', 'Formal Shirts', 'Casual Shirts',
      'Hoodies', 'Sweatshirts', 'Sweaters', 'Jackets', 'Blazers',
      'Jeans', 'Trousers', 'Chinos', 'Kurtas', 'Dresses', 'Tops',
      'Blouses', 'Skirts', 'Co-ord Sets', 'Jumpsuits', 'Formal Wear',
      'Party Wear', 'Sportswear', 'Winter Wear'
    ];
  }, [selectedGender]);

  // Filtered products when a category is selected
  const categoryFilteredItems = selectedCategory === 'All'
    ? []
    : MOCK_PRODUCTS.filter((p) => (p.category || '').toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="py-6 sm:py-10 space-y-12 sm:space-y-16">
      {/* Top Banner / In-page Hero */}
      <PageContainer>
        <div className="rounded-2xl bg-brand-dark text-white p-6 sm:p-10 shadow-lg relative overflow-hidden border border-neutral-800">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Custom Clothing Platform
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Design It. Customize It. Wear It.
            </h1>
            <p className="text-sm sm:text-base text-neutral-300">
              Pick your favorite clothing styles, choose quality fabrics, adjust your custom measurements, and order custom-made clothes delivered to your doorstep.
            </p>

            {/* Quick in-hero Search */}
            <div className="pt-2 max-w-lg">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search shirts, blazers, jackets, t-shirts, kurtas, jeans..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-10 pr-24 py-3 rounded-xl bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent shadow-sm"
                />
                <svg
                  className="w-5 h-5 text-neutral-400 absolute left-3 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Link
                  to={`/shop${searchFilter ? `?search=${encodeURIComponent(searchFilter)}` : ''}`}
                  className="absolute right-2 px-4 py-1.5 bg-brand-accent hover:bg-brand-accentHover text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Search
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Promotional & Cashback Banner */}
      <PageContainer>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                Special Offer
              </span>
              <h2 className="text-sm font-bold text-neutral-900">20% Off Your First Custom Outfit</h2>
              <p className="text-xs text-neutral-600">Use promo code <span className="font-mono font-bold text-brand-dark">WELCOME10</span> at checkout</p>
            </div>
            <Button to="/shop" variant="secondary" size="sm">
              Claim Offer
            </Button>
          </div>

          <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded">
                Wallet Rewards
              </span>
              <h2 className="text-sm font-bold text-neutral-900">5% Cashback on Custom Clothing</h2>
              <p className="text-xs text-neutral-600">Instant cashback credited to your account wallet</p>
            </div>
            <Button to="/profile" variant="outline" size="sm">
              View Wallet
            </Button>
          </div>
        </div>
      </PageContainer>

      {/* ========================================================
          UPGRADED BROWSE APPAREL CATEGORIES (Parts 1 & 2)
          Every card has a real clothing picture!
          ======================================================== */}
      <PageContainer>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-neutral-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                Catalog Navigation
              </span>
              <h2 className="text-2xl font-extrabold text-brand-dark mt-0.5">
                Browse Apparel Categories
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Explore our expanded clothing collection for men, women, and special occasions.
              </p>
            </div>

            {/* Collection Tabs */}
            <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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

          {/* Grid of Apparel Category Cards (Every card has a real clothing photo) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {displayedCategories.map((cat) => {
              const catImg = getCategoryImage(cat);
              const isSelected = selectedCategory === cat;

              return (
                <div
                  key={cat}
                  onClick={() => setSelectedCategory(isSelected ? 'All' : cat)}
                  className={`cursor-pointer group rounded-xl border overflow-hidden transition-all duration-300 bg-white flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-accent ring-2 ring-brand-accent shadow-md'
                      : 'border-neutral-200 hover:border-neutral-400 hover:shadow-md'
                  }`}
                >
                  {/* Category Clothing Picture */}
                  <div className="aspect-square bg-neutral-100 overflow-hidden relative">
                    <ProductImage
                      src={catImg}
                      alt={cat}
                      fallbackCategory={cat}
                      aspectRatio="aspect-square"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-[10px] text-white font-bold">
                        Browse {cat} &rarr;
                      </span>
                    </div>
                  </div>

                  {/* Card Title & Link */}
                  <div className="p-2.5 text-center">
                    <h3 className="font-bold text-xs text-neutral-800 group-hover:text-brand-accent transition-colors truncate">
                      {cat}
                    </h3>
                    <Link
                      to={`/shop?category=${encodeURIComponent(cat)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] text-brand-accent font-semibold hover:underline block mt-0.5"
                    >
                      Shop Now &rarr;
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
                Category Selection
              </span>
              <h2 className="text-xl font-extrabold text-brand-dark">{selectedCategory} Collection</h2>
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
                className="text-xs font-semibold text-neutral-500 hover:text-red-600 underline"
              >
                Clear Filter
              </button>
            </div>
          </div>

          {categoryFilteredItems.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-neutral-200 text-xs text-neutral-500 space-y-2">
              <p>We are adding more {selectedCategory} models to the custom catalog.</p>
              <Link to="/shop" className="text-brand-accent font-bold hover:underline inline-block">
                Browse full catalog &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {categoryFilteredItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </PageContainer>
      )}

      {/* Featured Clothing Section */}
      <PageContainer>
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Curated Picks
            </span>
            <h2 className="text-xl font-extrabold text-brand-dark">Featured Clothing</h2>
          </div>
          <Link to="/shop" className="text-xs font-semibold text-neutral-600 hover:text-brand-dark">
            See all &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {featuredItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </PageContainer>

      {/* Trending Designs Section */}
      <PageContainer>
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Popular Right Now
            </span>
            <h2 className="text-xl font-extrabold text-brand-dark">Trending Designs</h2>
          </div>
          <Link to="/shop" className="text-xs font-semibold text-neutral-600 hover:text-brand-dark">
            Explore styles &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {trendingItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </PageContainer>

      {/* Recommended For You Section */}
      <PageContainer>
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Recommendations
            </span>
            <h2 className="text-xl font-extrabold text-brand-dark">Recommended Clothing</h2>
          </div>
          <Link to="/shop" className="text-xs font-semibold text-neutral-600 hover:text-brand-dark">
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {recommendedItems.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </PageContainer>

      {/* Customize Now Full Banner CTA */}
      <PageContainer>
        <div className="rounded-2xl bg-brand-dark text-white p-8 sm:p-12 text-center relative overflow-hidden border border-neutral-800">
          <div className="max-w-xl mx-auto space-y-4">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-accent">
              Custom Tailoring
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Ready to Design Your Custom Garment?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Step into the interactive clothing customizer. Choose your garment, select your color and fabric, input your exact measurements, and get custom clothes made just for you.
            </p>
            <div className="pt-2">
              <Button to="/customize/1" variant="secondary" size="lg">
                Customize Now &rarr;
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
