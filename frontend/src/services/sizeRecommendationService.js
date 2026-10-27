/**
 * Size Recommendation Service
 * Simple rule-based size estimation based on height, weight, preferred fit, and optional chest measurement.
 * Works completely offline without external APIs.
 */

export function calculateSizeRecommendation({ height, weight, preferredFit = 'Regular', chest = null, gender = 'Men' }) {
  const h = Number(height);
  const w = Number(weight);
  const c = chest ? Number(chest) : null;

  if (!h || !w || h <= 0 || w <= 0) {
    return {
      success: false,
      error: 'Please enter valid height and weight values.'
    };
  }

  // 1. Calculate or estimate chest measurement in cm
  let estimatedChest = c;
  if (!estimatedChest) {
    // Anthropometric chest estimation based on height and weight
    // Standard baseline: chest cm ≈ (weight * 0.92) + (height * 0.16) + 10
    const genderOffset = gender?.toLowerCase() === 'women' ? 6 : 10;
    estimatedChest = Math.round((w * 0.92) + (h * 0.16) + genderOffset);
  }

  // 2. Base size bracket lookup by chest circumference (cm)
  // XS: < 88 cm
  // S: 88 - 94 cm
  // M: 95 - 102 cm
  // L: 103 - 110 cm
  // XL: 111 - 118 cm
  // 2XL: 119 - 126 cm
  // 3XL: > 126 cm
  const sizeBrackets = [
    { size: 'XS', min: 0, max: 87 },
    { size: 'S', min: 88, max: 94 },
    { size: 'M', min: 95, max: 102 },
    { size: 'L', min: 103, max: 110 },
    { size: 'XL', min: 111, max: 118 },
    { size: '2XL', min: 119, max: 126 },
    { size: '3XL', min: 127, max: 999 }
  ];

  let baseIndex = sizeBrackets.findIndex(b => estimatedChest >= b.min && estimatedChest <= b.max);
  if (baseIndex === -1) baseIndex = 2; // Default to 'M'

  // 3. Adjust for preferred fit
  // 'Slim': if near the lower end, step down or stay
  // 'Relaxed': step up one size if comfortable
  let finalIndex = baseIndex;
  if (preferredFit === 'Slim' && finalIndex > 0) {
    // If on borderline with lower size, suggest tighter
    finalIndex = Math.max(0, baseIndex - 1);
  } else if (preferredFit === 'Relaxed' && finalIndex < sizeBrackets.length - 1) {
    finalIndex = Math.min(sizeBrackets.length - 1, baseIndex + 1);
  }

  const recommendedSize = sizeBrackets[finalIndex].size;

  let fitAdvice = 'Regular fit should work best for you.';
  if (preferredFit === 'Slim') {
    fitAdvice = 'Slim fit should give you a clean, tailored profile.';
  } else if (preferredFit === 'Relaxed') {
    fitAdvice = 'Relaxed fit will give you extra comfort and room to move.';
  }

  return {
    success: true,
    recommendedSize,
    recommendedFit: preferredFit || 'Regular',
    estimatedChest,
    isChestEstimated: !c,
    fitAdvice,
    disclaimer: 'Suggested sizes are estimates. Check the product measurements before ordering.'
  };
}
