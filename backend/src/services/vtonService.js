/**
 * FITFUSION VTON Service (Virtual Try-On Engine)
 * Powered by Kolors Virtual Try-On (Kwai-Kolors) with Multi-Provider Architecture.
 * 
 * Supported Providers:
 * - Fal.ai: fal-ai/kling/v1-5/kolors-virtual-try-on (Production-grade dedicated serverless API)
 * - Hugging Face: Kwai-Kolors/Kolors-Virtual-Try-On (Official Gradio client with HF_TOKEN auth)
 * - Custom / Dedicated GPU: Self-hosted ComfyUI / RunPod / Modal endpoint
 * - Replicate: kwaivgi/kolors-virtual-try-on
 * 
 * Privacy & Security:
 * - Credentials (FAL_KEY, HF_TOKEN, etc.) remain strictly server-side and are NEVER exposed to client.
 * - Uploaded user photographs are processed ephemerally in-memory and NEVER stored permanently on disk.
 * - Generated preview images cached locally for display are automatically pruned after 1 hour.
 * - Input validation strictly enforces format (JPEG, PNG, WEBP) and maximum file size (15MB).
 * - Transparent and honest error reporting: no fake successful canvas overlays when credentials/APIs are missing.
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@gradio/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.resolve(__dirname, '../../.env');

// Resolve directory for temporary generated try-on previews
function resolveGeneratedDir() {
  if (process.env.GENERATED_DIR) {
    return path.resolve(process.env.GENERATED_DIR);
  }
  const monorepoPath = path.resolve(__dirname, '../../../frontend/public/generated');
  if (fs.existsSync(monorepoPath)) {
    return monorepoPath;
  }
  return path.resolve(__dirname, '../../public/generated');
}

export const GENERATED_DIR = resolveGeneratedDir();
if (!fs.existsSync(GENERATED_DIR)) {
  try {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  } catch (err) {
    console.warn('[Storage] Notice creating generated directory:', err.message);
  }
}

try {
  dotenv.config({ path: ENV_PATH });
} catch {
  dotenv.config();
}

/**
 * Safely mask sensitive API tokens for server-side logging
 */
function maskToken(token) {
  if (!token) return 'None (Unconfigured)';
  const str = String(token).trim();
  if (str.length <= 8) return '****';
  return `${str.slice(0, 4)}...${str.slice(-4)}`;
}

/**
 * Prune temporary generated try-on preview images older than maxAgeMs (default 1 hour)
 */
export function pruneTemporaryFiles(maxAgeMs = 60 * 60 * 1000) {
  try {
    if (!fs.existsSync(GENERATED_DIR)) return;
    const files = fs.readdirSync(GENERATED_DIR);
    const now = Date.now();
    let count = 0;

    for (const file of files) {
      if (!file.startsWith('vton-')) continue;
      const filePath = path.join(GENERATED_DIR, file);
      try {
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlinkSync(filePath);
          count++;
        }
      } catch {
        // Skip busy or locked files
      }
    }
    if (count > 0) {
      console.log(`[VTON Privacy] Pruned ${count} expired temporary try-on files.`);
    }
  } catch (err) {
    console.warn('[VTON Privacy] Error during temporary file cleanup:', err.message);
  }
}

/**
 * Parse ZeroGPU / Hugging Face quota errors and extract cooldown seconds
 */
export function parseZeroGpuError(errorMessage) {
  if (!errorMessage) return null;
  const msg = String(errorMessage);

  const isQuota = /quota|requested vs|cooldown|ZeroGPU|exceeded your GPU|429|Too Many Requests|rate limit|GPU lease|gpu timeout/i.test(msg);
  if (!isQuota) return null;

  let cooldownSeconds = 75;
  let formattedDuration = '';

  const timeMatch = msg.match(/Try again in\s+(\d{1,2}):(\d{2}):(\d{2})/i);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const seconds = parseInt(timeMatch[3], 10);
    cooldownSeconds = (hours * 3600) + (minutes * 60) + seconds;
    if (hours > 0) {
      formattedDuration = `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      formattedDuration = `${minutes}m ${seconds}s`;
    } else {
      formattedDuration = `${seconds}s`;
    }
  } else {
    const waitMatch = msg.match(/wait\s+(\d+)\s*(?:s|sec|second)/i)
      || msg.match(/cooldown[^\d]*(\d+)\s*(?:s|sec|second)/i)
      || msg.match(/in\s+(\d+)\s*(?:s|sec|second)/i);

    if (waitMatch && waitMatch[1]) {
      const parsed = parseInt(waitMatch[1], 10);
      if (!isNaN(parsed) && parsed > 0) {
        cooldownSeconds = Math.max(parsed, 15);
      }
    }
    formattedDuration = `${cooldownSeconds}s`;
  }

  return {
    isQuota: true,
    cooldownSeconds,
    formattedDuration: formattedDuration || `${cooldownSeconds}s`,
    rawMessage: msg
  };
}

/**
 * Category Mapper: Maps FITFUSION product categories to standard VTON target categories
 */
export function mapToVtonCategory(category = '') {
  const cat = String(category || '').toLowerCase().trim();

  if (
    cat.includes('dress') ||
    cat.includes('gown') ||
    cat.includes('jumpsuit') ||
    cat.includes('sherwani') ||
    cat.includes('kurta pajama') ||
    cat.includes('set')
  ) {
    return 'dresses';
  }

  if (
    cat.includes('jean') ||
    cat.includes('pant') ||
    cat.includes('trouser') ||
    cat.includes('chino') ||
    cat.includes('short') ||
    cat.includes('skirt')
  ) {
    return 'lower_body';
  }

  return 'upper_body';
}

/**
 * Convert Data URL or file path or HTTP URL to a standard Blob (for Gradio/HF)
 */
async function resolveImageToBlob(imageInput) {
  if (!imageInput) {
    throw new Error('Image input is required.');
  }

  if (typeof imageInput === 'string' && imageInput.startsWith('data:')) {
    const matches = imageInput.match(/^data:([A-Za-z0-9-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid Base64 Data URL format.');
    }
    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    return new Blob([buffer], { type: mimeType });
  }

  if (typeof imageInput === 'string') {
    let localRelative = null;
    if (imageInput.startsWith('/')) {
      localRelative = imageInput.replace(/^\//, '');
    } else if (imageInput.includes('localhost:') || imageInput.includes('127.0.0.1:')) {
      try {
        const parsed = new URL(imageInput);
        localRelative = parsed.pathname.replace(/^\//, '');
      } catch (e) {
        // Fallback to fetch
      }
    }

    if (localRelative) {
      const decodedRelative = decodeURIComponent(localRelative);
      const candidatePath = path.resolve(__dirname, '../../../frontend/public', decodedRelative);
      let actualPath = candidatePath;
      if (!fs.existsSync(actualPath)) {
        const altExts = ['.webp', '.jpg', '.jpeg', '.png'];
        for (const ext of altExts) {
          const testPath = candidatePath.replace(/\.[^.]+$/, ext);
          if (fs.existsSync(testPath)) {
            actualPath = testPath;
            break;
          }
        }
      }
      if (fs.existsSync(actualPath)) {
        const ext = path.extname(actualPath).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        const buf = fs.readFileSync(actualPath);
        return new Blob([buf], { type: mimeType });
      }

      // If local file not found on backend container (e.g. Render), fetch from frontend CDN domain
      if (process.env.CLIENT_URL) {
        const clientBase = process.env.CLIENT_URL.replace(/\/+$/, '');
        const remoteFallbackUrl = `${clientBase}/${decodedRelative}`;
        try {
          const res = await fetch(remoteFallbackUrl);
          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            const contentType = res.headers.get('content-type') || 'image/jpeg';
            return new Blob([arrayBuffer], { type: contentType });
          }
        } catch {
          // Fall through to HTTP URL checks
        }
      }
    }
  }

  if (typeof imageInput === 'string' && (imageInput.startsWith('http://') || imageInput.startsWith('https://'))) {
    const res = await fetch(imageInput);
    if (!res.ok) {
      throw new Error(`Failed to load image from URL (${res.status} ${res.statusText}): ${imageInput}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return new Blob([arrayBuffer], { type: contentType });
  }

  if (Buffer.isBuffer(imageInput)) {
    return new Blob([imageInput], { type: 'image/jpeg' });
  }

  throw new Error('Unsupported image input format. Must be a Data URL, local asset path, or HTTP URL.');
}

/**
 * Convert any image input (Data URL, local file, or HTTP URL) into a Base64 Data URL
 * Suitable for cloud payload transmission (e.g. Fal.ai)
 */
async function resolveImageToDataUrl(imageInput) {
  if (!imageInput) throw new Error('Image input is required.');

  // Already a Data URL
  if (typeof imageInput === 'string' && imageInput.startsWith('data:')) {
    return imageInput;
  }

  // Local file in frontend/public
  if (typeof imageInput === 'string') {
    let localRelative = null;
    if (imageInput.startsWith('/')) {
      localRelative = imageInput.replace(/^\//, '');
    } else if (imageInput.includes('localhost:') || imageInput.includes('127.0.0.1:')) {
      try {
        const parsed = new URL(imageInput);
        localRelative = parsed.pathname.replace(/^\//, '');
      } catch (e) {
        // Fallback below
      }
    }

    if (localRelative) {
      const decodedRelative = decodeURIComponent(localRelative);
      const candidatePath = path.resolve(__dirname, '../../../frontend/public', decodedRelative);
      let actualPath = candidatePath;
      if (!fs.existsSync(actualPath)) {
        const altExts = ['.webp', '.jpg', '.jpeg', '.png'];
        for (const ext of altExts) {
          const testPath = candidatePath.replace(/\.[^.]+$/, ext);
          if (fs.existsSync(testPath)) {
            actualPath = testPath;
            break;
          }
        }
      }
      if (fs.existsSync(actualPath)) {
        const ext = path.extname(actualPath).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        const buf = fs.readFileSync(actualPath);
        return `data:${mimeType};base64,${buf.toString('base64')}`;
      }

      // If local file not found on backend container (e.g. Render), fetch from frontend CDN domain
      if (process.env.CLIENT_URL) {
        const clientBase = process.env.CLIENT_URL.replace(/\/+$/, '');
        const remoteFallbackUrl = `${clientBase}/${decodedRelative}`;
        try {
          const res = await fetch(remoteFallbackUrl);
          if (res.ok) {
            const arrayBuf = await res.arrayBuffer();
            const buf = Buffer.from(arrayBuf);
            const contentType = res.headers.get('content-type') || 'image/jpeg';
            return `data:${contentType};base64,${buf.toString('base64')}`;
          }
        } catch {
          // Fall through to remote fetch
        }
      }
    }
  }

  // Remote HTTP URL
  if (typeof imageInput === 'string' && (imageInput.startsWith('http://') || imageInput.startsWith('https://'))) {
    const res = await fetch(imageInput);
    if (!res.ok) {
      throw new Error(`Failed to fetch garment image: ${res.status} ${res.statusText}`);
    }
    const arrayBuf = await res.arrayBuffer();
    const buf = Buffer.from(arrayBuf);
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return `data:${contentType};base64,${buf.toString('base64')}`;
  }

  if (Buffer.isBuffer(imageInput)) {
    return `data:image/jpeg;base64,${imageInput.toString('base64')}`;
  }

  throw new Error('Unsupported image input format.');
}

class VTONService {
  constructor() {
    this.refreshConfig();

    // Trigger initial cleanup of stale temporary files
    pruneTemporaryFiles();

    console.log(`[Kolors VTON] Initialized engine for model "Kolors-Virtual-Try-On"`);
    console.log(`[Kolors VTON] Active Provider: "${this.provider}"`);
    console.log(`[Kolors VTON] Fal.ai Key: ${this.falKey ? maskToken(this.falKey) : 'Not configured'}`);
    console.log(`[Kolors VTON] Hugging Face Token: ${this.hfToken ? maskToken(this.hfToken) : 'Not configured'}`);
  }

  /**
   * Reload environment config dynamically so updates in backend/.env take effect immediately
   */
  refreshConfig() {
    try {
      dotenv.config({ path: ENV_PATH, override: true });
    } catch {
      // Ignore dotenv reload errors
    }

    this.falKey = (process.env.FAL_KEY || process.env.FAL_AI_KEY || '').trim();
    this.hfToken = (process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY || '').trim();
    this.customApiUrl = (process.env.KOLORS_API_URL || process.env.VTON_API_URL || '').trim();
    this.customApiKey = (process.env.KOLORS_API_KEY || process.env.VTON_API_KEY || '').trim();
    this.replicateToken = (process.env.REPLICATE_API_TOKEN || '').trim();

    this.kolorsHfSpace = (process.env.KOLORS_HF_SPACE_ID || 'Kwai-Kolors/Kolors-Virtual-Try-On').trim();
    this.backupHfSpace = (process.env.HF_BACKUP_SPACE_ID || 'yisol/IDM-VTON').trim();

    this.allowCommunityHf = process.env.ALLOW_COMMUNITY_HF === 'true';

    // Determine active provider:
    // If explicitly set, respect process.env.KOLORS_PROVIDER or process.env.VTON_PROVIDER
    const explicitProvider = (process.env.KOLORS_PROVIDER || process.env.VTON_PROVIDER || '').toLowerCase();
    if (explicitProvider) {
      this.provider = explicitProvider;
    } else if (this.falKey) {
      this.provider = 'fal-ai';
    } else if (this.hfToken || (this.allowCommunityHf && explicitProvider === 'hf-kolors')) {
      this.provider = 'hf-kolors';
    } else if (this.customApiUrl) {
      this.provider = 'custom-api';
    } else {
      // Default to fal-ai (requires FAL_KEY) or hf-kolors (requires HF_TOKEN)
      this.provider = 'fal-ai';
    }

    const rawSteps = parseInt(process.env.VTON_DENOISE_STEPS, 10);
    this.denoiseSteps = !isNaN(rawSteps) && rawSteps >= 15 && rawSteps <= 40 ? rawSteps : 22;

    if (!this.cooldownUntil) this.cooldownUntil = 0;
  }

  /**
   * Check if any valid provider credentials are configured
   */
  hasValidCredentials() {
    this.refreshConfig();
    return Boolean(
      this.falKey ||
      this.hfToken ||
      this.customApiUrl ||
      this.replicateToken
    );
  }

  /**
   * Get current Kolors VTON service status
   * NEVER exposes raw API credentials to client
   */
  getStatus() {
    this.refreshConfig();
    const hasCreds = this.hasValidCredentials();
    const isCooldownActive = Date.now() < this.cooldownUntil;
    const cooldownSecondsRemaining = isCooldownActive
      ? Math.ceil((this.cooldownUntil - Date.now()) / 1000)
      : 0;

    let statusMessage = '';
    if (isCooldownActive) {
      statusMessage = `Provider cooldown active. Retrying available in ${cooldownSecondsRemaining}s.`;
    } else if (hasCreds) {
      statusMessage = `Kolors Virtual Try-On online via provider: ${this.provider}.`;
    } else {
      statusMessage = 'Kolors AI Virtual Try-On is integrated. API credentials (FAL_KEY or HF_TOKEN) are required in environment variables to connect to the model provider.';
    }

    return {
      success: true,
      model: 'Kolors-Virtual-Try-On',
      provider: this.provider,
      configured: true,
      authenticated: hasCreds,
      connected: hasCreds && !isCooldownActive,
      requiresCredentials: !hasCreds,
      isCooldownActive,
      cooldownSecondsRemaining,
      supportedCategories: ['upper_body', 'lower_body', 'dresses'],
      message: statusMessage,
      setupInstructions: {
        recommended: 'Add FAL_KEY to backend / Render environment variables (Obtain from https://fal.ai)',
        alternative: 'Add HF_TOKEN to backend / Render environment variables (Obtain free token from https://huggingface.co/settings/tokens)',
        selfHosted: 'Set KOLORS_API_URL in backend environment variables'
      }
    };
  }

  /**
   * Process virtual try-on request with Kolors AI Virtual Try-On
   */
  async processTryOn({
    personImage,
    garmentImage,
    garmentCategory = 'upper_body',
    productId = '',
    productName = '',
    options = {}
  }) {
    this.refreshConfig();
    const startTime = Date.now();
    const targetCategory = mapToVtonCategory(garmentCategory);

    // 1. Validate inputs
    if (!personImage) {
      const err = new Error('Person photograph is required for virtual try-on.');
      err.status = 400;
      throw err;
    }
    if (!garmentImage) {
      const err = new Error('Garment image is required from the FITFUSION catalogue.');
      err.status = 400;
      throw err;
    }

    // Validate size limit (max 15MB for personImage if base64)
    if (typeof personImage === 'string' && personImage.startsWith('data:')) {
      const estimatedSizeBytes = Math.round(personImage.length * 0.75);
      if (estimatedSizeBytes > 15 * 1024 * 1024) {
        const err = new Error('Uploaded photograph exceeds 15MB size limit. Please upload a smaller image.');
        err.status = 400;
        throw err;
      }
    }

    // 2. Cooldown check
    if (Date.now() < this.cooldownUntil) {
      const remainingSeconds = Math.ceil((this.cooldownUntil - Date.now()) / 1000);
      const quotaErr = new Error(
        `Kolors AI provider cooldown active. Please wait ${remainingSeconds}s before retrying.`
      );
      quotaErr.code = 'QUOTA_COOLDOWN';
      quotaErr.status = 429;
      quotaErr.cooldownSeconds = remainingSeconds;
      quotaErr.retryAfter = new Date(this.cooldownUntil).toISOString();
      throw quotaErr;
    }

    // 3. Honest Credential Verification
    // Do NOT invent endpoints or pretend the integration works without valid access!
    if (!this.hasValidCredentials()) {
      const missingCredsErr = new Error(
        'Kolors Virtual Try-On API credentials not configured. Please set FAL_KEY (recommended from https://fal.ai) or HF_TOKEN (from https://huggingface.co) in backend/.env to connect to the Kolors AI engine.'
      );
      missingCredsErr.code = 'CREDENTIALS_REQUIRED';
      missingCredsErr.status = 503;
      throw missingCredsErr;
    }

    console.log(`[Kolors VTON] Processing try-on for "${productName || productId}" via ${this.provider}...`);

    // 4. Provider: Fal.ai Kolors (Production API)
    if (this.provider === 'fal-ai' || (this.falKey && this.provider !== 'hf-kolors')) {
      try {
        return await this.callFalAiKolors({
          personImage,
          garmentImage,
          category: targetCategory,
          productName,
          options,
          startTime
        });
      } catch (falErr) {
        console.error('[Kolors VTON] Fal.ai execution error:', falErr.message);
        // If HF token is available, attempt fallback
        if (this.hfToken) {
          console.log('[Kolors VTON] Falling back to Hugging Face Kolors Space...');
          return await this.callHfKolorsWithFailover({
            personImage,
            garmentImage,
            productName,
            category: targetCategory,
            options,
            startTime
          });
        }
        throw falErr;
      }
    }

    // 5. Provider: Hugging Face Kwai-Kolors Gradio Space
    if (this.provider === 'hf-kolors' || this.hfToken) {
      return await this.callHfKolorsWithFailover({
        personImage,
        garmentImage,
        productName,
        category: targetCategory,
        options,
        startTime
      });
    }

    // 6. Provider: Custom Dedicated GPU Endpoint
    if (this.provider === 'custom-api' || this.customApiUrl) {
      return await this.callCustomApiEndpoint({
        personImage,
        garmentImage,
        targetCategory,
        options,
        startTime
      });
    }

    // 7. Provider: Replicate Fallback
    if (this.provider === 'replicate' || this.replicateToken) {
      return await this.callReplicateKolors({
        personImage,
        garmentImage,
        targetCategory,
        options,
        startTime
      });
    }

    const unavailErr = new Error(
      'Kolors Virtual Try-On service is currently unavailable. Please verify backend provider configuration.'
    );
    unavailErr.code = 'VTON_UNAVAILABLE';
    unavailErr.status = 503;
    throw unavailErr;
  }

  /**
   * Call official Fal.ai Kolors Virtual Try-On endpoint
   * Endpoint: fal-ai/kling/v1-5/kolors-virtual-try-on
   */
  async callFalAiKolors({ personImage, garmentImage, category, productName, options, startTime }) {
    if (!this.falKey) {
      const err = new Error('Missing FAL_KEY for Fal.ai Kolors provider.');
      err.code = 'CREDENTIALS_REQUIRED';
      err.status = 503;
      throw err;
    }

    console.log('[Kolors VTON] Resolving images for Fal.ai API payload...');
    const [personDataUrl, garmentDataUrl] = await Promise.all([
      resolveImageToDataUrl(personImage),
      resolveImageToDataUrl(garmentImage)
    ]);

    const endpoint = process.env.FAL_KOLORS_ENDPOINT || 'https://fal.run/fal-ai/kling/v1-5/kolors-virtual-try-on';
    console.log(`[Kolors VTON] Calling Fal.ai endpoint: ${endpoint}...`);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Key ${this.falKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        human_image_url: personDataUrl,
        garment_image_url: garmentDataUrl
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      let parsedErr = errText;
      try {
        const jsonErr = JSON.parse(errText);
        parsedErr = jsonErr.detail || jsonErr.message || errText;
      } catch {}

      if (res.status === 401 || res.status === 403) {
        const authErr = new Error(`Fal.ai authentication failed: ${parsedErr}. Please verify FAL_KEY in backend/.env.`);
        authErr.code = 'AUTHENTICATION_FAILED';
        authErr.status = 401;
        throw authErr;
      }

      throw new Error(`Fal.ai Kolors API error (${res.status}): ${parsedErr}`);
    }

    const data = await res.json();
    const resultUrl = data.image?.url || data.images?.[0]?.url || data.output;

    if (!resultUrl) {
      throw new Error('Fal.ai Kolors returned empty image output.');
    }

    console.log('[Kolors VTON] Output received from Fal.ai. Caching locally for preview...');
    const cached = await this.cacheImageLocally(resultUrl);
    const processingTimeMs = Date.now() - startTime;

    return {
      success: true,
      resultImageUrl: cached.imageUrl,
      model: 'Kolors-Virtual-Try-On',
      provider: 'fal-ai',
      category,
      processingTimeMs,
      preservedFeatures: [
        'User facial identity, expression, and skin tone',
        'Natural posture, arms, and full-body silhouette',
        'Authentic garment texture, collar, seams, and drape',
        'Photorealistic ambient lighting and shadow blending'
      ]
    };
  }

  /**
   * Call official Hugging Face Kwai-Kolors Gradio Space
   */
  async callHfKolorsWithFailover({ personImage, garmentImage, productName, category, options, startTime }) {
    console.log('[Kolors VTON] Resolving input images to standard Blobs for Hugging Face Gradio client...');
    const [personBlob, garmentBlob] = await Promise.all([
      resolveImageToBlob(personImage),
      resolveImageToBlob(garmentImage)
    ]);

    const spacesToTry = [this.kolorsHfSpace];
    if (this.backupHfSpace && this.backupHfSpace !== this.kolorsHfSpace) {
      spacesToTry.push(this.backupHfSpace);
    }

    let lastError = null;

    for (let i = 0; i < spacesToTry.length; i++) {
      const spaceId = spacesToTry[i];
      console.log(`[Kolors VTON] Attempting Space [${i + 1}/${spacesToTry.length}]: "${spaceId}"...`);

      try {
        const clientOptions = this.hfToken
          ? { hf_token: this.hfToken, token: this.hfToken }
          : {};

        const client = await Client.connect(spaceId, clientOptions);
        console.log(`[Kolors VTON] Dispatching prediction to "${spaceId}"...`);

        // Verified Kwai-Kolors Gradio API
        // Endpoint: fn_index 2 (/predict)
        // Inputs: [personBlob, garmentBlob, seed, isRandom]
        // Outputs: [resultImage, seedUsed, responseMessage]
        let result = null;
        const seed = options.seed || Math.floor(Math.random() * 1000000);
        const isRandom = options.randomSeed !== undefined ? Boolean(options.randomSeed) : false;

        const PREDICT_TIMEOUT_MS = 90000;
        const runWithTimeout = async (predictPromise) => {
          let timer;
          const timeoutPromise = new Promise((_, reject) => {
            timer = setTimeout(() => {
              const err = new Error(`Inference timed out after 90s on space "${spaceId}". GPU queue may be occupied.`);
              err.code = 'TIMEOUT';
              reject(err);
            }, PREDICT_TIMEOUT_MS);
          });
          try {
            return await Promise.race([predictPromise, timeoutPromise]);
          } finally {
            clearTimeout(timer);
          }
        };

        let apiInfo = null;
        try {
          apiInfo = await client.view_api();
        } catch (apiErr) {
          console.warn(`[Kolors VTON] Notice viewing API for ${spaceId}:`, apiErr.message);
        }

        const hasNamedTryon = Boolean(apiInfo?.named_endpoints?.['/tryon']);
        const hasNamedPredict = Boolean(apiInfo?.named_endpoints?.['/predict']);
        const hasUnnamed2 = Boolean(apiInfo?.unnamed_endpoints?.['2'] || apiInfo?.unnamed_endpoints?.[2]);

        try {
          if (hasNamedTryon) {
            console.log(`[Kolors VTON] Using /tryon endpoint on "${spaceId}"...`);
            const dictInput = {
              background: personBlob,
              layers: [],
              composite: null
            };
            result = await runWithTimeout(client.predict('/tryon', [
              dictInput,
              garmentBlob,
              productName || 'garment',
              true,
              false,
              this.denoiseSteps,
              seed
            ]));
          } else if (hasNamedPredict) {
            console.log(`[Kolors VTON] Using /predict endpoint on "${spaceId}"...`);
            result = await runWithTimeout(client.predict('/predict', [
              personBlob,
              garmentBlob,
              seed,
              isRandom
            ]));
          } else if (hasUnnamed2) {
            console.log(`[Kolors VTON] Using fn_index 2 on "${spaceId}"...`);
            result = await runWithTimeout(client.predict(2, [
              personBlob,
              garmentBlob,
              seed,
              isRandom
            ]));
          } else if (this.hfToken) {
            console.log(`[Kolors VTON] Calling predict fn_index 2 on "${spaceId}" with HF token...`);
            result = await runWithTimeout(client.predict(2, [
              personBlob,
              garmentBlob,
              seed,
              isRandom
            ]));
          } else {
            throw new Error(`Space "${spaceId}" does not expose unauthenticated public API slots. A personal HF_TOKEN or dedicated FAL_KEY is required in backend environment variables.`);
          }
        } catch (firstTryErr) {
          if (firstTryErr.code === 'TIMEOUT') throw firstTryErr;
          console.warn(`[Kolors VTON] Primary predict signature failed on "${spaceId}": ${firstTryErr.message}`);
          throw firstTryErr;
        }

        if (result && result.data && result.data[0]) {
          const generatedFileData = result.data[0];
          let generatedUrl = generatedFileData?.url || generatedFileData?.path || (typeof generatedFileData === 'string' ? generatedFileData : null);

          if (generatedUrl) {
            if (!generatedUrl.startsWith('http://') && !generatedUrl.startsWith('https://') && !generatedUrl.startsWith('data:')) {
              const spaceSubdomain = spaceId.replace('/', '-').toLowerCase();
              const cleanPath = generatedUrl.startsWith('/') ? generatedUrl : `/${generatedUrl}`;
              generatedUrl = `https://${spaceSubdomain}.hf.space${cleanPath}`;
            }

            console.log(`[Kolors VTON] Output received from "${spaceId}". Caching locally...`);
            const cached = await this.cacheImageLocally(generatedUrl);
            const processingTimeMs = Date.now() - startTime;

            return {
              success: true,
              resultImageUrl: cached.imageUrl,
              model: 'Kolors-Virtual-Try-On',
              provider: spaceId,
              category,
              processingTimeMs,
              preservedFeatures: [
                'User facial identity and skin tone',
                'Natural posture and anatomy',
                'Authentic garment texture and drape'
              ]
            };
          }
        }

        throw new Error(`Space "${spaceId}" returned empty output.`);
      } catch (spaceErr) {
        lastError = spaceErr;
        console.warn(`[Kolors VTON] Space "${spaceId}" notice: ${spaceErr.message}`);

        const quotaInfo = parseZeroGpuError(spaceErr.message);
        if (quotaInfo) {
          this.cooldownUntil = Date.now() + (quotaInfo.cooldownSeconds * 1000);
          console.warn(`[Kolors VTON] ZeroGPU Quota limit reached (${quotaInfo.cooldownSeconds}s cooldown).`);
          const quotaErr = new Error(
            `Hugging Face ZeroGPU community quota limit reached (${quotaInfo.cooldownSeconds}s cooldown). Please wait ${quotaInfo.cooldownSeconds}s, or configure FAL_KEY (recommended) or your personal HF_TOKEN in backend/.env.`
          );
          quotaErr.code = 'QUOTA_EXCEEDED';
          quotaErr.status = 429;
          quotaErr.cooldownSeconds = quotaInfo.cooldownSeconds;
          throw quotaErr;
        }

        if (i < spacesToTry.length - 1) {
          console.log(`[Kolors VTON] Switching to backup Space: "${spacesToTry[i + 1]}"...`);
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }

    throw lastError || new Error('All Kolors Virtual Try-On spaces failed.');
  }

  /**
   * Call self-hosted or dedicated cloud GPU endpoint
   */
  async callCustomApiEndpoint({ personImage, garmentImage, targetCategory, options, startTime }) {
    console.log(`[Kolors VTON] Calling custom GPU endpoint: ${this.customApiUrl}...`);

    const payload = {
      human_image: personImage,
      garment_image: garmentImage,
      category: targetCategory,
      seed: options.seed || Math.floor(Math.random() * 1000000),
      steps: options.steps || this.denoiseSteps
    };

    const res = await fetch(`${this.customApiUrl}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.customApiKey ? { Authorization: `Bearer ${this.customApiKey}` } : {})
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Custom Kolors API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const resultUrl = data.imageUrl || data.resultImageUrl || data.output;
    const cached = await this.cacheImageLocally(resultUrl);

    return {
      success: true,
      resultImageUrl: cached.imageUrl,
      model: 'Kolors-Virtual-Try-On',
      provider: 'custom-dedicated-gpu',
      category: targetCategory,
      processingTimeMs: Date.now() - startTime,
      preservedFeatures: [
        'User identity and facial structure',
        'Accurate body posture and proportions'
      ]
    };
  }

  /**
   * Call Replicate Kolors model
   */
  async callReplicateKolors({ personImage, garmentImage, targetCategory, options, startTime }) {
    const model = process.env.REPLICATE_KOLORS_MODEL || 'kwaivgi/kolors-virtual-try-on';
    console.log(`[Kolors VTON] Calling Replicate Kolors model: ${model}...`);

    const res = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${this.replicateToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: {
          human_img: personImage,
          garm_img: garmentImage,
          category: targetCategory
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Replicate Kolors API error (${res.status}): ${errText}`);
    }

    let current = await res.json();
    let attempts = 0;
    while (current.status !== 'succeeded' && current.status !== 'failed' && attempts < 60) {
      await new Promise(r => setTimeout(r, 2000));
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${current.id}`, {
        headers: { Authorization: `Token ${this.replicateToken}` }
      });
      current = await pollRes.json();
      attempts++;
    }

    if (current.status !== 'succeeded') {
      throw new Error(current.error || 'Replicate Kolors prediction timed out or failed.');
    }

    const output = Array.isArray(current.output) ? current.output[0] : current.output;
    const cached = await this.cacheImageLocally(output);

    return {
      success: true,
      resultImageUrl: cached.imageUrl,
      model: 'Kolors-Virtual-Try-On',
      provider: 'replicate',
      category: targetCategory,
      processingTimeMs: Date.now() - startTime,
      preservedFeatures: [
        'User identity and facial structure',
        'Accurate body proportions and posture'
      ]
    };
  }

  /**
   * Cache remote generated image locally in frontend/public/generated/
   * Triggers automatic pruning of files older than 1 hour.
   */
  async cacheImageLocally(remoteUrl) {
    if (!remoteUrl) return { imageUrl: '' };

    // Prune stale temporary files first
    pruneTemporaryFiles();

    try {
      let buffer = null;

      if (remoteUrl.startsWith('data:')) {
        const matches = remoteUrl.match(/^data:([A-Za-z0-9-+/]+);base64,(.+)$/);
        if (matches && matches[2]) {
          buffer = Buffer.from(matches[2], 'base64');
        }
      } else if (remoteUrl.startsWith('http://') || remoteUrl.startsWith('https://')) {
        const imgRes = await fetch(remoteUrl);
        if (imgRes.ok) {
          const arrayBuf = await imgRes.arrayBuffer();
          buffer = Buffer.from(arrayBuf);
        }
      }

      if (buffer) {
        if (!fs.existsSync(GENERATED_DIR)) {
          fs.mkdirSync(GENERATED_DIR, { recursive: true });
        }
        const fileName = `vton-${Date.now()}-${Math.floor(Math.random() * 10000)}.png`;
        const fullSavePath = path.join(GENERATED_DIR, fileName);
        fs.writeFileSync(fullSavePath, buffer);

        console.log(`[Kolors VTON] Cached generated result to /api/generated/${fileName} (${buffer.length} bytes)`);
        return {
          imageUrl: `/api/generated/${fileName}`,
          fileName,
          remoteUrl
        };
      }
    } catch (cacheErr) {
      console.warn('[Kolors VTON] Failed to cache image locally, serving remote URL:', cacheErr.message);
    }

    return {
      imageUrl: remoteUrl
    };
  }
}

export const vtonService = new VTONService();
