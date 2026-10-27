import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyPaths() {
  const mapUrl = pathToFileURL(path.resolve(__dirname, '../frontend/src/data/productImageMap.js')).href;
  const { PRODUCT_IMAGE_MAP } = await import(mapUrl);
  const catalogPath = path.resolve(__dirname, '../frontend/src/data/completeFashionCatalog.js');
  const catalogUrl = pathToFileURL(catalogPath).href;
  const { COMPLETE_FASHION_CATALOG } = await import(catalogUrl);

  let updatedCount = 0;
  const updatedCatalog = COMPLETE_FASHION_CATALOG.map((prod) => {
    const mapEntry = PRODUCT_IMAGE_MAP[String(prod.id)];
    if (mapEntry) {
      updatedCount++;
      return {
        ...prod,
        image: mapEntry.image,
        thumbnail: mapEntry.thumbnail,
        images: mapEntry.gallery && mapEntry.gallery.length > 0 ? mapEntry.gallery : [mapEntry.image]
      };
    }
    return prod;
  });

  const fileContent = `/**
 * FITFUSION COMPLETE FASHION CATALOG
 * Mapped to central realistic product photography in /products/
 */

export const COMPLETE_FASHION_CATALOG = ${JSON.stringify(updatedCatalog, null, 2)};
`;

  fs.writeFileSync(catalogPath, fileContent, 'utf8');
  console.log(`Updated ${updatedCount} products in completeFashionCatalog.js`);
}

applyPaths().catch(console.error);
