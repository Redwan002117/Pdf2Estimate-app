import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload, FileText, Download, Loader2, ZoomIn, ZoomOut,
  AlertCircle, Copy, Trash2, ScanText, Sparkles,
  ChevronDown, FileJson, Printer, FileType, Table as TableIcon,
  Archive, Home, Search, Calculator, ArrowRight, Layers, Plus, Image as ImageIcon, Settings, X
} from 'lucide-react';

// --- Global: Gemini API Configuration ---
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

// --- Custom Styles ---
const styles = `
  .textLayer {
    position: absolute; left: 0; top: 0; right: 0; bottom: 0;
    overflow: hidden; opacity: 0; line-height: 1.0;
  }
  .pdf-page-container {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem; position: relative; background: white;
    border-radius: 8px; overflow: hidden;
  }
  .repairbase-paper {
    background: white;
    width: 850px;
    min-height: 1100px;
    padding: 50px;
    margin: 20px auto;
    box-shadow: 0 0 40px rgba(0,0,0,0.15);
    font-family: Arial, sans-serif;
    color: #333;
    position: relative;
  }
  .repairbase-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    margin-bottom: 10px;
  }
  /* Table Header Centering */
  .repairbase-table th {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    padding: 8px;
    text-align: center; /* CENTER ALIGNMENT REQUESTED */
    color: #0f172a;
    font-weight: bold;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .repairbase-table td {
    border: 1px solid #e2e8f0;
    padding: 8px;
    vertical-align: top;
  }
  .fillable-input {
    border: none;
    border-bottom: 1px solid #e2e8f0;
    width: 100%;
    outline: none;
    font-size: 13px;
    padding: 4px 0;
    background: transparent;
    color: #333;
  }
  .fillable-input:focus { border-bottom-color: #3b82f6; background: #f8fafc; }
  
  .preview-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .preview-table th { background: #f8fafc; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #64748b; font-weight: 600; }
  .preview-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
  .preview-table tr:last-child td { border-bottom: none; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
  }

  /* --- PRINT STYLES --- */
  /* --- PRINT STYLES --- */
  @media print {
    /* Globally hide everything by default */
    body * {
      visibility: hidden;
    }

    /* Reset background and sizing */
    body, html {
      background: white;
      height: 100%;
      overflow: visible;
      /* Ensure content doesn't overlap the fixed footer on any page */
      padding-bottom: 20mm; 
    }

    /* Target the specific repairbase container */
    #repairbase-pdf, #repairbase-pdf * {
      visibility: visible;
    }

    #repairbase-pdf {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      margin: 0;
      padding: 0 20px; /* Restore padding for print layout */
      background: white;
      box-shadow: none;
      /* Ensure it sits on top of everything else if any z-index issues */
      z-index: 9999;
    }

    /* Fixed footer for print */
    .print-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 10mm 20px; /* Match container padding */
      background: white;
      z-index: 10000;
    }

    /* Hide specific non-printable elements inside the component if any */
    .no-print {
      display: none !important;
    }

    /* Ensure specific inputs look correct */
    .fillable-input { 
      border-bottom: 1px solid #ccc !important; 
    }
    
    /* Force background colors */
    * { 
      -webkit-print-color-adjust: exact !important; 
      print-color-adjust: exact !important; 
    }
    
    @page { margin: 10mm; size: auto; }

    .break-inside-avoid {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* CRITICAL FIX: Disable transforms/animations so 'fixed' footer works relative to page, not container */
    .animate-fade-in, .repairbase-paper {
      animation: none !important;
      transform: none !important;
      transition: none !important;
    }
  }
`;

// --- Component: HTML Extraction Preview (Step 1) ---
const ExtractionPreview = ({ data, onProceed, onBack, isProcessing }) => {
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
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Detected Address</div>
            <div className="font-bold text-slate-800 max-w-xs truncate">{addressDisplay}</div>
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
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate RepairBase PDF"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Component: RepairBase Specialized View (Step 2) ---
const RepairBaseView = ({ data, onUpdate, logoSettings, onAutofill }) => {
  const [isFetching, setIsFetching] = useState(false);
  const taxRate = 0.065;
  const items = Array.isArray(data.items) ? data.items : [];

  const handleAutoFill = async () => {
    if (!data.address) return;
    setIsFetching(true);
    await onAutofill(data.address);
    setIsFetching(false);
  };

  const areaTotal = items.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);
  const salesTax = areaTotal * taxRate;
  const totalEstimate = areaTotal + salesTax;

  let addressDisplay = "";
  if (typeof data.address === 'string') addressDisplay = data.address;
  else if (data.address && typeof data.address === 'object') addressDisplay = Object.values(data.address).join(' ');

  return (
    <div className="repairbase-paper animate-fade-in" id="repairbase-pdf">
      <div className="flex justify-between items-start mb-8">
        <div>
          {/* LOGO SECTION */}
          <div className="mb-2 w-fit">
            {logoSettings.url ? (
              <img src={logoSettings.url} alt="Logo" className="h-16 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-1">
                <div className="bg-[#1a4b8c] text-white px-2 py-1 rounded text-sm font-bold italic">Repair</div>
                <div className="text-2xl font-black italic tracking-tighter text-[#1a4b8c]">BASE</div>
              </div>
            )}
          </div>

          <div className="text-sm font-bold text-slate-700 uppercase tracking-tight mb-1">Property Address:</div>
          <div className="flex items-start gap-2">
            <textarea
              className="fillable-input w-80 h-16 font-semibold text-base text-slate-900 resize-none"
              value={addressDisplay}
              onChange={(e) => onUpdate({ address: e.target.value })}
              placeholder="Enter address..."
            />
            <button
              onClick={handleAutoFill}
              disabled={isFetching || !data.address}
              className="mt-1 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md no-print group"
              title="Auto-Fill Property Details from Web"
            >
              {isFetching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>
        </div>
        <div className="text-right w-64">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <span className="text-slate-500 font-bold">Date:</span>
            <input type="text" className="fillable-input text-right" defaultValue={new Date().toLocaleDateString()} />
            <span className="text-slate-500 font-bold">RepairBase ID:</span>
            <input type="text" className="fillable-input text-right" placeholder="1558326" />
            <span className="text-slate-500 font-bold">Vendor Num:</span>
            <input type="text" className="fillable-input text-right" placeholder="5433" />
          </div>
          {/* Fillable Loan Info */}
          <div className="mt-4 flex items-center justify-end gap-2">
            <span className="text-[10px] text-slate-400 font-bold italic uppercase tracking-wider whitespace-nowrap">Loan Info:</span>
            <input
              className="fillable-input text-right text-[10px] font-bold italic text-slate-500 w-32"
              defaultValue="******1067 FHA (11)"
            />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="text-lg font-bold text-slate-800 mb-3">Property Characteristics:</div>
        <table className="repairbase-table">
          <thead>
            <tr>
              <th colSpan={2}>Structure Type</th>
              <th>Stories</th>
              <th>Living Area</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={2}><input className="fillable-input" value={data.characteristics?.structureType || ''} onChange={(e) => onUpdate({ characteristics: { ...data.characteristics, structureType: e.target.value } })} /></td>
              <td><input className="fillable-input" value={data.characteristics?.stories || ''} onChange={(e) => onUpdate({ characteristics: { ...data.characteristics, stories: e.target.value } })} /></td>
              <td><input className="fillable-input font-bold" value={data.characteristics?.livingArea || ''} onChange={(e) => onUpdate({ characteristics: { ...data.characteristics, livingArea: e.target.value } })} /></td>
            </tr>
          </tbody>
          <thead>
            <tr>
              <th>Bedrooms</th>
              <th>Baths</th>
              <th>Year Built</th>
              <th>Quality</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input className="fillable-input" value={data.characteristics?.bedrooms || ''} onChange={(e) => onUpdate({ characteristics: { ...data.characteristics, bedrooms: e.target.value } })} /></td>
              <td><input className="fillable-input" value={data.characteristics?.baths || ''} onChange={(e) => onUpdate({ characteristics: { ...data.characteristics, baths: e.target.value } })} /></td>
              <td><input className="fillable-input" value={data.characteristics?.yearBuilt || ''} onChange={(e) => onUpdate({ characteristics: { ...data.characteristics, yearBuilt: e.target.value } })} /></td>
              <td><input className="fillable-input" value={data.characteristics?.quality || ''} onChange={(e) => onUpdate({ characteristics: { ...data.characteristics, quality: e.target.value } })} /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <div className="text-center py-2 border-y-2 border-slate-300 font-bold text-xl mb-6 tracking-wide uppercase">Repair Estimate</div>
        <div className="text-[#1a4b8c] font-black text-sm uppercase mb-3 px-1">Entire House</div>
        <table className="repairbase-table">
          <thead>
            <tr>
              <th className="w-12 text-center">Item #</th>
              <th>Description</th>
              <th className="w-16 text-center">QTY</th>
              <th className="w-16 text-center">U/M</th>
              <th className="w-24 text-right">PPU</th>
              <th className="w-24 text-right">Cost</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="text-center text-slate-500 font-mono">{idx + 1}</td>
                <td className="font-medium">{typeof item.description === 'string' ? item.description : 'Item'}</td>
                <td className="text-center">{Number(item.qty) || 0}</td>
                <td className="text-center uppercase text-slate-600">{typeof item.um === 'string' ? item.um : 'EA'}</td>
                <td className="text-right font-mono">${(parseFloat(item.ppu) || 0).toFixed(2)}</td>
                <td className="text-right font-bold font-mono">${(parseFloat(item.cost) || 0).toFixed(2)}</td>
              </tr>
            ))}
            <tr className="bg-slate-50">
              <td colSpan="5" className="text-right font-black uppercase text-xs border-none py-4">Area Total:</td>
              <td className="text-right font-black border-none py-4 text-sm">${areaTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-12 flex justify-end break-inside-avoid page-break-inside-avoid">
        <div className="w-80">
          <div className="text-xl font-black mb-4 border-b-2 border-slate-800 pb-1">Estimate Totals:</div>
          <div className="flex justify-between py-2 border-b text-sm font-bold text-slate-600">
            <span>Sales Tax:</span>
            <span className="text-slate-900">${salesTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 mt-1 font-black text-xl text-[#1a4b8c]">
            <span>Total Estimate:</span>
            <span>${totalEstimate.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-24 pt-8 border-t border-slate-100 text-left text-[10px] text-slate-400 font-bold italic no-print-break">
        © All rights reserved 2010-2026. BlueBook International. www.RepairBase.net
      </div>
    </div>
  );
};

// --- Component: PDF Page Renderer ---
const PDFPage = ({ pdfDoc, pageNum, scale, registerCanvas }) => {
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const [isRendering, setIsRendering] = useState(true);

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || !textLayerRef.current) return;
    setIsRendering(true);

    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const outputScale = window.devicePixelRatio || 1;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = Math.floor(viewport.width) + "px";
      canvas.style.height = Math.floor(viewport.height) + "px";

      const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;
      await page.render({ canvasContext: context, transform, viewport }).promise;
      registerCanvas(pageNum, canvas);
      setIsRendering(false);
    } catch (err) {
      console.error(`Error rendering page ${pageNum}:`, err);
      setIsRendering(false);
    }
  }, [pdfDoc, pageNum, scale, registerCanvas]);

  useEffect(() => { renderPage(); }, [renderPage]);

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
  const pdfjs = useScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', 'pdfjsLib');

  const [currentFiles, setCurrentFiles] = useState([]);
  const [viewState, setViewState] = useState('upload'); // upload, preview, extraction, repairbase
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

  useEffect(() => {
    if (pdfjs.loaded && window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }, [pdfjs.loaded]);

  const callGemini = async (payload) => {
    let lastError = null;
    const maxRetries = 5;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }
        );
        if (response.ok) return await response.json();

        const errorText = await response.text();
        lastError = new Error(`AI API Error: ${response.status} ${errorText}`);

        if (response.status === 429) {
          const waitTime = 20000 + (Math.pow(2, i) * 5000);
          console.warn(`Rate limit hit (Attempt ${i + 1}). Waiting ${waitTime / 1000}s before retry...`);
          await new Promise(r => setTimeout(r, waitTime));
          continue;
        }

        if (response.status < 500) break;
      } catch (err) { lastError = err; }

      await new Promise(r => setTimeout(r, Math.pow(2, i) * 2000));
    }
    throw lastError || new Error("AI Service Failed");
  };

  const startExtraction = async () => {
    setIsProcessing(true);
    setProgressMsg("Extracting Data from All Files...");
    setErrorMsg('');

    await new Promise(r => setTimeout(r, 500));

    try {
      const pageIds = Object.keys(canvasRefs.current).sort((a, b) => parseInt(a) - parseInt(b));
      if (pageIds.length === 0) throw new Error("No pages rendered to process. Please wait for the preview to load.");

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
        });

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

        if (id !== pageIds[pageIds.length - 1]) {
          setProgressMsg(`Scanning Page ${id}... (Cooling down API)`);
          await new Promise(r => setTimeout(r, 6000));
        }
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

  const finalizeRepairBase = async () => {
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
      });

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
      setViewState('repairbase');
      setIsProcessing(false);
    }
  };

  const autoFillPropertyDetails = async (address) => {
    if (!address) return;
    setErrorMsg('');

    const parseResponse = (result) => {
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("No data returned from AI.");
      return JSON.parse(text);
    };

    try {
      // Attempt 1: Try with Google Search Tool
      try {
        const searchResult = await callGemini({
          contents: [{
            role: "user",
            parts: [{ text: `Act as a real estate data analyst. Perform a targeted search for the specific property located at: "${address}". \n\nLocate the specific listing on Zillow, Redfin, or Realtor.com. \n\nEXTRACT STRICT FACTS ONLY. Do NOT guess. \n- Structure Type\n- Stories\n- Living Area (Square Feet)\n- Bedrooms (If listed as '--' or missing, return empty string)\n- Bathrooms (If listed as '--' or missing, return empty string)\n- Year Built\n- Quality Class\n\nResult must be valid JSON with keys: structureType, stories, livingArea, bedrooms, baths, yearBuilt, quality. \nIf a value is unknown or dashes, use an empty string reference.` }]
          }],
          tools: [{ "google_search": {} }],
          generationConfig: { responseMimeType: "application/json" }
        });

        const newChars = parseResponse(searchResult);
        setRepairData(prev => ({ ...prev, characteristics: { ...prev.characteristics, ...newChars } }));
        return;

      } catch (searchErr) {
        console.warn("Google Search tool failed, falling back to internal knowledge:", searchErr);
        // Fallthrough to attempt 2
      }

      // Attempt 2: Fallback to Internal Knowledge (No Tools)
      const fallbackResult = await callGemini({
        contents: [{
          role: "user",
          parts: [{ text: `Act as a real estate data analyst. Estimate or retrieve details for the specific property at "${address}" based on your internal knowledge. Prioritize exact matches from your training data (Zillow/Redfin records).\n\nRequired Data:\n- Structure Type\n- Stories\n- Living Area (sqft)\n- Bedrooms\n- Bathrooms\n- Year Built\n- Build Quality\n\nReturn ONLY a valid JSON object with these keys: structureType, stories, livingArea, bedrooms, baths, yearBuilt, quality. \nIf a value is unknown, use an empty string.` }]
        }],
        generationConfig: { responseMimeType: "application/json" }
      });

      const newChars = parseResponse(fallbackResult);
      setRepairData(prev => ({
        ...prev,
        characteristics: { ...prev.characteristics, ...newChars }
      }));

    } catch (err) {
      console.error("Auto-fill completely failed:", err);
      // More descriptive error message for the user
      const msg = err.message.includes("403") ? "API Key permission denied." : err.message;
      setErrorMsg(`Failed to auto-fill property details: ${msg}`);
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
      const loadedPdf = await window.pdfjsLib.getDocument(buffer).promise;
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
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === document.body || e.target.id === 'root' || e.target.classList.contains('drag-overlay')) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  return (
    <div
      className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <style>{styles}</style>

      {/* Global Drag Overlay */}
      {isDragging && (
        <div className="drag-overlay fixed inset-0 bg-blue-600/90 z-[9999] flex flex-col items-center justify-center backdrop-blur-sm transition-all animate-fade-in pointer-events-none">
          <Upload className="w-24 h-24 text-white mb-6 animate-bounce" />
          <h2 className="text-4xl font-black text-white tracking-tight">Drop Files to Upload</h2>
          <p className="text-blue-100 mt-2 font-medium">Release to process estimates</p>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-50 no-print shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a4b8c] p-2 rounded-xl shadow-lg shadow-blue-100">
            <Calculator className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#1a4b8c] tracking-tight">Pdf2Estimate</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">RepairBase Pro Converter</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Settings Button */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2.5 rounded-xl transition-colors ${showSettings ? 'bg-slate-100 text-[#1a4b8c]' : 'text-slate-400 hover:text-[#1a4b8c] hover:bg-slate-50'}`}
            >
              <Settings className="w-5 h-5" />
            </button>
            {showSettings && (
              <div className="settings-panel absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-100 p-4 z-[100] animate-fade-in">
                <div className="flex justify-between items-center mb-3 border-b pb-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customization</h3>
                  <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Gemini API Key</label>
                  <input
                    type="password"
                    className="w-full text-xs p-2 border rounded bg-slate-50 mb-2"
                    placeholder="Enter Gemini API Key (Required for AI)"
                    value={apiKey}
                    onChange={(e) => updateApiKey(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-400">Key is saved locally in your browser.</p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Logo URL / Upload</label>
                  <input
                    type="text"
                    className="w-full text-xs p-2 border rounded bg-slate-50 mb-2"
                    placeholder="https://example.com/logo.png"
                    value={logoSettings.url}
                    onChange={(e) => setLogoSettings({ url: e.target.value })}
                  />
                  <div className="relative">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files[0]) setLogoSettings({ url: URL.createObjectURL(e.target.files[0]) });
                      }}
                    />
                    <button className="w-full py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                      <Upload className="w-3 h-3" /> Upload Image
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {viewState !== 'upload' && (
            <>
              {viewState === 'preview' && (
                <button
                  onClick={startExtraction}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#1a4b8c] text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-800 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4" /> Extract to HTML
                </button>
              )}
              {viewState === 'repairbase' && (
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all"
                >
                  <Printer className="w-4 h-4" /> Print Estimate
                </button>
              )}
              <button
                onClick={() => { setCurrentFiles([]); setViewState('upload'); setExtractedData(null); setRepairData(null); canvasRefs.current = {}; }}
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 flex flex-col items-center">
        {isProcessing && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100]">
            <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-xs w-full animate-fade-in">
              <Loader2 className="w-16 h-16 text-[#1a4b8c] animate-spin mx-auto mb-6" />
              <h3 className="text-xl font-black text-slate-900">Processing</h3>
              <p className="text-slate-500 text-sm mt-2 font-medium leading-relaxed">{progressMsg}</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 animate-fade-in w-full max-w-2xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" /> <span className="text-sm font-bold">{errorMsg}</span>
          </div>
        )}

        {viewState === 'upload' && (
          <div className="w-full max-w-3xl mt-12 animate-fade-in">
            <div
              onClick={() => document.getElementById('uploader').click()}
              className="group relative h-80 border-2 border-dashed border-slate-300 bg-white rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-[#1a4b8c] hover:bg-slate-50 transition-all shadow-xl shadow-slate-200/50"
            >
              <div className="bg-slate-50 p-6 rounded-3xl group-hover:scale-110 transition-transform shadow-sm mb-6">
                <Upload className="w-10 h-10 text-[#1a4b8c]" />
              </div>
              <h2 className="text-2xl font-black text-slate-800">Upload Files</h2>
              <p className="text-slate-400 font-bold text-sm mt-2">Drag & Drop anywhere or Click</p>
              <div className="mt-8 px-8 py-2.5 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:bg-[#1a4b8c] group-hover:text-white transition-colors">Select Files</div>
              <input id="uploader" type="file" className="hidden" multiple onChange={(e) => processFiles(e.target.files)} accept=".pdf,image/*" />
            </div>
          </div>
        )}

        {viewState === 'preview' && (
          <div className="flex flex-col gap-8 pb-32 w-full max-w-5xl items-center">
            <div className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Preview Mode • {currentFiles.length} File(s)</div>

            {pdfDoc && Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1).map(n => (
              <PDFPage key={n} pdfDoc={pdfDoc} pageNum={n} scale={scale} registerCanvas={registerCanvas} />
            ))}

            {!pdfDoc && currentFiles.map((file, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl shadow-xl relative group">
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur">Image {idx + 1}</div>
                <img
                  src={URL.createObjectURL(file)}
                  className="max-w-3xl rounded-lg"
                  ref={(el) => { if (el) registerCanvas(idx + 1, el) }}
                />
              </div>
            ))}
          </div>
        )}

        {viewState === 'extraction' && extractedData && (
          <ExtractionPreview
            data={extractedData}
            onProceed={finalizeRepairBase}
            onBack={() => setViewState('preview')}
            isProcessing={isProcessing}
          />
        )}

        {viewState === 'repairbase' && repairData && (
          <div className="w-full overflow-x-auto pb-32">
            <RepairBaseView
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