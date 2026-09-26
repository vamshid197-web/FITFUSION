import React from 'react';

/**
 * Renders individual removable chips for all active catalog filters
 */
export default function ActiveFilterChips({
  filters = {},
  onRemoveFilter,
  onClearAll,
  className = ''
}) {
  const {
    searchQuery = '',
    category = 'All',
    minPrice = null,
    maxPrice = null,
    color = null,
    fabric = null,
    size = null,
    rating = 'all',
    availability = 'all',
    customizableOnly = false
  } = filters;

  const chips = [];

  // 1. Search Query chip
  if (searchQuery && searchQuery.trim()) {
    chips.push({
      key: 'search',
      label: `Search: "${searchQuery.trim()}"`,
      onRemove: () => onRemoveFilter('searchQuery', '')
    });
  }

  // 2. Category chip
  if (category && category !== 'All') {
    chips.push({
      key: 'category',
      label: `Category: ${category}`,
      onRemove: () => onRemoveFilter('category', 'All')
    });
  }

  // 3. Price chip
  const min = minPrice !== null && minPrice !== '' ? Number(minPrice) : null;
  const max = maxPrice !== null && maxPrice !== '' ? Number(maxPrice) : null;
  if (min !== null || max !== null) {
    let priceLabel = '';
    if (min !== null && max !== null) {
      priceLabel = `₹${min.toLocaleString('en-IN')} – ₹${max.toLocaleString('en-IN')}`;
    } else if (min !== null) {
      priceLabel = `Above ₹${min.toLocaleString('en-IN')}`;
    } else if (max !== null) {
      priceLabel = `Under ₹${max.toLocaleString('en-IN')}`;
    }
    chips.push({
      key: 'price',
      label: `Price: ${priceLabel}`,
      onRemove: () => {
        onRemoveFilter('minPrice', null);
        onRemoveFilter('maxPrice', null);
      }
    });
  }

  // 4. Color chip
  if (color && color !== 'all') {
    chips.push({
      key: 'color',
      label: `Color: ${color}`,
      onRemove: () => onRemoveFilter('color', null)
    });
  }

  // 5. Fabric chip
  if (fabric && fabric !== 'all') {
    chips.push({
      key: 'fabric',
      label: `Fabric: ${fabric}`,
      onRemove: () => onRemoveFilter('fabric', null)
    });
  }

  // 6. Size chip
  if (size && size !== 'all') {
    chips.push({
      key: 'size',
      label: `Size: ${size}`,
      onRemove: () => onRemoveFilter('size', null)
    });
  }

  // 7. Rating chip
  if (rating && rating !== 'all') {
    chips.push({
      key: 'rating',
      label: `Rating: ${rating}★+`,
      onRemove: () => onRemoveFilter('rating', 'all')
    });
  }

  // 8. Stock availability
  if (availability === 'in-stock') {
    chips.push({
      key: 'availability',
      label: 'In Stock Only',
      onRemove: () => onRemoveFilter('availability', 'all')
    });
  }

  // 9. Customizable Only
  if (customizableOnly) {
    chips.push({
      key: 'customizableOnly',
      label: 'Customizable Only',
      onRemove: () => onRemoveFilter('customizableOnly', false)
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} aria-label="Active Filters">
      <span className="text-xs text-neutral-500 font-medium">Active filters:</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-neutral-200 text-neutral-800 shadow-2xs group hover:border-brand-accent transition-colors"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="text-neutral-400 group-hover:text-red-500 font-bold ml-0.5 focus:outline-none"
            aria-label={`Remove ${chip.label} filter`}
            title={`Remove ${chip.label}`}
          >
            &#10005;
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline px-2 py-1 ml-1"
        aria-label="Clear all active filters"
      >
        Clear All
      </button>
    </div>
  );
}
