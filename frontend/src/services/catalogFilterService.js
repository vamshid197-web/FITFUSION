/**
 * FITFUSION ADVANCED SEARCH & FILTER ENGINE (PHASE 15)
 * Pure, high-performance catalog querying, faceting, and suggestion engine.
 */

/**
 * Multi-token case-insensitive search across all product attributes.
 * @param {Array} products 
 * @param {string} query 
 * @returns {Array}
 */
export function searchProducts(products = [], query = '') {
  const trimmed = (query || '').trim().toLowerCase();
  if (!trimmed) return products;

  // Split query into tokens for multi-term discovery (e.g. "blue cotton shirt")
  const tokens = trimmed.split(/\s+/).filter(Boolean);

  return products.filter((product) => {
    // Collect all searchable text fields for this product
    const name = (product.name || '').toLowerCase();
    const category = (product.category || '').toLowerCase();
    const shortDesc = (product.shortDescription || '').toLowerCase();
    const desc = (product.description || '').toLowerCase();
    const badge = (product.badge || '').toLowerCase();

    const fabrics = (product.availableFabrics || []).map((f) => 
      `${f.name || ''} ${f.composition || ''}`.toLowerCase()
    );

    const colors = (product.availableColors || []).map((c) => 
      (typeof c === 'string' ? c : c.name || '').toLowerCase()
    );

    const sizes = (product.availableSizes || []).map((s) => String(s).toLowerCase());

    // Every token must match at least one attribute of the product (AND logic across words)
    return tokens.every((token) => {
      if (name.includes(token)) return true;
      if (category.includes(token)) return true;
      if (shortDesc.includes(token)) return true;
      if (desc.includes(token)) return true;
      if (badge.includes(token)) return true;
      if (fabrics.some((f) => f.includes(token))) return true;
      if (colors.some((c) => c.includes(token))) return true;
      if (sizes.some((s) => s.includes(token))) return true;
      return false;
    });
  });
}

/**
 * Filter catalog products by multi-dimensional facets.
 * @param {Array} products 
 * @param {object} filters 
 * @returns {Array}
 */
export function filterProducts(products = [], filters = {}) {
  const {
    searchQuery = '',
    category = 'All',
    minPrice = null,
    maxPrice = null,
    color = null,
    fabric = null,
    size = null,
    rating = 'all',
    availability = 'all', // 'all' | 'in-stock'
    customizableOnly = false
  } = filters;

  // 1. Initial multi-term search
  let result = searchProducts(products, searchQuery);

  // 2. Category facet
  if (category && category !== 'All') {
    const catLower = category.toLowerCase();
    result = result.filter(
      (p) => (p.category || '').toLowerCase() === catLower
    );
  }

  // 3. Price range facet
  const min = minPrice !== null && minPrice !== '' && !isNaN(Number(minPrice)) ? Number(minPrice) : null;
  const max = maxPrice !== null && maxPrice !== '' && !isNaN(Number(maxPrice)) ? Number(maxPrice) : null;

  if (min !== null || max !== null) {
    result = result.filter((p) => {
      const price = Number(p.basePrice || p.price || 0);
      if (min !== null && price < min) return false;
      if (max !== null && price > max) return false;
      return true;
    });
  }

  // 4. Color facet
  if (color && color !== 'all') {
    const colLower = color.toLowerCase();
    result = result.filter((p) => {
      const colors = (p.availableColors || []).map((c) =>
        (typeof c === 'string' ? c : c.name || '').toLowerCase()
      );
      return colors.some((c) => c.includes(colLower) || colLower.includes(c));
    });
  }

  // 5. Fabric facet
  if (fabric && fabric !== 'all') {
    const fabLower = fabric.toLowerCase();
    result = result.filter((p) => {
      const fabrics = (p.availableFabrics || []).map((f) =>
        `${f.name || ''} ${f.composition || ''}`.toLowerCase()
      );
      return fabrics.some((f) => f.includes(fabLower) || fabLower.includes(f));
    });
  }

  // 6. Size facet
  if (size && size !== 'all') {
    const sizeLower = String(size).toLowerCase();
    result = result.filter((p) => {
      const sizes = (p.availableSizes || []).map((s) => String(s).toLowerCase());
      return sizes.includes(sizeLower);
    });
  }

  // 7. Rating facet
  if (rating && rating !== 'all') {
    const minRating = Number(rating);
    if (!isNaN(minRating)) {
      result = result.filter((p) => Number(p.rating || 0) >= minRating);
    }
  }

  // 8. Stock availability facet
  if (availability === 'in-stock') {
    result = result.filter(
      (p) => p.available !== false && p.stockStatus !== 'Out of Stock'
    );
  }

  // 9. Customizable toggle
  if (customizableOnly) {
    result = result.filter((p) => p.customizationEnabled !== false);
  }

  return result;
}

/**
 * Sort products according to standard FitFusion sorting criteria.
 * @param {Array} products 
 * @param {string} sortBy 
 * @returns {Array}
 */
export function sortProducts(products = [], sortBy = 'recommended') {
  const clone = [...products];

  return clone.sort((a, b) => {
    const priceA = Number(a.basePrice || a.price || 0);
    const priceB = Number(b.basePrice || b.price || 0);
    const ratingA = Number(a.rating || 0);
    const ratingB = Number(b.rating || 0);
    const reviewsA = Number(a.reviewsCount || 0);
    const reviewsB = Number(b.reviewsCount || 0);

    switch (sortBy) {
      case 'price-low':
        return priceA - priceB;
      case 'price-high':
        return priceB - priceA;
      case 'rating':
        return ratingB - ratingA;
      case 'reviews':
      case 'most-reviewed':
        return reviewsB - reviewsA;
      case 'newest': {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      }
      case 'recommended':
      default: {
        // High priority score for featured, recommended badges, followed by rating
        const scoreA =
          (a.featured || a.badge === 'Featured' ? 25 : 0) +
          (a.recommended ? 15 : 0) +
          (a.trending ? 10 : 0) +
          ratingA * 2;
        const scoreB =
          (b.featured || b.badge === 'Featured' ? 25 : 0) +
          (b.recommended ? 15 : 0) +
          (b.trending ? 10 : 0) +
          ratingB * 2;
        return scoreB - scoreA;
      }
    }
  });
}

/**
 * Extract live facets and metadata bounds from the loaded product catalog.
 * Dynamically adapts to catalog data without hardcoded assumptions.
 * @param {Array} products 
 * @returns {object}
 */
export function extractCatalogFacets(products = []) {
  const categoriesSet = new Set();
  const colorsMap = new Map(); // name -> { name, hex }
  const fabricsSet = new Set();
  const sizesSet = new Set();
  const prices = [];

  products.forEach((p) => {
    if (p.category) categoriesSet.add(p.category);

    const price = Number(p.basePrice || p.price || 0);
    if (!isNaN(price) && price > 0) prices.push(price);

    (p.availableColors || []).forEach((c) => {
      const name = typeof c === 'string' ? c : c.name;
      const hex = typeof c === 'object' && c.hex ? c.hex : null;
      if (name) {
        if (!colorsMap.has(name)) {
          colorsMap.set(name, { name, hex: hex || '#1E3A8A' });
        }
      }
    });

    (p.availableFabrics || []).forEach((f) => {
      const name = typeof f === 'string' ? f : f.name;
      if (name) fabricsSet.add(name);
    });

    (p.availableSizes || []).forEach((s) => {
      if (s) sizesSet.add(String(s));
    });
  });

  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 5000;

  // Generate sensible quick price brackets dynamically based on catalog magnitude
  const isHighValueCatalog = maxPrice >= 500;
  const quickPriceBrackets = isHighValueCatalog
    ? [
        { label: 'All Prices', min: null, max: null, id: 'all' },
        { label: 'Under ₹1,000', min: 0, max: 1000, id: 'under-1000' },
        { label: '₹1,000 – ₹2,000', min: 1000, max: 2000, id: '1000-2000' },
        { label: '₹2,000 – ₹5,000', min: 2000, max: 5000, id: '2000-5000' },
        { label: 'Above ₹5,000', min: 5000, max: null, id: 'over-5000' }
      ]
    : [
        { label: 'All Prices', min: null, max: null, id: 'all' },
        { label: 'Under ₹50', min: 0, max: 50, id: 'under-50' },
        { label: '₹50 – ₹100', min: 50, max: 100, id: '50-100' },
        { label: '₹100 – ₹150', min: 100, max: 150, id: '100-150' },
        { label: 'Above ₹150', min: 150, max: null, id: 'over-150' }
      ];

  return {
    categories: ['All', ...Array.from(categoriesSet)],
    colors: Array.from(colorsMap.values()),
    fabrics: Array.from(fabricsSet),
    sizes: Array.from(sizesSet),
    minPrice,
    maxPrice,
    quickPriceBrackets
  };
}

/**
 * Generate autocomplete search suggestions from real catalog data.
 * @param {Array} products 
 * @param {string} query 
 * @param {number} maxResults 
 * @returns {object} { categories, products, attributes }
 */
export function getSearchSuggestions(products = [], query = '', maxResults = 5) {
  const trimmed = (query || '').trim().toLowerCase();
  if (!trimmed || trimmed.length < 1) {
    return { categories: [], products: [], attributes: [] };
  }

  // 1. Matching categories
  const categoriesSet = new Set();
  products.forEach((p) => {
    if (p.category && p.category.toLowerCase().includes(trimmed)) {
      categoriesSet.add(p.category);
    }
  });

  // 2. Matching products
  const matchingProducts = searchProducts(products, trimmed).slice(0, maxResults);

  // 3. Matching fabrics & colors
  const attributes = [];
  products.forEach((p) => {
    (p.availableFabrics || []).forEach((f) => {
      const name = typeof f === 'string' ? f : f.name;
      if (name && name.toLowerCase().includes(trimmed)) {
        if (!attributes.some((a) => a.type === 'fabric' && a.value === name)) {
          attributes.push({ type: 'fabric', label: `Fabric: ${name}`, value: name });
        }
      }
    });

    (p.availableColors || []).forEach((c) => {
      const name = typeof c === 'string' ? c : c.name;
      if (name && name.toLowerCase().includes(trimmed)) {
        if (!attributes.some((a) => a.type === 'color' && a.value === name)) {
          attributes.push({ type: 'color', label: `Color: ${name}`, value: name, hex: c.hex });
        }
      }
    });
  });

  return {
    categories: Array.from(categoriesSet).slice(0, 3),
    products: matchingProducts,
    attributes: attributes.slice(0, 4)
  };
}
