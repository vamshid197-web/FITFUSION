import { MOCK_PRODUCTS } from '../src/data/mockProducts.js';
import { searchProducts } from '../src/services/catalogFilterService.js';

const queries = [
  'black hoodie',
  'women jeans',
  'men formal shirt',
  'red saree',
  'running shoes',
  'oversized t-shirt',
  'lehenga'
];

console.log('Testing Search Queries:');
for (const q of queries) {
  const results = searchProducts(MOCK_PRODUCTS, q);
  console.log(`Query "${q}" => ${results.length} matches. Top 3:`);
  results.slice(0, 3).forEach(r => console.log(`   - ${r.name} [${r.category} | ${r.gender}] (Image: ${r.image})`));
}
