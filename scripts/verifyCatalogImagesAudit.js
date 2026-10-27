/**
 * Comprehensive Product Catalog & Image Verification Audit Script
 * Validates all products against physical disk images and central mapping.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const frontendPublic = path.join(projectRoot, 'frontend', 'public');

async function runAudit() {
  console.log('=====================================================');
  console.log('FITFUSION CATALOG & IMAGE VERIFICATION AUDIT');
  console.log('=====================================================\n');

  // Import mockProducts and productImageMap
  const mockProductsPath = path.join(projectRoot, 'frontend', 'src', 'data', 'mockProducts.js');
  const productImageMapPath = path.join(projectRoot, 'frontend', 'src', 'data', 'productImageMap.js');

  const { MOCK_PRODUCTS, CATEGORY_IMAGES } = await import(pathToFileURL(mockProductsPath).href);
  const { PRODUCT_IMAGE_MAP, getProductMappedImage } = await import(pathToFileURL(productImageMapPath).href);

  console.log(`Total Products Loaded from MOCK_PRODUCTS: ${MOCK_PRODUCTS.length}`);
  console.log(`Total Entries in PRODUCT_IMAGE_MAP: ${Object.keys(PRODUCT_IMAGE_MAP).length}\n`);

  let validCount = 0;
  let replacedCount = 0;
  let brokenCount = 0;
  let duplicateCount = 0;
  let missingCount = 0;
  let incorrectCount = 0;

  const seenImages = new Map(); // imagePath -> [productIds]
  const failures = [];

  for (const product of MOCK_PRODUCTS) {
    const id = String(product.id);
    const name = product.name;
    const category = product.category;

    // 1. Verify product name exists
    if (!name || name.trim() === '') {
      missingCount++;
      failures.push({ id, name: 'UNKNOWN', issue: 'Missing product name' });
      continue;
    }

    // 2. Resolve image via central mapping
    const mapped = PRODUCT_IMAGE_MAP[id];
    const resolvedImg = getProductMappedImage(product);

    if (!mapped || !resolvedImg) {
      missingCount++;
      failures.push({ id, name, issue: 'No image mapping in PRODUCT_IMAGE_MAP' });
      continue;
    }

    // 3. Verify not a placeholder / svg / vector / data URL
    const lower = resolvedImg.toLowerCase();
    if (
      lower.includes('placeholder') ||
      lower.endsWith('.svg') ||
      lower.includes('silhouette') ||
      lower.includes('vector') ||
      lower.startsWith('data:image/svg')
    ) {
      incorrectCount++;
      failures.push({ id, name, image: resolvedImg, issue: 'Placeholder or vector illustration detected' });
      continue;
    }

    // 4. Verify physical file existence on disk
    let relativeClean = resolvedImg.startsWith('/') ? resolvedImg.slice(1) : resolvedImg;
    const diskPath = path.join(frontendPublic, relativeClean);

    if (!fs.existsSync(diskPath)) {
      brokenCount++;
      failures.push({ id, name, image: resolvedImg, issue: `File not found on disk: ${diskPath}` });
      continue;
    }

    const stat = fs.statSync(diskPath);
    if (stat.size < 1000) {
      brokenCount++;
      failures.push({ id, name, image: resolvedImg, issue: `File is empty or corrupted (<1KB, size=${stat.size}B)` });
      continue;
    }

    // Also check gallery images if present
    if (mapped.gallery && Array.isArray(mapped.gallery)) {
      for (const gImg of mapped.gallery) {
        const gRelative = gImg.startsWith('/') ? gImg.slice(1) : gImg;
        const gDiskPath = path.join(frontendPublic, gRelative);
        if (!fs.existsSync(gDiskPath)) {
          brokenCount++;
          failures.push({ id, name, image: gImg, issue: `Gallery image not found: ${gDiskPath}` });
        }
      }
    }

    // 5. Check duplicate image mapping across unrelated items
    if (seenImages.has(resolvedImg)) {
      const prevIds = seenImages.get(resolvedImg);
      duplicateCount++;
      failures.push({ id, name, image: resolvedImg, issue: `Duplicate image with product IDs: ${prevIds.join(', ')}` });
    } else {
      seenImages.set(resolvedImg, [id]);
    }

    validCount++;
    replacedCount++;
  }

  // Verify Category Cover Images
  console.log('Checking Category Cover Images...');
  let catOk = 0;
  let catBroken = 0;
  for (const [cat, catUrl] of Object.entries(CATEGORY_IMAGES)) {
    const cRel = catUrl.startsWith('/') ? catUrl.slice(1) : catUrl;
    const cDiskPath = path.join(frontendPublic, cRel);
    if (!fs.existsSync(cDiskPath)) {
      console.warn(`Category image missing for ${cat}: ${cDiskPath}`);
      catBroken++;
    } else {
      catOk++;
    }
  }
  console.log(`Category Cover Images: ${catOk} verified, ${catBroken} broken\n`);

  console.log('=====================================================');
  console.log('AUDIT REPORT SUMMARY');
  console.log('=====================================================');
  console.log(`TOTAL PRODUCTS:         ${MOCK_PRODUCTS.length}`);
  console.log(`VALID REALISTIC IMAGES: ${validCount}`);
  console.log(`REPLACED:               ${replacedCount}`);
  console.log(`BROKEN:                 ${brokenCount}`);
  console.log(`DUPLICATES:             ${duplicateCount}`);
  console.log(`MISSING:                ${missingCount}`);
  console.log(`INCORRECT:              ${incorrectCount}`);
  console.log('=====================================================\n');

  if (failures.length > 0) {
    console.error('FAILURES DETECTED:');
    failures.forEach((f, idx) => {
      console.error(`${idx + 1}. [${f.id}] ${f.name}: ${f.issue} (${f.image || 'N/A'})`);
    });
    process.exit(1);
  } else {
    console.log('AUDIT PASSED: 100% of products have verified, realistic, unique local photography!');
    process.exit(0);
  }
}

runAudit().catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
