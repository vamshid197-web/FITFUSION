import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const testDir = path.resolve('public/products/candidates');
if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

const candidates = {
  'polo-check': 'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&fit=crop&q=85',
  'oxford-check': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&fit=crop&q=85',
  'linen-check': 'https://images.unsplash.com/photo-1512353087810-25dfcd100962?w=800&fit=crop&q=85',
  'poplin-check': 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&fit=crop&q=85',
  'hoodie-check': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&fit=crop&q=85',
  'denim-jacket-check': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&fit=crop&q=85',
  'raw-jeans-check': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&fit=crop&q=85',
  'chinos-check': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&fit=crop&q=85',
  'kurta-check': 'https://images.unsplash.com/photo-1583391733956-6c78276477e3?w=800&fit=crop&q=85',
  'floral-dress-check': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&fit=crop&q=85',
  'bomber-check': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&fit=crop&q=85',
  'aline-dress-check': 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&fit=crop&q=85',
  'linen-dress-check': 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&fit=crop&q=85',
  'bodycon-dress-check': 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&fit=crop&q=85',
  'pleated-dress-check': 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&fit=crop&q=85'
};

async function downloadCandidates() {
  console.log('Downloading candidate images for visual inspection...');
  for (const [key, url] of Object.entries(candidates)) {
    const dest = path.join(testDir, `${key}.jpg`);
    if (fs.existsSync(dest)) {
      console.log(`[EXISTS] ${key}`);
      continue;
    }
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await sharp(buf)
        .resize(800, 1000, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 85 })
        .toFile(dest);
      console.log(`[SAVED] ${key} -> ${dest}`);
    } catch (e) {
      console.error(`[FAIL] ${key}: ${e.message}`);
    }
  }
}

downloadCandidates();
