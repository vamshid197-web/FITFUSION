import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
import { getProduct3DModel, getFabricPbr } from '../../data/clothing3DRegistry.js';
import ProductImage from '../common/ProductImage.jsx';
import { getProductImage } from '../../data/mockProducts.js';

/**
 * CustomizationStudioViewer3D
 * Genuine 3D Garment Viewer powered by Three.js & WebGL.
 * Loads category-accurate GLB garment models (T-Shirt, Hoodie, Shirt, Jacket, Dress, Kurta, Chinos/Jeans)
 * with 360° orbital rotation, realistic lighting, PBR fabric simulation, and surface Decal projection.
 *
 * If a selected product has no compatible 3D model, displays "3D model not available for this product yet."
 * Never silently defaults to a T-shirt for non-T-shirt products.
 */
export default function CustomizationStudioViewer3D({
  product,
  selectedColor,
  selectedFabric,
  designLayers = [],
  activePlacement = 'front', // 'front' | 'back' | 'left_sleeve' | 'right_sleeve'
  customText = '',
  textFont = 'Montserrat',
  textColor = '#FFFFFF',
  uploadedImage = null,
  aiGeneratedDesign = null,
  autoRotateDefault = false,
  className = ''
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Engine references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const currentModelRootRef = useRef(null);
  const garmentMeshRef = useRef(null);
  const garmentMeshesListRef = useRef([]);
  const decalMeshesRef = useRef([]);
  const animFrameIdRef = useRef(null);

  // Camera tween target
  const targetCamPosRef = useRef(null);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isModelAvailable, setIsModelAvailable] = useState(true);
  const [activeModelMeta, setActiveModelMeta] = useState(null);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotateDefault);
  const [activeAngleView, setActiveAngleView] = useState('front');

  // Resolve garment color hex
  const colorHex = typeof selectedColor === 'string'
    ? selectedColor
    : selectedColor?.hex || selectedColor?.value || '#FFFFFF';

  // ── 1. Initialize Three.js Scene & Lifecycle ─────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 550;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Dark luxury studio backdrop
    scene.background = new THREE.Color(0x0B0F19);

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0.05, 1.35);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 0.65;
    controls.maxDistance = 2.6;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI / 2 + 0.18;
    controls.target.set(0, 0, 0);
    controls.autoRotate = autoRotateDefault;
    controls.autoRotateSpeed = 2.2;
    controlsRef.current = controls;

    // ── Lighting Setup ───────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffef5, 1.4);
    keyLight.position.set(1.5, 2.5, 2.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0008;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x7dd3fc, 0.65);
    fillLight.position.set(-2.0, 1.2, 1.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xa78bfa, 0.95);
    rimLight.position.set(0, 2.0, -2.0);
    scene.add(rimLight);

    // Studio Ground Floor Shadow Plate
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.52;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // ── Animation Loop ───────────────────────────────────────────────────────
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (targetCamPosRef.current && cameraRef.current) {
        cameraRef.current.position.lerp(targetCamPosRef.current, 0.08);
        if (cameraRef.current.position.distanceTo(targetCamPosRef.current) < 0.01) {
          cameraRef.current.position.copy(targetCamPosRef.current);
          targetCamPosRef.current = null;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // ── Resize Observer ──────────────────────────────────────────────────────
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // ── 2. Load and Switch 3D Model on Product Change ─────────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Check centralized 3D garment registry
    const modelInfo = getProduct3DModel(product);
    setActiveModelMeta(modelInfo);

    // Clean up previous model and decals
    if (currentModelRootRef.current) {
      scene.remove(currentModelRootRef.current);
      currentModelRootRef.current.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
            else child.material.dispose();
          }
        }
      });
      currentModelRootRef.current = null;
    }

    decalMeshesRef.current.forEach((d) => {
      scene.remove(d);
      if (d.geometry) d.geometry.dispose();
      if (d.material) d.material.dispose();
    });
    decalMeshesRef.current = [];
    garmentMeshRef.current = null;
    garmentMeshesListRef.current = [];

    // Case A: Product has NO compatible 3D model
    if (!modelInfo.has3DModel || !modelInfo.model3D) {
      setIsModelAvailable(false);
      setIsLoading(false);
      setLoadError(null);
      return;
    }

    // Case B: Product has verified 3D model
    setIsModelAvailable(true);
    setIsLoading(true);
    setLoadError(null);

    const loader = new GLTFLoader();
    const pbr = getFabricPbr(selectedFabric);

    loader.load(
      modelInfo.model3D,
      (gltf) => {
        // Double check this is still the active product
        if (!sceneRef.current) return;

        const root = gltf.scene || gltf.scenes[0];
        let primaryMesh = null;
        const meshes = [];

        root.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            meshes.push(child);
            if (!primaryMesh) primaryMesh = child;

            // Clone and apply PBR material
            if (child.material) {
              child.material = child.material.clone();
              child.material.side = THREE.DoubleSide;
              child.material.roughness = pbr.roughness;
              child.material.metalness = pbr.metalness;
              child.material.color.set(colorHex);
              child.material.needsUpdate = true;
            }
          }
        });

        // Dynamic Bounding Box Framing: Scale and Center garment accurately in orbit center
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const targetScale = 0.92 / maxDim;

        root.scale.setScalar(targetScale);
        root.position.x = -center.x * targetScale;
        root.position.y = -center.y * targetScale;
        root.position.z = -center.z * targetScale;

        scene.add(root);
        currentModelRootRef.current = root;
        garmentMeshRef.current = primaryMesh;
        garmentMeshesListRef.current = meshes;
        setIsLoading(false);

        // Rebuild decals if model supports them
        if (modelInfo.supportedFeatures?.decals) {
          rebuildDecals();
        }
      },
      undefined,
      (err) => {
        console.error('[CustomizationStudioViewer3D] Failed to load 3D model:', err);
        setLoadError(`Unable to load 3D asset for ${product?.name || 'garment'}.`);
        setIsLoading(false);
      }
    );
  }, [product?.id, product?.category]);

  // ── 3. Update Garment Material Color & Fabric ─────────────────────────────
  useEffect(() => {
    const meshes = garmentMeshesListRef.current.length > 0
      ? garmentMeshesListRef.current
      : (garmentMeshRef.current ? [garmentMeshRef.current] : []);
    if (meshes.length === 0) return;

    const pbr = getFabricPbr(selectedFabric);

    meshes.forEach((mesh) => {
      if (mesh.material) {
        mesh.material.color.set(colorHex);
        mesh.material.roughness = pbr.roughness;
        mesh.material.metalness = pbr.metalness;
        mesh.material.needsUpdate = true;
      }
    });
  }, [colorHex, selectedFabric]);

  // ── 4. Toggle Auto-Rotate ────────────────────────────────────────────────
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotating;
    }
  }, [isAutoRotating]);

  // ── 5. Decal & Surface Texture Projection ────────────────────────────────
  const rebuildDecals = useCallback(() => {
    const scene = sceneRef.current;
    const mesh = garmentMeshRef.current;
    if (!scene || !mesh || !activeModelMeta?.supportedFeatures?.decals) return;

    // Remove existing decals
    decalMeshesRef.current.forEach((d) => {
      scene.remove(d);
      if (d.geometry) d.geometry.dispose();
      if (d.material) d.material.dispose();
    });
    decalMeshesRef.current = [];

    const attachCanvasDecal = (canvasSource, placement = 'front', scale = 1.0) => {
      const texture = new THREE.CanvasTexture(canvasSource);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;

      const decalMat = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        roughness: 0.8,
        metalness: 0.0
      });

      let position = new THREE.Vector3(0, 0.02, 0.138);
      let orientation = new THREE.Euler(0, 0, 0);
      let size = new THREE.Vector3(0.20 * scale, 0.20 * scale, 0.18);

      if (placement === 'back') {
        position = new THREE.Vector3(0, 0.02, -0.138);
        orientation = new THREE.Euler(0, Math.PI, 0);
        size = new THREE.Vector3(0.24 * scale, 0.24 * scale, 0.18);
      } else if (placement === 'left_sleeve') {
        position = new THREE.Vector3(-0.24, 0.10, 0.02);
        orientation = new THREE.Euler(0, -Math.PI / 2.2, 0);
        size = new THREE.Vector3(0.12 * scale, 0.12 * scale, 0.14);
      } else if (placement === 'right_sleeve') {
        position = new THREE.Vector3(0.24, 0.10, 0.02);
        orientation = new THREE.Euler(0, Math.PI / 2.2, 0);
        size = new THREE.Vector3(0.12 * scale, 0.12 * scale, 0.14);
      }

      try {
        const decalGeo = new DecalGeometry(mesh, position, orientation, size);
        const decalMesh = new THREE.Mesh(decalGeo, decalMat);
        scene.add(decalMesh);
        decalMeshesRef.current.push(decalMesh);
      } catch (err) {
        console.warn('[CustomizationStudioViewer3D] Decal projection error:', err);
      }
    };

    // A. Custom Text Decal
    if (customText && customText.trim()) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 512, 256);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = textColor || '#FFFFFF';
        ctx.font = `900 64px ${textFont || 'Montserrat'}, sans-serif`;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(customText.toUpperCase(), 256, 128);
        attachCanvasDecal(canvas, activePlacement, 1.1);
      }
    }

    // B. Uploaded Logo / Graphic Image
    if (uploadedImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 512, 512);
          ctx.drawImage(img, 32, 32, 448, 448);
          attachCanvasDecal(canvas, activePlacement, 1.0);
        }
      };
      img.src = uploadedImage;
    }

    // C. AI Generated Graphic Design
    if (aiGeneratedDesign && !uploadedImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 512, 512);
          ctx.drawImage(img, 24, 24, 464, 464);
          attachCanvasDecal(canvas, activePlacement, 1.15);
        }
      };
      img.src = aiGeneratedDesign;
    }
  }, [customText, textFont, textColor, uploadedImage, aiGeneratedDesign, activePlacement, activeModelMeta]);

  useEffect(() => {
    rebuildDecals();
  }, [rebuildDecals]);

  // ── 6. Camera View Snapping & Zoom ────────────────────────────────────────
  const setCameraView = (viewKey) => {
    setActiveAngleView(viewKey);
    setIsAutoRotating(false);

    let targetPos = new THREE.Vector3(0, 0.05, 1.35);
    if (viewKey === 'front') targetPos = new THREE.Vector3(0, 0.05, 1.35);
    else if (viewKey === 'back') targetPos = new THREE.Vector3(0, 0.05, -1.35);
    else if (viewKey === 'left') targetPos = new THREE.Vector3(-1.35, 0.05, 0);
    else if (viewKey === 'right') targetPos = new THREE.Vector3(1.35, 0.05, 0);
    else if (viewKey === 'reset') {
      targetPos = new THREE.Vector3(0, 0.05, 1.35);
      if (controlsRef.current) controlsRef.current.target.set(0, 0, 0);
    }

    targetCamPosRef.current = targetPos;
  };

  const handleZoomIn = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const target = controlsRef.current.target;
    const dir = new THREE.Vector3().subVectors(target, camera.position).normalize();
    const currentDist = camera.position.distanceTo(target);
    if (currentDist > controlsRef.current.minDistance + 0.1) {
      camera.position.addScaledVector(dir, 0.15);
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const target = controlsRef.current.target;
    const dir = new THREE.Vector3().subVectors(camera.position, target).normalize();
    const currentDist = camera.position.distanceTo(target);
    if (currentDist < controlsRef.current.maxDistance - 0.1) {
      camera.position.addScaledVector(dir, 0.15);
      controlsRef.current.update();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[480px] lg:min-h-[620px] bg-[#0B0F19] rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl select-none ${className}`}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing outline-none" />

      {/* Top Left: 3D Technical Specs Badge */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-md border border-neutral-700/60 shadow-lg text-xs font-semibold text-neutral-200">
          <span className={`w-2 h-2 rounded-full ${isModelAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span>{isModelAvailable ? (activeModelMeta?.modelName || 'Three.js 3D Garment') : '2D Product View'}</span>
          <span className="text-neutral-500">•</span>
          <span className="text-indigo-400 font-mono text-[11px]">{product?.category || 'Custom Apparel'}</span>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0B0F19]/90 backdrop-blur-md text-white">
          <div className="w-12 h-12 rounded-full border-3 border-indigo-500/20 border-t-indigo-500 animate-spin mb-3" />
          <p className="text-sm font-semibold tracking-wide text-neutral-200">Loading {product?.name || 'Garment'} 3D Model...</p>
          <span className="text-xs text-neutral-400 mt-1">Preparing PBR lighting & fabric shaders</span>
        </div>
      )}

      {/* Error Fallback */}
      {loadError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0B0F19]/95 p-6 text-center text-red-400">
          <svg className="w-10 h-10 mb-2 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-bold text-white mb-1">3D Model Asset Error</p>
          <p className="text-xs text-neutral-300 max-w-sm">{loadError}</p>
        </div>
      )}

      {/* Explicit Unsupported 3D Model Overlay */}
      {!isModelAvailable && !isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0B0F19]/90 backdrop-blur-md p-8 text-center space-y-4">
          <div className="relative w-36 h-40 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-700 shadow-2xl">
            <ProductImage
              productId={product?.id}
              src={product?.image || getProductImage(product)}
              alt={product?.name || 'Product'}
              fallbackCategory={product?.category || 'Accessories'}
              aspectRatio="aspect-square"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h4 className="text-base font-extrabold text-white">
              3D preview unavailable for this product.
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              <strong>{product?.name}</strong> belongs to {product?.category || 'this category'}. You can still customize size, fabric, and color, or select a supported clothing category (T-Shirts, Hoodies, Shirts, Jackets, Dresses, Kurtas, Pants) for real 3D 360° rendering.
            </p>
          </div>
        </div>
      )}

      {/* Bottom Center: Quick Camera View Angle Pills */}
      {isModelAvailable && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 p-1.5 rounded-2xl bg-neutral-900/85 backdrop-blur-md border border-neutral-800 shadow-xl">
          <button
            type="button"
            onClick={() => setCameraView('front')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
              activeAngleView === 'front'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => setCameraView('back')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
              activeAngleView === 'back'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setCameraView('left')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
              activeAngleView === 'left'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Left
          </button>
          <button
            type="button"
            onClick={() => setCameraView('right')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
              activeAngleView === 'right'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Right
          </button>
          <div className="w-[1px] h-4 bg-neutral-700 mx-1" />
          <button
            type="button"
            onClick={() => setCameraView('reset')}
            title="Reset Camera Position"
            className="px-2.5 py-1.5 text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-all"
          >
            Reset
          </button>
        </div>
      )}

      {/* Top Right: Interactive Controls Floating Toolbar */}
      {isModelAvailable && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {/* Zoom In / Zoom Out */}
          <div className="flex items-center p-0.5 rounded-xl bg-neutral-900/80 backdrop-blur-md border border-neutral-700/60 shadow-lg">
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-7 h-7 flex items-center justify-center text-sm font-bold text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-all cursor-pointer"
              title="Zoom In"
            >
              +
            </button>
            <div className="w-[1px] h-3.5 bg-neutral-700" />
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-7 h-7 flex items-center justify-center text-sm font-bold text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-all cursor-pointer"
              title="Zoom Out"
            >
              &minus;
            </button>
          </div>

          {/* Auto Rotate Toggle */}
          <button
            type="button"
            onClick={() => setIsAutoRotating((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all cursor-pointer ${
              isAutoRotating
                ? 'bg-indigo-600/90 text-white border-indigo-400 shadow-lg shadow-indigo-600/30'
                : 'bg-neutral-900/80 text-neutral-300 border-neutral-700/60 hover:text-white hover:bg-neutral-850'
            }`}
            title="Toggle 360° Automatic Orbit Rotation"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isAutoRotating ? 'Rotating 360°' : 'Rotate 360°'}</span>
          </button>
        </div>
      )}

      {/* Bottom Hint */}
      {isModelAvailable && (
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden sm:block">
          <span className="text-[11px] font-medium text-neutral-500 tracking-wide">
            Drag to rotate &bull; Scroll to zoom
          </span>
        </div>
      )}
    </div>
  );
}
