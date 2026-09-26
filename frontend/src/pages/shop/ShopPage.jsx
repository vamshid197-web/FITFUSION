import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import { MOCK_PRODUCTS, CLOTHING_CATEGORIES } from '../../data/mockProducts.js';
import { getProductsFromFirestore } from '../../services/firestoreService.js';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('featured');

  // Load from Firestore with graceful fallback to MOCK_PRODUCTS
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        const res = await getProductsFromFirestore();
        if (isMounted && res.success && res.products?.length > 0) {
          setProducts(res.products);
        }
      } catch (err) {
        console.warn('[ShopPage] Failed to fetch products from Firestore:', err);
      }
    }
    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.basePrice - b.basePrice;
      if (sortBy === 'price-high') return b.basePrice - a.basePrice;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // default featured
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="py-8 sm:py-12 space-y-8">
      <PageContainer>
        {/* Page Title & Breadcrumb */}
        <div className="space-y-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
            Custom Apparel Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-dark">
            Bespoke Garments & Silhouettes
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl">
            Choose your foundational garment style, then personalize certified fabric weaves, colorways, collar architecture, and luxury fragrance pairings.
          </p>
        </div>

        {/* Filter Toolbar: Search, Sort, and Categories */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Live Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by garment, fabric, or style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-50 rounded-lg border border-neutral-200 focus:outline-none focus:border-brand-accent focus:bg-white text-neutral-900"
              />
              <svg
                className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-by" className="text-xs font-semibold text-neutral-500 whitespace-nowrap">
                Sort by:
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-medium bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:border-brand-accent"
              >
                <option value="featured">Featured Collection</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
            {CLOTHING_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory.toLowerCase() === category.toLowerCase()
                    ? 'bg-brand-dark text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex justify-between items-center text-xs text-neutral-500 mb-6">
          <span>
            Showing <strong className="text-neutral-800">{filteredProducts.length}</strong> customizable styles
          </span>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => handleCategorySelect('All')}
              className="text-brand-accent hover:underline"
            >
              Reset filter
            </button>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-neutral-200 p-8">
            <p className="text-sm font-semibold text-neutral-700">No customizable garments match your search.</p>
            <p className="text-xs text-neutral-500 mt-1">Try another keyword or select All categories.</p>
            <div className="mt-4">
              <Button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                variant="outline"
                size="sm"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Silhouette / Image Area */}
                <div className={`aspect-[4/3] bg-gradient-to-br ${product.silhouetteColor} p-5 flex flex-col justify-between relative`}>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-neutral-800 shadow-sm">
                      {product.category}
                    </span>
                    {product.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-accent text-white shadow-sm">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Visual Silhouette representation */}
                  <div className="my-auto text-center">
                    <div className="w-16 h-22 mx-auto rounded-lg bg-white/90 border border-neutral-200 shadow-sm flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                      <span className="text-[10px] font-bold text-neutral-800 text-center line-clamp-2">
                        {product.name}
                      </span>
                    </div>
                  </div>

                  {/* Rating & Base Price */}
                  <div className="flex justify-between items-center text-xs font-semibold text-neutral-800">
                    <span className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded shadow-xs">
                      Base: ₹{product.basePrice}
                    </span>
                    <span className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                      <span className="text-amber-500">&#9733;</span> {product.rating} ({product.reviewsCount})
                    </span>
                  </div>
                </div>

                {/* Content info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-brand-dark group-hover:text-brand-accent transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Color Swatch Indicators */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[11px] font-medium text-neutral-500">Colors:</span>
                      <div className="flex items-center gap-1.5">
                        {product.availableColors.map((color) => (
                          <span
                            key={color.name}
                            title={color.name}
                            style={{ backgroundColor: color.hex }}
                            className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-xs inline-block"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
                    <Button to={`/customize/${product.id}`} variant="secondary" size="sm" className="flex-1">
                      Customize
                    </Button>
                    <Button to={`/product/${product.id}`} variant="outline" size="sm">
                      View Product
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
