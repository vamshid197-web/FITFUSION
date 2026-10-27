import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import ProductCard from '../../components/common/ProductCard.jsx';
import SearchAutocomplete from '../../components/search/SearchAutocomplete.jsx';
import ShopFilterSidebar from '../../components/search/ShopFilterSidebar.jsx';
import ActiveFilterChips from '../../components/search/ActiveFilterChips.jsx';
import AiStyleSearchResult from '../../components/search/AiStyleSearchResult.jsx';
import { MOCK_PRODUCTS } from '../../data/mockProducts.js';
import { getProductsFromFirestore } from '../../services/firestoreService.js';
import {
  filterProducts,
  sortProducts,
  extractCatalogFacets,
  normalizeCategory
} from '../../services/catalogFilterService.js';
import { evaluateStyleSearch, MATCH_LEVELS } from '../../services/aiStyleSearchService.js';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Raw catalog state
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  // 1. Read Filter State from URL Query Parameters
  const urlSearch = searchParams.get('search') || '';
  const rawCategory = searchParams.get('category') || 'All';
  const urlCategory = normalizeCategory(rawCategory);
  const urlGender = searchParams.get('gender') || 'all';
  const urlMinPrice = searchParams.get('minPrice') || '';
  const urlMaxPrice = searchParams.get('maxPrice') || '';
  const urlColor = searchParams.get('color') || null;
  const urlFabric = searchParams.get('fabric') || null;
  const urlSize = searchParams.get('size') || null;
  const urlRating = searchParams.get('rating') || 'all';
  const urlAvailability = searchParams.get('availability') || 'all';
  const urlCustomizable = searchParams.get('customizable') === 'true';
  const urlSortBy = searchParams.get('sortBy') || 'recommended';

  // Synchronize local filter state with URL
  const filters = useMemo(() => ({
    searchQuery: urlSearch,
    category: urlCategory,
    gender: urlGender,
    minPrice: urlMinPrice !== '' ? Number(urlMinPrice) : null,
    maxPrice: urlMaxPrice !== '' ? Number(urlMaxPrice) : null,
    color: urlColor,
    fabric: urlFabric,
    size: urlSize,
    rating: urlRating,
    availability: urlAvailability,
    customizableOnly: urlCustomizable
  }), [
    urlSearch,
    urlCategory,
    urlGender,
    urlMinPrice,
    urlMaxPrice,
    urlColor,
    urlFabric,
    urlSize,
    urlRating,
    urlAvailability,
    urlCustomizable
  ]);

  // Load catalog from Firestore with graceful fallback to MOCK_PRODUCTS
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        setLoading(true);
        const res = await getProductsFromFirestore();
        if (isMounted && res.success && res.products?.length > 0) {
          setProducts(res.products);
        }
      } catch (err) {
        console.warn('[ShopPage] Failed to fetch products from Firestore:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute live facets (categories, colors, fabrics, sizes, price range) from catalog
  const facets = useMemo(() => {
    return extractCatalogFacets(products);
  }, [products]);

  // Helper to update URL search parameters safely
  const updateUrlParams = (newFilters) => {
    const params = new URLSearchParams();

    if (newFilters.searchQuery && newFilters.searchQuery.trim()) {
      params.set('search', newFilters.searchQuery.trim());
    }
    if (newFilters.category && newFilters.category !== 'All') {
      params.set('category', newFilters.category);
    }
    if (newFilters.gender && newFilters.gender !== 'all') {
      params.set('gender', newFilters.gender);
    }
    if (newFilters.minPrice !== null && newFilters.minPrice !== '' && !isNaN(newFilters.minPrice)) {
      params.set('minPrice', String(newFilters.minPrice));
    }
    if (newFilters.maxPrice !== null && newFilters.maxPrice !== '' && !isNaN(newFilters.maxPrice)) {
      params.set('maxPrice', String(newFilters.maxPrice));
    }
    if (newFilters.color && newFilters.color !== 'all') {
      params.set('color', newFilters.color);
    }
    if (newFilters.fabric && newFilters.fabric !== 'all') {
      params.set('fabric', newFilters.fabric);
    }
    if (newFilters.size && newFilters.size !== 'all') {
      params.set('size', newFilters.size);
    }
    if (newFilters.rating && newFilters.rating !== 'all') {
      params.set('rating', newFilters.rating);
    }
    if (newFilters.availability && newFilters.availability !== 'all') {
      params.set('availability', newFilters.availability);
    }
    if (newFilters.customizableOnly) {
      params.set('customizable', 'true');
    }
    if (newFilters.sortBy && newFilters.sortBy !== 'recommended') {
      params.set('sortBy', newFilters.sortBy);
    }

    setSearchParams(params, { replace: true });
  };

  // Handler for individual filter updates
  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value, sortBy: urlSortBy };
    updateUrlParams(updated);
  };

  // Handler for sort changes
  const handleSortChange = (newSort) => {
    const updated = { ...filters, sortBy: newSort };
    updateUrlParams(updated);
  };

  // Reset all filters back to default
  const handleResetAllFilters = () => {
    setSearchParams({}, { replace: true });
  };

  // Count active non-default filters
  const activeFiltersCount = [
    urlCategory !== 'All',
    urlGender !== 'all',
    urlSearch.trim() !== '',
    urlMinPrice !== '',
    urlMaxPrice !== '',
    urlColor !== null,
    urlFabric !== null,
    urlSize !== null,
    urlRating !== 'all',
    urlAvailability !== 'all',
    urlCustomizable
  ].filter(Boolean).length;

  const isAnyFilterActive = activeFiltersCount > 0 || urlSortBy !== 'recommended';

  // Phase 22: AI Style Search Evaluation (Sections 22-29)
  const aiSearchResult = useMemo(() => {
    if (!urlSearch || !urlSearch.trim()) return null;
    return evaluateStyleSearch(products, urlSearch);
  }, [products, urlSearch]);

  // Handle clicking a suggested alternative prompt (Section 23: puts prompt in search box & reruns search)
  const handleApplyPrompt = (promptText) => {
    const params = new URLSearchParams();
    params.set('search', promptText);
    setSearchParams(params, { replace: true });
  };

  // Multi-dimensional filtering and sorting execution
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = filterProducts(products, filters);
    return sortProducts(filtered, urlSortBy);
  }, [products, filters, urlSortBy]);

  return (
    <div className="py-8 sm:py-12 bg-neutral-50/40 min-h-screen">
      <PageContainer>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-2 text-xs text-neutral-500">
            <li>
              <Link to="/home" className="hover:text-brand-dark transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-neutral-800 font-semibold" aria-current="page">
              {urlCategory && urlCategory !== 'All' ? urlCategory : 'All Products'}
            </li>
          </ol>
        </nav>

        {/* Page Title & Count Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-brand-dark tracking-tight">
              {urlSearch ? 'AI Style Search' : urlCategory && urlCategory !== 'All' ? urlCategory : 'All Products'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl">
              {urlSearch
                ? `Intelligent styling recommendations tailored for "${urlSearch}".`
                : urlCategory && urlCategory !== 'All'
                ? `Browse our ${urlCategory} styles. Customize fabric, color, and size.`
                : 'Browse our clothing catalog. Customize fabric, color, and size.'}
            </p>
          </div>
          <div className="text-xs text-neutral-500 whitespace-nowrap self-start sm:self-end">
            {aiSearchResult ? (
              aiSearchResult.matchLevel === MATCH_LEVELS.EXACT_MATCH ? (
                <>Showing <strong className="text-brand-dark font-bold">{aiSearchResult.exactMatches.length}</strong> recommended styles</>
              ) : aiSearchResult.matchLevel === MATCH_LEVELS.CLOSE_MATCH ? (
                <>Showing <strong className="text-brand-dark font-bold">{aiSearchResult.closeMatches.length}</strong> similar styles</>
              ) : (
                <>Showing <strong className="text-brand-dark font-bold">{aiSearchResult.similarProducts.length}</strong> alternative styles</>
              )
            ) : (
              <>
                Showing <strong className="text-brand-dark font-bold">{filteredAndSortedProducts.length}</strong> of{' '}
                <strong className="text-neutral-800">{products.length}</strong> styles
              </>
            )}
          </div>
        </div>

        {/* Top Control Bar: Search Autocomplete & Quick Sorting */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Live Search Autocomplete */}
            <div className="flex-1">
              <SearchAutocomplete
                value={urlSearch}
                products={products}
                placeholder="Search products or ask AI Style Search (e.g. 'green hoodie for wedding', 'black formal shirt under ₹100')..."
                onChange={(val) => handleFilterChange('searchQuery', val)}
                onSearch={(val) => handleFilterChange('searchQuery', val)}
                size="md"
              />
            </div>

            {/* Quick Sort & Mobile Filter Toggle */}
            <div className="flex items-center gap-2">
              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setShowMobileDrawer(true)}
                className="lg:hidden flex items-center gap-2 px-3.5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-colors shrink-0"
                aria-label="Open filter menu"
              >
                <span>&#9881; Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-brand-dark text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <label htmlFor="shop-sort-select" className="text-xs font-semibold text-neutral-500 hidden sm:inline">
                  Sort:
                </label>
                <select
                  id="shop-sort-select"
                  value={urlSortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-neutral-800 focus:outline-none focus:border-brand-accent transition-colors"
                >
                  <option value="recommended">Recommended</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="most-reviewed">Most Reviewed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick AI Style Prompts Discovery Strip */}
          <div className="pt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 shadow-2xs">
              <span>&#10022;</span> AI Style Search:
            </span>
            {[
              'A dark blazer for a wedding',
              'Black formal shirt for office',
              'Traditional outfit for a festival',
              'Comfortable clothes for college',
              'A-Line casual dress under ₹1500'
            ].map((quickPrompt) => (
              <button
                key={quickPrompt}
                type="button"
                onClick={() => handleApplyPrompt(quickPrompt)}
                className="px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-brand-dark hover:text-white text-neutral-600 text-[11px] font-medium transition-colors shrink-0 cursor-pointer"
                title={`Search "${quickPrompt}"`}
              >
                &ldquo;{quickPrompt}&rdquo;
              </button>
            ))}
          </div>

          {/* Quick Category Buttons Strip */}
          <div className="pt-2 border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1 shrink-0">
              Department:
            </span>
            {facets.categories.map((cat) => {
              const isSelected = (urlCategory || 'All').toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleFilterChange('category', cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    isSelected
                      ? 'bg-brand-dark text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        <ActiveFilterChips
          filters={filters}
          onRemoveFilter={handleFilterChange}
          onClearAll={handleResetAllFilters}
          className="mb-6"
        />

        {/* 2-Column Layout: Left Sidebar Filters (Desktop) & Right Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar (3 cols) */}
          <aside className="hidden lg:block lg:col-span-3 bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm sticky top-24">
            <ShopFilterSidebar
              facets={facets}
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetAll={handleResetAllFilters}
            />
          </aside>

          {/* Main Content Area (9 cols on desktop, 12 on mobile) */}
          <main className="lg:col-span-9 space-y-6">
            {/* Loading Skeletons */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-neutral-200 p-4 h-96 flex flex-col justify-between"
                  >
                    <div className="w-full h-48 bg-neutral-200 rounded-xl mb-4" />
                    <div className="space-y-2">
                      <div className="w-3/4 h-4 bg-neutral-200 rounded" />
                      <div className="w-1/2 h-3 bg-neutral-100 rounded" />
                    </div>
                    <div className="w-full h-10 bg-neutral-200 rounded-xl mt-4" />
                  </div>
                ))}
              </div>
            ) : aiSearchResult ? (
              /* Phase 22: AI Style Search Result & Smart Alternatives (Sections 22-29) */
              <AiStyleSearchResult
                searchResult={aiSearchResult}
                onSelectPrompt={handleApplyPrompt}
                onResetSearch={handleResetAllFilters}
              />
            ) : filteredAndSortedProducts.length === 0 ? (
              /* Phase 22: Never leave customer with "No products found" (Section 32) */
              <AiStyleSearchResult
                searchResult={evaluateStyleSearch(products, urlCategory !== 'All' ? urlCategory : 'casual style')}
                onSelectPrompt={handleApplyPrompt}
                onResetSearch={handleResetAllFilters}
              />
            ) : (
              /* Product Grid (Part 13: 2 on mobile, 3 on tablet, 4 on large desktop) */
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </PageContainer>

      {/* Mobile Filters Sliding Drawer / Modal */}
      {showMobileDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity">
          <div
            className="w-full max-w-xs sm:max-w-sm bg-white h-full overflow-y-auto p-5 shadow-2xl flex flex-col justify-between"
            role="dialog"
            aria-modal="true"
            aria-label="Filter products drawer"
          >
            <ShopFilterSidebar
              facets={facets}
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetAll={handleResetAllFilters}
              onClose={() => setShowMobileDrawer(false)}
              isMobile
            />
          </div>
        </div>
      )}
    </div>
  );
}
