import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');
const projectRoot = path.resolve(frontendDir, '..');
const publicProductsDir = path.join(frontendDir, 'public', 'products');

// Dynamic imports of catalog data
const { MOCK_PRODUCTS } = await import(pathToFileURL(path.join(frontendDir, 'src', 'data', 'mockProducts.js')).href);
const { EXPANDED_MEN_PRODUCTS } = await import(pathToFileURL(path.join(frontendDir, 'src', 'data', 'expandedMenProducts.js')).href);
const { EXPANDED_WOMEN_PRODUCTS } = await import(pathToFileURL(path.join(frontendDir, 'src', 'data', 'expandedWomenProducts.js')).href);
const { EXPANDED_ETHNIC_PRODUCTS } = await import(pathToFileURL(path.join(frontendDir, 'src', 'data', 'expandedEthnicProducts.js')).href);
const { EXPANDED_SPORTS_SEASONAL_PRODUCTS } = await import(pathToFileURL(path.join(frontendDir, 'src', 'data', 'expandedSportsSeasonalProducts.js')).href);
const { EXPANDED_KIDS_PRODUCTS } = await import(pathToFileURL(path.join(frontendDir, 'src', 'data', 'expandedKidsProducts.js')).href);

async function run() {
  console.log('Auditing real photographic sources against MOCK_PRODUCTS...');

  const allExpanded = [
    ...EXPANDED_MEN_PRODUCTS,
    ...EXPANDED_WOMEN_PRODUCTS,
    ...EXPANDED_ETHNIC_PRODUCTS,
    ...EXPANDED_SPORTS_SEASONAL_PRODUCTS,
    ...EXPANDED_KIDS_PRODUCTS
  ];

  const sourceById = new Map();
  const sourceBySlug = new Map();
  const sourceByName = new Map();

  for (const item of allExpanded) {
    if (item.image && (item.image.includes('unsplash.com') || item.image.includes('pexels.com'))) {
      sourceById.set(item.id, item.image);
      sourceBySlug.set(item.slug, item.image);
      sourceByName.set(item.name.toLowerCase().trim(), item.image);
    }
  }

  let matchedById = 0;
  let matchedBySlug = 0;
  let matchedByName = 0;
  let unmatched = 0;
  const unmatchedList = [];

  for (const p of MOCK_PRODUCTS) {
    const id = String(p.id);
    const slug = p.slug;
    const name = p.name.toLowerCase().trim();

    if (sourceById.has(id)) {
      matchedById++;
    } else if (sourceBySlug.has(slug)) {
      matchedBySlug++;
    } else if (sourceByName.has(name)) {
      matchedByName++;
    } else {
      unmatched++;
      unmatchedList.push({ id: p.id, name: p.name, category: p.category });
    }
  }

  console.log('Matched by ID:', matchedById);
  console.log('Matched by Slug:', matchedBySlug);
  console.log('Matched by Name:', matchedByName);
  console.log('Total Matched:', matchedById + matchedBySlug + matchedByName);
  console.log('Unmatched count:', unmatched);

  console.log('\nSample Unmatched products:');
  unmatchedList.slice(0, 20).forEach(u => console.log(`  [${u.id}] "${u.name}" (${u.category})`));
}

run();
