/**
 * FITFUSION ADVANCED CLOTHING DESIGNER — ASSET & SPECIFICATION LIBRARY
 * Original, license-safe vector definitions, patterns, patches, garment print areas & AI assistant parser.
 */

// ============================================================================
// 1. GARMENT PRINT AREAS BY APPAREL CATEGORY (Section 10)
// ============================================================================
export const GARMENT_PRINT_AREAS = {
  'T-Shirts': [
    { id: 'front', label: 'Front Chest', boundary: { width: 280, height: 340, top: 80, left: 110 } },
    { id: 'back', label: 'Full Back', boundary: { width: 300, height: 380, top: 70, left: 100 } },
    { id: 'left_sleeve', label: 'Left Sleeve', boundary: { width: 140, height: 160, top: 120, left: 180 } },
    { id: 'right_sleeve', label: 'Right Sleeve', boundary: { width: 140, height: 160, top: 120, left: 180 } }
  ],
  'Shirts': [
    { id: 'front', label: 'Front', boundary: { width: 260, height: 320, top: 90, left: 120 } },
    { id: 'chest', label: 'Left Chest Pocket', boundary: { width: 120, height: 120, top: 120, left: 240 } },
    { id: 'back', label: 'Upper Back', boundary: { width: 280, height: 320, top: 80, left: 110 } },
    { id: 'sleeve', label: 'Cuff / Sleeve', boundary: { width: 130, height: 150, top: 140, left: 180 } }
  ],
  'Hoodies': [
    { id: 'front', label: 'Front Center', boundary: { width: 260, height: 260, top: 100, left: 120 } },
    { id: 'back', label: 'Large Back', boundary: { width: 320, height: 400, top: 60, left: 90 } },
    { id: 'sleeve', label: 'Outer Sleeve', boundary: { width: 130, height: 220, top: 110, left: 180 } },
    { id: 'hood', label: 'Hood Center', boundary: { width: 160, height: 160, top: 40, left: 170 } }
  ],
  'Jeans & Pants': [
    { id: 'pocket', label: 'Front Coin Pocket', boundary: { width: 120, height: 120, top: 100, left: 220 } },
    { id: 'back_pocket', label: 'Back Right Pocket', boundary: { width: 140, height: 150, top: 110, left: 210 } },
    { id: 'left_leg', label: 'Left Thigh / Leg', boundary: { width: 160, height: 360, top: 80, left: 80 } },
    { id: 'right_leg', label: 'Right Thigh / Leg', boundary: { width: 160, height: 360, top: 80, left: 260 } }
  ],
  'Dresses': [
    { id: 'front', label: 'Front Bodice', boundary: { width: 260, height: 280, top: 90, left: 120 } },
    { id: 'back', label: 'Upper Back', boundary: { width: 260, height: 300, top: 90, left: 120 } },
    { id: 'waist', label: 'Waist / Hemline', boundary: { width: 320, height: 200, top: 260, left: 90 } },
    { id: 'sleeve', label: 'Shoulder / Sleeve', boundary: { width: 120, height: 140, top: 100, left: 190 } }
  ],
  'Jackets': [
    { id: 'front', label: 'Front Panel', boundary: { width: 260, height: 340, top: 90, left: 120 } },
    { id: 'chest', label: 'Left Chest Badge', boundary: { width: 120, height: 120, top: 120, left: 240 } },
    { id: 'back', label: 'Statement Back', boundary: { width: 320, height: 400, top: 70, left: 90 } },
    { id: 'sleeve', label: 'Bicep Sleeve', boundary: { width: 140, height: 180, top: 110, left: 180 } },
    { id: 'pocket', label: 'Flap Pocket', boundary: { width: 130, height: 110, top: 240, left: 220 } }
  ],
  'Traditional Wear': [
    { id: 'front', label: 'Front Placket', boundary: { width: 260, height: 380, top: 80, left: 120 } },
    { id: 'chest', label: 'Left Chest Embroidery', boundary: { width: 140, height: 140, top: 110, left: 230 } },
    { id: 'back', label: 'Upper Back', boundary: { width: 280, height: 360, top: 70, left: 110 } },
    { id: 'sleeve', label: 'Sleeve Cuff', boundary: { width: 130, height: 160, top: 140, left: 185 } },
    { id: 'border', label: 'Daman Border', boundary: { width: 340, height: 120, top: 340, left: 80 } }
  ]
};

// Fallback for custom or unrecognized categories
export function getPrintAreasForCategory(category = '') {
  if (GARMENT_PRINT_AREAS[category]) {
    return GARMENT_PRINT_AREAS[category];
  }
  const norm = (category || '').toLowerCase();
  if (norm.includes('t-shirt') || norm.includes('tee')) return GARMENT_PRINT_AREAS['T-Shirts'];
  if (norm.includes('shirt')) return GARMENT_PRINT_AREAS['Shirts'];
  if (norm.includes('hoodie') || norm.includes('sweat')) return GARMENT_PRINT_AREAS['Hoodies'];
  if (norm.includes('jean') || norm.includes('pant') || norm.includes('trouser')) return GARMENT_PRINT_AREAS['Jeans & Pants'];
  if (norm.includes('dress') || norm.includes('skirt')) return GARMENT_PRINT_AREAS['Dresses'];
  if (norm.includes('jacket') || norm.includes('blazer') || norm.includes('coat')) return GARMENT_PRINT_AREAS['Jackets'];
  if (norm.includes('kurta') || norm.includes('traditional') || norm.includes('sherwani') || norm.includes('ethnic')) {
    return GARMENT_PRINT_AREAS['Traditional Wear'];
  }
  return GARMENT_PRINT_AREAS['T-Shirts'];
}

// ============================================================================
// 2. ORIGINAL LICENSE-SAFE GRAPHICS & SYMBOLS (Section 1)
// ============================================================================
export const GRAPHICS_LIBRARY = [
  // Animals
  {
    id: 'lion-crest',
    name: 'Royal Lion Crest',
    category: 'Animals',
    tags: ['lion', 'king', 'animal', 'crest', 'royal', 'gold', 'wild'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 10 C35 10 25 22 25 38 C20 40 15 48 16 55 C17 62 23 66 26 68 C27 75 32 82 40 88 C45 92 55 92 60 88 C68 82 73 75 74 68 C77 66 83 62 84 55 C85 48 80 40 75 38 C75 22 65 10 50 10 Z M50 22 C58 22 63 28 64 36 C60 35 55 35 50 35 C45 35 40 35 36 36 C37 28 42 22 50 22 Z M35 44 C37 44 39 46 39 48 C39 50 37 52 35 52 C33 52 31 50 31 48 C31 46 33 44 35 44 Z M65 44 C67 44 69 46 69 48 C69 50 67 52 65 52 C63 52 61 50 61 48 C61 46 63 44 65 44 Z M50 54 L54 62 L46 62 Z M42 68 C45 71 55 71 58 68 C56 73 44 73 42 68 Z"/>
    </svg>`
  },
  {
    id: 'tiger-roaring',
    name: 'Fierce Tiger',
    category: 'Animals',
    tags: ['tiger', 'wild', 'cat', 'predator', 'stripes', 'nature', 'animal'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M22 25 C20 35 25 45 28 50 C24 55 20 62 22 72 C25 82 36 86 50 86 C64 86 75 82 78 72 C80 62 76 55 72 50 C75 45 80 35 78 25 C68 25 62 32 58 35 C53 34 47 34 42 35 C38 32 32 25 22 25 Z M38 48 L42 45 L40 54 Z M62 48 L60 54 L58 45 Z M50 56 L55 64 L45 64 Z M36 68 C42 72 58 72 64 68 C60 76 40 76 36 68 Z"/>
    </svg>`
  },
  {
    id: 'majestic-eagle',
    name: 'Majestic Eagle',
    category: 'Animals',
    tags: ['eagle', 'bird', 'wings', 'freedom', 'flying', 'america', 'sky', 'animal'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 15 L56 28 L68 22 L62 34 L78 30 L66 42 L88 42 L72 52 L95 58 L72 64 L86 74 L65 72 L70 85 L54 77 L50 92 L46 77 L30 85 L35 72 L14 74 L28 64 L5 58 L28 52 L12 42 L34 42 L22 30 L38 34 L32 22 L44 28 Z M50 36 C54 36 57 39 57 43 C57 47 54 50 50 50 C46 50 43 47 43 43 C43 39 46 36 50 36 Z"/>
    </svg>`
  },
  {
    id: 'wolf-howling',
    name: 'Howling Wolf',
    category: 'Animals',
    tags: ['wolf', 'moon', 'night', 'wild', 'pack', 'canine', 'animal'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M30 85 C32 70 38 60 42 54 C38 48 35 38 40 28 C42 22 48 18 55 15 C54 22 58 26 62 28 C68 22 75 22 78 28 C80 34 76 42 72 46 C76 52 80 62 80 85 L68 85 C66 72 64 64 58 60 C56 68 52 75 48 85 Z M56 34 C58 34 60 36 60 38 C60 40 58 42 56 42 C54 42 52 40 52 38 C52 36 54 34 56 34 Z"/>
    </svg>`
  },
  {
    id: 'bear-paw',
    name: 'Grizzly Bear Paw',
    category: 'Animals',
    tags: ['bear', 'paw', 'claws', 'grizzly', 'nature', 'wild', 'animal'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 42 C40 42 32 50 32 62 C32 74 40 82 50 82 C60 82 68 74 68 62 C68 50 60 42 50 42 Z M26 38 C22 38 18 42 18 48 C18 54 22 58 26 58 C30 58 34 54 34 48 C34 42 30 38 26 38 Z M40 24 C36 24 32 28 32 34 C32 40 36 44 40 44 C44 44 48 40 48 34 C48 28 44 24 40 24 Z M60 24 C56 24 52 28 52 34 C52 40 56 44 60 44 C64 44 68 40 68 34 C68 28 64 24 60 24 Z M74 38 C70 38 66 42 66 48 C66 54 70 58 74 58 C78 58 82 54 82 48 C82 42 78 38 74 38 Z"/>
    </svg>`
  },
  {
    id: 'snake-coiled',
    name: 'Coiled Viper',
    category: 'Animals',
    tags: ['snake', 'serpent', 'viper', 'coiled', 'cobra', 'streetwear', 'animal'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 15 C42 15 36 20 36 28 C36 34 40 38 46 40 C38 44 32 52 32 62 C32 74 42 82 54 82 C66 82 74 74 74 64 C74 56 68 50 60 48 C66 44 70 38 70 30 C70 20 62 15 50 15 Z M50 22 C55 22 58 25 58 29 C58 33 55 36 50 36 C45 36 42 33 42 29 C42 25 45 22 50 22 Z M53 52 C61 52 66 57 66 63 C66 70 60 74 53 74 C46 74 40 70 40 63 C40 57 45 52 53 52 Z"/>
    </svg>`
  },
  {
    id: 'dragon-sigil',
    name: 'Dragon Sigil',
    category: 'Animals',
    tags: ['dragon', 'mythical', 'sigil', 'flame', 'fantasy', 'oriental', 'animal'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 12 L55 24 L68 18 L64 30 L76 28 L68 38 L82 40 L70 48 L84 54 L70 60 L80 68 L66 70 L72 80 L58 78 L60 90 L50 82 L40 90 L42 78 L28 80 L34 70 L20 68 L30 60 L16 54 L30 48 L18 40 L32 38 L24 28 L36 30 L32 18 L45 24 Z M50 32 C56 32 62 38 62 45 C62 52 56 58 50 58 C44 58 38 52 38 45 C38 38 44 32 50 32 Z"/>
    </svg>`
  },

  // Celestial / Nature
  {
    id: 'crown-imperial',
    name: 'Imperial Crown',
    category: 'Symbols',
    tags: ['crown', 'king', 'queen', 'royal', 'gold', 'regal', 'vip'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M18 75 L82 75 L86 85 L14 85 Z M18 68 L82 68 L88 35 L68 52 L50 22 L32 52 L12 35 Z M50 18 C52 18 54 16 54 14 C54 12 52 10 50 10 C48 10 46 12 46 14 C46 16 48 18 50 18 Z M12 32 C14 32 16 30 16 28 C16 26 14 24 12 24 C10 24 8 26 8 28 C8 30 10 32 12 32 Z M88 32 C90 32 92 30 92 28 C92 26 90 24 88 24 C86 24 84 26 84 28 C84 30 86 32 88 32 Z"/>
    </svg>`
  },
  {
    id: 'lightning-bolt',
    name: 'Thunderbolt Flash',
    category: 'Nature',
    tags: ['lightning', 'thunder', 'bolt', 'flash', 'energy', 'power', 'electric'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M56 10 L28 50 L48 50 L38 90 L74 44 L52 44 Z"/>
    </svg>`
  },
  {
    id: 'flame-fire',
    name: 'Eternal Flame',
    category: 'Nature',
    tags: ['flame', 'fire', 'hot', 'heat', 'energy', 'blaze', 'streetwear'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 10 C54 26 68 34 68 50 C68 62 60 74 50 82 C40 74 32 62 32 50 C32 38 42 24 50 10 Z M50 44 C46 50 42 56 42 62 C42 68 46 72 50 74 C54 72 58 68 58 62 C58 56 54 50 50 44 Z"/>
    </svg>`
  },
  {
    id: 'star-radiant',
    name: 'Radiant Star',
    category: 'Symbols',
    tags: ['star', 'radiant', 'sparkle', 'night', 'shine', 'glow', 'vip'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 10 L62 36 L90 38 L68 58 L74 86 L50 72 L26 86 L32 58 L10 38 L38 36 Z"/>
    </svg>`
  },
  {
    id: 'heart-geometric',
    name: 'Geometric Heart',
    category: 'Symbols',
    tags: ['heart', 'love', 'geometric', 'romance', 'passion', 'valentine'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 85 L20 52 C12 42 14 26 26 18 C36 12 46 16 50 24 C54 16 64 12 74 18 C86 26 88 42 80 52 Z"/>
    </svg>`
  },
  {
    id: 'skull-street',
    name: 'Streetwear Skull',
    category: 'Streetwear',
    tags: ['skull', 'skeleton', 'streetwear', 'grunge', 'dark', 'edgy', 'biker'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 15 C32 15 22 28 22 48 C22 60 28 68 35 72 L35 84 L65 84 L65 72 C72 68 78 60 78 48 C78 28 68 15 50 15 Z M36 48 C39 48 42 52 42 56 C42 60 39 64 36 64 C33 64 30 60 30 56 C30 52 33 48 36 48 Z M64 48 C67 48 70 52 70 56 C70 60 67 64 64 64 C61 64 58 60 58 56 C58 52 61 48 64 48 Z M50 64 L53 72 L47 72 Z M42 78 L44 82 L40 82 Z M50 78 L52 82 L48 82 Z M58 78 L60 82 L56 82 Z"/>
    </svg>`
  },
  {
    id: 'flower-lotus',
    name: 'Lotus Blossom',
    category: 'Nature',
    tags: ['flower', 'lotus', 'blossom', 'floral', 'peace', 'zen', 'traditional', 'nature'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 20 C54 36 62 48 72 54 C66 66 56 74 50 82 C44 74 34 66 28 54 C38 48 46 36 50 20 Z M50 42 C53 50 58 58 64 62 C58 68 54 72 50 76 C46 72 42 68 36 62 C42 58 47 50 50 42 Z M20 58 C30 58 38 64 44 72 C32 74 24 68 20 58 Z M80 58 C70 58 62 64 56 72 C68 74 76 68 80 58 Z"/>
    </svg>`
  },
  {
    id: 'mountain-peak',
    name: 'Mountain Peak',
    category: 'Nature',
    tags: ['mountain', 'peak', 'adventure', 'travel', 'outdoor', 'hiking', 'nature'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 18 L15 82 L85 82 Z M50 36 L68 72 L32 72 Z M68 50 L92 82 L56 82 Z"/>
    </svg>`
  },
  {
    id: 'sun-crest',
    name: 'Sol Invictus Sun',
    category: 'Nature',
    tags: ['sun', 'solar', 'light', 'morning', 'summer', 'gold', 'nature'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <circle cx="50" cy="50" r="20"/>
      <path d="M50 8 L50 22 M50 78 L50 92 M8 50 L22 50 M78 50 L92 50 M20 20 L30 30 M70 70 L80 80 M20 80 L30 70 M70 30 L80 20" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'crescent-moon',
    name: 'Crescent Moon',
    category: 'Nature',
    tags: ['moon', 'crescent', 'night', 'lunar', 'sky', 'minimal', 'nature'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M55 15 C35 15 20 30 20 50 C20 70 35 85 55 85 C65 85 74 80 80 72 C64 72 50 60 50 44 C50 30 58 20 72 17 C67 15 61 15 55 15 Z"/>
    </svg>`
  },

  // Streetwear & Modern
  {
    id: 'abstract-geo-cube',
    name: 'Isometric Cube',
    category: 'Streetwear',
    tags: ['abstract', 'geometric', 'cube', 'isometric', 'modern', '3d', 'streetwear'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 15 L82 33 L50 51 L18 33 Z" opacity="0.9"/>
      <path d="M18 33 L50 51 L50 85 L18 67 Z" opacity="0.7"/>
      <path d="M50 51 L82 33 L82 67 L50 85 Z" opacity="0.5"/>
    </svg>`
  },
  {
    id: 'sport-football',
    name: 'Football Crest',
    category: 'Sports',
    tags: ['sports', 'football', 'soccer', 'athletic', 'ball', 'game', 'club'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="6"/>
      <polygon points="50,32 64,42 59,58 41,58 36,42"/>
      <path d="M50 32 L50 12 M64 42 L80 34 M59 58 L72 74 M41 58 L28 74 M36 42 L20 34" stroke="currentColor" stroke-width="5"/>
    </svg>`
  },
  {
    id: 'music-vinyl',
    name: 'Vinyl Beats',
    category: 'Music',
    tags: ['music', 'vinyl', 'beats', 'dj', 'audio', 'song', 'sound'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <circle cx="50" cy="50" r="38"/>
      <circle cx="50" cy="50" r="28" fill="none" stroke="white" stroke-width="2"/>
      <circle cx="50" cy="50" r="18" fill="none" stroke="white" stroke-width="2"/>
      <circle cx="50" cy="50" r="8" fill="white"/>
    </svg>`
  },
  {
    id: 'travel-compass',
    name: 'Wanderlust Compass',
    category: 'Travel',
    tags: ['travel', 'compass', 'wanderlust', 'adventure', 'explore', 'map', 'journey'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" stroke-width="5"/>
      <polygon points="50,18 56,44 50,42" fill="currentColor"/>
      <polygon points="50,18 44,44 50,42" opacity="0.6"/>
      <polygon points="50,82 56,56 50,58" opacity="0.6"/>
      <polygon points="50,82 44,56 50,58" fill="currentColor"/>
      <polygon points="18,50 44,44 42,50" fill="currentColor"/>
      <polygon points="82,50 56,44 58,50" opacity="0.6"/>
    </svg>`
  },
  {
    id: 'minimal-anchor',
    name: 'Minimal Maritime Anchor',
    category: 'Minimal',
    tags: ['minimal', 'anchor', 'ocean', 'navy', 'sea', 'maritime', 'sailor'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <circle cx="50" cy="22" r="8" fill="none" stroke="currentColor" stroke-width="5"/>
      <rect x="47" y="30" width="6" height="50" rx="3"/>
      <rect x="30" y="42" width="40" height="6" rx="3"/>
      <path d="M22 60 C26 78 74 78 78 60" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
      <polygon points="22,60 16,52 28,52"/>
      <polygon points="78,60 72,52 84,52"/>
    </svg>`
  }
];

// ============================================================================
// 3. ORIGINAL GENERIC PATCHES & BADGES (Section 8)
// ============================================================================
export const PATCHES_LIBRARY = [
  {
    id: 'patch-shield',
    name: 'Elite Shield Crest',
    category: 'Badges',
    tags: ['shield', 'patch', 'crest', 'badge', 'embroidery'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 12 L82 22 C82 52 68 76 50 88 C32 76 18 52 18 22 Z" stroke="currentColor" stroke-width="4" stroke-dasharray="2,2"/>
      <path d="M50 20 L74 28 C74 50 62 70 50 78 C38 70 26 50 26 28 Z" fill="none" stroke="currentColor" stroke-width="3"/>
      <polygon points="50,34 54,46 66,46 56,54 60,66 50,58 40,66 44,54 34,46 46,46"/>
    </svg>`
  },
  {
    id: 'patch-star-badge',
    name: 'Five-Star Military Patch',
    category: 'Badges',
    tags: ['star', 'patch', 'military', 'officer', 'badge'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <circle cx="50" cy="50" r="38" stroke="currentColor" stroke-width="5" stroke-dasharray="3,3" fill="none"/>
      <circle cx="50" cy="50" r="32" stroke="currentColor" stroke-width="2" fill="none"/>
      <polygon points="50,24 57,40 74,40 60,50 65,66 50,56 35,66 40,50 26,40 43,40"/>
    </svg>`
  },
  {
    id: 'patch-mountain-crest',
    name: 'Alpine Club Patch',
    category: 'Travel',
    tags: ['mountain', 'alpine', 'club', 'outdoor', 'patch'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <polygon points="50,15 85,75 15,75" fill="none" stroke="currentColor" stroke-width="5"/>
      <polygon points="50,28 72,70 28,70" fill="currentColor" opacity="0.3"/>
      <path d="M50 32 L36 65 L64 65 Z" fill="currentColor"/>
    </svg>`
  },
  {
    id: 'patch-sport-varsity',
    name: 'Varsity No. 01',
    category: 'Sports',
    tags: ['number', 'varsity', 'sport', 'athlete', 'patch', '01'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <rect x="15" y="15" width="70" height="70" rx="14" fill="none" stroke="currentColor" stroke-width="6"/>
      <text x="50" y="65" font-family="'Impact', sans-serif" font-size="44" font-weight="bold" text-anchor="middle" fill="currentColor">01</text>
    </svg>`
  },
  {
    id: 'patch-initial-f',
    name: 'Atelier Monogram Badge',
    category: 'Monogram',
    tags: ['monogram', 'initial', 'f', 'badge', 'luxury'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" stroke-width="4"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4,2"/>
      <text x="50" y="64" font-family="'Times New Roman', serif" font-size="40" font-weight="bold" font-style="italic" text-anchor="middle" fill="currentColor">FF</text>
    </svg>`
  },
  {
    id: 'patch-music-sound',
    name: 'Acoustic Patch',
    category: 'Music',
    tags: ['music', 'patch', 'sound', 'badge'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <rect x="20" y="20" width="60" height="60" rx="30" fill="none" stroke="currentColor" stroke-width="5"/>
      <path d="M42 35 L42 62 C40 60 36 60 34 62 C30 65 32 70 36 70 C40 70 44 66 44 62 L44 42 L62 38 L62 58 C60 56 56 56 54 58 C50 61 52 66 56 66 C60 66 64 62 64 58 L64 30 Z"/>
    </svg>`
  },
  {
    id: 'patch-travel-globe',
    name: 'Voyager Travel Crest',
    category: 'Travel',
    tags: ['travel', 'voyager', 'globe', 'compass', 'badge', 'patch'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="4"/>
      <ellipse cx="50" cy="50" rx="20" ry="38" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="12" y1="50" x2="88" y2="50" stroke="currentColor" stroke-width="3"/>
      <line x1="18" y1="32" x2="82" y2="32" stroke="currentColor" stroke-width="2"/>
      <line x1="18" y1="68" x2="82" y2="68" stroke="currentColor" stroke-width="2"/>
    </svg>`
  },
  {
    id: 'patch-minimal-badge',
    name: 'Minimalist Hex Badge',
    category: 'Minimal',
    tags: ['minimal', 'hexagon', 'geometric', 'badge', 'patch'],
    svg: `<svg viewBox="0 0 100 100" fill="currentColor">
      <polygon points="50,15 85,35 85,75 50,95 15,75 15,35" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="4,2"/>
      <polygon points="50,26 76,41 76,71 50,86 24,71 24,41" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="50" cy="56" r="10" fill="currentColor"/>
    </svg>`
  }
];

// ============================================================================
// 4. ORIGINAL CLOTHING PATTERNS (Section 5)
// ============================================================================
export const PATTERNS_LIBRARY = [
  {
    id: 'stripes-classic',
    name: 'Classic Pinstripes',
    category: 'Linear',
    cssPattern: (color = '#000000', scale = 1, opacity = 0.8) => ({
      backgroundImage: `repeating-linear-gradient(45deg, ${color} 0, ${color} ${2 * scale}px, transparent ${2 * scale}px, transparent ${12 * scale}px)`,
      opacity
    })
  },
  {
    id: 'dots-polka',
    name: 'Micro Polka Dots',
    category: 'Geometric',
    cssPattern: (color = '#000000', scale = 1, opacity = 0.8) => ({
      backgroundImage: `radial-gradient(${color} ${1.5 * scale}px, transparent ${1.5 * scale}px)`,
      backgroundSize: `${14 * scale}px ${14 * scale}px`,
      opacity
    })
  },
  {
    id: 'grid-minimal',
    name: 'Architectural Grid',
    category: 'Geometric',
    cssPattern: (color = '#000000', scale = 1, opacity = 0.8) => ({
      backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
      backgroundSize: `${18 * scale}px ${18 * scale}px`,
      opacity
    })
  },
  {
    id: 'checker-board',
    name: 'Racing Checkerboard',
    category: 'Streetwear',
    cssPattern: (color = '#000000', scale = 1, opacity = 0.8) => ({
      backgroundImage: `linear-gradient(45deg, ${color} 25%, transparent 25%), linear-gradient(-45deg, ${color} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${color} 75%), linear-gradient(-45deg, transparent 75%, ${color} 75%)`,
      backgroundSize: `${20 * scale}px ${20 * scale}px`,
      backgroundPosition: `0 0, 0 ${10 * scale}px, ${10 * scale}px -${10 * scale}px, -${10 * scale}px 0px`,
      opacity
    })
  },
  {
    id: 'waves-zen',
    name: 'Zen Waves',
    category: 'Abstract',
    cssPattern: (color = '#000000', scale = 1, opacity = 0.8) => ({
      backgroundImage: `repeating-radial-gradient(circle at 0 0, transparent 0, transparent ${6 * scale}px, ${color} ${6 * scale}px, ${color} ${8 * scale}px)`,
      backgroundSize: `${16 * scale}px ${16 * scale}px`,
      opacity
    })
  },
  {
    id: 'camo-urban',
    name: 'Urban Camo Texture',
    category: 'Streetwear',
    cssPattern: (color = '#333333', scale = 1, opacity = 0.75) => ({
      backgroundImage: `radial-gradient(circle at 20% 30%, ${color} 12%, transparent 13%), radial-gradient(circle at 75% 65%, ${color} 18%, transparent 19%), radial-gradient(circle at 45% 80%, ${color} 15%, transparent 16%)`,
      backgroundSize: `${36 * scale}px ${36 * scale}px`,
      opacity
    })
  }
];

// ============================================================================
// 5. COLOR & FINISH PRINT EFFECTS (Section 7)
// ============================================================================
export const PRINT_STYLE_EFFECTS = [
  {
    id: 'solid',
    name: 'Solid Pigment',
    description: 'Clean opaque matte textile dye with high rub-fastness.',
    cssStyle: (color = '#1F2937') => ({
      color: color,
      filter: 'none'
    })
  },
  {
    id: 'gold',
    name: 'Metallic Gold Leaf',
    description: 'Luxury heat-transferred golden foil with subtle metallic gleam.',
    badge: 'Luxury',
    cssStyle: () => ({
      background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 25%, #FDE68A 50%, #D97706 75%, #B45309 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: '#D97706',
      filter: 'drop-shadow(0px 2px 4px rgba(217, 119, 6, 0.4))'
    })
  },
  {
    id: 'silver',
    name: 'Silver Foil Shimmer',
    description: 'Crisp platinum-silver foil print with polished luster.',
    badge: 'Modern',
    cssStyle: () => ({
      background: 'linear-gradient(135deg, #94A3B8 0%, #E2E8F0 30%, #FFFFFF 50%, #CBD5E1 70%, #64748B 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: '#64748B',
      filter: 'drop-shadow(0px 2px 4px rgba(100, 116, 139, 0.35))'
    })
  },
  {
    id: 'metallic',
    name: 'Brushed Bronze Metallic',
    description: 'Industrial metallic bronze sheen with reflective undertones.',
    cssStyle: () => ({
      background: 'linear-gradient(135deg, #78350F 0%, #B45309 35%, #F59E0B 60%, #92400E 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: '#92400E'
    })
  },
  {
    id: 'neon',
    name: 'Neon Cyber Glow',
    description: 'High-intensity fluorescent neon with vibrant halo bloom.',
    badge: 'Streetwear',
    cssStyle: (color = '#10B981') => ({
      color: color,
      filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 12px ${color})`
    })
  },
  {
    id: 'embroidery',
    name: 'Raised Embroidery Thread',
    description: 'Tactile textured stitching finish with micro-relief shadows.',
    cssStyle: (color = '#1F2937') => ({
      color: color,
      filter: 'drop-shadow(1px 1px 0px rgba(255,255,255,0.7)) drop-shadow(-1px -1px 0px rgba(0,0,0,0.5))'
    })
  },
  {
    id: 'matte',
    name: 'Ultra-Matte Chalk',
    description: 'Subdued non-reflective soft-touch pigment finish.',
    cssStyle: (color = '#1F2937') => ({
      color: color,
      filter: 'contrast(90%)'
    })
  },
  {
    id: 'glossy',
    name: 'Gloss Enamel Gel',
    description: 'High-gloss raised gel print with wet-look shine.',
    cssStyle: (color = '#1F2937') => ({
      color: color,
      filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.4))'
    })
  }
];

// ============================================================================
// 6. IMAGE EFFECTS FOR PHOTO PRINTING (Section 3)
// ============================================================================
export const IMAGE_EFFECTS = [
  { id: 'original', name: 'Original', filter: 'none' },
  { id: 'bw', name: 'Black & White', filter: 'grayscale(100%) contrast(120%)' },
  { id: 'grayscale', name: 'Grayscale', filter: 'grayscale(100%)' },
  { id: 'high-contrast', name: 'High Contrast', filter: 'contrast(160%) brightness(105%)' },
  { id: 'vintage', name: 'Vintage', filter: 'sepia(60%) contrast(110%) brightness(95%) hue-rotate(-15deg)' },
  { id: 'warm', name: 'Warm Sunset', filter: 'sepia(30%) saturate(140%) brightness(105%)' },
  { id: 'cool', name: 'Cool Nordic', filter: 'saturate(85%) hue-rotate(180deg) brightness(105%)' },
  { id: 'duotone', name: 'Duotone Gold', filter: 'sepia(100%) saturate(300%) hue-rotate(5deg)' },
  { id: 'poster', name: 'Poster Art', filter: 'contrast(200%) saturate(160%)' },
  { id: 'sketch', name: 'Pencil Sketch', filter: 'grayscale(100%) contrast(250%) brightness(110%)' },
  { id: 'shadow', name: 'Drop Shadow', filter: 'drop-shadow(4px 6px 12px rgba(0,0,0,0.45))' }
];

// ============================================================================
// 7. DESIGN TEMPLATES (Section 11)
// ============================================================================
export const DESIGN_TEMPLATES = [
  {
    id: 'minimal',
    name: 'Minimal Crest',
    badge: 'Timeless',
    description: 'Small subtle chest graphic with refined clean typography.',
    layers: [
      {
        type: 'graphic',
        asset: 'crown-imperial',
        name: 'Imperial Crown',
        printArea: 'chest',
        position: { x: 50, y: 35 },
        scale: 0.6,
        rotation: 0,
        color: '#D97706',
        opacity: 0.9,
        printStyle: 'gold'
      },
      {
        type: 'text',
        text: 'FITFUSION',
        font: 'Playfair Display',
        printArea: 'chest',
        position: { x: 50, y: 65 },
        scale: 0.55,
        rotation: 0,
        color: '#1F2937',
        opacity: 1,
        printStyle: 'solid'
      }
    ]
  },
  {
    id: 'streetwear',
    name: 'Streetwear Statement',
    badge: 'Bold',
    description: 'Statement oversized back graphic with clean front monogram.',
    layers: [
      {
        type: 'graphic',
        asset: 'lion-crest',
        name: 'Royal Lion Crest',
        printArea: 'back',
        position: { x: 50, y: 45 },
        scale: 1.1,
        rotation: 0,
        color: '#D97706',
        opacity: 1,
        printStyle: 'gold'
      },
      {
        type: 'text',
        text: 'CREATE YOUR STYLE',
        font: 'Bebas Neue',
        printArea: 'back',
        position: { x: 50, y: 82 },
        scale: 0.85,
        rotation: 0,
        color: '#FFFFFF',
        opacity: 0.95,
        printStyle: 'gold'
      },
      {
        type: 'patch',
        asset: 'patch-initial-f',
        name: 'FF Monogram',
        printArea: 'front',
        position: { x: 50, y: 30 },
        scale: 0.5,
        rotation: 0,
        color: '#D97706',
        opacity: 1,
        printStyle: 'gold'
      }
    ]
  },
  {
    id: 'sport',
    name: 'Varsity Athletics',
    badge: 'Athletic',
    description: 'Collegiate number print, team moniker and sports insignia.',
    layers: [
      {
        type: 'patch',
        asset: 'patch-sport-varsity',
        name: 'Varsity 01',
        printArea: 'front',
        position: { x: 50, y: 40 },
        scale: 0.9,
        rotation: 0,
        color: '#2563EB',
        opacity: 1,
        printStyle: 'solid'
      },
      {
        type: 'text',
        text: 'CHAMPION',
        font: 'Impact',
        printArea: 'back',
        position: { x: 50, y: 30 },
        scale: 0.9,
        rotation: 0,
        color: '#1E293B',
        opacity: 1,
        printStyle: 'solid'
      }
    ]
  },
  {
    id: 'premium',
    name: 'Royal Gold Atelier',
    badge: 'Premium',
    description: 'Burnished gold lion heraldry with calligraphic gold lettering.',
    layers: [
      {
        type: 'graphic',
        asset: 'lion-crest',
        name: 'Gold Lion',
        printArea: 'front',
        position: { x: 50, y: 40 },
        scale: 0.95,
        rotation: 0,
        color: '#D97706',
        opacity: 1,
        printStyle: 'gold'
      },
      {
        type: 'text',
        text: 'FITFUSION ATELIER',
        font: 'Playfair Display',
        printArea: 'front',
        position: { x: 50, y: 75 },
        scale: 0.7,
        rotation: 0,
        color: '#D97706',
        opacity: 1,
        printStyle: 'gold'
      }
    ]
  },
  {
    id: 'photo',
    name: 'Photo Spotlight',
    badge: 'Memories',
    description: 'Centerpiece portrait photo placement with subtle script caption.',
    layers: [
      {
        type: 'text',
        text: 'MEMORIES',
        font: 'Montserrat',
        printArea: 'front',
        position: { x: 50, y: 25 },
        scale: 0.6,
        rotation: 0,
        color: '#1F2937',
        opacity: 1,
        printStyle: 'solid'
      }
    ]
  },
  {
    id: 'custom',
    name: 'Blank Canvas',
    badge: 'Freeform',
    description: 'Clean empty canvas ready for completely custom design creation.',
    layers: []
  }
];

// ============================================================================
// 8. AI DESIGN ASSISTANT (Section 12)
// Natural language parser without paid API dependence.
// ============================================================================
export function parseNaturalDesignPrompt(prompt = '', garmentCategory = 'T-Shirts') {
  const clean = (prompt || '').toLowerCase().trim();
  if (!clean) {
    return {
      success: false,
      message: 'Use the design tools below to create your design.',
      layers: [],
      appliedSummary: []
    };
  }

  const layers = [];
  const appliedSummary = [];
  const unsupportedNotes = [];
  const printAreas = getPrintAreasForCategory(garmentCategory);
  const defaultArea = printAreas[0]?.id || 'front';

  // 1. EXTRACT GARMENT FIT
  let extractedFit = null;
  if (clean.includes('oversized') || clean.includes('loose') || clean.includes('baggy')) {
    extractedFit = 'Relaxed';
    appliedSummary.push('Fit: Oversized / Relaxed drape');
  } else if (clean.includes('slim') || clean.includes('fitted') || clean.includes('tight') || clean.includes('tapered')) {
    extractedFit = 'Slim';
    appliedSummary.push('Fit: Slim Modern Contour');
  } else if (clean.includes('regular') || clean.includes('classic') || clean.includes('standard')) {
    extractedFit = 'Regular';
    appliedSummary.push('Fit: Classic Regular Fit');
  }

  // 2. EXTRACT GARMENT FABRIC
  let extractedFabric = null;
  const fabricKeywords = [
    { key: 'cotton', name: 'Cotton' },
    { key: 'linen', name: 'Linen' },
    { key: 'silk', name: 'Silk' },
    { key: 'denim', name: 'Denim' },
    { key: 'wool', name: 'Wool' },
    { key: 'fleece', name: 'Fleece' },
    { key: 'corduroy', name: 'Corduroy' },
    { key: 'satin', name: 'Satin' }
  ];
  for (const fab of fabricKeywords) {
    if (clean.includes(fab.key)) {
      extractedFabric = fab.name;
      appliedSummary.push(`Fabric: ${fab.name}`);
      break;
    }
  }

  // 3. EXTRACT GARMENT COLOR VS GRAPHIC/PRINT COLOR
  let extractedGarmentColor = null;
  let extractedGraphicColor = '#FFFFFF'; // Default for prints unless specified

  const colorMap = [
    { name: 'Black', hex: '#111827', keys: ['black', 'obsidian', 'noir'] },
    { name: 'White', hex: '#FFFFFF', keys: ['white', 'pure white'] },
    { name: 'Off White', hex: '#F9FAFB', keys: ['off white', 'off-white', 'ivory'] },
    { name: 'Cream', hex: '#FFFBEB', keys: ['cream', 'ecru'] },
    { name: 'Navy', hex: '#1E3A8A', keys: ['navy', 'midnight blue', 'dark blue'] },
    { name: 'Royal Blue', hex: '#2563EB', keys: ['royal blue', 'blue'] },
    { name: 'Sky Blue', hex: '#38BDF8', keys: ['sky blue', 'light blue'] },
    { name: 'Powder Blue', hex: '#B0E0E6', keys: ['powder blue'] },
    { name: 'Olive', hex: '#65A30D', keys: ['olive', 'olive green', 'military green'] },
    { name: 'Forest Green', hex: '#15803D', keys: ['forest green', 'green', 'emerald'] },
    { name: 'Mint', hex: '#6EE7B7', keys: ['mint', 'mint green'] },
    { name: 'Maroon', hex: '#831843', keys: ['maroon', 'crimson'] },
    { name: 'Burgundy', hex: '#881337', keys: ['burgundy', 'bordeaux'] },
    { name: 'Wine', hex: '#701A75', keys: ['wine', 'plum'] },
    { name: 'Red', hex: '#DC2626', keys: ['red', 'scarlet'] },
    { name: 'Beige', hex: '#F5F5DC', keys: ['beige', 'sand'] },
    { name: 'Tan', hex: '#D2B48C', keys: ['tan', 'khaki'] },
    { name: 'Camel', hex: '#C19A6B', keys: ['camel'] },
    { name: 'Charcoal', hex: '#374151', keys: ['charcoal', 'dark grey'] },
    { name: 'Grey', hex: '#6B7280', keys: ['grey', 'gray'] },
    { name: 'Light Grey', hex: '#D1D5DB', keys: ['light grey', 'heather grey'] },
    { name: 'Yellow', hex: '#EAB308', keys: ['yellow'] },
    { name: 'Mustard', hex: '#CA8A04', keys: ['mustard'] },
    { name: 'Orange', hex: '#EA580C', keys: ['orange', 'rust'] },
    { name: 'Pink', hex: '#F472B6', keys: ['pink', 'rose'] },
    { name: 'Purple', hex: '#9333EA', keys: ['purple', 'lavender', 'violet'] },
    { name: 'Gold', hex: '#F59E0B', keys: ['gold', 'golden'] }
  ];

  // Distinguish garment base color from graphic symbol color
  // Example: "black oversized t-shirt with a white mountain symbol"
  // "black" belongs to t-shirt; "white" belongs to mountain symbol
  for (const c of colorMap) {
    for (const k of c.keys) {
      if (clean.includes(k)) {
        // Check if color is attached to graphic keyword
        const graphicContext = clean.includes(`${k} mountain`) ||
          clean.includes(`${k} symbol`) ||
          clean.includes(`${k} print`) ||
          clean.includes(`${k} logo`) ||
          clean.includes(`${k} crest`) ||
          clean.includes(`${k} graphic`) ||
          clean.includes(`${k} patch`) ||
          clean.includes(`${k} text`);

        if (graphicContext) {
          extractedGraphicColor = c.hex;
        } else if (!extractedGarmentColor) {
          extractedGarmentColor = { name: c.name, hex: c.hex };
          appliedSummary.push(`Garment Color: ${c.name} (${c.hex})`);
        }
      }
    }
  }

  // Fallback if only one color was given and graphic is present
  if (!extractedGarmentColor && clean.includes('black')) {
    extractedGarmentColor = { name: 'Black', hex: '#111827' };
    appliedSummary.push('Garment Color: Black (#111827)');
  }

  // 4. DETERMINE TARGET PRINT AREA & PLACEMENT COORDINATES
  let targetArea = defaultArea;
  let customPosition = { x: 50, y: 50 };

  if (clean.includes('left chest') || clean.includes('chest pocket') || clean.includes('left breast')) {
    targetArea = printAreas.find(a => a.id.includes('chest') || a.id.includes('pocket'))?.id || defaultArea;
    customPosition = { x: 28, y: 32 };
    appliedSummary.push('Placement: Left Chest (x: 28%, y: 32%)');
  } else if (clean.includes('right chest')) {
    targetArea = printAreas.find(a => a.id.includes('chest') || a.id.includes('pocket'))?.id || defaultArea;
    customPosition = { x: 72, y: 32 };
    appliedSummary.push('Placement: Right Chest (x: 72%, y: 32%)');
  } else if (clean.includes('back')) {
    targetArea = printAreas.find(a => a.id.includes('back'))?.id || 'back';
    customPosition = { x: 50, y: 40 };
    appliedSummary.push('Placement: Upper Back');
  } else if (clean.includes('sleeve')) {
    targetArea = printAreas.find(a => a.id.includes('sleeve'))?.id || 'sleeve';
    customPosition = { x: 50, y: 45 };
    appliedSummary.push('Placement: Outer Sleeve');
  } else {
    appliedSummary.push(`Placement: ${printAreas.find(a => a.id === targetArea)?.label || 'Front Center'}`);
  }

  // 5. SCALE FACTOR
  let scaleFactor = 0.8;
  if (clean.includes('small') || clean.includes('tiny') || clean.includes('minimal') || clean.includes('subtle')) {
    scaleFactor = 0.42;
    appliedSummary.push('Scale: Small Minimalist (42%)');
  } else if (clean.includes('large') || clean.includes('big') || clean.includes('oversized print') || clean.includes('statement')) {
    scaleFactor = 1.15;
    appliedSummary.push('Scale: Large Statement (115%)');
  }

  // 6. LOOK FOR GRAPHIC MATCHES IN LIBRARY
  const matchedGraphic = GRAPHICS_LIBRARY.find(g => {
    return clean.includes(g.id) || g.tags.some(t => clean.includes(t));
  });

  if (matchedGraphic) {
    layers.push({
      id: `ai-graphic-${Date.now()}`,
      type: 'graphic',
      asset: matchedGraphic.id,
      name: matchedGraphic.name,
      title: matchedGraphic.name,
      printArea: targetArea,
      position: customPosition,
      scale: scaleFactor,
      rotation: 0,
      color: extractedGraphicColor,
      opacity: 1,
      printStyle: clean.includes('gold') ? 'gold' : clean.includes('embroid') ? 'embroidery' : 'solid'
    });
    appliedSummary.push(`Artwork Symbol: ${matchedGraphic.name} in ${extractedGraphicColor === '#FFFFFF' ? 'White' : extractedGraphicColor}`);
  }

  // Check for Patch matches
  const matchedPatch = PATCHES_LIBRARY.find(p => {
    return clean.includes('patch') && p.tags.some(t => clean.includes(t));
  });
  if (matchedPatch && !matchedGraphic) {
    layers.push({
      id: `ai-patch-${Date.now()}`,
      type: 'patch',
      asset: matchedPatch.id,
      name: matchedPatch.name,
      title: matchedPatch.name,
      printArea: targetArea,
      position: customPosition,
      scale: scaleFactor,
      rotation: 0,
      color: extractedGraphicColor,
      opacity: 1,
      printStyle: 'solid'
    });
    appliedSummary.push(`Embroidered Patch: ${matchedPatch.name}`);
  }

  // Check for Pattern matches
  const matchedPattern = PATTERNS_LIBRARY.find(pat => clean.includes(pat.name.toLowerCase()) || clean.includes(pat.id));
  if (matchedPattern) {
    layers.push({
      id: `ai-pattern-${Date.now()}`,
      type: 'pattern',
      asset: matchedPattern.id,
      name: matchedPattern.name,
      title: matchedPattern.name,
      printArea: targetArea,
      position: { x: 50, y: 50 },
      scale: 1,
      rotation: 0,
      color: extractedGraphicColor,
      opacity: 0.8,
      printStyle: 'solid'
    });
    appliedSummary.push(`Seamless Pattern: ${matchedPattern.name}`);
  }

  // Check for Text intent
  const textQuoteMatch = prompt.match(/["']([^"']+)["']/);
  let extractedText = textQuoteMatch ? textQuoteMatch[1] : null;
  if (!extractedText) {
    if (clean.includes('fitfusion')) extractedText = 'FITFUSION';
    else if (clean.includes('quote') || clean.includes('slogan')) extractedText = 'ATELIER ESSENTIAL';
    else if (clean.includes('text')) extractedText = clean.includes('gold') ? 'ROYAL' : 'CUSTOM';
  }

  if (extractedText) {
    const isGold = clean.includes('gold');
    layers.push({
      id: `ai-text-${Date.now()}`,
      type: 'text',
      asset: null,
      name: extractedText,
      title: extractedText,
      text: extractedText,
      font: isGold || clean.includes('royal') ? 'Playfair Display' : 'Montserrat',
      printArea: targetArea,
      position: { x: customPosition.x, y: layers.length > 0 ? customPosition.y + 20 : customPosition.y },
      scale: clean.includes('small') ? 0.55 : 0.75,
      rotation: 0,
      color: isGold ? '#D4AF37' : extractedGraphicColor,
      opacity: 1,
      printStyle: isGold ? 'gold' : 'solid'
    });
    appliedSummary.push(`Custom Typography: "${extractedText}"`);
  }

  // Check for unsupported feature requests
  if (clean.includes('zipper') || clean.includes('zip')) {
    unsupportedNotes.push('Custom zippers are not supported on standard crewnecks.');
  }
  if (clean.includes('led') || clean.includes('glow in the dark') || clean.includes('light')) {
    unsupportedNotes.push('Active illumination is not currently fabricated.');
  }

  const hasAnyMatch = layers.length > 0 || extractedGarmentColor || extractedFit || extractedFabric;

  if (hasAnyMatch) {
    const summaryMsg = appliedSummary.join(' • ');
    return {
      success: true,
      matched: true,
      garmentColor: extractedGarmentColor,
      fit: extractedFit,
      fabric: extractedFabric,
      layers,
      targetArea,
      appliedSummary,
      unsupportedNotes,
      message: `Configured: ${summaryMsg}`
    };
  }

  return {
    success: false,
    matched: false,
    message: 'Could not match specific keywords. Use the studio tools below to choose fabrics, colors, graphics & text.',
    layers: [],
    appliedSummary: []
  };
}

// Single source of truth disclaimer (Section 7)
export const DISCLAIMER_TEXT = 'Preview only – final print may vary slightly.';

// Helpful aliases and utilities
export const PRINT_EFFECTS = PRINT_STYLE_EFFECTS;
export const getPrintAreasForGarment = getPrintAreasForCategory;

export function searchGraphics(query = '') {
  if (!query) return GRAPHICS_LIBRARY;
  const q = query.toLowerCase().trim();
  return GRAPHICS_LIBRARY.filter(item =>
    item.name?.toLowerCase().includes(q) ||
    item.title?.toLowerCase().includes(q) ||
    item.id?.toLowerCase().includes(q) ||
    item.category?.toLowerCase().includes(q) ||
    (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
  );
}

export function createDefaultLayer(type = 'graphic', overrides = {}) {
  const id = `layer_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  return {
    id,
    type,
    asset: overrides.asset || null,
    title: overrides.title || (type.charAt(0).toUpperCase() + type.slice(1)),
    position: overrides.position || { x: 50, y: 50 },
    scale: overrides.scale !== undefined ? overrides.scale : 1,
    rotation: overrides.rotation !== undefined ? overrides.rotation : 0,
    color: overrides.color || '#D4AF37',
    opacity: overrides.opacity !== undefined ? overrides.opacity : 1,
    printStyle: overrides.printStyle || 'solid',
    printArea: overrides.printArea || 'front',
    text: overrides.text || '',
    fontFamily: overrides.fontFamily || 'Inter',
    fontSize: overrides.fontSize || 24,
    isBold: !!overrides.isBold,
    isItalic: !!overrides.isItalic,
    filter: overrides.filter || 'none',
    ...overrides
  };
}
