import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function run() {
  const { MOCK_PRODUCTS } = await import(pathToFileURL(path.join(projectRoot, 'frontend/src/data/mockProducts.js')).href);

  const hashMap = new Map();
  for (const p of MOCK_PRODUCTS) {
    let imgPath = p.image.startsWith('/') ? p.image.slice(1) : p.image;
    let fullPath = path.join(projectRoot, 'frontend/public', imgPath);
    if (fs.existsSync(fullPath)) {
      const buf = fs.readFileSync(fullPath);
      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      if (!hashMap.has(hash)) {
        hashMap.set(hash, []);
      }
      hashMap.get(hash).push({ id: p.id, name: p.name, category: p.category, image: p.image });
    } else {
      console.log('MISSING ON DISK:', p.id, p.name, p.image);
    }
  }

  let dupGroups = 0;
  let totalDups = 0;
  for (const [hash, prods] of hashMap) {
    if (prods.length > 1) {
      dupGroups++;
      totalDups += prods.length;
      console.log(`\nDUPLICATE GROUP #${dupGroups} (${prods.length} products share identical photo):`);
      prods.forEach(pr => console.log(`  [${pr.id}] "${pr.name}" (${pr.category}) -> ${pr.image}`));
    }
  }
  console.log(`\nTotal duplicate groups: ${dupGroups}`);
  console.log(`Total products involved in duplicate groups: ${totalDups}`);
}

run();
