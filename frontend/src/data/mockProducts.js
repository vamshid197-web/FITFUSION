/**
 * FitFusion Product Catalog
 * Expanded catalog: Men, Women, Special collections.
 * Images use Unsplash CDN (free for demos - no auth needed).
 */

// ── Category structure ───────────────────────────────────────────────────────
export const CATEGORY_GROUPS = {
  Men: [
    'T-Shirts','Polo T-Shirts','Shirts','Formal Shirts','Casual Shirts','Overshirts',
    'Hoodies','Sweatshirts','Sweaters','Jackets','Blazers','Coats','Jeans',
    'Trousers','Chinos','Cargo Pants','Track Pants','Shorts','Kurtas','Kurta Sets','Waistcoats'
  ],
  Women: [
    'T-Shirts','Tops','Shirts','Blouses','Crop Tops','Hoodies','Sweatshirts',
    'Sweaters','Jackets','Blazers','Dresses','Skirts','Jeans','Trousers',
    'Cargo Pants','Shorts','Kurtas','Kurta Sets','Co-ord Sets','Jumpsuits'
  ],
  Special: ['Oversized','Formal Wear','Party Wear','Sportswear','Winter Wear','Ethnic Wear','Custom Wear']
};

export const CLOTHING_CATEGORIES = [
  'All',
  'T-Shirts','Polo T-Shirts','Shirts','Formal Shirts','Casual Shirts',
  'Hoodies','Sweatshirts','Sweaters','Jackets','Blazers','Coats',
  'Jeans','Trousers','Chinos','Cargo Pants','Shorts','Kurtas','Kurta Sets',
  'Tops','Blouses','Crop Tops','Dresses','Skirts','Co-ord Sets','Jumpsuits',
  'Formal Wear','Party Wear','Sportswear','Winter Wear','Ethnic Wear','Custom Wear'
];

// ── Category browse images ────────────────────────────────────────────────────
export const CATEGORY_IMAGES = {
  'T-Shirts':       'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&q=80',
  'Polo T-Shirts':  'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=400&h=400&fit=crop&q=80',
  'Shirts':         'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop&q=80',
  'Formal Shirts':  'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400&h=400&fit=crop&q=80',
  'Casual Shirts':  'https://images.unsplash.com/photo-1512353087810-25dfcd100962?w=400&h=400&fit=crop&q=80',
  'Overshirts':     'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=400&h=400&fit=crop&q=80',
  'Hoodies':        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=400&fit=crop&q=80',
  'Sweatshirts':    'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=400&h=400&fit=crop&q=80',
  'Sweaters':       'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop&q=80',
  'Jackets':        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&q=80',
  'Blazers':        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop&q=80',
  'Coats':          'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=400&fit=crop&q=80',
  'Jeans':          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&q=80',
  'Trousers':       'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop&q=80',
  'Chinos':         'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop&q=80',
  'Cargo Pants':    'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=400&h=400&fit=crop&q=80',
  'Track Pants':    'https://images.unsplash.com/photo-1580906853543-f2b9ade3d5be?w=400&h=400&fit=crop&q=80',
  'Shorts':         'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400&h=400&fit=crop&q=80',
  'Kurtas':         'https://images.unsplash.com/photo-1583391733956-6c78276477e3?w=400&h=400&fit=crop&q=80',
  'Kurta Sets':     'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=400&fit=crop&q=80',
  'Waistcoats':     'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=400&fit=crop&q=80',
  'Tops':           'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=400&h=400&fit=crop&q=80',
  'Blouses':        'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&h=400&fit=crop&q=80',
  'Crop Tops':      'https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=400&h=400&fit=crop&q=80',
  'Dresses':        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop&q=80',
  'Skirts':         'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=400&fit=crop&q=80',
  'Co-ord Sets':    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop&q=80',
  'Jumpsuits':      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400&h=400&fit=crop&q=80',
  'Formal Wear':    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop&q=80',
  'Party Wear':     'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=400&fit=crop&q=80',
  'Sportswear':     'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop&q=80',
  'Winter Wear':    'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=400&fit=crop&q=80',
  'Ethnic Wear':    'https://images.unsplash.com/photo-1583391733956-6c78276477e3?w=400&h=400&fit=crop&q=80',
  'Custom Wear':    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=400&fit=crop&q=80',
  'Oversized':      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400&h=400&fit=crop&q=80',
};

// ── Product catalog ───────────────────────────────────────────────────────────
export const MOCK_PRODUCTS = [
  // ─ MEN: T-SHIRTS ─────────────────────────────────────────────────────────
  {
    id: '1', name: 'Classic Cotton T-Shirt', slug: 'classic-cotton-tshirt',
    category: 'T-Shirts', gender: 'Men',
    basePrice: 599, compareAtPrice: 799, currency: 'INR',
    rating: 4.7, reviewsCount: 214, badge: 'Trending',
    featured: false, trending: true, recommended: true,
    available: true, stock: 48, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Soft 180 GSM cotton tee. Round neck, regular fit.',
    description: 'A wardrobe essential in 180 GSM ring-spun cotton. Customize neck style, sleeve length, fit, and color.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=700&fit=crop&q=85','https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Cotton',composition:'100% Ring-Spun Cotton 180 GSM'},{name:'Premium Cotton',composition:'100% Combed Cotton 200 GSM'},{name:'Jersey',composition:'95% Cotton 5% Elastane'}],
    availableColors: [{name:'White',hex:'#FFFFFF'},{name:'Black',hex:'#111111'},{name:'Navy Blue',hex:'#1E3A8A'},{name:'Grey',hex:'#9CA3AF'},{name:'Olive Green',hex:'#4B5563'}],
    availableSizes: ['XS','S','M','L','XL','2XL','Custom Measurement'],
    silhouetteColor: 'from-stone-100 to-stone-200', accentColor: '#111111',
    createdAt: '2026-01-10T08:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  {
    id: '2', name: 'Oversized Drop-Shoulder T-Shirt', slug: 'oversized-drop-shoulder-tshirt',
    category: 'T-Shirts', gender: 'Men',
    basePrice: 799, compareAtPrice: 999, currency: 'INR',
    rating: 4.8, reviewsCount: 178, badge: 'Featured',
    featured: true, trending: true, recommended: true,
    available: true, stock: 22, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Heavy 280 GSM oversized tee with dropped shoulders.',
    description: 'Made from 280 GSM combed cotton. Dropped shoulder seam gives a relaxed streetwear look. Customize print, color, and size.',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=700&fit=crop&q=85','https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Heavyweight Cotton',composition:'280 GSM Combed Cotton'},{name:'Organic Cotton',composition:'100% Organic Cotton 260 GSM'}],
    availableColors: [{name:'Off-White',hex:'#F5F5F0'},{name:'Washed Black',hex:'#1C1C1C'},{name:'Sage Green',hex:'#8FBC8F'},{name:'Dusty Brown',hex:'#7B6F64'}],
    availableSizes: ['S','M','L','XL','2XL','Custom Measurement'],
    silhouetteColor: 'from-stone-200 to-stone-300', accentColor: '#1C1C1C',
    createdAt: '2026-01-18T10:30:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ MEN: POLO T-SHIRTS ────────────────────────────────────────────────────
  {
    id: '3', name: 'Classic Polo T-Shirt', slug: 'classic-polo-tshirt',
    category: 'Polo T-Shirts', gender: 'Men',
    basePrice: 899, compareAtPrice: 1199, currency: 'INR',
    rating: 4.6, reviewsCount: 143, badge: 'Recommended',
    featured: false, trending: false, recommended: true,
    available: true, stock: 35, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Pique cotton polo with ribbed collar and two-button placket.',
    description: 'Classic polo shirt in 220 GSM pique cotton. Ribbed collar, two-button placket, ribbed sleeve hems. Smart casual.',
    image: 'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Pique Cotton',composition:'100% Cotton Pique 220 GSM'},{name:'Premium Pique',composition:'100% Combed Cotton 240 GSM'}],
    availableColors: [{name:'White',hex:'#FFFFFF'},{name:'Navy Blue',hex:'#1E3A8A'},{name:'Bottle Green',hex:'#155724'},{name:'Maroon',hex:'#7B1C1C'},{name:'Grey',hex:'#9CA3AF'}],
    availableSizes: ['S','M','L','XL','2XL','Custom Measurement'],
    silhouetteColor: 'from-blue-50 to-indigo-100', accentColor: '#1E3A8A',
    createdAt: '2026-01-22T09:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ MEN: SHIRTS ───────────────────────────────────────────────────────────
  {
    id: '4', name: 'Oxford Cotton Shirt', slug: 'oxford-cotton-shirt',
    category: 'Shirts', gender: 'Men',
    basePrice: 1199, compareAtPrice: 1599, currency: 'INR',
    rating: 4.8, reviewsCount: 192, badge: 'Featured',
    featured: true, trending: false, recommended: true,
    available: true, stock: 28, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: '100% Oxford cotton shirt. Customize collar, cuff, and buttons.',
    description: 'Timeless shirt in 100% premium Oxford cotton. Choose spread, button-down, or mandarin collar. Customize cuff, pocket, and buttons.',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=700&fit=crop&q=85','https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Oxford Cotton',composition:'100% Cotton Oxford Weave'},{name:'Premium Cotton',composition:'100% Egyptian Giza Cotton'},{name:'Linen Blend',composition:'55% Linen 45% Cotton'}],
    availableColors: [{name:'White',hex:'#FFFFFF'},{name:'Sky Blue',hex:'#93C5FD'},{name:'Navy Blue',hex:'#1E3A8A'},{name:'Light Pink',hex:'#FBCFE8'},{name:'Pale Yellow',hex:'#FEF9C3'}],
    availableSizes: ['XS','S','M','L','XL','2XL','Custom Measurement'],
    silhouetteColor: 'from-blue-100 to-indigo-100', accentColor: '#1E3A8A',
    createdAt: '2026-01-15T08:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  {
    id: '5', name: 'Linen Casual Shirt', slug: 'linen-casual-shirt',
    category: 'Casual Shirts', gender: 'Men',
    basePrice: 999, compareAtPrice: 1299, currency: 'INR',
    rating: 4.6, reviewsCount: 97, badge: 'Recommended',
    featured: false, trending: false, recommended: true,
    available: true, stock: 18, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Pure linen casual shirt. Camp collar available.',
    description: 'Breathable pure flax linen shirt for summer. Choose camp, mandarin, or spread collar. Custom sizing and color.',
    image: 'https://images.unsplash.com/photo-1512353087810-25dfcd100962?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1512353087810-25dfcd100962?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1512353087810-25dfcd100962?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Linen',composition:'100% Pure Flax Linen'},{name:'Linen Blend',composition:'60% Linen 40% Cotton'}],
    availableColors: [{name:'Natural Sand',hex:'#E5D5BA'},{name:'Olive Green',hex:'#6B7A5E'},{name:'Sky Blue',hex:'#BAE6FD'},{name:'Coral',hex:'#FCA5A5'}],
    availableSizes: ['S','M','L','XL','2XL','Custom Measurement'],
    silhouetteColor: 'from-amber-50 to-orange-100', accentColor: '#D97706',
    createdAt: '2026-01-22T09:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  {
    id: '6', name: 'Formal Dress Shirt', slug: 'formal-dress-shirt',
    category: 'Formal Shirts', gender: 'Men',
    basePrice: 1499, compareAtPrice: 1999, currency: 'INR',
    rating: 4.9, reviewsCount: 86, badge: 'Featured',
    featured: true, trending: false, recommended: true,
    available: true, stock: 20, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Crisp formal shirt with French cuff and spread collar.',
    description: 'Premium formal shirt for office and events. Choose spread or cutaway collar, French or barrel cuff, and custom fit.',
    image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Premium Cotton',composition:'100% Egyptian Cotton 120s'},{name:'Cotton Twill',composition:'100% Mercerized Cotton Twill'}],
    availableColors: [{name:'Crisp White',hex:'#FFFFFF'},{name:'Light Blue',hex:'#BFDBFE'},{name:'Pale Pink',hex:'#FBCFE8'}],
    availableSizes: ['XS','S','M','L','XL','2XL','Custom Measurement'],
    silhouetteColor: 'from-slate-50 to-blue-50', accentColor: '#1E40AF',
    createdAt: '2026-02-01T08:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ MEN: HOODIES ──────────────────────────────────────────────────────────
  {
    id: '7', name: 'Classic Pullover Hoodie', slug: 'classic-pullover-hoodie',
    category: 'Hoodies', gender: 'Men',
    basePrice: 1299, compareAtPrice: 1699, currency: 'INR',
    rating: 4.9, reviewsCount: 245, badge: 'Trending',
    featured: false, trending: true, recommended: true,
    available: true, stock: 14, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: '400 GSM French terry pullover hoodie with kangaroo pocket.',
    description: 'Heavy 400 GSM French terry hoodie with double-lined hood and metal drawstrings. Customize hood, pocket, sleeve, and fit.',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=700&fit=crop&q=85','https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'French Terry',composition:'100% Brushed Cotton 400 GSM'},{name:'Fleece',composition:'80% Cotton 20% Polyester Fleece'},{name:'Organic Fleece',composition:'100% Organic Cotton Fleece'}],
    availableColors: [{name:'Heather Grey',hex:'#9CA3AF'},{name:'Black',hex:'#111111'},{name:'Navy Blue',hex:'#1E3A8A'},{name:'Forest Green',hex:'#14532D'},{name:'Burgundy',hex:'#7F1D1D'}],
    availableSizes: ['XS','S','M','L','XL','2XL','3XL','Custom Measurement'],
    silhouetteColor: 'from-gray-100 to-slate-200', accentColor: '#475569',
    createdAt: '2026-01-25T14:20:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ MEN: BLAZERS ──────────────────────────────────────────────────────────
  {
    id: '8', name: 'Slim Fit Wool Blazer', slug: 'slim-fit-wool-blazer',
    category: 'Blazers', gender: 'Men',
    basePrice: 3499, compareAtPrice: 4999, currency: 'INR',
    rating: 4.9, reviewsCount: 67, badge: 'Featured',
    featured: true, trending: false, recommended: true,
    available: true, stock: 15, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Italian wool slim-fit blazer. Customize lapel and buttons.',
    description: 'Tailored from fine Italian wool blend. Choose lapel style (notch, peak, shawl), button count, pocket style, and lining.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Wool Blend',composition:'70% Wool 30% Polyester'},{name:'Pure Wool',composition:'100% Fine Merino Wool'},{name:'Twill',composition:'100% Cotton Twill'}],
    availableColors: [{name:'Charcoal',hex:'#374151'},{name:'Navy Blue',hex:'#1E3A8A'},{name:'Black',hex:'#111111'},{name:'Camel',hex:'#C19A6B'}],
    availableSizes: ['36','38','40','42','44','Custom Measurement'],
    silhouetteColor: 'from-slate-200 to-zinc-300', accentColor: '#18181B',
    createdAt: '2026-02-01T15:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ MEN: JACKETS ──────────────────────────────────────────────────────────
  {
    id: '9', name: 'Denim Trucker Jacket', slug: 'denim-trucker-jacket',
    category: 'Jackets', gender: 'Men',
    basePrice: 1999, compareAtPrice: 2499, currency: 'INR',
    rating: 4.7, reviewsCount: 112, badge: 'Recommended',
    featured: false, trending: true, recommended: true,
    available: true, stock: 22, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Classic denim jacket with chest pockets and button front.',
    description: 'Structured denim jacket in 14oz cotton denim. Customize button style, lining, and fit.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Denim',composition:'100% Cotton 14oz Denim'},{name:'Washed Denim',composition:'100% Cotton Washed Denim'}],
    availableColors: [{name:'Indigo Blue',hex:'#1E293B'},{name:'Stonewash Blue',hex:'#60A5FA'},{name:'Washed Black',hex:'#2D2D2D'}],
    availableSizes: ['S','M','L','XL','XXL','Custom Measurement'],
    silhouetteColor: 'from-sky-100 to-blue-200', accentColor: '#1E293B',
    createdAt: '2026-01-20T11:15:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ MEN: JEANS ────────────────────────────────────────────────────────────
  {
    id: '10', name: 'Slim Fit Stretch Jeans', slug: 'slim-fit-stretch-jeans',
    category: 'Jeans', gender: 'Men',
    basePrice: 1499, compareAtPrice: 1999, currency: 'INR',
    rating: 4.6, reviewsCount: 189, badge: 'Trending',
    featured: false, trending: true, recommended: true,
    available: true, stock: 42, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Slim fit stretch denim. Customize waist, length, and wash.',
    description: 'Contemporary slim fit jeans in stretch denim. Customize waist size, inseam length, pocket style, and wash finish.',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Denim',composition:'98% Cotton 2% Elastane Denim'},{name:'Rigid Denim',composition:'100% Cotton Raw Denim'}],
    availableColors: [{name:'Dark Indigo',hex:'#1E3A5F'},{name:'Medium Blue',hex:'#3B82F6'},{name:'Light Wash',hex:'#93C5FD'},{name:'Black Denim',hex:'#1A1A1A'}],
    availableSizes: ['28W','30W','32W','34W','36W','38W','Custom Measurement'],
    silhouetteColor: 'from-blue-100 to-indigo-200', accentColor: '#1E3A5F',
    createdAt: '2026-02-05T12:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ MEN: CHINOS ───────────────────────────────────────────────────────────
  {
    id: '11', name: 'Chino Trousers', slug: 'chino-trousers',
    category: 'Chinos', gender: 'Men',
    basePrice: 1299, compareAtPrice: 1699, currency: 'INR',
    rating: 4.5, reviewsCount: 134, badge: 'Recommended',
    featured: false, trending: false, recommended: true,
    available: true, stock: 30, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Slim chino trousers in stretch twill. Smart casual staple.',
    description: 'Versatile chino trousers in stretch cotton twill. Choose slim, straight, or relaxed fit, waist size, and inseam.',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Cotton Twill',composition:'97% Cotton 3% Spandex Twill'},{name:'Linen Blend',composition:'55% Linen 45% Cotton'}],
    availableColors: [{name:'Khaki',hex:'#C3A882'},{name:'Navy Blue',hex:'#1E3A8A'},{name:'Olive',hex:'#5B6E4A'},{name:'Grey',hex:'#6B7280'}],
    availableSizes: ['28W','30W','32W','34W','36W','38W','Custom Measurement'],
    silhouetteColor: 'from-stone-100 to-amber-100', accentColor: '#78350F',
    createdAt: '2026-02-05T12:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ MEN: KURTAS ───────────────────────────────────────────────────────────
  {
    id: '12', name: 'Cotton Nehru Kurta', slug: 'cotton-nehru-kurta',
    category: 'Kurtas', gender: 'Men',
    basePrice: 1199, compareAtPrice: 1599, currency: 'INR',
    rating: 4.8, reviewsCount: 98, badge: 'Trending',
    featured: false, trending: true, recommended: true,
    available: true, stock: 25, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Pure cotton Nehru collar kurta with side slits.',
    description: 'Comfortable pure cotton kurta with Nehru collar. Customize sleeve length, hem length, pocket style, and buttons.',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e3?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e3?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1583391733956-6c78276477e3?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Cotton',composition:'100% Handloom Cotton'},{name:'Khadi',composition:'100% Hand-Spun Khadi Cotton'},{name:'Silk Blend',composition:'60% Silk 40% Cotton'}],
    availableColors: [{name:'Ivory White',hex:'#FEF9E7'},{name:'Royal Blue',hex:'#1E3A8A'},{name:'Teal',hex:'#0D9488'},{name:'Deep Maroon',hex:'#7B1C1C'}],
    availableSizes: ['38','40','42','44','46','Custom Measurement'],
    silhouetteColor: 'from-amber-100 to-teal-100', accentColor: '#0D9488',
    createdAt: '2026-02-15T11:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ MEN: SWEATSHIRTS ──────────────────────────────────────────────────────
  {
    id: '13', name: 'Crew Neck Sweatshirt', slug: 'crew-neck-sweatshirt',
    category: 'Sweatshirts', gender: 'Men',
    basePrice: 999, compareAtPrice: 1299, currency: 'INR',
    rating: 4.7, reviewsCount: 156, badge: 'Recommended',
    featured: false, trending: false, recommended: true,
    available: true, stock: 32, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Fleece-lined crew neck sweatshirt. Warm and simple.',
    description: '320 GSM cotton-blend fleece sweatshirt with ribbed cuffs, collar, and hem. Customize color, fit, and sleeve length.',
    image: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Cotton Fleece',composition:'80% Cotton 20% Polyester Fleece'},{name:'French Terry',composition:'100% Cotton French Terry'}],
    availableColors: [{name:'White',hex:'#F8F8F8'},{name:'Grey Melange',hex:'#9CA3AF'},{name:'Black',hex:'#111111'},{name:'Navy',hex:'#1E3A8A'}],
    availableSizes: ['XS','S','M','L','XL','2XL','Custom Measurement'],
    silhouetteColor: 'from-gray-100 to-slate-200', accentColor: '#475569',
    createdAt: '2026-02-10T09:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ MEN: SWEATERS ─────────────────────────────────────────────────────────
  {
    id: '14', name: 'Merino Wool Sweater', slug: 'merino-wool-sweater',
    category: 'Sweaters', gender: 'Men',
    basePrice: 2499, compareAtPrice: 3499, currency: 'INR',
    rating: 4.8, reviewsCount: 74, badge: 'Featured',
    featured: true, trending: false, recommended: true,
    available: true, stock: 18, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Fine merino wool crew neck sweater. Lightweight and warm.',
    description: '100% fine merino wool sweater. Naturally temperature-regulating and soft. Customize neck style, sleeve, and color.',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Merino Wool',composition:'100% Fine Merino Wool'},{name:'Cashmere Blend',composition:'70% Merino 30% Cashmere'},{name:'Wool Blend',composition:'80% Wool 20% Nylon'}],
    availableColors: [{name:'Cream',hex:'#FEF9E7'},{name:'Camel',hex:'#C19A6B'},{name:'Forest Green',hex:'#14532D'},{name:'Burgundy',hex:'#7F1D1D'}],
    availableSizes: ['XS','S','M','L','XL','XXL','Custom Measurement'],
    silhouetteColor: 'from-amber-50 to-amber-100', accentColor: '#C19A6B',
    createdAt: '2026-02-12T12:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ WOMEN: DRESSES ────────────────────────────────────────────────────────
  {
    id: '15', name: 'Floral Wrap Dress', slug: 'floral-wrap-dress',
    category: 'Dresses', gender: 'Women',
    basePrice: 1899, compareAtPrice: 2499, currency: 'INR',
    rating: 4.8, reviewsCount: 143, badge: 'Featured',
    featured: true, trending: true, recommended: true,
    available: true, stock: 20, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Elegant wrap dress with V-neckline. Customize length and sleeve.',
    description: 'Flattering wrap-style dress for all body types. Choose neckline depth, sleeve style, and hem length.',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=700&fit=crop&q=85','https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Rayon',composition:'100% Viscose Rayon'},{name:'Satin',composition:'100% Polyester Satin'},{name:'Silk Blend',composition:'60% Silk 40% Viscose'}],
    availableColors: [{name:'Rose Pink',hex:'#F9A8D4'},{name:'Emerald Green',hex:'#065F46'},{name:'Midnight Blue',hex:'#1E3A8A'},{name:'Coral',hex:'#F97316'}],
    availableSizes: ['XS','S','M','L','XL','Custom Measurement'],
    silhouetteColor: 'from-rose-100 to-pink-100', accentColor: '#EC4899',
    createdAt: '2026-02-10T16:45:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  {
    id: '16', name: 'Evening Maxi Dress', slug: 'evening-maxi-dress',
    category: 'Dresses', gender: 'Women',
    basePrice: 2499, compareAtPrice: 3499, currency: 'INR',
    rating: 4.9, reviewsCount: 68, badge: 'Featured',
    featured: true, trending: false, recommended: true,
    available: true, stock: 12, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Floor-length maxi dress for evening events.',
    description: 'Elegant floor-length dress in silk blend or satin. Choose V-neck, square neck, or off-shoulder. Custom sizing.',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Silk Blend',composition:'80% Silk 20% Polyester'},{name:'Satin',composition:'100% Polyester Satin'}],
    availableColors: [{name:'Champagne',hex:'#F9E4B7'},{name:'Emerald',hex:'#065F46'},{name:'Midnight Blue',hex:'#1E3A8A'},{name:'Ruby Red',hex:'#991B1B'}],
    availableSizes: ['XS','S','M','L','XL','Custom Measurement'],
    silhouetteColor: 'from-amber-100 to-rose-100', accentColor: '#991B1B',
    createdAt: '2026-02-15T16:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ WOMEN: TOPS ───────────────────────────────────────────────────────────
  {
    id: '17', name: 'Casual Cotton Top', slug: 'casual-cotton-top',
    category: 'Tops', gender: 'Women',
    basePrice: 699, compareAtPrice: 899, currency: 'INR',
    rating: 4.6, reviewsCount: 201, badge: 'Trending',
    featured: false, trending: true, recommended: true,
    available: true, stock: 40, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Relaxed cotton top with round neck. Everyday wear.',
    description: 'Lightweight cotton top for daily casual wear. Choose neck style, sleeve type, and length.',
    image: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Cotton',composition:'100% Combed Cotton 160 GSM'},{name:'Cotton Blend',composition:'95% Cotton 5% Elastane'}],
    availableColors: [{name:'White',hex:'#FFFFFF'},{name:'Black',hex:'#111111'},{name:'Dusty Pink',hex:'#F4A7B9'},{name:'Lavender',hex:'#C4B5FD'},{name:'Mint Green',hex:'#A7F3D0'}],
    availableSizes: ['XS','S','M','L','XL','Custom Measurement'],
    silhouetteColor: 'from-pink-50 to-rose-100', accentColor: '#EC4899',
    createdAt: '2026-02-01T08:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ WOMEN: BLOUSES ────────────────────────────────────────────────────────
  {
    id: '18', name: 'Silk Satin Blouse', slug: 'silk-satin-blouse',
    category: 'Blouses', gender: 'Women',
    basePrice: 1499, compareAtPrice: 1999, currency: 'INR',
    rating: 4.7, reviewsCount: 89, badge: 'Featured',
    featured: true, trending: false, recommended: true,
    available: true, stock: 18, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Flowy satin blouse with button-down front. Work and party ready.',
    description: 'Elegant satin blouse with soft drape. Choose collar style, sleeve type, and fit.',
    image: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Satin',composition:'100% Polyester Satin'},{name:'Silk Blend',composition:'70% Silk 30% Viscose'}],
    availableColors: [{name:'Ivory',hex:'#FEF9E7'},{name:'Blush Pink',hex:'#FBCFE8'},{name:'Sky Blue',hex:'#BAE6FD'},{name:'Sage',hex:'#9CA38F'}],
    availableSizes: ['XS','S','M','L','XL','Custom Measurement'],
    silhouetteColor: 'from-pink-50 to-rose-50', accentColor: '#EC4899',
    createdAt: '2026-02-12T10:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ WOMEN: SKIRTS ─────────────────────────────────────────────────────────
  {
    id: '19', name: 'A-Line Midi Skirt', slug: 'a-line-midi-skirt',
    category: 'Skirts', gender: 'Women',
    basePrice: 999, compareAtPrice: 1299, currency: 'INR',
    rating: 4.6, reviewsCount: 112, badge: 'Recommended',
    featured: false, trending: false, recommended: true,
    available: true, stock: 28, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Flared A-line midi skirt with elastic waistband.',
    description: 'Elegant A-line skirt falling at mid-calf. Choose waist style, hem length, lining, and color.',
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Rayon',composition:'100% Viscose Rayon'},{name:'Cotton',composition:'100% Cotton'},{name:'Linen',composition:'55% Linen 45% Cotton'}],
    availableColors: [{name:'Dusty Rose',hex:'#F4A7B9'},{name:'Navy Blue',hex:'#1E3A8A'},{name:'Olive Green',hex:'#6B7A5E'},{name:'Terracotta',hex:'#C2714F'}],
    availableSizes: ['XS','S','M','L','XL','Custom Measurement'],
    silhouetteColor: 'from-rose-50 to-pink-100', accentColor: '#F9A8D4',
    createdAt: '2026-02-18T09:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ WOMEN: KURTAS ─────────────────────────────────────────────────────────
  {
    id: '20', name: "Women's Cotton Straight Kurta", slug: 'womens-cotton-straight-kurta',
    category: 'Kurtas', gender: 'Women',
    basePrice: 1099, compareAtPrice: 1399, currency: 'INR',
    rating: 4.7, reviewsCount: 156, badge: 'Trending',
    featured: false, trending: true, recommended: true,
    available: true, stock: 35, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Straight cut cotton kurta. Festival ready.',
    description: 'Comfortable straight-cut kurta in pure cotton. Customize collar style, sleeve length, hem length, and color.',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Cotton',composition:'100% Cotton'},{name:'Cotton Silk',composition:'80% Cotton 20% Silk'},{name:'Rayon',composition:'100% Rayon'}],
    availableColors: [{name:'Ivory',hex:'#FEF9E7'},{name:'Teal',hex:'#0D9488'},{name:'Deep Purple',hex:'#581C87'},{name:'Pink',hex:'#F9A8D4'}],
    availableSizes: ['XS','S','M','L','XL','XXL','Custom Measurement'],
    silhouetteColor: 'from-purple-50 to-pink-100', accentColor: '#7C3AED',
    createdAt: '2026-02-20T11:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ WOMEN: CO-ORD SETS ────────────────────────────────────────────────────
  {
    id: '21', name: 'Linen Co-ord Set', slug: 'linen-coord-set',
    category: 'Co-ord Sets', gender: 'Women',
    basePrice: 2299, compareAtPrice: 2999, currency: 'INR',
    rating: 4.8, reviewsCount: 92, badge: 'Featured',
    featured: true, trending: true, recommended: true,
    available: true, stock: 16, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Linen top and trouser co-ord set. Matching outfit in one.',
    description: 'Effortless co-ord set in breathable linen. Matching top and trousers. Choose relaxed or tailored fit.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Linen',composition:'100% Pure Linen'},{name:'Linen Blend',composition:'60% Linen 40% Cotton'}],
    availableColors: [{name:'Beige',hex:'#E5D5BA'},{name:'Dusty Pink',hex:'#F4A7B9'},{name:'Sage Green',hex:'#9CA38F'},{name:'White',hex:'#FFFFFF'}],
    availableSizes: ['XS','S','M','L','XL','Custom Measurement'],
    silhouetteColor: 'from-amber-50 to-stone-100', accentColor: '#D97706',
    createdAt: '2026-03-01T10:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ WOMEN: JUMPSUITS ──────────────────────────────────────────────────────
  {
    id: '22', name: 'Wide Leg Jumpsuit', slug: 'wide-leg-jumpsuit',
    category: 'Jumpsuits', gender: 'Women',
    basePrice: 2199, compareAtPrice: 2799, currency: 'INR',
    rating: 4.7, reviewsCount: 78, badge: 'Recommended',
    featured: false, trending: false, recommended: true,
    available: true, stock: 20, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Wide-leg jumpsuit with belted waist. Modern and elegant.',
    description: 'Contemporary wide-leg jumpsuit with adjustable belt. Choose neckline, sleeve length, and inseam. Office and evening ready.',
    image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Rayon',composition:'100% Viscose Rayon'},{name:'Crepe',composition:'100% Polyester Crepe'}],
    availableColors: [{name:'Black',hex:'#111111'},{name:'Olive Green',hex:'#6B7A5E'},{name:'Caramel',hex:'#C19A6B'},{name:'Navy Blue',hex:'#1E3A8A'}],
    availableSizes: ['XS','S','M','L','XL','Custom Measurement'],
    silhouetteColor: 'from-stone-100 to-amber-100', accentColor: '#78350F',
    createdAt: '2026-03-05T12:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ SPECIAL: FORMAL WEAR ──────────────────────────────────────────────────
  {
    id: '23', name: 'Classic Formal Suit Set', slug: 'classic-formal-suit-set',
    category: 'Formal Wear', gender: 'Men',
    basePrice: 4999, compareAtPrice: 6999, currency: 'INR',
    rating: 4.9, reviewsCount: 45, badge: 'Featured',
    featured: true, trending: false, recommended: true,
    available: true, stock: 10, lowStockThreshold: 3, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Two-piece formal suit in premium wool. Fully customizable.',
    description: 'Complete formal suit: blazer and matching trousers. Choose lapel style, button count, trouser fit, and lining.',
    image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Wool Blend',composition:'70% Wool 30% Polyester'},{name:'Pure Wool',composition:'100% Fine Merino Wool'},{name:'Cotton Twill',composition:'100% Cotton Twill'}],
    availableColors: [{name:'Charcoal',hex:'#374151'},{name:'Navy Blue',hex:'#1E3A8A'},{name:'Black',hex:'#111111'}],
    availableSizes: ['36','38','40','42','44','46','Custom Measurement'],
    silhouetteColor: 'from-slate-200 to-zinc-300', accentColor: '#374151',
    createdAt: '2026-03-10T08:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ SPECIAL: PARTY WEAR ───────────────────────────────────────────────────
  {
    id: '24', name: 'Sequin Party Top', slug: 'sequin-party-top',
    category: 'Party Wear', gender: 'Women',
    basePrice: 1799, compareAtPrice: 2299, currency: 'INR',
    rating: 4.7, reviewsCount: 63, badge: 'Trending',
    featured: false, trending: true, recommended: true,
    available: true, stock: 15, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Shimmering sequin top for parties and events.',
    description: 'Eye-catching sequin top for special occasions. Choose neckline, sleeve length, and size.',
    image: 'https://images.unsplash.com/photo-1561861422-a549073e547a?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1561861422-a549073e547a?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1561861422-a549073e547a?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Sequin Fabric',composition:'Sequins on Polyester Mesh'},{name:'Metallic',composition:'Metallic Thread Knit'}],
    availableColors: [{name:'Gold',hex:'#D4AF37'},{name:'Silver',hex:'#C0C0C0'},{name:'Black',hex:'#111111'},{name:'Rose Gold',hex:'#B76E79'}],
    availableSizes: ['XS','S','M','L','XL','Custom Measurement'],
    silhouetteColor: 'from-amber-100 to-yellow-200', accentColor: '#D4AF37',
    createdAt: '2026-03-15T10:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ SPECIAL: WINTER WEAR ──────────────────────────────────────────────────
  {
    id: '25', name: 'Quilted Winter Jacket', slug: 'quilted-winter-jacket',
    category: 'Winter Wear', gender: 'Men',
    basePrice: 2999, compareAtPrice: 3999, currency: 'INR',
    rating: 4.8, reviewsCount: 82, badge: 'Recommended',
    featured: false, trending: false, recommended: true,
    available: true, stock: 20, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Lightweight quilted jacket with warm insulation.',
    description: 'Packable quilted jacket with down-like fill. Ribbed collar, zip pockets. Customize color and size.',
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Nylon Shell',composition:'Nylon Shell + Polyester Fill'},{name:'Cotton Quilted',composition:'Cotton Shell + Thermal Fill'}],
    availableColors: [{name:'Black',hex:'#111111'},{name:'Navy Blue',hex:'#1E3A8A'},{name:'Olive Green',hex:'#6B7A5E'},{name:'Maroon',hex:'#7F1D1D'}],
    availableSizes: ['S','M','L','XL','XXL','Custom Measurement'],
    silhouetteColor: 'from-slate-200 to-gray-300', accentColor: '#374151',
    createdAt: '2026-03-20T08:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  },
  // ─ SPECIAL: SPORTSWEAR ───────────────────────────────────────────────────
  {
    id: '26', name: 'Performance Track Jacket', slug: 'performance-track-jacket',
    category: 'Sportswear', gender: 'Men',
    basePrice: 1799, compareAtPrice: 2299, currency: 'INR',
    rating: 4.6, reviewsCount: 121, badge: 'Trending',
    featured: false, trending: true, recommended: true,
    available: true, stock: 25, lowStockThreshold: 5, stockStatus: 'In Stock',
    customizationEnabled: true,
    shortDescription: 'Lightweight track jacket with moisture-wicking fabric.',
    description: 'Performance track jacket in moisture-wicking polyester. Zip front, zip pockets, mesh lining. Customize color and size.',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=700&fit=crop&q=85',
    images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=700&fit=crop&q=85'],
    thumbnail: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=200&h=200&fit=crop&q=70',
    availableFabrics: [{name:'Polyester',composition:'100% Performance Polyester'},{name:'Recycled Polyester',composition:'100% rPET Recycled Polyester'}],
    availableColors: [{name:'Black',hex:'#111111'},{name:'Royal Blue',hex:'#1D4ED8'},{name:'Red',hex:'#B91C1C'},{name:'Forest Green',hex:'#14532D'}],
    availableSizes: ['XS','S','M','L','XL','2XL','Custom Measurement'],
    silhouetteColor: 'from-blue-100 to-indigo-200', accentColor: '#1D4ED8',
    createdAt: '2026-03-25T10:00:00.000Z', updatedAt: '2026-09-26T12:00:00.000Z'
  }
];

// ── Helper functions ──────────────────────────────────────────────────────────

/** Get the primary image URL for a product */
export const getProductImage = function(product) {
  if (!product) return null;
  if (product.images && product.images.length > 0) return product.images[0];
  if (product.image) return product.image;
  if (product.thumbnail) return product.thumbnail;
  return null;
};

/** Get the category browse image */
export const getCategoryImage = function(category) {
  return CATEGORY_IMAGES[category] || null;
};

/** Compute stock status from product data */
export const getProductStockStatus = function(product) {
  if (!product) return 'Out of Stock';
  if (product.available === false) return 'Out of Stock';
  const stock = product.stock !== undefined ? Number(product.stock) : 25;
  const threshold = product.lowStockThreshold !== undefined ? Number(product.lowStockThreshold) : 5;
  if (stock <= 0) return 'Out of Stock';
  if (stock <= threshold) return 'Low Stock';
  return 'In Stock';
};

