import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MOCK_PRODUCTS, CATEGORY_GROUPS, CLOTHING_CATEGORIES } from '../src/data/mockProducts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Original MOCK_PRODUCTS count:', MOCK_PRODUCTS.length);
console.log('CLOTHING_CATEGORIES:', CLOTHING_CATEGORIES);
console.log('CATEGORY_GROUPS keys:', Object.keys(CATEGORY_GROUPS));
