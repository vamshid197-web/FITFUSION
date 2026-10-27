import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('FITFUSION — SHIRT FIT CUSTOMIZATION TEST SUITE');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

// 1. Check local images
console.log('[SECTION 1] LOCAL IMAGE ASSETS VERIFICATION');
const publicFitsDir = path.resolve('frontend/public/products/customization/fits');
assert(fs.existsSync(publicFitsDir), 'public/products/customization/fits directory exists');

const requiredImages = ['slim-fit.jpg', 'regular-fit.jpg', 'relaxed-fit.jpg'];
for (const imgName of requiredImages) {
  const imgPath = path.join(publicFitsDir, imgName);
  const exists = fs.existsSync(imgPath);
  const size = exists ? fs.statSync(imgPath).size : 0;
  assert(exists && size > 50000, `Image asset ${imgName} exists locally with valid size (${size} bytes)`);
}

// 2. Check customizerVisualAssets.js
console.log('\n[SECTION 2] FIT_REAL_PHOTOS & RESOLVER VERIFICATION');
const visualAssetsPath = path.resolve('frontend/src/data/customizerVisualAssets.js');
const visualAssetsContent = fs.readFileSync(visualAssetsPath, 'utf8');

assert(visualAssetsContent.includes('/products/customization/fits/slim-fit.jpg'), 'FIT_REAL_PHOTOS defines local slim-fit image path');
assert(visualAssetsContent.includes('/products/customization/fits/regular-fit.jpg'), 'FIT_REAL_PHOTOS defines local regular-fit image path');
assert(visualAssetsContent.includes('/products/customization/fits/relaxed-fit.jpg'), 'FIT_REAL_PHOTOS defines local relaxed-fit image path');
assert(visualAssetsContent.includes('export function getFitRealPhoto'), 'getFitRealPhoto resolver function is exported');

// 3. Check CustomizePage.jsx FIT_OPTIONS
console.log('\n[SECTION 3] FIT_OPTIONS DEFINITIONS IN CUSTOMIZEPAGE');
const customizePagePath = path.resolve('frontend/src/pages/customize/CustomizePage.jsx');
const customizePageContent = fs.readFileSync(customizePagePath, 'utf8');

assert(customizePageContent.includes('title: "Slim Fit"') || customizePageContent.includes("title: 'Slim Fit'"), 'FIT_OPTIONS contains "Slim Fit"');
assert(customizePageContent.includes('title: "Regular Fit"') || customizePageContent.includes("title: 'Regular Fit'"), 'FIT_OPTIONS contains "Regular Fit"');
assert(customizePageContent.includes('title: "Relaxed Fit"') || customizePageContent.includes("title: 'Relaxed Fit'"), 'FIT_OPTIONS contains "Relaxed Fit"');
assert(customizePageContent.includes('/products/customization/fits/slim-fit.jpg'), 'FIT_OPTIONS connects Slim Fit to local image');
assert(customizePageContent.includes('/products/customization/fits/regular-fit.jpg'), 'FIT_OPTIONS connects Regular Fit to local image');
assert(customizePageContent.includes('/products/customization/fits/relaxed-fit.jpg'), 'FIT_OPTIONS connects Relaxed Fit to local image');

// 4. Check CustomizerVisualCards.jsx FitOptionCard
console.log('\n[SECTION 4] FIT OPTION CARD COMPONENT');
const visualCardsPath = path.resolve('frontend/src/components/customization/CustomizerVisualCards.jsx');
const visualCardsContent = fs.readFileSync(visualCardsPath, 'utf8');

assert(visualCardsContent.includes('export function FitOptionCard'), 'FitOptionCard component is exported');
assert(visualCardsContent.includes('fit.image || getFitRealPhoto(fit.id)'), 'FitOptionCard resolves photo from fit.image or getFitRealPhoto');
assert(visualCardsContent.includes('displayName') || visualCardsContent.includes('fit.title'), 'FitOptionCard displays title/name');
assert(visualCardsContent.includes('fit.desc'), 'FitOptionCard renders existing description');
assert(visualCardsContent.includes('onSelect(fit.id)'), 'FitOptionCard handles selection via onSelect(fit.id)');

// 5. Check Summary, Cart and Order details integration
console.log('\n[SECTION 5] SUMMARY, CART & ORDER DETAILS FIT RETENTION');
const summaryPath = path.resolve('frontend/src/components/customization/CustomizationSummary.jsx');
const summaryContent = fs.readFileSync(summaryPath, 'utf8');
assert(summaryContent.includes('fit'), 'CustomizationSummary displays selected fit');

const cartPath = path.resolve('frontend/src/pages/cart/CartPage.jsx');
const cartContent = fs.readFileSync(cartPath, 'utf8');
assert(cartContent.includes('item.fit'), 'CartPage retains and displays item.fit');

const orderDetailsPath = path.resolve('frontend/src/pages/orders/OrderDetailsPage.jsx');
const orderDetailsContent = fs.readFileSync(orderDetailsPath, 'utf8');
assert(orderDetailsContent.includes('item.fit'), 'OrderDetailsPage retains and displays item.fit');

// 6. Check for zero console.log in production code
console.log('\n[SECTION 6] ZERO CONSOLE.LOG AUDIT');
const filesToAudit = [
  'frontend/src/data/customizerVisualAssets.js',
  'frontend/src/pages/customize/CustomizePage.jsx',
  'frontend/src/components/customization/CustomizerVisualCards.jsx'
];
for (const file of filesToAudit) {
  const content = fs.readFileSync(path.resolve(file), 'utf8');
  assert(!content.includes('console.log('), `Zero console.log in ${file}`);
}

console.log('\n====================================================');
console.log(`TOTAL FIT TESTS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('====================================================');

if (failed > 0) process.exit(1);
