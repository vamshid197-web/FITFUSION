/**
 * FitFusion Phase 20 — Real-Time Body-Anchored Garment Overlay Engine
 * Renders tailored clothing directly onto detected human body landmarks:
 * Shoulders, Neck, Chest, Waist, Hips, and Arms with PBR lighting & fabric textures.
 */

import { normalizeGarmentColor } from './photoTryOnService.js';

export class GarmentOverlayRenderer {
  // Preloaded product photography cache for instant 60 FPS rendering
  static imageCache = new Map();

  static getProductPhotoImage(src) {
    if (!src) return null;
    if (this.imageCache.has(src)) {
      const item = this.imageCache.get(src);
      return item.loaded ? item.img : null;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const entry = { img, loaded: false };
    this.imageCache.set(src, entry);
    img.onload = () => { entry.loaded = true; };
    img.onerror = () => { entry.error = true; };
    img.src = src;
    return null;
  }

  /**
   * Main entry point: renders tailored clothing onto a 2D canvas context
   */
  static renderGarment(ctx, {
    landmarks,
    pose,
    product,
    customization = {},
    canvasWidth = 640,
    canvasHeight = 480,
    calibration = {},
    mode = 'photographic' // 'photographic' | 'vector'
  } = {}) {
    if (!ctx || !landmarks || !landmarks.leftShoulder || !landmarks.rightShoulder) return;

    const category = product?.category || 'T-Shirts';
    const colorHex = this.resolveColorHex(customization, product);
    const fabricName = customization?.fabric?.name || (typeof customization?.fabric === 'string' ? customization.fabric : 'Cotton');
    const fit = customization?.fit || 'Regular'; // 'Slim' | 'Regular' | 'Relaxed'
    const monogramText = customization?.monogramText || '';
    const monogramThreadColor = customization?.monogramThreadColor || '#F59E0B';
    const designLayers = customization?.designLayers || [];

    // User fine-tuning calibration offsets
    const scaleMult = (calibration.scaleMultiplier || 1.0) * this.getSizeScaleMultiplier(customization?.size);
    const offsetY = (calibration.offsetY || 0.0) * canvasHeight;
    const offsetX = (calibration.offsetX || 0.0) * canvasWidth;
    const opacity = calibration.opacity !== undefined ? calibration.opacity : 1.0;

    // Anchor points in canvas pixel coordinates
    const leftShX = landmarks.leftShoulder.x * canvasWidth + offsetX;
    const leftShY = landmarks.leftShoulder.y * canvasHeight + offsetY;

    const rightShX = landmarks.rightShoulder.x * canvasWidth + offsetX;
    const rightShY = landmarks.rightShoulder.y * canvasHeight + offsetY;

    const effectivePose = pose || landmarks;

    // Horizontal position: Center garment accurately between user's shoulders (using pose if provided)
    const centerX = (effectivePose?.shoulderCenter?.x !== undefined ? (effectivePose.shoulderCenter.x * canvasWidth) : ((leftShX + rightShX) / 2)) + offsetX;
    const shoulderDist = (effectivePose?.shoulderWidth !== undefined ? (effectivePose.shoulderWidth * canvasWidth) : Math.hypot(rightShX - leftShX, rightShY - leftShY));

    // Dynamic shoulder angle: garment rotates naturally with the user's body posture
    const shoulderAngle = effectivePose?.bodyRotation !== undefined ? effectivePose.bodyRotation : Math.atan2(rightShY - leftShY, rightShX - leftShX);

    // Vertical position: Anchor neckline near shoulder/neck area
    const neckTopY = Math.min(leftShY, rightShY) - (shoulderDist * 0.16);
    const neckX = centerX;
    const neckY = landmarks.neck?.y ? (landmarks.neck.y * canvasHeight + offsetY) : neckTopY;

    const chestX = centerX;
    const chestY = landmarks.chestCenter?.y
      ? (landmarks.chestCenter.y * canvasHeight + offsetY)
      : (neckY + shoulderDist * 0.42);

    const waistY = landmarks.leftHip?.y
      ? (landmarks.leftHip.y * canvasHeight + offsetY)
      : (chestY + shoulderDist * 0.92);

    const torsoHeight = (effectivePose?.torsoHeight !== undefined
      ? (effectivePose.torsoHeight * canvasHeight)
      : Math.max(90, (waistY - neckY))) * scaleMult;
    const halfSpan = (shoulderDist / 2) * scaleMult;

    const waistLeftX = centerX - halfSpan * 0.85;
    const waistRightX = centerX + halfSpan * 0.85;

    ctx.save();
    ctx.globalAlpha = Math.max(0.2, Math.min(1.0, opacity));

    // Rotate garment naturally with user body angle around (centerX, chestY)
    ctx.translate(centerX, chestY);
    ctx.rotate(shoulderAngle);
    ctx.translate(-centerX, -chestY);

    // Outer ambient occlusion shadow on user body for 3D depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;

    // In Photographic Fabric Mode: If product photograph is available, render authentic warped photo
    if (mode === 'photographic') {
      const photoSrc = product?.image || (Array.isArray(product?.images) && product.images[0]);
      const photoImg = photoSrc ? this.getProductPhotoImage(photoSrc) : null;
      if (photoImg) {
        this.drawPhotographicGarment(ctx, p, photoImg);
        ctx.restore();
        return;
      }
    }

    // Route to category-specific garment drape geometry
    const catLower = category.toLowerCase();
    const p = {
      neckX, neckY, leftShX, leftShY, rightShX, rightShY,
      chestX, chestY, waistLeftX, waistRightX, waistY,
      halfSpan, torsoHeight, colorHex, fabricName, fit,
      monogramText, monogramThreadColor, designLayers
    };

    if (catLower.includes('jean') || catLower.includes('pant') || catLower.includes('chino')) {
      this.drawPants(ctx, { waistLeftX, waistRightX, waistY, torsoHeight, colorHex, fabricName, fit });
    } else if (catLower.includes('dress')) {
      this.drawDress(ctx, p);
    } else if (catLower.includes('kurta') || catLower.includes('traditional')) {
      this.drawKurta(ctx, p);
    } else if (catLower.includes('jacket') || catLower.includes('blazer')) {
      this.drawJacket(ctx, p);
    } else if (catLower.includes('hoodie') || catLower.includes('sweatshirt')) {
      this.drawHoodie(ctx, p);
    } else if (catLower.includes('shirt')) {
      this.drawDressShirt(ctx, p);
    } else {
      // Default: Tailored T-Shirt / Crewneck
      this.drawTShirt(ctx, p);
    }

    ctx.restore();
  }

  /**
   * Real Photographic Garment Warping & Shading
   * Maps authentic catalog product photo onto body landmarks with anatomical contour clipping,
   * natural fabric crease shading, ambient occlusion, and collar/seam blending.
   */
  static drawPhotographicGarment(ctx, p, photoImg) {
    const {
      neckX, neckY, leftShX, leftShY, rightShX, rightShY,
      chestX, chestY, waistLeftX, waistRightX, waistY,
      halfSpan, torsoHeight, fit, monogramText, monogramThreadColor
    } = p;

    const waistW = halfSpan * (fit === 'Slim' ? 0.82 : fit === 'Relaxed' ? 1.05 : 0.90);
    const sleeveDrop = torsoHeight * 0.32;

    ctx.save();

    // 1. Precise anatomical body contour clipping path
    ctx.beginPath();
    ctx.moveTo(chestX - halfSpan * 0.30, neckY);
    ctx.quadraticCurveTo(chestX, neckY + torsoHeight * 0.12, chestX + halfSpan * 0.30, neckY);
    ctx.lineTo(rightShX + halfSpan * 0.25, rightShY);
    ctx.lineTo(rightShX + halfSpan * 0.58, rightShY + sleeveDrop);
    ctx.lineTo(rightShX + halfSpan * 0.28, rightShY + sleeveDrop + 16);
    ctx.lineTo(chestX + halfSpan * 0.92, chestY);
    ctx.lineTo(chestX + waistW, waistY);
    ctx.quadraticCurveTo(chestX, waistY + torsoHeight * 0.06, chestX - waistW, waistY);
    ctx.lineTo(chestX - halfSpan * 0.92, chestY);
    ctx.lineTo(leftShX - halfSpan * 0.28, leftShY + sleeveDrop + 16);
    ctx.lineTo(leftShX - halfSpan * 0.58, leftShY + sleeveDrop);
    ctx.lineTo(leftShX - halfSpan * 0.25, leftShY);
    ctx.closePath();
    ctx.clip();

    // 2. Render authentic product photograph mapped across the anatomical torso bounds
    const photoWidth = halfSpan * 2.5;
    const photoHeight = torsoHeight * 1.35;
    const photoX = chestX - (photoWidth / 2);
    const photoY = neckY - (torsoHeight * 0.08);

    ctx.drawImage(photoImg, photoX, photoY, photoWidth, photoHeight);

    // 3. Dynamic Ambient Edge Occlusion (soft shading that curves the photo around the cylindrical 3D body)
    const edgeShade = ctx.createLinearGradient(leftShX - halfSpan * 0.5, chestY, rightShX + halfSpan * 0.5, chestY);
    edgeShade.addColorStop(0, 'rgba(0, 0, 0, 0.40)');
    edgeShade.addColorStop(0.18, 'rgba(0, 0, 0, 0.05)');
    edgeShade.addColorStop(0.5, 'rgba(255, 255, 255, 0.10)');
    edgeShade.addColorStop(0.82, 'rgba(0, 0, 0, 0.05)');
    edgeShade.addColorStop(1, 'rgba(0, 0, 0, 0.40)');
    ctx.fillStyle = edgeShade;
    ctx.fillRect(photoX, photoY, photoWidth, photoHeight);

    // 4. Fabric crease overlays for natural drape
    this.drawClothCreases(ctx, chestX, chestY, halfSpan, torsoHeight);

    // 5. Collar Hem line for crisp neckline integration
    ctx.beginPath();
    ctx.moveTo(chestX - halfSpan * 0.30, neckY);
    ctx.quadraticCurveTo(chestX, neckY + torsoHeight * 0.12, chestX + halfSpan * 0.30, neckY);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();

    // 6. Monogram / Decal overlay if specified
    if (monogramText && monogramText.trim()) {
      this.drawMonogram(ctx, chestX - halfSpan * 0.42, chestY - torsoHeight * 0.05, monogramText, monogramThreadColor);
    }
  }

  /**
   * Tailored T-Shirt drape geometry & fabric rendering
   */
  static drawTShirt(ctx, p) {
    const { neckX, neckY, leftShX, leftShY, rightShX, rightShY, chestX, chestY, waistY, halfSpan, torsoHeight, colorHex, fabricName, fit, monogramText, monogramThreadColor } = p;

    const waistW = halfSpan * (fit === 'Slim' ? 0.80 : fit === 'Relaxed' ? 1.05 : 0.90);
    const sleeveLength = halfSpan * 0.55;
    const sleeveDrop = torsoHeight * 0.28;

    // --- MAIN TORSO & SLEEVES PATH ---
    ctx.beginPath();
    // Start at neck collar left
    ctx.moveTo(chestX - halfSpan * 0.32, neckY);
    // Neck collar scoop
    ctx.quadraticCurveTo(chestX, neckY + torsoHeight * 0.12, chestX + halfSpan * 0.32, neckY);
    // Right shoulder seam
    ctx.lineTo(rightShX + halfSpan * 0.25, rightShY);
    // Right sleeve outer seam
    ctx.lineTo(rightShX + halfSpan * 0.55, rightShY + sleeveDrop);
    // Right sleeve cuff
    ctx.lineTo(rightShX + halfSpan * 0.28, rightShY + sleeveDrop + 14);
    // Right armpit
    ctx.lineTo(chestX + halfSpan * 0.92, chestY);
    // Right waist side
    ctx.lineTo(chestX + waistW, waistY);
    // Bottom hem curve
    ctx.quadraticCurveTo(chestX, waistY + torsoHeight * 0.06, chestX - waistW, waistY);
    // Left waist side
    ctx.lineTo(chestX - halfSpan * 0.92, chestY);
    // Left armpit to sleeve cuff
    ctx.lineTo(leftShX - halfSpan * 0.28, leftShY + sleeveDrop + 14);
    // Left sleeve outer seam
    ctx.lineTo(leftShX - halfSpan * 0.55, leftShY + sleeveDrop);
    // Left shoulder seam
    ctx.lineTo(leftShX - halfSpan * 0.25, leftShY);
    ctx.closePath();

    // Fill with dynamic lighting gradient
    const grad = ctx.createLinearGradient(leftShX, leftShY, rightShX + halfSpan * 0.5, waistY);
    grad.addColorStop(0, this.lightenDarkenColor(colorHex, 15));
    grad.addColorStop(0.45, colorHex);
    grad.addColorStop(1, this.lightenDarkenColor(colorHex, -22));
    ctx.fillStyle = grad;
    ctx.fill();

    // Fabric texture weave overlay
    this.applyFabricTexture(ctx, chestX - halfSpan * 1.1, neckY, halfSpan * 2.2, torsoHeight * 1.15, fabricName);

    // Dynamic cloth crease & contour shading
    this.drawClothCreases(ctx, chestX, chestY, halfSpan, torsoHeight);

    // Collar Ribbing
    ctx.beginPath();
    ctx.moveTo(chestX - halfSpan * 0.32, neckY);
    ctx.quadraticCurveTo(chestX, neckY + torsoHeight * 0.12, chestX + halfSpan * 0.32, neckY);
    ctx.quadraticCurveTo(chestX, neckY + torsoHeight * 0.08, chestX - halfSpan * 0.32, neckY);
    ctx.fillStyle = this.lightenDarkenColor(colorHex, -18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Custom Monogram Embroidery on Left Chest
    if (monogramText && monogramText.trim()) {
      this.drawMonogram(ctx, chestX - halfSpan * 0.42, chestY - torsoHeight * 0.05, monogramText, monogramThreadColor);
    }

    // Custom Design Studio Layers
    if (p.designLayers && p.designLayers.length > 0) {
      this.drawDesignLayers(ctx, chestX, chestY - torsoHeight * 0.02, halfSpan, torsoHeight, p.designLayers);
    }
  }

  /**
   * Tailored Formal/Casual Shirt with dress collar, button placket, and cuffs
   */
  static drawDressShirt(ctx, p) {
    const { neckX, neckY, leftShX, leftShY, rightShX, rightShY, chestX, chestY, waistY, halfSpan, torsoHeight, colorHex, fabricName, fit, monogramText, monogramThreadColor } = p;
    const waistW = halfSpan * (fit === 'Slim' ? 0.78 : fit === 'Relaxed' ? 1.02 : 0.86);
    const sleeveDrop = torsoHeight * 0.65;

    ctx.beginPath();
    ctx.moveTo(chestX - halfSpan * 0.26, neckY - 6);
    ctx.lineTo(chestX + halfSpan * 0.26, neckY - 6);
    ctx.lineTo(rightShX + halfSpan * 0.28, rightShY);
    ctx.lineTo(rightShX + halfSpan * 0.48, rightShY + sleeveDrop);
    ctx.lineTo(rightShX + halfSpan * 0.28, rightShY + sleeveDrop + 18);
    ctx.lineTo(chestX + halfSpan * 0.88, chestY);
    ctx.lineTo(chestX + waistW, waistY);
    // Curved shirt-tail hem
    ctx.quadraticCurveTo(chestX, waistY + torsoHeight * 0.08, chestX - waistW, waistY);
    ctx.lineTo(chestX - halfSpan * 0.88, chestY);
    ctx.lineTo(leftShX - halfSpan * 0.28, leftShY + sleeveDrop + 18);
    ctx.lineTo(leftShX - halfSpan * 0.48, leftShY + sleeveDrop);
    ctx.lineTo(leftShX - halfSpan * 0.28, leftShY);
    ctx.closePath();

    const grad = ctx.createLinearGradient(leftShX, leftShY, rightShX, waistY);
    grad.addColorStop(0, this.lightenDarkenColor(colorHex, 20));
    grad.addColorStop(0.5, colorHex);
    grad.addColorStop(1, this.lightenDarkenColor(colorHex, -18));
    ctx.fillStyle = grad;
    ctx.fill();

    this.applyFabricTexture(ctx, chestX - halfSpan, neckY, halfSpan * 2, torsoHeight * 1.1, fabricName);

    // Center Button Placket
    ctx.fillStyle = this.lightenDarkenColor(colorHex, -12);
    ctx.fillRect(chestX - 7, neckY + 12, 14, waistY - neckY - 4);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.strokeRect(chestX - 7, neckY + 12, 14, waistY - neckY - 4);

    // Mother-of-pearl buttons
    const numButtons = 5;
    const buttonSpacing = (waistY - neckY - 30) / numButtons;
    for (let i = 0; i < numButtons; i++) {
      const by = neckY + 25 + i * buttonSpacing;
      ctx.beginPath();
      ctx.arc(chestX, by, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#F8FAFC';
      ctx.fill();
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Spread Dress Collar Wings
    ctx.beginPath();
    ctx.moveTo(chestX, neckY + 14);
    ctx.lineTo(chestX - halfSpan * 0.28, neckY - 8);
    ctx.lineTo(chestX - halfSpan * 0.35, neckY + 20);
    ctx.lineTo(chestX, neckY + 14);
    ctx.fillStyle = this.lightenDarkenColor(colorHex, 15);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(chestX, neckY + 14);
    ctx.lineTo(chestX + halfSpan * 0.28, neckY - 8);
    ctx.lineTo(chestX + halfSpan * 0.35, neckY + 20);
    ctx.lineTo(chestX, neckY + 14);
    ctx.fillStyle = this.lightenDarkenColor(colorHex, 15);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.stroke();

    if (monogramText && monogramText.trim()) {
      this.drawMonogram(ctx, chestX - halfSpan * 0.42, chestY - torsoHeight * 0.05, monogramText, monogramThreadColor);
    }

    // Custom Design Studio Layers
    if (p.designLayers && p.designLayers.length > 0) {
      this.drawDesignLayers(ctx, chestX, chestY - torsoHeight * 0.02, halfSpan, torsoHeight, p.designLayers);
    }
  }

  /**
   * Streetwear Hoodie / Sweatshirt with cowl hood, kangaroo pouch, and dropped shoulders
   */
  static drawHoodie(ctx, p) {
    const { neckX, neckY, leftShX, leftShY, rightShX, rightShY, chestX, chestY, waistY, halfSpan, torsoHeight, colorHex, fabricName, fit, monogramText, monogramThreadColor } = p;
    const waistW = halfSpan * (fit === 'Slim' ? 0.88 : fit === 'Relaxed' ? 1.15 : 0.98);
    const sleeveDrop = torsoHeight * 0.60;

    ctx.beginPath();
    ctx.moveTo(chestX - halfSpan * 0.36, neckY - 14);
    // Cowl hood top
    ctx.quadraticCurveTo(chestX, neckY - 26, chestX + halfSpan * 0.36, neckY - 14);
    ctx.lineTo(rightShX + halfSpan * 0.35, rightShY);
    ctx.lineTo(rightShX + halfSpan * 0.58, rightShY + sleeveDrop);
    ctx.lineTo(rightShX + halfSpan * 0.36, rightShY + sleeveDrop + 20);
    ctx.lineTo(chestX + halfSpan * 0.98, chestY);
    ctx.lineTo(chestX + waistW, waistY);
    // Ribbed bottom band
    ctx.lineTo(chestX + waistW, waistY + 18);
    ctx.lineTo(chestX - waistW, waistY + 18);
    ctx.lineTo(chestX - waistW, waistY);
    ctx.lineTo(chestX - halfSpan * 0.98, chestY);
    ctx.lineTo(leftShX - halfSpan * 0.36, leftShY + sleeveDrop + 20);
    ctx.lineTo(leftShX - halfSpan * 0.58, leftShY + sleeveDrop);
    ctx.lineTo(leftShX - halfSpan * 0.35, leftShY);
    ctx.closePath();

    const grad = ctx.createLinearGradient(leftShX, leftShY, rightShX, waistY);
    grad.addColorStop(0, this.lightenDarkenColor(colorHex, 18));
    grad.addColorStop(0.5, colorHex);
    grad.addColorStop(1, this.lightenDarkenColor(colorHex, -22));
    ctx.fillStyle = grad;
    ctx.fill();

    this.applyFabricTexture(ctx, chestX - halfSpan * 1.1, neckY - 20, halfSpan * 2.2, torsoHeight * 1.2, fabricName);

    // Kangaroo Pocket
    const pocketW = waistW * 0.65;
    const pocketTopY = chestY + torsoHeight * 0.15;
    const pocketBottomY = waistY - 6;

    ctx.beginPath();
    ctx.moveTo(chestX - pocketW, pocketTopY);
    ctx.lineTo(chestX + pocketW, pocketTopY);
    ctx.lineTo(chestX + pocketW * 0.85, pocketBottomY);
    ctx.lineTo(chestX - pocketW * 0.85, pocketBottomY);
    ctx.closePath();
    ctx.fillStyle = this.lightenDarkenColor(colorHex, -14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Drawstrings
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(chestX - 16, neckY + 10);
    ctx.quadraticCurveTo(chestX - 22, chestY - 10, chestX - 18, chestY + 15);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(chestX + 16, neckY + 10);
    ctx.quadraticCurveTo(chestX + 22, chestY - 10, chestX + 18, chestY + 15);
    ctx.stroke();

    if (monogramText && monogramText.trim()) {
      this.drawMonogram(ctx, chestX - halfSpan * 0.42, chestY - torsoHeight * 0.05, monogramText, monogramThreadColor);
    }

    // Custom Design Studio Layers
    if (p.designLayers && p.designLayers.length > 0) {
      this.drawDesignLayers(ctx, chestX, chestY - torsoHeight * 0.04, halfSpan, torsoHeight, p.designLayers);
    }
  }

  /**
   * Bespoke Blazer / Jacket with structured lapels and tailoring lines
   */
  static drawJacket(ctx, p) {
    const { neckX, neckY, leftShX, leftShY, rightShX, rightShY, chestX, chestY, waistY, halfSpan, torsoHeight, colorHex, fabricName, fit, monogramText, monogramThreadColor } = p;
    const waistW = halfSpan * (fit === 'Slim' ? 0.82 : fit === 'Relaxed' ? 1.05 : 0.90);
    const sleeveDrop = torsoHeight * 0.68;

    ctx.beginPath();
    ctx.moveTo(chestX - halfSpan * 0.28, neckY - 8);
    ctx.lineTo(chestX + halfSpan * 0.28, neckY - 8);
    ctx.lineTo(rightShX + halfSpan * 0.32, rightShY);
    ctx.lineTo(rightShX + halfSpan * 0.52, rightShY + sleeveDrop);
    ctx.lineTo(rightShX + halfSpan * 0.30, rightShY + sleeveDrop + 16);
    ctx.lineTo(chestX + halfSpan * 0.90, chestY);
    ctx.lineTo(chestX + waistW, waistY + 12);
    ctx.lineTo(chestX - waistW, waistY + 12);
    ctx.lineTo(chestX - halfSpan * 0.90, chestY);
    ctx.lineTo(leftShX - halfSpan * 0.30, leftShY + sleeveDrop + 16);
    ctx.lineTo(leftShX - halfSpan * 0.52, leftShY + sleeveDrop);
    ctx.lineTo(leftShX - halfSpan * 0.32, leftShY);
    ctx.closePath();

    const grad = ctx.createLinearGradient(leftShX, leftShY, rightShX, waistY);
    grad.addColorStop(0, this.lightenDarkenColor(colorHex, 18));
    grad.addColorStop(0.5, colorHex);
    grad.addColorStop(1, this.lightenDarkenColor(colorHex, -22));
    ctx.fillStyle = grad;
    ctx.fill();

    this.applyFabricTexture(ctx, chestX - halfSpan, neckY, halfSpan * 2, torsoHeight * 1.2, fabricName);

    // Deep V-Opening and Lapels
    ctx.beginPath();
    ctx.moveTo(chestX - halfSpan * 0.28, neckY - 8);
    ctx.lineTo(chestX - halfSpan * 0.35, chestY - 10);
    ctx.lineTo(chestX - 10, waistY - torsoHeight * 0.25);
    ctx.lineTo(chestX + 10, waistY - torsoHeight * 0.25);
    ctx.lineTo(chestX + halfSpan * 0.35, chestY - 10);
    ctx.lineTo(chestX + halfSpan * 0.28, neckY - 8);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Lapel fold fill
    ctx.fillStyle = this.lightenDarkenColor(colorHex, 12);
    ctx.fill();

    // Breast pocket
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(chestX - halfSpan * 0.55, chestY - torsoHeight * 0.12, halfSpan * 0.28, 6);

    // Jacket Horn Buttons
    ctx.beginPath();
    ctx.arc(chestX, waistY - torsoHeight * 0.22, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.stroke();

    if (monogramText && monogramText.trim()) {
      this.drawMonogram(ctx, chestX - halfSpan * 0.42, chestY + 12, monogramText, monogramThreadColor);
    }

    // Custom Design Studio Layers
    if (p.designLayers && p.designLayers.length > 0) {
      this.drawDesignLayers(ctx, chestX, chestY + 10, halfSpan, torsoHeight, p.designLayers);
    }
  }

  /**
   * Flared Dress with tailored bodice and flowing skirt
   */
  static drawDress(ctx, p) {
    const { neckX, neckY, leftShX, leftShY, rightShX, rightShY, chestX, chestY, waistY, halfSpan, torsoHeight, colorHex, fabricName, fit, monogramText, monogramThreadColor } = p;
    const waistW = halfSpan * 0.72; // Curbed waistline
    const skirtHemY = waistY + torsoHeight * 0.85;
    const skirtHemW = halfSpan * 1.45; // Flared silhouette

    ctx.beginPath();
    ctx.moveTo(chestX - halfSpan * 0.28, neckY);
    ctx.quadraticCurveTo(chestX, neckY + torsoHeight * 0.12, chestX + halfSpan * 0.28, neckY);
    ctx.lineTo(rightShX + halfSpan * 0.20, rightShY);
    ctx.lineTo(chestX + halfSpan * 0.82, chestY);
    ctx.lineTo(chestX + waistW, waistY);
    // Skirt flare
    ctx.quadraticCurveTo(chestX + skirtHemW * 0.9, (waistY + skirtHemY) / 2, chestX + skirtHemW, skirtHemY);
    // Curved hem
    ctx.quadraticCurveTo(chestX, skirtHemY + 18, chestX - skirtHemW, skirtHemY);
    ctx.quadraticCurveTo(chestX - skirtHemW * 0.9, (waistY + skirtHemY) / 2, chestX - waistW, waistY);
    ctx.lineTo(chestX - halfSpan * 0.82, chestY);
    ctx.lineTo(leftShX - halfSpan * 0.20, leftShY);
    ctx.closePath();

    const grad = ctx.createLinearGradient(leftShX, leftShY, rightShX, skirtHemY);
    grad.addColorStop(0, this.lightenDarkenColor(colorHex, 22));
    grad.addColorStop(0.4, colorHex);
    grad.addColorStop(1, this.lightenDarkenColor(colorHex, -18));
    ctx.fillStyle = grad;
    ctx.fill();

    this.applyFabricTexture(ctx, chestX - skirtHemW, neckY, skirtHemW * 2, torsoHeight * 2, fabricName);

    // Waistband accent
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(chestX - waistW, waistY);
    ctx.lineTo(chestX + waistW, waistY);
    ctx.stroke();

    if (monogramText && monogramText.trim()) {
      this.drawMonogram(ctx, chestX - halfSpan * 0.38, chestY, monogramText, monogramThreadColor);
    }

    if (p.designLayers && p.designLayers.length > 0) {
      this.drawDesignLayers(ctx, chestX, chestY - torsoHeight * 0.02, halfSpan, torsoHeight, p.designLayers);
    }
  }

  /**
   * Heritage Kurta / Traditional Wear with mandarin collar and elongated tunic hem
   */
  static drawKurta(ctx, p) {
    const { neckX, neckY, leftShX, leftShY, rightShX, rightShY, chestX, chestY, waistY, halfSpan, torsoHeight, colorHex, fabricName, fit, monogramText, monogramThreadColor } = p;
    const waistW = halfSpan * 0.88;
    const kurtaHemY = waistY + torsoHeight * 0.65;
    const sleeveDrop = torsoHeight * 0.55;

    ctx.beginPath();
    ctx.moveTo(chestX - halfSpan * 0.22, neckY - 8);
    ctx.lineTo(chestX + halfSpan * 0.22, neckY - 8);
    ctx.lineTo(rightShX + halfSpan * 0.25, rightShY);
    ctx.lineTo(rightShX + halfSpan * 0.45, rightShY + sleeveDrop);
    ctx.lineTo(rightShX + halfSpan * 0.26, rightShY + sleeveDrop + 14);
    ctx.lineTo(chestX + halfSpan * 0.85, chestY);
    ctx.lineTo(chestX + waistW, waistY);
    ctx.lineTo(chestX + waistW * 1.05, kurtaHemY);
    ctx.lineTo(chestX - waistW * 1.05, kurtaHemY);
    ctx.lineTo(chestX - waistW, waistY);
    ctx.lineTo(chestX - halfSpan * 0.85, chestY);
    ctx.lineTo(leftShX - halfSpan * 0.26, leftShY + sleeveDrop + 14);
    ctx.lineTo(leftShX - halfSpan * 0.45, leftShY + sleeveDrop);
    ctx.lineTo(leftShX - halfSpan * 0.25, leftShY);
    ctx.closePath();

    const grad = ctx.createLinearGradient(leftShX, leftShY, rightShX, kurtaHemY);
    grad.addColorStop(0, this.lightenDarkenColor(colorHex, 20));
    grad.addColorStop(0.5, colorHex);
    grad.addColorStop(1, this.lightenDarkenColor(colorHex, -18));
    ctx.fillStyle = grad;
    ctx.fill();

    this.applyFabricTexture(ctx, chestX - halfSpan, neckY, halfSpan * 2, torsoHeight * 1.7, fabricName);

    // Mandarin Stand Collar
    ctx.fillStyle = this.lightenDarkenColor(colorHex, 15);
    ctx.fillRect(chestX - halfSpan * 0.22, neckY - 10, halfSpan * 0.44, 8);

    // Front Placket with Gold Zari Buttons
    ctx.fillStyle = this.lightenDarkenColor(colorHex, -12);
    ctx.fillRect(chestX - 5, neckY - 2, 10, torsoHeight * 0.35);

    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(chestX, neckY + 12 + i * 16, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#F59E0B'; // Gold zari button
      ctx.fill();
    }

    if (monogramText && monogramText.trim()) {
      this.drawMonogram(ctx, chestX - halfSpan * 0.40, chestY, monogramText, monogramThreadColor);
    }

    if (p.designLayers && p.designLayers.length > 0) {
      this.drawDesignLayers(ctx, chestX, chestY - torsoHeight * 0.02, halfSpan, torsoHeight, p.designLayers);
    }
  }

  /**
   * Tailored Pants / Chinos / Jeans
   */
  static drawPants(ctx, p) {
    const { waistLeftX, waistRightX, waistY, torsoHeight, colorHex, fabricName, fit } = p;
    const pantsH = torsoHeight * 1.5;
    const pantsW = Math.abs(waistRightX - waistLeftX);
    const midX = (waistLeftX + waistRightX) / 2;
    const legW = pantsW * 0.42 * (fit === 'Slim' ? 0.85 : fit === 'Relaxed' ? 1.15 : 1.0);

    ctx.beginPath();
    ctx.moveTo(waistLeftX, waistY);
    ctx.lineTo(waistRightX, waistY);
    // Right outer leg
    ctx.lineTo(midX + legW * 1.1, waistY + pantsH);
    // Right cuff
    ctx.lineTo(midX + 8, waistY + pantsH);
    // Crotch junction
    ctx.lineTo(midX, waistY + pantsH * 0.35);
    // Left cuff
    ctx.lineTo(midX - 8, waistY + pantsH);
    // Left outer leg
    ctx.lineTo(midX - legW * 1.1, waistY + pantsH);
    ctx.closePath();

    const grad = ctx.createLinearGradient(waistLeftX, waistY, waistRightX, waistY + pantsH);
    grad.addColorStop(0, this.lightenDarkenColor(colorHex, 12));
    grad.addColorStop(0.5, colorHex);
    grad.addColorStop(1, this.lightenDarkenColor(colorHex, -22));
    ctx.fillStyle = grad;
    ctx.fill();

    this.applyFabricTexture(ctx, waistLeftX, waistY, pantsW, pantsH, fabricName);

    // Waistband
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 3;
    ctx.strokeRect(waistLeftX, waistY, pantsW, 14);
  }

  /**
   * Synthesizes optical fabric textures (Linen, Silk, Denim, Cotton, Wool)
   */
  static applyFabricTexture(ctx, x, y, w, h, fabricName) {
    const fab = (fabricName || 'Cotton').toLowerCase();

    ctx.save();
    if (fab.includes('silk') || fab.includes('satin')) {
      // Lustrous diagonal sheen band
      const sheenGrad = ctx.createLinearGradient(x, y, x + w, y + h);
      sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
      sheenGrad.addColorStop(0.48, 'rgba(255, 255, 255, 0.28)');
      sheenGrad.addColorStop(0.52, 'rgba(255, 255, 255, 0.35)');
      sheenGrad.addColorStop(0.56, 'rgba(255, 255, 255, 0.12)');
      sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = sheenGrad;
      ctx.fillRect(x, y, w, h);
    } else if (fab.includes('linen')) {
      // Subtle organic horizontal slub lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      const step = 6;
      for (let ly = y; ly < y + h; ly += step) {
        ctx.beginPath();
        ctx.moveTo(x, ly);
        ctx.lineTo(x + w, ly);
        ctx.stroke();
      }
    } else if (fab.includes('denim')) {
      // Diagonal twill weave
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1;
      const step = 8;
      for (let offset = -h; offset < w; offset += step) {
        ctx.beginPath();
        ctx.moveTo(x + offset, y);
        ctx.lineTo(x + offset + h, y + h);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /**
   * Draws realistic soft folds & shadows across torso
   */
  static drawClothCreases(ctx, cx, cy, halfSpan, torsoHeight) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.14)';
    ctx.lineWidth = 2.5;

    // Left waist curve fold
    ctx.beginPath();
    ctx.moveTo(cx - halfSpan * 0.7, cy + torsoHeight * 0.1);
    ctx.quadraticCurveTo(cx - halfSpan * 0.4, cy + torsoHeight * 0.25, cx - halfSpan * 0.6, cy + torsoHeight * 0.4);
    ctx.stroke();

    // Right waist curve fold
    ctx.beginPath();
    ctx.moveTo(cx + halfSpan * 0.7, cy + torsoHeight * 0.1);
    ctx.quadraticCurveTo(cx + halfSpan * 0.4, cy + torsoHeight * 0.25, cx + halfSpan * 0.6, cy + torsoHeight * 0.4);
    ctx.stroke();

    // Highlight ridge
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - halfSpan * 0.1, cy - torsoHeight * 0.05);
    ctx.quadraticCurveTo(cx, cy + torsoHeight * 0.15, cx - halfSpan * 0.05, cy + torsoHeight * 0.35);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Renders customized embroidered monogram
   */
  static drawMonogram(ctx, x, y, text, threadColor) {
    ctx.save();
    ctx.font = 'bold 15px "Times New Roman", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Drop shadow under embroidery
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillText(text.trim().toUpperCase(), x + 1, y + 1);

    // Thread embroidery color
    ctx.fillStyle = threadColor;
    ctx.fillText(text.trim().toUpperCase(), x, y);

    // Subtle satin highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText(text.trim().toUpperCase(), x - 0.5, y - 0.5);

    ctx.restore();
  }

  /**
   * Renders bespoke design studio layers (custom prints, text, graphics, patches)
   */
  static drawDesignLayers(ctx, cx, cy, halfSpan, torsoHeight, designLayers) {
    if (!Array.isArray(designLayers) || designLayers.length === 0) return;

    ctx.save();
    for (const layer of designLayers) {
      if (!layer) continue;
      const layerType = layer.type || 'text';
      const printArea = layer.printArea || 'front';
      if (printArea === 'back') continue; // only front area visible in fitting room mirror

      const targetX = cx;
      const targetY = cy + torsoHeight * 0.04;

      if (layerType === 'text' && layer.text) {
        ctx.save();
        ctx.font = `bold ${Math.max(11, Math.round(halfSpan * 0.16))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = layer.color || '#FFFFFF';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(String(layer.text).slice(0, 30), targetX, targetY);
        ctx.restore();
      } else if (layer.imageUrl || layer.previewUrl) {
        try {
          if (!this._imageCache) this._imageCache = new Map();
          const url = layer.imageUrl || layer.previewUrl;
          let img = this._imageCache.get(url);
          if (!img) {
            img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = url;
            this._imageCache.set(url, img);
          }
          if (img.complete && img.naturalWidth > 0) {
            const dw = halfSpan * 0.65;
            const dh = (img.naturalHeight / img.naturalWidth) * dw;
            ctx.drawImage(img, targetX - dw / 2, targetY - dh / 2, dw, dh);
          }
        } catch (e) {}
      } else if (layer.title || layer.name) {
        ctx.save();
        const badgeW = halfSpan * 0.55;
        const badgeH = Math.max(20, torsoHeight * 0.16);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        if (typeof ctx.roundRect === 'function') {
          ctx.beginPath();
          ctx.roundRect(targetX - badgeW / 2, targetY - badgeH / 2, badgeW, badgeH, 6);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(targetX - badgeW / 2, targetY - badgeH / 2, badgeW, badgeH);
          ctx.strokeRect(targetX - badgeW / 2, targetY - badgeH / 2, badgeW, badgeH);
        }

        ctx.font = `bold ${Math.max(9, Math.round(halfSpan * 0.11))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(layer.title || layer.name, targetX, targetY);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  static resolveColorHex(customization, product) {
    const col = customization?.color || customization?.selectedColor || product?.availableColors?.[0];
    return normalizeGarmentColor(col, product);
  }

  static getSizeScaleMultiplier(size) {
    switch (size) {
      case 'XS': return 0.92;
      case 'S': return 0.96;
      case 'M': return 1.0;
      case 'L': return 1.05;
      case 'XL': return 1.10;
      case '2XL': return 1.16;
      default: return 1.0;
    }
  }

  static lightenDarkenColor(col, amt) {
    const hex = normalizeGarmentColor(col);
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    if (isNaN(num)) return hex;

    let r = (num >> 16) + amt;
    let g = ((num >> 8) & 0x00FF) + amt;
    let b = (num & 0x0000FF) + amt;

    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    const rr = r.toString(16).padStart(2, '0');
    const gg = g.toString(16).padStart(2, '0');
    const bb = b.toString(16).padStart(2, '0');
    return `#${rr}${gg}${bb}`.toUpperCase();
  }
}

if (typeof window !== 'undefined') {
  window.__FITFUSION_RENDERER__ = GarmentOverlayRenderer;
}
