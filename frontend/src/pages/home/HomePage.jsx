import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import { MOCK_PRODUCTS, CLOTHING_CATEGORIES } from '../../data/mockProducts.js';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');

  const featuredItems = MOCK_PRODUCTS.filter((p) => p.badge === 'Featured');
  const trendingItems = MOCK_PRODUCTS.filter((p) => p.badge === 'Trending');
  const recommendedItems = MOCK_PRODUCTS.filter((p) => p.badge === 'Recommended' || p.badge === 'Featured');

  return (
    <div className="py-6 sm:py-10 space-y-12 sm:space-y-16">
      {/* Top Banner / In-page Hero Header with Search */}
      <PageContainer>
        <div className="rounded-2xl bg-gradient-to-r from-stone-900 via-neutral-900 to-stone-800 text-white p-8 sm:p-12 relative overflow-hidden shadow-lg">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Custom Tailored Fashion Hub
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Design It. Customize It. Wear It.
            </h1>
            <p className="text-sm sm:text-base text-neutral-300">
              Select clothing silhouettes, pick authentic milled fabrics, adjust custom fit measurements, and pair with artisan fragrances.
            </p>

            {/* Quick in-hero Search */}
            <div className="pt-2 max-w-lg">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search shirts, blazers, jackets, cotton, linen..."
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
              <h2 className="text-sm font-bold text-neutral-900">20% Off Your First Bespoke Outfit</h2>
              <p className="text-xs text-neutral-600">Use promo code <span className="font-mono font-bold text-brand-dark">BESPOKE20</span> at checkout</p>
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
              <p className="text-xs text-neutral-600">Instant cashback credited to your measurement profile</p>
            </div>
            <Button to="/profile" variant="outline" size="sm">
              View Wallet
            </Button>
          </div>
        </div>
      </PageContainer>

      {/* Clothing Category Navigation Pills */}
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-brand-dark">Browse Apparel Categories</h2>
            <Link to="/shop" className="text-xs font-semibold text-brand-accent hover:underline">
              View All &rarr;
            </Link>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {CLOTHING_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-dark text-white shadow-sm'
                    : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </PageContainer>

      {/* Featured Clothing Section */}
      <PageContainer>
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Masterpieces
            </span>
            <h2 className="text-xl font-extrabold text-brand-dark">Featured Clothing</h2>
          </div>
          <Link to="/shop" className="text-xs font-semibold text-neutral-600 hover:text-brand-dark">
            See all &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredItems.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className={`aspect-[4/3] bg-gradient-to-br ${product.silhouetteColor} p-5 flex flex-col justify-between`}>
                <span className="self-start text-[10px] font-bold px-2 py-0.5 rounded bg-white text-neutral-900 shadow-sm">
                  {product.badge}
                </span>
                <div className="my-auto text-center">
                  <div className="w-16 h-20 mx-auto rounded bg-white/90 border border-neutral-300 shadow-sm flex items-center justify-center p-2">
                    <span className="text-[10px] font-bold text-neutral-800 text-center">{product.name}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-neutral-800">
                  <span>${product.basePrice}</span>
                  <span>&#9733; {product.rating}</span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="font-bold text-sm text-brand-dark">{product.name}</h3>
                <p className="text-xs text-neutral-500 line-clamp-2">{product.description}</p>
                <div className="pt-2 border-t border-neutral-100 flex items-center gap-2">
                  <Button to={`/customize/${product.id}`} variant="secondary" size="sm" className="flex-1">
                    Customize
                  </Button>
                  <Button to={`/product/${product.id}`} variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageContainer>

      {/* Trending Designs Section */}
      <PageContainer>
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              What Customers Are Crafting
            </span>
            <h2 className="text-xl font-extrabold text-brand-dark">Trending Designs</h2>
          </div>
          <Link to="/shop" className="text-xs font-semibold text-neutral-600 hover:text-brand-dark">
            Explore styles &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingItems.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className={`aspect-[4/3] bg-gradient-to-br ${product.silhouetteColor} p-5 flex flex-col justify-between`}>
                <span className="self-start text-[10px] font-bold px-2 py-0.5 rounded bg-brand-dark text-white">
                  Trending Now
                </span>
                <div className="my-auto text-center">
                  <div className="w-16 h-20 mx-auto rounded bg-white/90 border border-neutral-300 shadow-sm flex items-center justify-center p-2">
                    <span className="text-[10px] font-bold text-neutral-800 text-center">{product.name}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-neutral-800">
                  <span>${product.basePrice}</span>
                  <span>&#9733; {product.rating}</span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="font-bold text-sm text-brand-dark">{product.name}</h3>
                <p className="text-xs text-neutral-500 line-clamp-2">{product.description}</p>
                <div className="pt-2 border-t border-neutral-100 flex items-center gap-2">
                  <Button to={`/customize/${product.id}`} variant="secondary" size="sm" className="flex-1">
                    Customize
                  </Button>
                  <Button to={`/product/${product.id}`} variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageContainer>

      {/* Recommended For You Section */}
      <PageContainer>
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Personalized Recommendations
            </span>
            <h2 className="text-xl font-extrabold text-brand-dark">Recommended Clothing</h2>
          </div>
          <Link to="/shop" className="text-xs font-semibold text-neutral-600 hover:text-brand-dark">
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedItems.slice(0, 3).map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className={`aspect-[4/3] bg-gradient-to-br ${product.silhouetteColor} p-5 flex flex-col justify-between`}>
                <span className="self-start text-[10px] font-bold px-2 py-0.5 rounded bg-brand-accent text-white">
                  Recommended
                </span>
                <div className="my-auto text-center">
                  <div className="w-16 h-20 mx-auto rounded bg-white/90 border border-neutral-300 shadow-sm flex items-center justify-center p-2">
                    <span className="text-[10px] font-bold text-neutral-800 text-center">{product.name}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-neutral-800">
                  <span>${product.basePrice}</span>
                  <span>&#9733; {product.rating}</span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="font-bold text-sm text-brand-dark">{product.name}</h3>
                <p className="text-xs text-neutral-500 line-clamp-2">{product.description}</p>
                <div className="pt-2 border-t border-neutral-100 flex items-center gap-2">
                  <Button to={`/customize/${product.id}`} variant="secondary" size="sm" className="flex-1">
                    Customize
                  </Button>
                  <Button to={`/product/${product.id}`} variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageContainer>

      {/* Customize Now Full Banner CTA */}
      <PageContainer>
        <div className="rounded-2xl bg-brand-dark text-white p-8 sm:p-12 text-center relative overflow-hidden border border-neutral-800">
          <div className="max-w-xl mx-auto space-y-4">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-accent">
              Unmatched Tailored Precision
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Ready to Design Your Signature Garment?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Step into the interactive customization suite. Choose your silhouette, custom collar architecture, luxury fabric swatches, and signature fragrance pairing.
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
