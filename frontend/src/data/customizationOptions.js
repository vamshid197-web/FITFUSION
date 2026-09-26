/**
 * FitFusion Product-Specific Customization Options & Surcharge Rules (Phase 12 / Update)
 */

export const MONOGRAM_THREAD_COLORS = [
  { id: 'tone-on-tone', name: 'Tone-on-Tone Match', hex: '#6B7280' },
  { id: 'royal-gold', name: 'Royal Gold Silk', hex: '#F59E0B' },
  { id: 'silver-metallic', name: 'Silver Metallic', hex: '#E5E7EB' },
  { id: 'burgundy', name: 'Bordeaux Burgundy', hex: '#991B1B' },
  { id: 'navy', name: 'Atelier Midnight Navy', hex: '#1E3A8A' }
];

/**
 * 20 Comprehensive Clothing Fabrics with category compatibility & price adjustments
 */
export const MASTER_FABRICS = [
  {
    id: 'fab-cotton',
    name: 'Cotton',
    composition: '100% Breathable Long-Staple Cotton',
    description: 'Crisp, lightweight daily cotton with natural breathability and soft hand feel.',
    priceAdjustment: 0,
    compatibleCategories: ['Shirts', 'Formal Shirts', 'Casual Shirts', 'T-Shirts', 'Polo T-Shirts', 'Dresses', 'Kurtas', 'Hoodies', 'Sweatshirts', 'Chinos', 'Shorts', 'Tops'],
    badge: 'Classic'
  },
  {
    id: 'fab-premium-cotton',
    name: 'Premium Cotton',
    composition: '100% Egyptian Giza 120s Two-Ply Cotton',
    description: 'Silky, lustrous two-ply long-staple cotton offering an ultra-smooth drape and finish.',
    priceAdjustment: 150,
    compatibleCategories: ['Shirts', 'Formal Shirts', 'Casual Shirts', 'T-Shirts', 'Polo T-Shirts', 'Kurtas', 'Dresses'],
    badge: 'Luxury'
  },
  {
    id: 'fab-linen',
    name: 'Linen',
    composition: '100% Pure Normandy Flax Linen',
    description: 'Airy, textured natural flax with distinctive slubbing for cooling comfort.',
    priceAdjustment: 150,
    compatibleCategories: ['Shirts', 'Casual Shirts', 'Kurtas', 'Dresses', 'Trousers', 'Chinos', 'Shorts', 'Co-ord Sets'],
    badge: 'Breathable'
  },
  {
    id: 'fab-linen-blend',
    name: 'Linen Blend',
    composition: '55% Normandy Flax, 45% Combed Cotton',
    description: 'Combines the cooling texture of linen with the wrinkle-resistance of cotton.',
    priceAdjustment: 120,
    compatibleCategories: ['Shirts', 'Casual Shirts', 'Kurtas', 'Dresses', 'Trousers', 'Chinos', 'Co-ord Sets'],
    badge: 'Versatile'
  },
  {
    id: 'fab-denim',
    name: 'Denim',
    composition: '100% Durable Cotton Selvedge Denim 13.5oz',
    description: 'Rugged right-hand twill denim with rich indigo depth and classic character.',
    priceAdjustment: 180,
    compatibleCategories: ['Jeans', 'Jackets', 'Overshirts', 'Skirts', 'Shorts'],
    badge: 'Durable'
  },
  {
    id: 'fab-twill',
    name: 'Twill',
    composition: '100% Structured Chino Twill Weave',
    description: 'Distinctive diagonal weave offering great drape, durability, and wrinkle resistance.',
    priceAdjustment: 100,
    compatibleCategories: ['Jeans', 'Trousers', 'Chinos', 'Cargo Pants', 'Blazers', 'Jackets', 'Overshirts'],
    badge: 'Structured'
  },
  {
    id: 'fab-corduroy',
    name: 'Corduroy',
    composition: '100% Cotton 12-Wale Velveteen Cord',
    description: 'Textured ribbed ridges offering tactile warmth and vintage character.',
    priceAdjustment: 120,
    compatibleCategories: ['Jeans', 'Trousers', 'Jackets', 'Blazers', 'Overshirts'],
    badge: 'Textured'
  },
  {
    id: 'fab-velvet',
    name: 'Velvet',
    composition: '100% Plush Silk-Cotton Velvet Pile',
    description: 'Deep, rich pile reflecting light beautifully for blazers, party wear, and dresses.',
    priceAdjustment: 300,
    compatibleCategories: ['Blazers', 'Jackets', 'Party Wear', 'Dresses', 'Formal Wear'],
    badge: 'Royal'
  },
  {
    id: 'fab-wool',
    name: 'Wool',
    composition: '100% Virgin Tailoring Wool',
    description: 'Natural temperature-regulating wool with crisp drape for tailored outerwear.',
    priceAdjustment: 250,
    compatibleCategories: ['Blazers', 'Coats', 'Trousers', 'Sweaters', 'Formal Wear', 'Winter Wear'],
    badge: 'Warm'
  },
  {
    id: 'fab-merino-wool',
    name: 'Merino Wool',
    composition: '100% Extra-Fine Australian Merino Wool',
    description: 'Ultra-fine merino fibers that are exceptionally soft against the skin and non-itch.',
    priceAdjustment: 350,
    compatibleCategories: ['Sweaters', 'Blazers', 'Cardigans', 'Formal Wear', 'Winter Wear'],
    badge: 'Ultra Soft'
  },
  {
    id: 'fab-cashmere-blend',
    name: 'Cashmere Blend',
    composition: '70% Fine Wool, 30% Mongolian Cashmere',
    description: 'Supreme softness, featherlight warmth, and luxurious hand feel.',
    priceAdjustment: 450,
    compatibleCategories: ['Blazers', 'Coats', 'Sweaters', 'Formal Wear', 'Winter Wear'],
    badge: 'Ultra Luxury'
  },
  {
    id: 'fab-silk',
    name: 'Silk',
    composition: '100% Pure Mulberry Silk',
    description: 'Pure natural silk with a luminous pearlized luster and fluid hand feel.',
    priceAdjustment: 350,
    compatibleCategories: ['Shirts', 'Formal Shirts', 'Blouses', 'Dresses', 'Kurtas', 'Party Wear'],
    badge: 'Pure Silk'
  },
  {
    id: 'fab-satin',
    name: 'Satin',
    composition: '100% Smooth Lustrous Satin Weave',
    description: 'High-gloss front surface with silky smooth glide, ideal for evening wear.',
    priceAdjustment: 200,
    compatibleCategories: ['Blouses', 'Dresses', 'Tops', 'Party Wear', 'Co-ord Sets'],
    badge: 'Glossy'
  },
  {
    id: 'fab-rayon',
    name: 'Rayon',
    composition: '100% Breathable Eco Rayon',
    description: 'Fluid, soft fabric with breezy drape and vibrant color clarity.',
    priceAdjustment: 80,
    compatibleCategories: ['Tops', 'Dresses', 'Shirts', 'Casual Shirts', 'Kurtas', 'Jumpsuits'],
    badge: 'Fluid'
  },
  {
    id: 'fab-viscose',
    name: 'Viscose',
    composition: '100% Bamboo Viscose Weave',
    description: 'Lightweight and silky with high moisture absorption and a cool touch.',
    priceAdjustment: 100,
    compatibleCategories: ['Tops', 'Dresses', 'Kurtas', 'Shirts', 'Skirts'],
    badge: 'Cool Touch'
  },
  {
    id: 'fab-polyester',
    name: 'Polyester',
    composition: '100% High-Performance Micro-Poly',
    description: 'Durable, quick-drying athletic fabric with excellent shape retention.',
    priceAdjustment: 0,
    compatibleCategories: ['Sportswear', 'Track Pants', 'Sweatshirts', 'Hoodies', 'Jackets', 'Jumpsuits'],
    badge: 'Quick Dry'
  },
  {
    id: 'fab-fleece',
    name: 'Fleece',
    composition: '100% Thermal Brushed Cotton Fleece 360 GSM',
    description: 'Plush brushed fleece interior for superior winter warmth and cozy feel.',
    priceAdjustment: 120,
    compatibleCategories: ['Hoodies', 'Sweatshirts', 'Winter Wear', 'Jackets'],
    badge: 'Cozy'
  },
  {
    id: 'fab-french-terry',
    name: 'French Terry',
    composition: '100% Ring-Spun Cotton Loopback 320 GSM',
    description: 'Smooth exterior with absorbent loop pile inside for comfortable all-season wear.',
    priceAdjustment: 120,
    compatibleCategories: ['Hoodies', 'Sweatshirts', 'Track Pants', 'Shorts'],
    badge: 'All-Season'
  },
  {
    id: 'fab-jersey',
    name: 'Jersey',
    composition: '95% Combed Cotton, 5% Elastane Knit',
    description: 'Stretch-knit fabric that moves effortlessly with your body.',
    priceAdjustment: 60,
    compatibleCategories: ['T-Shirts', 'Polo T-Shirts', 'Tops', 'Dresses'],
    badge: 'Comfort Stretch'
  },
  {
    id: 'fab-khadi',
    name: 'Khadi',
    composition: '100% Handspun Organic Cotton Khadi',
    description: 'Handwoven artisanal textile, cool in summer and warm in winter.',
    priceAdjustment: 150,
    compatibleCategories: ['Kurtas', 'Kurta Sets', 'Shirts', 'Casual Shirts', 'Waistcoats', 'Ethnic Wear'],
    badge: 'Handcrafted'
  }
];

/**
 * Filter fabrics by product clothing category
 */
export function getFabricsForCategory(category = 'Shirts') {
  const cat = (category || 'Shirts').trim().toLowerCase();
  const matched = MASTER_FABRICS.filter((fab) =>
    fab.compatibleCategories.some((c) => {
      const target = c.toLowerCase();
      return cat.includes(target) || target.includes(cat);
    })
  );
  return matched.length > 0 ? matched : MASTER_FABRICS.slice(0, 10);
}

/**
 * 30 Professional Colorways with Hex codes & Swatch values
 */
export const MASTER_COLORS = [
  // Neutrals & Monochromes
  { id: 'col-black', name: 'Black', hex: '#111827', group: 'Neutrals' },
  { id: 'col-white', name: 'White', hex: '#FFFFFF', group: 'Neutrals' },
  { id: 'col-off-white', name: 'Off White', hex: '#F9FAFB', group: 'Neutrals' },
  { id: 'col-cream', name: 'Cream', hex: '#FFFBEB', group: 'Neutrals' },
  { id: 'col-beige', name: 'Beige', hex: '#F5F5DC', group: 'Neutrals' },
  { id: 'col-charcoal', name: 'Charcoal', hex: '#374151', group: 'Neutrals' },
  { id: 'col-grey', name: 'Grey', hex: '#6B7280', group: 'Neutrals' },
  { id: 'col-light-grey', name: 'Light Grey', hex: '#D1D5DB', group: 'Neutrals' },
  
  // Blues & Teals
  { id: 'col-navy', name: 'Navy', hex: '#1E3A8A', group: 'Blues' },
  { id: 'col-royal-blue', name: 'Royal Blue', hex: '#2563EB', group: 'Blues' },
  { id: 'col-sky-blue', name: 'Sky Blue', hex: '#38BDF8', group: 'Blues' },
  { id: 'col-baby-blue', name: 'Baby Blue', hex: '#BAE6FD', group: 'Blues' },
  { id: 'col-teal', name: 'Teal', hex: '#0D9488', group: 'Blues' },
  
  // Greens & Olives
  { id: 'col-olive', name: 'Olive', hex: '#65A30D', group: 'Greens' },
  { id: 'col-forest-green', name: 'Forest Green', hex: '#15803D', group: 'Greens' },
  { id: 'col-mint', name: 'Mint', hex: '#6EE7B7', group: 'Greens' },
  
  // Reds, Maroons & Purples
  { id: 'col-maroon', name: 'Maroon', hex: '#831843', group: 'Reds' },
  { id: 'col-burgundy', name: 'Burgundy', hex: '#881337', group: 'Reds' },
  { id: 'col-red', name: 'Red', hex: '#DC2626', group: 'Reds' },
  { id: 'col-wine', name: 'Wine', hex: '#701A75', group: 'Reds' },
  { id: 'col-pink', name: 'Pink', hex: '#F472B6', group: 'Warm' },
  { id: 'col-rose', name: 'Rose', hex: '#FB7185', group: 'Warm' },
  { id: 'col-lavender', name: 'Lavender', hex: '#C084FC', group: 'Warm' },
  { id: 'col-purple', name: 'Purple', hex: '#9333EA', group: 'Warm' },
  
  // Warm & Earthy
  { id: 'col-mustard', name: 'Mustard', hex: '#CA8A04', group: 'Earth' },
  { id: 'col-yellow', name: 'Yellow', hex: '#EAB308', group: 'Earth' },
  { id: 'col-orange', name: 'Orange', hex: '#EA580C', group: 'Earth' },
  { id: 'col-brown', name: 'Brown', hex: '#78350F', group: 'Earth' },
  { id: 'col-chocolate-brown', name: 'Chocolate Brown', hex: '#451A03', group: 'Earth' },
  { id: 'col-tan', name: 'Tan', hex: '#D2B48C', group: 'Earth' }
];

export function getAvailableColors() {
  return MASTER_COLORS;
}

/**
 * 18 Comprehensive Fictional Atelier Perfumes across 10 Fragrance Families + "No Perfume"
 */
export const MASTER_PERFUMES = [
  {
    id: 'no-perfume',
    name: 'No Fragrance / No Perfume',
    brand: 'FitFusion',
    fragranceFamily: 'Unscented',
    description: 'Unscented garment delivered purely fresh without added fragrance.',
    notes: ['Neutral', 'Crisp Clean Fabric'],
    price: 0,
    rating: 5.0,
    accentColor: '#9CA3AF',
    icon: '🚫',
    tags: ['All', 'none'],
    eligibleForFreeOffer: false
  },
  {
    id: 'p1',
    name: 'Bergamot & Sea Salt',
    brand: 'Atelier Riviera',
    fragranceFamily: 'Citrus',
    description: 'Crisp Italian bergamot infused with coastal sea breeze and sun-drenched neroli for a vibrant, uplifting trail.',
    notes: ['Calabrian Bergamot', 'Sea Salt', 'Neroli', 'White Cedar'],
    price: 38,
    rating: 4.8,
    accentColor: '#F59E0B',
    icon: '🍋',
    tags: ['Citrus', 'Daytime', 'Cotton', 'Linen', 'Shirts', 'T-Shirts'],
    eligibleForFreeOffer: true
  },
  {
    id: 'p2',
    name: 'Smoked Cedar & Vetiver',
    brand: "Maison d'Artisan",
    fragranceFamily: 'Woody',
    description: 'Deep Virginian cedarwood anchored by earthy bourbon vetiver and subtle cracked black pepper notes.',
    notes: ['Virginian Cedar', 'Bourbon Vetiver', 'Black Pepper', 'Nutmeg'],
    price: 45,
    rating: 4.9,
    accentColor: '#78350F',
    icon: '🪵',
    tags: ['Woody', 'Evening', 'Wool', 'Jackets', 'Shirts', 'Formal'],
    eligibleForFreeOffer: true
  },
  {
    id: 'p3',
    name: 'White Jasmine & Cashmere',
    brand: "L'Ombre Studio",
    fragranceFamily: 'Floral',
    description: 'Night-blooming Madagascan jasmine layered over velvety cashmere musk and luminous amber nectar.',
    notes: ['Star Jasmine', 'Cashmere Wood', 'White Musk', 'Orchid'],
    price: 42,
    rating: 4.7,
    accentColor: '#EC4899',
    icon: '🌸',
    tags: ['Floral', 'Dresses', 'Silk', 'Traditional Wear', 'Evening'],
    eligibleForFreeOffer: true
  },
  {
    id: 'p4',
    name: 'Cardamom & Spiced Amber',
    brand: 'Heritage Parfums',
    fragranceFamily: 'Amber',
    description: 'Warm green cardamom pods steeped in rich golden amber resin, Ceylon cinnamon, and Madagascar vanilla.',
    notes: ['Green Cardamom', 'Golden Amber', 'Ceylon Cinnamon', 'Vanilla Pod'],
    price: 50,
    rating: 4.9,
    accentColor: '#D97706',
    icon: '✨',
    tags: ['Amber', 'Evening', 'Jackets', 'Traditional Wear', 'Autumn'],
    eligibleForFreeOffer: true
  },
  {
    id: 'p5',
    name: 'Alpine Mist & Juniper',
    brand: 'Nordic Atelier',
    fragranceFamily: 'Fresh',
    description: 'Invigorating glacial water accord with crushed wild juniper berries, mint leaf, and sheer white birch.',
    notes: ['Glacial Mist', 'Juniper Berry', 'Crushed Mint', 'White Birch'],
    price: 36,
    rating: 4.6,
    accentColor: '#0284C7',
    icon: '🌿',
    tags: ['Fresh', 'Casual', 'Daytime', 'T-Shirts', 'Hoodies', 'Jeans/Pants'],
    eligibleForFreeOffer: true
  },
  {
    id: 'p6',
    name: 'Royal Oud & Dark Leather',
    brand: 'Heritage Parfums',
    fragranceFamily: 'Woody',
    description: 'Opulent aged Cambodian agarwood softened by hand-buffed saddle leather notes and dark tonka bean.',
    notes: ['Cambodian Oud', 'Saddle Leather', 'Dark Tonka', 'Smoked Birch'],
    price: 60,
    rating: 5.0,
    accentColor: '#171717',
    icon: '👑',
    tags: ['Woody', 'Oriental', 'Evening', 'Jackets', 'Traditional Wear', 'Luxury'],
    eligibleForFreeOffer: true
  },
  {
    id: 'p7',
    name: 'Azure Coast & Marine Drift',
    brand: 'Isle & Shore',
    fragranceFamily: 'Aquatic',
    description: 'Salty ocean spray blended with sun-bleached driftwood, blue algae, and mineral ambergris.',
    notes: ['Marine Spray', 'Driftwood', 'Blue Algae', 'Mineral Ambergris'],
    price: 40,
    rating: 4.8,
    accentColor: '#0EA5E9',
    icon: '🌊',
    tags: ['Aquatic', 'Fresh', 'Shirts', 'T-Shirts', 'Linen'],
    eligibleForFreeOffer: true
  },
  {
    id: 'p8',
    name: 'Velvet Rose & Black Plum',
    brand: 'Botanica Essences',
    fragranceFamily: 'Floral',
    description: 'Damascus rose petals swirled with dark black plum liqueur, earthy patchouli, and bourbon vanilla.',
    notes: ['Damascus Rose', 'Black Plum', 'Patchouli', 'Bourbon Vanilla'],
    price: 48,
    rating: 4.7,
    accentColor: '#BE123C',
    icon: '🌹',
    tags: ['Floral', 'Dresses', 'Silk', 'Evening', 'Traditional Wear'],
    eligibleForFreeOffer: true
  },
  {
    id: 'p9',
    name: 'Pure Silver Musk',
    brand: 'Atelier Riviera',
    fragranceFamily: 'Musk',
    description: 'Clean ethereal white musk accented by crystal aldehydes, powdery iris root, and warm sheer cedar.',
    notes: ['Crystal Aldehydes', 'Iris Root', 'White Musk', 'Sheer Cedar'],
    price: 44,
    rating: 4.9,
    accentColor: '#6B7280',
    icon: '🕊️',
    tags: ['Musk', 'Fresh', 'All', 'Shirts', 'Everyday'],
    eligibleForFreeOffer: true
  },
  {
    id: 'p10',
    name: 'Saffron Thread & Bourbon Spice',
    brand: "Maison d'Artisan",
    fragranceFamily: 'Spicy',
    description: 'Kashmiri saffron threads toasted with nutmeg, aged oak cask bourbon, and dark clove buds.',
    notes: ['Kashmiri Saffron', 'Bourbon Oak', 'Clove Bud', 'Nutmeg'],
    price: 54,
    rating: 4.8,
    accentColor: '#B45309',
    icon: '🌶️',
    tags: ['Spicy', 'Evening', 'Traditional Wear', 'Jackets'],
    eligibleForFreeOffer: true
  },
  {
    id: 'p11',
    name: 'Silk Road Myrrh & Frankincense',
    brand: 'Heritage Parfums',
    fragranceFamily: 'Oriental',
    description: 'Sacred Omani frankincense tears intertwined with sweet myrrh resin and smoky golden benzoin.',
    notes: ['Omani Frankincense', 'Sweet Myrrh', 'Golden Benzoin', 'Labdanum'],
    price: 56,
    rating: 4.9,
    accentColor: '#92400E',
    icon: '🏺',
    tags: ['Oriental', 'Amber', 'Jackets', 'Traditional Wear'],
    eligibleForFreeOffer: true
  },
  {
    id: 'p12',
    name: 'Crushed Fig Leaf & Bamboo',
    brand: 'Botanica Essences',
    fragranceFamily: 'Green',
    description: 'Crisp green fig leaves snapped over fresh bamboo stalks, galbanum, and morning dew drops.',
    notes: ['Wild Fig Leaf', 'Green Bamboo', 'Galbanum', 'Morning Dew'],
    price: 38,
    rating: 4.7,
    accentColor: '#16A34A',
    icon: '🍃',
    tags: ['Green', 'Fresh', 'Daytime', 'Shirts', 'T-Shirts', 'Linen'],
    eligibleForFreeOffer: true
  },
  {
    id: 'p13',
    name: 'Zesty Grapefruit & Pink Pepper',
    brand: 'Atelier Riviera',
    fragranceFamily: 'Citrus',
    description: 'Sparkling ruby pink grapefruit energized with crushed pink peppercorn, fresh ginger, and vetiver.',
    notes: ['Pink Grapefruit', 'Pink Peppercorn', 'Fresh Ginger', 'Haitian Vetiver'],
    price: 39,
    rating: 4.8,
    accentColor: '#FB923C',
    icon: '🍊',
    tags: ['Citrus', 'Daytime', 'T-Shirts', 'Shirts', 'Cotton'],
    eligibleForFreeOffer: true
  },
  {
    id: 'p14',
    name: 'Ocean Kelp & Coastal Cypress',
    brand: 'Isle & Shore',
    fragranceFamily: 'Aquatic',
    description: 'Brisk coastal wind rustling Mediterranean cypress branches over salty tidal pools and wet rocks.',
    notes: ['Coastal Cypress', 'Ocean Kelp', 'Sea Moss', 'Salted Slate'],
    price: 42,
    rating: 4.6,
    accentColor: '#0284C7',
    icon: '🌊',
    tags: ['Aquatic', 'Fresh', 'Hoodies', 'Jeans/Pants'],
    eligibleForFreeOffer: true
  },
  {
    id: 'p15',
    name: 'Sandalwood Sanctum',
    brand: 'Heritage Parfums',
    fragranceFamily: 'Woody',
    description: 'Creamy Mysore sandalwood bathed in warm cardamom milk, cedar shavings, and soothing amber.',
    notes: ['Mysore Sandalwood', 'Cardamom Milk', 'Atlas Cedar', 'White Amber'],
    price: 52,
    rating: 5.0,
    accentColor: '#78350F',
    icon: '🪵',
    tags: ['Woody', 'Traditional Wear', 'Shirts', 'Jackets'],
    eligibleForFreeOffer: true
  },
  {
    id: 'p16',
    name: 'Midnight Amber & Tonka',
    brand: "L'Ombre Studio",
    fragranceFamily: 'Amber',
    description: 'Sensual amber nectar steeped with toasted Brazilian tonka bean, dark cocoa, and smoky vanilla.',
    notes: ['Rich Amber', 'Tonka Bean', 'Smoky Vanilla', 'Dark Cocoa'],
    price: 46,
    rating: 4.9,
    accentColor: '#831843',
    icon: '🌙',
    tags: ['Amber', 'Evening', 'Jackets', 'Dresses'],
    eligibleForFreeOffer: true
  },
  {
    id: 'p17',
    name: 'Moroccan Neroli & Basil',
    brand: 'Botanica Essences',
    fragranceFamily: 'Fresh',
    description: 'Sunny orange blossoms balanced with sweet Italian basil leaves, petitgrain, and sheer white woods.',
    notes: ['Orange Blossom', 'Sweet Basil', 'Petitgrain', 'White Woods'],
    price: 37,
    rating: 4.7,
    accentColor: '#10B981',
    icon: '🌿',
    tags: ['Fresh', 'Citrus', 'Shirts', 'Dresses', 'Cotton'],
    eligibleForFreeOffer: true
  }
];

export const PERFUME_OPTIONS = MASTER_PERFUMES;

/**
 * Category-Specific Tailoring Measurement Field Definitions (PART 5)
 */
export const CATEGORY_MEASUREMENT_FIELDS = {
  'Shirts': [
    { key: 'chest', label: 'Chest Width', guide: 'Fullest part of chest level under armpits.', placeholder: '40.0', required: true },
    { key: 'waist', label: 'Waist Line', guide: 'Around natural waistline above hip bone.', placeholder: '34.0', required: true },
    { key: 'shoulder', label: 'Shoulder Span', guide: 'Across back from shoulder bone to shoulder bone.', placeholder: '18.0', required: true },
    { key: 'sleeve', label: 'Sleeve Length', guide: 'From shoulder seam along elbow to wrist.', placeholder: '25.5', required: true },
    { key: 'length', label: 'Shirt Length', guide: 'From neck base seam straight to desired hem.', placeholder: '30.0', required: true },
    { key: 'neck', label: 'Neck Circumference', guide: 'Around base of neck where collar rests.', placeholder: '15.5', required: true }
  ],
  'T-Shirts': [
    { key: 'chest', label: 'Chest Width', guide: 'Fullest part of chest level under armpits.', placeholder: '40.0', required: true },
    { key: 'waist', label: 'Waist Line', guide: 'Around natural waistline above hip bone.', placeholder: '34.0', required: false },
    { key: 'shoulder', label: 'Shoulder Span', guide: 'Across back from shoulder bone to shoulder bone.', placeholder: '18.0', required: true },
    { key: 'sleeve', label: 'Sleeve Length', guide: 'From shoulder seam along bicep to sleeve edge.', placeholder: '9.0', required: true },
    { key: 'length', label: 'Shirt Length', guide: 'From neck base seam straight down to bottom hem.', placeholder: '28.5', required: true }
  ],
  'Jeans/Pants': [
    { key: 'waist', label: 'Waist Line', guide: 'Where trousers or belt naturally sit.', placeholder: '32.0', required: true },
    { key: 'hip', label: 'Hip Circumference', guide: 'Fullest point around buttocks and hip.', placeholder: '40.0', required: true },
    { key: 'inseam', label: 'Inseam Length', guide: 'From crotch seam straight down inside leg to shoe break.', placeholder: '32.0', required: true },
    { key: 'outseam', label: 'Outseam Length', guide: 'From waistband top down outer leg seam to hem.', placeholder: '41.0', required: true },
    { key: 'thigh', label: 'Thigh Width', guide: 'Around fullest part of upper thigh 1 inch below crotch.', placeholder: '23.0', required: false }
  ],
  'Jackets': [
    { key: 'chest', label: 'Chest Width', guide: 'Fullest chest point while wearing a base shirt.', placeholder: '42.0', required: true },
    { key: 'waist', label: 'Waist Line', guide: 'Around jacket buttoning stance point.', placeholder: '36.0', required: true },
    { key: 'shoulder', label: 'Shoulder Span', guide: 'From outer left pad to outer right pad seam.', placeholder: '18.5', required: true },
    { key: 'sleeve', label: 'Sleeve Length', guide: 'From shoulder head down to break of wrist bone.', placeholder: '26.0', required: true },
    { key: 'length', label: 'Jacket Length', guide: 'From below collar down to bottom curve of seat.', placeholder: '30.5', required: true }
  ],
  'Dresses': [
    { key: 'chest', label: 'Bust / Chest', guide: 'Around fullest point of bust level across back.', placeholder: '36.0', required: true },
    { key: 'waist', label: 'Natural Waist', guide: 'Narrowest part of torso between ribs and hips.', placeholder: '28.0', required: true },
    { key: 'hip', label: 'Hip Width', guide: 'Fullest part around hips and seat.', placeholder: '38.0', required: true },
    { key: 'shoulder', label: 'Shoulder Span', guide: 'Across back shoulder point to shoulder point.', placeholder: '15.5', required: false },
    { key: 'length', label: 'Dress Length', guide: 'From high shoulder point down to desired hemline.', placeholder: '42.0', required: true }
  ],
  'Traditional Wear': [
    { key: 'chest', label: 'Chest Width', guide: 'Under armpits around fullest chest point.', placeholder: '40.0', required: true },
    { key: 'waist', label: 'Waist Line', guide: 'Around natural torso waistline.', placeholder: '34.0', required: true },
    { key: 'shoulder', label: 'Shoulder Span', guide: 'Across back bone to bone.', placeholder: '18.0', required: true },
    { key: 'sleeve', label: 'Sleeve Length', guide: 'From shoulder head to wrist.', placeholder: '25.0', required: true },
    { key: 'length', label: 'Kurta Length', guide: 'From shoulder base straight to knee or desired hem.', placeholder: '40.0', required: true },
    { key: 'neck', label: 'Neck Band', guide: 'Base of neck circumference for bandhgala / mandarin collar.', placeholder: '16.0', required: false }
  ],
  'Hoodies': [
    { key: 'chest', label: 'Chest Width', guide: 'Comfortable relaxed chest width under armpits.', placeholder: '44.0', required: true },
    { key: 'shoulder', label: 'Shoulder Span', guide: 'Drop-shoulder or regular shoulder span.', placeholder: '20.0', required: true },
    { key: 'sleeve', label: 'Sleeve Length', guide: 'Shoulder point to ribbed wrist cuff.', placeholder: '26.0', required: true },
    { key: 'length', label: 'Hoodie Length', guide: 'From shoulder seam down to ribbed waistband.', placeholder: '29.0', required: true }
  ]
};

export function getMeasurementFieldsForCategory(category = 'Shirts') {
  const cat = (category || 'Shirts').trim();
  if (CATEGORY_MEASUREMENT_FIELDS[cat]) return CATEGORY_MEASUREMENT_FIELDS[cat];
  for (const key of Object.keys(CATEGORY_MEASUREMENT_FIELDS)) {
    if (cat.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(cat.toLowerCase())) {
      return CATEGORY_MEASUREMENT_FIELDS[key];
    }
  }
  return CATEGORY_MEASUREMENT_FIELDS['Shirts'];
}

export const MEASUREMENT_GUIDE_DATA = {
  neck: {
    title: 'Neck Circumference',
    instruction: 'Wrap the measuring tape around the base of your neck where your shirt collar would normally sit. Keep one finger between your neck and the tape for a comfortable fit.'
  },
  chest: {
    title: 'Chest Width',
    instruction: 'Stand relaxed. Wrap the tape around the fullest part of your chest, keeping it level under your armpits and across your shoulder blades.'
  },
  waist: {
    title: 'Natural Waistline',
    instruction: 'Measure around your natural waistline, usually located an inch above your belly button or where your trousers naturally sit. Do not suck in your stomach.'
  },
  shoulder: {
    title: 'Shoulder Span',
    instruction: 'Measure across the back from the edge of the left shoulder bone horizontally across the curve of the spine to the edge of the right shoulder bone.'
  },
  sleeve: {
    title: 'Sleeve Length',
    instruction: 'With your arm slightly bent at a 90-degree angle and hand on your hip, measure from the outer shoulder seam along the elbow down to your wrist bone.'
  },
  length: {
    title: 'Garment Length',
    instruction: 'Measure straight down from the base of the collar seam at the neck down the spine to where you want the hem of the garment to end.'
  },
  hip: {
    title: 'Hip Circumference',
    instruction: 'Stand with feet together. Wrap the measuring tape around the fullest part of your hips and seat, keeping the tape parallel to the floor.'
  },
  inseam: {
    title: 'Trouser Inseam',
    instruction: 'Measure from the lowest point of the crotch seam straight down the inside seam of your leg to the desired hem level or shoe top.'
  },
  outseam: {
    title: 'Trouser Outseam',
    instruction: 'Measure along the outer side seam from the top of the waistband down to the bottom hem where you want your pants to rest.'
  },
  thigh: {
    title: 'Thigh Circumference',
    instruction: 'Wrap the measuring tape around the fullest part of your upper thigh, approximately 1 inch below the crotch seam.'
  }
};

/**
 * Returns dynamic styling sections based on product category
 */
export function getProductDesignOptions(category = 'Shirts') {
  const cat = (category || 'Shirts').toLowerCase();

  // T-SHIRTS & POLOS
  if (cat.includes('t-shirt') || cat.includes('tee') || cat.includes('polo')) {
    return {
      type: 'tshirt',
      section1Title: 'Neckline Style',
      section1Key: 'collar',
      section1Options: [
        { id: 'Crew Neck', title: 'Ribbed Crew Neck', desc: 'Classic comfortable round neck with ribbed binding.', surcharge: 0 },
        { id: 'V-Neck', title: 'Casual V-Neck', desc: 'Modern European shallow V-neck.', surcharge: 0 },
        { id: 'Henley Placket', title: '3-Button Henley Collar', desc: 'Woven front placket with 3 buttons.', surcharge: 80 },
        { id: 'Polo Collar', title: 'Classic Polo Collar', desc: 'Structured knit collar with button placket.', surcharge: 100 }
      ],
      section2Title: 'Sleeve Finish',
      section2Key: 'cuff',
      section2Options: [
        { id: 'Clean Hem', title: 'Standard Open Hem', desc: 'Clean open sleeve hemline for relaxed movement.', surcharge: 0 },
        { id: 'Ribbed Cuff', title: 'Ribbed Knit Cuff', desc: 'Tapered ribbed cuff hugging the arm snugly.', surcharge: 50 },
        { id: 'Rolled Cuff', title: 'Tacked Rolled Edge', desc: 'Permanent double-fold cuff for casual style.', surcharge: 50 }
      ],
      section3Title: 'Stitching & Trim',
      section3Key: 'buttons',
      section3Options: [
        { id: 'Tonal Stitch', title: 'Matching Thread Stitch', desc: 'Clean color-matched thread for a seamless look.', color: '#4B5563', surcharge: 0 },
        { id: 'Contrast Gold', title: 'Contrast Topstitch', desc: 'Decorative topstitching along shoulders and hem.', color: '#F59E0B', surcharge: 50 },
        { id: 'Reinforced', title: 'Reinforced Seams', desc: 'Extra durable twin-needle reinforced seams.', color: '#18181B', surcharge: 40 }
      ],
      monogramPositions: ['Left Chest', 'Right Sleeve Hem', 'Back Neck Yoke']
    };
  }

  // HOODIES & SWEATSHIRTS
  if (cat.includes('hoodie') || cat.includes('sweatshirt')) {
    return {
      type: 'hoodie',
      section1Title: 'Hood Style',
      section1Key: 'collar',
      section1Options: [
        { id: 'Double Hood', title: 'Double-Lined Hood', desc: 'Heavyweight crossover hood with full inner lining.', surcharge: 0 },
        { id: 'Zip Crossover', title: 'Quarter-Zip Collar', desc: 'Tall funnel neck with concealed metal zip.', surcharge: 120 },
        { id: 'Crew Collar', title: 'Ribbed Crewneck', desc: 'Classic athletic crew neckline without hood.', surcharge: 0 }
      ],
      section2Title: 'Front Pockets',
      section2Key: 'cuff',
      section2Options: [
        { id: 'Kangaroo Pocket', title: 'Kangaroo Pouch', desc: 'Deep front pass-through hand pocket.', surcharge: 0 },
        { id: 'Concealed Side', title: 'Side Zip Pockets', desc: 'Discreet zip pockets built into side seams.', surcharge: 80 },
        { id: 'Clean Plain', title: 'No Pockets (Clean Front)', desc: 'Smooth seamless front panel without pockets.', surcharge: 0 }
      ],
      section3Title: 'Drawstrings & Tips',
      section3Key: 'buttons',
      section3Options: [
        { id: 'Braided Metal', title: 'Braided Cord with Metal Tips', desc: 'Heavy flat-braided cotton cord with metal aglets.', color: '#B45309', surcharge: 50 },
        { id: 'Matte Black', title: 'Matte Black Dipped Tips', desc: 'Clean dipped silicone cord tips.', color: '#18181B', surcharge: 40 },
        { id: 'Clean Cordless', title: 'No Drawstring', desc: 'Streamlined clean finish without cords.', color: '#4B5563', surcharge: 0 }
      ],
      monogramPositions: ['Left Chest', 'Pocket Flap', 'Wrist Cuff']
    };
  }

  // JEANS & PANTS
  if (cat.includes('jeans') || cat.includes('pant') || cat.includes('trouser') || cat.includes('chino')) {
    return {
      type: 'pants',
      section1Title: 'Waistband Style',
      section1Key: 'collar',
      section1Options: [
        { id: 'Belt Loops', title: 'Standard Belt Loops', desc: 'Reinforced sturdy loops for standard belts.', surcharge: 0 },
        { id: 'Side Buckle', title: 'Side Buckle Adjusters', desc: 'Clean side buckle adjusters to wear without belt.', surcharge: 100 },
        { id: 'Drawstring Hybrid', title: 'Elastic Drawstring Waist', desc: 'Comfortable stretch waistband with inner tie.', surcharge: 80 }
      ],
      section2Title: 'Pocket Styling',
      section2Key: 'cuff',
      section2Options: [
        { id: 'Western 5-Pocket', title: 'Classic 5-Pocket Design', desc: 'Curved front scoop pockets with coin pocket and back patches.', surcharge: 0 },
        { id: 'Slanted Chino', title: 'Slanted Side Pockets', desc: 'Angled side entry pockets with buttoned rear welts.', surcharge: 0 },
        { id: 'Besom Dress Pocket', title: 'Discreet Slit Pockets', desc: 'Formal dress trousers with clean side seam insertion.', surcharge: 60 }
      ],
      section3Title: 'Wash & Hem Style',
      section3Key: 'buttons',
      section3Options: [
        { id: 'Straight Hem', title: 'Classic Straight Hem', desc: 'Clean standard finish at your chosen inseam.', color: '#4B5563', surcharge: 0 },
        { id: 'Vintage Wash', title: 'Vintage Soft Wash Hem', desc: 'Light distressing and faded hem detailing.', color: '#1F2937', surcharge: 80 },
        { id: 'Tapered Ankle', title: 'Tapered Ankle Cut', desc: 'Narrowed bottom opening resting cleanly on shoes.', color: '#78350F', surcharge: 0 }
      ],
      monogramPositions: ['Waistband Inner', 'Back Pocket Welt', 'Front Pocket Edge']
    };
  }

  // BLAZERS & JACKETS
  if (cat.includes('jacket') || cat.includes('blazer') || cat.includes('coat') || cat.includes('suit')) {
    return {
      type: 'jacket',
      section1Title: 'Lapel Style',
      section1Key: 'collar',
      section1Options: [
        { id: 'Notch Lapel', title: 'Classic Notch Lapel', desc: 'Standard versatile lapel suitable for business and casual.', surcharge: 0 },
        { id: 'Peak Lapel', title: 'Pointed Peak Lapel', desc: 'Broad pointed upward lapel for a sharper formal look.', surcharge: 120 },
        { id: 'Shawl Collar', title: 'Curved Shawl Collar', desc: 'Smooth continuous rounded lapel for evening events.', surcharge: 150 }
      ],
      section2Title: 'Pockets & Lining',
      section2Key: 'cuff',
      section2Options: [
        { id: 'Flap Pockets', title: 'Classic Flap Pockets', desc: 'Standard tailored pockets with fold-down flaps.', surcharge: 0 },
        { id: 'Patch Pockets', title: 'Casual Patch Pockets', desc: 'Top-stitched exterior pockets for a relaxed modern look.', surcharge: 0 },
        { id: 'Silk Lined', title: 'Premium Full Silk Lining', desc: 'Breathable smooth interior lining for easy slip-on comfort.', surcharge: 150 }
      ],
      section3Title: 'Buttons & Closure',
      section3Key: 'buttons',
      section3Options: [
        { id: 'Horn 2-Button', title: '2-Button Dark Horn', desc: 'Natural genuine horn buttons with dual back vents.', color: '#4B5563', surcharge: 80 },
        { id: 'Antique Brass', title: 'Antique Brass Crest Buttons', desc: 'Engraved metallic buttons for a classic look.', color: '#B45309', surcharge: 120 },
        { id: 'Matte Black', title: 'Matte Black Buttons', desc: 'Clean modern dark buttons with single center vent.', color: '#18181B', surcharge: 0 }
      ],
      monogramPositions: ['Inside Chest Pocket', 'Under Collar', 'Left Sleeve Cuff']
    };
  }

  // DRESSES
  if (cat.includes('dress') || cat.includes('skirt') || cat.includes('jumpsuit') || cat.includes('top')) {
    return {
      type: 'dress',
      section1Title: 'Neckline Style',
      section1Key: 'collar',
      section1Options: [
        { id: 'V-Neck', title: 'Graceful V-Neck', desc: 'Flattering open V-neckline cut.', surcharge: 0 },
        { id: 'Round Neck', title: 'Classic Round Neck', desc: 'Soft modest rounded neckline.', surcharge: 0 },
        { id: 'Square Neck', title: 'Modern Square Neckline', desc: 'Architectural horizontal collarbone frame.', surcharge: 60 },
        { id: 'Sweetheart', title: 'Sweetheart Neckline', desc: 'Curved sweetheart shape with gentle drape.', surcharge: 80 }
      ],
      section2Title: 'Sleeve Length',
      section2Key: 'cuff',
      section2Options: [
        { id: 'Sleeveless', title: 'Sleeveless', desc: 'Clean armholes with soft inner binding.', surcharge: 0 },
        { id: 'Cap Sleeve', title: 'Short Cap Sleeves', desc: 'Gentle shoulder-covering short cap sleeve.', surcharge: 40 },
        { id: '3/4 Sleeve', title: 'Three-Quarter Sleeves', desc: 'Elegant sleeve ending midway down forearm.', surcharge: 50 },
        { id: 'Full Sleeve', title: 'Full Long Sleeves', desc: 'Full length sleeve with delicate cuff.', surcharge: 80 }
      ],
      section3Title: 'Length & Hem',
      section3Key: 'buttons',
      section3Options: [
        { id: 'Midi Length', title: 'Midi Length (Calf)', desc: 'Versatile length falling just below the knee.', color: '#4B5563', surcharge: 0 },
        { id: 'Maxi Length', title: 'Maxi Length (Ankle)', desc: 'Flowing full length dress brushing the ankles.', color: '#1F2937', surcharge: 100 },
        { id: 'Knee Length', title: 'Above-the-Knee Length', desc: 'Casual daytime length resting at the top of the knee.', color: '#78350F', surcharge: 0 }
      ],
      monogramPositions: ['Inside Hemline', 'Waist Tag', 'Cuff']
    };
  }

  // KURTAS & TRADITIONAL
  if (cat.includes('kurta') || cat.includes('ethnic') || cat.includes('waistcoat')) {
    return {
      type: 'kurta',
      section1Title: 'Collar Style',
      section1Key: 'collar',
      section1Options: [
        { id: 'Mandarin Collar', title: 'Mandarin Stand Collar', desc: 'Classic 1.25" stand-up collar with rounded edges.', surcharge: 0 },
        { id: 'Nehru Band', title: 'Nehru Bandhgala Collar', desc: 'Formal high band with secure hook-and-eye closure.', surcharge: 0 },
        { id: 'Round Notch', title: 'Round Neck with V-Notch', desc: 'Comfortable collarless neckline with a gentle front slit.', surcharge: 0 }
      ],
      section2Title: 'Sleeve Styling',
      section2Key: 'cuff',
      section2Options: [
        { id: 'Full Sleeve', title: 'Full Length Straight Sleeve', desc: 'Traditional straight sleeve hem.', surcharge: 0 },
        { id: 'Roll-up Tab', title: 'Roll-up Tab Sleeves', desc: 'Includes buttoned fabric tab to hold rolled sleeves neatly.', surcharge: 60 },
        { id: 'Cuffed Sleeve', title: 'Buttoned Cuffed Sleeve', desc: 'Shirt-style single button cuff at wrist.', surcharge: 50 }
      ],
      section3Title: 'Buttons & Placket',
      section3Key: 'buttons',
      section3Options: [
        { id: 'Potli Buttons', title: 'Handmade Fabric Buttons', desc: 'Matching hand-tied fabric potli buttons.', color: '#D97706', surcharge: 60 },
        { id: 'Metallic Studs', title: 'Antique Metal Studs', desc: 'Removable metallic stud buttons with brass patina.', color: '#B45309', surcharge: 100 },
        { id: 'Concealed Placket', title: 'Hidden Button Placket', desc: 'Clean front with hidden fastener strip.', color: '#4B5563', surcharge: 0 }
      ],
      monogramPositions: ['Left Chest', 'Right Cuff', 'Side Slit']
    };
  }

  // SHIRTS (Formal & Casual)
  return {
    type: 'shirt',
    section1Title: 'Collar Style',
    section1Key: 'collar',
    section1Options: [
      { id: 'Classic', title: 'Classic Point Collar', desc: 'Timeless standard collar for casual or tie wear.', surcharge: 0 },
      { id: 'Spread', title: 'Wide Spread Collar', desc: 'Wider collar points creating an open, modern look.', surcharge: 0 },
      { id: 'Mandarin', title: 'Mandarin Stand Collar', desc: 'Clean minimalist stand collar without fold.', surcharge: 0 },
      { id: 'Button Down', title: 'Button-Down Collar', desc: 'Collars with small corner buttons for a crisp casual look.', surcharge: 0 }
    ],
    section2Title: 'Cuff Style',
    section2Key: 'cuff',
    section2Options: [
      { id: 'Standard', title: 'Single Button Barrel Cuff', desc: 'Standard comfortable daily wrist cuff.', surcharge: 0 },
      { id: 'French', title: 'Double French Cuff', desc: 'Fold-back cuff made for wearing with cufflinks.', surcharge: 100 },
      { id: 'Rounded', title: 'Rounded Contour Cuff', desc: 'Gently curved cuff corners for a softer touch.', surcharge: 0 }
    ],
    section3Title: 'Buttons',
    section3Key: 'buttons',
    section3Options: [
      { id: 'Standard Horn', title: 'Standard Neutral Buttons', desc: 'Durable polished buttons in matching neutral tone.', color: '#4B5563', surcharge: 0 },
      { id: 'Mother of Pearl', title: 'Mother of Pearl Buttons', desc: 'Natural shell buttons with a smooth pearl sheen.', color: '#F3F4F6', surcharge: 120 },
      { id: 'Matte Black', title: 'Matte Black Buttons', desc: 'Contemporary dark buttons with a satin finish.', color: '#18181B', surcharge: 50 },
      { id: 'Antique Brass', title: 'Brass Buttons', desc: 'Warm metallic buttons with vintage charm.', color: '#B45309', surcharge: 80 }
    ],
    monogramPositions: ['Left Cuff', 'Left Chest Pocket', 'Bottom Hem']
  };
}

/**
 * Fabric price adjustment lookup
 */
export function getFabricSurcharge(fabricName = '') {
  const name = (fabricName || '').trim().toLowerCase();
  const matched = MASTER_FABRICS.find(f => f.name.toLowerCase() === name || name.includes(f.name.toLowerCase()));
  if (matched) return matched.priceAdjustment;

  // Legacy fallback checks
  if (name.includes('giza') || name.includes('super 130s') || name.includes('mulberry') || name.includes('selvedge') || name.includes('silk')) {
    return 250;
  }
  if (name.includes('linen') || name.includes('french terry') || name.includes('denim') || name.includes('fleece')) {
    return 150;
  }
  return 0;
}
