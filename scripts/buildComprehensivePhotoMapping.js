import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const frontendDir = path.join(projectRoot, 'frontend');
const publicProductsDir = path.join(frontendDir, 'public', 'products');

import sharp from 'sharp';

// Dynamic imports of catalog data
const { MOCK_PRODUCTS } = await import(pathToFileURL(path.join(frontendDir, 'src', 'data', 'mockProducts.js')).href);
const { EXPANDED_MEN_PRODUCTS } = await import(pathToFileURL(path.join(frontendDir, 'src', 'data', 'expandedMenProducts.js')).href);
const { EXPANDED_WOMEN_PRODUCTS } = await import(pathToFileURL(path.join(frontendDir, 'src', 'data', 'expandedWomenProducts.js')).href);
const { EXPANDED_ETHNIC_PRODUCTS } = await import(pathToFileURL(path.join(frontendDir, 'src', 'data', 'expandedEthnicProducts.js')).href);
const { EXPANDED_SPORTS_SEASONAL_PRODUCTS } = await import(pathToFileURL(path.join(frontendDir, 'src', 'data', 'expandedSportsSeasonalProducts.js')).href);
const { EXPANDED_KIDS_PRODUCTS } = await import(pathToFileURL(path.join(frontendDir, 'src', 'data', 'expandedKidsProducts.js')).href);

async function downloadAndOptimize(url, destWebp, destJpg) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());

    const dir = path.dirname(destWebp);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    await sharp(buf)
      .resize(800, 1000, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toFile(destWebp);

    await sharp(buf)
      .resize(800, 1000, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 85 })
      .toFile(destJpg);

    return true;
  } catch (err) {
    console.warn(`Failed to download ${url}:`, err.message);
    return false;
  }
}

async function run() {
  console.log('Building authentic realistic photo catalog...');
  console.log('Total catalog products:', MOCK_PRODUCTS.length);

  // 1. Build pool of known verified real photo URLs
  const verifiedSources = new Map(); // id or slug or name -> photoUrl

  // From expanded files:
  const allExpanded = [
    ...EXPANDED_MEN_PRODUCTS,
    ...EXPANDED_WOMEN_PRODUCTS,
    ...EXPANDED_ETHNIC_PRODUCTS,
    ...EXPANDED_SPORTS_SEASONAL_PRODUCTS,
    ...EXPANDED_KIDS_PRODUCTS
  ];

  for (const item of allExpanded) {
    if (item.image && (item.image.includes('unsplash.com') || item.image.includes('pexels.com'))) {
      verifiedSources.set(item.id, item.image);
      verifiedSources.set(item.slug, item.image);
      verifiedSources.set(item.name.toLowerCase().trim(), item.image);
    }
  }

  console.log('Verified authentic photo sources available:', verifiedSources.size);
}

run();
