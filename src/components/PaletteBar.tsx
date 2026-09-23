import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Palette, Check, Sparkles } from 'lucide-react';
import { BeadColor } from '../types/bead';
import { PALETTE_PRESETS, getContrastColor, getColorName } from '../utils/colorUtils';

interface PaletteBarProps {
  palette: BeadColor[];
  activeColor: string;
  onSelectColor: (hex: string) => void;
  onAddColor: (hex: string) => void;
  onRemoveColor: (hex: string) => void;
  onApplyPreset: (presetKey: string) => void;
  colorCounts: Map<string, number>;
}

// Recommended quick artisan seed bead swatches
const POPULAR_BEAD_SWATCHES = [
  { hex: '#ea6a1a', name: 'Amber Orange' },
  { hex: '#f28c28', name: 'Tangerine Opal' },
  { hex: '#d9b44a', name: 'Metallic Gold' },
  { hex: '#e0a91b', name: 'Marigold Yellow' },
  { hex: '#2a8742', name: 'Emerald Iris' },
  { hex: '#226b3a', name: 'Pine Forest' },
  { hex: '#1f5aa6', name: 'Cobalt Lapis' },
  { hex: '#2894a2', name: 'Turquoise Blue' },
  { hex: '#d9342b', name: 'Scarlet Red' },
  { hex: '#c84b31', name: 'Terracotta' },
  { hex: '#8c3b20', name: 'Burnt Copper' },
  { hex: '#111111', name: 'Jet Black' },
  { hex: '#555555', name: 'Slate Gray' },
  { hex: '#999999', name: 'Silver Gray' },
  { hex: '#f4eee4', name: 'Alabaster White' },
  { hex: '#ffffff', name: 'Pure White' },
];

export const PaletteBar: React.FC<PaletteBarProps> = ({
  palette,
  activeColor,
  onSelectColor,
  onAddColor,
  onRemoveColor,
  onApplyPreset,
  colorCounts,
}) => {
  const [newColorHex, setNewColorHex] = useState('#e87524');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const presetRef = useRef<HTMLDivElement>(null);
  const hexInputRef = useRef<HTMLInputElement>(null);

  const activeColorObj = palette.find(
    (p) => p.hex.toLowerCase() === activeColor.toLowerCase()
  );

  // Close preset dropdown if clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (presetRef.current && !presetRef.current.contains(e.target as Node)) {
        setShowPresetDropdown(false);
      }
    };
    if (showPresetDropdown) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showPresetDropdown]);

  // Focus input when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => hexInputRef.current?.select(), 100);
    }
  }, [isModalOpen]);

  const handleAddSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (palette.length >= 32) return;

    let cleanHex = newColorHex.trim();
    if (!cleanHex.startsWith('#')) {
      cleanHex = '#' + cleanHex;
    }

    // Validate 3 or 6 hex digits
    const isValidHex = /^#([0-9a-fA-F]{3}){1,2}$/.test(cleanHex);
    if (!isValidHex) {
      return;
    }

    // Expand 3-digit hex to 6-digit hex
    if (cleanHex.length === 4) {
      cleanHex =
        '#' +
        cleanHex[1] + cleanHex[1] +
        cleanHex[2] + cleanHex[2] +
        cleanHex[3] + cleanHex[3];
    }

    onAddColor(cleanHex);
    setIsModalOpen(false);
  };

  const handleSelectQuickSwatch = (hex: string) => {
    setNewColorHex(hex);
    onAddColor(hex);
    setIsModalOpen(false);
  };

  return (
    <>
      <footer className="h-16 bg-[#1f1b18] border-t border-[#2e2722] px-4 flex items-center justify-between gap-4 z-20 shrink-0 select-none relative">
        {/* Left: Active Color Information */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <div
              className="w-9 h-9 rounded-full shadow-md border-2 border-white/20 flex items-center justify-center transition-transform"
              style={{ backgroundColor: activeColor }}
            >
              {/* Bead shine highlight */}
              <div className="w-2.5 h-2.5 rounded-full bg-white/40 absolute top-1.5 left-1.5 blur-[0.5px]" />
              <div className="w-2 h-2 rounded-full bg-black/40" />
            </div>
          </div>

          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-semibold text-[#f8f3eb] leading-tight truncate max-w-[140px]">
              {activeColorObj?.name || getColorName(activeColor)}
            </span>
            <span className="font-mono-numbers text-[10px] text-[#a3978a] tracking-wider uppercase">
              {activeColor} {activeColorObj?.symbol ? `· ${activeColorObj.symbol}` : ''}
            </span>
          </div>
        </div>

        {/* Center: Scrollable Bead Color Swatches */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto py-2 px-1 scrollbar-thin">
          {palette.map((bead) => {
            const isSelected = activeColor.toLowerCase() === bead.hex.toLowerCase();
            const count = colorCounts.get(bead.hex.toLowerCase()) || 0;
            const contrast = getContrastColor(bead.hex);

            return (
              <div key={bead.hex} className="relative group shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectColor(bead.hex)}
                  className={`w-9 h-9 rounded-full relative flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-[#e87524] ring-offset-2 ring-offset-[#1f1b18] scale-105 shadow-md'
                      : 'hover:scale-105 opacity-90 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: bead.hex }}
                  title={`${bead.name} (${bead.hex}) — ${count} placed`}
                >
                  {/* Bead highlight and hole */}
                  <span className="w-2 h-2 rounded-full bg-white/40 absolute top-1.5 left-1.5 pointer-events-none" />
                  <span className="w-1.5 h-1.5 rounded-full bg-black/30 pointer-events-none" />

                  {isSelected && (
                    <Check
                      className="w-3.5 h-3.5 absolute pointer-events-none stroke-[2.5]"
                      style={{ color: contrast }}
                    />
                  )}
                </button>

                {/* Placed count badge */}
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 bg-[#111111] text-[#ded5c9] text-[9px] font-mono-numbers font-medium rounded-full flex items-center justify-center border border-[#2e2722] pointer-events-none">
                    {count > 999 ? '999+' : count}
                  </span>
                )}

                {/* Remove button if more than 2 colors */}
                {palette.length > 2 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveColor(bead.hex);
                    }}
                    className="hidden group-hover:flex absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-red-950 text-red-300 rounded-full items-center justify-center border border-red-800 text-[8px] hover:bg-red-800 cursor-pointer shadow"
                    title="Remove from palette"
                  >
                    <X className="w-2 h-2" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Dedicated Add Color Swatch Button */}
          {palette.length < 32 && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-9 h-9 rounded-full border border-dashed border-[#63554b] hover:border-[#e87524] text-[#ded5c9] hover:text-[#f8f3eb] hover:bg-[#2e2722] flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
              title="Add new bead color swatch"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right: Palette Presets & Max Limit Info */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden xl:inline text-[11px] font-mono-numbers text-[#71675f]">
            {palette.length}/32 Colors
          </span>

          <div className="relative" ref={presetRef}>
            <button
              type="button"
              onClick={() => setShowPresetDropdown((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#ded5c9] hover:text-[#f8f3eb] hover:bg-[#2e2722] border border-[#2e2722] rounded-md transition-colors cursor-pointer"
              title="Choose a curated color palette"
            >
              <Palette className="w-3.5 h-3.5 text-[#e87524]" />
              <span className="hidden sm:inline">Presets</span>
            </button>

            {showPresetDropdown && (
              <div className="absolute right-0 bottom-full mb-2 w-60 bg-[#1f1b18] border border-[#3d332d] rounded-lg shadow-xl py-1 z-50">
                <div className="px-3 py-1.5 text-[11px] font-medium text-[#a3978a] border-b border-[#2e2722]">
                  Curated Beadwork Harmonies
                </div>
                {Object.entries(PALETTE_PRESETS).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onApplyPreset(key);
                      setShowPresetDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-[#ded5c9] hover:bg-[#2e2722] hover:text-[#f8f3eb] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <span className="truncate pr-2">{item.label}</span>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {item.colors.slice(0, 5).map((c, i) => (
                        <span
                          key={i}
                          className="w-2.5 h-2.5 rounded-full border border-black/40"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Robust Centered Modal for Adding Bead Colors */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-[#1c1815] border border-[#3d332d] rounded-xl shadow-2xl overflow-hidden p-5 flex flex-col gap-4 ring-1 ring-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2e2722] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#e87524]/15 text-[#e87524] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-[#f8f3eb]">
                  Add Bead Color Swatch
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#a3978a] hover:text-[#f8f3eb] transition-colors p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Color Picker & Hex Input */}
            <form onSubmit={handleAddSubmit} className="flex flex-col gap-3.5">
              <div className="flex items-center gap-3 bg-[#141210] p-3 rounded-lg border border-[#2e2722]">
                <label className="relative cursor-pointer shrink-0">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border border-[#483d35] bg-transparent p-0 overflow-hidden"
                  />
                </label>
                <div className="flex-1">
                  <label className="block text-[10px] text-[#a3978a] font-medium mb-1">
                    HEX VALUE / COLOR CODE
                  </label>
                  <input
                    ref={hexInputRef}
                    type="text"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    placeholder="#EA6A1A"
                    className="w-full px-2.5 py-1.5 bg-[#1b1714] border border-[#3d332d] focus:border-[#e87524] focus:outline-none rounded text-xs font-mono-numbers text-[#f8f3eb] uppercase tracking-wider"
                    maxLength={7}
                  />
                </div>
                <div
                  className="w-8 h-8 rounded-full border border-white/20 shrink-0 shadow-inner flex items-center justify-center"
                  style={{ backgroundColor: newColorHex }}
                  title="Live preview"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
                </div>
              </div>

              {/* Quick Artisan Beadwork Palette */}
              <div>
                <span className="text-[11px] text-[#a3978a] font-medium block mb-2">
                  Artisan Seed Bead Suggestions:
                </span>
                <div className="grid grid-cols-8 gap-2 bg-[#141210] p-3 rounded-lg border border-[#2e2722]">
                  {POPULAR_BEAD_SWATCHES.map((swatch) => (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => handleSelectQuickSwatch(swatch.hex)}
                      className="w-7 h-7 rounded-full border border-black/40 hover:scale-115 active:scale-95 transition-transform cursor-pointer relative shadow-sm flex items-center justify-center"
                      style={{ backgroundColor: swatch.hex }}
                      title={`${swatch.name} (${swatch.hex})`}
                    >
                      <span className="w-1 h-1 rounded-full bg-black/30 pointer-events-none" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-xs font-medium text-[#a3978a] hover:text-[#f8f3eb] hover:bg-[#2e2722] rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-[#e87524] hover:bg-[#d46517] active:scale-[0.98] rounded-lg transition-all cursor-pointer shadow-md"
                >
                  Add Swatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
