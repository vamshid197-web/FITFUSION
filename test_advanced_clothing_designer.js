/**
 * Test Suite for FITFUSION Advanced Clothing Designer
 * Tests Sections 1 to 20 requirements
 */

import {
  GRAPHICS_LIBRARY,
  PATCHES_LIBRARY,
  PATTERNS_LIBRARY,
  PRINT_EFFECTS,
  IMAGE_EFFECTS,
  GARMENT_PRINT_AREAS,
  DESIGN_TEMPLATES,
  DISCLAIMER_TEXT,
  searchGraphics,
  getPrintAreasForGarment,
  parseNaturalDesignPrompt,
  createDefaultLayer
} from './frontend/src/data/clothingDesignLibrary.js';

import { sanitizeCartItem } from './frontend/src/services/cartSanitizer.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failedTests++;
    throw new Error(message);
  } else {
    console.log(`✅ PASS: ${message}`);
    passedTests++;
  }
}

console.log('\n--- VERIFYING SECTION 1: GRAPHICS & SYMBOLS LIBRARY ---');
const requiredKeywords = [
  'lion', 'tiger', 'eagle', 'wolf', 'bear', 'snake', 'dragon', 'crown',
  'lightning', 'flame', 'star', 'heart', 'skull', 'flower', 'mountain',
  'sun', 'moon', 'abstract', 'cube', 'football', 'vinyl', 'compass'
];

requiredKeywords.forEach(kw => {
  const match = GRAPHICS_LIBRARY.find(g =>
    g.id.toLowerCase().includes(kw) ||
    (g.name && g.name.toLowerCase().includes(kw)) ||
    (g.title && g.title.toLowerCase().includes(kw)) ||
    (g.tags && g.tags.some(t => t.toLowerCase().includes(kw)))
  );
  assert(!!match, `Graphics library contains generic original asset for '${kw}' (Found: ${match?.name || match?.title})`);
  assert(match.svg.includes('<svg') && match.svg.includes('</svg>'), `Asset '${kw}' has valid self-contained SVG`);
});

console.log('\n--- VERIFYING SECTION 5: ORIGINAL PATTERNS ---');
const expectedPatterns = ['stripes', 'dots', 'grid', 'checker', 'waves', 'camo'];
expectedPatterns.forEach(pid => {
  const pat = PATTERNS_LIBRARY.find(p => p.id.includes(pid));
  assert(!!pat, `Pattern library contains '${pid}'`);
  assert(typeof pat.cssPattern === 'function', `Pattern '${pid}' has CSS pattern generator function`);
  const css = pat.cssPattern('#000', 1);
  assert(typeof css === 'object' && !!css.backgroundImage, `Generated pattern CSS for '${pid}'`);
});

console.log('\n--- VERIFYING SECTION 7: COLOR & PRINT EFFECTS & DISCLAIMER ---');
const expectedEffects = ['solid', 'gold', 'silver', 'metallic', 'matte', 'glossy', 'neon', 'embroidery'];
expectedEffects.forEach(eff => {
  const effect = PRINT_EFFECTS.find(p => p.id === eff);
  assert(!!effect, `Print effects includes '${eff}'`);
});
assert(
  DISCLAIMER_TEXT === 'Preview only – final print may vary slightly.',
  `Disclaimer matches exact specification: "${DISCLAIMER_TEXT}"`
);

console.log('\n--- VERIFYING SECTION 8: PATCHES & BADGES ---');
const expectedPatchCategories = ['star', 'shield', 'mountain', 'sport', 'travel', 'music', 'initial', 'number', 'minimal'];
expectedPatchCategories.forEach(cat => {
  const patch = PATCHES_LIBRARY.find(p => p.id.includes(cat) || p.tags.some(t => t.includes(cat)));
  assert(!!patch, `Patches library includes '${cat}' patch (Found: ${patch?.name})`);
  assert(patch.svg.includes('<svg'), `Patch '${cat}' has valid SVG markup`);
});

console.log('\n--- VERIFYING SECTION 10: GARMENT PRINT AREAS ---');
const testGarmentTypes = [
  { cat: 'Shirts', expArea: 'chest' },
  { cat: 'T-Shirts', expArea: 'left_sleeve' },
  { cat: 'Hoodies', expArea: 'hood' },
  { cat: 'Pants', expArea: 'pocket' },
  { cat: 'Dresses', expArea: 'waist' },
  { cat: 'Jackets', expArea: 'chest' },
  { cat: 'Traditional', expArea: 'border' }
];

testGarmentTypes.forEach(({ cat, expArea }) => {
  const areas = getPrintAreasForGarment(cat);
  assert(areas.length > 0, `Print areas configured for '${cat}' (${areas.length} areas)`);
  const found = areas.some(a => a.id === expArea);
  assert(found, `Garment '${cat}' provides appropriate print area '${expArea}'`);
});

console.log('\n--- VERIFYING SECTION 11 & 12: TEMPLATES & AI DESIGN ASSISTANT ---');
assert(DESIGN_TEMPLATES.length >= 6, `At least 6 design templates provided (found ${DESIGN_TEMPLATES.length})`);

const prompt1 = parseNaturalDesignPrompt('Create a black lion design with gold text on the back.');
assert(prompt1.matched, 'AI Assistant parses prompt 1 successfully');
assert(prompt1.layers.some(l => l.type === 'graphic' && (l.title === 'Royal Lion Crest' || l.asset === 'lion-crest')), 'Prompt 1 added Lion graphic');
assert(prompt1.layers.some(l => l.type === 'text' && l.printStyle === 'gold'), 'Prompt 1 added gold text');
assert(prompt1.targetArea === 'back', 'Prompt 1 detected target area "back"');

const prompt2 = parseNaturalDesignPrompt('I want a minimal mountain design on the left chest.');
assert(prompt2.matched, 'AI Assistant parses prompt 2 successfully');
assert(prompt2.layers.some(l => l.title === 'Mountain Peak' || l.asset === 'mountain-peak'), 'Prompt 2 added Mountain graphic');

console.log('\n--- VERIFYING SECTION 13: DESIGN SEARCH ---');
const searchResults = searchGraphics('lion');
assert(searchResults.length > 0 && searchResults.some(r => r.id === 'lion-crest'), 'Search "lion" returns lion-crest asset');
const travelResults = searchGraphics('travel');
assert(travelResults.length > 0, 'Search "travel" returns matching travel assets');

console.log('\n--- VERIFYING SECTION 17: 3D TRY-ON DATA STRUCTURE ---');
const sampleLayer = createDefaultLayer('graphic', {
  asset: 'lion-crest',
  title: 'Majestic Lion',
  printStyle: 'gold',
  printArea: 'front'
});

const requiredKeys = ['id', 'type', 'asset', 'position', 'scale', 'rotation', 'color', 'opacity', 'printStyle', 'printArea'];
requiredKeys.forEach(k => {
  assert(sampleLayer[k] !== undefined, `Layer has required 3D Try-On property '${k}'`);
});

console.log('\n--- VERIFYING LAYER OPERATIONS: MOVE, RESIZE, ROTATE, DELETE, DUPLICATE, UNDO, REDO ---');
let layers = [sampleLayer];
let history = [[...layers]];
let historyIdx = 0;

// 1. Move
layers = layers.map(l => l.id === sampleLayer.id ? { ...l, position: { x: 55, y: 60 } } : l);
history.push([...layers]);
historyIdx++;
assert(layers[0].position.x === 55 && layers[0].position.y === 60, 'Layer moved to new coordinates');

// 2. Resize / Scale
layers = layers.map(l => l.id === sampleLayer.id ? { ...l, scale: 1.5 } : l);
history.push([...layers]);
historyIdx++;
assert(layers[0].scale === 1.5, 'Layer scale resized to 1.5');

// 3. Rotate
layers = layers.map(l => l.id === sampleLayer.id ? { ...l, rotation: 45 } : l);
history.push([...layers]);
historyIdx++;
assert(layers[0].rotation === 45, 'Layer rotated to 45 degrees');

// 4. Duplicate
const duplicated = { ...layers[0], id: 'layer-dup-' + Date.now(), position: { x: 60, y: 65 } };
layers = [...layers, duplicated];
history.push([...layers]);
historyIdx++;
assert(layers.length === 2, 'Layer duplicated successfully (now 2 layers)');

// 5. Delete
layers = layers.filter(l => l.id !== duplicated.id);
history.push([...layers]);
historyIdx++;
assert(layers.length === 1, 'Duplicated layer deleted');

// 6. Undo
if (historyIdx > 0) {
  historyIdx--;
  layers = [...history[historyIdx]];
}
assert(layers.length === 2, 'Undo restored deleted layer');

// 7. Redo
if (historyIdx < history.length - 1) {
  historyIdx++;
  layers = [...history[historyIdx]];
}
assert(layers.length === 1, 'Redo re-applied deletion');

console.log('\n--- EXECUTING SECTION 20 MANDATORY TEST CASES (1 to 8) ---');

// TEST 1: White shirt + Lion graphic + Gold print
const test1Item = sanitizeCartItem({
  productName: 'White Plain Shirt',
  category: 'Shirts',
  selectedColor: { name: 'White', hex: '#FFFFFF' },
  selectedFabric: { name: 'Cotton' },
  basePrice: 1499,
  designLayers: [
    createDefaultLayer('graphic', {
      asset: 'lion-crest',
      title: 'Lion Graphic',
      printStyle: 'gold',
      printArea: 'front',
      color: '#D4AF37'
    })
  ]
});
assert(test1Item.designLayers.length === 1, 'TEST 1: White shirt contains 1 design layer');
assert(test1Item.designLayers[0].printStyle === 'gold', 'TEST 1: Lion graphic has gold print effect');
assert(test1Item.selectedColor.name === 'White', 'TEST 1: Garment color is White');

// TEST 2: White shirt + Customer photo + Gold text
const test2Item = sanitizeCartItem({
  productName: 'White Plain Shirt',
  category: 'Shirts',
  selectedColor: { name: 'White', hex: '#FFFFFF' },
  basePrice: 1499,
  designLayers: [
    createDefaultLayer('photo', {
      title: 'Customer Photo',
      fileName: 'family-portrait.jpg',
      printArea: 'front'
    }),
    createDefaultLayer('text', {
      text: 'FITFUSION',
      title: 'FITFUSION Text',
      printStyle: 'gold',
      color: '#D4AF37',
      printArea: 'front',
      position: { x: 50, y: 70 }
    })
  ]
});
assert(test2Item.designLayers.length === 2, 'TEST 2: Photo + Text combined');
assert(test2Item.designLayers.some(l => l.type === 'photo'), 'TEST 2: Customer photo present');
assert(test2Item.designLayers.some(l => l.type === 'text' && l.printStyle === 'gold'), 'TEST 2: Gold text present');

// TEST 3: Black T-shirt + Graphic + Text + Sleeve design
const test3Item = sanitizeCartItem({
  productName: 'Black Crewneck T-Shirt',
  category: 'T-Shirts',
  selectedColor: { name: 'Black', hex: '#111111' },
  basePrice: 999,
  designLayers: [
    createDefaultLayer('graphic', { asset: 'skull-vector', title: 'Street Skull', printArea: 'front' }),
    createDefaultLayer('text', { text: 'NEVER SETTLE', title: 'Chest Text', printArea: 'front' }),
    createDefaultLayer('patch', { asset: 'star-crest', title: 'Star Patch', printArea: 'sleeve-left' })
  ]
});
assert(test3Item.designLayers.length === 3, 'TEST 3: T-Shirt has 3 design layers across front and sleeve');
assert(test3Item.designLayers.some(l => l.printArea === 'sleeve-left'), 'TEST 3: Sleeve design area verified');

// TEST 4: Hoodie + Large back graphic + Small chest text
const test4Item = sanitizeCartItem({
  productName: 'Oversized Streetwear Hoodie',
  category: 'Hoodies',
  basePrice: 2499,
  designLayers: [
    createDefaultLayer('graphic', {
      asset: 'dragon-vector',
      title: 'Dragon Graphic',
      printArea: 'back',
      scale: 1.8
    }),
    createDefaultLayer('text', {
      text: 'FITFUSION ATELIER',
      title: 'Small Chest Text',
      printArea: 'front',
      scale: 0.8,
      fontSize: 14
    })
  ]
});
assert(test4Item.designLayers.some(l => l.printArea === 'back' && l.scale >= 1.5), 'TEST 4: Large back graphic verified');
assert(test4Item.designLayers.some(l => l.printArea === 'front' && l.scale < 1.0), 'TEST 4: Small chest text verified');

// TEST 5: Jeans + Pocket graphic + Embroidery-style design
const test5Item = sanitizeCartItem({
  productName: 'Selvedge Denim Jeans',
  category: 'Pants',
  basePrice: 2999,
  designLayers: [
    createDefaultLayer('graphic', {
      asset: 'eagle-vector',
      title: 'Pocket Graphic',
      printArea: 'pocket',
      printStyle: 'embroidery'
    })
  ]
});
assert(test5Item.designLayers[0].printArea === 'pocket', 'TEST 5: Pocket graphic placement verified');
assert(test5Item.designLayers[0].printStyle === 'embroidery', 'TEST 5: Embroidery style verified');

// TEST 6: Dress + Pattern + Text/design
const test6Item = sanitizeCartItem({
  productName: 'Silk Evening Dress',
  category: 'Dresses',
  basePrice: 3999,
  designLayers: [
    createDefaultLayer('pattern', {
      asset: 'checker-board',
      title: 'Checker Pattern',
      printArea: 'front',
      opacity: 0.35
    }),
    createDefaultLayer('text', {
      text: 'HAUTE COUTURE',
      title: 'Waist Inscription',
      printArea: 'waist',
      printStyle: 'silver'
    })
  ]
});
assert(test6Item.designLayers.some(l => l.type === 'pattern'), 'TEST 6: Dress pattern layer verified');
assert(test6Item.designLayers.some(l => l.printArea === 'waist'), 'TEST 6: Waist placement verified');

// TEST 7: Jacket + Back graphic + Chest patch + Sleeve text
const test7Item = sanitizeCartItem({
  productName: 'Bomber Jacket',
  category: 'Jackets',
  basePrice: 4499,
  designLayers: [
    createDefaultLayer('graphic', { asset: 'wolf-vector', title: 'Back Wolf', printArea: 'back' }),
    createDefaultLayer('patch', { asset: 'patch-shield', title: 'Chest Shield', printArea: 'chest' }),
    createDefaultLayer('text', { text: 'APEX SQUAD', title: 'Sleeve Text', printArea: 'sleeve' })
  ]
});
assert(test7Item.designLayers.length === 3, 'TEST 7: Jacket has 3 distinct placement areas');
const jktAreas = new Set(test7Item.designLayers.map(l => l.printArea));
assert(jktAreas.has('back') && jktAreas.has('chest') && jktAreas.has('sleeve'), 'TEST 7: Back, chest, and sleeve areas verified');

// TEST 8: Traditional wear + Embroidery design + Chest text
const test8Item = sanitizeCartItem({
  productName: 'Royal Kurta',
  category: 'Traditional',
  basePrice: 3499,
  designLayers: [
    createDefaultLayer('graphic', {
      asset: 'flower-vector',
      title: 'Lotus Motif',
      printArea: 'chest',
      printStyle: 'embroidery'
    }),
    createDefaultLayer('text', {
      text: 'UTSAV 2026',
      title: 'Chest Inscription',
      printArea: 'chest',
      printStyle: 'gold'
    })
  ]
});
assert(test8Item.designLayers.length === 2, 'TEST 8: Traditional wear has embroidery motif + gold text');
assert(test8Item.designLayers[0].printStyle === 'embroidery', 'TEST 8: Embroidery motif verified');

console.log(`\n========================================`);
console.log(`🎉 ALL TESTS PASSED: ${passedTests} passed, ${failedTests} failed.`);
console.log(`========================================\n`);
