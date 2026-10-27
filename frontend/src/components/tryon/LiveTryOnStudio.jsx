import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MOCK_PRODUCTS } from '../../data/mockProducts.js';

/**
 * LiveTryOnStudio
 * Integrated in-app live camera virtual try-on studio for FITFUSION.
 * Features live WebRTC camera preview, camera device switching, garment catalog selection,
 * outfit preview, instant snapshot capture to Kolors AI Photo Try-On, and transparent
 * real-time video AI provider status.
 */
export default function LiveTryOnStudio({
  catalogProducts = [],
  selectedProduct = null,
  onSelectProduct = () => {},
  onTakeSnapshot = null
}) {
  // Camera & Stream States
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [streamResolution, setStreamResolution] = useState(null);

  // Catalog & Outfit States
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // 1. Enumerate available video inputs
  const enumerateVideoDevices = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return [];
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setAvailableCameras(videoInputs);
      if (videoInputs.length > 0 && !selectedCameraId) {
        setSelectedCameraId(videoInputs[0].deviceId);
      }
      return videoInputs;
    } catch {
      return [];
    }
  }, [selectedCameraId]);

  // 2. Stop Camera & Release all MediaStream tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Track already closed
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsLoadingCamera(false);
    setStreamResolution(null);
  }, []);

  // 3. Start Camera with specified deviceId
  const startCamera = useCallback(async (deviceId = null) => {
    setIsLoadingCamera(true);
    setCameraError(null);
    setPermissionDenied(false);

    // Stop any existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support WebRTC camera access.');
      }

      const targetDeviceId = deviceId || selectedCameraId;
      const constraints = {
        video: targetDeviceId
          ? { deviceId: { exact: targetDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(() => {});
          setStreamResolution(
            videoRef.current.videoWidth && videoRef.current.videoHeight
              ? `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`
              : '720p HD'
          );
        };
      }

      setIsStreaming(true);
      setIsLoadingCamera(false);

      // Re-enumerate devices now that permission is granted (to get actual labels)
      await enumerateVideoDevices();
    } catch (err) {
      setIsLoadingCamera(false);
      setIsStreaming(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setCameraError('Camera access was denied. Please allow camera permissions in your browser address bar.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No video camera device was detected on your system.');
      } else {
        setCameraError(err.message || 'Unable to start camera.');
      }
    }
  }, [selectedCameraId, enumerateVideoDevices]);

  // 4. Switch Camera Handler
  const handleSwitchCamera = useCallback((e) => {
    const newDeviceId = e.target.value;
    setSelectedCameraId(newDeviceId);
    if (isStreaming) {
      startCamera(newDeviceId);
    }
  }, [isStreaming, startCamera]);

  // 5. Cleanup on component unmount
  useEffect(() => {
    enumerateVideoDevices();
    return () => {
      stopCamera();
    };
  }, [enumerateVideoDevices, stopCamera]);

  // 6. Capture Snapshot and pass to Kolors AI Photo Try-On
  const handleCaptureSnapshot = useCallback(() => {
    if (!videoRef.current || !isStreaming) return;
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');

      // Mirror horizontally to match the preview mirror
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setIsCapturing(false);

      if (onTakeSnapshot) {
        onTakeSnapshot(dataUrl);
      }
    } catch {
      setIsCapturing(false);
    }
  }, [isStreaming, onTakeSnapshot]);

  // 7. Filter Garment Catalog
  const productsSource = catalogProducts && catalogProducts.length > 0 ? catalogProducts : MOCK_PRODUCTS;
  const categories = ['All', 'T-Shirts', 'Shirts', 'Hoodies', 'Jackets', 'Dresses', 'Traditional Wear'];

  const filteredGarments = productsSource.filter((item) => {
    if (!item) return false;
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = !searchQuery ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeGarment = selectedProduct || (filteredGarments.length > 0 ? filteredGarments[0] : null);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hidden canvas for capturing video frames */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              In-App Live Studio
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-neutral-800 text-neutral-300 border border-neutral-700">
              WebRTC Camera Preview
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Kolors AI Connected
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-extrabold text-white mt-2 tracking-tight">
            FITFUSION Live Try-On Studio
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Check your framing, pose, and proportions with your live camera feed, select outfits from the FITFUSION catalog, and capture a photo to generate an authentic high-resolution Kolors AI try-on.
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-3 bg-neutral-950/80 px-4 py-2.5 rounded-2xl border border-neutral-800 shrink-0">
          <span className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
          <div className="text-left">
            <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
              Camera Status
            </div>
            <div className="text-xs font-bold text-white">
              {isStreaming ? `Active (${streamResolution || 'Live'})` : 'Camera Inactive'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Left Camera Studio, Right Garment Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: LIVE WEBCAM VIEWER & CONTROLS (7 COLS)                      */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-neutral-950 rounded-3xl border border-neutral-800 overflow-hidden shadow-2xl flex flex-col items-center justify-center">
            {/* 1. Live Video Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
                isStreaming ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />

            {/* 2. Inactive / Permission Prompt State */}
            {!isStreaming && !isLoadingCamera && !permissionDenied && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-neutral-950/90 z-10">
                <div className="w-16 h-16 rounded-3xl bg-neutral-900 border border-neutral-800 text-amber-400 flex items-center justify-center text-3xl shadow-inner">
                  📹
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-base font-bold text-white">Live Camera Preview</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Allow camera access to try on clothes. Your video feed is processed 100% locally in your browser for complete privacy.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  Start Camera
                </button>
              </div>
            )}

            {/* 3. Loading Camera State */}
            {isLoadingCamera && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-neutral-950/95 z-20">
                <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-neutral-300 font-bold">Requesting camera device access...</p>
                <p className="text-[11px] text-neutral-500">Please confirm permission in your browser prompt.</p>
              </div>
            )}

            {/* 4. Permission Denied / Camera Error State */}
            {permissionDenied && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-neutral-950/95 z-20">
                <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center text-2xl font-bold">
                  ✕
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-sm font-black text-red-300">Camera Access Required</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {cameraError || 'Camera permission was denied. Please grant permission in your browser URL bar and retry.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Retry Camera Access
                </button>
              </div>
            )}

            {/* 5. In-Stream Controls Overlay */}
            {isStreaming && (
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
                <div className="flex items-center gap-2 bg-neutral-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-700 pointer-events-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">
                    Live Feed • 100% Local
                  </span>
                </div>

                <div className="flex items-center gap-2 pointer-events-auto">
                  {availableCameras.length > 1 && (
                    <select
                      value={selectedCameraId}
                      onChange={handleSwitchCamera}
                      className="bg-neutral-950/80 backdrop-blur-md text-white text-[11px] font-bold py-1.5 px-3 rounded-xl border border-neutral-700 focus:outline-none focus:border-amber-400"
                    >
                      {availableCameras.map((cam, idx) => (
                        <option key={cam.deviceId || idx} value={cam.deviceId}>
                          {cam.label || `Camera ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  )}

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition"
                  >
                    Stop Camera
                  </button>
                </div>
              </div>
            )}

            {/* 6. Active Garment Pip (Picture-in-Picture) */}
            {isStreaming && activeGarment && (
              <div className="absolute bottom-4 left-4 bg-neutral-950/85 backdrop-blur-md border border-neutral-700/80 rounded-2xl p-2.5 flex items-center gap-3 shadow-2xl z-10 max-w-[260px]">
                <img
                  src={activeGarment.image}
                  alt={activeGarment.name}
                  className="w-12 h-16 object-cover object-top rounded-xl bg-neutral-900 border border-neutral-800"
                />
                <div className="text-left overflow-hidden">
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 truncate">
                    Selected Outfit
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {activeGarment.name}
                  </div>
                  <div className="text-xs font-extrabold text-neutral-300">
                    ₹{activeGarment.price}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Camera Action Buttons Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              {!isStreaming ? (
                <button
                  type="button"
                  onClick={() => startCamera()}
                  disabled={isLoadingCamera}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider transition shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isLoadingCamera ? 'Starting...' : 'Start Camera'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs uppercase tracking-wider transition"
                >
                  Stop Camera
                </button>
              )}

              {availableCameras.length > 1 && isStreaming && (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = availableCameras.findIndex((c) => c.deviceId === selectedCameraId);
                    const nextIndex = (currentIndex + 1) % availableCameras.length;
                    const nextId = availableCameras[nextIndex]?.deviceId;
                    if (nextId) {
                      setSelectedCameraId(nextId);
                      startCamera(nextId);
                    }
                  }}
                  className="px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition"
                  title="Switch Camera Device"
                >
                  🔄 Switch Camera
                </button>
              )}
            </div>

            {/* Instant Snapshot to Kolors AI Generation */}
            {isStreaming && (
              <button
                type="button"
                onClick={handleCaptureSnapshot}
                disabled={isCapturing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 active:scale-95 flex items-center gap-2"
              >
                <span>📸</span>
                <span>{isCapturing ? 'Capturing...' : 'Capture & Try On with AI (Kolors)'}</span>
              </button>
            )}
          </div>

          {/* Honest AI Video Engine Disclosure */}
          <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <span>ℹ️</span>
              <span>Real-Time AI Video Architecture & Provider Status</span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              • <strong>Local Video Preview:</strong> Live camera streams directly inside FITFUSION using client WebRTC. Zero video frames are transmitted to external servers without your direct action.
            </p>
            <p className="text-neutral-400 leading-relaxed">
              • <strong>Real-Time Video AI (Decart Lucy V-TON):</strong> Continuous video-rate neural try-on models require an active Decart enterprise agreement, merchant domain whitelist, and dedicated GPU streaming credentials (<code className="text-purple-300 font-mono">DECART_API_KEY</code>).
            </p>
            <p className="text-neutral-400 leading-relaxed">
              • <strong>Kolors AI Photo Try-On:</strong> Click <em>"Capture & Try On with AI"</em> to immediately snapshot your pose and synthesize high-resolution neural photo try-on using the connected Kolors AI model.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: GARMENT CATALOG & OUTFIT SWITCHING (5 COLS)                */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Select Garment From Catalog
                </h3>
                <p className="text-xs text-neutral-400">
                  Switch outfits instantly in the live studio preview
                </p>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                {filteredGarments.length} Available
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                    activeCategory === cat
                      ? 'bg-amber-500 text-neutral-950 font-black shadow-md'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shirts, hoodies, dresses..."
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400 transition"
            />

            {/* Garments Scrollable Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredGarments.map((garment) => {
                const isSelected = activeGarment?.id === garment.id;
                return (
                  <button
                    key={garment.id}
                    type="button"
                    onClick={() => onSelectProduct(garment)}
                    className={`group text-left rounded-2xl overflow-hidden border transition-all p-2 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-900 mb-2">
                      <img
                        src={garment.image}
                        alt={garment.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-[10px] font-black">
                          ✓
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-white truncate group-hover:text-amber-400 transition">
                        {garment.name}
                      </div>
                      <div className="text-[10px] font-extrabold text-neutral-400 mt-0.5">
                        ₹{garment.price}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredGarments.length === 0 && (
              <div className="p-8 text-center text-xs text-neutral-500 bg-neutral-950 rounded-2xl border border-neutral-800">
                No garments found matching "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
