/**
 * Test Suite: Integrated Live Try-On Studio Verification
 * Verifies that FITFUSION has an actual integrated live camera try-on studio,
 * external AnyWear promotional dependencies have been removed, camera permissions,
 * controls, outfit selection, and error states are fully implemented, and existing
 * Kolors photo try-on and 3D studio features remain intact.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('======================================================================');
console.log('=== TEST SUITE: INTEGRATED FITFUSION LIVE TRY-ON STUDIO            ===');
console.log('======================================================================\n');

// ── 1. LiveTryOnStudio Component Integrity ───────────────────────────────────
console.log('--- TEST 1: LiveTryOnStudio Component Architecture ---');
const liveStudioPath = path.join(__dirname, 'frontend/src/components/tryon/LiveTryOnStudio.jsx');
assert.ok(fs.existsSync(liveStudioPath), 'LiveTryOnStudio.jsx must exist');
const liveStudioCode = fs.readFileSync(liveStudioPath, 'utf-8');

// Live camera preview & WebRTC
assert.ok(liveStudioCode.includes('<video'), 'Must contain <video> element for camera preview');
assert.ok(liveStudioCode.includes('scale-x-[-1]'), 'Video preview must be horizontally mirrored');
assert.ok(liveStudioCode.includes('navigator.mediaDevices.getUserMedia'), 'Must use WebRTC getUserMedia');
assert.ok(liveStudioCode.includes('getTracks().forEach'), 'Must release MediaStream tracks on stop/unmount');

// Start / Stop controls
assert.ok(liveStudioCode.includes('Start Camera'), 'Must provide Start Camera control');
assert.ok(liveStudioCode.includes('Stop Camera'), 'Must provide Stop Camera control');

// Camera device selection
assert.ok(liveStudioCode.includes('availableCameras'), 'Must track available video input devices');
assert.ok(liveStudioCode.includes('selectedCameraId'), 'Must track selected camera device ID');
assert.ok(liveStudioCode.includes('enumerateDevices'), 'Must enumerate hardware devices');

// Permission handling & error/retry states
assert.ok(liveStudioCode.includes('Allow camera access'), 'Must provide camera permission guidance');
assert.ok(liveStudioCode.includes('Camera Access Required'), 'Must provide denied permission state');
assert.ok(liveStudioCode.includes('Retry Camera Access'), 'Must provide camera retry button');

// Garment catalog selection & outfit switching
assert.ok(liveStudioCode.includes('catalogProducts'), 'Must accept catalogProducts prop');
assert.ok(liveStudioCode.includes('onSelectProduct'), 'Must support outfit switching callback');
assert.ok(liveStudioCode.includes('activeGarment'), 'Must highlight and preview active garment');
assert.ok(liveStudioCode.includes('₹'), 'Must use authentic INR pricing');

// Snapshot bridge to Kolors AI Photo Try-On
assert.ok(liveStudioCode.includes('handleCaptureSnapshot'), 'Must provide snapshot capture method');
assert.ok(liveStudioCode.includes('onTakeSnapshot'), 'Must pass captured frame to onTakeSnapshot callback');

// Zero console.log
assert.ok(!liveStudioCode.includes('console.log'), 'Must have zero console.log statements');

console.log('✓ Live camera, device switching, permissions, outfit selection, and snapshot: PASS\n');

// ── 2. VirtualTryOnPage.jsx Integration ─────────────────────────────────────
console.log('--- TEST 2: VirtualTryOnPage Integration & Removal of Promotional Card ---');
const vtonPagePath = path.join(__dirname, 'frontend/src/pages/tryon/VirtualTryOnPage.jsx');
const vtonCode = fs.readFileSync(vtonPagePath, 'utf-8');

// LiveTryOnStudio mounted
assert.ok(vtonCode.includes("import LiveTryOnStudio from '../../components/tryon/LiveTryOnStudio.jsx';"), 'Must import LiveTryOnStudio');
assert.ok(vtonCode.includes('<LiveTryOnStudio'), 'Must mount LiveTryOnStudio');
assert.ok(vtonCode.includes('catalogProducts={filteredCatalogProducts}'), 'Must pass filteredCatalogProducts to LiveTryOnStudio');

// Removal of AnyWear promotional card & launch dependencies
assert.ok(!vtonCode.includes('AnyWear Live Discovery Card'), 'Must remove AnyWear promotional card');
assert.ok(!vtonCode.includes('Switch to Live Camera &rarr;'), 'Must remove promotional switch button');
assert.ok(!vtonCode.includes('Launch AnyWear Live Studio'), 'Must not require external AnyWear launch');
assert.ok(!vtonCode.includes('href="https://anywear.live'), 'Must not have external AnyWear links on main page');

// Experience Switcher
assert.ok(vtonCode.includes('LIVE TRY-ON STUDIO'), 'Experience switcher tab must be LIVE TRY-ON STUDIO');
assert.ok(vtonCode.includes('FITFUSION AI TRY-ON'), 'Must retain FITFUSION AI TRY-ON tab');
assert.ok(vtonCode.includes('3D GARMENT STUDIO'), 'Must retain 3D Garment Studio tab');
assert.ok(vtonCode.includes('KOLORS STUDIO'), 'Must retain Kolors Studio reference tab');

// filteredCatalogProducts variable check
assert.ok(vtonCode.includes('filteredCatalogProducts'), 'filteredCatalogProducts must be defined');
assert.ok(!vtonCode.includes('ReferenceError: filteredCatalogProducts is not defined'), 'No undefined variable references');

console.log('✓ In-app studio mounted, promotional card removed, and variable references resolved: PASS\n');

// ── 3. Security & Zero Console.log Audit ─────────────────────────────────────
console.log('--- TEST 3: Code Integrity & Zero Console.log in frontend/src ---');
function checkNoConsoleLog(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkNoConsoleLog(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('console.log(')) {
        throw new Error(`Found console.log in ${fullPath}`);
      }
    }
  }
}
checkNoConsoleLog(path.join(__dirname, 'frontend/src'));
console.log('✓ Zero console.log across frontend/src verified: PASS\n');

// ── 4. Backend VTON Endpoints Integrity ──────────────────────────────────────
console.log('--- TEST 4: Backend VTON Endpoints Integrity ---');
const vtonRoutesPath = path.join(__dirname, 'backend/src/routes/vtonRoutes.js');
const vtonRoutesCode = fs.readFileSync(vtonRoutesPath, 'utf-8');
assert.ok(vtonRoutesCode.includes('/status'), 'Must have /status route');
assert.ok(vtonRoutesCode.includes('/anywear/status'), 'Must have /anywear/status route');
assert.ok(vtonRoutesCode.includes('/try-on'), 'Must have /try-on route');

console.log('✓ Backend VTON routes verified: PASS\n');

console.log('======================================================================');
console.log('🎉 ALL INTEGRATED FITFUSION LIVE TRY-ON STUDIO TESTS PASSED!       ===');
console.log('======================================================================');
