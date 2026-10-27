import React, { useState, useEffect, useRef } from 'react';
import { getProductMappedImage, isProductImageRequired, PRODUCT_IMAGE_MAP } from '../../data/productImageMap.js';

/**
 * Luxury Atelier Monogram Badge (NO 2D vectors, cartoon or clothing silhouettes)
 * Displayed when an authentic studio photograph is required from the user/catalog.
 */
function AtelierMonogram({ category = 'Apparel', productName = '', className = '' }) {
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center p-4 bg-neutral-100 text-neutral-500 select-none ${className}`}>
      <div className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center mb-2 shadow-2xs bg-white">
        <span className="text-xs font-serif font-black tracking-widest text-neutral-700">FF</span>
      </div>
      <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
        FitFusion Atelier
      </span>
      {productName && (
        <span className="text-[11px] font-medium text-neutral-700 text-center line-clamp-1 max-w-[85%] mt-1">
          {productName}
        </span>
      )}
      <span className="text-[9px] text-neutral-400 font-medium tracking-wider mt-0.5 uppercase">
        {category || 'Collection'} • Studio Photo Pending
      </span>
    </div>
  );
}

export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length !== 6) return null;
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function getHslFromRgb({ r, g, b }) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
      case gNorm: h = (bNorm - rNorm) / d + 2; break;
      case bNorm: h = (rNorm - gNorm) / d + 4; break;
      default: break;
    }
    h = h / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Multi-layer garment tint computation with luminance and texture preservation.
 */
export function computeGarmentTint(colorInput) {
  if (!colorInput || typeof colorInput !== 'string') return null;
  const trimmed = colorInput.trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'transparent' || trimmed.toLowerCase() === 'none') {
    return null;
  }

  let hex = trimmed;
  if (!hex.startsWith('#')) {
    const common = {
      white: '#FFFFFF',
      black: '#111827',
      red: '#DC2626',
      blue: '#2563EB',
      green: '#15803D',
      yellow: '#EAB308',
      navy: '#1E3A8A',
      grey: '#6B7280',
      beige: '#F5F5DC',
      cream: '#FFFBEB'
    };
    hex = common[hex.toLowerCase()] || '#111827';
  }

  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const hsl = getHslFromRgb(rgb);

  const isWhite = hsl.l >= 93 && hsl.s <= 30;
  const isLightCream = !isWhite && hsl.l >= 85 && hsl.s <= 60;
  const isBlack = hsl.l <= 18;
  const isGrey = !isWhite && !isBlack && !isLightCream && hsl.s <= 22;
  const isYellow = !isWhite && !isLightCream && hsl.h >= 35 && hsl.h <= 65;
  const isDeep = !isBlack && (hsl.l < 42 || (hsl.s > 70 && hsl.l < 48));

  if (isWhite) {
    return {
      type: 'white',
      imgFilter: 'brightness(1.22) contrast(1.08)',
      layers: [
        { blend: 'color', bg: hex, opacity: 0.95 },
        { blend: 'screen', bg: '#FFFFFF', opacity: 0.72 },
        { blend: 'soft-light', bg: '#FFFFFF', opacity: 0.35 }
      ]
    };
  }

  if (isLightCream) {
    return {
      type: 'lightCream',
      imgFilter: 'brightness(1.12) contrast(1.06)',
      layers: [
        { blend: 'color', bg: hex, opacity: 0.92 },
        { blend: 'screen', bg: hex, opacity: 0.48 },
        { blend: 'soft-light', bg: hex, opacity: 0.35 }
      ]
    };
  }

  if (isBlack) {
    return {
      type: 'black',
      imgFilter: 'brightness(0.70) contrast(1.22)',
      layers: [
        { blend: 'color', bg: '#000000', opacity: 0.95 },
        { blend: 'multiply', bg: hex, opacity: 0.86 },
        { blend: 'soft-light', bg: '#1F2937', opacity: 0.42 }
      ]
    };
  }

  if (isGrey) {
    return {
      type: 'grey',
      imgFilter: 'grayscale(0.4) contrast(1.06)',
      layers: [
        { blend: 'color', bg: hex, opacity: 0.95 },
        { blend: hsl.l < 50 ? 'multiply' : 'soft-light', bg: hex, opacity: 0.38 }
      ]
    };
  }

  if (isYellow) {
    return {
      type: 'yellow',
      imgFilter: 'brightness(1.14) saturate(1.2)',
      layers: [
        { blend: 'color', bg: hex, opacity: 0.92 },
        { blend: 'soft-light', bg: hex, opacity: 0.60 },
        { blend: 'overlay', bg: hex, opacity: 0.22 }
      ]
    };
  }

  return {
    type: 'vibrant',
    imgFilter: 'saturate(1.15)',
    layers: [
      { blend: 'color', bg: hex, opacity: 0.90 },
      { blend: isDeep ? 'multiply' : 'soft-light', bg: hex, opacity: isDeep ? 0.48 : 0.52 },
      ...(isDeep ? [{ blend: 'color', bg: hex, opacity: 0.25 }] : [])
    ]
  };
}

/**
 * Intelligent client-side garment colorizer.
 * Only recolors garment pixels.
 * Completely ignores:
 * - Background pixels (white, cream, studio grey)
 * - Human skin tones (face, neck, arms, hands)
 * Preserves luminance, shadows, highlights, folds, texture, seams.
 */
function recolorGarmentCanvas(sourceImg, targetHex, canvas) {
  if (!sourceImg || !targetHex || !canvas) return false;
  const targetRgb = hexToRgb(targetHex);
  if (!targetRgb) return false;

  const w = sourceImg.naturalWidth || sourceImg.width || 300;
  const h = sourceImg.naturalHeight || sourceImg.height || 380;
  if (!w || !h) return false;

  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  try {
    ctx.drawImage(sourceImg, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const len = data.length;

    const tr = targetRgb.r;
    const tg = targetRgb.g;
    const tb = targetRgb.b;

    for (let i = 0; i < len; i += 4) {
      const a = data[i + 3];
      if (a < 15) continue;

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // 1. Background Check (studio white / light gray backdrop)
      const isPureWhite = r > 242 && g > 242 && b > 242;
      const isStudioNeutral = r > 220 && g > 220 && b > 220 && Math.abs(r - g) < 18 && Math.abs(g - b) < 18;
      if (isPureWhite || isStudioNeutral) {
        continue; // Keep background untouched!
      }

      // 2. Human Skin Tone Check (face, hands, neck)
      const isSkinColor =
        r > 60 &&
        g > 40 &&
        b > 20 &&
        r > g &&
        g > b &&
        r - g >= 8 &&
        r - b >= 15 &&
        r < 245;
      if (isSkinColor) {
        continue; // Keep human skin untouched!
      }

      // 3. Garment Pixel — Recolor with luminance preservation
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const normLum = lum / 255;

      if (normLum > 0.88) {
        data[i] = Math.min(255, Math.round(r * 0.6 + tr * normLum * 0.4));
        data[i + 1] = Math.min(255, Math.round(g * 0.6 + tg * normLum * 0.4));
        data[i + 2] = Math.min(255, Math.round(b * 0.6 + tb * normLum * 0.4));
      } else if (normLum < 0.12) {
        data[i] = Math.round((tr / 255) * lum * 0.8);
        data[i + 1] = Math.round((tg / 255) * lum * 0.8);
        data[i + 2] = Math.round((tb / 255) * lum * 0.8);
      } else {
        data[i] = Math.min(255, Math.round((tr / 255) * lum * 1.12));
        data[i + 1] = Math.min(255, Math.round((tg / 255) * lum * 1.12));
        data[i + 2] = Math.min(255, Math.round((tb / 255) * lum * 1.12));
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Reusable ProductImage Component
 * Powered by central PRODUCT_IMAGE_MAP source of truth.
 */
export default function ProductImage({
  src,
  productId = null,
  alt = 'Product image',
  className = '',
  containerClassName = '',
  fallbackCategory = 'Shirts',
  category = null,
  tintColor = null,
  colorImages = null,
  selectedColor = null,
  aspectRatio = 'aspect-[3/4]',
  loading = 'lazy'
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [canvasActive, setCanvasActive] = useState(false);

  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  // 1. Resolve image from direct source or central mapping
  let resolvedSrc = src;
  if (!resolvedSrc || typeof resolvedSrc !== 'string' || resolvedSrc.trim() === '' || resolvedSrc.includes('placeholder')) {
    if (productId) {
      resolvedSrc = getProductMappedImage(productId);
    }
  }

  // 2. Resolve authentic color image variant if available in catalog (ignoring legacy vector paths)
  if (colorImages && selectedColor) {
    const colorKey = typeof selectedColor === 'string' ? selectedColor : selectedColor?.name;
    if (colorKey && colorImages[colorKey] && !colorImages[colorKey].includes('/images/products/')) {
      resolvedSrc = colorImages[colorKey];
    } else if (colorKey) {
      const foundKey = Object.keys(colorImages).find(
        k => k.toLowerCase() === colorKey.toLowerCase()
      );
      if (foundKey && colorImages[foundKey] && !colorImages[foundKey].includes('/images/products/')) {
        resolvedSrc = colorImages[foundKey];
      }
    }
  }

  const isReq = productId ? isProductImageRequired(productId) : false;
  const shouldShowFallback = hasError || isReq || !resolvedSrc || typeof resolvedSrc !== 'string' || resolvedSrc.trim() === '';
  const activeCategory = category || fallbackCategory || 'Apparel';
  const tintConfig = tintColor ? computeGarmentTint(tintColor) : null;

  // 3. Perform Garment-Only Recoloring when tintColor is requested
  useEffect(() => {
    if (!tintColor || !imgRef.current || !canvasRef.current || !isLoaded) {
      setCanvasActive(false);
      return;
    }

    // If an authentic color image was already matched, no need for canvas recoloring
    if (colorImages && selectedColor) {
      const colorKey = typeof selectedColor === 'string' ? selectedColor : selectedColor?.name;
      if (colorKey && colorImages[colorKey]) {
        setCanvasActive(false);
        return;
      }
    }

    const img = imgRef.current;
    if (img.complete && img.naturalWidth > 0) {
      const ok = recolorGarmentCanvas(img, tintColor, canvasRef.current);
      setCanvasActive(ok);
    }
  }, [resolvedSrc, tintColor, isLoaded, colorImages, selectedColor]);

  return (
    <div className={`relative overflow-hidden ${aspectRatio} bg-neutral-100 flex items-center justify-center ${containerClassName}`}>
      {shouldShowFallback ? (
        <AtelierMonogram category={activeCategory} productName={alt} />
      ) : (
        <>
          {/* Skeleton placeholder while loading */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
          )}

          {/* Actual Clothing Image */}
          <img
            ref={imgRef}
            src={resolvedSrc}
            alt={alt}
            loading={loading}
            crossOrigin="anonymous"
            style={
              tintConfig && !canvasActive && tintConfig.imgFilter
                ? { filter: tintConfig.imgFilter }
                : undefined
            }
            onLoad={() => {
              setIsLoaded(true);
              if (tintColor && canvasRef.current && imgRef.current) {
                const ok = recolorGarmentCanvas(imgRef.current, tintColor, canvasRef.current);
                setCanvasActive(ok);
              }
            }}
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isLoaded && !canvasActive ? 'opacity-100' : isLoaded && canvasActive ? 'opacity-0' : 'opacity-0'
            } ${className}`}
          />

          {/* Realistic Garment-Only Recolored Canvas (protects model skin and background) */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300 ${
              canvasActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />

          {/* CSS tint blend fallback layers when canvas is not yet active */}
          {tintConfig && !canvasActive && isLoaded && (
            <div className="absolute inset-0 pointer-events-none">
              {tintConfig.layers.map((layer, idx) => (
                <div
                  key={idx}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: layer.bg,
                    mixBlendMode: layer.blend,
                    opacity: layer.opacity
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
