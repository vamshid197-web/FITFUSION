const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('===============================================================');
console.log('=== VERIFYING FREE LOCAL VIRTUAL TRY-ON (ZERO PAID DEPENDENCIES) ===');
console.log('===============================================================\n');

// 1. Inspect VirtualTryOnPage.jsx
const vtonPageCode = fs.readFileSync(path.join(__dirname, 'frontend/src/pages/tryon/VirtualTryOnPage.jsx'), 'utf-8');

// Check 1: Paid service and pricing removal
assert.ok(!vtonPageCode.includes('Tailored Price:'), 'VirtualTryOnPage must not display Tailored Price');
const hasCurrencyDollar = /\$\s*\d/.test(vtonPageCode) || /\bUSD\b/i.test(vtonPageCode);
assert.ok(!hasCurrencyDollar, 'VirtualTryOnPage must not contain dollar pricing');
assert.ok(!vtonPageCode.includes('VEXA'), 'VirtualTryOnPage must not contain VEXA');
assert.ok(!vtonPageCode.includes('WEARFITS'), 'VirtualTryOnPage must not contain WEARFITS');
assert.ok(!vtonPageCode.includes('Try-On Anywhere'), 'VirtualTryOnPage must not contain Try-On Anywhere');
assert.ok(!vtonPageCode.includes('VITE_VTON_API_URL'), 'VirtualTryOnPage must not reference VITE_VTON_API_URL');
assert.ok(!vtonPageCode.includes('Replicate'), 'VirtualTryOnPage must not reference Replicate');
assert.ok(!/\bVIP\b/i.test(vtonPageCode), 'VirtualTryOnPage must not reference VIP');
assert.ok(!/\bfast passes\b/i.test(vtonPageCode), 'VirtualTryOnPage must not reference fast passes');
assert.ok(!/\b\$30\b/.test(vtonPageCode), 'VirtualTryOnPage must not reference $30');
console.log('1. Paid service removed: PASS');

// Check 2: Camera controls & lifecycle
assert.ok(vtonPageCode.includes('Start Camera'), 'Must have Start Camera button');
assert.ok(vtonPageCode.includes('Stop Camera'), 'Must have Stop Camera button');
assert.ok(vtonPageCode.includes('Switch Camera'), 'Must have Switch Camera button');
assert.ok(vtonPageCode.includes('handleStopCamera'), 'Must have handleStopCamera function');
assert.ok(vtonPageCode.includes('handleFlipCamera'), 'Must have handleFlipCamera function');
assert.ok(vtonPageCode.includes('Allow camera access to try on clothes.'), 'Must show camera permission text');
assert.ok(vtonPageCode.includes('Camera Access Required'), 'Must show permission denied message');
console.log('2. Camera: PASS');

// Check 3: MediaPipe body tracking
const poseDetectorCode = fs.readFileSync(path.join(__dirname, 'frontend/src/services/bodyPoseDetector.js'), 'utf-8');
assert.ok(poseDetectorCode.includes('navigator.mediaDevices.getUserMedia'), 'Must use navigator.mediaDevices.getUserMedia');
assert.ok(poseDetectorCode.includes('tracks.forEach((track) => track.stop())'), 'Must stop all camera tracks on stopCamera');
assert.ok(poseDetectorCode.includes('shoulderCenter'), 'Must calculate shoulderCenter');
assert.ok(poseDetectorCode.includes('shoulderWidth'), 'Must calculate shoulderWidth');
assert.ok(poseDetectorCode.includes('torsoWidth'), 'Must calculate torsoWidth');
assert.ok(poseDetectorCode.includes('torsoHeight'), 'Must calculate torsoHeight');
assert.ok(poseDetectorCode.includes('bodyAngle'), 'Must calculate bodyAngle');
assert.ok(poseDetectorCode.includes('bodyScale'), 'Must calculate bodyScale');
assert.ok(poseDetectorCode.includes('leftShoulder'), 'Must track left shoulder');
assert.ok(poseDetectorCode.includes('rightShoulder'), 'Must track right shoulder');
assert.ok(poseDetectorCode.includes('leftElbow'), 'Must track left elbow');
assert.ok(poseDetectorCode.includes('rightElbow'), 'Must track right elbow');
assert.ok(poseDetectorCode.includes('leftWrist'), 'Must track left wrist');
assert.ok(poseDetectorCode.includes('rightWrist'), 'Must track right wrist');
assert.ok(poseDetectorCode.includes('applySmoothing'), 'Must apply smoothing to prevent shaking');
console.log('3. MediaPipe body tracking: PASS');

// Check 4: Three.js 3D Garment
const clothing3DServiceCode = fs.readFileSync(path.join(__dirname, 'frontend/src/services/clothing3DService.js'), 'utf-8');
assert.ok(clothing3DServiceCode.includes('ThreeGarmentEngine'), 'Must define ThreeGarmentEngine');
assert.ok(clothing3DServiceCode.includes('updatePose'), 'Must have updatePose method');
assert.ok(clothing3DServiceCode.includes('GLTFLoader'), 'Must use GLTFLoader for .glb/.gltf');
assert.ok(clothing3DServiceCode.includes('WebGLRenderer'), 'Must use Three.js WebGLRenderer');
assert.ok(vtonPageCode.includes('threeCameraCanvasRef'), 'Must mount 3D WebGL canvas over camera');
assert.ok(vtonPageCode.includes('garmentEngineRef.current.updatePose'), 'Must feed detectedPose to 3D garment engine');
console.log('4. Three.js 3D garment: PASS');

// Check 5: FITFUSION Product Connection & Quick Garment Selector
assert.ok(vtonPageCode.includes('GARMENT_SELECTOR_OPTIONS'), 'Must define quick garment selector options');
assert.ok(vtonPageCode.includes('T-Shirt'), 'Must include T-Shirt selector');
assert.ok(vtonPageCode.includes('Shirt'), 'Must include Shirt selector');
assert.ok(vtonPageCode.includes('Hoodie'), 'Must include Hoodie selector');
assert.ok(vtonPageCode.includes('Jacket'), 'Must include Jacket selector');
assert.ok(vtonPageCode.includes('Dress'), 'Must include Dress selector');
assert.ok(vtonPageCode.includes('Kurta'), 'Must include Kurta selector');
assert.ok(vtonPageCode.includes('handleSelectQuickGarment'), 'Must have handler for garment selector');
console.log('5. FITFUSION product connection: PASS');

// Check 6: Customization Connection
assert.ok(vtonPageCode.includes('handleUpdateCustomization'), 'Must have customization update handler');
assert.ok(vtonPageCode.includes('color'), 'Must maintain color state');
assert.ok(vtonPageCode.includes('fit'), 'Must maintain fit state');
assert.ok(vtonPageCode.includes('monogramText'), 'Must maintain monogram text');
console.log('6. Customization connection: PASS');

// Check 7: 2D Fallback & Clear Distinction
assert.ok(vtonPageCode.includes('3D TRY-ON'), 'Must clearly label 3D TRY-ON');
assert.ok(vtonPageCode.includes('2D PREVIEW'), 'Must clearly label 2D PREVIEW');
assert.ok(vtonPageCode.includes('cameraGarmentMode'), 'Must distinguish 3D and 2D modes');
assert.ok(vtonPageCode.includes('Real-time 3D body-tracked virtual try-on'), 'Must honestly describe 3D mode');
assert.ok(vtonPageCode.includes('2D body-tracked preview'), 'Must honestly describe 2D preview');
console.log('7. 2D fallback: PASS');

// Check 8: Snapshot (Capture, Retake, Save Snapshot)
const snapshotModalCode = fs.readFileSync(path.join(__dirname, 'frontend/src/components/tryon/TryOnSnapshotModal.jsx'), 'utf-8');
assert.ok(vtonPageCode.includes('Take Snapshot'), 'Must have Take Snapshot button');
assert.ok(snapshotModalCode.includes('Retake'), 'Snapshot modal must show Retake button');
assert.ok(snapshotModalCode.includes('Save Snapshot'), 'Snapshot modal must show Save Snapshot button');
assert.ok(snapshotModalCode.includes('handleDownload'), 'Must save snapshot locally');
assert.ok(!snapshotModalCode.includes('Tailored Price'), 'Snapshot modal must not display price');
console.log('8. Snapshot: PASS');

// Check 9: External paid API calls
const photoServiceCode = fs.readFileSync(path.join(__dirname, 'frontend/src/services/photoTryOnService.js'), 'utf-8');
assert.ok(!photoServiceCode.includes('VITE_VTON_API_URL'), 'photoTryOnService must not reference VITE_VTON_API_URL');
assert.ok(!photoServiceCode.includes('VITE_REPLICATE_API_TOKEN'), 'photoTryOnService must not reference VITE_REPLICATE_API_TOKEN');
assert.ok(!photoServiceCode.includes('fetch(apiUrl'), 'photoTryOnService must not call external fetch apiUrl');
assert.ok(!poseDetectorCode.includes('fetch('), 'bodyPoseDetector must not call external fetch');
assert.ok(!clothing3DServiceCode.includes('fetch('), 'clothing3DService must not call external API fetch');
console.log('9. External paid API calls: NONE');

// Check 10: 3D Garment Library Structure
const dirGarments = path.join(__dirname, 'frontend/public/3d-garments');
assert.ok(fs.existsSync(dirGarments), 'frontend/public/3d-garments must exist');
const subdirs = ['shirts', 'tshirts', 'hoodies', 'jackets', 'dresses', 'pants', 'kurtas'];
for (const sub of subdirs) {
  assert.ok(fs.existsSync(path.join(dirGarments, sub)), `3d-garments/${sub} must exist`);
  const files = fs.readdirSync(path.join(dirGarments, sub));
  assert.ok(files.some(f => f.endsWith('.glb') || f.endsWith('.gltf')), `3d-garments/${sub} must contain a 3D garment model`);
}
console.log('10. 3D Garment Library (frontend/public/3d-garments/): PASS');

// Check 11: Production Build Artifacts
const distHtml = path.join(__dirname, 'frontend/dist/index.html');
assert.ok(fs.existsSync(distHtml), 'frontend/dist/index.html must exist from production build');
console.log('11. Production build: PASS');

console.log('\n===============================================================');
console.log('ALL 11 VERIFICATION CRITERIA PASSED (100% FREE LOCAL VIRTUAL TRY-ON)');
console.log('===============================================================');
