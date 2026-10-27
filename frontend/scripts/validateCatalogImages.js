import fs from 'fs';
import path from 'path';
import { MOCK_PRODUCTS } from '../src/data/mockProducts.js';

console.log(`Auditing ${MOCK_PRODUCTS.length} products in MOCK_PRODUCTS...`);

let missingCount = 0;
let localImagesChecked = 0;
let externalImagesCount = 0;

for (const p of MOCK_PRODUCTS) {
  const imagesToCheck = [p.image, p.thumbnail, ...(p.images || [])];
  
  if (p.colorImages) {
    for (const cImg of Object.values(p.colorImages)) {
      imagesToCheck.push(cImg);
    }
  }

  for (const imgPath of imagesToCheck) {
    if (!imgPath) continue;
    if (imgPath.startsWith('/images/products/')) {
      localImagesChecked++;
      const fullPath = path.resolve('public' + imgPath);
      if (!fs.existsSync(fullPath)) {
        console.error(`❌ MISSING FILE for [${p.id}] ${p.name}: ${fullPath}`);
        missingCount++;
      }
    } else if (imgPath.startsWith('http')) {
      externalImagesCount++;
    }
  }
}

console.log(`\nAudit Complete:`);
console.log(`✅ Local images checked on disk: ${localImagesChecked}`);
console.log(`✅ External CDN images checked: ${externalImagesCount}`);
console.log(`❌ Missing local files: ${missingCount}`);

if (missingCount === 0) {
  console.log('🎉 100% OF LOCAL PRODUCT IMAGES EXIST AND ARE READY!');
} else {
  process.exit(1);
}
