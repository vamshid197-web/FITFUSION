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

  // Split query into tokens for multi-term discovery (e.g. "black hoodie", "women jeans")
  const tokens = trimmed.split(/\s+/).filter(Boolean);

  return products.filter((product) => {
    // Collect all searchable text fields for this product
    const name = (product.name || '').toLowerCase();
    const category = (product.category || '').toLowerCase();
    const subcategory = (product.subcategory || '').toLowerCase();
    const group = (product.group || '').toLowerCase();
    const gender = (product.gender || '').toLowerCase();
    const style = (product.style || '').toLowerCase();
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

    const occasions = (Array.isArray(product.occasion) ? product.occasion : [product.occasion || '']).map(o => String(o).toLowerCase());
    const seasons = (Array.isArray(product.season) ? product.season : [product.season || '']).map(s => String(s).toLowerCase());

    // Build compound searchable corpus
    const corpus = [
      name,
      category,
      subcategory,
      group,
      gender,
      style,
      shortDesc,
      desc,
      badge,
      ...fabrics,
      ...colors,
      ...sizes,
      ...occasions,
      ...seasons
    ].join(' ');

    // Every token must match at least one attribute of the product (AND logic across words)
    return tokens.every((token) => {
      // Direct substring match
      if (corpus.includes(token)) return true;

      // Gender term normalization
      if (token === 'men' || token === 'mens' || token === "men's" || token === 'man') {
        return gender === 'men' || gender === 'unisex';
      }
      if (token === 'women' || token === 'womens' || token === "women's" || token === 'woman' || token === 'ladies' || token === 'lady') {
        return gender === 'women' || gender === 'unisex';
      }
      if (token === 'kids' || token === 'kid' || token === 'baby' || token === 'boys' || token === 'girls') {
        return gender === 'kids' || gender === 'baby';
      }

      // Garment term normalization
      if (token === 'tshirt' || token === 't-shirt' || token === 'tee' || token === 'tees') {
        return name.includes('t-shirt') || category.includes('t-shirt') || subcategory.includes('t-shirt');
      }
      if (token === 'hoodie' || token === 'hoodies') {
        return name.includes('hoodie') || subcategory.includes('hoodie') || category.includes('hoodie');
      }
      if (token === 'jeans' || token === 'jean' || token === 'denim') {
        return name.includes('jean') || subcategory.includes('jean') || category.includes('jean') || corpus.includes('denim');
      }
      if (token === 'saree' || token === 'sari' || token === 'saris' || token === 'sarees') {
        return name.includes('saree') || subcategory.includes('saree');
      }
      if (token === 'lehenga' || token === 'lehengas') {
        return name.includes('lehenga') || subcategory.includes('lehenga');
      }
      if (token === 'shoes' || token === 'shoe' || token === 'sneakers' || token === 'footwear') {
        return category.includes('footwear') || subcategory.includes('shoes') || name.includes('shoes') || name.includes('sneakers');
      }

      return false;
    });
  });
}

/**
 * Centralized Category Normalization
 * Consistently maps all category variations, slugs, and synonyms across
 * Home, Shop, URL query parameters, facets, and mockProducts.
 * @param {string} category 
 * @returns {string} One of the canonical category names or 'All'
 */
export function normalizeCategory(category) {
  if (!category || category === 'All' || category.toLowerCase() === 'all') {
    return 'All';
  }
  const clean = category.toLowerCase().trim();

  // 1. T-Shirts
  if (
    clean === 't-shirts' || clean === 'tshirts' || clean === 't-shirt' ||
    clean === 'tshirt' || clean === 'tees' || clean === 'tee' ||
    clean === 'polo' || clean === 'polo t-shirts' || clean === 'polo t-shirt' ||
    clean.includes('t-shirt') || clean.includes('tshirt')
  ) {
    return 'T-Shirts';
  }

  // 2. Shirts (ensure not confused with t-shirts)
  if (
    clean === 'shirts' || clean === 'shirt' || clean === 'formal shirts' ||
    clean === 'casual shirts' || clean === 'overshirt' || clean === 'overshirts' ||
    clean === 'button-down' || clean === 'oxford shirt'
  ) {
    return 'Shirts';
  }

  // 3. Hoodies
  if (
    clean === 'hoodies' || clean === 'hoodie' || clean === 'sweatshirts' ||
    clean === 'sweatshirt' || clean === 'sweaters' || clean === 'sweater' ||
    clean === 'pullover' || clean.includes('hoodie') || clean.includes('sweatshirt')
  ) {
    return 'Hoodies';
  }

  // 4. Jeans & Pants
  if (
    clean === 'jeans & pants' || clean === 'jeans and pants' || clean === 'pants / jeans' ||
    clean === 'pants/jeans' || clean === 'pants' || clean === 'pant' ||
    clean === 'jeans' || clean === 'jean' || clean === 'chinos' || clean === 'chino' ||
    clean === 'trousers' || clean === 'trouser' || clean === 'cargo pants' || clean === 'cargos' ||
    clean.includes('jean') || clean.includes('pant') || clean.includes('chino') || clean.includes('trouser')
  ) {
    return 'Jeans & Pants';
  }

  // 5. Dresses
  if (
    clean === 'dresses' || clean === 'dress' || clean === 'skirts' || clean === 'skirt' ||
    clean.includes('dress') || clean.includes('gown')
  ) {
    return 'Dresses';
  }

  // 6. Jackets
  if (
    clean === 'jackets' || clean === 'jacket' || clean === 'blazers' || clean === 'blazer' ||
    clean === 'jackets / blazers' || clean === 'jackets/blazers' || clean === 'coats' || clean === 'coat' ||
    clean.includes('jacket') || clean.includes('blazer')
  ) {
    return 'Jackets';
  }

  // 7. Traditional Wear
  if (
    clean === 'traditional wear' || clean === 'traditional' || clean === 'ethnic wear' ||
    clean === 'ethnic' || clean === 'kurtas' || clean === 'kurta' || clean === 'sherwani' ||
    clean === 'sherwanis' || clean === 'nehru jacket' || clean === 'waistcoat' || clean === 'waistcoats' ||
    clean === 'kurta pajama' || clean.includes('traditional') || clean.includes('ethnic') ||
    clean.includes('kurta') || clean.includes('sherwani')
  ) {
    return 'Traditional Wear';
  }

  return category;
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
    subcategory = null,
    gender = null,
    minPrice = null,
    maxPrice = null,
    color = null,
    fabric = null,
    size = null,
    occasion = null,
    season = null,
    style = null,
    rating = 'all',
    availability = 'all', // 'all' | 'in-stock'
    customizableOnly = false
  } = filters;

  // 1. Initial multi-term search
  let result = searchProducts(products, searchQuery);

  // 2. Category facet
  if (category && category !== 'All') {
    const targetNorm = normalizeCategory(category);
    result = result.filter((p) => {
      const pNorm = normalizeCategory(p.category);
      return pNorm === targetNorm || (p.group && p.group.toLowerCase() === category.toLowerCase());
    });
  }

  // 2b. Subcategory facet
  if (subcategory && subcategory !== 'all' && subcategory !== 'All') {
    const subLower = subcategory.toLowerCase().trim();
    result = result.filter((p) => {
      return (p.subcategory || '').toLowerCase().trim() === subLower;
    });
  }

  // 2c. Gender facet
  if (gender && gender !== 'all' && gender !== 'All') {
    const genLower = gender.toLowerCase().trim();
    result = result.filter((p) => {
      const pGen = (p.gender || '').toLowerCase();
      if (genLower === 'men') return pGen === 'men' || pGen === 'unisex';
      if (genLower === 'women') return pGen === 'women' || pGen === 'unisex';
      if (genLower === 'kids') return pGen === 'kids' || pGen === 'baby';
      return pGen === genLower;
    });
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

  // 6b. Occasion facet
  if (occasion && occasion !== 'all') {
    const occLower = occasion.toLowerCase();
    result = result.filter((p) => {
      const occs = (Array.isArray(p.occasion) ? p.occasion : [p.occasion || '']).map(o => String(o).toLowerCase());
      return occs.some(o => o.includes(occLower));
    });
  }

  // 6c. Season facet
  if (season && season !== 'all') {
    const seaLower = season.toLowerCase();
    result = result.filter((p) => {
      const seas = (Array.isArray(p.season) ? p.season : [p.season || '']).map(s => String(s).toLowerCase());
      return seas.some(s => s.includes(seaLower));
    });
  }

  // 6d. Style facet
  if (style && style !== 'all') {
    const styLower = style.toLowerCase();
    result = result.filter((p) => {
      return (p.style || '').toLowerCase().includes(styLower);
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
  const subcategoriesSet = new Set();
  const gendersSet = new Set();
  const occasionsSet = new Set();
  const seasonsSet = new Set();
  const stylesSet = new Set();
  const colorsMap = new Map(); // name -> { name, hex }
  const fabricsSet = new Set();
  const sizesSet = new Set();
  const prices = [];

  products.forEach((p) => {
    if (p.category) categoriesSet.add(normalizeCategory(p.category));
    if (p.subcategory) subcategoriesSet.add(p.subcategory);
    if (p.gender) gendersSet.add(p.gender);
    if (p.style) stylesSet.add(p.style);

    (Array.isArray(p.occasion) ? p.occasion : [p.occasion]).forEach(o => {
      if (o && typeof o === 'string' && o.trim()) occasionsSet.add(o.trim());
    });

    (Array.isArray(p.season) ? p.season : [p.season]).forEach(s => {
      if (s && typeof s === 'string' && s.trim()) seasonsSet.add(s.trim());
    });

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
    subcategories: Array.from(subcategoriesSet).sort(),
    genders: ['All', ...Array.from(gendersSet).sort()],
    occasions: Array.from(occasionsSet).sort(),
    seasons: Array.from(seasonsSet).sort(),
    styles: Array.from(stylesSet).sort(),
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
