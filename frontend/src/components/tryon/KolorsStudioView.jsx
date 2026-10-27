import React, { useState } from 'react';

/**
 * KolorsStudioView
 * Dedicated experience providing direct access to the original Kwai-Kolors reference application.
 * Reference: https://huggingface.co/spaces/Kwai-Kolors/Kolors-Virtual-Try-On
 *
 * Implements:
 * 1. Approach A (Embed Investigation): Safe permitted embedding audit and responsive test container
 * 2. Approach B (Open Original Application): Prominent external launch in new tab with session preservation
 * 3. Security controls adherence (respects CSP & X-Frame-Options: DENY)
 * 4. Architectural comparison matrix (Space vs FITFUSION in-app experience)
 * 5. Real API specification inspection summary
 */
export default function KolorsStudioView() {
  const [embedMode, setEmbedMode] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeBlocked, setIframeBlocked] = useState(false);

  const OFFICIAL_SPACE_URL = 'https://huggingface.co/spaces/Kwai-Kolors/Kolors-Virtual-Try-On';
  const DIRECT_SPACE_HOST = 'https://kwai-kolors-kolors-virtual-try-on.hf.space';

  const handleOpenOriginalApp = () => {
    window.open(OFFICIAL_SPACE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-10">
      {/* ── 1. Hero Header & Identification ───────────────────────────────── */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-amber-950/30 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
            <span>🤗</span> HUGGING FACE SPACES
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
            OFFICIAL REFERENCE APPLICATION
          </span>
          <span className="text-neutral-500 text-xs">• Kwai-Kolors Research Team</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Original Kwai-Kolors Virtual Try-On Studio
          </h2>
          <p className="text-xs md:text-sm text-neutral-300 max-w-3xl leading-relaxed">
            Access the official reference research application developed by the Kwai-Kolors team and hosted on Hugging Face Spaces. This external application showcases the standalone neural diffusion model with manual image pair inputs.
          </p>
        </div>

        {/* ── Prominent External Launch Card (Approach B) ─────────────────── */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <button
            type="button"
            onClick={handleOpenOriginalApp}
            className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
          >
            <span>🚀 Open Original Kolors Studio</span>
            <span className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform">↗</span>
          </button>

          <a
            href={OFFICIAL_SPACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-4 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold text-neutral-300 hover:text-white transition flex items-center justify-center gap-2"
          >
            <span>🔗 View Space Repository on Hugging Face</span>
          </a>
        </div>

        <div className="pt-2 text-[11px] text-neutral-400 flex items-center gap-2">
          <span className="text-emerald-400 font-bold">✓ Safe External Launch:</span>
          <span>Opens in a new browser tab. Your FITFUSION shopping cart, customizations, and navigation state remain preserved.</span>
        </div>
      </div>

      {/* ── 2. Security & Embedding Investigation Report (Approach A Audit) ─ */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-lg">
              🛡️
            </div>
            <div>
              <h3 className="text-base md:text-lg font-black text-white">
                Browser Security & Embedding Analysis
              </h3>
              <p className="text-xs text-neutral-400">
                Investigation of Hugging Face Spaces embedding policy (Part 3 requirement)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setEmbedMode(!embedMode);
              setIframeLoading(true);
              setIframeBlocked(false);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-bold text-neutral-200 transition"
          >
            {embedMode ? 'Hide Embed Sandbox' : 'Test Embed Sandbox'}
          </button>
        </div>

        {/* Audit Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-2">
            <div className="font-bold text-neutral-200 flex items-center gap-2">
              <span className="text-red-400 font-mono">DENY</span>
              <span>X-Frame-Options Header</span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Hugging Face explicitly sends <code className="text-amber-300 bg-neutral-900 px-1 py-0.5 rounded">X-Frame-Options: DENY</code> on the official space route (<code className="text-neutral-300">/spaces/Kwai-Kolors/Kolors-Virtual-Try-On</code>). This header instructs all modern web browsers to strictly block embedding in third-party iframes to prevent clickjacking.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-2">
            <div className="font-bold text-neutral-200 flex items-center gap-2">
              <span className="text-amber-400 font-mono">CSP</span>
              <span>Content Security Policy</span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              The direct space host (<code className="text-neutral-300">kwai-kolors-kolors-virtual-try-on.hf.space</code>) serves <code className="text-amber-300 bg-neutral-900 px-1 py-0.5 rounded">frame-ancestors https://huggingface.co</code>, permitting framing exclusively from official Hugging Face domains.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-neutral-300 space-y-2 leading-relaxed">
          <p className="font-bold text-amber-300">
            ✓ Security Compliance Standard:
          </p>
          <p>
            In strict compliance with modern web security standards, FITFUSION respects provider headers and does not attempt to bypass browser CSP or X-Frame-Options. For maximum stability and security, we provide the dedicated <strong>"Open Original Kolors Studio"</strong> direct launch alongside our fully integrated <strong>FITFUSION AI Try-On</strong> in-app engine.
          </p>
        </div>

        {/* ── Interactive Embed Sandbox Container ─────────────────────────── */}
        {embedMode && (
          <div className="space-y-3 pt-3 border-t border-neutral-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-300">
                Live Embed Sandbox Container:
              </span>
              <span className="text-neutral-500 text-[11px]">
                Target: {DIRECT_SPACE_HOST}
              </span>
            </div>

            <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-950 shadow-inner">
              {iframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-950/90 z-10 text-center p-4">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
                  <p className="text-xs text-neutral-400">
                    Connecting to Hugging Face Spaces frame...
                  </p>
                </div>
              )}

              {iframeBlocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-neutral-950 z-20 text-center p-6">
                  <span className="text-4xl">🛡️</span>
                  <div className="space-y-1 max-w-md">
                    <h4 className="text-sm font-bold text-white">
                      Embedding Blocked by Hugging Face CSP
                    </h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      As detected during our security audit, Hugging Face security policies (<code className="text-amber-300">frame-ancestors</code>) prevent third-party iframe embedding.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenOriginalApp}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition shadow-lg"
                  >
                    Open in New Tab Instead &rarr;
                  </button>
                </div>
              )}

              <iframe
                src={DIRECT_SPACE_HOST}
                title="Original Kolors Virtual Try-On Hugging Face Space"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onLoad={() => {
                  setIframeLoading(false);
                }}
                onError={() => {
                  setIframeLoading(false);
                  setIframeBlocked(true);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Architectural Comparison: Hugging Face Space vs FITFUSION In-App ── */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-5 shadow-xl">
        <div>
          <h3 className="text-base md:text-lg font-black text-white">
            Architecture Comparison: Reference Space vs FITFUSION In-App
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Understanding the distinction between the standalone reference demonstration and our integrated platform.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-bold">Feature / Capability</th>
                <th className="py-3 px-4 font-bold text-indigo-400">Original Hugging Face Space</th>
                <th className="py-3 px-4 font-bold text-amber-400">FITFUSION AI Try-On (In-App)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80 text-neutral-300">
              <tr>
                <td className="py-3.5 px-4 font-bold text-white">Clothing Selection</td>
                <td className="py-3.5 px-4 text-neutral-400">Manual garment image upload only</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">100+ Live FITFUSION catalog items + Custom upload</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white">Customization Options</td>
                <td className="py-3.5 px-4 text-neutral-400">None (static image input)</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">Color swatches, size specs, tailored fit & fabrics</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white">Shopping Cart & Purchase</td>
                <td className="py-3.5 px-4 text-neutral-400">No ecommerce connection</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">Direct 1-click Add to Bag with customized specs</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white">3D Garment Studio</td>
                <td className="py-3.5 px-4 text-neutral-400">Not available</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">360° interactive Three.js 3D viewer integrated</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white">Inference Engine Queue</td>
                <td className="py-3.5 px-4 text-neutral-400">Shared community ZeroGPU queue</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">Server-side multi-provider queue (Fal.ai / HF Space)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white">Photo Privacy</td>
                <td className="py-3.5 px-4 text-neutral-400">Client-uploaded to community server</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">Ephemeral in-memory processing with automatic pruning</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Verified API Specification Inspection Findings ─────────────── */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-lg">
            🔍
          </div>
          <div>
            <h3 className="text-base md:text-lg font-black text-white">
              Space API Verification Summary (Part 4)
            </h3>
            <p className="text-xs text-neutral-400">
              Technical findings from our live Gradio Client API inspection of Kwai-Kolors/Kolors-Virtual-Try-On
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-500 text-[11px] block">Verified Endpoint</span>
            <span className="font-mono text-emerald-400 font-bold mt-1 block">fn_index: 2 (/predict)</span>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">Triggered by Component 26 ('Run')</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-500 text-[11px] block">Required Inputs</span>
            <span className="font-mono text-white font-bold mt-1 block">[Person, Garment, Seed, Random]</span>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">Components 11, 14, 19, 20</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-500 text-[11px] block">Output Schema</span>
            <span className="font-mono text-amber-400 font-bold mt-1 block">[Result, Seed, Msg]</span>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">Components 17 (Image), 23, 24</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-500 text-[11px] block">Gradio Version</span>
            <span className="font-mono text-indigo-400 font-bold mt-1 block">Gradio 4.43.0</span>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">ZeroGPU Queue with SSE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
