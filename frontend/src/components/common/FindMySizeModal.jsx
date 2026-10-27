import React, { useState } from 'react';
import { calculateSizeRecommendation } from '../../services/sizeRecommendationService.js';

export default function FindMySizeModal({
  isOpen,
  onClose,
  onSelectSize,
  initialSize = 'M',
  gender = 'Men',
  availableSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL']
}) {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [preferredFit, setPreferredFit] = useState('Regular');
  const [chest, setChest] = useState('');
  const [result, setResult] = useState(null);
  const [selectedSize, setSelectedSize] = useState(initialSize);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCalculate = (e) => {
    e.preventDefault();
    setError('');

    if (!height || Number(height) <= 0) {
      setError('Please enter your height in cm.');
      return;
    }
    if (!weight || Number(weight) <= 0) {
      setError('Please enter your weight in kg.');
      return;
    }

    const rec = calculateSizeRecommendation({
      height: Number(height),
      weight: Number(weight),
      preferredFit,
      chest: chest ? Number(chest) : null,
      gender
    });

    if (rec.success) {
      setResult(rec);
      // If available sizes includes recommended size, select it; otherwise select closest
      if (availableSizes.includes(rec.recommendedSize)) {
        setSelectedSize(rec.recommendedSize);
      } else if (availableSizes.length > 0) {
        setSelectedSize(availableSizes[0]);
      }
    } else {
      setError(rec.error || 'Could not calculate size recommendation.');
    }
  };

  const handleApply = () => {
    if (onSelectSize && selectedSize) {
      onSelectSize(selectedSize, preferredFit);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-modal-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/60">
          <div>
            <h3 id="size-modal-title" className="text-base font-bold text-brand-dark">
              Find My Size
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Get a personalized size suggestion in seconds
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {!result ? (
            <form onSubmit={handleCalculate} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Height <span className="text-neutral-400 font-normal">(cm)</span>
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    placeholder="e.g. 175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Weight <span className="text-neutral-400 font-normal">(kg)</span>
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="200"
                    placeholder="e.g. 70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Preferred Fit
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Slim', 'Regular', 'Relaxed'].map((fit) => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => setPreferredFit(fit)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                        preferredFit === fit
                          ? 'border-brand-dark bg-brand-dark text-white shadow-xs'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-neutral-700">
                    Chest <span className="text-neutral-400 font-normal">(cm, optional)</span>
                  </label>
                  <span className="text-[10px] text-neutral-400">Estimated if left blank</span>
                </div>
                <input
                  type="number"
                  min="60"
                  max="160"
                  placeholder="e.g. 100 (optional)"
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-dark hover:bg-black text-white text-xs font-bold transition shadow-sm"
                >
                  Calculate My Size
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Recommendation Card */}
              <div className="p-4 rounded-xl bg-brand-accent/5 border border-brand-accent/20 text-center space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-brand-accent">
                  Size Suggestion
                </div>
                <div className="text-3xl font-extrabold text-brand-dark font-serif">
                  Recommended Size: {result.recommendedSize}
                </div>
                <p className="text-xs font-medium text-neutral-700">
                  {result.fitAdvice}
                </p>
                {result.isChestEstimated && (
                  <p className="text-[11px] text-neutral-500">
                    Estimated chest circumference: ~{result.estimatedChest} cm
                  </p>
                )}
              </div>

              {/* Manual Override Option */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  Select Size (you can override the recommendation):
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedSize === size
                          ? 'bg-brand-dark text-white ring-2 ring-brand-dark ring-offset-1 shadow-xs'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
                ℹ️ {result.disclaimer}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="w-1/3 py-2 px-3 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold transition"
                >
                  Recalculate
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="w-2/3 py-2 px-3 rounded-xl bg-brand-dark hover:bg-black text-white text-xs font-bold transition shadow-sm"
                >
                  Use Size {selectedSize} &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
