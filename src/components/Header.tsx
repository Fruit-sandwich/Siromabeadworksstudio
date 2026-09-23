import React from 'react';
import {
  FolderOpen,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Sliders,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { DesignDocument, PatternValidationResult } from '../types/bead';

interface HeaderProps {
  design: DesignDocument;
  validation: PatternValidationResult;
  onOpenLibrary: () => void;
  onOpenSettings: () => void;
  onOpenMetadata: () => void;
  onOpenValidation: () => void;
  onOpenPrint: () => void;
  onOpenExport: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  design,
  validation,
  onOpenLibrary,
  onOpenSettings,
  onOpenMetadata,
  onOpenValidation,
  onOpenPrint,
  onOpenExport,
  onOpenHelp,
}) => {
  const { columns, rows, millimetresPerBead, millimetresPerRow, physicalWidthCm, physicalHeightCm } = design.settings;
  const widthMm = (physicalWidthCm ? physicalWidthCm * 10 : columns * (millimetresPerBead || 1.5833)).toFixed(1);
  const heightMm = (physicalHeightCm ? physicalHeightCm * 10 : rows * (millimetresPerRow || 2.2653)).toFixed(1);
  const widthCm = (parseFloat(widthMm) / 10).toFixed(1);
  const heightCm = (parseFloat(heightMm) / 10).toFixed(1);

  return (
    <header className="h-14 bg-[#1f1b18] border-b border-[#2e2722] px-4 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Zone 1: Brand Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Authentic bead icon */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#f28c28] via-[#e87524] to-[#8c3b20] flex items-center justify-center shadow-inner border border-white/20">
            <div className="w-2 h-2 rounded-full bg-[#171412] shadow-inner" />
          </div>
          <span className="font-cinzel text-lg font-semibold tracking-wide text-[#f8f3eb]">
            Siroma Beadworks Studio
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-2 ml-4 text-xs text-[#a3978a]">
          <button
            onClick={onOpenMetadata}
            className="text-[#f8f3eb] hover:text-[#e87524] transition-colors font-medium max-w-[180px] truncate"
            title="Click to edit design details"
          >
            {design.metadata.title || 'Untitled Design'}
          </button>
          <span aria-hidden="true" className="text-[#574b43]">·</span>
          <button
            onClick={onOpenSettings}
            className="font-mono-numbers hover:text-[#e87524] transition-colors"
            title="Click to calibrate physical canvas size & aspect ratio"
          >
            {columns} × {rows} beads ({widthCm} × {heightCm} cm)
          </button>
          <span aria-hidden="true" className="text-[#574b43]">·</span>
          <span className="text-[#ded5c9]">{validation.beadCount.toLocaleString()} placed</span>
        </div>
      </div>

      {/* Zone 2: Curated Tools / Navigation Links */}
      <nav className="flex items-center gap-1.5 md:gap-2">
        <button
          onClick={onOpenLibrary}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#ded5c9] hover:text-[#f8f3eb] hover:bg-[#2e2722] rounded-md transition-colors"
          title="Open saved designs or starter presets"
        >
          <FolderOpen className="w-3.5 h-3.5 text-[#e87524]" />
          <span className="hidden sm:inline">Designs</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#ded5c9] hover:text-[#f8f3eb] hover:bg-[#2e2722] rounded-md transition-colors"
          title="Canvas grid, spacing, and bead dimensions"
        >
          <Sliders className="w-3.5 h-3.5 text-[#e87524]" />
          <span className="hidden sm:inline">Canvas</span>
        </button>

        <button
          onClick={onOpenMetadata}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#ded5c9] hover:text-[#f8f3eb] hover:bg-[#2e2722] rounded-md transition-colors"
          title="Edit title, maker notes, and materials"
        >
          <FileText className="w-3.5 h-3.5 text-[#e87524]" />
          <span className="hidden md:inline">Notes</span>
        </button>

        <button
          onClick={onOpenValidation}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
            validation.warnings.length === 0
              ? 'text-emerald-400 hover:bg-emerald-950/40'
              : 'text-amber-400 hover:bg-amber-950/40'
          }`}
          title="Validate pattern readiness for artisan production"
        >
          {validation.warnings.length === 0 ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5" />
          )}
          <span className="hidden md:inline">Audit</span>
        </button>

        <button
          onClick={onOpenHelp}
          className="p-1.5 text-[#a3978a] hover:text-[#f8f3eb] hover:bg-[#2e2722] rounded-md transition-colors"
          title="Instructions & Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenPrint}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#f8f3eb] bg-[#2e2722] hover:bg-[#3d332d] border border-[#483d35] rounded-md transition-colors whitespace-nowrap"
          title="Generate artisan row-by-row pattern sheet and printable guide"
        >
          <Printer className="w-3.5 h-3.5 text-[#e87524]" />
          <span>Print Pattern</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#e87524] hover:bg-[#d46517] rounded-md shadow-sm transition-colors whitespace-nowrap"
          title="Export as PNG, SVG, JSON, or CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
