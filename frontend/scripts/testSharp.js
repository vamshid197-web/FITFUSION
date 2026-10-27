import sharp from 'sharp';

async function test() {
  const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="#1e293b"/>
    <circle cx="100" cy="100" r="50" fill="#38bdf8"/>
  </svg>`;
  const buf = await sharp(Buffer.from(svg)).webp({ quality: 90 }).toBuffer();
  console.log('Sharp WebP generated successfully, size:', buf.length, 'bytes');
}

test();
