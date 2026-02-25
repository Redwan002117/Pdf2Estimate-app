import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload, FileText, Download, Loader2, ZoomIn, ZoomOut,
  AlertCircle, Copy, Trash2, ScanText, Sparkles,
  ChevronDown, FileJson, Printer, FileType, Table as TableIcon,
  Archive, Home, Search, Calculator, ArrowRight, Layers, Plus, Image as ImageIcon, Settings, X
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import * as pdfjsLib from 'pdfjs-dist';

// Set PDF.js worker source for production build
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
  /* --- RESET & BASIC --- */
  * { margin:0; padding:0; }
  .textLayer { position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; opacity: 0; line-height: 1.0; }
  .pdf-page-container { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 2rem; position: relative; background: white; border-radius: 8px; overflow: hidden; }

  /* --- ADMIN.CSS PORT & SCREENSHOT REFINEMENT --- */
  /* HTML Reference Styles */
  .pdf2estimate-paper {
    background: white;
    width: 909px; /* Matched from index.html (Canvas width) */
    min-height: 1286px; /* Matched height */
    padding: 0px; /* REMOVED PADDING for 1:1 Absolute Coordinate Match */
    margin: 20px auto;
    box-shadow: 0 0 40px rgba(0,0,0,0.15);
    font-family: Helvetica, Arial, sans-serif; /* Matched font */
    color: #000;
    position: relative;
    box-sizing: border-box; /* Ensure borders don't add width */
  }

  .s1-header-label { font-size: 23px; font-family: Helvetica, Arial, sans-serif; color: #000; font-weight: normal; margin-bottom: 2px; }
  .header-input { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #000; width: 100%; border: none; outline: none; }
  .header-address-input { font-size: 15px; font-weight: 800; text-transform: uppercase; color: #000; width: 100%; border: none; outline: none; font-family: Helvetica, Arial, sans-serif; } 
  .s0-header-right-label { font-size: 17px; font-family: Helvetica, Arial, sans-serif; color: #000; text-align: right; line-height: 1.2; }
  .s0-header-right-val { font-size: 17px; font-family: Helvetica, Arial, sans-serif; font-weight: bold; color: #000; text-align: right; line-height: 1.2; }

  /* Property Characteristics Table (Blue/Grey Theme) */
  .prop-chars-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
    border: 1px solid #999;
  }
  .prop-chars-table th {
    background: #b9c9fe; /* Periwinkle Blue from Admin.css/Screenshot */
    color: #000;
    font-weight: bold;
    font-size: 12px;
    text-align: center;
    border: 1px solid #777;
    padding: 2px; /* Super compact */
    font-size: 11px; /* Slightly smaller for compact look */
    font-weight: bold;
  }
  .prop-chars-table td {
    background: #ffffff;
    text-align: center;
    border: 1px solid #777;
    padding: 2px;
    font-size: 11px;
    font-weight: bold;
  }
  
  .tahoma12-blue { font-family: Tahoma, Geneva, sans-serif; font-size: 12px; line-height: 16px; color: #02598b; }
  .tahoma12-gray { font-family: Tahoma, Geneva, sans-serif; font-size: 12px; line-height: 16px; color: #000; }
  .tahoma14-gold { font-family: Tahoma, Geneva, sans-serif; font-size: 14px; color: #b18d1e; text-decoration: none; font-weight: bold; }
  .tahoma13-gold { font-family: Tahoma, Geneva, sans-serif; font-size: 13px; color: #b18d1e; text-decoration: none; font-weight: bold; }
  .arial18-blue, .arial20-blue { font-family: Tahoma, Geneva, sans-serif; font-size: 18px; color: #02598b; font-weight: normal; padding-bottom:15px; }

  /* Table Style: #box-table-b (Repair Estimate) */
  #box-table-b {
    font-family: Helvetica, Arial, sans-serif;
    width: 100%;
    border-collapse: collapse;
    border-top: 1px solid #000; 
    border-bottom: 1px solid #000; 
  }
  #box-table-b th {
    font-size: 14px; /* s4 class */
    padding: 3px; 
    background: #f8faff; /* g1 class fill */
    color: #004293; /* s4 color */
    border-right: 1px solid #aabcfe; 
    border-left: 1px solid #aabcfe;
    border-bottom: 1px solid #aabcfe;
    text-align: left;
    font-weight: bold;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  #box-table-b td {
    padding: 3px; 
    background: #ffffff; 
    border-right: 1px solid #aabcfe;
    border-left: 1px solid #aabcfe;
    color: #000;
    font-size: 14px; /* s5 class */
    vertical-align: top;
  }
  
  .fillable-input { border: none; border-bottom: 1px solid transparent; width: 100%; outline: none; background: transparent; font-family: Helvetica, Arial, sans-serif; }
  .fillable-input:hover { border-bottom: 1px solid #eee; }
  
  .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  /* --- PRINT STYLES --- */
  @media print {
    body * { visibility: hidden; }
    body, html { background: white; height: 100%; overflow: visible; padding: 0; margin: 0; }
    #pdf2estimate-pdf, #pdf2estimate-pdf * { visibility: visible; }
    #pdf2estimate-pdf {
      position: absolute; left: 0; top: 0;
      margin: 0; padding: 0;
      width: 100%; height: 100%;
      background: white; box-shadow: none; z-index: 9999;
      transform: none; /* Let the browser scale content to fit */
    }
    .no-print { display: none !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @page { margin: 0; size: auto; } /* Remove browser default margins */
    .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
    .animate-fade-in { animation: none !important; transform: none !important; }
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

  const callGemini = async (payload, model = 'gemini-1.5-flash') => {
    let lastError = null;
    const maxRetries = 5;

    for (let i = 0; i < maxRetries; i++) {
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
        }, 'gemini-1.5-flash');

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
      }, 'gemini-1.5-pro');

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
      }, 'gemini-1.5-flash');

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
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pdf2Estimate Pro Converter</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentFiles.length > 0 && (
            <button
              onClick={() => {
                setViewState('upload');
                setCurrentFiles([]);
                setPdfDoc(null);
                setExtractedData(null);
                setRepairData(null);
              }}
              className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold text-xs uppercase tracking-wider transition-colors mr-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          )}

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
                  <label className="block text-sm font-bold text-slate-700 mb-1">AI Intelligence</label>
                  <div className="flex items-center gap-2 bg-blue-50 p-2 rounded border border-blue-100">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-tighter">Automated Model Selection Active</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 italic">Optimal models routed per task.</p>
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
              {viewState === 'pdf2estimate' && (
                <button
                  onClick={() => {
                    const element = document.getElementById('pdf2estimate-pdf');
                    const opt = {
                      margin: [0, 0, 0, 0],
                      filename: `Estimate_${repairData?.address?.replace(/[^a-z0-9]/gi, '_') || 'Report'}.pdf`,
                      image: { type: 'jpeg', quality: 0.98 },
                      html2canvas: {
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        letterRendering: true,
                        allowTaint: true
                      },
                      jsPDF: { unit: 'px', format: [909, 1286], orientation: 'portrait', compress: true },
                      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                    };
                    html2pdf().set(opt).from(element).save();
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#0c699e] text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-[#0a5c8a] transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" /> Download PDF
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