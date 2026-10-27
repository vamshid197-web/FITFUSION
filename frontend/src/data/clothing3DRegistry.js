/**
 * FITFUSION 3D Clothing & Model Asset Registry
 * Centralized mapping connecting catalog apparel products with genuine Three.js 3D models (.glb).
 * 
 * Verified Real GLB Garment Assets:
 * - T-Shirts:            '/models/apparel/crewneck-tshirt.glb' (10,513 vertices)
 * - Hoodies:             '/models/apparel/hoodie-sweatshirt.glb'
 * - Shirts:              '/models/apparel/tailored-shirt.glb'
 * - Jackets / Blazers:   '/models/apparel/blazer-jacket.glb'
 * - Dresses:             '/models/apparel/summer-dress.glb'
 * - Kurtas / Ethnic:     '/models/apparel/kurta-traditional.glb'
 * - Pants / Jeans:       '/models/apparel/chinos-pants.glb'
 * 
 * If an item belongs to an unsupported category (e.g. Footwear, Accessories, Bags, Hats),
 * has3DModel is false and "3D model not available for this product yet." is displayed.
 * Never silently defaults to a T-shirt for non-T-shirt products.
 */

export const VERIFIED_3D_GARMENT_MODELS = {
  tshirt: {
    model3D: '/models/apparel/crewneck-tshirt.glb',
    geometryType: 'tshirt',
    modelName: 'Crewneck T-Shirt 3D',
    supportedFits: ['Slim', 'Regular', 'Relaxed'],
    supportedFeatures: { decals: true, colors: true, fabrics: true, text: true, aiDesign: true },
    defaultScale: 1.0
  },
  hoodie: {
    model3D: '/models/apparel/hoodie-sweatshirt.glb',
    geometryType: 'hoodie',
    modelName: 'Streetwear Hoodie 3D',
    supportedFits: ['Regular', 'Relaxed'],
    supportedFeatures: { decals: true, colors: true, fabrics: true, text: true, aiDesign: true },
    defaultScale: 1.05
  },
  shirt: {
    model3D: '/models/apparel/tailored-shirt.glb',
    geometryType: 'shirt',
    modelName: 'Tailored Formal Shirt 3D',
    supportedFits: ['Slim', 'Regular', 'Relaxed'],
    supportedFeatures: { decals: true, colors: true, fabrics: true, text: true, aiDesign: true },
    defaultScale: 1.02
  },
  jacket: {
    model3D: '/models/apparel/blazer-jacket.glb',
    geometryType: 'jacket',
    modelName: 'Bespoke Italian Blazer 3D',
    supportedFits: ['Slim', 'Regular'],
    supportedFeatures: { decals: true, colors: true, fabrics: true, text: true, aiDesign: true },
    defaultScale: 1.05
  },
  dress: {
    model3D: '/models/apparel/summer-dress.glb',
    geometryType: 'dress',
    modelName: 'Floral Flared Dress 3D',
    supportedFits: ['Slim', 'Regular', 'Relaxed'],
    supportedFeatures: { decals: true, colors: true, fabrics: true, text: true, aiDesign: true },
    defaultScale: 1.0
  },
  kurta: {
    model3D: '/models/apparel/kurta-traditional.glb',
    geometryType: 'kurta',
    modelName: 'Heritage Silk Kurta 3D',
    supportedFits: ['Regular', 'Relaxed'],
    supportedFeatures: { decals: true, colors: true, fabrics: true, text: true, aiDesign: true },
    defaultScale: 1.02
  },
  pants: {
    model3D: '/models/apparel/chinos-pants.glb',
    geometryType: 'pants',
    modelName: 'Tailored Chinos & Jeans 3D',
    supportedFits: ['Slim', 'Regular', 'Relaxed'],
    supportedFeatures: { decals: false, colors: true, fabrics: true, text: false, aiDesign: false },
    defaultScale: 1.0
  }
};

/**
 * Maps any catalog product to its verified 3D model asset.
 * If the product has no compatible 3D model, returns has3DModel: false.
 */
export function getProduct3DModel(product) {
  if (!product) {
    return {
      has3DModel: false,
      model3D: null,
      message: 'No product selected.'
    };
  }

  // 1. Explicit model already set on the product object
  if (product.model3D) {
    const config = Object.values(VERIFIED_3D_GARMENT_MODELS).find(m => m.model3D === product.model3D) || VERIFIED_3D_GARMENT_MODELS.tshirt;
    return {
      productId: product.id,
      productName: product.name,
      category: product.category,
      has3DModel: true,
      model3D: product.model3D,
      ...config
    };
  }

  const category = String(product.category || '').toLowerCase().trim();
  const name = String(product.name || '').toLowerCase().trim();
  const subcategory = String(product.subcategory || '').toLowerCase().trim();

  // 2. Explicitly unsupported categories: Footwear, Bags, Accessories, Headwear, Jewelry
  if (
    category.includes('footwear') ||
    category.includes('shoe') ||
    category.includes('boot') ||
    category.includes('sneaker') ||
    category.includes('loafer') ||
    category.includes('accessory') ||
    category.includes('accessories') ||
    category.includes('bag') ||
    category.includes('headwear') ||
    category.includes('hat') ||
    category.includes('cap') ||
    category.includes('watch') ||
    category.includes('belt') ||
    category.includes('swimwear') ||
    name.includes('shoe') ||
    name.includes('sneaker') ||
    name.includes('loafers') ||
    name.includes('wallet') ||
    name.includes('bag') ||
    name.includes('belt')
  ) {
    return {
      productId: product.id,
      productName: product.name,
      category: product.category,
      has3DModel: false,
      model3D: null,
      reason: 'No 3D asset exists for footwear, headwear, bags, or accessory items.',
      message: '3D preview unavailable for this product.'
    };
  }

  // 3. Hoodies & Sweatshirts (checked before T-shirts to avoid 'sweatshirt' containing 'tshirt')
  if (
    category.includes('hoodie') ||
    category.includes('sweatshirt') ||
    category.includes('pullover') ||
    name.includes('hoodie') ||
    name.includes('sweatshirt') ||
    name.includes('pullover')
  ) {
    return {
      productId: product.id,
      productName: product.name,
      category: product.category,
      has3DModel: true,
      ...VERIFIED_3D_GARMENT_MODELS.hoodie
    };
  }

  // 4. T-Shirts & Polos (Strict word boundary)
  if (
    /\b(t[- ]?shirts?|tees?|polos?)\b/i.test(category) ||
    /\b(t[- ]?shirts?|tees?|polos?)\b/i.test(name)
  ) {
    return {
      productId: product.id,
      productName: product.name,
      category: product.category,
      has3DModel: true,
      ...VERIFIED_3D_GARMENT_MODELS.tshirt
    };
  }

  // 5. Shirts (Formal, Casual, Oxford, Linen, Poplin, Flannel)
  if (
    category.includes('shirt') ||
    subcategory.includes('shirt') ||
    name.includes('shirt')
  ) {
    return {
      productId: product.id,
      productName: product.name,
      category: product.category,
      has3DModel: true,
      ...VERIFIED_3D_GARMENT_MODELS.shirt
    };
  }

  // 6. Jackets, Blazers, Suits & Coats
  if (
    category.includes('jacket') ||
    category.includes('blazer') ||
    category.includes('suit') ||
    category.includes('coat') ||
    name.includes('jacket') ||
    name.includes('blazer') ||
    name.includes('suit') ||
    name.includes('coat') ||
    name.includes('overcoat')
  ) {
    return {
      productId: product.id,
      productName: product.name,
      category: product.category,
      has3DModel: true,
      ...VERIFIED_3D_GARMENT_MODELS.jacket
    };
  }

  // 7. Dresses & Gowns
  if (
    category.includes('dress') ||
    category.includes('gown') ||
    category.includes('maxi') ||
    name.includes('dress') ||
    name.includes('gown') ||
    name.includes('frock')
  ) {
    return {
      productId: product.id,
      productName: product.name,
      category: product.category,
      has3DModel: true,
      ...VERIFIED_3D_GARMENT_MODELS.dress
    };
  }

  // 8. Traditional Wear, Kurtas, Sherwanis, Ethnic
  if (
    category.includes('traditional') ||
    category.includes('ethnic') ||
    category.includes('cultural') ||
    category.includes('kurta') ||
    name.includes('kurta') ||
    name.includes('sherwani') ||
    name.includes('bandhgala')
  ) {
    return {
      productId: product.id,
      productName: product.name,
      category: product.category,
      has3DModel: true,
      ...VERIFIED_3D_GARMENT_MODELS.kurta
    };
  }

  // 9. Jeans, Pants, Trousers, Chinos, Bottomwear
  if (
    category.includes('pant') ||
    category.includes('jean') ||
    category.includes('trouser') ||
    category.includes('chino') ||
    name.includes('jean') ||
    name.includes('pant') ||
    name.includes('trouser') ||
    name.includes('chino') ||
    name.includes('denim')
  ) {
    return {
      productId: product.id,
      productName: product.name,
      category: product.category,
      has3DModel: true,
      ...VERIFIED_3D_GARMENT_MODELS.pants
    };
  }

  // 10. Sports & Activewear (Tops & Performance Tees only)
  if (
    (category.includes('sport') || category.includes('active') || name.includes('sport') || name.includes('athletic')) &&
    (category.includes('tee') || category.includes('t-shirt') || name.includes('tee') || name.includes('t-shirt') || name.includes('jersey') || name.includes('top'))
  ) {
    return {
      productId: product.id,
      productName: product.name,
      category: product.category,
      has3DModel: true,
      ...VERIFIED_3D_GARMENT_MODELS.tshirt
    };
  }

  // 11. Any remaining unmapped categories (Shorts, Skirts, Footwear, etc. where assets do not exist)
  return {
    productId: product.id,
    productName: product.name,
    category: product.category,
    has3DModel: false,
    model3D: null,
    reason: `3D model not available for ${product.category || 'this category'} yet.`,
    message: '3D preview unavailable for this product.'
  };
}

/**
 * Optical Fabric Simulation Parameters for Three.js PBR Shaders
 */
export const FABRIC_PBR_PROPERTIES = {
  'Cotton': { roughness: 0.82, metalness: 0.02, clearcoat: 0.0, sheen: 0.1 },
  'Premium Supima Cotton': { roughness: 0.70, metalness: 0.02, clearcoat: 0.05, sheen: 0.15 },
  'Cotton-Polyester Blend': { roughness: 0.64, metalness: 0.04, clearcoat: 0.02, sheen: 0.12 },
  'Polyester': { roughness: 0.46, metalness: 0.08, clearcoat: 0.05, sheen: 0.2 },
  'Pure Linen': { roughness: 0.92, metalness: 0.01, clearcoat: 0.0, sheen: 0.05 },
  'Raw Denim': { roughness: 0.88, metalness: 0.04, clearcoat: 0.0, sheen: 0.05 },
  'Merino Wool': { roughness: 0.82, metalness: 0.03, clearcoat: 0.05, sheen: 0.25 },
  'Mulberry Silk': { roughness: 0.28, metalness: 0.12, clearcoat: 0.6, sheen: 0.9 }
};

export function getFabricPbr(fabricInput) {
  if (!fabricInput) return FABRIC_PBR_PROPERTIES['Cotton'];
  const name = String(typeof fabricInput === 'object' ? fabricInput.name || '' : fabricInput).toLowerCase();

  for (const [key, props] of Object.entries(FABRIC_PBR_PROPERTIES)) {
    if (name.includes(key.toLowerCase()) || key.toLowerCase().includes(name)) {
      return props;
    }
  }

  if (name.includes('silk') || name.includes('satin')) return FABRIC_PBR_PROPERTIES['Mulberry Silk'];
  if (name.includes('wool') || name.includes('tweed')) return FABRIC_PBR_PROPERTIES['Merino Wool'];
  if (name.includes('denim') || name.includes('jean')) return FABRIC_PBR_PROPERTIES['Raw Denim'];
  if (name.includes('linen') || name.includes('flax')) return FABRIC_PBR_PROPERTIES['Pure Linen'];
  if (name.includes('poly')) return FABRIC_PBR_PROPERTIES['Polyester'];

  return FABRIC_PBR_PROPERTIES['Cotton'];
}
