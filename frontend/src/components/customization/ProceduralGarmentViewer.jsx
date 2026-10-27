import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ── Helper: softly round box corners ──────────────────────────────────────────
function roundBoxVertices(geo, radius) {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const len = Math.sqrt(x * x + y * y + z * z);
    if (len > 0) {
      pos.setXYZ(i, x + (x/len)*radius*0.05, y + (y/len)*radius*0.05, z + (z/len)*radius*0.05);
    }
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
}

function buildTShirt(scene, colorHex, roughness, metalness) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(colorHex), roughness, metalness, side: THREE.DoubleSide });
  const bodyGeo = new THREE.BoxGeometry(0.52, 0.60, 0.12, 4, 6, 2);
  roundBoxVertices(bodyGeo, 0.04);
  const body = new THREE.Mesh(bodyGeo, mat.clone()); body.position.y = -0.05; group.add(body);
  const sleeveGeo = new THREE.CylinderGeometry(0.095, 0.085, 0.24, 12);
  const lSleeve = new THREE.Mesh(sleeveGeo, mat.clone()); lSleeve.rotation.z = Math.PI/2.4; lSleeve.position.set(-0.35, 0.20, 0); group.add(lSleeve);
  const rSleeve = new THREE.Mesh(sleeveGeo, mat.clone()); rSleeve.rotation.z = -Math.PI/2.4; rSleeve.position.set(0.35, 0.20, 0); group.add(rSleeve);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.025, 10, 24, Math.PI), mat.clone());
  collar.position.set(0, 0.29, 0.02); collar.rotation.x = -0.2; group.add(collar);
  group.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  scene.add(group); return group;
}

function buildHoodie(scene, colorHex, roughness, metalness) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(colorHex), roughness, metalness, side: THREE.DoubleSide });
  const bodyGeo = new THREE.BoxGeometry(0.58, 0.70, 0.14, 4, 8, 2);
  roundBoxVertices(bodyGeo, 0.05);
  const body = new THREE.Mesh(bodyGeo, mat.clone()); body.position.y = -0.09; group.add(body);
  const sleeveGeo = new THREE.CylinderGeometry(0.11, 0.095, 0.38, 14);
  const lSleeve = new THREE.Mesh(sleeveGeo, mat.clone()); lSleeve.rotation.z = Math.PI/2.3; lSleeve.position.set(-0.40, 0.18, 0); group.add(lSleeve);
  const rSleeve = new THREE.Mesh(sleeveGeo, mat.clone()); rSleeve.rotation.z = -Math.PI/2.3; rSleeve.position.set(0.40, 0.18, 0); group.add(rSleeve);
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.175, 16, 12, 0, Math.PI*2, 0, Math.PI*0.55), mat.clone());
  hood.position.set(0, 0.33, -0.04); hood.rotation.x = 0.3; group.add(hood);
  const pocketMat = mat.clone(); pocketMat.color.multiplyScalar(0.88);
  const pocketGeo = new THREE.BoxGeometry(0.28, 0.10, 0.015); roundBoxVertices(pocketGeo, 0.02);
  const pocket = new THREE.Mesh(pocketGeo, pocketMat); pocket.position.set(0, -0.21, 0.075); group.add(pocket);
  group.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  scene.add(group); return group;
}

function buildShirt(scene, colorHex, roughness, metalness) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(colorHex), roughness, metalness, side: THREE.DoubleSide });
  const bodyGeo = new THREE.BoxGeometry(0.50, 0.65, 0.11, 4, 8, 2); roundBoxVertices(bodyGeo, 0.03);
  const body = new THREE.Mesh(bodyGeo, mat.clone()); body.position.y = -0.06; group.add(body);
  const sleeveGeo = new THREE.CylinderGeometry(0.085, 0.075, 0.50, 12);
  const lSleeve = new THREE.Mesh(sleeveGeo, mat.clone()); lSleeve.rotation.z = Math.PI/2.2; lSleeve.position.set(-0.42, 0.18, 0); group.add(lSleeve);
  const rSleeve = new THREE.Mesh(sleeveGeo, mat.clone()); rSleeve.rotation.z = -Math.PI/2.2; rSleeve.position.set(0.42, 0.18, 0); group.add(rSleeve);
  const lCollarGeo = new THREE.BoxGeometry(0.12, 0.07, 0.02);
  const lCollar = new THREE.Mesh(lCollarGeo, mat.clone()); lCollar.rotation.z = 0.4; lCollar.position.set(-0.07, 0.31, 0.04); group.add(lCollar);
  const rCollar = new THREE.Mesh(lCollarGeo, mat.clone()); rCollar.rotation.z = -0.4; rCollar.position.set(0.07, 0.31, 0.04); group.add(rCollar);
  const placketMat = mat.clone(); placketMat.color.multiplyScalar(0.96);
  const placket = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.55, 0.012), placketMat); placket.position.set(0, -0.05, 0.06); group.add(placket);
  group.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  scene.add(group); return group;
}

function buildJacket(scene, colorHex, roughness, metalness) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(colorHex), roughness, metalness, side: THREE.DoubleSide });
  const bodyGeo = new THREE.BoxGeometry(0.55, 0.72, 0.14, 4, 8, 2); roundBoxVertices(bodyGeo, 0.04);
  const body = new THREE.Mesh(bodyGeo, mat.clone()); body.position.y = -0.06; group.add(body);
  const lapelMat = mat.clone(); lapelMat.color.multiplyScalar(0.92);
  const lapelGeo = new THREE.BoxGeometry(0.14, 0.26, 0.016);
  const lLapel = new THREE.Mesh(lapelGeo, lapelMat.clone()); lLapel.rotation.z = -0.35; lLapel.position.set(-0.10, 0.18, 0.07); group.add(lLapel);
  const rLapel = new THREE.Mesh(lapelGeo, lapelMat.clone()); rLapel.rotation.z = 0.35; rLapel.position.set(0.10, 0.18, 0.07); group.add(rLapel);
  const sleeveGeo = new THREE.CylinderGeometry(0.10, 0.088, 0.54, 14);
  const lSleeve = new THREE.Mesh(sleeveGeo, mat.clone()); lSleeve.rotation.z = Math.PI/2.15; lSleeve.position.set(-0.43, 0.16, 0); group.add(lSleeve);
  const rSleeve = new THREE.Mesh(sleeveGeo, mat.clone()); rSleeve.rotation.z = -Math.PI/2.15; rSleeve.position.set(0.43, 0.16, 0); group.add(rSleeve);
  const cuffGeo = new THREE.CylinderGeometry(0.092, 0.088, 0.05, 14);
  const lCuff = new THREE.Mesh(cuffGeo, lapelMat.clone()); lCuff.rotation.z = Math.PI/2.15; lCuff.position.set(-0.65, 0.07, 0); group.add(lCuff);
  const rCuff = new THREE.Mesh(cuffGeo, lapelMat.clone()); rCuff.rotation.z = -Math.PI/2.15; rCuff.position.set(0.65, 0.07, 0); group.add(rCuff);
  group.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  scene.add(group); return group;
}

function buildDress(scene, colorHex, roughness, metalness) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(colorHex), roughness, metalness, side: THREE.DoubleSide });
  const bodiceGeo = new THREE.BoxGeometry(0.40, 0.32, 0.10, 4, 6, 2); roundBoxVertices(bodiceGeo, 0.03);
  const bodice = new THREE.Mesh(bodiceGeo, mat.clone()); bodice.position.y = 0.18; group.add(bodice);
  const skirtPts = [];
  for (let i = 0; i <= 12; i++) { const t = i/12; skirtPts.push(new THREE.Vector2(0.18+t*0.32, -0.02-t*0.52)); }
  const skirt = new THREE.Mesh(new THREE.LatheGeometry(skirtPts, 24), mat.clone()); skirt.position.y = 0.23; group.add(skirt);
  const strapGeo = new THREE.BoxGeometry(0.025, 0.14, 0.012);
  const lStrap = new THREE.Mesh(strapGeo, mat.clone()); lStrap.position.set(-0.12, 0.36, 0); group.add(lStrap);
  const rStrap = new THREE.Mesh(strapGeo, mat.clone()); rStrap.position.set(0.12, 0.36, 0); group.add(rStrap);
  group.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  scene.add(group); return group;
}

function buildKurta(scene, colorHex, roughness, metalness) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(colorHex), roughness, metalness, side: THREE.DoubleSide });
  const bodyGeo = new THREE.BoxGeometry(0.50, 0.90, 0.12, 4, 10, 2); roundBoxVertices(bodyGeo, 0.04);
  const body = new THREE.Mesh(bodyGeo, mat.clone()); body.position.y = -0.15; group.add(body);
  const sleeveGeo = new THREE.CylinderGeometry(0.092, 0.08, 0.38, 12);
  const lSleeve = new THREE.Mesh(sleeveGeo, mat.clone()); lSleeve.rotation.z = Math.PI/2.3; lSleeve.position.set(-0.37, 0.22, 0); group.add(lSleeve);
  const rSleeve = new THREE.Mesh(sleeveGeo, mat.clone()); rSleeve.rotation.z = -Math.PI/2.3; rSleeve.position.set(0.37, 0.22, 0); group.add(rSleeve);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.095, 0.06, 16), mat.clone()); collar.position.set(0, 0.33, 0); group.add(collar);
  const placketMat = mat.clone(); placketMat.color.offsetHSL(0, 0.1, -0.1);
  const placket = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.50, 0.013), placketMat); placket.position.set(0, 0.02, 0.063); group.add(placket);
  const hemGeo = new THREE.BoxGeometry(0.52, 0.06, 0.13, 4, 2, 2); roundBoxVertices(hemGeo, 0.02);
  const hem = new THREE.Mesh(hemGeo, mat.clone()); hem.position.y = -0.58; group.add(hem);
  group.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  scene.add(group); return group;
}

function buildPants(scene, colorHex, roughness, metalness) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(colorHex), roughness, metalness, side: THREE.DoubleSide });
  const waistMat = mat.clone(); waistMat.color.multiplyScalar(0.85);
  const waist = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.12), waistMat); waist.position.y = 0.34; group.add(waist);
  const lLegGeo = new THREE.BoxGeometry(0.19, 0.66, 0.13, 3, 8, 2); roundBoxVertices(lLegGeo, 0.04);
  const lLeg = new THREE.Mesh(lLegGeo, mat.clone()); lLeg.position.set(-0.12, -0.04, 0); group.add(lLeg);
  const rLeg = new THREE.Mesh(lLegGeo.clone(), mat.clone()); rLeg.position.set(0.12, -0.04, 0); group.add(rLeg);
  const gusset = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.12), mat.clone()); gusset.position.y = 0.27; group.add(gusset);
  group.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  scene.add(group); return group;
}

function buildSkirt(scene, colorHex, roughness, metalness) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(colorHex), roughness, metalness, side: THREE.DoubleSide });
  const skirtPts = [];
  for (let i = 0; i <= 14; i++) { const t = i/14; skirtPts.push(new THREE.Vector2(0.22+t*0.24, 0.30-t*0.65)); }
  const skirt = new THREE.Mesh(new THREE.LatheGeometry(skirtPts, 28), mat.clone()); group.add(skirt);
  const waist = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 10, 28), mat.clone()); waist.position.y = 0.30; group.add(waist);
  group.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  scene.add(group); return group;
}

function buildTop(scene, colorHex, roughness, metalness) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(colorHex), roughness, metalness, side: THREE.DoubleSide });
  const bodyGeo = new THREE.BoxGeometry(0.44, 0.38, 0.10, 4, 6, 2); roundBoxVertices(bodyGeo, 0.04);
  const body = new THREE.Mesh(bodyGeo, mat.clone()); body.position.y = 0.08; group.add(body);
  const sleeveGeo = new THREE.CylinderGeometry(0.075, 0.068, 0.18, 10);
  const lSleeve = new THREE.Mesh(sleeveGeo, mat.clone()); lSleeve.rotation.z = Math.PI/2.6; lSleeve.position.set(-0.29, 0.23, 0); group.add(lSleeve);
  const rSleeve = new THREE.Mesh(sleeveGeo, mat.clone()); rSleeve.rotation.z = -Math.PI/2.6; rSleeve.position.set(0.29, 0.23, 0); group.add(rSleeve);
  const neck = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.018, 8, 20, Math.PI), mat.clone()); neck.position.set(0, 0.27, 0.03); neck.rotation.x = -0.2; group.add(neck);
  group.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  scene.add(group); return group;
}

function buildSaree(scene, colorHex, roughness, metalness) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(colorHex), roughness: roughness*0.5, metalness: metalness+0.12, side: THREE.DoubleSide });
  const bodyPts = [];
  for (let i = 0; i <= 16; i++) { const t = i/16; bodyPts.push(new THREE.Vector2(0.20+Math.sin(t*Math.PI)*0.16, 0.38-t*0.90)); }
  const body = new THREE.Mesh(new THREE.LatheGeometry(bodyPts, 20), mat.clone()); group.add(body);
  const palluMat = mat.clone(); palluMat.color.offsetHSL(0.02, 0.1, 0.05);
  const pallu = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.72, 0.015, 4, 10, 1), palluMat); pallu.rotation.z = -0.3; pallu.position.set(-0.35, 0.05, 0.04); group.add(pallu);
  const blouseGeo = new THREE.BoxGeometry(0.36, 0.22, 0.10, 4, 4, 2); roundBoxVertices(blouseGeo, 0.03);
  const blouseMat = mat.clone(); blouseMat.color.offsetHSL(0.05, 0.15, -0.1);
  const blouse = new THREE.Mesh(blouseGeo, blouseMat); blouse.position.y = 0.34; group.add(blouse);
  group.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  scene.add(group); return group;
}

function buildSportswear(scene, colorHex, roughness, metalness) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(colorHex), roughness: roughness*0.7, metalness, side: THREE.DoubleSide });
  const bodyGeo = new THREE.BoxGeometry(0.48, 0.58, 0.10, 4, 7, 2); roundBoxVertices(bodyGeo, 0.03);
  const body = new THREE.Mesh(bodyGeo, mat.clone()); body.position.y = -0.04; group.add(body);
  const accentMat = mat.clone(); accentMat.color.multiplyScalar(0.75);
  const sleeveGeo = new THREE.CylinderGeometry(0.08, 0.068, 0.22, 12);
  const lSleeve = new THREE.Mesh(sleeveGeo, accentMat.clone()); lSleeve.rotation.z = Math.PI/2.4; lSleeve.position.set(-0.33, 0.22, 0); group.add(lSleeve);
  const rSleeve = new THREE.Mesh(sleeveGeo, accentMat.clone()); rSleeve.rotation.z = -Math.PI/2.4; rSleeve.position.set(0.33, 0.22, 0); group.add(rSleeve);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.022, 10, 22, Math.PI), accentMat.clone()); collar.position.set(0, 0.28, 0.02); collar.rotation.x = -0.2; group.add(collar);
  const stripeGeo = new THREE.BoxGeometry(0.04, 0.50, 0.012);
  const lStripe = new THREE.Mesh(stripeGeo, accentMat.clone()); lStripe.position.set(-0.23, -0.05, 0.052); group.add(lStripe);
  const rStripe = new THREE.Mesh(stripeGeo, accentMat.clone()); rStripe.position.set(0.23, -0.05, 0.052); group.add(rStripe);
  group.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  scene.add(group); return group;
}

function buildKids(scene, colorHex, roughness, metalness) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(colorHex), roughness, metalness, side: THREE.DoubleSide });
  const bodyGeo = new THREE.BoxGeometry(0.38, 0.42, 0.10, 4, 5, 2); roundBoxVertices(bodyGeo, 0.05);
  const body = new THREE.Mesh(bodyGeo, mat.clone()); body.position.y = -0.02; group.add(body);
  const accentMat = mat.clone(); accentMat.color.multiplyScalar(0.82);
  const sleeveGeo = new THREE.CylinderGeometry(0.075, 0.068, 0.16, 10);
  const lSleeve = new THREE.Mesh(sleeveGeo, accentMat.clone()); lSleeve.rotation.z = Math.PI/2.4; lSleeve.position.set(-0.27, 0.17, 0); group.add(lSleeve);
  const rSleeve = new THREE.Mesh(sleeveGeo, accentMat.clone()); rSleeve.rotation.z = -Math.PI/2.4; rSleeve.position.set(0.27, 0.17, 0); group.add(rSleeve);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 8, 20, Math.PI), mat.clone()); collar.position.set(0, 0.21, 0.02); collar.rotation.x = -0.2; group.add(collar);
  group.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  scene.add(group); return group;
}

function buildShorts(scene, colorHex, roughness, metalness) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(colorHex), roughness, metalness, side: THREE.DoubleSide });
  const waistMat = mat.clone(); waistMat.color.multiplyScalar(0.85);
  const waist = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.075, 0.12), waistMat); waist.position.y = 0.22; group.add(waist);
  const legGeo = new THREE.BoxGeometry(0.19, 0.34, 0.12, 3, 4, 2); roundBoxVertices(legGeo, 0.04);
  const lLeg = new THREE.Mesh(legGeo, mat.clone()); lLeg.position.set(-0.12, 0.02, 0); group.add(lLeg);
  const rLeg = new THREE.Mesh(legGeo.clone(), mat.clone()); rLeg.position.set(0.12, 0.02, 0); group.add(rLeg);
  group.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  scene.add(group); return group;
}

function getGarmentBuilder(product) {
  const cat = String(product?.category || '').toLowerCase();
  const name = String(product?.name || '').toLowerCase();
  const s = cat + name;
  if (/saree|sari/.test(s)) return { builder: buildSaree, label: 'Saree 3D', key: 'saree' };
  if (/lehenga/.test(s)) return { builder: buildDress, label: 'Lehenga 3D', key: 'lehenga' };
  if (/kurta|ethnic|traditional|sherwani|bandhgala/.test(s)) return { builder: buildKurta, label: 'Kurta 3D', key: 'kurta' };
  if (/dress|gown|maxi|frock/.test(s)) return { builder: buildDress, label: 'Dress 3D', key: 'dress' };
  if (/skirt/.test(s)) return { builder: buildSkirt, label: 'Skirt 3D', key: 'skirt' };
  if (/top|crop|blouse/.test(s)) return { builder: buildTop, label: 'Top 3D', key: 'top' };
  if (/hoodie|sweatshirt|pullover/.test(s)) return { builder: buildHoodie, label: 'Hoodie 3D', key: 'hoodie' };
  if (/jacket|blazer|suit|coat/.test(s)) return { builder: buildJacket, label: 'Jacket 3D', key: 'jacket' };
  if (/sport|active|jersey|athletic|workout/.test(s)) return { builder: buildSportswear, label: 'Sportswear 3D', key: 'sport' };
  if (/t[-\s]?shirt|tee|polo/.test(s)) return { builder: buildTShirt, label: 'T-Shirt 3D', key: 'tshirt' };
  if (/shirt/.test(s)) return { builder: buildShirt, label: 'Shirt 3D', key: 'shirt' };
  if (/kids|child|boy|girl|junior/.test(s)) return { builder: buildKids, label: 'Kids 3D', key: 'kids' };
  if (/short/.test(s)) return { builder: buildShorts, label: 'Shorts 3D', key: 'shorts' };
  if (/pant|jean|trouser|chino|denim/.test(s)) return { builder: buildPants, label: 'Pants 3D', key: 'pants' };
  return { builder: buildTShirt, label: 'Garment 3D', key: 'generic' };
}

function getFabricPBR(fabricInput) {
  const name = String(typeof fabricInput === 'object' ? (fabricInput?.name || '') : (fabricInput || '')).toLowerCase();
  if (name.includes('silk') || name.includes('satin')) return { roughness: 0.28, metalness: 0.12 };
  if (name.includes('wool') || name.includes('tweed') || name.includes('merino')) return { roughness: 0.82, metalness: 0.03 };
  if (name.includes('denim') || name.includes('jean')) return { roughness: 0.88, metalness: 0.04 };
  if (name.includes('linen') || name.includes('flax')) return { roughness: 0.92, metalness: 0.01 };
  if (name.includes('poly') || name.includes('polyester')) return { roughness: 0.46, metalness: 0.08 };
  if (name.includes('supima') || name.includes('premium')) return { roughness: 0.70, metalness: 0.02 };
  if (name.includes('blend')) return { roughness: 0.64, metalness: 0.04 };
  return { roughness: 0.82, metalness: 0.02 };
}

export default function ProceduralGarmentViewer({
  product, selectedColor, selectedFabric,
  customText = '', textFont = 'Montserrat', textColor = '#FFFFFF',
  uploadedImage = null, aiGeneratedDesign = null,
  activePlacement = 'front', autoRotateDefault = false,
  onViewChange, className = ''
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const garmentGroupRef = useRef(null);
  const decalGroupRef = useRef(null);
  const animFrameRef = useRef(null);
  const targetCamRef = useRef(null);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotateDefault);
  const [activeAngle, setActiveAngle] = useState('front');
  const [garmentLabel, setGarmentLabel] = useState('Garment 3D');
  const colorHex = typeof selectedColor === 'string' ? selectedColor : (selectedColor?.hex || '#FFFFFF');

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const w = container.clientWidth || 640, h = container.clientHeight || 600;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080C14);
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(38, w/h, 0.05, 40);
    camera.position.set(0, 0.05, 1.6);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true; controls.dampingFactor = 0.06;
    controls.minDistance = 0.7; controls.maxDistance = 3.0;
    controls.minPolarAngle = Math.PI/8; controls.maxPolarAngle = Math.PI/2 + 0.2;
    controls.target.set(0, 0, 0);
    controls.autoRotate = autoRotateDefault; controls.autoRotateSpeed = 2.5;
    controlsRef.current = controls;
    const decalGroup = new THREE.Group(); scene.add(decalGroup); decalGroupRef.current = decalGroup;
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const keyLight = new THREE.DirectionalLight(0xfffef8, 1.6);
    keyLight.position.set(1.5, 2.8, 2.2); keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048); keyLight.shadow.bias = -0.0006; scene.add(keyLight);
    const fill = new THREE.DirectionalLight(0x8bb8ff, 0.7); fill.position.set(-2.2, 1.0, 1.5); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xb48bfa, 1.1); rim.position.set(0, 2.5, -2.2); scene.add(rim);
    const btm = new THREE.DirectionalLight(0x5080c0, 0.35); btm.position.set(0, -2, 1); scene.add(btm);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x4466ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.36, 0.44, 52), ringMat);
    ring.rotation.x = -Math.PI/2; ring.position.y = -0.52; scene.add(ring);
    const glow = new THREE.Mesh(new THREE.CircleGeometry(0.36, 52), new THREE.MeshBasicMaterial({ color: 0x1122aa, transparent: true, opacity: 0.12, side: THREE.DoubleSide }));
    glow.rotation.x = -Math.PI/2; glow.position.y = -0.521; scene.add(glow);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: 0.4 }));
    floor.rotation.x = -Math.PI/2; floor.position.y = -0.525; floor.receiveShadow = true; scene.add(floor);
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      if (targetCamRef.current && cameraRef.current) {
        cameraRef.current.position.lerp(targetCamRef.current, 0.09);
        if (cameraRef.current.position.distanceTo(targetCamRef.current) < 0.008) {
          cameraRef.current.position.copy(targetCamRef.current); targetCamRef.current = null;
        }
      }
      ringMat.opacity = 0.28 + Math.sin(Date.now()*0.002)*0.08;
      controls.update(); renderer.render(scene, camera);
    };
    animate();
    const onResize = () => {
      const ctr = containerRef.current; if (!ctr) return;
      const nw = ctr.clientWidth, nh = ctr.clientHeight; if (!nw || !nh) return;
      camera.aspect = nw/nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(animFrameRef.current); controls.dispose(); renderer.dispose(); };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current; if (!scene) return;
    const { builder, label } = getGarmentBuilder(product);
    setGarmentLabel(label);
    if (garmentGroupRef.current) {
      scene.remove(garmentGroupRef.current);
      garmentGroupRef.current.traverse(c => {
        if (c.isMesh) { c.geometry?.dispose(); if (Array.isArray(c.material)) c.material.forEach(m => m.dispose()); else c.material?.dispose(); }
      });
      garmentGroupRef.current = null;
    }
    const pbr = getFabricPBR(selectedFabric);
    const grp = builder(scene, colorHex, pbr.roughness, pbr.metalness);
    const box = new THREE.Box3().setFromObject(grp);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 0.88 / maxDim;
    grp.scale.setScalar(scale);
    grp.position.set(-center.x*scale, -center.y*scale, -center.z*scale);
    garmentGroupRef.current = grp;
  }, [product?.id, product?.category]);

  useEffect(() => {
    const grp = garmentGroupRef.current; if (!grp) return;
    const pbr = getFabricPBR(selectedFabric);
    grp.traverse(c => { if (c.isMesh && c.material) { c.material.roughness = pbr.roughness; c.material.metalness = pbr.metalness; c.material.needsUpdate = true; } });
  }, [selectedFabric]);

  useEffect(() => {
    const grp = garmentGroupRef.current; if (!grp) return;
    let first = true;
    grp.traverse(c => { if (c.isMesh && c.material && first) { c.material.color.set(colorHex); c.material.needsUpdate = true; first = false; } });
  }, [colorHex]);

  useEffect(() => {
    const scene = sceneRef.current, decalGroup = decalGroupRef.current;
    if (!scene || !decalGroup) return;
    while (decalGroup.children.length) { const ch = decalGroup.children[0]; ch.geometry?.dispose(); ch.material?.dispose(); decalGroup.remove(ch); }
    const hasText = customText && customText.trim();
    const hasImage = uploadedImage || aiGeneratedDesign;
    if (!hasText && !hasImage) return;
    const makeCanvas = (cb) => { const c = document.createElement('canvas'); c.width = 512; c.height = 512; const ctx = c.getContext('2d'); if (ctx) cb(ctx); return c; };
    const getXform = () => {
      if (activePlacement === 'back') return { pos: new THREE.Vector3(0, 0.05, -0.085), rot: new THREE.Euler(0, Math.PI, 0), sz: 0.28 };
      if (activePlacement === 'left_sleeve') return { pos: new THREE.Vector3(-0.38, 0.10, 0), rot: new THREE.Euler(0, -Math.PI/2, 0), sz: 0.16 };
      if (activePlacement === 'right_sleeve') return { pos: new THREE.Vector3(0.38, 0.10, 0), rot: new THREE.Euler(0, Math.PI/2, 0), sz: 0.16 };
      return { pos: new THREE.Vector3(0, 0.05, 0.085), rot: new THREE.Euler(0, 0, 0), sz: 0.26 };
    };
    const { pos, rot, sz } = getXform();
    const applyDecal = (canvas) => {
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(sz, sz), m);
      plane.position.copy(pos); plane.rotation.copy(rot); decalGroup.add(plane);
    };
    if (hasText) {
      const c = makeCanvas((ctx) => {
        ctx.clearRect(0, 0, 512, 512);
        const fs = Math.max(42, Math.min(96, Math.floor(480/(customText.length*0.55+1))));
        ctx.font = `900 ${fs}px ${textFont||'Montserrat'}, sans-serif`;
        ctx.fillStyle = textColor || '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 10;
        ctx.fillText(customText.toUpperCase(), 256, 256);
      });
      applyDecal(c);
    }
    const loadImg = (src) => {
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => { const c = makeCanvas((ctx) => { ctx.clearRect(0,0,512,512); ctx.drawImage(img,24,24,464,464); }); applyDecal(c); };
      img.src = src;
    };
    if (uploadedImage) loadImg(uploadedImage);
    else if (aiGeneratedDesign) loadImg(aiGeneratedDesign);
  }, [customText, textFont, textColor, uploadedImage, aiGeneratedDesign, activePlacement]);

  useEffect(() => { if (controlsRef.current) controlsRef.current.autoRotate = isAutoRotating; }, [isAutoRotating]);

  const setCameraView = useCallback((view) => {
    setActiveAngle(view); setIsAutoRotating(false); if (onViewChange) onViewChange(view);
    const presets = { front:[0,0.05,1.6], back:[0,0.05,-1.6], left:[-1.6,0.05,0], right:[1.6,0.05,0], reset:[0,0.05,1.6] };
    const p = presets[view] || presets.front;
    targetCamRef.current = new THREE.Vector3(...p);
    if (view === 'reset' && controlsRef.current) controlsRef.current.target.set(0,0,0);
  }, [onViewChange]);

  const handleZoom = useCallback((inward) => {
    const camera = cameraRef.current, controls = controlsRef.current;
    if (!camera || !controls) return;
    const dir = new THREE.Vector3().subVectors(controls.target, camera.position).normalize();
    const dist = camera.position.distanceTo(controls.target);
    if (inward && dist > controls.minDistance+0.12) camera.position.addScaledVector(dir, 0.18);
    if (!inward && dist < controls.maxDistance-0.12) camera.position.addScaledVector(dir.negate(), 0.18);
    controls.update();
  }, []);

  return (
    <div ref={containerRef}
      className={`relative w-full h-full min-h-[520px] lg:min-h-[660px] rounded-2xl overflow-hidden select-none ${className}`}
      style={{ background: 'linear-gradient(160deg,#080C14 0%,#0C1220 60%,#0A0E1A 100%)' }}
    >
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing outline-none" />
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-xl text-xs font-semibold text-neutral-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{garmentLabel}</span>
          <span className="text-neutral-500">•</span>
          <span className="text-violet-400 font-mono text-[11px]">{product?.category || 'Apparel'}</span>
        </div>
      </div>
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div className="flex items-center rounded-xl bg-black/60 backdrop-blur-md border border-white/10 shadow-lg overflow-hidden">
          <button type="button" onClick={() => handleZoom(true)} className="w-8 h-8 flex items-center justify-center text-sm font-bold text-neutral-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer" title="Zoom In">+</button>
          <div className="w-px h-4 bg-white/10" />
          <button type="button" onClick={() => handleZoom(false)} className="w-8 h-8 flex items-center justify-center text-sm font-bold text-neutral-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer" title="Zoom Out">-</button>
        </div>
        <button type="button" onClick={() => setIsAutoRotating(p => !p)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all cursor-pointer ${isAutoRotating ? 'bg-violet-600/90 text-white border-violet-400 shadow-lg shadow-violet-600/30' : 'bg-black/60 text-neutral-300 border-white/10 hover:text-white hover:bg-white/10'}`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          <span>{isAutoRotating ? '360 On' : 'Rotate'}</span>
        </button>
      </div>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 p-1.5 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 shadow-2xl">
        {['front','back','left','right'].map(v => (
          <button key={v} type="button" onClick={() => setCameraView(v)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all capitalize ${activeAngle===v ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
          >{v}</button>
        ))}
        <div className="w-px h-4 bg-white/10 mx-0.5" />
        <button type="button" onClick={() => setCameraView('reset')} className="px-2.5 py-1.5 text-xs font-medium text-neutral-500 hover:text-white hover:bg-white/10 rounded-xl transition-all">Reset</button>
      </div>
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden sm:block">
        <span className="text-[11px] font-medium text-neutral-600 tracking-wide">Drag to orbit • Scroll to zoom</span>
      </div>
      {(customText || uploadedImage || aiGeneratedDesign) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="px-2.5 py-1 rounded-full bg-blue-600/80 backdrop-blur-sm border border-blue-400/50 text-white text-[10px] font-bold tracking-wider uppercase">
            {activePlacement==='front' ? 'Chest' : activePlacement==='back' ? 'Back' : 'Sleeve'}
          </div>
        </div>
      )}
    </div>
  );
}
