/**
 * FitFusion Phase 20 — 3D Clothing WebGL & Real-Time Rendering Engine
 * Powered by Three.js with GLTF support, procedural 3D garment generator,
 * PBR fabric simulation, dynamic monogram texturing, and body tracking sync.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { getProduct3DModel, getFabricPbr } from '../data/clothing3DRegistry.js';
import { normalizeGarmentColor } from './photoTryOnService.js';

/**
 * Reusable 3D garment loader supporting .glb and .gltf
 * Supports adding new GLB files without rewriting the try-on system.
 */
export async function loadGarmentModel(product) {
  const modelInfo = getProduct3DModel(product);
  if (!modelInfo || !modelInfo.model3D) {
    return {
      success: false,
      is3D: false,
      error: '3D garment unavailable. Using 2D preview.',
      modelInfo
    };
  }

  const loader = new GLTFLoader();
  return new Promise((resolve) => {
    loader.load(
      modelInfo.model3D,
      (gltf) => {
        resolve({
          success: true,
          is3D: true,
          gltf,
          scene: gltf.scene || gltf.scenes[0],
          modelInfo
        });
      },
      undefined,
      (err) => {
        console.warn(`[loadGarmentModel] Failed to load ${modelInfo.model3D}:`, err);
        resolve({
          success: false,
          is3D: false,
          error: '3D garment unavailable. Using 2D preview.',
          modelInfo
        });
      }
    );
  });
}

export class ThreeGarmentEngine {
  constructor(canvas, container, options = {}) {
    if (canvas && typeof canvas === 'object' && canvas.canvas) {
      options = canvas;
      container = options.container || options.canvas.parentElement;
      canvas = options.canvas;
    }
    this.canvas = canvas;
    this.container = container || (canvas ? canvas.parentElement : null);
    this.mode = options.mode || (options.enableControls ? 'studio' : 'camera');
    this.product = options.product || null;
    this.customization = options.customization || {};

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.animId = null;
    this.gltfLoader = new GLTFLoader();

    // Scene Graph Objects
    this.garmentGroup = new THREE.Group();
    this.activeGarmentMesh = null;
    this.monogramMesh = null;
    this.mannequinGroup = null;
    this.studioPodium = null;

    // Lighting
    this.ambientLight = null;
    this.keyLight = null;
    this.fillLight = null;
    this.rimLight = null;

    // Calibration Offsets (user-tunable in Try-On)
    this.calibration = {
      scaleMultiplier: 1.0,
      offsetY: 0.0,
      offsetX: 0.0,
      opacity: 1.0
    };

    // Auto-rotation in Studio mode
    this.autoRotate = false;
    this.disposed = false;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 600;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 3.2);

    // 3. Renderer with Alpha for transparent camera overlay
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Lighting setup
    this.setupLighting();

    // 5. Add garment root group to scene
    this.scene.add(this.garmentGroup);

    // 6. Setup Studio elements if in studio mode
    if (this.mode === 'studio') {
      this.setupStudioEnvironment();
      this.setupOrbitControls();
    }

    // 7. Load or generate 3D clothing
    this.buildGarment();

    // 8. Start render loop
    this.renderLoop = this.renderLoop.bind(this);
    this.animId = requestAnimationFrame(this.renderLoop);

    // 9. Resize handler
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  setupLighting() {
    // Ambient light: Soft, diffused studio daylight illumination
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.90);
    this.scene.add(this.ambientLight);

    // Key front light: Soft warm key light casting gentle contact shadows
    this.keyLight = new THREE.DirectionalLight(0xfffdf7, 1.15);
    this.keyLight.position.set(2.0, 3.5, 3.0);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.bias = -0.001;
    this.scene.add(this.keyLight);

    // Fill side light: Cool ambient bounce for soft gradient fill
    this.fillLight = new THREE.DirectionalLight(0xf0f4f8, 0.65);
    this.fillLight.position.set(-2.5, 1.5, 2.0);
    this.scene.add(this.fillLight);

    // Rim / Back light: Delineates shoulders, collar, and garment edges with high contrast for white clothing
    this.rimLight = new THREE.DirectionalLight(0xffeedb, 0.85);
    this.rimLight.position.set(0, 2.8, -2.8);
    this.scene.add(this.rimLight);
  }

  setupStudioEnvironment() {
    // Elegant warm neutral fashion studio backdrop (replaces pitch black)
    this.scene.background = new THREE.Color(0xF0EFEA);
    this.scene.fog = new THREE.Fog(0xF0EFEA, 7, 22);

    // Soft Studio Ground Plane with contact shadow receiver
    if (!this.studioFloor) {
      const floorGeo = new THREE.PlaneGeometry(24, 24);
      const floorMat = new THREE.ShadowMaterial({ opacity: 0.12 });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.y = -1.82;
      floorMesh.receiveShadow = true;
      this.studioFloor = floorMesh;
      this.scene.add(this.studioFloor);
    } else {
      this.studioFloor.visible = true;
    }

    // Atelier Mannequin Form in Studio Mode
    if (!this.mannequinGroup) {
      this.mannequinGroup = new THREE.Group();

      // Stylized Atelier Mannequin Body (matte graphite for supreme contrast with white & light garments)
      const torsoGeo = new THREE.CylinderGeometry(0.32, 0.22, 1.25, 24);
      const mannequinMat = new THREE.MeshStandardMaterial({
        color: 0x2A2D34,
        roughness: 0.40,
        metalness: 0.10
      });
      const torsoMesh = new THREE.Mesh(torsoGeo, mannequinMat);
      torsoMesh.position.y = -0.15;
      torsoMesh.castShadow = true;
      torsoMesh.receiveShadow = true;
      this.mannequinGroup.add(torsoMesh);

      // Mannequin Neck
      const neckGeo = new THREE.CylinderGeometry(0.12, 0.13, 0.3, 18);
      const neckMesh = new THREE.Mesh(neckGeo, mannequinMat);
      neckMesh.position.y = 0.55;
      this.mannequinGroup.add(neckMesh);

      // Stand pole: Hand-brushed warm atelier brass
      const poleGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.2, 16);
      const metalMat = new THREE.MeshStandardMaterial({
        color: 0xC49752,
        metalness: 0.85,
        roughness: 0.25
      });
      const poleMesh = new THREE.Mesh(poleGeo, metalMat);
      poleMesh.position.y = -1.2;
      this.mannequinGroup.add(poleMesh);

      // Circular Atelier Base
      const baseGeo = new THREE.CylinderGeometry(0.55, 0.58, 0.08, 32);
      const baseMesh = new THREE.Mesh(baseGeo, metalMat);
      baseMesh.position.y = -1.8;
      baseMesh.receiveShadow = true;
      this.mannequinGroup.add(baseMesh);

      this.scene.add(this.mannequinGroup);
    } else {
      this.mannequinGroup.visible = true;
    }
  }

  setupOrbitControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 1.6;
    this.controls.maxDistance = 5.0;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.15;
    this.controls.target.set(0, 0, 0);
  }

  setMode(newMode) {
    if (this.mode === newMode) return;
    this.mode = newMode;

    if (newMode === 'studio') {
      this.setupStudioEnvironment();
      if (!this.controls) {
        this.setupOrbitControls();
      } else {
        this.controls.enabled = true;
      }
      this.resetGarmentPosition();
      this.camera.position.set(0, 0, 3.2);
    } else {
      // Camera Overlay mode: transparent scene background so live webcam stream shines through
      this.scene.background = null;
      this.scene.fog = null;
      if (this.studioFloor) {
        this.studioFloor.visible = false;
      }
      if (this.mannequinGroup) {
        this.mannequinGroup.visible = false;
      }
      if (this.controls) {
        this.controls.enabled = false;
      }
      this.camera.position.set(0, 0, 3.2);
      this.camera.lookAt(0, 0, 0);
    }
  }

  /**
   * Builds the 3D Garment: loads GLB if available, otherwise procedural mesh
   */
  async buildGarment() {
    // Clear previous garment
    while (this.garmentGroup.children.length > 0) {
      const obj = this.garmentGroup.children[0];
      this.garmentGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    }

    const res = await loadGarmentModel(this.product);
    if (this.disposed) return;

    if (res.success && res.scene) {
      const root = res.scene;
      this.activeGarmentMesh = root;

      // Apply customization materials
      this.applyCustomizationToHierarchy(root);

      // Dynamic Bounding Box Framing: Scale and Center garment accurately at origin
      const box = new THREE.Box3().setFromObject(root);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const targetScale = (res.modelInfo?.defaultScale || 1.0) * (1.6 / maxDim);

      root.scale.setScalar(targetScale);
      root.position.x = -center.x * targetScale;
      root.position.y = (-center.y * targetScale) - 0.12;
      root.position.z = -center.z * targetScale;

      this.garmentGroup.add(root);
      this.attachMonogram();
      this.isLoaded = true;
      if (this.onGarmentLoaded) this.onGarmentLoaded({ is3D: true, has3DModel: true, modelInfo: res.modelInfo });
    } else {
      // Product has no compatible 3D model: NEVER substitute an unrelated garment or default to a T-shirt!
      const modelInfo = res.modelInfo || getProduct3DModel(this.product);
      this.isLoaded = false;
      this.activeGarmentMesh = null;
      if (this.onGarmentLoaded) {
        this.onGarmentLoaded({
          is3D: false,
          has3DModel: false,
          modelInfo,
          message: '3D preview unavailable for this product.'
        });
      }
    }
  }

  /**
   * Generates dynamic high-fidelity procedural 3D garment mesh for any category
   */
  generateProceduralGarment(modelInfo) {
    const geoType = modelInfo.geometryType || 'tshirt';
    const fit = this.customization?.fit || 'Regular';
    const colorHex = this.resolveColorHex();
    const fabricProps = getFabricPbr(this.customization?.fabric);

    // Fit-based width multiplier
    const fitWidthScale = fit === 'Slim' ? 0.92 : fit === 'Relaxed' ? 1.08 : 1.0;
    const sizeScale = this.getSizeScaleMultiplier();

    const garmentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: fabricProps.roughness,
      metalness: fabricProps.metalness,
      clearcoat: fabricProps.clearcoat || 0,
      sheen: fabricProps.sheen || 0,
      side: THREE.DoubleSide
    });

    const meshGroup = new THREE.Group();

    if (geoType === 'pants') {
      // 3D Pants / Chinos Geometry
      const legGeo = new THREE.CylinderGeometry(0.18 * fitWidthScale, 0.12 * fitWidthScale, 1.4, 20);
      const leftLeg = new THREE.Mesh(legGeo, garmentMat);
      leftLeg.position.set(-0.2, -0.65, 0);
      leftLeg.castShadow = true;
      meshGroup.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, garmentMat);
      rightLeg.position.set(0.2, -0.65, 0);
      rightLeg.castShadow = true;
      meshGroup.add(rightLeg);

      const waistGeo = new THREE.CylinderGeometry(0.38 * fitWidthScale, 0.40 * fitWidthScale, 0.35, 24);
      const waistMesh = new THREE.Mesh(waistGeo, garmentMat);
      waistMesh.position.set(0, 0.1, 0);
      waistMesh.castShadow = true;
      meshGroup.add(waistMesh);
    } else if (geoType === 'dress') {
      // 3D Dress: Bodice + Flowing A-Line Skirt
      const bodiceGeo = new THREE.CylinderGeometry(0.32 * fitWidthScale, 0.25 * fitWidthScale, 0.65, 24);
      const bodiceMesh = new THREE.Mesh(bodiceGeo, garmentMat);
      bodiceMesh.position.y = 0.22;
      bodiceMesh.castShadow = true;
      meshGroup.add(bodiceMesh);

      const skirtGeo = new THREE.ConeGeometry(0.72 * fitWidthScale, 1.1, 28, 1, true);
      const skirtMesh = new THREE.Mesh(skirtGeo, garmentMat);
      skirtMesh.rotation.x = Math.PI;
      skirtMesh.position.y = -0.55;
      skirtMesh.castShadow = true;
      meshGroup.add(skirtMesh);
    } else {
      // Upper body garments: T-Shirt, Shirt, Hoodie, Jacket, Kurta
      const torsoHeight = geoType === 'kurta' ? 1.4 : geoType === 'jacket' ? 1.15 : 0.95;
      const topRadius = (geoType === 'hoodie' || geoType === 'jacket' ? 0.45 : 0.40) * fitWidthScale;
      const bottomRadius = (fit === 'Slim' ? 0.30 : fit === 'Relaxed' ? 0.42 : 0.36) * fitWidthScale;

      // Main Torso Mesh
      const torsoGeo = new THREE.CylinderGeometry(topRadius, bottomRadius, torsoHeight, 28);
      const torsoMesh = new THREE.Mesh(torsoGeo, garmentMat);
      torsoMesh.position.y = geoType === 'kurta' ? -0.15 : 0.05;
      torsoMesh.castShadow = true;
      meshGroup.add(torsoMesh);

      // Sleeves
      const isLongSleeve = geoType === 'shirt' || geoType === 'hoodie' || geoType === 'jacket' || geoType === 'kurta';
      const sleeveLength = isLongSleeve ? 0.85 : 0.42;
      const sleeveRadius = (isLongSleeve ? 0.12 : 0.14) * fitWidthScale;

      const sleeveGeo = new THREE.CylinderGeometry(sleeveRadius * 1.1, sleeveRadius * 0.9, sleeveLength, 18);

      // Left Sleeve
      const leftSleeve = new THREE.Mesh(sleeveGeo, garmentMat);
      leftSleeve.position.set(-topRadius - 0.15, 0.25 - (sleeveLength * 0.3), 0);
      leftSleeve.rotation.z = Math.PI / 4.8;
      leftSleeve.castShadow = true;
      meshGroup.add(leftSleeve);

      // Right Sleeve
      const rightSleeve = new THREE.Mesh(sleeveGeo, garmentMat);
      rightSleeve.position.set(topRadius + 0.15, 0.25 - (sleeveLength * 0.3), 0);
      rightSleeve.rotation.z = -Math.PI / 4.8;
      rightSleeve.castShadow = true;
      meshGroup.add(rightSleeve);

      // Collar / Neck Details based on customization
      const selectedCollar = (this.customization?.collar || this.customization?.design?.collar || '').toLowerCase();
      if (geoType === 'hoodie') {
        const hoodGeo = new THREE.TorusGeometry(0.24, 0.09, 14, 24, Math.PI);
        const hoodMesh = new THREE.Mesh(hoodGeo, garmentMat);
        hoodMesh.position.set(0, 0.52, -0.05);
        hoodMesh.rotation.x = Math.PI / 2.5;
        meshGroup.add(hoodMesh);
      } else if (geoType === 'shirt' || geoType === 'jacket' || selectedCollar.includes('mandarin') || selectedCollar.includes('spread') || selectedCollar.includes('classic')) {
        // Tailored Collar / Lapel
        const collarTube = selectedCollar.includes('mandarin') ? 0.035 : 0.055;
        const collarRadius = selectedCollar.includes('mandarin') ? 0.20 : 0.23;
        const collarGeo = new THREE.TorusGeometry(collarRadius, collarTube, 14, 24);
        const collarMesh = new THREE.Mesh(collarGeo, garmentMat);
        collarMesh.position.set(0, 0.52, 0);
        collarMesh.rotation.x = Math.PI / 2.2;
        meshGroup.add(collarMesh);
      } else {
        // Crew Neck Ring
        const ringGeo = new THREE.TorusGeometry(0.22, 0.035, 12, 24);
        const ringMesh = new THREE.Mesh(ringGeo, garmentMat);
        ringMesh.position.set(0, 0.52, 0);
        ringMesh.rotation.x = Math.PI / 2.2;
        meshGroup.add(ringMesh);
      }

      // Front Button Placket & Buttons (for Shirts, Jackets, Kurtas)
      if (geoType === 'shirt' || geoType === 'jacket' || geoType === 'kurta' || this.customization?.buttons) {
        // Front Center Placket Strip
        const placketGeo = new THREE.BoxGeometry(0.045, torsoHeight * 0.88, 0.015);
        const placketMesh = new THREE.Mesh(placketGeo, garmentMat);
        placketMesh.position.set(0, 0.05, topRadius * 0.88);
        meshGroup.add(placketMesh);

        // Individual 3D Buttons
        const buttonCount = geoType === 'kurta' ? 4 : 6;
        const buttonColorHex = this.customization?.buttons?.color || this.customization?.buttonColor || '#2A2D34';
        const buttonMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(buttonColorHex),
          metalness: 0.75,
          roughness: 0.35
        });

        const buttonGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.008, 16);
        const startY = 0.42;
        const spacing = (torsoHeight * 0.72) / (buttonCount - 1);

        for (let i = 0; i < buttonCount; i++) {
          const btn = new THREE.Mesh(buttonGeo, buttonMat);
          btn.rotation.x = Math.PI / 2;
          btn.position.set(0, startY - (i * spacing), (topRadius * 0.88) + 0.01);
          btn.castShadow = true;
          meshGroup.add(btn);
        }
      }

      // Chest Pocket Option
      if (this.customization?.pockets || this.customization?.hasPocket || geoType === 'shirt') {
        const pocketGeo = new THREE.PlaneGeometry(0.12, 0.14);
        const pocketMesh = new THREE.Mesh(pocketGeo, garmentMat);
        pocketMesh.position.set(-0.15, 0.18, topRadius * 0.86);
        meshGroup.add(pocketMesh);
      }
    }

    meshGroup.scale.setScalar((modelInfo.defaultScale || 1.0) * sizeScale);
    meshGroup.position.set(0, modelInfo.anchorOffset?.y || 0, 0);

    this.activeGarmentMesh = meshGroup;
    this.garmentGroup.add(meshGroup);

    this.attachMonogram();
  }

  /**
   * Applies user customization color, authentic photographic fabric texture, and PBR properties to all meshes
   */
  applyCustomizationToHierarchy(root) {
    const colorHex = this.resolveColorHex();
    const fabricProps = getFabricPbr(this.customization?.fabric);
    const photoSrc = this.product?.image || (Array.isArray(this.product?.images) && this.product.images[0]);

    if (!this._textureCache) {
      this._textureCache = new Map();
    }

    let productTexture = null;
    if (photoSrc) {
      if (this._textureCache.has(photoSrc)) {
        productTexture = this._textureCache.get(photoSrc);
      } else {
        const loader = new THREE.TextureLoader();
        loader.load(
          photoSrc,
          (tex) => {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.needsUpdate = true;
            this._textureCache.set(photoSrc, tex);
            if (!this.disposed && this.activeGarmentMesh) {
              this.applyCustomizationToHierarchy(this.activeGarmentMesh);
            }
          },
          undefined,
          (err) => {
            console.warn('[ThreeGarmentEngine] Fabric texture notice:', err);
          }
        );
      }
    }

    root.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          const mat = child.material.clone();
          if (productTexture) {
            mat.map = productTexture;
          }
          mat.color = new THREE.Color(colorHex);
          mat.roughness = fabricProps.roughness;
          mat.metalness = fabricProps.metalness;
          mat.transparent = true;
          mat.opacity = this.calibration.opacity;
          mat.needsUpdate = true;
          child.material = mat;
        }
      }
    });
  }

  /**
   * Attaches custom graphic / monogram / text decal from customization
   */
  attachMonogram() {
    if (this.monogramMesh) {
      this.garmentGroup.remove(this.monogramMesh);
      if (this.monogramMesh.geometry) this.monogramMesh.geometry.dispose();
      if (this.monogramMesh.material) {
        if (this.monogramMesh.material.map) this.monogramMesh.material.map.dispose();
        this.monogramMesh.material.dispose();
      }
      this.monogramMesh = null;
    }

    const monogramText = this.customization?.monogramText || this.customization?.text;
    const designLayers = this.customization?.designLayers;
    const hasGraphic = Array.isArray(designLayers) && designLayers.length > 0;

    if (!monogramText && !hasGraphic) return;

    // Create 2D offscreen canvas for embroidery / graphic decal texture
    const monoCanvas = document.createElement('canvas');
    monoCanvas.width = 512;
    monoCanvas.height = 256;
    const mctx = monoCanvas.getContext('2d');

    const threadColor = this.customization?.monogramThreadColor || '#F59E0B';
    mctx.clearRect(0, 0, monoCanvas.width, monoCanvas.height);

    if (hasGraphic) {
      const layer = designLayers[0];
      mctx.fillStyle = threadColor;
      mctx.font = 'bold 36px "Inter", sans-serif';
      mctx.textAlign = 'center';
      mctx.textBaseline = 'middle';
      const label = layer.title || layer.name || 'CUSTOM DESIGN';
      mctx.fillText(label.toUpperCase(), 256, 90);
      if (monogramText) {
        mctx.font = 'bold 32px "Times New Roman", Georgia, serif';
        mctx.fillText(monogramText.toUpperCase(), 256, 160);
      }
    } else if (monogramText) {
      mctx.fillStyle = threadColor;
      mctx.font = 'bold 44px "Times New Roman", Georgia, serif';
      mctx.textAlign = 'center';
      mctx.textBaseline = 'middle';
      mctx.fillText(monogramText.trim().toUpperCase(), 256, 128);
    }

    const texture = new THREE.CanvasTexture(monoCanvas);
    texture.needsUpdate = true;
    const monoMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });

    const monoGeo = new THREE.PlaneGeometry(0.32, 0.16);
    const monoMesh = new THREE.Mesh(monoGeo, monoMat);

    // Left chest placement
    monoMesh.position.set(-0.14, 0.20, 0.28);
    this.monogramMesh = monoMesh;
    this.garmentGroup.add(monoMesh);
  }

  /**
   * Synchronizes 3D Garment position and scale with detected live body pose
   * Follows shoulders, torso, body turning (yaw), tilting (roll), and arm raises smoothly
   */
  updatePose(poseData) {
    if (!poseData || !poseData.detected || !poseData.pose || this.mode === 'studio') {
      if (this.mode !== 'studio' && this.garmentGroup) {
        this.garmentGroup.visible = false;
      }
      return;
    }
    this.garmentGroup.visible = true;

    const pose = poseData.pose;
    const cal = this.calibration;

    // Use shoulder center & torso center for stable anchoring (arms raised will not displace garment)
    const sc = pose.shoulderCenter || { x: pose.centerX, y: pose.centerY };
    const tc = pose.torsoCenter || { x: pose.centerX, y: pose.centerY };

    // Target coordinates mapped to Three.js world space
    const targetX = ((tc.x - 0.5) * 2.8) + cal.offsetX;
    const targetY = (-(tc.y - 0.45) * 2.8) + cal.offsetY;

    // Dynamic depth scaling based on detected shoulder span & user calibration
    const scaleFactor = Math.max(0.65, Math.min(1.8, (pose.shoulderWidth / 0.40) * cal.scaleMultiplier));

    // Smooth positioning using lerp
    this.garmentGroup.position.x += (targetX - this.garmentGroup.position.x) * 0.35;
    this.garmentGroup.position.y += (targetY - this.garmentGroup.position.y) * 0.35;
    this.garmentGroup.position.z = 0;

    // Smooth scaling
    const currScale = this.garmentGroup.scale.x;
    const newScale = currScale + (scaleFactor - currScale) * 0.3;
    this.garmentGroup.scale.set(newScale, newScale, newScale);

    // Body Tilt / Roll alignment to shoulder angle (Z axis)
    const rollAngle = pose.bodyRotation || pose.bodyAngle || pose.rollAngle || 0;
    this.garmentGroup.rotation.z += (rollAngle - this.garmentGroup.rotation.z) * 0.32;

    // Body Turning / Yaw rotation (Y axis) when user turns body
    const yawAngle = pose.bodyYaw || 0;
    this.garmentGroup.rotation.y += (yawAngle - this.garmentGroup.rotation.y) * 0.28;
  }

  setProduct(product) {
    this.product = product;
    this.buildGarment();
  }

  /**
   * Updates user customization payload (color, fabric, fit, monogram, size)
   */
  setCustomization(customization) {
    this.customization = { ...this.customization, ...customization };

    if (this.activeGarmentMesh) {
      if (this.activeGarmentMesh.isGroup) {
        this.generateProceduralGarment(getProduct3DModel(this.product));
      } else {
        this.applyCustomizationToHierarchy(this.activeGarmentMesh);
        this.attachMonogram();
      }
    }
  }

  /**
   * Updates user fine-tuning alignment calibration
   */
  setCalibration(calibrationUpdate) {
    this.calibration = { ...this.calibration, ...calibrationUpdate };

    // Update opacity if changed
    if (this.activeGarmentMesh) {
      this.activeGarmentMesh.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.opacity = this.calibration.opacity;
        }
      });
    }
  }

  resetGarmentPosition() {
    this.garmentGroup.position.set(0, 0, 0);
    this.garmentGroup.rotation.set(0, 0, 0);
    this.garmentGroup.scale.set(1, 1, 1);
  }

  resolveColorHex() {
    const col = this.customization?.color || this.customization?.selectedColor || this.product?.availableColors?.[0];
    return normalizeGarmentColor(col, this.product);
  }

  getSizeScaleMultiplier() {
    const size = this.customization?.size || 'M';
    switch (size) {
      case 'XS': return 0.90;
      case 'S': return 0.94;
      case 'M': return 1.0;
      case 'L': return 1.06;
      case 'XL': return 1.12;
      case '2XL': return 1.18;
      case 'Custom Measurement': return 1.02;
      default: return 1.0;
    }
  }

  handleResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  renderLoop() {
    if (this.disposed) return;

    this.animId = requestAnimationFrame(this.renderLoop);

    if (this.mode === 'studio') {
      if (this.controls) this.controls.update();
      if (this.autoRotate) {
        this.garmentGroup.rotation.y += 0.01;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  setCameraAngle(angle) {
    if (!this.camera) return;
    const dist = 3.2;
    switch (angle) {
      case 'front':
        this.camera.position.set(0, 0, dist);
        break;
      case 'back':
        this.camera.position.set(0, 0, -dist);
        break;
      case 'left':
        this.camera.position.set(-dist, 0, 0);
        break;
      case 'right':
        this.camera.position.set(dist, 0, 0);
        break;
      default:
        this.camera.position.set(0, 0, dist);
    }
    if (this.controls) {
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    } else {
      this.camera.lookAt(0, 0, 0);
    }
  }

  zoom(delta) {
    if (!this.camera) return;
    const len = this.camera.position.length();
    const newLen = Math.max(1.6, Math.min(5.0, len + delta));
    this.camera.position.setLength(newLen);
    if (this.controls) this.controls.update();
  }

  toggleAutoRotate(force) {
    this.autoRotate = typeof force === 'boolean' ? force : !this.autoRotate;
    return this.autoRotate;
  }

  resetCamera() {
    this.autoRotate = false;
    this.garmentGroup.rotation.set(0, 0, 0);
    this.garmentGroup.position.set(0, 0, 0);
    this.setCameraAngle('front');
  }

  dispose() {
    this.disposed = true;
    window.removeEventListener('resize', this.handleResize);

    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }

    // Clean scene objects
    if (this.scene) {
      this.scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
  }
}
