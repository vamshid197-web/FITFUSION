/**
 * FitFusion Cart Item Sanitizer & Defensive Fallback Utility
 */

export function sanitizeCartItem(rawItem) {
  if (!rawItem || typeof rawItem !== 'object') {
    return null;
  }

  const id = rawItem.id || `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const productId = String(rawItem.productId || rawItem.id || '1');
  const productName = rawItem.productName || rawItem.name || 'Custom Garment';
  const category = rawItem.category || 'Shirts';
  const productImage = rawItem.productImage || rawItem.image || rawItem.thumbnail || null;
  const silhouetteColor = rawItem.silhouetteColor || 'from-stone-800 to-neutral-900';
  const accentColor = rawItem.accentColor || '#1E3A8A';

  const basePrice = Math.max(0, Number(rawItem.basePrice || rawItem.price || 0));
  const fabricSurcharge = Math.max(0, Number(rawItem.fabricSurcharge || 0));
  const hardwareSurcharge = Math.max(0, Number(rawItem.hardwareSurcharge || 0));
  const monogramSurcharge = Math.max(0, Number(rawItem.monogramSurcharge || 0));

  // Fabric normalization
  let selectedFabric = rawItem.selectedFabric;
  if (!selectedFabric && rawItem.fabric) selectedFabric = rawItem.fabric;
  if (typeof selectedFabric === 'string') {
    selectedFabric = { name: selectedFabric, composition: 'Certified Textile', priceAdjustment: fabricSurcharge };
  } else if (!selectedFabric || typeof selectedFabric !== 'object') {
    selectedFabric = { name: 'Standard Fabric', composition: '100% Cotton', priceAdjustment: 0 };
  } else {
    selectedFabric = {
      id: selectedFabric.id || 'fab-custom',
      name: selectedFabric.name || 'Standard Fabric',
      composition: selectedFabric.composition || '100% Textile',
      priceAdjustment: Math.max(0, Number(selectedFabric.priceAdjustment ?? fabricSurcharge ?? 0))
    };
  }

  // Color normalization
  let selectedColor = rawItem.selectedColor;
  if (!selectedColor && rawItem.color) selectedColor = rawItem.color;
  if (typeof selectedColor === 'string') {
    selectedColor = { name: selectedColor, hex: '#1F2937', value: '#1F2937' };
  } else if (!selectedColor || typeof selectedColor !== 'object') {
    selectedColor = { name: 'Default', hex: '#1F2937', value: '#1F2937' };
  } else {
    selectedColor = {
      id: selectedColor.id || 'col-custom',
      name: selectedColor.name || 'Default',
      hex: selectedColor.hex || selectedColor.value || '#1F2937',
      value: selectedColor.value || selectedColor.hex || '#1F2937'
    };
  }

  // Perfume normalization
  let selectedPerfume = rawItem.selectedPerfume;
  if (selectedPerfume === undefined && rawItem.perfume !== undefined) selectedPerfume = rawItem.perfume;
  if (selectedPerfume) {
    if (typeof selectedPerfume === 'string') {
      if (selectedPerfume.toLowerCase() === 'no perfume' || selectedPerfume.toLowerCase() === 'none') {
        selectedPerfume = null;
      } else {
        selectedPerfume = {
          id: 'perfume-custom',
          name: selectedPerfume,
          brand: 'Atelier Parfums',
          fragranceFamily: 'Fresh',
          description: '',
          price: 0,
          icon: '✨'
        };
      }
    } else if (typeof selectedPerfume === 'object') {
      if (selectedPerfume.id === 'no-perfume' || selectedPerfume.name === 'No Perfume' || (selectedPerfume.price === 0 && selectedPerfume.fragranceFamily === 'Unscented')) {
        selectedPerfume = null;
      } else {
        selectedPerfume = {
          id: selectedPerfume.id || 'perfume-custom',
          name: selectedPerfume.name || 'Atelier Fragrance',
          brand: selectedPerfume.brand || 'FitFusion Atelier',
          fragranceFamily: selectedPerfume.fragranceFamily || 'Fresh',
          description: selectedPerfume.description || '',
          price: Math.max(0, Number(selectedPerfume.price || 0)),
          icon: selectedPerfume.icon || '✨'
        };
      }
    } else {
      selectedPerfume = null;
    }
  } else {
    selectedPerfume = null;
  }

  const perfumePrice = selectedPerfume ? Math.max(0, Number(selectedPerfume.price || 0)) : 0;

  // Custom Measurements & Size
  const size = rawItem.size || 'M';
  const isCustomTailored = size === 'Custom Tailored' || rawItem.sizeMode === 'custom';

  let customMeasurements = null;
  if (isCustomTailored && (rawItem.customMeasurements || rawItem.measurements)) {
    const rawMetrics = rawItem.customMeasurements || rawItem.measurements;
    if (typeof rawMetrics === 'object' && rawMetrics !== null) {
      customMeasurements = {};
      Object.keys(rawMetrics).forEach(k => {
        const val = rawMetrics[k];
        if (val !== '' && val !== null && val !== undefined) {
          customMeasurements[k] = String(val);
        }
      });
      if (Object.keys(customMeasurements).length === 0) {
        customMeasurements = null;
      }
    }
  }

  const quantity = Math.max(1, parseInt(rawItem.quantity, 10) || 1);

  // Price calculations
  let calculatedItemPrice = Number(rawItem.totalItemPrice ?? rawItem.itemPrice ?? rawItem.price);
  if (isNaN(calculatedItemPrice) || calculatedItemPrice <= 0) {
    calculatedItemPrice = basePrice + (selectedFabric.priceAdjustment || 0) + hardwareSurcharge + monogramSurcharge + perfumePrice;
  }

  const designOptions = rawItem.designOptions || rawItem.selectedDesign || {
    collar: rawItem.collar || 'Classic',
    cuff: rawItem.cuff || 'Standard',
    buttons: rawItem.buttons || 'Standard Horn'
  };

  return {
    ...rawItem,
    id,
    productId,
    productName,
    category,
    productImage,
    silhouetteColor,
    accentColor,
    basePrice,
    fabricSurcharge: selectedFabric.priceAdjustment || fabricSurcharge,
    hardwareSurcharge,
    monogramSurcharge,
    selectedFabric,
    selectedColor,
    selectedPerfume,
    perfumePrice,
    size: isCustomTailored ? 'Custom Tailored' : size,
    customMeasurements,
    measurementUnit: rawItem.measurementUnit || 'in',
    fit: rawItem.fit || 'Regular',
    designOptions,
    selectedDesign: designOptions,
    collar: designOptions.collar || 'Classic',
    cuff: designOptions.cuff || 'Standard',
    buttons: designOptions.buttons || 'Standard Horn',
    monogram: typeof rawItem.monogram === 'string' ? rawItem.monogram : (rawItem.monogram?.text || ''),
    quantity,
    itemPrice: calculatedItemPrice,
    totalItemPrice: calculatedItemPrice,
    addedAt: rawItem.addedAt || new Date().toISOString()
  };
}
