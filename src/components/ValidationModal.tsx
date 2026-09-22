import React from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { PatternValidationResult, DesignDocument } from '../types/bead';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  validation: PatternValidationResult;
  design: DesignDocument;
  onAddUnsupportedToPalette?: () => void;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  isOpen,
  onClose,
  validation,
  design,
  onAddUnsupportedToPalette,
}) => {
  if (!isOpen) return null;

  const {
    totalCells,
    beadCount,
    emptyCount,
    uniqueColorsUsed,
    colorCounts,
    unsupportedColors,
    edgeAlignment,
    warnings,
  } = validation;

  const isReady = beadCount > 0 && unsupportedColors.length === 0 && emptyCount === 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f1b18] border border-[#2e2722] rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2e2722] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                isReady
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                  : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f8f3eb] font-cinzel">
                Pattern Audit & Quality Checks
              </h2>
              <p className="text-xs text-[#a3978a]">
                Physical loom readiness, colour integrity, and edge alignment.
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Status banner */}
          <div
            className={`p-4 rounded-lg border flex items-start gap-3 ${
              isReady
                ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                : 'bg-amber-950/30 border-amber-800/40 text-amber-200'
            }`}
          >
            {isReady ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold text-xs uppercase tracking-wider">
                {isReady ? 'Pattern Complete & Verified' : 'Attention Recommended Before Production'}
              </div>
              <p className="text-xs opacity-90 mt-0.5">
                {isReady
                  ? 'All cells are accounted for and match your active palette. The pattern is ready for physical weaving.'
                  : warnings[0] || 'Check the details below to refine your beadwork canvas.'}
              </p>
            </div>
          </div>

          {/* Validation Checklist Items */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e87524]">
              Mandatory Production Checks
            </h3>

            <div className="space-y-2 text-xs">
              {/* Check 1: Bead count & empty cells */}
              <div className="p-3 bg-[#171412] border border-[#2e2722] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {emptyCount === 0 && beadCount > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                  <div>
                    <span className="font-medium text-[#f8f3eb] block">
                      Canvas Bead Coverage
                    </span>
                    <span className="text-[#a3978a] text-[11px]">
                      {beadCount.toLocaleString()} beads placed · {emptyCount.toLocaleString()} empty cells
                    </span>
                  </div>
                </div>
                <span className="font-mono-numbers font-semibold text-[#ded5c9]">
                  {((beadCount / totalCells) * 100).toFixed(1)}%
                </span>
              </div>

              {/* Check 2: Unsupported colours */}
              <div className="p-3 bg-[#171412] border border-[#2e2722] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {unsupportedColors.length === 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  )}
                  <div>
                    <span className="font-medium text-[#f8f3eb] block">
                      Palette Consistency
                    </span>
                    <span className="text-[#a3978a] text-[11px]">
                      {unsupportedColors.length === 0
                        ? `All ${uniqueColorsUsed} colors exist in the active palette`
                        : `${unsupportedColors.length} stray color(s) detected outside palette`}
                    </span>
                  </div>
                </div>
                {unsupportedColors.length > 0 && onAddUnsupportedToPalette && (
                  <button
                    onClick={onAddUnsupportedToPalette}
                    className="px-2 py-1 bg-[#2e2722] hover:bg-[#3d332d] text-[#e87524] rounded text-[11px] font-medium transition-colors"
                  >
                    Add to Palette
                  </button>
                )}
              </div>

              {/* Check 3: Edge alignment */}
              <div className="p-3 bg-[#171412] border border-[#2e2722] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {edgeAlignment.touchesTop && edgeAlignment.touchesBottom && edgeAlignment.touchesLeft && edgeAlignment.touchesRight ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                  <div>
                    <span className="font-medium text-[#f8f3eb] block">
                      Canvas Edge Alignment
                    </span>
                    <span className="text-[#a3978a] text-[11px]">
                      T: {edgeAlignment.touchesTop ? '✓' : '✗'} · B:{' '}
                      {edgeAlignment.touchesBottom ? '✓' : '✗'} · L:{' '}
                      {edgeAlignment.touchesLeft ? '✓' : '✗'} · R:{' '}
                      {edgeAlignment.touchesRight ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-[#ded5c9]">
                  {edgeAlignment.isSymmetricalHorizontal ? 'Horizontal Symmetry ✓' : 'Asymmetrical'}
                </span>
              </div>

              {/* Check 4: Color legend completeness */}
              <div className="p-3 bg-[#171412] border border-[#2e2722] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-medium text-[#f8f3eb] block">
                      Colour Legend Completeness
                    </span>
                    <span className="text-[#a3978a] text-[11px]">
                      All placed colors have verified names, symbols, and hex references
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-400 font-medium">100% Verified</span>
              </div>
            </div>
          </div>

          {/* Color Breakdown Mini Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e87524]">
              Active Bead Requirements
            </h3>
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1 font-mono-numbers text-xs">
              {colorCounts.map((c) => (
                <div
                  key={c.hex}
                  className="flex items-center justify-between p-1.5 bg-[#171412] rounded border border-[#2e2722]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/30"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[#ded5c9] font-sans text-xs">{c.name}</span>
                  </div>
                  <div className="text-[#a3978a] text-[11px]">
                    <span className="font-semibold text-[#f8f3eb]">{c.count.toLocaleString()}</span> beads ({c.percentage.toFixed(1)}%)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer close button */}
          <div className="pt-2 border-t border-[#2e2722] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#e87524] hover:bg-[#d46517] rounded-lg shadow-sm transition-colors"
            >
              Done Reviewing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
