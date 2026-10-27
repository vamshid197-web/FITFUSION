import React, { useState, useRef, useCallback } from 'react';

/**
 * CustomGarmentUpload
 * Enables users to upload their own custom garment photograph for Kolors Virtual Try-On.
 * Features:
 * - Drag and drop & file selector
 * - Client-side validation: format (JPEG, PNG, WEBP) & max file size (15MB)
 * - Category classification: upper_body, lower_body, dresses
 * - Real-time image preview with dimensions
 * - Privacy notice: in-memory ephemeral processing
 */
export default function CustomGarmentUpload({
  onGarmentSelected,
  onCancel,
  currentGarment = null
}) {
  const [garmentImage, setGarmentImage] = useState(currentGarment?.image || null);
  const [garmentName, setGarmentName] = useState(currentGarment?.name || 'Custom Garment');
  const [garmentCategory, setGarmentCategory] = useState(currentGarment?.category || 'T-Shirts');
  const [targetVtonCategory, setTargetVtonCategory] = useState(currentGarment?.vtonCategory || 'upper_body');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [imageMeta, setImageMeta] = useState(null);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const categoryOptions = [
    { id: 'upper_body', label: 'Tops / Shirts / Jackets', defaultCat: 'Shirts', icon: '👔' },
    { id: 'lower_body', label: 'Pants / Jeans / Skirts', defaultCat: 'Jeans & Pants', icon: '👖' },
    { id: 'dresses', label: 'Dresses / Gowns / Sets', defaultCat: 'Dresses', icon: '👗' }
  ];

  const processFile = useCallback((file) => {
    setErrorMsg('');

    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setErrorMsg('Unsupported format. Please upload a JPEG, PNG, or WEBP image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 15MB limit. Please upload a smaller image.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setGarmentImage(dataUrl);

      // Extract image dimensions for metadata display
      const img = new Image();
      img.onload = () => {
        setImageMeta({
          width: img.width,
          height: img.height,
          sizeMb: (file.size / (1024 * 1024)).toFixed(2),
          type: file.type.replace('image/', '').toUpperCase()
        });
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file. Please try selecting the file again.');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleConfirmGarment = () => {
    if (!garmentImage) {
      setErrorMsg('Please upload a garment image first.');
      return;
    }

    const customProduct = {
      id: `custom-${Date.now()}`,
      name: garmentName.trim() || 'Custom Garment',
      category: garmentCategory,
      vtonCategory: targetVtonCategory,
      image: garmentImage,
      price: 0,
      basePrice: 0,
      isCustomGarment: true,
      description: 'Custom user-uploaded garment reference for Kolors Virtual Try-On.',
      availableColors: [{ name: 'Original', hex: '#6366F1' }]
    };

    onGarmentSelected(customProduct);
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              CUSTOM GARMENT INPUT
            </span>
            <span className="text-neutral-500 text-xs">• Upload Your Own Clothes</span>
          </div>
          <h3 className="text-lg md:text-xl font-extrabold text-white mt-1">
            Upload Custom Garment Photo
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Use any clean photo or flat-lay of clothing from your personal wardrobe.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-bold text-neutral-400 hover:text-white px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition"
          >
            &larr; Back to Catalog
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span> {errorMsg}
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            className="text-red-400 hover:text-white font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Category Selector ────────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
          Garment Type & Placement:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {categoryOptions.map((opt) => {
            const isSelected = targetVtonCategory === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setTargetVtonCategory(opt.id);
                  setGarmentCategory(opt.defaultCat);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg ring-1 ring-amber-500/40'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <div>
                  <div className={`text-xs font-extrabold ${isSelected ? 'text-amber-400' : 'text-neutral-200'}`}>
                    {opt.label}
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    Target: {opt.id}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Drag & Drop Area / Preview ─────────────────────────────────────── */}
      {!garmentImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
              : 'border-neutral-700 bg-neutral-950 hover:border-neutral-600 hover:bg-neutral-900/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-3xl mx-auto mb-3 text-amber-400">
            📤
          </div>

          <h4 className="text-sm font-extrabold text-white">
            Click to upload garment photo or drag & drop here
          </h4>
          <p className="text-xs text-neutral-400 mt-1">
            Supported formats: JPEG, PNG, WEBP • Maximum file size: 15MB
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 font-medium">
            <span>💡 Tip:</span> Clean flat-lay on plain background produces the sharpest try-on results.
          </div>
        </div>
      ) : (
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative w-36 h-44 rounded-2xl overflow-hidden border border-neutral-700 bg-black shrink-0 shadow-xl">
              <img
                src={garmentImage}
                alt="Custom Garment Preview"
                className="w-full h-full object-contain bg-neutral-900"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-neutral-950/80 text-[10px] font-bold text-amber-400 border border-amber-500/40">
                UPLOADED
              </div>
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Garment Name / Label:
                </label>
                <input
                  type="text"
                  value={garmentName}
                  onChange={(e) => setGarmentName(e.target.value)}
                  placeholder="e.g. Vintage Denim Jacket"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {imageMeta && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px]">
                    <div className="text-neutral-500">Dimensions</div>
                    <div className="font-bold text-neutral-200">{imageMeta.width}×{imageMeta.height}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px]">
                    <div className="text-neutral-500">File Size</div>
                    <div className="font-bold text-neutral-200">{imageMeta.sizeMb} MB</div>
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px]">
                    <div className="text-neutral-500">Format</div>
                    <div className="font-bold text-emerald-400">{imageMeta.type}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setGarmentImage(null);
                    setImageMeta(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-neutral-300 hover:text-white transition"
                >
                  ↺ Replace Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Privacy Guarantee ─────────────────────────────────────────────── */}
      <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800 flex items-center gap-3 text-xs text-neutral-400">
        <span className="text-base text-emerald-400 shrink-0">🔒</span>
        <span>
          <strong className="text-neutral-200">Ephemeral In-Memory Processing:</strong> Uploaded custom garment photos are handled in-memory and never stored permanently.
        </span>
      </div>

      {/* ── Action Buttons ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800 transition"
          >
            Cancel
          </button>
        ) : <div />}

        <button
          type="button"
          disabled={!garmentImage}
          onClick={handleConfirmGarment}
          className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-xl flex items-center gap-2 ${
            garmentImage
              ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 hover:scale-105 active:scale-95'
              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
          }`}
        >
          <span>✨</span> Use This Garment for Try-On &rarr;
        </button>
      </div>
    </div>
  );
}
