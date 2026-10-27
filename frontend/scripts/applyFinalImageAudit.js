import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const frontendDir = path.resolve('.');
const publicDir = path.join(frontendDir, 'public');
const productsDir = path.join(publicDir, 'products');

// ── 1. Verified Authentic Photography Master Definitions ──────────────────────
export const VERIFIED_REAL_GARMENTS = [
  {
    id: '1',
    name: 'Classic Crew Neck T-Shirt',
    category: 'T-Shirts',
    folder: 'tshirts',
    slug: 'classic-crew-neck-tshirt',
    source: path.join(productsDir, 'categories', 'tshirt.jpg')
  },
  {
    id: 'tshirt-3',
    name: 'Premium Supima T-Shirt',
    category: 'T-Shirts',
    folder: 'tshirts',
    slug: 'premium-supima-tshirt',
    source: path.join(productsDir, 'candidates', 'test-tee-supima.jpg')
  },
  {
    id: 'tshirt-4',
    name: 'Relaxed Graphic T-Shirt',
    category: 'T-Shirts',
    folder: 'tshirts',
    slug: 'relaxed-graphic-tshirt',
    source: path.join(productsDir, 'categories', 'sweater.jpg')
  },
  {
    id: '3',
    name: 'Piqué Polo',
    category: 'T-Shirts',
    folder: 'tshirts',
    slug: 'pique-polo',
    source: path.join(productsDir, 'candidates', 'polo-real-1.jpg')
  },
  {
    id: 'shirt-1',
    name: 'Classic Cotton Poplin Shirt',
    category: 'Shirts',
    folder: 'shirts',
    slug: 'classic-cotton-poplin-shirt',
    source: path.join(productsDir, 'candidates', 'poplin-check.jpg')
  },
  {
    id: '6',
    name: 'Slim Fit Stretch Dress Shirt',
    category: 'Shirts',
    folder: 'shirts',
    slug: 'slim-fit-stretch-dress-shirt',
    source: path.join(productsDir, 'candidates', 'test-shirt-plaid.jpg')
  },
  {
    id: 'shirt-5',
    name: 'Madras Plaid Casual Shirt',
    category: 'Shirts',
    folder: 'shirts',
    slug: 'madras-plaid-casual-shirt',
    source: path.join(productsDir, 'candidates', 'test-shirt-striped.jpg')
  },
  {
    id: 'shirt-8',
    name: 'Denim Chambray Western Shirt',
    category: 'Shirts',
    folder: 'shirts',
    slug: 'denim-chambray-western-shirt',
    source: path.join(productsDir, 'candidates', 'test-shirt-button.jpg')
  },
  {
    id: '13',
    name: 'Custom Tailored Chino Trousers',
    category: 'Jeans & Pants',
    folder: 'pants',
    slug: 'custom-tailored-chino-trousers',
    source: path.join(productsDir, 'candidates', 'chinos-check.jpg')
  },
  {
    id: '12',
    name: 'Straight Leg Raw Denim Jeans',
    category: 'Jeans & Pants',
    folder: 'jeans',
    slug: 'straight-leg-raw-denim-jeans',
    source: path.join(productsDir, 'candidates', 'raw-jeans-check.jpg')
  },
  {
    id: 'pants-7',
    name: 'Utility Multi-Pocket Cargo Pants',
    category: 'Jeans & Pants',
    folder: 'pants',
    slug: 'utility-multi-pocket-cargo-pants',
    source: path.join(productsDir, 'candidates', 'test-cargo-pants.jpg')
  },
  {
    id: 'dress-2',
    name: 'Cotton Tiered Midi Dress',
    category: 'Dresses',
    folder: 'dresses',
    slug: 'cotton-tiered-midi-dress',
    source: path.join(productsDir, 'categories', 'jumpsuit.jpg')
  },
  {
    id: 'dress-3',
    name: 'Linen Resort Summer Dress',
    category: 'Dresses',
    folder: 'dresses',
    slug: 'linen-resort-summer-dress',
    source: path.join(productsDir, 'candidates', 'dress-real-2.jpg')
  },
  {
    id: 'dress-4',
    name: 'Floral Wrap Maxi Dress',
    category: 'Dresses',
    folder: 'dresses',
    slug: 'floral-wrap-maxi-dress',
    source: path.join(productsDir, 'candidates', 'dress-real-1.jpg')
  },
  {
    id: 'dress-6',
    name: 'Satin Halter Evening Gown',
    category: 'Dresses',
    folder: 'dresses',
    slug: 'satin-halter-evening-gown',
    source: path.join(productsDir, 'categories', 'dress.jpg')
  },
  {
    id: 'dress-7',
    name: 'Ribbed Knit Bodycon Dress',
    category: 'Dresses',
    folder: 'dresses',
    slug: 'ribbed-knit-bodycon-dress',
    source: path.join(productsDir, 'candidates', 'dress-real-3.jpg')
  },
  {
    id: '10',
    name: 'Classic Trucker Denim Jacket',
    category: 'Jackets',
    folder: 'jackets',
    slug: 'classic-trucker-denim-jacket',
    source: path.join(productsDir, 'candidates', 'denim-jacket-real-2.jpg')
  },
  {
    id: 'jacket-2',
    name: 'Lightweight Nylon Bomber Jacket',
    category: 'Jackets',
    folder: 'jackets',
    slug: 'lightweight-nylon-bomber-jacket',
    source: path.join(productsDir, 'candidates', 'bomber-check.jpg')
  },
  {
    id: 'jacket-3',
    name: 'Textured Leather-Look Moto Jacket',
    category: 'Jackets',
    folder: 'jackets',
    slug: 'textured-leather-look-moto-jacket',
    source: path.join(productsDir, 'categories', 'jacket.jpg')
  },
  {
    id: '11',
    name: 'Classic Tailored Wool-Blend Blazer',
    category: 'Jackets',
    folder: 'blazers',
    slug: 'classic-tailored-wool-blend-blazer',
    source: path.join(productsDir, 'categories', 'blazer.jpg')
  },
  {
    id: 'jacket-7',
    name: 'Multi-Pocket Field Utility Jacket',
    category: 'Jackets',
    folder: 'jackets',
    slug: 'multi-pocket-field-utility-jacket',
    source: path.join(productsDir, 'categories', 'winter-wear.jpg')
  },
  {
    id: 'women-ribbed-cotton-crop-top',
    name: 'Ribbed Cotton Crop Top',
    category: 'Tops',
    folder: 'other',
    slug: 'ribbed-graphic-crop-top',
    source: path.join(productsDir, 'categories', 'top.jpg')
  },
  {
    id: 'women-a-line-corduroy-mini-skirt',
    name: 'A-Line Corduroy Mini Skirt',
    category: 'Skirts',
    folder: 'other',
    slug: 'flared-aline-mini-skirt',
    source: path.join(productsDir, 'categories', 'skirt.jpg')
  },
  {
    id: 'men-regal-vest-trouser-three-piece-suit',
    name: 'Regal Vest & Trouser Three-Piece Suit',
    category: 'Suits & Tailoring',
    folder: 'blazers',
    slug: 'tailored-3piece-windowpane-suit',
    source: path.join(productsDir, 'categories', 'shirt.jpg')
  },
  {
    id: 'unisex-classic-heavyweight-loopback-sweatshirt',
    name: 'Classic Heavyweight Loopback Sweatshirt',
    category: 'Hoodies',
    folder: 'hoodies',
    slug: 'streetwear-loopback-sweatshirt',
    source: path.join(productsDir, 'categories', 'sweatshirt.jpg')
  },
  {
    id: 'women-kanjivaram-pure-silk-zari-saree',
    name: 'Kanjivaram Pure Silk Zari Saree',
    category: 'Traditional Wear',
    folder: 'traditional',
    slug: 'kanjivaram-silk-bridal-saree',
    source: path.join(productsDir, 'candidates', 'ethnic-real-3.jpg')
  },
  {
    id: 'women-ready-to-wear-pleated-saree',
    name: 'Ready-to-Wear Pleated Saree',
    category: 'Traditional Wear',
    folder: 'traditional',
    slug: 'handloom-zari-silk-saree',
    source: path.join(productsDir, 'candidates', 'ethnic-real-1.jpg')
  }
];

// ── 2. Convert and Install Local Images ───────────────────────────────────────
async function installVerifiedPhotos() {
  console.log('Optimizing and installing verified authentic fashion photography...');
  for (const g of VERIFIED_REAL_GARMENTS) {
    const destDir = path.join(productsDir, g.folder);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const webpPath = path.join(destDir, `${g.slug}.webp`);
    const jpgPath = path.join(destDir, `${g.slug}.jpg`);

    if (!fs.existsSync(g.source)) {
      console.error(`[ERROR] Missing source file: ${g.source}`);
      continue;
    }

    const buf = fs.readFileSync(g.source);

    await sharp(buf)
      .resize(800, 1000, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toFile(webpPath);

    await sharp(buf)
      .resize(800, 1000, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 85 })
      .toFile(jpgPath);

    console.log(`[INSTALLED] ${g.name} -> /products/${g.folder}/${g.slug}.webp`);
  }
}

installVerifiedPhotos();
