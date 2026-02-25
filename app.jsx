import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload, FileText, Download, Loader2, ZoomIn, ZoomOut,
  AlertCircle, Copy, Trash2, ScanText, Sparkles,
  ChevronDown, FileJson, Printer, FileType, Table as TableIcon,
  Archive, Home, Search, Calculator, ArrowRight, Layers, Plus, Image as ImageIcon, Settings, X
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import * as pdfjsLib from 'pdfjs-dist';
import PdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Both import and worker come from pdfjs-dist@5.4.624 — versions always match
pdfjsLib.GlobalWorkerOptions.workerSrc = PdfjsWorker;

// --- Persistent rate limiter for Gemini Free Tier (15 RPM) ---
// Timestamps are stored in localStorage so they survive page reloads.
// Without this, reloading the page makes the client think the bucket is empty
// while Gemini's server-side window still counts the previous requests.
const GEMINI_MAX_RPM = 14;      // 1 below the 15 RPM hard limit
const GEMINI_WINDOW_MS = 60_000;
const GEMINI_LS_KEY = 'gemini_rate_log';

const _getRateLog = () => {
  try {
    const raw = localStorage.getItem(GEMINI_LS_KEY);
    const cutoff = Date.now() - GEMINI_WINDOW_MS;
    const all = raw ? JSON.parse(raw) : [];
    return all.filter(t => t > cutoff); // evict expired entries on read
  } catch { return []; }
};

const _pushRateLog = (ts = Date.now()) => {
  try {
    const log = _getRateLog();
    log.push(ts);
    localStorage.setItem(GEMINI_LS_KEY, JSON.stringify(log));
  } catch { /* ignore storage errors */ }
};

const _clearRateLog = () => {
  try { localStorage.removeItem(GEMINI_LS_KEY); } catch { }
};

// --- Global: Gemini API Configuration ---
// API Key is now managed via component state and localStorage

// --- Utility: Dynamic Script Loader ---
const useScript = (src, globalName) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (window[globalName]) {
      setLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => setError(true);
    document.body.appendChild(script);
  }, [src, globalName]);

  return { loaded, error };
};

// --- Custom Styles (UI-UX Pro Max: Dark Glassmorphism | PropTech SaaS) ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  /* --- RESET & BASE --- */
  * { margin: 0; padding: 0; box-sizing: border-box; }

  /* Dark canvas background with subtle grid */
  .app-root {
    background: #070d1a;
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,130,246,0.15), transparent),
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
    background-size: auto, 48px 48px, 48px 48px;
    font-family: 'Inter', system-ui, sans-serif;
    color: #e2e8f0;
    min-height: 100vh;
  }

  /* --- HEADER (glass navbar) --- */
  .app-header {
    background: rgba(10, 15, 30, 0.75);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(59,130,246,0.15);
    position: sticky; top: 0; z-index: 50;
    padding: 0 2rem;
    height: 64px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .app-logo-badge {
    background: linear-gradient(135deg, #3b82f6, #06b6d4);
    border-radius: 12px;
    padding: 8px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 20px rgba(59,130,246,0.4);
  }
  .app-header h1 {
    font-size: 1.125rem;
    font-weight: 800;
    background: linear-gradient(to right, #60a5fa, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }
  .app-header p { font-size: 10px; color: rgba(148,163,184,0.7); font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; }

  /* --- BUTTONS --- */
  .btn-primary {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 22px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border-radius: 12px;
    font-weight: 700;
    font-size: 14px;
    border: 1px solid rgba(59,130,246,0.4);
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 15px rgba(59,130,246,0.3);
    font-family: 'Inter', sans-serif;
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(59,130,246,0.45); background: linear-gradient(135deg, #60a5fa, #3b82f6); }
  .btn-primary:active { transform: scale(0.97); }

  .btn-download {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 22px;
    background: linear-gradient(135deg, #06b6d4, #0891b2);
    color: white;
    border-radius: 12px;
    font-weight: 700;
    font-size: 14px;
    border: 1px solid rgba(6,182,212,0.4);
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 15px rgba(6,182,212,0.3);
    font-family: 'Inter', sans-serif;
  }
  .btn-download:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(6,182,212,0.45); }
  .btn-download:active { transform: scale(0.97); }

  .btn-icon {
    padding: 9px;
    border-radius: 10px;
    background: transparent;
    border: 1px solid transparent;
    color: rgba(148,163,184,0.7);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex; align-items: center; justify-content: center;
  }
  .btn-icon:hover { background: rgba(255,255,255,0.06); color: #e2e8f0; border-color: rgba(255,255,255,0.1); }

  .btn-danger-text {
    display: flex; align-items: center; gap: 6px;
    background: transparent; border: none;
    color: rgba(148,163,184,0.6);
    font-size: 12px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    cursor: pointer; transition: color 0.2s;
    font-family: 'Inter', sans-serif;
  }
  .btn-danger-text:hover { color: #f87171; }

  /* --- GLASS CARD --- */
  .glass-card {
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
  }

  /* --- UPLOAD ZONE --- */
  .upload-zone {
    background: rgba(255,255,255,0.03);
    border: 2px dashed rgba(59,130,246,0.3);
    border-radius: 28px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all 0.25s ease;
    position: relative; overflow: hidden;
  }
  .upload-zone::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at center, rgba(59,130,246,0.06), transparent 70%);
    opacity: 0; transition: opacity 0.25s;
  }
  .upload-zone:hover { border-color: rgba(59,130,246,0.7); background: rgba(59,130,246,0.04); box-shadow: 0 0 40px rgba(59,130,246,0.1); }
  .upload-zone:hover::before { opacity: 1; }

  .upload-icon-wrapper {
    background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.15));
    border: 1px solid rgba(59,130,246,0.3);
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 24px;
    transition: transform 0.25s ease;
  }
  .upload-zone:hover .upload-icon-wrapper { transform: scale(1.08) translateY(-2px); }

  .upload-pill {
    margin-top: 28px;
    padding: 8px 24px;
    border-radius: 100px;
    background: rgba(59,130,246,0.12);
    border: 1px solid rgba(59,130,246,0.25);
    font-size: 11px; font-weight: 800;
    color: #60a5fa;
    text-transform: uppercase; letter-spacing: 0.12em;
    transition: all 0.2s;
  }
  .upload-zone:hover .upload-pill {
    background: linear-gradient(135deg, #3b82f6, #06b6d4);
    border-color: transparent; color: white;
    box-shadow: 0 4px 15px rgba(59,130,246,0.4);
  }

  /* --- DRAG OVERLAY --- */
  .drag-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(7, 13, 26, 0.85);
    backdrop-filter: blur(16px);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    pointer-events: none;
  }
  .drag-ring {
    border: 3px dashed rgba(59,130,246,0.7);
    border-radius: 32px;
    padding: 64px 96px;
    display: flex; flex-direction: column; align-items: center; gap: 16px;
    background: rgba(59,130,246,0.06);
    box-shadow: 0 0 80px rgba(59,130,246,0.2), inset 0 0 60px rgba(59,130,246,0.05);
    animation: drag-pulse 1.5s ease-in-out infinite;
  }
  @keyframes drag-pulse { 0%,100% { box-shadow: 0 0 60px rgba(59,130,246,0.2); } 50% { box-shadow: 0 0 100px rgba(59,130,246,0.4); } }

  /* --- SETTINGS PANEL --- */
  .settings-panel {
    background: rgba(10,15,30,0.95);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 18px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.1);
  }
  .settings-label { font-size: 12px; font-weight: 700; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.08em; display: block; }
  .settings-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 8px 12px;
    color: #e2e8f0;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    transition: border-color 0.2s;
    outline: none;
  }
  .settings-input:focus { border-color: rgba(59,130,246,0.6); box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
  .settings-input::placeholder { color: rgba(148,163,184,0.4); }

  /* --- PREVIEW BADGE --- */
  .preview-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(59,130,246,0.12);
    border: 1px solid rgba(59,130,246,0.25);
    border-radius: 100px;
    padding: 6px 16px;
    font-size: 11px; font-weight: 700;
    color: #60a5fa;
    text-transform: uppercase; letter-spacing: 0.1em;
    margin-bottom: 24px;
  }
  .preview-badge-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #3b82f6;
    box-shadow: 0 0 6px #3b82f6;
    animation: blink 2s ease-in-out infinite;
  }
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

  /* --- PROCESSING MODAL --- */
  .processing-modal {
    background: rgba(10,15,30,0.92);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(59,130,246,0.2);
    border-radius: 24px;
    padding: 48px 52px;
    text-align: center;
    box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(59,130,246,0.1);
  }
  .spinner-ring {
    width: 56px; height: 56px;
    border: 3px solid rgba(59,130,246,0.2);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 24px;
    box-shadow: 0 0 20px rgba(59,130,246,0.3);
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* --- ERROR BANNER --- */
  .error-banner {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 14px;
    padding: 14px 18px;
    color: #fca5a5;
    display: flex; align-items: center; gap: 12px;
    font-size: 13px; font-weight: 600;
    margin-bottom: 20px; width: 100%; max-width: 640px;
  }

  /* --- PDF VIEWER --- */
  .textLayer { position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; opacity: 0; line-height: 1; }
  .pdf-page-container {
    box-shadow: 0 8px 40px rgba(0,0,0,0.5);
    margin-bottom: 2rem;
    position: relative; background: white;
    border-radius: 12px; overflow: hidden;
    border: 1px solid rgba(255,255,255,0.05);
  }

  /* --- ESTIMATE PAPER (unchanged — must match reference) --- */
  .pdf2estimate-paper {
    background: white;
    width: 909px;
    min-height: 1286px;
    padding: 0;
    margin: 20px auto;
    box-shadow: 0 0 60px rgba(0,0,0,0.4);
    font-family: Helvetica, Arial, sans-serif;
    color: #000;
    position: relative;
    box-sizing: border-box;
  }
  .s1-header-label { font-size: 23px; font-family: Helvetica, Arial, sans-serif; color: #000; font-weight: normal; margin-bottom: 2px; }
  .header-input { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #000; width: 100%; border: none; outline: none; }
  .header-address-input { font-size: 15px; font-weight: 800; text-transform: uppercase; color: #000; width: 100%; border: none; outline: none; font-family: Helvetica, Arial, sans-serif; }
  .s0-header-right-label { font-size: 17px; font-family: Helvetica, Arial, sans-serif; color: #000; text-align: right; line-height: 1.2; }
  .s0-header-right-val { font-size: 17px; font-family: Helvetica, Arial, sans-serif; font-weight: bold; color: #000; text-align: right; line-height: 1.2; }
  .prop-chars-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #999; }
  .prop-chars-table th { background: #b9c9fe; color: #000; font-weight: bold; text-align: center; border: 1px solid #777; padding: 2px; font-size: 11px; }
  .prop-chars-table td { background: #fff; text-align: center; border: 1px solid #777; padding: 2px; font-size: 11px; font-weight: bold; }
  .tahoma12-blue { font-family: Tahoma, Geneva, sans-serif; font-size: 12px; line-height: 16px; color: #02598b; }
  .tahoma12-gray { font-family: Tahoma, Geneva, sans-serif; font-size: 12px; line-height: 16px; color: #000; }
  .tahoma14-gold { font-family: Tahoma, Geneva, sans-serif; font-size: 14px; color: #b18d1e; text-decoration: none; font-weight: bold; }
  .tahoma13-gold { font-family: Tahoma, Geneva, sans-serif; font-size: 13px; color: #b18d1e; text-decoration: none; font-weight: bold; }
  .arial18-blue, .arial20-blue { font-family: Tahoma, Geneva, sans-serif; font-size: 18px; color: #02598b; font-weight: normal; padding-bottom: 15px; }
  #box-table-b { font-family: Helvetica, Arial, sans-serif; width: 100%; border-collapse: collapse; border-top: 1px solid #000; border-bottom: 1px solid #000; }
  #box-table-b th { font-size: 14px; padding: 3px; background: #f8faff; color: #004293; border-right: 1px solid #aabcfe; border-left: 1px solid #aabcfe; border-bottom: 1px solid #aabcfe; text-align: left; font-weight: bold; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  #box-table-b td { padding: 3px; background: #fff; border-right: 1px solid #aabcfe; border-left: 1px solid #aabcfe; color: #000; font-size: 14px; vertical-align: top; }
  .fillable-input { border: none; border-bottom: 1px solid transparent; width: 100%; outline: none; background: transparent; font-family: Helvetica, Arial, sans-serif; }
  .fillable-input:hover { border-bottom: 1px solid #eee; }

  /* --- ANIMATIONS --- */
  .animate-fade-in { animation: fadeIn 0.35s ease-out forwards; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-up { animation: fadeUp 0.4s ease-out forwards; }

  /* --- PRINT --- */
  @media print {
    body * { visibility: hidden; }
    body, html { background: white; height: 100%; overflow: visible; padding: 0; margin: 0; }
    #pdf2estimate-pdf, #pdf2estimate-pdf * { visibility: visible; }
    #pdf2estimate-pdf { position: absolute; left: 0; top: 0; margin: 0; padding: 0; width: 100%; height: 100%; background: white; box-shadow: none; z-index: 9999; }
    .no-print { display: none !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @page { margin: 0; size: auto; }
    .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
    .animate-fade-in, .animate-fade-up { animation: none !important; transform: none !important; }
    .print-hidden { display: none; }
  }
`;

// --- Component: HTML Extraction Preview (Step 1) ---
const ExtractionPreview = ({ data, onProceed, onBack, isProcessing, onUpdate }) => {
  const items = Array.isArray(data.items) ? data.items : [];

  let addressDisplay = "Unknown Address";
  if (typeof data.address === 'string') {
    addressDisplay = data.address;
  } else if (data.address && typeof data.address === 'object') {
    addressDisplay = Object.values(data.address).filter(x => typeof x === 'string').join(', ');
  }

  const totalCost = items.reduce((s, i) => s + (Number(i.cost) || 0), 0);

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in pb-20 no-print">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-8 py-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileJson className="w-5 h-5 text-blue-600" />
              Extracted HTML Data
            </h2>
            <p className="text-slate-500 text-sm mt-1">Review extracted line items before generating official PDF.</p>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Detected Address</div>
            <textarea
              className="font-bold text-slate-800 text-right bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none w-64 resize-none h-auto overflow-hidden placeholder-slate-300"
              value={data.address || ''}
              placeholder="Enter Property Address..."
              onChange={(e) => onUpdate({ address: e.target.value })}
              rows={1}
            />
          </div>
        </div>

        <div className="p-8">
          <table className="preview-table">
            <thead>
              <tr>
                <th className="w-16">#</th>
                <th>Description</th>
                <th className="w-24 text-center">QTY</th>
                <th className="w-24 text-center">U/M</th>
                <th className="w-32 text-right">Unit Price</th>
                <th className="w-32 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="text-slate-400 font-mono text-xs">{i + 1}</td>
                  <td className="font-medium">{typeof item.description === 'string' ? item.description : "Item"}</td>
                  <td className="text-center">{Number(item.qty) || 0}</td>
                  <td className="text-center text-xs uppercase bg-slate-100 rounded px-2 py-1">{typeof item.um === 'string' ? item.um : "EA"}</td>
                  <td className="text-right font-mono text-slate-600">${(Number(item.ppu) || 0).toFixed(2)}</td>
                  <td className="text-right font-bold text-slate-800">${(Number(item.cost) || 0).toFixed(2)}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400 italic">No items extracted.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="mt-6 flex justify-end items-center gap-4 border-t pt-6">
            <div className="text-slate-500 text-sm">Total Items: <span className="font-bold text-slate-900">{items.length}</span></div>
            <div className="text-xl font-black text-blue-900">Total: ${totalCost.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-between items-center">
          <button onClick={onBack} disabled={isProcessing} className="text-slate-500 hover:text-slate-800 font-bold text-sm disabled:opacity-50">Back to Files</button>
          <button
            onClick={onProceed}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-[#1a4b8c] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-800 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Pdf2Estimate PDF"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Component: Pdf2Estimate Specialized View (Step 2) ---
const Pdf2EstimateView = ({ data, onUpdate, logoSettings, onAutofill }) => {
  const [isFetching, setIsFetching] = useState(false);
  const taxRate = 0.085;
  const items = Array.isArray(data.items) ? data.items : [];

  const handleAutoFill = async () => {
    if (!data.address) return;
    setIsFetching(true);
    await onAutofill(data.address);
    setIsFetching(false);
  };

  const areaTotal = items.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);
  const salesTax = areaTotal * taxRate;
  // Estimate Totals logic: Subtotal + Tax if needed, but screenshots usually show "Total Estimate" as sum
  // Check Image 1: "Total Estimate: $9512.47". 
  // Check Image 0: Area Total (bottom of table) $8767.25. Sales tax $745.216.
  // So: Total = Area Total + Sales Tax.
  const totalEstimate = areaTotal + salesTax;

  let addressDisplay = "";
  if (typeof data.address === 'string') addressDisplay = data.address;
  else if (data.address && typeof data.address === 'object') addressDisplay = Object.values(data.address).join(' ');

  const logoUrl = "https://www.repairbase.net/images/repairbase-logob.png";

  return (
    <div className="pdf2estimate-paper animate-fade-in" id="pdf2estimate-pdf">

      {/* HEADER SECTION - HTML Reference Exact Match */}
      {/* Logo: x=65, y=65 (from index.html SVG image tag) */}
      <div style={{ position: 'absolute', left: '65px', top: '65px' }}>
        <img src={logoUrl} alt="RepairBase" style={{ width: '238px', height: '65px', objectFit: 'contain' }} />
      </div>

      <div className="mb-4 relative">
        {/* Left Column: Property Address */}
        {/* Address Label: left:70px, bottom:1118px -> top: 168px (1286-1118) */}
        {/* Wait, index.html line 83: bottom:1118px. 1286-1118 = 168px. */}
        <div style={{ position: 'absolute', left: '70px', top: '168px' }}>
          <div className="s1-header-label">Property Address:</div>
          {/* Address Input below label */}
          <div style={{ marginTop: '5px' }}>
            <span className="fillable-input" style={{ fontSize: '15px', color: '#000', display: 'block', width: '400px' }}>
              {addressDisplay || "705 BENT HOLLOW CT MOORE, SC 29369"}
            </span>
          </div>
        </div>

        {/* Right Column: Date, ID, Loan # - Absolute Positioning match */}
        {/* Date: left:568px, bottom:1149px -> top: 137px */}
        <div style={{ position: 'absolute', left: '568px', top: '137px' }}>
          <span className="s0-header-right-label">Date: </span>
          <span className="s0-header-right-val" style={{ marginLeft: '130px' }}>{new Date().toLocaleDateString()}</span>
        </div>

        {/* ID: left:494px, bottom:1127px -> top: 159px */}
        <div style={{ position: 'absolute', left: '494px', top: '159px' }}>
          <span className="s0-header-right-label">RepairBase ID: </span>
          <span className="s0-header-right-val" style={{ marginLeft: '160px' }}>1680033</span>
        </div>

        {/* Loan: left:552px, bottom:1054px -> top: 232px */}
        <div style={{ position: 'absolute', left: '552px', top: '232px' }}>
          <span className="s0-header-right-label">Loan #: </span>
          <span className="s0-header-right-val" style={{ marginLeft: '150px' }}>***1401 VA (12)</span>
        </div>
      </div>

      {/* HORIZONTAL LINE Top: 1286 - 989 (PropChars label) = 297px? No, line is distinct from text. */}
      {/* Looking at SVG path: M65 427.1H844.5 (Top line of table?). No. */}
      {/* SVG Path: M65 292.8 ... that's a table grid. */}
      {/* User Annotation: "Missing Underline". Let's place it around 300px.*/}
      <div className="w-full border-t border-black mb-3" style={{ position: 'absolute', top: '300px', left: '65px', width: '780px' }}></div>

      {/* CONTENT PADDING WRAPPER for Flow Content below absolute Header */}
      <div style={{ paddingTop: '320px', paddingLeft: '65px', paddingRight: '65px' }}>

        {/* Buttons (Auto-Fill) - Hidden in Print */}
        <div className="no-print mb-4">
          <button onClick={handleAutoFill} disabled={isFetching || !data.address} className="text-blue-600 underline text-xs cursor-pointer">
            {isFetching ? "Auto-Filling Property Data..." : "Auto-Fill details from Address"}
          </button>
        </div>

        {/* PROPERTY CHARACTERISTICS - Strict Match Image 0/2 */}
        <div className="mb-4">
          <div className="text-[15px] text-[#333] mb-1" style={{ borderBottom: '1px solid #000' }}>Property Characteristics:</div>
          <table className="prop-chars-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Structure Type</th>
                <th style={{ width: '30%' }}>Stories</th>
                <th style={{ width: '40%' }}>Living Area</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><input className="fillable-input text-center font-bold" value={data.characteristics?.structureType || 'Single Family Residence'} onChange={(e) => onUpdate({ characteristics: { ...data.characteristics, structureType: e.target.value } })} /></td>
                <td><input className="fillable-input text-center font-bold" value={data.characteristics?.stories || '1'} onChange={(e) => onUpdate({ characteristics: { ...data.characteristics, stories: e.target.value } })} /></td>
                <td><input className="fillable-input text-center font-bold" value={data.characteristics?.livingArea || '0'} onChange={(e) => onUpdate({ characteristics: { ...data.characteristics, livingArea: e.target.value } })} /></td>
              </tr>
            </tbody>
            <thead>
              <tr>
                <th>Bedrooms</th>
                <th>Baths</th>
                <th className="grid grid-cols-2 p-0 border-none">
                  <div className="border-r border-[#777] h-full flex items-center justify-center">Year Built</div>
                  <div className="h-full flex items-center justify-center">Quality</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><input className="fillable-input text-center font-bold" value={data.characteristics?.bedrooms || '3'} onChange={(e) => onUpdate({ characteristics: { ...data.characteristics, bedrooms: e.target.value } })} /></td>
                <td><input className="fillable-input text-center font-bold" value={data.characteristics?.baths || '2'} onChange={(e) => onUpdate({ characteristics: { ...data.characteristics, baths: e.target.value } })} /></td>
                <td className="p-0 border-none">
                  <div className="grid grid-cols-2 h-full">
                    <div className="border-r border-[#777] px-2 py-[2px]"><input className="fillable-input text-center font-bold" value={data.characteristics?.yearBuilt || '1990'} onChange={(e) => onUpdate({ characteristics: { ...data.characteristics, yearBuilt: e.target.value } })} /></div>
                    <div className="px-2 py-[2px]"><input className="fillable-input text-center font-bold" value={data.characteristics?.quality || 'Average'} onChange={(e) => onUpdate({ characteristics: { ...data.characteristics, quality: e.target.value } })} /></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* REPAIR ESTIMATE HEADER - Two Bars Style */}
        <div className="mb-2 mt-0">
          <div className="border-t border-black mb-1"></div>
          <div className="text-center text-[16px] text-black">Repair Estimate</div>
          <div className="border-b border-black mt-1"></div>
        </div>

        <div style={{ color: '#004275', fontWeight: 'bold', fontSize: '15px', marginBottom: '10px', paddingLeft: '4px' }}>Entire House</div>

        <table id="box-table-b">
          <thead>
            <tr>
              <th width="5%">Item #</th>
              <th width="45%">Description</th>
              <th width="8%" className="text-center">QTY</th>
              <th width="8%" className="text-center">U/M</th>
              <th width="12%" className="text-right">PPU</th>
              <th width="12%" className="text-right">Cost</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td align="center"><span className="tahoma12-gray">{idx + 1}</span></td>
                <td><span className="tahoma12-gray">{typeof item.description === 'string' ? item.description : 'Item'}</span></td>
                <td align="right"><span className="tahoma12-gray">{Number(item.qty) || 0}</span></td>
                <td align="right"><span className="tahoma12-gray uppercase">{typeof item.um === 'string' ? item.um : 'EA'}</span></td>
                <td align="right"><span className="tahoma12-gray">${(Number(item.ppu) || 0).toFixed(2)}</span></td>
                <td align="right"><span className="tahoma12-gray">${(Number(item.cost) || 0).toFixed(2)}</span></td>
              </tr>
            ))}
            <tr>
              <td colSpan="5" align="right" style={{ borderTop: '1px solid #9baff1' }}>
                <span className="tahoma12-gray"><strong>Area Total:&nbsp; </strong></span>
              </td>
              <td align="right" style={{ borderTop: '1px solid #9baff1' }}>
                <span className="tahoma12-gray"><strong>${areaTotal.toFixed(2)}</strong></span>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="grid grid-cols-[1fr_auto] gap-4 mt-2 pr-1">
          <div className="text-right text-sm text-[#333]">Sales tax :</div>
          <div className="text-right text-sm text-[#333] w-24">${salesTax.toFixed(3)}</div>
        </div>

      </div> {/* End Flow Content Wrapper */}

      {/* ESTIMATE TOTALS SECTION (Page Break / Separate Block) */}
      <div className="break-inside-avoid" style={{ paddingLeft: '65px', paddingRight: '65px', marginTop: '50px' }}>
        <div className="text-[15px] text-black mb-1 px-1">Estimate Totals:</div>
        <div className="flex justify-between items-center border-t-2 border-b border-black py-1 mt-1">
          <span className="font-bold text-xs text-black pl-20">Total Estimate:</span>
          <span className="font-bold text-xs text-black pr-1">${totalEstimate.toFixed(2)}</span>
        </div>
      </div>

      {/* FOOTER */}
      <div id="footer" style={{ background: 'url(https://www.repairbase.net/images/footer.png) repeat-x', height: '81px', position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%' }} className="print-hidden">
        <div style={{ width: '100%', textAlign: 'center', paddingTop: '35px' }}>
          <div className="tahoma13-w">
            © All rights reserved 2010-2025. BlueBook International.<br />
            www.RepairBase.net&nbsp;DBID: Q1-2025 {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} page 1 / 1
          </div>
        </div>
      </div>

      {/* Footer Text Matching HTML Reference */}
      {/* Bottom: 26px (1286-26 = 1260px from top) */}
      <div className="no-print hidden print:flex" style={{ position: 'absolute', top: '1260px', left: '65px', width: '820px', fontSize: '12px', fontFamily: 'Helvetica, Arial, sans-serif', display: 'flex', justifyContent: 'space-between' }}>
        <span>© All rights reserved 2010-2026. BlueBook International. www.RepairBase.net DBID: Q4-2025 {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span>page 1 / 1</span>
      </div>
    </div >
  );
};

// --- Component: PDF Page Renderer ---
const PDFPage = ({ pdfDoc, pageNum, scale, registerCanvas }) => {
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let cancelled = false;

    const render = async () => {
      // Cancel any in-progress render on this canvas before starting
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      setIsRendering(true);
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (cancelled) return;

        const viewport = page.getViewport({ scale });
        const outputScale = window.devicePixelRatio || 1;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;
        const task = page.render({ canvasContext: context, transform, viewport });
        renderTaskRef.current = task;

        await task.promise;
        if (!cancelled) {
          registerCanvas(pageNum, canvas);
          setIsRendering(false);
        }
      } catch (err) {
        if (err?.name === 'RenderingCancelledException') return; // expected on cleanup
        if (!cancelled) {
          console.error(`Error rendering page ${pageNum}:`, err);
          setIsRendering(false);
        }
      }
    };

    render();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, pageNum, scale, registerCanvas]);

  return (
    <div className="pdf-page-container overflow-hidden relative group">
      <div className="absolute top-2 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="bg-slate-900/80 text-white text-[10px] px-2 py-1 rounded font-bold">Page {pageNum}</span>
      </div>
      <canvas ref={canvasRef} className="block" />
      <div ref={textLayerRef} className="textLayer" />
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---
export default function App() {

  const [currentFiles, setCurrentFiles] = useState([]);
  const [viewState, setViewState] = useState('upload'); // upload, preview, extraction, pdf2estimate
  const [pdfDoc, setPdfDoc] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [repairData, setRepairData] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [scale, setScale] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [logoSettings, setLogoSettings] = useState({ url: '' });
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || window.env?.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '');

  const updateApiKey = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem('gemini_api_key', newKey);
  };

  const canvasRefs = useRef({});
  const registerCanvas = useCallback((id, canvas) => {
    canvasRefs.current[id] = canvas;
  }, []);

  // pdfjs is now bundled

  // --- Gemini caller with localStorage-backed rate limiting ---
  const callGemini = async (payload, model = 'gemini-2.0-flash') => {
    // Enforce 14 RPM — bucket persists in localStorage across page reloads
    while (true) {
      const log = _getRateLog();
      if (log.length < GEMINI_MAX_RPM) break;

      // Bucket full — wait until the oldest slot rolls out of the 60s window
      const wait = GEMINI_WINDOW_MS - (Date.now() - log[0]) + 300;
      console.log(`[Rate Limiter] ${log.length}/${GEMINI_MAX_RPM} RPM — waiting ${Math.ceil(wait / 1000)}s`);
      setProgressMsg(`Waiting ${Math.ceil(wait / 1000)}s (API rate limit)...`);
      await new Promise(r => setTimeout(r, wait));
    }

    // Claim a slot
    _pushRateLog();

    // Execute — retry only on 5xx; handle 429 as safety net (max 1 retry)
    let lastError = null;
    let quota429 = 0;
    for (let i = 0; i < 3; i++) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }
        );
        if (response.ok) return await response.json();

        lastError = new Error(`AI API Error: ${response.status}`);

        if (response.status === 429) {
          quota429++;
          if (quota429 >= 2) {
            // Two 429s in a row = daily/hourly quota likely exceeded, not just RPM
            throw new Error('QuotaExceeded: API rate limit cannot be resolved by waiting. Your free-tier quota may be exhausted for today. Try again later or reduce the number of pages.');
          }
          console.warn('[Rate Limiter] 429 — filling bucket and waiting 60s');
          setProgressMsg('API rate limited — waiting 60s then retrying once...');
          const now = Date.now();
          _clearRateLog();
          for (let s = 0; s < GEMINI_MAX_RPM; s++) _pushRateLog(now);
          await new Promise(r => setTimeout(r, 60_000));
          continue;
        }

        if (response.status < 500) break;
      } catch (err) {
        if (err.message.startsWith('QuotaExceeded')) throw err; // propagate immediately
        lastError = err;
      }

      await new Promise(r => setTimeout(r, Math.pow(2, i) * 2000));
    }
    throw lastError || new Error('AI Service Failed');
  };

  const startExtraction = async () => {
    setIsProcessing(true);
    setProgressMsg("Extracting Data from All Files...");
    setErrorMsg('');

    await new Promise(r => setTimeout(r, 500));

    try {
      const pageIds = Object.keys(canvasRefs.current).sort((a, b) => parseInt(a) - parseInt(b));
      // Removed check for window.pdfjsLib since it's bundled

      let allItems = [];
      let detectedAddress = "";

      for (const id of pageIds) {
        setProgressMsg(`Scanning Page/File ${id}...`);
        const canvas = canvasRefs.current[id];
        const base64 = canvas.toDataURL('image/png').split(',')[1];

        const result = await callGemini({
          contents: [{
            role: "user", parts: [
              { text: "Extract repair items and property address. Strict Rules:\n1. ONLY extract lines that start with a NUMBERED list (e.g. '1.', '2.', '10.') followed by a description and cost.\n2. STRICTLY IGNORE any section titled 'Damage Evaluation' or paragraphs describing damage.\n3. Return JSON with 'items' array. Each item needs: description (text after number), qty (number), um (string), ppu (number), cost (number)." },
              { inlineData: { mimeType: "image/png", data: base64 } }
            ]
          }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                address: { type: "STRING" },
                items: { type: "ARRAY", items: { type: "OBJECT", properties: { description: { type: "STRING" }, qty: { type: "NUMBER" }, um: { type: "STRING" }, ppu: { type: "NUMBER" }, cost: { type: "NUMBER" } } } }
              }
            }
          }
        }, 'gemini-2.0-flash');

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) continue;

        const parsed = JSON.parse(text);

        if (parsed.items) {
          const sanitizedItems = parsed.items.map(item => ({
            description: String(item.description || "Unknown Item"),
            qty: Number(item.qty) || 0,
            um: String(item.um || "EA"),
            ppu: Number(item.ppu) || 0,
            cost: Number(item.cost) || 0
          }));
          allItems = [...allItems, ...sanitizedItems];
        }

        if (!detectedAddress && parsed.address) detectedAddress = parsed.address;
      }

      setExtractedData({ address: detectedAddress || "Unknown Address", items: allItems });
      setViewState('extraction');

    } catch (err) {
      console.error(err);
      setErrorMsg("Extraction Failed: " + err.message);
    } finally {
      setIsProcessing(false);
      setProgressMsg("");
    }
  };

  const finalizePdf2Estimate = async () => {
    if (!extractedData) return;
    setIsProcessing(true);
    setProgressMsg(`Researching Property: ${extractedData.address}...`);

    let characteristics = {
      structureType: "", stories: "", livingArea: "", bedrooms: "", baths: "", yearBuilt: "", quality: ""
    };

    try {
      const searchResult = await callGemini({
        contents: [{ role: "user", parts: [{ text: `Find property specs for: ${extractedData.address}. Need: Structure Type, Stories, Living Area, Bedrooms, Baths, Year Built, Quality.` }] }],
        tools: [{ "google_search": {} }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              structureType: { type: "STRING" },
              stories: { type: "STRING" },
              livingArea: { type: "STRING" },
              bedrooms: { type: "STRING" },
              baths: { type: "STRING" },
              yearBuilt: { type: "STRING" },
              quality: { type: "STRING" }
            }
          }
        }
      }, 'gemini-2.0-flash');

      const parsedChars = JSON.parse(searchResult.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
      if (parsedChars) characteristics = parsedChars;

    } catch (err) {
      console.warn("Property research failed, proceeding with empty fields:", err);
    } finally {
      setRepairData({
        address: extractedData.address,
        items: extractedData.items,
        characteristics: characteristics
      });
      setViewState('pdf2estimate');
      setIsProcessing(false);
    }
  };

  const autoFillPropertyDetails = async (address) => {
    if (!address) return;
    setErrorMsg('');
    setProgressMsg(`Instant Research for: ${address}...`);

    const parseResponse = (result) => {
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("No data returned from AI.");
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    };

    try {
      // FAST PATH: Use Internal Knowledge ONLY (No Search Tool) -> < 2 seconds
      const fastResult = await callGemini({
        contents: [{
          role: "user",
          parts: [{ text: `Estimate property characteristics for: "${address}". \n\nOutput Valid JSON only: { "structureType": "Single Family Residence", "stories": "1", "livingArea": "1500", "bedrooms": "3", "baths": "2", "yearBuilt": "1980", "quality": "Average" }. \n\nIf exact details unknown, provide reasonable estimates based on location/market.` }]
        }],
        generationConfig: { responseMimeType: "application/json" }
      }, 'gemini-2.0-flash');

      const newChars = parseResponse(fastResult);
      setRepairData(prev => ({
        ...prev,
        characteristics: { ...prev.characteristics, ...newChars }
      }));

    } catch (err) {
      console.error("Auto-fill failed:", err);
      setErrorMsg(`Could not auto-fill. Please enter details manually.`);
    }
  };


  const processFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMsg('');
    canvasRefs.current = {};

    if (fileList[0].type === 'application/pdf') {
      if (fileList.length > 1) { setErrorMsg("Please upload only 1 PDF at a time."); return; }
      setIsProcessing(true);
      setProgressMsg("Loading PDF...");
      const buffer = await fileList[0].arrayBuffer();
      const loadedPdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      setPdfDoc(loadedPdf);
      setCurrentFiles([fileList[0]]);
      setViewState('preview');
      setIsProcessing(false);
      return;
    }

    const validImages = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (validImages.length === 0) { setErrorMsg("No valid images found."); return; }

    setPdfDoc(null);
    setCurrentFiles(validImages);
    setViewState('preview');
  };

  // --- Full Page Drag & Drop Logic ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // Only dismiss when leaving the window entirely
    if (e.clientX === 0 && e.clientY === 0) {
      setIsDragging(false);
    }
  };

  // Safety: reset if drag ends without a drop (e.g. Escape key)
  useEffect(() => {
    const onDragEnd = () => setIsDragging(false);
    window.addEventListener('dragend', onDragEnd);
    window.addEventListener('drop', onDragEnd);
    return () => {
      window.removeEventListener('dragend', onDragEnd);
      window.removeEventListener('drop', onDragEnd);
    };
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  return (
    <div
      className="app-root flex flex-col relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <style>{styles}</style>

      {/* Global Drag Overlay */}
      {isDragging && (
        <div className="drag-overlay animate-fade-in">
          <div className="drag-ring">
            <Upload style={{ width: 48, height: 48, color: '#60a5fa' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.02em' }}>Drop to Upload</h2>
            <p style={{ color: '#94a3b8', fontWeight: 500 }}>Release to process your estimate files</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="app-header no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="app-logo-badge">
            <Calculator style={{ color: 'white', width: 18, height: 18 }} />
          </div>
          <div>
            <h1>Pdf2Estimate</h1>
            <p>AI-Powered Repair Estimate Converter</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {currentFiles.length > 0 && (
            <button
              className="btn-danger-text"
              onClick={() => {
                setViewState('upload');
                setCurrentFiles([]);
                setPdfDoc(null);
                setExtractedData(null);
                setRepairData(null);
              }}
            >
              <Trash2 style={{ width: 14, height: 14 }} />
              Clear
            </button>
          )}

          {/* Settings Button */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn-icon"
              onClick={() => setShowSettings(!showSettings)}
              style={showSettings ? { background: 'rgba(59,130,246,0.15)', color: '#60a5fa', borderColor: 'rgba(59,130,246,0.3)' } : {}}
            >
              <Settings style={{ width: 18, height: 18 }} />
            </button>
            {showSettings && (
              <div className="settings-panel animate-fade-in" style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 300, padding: '20px', zIndex: 100 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Settings</span>
                  <button className="btn-icon" onClick={() => setShowSettings(false)} style={{ padding: 4 }}><X style={{ width: 15, height: 15 }} /></button>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="settings-label">Gemini API Key</label>
                  <input
                    type="password"
                    className="settings-input"
                    style={{ marginBottom: 6 }}
                    placeholder="Enter Gemini API Key…"
                    value={apiKey}
                    onChange={(e) => updateApiKey(e.target.value)}
                  />
                  <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>Stored locally in your browser.</p>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="settings-label">AI Model</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '8px 12px' }}>
                    <Sparkles style={{ width: 13, height: 13, color: '#60a5fa' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Auto-Select Active</span>
                  </div>
                </div>
                <div>
                  <label className="settings-label">Custom Logo URL</label>
                  <input
                    type="text"
                    className="settings-input"
                    style={{ marginBottom: 8 }}
                    placeholder="https://example.com/logo.png"
                    value={logoSettings.url}
                    onChange={(e) => setLogoSettings({ url: e.target.value })}
                  />
                  <div style={{ position: 'relative' }}>
                    <input type="file" accept="image/*" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      onChange={(e) => { if (e.target.files[0]) setLogoSettings({ url: URL.createObjectURL(e.target.files[0]) }); }} />
                    <button style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#94a3b8', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'Inter, sans-serif' }}>
                      <Upload style={{ width: 12, height: 12 }} /> Upload Image
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {viewState !== 'upload' && (
            <>
              {viewState === 'preview' && (
                <button className="btn-primary" onClick={startExtraction}>
                  <Sparkles style={{ width: 15, height: 15 }} /> Extract Data
                </button>
              )}
              {viewState === 'pdf2estimate' && (
                <button
                  className="btn-download"
                  onClick={() => {
                    const element = document.getElementById('pdf2estimate-pdf');
                    const opt = {
                      margin: [0, 0, 0, 0],
                      filename: `Estimate_${repairData?.address?.replace(/[^a-z0-9]/gi, '_') || 'Report'}.pdf`,
                      image: { type: 'jpeg', quality: 0.98 },
                      html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true, allowTaint: true },
                      jsPDF: { unit: 'px', format: [909, 1286], orientation: 'portrait', compress: true },
                      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                    };
                    html2pdf().set(opt).from(element).save();
                  }}
                >
                  <Download style={{ width: 15, height: 15 }} /> Download PDF
                </button>
              )}
              <button className="btn-icon" style={{ color: 'rgba(148,163,184,0.6)' }}
                onClick={() => { setCurrentFiles([]); setViewState('upload'); setExtractedData(null); setRepairData(null); canvasRefs.current = {}; }}>
                <Trash2 style={{ width: 18, height: 18 }} />
              </button>
            </>
          )}
        </div>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {isProcessing && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,13,26,0.8)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="processing-modal animate-fade-in">
              <div className="spinner-ring"></div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 8 }}>Processing</h3>
              <p style={{ color: '#64748b', fontSize: 13, fontWeight: 500, lineHeight: 1.6 }}>{progressMsg}</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="error-banner animate-fade-in">
            <AlertCircle style={{ width: 18, height: 18, flexShrink: 0, color: '#f87171' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {viewState === 'upload' && (
          <div style={{ width: '100%', maxWidth: 640, marginTop: 60 }} className="animate-fade-up">
            {/* Hero label */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(to right, #e2e8f0, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.03em', marginBottom: 8 }}>Repair Estimate Converter</h2>
              <p style={{ color: '#475569', fontSize: 14, fontWeight: 500 }}>Upload a PDF or images — AI extracts and formats your estimate instantly.</p>
            </div>
            <div
              className="upload-zone"
              style={{ height: 280 }}
              onClick={() => document.getElementById('uploader').click()}
            >
              <div className="upload-icon-wrapper">
                <Upload style={{ width: 36, height: 36, color: '#60a5fa' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.01em' }}>Drop files here</h3>
              <p style={{ color: '#475569', fontSize: 13, fontWeight: 500, marginTop: 6 }}>PDF or images · Multiple files supported</p>
              <div className="upload-pill">Select Files</div>
              <input id="uploader" type="file" style={{ display: 'none' }} multiple onChange={(e) => processFiles(e.target.files)} accept=".pdf,image/*" />
            </div>
            {/* Format hints */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20 }}>
              {['PDF', 'PNG', 'JPG', 'WEBP'].map(fmt => (
                <div key={fmt} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155', fontSize: 12, fontWeight: 600 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1e3a5f' }}></div>
                  {fmt}
                </div>
              ))}
            </div>
          </div>
        )}

        {viewState === 'preview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 128, width: '100%', maxWidth: 900, alignItems: 'center' }}>
            <div className="preview-badge">
              <span className="preview-badge-dot"></span>
              Preview Mode &nbsp;·&nbsp; {currentFiles.length} File{currentFiles.length !== 1 ? 's' : ''} loaded
            </div>

            {pdfDoc && Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1).map(n => (
              <PDFPage key={n} pdfDoc={pdfDoc} pageNum={n} scale={scale} registerCanvas={registerCanvas} />
            ))}

            {!pdfDoc && currentFiles.map((file, idx) => (
              <div key={idx} style={{ background: 'white', padding: 16, borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.5)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700, backdropFilter: 'blur(8px)' }}>Image {idx + 1}</div>
                <img
                  src={URL.createObjectURL(file)}
                  style={{ maxWidth: 860, borderRadius: 8, display: 'block' }}
                  ref={(el) => { if (el) registerCanvas(idx + 1, el) }}
                />
              </div>
            ))}
          </div>
        )}

        {viewState === 'extraction' && extractedData && (
          <ExtractionPreview
            data={extractedData}
            onProceed={finalizePdf2Estimate}
            onBack={() => setViewState('preview')}
            isProcessing={isProcessing}
            onUpdate={(updates) => setExtractedData({ ...extractedData, ...updates })}
          />
        )}

        {viewState === 'pdf2estimate' && repairData && (
          <div className="w-full overflow-x-auto pb-32">
            <Pdf2EstimateView
              data={repairData}
              onUpdate={(updates) => setRepairData({ ...repairData, ...updates })}
              logoSettings={logoSettings}
              onAutofill={autoFillPropertyDetails}
            />
          </div>
        )}
      </main>
    </div>
  );
}