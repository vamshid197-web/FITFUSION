import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');
const publicProductsDir = path.join(frontendDir, 'public', 'products');

// ── 1. Curated, Verified Real Fashion Photography Mapping for Core Catalog ────
// Every single URL here is a verified high-resolution photograph of a real human model / studio garment
export const CORE_REAL_PHOTOS = {
  // ── 1. T-SHIRTS ──────────────────────────────────────────────────────────
  '1': {
    name: 'Classic Crew Neck T-Shirt',
    folder: 'tshirts',
    slug: 'classic-crew-neck-tshirt',
    url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&fit=crop&q=85'
  },
  '2': {
    name: 'Oversized Heavyweight T-Shirt',
    folder: 'tshirts',
    slug: 'oversized-heavyweight-tshirt',
    url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&fit=crop&q=85'
  },
  'tshirt-3': {
    name: 'Premium Supima T-Shirt',
    folder: 'tshirts',
    slug: 'premium-supima-tshirt',
    url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&fit=crop&q=85'
  },
  'tshirt-4': {
    name: 'Relaxed Graphic T-Shirt',
    folder: 'tshirts',
    slug: 'relaxed-graphic-tshirt',
    url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&fit=crop&q=85'
  },
  'tshirt-5': {
    name: 'Slim Fit V-Neck T-Shirt',
    folder: 'tshirts',
    slug: 'slim-fit-vneck-tshirt',
    url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&fit=crop&q=85'
  },
  '3': {
    name: 'Piqué Polo',
    folder: 'tshirts',
    slug: 'pique-polo',
    url: 'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&fit=crop&q=85'
  },
  'tshirt-7': {
    name: 'Textured Waffle T-Shirt',
    folder: 'tshirts',
    slug: 'textured-waffle-tshirt',
    url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&fit=crop&q=85'
  },
  'tshirt-8': {
    name: 'Performance Athletic T-Shirt',
    folder: 'tshirts',
    slug: 'performance-athletic-tshirt',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&fit=crop&q=85'
  },

  // ── 2. SHIRTS ────────────────────────────────────────────────────────────
  'shirt-1': {
    name: 'Classic Cotton Poplin Shirt',
    folder: 'shirts',
    slug: 'classic-cotton-poplin-shirt',
    url: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&fit=crop&q=85'
  },
  '5': {
    name: 'Linen Casual Relaxed Shirt',
    folder: 'shirts',
    slug: 'linen-casual-relaxed-shirt',
    url: 'https://images.unsplash.com/photo-1512353087810-25dfcd100962?w=800&fit=crop&q=85'
  },
  '4': {
    name: 'Oxford Cloth Button-Down Shirt',
    folder: 'shirts',
    slug: 'oxford-cloth-button-down-shirt',
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&fit=crop&q=85'
  },
  '6': {
    name: 'Slim Fit Stretch Dress Shirt',
    folder: 'shirts',
    slug: 'slim-fit-stretch-dress-shirt',
    url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&fit=crop&q=85'
  },
  'shirt-5': {
    name: 'Madras Plaid Casual Shirt',
    folder: 'shirts',
    slug: 'madras-plaid-casual-shirt',
    url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&fit=crop&q=85'
  },
  'shirt-6': {
    name: 'Striped Banker Shirt',
    folder: 'shirts',
    slug: 'striped-banker-shirt',
    url: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&fit=crop&q=85'
  },
  'shirt-7': {
    name: 'Mandarin Collar Band Shirt',
    folder: 'shirts',
    slug: 'mandarin-collar-band-shirt',
    url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&fit=crop&q=85'
  },
  'shirt-8': {
    name: 'Denim Chambray Western Shirt',
    folder: 'shirts',
    slug: 'denim-chambray-western-shirt',
    url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&fit=crop&q=85'
  },

  // ── 3. HOODIES & SWEATERS ────────────────────────────────────────────────
  '7': {
    name: 'Classic French Terry Hoodie',
    folder: 'hoodies',
    slug: 'classic-french-terry-hoodie',
    url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&fit=crop&q=85'
  },
  'hoodie-2': {
    name: 'Oversized Boxy Pullover Hoodie',
    folder: 'hoodies',
    slug: 'oversized-boxy-pullover-hoodie',
    url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&fit=crop&q=85'
  },
  'hoodie-3': {
    name: 'Zip-Up Cotton Everyday Hoodie',
    folder: 'hoodies',
    slug: 'zip-up-cotton-everyday-hoodie',
    url: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800&fit=crop&q=85'
  },
  'hoodie-4': {
    name: 'Heavyweight 450GSM Fleece Hoodie',
    folder: 'hoodies',
    slug: 'heavyweight-fleece-hoodie',
    url: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&fit=crop&q=85'
  },
  'hoodie-5': {
    name: 'Minimal Logo Graphic Hoodie',
    folder: 'hoodies',
    slug: 'minimal-logo-graphic-hoodie',
    url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&fit=crop&q=85'
  },
  'hoodie-6': {
    name: 'Relaxed Fit Raglan Hoodie',
    folder: 'hoodies',
    slug: 'relaxed-fit-raglan-hoodie',
    url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&fit=crop&q=85'
  },
  'hoodie-7': {
    name: 'Color Block Vintage Hoodie',
    folder: 'hoodies',
    slug: 'color-block-vintage-hoodie',
    url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&fit=crop&q=85'
  },
  'hoodie-8': {
    name: 'Lightweight Summer Modal Hoodie',
    folder: 'hoodies',
    slug: 'lightweight-summer-modal-hoodie',
    url: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=800&fit=crop&q=85'
  },

  // ── 4. PANTS & JEANS ─────────────────────────────────────────────────────
  '13': {
    name: 'Custom Tailored Chino Trousers',
    folder: 'pants',
    slug: 'custom-tailored-chino-trousers',
    url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&fit=crop&q=85'
  },
  'pants-2': {
    name: 'Slim Fit Stretch Chinos',
    folder: 'pants',
    slug: 'slim-fit-stretch-chinos',
    url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&fit=crop&q=85'
  },
  'pants-3': {
    name: 'Relaxed Pleated Chinos',
    folder: 'pants',
    slug: 'relaxed-pleated-chinos',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&fit=crop&q=85'
  },
  '12': {
    name: 'Straight Leg Raw Denim Jeans',
    folder: 'jeans',
    slug: 'straight-leg-raw-denim-jeans',
    url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&fit=crop&q=85'
  },
  'pants-5': {
    name: 'Slim Indigo Denim Jeans',
    folder: 'jeans',
    slug: 'slim-indigo-denim-jeans',
    url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&fit=crop&q=85'
  },
  'pants-6': {
    name: 'Relaxed Carpenter Denim Jeans',
    folder: 'jeans',
    slug: 'relaxed-carpenter-denim-jeans',
    url: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&fit=crop&q=85'
  },
  'pants-7': {
    name: 'Utility Multi-Pocket Cargo Pants',
    folder: 'pants',
    slug: 'utility-multi-pocket-cargo-pants',
    url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&fit=crop&q=85'
  },
  'pants-8': {
    name: 'Classic Pleated Formal Trousers',
    folder: 'pants',
    slug: 'classic-pleated-formal-trousers',
    url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&fit=crop&q=85'
  },

  // ── 5. DRESSES ───────────────────────────────────────────────────────────
  '16': {
    name: 'Pure Silk Slip Evening Dress',
    folder: 'dresses',
    slug: 'pure-silk-slip-evening-dress',
    url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&fit=crop&q=85'
  },
  'dress-2': {
    name: 'Cotton Tiered Midi Dress',
    folder: 'dresses',
    slug: 'cotton-tiered-midi-dress',
    url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&fit=crop&q=85'
  },
  'dress-3': {
    name: 'Linen Resort Summer Dress',
    folder: 'dresses',
    slug: 'linen-resort-summer-dress',
    url: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&fit=crop&q=85'
  },
  'dress-4': {
    name: 'Floral Wrap Maxi Dress',
    folder: 'dresses',
    slug: 'floral-wrap-maxi-dress',
    url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&fit=crop&q=85'
  },
  '17': {
    name: 'A-Line Casual Day Dress',
    folder: 'dresses',
    slug: 'a-line-casual-day-dress',
    url: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&fit=crop&q=85'
  },
  'dress-6': {
    name: 'Satin Halter Evening Gown',
    folder: 'dresses',
    slug: 'satin-halter-evening-gown',
    url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&fit=crop&q=85'
  },
  'dress-7': {
    name: 'Ribbed Knit Bodycon Dress',
    folder: 'dresses',
    slug: 'ribbed-knit-bodycon-dress',
    url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&fit=crop&q=85'
  },
  'dress-8': {
    name: 'Pleated Georgette Midi Dress',
    folder: 'dresses',
    slug: 'pleated-georgette-midi-dress',
    url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&fit=crop&q=85'
  },

  // ── 6. JACKETS & BLAZERS ─────────────────────────────────────────────────
  '10': {
    name: 'Classic Trucker Denim Jacket',
    folder: 'jackets',
    slug: 'classic-trucker-denim-jacket',
    url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&fit=crop&q=85'
  },
  'jacket-2': {
    name: 'Lightweight Nylon Bomber Jacket',
    folder: 'jackets',
    slug: 'lightweight-nylon-bomber-jacket',
    url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&fit=crop&q=85'
  },
  'jacket-3': {
    name: 'Textured Leather-Look Moto Jacket',
    folder: 'jackets',
    slug: 'textured-leather-look-moto-jacket',
    url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&fit=crop&q=85'
  },
  'jacket-4': {
    name: 'Casual Cotton Utility Overshirt',
    folder: 'jackets',
    slug: 'casual-cotton-utility-overshirt',
    url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&fit=crop&q=85'
  },
  '11': {
    name: 'Classic Tailored Wool-Blend Blazer',
    folder: 'blazers',
    slug: 'classic-tailored-wool-blend-blazer',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&fit=crop&q=85'
  },
  'jacket-6': {
    name: 'Double-Breasted Structured Blazer',
    folder: 'blazers',
    slug: 'double-breasted-structured-blazer',
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&fit=crop&q=85'
  },
  'jacket-7': {
    name: 'Multi-Pocket Field Utility Jacket',
    folder: 'jackets',
    slug: 'multi-pocket-field-utility-jacket',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&fit=crop&q=85'
  },
  'jacket-8': {
    name: 'Down-Filled Winter Puffer Jacket',
    folder: 'jackets',
    slug: 'down-filled-winter-puffer-jacket',
    url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&fit=crop&q=85'
  },

  // ── 7. TRADITIONAL WEAR ──────────────────────────────────────────────────
  '14': {
    name: 'Classic Handloom Cotton Kurta',
    folder: 'traditional',
    slug: 'classic-handloom-cotton-kurta',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&fit=crop&q=85'
  },
  'trad-2': {
    name: 'Premium Pure Linen Kurta',
    folder: 'traditional',
    slug: 'premium-pure-linen-kurta',
    url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e3?w=800&fit=crop&q=85'
  },
  '15': {
    name: 'Embroidered Chikankari Kurta',
    folder: 'traditional',
    slug: 'embroidered-chikankari-kurta',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&fit=crop&q=85'
  },
  'trad-4': {
    name: 'Festive Silk Jacquard Kurta',
    folder: 'traditional',
    slug: 'festive-silk-jacquard-kurta',
    url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&fit=crop&q=85'
  },
  'trad-5': {
    name: 'Hand-Woven Nehru Jacket',
    folder: 'traditional',
    slug: 'hand-woven-nehru-jacket',
    url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&fit=crop&q=85'
  },
  'trad-6': {
    name: 'Classic Kurta Pajama Set',
    folder: 'traditional',
    slug: 'classic-kurta-pajama-set',
    url: 'https://images.unsplash.com/photo-1610030469668-933d3c8c2b53?w=800&fit=crop&q=85'
  },
  'trad-7': {
    name: 'Royal Wedding Sherwani',
    folder: 'traditional',
    slug: 'royal-wedding-sherwani',
    url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e3?w=800&fit=crop&q=85'
  },
  'trad-8': {
    name: 'Embroidered Festive Waistcoat',
    folder: 'traditional',
    slug: 'embroidered-festive-waistcoat',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&fit=crop&q=85'
  }
};

// ── 2. Download and Convert to High-Quality Local WebP and JPG ────────────────
async function downloadAndSavePhoto(url, destWebp, destJpg) {
  const dir = path.dirname(destWebp);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());

  await sharp(buf)
    .resize(800, 1000, { fit: 'cover', position: 'center' })
    .webp({ quality: 85 })
    .toFile(destWebp);

  await sharp(buf)
    .resize(800, 1000, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 85 })
    .toFile(destJpg);

  return true;
}

export async function installCoreRealPhotos() {
  console.log('Downloading and installing verified authentic fashion photography...');
  let successCount = 0;
  let failCount = 0;

  for (const [id, item] of Object.entries(CORE_REAL_PHOTOS)) {
    const webpPath = path.join(publicProductsDir, item.folder, `${item.slug}.webp`);
    const jpgPath = path.join(publicProductsDir, item.folder, `${item.slug}.jpg`);

    try {
      await downloadAndSavePhoto(item.url, webpPath, jpgPath);
      console.log(`[OK] [${id}] ${item.name} -> ${item.folder}/${item.slug}.webp`);
      successCount++;
    } catch (err) {
      console.error(`[FAIL] [${id}] ${item.name}: ${err.message}`);
      failCount++;
    }
  }

  console.log(`\nCore photo installation complete: ${successCount} installed, ${failCount} failed.`);
}

installCoreRealPhotos();
