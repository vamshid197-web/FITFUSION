/**
 * FITFUSION AI STYLE SEARCH & RECOMMENDATION ENGINE
 * Phase 22: Smart Alternatives, Weak Match Detection & Match Level Classification.
 * 
 * Determines whether catalog products are genuinely relevant to customer natural-language style requests.
 * Evaluates EXACT MATCH, CLOSE MATCH, and NO MATCH levels.
 * Generates 3-5 smart, clickable suggested prompts grounded strictly in the existing FITFUSION catalog.
 * Curates real similar products from the catalog when no exact match exists.
 */

import { normalizeCategory } from './catalogFilterService.js';

// Internal match levels (Section 26)
export const MATCH_LEVELS = {
  EXACT_MATCH: 'EXACT_MATCH',
  CLOSE_MATCH: 'CLOSE_MATCH',
  NO_MATCH: 'NO_MATCH'
};

// UI Section Labels (Section 26 & 29)
export const UI_LABELS = {
  EXACT_MATCH: 'Recommended for you',
  CLOSE_MATCH: 'Similar options',
  NO_MATCH_TITLE: "We couldn't find an exact match",
  NO_MATCH_EXPLANATION: "We couldn't find an exact match for your request.",
  TRY_ANOTHER_STYLE: "Let's try another style",
  TRY_ANOTHER_STYLE_SHORT: "Try another style",
  SIMILAR_CLOTHES: 'Similar clothes you may like'
};

// Known color dictionary for catalog matching
const COLOR_SYNONYMS = {
  black: ['black', 'washed black', 'charcoal', 'matte black'],
  white: ['white', 'off-white', 'off white', 'cream', 'ivory', 'pristine white'],
  blue: ['blue', 'navy', 'navy blue', 'sky blue', 'baby blue', 'royal blue', 'light blue', 'vintage blue', 'indigo', 'dark indigo', 'stone wash blue', 'midnight blue', 'midnight navy'],
  green: ['green', 'olive', 'olive green', 'forest green', 'sage green', 'mint green', 'teal', 'emerald', 'emerald green', 'bottle green', 'olive drab'],
  red: ['red', 'wine', 'burgundy', 'maroon', 'royal wine', 'rose', 'rose pink', 'rose gold'],
  yellow: ['yellow', 'mustard', 'mustard yellow', 'mustard gold', 'gold', 'royal gold', 'golden ochre'],
  pink: ['pink', 'rose pink', 'pastel pink', 'peach'],
  brown: ['brown', 'tan', 'camel', 'khaki', 'chocolate brown', 'dusty brown', 'beige tan', 'dark brown'],
  beige: ['beige', 'tan', 'cream', 'khaki', 'champagne', 'off-white'],
  grey: ['grey', 'gray', 'charcoal', 'charcoal grey', 'light grey', 'steel grey']
};

/**
 * Parses a free-form customer query into structured semantic intent.
 * @param {string} query 
 * @returns {object}
 */
export function parseStyleQuery(query = '') {
  const clean = (query || '').toLowerCase().trim();
  if (!clean) {
    return {
      rawQuery: '',
      category: null,
      colors: [],
      budget: null,
      occasion: null,
      style: null,
      hasStyleClash: false,
      budgetUnattainable: false,
      tokens: []
    };
  }

  // 1. Extract Budget (e.g. "under ₹100", "under 2000", "< 500", "below 1500")
  let budget = null;
  const budgetMatch = clean.match(/(?:under|below|less than|within|max|up to|<|budget(?:\s+(?:of|is))?)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i) ||
                      clean.match(/(?:₹|rs\.?|inr)\s*(\d+)/i);
  if (budgetMatch && budgetMatch[1]) {
    budget = parseInt(budgetMatch[1], 10);
  }

  // 2. Extract Category
  let category = null;
  let subcategory = null;

  if (clean.includes('traditional') || clean.includes('ethnic') || clean.includes('kurta') || clean.includes('sherwani') || clean.includes('nehru jacket') || clean.includes('waistcoat')) {
    category = 'Traditional Wear';
    if (clean.includes('sherwani')) subcategory = 'Sherwani';
    else if (clean.includes('kurta pajama')) subcategory = 'Kurta Pajama';
    else if (clean.includes('nehru jacket')) subcategory = 'Nehru Jacket';
    else if (clean.includes('waistcoat')) subcategory = 'Waistcoat';
    else if (clean.includes('kurta')) subcategory = 'Kurta';
  } else if (clean.includes('t-shirt') || clean.includes('tshirt') || clean.includes('tee') || clean.includes('polo')) {
    category = 'T-Shirts';
    if (clean.includes('polo')) subcategory = 'Polo';
    else if (clean.includes('oversized')) subcategory = 'Oversized';
    else if (clean.includes('graphic')) subcategory = 'Graphic';
  } else if (clean.includes('hoodie') || clean.includes('hoodies') || clean.includes('sweatshirt')) {
    category = 'Hoodies';
    if (clean.includes('zip')) subcategory = 'Zip-Up';
    else if (clean.includes('fleece')) subcategory = 'Fleece';
    else if (clean.includes('pullover')) subcategory = 'Pullover';
  } else if (clean.includes('formal shirt') || clean.includes('dress shirt') || clean.includes('oxford') || clean.includes('shirt')) {
    category = 'Shirts';
    if (clean.includes('formal') || clean.includes('oxford') || clean.includes('dress shirt')) subcategory = 'Formal Shirt';
    else if (clean.includes('linen')) subcategory = 'Linen Shirt';
  } else if (clean.includes('dress') || clean.includes('dresses') || clean.includes('gown') || clean.includes('midi')) {
    category = 'Dresses';
    if (clean.includes('evening') || clean.includes('slip') || clean.includes('silk')) subcategory = 'Evening Dress';
    else if (clean.includes('midi')) subcategory = 'Midi Dress';
    else if (clean.includes('wrap')) subcategory = 'Wrap Dress';
  } else if (clean.includes('blazer') || clean.includes('jacket') || clean.includes('coat')) {
    category = 'Jackets';
    if (clean.includes('blazer')) subcategory = 'Blazer';
    else if (clean.includes('bomber')) subcategory = 'Bomber';
    else if (clean.includes('denim jacket')) subcategory = 'Denim Jacket';
  } else if (clean.includes('jeans') || clean.includes('pant') || clean.includes('pants') || clean.includes('chinos') || clean.includes('trousers')) {
    category = 'Jeans & Pants';
    if (clean.includes('chinos') || clean.includes('chino')) subcategory = 'Chinos';
    else if (clean.includes('jeans') || clean.includes('denim')) subcategory = 'Jeans';
    else if (clean.includes('trousers') || clean.includes('formal trouser')) subcategory = 'Trousers';
  }

  // 3. Extract Colors
  const matchedColors = [];
  for (const [canonicalColor, synonyms] of Object.entries(COLOR_SYNONYMS)) {
    for (const syn of synonyms) {
      const regex = new RegExp(`\\b${syn}\\b`, 'i');
      if (regex.test(clean)) {
        if (!matchedColors.includes(canonicalColor)) {
          matchedColors.push(canonicalColor);
        }
        break;
      }
    }
  }

  // 4. Extract Occasion & Vibe
  let occasion = null;
  if (clean.includes('wedding') || clean.includes('marriage') || clean.includes('reception') || clean.includes('shaadi')) {
    occasion = 'wedding';
  } else if (clean.includes('festival') || clean.includes('festive') || clean.includes('celebration') || clean.includes('diwali') || clean.includes('eid') || clean.includes('puja')) {
    occasion = 'festival';
  } else if (clean.includes('college') || clean.includes('campus') || clean.includes('university')) {
    occasion = 'college';
  } else if (clean.includes('office') || clean.includes('work') || clean.includes('interview') || clean.includes('corporate')) {
    occasion = 'office';
  } else if (clean.includes('party') || clean.includes('night out') || clean.includes('evening event') || clean.includes('date')) {
    occasion = 'party';
  }

  // 5. Extract Style / Fit Traits
  let style = null;
  if (clean.includes('formal') || clean.includes('black tie')) style = 'formal';
  else if (clean.includes('comfortable') || clean.includes('comfy') || clean.includes('relaxed')) style = 'comfortable';
  else if (clean.includes('casual') || clean.includes('daily')) style = 'casual';
  else if (clean.includes('traditional') || clean.includes('ethnic')) style = 'traditional';

  // 6. Style Clash Detection (Section 22, 23, 25)
  // E.g., "green hoodie for a wedding" or "t-shirt for a wedding" -> Hoodies/tees are casual sportswear, not wedding attire.
  let hasStyleClash = false;
  let clashReason = '';
  if (occasion === 'wedding' && (category === 'Hoodies' || clean.includes('hoodie') || (category === 'T-Shirts' && !clean.includes('blazer')))) {
    hasStyleClash = true;
    clashReason = 'Hoodies and t-shirts are casual streetwear, whereas weddings require formal tailoring or traditional attire.';
  }

  // 7. Unattainable Budget Detection (Section 25, 26, 31)
  // Catalog minimum prices:
  // - Overall minimum: ₹599
  // - Shirts: ₹1099
  // - Dresses: ₹1299
  // - Traditional Wear: ₹1099
  // - Jackets: ₹1699
  // - Hoodies: ₹1299
  // - Jeans & Pants: ₹1399
  let budgetUnattainable = false;
  if (budget !== null) {
    if (budget < 599) {
      budgetUnattainable = true;
    } else if (category === 'Shirts' && budget < 1000) {
      budgetUnattainable = true;
    } else if (category === 'Dresses' && budget < 1200) {
      budgetUnattainable = true;
    } else if (category === 'Jackets' && budget < 1600) {
      budgetUnattainable = true;
    } else if (category === 'Traditional Wear' && budget < 1000) {
      budgetUnattainable = true;
    }
  }

  return {
    rawQuery: query,
    category,
    subcategory,
    colors: matchedColors,
    budget,
    occasion,
    style,
    hasStyleClash,
    clashReason,
    budgetUnattainable,
    tokens: clean.split(/\s+/).filter(Boolean)
  };
}

/**
 * Computes suitability of a product for a specific occasion.
 * @param {object} product 
 * @param {string} occasion 
 * @returns {number} Score from 0.0 to 1.0
 */
function getOccasionSuitability(product, occasion) {
  if (!occasion) return 0.7; // neutral

  const cat = normalizeCategory(product.category);
  const name = (product.name || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();

  switch (occasion) {
    case 'wedding':
      // Traditional Wear, Sherwanis, Blazers, Silk Dresses are prime wedding attire
      if (cat === 'Traditional Wear') return 1.0;
      if (cat === 'Jackets' && (name.includes('blazer') || name.includes('tailored'))) return 0.95;
      if (cat === 'Shirts' && (name.includes('formal') || name.includes('dress shirt') || name.includes('oxford'))) return 0.85;
      if (cat === 'Dresses' && (name.includes('silk') || name.includes('evening') || name.includes('satin'))) return 0.95;
      // Casual hoodies and tees are not suitable for weddings
      if (cat === 'Hoodies' || cat === 'T-Shirts') return 0.05;
      return 0.4;

    case 'festival':
      if (cat === 'Traditional Wear') return 1.0;
      if (name.includes('festive') || name.includes('embroidered') || name.includes('kurta')) return 1.0;
      if (cat === 'Dresses' && (name.includes('silk') || name.includes('midi'))) return 0.85;
      if (cat === 'Jackets' && name.includes('blazer')) return 0.75;
      return 0.3;

    case 'office':
      if (cat === 'Shirts') {
        if (name.includes('formal') || name.includes('dress') || name.includes('oxford') || name.includes('classic')) return 1.0;
        return 0.85; // All tailored & collared shirts are suitable for office workwear
      }
      if (cat === 'Jackets' && name.includes('blazer')) return 1.0;
      if (cat === 'Jeans & Pants' && (name.includes('trouser') || name.includes('chino'))) return 0.95;
      if (cat === 'T-Shirts' && name.includes('polo')) return 0.7;
      if (cat === 'Hoodies') return 0.1;
      return 0.4;

    case 'college':
      // Comfortable everyday casuals: T-shirts, hoodies, jeans, chinos
      if (cat === 'T-Shirts') return 1.0;
      if (cat === 'Hoodies') return 1.0;
      if (cat === 'Jeans & Pants') return 0.95;
      if (cat === 'Shirts' && (name.includes('casual') || name.includes('checked') || name.includes('denim'))) return 0.9;
      if (cat === 'Dresses' && (name.includes('casual') || name.includes('midi'))) return 0.85;
      if (cat === 'Traditional Wear' && name.includes('sherwani')) return 0.1;
      return 0.5;

    case 'party':
      if (cat === 'Dresses' && (name.includes('evening') || name.includes('slip') || name.includes('satin'))) return 1.0;
      if (cat === 'Jackets' && name.includes('blazer')) return 0.95;
      if (cat === 'Shirts' && (name.includes('slim') || name.includes('dress'))) return 0.9;
      return 0.5;

    default:
      return 0.6;
  }
}

/**
 * Checks whether a product matches any of the requested colors.
 * @param {object} product 
 * @param {Array} colors 
 * @returns {boolean}
 */
function productMatchesColors(product, colors = []) {
  if (!colors || colors.length === 0) return true;

  const productColors = (product.availableColors || []).map((c) =>
    (typeof c === 'string' ? c : c.name || '').toLowerCase()
  );

  return colors.some((requestedColor) => {
    const synonyms = COLOR_SYNONYMS[requestedColor] || [requestedColor];
    return productColors.some((pc) =>
      synonyms.some((syn) => pc.includes(syn) || syn.includes(pc))
    );
  });
}

/**
 * Evaluates individual product match score against the parsed query.
 * @param {object} product 
 * @param {object} parsed 
 * @returns {object} { product, relevanceScore, isExact, isClose, isWeak }
 */
export function scoreProductForQuery(product, parsed) {
  const price = Number(product.basePrice || product.price || 0);
  const prodCat = normalizeCategory(product.category);
  const prodName = (product.name || '').toLowerCase();
  const prodDesc = (product.description || '').toLowerCase();

  // 1. Inherent Style Clash Check:
  // If user asked for wedding and item is hoodie/t-shirt, it is ALWAYS a weak/bad match!
  if (parsed.occasion === 'wedding' && (prodCat === 'Hoodies' || prodCat === 'T-Shirts')) {
    return {
      product,
      relevanceScore: 0.1,
      isExact: false,
      isClose: false,
      isWeak: true
    };
  }

  // 2. Budget constraint check
  let budgetScore = 1.0;
  let budgetSatisfied = true;
  if (parsed.budget !== null) {
    if (price <= parsed.budget) {
      budgetScore = 1.0;
    } else {
      budgetSatisfied = false;
      const overRatio = (price - parsed.budget) / parsed.budget;
      if (overRatio > 0.3) {
        budgetScore = 0.0;
      } else {
        budgetScore = Math.max(0, 1 - overRatio * 2);
      }
    }
  }

  // 3. Category match check
  let categoryScore = 0.5;
  let categorySatisfied = false;
  if (parsed.category) {
    if (prodCat === parsed.category) {
      categorySatisfied = true;
      categoryScore = 1.0;
      // Subcategory bonus (e.g. Oxford Formal Shirt for formal shirt)
      if (parsed.subcategory && prodName.includes(parsed.subcategory.toLowerCase())) {
        categoryScore = 1.1;
      }
    } else {
      categoryScore = 0.05; // Different category is penalized
    }
  } else if (parsed.occasion) {
    // If no category specified, occasion dictates suitability
    categoryScore = getOccasionSuitability(product, parsed.occasion);
    categorySatisfied = categoryScore >= 0.75;
  }

  // 4. Color match check
  let colorScore = 1.0;
  let colorSatisfied = true;
  if (parsed.colors && parsed.colors.length > 0) {
    const hasColor = productMatchesColors(product, parsed.colors);
    if (hasColor) {
      colorScore = 1.0;
    } else {
      colorSatisfied = false;
      colorScore = 0.2;
    }
  }

  // 5. Occasion & Style match
  const occasionScore = getOccasionSuitability(product, parsed.occasion);
  let styleScore = 0.8;
  if (parsed.style === 'formal') {
    if (prodName.includes('formal') || prodName.includes('blazer') || prodName.includes('dress shirt') || prodName.includes('oxford')) {
      styleScore = 1.1;
    } else if (prodCat === 'Hoodies' || prodCat === 'T-Shirts') {
      styleScore = 0.1;
    }
  } else if (parsed.style === 'comfortable') {
    if (prodCat === 'T-Shirts' || prodCat === 'Hoodies' || prodCat === 'Jeans & Pants') {
      styleScore = 1.0;
    }
  }

  // 6. Generic unmapped keyword check (e.g. 'swimming trunks', 'sunglasses')
  const stopWords = new Set(['i', 'want', 'a', 'an', 'the', 'for', 'to', 'in', 'at', 'with', 'under', 'below', 'less', 'than', 'me', 'please', 'show', 'find', 'need', 'looking', 'some', 'outfit', 'clothes', 'clothing', 'wear', 'items', 'and', 'or', 'of', 'is', 'are', 'my']);
  const significantTokens = parsed.tokens.filter((t) => !stopWords.has(t) && !/^\d+$/.test(t) && !/^[₹$]/.test(t));

  let keywordMatchScore = 1.0;
  if (!parsed.category && !parsed.occasion && !parsed.style && parsed.colors.length === 0) {
    if (significantTokens.length > 0) {
      const prodText = `${prodName} ${prodCat} ${prodDesc} ${(product.availableFabrics || []).map((f) => f.name).join(' ')}`.toLowerCase();
      const matchedCount = significantTokens.filter((t) => prodText.includes(t)).length;
      if (matchedCount === 0) {
        return {
          product,
          relevanceScore: 0.0,
          isExact: false,
          isClose: false,
          isWeak: true
        };
      }
      keywordMatchScore = matchedCount / significantTokens.length;
    }
  }

  // Composite weighted relevance score (0.0 to 1.0+)
  let compositeScore = 0;
  if (parsed.category) {
    compositeScore = (categoryScore * 0.45) + (colorScore * 0.20) + (budgetScore * 0.20) + (occasionScore * 0.15);
  } else if (parsed.occasion || parsed.style) {
    compositeScore = (occasionScore * 0.50) + (colorScore * 0.25) + (budgetScore * 0.25);
  } else {
    compositeScore = keywordMatchScore * 0.8 + (colorScore * 0.1) + (budgetScore * 0.1);
  }

  // Hard rules for Exact Match:
  // Must satisfy budget (if given), category (if given), color (if given), and have high occasion match
  const isExact =
    !parsed.hasStyleClash &&
    !parsed.budgetUnattainable &&
    budgetSatisfied &&
    (parsed.category ? categorySatisfied : true) &&
    (parsed.colors.length > 0 ? colorSatisfied : true) &&
    occasionScore >= 0.7 &&
    compositeScore >= 0.75;

  // Close Match rules:
  // Matches the main category or occasion, but misses 1 secondary requirement (e.g. price slightly over, or different color)
  const isClose =
    !isExact &&
    !parsed.hasStyleClash &&
    (categorySatisfied || occasionScore >= 0.8) &&
    compositeScore >= 0.40;

  const isWeak = !isExact && !isClose;

  return {
    product,
    relevanceScore: compositeScore,
    isExact,
    isClose,
    isWeak
  };
}

/**
 * Generates 3-5 smart, clickable alternative prompts strictly based on the customer request
 * and the existing FITFUSION catalog (Sections 23, 27, 28).
 * @param {object} parsed 
 * @param {Array} catalog 
 * @returns {Array<string>} 3-5 alternative prompts
 */
export function generateSuggestedPrompts(parsed, catalog = []) {
  const suggestions = [];

  // Case 1: Inherent Style Clash (e.g. "I want a green hoodie for a wedding")
  // Prompt requirement Section 23:
  // • "A dark blazer for a wedding"
  // • "A formal shirt for a wedding"
  // • "A traditional kurta for a wedding"
  // • "A smart casual jacket for a wedding"
  if (parsed.occasion === 'wedding' && (parsed.category === 'Hoodies' || parsed.category === 'T-Shirts' || parsed.hasStyleClash)) {
    return [
      'A dark blazer for a wedding',
      'A formal shirt for a wedding',
      'A traditional kurta for a wedding',
      'A smart casual jacket for a wedding'
    ];
  }

  // Case 2: Unattainable Budget for Formal Shirts (e.g. "Black formal shirt for office under ₹100")
  // Prompt requirement Section 27 Example 1:
  // • "Black formal shirt for office"
  // • "White formal shirt under ₹1500"
  // • "Navy blue shirt for office"
  // • "Classic shirt for work"
  if (parsed.category === 'Shirts' && (parsed.budgetUnattainable || (parsed.budget !== null && parsed.budget < 1000))) {
    return [
      'Black formal shirt for office',
      'White formal shirt under ₹1500',
      'Navy blue shirt for office',
      'Classic shirt for work'
    ];
  }

  // Case 3: Wedding Outfit (Section 27 Example 2)
  // • "Festive silk kurta for a wedding"
  // • "Traditional kurta pajama for a wedding"
  // • "Embroidered traditional outfit"
  // • "Formal ethnic outfit"
  if (parsed.occasion === 'wedding' && (parsed.category === 'Traditional Wear' || !parsed.category)) {
    return [
      'Festive silk kurta for a wedding',
      'Traditional kurta pajama for a wedding',
      'Embroidered traditional outfit',
      'Formal ethnic outfit',
      'A dark blazer for a wedding'
    ];
  }

  // Case 4: Comfortable Clothes for College (Section 27 Example 3)
  // • "Casual t-shirt for college"
  // • "Oversized t-shirt for college"
  // • "Comfortable hoodie for college"
  // • "Relaxed jeans for college"
  if (parsed.occasion === 'college' || parsed.style === 'comfortable') {
    return [
      'Casual t-shirt for college',
      'Oversized t-shirt for college',
      'Comfortable hoodie for college',
      'Relaxed jeans for college'
    ];
  }

  // Case 5: Traditional outfit for festival
  if (parsed.occasion === 'festival' || (parsed.category === 'Traditional Wear' && !parsed.budgetUnattainable)) {
    return [
      'Festive silk kurta for a wedding',
      'Traditional kurta pajama for a wedding',
      'Embroidered traditional outfit',
      'Formal ethnic outfit',
      'Classic cotton kurta for celebration'
    ];
  }

  // Case 6: Unattainable Budget for Dresses (e.g. "I want a red dress under ₹500")
  if (parsed.category === 'Dresses' && (parsed.budgetUnattainable || (parsed.budget !== null && parsed.budget < 1200))) {
    return [
      'A-Line casual dress under ₹1500',
      'Red or wine casual dress',
      'Floral midi dress for summer',
      'Satin evening dress',
      'Cotton midi dress under ₹1500'
    ];
  }

  // General fallback contextual prompts based on existing catalog categories
  if (parsed.category === 'Dresses') {
    return [
      'Floral wrap dress for an evening out',
      'Pure silk slip evening dress',
      'A-line casual dress under ₹1500',
      'Cotton midi dress for daytime'
    ];
  }

  if (parsed.category === 'Jackets') {
    return [
      'Classic tailored blazer for work',
      'Lightweight bomber jacket for casual wear',
      'Denim jacket for everyday style',
      'Double-breasted blazer for events'
    ];
  }

  if (parsed.category === 'Hoodies') {
    return [
      'Classic french terry hoodie',
      'Heavyweight fleece hoodie for winter',
      'Oversized pullover hoodie',
      'Minimal logo hoodie for casual wear'
    ];
  }

  // Default universal suggestions that exist in the FITFUSION catalog
  return [
    'A dark blazer for a wedding',
    'Black formal shirt for office',
    'Traditional kurta pajama for a wedding',
    'Comfortable hoodie for college'
  ];
}

/**
 * Selects actual products from the FITFUSION catalog to show as "Similar clothes you may like" (Section 24).
 * Never invents products. All items come from catalog.
 * @param {object} parsed 
 * @param {Array} catalog 
 * @returns {Array<object>} 3-6 actual catalog products
 */
export function getSimilarCatalogProducts(parsed, catalog = []) {
  if (!catalog || catalog.length === 0) return [];

  // Scenario A: Customer asked for wedding wear (e.g. green hoodie for a wedding or general wedding outfit)
  // Section 24: Show Blazer, Formal Shirt, Jacket, Kurta
  if (parsed.occasion === 'wedding' || parsed.hasStyleClash) {
    const candidates = [
      catalog.find((p) => p.name === 'Classic Tailored Blazer') || catalog.find((p) => (p.name || '').includes('Blazer')),
      catalog.find((p) => p.name === 'Oxford Formal Shirt') || catalog.find((p) => (p.name || '').includes('Formal Shirt')) || catalog.find((p) => (p.name || '').includes('Shirt') && normalizeCategory(p.category) === 'Shirts'),
      catalog.find((p) => p.name === 'Nehru Jacket') || catalog.find((p) => (p.name || '').includes('Jacket')),
      catalog.find((p) => p.name === 'Embroidered Kurta') || catalog.find((p) => (p.name || '').includes('Kurta')),
      catalog.find((p) => p.name === 'Traditional Sherwani')
    ].filter(Boolean);

    if (candidates.length >= 3) return candidates.slice(0, 4);
  }

  // Scenario B: Customer asked for a Shirt (e.g. black formal shirt under ₹100)
  // Show existing formal/semi-formal shirts
  if (parsed.category === 'Shirts') {
    const shirtCandidates = catalog.filter((p) => normalizeCategory(p.category) === 'Shirts');
    if (shirtCandidates.length > 0) {
      // Prioritize formal ones: Oxford Formal, Slim Fit Dress, Mandarin Collar, Classic Cotton
      const preferred = ['4', '6', 'shirt-7', 'shirt-1'];
      const sorted = [...shirtCandidates].sort((a, b) => {
        const aIndex = preferred.indexOf(a.id);
        const bIndex = preferred.indexOf(b.id);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return (a.basePrice || a.price) - (b.basePrice || b.price);
      });
      return sorted.slice(0, 4);
    }
  }

  // Scenario C: Customer asked for a Dress (e.g. red dress under ₹500)
  // Show existing dresses
  if (parsed.category === 'Dresses') {
    const dressCandidates = catalog.filter((p) => normalizeCategory(p.category) === 'Dresses');
    if (dressCandidates.length > 0) {
      const preferred = ['17', 'dress-2', 'dress-4', 'dress-3', '16', 'dress-6'];
      const sorted = [...dressCandidates].sort((a, b) => {
        const aIndex = preferred.indexOf(a.id);
        const bIndex = preferred.indexOf(b.id);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return (a.basePrice || a.price) - (b.basePrice || b.price);
      });
      return sorted.slice(0, 4);
    }
  }

  // Scenario D: Customer asked for Traditional Wear
  if (parsed.category === 'Traditional Wear' || parsed.occasion === 'festival') {
    const tradCandidates = catalog.filter((p) => normalizeCategory(p.category) === 'Traditional Wear');
    if (tradCandidates.length > 0) {
      return tradCandidates.slice(0, 4);
    }
  }

  // Scenario E: College / Casual
  if (parsed.occasion === 'college' || parsed.style === 'comfortable') {
    const candidates = [
      catalog.find((p) => p.category === 'T-Shirts' && p.badge === 'Featured'),
      catalog.find((p) => p.category === 'Hoodies'),
      catalog.find((p) => p.category === 'Jeans & Pants'),
      catalog.find((p) => p.category === 'T-Shirts' && p.badge === 'Recommended')
    ].filter(Boolean);
    if (candidates.length >= 3) return candidates;
  }

  // General fallback: return a balanced curated selection of 4 top products across categories
  const fallback = [
    catalog.find((p) => p.category === 'Jackets' && p.name.includes('Blazer')),
    catalog.find((p) => p.category === 'Shirts' && p.name.includes('Formal')),
    catalog.find((p) => p.category === 'Traditional Wear'),
    catalog.find((p) => p.category === 'Dresses')
  ].filter(Boolean);

  if (fallback.length >= 3) return fallback;
  return catalog.slice(0, 4);
}

/**
 * Main AI Style Search Entrypoint.
 * Evaluates the customer query against the full catalog.
 * Determines match level (EXACT_MATCH, CLOSE_MATCH, NO_MATCH) and provides smart alternatives.
 * 
 * @param {Array} products Full catalog
 * @param {string} query Natural language style query
 * @returns {object} Search result payload
 */
export function evaluateStyleSearch(products = [], query = '') {
  const trimmed = (query || '').trim();
  if (!trimmed) {
    return {
      isQueryEmpty: true,
      matchLevel: null,
      exactMatches: [],
      closeMatches: [],
      similarProducts: [],
      suggestedPrompts: [],
      parsedQuery: parseStyleQuery('')
    };
  }

  const parsedQuery = parseStyleQuery(trimmed);

  // Score all products
  const scoredProducts = products.map((product) => scoreProductForQuery(product, parsedQuery));

  const exactMatches = scoredProducts
    .filter((sp) => sp.isExact)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .map((sp) => sp.product);

  const closeMatches = scoredProducts
    .filter((sp) => sp.isClose)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .map((sp) => sp.product);

  // Determine overall Match Level according to Section 26:
  // - EXACT MATCH: The product satisfies the important requirements.
  // - CLOSE MATCH: The product matches the main category/occasion and some preferences but misses one or two requirements.
  // - NO GOOD MATCH: The product does not satisfy the important requirements.
  let matchLevel = MATCH_LEVELS.NO_MATCH;

  if (exactMatches.length > 0) {
    matchLevel = MATCH_LEVELS.EXACT_MATCH;
  } else if (closeMatches.length > 0 && !parsedQuery.hasStyleClash && !parsedQuery.budgetUnattainable) {
    matchLevel = MATCH_LEVELS.CLOSE_MATCH;
  } else {
    matchLevel = MATCH_LEVELS.NO_MATCH;
  }

  // Generate 3-5 smart suggested prompts based on the request and existing catalog
  const suggestedPrompts = generateSuggestedPrompts(parsedQuery, products);

  // Select similar clothes from existing catalog
  const similarProducts = getSimilarCatalogProducts(parsedQuery, products);

  return {
    isQueryEmpty: false,
    rawQuery: trimmed,
    parsedQuery,
    matchLevel,
    exactMatches,
    closeMatches,
    similarProducts,
    suggestedPrompts
  };
}
