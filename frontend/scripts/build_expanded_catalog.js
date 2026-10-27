// Script to assemble and validate the expanded FITFUSION catalog
const fs = require('fs');
const path = require('path');

// 1. Read existing mockProducts.js
const mockProductsPath = path.join(__dirname, '../src/data/mockProducts.js');
const rawSource = fs.readFileSync(mockProductsPath, 'utf8');

// 2. Load existing MOCK_PRODUCTS from the file
const existingModule = require(mockProductsPath);
const originalProducts = existingModule.MOCK_PRODUCTS;
console.log('Original products count:', originalProducts.length);
if (originalProducts.length !== 56) {
  console.error('ERROR: Original products count is not 56!');
  process.exit(1);
}

// Map existing IDs and names to prevent duplicates
const existingIdSet = new Set(originalProducts.map(p => String(p.id).toLowerCase()));
const existingNameSet = new Set(originalProducts.map(p => p.name.toLowerCase().trim()));

console.log('Existing IDs:', existingIdSet.size);
console.log('Existing Names:', existingNameSet.size);
