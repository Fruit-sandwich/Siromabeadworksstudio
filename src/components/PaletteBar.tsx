import React, { useState } from 'react';
import { Plus, X, Palette, Check } from 'lucide-react';
import { BeadColor } from '../types/bead';
import { PALETTE_PRESETS, buildPaletteColors, getContrastColor } from '../utils/colorUtils';

interface PaletteBarProps {
  palette: BeadColor[];
  activeColor: string;
  onSelectColor: (hex: string) => void;
  onAddColor: (hex: string) => void;
  onRemoveColor: (hex: string) => void;
  onApplyPreset: (presetKey: string) => void;
  colorCounts: Map<string, number>;
}

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
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  const activeColorObj = palette.find(
    (p) => p.hex.toLowerCase() === activeColor.toLowerCase()
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (palette.length >= 32) return;
    onAddColor(newColorHex);
    setShowAddPicker(false);
  };

  return (
    <footer className="h-16 bg-[#1f1b18] border-t border-[#2e2722] px-4 flex items-center justify-between gap-4 z-20 shrink-0 select-none">
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
            {activeColorObj?.name || 'Selected Bead'}
          </span>
          <span className="font-mono-numbers text-[10px] text-[#a3978a] tracking-wider uppercase">
            {activeColor} {activeColorObj?.symbol ? `· ${activeColorObj.symbol}` : ''}
          </span>
        </div>
      </div>

      {/* Center: Scrollable Bead Color Swatches */}
      <div className="flex-1 flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none">
        {palette.map((bead) => {
          const isSelected = activeColor.toLowerCase() === bead.hex.toLowerCase();
          const count = colorCounts.get(bead.hex.toLowerCase()) || 0;
          const contrast = getContrastColor(bead.hex);

          return (
            <div key={bead.hex} className="relative group shrink-0">
              <button
                onClick={() => onSelectColor(bead.hex)}
                className={`w-9 h-9 rounded-full relative flex items-center justify-center transition-all ${
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveColor(bead.hex);
                  }}
                  className="hidden group-hover:flex absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-red-950 text-red-300 rounded-full items-center justify-center border border-red-800 text-[8px] hover:bg-red-800"
                  title="Remove from palette"
                >
                  <X className="w-2 h-2" />
                </button>
              )}
            </div>
          );
        })}

        {/* Add Color Button */}
        {palette.length < 32 && (
          <div className="relative shrink-0">
            <button
              onClick={() => setShowAddPicker(!showAddPicker)}
              className="w-9 h-9 rounded-full border border-dashed border-[#574b43] text-[#ded5c9] hover:text-[#f8f3eb] hover:border-[#e87524] flex items-center justify-center transition-colors"
              title="Add new bead color"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Quick Add Popover */}
            {showAddPicker && (
              <form
                onSubmit={handleAddSubmit}
                className="absolute bottom-full mb-3 left-0 bg-[#171412] border border-[#2e2722] p-3 rounded-lg shadow-xl z-50 flex flex-col gap-2.5 w-52"
              >
                <div className="flex items-center justify-between text-xs font-medium text-[#f8f3eb]">
                  <span>New Bead Shade</span>
                  <button
                    type="button"
                    onClick={() => setShowAddPicker(false)}
                    className="text-[#a3978a] hover:text-[#f8f3eb]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-9 h-9 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="flex-1 px-2 py-1 bg-[#1f1b18] border border-[#2e2722] rounded text-xs font-mono-numbers text-[#f8f3eb] uppercase"
                    maxLength={7}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1 text-xs font-medium text-white bg-[#e87524] hover:bg-[#d46517] rounded transition-colors"
                >
                  Add to Palette
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Right: Palette Presets & Max Limit Info */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden xl:inline text-[11px] font-mono-numbers text-[#71675f]">
          {palette.length}/32 Colors
        </span>

        <div className="relative">
          <button
            onClick={() => setShowPresetDropdown(!showPresetDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#ded5c9] hover:text-[#f8f3eb] hover:bg-[#2e2722] border border-[#2e2722] rounded-md transition-colors"
            title="Choose a curated color palette"
          >
            <Palette className="w-3.5 h-3.5 text-[#e87524]" />
            <span className="hidden sm:inline">Presets</span>
          </button>

          {showPresetDropdown && (
            <div className="absolute right-0 bottom-full mb-2 w-56 bg-[#1f1b18] border border-[#2e2722] rounded-lg shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-medium text-[#a3978a] border-b border-[#2e2722]">
                Curated Beadwork Harmonies
              </div>
              {Object.entries(PALETTE_PRESETS).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => {
                    onApplyPreset(key);
                    setShowPresetDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-[#ded5c9] hover:bg-[#2e2722] hover:text-[#f8f3eb] flex items-center justify-between group transition-colors"
                >
                  <span>{item.label}</span>
                  <div className="flex items-center gap-0.5">
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
  );
};
