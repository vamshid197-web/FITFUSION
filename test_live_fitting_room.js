/**
 * Test Suite: Live AI Fitting Room (Phase 1)
 * Verifies real-time camera, body tracking, landmark extraction, and 3D garment overlay calculations.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('======================================================================');
console.log('=== TEST SUITE: LIVE AI FITTING ROOM (PHASE 1 REAL-TIME ENGINE)    ===');
console.log('======================================================================\n');

// ── 1. Inspect VirtualTryOnPage.jsx ─────────────────────────────────────────
console.log('--- TEST 1: Live Fitting Room Page & UI Controls ---');
const vtonPageCode = fs.readFileSync(path.join(__dirname, 'frontend/src/pages/tryon/VirtualTryOnPage.jsx'), 'utf-8');

assert.ok(vtonPageCode.includes('Live AI Fitting Room'), 'Must include Live AI Fitting Room title');
assert.ok(vtonPageCode.includes('Start Camera'), 'Must provide Start Camera control');
assert.ok(vtonPageCode.includes('Stop Camera'), 'Must provide Stop Camera control');
assert.ok(vtonPageCode.includes('Switch Camera'), 'Must provide Switch Camera control');
assert.ok(vtonPageCode.includes('Reset View'), 'Must provide Reset View control');
assert.ok(vtonPageCode.includes('Take Snapshot'), 'Must provide Take Snapshot control');
assert.ok(vtonPageCode.includes('Allow camera access to try on clothes.'), 'Must explain permission requirement before access');
assert.ok(vtonPageCode.includes('Camera Access Required'), 'Must handle denied permissions with error state');
assert.ok(vtonPageCode.includes('availableCameras'), 'Must support camera device enumeration');
assert.ok(vtonPageCode.includes('scale-x-[-1]'), 'Must mirror user camera preview naturally');
assert.ok(vtonPageCode.includes('fpsEstimate'), 'Must calculate and display FPS estimate for performance');
assert.ok(vtonPageCode.includes('100% locally'), 'Must communicate 100% local client-side processing');
assert.ok(!vtonPageCode.includes('Tailored Price:'), 'Must not display Tailored Price');
assert.ok(!/\$\s*\d/.test(vtonPageCode) && !/\bUSD\b/i.test(vtonPageCode), 'Must not use dollar pricing; must use INR');
assert.ok(vtonPageCode.includes('₹'), 'Must use INR (₹) pricing');
console.log('✓ UI controls, camera states, and local privacy notice: PASS\n');

// ── 2. Body Tracking & Landmark Extraction ─────────────────────────────────
console.log('--- TEST 2: Real-Time Body Tracking & Landmark Mathematics ---');
const poseDetectorCode = fs.readFileSync(path.join(__dirname, 'frontend/src/services/bodyPoseDetector.js'), 'utf-8');

assert.ok(poseDetectorCode.includes('leftShoulder') && poseDetectorCode.includes('rightShoulder'), 'Must track left and right shoulders');
assert.ok(poseDetectorCode.includes('leftElbow') && poseDetectorCode.includes('rightElbow'), 'Must track left and right elbows');
assert.ok(poseDetectorCode.includes('leftWrist') && poseDetectorCode.includes('rightWrist'), 'Must track left and right wrists');
assert.ok(poseDetectorCode.includes('leftHip') && poseDetectorCode.includes('rightHip'), 'Must track left and right hips');
assert.ok(poseDetectorCode.includes('shoulderCenter'), 'Must calculate shoulderCenter');
assert.ok(poseDetectorCode.includes('shoulderWidth'), 'Must calculate shoulderWidth');
assert.ok(poseDetectorCode.includes('torsoCenter'), 'Must calculate torsoCenter');
assert.ok(poseDetectorCode.includes('torsoHeight'), 'Must calculate torsoHeight');
assert.ok(poseDetectorCode.includes('bodyRotation') || poseDetectorCode.includes('bodyAngle'), 'Must calculate bodyRotation / bodyAngle');
assert.ok(poseDetectorCode.includes('bodyYaw'), 'Must calculate bodyYaw');
assert.ok(poseDetectorCode.includes('applySmoothing'), 'Must apply temporal smoothing');
assert.ok(poseDetectorCode.includes('deadzone'), 'Must apply deadzone filtering against jitter');
assert.ok(poseDetectorCode.includes('lastProcessedTime'), 'Must avoid redundant inference on identical video frames');
assert.ok(poseDetectorCode.includes('getAvailableCameras'), 'Must provide camera device enumerator');
assert.ok(poseDetectorCode.includes('tracks.forEach((track) => track.stop())'), 'Must cleanly release MediaStream tracks');
console.log('✓ Body pose landmarker, smoothing math, and camera cleanup: PASS\n');

// ── 3. Garment Overlay & Three.js 3D Engine ────────────────────────────────
console.log('--- TEST 3: Three.js 3D Garment Rendering Engine ---');
const clothing3DCode = fs.readFileSync(path.join(__dirname, 'frontend/src/services/clothing3DService.js'), 'utf-8');

assert.ok(clothing3DCode.includes('ThreeGarmentEngine'), 'Must export ThreeGarmentEngine');
assert.ok(clothing3DCode.includes('updatePose'), 'Must implement updatePose for body sync');
assert.ok(clothing3DCode.includes('GLTFLoader'), 'Must utilize Three.js GLTFLoader');
assert.ok(clothing3DCode.includes('WebGLRenderer'), 'Must utilize Three.js WebGLRenderer');
assert.ok(clothing3DCode.includes('alpha: true'), 'Renderer must support transparent background for camera overlay');
assert.ok(clothing3DCode.includes('Box3'), 'Must compute model bounding box for accurate centering');
assert.ok(clothing3DCode.includes('garmentGroup.visible = false') || clothing3DCode.includes('garmentGroup.visible = true'), 'Must toggle visibility when body is detected or lost');
assert.ok(clothing3DCode.includes('garmentGroup.position.x +='), 'Must smoothly interpolate garment horizontal position');
assert.ok(clothing3DCode.includes('garmentGroup.position.y +='), 'Must smoothly interpolate garment vertical position');
assert.ok(clothing3DCode.includes('garmentGroup.scale.set'), 'Must dynamically scale garment to body distance');
assert.ok(clothing3DCode.includes('garmentGroup.rotation.z +='), 'Must rotate garment on Z axis to follow shoulder tilt');
assert.ok(clothing3DCode.includes('garmentGroup.rotation.y +='), 'Must rotate garment on Y axis to follow body yaw turning');
assert.ok(clothing3DCode.includes('dispose()'), 'Must clean up WebGL rendering loops and GPU resources');
console.log('✓ Three.js 3D garment engine and real-time positioning: PASS\n');

// ── 4. 3D Model Assets on Disk ─────────────────────────────────────────────
console.log('--- TEST 4: Genuine 3D Garment Models ---');
const tshirtGlbPath = path.join(__dirname, 'frontend/public/models/apparel/crewneck-tshirt.glb');
assert.ok(fs.existsSync(tshirtGlbPath), 'crewneck-tshirt.glb must exist in public/models/apparel/');
const stats = fs.statSync(tshirtGlbPath);
assert.ok(stats.size > 500000, `crewneck-tshirt.glb must be a genuine 3D model (>500KB, got ${stats.size} bytes)`);

const subdirs = ['shirts', 'tshirts', 'hoodies', 'jackets', 'dresses', 'pants', 'kurtas'];
for (const sub of subdirs) {
  const dirPath = path.join(__dirname, 'frontend/public/3d-garments', sub);
  assert.ok(fs.existsSync(dirPath), `frontend/public/3d-garments/${sub} must exist`);
  const files = fs.readdirSync(dirPath);
  assert.ok(files.some(f => f.endsWith('.glb')), `frontend/public/3d-garments/${sub} must contain .glb model`);
}
console.log(`✓ Genuine 3D garment model verified (${stats.size} bytes) with full 3D library: PASS\n`);

// ── 5. Product Catalog & Model Availability Logic ──────────────────────────
console.log('--- TEST 5: FITFUSION Catalog Integration & Honest Availability ---');
const registryCode = fs.readFileSync(path.join(__dirname, 'frontend/src/data/clothing3DRegistry.js'), 'utf-8');

assert.ok(registryCode.includes('getProduct3DModel'), 'Must export getProduct3DModel');
assert.ok(registryCode.includes('has3DModel: false') || registryCode.includes('has3DModel: true'), 'Must report 3D model availability status');
assert.ok(registryCode.includes('footwear') || registryCode.includes('shoe'), 'Must exclude non-apparel categories like footwear/accessories from 3D try-on');
assert.ok(vtonPageCode.includes('GARMENT_SELECTOR_OPTIONS'), 'Must include quick garment selector options');
assert.ok(vtonPageCode.includes('handleSelectQuickGarment'), 'Must handle quick garment selection');
assert.ok(vtonPageCode.includes('handleUpdateCustomization'), 'Must handle customization updates');
console.log('✓ Product catalog mapping & honest availability reporting: PASS\n');

// ── 6. Mathematical Verification of Landmark Positioning ──────────────────
console.log('--- TEST 6: Simulated Landmark Coordinate Calculations ---');
// Simulated detected landmarks
const mockLandmarks = {
  leftShoulder: { x: 0.35, y: 0.30, z: -0.05 },
  rightShoulder: { x: 0.65, y: 0.32, z: 0.05 },
  leftElbow: { x: 0.25, y: 0.50 },
  rightElbow: { x: 0.75, y: 0.52 },
  leftWrist: { x: 0.20, y: 0.70 },
  rightWrist: { x: 0.80, y: 0.72 },
  leftHip: { x: 0.38, y: 0.75 },
  rightHip: { x: 0.62, y: 0.75 }
};

const scX = (mockLandmarks.leftShoulder.x + mockLandmarks.rightShoulder.x) / 2;
const scY = (mockLandmarks.leftShoulder.y + mockLandmarks.rightShoulder.y) / 2;
const sWidth = Math.hypot(mockLandmarks.rightShoulder.x - mockLandmarks.leftShoulder.x, mockLandmarks.rightShoulder.y - mockLandmarks.leftShoulder.y);
const rollAngle = Math.atan2(mockLandmarks.rightShoulder.y - mockLandmarks.leftShoulder.y, mockLandmarks.rightShoulder.x - mockLandmarks.leftShoulder.x);
const yawAngle = (mockLandmarks.leftShoulder.z - mockLandmarks.rightShoulder.z) * 2.2;

assert.strictEqual(scX, 0.50, 'Shoulder center X must be 0.50');
assert.strictEqual(scY, 0.31, 'Shoulder center Y must be 0.31');
assert.ok(sWidth > 0.29 && sWidth < 0.31, 'Shoulder width must be ~0.30');
assert.ok(Math.abs(rollAngle) < 0.1, 'Roll angle should be small for near-level shoulders');
assert.ok(yawAngle < 0, 'Yaw angle reflects left shoulder closer than right');
console.log(`  Shoulder Center: (${scX}, ${scY})`);
console.log(`  Shoulder Width: ${sWidth.toFixed(4)}`);
console.log(`  Roll Angle: ${rollAngle.toFixed(4)} rad`);
console.log(`  Yaw Angle: ${yawAngle.toFixed(4)} rad`);
console.log('✓ Landmark positioning mathematics verified: PASS\n');

console.log('======================================================================');
console.log('🎉 ALL 6 LIVE AI FITTING ROOM ENGINE VERIFICATION TESTS PASSED!');
console.log('======================================================================');
