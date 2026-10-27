import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

function createStudioSvg({ content, label = 'FITFUSION STUDIO' }) {
  return `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#F8FAFC" />
        <stop offset="70%" stop-color="#F1F5F9" />
        <stop offset="100%" stop-color="#E2E8F0" />
      </linearGradient>
      <radialGradient id="spotlight" cx="50%" cy="42%" r="65%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
        <stop offset="60%" stop-color="#FFFFFF" stop-opacity="0.2" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="floorShadow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#0F172A" stop-opacity="0.25" />
        <stop offset="50%" stop-color="#0F172A" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#0F172A" stop-opacity="0" />
      </radialGradient>
      
      <filter id="garmentShadow" x="-15%" y="-15%" width="130%" height="140%">
        <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#0F172A" flood-opacity="0.16" />
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0F172A" flood-opacity="0.09" />
      </filter>

      <!-- Soft Highlights & Sheen -->
      <linearGradient id="sheen" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.22" />
        <stop offset="40%" stop-color="#FFFFFF" stop-opacity="0.04" />
        <stop offset="70%" stop-color="#000000" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.25" />
      </linearGradient>

      <!-- Fabric Weave / Heather Texture -->
      <filter id="fabricTexture" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" result="noise" />
        <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.07 0" />
        <feComposite in2="SourceGraphic" in="glare" operator="atop" />
      </filter>
    </defs>

    <!-- Studio Backing -->
    <rect width="600" height="600" fill="url(#bgGrad)" />
    <rect width="600" height="600" fill="url(#spotlight)" />

    <!-- Studio Floor Soft Contact Shadow -->
    <ellipse cx="300" cy="510" rx="180" ry="22" fill="url(#floorShadow)" />

    <!-- Garment Body -->
    <g filter="url(#garmentShadow)">
      ${content}
    </g>

    <!-- Subtle Brand Indicator -->
    <text x="300" y="562" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" letter-spacing="2.5" fill="#64748B" opacity="0.7">
      ${label}
    </text>
  </svg>`;
}

async function run() {
  const testDir = path.resolve('public/images/products/test');
  fs.mkdirSync(testDir, { recursive: true });

  // Refined Oversized T-Shirt
  const tShirtRefined = `
    <!-- Inner Back Neck Collar Hole -->
    <path d="M245 135 C270 125, 330 125, 355 135 C345 155, 255 155, 245 135 Z" fill="#09090B"/>
    <text x="300" y="148" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#71717A" letter-spacing="1">FITFUSION M</text>

    <!-- Main Silhouette (Torso & Dropped Sleeves) -->
    <path d="
      M245 135
      C220 142, 175 160, 130 185
      L90 280
      C85 292, 110 305, 125 295
      L155 245
      L165 245
      C170 255, 175 270, 175 285
      L175 470
      C175 480, 190 485, 205 485
      L395 485
      C410 485, 425 480, 425 470
      L425 285
      C425 270, 430 255, 435 245
      L445 245
      L475 295
      C490 305, 515 292, 510 280
      L470 185
      C425 160, 380 142, 355 135
      C340 162, 260 162, 245 135 Z
    " fill="#18181B" stroke="#09090B" stroke-width="2.5" stroke-linejoin="round"/>

    <!-- Subtle Sheen Overlay -->
    <path d="
      M245 135
      C220 142, 175 160, 130 185
      L90 280
      C85 292, 110 305, 125 295
      L155 245
      L165 245
      C170 255, 175 270, 175 285
      L175 470
      C175 480, 190 485, 205 485
      L395 485
      C410 485, 425 480, 425 470
      L425 285
      C425 270, 430 255, 435 245
      L445 245
      L475 295
      C490 305, 515 292, 510 280
      L470 185
      C425 160, 380 142, 355 135
      C340 162, 260 162, 245 135 Z
    " fill="url(#sheen)"/>

    <!-- Ribbed Crew Neck Collar Band -->
    <path d="M245 135 C260 168, 340 168, 355 135 C345 158, 255 158, 245 135 Z" fill="#27272A" stroke="#3F3F46" stroke-width="1.5"/>
    <path d="M242 138 C260 172, 340 172, 358 138" fill="none" stroke="#52525B" stroke-width="1" stroke-dasharray="2,2"/>

    <!-- Dropped Shoulder Seam Detail -->
    <path d="M190 152 Q180 195, 168 245" fill="none" stroke="#27272A" stroke-width="2"/>
    <path d="M410 152 Q420 195, 432 245" fill="none" stroke="#27272A" stroke-width="2"/>

    <!-- Natural Fabric Folds -->
    <path d="M185 265 Q230 330, 220 460" fill="none" stroke="#09090B" stroke-width="2.5" opacity="0.7"/>
    <path d="M190 270 Q235 330, 225 455" fill="none" stroke="#3F3F46" stroke-width="1" opacity="0.4"/>

    <path d="M415 265 Q370 330, 380 460" fill="none" stroke="#09090B" stroke-width="2.5" opacity="0.7"/>
    <path d="M410 270 Q365 330, 375 455" fill="none" stroke="#3F3F46" stroke-width="1" opacity="0.4"/>

    <path d="M270 290 Q300 350, 290 475" fill="none" stroke="#09090B" stroke-width="2" opacity="0.5"/>
    <path d="M330 290 Q300 350, 310 475" fill="none" stroke="#09090B" stroke-width="2" opacity="0.5"/>

    <!-- Sleeve Cuffs & Hem Double Needle Stitching -->
    <path d="M96 270 L130 290" stroke="#3F3F46" stroke-width="1.5" stroke-dasharray="2,2"/>
    <path d="M504 270 L470 290" stroke="#3F3F46" stroke-width="1.5" stroke-dasharray="2,2"/>
    <line x1="185" y1="475" x2="415" y2="475" stroke="#3F3F46" stroke-width="1.5" stroke-dasharray="3,3"/>
  `;

  const svg = createStudioSvg({ content: tShirtRefined, label: 'FITFUSION • OVERSIZED T-SHIRT' });
  await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(path.join(testDir, 'test_tshirt_v2.webp'));
  console.log('T-Shirt v2 created');
}

run();
