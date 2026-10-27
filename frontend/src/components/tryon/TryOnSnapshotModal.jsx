import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button.jsx';
import { normalizeGarmentColor } from '../../services/photoTryOnService.js';

export default function TryOnSnapshotModal({
  isOpen,
  onClose,
  snapshotUrl,
  product,
  customization,
  onAddToCart
}) {
  const navigate = useNavigate();
  if (!isOpen || !snapshotUrl) return null;

  const colorHex = normalizeGarmentColor(customization?.color || customization?.selectedColor, product);
  const colorName = typeof customization?.color === 'object'
    ? customization?.color?.name
    : customization?.color || product?.availableColors?.[0]?.name || 'Classic White';
  const fabricName = typeof customization?.fabric === 'object'
    ? customization?.fabric?.name
    : customization?.fabric || 'Certified Textile';
  const sizeName = customization?.size || 'M';
  const fitName = customization?.fit || 'Regular Fit';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = snapshotUrl;
    link.download = `fitfusion-${(product?.name || 'apparel').toLowerCase().replace(/\s+/g, '-')}-tryon.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleContinueCustomizing = () => {
    onClose();
    if (product?.id) {
      navigate(`/customize/${product.id}`, {
        state: {
          product,
          productId: product.id,
          customization
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-neutral-200 flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-extrabold text-base text-brand-dark">
              Try-On Preview
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center text-sm font-bold transition"
            aria-label="Close Preview"
          >
            ✕
          </button>
        </div>

        {/* Snapshot Image Container */}
        <div className="p-5 bg-neutral-900 flex items-center justify-center relative">
          <img
            src={snapshotUrl}
            alt="Virtual Try-On Snapshot"
            className="max-h-80 w-auto rounded-xl shadow-lg object-contain border border-neutral-800"
          />
          <div className="absolute bottom-7 left-7 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-[11px] text-white font-medium border border-white/10">
            Preview &bull; {product?.name || 'FitFusion Bespoke'}
          </div>
        </div>

        {/* Tailored Garment Specifications */}
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent">
                Tailored Garment Look
              </span>
              <h4 className="text-lg font-black text-brand-dark">
                {product?.name || 'Custom Garment'}
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                {product?.category} &bull; Tailored Atelier Specifications
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Verified Look
              </span>
            </div>
          </div>

          {/* Customization Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Color</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span style={{ backgroundColor: colorHex }} className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-xs" />
                <span className="text-xs font-bold text-neutral-800 truncate">{colorName}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Fabric</span>
              <span className="text-xs font-bold text-neutral-800 truncate mt-1 block">{fabricName}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Size / Fit</span>
              <span className="text-xs font-bold text-neutral-800 truncate mt-1 block">{sizeName} ({fitName})</span>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Monogram</span>
              <span className="text-xs font-bold text-neutral-800 truncate mt-1 block">
                {customization?.monogramText ? `"${customization.monogramText}"` : 'None'}
              </span>
            </div>
          </div>

          {/* Important Fit & Privacy Disclaimers */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900">
            <div className="font-bold flex items-center gap-1.5">
              <span>ⓘ</span> Virtual Try-On Visual Preview
            </div>
            <p className="text-amber-800 leading-relaxed">
              Virtual Try-On is an approximate visual preview and may not represent exact real-world fit.
              Garments are tailored based on your selected size or custom measurement specs.
            </p>
            <p className="text-neutral-500 text-[10px] pt-1 border-t border-amber-200/50">
              🔒 Privacy Guaranteed: Your camera was processed 100% locally in your browser. No video is saved or transmitted.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              className="w-full text-xs font-bold"
            >
              🔄 Retake
            </Button>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleContinueCustomizing}
              className="w-full text-xs font-bold border-amber-400 text-amber-900 bg-amber-50 hover:bg-amber-100"
            >
              ✨ Continue Customizing
            </Button>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleDownload}
              className="w-full text-xs font-bold"
            >
              💾 Save Snapshot
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => {
                onClose();
                if (onAddToCart) onAddToCart();
              }}
              className="w-full text-xs font-extrabold shadow-md bg-amber-500 hover:bg-amber-600 text-neutral-950"
            >
              Add to Bag →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
