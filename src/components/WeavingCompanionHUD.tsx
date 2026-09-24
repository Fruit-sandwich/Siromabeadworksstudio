import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Crosshair,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ListFilter,
  CheckCircle2,
} from 'lucide-react';
import { DesignDocument } from '../types/bead';
import { generateArtisanWordChart, RowInstruction } from '../utils/exportUtils';
import { loomSounds } from '../utils/soundEffects';

interface WeavingCompanionHUDProps {
  design: DesignDocument;
  activeRow: number; // 1-indexed (1 to rows)
  completedRows: number[];
  onSelectRow: (row: number) => void;
  onToggleCompletedRow: (row: number) => void;
  onResetProgress: () => void;
  onExitWeavingMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  autoCenter: boolean;
  onToggleAutoCenter: () => void;
}

export const WeavingCompanionHUD: React.FC<WeavingCompanionHUDProps> = ({
  design,
  activeRow,
  completedRows,
  onSelectRow,
  onToggleCompletedRow,
  onResetProgress,
  onExitWeavingMode,
  soundEnabled,
  onToggleSound,
  autoCenter,
  onToggleAutoCenter,
}) => {
  const { rows, columns } = design.settings;
  const wordChart = useMemo(() => generateArtisanWordChart(design), [design]);

  // Track which segment groups in the active row have been physically picked up on needle
  // Key is activeRow number, value is array of checked segment indices
  const [checkedSegmentsMap, setCheckedSegmentsMap] = useState<Record<number, number[]>>({});

  // Current active row instruction
  const currentInstruction: RowInstruction | undefined = useMemo(() => {
    return wordChart.find((w) => w.rowNumber === activeRow) || wordChart[0];
  }, [wordChart, activeRow]);

  const checkedIndices = useMemo(() => {
    return checkedSegmentsMap[activeRow] || [];
  }, [checkedSegmentsMap, activeRow]);

  // Overall statistics
  const totalRows = rows;
  const totalBeads = rows * columns;
  const completedRowCount = completedRows.length;
  const progressPercent = Math.round((completedRowCount / totalRows) * 100);
  const strungBeads = completedRowCount * columns;

  const handleToggleSegment = (index: number) => {
    loomSounds.playBeadClick();
    setCheckedSegmentsMap((prev) => {
      const current = prev[activeRow] || [];
      const updated = current.includes(index)
        ? current.filter((i) => i !== index)
        : [...current, index];
      return { ...prev, [activeRow]: updated };
    });
  };

  const handleNextRow = useCallback(() => {
    loomSounds.playRowComplete();
    // Mark current row completed if not already
    if (!completedRows.includes(activeRow)) {
      onToggleCompletedRow(activeRow);
    }
    if (activeRow < totalRows) {
      onSelectRow(activeRow + 1);
    }
  }, [activeRow, totalRows, completedRows, onToggleCompletedRow, onSelectRow]);

  const handlePreviousRow = useCallback(() => {
    loomSounds.playBeadClick();
    if (activeRow > 1) {
      onSelectRow(activeRow - 1);
    }
  }, [activeRow, onSelectRow]);

  // Keyboard Navigation for hands-on-the-loom efficiency
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        // If there are unchecked segments in current row, check next segment
        if (currentInstruction) {
          const firstUnchecked = currentInstruction.items.findIndex((_, idx) => !checkedIndices.includes(idx));
          if (firstUnchecked !== -1) {
            handleToggleSegment(firstUnchecked);
            return;
          }
        }
        // All segments checked (or none), advance row
        handleNextRow();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextRow();
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        handlePreviousRow();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onExitWeavingMode();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        onToggleSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentInstruction, checkedIndices, handleNextRow, handlePreviousRow, onExitWeavingMode, onToggleSound]);

  if (!currentInstruction) return null;

  const isCurrentRowCompleted = completedRows.includes(activeRow);
  const rowBeadCount = currentInstruction.items.reduce((sum, item) => sum + item.count, 0);

  // Find the next active segment to string
  const nextSegmentIndex = currentInstruction.items.findIndex((_, idx) => !checkedIndices.includes(idx));
  const nextSegment = nextSegmentIndex !== -1 ? currentInstruction.items[nextSegmentIndex] : null;

  return (
    <div className="flex flex-col bg-[#1c1917]/95 border-t border-[#38302a] shadow-2xl backdrop-blur-md z-40 select-none">
      {/* Top Strip: Status, Navigation & Utilities */}
      <div className="px-4 py-1.5 bg-[#26211d] border-b border-[#38302a] flex items-center justify-between flex-wrap gap-2 text-xs">
        {/* Left: Weave Mode Indicator & Row Title */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#e87524]/20 border border-[#e87524]/40 text-[#f8f3eb]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e87524] animate-pulse" />
            <span className="font-semibold tracking-wide uppercase text-[10px]">Loom HUD</span>
          </div>

          <span className="text-[#695d53]">|</span>

          <div className="flex items-center gap-1.5">
            <span className="font-mono-numbers font-bold text-sm text-[#f8f3eb]">
              Row {activeRow}
            </span>
            <span className="text-[#a3978a] text-xs">/ {totalRows}</span>

            {/* Direction Badge */}
            <span
              className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                currentInstruction.direction === 'L → R'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
              }`}
            >
              {currentInstruction.direction === 'L → R' ? (
                <>
                  <ArrowRight className="w-2.5 h-2.5 text-amber-400" />
                  <span>L ➔ R</span>
                </>
              ) : (
                <>
                  <ArrowLeft className="w-2.5 h-2.5 text-teal-400" />
                  <span>R ➔ L</span>
                </>
              )}
            </span>

            {isCurrentRowCompleted && (
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-semibold flex items-center gap-0.5">
                <Check className="w-2.5 h-2.5" /> Woven
              </span>
            )}
          </div>
        </div>

        {/* Center: Active Pick readout & Progress */}
        <div className="flex items-center gap-3">
          {nextSegment ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#171412] border border-[#38302a] text-[11px]">
              <span className="text-[#8f8174]">Pick:</span>
              <div
                className="w-2.5 h-2.5 rounded-full border border-black/40"
                style={{ backgroundColor: nextSegment.hex }}
              />
              <span className="font-bold text-[#f8f3eb] font-mono-numbers">{nextSegment.count}×</span>
              <span className="text-[#ded5c9] max-w-[140px] truncate">{nextSegment.name}</span>
            </div>
          ) : (
            <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
              <Check className="w-3 h-3" /> All {rowBeadCount} beads on needle!
            </span>
          )}

          <div className="hidden lg:flex items-center gap-2">
            <div className="w-24 h-1.5 bg-[#171412] rounded-full overflow-hidden border border-[#38302a]">
              <div
                className="h-full bg-[#e87524] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono-numbers text-[10px] text-[#a3978a]">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Right: Quick Jump & Utility Toggles */}
        <div className="flex items-center gap-1.5">
          {/* Quick Row Jump Select */}
          <select
            value={activeRow}
            onChange={(e) => onSelectRow(Number(e.target.value))}
            aria-label="Jump to row number"
            className="px-1.5 py-0.5 bg-[#171412] border border-[#38302a] rounded text-[11px] text-[#f8f3eb] font-mono-numbers focus:border-[#e87524] outline-none"
          >
            {Array.from({ length: totalRows }, (_, i) => i + 1).map((r) => (
              <option key={r} value={r}>
                R{r} {completedRows.includes(r) ? '✓' : ''}
              </option>
            ))}
          </select>

          {/* Auto-Center Toggle */}
          <button
            type="button"
            onClick={onToggleAutoCenter}
            className={`p-1 rounded transition-colors ${
              autoCenter
                ? 'text-[#e87524] bg-[#e87524]/15 border border-[#e87524]/30'
                : 'text-[#8f8174] hover:text-[#f8f3eb] hover:bg-[#38302a]'
            }`}
            title={autoCenter ? 'Auto-pan row to center is ON' : 'Auto-pan row to center is OFF'}
            aria-label={autoCenter ? 'Disable canvas auto-center' : 'Enable canvas auto-center'}
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className={`p-1 rounded transition-colors ${
              soundEnabled
                ? 'text-[#ded5c9] hover:text-[#f8f3eb] hover:bg-[#38302a]'
                : 'text-[#8f8174] hover:text-[#ded5c9] hover:bg-[#38302a]'
            }`}
            title={soundEnabled ? 'Bead click sound is ON (Press M to mute)' : 'Muted (Press M to unmute)'}
            aria-label={soundEnabled ? 'Mute tactile sound' : 'Unmute tactile sound'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#e87524]" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Reset Progress */}
          <button
            type="button"
            onClick={onResetProgress}
            className="p-1 text-[#8f8174] hover:text-rose-400 hover:bg-[#38302a] rounded transition-colors"
            title="Reset woven rows tracking"
            aria-label="Reset woven rows tracking"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Close Weaving Mode */}
          <button
            type="button"
            onClick={onExitWeavingMode}
            className="flex items-center gap-1 px-1.5 py-0.5 text-xs text-[#a3978a] hover:text-[#f8f3eb] hover:bg-[#38302a] rounded transition-colors"
            title="Exit Weaving Mode (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Stringing Sequence Tray (Ultra-Minimal, Non-Scrolling Wrapping Layout) */}
      <div className="px-3 py-2 flex items-center justify-between gap-3">
        {/* Previous Row Button */}
        <button
          type="button"
          onClick={handlePreviousRow}
          disabled={activeRow <= 1}
          className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-lg border transition-all ${
            activeRow <= 1
              ? 'opacity-30 border-[#38302a] bg-[#26211d] text-[#71675f] cursor-not-allowed'
              : 'border-[#38302a] bg-[#26211d] hover:bg-[#332b26] text-[#ded5c9] hover:text-[#f8f3eb] hover:border-[#e87524]/50 cursor-pointer active:scale-95'
          }`}
          title="Previous row (← or Backspace)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* The Needle Loading Bead Sequence - Compact Wrapping Tokens (Zero Horizontal Scroll) */}
        <div className="flex-1 flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
          {currentInstruction.items.map((item, idx) => {
            const isChecked = checkedIndices.includes(idx);
            const isNextToPick = !isChecked && (idx === 0 || checkedIndices.includes(idx - 1));

            return (
              <button
                key={`${activeRow}-${idx}`}
                type="button"
                onClick={() => handleToggleSegment(idx)}
                className={`group relative flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all cursor-pointer text-left ${
                  isChecked
                    ? 'bg-emerald-950/20 border-emerald-500/30 opacity-60'
                    : isNextToPick
                    ? 'bg-[#2a221b] border-[#e87524] ring-2 ring-[#e87524]/40 shadow-md scale-[1.03]'
                    : 'bg-[#221d19] border-[#38302a] hover:border-[#52443a]'
                }`}
                title={`${item.count}× ${item.name} (${item.hex}) - Tap to toggle`}
              >
                {/* Bead Visual Preview */}
                <div
                  className="w-3.5 h-3.5 rounded-full border border-black/40 shrink-0 shadow-inner relative overflow-hidden"
                  style={{ backgroundColor: item.hex }}
                >
                  {/* Subtle glass specular highlight */}
                  <div className="absolute top-0.5 left-0.5 w-1 h-0.5 rounded-full bg-white/40 blur-[0.2px]" />
                </div>

                {/* Count Badge */}
                <span
                  className={`font-mono-numbers font-bold text-xs ${
                    isChecked
                      ? 'text-emerald-400 line-through'
                      : isNextToPick
                      ? 'text-[#f8f3eb]'
                      : 'text-[#ded5c9]'
                  }`}
                >
                  {item.count}
                </span>

                {/* Checked indicator */}
                {isChecked && <Check className="w-3 h-3 text-emerald-400" />}

                {/* Subtle separator dot if not last item */}
                {idx < currentInstruction.items.length - 1 && (
                  <span className="text-[#4a3f37] text-[10px] pl-0.5">·</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Next Row Action Button (Compact & Quick) */}
        <button
          type="button"
          onClick={handleNextRow}
          className="shrink-0 flex items-center gap-1 px-3.5 h-9 rounded-lg bg-[#e87524] hover:bg-[#f28333] text-[#171412] font-bold shadow-md transition-all cursor-pointer active:scale-95 border border-[#f59e0b]/40 group"
          title="Complete Row and advance (Spacebar or Enter)"
        >
          <span className="text-xs font-bold uppercase tracking-tight text-white drop-shadow-sm whitespace-nowrap">
            {activeRow === totalRows ? 'Finish' : 'Next'}
          </span>
          <ChevronRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Bottom Hint */}
      <div className="px-4 py-1 bg-[#171412] border-t border-[#26211d] flex items-center justify-between text-[10px] text-[#786b60]">
        <span>
          <strong className="text-[#a3978a]">{rowBeadCount} beads</strong> on Row {activeRow}. Press{' '}
          <kbd className="px-1 py-0.2 bg-[#221d19] border border-[#38302a] rounded text-[9px] text-[#ded5c9] font-mono">
            Space
          </kbd>{' '}
          to pick next group or advance row.
        </span>
        <div className="hidden sm:flex items-center gap-2">
          <span><kbd className="px-1 py-0.2 bg-[#221d19] border border-[#38302a] rounded text-[9px] text-[#ded5c9] font-mono">← / →</kbd> Prev/Next</span>
          <span><kbd className="px-1 py-0.2 bg-[#221d19] border border-[#38302a] rounded text-[9px] text-[#ded5c9] font-mono">Esc</kbd> Exit</span>
        </div>
      </div>
    </div>
  );
};
