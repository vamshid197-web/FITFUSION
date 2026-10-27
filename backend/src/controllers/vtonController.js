/**
 * FITFUSION VTON Controller
 * Handles HTTP requests for Virtual Try-On processing and status checks.
 */

import { vtonService, mapToVtonCategory } from '../services/vtonService.js';

export const getVTONStatus = async (req, res) => {
  try {
    const status = vtonService.getStatus();
    return res.status(200).json(status);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getAnyWearStatus = async (req, res) => {
  try {
    const decartApiKey = process.env.DECART_API_KEY;
    const merchantDomain = process.env.DECART_MERCHANT_DOMAIN || process.env.CLIENT_URL || 'fitfusion.com';
    const hasKey = Boolean(decartApiKey && decartApiKey.trim());

    return res.status(200).json({
      success: true,
      provider: 'decart-anywear',
      model: 'lucy-vton-latest',
      externalStudioUrl: 'https://anywear.live/',
      tryOnUrl: 'https://anywear.live/try-on',
      widgetScriptUrl: 'https://anywear.decart.ai/widget/latest/anywear.js',
      configured: hasKey,
      requiresCredentials: true,
      requiresMerchantWhitelist: true,
      merchantDomain: merchantDomain,
      pricingModel: 'pay-per-second ($0.02 - $0.04/second of active live generation)',
      freeTierAvailable: '3 free tries (20 seconds each) on official anywear.live website',
      streamProtocol: 'WebRTC (24+ FPS Real-Time Neural Video)',
      status: hasKey ? 'configured' : 'unconfigured',
      message: hasKey
        ? 'Decart AnyWear API configured for live video try-on.'
        : 'AnyWear requires commercial Decart merchant domain whitelisting and DECART_API_KEY for direct in-website streaming. Launch the official studio at anywear.live for live camera sessions.',
      setupInstructions: {
        step1: 'Obtain Decart API Key and register your merchant domain at https://decart.ai',
        step2: 'Add DECART_API_KEY=your_key and DECART_MERCHANT_DOMAIN=yourdomain.com to backend/.env',
        step3: 'Direct WebRTC video streaming will automatically activate upon enterprise whitelist approval.'
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const executeTryOn = async (req, res) => {
  try {
    const {
      personImage,
      garmentImage,
      garmentCategory,
      productId,
      productName,
      options
    } = req.body;

    if (!personImage) {
      return res.status(400).json({
        success: false,
        error: 'Missing required person photo.'
      });
    }

    if (!garmentImage) {
      return res.status(400).json({
        success: false,
        error: 'Missing required garment image.'
      });
    }

    const result = await vtonService.processTryOn({
      personImage,
      garmentImage,
      garmentCategory: mapToVtonCategory(garmentCategory),
      productId,
      productName,
      options: options || {}
    });

    return res.status(200).json(result);
  } catch (err) {
    const statusCode = err.status || (
      err.code === 'QUOTA_COOLDOWN' || err.code === 'QUOTA_EXCEEDED'
        ? 429
        : err.code === 'CREDENTIALS_REQUIRED' || err.code === 'VTON_UNAVAILABLE'
        ? 503
        : 500
    );

    return res.status(statusCode).json({
      success: false,
      available: false,
      code: err.code || 'VTON_ERROR',
      cooldownSeconds: err.cooldownSeconds || null,
      retryAfter: err.retryAfter || null,
      error: err.message || 'Virtual try-on service is currently unavailable.',
      instructions: err.instructions || null
    });
  }
};
