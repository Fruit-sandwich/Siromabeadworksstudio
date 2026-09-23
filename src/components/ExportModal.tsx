import React, { useState } from 'react';
import { X, Download, FileCode, FileSpreadsheet, Image as ImageIcon, Sparkles, Check, Printer } from 'lucide-react';
import { DesignDocument } from '../types/bead';
import { exportToJson, exportToCsv, exportToSvg, downloadFile } from '../utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  design: DesignDocument;
  onOpenPrint?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  design,
  onOpenPrint,
}) => {
  const [copiedJson, setCopiedJson] = useState(false);
  const [includeGridInPng, setIncludeGridInPng] = useState(true);

  if (!isOpen) return null;

  const safeFilename = (design.metadata.title || 'beaded-canvas-pattern')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');

  const handleExportJson = () => {
    const jsonStr = exportToJson(design);
    downloadFile(jsonStr, `${safeFilename}.json`, 'application/json');
  };

  const handleExportCsv = () => {
    const csvStr = exportToCsv(design);
    downloadFile(csvStr, `${safeFilename}.csv`, 'text/csv');
  };

  const handleExportSvg = () => {
    const svgStr = exportToSvg(design);
    downloadFile(svgStr, `${safeFilename}.svg`, 'image/svg+xml');
  };

  const handleExportPng = () => {
    const { columns, rows, cellSpacing, dotSize, beadShape, beadFinish } = design.settings;
    const padding = 40;
    const canvas = document.createElement('canvas');
    const scale = 2; // 2x high resolution
    const w = columns * cellSpacing + padding * 2;
    const h = rows * cellSpacing + padding * 2 + 30;

    canvas.width = w * scale;
    canvas.height = h * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(scale, scale);

    // Linen canvas background
    ctx.fillStyle = '#f4eee4';
    ctx.fillRect(0, 0, w, h);

    // Title banner
    ctx.fillStyle = '#171412';
    ctx.font = '600 16px "Cinzel", Georgia, serif';
    ctx.fillText(design.metadata.title || 'Beadwork Design', padding, 26);

    ctx.fillStyle = '#71675f';
    ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      `${columns}×${rows} beads · ${design.settings.beadTypeLabel} · ${design.metadata.author || 'Artisan'}`,
      padding,
      padding - 8
    );

    // Grid frame
    const gridW = columns * cellSpacing;
    const gridH = rows * cellSpacing;
    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(padding, padding, gridW, gridH);

    // Optional Grid lines
    if (includeGridInPng) {
      ctx.strokeStyle = '#ded5c9';
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      for (let c = 0; c <= columns; c++) {
        const x = padding + c * cellSpacing;
        ctx.moveTo(x, padding);
        ctx.lineTo(x, padding + gridH);
      }
      for (let r = 0; r <= rows; r++) {
        const y = padding + r * cellSpacing;
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + gridW, y);
      }
      ctx.stroke();
    }

    // Beads
    const radius = dotSize / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const idx = r * columns + c;
        const color = design.cells[idx];
        const cx = padding + c * cellSpacing + cellSpacing / 2;
        const cy = padding + r * cellSpacing + cellSpacing / 2;

        if (color) {
          const radiusX = radius * 0.94;
          const radiusY = radius * 1.08;

          ctx.beginPath();
          ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();

          ctx.strokeStyle = '#171412';
          ctx.lineWidth = 0.5;
          ctx.stroke();

          // Highlight
          if (beadFinish === 'glossy') {
            const shine = ctx.createRadialGradient(
              cx - radiusX * 0.32,
              cy - radiusY * 0.32,
              radiusX * 0.08,
              cx,
              cy,
              radiusY
            );
            shine.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
            shine.addColorStop(0.45, 'rgba(255, 255, 255, 0.05)');
            shine.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
            ctx.beginPath();
            ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2);
            ctx.fillStyle = shine;
            ctx.fill();
          }

          // Thread hole
          ctx.beginPath();
          ctx.ellipse(
            cx,
            cy,
            Math.max(0.75, radiusX * 0.2),
            Math.max(0.9, radiusY * 0.24),
            0,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = 'rgba(23, 20, 18, 0.5)';
          ctx.fill();
        } else if (design.settings.showEmptyDots) {
          ctx.beginPath();
          ctx.arc(cx, cy, 1.25, 0, Math.PI * 2);
          ctx.fillStyle = '#c8bfb2';
          ctx.fill();
        }
      }
    }

    // Convert to PNG download
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${safeFilename}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f1b18] border border-[#2e2722] rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2e2722] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e87524]/10 text-[#e87524] flex items-center justify-center border border-[#e87524]/20">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f8f3eb] font-cinzel">
                Export Artwork & Data
              </h2>
              <p className="text-xs text-[#a3978a]">
                Standard formats for digital previews, vector fabrication, and archiving.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#a3978a] hover:text-[#f8f3eb] transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Options */}
        <div className="p-6 space-y-4 text-sm">
          {/* Option 0: Printable Pattern & PDF (with Super-Condensed mode) */}
          {onOpenPrint && (
            <div className="p-4 bg-[#171412] border border-[#e87524]/40 hover:border-[#e87524] rounded-xl flex items-start justify-between gap-4 transition-all shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#e87524]/20 text-[#e87524] flex items-center justify-center shrink-0 mt-0.5">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-xs text-[#f8f3eb]">Printable Artisan Pattern / PDF</h3>
                    <span className="text-[10px] font-semibold bg-[#8c3b20] text-white px-1.5 py-0.2 rounded">
                      ⚡ Super-Condensed
                    </span>
                  </div>
                  <p className="text-xs text-[#a3978a] mt-0.5">
                    Paper-saving row-by-row word chart with color bead dot + number count, 2-column sheet layout, and inventory breakdown.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenPrint();
                }}
                className="px-3 py-1.5 bg-[#e87524] hover:bg-[#d46517] text-white text-xs font-semibold rounded-md shrink-0 transition-colors shadow-sm"
              >
                Open PDF Sheet
              </button>
            </div>
          )}

          {/* Option 1: High-Res PNG */}
          <div className="p-4 bg-[#171412] border border-[#2e2722] hover:border-[#483d35] rounded-xl flex items-start justify-between gap-4 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#e87524]/15 text-[#e87524] flex items-center justify-center shrink-0 mt-0.5">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-[#f8f3eb]">High-Resolution PNG Image</h3>
                <p className="text-xs text-[#a3978a] mt-0.5">
                  High-DPI raster preview with tactile bead highlights on linen canvas.
                </p>
                <label className="flex items-center gap-2 mt-2 cursor-pointer text-[11px] text-[#ded5c9]">
                  <input
                    type="checkbox"
                    checked={includeGridInPng}
                    onChange={(e) => setIncludeGridInPng(e.target.checked)}
                    className="rounded border-[#2e2722] text-[#e87524] accent-[#e87524]"
                  />
                  <span>Include grid lines</span>
                </label>
              </div>
            </div>
            <button
              onClick={handleExportPng}
              className="px-3 py-1.5 bg-[#e87524] hover:bg-[#d46517] text-white text-xs font-semibold rounded-md shrink-0 transition-colors"
            >
              Export PNG
            </button>
          </div>

          {/* Option 2: Vector SVG */}
          <div className="p-4 bg-[#171412] border border-[#2e2722] hover:border-[#483d35] rounded-xl flex items-start justify-between gap-4 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#2894a2]/15 text-[#2894a2] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-[#f8f3eb]">Scalable Vector Graphics (SVG)</h3>
                <p className="text-xs text-[#a3978a] mt-0.5">
                  Resolution-independent vector format for laser cutters, publication, and illustrator editing.
                </p>
              </div>
            </div>
            <button
              onClick={handleExportSvg}
              className="px-3 py-1.5 bg-[#1f1b18] hover:bg-[#2e2722] border border-[#2e2722] text-[#f8f3eb] text-xs font-semibold rounded-md shrink-0 transition-colors"
            >
              Export SVG
            </button>
          </div>

          {/* Option 3: Design JSON */}
          <div className="p-4 bg-[#171412] border border-[#2e2722] hover:border-[#483d35] rounded-xl flex items-start justify-between gap-4 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-[#f8f3eb]">Beadwork Specification JSON</h3>
                <p className="text-xs text-[#a3978a] mt-0.5">
                  Complete design schema with row-major color indices, metadata, and physical calibrations.
                </p>
              </div>
            </div>
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 bg-[#1f1b18] hover:bg-[#2e2722] border border-[#2e2722] text-[#f8f3eb] text-xs font-semibold rounded-md shrink-0 transition-colors"
            >
              Export JSON
            </button>
          </div>

          {/* Option 4: CSV Matrix */}
          <div className="p-4 bg-[#171412] border border-[#2e2722] hover:border-[#483d35] rounded-xl flex items-start justify-between gap-4 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-[#f8f3eb]">Spreadsheet Colour Grid (CSV)</h3>
                <p className="text-xs text-[#a3978a] mt-0.5">
                  Tabular bead matrix compatible with Excel, Google Sheets, or numerical loom plotters.
                </p>
              </div>
            </div>
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-[#1f1b18] hover:bg-[#2e2722] border border-[#2e2722] text-[#f8f3eb] text-xs font-semibold rounded-md shrink-0 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
