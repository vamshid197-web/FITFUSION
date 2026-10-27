import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');
const { MOCK_PRODUCTS } = await import(pathToFileURL(path.join(frontendDir, 'src', 'data', 'mockProducts.js')).href);

// Read the list of Unsplash URLs from findExternalPhotoUrls.js
const scriptText = fs.readFileSync(path.join(frontendDir, '../scripts/findExternalPhotoUrls.js'), 'utf-8');
const allExpanded = (await import(pathToFileURL(path.join(frontendDir, 'src', 'data', 'expandedProductsData.js')).href)).ALL_NEW_EXPANDED_PRODUCTS;

console.log('MOCK_PRODUCTS count:', MOCK_PRODUCTS.length);
console.log('ALL_NEW_EXPANDED_PRODUCTS count:', allExpanded.length);

// Check matches between MOCK_PRODUCTS and ALL_NEW_EXPANDED_PRODUCTS by name or keywords
let keywordMatches = 0;
for (const p of MOCK_PRODUCTS) {
  const pName = p.name.toLowerCase();
  const match = allExpanded.find(e => {
    const eName = e.name.toLowerCase();
    return pName === eName || pName.includes(eName) || eName.includes(pName);
  });
  if (match) {
    keywordMatches++;
  }
}

console.log('Keyword/Name matches between MOCK_PRODUCTS and ALL_NEW_EXPANDED_PRODUCTS:', keywordMatches);
