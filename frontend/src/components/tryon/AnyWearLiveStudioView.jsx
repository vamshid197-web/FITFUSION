import React, { useState, useEffect } from 'react';
import { VTONClientService } from '../../services/vtonClientService';

/**
 * AnyWearLiveStudioView
 * Integrates AnyWear (Decart AI Lucy V-TON) live video virtual try-on reference,
 * provides verified integration architecture, device readiness assistant, and
 * direct launch to the official external application.
 */
export default function AnyWearLiveStudioView({ catalogProducts = [] }) {
  const [anywearStatus, setAnywearStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'hardware' | 'catalog' | 'architecture'
  const [hardwareState, setHardwareState] = useState({
    checking: false,
    tested: false,
    granted: false,
    error: null,
    devices: [],
    activeDeviceName: null,
    resolution: null
  });
  const [copiedUrl, setCopiedUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;
    VTONClientService.checkAnyWearStatus().then((status) => {
      if (isMounted) {
        setAnywearStatus(status);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Hardware readiness diagnostic (checks browser camera capability without fake overlays)
  const runHardwareDiagnostic = async () => {
    setHardwareState((prev) => ({ ...prev, checking: true, error: null }));
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support WebRTC media devices.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack ? videoTrack.getSettings() : {};
      const label = videoTrack ? videoTrack.label : 'Default Camera';

      // Enumerate other devices
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices.filter((d) => d.kind === 'videoinput');

      // Release media stream tracks immediately so camera is free
      stream.getTracks().forEach((track) => track.stop());

      setHardwareState({
        checking: false,
        tested: true,
        granted: true,
        error: null,
        devices: videoInputs,
        activeDeviceName: label || 'WebRTC Video Input',
        resolution: settings.width && settings.height ? `${settings.width}x${settings.height}` : '720p HD'
      });
    } catch (err) {
      setHardwareState({
        checking: false,
        tested: true,
        granted: false,
        error: err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser address bar.'
          : err.message || 'Unable to access video device.',
        devices: [],
        activeDeviceName: null,
        resolution: null
      });
    }
  };

  const closeHardwareDiagnostic = () => {
    setHardwareState({
      checking: false,
      tested: false,
      granted: false,
      error: null,
      devices: [],
      activeDeviceName: null,
      resolution: null
    });
  };


  const copyProductImageLink = (url) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2500);
    }
  };

  // Filter top garments from catalog safely
  const eligibleGarments = Array.isArray(catalogProducts)
    ? catalogProducts
        .filter((p) => p && p.image && !p.image.includes('placeholder'))
        .slice(0, 6)
    : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Decart AI • Lucy V-TON
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Camera Try-On
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                External Application
              </span>
            </div>

            <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              AnyWear Live Virtual Try-On
            </h2>

            <p className="text-neutral-300 text-sm md:text-base leading-relaxed">
              Experience real-time, video-rate neural virtual try-on powered by Decart AI’s{' '}
              <strong className="text-white">Lucy V-TON</strong> model. Unlike static photo generators,
              AnyWear runs on a live camera stream with frame-by-frame fabric drape and natural body movement.
            </p>

            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="text-purple-400 font-bold">Official Application Reference:</span>
              <code className="text-neutral-300 font-mono bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                https://anywear.live
              </code>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
            <a
              href="https://anywear.live/try-on"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Launch AnyWear Live Studio</span>
              <span className="text-lg">&rarr;</span>
            </a>

            <a
              href="https://anywear.live/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-200 text-xs font-bold transition-all text-center"
            >
              <span>Visit AnyWear Homepage ↗</span>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white font-black shadow-md'
              : 'text-neutral-400 hover:text-white bg-neutral-900/50'
          }`}
        >
          <span>📋</span>
          <span>Overview & Architecture</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hardware')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'hardware'
              ? 'bg-purple-600 text-white font-black shadow-md'
              : 'text-neutral-400 hover:text-white bg-neutral-900/50'
          }`}
        >
          <span>📷</span>
          <span>Device Readiness Assistant</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'bg-purple-600 text-white font-black shadow-md'
              : 'text-neutral-400 hover:text-white bg-neutral-900/50'
          }`}
        >
          <span>👗</span>
          <span>Eligible Catalog Garments</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('architecture')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'architecture'
              ? 'bg-purple-600 text-white font-black shadow-md'
              : 'text-neutral-400 hover:text-white bg-neutral-900/50'
          }`}
        >
          <span>⚙️</span>
          <span>Merchant Integration & Sandbox</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: OVERVIEW & COMPARISON                                          */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Engineering Integrity Notice */}
          <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs leading-relaxed space-y-2">
            <div className="flex items-center gap-2 font-black text-amber-400 text-sm">
              <span>⚠️</span>
              <span>Truth in Engineering & Integration Notice</span>
            </div>
            <p>
              FITFUSION does <strong>not</strong> simulate or mock virtual try-on by simply opening your device webcam and placing a static 2D graphic overlay on top of the screen. Genuine real-time virtual try-on is an advanced deep-learning problem that requires neural video synthesis running at 24+ frames per second on dedicated server GPUs (Decart Lucy V-TON).
            </p>
            <p>
              Because AnyWear requires an enterprise merchant domain whitelist and billing contract ($0.02–$0.04/second), FITFUSION provides seamless external launch directly to the official AnyWear application so you can try on clothes with zero delays.
            </p>
          </div>

          {/* 3-Column Technology Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-lg">
                ⚡
              </div>
              <h3 className="text-sm font-black text-white">Video-Rate AI Generation</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Powered by Decart AI’s Lucy V-TON video foundation model. Rather than generating a single image after 10–20 seconds, it synthesizes smooth video in real-time over WebRTC.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg">
                🔄
              </div>
              <h3 className="text-sm font-black text-white">Physical Fabric Movement</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Garments track your 3D pose, torso angle, arm movement, and fabric folding. You can turn sideways and step back to evaluate fit from all angles.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-lg">
                🎟️
              </div>
              <h3 className="text-sm font-black text-white">Trial Tiers & Usage</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                AnyWear offers 3 free trial tries (20 seconds each) on their official site. Additional session packs are available via one-time payments ($1.99–$19.99 for 60–1050 seconds).
              </p>
            </div>
          </div>

          {/* Comparison Table: In-App Kolors vs AnyWear Live */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-base font-extrabold text-white">
              Try-On Experience Comparison: In-App Kolors vs. AnyWear Live
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400">
                    <th className="py-3 px-4">Feature</th>
                    <th className="py-3 px-4 text-amber-400 font-bold">FITFUSION Kolors AI (In-App)</th>
                    <th className="py-3 px-4 text-purple-400 font-bold">AnyWear Live Studio (Decart)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Input Modality</td>
                    <td className="py-3 px-4">Uploaded photo or studio model reference</td>
                    <td className="py-3 px-4">Live video camera stream (WebRTC)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Output Format</td>
                    <td className="py-3 px-4">Ultra-high resolution static photograph</td>
                    <td className="py-3 px-4">Live continuous video stream (24+ FPS)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Processing Time</td>
                    <td className="py-3 px-4">8–15 seconds per generation</td>
                    <td className="py-3 px-4">Instant continuous streaming</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">FITFUSION Catalog Sync</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">Direct in-app catalog selection</td>
                    <td className="py-3 px-4">External reference & schema ingestion</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Cost & Access</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">Free in FITFUSION (Hugging Face / Fal)</td>
                    <td className="py-3 px-4">3 free tries, then $1.99+ time packs</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Location</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">Native inside FITFUSION</td>
                    <td className="py-3 px-4">External official studio (anywear.live)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: DEVICE READINESS ASSISTANT                                     */}
      {/* ========================================================================= */}
      {activeTab === 'hardware' && (
        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>📷</span>
              <span>Camera Hardware & Device Readiness Assistant</span>
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
              Before opening AnyWear Live, you can verify that your browser and camera hardware support high-definition video capture. This tool checks your browser’s WebRTC video capabilities and immediately stops and frees the camera device.
            </p>
          </div>

          {!hardwareState.tested && !hardwareState.checking && (
            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto text-2xl font-bold">
                📹
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Ready to Check Camera Capabilities?</h4>
                <p className="text-xs text-neutral-400">
                  Your browser will ask for one-time camera permission. All tracks will be released immediately after verification.
                </p>
              </div>
              <button
                type="button"
                onClick={runHardwareDiagnostic}
                className="w-full py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
              >
                Check Device Camera Readiness
              </button>
            </div>
          )}

          {hardwareState.checking && (
            <div className="p-8 rounded-2xl bg-neutral-950 border border-neutral-800 text-center space-y-3 max-w-md mx-auto">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-neutral-300 font-bold">Querying camera devices...</p>
            </div>
          )}

          {hardwareState.tested && (
            <div className="space-y-4 max-w-lg mx-auto">
              {hardwareState.granted ? (
                <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-emerald-300">Camera Device Verified & Ready</h4>
                      <p className="text-xs text-emerald-400/80">
                        Your browser is fully equipped for live WebRTC video try-on.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-950 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>Detected Device:</span>
                      <span className="font-bold text-white">{hardwareState.activeDeviceName}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Capture Capability:</span>
                      <span className="font-bold text-white">{hardwareState.resolution}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Available Video Devices:</span>
                      <span className="font-bold text-white">{hardwareState.devices.length}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Hardware Status:</span>
                      <span className="font-bold text-emerald-400">Released & Free for AnyWear</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href="https://anywear.live/try-on"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 text-center rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider transition-all"
                    >
                      Proceed to AnyWear Live Studio &rarr;
                    </a>
                    <button
                      type="button"
                      onClick={closeHardwareDiagnostic}
                      className="px-4 py-3 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white text-xs font-bold transition-all"
                    >
                      Close Hardware Test
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/50 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-black">
                      ✕
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-red-300">Camera Not Available</h4>
                      <p className="text-xs text-red-400/80">{hardwareState.error}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={runHardwareDiagnostic}
                    className="w-full py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-bold hover:bg-neutral-800 transition-all"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: ELIGIBLE CATALOG GARMENTS                                      */}
      {/* ========================================================================= */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>👗</span>
              <span>FITFUSION Garments for Virtual Try-On</span>
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              These high-resolution garments from the FITFUSION catalog are formatted with clean studio photography on neutral backgrounds, making them optimal candidates for neural video virtual try-on models like Decart Lucy V-TON.
            </p>
          </div>

          {eligibleGarments.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 text-xs bg-neutral-950 rounded-2xl border border-neutral-800 space-y-1">
              <p className="font-bold text-neutral-300">No matching garments found.</p>
              <p className="text-neutral-500">Try clearing the search query or category filter to view eligible garments.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {eligibleGarments.map((product) => (
                <div
                  key={product.id}
                  className="group rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden hover:border-purple-500/50 transition-all shadow-lg flex flex-col justify-between"
                >
                  <div className="relative aspect-[3/4] bg-neutral-950 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/70 text-white backdrop-blur-md border border-neutral-700">
                      {product.category}
                    </div>
                    <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md text-[10px] font-black bg-amber-500 text-neutral-950">
                      ₹{product.price}
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-white truncate">{product.name}</h4>
                      <p className="text-[11px] text-neutral-400 line-clamp-1">
                        {product.description || 'Premium tailored fabric'}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => copyProductImageLink(product.image)}
                        className="flex-1 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>{copiedUrl === product.image ? '✓ Copied' : '🔗 Copy Image URL'}</span>
                      </button>
                      <a
                        href="https://anywear.live/try-on"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white text-[11px] font-bold transition-all flex items-center justify-center"
                        title="Open in AnyWear"
                      >
                        Try ↗
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: MERCHANT INTEGRATION & SANDBOX                                 */}
      {/* ========================================================================= */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          {/* Decart Widget Script Architecture */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>⚙️</span>
              <span>Decart AnyWear Official Merchant Architecture</span>
            </h3>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Decart provides an official asynchronous widget loader designed for fashion e-commerce storefronts:
            </p>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-purple-300 overflow-x-auto">
              <code>&lt;script src="https://anywear.decart.ai/widget/latest/anywear.js?domain=fitfusion.com" async&gt;&lt;/script&gt;</code>
            </div>

            <div className="space-y-2 text-xs text-neutral-400 leading-relaxed">
              <h4 className="font-bold text-white text-xs">How the Widget Works Behind the Scenes:</h4>
              <ol className="list-decimal list-inside space-y-1.5 pl-1">
                <li>
                  <strong className="text-neutral-200">Catalog Detection:</strong> The script scans the page for schema tags (<code>&lt;script type="application/ld+json"&gt;</code>) containing <code>@type: "Product"</code>.
                </li>
                <li>
                  <strong className="text-neutral-200">Session Token Authorization:</strong> The widget makes a <code>POST</code> request to <code>https://anywear.decart.ai/api/tokens</code> with your domain name.
                </li>
                <li>
                  <strong className="text-neutral-200">Merchant Whitelisting Gate:</strong> If your domain is whitelisted under an active Decart enterprise agreement, it returns a signed WebRTC session token. If the domain is not whitelisted, the endpoint returns <code>403 Forbidden</code>.
                </li>
                <li>
                  <strong className="text-neutral-200">Live Video Stream:</strong> Once authenticated, the widget establishes a peer-to-peer WebRTC connection to Decart’s GPU cluster to stream live video at $0.02–$0.04/second.
                </li>
              </ol>
            </div>
          </div>

          {/* Decart Merchant Integration Status */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black text-white">AnyWear Merchant Whitelist Status</h4>
                <p className="text-xs text-neutral-400">
                  Verified server-side via FITFUSION backend configuration check.
                </p>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                anywearStatus?.configured
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {anywearStatus?.configured ? 'Enterprise Whitelisted' : 'Enterprise Contract Required'}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950 text-xs space-y-2 text-neutral-300">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Status:</span>
                <span className="text-amber-400 font-mono">{anywearStatus?.status || 'unconfigured'}</span>
              </div>
              <p className="leading-relaxed">
                {anywearStatus?.message || 'AnyWear requires commercial Decart merchant domain whitelisting and DECART_API_KEY for direct in-website streaming. Launch the official studio at anywear.live for live camera sessions.'}
              </p>
            </div>
          </div>

          {/* Backend Configuration Instructions */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h4 className="text-sm font-black text-white">Commercial Setup Steps for FITFUSION Administrators</h4>
            <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
              <p>
                To enable direct, unbranded WebRTC live virtual try-on on FITFUSION when commercial enterprise access is contracted:
              </p>
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] space-y-1 text-neutral-300">
                <div className="text-neutral-500"># Add to backend/.env:</div>
                <div><span className="text-purple-400">DECART_API_KEY</span>=decart_live_xxxxxxxxxxxxxxxx</div>
                <div><span className="text-purple-400">DECART_MERCHANT_DOMAIN</span>=fitfusion.yourdomain.com</div>
              </div>
              <p className="text-neutral-400">
                Contact Decart AI via their merchant portal at{' '}
                <a
                  href="https://decart.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 underline font-bold"
                >
                  https://decart.ai
                </a>{' '}
                to request domain whitelisting and obtain a production API token.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
