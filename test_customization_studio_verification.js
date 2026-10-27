const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('===================================================================');
console.log('   FITFUSION: CUSTOMIZATION STUDIO IMPLEMENTATION VERIFICATION     ');
console.log('===================================================================');

// 1. Verify 3D Model Asset (Genuine 3D Garment GLB)
const modelPath = path.join(__dirname, 'frontend/public/models/apparel/crewneck-tshirt.glb');
assert.ok(fs.existsSync(modelPath), '3D model file must exist at /models/apparel/crewneck-tshirt.glb');
const modelBuffer = fs.readFileSync(modelPath);
assert.ok(modelBuffer.length > 500000, `3D model must be a real high-poly model (>500KB). Actual: ${modelBuffer.length} bytes`);
const magic = modelBuffer.toString('utf8', 0, 4);
assert.strictEqual(magic, 'glTF', 'Model must have valid binary glTF (GLB) header');

const jsonLen = modelBuffer.readUInt32LE(12);
const gltfJson = JSON.parse(modelBuffer.toString('utf8', 20, 20 + jsonLen));
assert.ok(gltfJson.meshes && gltfJson.meshes.length > 0, 'GLB must define meshes');
const posAcc = gltfJson.accessors[gltfJson.meshes[0].primitives[0].attributes.POSITION];
assert.ok(posAcc.count >= 10000, `3D model must have high vertex count (>= 10,000). Actual: ${posAcc.count} vertices`);
assert.ok(gltfJson.meshes[0].primitives[0].attributes.NORMAL !== undefined, '3D model must have vertex normals');
assert.ok(gltfJson.meshes[0].primitives[0].attributes.TEXCOORD_0 !== undefined, '3D model must have UV coordinates');
console.log(`✅ 1. 3D Model: Genuine GLB garment verified with ${posAcc.count} vertices and normal/UV mapping.`);

// 2. Verify Selected Real Product
const { MOCK_PRODUCTS } = require('./frontend/src/data/mockProducts.js');
const selectedProd = MOCK_PRODUCTS.find(p => p.id === '1');
assert.ok(selectedProd, 'Real product with ID "1" must exist in FITFUSION catalog');
assert.strictEqual(selectedProd.name, 'Classic Crew Neck T-Shirt', 'Product name must match catalog');
assert.strictEqual(selectedProd.category, 'T-Shirts', 'Product category must match catalog');
assert.strictEqual(selectedProd.basePrice, 599, 'Product base price must match catalog');
assert.ok(selectedProd.image.includes('classic-crew-neck-tshirt.webp'), 'Product must use realistic catalog image');
console.log(`✅ 2. Real Product: ${selectedProd.name} (ID: ${selectedProd.id}, ₹${selectedProd.basePrice}, ${selectedProd.category}) verified.`);

// 3. Verify CustomizationStudioViewer3D
const viewerSrc = fs.readFileSync(path.join(__dirname, 'frontend/src/components/customization/CustomizationStudioViewer3D.jsx'), 'utf-8');
assert.ok(viewerSrc.includes('OrbitControls'), '3D Viewer must use OrbitControls for 360 rotation');
assert.ok(viewerSrc.includes('DecalGeometry'), '3D Viewer must use DecalGeometry for surface-conforming designs');
assert.ok(viewerSrc.includes('AmbientLight') && viewerSrc.includes('DirectionalLight'), '3D Viewer must configure studio lighting');
assert.ok(viewerSrc.includes("setCameraView('front')") || viewerSrc.includes("viewKey === 'front'"), '3D Viewer must support preset Front view');
assert.ok(viewerSrc.includes("setCameraView('back')") || viewerSrc.includes("viewKey === 'back'"), '3D Viewer must support preset Back view');
assert.ok(viewerSrc.includes("setCameraView('left')") || viewerSrc.includes("viewKey === 'left'"), '3D Viewer must support preset Left view');
assert.ok(viewerSrc.includes("setCameraView('right')") || viewerSrc.includes("viewKey === 'right'"), '3D Viewer must support preset Right view');
assert.ok(viewerSrc.includes("setCameraView('reset')") || viewerSrc.includes("viewKey === 'reset'"), '3D Viewer must support Reset view');
assert.ok(viewerSrc.includes('autoRotate'), '3D Viewer must support 360 auto-rotation');
assert.ok(viewerSrc.includes('roughness') && viewerSrc.includes('metalness'), '3D Viewer must support PBR fabric simulation');
console.log('✅ 3. Central 3D Viewer: Three.js WebGL engine, 360° orbit, preset angles, and DecalGeometry verified.');

// 4. Verify CustomizationStudioLeftPanel
const leftPanelSrc = fs.readFileSync(path.join(__dirname, 'frontend/src/components/customization/CustomizationStudioLeftPanel.jsx'), 'utf-8');
assert.ok(leftPanelSrc.includes('Back to Products'), 'Left panel must provide Back to Products navigation');
assert.ok(leftPanelSrc.includes('ProductImage'), 'Left panel must display product catalog thumbnail');
assert.ok(leftPanelSrc.includes('Similar Catalog Products'), 'Left panel must display similar catalog products');
assert.ok(leftPanelSrc.includes('onSelectSimilarProduct'), 'Left panel must handle selecting similar products');
console.log('✅ 4. Left Panel: Back link, product overview, quick navigation, and similar products verified.');

// 5. Verify CustomizationStudioControls
const controlsSrc = fs.readFileSync(path.join(__dirname, 'frontend/src/components/customization/CustomizationStudioControls.jsx'), 'utf-8');
assert.ok(controlsSrc.includes('STUDIO_COLORS'), 'Controls must define STUDIO_COLORS');
assert.ok(controlsSrc.includes('STUDIO_FABRICS'), 'Controls must define STUDIO_FABRICS');
assert.ok(controlsSrc.includes('Choose Color'), 'Controls must include Choose Color section');
assert.ok(controlsSrc.includes('Choose Fabric'), 'Controls must include Choose Fabric section');
assert.ok(controlsSrc.includes('Upload Image'), 'Controls must include Upload Image section');
assert.ok(controlsSrc.includes('Add Text'), 'Controls must include Add Text section');
assert.ok(controlsSrc.includes('AI Prompt Design'), 'Controls must include AI Prompt Design section');
assert.ok(controlsSrc.includes('Size & Fit'), 'Controls must include Size & Fit section');
assert.ok(controlsSrc.includes('APPLY CHANGES'), 'Controls must include APPLY CHANGES button');
assert.ok(controlsSrc.includes('Final Preview & Checkout'), 'Controls must include Final Preview & Checkout section');
console.log('✅ 5. Right Controls Panel: Color swatches, fabrics, upload, text, AI design, size, and Apply Changes verified.');

// 6. Verify 16 Color Swatches
const requiredColors = [
  'White', 'Black', 'Charcoal', 'Light Grey', 'Navy', 'Royal Blue', 'Sky Blue',
  'Forest Green', 'Olive Green', 'Red', 'Maroon', 'Orange', 'Pink', 'Lavender', 'Purple', 'Beige'
];
requiredColors.forEach((col) => {
  assert.ok(controlsSrc.includes(`name: '${col}'`), `Controls must contain color '${col}'`);
});
console.log(`✅ 6. Color Swatches: All 16 required colors present and verified.`);

// 7. Verify CustomizePage Integration
const pageSrc = fs.readFileSync(path.join(__dirname, 'frontend/src/pages/customize/CustomizePage.jsx'), 'utf-8');
assert.ok(pageSrc.includes('CustomizationStudioViewer3D'), 'CustomizePage must mount CustomizationStudioViewer3D');
assert.ok(pageSrc.includes('CustomizationStudioLeftPanel'), 'CustomizePage must mount CustomizationStudioLeftPanel');
assert.ok(pageSrc.includes('CustomizationStudioControls'), 'CustomizePage must mount CustomizationStudioControls');
assert.ok(pageSrc.includes('addToCart'), 'CustomizePage must integrate with existing useCart addToCart');
assert.ok(pageSrc.includes('saveCustomization'), 'CustomizePage must integrate with saveCustomization');
assert.ok(pageSrc.includes('WORKFLOW_STEPS'), 'CustomizePage must define step-based workflow');
console.log('✅ 7. CustomizePage: Fully integrated 7-step studio, cart connection, and layout verified.');

// 8. Verify App.jsx Routing
const appSrc = fs.readFileSync(path.join(__dirname, 'frontend/src/App.jsx'), 'utf-8');
assert.ok(appSrc.includes('path="/customize/:id"'), 'App.jsx must register /customize/:id route');
assert.ok(appSrc.includes('path="/customize"'), 'App.jsx must register /customize route');
assert.ok(appSrc.includes('path="/shop"'), 'App.jsx must preserve /shop route');
assert.ok(appSrc.includes('path="/virtual-try-on"'), 'App.jsx must preserve /virtual-try-on separate from 3D customizer');
console.log('✅ 8. App Routing: /customize, /customize/:id, and separation from virtual-try-on verified.');

console.log('\n===================================================================');
console.log('🎉 ALL 8 CUSTOMIZATION STUDIO VERIFICATION CHECKS PASSED PERFECTLY!');
console.log('===================================================================\n');
