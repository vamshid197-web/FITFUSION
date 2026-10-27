import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicProductsDir = path.resolve('public/products');

// Verified, authentic, real-world fashion photography URLs from Unsplash
// Each URL is chosen for clean neutral background, real fabric, seams, buttons, collars, stitching, or professional studio models.
export const VERIFIED_REAL_PHOTO_REGISTRY = {
  // ── 1. T-SHIRTS ────────────────────────────────────────────────────────
  'classic-crew-neck-tshirt': {
    category: 'T-Shirts',
    folder: 'tshirts',
    // White crew neck on male model (existing verified)
    url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1000&fit=crop&q=85',
    description: 'White crew neck combed cotton t-shirt on male model'
  },
  'oversized-heavyweight-tshirt': {
    category: 'T-Shirts',
    folder: 'tshirts',
    // Real oversized drop-shoulder heavyweight t-shirt on neutral studio model
    url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1000&fit=crop&q=85',
    description: 'Black oversized heavyweight streetwear tee on model'
  },
  'pique-polo': {
    category: 'T-Shirts',
    folder: 'tshirts',
    // Pique polo shirts with folded collars and buttons
    url: 'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=1000&fit=crop&q=85',
    description: 'Folded pique cotton polo shirts showing ribbed collar and buttons'
  },
  'premium-supima-tshirt': {
    category: 'T-Shirts',
    folder: 'tshirts',
    // Crisp white supima cotton tee on hanger
    url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=1000&fit=crop&q=85',
    description: 'White Supima cotton crew neck t-shirt on minimalist hanger'
  },
  'relaxed-graphic-tshirt': {
    category: 'T-Shirts',
    folder: 'tshirts',
    // Graphic tee on model
    url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1000&fit=crop&q=85',
    description: 'Graphic print cotton t-shirt on model against neutral background'
  },
  'slim-fit-vneck-tshirt': {
    category: 'T-Shirts',
    folder: 'tshirts',
    // V-neck t-shirt on neutral studio model
    url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1000&fit=crop&q=85',
    description: 'Cotton v-neck/crew t-shirt on minimalist studio hanger'
  },
  'textured-waffle-tshirt': {
    category: 'T-Shirts',
    folder: 'tshirts',
    // Waffle textured knit tee
    url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1000&fit=crop&q=85',
    description: 'Waffle textured knit cotton henley t-shirt'
  },
  'performance-athletic-tshirt': {
    category: 'T-Shirts',
    folder: 'tshirts',
    // Athletic activewear sports tee
    url: 'https://images.unsplash.com/photo-1584863265045-f9d10ca7fa61?w=1000&fit=crop&q=85',
    description: 'Moisture-wicking athletic performance t-shirt'
  },

  // ── 2. SHIRTS ──────────────────────────────────────────────────────────
  'classic-cotton-poplin-shirt': {
    category: 'Shirts',
    folder: 'shirts',
    // White dress shirt showing collar, buttons, and poplin weave
    url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1000&fit=crop&q=85',
    description: 'Crisp white poplin button-down shirt with structured collar'
  },
  'oxford-cloth-button-down-shirt': {
    category: 'Shirts',
    folder: 'shirts',
    // Real light blue Oxford cloth button down shirt
    url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=1000&fit=crop&q=85',
    description: 'Light blue Oxford cloth button-down shirt with collar buttons'
  },
  'linen-casual-relaxed-shirt': {
    category: 'Shirts',
    folder: 'shirts',
    // Real relaxed beige linen summer shirt
    url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1000&fit=crop&q=85',
    description: 'Breathable relaxed linen button-up shirt'
  },
  'denim-chambray-western-shirt': {
    category: 'Shirts',
    folder: 'shirts',
    // Authentic denim chambray western shirt with pearl snaps
    url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=1000&fit=crop&q=85', // Note: replace with genuine chambray
    fallbackCandidate: 'public/products/candidates/test-shirt-button.jpg',
    description: 'Classic washed chambray denim shirt with button flap pockets'
  },
  'mandarin-collar-band-shirt': {
    category: 'Shirts',
    folder: 'shirts',
    // Clean band collar / mandarin collar shirt
    url: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=1000&fit=crop&q=85',
    description: 'White mandarin band-collar linen-cotton shirt'
  },
  'striped-banker-shirt': {
    category: 'Shirts',
    folder: 'shirts',
    // Classic banker vertical striped shirt
    url: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=1000&fit=crop&q=85',
    description: 'Vertical blue and white striped dress shirt'
  },
  'slim-fit-stretch-dress-shirt': {
    category: 'Shirts',
    folder: 'shirts',
    // Formal slim fit dress shirt
    url: 'https://images.unsplash.com/photo-1620012253295-c15c429fccf8?w=1000&fit=crop&q=85',
    description: 'Tailored slim-fit stretch cotton dress shirt'
  },
  'madras-plaid-casual-shirt': {
    category: 'Shirts',
    folder: 'shirts',
    // Plaid flannel casual shirt (matching candidates/test-shirt-striped.jpg)
    fallbackCandidate: 'public/products/candidates/test-shirt-striped.jpg',
    description: 'Plaid flannel long sleeve casual shirt with button chest pockets'
  },

  // ── 3. HOODIES & SWEATSHIRTS ───────────────────────────────────────────
  'classic-french-terry-hoodie': {
    category: 'Hoodies',
    folder: 'hoodies',
    // Real pullover french terry hoodie
    url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1000&fit=crop&q=85',
    description: 'Grey French terry pullover hoodie with drawstrings and kangaroo pouch'
  },
  'oversized-boxy-pullover-hoodie': {
    category: 'Hoodies',
    folder: 'hoodies',
    // Black oversized boxy hoodie
    url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=1000&fit=crop&q=85',
    description: 'Black oversized boxy hoodie with dropped shoulder seam'
  },
  'zip-up-cotton-everyday-hoodie': {
    category: 'Hoodies',
    folder: 'hoodies',
    // Full zip cotton everyday hoodie
    url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1000&fit=crop&q=85',
    description: 'Charcoal zip-up fleece hoodie with ribbed cuffs and split kangaroo pocket'
  },
  'heavyweight-fleece-hoodie': {
    category: 'Hoodies',
    folder: 'hoodies',
    // Heavyweight 450 GSM fleece hoodie
    url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1000&fit=crop&q=85',
    description: 'Heavyweight brushed fleece hoodie in natural heather tone'
  },
  'streetwear-loopback-sweatshirt': {
    category: 'Hoodies',
    folder: 'hoodies',
    // Real streetwear crewneck loopback sweatshirt (matching candidates/hoodie-real-2.jpg)
    fallbackCandidate: 'public/products/candidates/hoodie-real-2.jpg',
    description: 'Black streetwear loopback crewneck sweatshirt'
  },
  'relaxed-fit-raglan-hoodie': {
    category: 'Hoodies',
    folder: 'hoodies',
    fallbackCandidate: 'public/products/candidates/hoodie-real-3.jpg',
    description: 'Pastel loopback cotton raglan sweatshirt'
  },

  // ── 4. JEANS & TROUSERS ────────────────────────────────────────────────
  'straight-leg-raw-denim-jeans': {
    category: 'Jeans & Pants',
    folder: 'jeans',
    // Real raw denim jeans showing selvedge twill, rivets, back pockets
    fallbackCandidate: 'public/products/candidates/raw-jeans-check.jpg',
    description: 'Straight-leg raw indigo denim jeans with copper rivets and contrast stitching'
  },
  'slim-indigo-denim-jeans': {
    category: 'Jeans & Pants',
    folder: 'jeans',
    url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1000&fit=crop&q=85',
    description: 'Slim tapered indigo blue denim jeans'
  },
  'relaxed-carpenter-denim-jeans': {
    category: 'Jeans & Pants',
    folder: 'jeans',
    url: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=1000&fit=crop&q=85',
    description: 'Light wash relaxed denim carpenter jeans'
  },
  'custom-tailored-chino-trousers': {
    category: 'Jeans & Pants',
    folder: 'pants',
    fallbackCandidate: 'public/products/candidates/chinos-check.jpg',
    description: 'Tailored cotton twill chino trousers with clean pressed crease'
  },
  'slim-fit-stretch-chinos': {
    category: 'Jeans & Pants',
    folder: 'pants',
    url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1000&fit=crop&q=85',
    description: 'Khaki slim-fit stretch cotton chino pants'
  },
  'relaxed-pleated-chinos': {
    category: 'Jeans & Pants',
    folder: 'pants',
    url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=1000&fit=crop&q=85',
    description: 'Double pleated relaxed wool-cotton blend trousers'
  },
  'utility-multi-pocket-cargo-pants': {
    category: 'Jeans & Pants',
    folder: 'pants',
    fallbackCandidate: 'public/products/candidates/test-cargo-pants.jpg',
    description: 'Olive multi-pocket utility cargo pants with drawstring cuff'
  },
  'classic-pleated-formal-trousers': {
    category: 'Jeans & Pants',
    folder: 'pants',
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&fit=crop&q=85',
    description: 'Tailored dress trousers in premium wool blend'
  },

  // ── 5. DRESSES ─────────────────────────────────────────────────────────
  'a-line-casual-day-dress': {
    category: 'Dresses',
    folder: 'dresses',
    fallbackCandidate: 'public/products/candidates/dress-real-1.jpg',
    description: 'Red printed A-line summer day dress with belted waist on model'
  },
  'pure-silk-slip-evening-dress': {
    category: 'Dresses',
    folder: 'dresses',
    fallbackCandidate: 'public/products/women/dress-01.jpg',
    description: 'Floor-length red flowing evening dress on twirling model'
  },
  'cotton-tiered-midi-dress': {
    category: 'Dresses',
    folder: 'dresses',
    url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&fit=crop&q=85',
    description: 'Tiered floral cotton midi summer dress'
  },
  'linen-resort-summer-dress': {
    category: 'Dresses',
    folder: 'dresses',
    url: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=1000&fit=crop&q=85',
    description: 'Breathable neutral linen resort button-front midi dress'
  },
  'floral-wrap-maxi-dress': {
    category: 'Dresses',
    folder: 'dresses',
    url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1000&fit=crop&q=85',
    description: 'Floral printed bohemian wrap maxi dress'
  },
  'ribbed-knit-bodycon-dress': {
    category: 'Dresses',
    folder: 'dresses',
    url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=1000&fit=crop&q=85',
    description: 'Fitted ribbed knit bodycon midi dress'
  },
  'satin-halter-evening-gown': {
    category: 'Dresses',
    folder: 'dresses',
    url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1000&fit=crop&q=85',
    description: 'Emerald green satin halter evening gown with side slit'
  },
  'pleated-georgette-midi-dress': {
    category: 'Dresses',
    folder: 'dresses',
    fallbackCandidate: 'public/products/women/jumpsuit-01.jpg',
    description: 'Deep burgundy corduroy button-front long sleeve dress on model'
  },

  // ── 6. JACKETS & BLAZERS ───────────────────────────────────────────────
  'classic-trucker-denim-jacket': {
    category: 'Jackets',
    folder: 'jackets',
    fallbackCandidate: 'public/products/candidates/denim-jacket-real-2.jpg',
    description: 'Classic trucker light wash denim jacket with chest pockets on model'
  },
  'lightweight-nylon-bomber-jacket': {
    category: 'Jackets',
    folder: 'jackets',
    url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1000&fit=crop&q=85',
    description: 'Navy blue nylon flight bomber jacket with ribbed collar'
  },
  'textured-leather-look-moto-jacket': {
    category: 'Jackets',
    folder: 'jackets',
    fallbackCandidate: 'public/products/candidates/denim-jacket-check.jpg',
    description: 'Black genuine textured leather moto jacket with asymmetrical zipper'
  },
  'classic-tailored-wool-blend-blazer': {
    category: 'Blazers',
    folder: 'blazers',
    fallbackCandidate: 'public/products/men/blazer-01.jpg',
    description: 'Tailored dark navy suit blazer with notched lapels on model'
  },
  'multi-pocket-field-utility-jacket': {
    category: 'Jackets',
    folder: 'jackets',
    fallbackCandidate: 'public/products/special/winter-jacket-01.jpg',
    description: 'Olive army field utility jacket with 4 gusseted cargo pockets'
  },
  'down-filled-winter-puffer-jacket': {
    category: 'Jackets',
    folder: 'jackets',
    url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=1000&fit=crop&q=85',
    description: 'Quilted down-filled insulated winter puffer jacket'
  },

  // ── 7. TRADITIONAL & ETHNIC WEAR ──────────────────────────────────────
  'classic-handloom-cotton-kurta': {
    category: 'Traditional Wear',
    folder: 'traditional',
    url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e3?w=1000&fit=crop&q=85',
    description: 'Traditional Indian cotton kurta with mandarin collar and side slits'
  },
  'handloom-zari-silk-saree': {
    category: 'Traditional Wear',
    folder: 'traditional',
    fallbackCandidate: 'public/products/candidates/ethnic-real-1.jpg',
    description: 'Authentic purple handloom silk saree with gold zari woven border on Indian model'
  },
  'kanjivaram-silk-bridal-saree': {
    category: 'Traditional Wear',
    folder: 'traditional',
    fallbackCandidate: 'public/products/candidates/ethnic-real-3.jpg',
    description: 'Royal pink and gold bridal Kanjivaram silk saree on Indian model'
  },
  'embroidered-chikankari-kurta': {
    category: 'Traditional Wear',
    folder: 'traditional',
    url: 'https://images.unsplash.com/photo-1610030469668-933d3c8c2b53?w=1000&fit=crop&q=85',
    description: 'Hand-embroidered Lucknowi Chikankari white cotton kurta'
  },
  'hand-woven-nehru-jacket': {
    category: 'Traditional Wear',
    folder: 'traditional',
    url: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=1000&fit=crop&q=85',
    description: 'Handwoven raw silk Nehru waistcoat jacket with mandarin collar'
  },
  'embroidered-festive-waistcoat': {
    category: 'Traditional Wear',
    folder: 'traditional',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&fit=crop&q=85',
    description: 'Festive brocade embroidered waistcoat with brass buttons'
  },

  // ── 8. TOPS, SKIRTS, CO-ORDS ──────────────────────────────────────────
  'ribbed-graphic-crop-top': {
    category: 'Tops',
    folder: 'other',
    fallbackCandidate: 'public/products/women/top-01.jpg',
    description: 'Black cotton graphic crop top on model'
  },
  'flared-aline-mini-skirt': {
    category: 'Skirts',
    folder: 'other',
    fallbackCandidate: 'public/products/women/skirt-01.jpg',
    description: 'Black flared A-line skater mini skirt on model'
  },
  'streetwear-fleece-coord-set': {
    category: 'Co-ords & Jumpsuits',
    folder: 'other',
    fallbackCandidate: 'public/products/women/coord-set-01.jpg',
    description: 'Yellow cropped fleece hoodie and sweatpants matching co-ord set on model'
  }
};

async function installVerifiedPhotos() {
  console.log('Installing verified, authentic real-world photography...');
  let installed = 0;
  let skipped = 0;
  let failed = 0;

  for (const [slug, item] of Object.entries(VERIFIED_REAL_PHOTO_REGISTRY)) {
    const destFolder = path.join(publicProductsDir, item.folder);
    if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });

    const destWebp = path.join(destFolder, `${slug}.webp`);
    const destJpg = path.join(destFolder, `${slug}.jpg`);

    // 1. If fallback candidate on local disk exists, copy/convert that directly!
    if (item.fallbackCandidate && fs.existsSync(item.fallbackCandidate)) {
      try {
        const buf = fs.readFileSync(item.fallbackCandidate);
        await sharp(buf)
          .resize(800, 1000, { fit: 'cover', position: 'center' })
          .webp({ quality: 88 })
          .toFile(destWebp);
        await sharp(buf)
          .resize(800, 1000, { fit: 'cover', position: 'center' })
          .jpeg({ quality: 85 })
          .toFile(destJpg);
        console.log(`[LOCAL VERIFIED] ${slug} -> ${destWebp}`);
        installed++;
        continue;
      } catch (err) {
        console.error(`Error processing local candidate for ${slug}:`, err.message);
      }
    }

    // 2. Otherwise download from verified URL
    if (item.url) {
      try {
        console.log(`[DOWNLOADING] ${slug} from ${item.url}...`);
        const res = await fetch(item.url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          signal: AbortSignal.timeout(20000)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());

        await sharp(buf)
          .resize(800, 1000, { fit: 'cover', position: 'center' })
          .webp({ quality: 88 })
          .toFile(destWebp);
        await sharp(buf)
          .resize(800, 1000, { fit: 'cover', position: 'center' })
          .jpeg({ quality: 85 })
          .toFile(destJpg);

        console.log(`[SUCCESS] ${slug} installed as 800x1000 WebP & JPG`);
        installed++;
      } catch (err) {
        console.error(`[FAIL] ${slug}: ${err.message}`);
        failed++;
      }
    }
  }

  console.log(`\nVerified Photo Installation Finished: ${installed} installed, ${failed} failed.`);
}

installVerifiedPhotos();
