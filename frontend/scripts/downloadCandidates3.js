import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const testDir = path.resolve('public/products/candidates');

const candidates = {
  'test-tee-vneck': 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&fit=crop&q=85',
  'test-tee-supima': 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&fit=crop&q=85',
  'test-shirt-plaid': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&fit=crop&q=85',
  'test-shirt-striped': 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&fit=crop&q=85',
  'test-shirt-button': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&fit=crop&q=85',
  'test-kurta-men': 'https://images.unsplash.com/photo-1610030469668-933d3c8c2b53?w=800&fit=crop&q=85',
  'test-traditional-men': 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&fit=crop&q=85',
  'test-cargo-pants': 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&fit=crop&q=85',
  'test-hoodie-men': 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&fit=crop&q=85'
};

async function downloadCandidates3() {
  for (const [key, url] of Object.entries(candidates)) {
    const dest = path.join(testDir, `${key}.jpg`);
    if (fs.existsSync(dest)) continue;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(15000) });
      if (!res.ok) { console.log(`[SKIP] ${key}: HTTP ${res.status}`); continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      await sharp(buf)
        .resize(800, 1000, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 85 })
        .toFile(dest);
      console.log(`[SAVED] ${key}`);
    } catch (e) {
      console.log(`[FAIL] ${key}: ${e.message}`);
    }
  }
}

downloadCandidates3();
