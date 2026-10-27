/**
 * FITFUSION Frontend VTON Client Service
 * Dispatches virtual try-on requests to the secure FITFUSION backend.
 * Never stores or exposes private model API keys in the browser.
 */

function getBackendBaseUrl() {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '');
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');
  }
  // In production builds, use relative origin by default so it works on any domain
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    return '';
  }
  return 'http://localhost:5000';
}

export class VTONClientService {
  /**
   * Get list of candidate endpoints for high-reliability connection
   */
  static getCandidateEndpoints(endpointPath) {
    const base = getBackendBaseUrl();
    const cleanPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
    const candidates = [];

    if (base) {
      candidates.push(`${base}${cleanPath}`);
    }
    candidates.push(cleanPath);

    // In local dev, also try 127.0.0.1 if base used localhost (and vice versa) to prevent Windows dual-stack socket errors
    if (!import.meta.env.PROD) {
      if (!candidates.includes(`http://127.0.0.1:5000${cleanPath}`)) {
        candidates.push(`http://127.0.0.1:5000${cleanPath}`);
      }
      if (!candidates.includes(`http://localhost:5000${cleanPath}`)) {
        candidates.push(`http://localhost:5000${cleanPath}`);
      }
    }

    return Array.from(new Set(candidates));
  }

  /**
   * Check status of the backend VTON service
   */
  static async checkStatus() {
    const candidateUrls = VTONClientService.getCandidateEndpoints('/api/vton/status');

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        // Try next fallback URL
      }
    }

    return {
      available: false,
      error: 'Unable to reach FITFUSION backend service.'
    };
  }

  /**
   * Check AnyWear / Decart live try-on status
   */
  static async checkAnyWearStatus() {
    const candidateUrls = VTONClientService.getCandidateEndpoints('/api/vton/anywear/status');

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        // Try next fallback candidate
      }
    }

    return {
      success: false,
      configured: false,
      externalStudioUrl: 'https://anywear.live/',
      tryOnUrl: 'https://anywear.live/try-on',
      message: 'AnyWear requires external Decart merchant whitelist. Direct streaming unconfigured.'
    };
  }

  /**
   * Dispatch Virtual Try-On request to backend
   * @param {Object} params
   * @param {string} params.personImage - Base64 Data URL or public image URL of the user
   * @param {string} params.garmentImage - Verified realistic product image URL
   * @param {string} params.garmentCategory - Clothing category (e.g. 'Shirts', 'T-Shirts', 'Dresses')
   * @param {string} params.productId - Product ID
   * @param {string} params.productName - Product Title
   * @param {Object} [params.options] - Customization parameters
   */
  static async generateTryOn({
    personImage,
    garmentImage,
    garmentCategory,
    productId,
    productName,
    options = {},
    signal = null
  }) {
    if (!personImage) {
      throw new Error('Please take or upload a photo of yourself first.');
    }
    if (!garmentImage) {
      throw new Error('Please select a FITFUSION garment to try on.');
    }

    // Resolve absolute URL for garment image if local relative path
    let resolvedGarmentUrl = garmentImage;
    if (garmentImage.startsWith('/')) {
      resolvedGarmentUrl = `${window.location.origin}${garmentImage}`;
    }

    // Set 95-second timeout for inference queue
    const timeoutController = new AbortController();
    const timeoutTimer = setTimeout(() => {
      timeoutController.abort('TIMEOUT');
    }, 95000);

    const onUserAbort = () => {
      clearTimeout(timeoutTimer);
      timeoutController.abort('USER_ABORT');
    };

    if (signal) {
      if (signal.aborted) {
        clearTimeout(timeoutTimer);
        return {
          success: false,
          available: true,
          code: 'CANCELLED',
          error: 'Virtual try-on request was cancelled.'
        };
      }
      signal.addEventListener('abort', onUserAbort, { once: true });
    }

    const candidateUrls = VTONClientService.getCandidateEndpoints('/api/vton/try-on');

    let lastError = null;

    try {
      for (const url of candidateUrls) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              personImage,
              garmentImage: resolvedGarmentUrl,
              garmentCategory,
              productId,
              productName,
              options
            }),
            signal: timeoutController.signal
          });

          const data = await res.json();

          if (!res.ok || !data.success) {
            return {
              success: false,
              available: data.available !== undefined ? data.available : false,
              code: data.code || 'VTON_UNAVAILABLE',
              cooldownSeconds: data.cooldownSeconds || null,
              retryAfter: data.retryAfter || null,
              error: data.error || 'Virtual try-on service is currently unavailable.',
              instructions: data.instructions || null
            };
          }

          let resolvedResultImageUrl = data.resultImageUrl;
          if (resolvedResultImageUrl && typeof resolvedResultImageUrl === 'string' && resolvedResultImageUrl.startsWith('/') && !resolvedResultImageUrl.startsWith('data:')) {
            const backendBase = getBackendBaseUrl();
            if (backendBase) {
              resolvedResultImageUrl = `${backendBase}${resolvedResultImageUrl}`;
            }
          }

          return {
            success: true,
            available: true,
            resultImageUrl: resolvedResultImageUrl,
            model: data.model || 'Kolors-Virtual-Try-On',
            provider: data.provider,
            category: data.category,
            processingTimeMs: data.processingTimeMs,
            preservedFeatures: data.preservedFeatures || []
          };
        } catch (networkErr) {
          lastError = networkErr;
          if (timeoutController.signal.aborted || signal?.aborted) {
            const isTimeout = timeoutController.signal.reason === 'TIMEOUT' || networkErr.name === 'TimeoutError';
            if (isTimeout) {
              return {
                success: false,
                available: false,
                code: 'TIMEOUT',
                error: 'Virtual try-on request timed out after 95 seconds while waiting for the AI model queue. Please retry or configure dedicated backend provider credentials.'
              };
            }
            return {
              success: false,
              available: true,
              code: 'CANCELLED',
              error: 'Virtual try-on request was cancelled.'
            };
          }
          // If first attempt failed with network error, continue loop to try fallback candidate URL
        }
      }
    } finally {
      clearTimeout(timeoutTimer);
      if (signal) {
        signal.removeEventListener('abort', onUserAbort);
      }
    }

    return {
      success: false,
      available: false,
      code: 'NETWORK_ERROR',
      error: 'Virtual try-on service is currently unavailable. Backend connection could not be established.'
    };
  }
}
