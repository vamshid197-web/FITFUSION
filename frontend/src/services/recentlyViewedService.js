const STORAGE_KEY = 'fitfusion_recently_viewed';
const MAX_ITEMS = 10;

/**
 * Fetch recently viewed products from local storage
 * @returns {Array} List of up to 10 recently viewed product records
 */
export function getRecentlyViewed() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[RecentlyViewed] Error reading from localStorage:', err);
    return [];
  }
}

/**
 * Record a product view
 * @param {object} product - Catalog product
 */
export function recordRecentlyViewed(product) {
  if (!product || !product.id) return [];

  try {
    const list = getRecentlyViewed();
    const prodId = String(product.id);

    // Remove existing entry if present to bump to front
    const filtered = list.filter((p) => String(p.id || p.productId) !== prodId);

    const record = {
      id: prodId,
      productId: prodId,
      name: product.name || product.productName || 'Bespoke Garment',
      category: product.category || 'Apparel',
      price: Number(product.basePrice || product.price || 0),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      image: product.images?.[0] || product.thumbnail || product.productImage || null,
      silhouetteColor: product.silhouetteColor || 'from-stone-100 to-amber-50',
      available: product.available !== false && product.stockStatus !== 'Out of Stock',
      customizable: product.customizable !== false,
      viewedAt: new Date().toISOString()
    };

    filtered.unshift(record);
    const capped = filtered.slice(0, MAX_ITEMS);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
    }

    return capped;
  } catch (err) {
    console.warn('[RecentlyViewed] Error saving to localStorage:', err);
    return [];
  }
}

/**
 * Clear recently viewed history
 */
export function clearRecentlyViewed() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.warn('[RecentlyViewed] Error clearing localStorage:', err);
  }
}
