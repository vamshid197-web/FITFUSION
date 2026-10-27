import React, { useState, useRef, useCallback } from 'react';
import { validateUserPhoto } from '../../services/photoTryOnService.js';
import ProductImage from '../common/ProductImage.jsx';
import { getProductImage } from '../../data/mockProducts.js';

/**
 * Sample Model Photos for quick testing without needing to upload personal photo
 */
const SAMPLE_MODELS = [
  {
    id: 'sample-male-1',
    name: 'Male Model',
    gender: 'Men',
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    description: 'Casual studio standing posture'
  },
  {
    id: 'sample-female-1',
    name: 'Female Model',
    gender: 'Women',
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    description: 'Neutral portrait studio pose'
  },
  {
    id: 'sample-male-2',
    name: 'Smart Casual',
    gender: 'Men',
    src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    description: 'Full-body upright framing'
  }
];

/**
 * PhotoUploadExperience
 * Privacy-first, camera-free photo upload experience for Kolors AI Virtual Try-On:
 * - 100% camera-free: No camera access, no webcam permissions, no device hardware requests.
 * - Drag-and-drop or file picker upload.
 * - Client-side validation: format (JPG, PNG, WEBP), file size (up to 15MB), aspect ratio, lighting.
 * - Instant photo preview with validation status indicators.
 * - Clear privacy and ephemeral processing disclosures.
 */
export default function PhotoUploadExperience({
  onPhotoConfirmed,
  onPhotoUploaded,
  selectedProduct = null,
  onChangeGarment = null
}) {
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const fileInputRef = useRef(null);

  /**
   * Process and validate an image file
   */
  const handleFileProcess = useCallback((file) => {
    if (!file) return;

    setErrorMessage(null);
    setIsValidating(true);

    // Initial MIME format validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const ext = (file.name || '').split('.').pop().toLowerCase();
    const validExts = ['jpg', 'jpeg', 'png', 'webp'];

    if (!validTypes.includes(file.type) && !validExts.includes(ext)) {
      setIsValidating(false);
      setErrorMessage('Unsupported format. Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setIsValidating(false);
      setErrorMessage('File size exceeds 15MB limit. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();
      img.onload = async () => {
        try {
          const val = await validateUserPhoto(file, img);
          setValidationResult(val);
          setSelectedPhotoUrl(dataUrl);
          setSelectedPhotoFile(file);

          if (onPhotoUploaded) {
            onPhotoUploaded(dataUrl, file);
          }
        } catch {
          setSelectedPhotoUrl(dataUrl);
          setSelectedPhotoFile(file);
        } finally {
          setIsValidating(false);
        }
      };
      img.onerror = () => {
        setIsValidating(false);
        setErrorMessage('Failed to decode image. Please try a different photo.');
      };
      img.src = dataUrl;
    };

    reader.onerror = () => {
      setIsValidating(false);
      setErrorMessage('Error reading selected file.');
    };

    reader.readAsDataURL(file);
  }, [onPhotoUploaded]);

  /**
   * Handle drag & drop
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  /**
   * Select a sample model image
   */
  const handleSelectSample = async (model) => {
    setIsValidating(true);
    setErrorMessage(null);
    try {
      const res = await fetch(model.src);
      const blob = await res.blob();
      const file = new File([blob], `${model.id}.jpg`, { type: 'image/jpeg' });
      handleFileProcess(file);
    } catch {
      // Fallback to direct URL if fetch fails
      setSelectedPhotoUrl(model.src);
      setSelectedPhotoFile(null);
      setValidationResult({ isValid: true, score: 90, message: 'Sample model selected.' });
      if (onPhotoUploaded) onPhotoUploaded(model.src, null);
      setIsValidating(false);
    }
  };

  /**
   * Reset selected photo
   */
  const handleResetPhoto = () => {
    setSelectedPhotoUrl(null);
    setSelectedPhotoFile(null);
    setValidationResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Confirm and proceed to garment selection
   */
  const handleConfirm = () => {
    if (!selectedPhotoUrl) return;
    if (onPhotoConfirmed) {
      onPhotoConfirmed(selectedPhotoUrl, selectedPhotoFile);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Privacy & Technology Disclosure Banner */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm font-bold shrink-0">
            🔒
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                Privacy Guaranteed
              </span>
              <span className="text-neutral-500 text-xs">• Zero Camera Access</span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
              Your photo is uploaded securely and processed ephemerally for Kolors AI Virtual Try-On. Photos are never stored permanently, sold, or used for AI model training.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-neutral-400 bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>In-Memory AI Diffusion</span>
        </div>
      </div>

      {/* Selected Garment Reference Indicator (Preserves product selection from product page) */}
      {selectedProduct && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="w-14 h-16 rounded-xl overflow-hidden border border-neutral-700 bg-neutral-950 shrink-0 shadow-inner">
              <ProductImage
                productId={selectedProduct.id}
                src={selectedProduct.image || getProductImage(selectedProduct)}
                alt={selectedProduct.name}
                fallbackCategory={selectedProduct.category}
                aspectRatio="aspect-square"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Target Garment
                </span>
                <span className="text-neutral-500 text-xs font-mono">Product #{selectedProduct.id}</span>
              </div>
              <h4 className="text-sm font-extrabold text-white mt-0.5">
                {selectedProduct.name}
              </h4>
              <p className="text-xs text-neutral-400">
                ₹{Number(selectedProduct.price || 599).toLocaleString('en-IN')} &bull; {selectedProduct.category}
              </p>
            </div>
          </div>

          {onChangeGarment && (
            <button
              type="button"
              onClick={onChangeGarment}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shrink-0"
            >
              <span>↺</span> Choose Different Garment
            </button>
          )}
        </div>
      )}

      {/* Main Upload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Upload Zone or Preview */}
        <div className="lg:col-span-8 space-y-4">
          {!selectedPhotoUrl ? (
            /* Upload Dropzone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[380px] sm:min-h-[460px] ${
                isDragOver
                  ? 'border-amber-400 bg-amber-500/10 ring-4 ring-amber-500/20'
                  : 'border-neutral-700 hover:border-amber-500/70 bg-neutral-950/60 hover:bg-neutral-900/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleInputChange}
                className="hidden"
              />

              <div className="w-20 h-20 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-3xl shadow-xl mb-4 group-hover:scale-105 transition-transform">
                📸
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Upload Your Photo for Kolors AI Try-On
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md mt-1.5 leading-relaxed">
                Drag and drop your full-body or portrait photo here, or browse files on your device.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[11px] text-neutral-400">
                <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 font-mono">JPG, PNG, WEBP</span>
                <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 font-mono">Max 15MB</span>
                <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 font-mono">High Resolution</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-6 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-xl transition-all active:scale-95 flex items-center gap-2"
              >
                <span>📁</span> Browse Photo From Device
              </button>

              {isValidating && (
                <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center gap-3 z-20">
                  <div className="w-10 h-10 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                  <p className="text-xs font-bold text-amber-400">Analyzing photo suitability...</p>
                </div>
              )}
            </div>
          ) : (
            /* Selected Photo Preview Card */
            <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-sm font-extrabold text-white">
                    Photo Uploaded & Ready
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-bold border border-neutral-700 transition"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPhoto}
                    className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold border border-red-500/30 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleInputChange}
                className="hidden"
              />

              <div className="relative aspect-[3/4] max-h-[520px] rounded-2xl overflow-hidden bg-black mx-auto border border-neutral-800 shadow-inner flex items-center justify-center">
                <img
                  src={selectedPhotoUrl}
                  alt="User Uploaded Try-On Subject"
                  className="w-full h-full object-contain"
                />

                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-neutral-950/80 backdrop-blur-md border border-neutral-700 text-[11px] font-black text-white shadow-lg">
                  REFERENCE PHOTO
                </div>
              </div>

              {/* Quality Indicators */}
              {validationResult && (
                <div className="p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓ Suitability Score:</span>
                    <span className="font-mono text-white font-bold">{validationResult.score || 85}/100</span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-neutral-300">{validationResult.message}</span>
                  </div>

                  {validationResult.warnings && validationResult.warnings.length > 0 && (
                    <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      💡 {validationResult.warnings[0]}
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-neutral-400">
                  Ready to select an outfit from the catalogue.
                </p>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>✨</span> Confirm & Select Outfit &rarr;
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Quick Model Samples & Upload Tips */}
        <div className="lg:col-span-4 space-y-5">
          {/* Sample Model Photos Card */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl space-y-3.5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Instant Demo
              </span>
              <h4 className="text-sm font-extrabold text-white">
                Or Try With a Model Photo
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Don't have a photo handy? Pick a pre-calibrated model to test Kolors AI Try-On instantly.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {SAMPLE_MODELS.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => handleSelectSample(model)}
                  className="group relative rounded-2xl overflow-hidden border border-neutral-800 hover:border-amber-500 bg-neutral-950 p-1 transition-all text-left flex flex-col items-center"
                >
                  <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-neutral-900 mb-1.5">
                    <img
                      src={model.src}
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-neutral-300 group-hover:text-amber-400 line-clamp-1">
                    {model.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Photo Recommendations Guidelines */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <span>💡</span> Tips for Best Kolors AI Results
            </h4>

            <ul className="space-y-2 text-xs text-neutral-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>Pose:</strong> Stand upright facing the camera with arms relaxed slightly away from the torso.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>Lighting:</strong> Balanced front lighting with minimal harsh shadows produces photorealistic cloth drape.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>Background:</strong> Plain, uncluttered, or studio backgrounds provide optimal garment segmentation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>Framing:</strong> Vertical portrait or full-body photos capture upper and lower garments accurately.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
