import { MOCK_PRODUCTS } from '../data/mockProducts.js';

/**
 * Complete the Look Recommendation Service
 * Evaluates current product and recommends 2-3 complementary products from the existing catalog.
 * Considers category pairing, gender match, style compatibility, and color balance.
 */
export function getCompleteTheLookRecommendations(currentProduct, catalog = MOCK_PRODUCTS) {
  if (!currentProduct) return [];

  const allProducts = Array.isArray(catalog) && catalog.length > 0 ? catalog : MOCK_PRODUCTS;
  const currentId = String(currentProduct.id);
  const currentCategory = currentProduct.category || '';
  const currentGender = currentProduct.gender || 'Men';

  // Compatible category pairings based on current garment
  let targetCategories = [];
  if (currentCategory === 'Shirts') {
    targetCategories = ['Jeans & Pants', 'Jackets', 'Hoodies'];
  } else if (currentCategory === 'T-Shirts') {
    targetCategories = ['Jeans & Pants', 'Jackets', 'Hoodies'];
  } else if (currentCategory === 'Jeans & Pants') {
    targetCategories = ['Shirts', 'T-Shirts', 'Jackets'];
  } else if (currentCategory === 'Hoodies') {
    targetCategories = ['Jeans & Pants', 'T-Shirts', 'Jackets'];
  } else if (currentCategory === 'Jackets') {
    targetCategories = ['Shirts', 'T-Shirts', 'Jeans & Pants'];
  } else if (currentCategory === 'Dresses') {
    targetCategories = ['Jackets', 'Traditional Wear'];
  } else if (currentCategory === 'Traditional Wear') {
    targetCategories = ['Traditional Wear', 'Jackets', 'Shirts'];
  } else {
    targetCategories = ['Jeans & Pants', 'Shirts', 'Jackets'];
  }

  // Filter pool excluding current product
  const pool = allProducts.filter((p) => String(p.id) !== currentId);

  const selectedRecommendations = [];
  const selectedIds = new Set([currentId]);

  // Pick one best product for each target category in order
  for (const cat of targetCategories) {
    if (selectedRecommendations.length >= 3) break;

    // Filter by target category and same gender (or Unisex/All)
    let matches = pool.filter(
      (p) =>
        !selectedIds.has(String(p.id)) &&
        p.category === cat &&
        (p.gender === currentGender || p.gender === 'Unisex' || !p.gender)
    );

    // If gender match is empty, relax gender constraint
    if (matches.length === 0) {
      matches = pool.filter((p) => !selectedIds.has(String(p.id)) && p.category === cat);
    }

    if (matches.length > 0) {
      // Pick first matching high-rated or available item
      const best = matches.find((p) => p.available !== false) || matches[0];
      selectedRecommendations.push(best);
      selectedIds.add(String(best.id));
    }
  }

  // Fallback if less than 2 items were found
  if (selectedRecommendations.length < 2) {
    const fallbackPool = pool.filter(
      (p) =>
        !selectedIds.has(String(p.id)) &&
        p.available !== false &&
        (p.gender === currentGender || !p.gender)
    );
    for (const item of fallbackPool) {
      if (selectedRecommendations.length >= 3) break;
      selectedRecommendations.push(item);
      selectedIds.add(String(item.id));
    }
  }

  return selectedRecommendations;
}
