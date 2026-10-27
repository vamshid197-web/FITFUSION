/**
 * FitFusion Phase 20 — Photo Try-On & VTON Service Suite
 * Handles full-body photo upload, validation, color normalization,
 * and AI Virtual Try-On (VTON) pipeline integration.
 * Privacy-focused: Local client-side processing with modular VTON API integration.
 */

import { MASTER_COLORS } from '../data/customizationOptions.js';
import { VTONClientService } from './vtonClientService.js';

/**
 * Universal Garment Color Normalizer
 * Resolves any color input (string, object, name, hex, short-hex) into a standardized uppercase hex code.
 * Ensures White (#FFFFFF) NEVER resolves to Black (#111827 or #000000).
 */
export function normalizeGarmentColor(col, product = null) {
  if (!col) {
    const prodCol = product?.availableColors?.[0];
    if (prodCol) return normalizeGarmentColor(prodCol, null);
    return '#111827';
  }

  // 1. If color is a string
  if (typeof col === 'string') {
    const trimmed = col.trim();

    // Already a valid hex code
    if (trimmed.startsWith('#')) {
      if (trimmed.length === 4) {
        // Expand #FFF to #FFFFFF
        return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`.toUpperCase();
      }
      return trimmed.toUpperCase();
    }

    const lower = trimmed.toLowerCase();

    // Check MASTER_COLORS from customizationOptions
    const masterMatch = (MASTER_COLORS || []).find(
      (c) => c.name.toLowerCase() === lower || c.id.toLowerCase() === lower
    );
    if (masterMatch?.hex) return masterMatch.hex.toUpperCase();

    // Check product available colors
    const prodMatch = (product?.availableColors || []).find(
      (c) => (c.name || '').toLowerCase() === lower
    );
    if (prodMatch?.hex) return prodMatch.hex.toUpperCase();

    // Comprehensive fashion palette dictionary
    const COLOR_DICTIONARY = {
      white: '#FFFFFF',
      'classic white': '#FFFFFF',
      'pure white': '#FFFFFF',
      snow: '#FFFFFF',
      offwhite: '#F9FAFB',
      'off-white': '#F9FAFB',
      'off white': '#F9FAFB',
      cream: '#FFFBEB',
      ivory: '#FFFFF0',
      beige: '#F5F5DC',
      black: '#111827',
      'obsidian black': '#111827',
      'jet black': '#000000',
      charcoal: '#374151',
      grey: '#6B7280',
      gray: '#6B7280',
      'light grey': '#D1D5DB',
      'light gray': '#D1D5DB',
      navy: '#1E3A8A',
      'classic navy': '#1E3A8A',
      'midnight navy': '#0F172A',
      blue: '#2563EB',
      'royal blue': '#2563EB',
      'sky blue': '#38BDF8',
      'baby blue': '#BAE6FD',
      teal: '#0D9488',
      olive: '#65A30D',
      'forest green': '#15803D',
      mint: '#6EE7B7',
      green: '#16A34A',
      red: '#DC2626',
      crimson: '#BE123C',
      maroon: '#831843',
      burgundy: '#881337',
      wine: '#701A75',
      pink: '#F472B6',
      rose: '#FB7185',
      lavender: '#C084FC',
      purple: '#9333EA',
      yellow: '#EAB308',
      mustard: '#CA8A04',
      orange: '#EA580C',
      brown: '#78350F',
      'chocolate brown': '#451A03',
      tan: '#D2B48C'
    };

    if (COLOR_DICTIONARY[lower]) {
      return COLOR_DICTIONARY[lower];
    }

    // Keyword detection
    if (lower.includes('white') || lower.includes('cream') || lower.includes('ivory')) return '#FFFFFF';
    if (lower.includes('navy')) return '#1E3A8A';
    if (lower.includes('red') || lower.includes('crimson')) return '#DC2626';
    if (lower.includes('blue')) return '#2563EB';
    if (lower.includes('green') || lower.includes('olive')) return '#16A34A';
    if (lower.includes('black')) return '#111827';

    return '#111827';
  }

  // 2. If color is an object { hex, value, name, color }
  if (typeof col === 'object') {
    if (col.hex && typeof col.hex === 'string' && col.hex.startsWith('#')) {
      return col.hex.toUpperCase();
    }
    if (col.value && typeof col.value === 'string' && col.value.startsWith('#')) {
      return col.value.toUpperCase();
    }
    if (col.color && typeof col.color === 'string' && col.color.startsWith('#')) {
      return col.color.toUpperCase();
    }
    if (col.name) {
      return normalizeGarmentColor(col.name, product);
    }
  }

  return '#111827';
}

/**
 * Validates uploaded user photograph for suitability in full-body virtual try-on.
 * Checks format, file size, dimensions, aspect ratio, and lighting.
 */
export async function validateUserPhoto(file, imageElement) {
  const result = {
    isValid: true,
    score: 85,
    message: 'Photo is suitable for full-body virtual try-on.',
    warnings: []
  };

  if (!file) {
    return {
      isValid: false,
      score: 0,
      message: 'No photo file provided.',
      warnings: ['Please choose an image file to upload.']
    };
  }

  // 1. File Format Validation
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const ext = (file.name || '').split('.').pop().toLowerCase();
  const validExts = ['jpg', 'jpeg', 'png', 'webp'];

  if (!validTypes.includes(file.type) && !validExts.includes(ext)) {
    return {
      isValid: false,
      score: 0,
      message: 'Unsupported image format. Please upload JPG, PNG, or WEBP.',
      warnings: ['Supported formats: JPG, JPEG, PNG, WEBP.']
    };
  }

  // 2. File Size Validation (Max 15MB, Min 20KB)
  if (file.size > 15 * 1024 * 1024) {
    return {
      isValid: false,
      score: 10,
      message: 'File size exceeds 15MB. Please upload a smaller image.',
      warnings: ['Max file size: 15MB.']
    };
  }
  if (file.size < 20 * 1024) {
    result.warnings.push('Image resolution is very low; results may be blurry.');
    result.score -= 20;
  }

  // 3. Image Dimensions & Aspect Ratio Analysis
  if (imageElement && imageElement.naturalWidth > 0 && imageElement.naturalHeight > 0) {
    const width = imageElement.naturalWidth;
    const height = imageElement.naturalHeight;
    const aspect = height / width;

    if (width < 320 || height < 400) {
      result.warnings.push('Low image resolution. Higher resolution provides clearer clothing drape.');
      result.score -= 15;
    }

    // Portrait / Full-Body check: Full-body photos typically have aspect ratio >= 1.2
    if (aspect < 0.95) {
      result.warnings.push('Landscape photo detected. For optimal results, upload a vertical full-body portrait.');
      result.score -= 20;
    }

    // 4. Lighting & Contrast Analysis via Canvas Sampling
    try {
      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = 64;
      sampleCanvas.height = 64;
      const ctx = sampleCanvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(imageElement, 0, 0, 64, 64);
      const imgData = ctx.getImageData(0, 0, 64, 64).data;

      let totalBrightness = 0;
      const totalPixels = 64 * 64;
      for (let i = 0; i < imgData.length; i += 4) {
        totalBrightness += (imgData[i] + imgData[i + 1] + imgData[i + 2]) / 3;
      }
      const avgBrightness = totalBrightness / totalPixels;

      if (avgBrightness < 35) {
        result.warnings.push('Photo appears very dark. Better lighting ensures accurate clothing color presentation.');
        result.score -= 15;
      } else if (avgBrightness > 235) {
        result.warnings.push('Photo appears overexposed. Balanced lighting is recommended.');
        result.score -= 10;
      }
    } catch {
      // Non-critical analysis failure handled gracefully
    }
  }

  if (result.warnings.length > 0) {
    result.message = result.warnings[0];
  }

  return result;
}

export const validatePhotoUpload = validateUserPhoto;

/**
 * AI Virtual Try-On (VTON) Engine Client
 * Keeps all AI processing server-side / offloaded to real VTON models (e.g. Kwai-Kolors).
 * Never creates fake 2D canvas or CSS overlays.
 */
export class PhotoVTONService {
  static async isVTONConnected() {
    const status = await VTONClientService.checkStatus();
    return Boolean(status && status.success);
  }

  /**
   * Processes photograph with selected garment specifications via backend AI VTON.
   * If AI service is unavailable, returns honest unavailable status without fake overlays.
   */
  static async processPhotoTryOn({ photoFile, photoDataUrl, product, customization }) {
    if (!photoDataUrl) {
      return {
        success: false,
        status: 'ERROR',
        message: 'No photo provided for virtual try-on.'
      };
    }
    if (!product) {
      return {
        success: false,
        status: 'ERROR',
        message: 'No product selected for virtual try-on.'
      };
    }

    const garmentImg = product.thumbnail || product.image;
    return await VTONClientService.generateTryOn({
      personImage: photoDataUrl,
      garmentImage: garmentImg,
      garmentCategory: product.category,
      productId: product.id,
      productName: product.name,
      options: customization
    });
  }
}

