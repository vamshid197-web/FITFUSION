import React, { useState } from 'react';
import {
  getFabricRealPhoto,
  getStyleRealPhoto,
  getFitRealPhoto
} from '../../data/customizerVisualAssets.js';

/**
 * FitFusion Visual Customizer Component Suite
 * Reusable visual cards for fabrics, colors, styles, fits, monograms, and perfumes.
 * Privacy-focused, zero external dependencies, 100% responsive.
 */

// ── 1. Reusable Image with Fallback ─────────────────────────────────────────
export function VisualImageWithFallback({
  src,
  alt = 'Customization preview',
  className = 'w-full h-full object-cover',
  fallbackCategory = 'Shirts'
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400">
        <svg className="w-8 h-8 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}

// ── 2. Fabric Weave Texture Resolver ────────────────────────────────────────
export function getFabricTextureStyle(fabricName = '', colorHex = '#374151') {
  const name = (fabricName || '').toLowerCase();

  // Denim: Diagonal indigo twill weave
  if (name.includes('denim')) {
    return {
      backgroundColor: '#1E3A8A',
      backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 2px, transparent 2px, transparent 4px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 2px, transparent 2px, transparent 4px)`
    };
  }

  // Corduroy: 12-wale vertical ridges
  if (name.includes('corduroy')) {
    return {
      backgroundColor: '#78350F',
      backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 3px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.3) 6px)`
    };
  }

  // Velvet: Luminous plush sheen
  if (name.includes('velvet')) {
    return {
      backgroundColor: '#4C0519',
      backgroundImage: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0.45) 80%)`
    };
  }

  // Silk & Satin: Luminous fluid pearlized drape
  if (name.includes('silk') || name.includes('satin')) {
    return {
      backgroundColor: '#0F172A',
      backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0.35) 65%, transparent 100%)`
    };
  }

  // Linen & Khadi: Organic slub cross-hatch texture
  if (name.includes('linen') || name.includes('khadi')) {
    return {
      backgroundColor: '#D97706',
      backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 5px), repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 5px)`
    };
  }

  // Twill: Structured diagonal ribs
  if (name.includes('twill')) {
    return {
      backgroundColor: '#4B5563',
      backgroundImage: `repeating-linear-gradient(60deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 2px, transparent 2px, transparent 6px)`
    };
  }

  // Wool & Cashmere: Heathered soft fiber texture
  if (name.includes('wool') || name.includes('cashmere')) {
    return {
      backgroundColor: '#374151',
      backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px), radial-gradient(circle, rgba(0,0,0,0.2) 1px, transparent 1px)`,
      backgroundSize: '8px 8px, 6px 6px'
    };
  }

  // Fleece & French Terry: Loopback athletic knit
  if (name.includes('fleece') || name.includes('french terry')) {
    return {
      backgroundColor: '#1E293B',
      backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 1.5px, transparent 2px)`,
      backgroundSize: '6px 6px'
    };
  }

  // Jersey: Stretch micro-knit
  if (name.includes('jersey')) {
    return {
      backgroundColor: '#27272A',
      backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 3px)`
    };
  }

  // Default: Crisp combed cotton micro-grid
  return {
    backgroundColor: '#1F2937',
    backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
    backgroundSize: '4px 4px'
  };
}

// ── 3. Visual Fabric Card Component ─────────────────────────────────────────
export function FabricOptionCard({
  fabric,
  isSelected,
  onSelect,
  surcharge = 0
}) {
  const [imgError, setImgError] = useState(false);
  const realPhotoUrl = getFabricRealPhoto(fabric.name);
  const textureStyle = getFabricTextureStyle(fabric.name);

  return (
    <button
      type="button"
      onClick={() => onSelect(fabric)}
      className={`rounded-2xl border text-left transition-all overflow-hidden flex flex-col justify-between h-full group ${
        isSelected
          ? 'border-brand-accent bg-brand-accentLight/40 ring-2 ring-brand-accent shadow-md'
          : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
      }`}
    >
      <div>
        {/* Real Fabric Photograph Preview (with graceful fallback to texture) */}
        <div className="w-full h-28 relative overflow-hidden bg-neutral-100 flex items-end p-2.5">
          {realPhotoUrl && !imgError ? (
            <img
              src={realPhotoUrl}
              alt={`${fabric.name} real fabric close-up`}
              loading="lazy"
              onError={() => setImgError(true)}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div style={textureStyle} className="absolute inset-0 w-full h-full" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          <div className="relative z-10 w-full flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs border border-white/20">
              {fabric.badge || 'Material'}
            </span>
            {isSelected && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-accent text-white shadow-xs">
                Selected &#10003;
              </span>
            )}
          </div>
        </div>

        {/* Text Details */}
        <div className="p-3.5 space-y-1">
          <div className="font-extrabold text-sm text-brand-dark flex items-center justify-between">
            <span>{fabric.name}</span>
          </div>
          <div className="text-[11px] font-semibold text-brand-accent">
            {fabric.composition}
          </div>
          {fabric.description && (
            <p className="text-[11px] text-neutral-600 line-clamp-2 leading-relaxed pt-0.5">
              {fabric.description}
            </p>
          )}
        </div>
      </div>

      {/* Footer Price Badge */}
      <div className="p-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
        <span className="font-black text-brand-accent">
          {surcharge > 0 ? `+₹${surcharge} Premium` : 'Standard Included'}
        </span>
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
          Genuine Textile
        </span>
      </div>
    </button>
  );
}

// ── 4. Visual Color Swatch Card Component ───────────────────────────────────
export function ColorSwatchCard({
  color,
  isSelected,
  onSelect
}) {
  const hexVal = color.hex || color.value || '#1F2937';
  const isLight = hexVal.toLowerCase() === '#ffffff' || hexVal.toLowerCase() === '#f9fafb' || hexVal.toLowerCase() === '#fffbeb' || hexVal.toLowerCase() === '#f5f5dc';

  return (
    <button
      type="button"
      onClick={() => onSelect(color)}
      aria-label={`Select color ${color.name}`}
      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 group ${
        isSelected
          ? 'border-brand-accent bg-brand-accentLight/50 ring-2 ring-brand-accent shadow-sm'
          : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-xs'
      }`}
    >
      <div className="relative">
        <span
          style={{ backgroundColor: hexVal }}
          className="block w-11 h-11 rounded-full border-2 border-neutral-300/80 shadow-inner transition-transform group-hover:scale-105"
        />
        {/* Fabric sheen highlight */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 via-transparent to-white/35 pointer-events-none" />

        {isSelected && (
          <span className={`absolute inset-0 flex items-center justify-center font-black text-sm drop-shadow ${isLight ? 'text-neutral-900' : 'text-white'}`}>
            &#10003;
          </span>
        )}
      </div>

      <div className="w-full px-1">
        <div className="text-xs font-bold text-brand-dark truncate">
          {color.name}
        </div>
        <div className="text-[10px] text-neutral-400 uppercase tracking-wider truncate">
          {color.group || 'Swatch'}
        </div>
      </div>
    </button>
  );
}

// ── 5. Visual Vector Style Diagram Resolver ─────────────────────────────────
export function StyleVectorIllustration({ type = '', id = '' }) {
  const t = (type || '').toLowerCase();
  const name = (id || '').toLowerCase();

  // Collars & Necklines
  if (t === 'collar' || t.includes('neck') || t.includes('hood') || t.includes('lapel')) {
    // V-Neck
    if (name.includes('v-neck')) {
      return (
        <svg className="w-10 h-10 text-brand-accent" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 10 L24 28 L38 10" />
          <path d="M10 10 L4 18 L12 22 L16 18" strokeDasharray="3 3" />
          <path d="M38 10 L44 18 L36 22 L32 18" strokeDasharray="3 3" />
          <path d="M16 38 L32 38" />
        </svg>
      );
    }
    // Polo Collar
    if (name.includes('polo')) {
      return (
        <svg className="w-10 h-10 text-brand-accent" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 12 L24 16 L38 12 L34 22 L24 18 L14 22 Z" fill="currentColor" fillOpacity="0.12" />
          <path d="M24 18 L24 34" />
          <circle cx="24" cy="22" r="1.5" fill="currentColor" />
          <circle cx="24" cy="28" r="1.5" fill="currentColor" />
        </svg>
      );
    }
    // Henley
    if (name.includes('henley')) {
      return (
        <svg className="w-10 h-10 text-brand-accent" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="14" r="10" strokeDasharray="2 3" />
          <path d="M21 14 L21 32 L27 32 L27 14" fill="currentColor" fillOpacity="0.15" />
          <circle cx="24" cy="18" r="1.2" fill="currentColor" />
          <circle cx="24" cy="24" r="1.2" fill="currentColor" />
          <circle cx="24" cy="29" r="1.2" fill="currentColor" />
        </svg>
      );
    }
    // Hoodies / Hoods
    if (name.includes('hood')) {
      return (
        <svg className="w-10 h-10 text-brand-accent" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 18 C12 6, 36 6, 36 18 C36 28, 30 34, 24 34 C18 34, 12 28, 12 18 Z" fill="currentColor" fillOpacity="0.1" />
          <path d="M18 34 L18 42 M30 34 L30 42" />
          <circle cx="18" cy="42" r="1.5" fill="currentColor" />
          <circle cx="30" cy="42" r="1.5" fill="currentColor" />
        </svg>
      );
    }
    // Notch / Peak Lapel
    if (name.includes('notch') || name.includes('peak') || name.includes('lapel')) {
      return (
        <svg className="w-10 h-10 text-brand-accent" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 8 L18 20 L14 26 L24 38 L34 26 L30 20 L38 8" fill="currentColor" fillOpacity="0.15" />
          <path d="M24 38 L24 44" />
        </svg>
      );
    }
    // Button Down Collar
    if (name.includes('button down') || name.includes('button-down')) {
      return (
        <svg className="w-10 h-10 text-brand-accent" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 10 L24 20 L36 10 L32 26 L24 22 L16 26 Z" fill="currentColor" fillOpacity="0.12" />
          <path d="M24 22 L24 38" />
          <circle cx="17" cy="24" r="1.3" fill="currentColor" />
          <circle cx="31" cy="24" r="1.3" fill="currentColor" />
          <circle cx="24" cy="28" r="1.3" fill="currentColor" />
          <circle cx="24" cy="34" r="1.3" fill="currentColor" />
        </svg>
      );
    }
    // Wide Spread Collar
    if (name.includes('spread')) {
      return (
        <svg className="w-10 h-10 text-brand-accent" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 12 L24 16 L40 12 L38 24 L24 20 L10 24 Z" fill="currentColor" fillOpacity="0.15" />
          <path d="M24 20 L24 38" />
          <circle cx="24" cy="27" r="1.3" fill="currentColor" />
          <circle cx="24" cy="33" r="1.3" fill="currentColor" />
        </svg>
      );
    }
    // Classic Point Collar
    if (name.includes('classic') || name.includes('point')) {
      return (
        <svg className="w-10 h-10 text-brand-accent" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 10 L24 18 L36 10 L31 28 L24 22 L17 28 Z" fill="currentColor" fillOpacity="0.15" />
          <path d="M24 22 L24 38" />
          <circle cx="24" cy="28" r="1.3" fill="currentColor" />
          <circle cx="24" cy="34" r="1.3" fill="currentColor" />
        </svg>
      );
    }
    // Mandarin / Bandhgala Collar
    if (name.includes('mandarin') || name.includes('band')) {
      return (
        <svg className="w-10 h-10 text-brand-accent" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 16 C14 10, 34 10, 34 16 L34 22 C34 22, 28 20, 24 20 C20 20, 14 22, 14 22 Z" fill="currentColor" fillOpacity="0.2" />
          <path d="M24 20 L24 38" />
        </svg>
      );
    }
    // Default: Crew Neck
    return (
      <svg className="w-10 h-10 text-brand-accent" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12 C12 24, 36 24, 36 12" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 12 L6 18 M36 12 L42 18" strokeDasharray="3 3" />
        <path d="M14 36 L34 36" />
      </svg>
    );
  }

  // Sleeves & Cuffs
  if (t === 'cuff' || t.includes('sleeve') || t.includes('pocket')) {
    if (name.includes('french') || name.includes('cufflink')) {
      return (
        <svg className="w-10 h-10 text-brand-accent" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="12" y="20" width="24" height="18" rx="2" fill="currentColor" fillOpacity="0.15" />
          <path d="M12 28 L36 28" strokeDasharray="2 2" strokeWidth="1.5" />
          <circle cx="24" cy="32" r="2.8" fill="currentColor" />
          <path d="M21 32 L27 32" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      );
    }
    if (name.includes('rounded')) {
      return (
        <svg className="w-10 h-10 text-brand-accent" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20 L36 20 L36 30 C36 35 32 37 28 37 L20 37 C16 37 12 35 12 30 Z" fill="currentColor" fillOpacity="0.15" />
          <path d="M12 26 L36 26" strokeDasharray="2 2" strokeWidth="1.5" />
          <circle cx="29" cy="30" r="2" fill="currentColor" />
        </svg>
      );
    }
    if (name.includes('barrel') || name.includes('single') || name.includes('standard')) {
      return (
        <svg className="w-10 h-10 text-brand-accent" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="12" y="20" width="24" height="18" rx="1.5" fill="currentColor" fillOpacity="0.15" />
          <line x1="12" y1="26" x2="36" y2="26" strokeDasharray="2 2" strokeWidth="1.5" />
          <circle cx="28" cy="31" r="2.2" fill="currentColor" />
        </svg>
      );
    }
    if (name.includes('ribbed') || name.includes('elastic')) {
      return (
        <svg className="w-10 h-10 text-brand-accent" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="14" y="24" width="20" height="14" rx="2" fill="currentColor" fillOpacity="0.15" />
          <path d="M18 24 L18 38 M22 24 L22 38 M26 24 L26 38 M30 24 L30 38" strokeDasharray="1 2" />
          <path d="M10 10 L14 24 M38 10 L34 24" />
        </svg>
      );
    }
    if (name.includes('kangaroo') || name.includes('pocket')) {
      return (
        <svg className="w-10 h-10 text-brand-accent" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 20 L16 36 L32 36 L40 20 L24 24 Z" fill="currentColor" fillOpacity="0.15" />
        </svg>
      );
    }
    // Default open cuff/sleeve
    return (
      <svg className="w-10 h-10 text-brand-accent" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 12 L14 36 L34 36 L38 12" fill="currentColor" fillOpacity="0.1" />
        <path d="M14 36 L34 36" strokeWidth="4" />
      </svg>
    );
  }

  // Buttons, Hardware & Stitching
  if (t === 'buttons' || t.includes('stitch') || t.includes('trim') || t.includes('hem')) {
    if (name.includes('matte black') || name.includes('black')) {
      return (
        <svg className="w-10 h-10 text-neutral-800" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="24" cy="24" r="14" fill="#18181B" stroke="#3F3F46" strokeWidth="2.5" />
          <circle cx="24" cy="24" r="10" stroke="#27272A" strokeWidth="1" strokeDasharray="2 2" fill="none" />
          <circle cx="21" cy="21" r="1.5" fill="#71717A" />
          <circle cx="27" cy="21" r="1.5" fill="#71717A" />
          <circle cx="21" cy="27" r="1.5" fill="#71717A" />
          <circle cx="27" cy="27" r="1.5" fill="#71717A" />
        </svg>
      );
    }
    if (name.includes('brass') || name.includes('gold')) {
      return (
        <svg className="w-10 h-10 text-amber-700" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="24" cy="24" r="14" fill="#B45309" stroke="#78350F" strokeWidth="2.5" />
          <circle cx="24" cy="24" r="10" stroke="#FDE68A" strokeWidth="1" strokeDasharray="2 2" fill="none" />
          <circle cx="21" cy="21" r="1.3" fill="#FEF3C7" />
          <circle cx="27" cy="21" r="1.3" fill="#FEF3C7" />
          <circle cx="21" cy="27" r="1.3" fill="#FEF3C7" />
          <circle cx="27" cy="27" r="1.3" fill="#FEF3C7" />
        </svg>
      );
    }
    if (name.includes('neutral') || name.includes('horn') || name.includes('standard')) {
      return (
        <svg className="w-10 h-10 text-stone-600" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="24" cy="24" r="14" fill="#4B5563" stroke="#374151" strokeWidth="2.5" />
          <circle cx="24" cy="24" r="10" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="2 2" fill="none" />
          <circle cx="21" cy="21" r="1.5" fill="#E5E7EB" />
          <circle cx="27" cy="21" r="1.5" fill="#E5E7EB" />
          <circle cx="21" cy="27" r="1.5" fill="#E5E7EB" />
          <circle cx="27" cy="27" r="1.5" fill="#E5E7EB" />
        </svg>
      );
    }
    if (name.includes('stitch') || name.includes('thread')) {
      return (
        <svg className="w-10 h-10 text-brand-accent" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3">
          <line x1="8" y1="16" x2="40" y2="16" />
          <line x1="8" y1="24" x2="40" y2="24" />
          <line x1="8" y1="32" x2="40" y2="32" />
        </svg>
      );
    }
  }

  // Fallback Architecture Vector
  return (
    <svg className="w-10 h-10 text-brand-accent" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="10" y="10" width="28" height="28" rx="4" fill="currentColor" fillOpacity="0.1" />
      <path d="M10 24 L38 24 M24 10 L24 38" strokeDasharray="2 3" />
    </svg>
  );
}

// ── 6. Visual Style Option Card ─────────────────────────────────────────────
export function StyleOptionCard({
  sectionKey,
  option,
  isSelected,
  onSelect
}) {
  const [imgError, setImgError] = useState(false);
  const realPhotoUrl = option.image || getStyleRealPhoto(sectionKey, option.id) || getStyleRealPhoto(sectionKey, option.title);

  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-full group ${
        isSelected
          ? 'border-brand-accent bg-brand-accentLight/50 ring-2 ring-brand-accent shadow-sm'
          : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-xs'
      }`}
    >
      <div>
        {/* Real Garment / Neckline / Detail Photograph Badge */}
        <div className="w-full h-24 rounded-xl bg-neutral-100 border border-neutral-200/80 flex items-center justify-center mb-3 relative overflow-hidden group-hover:bg-neutral-200/50 transition">
          {realPhotoUrl && !imgError ? (
            <>
              <img
                src={realPhotoUrl}
                alt={option.title || option.id}
                loading="lazy"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </>
          ) : (
            <StyleVectorIllustration type={sectionKey} id={option.id} />
          )}

          {isSelected && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-accent text-white shadow-xs z-10">
              &#10003;
            </span>
          )}
        </div>

        <div className="font-extrabold text-sm text-brand-dark mb-1">
          {option.title || option.id}
        </div>
        <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
          {option.desc}
        </p>
      </div>

      <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px]">
        <span className="font-black text-brand-accent">
          {option.surcharge > 0 ? `+₹${option.surcharge} Tailoring` : 'Included'}
        </span>
        <span className="text-[10px] font-semibold text-neutral-400">
          Atelier Craft
        </span>
      </div>
    </button>
  );
}

// ── 7. Visual Fit Silhouette Card Component (PART 4: Real Model Photography) ─
export function FitOptionCard({
  fit,
  isSelected,
  onSelect
}) {
  const [imgError, setImgError] = useState(false);
  const realPhotoUrl = fit.image || getFitRealPhoto(fit.id) || getFitRealPhoto(fit.title) || getFitRealPhoto(fit.name);

  // SVG anatomical silhouette drape graphics fallback
  const renderSilhouette = () => {
    if (fit.id === 'Slim') {
      return (
        <svg className="w-14 h-16 text-brand-accent" viewBox="0 0 60 70" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10 L30 18 L40 10 L48 24 L42 28 L38 22 L36 60 L24 60 L22 22 L18 28 L12 24 Z" fill="currentColor" fillOpacity="0.15" />
          <path d="M26 34 L34 34" strokeDasharray="2 2" />
        </svg>
      );
    }
    if (fit.id === 'Relaxed') {
      return (
        <svg className="w-14 h-16 text-brand-accent" viewBox="0 0 60 70" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 10 L30 18 L42 10 L52 26 L44 30 L40 24 L42 62 L18 62 L20 24 L16 30 L8 26 Z" fill="currentColor" fillOpacity="0.15" />
          <path d="M22 36 L38 36" strokeDasharray="3 3" />
        </svg>
      );
    }
    // Regular Fit (Classic balanced ease)
    return (
      <svg className="w-14 h-16 text-brand-accent" viewBox="0 0 60 70" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 10 L30 18 L41 10 L50 25 L43 29 L39 23 L39 61 L21 61 L21 23 L17 29 L10 25 Z" fill="currentColor" fillOpacity="0.15" />
        <path d="M24 35 L36 35" strokeDasharray="2 2" />
      </svg>
    );
  };

  const displayName = fit.title || fit.name || `${fit.id} Fit`;

  return (
    <button
      type="button"
      onClick={() => onSelect(fit.id)}
      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-full group ${
        isSelected
          ? 'border-brand-accent bg-brand-accentLight/60 ring-2 ring-brand-accent shadow-sm'
          : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-xs'
      }`}
    >
      <div>
        {/* Real Fit Preview Image */}
        <div className="w-full h-52 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-3 relative overflow-hidden group-hover:bg-neutral-200/50 transition">
          {realPhotoUrl && !imgError ? (
            <>
              <img
                src={realPhotoUrl}
                alt={displayName}
                loading="lazy"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />
              <span className="absolute bottom-2 left-2 right-2 text-[10px] font-bold text-white/90 truncate pointer-events-none">
                {displayName}
              </span>
            </>
          ) : (
            renderSilhouette()
          )}

          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs border border-white/20">
            {fit.badge}
          </span>
          {isSelected && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-accent text-white shadow-xs z-10">
              &#10003;
            </span>
          )}
        </div>

        <div className="font-black text-base text-brand-dark mb-1">
          {displayName}
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed">
          {fit.desc}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px]">
        <span className="font-bold text-brand-accent">
          {isSelected ? 'Active Silhouette' : 'Click to select'}
        </span>
        <span className="text-neutral-400">Atelier Cut</span>
      </div>
    </button>
  );
}

// ── 8. Visual Monogram Live Embroidery Swatch Component ─────────────────────
export function MonogramPreviewCard({
  text = 'SV',
  threadColor = 'Royal Gold Silk',
  threadHex = '#F59E0B',
  position = 'Left Chest',
  garmentColorHex = '#111827'
}) {
  return (
    <div className="p-4 rounded-2xl border border-neutral-200 bg-white space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-dark">
          Embroidered Monogram Simulation
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
          Position: {position}
        </span>
      </div>

      {/* Simulated Garment Fabric Patch with Silk Monogram */}
      <div
        style={{ backgroundColor: garmentColorHex }}
        className="w-full h-28 rounded-xl relative overflow-hidden flex items-center justify-center shadow-inner border border-neutral-700/40"
      >
        {/* Subtle fabric weave texture */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:4px_4px]" />

        {/* Embroidered Text with Satin Thread Drop-Shadow Effect */}
        <div
          style={{
            color: threadHex,
            textShadow: `1px 1px 0px rgba(0,0,0,0.6), -0.5px -0.5px 0px rgba(255,255,255,0.3)`
          }}
          className="relative font-serif font-black text-3xl tracking-widest uppercase select-none"
        >
          {text || 'FIT'}
        </div>

        <div className="absolute bottom-2 right-2 text-[9px] font-mono text-white/50">
          Thread: {threadColor}
        </div>
      </div>
    </div>
  );
}

// ── 9. Visual Perfume Card Component ────────────────────────────────────────
export function PerfumeVisualCard({
  perfume,
  isSelected,
  onSelect
}) {
  const isFreeOption = perfume.price === 0;
  const accent = perfume.accentColor || '#F59E0B';

  return (
    <div
      className={`p-4 rounded-2xl border flex flex-col justify-between transition-all group ${
        isSelected
          ? 'border-brand-accent bg-brand-accentLight/40 ring-2 ring-brand-accent shadow-md'
          : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-xs'
      }`}
    >
      <div>
        {/* Visual Luxury Perfume Bottle Illustration */}
        <div
          style={{
            background: `radial-gradient(circle at 50% 45%, ${accent}25 0%, #FAF9F6 75%)`
          }}
          className="w-full h-28 rounded-xl border border-neutral-100 flex items-center justify-center mb-3 relative overflow-hidden"
        >
          {/* Stylized Glass Perfume Bottle Vector */}
          <div className="relative flex flex-col items-center">
            {/* Spray nozzle */}
            <div className="w-3 h-2 bg-amber-600 rounded-t-xs" />
            {/* Gold collar */}
            <div className="w-5 h-2 bg-amber-400 shadow-xs" />
            {/* Heavy Glass Flacon */}
            <div
              style={{ borderColor: accent }}
              className="w-12 h-14 rounded-b-xl rounded-t-sm border-2 bg-white/70 backdrop-blur-xs shadow-md flex items-center justify-center relative overflow-hidden"
            >
              {/* Liquid level */}
              <div
                style={{ backgroundColor: accent }}
                className="absolute inset-x-0 bottom-0 h-10 opacity-35"
              />
              <span className="relative z-10 text-xs font-serif font-bold text-neutral-800">
                {perfume.icon || '✦'}
              </span>
            </div>
          </div>

          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/80 backdrop-blur-xs text-neutral-700 border border-neutral-200">
            {perfume.fragranceFamily}
          </span>

          <span className={`absolute top-2 right-2 text-xs font-black px-2 py-0.5 rounded-full ${isFreeOption ? 'text-emerald-700 bg-emerald-50' : 'text-brand-accent bg-white shadow-xs'}`}>
            {isFreeOption ? '₹0 Included' : `+₹${perfume.price}`}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-brand-dark">{perfume.name}</h4>
          {perfume.rating && (
            <span className="text-[11px] font-bold text-amber-600">★ {perfume.rating}</span>
          )}
        </div>
        <span className="text-[11px] text-neutral-500 block mb-1">
          {perfume.brand} &bull; {perfume.fragranceFamily}
        </span>
        <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mb-2.5">
          {perfume.description}
        </p>

        {perfume.outfitMatchReason && (
          <div className="mb-2 p-1.5 rounded-lg bg-amber-50 border border-amber-200/80 text-[10px] text-amber-900 font-semibold flex items-center gap-1.5 leading-snug">
            <span className="shrink-0 text-amber-600">✨</span>
            <span>{perfume.outfitMatchReason}</span>
          </div>
        )}

        {perfume.notes && perfume.notes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {perfume.notes.map((note) => (
              <span key={note} className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-medium">
                {note}
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onSelect(perfume)}
        className={`mt-2 w-full py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
          isSelected
            ? 'bg-brand-accent text-white'
            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
        }`}
      >
        {isSelected ? '✓ Paired with Garment' : isFreeOption ? 'Select No Fragrance' : 'Pair With Outfit'}
      </button>
    </div>
  );
}

// ── Exact Aliases Matching Architectural Requirements ─────────────────────────
export const CustomizationOptionCard = StyleOptionCard;
export const CustomizationImageCard = VisualImageWithFallback;
export const ColorSwatch = ColorSwatchCard;
export const StyleThumbnail = StyleVectorIllustration;
export const PerfumeCard = PerfumeVisualCard;
