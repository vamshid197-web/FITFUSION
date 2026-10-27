/**
 * FitFusion Studio SVG Garment Renderer
 * Renders 600x600 e-commerce studio apparel flats with soft lighting,
 * realistic garment silhouettes, seams, stitching, and textures.
 */

export function wrapInStudio({ content, label = 'FITFUSION STUDIO', bgTone = 'neutral' }) {
  const bgGradients = {
    neutral: { stop1: '#F8FAFC', stop2: '#F1F5F9', stop3: '#E2E8F0', shadow: '#0F172A' },
    warm:    { stop1: '#FAF8F5', stop2: '#F5F0EA', stop3: '#E7DFD5', shadow: '#292524' },
    cool:    { stop1: '#F8FAFC', stop2: '#EFF6FF', stop3: '#DBEAFE', shadow: '#1E293B' },
  };
  const g = bgGradients[bgTone] || bgGradients.neutral;

  return `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${g.stop1}" />
      <stop offset="70%" stop-color="${g.stop2}" />
      <stop offset="100%" stop-color="${g.stop3}" />
    </linearGradient>
    <radialGradient id="spotlight" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
      <stop offset="60%" stop-color="#FFFFFF" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="floorShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${g.shadow}" stop-opacity="0.25" />
      <stop offset="50%" stop-color="${g.shadow}" stop-opacity="0.08" />
      <stop offset="100%" stop-color="${g.shadow}" stop-opacity="0" />
    </radialGradient>
    
    <filter id="garmentShadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="${g.shadow}" flood-opacity="0.16" />
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="${g.shadow}" flood-opacity="0.10" />
    </filter>

    <linearGradient id="sheen" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.25" />
      <stop offset="45%" stop-color="#FFFFFF" stop-opacity="0.05" />
      <stop offset="75%" stop-color="#000000" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.25" />
    </linearGradient>
    <linearGradient id="leatherSheen" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.4" />
      <stop offset="30%" stop-color="#FFFFFF" stop-opacity="0.08" />
      <stop offset="70%" stop-color="#000000" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.45" />
    </linearGradient>
  </defs>

  <rect width="600" height="600" fill="url(#bgGrad)" />
  <rect width="600" height="600" fill="url(#spotlight)" />
  <ellipse cx="300" cy="515" rx="195" ry="24" fill="url(#floorShadow)" />

  <g filter="url(#garmentShadow)">
    ${content}
  </g>

  <text x="300" y="565" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="700" letter-spacing="2.8" fill="#64748B" opacity="0.75">
    ${label.toUpperCase()}
  </text>
</svg>`;
}

// 1. T-SHIRT / TOPS
export function renderTShirtSvg({ color = '#18181B', accentColor = '#27272A', subcategory = 'T-Shirt', view = 'front' }) {
  const isVNeck = subcategory.toLowerCase().includes('v-neck');
  const isOversized = subcategory.toLowerCase().includes('oversized');
  const isLongline = subcategory.toLowerCase().includes('longline');
  const isCrop = subcategory.toLowerCase().includes('crop');
  const isGraphic = subcategory.toLowerCase().includes('graphic');
  const isHenley = subcategory.toLowerCase().includes('henley');

  const bottomY = isCrop ? 360 : (isLongline ? 510 : 475);
  const bottomCurve = isLongline ? 'C250 535, 350 535, 425 510' : 'L425 475';
  const sleeveDrop = isOversized ? 295 : 265;
  const hemL = isLongline ? 510 : bottomY;

  return `
    <!-- Neck Hole Inner -->
    <path d="M240 138 C265 125, 335 125, 360 138 C345 158, 255 158, 240 138 Z" fill="#09090B"/>
    <text x="300" y="149" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#71717A" letter-spacing="1">FITFUSION</text>

    <!-- Main Silhouette -->
    <path d="
      M240 138
      C215 145, 175 162, 130 185
      L85 ${sleeveDrop - 15}
      C80 ${sleeveDrop}, 105 ${sleeveDrop + 15}, 125 ${sleeveDrop + 5}
      L160 238
      L175 250
      L175 ${hemL - 10}
      C175 ${hemL}, 190 ${hemL}, 205 ${hemL}
      ${isLongline ? 'C260 535, 340 535, 395 510' : `L395 ${bottomY}`}
      C410 ${hemL}, 425 ${hemL - 10}, 425 ${hemL - 10}
      L425 250
      L440 238
      L475 ${sleeveDrop + 5}
      C495 ${sleeveDrop + 15}, 520 ${sleeveDrop}, 515 ${sleeveDrop - 15}
      L470 185
      C425 162, 385 145, 360 138
      ${isVNeck ? 'L300 215 L240 138' : 'C340 165, 260 165, 240 138'} Z
    " fill="${color}" stroke="#09090B" stroke-width="2" stroke-linejoin="round"/>
    
    <path d="M240 138 C215 145, 175 162, 130 185 L85 ${sleeveDrop - 15} C80 ${sleeveDrop}, 105 ${sleeveDrop + 15}, 125 ${sleeveDrop + 5} L160 238 L175 250 L175 ${hemL - 10} C175 ${hemL}, 190 ${hemL}, 205 ${hemL} ${isLongline ? 'C260 535, 340 535, 395 510' : `L395 ${bottomY}`} C410 ${hemL}, 425 ${hemL - 10}, 425 ${hemL - 10} L425 250 L440 238 L475 ${sleeveDrop + 5} C495 ${sleeveDrop + 15}, 520 ${sleeveDrop}, 515 ${sleeveDrop - 15} L470 185 C425 162, 385 145, 360 138 ${isVNeck ? 'L300 215 L240 138' : 'C340 165, 260 165, 240 138'} Z" fill="url(#sheen)"/>

    <!-- Neck Collar Band -->
    ${isVNeck ? `
      <path d="M236 138 L300 218 L364 138 L354 136 L300 205 L246 136 Z" fill="${accentColor}" stroke="#3F3F46" stroke-width="1.2"/>
    ` : `
      <path d="M240 138 C258 170, 342 170, 360 138 C345 158, 255 158, 240 138 Z" fill="${accentColor}" stroke="#3F3F46" stroke-width="1.2"/>
      <path d="M238 141 C258 174, 342 174, 362 141" fill="none" stroke="#71717A" stroke-width="1" stroke-dasharray="2,2"/>
    `}

    <!-- Henley Placket Buttons -->
    ${isHenley ? `
      <rect x="290" y="165" width="20" height="95" rx="3" fill="${accentColor}" stroke="#3F3F46" stroke-width="1.5"/>
      <circle cx="300" cy="180" r="3.5" fill="#E4E4E7" stroke="#71717A" stroke-width="1"/>
      <circle cx="300" cy="210" r="3.5" fill="#E4E4E7" stroke="#71717A" stroke-width="1"/>
      <circle cx="300" cy="240" r="3.5" fill="#E4E4E7" stroke="#71717A" stroke-width="1"/>
    ` : ''}

    <!-- Graphic T-Shirt Print Art -->
    ${isGraphic ? `
      <g transform="translate(250, 240)">
        <rect x="0" y="0" width="100" height="100" rx="8" fill="#09090B" opacity="0.4"/>
        <circle cx="50" cy="45" r="26" fill="#F43F5E" opacity="0.9"/>
        <path d="M30 65 L50 35 L70 65 Z" fill="#FBBF24"/>
        <text x="50" y="86" text-anchor="middle" font-family="sans-serif" font-size="8.5" font-weight="900" fill="#FFFFFF" letter-spacing="2">FITFUSION</text>
      </g>
    ` : ''}

    <!-- Fabric Drape Folds -->
    <path d="M190 270 Q235 340, 225 ${bottomY - 20}" fill="none" stroke="#09090B" stroke-width="2.5" opacity="0.6"/>
    <path d="M410 270 Q365 340, 375 ${bottomY - 20}" fill="none" stroke="#09090B" stroke-width="2.5" opacity="0.6"/>
    <path d="M280 295 Q305 365, 295 ${bottomY - 10}" fill="none" stroke="#09090B" stroke-width="1.8" opacity="0.4"/>
    <path d="M320 295 Q295 365, 305 ${bottomY - 10}" fill="none" stroke="#09090B" stroke-width="1.8" opacity="0.4"/>

    <!-- Hem Double Stitch -->
    <line x1="185" y1="${bottomY - 8}" x2="415" y2="${bottomY - 8}" stroke="#52525B" stroke-width="1.5" stroke-dasharray="3,3"/>
  `;
}

// 2. POLO T-SHIRT
export function renderPoloSvg({ color = '#1E3A8A', accentColor = '#FFFFFF', view = 'front' }) {
  return `
    <!-- Collar and Placket Base -->
    <path d="M245 138 C265 125, 335 125, 355 138 C345 155, 255 155, 245 138 Z" fill="#09090B"/>
    <path d="M245 138 C220 145, 175 162, 130 185 L90 260 C85 272, 110 285, 125 275 L160 235 L175 250 L175 470 C175 480, 190 485, 205 485 L395 485 C410 485, 425 480, 425 470 L425 250 L440 235 L475 275 C490 285, 515 272, 510 260 L470 185 C425 162, 380 145, 355 138 Z" fill="${color}" stroke="#09090B" stroke-width="2"/>
    <path d="M245 138 C220 145, 175 162, 130 185 L90 260 C85 272, 110 285, 125 275 L160 235 L175 250 L175 470 C175 480, 190 485, 205 485 L395 485 C410 485, 425 480, 425 470 L425 250 L440 235 L475 275 C490 285, 515 272, 510 260 L470 185 C425 162, 380 145, 355 138 Z" fill="url(#sheen)"/>

    <!-- Piqué Ribbed Knit Collar -->
    <path d="M235 135 L285 205 L300 165 L270 135 Z" fill="${accentColor}" stroke="#334155" stroke-width="1.5"/>
    <path d="M365 135 L315 205 L300 165 L330 135 Z" fill="${accentColor}" stroke="#334155" stroke-width="1.5"/>
    <path d="M245 135 C270 152, 330 152, 355 135" fill="none" stroke="#334155" stroke-width="2"/>

    <!-- 2-Button Front Placket -->
    <rect x="290" y="165" width="20" height="75" fill="${accentColor}" stroke="#334155" stroke-width="1.2"/>
    <circle cx="300" cy="180" r="3.5" fill="#F8FAFC" stroke="#64748B" stroke-width="1"/>
    <circle cx="300" cy="210" r="3.5" fill="#F8FAFC" stroke="#64748B" stroke-width="1"/>

    <!-- Chest Crest / Logo -->
    <circle cx="230" cy="225" r="8" fill="#F59E0B" opacity="0.9"/>
    <path d="M226 225 L230 220 L234 225 Z" fill="#FFFFFF"/>

    <!-- Ribbed Sleeve Cuffs with Tipping -->
    <path d="M92 250 L124 270" stroke="${accentColor}" stroke-width="5"/>
    <path d="M508 250 L476 270" stroke="${accentColor}" stroke-width="5"/>

    <!-- Tennis Tail Side Vents -->
    <line x1="175" y1="455" x2="175" y2="485" stroke="#09090B" stroke-width="2"/>
    <line x1="425" y1="455" x2="425" y2="485" stroke="#09090B" stroke-width="2"/>
  `;
}

// 3. SHIRT (Formal / Casual / Denim / Oxford / Linen / Flannel)
export function renderShirtSvg({ color = '#FFFFFF', accentColor = '#1E293B', subcategory = 'Casual Shirt', pattern = 'plain' }) {
  const isDenim = subcategory.toLowerCase().includes('denim');
  const isFlannel = subcategory.toLowerCase().includes('flannel') || subcategory.toLowerCase().includes('check');
  const isHawaiian = subcategory.toLowerCase().includes('hawaiian');
  const isMandarin = subcategory.toLowerCase().includes('mandarin');

  return `
    <path d="M255 130 C275 120, 325 120, 345 130 C335 150, 265 150, 255 130 Z" fill="#09090B"/>
    <!-- Shirt Silhouette -->
    <path d="
      M255 130
      C225 140, 175 160, 130 185
      L85 270
      C80 282, 105 295, 120 285
      L155 240
      L175 250
      L175 480
      C175 490, 220 500, 300 500
      C380 500, 425 490, 425 480
      L425 250
      L445 240
      L480 285
      C495 295, 520 282, 515 270
      L470 185
      C425 160, 375 140, 345 130
      C330 155, 270 155, 255 130 Z
    " fill="${color}" stroke="#1E293B" stroke-width="2" stroke-linejoin="round"/>
    <path d="M255 130 C225 140, 175 160, 130 185 L85 270 C80 282, 105 295, 120 285 L155 240 L175 250 L175 480 C175 490, 220 500, 300 500 C380 500, 425 490, 425 480 L425 250 L445 240 L480 285 C495 295, 520 282, 515 270 L470 185 C425 160, 375 140, 345 130 C330 155, 270 155, 255 130 Z" fill="url(#sheen)"/>

    ${isFlannel ? `
      <!-- Plaid Check Lines -->
      <g stroke="#991B1B" stroke-width="2.5" opacity="0.45">
        <line x1="210" y1="180" x2="210" y2="495"/>
        <line x1="250" y1="170" x2="250" y2="495"/>
        <line x1="350" y1="170" x2="350" y2="495"/>
        <line x1="390" y1="180" x2="390" y2="495"/>
        <line x1="175" y1="230" x2="425" y2="230"/>
        <line x1="175" y1="300" x2="425" y2="300"/>
        <line x1="175" y1="370" x2="425" y2="370"/>
        <line x1="175" y1="440" x2="425" y2="440"/>
      </g>
    ` : ''}

    ${isHawaiian ? `
      <!-- Tropical Palms & Hibiscus Print -->
      <g opacity="0.6">
        <circle cx="230" cy="240" r="14" fill="#F59E0B"/>
        <path d="M220 230 Q240 215, 250 240 Q230 255, 220 230" fill="#10B981"/>
        <circle cx="360" cy="320" r="18" fill="#EC4899"/>
        <circle cx="240" cy="400" r="16" fill="#06B6D4"/>
      </g>
    ` : ''}

    <!-- Central Button Placket -->
    <rect x="290" y="150" width="20" height="345" fill="${color}" stroke="#64748B" stroke-width="1.2"/>
    ${[175, 225, 275, 325, 375, 425, 470].map(y => `
      <circle cx="300" cy="${y}" r="3.5" fill="#F8FAFC" stroke="#64748B" stroke-width="1.2"/>
      <circle cx="300" cy="${y}" r="1" fill="#475569"/>
    `).join('')}

    <!-- Left Chest Pocket -->
    <path d="M210 240 L255 240 L255 295 L232 312 L210 295 Z" fill="none" stroke="#64748B" stroke-width="1.5" stroke-dasharray="2,2"/>

    <!-- Pointed / Mandarin Collar -->
    ${isMandarin ? `
      <path d="M255 135 C280 148, 320 148, 345 135 L345 152 C320 162, 280 162, 255 152 Z" fill="${accentColor}" stroke="#334155" stroke-width="1.5"/>
    ` : `
      <path d="M245 130 L285 205 L300 165 L275 130 Z" fill="${color}" stroke="#334155" stroke-width="1.8"/>
      <path d="M355 130 L315 205 L300 165 L325 130 Z" fill="${color}" stroke="#334155" stroke-width="1.8"/>
    `}
  `;
}

// 4. HOODIE & SWEATSHIRT
export function renderHoodieSvg({ color = '#1E293B', accentColor = '#F8FAFC', subcategory = 'Hoodie' }) {
  const isZipUp = subcategory.toLowerCase().includes('zip');
  const isSweatshirt = subcategory.toLowerCase().includes('sweatshirt') || subcategory.toLowerCase().includes('sweater');

  return `
    ${!isSweatshirt ? `
      <!-- Double Hood Behind Head -->
      <path d="M215 150 C180 85, 420 85, 385 150 C350 175, 250 175, 215 150 Z" fill="#0F172A" stroke="#020617" stroke-width="2"/>
      <path d="M230 145 C205 95, 395 95, 370 145 Z" fill="#1E293B"/>
    ` : `
      <!-- Crewneck Sweatshirt Collar -->
      <path d="M245 138 C265 125, 335 125, 355 138 C345 160, 255 160, 245 138 Z" fill="#09090B"/>
    `}

    <!-- Body & Thick Sleeves -->
    <path d="
      M225 150
      C195 160, 165 178, 125 205
      L75 305
      C70 318, 95 330, 115 320
      L155 260
      L175 265
      L175 465
      C175 480, 190 485, 205 485
      L395 485
      C410 485, 425 480, 425 465
      L425 265
      L445 260
      L485 320
      C505 330, 530 318, 525 305
      L475 205
      C435 178, 405 160, 375 150
      C350 185, 250 185, 225 150 Z
    " fill="${color}" stroke="#0F172A" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M225 150 C195 160, 165 178, 125 205 L75 305 C70 318, 95 330, 115 320 L155 260 L175 265 L175 465 C175 480, 190 485, 205 485 L395 485 C410 485, 425 480, 425 465 L425 265 L445 260 L485 320 C505 330, 530 318, 525 305 L475 205 C435 178, 405 160, 375 150 C350 185, 250 185, 225 150 Z" fill="url(#sheen)"/>

    ${!isSweatshirt ? `
      <!-- White Braided Drawstrings with Metal Aglets -->
      <path d="M265 175 Q260 230, 270 270" stroke="${accentColor}" stroke-width="3" stroke-linecap="round" fill="none"/>
      <rect x="268" y="270" width="4" height="12" fill="#CBD5E1" rx="1"/>
      <path d="M335 175 Q340 230, 330 270" stroke="${accentColor}" stroke-width="3" stroke-linecap="round" fill="none"/>
      <rect x="328" y="270" width="4" height="12" fill="#CBD5E1" rx="1"/>

      <!-- Kangaroo Pouch Pocket -->
      <path d="M220 355 L380 355 L395 450 L205 450 Z" fill="${color}" stroke="#0F172A" stroke-width="2"/>
      <path d="M220 355 L205 450" stroke="#475569" stroke-width="1.8" stroke-dasharray="2,2"/>
      <path d="M380 355 L395 450" stroke="#475569" stroke-width="1.8" stroke-dasharray="2,2"/>
    ` : `
      <!-- Dorito V-Insert on Collar -->
      <path d="M285 165 L300 185 L315 165 Z" fill="none" stroke="#64748B" stroke-width="2"/>
    `}

    ${isZipUp ? `
      <!-- Heavy Duty Metal Zipper Track -->
      <line x1="300" y1="170" x2="300" y2="485" stroke="#94A3B8" stroke-width="3.5" stroke-dasharray="4,1"/>
      <rect x="296" y="210" width="8" height="14" rx="2" fill="#CBD5E1" stroke="#475569" stroke-width="1"/>
    ` : ''}

    <!-- Thick Ribbed Waistband and Cuffs -->
    <rect x="175" y="455" width="250" height="30" rx="3" fill="${color}" stroke="#0F172A" stroke-width="1.5"/>
    <line x1="175" y1="465" x2="425" y2="465" stroke="#475569" stroke-width="1" stroke-dasharray="2,2"/>
  `;
}

// 5. JEANS & DENIM PANTS
export function renderJeansSvg({ color = '#2563EB', accentColor = '#CA8A04', subcategory = 'Regular Jeans' }) {
  const isRipped = subcategory.toLowerCase().includes('ripped') || subcategory.toLowerCase().includes('distressed');
  const isCargo = subcategory.toLowerCase().includes('cargo');
  const isWide = subcategory.toLowerCase().includes('wide') || subcategory.toLowerCase().includes('flared') || subcategory.toLowerCase().includes('bootcut');

  const bottomL = isWide ? 170 : 210;
  const bottomR = isWide ? 430 : 390;

  return `
    <!-- Jeans Silhouette -->
    <path d="
      M210 145
      L390 145
      C405 150, 415 165, 415 185
      L${bottomR} 505
      L335 505
      L300 280
      L265 505
      L${bottomL} 505
      L185 185
      C185 165, 195 150, 210 145 Z
    " fill="${color}" stroke="#0F172A" stroke-width="2" stroke-linejoin="round"/>
    <path d="M210 145 L390 145 C405 150, 415 165, 415 185 L${bottomR} 505 L335 505 L300 280 L265 505 L${bottomL} 505 L185 185 C185 165, 195 150, 210 145 Z" fill="url(#sheen)"/>

    <!-- Waistband & Belt Loops -->
    <path d="M205 145 L395 145 L398 175 L202 175 Z" fill="${color}" stroke="${accentColor}" stroke-width="1.8"/>
    ${[215, 260, 340, 385].map(x => `
      <rect x="${x}" y="142" width="6" height="35" rx="1.5" fill="${color}" stroke="${accentColor}" stroke-width="1.2"/>
    `).join('')}

    <!-- Brass Riveted Coin Pocket & Scoop Pockets -->
    <path d="M202 175 Q245 180, 260 215" fill="none" stroke="${accentColor}" stroke-width="2"/>
    <path d="M398 175 Q355 180, 340 215" fill="none" stroke="${accentColor}" stroke-width="2"/>
    <rect x="345" y="180" width="30" height="20" fill="none" stroke="${accentColor}" stroke-width="1.5"/>
    <circle cx="377" cy="180" r="3" fill="#D97706" stroke="#78350F" stroke-width="1"/>
    <circle cx="205" cy="177" r="3" fill="#D97706" stroke="#78350F" stroke-width="1"/>
    <circle cx="395" cy="177" r="3" fill="#D97706" stroke="#78350F" stroke-width="1"/>

    <!-- Center Fly & Brass Button -->
    <circle cx="300" cy="160" r="6" fill="#F59E0B" stroke="#78350F" stroke-width="1.5"/>
    <path d="M300 175 L300 235 Q300 260, 280 265" fill="none" stroke="${accentColor}" stroke-width="2"/>

    <!-- Whiskering Highlights on Thighs -->
    <g stroke="#93C5FD" stroke-width="2" opacity="0.45" stroke-linecap="round">
      <line x1="225" y1="230" x2="280" y2="245"/>
      <line x1="220" y1="250" x2="275" y2="260"/>
      <line x1="375" y1="230" x2="320" y2="245"/>
      <line x1="380" y1="250" x2="325" y2="260"/>
    </g>

    ${isRipped ? `
      <!-- Horizontal Distressed Knee Slashes -->
      <g stroke="#FFFFFF" stroke-width="2" opacity="0.9">
        <line x1="220" y1="360" x2="265" y2="360"/>
        <line x1="222" y1="365" x2="263" y2="365" stroke="#1E293B" stroke-width="3"/>
        <line x1="335" y1="380" x2="380" y2="380"/>
        <line x1="337" y1="385" x2="378" y2="385" stroke="#1E293B" stroke-width="3"/>
      </g>
    ` : ''}

    ${isCargo ? `
      <!-- Side Bellows Cargo Pockets -->
      <rect x="185" y="280" width="30" height="55" rx="3" fill="${color}" stroke="${accentColor}" stroke-width="1.8"/>
      <rect x="385" y="280" width="30" height="55" rx="3" fill="${color}" stroke="${accentColor}" stroke-width="1.8"/>
    ` : ''}

    <!-- Double Stitched Hem -->
    <line x1="${bottomL}" y1="495" x2="265" y2="495" stroke="${accentColor}" stroke-width="1.5" stroke-dasharray="2,2"/>
    <line x1="335" y1="495" x2="${bottomR}" y2="495" stroke="${accentColor}" stroke-width="1.5" stroke-dasharray="2,2"/>
  `;
}

// 6. TROUSERS, PANTS, CHINOS, FORMAL PANTS
export function renderPantsSvg({ color = '#334155', accentColor = '#64748B', subcategory = 'Formal Trousers' }) {
  const isJogger = subcategory.toLowerCase().includes('jogger') || subcategory.toLowerCase().includes('track') || subcategory.toLowerCase().includes('sweatpant');
  const isPalazzo = subcategory.toLowerCase().includes('palazzo') || subcategory.toLowerCase().includes('wide');
  const isDhoti = subcategory.toLowerCase().includes('dhoti');

  const bottomL = isPalazzo ? 160 : (isJogger ? 230 : 210);
  const bottomR = isPalazzo ? 440 : (isJogger ? 370 : 390);

  return `
    <!-- Pants Silhouette -->
    <path d="
      M210 145
      L390 145
      L410 185
      L${bottomR} 505
      L330 505
      L300 270
      L270 505
      L${bottomL} 505
      L190 185 Z
    " fill="${color}" stroke="#0F172A" stroke-width="2" stroke-linejoin="round"/>
    <path d="M210 145 L390 145 L410 185 L${bottomR} 505 L330 505 L300 270 L270 505 L${bottomL} 505 L190 185 Z" fill="url(#sheen)"/>

    ${isDhoti ? `
      <!-- Traditional Dhoti Draped Pleats -->
      <g stroke="#CA8A04" stroke-width="2" fill="none">
        <path d="M250 170 Q300 350, 300 480"/>
        <path d="M350 170 Q300 350, 300 480"/>
        <path d="M230 200 Q280 380, 270 500"/>
        <path d="M370 200 Q320 380, 330 500"/>
      </g>
    ` : `
      <!-- Pressed Center Leg Creases -->
      <line x1="245" y1="180" x2="${bottomL + 30}" y2="500" stroke="#000000" stroke-width="1.8" opacity="0.3"/>
      <line x1="355" y1="180" x2="${bottomR - 30}" y2="500" stroke="#000000" stroke-width="1.8" opacity="0.3"/>
    `}

    <!-- Waistband & Extended Tab -->
    <rect x="205" y="145" width="190" height="28" rx="2" fill="${color}" stroke="#0F172A" stroke-width="1.5"/>
    <circle cx="300" cy="158" r="4" fill="#E2E8F0" stroke="#334155" stroke-width="1"/>

    <!-- Slanted Side Pockets -->
    <line x1="205" y1="175" x2="235" y2="235" stroke="#1E293B" stroke-width="2"/>
    <line x1="395" y1="175" x2="365" y2="235" stroke="#1E293B" stroke-width="2"/>

    ${isJogger ? `
      <!-- Elastic Gathered Cuffs -->
      <rect x="${bottomL}" y="490" width="40" height="15" rx="3" fill="#1E293B"/>
      <rect x="${bottomR - 40}" y="490" width="40" height="15" rx="3" fill="#1E293B"/>
    ` : ''}
  `;
}

// 7. SHORTS
export function renderShortsSvg({ color = '#1E3A8A', accentColor = '#F59E0B', subcategory = 'Casual Shorts' }) {
  const isDenim = subcategory.toLowerCase().includes('denim');

  return `
    <path d="
      M220 170
      L380 170
      L405 210
      L390 390
      L325 390
      L300 270
      L275 390
      L210 390
      L195 210 Z
    " fill="${color}" stroke="#0F172A" stroke-width="2" stroke-linejoin="round"/>
    <path d="M220 170 L380 170 L405 210 L390 390 L325 390 L300 270 L275 390 L210 390 L195 210 Z" fill="url(#sheen)"/>

    <!-- Waistband & Drawstring -->
    <rect x="215" y="170" width="170" height="28" rx="3" fill="${color}" stroke="#0F172A" stroke-width="1.5"/>
    <circle cx="300" cy="184" r="4" fill="#F8FAFC" stroke="#64748B" stroke-width="1"/>
    <path d="M295 188 Q290 220, 298 235" stroke="#F8FAFC" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M305 188 Q310 220, 302 235" stroke="#F8FAFC" stroke-width="3" stroke-linecap="round" fill="none"/>

    <!-- Side Slanted Pockets -->
    <line x1="215" y1="198" x2="245" y2="255" stroke="#0F172A" stroke-width="2"/>
    <line x1="385" y1="198" x2="355" y2="255" stroke="#0F172A" stroke-width="2"/>

    <!-- Hem Double Stitches -->
    <line x1="210" y1="380" x2="275" y2="380" stroke="${accentColor}" stroke-width="1.5" stroke-dasharray="2,2"/>
    <line x1="325" y1="380" x2="390" y2="380" stroke="${accentColor}" stroke-width="1.5" stroke-dasharray="2,2"/>
  `;
}

// 8. SKIRT
export function renderSkirtSvg({ color = '#BE123C', accentColor = '#FDF2F8', subcategory = 'Pleated Skirt' }) {
  const isPencil = subcategory.toLowerCase().includes('pencil');
  const isMaxi = subcategory.toLowerCase().includes('maxi');
  const isTennis = subcategory.toLowerCase().includes('tennis') || subcategory.toLowerCase().includes('pleated');

  const bottomY = isMaxi ? 515 : (isPencil ? 460 : 395);
  const flareL = isPencil ? 225 : (isTennis ? 170 : 160);
  const flareR = isPencil ? 375 : (isTennis ? 430 : 440);

  return `
    <!-- Skirt Base -->
    <path d="
      M240 185
      L360 185
      C370 210, ${flareR} ${bottomY - 40}, ${flareR} ${bottomY}
      C340 ${bottomY + 10}, 260 ${bottomY + 10}, ${flareL} ${bottomY}
      C${flareL} ${bottomY - 40}, 230 210, 240 185 Z
    " fill="${color}" stroke="#0F172A" stroke-width="2" stroke-linejoin="round"/>
    <path d="M240 185 L360 185 C370 210, ${flareR} ${bottomY - 40}, ${flareR} ${bottomY} C340 ${bottomY + 10}, 260 ${bottomY + 10}, ${flareL} ${bottomY} C${flareL} ${bottomY - 40}, 230 210, 240 185 Z" fill="url(#sheen)"/>

    <!-- High Waistband -->
    <path d="M238 185 L362 185 L360 210 L240 210 Z" fill="${color}" stroke="#0F172A" stroke-width="1.8"/>

    ${isTennis ? `
      <!-- Accordion / Knife Pleats -->
      <g stroke="#000000" stroke-width="1.5" opacity="0.35">
        ${[190, 215, 240, 265, 290, 310, 335, 360, 385, 410].map(x => `
          <line x1="${240 + (x - 170) * 0.4}" y1="210" x2="${x}" y2="${bottomY}"/>
        `).join('')}
      </g>
    ` : ''}

    ${isPencil ? `
      <!-- Center Vent Slit -->
      <line x1="300" y1="${bottomY - 60}" x2="300" y2="${bottomY}" stroke="#0F172A" stroke-width="2"/>
    ` : ''}
  `;
}

// 9. DRESSES
export function renderDressSvg({ color = '#BE123C', accentColor = '#FDF2F8', subcategory = 'Cocktail Dress' }) {
  const isMaxi = subcategory.toLowerCase().includes('maxi') || subcategory.toLowerCase().includes('evening') || subcategory.toLowerCase().includes('wedding');
  const isMini = subcategory.toLowerCase().includes('mini') || subcategory.toLowerCase().includes('bodycon');
  const isOffShoulder = subcategory.toLowerCase().includes('off-shoulder') || subcategory.toLowerCase().includes('strapless');

  const hemY = isMaxi ? 525 : (isMini ? 385 : 460);
  const flareL = isMaxi ? 150 : (isMini ? 220 : 180);
  const flareR = isMaxi ? 450 : (isMini ? 380 : 420);

  return `
    <!-- Dress Silhouette -->
    <path d="
      ${isOffShoulder ? `
        M220 180
        L380 180
        C360 220, 330 255, 330 270
      ` : `
        M250 135
        C270 165, 330 165, 350 135
        L365 175
        C350 220, 330 255, 330 270
      `}
      C340 310, ${flareR} ${hemY - 40}, ${flareR} ${hemY}
      C350 ${hemY + 12}, 250 ${hemY + 12}, ${flareL} ${hemY}
      C${flareL} ${hemY - 40}, 260 310, 270 270
      C270 255, 250 220, 235 175 Z
    " fill="${color}" stroke="#0F172A" stroke-width="2" stroke-linejoin="round"/>
    <path d="${isOffShoulder ? `M220 180 L380 180 C360 220, 330 255, 330 270` : `M250 135 C270 165, 330 165, 350 135 L365 175 C350 220, 330 255, 330 270`} C340 310, ${flareR} ${hemY - 40}, ${flareR} ${hemY} C350 ${hemY + 12}, 250 ${hemY + 12}, ${flareL} ${hemY} C${flareL} ${hemY - 40}, 260 310, 270 270 C270 255, 250 220, 235 175 Z" fill="url(#sheen)"/>

    <!-- Belt / Cinched Waistband -->
    <path d="M268 265 L332 265 L335 282 L265 282 Z" fill="${accentColor}" stroke="#0F172A" stroke-width="1.5"/>
    <rect x="294" y="267" width="12" height="12" rx="2" fill="#FBBF24" stroke="#78350F" stroke-width="1"/>

    <!-- Draped Skirt Waves -->
    <path d="M285 282 Q270 380, ${flareL + 50} ${hemY}" fill="none" stroke="#000000" stroke-width="2" opacity="0.3"/>
    <path d="M315 282 Q330 380, ${flareR - 50} ${hemY}" fill="none" stroke="#000000" stroke-width="2" opacity="0.3"/>
  `;
}

// 10. LEATHER JACKET & BIKER JACKET
export function renderLeatherJacketSvg({ color = '#18181B', accentColor = '#CBD5E1', subcategory = 'Leather Jacket' }) {
  return `
    <!-- Collar & Notch Lapels -->
    <path d="M245 135 C265 125, 335 125, 355 135 Z" fill="#09090B"/>
    <!-- Jacket Body -->
    <path d="
      M245 135
      L140 180
      L90 280
      L125 295
      L165 240
      L175 250
      L175 470
      L425 470
      L425 250
      L435 240
      L475 295
      L510 280
      L460 180
      L355 135
      L300 210 Z
    " fill="${color}" stroke="#09090B" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M245 135 L140 180 L90 280 L125 295 L165 240 L175 250 L175 470 L425 470 L425 250 L435 240 L475 295 L510 280 L460 180 L355 135 L300 210 Z" fill="url(#leatherSheen)"/>

    <!-- Wide Asymmetrical Biker Lapels -->
    <path d="M245 135 L200 230 L275 220 L300 290 L320 200 Z" fill="${color}" stroke="#3F3F46" stroke-width="2"/>
    <circle cx="215" cy="225" r="4" fill="${accentColor}" stroke="#475569" stroke-width="1"/>
    <circle cx="280" cy="215" r="4" fill="${accentColor}" stroke="#475569" stroke-width="1"/>

    <!-- Asymmetrical Heavy Metal Zipper -->
    <line x1="285" y1="200" x2="330" y2="470" stroke="${accentColor}" stroke-width="3" stroke-dasharray="3,1"/>
    <circle cx="295" cy="270" r="4" fill="${accentColor}"/>

    <!-- Zippered Waist Pockets -->
    <line x1="210" y1="360" x2="260" y2="380" stroke="${accentColor}" stroke-width="2.5"/>
    <line x1="390" y1="360" x2="340" y2="380" stroke="${accentColor}" stroke-width="2.5"/>

    <!-- Buckled Waist Belt -->
    <rect x="175" y="450" width="250" height="22" fill="#09090B" stroke="#3F3F46" stroke-width="1.5"/>
    <rect x="290" y="446" width="20" height="30" rx="2" fill="none" stroke="${accentColor}" stroke-width="3"/>
    <line x1="300" y1="446" x2="300" y2="476" stroke="${accentColor}" stroke-width="2"/>
  `;
}

// 11. JACKET / BLAZER / SUIT
export function renderBlazerSuitSvg({ color = '#1E293B', accentColor = '#FFFFFF', subcategory = 'Formal Blazer' }) {
  const isTuxedo = subcategory.toLowerCase().includes('tuxedo');

  return `
    <!-- Crisp Shirt & Tie Behind -->
    <path d="M260 135 L340 135 L300 270 Z" fill="${accentColor}" stroke="#94A3B8" stroke-width="1"/>
    <!-- Tie / Bowtie -->
    ${isTuxedo ? `
      <!-- Black Silk Bowtie -->
      <path d="M285 160 L315 160 L308 172 L315 184 L285 184 L292 172 Z" fill="#09090B"/>
      <circle cx="300" cy="172" r="3.5" fill="#18181B"/>
    ` : `
      <!-- Red / Burgundy Tie -->
      <path d="M294 158 L306 158 L310 260 L300 280 L290 260 Z" fill="#991B1B" stroke="#7F1D1D" stroke-width="1"/>
    `}

    <!-- Blazer Body Silhouette -->
    <path d="
      M250 135
      L140 175
      L90 275
      L125 290
      L165 240
      L175 250
      L175 480
      C175 490, 220 495, 300 495
      C380 495, 425 490, 425 480
      L425 250
      L435 240
      L475 290
      L510 275
      L460 175
      L350 135
      L315 320
      L285 320 Z
    " fill="${color}" stroke="#0F172A" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M250 135 L140 175 L90 275 L125 290 L165 240 L175 250 L175 480 C175 490, 220 495, 300 495 C380 495, 425 490, 425 480 L425 250 L435 240 L475 290 L510 275 L460 175 L350 135 L315 320 L285 320 Z" fill="url(#sheen)"/>

    <!-- Lapels -->
    <path d="M250 135 L215 260 L280 250 L300 330 L270 210 Z" fill="${isTuxedo ? '#09090B' : color}" stroke="#475569" stroke-width="1.8"/>
    <path d="M350 135 L385 260 L320 250 L300 330 L330 210 Z" fill="${isTuxedo ? '#09090B' : color}" stroke="#475569" stroke-width="1.8"/>

    <!-- Chest Pocket with Silk Square -->
    <rect x="210" y="240" width="40" height="12" fill="${color}" stroke="#64748B" stroke-width="1.2"/>
    <polygon points="220,240 230,228 240,240" fill="#FFFFFF"/>

    <!-- Lower Flap Pockets -->
    <rect x="195" y="380" width="60" height="22" rx="2" fill="${color}" stroke="#475569" stroke-width="1.5"/>
    <rect x="345" y="380" width="60" height="22" rx="2" fill="${color}" stroke="#475569" stroke-width="1.5"/>

    <!-- Buttons -->
    <circle cx="300" cy="350" r="5" fill="#0F172A" stroke="#94A3B8" stroke-width="1.2"/>
    <circle cx="300" cy="385" r="5" fill="#0F172A" stroke="#94A3B8" stroke-width="1.2"/>
  `;
}

// 12. TRENCH COAT & OVERCOAT
export function renderCoatSvg({ color = '#D97706', accentColor = '#78350F', subcategory = 'Trench Coat' }) {
  return `
    <path d="M250 130 C270 120, 330 120, 350 130 Z" fill="#09090B"/>
    <path d="
      M250 130
      L140 170
      L80 290
      L120 305
      L165 240
      L170 250
      L160 520
      C220 530, 380 530, 440 520
      L430 250
      L435 240
      L480 305
      L520 290
      L460 170
      L350 130
      L300 240 Z
    " fill="${color}" stroke="#451A03" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M250 130 L140 170 L80 290 L120 305 L165 240 L170 250 L160 520 C220 530, 380 530, 440 520 L430 250 L435 240 L480 305 L520 290 L460 170 L350 130 L300 240 Z" fill="url(#sheen)"/>

    <!-- Shoulder Epaulets -->
    <rect x="145" y="165" width="45" height="12" rx="2" fill="${color}" stroke="#78350F" stroke-width="1.2"/>
    <circle cx="180" cy="171" r="3" fill="#78350F"/>
    <rect x="410" y="165" width="45" height="12" rx="2" fill="${color}" stroke="#78350F" stroke-width="1.2"/>
    <circle cx="420" cy="171" r="3" fill="#78350F"/>

    <!-- Wide Storm Lapels -->
    <path d="M250 130 L200 230 L275 220 L300 310 Z" fill="${color}" stroke="#78350F" stroke-width="1.8"/>
    <path d="M350 130 L400 230 L325 220 L300 310 Z" fill="${color}" stroke="#78350F" stroke-width="1.8"/>

    <!-- Double Breasted Buttons -->
    ${[250, 300, 350].map(y => `
      <circle cx="270" cy="${y}" r="5.5" fill="#78350F" stroke="#451A03" stroke-width="1.5"/>
      <circle cx="330" cy="${y}" r="5.5" fill="#78350F" stroke="#451A03" stroke-width="1.5"/>
    `).join('')}

    <!-- Belt with Buckle -->
    <rect x="168" y="375" width="264" height="26" fill="${color}" stroke="#78350F" stroke-width="1.8"/>
    <rect x="285" y="370" width="30" height="36" rx="4" fill="none" stroke="#B45309" stroke-width="3.5"/>
    <line x1="300" y1="370" x2="300" y2="406" stroke="#B45309" stroke-width="2.5"/>
  `;
}

// 13. INDIAN & ETHNIC (Lehenga, Saree, Kurta, Sherwani, Anarkali)
export function renderEthnicSvg({ color = '#BE123C', accentColor = '#FBBF24', subcategory = 'Lehenga' }) {
  const isSaree = subcategory.toLowerCase().includes('saree');
  const isLehenga = subcategory.toLowerCase().includes('lehenga');
  const isKurta = subcategory.toLowerCase().includes('kurta') || subcategory.toLowerCase().includes('sherwani') || subcategory.toLowerCase().includes('achkan');

  if (isLehenga) {
    return `
      <!-- Embroidered Choli Blouse -->
      <path d="M250 140 C270 170, 330 170, 350 140 L370 185 L350 250 L250 250 L230 185 Z" fill="${color}" stroke="#78350F" stroke-width="2"/>
      <!-- Gold Zari Neck Embroidery -->
      <path d="M255 145 C275 180, 325 180, 345 145" fill="none" stroke="${accentColor}" stroke-width="4"/>

      <!-- Grand Flared Lehenga Skirt with Kalis -->
      <path d="
        M240 280
        L360 280
        C390 320, 480 460, 485 520
        C370 535, 230 535, 115 520
        C120 460, 210 320, 240 280 Z
      " fill="${color}" stroke="#78350F" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M240 280 L360 280 C390 320, 480 460, 485 520 C370 535, 230 535, 115 520 C120 460, 210 320, 240 280 Z" fill="url(#sheen)"/>

      <!-- Ornate Zari Border at Hem -->
      <path d="M118 495 C230 510, 370 510, 482 495 L485 520 C370 535, 230 535, 115 520 Z" fill="${accentColor}" stroke="#78350F" stroke-width="1.5"/>

      <!-- Kalis (Flared Vertical Seamlines) with Gold Zari Motif -->
      <g stroke="${accentColor}" stroke-width="1.8" opacity="0.75" fill="none">
        <path d="M260 280 Q220 400, 190 495"/>
        <path d="M280 280 Q260 400, 255 495"/>
        <path d="M300 280 Q300 400, 300 495"/>
        <path d="M320 280 Q340 400, 345 495"/>
        <path d="M340 280 Q380 400, 410 495"/>
      </g>

      <!-- Flowing Sheer Dupatta Draped Diagonally -->
      <path d="M160 170 Q240 290, 390 520 Q420 520, 410 480 Q280 270, 200 160 Z" fill="${accentColor}" opacity="0.35"/>
      <path d="M160 170 Q240 290, 390 520" stroke="${accentColor}" stroke-width="3" fill="none"/>
    `;
  }

  if (isSaree) {
    return `
      <!-- Saree Draped Silhouette -->
      <path d="M255 140 C270 165, 330 165, 345 140 L360 180 L345 235 L255 235 L240 180 Z" fill="#09090B"/>
      <!-- Saree Body & Pleats -->
      <path d="
        M230 235
        L370 235
        C390 280, 430 460, 435 520
        C350 530, 250 530, 165 520
        C170 460, 210 280, 230 235 Z
      " fill="${color}" stroke="#78350F" stroke-width="2"/>
      <path d="M230 235 L370 235 C390 280, 430 460, 435 520 C350 530, 250 530, 165 520 C170 460, 210 280, 230 235 Z" fill="url(#sheen)"/>

      <!-- Diagonal Pallu Drape -->
      <path d="M180 160 Q260 250, 360 520 L400 520 Q300 240, 230 145 Z" fill="${color}" stroke="#78350F" stroke-width="2"/>
      <!-- Rich Gold Zari Pallu Border -->
      <path d="M180 160 Q260 250, 360 520" stroke="${accentColor}" stroke-width="6" fill="none"/>
      <path d="M168 505 C250 515, 350 515, 432 505" stroke="${accentColor}" stroke-width="6" fill="none"/>
    `;
  }

  // Kurta / Sherwani
  return `
    <!-- Kurta Stand Collar (Bandhgala) -->
    <path d="M255 130 C275 142, 325 142, 345 130 L345 146 C325 156, 275 156, 255 146 Z" fill="${accentColor}" stroke="#78350F" stroke-width="1.8"/>
    <!-- Long Tunic Body -->
    <path d="
      M255 140
      L140 180
      L90 270
      L125 285
      L165 235
      L175 250
      L175 510
      L255 510
      L255 420
      L345 420
      L345 510
      L425 510
      L425 250
      L435 235
      L475 285
      L510 270
      L460 180
      L345 140 Z
    " fill="${color}" stroke="#78350F" stroke-width="2"/>
    <path d="M255 140 L140 180 L90 270 L125 285 L165 235 L175 250 L175 510 L255 510 L255 420 L345 420 L345 510 L425 510 L425 250 L435 235 L475 285 L510 270 L460 180 L345 140 Z" fill="url(#sheen)"/>

    <!-- Front Embroidered Placket & Ornate Gold Buttons -->
    <rect x="292" y="146" width="16" height="150" fill="${accentColor}" stroke="#78350F" stroke-width="1.2"/>
    ${[165, 195, 225, 255, 285].map(y => `
      <circle cx="300" cy="${y}" r="3.5" fill="#FDE047" stroke="#854D0E" stroke-width="1.2"/>
    `).join('')}

    <!-- Side Slits & Hem Zari Border -->
    <line x1="175" y1="410" x2="175" y2="510" stroke="#78350F" stroke-width="2"/>
    <line x1="425" y1="410" x2="425" y2="510" stroke="#78350F" stroke-width="2"/>
  `;
}

// 14. FOOTWEAR (Sneakers, Running Shoes, Boots, Loafers, Jutti)
export function renderFootwearSvg({ color = '#1E293B', accentColor = '#38BDF8', subcategory = 'Running Shoes' }) {
  const isBoot = subcategory.toLowerCase().includes('boot');
  const isLoafer = subcategory.toLowerCase().includes('loafer') || subcategory.toLowerCase().includes('oxford');
  const isJutti = subcategory.toLowerCase().includes('jutti') || subcategory.toLowerCase().includes('mojari');

  return `
    <!-- Lateral Sneaker / Shoe Profile -->
    <g transform="translate(40, 40)">
      <!-- Thick Sculpted Outsole / Tread -->
      <path d="
        M60 410
        C100 410, 180 405, 260 400
        C340 395, 410 390, 450 360
        C460 375, 445 425, 420 430
        C340 440, 140 440, 60 430
        C45 420, 50 410, 60 410 Z
      " fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
      
      <!-- Midsole Cushion Foam Line -->
      <path d="M60 410 C140 412, 340 405, 450 360" stroke="${accentColor}" stroke-width="4" fill="none"/>

      <!-- Shoe Upper Body -->
      <path d="
        M65 410
        C60 340, 75 280, 120 ${isBoot ? 160 : 270}
        ${isBoot ? 'L180 160 L190 270' : ''}
        C190 270, 240 260, 280 295
        L370 345
        C420 360, 455 365, 450 365
        C410 390, 340 395, 260 400
        C180 405, 100 410, 65 410 Z
      " fill="${color}" stroke="#0F172A" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M65 410 C60 340, 75 280, 120 ${isBoot ? 160 : 270} ${isBoot ? 'L180 160 L190 270' : ''} C190 270, 240 260, 280 295 L370 345 C420 360, 455 365, 450 365 C410 390, 340 395, 260 400 C180 405, 100 410, 65 410 Z" fill="url(#sheen)"/>

      ${!isLoafer && !isJutti ? `
        <!-- Athletic Laces & Eyelet Stay -->
        <g stroke="${accentColor}" stroke-width="2.5" fill="none">
          <line x1="210" y1="285" x2="250" y2="300"/>
          <line x1="230" y1="295" x2="270" y2="310"/>
          <line x1="250" y1="305" x2="290" y2="320"/>
          <line x1="270" y1="315" x2="310" y2="330"/>
        </g>
      ` : ''}

      ${isJutti ? `
        <!-- Royal Curled Jutti Toe & Gold Zari Thread -->
        <path d="M440 365 Q465 330, 460 310" stroke="#FBBF24" stroke-width="5" fill="none"/>
        <circle cx="280" cy="330" r="14" fill="#FBBF24" opacity="0.8"/>
      ` : ''}

      <!-- Dynamic Brand Swoosh / Chevron Accent -->
      <path d="M140 340 Q250 340, 340 360 Q240 380, 140 340" fill="${accentColor}" opacity="0.9"/>
    </g>
  `;
}

// 15. HEADWEAR (Baseball Cap, Bucket Hat, Beanie, Fedora)
export function renderHeadwearSvg({ color = '#1E293B', accentColor = '#FFFFFF', subcategory = 'Baseball Cap' }) {
  const isBucket = subcategory.toLowerCase().includes('bucket');
  const isBeanie = subcategory.toLowerCase().includes('beanie');

  if (isBeanie) {
    return `
      <!-- Beanie Dome -->
      <path d="M210 320 C210 180, 390 180, 390 320 Z" fill="${color}" stroke="#0F172A" stroke-width="2"/>
      <path d="M210 320 C210 180, 390 180, 390 320 Z" fill="url(#sheen)"/>
      <!-- Folded Ribbed Cuff -->
      <rect x="200" y="315" width="200" height="55" rx="5" fill="${color}" stroke="#0F172A" stroke-width="2"/>
      <g stroke="#64748B" stroke-width="1.5" opacity="0.5">
        ${[220, 240, 260, 280, 300, 320, 340, 360, 380].map(x => `
          <line x1="${x}" y1="315" x2="${x}" y2="370"/>
        `).join('')}
      </g>
      <!-- Top Pom-pom -->
      <circle cx="300" cy="180" r="18" fill="${accentColor}" stroke="#0F172A" stroke-width="1.5"/>
    `;
  }

  if (isBucket) {
    return `
      <!-- Bucket Crown -->
      <path d="M245 220 L355 220 L370 310 L230 310 Z" fill="${color}" stroke="#0F172A" stroke-width="2"/>
      <path d="M245 220 L355 220 L370 310 L230 310 Z" fill="url(#sheen)"/>
      <!-- Downward Circular Brim -->
      <path d="M230 310 C210 345, 170 365, 160 375 C250 395, 350 395, 440 375 C430 365, 390 345, 370 310 Z" fill="${color}" stroke="#0F172A" stroke-width="2"/>
    `;
  }

  // Classic Baseball Cap
  return `
    <!-- 6-Panel Structured Crown -->
    <path d="M200 330 C200 210, 400 210, 400 330 Z" fill="${color}" stroke="#0F172A" stroke-width="2"/>
    <path d="M200 330 C200 210, 400 210, 400 330 Z" fill="url(#sheen)"/>
    <circle cx="300" cy="210" r="5" fill="#0F172A"/>

    <!-- Seam Lines & Eyelets -->
    <path d="M300 210 Q250 270, 215 330" stroke="#475569" stroke-width="1.5" fill="none"/>
    <path d="M300 210 Q350 270, 385 330" stroke="#475569" stroke-width="1.5" fill="none"/>
    <circle cx="260" cy="270" r="3" fill="#64748B"/>
    <circle cx="340" cy="270" r="3" fill="#64748B"/>

    <!-- Front Logo / Patch -->
    <circle cx="300" cy="285" r="14" fill="${accentColor}"/>
    <text x="300" y="290" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="900" fill="#0F172A">FF</text>

    <!-- Pre-Curved Stitched Visor Brim -->
    <path d="M195 330 C250 365, 350 365, 425 335 C420 375, 290 395, 185 345 Z" fill="${color}" stroke="#0F172A" stroke-width="2"/>
    <path d="M200 340 C250 370, 350 370, 415 345" stroke="#475569" stroke-width="1.5" stroke-dasharray="2,2" fill="none"/>
  `;
}

// 16. BAGS (Backpack, Tote, Handbag, Duffel)
export function renderBagSvg({ color = '#1E293B', accentColor = '#D97706', subcategory = 'Backpack' }) {
  const isTote = subcategory.toLowerCase().includes('tote');
  const isDuffel = subcategory.toLowerCase().includes('duffel');

  if (isTote) {
    return `
      <!-- Twin Handles -->
      <path d="M255 310 L255 180 C255 140, 285 140, 285 180 L285 310" stroke="${accentColor}" stroke-width="6" fill="none"/>
      <path d="M315 310 L315 180 C315 140, 345 140, 345 180 L345 310" stroke="${accentColor}" stroke-width="6" fill="none"/>

      <!-- Rectangular Tote Body -->
      <rect x="200" y="280" width="200" height="220" rx="10" fill="${color}" stroke="#0F172A" stroke-width="2.5"/>
      <rect x="200" y="280" width="200" height="220" rx="10" fill="url(#sheen)"/>

      <line x1="200" y1="310" x2="400" y2="310" stroke="#475569" stroke-width="1.5"/>
      <text x="300" y="380" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="900" letter-spacing="3" fill="${accentColor}">FITFUSION</text>
    `;
  }

  // Modern Backpack
  return `
    <!-- Top Grab Handle -->
    <path d="M275 180 C275 150, 325 150, 325 180" stroke="${accentColor}" stroke-width="6" fill="none"/>

    <!-- Main Curved Body -->
    <path d="M210 470 L210 240 C210 180, 390 180, 390 240 L390 470 Z" fill="${color}" stroke="#0F172A" stroke-width="2.5"/>
    <path d="M210 470 L210 240 C210 180, 390 180, 390 240 L390 470 Z" fill="url(#sheen)"/>

    <!-- Front Zipper Pocket -->
    <rect x="235" y="340" width="130" height="115" rx="8" fill="${color}" stroke="#0F172A" stroke-width="2"/>
    <line x1="235" y1="365" x2="365" y2="365" stroke="${accentColor}" stroke-width="2.5"/>

    <!-- Brand Emblem -->
    <rect x="285" y="390" width="30" height="18" rx="2" fill="${accentColor}"/>
  `;
}

// 17. ACCESSORIES (Belt, Wallet, Watch, Sunglasses)
export function renderAccessorySvg({ color = '#18181B', accentColor = '#F59E0B', subcategory = 'Sunglasses' }) {
  const isWatch = subcategory.toLowerCase().includes('watch');
  const isBelt = subcategory.toLowerCase().includes('belt');

  if (isWatch) {
    return `
      <!-- Leather Straps -->
      <rect x="280" y="140" width="40" height="320" rx="4" fill="${color}" stroke="#09090B" stroke-width="2"/>
      <!-- Stainless Steel Case -->
      <circle cx="300" cy="300" r="65" fill="#E2E8F0" stroke="#475569" stroke-width="4"/>
      <!-- Dial Face -->
      <circle cx="300" cy="300" r="54" fill="#0F172A"/>
      <!-- Hands -->
      <line x1="300" y1="300" x2="300" y2="265" stroke="${accentColor}" stroke-width="3" stroke-linecap="round"/>
      <line x1="300" y1="300" x2="325" y2="315" stroke="${accentColor}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="300" cy="300" r="4" fill="${accentColor}"/>
    `;
  }

  if (isBelt) {
    return `
      <!-- Coiled Leather Strap -->
      <path d="M160 300 C160 210, 440 210, 440 300 C440 370, 200 370, 200 300" stroke="${color}" stroke-width="32" fill="none"/>
      <!-- Polished Brass Buckle -->
      <rect x="420" y="275" width="45" height="50" rx="6" fill="none" stroke="${accentColor}" stroke-width="6"/>
      <line x1="440" y1="275" x2="440" y2="325" stroke="${accentColor}" stroke-width="4"/>
    `;
  }

  // Designer Sunglasses
  return `
    <!-- Acetate Frames -->
    <path d="M170 270 Q240 260, 290 280 Q310 280, 360 260 Q430 270, 440 310 Q420 370, 350 360 Q305 320, 290 320 Q275 320, 230 360 Q160 370, 140 310 Z" fill="${color}" stroke="#0F172A" stroke-width="3"/>
    <!-- Dark UV Gradient Lenses -->
    <ellipse cx="215" cy="315" rx="45" ry="32" fill="#09090B"/>
    <ellipse cx="365" cy="315" rx="45" ry="32" fill="#09090B"/>
    <!-- Lens Reflection Highlights -->
    <path d="M190 295 L225 335" stroke="#FFFFFF" stroke-width="3" opacity="0.3" stroke-linecap="round"/>
    <path d="M340 295 L375 335" stroke="#FFFFFF" stroke-width="3" opacity="0.3" stroke-linecap="round"/>
  `;
}

// 18. CULTURAL FASHION (Kimono, Qipao, Hanbok, Kilt)
export function renderCulturalSvg({ color = '#BE123C', accentColor = '#FBBF24', subcategory = 'Kimono' }) {
  const isKilt = subcategory.toLowerCase().includes('kilt');
  const isQipao = subcategory.toLowerCase().includes('qipao') || subcategory.toLowerCase().includes('cheongsam');

  if (isKilt) {
    return `
      <!-- Tartan Kilt -->
      <path d="M225 210 L375 210 L415 450 L185 450 Z" fill="${color}" stroke="#0F172A" stroke-width="2"/>
      <path d="M225 210 L375 210 L415 450 L185 450 Z" fill="url(#sheen)"/>
      <g stroke="#F59E0B" stroke-width="2" opacity="0.5">
        <line x1="220" y1="280" x2="380" y2="280"/>
        <line x1="200" y1="360" x2="400" y2="360"/>
        <line x1="260" y1="210" x2="260" y2="450"/>
        <line x1="340" y1="210" x2="340" y2="450"/>
      </g>
      <!-- Leather Buckle Straps -->
      <rect x="365" y="240" width="35" height="12" fill="#451A03"/>
      <rect x="365" y="280" width="35" height="12" fill="#451A03"/>
    `;
  }

  if (isQipao) {
    return `
      <!-- Qipao with Mandarin Collar & Frog Buttons -->
      <path d="M260 140 C280 152, 320 152, 340 140 L355 175 C345 230, 325 260, 325 280 L355 480 L245 480 L275 280 C275 260, 255 230, 245 175 Z" fill="${color}" stroke="#78350F" stroke-width="2"/>
      <path d="M260 140 C280 152, 320 152, 340 140 L355 175 C345 230, 325 260, 325 280 L355 480 L245 480 L275 280 C275 260, 255 230, 245 175 Z" fill="url(#sheen)"/>
      <!-- Asymmetric Diagonal Pankou Frog Closure -->
      <path d="M300 150 Q335 180, 345 220" stroke="${accentColor}" stroke-width="3" fill="none"/>
      <circle cx="342" cy="190" r="4" fill="${accentColor}"/>
      <circle cx="345" cy="220" r="4" fill="${accentColor}"/>
      <!-- Thigh Slit -->
      <line x1="335" y1="420" x2="335" y2="480" stroke="#78350F" stroke-width="2"/>
    `;
  }

  // Japanese Kimono / Yukata
  return `
    <!-- T-shaped Kimono Body with Wide Hanging Sleeves -->
    <path d="
      M250 140
      L130 170
      L90 340
      L150 340
      L150 250
      L175 250
      L175 510
      L425 510
      L425 250
      L450 250
      L450 340
      L510 340
      L470 170
      L350 140 Z
    " fill="${color}" stroke="#0F172A" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M250 140 L130 170 L90 340 L150 340 L150 250 L175 250 L175 510 L425 510 L425 250 L450 250 L450 340 L510 340 L470 170 L350 140 Z" fill="url(#sheen)"/>

    <!-- Overlapping V-Collar -->
    <line x1="250" y1="140" x2="330" y2="300" stroke="${accentColor}" stroke-width="6"/>
    <line x1="350" y1="140" x2="270" y2="300" stroke="${accentColor}" stroke-width="6"/>

    <!-- Wide Obi Belt & Knot -->
    <rect x="175" y="290" width="250" height="55" fill="${accentColor}" stroke="#78350F" stroke-width="2"/>
    <rect x="275" y="285" width="50" height="65" rx="3" fill="#B91C1C" stroke="#78350F" stroke-width="2"/>
  `;
}
