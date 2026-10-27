import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const testDir = path.resolve('public/products/candidates');

// Curated high quality candidates from fashion photographers
const candidates = {
  // Polo shirt with collar:
  'polo-real-1': 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&fit=crop&q=85', // Polo shirt
  'polo-real-2': 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&fit=crop&q=85', // Black tee / polo
  'polo-real-3': 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&fit=crop&q=85', // Polo shirt
  
  // Real hoodie with hood and drawstrings:
  'hoodie-real-1': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&fit=crop&q=85', // Grey hoodie on model
  'hoodie-real-2': 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&fit=crop&q=85', // Black hoodie
  'hoodie-real-3': 'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800&fit=crop&q=85', // Zip hoodie

  // Real Denim Jacket:
  'denim-jacket-real-1': 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&fit=crop&q=85', // Denim jacket / shirt
  'denim-jacket-real-2': 'https://images.unsplash.com/photo-1601333144130-8cbb312386b6?w=800&fit=crop&q=85', // Denim jacket
  'denim-jacket-real-3': 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&fit=crop&q=85', // Denim jacket

  // Traditional Kurta / Sherwani / Ethnic:
  'ethnic-real-1': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&fit=crop&q=85', // Indian ethnic wear
  'ethnic-real-2': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&fit=crop&q=85', // Ethnic wear
  'ethnic-real-3': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&fit=crop&q=85', // Saree / Sherwani

  // Casual Day Dress / Slip Dress:
  'dress-real-1': 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&fit=crop&q=85', // Floral summer dress
  'dress-real-2': 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&fit=crop&q=85', // White summer dress
  'dress-real-3': 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&fit=crop&q=85'  // Evening dress
};

async function downloadCandidates2() {
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

downloadCandidates2();
