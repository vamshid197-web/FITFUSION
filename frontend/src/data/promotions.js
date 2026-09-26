/**
 * FITFUSION PROMOTIONAL RULES & FREE PERFUME SYSTEM (PHASE 14)
 * Centralized, configurable promotional criteria.
 */

export const FREE_PERFUME_RULES = {
  // Subtotal threshold required in INR to unlock 1 free promotional perfume
  THRESHOLD: 3999,
  
  // Maximum free promotional perfumes permitted per eligible order
  MAX_FREE_PER_ORDER: 1,

  // Promotion title and badge
  PROMO_TITLE: 'Atelier Royal Fragrance Gift',
  PROMO_BADGE: 'FREE ATELIER GIFT',

  // Curated luxury perfumes eligible for the promotional giveaway
  ELIGIBLE_PERFUMES: [
    {
      id: 'promo-p1',
      name: 'Bergamot & Sea Salt',
      brand: 'Atelier Riviera',
      fragranceFamily: 'Citrus',
      description: 'Crisp Italian bergamot infused with coastal sea breeze and sun-drenched neroli for a vibrant, uplifting trail.',
      normalPrice: 499,
      promotionalPrice: 0,
      icon: '🍋',
      accentColor: '#F59E0B'
    },
    {
      id: 'promo-p5',
      name: 'Alpine Mist & Juniper',
      brand: 'Nordic Atelier',
      fragranceFamily: 'Fresh',
      description: 'Invigorating glacial water accord with crushed wild juniper berries, mint leaf, and sheer white birch.',
      normalPrice: 499,
      promotionalPrice: 0,
      icon: '🌿',
      accentColor: '#0284C7'
    },
    {
      id: 'promo-p4',
      name: 'White Iris & Cashmere',
      brand: "L'Ombre Blanche",
      fragranceFamily: 'Floral',
      description: 'Powdery Florentine orris blended with soft white musk and delicate morning dew petals for quiet sophistication.',
      normalPrice: 499,
      promotionalPrice: 0,
      icon: '🌸',
      accentColor: '#8B5CF6'
    }
  ]
};

/**
 * Check if a cart subtotal qualifies for the free perfume gift
 * @param {number} subtotal 
 * @returns {boolean}
 */
export function checkFreePerfumeEligibility(subtotal) {
  return Number(subtotal || 0) >= FREE_PERFUME_RULES.THRESHOLD;
}

/**
 * Amount remaining to qualify for free perfume
 * @param {number} subtotal 
 * @returns {number}
 */
export function amountRemainingForFreePerfume(subtotal) {
  const diff = FREE_PERFUME_RULES.THRESHOLD - Number(subtotal || 0);
  return Math.max(0, diff);
}
