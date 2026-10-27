import React, { useState, useRef, useEffect, useMemo } from 'react';
import ProductImage from '../common/ProductImage.jsx';
import { getProductImage } from '../../data/mockProducts.js';
import {
  GRAPHICS_LIBRARY,
  PATCHES_LIBRARY,
  PATTERNS_LIBRARY,
  PRINT_STYLE_EFFECTS,
  IMAGE_EFFECTS,
  DESIGN_TEMPLATES,
  getPrintAreasForCategory,
  parseNaturalDesignPrompt
} from '../../data/clothingDesignLibrary.js';

export default function ClothingDesignStudio({
  product,
  selectedColor,
  designLayers = [],
  onChangeLayers,
  onApplyGarmentSettings = null,
  className = ''
}) {
  const garmentCategory = product?.category || 'T-Shirts';
  const printAreas = useMemo(() => getPrintAreasForCategory(garmentCategory), [garmentCategory]);

  // Current active print area (e.g. 'front', 'back', 'sleeve', etc.)
  const [activeAreaId, setActiveAreaId] = useState(() => printAreas[0]?.id || 'front');

  // 360° Multi-Angle View state: 'front' (0°) | 'side' (90°) | 'back' (180°) | 'other_side' (270°)
  const [activeAngle, setActiveAngle] = useState('front');

  // Currently selected layer id
  const [selectedLayerId, setSelectedLayerId] = useState(null);

  // Active Tool Panel Tab
  const [activeTab, setActiveTab] = useState('graphics'); // 'graphics' | 'photo' | 'draw' | 'patterns' | 'text' | 'patches' | 'layers' | 'ai'

  // Search filter for graphics
  const [graphicsSearch, setGraphicsSearch] = useState('');
  const [graphicsCategory, setGraphicsCategory] = useState('All');

  // Undo / Redo history
  const [history, setHistory] = useState([designLayers]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // AI Assistant prompt state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiFeedback, setAiFeedback] = useState(null);

  // Boundary warning state
  const [boundaryWarning, setBoundaryWarning] = useState(null);

  // Drawing Canvas state
  const drawCanvasRef = useRef(null);
  const [drawTool, setDrawTool] = useState('pen'); // 'pen' | 'brush' | 'eraser' | 'line' | 'rect' | 'circle'
  const [drawColor, setDrawColor] = useState('#1F2937');
  const [drawSize, setDrawSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawHistory, setDrawHistory] = useState([]);
  const [drawHistoryStep, setDrawHistoryStep] = useState(0);

  // New Text form state
  const [newText, setNewText] = useState('FITFUSION');
  const [textFont, setTextFont] = useState('Montserrat');
  const [textStyle, setTextStyle] = useState('solid');
  const [textColor, setTextColor] = useState('#1F2937');
  const [textCurve, setTextCurve] = useState('none'); // 'none' | 'arch-up' | 'arch-down'
  const [textOutline, setTextOutline] = useState(false);
  const [textShadow, setTextShadow] = useState(false);

  // Photo upload error state
  const [photoError, setPhotoError] = useState(null);

  // Active layer object
  const activeLayer = designLayers.find((l) => l.id === selectedLayerId);

  // Filter layers for current print area
  const currentAreaLayers = useMemo(() => {
    return designLayers.filter((l) => (l.printArea || 'front') === activeAreaId);
  }, [designLayers, activeAreaId]);

  // Push new state to history
  const pushHistory = (newLayers) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newLayers);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    onChangeLayers(newLayers);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      onChangeLayers(history[newIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      onChangeLayers(history[newIdx]);
    }
  };

  // Add a new layer
  const addLayer = (layerData) => {
    const newLayer = {
      id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      printArea: activeAreaId,
      position: { x: 50, y: 50 },
      scale: 0.85,
      rotation: 0,
      opacity: 1,
      printStyle: 'solid',
      color: '#1F2937',
      visible: true,
      locked: false,
      ...layerData
    };
    const nextLayers = [...designLayers, newLayer];
    setSelectedLayerId(newLayer.id);
    pushHistory(nextLayers);
  };

  // Update a layer property
  const updateLayer = (id, updates) => {
    const nextLayers = designLayers.map((l) => (l.id === id ? { ...l, ...updates } : l));
    pushHistory(nextLayers);
  };

  // Delete layer
  const deleteLayer = (id) => {
    const nextLayers = designLayers.filter((l) => l.id !== id);
    if (selectedLayerId === id) setSelectedLayerId(null);
    pushHistory(nextLayers);
  };

  // Duplicate layer
  const duplicateLayer = (id) => {
    const target = designLayers.find((l) => l.id === id);
    if (!target) return;
    const clone = {
      ...target,
      id: `layer-${Date.now()}`,
      name: `${target.name || 'Layer'} (Copy)`,
      position: {
        x: Math.min(85, (target.position?.x || 50) + 5),
        y: Math.min(85, (target.position?.y || 50) + 5)
      }
    };
    const nextLayers = [...designLayers, clone];
    setSelectedLayerId(clone.id);
    pushHistory(nextLayers);
  };

  // Layer reordering
  const moveLayerOrder = (id, direction) => {
    const idx = designLayers.findIndex((l) => l.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
    if (targetIdx < 0 || targetIdx >= designLayers.length) return;
    const copy = [...designLayers];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    pushHistory(copy);
  };

  // Boundary checking on drag / position
  const handlePositionChange = (id, newX, newY) => {
    // Keep within printable area bounds (5% to 95%)
    let clampedX = Math.max(8, Math.min(92, newX));
    let clampedY = Math.max(8, Math.min(92, newY));

    if (newX < 10 || newX > 90 || newY < 10 || newY > 90) {
      setBoundaryWarning('Design object is near printable area boundary.');
    } else {
      setBoundaryWarning(null);
    }

    updateLayer(id, { position: { x: clampedX, y: clampedY } });
  };

  // Photo Upload Handler with safe Canvas downscaling (Section 2)
  const handlePhotoUpload = (e) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // 5 MB max constraint
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image file exceeds maximum allowed size of 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Downscale safely to max 400x400 to keep base64 lightweight and safe
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

        addLayer({
          type: 'photo',
          asset: compressedDataUrl,
          name: file.name.substring(0, 20),
          effect: 'original',
          scale: 0.9,
          position: { x: 50, y: 50 }
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Drawing Canvas setup & handlers
  useEffect(() => {
    if (activeTab === 'draw' && drawCanvasRef.current) {
      const canvas = drawCanvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [activeTab]);

  const startDrawing = (e) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = drawTool === 'eraser' ? '#FFFFFF' : drawColor;
    ctx.lineWidth = drawTool === 'brush' ? drawSize * 2 : drawSize;
    setIsDrawing(true);
  };

  const drawMove = (e) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const newHist = drawHistory.slice(0, drawHistoryStep + 1);
    newHist.push(dataUrl);
    setDrawHistory(newHist);
    setDrawHistoryStep(newHist.length - 1);
  };

  const clearDrawingCanvas = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawHistory([]);
    setDrawHistoryStep(0);
  };

  const applyDrawingToGarment = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    addLayer({
      type: 'drawing',
      asset: dataUrl,
      name: 'Custom Drawing',
      scale: 0.9,
      position: { x: 50, y: 50 }
    });
    clearDrawingCanvas();
    setActiveTab('layers');
  };

  // AI Assistant Submit Handler (Section 12 & Phase 13)
  const handleAiAssistantSubmit = (e) => {
    e.preventDefault();
    setAiFeedback(null);
    if (!aiPrompt.trim()) return;

    const res = parseNaturalDesignPrompt(aiPrompt, garmentCategory);
    setAiFeedback(res.message);

    // Apply color, fit, fabric to parent garment customization state
    if (res.success && onApplyGarmentSettings) {
      onApplyGarmentSettings({
        color: res.garmentColor,
        fit: res.fit,
        fabric: res.fabric
      });
    }

    if (res.success && res.layers.length > 0) {
      pushHistory([...designLayers, ...res.layers]);
      if (res.layers[0]?.printArea) {
        setActiveAreaId(res.layers[0].printArea);
      }
      setSelectedLayerId(res.layers[0]?.id || null);
    }
  };

  // 360° Multi-Angle Image resolver (Phase 11)
  const currentAngleImage = useMemo(() => {
    if (!product) return null;
    const imgs = product.images || [];
    if (activeAngle === 'back') {
      return imgs.find(img => typeof img === 'string' && (img.includes('_back') || img.includes('back'))) || imgs[1] || product.image;
    }
    if (activeAngle === 'side') {
      return imgs.find(img => typeof img === 'string' && (img.includes('_side') || img.includes('side'))) || imgs[2] || imgs[1] || product.image;
    }
    if (activeAngle === 'other_side') {
      return imgs.find(img => typeof img === 'string' && (img.includes('_side') || img.includes('detail'))) || imgs[3] || imgs[2] || product.image;
    }
    return imgs[0] || product.image || product.thumbnail || getProductImage(product);
  }, [product, activeAngle]);

  // Filtered graphics list
  const filteredGraphics = useMemo(() => {
    return GRAPHICS_LIBRARY.filter((item) => {
      const matchSearch =
        !graphicsSearch ||
        item.name.toLowerCase().includes(graphicsSearch.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(graphicsSearch.toLowerCase()));
      const matchCat = graphicsCategory === 'All' || item.category === graphicsCategory;
      return matchSearch && matchCat;
    });
  }, [graphicsSearch, graphicsCategory]);

  const activeColorHex = selectedColor?.hex || selectedColor?.value || '#1F2937';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ── Studio Header & Sub-Bar ────────────────────────────────────────── */}
      <div className="bg-neutral-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-accent/20 border border-brand-accent/40 text-brand-accent text-[10px] font-extrabold uppercase tracking-wider">
                🎨 Creative Studio
              </span>
              <span className="text-xs text-neutral-400">Advanced Clothing Designer</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
              Create Your Own Clothing
            </h3>
          </div>

          {/* Quick Undo / Redo & Clear */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Undo"
            >
              ↶ Undo
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Redo"
            >
              ↷ Redo
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Clear all design elements on this garment?')) {
                  pushHistory([]);
                  setSelectedLayerId(null);
                }
              }}
              disabled={designLayers.length === 0}
              className="px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Clear Canvas
            </button>
          </div>
        </div>

        {/* ── Garment Print Areas Selector (Section 10) ────────────────────────── */}
        <div className="pt-3 border-t border-neutral-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-1">
            Print Area:
          </span>
          {printAreas.map((area) => {
            const count = designLayers.filter((l) => (l.printArea || 'front') === area.id).length;
            const isCurrent = activeAreaId === area.id;

            return (
              <button
                key={area.id}
                type="button"
                onClick={() => {
                  setActiveAreaId(area.id);
                  setSelectedLayerId(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-brand-accent text-white shadow-xs'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                }`}
              >
                <span>{area.label}</span>
                {count > 0 && (
                  <span
                    className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-black ${
                      isCurrent ? 'bg-white text-brand-dark' : 'bg-brand-accent text-white'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Studio Main Workspace (2-Column) ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Tool Palette Tabs & Configuration Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 shadow-sm space-y-4">
          {/* Tool Navigation Tabs */}
          <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5 pb-3 border-b border-neutral-200">
            {[
              { id: 'graphics', label: 'Graphics', icon: '🦁' },
              { id: 'photo', label: 'Photo', icon: '📸' },
              { id: 'draw', label: 'Draw', icon: '✏️' },
              { id: 'patterns', label: 'Patterns', icon: '🏁' },
              { id: 'text', label: 'Text', icon: '🔤' },
              { id: 'patches', label: 'Patches', icon: '🛡️' },
              { id: 'layers', label: `Layers (${designLayers.length})`, icon: '📑' },
              { id: 'ai', label: 'AI Design', icon: '✨' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`p-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                  activeTab === tab.id
                    ? 'bg-brand-dark text-white shadow-xs'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="truncate w-full text-center text-[11px]">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── TAB 1: GRAPHICS & SYMBOLS (Section 1 & 13) ─────────────────────── */}
          {activeTab === 'graphics' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Search graphics (e.g. lion, tiger, eagle, flame)..."
                  value={graphicsSearch}
                  onChange={(e) => setGraphicsSearch(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                />
                <div className="flex flex-wrap gap-1">
                  {['All', 'Animals', 'Nature', 'Symbols', 'Streetwear', 'Sports', 'Music', 'Travel', 'Minimal'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setGraphicsCategory(cat)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
                        graphicsCategory === cat
                          ? 'bg-neutral-800 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Graphics Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {filteredGraphics.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      addLayer({
                        type: 'graphic',
                        asset: item.id,
                        name: item.name,
                        color: activeColorHex === '#FFFFFF' ? '#1F2937' : '#D97706',
                        printStyle: 'gold'
                      });
                    }}
                    className="p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-white hover:border-brand-accent hover:shadow-sm transition flex flex-col items-center justify-between group"
                    title={`Add ${item.name}`}
                  >
                    <div
                      className="w-10 h-10 text-neutral-800 group-hover:text-brand-accent transition-colors flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: item.svg }}
                    />
                    <span className="text-[10px] font-semibold text-neutral-700 truncate w-full text-center mt-1">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 2: PHOTO PRINTING (Section 2 & 3) ─────────────────────────── */}
          {activeTab === 'photo' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border-2 border-dashed border-neutral-300 hover:border-brand-accent transition text-center bg-neutral-50 space-y-2">
                <span className="text-2xl block">📸</span>
                <div className="text-xs font-bold text-neutral-800">
                  Select Photo from Device
                </div>
                <p className="text-[10px] text-neutral-500">
                  Supported formats: PNG, JPG, JPEG, WEBP (Max 5 MB)
                </p>
                <label className="inline-block mt-1 px-4 py-1.5 rounded-lg bg-brand-dark hover:bg-black text-white text-xs font-bold cursor-pointer transition shadow-xs">
                  Choose Photo
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {photoError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  ⚠️ {photoError}
                </div>
              )}

              {/* Photo Image Effects for active selected photo */}
              {activeLayer && activeLayer.type === 'photo' ? (
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2.5">
                  <div className="text-xs font-bold text-neutral-800">
                    Image Effects ({activeLayer.name})
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {IMAGE_EFFECTS.map((eff) => (
                      <button
                        key={eff.id}
                        type="button"
                        onClick={() => updateLayer(activeLayer.id, { effect: eff.id })}
                        className={`p-1.5 rounded-lg text-[10px] font-semibold text-center transition border ${
                          activeLayer.effect === eff.id
                            ? 'bg-brand-dark text-white border-brand-dark'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        {eff.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-neutral-500 italic">
                  Upload a photo to position it on your garment and apply filters (Black & White, Vintage, High Contrast, etc.).
                </p>
              )}
            </div>
          )}

          {/* ── TAB 3: DRAW YOUR OWN DESIGN (Section 4) ───────────────────────── */}
          {activeTab === 'draw' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-700">Drawing Studio</span>
                <span className="text-[10px] text-neutral-500">Freehand signature & artwork</span>
              </div>

              {/* Canvas controls */}
              <div className="flex items-center gap-2 flex-wrap">
                {['pen', 'brush', 'eraser'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDrawTool(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition ${
                      drawTool === t ? 'bg-brand-dark text-white' : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}

                <input
                  type="color"
                  value={drawColor}
                  onChange={(e) => setDrawColor(e.target.value)}
                  className="w-7 h-7 rounded border border-neutral-300 cursor-pointer"
                  title="Drawing color"
                />

                <div className="flex items-center gap-1 text-[11px] text-neutral-600">
                  <span>Size:</span>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={drawSize}
                    onChange={(e) => setDrawSize(parseInt(e.target.value))}
                    className="w-16"
                  />
                </div>
              </div>

              {/* Interactive Canvas */}
              <div className="border border-neutral-300 rounded-xl overflow-hidden bg-white shadow-inner">
                <canvas
                  ref={drawCanvasRef}
                  width={300}
                  height={180}
                  onMouseDown={startDrawing}
                  onMouseMove={drawMove}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full h-44 cursor-crosshair block"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={clearDrawingCanvas}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Clear Drawing
                </button>
                <button
                  type="button"
                  onClick={applyDrawingToGarment}
                  className="px-3.5 py-1.5 rounded-lg bg-brand-accent hover:bg-brand-accentHover text-white text-xs font-bold transition shadow-xs"
                >
                  Apply to Garment &rarr;
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 4: PATTERNS (Section 5) ──────────────────────────────────── */}
          {activeTab === 'patterns' && (
            <div className="space-y-4">
              <div className="text-xs text-neutral-500">
                Choose an original pattern clipped to the garment print area.
              </div>
              <div className="grid grid-cols-2 gap-3">
                {PATTERNS_LIBRARY.map((pat) => (
                  <button
                    key={pat.id}
                    type="button"
                    onClick={() => {
                      addLayer({
                        type: 'pattern',
                        asset: pat.id,
                        name: pat.name,
                        color: activeColorHex === '#FFFFFF' ? '#000000' : '#FFFFFF',
                        scale: 1,
                        opacity: 0.75
                      });
                    }}
                    className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-white hover:border-brand-accent hover:shadow-xs transition text-left group"
                  >
                    <div
                      className="w-full h-12 rounded-lg border border-neutral-200 mb-2"
                      style={pat.cssPattern('#333333', 0.8, 0.85)}
                    />
                    <div className="text-xs font-bold text-neutral-800 group-hover:text-brand-accent transition-colors">
                      {pat.name}
                    </div>
                    <div className="text-[10px] text-neutral-400">{pat.category}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 5: ADVANCED TEXT (Section 6) ──────────────────────────────── */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 block">Text Content</label>
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Enter custom slogan or name..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/20 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-neutral-600 block mb-1">Font Family</label>
                  <select
                    value={textFont}
                    onChange={(e) => setTextFont(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-neutral-300 bg-neutral-50 text-xs"
                  >
                    <option value="Montserrat">Montserrat (Clean)</option>
                    <option value="Playfair Display">Playfair (Serif / Luxury)</option>
                    <option value="Bebas Neue">Bebas Neue (Bold Street)</option>
                    <option value="Impact">Impact (Athletic)</option>
                    <option value="Courier New">Courier (Technical)</option>
                    <option value="Brush Script MT">Brush Script (Calligraphy)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-600 block mb-1">Color Effect</label>
                  <select
                    value={textStyle}
                    onChange={(e) => setTextStyle(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-neutral-300 bg-neutral-50 text-xs"
                  >
                    <option value="solid">Solid Color</option>
                    <option value="gold">Metallic Gold</option>
                    <option value="silver">Silver Foil</option>
                    <option value="neon">Neon Glow</option>
                    <option value="embroidery">Embroidery Stitch</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={textOutline}
                    onChange={(e) => setTextOutline(e.target.checked)}
                    className="rounded text-brand-dark"
                  />
                  <span>Outline</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={textShadow}
                    onChange={(e) => setTextShadow(e.target.checked)}
                    className="rounded text-brand-dark"
                  />
                  <span>Shadow</span>
                </label>
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-[11px] text-neutral-500">Color:</span>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-6 h-6 rounded border border-neutral-300 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!newText.trim()) return;
                  addLayer({
                    type: 'text',
                    text: newText.trim(),
                    font: textFont,
                    printStyle: textStyle,
                    color: textStyle === 'gold' ? '#D97706' : textStyle === 'silver' ? '#64748B' : textColor,
                    outline: textOutline,
                    shadow: textShadow,
                    scale: 0.75,
                    position: { x: 50, y: 50 }
                  });
                }}
                className="w-full py-2 bg-brand-dark hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                + Add Text to {printAreas.find((a) => a.id === activeAreaId)?.label || 'Area'}
              </button>
            </div>
          )}

          {/* ── TAB 6: PATCHES & BADGES (Section 8) ──────────────────────────── */}
          {activeTab === 'patches' && (
            <div className="space-y-4">
              <div className="text-xs text-neutral-500">
                Official woven crests, monogram emblems, and varsity insignias.
              </div>
              <div className="grid grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {PATCHES_LIBRARY.map((patch) => (
                  <button
                    key={patch.id}
                    type="button"
                    onClick={() => {
                      addLayer({
                        type: 'patch',
                        asset: patch.id,
                        name: patch.name,
                        color: '#2563EB',
                        scale: 0.85
                      });
                    }}
                    className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-white hover:border-brand-accent hover:shadow-xs transition flex flex-col items-center justify-between group"
                    title={`Add ${patch.name}`}
                  >
                    <div
                      className="w-12 h-12 text-blue-600 group-hover:scale-105 transition-transform flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: patch.svg }}
                    />
                    <span className="text-[10px] font-semibold text-neutral-700 truncate w-full text-center mt-1">
                      {patch.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 7: DESIGN LAYERS LIST (Section 9) ────────────────────────── */}
          {activeTab === 'layers' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-800">
                  Design Layers ({designLayers.length})
                </span>
                <span className="text-[10px] text-neutral-500">Front to Back hierarchy</span>
              </div>

              {designLayers.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-400 bg-neutral-50 rounded-xl border border-neutral-200">
                  No elements added yet. Add graphics, text, photos or patches!
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {[...designLayers].reverse().map((layer, revIdx) => {
                    const idx = designLayers.length - 1 - revIdx;
                    const isSelected = selectedLayerId === layer.id;

                    return (
                      <div
                        key={layer.id}
                        onClick={() => {
                          setSelectedLayerId(layer.id);
                          if (layer.printArea) setActiveAreaId(layer.printArea);
                        }}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition cursor-pointer ${
                          isSelected
                            ? 'border-brand-accent bg-brand-accentLight/40 ring-1 ring-brand-accent'
                            : 'border-neutral-200 bg-white hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-neutral-400 font-mono text-[10px]">{idx + 1}</span>
                          <span className="text-sm">
                            {layer.type === 'graphic'
                              ? '🦁'
                              : layer.type === 'text'
                              ? '🔤'
                              : layer.type === 'photo'
                              ? '📸'
                              : layer.type === 'drawing'
                              ? '✏️'
                              : layer.type === 'pattern'
                              ? '🏁'
                              : '🛡️'}
                          </span>
                          <div className="min-w-0">
                            <div className="font-bold text-neutral-800 truncate">
                              {layer.name || (layer.type === 'text' ? `"${layer.text}"` : layer.type)}
                            </div>
                            <div className="text-[10px] text-neutral-400 uppercase">
                              {layer.printArea || 'front'} &bull; {layer.printStyle || 'solid'}
                            </div>
                          </div>
                        </div>

                        {/* Layer Actions */}
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => moveLayerOrder(layer.id, 'up')}
                            className="p-1 text-neutral-500 hover:text-neutral-800 text-xs"
                            title="Move forward"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => moveLayerOrder(layer.id, 'down')}
                            className="p-1 text-neutral-500 hover:text-neutral-800 text-xs"
                            title="Move backward"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicateLayer(layer.id)}
                            className="p-1 text-neutral-500 hover:text-neutral-800 text-xs"
                            title="Duplicate layer"
                          >
                            📋
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteLayer(layer.id)}
                            className="p-1 text-red-500 hover:text-red-700 text-xs"
                            title="Delete layer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 8: AI ASSISTANT & TEMPLATES (Section 11 & 12) ──────────────── */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              {/* Natural Language Prompt Form */}
              <form onSubmit={handleAiAssistantSubmit} className="space-y-2">
                <label className="text-xs font-bold text-neutral-800 block">
                  Describe Your Design (AI Assistant)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. 'Create a black lion design with gold text on the back'..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-brand-dark hover:bg-black text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>✨</span> Generate Design Layers
                </button>
              </form>

              {aiFeedback && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                  {aiFeedback}
                </div>
              )}

              {/* Starter Templates (Section 11) */}
              <div className="pt-2 border-t border-neutral-100 space-y-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Design Templates (Starting Points)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {DESIGN_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => {
                        const newLayers = tmpl.layers.map((l, i) => ({
                          ...l,
                          id: `tmpl-${Date.now()}-${i}`,
                          printArea: l.printArea || activeAreaId
                        }));
                        pushHistory(newLayers);
                        if (newLayers[0]?.id) setSelectedLayerId(newLayers[0].id);
                      }}
                      className="p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-white hover:border-brand-accent transition text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-800">{tmpl.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700 font-bold">
                          {tmpl.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1 line-clamp-2">
                        {tmpl.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Active Element Property Inspector ─────────────────────────────── */}
          {activeLayer && (
            <div className="pt-3 border-t border-neutral-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-brand-dark">
                  Selected: {activeLayer.name || activeLayer.type}
                </span>
                <button
                  type="button"
                  onClick={() => deleteLayer(activeLayer.id)}
                  className="text-red-600 hover:underline font-bold text-[11px]"
                >
                  Delete Layer ✕
                </button>
              </div>

              {/* Sliders: Scale, Rotation, Opacity */}
              <div className="grid grid-cols-3 gap-2 text-[11px] text-neutral-600">
                <div>
                  <label className="block font-semibold mb-0.5">Scale ({activeLayer.scale.toFixed(2)}x)</label>
                  <input
                    type="range"
                    min="0.3"
                    max="1.8"
                    step="0.05"
                    value={activeLayer.scale}
                    onChange={(e) => updateLayer(activeLayer.id, { scale: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-0.5">Rotate ({activeLayer.rotation || 0}°)</label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="5"
                    value={activeLayer.rotation || 0}
                    onChange={(e) => updateLayer(activeLayer.id, { rotation: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-0.5">Opacity ({Math.round((activeLayer.opacity || 1) * 100)}%)</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={activeLayer.opacity ?? 1}
                    onChange={(e) => updateLayer(activeLayer.id, { opacity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Print Style & Color if applicable */}
              {activeLayer.type !== 'photo' && activeLayer.type !== 'drawing' && (
                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-neutral-500 font-semibold">Finish:</span>
                    <select
                      value={activeLayer.printStyle || 'solid'}
                      onChange={(e) => updateLayer(activeLayer.id, { printStyle: e.target.value })}
                      className="px-2 py-1 rounded-lg border border-neutral-300 text-xs font-semibold bg-white"
                    >
                      {PRINT_STYLE_EFFECTS.map((eff) => (
                        <option key={eff.id} value={eff.id}>
                          {eff.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-neutral-500 font-semibold">Color:</span>
                    <input
                      type="color"
                      value={activeLayer.color || '#1F2937'}
                      onChange={(e) => updateLayer(activeLayer.id, { color: e.target.value })}
                      className="w-6 h-6 rounded border border-neutral-300 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive 2D Garment Design Workspace (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Interactive Garment Canvas
              </span>
              <h4 className="text-sm font-extrabold text-brand-dark">
                {product.name} &bull; {printAreas.find((a) => a.id === activeAreaId)?.label || 'Front'}
              </h4>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
              {currentAreaLayers.length} element{currentAreaLayers.length === 1 ? '' : 's'} placed
            </span>
          </div>

          {/* Boundary Alert Banner (Section 15) */}
          {boundaryWarning && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-between">
              <span>⚠️ {boundaryWarning}</span>
              <button
                type="button"
                onClick={() => setBoundaryWarning(null)}
                className="text-amber-800 text-[10px] ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* ── 360° Multi-Angle View Controls (Phase 11) ────────────────────── */}
          <div className="flex flex-wrap items-center justify-between bg-neutral-100 p-2 rounded-xl border border-neutral-200 gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-neutral-800">🔄 360° Multi-Angle View:</span>
              <span className="text-[11px] font-semibold text-neutral-500 capitalize">
                {activeAngle.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[
                { id: 'front', label: 'Front (0°)', area: 'front' },
                { id: 'side', label: 'Side (90°)', area: 'sleeve' },
                { id: 'back', label: 'Back (180°)', area: 'back' },
                { id: 'other_side', label: 'Other Side (270°)', area: 'sleeve' }
              ].map((ang) => (
                <button
                  key={ang.id}
                  type="button"
                  onClick={() => {
                    setActiveAngle(ang.id);
                    const matched = printAreas.find(a => a.id.includes(ang.area));
                    if (matched) setActiveAreaId(matched.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    activeAngle === ang.id
                      ? 'bg-neutral-900 text-amber-300 shadow-2xs'
                      : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200'
                  }`}
                >
                  {ang.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── 2D Realistic Garment Canvas Workspace ─────── */}
          <div className="relative mx-auto max-w-md aspect-[4/5] bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden shadow-inner flex items-center justify-center p-4 select-none">
            {/* Real Garment Image with Authentic Color Variants & Garment Recoloring */}
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <ProductImage
                productId={product?.id}
                src={currentAngleImage}
                alt={product?.name || 'Garment preview'}
                fallbackCategory={garmentCategory}
                category={garmentCategory}
                tintColor={activeColorHex}
                colorImages={product?.colorImages}
                selectedColor={selectedColor}
                aspectRatio="aspect-[4/5]"
                className="w-full h-full object-contain"
                containerClassName="w-full h-full bg-transparent"
              />
            </div>

            {/* ── Printable Design Area Bounding Box ──────────────────────────── */}
            <div
              className="absolute border border-dashed border-brand-accent/50 rounded-xl pointer-events-none transition-all"
              style={{
                width: '60%',
                height: '62%',
                top: '22%',
                left: '20%'
              }}
            >
              <span className="absolute -top-4 right-1 text-[9px] uppercase font-bold text-brand-accent bg-white/90 px-1.5 py-0.5 rounded shadow-2xs">
                Print Area ({printAreas.find((a) => a.id === activeAreaId)?.label})
              </span>
            </div>

            {/* ── Render Layers Placed in Current Print Area ──────────────────── */}
            <div
              className="absolute overflow-hidden"
              style={{
                width: '60%',
                height: '62%',
                top: '22%',
                left: '20%'
              }}
            >
              {currentAreaLayers.map((layer) => {
                const isSelected = selectedLayerId === layer.id;
                const pos = layer.position || { x: 50, y: 50 };
                const scale = layer.scale || 1;
                const rot = layer.rotation || 0;
                const opacity = layer.opacity ?? 1;

                // Resolved Print Style Effect
                const effect = PRINT_STYLE_EFFECTS.find((p) => p.id === layer.printStyle) || PRINT_STYLE_EFFECTS[0];

                return (
                  <div
                    key={layer.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLayerId(layer.id);
                    }}
                    style={{
                      position: 'absolute',
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`,
                      opacity: opacity,
                      zIndex: isSelected ? 30 : 10,
                      cursor: 'move'
                    }}
                    className={`transition-shadow p-1 rounded group ${
                      isSelected
                        ? 'ring-2 ring-brand-accent ring-offset-2 ring-offset-transparent shadow-lg bg-black/5'
                        : 'hover:ring-1 hover:ring-brand-accent/50'
                    }`}
                  >
                    {/* Position Controller Handles for Selected Layer */}
                    {isSelected && (
                      <div className="absolute -top-7 -right-2 flex items-center gap-1 z-40 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded-md shadow-xs border border-neutral-300">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLayer(layer.id, { scale: Math.min(1.8, scale + 0.1) });
                          }}
                          className="text-[10px] font-bold text-neutral-700 hover:text-black px-1"
                          title="Increase size"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLayer(layer.id, { scale: Math.max(0.3, scale - 0.1) });
                          }}
                          className="text-[10px] font-bold text-neutral-700 hover:text-black px-1"
                          title="Decrease size"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLayer(layer.id);
                          }}
                          className="text-[10px] font-bold text-red-600 hover:text-red-800 px-1 ml-1"
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* Move Pad in Center when Selected */}
                    {isSelected && (
                      <div
                        className="absolute inset-0 z-30"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const startX = e.clientX;
                          const startY = e.clientY;
                          const initialPos = { ...pos };

                          const onMouseMove = (moveEvt) => {
                            const deltaX = ((moveEvt.clientX - startX) / 200) * 100;
                            const deltaY = ((moveEvt.clientY - startY) / 200) * 100;
                            handlePositionChange(layer.id, initialPos.x + deltaX, initialPos.y + deltaY);
                          };

                          const onMouseUp = () => {
                            window.removeEventListener('mousemove', onMouseMove);
                            window.removeEventListener('mouseup', onMouseUp);
                          };

                          window.addEventListener('mousemove', onMouseMove);
                          window.addEventListener('mouseup', onMouseUp);
                        }}
                      />
                    )}

                    {/* LAYER CONTENT: GRAPHIC */}
                    {layer.type === 'graphic' && (
                      <div
                        className="w-24 h-24 flex items-center justify-center pointer-events-none"
                        style={{
                          color: layer.color || '#D97706',
                          ...effect.cssStyle(layer.color)
                        }}
                        dangerouslySetInnerHTML={{
                          __html: GRAPHICS_LIBRARY.find((g) => g.id === layer.asset)?.svg || ''
                        }}
                      />
                    )}

                    {/* LAYER CONTENT: PHOTO */}
                    {layer.type === 'photo' && (
                      <div className="w-28 h-28 rounded-lg overflow-hidden border border-neutral-300 shadow-sm pointer-events-none bg-neutral-200">
                        <img
                          src={layer.asset}
                          alt="Customer Print"
                          style={{
                            filter: IMAGE_EFFECTS.find((eff) => eff.id === layer.effect)?.filter || 'none'
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* LAYER CONTENT: DRAWING */}
                    {layer.type === 'drawing' && (
                      <div className="w-28 h-28 pointer-events-none">
                        <img src={layer.asset} alt="Custom Drawing" className="w-full h-full object-contain" />
                      </div>
                    )}

                    {/* LAYER CONTENT: PATTERN */}
                    {layer.type === 'pattern' && (
                      <div
                        className="w-36 h-36 rounded-xl border border-neutral-300 pointer-events-none"
                        style={
                          PATTERNS_LIBRARY.find((p) => p.id === layer.asset)?.cssPattern(
                            layer.color || '#000000',
                            1,
                            layer.opacity || 0.8
                          ) || {}
                        }
                      />
                    )}

                    {/* LAYER CONTENT: TEXT */}
                    {layer.type === 'text' && (
                      <div
                        className="text-center font-black whitespace-nowrap pointer-events-none select-none tracking-wide text-base px-2 py-1"
                        style={{
                          fontFamily: layer.font || 'Montserrat',
                          color: layer.color || '#1F2937',
                          textShadow: layer.shadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
                          WebkitTextStroke: layer.outline ? '1px #000000' : 'none',
                          ...effect.cssStyle(layer.color)
                        }}
                      >
                        {layer.text}
                      </div>
                    )}

                    {/* LAYER CONTENT: PATCH */}
                    {layer.type === 'patch' && (
                      <div
                        className="w-20 h-20 flex items-center justify-center pointer-events-none"
                        style={{ color: layer.color || '#2563EB' }}
                        dangerouslySetInnerHTML={{
                          __html: PATCHES_LIBRARY.find((p) => p.id === layer.asset)?.svg || ''
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legal / Studio Disclaimer (Section 7) */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
            <span className="text-[11px] text-neutral-500 font-medium italic">
              &ldquo;Preview only – final print may vary slightly.&rdquo;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
