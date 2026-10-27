import fs from 'fs';
import path from 'path';
import { VERIFIED_REAL_GARMENTS } from './applyFinalImageAudit.js';

const frontendDir = path.resolve('.');
const srcDataDir = path.join(frontendDir, 'src', 'data');
const mockProductsPath = path.join(srcDataDir, 'mockProducts.js');
const completeCatalogPath = path.join(srcDataDir, 'completeFashionCatalog.js');
const imageMapPath = path.join(srcDataDir, 'productImageMap.js');

// Map of verified products by ID
const verifiedById = new Map();
for (const item of VERIFIED_REAL_GARMENTS) {
  verifiedById.set(String(item.id), item);
}

// Read current complete catalog and mock products
async function buildAuthoritativeMap() {
  console.log('Building Authoritative Product Image Map...');

  // Import existing catalogs
  const { COMPLETE_FASHION_CATALOG } = await import('../src/data/completeFashionCatalog.js');
  const mockMod = await import('../src/data/mockProducts.js');
  const allProducts = mockMod.MOCK_PRODUCTS;

  console.log(`Total Products to Audit & Map: ${allProducts.length}`);

  const authoritativeMap = {};
  let realisticCount = 0;
  let requiredCount = 0;
  const imageRequiredList = [];

  for (const p of allProducts) {
    const idStr = String(p.id);
    const verified = verifiedById.get(idStr);

    if (verified) {
      const imgPath = `/products/${verified.folder}/${verified.slug}.webp`;
      authoritativeMap[idStr] = {
        id: idStr,
        name: p.name,
        slug: verified.slug || p.slug,
        category: p.category,
        subcategory: p.subcategory || p.category,
        gender: p.gender || 'Unisex',
        folder: verified.folder,
        image: imgPath,
        thumbnail: imgPath,
        gallery: [imgPath],
        isRealistic: true,
        imageRequired: false,
        status: 'VERIFIED_REALISTIC',
        reason: 'Verified authentic fashion photography matching exact garment type and details.'
      };
      realisticCount++;
    } else {
      authoritativeMap[idStr] = {
        id: idStr,
        name: p.name,
        slug: p.slug,
        category: p.category,
        subcategory: p.subcategory || p.category,
        gender: p.gender || 'Unisex',
        image: null,
        thumbnail: null,
        gallery: [],
        isRealistic: false,
        imageRequired: true,
        status: 'IMAGE_REQUIRED',
        reason: '2D SVG vector flat / mismatched stock photo removed. Real studio photograph required.'
      };
      requiredCount++;
      imageRequiredList.push({
        id: idStr,
        name: p.name,
        category: p.category,
        reason: 'Previous 2D vector flat removed per Phase 5. Needs authentic fashion photography.'
      });
    }
  }

  console.log(`\nAudit Classification:`);
  console.log(`  VERIFIED REALISTIC IMAGES: ${realisticCount}`);
  console.log(`  IMAGE_REQUIRED (2D removed / missing photo): ${requiredCount}`);

  // Write new productImageMap.js
  const imageMapFileContent = `/**
 * FITFUSION Authoritative Central Product Image Mapping
 * Single Source of Truth for Product Imagery across entire application.
 *
 * Total Products: ${allProducts.length}
 * Verified Realistic Photography: ${realisticCount}
 * Image Required (2D / mismatched removed): ${requiredCount}
 */

export const PRODUCT_IMAGE_MAP = ${JSON.stringify(authoritativeMap, null, 2)};

/**
 * Authoritative Image Resolver
 * Resolves the realistic photograph for a product ID or product object.
 * Returns null if the product is marked as imageRequired: true.
 */
export function getProductMappedImage(productOrId) {
  if (!productOrId) return null;
  const id = typeof productOrId === 'object' ? String(productOrId.id) : String(productOrId);
  const entry = PRODUCT_IMAGE_MAP[id];
  if (!entry) return null;
  if (entry.imageRequired || !entry.isRealistic) return null;
  return entry.image || null;
}

/**
 * Authoritative Gallery Resolver
 */
export function getProductGallery(productOrId) {
  if (!productOrId) return [];
  const id = typeof productOrId === 'object' ? String(productOrId.id) : String(productOrId);
  const entry = PRODUCT_IMAGE_MAP[id];
  if (!entry || entry.imageRequired || !entry.isRealistic) return [];
  return Array.isArray(entry.gallery) && entry.gallery.length > 0 ? entry.gallery : (entry.image ? [entry.image] : []);
}

/**
 * Check if a product requires an image
 */
export function isProductImageRequired(productOrId) {
  if (!productOrId) return true;
  const id = typeof productOrId === 'object' ? String(productOrId.id) : String(productOrId);
  const entry = PRODUCT_IMAGE_MAP[id];
  return !entry || entry.imageRequired === true || !entry.isRealistic;
}

export default PRODUCT_IMAGE_MAP;
`;

  fs.writeFileSync(imageMapPath, imageMapFileContent, 'utf8');
  console.log(`Updated ${imageMapPath}`);

  // Save the audit list for reporting
  const auditReportJsonPath = path.join(frontendDir, 'scripts', 'imageAuditResult.json');
  fs.writeFileSync(auditReportJsonPath, JSON.stringify({
    totalProducts: allProducts.length,
    verifiedRealistic: realisticCount,
    imageRequired: requiredCount,
    items: imageRequiredList
  }, null, 2), 'utf8');
  console.log(`Saved audit list to ${auditReportJsonPath}`);
}

buildAuthoritativeMap();
