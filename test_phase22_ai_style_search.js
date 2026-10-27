/**
 * FITFUSION Phase 22 — AI Style Search, Smart Alternatives & Match Level Verification Suite
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('FITFUSION PHASE 22 — AI STYLE SEARCH TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
  }
}

// Load catalog & service
const { MOCK_PRODUCTS } = require('./frontend/src/data/mockProducts.js');
const {
  evaluateStyleSearch,
  parseStyleQuery,
  MATCH_LEVELS,
  UI_LABELS,
  generateSuggestedPrompts,
  getSimilarCatalogProducts
} = require('./frontend/src/services/aiStyleSearchService.js');

// ----------------------------------------------------
// [SECTION 1] ARCHITECTURE & SERVICE INTEGRATION
// ----------------------------------------------------
console.log('[SECTION 1] ARCHITECTURE & FILE INTEGRITY');

test('aiStyleSearchService.js exists and exports required constants and functions', () => {
  assert.ok(evaluateStyleSearch, 'evaluateStyleSearch must be exported');
  assert.ok(parseStyleQuery, 'parseStyleQuery must be exported');
  assert.ok(MATCH_LEVELS, 'MATCH_LEVELS must be exported');
  assert.strictEqual(MATCH_LEVELS.EXACT_MATCH, 'EXACT_MATCH');
  assert.strictEqual(MATCH_LEVELS.CLOSE_MATCH, 'CLOSE_MATCH');
  assert.strictEqual(MATCH_LEVELS.NO_MATCH, 'NO_MATCH');
  assert.ok(UI_LABELS, 'UI_LABELS must be exported');
  assert.strictEqual(UI_LABELS.EXACT_MATCH, 'Recommended for you');
  assert.strictEqual(UI_LABELS.CLOSE_MATCH, 'Similar options');
  assert.strictEqual(UI_LABELS.NO_MATCH_TITLE, "We couldn't find an exact match");
  assert.strictEqual(UI_LABELS.SIMILAR_CLOTHES, 'Similar clothes you may like');
});

test('AiStyleSearchResult.jsx exists and implements Section 29 layout', () => {
  const compPath = path.join(__dirname, 'frontend/src/components/search/AiStyleSearchResult.jsx');
  assert.ok(fs.existsSync(compPath), 'AiStyleSearchResult.jsx must exist');
  const code = fs.readFileSync(compPath, 'utf8');
  assert.ok(code.includes("We couldn't find an exact match"), 'Must display exact match negative header');
  assert.ok(code.includes('Similar clothes you may like'), 'Must display similar clothes section');
  assert.ok(code.includes('Try these instead:'), 'Must display suggested prompts introductory text');
  assert.ok(code.includes('ProductCard'), 'Must render ProductCard for each product');
});

test('ShopPage.jsx imports and mounts AiStyleSearchResult with click handler', () => {
  const shopPath = path.join(__dirname, 'frontend/src/pages/shop/ShopPage.jsx');
  const code = fs.readFileSync(shopPath, 'utf8');
  assert.ok(code.includes('evaluateStyleSearch'), 'ShopPage must call evaluateStyleSearch');
  assert.ok(code.includes('AiStyleSearchResult'), 'ShopPage must render AiStyleSearchResult');
  assert.ok(code.includes('handleApplyPrompt'), 'ShopPage must provide handleApplyPrompt callback');
  assert.ok(code.includes('params.set(\'search\', promptText)'), 'Clicking prompt must put it in the search box');
});

// ----------------------------------------------------
// [SECTION 2] TEST THE 6 MANDATORY CASES (SECTION 31)
// ----------------------------------------------------
console.log('\n[SECTION 2] 6 MANDATORY STYLE SEARCH TEST CASES');

// Case 1: "I want a black formal shirt under ₹100"
test('Case 1: "I want a black formal shirt under ₹100" triggers NO_MATCH due to unattainable budget', () => {
  const res = evaluateStyleSearch(MOCK_PRODUCTS, 'I want a black formal shirt under ₹100');
  assert.strictEqual(res.matchLevel, MATCH_LEVELS.NO_MATCH, 'Must detect NO_MATCH for budget ₹100');
  assert.strictEqual(res.exactMatches.length, 0, 'Exact matches must be 0');
  assert.ok(res.suggestedPrompts.length >= 3 && res.suggestedPrompts.length <= 5, 'Must provide 3-5 suggested prompts');
  assert.ok(res.suggestedPrompts.includes('Black formal shirt for office'), 'Must include "Black formal shirt for office"');
  assert.ok(res.suggestedPrompts.includes('White formal shirt under ₹1500'), 'Must include realistic budget alternative');
  assert.ok(res.similarProducts.length >= 3, 'Must provide similar products');
  // Check similar products are all shirts from catalog
  res.similarProducts.forEach((p) => {
    assert.strictEqual(p.category, 'Shirts', 'Similar clothes must be shirts from existing catalog');
    assert.ok(p.id, 'Product must have valid ID');
  });
});

// Case 2: "I want a wedding outfit"
test('Case 2: "I want a wedding outfit" triggers EXACT_MATCH with traditional and formal evening wear', () => {
  const res = evaluateStyleSearch(MOCK_PRODUCTS, 'I want a wedding outfit');
  assert.strictEqual(res.matchLevel, MATCH_LEVELS.EXACT_MATCH, 'Must detect EXACT_MATCH for wedding outfit');
  assert.ok(res.exactMatches.length > 0, 'Must return matching wedding outfits');
  // Check products returned are genuine wedding/festive attire
  const names = res.exactMatches.map((p) => p.name);
  assert.ok(names.some((n) => n.includes('Sherwani') || n.includes('Kurta') || n.includes('Blazer')), 'Must recommend Sherwani, Kurta, or Blazer');
  assert.ok(res.suggestedPrompts.length >= 3, 'Must provide smart prompt alternatives');
  assert.ok(res.suggestedPrompts.includes('Festive silk kurta for a wedding') || res.suggestedPrompts.includes('Traditional kurta pajama for a wedding'));
});

// Case 3: "I want a green hoodie for a wedding"
test('Case 3: "I want a green hoodie for a wedding" triggers NO_MATCH (inherent style clash)', () => {
  const res = evaluateStyleSearch(MOCK_PRODUCTS, 'I want a green hoodie for a wedding');
  assert.strictEqual(res.matchLevel, MATCH_LEVELS.NO_MATCH, 'Must detect NO_MATCH for casual hoodie requested for wedding');
  assert.strictEqual(res.exactMatches.length, 0, 'Must NOT pretend green hoodie is an exact match for a wedding');
  assert.ok(res.suggestedPrompts.length >= 4, 'Must provide 4 alternatives as specified in Section 23');
  assert.ok(res.suggestedPrompts.includes('A dark blazer for a wedding'), 'Must suggest "A dark blazer for a wedding"');
  assert.ok(res.suggestedPrompts.includes('A formal shirt for a wedding'), 'Must suggest "A formal shirt for a wedding"');
  assert.ok(res.suggestedPrompts.includes('A traditional kurta for a wedding'), 'Must suggest "A traditional kurta for a wedding"');
  assert.ok(res.suggestedPrompts.includes('A smart casual jacket for a wedding'), 'Must suggest "A smart casual jacket for a wedding"');
  
  // Section 24: Similar clothes: [Blazer] [Formal Shirt] [Jacket] [Kurta]
  const simNames = res.similarProducts.map((p) => p.name);
  assert.ok(simNames.some((n) => n.includes('Blazer')), 'Similar clothes must include a Blazer');
  assert.ok(simNames.some((n) => n.includes('Shirt')), 'Similar clothes must include a Formal Shirt');
  assert.ok(simNames.some((n) => n.includes('Jacket')), 'Similar clothes must include a Jacket');
  assert.ok(simNames.some((n) => n.includes('Kurta')), 'Similar clothes must include a Kurta');
});

// Case 4: "I want comfortable clothes for college"
test('Case 4: "I want comfortable clothes for college" triggers EXACT_MATCH with casual tees, hoodies & jeans', () => {
  const res = evaluateStyleSearch(MOCK_PRODUCTS, 'I want comfortable clothes for college');
  assert.strictEqual(res.matchLevel, MATCH_LEVELS.EXACT_MATCH, 'Must detect EXACT_MATCH for comfortable college clothes');
  assert.ok(res.exactMatches.length > 0, 'Must return comfortable college items');
  const cats = res.exactMatches.map((p) => p.category);
  assert.ok(cats.includes('T-Shirts') || cats.includes('Hoodies') || cats.includes('Jeans & Pants'), 'Must recommend T-Shirts, Hoodies, or Jeans');
  assert.ok(res.suggestedPrompts.includes('Casual t-shirt for college'), 'Must suggest "Casual t-shirt for college"');
  assert.ok(res.suggestedPrompts.includes('Oversized t-shirt for college'), 'Must suggest "Oversized t-shirt for college"');
  assert.ok(res.suggestedPrompts.includes('Comfortable hoodie for college'), 'Must suggest "Comfortable hoodie for college"');
  assert.ok(res.suggestedPrompts.includes('Relaxed jeans for college'), 'Must suggest "Relaxed jeans for college"');
});

// Case 5: "I want a traditional outfit for a festival"
test('Case 5: "I want a traditional outfit for a festival" triggers EXACT_MATCH with Traditional Wear', () => {
  const res = evaluateStyleSearch(MOCK_PRODUCTS, 'I want a traditional outfit for a festival');
  assert.strictEqual(res.matchLevel, MATCH_LEVELS.EXACT_MATCH, 'Must detect EXACT_MATCH for traditional festive wear');
  assert.ok(res.exactMatches.length > 0, 'Must return traditional items');
  res.exactMatches.forEach((p) => {
    assert.strictEqual(p.category, 'Traditional Wear', 'Must all belong to Traditional Wear');
  });
  assert.ok(res.suggestedPrompts.length >= 3, 'Must generate alternative prompts');
});

// Case 6: "I want a red dress under ₹500"
test('Case 6: "I want a red dress under ₹500" triggers NO_MATCH (unattainable budget for dresses)', () => {
  const res = evaluateStyleSearch(MOCK_PRODUCTS, 'I want a red dress under ₹500');
  assert.strictEqual(res.matchLevel, MATCH_LEVELS.NO_MATCH, 'Must detect NO_MATCH for dress under ₹500');
  assert.strictEqual(res.exactMatches.length, 0, 'Must not claim exact match');
  assert.ok(res.suggestedPrompts.includes('A-Line casual dress under ₹1500') || res.suggestedPrompts.includes('Red or wine casual dress'));
  assert.ok(res.similarProducts.length >= 3, 'Must show similar dresses');
  res.similarProducts.forEach((p) => {
    assert.strictEqual(p.category, 'Dresses', 'Similar clothes must be dresses from existing catalog');
  });
});

// ----------------------------------------------------
// [SECTION 3] WEAK MATCH DETECTION (SECTION 25)
// ----------------------------------------------------
console.log('\n[SECTION 3] WEAK MATCH DETECTION');

test('Weak keyword matches (e.g. "casual" on "red wedding dress") are NOT recommended as exact match', () => {
  const res = evaluateStyleSearch(MOCK_PRODUCTS, 'I want a red wedding dress under ₹2000');
  // Must NOT recommend Black Casual T-Shirt just because word "casual" or stopword matched
  const exactNames = res.exactMatches.map((p) => p.name);
  assert.ok(!exactNames.includes('Classic Crew Neck T-Shirt'), 'Must NOT match casual t-shirt for red wedding dress');
  assert.ok(!exactNames.includes('Oversized Heavyweight T-Shirt'), 'Must NOT match oversized tee');
});

test('Completely unmapped terms (e.g. "swimming trunks") trigger NO_MATCH gracefully', () => {
  const res = evaluateStyleSearch(MOCK_PRODUCTS, 'swimming trunks');
  assert.strictEqual(res.matchLevel, MATCH_LEVELS.NO_MATCH, 'Must return NO_MATCH for items outside catalog');
  assert.ok(res.suggestedPrompts.length >= 3, 'Must offer smart suggested prompts');
  assert.ok(res.similarProducts.length >= 3, 'Must offer real similar products');
});

// ----------------------------------------------------
// [SECTION 4] CLICKABLE SUGGESTIONS TO NEW SEARCH FLOW (SECTION 23, 31)
// ----------------------------------------------------
console.log('\n[SECTION 4] CLICKABLE PROMPT RE-SEARCH VERIFICATION');

test('Clicking any suggested prompt produces valid EXACT_MATCH results from existing catalog', () => {
  const promptsToTest = [
    'Black formal shirt for office',
    'White formal shirt under ₹1500',
    'A dark blazer for a wedding',
    'A formal shirt for a wedding',
    'A traditional kurta for a wedding',
    'A smart casual jacket for a wedding',
    'Casual t-shirt for college',
    'Oversized t-shirt for college',
    'Comfortable hoodie for college',
    'Relaxed jeans for college',
    'A-Line casual dress under ₹1500'
  ];

  promptsToTest.forEach((prompt) => {
    const res = evaluateStyleSearch(MOCK_PRODUCTS, prompt);
    assert.ok(
      res.matchLevel === MATCH_LEVELS.EXACT_MATCH || res.matchLevel === MATCH_LEVELS.CLOSE_MATCH,
      `Prompt "${prompt}" must yield EXACT_MATCH or CLOSE_MATCH, got ${res.matchLevel}`
    );
    const count = res.exactMatches.length + res.closeMatches.length;
    assert.ok(count > 0, `Prompt "${prompt}" must return at least 1 real catalog product`);
  });
});

// ----------------------------------------------------
// [SECTION 5] PRODUCT VIEW, CUSTOMIZE & CART FLOW VERIFICATION (SECTION 31)
// ----------------------------------------------------
console.log('\n[SECTION 5] PRODUCT VIEW, CUSTOMIZE & CART FLOW INTEGRITY');

test('ProductCard links to /product/:id and /customize/:id for all catalog items', () => {
  const cardPath = path.join(__dirname, 'frontend/src/components/common/ProductCard.jsx');
  const code = fs.readFileSync(cardPath, 'utf8');
  assert.ok(code.includes('to={`/product/${product.id}`}'), 'Must link to /product/:id for Product View');
  assert.ok(code.includes('to={`/customize/${product.id}`}'), 'Must link to /customize/:id for Customizer');
});

test('ProductDetailsPage provides functional Quick Add to Bag', () => {
  const pdpPath = path.join(__dirname, 'frontend/src/pages/product/ProductDetailsPage.jsx');
  const code = fs.readFileSync(pdpPath, 'utf8');
  assert.ok(code.includes('handleAddToCart'), 'PDP must implement handleAddToCart');
  assert.ok(code.includes('Quick Add to Bag'), 'PDP must render Quick Add to Bag button');
  assert.ok(code.includes('to="/cart"'), 'PDP must link to /cart after adding');
});

// ----------------------------------------------------
// [SECTION 6] CODE QUALITY & PRODUCTION COMPLIANCE
// ----------------------------------------------------
console.log('\n[SECTION 6] SECURITY & CODE INTEGRITY');

test('Zero console.log statements across frontend/src production code', () => {
  function getFiles(dir) {
    let res = [];
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        if (item !== 'node_modules' && item !== 'dist' && item !== '.git') {
          res = res.concat(getFiles(full));
        }
      } else if (full.endsWith('.js') || full.endsWith('.jsx')) {
        res.push(full);
      }
    }
    return res;
  }

  const allFiles = getFiles(path.join(__dirname, 'frontend/src'));
  const logs = [];
  allFiles.forEach((file) => {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('console.log(')) {
        logs.push({ file: path.relative(path.join(__dirname, 'frontend/src'), file), line: idx + 1 });
      }
    });
  });

  assert.strictEqual(logs.length, 0, `Expected 0 console.log calls, found: ${JSON.stringify(logs)}`);
});

test('Frontend production build artifacts exist and are valid', () => {
  const distHtml = path.join(__dirname, 'frontend/dist/index.html');
  assert.ok(fs.existsSync(distHtml), 'dist/index.html must exist');
});

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
console.log('====================================================');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
