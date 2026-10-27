import { execSync } from 'child_process';

const content = execSync('git show 34c4853:frontend/src/data/mockProducts.js', { encoding: 'utf-8' });
const lines = content.split('\n');

const products = [];
let current = {};
for (const line of lines) {
  const idMatch = line.match(/id:\s*['"]([^'"]+)['"]/);
  if (idMatch) current.id = idMatch[1];

  const nameMatch = line.match(/name:\s*['"]([^'"]+)['"]/);
  if (nameMatch) current.name = nameMatch[1];

  const catMatch = line.match(/category:\s*['"]([^'"]+)['"]/);
  if (catMatch) current.category = catMatch[1];

  const imgMatch = line.match(/image:\s*['"]([^'"]+)['"]/);
  if (imgMatch) {
    current.image = imgMatch[1];
    if (current.id && current.name) {
      products.push({ ...current });
      current = {};
    }
  }
}

console.log('Total products extracted from commit 34c4853:', products.length);
products.slice(0, 15).forEach(p => console.log(p.id, '|', p.name, '|', p.category, '|', p.image));
